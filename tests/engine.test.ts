import { describe, expect, it } from "vitest";
import {
  applyEvidence, confidenceLabel, isMastered, itemCredit, isIndependent, newSkillState, recentStats, type Evidence, type SkillState,
} from "@/server/learning/mastery";
import {
  firstRevision, initialDifficulty, nextDifficulty, onMisconceptionDetected, onProbePassed, scheduleAfterReview, isRecurring,
} from "@/server/learning/adaptivity";
import { entryRung, nextDiagnosticStep, summarizeDiagnostic, type DiagAnswer, type DiagItem } from "@/server/learning/diagnostic";
import { gradeAnswer, evaluateExplanationRubric } from "@/server/learning/grading";
import { accumulatorFinding, diagnoseSubmission, headerFindings, parseFirstFor, sequenceFinding } from "@/server/learning/code-diagnosis";
import { outputsMatch } from "@/server/execution/judge";
import type { JudgeOutcome } from "@/server/execution/judge";
import { pickQuestion, type PoolQuestion } from "@/server/learning/picker";
import { decideNext, type ConceptInfo, type LearnerSnapshot, type SkillInfo } from "@/server/learning/engine";
import { CONCEPTS, DIAGNOSTIC_LADDER, QUESTIONS, lessonsForConcept } from "@/content";
import { splitQuestion } from "@/server/content/question-parts";

const NOW = new Date("2026-10-07T10:00:00Z");
const DAY = 86_400_000;

function feed(state: SkillState, outcomes: Partial<Evidence>[]): SkillState {
  return outcomes.reduce((s, o, i) => applyEvidence(s, {
    credit: 1, correct: true, independent: true, maxHintLevel: -1, difficulty: 3, kind: "practice",
    at: new Date(NOW.getTime() + i * 60_000), ...o,
  }), state);
}
const solo = (difficulty = 3): Partial<Evidence> => ({ credit: 1, correct: true, independent: true, maxHintLevel: -1, difficulty });
const wrong = (difficulty = 3): Partial<Evidence> => ({ credit: 0, correct: false, independent: false, maxHintLevel: -1, difficulty });
const strongHint = (difficulty = 3): Partial<Evidence> => ({
  credit: itemCredit({ correct: true, attempts: 2, maxHintLevel: 4, solutionRevealed: false }), correct: true, independent: false, maxHintLevel: 4, difficulty,
});

describe("item credit", () => {
  it("rewards independence: first try > retry > hints > solution", () => {
    const first = itemCredit({ correct: true, attempts: 1, maxHintLevel: -1, solutionRevealed: false });
    const retry = itemCredit({ correct: true, attempts: 2, maxHintLevel: -1, solutionRevealed: false });
    const hinted = itemCredit({ correct: true, attempts: 1, maxHintLevel: 3, solutionRevealed: false });
    const revealed = itemCredit({ correct: true, attempts: 1, maxHintLevel: 4, solutionRevealed: true });
    expect(first).toBe(1);
    expect(retry).toBeLessThan(first);
    expect(hinted).toBeLessThan(retry);
    expect(revealed).toBe(0);
    expect(isIndependent({ correct: true, attempts: 2, maxHintLevel: -1, solutionRevealed: false })).toBe(true);
    expect(isIndependent({ correct: true, attempts: 1, maxHintLevel: 0, solutionRevealed: false })).toBe(false);
  });
});

describe("mastery model", () => {
  it("one easy correct answer: high-ish estimate but LOW confidence", () => {
    const s = feed(newSkillState(), [solo(1)]);
    expect(s.mastery).toBeGreaterThan(0.6);
    expect(confidenceLabel(s.confidence)).toBe("Low");
    expect(isMastered(s)).toBe(false);
  });

  it("many varied independent successes: high mastery, high confidence, MASTERED", () => {
    const s = feed(newSkillState(), [1, 2, 3, 3, 4, 3, 4, 5, 3, 4].map((d) => solo(d)));
    expect(s.mastery).toBeGreaterThan(0.85);
    expect(confidenceLabel(s.confidence)).toBe("High");
    expect(s.status).toBe("MASTERED");
  });

  it("never locks a skill at 100%", () => {
    const s = feed(newSkillState(), Array.from({ length: 30 }, () => solo(5)));
    expect(s.mastery).toBeLessThan(1);
  });

  it("does not use time taken as an input", () => {
    // Evidence has no duration field at all; identical answers produce identical states.
    const a = feed(newSkillState(), [solo(), solo()]);
    const b = feed(newSkillState(), [solo(), solo()]);
    expect(a.mastery).toBe(b.mastery);
  });

  it("failing an easy question counts more than failing a hard one", () => {
    const base = feed(newSkillState(), [solo(), solo(), solo()]);
    const easyMiss = applyEvidence(base, { credit: 0, correct: false, independent: false, maxHintLevel: -1, difficulty: 1, kind: "practice", at: NOW });
    const hardMiss = applyEvidence(base, { credit: 0, correct: false, independent: false, maxHintLevel: -1, difficulty: 5, kind: "practice", at: NOW });
    expect(easyMiss.mastery).toBeLessThan(hardMiss.mastery);
  });

  it("tracks recent accuracy, independence and hint dependency", () => {
    const s = feed(newSkillState(), [solo(), strongHint(), wrong()]);
    const st = recentStats(s.recent);
    expect(st.accuracy).toBeCloseTo(2 / 3, 2);
    expect(st.independentAccuracy).toBeCloseTo(1 / 3, 2);
    expect(st.hintDependency).toBeGreaterThan(0);
  });
});

describe("difficulty ladder", () => {
  it("Easy ✓ Easy ✓ Medium ✗ Medium ✗ → steps down, never jumps to hard", () => {
    let d = 1;
    const h: { correct: boolean; independent: boolean; maxHintLevel: number }[] = [];
    const step = (correct: boolean) => {
      h.push({ correct, independent: correct, maxHintLevel: -1 });
      d = nextDifficulty(d, h);
      return d;
    };
    expect(step(true)).toBe(1);
    expect(step(true)).toBe(2);
    expect(step(false)).toBe(1);
    expect(step(false)).toBe(1);
  });
  it("strong performance climbs one level at a time up to challenge", () => {
    let d = 3;
    const h = [] as { correct: boolean; independent: boolean; maxHintLevel: number }[];
    for (let i = 0; i < 8; i++) {
      h.push({ correct: true, independent: true, maxHintLevel: -1 });
      const nd = nextDifficulty(d, h);
      expect(nd - d).toBeLessThanOrEqual(1);
      d = nd;
    }
    expect(d).toBe(5);
  });
  it("starting difficulty follows mastery", () => {
    expect(initialDifficulty(null)).toBe(1);
    expect(initialDifficulty(0.5)).toBe(2);
    expect(initialDifficulty(0.95)).toBe(5);
  });
});

describe("revision scheduling", () => {
  it("stretches after good recall, restarts after failed recall, stays close with a misconception", () => {
    const first = firstRevision(NOW);
    expect(first.intervalDays).toBe(1);
    const good = scheduleAfterReview({ stage: 2 }, 0.9, false, NOW);
    expect(good.intervalDays).toBe(14);
    const partial = scheduleAfterReview({ stage: 2 }, 0.6, false, NOW);
    expect(partial.intervalDays).toBe(7);
    const failed = scheduleAfterReview({ stage: 3 }, 0.2, false, NOW);
    expect(failed).toMatchObject({ stage: 0, intervalDays: 1, reason: "failed_recall" });
    const mc = scheduleAfterReview({ stage: 3 }, 0.9, true, NOW);
    expect(mc.intervalDays).toBeLessThanOrEqual(2);
    expect(mc.dueAt.getTime() - NOW.getTime()).toBe(2 * DAY);
  });
});

describe("misconception state", () => {
  it("activates, resolves after 2 probe passes, and counts recurrences", () => {
    let m = onMisconceptionDetected(null);
    expect(m).toMatchObject({ occurrences: 1, status: "active" });
    m = onProbePassed(m);
    expect(m.status).toBe("active");
    m = onProbePassed(m);
    expect(m.status).toBe("resolved");
    m = onMisconceptionDetected(m);
    expect(m).toMatchObject({ occurrences: 2, recurrences: 1, status: "active", probeStreak: 0 });
    expect(isRecurring(m)).toBe(true);
  });
});

describe("grading", () => {
  const q = (id: string) => splitQuestion(QUESTIONS.find((x) => x.id === id)!).answerKey;
  it("maps MCQ distractors to misconceptions", () => {
    const r = gradeAnswer(q("fl-cp-condition"), { type: "choice", optionId: "a" });
    expect(r.correct).toBe(false);
    expect(r.misconceptions).toEqual(["MC-LOOP-01"]);
    expect(r.feedback).toBeTruthy();
  });
  it("accepts equivalent code fragments and recognises known wrong ones", () => {
    expect(gradeAnswer(q("fl-cp-boundary-b"), { type: "text", text: "  i<=6 ; " }).correct).toBe(true);
    expect(gradeAnswer(q("fl-cp-boundary-b"), { type: "text", text: "i < 7" }).correct).toBe(true);
    const w = gradeAnswer(q("fl-cp-boundary-b"), { type: "text", text: "i < 6" });
    expect(w).toMatchObject({ correct: false, misconceptions: ["MC-LOOP-04"] });
  });
  it("grades reorder and trace with partial credit", () => {
    const key = q("fl-reorder-sum");
    if (key.type !== "reorder") throw new Error();
    expect(gradeAnswer(key, { type: "order", order: key.order }).correct).toBe(true);
    const t = gradeAnswer(q("fl-cp-acc"), { type: "fields", values: ["1", "2", "6", "10"] });
    expect(t.correct).toBe(false);
    expect(t.score).toBe(0.75);
    expect(t.misconceptions).toContain("MC-LOOP-05");
  });
  it("explain rubric finds key ideas and ignores style", () => {
    const key = q("fl-explain-boundary");
    if (key.type !== "explain") throw new Error();
    const good = evaluateExplanationRubric(key.rubric, "with <= the loop also runs when i is equal to n, so it does one extra time. with < it stops before n");
    expect(good.correct).toBe(true);
    const bad = evaluateExplanationRubric(key.rubric, "they are the same thing really");
    expect(bad.correct).toBe(false);
    expect(bad.misconceptions).toContain("MC-REL-02");
  });
});

describe("judge comparison + code diagnosis", () => {
  it("compares tokens and lines leniently on whitespace only", () => {
    expect(outputsMatch("1\n2\n3", "1 2 3 ", "tokens")).toBe(true);
    expect(outputsMatch("***\n***", "***  \r\n***\n\n", "lines")).toBe(true);
    expect(outputsMatch("***\n***", "******", "lines")).toBe(false);
  });
  it("reads loop headers, including reversed operands", () => {
    const h = parseFirstFor("for (int i = 1; i > n; i++) {")!;
    expect(headerFindings(h, "up").map((f) => f.code)).toContain("MC-LOOP-02");
    expect(headerFindings(parseFirstFor("for (int i = 1; n >= i; i++)")!, "up")).toEqual([]);
    expect(headerFindings(parseFirstFor("for (int i = 1; i <= n; i--)")!, "up").map((f) => f.code)).toContain("MC-LOOP-03");
    expect(headerFindings(parseFirstFor("for (int i = 0; i < 3; i++);")!, "up").map((f) => f.code)).toContain("MC-LOOP-08");
    expect(headerFindings(parseFirstFor("for (int i = 1; i = n; i++)")!, "up").map((f) => f.code)).toContain("MC-REL-01");
  });
  it("recognises sequence and accumulator shapes", () => {
    expect(sequenceFinding([1, 2, 3, 4, 5], [1, 2, 3, 4])?.code).toBe("MC-LOOP-04");
    expect(sequenceFinding([1, 2, 3], [])?.code).toBe("MC-LOOP-01");
    expect(sequenceFinding([1, 2, 3], [0, 1, 2])?.code).toBe("MC-LOOP-04");
    expect(accumulatorFinding(5, 15, 10)?.code).toBe("MC-LOOP-04");
    expect(accumulatorFinding(5, 15, 5)?.code).toBe("MC-LOOP-05");
  });
  it("diagnoses a reversed-condition submission without revealing hidden data", () => {
    const outcome: JudgeOutcome = {
      verdict: "wrong_answer", compileStatus: "success", compileOutput: "", testsPassed: 0, testsTotal: 2, runtimeError: null,
      timeLimitExceeded: false, memoryLimitExceeded: false, outputLimitExceeded: false, executor: "x", isolation: "x", durationMs: 1,
      tests: [
        { id: "a", label: "n = 5", visibility: "sample", category: "normal", passed: false, status: "ok", input: "5\n", expected: "1 2 3 4 5", actual: "", detail: null },
        { id: "b", label: "secret", visibility: "hidden", category: "edge", passed: false, status: "ok", input: "987\n", expected: "x", actual: "", detail: null },
      ],
    };
    const d = diagnoseSubmission("for (int i = 1; i > n; i++) { cout << i; }", outcome, [{ kind: "sequence" }, { kind: "for_header", direction: "up" }]);
    expect(d.misconceptions).toContain("MC-LOOP-02");
    expect(d.whatHappened).toMatch(/nothing was printed/);
    expect(d.whatHappened).not.toContain("987");
  });
});

// ── Diagnostic ───────────────────────────────────────────────────────────────

const bank: DiagItem[] = QUESTIONS.filter((q) => q.purposes.includes("diagnostic")).map((q) => ({ questionId: q.id, conceptId: q.conceptId, difficulty: q.difficulty, type: q.type }));
const plan = (entry: number) => ({ ladder: DIAGNOSTIC_LADDER, entry });

function runDiagnostic(entry: number, knows: (conceptId: string) => boolean, executionAvailable = false) {
  const answers: DiagAnswer[] = [];
  for (let i = 0; i < 30; i++) {
    const step = nextDiagnosticStep(plan(entry), answers, bank, { executionAvailable });
    if (step.done) break;
    answers.push({ questionId: step.questionId, conceptId: step.conceptId, correct: knows(step.conceptId) });
  }
  return answers;
}

describe("adaptive diagnostic", () => {
  it("chooses the entry rung from onboarding", () => {
    expect(entryRung({ experience: "none", usedCpp: false, confidence: 1 }, 10)).toBe(0);
    expect(entryRung({ experience: "comfortable", usedCpp: true, confidence: 3 }, 10)).toBe(5);
  });

  it("stops climbing at a confirmed gap — no array questions for someone who struggles with variables", () => {
    const knows = (c: string) => c === "cpp-basics";
    const answers = runDiagnostic(0, knows);
    const asked = new Set(answers.map((a) => a.conceptId));
    expect(asked.has("variables-types")).toBe(true);
    expect(asked.has("arrays")).toBe(false);
    expect(asked.has("for-loops")).toBe(false);
    expect(answers.filter((a) => a.conceptId === "variables-types").length).toBe(2); // confirmed before concluding
    expect(answers.length).toBeLessThanOrEqual(7);
  });

  it("strong students climb through loops, functions and arrays", () => {
    const answers = runDiagnostic(4, () => true);
    const asked = new Set(answers.map((a) => a.conceptId));
    for (const c of ["conditions", "for-loops", "nested-loops", "functions", "arrays", "strings"]) expect(asked.has(c)).toBe(true);
    const out = summarizeDiagnostic(plan(4), answers);
    expect(out.concepts.find((c) => c.conceptId === "cpp-basics")?.status).toBe("inferred");
    expect(answers.length).toBeLessThanOrEqual(14);
  });

  it("walks down when the entry rung turns out to be too high", () => {
    const knows = (c: string) => ["cpp-basics", "variables-types", "arithmetic-ops"].includes(c);
    const answers = runDiagnostic(4, knows);
    const asked = new Set(answers.map((a) => a.conceptId));
    expect(asked.has("comparison-ops")).toBe(true); // walked down from conditions
    const out = summarizeDiagnostic(plan(4), answers);
    expect(out.concepts.find((c) => c.conceptId === "comparison-ops")?.status).toBe("fail");
  });

  it("gathers at least 5 answers when there's something to confirm, using mixed question types", () => {
    const answers = runDiagnostic(3, (c) => c !== "nested-loops");
    expect(answers.length).toBeGreaterThanOrEqual(5);
    const types = new Set(answers.map((a) => QUESTIONS.find((q) => q.id === a.questionId)!.type));
    expect(types.size).toBeGreaterThanOrEqual(2);
  });

  it("only asks coding questions when execution is available", () => {
    const off = runDiagnostic(0, () => true, false);
    expect(off.some((a) => QUESTIONS.find((q) => q.id === a.questionId)!.type === "write_code")).toBe(false);
  });
});

// ── Picker ────────────────────────────────────────────────────────────────────

const pool: PoolQuestion[] = QUESTIONS.map((q) => ({
  id: q.id, type: q.type, conceptId: q.conceptId, difficulty: q.difficulty, purposes: q.purposes,
  skills: q.skills.map((s) => ({ id: s.id, weight: s.weight ?? 1 })), probes: q.probes ?? [],
}));

describe("question picker", () => {
  const ctx = {
    targetSkills: ["loop_boundaries"], targetDifficulty: 2, purpose: "practice" as const, exclude: new Set<string>(),
    lastSeen: new Map<string, Date>(), activeMisconceptions: new Set<string>(), executionAvailable: false, lastType: null, now: NOW,
  };
  it("targets the requested skill near the requested difficulty", () => {
    const q = pickQuestion(pool, ctx)!;
    expect(q.skills.some((s) => s.id === "loop_boundaries")).toBe(true);
    expect(Math.abs(q.difficulty - 2)).toBeLessThanOrEqual(1);
  });
  it("prefers questions that probe an active misconception", () => {
    const q = pickQuestion(pool, { ...ctx, targetSkills: ["loop_condition", "loop_boundaries"], activeMisconceptions: new Set(["MC-LOOP-06"]) })!;
    expect(q.probes).toContain("MC-LOOP-06");
  });
  it("never offers coding questions when execution isn't available, and skips excluded ones", () => {
    const q = pickQuestion(pool, { ...ctx, targetSkills: ["loop_accumulation"] })!;
    expect(q.type).not.toBe("write_code");
    const again = pickQuestion(pool, { ...ctx, exclude: new Set([q.id]) });
    expect(again?.id).not.toBe(q.id);
  });
});

// ── Pedagogy scenarios A–F (§70) ─────────────────────────────────────────────

function conceptInfos(): ConceptInfo[] {
  const practiceable = new Set(QUESTIONS.filter((q) => q.purposes.includes("practice")).map((q) => q.conceptId));
  return CONCEPTS.map((c, order) => ({
    id: c.id, title: c.title, status: c.status, order, prerequisites: c.prerequisites, skills: c.skills.map((s) => ({ id: s.id, title: s.title })),
    coreLessonId: lessonsForConcept(c.id, "core")[0]?.id ?? null,
    remediationLessonId: lessonsForConcept(c.id, "remediation")[0]?.id ?? null,
    courseLessonId: c.courseLessons[0] ?? null,
    practiceable: practiceable.has(c.id),
  }));
}

function snapshot(skillStates: Record<string, SkillState>, extra: Partial<LearnerSnapshot> = {}): LearnerSnapshot {
  const skills = new Map<string, SkillInfo>(Object.entries(skillStates).map(([skillId, s]) => [skillId, { skillId, ...s }]));
  return { diagnosticDone: true, goal: null, concepts: conceptInfos(), skills, misconceptions: [], revisionDue: [], completedLessons: new Set(), now: NOW, ...extra };
}

const allSkillsOf = (...conceptIds: string[]) => CONCEPTS.filter((c) => conceptIds.includes(c.id)).flatMap((c) => c.skills.map((s) => s.id));
const strong = () => feed(newSkillState(), [2, 3, 3, 4, 4, 3, 5, 4].map((d) => solo(d)));
const BASICS = ["cpp-basics", "variables-types", "arithmetic-ops", "comparison-ops", "conditions"];

describe("pedagogy scenarios", () => {
  it("A — knows loops strongly: moves forward past for loops", () => {
    const states = Object.fromEntries(allSkillsOf(...BASICS, "for-loops").map((id) => [id, strong()]));
    const d = decideNext(snapshot(states, { completedLessons: new Set(["for-loops-core"]) }));
    expect(d.conceptId).not.toBe("for-loops");
    expect(["while-loops", "nested-loops", "functions", "arrays"]).toContain(d.conceptId);
  });

  it("B — writes syntax fine but fails boundaries: gets targeted boundary practice", () => {
    const states: Record<string, SkillState> = Object.fromEntries(allSkillsOf(...BASICS, "for-loops").map((id) => [id, strong()]));
    states.loop_boundaries = feed(newSkillState(), [wrong(2), solo(2), wrong(3), wrong(2), wrong(3)]);
    const d = decideNext(snapshot(states, { completedLessons: new Set(["for-loops-core"]) }));
    expect(d.action).toBe("practice");
    expect(d.conceptId).toBe("for-loops");
    expect(d.skills[0]).toBe("loop_boundaries");
    expect(d.reasons.join(" ")).toMatch(/4 of your last 5 boundaries/i);
  });

  it("C — correct only after strong hints: never gets the same mastery as an independent learner", () => {
    const hinted = feed(newSkillState(), Array.from({ length: 8 }, () => strongHint()));
    const independent = feed(newSkillState(), Array.from({ length: 8 }, () => solo()));
    expect(hinted.correctCount).toBe(independent.correctCount);
    expect(hinted.mastery).toBeLessThan(independent.mastery - 0.3);
    expect(hinted.status).not.toBe("MASTERED");
    expect(independent.status).toBe("MASTERED");
  });

  it("D — mastered, then fails revision a week later: mastery drops and review comes back soon", () => {
    const mastered = strong();
    expect(mastered.status).toBe("MASTERED");
    const after = feed(mastered, [{ ...wrong(2), kind: "revision" }, { ...wrong(3), kind: "revision" }]);
    expect(after.mastery).toBeLessThan(mastered.mastery);
    expect(after.status).toBe("REINFORCING");
    const next = scheduleAfterReview({ stage: 3 }, 0, false, NOW);
    expect(next.intervalDays).toBe(1);
  });

  it("E — repeatedly reverses < and >: the misconception becomes a recurring pattern and drives the next step", () => {
    let m = onMisconceptionDetected(null);
    m = onMisconceptionDetected(m);
    m = onMisconceptionDetected(m);
    expect(isRecurring(m)).toBe(true);
    const states = Object.fromEntries(allSkillsOf(...BASICS, "for-loops").map((id) => [id, strong()]));
    const d = decideNext(snapshot(states, {
      completedLessons: new Set(["for-loops-core"]),
      misconceptions: [{ code: "MC-LOOP-02", title: "Comparison points the wrong way", conceptId: "for-loops", ...m, lastDetectedAt: NOW }],
    }));
    expect(d.action).toBe("practice");
    expect(d.misconception).toBe("MC-LOOP-02");
    expect(d.reasons[0]).toMatch(/3 times/);
  });

  it("F — doesn't know relational operators: revisits the prerequisite instead of more loops", () => {
    const states: Record<string, SkillState> = Object.fromEntries(allSkillsOf("cpp-basics", "variables-types", "arithmetic-ops", "conditions").map((id) => [id, strong()]));
    states.relational_ops = feed(newSkillState(), [wrong(1), wrong(2), solo(1), wrong(2)]);
    states.logical_ops = feed(newSkillState(), [wrong(2), wrong(2)]);
    states.loop_boundaries = feed(newSkillState(), [wrong(2), wrong(2)]);
    const d = decideNext(snapshot(states));
    expect(d.action).toBe("remediate");
    expect(d.conceptId).toBe("comparison-ops");
    expect(d.lessonId).toBe("comparison-ops-review");
  });

  it("a topic with a question bank but no adaptive lesson goes straight to practice", () => {
    const states = Object.fromEntries(allSkillsOf("cpp-basics").map((id) => [id, strong()]));
    const d = decideNext(snapshot(states));
    expect(d.action).toBe("practice");
    expect(d.conceptId).toBe("variables-types");
  });

  it("is honest when the right next topic has no adaptive content yet, and points to the course lesson", () => {
    const states = Object.fromEntries(allSkillsOf("cpp-basics").map((id) => [id, strong()]));
    // Every concept has a question bank now, so simulate one that doesn't.
    const concepts = conceptInfos().map((c) => (c.id === "variables-types" ? { ...c, practiceable: false } : c));
    const d = decideNext(snapshot(states, { concepts }));
    expect(d.action).toBe("content_pending");
    expect(d.conceptId).toBe("variables-types");
    expect(d.alternative?.lessonId).toBe("for-loops-core");
    expect(d.courseLessonId).toBe("variables");
    expect(d.reasons.join(" ")).toContain("step-by-step lessons in the C++ course");
  });

  it("puts overdue revision first", () => {
    const states = Object.fromEntries(allSkillsOf(...BASICS).map((id) => [id, strong()]));
    const d = decideNext(snapshot(states, { revisionDue: [{ skillId: "relational_ops", dueAt: new Date(NOW.getTime() - 3 * DAY) }] }));
    expect(d.action).toBe("revise");
    expect(d.reasons.join(" ")).toMatch(/more than 2 days/);
  });
});
