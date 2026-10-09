import type { QuestionDef } from "../types";

const STARTER = (comment: string) => `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    // ${comment}

    return 0;
}`;

/** The flagship module's question pool: checkpoints, judged coding tasks, practice and revision items. */
export const FOR_LOOP_QUESTIONS: QuestionDef[] = [
  // ── Checkpoints (each has a "-b" variant used after re-teaching) ──
  {
    id: "fl-cp-order", type: "mcq", conceptId: "for-loops", difficulty: 1,
    skills: [{ id: "loop_init" }, { id: "loop_tracing", weight: 0.5 }], purposes: ["lesson", "practice", "revision"], probes: ["MC-LOOP-09"],
    prompt: "In this loop, what is the value of `i` during the first iteration?",
    code: `for (int i = 0; i < 3; i++) {
    cout << i;
}`,
    options: [
      { id: "a", text: "0" },
      { id: "b", text: "1", misconception: "MC-LOOP-09", feedback: "i++ runs after the body, so the first iteration still has i = 0." },
      { id: "c", text: "3" },
      { id: "d", text: "It has no value yet" },
    ],
    correct: "a",
    hints: [
      "Which part of the header runs before anything else?",
      "Think about the order: initialize, check, body, update.",
      "Look at `int i = 0` — when does `i++` happen?",
      "The update step runs at the end of each iteration, never before the first one.",
      "First iteration: i has its starting value.",
    ],
    explanation: "Initialization sets i = 0, the condition 0 < 3 is true, and the body runs with i = 0. i++ only happens after the body.",
  },
  {
    id: "fl-cp-order-b", type: "mcq", conceptId: "for-loops", difficulty: 2,
    skills: [{ id: "loop_init" }, { id: "loop_tracing", weight: 0.5 }], purposes: ["lesson", "practice", "revision"], probes: ["MC-LOOP-09"],
    prompt: "What is the first number this prints?",
    code: `for (int i = 10; i <= 12; i++) {
    cout << i << " ";
}`,
    options: [
      { id: "a", text: "10" },
      { id: "b", text: "11", misconception: "MC-LOOP-09", feedback: "The body runs before the first i++." },
      { id: "c", text: "12" },
      { id: "d", text: "Nothing is printed", misconception: "MC-LOOP-01" },
    ],
    correct: "a",
    hints: [
      "What's i right after initialization?",
      "Is the condition true for that value?",
      "The update happens after the body, not before.",
      "Initialize → check → body (prints) → update.",
      "The first printed value is the starting value.",
    ],
    explanation: "i starts at 10, `10 <= 12` is true, so the body prints 10 first. Then i becomes 11.",
  },
  {
    id: "fl-cp-condition", type: "mcq", conceptId: "for-loops", difficulty: 2,
    skills: [{ id: "loop_condition" }], purposes: ["lesson", "practice", "revision"], probes: ["MC-LOOP-01", "MC-LOOP-04"],
    prompt: "When does this loop stop?",
    code: `for (int i = 1; i <= 5; i++) {
    cout << i;
}`,
    options: [
      { id: "a", text: "As soon as `i <= 5` becomes true", misconception: "MC-LOOP-01", feedback: "`i <= 5` is true right at the start — that's when it keeps going, not when it stops." },
      { id: "b", text: "When `i <= 5` becomes false — that is, when i reaches 6" },
      { id: "c", text: "When i equals 5", misconception: "MC-LOOP-04", feedback: "When i is 5, `5 <= 5` is still true, so the body runs once more." },
      { id: "d", text: "After the body has run 6 times", misconception: "MC-LOOP-07" },
    ],
    correct: "b",
    hints: [
      "Is the condition true or false at the very start, when i is 1?",
      "The condition is checked before every iteration.",
      "Focus on `i <= 5`: what does the loop do while that's true?",
      "The loop keeps going while the condition is true and leaves as soon as it's false.",
      "Find the first value of i that makes `i <= 5` false.",
    ],
    explanation: "The loop continues while i <= 5 is true. It becomes false when i is 6, so the loop stops then (after printing 1 to 5).",
  },
  {
    id: "fl-cp-condition-b", type: "mcq", conceptId: "for-loops", difficulty: 2,
    skills: [{ id: "loop_condition" }], purposes: ["lesson", "practice", "revision"], probes: ["MC-LOOP-01", "MC-LOOP-06"],
    prompt: "What does this print?",
    code: `for (int i = 1; i > 3; i++) {
    cout << i;
}`,
    options: [
      { id: "a", text: "Nothing — the condition is false at the start, so the body never runs" },
      { id: "b", text: "123", misconception: "MC-LOOP-01", feedback: "That would be true if the condition meant \"stop when i > 3\". It means \"keep going while i > 3\"." },
      { id: "c", text: "1", misconception: "MC-LOOP-06", feedback: "A for loop checks first; the body can run zero times." },
      { id: "d", text: "It never stops", misconception: "MC-LOOP-03" },
    ],
    correct: "a",
    hints: [
      "Check the condition with i = 1. True or false?",
      "A for loop asks its question before the first iteration too.",
      "Look at `i > 3` when i is 1.",
      "If the condition is false the first time, the body is skipped completely.",
      "1 > 3 is …?",
    ],
    explanation: "With i = 1, `1 > 3` is false before the first iteration, so the loop body never runs.",
  },
  {
    id: "fl-cp-count", type: "mcq", conceptId: "for-loops", difficulty: 2,
    skills: [{ id: "loop_tracing" }], purposes: ["lesson", "practice", "revision"], probes: ["MC-LOOP-07"],
    prompt: "How many times does the body of this loop run?",
    code: `for (int i = 0; i < 5; i++) {
    cout << "*";
}`,
    options: [
      { id: "a", text: "4", misconception: "MC-LOOP-07" },
      { id: "b", text: "5" },
      { id: "c", text: "6", misconception: "MC-LOOP-07" },
      { id: "d", text: "It depends on what's in the body" },
    ],
    correct: "b",
    hints: [
      "Which values does i take?",
      "List them, starting from the initialization.",
      "The last value is the largest one for which `i < 5` is true.",
      "0, 1, 2, 3, 4 — then 5 < 5 is false.",
      "Count the values in the list.",
    ],
    explanation: "i takes 0, 1, 2, 3, 4 — five values — then `5 < 5` is false.",
  },
  {
    id: "fl-cp-count-b", type: "mcq", conceptId: "for-loops", difficulty: 2,
    skills: [{ id: "loop_tracing" }, { id: "loop_boundaries", weight: 0.5 }], purposes: ["lesson", "practice", "revision"], probes: ["MC-LOOP-07"],
    prompt: "How many times does the body of this loop run?",
    code: `for (int i = 3; i <= 7; i++) {
    cout << i;
}`,
    options: [
      { id: "a", text: "4", misconception: "MC-LOOP-07", feedback: "7 − 3 = 4, but `<=` includes 7 as well." },
      { id: "b", text: "5" },
      { id: "c", text: "6" },
      { id: "d", text: "7" },
    ],
    correct: "b",
    hints: [
      "Where does i start, and what's the last value that passes the check?",
      "List the values of i.",
      "`<=` includes the end value.",
      "3, 4, 5, 6, 7.",
      "Count them.",
    ],
    explanation: "i takes 3, 4, 5, 6, 7: five iterations (7 − 3 + 1).",
  },
  {
    id: "fl-cp-boundary", type: "mcq", conceptId: "for-loops", difficulty: 2,
    skills: [{ id: "loop_boundaries" }], purposes: ["lesson", "practice", "revision"], probes: ["MC-LOOP-04", "MC-LOOP-03"],
    prompt: "Which loop prints `1 2 3 4 5`?",
    options: [
      { id: "a", text: "for (int i = 1; i < 5; i++) cout << i << \" \";", misconception: "MC-LOOP-04", feedback: "This stops before 5: when i is 5, `5 < 5` is false." },
      { id: "b", text: "for (int i = 1; i <= 5; i++) cout << i << \" \";" },
      { id: "c", text: "for (int i = 0; i < 5; i++) cout << i << \" \";", misconception: "MC-LOOP-04", feedback: "This prints 0 1 2 3 4 — it starts one too early." },
      { id: "d", text: "for (int i = 1; i <= 5; i--) cout << i << \" \";", misconception: "MC-LOOP-03", feedback: "i-- moves i away from 5, so the condition stays true forever." },
    ],
    correct: "b",
    hints: [
      "Check each loop's first value and last value.",
      "Two edges matter: where it starts and the last value that passes the condition.",
      "You need first = 1 and last = 5.",
      "To include 5, the condition must be true when i is 5.",
      "Start at 1, use `<=` with 5, count up.",
    ],
    explanation: "Starting at 1 with `i <= 5` and `i++` gives exactly 1 to 5.",
  },
  {
    id: "fl-cp-boundary-b", type: "complete_code", conceptId: "for-loops", difficulty: 3,
    skills: [{ id: "loop_boundaries" }, { id: "loop_condition", weight: 0.5 }], purposes: ["lesson", "practice", "revision"],
    probes: ["MC-LOOP-04", "MC-LOOP-02", "MC-LOOP-01"],
    prompt: "Fill in the condition so this prints `2 3 4 5 6`.",
    code: `for (int i = 2; ____; i++) {
    cout << i << " ";
}`,
    accepted: ["i <= 6", "i < 7", "6 >= i", "7 > i"],
    wrongAnswers: [
      { answer: "i < 6", misconception: "MC-LOOP-04", feedback: "That stops at 5 — when i is 6, `6 < 6` is false." },
      { answer: "i <= 7", misconception: "MC-LOOP-04", feedback: "That also prints 7." },
      { answer: "i > 6", misconception: "MC-LOOP-02", feedback: "With i = 2, `2 > 6` is false right away — nothing prints." },
      { answer: "i == 6", misconception: "MC-LOOP-01", feedback: "The condition says when to keep going. `2 == 6` is false at the start, so nothing prints." },
      { answer: "i >= 6", misconception: "MC-LOOP-02" },
    ],
    hints: [
      "What's the last number that should print?",
      "The condition must be true for every number you want to print.",
      "It must be true for 6 and false for 7.",
      "Use `<=` to include the last value, or `<` with one more.",
      "i <= ___",
    ],
    explanation: "The loop must keep going for i = 6 and stop at 7: `i <= 6` (or `i < 7`).",
  },
  {
    id: "fl-cp-update", type: "mcq", conceptId: "for-loops", difficulty: 2,
    skills: [{ id: "loop_update" }], purposes: ["lesson", "practice", "revision"], probes: ["MC-LOOP-03"],
    prompt: "What happens when this runs?",
    code: `for (int i = 1; i <= 5; i--) {
    cout << i << " ";
}`,
    options: [
      { id: "a", text: "It prints 1 2 3 4 5", feedback: "Look at the update: i-- makes i smaller." },
      { id: "b", text: "It never stops: i goes 1, 0, −1, … and stays ≤ 5" },
      { id: "c", text: "It prints 5 4 3 2 1", misconception: "MC-LOOP-03", feedback: "The start value is 1; i-- doesn't change where it starts." },
      { id: "d", text: "Nothing is printed", misconception: "MC-LOOP-06" },
    ],
    correct: "b",
    hints: [
      "After each iteration, which way does i move?",
      "The update must move i toward making the condition false.",
      "i starts at 1 and the condition is `i <= 5`. Will i ever get above 5?",
      "i-- makes i smaller, so `i <= 5` stays true forever.",
      "Ask: does i ever reach 6?",
    ],
    explanation: "i-- moves i away from 5 (1, 0, −1, …), so `i <= 5` never becomes false — an infinite loop.",
  },
  {
    id: "fl-cp-update-b", type: "predict_output", conceptId: "for-loops", difficulty: 3,
    skills: [{ id: "loop_update" }, { id: "loop_boundaries", weight: 0.5 }], purposes: ["lesson", "practice", "revision"],
    probes: ["MC-LOOP-04", "MC-LOOP-09"],
    prompt: "What does this print?",
    code: `for (int i = 0; i < 10; i += 3) {
    cout << i << " ";
}`,
    options: [
      { id: "a", text: "0 3 6 9" },
      { id: "b", text: "0 3 6", misconception: "MC-LOOP-04", feedback: "9 < 10 is true, so 9 is printed too." },
      { id: "c", text: "3 6 9", misconception: "MC-LOOP-09", feedback: "The first iteration uses the starting value 0." },
      { id: "d", text: "0 1 2 3 4 5 6 7 8 9", feedback: "i += 3 adds 3 each time, not 1." },
    ],
    correct: "a",
    hints: [
      "What does `i += 3` do after each iteration?",
      "Write down i's values: start, then +3, +3 …",
      "Stop as soon as the condition is false.",
      "0, 3, 6, 9 — then 12 < 10 is false.",
      "Print every value that passed the check.",
    ],
    explanation: "i goes 0, 3, 6, 9; at 12 the condition fails. So it prints 0 3 6 9.",
  },
  {
    id: "fl-cp-down", type: "mcq", conceptId: "for-loops", difficulty: 2,
    skills: [{ id: "loop_counting_down" }], purposes: ["lesson", "practice", "revision"], probes: ["MC-LOOP-02", "MC-LOOP-04", "MC-LOOP-03"],
    prompt: "Which loop prints `5 4 3 2 1`?",
    options: [
      { id: "a", text: "for (int i = 5; i >= 1; i--) cout << i << \" \";" },
      { id: "b", text: "for (int i = 5; i <= 1; i--) cout << i << \" \";", misconception: "MC-LOOP-02", feedback: "`5 <= 1` is false at the start, so nothing prints." },
      { id: "c", text: "for (int i = 5; i > 1; i--) cout << i << \" \";", misconception: "MC-LOOP-04", feedback: "This stops before 1, because `1 > 1` is false." },
      { id: "d", text: "for (int i = 5; i >= 1; i++) cout << i << \" \";", misconception: "MC-LOOP-03", feedback: "i++ moves away from 1, so it never stops." },
    ],
    correct: "a",
    hints: [
      "For each option, is the condition true when i is 5?",
      "Counting down needs i to get smaller and the condition to fail after 1.",
      "Check the start, the condition at the start, and the direction of the update.",
      "Counting down: start high, `>=` the lowest value, `i--`.",
      "Start 5, keep going while i ≥ 1, subtract 1.",
    ],
    explanation: "Start at 5, keep going while i >= 1, decrease with i--: 5 4 3 2 1.",
  },
  {
    id: "fl-cp-down-b", type: "complete_code", conceptId: "for-loops", difficulty: 3,
    skills: [{ id: "loop_counting_down" }, { id: "loop_boundaries", weight: 0.5 }], purposes: ["lesson", "practice", "revision"],
    probes: ["MC-LOOP-02", "MC-LOOP-04"],
    prompt: "Fill in the condition so this prints `10 9 8 7`.",
    code: `for (int i = 10; ____; i--) {
    cout << i << " ";
}`,
    accepted: ["i >= 7", "i > 6", "7 <= i", "6 < i"],
    wrongAnswers: [
      { answer: "i <= 7", misconception: "MC-LOOP-02", feedback: "With i = 10, `10 <= 7` is false right away." },
      { answer: "i < 7", misconception: "MC-LOOP-02" },
      { answer: "i > 7", misconception: "MC-LOOP-04", feedback: "That stops before printing 7." },
      { answer: "i >= 6", misconception: "MC-LOOP-04", feedback: "That prints 6 as well." },
      { answer: "i == 7", misconception: "MC-LOOP-01" },
    ],
    hints: [
      "Is your condition true when i is 10?",
      "When counting down, the condition says \"keep going while i is still big enough\".",
      "It must be true for 7 and false for 6.",
      "Counting down uses `>` or `>=`.",
      "i >= ___",
    ],
    explanation: "Keep going while i >= 7: true for 10, 9, 8, 7 and false at 6.",
  },
  {
    id: "fl-cp-acc", type: "trace", conceptId: "for-loops", difficulty: 3,
    skills: [{ id: "loop_accumulation" }, { id: "loop_tracing", weight: 0.5 }], purposes: ["lesson", "practice", "revision"],
    probes: ["MC-LOOP-05", "MC-LOOP-04"],
    prompt: "Trace the loop. What is `sum` at each point?",
    code: `int sum = 0;
for (int i = 1; i <= 4; i++) {
    sum += i;
}`,
    fields: [
      { label: "after the 1st iteration", answer: "1" },
      { label: "after the 2nd iteration", answer: "3", wrong: [{ answer: "2", misconception: "MC-LOOP-05", feedback: "sum keeps its value between iterations: 1 + 2 = 3." }] },
      { label: "after the 3rd iteration", answer: "6", wrong: [{ answer: "3", misconception: "MC-LOOP-05" }] },
      { label: "after the loop ends", answer: "10", wrong: [{ answer: "6", misconception: "MC-LOOP-04", feedback: "`4 <= 4` is true, so 4 is added too." }, { answer: "4", misconception: "MC-LOOP-05" }] },
    ],
    hints: [
      "What's sum before the loop? What gets added first?",
      "`sum += i` means sum = sum + i — it keeps what it had.",
      "Make a little table: i, then sum after adding i.",
      "i = 1 → sum 1; i = 2 → sum 3 …",
      "Keep adding until i = 4 has been added.",
    ],
    explanation: "sum grows 0 → 1 → 3 → 6 → 10. The last iteration (i = 4) runs because 4 <= 4.",
  },
  {
    id: "fl-cp-acc-b", type: "predict_output", conceptId: "for-loops", difficulty: 3,
    skills: [{ id: "loop_accumulation" }], purposes: ["lesson", "practice", "revision"], probes: ["MC-LOOP-05"],
    prompt: "What does this print?",
    code: `for (int i = 1; i <= 3; i++) {
    int sum = 0;
    sum += i;
    cout << sum << " ";
}`,
    options: [
      { id: "a", text: "1 2 3" },
      { id: "b", text: "1 3 6", misconception: "MC-LOOP-05", feedback: "`int sum = 0;` is inside the loop, so sum starts at 0 again every iteration." },
      { id: "c", text: "6" },
      { id: "d", text: "0 0 0" },
    ],
    correct: "a",
    hints: [
      "Where is sum created?",
      "Anything declared inside the braces is created fresh every iteration.",
      "At the start of each iteration, sum is set to 0 again.",
      "So each iteration prints 0 + i.",
      "Print i for i = 1, 2, 3.",
    ],
    explanation: "sum is re-created as 0 every iteration, so each time it prints just i: 1 2 3.",
  },
  {
    id: "fl-cp-nested", type: "mcq", conceptId: "nested-loops", difficulty: 3,
    skills: [{ id: "nested_intro" }], purposes: ["lesson", "practice", "revision"], probes: ["MC-NEST-01"],
    prompt: "How many times is \"hi\" printed?",
    code: `for (int i = 0; i < 2; i++) {
    for (int j = 0; j < 3; j++) {
        cout << "hi ";
    }
}`,
    options: [
      { id: "a", text: "5", feedback: "Nested loop counts multiply rather than add." },
      { id: "b", text: "6" },
      { id: "c", text: "3", misconception: "MC-NEST-01", feedback: "The inner loop starts over for every outer iteration." },
      { id: "d", text: "2" },
    ],
    correct: "b",
    hints: [
      "How many times does the inner loop run, in total?",
      "For every outer iteration, the inner loop runs completely.",
      "Outer: 2 iterations. Inner: 3 per outer iteration.",
      "Multiply them.",
      "2 × 3",
    ],
    explanation: "The inner loop prints 3 times, once for each of the 2 outer iterations: 6.",
  },
  {
    id: "fl-cp-nested-b", type: "predict_output", conceptId: "nested-loops", difficulty: 3,
    skills: [{ id: "nested_intro" }], purposes: ["lesson", "practice", "revision"], probes: ["MC-NEST-01"],
    prompt: "What does this print?",
    code: `for (int i = 1; i <= 2; i++) {
    for (int j = 1; j <= 3; j++) {
        cout << j;
    }
    cout << " ";
}`,
    options: [
      { id: "a", text: "123 123" },
      { id: "b", text: "123", misconception: "MC-NEST-01", feedback: "The inner loop runs again when i is 2." },
      { id: "c", text: "112233" },
      { id: "d", text: "1 2 3" },
    ],
    correct: "a",
    hints: [
      "What does the inner loop print once?",
      "How many times does the outer loop run?",
      "After each full inner loop, a space is printed.",
      "The inner loop restarts from j = 1 each time.",
      "\"123\" then a space, twice.",
    ],
    explanation: "Each outer iteration runs the inner loop fully (123) and then prints a space: 123 123.",
  },
  // ── Reorder / identify error ──
  {
    id: "fl-reorder-sum", type: "reorder", conceptId: "for-loops", difficulty: 2,
    skills: [{ id: "loop_accumulation" }, { id: "loop_purpose", weight: 0.5 }], purposes: ["lesson", "practice", "revision"], probes: ["MC-LOOP-05"],
    prompt: "Put the lines in order so the program prints the total of 1 to 5 once.",
    lines: [
      "int sum = 0;",
      "for (int i = 1; i <= 5; i++) {",
      "    sum += i;",
      "}",
      "cout << sum;",
    ],
    hints: [
      "Which line has to come before the loop so the total can survive between iterations?",
      "A loop is: header, body, closing brace.",
      "The total should be printed once — inside or outside the loop?",
      "Create sum before the loop; add inside; print after the closing brace.",
      "Order: create total → for header → add → } → print.",
    ],
    explanation: "Create sum once before the loop, add inside the loop body, and print after the loop ends.",
  },
  {
    id: "fl-err-semicolon", type: "identify_error", conceptId: "for-loops", difficulty: 3,
    skills: [{ id: "loop_purpose" }, { id: "loop_tracing", weight: 0.5 }], purposes: ["lesson", "practice", "revision"], probes: ["MC-LOOP-08"],
    prompt: "This prints \"Hello\" only once instead of three times. Why?",
    code: `for (int i = 1; i <= 3; i++); {
    cout << "Hello\\n";
}`,
    options: [
      { id: "a", text: "The `;` after the header ends the loop, so the block runs once afterwards" },
      { id: "b", text: "`\\n` stops the loop early" },
      { id: "c", text: "It should be `++i` instead of `i++`" },
      { id: "d", text: "The condition should be `i < 3`", misconception: "MC-LOOP-04" },
    ],
    correct: "a",
    hints: [
      "Look very closely at the end of the first line.",
      "What counts as the body of a for loop?",
      "A single `;` is a complete (empty) statement.",
      "`for (…);` loops over an empty statement; the `{ }` block is separate.",
      "Remove one character from line 1.",
    ],
    explanation: "The `;` right after `for (…)` is an empty loop body. The braces below aren't part of the loop and run once.",
  },
  {
    id: "fl-err-assign", type: "identify_error", conceptId: "for-loops", difficulty: 3,
    skills: [{ id: "loop_accumulation" }], purposes: ["practice", "revision"], probes: ["MC-LOOP-05"],
    prompt: "This should print 10 (1 + 2 + 3 + 4) but prints 4. Which line is wrong?",
    code: `int total = 0;
for (int i = 1; i <= 4; i++) {
    total = i;
}
cout << total;`,
    options: [
      { id: "a", text: "Line 1: total should start at 1" },
      { id: "b", text: "Line 2: the condition should be i < 4", misconception: "MC-LOOP-04" },
      { id: "c", text: "Line 3: `total = i` replaces the total; it should add: `total += i`" },
      { id: "d", text: "Line 5: the cout should be inside the loop" },
    ],
    correct: "c",
    hints: [
      "After each iteration, what does total hold?",
      "Is the total being added to, or replaced?",
      "Trace line 3 for i = 1, 2, 3, 4.",
      "`=` throws away the old value; `+=` keeps it and adds.",
      "Change how line 3 updates total.",
    ],
    explanation: "`total = i` overwrites total each time, leaving the last i (4). `total += i` accumulates.",
  },
  // ── Predict output practice (difficulty ladder) ──
  {
    id: "fl-po-1", type: "predict_output", conceptId: "for-loops", difficulty: 1,
    skills: [{ id: "loop_boundaries" }, { id: "loop_tracing", weight: 0.5 }], purposes: ["practice", "assessment", "revision"], probes: ["MC-LOOP-04"],
    prompt: "What does this print?",
    code: `for (int i = 1; i <= 3; i++) {
    cout << i;
}`,
    options: [
      { id: "a", text: "123" },
      { id: "b", text: "12", misconception: "MC-LOOP-04", feedback: "`3 <= 3` is true, so 3 prints too." },
      { id: "c", text: "1234", misconception: "MC-LOOP-04" },
      { id: "d", text: "0123", misconception: "MC-LOOP-04" },
    ],
    correct: "a",
    hints: [
      "Where does i start?",
      "What's the last value that passes `i <= 3`?",
      "List the values of i.",
      "1, 2, 3 — and nothing between them.",
      "Write them next to each other.",
    ],
    explanation: "i takes 1, 2, 3 and they are printed with nothing in between: 123.",
  },
  {
    id: "fl-po-2", type: "predict_output", conceptId: "for-loops", difficulty: 2,
    skills: [{ id: "loop_update" }, { id: "loop_boundaries" }], purposes: ["practice", "assessment", "revision"], probes: ["MC-LOOP-04", "MC-REL-02"],
    prompt: "What does this print?",
    code: `for (int i = 2; i < 8; i += 2) {
    cout << i << " ";
}`,
    options: [
      { id: "a", text: "2 4 6" },
      { id: "b", text: "2 4 6 8", misconception: "MC-REL-02", feedback: "`8 < 8` is false, so 8 isn't printed." },
      { id: "c", text: "4 6 8", misconception: "MC-LOOP-09" },
      { id: "d", text: "2 3 4 5 6 7" },
    ],
    correct: "a",
    hints: [
      "What does `i += 2` do?",
      "List i: 2, then add 2 …",
      "Does 8 pass `i < 8`?",
      "`<` excludes the end value.",
      "2, 4, 6 — stop at 8.",
    ],
    explanation: "i goes 2, 4, 6; at 8 the condition `8 < 8` is false.",
  },
  {
    id: "fl-po-3", type: "predict_output", conceptId: "for-loops", difficulty: 3,
    skills: [{ id: "loop_counting_down" }, { id: "loop_update" }], purposes: ["practice", "assessment", "revision"], probes: ["MC-LOOP-04", "MC-LOOP-09"],
    prompt: "What does this print?",
    code: `for (int i = 10; i > 0; i -= 3) {
    cout << i << " ";
}`,
    options: [
      { id: "a", text: "10 7 4 1" },
      { id: "b", text: "10 7 4", misconception: "MC-LOOP-04", feedback: "1 > 0 is true, so 1 is printed." },
      { id: "c", text: "7 4 1", misconception: "MC-LOOP-09" },
      { id: "d", text: "10 7 4 1 -2", misconception: "MC-LOOP-04", feedback: "−2 > 0 is false, so the loop stops before printing it." },
    ],
    correct: "a",
    hints: [
      "Start at 10 and subtract 3 each time.",
      "Check `i > 0` before each print.",
      "List: 10, 7, 4, 1, …",
      "After 1 comes −2. Is −2 > 0?",
      "Print every value that passed.",
    ],
    explanation: "i goes 10, 7, 4, 1. Next is −2, and −2 > 0 is false, so it stops.",
  },
  {
    id: "fl-po-4", type: "predict_output", conceptId: "for-loops", difficulty: 3,
    skills: [{ id: "loop_boundaries" }, { id: "loop_condition", weight: 0.5 }], purposes: ["practice", "assessment", "revision"], probes: ["MC-LOOP-04"],
    prompt: "What does this print?",
    code: `int i;
for (i = 0; i < 4; i++) {
}
cout << i;`,
    options: [
      { id: "a", text: "3", misconception: "MC-LOOP-04", feedback: "3 is the last value inside the loop, but i++ runs once more to make the condition false." },
      { id: "b", text: "4" },
      { id: "c", text: "5" },
      { id: "d", text: "0", misconception: "MC-LOOP-06" },
    ],
    correct: "b",
    hints: [
      "What makes the loop stop?",
      "The loop stops when `i < 4` is false.",
      "What's the first value of i that makes it false?",
      "After the iteration with i = 3, i++ runs, then the check fails.",
      "i is printed after the loop ends.",
    ],
    explanation: "The loop ends when `i < 4` becomes false, which first happens when i is 4 — so 4 is printed.",
  },
  {
    id: "fl-po-5", type: "predict_output", conceptId: "for-loops", difficulty: 4,
    skills: [{ id: "loop_accumulation" }, { id: "loop_boundaries", weight: 0.5 }], purposes: ["practice", "assessment", "revision"], probes: ["MC-LOOP-04"],
    prompt: "What does this print?",
    code: `int count = 0;
for (int i = 1; i <= 20; i++) {
    if (i % 5 == 0) count++;
}
cout << count;`,
    options: [
      { id: "a", text: "4" },
      { id: "b", text: "3", misconception: "MC-LOOP-04", feedback: "20 is included (20 <= 20), and 20 % 5 is 0." },
      { id: "c", text: "5" },
      { id: "d", text: "20" },
    ],
    correct: "a",
    hints: [
      "Which values of i make `i % 5 == 0` true?",
      "count goes up only for multiples of 5.",
      "Multiples of 5 between 1 and 20 — is 20 included?",
      "5, 10, 15, 20.",
      "Count them.",
    ],
    explanation: "The multiples of 5 from 1 to 20 are 5, 10, 15, 20 — four of them.",
  },
  {
    id: "fl-po-6", type: "predict_output", conceptId: "for-loops", difficulty: 2,
    skills: [{ id: "loop_condition" }], purposes: ["practice", "assessment", "revision"], probes: ["MC-LOOP-06"],
    prompt: "What does this print?",
    code: `for (int i = 5; i < 5; i++) {
    cout << "x";
}
cout << "done";`,
    options: [
      { id: "a", text: "done" },
      { id: "b", text: "xdone", misconception: "MC-LOOP-06", feedback: "The condition is checked before the first iteration: 5 < 5 is false." },
      { id: "c", text: "xxxxxdone" },
      { id: "d", text: "Nothing" },
    ],
    correct: "a",
    hints: [
      "Is the condition true at the start?",
      "A for loop checks its condition before the first iteration.",
      "Is 5 < 5?",
      "If the first check fails, the body runs zero times.",
      "Only the line after the loop prints.",
    ],
    explanation: "`5 < 5` is false before the first iteration, so the body never runs; only \"done\" is printed.",
  },
  {
    id: "fl-trace-mult", type: "trace", conceptId: "for-loops", difficulty: 4,
    skills: [{ id: "loop_tracing" }, { id: "loop_update" }], purposes: ["practice", "assessment", "revision"], probes: ["MC-LOOP-04", "MC-LOOP-09"],
    prompt: "Trace this loop.",
    code: `for (int i = 1; i < 20; i *= 3) {
    cout << i << " ";
}`,
    fields: [
      { label: "1st value printed", answer: "1", wrong: [{ answer: "3", misconception: "MC-LOOP-09" }] },
      { label: "2nd value printed", answer: "3" },
      { label: "3rd value printed", answer: "9" },
      { label: "how many values are printed in total", answer: "3", wrong: [{ answer: "4", misconception: "MC-LOOP-04", feedback: "After 9 comes 27, and 27 < 20 is false." }] },
    ],
    hints: [
      "What does `i *= 3` do to i?",
      "i is multiplied by 3 after each iteration.",
      "List: 1, 3, 9, …",
      "Check each value against `i < 20` before printing.",
      "27 doesn't pass the check.",
    ],
    explanation: "i goes 1, 3, 9, then 27 — which fails `i < 20`. Three values are printed.",
  },
  // ── Explain it back ──
  {
    id: "fl-explain-boundary", type: "explain", conceptId: "for-loops", difficulty: 3,
    skills: [{ id: "loop_boundaries" }, { id: "loop_condition", weight: 0.5 }], purposes: ["lesson"],
    prompt: "Imagine your friend doesn't understand why `i < n` and `i <= n` behave differently. How would you explain it to them?",
    rubric: {
      keyIdeas: [
        { id: "equal", label: "<= also allows i to be equal to n", patterns: ["equal", "includes? n", "including n", "n itself", "same as n", "==", "also n", "and n", "reaches n", "up to n"] },
        { id: "last", label: "So the last value / number of iterations differs by one", patterns: ["last", "n ?- ?1", "one (less|fewer|more|extra)", "1 (less|fewer|more|extra)", "extra (time|iteration|one)", "stops? (before|at)", "before n", "one (more|less) time"] },
        { id: "continue", label: "The condition is checked each time and the loop continues while it's true", patterns: ["while", "true", "keeps? going", "continue", "check", "false"] },
      ],
      misconceptionPatterns: [
        { pattern: "(no|not any|isn't a|is no) difference|same thing|they are the same", misconception: "MC-REL-02" },
        { pattern: "stops? when (it'?s|the condition is) true", misconception: "MC-LOOP-01" },
      ],
      required: 2,
    },
    hints: [
      "Think about what happens when i is exactly equal to n.",
      "Compare the last value each loop prints.",
      "Try n = 3: list what each version prints.",
      "`i < 3` stops before 3; `i <= 3` includes 3.",
      "Mention the equal case and the effect on the last iteration.",
    ],
    explanation: "`i <= n` is also true when i equals n, so it runs one extra iteration (the last value is n instead of n − 1).",
  },
  // ── Judged coding tasks ──
  {
    id: "fl-code-count-up", type: "write_code", conceptId: "for-loops", difficulty: 1,
    skills: [{ id: "loop_init" }, { id: "loop_condition" }, { id: "loop_update" }, { id: "loop_boundaries" }],
    purposes: ["lesson", "practice", "revision"], probes: ["MC-LOOP-01", "MC-LOOP-02", "MC-LOOP-03", "MC-LOOP-04"],
    prompt: "Read a number `n`. Print the numbers from 1 to n, each on its own line.",
    starterCode: STARTER("Print 1, 2, ..., n - one number per line"),
    tests: [
      { label: "n = 5", input: "5\n", output: "1\n2\n3\n4\n5", visibility: "sample", category: "normal" },
      { label: "n = 1", input: "1\n", output: "1", visibility: "visible", category: "boundary" },
      { label: "n = 10", input: "10\n", output: "1\n2\n3\n4\n5\n6\n7\n8\n9\n10", visibility: "hidden", category: "normal" },
      { label: "n = 3", input: "3\n", output: "1\n2\n3", visibility: "hidden", category: "normal" },
      { label: "n = 0 (nothing to print)", input: "0\n", output: "", visibility: "hidden", category: "edge" },
    ],
    compare: "tokens",
    referenceSolution: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++) {
        cout << i << "\\n";
    }
    return 0;
}`,
    solutionWalkthrough: "Start i at 1, keep going while `i <= n` (so n itself is included), and add 1 each time. Print i and a new line inside the loop.",
    detectors: [{ kind: "sequence" }, { kind: "for_header", direction: "up" }],
    hints: [
      "Which number should be printed first, and which last? Say it as \"keep going while …\".",
      "This is a counting loop: a for loop with a start, a keep-going condition and an update.",
      "Your loop goes where the comment is: one `for` header, with one `cout` inside it.",
      "To include n itself, the condition must still be true when i equals n — that's `<=`, not `<`.",
      "for (int i = 1; i <= ___; i++) {\n    cout << ___ << \"\\n\";\n}",
    ],
    explanation: "Start at 1, keep going while i <= n, add 1 each time, and print i on its own line.",
  },
  {
    id: "fl-code-count-down", type: "write_code", conceptId: "for-loops", difficulty: 2,
    skills: [{ id: "loop_counting_down" }, { id: "loop_boundaries" }, { id: "loop_update", weight: 0.5 }],
    purposes: ["practice", "assessment", "revision"], probes: ["MC-LOOP-02", "MC-LOOP-03", "MC-LOOP-04"],
    prompt: "Read a number `n`. Print the numbers from n down to 1 on one line, separated by spaces.",
    starterCode: STARTER("Print n, n-1, ..., 1 separated by spaces"),
    tests: [
      { label: "n = 5", input: "5\n", output: "5 4 3 2 1", visibility: "sample", category: "normal" },
      { label: "n = 1", input: "1\n", output: "1", visibility: "visible", category: "boundary" },
      { label: "n = 7", input: "7\n", output: "7 6 5 4 3 2 1", visibility: "hidden", category: "normal" },
      { label: "n = 2", input: "2\n", output: "2 1", visibility: "hidden", category: "boundary" },
      { label: "n = 0 (nothing to print)", input: "0\n", output: "", visibility: "hidden", category: "edge" },
    ],
    compare: "tokens",
    referenceSolution: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    for (int i = n; i >= 1; i--) {
        cout << i << " ";
    }
    return 0;
}`,
    solutionWalkthrough: "Start i at n, keep going while `i >= 1`, and subtract 1 each time with i--.",
    detectors: [{ kind: "sequence" }, { kind: "for_header", direction: "down" }],
    hints: [
      "Where does the counter start this time, and which way does it move?",
      "Counting down needs a different start, condition and update than counting up.",
      "All three parts of the for header change compared with counting up.",
      "The condition must be true while i is still at least 1 — that's `i >= 1`.",
      "for (int i = ___; i >= 1; i--) {\n    cout << i << \" \";\n}",
    ],
    explanation: "Start at n, keep going while i >= 1, decrease by 1 each time.",
  },
  {
    id: "fl-code-sum", type: "write_code", conceptId: "for-loops", difficulty: 2,
    skills: [{ id: "loop_accumulation" }, { id: "loop_boundaries", weight: 0.5 }],
    purposes: ["lesson", "practice", "revision"], probes: ["MC-LOOP-04", "MC-LOOP-05"],
    prompt: "Read a number `n`. Print the sum 1 + 2 + … + n.",
    starterCode: STARTER("Print 1 + 2 + ... + n"),
    tests: [
      { label: "n = 5", input: "5\n", output: "15", visibility: "sample", category: "normal" },
      { label: "n = 1", input: "1\n", output: "1", visibility: "visible", category: "boundary" },
      { label: "n = 10", input: "10\n", output: "55", visibility: "hidden", category: "normal" },
      { label: "n = 100", input: "100\n", output: "5050", visibility: "hidden", category: "normal" },
      { label: "n = 0", input: "0\n", output: "0", visibility: "hidden", category: "edge" },
    ],
    compare: "tokens",
    referenceSolution: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int sum = 0;
    for (int i = 1; i <= n; i++) {
        sum += i;
    }
    cout << sum;
    return 0;
}`,
    solutionWalkthrough: "Create `sum = 0` once before the loop. Loop i from 1 while i <= n and add i to sum. Print sum once, after the loop.",
    detectors: [{ kind: "accumulator", lastTermOf: "n" }, { kind: "for_header", direction: "up" }],
    hints: [
      "Where will you keep the running total, and what should it start at?",
      "You need a loop that visits 1, 2, …, n plus a variable that collects them.",
      "Create the total before the loop, add inside it, print after it.",
      "If the total is declared inside the loop it starts over every time. And `<=` includes n.",
      "int sum = 0;\nfor (int i = 1; i <= n; i++) {\n    sum += ___;\n}\ncout << sum;",
    ],
    explanation: "Keep a running total that starts at 0 before the loop; add each i from 1 to n; print once at the end.",
  },
  {
    id: "fl-code-evens", type: "write_code", conceptId: "for-loops", difficulty: 3,
    skills: [{ id: "loop_update" }, { id: "loop_boundaries" }],
    purposes: ["practice", "assessment", "revision"], probes: ["MC-LOOP-04"],
    prompt: "Read a number `n`. Print all even numbers from 2 up to n (including n if it's even), separated by spaces.",
    starterCode: STARTER("Print 2, 4, 6, ... up to n"),
    tests: [
      { label: "n = 10", input: "10\n", output: "2 4 6 8 10", visibility: "sample", category: "normal" },
      { label: "n = 7 (odd)", input: "7\n", output: "2 4 6", visibility: "visible", category: "boundary" },
      { label: "n = 2", input: "2\n", output: "2", visibility: "hidden", category: "boundary" },
      { label: "n = 1 (none)", input: "1\n", output: "", visibility: "hidden", category: "edge" },
      { label: "n = 15", input: "15\n", output: "2 4 6 8 10 12 14", visibility: "hidden", category: "normal" },
    ],
    compare: "tokens",
    referenceSolution: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    for (int i = 2; i <= n; i += 2) {
        cout << i << " ";
    }
    return 0;
}`,
    solutionWalkthrough: "Start at 2 and add 2 each time (`i += 2`), keeping going while i <= n. (Checking `i % 2 == 0` inside a 1..n loop also works.)",
    detectors: [{ kind: "sequence" }, { kind: "for_header", direction: "up" }],
    hints: [
      "What's the first even number, and how far apart are even numbers?",
      "The update doesn't have to be i++.",
      "Change the start and the update of a normal counting loop.",
      "If n is even it must be included — think about `<` vs `<=`.",
      "for (int i = 2; i <= n; i += ___) { … }",
    ],
    explanation: "Start at 2, step by 2, keep going while i <= n.",
  },
  {
    id: "fl-code-debug-stop", type: "write_code", conceptId: "for-loops", difficulty: 2,
    skills: [{ id: "loop_condition" }, { id: "loop_boundaries", weight: 0.5 }],
    purposes: ["lesson", "practice", "revision"], probes: ["MC-LOOP-01", "MC-LOOP-02"],
    prompt: "Debug this: it should print the numbers 1 to n on one line, but it prints nothing. Find and fix the bug.",
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    for (int i = 1; i > n; i++) {
        cout << i << " ";
    }
    return 0;
}`,
    tests: [
      { label: "n = 5", input: "5\n", output: "1 2 3 4 5", visibility: "sample", category: "normal" },
      { label: "n = 1", input: "1\n", output: "1", visibility: "visible", category: "boundary" },
      { label: "n = 8", input: "8\n", output: "1 2 3 4 5 6 7 8", visibility: "hidden", category: "normal" },
      { label: "n = 2", input: "2\n", output: "1 2", visibility: "hidden", category: "boundary" },
    ],
    compare: "tokens",
    referenceSolution: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++) {
        cout << i << " ";
    }
    return 0;
}`,
    solutionWalkthrough: "The condition `i > n` is false at the start (1 > 5 is false), so the body never runs. The loop should keep going while `i <= n`.",
    detectors: [{ kind: "sequence" }, { kind: "for_header", direction: "up" }],
    hints: [
      "With n = 5, is the condition true before the first iteration?",
      "The middle part of the header is a \"keep going while…\" rule.",
      "The bug is in the loop header, in the condition.",
      "`1 > 5` is false, so the loop ends before it starts. Which comparison is true for 1, 2, …, n?",
      "for (int i = 1; i ___ n; i++)",
    ],
    explanation: "The condition must be true while i is still in range: `i <= n`.",
  },
  {
    id: "fl-code-debug-offby1", type: "write_code", conceptId: "for-loops", difficulty: 3,
    skills: [{ id: "loop_boundaries" }, { id: "loop_accumulation", weight: 0.5 }],
    purposes: ["practice", "assessment", "revision"], probes: ["MC-LOOP-04"],
    prompt: "Debug this: it should print 1 + 2 + … + n, but the answer is too small. Find and fix the bug.",
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int sum = 0;
    for (int i = 1; i < n; i++) {
        sum += i;
    }
    cout << sum;
    return 0;
}`,
    tests: [
      { label: "n = 4", input: "4\n", output: "10", visibility: "sample", category: "normal" },
      { label: "n = 1", input: "1\n", output: "1", visibility: "visible", category: "boundary" },
      { label: "n = 10", input: "10\n", output: "55", visibility: "hidden", category: "normal" },
      { label: "n = 6", input: "6\n", output: "21", visibility: "hidden", category: "normal" },
    ],
    compare: "tokens",
    referenceSolution: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int sum = 0;
    for (int i = 1; i <= n; i++) {
        sum += i;
    }
    cout << sum;
    return 0;
}`,
    solutionWalkthrough: "With `i < n` the last value, n, is never added. `i <= n` includes it.",
    detectors: [{ kind: "accumulator", lastTermOf: "n" }, { kind: "for_header", direction: "up" }],
    hints: [
      "For n = 4 the program prints 6. Which number is missing from 1 + 2 + 3 + 4?",
      "This is a boundary problem: check the last value of i.",
      "Look at the condition in the loop header.",
      "When i equals n, `i < n` is false — so n is never added.",
      "for (int i = 1; i ___ n; i++)",
    ],
    explanation: "`i < n` stops before n. Use `i <= n` so the last term is added.",
  },
  {
    id: "fl-code-multiples", type: "write_code", conceptId: "for-loops", difficulty: 3,
    skills: [{ id: "loop_accumulation" }, { id: "loop_boundaries", weight: 0.5 }],
    purposes: ["practice", "assessment", "revision"], probes: ["MC-LOOP-04", "MC-LOOP-05"],
    prompt: "Read a number `n`. Print how many numbers from 1 to n are divisible by 3.",
    starterCode: STARTER("Count the numbers from 1 to n divisible by 3"),
    tests: [
      { label: "n = 10", input: "10\n", output: "3", visibility: "sample", category: "normal" },
      { label: "n = 3", input: "3\n", output: "1", visibility: "visible", category: "boundary" },
      { label: "n = 2", input: "2\n", output: "0", visibility: "hidden", category: "edge" },
      { label: "n = 30", input: "30\n", output: "10", visibility: "hidden", category: "boundary" },
      { label: "n = 1", input: "1\n", output: "0", visibility: "hidden", category: "edge" },
    ],
    compare: "tokens",
    referenceSolution: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int count = 0;
    for (int i = 1; i <= n; i++) {
        if (i % 3 == 0) {
            count++;
        }
    }
    cout << count;
    return 0;
}`,
    solutionWalkthrough: "Loop i from 1 to n; when `i % 3 == 0`, add 1 to a counter created before the loop. Print the counter after the loop.",
    detectors: [{ kind: "for_header", direction: "up" }],
    hints: [
      "How do you check whether a number is divisible by 3?",
      "This is counting: a counter plus a loop plus an if.",
      "Inside the loop, an if decides whether to add 1 to the counter.",
      "`i % 3 == 0` is true for multiples of 3. Make sure n itself is checked.",
      "int count = 0;\nfor (int i = 1; i <= n; i++) {\n    if (___) count++;\n}\ncout << count;",
    ],
    explanation: "Count the values i in 1..n where i % 3 == 0.",
  },
  {
    id: "fl-code-table", type: "write_code", conceptId: "for-loops", difficulty: 3,
    skills: [{ id: "loop_tracing" }, { id: "loop_boundaries", weight: 0.5 }],
    purposes: ["practice", "assessment", "revision"], probes: ["MC-LOOP-04"],
    prompt: "Read a number `n`. Print its multiplication table from 1 to 10, one line each, exactly like `3 x 1 = 3`.",
    starterCode: STARTER("Print n x 1 = ..., up to n x 10 = ..."),
    tests: [
      { label: "n = 3", input: "3\n", output: "3 x 1 = 3\n3 x 2 = 6\n3 x 3 = 9\n3 x 4 = 12\n3 x 5 = 15\n3 x 6 = 18\n3 x 7 = 21\n3 x 8 = 24\n3 x 9 = 27\n3 x 10 = 30", visibility: "sample", category: "normal" },
      { label: "n = 7", input: "7\n", output: "7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35\n7 x 6 = 42\n7 x 7 = 49\n7 x 8 = 56\n7 x 9 = 63\n7 x 10 = 70", visibility: "hidden", category: "normal" },
      { label: "n = 1", input: "1\n", output: "1 x 1 = 1\n1 x 2 = 2\n1 x 3 = 3\n1 x 4 = 4\n1 x 5 = 5\n1 x 6 = 6\n1 x 7 = 7\n1 x 8 = 8\n1 x 9 = 9\n1 x 10 = 10", visibility: "hidden", category: "boundary" },
    ],
    compare: "lines",
    referenceSolution: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    for (int i = 1; i <= 10; i++) {
        cout << n << " x " << i << " = " << n * i << "\\n";
    }
    return 0;
}`,
    solutionWalkthrough: "Loop i from 1 to 10 and print n, \" x \", i, \" = \", n * i and a new line.",
    detectors: [{ kind: "for_header", direction: "up" }],
    hints: [
      "What changes from one line of the table to the next?",
      "The loop counter is the number n is multiplied by.",
      "Each line is built from five pieces sent to cout.",
      "Spaces must be sent explicitly, and 10 must be included.",
      "cout << n << \" x \" << i << \" = \" << ___ << \"\\n\";",
    ],
    explanation: "i runs from 1 to 10; each line prints n x i = n*i.",
  },
  {
    id: "fl-code-read-sum", type: "write_code", conceptId: "for-loops", difficulty: 3,
    skills: [{ id: "loop_accumulation" }, { id: "loop_purpose", weight: 0.5 }],
    purposes: ["practice", "assessment", "revision"], probes: ["MC-LOOP-05"],
    prompt: "The first number is `n`. Then n more whole numbers follow. Print their total.",
    starterCode: STARTER("Read n more numbers and print their total"),
    tests: [
      { label: "4 numbers", input: "4\n3 5 -2 10\n", output: "16", visibility: "sample", category: "normal" },
      { label: "1 number", input: "1\n7\n", output: "7", visibility: "visible", category: "boundary" },
      { label: "five ones", input: "5\n1 1 1 1 1\n", output: "5", visibility: "hidden", category: "normal" },
      { label: "negatives", input: "3\n-5 -5 5\n", output: "-5", visibility: "hidden", category: "normal" },
      { label: "no numbers", input: "0\n", output: "0", visibility: "hidden", category: "edge" },
    ],
    compare: "tokens",
    referenceSolution: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int total = 0;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        total += x;
    }
    cout << total;
    return 0;
}`,
    solutionWalkthrough: "Loop n times. In each iteration read one number with cin and add it to a total created before the loop.",
    detectors: [{ kind: "for_header", direction: "up" }],
    hints: [
      "How many times do you need to read a number?",
      "A loop can contain a cin, so each iteration reads the next number.",
      "Inside the loop: read into a variable, then add it to the total.",
      "The total lives outside the loop; the number you read can live inside.",
      "int total = 0;\nfor (int i = 0; i < n; i++) {\n    int x;\n    cin >> x;\n    total += ___;\n}",
    ],
    explanation: "Repeat n times: read a number and add it to a total that started at 0 before the loop.",
  },
  {
    id: "fl-code-factorial", type: "write_code", conceptId: "for-loops", difficulty: 5,
    skills: [{ id: "loop_accumulation" }, { id: "loop_boundaries", weight: 0.5 }],
    purposes: ["practice", "assessment"], probes: ["MC-LOOP-04"],
    prompt: "Challenge: read `n` (0 ≤ n ≤ 20) and print n! = 1 × 2 × … × n. Remember that 0! is 1. Careful — the answers get very big.",
    starterCode: STARTER("Print n! (n factorial)"),
    tests: [
      { label: "n = 5", input: "5\n", output: "120", visibility: "sample", category: "normal" },
      { label: "n = 0", input: "0\n", output: "1", visibility: "visible", category: "edge" },
      { label: "n = 1", input: "1\n", output: "1", visibility: "hidden", category: "boundary" },
      { label: "n = 10", input: "10\n", output: "3628800", visibility: "hidden", category: "normal" },
      { label: "n = 20 (big number)", input: "20\n", output: "2432902008176640000", visibility: "hidden", category: "edge" },
    ],
    compare: "tokens",
    referenceSolution: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    long long product = 1;
    for (int i = 1; i <= n; i++) {
        product *= i;
    }
    cout << product;
    return 0;
}`,
    solutionWalkthrough: "Start a product at 1 (not 0!) and multiply by every i from 1 to n. 20! doesn't fit in an int, so use `long long`.",
    detectors: [{ kind: "for_header", direction: "up" }],
    hints: [
      "What should a running product start at? What happens if it starts at 0?",
      "Like a sum, but multiplying — and the numbers grow fast.",
      "Check the variable's type: can an int hold 2432902008176640000?",
      "Start at 1 so 0! works, include n with `<=`, and use `long long`.",
      "long long product = 1;\nfor (int i = 1; i <= n; i++) {\n    product *= ___;\n}",
    ],
    explanation: "Multiply 1 × 2 × … × n into a long long that starts at 1.",
  },
  {
    id: "fl-code-square", type: "write_code", conceptId: "nested-loops", difficulty: 4,
    skills: [{ id: "nested_patterns" }, { id: "nested_intro" }],
    purposes: ["practice", "assessment"], probes: ["MC-NEST-01"],
    prompt: "Read `n`. Print an n × n square of `*` characters: n lines, each with n stars.",
    starterCode: STARTER("Print n lines of n stars"),
    tests: [
      { label: "n = 3", input: "3\n", output: "***\n***\n***", visibility: "sample", category: "normal" },
      { label: "n = 1", input: "1\n", output: "*", visibility: "visible", category: "boundary" },
      { label: "n = 4", input: "4\n", output: "****\n****\n****\n****", visibility: "hidden", category: "normal" },
      { label: "n = 2", input: "2\n", output: "**\n**", visibility: "hidden", category: "boundary" },
    ],
    compare: "lines",
    referenceSolution: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    for (int row = 1; row <= n; row++) {
        for (int col = 1; col <= n; col++) {
            cout << "*";
        }
        cout << "\\n";
    }
    return 0;
}`,
    solutionWalkthrough: "The outer loop counts rows; for each row the inner loop prints n stars, then a new line ends the row.",
    detectors: [],
    hints: [
      "What repeats inside one line, and what repeats line after line?",
      "One loop for rows, another loop inside it for the stars in a row.",
      "The new line belongs after the inner loop, but inside the outer one.",
      "The inner loop must start over for every row.",
      "for (int row = 1; row <= n; row++) {\n    for (int col = 1; col <= n; col++) cout << \"*\";\n    cout << ___;\n}",
    ],
    explanation: "Outer loop: n rows. Inner loop: n stars per row. A newline after each row.",
  },
];
