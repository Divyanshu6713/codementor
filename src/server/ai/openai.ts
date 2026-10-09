import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { z } from "zod";
import { config } from "@/server/config";
import { AIUnavailableError } from "@/server/errors";
import { logger } from "@/server/logger";
import { makeLLMProvider, type StructuredBackend } from "./llm-provider";
import { reportUsage } from "./metering";

let client: OpenAI | null = null;
const getClient = () => (client ??= new OpenAI({ maxRetries: 1, timeout: config.ai.timeoutMs }));

/**
 * OpenAI backend using the Responses API with structured outputs. The model is whatever
 * OPENAI_MODEL names — there is deliberately no default. Responses are not stored by OpenAI
 * (`store: false`). Every response's token usage goes to the spend ledger, retries included.
 */
export const openaiBackend: StructuredBackend = {
  id: "openai",
  async structured<T extends z.ZodType>(opts: { schema: T; system: string; user: string; effort: "low" | "medium" | "high"; maxTokens: number }) {
    const model = config.ai.openai.model;
    if (!model) throw new AIUnavailableError("The OpenAI model isn't configured (OPENAI_MODEL).");
    let lastError: unknown;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await getClient().responses.parse({
          model,
          instructions: opts.system,
          input: opts.user,
          text: { format: zodTextFormat(opts.schema, "reply") },
          max_output_tokens: opts.maxTokens,
          store: false,
          ...(config.ai.openai.reasoningEffort ? { reasoning: { effort: config.ai.openai.reasoningEffort as "low" } } : {}),
        });
        const usage = { model: res.model ?? model, inputTokens: res.usage?.input_tokens ?? 0, outputTokens: res.usage?.output_tokens ?? 0 };
        reportUsage(usage);
        if (res.status === "incomplete") {
          lastError = new Error(`incomplete: ${res.incomplete_details?.reason ?? "unknown"}`);
          continue;
        }
        const parsed = opts.schema.safeParse(res.output_parsed);
        if (!parsed.success) {
          // A refusal comes back as a refusal content item with no parsed output.
          const refused = res.output.some((o) => o.type === "message" && o.content.some((c) => c.type === "refusal"));
          if (refused) throw new AIUnavailableError("The AI tutor couldn't help with that request.");
          lastError = parsed.error;
          continue;
        }
        return { value: parsed.data as z.infer<T>, usage };
      } catch (err) {
        if (err instanceof AIUnavailableError) throw err;
        if (err instanceof OpenAI.AuthenticationError || err instanceof OpenAI.PermissionDeniedError) {
          throw new AIUnavailableError("The AI provider rejected the API key. Check OPENAI_API_KEY.");
        }
        if (err instanceof OpenAI.RateLimitError) throw new AIUnavailableError("The AI tutor is busy right now. Try again in a minute.");
        if (err instanceof OpenAI.BadRequestError || err instanceof OpenAI.NotFoundError) {
          throw new AIUnavailableError("The AI tutor couldn't process this request. (Check OPENAI_MODEL.)");
        }
        if (err instanceof OpenAI.APIConnectionError) throw new AIUnavailableError("The AI tutor couldn't be reached. Try again in a minute.");
        // Any other API error has already had the SDK's single retry — don't multiply the cost.
        if (err instanceof OpenAI.APIError) throw new AIUnavailableError("The AI tutor isn't available right now.");
        lastError = err;
      }
    }
    logger.error("ai.structured_failed", { provider: "openai", err: lastError instanceof Error ? lastError.message : "invalid output" });
    throw new AIUnavailableError("The AI response couldn't be validated.");
  },
};

export const openaiProvider = makeLLMProvider(openaiBackend);
