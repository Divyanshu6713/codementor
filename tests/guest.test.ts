/**
 * The guest learning journey's server logic: judged checks that never leak hidden tests, the
 * help panel's curated/AI paths and every fallback, signed guest identity, browser progress
 * parsing/migration, curated error explanations, and the production execution gate.
 * Uses the real g++ sandbox where noted (Windows dev backend); AI providers are fixtures.
 */
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { getCourseLesson } from "@/content/course";
import { config } from "@/server/config";
import { setAIProviderForTesting } from "@/server/ai";
import { curatedProvider } from "@/server/ai/curated";
import type { AIProvider, LessonTutorRequest } from "@/server/ai/types";
import { AIBudgetExhaustedError, resetMeteringForTesting } from "@/server/ai/metering";
import { applySafetyGate, setExecutionProviderForTesting } from "@/server/execution/providers";
import { newGuestToken, verifyGuestToken } from "@/server/guest/identity";
import { explainCompilerOutput, firstErrorLine } from "@/server/learning/feedback";
import { guestCheck, guestRun, guestSolution } from "@/server/services/guest";
import { guestTutor } from "@/server/services/guest-tutor";
import { parseProgress, recommendedLesson, PROGRESS_SCHEMA } from "@/lib/guest-progress";
import { canExecute, freshDb, noExecution, useLocalSandbox } from "./helpers";

const savedAi = structuredClone(config.ai);
const restoreAi = () => Object.assign(config.ai, structuredClone(savedAi));

const wrongEvenOdd = `#include <iostream>
using namespace std;
int main() { int n; cin >> n; if (n % 2 == 1) cout << "Odd"; else cout << "Even"; return 0; }`;

describe.runIf(canExecute)("checking exercises (real compiler)", () => {
  beforeAll(async () => useLocalSandbox(), 120_000);
  afterAll(() => setExecutionProviderForTesting(null));

  it("passes a correct solution and marks it complete", async () => {
    const l = getCourseLesson("if-else")!;
    const r = await guestCheck("if-else", l.exercise.solution, false);
    expect(r.passed).toBe(true);
    expect(r.testsPassed).toBe(r.testsTotal);
  });

  it("never returns hidden test data unless one failing case is explicitly requested", async () => {
    const r = await guestCheck("if-else", wrongEvenOdd, false);
    expect(r.passed).toBe(false);
    const hidden = r.tests.filter((t) => t.hidden);
    expect(hidden.length).toBeGreaterThan(0);
    for (const t of hidden) expect([t.input, t.expected, t.actual]).toEqual([undefined, undefined, undefined]);
    expect(r.revealedHidden).toBeNull();
    expect(JSON.stringify(r)).not.toContain("-3");

    const shown = await guestCheck("if-else", wrongEvenOdd, true);
    expect(shown.revealedHidden).toEqual({ label: "negative odd", input: "-3\n", expected: "Odd", actual: "Even" });
  });

  it("explains incorrect syntax in plain language", async () => {
    const r = await guestRun("#include <iostream>\nusing namespace std;\nint main() {\n    int a = 10;\n    cout << b;\n}", "");
    expect(r.compile.status).toBe("error");
    expect(r.feedback[0].title).toMatch(/`b` is used but was never declared/);
    expect(r.feedback[0].line).toBe(5);
  });

  it("stops an infinite loop and says why", async () => {
    const r = await guestRun("int main() { while (true) {} }", "");
    expect(r.run?.status).toBe("time_limit");
    expect(r.feedback[0].title).toMatch(/too long/);
  });

  it("stops excessive memory use", async () => {
    const r = await guestRun("#include <vector>\nint main() { std::vector<int> v; for (;;) v.push_back(1); }", "");
    expect(["memory_limit", "runtime_error"]).toContain(r.run?.status);
  });

  it("cuts off very large output", async () => {
    const r = await guestRun("#include <iostream>\nint main() { for (;;) std::cout << \"spam spam spam\\n\"; }", "");
    expect(r.run?.status).toBe("output_limit");
    expect(r.run!.stdout.length).toBeLessThanOrEqual(16_000);
  });

  it("copes with input the program didn't expect", async () => {
    const r = await guestCheck("input-output", getCourseLesson("input-output")!.exercise.solution, false);
    expect(r.passed).toBe(true);
    const odd = await guestRun(getCourseLesson("input-output")!.exercise.solution, "hello world");
    expect(odd.run?.status).toBe("ok");
  });

  it("serves the worked solution only through its own explicit request", () => {
    expect(guestSolution("variables").solution).toContain("int temp = a;");
  });
});

describe("help panel (tutor) paths", () => {
  let close: () => Promise<void>;
  beforeAll(async () => {
    ({ close } = await freshDb());
    noExecution();
  });
  afterAll(async () => {
    setExecutionProviderForTesting(null);
    await close();
  });
  afterEach(() => {
    setAIProviderForTesting(null);
    restoreAi();
    resetMeteringForTesting();
  });

  const base = { guestId: "guest-1", ip: null, lessonId: "variables", hintLevel: 1, code: "int main(){}", question: null };
  const fixture = (lessonTutor: AIProvider["lessonTutor"]): AIProvider => ({ ...curatedProvider, id: "claude", conversational: true, lessonTutor });

  it("works with no AI configured: curated hints, concept and honest 'ask' answer", async () => {
    const hint = await guestTutor({ ...base, mode: "hint", hintLevel: 2 });
    expect(hint).toMatchObject({ source: "curated", text: getCourseLesson("variables")!.exercise.hints[1] });
    const concept = await guestTutor({ ...base, mode: "concept" });
    expect(concept.text).toContain(getCourseLesson("variables")!.explainAgain.slice(0, 40));
    const ask = await guestTutor({ ...base, mode: "ask", question: "what is a variable?" });
    expect(ask.source).toBe("curated");
    expect(ask.text).toMatch(/isn't answering free-form questions/);
  });

  it("says plainly when code can't be run, instead of inventing a result", async () => {
    const r = await guestTutor({ ...base, mode: "error" });
    expect(r.text).toMatch(/can't be run on this server/);
  });

  it("uses the AI when enabled, and counts it against the daily quota", async () => {
    config.ai.dailyRequestLimit = 2;
    let seen: LessonTutorRequest | null = null;
    setAIProviderForTesting(fixture(async (req) => { seen = req; return { source: "ai", value: { text: "You created `a`, but you print `b`. Where was `b` declared?" } }; }));
    const r = await guestTutor({ ...base, mode: "hint", guestId: "quota-guest" });
    expect(r).toMatchObject({ source: "ai", remaining: 1 });
    expect(seen!.lesson.curatedHint).toBe(getCourseLesson("variables")!.exercise.hints[0]);
    expect(seen!.answerSummary).toContain("temp");
  });

  it("falls back to curated help with a notice when the quota is used up", async () => {
    config.ai.dailyRequestLimit = 1;
    setAIProviderForTesting(fixture(async () => ({ source: "ai", value: { text: "Look at line 3." } })));
    expect((await guestTutor({ ...base, mode: "hint", guestId: "q2" })).source).toBe("ai");
    const second = await guestTutor({ ...base, mode: "hint", guestId: "q2" });
    expect(second).toMatchObject({ source: "curated", remaining: 0 });
    expect(second.notice).toMatch(/used today's AI help/);
  });

  it("falls back and refunds the request when the provider is unavailable or the budget is spent", async () => {
    config.ai.dailyRequestLimit = 1;
    setAIProviderForTesting(fixture(async () => { throw new AIBudgetExhaustedError(); }));
    const r = await guestTutor({ ...base, mode: "hint", guestId: "q3" });
    expect(r.source).toBe("curated");
    expect(r.notice).toMatch(/month's budget/);
    expect(r.remaining).toBe(1);
    setAIProviderForTesting(fixture(async () => { throw new Error("socket hang up"); }));
    const r2 = await guestTutor({ ...base, mode: "hint", guestId: "q3" });
    expect(r2.source).toBe("curated");
    expect(r2.notice).toMatch(/isn't available right now/);
  });

  it("rejects AI answers that give away the solution or claim untested success", async () => {
    const sol = getCourseLesson("variables")!.exercise.solution;
    setAIProviderForTesting(fixture(async () => ({ source: "ai", value: { text: `Just write:\n${sol}` } })));
    expect((await guestTutor({ ...base, mode: "hint", guestId: "q4" })).source).toBe("curated");
    setAIProviderForTesting(fixture(async () => ({ source: "ai", value: { text: "Your code compiles fine and all tests pass!" } })));
    expect((await guestTutor({ ...base, mode: "review", guestId: "q4" })).source).toBe("curated");
  });

  it("needs a guest cookie before spending AI requests", async () => {
    setAIProviderForTesting(fixture(async () => ({ source: "ai", value: { text: "x" } })));
    const r = await guestTutor({ ...base, mode: "hint", guestId: null });
    expect(r.source).toBe("curated");
    expect(r.notice).toMatch(/cookies/);
  });
});

describe("guest identity", () => {
  it("issues signed ids and rejects forged or altered ones", () => {
    const t = newGuestToken()!;
    expect(verifyGuestToken(t.token)).toBe(t.id);
    expect(verifyGuestToken(t.token.slice(0, -1) + (t.token.endsWith("A") ? "B" : "A"))).toBeNull();
    expect(verifyGuestToken(`v1.${"a".repeat(22)}.${"b".repeat(32)}`)).toBeNull();
    expect(verifyGuestToken("garbage")).toBeNull();
    expect(verifyGuestToken(undefined)).toBeNull();
  });
});

describe("browser progress storage", () => {
  const order = ["a", "b", "c"];
  it("treats missing data as a fresh start", () => {
    expect(parseProgress(null)).toMatchObject({ reset: false, progress: { lessons: {}, currentLessonId: null } });
  });
  it("resets corrupt or unknown-version data instead of trusting it", () => {
    expect(parseProgress("{not json").reset).toBe(true);
    expect(parseProgress(JSON.stringify({ v: 99, lessons: {} })).reset).toBe(true);
  });
  it("keeps valid fields and drops malformed ones", () => {
    const raw = JSON.stringify({
      v: PROGRESS_SCHEMA, currentLessonId: "b", recent: ["b", 7, "zzz"], updatedAt: 1,
      lessons: { b: { completedAt: 5, draft: "int main(){}", draftVersion: "x", hintLevel: "lots" }, "BAD ID!": { completedAt: 1 } },
    });
    const { progress, reset } = parseProgress(raw);
    expect(reset).toBe(false);
    expect(Object.keys(progress.lessons)).toEqual(["b"]);
    expect(progress.lessons.b).toMatchObject({ completedAt: 5, draft: "int main(){}", hintLevel: undefined });
    expect(progress.recent).toEqual(["b"]);
  });
  it("recommends the next unfinished lesson", () => {
    const p = parseProgress(JSON.stringify({ v: PROGRESS_SCHEMA, currentLessonId: "a", recent: [], updatedAt: 1, lessons: { a: { completedAt: 1 } } })).progress;
    expect(recommendedLesson(order, p)).toBe("b");
    expect(recommendedLesson(order, parseProgress(null).progress)).toBe("a");
  });
});

describe("curated compiler explanations", () => {
  it.each([
    ["main.cpp:5:5: error: expected ';' before 'return'", /semicolon is missing/],
    ["main.cpp:3:5: error: 'cout' was not declared in this scope", /doesn't recognise `cout`/],
    ["main.cpp:9:1: error: expected '}' at end of input", /closing brace/],
    ["main.cpp:4:9: error: no match for 'operator>>' (operand types are 'std::ostream'", /arrows point the wrong way/],
    ["main.cpp:6:5: error: 'else' without a previous 'if'", /no matching if/],
  ])("%s", (out, re) => {
    expect(explainCompilerOutput(out)[0].title).toMatch(re);
  });
  it("falls back to general guidance and the first error line", () => {
    const items = explainCompilerOutput("main.cpp:7:3: error: something unusual");
    expect(items[0].line).toBe(7);
    expect(firstErrorLine("main.cpp:12:1: error: x")).toBe(12);
  });
});

describe("production execution gate", () => {
  const savedPublic = config.execution.publicEnabled;
  afterEach(() => {
    config.execution.publicEnabled = savedPublic;
  });
  const prodWorker = { available: true, provider: "sandbox-worker:docker", isolation: "docker", devOnly: false, message: null };
  const devWorker = { ...prodWorker, provider: "sandbox-worker:windows-job", devOnly: true };

  it("keeps code execution off in production until an administrator enables it", () => {
    config.execution.publicEnabled = false;
    const s = applySafetyGate(prodWorker, true);
    expect(s.available).toBe(false);
    expect(s.message).toMatch(/switched off/);
    config.execution.publicEnabled = true;
    expect(applySafetyGate(prodWorker, true).available).toBe(true);
  });

  it("never uses a development-only sandbox in production, even when enabled", () => {
    config.execution.publicEnabled = true;
    const s = applySafetyGate(devWorker, true);
    expect(s.available).toBe(false);
    expect(s.message).toMatch(/development-only/);
  });

  it("is not gated in development", () => {
    config.execution.publicEnabled = false;
    expect(applySafetyGate(devWorker, false).available).toBe(true);
  });
});
