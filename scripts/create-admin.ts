/**
 * Creates an ADMIN account (admin accounts can never be created through public signup).
 *   npm run admin:create -- <username>
 * The generated password is written to .data/admin-account.json (gitignored), not printed.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { getDb, schema } from "@/server/db/client";
import { normalizeUsername } from "@/server/auth/auth";

async function main() {
  const username = normalizeUsername(process.argv[2] || "admin");
  const password = crypto.randomBytes(12).toString("base64url");
  const db = await getDb();
  await db.insert(schema.users).values({ username, displayName: "Admin", passwordHash: await bcrypt.hash(password, 12), role: "ADMIN" })
    .onConflictDoUpdate({ target: schema.users.username, set: { passwordHash: await bcrypt.hash(password, 12), role: "ADMIN" } });
  await db.insert(schema.auditLog).values({ action: "admin.created", targetType: "user", details: { username } });
  const out = path.join(process.cwd(), ".data", "admin-account.json");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify({ username, password, createdAt: new Date().toISOString() }, null, 2));
  console.log(`Admin "${username}" ready. Credentials written to ${out}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
