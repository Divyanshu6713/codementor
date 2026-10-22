import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 11 — Dictionaries. */
export const M11: PyModuleDef = {
  id: "py-dicts",
  number: 11,
  level: 2,
  title: "Dictionaries",
  summary: "Keys and values; creating, reading, updating and deleting; safe access with get(); dictionary methods and iteration; nested dictionaries; comprehensions; merging; frequency maps; grouping and aggregation; hashability; modelling real-world data.",
  track: "core",
  prereqs: ["py-sets"],
  lessons: [
    {
      id: "py-dict-basics",
      title: "Keys, values and safe access",
      minutes: 16,
      difficulty: 2,
      objectives: [
        "Create dictionaries and read values by key",
        "Add, update and delete entries; check keys with `in`",
        "Read safely with `get()` and `setdefault()`",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "`ages = {\"asha\": 16}`. What does `ages[\"ravi\"]` do?",
        options: [
          { text: "Returns None", why: "Square-bracket access doesn't return None for missing keys." },
          { text: "Raises KeyError", why: "Correct — use `ages.get(\"ravi\")` to get None instead." },
          { text: "Returns 0", why: "No default is assumed." },
        ],
        answer: 1,
        hint: "Missing key + square brackets = ?",
        explain: "`d[key]` raises KeyError for a missing key; `d.get(key)` returns None (or a default you give).",
      },
      why: "Dictionaries map keys to values: a username to a profile, a word to its count, a product code to a price. Looking up by key is instant, which is why dictionaries are the backbone of Python programs — and of JSON data from the web.",
      concept: [
        {
          title: "Creating and reading",
          body: `\`\`\`python
student = {"name": "Asha", "age": 16, "marks": [91, 84]}
student["name"]          # 'Asha'
len(student)             # 3 entries
"age" in student         # True — checks KEYS
empty = {}
pairs = dict([("a", 1), ("b", 2)])
\`\`\`

Keys must be **hashable** (strings, numbers, tuples of those) and unique; values can be anything. Dicts remember **insertion order** (Python 3.7+).`,
        },
        {
          title: "Adding, updating, deleting",
          body: `\`\`\`python
student["class"] = "11-B"     # add a new key
student["age"] = 17           # update an existing key
del student["marks"]          # delete (KeyError if missing)
age = student.pop("age")      # remove and return
student.pop("x", None)        # remove if present, no error
\`\`\``,
        },
        {
          title: "Safe access: get and setdefault",
          body: `\`\`\`python
student.get("phone")              # None
student.get("phone", "unknown")   # 'unknown'
scores = {}
scores.setdefault("asha", []).append(91)   # create the list if needed, then append
\`\`\`

Use \`d[key]\` when the key must exist (a missing key is a bug you want to see); use \`get\` when it may legitimately be missing.`,
        },
      ],
      example: {
        title: "A product catalogue",
        code: r`prices = {"pen": 10, "notebook": 45, "bag": 650}
prices["eraser"] = 5
prices["pen"] = 12
print(prices["notebook"], prices.get("ruler", 0), "bag" in prices)
removed = prices.pop("bag")
print(removed, prices)
order = ["pen", "pen", "eraser", "ruler"]
total = 0
for item in order:
    total += prices.get(item, 0)
print("total:", total)`,
        output: "45 0 True\n650 {'pen': 12, 'notebook': 45, 'eraser': 5}\ntotal: 29\n",
        lines: [
          [2, "A new key is added at the end (insertion order is kept)."],
          [3, "An existing key is updated in place."],
          [4, "Lookup, a safe lookup with default 0, and a key test."],
          [5, "pop removes the entry and returns its value."],
          [10, "Unknown items (ruler) count as 0 instead of crashing."],
        ],
      },
      mistakes: [
        { title: "`in` checks keys, not values", body: "`45 in prices` is False even though 45 is a price. Use `45 in prices.values()`." },
        { title: "Lists as keys", body: "`{[1, 2]: \"x\"}` raises TypeError. Use a tuple key `(1, 2)`." },
        { title: "Typos in string keys", body: "`d[\"Name\"]` vs `d[\"name\"]` — keys are case-sensitive. A KeyError message shows the key Python looked for." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 2,
          code: r`d = {"a": 1, "b": 2}
d["c"] = d["a"] + d["b"]
d["a"] = 10
print(d, d.get("z", "?"), len(d))`,
          answer: "{'a': 10, 'b': 2, 'c': 3} ? 3\n",
          hint: "c is computed before a changes.",
          explain: "c = 1 + 2 = 3; then a becomes 10 (its position stays first). get with a default returns \"?\".",
        },
        {
          id: "f1", kind: "fill", difficulty: 1,
          prompt: "Look up a key safely, falling back to 0.",
          code: r`stock = {"apples": 12}
print(stock.___("pears", 0))`,
          blanks: [["get"]],
          output: "0\n",
          hint: "A method that doesn't raise KeyError.",
          explain: "`get(key, default)` returns the default when the key is missing.",
        },
        {
          id: "b1", kind: "bug", difficulty: 2,
          prompt: "This should print `Found` because 91 is one of the marks. Which line is wrong?",
          code: r`marks = {"asha": 91, "ravi": 78}
if 91 in marks:
    print("Found")
else:
    print("Not found")`,
          line: 2,
          fix: r`marks = {"asha": 91, "ravi": 78}
if 91 in marks.values():
    print("Found")
else:
    print("Not found")`,
          output: "Found\n",
          hint: "What does `in` look at for a dictionary?",
          explain: "`in` on a dict checks keys only. To look for a value use `marks.values()`.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 2,
          prompt: "Which is a valid dictionary key?",
          options: [
            { text: "`[\"x\", 1]`", why: "Lists are mutable and unhashable." },
            { text: "`(\"x\", 1)`", why: "Correct — a tuple of immutable values." },
            { text: "`{\"x\": 1}`", why: "Dicts are unhashable." },
          ],
          answer: 1,
          hint: "Keys must be hashable.",
          explain: "Tuples of immutable values are hashable; lists, dicts and sets are not.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Phone book lookup", difficulty: 2,
          prompt: `Read n, then n lines \`name number\` to build a phone book. Then read names until the line \`end\`, printing each name's number — or \`Not found\` (use \`get\`).`,
          starter: r`n = int(input())
book = {}
`,
          tests: [
            { label: "Lookups", input: "2\nasha 98450\nravi 99001\nravi\nzoe\nasha\nend\n", output: "99001\nNot found\n98450" },
            { label: "Updated number", input: "2\nasha 1\nasha 2\nasha\nend\n", output: "2", hidden: true, category: "edge" },
            { label: "No lookups", input: "1\nx 5\nend\n", output: "", hidden: true, category: "edge" },
          ],
          hints: [
            "Build the dict with `book[name] = number` in a loop.",
            "Then loop with `while True:` reading a name.",
            "Stop when the name is \"end\".",
            "`print(book.get(name, \"Not found\"))`.",
          ],
          solution: r`n = int(input())
book = {}
for _ in range(n):
    name, number = input().split()
    book[name] = number
while True:
    name = input()
    if name == "end":
        break
    print(book.get(name, "Not found"))`,
          notes: "Assigning to an existing key overwrites it — the later number wins. Lookups are instant however big the book gets.",
        },
        {
          id: "stretch", kind: "task", title: "Invert a mapping", difficulty: 3,
          prompt: `Read pairs \`student:club\` on one line (space-separated). Build a dict from each **club** to the list of its students (in input order), using \`setdefault\`. Print each club in **alphabetical** order as \`club: name1, name2\`.`,
          starter: r`pairs = input().split()
clubs = {}
`,
          tests: [
            { label: "Three clubs", input: "asha:chess ravi:music zoe:chess dev:art kim:music\n", output: "art: dev\nchess: asha, zoe\nmusic: ravi, kim" },
            { label: "One club", input: "a:x b:x\n", output: "x: a, b", hidden: true },
          ],
          hints: [
            "Split each pair at the colon.",
            "`clubs.setdefault(club, [])` returns the list for that club, creating it if needed.",
            "Append the student to it.",
            "Print with `for club in sorted(clubs): print(f\"{club}: {', '.join(clubs[club])}\")`.",
          ],
          solution: r`pairs = input().split()
clubs = {}
for p in pairs:
    student, club = p.split(":")
    clubs.setdefault(club, []).append(student)
for club in sorted(clubs):
    print(f"{club}: {', '.join(clubs[club])}")`,
          notes: "`setdefault` replaces the 'if key not in d: d[key] = []' dance. `collections.defaultdict(list)` (Module 21) is another way.",
        },
      ],
      realWorld: "JSON from every web API becomes Python dicts; configuration files, database rows (as dicts), caches and counting all rely on them. Lookups by key are O(1) on average, using the same hashing as sets.",
      reteach: "A dictionary is a real dictionary: you look up a **word** (the key) and get its **definition** (the value). You can add words, change definitions, and remove words — and you never read the dictionary from cover to cover to find one, you jump straight to it.",
      summary: [
        "Dicts map unique hashable keys to values and keep insertion order.",
        "`d[k] = v` adds/updates; `del d[k]` / `d.pop(k)` removes; `k in d` checks keys.",
        "`d.get(k, default)` and `d.setdefault(k, default)` avoid KeyError.",
      ],
      cpp: {
        python: r`ages = {"asha": 16}
ages["ravi"] = 17
print(ages.get("zoe", 0))`,
        cpp: r`unordered_map<string,int> ages = {{"asha", 16}};
ages["ravi"] = 17;
auto it = ages.find("zoe");
cout << (it != ages.end() ? it->second : 0);`,
        note: "Careful in C++: `ages[\"zoe\"]` on a missing key *inserts* a default value. Python's `d[k]` raises KeyError instead.",
      },
    },

    {
      id: "py-dict-iteration",
      title: "Iterating, nesting, comprehensions and merging",
      minutes: 17,
      difficulty: 3,
      objectives: [
        "Loop over keys, values and items",
        "Work with nested dictionaries (dicts of dicts / lists)",
        "Build dicts with comprehensions and merge dicts",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "What does `for k in d:` loop over?",
        options: [
          { text: "The values", why: "That's `d.values()`." },
          { text: "The keys", why: "Correct." },
          { text: "(key, value) pairs", why: "That's `d.items()`." },
        ],
        answer: 1,
        hint: "Iterating a dict directly…",
        explain: "Looping over a dict gives its keys; use `.values()` or `.items()` for the others.",
      },
      why: "Real data is nested: a student has a name, a list of marks and an address; an API response has dicts inside lists inside dicts. Looping through and reshaping such data is a core everyday skill.",
      concept: [
        {
          title: "keys, values, items",
          body: `\`\`\`python
marks = {"asha": 91, "ravi": 78}
for name in marks: ...                 # keys
for m in marks.values(): ...           # values
for name, m in marks.items(): ...      # pairs (unpacked)
sorted(marks, key=marks.get)           # keys sorted by value
\`\`\`

Don't add or delete keys while looping over a dict (RuntimeError); loop over \`list(d)\` if you must.`,
        },
        {
          title: "Nested data",
          body: `\`\`\`python
school = {
    "11-B": {"teacher": "Ms Rao", "students": ["Asha", "Ravi"]},
    "12-A": {"teacher": "Mr Das", "students": ["Zoe"]},
}
school["11-B"]["students"][0]      # 'Asha'
for cls, info in school.items():
    print(cls, len(info["students"]))
\`\`\`

Read nested access left to right: each \`[...]\` goes one level deeper.`,
        },
        {
          title: "Comprehensions and merging",
          body: `\`\`\`python
squares = {n: n * n for n in range(5)}
passed = {k: v for k, v in marks.items() if v >= 40}
defaults = {"theme": "light", "size": 14}
user = {"size": 16}
settings = defaults | user           # 3.9+: right side wins → size 16
settings = {**defaults, **user}      # works on older versions too
defaults.update(user)                # merge in place
\`\`\``,
        },
      ],
      example: {
        title: "Class report from nested data",
        code: r`school = {
    "11-B": {"teacher": "Ms Rao", "marks": {"Asha": 91, "Ravi": 78}},
    "12-A": {"teacher": "Mr Das", "marks": {"Zoe": 85, "Dev": 62, "Kim": 70}},
}
for cls, info in school.items():
    marks = info["marks"]
    best = max(marks, key=marks.get)
    avg = sum(marks.values()) / len(marks)
    print(f"{cls} ({info['teacher']}): best {best}, avg {avg:.1f}")
everyone = {name: m for info in school.values() for name, m in info["marks"].items()}
print(sorted(everyone, key=everyone.get, reverse=True)[:2])
defaults = {"term": 1, "year": 2026}
print(defaults | {"term": 2})`,
        output: "11-B (Ms Rao): best Asha, avg 84.5\n12-A (Mr Das): best Zoe, avg 72.3\n['Asha', 'Zoe']\n{'term': 2, 'year': 2026}\n",
        lines: [
          [5, "Loop over each class and its info dict."],
          [7, "`max(..., key=marks.get)` gives the key with the highest value."],
          [8, "Average of the values."],
          [10, "A dict comprehension flattens all classes into one name → mark dict."],
          [11, "Names sorted by mark, highest first; take the top two."],
          [13, "Merge: the right-hand dict's values win."],
        ],
      },
      mistakes: [
        { title: "Changing size while iterating", body: "`for k in d: del d[k]` raises RuntimeError. Iterate over `list(d)` or build a new dict." },
        { title: "Quote clashes in f-strings", body: "`f\"{info[\"teacher\"]}\"` is only valid from Python 3.12; use the other quote type inside: `f\"{info['teacher']}\"`." },
        { title: "Shallow merges of nested dicts", body: "`a | b` replaces a nested dict entirely rather than merging inside it." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 2,
          code: r`d = {"x": 3, "y": 1, "z": 2}
print(list(d), list(d.values()))
print(sorted(d, key=d.get), max(d.items(), key=lambda kv: kv[1]))`,
          answer: "['x', 'y', 'z'] [3, 1, 2]\n['y', 'z', 'x'] ('x', 3)\n",
          hint: "sorted with key=d.get orders keys by their values.",
          explain: "Keys and values keep insertion order. Sorting keys by value: y(1), z(2), x(3). The item with the largest value is ('x', 3).",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Build a dict of word → length.",
          code: r`words = ["hi", "hello"]
lengths = {w: ___ for w in words}
print(lengths)`,
          blanks: [["len(w)"]],
          output: "{'hi': 2, 'hello': 5}\n",
          hint: "The value for each key w.",
          explain: "`{w: len(w) for w in words}` maps each word to its length.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "This should remove all failing students but crashes. Which line causes it?",
          code: r`marks = {"a": 30, "b": 70, "c": 20}
for name in marks:
    if marks[name] < 40:
        del marks[name]
print(marks)`,
          line: 2,
          fix: r`marks = {"a": 30, "b": 70, "c": 20}
for name in list(marks):
    if marks[name] < 40:
        del marks[name]
print(marks)`,
          output: "{'b': 70}\n",
          hint: "Can a dict change size while you're looping over it?",
          explain: "Deleting during iteration raises `RuntimeError: dictionary changed size during iteration`. Loop over a copy of the keys, or build a new dict with a comprehension.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 2,
          prompt: "`{\"a\": 1, \"b\": 2} | {\"b\": 3}` is…",
          options: [
            { text: "`{'a': 1, 'b': 2}`", why: "The right side wins for shared keys." },
            { text: "`{'a': 1, 'b': 3}`", why: "Correct." },
            { text: "An error", why: "`|` merges dicts in Python 3.9+." },
          ],
          answer: 1,
          hint: "Which value wins for a key in both?",
          explain: "When merging, values from the right-hand dict overwrite those on the left.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Price list with discount", difficulty: 2,
          prompt: `Read a line of \`item=price\` pairs. Build a dict, then use a **dict comprehension** to make a discounted dict with 10% off every item over 100 (others unchanged), rounded to 2 decimals. Print each item in input order as \`item: old -> new\`.`,
          starter: r`prices = {}
for pair in input().split():
    item, price = pair.split("=")
    prices[item] = float(price)
`,
          tests: [
            { label: "Mixed", input: "bag=650 pen=10 shoes=1200\n", output: "bag: 650.0 -> 585.0\npen: 10.0 -> 10.0\nshoes: 1200.0 -> 1080.0" },
            { label: "Exactly 100", input: "book=100\n", output: "book: 100.0 -> 100.0", hidden: true, category: "boundary" },
            { label: "Decimals", input: "lamp=199.99\n", output: "lamp: 199.99 -> 179.99", hidden: true },
          ],
          hints: [
            "Write the new value as a conditional expression.",
            "`round(p * 0.9, 2) if p > 100 else p`.",
            "Comprehension: `{k: ... for k, p in prices.items()}`.",
            "Loop over `prices` and print `f\"{k}: {prices[k]} -> {sale[k]}\"`.",
          ],
          solution: r`prices = {}
for pair in input().split():
    item, price = pair.split("=")
    prices[item] = float(price)
sale = {k: (round(p * 0.9, 2) if p > 100 else p) for k, p in prices.items()}
for k in prices:
    print(f"{k}: {prices[k]} -> {sale[k]}")`,
          notes: "Comprehensions keep the original dict untouched and preserve key order.",
        },
        {
          id: "stretch", kind: "task", title: "Nested totals", difficulty: 3,
          prompt: `Read n, then n lines \`city category amount\` (sales). Build a nested dict \`{city: {category: total}}\`. Print each city alphabetically with its categories alphabetically: \`city category total\`, then a line \`city TOTAL sum\`.`,
          starter: r`n = int(input())
sales = {}
`,
          tests: [
            { label: "Two cities", input: "4\nPune food 100\nGoa food 50\nPune toys 30\nPune food 20\n", output: "Goa food 50\nGoa TOTAL 50\nPune food 120\nPune toys 30\nPune TOTAL 150" },
            { label: "One sale", input: "1\nX a 5\n", output: "X a 5\nX TOTAL 5", hidden: true, category: "boundary" },
          ],
          hints: [
            "Each city maps to an inner dict.",
            "`sales.setdefault(city, {})` gets (or creates) the inner dict.",
            "`inner[cat] = inner.get(cat, 0) + amount`.",
            "Loop `for city in sorted(sales):` then `for cat in sorted(sales[city]):`, and print the city's total with `sum(sales[city].values())`.",
          ],
          solution: r`n = int(input())
sales = {}
for _ in range(n):
    city, cat, amount = input().split()
    inner = sales.setdefault(city, {})
    inner[cat] = inner.get(cat, 0) + int(amount)
for city in sorted(sales):
    for cat in sorted(sales[city]):
        print(city, cat, sales[city][cat])
    print(city, "TOTAL", sum(sales[city].values()))`,
          notes: "Two levels of setdefault/get build a nested aggregation — the same shape as a pivot table.",
        },
      ],
      realWorld: "Walking JSON from an API (`data[\"results\"][0][\"name\"]`), merging configuration (defaults | user settings | environment), and reshaping records for reports are everyday dictionary tasks.",
      reteach: "A nested dict is a filing cabinet: the first key opens a drawer (a city), the second key picks a folder in it (a category), and inside is the value. `items()` lets you walk along a drawer reading each folder's label and contents together.",
      summary: [
        "Loop over keys (default), `.values()` or `.items()`; don't change the size while looping.",
        "Nested access goes one level per `[...]`; build nested data with setdefault/get.",
        "Dict comprehensions `{k: v for ...}`; merge with `|`, `{**a, **b}` or `update` (right side wins).",
      ],
    },

    {
      id: "py-dict-patterns",
      title: "Frequency maps, grouping and data modelling",
      minutes: 18,
      difficulty: 3,
      objectives: [
        "Count with a frequency map in one pass",
        "Group and aggregate records by a key",
        "Model real-world records with dictionaries and choose good keys",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "Which line increments a count for `word`, starting from 0 if it isn't there yet?",
        options: [
          { text: "`counts[word] += 1`", why: "KeyError the first time." },
          { text: "`counts[word] = counts.get(word, 0) + 1`", why: "Correct." },
          { text: "`counts.get(word) += 1`", why: "You can't assign to a function call." },
        ],
        answer: 1,
        hint: "Use a default for missing keys.",
        explain: "`get(word, 0)` treats a missing word as 0, then the new count is stored.",
      },
      why: "Counting things (votes, words, errors), grouping records (sales by month, students by class) and turning raw rows into structured data are among the most common jobs in data work — and they're all dictionary patterns.",
      concept: [
        {
          title: "Frequency maps",
          body: `\`\`\`python
counts = {}
for w in words:
    counts[w] = counts.get(w, 0) + 1
top = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))[:3]
\`\`\`

One pass over the data: O(n). (\`collections.Counter(words)\` does the same in one call — Module 21.)`,
        },
        {
          title: "Grouping and aggregation",
          body: `**Group**: key → list of items. **Aggregate**: key → total/count/average.

\`\`\`python
by_class = {}
for name, cls, mark in records:
    by_class.setdefault(cls, []).append(mark)
averages = {cls: sum(ms) / len(ms) for cls, ms in by_class.items()}
\`\`\``,
        },
        {
          title: "Modelling data and choosing keys",
          body: `A dict can represent one **record** (\`{"name": ..., "age": ...}\`) or an **index** from an ID to records (\`{roll_no: record}\`). Good keys are unique and stable — a roll number, not a name (two students can share a name). Composite keys can be tuples: \`{(row, col): value}\`, \`{(city, year): sales}\`.

Hashability recap: keys must not change, which is why tuples are allowed and lists aren't.`,
        },
      ],
      example: {
        title: "Votes and groups",
        code: r`votes = "red blue red green blue red".split()
counts = {}
for v in votes:
    counts[v] = counts.get(v, 0) + 1
print(counts)
winner = max(counts, key=counts.get)
print("winner:", winner)
records = [("Asha", "11-B", 91), ("Ravi", "11-B", 78), ("Zoe", "12-A", 85)]
groups = {}
for name, cls, mark in records:
    groups.setdefault(cls, []).append(mark)
print({cls: round(sum(m) / len(m), 1) for cls, m in groups.items()})
grid = {(0, 0): "start", (2, 3): "treasure"}
print(grid.get((2, 3)), grid.get((1, 1), "empty"))`,
        output: "{'red': 3, 'blue': 2, 'green': 1}\nwinner: red\n{'11-B': 84.5, '12-A': 85.0}\ntreasure empty\n",
        lines: [
          [4, "The frequency-map idiom: missing → 0, then add one."],
          [6, "The key with the largest count."],
          [11, "Group marks by class."],
          [12, "Aggregate each group into an average."],
          [13, "Tuple keys model a sparse grid: only interesting cells are stored."],
        ],
      },
      mistakes: [
        { title: "Counting with list.count in a loop", body: "`for w in set(words): words.count(w)` re-scans the list for every word. One dict pass is far faster." },
        { title: "Using names as unique keys", body: "Two people named Asha overwrite each other. Use an ID." },
        { title: "Ties when picking a maximum", body: "`max(counts, key=counts.get)` returns the first max it meets. Decide your tie rule explicitly." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`text = "to be or not to be"
freq = {}
for w in text.split():
    freq[w] = freq.get(w, 0) + 1
print(freq)
print(sorted(freq.items(), key=lambda kv: (-kv[1], kv[0]))[:2])`,
          answer: "{'to': 2, 'be': 2, 'or': 1, 'not': 1}\n[('be', 2), ('to', 2)]\n",
          hint: "Ties in the count are broken alphabetically by the sort key.",
          explain: "Counts in first-seen order. Sorting by (−count, word) puts 'be' before 'to' (both 2).",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Complete the counting idiom.",
          code: r`counts = {}
for ch in "aab":
    counts[ch] = counts.___(ch, 0) + 1
print(counts)`,
          blanks: [["get"]],
          output: "{'a': 2, 'b': 1}\n",
          hint: "A missing key should count as 0.",
          explain: "`counts.get(ch, 0) + 1`.",
        },
        {
          id: "b1", kind: "bug", difficulty: 2,
          prompt: "This crashes with KeyError on the first word. Which line?",
          code: r`counts = {}
for w in ["a", "b", "a"]:
    counts[w] += 1
print(counts)`,
          line: 3,
          fix: r`counts = {}
for w in ["a", "b", "a"]:
    counts[w] = counts.get(w, 0) + 1
print(counts)`,
          output: "{'a': 2, 'b': 1}\n",
          hint: "What's `counts[w]` the first time?",
          explain: "`+=` first reads `counts[w]`, which doesn't exist yet. Use `get` with a default of 0.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "You store marks as `{(roll_no, subject): mark}`. Why a tuple key?",
          options: [
            { text: "Tuples are faster than strings", why: "Speed isn't the reason." },
            { text: "The pair (roll_no, subject) uniquely identifies a mark and is hashable", why: "Correct." },
            { text: "Dicts require tuple keys", why: "Any hashable type works." },
          ],
          answer: 1,
          hint: "What makes a mark unique?",
          explain: "A composite key combines the fields that together identify one record; tuples are hashable.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Word frequency", difficulty: 2,
          prompt: `Read a line of text. Count the words (lower-case them; strip \`.,!?\` from each word). Print the words that appear **more than once**, most frequent first, ties alphabetical, as \`word count\`. If none, print \`no repeats\`.`,
          starter: r`words = input().lower().split()
counts = {}
`,
          tests: [
            { label: "Sentence", input: "The cat and the hat. The end, and done!\n", output: "the 3\nand 2" },
            { label: "No repeats", input: "One two three\n", output: "no repeats", category: "edge" },
            { label: "Tie", input: "b a b a c\n", output: "a 2\nb 2", hidden: true },
          ],
          hints: [
            "Clean each word with `.strip(\".,!?\")`.",
            "Count with the get idiom.",
            "Keep only items with count > 1.",
            "Sort with `key=lambda kv: (-kv[1], kv[0])`.",
          ],
          solution: r`words = input().lower().split()
counts = {}
for w in words:
    w = w.strip(".,!?")
    counts[w] = counts.get(w, 0) + 1
repeats = [(w, c) for w, c in counts.items() if c > 1]
if repeats:
    for w, c in sorted(repeats, key=lambda kv: (-kv[1], kv[0])):
        print(w, c)
else:
    print("no repeats")`,
          notes: "Clean → count → filter → sort: the standard text-statistics pipeline.",
        },
        {
          id: "stretch", kind: "challenge", title: "Group anagrams", difficulty: 4,
          prompt: `Read a line of words. Group words that are anagrams of each other (same letters, ignoring case). Print each group on one line, words in input order separated by spaces; order the groups by the position of their first word in the input.`,
          starter: r`words = input().split()
`,
          tests: [
            { label: "Classic", input: "listen silent enlist google tinsel banana\n", output: "listen silent enlist tinsel\ngoogle\nbanana" },
            { label: "Case-insensitive", input: "Dusty study night Thing\n", output: "Dusty study\nnight Thing", hidden: true, category: "edge" },
          ],
          hints: [
            "What do all anagrams of a word have in common?",
            "Their sorted letters: `\"\".join(sorted(w.lower()))`.",
            "Use that 'signature' as a dict key; the value is the list of words.",
            "Dicts keep insertion order, so groups come out in order of their first word.",
          ],
          solution: r`words = input().split()
groups = {}
for w in words:
    key = "".join(sorted(w.lower()))
    groups.setdefault(key, []).append(w)
for g in groups.values():
    print(" ".join(g))`,
          notes: "A canonical 'signature' key turns grouping into a single pass. This exact problem is a common interview question.",
        },
      ],
      realWorld: "Analytics dashboards are frequency maps and group-bys; log analysers count errors by type; recommendation systems group by user; databases do the same with GROUP BY (Module 31).",
      reteach: "Counting with a dict is like tally marks on a whiteboard: for each vote, find the candidate's name (or write it if it's new, starting at 0) and add a mark. Grouping is sorting post into labelled trays: the label (key) decides which tray (list) each letter (record) goes into.",
      summary: [
        "Frequency map: `d[k] = d.get(k, 0) + 1` — one pass.",
        "Group: `d.setdefault(k, []).append(x)`; aggregate each group afterwards.",
        "Choose unique, stable, hashable keys; tuples make composite keys.",
      ],
    },
  ],
  exam: [
    {
      id: "e1", kind: "predict", difficulty: 3,
      code: r`stock = {"pen": 5, "ink": 0, "pad": 2}
low = [k for k, v in stock.items() if v < 3]
stock.update({"ink": 10, "cap": 1})
print(low, sorted(stock, key=stock.get))`,
      answer: "['ink', 'pad'] ['cap', 'pad', 'pen', 'ink']\n",
      hint: "low is computed before the update.",
      explain: "Before the update ink (0) and pad (2) are below 3. After it: cap 1, pad 2, pen 5, ink 10.",
    },
    {
      id: "e2", kind: "mcq", difficulty: 2,
      prompt: "Which is the fastest way to check whether the key \"asha\" exists in a large dict `d`?",
      options: [
        { text: "`\"asha\" in d`", why: "Correct — O(1) average via hashing." },
        { text: "`\"asha\" in list(d)`", why: "Builds a list and scans it: O(n)." },
        { text: "`\"asha\" in d.values()`", why: "That checks values, not keys." },
      ],
      answer: 0,
      hint: "Dicts are hash tables.",
      explain: "Membership on the dict itself checks keys in constant time on average.",
    },
    {
      id: "e3", kind: "fill", difficulty: 3,
      prompt: "Swap keys and values.",
      code: r`codes = {"IN": "India", "JP": "Japan"}
names = {v: ___ for k, v in codes.items()}
print(names)`,
      blanks: [["k"]],
      output: "{'India': 'IN', 'Japan': 'JP'}\n",
      hint: "The new value is the old key.",
      explain: "`{v: k for k, v in codes.items()}` inverts the mapping (values must be unique and hashable).",
    },
    {
      id: "e4", kind: "bug", difficulty: 3,
      prompt: "This should print `Ravi`'s city but raises KeyError. Which line?",
      code: r`people = {"ravi": {"city": "Pune"}}
name = "Ravi"
print(people[name]["city"])`,
      line: 3,
      fix: r`people = {"ravi": {"city": "Pune"}}
name = "Ravi"
print(people[name.lower()]["city"])`,
      output: "Pune\n",
      hint: "Are dictionary keys case-sensitive?",
      explain: "The key is \"ravi\" (lower case) but the lookup uses \"Ravi\". Normalise the key: `name.lower()`.",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: library inventory", difficulty: 3,
    prompt: `Process library commands until \`END\`. The inventory maps a book title (single word) to its number of copies.

- \`ADD title n\` — add n copies.
- \`BORROW title\` — if copies > 0, take one and print \`ok\`; else print \`unavailable\`.
- \`RETURN title\` — add one copy back (only if the title is known; else print \`unknown book\`).
- \`REPORT\` — print each title alphabetically as \`title: copies\`.`,
    starter: r`inventory = {}
`,
    tests: [
      {
        label: "Session",
        input: "ADD python 2\nADD cplusplus 1\nBORROW python\nBORROW cplusplus\nBORROW cplusplus\nRETURN java\nRETURN cplusplus\nREPORT\nEND\n",
        output: "ok\nok\nunavailable\nunknown book\ncplusplus: 1\npython: 1",
      },
      { label: "Borrow unknown", input: "BORROW ghost\nADD ghost 1\nADD ghost 2\nREPORT\nEND\n", output: "unavailable\nghost: 3", hidden: true, category: "edge" },
    ],
    hints: [
      "Read lines in `while True:` and split each into words.",
      "`match parts:` with patterns like `[\"ADD\", title, n]` works nicely (or if/elif on parts[0]).",
      "Use `inventory.get(title, 0)` for borrowing unknown titles.",
      "REPORT: `for t in sorted(inventory): print(f\"{t}: {inventory[t]}\")`.",
    ],
    solution: r`inventory = {}
while True:
    parts = input().split()
    match parts:
        case ["END"]:
            break
        case ["ADD", title, n]:
            inventory[title] = inventory.get(title, 0) + int(n)
        case ["BORROW", title]:
            if inventory.get(title, 0) > 0:
                inventory[title] -= 1
                print("ok")
            else:
                print("unavailable")
        case ["RETURN", title]:
            if title in inventory:
                inventory[title] += 1
            else:
                print("unknown book")
        case ["REPORT"]:
            for t in sorted(inventory):
                print(f"{t}: {inventory[t]}")`,
    notes: "A dict as the 'database', match-case for commands, and safe access with get — a tiny command-driven app.",
  },
};
