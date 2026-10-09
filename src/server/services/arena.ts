/**
 * Practice Arena (problem list), Daily Challenge and the opt-in leaderboard.
 * Acceptance rates and rankings come from real stored outcomes; nothing is seeded or simulated.
 */
import { and, eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/server/db/client";
import { ARENA_PROBLEM_IDS, PROBLEM_META, dailyChallengeFor } from "@/content/problems";
import { conceptById } from "@/content";
import { XP_RULES, levelFor, progression } from "./progression";

/** Below this many attempts across all students, acceptance isn't shown (too little data). */
export const MIN_FOR_ACCEPTANCE = 3;

export async function arenaProblems(studentId: string, now = new Date()) {
  const db = await getDb();
  const [qs, versions, all, mine] = await Promise.all([
    db.select().from(schema.questions).where(and(inArray(schema.questions.id, ARENA_PROBLEM_IDS), eq(schema.questions.status, "active"))),
    db.select({ q: schema.questionVersions.questionId, v: schema.questionVersions.version, status: schema.questionVersions.validationStatus }).from(schema.questionVersions).where(inArray(schema.questionVersions.questionId, ARENA_PROBLEM_IDS)),
    db.select({ q: schema.itemOutcomes.questionId, correct: schema.itemOutcomes.correct }).from(schema.itemOutcomes).where(inArray(schema.itemOutcomes.questionId, ARENA_PROBLEM_IDS)),
    db.select({ q: schema.attempts.questionId, correct: schema.attempts.isCorrect, hint: schema.attempts.hintLevelBefore, n: schema.attempts.attemptNumber })
      .from(schema.attempts).where(and(eq(schema.attempts.studentId, studentId), inArray(schema.attempts.questionId, ARENA_PROBLEM_IDS))),
  ]);
  const daily = dailyChallengeFor(now);
  const rows = ARENA_PROBLEM_IDS.map((id) => {
    const q = qs.find((x) => x.id === id);
    if (!q) return null;
    const v = versions.find((x) => x.q === id && x.v === q.currentVersion);
    if (v?.status === "failed") return null;
    const outcomes = all.filter((o) => o.q === id);
    const myAttempts = mine.filter((a) => a.q === id);
    const solved = myAttempts.some((a) => a.correct);
    const soloSolved = myAttempts.some((a) => a.correct && a.hint < 0 && a.n === 1);
    return {
      id, title: PROBLEM_META[id].title, tags: PROBLEM_META[id].tags,
      conceptId: q.conceptId, conceptTitle: conceptById.get(q.conceptId)?.title ?? q.conceptId,
      difficulty: q.difficulty, xp: XP_RULES.base(q.difficulty),
      status: solved ? "solved" as const : myAttempts.length ? "attempted" as const : "new" as const,
      soloSolved,
      acceptance: outcomes.length >= MIN_FOR_ACCEPTANCE ? outcomes.filter((o) => o.correct).length / outcomes.length : null,
      submissions: outcomes.length,
      daily: id === daily,
    };
  }).filter((r): r is NonNullable<typeof r> => r !== null);
  return { problems: rows, daily: rows.find((r) => r.daily) ?? null, dailyBonus: XP_RULES.dailyChallenge };
}
export type ArenaProblem = Awaited<ReturnType<typeof arenaProblems>>["problems"][number];

export async function setLeaderboardOptIn(studentId: string, show: boolean) {
  const db = await getDb();
  await db.update(schema.studentProfiles).set({ showOnLeaderboard: show }).where(eq(schema.studentProfiles.userId, studentId));
  await db.insert(schema.auditLog).values({ actorId: studentId, action: show ? "leaderboard.joined" : "leaderboard.left", targetType: "user", targetId: studentId });
}

/**
 * Weekly (or all-time) XP ranking among students who chose to appear. Only display names and XP
 * are shown. Computed on request — fine for an early version; precompute per week when it grows.
 */
export async function leaderboard(studentId: string, period: "week" | "all" = "week", now = new Date()) {
  const db = await getDb();
  const [me, optedIn] = await Promise.all([
    db.query.studentProfiles.findFirst({ where: eq(schema.studentProfiles.userId, studentId) }),
    db.select({ id: schema.users.id, name: schema.users.displayName })
      .from(schema.studentProfiles).innerJoin(schema.users, eq(schema.users.id, schema.studentProfiles.userId))
      .where(eq(schema.studentProfiles.showOnLeaderboard, true)),
  ]);
  const scored = await Promise.all(optedIn.map(async (u) => {
    const p = await progression(db, u.id, now);
    return { id: u.id, name: u.name, xp: period === "week" ? p.week.xp : p.xp, totalXp: p.xp, level: levelFor(p.xp).name, streak: p.streak.best, you: u.id === studentId };
  }));
  const ranked = scored.filter((r) => r.xp > 0 || r.you).sort((a, b) => b.xp - a.xp || a.name.localeCompare(b.name))
    .map((r, i) => ({ ...r, rank: i + 1 }));
  return {
    period, joined: Boolean(me?.showOnLeaderboard), participants: optedIn.length,
    top: ranked.slice(0, 20), you: ranked.find((r) => r.you) ?? null,
  };
}
