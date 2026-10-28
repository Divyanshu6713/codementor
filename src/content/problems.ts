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
  // Foundations
  "pb-code-greet": { title: "Sum and Product", tags: ["input", "arithmetic"] },
  "vt-code-convert": { title: "Celsius to Fahrenheit", tags: ["variables", "double"] },
  "ar-code-minutes": { title: "Hours and Minutes", tags: ["integer division", "modulo"] },
  "cd-code-leap": { title: "Leap Year", tags: ["conditions", "logical operators"] },
  "arena-grade": { title: "Grade Bands", tags: ["else-if", "boundaries"] },
  "arena-fizzbuzz": { title: "FizzBuzz", tags: ["loops", "modulo"] },
  "wl-code-reverse": { title: "Reverse the Digits", tags: ["while loops", "digits"] },
  "arena-digits": { title: "Digit Count and Sum", tags: ["do-while", "digits"] },
  "arena-prime": { title: "Prime or Composite", tags: ["loops", "math", "√n"] },
  "nl-code-grid": { title: "Multiplication Grid", tags: ["nested loops", "formatting"] },
  "arena-number-triangle": { title: "Number Triangle", tags: ["nested loops", "patterns"] },
  // Functions, arrays and strings
  "fn-code-max3": { title: "Largest of Three", tags: ["functions"] },
  "fn-code-swap": { title: "Sort Two by Reference", tags: ["functions", "references"] },
  "arena-gcd-lcm": { title: "GCD and LCM", tags: ["functions", "Euclid"] },
  "arr-code-above-avg": { title: "Above Average", tags: ["arrays", "two passes"] },
  "arena-second-largest": { title: "Second Largest", tags: ["arrays", "single pass"] },
  "arena-rotate": { title: "Rotate the Array", tags: ["arrays", "modulo"] },
  "st-code-words": { title: "Palindrome Check", tags: ["strings"] },
  "arena-anagram": { title: "Anagram Detector", tags: ["strings", "counting"] },
  "arena-caesar": { title: "Caesar Cipher", tags: ["strings", "characters"] },
  "md-code-borders": { title: "Row and Column Sums", tags: ["2D arrays"] },
  "arena-transpose": { title: "Transpose a Matrix", tags: ["2D arrays"] },
  "arena-spiral": { title: "Spiral Order", tags: ["2D arrays", "boundaries"] },
  // Core C++
  "arena-reverse-list": { title: "Reverse a Linked List", tags: ["pointers", "new/delete"] },
  "oo-code-rect": { title: "Rectangle Class", tags: ["classes"] },
  "arena-bank-account": { title: "Bank Account", tags: ["classes", "encapsulation"] },
  "sl-code-unique": { title: "Distinct Words in Order", tags: ["STL", "set"] },
  "arena-top-word": { title: "Most Frequent Word", tags: ["STL", "map"] },
  "arena-balanced": { title: "Balanced Brackets", tags: ["STL", "stack"] },
  "arena-two-sum": { title: "Two Sum", tags: ["STL", "hash map"] },
  "mc-code-filter": { title: "Count Above Threshold", tags: ["lambdas", "count_if"] },
  "arena-template-max": { title: "One Template, Two Types", tags: ["templates"] },
  "fe-code-parse": { title: "Parse Score Lines", tags: ["stringstream", "parsing"] },
  "arena-safe-divide": { title: "Safe Division", tags: ["exceptions"] },
  "ad-code-stackclass": { title: "Build a Stack Class", tags: ["classes", "vector"] },
  // Algorithms and data structures
  "ss-code-first": { title: "First Occurrence", tags: ["binary search"] },
  "arena-count-occurrences": { title: "Count Occurrences", tags: ["binary search", "lower_bound"] },
  "arena-leaderboard": { title: "Leaderboard Ranks", tags: ["sorting", "comparators"] },
  "rc-code-digits": { title: "Recursive Digit Sum", tags: ["recursion"] },
  "arena-permutations": { title: "All Permutations", tags: ["recursion", "backtracking"] },
  "arena-hanoi": { title: "Towers of Hanoi", tags: ["recursion"] },
  "ds-code-bfs": { title: "Shortest Hops (BFS)", tags: ["graphs", "BFS"] },
  "arena-components": { title: "Connected Components", tags: ["graphs", "BFS"] },
  "arena-window-sum": { title: "Best Window Sum", tags: ["sliding window"] },
  "arena-bits": { title: "Bits and Powers of Two", tags: ["bit manipulation"] },
  "al-code-maxsub": { title: "Maximum Subarray", tags: ["dynamic programming", "Kadane"] },
  "arena-grid-paths": { title: "Grid Paths", tags: ["dynamic programming", "grids"] },
  "arena-coin-change": { title: "Coin Change", tags: ["dynamic programming"] },
  "pj-code-inventory": { title: "Inventory Commands", tags: ["project", "map"] },
};

export const ARENA_PROBLEM_IDS = Object.keys(PROBLEM_META);

/**
 * The Daily Challenge: one problem per calendar day (UTC), chosen deterministically from the
 * medium-and-harder problems so everyone gets the same one on the same day.
 *
 * Daily-challenge XP is recomputed from stored history, so the pick for a past day must never
 * change. When the pool grows, the old pool keeps serving the days before the cut-over date.
 */
const POOL_HISTORY: { from: string; pool: string[] }[] = [
  { from: "0000-00-00", pool: ["fl-code-evens", "fl-code-debug-offby1", "fl-code-multiples", "fl-code-table", "fl-code-read-sum", "fl-code-factorial", "fl-code-square"] },
  {
    from: "2026-10-29",
    pool: [
      "fl-code-evens", "fl-code-debug-offby1", "fl-code-multiples", "fl-code-table", "fl-code-read-sum", "fl-code-factorial", "fl-code-square",
      "arena-fizzbuzz", "arena-prime", "arena-gcd-lcm", "arena-second-largest", "arena-rotate", "arena-anagram", "arena-caesar",
      "arena-transpose", "arena-spiral", "arena-balanced", "arena-two-sum", "arena-top-word", "arena-count-occurrences",
      "arena-leaderboard", "arena-permutations", "arena-hanoi", "arena-components", "arena-window-sum", "arena-bits",
      "arena-grid-paths", "arena-coin-change", "arena-reverse-list", "arena-bank-account", "arena-safe-divide", "arena-template-max",
    ],
  },
];

/** The pool in use today (and from now on). */
export const DAILY_POOL = POOL_HISTORY[POOL_HISTORY.length - 1].pool;
export const ALL_DAILY_POOL_IDS = [...new Set(POOL_HISTORY.flatMap((p) => p.pool))];

export function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function dailyChallengeFor(d: Date): string {
  const key = dayKey(d);
  const pool = [...POOL_HISTORY].reverse().find((p) => key >= p.from)!.pool;
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return pool[h % pool.length];
}
