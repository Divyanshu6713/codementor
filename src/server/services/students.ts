import { and, desc, eq, lte } from "drizzle-orm";
import { getDb, schema } from "@/server/db/client";
import { ACHIEVEMENTS, CONCEPTS, misconceptionByCode, questionById, skillTitle, conceptById } from "@/content";
import { planSession, type SessionLength } from "@/server/learning/engine";
import { confidenceLabel } from "@/server/learning/mastery";
import { learningDaysThisWeek, nextDecision, skillMap } from "./learner";
import { activeSessionFor } from "./sessions";
import { listAchievements } from "./achievements";
import { progression } from "./progression";
import { arenaProblems, leaderboard } from "./arena";
import type { EXPERIENCE, GOALS } from "@/server/db/schema";

export interface OnboardingInput {
  displayName: string;
  grade: string | null;
  experience: (typeof EXPERIENCE)[number];
  usedCpp: boolean;
  confidence: number;
  goal: (typeof GOALS)[number];
}

export async function saveOnboarding(studentId: string, input: OnboardingInput) {
  const db = await getDb();
  await db.transaction(async (tx) => {
    await tx.update(schema.users).set({ displayName: input.displayName.trim() }).where(eq(schema.users.id, studentId));
    await tx.update(schema.studentProfiles).set({
      grade: input.grade, experience: input.experience, usedCpp: input.usedCpp, confidence: input.confidence, goal: input.goal, onboardedAt: new Date(),
    }).where(eq(schema.studentProfiles.userId, studentId));
  });
}

export async function getProfile(studentId: string) {
  const db = await getDb();
  return db.query.studentProfiles.findFirst({ where: eq(schema.studentProfiles.userId, studentId) });
}

/** Everything the dashboard shows, derived from stored data. */
export async function dashboard(studentId: string, length: SessionLength = "normal") {
  const db = await getDb();
  const now = new Date();
  const [decision, map, active, due, openMistakes, snapshots, days, achievements, outcomesCount, prog] = await Promise.all([
    nextDecision(db, studentId, now),
    skillMap(db, studentId, now),
    activeSessionFor(db, studentId),
    db.select().from(schema.revisionItems).where(and(eq(schema.revisionItems.studentId, studentId), lte(schema.revisionItems.dueAt, now))),
    db.select({ id: schema.mistakes.id }).from(schema.mistakes).where(and(eq(schema.mistakes.studentId, studentId), eq(schema.mistakes.status, "open"))),
    db.select().from(schema.progressSnapshots).where(eq(schema.progressSnapshots.studentId, studentId)).orderBy(desc(schema.progressSnapshots.createdAt)).limit(2),
    learningDaysThisWeek(db, studentId, now),
    listAchievements(db, studentId),
    db.select({ id: schema.itemOutcomes.id }).from(schema.itemOutcomes).where(eq(schema.itemOutcomes.studentId, studentId)).limit(1),
    progression(db, studentId, now),
  ]);
  const [arena, board] = await Promise.all([arenaProblems(studentId, now), leaderboard(studentId, "week", now)]);
  const foundations = map.find((t) => t.id === "cpp-foundations")!;
  const withData = foundations.concepts.filter((c) => c.skills.length);
  const known = withData.filter((c) => c.mastery !== null);
  // Track progress = share of the track's skills at mastery (inferred skills don't count as mastered).
  const allSkills = withData.flatMap((c) => c.skills);
  const masteredSkills = allSkills.filter((s) => s.status === "MASTERED").length;

  const changes: { title: string; before: number | null; after: number }[] = [];
  if (snapshots.length) {
    const latest = snapshots[0].conceptMastery as Record<string, number | null>;
    const prev = (snapshots[1]?.conceptMastery ?? {}) as Record<string, number | null>;
    for (const [k, v] of Object.entries(latest)) {
      if (v !== null && v !== (prev[k] ?? null)) changes.push({ title: conceptById.get(k)?.title ?? k, before: prev[k] ?? null, after: v });
    }
  }
  return {
    decision,
    plan: planSession(decision, length, { revisionDue: due.length, openMistakes: openMistakes.length }),
    activeSession: active ? { id: active.id, kind: active.kind, title: (active.plan as { title?: string }).title ?? "" } : null,
    track: { title: foundations.title, masteredSkills, totalSkills: allSkills.length, conceptsStarted: known.length, conceptsTotal: withData.length },
    currentConcept: decision.conceptId ? conceptById.get(decision.conceptId)?.title ?? null : null,
    revisionDue: due.length,
    openMistakes: openMistakes.length,
    learningDaysThisWeek: days,
    recentChanges: changes.slice(0, 4),
    achievements: { earned: achievements.size, total: ACHIEVEMENTS.length },
    hasActivity: outcomesCount.length > 0,
    daily: arena.daily ? { ...arena.daily, bonus: arena.dailyBonus, solvedToday: prog.dailySolvedToday } : null,
    arena: { solved: arena.problems.filter((p) => p.status === "solved").length, total: arena.problems.length },
    board: { joined: board.joined, rank: board.you?.rank ?? null, participants: board.participants, leader: board.top[0] ? { name: board.top[0].name, xp: board.top[0].xp, you: board.top[0].you } : null },
    progress: {
      xp: prog.xp, level: prog.level, week: prog.week, streak: prog.streak,
      hardestSolo: prog.hardestSolo, bestSession: prog.bestSession, solvedSolo: prog.solvedSolo,
    },
  };
}

export async function listMistakes(studentId: string) {
  const db = await getDb();
  const rows = await db.select().from(schema.mistakes).where(eq(schema.mistakes.studentId, studentId)).orderBy(desc(schema.mistakes.updatedAt));
  return rows.map((m, i) => ({
    id: m.id, number: rows.length - i, status: m.status, occurrences: m.occurrences,
    topic: conceptById.get(m.conceptId)?.title ?? m.conceptId,
    skill: m.skillId ? skillTitle.get(m.skillId) ?? m.skillId : null,
    category: m.category,
    question: questionById.get(m.questionId)?.prompt ?? "",
    snapshot: m.snapshot, whatHappened: m.whatHappened,
    misconception: m.misconceptionCode ? { code: m.misconceptionCode, title: misconceptionByCode.get(m.misconceptionCode)?.title ?? "", explanation: misconceptionByCode.get(m.misconceptionCode)?.studentExplanation ?? "", concept: conceptById.get(misconceptionByCode.get(m.misconceptionCode)?.conceptId ?? "")?.title ?? "" } : null,
    retryPrompt: m.retryQuestionId ? questionById.get(m.retryQuestionId)?.prompt ?? null : null,
    createdAt: m.createdAt.toISOString(), updatedAt: m.updatedAt.toISOString(), fixedAt: m.fixedAt?.toISOString() ?? null,
  }));
}

export async function revisionOverview(studentId: string) {
  const db = await getDb();
  const now = new Date();
  const [items, states] = await Promise.all([
    db.select().from(schema.revisionItems).where(eq(schema.revisionItems.studentId, studentId)).orderBy(schema.revisionItems.dueAt),
    db.select().from(schema.studentSkills).where(eq(schema.studentSkills.studentId, studentId)),
  ]);
  const st = new Map(states.map((s) => [s.skillId, s]));
  return items.map((r) => ({
    skillId: r.skillId, skill: skillTitle.get(r.skillId) ?? r.skillId,
    concept: CONCEPTS.find((c) => c.skills.some((s) => s.id === r.skillId))?.title ?? "",
    dueAt: r.dueAt.toISOString(), due: r.dueAt <= now, reason: r.reason, intervalDays: r.intervalDays, reviews: r.reviews,
    lastQuality: r.lastQuality, mastery: st.get(r.skillId)?.mastery ?? null, confidence: st.get(r.skillId) ? confidenceLabel(st.get(r.skillId)!.confidence) : null,
  }));
}

export async function achievementsFor(studentId: string) {
  const db = await getDb();
  const earned = await listAchievements(db, studentId);
  return ACHIEVEMENTS.map((a) => ({ ...a, earnedAt: earned.get(a.code)?.toISOString() ?? null }));
}
