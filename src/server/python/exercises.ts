/**
 * Python exercises and the coding workspace: run, step-by-step trace, judged check, hints and the
 * worked solution. Code always runs in the sandbox worker — never in this process — and the
 * deterministic judge alone decides whether an exercise passes.
 */
import { and, eq, sql } from "drizzle-orm";
import { getPyExercise, getPyLesson, type ExerciseRef } from "@/content/python";
import { getDb, schema, type Tx } from "@/server/db/client";
import { AppError, NotFoundError } from "@/server/errors";
import { judgeSubmission, publicJudgeView } from "@/server/execution/judge";
import type { PythonTrace } from "@/server/execution/protocol";
import { execute } from "@/server/execution/providers";
import { explainPythonError, pythonCheckFeedback, pythonRunFeedback } from "@/server/learning/python-feedback";
import { checkPyAchievements } from "./achievements";
import { scheduleFirstReview } from "./revision";
import { PY_XP, pyState } from "./state";

export function requireExercise(key: string): ExerciseRef {
  const ref = getPyExercise(key);
  if (!ref) throw new NotFoundError("That exercise");
  return ref;
}

type Files = { name: string; content: string }[];

/** Run once with the learner's own input (workspace and exercise "Run"). Nothing is stored. */
export async function runPython(source: string, input: string, files: Files = []) {
  const res = await execute({ language: "python", source, files, tests: [{ id: "run", input }] });
  const run = res.tests[0];
  const feedback = res.compile.status !== "success"
    ? (res.compile.status === "rejected" ? [{ title: "Not allowed here", body: res.compile.output }] : explainPythonError(res.compile.output))
    : run ? pythonRunFeedback(run.status, run.stderr || run.detail || "") : [];
  return {
    compile: res.compile,
    run: run ? { status: run.status, stdout: run.stdout.slice(0, 16_000), stderr: run.stderr.slice(0, 6000), detail: run.detail, timeMs: run.timeMs, exitCode: run.exitCode } : null,
    feedback,
    isolation: res.isolation,
  };
}

/** Step-by-step execution trace (a real run under a line tracer in the sandbox). */
export async function tracePython(source: string, input: string, files: Files = []) {
  const res = await execute({ language: "python", source, files, mode: "trace", tests: [{ id: "trace", input }] });
  if (res.compile.status !== "success") {
    return { ok: false as const, compile: res.compile, feedback: res.compile.status === "rejected" ? [] : explainPythonError(res.compile.output), trace: null, status: null };
  }
  const run = res.tests[0];
  let trace: PythonTrace | null = null;
  if (run.status === "ok") {
    try {
      trace = JSON.parse(run.stdout) as PythonTrace;
    } catch {
      trace = null;
    }
  }
  return {
    ok: trace !== null, compile: res.compile, trace, status: run.status,
    feedback: trace ? (trace.error ? explainPythonError(trace.error) : []) : pythonRunFeedback(run.status, run.stderr),
  };
}

async function upsertProgress(db: Tx, studentId: string, key: string, set: Partial<typeof schema.pyExerciseProgress.$inferInsert>) {
  await db.insert(schema.pyExerciseProgress).values({ studentId, exerciseKey: key, ...set })
    .onConflictDoUpdate({ target: [schema.pyExerciseProgress.studentId, schema.pyExerciseProgress.exerciseKey], set: { ...set, updatedAt: new Date() } });
}

export interface PyReward {
  firstPass: boolean;
  xp: number;
  lessonCompleted: { id: string; title: string } | null;
  achievements: { code: string; title: string }[];
  timeMs: number | null;
}

/**
 * "Check": judge against every test. Hidden tests return only pass/fail and the kind of case,
 * unless the learner asks to see one failing hidden case after a wrong check.
 */
export async function checkPython(studentId: string, key: string, source: string, opts: { showFailingHidden?: boolean; mode?: "learn" | "challenge" | "project" | "interview" } = {}) {
  const ref = requireExercise(key);
  const ex = ref.ex;
  const tests = ex.tests.map((t, i) => ({
    id: `t${i}`, label: t.label, input: t.input, expected: t.output, visibility: (t.hidden ? "hidden" : "sample") as "hidden" | "sample", category: t.category ?? "normal",
  }));
  const outcome = await judgeSubmission(source, tests, ex.compare ?? "lines", { language: "python", files: ex.files });
  const view = publicJudgeView(outcome);
  let revealed: { label: string; input: string; expected: string; actual: string } | null = null;
  if (opts.showFailingHidden && outcome.verdict !== "accepted" && outcome.compileStatus === "success") {
    const t = outcome.tests.find((x) => x.visibility === "hidden" && !x.passed);
    if (t) revealed = { label: t.label, input: t.input, expected: t.expected, actual: t.actual.slice(0, 4000) };
  }
  const passed = outcome.verdict === "accepted";
  const reward = opts.showFailingHidden ? null : await recordCheck(studentId, ref, passed, opts.mode ?? (ref.projectId ? "project" : "learn"));
  return {
    passed, verdict: outcome.verdict, compileStatus: outcome.compileStatus, compileOutput: outcome.compileOutput,
    testsPassed: outcome.testsPassed, testsTotal: outcome.testsTotal,
    tests: view.tests.map((t) => ({ label: t.label, hidden: t.hidden, category: t.category, passed: t.passed, status: t.status, input: t.input, expected: t.expected, actual: t.actual, detail: t.detail })),
    revealedHidden: revealed,
    feedback: pythonCheckFeedback(outcome),
    reward,
  };
}

async function recordCheck(studentId: string, ref: ExerciseRef, passed: boolean, mode: "learn" | "challenge" | "project" | "interview"): Promise<PyReward | null> {
  const db = await getDb();
  return db.transaction(async (tx) => {
    const before = await pyState(tx, studentId);
    const row = await tx.query.pyExerciseProgress.findFirst({ where: and(eq(schema.pyExerciseProgress.studentId, studentId), eq(schema.pyExerciseProgress.exerciseKey, ref.key)) });
    await tx.insert(schema.pyAttempts).values({
      studentId, itemId: ref.key, lessonId: ref.lessonId, moduleId: ref.moduleId, kind: "code", mode, correct: passed, difficulty: ref.ex.difficulty,
    });
    await tx.insert(schema.pyExerciseProgress).values({ studentId, exerciseKey: ref.key, checks: 1 })
      .onConflictDoUpdate({ target: [schema.pyExerciseProgress.studentId, schema.pyExerciseProgress.exerciseKey], set: { checks: sql`${schema.pyExerciseProgress.checks} + 1`, updatedAt: new Date() } });
    if (!passed || row?.passedAt) return passed ? { firstPass: false, xp: 0, lessonCompleted: null, achievements: [], timeMs: null } : null;

    const now = new Date();
    const timeMs = mode === "challenge" && row?.timerStartedAt ? now.getTime() - row.timerStartedAt.getTime() : null;
    const hintLevel = row?.hintLevel ?? 0;
    const after = Boolean(row?.solutionViewedAt);
    await upsertProgress(tx, studentId, ref.key, {
      passedAt: now, passedHintLevel: hintLevel, passedAfterSolution: after,
      ...(timeMs !== null ? { bestMs: row?.bestMs ? Math.min(row.bestMs, timeMs) : timeMs } : {}),
    });
    const after2 = await pyState(tx, studentId);
    let lessonCompleted: PyReward["lessonCompleted"] = null;
    if (ref.lessonId && before.lessonInfo.get(ref.lessonId)?.status !== "completed" && after2.lessonInfo.get(ref.lessonId)?.status === "completed") {
      lessonCompleted = { id: ref.lessonId, title: getPyLesson(ref.lessonId)!.title };
      await scheduleFirstReview(tx, studentId, ref.lessonId);
    }
    const xp = ref.projectId ? PY_XP.milestone(after) : ref.ex.kind === "project" ? PY_XP.miniProject(after) : PY_XP.exercise(hintLevel, after);
    const achievements = await checkPyAchievements(tx, studentId, after2);
    return { firstPass: true, xp: xp + (lessonCompleted ? PY_XP.lesson : 0), lessonCompleted, achievements, timeMs };
  });
}

/** Progressive hints (1–4). Opening a higher hint lowers the XP a later pass earns. */
export async function pyHint(studentId: string, key: string, level: number) {
  const ref = requireExercise(key);
  const lv = Math.min(Math.max(1, level), 4);
  const db = await getDb();
  await db.insert(schema.pyExerciseProgress).values({ studentId, exerciseKey: key, hintLevel: lv })
    .onConflictDoUpdate({
      target: [schema.pyExerciseProgress.studentId, schema.pyExerciseProgress.exerciseKey],
      set: { hintLevel: sql`greatest(${schema.pyExerciseProgress.hintLevel}, ${lv})`, updatedAt: new Date() },
    });
  return { level: lv, hint: ref.ex.hints[lv - 1] };
}

/** The worked solution — only on an explicit request. A later pass then earns the minimum XP. */
export async function pySolution(studentId: string, key: string) {
  const ref = requireExercise(key);
  const db = await getDb();
  const row = await db.query.pyExerciseProgress.findFirst({ where: and(eq(schema.pyExerciseProgress.studentId, studentId), eq(schema.pyExerciseProgress.exerciseKey, key)) });
  if (!row?.solutionViewedAt) await upsertProgress(db, studentId, key, { solutionViewedAt: new Date() });
  return { solution: ref.ex.solution, notes: ref.ex.notes };
}

/** Challenge mode: start (or restart) the timer for an unsolved exercise. */
export async function startTimer(studentId: string, key: string) {
  requireExercise(key);
  const db = await getDb();
  await upsertProgress(db, studentId, key, { timerStartedAt: new Date() });
  return { startedAt: new Date().toISOString() };
}

/** Saved code: exercise drafts (`ex:<key>`) and workspace slots (`ws:<n>`), on the server so work resumes anywhere. */
export async function saveCode(studentId: string, key: string, code: string) {
  if (!/^(ex:[A-Za-z0-9:/_-]{1,120}|ws:[1-5])$/.test(key)) throw new AppError("Invalid save slot.");
  const db = await getDb();
  if (key.startsWith("ex:") && !getPyExercise(key.slice(3))) throw new NotFoundError("That exercise");
  await db.insert(schema.pyCodeSaves).values({ studentId, key, code })
    .onConflictDoUpdate({ target: [schema.pyCodeSaves.studentId, schema.pyCodeSaves.key], set: { code, updatedAt: new Date() } });
  return { savedAt: new Date().toISOString() };
}

export async function loadCode(db: Tx, studentId: string, key: string) {
  const row = await db.query.pyCodeSaves.findFirst({ where: and(eq(schema.pyCodeSaves.studentId, studentId), eq(schema.pyCodeSaves.key, key)) });
  return row ? { code: row.code, updatedAt: row.updatedAt } : null;
}

export async function exerciseState(db: Tx, studentId: string, key: string) {
  const row = await db.query.pyExerciseProgress.findFirst({ where: and(eq(schema.pyExerciseProgress.studentId, studentId), eq(schema.pyExerciseProgress.exerciseKey, key)) });
  return {
    hintLevel: row?.hintLevel ?? 0, solutionViewed: Boolean(row?.solutionViewedAt), passed: Boolean(row?.passedAt), checks: row?.checks ?? 0,
    bestMs: row?.bestMs ?? null, timerStartedAt: row?.timerStartedAt?.toISOString() ?? null,
  };
}
