/**
 * Guest learning: run code, check an exercise, reveal the worked solution. No account and no
 * database — nothing a guest writes is stored on the server (code is sent to the sandbox, judged,
 * and forgotten). Correctness is decided only by the deterministic judge, never by AI.
 */
import { getCourseLesson } from "@/content/course";
import type { CourseLesson } from "@/content/course";
import { judgeSubmission, publicJudgeView, type JudgeOutcome } from "@/server/execution/judge";
import { execute } from "@/server/execution/providers";
import { NotFoundError } from "@/server/errors";
import { checkFeedback, explainCompilerOutput, runFeedback } from "@/server/learning/feedback";

export function requireLesson(lessonId: string): CourseLesson {
  const l = getCourseLesson(lessonId);
  if (!l) throw new NotFoundError("That lesson");
  return l;
}

/** "Run": compile and run once with the student's own input. */
export async function guestRun(source: string, input: string) {
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

/** Runs the lesson's tests against a submission (shared by Check and the tutor's evidence). */
export function judgeLesson(lesson: CourseLesson, source: string): Promise<JudgeOutcome> {
  const tests = lesson.exercise.tests.map((t, i) => ({
    id: `t${i}`, label: t.label, input: t.input, expected: t.output, visibility: t.visibility, category: t.category,
  }));
  return judgeSubmission(source, tests, lesson.exercise.compare);
}

/**
 * "Check": judge against sample + hidden tests. Hidden tests return only pass/fail and the kind of
 * case — unless the student explicitly asks to see one failing hidden case after a wrong check
 * (`showFailingHidden`), in which case exactly that one case is revealed.
 */
export async function guestCheck(lessonId: string, source: string, showFailingHidden: boolean) {
  const lesson = requireLesson(lessonId);
  const outcome = await judgeLesson(lesson, source);
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
export function guestSolution(lessonId: string) {
  const lesson = requireLesson(lessonId);
  return { solution: lesson.exercise.solution, notes: lesson.exercise.solutionNotes };
}
