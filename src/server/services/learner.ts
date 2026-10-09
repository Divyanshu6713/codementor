/**
 * Reads the student model and turns it into: the engine snapshot (→ next-step decision), the skill
 * map, and the compact student context given to the AI. Everything shown is derived from rows.
 */
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { schema, type Tx } from "@/server/db/client";
import { CONCEPTS, TRACKS, lessonsForConcept, misconceptionByCode, skillTitle } from "@/content";
import { confidenceLabel, conceptMastery, recentStats } from "@/server/learning/mastery";
import { decideNext, type ConceptInfo, type Decision, type LearnerSnapshot, type SkillInfo } from "@/server/learning/engine";
import type { StudentContext } from "@/server/ai/types";
import { loadSkillStates } from "./student-model";
import { getPool } from "./questions";

export async function conceptInfos(db: Tx): Promise<ConceptInfo[]> {
  const pool = await getPool(db);
  const practiceable = new Set(pool.filter((q) => q.purposes.includes("practice")).map((q) => q.conceptId));
  return CONCEPTS.map((c, order) => ({
    id: c.id, title: c.title, status: c.status, order, prerequisites: c.prerequisites,
    skills: c.skills.map((s) => ({ id: s.id, title: s.title })),
    coreLessonId: lessonsForConcept(c.id, "core")[0]?.id ?? null,
    remediationLessonId: lessonsForConcept(c.id, "remediation")[0]?.id ?? null,
    practiceable: practiceable.has(c.id),
  }));
}

export async function completedLessons(db: Tx, studentId: string) {
  const rows = await db.select({ plan: schema.learningSessions.plan }).from(schema.learningSessions)
    .where(and(eq(schema.learningSessions.studentId, studentId), eq(schema.learningSessions.kind, "lesson"), eq(schema.learningSessions.status, "completed")));
  return new Set(rows.map((r) => (r.plan as { lessonId?: string }).lessonId).filter((x): x is string => Boolean(x)));
}

export async function buildSnapshot(db: Tx, studentId: string, now = new Date()): Promise<LearnerSnapshot> {
  const [profile, states, mcs, due, concepts, completed] = await Promise.all([
    db.query.studentProfiles.findFirst({ where: eq(schema.studentProfiles.userId, studentId) }),
    loadSkillStates(db, studentId),
    db.select().from(schema.studentMisconceptions).where(eq(schema.studentMisconceptions.studentId, studentId)),
    db.select().from(schema.revisionItems).where(and(eq(schema.revisionItems.studentId, studentId), lte(schema.revisionItems.dueAt, now))),
    conceptInfos(db),
    completedLessons(db, studentId),
  ]);
  const skills = new Map<string, SkillInfo>([...states].map(([skillId, s]) => [skillId, { skillId, ...s }]));
  return {
    diagnosticDone: Boolean(profile?.diagnosticCompletedAt),
    goal: profile?.goal ?? null,
    concepts, skills, completedLessons: completed, now,
    misconceptions: mcs.map((m) => ({
      code: m.code, title: misconceptionByCode.get(m.code)?.title ?? m.code, conceptId: misconceptionByCode.get(m.code)?.conceptId ?? "",
      occurrences: m.occurrences, recurrences: m.recurrences, status: m.status, lastDetectedAt: m.lastDetectedAt,
    })),
    revisionDue: due.map((r) => ({ skillId: r.skillId, dueAt: r.dueAt })),
  };
}

export async function nextDecision(db: Tx, studentId: string, now = new Date()): Promise<Decision> {
  return decideNext(await buildSnapshot(db, studentId, now));
}

export type DisplayStatus = "NEW" | "LEARNING" | "PRACTICING" | "MASTERED" | "REVISION_DUE" | "REINFORCING" | "INFERRED";

/** The Skill Map: tracks → concepts → atomic skills, with honest labels for untested/inferred skills. */
export async function skillMap(db: Tx, studentId: string, now = new Date()) {
  const [states, dueRows, mcs] = await Promise.all([
    loadSkillStates(db, studentId),
    db.select().from(schema.revisionItems).where(eq(schema.revisionItems.studentId, studentId)),
    db.select().from(schema.studentMisconceptions).where(and(eq(schema.studentMisconceptions.studentId, studentId), eq(schema.studentMisconceptions.status, "active"))),
  ]);
  const dueBySkill = new Map(dueRows.map((r) => [r.skillId, r.dueAt]));
  return TRACKS.map((t) => ({
    id: t.id, title: t.title, status: t.status,
    concepts: CONCEPTS.filter((c) => c.trackId === t.id).map((c) => {
      const skills = c.skills.map((s) => {
        const st = states.get(s.id);
        const due = dueBySkill.get(s.id);
        const stats = st ? recentStats(st.recent) : null;
        let status: DisplayStatus = st ? st.status : "NEW";
        if (st?.source === "inferred") status = "INFERRED";
        else if (due && due <= now && st && st.status !== "NEW" && st.status !== "LEARNING") status = "REVISION_DUE";
        return {
          id: s.id, title: s.title, description: s.description,
          mastery: st && (st.evidenceCount > 0 || st.source === "inferred") ? st.mastery : null,
          confidence: st ? confidenceLabel(st.confidence) : null,
          evidenceCount: st?.evidenceCount ?? 0,
          independentAccuracy: stats?.independentAccuracy ?? null,
          hintDependency: stats?.hintDependency ?? null,
          status, revisionDue: due?.toISOString() ?? null,
        };
      });
      const summary = conceptMastery(
        c.skills.map((s) => states.get(s.id)).filter((x): x is NonNullable<typeof x> => Boolean(x)),
        c.skills.length || 1,
      );
      return {
        id: c.id, title: c.title, summary: c.summary, status: c.status,
        hasLesson: lessonsForConcept(c.id).length > 0,
        mastery: summary.mastery, confidence: confidenceLabel(summary.confidence), coverage: summary.coverage, mastered: summary.mastered,
        prerequisites: c.prerequisites.map((p) => ({ id: p.id, title: CONCEPTS.find((x) => x.id === p.id)?.title ?? p.id, strength: p.strength })),
        activeMisconceptions: mcs.filter((m) => misconceptionByCode.get(m.code)?.conceptId === c.id).map((m) => ({ code: m.code, title: misconceptionByCode.get(m.code)!.title, occurrences: m.occurrences })),
        skills,
      };
    }),
  }));
}

/** Concept mastery for every concept with skills (for snapshots and before/after comparisons). */
export async function conceptMasteryMap(db: Tx, studentId: string) {
  const states = await loadSkillStates(db, studentId);
  const out: Record<string, number | null> = {};
  for (const c of CONCEPTS) {
    if (!c.skills.length) continue;
    out[c.id] = conceptMastery(c.skills.map((s) => states.get(s.id)).filter((x): x is NonNullable<typeof x> => Boolean(x)), c.skills.length).mastery;
  }
  return out;
}

/** The structured profile the AI sees — bounded and free of chat history. */
export async function studentContext(db: Tx, studentId: string, activeConceptId: string | null): Promise<StudentContext> {
  const [user, profile, states, mcs, due] = await Promise.all([
    db.query.users.findFirst({ where: eq(schema.users.id, studentId) }),
    db.query.studentProfiles.findFirst({ where: eq(schema.studentProfiles.userId, studentId) }),
    loadSkillStates(db, studentId),
    db.select().from(schema.studentMisconceptions).where(eq(schema.studentMisconceptions.studentId, studentId)).orderBy(desc(schema.studentMisconceptions.lastDetectedAt)).limit(5),
    db.select({ id: schema.revisionItems.id }).from(schema.revisionItems).where(and(eq(schema.revisionItems.studentId, studentId), lte(schema.revisionItems.dueAt, new Date()))),
  ]);
  const concept = activeConceptId ? CONCEPTS.find((c) => c.id === activeConceptId) : null;
  const relevant = concept ? concept.skills.map((s) => s.id) : [...states.keys()];
  const skillRows = relevant.map((id) => ({ id, s: states.get(id) })).filter((x) => x.s && x.s.evidenceCount > 0);
  const hintDeps = skillRows.map((x) => recentStats(x.s!.recent).hintDependency).filter((h): h is number => h !== null);
  const avgMastery = skillRows.length ? skillRows.reduce((a, x) => a + x.s!.mastery, 0) / skillRows.length : null;
  // Explanation depth follows demonstrated ability (and experience at the start), not age.
  const explanationLevel = avgMastery === null
    ? (profile?.experience === "none" || profile?.experience === "a_little" ? "simple" : "standard")
    : avgMastery < 0.5 ? "simple" : avgMastery > 0.8 ? "detailed" : "standard";
  return {
    displayName: user?.displayName ?? "Student",
    grade: profile?.grade ?? null,
    goal: profile?.goal ?? null,
    explanationLevel,
    activeConcept: concept ? { id: concept.id, title: concept.title } : null,
    skills: skillRows.map((x) => ({ title: skillTitle.get(x.id) ?? x.id, mastery: x.s!.mastery, confidence: confidenceLabel(x.s!.confidence) })),
    misconceptions: mcs.map((m) => ({ title: misconceptionByCode.get(m.code)?.title ?? m.code, occurrences: m.occurrences, status: m.status })),
    hintDependency: hintDeps.length ? hintDeps.reduce((a, b) => a + b, 0) / hintDeps.length : null,
    revisionDue: due.length,
  };
}

/** Distinct days with learning activity in the last 7 days (gentle consistency, not a streak). */
export async function learningDaysThisWeek(db: Tx, studentId: string, now = new Date()) {
  const since = new Date(now.getTime() - 6 * 86_400_000);
  since.setHours(0, 0, 0, 0);
  const rows = await db.select({ at: schema.itemOutcomes.createdAt }).from(schema.itemOutcomes)
    .where(and(eq(schema.itemOutcomes.studentId, studentId), gte(schema.itemOutcomes.createdAt, since)));
  return new Set(rows.map((r) => r.at.toISOString().slice(0, 10))).size;
}
