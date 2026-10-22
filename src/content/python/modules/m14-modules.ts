import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 14 — Modules and packages. */
export const M14: PyModuleDef = {
  id: "py-modules",
  number: 14,
  level: 3,
  title: "Modules and Packages",
  summary: "import and from-import, aliases, a tour of the standard library, creating your own modules and packages, __init__.py, the module search path, `if __name__ == \"__main__\"`, circular imports, and installing third-party libraries with pip.",
  track: "core",
  prereqs: ["py-iteration"],
  lessons: [
    {
      id: "py-imports",
      title: "Importing modules and the standard library",
      minutes: 15,
      difficulty: 2,
      objectives: [
        "Use `import`, `from … import` and aliases",
        "Find your way around the standard library",
        "Explain where Python looks for modules (`sys.path`)",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "After `import math`, how do you call the square-root function?",
        options: [
          { text: "`sqrt(16)`", why: "That needs `from math import sqrt`." },
          { text: "`math.sqrt(16)`", why: "Correct — the module name is the prefix." },
          { text: "`math->sqrt(16)`", why: "Python uses a dot." },
        ],
        answer: 1,
        hint: "`import math` brings in the module name.",
        explain: "`import math` binds the name `math`; its functions are attributes: `math.sqrt`.",
      },
      why: "Nobody writes everything from scratch. Python ships with a huge standard library — dates, random numbers, JSON, CSV, maths, statistics, file paths — and importing it correctly is the first step to using any library.",
      concept: [
        {
          title: "Three ways to import",
          body: `\`\`\`python
import math                    # use as math.pi
from math import sqrt, pi      # use as sqrt, pi
import statistics as st        # alias: st.mean
from collections import Counter
\`\`\`

Avoid \`from module import *\`: it dumps unknown names into your file and can silently shadow your own. Importing runs the module's code **once**; later imports reuse it (cached in \`sys.modules\`).`,
        },
        {
          title: "A quick tour of the standard library",
          body: `| Module | For |
| --- | --- |
| \`math\`, \`statistics\`, \`random\` | maths, averages, randomness |
| \`datetime\`, \`time\` | dates and times |
| \`collections\`, \`itertools\`, \`functools\` | containers and functional tools |
| \`json\`, \`csv\`, \`pathlib\` | data files and paths |
| \`re\` | regular expressions |
| \`os\`, \`sys\`, \`subprocess\` | the operating system |
| \`sqlite3\` | a SQL database |
| \`unittest\`, \`logging\`, \`argparse\` | testing, logs, command-line tools |

Module 21 tours many of these in detail. The official docs at docs.python.org/3/library are the reference.`,
        },
        {
          title: "Where modules come from: sys.path",
          body: `\`import x\` searches the folders in \`sys.path\` in order: the script's own folder first, then the standard library, then installed packages (site-packages). A file in *your* folder named \`random.py\` will be imported instead of the standard \`random\` module — a classic confusing bug. Don't name your files after standard modules.`,
        },
      ],
      example: {
        title: "Mixing import styles",
        code: r`import math
from statistics import mean, median
import datetime as dt
from collections import Counter

print(math.floor(7.8), math.gcd(84, 36), round(math.pi, 3))
marks = [72, 88, 95, 60, 88]
print(mean(marks), median(marks))
d = dt.date(2026, 10, 9)
print(d.strftime("%A"), (dt.date(2026, 12, 25) - d).days, "days to Christmas")
print(Counter(marks).most_common(1))`,
        output: "7 12 3.142\n80.6 88\nFriday 77 days to Christmas\n[(88, 2)]\n",
        lines: [
          [1, "The whole module, used with the `math.` prefix."],
          [2, "Just two functions, used without a prefix."],
          [3, "An alias keeps the name short."],
          [6, "floor, greatest common divisor, and the constant pi."],
          [8, "Average and middle value."],
          [10, "Dates: weekday name, and subtracting dates gives a timedelta."],
          [11, "Counter counts items; most_common(1) gives the top one."],
        ],
      },
      mistakes: [
        { title: "Naming your file after a module", body: "A `math.py` or `random.py` in your folder hides the real module. Rename it." },
        { title: "`import *`", body: "Unclear where names come from and risks clashes. Import what you use." },
        { title: "Forgetting the prefix", body: "After `import math`, `sqrt(4)` is a NameError — write `math.sqrt(4)`." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 2,
          code: r`from math import ceil, floor
import math as m
print(ceil(4.1), floor(-4.1), m.isqrt(17), m.prod([2, 3, 4]))`,
          answer: "5 -5 4 24\n",
          hint: "floor rounds down (towards minus infinity); isqrt is the integer square root.",
          explain: "ceil(4.1) = 5, floor(-4.1) = -5, isqrt(17) = 4, prod = 24.",
        },
        {
          id: "f1", kind: "fill", difficulty: 1,
          prompt: "Import only `randint` from the random module.",
          code: r`___ random import randint
import random
random.seed(7)
print(randint(1, 1) == 1)`,
          blanks: [["from"]],
          output: "True\n",
          hint: "from … import …",
          explain: "`from random import randint` makes randint available directly.",
        },
        {
          id: "b1", kind: "bug", difficulty: 2,
          prompt: "This crashes with NameError. Which line?",
          code: r`import statistics
values = [3, 9, 6]
print(mean(values))`,
          line: 3,
          fix: r`import statistics
values = [3, 9, 6]
print(statistics.mean(values))`,
          output: "6\n",
          hint: "How was the module imported?",
          explain: "`import statistics` only binds `statistics`; use `statistics.mean` (or `from statistics import mean`).",
        },
        {
          id: "m1", kind: "mcq", difficulty: 2,
          prompt: "You create `random.py` in your project folder, then `import random` in main.py. What happens?",
          options: [
            { text: "Python imports the standard random module", why: "Your folder comes first on sys.path." },
            { text: "Python imports your random.py instead", why: "Correct — and random.randint will probably be missing." },
            { text: "A SyntaxError", why: "It's a name clash, not a syntax problem." },
          ],
          answer: 1,
          hint: "Which folder does Python search first?",
          explain: "The script's folder is first on sys.path, so your file shadows the standard module.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Exam statistics with the standard library", difficulty: 2,
          prompt: `Read a line of marks. Using the \`statistics\` module, print the mean (1 decimal), the median and the mode, and using \`math\`, the number of full groups of 5 students (\`math.floor(n / 5)\`):

\`\`\`
mean 70.0
median 72.5
mode 80
groups of 5: 1
\`\`\``,
          starter: r`marks = [int(x) for x in input().split()]
`,
          tests: [
            { label: "Six marks", input: "80 65 80 50 70 75\n", output: "mean 70.0\nmedian 72.5\nmode 80\ngroups of 5: 1" },
            { label: "Odd count", input: "10 20 30\n", output: "mean 20.0\nmedian 20\nmode 10\ngroups of 5: 0", hidden: true },
          ],
          hints: [
            "Import the functions you need from statistics.",
            "`from statistics import mean, median, mode`.",
            "Format the mean with one decimal: `f\"mean {mean(marks):.1f}\"` (mean of whole numbers can be a whole number, so `round` alone may print `70`).",
            "`import math` and `math.floor(len(marks) / 5)`.",
          ],
          solution: r`import math
from statistics import mean, median, mode

marks = [int(x) for x in input().split()]
print(f"mean {mean(marks):.1f}")
print("median", median(marks))
print("mode", mode(marks))
print("groups of 5:", math.floor(len(marks) / 5))`,
          notes: "median of an even count averages the middle two (72.5); with an odd count it's the middle value. mode returns the first most-common value when there's a tie (Python 3.8+).",
        },
        {
          id: "stretch", kind: "task", title: "Days until an event", difficulty: 3,
          prompt: `Read two dates as \`YYYY-MM-DD\` (today, then the event). Using \`datetime.date.fromisoformat\`, print the number of days until the event and the weekday it falls on, like \`77 days, on a Friday\`. If the event is in the past print \`already happened\`.`,
          starter: r`from datetime import date
`,
          tests: [
            { label: "Christmas", input: "2026-10-09\n2026-12-25\n", output: "77 days, on a Friday" },
            { label: "Same day", input: "2026-10-09\n2026-10-09\n", output: "0 days, on a Friday", hidden: true, category: "boundary" },
            { label: "Past", input: "2026-10-09\n2026-01-01\n", output: "already happened", hidden: true, category: "edge" },
            { label: "Leap year", input: "2028-02-28\n2028-03-01\n", output: "2 days, on a Wednesday", hidden: true, category: "edge" },
          ],
          hints: [
            "`date.fromisoformat(\"2026-10-09\")` parses a date.",
            "Subtracting two dates gives a timedelta with `.days`.",
            "`event.strftime(\"%A\")` gives the weekday name.",
            "Check `days < 0` first.",
          ],
          solution: r`from datetime import date

today = date.fromisoformat(input())
event = date.fromisoformat(input())
days = (event - today).days
if days < 0:
    print("already happened")
else:
    print(f"{days} days, on a {event.strftime('%A')}")`,
          notes: "The standard library handles calendars, leap years and weekdays — never compute dates by hand.",
        },
      ],
      realWorld: "Every real Python program starts with imports. Knowing the standard library well saves you from installing (and trusting) third-party packages for things Python already does.",
      reteach: "Modules are toolboxes. `import math` brings the whole box onto your bench — you reach in with `math.`. `from math import sqrt` takes one tool out and puts it in your hand. An alias is a short label on the box. And Python looks for boxes on a fixed list of shelves (`sys.path`), starting with your own folder.",
      summary: [
        "`import m` (use `m.x`), `from m import x`, `import m as alias`; avoid `import *`.",
        "The standard library covers maths, dates, files, data formats, OS access and testing.",
        "Python searches sys.path — your folder first — so don't shadow standard module names.",
      ],
      cpp: {
        python: r`import math
print(math.sqrt(2))`,
        cpp: r`#include <cmath>
std::cout << std::sqrt(2.0);`,
        note: "`#include` pastes a header in at compile time; `import` loads and runs a module object at run time, once.",
      },
    },

    {
      id: "py-own-modules",
      title: "Your own modules and packages",
      minutes: 17,
      difficulty: 3,
      objectives: [
        "Split code into your own modules and import them",
        "Organise modules into a package with `__init__.py`",
        "Use `if __name__ == \"__main__\":` and avoid circular imports",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "When a file is run directly with `python tools.py`, what is `__name__` inside it?",
        options: [
          { text: "\"tools\"", why: "That's its name when it's imported." },
          { text: "\"__main__\"", why: "Correct." },
          { text: "None", why: "__name__ is always a string." },
        ],
        answer: 1,
        hint: "Direct run vs import.",
        explain: "The file you run is the `__main__` module; imported modules get their own name.",
      },
      why: "Real projects have many files: one for data access, one for calculations, one for the user interface. Modules and packages give each piece a home and let others reuse it — the same way you use `math`.",
      concept: [
        {
          title: "A module is just a .py file",
          body: `If \`geometry.py\` sits next to your program:

\`\`\`python
# geometry.py
PI = 3.14159
def circle_area(r):
    return PI * r * r
\`\`\`

\`\`\`python
# main.py
import geometry
print(geometry.circle_area(2))
\`\`\`

In this lesson's exercises, CodeMentor places helper files next to your \`main.py\` (listed under **Files next to your program**).`,
        },
        {
          title: "Packages",
          body: `A **package** is a folder of modules with an \`__init__.py\` file:

\`\`\`
shapes/
    __init__.py      # runs on "import shapes"; can expose names
    circle.py
    square.py
\`\`\`

\`\`\`python
from shapes import circle          # a module from the package
from shapes.square import area     # a function from a module
import shapes                      # runs shapes/__init__.py
\`\`\`

\`__init__.py\` often re-exports the main names: \`from .circle import area as circle_area\` (the leading dot means "this package").`,
        },
        {
          title: "__name__ == \"__main__\" and circular imports",
          body: `Put code that should run only when the file is executed directly under:

\`\`\`python
def main():
    ...
if __name__ == "__main__":
    main()
\`\`\`

Then importing the file (for its functions, or in tests) doesn't trigger the program.

**Circular imports**: if \`a.py\` imports \`b\` and \`b.py\` imports \`a\`, one of them sees a half-initialised module (\`ImportError\` or \`AttributeError\`). Fix by moving the shared code into a third module, or importing inside the function that needs it.`,
        },
      ],
      example: {
        title: "A program split across files",
        code: r`import mathtools
from mathtools import is_even
print(mathtools.square(7), is_even(10))
print(mathtools.__name__, __name__)
print(mathtools.DESCRIPTION)`,
        files: [{
          name: "mathtools.py",
          content: `"""Tiny maths helpers."""
print("loading mathtools")
DESCRIPTION = "Tiny maths helpers"

def square(n):
    return n * n

def is_even(n):
    return n % 2 == 0
`,
        }],
        output: "loading mathtools\n49 True\nmathtools __main__\nTiny maths helpers\n",
        lines: [
          [1, "Imports mathtools.py from the program's folder — its top-level code runs once (it prints 'loading')."],
          [2, "The second import reuses the already-loaded module: no second 'loading' line."],
          [3, "Call functions through the module name or the imported name."],
          [4, "The helper's __name__ is its file name; this file's is \"__main__\"."],
          [5, "Module-level constants are attributes too."],
        ],
      },
      mistakes: [
        { title: "Test code at the top level of a module", body: "`print(add(2, 3))` at the bottom of a helper runs on every import. Put it under `if __name__ == \"__main__\":`." },
        { title: "Circular imports", body: "Two modules importing each other at the top level fail confusingly. Extract the shared part into a third module." },
        { title: "Missing __init__.py expectations", body: "Modern Python can import folders without it (namespace packages), but `__init__.py` is what makes `import pkg` run setup and expose names — include it." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          prompt: "`greet.py` contains `def hi(): return \"hi\"` and, at the bottom, `if __name__ == \"__main__\": print(\"running greet\")`. What does main.py print?",
          code: r`import greet
print(greet.hi(), greet.__name__)`,
          files: [{ name: "greet.py", content: `def hi():\n    return "hi"\n\nif __name__ == "__main__":\n    print("running greet")\n` }],
          answer: "hi greet\n",
          hint: "Is greet the __main__ module here?",
          explain: "greet is imported, so its __name__ is \"greet\" and the guarded print doesn't run.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Only run main() when this file is executed directly.",
          code: r`def main():
    print("started")

if __name__ == "___":
    main()`,
          blanks: [["__main__"]],
          output: "started\n",
          hint: "The special name of the module being run.",
          explain: "When run directly, `__name__` is \"__main__\".",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "Python says `ImportError: attempted relative import with no known parent package` for this main.py. Which line?",
          code: r`from .helpers import tidy
print(tidy("  ok "))`,
          line: 1,
          fix: r`def tidy(s):
    return s.strip()
print(tidy("  ok "))`,
          output: "ok\n",
          hint: "Relative imports (with a dot) only work inside packages.",
          explain: "A leading dot means 'from my package', but main.py isn't inside a package. Use an absolute import (`from helpers import tidy`) — here the fix simply defines tidy locally.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "`a.py` does `import b` and `b.py` does `import a`, each at the top. What's the best fix?",
          options: [
            { text: "Add more imports", why: "That makes the cycle worse." },
            { text: "Move the code both need into a new module `common.py` that neither imports back", why: "Correct." },
            { text: "Rename the files", why: "The cycle remains." },
          ],
          answer: 1,
          hint: "Break the cycle.",
          explain: "Shared code in a third module turns the cycle into a tree; importing inside functions is a fallback.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Use a helper module", difficulty: 2,
          prompt: `A helper module \`textutils.py\` is next to your program (see the files list). Import it and use its functions to print, for the input line:

\`\`\`
words: 4
longest: banana
shout: APPLE KIWI BANANA FIG!
\`\`\`

(for \`apple kiwi banana fig\`).`,
          starter: r`line = input()
`,
          files: [{
            name: "textutils.py",
            content: `"""Small text helpers."""

def word_count(s):
    return len(s.split())

def longest_word(s):
    return max(s.split(), key=len)

def shout(s):
    return s.upper() + "!"
`,
          }],
          tests: [
            { label: "Fruits", input: "apple kiwi banana fig\n", output: "words: 4\nlongest: banana\nshout: APPLE KIWI BANANA FIG!" },
            { label: "One word", input: "hello\n", output: "words: 1\nlongest: hello\nshout: HELLO!", hidden: true, category: "boundary" },
          ],
          hints: [
            "Import the module by its file name without `.py`.",
            "`import textutils`.",
            "Call `textutils.word_count(line)` and the others.",
            "Print each result with its label.",
          ],
          solution: r`import textutils

line = input()
print("words:", textutils.word_count(line))
print("longest:", textutils.longest_word(line))
print("shout:", textutils.shout(line))`,
          notes: "The helper's functions are reused without copying them. In a real project, `textutils.py` could be shared by many programs and tested on its own.",
        },
        {
          id: "stretch", kind: "task", title: "Import from a package", difficulty: 3,
          prompt: `A package \`shapes/\` is next to your program with modules \`circle.py\` and \`square.py\`, and an \`__init__.py\` that sets \`VERSION\`. Read a size and print:

\`\`\`
shapes 1.0
circle area: 78.54
square area: 25
\`\`\`

(for size 5). Use \`import shapes\` for the version and \`from shapes import circle, square\` for the functions.`,
          starter: r`size = int(input())
`,
          files: [
            { name: "shapes/__init__.py", content: `"""A tiny shapes package."""\nVERSION = "1.0"\n` },
            { name: "shapes/circle.py", content: `import math\n\ndef area(r):\n    return math.pi * r * r\n` },
            { name: "shapes/square.py", content: `def area(side):\n    return side * side\n` },
          ],
          tests: [
            { label: "Size 5", input: "5\n", output: "shapes 1.0\ncircle area: 78.54\nsquare area: 25" },
            { label: "Size 1", input: "1\n", output: "shapes 1.0\ncircle area: 3.14\nsquare area: 1", hidden: true },
          ],
          hints: [
            "Importing a package runs its `__init__.py`.",
            "`import shapes` then `shapes.VERSION`.",
            "`from shapes import circle, square` gives you the two modules.",
            "`round(circle.area(size), 2)` and `square.area(size)`.",
          ],
          solution: r`import shapes
from shapes import circle, square

size = int(input())
print("shapes", shapes.VERSION)
print("circle area:", round(circle.area(size), 2))
print("square area:", square.area(size))`,
          notes: "Both modules define a function called `area` — the module names keep them apart. That's exactly what namespaces are for.",
        },
      ],
      realWorld: "Django apps, Flask blueprints and every library on PyPI are packages of modules. `if __name__ == \"__main__\":` is in almost every script so it can double as an importable module and a command-line tool.",
      reteach: "A module is one recipe card; a package is a recipe binder with a contents page (`__init__.py`). You can borrow a whole binder, one card from it, or one step from a card. A card that says 'only do this when cooking from *this* card directly' is the `__main__` check.",
      summary: [
        "Any .py file is a module; import it by file name. Its top-level code runs once on first import.",
        "A package is a folder with `__init__.py`; import modules or names from it; `.` means 'this package'.",
        "Guard script code with `if __name__ == \"__main__\":`; break circular imports with a shared module.",
      ],
    },

    {
      id: "py-pip",
      title: "Third-party packages with pip",
      minutes: 14,
      difficulty: 2,
      objectives: [
        "Install, upgrade and remove packages with pip",
        "Read and write a `requirements.txt` with version specifiers",
        "Judge whether a package is trustworthy before installing it",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 1,
        prompt: "Where does `pip install requests` download packages from by default?",
        options: [
          { text: "The Python standard library", why: "The standard library comes with Python; pip installs extra packages." },
          { text: "PyPI, the Python Package Index", why: "Correct." },
          { text: "GitHub only", why: "pip uses PyPI unless told otherwise." },
        ],
        answer: 1,
        hint: "pypi.org",
        explain: "pip installs from PyPI (pypi.org) by default.",
      },
      why: "The Python ecosystem — NumPy, pandas, Django, FastAPI, PyTorch, requests — lives on PyPI. Installing packages safely and recording exact versions is how projects stay working on every machine.",
      concept: [
        {
          title: "pip basics",
          body: `\`\`\`
python -m pip install requests          # latest version
python -m pip install "requests==2.32.3" # an exact version
python -m pip install --upgrade requests
python -m pip uninstall requests
python -m pip list                       # what's installed
python -m pip show requests              # details of one package
\`\`\`

\`python -m pip\` makes sure you use the pip that belongs to *this* Python. Install into a **virtual environment** (Module 30), not your system Python.

> CodeMentor's sandbox has the standard library only — pip can't install packages here. Lessons that use packages show that code separately for you to run on your own computer.`,
        },
        {
          title: "requirements.txt and version specifiers",
          body: `\`\`\`
requests==2.32.3      # exactly this version
numpy>=1.26,<3        # a range
pandas~=2.2           # compatible release: >=2.2, <3.0
\`\`\`

\`pip install -r requirements.txt\` installs everything; \`pip freeze > requirements.txt\` records what's installed now. Pinning exact versions makes builds **reproducible**.`,
        },
        {
          title: "Installing safely",
          body: `Packages run code on your machine. Before installing: check the exact name (typo-squatting attacks use names like \`reqeusts\`), the project's homepage and maintainers, recent releases and downloads. Tools like \`pip-audit\` check installed packages against known vulnerabilities (Module 33).`,
        },
      ],
      example: {
        title: "Parsing a requirements file",
        code: r`reqs = """requests==2.32.3
numpy>=1.26
# a comment
pandas~=2.2
"""
for line in reqs.splitlines():
    line = line.strip()
    if not line or line.startswith("#"):
        continue
    for op in ("==", ">=", "~="):
        if op in line:
            name, version = line.split(op)
            print(f"{name:10} {op} {version}")
            break`,
        output: "requests   == 2.32.3\nnumpy      >= 1.26\npandas     ~= 2.2\n",
        lines: [
          [1, "A requirements file is plain text: one package per line."],
          [8, "Skip blank lines and comments."],
          [10, "Find which specifier the line uses."],
          [11, "Split into the package name and the version."],
          [12, "Align the names in a column of width 10."],
        ],
      },
      mistakes: [
        { title: "Installing into the wrong Python", body: "Plain `pip` may belong to another Python. Use `python -m pip` inside an activated virtual environment." },
        { title: "Unpinned dependencies", body: "`numpy` with no version means a future release can break your project. Pin versions for applications." },
        { title: "Typos in package names", body: "Malicious look-alike packages exist. Copy the name from the project's official page." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 2,
          code: r`spec = "flask>=3.0"
name, ver = spec.split(">=")
major = int(ver.split(".")[0])
print(name, major, major >= 3)`,
          answer: "flask 3 True\n",
          hint: "Split at the specifier, then at the dot.",
          explain: "The name is \"flask\", the version \"3.0\"; its major number is 3.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Pin pandas to exactly version 2.2.3 (as a requirements line).",
          code: r`line = "pandas___2.2.3"
print(line)`,
          blanks: [["=="]],
          output: "pandas==2.2.3\n",
          hint: "The exact-version operator.",
          explain: "`==` pins an exact version.",
        },
        {
          id: "b1", kind: "bug", difficulty: 2,
          prompt: "This should skip comment lines but prints `# tools` too. Which line?",
          code: r`lines = ["requests==2.32.3", "# tools", "rich==13.9.4"]
for line in lines:
    if line.startswith("//"):
        continue
    print(line)`,
          line: 3,
          fix: r`lines = ["requests==2.32.3", "# tools", "rich==13.9.4"]
for line in lines:
    if line.startswith("#"):
        continue
    print(line)`,
          output: "requests==2.32.3\nrich==13.9.4\n",
          hint: "Which character starts a comment in requirements files?",
          explain: "Comments start with `#`, not `//`.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 2,
          prompt: "Why prefer `python -m pip install x` over `pip install x`?",
          options: [
            { text: "It's faster", why: "Speed is the same." },
            { text: "It guarantees pip installs into the Python you're actually running", why: "Correct." },
            { text: "It installs a newer version", why: "Versions don't depend on how you call pip." },
          ],
          answer: 1,
          hint: "Many computers have several Pythons.",
          explain: "`python -m pip` runs the pip module of that exact interpreter.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Requirements checker", difficulty: 2,
          prompt: `Read requirement lines until \`end\`. Ignore blank lines and \`#\` comments. Print \`pinned: name\` for lines using \`==\` and \`unpinned: name\` for anything else (a bare name or another operator), then \`pinned N of M\`.`,
          starter: r`pinned = 0
total = 0
`,
          tests: [
            { label: "Mixed", input: "requests==2.32.3\nnumpy\n# dev tools\n\npytest>=8\nend\n", output: "pinned: requests\nunpinned: numpy\nunpinned: pytest\npinned 1 of 3" },
            { label: "All pinned", input: "a==1\nb==2\nend\n", output: "pinned: a\npinned: b\npinned 2 of 2", hidden: true },
          ],
          hints: [
            "Loop with `while True` and stop at \"end\".",
            "Skip `not line or line.startswith(\"#\")`.",
            "The name is everything before the first of `=<>~!`.",
            "Use `re.split(r\"[=<>~!]\", line)[0]` — or loop over the operators and split.",
          ],
          solution: r`import re

pinned = 0
total = 0
while True:
    line = input().strip()
    if line == "end":
        break
    if not line or line.startswith("#"):
        continue
    total += 1
    name = re.split(r"[=<>~!]", line)[0]
    if "==" in line:
        pinned += 1
        print("pinned:", name)
    else:
        print("unpinned:", name)
print(f"pinned {pinned} of {total}")`,
          notes: "Real tools (pip-tools, Poetry, uv) parse requirement specifiers like this to produce reproducible lock files. `re` is covered in Module 20.",
        },
        {
          id: "stretch", kind: "task", title: "Compare versions", difficulty: 3,
          prompt: `Read two version strings like \`2.10.1\` and \`2.9.12\`. Print which is newer: \`first\`, \`second\` or \`same\`. Compare numerically part by part (so 2.10 > 2.9); missing parts count as 0 (\`1.2\` == \`1.2.0\`).`,
          starter: r`a = input()
b = input()
`,
          tests: [
            { label: "2.10.1 vs 2.9.12", input: "2.10.1\n2.9.12\n", output: "first" },
            { label: "Equal with missing part", input: "1.2\n1.2.0\n", output: "same", hidden: true, category: "edge" },
            { label: "Second newer", input: "3.11.9\n3.12.0\n", output: "second", hidden: true },
          ],
          hints: [
            "Turn each version into a list of ints.",
            "Pad the shorter list with zeros.",
            "Lists of ints compare element by element.",
            "`pa = [int(x) for x in a.split(\".\")]`; pad both to the same length; compare with `>`, `<`.",
          ],
          solution: r`a = input()
b = input()
pa = [int(x) for x in a.split(".")]
pb = [int(x) for x in b.split(".")]
n = max(len(pa), len(pb))
pa += [0] * (n - len(pa))
pb += [0] * (n - len(pb))
print("first" if pa > pb else "second" if pa < pb else "same")`,
          notes: "Comparing version strings as text gets 2.10 vs 2.9 wrong. The `packaging.version` library (third-party) handles the full rules, including pre-releases like 3.13.0rc1.",
        },
      ],
      realWorld: "Every Python project has a dependency list (requirements.txt or pyproject.toml). CI systems install from it on every run, security scanners read it, and pinned versions make 'works on my machine' bugs rarer.",
      reteach: "PyPI is a giant app store for Python code, and pip is the installer. requirements.txt is your shopping list with exact brand and size (version) so anyone can buy exactly the same things. Like any app store, check the publisher before installing.",
      summary: [
        "`python -m pip install/uninstall/list/show`; install inside a virtual environment.",
        "requirements.txt with `==`, `>=`, `~=` specifiers; `pip install -r`, `pip freeze`.",
        "Check package names and sources; audit dependencies for known vulnerabilities.",
      ],
      libraryCode: [{
        title: "Using an installed package (requests)",
        code: `import requests

response = requests.get("https://api.github.com", timeout=10)
print(response.status_code)
print(response.headers["content-type"])`,
        note: "Run `python -m pip install requests` in a virtual environment first. The CodeMentor sandbox has no network and no third-party packages, so this example can't run here.",
      }],
    },
  ],
  exam: [
    {
      id: "e1", kind: "mcq", difficulty: 2,
      prompt: "Which import lets you write `dt.date.today()`?",
      options: [
        { text: "`from datetime import date as dt`", why: "Then you'd write `dt.today()`." },
        { text: "`import datetime as dt`", why: "Correct." },
        { text: "`import dt`", why: "There's no module called dt." },
      ],
      answer: 1,
      hint: "Alias the module.",
      explain: "`import datetime as dt` binds the module to the name dt.",
    },
    {
      id: "e2", kind: "predict", difficulty: 2,
      code: r`import math, statistics
print(math.factorial(5), statistics.median([7, 1, 3, 9]), math.comb(5, 2))`,
      answer: "120 5.0 10\n",
      hint: "median of an even count averages the middle pair.",
      explain: "5! = 120; sorted [1, 3, 7, 9] → (3 + 7) / 2 = 5.0; C(5, 2) = 10.",
    },
    {
      id: "e3", kind: "fill", difficulty: 2,
      prompt: "Re-export a function in a package's `__init__.py` from its sibling module `circle.py`.",
      code: r`line = "from ___circle import area"
print(line)`,
      blanks: [["."]],
      output: "from .circle import area\n",
      hint: "Relative import inside a package.",
      explain: "A leading dot means 'the circle module in this package'.",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: grade-book package", difficulty: 3,
    prompt: `A package \`gradebook/\` is provided with \`grading.py\` (has \`letter(mark)\`) and an empty \`report.py\`. **Your main.py** must import from the package and print a report for lines \`name mark\` read until \`end\`:

\`\`\`
Asha: 91 (A)
Ravi: 64 (C)
class average: 77.5
\`\`\`

Use \`from gradebook.grading import letter\`. Compute the average yourself with \`statistics.mean\`, printed with 1 decimal.`,
    starter: r`marks = {}
`,
    files: [
      { name: "gradebook/__init__.py", content: `"""Grade-book helpers."""\n` },
      { name: "gradebook/grading.py", content: `def letter(mark):\n    if mark >= 90:\n        return "A"\n    if mark >= 75:\n        return "B"\n    if mark >= 50:\n        return "C"\n    return "F"\n` },
      { name: "gradebook/report.py", content: `# (empty for now)\n` },
    ],
    tests: [
      { label: "Two students", input: "Asha 91\nRavi 64\nend\n", output: "Asha: 91 (A)\nRavi: 64 (C)\nclass average: 77.5" },
      { label: "Three students", input: "A 50\nB 49\nC 100\nend\n", output: "A: 50 (C)\nB: 49 (F)\nC: 100 (A)\nclass average: 66.3", hidden: true },
    ],
    hints: [
      "Import the function from the package's module.",
      "`from gradebook.grading import letter` and `from statistics import mean`.",
      "Read lines until \"end\", store name → mark.",
      "Print each line with `letter(mark)`, then `round(mean(marks.values()), 1)`.",
    ],
    solution: r`from statistics import mean
from gradebook.grading import letter

marks = {}
while True:
    line = input()
    if line == "end":
        break
    name, mark = line.split()
    marks[name] = int(mark)
for name, mark in marks.items():
    print(f"{name}: {mark} ({letter(mark)})")
print(f"class average: {mean(marks.values()):.1f}")`,
    notes: "Your program and the package's modules stay separate; the grading rules live in one place that other programs can import too.",
  },
};
