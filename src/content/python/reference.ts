/**
 * Quick Reference: searchable syntax, built-ins, standard library and common patterns. Every
 * example is a complete program; tests/python-content.test.ts runs each one in the sandbox, and
 * where `output` is given it must match exactly.
 */
export interface RefEntry {
  name: string;
  section: string;
  summary: string;
  example: string;
  output?: string;
  /** Lesson to read for the full explanation. */
  lesson?: string;
}

export const REF_SECTIONS = ["Syntax basics", "Built-in functions", "Strings", "Lists and tuples", "Dictionaries and sets", "Functions", "Classes", "Errors", "Files", "Standard library", "Patterns", "Complexity"] as const;

const e = (section: (typeof REF_SECTIONS)[number], name: string, summary: string, example: string, output?: string, lesson?: string): RefEntry => ({ section, name, summary, example, output, lesson });

export const PY_REFERENCE: RefEntry[] = [
  e("Syntax basics", "print()", "Show values; sep= sets the separator, end= the line ending.", 'print("a", 1, sep="-", end="!\\n")', "a-1!\n", "py-first-program"),
  e("Syntax basics", "input()", "Read one line of text from standard input (always a str).", 'name = input()\nprint("Hi", name)'),
  e("Syntax basics", "Variables", "A name refers to a value; no declarations, types are checked at run time.", "x = 5\nx = \"now text\"\nprint(type(x).__name__)", "str\n"),
  e("Syntax basics", "Multiple assignment and swap", "Assign several names at once; swap without a temporary.", "a, b = 1, 2\na, b = b, a\nprint(a, b)", "2 1\n"),
  e("Syntax basics", "if / elif / else", "Run one branch: the first condition that is true.", "n = 7\nif n < 0:\n    print(\"neg\")\nelif n == 0:\n    print(\"zero\")\nelse:\n    print(\"pos\")", "pos\n"),
  e("Syntax basics", "Conditional expression", "A one-line choice between two values.", "age = 20\nprint(\"adult\" if age >= 18 else \"minor\")", "adult\n"),
  e("Syntax basics", "match / case (3.10+)", "Structural pattern matching on values and shapes.", "cmd = (\"move\", 3)\nmatch cmd:\n    case (\"move\", n):\n        print(\"moving\", n)\n    case _:\n        print(\"unknown\")", "moving 3\n"),
  e("Syntax basics", "for loop", "Repeat for each item of an iterable.", "for i in range(3):\n    print(i)", "0\n1\n2\n"),
  e("Syntax basics", "while loop", "Repeat while a condition stays true.", "n = 3\nwhile n > 0:\n    print(n)\n    n -= 1", "3\n2\n1\n"),
  e("Syntax basics", "break / continue / loop else", "Leave the loop, skip to the next round, or run else when no break happened.", "for n in [3, 5, 8]:\n    if n % 2 == 0:\n        print(\"even\", n)\n        break\nelse:\n    print(\"none even\")", "even 8\n"),
  e("Syntax basics", "Operators", "Arithmetic // (floor division), % (remainder), ** (power); comparison chains.", "print(7 // 2, 7 % 2, 2 ** 10, 1 < 5 < 9)", "3 1 1024 True\n"),
  e("Built-in functions", "len()", "Number of items in a collection or characters in a string.", "print(len([4, 5, 6]), len(\"hey\"))", "3 3\n"),
  e("Built-in functions", "range()", "range(stop), range(start, stop[, step]) — stop is excluded.", "print(list(range(2, 11, 3)))", "[2, 5, 8]\n"),
  e("Built-in functions", "int() / float() / str() / bool()", "Convert between types.", "print(int(\"42\") + 1, float(\"2.5\"), str(7) + \"!\", bool(\"\"))", "43 2.5 7! False\n"),
  e("Built-in functions", "sum() / min() / max()", "Aggregate an iterable; min/max accept key=.", "words = [\"pear\", \"fig\", \"banana\"]\nprint(sum([1, 2, 3]), min(words), max(words, key=len))", "6 banana banana\n"),
  e("Built-in functions", "sorted()", "A new sorted list; key= and reverse= customise it.", "print(sorted([\"b\", \"C\", \"a\"], key=str.lower))", "['a', 'b', 'C']\n"),
  e("Built-in functions", "enumerate()", "Pairs (index, item) while looping.", "for i, ch in enumerate(\"ab\", start=1):\n    print(i, ch)", "1 a\n2 b\n"),
  e("Built-in functions", "zip()", "Walk several iterables together.", "for n, s in zip([\"A\", \"B\"], [90, 75]):\n    print(n, s)", "A 90\nB 75\n"),
  e("Built-in functions", "map() / filter()", "Apply a function / keep items where it is true (both lazy).", "print(list(map(str.upper, [\"a\", \"b\"])), list(filter(lambda x: x > 1, [0, 1, 2, 3])))", "['A', 'B'] [2, 3]\n"),
  e("Built-in functions", "any() / all()", "Is any / every item truthy?", "nums = [2, 4, 7]\nprint(any(n % 2 for n in nums), all(n > 0 for n in nums))", "True True\n"),
  e("Built-in functions", "isinstance() / type()", "Check a value's type (isinstance respects inheritance).", "print(isinstance(True, int), type(3.0).__name__)", "True float\n"),
  e("Built-in functions", "round() / abs() / divmod()", "Rounding (to even on .5), absolute value, quotient and remainder together.", "print(round(2.675, 2), round(2.5), abs(-3), divmod(17, 5))", "2.67 2 3 (3, 2)\n"),
  e("Strings", "Indexing and slicing", "s[i], s[-1], s[start:stop:step]; strings are immutable.", "s = \"python\"\nprint(s[0], s[-1], s[1:4], s[::-1])", "p n yth nohtyp\n", "py-strings-basics"),
  e("Strings", "f-strings", "Embed expressions; format specs after a colon.", "price = 49.5\nprint(f\"Total: {price * 2:.2f} | {'ok':>5}|\")", "Total: 99.00 |    ok|\n"),
  e("Strings", "split() / join()", "Text → list of parts, and back.", "parts = \"a,b,c\".split(\",\")\nprint(parts, \"-\".join(parts))", "['a', 'b', 'c'] a-b-c\n"),
  e("Strings", "strip() / replace() / find()", "Trim whitespace, substitute, search (-1 if missing).", "s = \"  hi there  \"\nprint(s.strip().replace(\"there\", \"you\"), s.find(\"z\"))", "hi you -1\n"),
  e("Strings", "upper() / lower() / title() / isdigit()", "Case conversion and character tests.", "print(\"ab\".upper(), \"Hello World\".lower(), \"123\".isdigit())", "AB hello world True\n"),
  e("Strings", "count() / startswith() / in", "Count occurrences, test prefixes, test substrings.", "s = \"banana\"\nprint(s.count(\"a\"), s.startswith(\"ban\"), \"nan\" in s)", "3 True True\n"),
  e("Lists and tuples", "Create / index / slice", "Ordered, mutable sequences.", "nums = [10, 20, 30, 40]\nprint(nums[1], nums[-2:], nums[::2])", "20 [30, 40] [10, 30]\n"),
  e("Lists and tuples", "append / extend / insert / pop / remove", "Grow and shrink a list in place.", "a = [1, 2]\na.append(3)\na.extend([4, 5])\na.insert(0, 0)\na.pop()\na.remove(2)\nprint(a)", "[0, 1, 3, 4]\n"),
  e("Lists and tuples", "sort() vs sorted()", "list.sort() changes the list and returns None; sorted() returns a new list.", "a = [3, 1, 2]\nb = sorted(a)\na.sort(reverse=True)\nprint(a, b)", "[3, 2, 1] [1, 2, 3]\n"),
  e("Lists and tuples", "List comprehension", "[expression for item in iterable if condition]", "print([n * n for n in range(6) if n % 2 == 0])", "[0, 4, 16]\n"),
  e("Lists and tuples", "Copying", "b = a shares the list; a.copy() / a[:] make a shallow copy; copy.deepcopy for nested.", "import copy\na = [[1], [2]]\nb = a[:]\nc = copy.deepcopy(a)\na[0].append(9)\nprint(b[0], c[0])", "[1, 9] [1]\n"),
  e("Lists and tuples", "Tuples and unpacking", "Immutable sequences; unpack into names; * collects the rest.", "point = (3, 4)\nx, y = point\nfirst, *rest = [1, 2, 3]\nprint(x + y, rest, (5,))", "7 [2, 3] (5,)\n"),
  e("Dictionaries and sets", "Dictionary basics", "Key → value mapping; keys must be hashable.", "ages = {\"asha\": 16}\nages[\"ravi\"] = 17\nprint(ages[\"ravi\"], ages.get(\"zoe\", 0), len(ages))", "17 0 2\n"),
  e("Dictionaries and sets", "Iterate a dict", "keys(), values(), items() — in insertion order.", "d = {\"a\": 1, \"b\": 2}\nfor k, v in d.items():\n    print(k, v)", "a 1\nb 2\n"),
  e("Dictionaries and sets", "Counting with a dict", "The classic frequency map.", "counts = {}\nfor w in \"the cat the end\".split():\n    counts[w] = counts.get(w, 0) + 1\nprint(counts)", "{'the': 2, 'cat': 1, 'end': 1}\n"),
  e("Dictionaries and sets", "Dict comprehension and merge", "{k: v for ...}; d1 | d2 merges (3.9+).", "sq = {n: n * n for n in range(3)}\nprint(sq | {9: 81})", "{0: 0, 1: 1, 2: 4, 9: 81}\n"),
  e("Dictionaries and sets", "Sets", "Unique items; fast membership; union |, intersection &, difference -.", "a, b = {1, 2, 3}, {2, 3, 4}\nprint(sorted(a | b), sorted(a & b), sorted(a - b), 2 in a)", "[1, 2, 3, 4] [2, 3] [1] True\n"),
  e("Functions", "def / return", "Define reusable code; without return a function gives None.", "def area(w, h=1):\n    return w * h\nprint(area(3, 4), area(5))", "12 5\n"),
  e("Functions", "*args / **kwargs", "Collect extra positional / keyword arguments.", "def show(*args, **kwargs):\n    print(args, kwargs)\nshow(1, 2, mode=\"x\")", "(1, 2) {'mode': 'x'}\n"),
  e("Functions", "Keyword-only and positional-only", "Parameters after * must be named; before / must be positional.", "def f(a, /, b, *, c):\n    return a + b + c\nprint(f(1, 2, c=3))", "6\n"),
  e("Functions", "lambda", "A small anonymous function expression.", "pairs = [(1, \"b\"), (2, \"a\")]\nprint(sorted(pairs, key=lambda p: p[1]))", "[(2, 'a'), (1, 'b')]\n"),
  e("Functions", "Decorator", "A function that wraps another function.", "def shout(fn):\n    def wrapper(*a):\n        return fn(*a).upper()\n    return wrapper\n\n@shout\ndef greet(n):\n    return \"hi \" + n\n\nprint(greet(\"sam\"))", "HI SAM\n"),
  e("Functions", "Generator", "yield produces values lazily, one at a time.", "def countdown(n):\n    while n > 0:\n        yield n\n        n -= 1\nprint(list(countdown(3)))", "[3, 2, 1]\n"),
  e("Classes", "class / __init__ / methods", "Bundle data and behaviour.", "class Dog:\n    def __init__(self, name):\n        self.name = name\n    def speak(self):\n        return self.name + \" says woof\"\nprint(Dog(\"Rex\").speak())", "Rex says woof\n"),
  e("Classes", "Inheritance and super()", "Reuse and extend a parent class.", "class A:\n    def hi(self):\n        return \"A\"\nclass B(A):\n    def hi(self):\n        return super().hi() + \"B\"\nprint(B().hi())", "AB\n"),
  e("Classes", "@dataclass", "Generates __init__, __repr__ and __eq__.", "from dataclasses import dataclass\n\n@dataclass\nclass Point:\n    x: int\n    y: int = 0\n\nprint(Point(1), Point(1) == Point(1, 0))", "Point(x=1, y=0) True\n"),
  e("Classes", "Dunder methods", "__str__, __len__, __eq__, __add__ … customise built-in behaviour.", "class Bag:\n    def __init__(self, items):\n        self.items = items\n    def __len__(self):\n        return len(self.items)\nprint(len(Bag([1, 2])))", "2\n"),
  e("Classes", "@property", "Computed attribute with attribute syntax.", "class Circle:\n    def __init__(self, r):\n        self.r = r\n    @property\n    def area(self):\n        return round(3.14159 * self.r ** 2, 2)\nprint(Circle(2).area)", "12.57\n"),
  e("Errors", "try / except / else / finally", "Handle specific errors; else runs if none; finally always runs.", "try:\n    n = int(\"x\")\nexcept ValueError as err:\n    print(\"bad:\", err)\nelse:\n    print(\"ok\")\nfinally:\n    print(\"done\")", "bad: invalid literal for int() with base 10: 'x'\ndone\n"),
  e("Errors", "raise and custom exceptions", "Signal problems with your own exception types.", "class TooYoung(Exception):\n    pass\ntry:\n    raise TooYoung(\"must be 13+\")\nexcept TooYoung as e:\n    print(e)", "must be 13+\n"),
  e("Errors", "assert", "State something that must be true (for debugging and tests).", "x = 5\nassert x > 0, \"x must be positive\"\nprint(\"fine\")", "fine\n"),
  e("Files", "Write and read text", "Always use with; give an encoding.", "with open(\"notes.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"one\\ntwo\\n\")\nwith open(\"notes.txt\", encoding=\"utf-8\") as f:\n    print(f.read().splitlines())", "['one', 'two']\n"),
  e("Files", "pathlib", "Object-oriented paths.", "from pathlib import Path\np = Path(\"data.txt\")\np.write_text(\"hello\")\nprint(p.read_text(), p.suffix, p.exists())", "hello .txt True\n"),
  e("Files", "csv", "Read and write CSV safely.", "import csv\nwith open(\"m.csv\", \"w\", newline=\"\") as f:\n    csv.writer(f).writerows([[\"n\", \"s\"], [\"a\", 5]])\nwith open(\"m.csv\", newline=\"\") as f:\n    print(list(csv.DictReader(f)))", "[{'n': 'a', 's': '5'}]\n"),
  e("Files", "json", "Python objects ↔ JSON text.", "import json\ntext = json.dumps({\"a\": [1, 2]})\nprint(text, json.loads(text)[\"a\"][1])", "{\"a\": [1, 2]} 2\n"),
  e("Standard library", "collections.Counter / defaultdict / deque", "Counting, default values, fast queues.", "from collections import Counter, defaultdict, deque\nprint(Counter(\"hello\").most_common(1))\nd = defaultdict(list)\nd[\"x\"].append(1)\nq = deque([1, 2])\nq.appendleft(0)\nprint(dict(d), list(q))", "[('l', 2)]\n{'x': [1]} [0, 1, 2]\n"),
  e("Standard library", "itertools", "Combinatorics and lazy iterator tools.", "from itertools import combinations, accumulate\nprint(list(combinations(\"abc\", 2)), list(accumulate([1, 2, 3])))", "[('a', 'b'), ('a', 'c'), ('b', 'c')] [1, 3, 6]\n"),
  e("Standard library", "functools.lru_cache", "Memoise a pure function.", "from functools import lru_cache\n\n@lru_cache(maxsize=None)\ndef fib(n):\n    return n if n < 2 else fib(n - 1) + fib(n - 2)\n\nprint(fib(50))", "12586269025\n"),
  e("Standard library", "heapq / bisect", "Priority queue and binary search on sorted lists.", "import heapq, bisect\nh = [5, 1, 4]\nheapq.heapify(h)\nprint(heapq.heappop(h), bisect.bisect_left([1, 3, 5], 4))", "1 2\n"),
  e("Standard library", "math / statistics / random", "Maths functions, averages, random choices.", "import math, statistics, random\nrandom.seed(1)\nprint(math.sqrt(16), statistics.mean([1, 2, 3, 4]), math.isclose(0.1 + 0.2, 0.3))", "4.0 2.5 True\n"),
  e("Standard library", "datetime", "Dates, times and differences.", "from datetime import date, timedelta\nd = date(2026, 10, 9)\nprint(d + timedelta(days=30), d.strftime(\"%d %b %Y\"))", "2026-11-08 09 Oct 2026\n"),
  e("Standard library", "re", "Regular expressions.", "import re\nprint(re.findall(r\"\\d+\", \"a1 b22 c333\"), bool(re.fullmatch(r\"[a-z]+\", \"abc\")))", "['1', '22', '333'] True\n"),
  e("Standard library", "decimal / fractions", "Exact decimal money maths and exact fractions.", "from decimal import Decimal\nfrom fractions import Fraction\nprint(Decimal(\"0.1\") + Decimal(\"0.2\"), Fraction(1, 3) + Fraction(1, 6))", "0.3 1/2\n"),
  e("Standard library", "enum", "Named constant values.", "from enum import Enum\nclass Color(Enum):\n    RED = 1\n    GREEN = 2\nprint(Color.RED.name, Color(2))", "RED Color.GREEN\n"),
  e("Standard library", "logging", "Structured diagnostic messages instead of print.", "import logging, sys\nlogging.basicConfig(stream=sys.stdout, level=logging.INFO, format=\"%(levelname)s:%(message)s\")\nlogging.info(\"started\")", "INFO:started\n"),
  e("Standard library", "sqlite3", "A real SQL database in one file (or in memory).", "import sqlite3\ndb = sqlite3.connect(\":memory:\")\ndb.execute(\"create table t(name text)\")\ndb.execute(\"insert into t values (?)\", (\"asha\",))\nprint(db.execute(\"select name from t\").fetchall())", "[('asha',)]\n"),
  e("Patterns", "Read many numbers from one line", "map + split for competitive-style input.", "a, b = map(int, \"3 4\".split())\nprint(a * b)", "12\n"),
  e("Patterns", "Swap, min/max tracking", "Track the best value while looping.", "best = None\nfor n in [4, 9, 2]:\n    if best is None or n > best:\n        best = n\nprint(best)", "9\n"),
  e("Patterns", "Two pointers", "Walk inwards from both ends of a sorted list.", "nums, target = [1, 3, 4, 6, 8], 10\ni, j = 0, len(nums) - 1\nwhile i < j:\n    s = nums[i] + nums[j]\n    if s == target:\n        print(nums[i], nums[j])\n        break\n    if s < target:\n        i += 1\n    else:\n        j -= 1", "4 6\n"),
  e("Patterns", "Sliding window", "Maximum sum of k consecutive items in O(n).", "nums, k = [2, 1, 5, 1, 3, 2], 3\nwindow = sum(nums[:k])\nbest = window\nfor i in range(k, len(nums)):\n    window += nums[i] - nums[i - k]\n    best = max(best, window)\nprint(best)", "9\n"),
  e("Patterns", "Group items by key", "Build lists inside a dict.", "from collections import defaultdict\ngroups = defaultdict(list)\nfor w in [\"apple\", \"avocado\", \"banana\"]:\n    groups[w[0]].append(w)\nprint(dict(groups))", "{'a': ['apple', 'avocado'], 'b': ['banana']}\n"),
  e("Patterns", "if __name__ == \"__main__\"", "Run code only when the file is executed directly, not imported.", "def main():\n    print(\"running\")\n\nif __name__ == \"__main__\":\n    main()", "running\n"),
  e("Complexity", "Common costs", "list index O(1), list `in` O(n), dict/set `in` O(1) average, sort O(n log n), append O(1) amortised, insert(0) O(n).", "import timeit\nprint(\"set lookup is fast:\", timeit.timeit(\"5000 in s\", \"s = set(range(10000))\", number=1000) < 1)", "set lookup is fast: True\n"),
];
