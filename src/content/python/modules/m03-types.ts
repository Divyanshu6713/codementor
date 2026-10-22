import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 3 — Data types and type conversion. */
export const M03: PyModuleDef = {
  id: "py-types",
  number: 3,
  level: 1,
  title: "Data Types and Type Conversion",
  summary: "Numbers (int, float, complex), strings, booleans and None; checking and converting types; truthy and falsy values; mutability, identity and equality; floating-point precision.",
  track: "core",
  prereqs: ["py-syntax"],
  lessons: [
    {
      id: "py-numbers",
      title: "Numbers: int, float and complex",
      minutes: 15,
      difficulty: 1,
      objectives: [
        "Tell `int`, `float` and `complex` values apart",
        "Predict the result type of arithmetic (`/` always gives a float)",
        "Explain why `0.1 + 0.2` isn't exactly `0.3` and compare floats safely",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 1,
        prompt: "What is `7 / 2` in Python 3?",
        options: [
          { text: "3", why: "That's `7 // 2` (floor division). Plain `/` keeps the fraction." },
          { text: "3.5", why: "Correct: `/` is true division and always returns a float." },
          { text: "An error", why: "Dividing integers is fine." },
        ],
        answer: 1,
        hint: "Python 3's `/` never throws the fraction away.",
        explain: "`/` always returns a float in Python 3; `//` is floor (whole-number) division.",
      },
      why: "Numbers are everywhere: prices, marks, coordinates, sensor readings. Knowing which number type you have tells you what results to expect — and why money calculations need special care.",
      concept: [
        {
          title: "Three kinds of numbers",
          body: `| Type | Examples | Notes |
| --- | --- | --- |
| \`int\` | \`42\`, \`-7\`, \`1_000_000\` | whole numbers of **any size** |
| \`float\` | \`3.14\`, \`-0.5\`, \`2e3\` (= 2000.0) | decimals, about 15–16 significant digits |
| \`complex\` | \`2 + 3j\` | real + imaginary part (used in engineering and science) |

Underscores in \`1_000_000\` are just for readability. Python's \`int\` never overflows: \`2 ** 100\` is computed exactly.`,
        },
        {
          title: "What type does arithmetic give?",
          body: `- \`int\` op \`int\` → \`int\` for \`+ - * // % **\` (non-negative powers)
- \`/\` → **always** \`float\`: \`6 / 3\` is \`2.0\`
- any \`float\` involved → \`float\`: \`2 + 1.5\` is \`3.5\`
- any \`complex\` involved → \`complex\`

\`\`\`python
print(type(10 / 5))   # <class 'float'>
print(10 // 3, 10 % 3) # 3 1
\`\`\``,
        },
        {
          title: "Floating-point precision",
          body: `Floats are stored in binary, and most decimal fractions (like 0.1) can't be stored exactly — just as 1/3 can't be written exactly in decimal.

\`\`\`python
print(0.1 + 0.2)          # 0.30000000000000004
print(0.1 + 0.2 == 0.3)   # False
\`\`\`

So: **never compare floats with \`==\`** — use \`math.isclose(a, b)\` or \`round()\`. For money, use whole paise as \`int\`, or the \`decimal\` module (Module 21).`,
        },
      ],
      example: {
        title: "Number types in action",
        code: r`import math
big = 2 ** 70
print(big)
print(9 / 3, type(9 / 3).__name__)
print(2 + 1.5, (1 + 2j) * 2)
print(0.1 + 0.2, math.isclose(0.1 + 0.2, 0.3))
print(round(2.675, 2), round(7.5), round(8.5))`,
        output: "1180591620717411303424\n3.0 float\n3.5 (2+4j)\n0.30000000000000004 True\n2.67 8 8\n",
        lines: [
          [1, "Imports the `math` module, which has `isclose` for comparing floats."],
          [2, "Integers can be huge: 2⁷⁰ is calculated exactly."],
          [4, "`/` returns a float even when the division is exact: 3.0."],
          [5, "Mixing int and float gives a float; complex numbers multiply like algebra."],
          [6, "The classic floating-point surprise — and the safe way to compare."],
          [7, "`round` uses *banker's rounding* (halves go to the even number: 8 and 8), and 2.675 is stored as slightly less than 2.675."],
        ],
      },
      mistakes: [
        { title: "Expecting `/` to give a whole number", body: "`10 / 2` is `5.0`. Use `//` when you want whole-number division (e.g. pages needed, teams of 4)." },
        { title: "Comparing floats with ==", body: "`0.1 * 3 == 0.3` is False. Use `math.isclose` or compare rounded values." },
        { title: "Writing commas in numbers", body: "`1,000` is not one thousand — it's a tuple `(1, 0)`. Use `1000` or `1_000`." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 1,
          code: r`print(8 / 4)
print(8 // 3)
print(2 ** 3 * 1.0)`,
          answer: "2.0\n2\n8.0\n",
          hint: "Which operators give a float?",
          explain: "`/` gives 2.0; `//` is floor division: 2; `8 * 1.0` is a float: 8.0.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Make the comparison safe so it prints `True`.",
          code: r`import math
print(math.___(0.1 * 3, 0.3))`,
          blanks: [["isclose"]],
          output: "True\n",
          hint: "A function in `math` that compares floats with a tolerance.",
          explain: "`math.isclose(a, b)` returns True when the two floats are equal within a small relative tolerance.",
        },
        {
          id: "b1", kind: "bug", difficulty: 2,
          prompt: "This should print `Teams: 5` for 23 players in teams of 4 (only full teams count). Which line is wrong?",
          code: r`players = 23
teams = players / 4
print("Teams:", teams)`,
          line: 2,
          fix: r`players = 23
teams = players // 4
print("Teams:", teams)`,
          output: "Teams: 5\n",
          hint: "What does `/` give for 23 / 4?",
          explain: "`/` gives 5.75. Only full teams count, so use floor division `//`, which gives 5.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 2,
          prompt: "Which type is `2e3`?",
          options: [
            { text: "int", why: "Scientific notation always makes a float." },
            { text: "float", why: "Correct — `2e3` is 2000.0." },
            { text: "str", why: "There are no quotes." },
          ],
          answer: 1,
          hint: "Scientific notation…",
          explain: "`2e3` means 2 × 10³ and is written as a float literal: 2000.0.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Bus trip planner", difficulty: 1,
          prompt: `Read the number of **students** and the number of **seats per bus** (whole numbers). Print how many **full buses** there are and how many **students are left over**, then the exact ratio as a float:

\`\`\`
Full buses: 3
Left over: 5
Exact: 3.125
\`\`\`

(for 125 students and 40 seats).`,
          starter: r`students = int(input())
seats = int(input())
`,
          tests: [
            { label: "125 students, 40 seats", input: "125\n40\n", output: "Full buses: 3\nLeft over: 5\nExact: 3.125" },
            { label: "Exactly full", input: "80\n40\n", output: "Full buses: 2\nLeft over: 0\nExact: 2.0", hidden: true, category: "boundary" },
            { label: "Fewer students than seats", input: "7\n50\n", output: "Full buses: 0\nLeft over: 7\nExact: 0.14", hidden: true, category: "edge" },
          ],
          hints: [
            "Which operator gives whole buses, which gives the leftover, which gives the exact ratio?",
            "`//` floor division, `%` remainder, `/` true division.",
            "students // seats, students % seats, students / seats.",
            "Print each with its label: `print(\"Full buses:\", students // seats)` and so on.",
          ],
          solution: r`students = int(input())
seats = int(input())
print("Full buses:", students // seats)
print("Left over:", students % seats)
print("Exact:", students / seats)`,
          notes: "`//` and `%` are a pair: `students == (students // seats) * seats + students % seats`. `/` always gives a float, even 2.0.",
        },
        {
          id: "stretch", kind: "task", title: "Rupees and paise without float errors", difficulty: 3,
          prompt: `Read two prices in **paise** as whole numbers (e.g. \`1999\` means Rs 19.99). Print their total in the format \`Rs 31.98\` using only integer arithmetic for the sum: rupees are \`total // 100\`, paise are \`total % 100\` shown with 2 digits.

For input \`1999\` and \`1199\` print \`Rs 31.98\`.`,
          starter: r`a = int(input())
b = int(input())
`,
          tests: [
            { label: "19.99 + 11.99", input: "1999\n1199\n", output: "Rs 31.98" },
            { label: "Paise under 10", input: "105\n100\n", output: "Rs 2.05", hidden: true, category: "edge" },
            { label: "Round rupees", input: "500\n500\n", output: "Rs 10.00", hidden: true },
          ],
          hints: [
            "Why store money as whole paise instead of floats?",
            "The total in paise is just `a + b`; rupees = total // 100, paise = total % 100.",
            "The paise part must always show 2 digits: 5 → \"05\".",
            "`print(f\"Rs {total // 100}.{total % 100:02d}\")`.",
          ],
          solution: r`a = int(input())
b = int(input())
total = a + b
print(f"Rs {total // 100}.{total % 100:02d}")`,
          notes: "Integers are exact, so storing money in the smallest unit avoids float surprises. `:02d` pads an integer to 2 digits with a leading zero.",
        },
      ],
      realWorld: "Banks and payment systems (UPI apps included) store amounts as integers in the smallest unit or use exact decimal types — a float rounding error repeated over millions of transactions is real money. Scientific code, on the other hand, embraces floats and checks results with tolerances.",
      reteach: "An `int` is like counting marbles: always exact. A `float` is like measuring with a ruler that has very fine but finite markings: 0.1 falls *between* two markings, so Python picks the nearest one. Usually invisible — until you add many of them or compare with ==.",
      summary: [
        "`int` (exact, unlimited size), `float` (decimal, ~15–16 digits), `complex` (`a + bj`).",
        "`/` always returns a float; `//` floor division and `%` remainder work as a pair.",
        "Floats are approximate: compare with `math.isclose`, keep money in integer paise or `Decimal`.",
      ],
      cpp: {
        python: r`print(7 / 2)    # 3.5
print(2 ** 100) # exact`,
        cpp: r`cout << 7 / 2;      // 3 (integer division!)
// 2^100 overflows every built-in integer type`,
        note: "In C++, `/` between two ints truncates; in Python 3 `/` always gives a float. Python ints never overflow; C++ ints have fixed sizes.",
      },
    },

    {
      id: "py-str-bool-none",
      title: "Strings, booleans and None",
      minutes: 14,
      difficulty: 1,
      objectives: [
        "Create strings with single, double and triple quotes",
        "Use booleans `True`/`False` and know they come from comparisons",
        "Explain what `None` means and check for it with `is None`",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 1,
        prompt: "What is `type(\"42\")`?",
        options: [
          { text: "int", why: "The quotes make it text." },
          { text: "str", why: "Correct — anything in quotes is a string." },
          { text: "bool", why: "Booleans are only True and False." },
        ],
        answer: 1,
        hint: "Look at the quotes.",
        explain: "Quotes always create a `str`, even if the characters are digits.",
      },
      why: "Text, yes/no answers and \"nothing yet\" are as common as numbers. Names, messages and file contents are strings; every decision a program makes is a boolean; and `None` is how Python says \"no value\" — for example when a search finds nothing.",
      concept: [
        {
          title: "Strings",
          body: `A **string** (\`str\`) is a sequence of characters. Single and double quotes are the same; pick the one that avoids escaping:

\`\`\`python
a = 'He said "hi"'
b = "It's fine"
c = """Line one
Line two"""          # triple quotes can span lines
\`\`\`

\`len(s)\` gives the number of characters; \`+\` joins strings; \`*\` repeats them. Module 7 is all about strings.`,
        },
        {
          title: "Booleans",
          body: `\`bool\` has exactly two values: \`True\` and \`False\` (capital letters!). They come from comparisons and logic:

\`\`\`python
is_adult = age >= 18
print(5 > 3, 5 == 3)     # True False
\`\`\`

\`bool\` is a subtype of \`int\`: \`True == 1\` and \`False == 0\`, so \`sum([True, True, False])\` counts the Trues: 2.`,
        },
        {
          title: "None — the absence of a value",
          body: `\`None\` is a special value meaning *nothing here*. Its type is \`NoneType\`.

\`\`\`python
result = None            # not calculated yet
print(print("hi"))       # print returns None
\`\`\`

Check for it with **\`is None\`** (not \`== None\`). Functions that don't \`return\` anything return \`None\`.`,
        },
      ],
      example: {
        title: "Text, truth and nothing",
        code: r`quote = 'She said "Python is fun"'
poem = """roses
are red"""
print(len(quote), quote)
print(poem)
passed = 72 >= 40
print(passed, type(passed).__name__, True + True)
winner = None
print(winner is None, type(winner).__name__)`,
        output: "24 She said \"Python is fun\"\nroses\nare red\nTrue bool 2\nTrue NoneType\n",
        lines: [
          [1, "Single quotes outside let us use double quotes inside freely."],
          [2, "Triple quotes keep the line break: the string spans two lines."],
          [4, "`len` counts characters, including spaces and quotes inside."],
          [6, "A comparison produces a bool. True + True is 2, because True behaves like 1."],
          [8, "`None` stands for 'no winner yet'. `is None` is the right way to test it."],
        ],
      },
      mistakes: [
        { title: "Lower-case true/false/none", body: "`true` is a NameError. The values are `True`, `False`, `None`." },
        { title: "Using == None", body: "Works in simple cases, but `is None` is correct and idiomatic — it checks identity with the one and only `None` object." },
        { title: "Quotes clashing", body: "`'It's'` ends the string at the apostrophe. Use `\"It's\"` or `'It\\'s'`." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 1,
          code: r`print(len("hi there"))
print("ab" * 3)
print(3 > 5, type(3 > 5).__name__)`,
          answer: "8\nababab\nFalse bool\n",
          hint: "Spaces count as characters.",
          explain: "\"hi there\" has 8 characters (including the space); `*` repeats; a comparison gives a bool.",
        },
        {
          id: "p2", kind: "predict", difficulty: 2,
          code: r`x = print("A")
print(x)`,
          answer: "A\nNone\n",
          hint: "What does `print` return?",
          explain: "`print(\"A\")` prints A and returns `None`, which is stored in x and then printed.",
        },
        {
          id: "f1", kind: "fill", difficulty: 1,
          prompt: "Test correctly whether no result was found.",
          code: r`result = None
if result ___ None:
    print("nothing found")`,
          blanks: [["is"]],
          output: "nothing found\n",
          hint: "The identity operator.",
          explain: "`result is None` is the idiomatic test for None.",
        },
        {
          id: "b1", kind: "bug", difficulty: 1,
          prompt: "Which line causes a NameError?",
          code: r`ready = 10 > 3
done = false
print(ready, done)`,
          line: 2,
          fix: r`ready = 10 > 3
done = False
print(ready, done)`,
          output: "True False\n",
          hint: "Python's boolean values start with a capital letter.",
          explain: "`false` isn't defined; the boolean is `False`.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Password length check", difficulty: 1,
          prompt: `Read a password (one line). Print its length, then \`True\` or \`False\` for whether it is **at least 8** characters long:

\`\`\`
Length: 10
Long enough: True
\`\`\``,
          starter: r`password = input()
`,
          tests: [
            { label: "10 characters", input: "monsoon123\n", output: "Length: 10\nLong enough: True" },
            { label: "Exactly 8", input: "abcdefgh\n", output: "Length: 8\nLong enough: True", hidden: true, category: "boundary" },
            { label: "Too short", input: "cat\n", output: "Length: 3\nLong enough: False", hidden: true },
          ],
          hints: [
            "Which built-in counts characters?",
            "`len(password)`; a comparison gives True or False.",
            "\"At least 8\" means `>= 8`.",
            "`print(\"Length:\", len(password))` and `print(\"Long enough:\", len(password) >= 8)`.",
          ],
          solution: r`password = input()
print("Length:", len(password))
print("Long enough:", len(password) >= 8)`,
          notes: "You can print a comparison directly: it evaluates to a bool.",
        },
        {
          id: "stretch", kind: "task", title: "Count the yes answers", difficulty: 2,
          prompt: `Read three answers (each \`yes\` or \`no\`, one per line). Print how many were \`yes\` using the fact that \`True\` counts as 1 — don't use \`if\`:

\`\`\`
Yes answers: 2
\`\`\``,
          starter: r`a = input()
b = input()
c = input()
`,
          tests: [
            { label: "yes, no, yes", input: "yes\nno\nyes\n", output: "Yes answers: 2" },
            { label: "all no", input: "no\nno\nno\n", output: "Yes answers: 0", hidden: true, category: "edge" },
            { label: "all yes", input: "yes\nyes\nyes\n", output: "Yes answers: 3", hidden: true },
          ],
          hints: [
            "What is `a == \"yes\"` — and what number does it behave like?",
            "True behaves like 1 and False like 0 in arithmetic.",
            "Add up the three comparisons.",
            "`print(\"Yes answers:\", (a == \"yes\") + (b == \"yes\") + (c == \"yes\"))`.",
          ],
          solution: r`a = input()
b = input()
c = input()
print("Yes answers:", (a == "yes") + (b == "yes") + (c == "yes"))`,
          notes: "Because `bool` is a subtype of `int`, adding comparisons counts how many are true. You'll see the same trick as `sum(x == 'yes' for x in answers)` later.",
        },
      ],
      realWorld: "Form validation checks text lengths and returns booleans; databases use NULL, which Python libraries turn into `None`; and every `if` in every program runs on booleans.",
      reteach: "Three different 'kinds of answer': a string is *what someone said* (words in quotes), a boolean is *a yes/no verdict* (True/False), and None is *no answer yet* — an empty slot, which is different from an empty string or zero.",
      summary: [
        "`str`: text in single, double or triple quotes; `len`, `+`, `*` work on it.",
        "`bool`: `True`/`False`, produced by comparisons; behaves like 1 and 0.",
        "`None` means no value; test with `is None`. Functions without `return` give None.",
      ],
    },

    {
      id: "py-type-conversion",
      title: "Checking and converting types",
      minutes: 15,
      difficulty: 2,
      objectives: [
        "Check types with `type()` and `isinstance()`",
        "Convert between types with `int`, `float`, `str`, `bool`",
        "Predict which values are truthy and which are falsy",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "What is `int(\"12\") + int(3.9)`?",
        options: [
          { text: "15.9", why: "`int(3.9)` drops the decimals." },
          { text: "15", why: "Correct: 12 + 3 — `int()` truncates towards zero." },
          { text: "16", why: "`int()` doesn't round; it truncates." },
        ],
        answer: 1,
        hint: "Does `int()` round or cut off?",
        explain: "`int(\"12\")` parses text; `int(3.9)` truncates to 3. 12 + 3 = 15.",
      },
      why: "Data rarely arrives in the type you need: input is text, files are text, APIs send strings and numbers mixed. Converting confidently — and knowing which values count as 'false' in an `if` — prevents a whole family of bugs.",
      concept: [
        {
          title: "Checking types",
          body: `\`\`\`python
type(3.0)                 # <class 'float'>
isinstance(3, int)        # True
isinstance(3, (int, float))  # True: one of several types
\`\`\`

Prefer \`isinstance\` in real code: it also accepts subclasses (e.g. \`bool\` is an \`int\`).`,
        },
        {
          title: "Explicit conversion (casting)",
          body: `| Call | Result | Notes |
| --- | --- | --- |
| \`int("42")\` | 42 | text must be a whole number |
| \`int(7.9)\` | 7 | truncates towards zero (\`int(-7.9)\` is -7) |
| \`float("2.5")\` | 2.5 | |
| \`str(99)\` | \`"99"\` | |
| \`bool(0)\`, \`bool("")\` | False | see truthiness below |
| \`round(7.6)\` | 8 | rounding instead of truncating |

Invalid text raises \`ValueError\`: \`int("3.5")\`, \`int("ten")\`. Python **never** converts str ↔ number implicitly: \`"5" + 1\` is a TypeError.`,
        },
        {
          title: "Truthy and falsy",
          body: `In an \`if\` or with \`bool()\`, every value counts as true or false.

**Falsy**: \`False\`, \`None\`, \`0\`, \`0.0\`, \`""\` (empty string), \`[]\`, \`()\`, \`{}\`, \`set()\` — anything *empty or zero*.

**Truthy**: everything else — including \`"0"\`, \`"False"\`, \`" "\` (a space) and \`[0]\`.

\`\`\`python
name = input()
if name:              # True when the user typed something
    print("Hello", name)
\`\`\``,
        },
      ],
      example: {
        title: "Converting and testing",
        code: r`raw = "3.75"
price = float(raw)
whole = int(price)
print(price, whole, str(whole) + "!")
print(isinstance(True, int), isinstance(price, (int, float)))
for value in [0, 7, "", "0", [], None]:
    print(repr(value), bool(value))`,
        output: "3.75 3 3!\nTrue True\n0 False\n7 True\n'' False\n'0' True\n[] False\nNone False\n",
        lines: [
          [2, "Text → float: 3.75."],
          [3, "float → int truncates: 3."],
          [4, "`str(whole)` turns 3 into \"3\" so it can be joined with \"!\"."],
          [5, "`bool` is a subclass of `int`; isinstance can check several types at once."],
          [6, "A loop over sample values (loops are Module 6) — each is tested with `bool()`."],
          [7, "Zero, empty and None are falsy; the string \"0\" is not empty, so it's truthy."],
        ],
      },
      mistakes: [
        { title: "Thinking \"0\" or \"False\" is falsy", body: "Only *empty* strings are falsy. `bool(\"False\")` is True — the string has 5 characters." },
        { title: "int() on decimal text", body: "`int(\"2.5\")` raises ValueError. Use `int(float(\"2.5\"))` if you really want 2." },
        { title: "Expecting int() to round", body: "`int(2.99)` is 2. Use `round()` to round." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 2,
          code: r`print(int(-4.8), round(-4.8), float("7"))
print(bool(" "), bool(0.0), bool("False"))`,
          answer: "-4 -5 7.0\nTrue False True\n",
          hint: "`int` truncates towards zero; only empty strings are falsy.",
          explain: "`int(-4.8)` is -4 (towards zero), `round` gives -5. A space is a non-empty string (truthy); 0.0 is falsy; \"False\" is non-empty (truthy).",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Print `Score: 90` by converting the number so it can be joined with `+`.",
          code: r`score = 90
print("Score: " + ___(score))`,
          blanks: [["str"]],
          output: "Score: 90\n",
          hint: "Which function turns a number into text?",
          explain: "`+` only joins str with str, so the int must be converted with `str()`.",
        },
        {
          id: "b1", kind: "bug", difficulty: 2,
          prompt: "With input `2.5`, this crashes. Which line?",
          code: r`hours = int(input())
rate = 100
print(hours * rate)`,
          input: "2.5\n",
          line: 1,
          fix: r`hours = float(input())
rate = 100
print(hours * rate)`,
          output: "250.0\n",
          hint: "Can `int()` read the text \"2.5\"?",
          explain: "`int(\"2.5\")` raises ValueError. Use `float()` for decimal input.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 2,
          prompt: "Which of these is **truthy**?",
          options: [
            { text: "`[]`", why: "An empty list is falsy." },
            { text: "`0`", why: "Zero is falsy." },
            { text: "`[0]`", why: "Correct — a list containing one item is not empty, so it's truthy (even though the item is 0)." },
            { text: "`None`", why: "None is falsy." },
          ],
          answer: 2,
          hint: "Truthiness of a collection depends on whether it's empty, not on what's inside.",
          explain: "`[0]` has one element, so it's non-empty and truthy.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Clean up a measurement", difficulty: 2,
          prompt: `Read a length in centimetres that may have decimals (e.g. \`172.6\`). Print:

\`\`\`
Exact: 172.6 cm
Whole cm (cut off): 172
Rounded: 173
In metres: 1.726
\`\`\`

Show the metres value rounded to 3 decimal places (\`round(..., 3)\`).`,
          starter: r`cm = input()
`,
          tests: [
            { label: "172.6", input: "172.6\n", output: "Exact: 172.6 cm\nWhole cm (cut off): 172\nRounded: 173\nIn metres: 1.726" },
            { label: "Whole number input", input: "150\n", output: "Exact: 150.0 cm\nWhole cm (cut off): 150\nRounded: 150\nIn metres: 1.5", hidden: true, category: "edge" },
            { label: "Rounds down", input: "99.4\n", output: "Exact: 99.4 cm\nWhole cm (cut off): 99\nRounded: 99\nIn metres: 0.994", hidden: true },
          ],
          hints: [
            "What type should the input become so you can do maths with decimals?",
            "`float(...)` for the reading, `int(...)` to cut off, `round(...)` to round.",
            "Metres = cm / 100, rounded with `round(value, 3)`.",
            "Store `cm = float(input())` then print each line with a label.",
          ],
          solution: r`cm = float(input())
print("Exact:", cm, "cm")
print("Whole cm (cut off):", int(cm))
print("Rounded:", round(cm))
print("In metres:", round(cm / 100, 3))`,
          notes: "`float(\"150\")` gives 150.0, which is why one test prints `150.0 cm`. `int` truncates, `round` rounds. Without `round(..., 3)`, 99.4 / 100 prints 0.9940000000000001 — the floating-point effect from the Numbers lesson.",
        },
        {
          id: "stretch", kind: "task", title: "Empty or not?", difficulty: 2,
          prompt: `Read one line. If the user typed **nothing** (an empty line), print \`(empty)\`. Otherwise print the text and its length like \`hello (5)\`. Use truthiness — \`if text:\` — not \`len(text) == 0\`.`,
          starter: r`text = input()
`,
          tests: [
            { label: "hello", input: "hello\n", output: "hello (5)" },
            { label: "Empty line", input: "\n", output: "(empty)", category: "edge" },
            { label: "Just 0", input: "0\n", output: "0 (1)", hidden: true, category: "edge" },
          ],
          hints: [
            "Is an empty string truthy or falsy?",
            "`if text:` runs only when text is non-empty.",
            "Use `if ... else ...` with two prints.",
            "`if text: print(f\"{text} ({len(text)})\")` else `print(\"(empty)\")`.",
          ],
          solution: r`text = input()
if text:
    print(f"{text} ({len(text)})")
else:
    print("(empty)")`,
          notes: "An empty string is falsy; \"0\" is a one-character string and therefore truthy. `if text:` is the Pythonic emptiness test.",
        },
      ],
      realWorld: "Web forms deliver every field as text; a sign-up handler converts ages to int, checks that required fields are non-empty with truthiness, and rejects bad values by catching ValueError (Module 16).",
      reteach: "Conversion is translation: `int(\"42\")` reads the digits on a note and gives you a real number; `str(42)` writes a number back onto a note. Truthiness is a simpler question Python asks of any value: *is there anything here?* Zero, empty and None mean 'nothing'.",
      summary: [
        "`type(x)` and `isinstance(x, T)` check types; isinstance handles subclasses and tuples of types.",
        "`int()`, `float()`, `str()`, `bool()` convert explicitly; int() truncates, bad text raises ValueError.",
        "Falsy: False, None, 0, 0.0, and empty strings/collections. Everything else is truthy.",
      ],
    },

    {
      id: "py-mutability-identity",
      title: "Mutability, identity and equality",
      minutes: 16,
      difficulty: 2,
      objectives: [
        "Tell mutable from immutable types",
        "Explain the difference between `==` (equal value) and `is` (same object)",
        "Predict what happens when two names refer to the same list",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "`a = [1, 2]`, `b = a`, `b.append(3)`. What is `a` now?",
        options: [
          { text: "`[1, 2]`", why: "`b = a` doesn't copy the list." },
          { text: "`[1, 2, 3]`", why: "Correct — a and b are two names for the same list." },
          { text: "An error", why: "This is valid code." },
        ],
        answer: 1,
        hint: "Does `b = a` make a copy?",
        explain: "Assignment never copies. Both names refer to one list, so a change through `b` is visible through `a`.",
      },
      why: "\"I changed one list and another one changed too!\" is one of the most common Python surprises. Understanding objects, identity and mutability explains it — and explains why strings can't be changed in place and why some data can be dictionary keys (Module 11).",
      concept: [
        {
          title: "Everything is an object",
          body: `Every value in Python is an **object** with a type, a value and an **identity** (where it lives; \`id(x)\` shows a number for it). Names are references to objects.

- **Immutable** objects can't change after creation: \`int\`, \`float\`, \`bool\`, \`str\`, \`tuple\`, \`frozenset\`, \`None\`. "Changing" them really creates a new object.
- **Mutable** objects can change in place: \`list\`, \`dict\`, \`set\`, and most objects you create from classes.`,
        },
        {
          title: "== versus is",
          body: `- \`a == b\` — do they have **equal values**?
- \`a is b\` — are they **the very same object**?

\`\`\`python
x = [1, 2]
y = [1, 2]
print(x == y)   # True: equal contents
print(x is y)   # False: two different lists
z = x
print(z is x)   # True: same object
\`\`\`

Use \`is\` only for identity checks like \`is None\`. For values, always use \`==\` (small ints and short strings may *happen* to be the same object — never rely on it).`,
        },
        {
          title: "Aliasing",
          body: `When two names refer to the same **mutable** object, changes through one name are visible through the other — they are **aliases**.

\`\`\`python
s = "hi"
t = s
t = t + "!"      # creates a NEW string; s is unchanged
\`\`\`

With immutable objects aliasing can't cause surprises, because nothing can change in place. To get an independent list, copy it: \`b = a.copy()\` or \`b = a[:]\` (Module 8 covers shallow vs deep copies).`,
        },
      ],
      example: {
        title: "Aliases and copies",
        code: r`team = ["Asha", "Ravi"]
same = team
copy = team.copy()
same.append("Zoe")
print(team, copy)
print(team == same, team is same, team == copy, team is copy)
word = "code"
other = word
other += "r"
print(word, other)`,
        output: "['Asha', 'Ravi', 'Zoe'] ['Asha', 'Ravi']\nTrue True False False\ncode coder\n",
        lines: [
          [2, "`same` is a second name for the same list object."],
          [3, "`.copy()` makes a new list with the same items."],
          [4, "Appending through `same` changes the one shared list…"],
          [5, "…so `team` shows Zoe too, but the copy doesn't."],
          [6, "Equal and identical; then not equal (copy lacks Zoe) and not the same object."],
          [9, "Strings are immutable: `+=` builds a new string and rebinds `other` only."],
        ],
      },
      mistakes: [
        { title: "Using `is` to compare values", body: "`if name is \"admin\":` may work by accident and fail later. Compare values with `==`." },
        { title: "Thinking assignment copies", body: "`b = a` never copies. Use `.copy()`, `list(a)` or slicing for a new list." },
        { title: "Trying to change a string in place", body: "`s[0] = \"J\"` raises TypeError: strings are immutable. Build a new string: `\"J\" + s[1:]`." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 2,
          code: r`a = [1, 2, 3]
b = a
b[0] = 99
print(a)
c = a[:]
c[1] = 0
print(a, c)`,
          answer: "[99, 2, 3]\n[99, 2, 3] [99, 0, 3]\n",
          hint: "`b` is an alias; `c` is a copy.",
          explain: "Changing `b[0]` changes the shared list. `a[:]` copies, so changing `c` doesn't affect `a`.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Make `backup` an independent copy so the second print shows `['milk']`.",
          code: r`basket = ["milk"]
backup = basket.___()
basket.append("bread")
print(backup)`,
          blanks: [["copy"]],
          output: "['milk']\n",
          hint: "Lists have a method that returns a shallow copy.",
          explain: "`basket.copy()` creates a new list; appending to `basket` later doesn't change it.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "The programmer wanted `original` to stay `[3, 1, 2]`. Which line causes the problem?",
          code: r`original = [3, 1, 2]
ordered = original
ordered.sort()
print(original, ordered)`,
          line: 2,
          fix: r`original = [3, 1, 2]
ordered = original.copy()
ordered.sort()
print(original, ordered)`,
          output: "[3, 1, 2] [1, 2, 3]\n",
          hint: "After line 2, how many lists are there?",
          explain: "Line 2 makes an alias, so sorting `ordered` sorts the only list. Copy it (or use `ordered = sorted(original)`).",
        },
        {
          id: "m1", kind: "mcq", difficulty: 2,
          prompt: "Which type is **mutable**?",
          options: [
            { text: "`tuple`", why: "Tuples are immutable." },
            { text: "`str`", why: "Strings are immutable." },
            { text: "`list`", why: "Correct — lists can change in place." },
            { text: "`int`", why: "Integers are immutable." },
          ],
          answer: 2,
          hint: "Which one has methods like `append`?",
          explain: "Lists (and dicts and sets) are mutable; numbers, strings and tuples are immutable.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Keep the original safe", difficulty: 2,
          prompt: `Read three words (one per line) into a list \`words\`. Make a **copy** called \`shouted\` and change its items to upper case (\`shouted[i] = shouted[i].upper()\` for i = 0, 1, 2). Print the original list, then the copy, then whether they are equal (\`==\`):

\`\`\`
['sun', 'moon', 'star']
['SUN', 'MOON', 'STAR']
False
\`\`\``,
          starter: r`words = [input(), input(), input()]
shouted = words
shouted[0] = shouted[0].upper()
shouted[1] = shouted[1].upper()
shouted[2] = shouted[2].upper()
print(words)
print(shouted)
print(words == shouted)`,
          tests: [
            { label: "sun moon star", input: "sun\nmoon\nstar\n", output: "['sun', 'moon', 'star']\n['SUN', 'MOON', 'STAR']\nFalse" },
            { label: "Already upper", input: "A\nB\nC\n", output: "['A', 'B', 'C']\n['A', 'B', 'C']\nTrue", hidden: true, category: "edge" },
          ],
          hints: [
            "Run the starter. Why does the original change too?",
            "`shouted = words` is an alias, not a copy.",
            "Only line 2 needs to change.",
            "`shouted = words.copy()`.",
          ],
          solution: r`words = [input(), input(), input()]
shouted = words.copy()
shouted[0] = shouted[0].upper()
shouted[1] = shouted[1].upper()
shouted[2] = shouted[2].upper()
print(words)
print(shouted)
print(words == shouted)`,
          notes: "With a real copy, changing `shouted` leaves `words` alone. In the hidden test the values are already upper case, so the two lists end up *equal* even though they're different objects.",
        },
        {
          id: "stretch", kind: "task", title: "Equal but not identical", difficulty: 3,
          prompt: `Create \`a = [1, 2]\`, \`b = [1, 2]\` and \`c = a\`. Print four lines: \`a == b\`, \`a is b\`, \`a is c\`, and then — after \`c.append(3)\` — print \`b\`, \`a\`, and \`a == b\` on one line:

\`\`\`
True
False
True
[1, 2] [1, 2, 3] False
\`\`\``,
          starter: r`a = [1, 2]
`,
          tests: [{ label: "Identity vs equality", input: "", output: "True\nFalse\nTrue\n[1, 2] [1, 2, 3] False" }],
          hints: [
            "How many list objects are created?",
            "`a` and `b` are two lists with equal contents; `c` is another name for `a`.",
            "`==` compares contents; `is` compares identity.",
            "Print `a == b`, `a is b`, `a is c`; then `c.append(3)` and `print(b, a, a == b)`.",
          ],
          solution: r`a = [1, 2]
b = [1, 2]
c = a
print(a == b)
print(a is b)
print(a is c)
c.append(3)
print(b, a, a == b)`,
          notes: "Two separate lists can be equal without being the same object; after appending through the alias `c`, `a` changes and is no longer equal to `b`.",
        },
      ],
      realWorld: "Aliasing bugs show up in real systems as 'shared state' problems: a default settings list modified by one user's request leaks into the next. Knowing when you have a reference versus a copy is essential for writing correct functions (Module 12) and classes (Module 17).",
      reteach: "A name is a sticky note on an object. `b = a` puts a second sticky note on the *same* box. If the box is a **list** (you can rearrange its contents), whoever opens it through either note sees the change. If the box is a **string** (sealed, immutable), 'changing' it means making a new sealed box and moving one note.",
      summary: [
        "Every value is an object with a type, value and identity; names refer to objects.",
        "Immutable: int, float, bool, str, tuple, None. Mutable: list, dict, set and most class instances.",
        "`==` compares values, `is` compares identity (use `is` for `None`).",
        "Assignment creates aliases, never copies; copy lists with `.copy()` or `[:]`.",
      ],
      cpp: {
        python: r`a = [1, 2]
b = a        # alias: same list
b.append(3)  # a is now [1, 2, 3]`,
        cpp: r`vector<int> a = {1, 2};
vector<int> b = a;   // a COPY
vector<int>& r = a;  // a reference (alias)
b.push_back(3);      // a unchanged`,
        note: "C++ assignment copies by default, and you ask for aliasing with `&` references. Python always binds names to the same object; you ask for a copy explicitly.",
      },
    },
  ],
  exam: [
    {
      id: "e1", kind: "predict", difficulty: 2,
      code: r`print(type(4 / 2).__name__, 7 // 2, -7 // 2)
print(bool(""), bool("0"), bool([]), bool([[]]))`,
      answer: "float 3 -4\nFalse True False True\n",
      hint: "`//` rounds down (towards minus infinity); a list containing an empty list isn't empty.",
      explain: "`/` gives float; `7 // 2` is 3; `-7 // 2` is -4 (floor). Empty string and empty list are falsy; \"0\" and `[[]]` are non-empty.",
    },
    {
      id: "e2", kind: "mcq", difficulty: 2,
      prompt: "`x = [1]; y = x; x = x + [2]`. What is `y`?",
      options: [
        { text: "`[1]`", why: "Correct — `x + [2]` builds a NEW list and rebinds x; y still refers to the original." },
        { text: "`[1, 2]`", why: "That would happen with `x.append(2)` or `x += [2]`, which change the list in place." },
        { text: "An error", why: "Valid code." },
      ],
      answer: 0,
      hint: "Does `x + [2]` change the existing list or build a new one?",
      explain: "`+` creates a new list. Only in-place operations (`append`, `+=` on lists) would affect the alias.",
    },
    {
      id: "e3", kind: "fill", difficulty: 2,
      prompt: "Check that `value` is an int **or** a float.",
      code: r`value = 3.5
print(isinstance(value, (int, ___)))`,
      blanks: [["float"]],
      output: "True\n",
      hint: "isinstance accepts a tuple of types.",
      explain: "`isinstance(value, (int, float))` is True if value is either type.",
    },
    {
      id: "e4", kind: "bug", difficulty: 2,
      prompt: "This should print `Total: 30.5` but crashes. Which line?",
      code: r`a = "10"
b = 20.5
print("Total:", a + b)`,
      line: 1,
      fix: r`a = 10
b = 20.5
print("Total:", a + b)`,
      output: "Total: 30.5\n",
      hint: "Adding text and a number…",
      explain: "`\"10\" + 20.5` is a TypeError. `a` must be a number (or converted with `float(a)`).",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: data-type inspector", difficulty: 3,
    prompt: `Read one line of text and report what it could be converted to. Print exactly four lines:

\`\`\`
Text: '42'
Is a whole number: True
As float: 42.0
Truthy: True
\`\`\`

- \`Text:\` shows \`repr\` of the input.
- \`Is a whole number:\` is True when the text consists only of digits (use \`.isdigit()\`).
- \`As float:\` shows \`float(text)\` if it can be converted, otherwise \`not a number\`. (Hint: a number contains only digits and at most one \`.\` — check \`text.replace(".", "", 1).isdigit()\`.)
- \`Truthy:\` is \`bool(text)\`.`,
    starter: r`text = input()
`,
    tests: [
      { label: "42", input: "42\n", output: "Text: '42'\nIs a whole number: True\nAs float: 42.0\nTruthy: True" },
      { label: "3.5", input: "3.5\n", output: "Text: '3.5'\nIs a whole number: False\nAs float: 3.5\nTruthy: True", hidden: true },
      { label: "hello", input: "hello\n", output: "Text: 'hello'\nIs a whole number: False\nAs float: not a number\nTruthy: True", hidden: true },
      { label: "Empty", input: "\n", output: "Text: ''\nIs a whole number: False\nAs float: not a number\nTruthy: False", hidden: true, category: "edge" },
    ],
    hints: [
      "Which methods/functions answer each of the four questions?",
      "`repr(text)`, `text.isdigit()`, `bool(text)`; the float check needs an `if`.",
      "`text.replace(\".\", \"\", 1).isdigit()` is True for \"3.5\" and \"42\", False for \"hello\" and \"\".",
      "`if text.replace(\".\", \"\", 1).isdigit(): print(\"As float:\", float(text))` else print `As float: not a number`.",
    ],
    solution: r`text = input()
print("Text:", repr(text))
print("Is a whole number:", text.isdigit())
if text.replace(".", "", 1).isdigit():
    print("As float:", float(text))
else:
    print("As float: not a number")
print("Truthy:", bool(text))`,
    notes: "`\"\".isdigit()` is False, so the empty string is handled naturally. Later (Module 16) you'll do this the Pythonic way: try `float(text)` and catch ValueError.",
  },
};
