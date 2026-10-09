import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod";
import { config } from "@/server/config";
import { AIUnavailableError } from "@/server/errors";
import { logger } from "@/server/logger";
import { makeLLMProvider, type StructuredBackend } from "./llm-provider";
import { reportUsage } from "./metering";

let client: Anthropic | null = null;
// One SDK retry for transient errors (429/5xx/connection); our own loop retries once on invalid output.
const getClient = () => (client ??= new Anthropic({ maxRetries: 1, timeout: config.ai.timeoutMs }));

/**
 * One structured call: parse → zod-validate → one retry on invalid output → controlled error.
 * Server-side fallback re-runs a policy decline on Anthropic's recommended model. Every response's
 * token usage is reported to the spend ledger, retries included.
 */
export const claudeBackend: StructuredBackend = {
  id: "claude",
  async structured<T extends z.ZodType>(opts: { schema: T; system: string; user: string; effort: "low" | "medium" | "high"; maxTokens: number }) {
    let lastError: unknown;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await getClient().beta.messages.parse({
          model: config.ai.anthropic.model,
          max_tokens: opts.maxTokens,
          betas: ["server-side-fallback-2026-07-01"],
          fallbacks: "default",
          output_config: { format: zodOutputFormat(opts.schema), effort: opts.effort },
          system: opts.system,
          messages: [{ role: "user", content: opts.user }],
        });
        reportUsage({ model: res.model, inputTokens: res.usage.input_tokens, outputTokens: res.usage.output_tokens });
        if (res.stop_reason === "refusal") throw new AIUnavailableError("The AI tutor couldn't help with that request.");
        const parsed = opts.schema.safeParse(res.parsed_output);
        if (!parsed.success) {
          lastError = parsed.error;
          continue;
        }
        return { value: parsed.data as z.infer<T>, usage: { model: res.model, inputTokens: res.usage.input_tokens, outputTokens: res.usage.output_tokens } };
      } catch (err) {
        if (err instanceof AIUnavailableError) throw err;
        if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
          throw new AIUnavailableError("The AI provider rejected the API key. Check ANTHROPIC_API_KEY.");
        }
        if (err instanceof Anthropic.RateLimitError) throw new AIUnavailableError("The AI tutor is busy right now. Try again in a minute.");
        if (err instanceof Anthropic.BadRequestError) throw new AIUnavailableError("The AI tutor couldn't process this request.");
        if (err instanceof Anthropic.APIConnectionError) throw new AIUnavailableError("The AI tutor couldn't be reached. Try again in a minute.");
        // Any other API error has already had the SDK's single retry — don't multiply the cost.
        if (err instanceof Anthropic.APIError) throw new AIUnavailableError("The AI tutor isn't available right now.");
        lastError = err;
      }
    }
    logger.error("ai.structured_failed", { provider: "claude", err: lastError instanceof Error ? lastError.message : "invalid output" });
    throw new AIUnavailableError("The AI response couldn't be validated.");
  },
};

export const claudeProvider = makeLLMProvider(claudeBackend);
