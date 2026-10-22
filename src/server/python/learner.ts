/** Python learner settings (guided order vs everything open), explicit unlocks and active time. */
import { eq, sql } from "drizzle-orm";
import { getPyLesson } from "@/content/python";
import { getDb, schema } from "@/server/db/client";
import { NotFoundError } from "@/server/errors";

export async function setGuided(studentId: string, guided: boolean) {
  const db = await getDb();
  await db.insert(schema.pySettings).values({ studentId, guided })
    .onConflictDoUpdate({ target: schema.pySettings.studentId, set: { guided, updatedAt: new Date() } });
}

/** The learner explicitly chose to open a lesson before finishing its prerequisites. */
export async function unlockLesson(studentId: string, lessonId: string) {
  if (!getPyLesson(lessonId)) throw new NotFoundError("That lesson");
  const db = await getDb();
  const row = await db.query.pySettings.findFirst({ where: eq(schema.pySettings.studentId, studentId) });
  const unlocked = [...new Set([...(row?.unlocked ?? []), lessonId])].slice(-500);
  await db.insert(schema.pySettings).values({ studentId, unlocked })
    .onConflictDoUpdate({ target: schema.pySettings.studentId, set: { unlocked, updatedAt: new Date() } });
}

/**
 * Active time: Python pages send a heartbeat every 30 s while the tab is visible and the learner
 * has interacted in the last minute. Each heartbeat adds at most 30 s; the route rate-limits them.
 */
export async function addActiveTime(studentId: string, seconds: number, now = new Date()) {
  const s = Math.max(0, Math.min(30, Math.round(seconds)));
  if (!s) return;
  const db = await getDb();
  const day = now.toISOString().slice(0, 10);
  await db.insert(schema.pyActivity).values({ studentId, day, seconds: s })
    .onConflictDoUpdate({ target: [schema.pyActivity.studentId, schema.pyActivity.day], set: { seconds: sql`least(${schema.pyActivity.seconds} + ${s}, 86400)` } });
}
