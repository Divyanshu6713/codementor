/**
 * Answering Python questions (in lessons, practice and revision), and choosing what to ask next.
 *
 * Adaptive practice: the target difficulty starts from the learner's mastery of the topic and moves
 * up after two correct answers in a row and down after a wrong one; unseen questions come first.
 * Module-assessment questions are never used for practice, so mastery checks stay unseen.
 */
import { and, desc, eq, gte, inArray } from "drizzle-orm";
import {
  PY_QUESTIONS, getPyLesson, getPyModule, getPyQuestion, publicQuestion, type QuestionRef,
} from "@/content/python";
import { getDb, schema, type Tx } from "@/server/db/client";
import { AppError, NotFoundError } from "@/server/errors";
import { checkPyAchievements } from "./achievements";
import { answerSummary, correctAnswerOf, gradeAnswer, type PyAnswer } from "./grading";
import { markDueNow, recordRevisionRound, scheduleFirstReview } from "./revision";
import { masteryOf, pyState } from "./state";

export type AnswerMode = "learn" | "practice" | "revision";

export function requireQuestion(id: string): QuestionRef {
  const ref = getPyQuestion(id);
  if (!ref) throw new NotFoundError("That question");
  return ref;
}

/** Grades and records one answer; returns why it is right or wrong. */
export async function answerQuestion(studentId: string, args: { questionId: string; answer: PyAnswer; mode: AnswerMode; hintUsed: boolean }) {
  const ref = requireQuestion(args.questionId);
  if (ref.source === "exam") throw new AppError("Assessment questions are answered inside the assessment.", 400, "exam_only");
  const result = gradeAnswer(ref, args.answer);
  const db = await getDb();
  const { achievements, lessonCompleted } = await db.transaction(async (tx) => {
    const wasDone = ref.lessonId ? (await pyState(tx, studentId)).lessonInfo.get(ref.lessonId)?.status === "completed" : true;
    await tx.insert(schema.pyAttempts).values({
      studentId, itemId: ref.id, lessonId: ref.lessonId, moduleId: ref.moduleId, kind: ref.q.kind, mode: args.mode,
      correct: result.correct, hintUsed: args.hintUsed, difficulty: ref.q.difficulty, answer: answerSummary(args.answer, ref.q),
    });
    if (!result.correct && ref.lessonId && ref.source !== "warmup") await markDueNow(tx, studentId, ref.lessonId);
    const after = await pyState(tx, studentId);
    // Answering the last outstanding question can complete a lesson (its exercise already passed).
    const nowDone = !wasDone && ref.lessonId !== null && after.lessonInfo.get(ref.lessonId)?.status === "completed";
    if (nowDone) await scheduleFirstReview(tx, studentId, ref.lessonId!);
    return { achievements: await checkPyAchievements(tx, studentId, after), lessonCompleted: nowDone ? { id: ref.lessonId!, title: getPyLesson(ref.lessonId!)!.title } : null };
  });
  // Two misses in a row on this lesson → suggest the "explain it another way" text.
  const recent = await db.select({ correct: schema.pyAttempts.correct }).from(schema.pyAttempts)
    .where(and(eq(schema.pyAttempts.studentId, studentId), eq(schema.pyAttempts.lessonId, ref.lessonId ?? ""))).orderBy(desc(schema.pyAttempts.createdAt)).limit(2);
  const struggling = ref.lessonId !== null && ref.source !== "warmup" && recent.length === 2 && recent.every((r) => !r.correct);
  return { ...result, reteach: struggling ? getPyLesson(ref.lessonId!)!.reteach : null, achievements, lessonCompleted };
}

/** "Show me the answer" — recorded as not answered correctly, so mastery stays honest. */
export async function revealQuestion(studentId: string, questionId: string, mode: AnswerMode) {
  const ref = requireQuestion(questionId);
  if (ref.source === "exam") throw new AppError("Assessment answers are shown after you submit.", 400, "exam_only");
  const db = await getDb();
  await db.insert(schema.pyAttempts).values({
    studentId, itemId: ref.id, lessonId: ref.lessonId, moduleId: ref.moduleId, kind: ref.q.kind, mode, correct: false, revealed: true, difficulty: ref.q.difficulty,
  });
  return { correctAnswer: correctAnswerOf(ref.q), explanation: ref.q.explain };
}

export type PracticeScope = { type: "lesson" | "module"; id: string } | { type: "mixed" | "weak" | "level"; id?: string };

function pool(scope: PracticeScope, completedOrStarted: Set<string>, weak: string[]): QuestionRef[] {
  const practiceable = PY_QUESTIONS.filter((r) => r.source !== "exam");
  switch (scope.type) {
    case "lesson": return practiceable.filter((r) => r.lessonId === scope.id);
    case "module": return practiceable.filter((r) => r.moduleId === scope.id);
    case "level": {
      const level = Number(scope.id);
      return practiceable.filter((r) => getPyModule(r.moduleId)?.level === level);
    }
    case "weak": return practiceable.filter((r) => r.lessonId && weak.includes(r.lessonId));
    case "mixed": return practiceable.filter((r) => r.lessonId && completedOrStarted.has(r.lessonId));
  }
}

/** The next practice question for a scope, at the learner's level, preferring ones not seen recently. */
export async function nextPracticeQuestion(db: Tx, studentId: string, scope: PracticeScope) {
  const state = await pyState(db, studentId);
  const active = new Set(state.lessons.filter((l) => l.status === "completed" || l.status === "in_progress").map((l) => l.id));
  const candidates = pool(scope, active, state.weak.map((w) => w.lessonId));
  if (!candidates.length) return { question: null, targetDifficulty: null, reason: scope.type === "weak" ? "No weak topics right now — nice work." : "Start a lesson first — practice uses the topics you've begun." };
  const ids = candidates.map((c) => c.id);
  const history = await db.select({ itemId: schema.pyAttempts.itemId, correct: schema.pyAttempts.correct, revealed: schema.pyAttempts.revealed, difficulty: schema.pyAttempts.difficulty, createdAt: schema.pyAttempts.createdAt })
    .from(schema.pyAttempts).where(and(eq(schema.pyAttempts.studentId, studentId), inArray(schema.pyAttempts.itemId, ids))).orderBy(schema.pyAttempts.createdAt);
  const mastery = masteryOf(history);
  let target = Math.round(1 + (mastery ?? 0.25) * 4);
  const last = history.slice(-2);
  if (last.length === 2 && last.every((a) => a.correct && !a.revealed)) target = Math.max(target, last[1].difficulty + 1);
  else if (last.length && !last[last.length - 1].correct) target = Math.min(target, last[last.length - 1].difficulty - 1);
  target = Math.min(5, Math.max(1, target));
  const recent = new Set(history.slice(-6).map((a) => a.itemId));
  const seen = new Map<string, number>();
  for (const a of history) seen.set(a.itemId, (seen.get(a.itemId) ?? 0) + 1);
  const ranked = [...candidates].sort((a, b) =>
    Number(recent.has(a.id)) - Number(recent.has(b.id)) ||
    Math.abs(a.q.difficulty - target) - Math.abs(b.q.difficulty - target) ||
    (seen.get(a.id) ?? 0) - (seen.get(b.id) ?? 0) ||
    a.id.localeCompare(b.id));
  const pick = ranked[0];
  return {
    question: publicQuestion(pick), targetDifficulty: target,
    reason: `${seen.has(pick.id) ? "Seen before" : "New question"} · aimed at difficulty ${target}${mastery !== null ? ` (your accuracy here: ${Math.round(mastery * 100)}%)` : ""}`,
  };
}

/** Three questions for revising a lesson: previously-missed first, then least-seen. */
export async function revisionSet(db: Tx, studentId: string, lessonId: string) {
  const lesson = getPyLesson(lessonId);
  if (!lesson) throw new NotFoundError("That lesson");
  const refs = PY_QUESTIONS.filter((r) => r.lessonId === lessonId && r.source === "lesson");
  const history = await db.select({ itemId: schema.pyAttempts.itemId, correct: schema.pyAttempts.correct, createdAt: schema.pyAttempts.createdAt })
    .from(schema.pyAttempts).where(and(eq(schema.pyAttempts.studentId, studentId), eq(schema.pyAttempts.lessonId, lessonId))).orderBy(schema.pyAttempts.createdAt);
  const lastResult = new Map<string, boolean>();
  const count = new Map<string, number>();
  for (const a of history) {
    lastResult.set(a.itemId, a.correct);
    count.set(a.itemId, (count.get(a.itemId) ?? 0) + 1);
  }
  const ranked = [...refs].sort((a, b) =>
    Number(lastResult.get(a.id) ?? true) - Number(lastResult.get(b.id) ?? true) || (count.get(a.id) ?? 0) - (count.get(b.id) ?? 0) || a.id.localeCompare(b.id));
  return { lesson: { id: lesson.id, title: lesson.title, reteach: lesson.reteach, summary: lesson.summary }, questions: ranked.slice(0, 3).map(publicQuestion) };
}

/** Closes a revision round: scores the latest revision answers to these questions and reschedules. */
export async function completeRevision(studentId: string, lessonId: string, questionIds: string[]) {
  const db = await getDb();
  const since = new Date(Date.now() - 3 * 3600_000);
  const rows = await db.select({ itemId: schema.pyAttempts.itemId, correct: schema.pyAttempts.correct, createdAt: schema.pyAttempts.createdAt })
    .from(schema.pyAttempts)
    .where(and(eq(schema.pyAttempts.studentId, studentId), eq(schema.pyAttempts.mode, "revision"), inArray(schema.pyAttempts.itemId, questionIds), gte(schema.pyAttempts.createdAt, since)))
    .orderBy(schema.pyAttempts.createdAt);
  const latest = new Map<string, boolean>();
  for (const r of rows) latest.set(r.itemId, r.correct);
  if (latest.size < questionIds.length) throw new AppError("Answer every question in this round first.", 400, "incomplete");
  const correct = [...latest.values()].filter(Boolean).length;
  const result = await recordRevisionRound(db, studentId, lessonId, correct, questionIds.length);
  return { correct, total: questionIds.length, ...result };
}
