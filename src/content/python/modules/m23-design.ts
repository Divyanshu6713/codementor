import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 23 — Advanced OOP and design. */
export const M23: PyModuleDef = {
  id: "py-design",
  number: 23,
  level: 4,
  title: "Advanced OOP and Design",
  summary: "Abstract interfaces, mixins and composition patterns; protocols and structural subtyping; dependency injection; SOLID principles in Python; factory, strategy, observer and adapter patterns; dataclasses with slots; keeping object-oriented systems readable.",
  track: "core",
  optionalNote: "Most valuable once you write programs of a few hundred lines or work in a team.",
  prereqs: ["py-object-model"],
  lessons: [
    {
      id: "py-interfaces-mixins",
      title: "Interfaces, mixins and protocols",
      minutes: 17,
      difficulty: 4,
      objectives: [
        "Choose between ABCs (nominal) and Protocols (structural) for interfaces",
        "Write small mixins that add one capability",
        "Combine classes through composition patterns",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "A `typing.Protocol` describes an interface. Does a class need to inherit from it to satisfy it?",
        options: [
          { text: "Yes, like an ABC", why: "Protocols are structural." },
          { text: "No — any class with the right methods matches (structural subtyping)", why: "Correct." },
          { text: "Only at run time", why: "Protocols are mainly for static checkers (runtime checks need @runtime_checkable)." },
        ],
        answer: 1,
        hint: "Duck typing, but checkable.",
        explain: "Protocols formalise duck typing: having the methods is enough for type checkers.",
      },
      why: "As programs grow, parts must work together through clear contracts. Interfaces define those contracts; mixins add reusable capabilities; protocols let unrelated classes (even third-party ones) fit without inheritance.",
      concept: [
        {
          title: "ABC vs Protocol",
          body: `\`\`\`python
from abc import ABC, abstractmethod
from typing import Protocol, runtime_checkable

class Exporter(ABC):                 # nominal: subclasses must inherit and implement
    @abstractmethod
    def export(self, rows): ...

@runtime_checkable
class SupportsClose(Protocol):       # structural: anything with close() matches
    def close(self) -> None: ...
\`\`\`

ABCs give run-time enforcement and shared helper methods; Protocols type-check classes you don't control (files, sockets, third-party objects).`,
        },
        {
          title: "Mixins",
          body: `A **mixin** is a small class adding one capability, designed to be combined:

\`\`\`python
class JsonMixin:
    def to_json(self):
        import json
        return json.dumps(self.__dict__, sort_keys=True)

class ReprMixin:
    def __repr__(self):
        fields = ", ".join(f"{k}={v!r}" for k, v in vars(self).items())
        return f"{type(self).__name__}({fields})"

class User(JsonMixin, ReprMixin):
    def __init__(self, name): self.name = name
\`\`\`

Keep mixins stateless (or cooperative with super()), and put them before the main base class.`,
        },
        {
          title: "Composition patterns",
          body: `- **Delegation**: an object holds a helper and forwards calls (\`self.logger.log(...)\`).
- **Wrapper/decorator object**: same interface, adds behaviour (LoggedStorage in Module 17).
- **Aggregation**: an object holds a collection of parts (Order has Items).

Prefer composition when the relationship is has-a or when you need to swap parts at run time.`,
        },
      ],
      example: {
        title: "Mixins and a runtime-checkable protocol",
        code: r`import json
from typing import Protocol, runtime_checkable

class JsonMixin:
    def to_json(self):
        return json.dumps(vars(self), sort_keys=True)

class ReprMixin:
    def __repr__(self):
        inner = ", ".join(f"{k}={v!r}" for k, v in vars(self).items())
        return f"{type(self).__name__}({inner})"

class Product(JsonMixin, ReprMixin):
    def __init__(self, name, price):
        self.name, self.price = name, price

@runtime_checkable
class Priced(Protocol):
    price: float
    def to_json(self) -> str: ...

class Ticket:
    def __init__(self):
        self.price = 250.0
    def to_json(self):
        return '{"ticket": true}'

p = Product("pen", 10.0)
print(p, p.to_json())
print(isinstance(p, Priced), isinstance(Ticket(), Priced), isinstance("x", Priced))
print(sum(item.price for item in [p, Ticket()] if isinstance(item, Priced)))`,
        output: "Product(name='pen', price=10.0) {\"name\": \"pen\", \"price\": 10.0}\nTrue True False\n260.0\n",
        lines: [
          [4, "A mixin adds one capability and uses only vars(self)."],
          [13, "Product gets JSON and repr behaviour by mixing both in."],
          [17, "A protocol: anything with a price attribute and a to_json method."],
          [22, "Ticket never inherits from Priced — it just has the right shape."],
          [29, "@runtime_checkable allows isinstance checks (they test for the members' presence only)."],
        ],
      },
      mistakes: [
        { title: "Mixins with their own __init__ that don't cooperate", body: "If a mixin defines __init__, it must call super().__init__(**kwargs), or other classes won't initialise." },
        { title: "Over-trusting runtime protocol checks", body: "isinstance with a runtime_checkable Protocol only checks that the names exist, not their signatures or types." },
        { title: "Interfaces with too many methods", body: "Fat interfaces force implementers to write methods they don't need. Keep them small (interface segregation)." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`class Hello:
    def greet(self):
        return "hello"
class Loud:
    def greet(self):
        return super().greet().upper() + "!"
class LoudHello(Loud, Hello):
    pass
print(LoudHello().greet())`,
          answer: "HELLO!\n",
          hint: "super() in Loud finds the next class in LoudHello's MRO.",
          explain: "MRO: LoudHello, Loud, Hello. Loud's super().greet() calls Hello.greet — a mixin modifying behaviour.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Allow isinstance checks against the protocol.",
          code: r`from typing import Protocol, ___
@runtime_checkable
class Drawable(Protocol):
    def draw(self) -> str: ...
class Box:
    def draw(self):
        return "[]"
print(isinstance(Box(), Drawable))`,
          blanks: [["runtime_checkable"]],
          output: "True\n",
          hint: "The decorator's name — imported from typing.",
          explain: "`@runtime_checkable` enables isinstance checks for a Protocol.",
        },
        {
          id: "b1", kind: "bug", difficulty: 4,
          prompt: "`Report` should have both `title` and `stamp`, but `title` is missing. Which line breaks cooperation?",
          code: r`class Base:
    def __init__(self, title, **kw):
        super().__init__(**kw)
        self.title = title
class StampMixin:
    def __init__(self, **kw):
        self.stamp = "2026-10-09"
class Report(StampMixin, Base):
    pass
r = Report(title="Q3")
print(getattr(r, "title", "missing"), r.stamp)`,
          line: 7,
          fix: r`class Base:
    def __init__(self, title, **kw):
        super().__init__(**kw)
        self.title = title
class StampMixin:
    def __init__(self, **kw):
        super().__init__(**kw)
        self.stamp = "2026-10-09"
class Report(StampMixin, Base):
    pass
r = Report(title="Q3")
print(getattr(r, "title", "missing"), r.stamp)`,
          output: "Q3 2026-10-09\n",
          hint: "Does the mixin pass control to the next __init__?",
          explain: "StampMixin.__init__ never calls super().__init__(**kw), so Base.__init__ never runs.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "When is a Protocol a better fit than an ABC?",
          options: [
            { text: "When you need shared method implementations", why: "ABCs can provide those; protocols mostly don't." },
            { text: "When classes you don't control (e.g. third-party) should satisfy the interface without inheriting", why: "Correct." },
            { text: "When you need run-time enforcement at instantiation", why: "That's what ABCs do." },
          ],
          answer: 1,
          hint: "Structural vs nominal.",
          explain: "Protocols accept any class with the right shape, including ones you can't modify.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Comparable mixin", difficulty: 4,
          prompt: `Write \`OrderedByKeyMixin\` that implements \`__eq__\`, \`__lt__\`, \`__le__\`, \`__gt__\`, \`__ge__\` by comparing \`self.sort_key()\` (subclasses provide sort_key). Use it in \`Version(major, minor, patch)\` (key = the tuple) and \`Word(text)\` (key = (len, lower text)). Read lines \`v X.Y.Z\` or \`w TEXT\` until \`end\` and print the versions sorted, then the words sorted (each group on one line, space-separated).`,
          starter: r`class OrderedByKeyMixin:
    pass
`,
          tests: [
            { label: "Mixed", input: "v 1.10.0\nw banana\nv 1.2.3\nw Fig\nw apple\nv 0.9.9\nend\n", output: "0.9.9 1.2.3 1.10.0\nFig apple banana" },
            { label: "Only words", input: "w b\nw A\nend\n", output: "\nA b", hidden: true, category: "edge" },
          ],
          hints: [
            "Each comparison method compares `self.sort_key()` with `other.sort_key()`.",
            "Version.sort_key returns `(self.major, self.minor, self.patch)`; add a __str__.",
            "Word.sort_key returns `(len(self.text), self.text.lower())`.",
            "sorted() needs only __lt__, but the mixin gives all comparisons.",
          ],
          solution: r`class OrderedByKeyMixin:
    def __eq__(self, other):
        return self.sort_key() == other.sort_key()
    def __lt__(self, other):
        return self.sort_key() < other.sort_key()
    def __le__(self, other):
        return self.sort_key() <= other.sort_key()
    def __gt__(self, other):
        return self.sort_key() > other.sort_key()
    def __ge__(self, other):
        return self.sort_key() >= other.sort_key()

class Version(OrderedByKeyMixin):
    def __init__(self, text):
        self.major, self.minor, self.patch = map(int, text.split("."))
    def sort_key(self):
        return (self.major, self.minor, self.patch)
    def __str__(self):
        return f"{self.major}.{self.minor}.{self.patch}"

class Word(OrderedByKeyMixin):
    def __init__(self, text):
        self.text = text
    def sort_key(self):
        return (len(self.text), self.text.lower())
    def __str__(self):
        return self.text

versions, words = [], []
while (line := input()) != "end":
    kind, value = line.split(" ", 1)
    (versions if kind == "v" else words).append(Version(value) if kind == "v" else Word(value))
print(" ".join(map(str, sorted(versions))))
print(" ".join(map(str, sorted(words))))`,
          notes: "One mixin gives full ordering to any class that can describe its sort key. (`functools.total_ordering` does a similar job from just __eq__ and __lt__.)",
        },
        {
          id: "stretch", kind: "task", title: "Protocol-based reporting", difficulty: 4,
          prompt: `Define a Protocol \`Summarizable\` with \`summary() -> str\` (runtime_checkable). Write three unrelated classes with summary(): \`Invoice(no, amount)\`, \`Ticket(id, status)\` and \`Note(text)\` (first 10 chars + "…" if longer). A \`report(items)\` function prints \`- SUMMARY\` for items that satisfy the protocol and counts the others as skipped. Run it on the given list.`,
          starter: r`from typing import Protocol, runtime_checkable
`,
          tests: [{ label: "Report", input: "", output: "- Invoice #7: Rs 1200\n- Ticket T-42 [open]\n- Note: Call the s…\n- Note: Short\nskipped 2" }],
          hints: [
            "@runtime_checkable class Summarizable(Protocol): def summary(self) -> str: ...",
            "Each class implements summary() its own way; none inherits from the protocol.",
            "In report, use isinstance(item, Summarizable).",
            "The given list includes a str and an int that don't satisfy the protocol.",
          ],
          solution: r`from typing import Protocol, runtime_checkable

@runtime_checkable
class Summarizable(Protocol):
    def summary(self) -> str: ...

class Invoice:
    def __init__(self, no, amount):
        self.no, self.amount = no, amount
    def summary(self):
        return f"Invoice #{self.no}: Rs {self.amount}"

class Ticket:
    def __init__(self, id, status):
        self.id, self.status = id, status
    def summary(self):
        return f"Ticket {self.id} [{self.status}]"

class Note:
    def __init__(self, text):
        self.text = text
    def summary(self):
        short = self.text if len(self.text) <= 10 else self.text[:10] + "…"
        return f"Note: {short}"

def report(items):
    skipped = 0
    for item in items:
        if isinstance(item, Summarizable):
            print("-", item.summary())
        else:
            skipped += 1
    print("skipped", skipped)

report([Invoice(7, 1200), "plain text", Ticket("T-42", "open"), Note("Call the supplier"), 42, Note("Short")])`,
          notes: "report() depends only on the protocol, so any future class with summary() works without changes — and without a shared base class.",
        },
      ],
      realWorld: "Django REST framework uses mixins (ListModelMixin, CreateModelMixin) to assemble views; typing protocols describe 'file-like' or 'iterable' objects; plugin systems define small interfaces for third parties to implement.",
      reteach: "An ABC is a membership card: you must officially join (inherit) and promise to do certain things. A Protocol is a skills test: anyone who can do the things passes, member or not. A mixin is an add-on kit you bolt onto a class to give it one extra ability.",
      summary: [
        "ABCs: nominal interfaces with enforcement and shared code; Protocols: structural ('has the methods') interfaces.",
        "Mixins add one capability; make them cooperative (super()) and list them before the base class.",
        "Compose objects (delegation, wrappers, aggregation) when the relation is has-a.",
      ],
    },

    {
      id: "py-solid-di",
      title: "SOLID principles and dependency injection",
      minutes: 17,
      difficulty: 4,
      objectives: [
        "Explain the five SOLID principles with Python examples",
        "Inject dependencies instead of creating them inside classes",
        "Refactor tightly-coupled code to be testable",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "A class creates its own database connection inside __init__. What's the main problem for testing?",
        options: [
          { text: "None", why: "Tests would hit a real database." },
          { text: "You can't easily substitute a fake database in tests", why: "Correct — the dependency is hard-wired." },
          { text: "Databases are slow to import", why: "Not the core issue." },
        ],
        answer: 1,
        hint: "Who decides which database is used?",
        explain: "When a class creates its own dependencies, callers (and tests) can't swap them. Injecting them fixes that.",
      },
      why: "SOLID principles and dependency injection are how teams keep large codebases changeable: features can be added without breaking others, and every part can be tested in isolation with fakes.",
      concept: [
        {
          title: "SOLID in one line each",
          body: `- **S**ingle responsibility: a class has one reason to change.
- **O**pen/closed: add behaviour by adding code (new classes), not by editing tested code.
- **L**iskov substitution: a subclass must work anywhere its parent does.
- **I**nterface segregation: small interfaces; don't force unused methods.
- **D**ependency inversion: depend on abstractions (protocols), not concrete classes.

These are guidelines, not laws — apply them when they make code simpler to change.`,
        },
        {
          title: "Dependency injection (DI)",
          body: `\`\`\`python
class ReportService:
    def __init__(self, repository, mailer):   # injected, not created here
        self.repository = repository
        self.mailer = mailer

service = ReportService(SqlRepository(conn), SmtpMailer(host))   # production
test_service = ReportService(FakeRepository(), FakeMailer())      # tests
\`\`\`

In Python, DI is just passing objects (or functions) in. No framework is needed; a small "composition root" at startup wires real implementations together.`,
        },
      ],
      example: {
        title: "From hard-wired to injected",
        code: r`from typing import Protocol

class Clock(Protocol):
    def today(self) -> str: ...

class Notifier(Protocol):
    def send(self, to: str, msg: str) -> None: ...

class FixedClock:
    def __init__(self, day): self.day = day
    def today(self): return self.day

class MemoryNotifier:
    def __init__(self): self.sent = []
    def send(self, to, msg): self.sent.append((to, msg))

class FeeReminder:
    """Single responsibility: decide who to remind. Depends only on abstractions."""
    def __init__(self, clock: Clock, notifier: Notifier):
        self.clock, self.notifier = clock, notifier
    def run(self, students):
        today = self.clock.today()
        due = [s for s in students if s["due"] <= today and not s["paid"]]
        for s in due:
            self.notifier.send(s["name"], f"Fee due since {s['due']}")
        return len(due)

students = [{"name": "asha", "due": "2026-10-01", "paid": False},
            {"name": "ravi", "due": "2026-10-20", "paid": False},
            {"name": "zoe", "due": "2026-09-15", "paid": True}]
notifier = MemoryNotifier()
count = FeeReminder(FixedClock("2026-10-09"), notifier).run(students)
print(count, notifier.sent)`,
        output: "1 [('asha', 'Fee due since 2026-10-01')]\n",
        lines: [
          [3, "Abstractions (protocols) for the two things the logic depends on."],
          [9, "A fake clock makes 'today' controllable — no real dates in tests."],
          [13, "A fake notifier records messages instead of sending SMS/emails."],
          [17, "The class receives its dependencies; it never creates them."],
          [21, "Pure business logic: which fees are overdue and unpaid."],
          [31, "In production you'd pass a real clock and an SMS notifier — FeeReminder doesn't change."],
        ],
      },
      mistakes: [
        { title: "God classes", body: "A class that validates, stores, emails and formats has many reasons to change — split it." },
        { title: "Subclasses that break the parent's promises", body: "A ReadOnlyList subclass of list whose append raises violates Liskov — callers expecting a list break." },
        { title: "Over-engineering", body: "Interfaces for everything in a 50-line script add noise. Introduce abstractions when there's a real second implementation (or a test double)." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`class Greeter:
    def __init__(self, formatter):
        self.formatter = formatter
    def greet(self, name):
        return self.formatter(f"hello {name}")
print(Greeter(str.upper).greet("asha"), Greeter(str.title).greet("ravi kumar"))`,
          answer: "HELLO ASHA Hello Ravi Kumar\n",
          hint: "The injected dependency is a function.",
          explain: "The same Greeter works with different injected formatters — DI can be as simple as passing a function.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Inject the storage instead of creating it inside.",
          code: r`class Cart:
    def __init__(self, ___):
        self.storage = storage
    def add(self, item):
        self.storage.append(item)
        return len(self.storage)
print(Cart(storage=[]).add("pen"))`,
          blanks: [["storage"]],
          output: "1\n",
          hint: "Make it a constructor parameter.",
          explain: "Receiving `storage` as a parameter lets callers pass a list, a database wrapper or a fake.",
        },
        {
          id: "b1", kind: "bug", difficulty: 4,
          prompt: "Code written for `Bird` breaks when given a `Penguin` (a Liskov violation). Which line causes it?",
          code: r`class Bird:
    def move(self):
        return "flies"
class Penguin(Bird):
    def move(self):
        raise NotImplementedError("penguins can't fly")
for b in [Bird(), Penguin()]:
    try:
        print(b.move())
    except NotImplementedError:
        print("broken substitution")`,
          line: 6,
          fix: r`class Bird:
    def move(self):
        return "flies"
class Penguin(Bird):
    def move(self):
        return "swims"
for b in [Bird(), Penguin()]:
    try:
        print(b.move())
    except NotImplementedError:
        print("broken substitution")`,
          output: "flies\nswims\n",
          hint: "A subclass must honour the parent's contract.",
          explain: "Callers expect every Bird's move() to work. Penguin raising breaks substitution; it should return its own way of moving (or the hierarchy should be redesigned).",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "Which change follows the open/closed principle when adding a new payment method?",
          options: [
            { text: "Add another elif branch to the big process_payment function", why: "That edits existing tested code." },
            { text: "Add a new class implementing the Payment interface and register it", why: "Correct." },
            { text: "Copy the whole payment module and modify it", why: "Duplication." },
          ],
          answer: 1,
          hint: "Extend, don't modify.",
          explain: "New behaviour arrives as new code plugged into an existing abstraction.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Inject a fake clock", difficulty: 3,
          prompt: `\`Greeter\` chooses \`Good morning\` (before 12), \`Good afternoon\` (12–16) or \`Good evening\` (17+) from the current hour. Refactor it to receive a \`clock\` object with \`hour()\`, then use a \`FakeClock(h)\` to greet each name with each hour read from input lines \`name hour\` until \`end\`.`,
          starter: r`import datetime

class Greeter:
    def greet(self, name):
        h = datetime.datetime.now().hour
        part = "morning" if h < 12 else "afternoon" if h < 17 else "evening"
        return f"Good {part}, {name}"
`,
          tests: [
            { label: "Three times", input: "Asha 9\nRavi 13\nZoe 20\nend\n", output: "Good morning, Asha\nGood afternoon, Ravi\nGood evening, Zoe" },
            { label: "Boundaries", input: "A 12\nB 17\nC 0\nend\n", output: "Good afternoon, A\nGood evening, B\nGood morning, C", hidden: true, category: "boundary" },
          ],
          hints: [
            "Give Greeter an __init__(self, clock).",
            "Replace datetime.now().hour with self.clock.hour().",
            "FakeClock stores an hour and returns it from hour().",
            "For each line: `Greeter(FakeClock(int(hour))).greet(name)`.",
          ],
          solution: r`class Greeter:
    def __init__(self, clock):
        self.clock = clock

    def greet(self, name):
        h = self.clock.hour()
        part = "morning" if h < 12 else "afternoon" if h < 17 else "evening"
        return f"Good {part}, {name}"

class FakeClock:
    def __init__(self, h):
        self.h = h

    def hour(self):
        return self.h

while (line := input()) != "end":
    name, hour = line.split()
    print(Greeter(FakeClock(int(hour))).greet(name))`,
          notes: "Time is a classic hidden dependency. Injecting a clock makes time-based logic fully testable — production code would pass a real clock class.",
        },
        {
          id: "stretch", kind: "challenge", title: "Split a god class", difficulty: 4,
          prompt: `\`OrderSystem.process(line)\` parses, prices, applies discounts and formats — all in one place. Refactor into \`Parser\`, \`Pricer(prices)\`, \`DiscountPolicy\` (10% off totals ≥ 500) and \`Formatter\`, wired together in \`OrderService(parser, pricer, policy, formatter)\`. Output must stay identical for lines \`item qty\` until \`end\`: \`item x qty: total\` where total is after discount, rounded to 2. Finally, to show the wiring, print the class names of the service's four components on one line: \`Parser Pricer DiscountPolicy Formatter\`.`,
          starter: r`PRICES = {"pen": 10, "book": 250, "bag": 600}

class OrderSystem:
    def process(self, line):
        item, qty = line.split()
        total = PRICES[item] * int(qty)
        if total >= 500:
            total *= 0.9
        return f"{item} x {qty}: {round(total, 2)}"
`,
          tests: [
            { label: "Orders", input: "pen 3\nbook 2\nbag 1\nend\n", output: "pen x 3: 30\nbook x 2: 450.0\nbag x 1: 540.0\nParser Pricer DiscountPolicy Formatter" },
            { label: "Below threshold", input: "book 1\nend\n", output: "book x 1: 250\nParser Pricer DiscountPolicy Formatter", hidden: true },
          ],
          hints: [
            "Parser.parse(line) returns (item, qty).",
            "Pricer.price(item, qty) returns the raw total; DiscountPolicy.apply(total) returns the discounted total.",
            "Formatter.format(item, qty, total) builds the string (keep round(total, 2)).",
            "OrderService.process calls the four in order; the loop prints its result. Note: the starter prints 500.0-style floats only when the discount applied — keep the same arithmetic.",
          ],
          solution: r`PRICES = {"pen": 10, "book": 250, "bag": 600}

class Parser:
    def parse(self, line):
        item, qty = line.split()
        return item, int(qty)

class Pricer:
    def __init__(self, prices):
        self.prices = prices
    def price(self, item, qty):
        return self.prices[item] * qty

class DiscountPolicy:
    def apply(self, total):
        return total * 0.9 if total >= 500 else total

class Formatter:
    def format(self, item, qty, total):
        return f"{item} x {qty}: {round(total, 2)}"

class OrderService:
    def __init__(self, parser, pricer, policy, formatter):
        self.parser, self.pricer, self.policy, self.formatter = parser, pricer, policy, formatter
    def process(self, line):
        item, qty = self.parser.parse(line)
        total = self.policy.apply(self.pricer.price(item, qty))
        return self.formatter.format(item, qty, total)

service = OrderService(Parser(), Pricer(PRICES), DiscountPolicy(), Formatter())
while (line := input()) != "end":
    print(service.process(line))
print(*(type(c).__name__ for c in (service.parser, service.pricer, service.policy, service.formatter)))`,
          notes: "Same behaviour, but each class now has one reason to change, and any part (e.g. a festival DiscountPolicy) can be swapped by passing a different object. That's SRP + DI + open/closed together.",
        },
      ],
      realWorld: "FastAPI's `Depends` and pytest fixtures are dependency injection; clean architectures (Module 46) keep business logic free of frameworks so it can be tested with fakes; code reviews often ask 'can we inject this?'.",
      reteach: "A class that builds its own tools (database, clock, mailer) is like a chef who insists on forging their own knives: you can't hand them a practice knife for training. Dependency injection means the kitchen hands the chef the tools — real ones in service, plastic ones in training. SOLID is a set of habits that keep each chef's job small and swappable.",
      summary: [
        "SOLID: single responsibility, open/closed, Liskov substitution, interface segregation, dependency inversion.",
        "Inject dependencies (objects or functions) through constructors/parameters; wire real ones at startup.",
        "Abstractions + injection make code testable with fakes and extensible without edits.",
      ],
    },

    {
      id: "py-design-patterns",
      title: "Design patterns: factory, strategy, observer, adapter",
      minutes: 18,
      difficulty: 4,
      objectives: [
        "Implement factory, strategy, observer and adapter patterns the Pythonic way",
        "Use dataclasses with slots for lightweight objects",
        "Recognise when a pattern helps — and when a function or dict is enough",
      ],
      version: "dataclass(slots=True) needs Python 3.10+",
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "In Python, the simplest Strategy pattern implementation is often…",
        options: [
          { text: "An abstract class hierarchy with one class per strategy", why: "Possible, but often more than needed." },
          { text: "Passing a function (or a dict of functions)", why: "Correct — functions are first-class objects." },
          { text: "A global variable", why: "That's shared state, not a strategy." },
        ],
        answer: 1,
        hint: "Functions are objects.",
        explain: "Because functions are first-class, many classic patterns collapse into passing functions around.",
      },
      why: "Design patterns are named solutions to recurring problems. Knowing them helps you read framework code (Django signals are observers, `sorted(key=)` is a strategy) and talk about designs with other developers — while Python's features often make them much simpler than in Java or C++.",
      concept: [
        {
          title: "Factory and strategy",
          body: `**Factory**: one place decides which class to create:

\`\`\`python
EXPORTERS = {"csv": CsvExporter, "json": JsonExporter}
def make_exporter(kind): return EXPORTERS[kind]()
\`\`\`

**Strategy**: the algorithm is a swappable object or function: \`checkout(cart, pricing=festival_pricing)\`.`,
        },
        {
          title: "Observer and adapter",
          body: `**Observer**: subjects notify subscribers of events without knowing who they are:

\`\`\`python
class EventBus:
    def __init__(self): self.handlers = defaultdict(list)
    def subscribe(self, event, fn): self.handlers[event].append(fn)
    def publish(self, event, data):
        for fn in self.handlers[event]: fn(data)
\`\`\`

**Adapter**: wrap an object to give it the interface your code expects (e.g. a legacy payment SDK with \`make_payment(paise)\` adapted to your \`pay(rupees)\`).`,
        },
        {
          title: "Slots and readable OO systems",
          body: `\`@dataclass(slots=True)\` (3.10+) stores fields in fixed slots instead of a per-instance dict: less memory, faster attribute access, and no accidental new attributes (\`AttributeError\` on typos). Great for millions of small objects.

Readable OO systems: small classes with clear names, shallow hierarchies, composition over inheritance, behaviour next to the data it uses, and no pattern for its own sake.`,
        },
      ],
      example: {
        title: "Four patterns in a shop",
        code: r`from collections import defaultdict
from dataclasses import dataclass

@dataclass(slots=True)
class Order:
    id: int
    total: float

def regular(total): return total
def festival(total): return round(total * 0.8, 2)
PRICING = {"regular": regular, "festival": festival}

class EventBus:
    def __init__(self):
        self.handlers = defaultdict(list)
    def subscribe(self, event, fn):
        self.handlers[event].append(fn)
    def publish(self, event, data):
        for fn in self.handlers[event]:
            fn(data)

class LegacySms:
    def transmit(self, number, text):
        print(f"[SMS {number}] {text}")
class SmsAdapter:
    def __init__(self, legacy, number):
        self.legacy, self.number = legacy, number
    def notify(self, order):
        self.legacy.transmit(self.number, f"Order {order.id} confirmed: Rs {order.total}")

bus = EventBus()
bus.subscribe("placed", SmsAdapter(LegacySms(), "98450").notify)
bus.subscribe("placed", lambda o: print(f"[log] order {o.id}"))
for i, (amount, mode) in enumerate([(1000, "festival"), (300, "regular")], start=1):
    order = Order(i, PRICING[mode](amount))
    bus.publish("placed", order)
try:
    order.discount = 5
except AttributeError as e:
    print("slots:", type(e).__name__)`,
        output: "[SMS 98450] Order 1 confirmed: Rs 800.0\n[log] order 1\n[SMS 98450] Order 2 confirmed: Rs 300\n[log] order 2\nslots: AttributeError\n",
        lines: [
          [4, "A slotted dataclass: compact and protected against stray attributes."],
          [9, "Strategy as plain functions in a dict — which also acts as a factory."],
          [11, "Observer: publishers don't know who listens."],
          [22, "An old API with the wrong interface…"],
          [24, "…wrapped by an adapter exposing notify(order)."],
          [33, "Pick a pricing strategy by name, then publish the event to all subscribers."],
          [37, "Slots reject attributes that weren't declared."],
        ],
      },
      mistakes: [
        { title: "Pattern for pattern's sake", body: "A Strategy class hierarchy where a function would do is noise. Start simple." },
        { title: "Observers that raise", body: "One failing subscriber can stop the rest. Real event buses catch and log per-handler errors." },
        { title: "Leaky adapters", body: "If callers still need to know the legacy API's quirks, the adapter isn't doing its job." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`class Subject:
    def __init__(self):
        self.observers = []
    def attach(self, fn):
        self.observers.append(fn)
    def set(self, value):
        for fn in self.observers:
            fn(value)
s = Subject()
log = []
s.attach(log.append)
s.attach(lambda v: log.append(v * 10))
s.set(1); s.set(2)
print(log)`,
          answer: "[1, 10, 2, 20]\n",
          hint: "Each set notifies both observers in order.",
          explain: "Each value is appended by the first observer, then ten times it by the second.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Choose the class to create from a name (a factory).",
          code: r`class Csv:
    ext = "csv"
class Json:
    ext = "json"
FORMATS = {"csv": Csv, "json": Json}
def make(kind):
    return FORMATS___()
print(make("json").ext)`,
          blanks: [["[kind]"]],
          output: "json\n",
          hint: "Look up the class, then call it.",
          explain: "`FORMATS[kind]()` finds the class and instantiates it.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "The adapter should let new code call `pay(rupees)` on the old SDK (which wants paise). Which line is wrong?",
          code: r`class OldSdk:
    def charge(self, paise):
        return f"charged {paise} paise"
class PayAdapter:
    def __init__(self, sdk):
        self.sdk = sdk
    def pay(self, rupees):
        return self.sdk.charge(rupees)
print(PayAdapter(OldSdk()).pay(12))`,
          line: 8,
          fix: r`class OldSdk:
    def charge(self, paise):
        return f"charged {paise} paise"
class PayAdapter:
    def __init__(self, sdk):
        self.sdk = sdk
    def pay(self, rupees):
        return self.sdk.charge(rupees * 100)
print(PayAdapter(OldSdk()).pay(12))`,
          output: "charged 1200 paise\n",
          hint: "The adapter must translate units too.",
          explain: "Adapting an interface includes converting arguments: rupees must become paise.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "What does `slots=True` on a dataclass prevent?",
          options: [
            { text: "Changing existing field values", why: "That's frozen=True." },
            { text: "Adding attributes that aren't declared fields", why: "Correct." },
            { text: "Inheritance", why: "Slotted classes can be subclassed." },
          ],
          answer: 1,
          hint: "No per-instance __dict__.",
          explain: "Without a __dict__, only declared slots exist; assigning a new attribute raises AttributeError.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Shipping strategies", difficulty: 3,
          prompt: `Implement shipping cost strategies as functions: \`standard\` (Rs 40, free from 500), \`express\` (Rs 100 + 2% of the order), \`pickup\` (0). Put them in a dict and write \`checkout(amount, method)\` returning \`total\` (amount + shipping, rounded 2) or raising \`ValueError("unknown method")\`. Process lines \`amount method\` until \`end\`.`,
          starter: r`def standard(amount):
    pass
`,
          tests: [
            { label: "Methods", input: "300 standard\n600 standard\n1000 express\n200 pickup\n100 drone\nend\n", output: "340\n600\n1120.0\n200\nerror: unknown method" },
            { label: "Exactly 500", input: "500 standard\nend\n", output: "500", hidden: true, category: "boundary" },
          ],
          hints: [
            "Each strategy takes amount and returns the shipping cost.",
            "SHIPPING = {\"standard\": standard, …}.",
            "checkout looks up the strategy (raise ValueError if missing).",
            "Print the total, or `error: …` when ValueError is raised.",
          ],
          solution: r`def standard(amount):
    return 0 if amount >= 500 else 40

def express(amount):
    return 100 + amount * 0.02

def pickup(amount):
    return 0

SHIPPING = {"standard": standard, "express": express, "pickup": pickup}

def checkout(amount, method):
    if method not in SHIPPING:
        raise ValueError("unknown method")
    return round(amount + SHIPPING[method](amount), 2)

while (line := input()) != "end":
    amount, method = line.split()
    try:
        print(checkout(int(amount), method))
    except ValueError as e:
        print("error:", e)`,
          notes: "Functions in a dict give you both the Strategy and the Factory pattern with almost no ceremony.",
        },
        {
          id: "stretch", kind: "challenge", title: "Observable stock prices", difficulty: 4,
          prompt: `Write \`Stock(symbol)\` with \`subscribe(fn)\` and a \`price\` property whose setter notifies subscribers with \`(symbol, old, new)\` **only when the price changes**. Subscribers: an alert that prints \`ALERT SYM dropped X%\` (rounded 1) when the drop is ≥ 5%, and a logger counting updates. Read lines \`SYMBOL price\` until \`end\`, then print \`updates: N\`.`,
          starter: r`class Stock:
    pass
`,
          tests: [
            { label: "Prices", input: "INFY 1500\nINFY 1500\nINFY 1400\nTCS 4000\nTCS 3900\nINFY 1500\nend\n", output: "ALERT INFY dropped 6.7%\nupdates: 3" },
            { label: "No drops", input: "A 10\nA 11\nend\n", output: "updates: 1", hidden: true },
          ],
          hints: [
            "Keep one Stock per symbol in a dict; the first price sets the value without notifying (old is None).",
            "In the setter: if old is not None and old != new, call each subscriber.",
            "Alert: `drop = (old - new) / old * 100` when new < old.",
            "The logger can be a small class with a count and __call__, or a closure.",
          ],
          solution: r`class Stock:
    def __init__(self, symbol):
        self.symbol = symbol
        self._price = None
        self.subscribers = []

    def subscribe(self, fn):
        self.subscribers.append(fn)

    @property
    def price(self):
        return self._price

    @price.setter
    def price(self, new):
        old, self._price = self._price, new
        if old is not None and old != new:
            for fn in self.subscribers:
                fn(self.symbol, old, new)

def alert(symbol, old, new):
    if new < old and (old - new) / old * 100 >= 5:
        print(f"ALERT {symbol} dropped {round((old - new) / old * 100, 1)}%")

class Counter:
    def __init__(self):
        self.count = 0
    def __call__(self, symbol, old, new):
        self.count += 1

counter = Counter()
stocks = {}
while (line := input()) != "end":
    symbol, price = line.split()
    if symbol not in stocks:
        stocks[symbol] = Stock(symbol)
        stocks[symbol].subscribe(alert)
        stocks[symbol].subscribe(counter)
    stocks[symbol].price = float(price)
print("updates:", counter.count)`,
          notes: "The Stock knows nothing about alerts or logging; new behaviours plug in as subscribers. A class with __call__ works as a stateful callback.",
        },
      ],
      realWorld: "Django signals and GUI events are observers; payment and storage backends use strategies and factories; adapters wrap third-party SDKs so the rest of the code isn't tied to them; slotted dataclasses keep large in-memory datasets lean.",
      reteach: "Patterns are recipes cooks reuse: a *factory* is the kitchen's order counter deciding which dish to make; a *strategy* is choosing a cooking method (bake or fry) at the last moment; an *observer* is a dinner bell — whoever's listening comes; an *adapter* is a plug converter for a foreign appliance. Python's first-class functions make several of these one-liners.",
      summary: [
        "Factory: one place maps names to classes; Strategy: swappable functions/objects.",
        "Observer: subscribe/publish without coupling; Adapter: wrap a foreign interface.",
        "dataclass(slots=True) for lean objects; keep OO systems small, shallow and composed.",
      ],
    },
  ],
  exam: [
    {
      id: "e1", kind: "predict", difficulty: 4,
      code: r`from dataclasses import dataclass
@dataclass(slots=True)
class P:
    x: int
p = P(1)
p.x = 2
try:
    p.y = 3
except AttributeError:
    print("no new attributes")
print(p.x, hasattr(p, "__dict__"))`,
      answer: "no new attributes\n2 False\n",
      hint: "slots=True removes the per-instance __dict__ but fields stay assignable.",
      explain: "Declared fields can still change (it isn't frozen), but there's no __dict__, so a new attribute like y raises AttributeError.",
    },
    {
      id: "e2", kind: "mcq", difficulty: 3,
      prompt: "Which change best applies dependency inversion to `class Report: def __init__(self): self.db = PostgresDB()`?",
      options: [
        { text: "Make PostgresDB a global", why: "Still hard-wired." },
        { text: "`def __init__(self, db): self.db = db` — depend on any object with the needed methods", why: "Correct." },
        { text: "Subclass PostgresDB", why: "Increases coupling." },
      ],
      answer: 1,
      hint: "Depend on abstractions; inject them.",
      explain: "Receiving the database lets you pass any implementation (real or fake).",
    },
    {
      id: "e3", kind: "fill", difficulty: 3,
      prompt: "Notify every subscriber.",
      code: r`subscribers = [lambda m: print("A got", m), lambda m: print("B got", m)]
def publish(msg):
    for fn in ___:
        fn(msg)
publish("hi")`,
      blanks: [["subscribers"]],
      output: "A got hi\nB got hi\n",
      hint: "Loop over the list of callbacks.",
      explain: "Publishing calls every registered callback with the message.",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: pluggable notification system", difficulty: 4,
    prompt: `Design a notification system:

- Protocol \`Channel\` with \`send(user, text) -> str\`.
- Channels: \`Email\` (\`email to USER: TEXT\`), \`Sms\` (truncates text to 20 chars: \`sms to USER: TEXT\`), and \`LegacyPushAdapter\` wrapping the given \`LegacyPush.push_message(payload: dict)\`.
- A factory \`make_channel(name)\` from a dict.
- \`Notifier(channels)\` (injected list) with \`notify(user, text)\` returning all results.

Read the enabled channel names on the first line, then \`user|text\` lines until \`end\`, printing each result line.`,
    starter: r`from typing import Protocol

class LegacyPush:
    def push_message(self, payload):
        return f"push[{payload['to']}] {payload['body']}"
`,
    tests: [
      { label: "All channels", input: "email sms push\nasha|Your exam results are published today\nend\n", output: "email to asha: Your exam results are published today\nsms to asha: Your exam results ar\npush[asha] Your exam results are published today" },
      { label: "One channel", input: "sms\nravi|Hi\nend\n", output: "sms to ravi: Hi", hidden: true },
    ],
    hints: [
      "Each channel class has a send(user, text) method returning a string.",
      "The adapter builds `{\"to\": user, \"body\": text}` and calls push_message.",
      "CHANNELS = {\"email\": Email, \"sms\": Sms, \"push\": lambda: LegacyPushAdapter(LegacyPush())}.",
      "Notifier.notify returns `[c.send(user, text) for c in self.channels]`.",
    ],
    solution: r`from typing import Protocol

class LegacyPush:
    def push_message(self, payload):
        return f"push[{payload['to']}] {payload['body']}"

class Channel(Protocol):
    def send(self, user: str, text: str) -> str: ...

class Email:
    def send(self, user, text):
        return f"email to {user}: {text}"

class Sms:
    def send(self, user, text):
        return f"sms to {user}: {text[:20]}"

class LegacyPushAdapter:
    def __init__(self, legacy):
        self.legacy = legacy
    def send(self, user, text):
        return self.legacy.push_message({"to": user, "body": text})

CHANNELS = {"email": Email, "sms": Sms, "push": lambda: LegacyPushAdapter(LegacyPush())}

def make_channel(name):
    return CHANNELS[name]()

class Notifier:
    def __init__(self, channels: list[Channel]):
        self.channels = channels
    def notify(self, user, text):
        return [c.send(user, text) for c in self.channels]

notifier = Notifier([make_channel(n) for n in input().split()])
while (line := input()) != "end":
    user, text = line.split("|", 1)
    for result in notifier.notify(user, text):
        print(result)`,
    notes: "Protocol (interface), adapter (legacy push), factory (CHANNELS) and dependency injection (Notifier receives channels) — adding WhatsApp later is one class and one dict entry.",
  },
};
