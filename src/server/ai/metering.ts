/**
 * Cost and capacity controls for paid AI providers. Every paid call goes through `metered()`:
 *
 *   1. Concurrency gate — at most AI_MAX_CONCURRENT calls in flight per web instance, a bounded
 *      queue behind them, and an immediate "busy" beyond that (no unbounded pile-up).
 *   2. Budget check — this month's recorded spend + spend reserved by in-flight calls + a
 *      worst-case estimate for this call must stay within AI_MONTHLY_BUDGET_USD, or the call is
 *      refused before anything is sent to the provider.
 *   3. Ledger — every model response's real token usage (including retries) is priced and written
 *      to `ai_spend`, which is what the next budget check reads.
 *
 * Limitation (documented in docs/COST-CONTROLS.md): reservations live in process memory, so with N
 * web instances the cap can be overshot by at most N × AI_MAX_CONCURRENT worst-case calls.
 */
import { AsyncLocalStorage } from "node:async_hooks";
import { gte, sql } from "drizzle-orm";
import { config, type PaidAIProviderId } from "@/server/config";
import { getDb, schema } from "@/server/db/client";
import { AppError } from "@/server/errors";
import { logger } from "@/server/logger";
import { costUsd, priceFor } from "./pricing";

export class AIBudgetExhaustedError extends AppError {
  constructor() {
    super("The AI tutor has reached this month's budget. Lessons, hints and code checking still work.", 503, "ai_budget_exhausted");
  }
}

export class AIBusyError extends AppError {
  constructor() {
    super("The AI tutor is busy right now. Please try again in a minute.", 503, "ai_busy");
  }
}

interface MeterContext {
  provider: PaidAIProviderId;
  purpose: string;
  usages: { model: string | null; inputTokens: number; outputTokens: number }[];
}

const als = new AsyncLocalStorage<MeterContext>();

/** Provider backends call this after EVERY model response, so retries are billed too. */
export function reportUsage(u: { model: string | null; inputTokens: number; outputTokens: number }) {
  als.getStore()?.usages.push(u);
}

// ── Concurrency gate ──
const gate = { running: 0, waiting: [] as (() => void)[] };

async function admit<T>(fn: () => Promise<T>): Promise<T> {
  if (gate.running >= config.ai.maxConcurrent) {
    if (gate.waiting.length >= config.ai.maxQueued) throw new AIBusyError();
    await new Promise<void>((resolve) => gate.waiting.push(resolve));
  }
  gate.running++;
  try {
    return await fn();
  } finally {
    gate.running--;
    gate.waiting.shift()?.();
  }
}

// ── Spend ──
let reservedUsd = 0;
/** Spend that couldn't be written to the ledger (DB down) — still counted by this process. */
let unrecordedUsd = 0;
let cachedSpend: { month: string; at: number; usd: number } | null = null;

const monthKey = (d = new Date()) => `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}`;
const monthStart = (d = new Date()) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));

/** Spend recorded this calendar month (UTC), cached for a few seconds. */
export async function monthSpendUsd(): Promise<number> {
  const month = monthKey();
  if (cachedSpend && cachedSpend.month === month && Date.now() - cachedSpend.at < 10_000) return cachedSpend.usd + unrecordedUsd;
  const db = await getDb();
  const [row] = await db.select({ usd: sql<number>`coalesce(sum(${schema.aiSpend.costUsd}), 0)::float` })
    .from(schema.aiSpend).where(gte(schema.aiSpend.createdAt, monthStart()));
  cachedSpend = { month, at: Date.now(), usd: Number(row?.usd ?? 0) };
  return cachedSpend.usd + unrecordedUsd;
}

/** Worst-case cost of one call: generous input estimate, full output cap, and one retry. */
export function worstCaseUsd(provider: PaidAIProviderId, inputChars: number, maxOutputTokens: number): number | null {
  const price = priceFor(provider);
  if (!price) return null;
  const inputTokens = Math.ceil(inputChars / 3) + 2000; // ~3 chars/token for code-heavy text, plus system prompt
  return 2 * costUsd(price, inputTokens, maxOutputTokens);
}

export async function budgetStatus() {
  const spent = await monthSpendUsd().catch(() => null);
  return { monthlyBudgetUsd: config.ai.monthlyBudgetUsd, spentUsd: spent, reservedUsd, month: monthKey() };
}

/** Runs one paid AI call under the concurrency gate, the budget check and the spend ledger. */
export async function metered<T>(opts: {
  provider: PaidAIProviderId;
  purpose: string;
  inputChars: number;
  maxOutputTokens: number;
  call: () => Promise<T>;
}): Promise<T> {
  const estimate = worstCaseUsd(opts.provider, opts.inputChars, opts.maxOutputTokens);
  if (estimate === null || config.ai.monthlyBudgetUsd <= 0) throw new AIBudgetExhaustedError();
  return admit(async () => {
    const spent = await monthSpendUsd();
    if (spent + reservedUsd + estimate > config.ai.monthlyBudgetUsd) {
      logger.warn("ai.budget_refused", { spent, reservedUsd, estimate, budget: config.ai.monthlyBudgetUsd });
      throw new AIBudgetExhaustedError();
    }
    reservedUsd += estimate;
    const ctx: MeterContext = { provider: opts.provider, purpose: opts.purpose, usages: [] };
    try {
      return await als.run(ctx, opts.call);
    } finally {
      try {
        await recordSpend(ctx);
      } finally {
        reservedUsd = Math.max(0, reservedUsd - estimate);
      }
    }
  });
}

async function recordSpend(ctx: MeterContext) {
  if (!ctx.usages.length) return;
  const rows = ctx.usages.map((u) => {
    // A provider can't report usage without a price here (metered() checked), but be defensive.
    const price = priceFor(ctx.provider, u.model) ?? { inputUsdPerMTok: 0, outputUsdPerMTok: 0 };
    return { provider: ctx.provider, model: u.model, purpose: ctx.purpose, inputTokens: u.inputTokens, outputTokens: u.outputTokens, costUsd: costUsd(price, u.inputTokens, u.outputTokens) };
  });
  const total = rows.reduce((s, r) => s + r.costUsd, 0);
  if (cachedSpend && cachedSpend.month === monthKey()) cachedSpend.usd += total;
  try {
    const db = await getDb();
    await db.insert(schema.aiSpend).values(rows);
  } catch (err) {
    if (cachedSpend) cachedSpend.usd -= total;
    unrecordedUsd += total;
    logger.error("ai.spend_record_failed", { err, total });
  }
}

/** Test helper. */
export function resetMeteringForTesting() {
  reservedUsd = 0;
  unrecordedUsd = 0;
  cachedSpend = null;
  gate.running = 0;
  gate.waiting.length = 0;
}
