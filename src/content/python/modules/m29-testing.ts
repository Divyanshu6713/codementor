import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 29 — Testing and code quality. */
export const M29: PyModuleDef = {
  id: "py-testing",
  number: 29,
  level: 4,
  title: "Testing and Code Quality",
  summary: "Why testing matters; unittest; pytest; assertions; fixtures; parametrised tests; mocking; test-driven development; coverage; linting; formatting; static analysis; code reviews; continuous integration basics.",
  track: "core",
  prereqs: ["py-exceptions", "py-oop"],
  lessons: [
    {
      id: "py-unittest",
      title: "Writing tests with unittest",
      minutes: 17,
      difficulty: 3,
      objectives: [
        "Explain what automated tests protect against",
        "Write `unittest.TestCase` classes with assertion methods",
        "Test error cases with `assertRaises` and share setup with `setUp`",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "What is the main value of an automated test suite?",
        options: [
          { text: "It proves the code has no bugs", why: "Tests can show bugs exist, not that none exist." },
          { text: "It catches regressions quickly whenever code changes", why: "Correct." },
          { text: "It makes code run faster", why: "Tests don't change speed." },
        ],
        answer: 1,
        hint: "What happens when you change code six months later?",
        explain: "Tests re-check behaviour every time you change something, so a broken feature is noticed in seconds instead of by a user.",
      },
      why: "Every time you change code you risk breaking something that used to work. Checking by hand is slow and easily skipped; automated tests check everything in seconds, every time. Professional teams don't merge code without them.",
      concept: [
        {
          title: "A unittest test case",
          body: `\`\`\`python
import unittest

def add(a, b):
    return a + b

class TestAdd(unittest.TestCase):
    def test_positive(self):
        self.assertEqual(add(2, 3), 5)
    def test_negative(self):
        self.assertEqual(add(-1, -1), -2)

if __name__ == "__main__":
    unittest.main()
\`\`\`

- Test methods start with \`test_\`; each tests **one behaviour**.
- Assertions: \`assertEqual\`, \`assertTrue\`, \`assertIn\`, \`assertIsNone\`, \`assertAlmostEqual\` (floats), \`assertRaises\`.
- \`setUp\` runs before **each** test (fresh objects every time); \`tearDown\` after.`,
        },
        {
          title: "What to test",
          body: `- **Normal cases** — typical inputs.
- **Edge cases** — empty, zero, one item, maximum, boundaries (exactly 18 for "adult").
- **Error cases** — invalid input raises the right exception.

Tests should be **independent** (any order), **fast** and **deterministic** (no real network, clock or randomness without control).

In CodeMentor we run the suite with a quiet runner and print the counts, because unittest's normal output includes timings that change on every run.`,
        },
      ],
      example: {
        title: "Testing a small class",
        code: r`import io, unittest

class Wallet:
    def __init__(self, balance=0):
        self.balance = balance
    def spend(self, amount):
        if amount <= 0:
            raise ValueError("amount must be positive")
        if amount > self.balance:
            raise ValueError("insufficient funds")
        self.balance -= amount

class TestWallet(unittest.TestCase):
    def setUp(self):
        self.wallet = Wallet(100)
    def test_spend_reduces_balance(self):
        self.wallet.spend(30)
        self.assertEqual(self.wallet.balance, 70)
    def test_spend_everything(self):
        self.wallet.spend(100)
        self.assertEqual(self.wallet.balance, 0)
    def test_overspend_raises(self):
        with self.assertRaises(ValueError):
            self.wallet.spend(101)
    def test_zero_rejected(self):
        with self.assertRaisesRegex(ValueError, "positive"):
            self.wallet.spend(0)

suite = unittest.defaultTestLoader.loadTestsFromTestCase(TestWallet)
result = unittest.TextTestRunner(stream=io.StringIO()).run(suite)
print("ran", result.testsRun, "failures", len(result.failures), "errors", len(result.errors))
print("OK" if result.wasSuccessful() else "FAILED")`,
        output: "ran 4 failures 0 errors 0\nOK\n",
        lines: [
          [13, "A test class inherits from unittest.TestCase."],
          [14, "setUp runs before every test, so each starts with a fresh Wallet(100)."],
          [19, "An edge case: spending exactly the whole balance must be allowed."],
          [23, "assertRaises passes only if the block raises ValueError."],
          [26, "assertRaisesRegex also checks the error message."],
          [29, "Load all test_ methods from the class into a suite."],
          [30, "Run quietly (output into a StringIO) and inspect the result object."],
        ],
      },
      mistakes: [
        { title: "Tests that depend on each other", body: "If test B needs test A to run first, both break randomly. Use setUp for shared preparation." },
        { title: "Only testing the happy path", body: "Most bugs live at boundaries and in error handling. Test empty, zero, maximum and invalid input." },
        { title: "Comparing floats with assertEqual", body: "0.1 + 0.2 != 0.3. Use assertAlmostEqual." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`import io, unittest
class T(unittest.TestCase):
    def test_a(self):
        self.assertEqual(2 * 3, 6)
    def test_b(self):
        self.assertIn("z", "abc")
    def helper(self):
        self.fail("never runs")
suite = unittest.defaultTestLoader.loadTestsFromTestCase(T)
res = unittest.TextTestRunner(stream=io.StringIO()).run(suite)
print(res.testsRun, len(res.failures))`,
          answer: "2 1\n",
          hint: "Only methods starting with test_ are tests.",
          explain: "test_a passes, test_b fails ('z' is not in 'abc'); helper isn't a test. 2 run, 1 failure.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Assert that converting 'abc' raises ValueError.",
          code: r`import io, unittest
class T(unittest.TestCase):
    def test_bad_number(self):
        with self.___(ValueError):
            int("abc")
res = unittest.TextTestRunner(stream=io.StringIO()).run(unittest.defaultTestLoader.loadTestsFromTestCase(T))
print(res.wasSuccessful())`,
          blanks: [["assertRaises"]],
          output: "True\n",
          hint: "Assert that it raises.",
          explain: "`with self.assertRaises(ValueError):` passes only if the block raises that exception.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "This test should pass — 0.1 + 0.2 is mathematically 0.3 — but it fails. Which line should change?",
          code: r`import io, unittest
class T(unittest.TestCase):
    def test_sum(self):
        self.assertEqual(0.1 + 0.2, 0.3)
res = unittest.TextTestRunner(stream=io.StringIO()).run(unittest.defaultTestLoader.loadTestsFromTestCase(T))
print(res.wasSuccessful())`,
          line: 4,
          fix: r`import io, unittest
class T(unittest.TestCase):
    def test_sum(self):
        self.assertAlmostEqual(0.1 + 0.2, 0.3)
res = unittest.TextTestRunner(stream=io.StringIO()).run(unittest.defaultTestLoader.loadTestsFromTestCase(T))
print(res.wasSuccessful())`,
          output: "True\n",
          hint: "Floating-point numbers are approximations.",
          explain: "0.1 + 0.2 is 0.30000000000000004. assertAlmostEqual compares to 7 decimal places.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 2,
          prompt: "For `is_adult(age)` (adult = 18 or older), which set of test inputs is best?",
          options: [
            { text: "25 and 40", why: "Both far from the boundary." },
            { text: "17, 18 and a negative number", why: "Correct: both sides of the boundary plus invalid input." },
            { text: "Only 18", why: "Misses the other side and errors." },
          ],
          answer: 1,
          hint: "Where are off-by-one bugs?",
          explain: "Boundary values (17 vs 18) catch `>` vs `>=` mistakes, and invalid input checks error handling.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Tests that catch the bug", difficulty: 3,
          prompt: `The starter has a correct \`grade(score)\` and a buggy copy \`grade_buggy\` (it uses \`>\` instead of \`>=\` at one boundary). Grades: 90+ A, 75+ B, 50+ C, else F; scores outside 0–100 raise ValueError.

Write a function \`make_tests(fn)\` that returns a TestCase class testing \`fn\` with at least: one score per grade, the boundaries 90, 75 and 50, and an invalid score. Run it against both functions and print \`grade: OK\` / \`grade: FAILED\` and the same for \`grade_buggy\`.`,
          starter: r`import io, unittest

def grade(score):
    if not 0 <= score <= 100:
        raise ValueError("score out of range")
    if score >= 90: return "A"
    if score >= 75: return "B"
    if score >= 50: return "C"
    return "F"

def grade_buggy(score):
    if not 0 <= score <= 100:
        raise ValueError("score out of range")
    if score >= 90: return "A"
    if score > 75: return "B"
    if score >= 50: return "C"
    return "F"

def make_tests(fn):
    class GradeTests(unittest.TestCase):
        pass
    return GradeTests
`,
          tests: [{ label: "Both versions", input: "", output: "grade: OK\ngrade_buggy: FAILED" }],
          hints: [
            "Inside the nested class, call `fn(...)` — the class can see make_tests' parameter.",
            "Add methods like `def test_boundaries(self): self.assertEqual(fn(75), \"B\")`.",
            "Run: `unittest.TextTestRunner(stream=io.StringIO()).run(unittest.defaultTestLoader.loadTestsFromTestCase(make_tests(f)))`.",
            "Print the function's `__name__` and OK/FAILED from `wasSuccessful()`.",
          ],
          solution: r`import io, unittest

def grade(score):
    if not 0 <= score <= 100:
        raise ValueError("score out of range")
    if score >= 90: return "A"
    if score >= 75: return "B"
    if score >= 50: return "C"
    return "F"

def grade_buggy(score):
    if not 0 <= score <= 100:
        raise ValueError("score out of range")
    if score >= 90: return "A"
    if score > 75: return "B"
    if score >= 50: return "C"
    return "F"

def make_tests(fn):
    class GradeTests(unittest.TestCase):
        def test_each_grade(self):
            self.assertEqual(fn(95), "A")
            self.assertEqual(fn(80), "B")
            self.assertEqual(fn(60), "C")
            self.assertEqual(fn(10), "F")
        def test_boundaries(self):
            self.assertEqual(fn(90), "A")
            self.assertEqual(fn(75), "B")
            self.assertEqual(fn(50), "C")
            self.assertEqual(fn(49), "F")
        def test_invalid(self):
            with self.assertRaises(ValueError):
                fn(101)
    return GradeTests

for f in (grade, grade_buggy):
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(make_tests(f))
    result = unittest.TextTestRunner(stream=io.StringIO()).run(suite)
    print(f"{f.__name__}: {'OK' if result.wasSuccessful() else 'FAILED'}")`,
          notes: "A test suite is only as good as the bugs it catches. Without the exact boundary 75, both versions pass — which is why boundary tests matter.",
        },
        {
          id: "stretch", kind: "task", title: "Test a stack class", difficulty: 4,
          prompt: `Implement \`Stack\` with \`push\`, \`pop\` (raises \`IndexError("pop from empty stack")\` when empty), \`peek\` (same error) and \`__len__\`. Then write a \`TestStack\` TestCase with **at least 5** tests (use setUp) covering push/pop order, peek not removing, len, and both empty errors. Run it quietly and print \`all passed: True\` and \`at least 5 tests: True\`.`,
          starter: r`import io, unittest

class Stack:
    pass
`,
          tests: [{ label: "Suite", input: "", output: "all passed: True\nat least 5 tests: True" }],
          hints: [
            "Store items in a list; pop from the end.",
            "In pop/peek: `if not self._items: raise IndexError(...)`.",
            "setUp: `self.s = Stack()`.",
            "Print `result.wasSuccessful()` and `result.testsRun >= 5`.",
          ],
          solution: r`import io, unittest

class Stack:
    def __init__(self):
        self._items = []
    def push(self, item):
        self._items.append(item)
    def pop(self):
        if not self._items:
            raise IndexError("pop from empty stack")
        return self._items.pop()
    def peek(self):
        if not self._items:
            raise IndexError("peek from empty stack")
        return self._items[-1]
    def __len__(self):
        return len(self._items)

class TestStack(unittest.TestCase):
    def setUp(self):
        self.s = Stack()
    def test_new_stack_is_empty(self):
        self.assertEqual(len(self.s), 0)
    def test_pop_returns_last_pushed(self):
        self.s.push(1)
        self.s.push(2)
        self.assertEqual(self.s.pop(), 2)
        self.assertEqual(self.s.pop(), 1)
    def test_peek_does_not_remove(self):
        self.s.push("x")
        self.assertEqual(self.s.peek(), "x")
        self.assertEqual(len(self.s), 1)
    def test_pop_empty_raises(self):
        with self.assertRaises(IndexError):
            self.s.pop()
    def test_peek_empty_raises(self):
        with self.assertRaises(IndexError):
            self.s.peek()

suite = unittest.defaultTestLoader.loadTestsFromTestCase(TestStack)
result = unittest.TextTestRunner(stream=io.StringIO()).run(suite)
print("all passed:", result.wasSuccessful())
print("at least 5 tests:", result.testsRun >= 5)`,
          notes: "The judge only checks that your suite runs and passes; the real value is in what your tests cover. Ask yourself: if I broke pop, would one of my tests fail?",
        },
      ],
      realWorld: "Every serious Python project (Django, requests, pandas) has thousands of tests that run on every pull request; a red test blocks the merge.",
      reteach: "A test is a robot that re-asks the same exam question every time you change your code: 'what's add(2, 3)?' If the answer ever changes from 5, the robot shouts. Good exams include tricky questions — the boundaries and the invalid answers — not just the easy ones.",
      summary: [
        "unittest: TestCase classes, test_ methods, assert* methods, setUp for fresh state.",
        "Test normal, boundary and error cases; keep tests independent, fast and deterministic.",
        "assertRaises / assertRaisesRegex for errors; assertAlmostEqual for floats.",
      ],
      cpp: {
        python: r`class TestAdd(unittest.TestCase):
    def test_add(self):
        self.assertEqual(add(2, 3), 5)`,
        cpp: r`// GoogleTest
TEST(AddTest, Positive) {
    EXPECT_EQ(add(2, 3), 5);
}`,
        note: "Same idea in both: named tests grouped by subject, with equality assertions. C++ needs a test framework library (GoogleTest, Catch2); Python ships unittest.",
      },
    },

    {
      id: "py-pytest-mock",
      title: "pytest style, fixtures, parametrising and mocking",
      minutes: 18,
      difficulty: 4,
      objectives: [
        "Read and write pytest-style tests with plain `assert`",
        "Understand fixtures and parametrised tests",
        "Replace slow or external dependencies with `unittest.mock`",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "Your function calls a weather API. Why should its unit tests mock the API?",
        options: [
          { text: "Mocks are faster to type", why: "Not the reason." },
          { text: "Real calls are slow, flaky, cost money and give changing answers", why: "Correct." },
          { text: "APIs can't be called from tests", why: "They can — you just shouldn't in unit tests." },
        ],
        answer: 1,
        hint: "Tests must be fast and deterministic.",
        explain: "A mock returns a fixed answer instantly, so the test checks your logic, not the network.",
      },
      why: "Most real Python teams use pytest: less boilerplate, powerful fixtures and parametrisation. And most real code talks to databases, APIs and clocks — mocking lets you test it without them.",
      concept: [
        {
          title: "pytest style",
          body: `\`\`\`python
# test_prices.py — run with:  pytest -q
import pytest
from prices import with_tax

def test_with_tax():
    assert with_tax(100) == 118          # plain assert; pytest shows both sides on failure

@pytest.mark.parametrize("amount, expected", [(0, 0), (50, 59), (100, 118)])
def test_many(amount, expected):
    assert with_tax(amount) == expected

@pytest.fixture
def cart():                                # fresh object for every test that asks for it
    return Cart()

def test_empty(cart):
    assert cart.total() == 0

def test_negative():
    with pytest.raises(ValueError):
        with_tax(-1)
\`\`\`

pytest isn't installed in the CodeMentor sandbox, so exercises use plain \`assert\` functions with a tiny runner — the test functions themselves are written exactly like pytest tests.`,
        },
        {
          title: "Mocking with unittest.mock",
          body: `\`\`\`python
from unittest.mock import Mock, patch

api = Mock()
api.get_rate.return_value = 83.2        # always returns this
api.get_rate.side_effect = TimeoutError # or: raise this instead
api.get_rate.assert_called_once_with("USD")

with patch("__main__.fetch_rate", return_value=83.2):   # temporarily replace a name
    ...
\`\`\`

Patch where the name is **looked up**, not where it's defined. Don't over-mock: if everything is a mock, the test only tests the mocks.`,
        },
      ],
      example: {
        title: "Testing code that calls an 'API'",
        code: r`from unittest.mock import Mock, patch

def fetch_rate(currency):
    raise RuntimeError("no network in tests!")

def convert(amount, currency):
    rate = fetch_rate(currency)
    return round(amount * rate, 2)

def notify(user, sender):
    if user["balance"] < 0:
        sender.send(user["email"], "Your balance is negative")
        return True
    return False

def test_convert():
    with patch("__main__.fetch_rate", return_value=0.012) as fake:
        assert convert(1000, "USD") == 12.0
        fake.assert_called_once_with("USD")

def test_notify_sends_when_negative():
    sender = Mock()
    assert notify({"balance": -5, "email": "a@x.in"}, sender) is True
    sender.send.assert_called_once_with("a@x.in", "Your balance is negative")

def test_notify_silent_when_positive():
    sender = Mock()
    assert notify({"balance": 10, "email": "b@x.in"}, sender) is False
    assert sender.send.call_count == 0

tests = [obj for name, obj in list(globals().items()) if name.startswith("test_")]
passed = 0
for test in tests:
    try:
        test()
        passed += 1
        print("PASS", test.__name__)
    except AssertionError as e:
        print("FAIL", test.__name__, e)
print(f"{passed}/{len(tests)} passed")`,
        output: "PASS test_convert\nPASS test_notify_sends_when_negative\nPASS test_notify_silent_when_positive\n3/3 passed\n",
        lines: [
          [4, "The real function would hit the network — tests must never reach it."],
          [17, "patch swaps fetch_rate for a mock only inside the with block."],
          [19, "We can also check HOW the dependency was called."],
          [22, "Passing a Mock in as a parameter (dependency injection) needs no patching at all."],
          [24, "Mocks record calls; assert_called_once_with fails if the call differed."],
          [29, "call_count == 0 proves nothing was sent."],
          [31, "A tiny runner: find test_ functions, run them, report — what pytest automates."],
        ],
      },
      mistakes: [
        { title: "Patching the wrong place", body: "If module b does `from a import fetch`, patch `b.fetch`, not `a.fetch` — b holds its own reference." },
        { title: "Mocking the thing under test", body: "Mock dependencies (network, DB, clock), never the logic you're trying to check." },
        { title: "Assertions that aren't assertions", body: "A plain Mock accepts any attribute, so `mock.called_once_with(\"x\")` (missing `assert_`) just returns another Mock and never fails. Modern Python rejects names starting with `assert`/`assret`, but use `create_autospec` or `autospec=True` to catch the rest." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`from unittest.mock import Mock
m = Mock()
m.total.return_value = 42
print(m.total(1, 2), m.total.call_count)
m.total.side_effect = ValueError("boom")
try:
    m.total()
except ValueError as e:
    print("raised", e, m.total.call_count)`,
          answer: "42 1\nraised boom 2\n",
          hint: "side_effect takes priority over return_value; calls are counted either way.",
          explain: "The first call returns 42 (count 1). After setting side_effect, the call raises ValueError — and is still counted (2).",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Make the mock return 'sunny' when called.",
          code: r`from unittest.mock import Mock
weather = Mock()
weather.today.___ = "sunny"
print(weather.today())`,
          blanks: [["return_value"]],
          output: "sunny\n",
          hint: "The value it returns.",
          explain: "`mock.method.return_value = x` makes every call return x.",
        },
        {
          id: "b1", kind: "bug", difficulty: 4,
          prompt: "The test should check that `checkout` emails a receipt, but it accidentally makes the test useless by mocking `checkout` itself. Which line is wrong?",
          code: r`from unittest.mock import Mock, patch
def checkout(cart, mailer):
    total = sum(cart)
    mailer.send(f"receipt: {total}")
    return total
mailer = Mock()
with patch("__main__.checkout", return_value=0):
    result = checkout([10, 20], mailer)
print(result, mailer.send.call_count)`,
          line: 7,
          fix: r`from unittest.mock import Mock, patch
def checkout(cart, mailer):
    total = sum(cart)
    mailer.send(f"receipt: {total}")
    return total
mailer = Mock()
result = checkout([10, 20], mailer)
print(result, mailer.send.call_count)`,
          output: "30 1\n",
          hint: "Which function are we testing?",
          explain: "Patching checkout replaces the code under test with a fake, so nothing real runs. Mock only the dependency (mailer).",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "What does `@pytest.mark.parametrize` do?",
          options: [
            { text: "Runs the same test once per set of inputs", why: "Correct." },
            { text: "Makes a test run in parallel", why: "That's pytest-xdist." },
            { text: "Creates a fixture", why: "Fixtures use @pytest.fixture." },
          ],
          answer: 0,
          hint: "Parameters → many cases.",
          explain: "Each tuple becomes its own test case, reported separately — no copy-pasted tests.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Parametrised tests by hand", difficulty: 3,
          prompt: `Write \`slugify(title)\`: lowercase, keep letters/digits, turn runs of anything else into a single \`-\`, strip leading/trailing \`-\`. Then write a list \`CASES\` of (input, expected) pairs — at least 5, including an empty string and one with only symbols — and a loop that checks each with \`assert\` (catching AssertionError and printing \`FAIL <input>\` for any failure). Print \`all cases passed: True/False\` and \`at least 5 cases: True/False\`. Then read titles until \`end\` and print \`slug: <slug>\` for each.`,
          starter: r`import re

def slugify(title):
    pass

CASES = []
`,
          tests: [
            { label: "Extra titles", input: "Hello, World!\n  Python 3.12 -- Released  \nend\n", output: "all cases passed: True\nat least 5 cases: True\nslug: hello-world\nslug: python-3-12-released" },
          ],
          hints: [
            "`re.sub(r\"[^a-z0-9]+\", \"-\", title.lower()).strip(\"-\")`.",
            "Count passes in the loop; all passed means passes == len(CASES).",
            "Read titles until `end` and print `slug: <slug>`.",
            "Cases: ('', ''), ('!!!', ''), ('A  B', 'a-b') …",
          ],
          solution: r`import re

def slugify(title):
    return re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")

CASES = [
    ("Hello World", "hello-world"),
    ("  spaces  ", "spaces"),
    ("C++ & Python!", "c-python"),
    ("", ""),
    ("!!!", ""),
    ("Already-a-slug", "already-a-slug"),
]
passed = 0
for text, expected in CASES:
    try:
        assert slugify(text) == expected, f"{slugify(text)!r} != {expected!r}"
        passed += 1
    except AssertionError:
        print("FAIL", repr(text))
print("all cases passed:", passed == len(CASES))
print("at least 5 cases:", len(CASES) >= 5)
while (line := input()) != "end":
    print("slug:", slugify(line))`,
          notes: "This hand-made loop is exactly what `@pytest.mark.parametrize(\"text, expected\", CASES)` generates for you — with each case reported as its own test.",
        },
        {
          id: "stretch", kind: "task", title: "Mock the clock and the API", difficulty: 4,
          prompt: `\`greeting(clock)\` returns "Good morning" before 12, "Good afternoon" before 18, else "Good evening", using \`clock.hour()\`. \`send_daily(users, clock, sms)\` sends \`"<greeting>, <name>!"\` to each user with \`sms.send(phone, text)\`, **skipping** users without a phone, and returns how many were sent.

Read an hour and then users \`name,phone\` (phone may be empty) until \`end\`. Use **Mocks** for clock and sms. Print the return value and then each call the sms mock received: \`sms.send(phone, text)\` lines from \`sms.send.call_args_list\`.`,
          starter: r`from unittest.mock import Mock
`,
          tests: [
            { label: "Afternoon", input: "14\nasha,98765\nravi,\nzoe,91234\nend\n", output: "sent 2\nsms.send('98765', 'Good afternoon, asha!')\nsms.send('91234', 'Good afternoon, zoe!')" },
            { label: "Morning", input: "7\nmeera,555\nend\n", output: "sent 1\nsms.send('555', 'Good morning, meera!')", hidden: true },
          ],
          hints: [
            "`clock = Mock(); clock.hour.return_value = hour`.",
            "`sms = Mock()` — calls to sms.send are recorded automatically.",
            "Each item in `sms.send.call_args_list` has `.args`.",
            "Print `f\"sms.send({phone!r}, {text!r})\"`.",
          ],
          solution: r`from unittest.mock import Mock

def greeting(clock):
    h = clock.hour()
    if h < 12:
        return "Good morning"
    if h < 18:
        return "Good afternoon"
    return "Good evening"

def send_daily(users, clock, sms):
    sent = 0
    for name, phone in users:
        if not phone:
            continue
        sms.send(phone, f"{greeting(clock)}, {name}!")
        sent += 1
    return sent

hour = int(input())
users = []
while (line := input()) != "end":
    name, phone = line.split(",")
    users.append((name, phone))
clock = Mock()
clock.hour.return_value = hour
sms = Mock()
print("sent", send_daily(users, clock, sms))
for c in sms.send.call_args_list:
    phone, text = c.args
    print(f"sms.send({phone!r}, {text!r})")`,
          notes: "Because clock and sms are passed in (dependency injection), tests can control time and capture messages without any real SMS gateway — no patching needed.",
        },
      ],
      realWorld: "Payment code is tested against mocked gateways; pytest fixtures spin up temporary databases; Django's test client and responses/respx libraries fake HTTP so CI never touches real services.",
      reteach: "A mock is a stunt double. The film (your test) needs someone to jump off the building (call the payment API), but you don't risk the star. The double does exactly the move you script (return_value) and the crew notes every move (call_args) so you can check it was done right.",
      summary: [
        "pytest: plain asserts, fixtures for setup, parametrize for many cases, pytest.raises for errors.",
        "Mock/patch replace dependencies; return_value, side_effect, assert_called_once_with, call_args_list.",
        "Patch where names are looked up; prefer passing dependencies in; never mock the code under test.",
      ],
      libraryCode: [{
        title: "The same tests with pytest",
        code: `# test_slug.py
import pytest
from slug import slugify

@pytest.mark.parametrize("text, expected", [
    ("Hello World", "hello-world"),
    ("", ""),
    ("!!!", ""),
])
def test_slugify(text, expected):
    assert slugify(text) == expected

# terminal:
#   pip install pytest
#   pytest -q`,
        note: "pytest is a third-party package — install it on your own computer. It discovers test_*.py files and test_ functions automatically.",
      }],
    },

    {
      id: "py-tdd-quality",
      title: "TDD, coverage, linting and CI",
      minutes: 16,
      difficulty: 3,
      objectives: [
        "Follow the red–green–refactor cycle",
        "Explain coverage, linters, formatters and type checkers",
        "Describe what continuous integration runs and why",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "In test-driven development, what do you write first?",
        options: [
          { text: "The implementation", why: "That's test-after." },
          { text: "A failing test for the next small behaviour", why: "Correct: red first." },
          { text: "The documentation", why: "Useful, but not the TDD step." },
        ],
        answer: 1,
        hint: "Red, green, refactor.",
        explain: "TDD: write a failing test (red), make it pass with the simplest code (green), then clean up (refactor).",
      },
      why: "Tests are one part of code quality. Teams also use automatic tools that format code, catch likely bugs and check types — and run all of them on every change (CI), so quality doesn't depend on someone remembering.",
      concept: [
        {
          title: "Red → green → refactor",
          body: `1. **Red**: write a small test for behaviour that doesn't exist yet; watch it fail.
2. **Green**: write the simplest code that passes.
3. **Refactor**: improve names and structure while tests stay green.

Benefits: you only write code that's needed, every feature has a test, and refactoring is safe. **doctest** (stdlib) even runs examples written in docstrings.`,
        },
        {
          title: "The quality toolbox",
          body: `| Tool | Checks | Example |
| --- | --- | --- |
| **coverage.py** | which lines your tests executed | \`coverage run -m pytest; coverage report\` |
| **ruff / flake8** (linters) | unused imports, undefined names, likely bugs | \`ruff check .\` |
| **black / ruff format** | consistent formatting | \`ruff format .\` |
| **mypy / pyright** | type hints are consistent | \`mypy src\` |
| **code review** | design, clarity, security — what tools miss | pull requests |

100% coverage ≠ bug-free: it shows lines **ran**, not that their results were checked.`,
        },
        {
          title: "Continuous integration",
          body: `**CI** runs your checks automatically on every push/pull request (GitHub Actions, GitLab CI): install dependencies → lint → type-check → tests (often on several Python versions). A red build blocks merging. **Pre-commit hooks** run fast checks before each commit, on your machine.`,
        },
      ],
      example: {
        title: "TDD with doctest",
        code: r`import doctest

def initials(full_name):
    """Return capitalised initials.

    >>> initials("ada lovelace")
    'AL'
    >>> initials("  guido   van rossum ")
    'GVR'
    >>> initials("")
    ''
    """
    return "".join(word[0].upper() for word in full_name.split())

result = doctest.testmod()
print(result)
print("all examples pass:", result.failed == 0)`,
        output: "TestResults(failed=0, attempted=3)\nall examples pass: True\n",
        lines: [
          [6, "Each `>>>` line is an example call; the next line is the expected output."],
          [8, "Red first: this extra-spaces case was written before the code handled it."],
          [10, "An edge case: an empty name gives an empty string."],
          [13, "Green: split() without arguments handles runs of spaces, so all three pass."],
          [15, "testmod finds and runs every docstring example in this module."],
        ],
      },
      mistakes: [
        { title: "Chasing 100% coverage", body: "Coverage shows which lines ran, not whether you checked the results. Aim for meaningful tests on important logic." },
        { title: "Skipping refactor", body: "Green isn't the end — clean up while the tests protect you." },
        { title: "Arguing about formatting in reviews", body: "Let a formatter decide; spend review time on logic, naming and security." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`import contextlib, doctest, io
def half(n):
    """
    >>> half(10)
    5
    >>> half(3)
    1.5
    """
    return n // 2
with contextlib.redirect_stdout(io.StringIO()):
    result = doctest.testmod()
print(result.failed, result.attempted)`,
          answer: "1 2\n",
          hint: "What does 3 // 2 return?",
          explain: "Two examples were attempted. `//` is floor division, so half(3) returns 1, not 1.5 — one fails. (The failure report was captured in the StringIO.)",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Complete the TDD cycle.",
          code: r`cycle = ["red", "green", "___"]
print(" -> ".join(cycle))`,
          blanks: [["refactor"]],
          output: "red -> green -> refactor\n",
          hint: "Clean up while tests stay green.",
          explain: "Red (failing test) → green (make it pass) → refactor (improve the code).",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "This mini test runner (it discovers tests the way pytest does) reports `ran 0 tests` although a test exists. Which line is wrong?",
          code: r`def total(items):
    return sum(items)
def check_total():
    assert total([1, 2, 3]) == 6
tests = [f for name, f in list(globals().items()) if name.startswith("test_")]
for t in tests:
    t()
print("ran", len(tests), "tests")`,
          line: 3,
          fix: r`def total(items):
    return sum(items)
def test_total():
    assert total([1, 2, 3]) == 6
tests = [f for name, f in list(globals().items()) if name.startswith("test_")]
for t in tests:
    t()
print("ran", len(tests), "tests")`,
          output: "ran 1 tests\n",
          hint: "How does the runner recognise a test?",
          explain: "Discovery looks for names starting with test_ (pytest and unittest both do). `check_total` is silently skipped — a test that never runs protects nothing.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 2,
          prompt: "Which tool would report an unused import and a variable used before assignment?",
          options: [
            { text: "A formatter (black)", why: "Formatters only change layout." },
            { text: "A linter (ruff / flake8)", why: "Correct." },
            { text: "coverage.py", why: "Coverage reports executed lines." },
          ],
          answer: 1,
          hint: "Static analysis for likely bugs.",
          explain: "Linters analyse code without running it and flag likely mistakes and style issues.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "TDD: Roman numerals", difficulty: 3,
          prompt: `Following red→green→refactor, write \`to_roman(n)\` for 1–3999 (raise \`ValueError\` otherwise). Put at least four examples in its **docstring** (doctest), including 4, 9 and 1994. Print the doctest result's \`failed\` count as \`doctest failures: 0\`, then convert each input number (until \`end\`), printing the numeral or \`invalid\`.`,
          starter: r`import doctest

def to_roman(n):
    """
    >>> to_roman(1)
    'I'
    """
    pass
`,
          tests: [
            { label: "Numbers", input: "4\n9\n14\n1994\n3999\n0\nend\n", output: "doctest failures: 0\nIV\nIX\nXIV\nMCMXCIV\nMMMCMXCIX\ninvalid" },
          ],
          hints: [
            "Use a list of (value, symbol) pairs from 1000 'M' down to 1 'I', including 900 'CM', 400 'CD', 90 'XC', 40 'XL', 9 'IX', 4 'IV'.",
            "Greedy: while n >= value, append symbol and subtract.",
            "`doctest.testmod().failed`.",
            "Catch ValueError to print invalid.",
          ],
          solution: r`import doctest

def to_roman(n):
    """Convert 1..3999 to a Roman numeral.

    >>> to_roman(1)
    'I'
    >>> to_roman(4)
    'IV'
    >>> to_roman(9)
    'IX'
    >>> to_roman(1994)
    'MCMXCIV'
    """
    if not 1 <= n <= 3999:
        raise ValueError("out of range")
    pairs = [(1000, "M"), (900, "CM"), (500, "D"), (400, "CD"), (100, "C"), (90, "XC"),
             (50, "L"), (40, "XL"), (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I")]
    out = []
    for value, symbol in pairs:
        while n >= value:
            out.append(symbol)
            n -= value
    return "".join(out)

print("doctest failures:", doctest.testmod().failed)
while (line := input()) != "end":
    try:
        print(to_roman(int(line)))
    except ValueError:
        print("invalid")`,
          notes: "In real TDD you'd add one example at a time: 1 → 'I' (green), 4 → 'IV' (red, then add subtractive pairs), and so on. The table-driven version is the refactored result.",
        },
        {
          id: "stretch", kind: "task", title: "Mini CI pipeline", difficulty: 4,
          prompt: `Simulate a CI run. Input: lines \`step:result\` where step is one of \`lint\`, \`typecheck\`, \`test\` and result is \`ok\` or a number of problems, until \`end\`. Steps run in the order lint → typecheck → test (reorder if needed); the pipeline **stops at the first failing step**. Print \`✔ step\` or \`✘ step (N problems)\` for steps that ran, \`- step skipped\` for the rest, then \`BUILD PASSED\` or \`BUILD FAILED\`. Missing steps count as \`ok\`.`,
          starter: r`ORDER = ["lint", "typecheck", "test"]
`,
          tests: [
            { label: "Type error", input: "test:ok\nlint:ok\ntypecheck:3\nend\n", output: "✔ lint\n✘ typecheck (3 problems)\n- test skipped\nBUILD FAILED" },
            { label: "Green", input: "lint:ok\nend\n", output: "✔ lint\n✔ typecheck\n✔ test\nBUILD PASSED", hidden: true },
          ],
          hints: [
            "Read results into a dict.",
            "Loop over ORDER with a `failed` flag.",
            "Once failed is True, print skipped lines.",
            "`results.get(step, \"ok\")`.",
          ],
          solution: r`ORDER = ["lint", "typecheck", "test"]
results = {}
while (line := input()) != "end":
    step, result = line.split(":")
    results[step] = result
failed = False
for step in ORDER:
    if failed:
        print(f"- {step} skipped")
        continue
    result = results.get(step, "ok")
    if result == "ok":
        print(f"✔ {step}")
    else:
        print(f"✘ {step} ({result} problems)")
        failed = True
print("BUILD FAILED" if failed else "BUILD PASSED")`,
          notes: "Real CI (GitHub Actions) runs these as jobs/steps and stops on the first failure the same way — fast checks first, so you hear about problems quickly.",
        },
      ],
      realWorld: "Open-source projects show a CI badge; companies require green CI and an approved review before merging; ruff and pre-commit run in milliseconds on every commit.",
      reteach: "TDD is like writing the answer key before solving the problem: you know exactly when you're done. Linters are spell-checkers for code, formatters are auto-tidy, type checkers are grammar checkers, and CI is the teacher who checks every homework the moment it's handed in.",
      summary: [
        "TDD: red → green → refactor; doctest runs docstring examples.",
        "Coverage shows what ran (not what was checked); linters, formatters and type checkers catch problems without running code.",
        "CI runs lint, types and tests on every change; reviews focus on design, clarity and security.",
      ],
      libraryCode: [{
        title: "A GitHub Actions workflow",
        code: `# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install -r requirements-dev.txt
      - run: ruff check .
      - run: mypy src
      - run: coverage run -m pytest && coverage report --fail-under=80`,
        note: "Put this file in your repository on GitHub; it runs on GitHub's servers on every push. It isn't Python code, so it can't run in the sandbox.",
      }],
    },
  ],
  exam: [
    {
      id: "e1", kind: "mcq", difficulty: 3,
      prompt: "A function sends emails via `smtp.send(...)`. In its unit test you should…",
      options: [
        { text: "Send a real email to yourself", why: "Slow, flaky, has side effects." },
        { text: "Pass in (or patch) a Mock and assert how send was called", why: "Correct." },
        { text: "Skip testing it", why: "The logic still needs tests." },
      ],
      answer: 1,
      hint: "Replace the dependency.",
      explain: "A Mock records calls so you can assert recipients and content without sending anything.",
    },
    {
      id: "e2", kind: "predict", difficulty: 3,
      code: r`from unittest.mock import Mock
m = Mock(side_effect=[1, 2, ValueError("done")])
print(m(), m())
try:
    m()
except ValueError as e:
    print(e, m.call_count)`,
      answer: "1 2\ndone 3\n",
      hint: "A list side_effect returns (or raises) the items one per call.",
      explain: "Calls return 1, then 2, then raise ValueError('done'); three calls recorded.",
    },
    {
      id: "e3", kind: "fill", difficulty: 3,
      prompt: "Run code before each test method.",
      code: r`import io, unittest
class T(unittest.TestCase):
    def ___(self):
        self.items = []
    def test_empty(self):
        self.assertEqual(self.items, [])
res = unittest.TextTestRunner(stream=io.StringIO()).run(unittest.defaultTestLoader.loadTestsFromTestCase(T))
print(res.wasSuccessful())`,
      blanks: [["setUp"]],
      output: "True\n",
      hint: "Camel-case 'set up'.",
      explain: "unittest calls `setUp` before every test method.",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: a test suite that catches mutants", difficulty: 4,
    prompt: `**Mutation testing** checks your tests: small bugs ("mutants") are planted in the code, and good tests should fail on every one.

The starter has a correct \`Cart\` and three mutants. Write \`run_tests(cart_cls)\` that runs **your own** test functions against a class (create fresh carts with \`cart_cls()\`) and returns True only if they all pass. Cover: adding items and quantities, the total, the 10% discount for totals **of 1000 or more**, and removing an item that isn't in the cart (KeyError).

Print \`Cart: tests pass\` (must be True for the real Cart), then for each mutant \`<name>: caught\` or \`<name>: SURVIVED\`, then \`mutation score 3/3\` (the number caught).`,
    starter: r`class Cart:
    def __init__(self):
        self.items = {}
    def add(self, name, price, qty=1):
        old_price, old_qty = self.items.get(name, (price, 0))
        self.items[name] = (price, old_qty + qty)
    def remove(self, name):
        del self.items[name]
    def total(self):
        subtotal = sum(p * q for p, q in self.items.values())
        return round(subtotal * 0.9, 2) if subtotal >= 1000 else subtotal

class MutantBoundary(Cart):
    def total(self):
        subtotal = sum(p * q for p, q in self.items.values())
        return round(subtotal * 0.9, 2) if subtotal > 1000 else subtotal

class MutantQuantity(Cart):
    def add(self, name, price, qty=1):
        self.items[name] = (price, qty)

class MutantRemove(Cart):
    def remove(self, name):
        self.items.pop(name, None)

def run_tests(cart_cls):
    return True

print("Cart: tests pass" if run_tests(Cart) else "Cart: tests FAIL")
caught = 0
for mutant in (MutantBoundary, MutantQuantity, MutantRemove):
    killed = not run_tests(mutant)
    caught += killed
    print(f"{mutant.__name__}: {'caught' if killed else 'SURVIVED'}")
print(f"mutation score {caught}/3")`,
    tests: [
      { label: "All mutants", input: "", output: "Cart: tests pass\nMutantBoundary: caught\nMutantQuantity: caught\nMutantRemove: caught\nmutation score 3/3" },
    ],
    hints: [
      "Write test functions that take cart_cls, e.g. `def test_total(cart_cls): c = cart_cls(); c.add(\"pen\", 10, 3); assert c.total() == 30`.",
      "MutantQuantity: add the same item twice and check the quantity adds up.",
      "MutantBoundary: a total of exactly 1000 must become 900.0.",
      "MutantRemove: `try: c.remove(\"ghost\")` must raise KeyError — assert False if it doesn't. run_tests catches AssertionError and returns False.",
    ],
    solution: r`class Cart:
    def __init__(self):
        self.items = {}
    def add(self, name, price, qty=1):
        old_price, old_qty = self.items.get(name, (price, 0))
        self.items[name] = (price, old_qty + qty)
    def remove(self, name):
        del self.items[name]
    def total(self):
        subtotal = sum(p * q for p, q in self.items.values())
        return round(subtotal * 0.9, 2) if subtotal >= 1000 else subtotal

class MutantBoundary(Cart):
    def total(self):
        subtotal = sum(p * q for p, q in self.items.values())
        return round(subtotal * 0.9, 2) if subtotal > 1000 else subtotal

class MutantQuantity(Cart):
    def add(self, name, price, qty=1):
        self.items[name] = (price, qty)

class MutantRemove(Cart):
    def remove(self, name):
        self.items.pop(name, None)

def test_simple_total(cart_cls):
    c = cart_cls()
    c.add("pen", 10, 3)
    c.add("book", 50)
    assert c.total() == 80

def test_quantities_accumulate(cart_cls):
    c = cart_cls()
    c.add("pen", 10)
    c.add("pen", 10, 2)
    assert c.items["pen"] == (10, 3)

def test_discount_boundary(cart_cls):
    c = cart_cls()
    c.add("phone", 1000)
    assert c.total() == 900.0
    c2 = cart_cls()
    c2.add("case", 999)
    assert c2.total() == 999

def test_remove_missing_raises(cart_cls):
    c = cart_cls()
    try:
        c.remove("ghost")
    except KeyError:
        return
    assert False, "expected KeyError"

def test_remove_existing(cart_cls):
    c = cart_cls()
    c.add("pen", 10)
    c.remove("pen")
    assert c.total() == 0

TESTS = [test_simple_total, test_quantities_accumulate, test_discount_boundary,
         test_remove_missing_raises, test_remove_existing]

def run_tests(cart_cls):
    for test in TESTS:
        try:
            test(cart_cls)
        except AssertionError:
            return False
    return True

print("Cart: tests pass" if run_tests(Cart) else "Cart: tests FAIL")
caught = 0
for mutant in (MutantBoundary, MutantQuantity, MutantRemove):
    killed = not run_tests(mutant)
    caught += killed
    print(f"{mutant.__name__}: {'caught' if killed else 'SURVIVED'}")
print(f"mutation score {caught}/3")`,
    notes: "Tools like mutmut generate hundreds of mutants automatically. A surviving mutant points exactly at behaviour your tests don't check. Passing tests still don't make the cart production-ready: it lacks price validation, currency handling and persistence.",
  },
};
