import crypto from "node:crypto";
import { and, desc, eq, notInArray } from "drizzle-orm";
import type { DB } from "@/server/db/client";
import * as schema from "@/server/db/schema";
import {
  ACHIEVEMENTS, CONCEPTS, LESSONS, MISCONCEPTIONS, QUESTIONS, TRACKS, validateContent,
} from "@/content";
import type { LessonDef, QuestionDef } from "@/content/types";
import { splitQuestion } from "./question-parts";
import { logger } from "@/server/logger";

/** Deterministic JSON (sorted keys) so the content hash only changes when content changes. */
export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value as object).sort().map((k) => `${JSON.stringify(k)}:${stableStringify((value as Record<string, unknown>)[k])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export const contentHash = (v: unknown) => crypto.createHash("sha256").update(stableStringify(v)).digest("hex").slice(0, 24);

/**
 * Brings the database in line with src/content. Idempotent:
 * - reference tables (tracks, concepts, skills, misconceptions, achievements) are upserted;
 * - a question or lesson whose definition hash changed gets a NEW version row (old attempts keep
 *   pointing at the version they used);
 * - questions removed from the source are disabled, never deleted.
 * Admin-set status (e.g. "disabled") on a question survives syncs.
 */
export async function syncContent(db: DB) {
  const problems = validateContent();
  if (problems.length) throw new Error(`Curriculum content is invalid:\n- ${problems.join("\n- ")}`);

  await db.transaction(async (tx) => {
    for (const t of TRACKS) {
      await tx.insert(schema.curriculumTracks).values(t)
        .onConflictDoUpdate({ target: schema.curriculumTracks.id, set: { title: t.title, description: t.description, order: t.order, status: t.status } });
    }
    for (const [order, c] of CONCEPTS.entries()) {
      const row = { id: c.id, trackId: c.trackId, title: c.title, summary: c.summary, order, status: c.status, contentVersion: 1 };
      await tx.insert(schema.concepts).values(row)
        .onConflictDoUpdate({ target: schema.concepts.id, set: { trackId: c.trackId, title: c.title, summary: c.summary, order, status: c.status } });
    }
    await tx.delete(schema.conceptPrerequisites);
    const prereqs = CONCEPTS.flatMap((c) => c.prerequisites.map((p) => ({ conceptId: c.id, prerequisiteId: p.id, strength: p.strength })));
    if (prereqs.length) await tx.insert(schema.conceptPrerequisites).values(prereqs);
    for (const c of CONCEPTS) {
      for (const [order, s] of c.skills.entries()) {
        await tx.insert(schema.skills).values({ id: s.id, conceptId: c.id, title: s.title, description: s.description, order })
          .onConflictDoUpdate({ target: schema.skills.id, set: { conceptId: c.id, title: s.title, description: s.description, order } });
      }
    }
    for (const m of MISCONCEPTIONS) {
      const row = { code: m.code, conceptId: m.conceptId, title: m.title, category: m.category, description: m.description, studentExplanation: m.studentExplanation };
      await tx.insert(schema.misconceptions).values(row).onConflictDoUpdate({ target: schema.misconceptions.code, set: row });
    }
    for (const a of ACHIEVEMENTS) {
      await tx.insert(schema.achievements).values(a).onConflictDoUpdate({ target: schema.achievements.code, set: { title: a.title, description: a.description } });
    }
    for (const q of QUESTIONS) await syncQuestion(tx as unknown as DB, q);
    const ids = QUESTIONS.map((q) => q.id);
    await tx.update(schema.questions).set({ status: "disabled" })
      .where(and(eq(schema.questions.origin, "curated"), notInArray(schema.questions.id, ids)));
    for (const l of LESSONS) await syncLesson(tx as unknown as DB, l);
  });
}

async function syncQuestion(db: DB, q: QuestionDef) {
  const parts = splitQuestion(q);
  const hash = contentHash(q);
  const existing = await db.query.questions.findFirst({ where: eq(schema.questions.id, q.id) });
  const latest = existing
    ? await db.query.questionVersions.findFirst({
        where: eq(schema.questionVersions.questionId, q.id), orderBy: desc(schema.questionVersions.version),
      })
    : undefined;

  const meta = {
    type: q.type, conceptId: q.conceptId, difficulty: q.difficulty, purposes: q.purposes,
    language: q.code || q.type === "write_code" ? "cpp" : null,
  };
  if (!existing) {
    await db.insert(schema.questions).values({ id: q.id, status: "active", origin: "curated", currentVersion: 1, ...meta });
  } else {
    await db.update(schema.questions).set(meta).where(eq(schema.questions.id, q.id));
  }

  if (latest?.contentHash === hash) return;
  const version = (latest?.version ?? 0) + 1;
  const [qv] = await db.insert(schema.questionVersions).values({
    questionId: q.id, version, contentHash: hash,
    content: parts.content, answerKey: parts.answerKey, hints: q.hints, explanation: q.explanation,
    referenceSolution: q.type === "write_code" ? q.referenceSolution : null,
    // Judged questions must pass their reference solution before any student sees them.
    validationStatus: q.type === "write_code" ? "pending" : "not_required",
  }).returning({ id: schema.questionVersions.id });
  if (q.type === "write_code") {
    await db.insert(schema.questionTestCases).values(q.tests.map((t, order) => ({
      questionVersionId: qv.id, order, label: t.label, input: t.input, expectedOutput: t.output,
      visibility: t.visibility, category: t.category,
    })));
  }
  await db.update(schema.questions).set({ currentVersion: version }).where(eq(schema.questions.id, q.id));
  await db.delete(schema.questionSkills).where(eq(schema.questionSkills.questionId, q.id));
  await db.insert(schema.questionSkills).values(q.skills.map((s) => ({ questionId: q.id, skillId: s.id, weight: s.weight ?? 1 })));
  await db.delete(schema.questionMisconceptions).where(eq(schema.questionMisconceptions.questionId, q.id));
  if (q.probes?.length) {
    await db.insert(schema.questionMisconceptions).values(q.probes.map((code) => ({ questionId: q.id, misconceptionCode: code })));
  }
  if (latest) logger.info("content.question_version", { questionId: q.id, version });
}

async function syncLesson(db: DB, l: LessonDef) {
  const hash = contentHash(l);
  await db.insert(schema.lessons).values({
    id: l.id, conceptId: l.conceptId, kind: l.kind, title: l.title, currentVersion: 1,
    estimatedMinutes: l.estimatedMinutes, status: "active",
  }).onConflictDoUpdate({ target: schema.lessons.id, set: { title: l.title, estimatedMinutes: l.estimatedMinutes, kind: l.kind } });
  const latest = await db.query.lessonVersions.findFirst({
    where: eq(schema.lessonVersions.lessonId, l.id), orderBy: desc(schema.lessonVersions.version),
  });
  if (latest?.contentHash === hash) return;
  const version = (latest?.version ?? 0) + 1;
  const [lv] = await db.insert(schema.lessonVersions).values({ lessonId: l.id, version, contentHash: hash }).returning();
  const branchTargets = new Set(l.steps.flatMap((s) => (s.kind === "checkpoint" ? Object.values(s.reteach) : [])));
  await db.insert(schema.lessonSteps).values(l.steps.map((s, order) => ({
    lessonVersionId: lv.id, key: s.key, order, kind: s.kind,
    branchOnly: s.kind === "reteach" && branchTargets.has(s.key), content: s,
  })));
  await db.update(schema.lessons).set({ currentVersion: version }).where(eq(schema.lessons.id, l.id));
}
