import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 27 — Asynchronous programming with asyncio. */
export const M27: PyModuleDef = {
  id: "py-async",
  number: 27,
  level: 4,
  title: "Asynchronous Programming",
  summary: "Synchronous vs asynchronous code; the event loop; coroutines; async and await; tasks; gather; timeouts; cancellation; async context managers and iterators; async I/O concepts; common async mistakes.",
  track: "core",
  optionalNote: "Essential for modern web back ends (FastAPI), bots and high-concurrency network clients; skip-able for scripting and data analysis.",
  prereqs: ["py-concurrency"],
  lessons: [
    {
      id: "py-async-basics",
      title: "Coroutines, await and the event loop",
      minutes: 17,
      difficulty: 4,
      objectives: [
        "Explain what the event loop does",
        "Write coroutines with `async def` and call them with `await`",
        "Start an async program with `asyncio.run`",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "What does calling `fetch()` return, if `fetch` is defined with `async def` and you don't await it?",
        options: [
          { text: "The function's return value", why: "Only after it is awaited." },
          { text: "A coroutine object — the body hasn't run yet", why: "Correct." },
          { text: "None", why: "It returns a coroutine object." },
        ],
        answer: 1,
        hint: "async def creates something that must be awaited.",
        explain: "Calling an async function creates a coroutine object; the code inside runs only when it's awaited or scheduled as a task.",
      },
      why: "A web server might wait on thousands of slow clients at once. asyncio lets one thread juggle all of them: whenever a task is waiting, the event loop runs another. It's how FastAPI, Discord bots and modern HTTP clients stay fast with very little memory.",
      concept: [
        {
          title: "Synchronous vs asynchronous",
          body: `**Synchronous**: each step waits for the previous one; while waiting for the network, the program does nothing else.

**Asynchronous**: a task says "I'm waiting — run something else" (\`await\`). The **event loop** keeps a list of ready tasks and runs them one at a time until each reaches its next \`await\`.

It's **cooperative**: a task only gives up control at an \`await\`. Code between awaits runs without interruption — so a slow CPU loop blocks everything.`,
        },
        {
          title: "async / await",
          body: `\`\`\`python
import asyncio

async def greet(name):          # a coroutine function
    await asyncio.sleep(1)      # pause this task, let others run
    return f"hi {name}"

async def main():
    msg = await greet("Asha")   # run it and wait for the result
    print(msg)

asyncio.run(main())             # create the loop, run main, close the loop
\`\`\`

- \`await\` works only inside \`async def\`.
- You can await coroutines, tasks and futures ("awaitables").
- \`asyncio.run\` is the single entry point of an async program.`,
        },
        {
          title: "Awaiting one after another is still sequential",
          body: `\`\`\`python
a = await fetch("x")   # waits fully…
b = await fetch("y")   # …then starts the next
\`\`\`

This is correct but not concurrent. To overlap waits you need **tasks** or **gather** (next lesson).`,
        },
      ],
      example: {
        title: "A tiny async program",
        code: r`import asyncio

async def brew(drink, seconds):
    print(f"start {drink}")
    await asyncio.sleep(seconds)
    print(f"done {drink}")
    return drink.upper()

async def main():
    coro = brew("tea", 0.01)
    print(type(coro).__name__)
    first = await coro
    second = await brew("coffee", 0.01)
    print(first, second)

asyncio.run(main())
print("loop closed")`,
        output: "coroutine\nstart tea\ndone tea\nstart coffee\ndone coffee\nTEA COFFEE\nloop closed\n",
        lines: [
          [3, "`async def` defines a coroutine function."],
          [5, "`await asyncio.sleep` pauses only this task; the loop could run others meanwhile."],
          [10, "Calling brew creates a coroutine object; nothing has printed yet."],
          [12, "Awaiting runs the body to completion and gives back the return value."],
          [13, "A second await starts only after the first finished — sequential."],
          [16, "asyncio.run starts the event loop, runs main and shuts the loop down."],
        ],
      },
      mistakes: [
        { title: "Forgetting await", body: "`result = fetch()` gives a coroutine object, not data — and Python warns \"coroutine was never awaited\"." },
        { title: "Blocking calls inside async code", body: "`time.sleep`, `requests.get` or heavy loops freeze the whole event loop. Use `await asyncio.sleep`, async libraries, or `asyncio.to_thread`." },
        { title: "Calling asyncio.run inside async code", body: "There is one loop per thread; inside a coroutine just `await`." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`import asyncio
async def double(x):
    await asyncio.sleep(0)
    return x * 2
async def main():
    a = await double(3)
    b = await double(a)
    print(a, b)
asyncio.run(main())`,
          answer: "6 12\n",
          hint: "Each await returns the coroutine's value.",
          explain: "double(3) gives 6, then double(6) gives 12.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Get the coroutine's result.",
          code: r`import asyncio
async def answer():
    return 42
async def main():
    value = ___ answer()
    print(value)
asyncio.run(main())`,
          blanks: [["await"]],
          output: "42\n",
          hint: "The keyword that waits for a coroutine.",
          explain: "`await answer()` runs the coroutine and returns 42.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "This crashes with `TypeError: unsupported operand type(s) for +: 'coroutine' and 'int'`. Which line is wrong?",
          code: r`import asyncio
async def price(item):
    await asyncio.sleep(0)
    return {"pen": 10, "book": 50}[item]
async def main():
    p = price("pen")
    b = await price("book")
    print(p + b)
asyncio.run(main())`,
          line: 6,
          fix: r`import asyncio
async def price(item):
    await asyncio.sleep(0)
    return {"pen": 10, "book": 50}[item]
async def main():
    p = await price("pen")
    b = await price("book")
    print(p + b)
asyncio.run(main())`,
          output: "60\n",
          hint: "Which call is missing a keyword?",
          explain: "Without `await`, p is a coroutine object rather than the price 10, so `p + b` fails.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "Inside an async function you call `time.sleep(2)`. What happens to other tasks?",
          options: [
            { text: "They keep running", why: "time.sleep blocks the thread — and the loop runs on that thread." },
            { text: "They all freeze for 2 seconds", why: "Correct." },
            { text: "Python raises an error", why: "No error; it just blocks." },
          ],
          answer: 1,
          hint: "Cooperative multitasking needs an await to switch.",
          explain: "time.sleep never yields to the loop, so nothing else runs. Use `await asyncio.sleep(2)`.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Async order pipeline", difficulty: 3,
          prompt: `Write coroutines \`check_stock(item)\` (awaits \`asyncio.sleep(0)\`, returns True unless the item is \`"piano"\`) and \`place_order(item)\` that awaits check_stock and returns \`"ordered <item>"\` or \`"out of stock: <item>"\`. In \`main\`, read items until \`end\` and await place_order for each in turn, printing the result. Run with asyncio.run.`,
          starter: r`import asyncio
`,
          tests: [
            { label: "Orders", input: "pen\npiano\nbook\nend\n", output: "ordered pen\nout of stock: piano\nordered book" },
            { label: "None", input: "end\n", output: "", hidden: true, category: "edge" },
          ],
          hints: [
            "Both functions are `async def`.",
            "Inside place_order: `if await check_stock(item):`.",
            "Read the input inside main (input() is fine here — it's not network I/O).",
            "Finish with `asyncio.run(main())`.",
          ],
          solution: r`import asyncio

async def check_stock(item):
    await asyncio.sleep(0)
    return item != "piano"

async def place_order(item):
    if await check_stock(item):
        return f"ordered {item}"
    return f"out of stock: {item}"

async def main():
    while (item := input()) != "end":
        print(await place_order(item))

asyncio.run(main())`,
          notes: "Coroutines call coroutines with await, all the way up to asyncio.run. (Reading stdin with input() blocks briefly; in a server you'd receive data from async network code instead.)",
        },
        {
          id: "stretch", kind: "debug", title: "Unfreeze the loop", difficulty: 4,
          prompt: `A heartbeat task should tick while a "slow job" runs, but each job step waits 0.15 s with blocking \`time.sleep\`, so the heartbeat never gets a turn until the job ends. Fix \`slow_job\` (keep the 0.15 s wait) so the ticks interleave and the output is exactly the expected sequence. (Don't change the heartbeat or main.)`,
          starter: r`import asyncio, time

async def slow_job():
    for step in range(3):
        time.sleep(0.15)
        print("job step", step)

async def heartbeat():
    for _ in range(3):
        print("tick")
        await asyncio.sleep(0.1)

async def main():
    await asyncio.gather(heartbeat(), slow_job())

asyncio.run(main())`,
          tests: [{ label: "Interleaved", input: "", output: "tick\ntick\njob step 0\ntick\njob step 1\njob step 2" }],
          hints: [
            "time.sleep blocks the event loop.",
            "Replace it with the async version — and await it.",
            "`await asyncio.sleep(0.15)`.",
            "Then trace: heartbeat starts first (tick), the job starts waiting, and they alternate.",
          ],
          solution: r`import asyncio, time

async def slow_job():
    for step in range(3):
        await asyncio.sleep(0.15)
        print("job step", step)

async def heartbeat():
    for _ in range(3):
        print("tick")
        await asyncio.sleep(0.1)

async def main():
    await asyncio.gather(heartbeat(), slow_job())

asyncio.run(main())`,
          notes: "With `await asyncio.sleep` the job gives control back, so heartbeat ticks happen while it waits. (Ticks at 0, 0.1 and 0.2 s and steps at 0.15, 0.3 and 0.45 s never land at the same instant, which keeps the order predictable.)",
        },
      ],
      realWorld: "FastAPI request handlers are `async def`; Discord and Telegram bots run on asyncio; httpx and aiohttp let one process make thousands of HTTP requests concurrently.",
      reteach: "Picture a chess master playing 20 boards at once. She makes a move on board 1, and while that opponent thinks (waiting), she walks to board 2. She never plays two boards at the same instant — she just never stands idle. `await` is \"my opponent is thinking, I'll go elsewhere\"; the event loop is her walking route.",
      summary: [
        "async def creates coroutines; calling one returns a coroutine object that must be awaited.",
        "The event loop runs one task at a time and switches only at await.",
        "Never block the loop (time.sleep, heavy loops, sync network calls); asyncio.run is the entry point.",
      ],
      version: "Python 3.7+ (asyncio.run); this course uses 3.12",
    },

    {
      id: "py-tasks-gather",
      title: "Tasks, gather, timeouts and cancellation",
      minutes: 18,
      difficulty: 4,
      objectives: [
        "Run coroutines concurrently with `create_task` and `gather`",
        "Apply timeouts with `asyncio.wait_for`",
        "Cancel tasks and handle `CancelledError` correctly",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "Three coroutines each `await asyncio.sleep(1)`. Run with `await asyncio.gather(a(), b(), c())`, roughly how long does it take?",
        options: [
          { text: "About 3 seconds", why: "That's sequential awaiting." },
          { text: "About 1 second", why: "Correct: the waits overlap." },
          { text: "About 0 seconds", why: "Each still waits 1 s." },
        ],
        answer: 1,
        hint: "gather runs them concurrently.",
        explain: "gather schedules all three as tasks; their sleeps overlap, so the total is about the longest one.",
      },
      why: "Concurrency only happens when several tasks are in flight. Tasks and gather start them together; timeouts and cancellation make sure one slow server can't hang your whole program.",
      concept: [
        {
          title: "Tasks and gather",
          body: `\`\`\`python
task = asyncio.create_task(fetch("a"))   # starts running soon, in the background
...                                      # do other things
result = await task                      # collect it later

results = await asyncio.gather(fetch("a"), fetch("b"), fetch("c"))
# results are in the SAME ORDER as the arguments
\`\`\`

- If one gathered coroutine raises, gather raises that exception (others keep running).
- \`gather(..., return_exceptions=True)\` returns exceptions as values instead.
- **Python 3.11+**: \`async with asyncio.TaskGroup() as tg: tg.create_task(...)\` — cancels the siblings if one fails; the modern structured choice.`,
        },
        {
          title: "Timeouts and cancellation",
          body: `\`\`\`python
try:
    data = await asyncio.wait_for(fetch(url), timeout=2)
except TimeoutError:            # asyncio.TimeoutError before 3.11
    data = None
\`\`\`

\`task.cancel()\` asks a task to stop: a \`CancelledError\` is raised inside it at its current await. Clean up in \`finally\` — and **re-raise** if you catch \`CancelledError\`, otherwise the cancellation is swallowed.`,
        },
      ],
      example: {
        title: "Concurrent fetches with a timeout and a cancel",
        code: r`import asyncio

async def fetch(name, delay):
    await asyncio.sleep(delay)
    if name == "bad":
        raise ConnectionError("server down")
    return f"{name}:ok"

async def worker():
    try:
        while True:
            await asyncio.sleep(0.01)
    finally:
        print("worker cleaned up")

async def main():
    results = await asyncio.gather(
        fetch("a", 0.02), fetch("bad", 0.01), fetch("b", 0.01),
        return_exceptions=True,
    )
    print([r if isinstance(r, str) else repr(r) for r in results])

    try:
        await asyncio.wait_for(fetch("slow", 1), timeout=0.02)
    except TimeoutError:
        print("slow timed out")

    task = asyncio.create_task(worker())
    await asyncio.sleep(0.03)
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        print("cancelled:", task.cancelled())

asyncio.run(main())`,
        output: "['a:ok', \"ConnectionError('server down')\", 'b:ok']\nslow timed out\nworker cleaned up\ncancelled: True\n",
        lines: [
          [17, "gather starts all three at once; results come back in argument order."],
          [19, "return_exceptions=True turns the failure into a value instead of raising."],
          [24, "wait_for cancels fetch if it isn't done in 0.02 s and raises TimeoutError."],
          [28, "create_task starts worker running in the background."],
          [30, "cancel() injects CancelledError at the worker's current await; its finally (line 13) runs — the place to release resources."],
          [32, "Awaiting a cancelled task re-raises CancelledError."],
        ],
      },
      mistakes: [
        { title: "Creating tasks and never awaiting them", body: "Their exceptions are lost and they may be garbage-collected mid-flight. Keep a reference and await (or use a TaskGroup)." },
        { title: "Swallowing CancelledError", body: "`except Exception` doesn't catch it (it's a BaseException since 3.8), but a bare `except:` does — re-raise it." },
        { title: "No timeouts on network calls", body: "One unresponsive server hangs the task forever. Wrap calls in wait_for or asyncio.timeout (3.11+)." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`import asyncio
async def job(n, d):
    await asyncio.sleep(d)
    print("finished", n)
    return n * 10
async def main():
    print(await asyncio.gather(job(1, 0.05), job(2, 0.01)))
asyncio.run(main())`,
          answer: "finished 2\nfinished 1\n[10, 20]\n",
          hint: "Finish order follows the delays; the result list follows argument order.",
          explain: "job 2 sleeps less, so it prints first, but gather returns [job1, job2] results in argument order.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Give up after 0.01 seconds.",
          code: r`import asyncio
async def main():
    try:
        await asyncio.___(asyncio.sleep(1), timeout=0.01)
    except TimeoutError:
        print("too slow")
asyncio.run(main())`,
          blanks: [["wait_for"]],
          output: "too slow\n",
          hint: "wait ___ (with a timeout).",
          explain: "`asyncio.wait_for(aw, timeout)` cancels the awaitable and raises TimeoutError when time runs out.",
        },
        {
          id: "b1", kind: "bug", difficulty: 4,
          prompt: "The three downloads should overlap (about 0.05 s total) and print `concurrent: True`, but they run one after another. Which line is the problem?",
          code: r`import asyncio, time
async def download(n):
    await asyncio.sleep(0.05)
    return n
async def main():
    start = time.perf_counter()
    results = [await download(n) for n in range(3)]
    took = time.perf_counter() - start
    print(results, "concurrent:", took < 0.1)
asyncio.run(main())`,
          line: 7,
          fix: r`import asyncio, time
async def download(n):
    await asyncio.sleep(0.05)
    return n
async def main():
    start = time.perf_counter()
    results = await asyncio.gather(*(download(n) for n in range(3)))
    took = time.perf_counter() - start
    print(results, "concurrent:", took < 0.1)
asyncio.run(main())`,
          output: "[0, 1, 2] concurrent: True\n",
          hint: "Awaiting inside a loop waits for each one in turn.",
          explain: "The comprehension awaits each download before starting the next (~0.15 s). gather starts all three together.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 4,
          prompt: "Why must code that catches `asyncio.CancelledError` usually re-raise it?",
          options: [
            { text: "Otherwise the task keeps running as if it was never cancelled", why: "Correct." },
            { text: "Python forbids catching it", why: "You may catch it — e.g. to clean up." },
            { text: "It makes the program faster", why: "Not about speed." },
          ],
          answer: 0,
          hint: "Who asked for the cancellation?",
          explain: "Cancellation is a request; swallowing the error ignores it and breaks timeouts and TaskGroups that rely on it.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Fastest mirror", difficulty: 3,
          prompt: `Read mirrors \`name delay_ms\` until \`end\`. Simulate each with \`asyncio.sleep(delay_ms / 1000)\` returning the name. Fetch them all concurrently with **gather** and print \`all: <names in input order>\`. Then wrap each fetch in \`wait_for(..., timeout=0.05)\` and print \`within 50ms: <names that finished>\` (input order) — use \`return_exceptions=True\` and keep only the strings.`,
          starter: r`import asyncio
`,
          tests: [
            { label: "Three", input: "mumbai 10\nlondon 200\npune 20\nend\n", output: "all: mumbai london pune\nwithin 50ms: mumbai pune" },
            { label: "None fast", input: "far 120\nend\n", output: "all: far\nwithin 50ms: ", hidden: true, category: "edge" },
          ],
          hints: [
            "`async def mirror(name, ms): await asyncio.sleep(ms / 1000); return name`.",
            "`await asyncio.gather(*(mirror(n, ms) for n, ms in pairs))`.",
            "Second gather: `asyncio.wait_for(mirror(n, ms), timeout=0.05)` for each, with return_exceptions=True.",
            "Keep results where `isinstance(r, str)`.",
          ],
          solution: r`import asyncio

async def mirror(name, ms):
    await asyncio.sleep(ms / 1000)
    return name

async def main():
    pairs = []
    while (line := input()) != "end":
        name, ms = line.split()
        pairs.append((name, int(ms)))
    names = await asyncio.gather(*(mirror(n, ms) for n, ms in pairs))
    print("all:", " ".join(names))
    quick = await asyncio.gather(
        *(asyncio.wait_for(mirror(n, ms), timeout=0.05) for n, ms in pairs),
        return_exceptions=True,
    )
    print("within 50ms:", " ".join(r for r in quick if isinstance(r, str)))

asyncio.run(main())`,
          notes: "The whole first gather takes about as long as the slowest mirror; the second takes about 50 ms because slow ones are cancelled by their timeouts.",
        },
        {
          id: "stretch", kind: "task", title: "Graceful shutdown", difficulty: 4,
          prompt: `Start N background \`poller\` tasks (N from input). Each loops forever: \`await asyncio.sleep(0.01)\`, counting its polls. On cancellation a poller must print \`poller i stopped\` in a \`finally\` block and **re-raise**. After 0.035 s, \`main\` cancels all pollers, waits for them with \`gather(..., return_exceptions=True)\`, and prints \`all cancelled: True\` if every task reports \`cancelled()\`.`,
          starter: r`import asyncio
`,
          tests: [
            { label: "Two pollers", input: "2\n", output: "poller 0 stopped\npoller 1 stopped\nall cancelled: True" },
            { label: "Three", input: "3\n", output: "poller 0 stopped\npoller 1 stopped\npoller 2 stopped\nall cancelled: True", hidden: true },
          ],
          hints: [
            "`tasks = [asyncio.create_task(poller(i)) for i in range(n)]`.",
            "poller: try/while True/await sleep, finally: print.",
            "Cancel each task, then `await asyncio.gather(*tasks, return_exceptions=True)`.",
            "`all(t.cancelled() for t in tasks)`.",
          ],
          solution: r`import asyncio

async def poller(i):
    polls = 0
    try:
        while True:
            await asyncio.sleep(0.01)
            polls += 1
    finally:
        print(f"poller {i} stopped")

async def main():
    n = int(input())
    tasks = [asyncio.create_task(poller(i)) for i in range(n)]
    await asyncio.sleep(0.035)
    for t in tasks:
        t.cancel()
    await asyncio.gather(*tasks, return_exceptions=True)
    print("all cancelled:", all(t.cancelled() for t in tasks))

asyncio.run(main())`,
          notes: "This is how servers shut down cleanly: cancel the background tasks, let each run its finally block, and wait for all of them before exiting. Since there's no `except` here, CancelledError propagates automatically.",
        },
      ],
      realWorld: "API gateways fan out to several microservices with gather and per-call timeouts; crawlers cap total time with wait_for; servers cancel background tasks on shutdown so connections close cleanly.",
      reteach: "create_task is putting a pot on the stove and walking away; await is coming back to check it. gather is putting all the pots on at once and serving when the last is done — on plates in the order you planned, not the order they finished. A timeout is a kitchen timer that pulls the pot off the heat; cancel() is telling the cook to stop — they still get to clean the pan (finally).",
      summary: [
        "create_task starts work concurrently; gather runs many and returns results in argument order.",
        "return_exceptions=True collects failures as values; TaskGroup (3.11+) is the structured alternative.",
        "Use wait_for timeouts on external calls; cancellation raises CancelledError — clean up in finally and re-raise.",
      ],
      version: "TimeoutError alias: 3.11+ (asyncio.TimeoutError before); TaskGroup and asyncio.timeout: 3.11+",
    },

    {
      id: "py-async-patterns",
      title: "Async context managers, iterators and patterns",
      minutes: 17,
      difficulty: 4,
      objectives: [
        "Use and write `async with` and `async for`",
        "Write async generators",
        "Limit concurrency with a Semaphore and use asyncio.Queue",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "An async context manager defines which methods?",
        options: [
          { text: "__enter__ and __exit__", why: "Those are for the normal `with`." },
          { text: "__aenter__ and __aexit__ (both coroutines)", why: "Correct." },
          { text: "__aiter__ and __anext__", why: "Those make an async iterator." },
        ],
        answer: 1,
        hint: "a for async.",
        explain: "`async with` awaits `__aenter__` on entry and `__aexit__` on exit, so opening and closing can do I/O.",
      },
      why: "Real async code opens connections, streams data and must not overwhelm servers. `async with` makes sure connections close, `async for` streams results as they arrive, and a semaphore keeps you polite — e.g. no more than 5 requests at once.",
      concept: [
        {
          title: "async with and async for",
          body: `\`\`\`python
async with session.get(url) as response:   # awaits setup and teardown
    async for chunk in response.content:     # each item may need I/O
        ...
\`\`\`

- Async context manager: \`async def __aenter__\` / \`async def __aexit__\`, or \`@contextlib.asynccontextmanager\`.
- Async iterator: \`__aiter__\` returning an object with \`async def __anext__\` that raises \`StopAsyncIteration\`.
- Easiest: an **async generator** — an \`async def\` containing \`yield\`.`,
        },
        {
          title: "Patterns: semaphore, queue, to_thread",
          body: `\`\`\`python
limit = asyncio.Semaphore(5)
async def polite_fetch(url):
    async with limit:              # at most 5 inside at once
        return await fetch(url)

q = asyncio.Queue()                # producer/consumer between tasks
await q.put(item); item = await q.get()

data = await asyncio.to_thread(blocking_function, arg)   # run sync code without blocking the loop
\`\`\`

**Async I/O in practice** needs async libraries: httpx/aiohttp (HTTP), asyncpg (Postgres), aiofiles (files). A normal blocking library inside \`async def\` defeats the purpose.`,
        },
      ],
      example: {
        title: "A rate-limited stream of results",
        code: r`import asyncio
from contextlib import asynccontextmanager

@asynccontextmanager
async def connection(name):
    print(f"open {name}")
    try:
        yield f"<{name}>"
    finally:
        print(f"close {name}")

async def numbers(limit):
    for n in range(limit):
        await asyncio.sleep(0)
        yield n * n

active = 0
peak = 0
async def fetch(i, sem):
    global active, peak
    async with sem:
        active += 1
        peak = max(peak, active)
        await asyncio.sleep(0.01)
        active -= 1
        return i

async def main():
    async with connection("db") as conn:
        print("using", conn)
    print([n async for n in numbers(4)])
    sem = asyncio.Semaphore(2)
    results = await asyncio.gather(*(fetch(i, sem) for i in range(6)))
    print(results, "peak concurrency:", peak)

asyncio.run(main())`,
        output: "open db\nusing <db>\nclose db\n[0, 1, 4, 9]\n[0, 1, 2, 3, 4, 5] peak concurrency: 2\n",
        lines: [
          [4, "asynccontextmanager turns an async generator into an `async with` manager."],
          [9, "finally guarantees the connection closes, even on errors."],
          [12, "An async generator: `async def` with `yield`."],
          [21, "The semaphore admits at most 2 tasks into this block at once."],
          [31, "An async comprehension consumes the async generator."],
          [33, "Six fetches are gathered, but the peak number running at once is 2."],
        ],
      },
      mistakes: [
        { title: "Using `for` on an async iterator", body: "A plain `for` raises TypeError; use `async for` (inside async code)." },
        { title: "Unbounded fan-out", body: "gather over 10,000 URLs opens 10,000 connections at once. Limit with a Semaphore or a worker pool on an asyncio.Queue." },
        { title: "Sync libraries in async code", body: "`requests.get` blocks the loop. Use an async client or `asyncio.to_thread`." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`import asyncio
async def countdown(n):
    while n > 0:
        yield n
        n -= 1
        await asyncio.sleep(0)
async def main():
    async for x in countdown(3):
        print(x, end=" ")
    print("liftoff")
asyncio.run(main())`,
          answer: "3 2 1 liftoff\n",
          hint: "An async generator yields like a normal one.",
          explain: "async for receives 3, 2, 1, then the generator ends and 'liftoff' prints.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Allow at most 3 tasks into the block at once.",
          code: r`import asyncio
sem = asyncio.___(3)
print(type(sem).__name__)`,
          blanks: [["Semaphore"]],
          output: "Semaphore\n",
          hint: "A counter-based lock.",
          explain: "`asyncio.Semaphore(3)` lets three holders in at a time.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "This raises TypeError. Which line needs fixing?",
          code: r`import asyncio
async def lines():
    for text in ["a", "b"]:
        await asyncio.sleep(0)
        yield text
async def main():
    for line in lines():
        print(line)
asyncio.run(main())`,
          line: 7,
          fix: r`import asyncio
async def lines():
    for text in ["a", "b"]:
        await asyncio.sleep(0)
        yield text
async def main():
    async for line in lines():
        print(line)
asyncio.run(main())`,
          output: "a\nb\n",
          hint: "The generator is async.",
          explain: "An async generator must be consumed with `async for`.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "You must call an old blocking library function from async code. Best option?",
          options: [
            { text: "Call it directly", why: "Blocks the event loop." },
            { text: "`await asyncio.to_thread(func, arg)`", why: "Correct: it runs in a worker thread." },
            { text: "Wrap it in async def", why: "Still blocks — async def doesn't make code non-blocking." },
          ],
          answer: 1,
          hint: "Move the blocking work off the loop's thread.",
          explain: "asyncio.to_thread (3.9+) runs the function in a thread and lets you await the result.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Async paginated reader", difficulty: 3,
          prompt: `Simulate an API that returns pages: \`get_page(n)\` awaits \`asyncio.sleep(0)\` and returns \`ITEMS[n*3:(n+1)*3]\` from a list of item names read from input (one line, space-separated). Write an **async generator** \`all_items()\` that requests pages 0, 1, 2… until an empty page, yielding each item. In main, use \`async for\` to print each item as \`- item\`, then \`pages fetched: N\` (counting the final empty page).`,
          starter: r`import asyncio
`,
          tests: [
            { label: "Seven items", input: "a b c d e f g\n", output: "- a\n- b\n- c\n- d\n- e\n- f\n- g\npages fetched: 4" },
            { label: "Exactly one page", input: "x y z\n", output: "- x\n- y\n- z\npages fetched: 2", hidden: true },
          ],
          hints: [
            "Keep a global/outer counter incremented in get_page.",
            "all_items: `page = 0; while True: items = await get_page(page); if not items: return; for it in items: yield it; page += 1`.",
            "In main: `async for item in all_items(): print(\"-\", item)`.",
            "Read ITEMS with `input().split()` before asyncio.run.",
          ],
          solution: r`import asyncio

ITEMS = input().split()
fetches = 0

async def get_page(n):
    global fetches
    fetches += 1
    await asyncio.sleep(0)
    return ITEMS[n * 3:(n + 1) * 3]

async def all_items():
    page = 0
    while True:
        items = await get_page(page)
        if not items:
            return
        for item in items:
            yield item
        page += 1

async def main():
    async for item in all_items():
        print("-", item)
    print("pages fetched:", fetches)

asyncio.run(main())`,
          notes: "The caller sees one simple stream of items; the pagination logic is hidden in the async generator. Real API clients (Module 32) use exactly this shape.",
        },
        {
          id: "stretch", kind: "task", title: "Worker pool on an asyncio.Queue", difficulty: 4,
          prompt: `Read job sizes (integers) until \`end\`. Put them on an \`asyncio.Queue\`. Start **3 worker tasks**; each repeatedly takes a job, "processes" it with \`await asyncio.sleep(size / 1000)\`, records \`size * 2\` into \`results[index]\`, and calls \`task_done()\`. Use \`await queue.join()\` to wait until all jobs are processed, then cancel the workers. Print the results list and \`processed N\`.`,
          starter: r`import asyncio
`,
          tests: [
            { label: "Five jobs", input: "5\n1\n9\n3\n2\nend\n", output: "[10, 2, 18, 6, 4]\nprocessed 5" },
            { label: "No jobs", input: "end\n", output: "[]\nprocessed 0", hidden: true, category: "edge" },
          ],
          hints: [
            "Put (index, size) tuples on the queue.",
            "Worker: `while True: i, size = await q.get(); ...; q.task_done()`.",
            "`await q.join()` waits until task_done was called for every item.",
            "Cancel workers and gather them with return_exceptions=True.",
          ],
          solution: r`import asyncio

async def worker(q, results):
    while True:
        i, size = await q.get()
        await asyncio.sleep(size / 1000)
        results[i] = size * 2
        q.task_done()

async def main():
    sizes = []
    while (line := input()) != "end":
        sizes.append(int(line))
    q = asyncio.Queue()
    for item in enumerate(sizes):
        q.put_nowait(item)
    results = [None] * len(sizes)
    workers = [asyncio.create_task(worker(q, results)) for _ in range(3)]
    await q.join()
    for w in workers:
        w.cancel()
    await asyncio.gather(*workers, return_exceptions=True)
    print(results)
    print("processed", sum(r is not None for r in results))

asyncio.run(main())`,
          notes: "A fixed pool of workers on a queue is the standard way to bound concurrency for thousands of jobs. Results are stored by index, so the output order never depends on timing.",
        },
      ],
      realWorld: "aiohttp/httpx sessions are async context managers; database drivers stream rows with async for; crawlers combine a Semaphore with per-host limits so they don't overload websites.",
      reteach: "`async with` is a door that may take a moment to unlock and lock (connecting, disconnecting) — the loop helps others while you wait at it. `async for` is a conveyor belt where each next box might need a delivery van. A Semaphore is a nightclub bouncer letting only N people in at a time.",
      summary: [
        "async with → __aenter__/__aexit__ (or @asynccontextmanager); async for → __aiter__/__anext__ or async generators.",
        "Bound concurrency with Semaphore or a worker pool on asyncio.Queue (join + task_done).",
        "Use async libraries for I/O; push unavoidable blocking calls to asyncio.to_thread.",
      ],
      libraryCode: [{
        title: "Real concurrent HTTP with httpx",
        code: `import asyncio, httpx

async def main(urls):
    limit = asyncio.Semaphore(5)
    async with httpx.AsyncClient(timeout=10) as client:
        async def get(url):
            async with limit:
                r = await client.get(url)
                return url, r.status_code
        for url, status in await asyncio.gather(*(get(u) for u in urls)):
            print(status, url)

asyncio.run(main(["https://example.com", "https://www.python.org"]))`,
        note: "Needs `pip install httpx` and internet access — run on your own computer. The sandbox has no network, so exercises simulate I/O with asyncio.sleep; the async structure is the same.",
      }],
    },
  ],
  exam: [
    {
      id: "e1", kind: "mcq", difficulty: 4,
      prompt: "Which statement about asyncio is true?",
      options: [
        { text: "Tasks run in parallel on several CPU cores", why: "One thread, one task at a time." },
        { text: "A task switches only at an await point", why: "Correct." },
        { text: "async def makes blocking code non-blocking", why: "It doesn't; blocking calls still block." },
      ],
      answer: 1,
      hint: "Cooperative multitasking.",
      explain: "The event loop switches tasks only when the running one awaits something that isn't ready.",
    },
    {
      id: "e2", kind: "predict", difficulty: 4,
      code: r`import asyncio
async def step(name, d):
    await asyncio.sleep(d)
    print(name)
async def main():
    t = asyncio.create_task(step("background", 0.05))
    await step("foreground", 0.01)
    await t
    print("end")
asyncio.run(main())`,
      answer: "foreground\nbackground\nend\n",
      hint: "Both run concurrently; which sleep is shorter?",
      explain: "The background task starts, foreground finishes its 0.01 s sleep first, then background at 0.05 s, then 'end'.",
    },
    {
      id: "e3", kind: "fill", difficulty: 3,
      prompt: "Run several coroutines concurrently and collect results in order.",
      code: r`import asyncio
async def sq(x):
    await asyncio.sleep(0)
    return x * x
async def main():
    print(await asyncio.___(sq(2), sq(3)))
asyncio.run(main())`,
      blanks: [["gather"]],
      output: "[4, 9]\n",
      hint: "Gather them up.",
      explain: "`asyncio.gather` runs awaitables concurrently and returns their results in argument order.",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: async price aggregator (simulated)", difficulty: 4,
    prompt: `Compare a product's price across shops concurrently. Input: lines \`shop delay_ms price\` until \`end\` (price may be \`ERR\` meaning the shop's API fails).

- \`quote(shop, delay_ms, price)\`: awaits \`asyncio.sleep(delay_ms / 1000)\`; raises \`ConnectionError\` if price is \`ERR\`; returns \`(shop, float(price))\`.
- Query all shops concurrently, **at most 2 at a time** (Semaphore), each with a **timeout of 0.1 s**.
- Print each shop in input order: \`shop: ₹price\` (2 decimals), \`shop: unavailable\` (ConnectionError) or \`shop: timeout\`.
- Then \`best: shop ₹price\` (lowest; first shop wins a tie) or \`best: none\`.`,
    starter: r`import asyncio
`,
    tests: [
      { label: "Mixed", input: "alpha 20 499\nbeta 300 450\ngamma 10 ERR\ndelta 30 479.5\nend\n", output: "alpha: ₹499.00\nbeta: timeout\ngamma: unavailable\ndelta: ₹479.50\nbest: delta ₹479.50" },
      { label: "All fail", input: "x 5 ERR\nend\n", output: "x: unavailable\nbest: none", hidden: true, category: "edge" },
    ],
    hints: [
      "Wrap quote in a helper that does `async with sem: return await asyncio.wait_for(quote(...), 0.1)`.",
      "gather with return_exceptions=True keeps results in input order.",
      "Check isinstance(result, TimeoutError) / ConnectionError / tuple.",
      "min over the successful tuples with key=price — min keeps the first on ties.",
    ],
    solution: r`import asyncio

async def quote(shop, delay_ms, price):
    await asyncio.sleep(delay_ms / 1000)
    if price == "ERR":
        raise ConnectionError(f"{shop} API failed")
    return shop, float(price)

async def main():
    rows = []
    while (line := input()) != "end":
        shop, delay, price = line.split()
        rows.append((shop, int(delay), price))
    sem = asyncio.Semaphore(2)

    async def limited(shop, delay, price):
        async with sem:
            return await asyncio.wait_for(quote(shop, delay, price), timeout=0.1)

    results = await asyncio.gather(*(limited(*row) for row in rows), return_exceptions=True)
    good = []
    for (shop, _, _), res in zip(rows, results):
        if isinstance(res, TimeoutError):
            print(f"{shop}: timeout")
        elif isinstance(res, ConnectionError):
            print(f"{shop}: unavailable")
        else:
            good.append(res)
            print(f"{shop}: ₹{res[1]:.2f}")
    if good:
        shop, price = min(good, key=lambda sp: sp[1])
        print(f"best: {shop} ₹{price:.2f}")
    else:
        print("best: none")

asyncio.run(main())`,
    notes: "Concurrency limit, per-call timeout, failure isolation and deterministic output order — the core of any real aggregator. Before using it for real you'd add retries with backoff, caching, real HTTP clients and respect for each shop's API terms.",
  },
};
