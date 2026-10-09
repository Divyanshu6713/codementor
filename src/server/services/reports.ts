/**
 * End-of-session report. Every number comes from this session's stored outcomes, attempts and
 * skill rows; nothing is estimated for display.
 */
import { and, eq, inArray } from "drizzle-orm";
import { schema, type Tx } from "@/server/db/client";
import { ACHIEVEMENTS, conceptById, misconceptionByCode, skillTitle } from "@/content";
import { conceptMastery, confidenceLabel } from "@/server/learning/mastery";
import { loadSkillStates } from "./student-model";
import { conceptMasteryMap, nextDecision } from "./learner";
import type { SessionPlan } from "./session-types";
import type { DiagnosticOutcome } from "@/server/learning/diagnostic";
import { progression, streaks } from "./progression";

export async function buildReport(db: Tx, studentId: string, sessionId: string, awarded: string[] = []) {
  const s = await db.query.learningSessions.findFirst({ where: eq(schema.learningSessions.id, sessionId) });
  if (!s || s.studentId !== studentId) throw new Error("session not found");
  const plan = s.plan as SessionPlan;
  const [outcomes, attempts, events] = await Promise.all([
    db.select().from(schema.itemOutcomes).where(and(eq(schema.itemOutcomes.studentId, studentId), eq(schema.itemOutcomes.sessionId, sessionId))),
    db.select({ codes: schema.attempts.misconceptionCodes }).from(schema.attempts).where(eq(schema.attempts.sessionId, sessionId)),
    db.select().from(schema.sessionEvents).where(and(eq(schema.sessionEvents.sessionId, sessionId), eq(schema.sessionEvents.type, "misconception_resolved"))),
  ]);
  const qIds = [...new Set(outcomes.map((o) => o.questionId))];
  const qSkills = qIds.length ? await db.select().from(schema.questionSkills).where(inArray(schema.questionSkills.questionId, qIds)) : [];

  // Per-skill performance in this session (credit-weighted).
  const perSkill = new Map<string, { credit: number; n: number }>();
  for (const o of outcomes) {
    for (const qs of qSkills.filter((x) => x.questionId === o.questionId)) {
      const cur = perSkill.get(qs.skillId) ?? { credit: 0, n: 0 };
      cur.credit += o.credit;
      cur.n += 1;
      perSkill.set(qs.skillId, cur);
    }
  }
  const strong = [...perSkill].filter(([, v]) => v.credit / v.n >= 0.8).map(([k]) => skillTitle.get(k) ?? k);
  const needsPractice = [...perSkill].filter(([, v]) => v.credit / v.n < 0.6).map(([k]) => skillTitle.get(k) ?? k);

  const counts = new Map<string, number>();
  for (const a of attempts) for (const c of a.codes) counts.set(c, (counts.get(c) ?? 0) + 1);
  const top = [...counts].sort((a, b) => b[1] - a[1])[0];

  const before = (s.masteryBefore ?? {}) as Record<string, number | null>;
  const after = await conceptMasteryMap(db, studentId);
  const conceptId = s.conceptId;
  let conceptConfidence: string | null = null;
  if (conceptId) {
    const c = conceptById.get(conceptId)!;
    const states = await loadSkillStates(db, studentId, c.skills.map((x) => x.id));
    conceptConfidence = confidenceLabel(conceptMastery([...states.values()], c.skills.length || 1).confidence);
  }
  const touchedSkills = [...perSkill.keys()];
  const revision = touchedSkills.length
    ? await db.select().from(schema.revisionItems).where(and(eq(schema.revisionItems.studentId, studentId), inArray(schema.revisionItems.skillId, touchedSkills)))
    : [];
  const changed = Object.keys(after).filter((k) => (before[k] ?? null) !== after[k] && after[k] !== null).map((k) => ({
    conceptId: k, title: conceptById.get(k)?.title ?? k, before: before[k] ?? null, after: after[k],
  }));
  const diag = s.kind === "diagnostic"
    ? (await db.query.assessments.findFirst({ where: and(eq(schema.assessments.sessionId, sessionId), eq(schema.assessments.kind, "diagnostic")) }))?.result as DiagnosticOutcome | undefined
    : undefined;
  const end = s.endedAt ?? new Date();
  const prog = await progression(db, studentId);
  const sessionStreak = streaks([...outcomes].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())).best;
  const bestBefore = prog.bestStreakBefore(s.startedAt);
  const questions = outcomes.length;
  const correct = outcomes.filter((o) => o.correct).length;

  return {
    kind: s.kind,
    title: plan.title,
    concept: conceptId ? { id: conceptId, title: conceptById.get(conceptId)?.title ?? conceptId } : null,
    minutes: Math.max(1, Math.round((end.getTime() - s.startedAt.getTime()) / 60_000)),
    questions,
    correct,
    independent: outcomes.filter((o) => o.independent).length,
    hintsUsed: outcomes.filter((o) => o.maxHintLevel >= 0).length,
    solutionsRevealed: outcomes.filter((o) => o.solutionRevealed).length,
    accuracy: questions ? correct / questions : null,
    conceptMastery: conceptId ? { before: before[conceptId] ?? null, after: after[conceptId] ?? null } : null,
    conceptConfidence,
    changed,
    strong,
    needsPractice,
    importantMistake: top ? { code: top[0], title: misconceptionByCode.get(top[0])?.title ?? top[0], count: top[1], explanation: misconceptionByCode.get(top[0])?.studentExplanation ?? "" } : null,
    resolvedMisconceptions: events.flatMap((e) => ((e.payload as { codes?: string[] }).codes ?? [])).map((c) => misconceptionByCode.get(c)?.title ?? c),
    revision: revision.map((r) => ({ skill: skillTitle.get(r.skillId) ?? r.skillId, dueAt: r.dueAt.toISOString(), reason: r.reason })),
    diagnostic: diag ? diag.concepts.map((c) => ({ ...c, title: conceptById.get(c.conceptId)?.title ?? c.conceptId })) : null,
    xp: { earned: prog.sessionXp(sessionId), total: prog.xp, level: prog.level },
    personalBest: sessionStreak > bestBefore && sessionStreak >= 3 ? { streak: sessionStreak, previous: bestBefore } : null,
    achievements: awarded.map((code) => ACHIEVEMENTS.find((a) => a.code === code)).filter(Boolean),
    next: await nextDecision(db, studentId),
  };
}
export type SessionReport = Awaited<ReturnType<typeof buildReport>>;
