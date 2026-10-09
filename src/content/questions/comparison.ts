import type { QuestionDef } from "../types";

/** Comparison operators — used by the prerequisite remediation lesson for loops. */
export const COMPARISON_QUESTIONS: QuestionDef[] = [
  {
    id: "cmp-true", type: "mcq", conceptId: "comparison-ops", difficulty: 1,
    skills: [{ id: "relational_ops" }], purposes: ["lesson", "practice", "revision"], probes: ["MC-REL-02"],
    prompt: "Which of these is true?",
    options: [
      { id: "a", text: "5 < 5", misconception: "MC-REL-02", feedback: "5 isn't smaller than itself." },
      { id: "b", text: "5 <= 5" },
      { id: "c", text: "5 > 5" },
      { id: "d", text: "5 != 5" },
    ],
    correct: "b",
    hints: [
      "Two of the same number — which comparisons allow \"equal\"?",
      "`<` and `>` are strict; `<=` and `>=` include equality.",
      "Read each one aloud: \"5 is less than or equal to 5\"…",
      "Only an operator with \"or equal\" is true when both sides are the same.",
      "Pick the one with `=` as part of a less/greater comparison.",
    ],
    explanation: "`5 <= 5` is true because the two sides are equal and `<=` allows equality. The others are false.",
  },
  {
    id: "cmp-print", type: "predict_output", conceptId: "comparison-ops", difficulty: 1,
    skills: [{ id: "relational_ops" }], purposes: ["lesson", "practice", "revision"], probes: ["MC-REL-02"],
    prompt: "What does this print? (true prints as 1, false as 0.)",
    code: `int a = 3;
cout << (a < 3) << (a <= 3);`,
    options: [
      { id: "a", text: "01" },
      { id: "b", text: "11", misconception: "MC-REL-02", feedback: "`3 < 3` is false." },
      { id: "c", text: "00" },
      { id: "d", text: "10" },
    ],
    correct: "a",
    hints: [
      "Work out each comparison on its own.",
      "a is 3. Is 3 less than 3?",
      "Is 3 less than or equal to 3?",
      "false prints as 0, true as 1.",
      "First 0 or 1, then the second.",
    ],
    explanation: "`3 < 3` is false (0); `3 <= 3` is true (1). So it prints 01.",
  },
  {
    id: "cmp-false", type: "mcq", conceptId: "comparison-ops", difficulty: 2,
    skills: [{ id: "relational_ops" }], purposes: ["lesson", "practice", "revision"], probes: ["MC-REL-02"],
    prompt: "x is 8. Which condition is **false**?",
    options: [
      { id: "a", text: "x > 7" },
      { id: "b", text: "x >= 8", misconception: "MC-REL-02", feedback: "8 >= 8 is true — equality counts." },
      { id: "c", text: "x < 8" },
      { id: "d", text: "x != 7" },
    ],
    correct: "c",
    hints: [
      "Replace x with 8 in each one.",
      "Watch the edge: what happens when both sides are 8?",
      "`8 < 8` — is that true?",
      "Strict comparisons are false when the two sides are equal.",
      "Find the strict comparison with 8 on both sides.",
    ],
    explanation: "`8 < 8` is false. 8 > 7, 8 >= 8 and 8 != 7 are all true.",
  },
  {
    id: "cmp-assign", type: "identify_error", conceptId: "comparison-ops", difficulty: 2,
    skills: [{ id: "relational_ops" }], purposes: ["lesson", "practice", "revision"], probes: ["MC-REL-01"],
    prompt: "This prints \"Perfect\" for every score. Why?",
    code: `int score;
cin >> score;
if (score = 100) {
    cout << "Perfect";
}`,
    options: [
      { id: "a", text: "`score = 100` stores 100 (which counts as true); it should be `score == 100`" },
      { id: "b", text: "cin can't read a number into score" },
      { id: "c", text: "The braces around cout aren't allowed" },
      { id: "d", text: "It's correct — it only prints for 100", misconception: "MC-REL-01", feedback: "A single = assigns. The condition is always true." },
    ],
    correct: "a",
    hints: [
      "What does a single `=` do?",
      "There's a difference between storing and comparing.",
      "Look at line 3.",
      "`=` assigns; `==` asks a question.",
      "Swap the operator in the condition.",
    ],
    explanation: "`score = 100` assigns 100 to score and counts as true. Comparing uses `==`.",
  },
  {
    id: "cmp-and", type: "mcq", conceptId: "comparison-ops", difficulty: 2,
    skills: [{ id: "logical_ops" }], purposes: ["lesson", "practice", "revision"], probes: ["MC-REL-02"],
    prompt: "x is 10. What is `x > 0 && x < 10`?",
    options: [
      { id: "a", text: "true", misconception: "MC-REL-02", feedback: "`10 < 10` is false, so the && is false." },
      { id: "b", text: "false" },
      { id: "c", text: "It causes an error" },
      { id: "d", text: "10" },
    ],
    correct: "b",
    hints: [
      "Evaluate both sides of && separately.",
      "&& is only true if both sides are true.",
      "Is 10 > 0? Is 10 < 10?",
      "One false side makes the whole && false.",
      "true && false = ?",
    ],
    explanation: "10 > 0 is true but 10 < 10 is false, so the whole && is false.",
  },
  {
    id: "cmp-teen", type: "complete_code", conceptId: "comparison-ops", difficulty: 3,
    skills: [{ id: "relational_ops" }, { id: "logical_ops", weight: 0.5 }], purposes: ["lesson", "practice", "revision"], probes: ["MC-REL-02"],
    prompt: "Fill in the blank so the message prints for every age from 13 up to and including 19.",
    code: `if (age >= 13 && ____) {
    cout << "teen";
}`,
    accepted: ["age <= 19", "age < 20", "19 >= age", "20 > age"],
    wrongAnswers: [
      { answer: "age < 19", misconception: "MC-REL-02", feedback: "19 would be left out: `19 < 19` is false." },
      { answer: "age <= 20", feedback: "That includes 20 as well." },
      { answer: "age > 19", feedback: "That's the opposite range." },
    ],
    hints: [
      "Which is the largest age that should be included?",
      "The blank is the upper limit.",
      "It must be true for 19 and false for 20.",
      "`<=` includes the limit itself.",
      "age <= ___",
    ],
    explanation: "Include 19 with `age <= 19` (or exclude 20 with `age < 20`).",
  },
];
