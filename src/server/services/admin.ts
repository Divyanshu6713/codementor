/**
 * Internal content-quality view (§45, §84–85): question performance and calibration flags,
 * validation failures, disabling broken questions, AI usage, and AI-generated questions awaiting review.
 */
import { count, desc, eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/server/db/client";
import { conceptById, questionById } from "@/content";
import { NotFoundError } from "@/server/errors";
import { DIFFICULTY_LABELS } from "@/server/learning/adaptivity";

/** Flag "easy" questions that learners rarely solve on their own. */
export const CALIBRATION = { minOutcomes: 8, easyMaxDifficulty: 2, minIndependentRate: 0.35 };

export async function questionStats() {
  const db = await getDb();
  const rows = await db.select({
    id: schema.questions.id, type: schema.questions.type, status: schema.questions.status, origin: schema.questions.origin,
    conceptId: schema.questions.conceptId, difficulty: schema.questions.difficulty, currentVersion: schema.questions.currentVersion,
    n: sql<number>`count(${schema.itemOutcomes.id})::int`,
    firstTry: sql<number>`coalesce(avg(case when ${schema.itemOutcomes.firstAttemptCorrect} then 1.0 else 0.0 end), 0)::float`,
    independent: sql<number>`coalesce(avg(case when ${schema.itemOutcomes.independent} then 1.0 else 0.0 end), 0)::float`,
    hinted: sql<number>`coalesce(avg(case when ${schema.itemOutcomes.maxHintLevel} >= 0 then 1.0 else 0.0 end), 0)::float`,
  }).from(schema.questions)
    .leftJoin(schema.itemOutcomes, eq(schema.itemOutcomes.questionId, schema.questions.id))
    .groupBy(schema.questions.id).orderBy(schema.questions.conceptId, schema.questions.id);
  const versions = await db.select({ q: schema.questionVersions.questionId, v: schema.questionVersions.version, status: schema.questionVersions.validationStatus })
    .from(schema.questionVersions);
  return rows.map((r) => {
    const v = versions.find((x) => x.q === r.id && x.v === r.currentVersion);
    const flagged = r.n >= CALIBRATION.minOutcomes && r.difficulty <= CALIBRATION.easyMaxDifficulty && r.independent < CALIBRATION.minIndependentRate;
    return {
      ...r, concept: conceptById.get(r.conceptId)?.title ?? r.conceptId, difficultyLabel: DIFFICULTY_LABELS[r.difficulty],
      prompt: questionById.get(r.id)?.prompt ?? "(AI-generated)", validation: v?.status ?? "unknown",
      calibrationFlag: flagged ? `Rated ${DIFFICULTY_LABELS[r.difficulty].toLowerCase()} but only ${Math.round(r.independent * 100)}% solve it independently` : null,
    };
  });
}

export async function setQuestionStatus(actorId: string, questionId: string, status: "active" | "disabled") {
  const db = await getDb();
  const q = await db.query.questions.findFirst({ where: eq(schema.questions.id, questionId) });
  if (!q) throw new NotFoundError("That question");
  await db.update(schema.questions).set({ status }).where(eq(schema.questions.id, questionId));
  await db.insert(schema.auditLog).values({ actorId, action: `question.${status === "active" ? "enabled" : "disabled"}`, targetType: "question", targetId: questionId });
}

export async function contentFlags() {
  const db = await getDb();
  return db.select().from(schema.contentFlags).orderBy(desc(schema.contentFlags.createdAt)).limit(50);
}

export async function aiUsage() {
  const db = await getDb();
  return db.select({
    purpose: schema.aiInteractions.purpose, provider: schema.aiInteractions.provider, status: schema.aiInteractions.status,
    calls: count(), inputTokens: sql<number>`coalesce(sum(${schema.aiInteractions.inputTokens}), 0)::int`,
    outputTokens: sql<number>`coalesce(sum(${schema.aiInteractions.outputTokens}), 0)::int`,
    avgLatency: sql<number>`coalesce(avg(${schema.aiInteractions.latencyMs}), 0)::int`,
  }).from(schema.aiInteractions).groupBy(schema.aiInteractions.purpose, schema.aiInteractions.provider, schema.aiInteractions.status);
}

export async function executionHealth() {
  const db = await getDb();
  return db.select({ verdict: schema.judgeResults.verdict, n: count() }).from(schema.judgeResults).groupBy(schema.judgeResults.verdict);
}
