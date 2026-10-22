import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 4 — Operators. */
export const M04: PyModuleDef = {
  id: "py-operators",
  number: 4,
  level: 1,
  title: "Operators",
  summary: "Arithmetic, comparison, logical, assignment, bitwise, membership and identity operators; precedence and associativity; short-circuit evaluation; practical operator problems.",
  track: "core",
  prereqs: ["py-types"],
  lessons: [
    {
      id: "py-arithmetic-ops",
      title: "Arithmetic and assignment operators",
      minutes: 15,
      difficulty: 1,
      objectives: [
        "Use `+ - * / // % **` and predict their results",
        "Use `%` and `//` for digits, even/odd checks and unit conversions",
        "Update variables with augmented assignment (`+=`, `-=`, `*=` …)",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 1,
        prompt: "What is `17 % 5`?",
        options: [
          { text: "3.4", why: "That's `17 / 5`." },
          { text: "3", why: "That's `17 // 5` — the quotient." },
          { text: "2", why: "Correct — `%` is the remainder: 17 = 3 × 5 + 2." },
        ],
        answer: 2,
        hint: "`%` is not percent in Python.",
        explain: "`%` (modulo) gives the remainder after division.",
      },
      why: "Arithmetic operators do much more than calculator sums: `%` tells you if a number is even, extracts digits and wraps clock times; `//` counts full groups; `**` computes powers and roots. These are the building blocks of nearly every number problem.",
      concept: [
        {
          title: "The arithmetic operators",
          body: `| Operator | Meaning | Example | Result |
| --- | --- | --- | --- |
| \`+\` \`-\` \`*\` | add, subtract, multiply | \`7 * 3\` | 21 |
| \`/\` | true division | \`7 / 2\` | 3.5 |
| \`//\` | floor division | \`7 // 2\` | 3 |
| \`%\` | remainder (modulo) | \`7 % 2\` | 1 |
| \`**\` | power | \`2 ** 5\` | 32 |
| \`-x\` | negation | \`-(3 - 5)\` | 2 |

\`//\` rounds **down** (towards minus infinity): \`-7 // 2\` is -4, and \`-7 % 2\` is 1, so that \`a == (a // b) * b + a % b\` always holds. \`x ** 0.5\` is a square root.`,
        },
        {
          title: "Useful patterns with // and %",
          body: `\`\`\`python
n % 2 == 0          # n is even
n % 10              # last digit of n
n // 10             # n without its last digit
minutes // 60, minutes % 60   # hours and minutes
(hour + 5) % 24     # 5 hours later on a 24-hour clock
\`\`\``,
        },
        {
          title: "Augmented assignment",
          body: `\`x += 3\` is short for \`x = x + 3\`. The same works for \`-= *= /= //= %= **=\`:

\`\`\`python
score = 10
score += 5     # 15
score *= 2     # 30
score //= 7    # 4
\`\`\`

There is no \`++\` or \`--\` in Python — use \`+= 1\`.`,
        },
      ],
      example: {
        title: "Time and digits",
        code: r`total_minutes = 135
hours = total_minutes // 60
minutes = total_minutes % 60
print(hours, "h", minutes, "min")
n = 4728
print("last digit:", n % 10, "| without it:", n // 10)
print("2 to the 10:", 2 ** 10, "| sqrt of 81:", 81 ** 0.5)
steps = 0
steps += 3
steps *= 4
print("steps:", steps, "| -7 // 2 =", -7 // 2)`,
        output: "2 h 15 min\nlast digit: 8 | without it: 472\n2 to the 10: 1024 | sqrt of 81: 9.0\nsteps: 12 | -7 // 2 = -4\n",
        lines: [
          [2, "135 // 60 = 2 full hours."],
          [3, "135 % 60 = 15 minutes left over."],
          [6, "`% 10` gives the last digit; `// 10` drops it."],
          [7, "`**` is power; raising to 0.5 is a square root (a float)."],
          [9, "`+=` adds to the existing value: 0 + 3 = 3."],
          [10, "`*=` multiplies: 3 × 4 = 12. And floor division rounds down: -7 // 2 is -4, not -3."],
        ],
      },
      mistakes: [
        { title: "Using ^ for power", body: "`2 ^ 3` is 1 (bitwise XOR!). Power is `2 ** 3`." },
        { title: "Writing x++", body: "Python has no `++`. `x++` is a SyntaxError; write `x += 1`." },
        { title: "Assuming // truncates towards zero", body: "`-7 // 2` is -4 (floor). C++ and Java truncate to -3." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 1,
          code: r`print(20 // 6, 20 % 6, 20 / 8)
print(3 ** 2 ** 2)`,
          answer: "3 2 2.5\n81\n",
          hint: "`**` is evaluated right to left.",
          explain: "20 // 6 = 3 remainder 2; 20 / 8 = 2.5. `3 ** 2 ** 2` is `3 ** (2 ** 2)` = 3 ** 4 = 81.",
        },
        {
          id: "f1", kind: "fill", difficulty: 1,
          prompt: "Print whether `n` is even.",
          code: r`n = 14
print(n ___ 2 == 0)`,
          blanks: [["%"]],
          output: "True\n",
          hint: "Even numbers leave no remainder when divided by 2.",
          explain: "`n % 2` is 0 for even numbers.",
        },
        {
          id: "b1", kind: "bug", difficulty: 2,
          prompt: "This should print the area of a circle with radius 3 (about 28.27). Which line is wrong?",
          code: r`radius = 3
area = 3.14159 * radius ^ 2
print(round(area, 2))`,
          line: 2,
          fix: r`radius = 3
area = 3.14159 * radius ** 2
print(round(area, 2))`,
          output: "28.27\n",
          hint: "Which operator raises to a power in Python?",
          explain: "`^` is bitwise XOR, not power (it even fails here on a float). Use `**`.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 2,
          prompt: "`x = 10` then `x //= 4` then `x **= 2`. What is x?",
          options: [
            { text: "6.25", why: "`//=` gives a whole number: 2." },
            { text: "4", why: "Correct: 10 // 4 = 2, then 2 ** 2 = 4." },
            { text: "100", why: "x is changed by `//=` first." },
          ],
          answer: 1,
          hint: "Apply each augmented assignment in order.",
          explain: "10 // 4 = 2; 2 ** 2 = 4.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Seconds to h:m:s", difficulty: 2,
          prompt: `Read a whole number of **seconds** and print it as hours, minutes and seconds:

\`\`\`
1 h 1 min 5 s
\`\`\`

(for input \`3665\`).`,
          starter: r`seconds = int(input())
`,
          tests: [
            { label: "3665 s", input: "3665\n", output: "1 h 1 min 5 s" },
            { label: "Under a minute", input: "59\n", output: "0 h 0 min 59 s", hidden: true, category: "edge" },
            { label: "Exactly 2 hours", input: "7200\n", output: "2 h 0 min 0 s", hidden: true, category: "boundary" },
            { label: "Large", input: "100000\n", output: "27 h 46 min 40 s", hidden: true },
          ],
          hints: [
            "How many seconds are in an hour? In a minute?",
            "`//` counts full units; `%` gives what's left over.",
            "hours = seconds // 3600; the rest is seconds % 3600; then split that into minutes and seconds.",
            "`h = s // 3600`, `m = s % 3600 // 60`, `sec = s % 60`; print them with labels.",
          ],
          solution: r`seconds = int(input())
h = seconds // 3600
m = seconds % 3600 // 60
s = seconds % 60
print(h, "h", m, "min", s, "s")`,
          notes: "`%` and `//` are applied in stages: hours first, then minutes from the remainder. `seconds % 60` works directly because 3600 is a multiple of 60.",
        },
        {
          id: "stretch", kind: "task", title: "Sum of digits of a 3-digit number", difficulty: 2,
          prompt: `Read a **three-digit** number and print the sum of its digits using only \`//\` and \`%\` (no strings):

\`\`\`
Digit sum: 15
\`\`\`

(for input \`582\`).`,
          starter: r`n = int(input())
`,
          tests: [
            { label: "582", input: "582\n", output: "Digit sum: 15" },
            { label: "100", input: "100\n", output: "Digit sum: 1", hidden: true, category: "boundary" },
            { label: "999", input: "999\n", output: "Digit sum: 27", hidden: true, category: "boundary" },
          ],
          hints: [
            "How do you get the last digit of a number?",
            "`n % 10` is the last digit; `n // 10` removes it.",
            "Hundreds digit: `n // 100`. Tens: `n // 10 % 10`. Units: `n % 10`.",
            "`print(\"Digit sum:\", n // 100 + n // 10 % 10 + n % 10)`.",
          ],
          solution: r`n = int(input())
hundreds = n // 100
tens = n // 10 % 10
units = n % 10
print("Digit sum:", hundreds + tens + units)`,
          notes: "`n // 10 % 10` first drops the last digit, then takes the new last digit — that's the tens digit. With a loop (Module 6) this works for any number of digits.",
        },
      ],
      realWorld: "`%` is used for paging (item `i` is on page `i // page_size`), alternating row colours (`row % 2`), circular buffers, clock arithmetic and checksums like the Luhn algorithm that validates card numbers.",
      reteach: "Think of `//` and `%` as sharing sweets: `17 // 5` is how many sweets each of 5 friends gets (3), and `17 % 5` is how many are left in the bag (2). `/` is what you'd get if you could cut sweets into pieces (3.4).",
      summary: [
        "`/` true division (float), `//` floor division, `%` remainder, `**` power.",
        "`//` rounds down, so `-7 // 2` is -4; `a == (a // b) * b + a % b`.",
        "Augmented assignment: `x += 1`, `x *= 2` … (no `++` in Python).",
      ],
      cpp: {
        python: r`print(-7 // 2, -7 % 2)   # -4 1`,
        cpp: r`cout << -7 / 2 << " " << -7 % 2;   // -3 -1`,
        note: "C++ integer division truncates towards zero; Python's `//` floors. They agree for positive numbers but differ for negatives.",
      },
    },

    {
      id: "py-comparison-logic",
      title: "Comparison and logical operators",
      minutes: 16,
      difficulty: 2,
      objectives: [
        "Compare values with `== != < > <= >=`, including chained comparisons",
        "Combine conditions with `and`, `or`, `not`",
        "Use short-circuit evaluation to avoid errors",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 1,
        prompt: "What is `5 > 3 and 2 > 4`?",
        options: [
          { text: "True", why: "`and` needs both sides true." },
          { text: "False", why: "Correct: the second comparison is False." },
          { text: "An error", why: "Valid expression." },
        ],
        answer: 1,
        hint: "`and` is True only if both parts are True.",
        explain: "5 > 3 is True, 2 > 4 is False; True and False is False.",
      },
      why: "Every decision in a program — is the password long enough, is the user an adult *and* a member, is the input empty — is a comparison or a combination of comparisons. Writing them correctly (and readably) is essential.",
      concept: [
        {
          title: "Comparisons and chaining",
          body: `\`==\` equal, \`!=\` not equal, \`<\`, \`>\`, \`<=\`, \`>=\`. Each gives a bool.

Python lets you **chain** comparisons like in maths:

\`\`\`python
13 <= age <= 19        # a teenager: same as 13 <= age and age <= 19
a == b == c            # all three equal
\`\`\`

Strings compare alphabetically by character codes: \`"apple" < "banana"\` is True, and all capital letters come before lower-case ones (\`"Z" < "a"\`).`,
        },
        {
          title: "and, or, not",
          body: `| Expression | True when |
| --- | --- |
| \`a and b\` | both are true |
| \`a or b\` | at least one is true |
| \`not a\` | a is false |

Precedence: \`not\` binds tightest, then \`and\`, then \`or\`. So \`a or b and c\` means \`a or (b and c)\` — add brackets when mixing them, for readers' sake.`,
        },
        {
          title: "Short-circuit evaluation",
          body: `Python stops evaluating as soon as the answer is known:

- \`False and ...\` — the right side is **never evaluated**.
- \`True or ...\` — the right side is never evaluated.

This lets you guard against errors:

\`\`\`python
if count != 0 and total / count > 50:   # no ZeroDivisionError when count is 0
\`\`\`

\`and\`/\`or\` actually return one of their operands: \`name or "Guest"\` gives \`name\` if it's truthy, otherwise \`"Guest"\`.`,
        },
      ],
      example: {
        title: "Entry rules for a coding contest",
        code: r`age = 16
has_laptop = True
team_size = 0
print(13 <= age <= 19)
print(age >= 13 and has_laptop)
print(not has_laptop or age > 18)
print(team_size != 0 and 100 / team_size > 20)
nickname = ""
print(nickname or "Guest")
print("Zebra" < "apple")`,
        output: "True\nTrue\nFalse\nFalse\nGuest\nTrue\n",
        lines: [
          [4, "Chained comparison: is 16 between 13 and 19? Yes."],
          [5, "Both conditions true → True."],
          [6, "`not True` is False; `16 > 18` is False; False or False → False."],
          [7, "`team_size != 0` is False, so Python never evaluates the division — no ZeroDivisionError."],
          [9, "An empty string is falsy, so `or` returns the right side."],
          [10, "Upper-case letters sort before lower-case ones, so this is True."],
        ],
      },
      mistakes: [
        { title: "`x == 1 or 2`", body: "This is `(x == 1) or 2`, which is always truthy. Write `x == 1 or x == 2` or `x in (1, 2)`." },
        { title: "`=` instead of `==`", body: "`if x = 5:` is a SyntaxError. Comparison is `==`." },
        { title: "Comparing different types", body: "`\"5\" == 5` is False (no conversion), and `\"5\" < 5` is a TypeError." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 2,
          code: r`x = 7
print(1 < x < 10, x == 7 or x / 0)
print(not x > 5 and x < 10)`,
          answer: "True True\nFalse\n",
          hint: "Short-circuit: is the right side of `or` ever evaluated? `not` binds tighter than `and`.",
          explain: "The chain is True. `x == 7` is True so `or` never evaluates `x / 0`. `not x > 5` is False, so `False and ...` is False.",
        },
        {
          id: "p2", kind: "predict", difficulty: 3,
          code: r`print(0 or "" or "x")
print(3 and 0 and 5)
print("" or 0)`,
          answer: "x\n0\n0\n",
          hint: "`or` returns the first truthy operand (or the last one); `and` returns the first falsy operand (or the last one).",
          explain: "`or` skips 0 and \"\" and returns \"x\". `and` stops at the first falsy value, 0. `\"\" or 0` finds no truthy value and returns the last operand, 0.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Avoid a crash when `count` is 0 (should print `False`).",
          code: r`count = 0
total = 50
print(count > 0 ___ total / count > 10)`,
          blanks: [["and"]],
          output: "False\n",
          hint: "Which operator stops early when the left side is False?",
          explain: "`and` short-circuits: with `count > 0` False, the division never runs.",
        },
        {
          id: "b1", kind: "bug", difficulty: 2,
          prompt: "With `day = \"Tue\"` this prints `Weekend!` — it shouldn't. Which line is the bug?",
          code: r`day = "Tue"
if day == "Sat" or "Sun":
    print("Weekend!")
else:
    print("Weekday")`,
          line: 2,
          fix: r`day = "Tue"
if day == "Sat" or day == "Sun":
    print("Weekend!")
else:
    print("Weekday")`,
          output: "Weekday\n",
          hint: "What does `\"Sun\"` on its own evaluate to?",
          explain: "`day == \"Sat\" or \"Sun\"` is `(False) or \"Sun\"`, which is the truthy string \"Sun\". Each comparison needs `day ==`.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Scholarship eligibility", difficulty: 2,
          prompt: `Read **marks** (0–100) and **family income** in lakhs (whole numbers, two lines). A student is eligible if marks are **at least 85**, or marks are **at least 70 and income is below 3**. Print \`Eligible: True\` or \`Eligible: False\`.`,
          starter: r`marks = int(input())
income = int(input())
`,
          tests: [
            { label: "90 marks", input: "90\n10\n", output: "Eligible: True" },
            { label: "72 marks, low income", input: "72\n2\n", output: "Eligible: True" },
            { label: "72 marks, income 3", input: "72\n3\n", output: "Eligible: False", hidden: true, category: "boundary" },
            { label: "Exactly 85", input: "85\n9\n", output: "Eligible: True", hidden: true, category: "boundary" },
            { label: "69 marks, low income", input: "69\n1\n", output: "Eligible: False", hidden: true },
          ],
          hints: [
            "Write the rule as two separate conditions joined by \"or\".",
            "`marks >= 85` is one; `marks >= 70 and income < 3` is the other.",
            "Brackets make the grouping clear for readers.",
            "`print(\"Eligible:\", marks >= 85 or (marks >= 70 and income < 3))`.",
          ],
          solution: r`marks = int(input())
income = int(input())
eligible = marks >= 85 or (marks >= 70 and income < 3)
print("Eligible:", eligible)`,
          notes: "`and` binds tighter than `or`, so the brackets aren't required — but they make the rule obvious to anyone reading it.",
        },
        {
          id: "stretch", kind: "task", title: "Valid triangle", difficulty: 3,
          prompt: `Read three side lengths (whole numbers, one per line). Print \`Triangle: True\` if they can form a triangle — every side must be **positive** and each pair of sides must add up to **more than** the third — otherwise \`Triangle: False\`.`,
          starter: r`a = int(input())
b = int(input())
c = int(input())
`,
          tests: [
            { label: "3 4 5", input: "3\n4\n5\n", output: "Triangle: True" },
            { label: "1 2 3 (flat)", input: "1\n2\n3\n", output: "Triangle: False", category: "boundary" },
            { label: "Zero side", input: "0\n4\n4\n", output: "Triangle: False", hidden: true, category: "edge" },
            { label: "Negative", input: "-3\n4\n5\n", output: "Triangle: False", hidden: true, category: "edge" },
            { label: "Equilateral", input: "7\n7\n7\n", output: "Triangle: True", hidden: true },
          ],
          hints: [
            "List every condition that must hold.",
            "Positive: `a > 0 and b > 0 and c > 0`. Triangle inequality: three comparisons.",
            "Join all six conditions with `and`.",
            "`a > 0 and b > 0 and c > 0 and a + b > c and a + c > b and b + c > a`.",
          ],
          solution: r`a = int(input())
b = int(input())
c = int(input())
ok = a > 0 and b > 0 and c > 0 and a + b > c and a + c > b and b + c > a
print("Triangle:", ok)`,
          notes: "\"More than\" means `>`: sides 1, 2, 3 make a flat line, not a triangle. Checking positivity also catches zero and negative sides.",
        },
      ],
      realWorld: "Access-control rules (\"admin or (owner and not archived)\"), form validation, game rules and search filters are all logical expressions. Short-circuiting is used everywhere to guard against `None` values: `if user and user.is_active:`.",
      reteach: "`and` is a strict bouncer: you get in only if *every* check passes, and he stops checking at the first failure. `or` is a relaxed bouncer: *one* good reason is enough, and he stops at the first one. `not` flips a yes into a no.",
      summary: [
        "Comparisons give bools; chains like `0 <= x < 10` work like maths.",
        "`and`, `or`, `not` (precedence: not > and > or); bracket mixed expressions.",
        "Short-circuit: the right side runs only if needed — use it to guard against errors.",
        "`x == 1 or 2` is a bug: write `x == 1 or x == 2` or `x in (1, 2)`.",
      ],
      cpp: {
        python: r`if 0 < x < 10 and not done:`,
        cpp: r`if (0 < x && x < 10 && !done)`,
        note: "C++ uses `&&`, `||`, `!` and has no chained comparisons (`0 < x < 10` compiles but means something else!).",
      },
    },

    {
      id: "py-bitwise-membership-identity",
      title: "Bitwise, membership and identity operators",
      minutes: 15,
      difficulty: 3,
      objectives: [
        "Test membership with `in` and `not in` on strings and collections",
        "Use `is` / `is not` correctly",
        "Read and use the bitwise operators `& | ^ ~ << >>`",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "What is `\"py\" in \"happy\"`?",
        options: [
          { text: "True", why: "Correct: \"happy\" contains the substring \"py\"." },
          { text: "False", why: "Look again at the last two letters." },
          { text: "An error", why: "`in` works on strings." },
        ],
        answer: 0,
        hint: "For strings, `in` checks for a substring.",
        explain: "`in` on strings tests whether the left string appears anywhere inside the right one.",
      },
      why: "`in` is one of Python's most-used operators: checking whether a user is in a list, a word in a sentence, a key in a dictionary. Bitwise operators are used for flags, permissions, low-level protocols and many interview puzzles.",
      concept: [
        {
          title: "Membership: in, not in",
          body: `\`\`\`python
"a" in "banana"            # True  (substring)
3 in [1, 2, 3]             # True  (element)
"x" not in {"a", "b"}      # True
"age" in {"age": 15}       # True  (checks KEYS of a dict)
\`\`\`

\`x in (1, 2, 3)\` is the clean way to write \`x == 1 or x == 2 or x == 3\`. On lists \`in\` checks items one by one (slow for big lists); on sets and dicts it's fast (Module 10–11).`,
        },
        {
          title: "Identity: is, is not",
          body: `\`a is b\` is True when both names refer to **the same object**. Use it for singletons: \`x is None\`, \`x is not None\`. Never use \`is\` to compare numbers or strings — use \`==\`.`,
        },
        {
          title: "Bitwise operators",
          body: `Integers are stored in binary; bitwise operators work on the individual bits. \`bin(n)\` shows them.

| Op | Name | Example (5 = 0b101, 3 = 0b011) | Result |
| --- | --- | --- | --- |
| \`&\` | AND | \`5 & 3\` | 1 (0b001) |
| \`\\|\` | OR | \`5 \\| 3\` | 7 (0b111) |
| \`^\` | XOR | \`5 ^ 3\` | 6 (0b110) |
| \`~\` | NOT | \`~5\` | -6 |
| \`<<\` | shift left | \`5 << 1\` | 10 (× 2) |
| \`>>\` | shift right | \`5 >> 1\` | 2 (// 2) |

Common tricks: \`n & 1\` is 1 for odd numbers; \`n & (n - 1) == 0\` checks for a power of two (n > 0); \`1 << k\` is 2ᵏ.`,
        },
      ],
      example: {
        title: "Checking things quickly",
        code: r`vowels = "aeiou"
print("e" in vowels, "z" not in vowels)
print(3 in [1, 2, 3], "id" in {"id": 7, "name": "Asha"})
answer = None
print(answer is None)
n = 12
print(bin(n), n & 1, n >> 2, n << 1)
print(5 & 3, 5 | 3, 5 ^ 3)
print(n > 0 and n & (n - 1) == 0, 16 & 15 == 0)`,
        output: "True True\nTrue True\nTrue\n0b1100 0 3 24\n1 7 6\nFalse True\n",
        lines: [
          [2, "Substring tests on a string."],
          [3, "Element test on a list; on a dict `in` checks the keys."],
          [5, "Identity test with None."],
          [7, "12 is 0b1100: last bit 0 (even); shifting right by 2 divides by 4; left by 1 doubles."],
          [8, "AND, OR, XOR of 0b101 and 0b011."],
          [9, "12 isn't a power of two; for 16, `16 & 15` is 0 — note `&` binds tighter than `==`."],
        ],
      },
      mistakes: [
        { title: "Using `in` on a dict to look for a value", body: "`\"Asha\" in {\"name\": \"Asha\"}` is False — `in` checks keys. Use `in d.values()`." },
        { title: "Mixing up `and` with `&`", body: "`&` is bitwise and doesn't short-circuit; for conditions use `and`." },
        { title: "Assuming C's precedence for bitwise ops", body: "In Python `&` binds tighter than `==`, so `x & 1 == 0` means `(x & 1) == 0`. In C and C++ it's the opposite. Write `(x & 1) == 0` anyway — it's clear in every language." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 2,
          code: r`print("cat" in "concatenate", "Cat" in "concatenate")
print(4 in [1, 2, 3, 4], 4 not in (4,))`,
          answer: "True False\nTrue False\n",
          hint: "`in` is case-sensitive.",
          explain: "\"cat\" appears inside \"concatenate\"; \"Cat\" (capital C) doesn't. 4 is in the list; `4 not in (4,)` is False.",
        },
        {
          id: "p2", kind: "predict", difficulty: 3,
          code: r`print(6 & 3, 6 | 3, 6 ^ 3, 1 << 4)`,
          answer: "2 7 5 16\n",
          hint: "6 is 0b110 and 3 is 0b011.",
          explain: "0b110 & 0b011 = 0b010 = 2; | = 0b111 = 7; ^ = 0b101 = 5; 1 << 4 = 16.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Replace `c == \"a\" or c == \"e\" or c == \"i\"` with a membership test.",
          code: r`c = "e"
print(c ___ "aei")`,
          blanks: [["in"]],
          output: "True\n",
          hint: "Which operator checks whether something is inside a string?",
          explain: "`c in \"aei\"` is True when c is one of those characters.",
        },
        {
          id: "b1", kind: "bug", difficulty: 2,
          prompt: "This should print `Found` because \"Asha\" is one of the values. Which line is wrong?",
          code: r`ages = {"Asha": 15, "Ravi": 16}
name = "Asha"
if 15 in ages:
    print("Found")
else:
    print("Missing")`,
          line: 3,
          fix: r`ages = {"Asha": 15, "Ravi": 16}
name = "Asha"
if 15 in ages.values():
    print("Found")
else:
    print("Missing")`,
          output: "Found\n",
          hint: "What does `in` check on a dictionary?",
          explain: "`in` on a dict checks keys. 15 is a value, so use `ages.values()` (or check `name in ages`).",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Vowel or consonant", difficulty: 2,
          prompt: `Read one lower-case letter. Print \`vowel\` if it is one of a, e, i, o, u, otherwise \`consonant\`. Use \`in\`.`,
          starter: r`letter = input()
`,
          tests: [
            { label: "e", input: "e\n", output: "vowel" },
            { label: "k", input: "k\n", output: "consonant" },
            { label: "u", input: "u\n", output: "vowel", hidden: true, category: "boundary" },
            { label: "y", input: "y\n", output: "consonant", hidden: true, category: "edge" },
          ],
          hints: [
            "Which collection holds all the vowels?",
            "The string \"aeiou\" works with `in`.",
            "`if letter in \"aeiou\":` … `else:` …",
            "Print \"vowel\" in the if branch and \"consonant\" in the else branch.",
          ],
          solution: r`letter = input()
if letter in "aeiou":
    print("vowel")
else:
    print("consonant")`,
          notes: "`in` on a string replaces five `==` comparisons joined with `or`.",
        },
        {
          id: "stretch", kind: "task", title: "Permission flags with bits", difficulty: 4,
          prompt: `File permissions are stored as bits: READ = 4 (0b100), WRITE = 2 (0b010), EXECUTE = 1 (0b001). Read a permission number (0–7). Print three lines saying whether each permission is set, using \`&\`:

\`\`\`
read: True
write: False
execute: True
\`\`\`

(for input \`5\`).`,
          starter: r`READ, WRITE, EXECUTE = 4, 2, 1
perms = int(input())
`,
          tests: [
            { label: "5 = read + execute", input: "5\n", output: "read: True\nwrite: False\nexecute: True" },
            { label: "7 = everything", input: "7\n", output: "read: True\nwrite: True\nexecute: True", hidden: true },
            { label: "0 = nothing", input: "0\n", output: "read: False\nwrite: False\nexecute: False", hidden: true, category: "edge" },
            { label: "2 = write only", input: "2\n", output: "read: False\nwrite: True\nexecute: False", hidden: true },
          ],
          hints: [
            "Which bitwise operator keeps only the bits that two numbers share?",
            "`perms & READ` is non-zero exactly when the READ bit is set.",
            "Compare the result with 0. Brackets make the order obvious: `(perms & READ) != 0`.",
            "`print(\"read:\", (perms & READ) != 0)` and similarly for WRITE and EXECUTE.",
          ],
          solution: r`READ, WRITE, EXECUTE = 4, 2, 1
perms = int(input())
print("read:", (perms & READ) != 0)
print("write:", (perms & WRITE) != 0)
print("execute:", (perms & EXECUTE) != 0)`,
          notes: "This is exactly how Unix file permissions (chmod 755) work. In Python `&` already binds tighter than `!=`, so the brackets are for readers — and for anyone used to C, where the order is reversed.",
        },
      ],
      realWorld: "`in` is everywhere: `if user_id in banned_users`, `if \"error\" in log_line`. Bit flags store permissions (Unix chmod), feature toggles and network protocol headers compactly; `enum.Flag` (Module 21) wraps them nicely.",
      reteach: "`in` asks \"is this inside that?\" — a letter in a word, an item in a list, a key in a dict. `is` asks \"are these literally the same thing?\" — only sensible for unique objects like None. Bitwise operators treat a number like a row of on/off switches and combine the switches position by position.",
      summary: [
        "`in` / `not in`: substring for strings, element for lists/tuples/sets, key for dicts.",
        "`is` / `is not` compare identity — use them for None, not for values.",
        "Bitwise `& | ^ ~ << >>` work on binary digits; bracket them in comparisons.",
      ],
    },

    {
      id: "py-precedence",
      title: "Precedence, associativity and operator problems",
      minutes: 15,
      difficulty: 3,
      objectives: [
        "Evaluate expressions using Python's precedence table",
        "Know which operators associate right to left (`**`)",
        "Use brackets to make complex expressions clear",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "What is `2 + 3 * 4 ** 2`?",
        options: [
          { text: "400", why: "That's ((2 + 3) * 4) ** 2." },
          { text: "50", why: "Correct: 4 ** 2 = 16, then 3 * 16 = 48, then 2 + 48 = 50." },
          { text: "146", why: "Power is done before multiplication." },
        ],
        answer: 1,
        hint: "Power first, then multiply, then add.",
        explain: "`**` binds tightest, then `*`, then `+`.",
      },
      why: "An expression like `a + b * c > d and not e` is read by Python in a precise order. Misjudging it gives silent wrong answers. Knowing the order — and using brackets generously — makes your code correct and readable.",
      concept: [
        {
          title: "The precedence table (highest first)",
          body: `| Operators | Meaning |
| --- | --- |
| \`( )\` | brackets |
| \`**\` | power (right to left!) |
| \`-x\` \`+x\` \`~x\` | unary |
| \`*\` \`/\` \`//\` \`%\` | multiplicative |
| \`+\` \`-\` | additive |
| \`<<\` \`>>\` | shifts |
| \`&\` then \`^\` then \`\\|\` | bitwise |
| \`== != < > <= >= in not in is is not\` | comparisons |
| \`not\` | logical not |
| \`and\` | logical and |
| \`or\` | logical or |
| \`x if c else y\` | conditional expression |

Same-level operators run **left to right** — except \`**\`, which runs right to left: \`2 ** 3 ** 2\` is \`2 ** 9\` = 512.`,
        },
        {
          title: "Two traps",
          body: `- \`-3 ** 2\` is **-9**: power binds tighter than unary minus, so it's \`-(3 ** 2)\`. Write \`(-3) ** 2\` for 9.
- \`10 - 4 - 3\` is \`(10 - 4) - 3 = 3\` (left to right), and \`100 / 10 / 5\` is 2.0.

When in doubt, add brackets. They cost nothing and help every reader.`,
        },
      ],
      example: {
        title: "Order in action",
        code: r`print(2 + 3 * 4)
print((2 + 3) * 4)
print(2 ** 3 ** 2, (2 ** 3) ** 2)
print(-3 ** 2, (-3) ** 2)
print(10 - 4 - 3, 100 / 10 / 5)
x = 5
print(x > 3 and x < 10 or x == 0)
print(not x == 5)`,
        output: "14\n20\n512 64\n-9 9\n3 2.0\nTrue\nFalse\n",
        lines: [
          [1, "Multiplication before addition: 2 + 12."],
          [2, "Brackets first: 5 * 4."],
          [3, "`**` is right-associative: 2 ** 9 = 512; brackets change it to 8 ** 2 = 64."],
          [4, "Unary minus is applied after the power."],
          [5, "Subtraction and division go left to right."],
          [7, "Comparisons, then `and`, then `or`: (True and True) or False."],
          [8, "`not` applies to the whole comparison: not (x == 5)."],
        ],
      },
      mistakes: [
        { title: "Average without brackets", body: "`a + b / 2` divides only b. Write `(a + b) / 2`." },
        { title: "Negative base powers", body: "`-2 ** 2` is -4. Use `(-2) ** 2`." },
        { title: "Relying on memory", body: "Even experienced developers bracket `and`/`or` mixes and bitwise expressions. Clarity beats cleverness." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 2,
          code: r`print(8 - 2 * 3 + 1)
print(20 // 3 * 3 + 20 % 3)
print(2 * 3 ** 2)`,
          answer: "3\n20\n18\n",
          hint: "Multiplicative operators before additive; `**` before `*`.",
          explain: "8 - 6 + 1 = 3; (20 // 3) * 3 + 20 % 3 = 18 + 2 = 20; 3 ** 2 = 9, times 2 = 18.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Add brackets so the average of 70 and 90 is printed (80.0).",
          code: r`a, b = 70, 90
print(___a + b___ / 2)`,
          blanks: [["("], [")"]],
          output: "80.0\n",
          hint: "What must happen before the division?",
          explain: "`(a + b) / 2` adds first; without brackets only b would be halved.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "This should print `25` (the square of -5). Which line is wrong?",
          code: r`n = 5
square = -n ** 2
print(abs(square) if False else square)`,
          line: 2,
          fix: r`n = 5
square = (-n) ** 2
print(abs(square) if False else square)`,
          output: "25\n",
          hint: "Which is applied first: the minus or the power?",
          explain: "`-n ** 2` means `-(n ** 2)` = -25. Bracket the negative base: `(-n) ** 2`.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "How does Python group `a or b and not c`?",
          options: [
            { text: "`(a or b) and (not c)`", why: "`and` binds tighter than `or`." },
            { text: "`a or (b and (not c))`", why: "Correct: not > and > or." },
            { text: "`not (a or b and c)`", why: "`not` applies only to c." },
          ],
          answer: 1,
          hint: "not binds tightest, then and, then or.",
          explain: "`not c` first, then `b and (not c)`, then `a or (...)`.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Temperature converter", difficulty: 2,
          prompt: `Read a temperature in **Celsius** (may be a decimal) and print it in Fahrenheit using \`F = C × 9 / 5 + 32\`, rounded to 1 decimal place:

\`\`\`
98.6
\`\`\`

(for input \`37\`). Make sure the formula is evaluated in the right order.`,
          starter: r`c = float(input())
f = c * 9 / 5 + 32
`,
          tests: [
            { label: "37 °C", input: "37\n", output: "98.6" },
            { label: "Freezing", input: "0\n", output: "32.0", hidden: true, category: "boundary" },
            { label: "Minus 40", input: "-40\n", output: "-40.0", hidden: true, category: "edge" },
            { label: "Decimal", input: "21.5\n", output: "70.7", hidden: true },
          ],
          hints: [
            "Does `c * 9 / 5 + 32` follow the formula?",
            "Yes — multiplication and division happen before the addition, left to right.",
            "Only the output is missing: round to 1 decimal.",
            "`print(round(f, 1))`.",
          ],
          solution: r`c = float(input())
f = c * 9 / 5 + 32
print(round(f, 1))`,
          notes: "`*` and `/` run left to right before `+`, exactly matching the maths. Writing `(c * 9 / 5) + 32` would be equally correct and a little clearer.",
        },
        {
          id: "stretch", kind: "task", title: "Simple interest and EMI check", difficulty: 3,
          prompt: `Read principal \`P\`, yearly rate \`R\` (percent) and years \`T\` (whole numbers). Print the simple interest \`P × R × T / 100\`, the total amount, and \`Affordable: True\` if the monthly payment \`total / (T × 12)\` is **at most 5000** (otherwise \`False\`).

For input \`100000\`, \`6\`, \`2\` (monthly payment 4666.67):

\`\`\`
Interest: 12000.0
Total: 112000.0
Affordable: True
\`\`\`

Get the brackets right.`,
          starter: r`P = int(input())
R = int(input())
T = int(input())
`,
          tests: [
            { label: "1 lakh, 6%, 2 years", input: "100000\n6\n2\n", output: "Interest: 12000.0\nTotal: 112000.0\nAffordable: True" },
            { label: "Short loan", input: "100000\n10\n1\n", output: "Interest: 10000.0\nTotal: 110000.0\nAffordable: False", hidden: true },
            { label: "Exactly 5000 a month", input: "100000\n10\n2\n", output: "Interest: 20000.0\nTotal: 120000.0\nAffordable: True", hidden: true, category: "boundary" },
          ],
          hints: [
            "Write each formula separately before combining them.",
            "Interest = P * R * T / 100 (a float because of `/`).",
            "Monthly = (P + interest) / (T * 12) — both brackets are needed.",
            "`print(\"Affordable:\", (P + interest) / (T * 12) <= 5000)`.",
          ],
          solution: r`P = int(input())
R = int(input())
T = int(input())
interest = P * R * T / 100
total = P + interest
print("Interest:", interest)
print("Total:", total)
print("Affordable:", total / (T * 12) <= 5000)`,
          notes: "Without brackets, `total / T * 12` would divide by T and then *multiply* by 12. Comparisons bind looser than arithmetic, so `... <= 5000` compares the finished value.",
        },
      ],
      realWorld: "Financial formulas, physics simulations and graphics code are full of long expressions. Code reviewers routinely ask for brackets around mixed `and`/`or` and bitwise expressions — clarity prevents expensive bugs.",
      reteach: "Precedence is like the rules for reading a maths sentence: brackets first, then powers, then times and divide, then plus and minus, then comparisons, then the logic words not, and, or. When a sentence is long, add brackets so nobody (including Python) can misread it.",
      summary: [
        "Order: brackets → `**` → unary → `* / // %` → `+ -` → shifts → bitwise → comparisons → not → and → or.",
        "Same level runs left to right, except `**` (right to left).",
        "`-3 ** 2` is -9; `a + b / 2` isn't an average — bracket generously.",
      ],
    },
  ],
  exam: [
    {
      id: "e1", kind: "predict", difficulty: 3,
      code: r`print(17 % 5 * 2 ** 2, -17 // 5)
print(5 > 3 > 1, 1 < 3 > 2, "b" in "abc" and not "d" in "abc")`,
      answer: "8 -4\nTrue True True\n",
      hint: "Chained comparisons are each checked; `**` before `*` before `%`… careful: `%` and `*` are the same level.",
      explain: "`17 % 5 * 2 ** 2` = (17 % 5) * 4 = 2 * 4 = 8. -17 // 5 floors to -4. Both chains hold; \"b\" is in \"abc\" and \"d\" isn't.",
    },
    {
      id: "e2", kind: "mcq", difficulty: 2,
      prompt: "Which expression is True exactly when `n` is odd?",
      options: [
        { text: "`n % 2 == 0`", why: "That's even." },
        { text: "`n & 1 == 1`", why: "Correct — the lowest bit is 1 for odd numbers." },
        { text: "`n // 2 == 1`", why: "That's only true for 2 and 3." },
      ],
      answer: 1,
      hint: "Look at the last binary digit.",
      explain: "`n & 1` keeps only the lowest bit; it's 1 for odd numbers. (`&` binds tighter than `==` here.)",
    },
    {
      id: "e3", kind: "fill", difficulty: 2,
      prompt: "Use `or` to fall back to a default name when `name` is empty.",
      code: r`name = ""
print(name ___ "Anonymous")`,
      blanks: [["or"]],
      output: "Anonymous\n",
      hint: "Which operator returns its right side when the left is falsy?",
      explain: "`name or \"Anonymous\"` returns \"Anonymous\" because an empty string is falsy.",
    },
    {
      id: "e4", kind: "bug", difficulty: 3,
      prompt: "For `x = 15` this should print `out of range` (valid range 1–10). Which line is wrong?",
      code: r`x = 15
if x >= 1 or x <= 10:
    print("in range")
else:
    print("out of range")`,
      line: 2,
      fix: r`x = 15
if 1 <= x <= 10:
    print("in range")
else:
    print("out of range")`,
      output: "out of range\n",
      hint: "Is there any number that fails `x >= 1 or x <= 10`?",
      explain: "With `or`, every number passes. A range check needs both conditions: `x >= 1 and x <= 10`, or the chain `1 <= x <= 10`.",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: leap-year and calendar facts", difficulty: 3,
    prompt: `Read a **year**. Print three facts using only operators (no \`if\` needed except optionally for formatting):

\`\`\`
Leap year: True
Century: False
Days in year: 366
\`\`\`

Rules: a year is a leap year if it is divisible by 4 **and not** by 100, **or** divisible by 400. A century year is divisible by 100. Days = 365 + 1 for leap years (hint: \`True\` counts as 1).`,
    starter: r`year = int(input())
`,
    tests: [
      { label: "2024", input: "2024\n", output: "Leap year: True\nCentury: False\nDays in year: 366" },
      { label: "1900 (century, not leap)", input: "1900\n", output: "Leap year: False\nCentury: True\nDays in year: 365", hidden: true, category: "edge" },
      { label: "2000 (divisible by 400)", input: "2000\n", output: "Leap year: True\nCentury: True\nDays in year: 366", hidden: true, category: "edge" },
      { label: "2026", input: "2026\n", output: "Leap year: False\nCentury: False\nDays in year: 365", hidden: true },
    ],
    hints: [
      "Translate the leap-year rule word by word into `%`, `==`, `and`, `or`, `not`.",
      "Divisible by 4: `year % 4 == 0`.",
      "`leap = (year % 4 == 0 and year % 100 != 0) or year % 400 == 0`.",
      "Days: `365 + leap` — a bool adds as 0 or 1.",
    ],
    solution: r`year = int(input())
leap = (year % 4 == 0 and year % 100 != 0) or year % 400 == 0
print("Leap year:", leap)
print("Century:", year % 100 == 0)
print("Days in year:", 365 + leap)`,
    notes: "The Gregorian leap-year rule is a classic test of `and`/`or` precedence. Adding a bool to an int uses True = 1, False = 0.",
  },
};
