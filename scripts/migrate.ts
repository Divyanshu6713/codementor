/**
 * `npm run db:migrate` — applies migrations (drizzle/) and syncs the curated content into the
 * configured database (DATABASE_URL, or the local PGlite in .data/). Safe to run repeatedly:
 * migrations are versioned and content sync is idempotent. Never drops or resets data.
 */
import fs from "node:fs";
import path from "node:path";

for (const file of [".env.local", ".env"]) {
  const p = path.join(process.cwd(), file);
  if (fs.existsSync(p)) process.loadEnvFile(p);
}
// This script exists to migrate, whatever the web app's AUTO_MIGRATE setting is.
process.env.AUTO_MIGRATE = "true";

import("../src/server/db/client")
  .then(({ getDb }) => getDb())
  .then(() => {
    console.log(`Migrations applied and content synced (${process.env.DATABASE_URL ? "PostgreSQL" : "local PGlite"}).`);
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
