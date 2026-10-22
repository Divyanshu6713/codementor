import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 13 — Comprehensions and iteration. */
export const M13: PyModuleDef = {
  id: "py-iteration",
  number: 13,
  level: 2,
  title: "Comprehensions and Iteration",
  summary: "List, set and dict comprehensions; generator expressions; enumerate, zip, map, filter, any and all; iterables versus iterators; iter() and next(); lazy evaluation.",
  track: "core",
  prereqs: ["py-functions"],
  lessons: [
    {
      id: "py-comprehensions",
      title: "Comprehensions of every kind",
      minutes: 16,
      difficulty: 3,
      objectives: [
        "Write list, set and dict comprehensions with filters",
        "Use nested comprehensions for flattening and grids",
        "Write generator expressions and know when they save memory",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "What type is `{n % 3 for n in range(10)}`?",
        options: [
          { text: "dict", why: "A dict comprehension needs `key: value`." },
          { text: "set", why: "Correct — braces with a single expression make a set." },
          { text: "list", why: "Lists use square brackets." },
        ],
        answer: 1,
        hint: "Braces without a colon…",
        explain: "`{expr for ...}` builds a set; `{k: v for ...}` builds a dict.",
      },
      why: "Comprehensions express 'build a collection from another' in one readable line — the most common transformation in data code. Generator expressions do the same lazily, processing millions of items without storing them all.",
      concept: [
        {
          title: "Four shapes",
          body: `\`\`\`python
[x * 2 for x in nums]                 # list
{w.lower() for w in words}            # set (unique)
{name: len(name) for name in names}   # dict
(x * x for x in range(10**9))         # generator expression (lazy)
\`\`\`

All accept filters: \`[x for x in nums if x > 0]\`. A generator expression passed straight to a function doesn't need extra brackets: \`sum(x * x for x in nums)\`.`,
        },
        {
          title: "Nested comprehensions",
          body: `Read the \`for\` clauses **left to right, as nested loops**:

\`\`\`python
flat = [x for row in grid for x in row]          # flatten a grid
pairs = [(a, b) for a in "ab" for b in "12"]     # ('a','1'), ('a','2'), ('b','1'), …
table = [[r * c for c in range(1, 4)] for r in range(1, 4)]   # a grid
\`\`\`

If a comprehension needs more than two \`for\`s or a complex condition, write a normal loop.`,
        },
        {
          title: "Generator expressions and memory",
          body: `A list comprehension builds the whole list in memory; a generator expression produces one item at a time, on demand:

\`\`\`python
sum([x * x for x in range(10_000_000)])   # builds a 10-million-item list first
sum(x * x for x in range(10_000_000))     # constant memory
\`\`\`

A generator can be consumed **only once**. Module 19 covers generators in depth.`,
        },
      ],
      example: {
        title: "Reshaping data",
        code: r`words = ["Apple", "avocado", "Banana", "blueberry", "cherry"]
initials = {w[0].lower() for w in words}
by_letter = {c: [w for w in words if w.lower().startswith(c)] for c in sorted(initials)}
print(sorted(initials))
print(by_letter)
grid = [[1, 2, 3], [4, 5, 6]]
print([x for row in grid for x in row if x % 2])
squares = (n * n for n in range(1, 6))
print(sum(squares), sum(squares))`,
        output: "['a', 'b', 'c']\n{'a': ['Apple', 'avocado'], 'b': ['Banana', 'blueberry'], 'c': ['cherry']}\n[1, 3, 5]\n55 0\n",
        lines: [
          [2, "A set comprehension: unique first letters."],
          [3, "A dict comprehension whose values are list comprehensions."],
          [7, "Flatten the grid (outer loop first) and keep odd numbers."],
          [8, "A generator expression — nothing is computed yet."],
          [9, "The first sum consumes the generator (55); the second finds it empty (0)."],
        ],
      },
      mistakes: [
        { title: "Reusing a generator", body: "A generator expression is exhausted after one pass. Make a list if you need the values twice." },
        { title: "Wrong nesting order", body: "`[x for x in row for row in grid]` fails — the outer loop must come first." },
        { title: "Cramming logic in", body: "Comprehensions with nested conditions and calls become unreadable. Use a loop or a helper function." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`print([a + b for a in "xy" for b in "12"])
print({len(w): w for w in ["hi", "yo", "hey"]})`,
          answer: "['x1', 'x2', 'y1', 'y2']\n{2: 'yo', 3: 'hey'}\n",
          hint: "Later keys overwrite earlier ones in a dict.",
          explain: "The outer loop is a, inner is b. In the dict, 'yo' overwrites 'hi' for key 2.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Flatten the list of lists.",
          code: r`nested = [[1, 2], [3], [4, 5]]
print([x for part in nested ___ x in part])`,
          blanks: [["for"]],
          output: "[1, 2, 3, 4, 5]\n",
          hint: "A second for clause.",
          explain: "`[x for part in nested for x in part]` reads as two nested loops.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "This should print the total twice (`30 30`) but prints `30 0`. Which line causes it?",
          code: r`prices = [10, 20]
doubled = (p for p in prices)
print(sum(doubled), sum(doubled))`,
          line: 2,
          fix: r`prices = [10, 20]
doubled = [p for p in prices]
print(sum(doubled), sum(doubled))`,
          output: "30 30\n",
          hint: "How many times can a generator be consumed?",
          explain: "A generator expression is exhausted after the first sum. Use a list comprehension to reuse the values.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "You need the sum of squares of 100 million numbers. Which uses the least memory?",
          options: [
            { text: "`sum([x * x for x in range(10**8)])`", why: "Builds a huge list first." },
            { text: "`sum(x * x for x in range(10**8))`", why: "Correct — one value at a time." },
            { text: "`sum(list(map(lambda x: x * x, range(10**8))))`", why: "Also builds the full list." },
          ],
          answer: 1,
          hint: "Lazy vs eager.",
          explain: "The generator expression never stores more than one square at a time.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Word lengths report", difficulty: 2,
          prompt: `Read a sentence. Using comprehensions, print:

1. a dict word → length (lower-cased words, first occurrence order),
2. the set of distinct lengths, sorted as a list,
3. the total number of letters using a generator expression with \`sum\`.`,
          starter: r`words = input().lower().split()
`,
          tests: [
            { label: "Sentence", input: "The cat saw the dog\n", output: "{'the': 3, 'cat': 3, 'saw': 3, 'dog': 3}\n[3]\n15" },
            { label: "Mixed lengths", input: "a bb ccc bb\n", output: "{'a': 1, 'bb': 2, 'ccc': 3}\n[1, 2, 3]\n8", hidden: true },
          ],
          hints: [
            "dict: `{w: len(w) for w in words}` (duplicates collapse).",
            "set of lengths: `{len(w) for w in words}`.",
            "letters: `sum(len(w) for w in words)` counts every word, including repeats.",
            "Print `sorted(...)` of the set.",
          ],
          solution: r`words = input().lower().split()
print({w: len(w) for w in words})
print(sorted({len(w) for w in words}))
print(sum(len(w) for w in words))`,
          notes: "Same source, three shapes: dict (word → length), set (distinct lengths), generator (streamed total).",
        },
        {
          id: "stretch", kind: "task", title: "Multiplication grid", difficulty: 3,
          prompt: `Read n. Build an n × n multiplication table with a **nested list comprehension** and print it with each number right-aligned in a width of 4.`,
          starter: r`n = int(input())
`,
          tests: [
            { label: "n = 3", input: "3\n", output: "   1   2   3\n   2   4   6\n   3   6   9" },
            { label: "n = 1", input: "1\n", output: "   1", hidden: true, category: "boundary" },
          ],
          hints: [
            "Row r holds r*1, r*2, … r*n.",
            "`table = [[r * c for c in range(1, n + 1)] for r in range(1, n + 1)]`.",
            "Format each number with `f\"{x:4}\"`.",
            "`print(\"\".join(f\"{x:4}\" for x in row))` for each row.",
          ],
          solution: r`n = int(input())
table = [[r * c for c in range(1, n + 1)] for r in range(1, n + 1)]
for row in table:
    print("".join(f"{x:4}" for x in row))`,
          notes: "The outer comprehension makes the rows; the inner one makes each row's cells — and each row is a new list (no aliasing).",
        },
      ],
      realWorld: "Comprehensions transform API responses, filter log lines, build lookup dicts from database rows, and feed generator expressions into `sum`, `max` and `any` across huge files.",
      reteach: "A comprehension is a sentence: *give me `x * 2`, for each `x` in `nums`, if `x` is positive*. Square brackets put the results in a list, braces in a set, `key: value` braces in a dict, and round brackets make a tap that pours results one at a time (a generator).",
      summary: [
        "List `[ ]`, set `{ }`, dict `{k: v}` comprehensions; filters with `if`.",
        "Nested `for` clauses read left to right like nested loops.",
        "Generator expressions `( )` are lazy, memory-light and single-use.",
      ],
    },

    {
      id: "py-builtin-iteration",
      title: "enumerate, zip, map, filter, any and all",
      minutes: 16,
      difficulty: 3,
      objectives: [
        "Loop with an index using `enumerate`",
        "Walk several sequences together with `zip` (and unzip with `zip(*...)`)",
        "Use `map`, `filter`, `any`, `all` — and know when a comprehension is clearer",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "`list(zip([1, 2, 3], \"ab\"))` is…",
        options: [
          { text: "`[(1, 'a'), (2, 'b'), (3, None)]`", why: "zip stops at the shortest input." },
          { text: "`[(1, 'a'), (2, 'b')]`", why: "Correct." },
          { text: "An error: different lengths", why: "zip simply stops early." },
        ],
        answer: 1,
        hint: "What happens when one input runs out?",
        explain: "zip pairs items until the shortest input is exhausted (use `strict=True` in 3.10+ to require equal lengths).",
      },
      why: "These built-ins remove the boilerplate from loops: no manual index counters (`enumerate`), no index juggling across parallel lists (`zip`), and one-word answers to 'is any/every item valid?' (`any`/`all`).",
      concept: [
        {
          title: "enumerate and zip",
          body: `\`\`\`python
for i, name in enumerate(names, start=1):
    print(i, name)

for name, mark in zip(names, marks):
    print(name, mark)

pairs = [("a", 1), ("b", 2)]
letters, numbers = zip(*pairs)     # unzip → ('a', 'b'), (1, 2)
dict(zip(keys, values))            # build a dict from two lists
\`\`\`

\`zip(a, b, strict=True)\` (3.10+) raises ValueError if lengths differ.`,
        },
        {
          title: "map and filter",
          body: `\`\`\`python
list(map(int, ["1", "2"]))            # [1, 2]
list(filter(str.isdigit, ["1", "a"])) # ['1']
\`\`\`

Both are **lazy** iterators. With a named function they're neat (\`map(int, ...)\`); with a lambda, a comprehension is usually clearer: \`[x * 2 for x in xs]\` over \`map(lambda x: x * 2, xs)\`.`,
        },
        {
          title: "any and all",
          body: `\`\`\`python
any(m < 40 for m in marks)     # did anyone fail?
all(m >= 40 for m in marks)    # did everyone pass?
\`\`\`

Both **short-circuit** (stop at the first decisive item). Edge cases: \`any([])\` is False, \`all([])\` is True.`,
        },
      ],
      example: {
        title: "Results table without index juggling",
        code: r`names = ["Asha", "Ravi", "Zoe"]
marks = ["91", "38", "77"]
marks = list(map(int, marks))
for rank, (name, m) in enumerate(sorted(zip(names, marks), key=lambda p: -p[1]), start=1):
    print(rank, name, m)
print(any(m < 40 for m in marks), all(m > 30 for m in marks))
passed = list(filter(lambda p: p[1] >= 40, zip(names, marks)))
print(passed)
who, scores = zip(*passed)
print(who, scores, dict(zip(names, marks)))`,
        output: "1 Asha 91\n2 Zoe 77\n3 Ravi 38\nTrue True\n[('Asha', 91), ('Zoe', 77)]\n('Asha', 'Zoe') (91, 77) {'Asha': 91, 'Ravi': 38, 'Zoe': 77}\n",
        lines: [
          [3, "map applies int to every string."],
          [4, "zip pairs names with marks; sort by mark; enumerate numbers the ranks from 1."],
          [6, "any: did anyone fail? all: did everyone score above 30?"],
          [7, "filter keeps the pairs whose mark is at least 40."],
          [9, "zip(*pairs) unzips into two tuples; dict(zip(...)) builds a mapping."],
        ],
      },
      mistakes: [
        { title: "`for i in range(len(x))`", body: "Usually un-Pythonic; use `for item in x` or `for i, item in enumerate(x)`." },
        { title: "Silent truncation in zip", body: "Mismatched lengths lose data quietly. Use `strict=True` when lengths must match." },
        { title: "Printing a map object", body: "`print(map(int, xs))` shows `<map object …>`. Wrap in `list(...)`." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 2,
          code: r`for i, ch in enumerate("abc", 10):
    print(i, ch, end=" | ")
print()
print(list(zip("ab", [1, 2, 3], (True, False))))`,
          answer: "10 a | 11 b | 12 c | \n[('a', 1, True), ('b', 2, False)]\n",
          hint: "enumerate's second argument is the starting number.",
          explain: "Counting starts at 10. zip works with any number of iterables and stops at the shortest (2).",
        },
        {
          id: "p2", kind: "predict", difficulty: 3,
          code: r`print(any([]), all([]), any([0, "", None]), all([1, "x", [0]]))`,
          answer: "False True False True\n",
          hint: "Think about the empty cases and truthiness of [0].",
          explain: "No items: any is False, all is True (vacuously). All falsy → any False. 1, \"x\" and [0] are all truthy → True.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Build a dict from two parallel lists.",
          code: r`codes = ["IN", "JP"]
names = ["India", "Japan"]
print(dict(___(codes, names)))`,
          blanks: [["zip"]],
          output: "{'IN': 'India', 'JP': 'Japan'}\n",
          hint: "Pair them up.",
          explain: "`dict(zip(codes, names))` turns the pairs into key/value entries.",
        },
        {
          id: "b1", kind: "bug", difficulty: 2,
          prompt: "This should print `[1, 4, 9]` but prints something like `<map object at 0x…>`. Which line?",
          code: r`nums = [1, 2, 3]
squares = map(lambda n: n * n, nums)
print(squares)`,
          line: 3,
          fix: r`nums = [1, 2, 3]
squares = map(lambda n: n * n, nums)
print(list(squares))`,
          output: "[1, 4, 9]\n",
          hint: "map is lazy.",
          explain: "map returns a lazy iterator; convert it to a list to see the values (or use a list comprehension).",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Numbered checklist", difficulty: 2,
          prompt: `Read a line of tasks separated by commas and a line of \`y\`/\`n\` flags (same count, space-separated). Print each task numbered from 1 with \`[x]\` for done and \`[ ]\` for not done, then \`All done!\` if every flag is \`y\`, otherwise \`Remaining: N\`.`,
          starter: r`tasks = [t.strip() for t in input().split(",")]
flags = input().split()
`,
          tests: [
            { label: "Mixed", input: "homework, laundry, call mom\ny n y\n", output: "1. [x] homework\n2. [ ] laundry\n3. [x] call mom\nRemaining: 1" },
            { label: "All done", input: "a, b\ny y\n", output: "1. [x] a\n2. [x] b\nAll done!", hidden: true, category: "edge" },
          ],
          hints: [
            "Walk tasks and flags together.",
            "`for i, (task, flag) in enumerate(zip(tasks, flags), start=1):`.",
            "The box is `\"[x]\" if flag == \"y\" else \"[ ]\"`.",
            "Use `all(f == \"y\" for f in flags)` and count the n's for the last line.",
          ],
          solution: r`tasks = [t.strip() for t in input().split(",")]
flags = input().split()
for i, (task, flag) in enumerate(zip(tasks, flags), start=1):
    box = "[x]" if flag == "y" else "[ ]"
    print(f"{i}. {box} {task}")
if all(f == "y" for f in flags):
    print("All done!")
else:
    print("Remaining:", flags.count("n"))`,
          notes: "enumerate + zip together replace two manual index variables.",
        },
        {
          id: "stretch", kind: "task", title: "Validate a batch", difficulty: 3,
          prompt: `Read a line of user ages (whole numbers). Print three lines:

1. \`valid: True\` if **all** ages are between 13 and 120 inclusive,
2. \`any minors: True\` if **any** age is under 18,
3. the 1-based positions of invalid ages as a list, using \`enumerate\` and a comprehension.`,
          starter: r`ages = list(map(int, input().split()))
`,
          tests: [
            { label: "One invalid", input: "15 22 9 40\n", output: "valid: False\nany minors: True\n[3]" },
            { label: "All good adults", input: "18 30 65\n", output: "valid: True\nany minors: False\n[]", hidden: true },
            { label: "Boundaries", input: "13 120 121 12\n", output: "valid: False\nany minors: True\n[3, 4]", hidden: true, category: "boundary" },
          ],
          hints: [
            "`all(13 <= a <= 120 for a in ages)`.",
            "`any(a < 18 for a in ages)`.",
            "Positions: `[i for i, a in enumerate(ages, start=1) if not 13 <= a <= 120]`.",
            "Print with the labels shown.",
          ],
          solution: r`ages = list(map(int, input().split()))
ok = lambda a: 13 <= a <= 120
print("valid:", all(ok(a) for a in ages))
print("any minors:", any(a < 18 for a in ages))
print([i for i, a in enumerate(ages, start=1) if not ok(a)])`,
          notes: "any/all with generator expressions read like the business rule itself, and stop at the first decisive value.",
        },
      ],
      realWorld: "`zip` lines up columns from CSV files; `enumerate` gives line numbers in parsers and error messages; `any`/`all` express validation rules; `map(int, line.split())` is the standard way to read numbers in competitive programming.",
      reteach: "`enumerate` is a ticket machine handing out numbers as items go past. `zip` is a zipper: it locks teeth from two (or more) sides together, pair by pair, and stops when one side runs out. `any` asks 'is at least one true?' and `all` asks 'are they all true?' — both stop asking as soon as they know.",
      summary: [
        "`enumerate(x, start=1)` gives (index, item); `zip(a, b)` pairs items, `zip(*pairs)` unzips.",
        "`map`/`filter` are lazy; prefer comprehensions with lambdas.",
        "`any`/`all` short-circuit; `any([])` is False, `all([])` is True.",
      ],
    },

    {
      id: "py-iterators",
      title: "Iterables, iterators and lazy evaluation",
      minutes: 16,
      difficulty: 4,
      objectives: [
        "Tell an iterable from an iterator",
        "Drive iteration by hand with `iter()` and `next()`",
        "Explain lazy evaluation and when it helps",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "`it = iter([1, 2])`, then `next(it)`, `next(it)`, `next(it)`. The third call…",
        options: [
          { text: "returns 1 again", why: "Iterators don't restart." },
          { text: "raises StopIteration", why: "Correct — the iterator is exhausted." },
          { text: "returns None", why: "Unless you give next() a default, it raises." },
        ],
        answer: 1,
        hint: "Iterators only move forward.",
        explain: "When an iterator has no items left, `next` raises StopIteration (or returns the default from `next(it, default)`).",
      },
      why: "Every `for` loop in Python runs on iterators. Understanding the protocol explains why a file can be read only once, why `zip` and `map` results disappear after use, and how Python handles data streams far bigger than memory.",
      concept: [
        {
          title: "Iterable vs iterator",
          body: `- An **iterable** can produce an iterator: lists, strings, dicts, sets, files, ranges. You can loop over it many times.
- An **iterator** produces values one at a time with \`next()\` and remembers its position. It's used up after one pass. Iterators are also iterable (\`iter(it) is it\`).

\`\`\`python
nums = [10, 20]          # iterable
it = iter(nums)          # iterator
next(it)                 # 10
next(it)                 # 20
next(it, "done")         # 'done' instead of StopIteration
\`\`\``,
        },
        {
          title: "What a for loop really does",
          body: `\`\`\`python
for x in nums:
    body(x)
# is roughly
it = iter(nums)
while True:
    try:
        x = next(it)
    except StopIteration:
        break
    body(x)
\`\`\`

(\`try/except\` is Module 16.) Module 19 shows how to write your own iterators.`,
        },
        {
          title: "Lazy evaluation",
          body: `Lazy objects compute values **only when asked**: \`range\`, \`map\`, \`filter\`, \`zip\`, \`enumerate\`, generator expressions, file objects. Benefits:

- **Memory**: \`range(10**12)\` takes a few bytes.
- **Speed to first result**: you can stop early (\`next(x for x in data if x > 100)\`).
- **Infinite sequences**: \`itertools.count()\` never ends — take what you need.

Cost: single use, and no \`len()\` or indexing on most lazy iterators.`,
        },
      ],
      example: {
        title: "Driving iteration by hand",
        code: r`colors = ["red", "green", "blue"]
it = iter(colors)
print(next(it), next(it))
print(list(it), list(it))
print(next(it, "no more"))
r = range(10**12)
print(len(r), r[5], 999 in r)
numbers = map(int, ["4", "15", "8", "42"])
first_big = next(n for n in numbers if n > 10)
print(first_big, list(numbers))`,
        output: "red green\n['blue'] []\nno more\n1000000000000 5 True\n15 [8, 42]\n",
        lines: [
          [2, "Ask the list for an iterator."],
          [3, "Each next() moves one step forward."],
          [4, "list() drains what's left; the second list() finds nothing."],
          [5, "A default avoids StopIteration."],
          [7, "range is lazy but supports len, indexing and fast `in`."],
          [9, "next() on a generator expression: stop at the first match."],
          [10, "map continued from where the search stopped: only 8 and 42 remain."],
        ],
      },
      mistakes: [
        { title: "Iterating an iterator twice", body: "The second pass is empty. Keep a list if you need several passes." },
        { title: "Calling len() on a map/zip/generator", body: "TypeError: lazy iterators don't know their length. Convert with list() first (if it fits in memory)." },
        { title: "next() without a default on a maybe-empty search", body: "`next(x for x in data if cond)` raises StopIteration when nothing matches; add a default." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`z = zip("abc", [1, 2, 3])
print(next(z))
print(len(list(z)), len(list(z)))`,
          answer: "('a', 1)\n2 0\n",
          hint: "zip returns an iterator.",
          explain: "next takes the first pair; list() drains the remaining two; the second list() is empty.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Avoid StopIteration when no number is negative.",
          code: r`nums = [3, 7, 9]
first_neg = next((n for n in nums if n < 0), ___)
print(first_neg)`,
          blanks: [["None"]],
          output: "None\n",
          hint: "next's second argument.",
          explain: "`next(iterator, default)` returns the default instead of raising StopIteration.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "This should print the count and then the total (`3 60`) but prints `3 0`. Which line causes it?",
          code: r`prices = map(int, "10 20 30".split())
count = len(list(prices))
total = sum(prices)
print(count, total)`,
          line: 1,
          fix: r`prices = list(map(int, "10 20 30".split()))
count = len(prices)
total = sum(prices)
print(count, total)`,
          output: "3 60\n",
          hint: "How many times can a map be consumed?",
          explain: "`list(prices)` drains the map; sum then sees nothing. Materialise the map once as a list.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "Which statement is true?",
          options: [
            { text: "Every iterable is an iterator", why: "A list is iterable but not an iterator (no __next__)." },
            { text: "Every iterator is iterable", why: "Correct — iter(it) returns the iterator itself." },
            { text: "Iterators can be rewound with reset()", why: "There's no such method; create a new iterator." },
          ],
          answer: 1,
          hint: "What does iter() do to an iterator?",
          explain: "Iterators implement __iter__ (returning themselves) and __next__, so they're iterable; plain iterables only implement __iter__.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Read in pairs with next()", difficulty: 3,
          prompt: `Read a line of words. Using **one iterator** and \`next()\`, print them two per line (\`word1 word2\`). If there's an odd word at the end, print it alone.`,
          starter: r`words = input().split()
it = iter(words)
`,
          tests: [
            { label: "Even", input: "a b c d\n", output: "a b\nc d" },
            { label: "Odd", input: "one two three\n", output: "one two\nthree" },
            { label: "Single", input: "solo\n", output: "solo", hidden: true, category: "edge" },
          ],
          hints: [
            "Loop over the iterator; inside, take one more item with next().",
            "`for first in it:` then `second = next(it, None)`.",
            "If second is None, print first alone.",
            "Because the for loop and next() share one iterator, each word is used once.",
          ],
          solution: r`words = input().split()
it = iter(words)
for first in it:
    second = next(it, None)
    print(first if second is None else f"{first} {second}")`,
          notes: "The for loop and next() advance the same iterator, so pairs never overlap — a neat trick that only works because iterators remember their position.",
        },
        {
          id: "stretch", kind: "challenge", title: "First n primes, lazily", difficulty: 4,
          prompt: `Read n and print the first n primes on one line. Use \`itertools.count(2)\` (an infinite lazy counter) with a generator expression and \`itertools.islice\` to take exactly n — no fixed upper bound.`,
          starter: r`from itertools import count, islice

def is_prime(k):
    return k > 1 and all(k % d for d in range(2, int(k ** 0.5) + 1))

n = int(input())
`,
          tests: [
            { label: "n = 5", input: "5\n", output: "2 3 5 7 11" },
            { label: "n = 1", input: "1\n", output: "2", hidden: true, category: "boundary" },
            { label: "n = 15", input: "15\n", output: "2 3 5 7 11 13 17 19 23 29 31 37 41 43 47", hidden: true },
          ],
          hints: [
            "`count(2)` yields 2, 3, 4, … forever.",
            "Filter lazily: `(k for k in count(2) if is_prime(k))`.",
            "`islice(gen, n)` takes the first n items and stops.",
            "`print(*islice((k for k in count(2) if is_prime(k)), n))`.",
          ],
          solution: r`from itertools import count, islice

def is_prime(k):
    return k > 1 and all(k % d for d in range(2, int(k ** 0.5) + 1))

n = int(input())
primes = (k for k in count(2) if is_prime(k))
print(*islice(primes, n))`,
          notes: "An infinite lazy sequence is safe because islice only asks for n items. `all(k % d ...)` is True when no divisor leaves remainder 0.",
        },
      ],
      realWorld: "Reading huge log files line by line, streaming database query results, processing paginated API results and generating IDs with `itertools.count` all rely on iterators and laziness.",
      reteach: "An iterable is a book; an iterator is a bookmark in it. You can open the book with as many bookmarks as you like (`iter()` again), but each bookmark only moves forward, page by page (`next()`). When a bookmark reaches the end, it's done. Lazy objects are books whose pages are written only when you turn to them.",
      summary: [
        "Iterables produce iterators (`iter()`); iterators give items with `next()` and are single-use.",
        "for loops call iter() and next() and stop at StopIteration; `next(it, default)` avoids the error.",
        "Lazy objects (range, map, zip, generators, files) save memory and allow early stopping and infinite sequences.",
      ],
    },
  ],
  exam: [
    {
      id: "e1", kind: "predict", difficulty: 3,
      code: r`a = [1, 2, 3, 4]
evens = filter(lambda x: x % 2 == 0, a)
print(list(map(lambda x: x * 10, evens)), list(evens))
print([i for i, v in enumerate("banana") if v == "a"])`,
      answer: "[20, 40] []\n[1, 3, 5]\n",
      hint: "filter is consumed by map.",
      explain: "map drains the filter iterator, so the second list(evens) is empty. The 'a's in banana are at indexes 1, 3, 5.",
    },
    {
      id: "e2", kind: "mcq", difficulty: 3,
      prompt: "Which is True for a generator expression `g = (x for x in range(3))`?",
      options: [
        { text: "`len(g)` is 3", why: "Generators have no len." },
        { text: "`list(g)` twice gives [0, 1, 2] both times", why: "It's exhausted after the first." },
        { text: "`next(g)` gives 0", why: "Correct." },
      ],
      answer: 2,
      hint: "Generators are iterators.",
      explain: "A generator is an iterator: next() gives its first value, and it can't be reused or measured.",
    },
    {
      id: "e3", kind: "fill", difficulty: 2,
      prompt: "Number the lines starting from 1.",
      code: r`for n, line in ___(["x", "y"], start=1):
    print(n, line)`,
      blanks: [["enumerate"]],
      output: "1 x\n2 y\n",
      hint: "Index + item.",
      explain: "`enumerate(seq, start=1)` yields (1, 'x'), (2, 'y').",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: results processor", difficulty: 3,
    prompt: `Read three lines: student names (comma-separated), maths marks and science marks (space-separated, same order). Using zip, enumerate, comprehensions, any and all, print:

1. a ranked table by total (highest first; ties by name): \`1. Asha 170\`,
2. \`Top scorer per subject: maths=NAME science=NAME\`,
3. \`Everyone passed both: True/False\` (pass = 40+ in each),
4. \`Anyone above 90 in a subject: True/False\`.`,
    starter: r`names = [n.strip() for n in input().split(",")]
maths = list(map(int, input().split()))
science = list(map(int, input().split()))
`,
    tests: [
      { label: "Three students", input: "Asha, Ravi, Zoe\n85 60 92\n85 70 30\n", output: "1. Asha 170\n2. Ravi 130\n3. Zoe 122\nTop scorer per subject: maths=Zoe science=Asha\nEveryone passed both: False\nAnyone above 90 in a subject: True" },
      { label: "All pass", input: "A, B\n50 60\n70 60\n", output: "1. A 120\n2. B 120\nTop scorer per subject: maths=B science=A\nEveryone passed both: True\nAnyone above 90 in a subject: False", hidden: true, category: "edge" },
    ],
    hints: [
      "`rows = list(zip(names, maths, science))` gives one tuple per student.",
      "Sort with `key=lambda r: (-(r[1] + r[2]), r[0])` and enumerate from 1.",
      "Top per subject: `max(rows, key=lambda r: r[1])[0]` (and r[2] for science).",
      "`all(m >= 40 and s >= 40 for _, m, s in rows)` and `any(m > 90 or s > 90 for _, m, s in rows)`.",
    ],
    solution: r`names = [n.strip() for n in input().split(",")]
maths = list(map(int, input().split()))
science = list(map(int, input().split()))
rows = list(zip(names, maths, science))
ranked = sorted(rows, key=lambda r: (-(r[1] + r[2]), r[0]))
for i, (name, m, s) in enumerate(ranked, start=1):
    print(f"{i}. {name} {m + s}")
top_m = max(rows, key=lambda r: r[1])[0]
top_s = max(rows, key=lambda r: r[2])[0]
print(f"Top scorer per subject: maths={top_m} science={top_s}")
print("Everyone passed both:", all(m >= 40 and s >= 40 for _, m, s in rows))
print("Anyone above 90 in a subject:", any(m > 90 or s > 90 for _, m, s in rows))`,
    notes: "zip turns parallel lists into records once, and everything after works on those records — a classic data-processing shape.",
  },
};
