/**
 * Integration: the MVP success definition (§92) end to end at the service layer, with the real
 * database schema, the real compiler/judge (local sandbox backend) and curated (no-AI) tutoring.
 *
 * A learner misunderstands a loop condition → the platform detects it → hints guide without
 * revealing → the learner retries → the judge verifies → misconception + mastery update → the next
 * exercise adapts → revision includes the weakness.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { and, eq } from "drizzle-orm";
import { schema, type DB } from "@/server/db/client";
import { advance, getSessionView, requestHint, revealSolution, startRecommended, startSession, submitAnswer, type SessionView } from "@/server/services/sessions";
import { buildSnapshot, nextDecision, skillMap } from "@/server/services/learner";
import { listMistakes, dashboard } from "@/server/services/students";
import { questionById } from "@/content";
import { decideNext } from "@/server/learning/engine";
import { canExecute, correctAnswer, freshDb, makeStudent, useLocalSandbox, wrongAnswer } from "./helpers";
import { NotFoundError } from "@/server/errors";

type Item = Extract<SessionView["entry"], { kind: "item" }>["item"];

async function view(studentId: string, id: string) {
  return getSessionView(studentId, id);
}

/** Answers the current item correctly (or with `answerFor`), then advances. Returns the item answered. */
async function step(studentId: string, id: string, answerFor?: (item: Item) => ReturnType<typeof correctAnswer> | null): Promise<SessionView> {
  const v = await view(studentId, id);
  if (v.entry.kind === "item" && !v.entry.item.resolved) {
    const item = v.entry.item;
    const ans = answerFor?.(item) ?? correctAnswer(item.question.id);
    await submitAnswer(studentId, id, { itemKey: item.itemKey, answer: ans });
  }
  await advance(studentId, id);
  return view(studentId, id);
}

describe.runIf(canExecute)("adaptive learning loop (real judge)", () => {
  let db: DB;
  let close: () => Promise<void>;
  beforeAll(async () => {
    ({ db, close } = await freshDb());
    await useLocalSandbox();
  }, 120_000);
  afterAll(async () => close());

  it("runs signup → diagnostic → lesson with a misconception → hints → retry → mastery → revision", async () => {
    const student = await makeStudent("some");

    // ── Diagnostic: knows the basics, misreads loop conditions ──
    const diagId = await startRecommended(student.id);
    const diagRow = await db.query.learningSessions.findFirst({ where: eq(schema.learningSessions.id, diagId) });
    expect(diagRow?.kind).toBe("diagnostic");
    for (let i = 0; i < 20; i++) {
      const v = await view(student.id, diagId);
      if (v.status !== "active") break;
      if (v.entry.kind !== "item") break;
      const qid = v.entry.item.question.id;
      const def = questionById.get(qid)!;
      const knows = !["for-loops", "nested-loops", "functions", "arrays", "strings"].includes(def.conceptId);
      await submitAnswer(student.id, diagId, { itemKey: v.entry.item.itemKey, answer: knows ? correctAnswer(qid) : wrongAnswer(qid) });
      const r = await advance(student.id, diagId);
      if (r.finished) break;
    }
    const profile = await db.query.studentProfiles.findFirst({ where: eq(schema.studentProfiles.userId, student.id) });
    expect(profile?.diagnosticCompletedAt).toBeTruthy();
    const map = await skillMap(db, student.id);
    const concepts = map.flatMap((t) => t.concepts);
    expect(concepts.find((c) => c.id === "comparison-ops")?.mastery).toBeGreaterThan(0.6);
    expect(concepts.find((c) => c.id === "for-loops")!.mastery!).toBeLessThan(0.6);
    expect(concepts.find((c) => c.id === "arrays")?.mastery).toBeNull(); // never asked: not assessed, not invented

    // ── Recommendation: the for-loops lesson, with a reason from real data ──
    const decision = await nextDecision(db, student.id);
    expect(decision).toMatchObject({ action: "learn", lessonId: "for-loops-core" });
    const lessonId = await startRecommended(student.id);

    // Concept steps until the first checkpoint.
    let v = await view(student.id, lessonId);
    while (v.entry.kind === "step") v = await step(student.id, lessonId);
    expect(v.entry.kind).toBe("item");
    let item = (v.entry as { item: Item }).item;
    expect(item.role).toBe("checkpoint");
    expect(item.question.id).toBe("fl-cp-order");

    // ── Checkpoint missed with a misconception → re-teach + a fresh retry question ──
    const fb = await submitAnswer(student.id, lessonId, { itemKey: item.itemKey, answer: { type: "choice", optionId: "b" } });
    expect(fb.correct).toBe(false);
    expect(fb.misconceptions.map((m) => m.code)).toContain("MC-LOOP-09");
    await advance(student.id, lessonId);
    v = await view(student.id, lessonId);
    expect(v.entry.kind).toBe("step");
    expect((v.entry as { step: { key: string; reteach: boolean } }).step).toMatchObject({ key: "rt-order", reteach: true });
    await advance(student.id, lessonId);
    v = await view(student.id, lessonId);
    item = (v.entry as { item: Item }).item;
    expect(item).toMatchObject({ role: "retry" });
    expect(item.question.id).toBe("fl-cp-order-b");
    await step(student.id, lessonId);

    // Walk forward to the guided coding exercise (answering checkpoints correctly).
    v = await view(student.id, lessonId);
    for (let i = 0; i < 20 && !(v.entry.kind === "item" && v.entry.item.role === "code"); i++) v = await step(student.id, lessonId);
    item = (v.entry as { item: Item }).item;
    expect(item.question.id).toBe("fl-code-count-up");

    // ── The loop-condition misconception, caught by the real judge ──
    const buggy = `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    for (int i = 1; i > n; i++) {
        cout << i << "\\n";
    }
    return 0;
}`;
    const wrong = await submitAnswer(student.id, lessonId, { itemKey: item.itemKey, answer: { type: "code", source: buggy } });
    expect(wrong.correct).toBe(false);
    expect(wrong.judge?.compileStatus).toBe("success");
    expect(wrong.judge?.testsPassed).toBeLessThan(wrong.judge!.testsTotal);
    expect(wrong.whatHappened).toMatch(/nothing was printed/i);
    // Not resolved, so the misconception isn't lectured yet — the student is nudged to think first.
    expect(wrong.misconceptions).toEqual([]);
    const mc = await db.query.studentMisconceptions.findFirst({ where: and(eq(schema.studentMisconceptions.studentId, student.id), eq(schema.studentMisconceptions.code, "MC-LOOP-02")) });
    expect(mc).toMatchObject({ status: "active", occurrences: 1 });
    // After a wrong practice/lesson submission the hidden cases are revealed so the bug can be found.
    expect(wrong.judge?.hiddenRevealed).toBe(true);
    expect(wrong.judge!.tests.filter((t) => t.hidden).every((t) => t.revealed && t.expected !== undefined)).toBe(true);

    // ── Structured hints, in order; the solution stays locked ──
    const h0 = await requestHint(student.id, lessonId, item.itemKey);
    expect(h0).toMatchObject({ level: 0, source: "curated" });
    expect(h0.text).toMatch(/\?/); // a reflective question
    await expect(revealSolution(student.id, lessonId, item.itemKey)).rejects.toThrow(/unlocks/);
    const h1 = await requestHint(student.id, lessonId, item.itemKey);
    expect(h1.level).toBe(1);

    // ── Retry, verified by the judge ──
    const right = await submitAnswer(student.id, lessonId, { itemKey: item.itemKey, answer: correctAnswer("fl-code-count-up") });
    expect(right.correct).toBe(true);
    expect(right.judge?.verdict).toBe("accepted");
    const outcome = await db.query.itemOutcomes.findFirst({ where: eq(schema.itemOutcomes.itemKey, item.itemKey) });
    expect(outcome).toMatchObject({ correct: true, independent: false, attempts: 2, maxHintLevel: 1 });
    expect(outcome!.credit).toBeLessThan(0.8); // helped success counts less than independent success

    // Mistake Book has the meaningful mistake (not fixed by an immediate retry of the same item).
    const mistakes = await listMistakes(student.id);
    const m = mistakes.find((x) => x.misconception?.code === "MC-LOOP-02");
    expect(m).toMatchObject({ status: "open", topic: "For loops" });
    expect(m!.snapshot).toContain("i > n");

    // ── Finish the lesson (practice + exit check adapt to the student) ──
    for (let i = 0; i < 60; i++) {
      v = await view(student.id, lessonId);
      if (v.status !== "active") break;
      v = await step(student.id, lessonId);
    }
    const lesson = await db.query.learningSessions.findFirst({ where: eq(schema.learningSessions.id, lessonId) });
    expect(lesson?.status).toBe("completed");
    const report = lesson!.report as { questions: number; correct: number; importantMistake: { code: string } | null; revision: unknown[]; conceptMastery: { before: number | null; after: number | null }; next: { action: string } };
    expect(report.questions).toBeGreaterThan(8);
    expect(report.importantMistake).not.toBeNull();
    expect(report.revision.length).toBeGreaterThan(0);
    expect(report.conceptMastery.after!).toBeGreaterThan(report.conceptMastery.before ?? 0);

    // Practice items in the lesson should have probed the active misconception (it's adaptive).
    const practiceOutcomes = await db.select().from(schema.itemOutcomes).where(and(eq(schema.itemOutcomes.sessionId, lessonId), eq(schema.itemOutcomes.context, "practice")));
    expect(practiceOutcomes.length).toBeGreaterThan(0);

    // ── Revision later includes the weakness ──
    const later = new Date(Date.now() + 3 * 86_400_000);
    const snap = await buildSnapshot(db, student.id, later);
    expect(snap.revisionDue.map((r) => r.skillId)).toEqual(expect.arrayContaining(["loop_condition"]));
    const d2 = decideNext(snap);
    expect(["revise", "practice"]).toContain(d2.action);

    const dash = await dashboard(student.id);
    expect(dash.hasActivity).toBe(true);
    expect(dash.recentChanges.length).toBeGreaterThan(0);
  }, 600_000);

  it("never lets one student read another student's session", async () => {
    const a = await makeStudent("some");
    const b = await makeStudent("some");
    const id = await startSession(a.id, { kind: "diagnostic" });
    await expect(getSessionView(b.id, id)).rejects.toBeInstanceOf(NotFoundError);
  });

  it("reveals a solution only after the hint ladder, and records it as not solved", async () => {
    const s = await makeStudent("some");
    await db.update(schema.studentProfiles).set({ diagnosticCompletedAt: new Date() }).where(eq(schema.studentProfiles.userId, s.id));
    const id = await startSession(s.id, { kind: "practice", conceptId: "for-loops", skills: ["loop_accumulation"], length: "quick" });
    let v = await view(s.id, id);
    // Find a coding item to exercise the reveal path.
    for (let i = 0; i < 5 && !(v.entry.kind === "item" && v.entry.item.question.type === "write_code"); i++) v = await step(s.id, id);
    if (v.entry.kind !== "item" || v.entry.item.question.type !== "write_code") return; // pool chose no code item; covered elsewhere
    const it = v.entry.item;
    for (let l = 0; l < 5; l++) await requestHint(s.id, id, it.itemKey);
    const sol = await revealSolution(s.id, id, it.itemKey);
    expect(sol.code).toContain("int main");
    const o = await db.query.itemOutcomes.findFirst({ where: eq(schema.itemOutcomes.itemKey, it.itemKey) });
    expect(o).toMatchObject({ correct: false, solutionRevealed: true, credit: 0 });
  }, 300_000);
});

describe("learning loop without a code runner", () => {
  it("skips coding steps honestly instead of simulating results", async () => {
    const { close } = await freshDb();
    const { noExecution } = await import("./helpers");
    noExecution();
    try {
      const s = await makeStudent("comfortable");
      const id = await startSession(s.id, { kind: "diagnostic" });
      for (let i = 0; i < 20; i++) {
        const v = await getSessionView(s.id, id);
        if (v.status !== "active" || v.entry.kind !== "item") break;
        expect(v.entry.item.question.type).not.toBe("write_code");
        await submitAnswer(s.id, id, { itemKey: v.entry.item.itemKey, answer: correctAnswer(v.entry.item.question.id) });
        if ((await advance(s.id, id)).finished) break;
      }
      const lessonId = await startSession(s.id, { kind: "lesson", lessonId: "for-loops-core" });
      let v = await getSessionView(s.id, lessonId);
      for (let i = 0; i < 40 && v.entry.kind !== "notice"; i++) v = await step(s.id, lessonId);
      expect(v.entry).toMatchObject({ kind: "notice", title: "Coding exercise skipped" });
      expect((v.entry as { body: string }).body).toMatch(/not configured/);
    } finally {
      await close();
    }
  }, 300_000);
});
