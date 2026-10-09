import path from "node:path";
import fs from "node:fs";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "./schema";
import { config } from "@/server/config";

export type DB = PgDatabase<PgQueryResultHKT, typeof schema>;
/** A database handle or an open transaction - services accept either. */
export type Tx = Parameters<Parameters<DB["transaction"]>[0]>[0] | DB;

interface DbHolder {
  db: DB | null;
  ready: Promise<DB> | null;
  close: (() => Promise<void>) | null;
}

// Survives module re-evaluation in dev (HMR) so we never open PGlite twice.
const holder: DbHolder = ((globalThis as Record<string, unknown>).__cmkDb as DbHolder) ??
  ((globalThis as Record<string, unknown>).__cmkDb = { db: null, ready: null, close: null });

export const MIGRATIONS_FOLDER = path.join(process.cwd(), "drizzle");

/** A fresh or upgraded database always gets the canonical curriculum (idempotent, versioned). */
async function syncCanonicalContent(db: DB) {
  const { syncContent } = await import("@/server/content/sync");
  await syncContent(db);
}

async function openPglite(dataDir: string | null): Promise<{ db: DB; close: () => Promise<void> }> {
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  if (dataDir) fs.mkdirSync(dataDir, { recursive: true });
  const client = await PGlite.create({ dataDir: dataDir ?? undefined });
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  return { db: db as unknown as DB, close: () => client.close() };
}

async function openPostgres(url: string): Promise<{ db: DB; close: () => Promise<void> }> {
  const { Pool } = await import("pg");
  const { drizzle } = await import("drizzle-orm/node-postgres");
  const pool = new Pool({ connectionString: url, max: 10 });
  const db = drizzle(pool, { schema });
  if (config.autoMigrate) {
    const { migrate } = await import("drizzle-orm/node-postgres/migrator");
    await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  }
  return { db: db as unknown as DB, close: () => pool.end() };
}

/** Returns the process-wide database, opening, migrating and syncing content on first use. */
export async function getDb(): Promise<DB> {
  if (holder.db) return holder.db;
  if (!holder.ready) {
    holder.ready = (async () => {
      const opened = config.databaseUrl
        ? await openPostgres(config.databaseUrl)
        : await openPglite(path.join(config.dataDir, "pglite"));
      await syncCanonicalContent(opened.db);
      holder.db = opened.db;
      holder.close = opened.close;
      return opened.db;
    })().catch((err) => {
      holder.ready = null;
      throw err;
    });
  }
  return holder.ready;
}

/** Test helper: an isolated, migrated in-memory database. */
export async function createTestDb(): Promise<{ db: DB; close: () => Promise<void> }> {
  const opened = await openPglite(null);
  await syncCanonicalContent(opened.db);
  return opened;
}

/** Test helper: route getDb() to a specific database. */
export function setDbForTesting(db: DB | null) {
  holder.db = db;
  holder.ready = db ? Promise.resolve(db) : null;
}

export { schema };
