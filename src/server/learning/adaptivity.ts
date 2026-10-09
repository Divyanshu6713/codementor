/**
 * Small deterministic policies: difficulty ladder, revision scheduling and misconception state.
 */

// ── Difficulty ladder ───────────────────────────────────────────────────────

export const DIFFICULTY_LABELS = ["", "Easy", "Medium-easy", "Medium", "Medium-hard", "Challenge"] as const;

/** Starting difficulty for practice from current mastery of the target skills. */
export function initialDifficulty(mastery: number | null): number {
  if (mastery === null) return 1;
  if (mastery < 0.4) return 1;
  if (mastery < 0.6) return 2;
  if (mastery < 0.75) return 3;
  if (mastery < 0.88) return 4;
  return 5;
}

/**
 * One step at a time: two independent successes in a row → harder; a miss (or a success that
 * needed strong hints) → easier. Never jumps two levels.
 */
export function nextDifficulty(current: number, history: { correct: boolean; independent: boolean; maxHintLevel: number }[]): number {
  const last = history.at(-1);
  if (!last) return current;
  if (!last.correct || last.maxHintLevel >= 2) return Math.max(1, current - 1);
  const prev = history.at(-2);
  if (last.independent && prev?.independent) return Math.min(5, current + 1);
  return current;
}

// ── Spaced revision ─────────────────────────────────────────────────────────

/** Initial heuristic ladder in days; adjusted by recall quality, not fixed rules. */
export const REVISION_INTERVALS = [1, 3, 7, 14, 30, 60] as const;
const DAY = 24 * 60 * 60 * 1000;

export interface RevisionState {
  stage: number;
  intervalDays: number;
  dueAt: Date;
  reason: "scheduled" | "misconception" | "failed_recall";
}

export function firstRevision(now: Date): RevisionState {
  return { stage: 0, intervalDays: REVISION_INTERVALS[0], dueAt: new Date(now.getTime() + REVISION_INTERVALS[0] * DAY), reason: "scheduled" };
}

/**
 * quality = average credit on the revision questions for this skill (0..1).
 * Easy recall stretches the interval, partial recall repeats it, failed recall starts over,
 * and an active misconception keeps the next review within two days.
 */
export function scheduleAfterReview(prev: Pick<RevisionState, "stage">, quality: number, hasActiveMisconception: boolean, now: Date): RevisionState {
  let stage = prev.stage;
  let reason: RevisionState["reason"] = "scheduled";
  if (quality >= 0.8) stage = Math.min(stage + 1, REVISION_INTERVALS.length - 1);
  else if (quality < 0.5) {
    stage = 0;
    reason = "failed_recall";
  }
  let intervalDays: number = REVISION_INTERVALS[stage];
  if (hasActiveMisconception && intervalDays > 2) {
    intervalDays = 2;
    reason = "misconception";
  }
  return { stage, intervalDays, dueAt: new Date(now.getTime() + intervalDays * DAY), reason };
}

/** A misconception detected outside revision pulls an existing review earlier. */
export function pullForward(dueAt: Date, now: Date): Date {
  const soon = new Date(now.getTime() + 1 * DAY);
  return dueAt > soon ? soon : dueAt;
}

// ── Misconception state ────────────────────────────────────────────────────

export interface MisconceptionState {
  occurrences: number;
  recurrences: number;
  probeStreak: number;
  status: "active" | "resolved";
}

/** Correct answers in a row on probing questions needed to call a misconception resolved. */
export const PROBES_TO_RESOLVE = 2;

export function onMisconceptionDetected(prev: MisconceptionState | null): MisconceptionState {
  if (!prev) return { occurrences: 1, recurrences: 0, probeStreak: 0, status: "active" };
  return {
    occurrences: prev.occurrences + 1,
    recurrences: prev.recurrences + (prev.status === "resolved" ? 1 : 0),
    probeStreak: 0,
    status: "active",
  };
}

/** A probing question for this misconception was answered correctly without help. */
export function onProbePassed(prev: MisconceptionState): MisconceptionState {
  const probeStreak = prev.probeStreak + 1;
  return { ...prev, probeStreak, status: prev.status === "active" && probeStreak >= PROBES_TO_RESOLVE ? "resolved" : prev.status };
}

/** Recurring = seen at least twice, or came back after being resolved. */
export function isRecurring(s: Pick<MisconceptionState, "occurrences" | "recurrences">) {
  return s.occurrences >= 2 || s.recurrences > 0;
}
