/**
 * Practice Arena metadata for judged problems: short display titles and tags.
 * Kept outside the question definitions so renaming a problem doesn't create a new question version.
 */
export const PROBLEM_META: Record<string, { title: string; tags: string[] }> = {
  "fl-code-count-up": { title: "Count to N", tags: ["loops", "output"] },
  "fl-code-count-down": { title: "Countdown", tags: ["loops", "counting down"] },
  "fl-code-sum": { title: "Sum 1 to N", tags: ["loops", "accumulation"] },
  "fl-code-evens": { title: "Even Steps", tags: ["loops", "step size"] },
  "fl-code-debug-stop": { title: "Fix: The Silent Loop", tags: ["debugging", "conditions"] },
  "fl-code-debug-offby1": { title: "Fix: One Short", tags: ["debugging", "off-by-one"] },
  "fl-code-multiples": { title: "Multiples of Three", tags: ["loops", "modulo", "counting"] },
  "fl-code-table": { title: "Times Table", tags: ["loops", "formatting"] },
  "fl-code-read-sum": { title: "Running Total", tags: ["loops", "input"] },
  "fl-code-factorial": { title: "Factorial Overflow", tags: ["loops", "long long", "edge cases"] },
  "fl-code-square": { title: "Star Square", tags: ["nested loops", "patterns"] },
};

export const ARENA_PROBLEM_IDS = Object.keys(PROBLEM_META);

/**
 * The Daily Challenge: one problem per calendar day (UTC), chosen deterministically from the
 * medium-and-harder problems so everyone gets the same one on the same day.
 */
export const DAILY_POOL = ["fl-code-evens", "fl-code-debug-offby1", "fl-code-multiples", "fl-code-table", "fl-code-read-sum", "fl-code-factorial", "fl-code-square"];

export function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function dailyChallengeFor(d: Date): string {
  const key = dayKey(d);
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return DAILY_POOL[h % DAILY_POOL.length];
}
