import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 26 — Concurrency and parallelism. */
export const M26: PyModuleDef = {
  id: "py-concurrency",
  number: 26,
  level: 4,
  title: "Concurrency and Parallelism",
  summary: "Processes, threads and async tasks; threading; race conditions; locks and synchronisation; queues and thread-safe communication; futures and executors; the GIL; CPU-bound vs I/O-bound work; multiprocessing; choosing the right model; safe demonstrations.",
  track: "core",
  optionalNote: "Needed for servers, scrapers, data pipelines and anything that waits on networks or disks; small scripts rarely need it.",
  prereqs: ["py-context"],
  lessons: [
    {
      id: "py-threads-locks",
      title: "Threads, race conditions and locks",
      minutes: 18,
      difficulty: 4,
      objectives: [
        "Explain processes vs threads vs async tasks",
        "Start and join threads with `threading`",
        "Prevent race conditions on shared data with a Lock",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "Two threads each run `counter += 1` 100,000 times on a shared counter with no lock. The final value is…",
        options: [
          { text: "Always 200,000", why: "+= is several steps (read, add, write) that can interleave." },
          { text: "Not guaranteed to be 200,000 — updates can be lost", why: "Correct: a race condition." },
          { text: "Always 100,000", why: "Each thread does its updates; some may be lost, not exactly half." },
        ],
        answer: 1,
        hint: "Is `counter += 1` one indivisible step?",
        explain: "`+=` reads, adds and writes back; if threads interleave between those steps, one update overwrites the other.",
      },
      why: "Programs spend a lot of time waiting — for files, databases and the network. Threads let other work continue during those waits. But shared data accessed by several threads is the source of some of the hardest bugs there are, so you must know how to protect it.",
      concept: [
        {
          title: "Three ways to do several things",
          body: `| Model | What runs | Shares memory? | Good for |
| --- | --- | --- | --- |
| **Processes** (multiprocessing) | separate Python interpreters | no (must send data) | CPU-heavy work on many cores |
| **Threads** (threading) | several flows in one interpreter | yes | waiting on I/O (files, network) |
| **Async tasks** (asyncio) | many tasks on one thread, switching at \`await\` | yes | very many concurrent I/O waits |

**Concurrency** = juggling several tasks; **parallelism** = literally running at the same moment on different cores.`,
        },
        {
          title: "threading basics",
          body: `\`\`\`python
import threading
def download(name):
    ...
threads = [threading.Thread(target=download, args=(n,)) for n in names]
for t in threads: t.start()
for t in threads: t.join()       # wait for all to finish
\`\`\`

The order in which threads run is decided by the OS — **don't assume any order**.`,
        },
        {
          title: "Race conditions and locks",
          body: `A **race condition** is a bug whose result depends on timing. Protect shared state with a **Lock** so only one thread runs the critical section at a time:

\`\`\`python
lock = threading.Lock()
with lock:
    counter += 1
\`\`\`

Keep critical sections small; never hold a lock while waiting on slow I/O; acquire multiple locks in a consistent order to avoid **deadlock**. Often the best fix is not to share mutable state at all — give each thread its own data and combine results at the end.`,
        },
      ],
      example: {
        title: "Shared counter, safely",
        code: r`import threading

counter = 0
lock = threading.Lock()

def add_many(n):
    global counter
    for _ in range(n):
        with lock:
            counter += 1

threads = [threading.Thread(target=add_many, args=(50_000,)) for _ in range(4)]
for t in threads:
    t.start()
for t in threads:
    t.join()
print("counter:", counter)

results = {}
def square_range(name, nums):
    results[name] = sum(n * n for n in nums)

workers = [threading.Thread(target=square_range, args=(f"part{i}", range(i * 100, (i + 1) * 100))) for i in range(3)]
for w in workers: w.start()
for w in workers: w.join()
print(sorted(results), sum(results.values()) == sum(n * n for n in range(300)))
print("main thread:", threading.current_thread().name)`,
        output: "counter: 200000\n['part0', 'part1', 'part2'] True\nmain thread: MainThread\n",
        lines: [
          [4, "One Lock shared by all threads protects the counter."],
          [9, "Only one thread at a time can be inside `with lock:` — no lost updates."],
          [12, "Create four threads, each adding 50,000."],
          [16, "join waits for each thread to finish before we read the result."],
          [21, "Better design: each thread writes its own key — nothing is shared mutably."],
          [26, "Combine the partial results after joining; the order threads finished doesn't matter."],
        ],
      },
      mistakes: [
        { title: "Forgetting join()", body: "Reading results before threads finish gives incomplete data." },
        { title: "Assuming an execution order", body: "Thread scheduling varies between runs. Code must be correct in any order." },
        { title: "Holding locks too long", body: "Doing I/O inside a lock serialises your threads and invites deadlocks." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`import threading
out = []
def worker(n):
    out.append(n * n)
ts = [threading.Thread(target=worker, args=(i,)) for i in range(4)]
for t in ts: t.start()
for t in ts: t.join()
print(sorted(out), len(out))`,
          answer: "[0, 1, 4, 9] 4\n",
          hint: "The order of appends may vary — but the code sorts.",
          explain: "All four threads finish (join), each appends one square; sorting removes any ordering differences.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Protect the shared total.",
          code: r`import threading
total = 0
lock = threading.Lock()
def add():
    global total
    for _ in range(10000):
        with ___:
            total += 1
ts = [threading.Thread(target=add) for _ in range(3)]
for t in ts: t.start()
for t in ts: t.join()
print(total)`,
          blanks: [["lock"]],
          output: "30000\n",
          hint: "The shared Lock object.",
          explain: "`with lock:` ensures one thread at a time updates total.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "This sometimes prints an incomplete list. Which line is missing?",
          code: r`import threading, time
results = []
def work(i):
    time.sleep(0.05)
    results.append(i)
ts = [threading.Thread(target=work, args=(i,)) for i in range(5)]
for t in ts:
    t.start()
print(sorted(results))`,
          line: 8,
          fix: r`import threading, time
results = []
def work(i):
    time.sleep(0.05)
    results.append(i)
ts = [threading.Thread(target=work, args=(i,)) for i in range(5)]
for t in ts:
    t.start()
for t in ts:
    t.join()
print(sorted(results))`,
          output: "[0, 1, 2, 3, 4]\n",
          hint: "Do we wait for the threads before reading results?",
          explain: "Without join(), the main thread may print before all workers have appended.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "What's a deadlock?",
          options: [
            { text: "A thread that crashed", why: "That's an exception." },
            { text: "Two threads each waiting forever for a lock the other holds", why: "Correct." },
            { text: "A lock that's never released because of an exception", why: "That's a leak; `with lock:` prevents it." },
          ],
          answer: 1,
          hint: "Circular waiting.",
          explain: "Thread A holds lock 1 and waits for lock 2 while B holds 2 and waits for 1 — neither proceeds. Acquire locks in a fixed order.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Parallel word counts", difficulty: 3,
          prompt: `Read lines of text until \`end\`. Start **one thread per line** that counts the words of its line and stores the count in a shared dict under the line's index (protect it with a Lock). After joining, print each line's count in input order and the total.`,
          starter: r`import threading
`,
          tests: [
            { label: "Three lines", input: "the cat sat\na b c d e\nhello\nend\n", output: "line 1: 3\nline 2: 5\nline 3: 1\ntotal 9" },
            { label: "Empty line", input: "\nx y\nend\n", output: "line 1: 0\nline 2: 2\ntotal 2", hidden: true, category: "edge" },
          ],
          hints: [
            "Collect lines first, then create one Thread per line with target and args=(index, line).",
            "The worker does `with lock: counts[i] = len(line.split())`.",
            "start all, then join all.",
            "Print in index order (0..n-1), numbering from 1.",
          ],
          solution: r`import threading

lines = []
while (line := input()) != "end":
    lines.append(line)
counts = {}
lock = threading.Lock()

def count(i, text):
    n = len(text.split())
    with lock:
        counts[i] = n

threads = [threading.Thread(target=count, args=(i, t)) for i, t in enumerate(lines)]
for t in threads:
    t.start()
for t in threads:
    t.join()
for i in range(len(lines)):
    print(f"line {i + 1}: {counts[i]}")
print("total", sum(counts.values()))`,
          notes: "Results are keyed by index, so output order never depends on which thread finished first. (For CPU work like this, threads don't add speed because of the GIL — next lessons.)",
        },
        {
          id: "stretch", kind: "debug", title: "Fix the bank race", difficulty: 4,
          prompt: `Four threads each make 1,000 deposits of 1 into a shared \`Account\`. The \`deposit\` method has a race (it reads, pauses with \`time.sleep(0)\` to make the race likely, then writes). Fix the class with a Lock so the final balance is always 4000.`,
          starter: r`import threading, time

class Account:
    def __init__(self):
        self.balance = 0
    def deposit(self, amount):
        current = self.balance
        time.sleep(0)
        self.balance = current + amount

acct = Account()
def worker():
    for _ in range(1000):
        acct.deposit(1)
ts = [threading.Thread(target=worker) for _ in range(4)]
for t in ts: t.start()
for t in ts: t.join()
print(acct.balance)`,
          tests: [{ label: "Balance", input: "", output: "4000" }],
          hints: [
            "Which steps must happen together without interruption?",
            "Give Account a `self._lock = threading.Lock()`.",
            "Wrap the read-pause-write sequence in `with self._lock:`.",
            "The lock belongs to the object it protects.",
          ],
          solution: r`import threading, time

class Account:
    def __init__(self):
        self.balance = 0
        self._lock = threading.Lock()
    def deposit(self, amount):
        with self._lock:
            current = self.balance
            time.sleep(0)
            self.balance = current + amount

acct = Account()
def worker():
    for _ in range(1000):
        acct.deposit(1)
ts = [threading.Thread(target=worker) for _ in range(4)]
for t in ts: t.start()
for t in ts: t.join()
print(acct.balance)`,
          notes: "`time.sleep(0)` hands control to another thread, making the lost-update race show up almost every run. With the lock, read-modify-write is atomic and the answer is always 4000.",
        },
      ],
      realWorld: "Web servers handle requests on threads or async tasks; download managers and scrapers overlap network waits; double-charged payments and oversold stock are classic production race conditions.",
      reteach: "Threads are several cooks in one kitchen sharing the same fridge. If two cooks both read 'one egg left', both plan to use it — a race. A lock is a rule: only one cook may open the fridge at a time. Processes are separate kitchens: no shared fridge, but they must phone each other to share ingredients.",
      summary: [
        "Processes (separate memory, true parallelism), threads (shared memory), async tasks (one thread, cooperative).",
        "Thread(target=…, args=…).start(), then join(); never assume an order.",
        "Protect shared mutable state with Lock (`with lock:`), keep critical sections short, or avoid sharing.",
      ],
      cpp: {
        python: r`lock = threading.Lock()
with lock:
    counter += 1`,
        cpp: r`std::mutex m;
{
    std::lock_guard<std::mutex> g(m);
    counter++;
}`,
        note: "Same idea: a mutex released automatically at the end of a scope. In C++ threads run truly in parallel; in CPython the GIL limits pure-Python CPU work to one thread at a time.",
      },
    },

    {
      id: "py-queues-executors",
      title: "Queues, futures and executors",
      minutes: 17,
      difficulty: 4,
      objectives: [
        "Pass work between threads safely with `queue.Queue`",
        "Run tasks with `ThreadPoolExecutor` and collect results via futures",
        "Handle exceptions raised inside worker tasks",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "`executor.map(f, items)` returns results in which order?",
        options: [
          { text: "The order tasks finish", why: "That's as_completed()." },
          { text: "The same order as items", why: "Correct." },
          { text: "Random order", why: "map preserves input order." },
        ],
        answer: 1,
        hint: "Like the built-in map.",
        explain: "Executor.map yields results in input order (waiting as needed); as_completed yields futures as they finish.",
      },
      why: "Locks are error-prone; queues and executors are the safer, higher-level tools. A queue hands work from producers to consumers; an executor manages a pool of workers and gives you futures — placeholders for results that will arrive.",
      concept: [
        {
          title: "queue.Queue",
          body: `\`\`\`python
import queue, threading
q = queue.Queue()
def worker():
    while True:
        item = q.get()
        if item is None:        # a 'poison pill' tells the worker to stop
            break
        process(item)
        q.task_done()
\`\`\`

\`Queue\` is thread-safe (it has locks inside). Producer/consumer pipelines need no explicit locks of your own.`,
        },
        {
          title: "Executors and futures",
          body: `\`\`\`python
from concurrent.futures import ThreadPoolExecutor, as_completed
with ThreadPoolExecutor(max_workers=4) as ex:
    results = list(ex.map(fetch, urls))             # results in input order
    futures = {ex.submit(fetch, u): u for u in urls}
    for fut in as_completed(futures):               # as each finishes
        url = futures[fut]
        try:
            data = fut.result()                     # re-raises the task's exception
        except Exception as e:
            print(url, "failed:", e)
\`\`\`

The \`with\` block waits for all tasks to finish. \`ProcessPoolExecutor\` has the same API using processes.`,
        },
      ],
      example: {
        title: "A worker pool with failures handled",
        code: r`import queue, threading
from concurrent.futures import ThreadPoolExecutor

def parse_price(text):
    value = float(text)
    if value < 0:
        raise ValueError(f"negative price {value}")
    return round(value * 1.18, 2)

inputs = ["100", "abc", "50.5", "-3"]
with ThreadPoolExecutor(max_workers=3) as ex:
    futures = [ex.submit(parse_price, t) for t in inputs]
for text, fut in zip(inputs, futures):
    try:
        print(text, "->", fut.result())
    except ValueError as e:
        print(text, "-> error:", e)

with ThreadPoolExecutor(max_workers=2) as ex:
    print(list(ex.map(len, ["a", "abc", "ab"])))

q = queue.Queue()
done = []
def consumer():
    while (item := q.get()) is not None:
        done.append(item.upper())
t = threading.Thread(target=consumer)
t.start()
for word in ["red", "green", "blue"]:
    q.put(word)
q.put(None)
t.join()
print(done)`,
        output: "100 -> 118.0\nabc -> error: could not convert string to float: 'abc'\n50.5 -> 59.59\n-3 -> error: negative price -3.0\n[1, 3, 2]\n['RED', 'GREEN', 'BLUE']\n",
        lines: [
          [12, "submit schedules a task and returns a Future immediately."],
          [13, "By here the with block has ended — leaving it waited for every task."],
          [15, "result() returns the value — or re-raises the exception from the worker thread."],
          [20, "map keeps input order, regardless of which worker finished first."],
          [25, "A consumer reads until it receives the None 'poison pill'."],
          [31, "None tells the consumer to stop; one consumer handles items in FIFO order, so the output order is fixed."],
        ],
      },
      mistakes: [
        { title: "Ignoring future exceptions", body: "An exception inside a task is stored in the future; if you never call result(), it's silently lost." },
        { title: "Forgetting a stop signal", body: "Consumers waiting on q.get() block forever unless you send a sentinel (or use timeouts)." },
        { title: "Too many workers", body: "Hundreds of threads waste memory; size pools for the workload (I/O: tens; CPU: number of cores, with processes)." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`from concurrent.futures import ThreadPoolExecutor
def risky(x):
    return 10 // x
with ThreadPoolExecutor(2) as ex:
    futs = [ex.submit(risky, x) for x in (5, 0, 2)]
out = []
for f in futs:
    out.append(type(f.exception()).__name__ if f.exception() else f.result())
print(out)`,
          answer: "[2, 'ZeroDivisionError', 5]\n",
          hint: "future.exception() returns the raised exception or None.",
          explain: "10 // 5 = 2, 10 // 0 raises ZeroDivisionError (stored in the future), 10 // 2 = 5.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Get the task's return value from the future.",
          code: r`from concurrent.futures import ThreadPoolExecutor
with ThreadPoolExecutor() as ex:
    fut = ex.submit(pow, 2, 10)
    print(fut.___())`,
          blanks: [["result"]],
          output: "1024\n",
          hint: "The method that waits and returns the value.",
          explain: "`future.result()` blocks until done and returns the value (or raises).",
        },
        {
          id: "b1", kind: "bug", difficulty: 4,
          prompt: "The program never finishes (the consumer waits forever). Which line should send the stop signal?",
          code: r`import queue, threading
q = queue.Queue()
items = []
def consume():
    while (x := q.get()) is not None:
        items.append(x)
t = threading.Thread(target=consume, daemon=True)
t.start()
for i in range(3):
    q.put(i)
t.join(timeout=1)
print(items, t.is_alive())`,
          line: 10,
          fix: r`import queue, threading
q = queue.Queue()
items = []
def consume():
    while (x := q.get()) is not None:
        items.append(x)
t = threading.Thread(target=consume, daemon=True)
t.start()
for i in range(3):
    q.put(i)
q.put(None)
t.join(timeout=1)
print(items, t.is_alive())`,
          output: "[0, 1, 2] False\n",
          hint: "How does the consumer know to stop?",
          explain: "The consumer stops only when it gets None. Without q.put(None) it stays blocked (the timeout just stops us waiting).",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "Why prefer queue.Queue over a plain list shared between threads?",
          options: [
            { text: "It's faster in all cases", why: "Not the main reason." },
            { text: "It's thread-safe and lets consumers block until items arrive", why: "Correct." },
            { text: "Lists can't hold strings", why: "They can." },
          ],
          answer: 1,
          hint: "Safety and waiting.",
          explain: "Queue handles locking internally and provides blocking get/put with optional timeouts.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Concurrent 'downloads' (simulated)", difficulty: 3,
          prompt: `Simulate downloads: \`fetch(name)\` sleeps \`0.01 * len(name)\` seconds (pretend network wait) and returns \`len(name) * 100\` bytes, but raises \`ConnectionError\` for names starting with \`x\`. Read names until \`end\`, run them with a ThreadPoolExecutor (4 workers), and print results **in input order** as \`name: N bytes\` or \`name: failed\`, then \`total N bytes\`.`,
          starter: r`import time
from concurrent.futures import ThreadPoolExecutor
`,
          tests: [
            { label: "Mixed", input: "home\nxfail\nnews\nend\n", output: "home: 400 bytes\nxfail: failed\nnews: 400 bytes\ntotal 800 bytes" },
            { label: "Single", input: "a\nend\n", output: "a: 100 bytes\ntotal 100 bytes", hidden: true },
          ],
          hints: [
            "fetch sleeps, then raises or returns.",
            "Submit every name and keep the futures in input order.",
            "For each future: try result(), except ConnectionError.",
            "Only add successful sizes to the total.",
          ],
          solution: r`import time
from concurrent.futures import ThreadPoolExecutor

def fetch(name):
    time.sleep(0.01 * len(name))
    if name.startswith("x"):
        raise ConnectionError(f"cannot reach {name}")
    return len(name) * 100

names = []
while (line := input()) != "end":
    names.append(line)
total = 0
with ThreadPoolExecutor(max_workers=4) as ex:
    futures = [ex.submit(fetch, n) for n in names]
    for name, fut in zip(names, futures):
        try:
            size = fut.result()
        except ConnectionError:
            print(f"{name}: failed")
        else:
            total += size
            print(f"{name}: {size} bytes")
print(f"total {total} bytes")`,
          notes: "The sleeps overlap, so total waiting is about the longest single wait, not the sum. The sandbox has no network — sleep stands in for it; the structure is identical for real HTTP requests.",
        },
        {
          id: "stretch", kind: "task", title: "Producer–consumer pipeline", difficulty: 4,
          prompt: `Build a two-stage pipeline with two queues: a **parser** thread reads raw lines from queue A, converts \`name,score\` to \`(name, int(score))\` (skipping malformed lines) and puts them on queue B; an **aggregator** thread sums scores per name from queue B. The main thread feeds input lines to A until \`end\`, then sends sentinels. Print the totals sorted by name and \`skipped N\`.`,
          starter: r`import queue, threading
`,
          tests: [
            { label: "Lines", input: "asha,10\nravi,5\nbad line\nasha,7\nzoe,x\nend\n", output: "asha 17\nravi 5\nskipped 2" },
          ],
          hints: [
            "Two Queue objects; a sentinel (None) passes from A to the parser, which forwards it to B.",
            "Parser: try `name, s = line.split(\",\")` and `int(s)`; count skips on ValueError.",
            "Aggregator: `totals[name] = totals.get(name, 0) + score` until None.",
            "Join both threads before printing.",
          ],
          solution: r`import queue, threading

raw, parsed = queue.Queue(), queue.Queue()
totals = {}
skipped = 0

def parser():
    global skipped
    while (line := raw.get()) is not None:
        try:
            name, score = line.split(",")
            parsed.put((name, int(score)))
        except ValueError:
            skipped += 1
    parsed.put(None)

def aggregator():
    while (item := parsed.get()) is not None:
        name, score = item
        totals[name] = totals.get(name, 0) + score

threads = [threading.Thread(target=parser), threading.Thread(target=aggregator)]
for t in threads:
    t.start()
while (line := input()) != "end":
    raw.put(line)
raw.put(None)
for t in threads:
    t.join()
for name in sorted(totals):
    print(name, totals[name])
print("skipped", skipped)`,
          notes: "Each piece of state is owned by exactly one thread (skipped by the parser, totals by the aggregator), and the queues move data between them — no locks needed. This is the shape of real ETL pipelines.",
        },
      ],
      realWorld: "Web scrapers fetch many pages with a thread pool; log shippers use producer/consumer queues; Celery and RQ are distributed versions of 'put a job on a queue, workers process it'.",
      reteach: "A queue is a conveyor belt between workers: one puts boxes on, another takes them off, and the belt itself makes sure no box is grabbed twice. An executor is a temp agency: you hand over jobs (submit) and get receipts (futures) to collect the results — or the bad news — later.",
      summary: [
        "queue.Queue: thread-safe handoff; consumers block on get(); stop them with a sentinel.",
        "ThreadPoolExecutor: submit → Future; result() returns or re-raises; map keeps order; as_completed for finish order.",
        "Always collect future results (or exceptions); size pools sensibly.",
      ],
    },

    {
      id: "py-gil-multiprocessing",
      title: "The GIL, CPU vs I/O work and choosing a model",
      minutes: 16,
      difficulty: 4,
      objectives: [
        "Explain what the GIL is and its consequences",
        "Classify work as CPU-bound or I/O-bound",
        "Choose between threads, processes and asyncio",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "Will 4 threads speed up a pure-Python prime search 4× on a 4-core CPU (standard CPython)?",
        options: [
          { text: "Yes, threads always use all cores", why: "Not in CPython for pure-Python code." },
          { text: "No — the GIL lets only one thread execute Python bytecode at a time", why: "Correct." },
          { text: "It will crash", why: "It runs, just not faster." },
        ],
        answer: 1,
        hint: "Global Interpreter Lock.",
        explain: "In standard CPython the GIL serialises Python bytecode, so CPU-bound threads don't run in parallel. Use processes (or C-backed libraries).",
      },
      why: "Picking the wrong concurrency model wastes effort: threads can't speed up CPU-heavy Python, and processes are overkill for waiting on the network. A quick classification of the work gives the right tool.",
      concept: [
        {
          title: "The GIL",
          body: `CPython has a **Global Interpreter Lock**: only one thread runs Python bytecode at a time. Consequences:

- **I/O-bound** threads work great — the GIL is released while waiting on files, sockets and \`time.sleep\`.
- **CPU-bound** pure-Python threads get no speed-up (sometimes a slow-down).
- Libraries written in C (NumPy, hashlib, compression) often release the GIL during heavy work.

**Version note:** Python 3.13 ships an *experimental* free-threaded build (no GIL), not the default yet.`,
        },
        {
          title: "Choosing",
          body: `| Workload | Best tool |
| --- | --- |
| Many network/disk waits (dozens) | threads (ThreadPoolExecutor) |
| Thousands of network connections | asyncio |
| Heavy computation in pure Python | processes (ProcessPoolExecutor / multiprocessing) |
| Heavy numeric work | NumPy (vectorised, C speed) — maybe plus processes |

Processes don't share memory: arguments and results are **pickled** and sent between them, so pass small data, and guard the entry point with \`if __name__ == "__main__":\`.`,
        },
      ],
      example: {
        title: "Classifying work (and what threads can and can't do)",
        code: r`import time
from concurrent.futures import ThreadPoolExecutor

def io_task(n):
    time.sleep(0.05)
    return n

def cpu_task(n):
    return sum(i * i for i in range(n))

start = time.perf_counter()
with ThreadPoolExecutor(max_workers=8) as ex:
    list(ex.map(io_task, range(8)))
overlap = time.perf_counter() - start
print("8 waits of 0.05 s overlapped:", overlap < 8 * 0.05 * 0.75)

with ThreadPoolExecutor(max_workers=4) as ex:
    results = list(ex.map(cpu_task, [10_000] * 4))
print("CPU results correct:", results == [cpu_task(10_000)] * 4)

def classify(task):
    waits = {"download page", "read big file", "query database"}
    return "I/O-bound → threads or asyncio" if task in waits else "CPU-bound → processes or NumPy"
for task in ["download page", "resize 10k photos in Python", "query database"]:
    print(f"{task}: {classify(task)}")`,
        output: "8 waits of 0.05 s overlapped: True\nCPU results correct: True\ndownload page: I/O-bound → threads or asyncio\nresize 10k photos in Python: CPU-bound → processes or NumPy\nquery database: I/O-bound → threads or asyncio\n",
        lines: [
          [5, "Sleeping stands in for waiting on a network or disk; the GIL is released while waiting."],
          [9, "Pure-Python arithmetic holds the GIL the whole time."],
          [13, "Eight waits run at once, so the total is far less than 8 × 0.05 s."],
          [18, "Threads still give correct CPU results — just without parallel speed-up in CPython."],
          [23, "The decision rule: is the task mostly waiting, or mostly computing?"],
        ],
      },
      mistakes: [
        { title: "Threads for CPU-heavy Python", body: "No speed-up under the GIL. Use processes or vectorised libraries." },
        { title: "Sending huge data to processes", body: "Everything is pickled and copied. Send file names or chunks, not giant objects." },
        { title: "Missing the __main__ guard", body: "On Windows/macOS, multiprocessing re-imports your script; without `if __name__ == \"__main__\":` it spawns workers recursively." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`def kind(seconds_waiting, seconds_computing):
    if seconds_waiting > seconds_computing:
        return "I/O-bound"
    return "CPU-bound"
print(kind(0.9, 0.1), kind(0.05, 2.0))`,
          answer: "I/O-bound CPU-bound\n",
          hint: "Which dominates?",
          explain: "Mostly waiting → I/O-bound; mostly computing → CPU-bound.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Pick the executor for CPU-heavy pure-Python work (just the class name).",
          code: r`best = "___PoolExecutor"
print(best)`,
          blanks: [["Process"]],
          output: "ProcessPoolExecutor\n",
          hint: "Separate interpreters avoid the GIL.",
          explain: "ProcessPoolExecutor runs tasks in separate processes, each with its own GIL.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "The plan is meant to speed up 10,000 image resizes written in pure Python. Which line chooses the wrong tool?",
          code: r`plan = {
    "task": "resize images in pure Python",
    "tool": "ThreadPoolExecutor",
    "workers": 8,
}
print(plan["tool"], plan["workers"])`,
          line: 3,
          fix: r`plan = {
    "task": "resize images in pure Python",
    "tool": "ProcessPoolExecutor",
    "workers": 8,
}
print(plan["tool"], plan["workers"])`,
          output: "ProcessPoolExecutor 8\n",
          hint: "Is resizing in pure Python waiting or computing?",
          explain: "It's CPU-bound, so threads are limited by the GIL; processes run on separate cores (or use a C library like Pillow/NumPy).",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "Your service must keep 10,000 slow WebSocket connections open at once. Best fit?",
          options: [
            { text: "10,000 threads", why: "Too much memory and scheduling overhead." },
            { text: "asyncio", why: "Correct — many cheap tasks on one thread." },
            { text: "10,000 processes", why: "Far too heavy." },
          ],
          answer: 1,
          hint: "Massive concurrent waiting.",
          explain: "asyncio handles huge numbers of mostly-idle connections efficiently.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Choose the concurrency model", difficulty: 3,
          prompt: `Read task descriptions \`name|wait_ms|compute_ms|connections\` until \`end\`. Recommend: \`asyncio\` if connections > 1000; else \`threads\` if wait_ms > compute_ms; else \`processes\` if compute_ms >= 1000; else \`sequential\`. Print \`name: model\`.`,
          starter: r`def recommend(wait_ms, compute_ms, connections):
    pass
`,
          tests: [
            { label: "Tasks", input: "scraper|900|50|20\nchat|200|5|5000\nrender|10|8000|1\nconfig|1|2|1\nend\n", output: "scraper: threads\nchat: asyncio\nrender: processes\nconfig: sequential" },
          ],
          hints: [
            "Check the rules in the given order.",
            "Return a string from recommend.",
            "Parse with `line.split(\"|\")` and convert numbers.",
            "Print `f\"{name}: {recommend(...)}\"`.",
          ],
          solution: r`def recommend(wait_ms, compute_ms, connections):
    if connections > 1000:
        return "asyncio"
    if wait_ms > compute_ms:
        return "threads"
    if compute_ms >= 1000:
        return "processes"
    return "sequential"

while (line := input()) != "end":
    name, wait, compute, conns = line.split("|")
    print(f"{name}: {recommend(int(wait), int(compute), int(conns))}")`,
          notes: "A rule of thumb, not a law — measure! But asking 'waiting or computing, and how many at once?' gets the choice right most of the time. And 'sequential' is a legitimate answer: concurrency adds complexity.",
        },
        {
          id: "stretch", kind: "task", title: "Chunk work for processes", difficulty: 4,
          prompt: `Processes receive pickled arguments, so work is split into chunks. Write \`chunks(n, k)\` that splits the range 0..n-1 into k nearly equal \`(start, stop)\` pairs (the first n % k chunks get one extra item), and \`partial_sum(bounds)\` that sums squares in that range. Show that the chunked total equals the direct total. (The sandbox can't start processes, so run the chunks sequentially — the code is otherwise ready for ProcessPoolExecutor.map.)`,
          starter: r`def chunks(n, k):
    pass

def partial_sum(bounds):
    pass

n, k = map(int, input().split())
`,
          tests: [
            { label: "10 into 3", input: "10 3\n", output: "[(0, 4), (4, 7), (7, 10)]\n285 285 True" },
            { label: "Even split", input: "8 4\n", output: "[(0, 2), (2, 4), (4, 6), (6, 8)]\n140 140 True", hidden: true },
          ],
          hints: [
            "Base size = n // k, extra = n % k.",
            "Walk a start index, adding size + (1 if i < extra else 0).",
            "partial_sum: `sum(i * i for i in range(start, stop))`.",
            "Print the chunks, the chunked total, the direct total and whether they match.",
          ],
          solution: r`def chunks(n, k):
    size, extra = divmod(n, k)
    out, start = [], 0
    for i in range(k):
        stop = start + size + (1 if i < extra else 0)
        out.append((start, stop))
        start = stop
    return out

def partial_sum(bounds):
    start, stop = bounds
    return sum(i * i for i in range(start, stop))

n, k = map(int, input().split())
parts = chunks(n, k)
print(parts)
chunked = sum(map(partial_sum, parts))  # with processes: ProcessPoolExecutor().map(partial_sum, parts)
direct = sum(i * i for i in range(n))
print(chunked, direct, chunked == direct)`,
          notes: "Only tiny (start, stop) tuples cross process boundaries — the cheap way to parallelise CPU work. On your own computer, swap `map` for `ProcessPoolExecutor().map` inside `if __name__ == \"__main__\":`.",
        },
      ],
      realWorld: "Data teams parallelise CPU-heavy feature engineering with process pools; web back ends use async frameworks (FastAPI) or thread pools; image-processing pipelines lean on C libraries that release the GIL.",
      reteach: "The GIL is a single talking-stick in a meeting: only the holder may speak (run Python), but anyone waiting for a phone call can hand the stick over. So threads are great when most of the time is spent waiting on phones (I/O). For lots of thinking (CPU), you need separate meetings in separate rooms — processes.",
      summary: [
        "CPython's GIL: one thread runs Python bytecode at a time; released during I/O waits.",
        "I/O-bound → threads/asyncio; CPU-bound → processes or vectorised C libraries.",
        "Processes pickle data — send small chunks and use the __main__ guard.",
      ],
      libraryCode: [{
        title: "Real parallelism with processes",
        code: `from concurrent.futures import ProcessPoolExecutor

def count_primes(bounds):
    start, stop = bounds
    return sum(all(n % d for d in range(2, int(n ** 0.5) + 1)) for n in range(max(start, 2), stop))

if __name__ == "__main__":
    parts = [(i * 250_000, (i + 1) * 250_000) for i in range(4)]
    with ProcessPoolExecutor() as ex:
        print(sum(ex.map(count_primes, parts)))`,
        note: "Run on your own computer: each chunk runs on a separate core, so this is several times faster than a single process. The CodeMentor sandbox allows only one process, so it can't run here.",
      }],
    },
  ],
  exam: [
    {
      id: "e1", kind: "mcq", difficulty: 4,
      prompt: "Which change makes `balance += amount` safe when many threads call it?",
      options: [
        { text: "Use a global variable", why: "Still a race." },
        { text: "Wrap it in `with lock:` using one shared Lock", why: "Correct." },
        { text: "Add time.sleep(0) before it", why: "Makes the race MORE likely." },
      ],
      answer: 1,
      hint: "Mutual exclusion.",
      explain: "A shared Lock makes the read-modify-write atomic with respect to other threads using the same lock.",
    },
    {
      id: "e2", kind: "predict", difficulty: 3,
      code: r`from concurrent.futures import ThreadPoolExecutor
with ThreadPoolExecutor(3) as ex:
    print(list(ex.map(lambda s: s[::-1], ["abc", "xy", "z"])))`,
      answer: "['cba', 'yx', 'z']\n",
      hint: "map keeps input order.",
      explain: "Each string is reversed in a worker; results come back in input order.",
    },
    {
      id: "e3", kind: "fill", difficulty: 3,
      prompt: "Wait for the thread to finish.",
      code: r`import threading
box = []
t = threading.Thread(target=box.append, args=(42,))
t.start()
t.___()
print(box)`,
      blanks: [["join"]],
      output: "[42]\n",
      hint: "The waiting method.",
      explain: "`join()` blocks until the thread ends.",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: concurrent link checker (simulated)", difficulty: 4,
    prompt: `Check a list of 'URLs' concurrently with a ThreadPoolExecutor (5 workers). \`check(url)\` simulates a request: sleeps \`0.005 * len(url)\` s, then returns a status: 404 if the path contains \`missing\`, 500 if it contains \`error\`, else 200; URLs not starting with \`https://\` raise \`ValueError("insecure URL")\`.

Read URLs until \`end\`. Print, in input order, \`STATUS URL\` or \`ERR URL (message)\`; then a summary \`ok N, broken M, errors E\` (broken = 404/500). Use as_completed to count, and a Lock to protect the shared counters.`,
    starter: r`import threading, time
from concurrent.futures import ThreadPoolExecutor, as_completed
`,
    tests: [
      { label: "Links", input: "https://site.in/home\nhttps://site.in/missing-page\nhttp://old.site\nhttps://site.in/error\nhttps://site.in/about\nend\n", output: "200 https://site.in/home\n404 https://site.in/missing-page\nERR http://old.site (insecure URL)\n500 https://site.in/error\n200 https://site.in/about\nok 2, broken 2, errors 1" },
    ],
    hints: [
      "Submit all URLs and keep a dict future → index.",
      "In an as_completed loop, store each outcome in results[index] and update counters under a lock.",
      "After the loop, print results in index order.",
      "fut.result() re-raises ValueError for insecure URLs — catch it.",
    ],
    solution: r`import threading, time
from concurrent.futures import ThreadPoolExecutor, as_completed

def check(url):
    time.sleep(0.005 * len(url))
    if not url.startswith("https://"):
        raise ValueError("insecure URL")
    if "missing" in url:
        return 404
    if "error" in url:
        return 500
    return 200

urls = []
while (line := input()) != "end":
    urls.append(line)
results = [None] * len(urls)
counts = {"ok": 0, "broken": 0, "errors": 0}
lock = threading.Lock()
with ThreadPoolExecutor(max_workers=5) as ex:
    futures = {ex.submit(check, u): i for i, u in enumerate(urls)}
    for fut in as_completed(futures):
        i = futures[fut]
        try:
            status = fut.result()
            results[i] = f"{status} {urls[i]}"
            key = "ok" if status == 200 else "broken"
        except ValueError as e:
            results[i] = f"ERR {urls[i]} ({e})"
            key = "errors"
        with lock:
            counts[key] += 1
for line in results:
    print(line)
print(f"ok {counts['ok']}, broken {counts['broken']}, errors {counts['errors']}")`,
    notes: "Results are collected as they complete but printed in input order, so output is deterministic. (Here only the main thread updates counts, so the lock is defensive — it becomes essential if workers update shared state directly.) Real link checkers add timeouts, retries and polite rate limits (Module 32).",
  },
};
