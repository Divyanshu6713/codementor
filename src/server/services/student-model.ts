/**
 * Writes to the student model. Everything here runs inside the caller's transaction so an answer,
 * its misconceptions, mastery, revision schedule and mistake book update together or not at all.
 */
import { and, eq, inArray, ne } from "drizzle-orm";
import { schema, type Tx } from "@/server/db/client";
import type { MistakeCategory, SkillStatus } from "@/server/db/schema";
import {
  applyEvidence, inferredKnownState, isIndependent, itemCredit, newSkillState,
  type EvidenceKind, type ItemResult, type RecentOutcome, type SkillState,
} from "@/server/learning/mastery";
import {
  firstRevision, onMisconceptionDetected, onProbePassed, pullForward, scheduleAfterReview,
} from "@/server/learning/adaptivity";
import { misconceptionByCode, questionById, skillToConcept } from "@/content";
import type { LoadedQuestion } from "./questions";

type SkillRow = typeof schema.studentSkills.$inferSelect;

export function rowToState(r: SkillRow): SkillState {
  return {
    alpha: r.alpha, beta: r.beta, mastery: r.mastery, confidence: r.confidence, evidenceCount: r.evidenceCount,
    correctCount: r.correctCount, independentCount: r.independentCount, recent: r.recent as RecentOutcome[],
    explainScore: r.explainScore, status: r.status, source: r.source, lastPracticedAt: r.lastPracticedAt,
  };
}

function stateToRow(studentId: string, skillId: string, s: SkillState) {
  return {
    studentId, skillId, alpha: s.alpha, beta: s.beta, mastery: s.mastery, confidence: s.confidence,
    evidenceCount: s.evidenceCount, correctCount: s.correctCount, independentCount: s.independentCount,
    recent: s.recent, explainScore: s.explainScore, status: s.status, source: s.source,
    lastPracticedAt: s.lastPracticedAt, updatedAt: new Date(),
  };
}

export async function loadSkillStates(db: Tx, studentId: string, skillIds?: string[]) {
  const rows = await db.select().from(schema.studentSkills).where(
    skillIds?.length ? and(eq(schema.studentSkills.studentId, studentId), inArray(schema.studentSkills.skillId, skillIds)) : eq(schema.studentSkills.studentId, studentId),
  );
  return new Map(rows.map((r) => [r.skillId, rowToState(r)]));
}

async function saveSkill(db: Tx, studentId: string, skillId: string, s: SkillState) {
  const row = stateToRow(studentId, skillId, s);
  await db.insert(schema.studentSkills).values(row).onConflictDoUpdate({
    target: [schema.studentSkills.studentId, schema.studentSkills.skillId],
    set: { ...row, studentId: undefined, skillId: undefined },
  });
}

/** Skills the diagnostic inferred as known (never overwrites real evidence). */
export async function setInferredSkills(db: Tx, studentId: string, skillIds: string[]) {
  const existing = await loadSkillStates(db, studentId, skillIds);
  for (const id of skillIds) if (!existing.has(id)) await saveSkill(db, studentId, id, inferredKnownState());
}

export interface SkillChange {
  skillId: string;
  before: number | null;
  after: number;
  statusBefore: SkillStatus | null;
  statusAfter: SkillStatus;
}

export interface ItemResolution extends ItemResult {
  studentId: string;
  sessionId: string | null;
  itemKey: string;
  question: LoadedQuestion;
  kind: EvidenceKind;
  now: Date;
  /** Explain-it-back: rubric/AI score is the credit (0..1). */
  creditOverride?: number;
}

/**
 * The single place an item turns into evidence: item_outcomes row, skill updates, misconception
 * probe streaks, revision schedule and mistake-book "fixed" status.
 */
export async function resolveItem(db: Tx, r: ItemResolution) {
  const credit = r.creditOverride ?? itemCredit(r);
  const independent = r.creditOverride !== undefined ? r.correct : isIndependent(r);
  const inserted = await db.insert(schema.itemOutcomes).values({
    studentId: r.studentId, sessionId: r.sessionId, questionId: r.question.id, questionVersionId: r.question.versionId,
    itemKey: r.itemKey, correct: r.correct, firstAttemptCorrect: r.correct && r.attempts <= 1 && r.maxHintLevel < 0,
    independent, attempts: r.attempts, maxHintLevel: r.maxHintLevel, solutionRevealed: r.solutionRevealed,
    credit, difficulty: r.question.difficulty, context: r.kind,
  }).onConflictDoNothing().returning({ id: schema.itemOutcomes.id });
  if (!inserted.length) return { credit, changes: [] as SkillChange[], resolvedMisconceptions: [] as string[] }; // already resolved (double submit)

  const states = await loadSkillStates(db, r.studentId, r.question.skills.map((s) => s.id));
  const changes: SkillChange[] = [];
  for (const sk of r.question.skills) {
    const prev = states.get(sk.id) ?? newSkillState();
    const next = applyEvidence(prev, {
      credit, correct: r.correct, independent, maxHintLevel: r.solutionRevealed ? 5 : r.maxHintLevel,
      difficulty: r.question.difficulty, kind: r.kind, weight: sk.weight, at: r.now,
    });
    await saveSkill(db, r.studentId, sk.id, next);
    changes.push({ skillId: sk.id, before: states.has(sk.id) ? prev.mastery : null, after: next.mastery, statusBefore: states.get(sk.id)?.status ?? null, statusAfter: next.status });
  }

  // A clean, independent answer to a probing question is evidence the misconception is gone.
  const resolvedMisconceptions: string[] = [];
  if (r.correct && independent && r.question.probes.length) {
    const rows = await db.select().from(schema.studentMisconceptions).where(and(
      eq(schema.studentMisconceptions.studentId, r.studentId), inArray(schema.studentMisconceptions.code, r.question.probes), eq(schema.studentMisconceptions.status, "active"),
    ));
    for (const m of rows) {
      const next = onProbePassed(m);
      await db.update(schema.studentMisconceptions).set({ probeStreak: next.probeStreak, status: next.status, resolvedAt: next.status === "resolved" ? r.now : null })
        .where(and(eq(schema.studentMisconceptions.studentId, r.studentId), eq(schema.studentMisconceptions.code, m.code)));
      if (next.status === "resolved") resolvedMisconceptions.push(m.code);
    }
  }

  if (r.kind !== "diagnostic") await updateRevision(db, r.studentId, r.question.skills.map((s) => s.id), r.kind === "revision" ? credit : null, r.now);

  // Answering a mistake's retry question (or the same question) correctly — later, as a separate
  // item, not by retrying straight away — marks it fixed.
  if (r.correct && !r.solutionRevealed) {
    const open = await db.select({ id: schema.mistakes.id, retryQuestionId: schema.mistakes.retryQuestionId, questionId: schema.mistakes.questionId, itemKey: schema.attempts.itemKey })
      .from(schema.mistakes).leftJoin(schema.attempts, eq(schema.attempts.id, schema.mistakes.attemptId))
      .where(and(eq(schema.mistakes.studentId, r.studentId), eq(schema.mistakes.status, "open")));
    const fixed = open.filter((m) => (m.retryQuestionId === r.question.id || m.questionId === r.question.id) && m.itemKey !== r.itemKey);
    for (const m of fixed) await db.update(schema.mistakes).set({ status: "fixed", fixedAt: r.now, updatedAt: r.now }).where(eq(schema.mistakes.id, m.id));
  }
  return { credit, changes, resolvedMisconceptions };
}

/**
 * Practising a skill (outside revision) starts its revision schedule; revision answers move it
 * along the ladder based on recall quality.
 */
async function updateRevision(db: Tx, studentId: string, skillIds: string[], revisionQuality: number | null, now: Date) {
  for (const skillId of skillIds) {
    const item = await db.query.revisionItems.findFirst({ where: and(eq(schema.revisionItems.studentId, studentId), eq(schema.revisionItems.skillId, skillId)) });
    if (!item) {
      const first = firstRevision(now);
      await db.insert(schema.revisionItems).values({ studentId, skillId, stage: first.stage, intervalDays: first.intervalDays, dueAt: first.dueAt, reason: first.reason });
      continue;
    }
    if (revisionQuality === null) continue;
    const active = await activeMisconceptionsForSkill(db, studentId, skillId);
    const next = scheduleAfterReview(item, revisionQuality, active, now);
    await db.update(schema.revisionItems).set({
      stage: next.stage, intervalDays: next.intervalDays, dueAt: next.dueAt, reason: next.reason,
      lastReviewedAt: now, lastQuality: revisionQuality, reviews: item.reviews + 1,
    }).where(eq(schema.revisionItems.id, item.id));
  }
}

async function activeMisconceptionsForSkill(db: Tx, studentId: string, skillId: string) {
  const conceptId = skillToConcept.get(skillId);
  const rows = await db.select({ code: schema.studentMisconceptions.code }).from(schema.studentMisconceptions)
    .where(and(eq(schema.studentMisconceptions.studentId, studentId), eq(schema.studentMisconceptions.status, "active")));
  return rows.some((r) => misconceptionByCode.get(r.code)?.conceptId === conceptId);
}

/**
 * Records misconceptions seen in one attempt.
 * Wrong + "just guessing" is treated as uncertainty, not a misconception (unless it's already active);
 * wrong + "very sure" is strong evidence and is kept.
 */
export async function recordMisconceptions(db: Tx, args: {
  studentId: string; codes: string[]; questionId: string; attemptId: string; summary: string;
  selfConfidence: "guessing" | "somewhat" | "very" | null; skillIds: string[]; now: Date;
}): Promise<{ recorded: string[]; uncertain: string[] }> {
  const recorded: string[] = [];
  const uncertain: string[] = [];
  for (const code of new Set(args.codes)) {
    if (!misconceptionByCode.has(code)) continue;
    const existing = await db.query.studentMisconceptions.findFirst({
      where: and(eq(schema.studentMisconceptions.studentId, args.studentId), eq(schema.studentMisconceptions.code, code)),
    });
    if (args.selfConfidence === "guessing" && existing?.status !== "active") {
      uncertain.push(code);
      continue;
    }
    const next = onMisconceptionDetected(existing ?? null);
    const evidence = [...((existing?.evidence as unknown[]) ?? []), {
      questionId: args.questionId, attemptId: args.attemptId, summary: args.summary.slice(0, 240), selfConfidence: args.selfConfidence, at: args.now.toISOString(),
    }].slice(-5);
    if (existing) {
      await db.update(schema.studentMisconceptions).set({ ...next, lastDetectedAt: args.now, resolvedAt: null, evidence })
        .where(and(eq(schema.studentMisconceptions.studentId, args.studentId), eq(schema.studentMisconceptions.code, code)));
    } else {
      await db.insert(schema.studentMisconceptions).values({ studentId: args.studentId, code, ...next, firstDetectedAt: args.now, lastDetectedAt: args.now, evidence });
    }
    recorded.push(code);
  }
  // A misconception pulls the related skills' reviews closer.
  if (recorded.length) {
    for (const skillId of args.skillIds) {
      const item = await db.query.revisionItems.findFirst({ where: and(eq(schema.revisionItems.studentId, args.studentId), eq(schema.revisionItems.skillId, skillId)) });
      if (item) await db.update(schema.revisionItems).set({ dueAt: pullForward(item.dueAt, args.now), reason: "misconception" }).where(eq(schema.revisionItems.id, item.id));
    }
  }
  return { recorded, uncertain };
}

/** A different question that probes the same misconception, so retrying isn't just recall. */
async function retryQuestionFor(db: Tx, questionId: string, code: string | null): Promise<string> {
  if (code) {
    const rows = await db.select({ q: schema.questionMisconceptions.questionId }).from(schema.questionMisconceptions)
      .innerJoin(schema.questions, eq(schema.questions.id, schema.questionMisconceptions.questionId))
      .where(and(eq(schema.questionMisconceptions.misconceptionCode, code), ne(schema.questionMisconceptions.questionId, questionId), eq(schema.questions.status, "active")));
    const practiceable = rows.map((r) => r.q).filter((id) => {
      const def = questionById.get(id);
      return def && (def.purposes.includes("practice") || def.purposes.includes("revision")) && def.type !== "explain";
    }).sort();
    if (practiceable.length) return practiceable[0];
  }
  return questionId;
}

/**
 * Mistake Book: only educationally meaningful mistakes — a named misconception, or a logic error in
 * code. Plain one-off typos/compile errors are not stored. Repeats increment the same entry.
 */
export async function recordMistake(db: Tx, args: {
  studentId: string; question: LoadedQuestion; attemptId: string; misconceptionCode: string | null;
  category: MistakeCategory; snapshot: string; whatHappened: string; now: Date;
}) {
  const meaningful = Boolean(args.misconceptionCode) || (args.question.type === "write_code" && args.category !== "syntax");
  if (!meaningful) return null;
  const existing = await db.query.mistakes.findFirst({
    where: and(
      eq(schema.mistakes.studentId, args.studentId), eq(schema.mistakes.questionId, args.question.id), eq(schema.mistakes.status, "open"),
      args.misconceptionCode ? eq(schema.mistakes.misconceptionCode, args.misconceptionCode) : eq(schema.mistakes.category, args.category),
    ),
  });
  if (existing) {
    await db.update(schema.mistakes).set({ occurrences: existing.occurrences + 1, snapshot: args.snapshot.slice(0, 2000), whatHappened: args.whatHappened, attemptId: args.attemptId, updatedAt: args.now })
      .where(eq(schema.mistakes.id, existing.id));
    return existing.id;
  }
  const [row] = await db.insert(schema.mistakes).values({
    studentId: args.studentId, questionId: args.question.id, questionVersionId: args.question.versionId, attemptId: args.attemptId,
    conceptId: args.question.conceptId, skillId: args.question.skills[0]?.id ?? null, misconceptionCode: args.misconceptionCode,
    category: args.category, snapshot: args.snapshot.slice(0, 2000), whatHappened: args.whatHappened, status: "open",
    retryQuestionId: await retryQuestionFor(db, args.question.id, args.misconceptionCode),
  }).returning({ id: schema.mistakes.id });
  return row.id;
}
