/**
 * Module assessments, level checkpoints, the final assessment, mixed-topic tests and mock
 * interviews. Questions are chosen on the server (unseen exam questions first), answers are graded
 * on the server, and nothing about the right answers reaches the browser before submission.
 */
import { and, eq, gte, inArray } from "drizzle-orm";
import {
  PY_EXERCISES, PY_MODULES, PY_QUESTIONS, getPyExercise, getPyModule, getPyQuestion, publicExercise, publicQuestion, type QuestionRef,
} from "@/content/python";
import { getDb, schema, type Tx } from "@/server/db/client";
import { AppError, NotFoundError } from "@/server/errors";
import { checkPyAchievements } from "./achievements";
import { answerSummary, correctAnswerOf, gradeAnswer, type PyAnswer } from "./grading";
import { markDueNow } from "./revision";
import { PASS_MARK, pyState } from "./state";

export type AssessmentKind = "module" | "level" | "final" | "mixed" | "interview";

const SIZES: Record<AssessmentKind, number> = { module: 8, level: 15, final: 25, mixed: 10, interview: 6 };
/** Seconds; null = untimed. Mock interviews and the final are timed like the real thing. */
const TIME_LIMITS: Record<AssessmentKind, number | null> = { module: null, level: 30 * 60, final: 50 * 60, mixed: null, interview: 45 * 60 };
const GRACE_S = 60;

/** Deterministic shuffle so a learner's order is stable for one assessment but differs between them. */
function shuffle<T>(items: T[], seed: string): T[] {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const rand = () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296;
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Unseen first, then least seen; exam-only questions are preferred for mastery checks. */
function choose(candidates: QuestionRef[], seen: Map<string, number>, n: number, seed: string, perModule?: number): QuestionRef[] {
  const ranked = shuffle(candidates, seed).sort((a, b) =>
    (seen.get(a.id) ?? 0) - (seen.get(b.id) ?? 0) || Number(b.source === "exam") - Number(a.source === "exam"));
  if (!perModule) return ranked.slice(0, n);
  const out: QuestionRef[] = [];
  const used = new Map<string, number>();
  for (const r of ranked) {
    if ((used.get(r.moduleId) ?? 0) >= perModule) continue;
    used.set(r.moduleId, (used.get(r.moduleId) ?? 0) + 1);
    out.push(r);
    if (out.length >= n) break;
  }
  return out;
}

const INTERVIEW_MODULES = ["py-ds", "py-algorithms", "py-interview"];

export async function startAssessment(studentId: string, kind: AssessmentKind, scopeId: string) {
  const db = await getDb();
  const seenRows = await db.select({ itemId: schema.pyAttempts.itemId }).from(schema.pyAttempts).where(eq(schema.pyAttempts.studentId, studentId));
  const seen = new Map<string, number>();
  for (const r of seenRows) seen.set(r.itemId, (seen.get(r.itemId) ?? 0) + 1);
  const seed = `${studentId}:${Date.now()}`;
  let questions: QuestionRef[] = [];
  let exerciseKey: string | null = null;

  if (kind === "module") {
    if (!getPyModule(scopeId)) throw new NotFoundError("That module");
    const exam = PY_QUESTIONS.filter((r) => r.moduleId === scopeId && r.source === "exam");
    const lessonQs = PY_QUESTIONS.filter((r) => r.moduleId === scopeId && r.source === "lesson");
    questions = [...exam, ...choose(lessonQs, seen, Math.max(0, SIZES.module - exam.length), seed)].slice(0, Math.max(SIZES.module, exam.length));
  } else if (kind === "level") {
    const level = Number(scopeId);
    const mods = PY_MODULES.filter((m) => m.level === level).map((m) => m.id);
    if (!mods.length) throw new NotFoundError("That level");
    questions = choose(PY_QUESTIONS.filter((r) => mods.includes(r.moduleId) && r.source !== "warmup"), seen, SIZES.level, seed, Math.max(2, Math.ceil(SIZES.level / mods.length)));
  } else if (kind === "final") {
    questions = choose(PY_QUESTIONS.filter((r) => r.source !== "warmup" && r.q.difficulty >= 2), seen, SIZES.final, seed, 1);
  } else if (kind === "mixed") {
    const state = await pyState(db, studentId);
    const started = new Set(state.lessons.filter((l) => l.status === "completed" || l.status === "in_progress").map((l) => l.id));
    const mods = scopeId === "all" ? null : scopeId.split(",");
    const pool = PY_QUESTIONS.filter((r) => r.source === "lesson" && r.lessonId && (mods ? mods.includes(r.moduleId) : started.has(r.lessonId)));
    if (pool.length < 4) throw new AppError("Start a few lessons first — a mixed test draws on the topics you've studied.", 400, "too_few");
    questions = choose(pool, seen, SIZES.mixed, seed, 3);
  } else if (kind === "interview") {
    const technical = PY_QUESTIONS.filter((r) => r.source !== "warmup" && (INTERVIEW_MODULES.includes(r.moduleId) || r.q.difficulty >= 3));
    questions = choose(technical, seen, SIZES.interview, seed, 2);
    const problems = PY_EXERCISES.filter((e) => (e.moduleId && INTERVIEW_MODULES.includes(e.moduleId) && e.ex.kind !== "project") || e.ex.kind === "challenge");
    const passedRows = await db.select({ key: schema.pyExerciseProgress.exerciseKey }).from(schema.pyExerciseProgress)
      .where(and(eq(schema.pyExerciseProgress.studentId, studentId), inArray(schema.pyExerciseProgress.exerciseKey, problems.map((p) => p.key).concat(["-"]))));
    const solved = new Set(passedRows.map((r) => r.key));
    const pick = shuffle(problems, seed).sort((a, b) => Number(solved.has(a.key)) - Number(solved.has(b.key)))[0];
    exerciseKey = pick?.key ?? null;
  }
  if (!questions.length) throw new AppError("There aren't enough questions for this assessment yet.", 400, "too_few");

  const [row] = await db.insert(schema.pyAssessments).values({
    studentId, kind, scopeId, questionIds: questions.map((q) => q.id), exerciseKey, timeLimitS: TIME_LIMITS[kind],
  }).returning({ id: schema.pyAssessments.id });
  return { id: row.id };
}

export async function getAssessment(db: Tx, studentId: string, id: string) {
  const row = await db.query.pyAssessments.findFirst({ where: and(eq(schema.pyAssessments.id, id), eq(schema.pyAssessments.studentId, studentId)) });
  if (!row) throw new NotFoundError("That assessment");
  const refs = row.questionIds.map((qid) => getPyQuestion(qid)).filter((r): r is QuestionRef => Boolean(r));
  const exercise = row.exerciseKey ? getPyExercise(row.exerciseKey) : null;
  return {
    id: row.id, kind: row.kind as AssessmentKind, scopeId: row.scopeId, startedAt: row.startedAt.toISOString(), timeLimitS: row.timeLimitS,
    submitted: Boolean(row.submittedAt), submittedAt: row.submittedAt?.toISOString() ?? null,
    score: row.score, total: row.total, passed: row.passed,
    questions: refs.map(publicQuestion),
    exercise: exercise ? publicExercise(exercise) : null,
    details: row.submittedAt ? (row.details as unknown as AssessmentDetails) : null,
  };
}

export interface AssessmentDetails {
  late: boolean;
  items: { questionId: string; correct: boolean; answered: boolean; your: string | null; feedback: string; explanation: string; correctAnswer: ReturnType<typeof correctAnswerOf>; lessonId: string | null }[];
  exercise: { key: string; passed: boolean } | null;
  weakLessons: string[];
}

export async function submitAssessment(studentId: string, id: string, answers: Record<string, PyAnswer>) {
  const db = await getDb();
  return db.transaction(async (tx) => {
    const row = await tx.query.pyAssessments.findFirst({ where: and(eq(schema.pyAssessments.id, id), eq(schema.pyAssessments.studentId, studentId)) });
    if (!row) throw new NotFoundError("That assessment");
    if (row.submittedAt) throw new AppError("This assessment was already submitted.", 409, "already_submitted");
    const now = new Date();
    const late = row.timeLimitS !== null && (now.getTime() - row.startedAt.getTime()) / 1000 > row.timeLimitS + GRACE_S;
    const mode = row.kind === "interview" ? "interview" : "exam";
    const items: AssessmentDetails["items"] = [];
    for (const qid of row.questionIds) {
      const ref = getPyQuestion(qid);
      if (!ref) continue;
      const given = answers[qid];
      const valid = given && given.kind === ref.q.kind;
      const g = valid ? gradeAnswer(ref, given) : null;
      items.push({
        questionId: qid, correct: Boolean(g?.correct), answered: Boolean(valid), your: valid ? answerSummary(given, ref.q) : null,
        feedback: g?.feedback ?? "Not answered.", explanation: ref.q.explain, correctAnswer: correctAnswerOf(ref.q), lessonId: ref.lessonId,
      });
      await tx.insert(schema.pyAttempts).values({
        studentId, itemId: qid, lessonId: ref.lessonId, moduleId: ref.moduleId, kind: ref.q.kind, mode, correct: Boolean(g?.correct),
        difficulty: ref.q.difficulty, answer: valid ? answerSummary(given, ref.q) : null, assessmentId: row.id,
      });
      if (!g?.correct && ref.lessonId) await markDueNow(tx, studentId, ref.lessonId, now);
    }
    let exercise: AssessmentDetails["exercise"] = null;
    if (row.exerciseKey) {
      const passes = await tx.select({ id: schema.pyAttempts.id }).from(schema.pyAttempts).where(and(
        eq(schema.pyAttempts.studentId, studentId), eq(schema.pyAttempts.itemId, row.exerciseKey), eq(schema.pyAttempts.kind, "code"),
        eq(schema.pyAttempts.correct, true), gte(schema.pyAttempts.createdAt, row.startedAt),
      )).limit(1);
      exercise = { key: row.exerciseKey, passed: passes.length > 0 };
    }
    const score = items.filter((i) => i.correct).length + (exercise?.passed ? 2 : 0);
    const total = items.length + (exercise ? 2 : 0);
    const passed = !late && total > 0 && score / total >= PASS_MARK;
    const missed = new Map<string, number>();
    for (const i of items) if (!i.correct && i.lessonId) missed.set(i.lessonId, (missed.get(i.lessonId) ?? 0) + 1);
    const details: AssessmentDetails = { late, items, exercise, weakLessons: [...missed.keys()] };
    await tx.update(schema.pyAssessments).set({ submittedAt: now, score, total, passed, details: details as unknown as Record<string, unknown> }).where(eq(schema.pyAssessments.id, row.id));
    const achievements = await checkPyAchievements(tx, studentId, await pyState(tx, studentId));
    return { score, total, passed, late, achievements };
  });
}
