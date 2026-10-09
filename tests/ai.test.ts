/**
 * AI output handling (§69): the AI's text never becomes system state, and bad outputs fall back to
 * curated content. Uses fixture providers — no network calls.
 */
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { count, eq } from "drizzle-orm";
import { schema, type DB } from "@/server/db/client";
import { aiHint, aiMistakeExplanation, aiTutorReply, setAIProviderForTesting } from "@/server/ai";
import { curatedProvider } from "@/server/ai/curated";
import { claimsUnverifiedExecution, revealsSolution } from "@/server/ai/guardrails";
import type { AIProvider, Evidence, HintRequest, StudentContext } from "@/server/ai/types";
import { validateGenerated } from "@/server/services/question-generation";
import { questionById } from "@/content";
import { canExecute, freshDb, makeStudent, useLocalSandbox } from "./helpers";

const student: StudentContext = {
  displayName: "Asha", grade: "8", goal: null, explanationLevel: "standard", activeConcept: null, skills: [], misconceptions: [], hintDependency: null, revisionDue: 0,
};
const failing: Evidence = { questionType: "write_code", verdict: "wrong_answer", testsPassed: 1, testsTotal: 5, compileOutput: null, whatHappened: "printed nothing", misconceptions: [] };
const reference = (questionById.get("fl-code-sum") as { referenceSolution: string }).referenceSolution;
const hintReq: HintRequest = {
  level: 1, curatedHint: "CURATED HINT", questionPrompt: "Sum 1..n", questionCode: null, studentAnswer: "int main(){}",
  evidence: failing, answerSummary: "reference exists", student,
};

function fixture(overrides: Partial<AIProvider>): AIProvider {
  return {
    ...curatedProvider, id: "claude", conversational: true,
    generateHint: async () => ({ source: "ai", value: { text: "What value should sum have before the loop starts?" }, usage: { model: "fixture", inputTokens: 10, outputTokens: 5 } }),
    analyzeMistake: async () => ({ source: "ai", value: { explanation: "Your loop never ran for n = 5.", guidingQuestion: "Is 1 > 5 true?" } }),
    tutorReply: async () => ({ source: "ai", value: { reply: "What do you think happens on the first check?" } }),
    ...overrides,
  };
}

describe("guardrail checks", () => {
  it("flags compile/test claims that the judge didn't confirm", () => {
    expect(claimsUnverifiedExecution("Your code compiles fine and all tests pass!", failing)).toBe(true);
    expect(claimsUnverifiedExecution("All tests passed — nice.", { ...failing, verdict: "accepted" })).toBe(false);
    expect(claimsUnverifiedExecution("Look at the loop condition.", failing)).toBe(false);
    expect(claimsUnverifiedExecution("It compiles.", null)).toBe(true);
  });
  it("flags answers that give the solution away", () => {
    expect(revealsSolution("Try:\nint sum = 0;\nfor (int i = 1; i <= n; i++) {\n sum += i;\n}", { referenceSolution: reference })).toBe(true);
    expect(revealsSolution("Think about where sum starts.", { referenceSolution: reference })).toBe(false);
    expect(revealsSolution("The answer is i <= 6", { answerTexts: ["i <= 6"] })).toBe(true);
  });
});

describe("AI service fallbacks", () => {
  let db: DB;
  let close: () => Promise<void>;
  let studentId: string;
  beforeAll(async () => {
    ({ db, close } = await freshDb());
    studentId = (await makeStudent()).id;
  });
  afterEach(() => setAIProviderForTesting(null));
  afterAll(async () => close());

  const statusCount = async (status: string) => (await db.select({ n: count() }).from(schema.aiInteractions).where(eq(schema.aiInteractions.status, status as "ok")))[0].n;

  it("uses a good AI hint and records usage metadata (not content)", async () => {
    setAIProviderForTesting(fixture({}));
    const r = await aiHint(studentId, hintReq, { referenceSolution: reference });
    expect(r).toMatchObject({ source: "ai" });
    const row = await db.query.aiInteractions.findFirst({ where: eq(schema.aiInteractions.purpose, "hint") });
    expect(row).toMatchObject({ status: "ok", inputTokens: 10, promptVersion: "hint-v1" });
    expect(Object.keys(row!)).not.toContain("text");
  });

  it("rejects a hallucinated compiler result and falls back to the curated hint", async () => {
    setAIProviderForTesting(fixture({ generateHint: async () => ({ source: "ai", value: { text: "Good news: your code compiles successfully, just tweak the loop." } }) }));
    const r = await aiHint(studentId, hintReq, { referenceSolution: reference });
    expect(r).toEqual({ source: "curated", value: { text: "CURATED HINT" } });
    expect(await statusCount("guardrail_rejected")).toBeGreaterThan(0);
  });

  it("rejects a hint that reveals the full solution", async () => {
    setAIProviderForTesting(fixture({ generateHint: async () => ({ source: "ai", value: { text: "int sum = 0;\nfor (int i = 1; i <= n; i++) {\n    sum += i;\n}\ncout << sum;" } }) }));
    const r = await aiHint(studentId, hintReq, { referenceSolution: reference });
    expect(r.source).toBe("curated");
  });

  it("falls back when the provider returns invalid structured output (throws)", async () => {
    setAIProviderForTesting(fixture({ analyzeMistake: async () => { throw new Error("The AI response couldn't be validated."); } }));
    const r = await aiMistakeExplanation(studentId, { questionPrompt: "x", studentAnswer: "y", evidence: failing, curatedExplanation: "CURATED", student }, {});
    expect(r.source).toBe("curated");
    expect(await statusCount("error")).toBeGreaterThan(0);
  });

  it("replaces a tutor reply that leaks the answer with a Socratic nudge", async () => {
    setAIProviderForTesting(fixture({ tutorReply: async () => ({ source: "ai", value: { reply: "Just write i <= 6 in the blank." } }) }));
    const r = await aiTutorReply(studentId, { message: "what's the answer", recentTurns: [], lessonContext: null, questionContext: null, student }, { answerTexts: ["i <= 6"] });
    expect(r.value.reply).not.toContain("i <= 6");
  });

  it("without AI configured, tutor chat says so instead of inventing a reply", async () => {
    setAIProviderForTesting(curatedProvider);
    await expect(aiTutorReply(studentId, { message: "hi", recentTurns: [], lessonContext: null, questionContext: null, student }, {})).rejects.toThrow(/isn't configured/);
  });
});

describe.runIf(canExecute)("AI question validation pipeline", () => {
  beforeAll(async () => useLocalSandbox(), 120_000);
  const good = {
    prompt: "Read a number n and print the numbers from 1 to n separated by spaces.",
    starterCode: "#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    return 0;\n}",
    referenceSolution: "#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    for (int i = 1; i <= n; i++) cout << i << \" \";\n    return 0;\n}",
    tests: [
      { label: "n=3", input: "3\n", output: "1 2 3", visibility: "sample" as const, category: "normal" as const },
      { label: "n=1", input: "1\n", output: "1", visibility: "visible" as const, category: "boundary" as const },
      { label: "n=5", input: "5\n", output: "1 2 3 4 5", visibility: "hidden" as const, category: "normal" as const },
      { label: "n=0", input: "0\n", output: "", visibility: "hidden" as const, category: "edge" as const },
    ],
    hints: ["Where does it start?", "Use a loop.", "Inside main.", "Include n itself.", "for (...) { ... }"] as [string, string, string, string, string],
    explanation: "Count from 1 to n.", difficulty: 1,
  };
  it("accepts a question whose reference solution passes its own tests", async () => {
    expect(await validateGenerated(good)).toBeNull();
  });
  it("rejects wrong expected outputs, missing fields, unsafe code and non-compiling solutions", async () => {
    expect(await validateGenerated({ ...good, tests: good.tests.map((t, i) => (i === 2 ? { ...t, output: "1 2 3 4" } : t)) })).toMatch(/failed 1 of 4/);
    expect(await validateGenerated({ ...good, hints: ["only one"] as unknown as typeof good.hints })).toMatch(/schema/);
    expect(await validateGenerated({ ...good, referenceSolution: good.referenceSolution.replace("return 0;", "system(\"calc\"); return 0;").replace("#include <iostream>", "#include <iostream>\n#include <cstdlib>") })).toMatch(/policy/);
    expect(await validateGenerated({ ...good, referenceSolution: good.referenceSolution.replace("cin >> n;", "cin >> n") })).toMatch(/did not compile/);
    expect(await validateGenerated({ ...good, starterCode: good.referenceSolution })).toMatch(/already solves/);
  }, 120_000);
});
