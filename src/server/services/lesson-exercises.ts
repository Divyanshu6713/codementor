/**
 * Lesson-path exercises: check an exercise and reveal the worked solution. Code is sent to the
 * sandbox, judged and not stored. Correctness is decided only by the deterministic judge, never
 * by AI. (Recording progress and XP is lesson-path.ts.)
 */
import { getCourseLesson, resolveExercise } from "@/content/course";
import type { CourseLesson, Exercise } from "@/content/course";
import { judgeSubmission, publicJudgeView, type JudgeOutcome } from "@/server/execution/judge";
import { execute } from "@/server/execution/providers";
import { NotFoundError } from "@/server/errors";
import { checkFeedback, explainCompilerOutput, runFeedback } from "@/server/learning/feedback";

export function requireLesson(lessonId: string): CourseLesson {
  const l = getCourseLesson(lessonId);
  if (!l) throw new NotFoundError("That lesson");
  return l;
}

/**
 * Resolves an exercise key: "<lessonId>" (the lesson exercise) or "<lessonId>~p2" / "~p3"
 * (the lesson's intermediate and challenge practice problems).
 */
export function requireExercise(key: string) {
  const r = resolveExercise(key);
  if (!r) throw new NotFoundError("That exercise");
  return r;
}

/** "Run": compile and run once with the student's own input. */
export async function runOnce(source: string, input: string) {
  const res = await execute({ language: "cpp", source, tests: [{ id: "run", input }] });
  const run = res.tests[0];
  const feedback = res.compile.status !== "success"
    ? explainCompilerOutput(res.compile.output, res.compile.status === "rejected" ? "rejected" : "error")
    : run ? [runFeedback(run.status, run.detail)].filter((f) => f !== null) : [];
  return {
    compile: res.compile,
    run: run ? { status: run.status, stdout: run.stdout.slice(0, 16_000), stderr: run.stderr.slice(0, 4000), detail: run.detail, timeMs: run.timeMs } : null,
    feedback,
    isolation: res.isolation,
  };
}

/** Runs an exercise's tests against a submission (shared by Check and the tutor's evidence). */
export function judgeExercise(exercise: Exercise, source: string): Promise<JudgeOutcome> {
  const tests = exercise.tests.map((t, i) => ({
    id: `t${i}`, label: t.label, input: t.input, expected: t.output, visibility: t.visibility, category: t.category,
  }));
  return judgeSubmission(source, tests, exercise.compare);
}

export const judgeLesson = (lesson: CourseLesson, source: string) => judgeExercise(lesson.exercise, source);

/**
 * "Check": judge against sample + hidden tests. Hidden tests return only pass/fail and the kind of
 * case — unless the student explicitly asks to see one failing hidden case after a wrong check
 * (`showFailingHidden`), in which case exactly that one case is revealed.
 */
export async function checkExercise(key: string, source: string, showFailingHidden: boolean) {
  const { exercise } = requireExercise(key);
  const outcome = await judgeExercise(exercise, source);
  const view = publicJudgeView(outcome);
  let revealed: { label: string; input: string; expected: string; actual: string } | null = null;
  if (showFailingHidden && outcome.verdict !== "accepted" && outcome.compileStatus === "success") {
    const t = outcome.tests.find((x) => x.visibility === "hidden" && !x.passed);
    if (t) revealed = { label: t.label, input: t.input, expected: t.expected, actual: t.actual.slice(0, 4000) };
  }
  return {
    passed: outcome.verdict === "accepted",
    verdict: outcome.verdict,
    compileStatus: outcome.compileStatus,
    compileOutput: outcome.compileOutput,
    testsPassed: outcome.testsPassed,
    testsTotal: outcome.testsTotal,
    tests: view.tests.map((t) => ({ label: t.label, hidden: t.hidden, category: t.category, passed: t.passed, status: t.status, input: t.input, expected: t.expected, actual: t.actual, detail: t.detail })),
    revealedHidden: revealed,
    feedback: checkFeedback(outcome),
  };
}

/** Level 5: the worked solution, only on an explicit request from the student. */
export function workedSolution(key: string) {
  const { exercise } = requireExercise(key);
  return { solution: exercise.solution, notes: exercise.solutionNotes };
}
