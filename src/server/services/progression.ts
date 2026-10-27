/**
 * Competing with yourself: XP, levels, personal bests and week-over-week progress.
 *
 * Everything is recomputed from stored outcomes (nothing is stored or granted separately), and XP
 * only rewards learning behaviour that matters: solving (more for harder and for solving without
 * help), fixing mistakes, clearing misunderstandings, finishing lessons and revision. Wrong answers
 * never cost XP, placement-check answers earn none, and speed is never rewarded.
 */
import { and, eq } from "drizzle-orm";
import { schema, type Tx } from "@/server/db/client";
import { dailyChallengeFor } from "@/content/problems";
import { COURSE_MODULES } from "@/content/course";
import { pyState } from "@/server/python/state";

export const LEVELS = [
  { name: "Beginner", xp: 0 },
  { name: "Explorer", xp: 150 },
  { name: "Builder", xp: 400 },
  { name: "Problem Solver", xp: 900 },
  { name: "Algorithmist", xp: 1800 },
  { name: "C++ Master", xp: 3200 },
] as const;

export const XP_RULES = {
  /** Base XP for a correct answer by difficulty 1..5, scaled by credit (hints/retries reduce it). */
  base: (difficulty: number) => 10 + 4 * (Math.min(5, Math.max(1, difficulty)) - 1),
  mistakeFixed: 15,
  misconceptionCleared: 20,
  lessonCompleted: 30,
  revisionCompleted: 20,
  practiceCompleted: 10,
  /** Solving the Daily Challenge on its day (any help level). */
  dailyChallenge: 25,
  /**
   * Passing a step-by-step lesson's exercise (judged by the compiler), by how much help was used
   * before passing: at most one hint → 25, two → 20, three or four → 15, after the worked solution → 5.
   */
  lessonPassed: (hintLevel: number, afterSolution: boolean) => (afterSolution ? 5 : hintLevel <= 1 ? 25 : hintLevel === 2 ? 20 : 15),
  /** Finishing every lesson in a module. */
  moduleCompleted: 50,
  /**
   * Passing a lesson's practice problem: intermediate 20, challenge 30 at most one hint; fewer XP
   * with more hints (−5 per level above one, at least half), 5 after the worked solution.
   */
  practicePassed: (level: "intermediate" | "challenge", hintLevel: number, afterSolution: boolean) => {
    const full = level === "challenge" ? 30 : 20;
    if (afterSolution) return 5;
    return Math.max(full / 2, full - 5 * Math.max(0, hintLevel - 1));
  },
} as const;

export interface PathRow { lessonId: string; passedAt: Date | null; passedHintLevel: number | null; passedAfterSolution: boolean | null }

/** XP events from the step-by-step lesson path: one per passed exercise, plus a bonus per finished module. */
export function pathXpEvents(rows: PathRow[]): { at: Date; xp: number; lessonId: string | null; moduleId: string | null }[] {
  const passed = new Map(rows.filter((r) => r.passedAt).map((r) => [r.lessonId, r]));
  const events = [...passed.values()].map((r) => {
    const practice = r.lessonId.includes("~") ? (r.lessonId.endsWith("~p3") ? "challenge" : "intermediate") : null;
    const xp = practice
      ? XP_RULES.practicePassed(practice, r.passedHintLevel ?? 0, Boolean(r.passedAfterSolution))
      : XP_RULES.lessonPassed(r.passedHintLevel ?? 0, Boolean(r.passedAfterSolution));
    return { at: r.passedAt!, xp, lessonId: r.lessonId as string | null, moduleId: null as string | null };
  });
  for (const m of COURSE_MODULES) {
    if (!m.lessons.length || !m.lessons.every((id) => passed.has(id))) continue;
    const at = new Date(Math.max(...m.lessons.map((id) => passed.get(id)!.passedAt!.getTime())));
    events.push({ at, xp: XP_RULES.moduleCompleted, lessonId: null, moduleId: m.id });
  }
  return events;
}

export function xpForOutcome(o: { correct: boolean; credit: number; difficulty: number; solutionRevealed: boolean; context: string }) {
  if (!o.correct || o.solutionRevealed || o.context === "diagnostic") return 0;
  return Math.round(XP_RULES.base(o.difficulty) * o.credit);
}

export function levelFor(xp: number) {
  let i = 0;
  while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1].xp) i++;
  const cur = LEVELS[i];
  const next = LEVELS[i + 1] ?? null;
  return {
    index: i, name: cur.name, next: next?.name ?? null, nextAt: next?.xp ?? null,
    progress: next ? (xp - cur.xp) / (next.xp - cur.xp) : 1,
    toNext: next ? next.xp - xp : 0,
  };
}

interface OutcomeRow { correct: boolean; independent: boolean; credit: number; difficulty: number; solutionRevealed: boolean; context: string; createdAt: Date; sessionId: string | null }

/** Longest run of consecutive independent correct answers, plus the run still going at the end. */
export function streaks(rows: Pick<OutcomeRow, "correct" | "independent" | "context">[]) {
  let best = 0;
  let cur = 0;
  for (const r of rows) {
    if (r.context === "diagnostic") continue;
    if (r.correct && r.independent) best = Math.max(best, ++cur);
    else cur = 0;
  }
  return { best, current: cur };
}

/** Correct, non-revealed solves of the Daily Challenge on its own day (one bonus per day). */
export function dailySolves<T extends { questionId: string; correct: boolean; solutionRevealed: boolean; createdAt: Date }>(rows: T[]): T[] {
  const seen = new Set<string>();
  return rows.filter((o) => {
    const day = o.createdAt.toISOString().slice(0, 10);
    if (!o.correct || o.solutionRevealed || seen.has(day) || dailyChallengeFor(o.createdAt) !== o.questionId) return false;
    seen.add(day);
    return true;
  });
}

export async function progression(db: Tx, studentId: string, now = new Date()) {
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 86_400_000);
  const [outcomes, fixed, resolved, sessions, pathEvents, py] = await Promise.all([
    db.select({
      correct: schema.itemOutcomes.correct, independent: schema.itemOutcomes.independent, credit: schema.itemOutcomes.credit,
      difficulty: schema.itemOutcomes.difficulty, solutionRevealed: schema.itemOutcomes.solutionRevealed, context: schema.itemOutcomes.context,
      createdAt: schema.itemOutcomes.createdAt, sessionId: schema.itemOutcomes.sessionId, questionId: schema.itemOutcomes.questionId,
    }).from(schema.itemOutcomes).where(eq(schema.itemOutcomes.studentId, studentId)).orderBy(schema.itemOutcomes.createdAt),
    db.select({ at: schema.mistakes.fixedAt }).from(schema.mistakes).where(and(eq(schema.mistakes.studentId, studentId), eq(schema.mistakes.status, "fixed"))),
    db.select({ at: schema.sessionEvents.createdAt, payload: schema.sessionEvents.payload }).from(schema.sessionEvents)
      .where(and(eq(schema.sessionEvents.studentId, studentId), eq(schema.sessionEvents.type, "misconception_resolved"))),
    db.select({ id: schema.learningSessions.id, kind: schema.learningSessions.kind, endedAt: schema.learningSessions.endedAt, startedAt: schema.learningSessions.startedAt })
      .from(schema.learningSessions).where(and(eq(schema.learningSessions.studentId, studentId), eq(schema.learningSessions.status, "completed"))),
    db.select({ lessonId: schema.courseProgress.lessonId, passedAt: schema.courseProgress.passedAt, passedHintLevel: schema.courseProgress.passedHintLevel, passedAfterSolution: schema.courseProgress.passedAfterSolution })
      .from(schema.courseProgress).where(eq(schema.courseProgress.studentId, studentId)),
    // The Python path adds to the same XP total (one learner profile across languages).
    pyState(db, studentId, now),
  ]);

  // Every XP event with its timestamp, so totals and weekly windows come from the same list.
  const events: { at: Date; xp: number; sessionId: string | null }[] = [
    ...outcomes.map((o) => ({ at: o.createdAt, xp: xpForOutcome(o), sessionId: o.sessionId })),
    ...dailySolves(outcomes).map((o) => ({ at: o.createdAt, xp: XP_RULES.dailyChallenge, sessionId: o.sessionId })),
    ...fixed.filter((f) => f.at).map((f) => ({ at: f.at!, xp: XP_RULES.mistakeFixed, sessionId: null })),
    ...resolved.map((r) => ({ at: r.at, xp: XP_RULES.misconceptionCleared * (((r.payload as { codes?: string[] }).codes ?? []).length || 1), sessionId: null })),
    ...sessions.map((s) => ({
      at: s.endedAt ?? s.startedAt, sessionId: s.id,
      xp: s.kind === "lesson" ? XP_RULES.lessonCompleted : s.kind === "revision" ? XP_RULES.revisionCompleted : s.kind === "practice" ? XP_RULES.practiceCompleted : 0,
    })),
    ...pathXpEvents(pathEvents).map((e) => ({ at: e.at, xp: e.xp, sessionId: null })),
    ...py.xpEvents.map((e) => ({ at: e.at, xp: e.xp, sessionId: null })),
  ];
  const total = events.reduce((s, e) => s + e.xp, 0);
  const thisWeek = events.filter((e) => e.at >= weekAgo).reduce((s, e) => s + e.xp, 0);
  const lastWeek = events.filter((e) => e.at >= twoWeeksAgo && e.at < weekAgo).reduce((s, e) => s + e.xp, 0);

  const st = streaks(outcomes);
  const solo = outcomes.filter((o) => o.correct && o.independent && o.context !== "diagnostic");
  const hardestSolo = solo.length ? Math.max(...solo.map((o) => o.difficulty)) : null;
  const bySession = new Map<string, OutcomeRow[]>();
  for (const o of outcomes) if (o.sessionId && o.context !== "diagnostic") bySession.set(o.sessionId, [...(bySession.get(o.sessionId) ?? []), o]);
  let bestSession: { accuracy: number; questions: number } | null = null;
  for (const rows of bySession.values()) {
    if (rows.length < 5) continue;
    const acc = rows.filter((r) => r.correct).length / rows.length;
    if (!bestSession || acc > bestSession.accuracy || (acc === bestSession.accuracy && rows.length > bestSession.questions)) bestSession = { accuracy: acc, questions: rows.length };
  }
  return {
    xp: total,
    level: levelFor(total),
    week: { xp: thisWeek, lastWeekXp: lastWeek },
    streak: st,
    hardestSolo,
    bestSession,
    solvedSolo: solo.length,
    dailySolvedToday: dailySolves(outcomes).some((o) => o.createdAt.toISOString().slice(0, 10) === now.toISOString().slice(0, 10)),
    sessionXp: (sessionId: string) => events.filter((e) => e.sessionId === sessionId).reduce((s, e) => s + e.xp, 0),
    /** Best streak achieved before a given session started (for "new personal best" in reports). */
    bestStreakBefore: (start: Date) => streaks(outcomes.filter((o) => o.createdAt < start)).best,
  };
}
export type Progression = Awaited<ReturnType<typeof progression>>;
