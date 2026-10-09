/** Applies migrations and syncs canonical content into the configured database. */
import { getDb } from "@/server/db/client";

getDb()
  .then(() => {
    console.log("Migrations applied and content synced.");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
