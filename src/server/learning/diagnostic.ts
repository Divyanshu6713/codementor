/**
 * Adaptive diagnostic over the concept ladder (pure logic).
 *
 * - Starts at a rung chosen from onboarding (beginners at the bottom, experienced students higher).
 * - One question per rung while answers are right; a wrong answer gets a second "confirm" question
 *   on the same rung before anything is concluded (one slip isn't a gap).
 * - Climbing stops at the first confirmed gap: no advanced-array questions for someone who
 *   struggles with variables.
 * - If the first gap is above the bottom, it walks down until it finds solid ground.
 * - Adds confirm questions on passed rungs until there's enough evidence (≥ MIN), capped at MAX.
 */

export const MIN_QUESTIONS = 5;
export const MAX_QUESTIONS = 14;

export interface DiagItem {
  questionId: string;
  conceptId: string;
  difficulty: number;
  type: string;
}

export interface DiagAnswer {
  questionId: string;
  conceptId: string;
  correct: boolean;
}

export type RungStatus = "pass" | "partial" | "fail" | "pending" | "unknown";

export interface DiagnosticPlan {
  ladder: readonly string[];
  entry: number;
}

export type DiagStep =
  | { done: false; questionId: string; conceptId: string; purpose: "calibration" | "confirm" | "probe_up" | "probe_down" }
  | { done: true };

export function entryRung(profile: { experience: string | null; usedCpp: boolean | null; confidence: number | null }, ladderLength: number): number {
  let rung = { none: 0, a_little: 1, some: 3, comfortable: 4 }[profile.experience ?? "none"] ?? 0;
  if (profile.usedCpp && rung > 0) rung += 1;
  if (profile.confidence === 1 && rung > 0) rung -= 1;
  return Math.min(Math.max(rung, 0), ladderLength - 1);
}

export function rungStatus(answers: DiagAnswer[], conceptId: string, hasMoreItems: boolean): RungStatus {
  const mine = answers.filter((a) => a.conceptId === conceptId);
  if (!mine.length) return "unknown";
  const right = mine.filter((a) => a.correct).length;
  if (right === mine.length) return "pass";
  if (right === 0) return mine.length >= 2 || !hasMoreItems ? "fail" : "pending";
  return "partial";
}

function pickItem(bank: DiagItem[], conceptId: string, asked: Set<string>, executionAvailable: boolean, preferType?: string): DiagItem | undefined {
  const candidates = bank
    .filter((q) => q.conceptId === conceptId && !asked.has(q.questionId))
    .filter((q) => executionAvailable || q.type !== "write_code")
    .sort((a, b) => a.difficulty - b.difficulty || a.questionId.localeCompare(b.questionId));
  // A confirm question should look different from the first one where possible.
  return (preferType && candidates.find((q) => q.type !== preferType)) || candidates.find((q) => q.type !== "write_code") || candidates[0];
}

export function nextDiagnosticStep(plan: DiagnosticPlan, answers: DiagAnswer[], bank: DiagItem[], opts: { executionAvailable: boolean }): DiagStep {
  if (answers.length >= MAX_QUESTIONS) return { done: true };
  const asked = new Set(answers.map((a) => a.questionId));
  const { ladder } = plan;
  const status = (i: number) => {
    const c = ladder[i];
    return rungStatus(answers, c, Boolean(pickItem(bank, c, asked, opts.executionAvailable)));
  };
  const ask = (i: number, purpose: Exclude<DiagStep, { done: true }>["purpose"]): DiagStep | null => {
    const last = answers.filter((a) => a.conceptId === ladder[i]).at(-1);
    const lastType = last ? bank.find((q) => q.questionId === last.questionId)?.type : undefined;
    const item = pickItem(bank, ladder[i], asked, opts.executionAvailable, lastType);
    return item ? { done: false, questionId: item.questionId, conceptId: item.conceptId, purpose } : null;
  };

  // 1. Resolve any rung with a single wrong answer before concluding anything.
  for (let i = 0; i < ladder.length; i++) {
    if (status(i) === "pending") {
      const step = ask(i, "confirm");
      if (step) return step;
    }
  }

  const statuses = ladder.map((_, i) => status(i));
  const askedIdx = statuses.map((s, i) => (s === "unknown" ? -1 : i)).filter((i) => i >= 0);
  const firstFail = statuses.findIndex((s) => s === "fail");

  // 2. Nothing asked yet → calibrate at the entry rung.
  if (!askedIdx.length) return ask(plan.entry, "calibration") ?? { done: true };

  // 3. Climb while there is no confirmed gap.
  if (firstFail < 0) {
    const next = Math.max(...askedIdx) + 1;
    if (next < ladder.length) {
      const step = ask(next, answers.length < 3 ? "calibration" : "probe_up");
      if (step) return step;
    }
  }

  // 4. Walk down from the lowest gap until a rung is passed (or the bottom is reached).
  if (firstFail > 0 && statuses[firstFail - 1] === "unknown") {
    const step = ask(firstFail - 1, "probe_down");
    if (step) return step;
  }

  // 5. Enough evidence? Otherwise confirm the highest passed rungs that only have one answer.
  if (answers.length < MIN_QUESTIONS) {
    const passed = statuses.map((s, i) => (s === "pass" ? i : -1)).filter((i) => i >= 0).reverse();
    for (const i of passed) {
      if (answers.filter((a) => a.conceptId === ladder[i]).length < 2) {
        const step = ask(i, "confirm");
        if (step) return step;
      }
    }
    // Still short: check one rung below where we started rather than only assuming it's known.
    const lowest = Math.min(...askedIdx);
    if (lowest > 0 && statuses[lowest - 1] === "unknown") {
      const step = ask(lowest - 1, "probe_down");
      if (step) return step;
    }
  }
  return { done: true };
}

export interface DiagnosticOutcome {
  /** Per ladder concept: what the diagnostic concluded. */
  concepts: { conceptId: string; status: RungStatus | "inferred"; asked: number; correct: number }[];
  /** Highest rung passed (or -1). */
  highestPassed: number;
}

/** Rungs below the lowest passed rung that were never asked are inferred as known. */
export function summarizeDiagnostic(plan: DiagnosticPlan, answers: DiagAnswer[]): DiagnosticOutcome {
  const statuses = plan.ladder.map((c) => rungStatus(answers, c, false));
  const passedIdx = statuses.map((s, i) => (s === "pass" || s === "partial" ? i : -1)).filter((i) => i >= 0);
  const lowestPassed = passedIdx.length ? Math.min(...passedIdx) : -1;
  return {
    highestPassed: passedIdx.length ? Math.max(...passedIdx) : -1,
    concepts: plan.ladder.map((conceptId, i) => {
      const mine = answers.filter((a) => a.conceptId === conceptId);
      const s = statuses[i];
      return {
        conceptId,
        status: s === "unknown" && lowestPassed > i ? "inferred" : s,
        asked: mine.length,
        correct: mine.filter((a) => a.correct).length,
      };
    }),
  };
}
