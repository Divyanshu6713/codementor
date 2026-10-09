import type { LessonDef } from "../types";

const ALL_LOOP_SKILLS = [
  "loop_purpose", "loop_init", "loop_condition", "loop_update", "loop_tracing",
  "loop_boundaries", "loop_counting_down", "loop_accumulation",
];

/**
 * Flagship lesson: concept → intuition → example → checkpoint (with misconception-specific
 * re-teaching and a fresh retry) → guided → independent → debugging → explain it back →
 * adaptive practice → exit check.
 */
export const FOR_LOOPS_LESSON: LessonDef = {
  id: "for-loops-core",
  conceptId: "for-loops",
  kind: "core",
  title: "For loops: counting without copying",
  estimatedMinutes: 30,
  steps: [
    {
      key: "why", kind: "concept", title: "Why loops?",
      body: `Say you want to print the numbers 1 to 100. You *could* write 100 lines:

\`\`\`cpp
cout << 1 << "\\n";
cout << 2 << "\\n";
// … 97 more lines …
cout << 100 << "\\n";
\`\`\`

That's slow to write and easy to get wrong. Notice that every line does the **same job** with a number that goes up by one. A **loop** lets you write that job once and tell C++ how many times to repeat it.

Each repetition is called an **iteration**.`,
    },
    {
      key: "anatomy", kind: "visual", title: "The three parts of a for loop", visual: "loop-anatomy",
      body: `A for loop header has three parts, separated by semicolons:

- **Initialization** — runs once, at the very start: \`int i = 1\`
- **Condition** — checked *before every iteration*: keep going while it's true
- **Update** — runs *after every iteration*: \`i++\` adds 1

Click each part of the header to see what it does.`,
    },
    {
      key: "trace-sum", kind: "dry_run", title: "Watch a loop run", traceId: "sum-1-to-5",
      body: "Step through this loop one action at a time. Watch **when** the condition is checked and **when** `i++` happens.",
    },
    {
      key: "cp-order", kind: "checkpoint", questionId: "fl-cp-order",
      reteach: { "MC-LOOP-09": "rt-order", default: "rt-order" }, retryQuestionId: "fl-cp-order-b",
    },
    {
      key: "rt-order", kind: "reteach", title: "The order matters",
      body: `Here's the exact order a for loop follows:

1. **Initialize** — once
2. **Check** the condition → if false, leave the loop
3. Run the **body**
4. **Update**
5. Back to step 2

So the update (\`i++\`) always comes *after* the body. In \`for (int i = 0; i < 3; i++)\`, the first iteration runs with **i = 0**, the second with 1, the third with 2.

Think of a board game: you play your turn on the square you're standing on, *then* you move.`,
    },
    {
      key: "condition", kind: "concept", title: "The condition is a \"keep going\" rule",
      body: `The middle part of the header is the most important — and the most misunderstood.

Read it as **"keep going while …"**:

\`\`\`cpp
for (int i = 1; i <= 5; i++)
\`\`\`

"Start at 1. **Keep going while i is at most 5.** Add 1 each time."

The condition is checked **before** every iteration — including the first. If it's false the very first time, the body runs **zero** times.`,
    },
    {
      key: "flow", kind: "visual", title: "What happens at each check", visual: "loop-flow",
      body: "Follow the arrows: every time round, the loop comes back to the condition. True → body. False → exit.",
    },
    {
      key: "cp-condition", kind: "checkpoint", questionId: "fl-cp-condition",
      reteach: { "MC-LOOP-01": "rt-condition", "MC-LOOP-06": "rt-check-first", "MC-LOOP-04": "rt-boundary", "MC-LOOP-07": "rt-boundary", default: "rt-condition" },
      retryQuestionId: "fl-cp-condition-b",
    },
    {
      key: "rt-condition", kind: "reteach", title: "Another way to see the condition",
      body: `Imagine a gate with a guard. Before each lap, the guard checks a rule:

> "You may run another lap **while** your lap number is 5 or less."

On lap 1 the rule is true — run. On lap 5 it's still true — run. On lap 6 it's false — the gate closes.

The rule describes when you're **allowed to continue**. It doesn't describe the finish line. That's why \`i <= 5\` makes the loop run for 1, 2, 3, 4, 5 and stop at 6.`,
    },
    {
      key: "rt-check-first", kind: "reteach", title: "Check first, then run",
      body: `A for loop always checks *before* running the body — even the first time.

\`\`\`cpp
for (int i = 10; i < 5; i++) {
    cout << "hi";
}
\`\`\`

First check: is 10 < 5? **No** → the loop ends immediately. "hi" is printed **zero** times. A for loop never promises to run at least once.`,
    },
    {
      key: "boundary", kind: "visual", title: "< versus <=", visual: "boundary-explorer",
      body: "The difference between `<` and `<=` is exactly one iteration — the last one. Change n and switch the operator to see which values are included.",
    },
    {
      key: "cp-boundary", kind: "checkpoint", questionId: "fl-cp-boundary",
      reteach: { "MC-LOOP-04": "rt-boundary", "MC-LOOP-03": "rt-update", default: "rt-boundary" },
      retryQuestionId: "fl-cp-boundary-b",
    },
    {
      key: "rt-boundary", kind: "reteach", title: "Check both edges",
      body: `Off-by-one mistakes happen at the edges, so check both:

1. **First value** — what is \`i\` in the first iteration? (look at the initialization)
2. **Last value** — what's the biggest \`i\` for which the condition is still true?

| Header | First | Last | Count |
|---|---|---|---|
| \`i = 1; i < 5\` | 1 | 4 | 4 |
| \`i = 1; i <= 5\` | 1 | 5 | 5 |
| \`i = 0; i < 5\` | 0 | 4 | 5 |

To *include* the end value, use \`<=\`.`,
    },
    {
      key: "rt-update", kind: "reteach", title: "The update must make progress",
      body: `Each iteration must move \`i\` **toward** making the condition false.

- Counting up with \`i <= 5\`? Use \`i++\` — i grows until it passes 5.
- With \`i--\`, i goes 1, 0, −1, … and \`i <= 5\` stays true **forever**. That's an infinite loop.`,
    },
    { key: "code-count-up", kind: "code", questionId: "fl-code-count-up", mode: "guided" },
    {
      key: "down", kind: "concept", title: "Counting down and taking bigger steps",
      body: `All three parts can change. To count **down**, start high, keep going while you're still above the bottom, and subtract:

\`\`\`cpp
for (int i = 3; i >= 1; i--) {
    cout << i << " ";
}
cout << "Go!";   // 3 2 1 Go!
\`\`\`

The update can be any step: \`i += 2\` counts in twos, \`i -= 3\` goes down in threes.`,
    },
    {
      key: "trace-down", kind: "dry_run", title: "Trace a countdown", traceId: "count-down",
      body: "Notice the condition `i >= 1` is true at the start (3 ≥ 1) and becomes false once i reaches 0.",
    },
    {
      key: "cp-down", kind: "checkpoint", questionId: "fl-cp-down",
      reteach: { "MC-LOOP-02": "rt-direction", "MC-LOOP-04": "rt-boundary", "MC-LOOP-03": "rt-update", default: "rt-direction" },
      retryQuestionId: "fl-cp-down-b",
    },
    {
      key: "rt-direction", kind: "reteach", title: "Match the comparison to the direction",
      body: `Ask one question: **is the condition true at the start?**

- Counting **up** from 1 to n → \`i <= n\` (1 ≤ n is true at the start)
- Counting **down** from n to 1 → \`i >= 1\` (n ≥ 1 is true at the start)

If you count down with \`i <= 1\`, the very first check is \`5 <= 1\` — false — so nothing happens. The comparison points toward where you're *going*, staying true until you get past the end.`,
    },
    {
      key: "accumulate", kind: "concept", title: "Building up a result",
      body: `Loops are great at collecting a result: a total, a count, a product. The pattern is always:

\`\`\`cpp
int sum = 0;                    // 1. start the result BEFORE the loop
for (int i = 1; i <= n; i++) {
    sum += i;                   // 2. update it INSIDE the loop
}
cout << sum;                    // 3. use it AFTER the loop
\`\`\`

The result must be created **outside** the loop. Anything declared inside the braces is made fresh in every iteration.`,
    },
    {
      key: "cp-acc", kind: "checkpoint", questionId: "fl-cp-acc",
      reteach: { "MC-LOOP-05": "rt-accumulate", "MC-LOOP-04": "rt-boundary", default: "rt-accumulate" },
      retryQuestionId: "fl-cp-acc-b",
    },
    {
      key: "rt-accumulate", kind: "reteach", title: "A total remembers between iterations",
      body: `\`sum += i\` means **sum = sum + i**: take what sum already has and add i to it.

| i | sum before | sum after |
|---|---|---|
| 1 | 0 | 1 |
| 2 | 1 | 3 |
| 3 | 3 | 6 |
| 4 | 6 | 10 |

This only works because \`sum\` was created *before* the loop and keeps its value between iterations.`,
    },
    { key: "code-sum", kind: "code", questionId: "fl-code-sum", mode: "independent" },
    { key: "code-debug", kind: "code", questionId: "fl-code-debug-stop", mode: "debug" },
    { key: "explain", kind: "explain_back", questionId: "fl-explain-boundary" },
    { key: "practice", kind: "practice", title: "Practice", skills: ALL_LOOP_SKILLS, count: 4 },
    {
      key: "nested", kind: "visual", title: "Sneak peek: a loop inside a loop", visual: "nested-grid",
      body: `The body of a loop can contain *another* loop. For every iteration of the outer loop, the inner loop runs **from the start, all the way through**.

That's how you print rows and columns. You'll learn this properly next — here's a first look.`,
    },
    {
      key: "cp-nested", kind: "checkpoint", questionId: "fl-cp-nested",
      reteach: { "MC-NEST-01": "rt-nested", default: "rt-nested" }, retryQuestionId: "fl-cp-nested-b",
    },
    {
      key: "rt-nested", kind: "reteach", title: "The inner loop restarts every time",
      body: `Think of a clock: the minute hand goes all the way round (60 steps) for **every single** step of the hour hand.

With an outer loop of 2 and an inner loop of 3, the inner body runs **2 × 3 = 6** times, because the inner loop starts again from its initialization on every outer iteration.`,
    },
    { key: "exit", kind: "exit_check", skills: ALL_LOOP_SKILLS, count: 5 },
    {
      key: "summary", kind: "summary", title: "What you learned",
      body: `- A for loop has **initialization** (once), a **condition** (checked before every iteration — keep going while true) and an **update** (after every iteration).
- Check **both edges**: the first value and the last value. \`<=\` includes the end; \`<\` doesn't.
- The update must move toward making the condition false.
- Results like totals are created **before** the loop and updated inside it.`,
    },
  ],
};
