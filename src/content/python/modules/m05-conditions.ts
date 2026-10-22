import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 5 — Conditional statements. */
export const M05: PyModuleDef = {
  id: "py-conditions",
  number: 5,
  level: 1,
  title: "Conditional Statements",
  summary: "if, elif and else; nested and combined conditions; conditional expressions; match-case; truth-value testing; common logic mistakes; real decision-making programs.",
  track: "core",
  prereqs: ["py-operators"],
  lessons: [
    {
      id: "py-if-elif-else",
      title: "if, elif and else",
      minutes: 15,
      difficulty: 1,
      objectives: [
        "Run code only when a condition is true with `if`",
        "Choose exactly one of several branches with `elif` and `else`",
        "Order conditions so the right branch wins",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 1,
        prompt: "In an `if / elif / else` chain, how many branches run?",
        options: [
          { text: "Every branch whose condition is true", why: "That's what separate `if` statements do." },
          { text: "At most one — the first whose condition is true (or `else`)", why: "Correct." },
          { text: "Always all of them", why: "Then there'd be no point in conditions." },
        ],
        answer: 1,
        hint: "`elif` means \"otherwise, if…\".",
        explain: "Python checks the conditions top to bottom and runs only the first branch that matches; `else` catches everything left.",
      },
      why: "Programs must react differently to different situations: grade bands, ticket prices by age, error messages for bad input. `if`/`elif`/`else` is how every one of those decisions is written.",
      concept: [
        {
          title: "if, then else",
          body: `\`\`\`python
if temperature > 35:
    print("Heatwave alert")
else:
    print("Normal day")
\`\`\`

The condition can be any expression; Python uses its truth value. \`else\` has no condition and runs when the \`if\` didn't.`,
        },
        {
          title: "elif for several choices",
          body: `\`\`\`python
if marks >= 90:
    grade = "A"
elif marks >= 75:
    grade = "B"
elif marks >= 50:
    grade = "C"
else:
    grade = "F"
\`\`\`

Conditions are tested **top to bottom**; the first true one wins and the rest are skipped. That's why the order matters: checking \`marks >= 50\` first would give every good student a C.`,
        },
      ],
      example: {
        title: "Cinema ticket prices",
        code: r`age = int(input())
if age < 3:
    price = 0
elif age < 13:
    price = 100
elif age >= 60:
    price = 120
else:
    price = 200
print(f"Age {age}: Rs {price}")`,
        input: "65\n",
        output: "Age 65: Rs 120\n",
        lines: [
          [1, "Read the age as an int."],
          [2, "Babies under 3 are free. 65 < 3 is False, so move on."],
          [4, "65 < 13 is False."],
          [6, "65 >= 60 is True: senior price. The remaining branches are skipped."],
          [8, "`else` would catch everyone between 13 and 59."],
          [10, "Printed after the chain, whichever branch ran."],
        ],
      },
      mistakes: [
        { title: "Wrong order of conditions", body: "Testing the broadest condition first (`if marks >= 50` before `>= 90`) means the narrower ones are never reached." },
        { title: "Using separate ifs instead of elif", body: "Separate `if` statements can all run. Use `elif` when exactly one branch should." },
        { title: "`else` with a condition", body: "`else marks < 50:` is a SyntaxError. `else` takes no condition; use `elif`." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 1,
          code: r`x = 15
if x > 10:
    print("big")
elif x > 5:
    print("medium")
else:
    print("small")`,
          answer: "big\n",
          hint: "Only the first true branch runs.",
          explain: "15 > 10 is True, so \"big\" is printed and the other branches are skipped — even though 15 > 5 is also true.",
        },
        {
          id: "p2", kind: "predict", difficulty: 2,
          code: r`x = 15
if x > 10:
    print("A")
if x > 5:
    print("B")
else:
    print("C")`,
          answer: "A\nB\n",
          hint: "These are two separate `if` statements.",
          explain: "The first `if` prints A. The second `if` is independent: 15 > 5, so B. The `else` belongs to the second `if` only.",
        },
        {
          id: "f1", kind: "fill", difficulty: 1,
          prompt: "Complete the chain so 0 prints `zero`.",
          code: r`n = 0
if n > 0:
    print("positive")
___ n < 0:
    print("negative")
___:
    print("zero")`,
          blanks: [["elif"], ["else"]],
          output: "zero\n",
          hint: "\"Otherwise if\", then \"otherwise\".",
          explain: "`elif` adds a second condition; `else` catches what's left.",
        },
        {
          id: "b1", kind: "bug", difficulty: 2,
          prompt: "A student with 95 marks gets \"C\". Which line causes it?",
          code: r`marks = 95
if marks >= 50:
    print("C")
elif marks >= 75:
    print("B")
elif marks >= 90:
    print("A")`,
          line: 2,
          fix: r`marks = 95
if marks >= 90:
    print("A")
elif marks >= 75:
    print("B")
elif marks >= 50:
    print("C")`,
          output: "A\n",
          hint: "Which condition is checked first, and is it too broad?",
          explain: "`marks >= 50` is checked first and is true for 95, so the more specific checks never run. Order from most to least specific.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Grade calculator", difficulty: 1,
          prompt: `Read marks (0–100) and print the grade: **A** for 90 and above, **B** for 75–89, **C** for 50–74, **F** below 50.`,
          starter: r`marks = int(input())
`,
          tests: [
            { label: "92", input: "92\n", output: "A" },
            { label: "75", input: "75\n", output: "B", category: "boundary" },
            { label: "74", input: "74\n", output: "C", hidden: true, category: "boundary" },
            { label: "49", input: "49\n", output: "F", hidden: true, category: "boundary" },
            { label: "100", input: "100\n", output: "A", hidden: true, category: "boundary" },
            { label: "0", input: "0\n", output: "F", hidden: true, category: "edge" },
          ],
          hints: [
            "Which grade should be checked first?",
            "Start from the highest band and work down with `elif`.",
            "`if marks >= 90` … `elif marks >= 75` … `elif marks >= 50` … `else`.",
            "Print \"A\", \"B\", \"C\" or \"F\" in each branch.",
          ],
          solution: r`marks = int(input())
if marks >= 90:
    print("A")
elif marks >= 75:
    print("B")
elif marks >= 50:
    print("C")
else:
    print("F")`,
          notes: "Because each `elif` is only reached when the conditions above were false, `marks >= 75` already implies `marks < 90`.",
        },
        {
          id: "stretch", kind: "task", title: "Electricity bill slabs", difficulty: 3,
          prompt: `Read the units used (whole number). Charge: first 100 units at Rs 3, the next 100 (101–200) at Rs 5, everything above 200 at Rs 8. Print \`Bill: Rs 550\` (for 150 units: 100×3 + 50×5).`,
          starter: r`units = int(input())
`,
          tests: [
            { label: "150 units", input: "150\n", output: "Bill: Rs 550" },
            { label: "80 units", input: "80\n", output: "Bill: Rs 240", hidden: true },
            { label: "Exactly 200", input: "200\n", output: "Bill: Rs 800", hidden: true, category: "boundary" },
            { label: "250 units", input: "250\n", output: "Bill: Rs 1200", hidden: true },
            { label: "Zero", input: "0\n", output: "Bill: Rs 0", hidden: true, category: "edge" },
          ],
          hints: [
            "Each slab is charged separately. What's the bill for exactly 100 and exactly 200 units?",
            "100 units cost 300; 200 units cost 300 + 500 = 800.",
            "For more than 200: 800 + (units - 200) * 8. For 101–200: 300 + (units - 100) * 5.",
            "Use `if units <= 100` … `elif units <= 200` … `else` and print `f\"Bill: Rs {bill}\"`.",
          ],
          solution: r`units = int(input())
if units <= 100:
    bill = units * 3
elif units <= 200:
    bill = 300 + (units - 100) * 5
else:
    bill = 800 + (units - 200) * 8
print(f"Bill: Rs {bill}")`,
          notes: "Slab (tiered) pricing is a classic `elif` ladder: each branch adds the full cost of the lower slabs plus the part in its own slab.",
        },
      ],
      realWorld: "Income-tax slabs, shipping charges by weight, discount tiers and traffic-light controllers are all `if`/`elif`/`else` ladders. Getting the order and the boundaries (< versus <=) right is exactly what testers check.",
      reteach: "An `if/elif/else` chain is a row of doors checked from the left: you walk through the **first** door whose sign is true and skip all the others. `else` is the last door with no sign — the one you take if none of the others applied.",
      summary: [
        "`if` runs a block when a condition is true; `else` runs otherwise.",
        "`elif` adds more conditions; only the first true branch runs.",
        "Order conditions from most specific to most general; test the boundary values.",
      ],
      cpp: {
        python: r`if x > 0:
    s = "pos"
elif x < 0:
    s = "neg"
else:
    s = "zero"`,
        cpp: r`if (x > 0) s = "pos";
else if (x < 0) s = "neg";
else s = "zero";`,
        note: "Python's `elif` is C++'s `else if`. Python needs a colon and indentation instead of parentheses and braces.",
      },
    },

    {
      id: "py-nested-conditions",
      title: "Nested and combined conditions",
      minutes: 15,
      difficulty: 2,
      objectives: [
        "Nest an `if` inside another `if` when one decision depends on another",
        "Flatten unnecessary nesting with `and`/`or`",
        "Avoid common logical mistakes and use truth-value testing",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "Which is equivalent to `if a:` containing `if b: print(\"x\")` (with no else branches)?",
        options: [
          { text: "`if a or b: print(\"x\")`", why: "`or` would print when only one is true." },
          { text: "`if a and b: print(\"x\")`", why: "Correct: x is printed only when both are true." },
          { text: "`if not a and b: print(\"x\")`", why: "That requires a to be false." },
        ],
        answer: 1,
        hint: "When does the inner print run?",
        explain: "The inner block runs only if both conditions are true — exactly `a and b`.",
      },
      why: "Real decisions often depend on earlier ones: *if* the user is logged in, *then* check whether they're an admin. Writing these clearly — nested where it helps, flat where it doesn't — keeps logic readable and correct.",
      concept: [
        {
          title: "Nesting",
          body: `\`\`\`python
if logged_in:
    if is_admin:
        print("Admin panel")
    else:
        print("Dashboard")
else:
    print("Please log in")
\`\`\`

The inner \`if\` only runs when the outer condition is true. Each level is indented one more step.`,
        },
        {
          title: "Flatten when you can",
          body: `Deep nesting is hard to read. Two nested ifs with no \`else\` can become one condition:

\`\`\`python
if age >= 18:
    if has_id:
        print("Enter")
# same as
if age >= 18 and has_id:
    print("Enter")
\`\`\`

A **guard clause** handles the special case first so the main path isn't indented:

\`\`\`python
if not name:
    print("Name required")
elif len(name) < 3:
    print("Too short")
else:
    print("Welcome", name)
\`\`\``,
        },
        {
          title: "Truth-value testing and common logic mistakes",
          body: `- Prefer \`if items:\` over \`if len(items) > 0:\`, and \`if not name:\` over \`if name == "":\`.
- Don't write \`if flag == True:\` — just \`if flag:\`.
- \`x == 1 or 2\` is always truthy; write \`x in (1, 2)\`.
- De Morgan's laws: \`not (a and b)\` == \`not a or not b\`; \`not (a or b)\` == \`not a and not b\`.
- Watch boundaries: is 18 an adult — \`>\` or \`>=\`?`,
        },
      ],
      example: {
        title: "Library borrowing rules",
        code: r`is_member = True
books_out = 2
has_fine = False
if is_member:
    if has_fine:
        print("Pay your fine first")
    elif books_out >= 3:
        print("Return a book first")
    else:
        print("You may borrow")
else:
    print("Please join the library")
can_borrow = is_member and not has_fine and books_out < 3
print(can_borrow)`,
        output: "You may borrow\nTrue\n",
        lines: [
          [4, "Outer decision: only members get the detailed checks."],
          [5, "Inner chain: a fine blocks borrowing."],
          [7, "Too many books out also blocks it."],
          [10, "Otherwise the member may borrow."],
          [13, "The same rule as one flat boolean expression."],
        ],
      },
      mistakes: [
        { title: "Else attached to the wrong if", body: "Indentation decides which `if` an `else` belongs to. Line them up deliberately." },
        { title: "`if x == True`", body: "Redundant and sometimes wrong (a truthy non-bool isn't `== True`). Write `if x:`." },
        { title: "Negating a compound condition incorrectly", body: "`not (a and b)` is NOT `not a and not b`. Apply De Morgan: `not a or not b`." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 2,
          code: r`a, b = True, False
if a:
    if b:
        print("both")
    else:
        print("only a")
else:
    print("not a")`,
          answer: "only a\n",
          hint: "Which `if` does each `else` belong to?",
          explain: "The outer `if a` runs; inside it, `b` is False, so the inner `else` prints \"only a\".",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Flatten the nested ifs into one condition (prints `ok`).",
          code: r`age, ticket = 20, True
if age >= 18 ___ ticket:
    print("ok")`,
          blanks: [["and"]],
          output: "ok\n",
          hint: "Both must be true.",
          explain: "Two nested ifs without else branches are equivalent to one `and`.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "This should print `invalid` for numbers outside 1–10. For 50 it prints `valid`. Which line has the bug?",
          code: r`n = 50
if not n >= 1 and n <= 10:
    print("invalid")
else:
    print("valid")`,
          line: 2,
          fix: r`n = 50
if not (1 <= n <= 10):
    print("invalid")
else:
    print("valid")`,
          output: "invalid\n",
          hint: "What does `not` apply to without brackets?",
          explain: "`not` binds tighter than `and`, so line 2 means `(not n >= 1) and n <= 10`. For 50 that's `False and ...` → False, so it prints valid. Negate the whole range: `not (1 <= n <= 10)`.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 2,
          prompt: "Which is the most Pythonic way to check that the list `items` is not empty?",
          options: [
            { text: "`if len(items) != 0:`", why: "Works, but more verbose than needed." },
            { text: "`if items:`", why: "Correct — non-empty lists are truthy." },
            { text: "`if items == True:`", why: "A list is never equal to True." },
          ],
          answer: 1,
          hint: "Use truthiness.",
          explain: "Empty collections are falsy, so `if items:` reads as \"if there are items\".",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Login checker", difficulty: 2,
          prompt: `Read a **username** and a **password** (two lines). The correct values are \`admin\` and \`py2026\`.

- If the username is wrong, print \`Unknown user\`.
- If the username is right but the password is wrong, print \`Wrong password\`.
- If both are right, print \`Welcome, admin\`.

Use a nested \`if\`.`,
          starter: r`username = input()
password = input()
`,
          tests: [
            { label: "Correct", input: "admin\npy2026\n", output: "Welcome, admin" },
            { label: "Wrong password", input: "admin\n1234\n", output: "Wrong password" },
            { label: "Unknown user", input: "root\npy2026\n", output: "Unknown user", hidden: true },
            { label: "Case matters", input: "Admin\npy2026\n", output: "Unknown user", hidden: true, category: "edge" },
          ],
          hints: [
            "Which check comes first?",
            "The outer `if` checks the username; the inner one the password.",
            "`if username == \"admin\":` then inside it `if password == \"py2026\":` … `else:` …",
            "The outer `else` prints \"Unknown user\".",
          ],
          solution: r`username = input()
password = input()
if username == "admin":
    if password == "py2026":
        print("Welcome, admin")
    else:
        print("Wrong password")
else:
    print("Unknown user")`,
          notes: "Nesting fits here because the password message only makes sense once the user is known. (Real systems never store or compare plain-text passwords — see Module 33.)",
        },
        {
          id: "stretch", kind: "task", title: "Quadrant finder", difficulty: 3,
          prompt: `Read integers \`x\` and \`y\`. Print where the point lies: \`Quadrant 1\` … \`Quadrant 4\`, \`On the x-axis\`, \`On the y-axis\`, or \`Origin\`. (Quadrant 1: x>0, y>0; 2: x<0, y>0; 3: x<0, y<0; 4: x>0, y<0.)`,
          starter: r`x = int(input())
y = int(input())
`,
          tests: [
            { label: "(3, 4)", input: "3\n4\n", output: "Quadrant 1" },
            { label: "(-2, 5)", input: "-2\n5\n", output: "Quadrant 2" },
            { label: "(-1, -1)", input: "-1\n-1\n", output: "Quadrant 3", hidden: true },
            { label: "(7, -3)", input: "7\n-3\n", output: "Quadrant 4", hidden: true },
            { label: "(0, 0)", input: "0\n0\n", output: "Origin", hidden: true, category: "edge" },
            { label: "(5, 0)", input: "5\n0\n", output: "On the x-axis", hidden: true, category: "edge" },
            { label: "(0, -9)", input: "0\n-9\n", output: "On the y-axis", hidden: true, category: "edge" },
          ],
          hints: [
            "Handle the special cases (zeros) before the quadrants.",
            "Origin is x == 0 and y == 0; on the x-axis means y == 0 (x isn't 0).",
            "After the zero cases, nest: `if x > 0:` then check y; else check y.",
            "Order: origin → y == 0 → x == 0 → quadrants.",
          ],
          solution: r`x = int(input())
y = int(input())
if x == 0 and y == 0:
    print("Origin")
elif y == 0:
    print("On the x-axis")
elif x == 0:
    print("On the y-axis")
elif x > 0:
    if y > 0:
        print("Quadrant 1")
    else:
        print("Quadrant 4")
else:
    if y > 0:
        print("Quadrant 2")
    else:
        print("Quadrant 3")`,
          notes: "Guard clauses (the zero cases first) keep the quadrant logic simple: by the time we reach `elif x > 0`, neither coordinate is zero.",
        },
      ],
      realWorld: "Permission checks (`if user: if user.is_admin: ...`), form validation and game AI decision trees are nested conditions. Code reviewers look for 'arrow code' (deep nesting) and suggest guard clauses.",
      reteach: "Nested ifs are like a flowchart with a question inside another question: you only reach the second question if you answered the first one a certain way. If the inner question has no other path, the two questions can be merged into one with `and`.",
      summary: [
        "Nest an `if` when the second decision only makes sense after the first.",
        "Merge nested ifs without else branches into `and`; use guard clauses to avoid deep nesting.",
        "Use truthiness (`if items:`), avoid `== True`, bracket negations (De Morgan).",
      ],
    },

    {
      id: "py-conditional-expressions",
      title: "Conditional expressions",
      minutes: 12,
      difficulty: 2,
      objectives: [
        "Write a one-line choice with `a if condition else b`",
        "Know when a conditional expression helps and when an if-statement is clearer",
        "Combine conditional expressions with f-strings and assignments",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "What is `\"even\" if 7 % 2 == 0 else \"odd\"`?",
        options: [
          { text: "\"even\"", why: "7 % 2 is 1, so the condition is False." },
          { text: "\"odd\"", why: "Correct: the condition is False, so the else value is used." },
          { text: "A SyntaxError", why: "It's a valid conditional expression." },
        ],
        answer: 1,
        hint: "Read it as: \"even\", if the condition holds, otherwise \"odd\".",
        explain: "A conditional expression evaluates the condition, then gives the first value if True and the else value if False.",
      },
      why: "Many decisions just pick a value: a label, a price, a plural ending. A conditional expression does that in one readable line, inside an assignment, a return or an f-string.",
      concept: [
        {
          title: "value_if_true if condition else value_if_false",
          body: `\`\`\`python
status = "adult" if age >= 18 else "minor"
print(f"{n} item{'s' if n != 1 else ''}")
\`\`\`

It's an **expression** — it produces a value — so it can go anywhere a value can. Both the \`if\` and the \`else\` parts are required.`,
        },
        {
          title: "Keep it readable",
          body: `Good: a simple choice between two values. Not good: nested conditional expressions or ones with side effects:

\`\`\`python
# hard to read — use an if/elif chain instead
grade = "A" if m >= 90 else "B" if m >= 75 else "C"
\`\`\`

Only the chosen branch is evaluated, so \`x / y if y else 0\` is safe when y is 0.`,
        },
      ],
      example: {
        title: "Labels from values",
        code: r`for n in [0, 1, 5]:
    print(f"{n} apple{'s' if n != 1 else ''}")
balance = -250
print("in credit" if balance >= 0 else "overdrawn")
y = 0
print(10 / y if y != 0 else "undefined")
score = 72
print(max(0, score - 80) if score > 80 else "no bonus")`,
        output: "0 apples\n1 apple\n5 apples\noverdrawn\nundefined\nno bonus\n",
        lines: [
          [1, "A `for` loop (next module) repeats the next line for n = 0, 1 and 5."],
          [2, "Pluralise: add an s unless there is exactly one."],
          [4, "Choose a message based on the balance."],
          [6, "Only the chosen branch runs, so the division never happens when y is 0."],
          [8, "Any expressions can be the two values."],
        ],
      },
      mistakes: [
        { title: "Forgetting else", body: "`x = \"yes\" if ok` is a SyntaxError: a conditional expression must have an else value." },
        { title: "Chaining too many", body: "Nested conditional expressions are legal but hard to read. Use an if/elif chain." },
        { title: "Wrong order (C-style)", body: "Python is `a if cond else b`, not `cond ? a : b`." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 2,
          code: r`t = 38
print("fever" if t > 37.5 else "normal")
n = 1
print(f"{n} file{'' if n == 1 else 's'}")`,
          answer: "fever\n1 file\n",
          hint: "Evaluate each condition.",
          explain: "38 > 37.5 is True → \"fever\". n == 1 → the empty string, so \"1 file\".",
        },
        {
          id: "f1", kind: "fill", difficulty: 1,
          prompt: "Complete the conditional expression (prints `minor`).",
          code: r`age = 15
label = "adult" ___ age >= 18 ___ "minor"
print(label)`,
          blanks: [["if"], ["else"]],
          output: "minor\n",
          hint: "value if condition else other value.",
          explain: "`\"adult\" if age >= 18 else \"minor\"` gives \"minor\" for 15.",
        },
        {
          id: "b1", kind: "bug", difficulty: 2,
          prompt: "This should print `free` for kids under 5 and `paid` otherwise. Which line is wrong?",
          code: r`age = 3
ticket = age < 5 if "free" else "paid"
print(ticket)`,
          line: 2,
          fix: r`age = 3
ticket = "free" if age < 5 else "paid"
print(ticket)`,
          output: "free\n",
          hint: "The order is: value, if, condition, else, value.",
          explain: "The parts are in the wrong order — it evaluates `\"free\"` as the condition (always truthy) and returns `age < 5`, a bool. Write `\"free\" if age < 5 else \"paid\"`.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 2,
          prompt: "When is a full if/elif/else statement better than a conditional expression?",
          options: [
            { text: "When choosing between two short values", why: "That's exactly what a conditional expression is for." },
            { text: "When there are several branches or each branch does several things", why: "Correct." },
            { text: "Never — conditional expressions are always better", why: "Long or nested ones hurt readability." },
          ],
          answer: 1,
          hint: "Think about readability.",
          explain: "Conditional expressions pick one of two values; anything bigger reads better as a statement.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Pass or fail list", difficulty: 2,
          prompt: `Read a name and marks (two lines). Print one line: \`Asha: PASS\` if marks are 40 or more, otherwise \`Asha: FAIL\`. Use a conditional expression inside an f-string.`,
          starter: r`name = input()
marks = int(input())
`,
          tests: [
            { label: "Pass", input: "Asha\n72\n", output: "Asha: PASS" },
            { label: "Fail", input: "Ravi\n31\n", output: "Ravi: FAIL" },
            { label: "Exactly 40", input: "Zoe\n40\n", output: "Zoe: PASS", hidden: true, category: "boundary" },
          ],
          hints: [
            "What are the two possible words?",
            "`\"PASS\" if marks >= 40 else \"FAIL\"`.",
            "Expressions can go inside `{}` in an f-string.",
            "`print(f\"{name}: {'PASS' if marks >= 40 else 'FAIL'}\")` — note the different quotes inside.",
          ],
          solution: r`name = input()
marks = int(input())
print(f"{name}: {'PASS' if marks >= 40 else 'FAIL'}")`,
          notes: "Inside a double-quoted f-string, use single quotes for strings in the expression (Python 3.12 also allows reusing the same quotes).",
        },
        {
          id: "stretch", kind: "task", title: "Absolute difference and order", difficulty: 2,
          prompt: `Read two integers \`a\` and \`b\`. Using conditional expressions only (no if-statements), print the larger one, the smaller one, and their difference (larger − smaller):

\`\`\`
larger: 9
smaller: 4
difference: 5
\`\`\``,
          starter: r`a = int(input())
b = int(input())
`,
          tests: [
            { label: "4 and 9", input: "4\n9\n", output: "larger: 9\nsmaller: 4\ndifference: 5" },
            { label: "Equal", input: "6\n6\n", output: "larger: 6\nsmaller: 6\ndifference: 0", hidden: true, category: "edge" },
            { label: "Negative", input: "-3\n-10\n", output: "larger: -3\nsmaller: -10\ndifference: 7", hidden: true },
          ],
          hints: [
            "Which value is larger when `a > b`?",
            "`larger = a if a > b else b`.",
            "`smaller` is the other one.",
            "Then `difference = larger - smaller` and print the three lines.",
          ],
          solution: r`a = int(input())
b = int(input())
larger = a if a > b else b
smaller = b if a > b else a
print("larger:", larger)
print("smaller:", smaller)
print("difference:", larger - smaller)`,
          notes: "In real code you'd write `max(a, b)`, `min(a, b)` and `abs(a - b)` — but building them yourself shows exactly what those built-ins do.",
        },
      ],
      realWorld: "Conditional expressions appear constantly in UI text (\"1 result\" vs \"3 results\"), default values, and data cleaning (`value if value is not None else 0`).",
      reteach: "A conditional expression is a question with two possible answers written on one line: *this* if the answer is yes, otherwise *that*. Python reads the question in the middle first, then picks the answer on the left or the right.",
      summary: [
        "`a if condition else b` is an expression that produces one of two values.",
        "Only the chosen branch is evaluated.",
        "Use it for simple two-way choices; use if/elif/else statements for anything bigger.",
      ],
      cpp: {
        python: r`label = "even" if n % 2 == 0 else "odd"`,
        cpp: r`string label = n % 2 == 0 ? "even" : "odd";`,
        note: "C++'s ternary `cond ? a : b` puts the condition first; Python puts the main value first.",
      },
    },

    {
      id: "py-match-case",
      title: "match-case and real decision programs",
      minutes: 16,
      difficulty: 3,
      version: "Python 3.10+",
      prereqs: ["py-if-elif-else"],
      objectives: [
        "Use `match`/`case` to compare a value against several patterns",
        "Combine patterns with `|`, add guards with `if`, and capture values",
        "Choose between match-case and an if/elif chain",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "In a `match` statement, what does `case _:` do?",
        options: [
          { text: "Matches only an underscore character", why: "`_` is a wildcard pattern, not the text \"_\"." },
          { text: "Matches anything — a default branch", why: "Correct: like `else`." },
          { text: "It's a syntax error", why: "It's the standard catch-all case." },
        ],
        answer: 1,
        hint: "Think of `else`.",
        explain: "`case _:` is the wildcard pattern: it always matches, so put it last.",
      },
      why: "Menus, commands and message types often branch on one value with many possibilities. `match` (Python 3.10+) expresses this clearly and can also look *inside* tuples, lists and dictionaries — called structural pattern matching.",
      concept: [
        {
          title: "Matching values",
          body: `\`\`\`python
match command:
    case "start":
        print("Starting")
    case "stop" | "quit":          # either value
        print("Stopping")
    case _:                        # anything else
        print("Unknown command")
\`\`\`

Cases are tried top to bottom; the first match runs and the others are skipped (no fall-through, no \`break\` needed).`,
        },
        {
          title: "Guards and capturing",
          body: `A **guard** adds a condition; a bare name **captures** the value:

\`\`\`python
match temperature:
    case t if t < 0:
        print("freezing", t)
    case t if t < 25:
        print("mild")
    case _:
        print("hot")
\`\`\`

Patterns can also match structure: \`case (x, 0):\` matches any 2-tuple whose second item is 0 and captures the first as \`x\`. Careful: a bare name in a case always matches (it captures) — use dotted names or literals for constants.`,
        },
        {
          title: "match or if?",
          body: `Use \`match\` when you branch on **one value** against many **fixed options or shapes**. Use \`if/elif\` for ranges and unrelated conditions. Both work for most problems; choose the one that reads best. **Version note:** \`match\` needs Python 3.10 or newer.`,
        },
      ],
      example: {
        title: "A tiny command interpreter",
        code: r`for line in ["go north", "take lamp", "look", "dance"]:
    words = line.split()
    match words:
        case ["go", direction]:
            print("You walk", direction)
        case ["take", item]:
            print("You pick up the", item)
        case ["look"] | ["l"]:
            print("You see a dark room")
        case _:
            print("I don't understand:", line)`,
        output: "You walk north\nYou pick up the lamp\nYou see a dark room\nI don't understand: dance\n",
        lines: [
          [1, "A `for` loop (Module 6) runs the indented body once for each command in the list."],
          [2, "`split()` turns \"go north\" into the list ['go', 'north']."],
          [3, "Match the list's structure."],
          [4, "A 2-item list starting with \"go\" — the second word is captured as `direction`."],
          [6, "Same idea for \"take\"."],
          [8, "`|` means either pattern."],
          [10, "Wildcard: anything else."],
        ],
      },
      mistakes: [
        { title: "Capturing instead of comparing", body: "`case LIMIT:` with a plain name captures *any* value into `LIMIT`. Compare with literals (`case 10:`) or dotted names (`case Config.LIMIT:`)." },
        { title: "Putting `case _` first", body: "The wildcard matches everything, so cases after it never run." },
        { title: "Using match for ranges", body: "`match` compares patterns, not `<`/`>`. Use guards or an if/elif chain for ranges." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 2,
          code: r`for code in [200, 404, 500, 302]:
    match code:
        case 200:
            print("OK")
        case 404 | 410:
            print("Gone")
        case c if c >= 500:
            print("Server error", c)
        case _:
            print("Other")`,
          answer: "OK\nGone\nServer error 500\nOther\n",
          hint: "Cases are tried top to bottom; the guard only applies to its own case.",
          explain: "200 → OK; 404 matches `404 | 410`; 500 is captured as c and passes the guard; 302 falls through to the wildcard.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Add the catch-all case.",
          code: r`day = "Sun"
match day:
    case "Sat" | "Sun":
        print("weekend")
    case ___:
        print("weekday")`,
          blanks: [["_"]],
          output: "weekend\n",
          hint: "The wildcard pattern.",
          explain: "`case _:` matches anything and is the default branch.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "This should print `small` for 3, but prints `exactly limit`. Which line is the bug?",
          code: r`LIMIT = 10
n = 3
match n:
    case LIMIT:
        print("exactly limit")
    case _:
        print("small")`,
          line: 4,
          fix: r`LIMIT = 10
n = 3
match n:
    case 10:
        print("exactly limit")
    case _:
        print("small")`,
          output: "small\n",
          hint: "What does a bare name in a case pattern do?",
          explain: "`case LIMIT:` is a capture pattern: it matches anything and assigns it to LIMIT. Use the literal `10` (or a dotted constant like `Config.LIMIT`).",
        },
        {
          id: "m1", kind: "mcq", difficulty: 2,
          prompt: "Which problem suits `match` best?",
          options: [
            { text: "Grading marks into bands (90+, 75+, …)", why: "Ranges are easier with if/elif." },
            { text: "Handling menu choices \"1\", \"2\", \"3\", \"q\"", why: "Correct — one value against fixed options." },
            { text: "Checking if a number is between 1 and 100", why: "A single chained comparison is simplest." },
          ],
          answer: 1,
          hint: "match compares one value against fixed patterns.",
          explain: "Menu choices are fixed values — a natural fit for match-case.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Calculator menu", difficulty: 2,
          prompt: `Read two numbers \`a\` and \`b\` (whole numbers) and an operator (\`+\`, \`-\`, \`*\`, \`/\`) on three lines. Use \`match\` to print the result. For \`/\` print the float result, but if \`b\` is 0 print \`Cannot divide by zero\` (use a guard). For any other operator print \`Unknown operator\`.`,
          starter: r`a = int(input())
b = int(input())
op = input()
`,
          tests: [
            { label: "8 + 5", input: "8\n5\n+\n", output: "13" },
            { label: "7 / 2", input: "7\n2\n/\n", output: "3.5" },
            { label: "Divide by zero", input: "7\n0\n/\n", output: "Cannot divide by zero", hidden: true, category: "edge" },
            { label: "6 * 7", input: "6\n7\n*\n", output: "42", hidden: true },
            { label: "Unknown", input: "1\n2\n%\n", output: "Unknown operator", hidden: true, category: "edge" },
            { label: "3 - 9", input: "3\n9\n-\n", output: "-6", hidden: true },
          ],
          hints: [
            "Which value are you matching on?",
            "`match op:` with `case \"+\":`, `case \"-\":` and so on.",
            "For division by zero, put `case \"/\" if b == 0:` *before* `case \"/\":`.",
            "End with `case _: print(\"Unknown operator\")`.",
          ],
          solution: r`a = int(input())
b = int(input())
op = input()
match op:
    case "+":
        print(a + b)
    case "-":
        print(a - b)
    case "*":
        print(a * b)
    case "/" if b == 0:
        print("Cannot divide by zero")
    case "/":
        print(a / b)
    case _:
        print("Unknown operator")`,
          notes: "The guarded `/` case must come first; otherwise the plain `/` case would match and divide by zero.",
        },
        {
          id: "stretch", kind: "task", title: "Point patterns", difficulty: 4,
          prompt: `Read two integers \`x\` and \`y\` and build \`point = (x, y)\`. Use \`match point\` with **tuple patterns** to print:

- \`origin\` for (0, 0)
- \`on x-axis at X\` for (X, 0)
- \`on y-axis at Y\` for (0, Y)
- \`on diagonal\` when x == y (use a guard)
- otherwise \`at (X, Y)\``,
          starter: r`x = int(input())
y = int(input())
point = (x, y)
`,
          tests: [
            { label: "(0, 0)", input: "0\n0\n", output: "origin" },
            { label: "(4, 0)", input: "4\n0\n", output: "on x-axis at 4" },
            { label: "(0, -2)", input: "0\n-2\n", output: "on y-axis at -2", hidden: true },
            { label: "(3, 3)", input: "3\n3\n", output: "on diagonal", hidden: true },
            { label: "(2, 5)", input: "2\n5\n", output: "at (2, 5)", hidden: true },
          ],
          hints: [
            "A pattern like `(0, 0)` matches exact values; `(px, 0)` captures the first item.",
            "Order matters: origin before the axes, axes before the general case.",
            "Diagonal: `case (px, py) if px == py:`.",
            "General case: `case (px, py): print(f\"at ({px}, {py})\")`.",
          ],
          solution: r`x = int(input())
y = int(input())
point = (x, y)
match point:
    case (0, 0):
        print("origin")
    case (px, 0):
        print(f"on x-axis at {px}")
    case (0, py):
        print(f"on y-axis at {py}")
    case (px, py) if px == py:
        print("on diagonal")
    case (px, py):
        print(f"at ({px}, {py})")`,
          notes: "This is *structural* pattern matching: the patterns describe the shape of the data and pull values out of it. An if/elif version would need indexing (`point[0]`) everywhere.",
        },
      ],
      realWorld: "`match` shines in parsers, command-line tools, chat bots, and handling messages or JSON with different shapes (e.g. `case {\"type\": \"click\", \"x\": x, \"y\": y}:`).",
      reteach: "`match` is like sorting post into labelled pigeonholes: each `case` is a pigeonhole with a description (\"letters addressed to go + somewhere\"). The value goes into the first pigeonhole whose description fits, and you can read parts of the address (capture) on the way.",
      summary: [
        "`match value:` with `case pattern:` branches; first match wins (Python 3.10+).",
        "`|` for alternatives, `case x if cond:` for guards, `case _:` as the default.",
        "Patterns can match structure (tuples, lists, dicts) and capture parts; bare names capture, they don't compare.",
      ],
      cpp: {
        python: r`match op:
    case "+": print(a + b)
    case _: print("?")`,
        cpp: r`switch (op) {
    case '+': cout << a + b; break;
    default: cout << "?";
}`,
        note: "C++ `switch` works only on integers/characters and falls through without `break`. Python's `match` works on any value, never falls through, and can match structure.",
      },
    },
  ],
  exam: [
    {
      id: "e1", kind: "predict", difficulty: 3,
      code: r`n = 30
if n % 3 == 0:
    print("Fizz")
elif n % 15 == 0:
    print("FizzBuzz")
elif n % 5 == 0:
    print("Buzz")
else:
    print(n)`,
      answer: "Fizz\n",
      hint: "Which condition is checked first for 30 — and does a later one ever get a chance?",
      explain: "30 % 3 == 0 is checked first and is True, so \"Fizz\" is printed and the FizzBuzz branch is never reached. The most specific test (% 15) must come first.",
    },
    {
      id: "e2", kind: "mcq", difficulty: 2,
      prompt: "What does `x = 5` then `print(\"big\" if x > 10 else \"mid\" if x > 3 else \"small\")` print?",
      options: [
        { text: "big", why: "5 > 10 is False." },
        { text: "mid", why: "Correct — the second conditional expression picks \"mid\"." },
        { text: "small", why: "5 > 3 is True." },
      ],
      answer: 1,
      hint: "Read it as: \"big\" if x > 10, else (\"mid\" if x > 3 else \"small\").",
      explain: "Chained conditional expressions nest to the right. (Readable? Not very — prefer if/elif for three branches.)",
    },
    {
      id: "e3", kind: "fill", difficulty: 3,
      prompt: "Match two different strings in one case.",
      code: r`ans = "Y"
match ans:
    case "y" ___ "Y":
        print("yes")
    case _:
        print("no")`,
      blanks: [["|"]],
      output: "yes\n",
      hint: "The OR-pattern operator.",
      explain: "`case \"y\" | \"Y\":` matches either string.",
    },
    {
      id: "e4", kind: "bug", difficulty: 3,
      prompt: "For temperature 30 this prints `warm` but should print `hot`. Which line?",
      code: r`t = 30
if t > 15:
    print("warm")
elif t > 28:
    print("hot")
else:
    print("cold")`,
      line: 2,
      fix: r`t = 30
if t > 28:
    print("hot")
elif t > 15:
    print("warm")
else:
    print("cold")`,
      output: "hot\n",
      hint: "Is the first condition too broad?",
      explain: "`t > 15` is checked first and is true for 30. Test the narrower condition (`t > 28`) first.",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: BMI health advisor", difficulty: 3,
    prompt: `Read **weight** in kg and **height** in metres (decimals allowed). Compute BMI = weight / height², rounded to 1 decimal. Print:

\`\`\`
BMI: 22.9
Category: Normal
Advice: Keep it up!
\`\`\`

Categories (using the rounded BMI): below 18.5 **Underweight** (advice \`Eat a balanced, richer diet.\`), 18.5–24.9 **Normal** (\`Keep it up!\`), 25.0–29.9 **Overweight** (\`Add daily exercise.\`), 30 and above **Obese** (\`Talk to a doctor.\`).

If either input is zero or negative, print only \`Invalid input\`.`,
    starter: r`weight = float(input())
height = float(input())
`,
    tests: [
      { label: "70 kg, 1.75 m", input: "70\n1.75\n", output: "BMI: 22.9\nCategory: Normal\nAdvice: Keep it up!" },
      { label: "Underweight", input: "45\n1.70\n", output: "BMI: 15.6\nCategory: Underweight\nAdvice: Eat a balanced, richer diet.", hidden: true },
      { label: "Overweight", input: "85\n1.75\n", output: "BMI: 27.8\nCategory: Overweight\nAdvice: Add daily exercise.", hidden: true },
      { label: "Obese", input: "110\n1.70\n", output: "BMI: 38.1\nCategory: Obese\nAdvice: Talk to a doctor.", hidden: true },
      { label: "Invalid", input: "0\n1.7\n", output: "Invalid input", hidden: true, category: "edge" },
      { label: "Boundary 25.0", input: "76.5625\n1.75\n", output: "BMI: 25.0\nCategory: Overweight\nAdvice: Add daily exercise.", hidden: true, category: "boundary" },
    ],
    hints: [
      "Handle invalid input first (a guard clause).",
      "`bmi = round(weight / height ** 2, 1)`.",
      "Use an if/elif chain from lowest to highest: `< 18.5`, `< 25`, `< 30`, else.",
      "Set `category` and `advice` in each branch, then print the three lines once at the end.",
    ],
    solution: r`weight = float(input())
height = float(input())
if weight <= 0 or height <= 0:
    print("Invalid input")
else:
    bmi = round(weight / height ** 2, 1)
    if bmi < 18.5:
        category, advice = "Underweight", "Eat a balanced, richer diet."
    elif bmi < 25:
        category, advice = "Normal", "Keep it up!"
    elif bmi < 30:
        category, advice = "Overweight", "Add daily exercise."
    else:
        category, advice = "Obese", "Talk to a doctor."
    print("BMI:", bmi)
    print("Category:", category)
    print("Advice:", advice)`,
    notes: "A guard clause, an ordered elif chain with careful boundaries, and multiple assignment. (BMI is a rough screening number, not a diagnosis — real health apps say so.)",
  },
};
