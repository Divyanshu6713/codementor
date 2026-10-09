import { aiStatus } from "@/server/ai";
import { getDb } from "@/server/db/client";
import { executionStatus } from "@/server/execution/providers";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * Liveness/readiness for uptime monitors. Reports only coarse states — no versions, hosts,
 * spend figures or configuration values.
 */
export async function GET() {
  const started = Date.now();
  const db = await getDb().then((d) => d.execute(sql`select 1`)).then(() => "ok", () => "error");
  const exec = await executionStatus().catch(() => null);
  const ai = aiStatus();
  const ok = db === "ok";
  return Response.json(
    { ok, db, execution: exec?.available ? "available" : "unavailable", ai: ai.provider === "curated" ? "curated" : "enabled", ms: Date.now() - started },
    { status: ok ? 200 : 503, headers: { "cache-control": "no-store" } },
  );
}
