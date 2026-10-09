import type { LessonDef } from "../types";

/**
 * Short prerequisite lesson. The learning engine sends a student here when loop work is being held
 * back by comparison-operator gaps (e.g. repeated < vs <= mistakes) instead of piling on more loops.
 */
export const COMPARISON_LESSON: LessonDef = {
  id: "comparison-ops-review",
  conceptId: "comparison-ops",
  kind: "remediation",
  title: "Comparisons: the edge decides",
  estimatedMinutes: 10,
  steps: [
    {
      key: "questions", kind: "concept", title: "A comparison is a yes/no question",
      body: `\`a < b\` asks a question: *is a smaller than b?* The answer is always **true** or **false**.

| Operator | Question |
|---|---|
| \`<\` | strictly less than? |
| \`<=\` | less than **or equal**? |
| \`>\` | strictly greater than? |
| \`>=\` | greater than **or equal**? |
| \`==\` | equal? |
| \`!=\` | not equal? |`,
    },
    {
      key: "number-line", kind: "visual", title: "See it on a number line", visual: "comparison-number-line",
      body: "Pick an operator and see which values of x make `x ? 5` true. Look closely at what happens at 5 itself.",
    },
    {
      key: "cp-edge", kind: "checkpoint", questionId: "cmp-true",
      reteach: { "MC-REL-02": "rt-edge", default: "rt-edge" }, retryQuestionId: "cmp-false",
    },
    {
      key: "rt-edge", kind: "reteach", title: "Test the edge value",
      body: `Most mistakes happen when the two sides are **equal**. So test that case directly:

- \`5 < 5\` → is 5 smaller than 5? **No → false**
- \`5 <= 5\` → is 5 smaller than *or equal to* 5? **Yes → true**

Whenever a value could land exactly on the limit, ask yourself: *should the limit itself count?* If yes, you need the "or equal" version.`,
    },
    {
      key: "assign", kind: "concept", title: "= stores, == compares",
      body: `One \`=\` **stores** a value: \`x = 5\` puts 5 into x.
Two \`==\` **ask** a question: \`x == 5\` is true or false.

Inside an \`if\` or a loop condition you almost always want \`==\`. Writing \`if (x = 5)\` stores 5 and then counts as true — every time.`,
    },
    {
      key: "cp-assign", kind: "checkpoint", questionId: "cmp-assign",
      reteach: { "MC-REL-01": "rt-assign", default: "rt-assign" }, retryQuestionId: "d-cmp-assign",
    },
    {
      key: "rt-assign", kind: "reteach", title: "Read it out loud",
      body: "Read `=` as **\"becomes\"** and `==` as **\"is equal to\"**. `if (score = 100)` reads \"if score *becomes* 100\" — which always happens. `if (score == 100)` reads \"if score *is equal to* 100\" — which is the question you meant.",
    },
    { key: "practice", kind: "practice", title: "Practice", skills: ["relational_ops", "logical_ops"], count: 3 },
    { key: "exit", kind: "exit_check", skills: ["relational_ops", "logical_ops"], count: 3 },
    {
      key: "summary", kind: "summary", title: "What you reviewed",
      body: "- Strict (`<`, `>`) comparisons are **false** when both sides are equal; `<=` and `>=` are **true**.\n- Always test the edge value.\n- `=` stores, `==` compares.\n\nThese are exactly the decisions inside every loop condition.",
    },
  ],
};
