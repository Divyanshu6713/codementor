import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 9 — Tuples. */
export const M09: PyModuleDef = {
  id: "py-tuples",
  number: 9,
  level: 2,
  title: "Tuples",
  summary: "Creating tuples, indexing and slicing, single-element tuples, immutability, tuple methods, packing and unpacking, returning multiple values, tuples vs lists, and practical uses.",
  track: "core",
  prereqs: ["py-lists"],
  lessons: [
    {
      id: "py-tuples-basics",
      title: "Creating and using tuples",
      minutes: 14,
      difficulty: 2,
      objectives: [
        "Create tuples, including empty and single-element tuples",
        "Index, slice and search tuples with `count` and `index`",
        "Explain what immutability means for tuples (and for the objects inside them)",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "What is `type((5))`?",
        options: [
          { text: "tuple", why: "Brackets alone don't make a tuple — the comma does." },
          { text: "int", why: "Correct: `(5)` is just 5 in brackets. A one-item tuple is `(5,)`." },
          { text: "list", why: "Lists use square brackets." },
        ],
        answer: 1,
        hint: "What actually makes a tuple: the brackets or the comma?",
        explain: "The comma makes the tuple; `(5,)` or `5,` is a one-element tuple.",
      },
      why: "Tuples are fixed records: a coordinate (x, y), a date (2026, 10, 9), an RGB colour, a database row. Because they can't change, they're safe to share and can be used as dictionary keys and set members.",
      concept: [
        {
          title: "Creating tuples",
          body: `\`\`\`python
point = (3, 4)
date = 2026, 10, 9        # brackets optional: commas make the tuple
single = ("only",)        # one element needs a trailing comma
empty = ()
from_list = tuple([1, 2, 3])
\`\`\`

Indexing, slicing, \`len\`, \`in\`, \`+\`, \`*\` and looping work like lists. Methods: only \`count(x)\` and \`index(x)\`.`,
        },
        {
          title: "Immutability",
          body: `\`point[0] = 5\` raises TypeError, and there's no append/remove. To "change" a tuple, build a new one: \`point = (5,) + point[1:]\`.

Careful: a tuple holding a **list** can't swap that list for another, but the list itself can still change: \`t = ([1], 2); t[0].append(9)\` works. Only tuples of immutable things are fully frozen — and only those are **hashable** (usable as dict keys).`,
        },
      ],
      example: {
        title: "Records that don't change",
        code: r`origin = (0, 0)
corner = (4, 3)
dx, dy = corner[0] - origin[0], corner[1] - origin[1]
print((dx ** 2 + dy ** 2) ** 0.5)
week = ("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")
print(week[5:], week.index("Thu"), len(week))
single = ("solo",)
print(type(single).__name__, type(("solo")).__name__)
t = ([1, 2], "x")
t[0].append(3)
print(t)`,
        output: "5.0\n('Sat', 'Sun') 3 7\ntuple str\n([1, 2, 3], 'x')\n",
        lines: [
          [3, "Read coordinates by index (multiple assignment computes both differences)."],
          [4, "Distance with Pythagoras: √(4² + 3²) = 5.0."],
          [6, "Slicing a tuple gives a tuple; `index` finds a position."],
          [8, "The trailing comma makes a tuple; without it, just a string in brackets."],
          [10, "The tuple can't change which objects it holds, but the list inside is still mutable."],
        ],
      },
      mistakes: [
        { title: "Forgetting the comma for one item", body: "`(\"x\")` is a string. Write `(\"x\",)`." },
        { title: "Trying to append to a tuple", body: "Tuples have no append. Use a list if the collection grows, or build a new tuple with `+`." },
        { title: "Assuming tuples are always fully immutable", body: "If a tuple contains a list, that list can still be changed (and the tuple is then unhashable)." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 2,
          code: r`t = (1, 2, 3) + (4,)
print(t, t[::-1], t.count(2), 3 in t)`,
          answer: "(1, 2, 3, 4) (4, 3, 2, 1) 1 True\n",
          hint: "`+` joins tuples; slicing works like lists.",
          explain: "Joining gives (1, 2, 3, 4); reversed slice; 2 appears once; 3 is present.",
        },
        {
          id: "f1", kind: "fill", difficulty: 1,
          prompt: "Make a tuple with the single item `\"red\"`.",
          code: r`colors = ("red"___)
print(len(colors), type(colors).__name__)`,
          blanks: [[","]],
          output: "1 tuple\n",
          hint: "One character turns it into a tuple.",
          explain: "`(\"red\",)` — the trailing comma makes it a one-element tuple.",
        },
        {
          id: "b1", kind: "bug", difficulty: 2,
          prompt: "This should change the year in the date to 2027 but crashes. Which line?",
          code: r`date = (2026, 10, 9)
date[0] = 2027
print(date)`,
          line: 2,
          fix: r`date = (2026, 10, 9)
date = (2027,) + date[1:]
print(date)`,
          output: "(2027, 10, 9)\n",
          hint: "Can a tuple be changed in place?",
          explain: "Tuples are immutable. Build a new tuple from the new year and the rest of the old one.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 2,
          prompt: "Which can be used as a dictionary key?",
          options: [
            { text: "`[1, 2]`", why: "Lists are mutable, so unhashable." },
            { text: "`(1, 2)`", why: "Correct — a tuple of immutable values is hashable." },
            { text: "`([1], 2)`", why: "It contains a list, so it's unhashable." },
          ],
          answer: 1,
          hint: "Keys must be hashable (effectively immutable).",
          explain: "Tuples made only of immutable items are hashable, so they can be dict keys or set items.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Distance between two points", difficulty: 2,
          prompt: `Read two points, each as \`x y\` on its own line. Store each as a tuple and print the Euclidean distance rounded to 2 decimals.`,
          starter: r`p = tuple(int(v) for v in input().split())
q = tuple(int(v) for v in input().split())
`,
          tests: [
            { label: "3-4-5", input: "0 0\n3 4\n", output: "5.0" },
            { label: "Same point", input: "2 2\n2 2\n", output: "0.0", hidden: true, category: "edge" },
            { label: "Decimals", input: "1 1\n4 5\n", output: "5.0", hidden: true },
            { label: "Negative", input: "-1 2\n3 -1\n", output: "5.0", hidden: true },
            { label: "Irrational", input: "0 0\n1 1\n", output: "1.41", hidden: true },
          ],
          hints: [
            "Get the coordinates with `p[0]`, `p[1]`, `q[0]`, `q[1]`.",
            "distance = √((x2 − x1)² + (y2 − y1)²).",
            "`** 0.5` is a square root.",
            "`print(round(((q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2) ** 0.5, 2))`.",
          ],
          solution: r`p = tuple(int(v) for v in input().split())
q = tuple(int(v) for v in input().split())
d = ((q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2) ** 0.5
print(round(d, 2))`,
          notes: "A point is a natural tuple: two values that belong together and don't change. (`math.dist(p, q)` does this for you.)",
        },
        {
          id: "stretch", kind: "task", title: "Day of the week counter", difficulty: 3,
          prompt: `The constant \`DAYS = ("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")\`. Read today's day name and a number n. Print the day n days later, and \`weekend\` or \`weekday\`:

\`\`\`
Sat weekend
\`\`\`

(for \`Wed\` and \`3\`).`,
          starter: r`DAYS = ("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")
today = input()
n = int(input())
`,
          tests: [
            { label: "Wed + 3", input: "Wed\n3\n", output: "Sat weekend" },
            { label: "Sun + 1", input: "Sun\n1\n", output: "Mon weekday", category: "boundary" },
            { label: "Large n", input: "Mon\n100\n", output: "Wed weekday", hidden: true },
            { label: "Zero", input: "Fri\n0\n", output: "Fri weekday", hidden: true, category: "edge" },
          ],
          hints: [
            "Find today's position in the tuple.",
            "`DAYS.index(today)`.",
            "Add n and wrap around with `% 7`.",
            "`later = DAYS[(DAYS.index(today) + n) % 7]`; weekend if `later in DAYS[5:]`.",
          ],
          solution: r`DAYS = ("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")
today = input()
n = int(input())
later = DAYS[(DAYS.index(today) + n) % 7]
print(later, "weekend" if later in DAYS[5:] else "weekday")`,
          notes: "A tuple is perfect for fixed reference data like day names: it can't be accidentally changed.",
        },
      ],
      realWorld: "Database libraries return rows as tuples; coordinates, RGB colours and version numbers (3, 12, 1) are tuples; functions return several results as a tuple.",
      reteach: "A tuple is a sealed envelope with a fixed number of slips inside: you can read any slip (index), count them, look for one — but you can't add, remove or swap slips. If you need a different set, you seal a new envelope.",
      summary: [
        "Tuples are ordered and immutable; the comma makes them (`(x,)` for one item).",
        "Indexing, slicing, `in`, `+`, `*` work; methods are just count and index.",
        "Tuples of immutable values are hashable — usable as dict keys and set items.",
      ],
    },

    {
      id: "py-tuple-unpacking",
      title: "Packing, unpacking and multiple return values",
      minutes: 15,
      difficulty: 2,
      objectives: [
        "Pack and unpack values, including with `*rest`",
        "Return several values from a function as a tuple",
        "Choose between a tuple and a list",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "After `first, *rest = [1, 2, 3, 4]`, what is `rest`?",
        options: [
          { text: "`2`", why: "The star collects everything that's left." },
          { text: "`[2, 3, 4]`", why: "Correct — a list of the remaining items." },
          { text: "`(2, 3, 4)`", why: "Starred unpacking always gives a list." },
        ],
        answer: 1,
        hint: "The `*` name collects the rest.",
        explain: "`*rest` gathers all remaining values into a list.",
      },
      why: "Unpacking makes code read like intent: `name, age = record` instead of `record[0]` and `record[1]`. It powers swapping, looping over pairs, and functions that return more than one result.",
      concept: [
        {
          title: "Packing and unpacking",
          body: `\`\`\`python
point = 3, 4          # packing
x, y = point          # unpacking (counts must match)
a, b = b, a           # swap: pack the right side, unpack into the left
first, *middle, last = [1, 2, 3, 4, 5]   # middle = [2, 3, 4]
for name, marks in [("Asha", 91), ("Ravi", 78)]:
    ...                # unpacking in a loop
\`\`\`

Wrong counts raise \`ValueError: too many values to unpack\` / \`not enough values\`. Use \`_\` for values you don't need: \`_, y = point\`.`,
        },
        {
          title: "Returning multiple values",
          body: `\`\`\`python
def min_max(nums):
    return min(nums), max(nums)   # returns ONE tuple

low, high = min_max([4, 9, 2])
\`\`\`

(Functions are Module 12 — here we only need \`def\` and \`return\`.)`,
        },
        {
          title: "Tuple or list?",
          body: `| Use a tuple when… | Use a list when… |
| --- | --- |
| the size is fixed and positions have meaning (x, y) | it's a collection of similar items that grows/shrinks |
| it should never change | you'll add, remove or sort |
| you need a dict key / set item | |

For named fields, \`collections.namedtuple\` or a dataclass (Module 17) reads even better: \`p.x\` instead of \`p[0]\`.`,
        },
      ],
      example: {
        title: "Unpacking everywhere",
        code: r`def stats(values):
    return min(values), max(values), sum(values) / len(values)

low, high, mean = stats([12, 7, 30, 21])
print(low, high, mean)
head, *tail = "a b c d".split()
print(head, tail)
records = [("Asha", 16, "11-B"), ("Ravi", 17, "12-A")]
for name, age, _ in records:
    print(f"{name} is {age}")
x, y = 1, 2
x, y = y, x
print(x, y)`,
        output: "7 30 17.5\na ['b', 'c', 'd']\nAsha is 16\nRavi is 17\n2 1\n",
        lines: [
          [2, "Three values separated by commas form one tuple."],
          [4, "Unpack the returned tuple into three names."],
          [6, "The starred name collects the remaining words into a list."],
          [9, "Unpack each record in the loop header; `_` marks the unused class."],
          [12, "Swap via packing and unpacking."],
        ],
      },
      mistakes: [
        { title: "Mismatched counts", body: "`a, b = [1, 2, 3]` raises ValueError. Use `a, b, *_ = ...` or index explicitly." },
        { title: "Forgetting that a function returns one object", body: "`result = min_max(nums)` gives a tuple; unpack it or index it." },
        { title: "Using a tuple for a growing collection", body: "If you keep doing `t = t + (x,)`, you want a list." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 2,
          code: r`a, *b, c = range(6)
print(a, b, c)
first, second = "hi"
print(second, first)`,
          answer: "0 [1, 2, 3, 4] 5\ni h\n",
          hint: "Strings unpack character by character.",
          explain: "a gets 0, c gets 5, b collects the middle as a list. \"hi\" unpacks into 'h' and 'i'.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Return both the quotient and the remainder.",
          code: r`def split_bill(total, people):
    return total // people___ total % people

each, left = split_bill(1000, 3)
print(each, left)`,
          blanks: [[","]],
          output: "333 1\n",
          hint: "What turns two values into one tuple?",
          explain: "A comma packs both values into a tuple, which the caller unpacks.",
        },
        {
          id: "b1", kind: "bug", difficulty: 2,
          prompt: "This crashes with `too many values to unpack`. Which line?",
          code: r`row = ("Asha", 91, "A")
name, marks = row
print(name, marks)`,
          line: 2,
          fix: r`row = ("Asha", 91, "A")
name, marks, _ = row
print(name, marks)`,
          output: "Asha 91\n",
          hint: "Count the values on each side.",
          explain: "The tuple has three items but only two names. Add a third name (use `_` if unused) or `*rest`.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 2,
          prompt: "Which data is best stored as a tuple?",
          options: [
            { text: "The items in a shopping cart", why: "A cart changes — use a list." },
            { text: "An RGB colour like (255, 128, 0)", why: "Correct — fixed size, fixed meaning per position." },
            { text: "A queue of print jobs", why: "Queues change constantly." },
          ],
          answer: 1,
          hint: "Fixed size and meaning → tuple.",
          explain: "An RGB colour always has exactly three components with fixed meanings.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Min, max and range", difficulty: 2,
          prompt: `Complete \`describe(nums)\` so it **returns** three values: the smallest, the largest, and the range (largest − smallest). The given code reads numbers, unpacks the result and prints it.`,
          starter: r`def describe(nums):
    pass  # return smallest, largest, range

values = [int(x) for x in input().split()]
low, high, spread = describe(values)
print(f"min={low} max={high} range={spread}")`,
          tests: [
            { label: "Mixed", input: "7 2 9 4\n", output: "min=2 max=9 range=7" },
            { label: "One value", input: "5\n", output: "min=5 max=5 range=0", hidden: true, category: "edge" },
            { label: "Negatives", input: "-3 -8 -1\n", output: "min=-8 max=-1 range=7", hidden: true },
          ],
          hints: [
            "Which built-ins give the smallest and largest?",
            "`min(nums)` and `max(nums)`.",
            "Return three values separated by commas.",
            "`return min(nums), max(nums), max(nums) - min(nums)`.",
          ],
          solution: r`def describe(nums):
    low, high = min(nums), max(nums)
    return low, high, high - low

values = [int(x) for x in input().split()]
low, high, spread = describe(values)
print(f"min={low} max={high} range={spread}")`,
          notes: "`return a, b, c` returns one tuple; `low, high, spread = ...` unpacks it.",
        },
        {
          id: "stretch", kind: "task", title: "Swap pairs", difficulty: 3,
          prompt: `Read a line of \`name:score\` pairs separated by spaces. Turn each into a \`(score, name)\` tuple (score as int), sort them **descending**, and print \`name score\` for the top 3 — unpacking the tuples in the loop.`,
          starter: r`pairs = input().split()
`,
          tests: [
            { label: "Five players", input: "asha:40 ravi:75 zoe:60 dev:90 kim:10\n", output: "dev 90\nravi 75\nzoe 60" },
            { label: "Two players", input: "a:1 b:2\n", output: "b 2\na 1", hidden: true, category: "edge" },
          ],
          hints: [
            "Split each pair at the colon: `name, score = p.split(\":\")`.",
            "Build `(int(score), name)` tuples — tuples sort by their first item first.",
            "`sorted(items, reverse=True)[:3]`.",
            "Loop with `for score, name in top:` and print `name, score`.",
          ],
          solution: r`pairs = input().split()
items = []
for p in pairs:
    name, score = p.split(":")
    items.append((int(score), name))
for score, name in sorted(items, reverse=True)[:3]:
    print(name, score)`,
          notes: "Putting the sort key first in the tuple lets plain `sorted` do the work — tuples compare item by item.",
        },
      ],
      realWorld: "`for key, value in d.items()`, `for i, item in enumerate(x)`, `x, y = point` and functions returning `(result, error)` pairs make unpacking one of the most-used Python features.",
      reteach: "Packing is putting several things into one box (a tuple); unpacking is taking them out and putting each on its own labelled shelf. The number of shelves must match the number of things — unless one shelf is a big basket marked `*`, which takes whatever is left.",
      summary: [
        "`a, b = b, a`, `x, y = point`, `first, *rest = seq` — counts must match unless you use `*`.",
        "`return a, b` returns one tuple; the caller unpacks it.",
        "Tuples for fixed records; lists for collections that change.",
      ],
      cpp: {
        python: r`def mm(v):
    return min(v), max(v)
lo, hi = mm([3, 1, 2])`,
        cpp: r`pair<int,int> mm(const vector<int>& v) {
    return {*min_element(v.begin(), v.end()), *max_element(v.begin(), v.end())};
}
auto [lo, hi] = mm({3, 1, 2});   // C++17 structured bindings`,
        note: "C++17 structured bindings are the closest equivalent of tuple unpacking.",
      },
    },
  ],
  exam: [
    {
      id: "e1", kind: "predict", difficulty: 3,
      code: r`pts = [(2, 5), (1, 9), (2, 1)]
pts.sort()
print(pts)
(a, b), *others = pts
print(a + b, len(others))`,
      answer: "[(1, 9), (2, 1), (2, 5)]\n10 2\n",
      hint: "Tuples sort by first item, then second; you can unpack nested structures.",
      explain: "Sorted: (1, 9), (2, 1), (2, 5). The first tuple unpacks into a = 1, b = 9; the other two go into `others`.",
    },
    {
      id: "e2", kind: "mcq", difficulty: 2,
      prompt: "`t = (1, 2, 3)`. Which operation is allowed?",
      options: [
        { text: "`t.append(4)`", why: "Tuples have no append." },
        { text: "`t[0] = 9`", why: "Item assignment isn't allowed." },
        { text: "`t + (4,)`", why: "Correct — it creates a new tuple." },
      ],
      answer: 2,
      hint: "Which one doesn't change t itself?",
      explain: "Concatenation builds a new tuple; the other two try to modify t.",
    },
    {
      id: "e3", kind: "fill", difficulty: 2,
      prompt: "Ignore the middle value while unpacking.",
      code: r`rgb = (255, 128, 0)
red, ___, blue = rgb
print(red, blue)`,
      blanks: [["_"]],
      output: "255 0\n",
      hint: "A conventional name for 'don't care'.",
      explain: "`_` is a normal name, used by convention for values you ignore.",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: route summary", difficulty: 3,
    prompt: `A delivery route is a list of stops. Read n, then n lines \`name x y\`. Store each stop as a tuple \`(name, (x, y))\`. Print:

1. \`Total distance: D\` — the sum of straight-line distances between consecutive stops, rounded to 2 decimals,
2. \`Farthest stop from start: NAME\` — the stop farthest from the first stop,
3. \`Start and end: A -> B\` — using unpacking (\`(first_name, _), *_, (last_name, _) = stops\`).`,
    starter: r`n = int(input())
stops = []
for _ in range(n):
    name, x, y = input().split()
    stops.append((name, (int(x), int(y))))
`,
    tests: [
      { label: "Three stops", input: "3\nDepot 0 0\nShop 3 4\nHome 6 8\n", output: "Total distance: 10.0\nFarthest stop from start: Home\nStart and end: Depot -> Home" },
      { label: "Back to start", input: "3\nA 0 0\nB 0 5\nC 0 0\n", output: "Total distance: 10.0\nFarthest stop from start: B\nStart and end: A -> C", hidden: true },
      { label: "Two stops", input: "2\nX 1 1\nY 2 2\n", output: "Total distance: 1.41\nFarthest stop from start: Y\nStart and end: X -> Y", hidden: true, category: "boundary" },
    ],
    hints: [
      "Write a helper `dist(p, q)` for two (x, y) tuples.",
      "Loop over indexes 1..n-1 and add `dist(stops[i-1][1], stops[i][1])`.",
      "Farthest: `max(stops, key=lambda s: dist(stops[0][1], s[1]))`.",
      "Use the unpacking pattern from the prompt for the first and last names.",
    ],
    solution: r`n = int(input())
stops = []
for _ in range(n):
    name, x, y = input().split()
    stops.append((name, (int(x), int(y))))

def dist(p, q):
    return ((q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2) ** 0.5

total = sum(dist(stops[i - 1][1], stops[i][1]) for i in range(1, n))
print("Total distance:", round(total, 2))
start = stops[0][1]
far_name, _ = max(stops, key=lambda s: dist(start, s[1]))
print("Farthest stop from start:", far_name)
(first_name, _), *_, (last_name, _) = stops
print(f"Start and end: {first_name} -> {last_name}")`,
    notes: "Nested tuples model a record containing a coordinate; unpacking pulls out exactly the pieces you need.",
  },
};
