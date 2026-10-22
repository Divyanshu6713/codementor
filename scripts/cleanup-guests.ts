/**
 * `npm run cleanup:guests` — lists abandoned guest accounts: guests with no valid session left
 * (their cookie expired or was cleared, so nobody can ever open them again) and older than
 * --days (default 30). DRY RUN by default; pass --confirm to delete them.
 *
 * Only accounts that are still guests are touched — claimed accounts (with a username) never are.
 */
import fs from "node:fs";
import path from "node:path";

for (const file of [".env.local", ".env"]) {
  const p = path.join(process.cwd(), file);
  if (fs.existsSync(p)) process.loadEnvFile(p);
}

async function main() {
  const { and, eq, gt, inArray, lt, notExists } = await import("drizzle-orm");
  const { getDb, schema } = await import("../src/server/db/client");
  const daysArg = process.argv.find((a) => a.startsWith("--days="));
  const days = Math.max(1, Number(daysArg?.split("=")[1] ?? 30));
  const confirm = process.argv.includes("--confirm");
  const db = await getDb();
  const cutoff = new Date(Date.now() - days * 86_400_000);
  const stale = await db.select({ id: schema.users.id }).from(schema.users).where(and(
    eq(schema.users.isGuest, true),
    lt(schema.users.createdAt, cutoff),
    notExists(db.select({ id: schema.authSessions.id }).from(schema.authSessions)
      .where(and(eq(schema.authSessions.userId, schema.users.id), gt(schema.authSessions.expiresAt, new Date())))),
  ));
  console.log(`${stale.length} abandoned guest account(s) older than ${days} days.`);
  if (!confirm || !stale.length) {
    if (stale.length) console.log("Dry run — nothing deleted. Re-run with --confirm to delete them.");
    process.exit(0);
  }
  const ids = stale.map((s) => s.id);
  for (let i = 0; i < ids.length; i += 500) {
    await db.delete(schema.users).where(inArray(schema.users.id, ids.slice(i, i + 500)));
  }
  console.log(`Deleted ${ids.length} guest account(s) and their progress.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
