/**
 * Per-million-token prices used to enforce the monthly AI budget.
 *
 * Anthropic list prices (first-party API, USD, checked 2026-10-08) are built in for the current
 * models; env vars override them. OpenAI has NO built-in prices: the administrator must set
 * OPENAI_INPUT_USD_PER_MTOK / OPENAI_OUTPUT_USD_PER_MTOK for the model they configure. A paid
 * provider without a known price is treated as not configured — the budget can't be enforced
 * without one, so it fails closed.
 */
import { config, type PaidAIProviderId } from "@/server/config";

export interface Price {
  inputUsdPerMTok: number;
  outputUsdPerMTok: number;
}

const ANTHROPIC_LIST: Record<string, Price> = {
  "claude-fable-5-1": { inputUsdPerMTok: 10, outputUsdPerMTok: 50 },
  "claude-fable-5": { inputUsdPerMTok: 10, outputUsdPerMTok: 50 },
  "claude-opus-5-5": { inputUsdPerMTok: 4, outputUsdPerMTok: 20 },
  "claude-opus-5": { inputUsdPerMTok: 5, outputUsdPerMTok: 25 },
  "claude-opus-4-8": { inputUsdPerMTok: 5, outputUsdPerMTok: 25 },
  "claude-sonnet-5-5": { inputUsdPerMTok: 2, outputUsdPerMTok: 10 },
  "claude-sonnet-5": { inputUsdPerMTok: 2, outputUsdPerMTok: 10 },
  // Haiku 5.5 is $0.50 / $2.50 above 100K-token prompts; tutor prompts are capped far below that.
  "claude-haiku-5-5": { inputUsdPerMTok: 0.1, outputUsdPerMTok: 0.5 },
};

/** The price for a provider's configured model (or a specific model it reported), or null if unknown. */
export function priceFor(provider: PaidAIProviderId, model?: string | null): Price | null {
  if (provider === "claude") {
    const env = config.ai.anthropic;
    if (env.inputUsdPerMTok !== null && env.outputUsdPerMTok !== null) {
      return { inputUsdPerMTok: env.inputUsdPerMTok, outputUsdPerMTok: env.outputUsdPerMTok };
    }
    return ANTHROPIC_LIST[model ?? env.model] ?? ANTHROPIC_LIST[env.model] ?? null;
  }
  const env = config.ai.openai;
  if (env.inputUsdPerMTok !== null && env.outputUsdPerMTok !== null) {
    return { inputUsdPerMTok: env.inputUsdPerMTok, outputUsdPerMTok: env.outputUsdPerMTok };
  }
  return null;
}

export function costUsd(price: Price, inputTokens: number, outputTokens: number): number {
  return (inputTokens * price.inputUsdPerMTok + outputTokens * price.outputUsdPerMTok) / 1_000_000;
}
