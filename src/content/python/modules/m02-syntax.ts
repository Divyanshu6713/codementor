import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 2 — Python syntax and fundamentals. */
export const M02: PyModuleDef = {
  id: "py-syntax",
  number: 2,
  level: 1,
  title: "Python Syntax and Fundamentals",
  summary: "Indentation and blocks, comments and docstrings, names and variables, dynamic typing, input and output, escape sequences, and your first debugging habits.",
  track: "core",
  prereqs: ["py-intro"],
  lessons: [
    {
      id: "py-indentation-comments",
      title: "Indentation, blocks and comments",
      minutes: 14,
      difficulty: 1,
      objectives: [
        "Explain how indentation groups lines into a block",
        "Use a consistent 4-space indent and avoid IndentationError",
        "Write comments and docstrings that help readers",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 1,
        prompt: "In Python, what shows which lines belong inside an `if`?",
        options: [
          { text: "Curly braces `{ }`", why: "That's C, C++, Java and JavaScript. Python doesn't use braces for blocks." },
          { text: "The indentation (spaces at the start of the lines)", why: "Correct — indented lines after the colon form the block." },
          { text: "A semicolon at the end of each line", why: "Python doesn't need semicolons, and they don't mark blocks." },
        ],
        answer: 1,
        hint: "Look at how Python code is laid out on the page.",
        explain: "A line ending with `:` opens a block; every following line indented further belongs to it.",
      },
      why: "In Python, indentation is not decoration — it *is* the structure. Getting it right is the difference between a program that works and one that doesn't run at all. Clear comments make your code understandable to teammates (and to you, next month).",
      concept: [
        {
          title: "Blocks are made by indentation",
          body: `A line that ends with a **colon** \`:\` starts a **block**. The lines of the block are **indented** — by convention **4 spaces**. The block ends when the indentation goes back.

\`\`\`python
temperature = 31
if temperature > 30:
    print("It's hot")        # inside the if
    print("Drink water")     # inside the if
print("Have a good day")     # outside: always runs
\`\`\`

All lines in one block must be indented by **exactly the same amount**. Editors insert 4 spaces when you press Tab in a .py file.`,
        },
        {
          title: "Comments and docstrings",
          body: `- A **comment** starts with \`#\` and runs to the end of the line. Python ignores it.
- A **docstring** is a string written as the first line inside a file, function or class. It documents *what the thing does* and tools (like \`help()\`) can show it.

\`\`\`python
"""Tools for working out a canteen bill."""   # module docstring

# Prices are in rupees.
SAMOSA = 15
\`\`\`

Write comments that explain **why**. \`x = x + 1  # add one to x\` adds nothing; \`retries += 1  # the server sometimes drops the first request\` does.`,
        },
      ],
      example: {
        title: "A block in action",
        code: r`"""Decide whether to carry an umbrella."""
rain_chance = 70   # percent, from the weather app

if rain_chance > 50:
    print("Rain is likely.")
    print("Take an umbrella.")
print("Check done.")`,
        output: "Rain is likely.\nTake an umbrella.\nCheck done.\n",
        lines: [
          [1, "A docstring describing the whole program. It is a string, but on its own it does nothing when the program runs."],
          [2, "A variable and a comment explaining the unit."],
          [4, "The colon opens a block. The condition `70 > 50` is true, so the block runs."],
          [5, "Indented 4 spaces: part of the block."],
          [6, "Same indentation: still part of the block."],
          [7, "Back at the left edge: outside the block, so it runs whatever the condition was."],
        ],
      },
      mistakes: [
        { title: "Forgetting the colon", body: "`if x > 3` without `:` is a `SyntaxError: expected ':'`." },
        { title: "Indenting by different amounts", body: "Mixing 4 spaces and 2 spaces (or tabs and spaces) inside one block causes `IndentationError` or `TabError`. Pick 4 spaces and stick to it." },
        { title: "Indenting a line that isn't in a block", body: "An indented line with no `:` line above it gives `IndentationError: unexpected indent`." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 1,
          code: r`score = 40
if score >= 50:
    print("pass")
    print("well done")
print("finished")`,
          answer: "finished\n",
          hint: "Is 40 >= 50? Which lines belong to the block?",
          explain: "The condition is false, so both indented lines are skipped. The last line is outside the block and always runs.",
        },
        {
          id: "f1", kind: "fill", difficulty: 1,
          prompt: "Complete the line that opens the block.",
          code: r`age = 18
if age >= 18___
    print("You can vote")`,
          blanks: [[":"]],
          output: "You can vote\n",
          hint: "What character ends a line that starts a block?",
          explain: "Every line that opens a block — `if`, `for`, `while`, `def` … — ends with a colon.",
        },
        {
          id: "b1", kind: "bug", difficulty: 2,
          prompt: "This program crashes before printing anything. Which line is the problem?",
          code: r`marks = 82
if marks > 75:
    print("Distinction")
      print("Great work")`,
          line: 4,
          fix: r`marks = 82
if marks > 75:
    print("Distinction")
    print("Great work")`,
          output: "Distinction\nGreat work\n",
          hint: "Compare the spaces at the start of lines 3 and 4.",
          explain: "Line 4 is indented 6 spaces while line 3 uses 4. Lines in one block must line up exactly — `IndentationError: unexpected indent`.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 1,
          prompt: "Which comment is the most useful?",
          options: [
            { text: "`total = total + price  # add price to total`", why: "It just repeats the code in words." },
            { text: "`total = total * 1.18  # add 18% GST`", why: "Yes — it explains *why* the number 1.18 is there." },
            { text: "`total = 0  # total`", why: "Adds nothing the name doesn't already say." },
          ],
          answer: 1,
          hint: "Which one tells you something the code alone doesn't?",
          explain: "Good comments explain intent and meaning (like where a magic number comes from), not what the syntax already shows.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "debug", title: "Fix the broken block", difficulty: 1,
          prompt: `This program should print the three lines below, but it has indentation and colon problems. Fix it.

\`\`\`
Battery low
Plug in the charger
Status checked
\`\`\``,
          starter: r`battery = 12
if battery < 20
print("Battery low")
    print("Plug in the charger")
print("Status checked")`,
          tests: [{ label: "Prints all three lines", input: "", output: "Battery low\nPlug in the charger\nStatus checked" }],
          hints: [
            "Run it. What does Python's first error say?",
            "A block needs a colon on the opening line and the same indentation on every line inside it.",
            "Line 2 is missing `:`; line 3 belongs inside the block but isn't indented.",
            "Add `:` after `battery < 20`, and indent `print(\"Battery low\")` by 4 spaces to match the next line.",
          ],
          solution: r`battery = 12
if battery < 20:
    print("Battery low")
    print("Plug in the charger")
print("Status checked")`,
          notes: "Both block lines are indented by the same 4 spaces; the last line is outside the block so it always runs.",
        },
        {
          id: "stretch", kind: "task", title: "Document a tiny program", difficulty: 2,
          prompt: `Write a program that:

1. starts with a **docstring** \`"""Shows the area of a rectangle."""\`,
2. sets \`width = 7\` and \`height = 3\`,
3. if the area (\`width * height\`) is more than 20, prints \`Large: 21\` — i.e. \`Large:\` followed by the area — inside an \`if\` block,
4. and finally prints \`Done\` outside the block.

Then print the docstring itself as the very last line using \`print(__doc__)\`.

Expected output:

\`\`\`
Large: 21
Done
Shows the area of a rectangle.
\`\`\``,
          starter: r`width = 7
height = 3
`,
          tests: [{ label: "Prints the area, Done and the docstring", input: "", output: "Large: 21\nDone\nShows the area of a rectangle." }],
          hints: [
            "Where must a docstring go to be the program's docstring?",
            "The first statement of the file, written as a string, becomes `__doc__`.",
            "Put the docstring above `width = 7`; open the block with `if width * height > 20:`.",
            "`print(\"Large:\", width * height)` inside the block, then `print(\"Done\")` and `print(__doc__)` outside it.",
          ],
          solution: r`"""Shows the area of a rectangle."""
width = 7
height = 3
if width * height > 20:
    print("Large:", width * height)
print("Done")
print(__doc__)`,
          notes: "A string as the first statement of a module becomes its docstring, available as `__doc__`. Tools like `help()` and IDEs display it.",
        },
      ],
      realWorld: "Python's style guide, PEP 8, standardises 4-space indentation and docstring conventions, so code from different teams looks alike. Tools like Black and Ruff (Module 29) reformat code automatically to these rules.",
      reteach: "Think of indentation like the layout of a recipe: the steps under \"If the dough is sticky:\" are written indented, so you know they only apply in that case. Steps back at the margin apply to everyone. Python reads your layout the same way — so the layout must be exact.",
      summary: [
        "A line ending with `:` opens a block; the block is the following lines indented by the same amount (4 spaces).",
        "Wrong or inconsistent indentation is an `IndentationError` — the program doesn't run.",
        "`#` comments explain why; a first-line string is a docstring (`__doc__`).",
      ],
      cpp: {
        python: r`if x > 0:
    print("positive")
    print("done")`,
        cpp: r`if (x > 0) {
    cout << "positive\n";
    cout << "done\n";
}`,
        note: "C++ uses braces to group statements; indentation is only for readers. In Python indentation is the grouping.",
      },
    },

    {
      id: "py-variables",
      title: "Variables, names and dynamic typing",
      minutes: 16,
      difficulty: 1,
      objectives: [
        "Create and update variables, including several at once",
        "Choose valid, readable names and avoid keywords",
        "Explain dynamic typing and the convention for constants",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 1,
        prompt: "After `x = 5` and then `x = x + 2`, what is `x`?",
        options: [
          { text: "5", why: "The second line changes x." },
          { text: "7", why: "Right: the right side is worked out first (5 + 2), then stored in x." },
          { text: "An error: x can't equal x + 2", why: "`=` means *store*, not *is equal to*." },
        ],
        answer: 1,
        hint: "`=` stores the value on the right into the name on the left.",
        explain: "Assignment evaluates the right side using the current value (5 + 2 = 7) and then rebinds the name.",
      },
      why: "Variables let a program remember things: a score, a name, a running total. Good names make code read like a sentence; bad names hide bugs. Python's dynamic typing makes variables flexible — and you need to know where that flexibility can trip you up.",
      concept: [
        {
          title: "Assignment: a name for a value",
          body: `\`\`\`python
city = "Dharwad"
population = 600000
population = population + 1500    # update
\`\`\`

\`=\` is **assignment**: work out the right side, then make the name on the left refer to it. A name must be assigned before you use it, or you get \`NameError\`.

Several names at once:

\`\`\`python
x, y, z = 1, 2, 3        # multiple assignment
a = b = 0                # both names refer to 0
x, y = y, x              # swap in one line
\`\`\``,
        },
        {
          title: "Rules and conventions for names",
          body: `**Rules** (break them and it's a SyntaxError): letters, digits and \`_\`; can't start with a digit; can't be a **keyword** like \`if\`, \`for\`, \`class\`, \`True\`, \`None\`. Names are case-sensitive: \`total\` and \`Total\` are different.

**Conventions** (PEP 8):

| Kind | Style | Example |
| --- | --- | --- |
| variables, functions | snake_case | \`max_speed\` |
| constants | UPPER_CASE | \`GST_RATE = 0.18\` |
| classes | CapWords | \`StudentRecord\` |

Python has no real constants — \`UPPER_CASE\` is a promise to readers: *don't change this*.

Avoid using built-in names like \`list\`, \`str\`, \`sum\` or \`print\` as variables: it hides the built-in.`,
        },
        {
          title: "Dynamic typing",
          body: `In Python a **value** has a type; a **name** doesn't. The same name can later refer to a value of another type:

\`\`\`python
data = 42          # an int
data = "forty-two" # now a str
\`\`\`

This is **dynamic typing**. It is convenient, but a mix-up only shows when that line runs (for example adding a number to text). \`type(x)\` tells you what you have right now.`,
        },
      ],
      example: {
        title: "A shopping total",
        code: r`GST_RATE = 0.18
item, price = "notebook", 60
quantity = 3
subtotal = price * quantity
total = subtotal + subtotal * GST_RATE
print(item, quantity, subtotal, total)
quantity, price = price, quantity
print(quantity, price)`,
        output: "notebook 3 180 212.4\n60 3\n",
        lines: [
          [1, "A constant by convention (UPPER_CASE): the tax rate."],
          [2, "Multiple assignment: `item` gets \"notebook\", `price` gets 60."],
          [4, "The right side is computed (60 * 3 = 180) then stored as `subtotal`."],
          [5, "180 + 180 * 0.18 = 212.4 — a float, because 0.18 is a float."],
          [7, "Swap: both right-side values are read first, then assigned — no temporary variable needed."],
          [8, "The two values have swapped."],
        ],
      },
      mistakes: [
        { title: "Using a name before assigning it", body: "`print(total)` before `total = ...` raises `NameError: name 'total' is not defined`. Order matters." },
        { title: "Shadowing built-ins", body: "`sum = 10` then later `sum([1, 2])` fails: `TypeError: 'int' object is not callable`, because `sum` now means 10." },
        { title: "Confusing = and ==", body: "`=` stores a value; `==` compares two values. `if x = 5:` is a SyntaxError." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 1,
          code: r`a = 4
b = a
a = 10
print(a, b)`,
          answer: "10 4\n",
          hint: "When `b = a` runs, what value does `a` refer to?",
          explain: "`b = a` makes `b` refer to 4. Later `a` is re-assigned to 10; `b` still refers to 4.",
        },
        {
          id: "p2", kind: "predict", difficulty: 2,
          code: r`x, y = 3, 8
x, y = y, x + y
print(x, y)`,
          answer: "8 11\n",
          hint: "The whole right side is evaluated before anything is assigned.",
          explain: "The right side uses the *old* values: `y` is 8 and `x + y` is 3 + 8 = 11. Then x = 8, y = 11.",
        },
        {
          id: "f1", kind: "fill", difficulty: 1,
          prompt: "Swap the two values in one line.",
          code: r`left, right = "L", "R"
left, right = ___, ___
print(left, right)`,
          blanks: [["right"], ["left"]],
          output: "R L\n",
          hint: "Write the names on the right in the opposite order.",
          explain: "`left, right = right, left` reads both values first, then assigns them crosswise.",
        },
        {
          id: "b1", kind: "bug", difficulty: 2,
          prompt: "Which line causes the error when this runs?",
          code: r`price = 50
sum = price + 20
print(sum)
print(sum([1, 2, 3]))`,
          line: 2,
          fix: r`price = 50
total = price + 20
print(total)
print(sum([1, 2, 3]))`,
          output: "70\n6\n",
          hint: "The crash happens on line 4, but the cause is earlier.",
          explain: "Line 2 makes the name `sum` refer to the number 70, hiding the built-in `sum` function. Line 4 then tries to call 70. Rename the variable.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 1,
          prompt: "Which is a valid variable name?",
          options: [
            { text: "`2nd_place`", why: "Names can't start with a digit." },
            { text: "`class`", why: "`class` is a keyword." },
            { text: "`second_place`", why: "Correct — letters and underscores, snake_case." },
            { text: "`second-place`", why: "`-` is minus: Python reads it as `second - place`." },
          ],
          answer: 2,
          hint: "Check the rules: letters, digits, underscores, not starting with a digit, not a keyword.",
          explain: "`second_place` follows every rule and the snake_case convention.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Exam marks summary", difficulty: 1,
          prompt: `Create the variables \`maths = 78\`, \`science = 85\` and \`english = 91\` (use **one** multiple-assignment line), then print:

\`\`\`
Total: 254
Maths and English swapped: 91 78
\`\`\`

For the second line, swap \`maths\` and \`english\` with a one-line swap and print them.`,
          starter: r`# assign the three marks on one line

`,
          tests: [{ label: "Total and swap", input: "", output: "Total: 254\nMaths and English swapped: 91 78" }],
          hints: [
            "How can one line assign three names?",
            "`a, b, c = 1, 2, 3` assigns left to right.",
            "Total is `maths + science + english`. The swap is `maths, english = english, maths`.",
            "Print with `print(\"Total:\", ...)` and `print(\"Maths and English swapped:\", maths, english)`.",
          ],
          solution: r`maths, science, english = 78, 85, 91
print("Total:", maths + science + english)
maths, english = english, maths
print("Maths and English swapped:", maths, english)`,
          notes: "Multiple assignment and swapping both rely on Python evaluating the whole right side first.",
        },
        {
          id: "stretch", kind: "task", title: "Watch a name change type", difficulty: 2,
          prompt: `Assign \`value = 7\` and print its type name; then assign \`value = "seven"\` and print its type name; then \`value = 7.0\` and print its type name. Use \`type(value).__name__\`.

Expected:

\`\`\`
int
str
float
\`\`\``,
          starter: r`value = 7
`,
          tests: [{ label: "Prints the three type names", input: "", output: "int\nstr\nfloat" }],
          hints: [
            "Which function tells you a value's type?",
            "`type(x)` gives the type; `.__name__` gives its name as text.",
            "After each assignment, print `type(value).__name__`.",
            "Three pairs of lines: assign, then `print(type(value).__name__)`.",
          ],
          solution: r`value = 7
print(type(value).__name__)
value = "seven"
print(type(value).__name__)
value = 7.0
print(type(value).__name__)`,
          notes: "The name `value` has no fixed type: each assignment points it at a new value, and `type()` reports the value's type. This is dynamic typing.",
        },
      ],
      realWorld: "Readable names are the cheapest documentation there is. Code review at most companies will flag names like `x2`, `temp` or `data1` in real code — and constants in UPPER_CASE make configuration values (tax rates, limits, URLs) easy to find.",
      reteach: "Picture variables as **labels on strings tied to boxes**. `x = 5` ties the label `x` to a box holding 5. `x = \"hi\"` unties the label and ties it to a new box holding \"hi\". The label never had a type — the boxes do. `b = a` ties a second label to the *same* box `a` points at right now.",
      summary: [
        "`name = value` evaluates the right side, then binds the name; names must be assigned before use.",
        "Multiple assignment `a, b = 1, 2` and swap `a, b = b, a` evaluate the right side first.",
        "Names: snake_case for variables, UPPER_CASE for constants; never use keywords or shadow built-ins.",
        "Python is dynamically typed: values have types, names don't (`type(x)` shows it).",
      ],
      cpp: {
        python: r`count = 3
count = "three"   # fine in Python`,
        cpp: r`int count = 3;
// count = "three";   // compile error: count is an int`,
        note: "C++ variables have a declared, fixed type checked at compile time. Python names can be re-bound to any type at run time.",
      },
    },

    {
      id: "py-input-output",
      title: "Input, output and escape sequences",
      minutes: 16,
      difficulty: 1,
      objectives: [
        "Read text with `input()` and convert it to numbers",
        "Format output with commas, `sep`, `end` and f-strings",
        "Use escape sequences like `\\n`, `\\t`, `\\\\` and quotes inside strings",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 1,
        prompt: "The user types `5`. What is `input()` returned as?",
        options: [
          { text: "The integer 5", why: "`input()` never converts — it always returns text." },
          { text: "The string \"5\"", why: "Correct. You must convert it with `int(...)` to do maths." },
          { text: "It depends on what the user types", why: "No — it's always a `str`." },
        ],
        answer: 1,
        hint: "Keyboards produce characters…",
        explain: "`input()` always returns a `str`. `int(input())` turns digits into a number.",
      },
      why: "Programs become useful when they react to their user: a calculator needs numbers, a quiz needs answers. Almost every exercise in this course reads input and prints output, and many real bugs come from forgetting that input is text.",
      concept: [
        {
          title: "Reading input",
          body: `\`input()\` waits for one line of input and returns it as a **string** (without the Enter).

\`\`\`python
name = input()            # "Asha"
age = int(input())        # "15" -> 15
height = float(input())   # "1.62" -> 1.62
\`\`\`

\`input("Prompt: ")\` shows a prompt first. In CodeMentor, whatever you type in the **Input** box is what \`input()\` reads, one line per call. (Exercises here usually read without a prompt, because the prompt text would become part of the output.)

Several numbers on one line: \`a, b = map(int, input().split())\` — you'll understand every piece of that by Module 13.`,
        },
        {
          title: "Formatting output with f-strings",
          body: `An **f-string** puts values straight into text: write \`f\` before the quote and put expressions in \`{ }\`:

\`\`\`python
name, marks = "Ravi", 87.456
print(f"{name} scored {marks}")          # Ravi scored 87.456
print(f"{name} scored {marks:.1f}")      # Ravi scored 87.5
print(f"{name:>8}|")                     # '    Ravi|' (right-aligned in 8)
\`\`\`

\`:.2f\` = 2 decimal places, \`:>8\` = right-align in 8 characters, \`:,\` = thousands separators. Module 7 covers formatting in depth.`,
        },
        {
          title: "Escape sequences",
          body: `A backslash inside a string starts an **escape sequence**:

| Write | Means |
| --- | --- |
| \`\\n\` | new line |
| \`\\t\` | tab |
| \`\\\\\` | one backslash |
| \`\\"\` or \`\\'\` | a quote inside a string |

A **raw string** \`r"C:\\new"\` treats backslashes literally — handy for Windows paths and regular expressions.`,
        },
      ],
      example: {
        title: "Greeting with input",
        code: r`name = input()
year = int(input())
age = 2026 - year
print(f"Hi {name}!\nYou turn {age} this year.")
print("Path:\tC:\\Users\\" + name)`,
        input: "Meera\n2010\n",
        output: "Hi Meera!\nYou turn 16 this year.\nPath:\tC:\\Users\\Meera\n",
        lines: [
          [1, "Reads the first line of input: \"Meera\" (a str)."],
          [2, "Reads \"2010\" and converts it to the int 2010 so we can subtract."],
          [3, "Integer arithmetic: 2026 - 2010 = 16."],
          [4, "An f-string with two values inside, and `\\n` to break the line."],
          [5, "`\\t` is a tab; `\\\\` prints a single backslash. `+` joins strings."],
        ],
      },
      mistakes: [
        { title: "Doing maths on input text", body: "`input() + 1` raises `TypeError` and `input() * 2` repeats the text (\"55\"). Convert first: `int(input())`." },
        { title: "Forgetting the f", body: "`print(\"Hi {name}\")` prints the braces literally. It must be `f\"Hi {name}\"`." },
        { title: "Backslashes in paths", body: "`\"C:\\new\\table\"` contains `\\n` and `\\t`! Use `\\\\` or a raw string `r\"C:\\new\\table\"`." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 1,
          prompt: "The input is `4` and then `6`. What is printed?",
          code: r`a = input()
b = input()
print(a + b)
print(int(a) + int(b))`,
          input: "4\n6\n",
          answer: "46\n10\n",
          hint: "What does `+` do with two strings?",
          explain: "`a` and `b` are strings, so `a + b` joins them: \"46\". After `int()` conversion, `+` adds: 10.",
        },
        {
          id: "p2", kind: "predict", difficulty: 2,
          prompt: "What does this print? (Type a space where a tab is printed.)",
          code: r`print("one\ttwo")
print("a\\b")
print('It\'s ok')`,
          answer: "one\ttwo\na\\b\nIt's ok\n",
          hint: "`\\t` is a tab, `\\\\` is one backslash, `\\'` is a quote.",
          explain: "The tab character sits between *one* and *two*; `\\\\` prints one backslash; `\\'` puts an apostrophe inside single quotes.",
        },
        {
          id: "f1", kind: "fill", difficulty: 1,
          prompt: "Print the price with exactly two decimal places: `Price: 49.50`.",
          code: r`price = 49.5
print(f"Price: {price:___}")`,
          blanks: [[".2f"]],
          output: "Price: 49.50\n",
          hint: "The format spec for 2 decimal places of a float.",
          explain: "`:.2f` formats a number as fixed-point with 2 digits after the decimal point.",
        },
        {
          id: "b1", kind: "bug", difficulty: 2,
          prompt: "With input `3`, this should print `9` but crashes. Which line is wrong?",
          code: r`side = input()
area = side * side
print(area)`,
          input: "3\n",
          line: 1,
          fix: r`side = int(input())
area = side * side
print(area)`,
          output: "9\n",
          hint: "What type is `side`?",
          explain: "`side` is the string \"3\"; `\"3\" * \"3\"` is a `TypeError`. Converting on line 1 with `int(...)` fixes it.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Rectangle calculator", difficulty: 1,
          prompt: `Read two whole numbers, the **length** and the **width** (one per line), and print:

\`\`\`
Area: 24
Perimeter: 20
\`\`\`

(for input 6 and 4).`,
          starter: r`length = input()
width = input()
`,
          tests: [
            { label: "6 by 4", input: "6\n4\n", output: "Area: 24\nPerimeter: 20" },
            { label: "Square 5 by 5", input: "5\n5\n", output: "Area: 25\nPerimeter: 20", hidden: true },
            { label: "1 by 100", input: "1\n100\n", output: "Area: 100\nPerimeter: 202", hidden: true, category: "boundary" },
          ],
          hints: [
            "What type does `input()` give you, and what type do you need for maths?",
            "Wrap each `input()` in `int(...)`.",
            "Area is `length * width`; perimeter is `2 * (length + width)`.",
            "`print(\"Area:\", length * width)` and `print(\"Perimeter:\", 2 * (length + width))`.",
          ],
          solution: r`length = int(input())
width = int(input())
print("Area:", length * width)
print("Perimeter:", 2 * (length + width))`,
          notes: "Converting at the moment you read input keeps the rest of the program simple: from then on they're numbers.",
        },
        {
          id: "stretch", kind: "task", title: "A neat bill line", difficulty: 2,
          prompt: `Read an item name (text) and a price (a decimal number). Print one line with the name, a tab, then the price with **2 decimals** and the rupee label, like:

\`\`\`
Chai	Rs 12.50
\`\`\`

(for input \`Chai\` and \`12.5\`). Use an f-string and \`\\t\`.`,
          starter: r`item = input()
`,
          tests: [
            { label: "Chai", input: "Chai\n12.5\n", output: "Chai\tRs 12.50" },
            { label: "Vada pav", input: "Vada pav\n20\n", output: "Vada pav\tRs 20.00", hidden: true },
            { label: "Rounding", input: "Lassi\n35.456\n", output: "Lassi\tRs 35.46", hidden: true, category: "edge" },
          ],
          compare: "lines",
          hints: [
            "The price may have decimals — which conversion keeps them?",
            "`float(input())` reads a decimal number.",
            "In an f-string, `{price:.2f}` shows exactly 2 decimals; `\\t` is a tab.",
            "`print(f\"{item}\\tRs {price:.2f}\")`.",
          ],
          solution: r`item = input()
price = float(input())
print(f"{item}\tRs {price:.2f}")`,
          notes: "`:.2f` rounds to two decimal places for display (35.456 shows as 35.46) without changing the stored value.",
        },
      ],
      realWorld: "Command-line tools, data-entry scripts and every competitive-programming problem read input and print formatted output. f-strings are the modern standard in professional Python code for building messages, logs and reports.",
      reteach: "Think of `input()` as a letterbox: whatever arrives is always a **piece of paper with writing on it** (a string) — even if the writing is `42`. To do maths you have to read the number off the paper: `int(...)`. And `print` is the reverse: it writes values onto paper for the user, and f-strings let you fill in the blanks of a form letter.",
      summary: [
        "`input()` returns a `str`; convert with `int()` or `float()` before doing maths.",
        "f-strings: `f\"{value}\"`, with format specs like `:.2f` and `:>8`.",
        "Escape sequences: `\\n` newline, `\\t` tab, `\\\\` backslash, `\\'` / `\\\"` quotes; raw strings `r\"...\"` keep backslashes.",
      ],
      cpp: {
        python: r`n = int(input())
print(f"Double: {n * 2}")`,
        cpp: r`int n;
cin >> n;
cout << "Double: " << n * 2 << endl;`,
        note: "`cin >> n` converts to the variable's type automatically. Python's `input()` always gives text, so you convert explicitly.",
      },
    },

    {
      id: "py-debugging-basics",
      title: "Basic debugging",
      minutes: 15,
      difficulty: 2,
      objectives: [
        "Read a traceback to find the error type and the failing line",
        "Use print debugging and `repr()` to see what values really are",
        "Fix the most common beginner errors systematically",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 1,
        prompt: "Where is the most useful information in a Python traceback?",
        options: [
          { text: "The first line: `Traceback (most recent call last):`", why: "That line is the same for every traceback." },
          { text: "The last line, and the `File \"...\", line N` just above it", why: "Correct — the error type and message, and where it happened." },
          { text: "Somewhere in the middle", why: "The middle shows the path through calls; the key facts are at the bottom." },
        ],
        answer: 1,
        hint: "Tracebacks are read bottom-up.",
        explain: "The last line names the exception and explains it; the line above points to your code.",
      },
      why: "Every programmer spends a large share of their time debugging. The difference between a beginner and an expert isn't making fewer mistakes — it's finding them quickly. A calm, step-by-step method beats guessing every time.",
      concept: [
        {
          title: "Read the error first",
          body: `\`\`\`
Traceback (most recent call last):
  File "main.py", line 3, in <module>
    total = count + "5"
            ~~~~~~^~~~~
TypeError: unsupported operand type(s) for +: 'int' and 'str'
\`\`\`

1. **Last line**: the type (\`TypeError\`) and the message.
2. **The line above**: where — \`main.py\`, line 3, with a marker under the problem.
3. Ask: *what are the values on that line, really?*

| Error | Usually means |
| --- | --- |
| \`SyntaxError\` | grammar: missing \`:\`, bracket, quote or comma |
| \`IndentationError\` | spaces at the start of lines don't line up |
| \`NameError\` | typo, or used before it was assigned |
| \`TypeError\` | wrong type for this operation (often a str from input) |
| \`ValueError\` | right type, bad value: \`int("abc")\` |
| \`ZeroDivisionError\` | divided by 0 |`,
        },
        {
          title: "Print debugging and repr()",
          body: `When the output is wrong but there's no error, **look at the values**. Add temporary prints:

\`\`\`python
print("DEBUG total =", repr(total), type(total))
\`\`\`

\`repr()\` shows a value the way Python sees it — \`'5'\` (a string, with quotes) versus \`5\` (a number); \`'hi '\` reveals a trailing space. Remove debug prints when you're done.

A good loop: **reproduce** the problem with a small input → **read** the error → **form a guess** → **test** one change at a time. In CodeMentor, **Step through** shows every variable after every line, which is print debugging done for you.`,
        },
      ],
      example: {
        title: "Finding a hidden string",
        code: r`a = "7"
b = 3
print("DEBUG", repr(a), repr(b))
print("DEBUG", type(a).__name__, type(b).__name__)
print(int(a) * b)`,
        output: "DEBUG '7' 3\nDEBUG str int\n21\n",
        lines: [
          [1, "`a` looks like a number but is a string (as if it came from `input()`)."],
          [3, "`repr` shows quotes around strings — the clue that `a` is text."],
          [4, "The type names confirm it: `str` and `int`."],
          [5, "Fixed: convert before multiplying. Without `int`, `\"7\" * 3` would print `777`."],
        ],
      },
      mistakes: [
        { title: "Changing many things at once", body: "If you change five lines and it works (or breaks differently), you don't know which change mattered. Change one thing, run, observe." },
        { title: "Ignoring the line number", body: "The line Python reports is where the error was *detected*. For syntax errors, the real mistake is often on the line before (an unclosed bracket)." },
        { title: "Leaving debug prints in", body: "Debug output in an exercise makes the tests fail. Remove them — or use the Step through tool instead." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 2,
          code: r`x = "5"
print(repr(x), repr(int(x)))
print(x * 2, int(x) * 2)`,
          answer: "'5' 5\n55 10\n",
          hint: "`repr` shows strings with quotes; `*` repeats strings.",
          explain: "`repr('5')` is `'5'` (with quotes), `repr(5)` is `5`. A string times 2 repeats it: \"55\"; the int times 2 is 10.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Show exactly what `name` contains, including the invisible trailing space.",
          code: r`name = "Ravi "
print(___(name))`,
          blanks: [["repr"]],
          output: "'Ravi '\n",
          hint: "Which built-in shows a value the way Python sees it?",
          explain: "`repr(name)` prints `'Ravi '` — the quotes make the trailing space visible.",
        },
        {
          id: "b1", kind: "bug", difficulty: 2,
          prompt: "Python reports a `SyntaxError` on line 3. Which line actually contains the mistake?",
          code: r`width = 4
height = (2 + 3
area = width * height
print(area)`,
          line: 2,
          fix: r`width = 4
height = (2 + 3)
area = width * height
print(area)`,
          output: "20\n",
          hint: "Look for something opened but never closed.",
          explain: "The bracket opened on line 2 is never closed, so Python keeps reading into line 3 and complains there. The fix is on line 2.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 2,
          prompt: "`int(input())` crashes with `ValueError: invalid literal for int() with base 10: '3.5'`. What happened?",
          options: [
            { text: "The input was a decimal number, which `int()` can't parse from text", why: "Correct — use `float()` for decimals." },
            { text: "`input()` is broken", why: "It worked: it returned the text '3.5'." },
            { text: "You can't convert strings to numbers", why: "You can — `int('3')` works; '3.5' just isn't a whole number." },
          ],
          answer: 0,
          hint: "Read the message: what value did `int()` receive?",
          explain: "`int()` only accepts text of a whole number. For '3.5' use `float()` (or `int(float(...))` if you really want to cut off the decimals).",
        },
      ],
      exercises: [
        {
          id: "task", kind: "debug", title: "Fix the average calculator", difficulty: 2,
          prompt: `This program should read three whole-number marks and print their **total** and **average** (to 1 decimal place):

\`\`\`
Total: 240
Average: 80.0
\`\`\`

It has **three** bugs. Run it, read each error, and fix them one at a time.`,
          starter: r`m1 = int(input())
m2 = int(input()
m3 = input()
total = m1 + m2 + m3
print("Total:", totl)
print(f"Average: {total / 3:.1f}")`,
          tests: [
            { label: "70, 80, 90", input: "70\n80\n90\n", output: "Total: 240\nAverage: 80.0" },
            { label: "Uneven", input: "50\n60\n65\n", output: "Total: 175\nAverage: 58.3", hidden: true },
          ],
          hints: [
            "Run it. The first error is a syntax error — which bracket is missing?",
            "Fix one error, run again, read the next error.",
            "Line 2 is missing `)`. Line 3 forgets to convert. Line 5 has a typo in the name.",
            "`m2 = int(input())`, `m3 = int(input())`, and `print(\"Total:\", total)`.",
          ],
          solution: r`m1 = int(input())
m2 = int(input())
m3 = int(input())
total = m1 + m2 + m3
print("Total:", total)
print(f"Average: {total / 3:.1f}")`,
          notes: "Three classic errors in one program: SyntaxError (bracket), TypeError (str + int), NameError (typo). Fixing them one at a time, rerunning after each, is the reliable method.",
        },
        {
          id: "stretch", kind: "debug", title: "Wrong answer, no error", difficulty: 3,
          prompt: `This program reads a price and a quantity and should print the cost. For input \`12\` and \`3\` it prints \`121212\` instead of \`Cost: 36\`. No error is shown!

Find the bug (use \`repr()\` or **Step through** to look at the values) and make it print:

\`\`\`
Cost: 36
\`\`\``,
          starter: r`price = input()
quantity = int(input())
cost = price * quantity
print("Cost:", cost)`,
          tests: [
            { label: "12 x 3", input: "12\n3\n", output: "Cost: 36" },
            { label: "7 x 1", input: "7\n1\n", output: "Cost: 7", hidden: true },
            { label: "Zero quantity", input: "99\n0\n", output: "Cost: 0", hidden: true, category: "edge" },
          ],
          hints: [
            "`121212` looks like \"12\" written three times. When does `*` repeat things?",
            "A string times an int repeats the string.",
            "`price` is never converted from text.",
            "Change line 1 to `price = int(input())`.",
          ],
          solution: r`price = int(input())
quantity = int(input())
cost = price * quantity
print("Cost:", cost)`,
          notes: "This is the most dangerous kind of bug: the program runs and prints something plausible. Checking types with `repr()`/`type()` — or stepping through — exposes it.",
        },
      ],
      realWorld: "Professional developers use debuggers (Python's `pdb`, VS Code's debugger) that let you pause and inspect variables — the same idea as CodeMentor's Step through. Logs in production systems are print debugging at scale (Module 21: logging).",
      reteach: "Debugging is detective work. The traceback is the witness statement: *what* happened (last line) and *where* (the line above). `repr()` and Step through are your magnifying glass for looking at the evidence — the actual values. Don't accuse a suspect (change code) until the evidence points there.",
      summary: [
        "Read tracebacks bottom-up: error type and message, then `File \"main.py\", line N`.",
        "Common errors: SyntaxError, IndentationError, NameError, TypeError, ValueError, ZeroDivisionError.",
        "Look at real values with `print(repr(x), type(x))` or Step through; change one thing at a time.",
      ],
    },
  ],
  exam: [
    {
      id: "e1", kind: "predict", difficulty: 2,
      prompt: "The input is `10`. What is printed?",
      code: r`n = input()
print(n * 2)
print(int(n) * 2)`,
      input: "10\n",
      answer: "1010\n20\n",
      hint: "What type does `input()` return?",
      explain: "`n` is the string \"10\": times 2 repeats it. After `int()`, it's arithmetic: 20.",
    },
    {
      id: "e2", kind: "mcq", difficulty: 2,
      prompt: "What does this print?\n\n`a, b = 2, 5` then `a, b = b, a * b` then `print(a, b)`",
      options: [
        { text: "`5 10`", why: "Correct: the right side uses the old values: b = 5, a * b = 10." },
        { text: "`5 25`", why: "That would use the new a (5). The right side is evaluated before assigning." },
        { text: "`2 10`", why: "a does change, to the old b." },
      ],
      answer: 0,
      hint: "Evaluate the whole right side first.",
      explain: "Right side: (5, 2 * 5) = (5, 10). Then a = 5, b = 10.",
    },
    {
      id: "e3", kind: "fill", difficulty: 2,
      prompt: "Print `Total: 1,250.50` (thousands separator and 2 decimals).",
      code: r`total = 1250.5
print(f"Total: {total:___}")`,
      blanks: [[",.2f"]],
      output: "Total: 1,250.50\n",
      hint: "Combine the thousands separator with fixed 2 decimals.",
      explain: "`:,.2f` adds a comma every three digits and shows two decimal places.",
    },
    {
      id: "e4", kind: "bug", difficulty: 2,
      prompt: "Which line makes this program fail to run?",
      code: r`count = 3
if count > 2:
    print("many")
  print("checked")`,
      line: 4,
      fix: r`count = 3
if count > 2:
    print("many")
print("checked")`,
      output: "many\nchecked\n",
      hint: "Look at the indentation of the last line.",
      explain: "Line 4 is indented 2 spaces, which matches no block level — `IndentationError: unindent does not match any outer indentation level`.",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: student ID card", difficulty: 2,
    prompt: `Read a student's **name**, **year of birth** and **class section** (three lines). Print an ID card exactly like this (for input \`Kiran\`, \`2009\`, \`11-B\`):

\`\`\`
+----------------------+
| Name:    Kiran
| Age:     17 (in 2026)
| Section: 11-B
+----------------------+
\`\`\`

The border is \`+\`, 22 dashes, \`+\`. Each middle line starts with \`| \` and the labels are padded so the values line up (use the spacing shown). Compute the age as \`2026 - year\`.`,
    starter: r`# Read the three inputs, then print the card
`,
    tests: [
      { label: "Kiran", input: "Kiran\n2009\n11-B\n", output: "+----------------------+\n| Name:    Kiran\n| Age:     17 (in 2026)\n| Section: 11-B\n+----------------------+" },
      { label: "Another student", input: "Zara Khan\n2012\n8-A\n", output: "+----------------------+\n| Name:    Zara Khan\n| Age:     14 (in 2026)\n| Section: 8-A\n+----------------------+", hidden: true },
    ],
    hints: [
      "Which input needs converting to a number?",
      "Store the border in a constant so you can print it twice.",
      "`\"+\" + \"-\" * 22 + \"+\"` builds the border.",
      "Use f-strings: `f\"| Name:    {name}\"`, `f\"| Age:     {2026 - year} (in 2026)\"`, `f\"| Section: {section}\"`.",
    ],
    solution: r`name = input()
year = int(input())
section = input()
BORDER = "+" + "-" * 22 + "+"
print(BORDER)
print(f"| Name:    {name}")
print(f"| Age:     {2026 - year} (in 2026)")
print(f"| Section: {section}")
print(BORDER)`,
    notes: "Input, conversion, a constant, string repetition and f-strings — the whole module in one small program.",
  },
};
