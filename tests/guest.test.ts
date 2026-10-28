/**
 * Guest accounts and the step-by-step lesson path: one-click guest accounts (no password, can't be
 * logged into, can be claimed), judged checks that never leak hidden tests, XP that depends on how
 * much help was used, module completion + achievements, the mentor's curated/AI paths and every
 * fallback, curated error explanations, and the production execution gate.
 * Uses the real g++ sandbox where noted (Windows dev backend); AI providers are fixtures.
 */
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { COURSE_MODULES, getCourseLesson } from "@/content/course";
import { config } from "@/server/config";
import { schema, type DB } from "@/server/db/client";
import { claimGuestAccount, createGuestUser, verifyCredentials } from "@/server/auth/auth";
import { setAIProviderForTesting } from "@/server/ai";
import { curatedProvider } from "@/server/ai/curated";
import type { AIProvider, LessonTutorRequest } from "@/server/ai/types";
import { AIBudgetExhaustedError, resetMeteringForTesting } from "@/server/ai/metering";
import { applySafetyGate, setExecutionProviderForTesting } from "@/server/execution/providers";
import { explainCompilerOutput, firstErrorLine } from "@/server/learning/feedback";
import { checkExercise, checkFillIn, fillInView, runOnce, workedSolution } from "@/server/services/lesson-exercises";
import { fillInPuzzle } from "@/content/course/fill-in";
import { noteHint, noteSolutionViewed, pathProgress, recordPass } from "@/server/services/lesson-path";
import { mentorHelp } from "@/server/services/mentor";
import { progression } from "@/server/services/progression";
import { canExecute, freshDb, noExecution, useLocalSandbox } from "./helpers";

const savedAi = structuredClone(config.ai);
const restoreAi = () => Object.assign(config.ai, structuredClone(savedAi));

const wrongEvenOdd = `#include <iostream>
using namespace std;
int main() { int n; cin >> n; if (n % 2 == 1) cout << "Odd"; else cout << "Even"; return 0; }`;

let db: DB;
let close: () => Promise<void>;
beforeAll(async () => {
  ({ db, close } = await freshDb());
});
afterAll(async () => close());

describe("guest accounts", () => {
  it("start with one click: a student with no password who skips onboarding", async () => {
    const g = await createGuestUser("beginner");
    expect(g).toMatchObject({ role: "STUDENT", isGuest: true });
    expect(g.username).toMatch(/^guest_/);
    const profile = await db.query.studentProfiles.findFirst({ where: eq(schema.studentProfiles.userId, g.id) });
    expect(profile?.onboardedAt).toBeTruthy();
    expect(profile?.experience).toBe("none");
  });

  it("can never be signed into with a password", async () => {
    const g = await createGuestUser("placement");
    await expect(verifyCredentials(g.username, "!guest-no-password")).rejects.toThrow(/incorrect/);
    await expect(verifyCredentials(g.username, "")).rejects.toThrow(/incorrect/);
  });

  it("can be claimed with a username and password, keeping progress", async () => {
    const g = await createGuestUser("beginner");
    await recordPass(g.id, "what-is-programming");
    const claimed = await claimGuestAccount(g.id, { username: `asha_${Date.now()}`, password: "correct-horse-9", displayName: "Asha" });
    expect(claimed.isGuest).toBe(false);
    expect((await verifyCredentials(claimed.username, "correct-horse-9")).id).toBe(g.id);
    expect((await pathProgress(db, g.id)).passedCount).toBe(1);
    await expect(claimGuestAccount(g.id, { username: "other_name", password: "correct-horse-9", displayName: "x" })).rejects.toThrow(/already has a username/);
  });
});

describe("lesson path progress and XP", () => {
  it("awards XP once per lesson, less with more help, and never for a repeat pass", async () => {
    const g = await createGuestUser("beginner");
    expect((await recordPass(g.id, "what-is-programming")).xp).toBe(25);
    expect((await recordPass(g.id, "what-is-programming")).firstPass).toBe(false);
    await noteHint(g.id, "how-programs-work", 3);
    expect((await recordPass(g.id, "how-programs-work")).xp).toBe(15);
    await noteHint(g.id, "program-structure", 1);
    await noteSolutionViewed(g.id, "program-structure");
    expect((await recordPass(g.id, "program-structure")).xp).toBe(5);
    const p = await progression(db, g.id);
    expect(p.xp).toBe(45);
  });

  it("celebrates a finished module with bonus XP and an achievement", async () => {
    const g = await createGuestUser("beginner");
    const mod = COURSE_MODULES.find((m) => m.id === "loops")!;
    let last = null;
    for (const id of mod.lessons) last = await recordPass(g.id, id);
    expect(last!.moduleCompleted).toEqual({ title: "Loops", xp: 50 });
    expect(last!.achievements.map((a) => a.code)).toContain("MODULE_LOOPS");
    const firsts = await db.select().from(schema.studentAchievements).where(eq(schema.studentAchievements.studentId, g.id));
    expect(firsts.map((a) => a.code)).toEqual(expect.arrayContaining(["FIRST_LESSON", "FIRST_PROGRAM", "MODULE_LOOPS", "LESSON_SOLO_5"]));
    expect((await progression(db, g.id)).xp).toBe(mod.lessons.length * 25 + 50);
  });
});

describe.runIf(canExecute)("checking exercises (real compiler)", () => {
  beforeAll(async () => useLocalSandbox(), 120_000);
  afterAll(() => setExecutionProviderForTesting(null));

  it("Complete the code: any correct line passes, wrong lines fail, and it earns 10 XP without counting as the lesson", async () => {
    const lesson = getCourseLesson("for-loops")!;
    const view = fillInView("for-loops")!;
    expect(JSON.stringify(view)).not.toContain(lesson.exercise.tests.find((t) => t.visibility === "hidden")!.output);
    const puzzle = fillInPuzzle(lesson.exercise)!;
    const ours = puzzle.blanks.map((b) => lesson.exercise.solution.split("\n")[b.line].trim().replace(/\s*\{$/, ""));
    expect((await checkFillIn("for-loops", ours, false)).passed).toBe(true);
    // A wrong line in the first blank fails the real tests.
    const wrong = [...ours];
    wrong[0] = "int count = 1;";
    const bad = await checkFillIn("for-loops", wrong, false);
    if (/count/.test(ours[0])) expect(bad.passed).toBe(false);
    await expect(checkFillIn("for-loops", ours.slice(1), false)).rejects.toThrow(/every blank/);
    await expect(checkFillIn("for-loops", ours.map((a, i) => (i === 0 ? `${a}\nint x;` : a)), false)).rejects.toThrow(/one line/);

    const g = await createGuestUser("beginner");
    expect((await recordPass(g.id, "for-loops+fill")).xp).toBe(10);
    const progress = await pathProgress(db, g.id);
    expect(progress.lessonState("for-loops").passed).toBe(false);
    expect(progress.passedCount).toBe(0);
    expect((await progression(db, g.id)).xp).toBe(10);
    const ach = await db.select().from(schema.studentAchievements).where(eq(schema.studentAchievements.studentId, g.id));
    expect(ach.map((a) => a.code)).not.toContain("FIRST_LESSON");
  });

  it("passes a correct solution", async () => {
    const r = await checkExercise("if-else", getCourseLesson("if-else")!.exercise.solution, false);
    expect(r.passed).toBe(true);
    expect(r.testsPassed).toBe(r.testsTotal);
  });

  it("never returns hidden test data unless one failing case is explicitly requested", async () => {
    const r = await checkExercise("if-else", wrongEvenOdd, false);
    expect(r.passed).toBe(false);
    const hidden = r.tests.filter((t) => t.hidden);
    expect(hidden.length).toBeGreaterThan(0);
    for (const t of hidden) expect([t.input, t.expected, t.actual]).toEqual([undefined, undefined, undefined]);
    expect(r.revealedHidden).toBeNull();
    expect(JSON.stringify(r)).not.toContain("-3");
    const shown = await checkExercise("if-else", wrongEvenOdd, true);
    expect(shown.revealedHidden).toEqual({ label: "negative odd", input: "-3\n", expected: "Odd", actual: "Even" });
  });

  it("explains incorrect syntax in plain language", async () => {
    const r = await runOnce("#include <iostream>\nusing namespace std;\nint main() {\n    int a = 10;\n    cout << b;\n}", "");
    expect(r.compile.status).toBe("error");
    expect(r.feedback[0].title).toMatch(/`b` is used but was never declared/);
    expect(r.feedback[0].line).toBe(5);
  });

  it("stops an infinite loop, runaway memory and huge output", async () => {
    expect((await runOnce("int main() { while (true) {} }", "")).run?.status).toBe("time_limit");
    expect(["memory_limit", "runtime_error"]).toContain((await runOnce("#include <vector>\nint main() { std::vector<int> v; for (;;) v.push_back(1); }", "")).run?.status);
    const big = await runOnce("#include <iostream>\nint main() { for (;;) std::cout << \"spam spam spam\\n\"; }", "");
    expect(big.run?.status).toBe("output_limit");
  });

  it("copes with input the program didn't expect", async () => {
    const odd = await runOnce(getCourseLesson("input-output")!.exercise.solution, "hello world");
    expect(odd.run?.status).toBe("ok");
  });

  it("the mentor explains a playground error from a real compile", async () => {
    const r = await mentorHelp({ studentId: null, ip: null, lessonId: null, mode: "error", hintLevel: null, code: "int main() { int x = 1 }", question: null });
    expect(r.source).toBe("curated");
    expect(r.text).toMatch(/semicolon is missing/);
  });

  it("serves the worked solution only through its own request", () => {
    expect(workedSolution("variables").solution).toContain("int temp = a;");
  });
});

describe("mentor panel paths", () => {
  let studentId: string;
  beforeAll(async () => {
    noExecution();
    studentId = (await createGuestUser("beginner")).id;
  });
  afterAll(() => setExecutionProviderForTesting(null));
  afterEach(() => {
    setAIProviderForTesting(null);
    restoreAi();
    resetMeteringForTesting();
  });

  const base = { ip: null, lessonId: "variables", hintLevel: 1, code: "int main(){}", question: null };
  const fixture = (lessonTutor: AIProvider["lessonTutor"]): AIProvider => ({ ...curatedProvider, id: "claude", conversational: true, lessonTutor });

  it("works with no AI configured: curated hints, concept and an honest 'ask' answer", async () => {
    const hint = await mentorHelp({ ...base, studentId, mode: "hint", hintLevel: 2 });
    expect(hint).toMatchObject({ source: "curated", text: getCourseLesson("variables")!.exercise.hints[1] });
    expect((await mentorHelp({ ...base, studentId, mode: "concept" })).text).toContain(getCourseLesson("variables")!.explainAgain.slice(0, 40));
    expect((await mentorHelp({ ...base, studentId, mode: "ask", question: "what is a variable?" })).text).toMatch(/isn't answering free-form questions/);
  });

  it("says plainly when code can't be run instead of inventing a result", async () => {
    expect((await mentorHelp({ ...base, studentId, mode: "error" })).text).toMatch(/can't be run on this server/);
  });

  it("uses the AI when enabled and counts it against the student's daily quota", async () => {
    config.ai.dailyRequestLimit = 2;
    let seen: LessonTutorRequest | null = null;
    setAIProviderForTesting(fixture(async (req) => { seen = req; return { source: "ai", value: { text: "You created `a`, but you print `b`. Where was `b` declared?" } }; }));
    const id = (await createGuestUser("beginner")).id;
    expect(await mentorHelp({ ...base, studentId: id, mode: "hint" })).toMatchObject({ source: "ai", remaining: 1 });
    expect(seen!.lesson.curatedHint).toBe(getCourseLesson("variables")!.exercise.hints[0]);
  });

  it("falls back to curated help with a notice when the quota is used up", async () => {
    config.ai.dailyRequestLimit = 1;
    setAIProviderForTesting(fixture(async () => ({ source: "ai", value: { text: "Look at line 3." } })));
    const id = (await createGuestUser("beginner")).id;
    expect((await mentorHelp({ ...base, studentId: id, mode: "hint" })).source).toBe("ai");
    const second = await mentorHelp({ ...base, studentId: id, mode: "hint" });
    expect(second).toMatchObject({ source: "curated", remaining: 0 });
    expect(second.notice).toMatch(/used today's AI help/);
  });

  it("falls back and refunds when the provider is unavailable or the budget is spent", async () => {
    config.ai.dailyRequestLimit = 1;
    const id = (await createGuestUser("beginner")).id;
    setAIProviderForTesting(fixture(async () => { throw new AIBudgetExhaustedError(); }));
    const r = await mentorHelp({ ...base, studentId: id, mode: "hint" });
    expect(r).toMatchObject({ source: "curated", remaining: 1 });
    expect(r.notice).toMatch(/month's budget/);
    setAIProviderForTesting(fixture(async () => { throw new Error("socket hang up"); }));
    expect((await mentorHelp({ ...base, studentId: id, mode: "hint" })).notice).toMatch(/isn't available right now/);
  });

  it("rejects AI answers that give away the solution or claim untested success", async () => {
    const sol = getCourseLesson("variables")!.exercise.solution;
    setAIProviderForTesting(fixture(async () => ({ source: "ai", value: { text: `Just write:\n${sol}` } })));
    expect((await mentorHelp({ ...base, studentId, mode: "hint" })).source).toBe("curated");
    setAIProviderForTesting(fixture(async () => ({ source: "ai", value: { text: "Your code compiles fine and all tests pass!" } })));
    expect((await mentorHelp({ ...base, studentId, mode: "review" })).source).toBe("curated");
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
    expect(explainCompilerOutput("main.cpp:7:3: error: something unusual")[0].line).toBe(7);
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
    expect(applySafetyGate(prodWorker, true)).toMatchObject({ available: false, message: expect.stringMatching(/switched off/) });
    config.execution.publicEnabled = true;
    expect(applySafetyGate(prodWorker, true).available).toBe(true);
  });

  it("never uses a development-only sandbox in production, even when enabled", () => {
    config.execution.publicEnabled = true;
    expect(applySafetyGate(devWorker, true)).toMatchObject({ available: false, message: expect.stringMatching(/development-only/) });
  });

  it("is not gated in development", () => {
    config.execution.publicEnabled = false;
    expect(applySafetyGate(devWorker, false).available).toBe(true);
  });
});
