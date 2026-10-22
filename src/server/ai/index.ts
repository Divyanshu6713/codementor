/**
 * Central AI service. React components and route handlers never call a model directly — they go
 * through these functions, which choose the provider, record usage metadata (never content),
 * apply guardrails, and fall back to curated content when AI output is unusable.
 */
import { config, type PaidAIProviderId } from "@/server/config";
import { getDb, schema } from "@/server/db/client";
import { logger } from "@/server/logger";
import { claudeProvider } from "./claude";
import { curatedProvider } from "./curated";
import { openaiProvider } from "./openai";
import { claimsUnverifiedExecution, revealsSolution, tooLong } from "./guardrails";
import { priceFor } from "./pricing";
import { PROMPT_VERSIONS } from "./prompts";
import { claimAIRequest, claimAutoAI, refundAIRequest } from "@/server/services/ai-quota";
import { RateLimitError } from "@/server/errors";
import type {
  AIProvider, AIResult, ExplanationEvalRequest, HintRequest, MistakeRequest, QuestionGenRequest, SimplifyRequest, TutorRequest,
} from "./types";

let override: AIProvider | null = null;
/** Tests inject fixture providers. */
export function setAIProviderForTesting(p: AIProvider | null) {
  override = p;
}

/** Why a paid provider can't be used right now, or null when it is fully configured. */
export function providerProblem(id: PaidAIProviderId): string | null {
  if (config.ai.monthlyBudgetUsd <= 0) return "AI_MONTHLY_BUDGET_USD is 0";
  if (id === "claude") {
    if (!config.ai.anthropic.keyPresent) return "ANTHROPIC_API_KEY is not set";
    if (!priceFor("claude")) return `no price known for ${config.ai.anthropic.model} (set ANTHROPIC_INPUT_USD_PER_MTOK and ANTHROPIC_OUTPUT_USD_PER_MTOK)`;
    return null;
  }
  if (!config.ai.openai.keyPresent) return "OPENAI_API_KEY is not set";
  if (!config.ai.openai.model) return "OPENAI_MODEL is not set";
  if (!priceFor("openai")) return "OPENAI_INPUT_USD_PER_MTOK and OPENAI_OUTPUT_USD_PER_MTOK are not set";
  return null;
}

const PAID: Record<PaidAIProviderId, AIProvider> = { claude: claudeProvider, openai: openaiProvider };

/**
 * Picks the provider from administrator configuration only. An explicitly selected provider that
 * isn't usable means curated mode — it never silently switches to the other paid provider.
 */
function resolve(): { provider: AIProvider; reason: string | null } {
  const setting = config.ai.provider;
  if (setting === "curated") return { provider: curatedProvider, reason: null };
  if (setting === "claude" || setting === "openai") {
    const problem = providerProblem(setting);
    return problem ? { provider: curatedProvider, reason: `${setting} selected but ${problem}` } : { provider: PAID[setting], reason: null };
  }
  const problems: string[] = [];
  for (const id of config.ai.autoOrder) {
    const problem = providerProblem(id);
    if (!problem) return { provider: PAID[id], reason: null };
    problems.push(`${id}: ${problem}`);
  }
  return { provider: curatedProvider, reason: problems.length ? `auto: no provider ready (${problems.join("; ")})` : "auto: AI_AUTO_ORDER lists no providers" };
}

export function getAIProvider(): AIProvider {
  return override ?? resolve().provider;
}

export function aiStatus() {
  const p = getAIProvider();
  const model = p.id === "claude" ? config.ai.anthropic.model : p.id === "openai" ? config.ai.openai.model : null;
  return { setting: config.ai.provider, provider: p.id, conversational: p.conversational, model, reason: override ? null : resolve().reason };
}

type Purpose = keyof typeof PROMPT_VERSIONS;

async function record(studentId: string | null, purpose: Purpose, provider: string, started: number, status: "ok" | "invalid_output" | "guardrail_rejected" | "error", usage?: AIResult<unknown>["usage"]) {
  try {
    const db = await getDb();
    await db.insert(schema.aiInteractions).values({
      studentId, purpose, provider, model: usage?.model ?? null, promptVersion: PROMPT_VERSIONS[purpose],
      inputTokens: usage?.inputTokens ?? null, outputTokens: usage?.outputTokens ?? null, latencyMs: Date.now() - started, status,
    });
  } catch (err) {
    logger.warn("ai.record_failed", { err });
  }
}

/** Runs an AI call; on error or guardrail rejection returns the curated fallback instead. */
async function guarded<T>(opts: {
  studentId: string | null;
  purpose: Purpose;
  call: (p: AIProvider) => Promise<AIResult<T> | null>;
  check?: (value: T) => string | null;
  fallback: () => Promise<AIResult<T> | null>;
}): Promise<AIResult<T> | null> {
  const p = getAIProvider();
  if (p.id === "curated") return opts.fallback();
  // Paid calls the engine makes on a student's behalf have their own daily cap (tests inject fixtures).
  if (!override && opts.studentId && !(await claimAutoAI(opts.studentId).catch(() => false))) return opts.fallback();
  const started = Date.now();
  try {
    const res = await opts.call(p);
    if (!res) return opts.fallback();
    const problem = opts.check?.(res.value);
    if (problem) {
      logger.warn("ai.guardrail_rejected", { purpose: opts.purpose, problem });
      await record(opts.studentId, opts.purpose, p.id, started, "guardrail_rejected", res.usage);
      return opts.fallback();
    }
    await record(opts.studentId, opts.purpose, p.id, started, "ok", res.usage);
    return res;
  } catch (err) {
    logger.warn("ai.call_failed", { purpose: opts.purpose, err });
    await record(opts.studentId, opts.purpose, p.id, started, "error");
    return opts.fallback();
  }
}

export async function aiHint(studentId: string, req: HintRequest, leakCheck: { referenceSolution?: string | null; answerTexts?: string[] }) {
  return (await guarded({
    studentId, purpose: "hint",
    call: (p) => p.generateHint(req),
    check: (v) => {
      if (!v.text) return "empty";
      if (claimsUnverifiedExecution(v.text, req.evidence)) return "claims unverified execution";
      // Level 4 may show structure, but never the finished answer.
      if (revealsSolution(v.text, leakCheck)) return "reveals solution";
      if (tooLong(v.text, req.level >= 3 ? 140 : 70)) return "too long";
      return null;
    },
    fallback: () => curatedProvider.generateHint(req),
  }))!;
}

export async function aiMistakeExplanation(studentId: string, req: MistakeRequest, leakCheck: { referenceSolution?: string | null; answerTexts?: string[] }) {
  return (await guarded({
    studentId, purpose: "mistake",
    call: (p) => p.analyzeMistake(req),
    check: (v) => {
      const all = `${v.explanation} ${v.guidingQuestion ?? ""}`;
      if (claimsUnverifiedExecution(all, req.evidence)) return "claims unverified execution";
      if (revealsSolution(all, leakCheck)) return "reveals solution";
      if (tooLong(all, 120)) return "too long";
      return null;
    },
    fallback: () => curatedProvider.analyzeMistake(req),
  }))!;
}

export async function aiEvaluateExplanation(studentId: string, req: ExplanationEvalRequest) {
  return guarded({ studentId, purpose: "explanationEval", call: (p) => p.evaluateExplanation(req), fallback: async () => null });
}

export async function aiSimplify(studentId: string, req: SimplifyRequest) {
  return guarded({
    studentId, purpose: "simplify", call: (p) => p.simplifyExplanation(req),
    check: (v) => (tooLong(v.text, 350) ? "too long" : null),
    fallback: async () => null,
  });
}

/** Free-form chat: no curated fallback exists, so errors propagate as "not configured/unavailable". */
export async function aiTutorReply(studentId: string, req: TutorRequest, leakCheck: { referenceSolution?: string | null; answerTexts?: string[] }) {
  const p = getAIProvider();
  const started = Date.now();
  // Chat messages count against the student's daily AI requests (same quota as the mentor panel).
  let ticket: { keys: string[]; day: string } | null = null;
  if (p.id !== "curated" && !override) {
    const claim = await claimAIRequest(studentId, null);
    if (!claim.ok) throw new RateLimitError("You've used today's AI help. Hints and lessons still work — AI help resets tomorrow.");
    ticket = claim.ticket;
  }
  try {
    const res = await p.tutorReply(req);
    const evidence = req.questionContext?.evidence ?? null;
    if (claimsUnverifiedExecution(res.value.reply, evidence) || revealsSolution(res.value.reply, leakCheck)) {
      await record(studentId, "tutor", p.id, started, "guardrail_rejected", res.usage);
      return {
        source: "ai" as const,
        value: { reply: "Let's work it out together rather than me giving it away. What do you think the program does on its first step? Try running it, and tell me what you see." },
      };
    }
    await record(studentId, "tutor", p.id, started, "ok", res.usage);
    return res;
  } catch (err) {
    if (p.id !== "curated") await record(studentId, "tutor", p.id, started, "error");
    if (ticket) await refundAIRequest(ticket).catch(() => undefined);
    throw err;
  }
}

export async function aiGenerateQuestions(req: QuestionGenRequest) {
  const p = getAIProvider();
  const started = Date.now();
  try {
    const res = await p.generateQuestions(req);
    await record(null, "questionGen", p.id, started, "ok", res.usage);
    return res;
  } catch (err) {
    if (p.id !== "curated") await record(null, "questionGen", p.id, started, "error");
    throw err;
  }
}
