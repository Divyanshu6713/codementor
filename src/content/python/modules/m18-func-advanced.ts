import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 18 — Advanced function concepts. */
export const M18: PyModuleDef = {
  id: "py-func-advanced",
  number: 18,
  level: 3,
  title: "Advanced Function Concepts",
  summary: "Lambdas, closures and higher-order functions; decorators; *args and **kwargs; argument unpacking; function annotations; partial functions, functools and the operator module; recursion and memoization; functional programming principles.",
  track: "core",
  prereqs: ["py-oop"],
  lessons: [
    {
      id: "py-lambda-closures",
      title: "Lambdas, closures and higher-order functions",
      minutes: 16,
      difficulty: 3,
      objectives: [
        "Write small anonymous functions with `lambda`",
        "Explain closures and the late-binding trap",
        "Write higher-order functions and keep functions pure",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "What is `(lambda x, y: x * y)(3, 4)`?",
        options: [
          { text: "A function object", why: "It's called immediately with (3, 4)." },
          { text: "12", why: "Correct." },
          { text: "A SyntaxError", why: "Calling a lambda right away is valid." },
        ],
        answer: 1,
        hint: "A lambda is a function; the second brackets call it.",
        explain: "`lambda x, y: x * y` is a function returning x * y; calling it with 3 and 4 gives 12.",
      },
      why: "Small throwaway functions appear everywhere — sort keys, callbacks, event handlers. Closures let functions carry configuration with them. These ideas underpin decorators, functools and much of modern Python style.",
      concept: [
        {
          title: "lambda",
          body: `\`lambda params: expression\` creates an unnamed function with a single expression (no statements):

\`\`\`python
square = lambda n: n * n           # works, but def is clearer for named functions
sorted(people, key=lambda p: p["age"])
\`\`\`

Use lambdas for short inline functions passed to something else; use \`def\` when it needs a name, a docstring or more than one expression.`,
        },
        {
          title: "Closures",
          body: `A nested function that uses variables from its enclosing function **closes over** them — it keeps them alive after the outer function returns:

\`\`\`python
def make_tax(rate):
    def apply(amount):
        return round(amount * (1 + rate), 2)
    return apply

gst = make_tax(0.18)
gst(100)      # 118.0
\`\`\`

**Late binding trap**: closures look up the variable when called, not when created. \`[lambda: i for i in range(3)]\` all return 2. Fix with a default: \`lambda i=i: i\`.`,
        },
        {
          title: "Higher-order functions and purity",
          body: `A **higher-order function** takes or returns functions (\`map\`, \`sorted(key=)\`, \`make_tax\`). Functional style prefers **pure functions** — same input, same output, no side effects — because they're easy to test, cache and run in parallel. Python mixes styles: use pure functions for logic and keep side effects (printing, files, network) at the edges.`,
        },
      ],
      example: {
        title: "Configurable functions",
        code: r`def make_greeter(greeting, punctuation="!"):
    def greet(name):
        return f"{greeting}, {name}{punctuation}"
    return greet

hello = make_greeter("Hello")
namaste = make_greeter("Namaste", ".")
print(hello("Asha"), namaste("Ravi"))
def apply_n(func, n, x):
    for _ in range(n):
        x = func(x)
    return x
print(apply_n(lambda v: v * 2, 5, 1))
late = [lambda: i for i in range(3)]
fixed = [lambda i=i: i for i in range(3)]
print([f() for f in late], [f() for f in fixed])
print(hello.__closure__[0].cell_contents)`,
        output: "Hello, Asha! Namaste, Ravi.\n32\n[2, 2, 2] [0, 1, 2]\nHello\n",
        lines: [
          [2, "greet uses greeting and punctuation from the enclosing call."],
          [6, "Each call to make_greeter creates a new closure with its own values."],
          [9, "A higher-order function: it takes a function as an argument."],
          [13, "Doubling 1 five times = 32."],
          [14, "Late binding: every lambda looks up i when called — after the loop, i is 2."],
          [15, "A default argument captures the current i at creation time."],
          [17, "The captured values live in the function's closure cells."],
        ],
      },
      mistakes: [
        { title: "Assigning lambdas to names", body: "`f = lambda x: x + 1` works but PEP 8 prefers `def f(x): return x + 1` (better tracebacks, docstrings)." },
        { title: "Late binding in loops", body: "Closures created in a loop share the loop variable. Capture it with a default argument or functools.partial." },
        { title: "Side effects in 'pure' helpers", body: "A key function that also prints or modifies data surprises callers. Keep helpers pure." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`def counter():
    count = 0
    def inc():
        nonlocal count
        count += 1
        return count
    return inc
a, b = counter(), counter()
print(a(), a(), b(), a())`,
          answer: "1 2 1 3\n",
          hint: "Each counter() call creates its own count.",
          explain: "a and b are separate closures; a counts 1, 2, 3 while b has its own 1.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Sort words by their last letter.",
          code: r`words = ["kiwi", "apple", "fig"]
print(sorted(words, key=___ w: w[-1]))`,
          blanks: [["lambda"]],
          output: "['apple', 'fig', 'kiwi']\n",
          hint: "An inline function.",
          explain: "`lambda w: w[-1]` returns each word's last letter: e, g, i.",
        },
        {
          id: "b1", kind: "bug", difficulty: 4,
          prompt: "Each button should print its own number (0 1 2) but all print 2. Which line?",
          code: r`handlers = []
for n in range(3):
    handlers.append(lambda: print(n, end=" "))
for h in handlers:
    h()
print()`,
          line: 3,
          fix: r`handlers = []
for n in range(3):
    handlers.append(lambda n=n: print(n, end=" "))
for h in handlers:
    h()
print()`,
          output: "0 1 2 \n",
          hint: "When does the lambda look up n?",
          explain: "The lambdas look up n when called, after the loop ended with n = 2. A default argument captures the value at creation.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "Which function is pure?",
          options: [
            { text: "`def add(a, b): return a + b`", why: "Correct — output depends only on inputs, no side effects." },
            { text: "`def log(x): print(x); return x`", why: "Printing is a side effect." },
            { text: "`def next_id(): global n; n += 1; return n`", why: "Changes global state." },
          ],
          answer: 0,
          hint: "Same input → same output, nothing else changes.",
          explain: "add has no side effects and depends only on its arguments.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Discount factory", difficulty: 3,
          prompt: `Write \`make_discount(percent, minimum=0)\` returning a function that takes a price and returns the discounted price (rounded to 2) — but only if the price is at least \`minimum\`; otherwise the price unchanged. Read lines \`percent minimum price\` until \`end\` and print the result of \`make_discount(percent, minimum)(price)\`.`,
          starter: r`def make_discount(percent, minimum=0):
    pass
`,
          tests: [
            { label: "Several", input: "10 0 500\n20 1000 800\n20 1000 1500\nend\n", output: "450.0\n800.0\n1200.0" },
            { label: "Exactly minimum", input: "50 100 100\nend\n", output: "50.0", hidden: true, category: "boundary" },
          ],
          hints: [
            "Define an inner function that takes price.",
            "It uses percent and minimum from the enclosing call (a closure).",
            "`return round(price * (1 - percent / 100), 2) if price >= minimum else price`.",
            "Return the inner function, and convert the inputs to float.",
          ],
          solution: r`def make_discount(percent, minimum=0):
    def apply(price):
        if price >= minimum:
            return round(price * (1 - percent / 100), 2)
        return price
    return apply

while (line := input()) != "end":
    pct, minimum, price = map(float, line.split())
    print(make_discount(pct, minimum)(price))`,
          notes: "The returned function remembers its percent and minimum — configuration captured once, used many times.",
        },
        {
          id: "stretch", kind: "task", title: "Pipeline of transformations", difficulty: 3,
          prompt: `Write \`pipeline(*steps)\` returning a function that applies the steps left to right. Using lambdas, build a cleaning pipeline for usernames: strip spaces, lower-case, replace spaces with underscores, keep only the first 12 characters. Print the cleaned version of each input line until \`end\`.`,
          starter: r`def pipeline(*steps):
    pass
`,
          tests: [
            { label: "Names", input: "  Asha Kumar \nRAVI\nA Very Long User Name Indeed\nend\n", output: "asha_kumar\nravi\na_very_long_" },
            { label: "Already clean", input: "zoe\nend\n", output: "zoe", hidden: true },
          ],
          hints: [
            "pipeline returns an inner function that loops over steps.",
            "Each step is a function taking and returning a string.",
            "`lambda s: s[:12]` keeps 12 characters.",
            "`clean = pipeline(str.strip, str.lower, lambda s: s.replace(\" \", \"_\"), lambda s: s[:12])`.",
          ],
          solution: r`def pipeline(*steps):
    def run(value):
        for step in steps:
            value = step(value)
        return value
    return run

clean = pipeline(str.strip, str.lower, lambda s: s.replace(" ", "_"), lambda s: s[:12])
while (line := input()) != "end":
    print(clean(line))`,
          notes: "Unbound methods like `str.strip` are already functions of one string. Composing small pure functions is a core functional-programming idea.",
        },
      ],
      realWorld: "Callbacks in GUI and web frameworks, sort/group keys, configurable validators and retry policies are closures and higher-order functions. Data pipelines are often built as chains of small pure functions.",
      reteach: "A closure is a function packed for a trip: when it's created, it puts the variables it needs into its backpack (the enclosing scope). Wherever it goes later, it can still reach into the backpack. But it carries the *variable*, not a photo of its value — so if the value changes before the trip (a loop), it sees the new one.",
      summary: [
        "`lambda args: expr` for short inline functions; `def` for anything named or longer.",
        "Closures remember enclosing variables; beware late binding in loops (capture with a default).",
        "Higher-order functions take/return functions; prefer pure functions for logic.",
      ],
    },

    {
      id: "py-decorators",
      title: "Decorators",
      minutes: 17,
      difficulty: 4,
      objectives: [
        "Explain what `@decorator` does to a function",
        "Write decorators with `*args, **kwargs` and `functools.wraps`",
        "Write decorators that take arguments",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "`@timer` above `def work(): ...` is the same as…",
        options: [
          { text: "`timer(work())`", why: "That would call work immediately." },
          { text: "`work = timer(work)`", why: "Correct." },
          { text: "`timer = work(timer)`", why: "Backwards." },
        ],
        answer: 1,
        hint: "The decorator receives the function and returns a replacement.",
        explain: "Decorator syntax passes the function to the decorator and rebinds the name to whatever it returns.",
      },
      why: "Decorators add behaviour around functions without changing them: logging, timing, caching, access control, retries. Frameworks rely on them heavily — `@app.route`, `@pytest.fixture`, `@login_required`, `@lru_cache`.",
      concept: [
        {
          title: "A decorator is a function that wraps a function",
          body: `\`\`\`python
import functools

def logged(func):
    @functools.wraps(func)              # keep func's name and docstring
    def wrapper(*args, **kwargs):
        print(f"calling {func.__name__}{args}")
        result = func(*args, **kwargs)
        print(f"{func.__name__} returned {result}")
        return result
    return wrapper

@logged
def add(a, b):
    return a + b
\`\`\`

\`*args, **kwargs\` let the wrapper accept and pass on any arguments. Always \`return\` the result.`,
        },
        {
          title: "Decorators with arguments",
          body: `Add one more level: a function that takes the options and returns a decorator.

\`\`\`python
def repeat(times):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for _ in range(times):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def ping(): print("ping")
\`\`\`

Stacked decorators apply bottom-up: \`@a\` over \`@b\` over \`def f\` means \`f = a(b(f))\`.`,
        },
      ],
      example: {
        title: "Counting and validating calls",
        code: r`import functools

def count_calls(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        wrapper.calls += 1
        return func(*args, **kwargs)
    wrapper.calls = 0
    return wrapper

def require_positive(func):
    @functools.wraps(func)
    def wrapper(x):
        if x <= 0:
            raise ValueError(f"{func.__name__} needs a positive number")
        return func(x)
    return wrapper

@count_calls
@require_positive
def root(x):
    """Square root."""
    return round(x ** 0.5, 3)

print(root(16), root(2))
try:
    root(-4)
except ValueError as e:
    print(e)
print(root.calls, root.__name__, root.__doc__)`,
        output: "4.0 1.414\nroot needs a positive number\n3 root Square root.\n",
        lines: [
          [3, "count_calls wraps any function and counts calls on the wrapper object."],
          [4, "functools.wraps copies __name__, __doc__ etc. from the original."],
          [12, "A validating decorator: check before calling the real function."],
          [19, "Stacked: root = count_calls(require_positive(root))."],
          [25, "The failing call is still counted (counting happens in the outer wrapper first)."],
          [29, "Thanks to wraps, the name and docstring survive."],
        ],
      },
      mistakes: [
        { title: "Forgetting to return the result", body: "A wrapper without `return func(...)` makes every decorated function return None." },
        { title: "Missing functools.wraps", body: "Without it, every decorated function is named 'wrapper' — confusing in tracebacks and tools." },
        { title: "Calling instead of passing", body: "`@timer()` vs `@timer` matter: only decorators that take arguments use brackets." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 4,
          code: r`def shout(func):
    def wrapper(*args):
        return func(*args).upper()
    return wrapper
def exclaim(func):
    def wrapper(*args):
        return func(*args) + "!"
    return wrapper
@shout
@exclaim
def greet(name):
    return "hi " + name
print(greet("asha"))`,
          answer: "HI ASHA!\n",
          hint: "greet = shout(exclaim(greet)).",
          explain: "exclaim adds \"!\" first; shout then upper-cases the whole thing.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Preserve the wrapped function's name.",
          code: r`import functools
def deco(func):
    @functools.___(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper
@deco
def area(r):
    return 3 * r * r
print(area.__name__)`,
          blanks: [["wraps"]],
          output: "area\n",
          hint: "functools.____",
          explain: "`@functools.wraps(func)` copies metadata onto the wrapper.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "After decorating, `add(2, 3)` returns None instead of 5. Which line?",
          code: r`def logged(func):
    def wrapper(*args):
        print("calling", func.__name__)
        func(*args)
    return wrapper
@logged
def add(a, b):
    return a + b
print(add(2, 3))`,
          line: 4,
          fix: r`def logged(func):
    def wrapper(*args):
        print("calling", func.__name__)
        return func(*args)
    return wrapper
@logged
def add(a, b):
    return a + b
print(add(2, 3))`,
          output: "calling add\n5\n",
          hint: "What does the wrapper return?",
          explain: "The wrapper calls func but throws away its result. It must `return func(*args)`.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 4,
          prompt: "`@retry(times=3)` is a decorator with arguments. How many levels of functions does `retry` need?",
          options: [
            { text: "One", why: "One level can't receive both the options and the function." },
            { text: "Three: retry(times) → decorator(func) → wrapper(*args)", why: "Correct." },
            { text: "Two, always", why: "Two is for decorators without arguments." },
          ],
          answer: 1,
          hint: "Options first, then the function, then the call.",
          explain: "retry(3) returns a decorator, which receives the function and returns the wrapper.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "A timing-free call logger", difficulty: 3,
          prompt: `Write a decorator \`trace\` that prints \`-> NAME(args)\` before a call and \`<- NAME = result\` after it (use \`functools.wraps\`, \`*args\`, \`**kwargs\`; show args as a tuple and kwargs only if present as \`args, kwargs\`). Decorate \`power(base, exp=2)\` and call it as shown in the starter.`,
          starter: r`import functools

def trace(func):
    return func

@trace
def power(base, exp=2):
    return base ** exp

power(3)
power(2, exp=10)`,
          tests: [{ label: "Two calls", input: "", output: "-> power(3,)\n<- power = 9\n-> power(2,) {'exp': 10}\n<- power = 1024" }],
          hints: [
            "Inside trace, define wrapper(*args, **kwargs).",
            "Print `f\"-> {func.__name__}{args}\"` and add `f\" {kwargs}\"` only if kwargs is non-empty.",
            "Call `result = func(*args, **kwargs)` and print the second line.",
            "Return result from the wrapper, and the wrapper from trace.",
          ],
          solution: r`import functools

def trace(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        extra = f" {kwargs}" if kwargs else ""
        print(f"-> {func.__name__}{args}{extra}")
        result = func(*args, **kwargs)
        print(f"<- {func.__name__} = {result}")
        return result
    return wrapper

@trace
def power(base, exp=2):
    return base ** exp

power(3)
power(2, exp=10)`,
          notes: "`args` is a tuple, which prints as `(3,)` for one item. The decorator works for any function signature because it forwards *args and **kwargs.",
        },
        {
          id: "stretch", kind: "challenge", title: "Rate limiter decorator", difficulty: 4,
          prompt: `Write \`limit(max_calls)\`, a decorator with an argument that allows a function to run at most \`max_calls\` times; extra calls raise \`RuntimeError("NAME called more than N times")\`. Decorate \`send(msg)\` (returns \`sent: MSG\`) with \`@limit(2)\`. For each input line until \`end\`, print the result or \`blocked: …\`.`,
          starter: r`import functools
`,
          tests: [
            { label: "Three sends", input: "hi\nhello\nspam\nend\n", output: "sent: hi\nsent: hello\nblocked: send called more than 2 times" },
            { label: "One send", input: "x\nend\n", output: "sent: x", hidden: true },
          ],
          hints: [
            "Three levels: limit(max_calls) → decorator(func) → wrapper(*args, **kwargs).",
            "Keep a call counter (an attribute on the wrapper, or `nonlocal`).",
            "Check the count before calling; raise RuntimeError when it's exceeded.",
            "The loop wraps each call in try/except RuntimeError.",
          ],
          solution: r`import functools

def limit(max_calls):
    def decorator(func):
        calls = 0
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            nonlocal calls
            if calls >= max_calls:
                raise RuntimeError(f"{func.__name__} called more than {max_calls} times")
            calls += 1
            return func(*args, **kwargs)
        return wrapper
    return decorator

@limit(2)
def send(msg):
    return f"sent: {msg}"

while (line := input()) != "end":
    try:
        print(send(line))
    except RuntimeError as e:
        print("blocked:", e)`,
          notes: "Real rate limiters count per time window (and per user) — but the decorator structure is exactly this.",
        },
      ],
      realWorld: "`@app.get(\"/users\")` in FastAPI, `@login_required` in Django, `@pytest.mark.parametrize`, `@functools.lru_cache`, `@dataclass` and `@property` are all decorators. Cross-cutting concerns (auth, logging, caching, retries) belong in decorators rather than copied into every function.",
      reteach: "A decorator is gift-wrapping: the present (your function) is unchanged, but now it comes in wrapping paper that can do things before and after it's opened — log a message, check a ticket, time the opening. `functools.wraps` copies the gift tag onto the wrapping so everyone still knows what's inside.",
      summary: [
        "`@d` above `def f` means `f = d(f)`; decorators return a wrapper function.",
        "Wrappers use `*args, **kwargs`, `functools.wraps`, and return the result.",
        "Decorators with options add a level; stacked decorators apply bottom-up.",
      ],
    },

    {
      id: "py-args-kwargs",
      title: "*args, **kwargs, unpacking, partial and functools",
      minutes: 17,
      difficulty: 3,
      objectives: [
        "Accept any number of arguments with `*args` and `**kwargs`",
        "Unpack sequences and dicts into calls with `*` and `**`",
        "Use `functools.partial`, `reduce`, `operator` functions and annotations",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "Inside `def f(*args, **kwargs)`, calling `f(1, 2, x=3)` gives…",
        options: [
          { text: "args = [1, 2], kwargs = {\"x\": 3}", why: "args is a tuple, not a list." },
          { text: "args = (1, 2), kwargs = {\"x\": 3}", why: "Correct." },
          { text: "args = (1, 2, 3), kwargs = {}", why: "x=3 is a keyword argument." },
        ],
        answer: 1,
        hint: "Positional extras → tuple; keyword extras → dict.",
        explain: "`*args` collects extra positional arguments into a tuple; `**kwargs` collects keyword arguments into a dict.",
      },
      why: "Flexible signatures let you write wrappers, helpers and APIs that accept whatever their callers need — like print() accepting any number of values. functools and operator provide battle-tested building blocks so you don't reinvent them.",
      concept: [
        {
          title: "*args and **kwargs",
          body: `\`\`\`python
def total(*nums):                 # any number of positional args → tuple
    return sum(nums)

def tag(name, **attrs):           # any keyword args → dict
    props = " ".join(f'{k}="{v}"' for k, v in attrs.items())
    return f"<{name} {props}>"

tag("img", src="a.png", alt="logo")
\`\`\`

Order in a signature: positional, \`*args\`, keyword-only, \`**kwargs\`.`,
        },
        {
          title: "Unpacking into calls",
          body: `\`\`\`python
point = (3, 4)
math.hypot(*point)                # same as math.hypot(3, 4)
options = {"sep": "-", "end": "!\\n"}
print("a", "b", **options)        # same as print("a", "b", sep="-", end="!\\n")
merged = {**defaults, **overrides}
first, *rest = [1, 2, 3]
\`\`\``,
        },
        {
          title: "functools, operator and annotations",
          body: `\`\`\`python
from functools import partial, reduce
import operator

base2 = partial(int, base=2)         # pre-fill arguments
base2("1010")                        # 10
reduce(operator.mul, [1, 2, 3, 4])   # 24: folds a sequence with a function
sorted(rows, key=operator.itemgetter(1))   # like lambda r: r[1]
\`\`\`

\`operator\` has functions for every operator (\`add\`, \`mul\`, \`itemgetter\`, \`attrgetter\`). **Annotations** (\`def f(x: int) -> str\`) are stored in \`f.__annotations__\` and used by tools; they don't change behaviour.`,
        },
      ],
      example: {
        title: "Flexible helpers",
        code: r`from functools import partial, reduce
import operator

def describe(title, *items, sep=", ", **extra):
    line = f"{title}: {sep.join(items)}"
    if extra:
        line += " | " + " ".join(f"{k}={v}" for k, v in extra.items())
    return line

print(describe("fruits", "apple", "kiwi"))
print(describe("tags", "py", "web", sep="/", level=2, new=True))
coords = (6, 8)
print(f"distance: {(lambda x, y: (x * x + y * y) ** 0.5)(*coords)}")
binary = partial(int, base=2)
print(binary("1101"), reduce(operator.add, [1, 2, 3, 4], 100))
rows = [("asha", 91), ("ravi", 78)]
print(max(rows, key=operator.itemgetter(1)))
print(describe.__annotations__, partial(describe, "x", sep="-")("a", "b"))`,
        output: "fruits: apple, kiwi\ntags: py/web | level=2 new=True\ndistance: 10.0\n13 110\n('asha', 91)\n{} x: a-b\n",
        lines: [
          [4, "One required positional, any number of extra positionals, a keyword-only sep, and any extra keywords."],
          [10, "Extra keywords land in the `extra` dict."],
          [12, "`*coords` unpacks the tuple into two arguments."],
          [13, "partial pre-fills base=2."],
          [14, "reduce folds the list with + starting from 100."],
          [16, "itemgetter(1) is a ready-made key function."],
          [17, "No annotations here (empty dict); partial can pre-fill both positional and keyword arguments."],
        ],
      },
      mistakes: [
        { title: "Mutating kwargs expecting caller changes", body: "`kwargs` is a new dict each call; changing it doesn't affect the caller." },
        { title: "Order of parameters", body: "`def f(**kw, *args)` is a SyntaxError. The order is: positional, *args, keyword-only, **kwargs." },
        { title: "Overusing reduce", body: "`sum`, `max`, `any`, `math.prod` are clearer than reduce for common folds." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`def f(a, *args, b=0, **kw):
    return a, args, b, kw
print(f(1, 2, 3, b=4, c=5))
print(f(*[9, 8], **{"b": 1}))`,
          answer: "(1, (2, 3), 4, {'c': 5})\n(9, (8,), 1, {})\n",
          hint: "Unpacking in the call happens before matching parameters.",
          explain: "The first call: a=1, args=(2, 3), b=4, kw={'c': 5}. The second unpacks to f(9, 8, b=1).",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Pre-fill the `end` argument of print.",
          code: r`from functools import partial
say = partial(print, ___="!\n")
say("hello")`,
          blanks: [["end"]],
          output: "hello!\n",
          hint: "Which print keyword controls the line ending?",
          explain: "`partial(print, end=\"!\\n\")` creates a print that ends lines with !.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "This should print the sum 10 but raises TypeError. Which line?",
          code: r`def total(*nums):
    return sum(nums)
values = [1, 2, 3, 4]
print(total(values))`,
          line: 4,
          fix: r`def total(*nums):
    return sum(nums)
values = [1, 2, 3, 4]
print(total(*values))`,
          output: "10\n",
          hint: "What is nums when you pass one list?",
          explain: "Passing the list gives nums = ([1, 2, 3, 4],) and sum can't add a list to 0. Unpack with `*values`.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "`operator.itemgetter(0, 2)((\"a\", \"b\", \"c\"))` returns…",
          options: [
            { text: "`\"a\"`", why: "With two indexes it returns a tuple." },
            { text: "`(\"a\", \"c\")`", why: "Correct." },
            { text: "`[\"a\", \"c\"]`", why: "It's a tuple." },
          ],
          answer: 1,
          hint: "Several indexes → several values.",
          explain: "itemgetter with multiple keys returns a tuple of those items.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Build an HTML tag", difficulty: 3,
          prompt: `Write \`tag(name, *children, **attrs)\` that returns HTML like \`<a href="x.html" class="btn">Go</a>\`: attributes in the order given, children joined with no separator. Use \`class_\` for the class attribute (strip a trailing underscore from names). Print the given examples.`,
          starter: r`def tag(name, *children, **attrs):
    pass

print(tag("a", "Go", href="x.html", class_="btn"))
print(tag("ul", tag("li", "one"), tag("li", "two")))
print(tag("br"))`,
          tests: [{ label: "Three tags", input: "", output: "<a href=\"x.html\" class=\"btn\">Go</a>\n<ul><li>one</li><li>two</li></ul>\n<br></br>" }],
          hints: [
            "Build the attribute text from `attrs.items()`.",
            "`k.rstrip(\"_\")` turns class_ into class.",
            "Children: `\"\".join(children)`.",
            "Put a space before the attributes only when there are some.",
          ],
          solution: r`def tag(name, *children, **attrs):
    parts = "".join(f' {k.rstrip("_")}="{v}"' for k, v in attrs.items())
    return f"<{name}{parts}>{''.join(children)}</{name}>"

print(tag("a", "Go", href="x.html", class_="btn"))
print(tag("ul", tag("li", "one"), tag("li", "two")))
print(tag("br"))`,
          notes: "This is how HTML-building libraries work. (Real code must also escape special characters — Module 33.)",
        },
        {
          id: "stretch", kind: "task", title: "Group and fold", difficulty: 4,
          prompt: `Read lines \`category amount\` until \`end\`. Using \`reduce\` (with a function that adds an amount to a dict of totals) build \`{category: total}\`, then print categories sorted by total descending (ties alphabetical) using \`operator.itemgetter\` for one of the keys — format \`category total\`.`,
          starter: r`from functools import reduce
import operator
`,
          tests: [
            { label: "Spending", input: "food 120\ntravel 60\nfood 80\nbooks 200\nend\n", output: "books 200\nfood 200\ntravel 60" },
            { label: "Single", input: "x 5\nend\n", output: "x 5", hidden: true },
          ],
          hints: [
            "Collect (category, amount) pairs first.",
            "The reducer: `def add(totals, pair): totals[pair[0]] = totals.get(pair[0], 0) + pair[1]; return totals`.",
            "`reduce(add, pairs, {})` starts from an empty dict.",
            "Sort items with `key=lambda kv: (-kv[1], kv[0])` (itemgetter can't negate) — or sort twice: by name with itemgetter(0), then stably by amount.",
          ],
          solution: r`from functools import reduce
import operator

pairs = []
while (line := input()) != "end":
    cat, amount = line.split()
    pairs.append((cat, int(amount)))

def add(totals, pair):
    cat, amount = pair
    totals[cat] = totals.get(cat, 0) + amount
    return totals

totals = reduce(add, pairs, {})
items = sorted(totals.items(), key=operator.itemgetter(0))
items.sort(key=operator.itemgetter(1), reverse=True)
for cat, amount in items:
    print(cat, amount)`,
          notes: "Sorting twice relies on stability: first by name, then by amount — ties keep alphabetical order. (A plain dict loop is clearer than reduce in everyday code; reduce shows the folding idea.)",
        },
      ],
      realWorld: "Wrappers and decorators forward `*args, **kwargs`; `print`, `str.format` and `dict()` accept flexible arguments; `partial` configures callbacks; `operator.itemgetter` is a common, fast sort key; type annotations drive FastAPI and pydantic.",
      reteach: "`*args` is a bag that catches all the extra loose items handed to a function; `**kwargs` is a labelled organiser that catches the extra labelled items. At the call site, `*` and `**` do the reverse: they tip a bag or organiser out into separate arguments. `partial` is a pre-filled form: some boxes are already completed.",
      summary: [
        "`*args` → tuple of extra positionals; `**kwargs` → dict of extra keywords.",
        "`*seq` and `**dict` unpack into calls (and into lists/dicts).",
        "functools.partial pre-fills arguments; reduce folds; operator provides function versions of operators.",
      ],
    },

    {
      id: "py-recursion-memo",
      title: "Recursion and memoization",
      minutes: 18,
      difficulty: 4,
      objectives: [
        "Write recursive functions with a base case and progress",
        "Trace recursion with the call stack",
        "Speed up overlapping recursion with memoization (`functools.cache`)",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "What must every recursive function have?",
        options: [
          { text: "A loop", why: "Recursion replaces loops." },
          { text: "A base case that stops the recursion", why: "Correct — and each call must move towards it." },
          { text: "A global variable", why: "Not needed." },
        ],
        answer: 1,
        hint: "How does it ever stop?",
        explain: "Without a base case (or progress towards it) recursion never ends — RecursionError.",
      },
      why: "Some problems are naturally self-similar: folders inside folders, trees, nested lists, divide-and-conquer algorithms, exploring all combinations. Recursion expresses them directly. Memoization turns exponential recursive solutions into fast ones — the core idea of dynamic programming (Module 44).",
      concept: [
        {
          title: "Base case + recursive case",
          body: `\`\`\`python
def factorial(n):
    if n <= 1:                 # base case
        return 1
    return n * factorial(n - 1)   # recursive case: a smaller problem
\`\`\`

Each call waits on the **call stack** until the smaller call returns. Python limits the depth (about 1000 by default) — deep recursion raises \`RecursionError\`; convert to a loop if inputs can be large.`,
        },
        {
          title: "Recursion on structures",
          body: `\`\`\`python
def total(nested):                 # sum numbers in arbitrarily nested lists
    s = 0
    for item in nested:
        s += total(item) if isinstance(item, list) else item
    return s
\`\`\`

The structure itself gives the base case: a plain number isn't a list.`,
        },
        {
          title: "Memoization",
          body: `Naive Fibonacci recomputes the same values exponentially many times. Cache results:

\`\`\`python
from functools import cache        # 3.9+; lru_cache(maxsize=None) before that

@cache
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

fib(100)    # instant
\`\`\`

Memoization works for **pure** functions with **hashable** arguments.`,
        },
      ],
      example: {
        title: "Three recursive functions",
        code: r`from functools import cache

def countdown(n):
    if n == 0:
        return ["liftoff"]
    return [n] + countdown(n - 1)

def flatten(items):
    out = []
    for x in items:
        out.extend(flatten(x) if isinstance(x, list) else [x])
    return out

calls = 0
def slow_fib(n):
    global calls
    calls += 1
    return n if n < 2 else slow_fib(n - 1) + slow_fib(n - 2)

@cache
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print(countdown(3))
print(flatten([1, [2, [3, [4]], 5]]))
print(slow_fib(20), calls)
print(fib(90), fib.cache_info().hits)`,
        output: "[3, 2, 1, 'liftoff']\n[1, 2, 3, 4, 5]\n6765 21891\n2880067194370816120 88\n",
        lines: [
          [4, "Base case: nothing left to count."],
          [6, "Recursive case: this number, then the countdown from n − 1."],
          [10, "Lists are flattened recursively; other items are kept as they are."],
          [16, "Plain recursive Fibonacci: correct but exponential."],
          [18, "@cache stores each result, so every fib(k) is computed once."],
          [24, "21,891 calls for fib(20) without caching…"],
          [25, "…while the cached fib(90) needs only 91 computations (88 cache hits)."],
        ],
      },
      mistakes: [
        { title: "Missing or unreachable base case", body: "`def f(n): return f(n - 1)` never stops → RecursionError. Check the base case and that each call gets closer to it." },
        { title: "Recursion where a loop is simpler", body: "Summing 1..n recursively hits the depth limit for n = 5000. Loops are fine for linear tasks." },
        { title: "Caching impure functions", body: "@cache on a function that reads changing data returns stale results." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`def f(n):
    if n == 0:
        return ""
    return f(n - 1) + str(n)
def g(n):
    if n == 0:
        return ""
    return str(n) + g(n - 1)
print(f(4), g(4))`,
          answer: "1234 4321\n",
          hint: "Where is the current number added — before or after the recursive result?",
          explain: "f appends n after the smaller result (1, 12, 123, 1234); g puts n first (4321).",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Complete the base case of a recursive power function.",
          code: r`def power(b, e):
    if e == ___:
        return 1
    return b * power(b, e - 1)
print(power(2, 10))`,
          blanks: [["0"]],
          output: "1024\n",
          hint: "Anything to the power … is 1.",
          explain: "b⁰ = 1 is the base case; each call reduces e by one.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "This should sum the digits of 4096 (19) but raises RecursionError. Which line?",
          code: r`def digit_sum(n):
    if n == 0:
        return 0
    return n % 10 + digit_sum(n / 10)
print(digit_sum(4096))`,
          line: 4,
          fix: r`def digit_sum(n):
    if n == 0:
        return 0
    return n % 10 + digit_sum(n // 10)
print(digit_sum(4096))`,
          output: "19\n",
          hint: "Does n ever become exactly 0 with `/`?",
          explain: "`/` gives floats (409.6, 40.96, …) that approach but never equal 0. Use `//`.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 4,
          prompt: "Why does `@cache` make recursive Fibonacci fast?",
          options: [
            { text: "It runs the calls in parallel", why: "No parallelism involved." },
            { text: "Each fib(k) is computed once and reused, turning exponential work into linear", why: "Correct." },
            { text: "It removes the recursion", why: "The recursion is still there; repeated work isn't." },
          ],
          answer: 1,
          hint: "Overlapping subproblems.",
          explain: "Memoization stores results of subproblems; the exponential tree collapses to n distinct calls.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Recursive palindrome and power set size", difficulty: 3,
          prompt: `Write a **recursive** \`is_pal(s)\` (compare first and last characters, recurse on the middle) and print the result for each input word until \`end\`.`,
          starter: r`def is_pal(s):
    pass
`,
          tests: [
            { label: "Words", input: "level\nab\na\nracecar\nend\n", output: "True\nFalse\nTrue\nTrue" },
            { label: "Empty and two letters", input: "\naa\nend\n", output: "True\nTrue", hidden: true, category: "edge" },
          ],
          hints: [
            "Base case: a string of length 0 or 1 is a palindrome.",
            "Recursive case: first and last must match, and the middle must be a palindrome.",
            "The middle is `s[1:-1]`.",
            "`return s[0] == s[-1] and is_pal(s[1:-1])`.",
          ],
          solution: r`def is_pal(s):
    if len(s) <= 1:
        return True
    return s[0] == s[-1] and is_pal(s[1:-1])

while (line := input()) != "end":
    print(is_pal(line))`,
          notes: "Each call works on a string two characters shorter, so the base case is always reached. `and` short-circuits: a mismatch stops the recursion early.",
        },
        {
          id: "stretch", kind: "challenge", title: "Count staircase paths with memoization", difficulty: 4,
          prompt: `You can climb 1, 2 or 3 steps at a time. Write a memoized recursive \`ways(n)\` = the number of distinct ways to climb n steps (ways(0) = 1). Print ways(n) for each input number until \`end\`. n can be up to 70, so plain recursion is far too slow.`,
          starter: r`from functools import cache
`,
          tests: [
            { label: "Small", input: "1\n2\n3\n4\nend\n", output: "1\n2\n4\n7" },
            { label: "Large", input: "70\nend\n", output: "2073693258389777176", hidden: true },
            { label: "Zero", input: "0\nend\n", output: "1", hidden: true, category: "edge" },
          ],
          hints: [
            "The last move was 1, 2 or 3 steps.",
            "So ways(n) = ways(n − 1) + ways(n − 2) + ways(n − 3).",
            "Base cases: ways(0) = 1, and ways(negative) = 0.",
            "Decorate with @cache so each n is computed once.",
          ],
          solution: r`from functools import cache

@cache
def ways(n):
    if n < 0:
        return 0
    if n == 0:
        return 1
    return ways(n - 1) + ways(n - 2) + ways(n - 3)

while (line := input()) != "end":
    print(ways(int(line)))`,
          notes: "Without @cache, ways(70) would make on the order of 10¹⁸ calls. With it, about 70. This 'recurrence + memo' pattern is dynamic programming (Module 44).",
        },
      ],
      realWorld: "File-system walkers, JSON/HTML tree processing, parsers, game-tree search and divide-and-conquer sorting (merge sort, quicksort) are recursive; `functools.cache` speeds up expensive pure computations in real services.",
      reteach: "Recursion is Russian nesting dolls: to open the big doll you open the smaller one inside, and so on, until the tiniest doll that doesn't open (the base case). Memoization is writing down what you found inside each doll, so if you meet the same doll again you just read your notes.",
      summary: [
        "Recursive functions need a base case and must move towards it.",
        "Calls stack up until the base case returns; Python's depth limit is ~1000.",
        "@cache / @lru_cache memoize pure functions — essential for overlapping subproblems.",
      ],
      cpp: {
        python: r`@cache
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)`,
        cpp: r`long long memo[100];
long long fib(int n) {
    if (n < 2) return n;
    if (memo[n]) return memo[n];
    return memo[n] = fib(n - 1) + fib(n - 2);
}`,
        note: "C++ memoizes with an explicit array or map; Python's @cache decorator does it for you. C++ recursion depth is limited by stack size rather than a counter.",
      },
    },
  ],
  exam: [
    {
      id: "e1", kind: "predict", difficulty: 4,
      code: r`import functools
def twice(f):
    @functools.wraps(f)
    def w(*a):
        return f(f(*a))
    return w
@twice
def inc(x):
    return x + 1
print(inc(5), inc.__name__)`,
      answer: "7 inc\n",
      hint: "The wrapper applies f to the result of f.",
      explain: "inc(5) becomes inc(inc(5)) = 7; wraps keeps the name.",
    },
    {
      id: "e2", kind: "mcq", difficulty: 3,
      prompt: "Which call passes the dict's items as keyword arguments?",
      options: [
        { text: "`f(opts)`", why: "Passes the dict as one positional argument." },
        { text: "`f(*opts)`", why: "Unpacks the keys as positional arguments." },
        { text: "`f(**opts)`", why: "Correct." },
      ],
      answer: 2,
      hint: "Double star for keywords.",
      explain: "`**opts` expands a dict into keyword arguments.",
    },
    {
      id: "e3", kind: "fill", difficulty: 3,
      prompt: "Memoize the function.",
      code: r`from functools import cache
@___
def tri(n):
    return 0 if n == 0 else n + tri(n - 1)
print(tri(100))`,
      blanks: [["cache"]],
      output: "5050\n",
      hint: "The decorator you imported.",
      explain: "`@cache` stores each result.",
    },
    {
      id: "e4", kind: "bug", difficulty: 4,
      prompt: "`depth([1, [2, [3]]])` should be 3 but returns 1. Which line?",
      code: r`def depth(x):
    if not isinstance(x, list):
        return 0
    return 1 + max([depth(i) for i in x], default=0) if False else 1
print(depth([1, [2, [3]]]))`,
      line: 4,
      fix: r`def depth(x):
    if not isinstance(x, list):
        return 0
    return 1 + max([depth(i) for i in x], default=0)
print(depth([1, [2, [3]]]))`,
      output: "3\n",
      hint: "Read the conditional expression on line 4 carefully.",
      explain: "`... if False else 1` always returns 1, so the recursion result is discarded. Return `1 + max(...)` directly.",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: function toolkit", difficulty: 4,
    prompt: `Build a small toolkit and use it:

1. \`@memo_log\` — a decorator that caches results by arguments and prints \`cache hit: NAME ARGS\` when it returns a cached value.
2. \`compose(*fs)\` — right-to-left composition (\`compose(f, g)(x) == f(g(x))\`).
3. \`count_paths(r, c)\` — recursive number of right/down paths in an r × c grid (1 if r == 1 or c == 1), decorated with \`@memo_log\`.

The starter calls them; make the output match exactly (the cache hits show which subproblems were reused):

\`\`\`
cache hit: count_paths (2, 2)
6
cache hit: count_paths (2, 2)
2
cache hit: count_paths (2, 3)
cache hit: count_paths (3, 3)
cache hit: count_paths (3, 3)
cache hit: count_paths (3, 2)
20
11
\`\`\``,
    starter: r`import functools

def memo_log(func):
    return func

def compose(*fs):
    pass

def count_paths(r, c):
    return 0

print(count_paths(3, 3))
print(count_paths(2, 2))
print(count_paths(4, 4))
print(compose(lambda x: x + 1, lambda x: x * 2)(5))`,
    tests: [{ label: "Toolkit", input: "", output: "cache hit: count_paths (2, 2)\n6\ncache hit: count_paths (2, 2)\n2\ncache hit: count_paths (2, 3)\ncache hit: count_paths (3, 3)\ncache hit: count_paths (3, 3)\ncache hit: count_paths (3, 2)\n20\n11" }],
    hints: [
      "memo_log keeps a dict from args to result inside the decorator.",
      "Print the hit message only when the args are already in the dict.",
      "count_paths(r, c) = count_paths(r − 1, c) + count_paths(r, c − 1).",
      "compose: apply the functions in reverse order: `for f in reversed(fs): x = f(x)`.",
    ],
    solution: r`import functools

def memo_log(func):
    cache = {}
    @functools.wraps(func)
    def wrapper(*args):
        if args in cache:
            print("cache hit:", func.__name__, args)
            return cache[args]
        cache[args] = func(*args)
        return cache[args]
    return wrapper

def compose(*fs):
    def run(x):
        for f in reversed(fs):
            x = f(x)
        return x
    return run

@memo_log
def count_paths(r, c):
    if r == 1 or c == 1:
        return 1
    return count_paths(r - 1, c) + count_paths(r, c - 1)

print(count_paths(3, 3))
print(count_paths(2, 2))
print(count_paths(4, 4))
print(compose(lambda x: x + 1, lambda x: x * 2)(5))`,
    notes: "The cache hits reveal the overlapping subproblems: even the first 3 × 3 call reuses (2, 2), and the 4 × 4 grid reuses (2, 3), (3, 2) and (3, 3) from earlier.",
  },
};
