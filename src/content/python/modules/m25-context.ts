import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 25 — Context managers. */
export const M25: PyModuleDef = {
  id: "py-context",
  number: 25,
  level: 4,
  title: "Context Managers",
  summary: "The with statement; __enter__ and __exit__; writing custom context managers; contextlib and generator-based context managers; resource cleanup; handling exceptions inside context managers.",
  track: "core",
  prereqs: ["py-typing"],
  lessons: [
    {
      id: "py-with-protocol",
      title: "The with statement, __enter__ and __exit__",
      minutes: 16,
      difficulty: 3,
      objectives: [
        "Explain what `with` guarantees",
        "Write a class-based context manager with `__enter__` and `__exit__`",
        "Decide whether __exit__ should suppress an exception",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "If an exception happens inside `with open(...) as f:`, is the file closed?",
        options: [
          { text: "No, you must close it in except", why: "with handles it." },
          { text: "Yes — the context manager's exit code always runs", why: "Correct." },
          { text: "Only if you call f.close()", why: "with calls it for you." },
        ],
        answer: 1,
        hint: "That's the whole point of with.",
        explain: "`with` guarantees __exit__ runs whether the block finishes normally or with an exception.",
      },
      why: "Resources — files, network connections, locks, database transactions, temporary changes — must be released even when errors happen. Context managers package 'set up, then always clean up' into one reusable, readable construct.",
      concept: [
        {
          title: "What with does",
          body: `\`\`\`python
with manager as value:
    body
\`\`\`

is roughly:

\`\`\`python
value = manager.__enter__()
try:
    body
except BaseException as e:
    if not manager.__exit__(type(e), e, e.__traceback__):
        raise              # re-raised unless __exit__ returned True
else:
    manager.__exit__(None, None, None)
\`\`\``,
        },
        {
          title: "Writing one",
          body: `\`\`\`python
class Timer:
    def __enter__(self):
        self.start = time.perf_counter()
        return self                 # becomes the 'as' value
    def __exit__(self, exc_type, exc, tb):
        self.elapsed = time.perf_counter() - self.start
        return False                # don't suppress exceptions
\`\`\`

Return a **true** value from __exit__ only if you deliberately want to swallow the exception (rare). Several managers: \`with open(a) as f, open(b) as g:\`.`,
        },
      ],
      example: {
        title: "A temporary setting and an error-tolerant block",
        code: r`class Settings:
    values = {"mode": "normal"}

class TemporarySetting:
    def __init__(self, key, value):
        self.key, self.value = key, value
    def __enter__(self):
        self.old = Settings.values[self.key]
        Settings.values[self.key] = self.value
        return self.value
    def __exit__(self, exc_type, exc, tb):
        Settings.values[self.key] = self.old
        print(f"restored {self.key}={self.old}" + (f" after {exc_type.__name__}" if exc_type else ""))
        return False

with TemporarySetting("mode", "exam") as m:
    print("inside:", m, Settings.values["mode"])
try:
    with TemporarySetting("mode", "debug"):
        raise ValueError("boom")
except ValueError:
    print("error still propagated")

class Ignore:
    def __init__(self, *types):
        self.types = types
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc, tb):
        return exc_type is not None and issubclass(exc_type, self.types)

with Ignore(ZeroDivisionError):
    print(1 / 0)
print("continued; mode is", Settings.values["mode"])`,
        output: "inside: exam exam\nrestored mode=normal\nrestored mode=normal after ValueError\nerror still propagated\ncontinued; mode is normal\n",
        lines: [
          [7, "__enter__ saves the old value, applies the new one, and returns what `as` receives."],
          [11, "__exit__ always restores — normal exit or exception."],
          [14, "Returning False lets any exception continue upwards."],
          [20, "The exception still reaches the outer except, but only after cleanup."],
          [30, "Returning True suppresses the exception — only for the listed types."],
          [32, "The ZeroDivisionError is swallowed and execution continues after the with."],
        ],
      },
      mistakes: [
        { title: "Accidentally suppressing errors", body: "If __exit__ returns a truthy value (even by accident), exceptions vanish. Return False/None unless suppression is the goal." },
        { title: "Forgetting to return a value from __enter__", body: "`with X() as x:` gives x = None if __enter__ has no return." },
        { title: "Doing cleanup in __del__", body: "Object destruction timing isn't guaranteed. Context managers give deterministic cleanup." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`class Tag:
    def __init__(self, name):
        self.name = name
    def __enter__(self):
        print(f"<{self.name}>", end="")
        return self
    def __exit__(self, *exc):
        print(f"</{self.name}>", end="")
with Tag("b"):
    with Tag("i"):
        print("hi", end="")
print()`,
          answer: "<b><i>hi</i></b>\n",
          hint: "Exits happen in reverse order of entries.",
          explain: "Nested context managers enter outer-then-inner and exit inner-then-outer.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Return the object so `as r` receives it.",
          code: r`class Resource:
    def __enter__(self):
        print("open")
        return ___
    def __exit__(self, *exc):
        print("close")
with Resource() as r:
    print(type(r).__name__)`,
          blanks: [["self"]],
          output: "open\nResource\nclose\n",
          hint: "The context manager itself.",
          explain: "Returning self from __enter__ makes `as r` bind the manager object.",
        },
        {
          id: "b1", kind: "bug", difficulty: 4,
          prompt: "A KeyError inside the block disappears silently. Which line causes it?",
          code: r`class Logged:
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc, tb):
        print("leaving block")
        return True
try:
    with Logged():
        {}["missing"]
    print("no error seen")
except KeyError:
    print("KeyError reported")`,
          line: 6,
          fix: r`class Logged:
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc, tb):
        print("leaving block")
        return False
try:
    with Logged():
        {}["missing"]
    print("no error seen")
except KeyError:
    print("KeyError reported")`,
          output: "leaving block\nKeyError reported\n",
          hint: "What does returning True from __exit__ mean?",
          explain: "A true return value suppresses the exception. A logging context manager should return False so errors propagate.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "Which resource is a good fit for a context manager?",
          options: [
            { text: "A lock that must be released", why: "Correct — `with lock:` always releases." },
            { text: "A constant like PI", why: "Nothing to set up or release." },
            { text: "A pure function", why: "No resource to manage." },
          ],
          answer: 0,
          hint: "Acquire/release pairs.",
          explain: "Anything with a setup/teardown pair — files, locks, connections, transactions — fits.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Indented printer", difficulty: 3,
          prompt: `Write a context manager class \`Indent\` that increases the shared \`level\` by 2 spaces on enter and decreases it on exit. The given \`say(text)\` prints text at the current indentation, and the given nested \`with\` blocks should produce:

\`\`\`
Chapter 1
  Section 1.1
    Detail
  Section 1.2
Chapter 2
\`\`\``,
          starter: r`level = 0

class Indent:
    pass

def say(text):
    print(" " * level + text)

say("Chapter 1")
with Indent():
    say("Section 1.1")
    with Indent():
        say("Detail")
    say("Section 1.2")
say("Chapter 2")`,
          tests: [{ label: "Outline", input: "", output: "Chapter 1\n  Section 1.1\n    Detail\n  Section 1.2\nChapter 2" }],
          hints: [
            "__enter__ adds 2 to the global level; __exit__ subtracts 2.",
            "Use `global level` inside both methods.",
            "__exit__ should return False (or nothing).",
            "The provided code uses nested `with` blocks — you only need to write the class.",
          ],
          solution: r`level = 0

class Indent:
    def __enter__(self):
        global level
        level += 2
        return self

    def __exit__(self, exc_type, exc, tb):
        global level
        level -= 2
        return False

def say(text):
    print(" " * level + text)

say("Chapter 1")
with Indent():
    say("Section 1.1")
    with Indent():
        say("Detail")
    say("Section 1.2")
say("Chapter 2")`,
          notes: "Because __exit__ always runs, the indentation can never be left 'stuck' — even if code inside a block raised an error.",
        },
        {
          id: "stretch", kind: "task", title: "Transaction context manager", difficulty: 4,
          prompt: `Write \`Transaction(account)\` for a dict-based account \`{"balance": N}\`: on enter, snapshot the balance; on exit, if an exception occurred, roll back to the snapshot and print \`rolled back\`, else print \`committed\`. Don't suppress the exception. Apply operations \`+N\`/\`-N\` from each input line (one transaction per line, operations space-separated) until \`end\`; a withdrawal that would make the balance negative raises ValueError (catch it outside and print \`error: insufficient\`). Print the balance after each line. Start at 100.`,
          starter: r`account = {"balance": 100}
`,
          tests: [
            { label: "Lines", input: "+50 -30\n-500 +10\n-20\nend\n", output: "committed\n120\nrolled back\nerror: insufficient\n120\ncommitted\n100" },
          ],
          hints: [
            "__enter__ stores `self.snapshot = account[\"balance\"]`.",
            "__exit__: if exc_type is not None, restore and print rolled back; else print committed. Return False.",
            "Apply operations inside the with block; raise ValueError when the balance would go negative.",
            "Wrap each with block in try/except ValueError to print the error, then print the balance.",
          ],
          solution: r`account = {"balance": 100}

class Transaction:
    def __init__(self, acct):
        self.acct = acct

    def __enter__(self):
        self.snapshot = self.acct["balance"]
        return self.acct

    def __exit__(self, exc_type, exc, tb):
        if exc_type is not None:
            self.acct["balance"] = self.snapshot
            print("rolled back")
        else:
            print("committed")
        return False

while (line := input()) != "end":
    try:
        with Transaction(account) as acct:
            for op in line.split():
                amount = int(op)
                if acct["balance"] + amount < 0:
                    raise ValueError("insufficient")
                acct["balance"] += amount
    except ValueError as e:
        print("error:", e)
    print(account["balance"])`,
          notes: "On '-500 +10' nothing partial survives: the rollback restores 120. Database libraries implement `with connection:` the same way (commit on success, rollback on error).",
        },
      ],
      realWorld: "`with open(...)`, `with lock:`, `with sqlite3.connect(...) as conn:` (transaction), `with tempfile.TemporaryDirectory()`, `with patch(...)` in tests and `with tracer.start_span(...)` in observability tools are everyday context managers.",
      reteach: "A context manager is a hotel check-in desk: __enter__ hands you the room key and sets things up, and __exit__ is checkout that always happens — even if you leave in a hurry (an exception). It can tidy the room, and it decides whether to let the hurry continue (return False) or quietly calm it down (return True).",
      summary: [
        "`with` calls __enter__ (its return value is the `as` target) and always calls __exit__.",
        "__exit__(exc_type, exc, tb) runs cleanup; returning True suppresses the exception — usually return False.",
        "Use context managers for any setup/cleanup pair: files, locks, transactions, temporary changes.",
      ],
      cpp: {
        python: r`with open("a.txt") as f:
    data = f.read()   # closed after the block`,
        cpp: r`{
    std::ifstream f("a.txt");
    // ... read ...
}   // destructor closes the file (RAII)`,
        note: "C++ ties cleanup to object lifetime (RAII destructors at scope end); Python ties it to the with block.",
      },
    },

    {
      id: "py-contextlib",
      title: "contextlib and generator-based context managers",
      minutes: 16,
      difficulty: 4,
      objectives: [
        "Write context managers as generators with `@contextmanager`",
        "Handle exceptions correctly around `yield`",
        "Use contextlib helpers: suppress, redirect_stdout, ExitStack, closing",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "In a `@contextmanager` generator, what plays the role of the with-block's body?",
        options: [
          { text: "The return statement", why: "The function yields, it doesn't return the value." },
          { text: "The single `yield`", why: "Correct — code before it is enter, after it is exit." },
          { text: "A nested function", why: "Not needed." },
        ],
        answer: 1,
        hint: "The generator pauses while the block runs.",
        explain: "Code before yield runs on enter; the yielded value is the `as` target; code after yield runs on exit.",
      },
      why: "Most context managers are just 'do X, then the block, then undo X'. contextlib lets you write that as one short function instead of a class, and provides ready-made managers for common jobs.",
      concept: [
        {
          title: "@contextmanager",
          body: `\`\`\`python
from contextlib import contextmanager

@contextmanager
def cd(path):
    old = os.getcwd()
    os.chdir(path)
    try:
        yield path            # the with-block runs here
    finally:
        os.chdir(old)         # always runs
\`\`\`

The **try/finally around yield** is essential: an exception in the with-block is raised at the yield, and without finally the cleanup would be skipped.`,
        },
        {
          title: "Ready-made helpers",
          body: `\`\`\`python
from contextlib import suppress, redirect_stdout, ExitStack, closing, nullcontext
with suppress(FileNotFoundError):
    os.remove("tmp.txt")
buf = io.StringIO()
with redirect_stdout(buf):
    print("captured")
with ExitStack() as stack:                       # a dynamic number of managers
    files = [stack.enter_context(open(p)) for p in paths]
with closing(resource):                          # calls resource.close() at the end
    ...
\`\`\`

Async code has \`async with\` and \`@asynccontextmanager\` (Module 27).`,
        },
      ],
      example: {
        title: "Small managers, big guarantees",
        code: r`import io, os
from contextlib import contextmanager, suppress, redirect_stdout, ExitStack

@contextmanager
def tag(name):
    print(f"<{name}>")
    try:
        yield name.upper()
    finally:
        print(f"</{name}>")

with tag("section") as t:
    print("inside", t)
try:
    with tag("risky"):
        raise RuntimeError("oops")
except RuntimeError as e:
    print("caught", e)
with suppress(FileNotFoundError):
    os.remove("does-not-exist.txt")
    print("never printed")
buffer = io.StringIO()
with redirect_stdout(buffer):
    print("hidden output")
print("captured:", buffer.getvalue().strip())
with ExitStack() as stack:
    names = [stack.enter_context(tag(n)) for n in ["a", "b"]]
    print("open:", names)`,
        output: "<section>\ninside SECTION\n</section>\n<risky>\n</risky>\ncaught oops\ncaptured: hidden output\n<a>\n<b>\nopen: ['A', 'B']\n</b>\n</a>\n",
        lines: [
          [4, "@contextmanager turns a generator into a context manager."],
          [7, "try/finally around yield: cleanup runs even if the block raises."],
          [8, "The yielded value is what `as` receives."],
          [14, "The RuntimeError is raised at the yield, cleanup prints, then it propagates."],
          [19, "suppress ignores just the listed exception (here: the missing file)."],
          [23, "redirect_stdout captures print output into a buffer."],
          [26, "ExitStack enters a variable number of managers and exits them in reverse order."],
        ],
      },
      mistakes: [
        { title: "No try/finally around yield", body: "Without it, an exception in the block skips your cleanup code." },
        { title: "Yielding more than once", body: "A @contextmanager generator must yield exactly once (RuntimeError otherwise)." },
        { title: "Over-broad suppress", body: "`suppress(Exception)` hides real bugs. Name the specific exception." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 4,
          code: r`from contextlib import contextmanager
@contextmanager
def step(n):
    print("start", n)
    yield n * 10
    print("end", n)
with step(1) as a, step(2) as b:
    print(a + b)`,
          answer: "start 1\nstart 2\n30\nend 2\nend 1\n",
          hint: "Multiple managers in one with nest left to right.",
          explain: "Both enter in order, the body prints 10 + 20, then they exit in reverse order.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Ignore a missing key without try/except.",
          code: r`from contextlib import suppress
d = {}
with ___(KeyError):
    print(d["x"])
print("still running")`,
          blanks: [["suppress"]],
          output: "still running\n",
          hint: "A contextlib helper that swallows specific exceptions.",
          explain: "`suppress(KeyError)` ignores KeyError raised in the block.",
        },
        {
          id: "b1", kind: "bug", difficulty: 4,
          prompt: "When the block raises, the 'unlocked' message never appears (the lock stays held). Which line is missing protection?",
          code: r`from contextlib import contextmanager
@contextmanager
def locked(name):
    print("locked", name)
    yield
    print("unlocked", name)
try:
    with locked("db"):
        raise ValueError("bad write")
except ValueError:
    print("handled")`,
          line: 5,
          fix: r`from contextlib import contextmanager
@contextmanager
def locked(name):
    print("locked", name)
    try:
        yield
    finally:
        print("unlocked", name)
try:
    with locked("db"):
        raise ValueError("bad write")
except ValueError:
    print("handled")`,
          output: "locked db\nunlocked db\nhandled\n",
          hint: "Where does the exception appear inside the generator?",
          explain: "The block's exception is raised at the yield; without try/finally the cleanup line never runs.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "You need to open a list of files whose length is only known at run time, all closed safely. Use…",
          options: [
            { text: "Nested with statements", why: "You can't nest an unknown number of them." },
            { text: "contextlib.ExitStack", why: "Correct." },
            { text: "contextlib.suppress", why: "That ignores exceptions; it doesn't manage multiple resources." },
          ],
          answer: 1,
          hint: "A stack of exits.",
          explain: "ExitStack.enter_context registers each manager; all exit in reverse order.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Timing block with a fake clock", difficulty: 3,
          prompt: `Write \`@contextmanager def timed(label, clock)\` that reads \`clock()\` before and after the block and prints \`LABEL took N ms\` (end − start), even if the block raises. The given code uses a fake clock that returns 0, 120, 120, 450… so output is deterministic.`,
          starter: r`from contextlib import contextmanager

ticks = iter([0, 120, 120, 450])
fake_clock = lambda: next(ticks)

@contextmanager
def timed(label, clock):
    yield

with timed("load", fake_clock):
    pass
try:
    with timed("save", fake_clock):
        raise IOError("disk full")
except IOError as e:
    print("error:", e)`,
          tests: [{ label: "Two blocks", input: "", output: "load took 120 ms\nsave took 330 ms\nerror: disk full" }],
          hints: [
            "Read `start = clock()` before yielding.",
            "Wrap the yield in try/finally.",
            "In finally: `print(f\"{label} took {clock() - start} ms\")`.",
            "Don't catch the exception — let it propagate.",
          ],
          solution: r`from contextlib import contextmanager

ticks = iter([0, 120, 120, 450])
fake_clock = lambda: next(ticks)

@contextmanager
def timed(label, clock):
    start = clock()
    try:
        yield
    finally:
        print(f"{label} took {clock() - start} ms")

with timed("load", fake_clock):
    pass
try:
    with timed("save", fake_clock):
        raise IOError("disk full")
except IOError as e:
    print("error:", e)`,
          notes: "Injecting the clock (Module 23) makes timing code testable. In real code you'd pass `time.perf_counter` and multiply by 1000.",
        },
        {
          id: "stretch", kind: "task", title: "Capture and check output", difficulty: 4,
          prompt: `Write \`@contextmanager def captured()\` that yields a list and, while active, redirects stdout so everything printed is stored (as lines) in that list. Use it to run the learner-style function \`show_table(n)\` for each input n until \`end\`, printing \`n: K lines, last=LINE\`.`,
          starter: r`import io
from contextlib import contextmanager, redirect_stdout

def show_table(n):
    for i in range(1, n + 1):
        print(f"{n} x {i} = {n * i}")
`,
          tests: [
            { label: "Tables", input: "3\n1\nend\n", output: "3: 3 lines, last=3 x 3 = 9\n1: 1 lines, last=1 x 1 = 1" },
          ],
          hints: [
            "Create `buf = io.StringIO()` and `lines = []`.",
            "Inside a try/finally: `with redirect_stdout(buf): yield lines`.",
            "In finally: `lines.extend(buf.getvalue().splitlines())`.",
            "After the with block, the list is filled; print the summary.",
          ],
          solution: r`import io
from contextlib import contextmanager, redirect_stdout

def show_table(n):
    for i in range(1, n + 1):
        print(f"{n} x {i} = {n * i}")

@contextmanager
def captured():
    buf = io.StringIO()
    lines = []
    try:
        with redirect_stdout(buf):
            yield lines
    finally:
        lines.extend(buf.getvalue().splitlines())

while (line := input()) != "end":
    n = int(line)
    with captured() as out:
        show_table(n)
    print(f"{n}: {len(out)} lines, last={out[-1]}")`,
          notes: "Managers compose: captured() uses redirect_stdout inside. Test frameworks capture output exactly like this (pytest's capsys).",
        },
      ],
      realWorld: "Flask's `app.app_context()`, pytest's `monkeypatch`/`capsys`, `unittest.mock.patch`, database sessions and OpenTelemetry spans are context managers — many written with @contextmanager.",
      reteach: "@contextmanager lets you write a context manager as one story: 'set up… (yield: now the visitor does their thing)… clean up'. Wrapping the yield in try/finally is like putting the cleanup instructions on the door — even someone running out in a panic triggers them.",
      summary: [
        "@contextmanager: code before yield = enter, yielded value = `as` target, code after = exit.",
        "Always wrap yield in try/finally so cleanup survives exceptions; yield exactly once.",
        "contextlib helpers: suppress, redirect_stdout, ExitStack, closing, nullcontext.",
      ],
    },
  ],
  exam: [
    {
      id: "e1", kind: "predict", difficulty: 4,
      code: r`class CM:
    def __enter__(self):
        print("enter")
        return 42
    def __exit__(self, t, e, tb):
        print("exit", t.__name__ if t else None)
        return t is KeyError
with CM() as v:
    print(v)
    raise KeyError("k")
print("after")`,
      answer: "enter\n42\nexit KeyError\nafter\n",
      hint: "What does __exit__ return for a KeyError?",
      explain: "__exit__ returns True for KeyError, so the exception is suppressed and execution continues after the block.",
    },
    {
      id: "e2", kind: "mcq", difficulty: 3,
      prompt: "Which statement about __exit__ is true?",
      options: [
        { text: "It only runs if the block succeeds", why: "It always runs." },
        { text: "It receives the exception details (or Nones) and runs in every case", why: "Correct." },
        { text: "Its return value becomes the `as` variable", why: "That's __enter__'s return value." },
      ],
      answer: 1,
      hint: "Always runs.",
      explain: "__exit__(exc_type, exc, tb) runs on both success (all None) and failure.",
    },
    {
      id: "e3", kind: "fill", difficulty: 3,
      prompt: "Turn the generator into a context manager.",
      code: r`from contextlib import contextmanager
@___
def banner():
    print("====")
    yield
    print("====")
with banner():
    print("hello")`,
      blanks: [["contextmanager"]],
      output: "====\nhello\n====\n",
      hint: "The decorator you imported.",
      explain: "`@contextmanager` adapts the generator into an object with __enter__/__exit__.",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: safe file editor", difficulty: 4,
    prompt: `Write \`@contextmanager def atomic_write(path)\` that yields a writable file object for a **temporary** file (\`path + ".tmp"\`); if the block succeeds, replace the real file with the temp file (\`os.replace\`); if it raises, delete the temp file and re-raise — the original stays untouched.

Process commands until \`end\`: \`write TEXT\` (atomically replace \`notes.txt\` with TEXT), \`fail TEXT\` (write TEXT then raise RuntimeError inside the block; print \`write aborted\`), \`show\` (print the file content). Finally print the sorted list of files in the folder (no .tmp left behind).`,
    starter: r`import os
from contextlib import contextmanager
from pathlib import Path

Path("notes.txt").write_text("v1")
`,
    tests: [
      { label: "Session", input: "show\nwrite v2\nshow\nfail v3\nshow\nend\n", output: "v1\nv2\nwrite aborted\nv2\n['notes.txt']" },
    ],
    hints: [
      "Open `path + \".tmp\"` for writing inside the generator.",
      "try: yield f … then close and os.replace(tmp, path).",
      "except BaseException: close, os.remove(tmp), raise.",
      "List files with `sorted(p.name for p in Path(\".\").iterdir() if p.is_file())`.",
    ],
    solution: r`import os
from contextlib import contextmanager
from pathlib import Path

Path("notes.txt").write_text("v1")

@contextmanager
def atomic_write(path):
    tmp = path + ".tmp"
    f = open(tmp, "w", encoding="utf-8")
    try:
        yield f
    except BaseException:
        f.close()
        os.remove(tmp)
        raise
    else:
        f.close()
        os.replace(tmp, path)

while (line := input()) != "end":
    cmd, _, text = line.partition(" ")
    if cmd == "show":
        print(Path("notes.txt").read_text())
    elif cmd == "write":
        with atomic_write("notes.txt") as f:
            f.write(text)
    elif cmd == "fail":
        try:
            with atomic_write("notes.txt") as f:
                f.write(text)
                raise RuntimeError("simulated crash")
        except RuntimeError:
            print("write aborted")
print(sorted(p.name for p in Path(".").iterdir() if p.is_file()))`,
    notes: "Writing to a temp file and replacing atomically means readers never see a half-written file — the technique editors and databases use to survive crashes.",
  },
};
