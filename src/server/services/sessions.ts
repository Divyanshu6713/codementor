/**
 * Session runner: the server-owned state machine behind lessons, practice, revision and the
 * diagnostic. The browser only ever sees the current step/item and sends actions; every decision
 * (what comes next, whether an answer is right, whether hints/solutions are allowed) happens here.
 */
import { and, desc, eq, inArray, max } from "drizzle-orm";
import { getDb, schema, type DB, type Tx } from "@/server/db/client";
import type { SessionKind } from "@/server/db/schema";
import { AppError, NotFoundError } from "@/server/errors";
import { logger } from "@/server/logger";
import { DIAGNOSTIC_LADDER, conceptById, lessonById, misconceptionByCode, questionById } from "@/content";
import type { LessonStepDef } from "@/content/types";
import { getTrace } from "@/content/traces";
import { gradeAnswer, evaluateExplanationRubric, defaultCategory, type GradeResult } from "@/server/learning/grading";
import { diagnoseSubmission, type CodeDiagnosis } from "@/server/learning/code-diagnosis";
import { initialDifficulty, nextDifficulty } from "@/server/learning/adaptivity";
import { entryRung, nextDiagnosticStep, summarizeDiagnostic, type DiagItem } from "@/server/learning/diagnostic";
import { pickQuestion } from "@/server/learning/picker";
import { SESSION_QUESTIONS, type Decision, type SessionLength } from "@/server/learning/engine";
import type { EvidenceKind } from "@/server/learning/mastery";
import { judgeSubmission, publicJudgeView, type JudgeOutcome } from "@/server/execution/judge";
import { executionStatus } from "@/server/execution/providers";
import { aiEvaluateExplanation, aiHint, aiMistakeExplanation, aiSimplify, aiStatus } from "@/server/ai";
import type { Evidence } from "@/server/ai/types";
import type { StudentAnswer } from "@/types/questions";
import { answerFacts, ensureValidated, getPool, loadQuestion, loadQuestionVersion, presentQuestion, type LoadedQuestion } from "./questions";
import { loadSkillStates, recordMistake, recordMisconceptions, resolveItem, setInferredSkills } from "./student-model";
import { conceptMasteryMap, nextDecision, studentContext } from "./learner";
import { buildReport } from "./reports";
import { checkAchievements } from "./achievements";
import { ARENA_PROBLEM_IDS, PROBLEM_META } from "@/content/problems";
import { streaks, xpForOutcome } from "./progression";
import type { AnswerFeedback, ItemRole, ItemState, QueueEntry, SessionPlan, SessionState } from "./session-types";

type SessionRow = typeof schema.learningSessions.$inferSelect;

const ROLE_KIND: Record<ItemRole, EvidenceKind> = {
  diagnostic: "diagnostic", checkpoint: "lesson", retry: "lesson", code: "lesson", explain: "explain",
  practice: "practice", exit: "exit_check", revision: "revision",
};
const HINT_ROLES = new Set<ItemRole>(["checkpoint", "retry", "code", "practice", "revision"]);
/** Roles where a wrong submission unlocks the hidden test cases (never in checks). */
const REVEAL_ROLES = new Set<ItemRole>(["code", "practice", "revision"]);
/** Seeing the hidden cases counts like the level-1 hint when the item is scored. */
const REVEALED_TESTS_HELP_LEVEL = 1;
const helpLevel = (item: ItemState) => Math.max(item.maxHint, item.testsRevealed ? REVEALED_TESTS_HELP_LEVEL : -1);
const SLOT_PURPOSE = { practice: "practice", exit: "assessment", revision: "revision" } as const;

async function event(db: Tx, studentId: string, sessionId: string | null, type: string, payload: Record<string, unknown> = {}) {
  await db.insert(schema.sessionEvents).values({ studentId, sessionId, type, payload });
}

async function loadOwnSession(db: Tx, studentId: string, sessionId: string): Promise<SessionRow> {
  const s = await db.query.learningSessions.findFirst({ where: eq(schema.learningSessions.id, sessionId) });
  if (!s || s.studentId !== studentId) throw new NotFoundError("That session");
  return s;
}

async function saveState(db: Tx, sessionId: string, state: SessionState) {
  await db.update(schema.learningSessions).set({ state, lastActivityAt: new Date() }).where(eq(schema.learningSessions.id, sessionId));
}

// ── Starting sessions ─────────────────────────────────────────────────────

export interface StartOptions {
  kind: SessionKind;
  lessonId?: string;
  conceptId?: string;
  skills?: string[];
  length?: SessionLength;
  decision?: Decision | null;
  mistakeId?: string;
  /** Practice Arena: solve exactly this problem. */
  questionId?: string;
}

function lessonQueue(steps: LessonStepDef[], reteachTargets: Set<string>): QueueEntry[] {
  const q: QueueEntry[] = [];
  for (const s of steps) {
    if (s.kind === "reteach" && reteachTargets.has(s.key)) continue;
    if (s.kind === "checkpoint") q.push({ t: "q", questionId: s.questionId, role: "checkpoint", stepKey: s.key });
    else if (s.kind === "code") q.push({ t: "q", questionId: s.questionId, role: "code", stepKey: s.key, mode: s.mode });
    else if (s.kind === "explain_back") q.push({ t: "q", questionId: s.questionId, role: "explain", stepKey: s.key });
    else if (s.kind === "practice") q.push({ t: "slot", role: "practice", skills: s.skills, remaining: s.count });
    else if (s.kind === "exit_check") q.push({ t: "slot", role: "exit", skills: s.skills, remaining: s.count });
    else q.push({ t: "step", key: s.key });
  }
  return q;
}

export async function startSession(studentId: string, opts: StartOptions): Promise<string> {
  const db = await getDb();
  const profile = await db.query.studentProfiles.findFirst({ where: eq(schema.studentProfiles.userId, studentId) });
  if (!profile?.onboardedAt) throw new AppError("Finish setting up your profile first.", 409, "onboarding_required");
  if (opts.kind !== "diagnostic" && !profile.diagnosticCompletedAt) throw new AppError("Take the quick placement check first.", 409, "diagnostic_required");

  const length = opts.length ?? "normal";
  const plan: SessionPlan = { decision: opts.decision ?? null, length, title: "", lessonId: opts.lessonId, mistakeId: opts.mistakeId };
  const state: SessionState = { queue: [], pos: 0, item: null, difficulty: 2, history: [], served: [], itemCount: 0 };
  let conceptId: string | null = opts.conceptId ?? null;
  let lessonVersionId: string | null = null;

  if (opts.kind === "lesson") {
    const lesson = opts.lessonId ? lessonById.get(opts.lessonId) : undefined;
    if (!lesson) throw new NotFoundError("That lesson");
    const row = await db.query.lessons.findFirst({ where: eq(schema.lessons.id, lesson.id) });
    const lv = await db.query.lessonVersions.findFirst({ where: and(eq(schema.lessonVersions.lessonId, lesson.id), eq(schema.lessonVersions.version, row!.currentVersion)) });
    lessonVersionId = lv!.id;
    conceptId = lesson.conceptId;
    plan.title = lesson.title;
    const targets = new Set(lesson.steps.flatMap((s) => (s.kind === "checkpoint" ? Object.values(s.reteach) : [])));
    state.queue = lessonQueue(lesson.steps, targets);
  } else if (opts.kind === "diagnostic") {
    plan.title = "Placement check";
    state.diag = {
      entry: entryRung({ experience: profile.experience, usedCpp: profile.usedCpp, confidence: profile.confidence }, DIAGNOSTIC_LADDER.length),
      answers: [],
    };
  } else if (opts.questionId) {
    const def = questionById.get(opts.questionId);
    if (!def || !ARENA_PROBLEM_IDS.includes(opts.questionId)) throw new NotFoundError("That problem");
    conceptId = def.conceptId;
    plan.title = `Arena · ${PROBLEM_META[opts.questionId].title}`;
    state.queue = [{ t: "q", questionId: opts.questionId, role: "practice" }];
  } else if (opts.mistakeId) {
    const mistake = await db.query.mistakes.findFirst({ where: eq(schema.mistakes.id, opts.mistakeId) });
    if (!mistake || mistake.studentId !== studentId) throw new NotFoundError("That mistake");
    conceptId = mistake.conceptId;
    plan.title = "Mistake retry";
    state.queue = [{ t: "q", questionId: mistake.retryQuestionId ?? mistake.questionId, role: "practice" }];
  } else {
    const skills = opts.skills?.length ? opts.skills : conceptId ? conceptById.get(conceptId)?.skills.map((s) => s.id) ?? [] : [];
    if (!skills.length) throw new AppError("Choose what to practise.");
    const role = opts.kind === "revision" ? "revision" : "practice";
    plan.title = opts.kind === "revision" ? "Revision" : `Practice: ${conceptId ? conceptById.get(conceptId)?.title : "mixed"}`;
    state.queue = [{ t: "slot", role, skills, remaining: SESSION_QUESTIONS[length] }];
    // Mistake Book retry at the end of a normal/deep revision session, if one is open.
    if (opts.kind === "revision" && length !== "quick") {
      const open = await db.query.mistakes.findFirst({ where: and(eq(schema.mistakes.studentId, studentId), eq(schema.mistakes.status, "open")), orderBy: desc(schema.mistakes.updatedAt) });
      if (open) state.queue.push({ t: "q", questionId: open.retryQuestionId ?? open.questionId, role: "revision" });
    }
  }

  const states = await loadSkillStates(db, studentId);
  const targetSkills = conceptId ? conceptById.get(conceptId)?.skills.map((s) => s.id) ?? [] : opts.skills ?? [];
  const masteries = targetSkills.map((id) => states.get(id)?.mastery).filter((m): m is number => m !== undefined);
  state.difficulty = initialDifficulty(masteries.length ? masteries.reduce((a, b) => a + b, 0) / masteries.length : null);

  const sessionId = await db.transaction(async (tx) => {
    const active = await tx.select({ id: schema.learningSessions.id }).from(schema.learningSessions)
      .where(and(eq(schema.learningSessions.studentId, studentId), eq(schema.learningSessions.status, "active")));
    for (const a of active) {
      await tx.update(schema.learningSessions).set({ status: "abandoned", endedAt: new Date() }).where(eq(schema.learningSessions.id, a.id));
      await event(tx, studentId, a.id, "session_abandoned");
    }
    const [row] = await tx.insert(schema.learningSessions).values({
      studentId, kind: opts.kind, conceptId, lessonVersionId, status: "active", plan, state,
      masteryBefore: await conceptMasteryMap(tx, studentId),
    }).returning({ id: schema.learningSessions.id });
    await event(tx, studentId, row.id, "session_started", { kind: opts.kind, conceptId, lessonId: opts.lessonId ?? null });
    return row.id;
  });

  // Materialise the first entry (may pick an adaptive question or the first diagnostic item).
  await withSession(studentId, sessionId, async (tx, s, st) => {
    if (opts.kind === "diagnostic") await pushNextDiagnostic(tx, s, st);
    await settle(tx, s, st);
  });
  return sessionId;
}

/** Starts whatever the learning engine recommends right now. */
export async function startRecommended(studentId: string, length: SessionLength = "normal", useAlternative = false): Promise<string> {
  const db = await getDb();
  const d = await nextDecision(db, studentId);
  switch (d.action) {
    case "diagnostic":
      return startSession(studentId, { kind: "diagnostic", decision: d });
    case "learn":
    case "remediate":
      if (d.lessonId) return startSession(studentId, { kind: "lesson", lessonId: d.lessonId, decision: d, length });
      return startSession(studentId, { kind: "practice", conceptId: d.conceptId ?? undefined, skills: d.skills, decision: d, length });
    case "practice":
      return startSession(studentId, { kind: "practice", conceptId: d.conceptId ?? undefined, skills: d.skills, decision: d, length });
    case "revise":
      return startSession(studentId, { kind: "revision", skills: d.skills, decision: d, length });
    case "content_pending":
      if (useAlternative && d.alternative) return startSession(studentId, { kind: "lesson", lessonId: d.alternative.lessonId, decision: d, length });
      throw new AppError(d.reasons.join(" "), 409, "content_pending");
    default:
      throw new AppError("Everything available is mastered. Try revision or the playground.", 409, "all_done");
  }
}

// ── State machine helpers ─────────────────────────────────────────────────

async function withSession<T>(studentId: string, sessionId: string, fn: (tx: Tx, s: SessionRow, st: SessionState) => Promise<T>): Promise<T> {
  const db = await getDb();
  return db.transaction(async (tx) => {
    const s = await loadOwnSession(tx, studentId, sessionId);
    if (s.status !== "active") throw new AppError("This session has already finished.", 409, "session_finished");
    const st = structuredClone(s.state) as SessionState;
    const out = await fn(tx, s, st);
    await saveState(tx, sessionId, st);
    return out;
  });
}

async function lastSeenMap(db: Tx, studentId: string) {
  const rows = await db.select({ q: schema.itemOutcomes.questionId, at: max(schema.itemOutcomes.createdAt) })
    .from(schema.itemOutcomes).where(eq(schema.itemOutcomes.studentId, studentId)).groupBy(schema.itemOutcomes.questionId);
  return new Map(rows.filter((r) => r.at).map((r) => [r.q, new Date(r.at as unknown as string)]));
}

async function activeMisconceptionCodes(db: Tx, studentId: string) {
  const rows = await db.select({ code: schema.studentMisconceptions.code }).from(schema.studentMisconceptions)
    .where(and(eq(schema.studentMisconceptions.studentId, studentId), eq(schema.studentMisconceptions.status, "active")));
  return new Set(rows.map((r) => r.code));
}

/**
 * Makes the entry at `pos` presentable: expands adaptive slots, creates the item for a question
 * (validating judged questions first), and finishes the session when the queue is exhausted.
 */
async function settle(db: Tx, s: SessionRow, st: SessionState): Promise<void> {
  const exec = await executionStatus();
  for (let guard = 0; guard < 50; guard++) {
    const entry = st.queue[st.pos];
    if (!entry) {
      if (s.kind === "diagnostic") return; // diagnostic finishing is handled by advance()
      return;
    }
    if (entry.t === "slot") {
      if (entry.remaining <= 0) {
        st.queue.splice(st.pos, 1);
        continue;
      }
      const plan = s.plan as SessionPlan;
      const picked = pickQuestion(await getPool(db), {
        targetSkills: entry.skills, targetDifficulty: st.difficulty, purpose: SLOT_PURPOSE[entry.role],
        exclude: new Set(st.served), lastSeen: await lastSeenMap(db, s.studentId),
        activeMisconceptions: new Set([...(await activeMisconceptionCodes(db, s.studentId)), ...(plan.decision?.misconception ? [plan.decision.misconception] : [])]),
        executionAvailable: exec.available, lastType: st.served.length ? questionById.get(st.served.at(-1)!)?.type ?? null : null, now: new Date(),
      });
      if (!picked) {
        st.queue.splice(st.pos, 1);
        continue;
      }
      entry.remaining--;
      st.queue.splice(st.pos, 0, { t: "q", questionId: picked.id, role: entry.role });
      continue;
    }
    if (entry.t === "q" && !st.item) {
      const q = await loadQuestion(db, entry.questionId);
      if (q.type === "write_code") {
        const v = exec.available ? await ensureValidated(db, q) : "unavailable";
        if (v !== "ok") {
          st.queue[st.pos] = v === "failed"
            ? { t: "notice", title: "Exercise skipped", body: "This coding exercise didn't pass our automatic quality check, so it has been hidden and flagged for review." }
            : { t: "notice", title: "Coding exercise skipped", body: `This part needs the code runner. ${exec.message ?? "Code execution environment not configured."} Nothing has been marked against you.` };
          return;
        }
      }
      const profile = await db.query.studentProfiles.findFirst({ where: eq(schema.studentProfiles.userId, s.studentId) });
      st.itemCount++;
      const choiceLike = ["mcq", "predict_output", "identify_error", "complete_code", "trace"].includes(q.type);
      st.item = {
        itemKey: `${s.id}:${st.pos}:${q.id}`, questionId: q.id, versionId: q.versionId, role: entry.role, mode: entry.mode, stepKey: entry.stepKey,
        attempts: 0, maxHint: -1, revealed: false, resolved: false, correct: null, misconceptions: [], hints: [], last: null, lastSource: null, solution: null,
        // Ask "how sure are you?" now and then — never on every question, never in checks.
        askConfidence: Boolean(profile?.askConfidence) && choiceLike && ["checkpoint", "practice", "revision"].includes(entry.role) && st.itemCount % 3 === 1,
      };
      if (!st.served.includes(q.id)) st.served.push(q.id);
      await event(db, s.studentId, s.id, "question_presented", { questionId: q.id, version: q.version, role: entry.role, difficulty: q.difficulty });
    }
    return;
  }
}

async function pushNextDiagnostic(db: Tx, s: SessionRow, st: SessionState): Promise<boolean> {
  const exec = await executionStatus();
  const pool = await getPool(db);
  const bank: DiagItem[] = pool.filter((q) => q.purposes.includes("diagnostic")).map((q) => ({ questionId: q.id, conceptId: q.conceptId, difficulty: q.difficulty, type: q.type }));
  const step = nextDiagnosticStep({ ladder: DIAGNOSTIC_LADDER, entry: st.diag!.entry }, st.diag!.answers, bank, { executionAvailable: exec.available });
  if (step.done) return false;
  st.queue.push({ t: "q", questionId: step.questionId, role: "diagnostic" });
  return true;
}

// ── Actions ───────────────────────────────────────────────────────────────

export async function advance(studentId: string, sessionId: string): Promise<{ finished: boolean }> {
  const result = await withSession(studentId, sessionId, async (tx, s, st) => {
    const entry = st.queue[st.pos];
    if (entry?.t === "q" && !st.item?.resolved) throw new AppError("Answer this question (or skip it) before moving on.", 409, "item_open");
    if (entry?.t === "step") await event(tx, studentId, s.id, "lesson_step_completed", { key: entry.key });
    st.pos++;
    st.item = null;
    if (s.kind === "diagnostic" && st.pos >= st.queue.length) {
      const more = await pushNextDiagnostic(tx, s, st);
      if (!more) return { finished: true };
    }
    await settle(tx, s, st);
    return { finished: st.pos >= st.queue.length };
  });
  if (result.finished) await completeSession(studentId, sessionId);
  return result;
}

function toEvidence(q: LoadedQuestion, grade: GradeResult | null, judge: JudgeOutcome | null, diag: CodeDiagnosis | null): Evidence {
  const codes = diag?.misconceptions ?? grade?.misconceptions ?? [];
  return {
    questionType: q.type,
    verdict: judge ? judge.verdict : grade ? (grade.correct ? "accepted" : "wrong_answer") : null,
    testsPassed: judge?.testsPassed ?? null, testsTotal: judge?.testsTotal ?? null,
    compileOutput: judge && judge.compileStatus !== "success" ? judge.compileOutput : null,
    whatHappened: diag?.whatHappened ?? grade?.feedback ?? null,
    misconceptions: codes.map((c) => ({ code: c, title: misconceptionByCode.get(c)?.title ?? c, explanation: misconceptionByCode.get(c)?.studentExplanation ?? "" })),
  };
}

export interface AnswerInput {
  itemKey: string;
  answer: StudentAnswer;
  selfConfidence?: "guessing" | "somewhat" | "very" | null;
  durationMs?: number | null;
}

/** Grades an answer. Code is judged before the transaction (it can take seconds). */
export async function submitAnswer(studentId: string, sessionId: string, input: AnswerInput) {
  const db = await getDb();
  const s = await loadOwnSession(db, studentId, sessionId);
  if (s.status !== "active") throw new AppError("This session has already finished.", 409, "session_finished");
  const pre = (s.state as SessionState).item;
  if (!pre || pre.itemKey !== input.itemKey) throw new AppError("This question has changed — reload the page.", 409, "stale_item");
  if (pre.resolved) throw new AppError("This question is already finished.", 409, "item_resolved");
  const q = await loadQuestionVersion(db, pre.versionId);

  // 1. Grade (deterministic). AI never grades.
  let grade: GradeResult | null = null;
  let judge: JudgeOutcome | null = null;
  let diag: CodeDiagnosis | null = null;
  let evaluator: "rubric" | "ai" | undefined;
  if (q.type === "write_code") {
    if (input.answer.type !== "code") throw new AppError("Expected code.");
    const key = q.answerKey;
    if (key.type !== "write_code") throw new AppError("Question key mismatch.");
    judge = await judgeSubmission(input.answer.source, q.tests, key.compare);
    if (judge.verdict === "internal_error") throw new AppError("The code runner had a problem with this run. Please try again.", 502, "execution_failed");
    if (judge.verdict !== "accepted") diag = diagnoseSubmission(input.answer.source, judge, key.detectors);
  } else if (q.type === "explain") {
    if (input.answer.type !== "text") throw new AppError("Expected text.");
    const key = q.answerKey;
    if (key.type !== "explain") throw new AppError("Question key mismatch.");
    grade = evaluateExplanationRubric(key.rubric, input.answer.text);
    evaluator = "rubric";
    const ai = await aiEvaluateExplanation(studentId, {
      prompt: q.content.prompt, keyIdeas: key.rubric.keyIdeas.map((k) => ({ id: k.id, label: k.label })),
      knownMisconceptions: key.rubric.misconceptionPatterns.map((m) => ({ code: m.misconception, title: misconceptionByCode.get(m.misconception)?.title ?? m.misconception })),
      text: input.answer.text, student: await studentContext(db, studentId, q.conceptId),
    });
    if (ai && grade.ideas) {
      const found = new Set(ai.value.ideasFound);
      const ideas = grade.ideas.map((i) => ({ ...i, found: found.has(i.id) }));
      const hits = ideas.filter((i) => i.found).length;
      grade = { ...grade, ideas, misconceptions: ai.value.misconceptions, score: Math.min(1, hits / key.rubric.required), correct: hits >= key.rubric.required && !ai.value.misconceptions.length, feedback: ai.value.feedback };
      evaluator = "ai";
    }
  } else {
    try {
      grade = gradeAnswer(q.answerKey, input.answer);
    } catch (err) {
      throw new AppError((err as Error).message);
    }
  }
  const correct = judge ? judge.verdict === "accepted" : grade!.correct;
  const score = judge ? (judge.testsTotal ? judge.testsPassed / judge.testsTotal : 0) : grade!.score;
  const codes = correct ? [] : diag?.misconceptions ?? grade?.misconceptions ?? [];
  const evidence = toEvidence(q, grade, judge, diag);

  // 2. Optional AI explanation of a wrong answer (before the transaction; curated fallback is instant).
  const role = pre.role;
  const attemptsNow = pre.attempts + 1;
  const resolvesNow = correct || role === "diagnostic" || role === "checkpoint" || role === "retry" || role === "explain" ||
    (role === "exit" && (q.type !== "write_code" || attemptsNow >= 3)) ||
    (q.type !== "write_code" && ["mcq", "predict_output", "identify_error"].includes(q.type) && attemptsNow >= 2) ||
    (q.type !== "write_code" && attemptsNow >= 3);
  let tutor: AnswerFeedback["tutor"] = null;
  if (!correct && role !== "diagnostic" && role !== "exit" && aiStatus().provider !== "curated") {
    const facts = answerFacts(q);
    const studentAnswer = input.answer.type === "code" ? input.answer.source : JSON.stringify(input.answer);
    const res = await aiMistakeExplanation(studentId, {
      questionPrompt: q.content.prompt, studentAnswer, evidence,
      curatedExplanation: grade?.feedback ?? diag?.whatHappened ?? "Not quite — compare your answer with what the question asks.",
      student: await studentContext(db, studentId, q.conceptId),
    }, { referenceSolution: q.referenceSolution, answerTexts: facts.answerTexts });
    // Curated fallback only adds value when it says something beyond the authored feedback.
    if (res.source === "ai") tutor = { text: res.value.explanation, question: res.value.guidingQuestion, source: "ai" };
  }

  // 3. Persist everything atomically.
  const now = new Date();
  const feedback = await withSession(studentId, sessionId, async (tx, srow, st) => {
    const item = st.item;
    if (!item || item.itemKey !== input.itemKey || item.resolved) throw new AppError("This question has changed — reload the page.", 409, "stale_item");
    item.attempts = attemptsNow;
    if (judge && !correct && REVEAL_ROLES.has(role) && !item.testsRevealed) {
      item.testsRevealed = true;
      await event(tx, studentId, sessionId, "hidden_tests_revealed", { questionId: q.id, attempt: attemptsNow });
    }
    const [attempt] = await tx.insert(schema.attempts).values({
      studentId, sessionId, questionId: q.id, questionVersionId: q.versionId, itemKey: item.itemKey, attemptNumber: item.attempts,
      answer: input.answer.type === "code" ? { type: "code", chars: input.answer.source.length } : input.answer,
      isCorrect: correct, score, hintLevelBefore: item.maxHint, selfConfidence: input.selfConfidence ?? null,
      mistakeCategory: correct ? null : diag?.category ?? defaultCategory(q.type, codes[0] ? misconceptionByCode.get(codes[0])?.category : undefined),
      misconceptionCodes: codes, durationMs: input.durationMs ?? null,
    }).returning({ id: schema.attempts.id });
    if (input.answer.type === "code" && judge) {
      item.lastSource = input.answer.source;
      const [sub] = await tx.insert(schema.codeSubmissions).values({
        studentId, sessionId, attemptId: attempt.id, questionVersionId: q.versionId, kind: "submit", language: "cpp", source: input.answer.source,
      }).returning({ id: schema.codeSubmissions.id });
      await tx.insert(schema.judgeResults).values({
        submissionId: sub.id, executor: judge.executor, verdict: judge.verdict, compileStatus: judge.compileStatus, compileOutput: judge.compileOutput.slice(0, 8000),
        testsPassed: judge.testsPassed, testsTotal: judge.testsTotal, runtimeError: judge.runtimeError,
        timeLimitExceeded: judge.timeLimitExceeded, memoryLimitExceeded: judge.memoryLimitExceeded, outputLimitExceeded: judge.outputLimitExceeded,
        details: judge.tests.map((t) => ({ id: t.id, passed: t.passed, status: t.status, visibility: t.visibility })), durationMs: judge.durationMs,
      });
    }
    await event(tx, studentId, sessionId, "answer_submitted", { questionId: q.id, attempt: item.attempts, correct, hintLevel: item.maxHint, role });

    let uncertain = false;
    let xp: number | undefined;
    let cleared: string[] = [];
    if (codes.length) {
      const rec = await recordMisconceptions(tx, {
        studentId, codes, questionId: q.id, attemptId: attempt.id, summary: diag?.whatHappened ?? grade?.feedback ?? q.content.prompt,
        selfConfidence: input.selfConfidence ?? null, skillIds: q.skills.map((x) => x.id), now,
      });
      uncertain = rec.uncertain.length > 0 && rec.recorded.length === 0;
      for (const c of rec.recorded) if (!item.misconceptions.includes(c)) item.misconceptions.push(c);
      if (rec.recorded.length) await event(tx, studentId, sessionId, "misconception_detected", { codes: rec.recorded, questionId: q.id });
      if (role !== "diagnostic" && rec.recorded.length) {
        await recordMistake(tx, {
          studentId, question: q, attemptId: attempt.id, misconceptionCode: rec.recorded[0], category: diag?.category ?? defaultCategory(q.type, misconceptionByCode.get(rec.recorded[0])?.category),
          snapshot: input.answer.type === "code" ? input.answer.source : describeAnswer(q, input.answer), whatHappened: diag?.whatHappened ?? grade?.feedback ?? "This answer showed a common misunderstanding.", now,
        });
      }
    } else if (!correct && role !== "diagnostic" && q.type === "write_code" && diag) {
      await recordMistake(tx, {
        studentId, question: q, attemptId: attempt.id, misconceptionCode: null, category: diag.category,
        snapshot: input.answer.type === "code" ? input.answer.source : "", whatHappened: diag.whatHappened, now,
      });
    }

    if (resolvesNow) {
      item.resolved = true;
      item.correct = correct;
      const res = await resolveItem(tx, {
        studentId, sessionId, itemKey: item.itemKey, question: q, kind: ROLE_KIND[role], now,
        correct, attempts: item.attempts, maxHintLevel: helpLevel(item), solutionRevealed: item.revealed,
        creditOverride: role === "explain" ? score : undefined,
      });
      if (res.resolvedMisconceptions.length) await event(tx, studentId, sessionId, "misconception_resolved", { codes: res.resolvedMisconceptions });
      xp = xpForOutcome({ correct, credit: res.credit, difficulty: q.difficulty, solutionRevealed: item.revealed, context: ROLE_KIND[role] });
      cleared = res.resolvedMisconceptions.map((c) => misconceptionByCode.get(c)?.title ?? c);
      await event(tx, studentId, sessionId, "item_resolved", { questionId: q.id, correct, attempts: item.attempts, maxHint: item.maxHint, credit: res.credit });
      st.history.push({ correct, independent: correct && helpLevel(item) < 0, maxHintLevel: helpLevel(item) });
      if (role === "practice" || role === "exit" || role === "revision") st.difficulty = nextDifficulty(st.difficulty, st.history);
      if (role === "diagnostic") st.diag!.answers.push({ questionId: q.id, conceptId: q.conceptId, correct });
      if (role === "explain") {
        await tx.insert(schema.explanations).values({
          studentId, sessionId, promptKey: q.id, text: input.answer.type === "text" ? input.answer.text.slice(0, 3000) : "", score,
          evaluation: { ideas: grade?.ideas ?? [], misconceptions: codes }, evaluator: evaluator ?? "rubric",
        });
      }
      // Micro-adaptation: a missed checkpoint is followed by a different explanation and a fresh question.
      if (role === "checkpoint" && !correct) await insertReteach(tx, srow, st, item, codes);
    }

    const showMisconceptions = role !== "diagnostic" && (item.resolved || item.maxHint >= 3);
    const fb: AnswerFeedback = {
      correct, score,
      feedback: role === "diagnostic" ? null : grade?.feedback ?? null,
      whatHappened: role === "diagnostic" ? null : diag?.whatHappened ?? null,
      misconceptions: showMisconceptions ? codes.map((c) => ({ code: c, title: misconceptionByCode.get(c)?.title ?? c, explanation: misconceptionByCode.get(c)?.studentExplanation ?? "" })) : [],
      tutor: role === "diagnostic" ? null : tutor,
      judge: judge && role !== "diagnostic" ? publicJudgeView(judge, { revealHidden: Boolean(item.testsRevealed) }) : judge ? { ...publicJudgeView(judge), tests: [] } : null,
      fieldResults: role === "diagnostic" ? undefined : grade?.fieldResults,
      ideas: grade?.ideas, evaluator, uncertain,
      xp: role === "diagnostic" ? undefined : xp, cleared,
    };
    item.last = fb;
    return fb;
  });
  if (feedback.correct) await checkAchievements(db, studentId).catch((err) => logger.warn("achievements.failed", { err }));
  return feedback;
}

function describeAnswer(q: LoadedQuestion, a: StudentAnswer): string {
  if (a.type === "choice" && "options" in q.content) return q.content.options.find((o) => o.id === a.optionId)?.text ?? a.optionId;
  if (a.type === "text") return a.text;
  if (a.type === "fields") return a.values.join(", ");
  if (a.type === "order" && q.content.type === "reorder") return a.order.map((i) => (q.content as { lines: string[] }).lines[i]).join("\n");
  return "";
}

async function insertReteach(db: Tx, s: SessionRow, st: SessionState, item: ItemState, codes: string[]) {
  if (!s.lessonVersionId || !item.stepKey) return;
  const step = await db.query.lessonSteps.findFirst({ where: and(eq(schema.lessonSteps.lessonVersionId, s.lessonVersionId), eq(schema.lessonSteps.key, item.stepKey)) });
  const def = step?.content as LessonStepDef | undefined;
  if (!def || def.kind !== "checkpoint") return;
  const target = codes.map((c) => def.reteach[c]).find(Boolean) ?? def.reteach.default;
  const inserts: QueueEntry[] = [];
  if (target) inserts.push({ t: "step", key: target });
  inserts.push({ t: "q", questionId: def.retryQuestionId, role: "retry" });
  st.queue.splice(st.pos + 1, 0, ...inserts);
  await event(db, s.studentId, s.id, "reteach_inserted", { stepKey: item.stepKey, reteach: target ?? null, misconceptions: codes });
}

export async function requestHint(studentId: string, sessionId: string, itemKey: string) {
  const db = await getDb();
  const s = await loadOwnSession(db, studentId, sessionId);
  const item = (s.state as SessionState).item;
  if (!item || item.itemKey !== itemKey || item.resolved) throw new AppError("This question has changed — reload the page.", 409, "stale_item");
  if (!HINT_ROLES.has(item.role)) throw new AppError("Hints aren't available on checks — just give it your best try.", 409, "hints_unavailable");
  const level = item.maxHint + 1;
  if (level > 4) throw new AppError("You've seen every hint for this one.", 409, "no_more_hints");
  const q = await loadQuestionVersion(db, item.versionId);
  const facts = answerFacts(q);
  const hint = await aiHint(studentId, {
    level, curatedHint: q.hints[level], questionPrompt: q.content.prompt, questionCode: "code" in q.content ? (q.content.code ?? null) : null,
    studentAnswer: item.lastSource ?? null, evidence: item.last ? { questionType: q.type, verdict: item.last.judge?.verdict ?? (item.last.correct ? "accepted" : "wrong_answer"), testsPassed: item.last.judge?.testsPassed ?? null, testsTotal: item.last.judge?.testsTotal ?? null, compileOutput: item.last.judge?.compileStatus === "success" ? null : item.last.judge?.compileOutput ?? null, whatHappened: item.last.whatHappened, misconceptions: [] } : null,
    answerSummary: facts.summary, student: await studentContext(db, studentId, q.conceptId),
  }, { referenceSolution: q.referenceSolution, answerTexts: facts.answerTexts });
  return withSession(studentId, sessionId, async (tx, _s, st) => {
    const it = st.item!;
    if (it.itemKey !== itemKey || it.maxHint + 1 !== level) throw new AppError("This question has changed — reload the page.", 409, "stale_item");
    it.maxHint = level;
    it.hints.push({ level, text: hint.value.text, source: hint.source });
    await tx.insert(schema.hintRequests).values({ studentId, sessionId, questionVersionId: it.versionId, itemKey, level, source: hint.source });
    await event(tx, studentId, sessionId, "hint_requested", { questionId: it.questionId, level, source: hint.source });
    return { level, text: hint.value.text, source: hint.source };
  });
}

/**
 * Full solution — only when pedagogically appropriate: after the whole hint ladder or three real
 * attempts. The item then counts as not solved, and a similar question can come back later.
 */
export async function revealSolution(studentId: string, sessionId: string, itemKey: string) {
  return withSession(studentId, sessionId, async (tx, _s, st) => {
    const item = st.item;
    if (!item || item.itemKey !== itemKey || item.resolved) throw new AppError("This question has changed — reload the page.", 409, "stale_item");
    if (!HINT_ROLES.has(item.role)) throw new AppError("Solutions aren't shown during checks.", 409, "solution_unavailable");
    if (item.maxHint < 4 && item.attempts < 3) throw new AppError("Try the hints (or a couple more attempts) first — the solution unlocks after that.", 409, "solution_locked");
    const q = await loadQuestionVersion(tx, item.versionId);
    const facts = answerFacts(q);
    item.revealed = true;
    item.resolved = true;
    item.correct = false;
    item.solution = {
      answer: q.type === "write_code" ? null : facts.summary.replace(/^(Correct option|Accepted answers|Field answers): /, ""),
      code: q.type === "write_code" ? q.referenceSolution : null,
      walkthrough: q.answerKey.type === "write_code" ? q.answerKey.solutionWalkthrough : q.explanation,
    };
    await tx.insert(schema.hintRequests).values({ studentId, sessionId, questionVersionId: item.versionId, itemKey, level: 5, source: "curated" });
    await resolveItem(tx, { studentId, sessionId, itemKey, question: q, kind: ROLE_KIND[item.role], now: new Date(), correct: false, attempts: item.attempts, maxHintLevel: item.maxHint, solutionRevealed: true });
    st.history.push({ correct: false, independent: false, maxHintLevel: 5 });
    if (item.role === "practice" || item.role === "revision") st.difficulty = nextDifficulty(st.difficulty, st.history);
    await event(tx, studentId, sessionId, "solution_revealed", { questionId: q.id, attempts: item.attempts, maxHint: item.maxHint });
    return item.solution;
  });
}

/** Moves on without solving. Recorded honestly as not solved (credit 0). */
export async function skipItem(studentId: string, sessionId: string, itemKey: string) {
  return withSession(studentId, sessionId, async (tx, _s, st) => {
    const item = st.item;
    if (!item || item.itemKey !== itemKey || item.resolved) throw new AppError("This question has changed — reload the page.", 409, "stale_item");
    if (item.role === "diagnostic" || item.role === "checkpoint" || item.role === "retry") throw new AppError("Give this one your best guess — it's quick.", 409, "skip_unavailable");
    const q = await loadQuestionVersion(tx, item.versionId);
    item.resolved = true;
    item.correct = false;
    await resolveItem(tx, { studentId, sessionId, itemKey, question: q, kind: ROLE_KIND[item.role], now: new Date(), correct: false, attempts: Math.max(1, item.attempts), maxHintLevel: helpLevel(item), solutionRevealed: false });
    st.history.push({ correct: false, independent: false, maxHintLevel: item.maxHint });
    await event(tx, studentId, sessionId, "item_skipped", { questionId: q.id, attempts: item.attempts });
    return { ok: true };
  });
}

/**
 * "Run tests": judges the current code against every test case WITHOUT counting as a submission
 * (no attempt, no mastery change, no misconception recorded). Hidden cases show their details only
 * once they've been unlocked by a wrong submission.
 */
export async function runTests(studentId: string, sessionId: string, itemKey: string, source: string) {
  const db = await getDb();
  const s = await loadOwnSession(db, studentId, sessionId);
  if (s.status !== "active") throw new AppError("This session has already finished.", 409, "session_finished");
  const item = (s.state as SessionState).item;
  if (!item || item.itemKey !== itemKey || item.resolved) throw new AppError("This question has changed — reload the page.", 409, "stale_item");
  if (item.role === "diagnostic") throw new AppError("Just submit your answer for the placement check.", 409, "run_tests_unavailable");
  const q = await loadQuestionVersion(db, item.versionId);
  const key = q.answerKey;
  if (key.type !== "write_code") throw new AppError("Only coding questions have test cases.");
  const outcome = await judgeSubmission(source, q.tests, key.compare);
  if (outcome.verdict === "internal_error") throw new AppError("The code runner had a problem with this run. Please try again.", 502, "execution_failed");
  await db.insert(schema.codeSubmissions).values({ studentId, sessionId, questionVersionId: q.versionId, kind: "run", language: "cpp", source });
  await event(db, studentId, sessionId, "tests_run", { questionId: q.id, passed: outcome.testsPassed, total: outcome.testsTotal });
  return publicJudgeView(outcome, { revealHidden: Boolean(item.testsRevealed) });
}

/** "Explain it differently": AI re-explanation when configured, otherwise null (UI says so). */
export async function explainDifferently(studentId: string, sessionId: string, stepKey: string) {
  const db = await getDb();
  const s = await loadOwnSession(db, studentId, sessionId);
  if (!s.lessonVersionId) throw new AppError("Only lesson steps can be re-explained.");
  const step = await db.query.lessonSteps.findFirst({ where: and(eq(schema.lessonSteps.lessonVersionId, s.lessonVersionId), eq(schema.lessonSteps.key, stepKey)) });
  const def = step?.content as LessonStepDef | undefined;
  if (!def || !("body" in def)) throw new NotFoundError("That step");
  const res = await aiSimplify(studentId, { title: "title" in def ? def.title : "", body: def.body, student: await studentContext(db, studentId, s.conceptId) });
  await event(db, studentId, sessionId, "explain_differently", { stepKey, available: Boolean(res) });
  return res ? { text: res.value.text, source: res.source } : null;
}

// ── Completion ────────────────────────────────────────────────────────────

export async function completeSession(studentId: string, sessionId: string) {
  const db = await getDb();
  await db.transaction(async (tx) => {
    const s = await loadOwnSession(tx, studentId, sessionId);
    if (s.status !== "active") return;
    const st = s.state as SessionState;
    const now = new Date();
    if (s.kind === "diagnostic" && st.diag) {
      const out = summarizeDiagnostic({ ladder: DIAGNOSTIC_LADDER, entry: st.diag.entry }, st.diag.answers);
      const inferred = out.concepts.filter((c) => c.status === "inferred").flatMap((c) => conceptById.get(c.conceptId)?.skills.map((x) => x.id) ?? []);
      await setInferredSkills(tx, studentId, inferred);
      await tx.update(schema.studentProfiles).set({ diagnosticCompletedAt: now }).where(eq(schema.studentProfiles.userId, studentId));
      await tx.insert(schema.assessments).values({ studentId, sessionId, kind: "diagnostic", startedAt: s.startedAt, completedAt: now, result: out });
    }
    const masteryAfter = await conceptMasteryMap(tx, studentId);
    await tx.insert(schema.progressSnapshots).values({ studentId, sessionId, conceptMastery: masteryAfter });
    await tx.update(schema.learningSessions).set({ status: "completed", endedAt: now }).where(eq(schema.learningSessions.id, sessionId));
    await event(tx, studentId, sessionId, s.kind === "lesson" ? "lesson_completed" : "session_completed", { kind: s.kind });
  });
  const awarded = await checkAchievements(db, studentId).catch(() => [] as string[]);
  const report = await buildReport(db, studentId, sessionId, awarded);
  await db.update(schema.learningSessions).set({ report }).where(eq(schema.learningSessions.id, sessionId));
  return report;
}

/** Ends a session now. Whatever was answered still counts (a partial diagnostic gives usable estimates). */
export async function endSessionEarly(studentId: string, sessionId: string) {
  const db = await getDb();
  const s = await loadOwnSession(db, studentId, sessionId);
  if (s.status !== "active") return null;
  return completeSession(studentId, sessionId);
}

// ── View ──────────────────────────────────────────────────────────────────

const ROLE_LABEL: Record<ItemRole, string> = {
  diagnostic: "Placement check", checkpoint: "Checkpoint", retry: "Try this one", code: "Coding", explain: "Explain it back",
  practice: "Practice", exit: "Exit check", revision: "Revision",
};

export async function getSessionView(studentId: string, sessionId: string) {
  const db = await getDb();
  const s = await loadOwnSession(db, studentId, sessionId);
  const st = s.state as SessionState;
  const plan = s.plan as SessionPlan;
  const exec = await executionStatus();
  const ai = aiStatus();
  // Session scoreboard (from stored outcomes, so it survives reloads).
  const done = await db.select({
    correct: schema.itemOutcomes.correct, independent: schema.itemOutcomes.independent, credit: schema.itemOutcomes.credit,
    difficulty: schema.itemOutcomes.difficulty, solutionRevealed: schema.itemOutcomes.solutionRevealed, context: schema.itemOutcomes.context,
  }).from(schema.itemOutcomes).where(eq(schema.itemOutcomes.sessionId, s.id)).orderBy(schema.itemOutcomes.createdAt);
  const score = { xp: done.reduce((sum, o) => sum + xpForOutcome(o), 0), soloRun: streaks(done).current, solved: done.filter((o) => o.correct).length };
  const base = {
    id: s.id, kind: s.kind, status: s.status, title: plan.title, score, conceptTitle: s.conceptId ? conceptById.get(s.conceptId)?.title ?? null : null,
    why: plan.decision?.reasons ?? [], startedAt: s.startedAt.toISOString(),
    execution: { available: exec.available, devOnly: exec.devOnly, isolation: exec.isolation, message: exec.message },
    tutor: { available: ai.conversational },
  };
  const remainingSlots = st.queue.slice(st.pos).reduce((n, e) => n + (e.t === "slot" ? e.remaining : 1), 0);
  const progress = s.kind === "diagnostic"
    ? { done: st.diag?.answers.length ?? 0, total: null as number | null }
    : { done: st.pos, total: st.pos + remainingSlots };
  if (s.status !== "active") return { ...base, progress, entry: { kind: "finished" as const } };

  const entry = st.queue[st.pos];
  if (!entry) return { ...base, progress, entry: { kind: "finished" as const } };
  if (entry.t === "notice") return { ...base, progress, entry: { kind: "notice" as const, title: entry.title, body: entry.body } };
  if (entry.t === "step") {
    const row = s.lessonVersionId
      ? await db.query.lessonSteps.findFirst({ where: and(eq(schema.lessonSteps.lessonVersionId, s.lessonVersionId), eq(schema.lessonSteps.key, entry.key)) })
      : null;
    const def = row?.content as LessonStepDef | undefined;
    if (!def) return { ...base, progress, entry: { kind: "notice" as const, title: "Missing step", body: "This part of the lesson couldn't be loaded." } };
    return {
      ...base, progress,
      entry: {
        kind: "step" as const,
        step: {
          key: def.key, kind: def.kind, title: "title" in def ? def.title : "", body: "body" in def ? def.body : "",
          visual: def.kind === "visual" ? def.visual : null,
          trace: def.kind === "dry_run" ? getTrace(def.traceId) ?? null : null,
          code: def.kind === "example" ? { code: def.code, output: def.output } : null,
          reteach: def.kind === "reteach",
        },
      },
    };
  }
  const item = st.item;
  if (!item) return { ...base, progress, entry: { kind: "notice" as const, title: "Loading", body: "Preparing the next question…" } };
  const q = await loadQuestionVersion(db, item.versionId);
  const hintsAllowed = HINT_ROLES.has(item.role);
  return {
    ...base, progress,
    entry: {
      kind: "item" as const,
      item: {
        itemKey: item.itemKey, role: item.role, roleLabel: ROLE_LABEL[item.role], mode: item.mode ?? null,
        question: presentQuestion(q),
        attempts: item.attempts, resolved: item.resolved, correct: item.correct,
        hints: item.hints, canHint: hintsAllowed && !item.resolved && item.maxHint < 4, nextHintLevel: item.maxHint + 1,
        canReveal: hintsAllowed && !item.resolved && (item.maxHint >= 4 || item.attempts >= 3),
        canSkip: !item.resolved && !["diagnostic", "checkpoint", "retry"].includes(item.role),
        testsRevealed: Boolean(item.testsRevealed),
        canRunTests: q.type === "write_code" && !item.resolved && item.role !== "diagnostic",
        askConfidence: item.askConfidence && !item.resolved && item.attempts === 0,
        last: item.last, solution: item.solution, lastSource: item.lastSource,
        explanation: item.resolved && item.role !== "diagnostic" ? q.explanation : null,
      },
    },
  };
}
export type SessionView = Awaited<ReturnType<typeof getSessionView>>;

export async function activeSessionFor(db: DB, studentId: string) {
  return db.query.learningSessions.findFirst({
    where: and(eq(schema.learningSessions.studentId, studentId), eq(schema.learningSessions.status, "active")),
    orderBy: desc(schema.learningSessions.lastActivityAt),
  });
}

export async function recentSessions(db: DB, studentId: string, limit = 10) {
  return db.select({
    id: schema.learningSessions.id, kind: schema.learningSessions.kind, status: schema.learningSessions.status, plan: schema.learningSessions.plan,
    startedAt: schema.learningSessions.startedAt, endedAt: schema.learningSessions.endedAt, conceptId: schema.learningSessions.conceptId,
  }).from(schema.learningSessions)
    .where(and(eq(schema.learningSessions.studentId, studentId), inArray(schema.learningSessions.status, ["completed"])))
    .orderBy(desc(schema.learningSessions.startedAt)).limit(limit);
}
