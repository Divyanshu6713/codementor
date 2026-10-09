/**
 * Hidden test cases: hidden until a wrong submission, then shown in full so the student can fix the
 * bug before resubmitting. "Run tests" never counts as a submission. Solving after the reveal still
 * counts, but like using a hint (not a solo solve).
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { schema, type DB } from "@/server/db/client";
import { getSessionView, runTests, startSession, submitAnswer } from "@/server/services/sessions";
import { XP_RULES } from "@/server/services/progression";
import { canExecute, correctAnswer, freshDb, makeStudent, useLocalSandbox } from "./helpers";

const BUGGY = `#include <iostream>
using namespace std;
int main() {
    int n;
    cin >> n;
    for (int i = n; i > 1; i--) cout << i << " ";
    return 0;
}`;

describe.runIf(canExecute)("revealing hidden test cases", () => {
  let db: DB;
  let close: () => Promise<void>;
  beforeAll(async () => {
    ({ db, close } = await freshDb());
    await useLocalSandbox();
  }, 120_000);
  afterAll(async () => close());

  it("hides hidden cases until a wrong submission, then shows them; a later solve counts like a hint", async () => {
    const s = await makeStudent("some");
    await db.update(schema.studentProfiles).set({ diagnosticCompletedAt: new Date() }).where(eq(schema.studentProfiles.userId, s.id));
    const id = await startSession(s.id, { kind: "practice", questionId: "fl-code-count-down", length: "quick" });
    const view = await getSessionView(s.id, id);
    if (view.entry.kind !== "item") throw new Error("expected an item");
    const itemKey = view.entry.item.itemKey;
    expect(view.entry.item.canRunTests).toBe(true);

    // Run tests before any submission: hidden cases are pass/fail only.
    const pre = await runTests(s.id, id, itemKey, BUGGY);
    const hiddenPre = pre.tests.filter((t) => t.hidden);
    expect(hiddenPre.length).toBeGreaterThan(0);
    expect(hiddenPre.every((t) => !t.revealed && t.input === undefined)).toBe(true);
    // ...and it didn't count as an attempt.
    expect(await db.select().from(schema.attempts).where(eq(schema.attempts.sessionId, id))).toHaveLength(0);

    // A wrong submission reveals every case.
    const wrong = await submitAnswer(s.id, id, { itemKey, answer: { type: "code", source: BUGGY } });
    expect(wrong.correct).toBe(false);
    expect(wrong.judge?.hiddenRevealed).toBe(true);
    const revealed = wrong.judge!.tests.filter((t) => t.hidden);
    expect(revealed.every((t) => t.revealed && typeof t.input === "string" && typeof t.expected === "string")).toBe(true);

    // Run tests now shows hidden details too.
    const post = await runTests(s.id, id, itemKey, BUGGY);
    expect(post.tests.filter((t) => t.hidden).every((t) => t.revealed)).toBe(true);

    // Fix and resubmit: correct, but not independent and not full XP.
    const right = await submitAnswer(s.id, id, { itemKey, answer: correctAnswer("fl-code-count-down") });
    expect(right.correct).toBe(true);
    const outcome = await db.query.itemOutcomes.findFirst({ where: eq(schema.itemOutcomes.itemKey, itemKey) });
    expect(outcome).toMatchObject({ correct: true, independent: false, maxHintLevel: 1 });
    expect(right.xp!).toBeLessThan(XP_RULES.base(2));
  }, 300_000);

  it("never reveals hidden cases in an exit check", async () => {
    const s = await makeStudent("some");
    await db.update(schema.studentProfiles).set({ diagnosticCompletedAt: new Date() }).where(eq(schema.studentProfiles.userId, s.id));
    const id = await startSession(s.id, { kind: "practice", questionId: "fl-code-count-down", length: "quick" });
    // Force this item into an exit-check role to exercise the guard.
    const row = await db.query.learningSessions.findFirst({ where: eq(schema.learningSessions.id, id) });
    const state = row!.state as { item: { role: string } };
    state.item.role = "exit";
    await db.update(schema.learningSessions).set({ state }).where(eq(schema.learningSessions.id, id));
    const view = await getSessionView(s.id, id);
    if (view.entry.kind !== "item") throw new Error("expected an item");
    const wrong = await submitAnswer(s.id, id, { itemKey: view.entry.item.itemKey, answer: { type: "code", source: BUGGY } });
    expect(wrong.judge?.hiddenRevealed).toBe(false);
    expect(wrong.judge!.tests.filter((t) => t.hidden).every((t) => t.input === undefined)).toBe(true);
  }, 300_000);
});
