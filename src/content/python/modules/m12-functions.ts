import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 12 — Functions. */
export const M12: PyModuleDef = {
  id: "py-functions",
  number: 12,
  level: 2,
  title: "Functions",
  summary: "Defining and calling functions; parameters and arguments; positional, keyword, default, positional-only and keyword-only parameters; return values and multiple returns; scope, namespaces, global and nonlocal; mutable default pitfalls; first-class functions; type hints; docstrings; clean function design.",
  track: "core",
  prereqs: ["py-dicts"],
  lessons: [
    {
      id: "py-functions-basics",
      title: "Defining, calling and returning",
      minutes: 16,
      difficulty: 2,
      objectives: [
        "Define a function with `def` and call it with arguments",
        "Return a value — and know the difference between `return` and `print`",
        "Split a problem into small, reusable functions",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "`def f(): print(5)` — what does `x = f()` store in x?",
        options: [
          { text: "5", why: "f prints 5 but doesn't return it." },
          { text: "None", why: "Correct — a function without `return` returns None." },
          { text: "\"5\"", why: "print shows text; it doesn't return it." },
        ],
        answer: 1,
        hint: "What does f give back?",
        explain: "Printing and returning are different. Without `return`, a function returns None.",
      },
      why: "Functions are the most important tool for organising code: name a piece of logic once, test it once, and reuse it everywhere. Every library you'll ever use is a collection of functions.",
      concept: [
        {
          title: "def and call",
          body: `\`\`\`python
def greet(name):           # name is a PARAMETER
    return f"Hello, {name}!"

message = greet("Asha")    # "Asha" is an ARGUMENT
print(message)
\`\`\`

The body runs only when the function is **called**. Define functions before calling them (Python runs top to bottom).`,
        },
        {
          title: "return versus print",
          body: `- \`return value\` **gives a value back** to the caller and ends the function immediately.
- \`print(value)\` just **shows** it; the caller gets nothing (None).

Functions that compute things should \`return\` — the caller decides whether to print, store or combine the result: \`total = price(item) * qty\`.

A function can have several \`return\` statements (e.g. one per branch); the first one reached wins.`,
        },
        {
          title: "Why split into functions",
          body: `- **Reuse**: write once, call many times.
- **Readability**: \`if is_leap(year):\` explains itself.
- **Testing**: a small function with inputs and an output is easy to check.

A good function does **one thing** and has a name that says what it returns or does: \`area_of_circle(r)\`, \`is_valid_email(s)\`, \`load_marks(path)\`.`,
        },
      ],
      example: {
        title: "Small functions working together",
        code: r`def area(width, height):
    return width * height

def is_square(width, height):
    return width == height

def describe(width, height):
    kind = "square" if is_square(width, height) else "rectangle"
    return f"{width}x{height} {kind}, area {area(width, height)}"

print(describe(3, 3))
print(describe(2, 5))
result = print("printed, not returned")
print(result)`,
        output: "3x3 square, area 9\n2x5 rectangle, area 10\nprinted, not returned\nNone\n",
        lines: [
          [1, "`def` defines a function with two parameters; nothing runs yet."],
          [2, "`return` hands the product back to whoever called it."],
          [5, "Returns a bool — a 'question' function, named is_…"],
          [8, "Functions can call other functions."],
          [11, "Calling describe runs it with width=3, height=3."],
          [13, "print returns None, which we store and print."],
        ],
      },
      mistakes: [
        { title: "Printing instead of returning", body: "If the caller needs the value (to add, compare, store), the function must `return` it." },
        { title: "Forgetting the brackets", body: "`area` is the function itself; `area(2, 3)` calls it. `print(area)` shows `<function area at …>`." },
        { title: "Code after return", body: "Lines after a `return` in the same block never run." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 2,
          code: r`def double(n):
    return n * 2
    print("never")

def show(n):
    print(n * 2)

a = double(4)
b = show(4)
print(a, b)`,
          answer: "8\n8 None\n",
          hint: "Which function prints, which returns?",
          explain: "`show(4)` prints 8 and returns None. `double(4)` returns 8 (the print after return never runs). Then `8 None` is printed.",
        },
        {
          id: "f1", kind: "fill", difficulty: 1,
          prompt: "Complete the function so it gives back the cube.",
          code: r`def cube(x):
    ___ x ** 3

print(cube(3))`,
          blanks: [["return"]],
          output: "27\n",
          hint: "The keyword that sends a value back.",
          explain: "`return x ** 3` gives 27 back to the caller, which prints it.",
        },
        {
          id: "b1", kind: "bug", difficulty: 2,
          prompt: "This should print `Total: 30` but prints `Total: None` (after a stray 30). Which line?",
          code: r`def total(prices):
    print(sum(prices))

print("Total:", total([10, 20]))`,
          line: 2,
          fix: r`def total(prices):
    return sum(prices)

print("Total:", total([10, 20]))`,
          output: "Total: 30\n",
          hint: "Does the function give its result back?",
          explain: "The function prints the sum instead of returning it, so the call evaluates to None. Use `return`.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 2,
          prompt: "Which is the best name for a function that returns True when a number is prime?",
          options: [
            { text: "`prime_check_function_v2`", why: "Long and doesn't read as a question." },
            { text: "`is_prime`", why: "Correct — reads naturally: `if is_prime(n):`." },
            { text: "`p`", why: "Says nothing." },
          ],
          answer: 1,
          hint: "How will it read inside an if?",
          explain: "`is_…`/`has_…` names make boolean functions read like English in conditions.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Grade function", difficulty: 2,
          prompt: `Write \`grade(marks)\` that **returns** \`"A"\` (≥ 90), \`"B"\` (≥ 75), \`"C"\` (≥ 50) or \`"F"\`. The provided code reads marks and prints \`marks -> grade\` for each.`,
          starter: r`def grade(marks):
    pass

for m in map(int, input().split()):
    print(m, "->", grade(m))`,
          tests: [
            { label: "Bands", input: "95 75 60 12\n", output: "95 -> A\n75 -> B\n60 -> C\n12 -> F" },
            { label: "Boundaries", input: "90 89 50 49\n", output: "90 -> A\n89 -> B\n50 -> C\n49 -> F", hidden: true, category: "boundary" },
          ],
          hints: [
            "The function needs an if/elif chain.",
            "Return from each branch instead of printing.",
            "Start with the highest band.",
            "`if marks >= 90: return \"A\"` … and finally `return \"F\"`.",
          ],
          solution: r`def grade(marks):
    if marks >= 90:
        return "A"
    if marks >= 75:
        return "B"
    if marks >= 50:
        return "C"
    return "F"

for m in map(int, input().split()):
    print(m, "->", grade(m))`,
          notes: "Because `return` ends the function, plain `if`s work like an elif chain here. The function only computes; the caller prints.",
        },
        {
          id: "stretch", kind: "task", title: "Prime helpers", difficulty: 3,
          prompt: `Write \`is_prime(n)\` (True for primes, False otherwise; 0 and 1 aren't prime) and \`primes_between(a, b)\` that **returns a list** of primes from a to b inclusive, using \`is_prime\`. Read a and b and print the list and its length.`,
          starter: r`def is_prime(n):
    pass

def primes_between(a, b):
    pass

a, b = map(int, input().split())
ps = primes_between(a, b)
print(ps, len(ps))`,
          tests: [
            { label: "1 to 20", input: "1 20\n", output: "[2, 3, 5, 7, 11, 13, 17, 19] 8" },
            { label: "None", input: "24 28\n", output: "[] 0", hidden: true, category: "edge" },
            { label: "Single prime", input: "97 97\n", output: "[97] 1", hidden: true, category: "boundary" },
          ],
          hints: [
            "is_prime: handle n < 2 first.",
            "Test divisors d while d * d <= n.",
            "primes_between: loop over range(a, b + 1) and keep the ones where is_prime is True.",
            "`return [n for n in range(a, b + 1) if is_prime(n)]`.",
          ],
          solution: r`def is_prime(n):
    if n < 2:
        return False
    d = 2
    while d * d <= n:
        if n % d == 0:
            return False
        d += 1
    return True

def primes_between(a, b):
    return [n for n in range(a, b + 1) if is_prime(n)]

a, b = map(int, input().split())
ps = primes_between(a, b)
print(ps, len(ps))`,
          notes: "`return` inside the loop exits early as soon as a divisor is found. Building one function on top of another keeps each simple and testable.",
        },
      ],
      realWorld: "Every library is functions: `len`, `sorted`, `json.loads`, `requests.get`. In teams, small well-named functions with clear inputs and outputs are what make code reviewable and testable (Module 29).",
      reteach: "A function is a vending machine: you put something in (arguments), it does its job, and something comes out of the slot (the return value). `print` inside it is like the machine flashing a message on its screen — nice to see, but nothing drops into your hand.",
      summary: [
        "`def name(params):` defines; `name(args)` calls; the body runs only when called.",
        "`return` gives a value back and ends the function; no return → None.",
        "Prefer small, single-purpose functions with descriptive names.",
      ],
      cpp: {
        python: r`def area(w, h):
    return w * h`,
        cpp: r`int area(int w, int h) {
    return w * h;
}`,
        note: "C++ declares parameter and return types; Python doesn't (optional type hints come later in this module).",
      },
    },

    {
      id: "py-function-arguments",
      title: "Positional, keyword and default arguments",
      minutes: 17,
      difficulty: 3,
      objectives: [
        "Pass arguments by position and by keyword",
        "Give parameters default values — and avoid mutable defaults",
        "Use `/` (positional-only) and `*` (keyword-only) markers",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "`def power(base, exp=2): return base ** exp`. What is `power(3)`?",
        options: [
          { text: "3", why: "exp defaults to 2." },
          { text: "9", why: "Correct: 3 ** 2." },
          { text: "An error: missing exp", why: "exp has a default." },
        ],
        answer: 1,
        hint: "Parameters with defaults can be left out.",
        explain: "When exp isn't passed, its default 2 is used.",
      },
      why: "Well-designed arguments make functions easy to call correctly: sensible defaults for the common case, keywords for clarity (`send(msg, retry=True)`), and protection against confusing calls. This is how library APIs like `print(..., sep=..., end=...)` and `sorted(..., key=..., reverse=...)` work.",
      concept: [
        {
          title: "Positional and keyword arguments",
          body: `\`\`\`python
def book(title, author, year):
    ...
book("Wings of Fire", "Kalam", 1999)                    # positional: order matters
book(year=1999, title="Wings of Fire", author="Kalam")  # keyword: any order
book("Wings of Fire", year=1999, author="Kalam")        # mixed: positional first
\`\`\`

A keyword argument can't come before a positional one, and each parameter can be given only once.`,
        },
        {
          title: "Defaults — and the mutable default trap",
          body: `\`\`\`python
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"
\`\`\`

Default values are created **once**, when the \`def\` runs — not on every call. A mutable default (list, dict) is therefore **shared between calls**:

\`\`\`python
def add(item, bucket=[]):       # BUG: one list for all calls
    bucket.append(item)
    return bucket

def add(item, bucket=None):     # FIX
    if bucket is None:
        bucket = []
    bucket.append(item)
    return bucket
\`\`\``,
        },
        {
          title: "Positional-only and keyword-only",
          body: `\`\`\`python
def f(a, b, /, c, *, d):
    ...
f(1, 2, 3, d=4)        # a, b MUST be positional; d MUST be a keyword
\`\`\`

- Parameters before \`/\` are **positional-only** (Python 3.8+): callers can't depend on their names.
- Parameters after \`*\` are **keyword-only**: calls stay readable (\`connect(host, timeout=5)\`).`,
        },
      ],
      example: {
        title: "A flexible ticket function",
        code: r`def ticket(name, seat, /, *, meal="veg", priority=False):
    tag = " [PRIORITY]" if priority else ""
    return f"{name} - {seat} - {meal}{tag}"

print(ticket("Asha", "12A"))
print(ticket("Ravi", "3C", meal="non-veg", priority=True))

def collect(item, bucket=None):
    if bucket is None:
        bucket = []
    bucket.append(item)
    return bucket

print(collect("a"), collect("b"))

def broken(item, bucket=[]):
    bucket.append(item)
    return bucket

print(broken("a"), broken("b"))`,
        output: "Asha - 12A - veg\nRavi - 3C - non-veg [PRIORITY]\n['a'] ['b']\n['a', 'b'] ['a', 'b']\n",
        lines: [
          [1, "name and seat are positional-only; meal and priority are keyword-only with defaults."],
          [5, "Defaults fill in meal and priority."],
          [6, "Keywords make the optional choices obvious at the call site."],
          [9, "The None-sentinel pattern: a fresh list on every call."],
          [16, "The buggy version shares ONE default list…"],
          [20, "…so the second call sees the first call's item (both print the same shared list)."],
        ],
      },
      mistakes: [
        { title: "Mutable default arguments", body: "`def f(x=[])` shares one list across calls. Use `None` and create the list inside." },
        { title: "Positional after keyword", body: "`f(a=1, 2)` is a SyntaxError: positional arguments come first." },
        { title: "Too many/too few arguments", body: "`TypeError: f() missing 1 required positional argument` — compare the call with the def line." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 2,
          code: r`def label(text, width=10, fill="."):
    return text.ljust(width, fill)

print(label("ab"))
print(label("ab", 4))
print(label("ab", fill="-", width=5))`,
          answer: "ab........\nab..\nab---\n",
          hint: "ljust pads on the right to the given width.",
          explain: "Defaults width=10, fill='.'; then width=4; then keywords set fill='-' and width=5.",
        },
        {
          id: "p2", kind: "predict", difficulty: 3,
          code: r`def log(msg, history=[]):
    history.append(msg)
    return len(history)

print(log("a"), log("b"), log("c", []), log("d"))`,
          answer: "1 2 1 3\n",
          hint: "The default list is created once.",
          explain: "Calls 1, 2 and 4 share the default list (lengths 1, 2, 3). Call 3 passes its own new list (length 1).",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Make `retries` keyword-only.",
          code: r`def fetch(url, ___, retries=3):
    return f"{url} x{retries}"

print(fetch("site", retries=5))`,
          blanks: [["*"]],
          output: "site x5\n",
          hint: "A bare marker in the parameter list.",
          explain: "A lone `*` makes every parameter after it keyword-only.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "Each new team should start empty, but the second team already contains Asha. Which line is the bug?",
          code: r`def new_team(member, team=[]):
    team.append(member)
    return team

print(new_team("Asha"))
print(new_team("Ravi"))`,
          line: 1,
          fix: r`def new_team(member, team=None):
    if team is None:
        team = []
    team.append(member)
    return team

print(new_team("Asha"))
print(new_team("Ravi"))`,
          output: "['Asha']\n['Ravi']\n",
          hint: "When is the default list created?",
          explain: "The default `[]` is created once at definition time and shared. Use `None` and create a new list inside the function.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Price with options", difficulty: 2,
          prompt: `Write \`final_price(price, quantity=1, *, discount=0, gst=18)\` returning the total: price × quantity, minus discount %, plus gst % on the discounted amount, rounded to 2 decimals. The given code reads values and calls it in different ways.`,
          starter: r`def final_price(price, quantity=1, *, discount=0, gst=18):
    pass

p, q, d = map(float, input().split())
print(final_price(p))
print(final_price(p, int(q)))
print(final_price(p, int(q), discount=d))
print(final_price(p, gst=0))`,
          tests: [
            { label: "100 x2, 10% off", input: "100 2 10\n", output: "118.0\n236.0\n212.4\n100.0" },
            { label: "Decimals", input: "49.99 3 5\n", output: "58.99\n176.96\n168.12\n49.99", hidden: true },
          ],
          hints: [
            "Compute the subtotal first: price * quantity.",
            "Apply the discount: subtotal * (1 - discount / 100).",
            "Then add GST: * (1 + gst / 100).",
            "`return round(price * quantity * (1 - discount / 100) * (1 + gst / 100), 2)`.",
          ],
          solution: r`def final_price(price, quantity=1, *, discount=0, gst=18):
    subtotal = price * quantity
    discounted = subtotal * (1 - discount / 100)
    return round(discounted * (1 + gst / 100), 2)

p, q, d = map(float, input().split())
print(final_price(p))
print(final_price(p, int(q)))
print(final_price(p, int(q), discount=d))
print(final_price(p, gst=0))`,
          notes: "Defaults cover the common case; keyword-only options make calls like `final_price(p, gst=0)` self-explanatory.",
        },
        {
          id: "stretch", kind: "debug", title: "Fix the shared cart", difficulty: 3,
          prompt: `Each customer should get their own cart, but carts leak between customers. Fix \`add_to_cart\` (keep its call signature) so the program prints each customer's own items.`,
          starter: r`def add_to_cart(item, cart=[]):
    cart.append(item)
    return cart

n = int(input())
for _ in range(n):
    items = input().split()
    cart = add_to_cart(items[0])
    for it in items[1:]:
        cart = add_to_cart(it, cart)
    print(cart)`,
          tests: [
            { label: "Two customers", input: "2\napple milk\nbread\n", output: "['apple', 'milk']\n['bread']" },
            { label: "Three customers", input: "3\na\nb c\nd\n", output: "['a']\n['b', 'c']\n['d']", hidden: true },
          ],
          hints: [
            "Which carts are the same object?",
            "Every call without a cart uses the same default list.",
            "Use `None` as the default.",
            "`def add_to_cart(item, cart=None): if cart is None: cart = []` …",
          ],
          solution: r`def add_to_cart(item, cart=None):
    if cart is None:
        cart = []
    cart.append(item)
    return cart

n = int(input())
for _ in range(n):
    items = input().split()
    cart = add_to_cart(items[0])
    for it in items[1:]:
        cart = add_to_cart(it, cart)
    print(cart)`,
          notes: "The None-sentinel is the standard fix; linters like Ruff flag mutable defaults automatically (rule B006).",
        },
      ],
      realWorld: "Library APIs live and die by their arguments: `requests.get(url, timeout=5)`, `open(path, mode=\"r\", encoding=\"utf-8\")`, `df.sort_values(\"price\", ascending=False)`. Keyword-only parameters prevent call sites like `connect(\"db\", True, False, 3)` that nobody can read.",
      reteach: "Arguments are like filling in a form: positional arguments are boxes you fill in order; keyword arguments are fields you fill by label, in any order. Defaults are pre-filled fields. The mutable-default bug is like a pre-filled shopping list printed once and handed to every customer — everyone writes on the same sheet.",
      summary: [
        "Positional (by order) and keyword (by name) arguments; positional first.",
        "Defaults are evaluated once — never use a mutable default; use None.",
        "`/` makes earlier parameters positional-only; `*` makes later ones keyword-only.",
      ],
    },

    {
      id: "py-scope",
      title: "Scope, namespaces, global and nonlocal",
      minutes: 16,
      difficulty: 3,
      objectives: [
        "Explain local and global scope (the LEGB rule)",
        "Recognise UnboundLocalError and fix it properly",
        "Use `global` and `nonlocal` deliberately — and know why to avoid them",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "`x = 5`, then `def f(): x = 10`, then `f()` and `print(x)`. What's printed?",
        options: [
          { text: "10", why: "The assignment inside f creates a separate local x." },
          { text: "5", why: "Correct — f's x is local to f." },
          { text: "An error", why: "Valid code." },
        ],
        answer: 1,
        hint: "Assigning inside a function creates a local name.",
        explain: "Assignment inside a function makes that name local; the global x is untouched.",
      },
      why: "Scope decides which variable a name refers to. Understanding it explains puzzling errors, prevents functions from secretly changing each other's data, and is the foundation for closures and decorators (Module 18).",
      concept: [
        {
          title: "Local, enclosing, global, built-in (LEGB)",
          body: `When Python looks up a name, it searches:

1. **L**ocal — the current function
2. **E**nclosing — any outer functions (for nested functions)
3. **G**lobal — the module (file) level
4. **B**uilt-in — names like \`len\`, \`print\`

Each function call gets a fresh **namespace** for its local names, which disappears when the function returns.`,
        },
        {
          title: "Assignment makes a name local",
          body: `If a function **assigns** to a name anywhere in its body, that name is local for the whole function:

\`\`\`python
count = 0
def increment():
    count += 1      # UnboundLocalError: count is local, but not yet assigned
\`\`\`

The clean fix is usually to **pass values in and return results**:

\`\`\`python
def increment(count):
    return count + 1
count = increment(count)
\`\`\``,
        },
        {
          title: "global and nonlocal",
          body: `\`global name\` makes assignments affect the module-level name; \`nonlocal name\` affects the enclosing function's name:

\`\`\`python
def counter():
    n = 0
    def tick():
        nonlocal n
        n += 1
        return n
    return tick
\`\`\`

Use \`global\` rarely: functions that change globals are hard to test and reason about. Reading a global (e.g. a constant) without assigning to it is fine.`,
        },
      ],
      example: {
        title: "Which x is which?",
        code: r`x = "global"

def show():
    print("show sees:", x)

def shadow():
    x = "local"
    print("shadow sees:", x)

def outer():
    x = "enclosing"
    def inner():
        print("inner sees:", x)
    inner()

show(); shadow(); outer()
print("module x:", x)
total = 0
def add(n):
    global total
    total += n
add(5); add(7)
print("total:", total)`,
        output: "show sees: global\nshadow sees: local\ninner sees: enclosing\nmodule x: global\ntotal: 12\n",
        lines: [
          [4, "No local x, so Python finds the global one (G in LEGB)."],
          [7, "Assignment creates a local x that hides the global one."],
          [13, "inner has no x; the enclosing function's x is found (E)."],
          [16, "Semicolons put several statements on one line (fine for short demos)."],
          [17, "The global x was never changed."],
          [20, "`global total` makes `+=` update the module-level name."],
        ],
      },
      mistakes: [
        { title: "UnboundLocalError", body: "Reading a name and then assigning it in the same function makes it local from the start. Pass it in and return the new value." },
        { title: "Overusing global", body: "Hidden shared state causes bugs. Prefer parameters and return values; group related state in a class (Module 17)." },
        { title: "Shadowing built-ins locally", body: "`list = [1, 2]` inside a function hides the built-in `list` there too." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`n = 1
def f():
    n = 2
    def g():
        return n * 10
    return g()
print(f(), n)`,
          answer: "20 1\n",
          hint: "g finds n in the enclosing function.",
          explain: "g looks up n: not local, found in f (2) → 20. The global n stays 1.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Let the inner function update the enclosing variable.",
          code: r`def make_counter():
    count = 0
    def step():
        ___ count
        count += 1
        return count
    return step

c = make_counter()
c(); c()
print(c())`,
          blanks: [["nonlocal"]],
          output: "3\n",
          hint: "Not global — the enclosing function's name.",
          explain: "`nonlocal count` lets step assign to make_counter's variable.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "This raises UnboundLocalError. Fix it the clean way (no `global`). Which line must change?",
          code: r`score = 10
def bonus():
    score = score + 5
    return score
print(bonus())`,
          line: 3,
          fix: r`score = 10
def bonus():
    new_score = score + 5
    return new_score
print(bonus())`,
          output: "15\n",
          hint: "Assigning to `score` makes it local for the whole function.",
          explain: "Because line 3 assigns to `score`, Python treats `score` as local, so reading it on the right side fails. Use a different local name (or pass score in as a parameter).",
        },
        {
          id: "m1", kind: "mcq", difficulty: 2,
          prompt: "In what order does Python look up a name?",
          options: [
            { text: "Global, Local, Built-in", why: "Local comes first." },
            { text: "Local, Enclosing, Global, Built-in", why: "Correct — LEGB." },
            { text: "Built-in first, so print can't be shadowed", why: "Built-ins are searched last." },
          ],
          answer: 1,
          hint: "LEGB.",
          explain: "Local → Enclosing → Global → Built-in.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "debug", title: "Remove the hidden global", difficulty: 3,
          prompt: `This program uses a global running total and crashes. Rewrite \`add_expense\` so it takes the current total as a parameter and **returns** the new total (no \`global\`). Expected output for \`120 80 45\`:

\`\`\`
120
200
245
\`\`\``,
          starter: r`total = 0

def add_expense(amount):
    total = total + amount
    return total

for a in map(int, input().split()):
    print(add_expense(a))`,
          tests: [
            { label: "Three expenses", input: "120 80 45\n", output: "120\n200\n245" },
            { label: "One", input: "7\n", output: "7", hidden: true, category: "boundary" },
          ],
          hints: [
            "Why does `total = total + amount` crash inside the function?",
            "The assignment makes total local, so it has no value when it's read.",
            "Pass the running total in, return the new one, and store it at the call site.",
            "`def add_expense(total, amount): return total + amount` and in the loop `total = add_expense(total, a)`.",
          ],
          solution: r`total = 0

def add_expense(total, amount):
    return total + amount

for a in map(int, input().split()):
    total = add_expense(total, a)
    print(total)`,
          notes: "Data flows in through parameters and out through return values — the function no longer depends on hidden state, so it's trivial to test.",
        },
        {
          id: "stretch", kind: "task", title: "Counter factory", difficulty: 4,
          prompt: `Write \`make_counter(start, step)\` that returns a function; each call of that function returns the next value: start, start+step, start+2·step, … Use \`nonlocal\`. Read start, step and n, then print n values from one counter on one line.`,
          starter: r`def make_counter(start, step):
    pass

start, step, n = map(int, input().split())
tick = make_counter(start, step)
print(*[tick() for _ in range(n)])`,
          tests: [
            { label: "0, 5, 4 times", input: "0 5 4\n", output: "0 5 10 15" },
            { label: "Negative step", input: "10 -3 3\n", output: "10 7 4", hidden: true },
          ],
          hints: [
            "The inner function must remember the next value between calls.",
            "Keep a variable `current = start` in make_counter.",
            "Inside the inner function: `nonlocal current`, save it, then add step.",
            "Return the saved value; make_counter returns the inner function itself (no brackets).",
          ],
          solution: r`def make_counter(start, step):
    current = start
    def tick():
        nonlocal current
        value = current
        current += step
        return value
    return tick

start, step, n = map(int, input().split())
tick = make_counter(start, step)
print(*[tick() for _ in range(n)])`,
          notes: "The inner function keeps access to `current` after make_counter has returned — a **closure** (Module 18). `print(*list)` prints the items separated by spaces.",
        },
      ],
      realWorld: "Frameworks keep request data local to each call so users don't see each other's data; global mutable state is a common source of bugs in web servers with many simultaneous users. Closures power callbacks, decorators and configuration in libraries like Flask.",
      reteach: "Each function call is a room with its own whiteboard (local names). When it needs a name, it looks on its own whiteboard, then on the whiteboard of the room it's inside (enclosing), then on the hallway noticeboard (global), then in the building manual (built-ins). Writing on a board you're in creates a new note there — it doesn't change the hallway noticeboard unless you say `global`.",
      summary: [
        "Names are looked up Local → Enclosing → Global → Built-in.",
        "Assigning anywhere in a function makes the name local for the whole function (UnboundLocalError).",
        "Prefer parameters and return values; use nonlocal for closures, global sparingly.",
      ],
    },

    {
      id: "py-first-class-functions",
      title: "Functions as values",
      minutes: 15,
      difficulty: 3,
      objectives: [
        "Store functions in variables, lists and dicts",
        "Pass functions as arguments (callbacks, sort keys)",
        "Return functions from functions",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "`def shout(s): return s.upper()` then `f = shout`. What is `f(\"hi\")`?",
        options: [
          { text: "\"HI\"", why: "Correct — f refers to the same function." },
          { text: "An error: f isn't a function", why: "Functions are values; f now names shout." },
          { text: "\"hi\"", why: "It calls shout, which upper-cases." },
        ],
        answer: 0,
        hint: "No brackets after shout means: the function itself.",
        explain: "Assigning a function to another name creates an alias; calling it runs the same code.",
      },
      why: "In Python, functions are objects like numbers and strings. That lets you pass behaviour around: tell `sorted` how to compare, give a button its click handler, choose an operation from a menu. It's the basis of functional programming and decorators.",
      concept: [
        {
          title: "Functions are objects",
          body: `\`\`\`python
def square(x):
    return x * x

f = square              # no brackets: the function itself
f(4)                    # 16
ops = [square, abs, str]
handlers = {"sq": square, "abs": abs}
handlers["sq"](5)       # 25
\`\`\``,
        },
        {
          title: "Passing functions in",
          body: `A function that takes another function is a **higher-order function**:

\`\`\`python
def apply_all(func, values):
    return [func(v) for v in values]

apply_all(square, [1, 2, 3])    # [1, 4, 9]
sorted(words, key=len)          # key is a function
\`\`\``,
        },
        {
          title: "Returning functions",
          body: `\`\`\`python
def multiplier(n):
    def times(x):
        return x * n
    return times

triple = multiplier(3)
triple(10)      # 30
\`\`\`

\`times\` remembers \`n\` even after \`multiplier\` returned — a closure. Module 18 builds on this for decorators.`,
        },
      ],
      example: {
        title: "A calculator dispatch table",
        code: r`def add(a, b): return a + b
def sub(a, b): return a - b
def mul(a, b): return a * b

OPS = {"+": add, "-": sub, "*": mul}

def calculate(a, op, b):
    func = OPS.get(op)
    if func is None:
        return "unknown op"
    return func(a, b)

print(calculate(6, "*", 7), calculate(9, "-", 4), calculate(1, "/", 2))

def apply_twice(func, x):
    return func(func(x))

print(apply_twice(lambda v: v + 3, 10), apply_twice(str.upper, "hi"))
print(add.__name__, callable(add), callable(42))`,
        output: "42 5 unknown op\n16 HI\nadd True False\n",
        lines: [
          [1, "Short functions can be written on one line after the colon."],
          [5, "A dict maps symbols to functions — a dispatch table."],
          [8, "Look up the function object (or None)."],
          [11, "Call it like any function."],
          [15, "A higher-order function: calls the function it was given twice."],
          [18, "Functions have attributes like __name__; callable() tells you if something can be called."],
        ],
      },
      mistakes: [
        { title: "Calling instead of passing", body: "`sorted(words, key=len())` calls len with no argument (TypeError). Pass `key=len`." },
        { title: "Late binding in loops", body: "`fs = [lambda: i for i in range(3)]` — every lambda sees the final i (2). Bind it: `lambda i=i: i`." },
        { title: "Storing the result instead of the function", body: "`OPS = {\"+\": add(1, 2)}` stores 3, not the function." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 2,
          code: r`def inc(x): return x + 1
def dbl(x): return x * 2
pipeline = [inc, dbl, inc]
v = 3
for f in pipeline:
    v = f(v)
print(v)`,
          answer: "9\n",
          hint: "Apply the functions in order.",
          explain: "3 → inc → 4 → dbl → 8 → inc → 9.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Return the inner function so the closure can be used.",
          code: r`def greeter(greeting):
    def greet(name):
        return f"{greeting}, {name}"
    return ___

hi = greeter("Hi")
print(hi("Asha"))`,
          blanks: [["greet"]],
          output: "Hi, Asha\n",
          hint: "Return the function object, not a call.",
          explain: "`return greet` (no brackets) returns the function itself.",
        },
        {
          id: "b1", kind: "bug", difficulty: 2,
          prompt: "This should sort words by length but crashes. Which line?",
          code: r`words = ["kiwi", "fig", "banana"]
result = sorted(words, key=len())
print(result)`,
          line: 2,
          fix: r`words = ["kiwi", "fig", "banana"]
result = sorted(words, key=len)
print(result)`,
          output: "['fig', 'kiwi', 'banana']\n",
          hint: "Should you call len yourself, or hand it to sorted?",
          explain: "`len()` is called immediately with no argument (TypeError). Pass the function: `key=len`.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "What does `[f(2) for f in [lambda x: x + 1, lambda x: x * 10]]` give?",
          options: [
            { text: "`[3, 20]`", why: "Correct — each function is applied to 2." },
            { text: "`[2, 2]`", why: "The functions are called." },
            { text: "An error", why: "Lists can hold functions." },
          ],
          answer: 0,
          hint: "Call each function with 2.",
          explain: "The list holds two functions; the comprehension calls each with 2.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Apply a named transformation", difficulty: 2,
          prompt: `Build a dict \`TRANSFORMS\` mapping \`"upper"\`, \`"lower"\`, \`"title"\`, \`"reverse"\` to functions (use \`str.upper\` etc., and a function for reverse). Read a transformation name and a line of text; print the transformed text, or \`unknown\`.`,
          starter: r`TRANSFORMS = {}

name = input()
text = input()
`,
          tests: [
            { label: "upper", input: "upper\nhello world\n", output: "HELLO WORLD" },
            { label: "reverse", input: "reverse\nabc\n", output: "cba" },
            { label: "title", input: "title\npython is fun\n", output: "Python Is Fun", hidden: true },
            { label: "unknown", input: "shout\nhi\n", output: "unknown", hidden: true, category: "edge" },
          ],
          hints: [
            "`str.upper` is a function that takes a string.",
            "For reverse, define `def reverse(s): return s[::-1]`.",
            "Look up with `TRANSFORMS.get(name)`.",
            "If the result is None print \"unknown\", else print `func(text)`.",
          ],
          solution: r`def reverse(s):
    return s[::-1]

TRANSFORMS = {"upper": str.upper, "lower": str.lower, "title": str.title, "reverse": reverse}

name = input()
text = input()
func = TRANSFORMS.get(name)
print(func(text) if func else "unknown")`,
          notes: "A dispatch table replaces a long if/elif chain and makes adding a new transformation a one-line change.",
        },
        {
          id: "stretch", kind: "task", title: "Compose functions", difficulty: 4,
          prompt: `Write \`compose(*funcs)\` that returns a new function applying the given functions **left to right**. Read a number and a list of operation names (\`inc\`, \`dbl\`, \`sq\`, \`neg\`) and print the result of composing them in that order.`,
          starter: r`def compose(*funcs):
    pass

OPS = {"inc": lambda x: x + 1, "dbl": lambda x: x * 2, "sq": lambda x: x * x, "neg": lambda x: -x}
x = int(input())
names = input().split()
pipeline = compose(*[OPS[n] for n in names])
print(pipeline(x))`,
          tests: [
            { label: "inc dbl", input: "3\ninc dbl\n", output: "8" },
            { label: "dbl inc", input: "3\ndbl inc\n", output: "7" },
            { label: "Longer", input: "2\nsq neg inc dbl\n", output: "-6", hidden: true },
            { label: "No functions", input: "5\n\n", output: "5", hidden: true, category: "edge" },
          ],
          hints: [
            "compose must return a function.",
            "Inside it, start with the input value and apply each function in turn.",
            "`def run(x): for f in funcs: x = f(x); return x`.",
            "Return `run` (no brackets). With no functions, run returns x unchanged.",
          ],
          solution: r`def compose(*funcs):
    def run(x):
        for f in funcs:
            x = f(x)
        return x
    return run

OPS = {"inc": lambda x: x + 1, "dbl": lambda x: x * 2, "sq": lambda x: x * x, "neg": lambda x: -x}
x = int(input())
names = input().split()
pipeline = compose(*[OPS[n] for n in names])
print(pipeline(x))`,
          notes: "`*funcs` collects any number of functions (Module 18 covers `*args`). The returned `run` is a closure over funcs — building behaviour out of smaller behaviours.",
        },
      ],
      realWorld: "Callbacks in GUIs and web frameworks (`@app.route` registers a function), sort keys, `map`/`filter`, retry policies and plugin systems all pass functions around as values.",
      reteach: "A function is a recipe card. Normally you *cook* the recipe (call it with brackets). But you can also hand the card itself to someone else — put it in a box (list), file it under a label (dict), or give it to a chef who'll decide when to cook it (higher-order function).",
      summary: [
        "Functions are objects: assign them, store them in lists/dicts, pass and return them.",
        "Pass functions without brackets (`key=len`); call with brackets.",
        "Returned inner functions remember their enclosing variables (closures).",
      ],
    },

    {
      id: "py-clean-functions",
      title: "Type hints, docstrings and clean function design",
      minutes: 16,
      difficulty: 3,
      objectives: [
        "Annotate parameters and return values with type hints",
        "Write a clear docstring with arguments, return value and examples",
        "Apply clean-design rules: one job, few parameters, no hidden side effects",
      ],
      version: "Type-hint syntax `list[int]` needs 3.9+, `X | None` needs 3.10+",
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "`def f(x: int) -> int: return x * 2`. What does `f(\"ab\")` do?",
        options: [
          { text: "Raises a TypeError because of the hint", why: "Python doesn't enforce type hints at run time." },
          { text: "Returns \"abab\"", why: "Correct — hints are documentation for people and tools like mypy, not run-time checks." },
          { text: "Returns 0", why: "The code multiplies whatever it gets." },
        ],
        answer: 1,
        hint: "Are type hints checked when the program runs?",
        explain: "Hints are ignored at run time; static checkers (mypy, Pyright — Module 24) use them to find mistakes before running.",
      },
      why: "Code is read far more than it's written. Type hints and docstrings tell readers (and editors) what a function expects and returns; clean design keeps functions easy to test and change. Professional codebases require them.",
      concept: [
        {
          title: "Type hints",
          body: `\`\`\`python
def average(marks: list[int]) -> float:
    return sum(marks) / len(marks)

def find(name: str, people: dict[str, int]) -> int | None:
    return people.get(name)
\`\`\`

Hints don't change how the code runs. Editors use them for autocompletion; **mypy**/**Pyright** use them to catch bugs like passing a str where an int is expected. Module 24 goes deeper.`,
        },
        {
          title: "Docstrings",
          body: `\`\`\`python
def bmi(weight: float, height: float) -> float:
    """Return the body-mass index, rounded to 1 decimal.

    Args:
        weight: mass in kilograms (must be positive).
        height: height in metres (must be positive).

    >>> bmi(70, 1.75)
    22.9
    """
\`\`\`

The first line is a one-sentence summary. \`help(bmi)\` and IDEs show it; \`>>>\` examples can even be run as tests (\`doctest\`).`,
        },
        {
          title: "Clean function design",
          body: `- **One job**: if you need "and" to describe it, split it.
- **Few parameters** (≤ 3–4); group related ones (a dict/dataclass).
- **Pure where possible**: same inputs → same output, no hidden changes to globals or arguments.
- **Return, don't print**, so callers decide what to do.
- **Fail clearly**: check inputs and raise a helpful error (Module 16).
- **Short**: if it doesn't fit on a screen, it's probably doing too much.`,
        },
      ],
      example: {
        title: "A small, documented, typed function",
        code: r`def split_bill(total: float, people: int, tip_percent: float = 0) -> float:
    """Return each person's share, rounded to 2 decimals.

    >>> split_bill(1000, 4, 10)
    275.0
    """
    if people <= 0:
        raise ValueError("people must be at least 1")
    return round(total * (1 + tip_percent / 100) / people, 2)

print(split_bill(1000, 4, 10))
print(split_bill(999, 3))
print(split_bill.__doc__.splitlines()[0])
print(split_bill.__annotations__["return"].__name__)`,
        output: "275.0\n333.0\nReturn each person's share, rounded to 2 decimals.\nfloat\n",
        lines: [
          [1, "Type hints for each parameter and the return value; a default for the tip."],
          [2, "The docstring's first line is the summary."],
          [4, "A doctest example: input and expected output."],
          [7, "Fail clearly instead of returning nonsense or dividing by zero."],
          [9, "One job: compute and return. No printing inside."],
          [13, "Hints are stored on the function in `__annotations__`."],
        ],
      },
      mistakes: [
        { title: "Believing hints are enforced", body: "Python ignores them at run time; run a type checker to benefit." },
        { title: "Functions that do everything", body: "`process_and_print_and_save()` is hard to test. Split: compute, then format, then output." },
        { title: "Modifying arguments unexpectedly", body: "A function that sorts the caller's list in place surprises people. Document it, or work on a copy (`sorted(x)`)." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 2,
          code: r`def scale(values: list[int], k: int = 2) -> list[int]:
    """Return a new list with every value multiplied by k."""
    return [v * k for v in values]

nums = [1, 2]
print(scale(nums), scale(nums, k=10), nums)
print(scale.__doc__)`,
          answer: "[2, 4] [10, 20] [1, 2]\nReturn a new list with every value multiplied by k.\n",
          hint: "Does scale change nums?",
          explain: "scale builds a new list each time, so nums is unchanged. `__doc__` holds the docstring.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Annotate the return type.",
          code: r`def is_even(n: int) ___ bool:
    return n % 2 == 0

print(is_even(4))`,
          blanks: [["->"]],
          output: "True\n",
          hint: "The arrow.",
          explain: "`-> bool` declares the return type.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "This should print the sorted marks and then the original order, but the original is changed too. Which line is the design bug?",
          code: r`def top_marks(marks: list[int]) -> list[int]:
    marks.sort(reverse=True)
    return marks[:2]

m = [40, 90, 70]
print(top_marks(m), m)`,
          line: 2,
          fix: r`def top_marks(marks: list[int]) -> list[int]:
    ordered = sorted(marks, reverse=True)
    return ordered[:2]

m = [40, 90, 70]
print(top_marks(m), m)`,
          output: "[90, 70] [40, 90, 70]\n",
          hint: "Should a 'get the top marks' function rearrange the caller's list?",
          explain: "`marks.sort()` modifies the caller's list (a hidden side effect). Use `sorted(...)` to work on a new list.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 2,
          prompt: "Which function is easiest to test?",
          options: [
            { text: "One that reads input(), computes, and prints", why: "Needs input and output capture to test." },
            { text: "One that takes arguments and returns a value without side effects", why: "Correct — call it and compare the result." },
            { text: "One that updates a global variable", why: "Tests must set up and inspect global state." },
          ],
          answer: 1,
          hint: "What makes `assert f(2) == 4` possible?",
          explain: "Pure functions (inputs → output) are trivial to test and reuse.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Refactor into clean functions", difficulty: 3,
          prompt: `Write three typed functions and use them:

- \`parse_scores(line: str) -> list[int]\`
- \`average(scores: list[int]) -> float\` (raise \`ValueError\` for an empty list)
- \`report(name: str, scores: list[int]) -> str\` returning \`"Asha: avg 85.0 (best 92)"\`

Read a name and a line of scores and print the report.`,
          starter: r`def parse_scores(line: str) -> list[int]:
    pass

def average(scores: list[int]) -> float:
    pass

def report(name: str, scores: list[int]) -> str:
    pass

name = input()
print(report(name, parse_scores(input())))`,
          tests: [
            { label: "Asha", input: "Asha\n78 92 85\n", output: "Asha: avg 85.0 (best 92)" },
            { label: "Single score", input: "Ravi\n50\n", output: "Ravi: avg 50.0 (best 50)", hidden: true, category: "boundary" },
            { label: "Rounding", input: "Zoe\n70 71\n", output: "Zoe: avg 70.5 (best 71)", hidden: true },
          ],
          hints: [
            "Each function does one small job; report calls average.",
            "parse: `[int(x) for x in line.split()]`.",
            "average: check `if not scores: raise ValueError(...)` then `round(sum / len, 1)`.",
            "report: `f\"{name}: avg {average(scores)} (best {max(scores)})\"`.",
          ],
          solution: r`def parse_scores(line: str) -> list[int]:
    """Turn '78 92 85' into [78, 92, 85]."""
    return [int(x) for x in line.split()]

def average(scores: list[int]) -> float:
    """Mean of the scores, rounded to 1 decimal."""
    if not scores:
        raise ValueError("no scores")
    return round(sum(scores) / len(scores), 1)

def report(name: str, scores: list[int]) -> str:
    """One-line summary for a student."""
    return f"{name}: avg {average(scores)} (best {max(scores)})"

name = input()
print(report(name, parse_scores(input())))`,
          notes: "Input/output stays at the edges (the last two lines); the functions are pure and each one is testable on its own.",
        },
        {
          id: "stretch", kind: "task", title: "Doctest your function", difficulty: 3,
          prompt: `Write \`initials(full_name: str) -> str\` returning the upper-case initials with dots (\`"asha k rao"\` → \`"A.K.R."\`), with a docstring containing **two** doctest examples. The program runs \`doctest\` on it (it must report no failures) and then prints \`initials\` of the input.`,
          starter: r`import doctest

def initials(full_name: str) -> str:
    pass

failures = doctest.testmod().failed
print("doctest failures:", failures)
print(initials(input()))`,
          tests: [
            { label: "Three names", input: "asha k rao\n", output: "doctest failures: 0\nA.K.R." },
            { label: "Extra spaces", input: "  ravi   iyer \n", output: "doctest failures: 0\nR.I.", hidden: true, category: "edge" },
          ],
          hints: [
            "Split the name into words and take the first letter of each.",
            "`\"\".join(w[0].upper() + \".\" for w in full_name.split())`.",
            "A doctest line looks like `>>> initials(\"asha k rao\")` followed by the expected repr `'A.K.R.'`.",
            "Put both examples inside the triple-quoted docstring, each `>>>` line followed by its result line.",
          ],
          solution: r`import doctest

def initials(full_name: str) -> str:
    """Return upper-case initials with dots.

    >>> initials("asha k rao")
    'A.K.R.'
    >>> initials("Zoe")
    'Z.'
    """
    return "".join(w[0].upper() + "." for w in full_name.split())

failures = doctest.testmod().failed
print("doctest failures:", failures)
print(initials(input()))`,
          notes: "doctest runs the `>>>` examples and compares the output — documentation that can't silently go out of date. (Real projects mostly use pytest, Module 29.) Note: a starter that returns None makes the doctests fail, so this exercise is checked end to end.",
        },
      ],
      realWorld: "Open-source projects and companies enforce type hints with mypy/Pyright in CI, document public functions with docstrings that become API docs (Sphinx, MkDocs), and use code review to keep functions small and single-purpose.",
      reteach: "A good function is like a well-labelled kitchen appliance: the label says what goes in and what comes out (type hints), the manual's first line says what it does (docstring), and it does exactly one job without secretly rearranging your kitchen (no hidden side effects).",
      summary: [
        "Type hints document types (`x: int`, `-> str`, `list[int]`, `X | None`) — checked by tools, not at run time.",
        "Docstrings: one-line summary, details, optional `>>>` examples (doctest).",
        "Clean design: one job, few parameters, return values, no hidden side effects, fail clearly.",
      ],
    },
  ],
  exam: [
    {
      id: "e1", kind: "predict", difficulty: 3,
      code: r`def f(a, b=2, *, c=3):
    return a * b + c

print(f(1), f(1, 5), f(2, c=0), f(b=1, a=4))`,
      answer: "5 8 4 7\n",
      hint: "Fill in defaults for whatever isn't passed.",
      explain: "1*2+3 = 5; 1*5+3 = 8; 2*2+0 = 4; 4*1+3 = 7.",
    },
    {
      id: "e2", kind: "mcq", difficulty: 3,
      prompt: "Which call is INVALID for `def g(x, /, y, *, z): ...`?",
      options: [
        { text: "`g(1, 2, z=3)`", why: "Valid." },
        { text: "`g(1, y=2, z=3)`", why: "Valid — y may be positional or keyword." },
        { text: "`g(x=1, y=2, z=3)`", why: "Correct — x is positional-only, so x=1 is not allowed." },
      ],
      answer: 2,
      hint: "What does `/` mean for x?",
      explain: "Parameters before `/` can only be passed by position.",
    },
    {
      id: "e3", kind: "fill", difficulty: 2,
      prompt: "Pass the function itself as the sort key.",
      code: r`names = ["Zoe", "asha", "Ravi"]
print(sorted(names, key=str.___))`,
      blanks: [["lower"]],
      output: "['asha', 'Ravi', 'Zoe']\n",
      hint: "A str method, without calling it.",
      explain: "`key=str.lower` sorts case-insensitively.",
    },
    {
      id: "e4", kind: "bug", difficulty: 3,
      prompt: "Each call should start a fresh history, but they accumulate. Which line?",
      code: r`def record(event, log={}):
    log[event] = log.get(event, 0) + 1
    return log

print(record("click"))
print(record("scroll"))`,
      line: 1,
      fix: r`def record(event, log=None):
    if log is None:
        log = {}
    log[event] = log.get(event, 0) + 1
    return log

print(record("click"))
print(record("scroll"))`,
      output: "{'click': 1}\n{'scroll': 1}\n",
      hint: "Mutable default argument.",
      explain: "The `{}` default is created once and shared between calls. Default to None and create a new dict inside.",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: unit converter toolkit", difficulty: 3,
    prompt: `Build a converter from small typed functions and a dispatch table. Read lines \`value from to\` until \`done\` and print each conversion rounded to 2 decimals, like \`10.0 km = 6.21 mi\`, or \`cannot convert km to kg\`.

Supported pairs (both directions): km↔mi (1 km = 0.621371 mi), kg↔lb (1 kg = 2.20462 lb), c↔f (F = C × 9/5 + 32).

Design: one function per conversion, a dict \`{(from, to): function}\`, and a \`convert(value, frm, to)\` function that returns the number or raises \`KeyError\` for unsupported pairs.`,
    starter: r`def km_to_mi(v: float) -> float:
    return v * 0.621371

`,
    tests: [
      { label: "Several", input: "10 km mi\n5 mi km\n100 c f\n212 f c\n2 kg lb\ndone\n", output: "10.0 km = 6.21 mi\n5.0 mi = 8.05 km\n100.0 c = 212.0 f\n212.0 f = 100.0 c\n2.0 kg = 4.41 lb" },
      { label: "Unsupported", input: "1 km kg\n10 lb kg\ndone\n", output: "cannot convert km to kg\n10.0 lb = 4.54 kg", hidden: true, category: "edge" },
    ],
    hints: [
      "Write the six small functions first.",
      "`CONVERSIONS = {(\"km\", \"mi\"): km_to_mi, ...}`.",
      "`convert` does `return CONVERSIONS[(frm, to)](value)` — a missing pair raises KeyError by itself.",
      "In the loop, `try: ... except KeyError: print(f\"cannot convert {frm} to {to}\")` (try/except is Module 16; an `if (frm, to) in CONVERSIONS` check works too).",
    ],
    solution: r`def km_to_mi(v: float) -> float:
    return v * 0.621371

def mi_to_km(v: float) -> float:
    return v / 0.621371

def kg_to_lb(v: float) -> float:
    return v * 2.20462

def lb_to_kg(v: float) -> float:
    return v / 2.20462

def c_to_f(v: float) -> float:
    return v * 9 / 5 + 32

def f_to_c(v: float) -> float:
    return (v - 32) * 5 / 9

CONVERSIONS = {
    ("km", "mi"): km_to_mi, ("mi", "km"): mi_to_km,
    ("kg", "lb"): kg_to_lb, ("lb", "kg"): lb_to_kg,
    ("c", "f"): c_to_f, ("f", "c"): f_to_c,
}

def convert(value: float, frm: str, to: str) -> float:
    """Convert value between units; KeyError if the pair isn't supported."""
    return CONVERSIONS[(frm, to)](value)

while True:
    line = input()
    if line == "done":
        break
    v, frm, to = line.split()
    value = float(v)
    if (frm, to) in CONVERSIONS:
        print(f"{value} {frm} = {round(convert(value, frm, to), 2)} {to}")
    else:
        print(f"cannot convert {frm} to {to}")`,
    notes: "Small pure functions + a dispatch table keyed by tuples: adding a unit pair is one function and one dict entry. The I/O loop stays separate from the logic.",
  },
};
