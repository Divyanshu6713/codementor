/** Python achievements: awarded only from stored evidence (the same table as the C++ ones). */
import { eq } from "drizzle-orm";
import { getPyExercise } from "@/content/python";
import { schema, type Tx } from "@/server/db/client";
import { achievementCodes } from "@/server/services/achievements";
import type { PyState } from "./state";

export { PY_ACHIEVEMENTS } from "@/content/python/achievements";


export async function checkPyAchievements(db: Tx, studentId: string, s: PyState): Promise<{ code: string; title: string }[]> {
  const have = new Set((await db.select({ code: schema.studentAchievements.code }).from(schema.studentAchievements).where(eq(schema.studentAchievements.studentId, studentId))).map((r) => r.code));
  const passedDebug = await db.select({ key: schema.pyExerciseProgress.exerciseKey, passedAt: schema.pyExerciseProgress.passedAt })
    .from(schema.pyExerciseProgress).where(eq(schema.pyExerciseProgress.studentId, studentId));
  const conditions: Record<string, boolean> = {
    PY_HELLO: s.coding.exercisesPassed > 0,
    PY_FIRST_LESSON: s.totals.lessonsDone > 0,
    PY_FIRST_MODULE: s.totals.modulesDone > 0,
    PY_LEVEL_1: Boolean(s.levels[0]?.complete),
    PY_EXAM_ACE: s.assessments.some((a) => a.kind === "module" && a.total > 0 && a.score === a.total),
    PY_DEBUGGER: passedDebug.filter((r) => r.passedAt && getPyExercise(r.key)?.ex.kind === "debug").length >= 3,
    PY_PRACTICE_100: s.totals.questionsAnswered >= 100,
    PY_STREAK_7: s.streak.best >= 7,
    PY_PROJECT: s.projects.portfolioDone.length > 0,
  };
  const earned = Object.entries(conditions).filter(([code, ok]) => ok && !have.has(code)).map(([code]) => code);
  if (!earned.length) return [];
  await db.insert(schema.studentAchievements).values(earned.map((code) => ({ studentId, code }))).onConflictDoNothing();
  return (await achievementCodes(db, earned)).map((a) => ({ code: a.code, title: a.title }));
}
