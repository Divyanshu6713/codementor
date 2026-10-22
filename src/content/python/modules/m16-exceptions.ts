import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 16 — Exception handling. */
export const M16: PyModuleDef = {
  id: "py-exceptions",
  number: 16,
  level: 3,
  title: "Exception Handling",
  summary: "Syntax errors vs runtime errors; built-in exceptions; try, except, else and finally; catching specific exceptions; raising exceptions; custom exception classes; exception chaining; assertions; defensive programming; debugging strategies.",
  track: "core",
  prereqs: ["py-files"],
  lessons: [
    {
      id: "py-try-except",
      title: "try, except, else and finally",
      minutes: 16,
      difficulty: 2,
      objectives: [
        "Catch specific exceptions with try/except",
        "Use else for the success path and finally for cleanup",
        "Recognise the common built-in exceptions",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "What happens to the rest of a `try` block after an exception is raised inside it?",
        options: [
          { text: "It continues with the next line", why: "Execution jumps out of the try block." },
          { text: "It's skipped; Python jumps to a matching except", why: "Correct." },
          { text: "The program always crashes", why: "Not if an except clause matches." },
        ],
        answer: 1,
        hint: "Exceptions interrupt the normal flow.",
        explain: "When an exception occurs, the rest of the try block is skipped and Python looks for a matching except clause.",
      },
      why: "Real programs meet bad input, missing files and network failures. Exception handling lets a program respond sensibly — ask again, use a default, report clearly — instead of crashing with a traceback in front of the user.",
      concept: [
        {
          title: "The shape of try",
          body: `\`\`\`python
try:
    age = int(input())          # might raise ValueError
except ValueError:
    print("Please type a whole number")
else:
    print("Next year you'll be", age + 1)   # only if no exception
finally:
    print("done")               # always, even after return or an error
\`\`\`

Keep the try block **small** — only the lines that can fail in the way you're handling.`,
        },
        {
          title: "Catching specific exceptions",
          body: `\`\`\`python
except (ValueError, TypeError):     # several types
except ZeroDivisionError as err:    # keep the exception object
    print("Problem:", err)
\`\`\`

Common built-ins: \`ValueError\`, \`TypeError\`, \`KeyError\`, \`IndexError\`, \`ZeroDivisionError\`, \`FileNotFoundError\`, \`AttributeError\`, \`NameError\`.

Avoid a bare \`except:\` or \`except Exception:\` that swallows everything — it hides real bugs (typos become silent failures). Catch what you can actually handle.`,
        },
        {
          title: "Syntax errors are different",
          body: `A \`SyntaxError\` happens before the program runs (Module 1), so \`try\` can't catch it in the same file. try/except handles **runtime** exceptions.`,
        },
      ],
      example: {
        title: "Reading numbers robustly",
        code: r`def safe_divide(a, b):
    try:
        result = a / b
    except ZeroDivisionError:
        return "cannot divide by zero"
    else:
        return round(result, 2)
    finally:
        print(f"  (tried {a} / {b})")

print(safe_divide(10, 4))
print(safe_divide(5, 0))
for text in ["42", "4.5", "abc"]:
    try:
        print(int(text) * 2)
    except ValueError as err:
        print("bad input:", err)`,
        output: "  (tried 10 / 4)\n2.5\n  (tried 5 / 0)\ncannot divide by zero\n84\nbad input: invalid literal for int() with base 10: '4.5'\nbad input: invalid literal for int() with base 10: 'abc'\n",
        lines: [
          [3, "The only line that can fail goes in the try block."],
          [4, "Handle exactly the error we expect."],
          [6, "else runs only when no exception happened."],
          [8, "finally runs in every case — even though both branches return."],
          [15, "int() raises ValueError for text that isn't a whole number."],
          [16, "`as err` gives the exception object; printing it shows the message."],
        ],
      },
      mistakes: [
        { title: "Bare except", body: "`except:` catches everything, including KeyboardInterrupt and typos (NameError). Name the exceptions." },
        { title: "Huge try blocks", body: "If 30 lines are inside try, you can't tell which one failed. Wrap only the risky call." },
        { title: "Silently passing", body: "`except ValueError: pass` hides problems. At least log or tell the user." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 2,
          code: r`try:
    print("A")
    x = [1, 2][5]
    print("B")
except IndexError:
    print("C")
else:
    print("D")
finally:
    print("E")`,
          answer: "A\nC\nE\n",
          hint: "Which lines run after the IndexError?",
          explain: "A prints, the index fails so B is skipped, the except prints C, else is skipped (there was an exception), finally prints E.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Catch a missing dictionary key.",
          code: r`stock = {"pens": 4}
try:
    print(stock["ink"])
except ___:
    print("not stocked")`,
          blanks: [["KeyError"]],
          output: "not stocked\n",
          hint: "The exception for a missing dict key.",
          explain: "`d[missing]` raises KeyError.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "A typo (`totl`) should crash loudly, but this program prints `invalid number` instead. Which line hides the bug?",
          code: r`text = "12"
try:
    total = int(text)
    print(totl * 2)
except Exception:
    print("invalid number")`,
          line: 5,
          fix: r`text = "12"
try:
    total = int(text)
except ValueError:
    print("invalid number")
else:
    print(total * 2)`,
          output: "24\n",
          hint: "What does `except Exception` also catch?",
          explain: "`except Exception` catches the NameError from the typo and reports it as bad input. Catch only ValueError around int(), and do the rest in else.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 2,
          prompt: "When does a `finally` block run?",
          options: [
            { text: "Only when an exception occurred", why: "It runs either way." },
            { text: "Always — after try/except/else, even if they return or raise", why: "Correct." },
            { text: "Only when no exception occurred", why: "That's else." },
          ],
          answer: 1,
          hint: "Cleanup must always happen.",
          explain: "finally is for cleanup that must happen no matter what.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Ask until it's valid", difficulty: 2,
          prompt: `Read lines until one is a valid whole number between 1 and 10. For each invalid line print \`not a number\` or \`out of range\`; for the valid one print \`OK: N\`.`,
          starter: r`while True:
    text = input()
`,
          tests: [
            { label: "Mixed", input: "abc\n15\n7\n", output: "not a number\nout of range\nOK: 7" },
            { label: "First try", input: "1\n", output: "OK: 1", category: "boundary" },
            { label: "Decimals and zero", input: "2.5\n0\n10\n", output: "not a number\nout of range\nOK: 10", hidden: true, category: "edge" },
          ],
          hints: [
            "Convert inside try; ValueError means it's not a whole number.",
            "Use `continue` after printing an error to ask again.",
            "Check the range in the else branch (or after the try).",
            "`break` once you print OK.",
          ],
          solution: r`while True:
    text = input()
    try:
        n = int(text)
    except ValueError:
        print("not a number")
        continue
    if 1 <= n <= 10:
        print("OK:", n)
        break
    print("out of range")`,
          notes: "The try block contains only the conversion; range checking is ordinary logic, not exception handling.",
        },
        {
          id: "stretch", kind: "task", title: "Safe calculator", difficulty: 3,
          prompt: `Read lines \`a op b\` until \`quit\`. Print the result, or an error message: \`error: division by zero\`, \`error: bad number\`, \`error: unknown operator\`, \`error: expected 3 parts\`. Results are printed as Python prints them (\`7 / 2\` → \`3.5\`).`,
          starter: r`OPS = {"+": lambda a, b: a + b, "-": lambda a, b: a - b, "*": lambda a, b: a * b, "/": lambda a, b: a / b}
`,
          tests: [
            { label: "Session", input: "7 / 2\n3 * x\n5 / 0\n2 ^ 3\n1 +\n4 - 9\nquit\n", output: "3.5\nerror: bad number\nerror: division by zero\nerror: unknown operator\nerror: expected 3 parts\n-5" },
            { label: "Just quit", input: "quit\n", output: "", hidden: true, category: "edge" },
          ],
          hints: [
            "Unpack `a, op, b = line.split()` — a ValueError if there aren't 3 parts.",
            "Convert with int() — ValueError again, but you need a different message: do it in a separate try.",
            "Look up the operator: KeyError if unknown.",
            "Call it inside try and catch ZeroDivisionError.",
          ],
          solution: r`OPS = {"+": lambda a, b: a + b, "-": lambda a, b: a - b, "*": lambda a, b: a * b, "/": lambda a, b: a / b}

while True:
    line = input()
    if line == "quit":
        break
    parts = line.split()
    if len(parts) != 3:
        print("error: expected 3 parts")
        continue
    a, op, b = parts
    try:
        a, b = int(a), int(b)
    except ValueError:
        print("error: bad number")
        continue
    try:
        func = OPS[op]
    except KeyError:
        print("error: unknown operator")
        continue
    try:
        print(func(a, b))
    except ZeroDivisionError:
        print("error: division by zero")`,
          notes: "Each risky step has its own small try with its own message. One giant try with a generic message would leave users guessing.",
        },
      ],
      realWorld: "Web servers catch exceptions per request so one bad request doesn't take the site down; data pipelines skip and log bad rows; CLI tools turn exceptions into clear messages and exit codes.",
      reteach: "try/except is a safety net under a trapeze act. `try` is the risky move; if it fails, the matching net (`except`) catches you; if it succeeds, you take a bow (`else`); and the crew always tidies the ring afterwards (`finally`). A net that catches *everything* also catches the act you didn't mean to drop — so use the right nets.",
      summary: [
        "try / except SpecificError / else (success) / finally (always).",
        "Catch specific exceptions; never a bare except; keep try blocks small.",
        "SyntaxErrors happen before running; try handles runtime exceptions.",
      ],
      cpp: {
        python: r`try:
    x = int(s)
except ValueError:
    x = 0`,
        cpp: r`try {
    x = std::stoi(s);
} catch (const std::invalid_argument&) {
    x = 0;
}`,
        note: "Same idea. Python uses exceptions much more freely (\"easier to ask forgiveness than permission\"); C++ code often prefers return codes for speed.",
      },
    },

    {
      id: "py-raising-custom",
      title: "Raising, custom exceptions and chaining",
      minutes: 16,
      difficulty: 3,
      objectives: [
        "Raise exceptions with clear messages",
        "Define custom exception classes for your own error cases",
        "Chain exceptions with `raise ... from ...` and re-raise correctly",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "Which statement signals an error from your own function?",
        options: [
          { text: "`return \"error\"`", why: "Callers may forget to check it." },
          { text: "`raise ValueError(\"age must be positive\")`", why: "Correct." },
          { text: "`print(\"error\")`", why: "The caller can't react to a print." },
        ],
        answer: 1,
        hint: "Make the problem impossible to ignore.",
        explain: "Raising an exception stops the function and forces callers to handle (or see) the problem.",
      },
      why: "Your functions are the first line of defence against bad data. Raising a clear, specific exception at the point of the problem — instead of returning a magic value — makes bugs show up early and makes libraries pleasant to use.",
      concept: [
        {
          title: "raise",
          body: `\`\`\`python
def set_age(age):
    if not isinstance(age, int):
        raise TypeError(f"age must be an int, not {type(age).__name__}")
    if age < 0:
        raise ValueError(f"age must be >= 0, got {age}")
    return age
\`\`\`

Pick the most fitting built-in (ValueError: right type, bad value; TypeError: wrong type; KeyError, LookupError …) and write a message that says what was expected and what was received.`,
        },
        {
          title: "Custom exceptions",
          body: `\`\`\`python
class BankError(Exception):
    """Base class for banking problems."""

class InsufficientFunds(BankError):
    def __init__(self, balance, amount):
        super().__init__(f"balance {balance} is less than {amount}")
        self.balance, self.amount = balance, amount
\`\`\`

A small hierarchy lets callers catch \`BankError\` for everything or \`InsufficientFunds\` specifically. (Classes are Module 17 — here you only need the pattern.)`,
        },
        {
          title: "Re-raising and chaining",
          body: `\`\`\`python
try:
    port = int(text)
except ValueError as err:
    raise ConfigError(f"bad port {text!r}") from err   # keeps the original cause

except SomeError:
    log_it()
    raise          # re-raise the same exception unchanged
\`\`\`

\`from err\` shows both errors in the traceback ("The above exception was the direct cause of…"). \`raise ... from None\` hides an irrelevant original.`,
        },
      ],
      example: {
        title: "A tiny bank with its own errors",
        code: r`class BankError(Exception):
    pass

class InsufficientFunds(BankError):
    pass

def withdraw(balance, amount):
    if amount <= 0:
        raise ValueError(f"amount must be positive, got {amount}")
    if amount > balance:
        raise InsufficientFunds(f"balance {balance} < {amount}")
    return balance - amount

for amount in [300, 2000, -5]:
    try:
        print("left:", withdraw(1000, amount))
    except InsufficientFunds as e:
        print("declined:", e)
    except ValueError as e:
        print("invalid:", e)
try:
    try:
        int("x")
    except ValueError as err:
        raise BankError("could not read amount") from err
except BankError as e:
    print(e, "| caused by", type(e.__cause__).__name__)`,
        output: "left: 700\ndeclined: balance 1000 < 2000\ninvalid: amount must be positive, got -5\ncould not read amount | caused by ValueError\n",
        lines: [
          [1, "A custom exception is a class that inherits from Exception."],
          [4, "A more specific one inherits from the base, forming a hierarchy."],
          [9, "Raise a built-in for bad arguments, with a precise message."],
          [11, "Raise the domain-specific error."],
          [17, "Callers handle each kind differently."],
          [24, "`from err` attaches the original ValueError as the cause."],
        ],
      },
      mistakes: [
        { title: "Raising Exception directly", body: "`raise Exception(\"bad\")` forces callers to catch everything. Use a specific built-in or your own subclass." },
        { title: "Losing the original error", body: "`except ValueError: raise ConfigError(...)` without `from err` makes debugging harder." },
        { title: "Vague messages", body: "\"invalid input\" — which input, what was expected? Include the value and the rule." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`class AppError(Exception): pass
class NotFound(AppError): pass

for exc in [NotFound("x"), AppError("y"), KeyError("z")]:
    try:
        raise exc
    except NotFound:
        print("not found")
    except AppError:
        print("app error")
    except Exception as e:
        print("other", type(e).__name__)`,
          answer: "not found\napp error\nother KeyError\n",
          hint: "except clauses are tried in order; a subclass matches its base too.",
          explain: "NotFound matches the first clause; AppError matches the second; KeyError only matches the general one.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Signal an invalid argument.",
          code: r`def sqrt(x):
    if x < 0:
        ___ ValueError("x must be non-negative")
    return x ** 0.5

try:
    sqrt(-1)
except ValueError as e:
    print(e)`,
          blanks: [["raise"]],
          output: "x must be non-negative\n",
          hint: "The keyword that throws an exception.",
          explain: "`raise ValueError(...)` stops the function and signals the problem.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "This custom exception can't be caught as an exception — Python complains. Which line?",
          code: r`class QuotaExceeded:
    pass

try:
    raise QuotaExceeded()
except QuotaExceeded:
    print("slow down")`,
          line: 1,
          fix: r`class QuotaExceeded(Exception):
    pass

try:
    raise QuotaExceeded()
except QuotaExceeded:
    print("slow down")`,
          output: "slow down\n",
          hint: "What must every exception class inherit from?",
          explain: "Only subclasses of BaseException (normally Exception) can be raised: `TypeError: exceptions must derive from BaseException`.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "What does `raise NewError(\"...\") from err` add?",
          options: [
            { text: "It suppresses err", why: "That's `from None`." },
            { text: "It records err as the cause, so the traceback shows both", why: "Correct." },
            { text: "It converts err into NewError", why: "A new exception is raised; err is kept as __cause__." },
          ],
          answer: 1,
          hint: "Chaining.",
          explain: "Explicit chaining sets `__cause__`, preserving the original error for debugging.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Validate a username", difficulty: 2,
          prompt: `Write \`validate(name)\` that raises \`ValueError\` with these exact messages, or returns the name lower-cased:

- empty → \`username is required\`
- shorter than 3 → \`username too short\`
- contains anything but letters/digits/underscore → \`invalid character\`

The given code prints \`ok: NAME\` or \`error: MESSAGE\` for each input line until \`end\`.`,
          starter: r`def validate(name):
    return name.lower()

while (line := input()) != "end":
    try:
        print("ok:", validate(line))
    except ValueError as e:
        print("error:", e)`,
          tests: [
            { label: "Mixed", input: "Asha_9\nab\nhello world\nend\n", output: "ok: asha_9\nerror: username too short\nerror: invalid character" },
            { label: "Empty line", input: "\nRAVI\nend\n", output: "error: username is required\nok: ravi", hidden: true, category: "edge" },
          ],
          hints: [
            "Check the rules in order: empty, short, characters.",
            "`if not name: raise ValueError(\"username is required\")`.",
            "Characters: `all(c.isalnum() or c == \"_\" for c in name)`.",
            "Return `name.lower()` at the end.",
          ],
          solution: r`def validate(name):
    if not name:
        raise ValueError("username is required")
    if len(name) < 3:
        raise ValueError("username too short")
    if not all(c.isalnum() or c == "_" for c in name):
        raise ValueError("invalid character")
    return name.lower()

while (line := input()) != "end":
    try:
        print("ok:", validate(line))
    except ValueError as e:
        print("error:", e)`,
          notes: "`(line := input())` is the walrus operator (3.8+): assign and test in one expression. The function raises; the caller decides how to report.",
        },
        {
          id: "stretch", kind: "task", title: "Config loader with chained errors", difficulty: 4,
          prompt: `Define \`ConfigError(Exception)\`. Write \`parse_port(text)\` that returns an int port 1–65535, raising \`ConfigError("port must be a number") from\` the ValueError for non-numbers, and \`ConfigError("port out of range")\` otherwise. For each input line until \`end\`, print the port, or \`ConfigError: MESSAGE (cause: CAUSE)\` where CAUSE is the cause's class name or \`none\`.`,
          starter: r`class ConfigError(Exception):
    pass

def parse_port(text):
    pass
`,
          tests: [
            { label: "Mixed", input: "8080\nhttp\n70000\nend\n", output: "8080\nConfigError: port must be a number (cause: ValueError)\nConfigError: port out of range (cause: none)" },
            { label: "Boundaries", input: "1\n65535\n0\nend\n", output: "1\n65535\nConfigError: port out of range (cause: none)", hidden: true, category: "boundary" },
          ],
          hints: [
            "Convert inside try; in `except ValueError as err:` raise ConfigError(...) from err.",
            "Check the range after a successful conversion.",
            "When catching ConfigError, look at `e.__cause__`.",
            "`cause = type(e.__cause__).__name__ if e.__cause__ else \"none\"`.",
          ],
          solution: r`class ConfigError(Exception):
    pass

def parse_port(text):
    try:
        port = int(text)
    except ValueError as err:
        raise ConfigError("port must be a number") from err
    if not 1 <= port <= 65535:
        raise ConfigError("port out of range")
    return port

while (line := input()) != "end":
    try:
        print(parse_port(line))
    except ConfigError as e:
        cause = type(e.__cause__).__name__ if e.__cause__ else "none"
        print(f"ConfigError: {e} (cause: {cause})")`,
          notes: "Callers only need to know about ConfigError; the original ValueError is still attached for whoever debugs it.",
        },
      ],
      realWorld: "Libraries define exception hierarchies so you can catch exactly what you need: `requests.exceptions.Timeout` (a subclass of `RequestException`), Django's `ObjectDoesNotExist`, `json.JSONDecodeError` (a ValueError).",
      reteach: "Raising an exception is pulling a fire alarm with a note attached saying exactly what's wrong. Custom exceptions are different alarm tones — 'fire' versus 'flood' — so the right people respond. Chaining (`from`) staples the original incident report to the new note.",
      summary: [
        "`raise SomeError(\"clear message\")` stops the function and signals the problem.",
        "Custom exceptions subclass Exception; build small hierarchies for your domain.",
        "`raise New(...) from err` keeps the cause; bare `raise` re-raises the current exception.",
      ],
    },

    {
      id: "py-defensive-debugging",
      title: "Assertions, defensive programming and debugging",
      minutes: 15,
      difficulty: 3,
      objectives: [
        "Use `assert` for internal checks — and know its limits",
        "Validate inputs at the boundaries of your program",
        "Debug systematically with tracebacks, prints, logging and pdb",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "Should you use `assert` to check that a user typed a valid age?",
        options: [
          { text: "Yes, that's what assert is for", why: "Assertions can be disabled with `python -O`, so they're not for validating input." },
          { text: "No — assertions are for internal 'this should never happen' checks; validate input with if + raise", why: "Correct." },
          { text: "Only for numbers", why: "The rule is about purpose, not type." },
        ],
        answer: 1,
        hint: "What happens to asserts with python -O?",
        explain: "Assertions are removed when Python runs with -O, so never rely on them for user input or security.",
      },
      why: "Good programs fail early and clearly. Assertions document assumptions inside your code, validation protects its edges, and a calm debugging process turns a confusing failure into a fix in minutes instead of hours.",
      concept: [
        {
          title: "assert",
          body: `\`\`\`python
def average(values):
    assert len(values) > 0, "average() needs at least one value"
    return sum(values) / len(values)
\`\`\`

If the condition is False, Python raises \`AssertionError\` with the message. Use assertions for **programmer errors** (a broken assumption), not for user input — they're skipped under \`python -O\`.`,
        },
        {
          title: "Defensive programming",
          body: `- **Validate at the boundary**: when data enters (user input, files, APIs), check types, ranges and required fields — and raise or report clearly.
- **Fail fast**: detect problems where they happen, not three functions later.
- **Don't trust, verify**: \`dict.get\` with defaults, checking for \`None\`, guarding divisions.
- **But don't over-guard internal code**: inside your own well-tested functions, excess checks add noise.`,
        },
        {
          title: "A debugging method",
          body: `1. **Reproduce** with the smallest input that fails.
2. **Read the traceback** bottom-up: error type, message, your line.
3. **Inspect values** at that point: \`print(repr(x))\`, CodeMentor's Step through, or the debugger (\`breakpoint()\` opens **pdb**: \`n\` next line, \`s\` step into, \`p x\` print, \`c\` continue).
4. **Form one hypothesis**, change one thing, rerun.
5. **Add a test** so the bug can't come back (Module 29).

\`logging\` (Module 21) replaces scattered prints in larger programs.`,
        },
      ],
      example: {
        title: "Checks at the edges, assertions inside",
        code: r`def parse_marks(line):
    marks = []
    for part in line.split(","):
        part = part.strip()
        if not part.isdigit():
            raise ValueError(f"not a mark: {part!r}")
        m = int(part)
        if m > 100:
            raise ValueError(f"mark above 100: {m}")
        marks.append(m)
    return marks

def average(marks):
    assert marks, "average() called with an empty list"
    return round(sum(marks) / len(marks), 1)

for line in ["90, 80, 70", "90, x", "", "101"]:
    try:
        print(average(parse_marks(line)))
    except ValueError as e:
        print("input problem:", e)
    except AssertionError as e:
        print("bug:", e)`,
        output: "80.0\ninput problem: not a mark: 'x'\ninput problem: not a mark: ''\ninput problem: mark above 100: 101\n",
        lines: [
          [5, "Validate input at the boundary and report precisely (`!r` shows quotes)."],
          [8, "Range check with the offending value in the message."],
          [14, "An assertion documents an internal assumption: by now the list can't be empty."],
          [19, "Bad input is reported, not crashed on."],
          [22, "An AssertionError would mean a bug in our own logic — here it never happens because parse_marks rejects empty input."],
        ],
      },
      mistakes: [
        { title: "assert for validation", body: "Disabled with -O; use if + raise for anything users can trigger." },
        { title: "`assert(x, \"msg\")`", body: "That asserts a non-empty tuple — always True! Write `assert x, \"msg\"` without brackets." },
        { title: "Debugging by guessing", body: "Changing random things wastes time. Reproduce, read, inspect, then change one thing." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`def f(x):
    assert x >= 0, f"negative: {x}"
    return x * 2

for v in [3, -1]:
    try:
        print(f(v))
    except AssertionError as e:
        print("AssertionError:", e)`,
          answer: "6\nAssertionError: negative: -1\n",
          hint: "The message after the comma becomes the exception's text.",
          explain: "3 passes; -1 fails the assertion, raising AssertionError with the formatted message.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Assert that the list isn't empty, with a message.",
          code: r`items = [1]
___ items, "items must not be empty"
print("fine")`,
          blanks: [["assert"]],
          output: "fine\n",
          hint: "The keyword for internal checks.",
          explain: "`assert condition, message`.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "This assertion never fails, even for an empty list. Which line?",
          code: r`def first(items):
    assert(len(items) > 0, "empty list")
    return items[0]

try:
    first([])
except IndexError:
    print("IndexError slipped through")
except AssertionError:
    print("caught by assert")`,
          line: 2,
          fix: r`def first(items):
    assert len(items) > 0, "empty list"
    return items[0]

try:
    first([])
except IndexError:
    print("IndexError slipped through")
except AssertionError:
    print("caught by assert")`,
          output: "caught by assert\n",
          hint: "What is `(condition, message)` in Python?",
          explain: "With brackets, assert checks a two-item tuple, which is always truthy. Remove the brackets. (Python 3.12 even warns: 'assertion is always true'.)",
        },
        {
          id: "m1", kind: "mcq", difficulty: 2,
          prompt: "In pdb, which command runs the next line without stepping into function calls?",
          options: [
            { text: "`s`", why: "s steps INTO calls." },
            { text: "`n`", why: "Correct — next." },
            { text: "`c`", why: "c continues until the next breakpoint." },
          ],
          answer: 1,
          hint: "n for next.",
          explain: "n = next line, s = step into, c = continue, p expr = print.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Validate a record", difficulty: 3,
          prompt: `Write \`check_record(rec)\` for dicts like \`{"name": "Asha", "age": 16, "email": "a@x.in"}\`. Raise \`ValueError\` with these messages (first failing rule wins): \`missing NAME\` for a missing key (check name, age, email in that order), \`age must be 5-120\`, \`email needs @\`. Return \`True\` if valid. The given code tests several records.`,
          starter: r`def check_record(rec):
    return True

records = [
    {"name": "Asha", "age": 16, "email": "a@x.in"},
    {"name": "Ravi", "email": "r@x.in"},
    {"name": "Zoe", "age": 200, "email": "z@x.in"},
    {"name": "Dev", "age": 30, "email": "dev.example"},
]
for rec in records:
    try:
        print(check_record(rec))
    except ValueError as e:
        print("invalid:", e)`,
          tests: [{ label: "Four records", input: "", output: "True\ninvalid: missing age\ninvalid: age must be 5-120\ninvalid: email needs @" }],
          hints: [
            "Loop over the required keys first.",
            "`for key in (\"name\", \"age\", \"email\"): if key not in rec: raise ValueError(f\"missing {key}\")`.",
            "Then check `5 <= rec[\"age\"] <= 120`.",
            "Finally `\"@\" in rec[\"email\"]`.",
          ],
          solution: r`def check_record(rec):
    for key in ("name", "age", "email"):
        if key not in rec:
            raise ValueError(f"missing {key}")
    if not 5 <= rec["age"] <= 120:
        raise ValueError("age must be 5-120")
    if "@" not in rec["email"]:
        raise ValueError("email needs @")
    return True

records = [
    {"name": "Asha", "age": 16, "email": "a@x.in"},
    {"name": "Ravi", "email": "r@x.in"},
    {"name": "Zoe", "age": 200, "email": "z@x.in"},
    {"name": "Dev", "age": 30, "email": "dev.example"},
]
for rec in records:
    try:
        print(check_record(rec))
    except ValueError as e:
        print("invalid:", e)`,
          notes: "Validation at the boundary with precise messages. Libraries like pydantic (Module 24/34) automate exactly this.",
        },
        {
          id: "stretch", kind: "debug", title: "Find the bug with a trace", difficulty: 3,
          prompt: `\`median(values)\` sometimes returns the wrong answer. Use Step through (or prints) to find why, and fix it. Expected:

\`\`\`
3
2.5
7
\`\`\``,
          starter: r`def median(values):
    ordered = sorted(values)
    mid = len(ordered) // 2
    if len(ordered) % 2 == 1:
        return ordered[mid]
    return (ordered[mid] + ordered[mid + 1]) / 2

print(median([5, 1, 3]))
print(median([4, 1, 3, 2]))
print(median([7]))`,
          tests: [{ label: "Three cases", input: "", output: "3\n2.5\n7" }],
          hints: [
            "Which case is wrong? Trace the even-length list [1, 2, 3, 4].",
            "For 4 items, mid is 2. Which two items are the middle ones?",
            "The middle pair is at indexes mid - 1 and mid.",
            "Change `ordered[mid + 1]` to `ordered[mid - 1]`.",
          ],
          solution: r`def median(values):
    ordered = sorted(values)
    mid = len(ordered) // 2
    if len(ordered) % 2 == 1:
        return ordered[mid]
    return (ordered[mid - 1] + ordered[mid]) / 2

print(median([5, 1, 3]))
print(median([4, 1, 3, 2]))
print(median([7]))`,
          notes: "An off-by-one in the even case: tracing [1, 2, 3, 4] shows mid = 2 picks 3 and 4. A test for each case (odd, even, single) would have caught it immediately.",
        },
      ],
      realWorld: "Production systems validate every request at the API boundary, use assertions and invariants in critical code, and rely on logs and debuggers to find bugs. Post-mortems often end with 'add a test and an earlier check'.",
      reteach: "Validation is the security guard at the entrance checking everyone's pass (user input). Assertions are the notes you leave for yourself inside the building: 'this door should always be locked' — if it isn't, *you* made a mistake. Debugging is detective work: recreate the scene, read the evidence, test one theory at a time.",
      summary: [
        "`assert cond, msg` for internal assumptions only (disabled by -O); validate input with if + raise.",
        "Validate at the boundaries, fail fast, report precisely.",
        "Debug: reproduce small → read traceback → inspect values (Step through, pdb) → change one thing → add a test.",
      ],
    },
  ],
  exam: [
    {
      id: "e1", kind: "predict", difficulty: 3,
      code: r`def risky(n):
    try:
        return 10 // n
    except ZeroDivisionError:
        return -1
    finally:
        print("cleanup", n)

print(risky(5))
print(risky(0))`,
      answer: "cleanup 5\n2\ncleanup 0\n-1\n",
      hint: "finally runs before the function actually returns.",
      explain: "The return value is computed, then finally prints, then the caller prints the value.",
    },
    {
      id: "e2", kind: "mcq", difficulty: 3,
      prompt: "Which order of except clauses is correct?",
      options: [
        { text: "`except Exception:` then `except ValueError:`", why: "The ValueError clause can never run — Exception catches it first." },
        { text: "`except ValueError:` then `except Exception:`", why: "Correct — specific before general." },
        { text: "Order doesn't matter", why: "The first matching clause wins." },
      ],
      answer: 1,
      hint: "First match wins.",
      explain: "Put specific exception types before their base classes.",
    },
    {
      id: "e3", kind: "fill", difficulty: 3,
      prompt: "Keep the original error as the cause.",
      code: r`class ParseError(Exception): pass
try:
    try:
        float("abc")
    except ValueError as err:
        raise ParseError("bad float") ___ err
except ParseError as e:
    print(type(e.__cause__).__name__)`,
      blanks: [["from"]],
      output: "ValueError\n",
      hint: "Exception chaining keyword.",
      explain: "`raise New(...) from err` sets `__cause__`.",
    },
    {
      id: "e4", kind: "bug", difficulty: 2,
      prompt: "This should print `bad` for the non-number, but the program crashes. Which line?",
      code: r`text = "ten"
try:
    n = int(text)
except TypeError:
    print("bad")`,
      line: 4,
      fix: r`text = "ten"
try:
    n = int(text)
except ValueError:
    print("bad")`,
      output: "bad\n",
      hint: "Which exception does int(\"ten\") raise?",
      explain: "int() on bad text raises ValueError, not TypeError, so the except clause doesn't match.",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: robust order processor", difficulty: 4,
    prompt: `Process order lines \`item quantity\` until \`end\` against a fixed price list. Define \`OrderError(Exception)\` with subclasses \`UnknownItem\` and \`BadQuantity\`. Write \`process(line)\` that returns the line total or raises the right error (quantity must be a whole number 1–20). Print each result as \`item x qty = total\` or \`rejected: MESSAGE\`, then \`accepted N, rejected M, total T\`.

Prices: tea 15, coffee 25, sandwich 60.`,
    starter: r`PRICES = {"tea": 15, "coffee": 25, "sandwich": 60}
`,
    tests: [
      { label: "Mixed orders", input: "tea 2\ncoffee x\npizza 1\nsandwich 21\nsandwich 3\nend\n", output: "tea x 2 = 30\nrejected: quantity must be a number\nrejected: unknown item: pizza\nrejected: quantity must be 1-20\nsandwich x 3 = 180\naccepted 2, rejected 3, total 210" },
      { label: "All good", input: "tea 1\nend\n", output: "tea x 1 = 15\naccepted 1, rejected 0, total 15", hidden: true },
    ],
    hints: [
      "Define the three exception classes first.",
      "In process: split, look up the price (KeyError → UnknownItem), convert the quantity (ValueError → BadQuantity), check the range.",
      "Use `raise UnknownItem(f\"unknown item: {item}\") from None` to keep messages clean.",
      "In the loop catch OrderError (covers both subclasses) and count.",
    ],
    solution: r`PRICES = {"tea": 15, "coffee": 25, "sandwich": 60}

class OrderError(Exception):
    pass

class UnknownItem(OrderError):
    pass

class BadQuantity(OrderError):
    pass

def process(line):
    item, qty_text = line.split()
    if item not in PRICES:
        raise UnknownItem(f"unknown item: {item}")
    try:
        qty = int(qty_text)
    except ValueError:
        raise BadQuantity("quantity must be a number") from None
    if not 1 <= qty <= 20:
        raise BadQuantity("quantity must be 1-20")
    return item, qty, PRICES[item] * qty

accepted = rejected = total = 0
while (line := input()) != "end":
    try:
        item, qty, amount = process(line)
    except OrderError as e:
        rejected += 1
        print("rejected:", e)
    else:
        accepted += 1
        total += amount
        print(f"{item} x {qty} = {amount}")
print(f"accepted {accepted}, rejected {rejected}, total {total}")`,
    notes: "A small exception hierarchy lets the loop handle every order problem with one except clause, while each error still carries a precise message.",
  },
};
