import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 28 — Memory management and performance. */
export const M28: PyModuleDef = {
  id: "py-performance",
  number: 28,
  level: 4,
  title: "Memory Management and Performance",
  summary: "Memory management; reference counting; garbage collection; object size; memory profiling; time complexity in Python; profiling code; benchmarking with timeit; optimising loops and data structures; caching; avoiding premature optimisation.",
  track: "core",
  optionalNote: "Useful once programs handle large data or must respond fast; measure before optimising.",
  prereqs: ["py-object-model"],
  lessons: [
    {
      id: "py-memory",
      title: "References, garbage collection and memory use",
      minutes: 17,
      difficulty: 4,
      objectives: [
        "Explain reference counting and when objects are freed",
        "Understand why the cyclic garbage collector exists",
        "Measure memory with `sys.getsizeof` and `tracemalloc`, and save it with generators and `__slots__`",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "After `a = [1, 2]; b = a; del a`, is the list freed?",
        options: [
          { text: "Yes — del deletes the list", why: "del removes a name, not the object." },
          { text: "No — b still refers to it", why: "Correct." },
          { text: "Only after gc.collect()", why: "Reference counting isn't waiting for the collector here; b keeps it alive." },
        ],
        answer: 1,
        hint: "What does del actually remove?",
        explain: "`del a` removes the name a. The list's reference count drops from 2 to 1 — b still uses it, so it stays.",
      },
      why: "Python manages memory for you, but not magically. Knowing when objects die explains memory leaks (a cache that keeps growing), why huge lists crash a laptop while generators don't, and how to measure instead of guess.",
      concept: [
        {
          title: "Reference counting",
          body: `CPython keeps a **reference count** on every object: how many names, containers and attributes point to it. When it drops to **0**, the object is freed immediately.

- \`x = obj\`, appending to a list, passing as an argument → +1
- \`del x\`, reassigning \`x\`, leaving a function → −1

\`weakref.ref(obj)\` refers to an object **without** keeping it alive — handy for caches.`,
        },
        {
          title: "Cycles and the garbage collector",
          body: `If \`a.partner = b\` and \`b.partner = a\`, each keeps the other's count above zero even when nothing else uses them. The **cyclic garbage collector** (\`gc\` module) periodically finds such unreachable groups and frees them. \`gc.collect()\` forces a run and returns how many objects it found.`,
        },
        {
          title: "Measuring memory",
          body: `- \`sys.getsizeof(obj)\` — the object's own size in bytes (**not** what it contains).
- \`tracemalloc\` — tracks allocations made by Python code: \`tracemalloc.start()\`, run code, \`tracemalloc.get_traced_memory()\` → (current, peak).
- Saving memory: generators instead of lists, \`__slots__\` on classes with millions of instances, \`array\`/NumPy for numbers, reading files line by line.

Exact byte counts depend on Python version and platform — compare sizes rather than memorising numbers.`,
        },
      ],
      example: {
        title: "Watching objects live and die",
        code: r`import gc, sys, tracemalloc, weakref

class Node:
    def __init__(self, name):
        self.name = name
        self.partner = None

a = Node("a")
watch = weakref.ref(a)
b = a
del a
print("alive after del a:", watch() is not None)
b = None
print("alive after b = None:", watch() is not None)

x, y = Node("x"), Node("y")
x.partner, y.partner = y, x
watch_x = weakref.ref(x)
del x, y
print("cycle alive before gc:", watch_x() is not None)
gc.collect()
print("cycle alive after gc:", watch_x() is not None)

nums_list = [n for n in range(100_000)]
nums_gen = (n for n in range(100_000))
print("list much bigger than generator:", sys.getsizeof(nums_list) > 100 * sys.getsizeof(nums_gen))

tracemalloc.start()
data = [str(i) * 10 for i in range(10_000)]
current, peak = tracemalloc.get_traced_memory()
tracemalloc.stop()
print("traced at least 500 KB:", peak > 500_000)`,
        output: "alive after del a: True\nalive after b = None: False\ncycle alive before gc: True\ncycle alive after gc: False\nlist much bigger than generator: True\ntraced at least 500 KB: True\n",
        lines: [
          [9, "A weak reference lets us watch the object without keeping it alive."],
          [11, "del removes the name a; b still refers to the object."],
          [13, "The last reference is gone, so the count hits 0 and the object is freed at once."],
          [17, "x and y point at each other — a reference cycle."],
          [19, "Deleting the names doesn't free them: each object still references the other…"],
          [21, "…so the cyclic garbage collector has to find and free them."],
          [26, "A generator stores only its current state, not 100,000 items."],
          [28, "tracemalloc measures memory allocated by Python code between start and stop."],
        ],
      },
      mistakes: [
        { title: "Thinking del frees objects", body: "It removes one reference. The object is freed only when no references remain." },
        { title: "Trusting getsizeof for containers", body: "It counts the container, not the items inside it. A list of big strings is much larger than getsizeof says." },
        { title: "Unbounded caches", body: "A dict that only grows is a memory leak. Bound it (lru_cache(maxsize=…)) or use weak references." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`import weakref
class Box: pass
box = Box()
items = [box]
ref = weakref.ref(box)
del box
print(ref() is None)
items.clear()
print(ref() is None)`,
          answer: "False\nTrue\n",
          hint: "The list still holds a reference after del.",
          explain: "After `del box` the list keeps it alive; once the list is cleared, no references remain and the object is freed.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Force the cyclic garbage collector to run.",
          code: r`import gc
found = gc.___()
print(isinstance(found, int))`,
          blanks: [["collect"]],
          output: "True\n",
          hint: "Collect the garbage.",
          explain: "`gc.collect()` runs a full collection and returns the number of unreachable objects found.",
        },
        {
          id: "b1", kind: "bug", difficulty: 4,
          prompt: "This should sum the squares with a tiny memory peak, but it builds a 200,000-item list just to sum numbers. Which line should use a generator instead?",
          code: r`import tracemalloc
tracemalloc.start()
total = sum([n * n for n in range(200_000)])
peak = tracemalloc.get_traced_memory()[1]
tracemalloc.stop()
print(total, "small peak:", peak < 100_000)`,
          line: 3,
          fix: r`import tracemalloc
tracemalloc.start()
total = sum(n * n for n in range(200_000))
peak = tracemalloc.get_traced_memory()[1]
tracemalloc.stop()
print(total, "small peak:", peak < 100_000)`,
          output: "2666646666700000 small peak: True\n",
          hint: "Square brackets build the whole list first.",
          explain: "`sum(n * n for n in …)` streams values one at a time, so the peak memory stays tiny.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "Why does Python need a garbage collector if it already counts references?",
          options: [
            { text: "To free objects in reference cycles", why: "Correct." },
            { text: "Reference counting doesn't free anything", why: "It frees most objects immediately." },
            { text: "To compress memory", why: "CPython doesn't compact memory." },
          ],
          answer: 0,
          hint: "Objects that point at each other.",
          explain: "In a cycle each object keeps the other's count above zero; the cyclic GC detects groups that nothing outside can reach.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Stream a big file", difficulty: 3,
          prompt: `A log has one response time (ms) per line, followed by \`end\`. Compute the count, average (1 decimal) and maximum **without storing all the values** (keep only running totals). Print \`count N\`, \`avg X\`, \`max M\`; print \`no data\` if there are none.`,
          starter: r`count = 0
`,
          tests: [
            { label: "Times", input: "120\n80\n200\n100\nend\n", output: "count 4\navg 125.0\nmax 200" },
            { label: "Empty", input: "end\n", output: "no data", hidden: true, category: "edge" },
          ],
          hints: [
            "Keep count, total and biggest as plain variables.",
            "Update them for each line inside the loop.",
            "Start biggest as None, or use the first value.",
            "Average = total / count, formatted with :.1f.",
          ],
          solution: r`count = 0
total = 0
biggest = None
while (line := input()) != "end":
    value = int(line)
    count += 1
    total += value
    biggest = value if biggest is None else max(biggest, value)
if count == 0:
    print("no data")
else:
    print("count", count)
    print(f"avg {total / count:.1f}")
    print("max", biggest)`,
          notes: "Memory stays constant whether the log has 4 lines or 400 million — the streaming pattern behind real log processors.",
        },
        {
          id: "stretch", kind: "task", title: "Slots vs dict", difficulty: 4,
          prompt: `Define two classes holding \`x, y\`: \`Point\` (normal) and \`SlotPoint\` (with \`__slots__ = ("x", "y")\`). Read N, create N of each, and use tracemalloc to measure each batch's peak. Print \`slots smaller: True/False\` and whether SlotPoint instances have \`__dict__\` (\`slot has __dict__: False\`). Then show that \`SlotPoint(1, 2).z = 3\` raises AttributeError: print \`cannot add z\`.`,
          starter: r`import tracemalloc

class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y
`,
          tests: [
            { label: "10,000", input: "10000\n", output: "slots smaller: True\nslot has __dict__: False\ncannot add z" },
          ],
          hints: [
            "Write a helper `measure(cls, n)` that starts tracemalloc, builds the list, records the peak and stops.",
            "`hasattr(SlotPoint(1, 2), \"__dict__\")`.",
            "Wrap the attribute assignment in try/except AttributeError.",
            "Compare measure(SlotPoint, n) < measure(Point, n).",
          ],
          solution: r`import tracemalloc

class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y

class SlotPoint:
    __slots__ = ("x", "y")
    def __init__(self, x, y):
        self.x, self.y = x, y

def measure(cls, n):
    tracemalloc.start()
    items = [cls(i, i) for i in range(n)]
    peak = tracemalloc.get_traced_memory()[1]
    tracemalloc.stop()
    return peak

n = int(input())
print("slots smaller:", measure(SlotPoint, n) < measure(Point, n))
print("slot has __dict__:", hasattr(SlotPoint(1, 2), "__dict__"))
try:
    SlotPoint(1, 2).z = 3
except AttributeError:
    print("cannot add z")`,
          notes: "__slots__ removes the per-instance dict — worthwhile for millions of small objects, at the cost of not being able to add new attributes.",
        },
      ],
      realWorld: "Long-running web servers leak memory through ever-growing caches or listeners that hold references; data engineers stream multi-GB files line by line; tracemalloc snapshots pinpoint the line that allocates the most.",
      reteach: "Every object is a balloon and each reference is a hand holding its string. `del name` lets go of one hand; the balloon floats away only when no hands are left. Two balloons tied to each other float in the corner forever — until the garbage collector sweeps the room for balloons no one is holding.",
      summary: [
        "CPython frees objects when their reference count hits 0; del removes a name, not the object.",
        "The cyclic GC frees unreachable reference cycles; weakref observes without keeping alive.",
        "Measure with getsizeof (shallow) and tracemalloc; save memory with generators, streaming and __slots__.",
      ],
      cpp: {
        python: r`a = Node("a")
b = a
del a        # object lives on (b)
b = None     # count 0 → freed`,
        cpp: r`auto a = std::make_shared<Node>("a");
auto b = a;
a.reset();   // object lives on (b)
b.reset();   // count 0 → freed`,
        note: "Python names behave like C++ shared_ptr: reference-counted. Unlike shared_ptr, Python also has a cycle collector, so cycles don't leak forever (C++ uses weak_ptr to break them).",
      },
    },

    {
      id: "py-profiling",
      title: "Profiling, benchmarking and optimising",
      minutes: 18,
      difficulty: 4,
      objectives: [
        "Benchmark small snippets with `timeit`",
        "Find hot spots with `cProfile`",
        "Optimise with better algorithms, data structures and caching",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "Checking `x in big_list` vs `x in big_set` for 1,000,000 items — which is faster, and why?",
        options: [
          { text: "The list: lists are simpler", why: "List membership scans every item: O(n)." },
          { text: "The set: hashing finds the item in about O(1)", why: "Correct." },
          { text: "They're the same", why: "Very different for large n." },
        ],
        answer: 1,
        hint: "Time complexity.",
        explain: "Sets (and dict keys) use hash tables: membership is ~O(1). Lists must compare item by item: O(n).",
      },
      why: "Most slow programs are slow in one or two places, and usually because of the algorithm or data structure, not because Python is slow. Profiling tells you where; complexity tells you why; caching and better structures fix it.",
      concept: [
        {
          title: "Complexity of common operations",
          body: `| Operation | list | set / dict |
| --- | --- | --- |
| \`x in c\` | O(n) | O(1) average |
| append / add | O(1) | O(1) |
| insert/pop at front | O(n) (use \`collections.deque\`) | — |
| sort | O(n log n) | — |

String building: \`"".join(parts)\` is O(n); repeated \`s += piece\` in a loop can be O(n²) in the worst case.`,
        },
        {
          title: "Measure: timeit and cProfile",
          body: `\`\`\`python
import timeit
timeit.timeit("x in s", setup="s = set(range(1000)); x = 999", number=10_000)

import cProfile, pstats
cProfile.run("main()", "stats.out")
pstats.Stats("stats.out").sort_stats("cumulative").print_stats(10)
\`\`\`

Command line: \`python -m timeit "…"\` and \`python -m cProfile -s cumtime script.py\`. Timings vary between runs and machines — compare alternatives on the same machine, repeat, and look at ratios.`,
        },
        {
          title: "Optimise in this order",
          body: `1. **Make it correct** and add tests.
2. **Measure** — find the real hot spot.
3. **Better algorithm / data structure** (set lookups, dict grouping, sorting once).
4. **Avoid repeated work**: hoist work out of loops, cache results (\`functools.lru_cache\`).
5. **Use built-ins** (sum, sorted, comprehensions) — they run in C.
6. Only then: NumPy, multiprocessing, Cython, PyPy.

"Premature optimisation is the root of all evil" — don't make code harder to read for speed nobody measured.`,
        },
      ],
      example: {
        title: "Profile, then fix the real hot spot",
        code: r`import cProfile, pstats, io, timeit
from functools import lru_cache

def slow_common(a, b):
    return [x for x in a if x in b]

def fast_common(a, b):
    b_set = set(b)
    return [x for x in a if x in b_set]

a = list(range(0, 2000, 2))
b = list(range(0, 2000, 3))
print(slow_common(a, b) == fast_common(a, b))
t_slow = timeit.timeit(lambda: slow_common(a, b), number=5)
t_fast = timeit.timeit(lambda: fast_common(a, b), number=5)
print("set version at least 10x faster:", t_slow > 10 * t_fast)

def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

profiler = cProfile.Profile()
profiler.runcall(fib, 15)
stats = pstats.Stats(profiler, stream=io.StringIO())
calls = next(v[1] for k, v in stats.stats.items() if k[2] == "fib")
print("fib(15) calls:", calls)

@lru_cache(maxsize=None)
def fib_cached(n):
    return n if n < 2 else fib_cached(n - 1) + fib_cached(n - 2)
print(fib_cached(15), fib_cached.cache_info())`,
        output: "True\nset version at least 10x faster: True\nfib(15) calls: 1973\n610 CacheInfo(hits=13, misses=16, maxsize=None, currsize=16)\n",
        lines: [
          [5, "`x in b` on a list scans b for every x: O(len(a) × len(b))."],
          [8, "Building the set once makes each lookup ~O(1)."],
          [14, "timeit runs each version several times; we compare ratios, never print raw times."],
          [22, "cProfile records every call while running fib(15)."],
          [24, "The stats show fib was called 1,973 times — an exponential hot spot."],
          [27, "lru_cache remembers results, so each n is computed once."],
          [30, "16 misses (n = 0..15), 13 hits — instead of 1,973 calls."],
        ],
      },
      mistakes: [
        { title: "Optimising without measuring", body: "Guesses about speed are usually wrong. Profile first." },
        { title: "Benchmarking once", body: "One run is noisy. Use timeit's repeats and compare alternatives on the same machine." },
        { title: "Caching functions with side effects or unhashable args", body: "lru_cache needs hashable arguments and returns the same result forever — wrong for functions that depend on time, files or randomness." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`from functools import lru_cache
@lru_cache(maxsize=2)
def square(n):
    print("computing", n)
    return n * n
for n in [2, 3, 2, 4, 3]:
    square(n)
print(square.cache_info().hits)`,
          answer: "computing 2\ncomputing 3\ncomputing 4\ncomputing 3\n1\n",
          hint: "maxsize=2 keeps only the two most recently used results.",
          explain: "2, 3 computed; 2 is a hit; 4 computed and evicts 3 (least recently used); 3 must be computed again. One hit.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Make membership checks fast.",
          code: r`banned = ___(["spam", "scam", "fake"])
words = "this is not spam or fake news".split()
print([w for w in words if w in banned])`,
          blanks: [["set", "frozenset"]],
          output: "['spam', 'fake']\n",
          hint: "A hashed collection.",
          explain: "`set(...)` gives O(1) average membership tests.",
        },
        {
          id: "b1", kind: "bug", difficulty: 4,
          prompt: "A cache was added to speed this up, but now the second price is wrong (it should be 120.0). Which line causes the wrong result?",
          code: r`from functools import lru_cache
rate = 0.10
@lru_cache(maxsize=None)
def with_tax(amount):
    return round(amount * (1 + rate), 2)
print(with_tax(100))
rate = 0.20
print(with_tax(100))`,
          line: 3,
          fix: r`from functools import lru_cache
rate = 0.10
def with_tax(amount):
    return round(amount * (1 + rate), 2)
print(with_tax(100))
rate = 0.20
print(with_tax(100))`,
          output: "110.0\n120.0\n",
          hint: "The cache key is only the arguments. What else does the function depend on?",
          explain: "lru_cache returns the stored 110.0 for amount=100 even though the global rate changed. Only cache pure functions — or make everything the result depends on an argument (`with_tax(amount, rate)`).",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "Your program is slow. What's the best first step?",
          options: [
            { text: "Rewrite everything in C++", why: "Huge cost, probably unnecessary." },
            { text: "Profile it to find where time is spent", why: "Correct." },
            { text: "Replace all loops with lambdas", why: "Doesn't make code faster." },
          ],
          answer: 1,
          hint: "Measure, don't guess.",
          explain: "Profiling shows the hot spots; typically one function dominates and an algorithm change fixes it.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Duplicate finder, fast", difficulty: 3,
          prompt: `Read email addresses (one per line) until \`end\`. Print every address that appears **more than once**, in the order of its **second** appearance, then \`unique N\` (number of distinct addresses). Use a set so the program stays fast with a million lines.`,
          starter: r`seen = set()
`,
          tests: [
            { label: "Dupes", input: "a@x.in\nb@x.in\na@x.in\nc@x.in\nb@x.in\na@x.in\nend\n", output: "a@x.in\nb@x.in\nunique 3" },
            { label: "None", input: "z@y.in\nend\n", output: "unique 1", hidden: true, category: "edge" },
          ],
          hints: [
            "Keep a `seen` set and a `reported` set.",
            "If an address is in seen but not in reported, print it and add it to reported.",
            "Otherwise add it to seen.",
            "unique = len(seen).",
          ],
          solution: r`seen = set()
reported = set()
while (email := input()) != "end":
    if email in seen:
        if email not in reported:
            print(email)
            reported.add(email)
    else:
        seen.add(email)
print("unique", len(seen))`,
          notes: "Two O(1) set lookups per line: the whole job is O(n). A list-based version would be O(n²) — fine for 6 lines, hopeless for a million.",
        },
        {
          id: "stretch", kind: "task", title: "Measure the speed-up", difficulty: 4,
          prompt: `Read N. Compare two ways of building a comma-separated string of the numbers 0..N-1: \`slow\` uses \`s += str(i) + ","\` in a loop, then strips the last comma; \`fast\` uses \`",".join(map(str, range(n)))\`. Both versions convert numbers with the given \`to_text(i)\` helper. Print \`same: True\` if the two strings match. Then **profile** the fast version with cProfile and print how many times it called \`to_text\`: \`fast to_text calls: N\`.`,
          starter: r`import cProfile, pstats, io

def to_text(i):
    return str(i)
`,
          tests: [
            { label: "N=1000", input: "1000\n", output: "same: True\nfast to_text calls: 1000" },
            { label: "N=5", input: "5\n", output: "same: True\nfast to_text calls: 5", hidden: true },
          ],
          hints: [
            "slow: loop with `s += to_text(i) + \",\"`, then `s[:-1]`.",
            "fast: `\",\".join(map(to_text, range(n)))`.",
            "`p = cProfile.Profile(); p.runcall(fast, n)`.",
            "In `pstats.Stats(p, stream=io.StringIO()).stats`, find the key whose third element is \"to_text\"; value[1] is the call count.",
          ],
          solution: r`import cProfile, pstats, io

def to_text(i):
    return str(i)

def slow(n):
    s = ""
    for i in range(n):
        s += to_text(i) + ","
    return s[:-1]

def fast(n):
    return ",".join(map(to_text, range(n)))

n = int(input())
print("same:", slow(n) == fast(n))
p = cProfile.Profile()
p.runcall(fast, n)
stats = pstats.Stats(p, stream=io.StringIO()).stats
calls = next(v[1] for k, v in stats.items() if k[2] == "to_text")
print("fast to_text calls:", calls)`,
          notes: "Profilers count calls exactly but times vary, so tests check counts. On your own machine, `python -m cProfile -s cumtime script.py` and `python -m timeit` show the timing side.",
        },
      ],
      realWorld: "Engineers profile slow API endpoints and usually find one N+1 database query or an O(n²) loop; lru_cache and Redis cache expensive results; py-spy and scalene profile production processes without changing code.",
      reteach: "Speeding up a program is like speeding up a commute. First time each part (profiling) — maybe the traffic jam is one junction. Changing route (a better algorithm) beats buying a faster car (lower-level tricks). And if you make the same trip every day, remember the answer (caching).",
      summary: [
        "Know the costs: list membership O(n), set/dict O(1); join strings; deque for queues.",
        "Measure with timeit (compare ratios) and cProfile (hot spots, call counts).",
        "Optimise the algorithm first, cache repeated work with lru_cache, and keep code readable.",
      ],
      libraryCode: [{
        title: "Command-line profiling tools",
        code: `python -m timeit -s "s = set(range(10_000))" "9_999 in s"
python -m cProfile -s cumtime my_script.py
pip install line_profiler py-spy
py-spy top --pid 12345        # sample a running process`,
        note: "Run these in a terminal on your own computer; timing numbers depend on the machine, so compare alternatives side by side.",
      }],
    },
  ],
  exam: [
    {
      id: "e1", kind: "mcq", difficulty: 4,
      prompt: "Which change most improves `for x in a: if x in b: …` when both lists have 100,000 items?",
      options: [
        { text: "Convert b to a set once, before the loop", why: "Correct: O(n·m) → O(n + m)." },
        { text: "Use a while loop instead of for", why: "Same complexity." },
        { text: "Call gc.collect() first", why: "Unrelated to speed of lookups." },
      ],
      answer: 0,
      hint: "Where is the repeated scan?",
      explain: "Each `x in b` scans the list. A set makes each check ~O(1).",
    },
    {
      id: "e2", kind: "predict", difficulty: 3,
      code: r`import weakref
class Item: pass
it = Item()
r = weakref.ref(it)
other = it
it = None
print(r() is other)`,
      answer: "True\n",
      hint: "`other` still refers to the object.",
      explain: "Rebinding `it` drops one reference, but `other` keeps the object alive, so the weak reference still returns it.",
    },
    {
      id: "e3", kind: "fill", difficulty: 3,
      prompt: "Cache a pure function's results.",
      code: r`from functools import ___
@lru_cache(maxsize=128)
def slow_square(n):
    return n * n
print(slow_square(9), slow_square.cache_info().misses)`,
      blanks: [["lru_cache"]],
      output: "81 1\n",
      hint: "Least-recently-used cache.",
      explain: "`functools.lru_cache` memoises results keyed by the arguments.",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: optimise a slow report", difficulty: 4,
    prompt: `You're given a slow sales report (see the starter). It produces the right output but is O(n²) in two places and recomputes tax rates repeatedly. **Rewrite it** to be efficient while producing exactly the same output:

- Use a dict to group totals by region (not repeated scans).
- Use a set for the "flagged customers" check.
- Cache \`tax_rate(region)\` with lru_cache, and print \`tax_rate cache misses: N\` at the end (one miss per distinct region).

Input: lines \`customer,region,amount\` until \`end\`, then one line of flagged customers (space-separated).`,
    starter: r`def tax_rate(region):
    rates = {"north": 0.05, "south": 0.08}
    return rates.get(region, 0.10)

rows = []
while (line := input()) != "end":
    c, reg, amt = line.split(",")
    rows.append((c, reg, float(amt)))
flagged = input().split()

regions = []
for _, reg, _ in rows:
    if reg not in regions:
        regions.append(reg)
for reg in sorted(regions):
    total = sum(a for _, r2, a in rows if r2 == reg)
    print(f"{reg}: {total * (1 + tax_rate(reg)):.2f}")
print("flagged sales:", sum(1 for c, _, _ in rows if c in flagged))`,
    tests: [
      { label: "Report", input: "asha,north,100\nravi,south,50\nzoe,north,20\nravi,east,10\nend\nravi zoe\n", output: "east: 11.00\nnorth: 126.00\nsouth: 54.00\nflagged sales: 3\ntax_rate cache misses: 3" },
      { label: "One row", input: "a,west,10\nend\n\n", output: "west: 11.00\nflagged sales: 0\ntax_rate cache misses: 1", hidden: true, category: "edge" },
    ],
    hints: [
      "Build `totals = {}` in one pass: `totals[reg] = totals.get(reg, 0) + amt`.",
      "`flagged = set(input().split())`.",
      "Decorate tax_rate with `@lru_cache(maxsize=None)`.",
      "Print `tax_rate.cache_info().misses` at the end.",
    ],
    solution: r`from functools import lru_cache

@lru_cache(maxsize=None)
def tax_rate(region):
    rates = {"north": 0.05, "south": 0.08}
    return rates.get(region, 0.10)

totals = {}
customers = []
while (line := input()) != "end":
    c, reg, amt = line.split(",")
    totals[reg] = totals.get(reg, 0) + float(amt)
    customers.append(c)
flagged = set(input().split())

for reg in sorted(totals):
    print(f"{reg}: {totals[reg] * (1 + tax_rate(reg)):.2f}")
print("flagged sales:", sum(1 for c in customers if c in flagged))
print("tax_rate cache misses:", tax_rate.cache_info().misses)`,
    notes: "Same output, but O(n) instead of O(n × regions) and O(n × flagged). Real reports with millions of rows would also stream the input and probably use a database GROUP BY or pandas — and keep a test that the output didn't change.",
  },
};
