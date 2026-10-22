/**
 * Spaced revision for Python lessons (a Leitner schedule). A lesson enters the schedule when it is
 * completed; a good revision round moves it to a longer interval, a weak one brings it back to
 * tomorrow, and a wrong answer elsewhere makes it due again now.
 */
import { and, eq } from "drizzle-orm";
import { schema, type Tx } from "@/server/db/client";
import { REVIEW_INTERVALS_DAYS } from "./state";

const DAY = 86_400_000;

export async function scheduleFirstReview(db: Tx, studentId: string, lessonId: string, now = new Date()) {
  await db.insert(schema.pyReviews).values({ studentId, lessonId, box: 1, dueAt: new Date(now.getTime() + REVIEW_INTERVALS_DAYS[0] * DAY) })
    .onConflictDoNothing();
}

/** A wrong answer on a lesson already in the schedule makes it due now (it stays in its box until revised). */
export async function markDueNow(db: Tx, studentId: string, lessonId: string, now = new Date()) {
  const row = await db.query.pyReviews.findFirst({ where: and(eq(schema.pyReviews.studentId, studentId), eq(schema.pyReviews.lessonId, lessonId)) });
  if (row && row.dueAt > now) {
    await db.update(schema.pyReviews).set({ dueAt: now, updatedAt: now }).where(and(eq(schema.pyReviews.studentId, studentId), eq(schema.pyReviews.lessonId, lessonId)));
  }
}

/** After a revision round: ≥ 2/3 correct moves up a box; otherwise back to box 1 (due tomorrow). */
export async function recordRevisionRound(db: Tx, studentId: string, lessonId: string, correct: number, total: number, now = new Date()) {
  const row = await db.query.pyReviews.findFirst({ where: and(eq(schema.pyReviews.studentId, studentId), eq(schema.pyReviews.lessonId, lessonId)) });
  const good = total > 0 && correct / total >= 2 / 3;
  const box = good ? Math.min((row?.box ?? 0) + 1, REVIEW_INTERVALS_DAYS.length) : 1;
  const dueAt = new Date(now.getTime() + REVIEW_INTERVALS_DAYS[box - 1] * DAY);
  await db.insert(schema.pyReviews).values({ studentId, lessonId, box, dueAt, lastResult: good })
    .onConflictDoUpdate({ target: [schema.pyReviews.studentId, schema.pyReviews.lessonId], set: { box, dueAt, lastResult: good, updatedAt: now } });
  return { good, box, dueAt, days: REVIEW_INTERVALS_DAYS[box - 1] };
}
