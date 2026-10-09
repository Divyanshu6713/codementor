import { describe, expect, it } from "vitest";
import { count, eq } from "drizzle-orm";
import { createTestDb, schema } from "@/server/db/client";
import { syncContent } from "@/server/content/sync";
import { CONCEPTS, QUESTIONS, validateContent } from "@/content";
import { splitQuestion } from "@/server/content/question-parts";

describe("canonical content", () => {
  it("is internally consistent", () => {
    expect(validateContent()).toEqual([]);
  });

  it("never leaks answers into student-visible content", () => {
    for (const q of QUESTIONS) {
      const { content } = splitQuestion(q);
      const json = JSON.stringify(content);
      expect(json).not.toMatch(/"(correct|accepted|answer|misconception|rubric|detectors|referenceSolution)"/);
      if (q.type === "write_code") {
        expect(json).not.toContain(JSON.stringify(q.referenceSolution).slice(1, -1));
        const hiddenLabels = q.tests.filter((t) => t.visibility === "hidden").map((t) => t.label);
        for (const label of hiddenLabels) expect(json).not.toContain(JSON.stringify(label));
      }
    }
  });

  it("reorder content is shuffled and the key restores the original", () => {
    for (const q of QUESTIONS) {
      if (q.type !== "reorder") continue;
      const { content, answerKey } = splitQuestion(q);
      if (content.type !== "reorder" || answerKey.type !== "reorder") throw new Error("type");
      expect(content.lines).not.toEqual(q.lines);
      expect(answerKey.order.map((i) => content.lines[i])).toEqual(q.lines);
    }
  });

  it("syncs into a fresh database and is idempotent; a changed question gets a new version", async () => {
    const { db, close } = await createTestDb();
    const [{ n }] = await db.select({ n: count() }).from(schema.questions);
    expect(n).toBe(QUESTIONS.length);
    const [{ c }] = await db.select({ c: count() }).from(schema.concepts);
    expect(c).toBe(CONCEPTS.length);
    await syncContent(db);
    const [{ v }] = await db.select({ v: count() }).from(schema.questionVersions);
    expect(v).toBe(QUESTIONS.length);

    const q = QUESTIONS.find((x) => x.id === "fl-po-1")!;
    const original = q.explanation;
    q.explanation = original + " (edited)";
    try {
      await syncContent(db);
      const versions = await db.select().from(schema.questionVersions).where(eq(schema.questionVersions.questionId, "fl-po-1"));
      expect(versions.map((x) => x.version).sort()).toEqual([1, 2]);
      const row = await db.query.questions.findFirst({ where: eq(schema.questions.id, "fl-po-1") });
      expect(row?.currentVersion).toBe(2);
    } finally {
      q.explanation = original;
      await close();
    }
  });
});
