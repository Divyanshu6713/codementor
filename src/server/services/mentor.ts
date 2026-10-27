/**
 * The AI mentor panel (lessons and the playground): Explain concept · Give hint · Explain error ·
 * Review my code · Ask a question.
 *
 * Every mode has a curated answer that needs no AI. When an AI provider is enabled, each student
 * has a daily quota (keyed to their server-side account — guest or named — so it can't be reset
 * from the browser), the monthly budget applies, and the AI only sees real evidence: for hints,
 * errors and reviews the server compiles and runs/judges the code itself first, so the mentor never
 * has to guess whether it compiled or passed. If anything on the AI path fails, the curated answer
 * is returned with a short notice — the panel always answers.
 */
import type { CourseLesson, Exercise } from "@/content/course";
import { aiStatus, getAIProvider } from "@/server/ai";
import { config } from "@/server/config";
import { claimsUnverifiedExecution, revealsSolution, tooLong } from "@/server/ai/guardrails";
import type { Evidence, TutorMode } from "@/server/ai/types";
import { execute, executionStatus } from "@/server/execution/providers";
import type { JudgeOutcome } from "@/server/execution/judge";
import type { ExecutionResponse } from "@/server/execution/protocol";
import { isAppError } from "@/server/errors";
import { checkFeedback, explainCompilerOutput, runFeedback, type FeedbackItem } from "@/server/learning/feedback";
import { logger } from "@/server/logger";
import { claimAIRequest, refundAIRequest, remainingAIRequests, type QuotaDenied } from "./ai-quota";
import { judgeExercise, requireExercise } from "./lesson-exercises";

export interface TutorAnswer {
  source: "ai" | "curated";
  text: string;
  /** Why the AI wasn't used (or other context), shown above the answer. */
  notice: string | null;
  remaining: number | null;
}

const items = (list: FeedbackItem[]) => list.map((f) => `**${f.title}**${f.line ? ` (line ${f.line})` : ""}\n\n${f.body}`).join("\n\n");

/** Evidence from a judged lesson exercise. Hidden test inputs never go to the AI. */
function judgeEvidence(o: JudgeOutcome): Evidence {
  const failedSample = o.tests.find((t) => !t.passed && t.visibility !== "hidden" && t.status === "ok");
  const crash = o.tests.find((t) => t.status !== "ok" && t.status !== "not_run");
  const whatHappened = crash
    ? runFeedback(crash.status, crash.detail)?.title ?? null
    : failedSample
      ? `For the example "${failedSample.label}" (input ${JSON.stringify(failedSample.input)}) the program printed ${JSON.stringify(failedSample.actual.slice(0, 300))} but ${JSON.stringify(failedSample.expected)} was expected.`
      : o.verdict === "wrong_answer" ? "The examples pass but some hidden tests produce different output." : null;
  return {
    questionType: "write_code", verdict: o.verdict, testsPassed: o.testsPassed, testsTotal: o.testsTotal,
    compileOutput: o.compileStatus !== "success" ? o.compileOutput.slice(0, 1500) : null, whatHappened, misconceptions: [],
  };
}

/** Evidence from one playground run (no tests, so no verdict about correctness). */
function runEvidence(r: ExecutionResponse, input: string): Evidence {
  const run = r.tests[0];
  return {
    questionType: "playground", verdict: r.compile.status !== "success" ? (r.compile.status === "rejected" ? "rejected" : "compile_error") : run?.status === "ok" ? "ran" : run?.status ?? null,
    testsPassed: null, testsTotal: null,
    compileOutput: r.compile.status !== "success" ? r.compile.output.slice(0, 1500) : null,
    whatHappened: r.compile.status === "success" && run ? `With input ${JSON.stringify(input.slice(0, 200))} the program ${run.status === "ok" ? `printed ${JSON.stringify(run.stdout.slice(0, 300))}` : `stopped: ${run.detail ?? run.status}`}.` : null,
    misconceptions: [],
  };
}

function runItems(r: ExecutionResponse): string {
  if (r.compile.status !== "success") return items(explainCompilerOutput(r.compile.output, r.compile.status === "rejected" ? "rejected" : "error"));
  const run = r.tests[0];
  const f = run ? runFeedback(run.status, run.detail) : null;
  return f ? items([f]) : "Your program compiles and runs without an error. If the output isn't what you expected, trace it line by line with a small input — or ask a question below.";
}

function curatedAnswer(lesson: CourseLesson | null, exercise: Exercise | null, mode: TutorMode, hintLevel: number, ev: { judged: JudgeOutcome | null; ran: ExecutionResponse | null }, hadCode: boolean, canRun: boolean): string {
  if (!lesson && (mode === "concept" || mode === "hint")) return "Open a lesson to get its explanation and step-by-step hints. In the playground you can ask me to explain an error or a question.";
  switch (mode) {
    case "concept":
      return `${lesson!.explainAgain}\n\n**Key points**\n\n${lesson!.summary.map((s) => `- ${s}`).join("\n")}`;
    case "hint":
      return exercise!.hints[Math.min(Math.max(hintLevel, 1), 4) - 1];
    case "error": {
      if (!hadCode) return "Write or paste your code in the editor first, then ask again — I'll compile it and explain any error.";
      if (ev.ran) return runItems(ev.ran);
      const o = ev.judged;
      if (!o) return canRun ? "I couldn't run your code just now. Press **Run** to see the compiler's message, then try again." : "Code can't be run on this server right now, so I can't see an error message. The lesson's *Common mistakes* section covers the errors beginners hit most.";
      if (o.compileStatus !== "success") return items(explainCompilerOutput(o.compileOutput, o.compileStatus === "rejected" ? "rejected" : "error"));
      const crash = o.tests.find((t) => t.status !== "ok" && t.status !== "not_run");
      if (crash) return items([runFeedback(crash.status, crash.detail)].filter((f): f is FeedbackItem => f !== null));
      return o.verdict === "accepted"
        ? "Your code compiles and passes every test — there's no error to explain."
        : `Your code compiles and runs without crashing, so there's no error message. The output is different from what's expected:\n\n${items(checkFeedback(o))}`;
    }
    case "review": {
      if (!hadCode) return "Write your code in the editor first, then ask for a review.";
      const found = ev.judged ? items(checkFeedback(ev.judged)) : ev.ran ? runItems(ev.ran) : "Code can't be run right now, so I can't say whether it works.";
      return `Here's what happened when I ran your code:\n\n${found}\n\n**Review it yourself**\n\n- Read your program top to bottom and say out loud what each line does.\n- Run it with the example input, then with tricky inputs (0, 1, a negative number, the largest value).\n- Compare it with the lesson's worked example: which lines do the same job?`;
    }
    case "ask":
      return lesson
        ? `The AI mentor isn't answering free-form questions right now. This might help:\n\n${lesson.explainAgain}\n\nYou can also use **Give me a hint** for step-by-step help with the exercise.`
        : "The AI mentor isn't answering free-form questions right now. Try **Explain error** for help with a compiler message, or open a lesson on the topic.";
  }
}

const QUOTA_NOTICE: Record<QuotaDenied, string> = {
  guest: "You've used today's AI help. Here's the built-in help instead — AI help resets tomorrow.",
  network: "Your network has used a lot of AI help today. Here's the built-in help instead.",
  global: "CodeMentor's AI help has reached today's limit. Here's the built-in help instead.",
  unavailable: "AI help isn't available right now. Here's the built-in help instead.",
};

export async function mentorHelp(args: {
  /** Quota identity: the student's account id. */
  studentId: string | null;
  ip: string | null;
  /** null = the playground (no lesson context, no tests). */
  lessonId: string | null;
  mode: TutorMode;
  hintLevel: number | null;
  code: string | null;
  /** stdin for playground runs. */
  input?: string;
  question: string | null;
}): Promise<TutorAnswer> {
  const target = args.lessonId ? requireExercise(args.lessonId) : null;
  const lesson = target?.lesson ?? null;
  const exercise = target?.exercise ?? null;
  const hintLevel = Math.min(Math.max(args.hintLevel ?? 1, 1), 4);
  const code = args.code?.trim() ? args.code : null;
  const aiOn = aiStatus().provider !== "curated";

  // Real evidence first (no AI involved): compile and run/judge the code when it matters.
  const ev: { judged: JudgeOutcome | null; ran: ExecutionResponse | null } = { judged: null, ran: null };
  const exec = await executionStatus();
  // Curated hints are fixed text, so only an AI hint needs to see how the code actually behaves.
  const wantsEvidence = args.mode === "error" || args.mode === "review" || (args.mode === "hint" && hintLevel >= 3 && aiOn);
  if (code && wantsEvidence && exec.available) {
    try {
      if (exercise) ev.judged = await judgeExercise(exercise, code);
      else ev.ran = await execute({ language: "cpp", source: code, tests: [{ id: "run", input: args.input ?? "" }] });
    } catch (err) {
      logger.warn("mentor.evidence_failed", { err });
    }
  }
  const curated = (notice: string | null, remaining: number | null = null): TutorAnswer =>
    ({ source: "curated", text: curatedAnswer(lesson, exercise, args.mode, hintLevel, ev, Boolean(code), exec.available), notice, remaining });

  if (!aiOn) return curated(null);
  if (!lesson && (args.mode === "concept" || args.mode === "hint")) return curated(null);
  if (args.mode === "ask" && !args.question?.trim()) return { source: "curated", text: "Type your question in the box first.", notice: null, remaining: null };
  if (!args.studentId) return curated("AI help needs you to be signed in (a guest account is fine). Here's the built-in help instead.");

  let claim: Awaited<ReturnType<typeof claimAIRequest>>;
  try {
    claim = await claimAIRequest(args.studentId, args.ip);
  } catch (err) {
    logger.error("mentor.quota_failed", { err });
    return curated(QUOTA_NOTICE.unavailable);
  }
  if (!claim.ok) return curated(QUOTA_NOTICE[claim.denied], claim.denied === "guest" ? 0 : null);

  const evidence = ev.judged ? judgeEvidence(ev.judged) : ev.ran ? runEvidence(ev.ran, args.input ?? "") : null;
  const reference = exercise?.solution ?? "";
  try {
    const res = await getAIProvider().lessonTutor({
      mode: args.mode, hintLevel: args.mode === "hint" ? hintLevel : null,
      lesson: lesson
        ? {
          title: lesson.title, goals: lesson.goals, summary: lesson.summary,
          conceptText: lesson.sections.map((s) => `${s.title}\n${s.body}`).join("\n\n"),
          exercisePrompt: exercise!.prompt,
          curatedHint: args.mode === "hint" ? exercise!.hints[hintLevel - 1] : null,
        }
        : { title: "Code playground", goals: [], summary: [], conceptText: "The student is experimenting freely in the playground. There is no exercise and no expected answer.", exercisePrompt: "(none — free experimentation)", curatedHint: null },
      code, question: args.question?.trim() || null, evidence, answerSummary: reference || "(no reference solution — playground)",
    });
    const text = res.value.text;
    const problem = !text ? "empty"
      : evidence?.verdict !== "ran" && claimsUnverifiedExecution(text, evidence) ? "claims unverified execution"
      : reference && revealsSolution(text, { referenceSolution: reference }) ? "reveals solution"
      : tooLong(text, 260) ? "too long" : null;
    if (problem) {
      logger.warn("mentor.guardrail_rejected", { mode: args.mode, problem });
      return curated("The AI's answer didn't meet CodeMentor's rules (for example it gave away the solution), so here's the built-in help.", await remainingAIRequests(args.studentId).catch(() => null));
    }
    return { source: "ai", text, notice: null, remaining: await remainingAIRequests(args.studentId).catch(() => null) };
  } catch (err) {
    await refundAIRequest(claim.ticket).catch((e) => logger.error("mentor.refund_failed", { err: e }));
    const message = isAppError(err) ? err.message : "The AI mentor isn't available right now.";
    if (!isAppError(err)) logger.error("mentor.ai_failed", { err });
    return curated(`${message} Here's the built-in help instead.`, await remainingAIRequests(args.studentId).catch(() => null));
  }
}

/** For the mentor panel header. */
export async function mentorStatus(studentId: string | null) {
  const s = aiStatus();
  const aiEnabled = s.provider !== "curated";
  return {
    aiEnabled,
    provider: s.provider,
    dailyLimit: aiEnabled ? config.ai.dailyRequestLimit : 0,
    remaining: aiEnabled && studentId ? await remainingAIRequests(studentId).catch(() => null) : null,
  };
}
