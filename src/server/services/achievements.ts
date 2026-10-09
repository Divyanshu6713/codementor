/**
 * Achievements reward meaningful learning behaviour, computed only from stored records.
 * No streak pressure, no random rewards.
 */
import { and, count, eq, inArray } from "drizzle-orm";
import { schema, type Tx } from "@/server/db/client";
import { CONCEPTS, questionById } from "@/content";
import { isMastered } from "@/server/learning/mastery";
import { loadSkillStates } from "./student-model";

export async function checkAchievements(db: Tx, studentId: string): Promise<string[]> {
  const have = new Set((await db.select({ code: schema.studentAchievements.code }).from(schema.studentAchievements).where(eq(schema.studentAchievements.studentId, studentId))).map((r) => r.code));
  const earned: string[] = [];
  const outcomes = await db.select({ questionId: schema.itemOutcomes.questionId, correct: schema.itemOutcomes.correct, independent: schema.itemOutcomes.independent, context: schema.itemOutcomes.context })
    .from(schema.itemOutcomes).where(eq(schema.itemOutcomes.studentId, studentId));
  const correct = outcomes.filter((o) => o.correct);
  const codeDefs = (id: string) => questionById.get(id);

  const check = async (code: string, cond: () => Promise<boolean> | boolean) => {
    if (!have.has(code) && (await cond())) earned.push(code);
  };

  await check("FIRST_PROGRAM", async () => {
    const [{ n }] = await db.select({ n: count() }).from(schema.judgeResults)
      .innerJoin(schema.codeSubmissions, eq(schema.codeSubmissions.id, schema.judgeResults.submissionId))
      .where(and(eq(schema.codeSubmissions.studentId, studentId), eq(schema.judgeResults.compileStatus, "success")));
    return n > 0;
  });
  await check("FIRST_LOOP", () => correct.some((o) => codeDefs(o.questionId)?.type === "write_code" && codeDefs(o.questionId)?.conceptId === "for-loops"));
  await check("SOLVED_10", () => correct.length >= 10);
  await check("INDEPENDENT_5", () => outcomes.filter((o) => o.independent && codeDefs(o.questionId)?.type === "write_code").length >= 5);
  await check("DEBUGGER", () => correct.filter((o) => /debug/.test(o.questionId)).length >= 3);
  await check("EXPLAINER", () => outcomes.some((o) => o.context === "explain" && o.correct));
  await check("CAME_BACK", async () => {
    const [{ n }] = await db.select({ n: count() }).from(schema.learningSessions)
      .where(and(eq(schema.learningSessions.studentId, studentId), eq(schema.learningSessions.kind, "revision"), eq(schema.learningSessions.status, "completed")));
    return n > 0;
  });
  const fixed = async () => {
    const [{ n }] = await db.select({ n: count() }).from(schema.mistakes).where(and(eq(schema.mistakes.studentId, studentId), eq(schema.mistakes.status, "fixed")));
    return n;
  };
  await check("FIXED_MISTAKE", async () => (await fixed()) >= 1);
  await check("FIXED_10", async () => (await fixed()) >= 10);
  await check("CONCEPT_MASTERED", async () => {
    const withSkills = CONCEPTS.filter((c) => c.skills.length);
    const states = await loadSkillStates(db, studentId, withSkills.flatMap((c) => c.skills.map((s) => s.id)));
    return withSkills.some((c) => c.skills.every((s) => {
      const st = states.get(s.id);
      return st && st.source === "assessed" && isMastered(st);
    }));
  });

  if (earned.length) {
    await db.insert(schema.studentAchievements).values(earned.map((code) => ({ studentId, code }))).onConflictDoNothing();
  }
  return earned;
}

export async function listAchievements(db: Tx, studentId: string) {
  const rows = await db.select().from(schema.studentAchievements).where(eq(schema.studentAchievements.studentId, studentId));
  return new Map(rows.map((r) => [r.code, r.awardedAt]));
}

export async function achievementCodes(db: Tx, codes: string[]) {
  if (!codes.length) return [];
  return db.select().from(schema.achievements).where(inArray(schema.achievements.code, codes));
}
