/**
 * Layered daily AI quotas for anonymous students, enforced in the database (so they survive
 * restarts and are shared by every web instance):
 *
 *   1. per guest   — AI_DAILY_REQUEST_LIMIT (default 10), keyed by the signed guest cookie;
 *   2. per address — AI_IP_DAILY_LIMIT (default 300), a backstop against clearing cookies that is
 *                    deliberately generous so a hostel or lab behind one public IP isn't blocked;
 *                    skipped when the address can't be trusted (TRUST_PROXY unset);
 *   3. global      — AI_GLOBAL_DAILY_LIMIT across the whole app.
 *
 * Each layer is an atomic conditional increment, so concurrent requests can't overshoot. If a later
 * layer refuses, earlier increments are rolled back. A request whose AI call then fails is refunded.
 * The monthly money budget is separate (ai/metering.ts) and always applies on top.
 */
import { and, eq, sql } from "drizzle-orm";
import { config } from "@/server/config";
import { getDb, schema } from "@/server/db/client";
import { quotaKey } from "@/server/guest/identity";

export type QuotaDenied = "guest" | "network" | "global" | "unavailable";

/** The quota day, e.g. "2026-10-09", rolling over at local midnight for the configured offset. */
export function quotaDay(now = new Date()): string {
  return new Date(now.getTime() + config.ai.quotaTzOffsetMinutes * 60_000).toISOString().slice(0, 10);
}

async function tryIncrement(key: string, day: string, limit: number): Promise<boolean> {
  if (limit <= 0) return false;
  const db = await getDb();
  const res = await db.execute(sql`
    insert into ai_quota (key, day, count) values (${key}, ${day}, 1)
    on conflict (key, day) do update set count = ai_quota.count + 1 where ai_quota.count < ${limit}
    returning count`);
  return ((res as unknown as { rows: unknown[] }).rows ?? []).length > 0;
}

async function decrement(key: string, day: string) {
  const db = await getDb();
  await db.update(schema.aiQuota).set({ count: sql`greatest(${schema.aiQuota.count} - 1, 0)` })
    .where(and(eq(schema.aiQuota.key, key), eq(schema.aiQuota.day, day)));
}

export interface QuotaTicket {
  keys: string[];
  day: string;
}

/** Claims one AI request for this guest, or says which layer refused. */
export async function claimAIRequest(guestId: string, ip: string | null): Promise<{ ok: true; ticket: QuotaTicket } | { ok: false; denied: QuotaDenied }> {
  const day = quotaDay();
  const guestKey = quotaKey("g", guestId);
  if (!guestKey) return { ok: false, denied: "unavailable" };
  const layers: { key: string; limit: number; denied: QuotaDenied }[] = [{ key: guestKey, limit: config.ai.dailyRequestLimit, denied: "guest" }];
  const ipKey = ip ? quotaKey("ip", ip, day) : null;
  if (ipKey) layers.push({ key: ipKey, limit: config.ai.ipDailyLimit, denied: "network" });
  layers.push({ key: "global", limit: config.ai.globalDailyLimit, denied: "global" });

  const claimed: string[] = [];
  for (const layer of layers) {
    if (!(await tryIncrement(layer.key, day, layer.limit))) {
      for (const k of claimed) await decrement(k, day);
      return { ok: false, denied: layer.denied };
    }
    claimed.push(layer.key);
  }
  return { ok: true, ticket: { keys: claimed, day } };
}

/** Gives a claimed request back (the AI call failed, so it shouldn't count against the student). */
export async function refundAIRequest(ticket: QuotaTicket) {
  for (const k of ticket.keys) await decrement(k, ticket.day);
}

/** How many AI requests this guest has left today (for display only — enforcement is claimAIRequest). */
export async function remainingAIRequests(guestId: string): Promise<number> {
  const key = quotaKey("g", guestId);
  if (!key) return 0;
  const db = await getDb();
  const row = await db.query.aiQuota.findFirst({ where: and(eq(schema.aiQuota.key, key), eq(schema.aiQuota.day, quotaDay())) });
  return Math.max(0, config.ai.dailyRequestLimit - (row?.count ?? 0));
}
