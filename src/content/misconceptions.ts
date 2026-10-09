import type { MisconceptionDef } from "./types";

/**
 * Named misconceptions. Detection rules live with the questions (distractor tags, judge-output
 * detectors, header checks); the wording here is what the student sees.
 */
export const MISCONCEPTIONS: MisconceptionDef[] = [
  // ── Basics / variables / operators ──
  {
    code: "MC-IO-01", conceptId: "cpp-basics", category: "input_output",
    title: "cout adds spaces automatically",
    description: "Expects `cout << a << b` to print a space or newline between values.",
    studentExplanation: "You may be expecting cout to add spaces or new lines for you. It prints exactly what you give it — nothing more.",
    reteach: { title: "cout prints exactly what you send", body: "`cout << 1 << 2;` prints `12`. If you want a gap, send one: `cout << 1 << \" \" << 2;` prints `1 2`. For a new line, send `\"\\n\"` or `endl`." },
  },
  {
    code: "MC-VAR-01", conceptId: "variables-types", category: "variable_confusion",
    title: "Assignment links variables",
    description: "Thinks `b = a;` makes b follow later changes to a, or reads assignment right-to-left wrongly.",
    studentExplanation: "You may be thinking `b = a` connects the two variables. It only copies a's value at that moment.",
    reteach: { title: "Assignment is a one-time copy", body: "`b = a;` means: take the value in `a` *right now* and store a copy in `b`. If `a` changes later, `b` does not.\n\n```cpp\nint a = 5;\nint b = a;   // b is 5\na = 9;       // b is still 5\n```" },
  },
  {
    code: "MC-INT-01", conceptId: "arithmetic-ops", category: "data_type",
    title: "Integer division keeps the decimals",
    description: "Expects 7 / 2 to be 3.5 when both operands are int.",
    studentExplanation: "You may be expecting a decimal result. When both numbers are ints, C++ throws away the part after the decimal point.",
    reteach: { title: "int / int gives an int", body: "`7 / 2` is `3`, not `3.5` — both are ints, so the result is an int and the fraction is dropped. `7 % 2` gives the remainder, `1`. To get `3.5`, make one side a double: `7.0 / 2`." },
  },
  {
    code: "MC-INC-01", conceptId: "arithmetic-ops", category: "conceptual",
    title: "i + 1 changes i",
    description: "Thinks the expression `i + 1` updates i (confuses it with i++ / i += 1).",
    studentExplanation: "You may be thinking `i + 1` changes `i`. It only calculates a value — `i` stays the same unless you assign it (`i = i + 1`, `i++`, `i += 1`).",
    reteach: { title: "Calculating vs. changing", body: "`i + 1` is just a value, like writing 6 when i is 5. To *change* i, you must store the result back: `i = i + 1;` — which is exactly what `i++` and `i += 1` do." },
  },
  {
    code: "MC-REL-01", conceptId: "comparison-ops", category: "syntax",
    title: "= used for comparison",
    description: "Uses = (assignment) where == (comparison) is needed.",
    studentExplanation: "You may be using `=` to compare. In C++ `=` stores a value; `==` asks \"are these equal?\"",
    reteach: { title: "= stores, == compares", body: "`x = 5` puts 5 into x. `x == 5` is a question that is true or false. Inside a condition you almost always want `==`." },
  },
  {
    code: "MC-REL-02", conceptId: "comparison-ops", category: "boundary",
    title: "Strict vs. inclusive comparison",
    description: "Treats < as if it includes equality (5 < 5 is true) or <= as strict.",
    studentExplanation: "You may be treating `<` and `<=` as the same. `5 < 5` is false — nothing is smaller than itself. `5 <= 5` is true.",
    reteach: { title: "The edge case decides it", body: "Check the edge value directly:\n\n- `5 < 5` → **false** (5 is not smaller than 5)\n- `5 <= 5` → **true** (5 is equal, and \"or equal\" is allowed)\n\nWhenever two numbers might be equal, ask: does my comparison include the equal case?" },
  },
  {
    code: "MC-COND-01", conceptId: "conditions", category: "logic",
    title: "Several else-if branches run",
    description: "Thinks every true branch of an if / else-if ladder runs, not only the first.",
    studentExplanation: "You may be expecting more than one branch to run. In an if / else-if ladder, C++ runs only the first branch whose condition is true and skips the rest.",
    reteach: { title: "One ladder, one branch", body: "C++ checks the conditions top to bottom and stops at the first true one. Even if a later condition would also be true, it is never checked." },
  },
  // ── Loops ──
  {
    code: "MC-LOOP-01", conceptId: "for-loops", category: "conceptual",
    title: "Condition read as \"when to stop\"",
    description: "Interprets the loop condition as the stopping condition rather than the condition to continue (e.g. writes i == n or i > n).",
    studentExplanation: "You may be thinking of the condition as \"when the loop should stop\". It's the opposite: the loop keeps going *while* the condition is true and stops the moment it's false.",
    reteach: { title: "The condition is a \"keep going\" rule", body: "Read the middle part of a for loop as **\"keep going while …\"**.\n\n`for (int i = 1; i <= 5; i++)` reads: start at 1, **keep going while i ≤ 5**, add 1 each time.\n\nBefore every iteration C++ asks the question. True → run the body. False → leave the loop. So if the condition is false the very first time, the body never runs at all." },
  },
  {
    code: "MC-LOOP-02", conceptId: "for-loops", category: "logic",
    title: "Comparison points the wrong way",
    description: "Uses > where < is needed (or vice versa) for the loop's direction, so the condition is false immediately or never becomes false.",
    studentExplanation: "Your comparison may point the wrong way for the direction you're counting. Counting up usually needs `<` / `<=`; counting down usually needs `>` / `>=`.",
    reteach: { title: "Match the comparison to the direction", body: "Ask: **is the condition true at the start?**\n\n- Counting **up** from 1 to n: `i <= n` is true at the start (1 ≤ n) and becomes false after n.\n- Counting **down** from n to 1: `i >= 1` is true at the start and becomes false after 1.\n\nIf you count up with `i > n`, the first check is `1 > n` — false — so the loop never runs." },
  },
  {
    code: "MC-LOOP-03", conceptId: "for-loops", category: "logic",
    title: "Missing or wrong update",
    description: "Forgets the update step, or updates in the wrong direction, so the loop never ends.",
    studentExplanation: "The counter may not be moving toward the end. Without `i++` (or with `i--` when counting up) the condition stays true forever.",
    reteach: { title: "Every loop needs progress", body: "Each iteration must move the counter **closer to making the condition false**. Counting up to n? You need `i++` (or `i += step`). If `i` never changes, `i <= n` is true forever and the program runs until it's stopped." },
  },
  {
    code: "MC-LOOP-04", conceptId: "for-loops", category: "off_by_one",
    title: "Off-by-one at the boundary",
    description: "First or last iteration is missing or extra (< vs <=, starting at 0 vs 1).",
    studentExplanation: "Your loop is probably one step off at an edge — either the first or the last value. Check where the counter starts and whether the condition includes the last value.",
    reteach: { title: "Check both edges", body: "For any counting loop, check two things:\n\n1. **First value:** what is `i` in the first iteration? (the initialization)\n2. **Last value:** what is the last `i` for which the condition is still true?\n\n`for (int i = 1; i < 5; i++)` gives 1, 2, 3, 4 — the last value is 4, because `5 < 5` is false. To include 5, use `i <= 5`." },
  },
  {
    code: "MC-LOOP-05", conceptId: "for-loops", category: "logic",
    title: "Accumulator reset inside the loop",
    description: "Declares or resets the running total inside the loop body, so it never accumulates.",
    studentExplanation: "Your running total may be starting over every time round the loop. Create it once, *before* the loop, and only add to it inside.",
    reteach: { title: "Start the total before the loop", body: "A total must survive between iterations, so it must be created **outside** the loop:\n\n```cpp\nint sum = 0;              // once, before\nfor (int i = 1; i <= n; i++) {\n    sum += i;             // add each time\n}\n```\n\nIf `int sum = 0;` is inside the braces, a brand-new sum is made (and set to 0) every iteration." },
  },
  {
    code: "MC-LOOP-06", conceptId: "for-loops", category: "conceptual",
    title: "Body always runs once",
    description: "Believes a for loop's body runs at least once even if the condition is false at the start (confusion with do-while).",
    studentExplanation: "You may be thinking the body always runs at least once. A for loop checks the condition *first* — if it's false right away, the body runs zero times.",
    reteach: { title: "Check first, then run", body: "A for loop asks its question **before** each iteration, including the first. `for (int i = 10; i < 5; i++)` asks `10 < 5?` → false → the body runs zero times." },
  },
  {
    code: "MC-LOOP-07", conceptId: "for-loops", category: "off_by_one",
    title: "Miscounting iterations",
    description: "Counts iterations wrongly (e.g. thinks 0..<5 runs 4 or 6 times).",
    studentExplanation: "The number of iterations may be off by one. Try listing the values of `i` one by one and counting them.",
    reteach: { title: "List the values, then count", body: "`for (int i = 0; i < 5; i++)` runs with i = 0, 1, 2, 3, 4. That's **5** values. A quick rule for `i = a; i < b; i++` is **b − a** iterations; with `<=` it's **b − a + 1**." },
  },
  {
    code: "MC-LOOP-08", conceptId: "for-loops", category: "syntax",
    title: "Semicolon after the loop header",
    description: "Writes `for (...);` so the loop body is empty and the block runs once afterwards.",
    studentExplanation: "There may be a `;` right after your `for (...)`. That semicolon *is* the loop body (an empty one), so the block below runs only once.",
    reteach: { title: "No ; after for ( … )", body: "`for (int i = 0; i < 3; i++);` is a complete loop with an **empty** body. The `{ … }` underneath is not part of it and runs once after the loop finishes. Remove the `;`." },
  },
  {
    code: "MC-LOOP-09", conceptId: "for-loops", category: "conceptual",
    title: "Update happens before the first iteration",
    description: "Thinks the update runs before the body in the first iteration (e.g. first i is 1 when init is 0).",
    studentExplanation: "You may be applying the update before the first iteration. The order is: initialize → check → body → update → check → body …",
    reteach: { title: "The order of a for loop", body: "1. **Initialize** (once)\n2. **Check** the condition\n3. Run the **body**\n4. **Update**\n5. Go back to step 2\n\nSo in `for (int i = 0; …; i++)` the first iteration runs with i = 0. The `i++` happens *after* the body." },
  },
  {
    code: "MC-NEST-01", conceptId: "nested-loops", category: "conceptual",
    title: "Inner loop runs only once overall",
    description: "Thinks the inner loop runs through once in total instead of fully for every outer iteration.",
    studentExplanation: "You may be thinking the inner loop runs once in total. It runs completely, from the start, for *every* iteration of the outer loop.",
    reteach: { title: "The inner loop restarts every time", body: "With 3 outer iterations and 4 inner iterations, the inner body runs **3 × 4 = 12** times. Each time the outer loop moves on, the inner loop starts again from its initialization." },
  },
  // ── Later concepts (detected in the diagnostic) ──
  {
    code: "MC-FUNC-01", conceptId: "functions", category: "conceptual",
    title: "Printing vs. returning",
    description: "Thinks `return x;` prints x, or that cout gives a value back to the caller.",
    studentExplanation: "You may be mixing up returning and printing. `return` hands a value back to whoever called the function; it doesn't show anything on screen.",
    reteach: { title: "return gives back, cout shows", body: "`return 5;` sends 5 back to the caller, which can store or print it. `cout << 5;` shows 5 on the screen but the caller gets nothing." },
  },
  {
    code: "MC-ARRAY-01", conceptId: "arrays", category: "off_by_one",
    title: "Indexing starts at 1",
    description: "Assumes the first element of an array is at index 1.",
    studentExplanation: "You may be counting array positions from 1. In C++ the first element is at index 0, and the last is at size − 1.",
    reteach: { title: "Arrays count from 0", body: "For `int a[4] = {7, 3, 9, 2};` the elements are `a[0]` = 7, `a[1]` = 3, `a[2]` = 9, `a[3]` = 2. There is no `a[4]`." },
  },
];
