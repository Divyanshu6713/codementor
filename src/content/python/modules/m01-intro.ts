import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 1 — Introduction to Python. Written for people who have never programmed. */
export const M01: PyModuleDef = {
  id: "py-intro",
  number: 1,
  level: 1,
  title: "Introduction to Python",
  summary: "What Python is, where it is used, how it compares with C++, how to run it, and how Python turns your code into something the computer runs.",
  track: "core",
  prereqs: [],
  lessons: [
    {
      id: "py-what-is-python",
      title: "What is Python?",
      minutes: 12,
      difficulty: 1,
      objectives: [
        "Say what Python is and why so many people use it",
        "Name places where Python is used — and where it is a poor fit",
        "Write and run a one-line Python program",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 1,
        prompt: "Which of these is a Python program that shows the word *Hello* on the screen?",
        options: [
          { text: "`print(\"Hello\")`", why: "Yes — `print` shows whatever is inside the brackets." },
          { text: "`cout << \"Hello\";`", why: "That's C++. Python doesn't use `cout`." },
          { text: "`echo Hello`", why: "That's a command for a terminal (shell), not Python." },
        ],
        answer: 0,
        hint: "Python uses a function whose name says exactly what it does.",
        explain: "`print(...)` is Python's built-in way to show text. If you got this right you already know a little Python — this lesson will still fill in the background.",
      },
      why: "Python is one of the most widely used programming languages in the world. It runs websites, analyses data, trains AI models, automates boring office work and controls scientific experiments. Because its code reads almost like English, it is also one of the easiest languages to start with.",
      concept: [
        {
          title: "A language for humans first",
          body: `**Python** is a programming language created by Guido van Rossum and first released in **1991**. Its design goal was *readability*: code should be easy for people to read, because code is read far more often than it is written.

Python today means **Python 3** (Python 2 reached its end of life in 2020). New versions come out every year; this course uses current Python 3 syntax and labels features that need a recent version.

Key features:

- **Readable syntax** — indentation (spaces at the start of a line) shows structure, not curly braces.
- **Interpreted** — you run the source code directly; no separate compile-and-link step for you to manage.
- **Dynamically typed** — a variable can hold any kind of value; Python checks types while the program runs.
- **"Batteries included"** — a large standard library for files, dates, maths, internet protocols and more.
- **Huge ecosystem** — hundreds of thousands of extra packages (NumPy, pandas, Django, PyTorch …).`,
        },
        {
          title: "Where Python is used — and where it isn't the best fit",
          body: `| Area | Example |
| --- | --- |
| Web back ends | Instagram's servers, APIs built with Django or FastAPI |
| Data analysis | cleaning spreadsheets, statistics with pandas |
| AI and machine learning | training models with PyTorch or scikit-learn |
| Automation | renaming 1,000 files, filling reports, testing websites |
| Science and education | simulations, lab data, teaching programming |

**Limitations** (it is honest to know them):

- Pure Python is **slower** than C++ for heavy number crunching. Libraries like NumPy hide this by doing the heavy work in C.
- It is not the usual choice for **mobile apps**, **game engines** or **operating systems**.
- Dynamic typing means some mistakes only show up **when that line runs**, not before.`,
        },
        {
          title: "Your first line of Python",
          body: `\`\`\`python
print("Hello, world!")
\`\`\`

\`print\` is a **function**: a named action. The brackets hold what it should act on — here, a piece of text called a **string**, written inside quotes. Running this program shows:

\`\`\`
Hello, world!
\`\`\`

Every \`print(...)\` call shows its text **on a new line**. Lines run from top to bottom, one after another.`,
        },
      ],
      example: {
        title: "Three lines, three outputs",
        code: r`print("Python was released in 1991.")
print("It is used for web, data and AI.")
print("Let's learn it!")`,
        output: "Python was released in 1991.\nIt is used for web, data and AI.\nLet's learn it!\n",
        lines: [
          [1, "`print` shows the text between the quotes. The quotes themselves are not printed."],
          [2, "The second line runs only after the first one has finished, so its text appears underneath."],
          [3, "The apostrophe in *Let's* is fine because the text is wrapped in double quotes."],
        ],
      },
      mistakes: [
        { title: "Forgetting the quotes", body: "`print(Hello)` makes Python look for a *variable* called `Hello` and fails with `NameError`. Text must be inside quotes: `print(\"Hello\")`." },
        { title: "Capital letters", body: "Python is case-sensitive. `Print(\"Hi\")` fails with `NameError: name 'Print' is not defined` — the function is `print`, all lowercase." },
        { title: "Thinking Python is 'just for beginners'", body: "Python is easy to start, but it also runs some of the largest systems in the world. What you learn here is used professionally." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 1,
          code: r`print("first")
print("second")`,
          answer: "first\nsecond\n",
          hint: "Each print shows its text on its own line, top to bottom.",
          explain: "Lines run in order, and every `print` call ends with a new line, so *first* appears above *second*.",
        },
        {
          id: "f1", kind: "fill", difficulty: 1,
          prompt: "Complete the program so it shows `I am learning Python`.",
          code: r`___("I am learning Python")`,
          blanks: [["print"]],
          output: "I am learning Python\n",
          hint: "Which function shows text on the screen?",
          explain: "`print(...)` displays the text inside the brackets.",
        },
        {
          id: "b1", kind: "bug", difficulty: 1,
          prompt: "This program should print two lines but crashes. Which line has the bug?",
          code: r`print("Good morning")
Print("Have a nice day")`,
          line: 2,
          fix: r`print("Good morning")
print("Have a nice day")`,
          output: "Good morning\nHave a nice day\n",
          hint: "Python cares about capital letters.",
          explain: "`Print` with a capital P doesn't exist, so Python stops with `NameError` on line 2. Built-in names like `print` are lowercase.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 2,
          prompt: "Which job is Python usually **not** the first choice for?",
          options: [
            { text: "Analysing a spreadsheet of exam marks", why: "Python (with pandas) is excellent for this." },
            { text: "Writing a 3D game engine that must run at 120 frames per second", why: "Correct — engines need maximum speed and fine memory control, so C++ is the usual choice." },
            { text: "Automating the renaming of hundreds of files", why: "Automation is one of Python's strongest areas." },
          ],
          answer: 1,
          hint: "Think about which task needs every last bit of speed.",
          explain: "Pure Python trades raw speed for readability. Game engines, which squeeze out every millisecond, are typically written in C++.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Introduce yourself", difficulty: 1,
          prompt: `Write a program that prints exactly these two lines:

\`\`\`
Hello, Python!
I am ready to learn.
\`\`\``,
          starter: r`# Write your two print lines below
`,
          tests: [{ label: "Prints both lines", input: "", output: "Hello, Python!\nI am ready to learn." }],
          hints: [
            "How many lines must appear? How many `print` calls does that need?",
            "`print(\"text\")` shows one line of text.",
            "Check the punctuation: a comma after *Hello*, an exclamation mark, and a full stop at the end of the second line.",
            "Write `print(\"Hello, Python!\")` and, on the next line, `print(\"I am ready to learn.\")`.",
          ],
          solution: r`print("Hello, Python!")
print("I am ready to learn.")`,
          notes: "Two `print` calls produce two lines, in the order they are written. The text must match exactly — tests compare character by character.",
        },
        {
          id: "stretch", kind: "task", title: "A tiny poster", difficulty: 2,
          prompt: `Print this three-line poster exactly (the top and bottom lines are 20 \`=\` signs):

\`\`\`
====================
  PYTHON CLUB
====================
\`\`\`

The middle line starts with **two spaces**.`,
          starter: r`print("====================")
`,
          tests: [{ label: "Prints the poster", input: "", output: "====================\n  PYTHON CLUB\n====================" }],
          hints: [
            "The first line is already done. What are the other two?",
            "Spaces inside the quotes are printed too.",
            "Count carefully: the middle line is `  PYTHON CLUB` with two leading spaces.",
            "Add `print(\"  PYTHON CLUB\")` and repeat the line of 20 `=` signs.",
          ],
          solution: r`print("====================")
print("  PYTHON CLUB")
print("====================")`,
          notes: "Everything between the quotes — including spaces — is printed exactly. The judge compares lines, ignoring only spaces at the *end* of a line.",
        },
      ],
      realWorld: "Python's readability is why companies use it for 'glue' work: a data analyst can read and tweak a script written by a colleague without weeks of training. YouTube, Instagram, Spotify and NASA all use Python somewhere in their systems.",
      reteach: "Think of Python as a very literal assistant that reads your instructions one line at a time. `print(\"...\")` means *say this out loud*. The quotes mark exactly what to say. If you misspell the instruction (`Print`, `prnt`), the assistant doesn't know that instruction and stops.",
      summary: [
        "Python is a readable, interpreted, dynamically typed language released in 1991; today we use Python 3.",
        "It is used for web back ends, data, AI, automation and science; it is slower than C++ for raw number crunching.",
        "`print(\"text\")` shows text; each call prints on a new line; lines run top to bottom.",
      ],
      cpp: {
        python: r`print("Hello, world!")`,
        cpp: r`#include <iostream>
using namespace std;

int main() {
    cout << "Hello, world!" << endl;
    return 0;
}`,
        note: "Python needs no `#include`, no `main` function and no semicolons for a simple program. C++ compiles the whole program first; Python starts running the file from the top.",
      },
    },

    {
      id: "py-running-python",
      title: "Installing Python and running code",
      minutes: 14,
      difficulty: 1,
      objectives: [
        "Install Python and pick an editor (IDE)",
        "Use the interpreter in interactive mode and run a saved script",
        "Explain the difference between interactive mode and script mode",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 1,
        prompt: "You type `2 + 3` at the `>>>` prompt and press Enter. What happens?",
        options: [
          { text: "Python shows `5`", why: "Right — the interactive prompt shows the value of each expression you type." },
          { text: "Nothing — you must write `print(2 + 3)`", why: "In a *script* you need `print`, but the interactive prompt echoes values automatically." },
          { text: "An error, because there is no `main` function", why: "Python doesn't need a `main` function." },
        ],
        answer: 0,
        hint: "The `>>>` prompt is Python's interactive mode.",
        explain: "In interactive mode Python evaluates what you type and immediately shows the result. In a saved script, only what you `print` appears.",
      },
      why: "Knowing how to run Python on your own computer means you can keep practising outside CodeMentor, use libraries the sandbox doesn't have, and build real projects. The two ways of running Python — interactively and as a script — are both used every day by professionals.",
      concept: [
        {
          title: "Installing Python and choosing an editor",
          body: `1. Download Python 3 from **python.org** (Windows/macOS) or install it with your system's package manager (Linux usually has it already). On Windows, tick **"Add python.exe to PATH"** in the installer.
2. Check it worked: open a terminal and run \`python --version\` (on macOS/Linux it may be \`python3 --version\`).
3. Pick an editor. Good free choices: **VS Code** with the Python extension, **PyCharm Community**, or **Thonny** (very beginner-friendly). An editor with Python support colours your code, points out mistakes and runs your file with one click.

> In CodeMentor you don't need to install anything: the coding workspace runs Python for you in a secure sandbox.`,
        },
        {
          title: "Interactive mode: the >>> prompt",
          body: `Type \`python\` in a terminal and you get the **interpreter's interactive prompt**, also called the **REPL** (Read–Evaluate–Print Loop):

\`\`\`
>>> 2 + 3
5
>>> "py" * 3
'pypypy'
>>> exit()
\`\`\`

Each line is run as soon as you press Enter, and the **value** of an expression is echoed back. It is perfect for quick experiments and checking how something behaves.`,
        },
        {
          title: "Script mode: saving a .py file",
          body: `For anything longer than a few lines, save your code in a file ending in **.py**, for example \`hello.py\`, and run it from a terminal:

\`\`\`
python hello.py
\`\`\`

In a script, Python runs the file **top to bottom** and then stops. Values are **not** echoed: a line like \`2 + 3\` calculates 5 and throws it away. To see a result you must \`print\` it.

| | Interactive mode | Script mode |
| --- | --- | --- |
| How | type \`python\`, then code | \`python file.py\` |
| Values shown | automatically | only with \`print\` |
| Saved? | no | yes, in the file |
| Best for | quick experiments | real programs |

CodeMentor's **Run** button works in **script mode**.`,
        },
      ],
      example: {
        title: "Only printed values appear in a script",
        code: r`2 + 3
print(2 + 3)
"hello" * 2
print("hello" * 2)`,
        output: "5\nhellohello\n",
        lines: [
          [1, "Python calculates 5 — and, because this is a script, throws it away. Nothing is shown."],
          [2, "`print` shows the value: 5."],
          [3, "Calculated (`'hellohello'`) but not shown."],
          [4, "Printed: hellohello. Notice the printed text has no quotes."],
        ],
      },
      mistakes: [
        { title: "Typing terminal commands into Python", body: "`python hello.py` is a **terminal** command. If you type it at the `>>>` prompt you'll get a `SyntaxError`. Leave the REPL with `exit()` first." },
        { title: "Expecting a script to echo values", body: "A bare expression like `x * 2` on its own line does nothing visible in a script. Wrap it in `print(...)`." },
        { title: "\"python is not recognized\"", body: "On Windows this means Python isn't on your PATH. Re-run the installer and tick *Add python.exe to PATH*, or use the `py` launcher." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 1,
          prompt: "This is a **script**. What does it print?",
          code: r`10 * 10
print(7 + 1)`,
          answer: "8\n",
          hint: "Which lines actually show something in script mode?",
          explain: "`10 * 10` is calculated and discarded. Only the `print` line produces output: 8.",
        },
        {
          id: "f1", kind: "fill", difficulty: 1,
          prompt: "Make this script show the result of `6 * 7`.",
          code: r`___(6 * 7)`,
          blanks: [["print"]],
          output: "42\n",
          hint: "In script mode, values are only shown when you ask.",
          explain: "`print(6 * 7)` calculates 42 and shows it.",
        },
        {
          id: "b1", kind: "bug", difficulty: 2,
          prompt: "This script should show the total of the three prices but prints nothing. Which line is the problem?",
          code: r`price1 = 40
price2 = 25
price3 = 35
price1 + price2 + price3`,
          line: 4,
          fix: r`price1 = 40
price2 = 25
price3 = 35
print(price1 + price2 + price3)`,
          output: "100\n",
          hint: "The total is calculated… but is it shown?",
          explain: "In a script the sum on line 4 is calculated and thrown away. `print(...)` is needed to show it.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 1,
          prompt: "When is interactive mode the better choice?",
          options: [
            { text: "Checking what `\"ab\" * 3` gives", why: "Yes — quick experiments are what the REPL is for." },
            { text: "Writing a 200-line program you will run every day", why: "That belongs in a saved .py file (script mode)." },
            { text: "Sharing a program with a classmate", why: "You'd share a .py file; REPL sessions aren't saved." },
          ],
          answer: 0,
          hint: "Which task is quick and throw-away?",
          explain: "The REPL is for short experiments. Programs you keep, rerun or share live in .py files.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Make the results visible", difficulty: 1,
          prompt: `This script calculates three things but shows nothing. Change it so it prints the three results, one per line:

\`\`\`
12
30
python!python!
\`\`\``,
          starter: r`5 + 7
6 * 5
"python!" * 2`,
          tests: [{ label: "Shows all three results", input: "", output: "12\n30\npython!python!" }],
          hints: [
            "In script mode, which lines produce visible output?",
            "Values are shown only when passed to `print`.",
            "Each of the three lines needs to be wrapped.",
            "Write `print(5 + 7)`, `print(6 * 5)` and `print(\"python!\" * 2)`.",
          ],
          solution: r`print(5 + 7)
print(6 * 5)
print("python!" * 2)`,
          notes: "A script only shows what you print. `\"python!\" * 2` repeats the text twice.",
        },
        {
          id: "stretch", kind: "debug", title: "Fix the copied REPL session", difficulty: 2,
          prompt: `Someone copied a REPL session into a script, prompts and all, so it doesn't run. Turn it into a working script that prints:

\`\`\`
8
Hi Hi Hi
\`\`\`

(The second line is \`"Hi " * 3\`.)`,
          starter: r`>>> print(3 + 5)
>>> print("Hi " * 3)`,
          tests: [{ label: "Runs and prints both lines", input: "", output: "8\nHi Hi Hi" }],
          hints: [
            "Is `>>>` part of Python code, or something the REPL shows?",
            "The `>>>` prompt is printed by the interactive interpreter; it's not code.",
            "Remove the prompt characters from both lines.",
            "Keep just `print(3 + 5)` and `print(\"Hi \" * 3)`.",
          ],
          solution: r`print(3 + 5)
print("Hi " * 3)`,
          notes: "`>>>` is only the REPL's prompt. Pasting it into a file makes the file invalid Python — a `SyntaxError` before anything runs.",
        },
      ],
      realWorld: "Data scientists explore data interactively (often in Jupyter notebooks, a richer REPL) and then move the working steps into scripts that run automatically every night. Knowing both modes is part of everyday Python work.",
      reteach: "Interactive mode is like talking to a calculator: you ask, it answers immediately. Script mode is like leaving written instructions for someone: they follow all of them, but they only *say* something when an instruction tells them to (`print`).",
      summary: [
        "Install Python 3 from python.org and use an editor such as VS Code, PyCharm or Thonny.",
        "Interactive mode (`>>>`) runs each line immediately and echoes values — great for experiments.",
        "Script mode runs a saved .py file top to bottom; only `print` shows output. CodeMentor's Run uses script mode.",
      ],
    },

    {
      id: "py-first-program",
      title: "Your first real program",
      minutes: 15,
      difficulty: 1,
      objectives: [
        "Combine text and calculations in `print`",
        "Print several values on one line with commas",
        "Add comments that explain your code",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 1,
        prompt: "What does `print(\"2 + 2\")` show?",
        options: [
          { text: "`2 + 2`", why: "Correct — inside quotes it is just text, not a calculation." },
          { text: "`4`", why: "That's what `print(2 + 2)` (without quotes) shows." },
          { text: "An error", why: "It's valid: printing a piece of text." },
        ],
        answer: 0,
        hint: "Look closely at the quotes.",
        explain: "Quotes make a string: Python prints it exactly as written. Without quotes, `2 + 2` is a calculation.",
      },
      why: "Almost every program needs to show results with a label — \"Total: 450\", \"Score: 9/10\". Learning to mix text and values in output, and to leave comments for the next reader, is the foundation of every program you will write.",
      concept: [
        {
          title: "Printing several things at once",
          body: `\`print\` can take **several values separated by commas**. It prints them on one line with a **space** between each:

\`\`\`python
print("Total:", 40 + 2)
\`\`\`

shows \`Total: 42\`. The text and the calculated number are joined with a single space.

You can choose a different separator with \`sep=\`, and a different line ending with \`end=\`:

\`\`\`python
print("a", "b", "c", sep="-")   # a-b-c
print("no newline", end="!")    # no newline!  (and the next print continues on this line)
\`\`\``,
        },
        {
          title: "Comments",
          body: `A **comment** starts with \`#\`. Python ignores everything from \`#\` to the end of the line. Comments are notes for humans:

\`\`\`python
# Work out the price of 3 notebooks at 45 rupees each
print(3 * 45)   # 135
\`\`\`

Good comments explain **why** something is done, not what is already obvious from the code.`,
        },
      ],
      example: {
        title: "A small receipt",
        code: r`# A receipt for a school canteen
print("Item:", "Samosa")
print("Quantity:", 3)
print("Price each:", 15)
print("Total:", 3 * 15)
print("Thank", "you", sep="-", end="!\n")`,
        output: "Item: Samosa\nQuantity: 3\nPrice each: 15\nTotal: 45\nThank-you!\n",
        lines: [
          [1, "A comment: Python skips it completely."],
          [2, "Two values separated by a comma are printed with a space between them."],
          [3, "Text and a number can be mixed — `print` converts the number to text for display."],
          [5, "`3 * 15` is calculated first, then printed after the label: `Total: 45`."],
          [6, "`sep=\"-\"` joins the values with a dash; `end=\"!\\n\"` finishes the line with `!` and a newline."],
        ],
      },
      mistakes: [
        { title: "Adding text and numbers with +", body: "`print(\"Total: \" + 45)` fails with `TypeError: can only concatenate str (not \"int\") to str`. Use a comma: `print(\"Total:\", 45)` — or an f-string, which you'll meet soon." },
        { title: "Extra spaces from commas", body: "`print(\"Total: \", 45)` prints *two* spaces (one inside the quotes, one from the comma). Let the comma provide the space." },
        { title: "Commenting out by accident", body: "A `#` inside quotes is just a character: `print(\"#1 fan\")` prints `#1 fan`. But a `#` outside quotes hides the rest of the line." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 1,
          code: r`print("Score:", 7 + 2, "out of", 10)`,
          answer: "Score: 9 out of 10\n",
          hint: "Commas become single spaces; the calculation happens first.",
          explain: "`7 + 2` becomes 9, then the four values are printed with single spaces between them.",
        },
        {
          id: "p2", kind: "predict", difficulty: 2,
          code: r`print("A", "B", sep="")
print("C", end=" ")
print("D")`,
          answer: "AB\nC D\n",
          hint: "`sep` changes what goes between values; `end` changes what goes at the end of the line.",
          explain: "`sep=\"\"` joins A and B with nothing. `end=\" \"` replaces the newline after C with a space, so D continues on the same line.",
        },
        {
          id: "f1", kind: "fill", difficulty: 1,
          prompt: "Make the program print `Total: 120` using a comma (not `+`).",
          code: r`print("Total:"___ 4 * 30)`,
          blanks: [[","]],
          output: "Total: 120\n",
          hint: "What separates values inside `print(...)`?",
          explain: "A comma separates the values; `print` puts one space between them.",
        },
        {
          id: "b1", kind: "bug", difficulty: 2,
          prompt: "This should print `Apples: 12` but crashes. Which line?",
          code: r`# Count the apples in 3 bags of 4
print("Apples: " + 3 * 4)`,
          line: 2,
          fix: r`# Count the apples in 3 bags of 4
print("Apples:", 3 * 4)`,
          output: "Apples: 12\n",
          hint: "Can you add a piece of text and a number with `+`?",
          explain: "`\"Apples: \" + 12` mixes a string and an integer, which is a `TypeError`. Passing them as separate values with a comma works.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Pocket-money report", difficulty: 1,
          prompt: `Riya gets 50 rupees a week. Print exactly:

\`\`\`
Weekly: 50
Monthly (4 weeks): 200
Yearly (52 weeks): 2600
\`\`\`

Let Python **calculate** the numbers (use \`*\`), and print each label and number with a comma.`,
          starter: r`# Riya gets 50 rupees a week
print("Weekly:", 50)
`,
          tests: [{ label: "Prints the three lines", input: "", output: "Weekly: 50\nMonthly (4 weeks): 200\nYearly (52 weeks): 2600" }],
          hints: [
            "How do you get the monthly amount from the weekly one?",
            "`print(\"label\", value)` prints the label, a space, then the value.",
            "The labels must match exactly, including the brackets.",
            "Add `print(\"Monthly (4 weeks):\", 50 * 4)` and `print(\"Yearly (52 weeks):\", 50 * 52)`.",
          ],
          solution: r`# Riya gets 50 rupees a week
print("Weekly:", 50)
print("Monthly (4 weeks):", 50 * 4)
print("Yearly (52 weeks):", 50 * 52)`,
          notes: "Python calculates `50 * 4` and `50 * 52` before printing. The comma puts exactly one space between label and number.",
        },
        {
          id: "stretch", kind: "task", title: "A date in three formats", difficulty: 2,
          prompt: `Using \`sep\` (not by typing the separators inside one string), print the date 9 October 2026 three ways:

\`\`\`
9/10/2026
9-10-2026
9.10.2026
\`\`\`

Each line should be one \`print\` with the three numbers 9, 10 and 2026 as separate values.`,
          starter: r`print(9, 10, 2026)
`,
          tests: [{ label: "Prints three formats", input: "", output: "9/10/2026\n9-10-2026\n9.10.2026" }],
          hints: [
            "What does `print` put between values by default? How can you change it?",
            "`sep=\"...\"` sets the separator between values.",
            "Use `sep=\"/\"`, then `sep=\"-\"`, then `sep=\".\"`.",
            "`print(9, 10, 2026, sep=\"/\")` prints `9/10/2026`. Repeat with the other separators.",
          ],
          solution: r`print(9, 10, 2026, sep="/")
print(9, 10, 2026, sep="-")
print(9, 10, 2026, sep=".")`,
          notes: "`sep` controls what goes *between* values; the default is one space.",
        },
      ],
      realWorld: "Log files, receipts, reports and command-line tools all print labelled values. Clear output (and clear comments) is what makes a program usable by someone other than its author.",
      reteach: "Imagine `print` as a label maker. You hand it several stickers (the values separated by commas) and it lines them up with a space between each, then moves to a new line. `sep` changes the gap between stickers; `end` changes what happens after the last one.",
      summary: [
        "`print(a, b, c)` prints values on one line separated by spaces.",
        "`sep=` changes the separator; `end=` changes the line ending (default newline).",
        "`#` starts a comment — notes for people, ignored by Python.",
      ],
    },

    {
      id: "py-execution-model",
      title: "How Python runs your code",
      minutes: 15,
      difficulty: 2,
      objectives: [
        "Describe the journey: source code → bytecode → Python virtual machine",
        "Tell a syntax error (found before running) from a runtime error (found while running)",
        "Explain why Python is called an interpreted language",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "A program prints *start* on line 1 and has a typo that breaks Python's grammar on line 5. What do you see?",
        options: [
          { text: "Only a `SyntaxError` — *start* is never printed", why: "Correct: Python checks the whole file's grammar before running any of it." },
          { text: "*start*, then a `SyntaxError`", why: "That's what happens with a *runtime* error, not a grammar error." },
          { text: "*start* and nothing else", why: "Python won't silently skip a broken line." },
        ],
        answer: 0,
        hint: "Does Python read the whole file before running the first line?",
        explain: "Python compiles the whole file to bytecode first. A grammar (syntax) error stops that step, so not even line 1 runs.",
      },
      why: "Understanding what happens when you press Run explains error messages: why some errors appear before anything runs and others only after half your output. It also explains Python's speed trade-offs compared with C++.",
      concept: [
        {
          title: "Source → bytecode → virtual machine",
          body: `When you run \`python main.py\`:

1. **Compile to bytecode.** Python reads the *whole file* and checks its grammar. If the grammar is wrong you get a **SyntaxError** and nothing runs. Otherwise it translates your code into **bytecode** — simple instructions for an imaginary machine.
2. **Run on the Python Virtual Machine (PVM).** The PVM executes the bytecode one instruction at a time, top to bottom.

So Python *does* compile — but to bytecode, automatically, every time (it may cache it in \`__pycache__\` folders). C++ compiles to **machine code** for your processor, ahead of time, as a separate step.

You can peek at the compile step yourself — \`compile()\` turns text into a code object:

\`\`\`python
code = compile("total = price * qty", "<demo>", "exec")
print(code.co_names)    # ('price', 'qty', 'total')
\`\`\``,
        },
        {
          title: "Syntax errors vs runtime errors",
          body: `| | Syntax error | Runtime error (exception) |
| --- | --- | --- |
| When | before anything runs | while running, at that line |
| Earlier output | none | lines before it still ran |
| Examples | missing \`:\` or bracket, bad indentation | dividing by zero, unknown name, wrong type |

A runtime error produces a **traceback**: read it from the **bottom up**. The last line says *what* went wrong; the line above shows *where* (\`File "main.py", line 3\`).`,
        },
      ],
      example: {
        title: "A runtime error stops the program half-way",
        code: r`print("Step 1: start")
print("Step 2:", 10 / 2)
code = compile("total = price * qty", "<demo>", "exec")
print("Step 3:", code.co_names)
print("Step 4:", 10 / 0)
print("Step 5: never printed")`,
        output: "Step 1: start\nStep 2: 5.0\nStep 3: ('price', 'qty', 'total')\n",
        raises: "ZeroDivisionError",
        lines: [
          [1, "Runs first — the whole file was already compiled to bytecode successfully."],
          [2, "`10 / 2` is 5.0 (division always gives a decimal number in Python)."],
          [3, "`compile` does by hand what Python did to your file: it builds a code object without running it."],
          [4, "The code object lists the names it uses — evidence that Python analysed the code before running it."],
          [5, "Dividing by zero is a **runtime** error: Python stops here with `ZeroDivisionError` (shown under the output as a traceback)."],
          [6, "Never reached — the program already stopped."],
        ],
      },
      mistakes: [
        { title: "Reading a traceback from the top", body: "The most useful lines are at the **bottom**: the error type and message, and just above it the line of *your* file that failed." },
        { title: "\"Python isn't compiled at all\"", body: "It is compiled — to bytecode, automatically. What it doesn't do is produce a separate machine-code program like C++ does." },
        { title: "Assuming earlier output means the code is fine", body: "With a runtime error, everything before the failing line runs. A partly printed output doesn't mean the rest of the program is correct." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 2,
          prompt: "What appears on standard output before the program stops? (Ignore the traceback.)",
          code: r`print("A")
print("B", 1 + 1)
print("C", 1 / 0)
print("D")`,
          answer: "A\nB 2\n",
          hint: "Which line raises an error while running, and what had already run by then?",
          explain: "Lines 1 and 2 run. Line 3 raises `ZeroDivisionError` before printing anything, so C and D never appear.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Complete the code so it prints the names the compiled code uses.",
          code: r`code = ___("area = width * height", "<demo>", "exec")
print(code.co_names)`,
          blanks: [["compile"]],
          output: "('width', 'height', 'area')\n",
          hint: "Which built-in turns a string of source code into a code object?",
          explain: "`compile(source, filename, mode)` builds a code object — the same step Python performs on your file before running it.",
        },
        {
          id: "b1", kind: "bug", difficulty: 2,
          prompt: "This program doesn't print *anything*, not even line 1. Which line causes it?",
          code: r`print("Welcome")
print("Your score is", 95
print("Well done")`,
          line: 2,
          fix: r`print("Welcome")
print("Your score is", 95)
print("Well done")`,
          output: "Welcome\nYour score is 95\nWell done\n",
          hint: "If nothing runs at all, it's a grammar problem found before running.",
          explain: "Line 2 is missing its closing bracket. That's a `SyntaxError`, found while compiling, so no line runs — not even line 1.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 2,
          prompt: "Which statement about running Python is true?",
          options: [
            { text: "Python translates the file to bytecode, then the virtual machine runs it", why: "Correct." },
            { text: "Python runs each line straight from the text without any translation", why: "Python always compiles to bytecode first." },
            { text: "Python produces an .exe file like a C++ compiler", why: "Standard Python doesn't produce machine-code executables." },
          ],
          answer: 0,
          hint: "There are two stages.",
          explain: "Compile to bytecode, then execute on the PVM. That's why syntax errors appear before any output.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "debug", title: "Make it compile, then make it run", difficulty: 2,
          prompt: `This program has **two** problems: one grammar (syntax) error and one runtime error. Fix both so it prints:

\`\`\`
Trip cost: 1200
Per person: 300.0
\`\`\`

(4 friends share the trip.)`,
          starter: r`print("Trip cost:", 1200
print("Per person:", 1200 / 0)`,
          tests: [{ label: "Prints the cost and the share", input: "", output: "Trip cost: 1200\nPer person: 300.0" }],
          hints: [
            "Run it. Which error do you see first, and does any line print?",
            "A syntax error is reported before anything runs; fix it first, then run again.",
            "Line 1 is missing a bracket; line 2 divides by the wrong number.",
            "Close the bracket on line 1 and divide by 4 on line 2.",
          ],
          solution: r`print("Trip cost:", 1200)
print("Per person:", 1200 / 4)`,
          notes: "Fix syntax errors first — until the file compiles, nothing runs. Then runtime errors show up one at a time as the program reaches them.",
        },
        {
          id: "stretch", kind: "task", title: "Inspect the compile step", difficulty: 3,
          prompt: `Use \`compile()\` on the source text \`"speed = distance / time"\` (filename \`"<demo>"\`, mode \`"exec"\`) and print:

\`\`\`
names: ('distance', 'time', 'speed')
type: code
\`\`\`

The second line is the **type name** of the compiled object: use \`type(code).__name__\`.`,
          starter: r`code = compile("speed = distance / time", "<demo>", "exec")
`,
          tests: [{ label: "Prints the names and the type", input: "", output: "names: ('distance', 'time', 'speed')\ntype: code" }],
          hints: [
            "Which attribute of a code object lists the names it uses?",
            "`code.co_names` is a tuple of names in the order they are first used.",
            "`type(x).__name__` gives the name of x's type as text.",
            "`print(\"names:\", code.co_names)` and `print(\"type:\", type(code).__name__)`.",
          ],
          solution: r`code = compile("speed = distance / time", "<demo>", "exec")
print("names:", code.co_names)
print("type:", type(code).__name__)`,
          notes: "`compile` only translates — it doesn't run the assignment (which would fail, since `distance` doesn't exist). That separation is exactly the compile/run split.",
        },
      ],
      realWorld: "When a production server logs a traceback, engineers read it bottom-up to find the exact file and line. Knowing that syntax errors stop deployment immediately — while runtime errors only appear on certain inputs — is why teams use automated tests.",
      reteach: "Think of a play. First the director reads the whole script to check it makes sense (compiling): a page of gibberish stops the play before the curtain rises. Then the actors perform it line by line (running): if an actor trips in scene 3, scenes 1–2 have already happened, but the show stops there.",
      summary: [
        "Python compiles the whole file to bytecode, then the Python Virtual Machine runs it.",
        "Syntax errors are found before anything runs; runtime errors (exceptions) stop the program at that line.",
        "Read tracebacks bottom-up: error type and message last, the failing line just above.",
      ],
      cpp: {
        python: r`print("start")
print(1 / 0)   # runtime error: start was already printed`,
        cpp: r`#include <iostream>
int main() {
    std::cout << "start\n";
    int zero = 0;
    std::cout << 1 / zero;   // undefined behaviour: may crash, may not
}`,
        note: "Python checks things like division by zero while running and raises a clear exception. C++ compiles ahead of time to machine code and does far fewer checks at run time, which is faster but less forgiving.",
      },
    },
  ],
  exam: [
    {
      id: "e1", kind: "mcq", difficulty: 2,
      prompt: "Which line, run as a **script**, shows `10`?",
      options: [
        { text: "`5 * 2`", why: "In a script this value is calculated and discarded." },
        { text: "`print(5 * 2)`", why: "Correct — only printed values appear in script mode." },
        { text: "`print(\"5 * 2\")`", why: "That prints the text `5 * 2`." },
      ],
      answer: 1,
      hint: "Script mode doesn't echo values.",
      explain: "Only `print` produces output in a script; quotes would turn the calculation into plain text.",
    },
    {
      id: "e2", kind: "predict", difficulty: 2,
      code: r`print("x", "y", sep=", ", end=".\n")
print("done")`,
      answer: "x, y.\ndone\n",
      hint: "`sep` goes between values, `end` after the last one.",
      explain: "The values are joined by `, ` and the line ends with `.` plus a newline.",
    },
    {
      id: "e3", kind: "bug", difficulty: 2,
      prompt: "Which line stops this program from running at all?",
      code: r`print("Total")
print("Sum:", 2 + 3)
print("Avg:" 2.5)`,
      line: 3,
      fix: r`print("Total")
print("Sum:", 2 + 3)
print("Avg:", 2.5)`,
      output: "Total\nSum: 5\nAvg: 2.5\n",
      hint: "Look for a missing comma between values.",
      explain: "`\"Avg:\" 2.5` has no comma, which is invalid syntax — so the file doesn't compile and nothing runs.",
    },
    {
      id: "e4", kind: "mcq", difficulty: 1,
      prompt: "Which is a genuine limitation of pure Python?",
      options: [
        { text: "It can't read files", why: "Python handles files easily." },
        { text: "It is slower than C++ for heavy number crunching", why: "Correct — which is why libraries like NumPy do that work in C." },
        { text: "It can only run on Windows", why: "Python runs on Windows, macOS, Linux and more." },
      ],
      answer: 1,
      hint: "Think about speed.",
      explain: "Python trades raw speed for readability and productivity; C++ is faster for tight numeric loops.",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: club welcome card", difficulty: 2,
    prompt: `Build the welcome card for a coding club. Print exactly:

\`\`\`
*** CODE CLUB ***
Members: 24
Teams of 4: 6
Meeting: Fri-4-PM
Bring a laptop!
\`\`\`

Rules: calculate the number of teams with \`//\` (whole-number division: \`24 // 4\`), produce \`Fri-4-PM\` from the three values \`"Fri"\`, \`4\` and \`"PM"\` using \`sep="-"\`, and add at least one comment.`,
    starter: r`# Code club welcome card
print("*** CODE CLUB ***")
`,
    tests: [{ label: "Prints the card", input: "", output: "*** CODE CLUB ***\nMembers: 24\nTeams of 4: 6\nMeeting: Fri-4-PM\nBring a laptop!" }],
    hints: [
      "Five lines of output → how many prints?",
      "Use commas for label + value; `sep=\"-\"` for the meeting line.",
      "The meeting line is `print(\"Meeting:\", ...)`? Careful — the label and `Fri` must be joined by a space, but the rest by dashes. Try printing the label first with `end=\" \"`.",
      "`print(\"Meeting:\", end=\" \")` then `print(\"Fri\", 4, \"PM\", sep=\"-\")`. Teams: `print(\"Teams of 4:\", 24 // 4)`.",
    ],
    solution: r`# Code club welcome card
print("*** CODE CLUB ***")
print("Members:", 24)
print("Teams of 4:", 24 // 4)   # whole teams only
print("Meeting:", end=" ")
print("Fri", 4, "PM", sep="-")
print("Bring a laptop!")`,
    notes: "This combines everything in the module: several prints, label-and-value output, `sep` and `end`, a calculation, and a comment.",
  },
};
