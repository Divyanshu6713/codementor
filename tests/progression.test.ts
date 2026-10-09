import { describe, expect, it } from "vitest";
import { LEVELS, dailySolves, levelFor, streaks, xpForOutcome } from "@/server/services/progression";
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
