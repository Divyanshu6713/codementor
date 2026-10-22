import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 19 — Iterators and generators. */
export const M19: PyModuleDef = {
  id: "py-generators",
  number: 19,
  level: 3,
  title: "Iterators and Generators",
  summary: "Custom iterables with __iter__ and __next__; generator functions and yield; yield from; generator pipelines; lazy data processing; memory use of generators vs lists; practical streaming examples.",
  track: "core",
  prereqs: ["py-func-advanced"],
  lessons: [
    {
      id: "py-custom-iterators",
      title: "Custom iterables and the iterator protocol",
      minutes: 16,
      difficulty: 4,
      objectives: [
        "Implement `__iter__` and `__next__` to make a class iterable",
        "Separate an iterable from its iterator so it can be looped over many times",
        "Raise StopIteration correctly",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "Which method does a `for` loop call to get the next item?",
        options: [
          { text: "`__getitem__`", why: "Old fallback protocol; the modern one uses __next__." },
          { text: "`__next__` on the iterator (after `__iter__` gives the iterator)", why: "Correct." },
          { text: "`next_item`", why: "Not a special method." },
        ],
        answer: 1,
        hint: "iter() then next().",
        explain: "for calls iter(obj) → obj.__iter__(), then repeatedly next(it) → it.__next__() until StopIteration.",
      },
      why: "Making your own objects work in `for` loops, `sum()`, `list()` and comprehensions makes them feel native. Understanding the protocol is also the key to generators, which are the easy way to write iterators.",
      concept: [
        {
          title: "The protocol",
          body: `- An **iterable** has \`__iter__()\` returning an iterator.
- An **iterator** has \`__next__()\` returning the next value or raising \`StopIteration\`, and \`__iter__()\` returning itself.

\`\`\`python
class Countdown:
    def __init__(self, start):
        self.start = start
    def __iter__(self):
        return CountdownIterator(self.start)     # a fresh iterator each time

class CountdownIterator:
    def __init__(self, n):
        self.n = n
    def __iter__(self):
        return self
    def __next__(self):
        if self.n <= 0:
            raise StopIteration
        self.n -= 1
        return self.n + 1
\`\`\``,
        },
        {
          title: "Why separate them?",
          body: `If the iterable returned *itself*, a second loop over it would find it already exhausted. Returning a new iterator from \`__iter__\` lets you loop over the same object many times — like a list. (Files are the counter-example: a file is its own iterator, so it reads once.)`,
        },
      ],
      example: {
        title: "A reusable range of dates",
        code: r`from datetime import date, timedelta

class DateRange:
    def __init__(self, start, days):
        self.start, self.days = start, days
    def __iter__(self):
        return DateIter(self.start, self.days)

class DateIter:
    def __init__(self, start, days):
        self.current, self.left = start, days
    def __iter__(self):
        return self
    def __next__(self):
        if self.left == 0:
            raise StopIteration
        value = self.current
        self.current += timedelta(days=1)
        self.left -= 1
        return value

week = DateRange(date(2026, 10, 9), 3)
print([d.strftime("%a %d") for d in week])
print(len(list(week)), max(week).isoformat())
it = iter(week)
print(next(it).day, next(it).day, next(it, None) is not None, next(it, "done"))`,
        output: "['Fri 09', 'Sat 10', 'Sun 11']\n3 2026-10-11\n9 10 True done\n",
        lines: [
          [7, "Each loop gets a brand-new iterator."],
          [13, "Iterators return themselves from __iter__."],
          [16, "StopIteration ends the loop."],
          [23, "Comprehensions, list() and max() all speak the protocol."],
          [24, "The same DateRange can be iterated again and again."],
          [25, "Driving the iterator by hand with next()."],
        ],
      },
      mistakes: [
        { title: "Returning self from the iterable", body: "Then the object can only be looped over once. Return a new iterator (or use a generator method, next lesson)." },
        { title: "Returning None at the end", body: "The end must be signalled by raising StopIteration, not by returning None." },
        { title: "Forgetting __iter__ on the iterator", body: "Iterators must also be iterable (return self), or `for x in it` fails." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`class Twice:
    def __init__(self, items):
        self.items = items
    def __iter__(self):
        for x in self.items:
            yield x
            yield x
t = Twice("ab")
print(list(t), "".join(t))`,
          answer: "['a', 'a', 'b', 'b'] aabb\n",
          hint: "A generator method in __iter__ creates a fresh iterator each time.",
          explain: "Each call of __iter__ starts a new generator, so both list() and join() see every item twice.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Signal the end of iteration.",
          code: r`class Three:
    def __init__(self):
        self.n = 0
    def __iter__(self):
        return self
    def __next__(self):
        if self.n == 3:
            raise ___
        self.n += 1
        return self.n
print(list(Three()))`,
          blanks: [["StopIteration"]],
          output: "[1, 2, 3]\n",
          hint: "The exception that ends a for loop.",
          explain: "Raising StopIteration tells the consumer there are no more items.",
        },
        {
          id: "b1", kind: "bug", difficulty: 4,
          prompt: "The second loop prints nothing. Which line makes the object single-use?",
          code: r`class Squares:
    def __init__(self, n):
        self.n, self.i = n, 0
    def __iter__(self):
        return self
    def __next__(self):
        if self.i >= self.n:
            raise StopIteration
        self.i += 1
        return self.i ** 2
s = Squares(3)
print(list(s), list(s))`,
          line: 5,
          fix: r`class Squares:
    def __init__(self, n):
        self.n = n
    def __iter__(self):
        return (i * i for i in range(1, self.n + 1))
s = Squares(3)
print(list(s), list(s))`,
          output: "[1, 4, 9] [1, 4, 9]\n",
          hint: "What does __iter__ return, and does it ever reset?",
          explain: "Returning self makes Squares its own iterator, which is exhausted after one pass. Return a fresh iterator (here a generator expression) from __iter__.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "Why can you loop over a list many times, but over a file object only once?",
          options: [
            { text: "Files are slower", why: "Speed isn't the reason." },
            { text: "A list's __iter__ creates a new iterator each time; a file is its own iterator", why: "Correct." },
            { text: "Lists are immutable", why: "Lists are mutable." },
          ],
          answer: 1,
          hint: "What does iter() return for each?",
          explain: "iter(list) gives a new list_iterator; iter(file) returns the file itself, which remembers its position.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Iterable range with a step", difficulty: 3,
          prompt: `Write \`Steps(start, stop, step)\` — an iterable (re-usable) that yields start, start+step, … while below stop (like range, positive steps only). Implement it with a separate iterator class using \`__next__\`. Read start, stop, step and print the items, then their sum (iterating again).`,
          starter: r`class Steps:
    pass

start, stop, step = map(int, input().split())
s = Steps(start, stop, step)
print(*s)
print(sum(s))`,
          tests: [
            { label: "0 10 3", input: "0 10 3\n", output: "0 3 6 9\n18" },
            { label: "Empty", input: "5 5 1\n", output: "\n0", hidden: true, category: "edge" },
          ],
          hints: [
            "Steps.__iter__ returns StepsIter(start, stop, step).",
            "StepsIter keeps `current`; __next__ raises StopIteration when current >= stop.",
            "Return the old current and add step.",
            "Because each loop gets a new StepsIter, sum(s) works after print.",
          ],
          solution: r`class StepsIter:
    def __init__(self, current, stop, step):
        self.current, self.stop, self.step = current, stop, step

    def __iter__(self):
        return self

    def __next__(self):
        if self.current >= self.stop:
            raise StopIteration
        value = self.current
        self.current += self.step
        return value

class Steps:
    def __init__(self, start, stop, step):
        self.start, self.stop, self.step = start, stop, step

    def __iter__(self):
        return StepsIter(self.start, self.stop, self.step)

start, stop, step = map(int, input().split())
s = Steps(start, stop, step)
print(*s)
print(sum(s))`,
          notes: "`print(*s)` unpacks the iterable into print's arguments. Separate iterable/iterator classes make the object reusable.",
        },
        {
          id: "stretch", kind: "task", title: "Peekable iterator", difficulty: 4,
          prompt: `Write \`Peekable(iterable)\` wrapping any iterator with \`peek(default=None)\` (look at the next item without consuming it) besides normal iteration. Use it to group consecutive equal words from the input line: print \`word xN\` for each run.`,
          starter: r`class Peekable:
    pass

words = Peekable(input().split())
`,
          tests: [
            { label: "Runs", input: "a a b c c c a\n", output: "a x2\nb x1\nc x3\na x1" },
            { label: "Single", input: "z\n", output: "z x1", hidden: true, category: "edge" },
          ],
          hints: [
            "Keep the wrapped iterator and a 'buffered' next item (or a sentinel).",
            "peek fills the buffer if it's empty, then returns it without clearing.",
            "__next__ returns the buffered item first if present.",
            "Grouping: for each word, count while `words.peek() == word`, consuming with next().",
          ],
          solution: r`_EMPTY = object()

class Peekable:
    def __init__(self, iterable):
        self._it = iter(iterable)
        self._buf = _EMPTY

    def __iter__(self):
        return self

    def __next__(self):
        if self._buf is not _EMPTY:
            value, self._buf = self._buf, _EMPTY
            return value
        return next(self._it)

    def peek(self, default=None):
        if self._buf is _EMPTY:
            try:
                self._buf = next(self._it)
            except StopIteration:
                return default
        return self._buf

words = Peekable(input().split())
for word in words:
    count = 1
    while words.peek() == word:
        next(words)
        count += 1
    print(f"{word} x{count}")`,
          notes: "A unique sentinel object distinguishes 'nothing buffered' from a buffered None. (`itertools.groupby` does run-grouping for you.)",
        },
      ],
      realWorld: "Database cursors, CSV readers, paginated API clients and tree structures expose themselves as iterators so they work with `for` and comprehensions. The protocol is what lets so many Python tools work together.",
      reteach: "An iterable is a playlist; an iterator is a music player currently playing it, with a position. Pressing 'next' (`__next__`) plays the next song until the list ends (StopIteration). A good playlist hands every listener their own player (a new iterator), so everyone can listen from the start.",
      summary: [
        "Iterable: `__iter__` returns an iterator. Iterator: `__next__` returns items, raises StopIteration; `__iter__` returns self.",
        "Return a new iterator from `__iter__` to make objects reusable.",
        "for, list(), sum(), comprehensions and unpacking all use the protocol.",
      ],
    },

    {
      id: "py-generators",
      title: "Generators, yield and pipelines",
      minutes: 18,
      difficulty: 4,
      objectives: [
        "Write generator functions with `yield` and `yield from`",
        "Build lazy processing pipelines from generators",
        "Compare memory use of generators and lists",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "What does calling a function that contains `yield` do?",
        options: [
          { text: "Runs the function to the end", why: "The body doesn't run yet." },
          { text: "Returns a generator object; the body runs step by step as you iterate", why: "Correct." },
          { text: "Raises an error unless you use `return`", why: "Generators are normal Python." },
        ],
        answer: 1,
        hint: "Lazy.",
        explain: "A generator function returns a generator; each next() runs the body until the next yield.",
      },
      why: "Generators are the easiest way to write iterators and to process data streams: log files bigger than memory, sensor feeds, paginated APIs. Chaining them into pipelines keeps each step simple and memory use constant.",
      concept: [
        {
          title: "yield",
          body: `\`\`\`python
def countdown(n):
    while n > 0:
        yield n          # pause here, hand out n
        n -= 1           # resume here on the next request

for x in countdown(3):
    print(x)             # 3, 2, 1
\`\`\`

Local variables survive between yields. When the function ends, iteration stops (StopIteration). A generator is single-use.`,
        },
        {
          title: "yield from and pipelines",
          body: `\`yield from iterable\` yields every item of another iterable (useful for recursion):

\`\`\`python
def walk(tree):
    for node in tree:
        if isinstance(node, list):
            yield from walk(node)
        else:
            yield node
\`\`\`

**Pipelines** connect generators, each doing one job; data flows through one item at a time:

\`\`\`python
lines = read_lines(path)
clean = (l.strip() for l in lines if l.strip())
errors = (l for l in clean if "ERROR" in l)
\`\`\``,
        },
        {
          title: "Memory",
          body: `\`\`\`python
import sys
sys.getsizeof([x for x in range(10**6)])   # ~8 MB
sys.getsizeof(x for x in range(10**6))     # ~200 bytes
\`\`\`

The generator stores only its current state, not all values. Trade-off: no len(), no indexing, single pass.`,
        },
      ],
      example: {
        title: "A log-processing pipeline",
        code: r`import sys
LOG = """INFO start
ERROR disk full
INFO tick

ERROR timeout
WARN slow"""

def lines(text):
    for line in text.splitlines():
        yield line

def non_empty(items):
    for item in items:
        if item.strip():
            yield item

def parse(items):
    for item in items:
        level, msg = item.split(" ", 1)
        yield level, msg

errors = (msg for level, msg in parse(non_empty(lines(LOG))) if level == "ERROR")
print(list(errors))
def flatten(nested):
    for x in nested:
        if isinstance(x, list):
            yield from flatten(x)
        else:
            yield x
print(list(flatten([1, [2, [3, 4]], 5])))
big_list = [n for n in range(100_000)]
big_gen = (n for n in range(100_000))
print(sys.getsizeof(big_list) > 100 * sys.getsizeof(big_gen), sum(big_gen))`,
        output: "['disk full', 'timeout']\n[1, 2, 3, 4, 5]\nTrue 4999950000\n",
        lines: [
          [9, "Stage 1 yields raw lines one at a time."],
          [13, "Stage 2 filters out blank lines."],
          [18, "Stage 3 splits each line into (level, message)."],
          [23, "The stages are chained; nothing runs until list() pulls items through."],
          [29, "`yield from` delegates to the recursive generator."],
          [34, "The list holds 100,000 numbers; the generator only its state."],
        ],
      },
      mistakes: [
        { title: "Using a generator twice", body: "The second loop is empty. Recreate it (call the function again) or store a list." },
        { title: "return value in a generator", body: "`return x` ends the generator; the value isn't yielded (it becomes StopIteration.value)." },
        { title: "Forgetting to iterate", body: "`gen_function()` alone runs nothing. Loop over it, or pass it to list/sum/next." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 4,
          code: r`def gen():
    print("start")
    yield 1
    print("middle")
    yield 2
    print("end")
g = gen()
print("created")
print(next(g))
print(next(g))
print(next(g, "done"))`,
          answer: "created\nstart\n1\nmiddle\n2\nend\ndone\n",
          hint: "Nothing in the body runs until the first next().",
          explain: "Creating the generator prints nothing. Each next() runs until the next yield; the third next() runs to the end and returns the default.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Yield every item of the inner generator.",
          code: r`def inner():
    yield "a"
    yield "b"
def outer():
    yield "start"
    yield ___ inner()
    yield "end"
print(list(outer()))`,
          blanks: [["from"]],
          output: "['start', 'a', 'b', 'end']\n",
          hint: "Delegate to another iterable.",
          explain: "`yield from inner()` yields each of inner's values in turn.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "This should print the even squares `[0, 4, 16]` but prints `[0]`. Which line?",
          code: r`def squares(n):
    for i in range(n):
        return i * i
print([s for s in [squares(5)] if s % 2 == 0])`,
          line: 3,
          fix: r`def squares(n):
    for i in range(n):
        yield i * i
print([s for s in squares(5) if s % 2 == 0])`,
          output: "[0, 4, 16]\n",
          hint: "Which keyword makes a generator?",
          explain: "`return` exits after the first value. A generator must `yield` each square; then filter the generator directly.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "You need to count error lines in a 20 GB log file. Best approach?",
          options: [
            { text: "`lines = f.readlines()` then count", why: "Loads 20 GB into memory." },
            { text: "`sum(1 for line in f if \"ERROR\" in line)`", why: "Correct — streams one line at a time." },
            { text: "`f.read().count(\"ERROR\")`", why: "Reads the whole file into one string." },
          ],
          answer: 1,
          hint: "Constant memory.",
          explain: "Iterating the file with a generator expression processes one line at a time.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Fibonacci generator", difficulty: 3,
          prompt: `Write an **infinite** generator \`fib()\` yielding 0, 1, 1, 2, 3, … and use \`itertools.islice\` (or a loop with break) to print the first n numbers, and the first Fibonacci number greater than a limit. Input: n and limit.`,
          starter: r`from itertools import islice

def fib():
    pass

n, limit = map(int, input().split())
`,
          tests: [
            { label: "10 and 100", input: "10 100\n", output: "0 1 1 2 3 5 8 13 21 34\n144" },
            { label: "1 and 0", input: "1 0\n", output: "0\n1", hidden: true, category: "edge" },
          ],
          hints: [
            "Keep a, b = 0, 1 and loop forever: yield a; a, b = b, a + b.",
            "`print(*islice(fib(), n))` prints the first n.",
            "For the limit, iterate a NEW generator and stop at the first value > limit.",
            "`next(x for x in fib() if x > limit)`.",
          ],
          solution: r`from itertools import islice

def fib():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

n, limit = map(int, input().split())
print(*islice(fib(), n))
print(next(x for x in fib() if x > limit))`,
          notes: "An infinite generator is safe because consumers only take what they need. Each call to fib() starts a fresh sequence.",
        },
        {
          id: "stretch", kind: "challenge", title: "CSV stream statistics", difficulty: 4,
          prompt: `\`sales.csv\` has columns \`date,city,amount\`. Build a generator pipeline: \`read_rows(path)\` (yields dicts via csv.DictReader), \`only_city(rows, city)\`, \`amounts(rows)\` (yields ints). For the city given as input, print the count, total and max — computed in **one pass** over the amounts (no lists).`,
          starter: r`import csv
`,
          files: [{ name: "sales.csv", content: "date,city,amount\n2026-10-01,Pune,120\n2026-10-01,Goa,90\n2026-10-02,Pune,300\n2026-10-03,Pune,45\n2026-10-03,Goa,500\n" }],
          tests: [
            { label: "Pune", input: "Pune\n", output: "count 3\ntotal 465\nmax 300" },
            { label: "Goa", input: "Goa\n", output: "count 2\ntotal 590\nmax 500", hidden: true },
            { label: "Unknown city", input: "Delhi\n", output: "count 0\ntotal 0\nmax none", hidden: true, category: "edge" },
          ],
          hints: [
            "read_rows opens the file inside a `with` and yields from DictReader.",
            "only_city yields rows whose city matches.",
            "amounts yields `int(row[\"amount\"])`.",
            "Loop once over the final generator updating count, total and a running max (start at None).",
          ],
          solution: r`import csv

def read_rows(path):
    with open(path, newline="", encoding="utf-8") as f:
        yield from csv.DictReader(f)

def only_city(rows, city):
    for row in rows:
        if row["city"] == city:
            yield row

def amounts(rows):
    for row in rows:
        yield int(row["amount"])

city = input()
count = total = 0
biggest = None
for a in amounts(only_city(read_rows("sales.csv"), city)):
    count += 1
    total += a
    biggest = a if biggest is None or a > biggest else biggest
print("count", count)
print("total", total)
print("max", biggest if biggest is not None else "none")`,
          notes: "The file stays open only while the pipeline is being consumed (the `with` lives inside the generator). The same code would handle a file of millions of rows in constant memory.",
        },
      ],
      realWorld: "Streaming large files, reading paginated APIs page by page, producing items for web responses incrementally, and data-engineering pipelines (and `asyncio` async generators, Module 27) are built on generators.",
      reteach: "A generator is a vending machine that makes each item only when you press the button: it remembers where it was in the recipe (pauses at `yield`) and continues from there next time. A pipeline is a row of such machines, each taking one item from the previous machine, changing it, and passing it on — no big warehouse needed.",
      summary: [
        "A function with `yield` returns a generator; each next() runs to the next yield.",
        "`yield from` delegates; chain generators into lazy pipelines.",
        "Generators use constant memory but are single-use and have no len/indexing.",
      ],
      cpp: {
        python: r`def countdown(n):
    while n > 0:
        yield n
        n -= 1`,
        cpp: r`// C++20 coroutines can do this with co_yield,
// but most C++ code writes an iterator class or fills a vector.
std::vector<int> countdown(int n) { std::vector<int> v; while (n > 0) v.push_back(n--); return v; }`,
        note: "Python generators make lazy sequences trivial; in C++ the common approach is a container (eager) or a hand-written iterator class.",
      },
    },
  ],
  exam: [
    {
      id: "e1", kind: "predict", difficulty: 4,
      code: r`def evens():
    n = 0
    while True:
        yield n
        n += 2
g = evens()
first = [next(g) for _ in range(3)]
rest = [x for x, _ in zip(g, range(2))]
print(first, rest)`,
      answer: "[0, 2, 4] [6, 8]\n",
      hint: "The generator continues where it stopped.",
      explain: "The first three values are 0, 2, 4; zip then pulls two more: 6 and 8.",
    },
    {
      id: "e2", kind: "mcq", difficulty: 3,
      prompt: "Which is the simplest way to make a class iterable?",
      options: [
        { text: "Write separate iterable and iterator classes", why: "Works, but more code." },
        { text: "Make `__iter__` a generator method that yields the items", why: "Correct." },
        { text: "Inherit from list", why: "Overkill and changes semantics." },
      ],
      answer: 1,
      hint: "Generators write iterators for you.",
      explain: "`def __iter__(self): yield ...` returns a fresh generator per loop.",
    },
    {
      id: "e3", kind: "fill", difficulty: 3,
      prompt: "Take the first 3 items of an infinite generator.",
      code: r`from itertools import count, ___
print(list(islice(count(10), 3)))`,
      blanks: [["islice"]],
      output: "[10, 11, 12]\n",
      hint: "Slicing for iterators.",
      explain: "`islice(iterable, n)` yields the first n items lazily.",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: streaming word counter", difficulty: 4,
    prompt: `\`book.txt\` is next to your program. Build a generator pipeline: \`read_lines\` → \`words\` (lower-case, strip \`.,;:!?"'()\`, skip empties) → \`skip_stopwords\` (the, a, an, and, of, to, in, is). Count words with a dict in one pass and print the top 3 as \`word count\` (ties alphabetical), then \`total words: N\` (after stop-word removal).`,
    starter: r`STOP = {"the", "a", "an", "and", "of", "to", "in", "is"}
`,
    files: [{ name: "book.txt", content: "The cat sat on the mat. The cat is fat!\nA dog, a cat and a bird.\n\"Cat\" said the dog to the bird.\n" }],
    tests: [{ label: "Book", input: "", output: "cat 4\nbird 2\ndog 2\ntotal words: 13" }],
    hints: [
      "read_lines yields lines from the file (inside `with`).",
      "words yields cleaned words from each line.",
      "skip_stopwords yields words not in STOP.",
      "Sort counts with `key=lambda kv: (-kv[1], kv[0])` and take 3.",
    ],
    solution: r`STOP = {"the", "a", "an", "and", "of", "to", "in", "is"}

def read_lines(path):
    with open(path, encoding="utf-8") as f:
        yield from f

def words(lines):
    for line in lines:
        for w in line.lower().split():
            w = w.strip(".,;:!?\"'()")
            if w:
                yield w

def skip_stopwords(ws):
    for w in ws:
        if w not in STOP:
            yield w

counts = {}
total = 0
for w in skip_stopwords(words(read_lines("book.txt"))):
    counts[w] = counts.get(w, 0) + 1
    total += 1
for w, c in sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))[:3]:
    print(w, c)
print("total words:", total)`,
    notes: "Three tiny generators, each with one job, process the book one word at a time. Swapping book.txt for a 10 GB file wouldn't change memory use.",
  },
};
