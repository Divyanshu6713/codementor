/**
 * One-time local setup: creates .env.local with random local secrets (never committed).
 * Existing values are kept, so it is safe to run again.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const file = path.join(process.cwd(), ".env.local");
const existing = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
const lines = existing.split(/\r?\n/).filter(Boolean);
const has = (key: string) => lines.some((l) => l.startsWith(`${key}=`));
const add = (key: string, value: string) => {
  if (!has(key)) lines.push(`${key}=${value}`);
};

add("SANDBOX_TOKEN", crypto.randomBytes(32).toString("base64url"));
add("EXECUTION_PROVIDER", "sandbox-worker");
add("SANDBOX_URL", "http://127.0.0.1:3410");
add("GUEST_SECRET", crypto.randomBytes(32).toString("base64url"));
fs.writeFileSync(file, `${lines.join("\n")}\n`);
console.log(`.env.local ready (${lines.length} settings). Start everything with \`npm run dev\` (web on :3400 + sandbox worker on :3410).`);
console.log("AI help is off (curated mode) until you set AI_PROVIDER and a key — see .env.example.");
