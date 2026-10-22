import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 21 — Useful standard library. */
export const M21: PyModuleDef = {
  id: "py-stdlib",
  number: 21,
  level: 3,
  title: "Useful Standard Library",
  summary: "math, random, statistics, decimal, fractions, datetime and time; collections, itertools, functools, heapq, bisect and enum; os, sys, pathlib, shutil, subprocess, argparse and logging; json, csv, re, typing, unittest and pdb.",
  track: "core",
  prereqs: ["py-regex"],
  lessons: [
    {
      id: "py-stdlib-numbers-time",
      title: "Numbers, randomness and time",
      minutes: 17,
      difficulty: 3,
      objectives: [
        "Use math, statistics, decimal and fractions for exact and numeric work",
        "Generate reproducible random data with random.seed",
        "Work with dates, times, durations and time zones (datetime, time)",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "Which type gives an exact result for `0.1 + 0.2`?",
        options: [
          { text: "float", why: "Floats give 0.30000000000000004." },
          { text: "Decimal(\"0.1\") + Decimal(\"0.2\")", why: "Correct — decimal arithmetic is exact for decimal fractions." },
          { text: "int", why: "Ints can't hold 0.1." },
        ],
        answer: 1,
        hint: "A module made for money.",
        explain: "`decimal.Decimal` works in base 10, so 0.1 + 0.2 is exactly 0.3 (create Decimals from strings).",
      },
      why: "Money, statistics, simulations, scheduling — these come up in almost every real application, and the standard library already solves them correctly (leap years, rounding, time zones) so you don't have to.",
      concept: [
        {
          title: "math, statistics, decimal, fractions",
          body: `\`\`\`python
import math, statistics
from decimal import Decimal, ROUND_HALF_UP
from fractions import Fraction

math.sqrt(2), math.ceil(4.1), math.gcd(12, 18), math.comb(5, 2), math.isclose(a, b)
statistics.mean(xs), statistics.median(xs), statistics.mode(xs), statistics.stdev(xs)
Decimal("19.995").quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)   # Decimal('20.00')
Fraction(1, 3) + Fraction(1, 6)                                          # Fraction(1, 2)
\`\`\`

Use Decimal for money (from **strings**, not floats), Fraction for exact ratios.`,
        },
        {
          title: "random",
          body: `\`\`\`python
import random
random.seed(42)                 # same seed → same sequence (reproducible tests/simulations)
random.randint(1, 6)            # 1..6 inclusive
random.choice(["a", "b"]); random.sample(range(100), 5); random.shuffle(deck)
random.random()                 # 0.0 <= x < 1.0
\`\`\`

\`random\` is **not** for security (passwords, tokens) — use \`secrets\` (Module 33).`,
        },
        {
          title: "datetime and time",
          body: `\`\`\`python
from datetime import date, datetime, timedelta, timezone
d = date(2026, 10, 9); d.weekday(); d.isoformat()
dt = datetime(2026, 10, 9, 14, 30)
dt + timedelta(hours=36)
datetime.strptime("09/10/2026", "%d/%m/%Y")      # parse
dt.strftime("%d %b %Y, %I:%M %p")                 # format
IST = timezone(timedelta(hours=5, minutes=30))
datetime(2026, 10, 9, 9, 0, tzinfo=IST).astimezone(timezone.utc)
\`\`\`

\`time.time()\` gives seconds since 1970 (for timestamps); \`time.perf_counter()\` measures durations.`,
        },
      ],
      example: {
        title: "A small finance and calendar toolkit",
        code: r`import math, statistics, random
from decimal import Decimal, ROUND_HALF_UP
from fractions import Fraction
from datetime import date, datetime, timedelta, timezone

prices = [Decimal("19.99"), Decimal("5.01"), Decimal("0.10")]
total = sum(prices)
print(total, (total * Decimal("1.18")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))
print(Fraction(3, 4) - Fraction(1, 6), math.comb(6, 2), statistics.median([5, 1, 9, 3]))
random.seed(7)
print([random.randint(1, 6) for _ in range(5)])
start = date(2026, 10, 9)
print(start + timedelta(days=100), start.strftime("%A"), (date(2027, 1, 1) - start).days)
IST = timezone(timedelta(hours=5, minutes=30))
meet = datetime(2026, 10, 9, 18, 0, tzinfo=IST)
print(meet.astimezone(timezone.utc).strftime("%H:%M %Z"))`,
        output: "25.10 29.62\n7/12 15 4.0\n[3, 2, 4, 6, 1]\n2027-01-17 Friday 84\n12:30 UTC\n",
        lines: [
          [6, "Decimals created from strings are exact."],
          [8, "Add 18% GST and round to paise, half-up (the rule shops use)."],
          [9, "Exact fraction arithmetic, combinations C(6,2), and the median."],
          [10, "Seeding makes the 'random' rolls the same every run."],
          [13, "Date arithmetic with timedelta; weekday names; days between dates."],
          [16, "Convert India time (UTC+5:30) to UTC."],
        ],
      },
      mistakes: [
        { title: "Decimal from floats", body: "`Decimal(0.1)` is `0.1000000000000000055511151231257827…` — always pass strings." },
        { title: "random for secrets", body: "random is predictable. Use `secrets.token_urlsafe()` for tokens and passwords." },
        { title: "Naive datetimes across time zones", body: "Datetimes without tzinfo can't be compared reliably across zones. Store UTC and convert for display." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`from decimal import Decimal
from fractions import Fraction
print(Decimal("0.1") * 3, 0.1 * 3 == 0.3, Fraction(2, 6))`,
          answer: "0.3 False 1/3\n",
          hint: "Decimal is exact in base 10; Fraction reduces automatically.",
          explain: "Decimal multiplication gives exactly 0.3; float doesn't; Fraction(2, 6) normalises to 1/3.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Parse the date string.",
          code: r`from datetime import datetime
d = datetime.___("25/12/2026", "%d/%m/%Y")
print(d.date(), d.strftime("%a"))`,
          blanks: [["strptime"]],
          output: "2026-12-25 Fri\n",
          hint: "string-parse-time.",
          explain: "`datetime.strptime(text, format)` parses; `strftime` formats.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "The bill should be exactly `0.30`. Which line causes the long, inexact result?",
          code: r`from decimal import Decimal
a = Decimal(0.1)
b = Decimal("0.2")
print((a + b).quantize(Decimal("0.01")), a + b == Decimal("0.3"))`,
          line: 2,
          fix: r`from decimal import Decimal
a = Decimal("0.1")
b = Decimal("0.2")
print((a + b).quantize(Decimal("0.01")), a + b == Decimal("0.3"))`,
          output: "0.30 True\n",
          hint: "How was a created?",
          explain: "`Decimal(0.1)` captures the float's binary error. Create Decimals from strings.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 2,
          prompt: "Which should generate a password-reset token?",
          options: [
            { text: "`random.random()`", why: "Predictable — not cryptographically secure." },
            { text: "`secrets.token_urlsafe(32)`", why: "Correct." },
            { text: "`time.time()`", why: "Guessable." },
          ],
          answer: 1,
          hint: "Security-grade randomness.",
          explain: "The secrets module uses the OS's secure random source.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "GST invoice with Decimal", difficulty: 3,
          prompt: `Read lines \`item qty price\` until \`end\` (price like \`19.99\`). Using Decimal, print each line total, then subtotal, GST at 18% and grand total, all rounded half-up to 2 decimals:

\`\`\`
pen x3 = 29.97
subtotal 29.97
gst 5.39
total 35.36
\`\`\``,
          starter: r`from decimal import Decimal, ROUND_HALF_UP
CENT = Decimal("0.01")
`,
          tests: [
            { label: "One item", input: "pen 3 9.99\nend\n", output: "pen x3 = 29.97\nsubtotal 29.97\ngst 5.39\ntotal 35.36" },
            { label: "Two items", input: "book 2 250.50\nbag 1 999\nend\n", output: "book x2 = 501.00\nbag x1 = 999.00\nsubtotal 1500.00\ngst 270.00\ntotal 1770.00", hidden: true },
          ],
          hints: [
            "Convert price with `Decimal(price_text)` and qty with int.",
            "Round with `.quantize(CENT, rounding=ROUND_HALF_UP)`.",
            "GST = subtotal × Decimal(\"0.18\"), rounded.",
            "total = subtotal + gst.",
          ],
          solution: r`from decimal import Decimal, ROUND_HALF_UP
CENT = Decimal("0.01")

def money(x):
    return x.quantize(CENT, rounding=ROUND_HALF_UP)

subtotal = Decimal("0")
while (line := input()) != "end":
    item, qty, price = line.split()
    line_total = money(Decimal(price) * int(qty))
    subtotal += line_total
    print(f"{item} x{qty} = {line_total}")
gst = money(subtotal * Decimal("0.18"))
print("subtotal", money(subtotal))
print("gst", gst)
print("total", money(subtotal + gst))`,
          notes: "Decimal keeps every paisa exact and quantize applies the rounding rule explicitly — essential for invoices and tax.",
        },
        {
          id: "stretch", kind: "task", title: "Meeting planner across time zones", difficulty: 4,
          prompt: `Read a meeting time in India \`YYYY-MM-DD HH:MM\` and a duration in minutes. Print the start and end in IST, UTC and New York time (fixed offset UTC−4 for this exercise), as \`ZONE: HH:MM–HH:MM (Day)\` where Day is the weekday abbreviation of the start in that zone.`,
          starter: r`from datetime import datetime, timedelta, timezone
IST = timezone(timedelta(hours=5, minutes=30), "IST")
UTC = timezone.utc
NYC = timezone(timedelta(hours=-4), "EDT")
`,
          tests: [
            { label: "Evening meeting", input: "2026-10-09 18:00\n90\n", output: "IST: 18:00–19:30 (Fri)\nUTC: 12:30–14:00 (Fri)\nEDT: 08:30–10:00 (Fri)" },
            { label: "Early morning crosses day", input: "2026-10-10 07:00\n30\n", output: "IST: 07:00–07:30 (Sat)\nUTC: 01:30–02:00 (Sat)\nEDT: 21:30–22:00 (Fri)", hidden: true, category: "edge" },
          ],
          hints: [
            "Parse with strptime and attach IST: `.replace(tzinfo=IST)`.",
            "end = start + timedelta(minutes=...).",
            "Convert with `.astimezone(zone)`.",
            "Name each zone in the output with a small list of (label, tz) pairs.",
          ],
          solution: r`from datetime import datetime, timedelta, timezone
IST = timezone(timedelta(hours=5, minutes=30), "IST")
UTC = timezone.utc
NYC = timezone(timedelta(hours=-4), "EDT")

start = datetime.strptime(input(), "%Y-%m-%d %H:%M").replace(tzinfo=IST)
end = start + timedelta(minutes=int(input()))
for label, zone in [("IST", IST), ("UTC", UTC), ("EDT", NYC)]:
    s, e = start.astimezone(zone), end.astimezone(zone)
    print(f"{label}: {s:%H:%M}–{e:%H:%M} ({s:%a})")`,
          notes: "Aware datetimes convert correctly across zones. Real code uses `zoneinfo.ZoneInfo(\"America/New_York\")` to handle daylight-saving changes automatically (it needs the system's tz database).",
        },
      ],
      realWorld: "Billing systems use Decimal; reproducible ML experiments and games seed random; every scheduling, booking and logging system depends on datetime and correct time-zone handling.",
      reteach: "The standard library is a well-stocked toolkit: `decimal` is a careful accountant who never loses a paisa, `fractions` keeps exact ratios, `random` is a dice-roller you can rewind with a seed, and `datetime` is a calendar that already knows every leap year and time zone offset.",
      summary: [
        "math/statistics for numbers; Decimal (from strings) for money; Fraction for exact ratios.",
        "random.seed for reproducibility; secrets (not random) for security.",
        "datetime/date/timedelta/timezone: parse with strptime, format with strftime, store UTC.",
      ],
    },

    {
      id: "py-stdlib-collections",
      title: "collections, itertools, heapq, bisect and enum",
      minutes: 18,
      difficulty: 3,
      objectives: [
        "Use Counter, defaultdict, deque, namedtuple and OrderedDict",
        "Combine iterators with itertools (product, combinations, groupby, chain, accumulate)",
        "Use heapq, bisect and enum for priority queues, sorted search and named constants",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "What does `Counter(\"banana\").most_common(1)` return?",
        options: [
          { text: "`[('a', 3)]`", why: "Correct." },
          { text: "`'a'`", why: "most_common returns (item, count) pairs in a list." },
          { text: "`3`", why: "It returns pairs, not just counts." },
        ],
        answer: 0,
        hint: "A list of (item, count) pairs.",
        explain: "Counter counts items; most_common(n) returns the n most frequent as (item, count) tuples.",
      },
      why: "These modules replace dozens of hand-written loops with fast, tested tools: counting, grouping, queues, leaderboards, scheduling by priority, searching sorted data. Interviewers and senior developers expect you to know them.",
      concept: [
        {
          title: "collections",
          body: `\`\`\`python
from collections import Counter, defaultdict, deque, namedtuple
Counter(words).most_common(3)          # frequency map in one call
groups = defaultdict(list); groups[k].append(v)   # no setdefault needed
q = deque([1, 2]); q.appendleft(0); q.popleft()   # O(1) at both ends (lists are O(n) at the front)
q = deque(maxlen=3)                    # keeps only the last 3 items
Point = namedtuple("Point", "x y"); Point(1, 2).x  # readable tuple
\`\`\``,
        },
        {
          title: "itertools",
          body: `\`\`\`python
from itertools import product, permutations, combinations, chain, groupby, accumulate, islice, count
list(product("ab", [1, 2]))          # all pairs
list(combinations("abc", 2))         # ('a','b'), ('a','c'), ('b','c')
list(chain([1, 2], [3]))             # [1, 2, 3]
list(accumulate([1, 2, 3]))          # running totals [1, 3, 6]
for key, grp in groupby(sorted(words, key=len), key=len): ...   # groups consecutive equal keys
\`\`\`

All lazy: they produce items on demand.`,
        },
        {
          title: "heapq, bisect, enum",
          body: `\`\`\`python
import heapq, bisect
from enum import Enum, auto
heap = []; heapq.heappush(heap, (2, "write")); heapq.heappop(heap)   # smallest first
heapq.nlargest(3, scores)
bisect.bisect_left(sorted_list, x)   # where x would go, O(log n)
bisect.insort(sorted_list, x)        # insert keeping order
class Status(Enum):
    TODO = auto(); DONE = auto()
\`\`\``,
        },
      ],
      example: {
        title: "Toolkit in action",
        code: r`from collections import Counter, defaultdict, deque, namedtuple
from itertools import combinations, groupby, accumulate
import heapq, bisect
from enum import Enum

votes = "red blue red green red blue".split()
print(Counter(votes).most_common(2))
by_len = defaultdict(list)
for w in ["hi", "yes", "no", "cat"]:
    by_len[len(w)].append(w)
print(dict(by_len))
recent = deque(maxlen=3)
for page in ["home", "about", "blog", "contact"]:
    recent.append(page)
print(list(recent))
Student = namedtuple("Student", "name mark")
s = Student("Asha", 91)
print(s.name, s._asdict())
print(list(combinations([1, 2, 3], 2)), list(accumulate([5, 10, 15])))
print([(k, list(g)) for k, g in groupby("aaabcc")])
tasks = [(3, "email"), (1, "fix bug"), (2, "review")]
heapq.heapify(tasks)
print(heapq.heappop(tasks), heapq.nlargest(1, [7, 3, 9]))
grades = [40, 60, 75, 90]
print(bisect.bisect_right(grades, 82), "ABCDE"[::-1][bisect.bisect_right(grades, 82)])
class Level(Enum):
    LOW = 1
    HIGH = 3
print(Level.HIGH, Level(1).name, [l.value for l in Level])`,
        output: "[('red', 3), ('blue', 2)]\n{2: ['hi', 'no'], 3: ['yes', 'cat']}\n['about', 'blog', 'contact']\nAsha {'name': 'Asha', 'mark': 91}\n[(1, 2), (1, 3), (2, 3)] [5, 15, 30]\n[('a', ['a', 'a', 'a']), ('b', ['b']), ('c', ['c', 'c'])]\n(1, 'fix bug') [9]\n3 B\nLevel.HIGH LOW [1, 3]\n",
        lines: [
          [7, "Counter: counting and ranking in one line."],
          [8, "defaultdict(list) creates missing lists automatically."],
          [11, "A bounded deque keeps the 3 most recent pages."],
          [15, "namedtuple gives tuples readable field names."],
          [18, "combinations and running totals."],
          [19, "groupby groups CONSECUTIVE equal items."],
          [22, "A heap pops the smallest priority first."],
          [24, "bisect finds the band: 82 falls after the third threshold → grade index 3 of 'EDCBA' = B."],
          [28, "Enums give named, comparable constants."],
        ],
      },
      mistakes: [
        { title: "groupby without sorting", body: "groupby only groups neighbours. Sort by the same key first." },
        { title: "list.pop(0) in a loop", body: "Removing from the front of a list is O(n). Use deque.popleft()." },
        { title: "Comparing heap items that tie", body: "If priorities tie, Python compares the next tuple item — make sure it's comparable (or add a counter)." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`from collections import Counter
from itertools import product
c = Counter("hello world")
print(c["l"], c["z"], c.most_common(1))
print(len(list(product(range(3), repeat=2))))`,
          answer: "3 0 [('l', 3)]\n9\n",
          hint: "Missing keys in a Counter count as 0.",
          explain: "'l' appears 3 times; a missing key returns 0 (no KeyError). product with repeat=2 over 3 items gives 9 pairs.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Remove from the left end efficiently.",
          code: r`from collections import deque
q = deque(["a", "b", "c"])
print(q.___(), list(q))`,
          blanks: [["popleft"]],
          output: "a ['b', 'c']\n",
          hint: "pop + left.",
          explain: "deque.popleft() is O(1).",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "This should group words by first letter as `a: ant apple / b: bee` but prints `a` twice. Which line?",
          code: r`from itertools import groupby
words = ["apple", "bee", "ant"]
for letter, group in groupby(words, key=lambda w: w[0]):
    print(f"{letter}: {' '.join(group)}")`,
          line: 3,
          fix: r`from itertools import groupby
words = ["apple", "bee", "ant"]
for letter, group in groupby(sorted(words), key=lambda w: w[0]):
    print(f"{letter}: {' '.join(group)}")`,
          output: "a: ant apple\nb: bee\n",
          hint: "groupby only groups consecutive items.",
          explain: "Unsorted input gives separate 'a' groups. Sort first (here alphabetically, which also sorts by first letter).",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "You repeatedly need the task with the smallest deadline from a changing set. Best structure?",
          options: [
            { text: "Sort a list after every insert", why: "O(n log n) each time." },
            { text: "A heap (heapq)", why: "Correct — O(log n) push and pop." },
            { text: "A set", why: "Sets are unordered." },
          ],
          answer: 1,
          hint: "Priority queue.",
          explain: "heapq keeps the smallest item at index 0 with logarithmic updates.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Top words with Counter", difficulty: 2,
          prompt: `Read a line of text. Using \`Counter\`, print the 3 most common words (lower-cased, stripped of \`.,!?\`) as \`word count\` — ties in the order they first appear — then the number of distinct words.`,
          starter: r`from collections import Counter
`,
          tests: [
            { label: "Sentence", input: "The cat and the hat. The end, and the cat!\n", output: "the 4\ncat 2\nand 2\ndistinct 5" },
            { label: "One word", input: "hi hi hi\n", output: "hi 3\ndistinct 1", hidden: true, category: "edge" },
          ],
          hints: [
            "Clean: `[w.strip(\".,!?\").lower() for w in text.split()]`.",
            "`Counter(words).most_common(3)` keeps first-seen order for ties.",
            "`len(counter)` is the number of distinct words.",
            "Print each pair, then the distinct count.",
          ],
          solution: r`from collections import Counter

words = [w.strip(".,!?").lower() for w in input().split()]
counts = Counter(words)
for word, n in counts.most_common(3):
    print(word, n)
print("distinct", len(counts))`,
          notes: "Counter replaces the manual dict counting from Module 11; most_common orders ties by first insertion.",
        },
        {
          id: "stretch", kind: "challenge", title: "Task scheduler with a heap", difficulty: 4,
          prompt: `Process commands until \`end\`: \`add PRIORITY NAME\` (lower number = more urgent), \`next\` (print and remove the most urgent task; ties: the one added first; print \`idle\` if none), \`peek\` (print without removing). Use heapq with a counter for tie-breaking.`,
          starter: r`import heapq
from itertools import count
`,
          tests: [
            { label: "Session", input: "add 2 write\nadd 1 fix\nadd 2 review\npeek\nnext\nnext\nnext\nnext\nend\n", output: "fix\nfix\nwrite\nreview\nidle" },
            { label: "Only next", input: "next\nend\n", output: "idle", hidden: true, category: "edge" },
          ],
          hints: [
            "Push tuples (priority, order, name) where order comes from a counter.",
            "heappush/heappop keep the smallest tuple at index 0.",
            "peek reads heap[0][2].",
            "Check `if heap:` before popping or peeking.",
          ],
          solution: r`import heapq
from itertools import count

heap = []
order = count()
while (line := input()) != "end":
    parts = line.split()
    if parts[0] == "add":
        heapq.heappush(heap, (int(parts[1]), next(order), parts[2]))
    elif parts[0] == "next":
        print(heapq.heappop(heap)[2] if heap else "idle")
    elif parts[0] == "peek":
        print(heap[0][2] if heap else "idle")`,
          notes: "The counter makes ties resolve in insertion order (and prevents comparing names). This is the classic priority-queue pattern used in schedulers and Dijkstra's algorithm (Module 44).",
        },
      ],
      realWorld: "Counter powers analytics; deque implements queues and sliding windows; heapq schedules jobs and finds top-k; bisect assigns grades/bands and searches sorted data; enum makes statuses explicit instead of magic strings.",
      reteach: "Think of these as specialised containers in a kitchen: Counter is a tally sheet, defaultdict a drawer that creates its own dividers, deque a queue you can join or leave at either end, heapq a stack of urgent orders where the most urgent is always on top, and bisect a librarian who finds a book's place on a sorted shelf in a few steps.",
      summary: [
        "collections: Counter, defaultdict, deque, namedtuple.",
        "itertools: product, combinations, permutations, chain, groupby (sort first!), accumulate, islice, count.",
        "heapq for priority queues/top-k, bisect for sorted search/insert, Enum for named constants.",
      ],
    },

    {
      id: "py-stdlib-system",
      title: "os, sys, shutil, subprocess, argparse and logging",
      minutes: 17,
      difficulty: 3,
      objectives: [
        "Inspect the environment with os and sys",
        "Build command-line interfaces with argparse",
        "Replace print debugging with logging; know how subprocess and shutil are used safely",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "Why use `logging` instead of `print` in a real application?",
        options: [
          { text: "It's faster", why: "Speed isn't the main reason." },
          { text: "Levels, timestamps, destinations (files, services) and on/off control without editing code", why: "Correct." },
          { text: "print doesn't work in programs", why: "It works — it's just not configurable." },
        ],
        answer: 1,
        hint: "Configurable output.",
        explain: "logging lets you filter by level, format messages, and send them to files or monitoring tools.",
      },
      why: "Real tools run from the command line with options, read environment settings, copy files, call other programs and leave a log trail. These modules are the plumbing of scripts, DevOps tools and servers.",
      concept: [
        {
          title: "os and sys",
          body: `\`\`\`python
import os, sys
os.environ.get("APP_MODE", "dev")     # environment variables (with a default)
os.getcwd(); os.listdir(".")          # current folder, its contents
sys.argv                              # command-line arguments
sys.version_info >= (3, 10)
sys.exit(1)                           # exit with a status code (non-zero = failure)
print("problem", file=sys.stderr)     # error output
\`\`\``,
        },
        {
          title: "argparse",
          body: `\`\`\`python
import argparse
parser = argparse.ArgumentParser(description="Resize images")
parser.add_argument("folder")                          # positional
parser.add_argument("--width", type=int, default=800)  # option with type and default
parser.add_argument("-v", "--verbose", action="store_true")
args = parser.parse_args()            # reads sys.argv; parse_args(["pics", "--width", "300"]) for tests
args.folder, args.width, args.verbose
\`\`\`

argparse generates \`--help\` and error messages automatically.`,
        },
        {
          title: "logging, shutil, subprocess",
          body: `\`\`\`python
import logging
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
log = logging.getLogger("backup")
log.info("copied %d files", 12); log.warning("disk 90%% full")
\`\`\`

\`shutil.copy2\`, \`copytree\`, \`move\`, \`rmtree\`, \`disk_usage\` handle files and folders.

\`subprocess.run(["git", "status"], capture_output=True, text=True, check=True)\` runs another program. **Pass a list, never a shell string built from user input** (\`shell=True\` + user input = command injection, Module 33). CodeMentor's sandbox blocks starting programs, so subprocess examples are shown for your own computer.`,
        },
      ],
      example: {
        title: "A small CLI with logging",
        code: r`import argparse, logging, os, sys

parser = argparse.ArgumentParser(prog="greet", description="Greets people")
parser.add_argument("names", nargs="+")
parser.add_argument("--times", type=int, default=1)
parser.add_argument("--shout", action="store_true")
args = parser.parse_args(["Asha", "Ravi", "--times", "2", "--shout"])

logging.basicConfig(stream=sys.stdout, level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger("greet")
log.info("greeting %d people", len(args.names))
for name in args.names:
    for _ in range(args.times):
        text = f"hello {name}"
        print(text.upper() if args.shout else text)
log.debug("this is hidden at INFO level")
mode = os.environ.get("GREET_MODE", "normal")
log.warning("mode=%s, Python 3.10+: %s", mode, sys.version_info >= (3, 10))`,
        output: "INFO: greeting 2 people\nHELLO ASHA\nHELLO ASHA\nHELLO RAVI\nHELLO RAVI\nWARNING: mode=normal, Python 3.10+: True\n",
        lines: [
          [4, "nargs=\"+\" means one or more positional values."],
          [7, "Passing a list to parse_args lets us test without a real command line."],
          [9, "Configure logging once: level and message format."],
          [11, "%-style arguments are only formatted if the message is actually logged."],
          [16, "DEBUG messages are filtered out below the INFO level."],
          [17, "Environment variables with a default (the sandbox's environment is empty)."],
          [18, "sys.version_info compares like a tuple — handy for version checks."],
        ],
      },
      mistakes: [
        { title: "shell=True with user input", body: "`subprocess.run(f\"convert {name}\", shell=True)` lets `name = \"x; rm -rf ~\"` run arbitrary commands. Pass a list of arguments." },
        { title: "Formatting log messages eagerly", body: "`log.debug(f\"big {expensive()}\")` always computes; `log.debug(\"big %s\", value)` formats only when shown." },
        { title: "Reading secrets into logs", body: "Never log passwords, tokens or full card numbers (Module 33)." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`import argparse
p = argparse.ArgumentParser()
p.add_argument("file")
p.add_argument("--lines", type=int, default=10)
p.add_argument("--quiet", action="store_true")
a = p.parse_args(["log.txt", "--lines", "5"])
print(a.file, a.lines + 1, a.quiet)`,
          answer: "log.txt 6 False\n",
          hint: "type=int converts; store_true defaults to False.",
          explain: "lines is converted to the int 5; quiet wasn't given, so it's False.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Read an environment variable with a default.",
          code: r`import os
level = os.environ.___("LOG_LEVEL", "INFO")
print(level)`,
          blanks: [["get"]],
          output: "INFO\n",
          hint: "Same method as for dicts.",
          explain: "`os.environ` behaves like a dict; `.get(key, default)` avoids KeyError.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "This should log the WARNING line but nothing appears. Which line is the bug?",
          code: r`import logging, sys
logging.basicConfig(stream=sys.stdout, level=logging.ERROR, format="%(levelname)s %(message)s")
logging.warning("disk almost full")`,
          line: 2,
          fix: r`import logging, sys
logging.basicConfig(stream=sys.stdout, level=logging.WARNING, format="%(levelname)s %(message)s")
logging.warning("disk almost full")`,
          output: "WARNING disk almost full\n",
          hint: "Which levels pass the ERROR threshold?",
          explain: "With level ERROR, WARNING messages are filtered out. Lower the threshold to WARNING (or INFO).",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "Which subprocess call is safe when `filename` comes from a user?",
          options: [
            { text: "`subprocess.run(f\"wc -l {filename}\", shell=True)`", why: "Command injection risk." },
            { text: "`subprocess.run([\"wc\", \"-l\", filename])`", why: "Correct — the filename is one argument, never parsed by a shell." },
            { text: "`os.system(\"wc -l \" + filename)`", why: "Same injection risk as shell=True." },
          ],
          answer: 1,
          hint: "Avoid the shell.",
          explain: "Passing a list runs the program directly; special characters in filename are not interpreted.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "A word-count CLI", difficulty: 3,
          prompt: `Write an argparse parser for a tool \`wc\` with a positional \`text\` and options \`--words\`, \`--chars\` (flags) and \`--top N\` (int, default 0). The input line holds the arguments (split it with \`shlex.split\`). Print what's requested, in this order: \`words N\`, \`chars N\`, then the top N words by count (\`word count\`, ties by first appearance). If neither flag is given, print both counts.`,
          starter: r`import argparse, shlex
from collections import Counter
`,
          tests: [
            { label: "Words + top", input: "\"a b a c a b\" --words --top 2\n", output: "words 6\na 3\nb 2" },
            { label: "Default both", input: "\"hi there\"\n", output: "words 2\nchars 8", hidden: true },
            { label: "Chars only", input: "\"abc\" --chars\n", output: "chars 3", hidden: true },
          ],
          hints: [
            "`argv = shlex.split(input())` handles the quotes.",
            "add_argument(\"--words\", action=\"store_true\") etc.",
            "If neither flag is set, behave as if both were.",
            "Top words: `Counter(text.split()).most_common(args.top)`.",
          ],
          solution: r`import argparse, shlex
from collections import Counter

parser = argparse.ArgumentParser(prog="wc")
parser.add_argument("text")
parser.add_argument("--words", action="store_true")
parser.add_argument("--chars", action="store_true")
parser.add_argument("--top", type=int, default=0)
args = parser.parse_args(shlex.split(input()))
both = not (args.words or args.chars)
if args.words or both:
    print("words", len(args.text.split()))
if args.chars or both:
    print("chars", len(args.text))
for word, n in Counter(args.text.split()).most_common(args.top):
    print(word, n)`,
          notes: "Passing a list to parse_args makes CLIs easy to test; shlex.split splits a command line the way a shell would.",
        },
        {
          id: "stretch", kind: "task", title: "Backup with logging", difficulty: 3,
          prompt: `Files in the folder are listed in the file list. Copy every \`.txt\` file into a new folder \`backup/\` with \`shutil.copy2\`, logging \`INFO copied NAME\` for each (format \`%(levelname)s %(message)s\` to stdout) and \`WARNING skipped NAME\` for other files (sorted by name). Finish with \`INFO done: N copied, M skipped\` and print the sorted contents of backup/.`,
          starter: r`import logging, shutil, sys
from pathlib import Path
`,
          files: [
            { name: "a.txt", content: "alpha\n" },
            { name: "b.csv", content: "x,y\n" },
            { name: "notes.txt", content: "notes\n" },
          ],
          tests: [{ label: "Three files", input: "", output: "INFO copied a.txt\nWARNING skipped b.csv\nINFO copied notes.txt\nINFO done: 2 copied, 1 skipped\n['a.txt', 'notes.txt']" }],
          hints: [
            "Configure logging with stream=sys.stdout and the format.",
            "Create the folder with `Path(\"backup\").mkdir(exist_ok=True)`.",
            "Loop over sorted files (skip folders and main.py).",
            "Use logging.info / logging.warning and count both kinds.",
          ],
          solution: r`import logging, shutil, sys
from pathlib import Path

logging.basicConfig(stream=sys.stdout, level=logging.INFO, format="%(levelname)s %(message)s")
backup = Path("backup")
backup.mkdir(exist_ok=True)
copied = skipped = 0
for p in sorted(Path(".").iterdir()):
    if not p.is_file() or p.name == "main.py":
        continue
    if p.suffix == ".txt":
        shutil.copy2(p, backup / p.name)
        logging.info("copied %s", p.name)
        copied += 1
    else:
        logging.warning("skipped %s", p.name)
        skipped += 1
logging.info("done: %d copied, %d skipped", copied, skipped)
print(sorted(f.name for f in backup.iterdir()))`,
          notes: "copy2 preserves timestamps. Logging levels let the same script be quiet in production (WARNING) and chatty while debugging (DEBUG).",
        },
      ],
      realWorld: "DevOps scripts, deployment tools and data jobs are CLIs built with argparse (or Typer, Module 42), configured with environment variables, logging to files or log services, and calling git, docker or ffmpeg through subprocess.",
      reteach: "os and sys are the program's view of its surroundings (where am I, what settings, what was I called with). argparse is a receptionist who reads the command line and hands you neat answers. logging is a ship's logbook with importance levels. subprocess is asking another worker to do a job — hand them precise instructions (a list), never a sentence anyone could rewrite.",
      summary: [
        "os.environ, os.getcwd, sys.argv, sys.exit, sys.stderr for the environment.",
        "argparse: positionals, typed options, flags, defaults, automatic --help; test with parse_args([...]).",
        "logging with levels and formats instead of print; shutil for file trees; subprocess with argument lists only.",
      ],
      libraryCode: [{
        title: "Running another program with subprocess",
        code: `import subprocess

result = subprocess.run(
    ["git", "log", "--oneline", "-5"],
    capture_output=True, text=True, check=True, timeout=10,
)
print(result.stdout)`,
        note: "Run inside a git repository on your own computer. The CodeMentor sandbox refuses to start other programs, so this can't run here. `check=True` raises CalledProcessError on failure; `timeout` stops hung commands.",
      }],
    },

    {
      id: "py-stdlib-dev-tools",
      title: "typing, unittest and pdb",
      minutes: 16,
      difficulty: 3,
      objectives: [
        "Annotate code with the typing module's common types",
        "Write and run unit tests with unittest",
        "Use pdb and breakpoint() to debug interactively",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "What does a unit test check?",
        options: [
          { text: "That the code compiles", why: "Python doesn't compile ahead like that; tests check behaviour." },
          { text: "That a small piece of code gives the expected result for given inputs", why: "Correct." },
          { text: "That the program is fast", why: "That's performance testing." },
        ],
        answer: 1,
        hint: "Small, automatic checks.",
        explain: "Unit tests call a function with known inputs and assert the outputs, so regressions are caught automatically.",
      },
      why: "Types, tests and a debugger are the professional safety net: types catch mismatches before running, tests catch broken behaviour after every change, and pdb shows exactly what the program is doing when something goes wrong.",
      concept: [
        {
          title: "typing essentials",
          body: `\`\`\`python
from typing import Optional, Union, Callable, Iterable, Any, TypedDict
def first(items: list[str]) -> Optional[str]: ...      # str | None in 3.10+
def apply(f: Callable[[int], int], xs: Iterable[int]) -> list[int]: ...
class Point(TypedDict):
    x: int
    y: int
\`\`\`

Run \`mypy\` or \`pyright\` to check them (Module 24 goes deep).`,
        },
        {
          title: "unittest",
          body: `\`\`\`python
import unittest

class TestGrade(unittest.TestCase):
    def test_a(self):
        self.assertEqual(grade(95), "A")
    def test_rejects_negative(self):
        with self.assertRaises(ValueError):
            grade(-1)

unittest.main()        # discovers test_* methods and runs them
\`\`\`

Assertions: \`assertEqual\`, \`assertTrue\`, \`assertIn\`, \`assertAlmostEqual\`, \`assertRaises\`. pytest (Module 29) is the popular alternative with plain \`assert\`.`,
        },
        {
          title: "pdb",
          body: `Put \`breakpoint()\` where you want to stop. In the debugger:

| Command | Does |
| --- | --- |
| \`n\` | next line |
| \`s\` | step into a call |
| \`c\` | continue |
| \`p expr\` | print a value |
| \`l\` | list code around the current line |
| \`q\` | quit |

pdb is interactive, so it runs on your own computer (or in an IDE's debugger) — in CodeMentor, **Step through** gives you a similar line-by-line view.`,
        },
      ],
      example: {
        title: "Testing a function with unittest",
        code: r`import io, unittest
from typing import Optional

def find_price(menu: dict[str, int], item: str) -> Optional[int]:
    return menu.get(item.lower())

class TestFindPrice(unittest.TestCase):
    menu = {"tea": 15, "coffee": 25}
    def test_known(self):
        self.assertEqual(find_price(self.menu, "Tea"), 15)
    def test_unknown(self):
        self.assertIsNone(find_price(self.menu, "juice"))
    def test_bug_demo(self):
        self.assertEqual(find_price(self.menu, "COFFEE"), 30)

suite = unittest.defaultTestLoader.loadTestsFromTestCase(TestFindPrice)
result = unittest.TextTestRunner(stream=io.StringIO()).run(suite)
print("ran", result.testsRun, "| failures", len(result.failures), "| ok", result.wasSuccessful())
print(result.failures[0][0].id().split(".")[-1])`,
        output: "ran 3 | failures 1 | ok False\ntest_bug_demo\n",
        lines: [
          [4, "Type hints: a dict of str to int in, an int or None out."],
          [7, "Test classes subclass TestCase; methods starting with test_ are tests."],
          [10, "assertEqual compares actual and expected."],
          [14, "A deliberately wrong expectation, to show a failing test."],
          [16, "Load and run the tests, sending the runner's text to a buffer (we print a summary instead)."],
          [19, "Which test failed."],
        ],
      },
      mistakes: [
        { title: "Tests that test nothing", body: "A test without assertions always passes. Every test should assert an expected outcome." },
        { title: "Leaving breakpoint() in code", body: "A forgotten breakpoint() pauses production. Remove it (or set PYTHONBREAKPOINT=0)." },
        { title: "Testing only the happy path", body: "Also test edge cases and errors (assertRaises)." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`import io, unittest
class T(unittest.TestCase):
    def test_add(self):
        self.assertEqual(1 + 1, 2)
    def test_div(self):
        with self.assertRaises(ZeroDivisionError):
            1 / 0
    def helper(self):
        self.fail("not a test")
r = unittest.TextTestRunner(stream=io.StringIO()).run(unittest.defaultTestLoader.loadTestsFromTestCase(T))
print(r.testsRun, r.wasSuccessful())`,
          answer: "2 True\n",
          hint: "Only methods whose names start with test are run.",
          explain: "helper isn't a test (no test_ prefix), so 2 tests run and both pass.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Check that the function raises ValueError.",
          code: r`import io, unittest
def age(n):
    if n < 0:
        raise ValueError("negative")
    return n
class T(unittest.TestCase):
    def test_negative(self):
        with self.___(ValueError):
            age(-1)
r = unittest.TextTestRunner(stream=io.StringIO()).run(unittest.defaultTestLoader.loadTestsFromTestCase(T))
print(r.wasSuccessful())`,
          blanks: [["assertRaises"]],
          output: "True\n",
          hint: "assert + Raises.",
          explain: "`with self.assertRaises(E):` passes only if the block raises E.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "This test never runs (0 tests). Which line is the bug?",
          code: r`import io, unittest
class T(unittest.TestCase):
    def check_upper(self):
        self.assertEqual("a".upper(), "A")
r = unittest.TextTestRunner(stream=io.StringIO()).run(unittest.defaultTestLoader.loadTestsFromTestCase(T))
print(r.testsRun)`,
          line: 3,
          fix: r`import io, unittest
class T(unittest.TestCase):
    def test_upper(self):
        self.assertEqual("a".upper(), "A")
r = unittest.TextTestRunner(stream=io.StringIO()).run(unittest.defaultTestLoader.loadTestsFromTestCase(T))
print(r.testsRun)`,
          output: "1\n",
          hint: "How does unittest find tests?",
          explain: "unittest only runs methods whose names start with `test`.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 2,
          prompt: "In pdb, how do you see the value of a variable `total`?",
          options: [
            { text: "`n total`", why: "n moves to the next line." },
            { text: "`p total`", why: "Correct." },
            { text: "`c total`", why: "c continues execution." },
          ],
          answer: 1,
          hint: "p for print.",
          explain: "`p expression` prints its value in the debugger.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Write tests for a function", difficulty: 3,
          prompt: `\`slugify(title)\` turns \`"Hello, World!"\` into \`"hello-world"\`. Write a TestCase \`TestSlugify\` with at least **four** tests (normal title, extra spaces, punctuation, empty string → empty). The given runner prints \`True True\` when at least four tests ran and all of them passed.`,
          starter: r`import io, re, unittest

def slugify(title: str) -> str:
    words = re.findall(r"[a-z0-9]+", title.lower())
    return "-".join(words)

class TestSlugify(unittest.TestCase):
    pass

r = unittest.TextTestRunner(stream=io.StringIO()).run(unittest.defaultTestLoader.loadTestsFromTestCase(TestSlugify))
print(r.testsRun >= 4, r.wasSuccessful())`,
          tests: [{ label: "Your tests run and pass", input: "", output: "True True" }],
          hints: [
            "Each test is a method named test_something with an assertEqual.",
            "`self.assertEqual(slugify(\"Hello, World!\"), \"hello-world\")`.",
            "Extra spaces: `\"  Python   rocks \"` → `\"python-rocks\"`.",
            "Empty: `slugify(\"\")` should be `\"\"`.",
          ],
          solution: r`import io, re, unittest

def slugify(title: str) -> str:
    words = re.findall(r"[a-z0-9]+", title.lower())
    return "-".join(words)

class TestSlugify(unittest.TestCase):
    def test_normal(self):
        self.assertEqual(slugify("Hello, World!"), "hello-world")

    def test_spaces(self):
        self.assertEqual(slugify("  Python   rocks "), "python-rocks")

    def test_punctuation(self):
        self.assertEqual(slugify("C++ & Python: 2026?"), "c-python-2026")

    def test_empty(self):
        self.assertEqual(slugify(""), "")

r = unittest.TextTestRunner(stream=io.StringIO()).run(unittest.defaultTestLoader.loadTestsFromTestCase(TestSlugify))
print(r.testsRun >= 4, r.wasSuccessful())`,
          notes: "Good tests cover the normal case, messy input and edge cases. If someone later breaks slugify, these four tests say exactly how.",
        },
        {
          id: "stretch", kind: "debug", title: "Fix code to pass its tests", difficulty: 3,
          prompt: `\`median\` has a bug that the provided tests reveal. Fix **only** \`median\` so the runner prints \`3 True\`.`,
          starter: r`import io, unittest

def median(values: list[float]) -> float:
    s = sorted(values)
    n = len(s)
    return s[n // 2]

class TestMedian(unittest.TestCase):
    def test_odd(self):
        self.assertEqual(median([3, 1, 2]), 2)
    def test_even(self):
        self.assertEqual(median([4, 1, 3, 2]), 2.5)
    def test_empty(self):
        with self.assertRaises(ValueError):
            median([])

r = unittest.TextTestRunner(stream=io.StringIO()).run(unittest.defaultTestLoader.loadTestsFromTestCase(TestMedian))
print(r.testsRun, r.wasSuccessful())`,
          tests: [{ label: "Tests pass", input: "", output: "3 True" }],
          hints: [
            "Which tests fail with the current code?",
            "Even-length lists need the average of the two middle values.",
            "An empty list must raise ValueError (currently IndexError).",
            "`if not s: raise ValueError(\"empty\")`; for even n return `(s[n // 2 - 1] + s[n // 2]) / 2`.",
          ],
          solution: r`import io, unittest

def median(values: list[float]) -> float:
    s = sorted(values)
    n = len(s)
    if n == 0:
        raise ValueError("median of empty list")
    if n % 2 == 1:
        return s[n // 2]
    return (s[n // 2 - 1] + s[n // 2]) / 2

class TestMedian(unittest.TestCase):
    def test_odd(self):
        self.assertEqual(median([3, 1, 2]), 2)
    def test_even(self):
        self.assertEqual(median([4, 1, 3, 2]), 2.5)
    def test_empty(self):
        with self.assertRaises(ValueError):
            median([])

r = unittest.TextTestRunner(stream=io.StringIO()).run(unittest.defaultTestLoader.loadTestsFromTestCase(TestMedian))
print(r.testsRun, r.wasSuccessful())`,
          notes: "This is test-driven fixing: the tests define correct behaviour, and you change the code until they pass (TDD, Module 29).",
        },
      ],
      realWorld: "Every professional codebase has a test suite run automatically on every change (CI); type checking runs in the same pipeline; debuggers (pdb, VS Code, PyCharm) are used daily to understand failures.",
      reteach: "Type hints are labels on the boxes saying what should go in them; a type checker reads the labels and complains about mismatches before you run anything. Unit tests are a checklist that a robot ticks after every change. pdb is a pause button with a magnifying glass.",
      summary: [
        "typing: list[str], dict[str, int], Optional/X | None, Callable, Iterable, TypedDict — checked by mypy/pyright.",
        "unittest: TestCase classes, test_ methods, assertEqual/assertRaises…, run with a runner or unittest.main().",
        "pdb/breakpoint(): n, s, c, p, l, q — interactive, run on your own machine.",
      ],
    },
  ],
  exam: [
    {
      id: "e1", kind: "predict", difficulty: 3,
      code: r`from collections import Counter, defaultdict
from itertools import accumulate
c = Counter([3, 1, 3, 2, 3, 1])
d = defaultdict(int)
for x in [3, 1, 3]:
    d[x] += 10
print(c.most_common(2), dict(d), list(accumulate([1, 1, 1, 1]))[-1])`,
      answer: "[(3, 3), (1, 2)] {3: 20, 1: 10} 4\n",
      hint: "defaultdict(int) starts missing keys at 0.",
      explain: "3 appears 3 times, 1 twice. The defaultdict adds 10 per occurrence. Running totals end at 4.",
    },
    {
      id: "e2", kind: "mcq", difficulty: 3,
      prompt: "Which data structure should hold a fixed-size history of the last 100 events?",
      options: [
        { text: "list with pop(0)", why: "Works but O(n) per removal." },
        { text: "`deque(maxlen=100)`", why: "Correct — old items drop off automatically." },
        { text: "set", why: "Sets don't keep order or duplicates." },
      ],
      answer: 1,
      hint: "Bounded queue.",
      explain: "A deque with maxlen discards from the other end when full, in O(1).",
    },
    {
      id: "e3", kind: "fill", difficulty: 3,
      prompt: "Find where 70 would be inserted to keep the list sorted.",
      code: r`import bisect
print(bisect.___([10, 50, 90], 70))`,
      blanks: [["bisect_left", "bisect", "bisect_right"]],
      output: "2\n",
      hint: "Binary search for the insertion point.",
      explain: "70 belongs at index 2 (between 50 and 90).",
    },
    {
      id: "e4", kind: "bug", difficulty: 3,
      prompt: "The meeting should convert 9:00 IST to 03:30 UTC. Which line is the bug?",
      code: r`from datetime import datetime, timedelta, timezone
IST = timezone(timedelta(hours=5, minutes=30))
t = datetime(2026, 10, 9, 9, 0)
print(t.astimezone(timezone.utc).strftime("%H:%M") if t.tzinfo else "naive time!")`,
      line: 3,
      fix: r`from datetime import datetime, timedelta, timezone
IST = timezone(timedelta(hours=5, minutes=30))
t = datetime(2026, 10, 9, 9, 0, tzinfo=IST)
print(t.astimezone(timezone.utc).strftime("%H:%M") if t.tzinfo else "naive time!")`,
      output: "03:30\n",
      hint: "Does t know its time zone?",
      explain: "The datetime is naive (no tzinfo). Attach IST when creating it, then convert.",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: attendance analytics", difficulty: 4,
    prompt: `\`attendance.csv\` has \`date,student,status\` (P or A). Print:

1. \`days: N\` — distinct dates,
2. per student (alphabetical) \`name: P/N (pct%)\` with pct rounded to a whole number,
3. \`longest absence streak: NAME D\` — the longest run of consecutive recorded **A** days for any student (ties: alphabetical),
4. \`weekday with most absences: DAY\` (full weekday name; ties: earliest weekday Mon→Sun).

Use csv, collections (Counter/defaultdict), itertools.groupby and datetime.`,
    starter: r`import csv
from collections import Counter, defaultdict
from itertools import groupby
from datetime import date
`,
    files: [{ name: "attendance.csv", content: "date,student,status\n2026-10-05,asha,P\n2026-10-05,ravi,A\n2026-10-06,asha,P\n2026-10-06,ravi,A\n2026-10-07,asha,A\n2026-10-07,ravi,A\n2026-10-08,asha,P\n2026-10-08,ravi,P\n2026-10-09,asha,A\n2026-10-09,ravi,A\n" }],
    tests: [{ label: "Week", input: "", output: "days: 5\nasha: 3/5 (60%)\nravi: 1/5 (20%)\nlongest absence streak: ravi 3\nweekday with most absences: Wednesday" }],
    hints: [
      "Read rows into a dict student → list of (date, status) sorted by date.",
      "Present count / days for the percentages.",
      "groupby(statuses) gives runs; measure runs of 'A'.",
      "Count absences by `date.fromisoformat(d).weekday()`; pick max count, then smallest weekday number.",
    ],
    solution: r`import csv
from collections import Counter, defaultdict
from itertools import groupby
from datetime import date

records = defaultdict(list)
dates = set()
with open("attendance.csv", newline="", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        records[row["student"]].append((row["date"], row["status"]))
        dates.add(row["date"])
print("days:", len(dates))
best = (0, "")
absences = Counter()
for name in sorted(records):
    rows = sorted(records[name])
    present = sum(1 for _, s in rows if s == "P")
    print(f"{name}: {present}/{len(rows)} ({round(present / len(rows) * 100)}%)")
    for status, run in groupby(s for _, s in rows):
        length = len(list(run))
        if status == "A" and length > best[0]:
            best = (length, name)
    for d, s in rows:
        if s == "A":
            absences[date.fromisoformat(d).weekday()] += 1
print(f"longest absence streak: {best[1]} {best[0]}")
top = max(absences.values())
day = min(wd for wd, n in absences.items() if n == top)
print("weekday with most absences:", ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][day])`,
    notes: "Five standard-library modules cooperate: csv reads, defaultdict groups, groupby finds runs, Counter tallies, datetime turns dates into weekdays.",
  },
};
