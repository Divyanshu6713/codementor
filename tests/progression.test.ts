import { describe, expect, it } from "vitest";
import { LEVELS, XP_RULES, dailySolves, levelFor, pathXpEvents, streaks, xpForOutcome } from "@/server/services/progression";
import { dailyChallengeFor } from "@/content/problems";

describe("progression (compete with yourself)", () => {
  it("awards more XP for harder and hint-free solves, nothing for wrong, revealed or placement answers", () => {
    const solo = (d: number) => xpForOutcome({ correct: true, credit: 1, difficulty: d, solutionRevealed: false, context: "practice" });
    expect(solo(1)).toBe(10);
    expect(solo(5)).toBe(26);
    expect(xpForOutcome({ correct: true, credit: 0.5, difficulty: 3, solutionRevealed: false, context: "practice" })).toBe(9);
    expect(xpForOutcome({ correct: false, credit: 0, difficulty: 3, solutionRevealed: false, context: "practice" })).toBe(0);
    expect(xpForOutcome({ correct: true, credit: 1, difficulty: 3, solutionRevealed: true, context: "practice" })).toBe(0);
    expect(xpForOutcome({ correct: true, credit: 1, difficulty: 3, solutionRevealed: false, context: "diagnostic" })).toBe(0);
  });

  it("maps XP to levels and distance to the next one", () => {
    expect(levelFor(0)).toMatchObject({ name: "Beginner", next: "Explorer", toNext: 150 });
    expect(levelFor(400)).toMatchObject({ name: "Builder", index: 2 });
    expect(levelFor(99999)).toMatchObject({ name: LEVELS.at(-1)!.name, next: null, progress: 1 });
  });

  it("counts solo streaks: hints or misses break them, placement answers are ignored", () => {
    const ok = { correct: true, independent: true, context: "practice" };
    const hinted = { correct: true, independent: false, context: "practice" };
    const diag = { correct: false, independent: false, context: "diagnostic" };
    expect(streaks([ok, ok, hinted, ok, diag, ok, ok])).toEqual({ best: 3, current: 3 });
  });

  it("gives the Daily Challenge bonus once per day, only for that day's problem", () => {
    const day = new Date("2026-10-07T09:00:00Z");
    const pick = dailyChallengeFor(day);
    const other = pick === "fl-code-evens" ? "fl-code-table" : "fl-code-evens";
    const row = (questionId: string, at: Date, correct = true) => ({ questionId, correct, solutionRevealed: false, createdAt: at });
    const rows = [row(pick, day), row(pick, new Date("2026-10-07T15:00:00Z")), row(other, day), row(pick, new Date("2026-10-07T10:00:00Z"), false)];
    expect(dailySolves(rows)).toHaveLength(1);
    expect(dailyChallengeFor(day)).toBe(dailyChallengeFor(new Date("2026-10-07T23:59:00Z")));
  });
});

describe("practice problem XP", () => {
  it("intermediate 20 and challenge 30, reduced by hints, 5 after the worked solution", () => {
    expect(XP_RULES.practicePassed("intermediate", 0, false)).toBe(20);
    expect(XP_RULES.practicePassed("intermediate", 1, false)).toBe(20);
    expect(XP_RULES.practicePassed("intermediate", 3, false)).toBe(10);
    expect(XP_RULES.practicePassed("intermediate", 4, false)).toBe(10);
    expect(XP_RULES.practicePassed("challenge", 2, false)).toBe(25);
    expect(XP_RULES.practicePassed("challenge", 4, false)).toBe(15);
    expect(XP_RULES.practicePassed("challenge", 0, true)).toBe(5);
  });

  it("practice passes earn their own XP and don't count as lessons for module completion", () => {
    const at = new Date("2026-10-01T00:00:00Z");
    const row = (lessonId: string) => ({ lessonId, passedAt: at, passedHintLevel: 0, passedAfterSolution: false });
    const events = pathXpEvents([row("for-loops~p2"), row("for-loops~p3")]);
    expect(events.map((e) => e.xp).sort()).toEqual([20, 30]);
    expect(events.some((e) => e.moduleId)).toBe(false);
  });
});
