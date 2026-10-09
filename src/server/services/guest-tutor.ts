/**
 * The lesson help panel: Explain concept · Give hint · Explain error · Review my code · Ask.
 *
 * Every mode has a curated answer that needs no AI. When an AI provider is enabled, the student
 * still has a daily quota, the monthly budget applies, and the AI only sees real evidence: for
 * hints, errors and reviews the server compiles and judges the student's code itself first, so the
 * tutor never has to guess whether it compiled or passed. If anything about the AI path fails, the
 * curated answer is returned with a short notice — the panel always answers.
 */
import type { CourseLesson } from "@/content/course";
import { aiStatus, getAIProvider } from "@/server/ai";
import { config } from "@/server/config";
import { claimsUnverifiedExecution, revealsSolution, tooLong } from "@/server/ai/guardrails";
import type { Evidence, TutorMode } from "@/server/ai/types";
import { executionStatus } from "@/server/execution/providers";
import type { JudgeOutcome } from "@/server/execution/judge";
import { isAppError } from "@/server/errors";
import { checkFeedback, explainCompilerOutput, runFeedback, type FeedbackItem } from "@/server/learning/feedback";
import { logger } from "@/server/logger";
import { claimAIRequest, refundAIRequest, remainingAIRequests, type QuotaDenied } from "./ai-quota";
import { judgeLesson, requireLesson } from "./guest";

export interface TutorAnswer {
  source: "ai" | "curated";
  text: string;
  /** Why the AI wasn't used (or other context), shown above the answer. */
  notice: string | null;
  remaining: number | null;
}

const items = (list: FeedbackItem[]) => list.map((f) => `**${f.title}**${f.line ? ` (line ${f.line})` : ""}\n\n${f.body}`).join("\n\n");

function toEvidence(o: JudgeOutcome): Evidence {
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

function curatedAnswer(lesson: CourseLesson, mode: TutorMode, hintLevel: number, outcome: JudgeOutcome | null, hadCode: boolean, canRun: boolean): string {
  switch (mode) {
    case "concept":
      return `${lesson.explainAgain}\n\n**Key points**\n\n${lesson.summary.map((s) => `- ${s}`).join("\n")}`;
    case "hint":
      return lesson.exercise.hints[Math.min(Math.max(hintLevel, 1), 4) - 1];
    case "error": {
      if (!hadCode) return "Write or paste your code in the editor first, then ask again — I'll compile it and explain any error.";
      if (!outcome) return canRun ? "I couldn't run your code just now. Press **Run** to see the compiler's message, then try again." : "Code can't be run on this server right now, so I can't see an error message. Read the lesson's *Common mistakes* section — it covers the errors beginners hit most.";
      if (outcome.compileStatus !== "success") return items(explainCompilerOutput(outcome.compileOutput, outcome.compileStatus === "rejected" ? "rejected" : "error"));
      const crash = outcome.tests.find((t) => t.status !== "ok" && t.status !== "not_run");
      if (crash) return items([runFeedback(crash.status, crash.detail)].filter((f): f is FeedbackItem => f !== null));
      return outcome.verdict === "accepted"
        ? "Your code compiles and passes every test — there's no error to explain."
        : `Your code compiles and runs without crashing, so there's no error message. The output is different from what's expected:\n\n${items(checkFeedback(outcome))}`;
    }
    case "review": {
      if (!hadCode) return "Write your code in the editor first, then ask for a review.";
      const found = outcome ? items(checkFeedback(outcome)) : "Code can't be run right now, so I can't say whether it works.";
      return `Here's what the checker found when it ran your code:\n\n${found}\n\n**Review it yourself**\n\n- Read your program top to bottom and say out loud what each line does.\n- Run it with the example input, then with your own tricky inputs (0, 1, a negative number, the largest value).\n- Compare with the lesson's worked example: which lines do the same job?`;
    }
    case "ask":
      return `The AI tutor isn't answering free-form questions right now. These may help:\n\n${lesson.explainAgain}\n\nYou can also use **Give hint** for step-by-step help with the exercise.`;
  }
}

const QUOTA_NOTICE: Record<QuotaDenied, string> = {
  guest: "You've used today's AI help. Here's the built-in help instead — AI help resets tomorrow.",
  network: "Your network has used a lot of AI help today. Here's the built-in help instead.",
  global: "CodeMentor's AI help has reached today's limit. Here's the built-in help instead.",
  unavailable: "AI help isn't available right now. Here's the built-in help instead.",
};

export async function guestTutor(args: {
  guestId: string | null;
  ip: string | null;
  lessonId: string;
  mode: TutorMode;
  hintLevel: number | null;
  code: string | null;
  question: string | null;
}): Promise<TutorAnswer> {
  const lesson = requireLesson(args.lessonId);
  const hintLevel = Math.min(Math.max(args.hintLevel ?? 1, 1), 4);
  const code = args.code?.trim() ? args.code : null;

  // Real evidence first (no AI involved): compile + judge the student's code when it matters.
  let outcome: JudgeOutcome | null = null;
  const exec = await executionStatus();
  const aiOn = aiStatus().provider !== "curated";
  // Curated hints are fixed text, so only an AI hint needs to see how the code actually behaves.
  const wantsEvidence = args.mode === "error" || args.mode === "review" || (args.mode === "hint" && hintLevel >= 3 && aiOn);
  if (code && wantsEvidence && exec.available) {
    try {
      outcome = await judgeLesson(lesson, code);
    } catch (err) {
      logger.warn("guest_tutor.judge_failed", { err });
    }
  }
  const curated = (notice: string | null, remaining: number | null = null): TutorAnswer =>
    ({ source: "curated", text: curatedAnswer(lesson, args.mode, hintLevel, outcome, Boolean(code), exec.available), notice, remaining });

  const status = aiStatus();
  if (status.provider === "curated") return curated(null);
  if (args.mode === "ask" && !args.question?.trim()) return { source: "curated", text: "Type your question in the box first.", notice: null, remaining: null };
  if (!args.guestId) return curated("AI help needs cookies to be enabled for this site. Here's the built-in help instead.");

  let claim: Awaited<ReturnType<typeof claimAIRequest>>;
  try {
    claim = await claimAIRequest(args.guestId, args.ip);
  } catch (err) {
    logger.error("guest_tutor.quota_failed", { err });
    return curated(QUOTA_NOTICE.unavailable);
  }
  if (!claim.ok) return curated(QUOTA_NOTICE[claim.denied], claim.denied === "guest" ? 0 : null);

  const evidence = outcome ? toEvidence(outcome) : null;
  try {
    const res = await getAIProvider().lessonTutor({
      mode: args.mode, hintLevel: args.mode === "hint" ? hintLevel : null,
      lesson: {
        title: lesson.title, goals: lesson.goals, summary: lesson.summary,
        conceptText: lesson.sections.map((s) => `${s.title}\n${s.body}`).join("\n\n"),
        exercisePrompt: lesson.exercise.prompt,
        curatedHint: args.mode === "hint" ? lesson.exercise.hints[hintLevel - 1] : null,
      },
      code, question: args.question?.trim() || null, evidence, answerSummary: lesson.exercise.solution,
    });
    const text = res.value.text;
    const problem = !text ? "empty"
      : claimsUnverifiedExecution(text, evidence) ? "claims unverified execution"
      : revealsSolution(text, { referenceSolution: lesson.exercise.solution }) ? "reveals solution"
      : tooLong(text, 260) ? "too long" : null;
    if (problem) {
      logger.warn("guest_tutor.guardrail_rejected", { mode: args.mode, problem });
      return curated("The AI's answer didn't meet CodeMentor's rules (for example it gave away the solution), so here's the built-in help.", await remainingAIRequests(args.guestId).catch(() => null));
    }
    return { source: "ai", text, notice: null, remaining: await remainingAIRequests(args.guestId).catch(() => null) };
  } catch (err) {
    await refundAIRequest(claim.ticket).catch((e) => logger.error("guest_tutor.refund_failed", { err: e }));
    const message = isAppError(err) ? err.message : "The AI tutor isn't available right now.";
    if (!isAppError(err)) logger.error("guest_tutor.ai_failed", { err });
    return curated(`${message} Here's the built-in help instead.`, await remainingAIRequests(args.guestId).catch(() => null));
  }
}

/** For the help panel header. */
export async function guestTutorStatus(guestId: string | null) {
  const s = aiStatus();
  const aiEnabled = s.provider !== "curated";
  return {
    aiEnabled,
    provider: s.provider,
    dailyLimit: aiEnabled ? config.ai.dailyRequestLimit : 0,
    remaining: aiEnabled && guestId ? await remainingAIRequests(guestId).catch(() => null) : null,
  };
}
