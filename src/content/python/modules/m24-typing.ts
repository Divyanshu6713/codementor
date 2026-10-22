import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 24 — Type hints and static analysis. */
export const M24: PyModuleDef = {
  id: "py-typing",
  number: 24,
  level: 4,
  title: "Type Hints and Static Analysis",
  summary: "Built-in annotations; the typing module; Optional and union types; Literal; Callable; type variables and generics; TypedDict; Protocol; static checkers (mypy, Pyright); runtime validation versus static checking.",
  track: "core",
  optionalNote: "Strongly recommended for team projects and libraries; small scripts can skip most of it.",
  prereqs: ["py-design"],
  lessons: [
    {
      id: "py-typing-basics",
      title: "Annotations, Optional, unions, Literal and Callable",
      minutes: 16,
      difficulty: 3,
      version: "`list[int]` needs 3.9+, `X | Y` needs 3.10+",
      objectives: [
        "Annotate variables, parameters and returns with built-in generics",
        "Express 'maybe missing' and 'one of several' with Optional, unions and Literal",
        "Type function arguments that are themselves functions (Callable)",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "What does `def find(name: str) -> int | None` tell a reader?",
        options: [
          { text: "It returns either an int or None", why: "Correct." },
          { text: "It raises an error unless given an int", why: "Hints don't raise anything." },
          { text: "It returns an int that might be zero", why: "None isn't zero." },
        ],
        answer: 0,
        hint: "Read `|` as 'or'.",
        explain: "`int | None` (or `Optional[int]`) means the function can return an int or None — callers must handle both.",
      },
      why: "Type hints are machine-checked documentation. They let editors autocomplete correctly, catch whole classes of bugs before running (passing a str where an int is needed, forgetting a None check), and make large codebases navigable.",
      concept: [
        {
          title: "Built-in annotations",
          body: `\`\`\`python
count: int = 0
names: list[str] = []
scores: dict[str, float] = {}
point: tuple[int, int] = (0, 0)
row: tuple[str, ...] = ("a", "b")       # any length
unique: set[int] = set()
def area(w: float, h: float) -> float: ...
\`\`\``,
        },
        {
          title: "Optional, unions and Literal",
          body: `\`\`\`python
def find(user_id: int) -> User | None: ...        # Optional[User]
def parse(value: str | bytes) -> str: ...          # Union[str, bytes]
from typing import Literal
def align(text: str, side: Literal["left", "right", "center"]) -> str: ...
\`\`\`

A checker forces you to handle None before using an Optional value: \`user = find(1); user.name\` is an error until you check \`if user is not None\`.`,
        },
        {
          title: "Callable and Any",
          body: `\`\`\`python
from collections.abc import Callable
def apply(fn: Callable[[int], int], xs: list[int]) -> list[int]:
    return [fn(x) for x in xs]
\`\`\`

\`Callable[[ArgTypes...], ReturnType]\`. \`Any\` turns checking off for a value — use it sparingly (prefer \`object\` when you really accept anything).`,
        },
      ],
      example: {
        title: "Typed helpers (hints don't change behaviour)",
        code: r`from collections.abc import Callable
from typing import Literal

def lookup(stock: dict[str, int], item: str) -> int | None:
    return stock.get(item)

def pad(text: str, width: int, side: Literal["left", "right"] = "left") -> str:
    return text.rjust(width) if side == "left" else text.ljust(width)

def apply_all(fn: Callable[[float], float], values: list[float]) -> list[float]:
    return [round(fn(v), 2) for v in values]

stock = {"pen": 10}
qty = lookup(stock, "ink")
print(qty if qty is not None else "out of stock")
print("[" + pad("7", 3) + "]", "[" + pad("7", 3, "right") + "]")
print(apply_all(lambda c: c * 9 / 5 + 32, [0.0, 37.5]))
print(lookup.__annotations__["return"])
print(pad(123, 5) if False else "hints are not enforced at run time")`,
        output: "out of stock\n[  7] [7  ]\n[32.0, 99.5]\nint | None\nhints are not enforced at run time\n",
        lines: [
          [4, "The return type says callers must expect None for unknown items."],
          [7, "Literal restricts `side` to two exact strings (for the checker)."],
          [10, "Callable[[float], float]: a function from float to float."],
          [15, "The None check a type checker would insist on."],
          [18, "Annotations are stored on the function; `int | None` is a real object at run time."],
          [19, "Python itself never checks hints — static checkers (mypy, Pyright) do."],
        ],
      },
      mistakes: [
        { title: "Expecting run-time enforcement", body: "Hints are ignored when the program runs; run mypy/pyright in your editor or CI." },
        { title: "Forgetting None", body: "A function that can return None must say `-> X | None`, or callers won't be warned." },
        { title: "Overusing Any", body: "Every Any is a hole in the checking. Prefer precise types or `object`." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`def double(x: int) -> int:
    return x * 2
print(double(3), double("ab"), double.__annotations__["x"].__name__)`,
          answer: "6 abab int\n",
          hint: "Python doesn't check hints when running.",
          explain: "Both calls run; the str is repeated. A static checker would flag `double(\"ab\")`, but the interpreter doesn't.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Annotate a function that may return a string or None.",
          code: r`def nickname(name: str) -> str ___ None:
    return name[:3] if len(name) > 3 else None
print(nickname("Ashwini"), nickname("Al"))`,
          blanks: [["|"]],
          output: "Ash None\n",
          hint: "The union operator for types (3.10+).",
          explain: "`str | None` means 'a string or None'.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "This crashes for unknown users — exactly what the `-> User | None` hint warns about. Which line ignores it?",
          code: r`def find(users: dict[str, str], key: str) -> str | None:
    return users.get(key)
users = {"a1": "Asha"}
print(find(users, "zz").upper())`,
          line: 4,
          fix: r`def find(users: dict[str, str], key: str) -> str | None:
    return users.get(key)
users = {"a1": "Asha"}
name = find(users, "zz")
print(name.upper() if name is not None else "unknown")`,
          output: "unknown\n",
          hint: "What if the result is None?",
          explain: "The return type includes None; calling .upper() without checking crashes (and mypy would report it before running).",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "Which annotation describes 'a function taking a str and an int, returning bool'?",
          options: [
            { text: "`Callable[str, int, bool]`", why: "Arguments go in an inner list." },
            { text: "`Callable[[str, int], bool]`", why: "Correct." },
            { text: "`Callable[bool, [str, int]]`", why: "Return type comes last." },
          ],
          answer: 1,
          hint: "Callable[[args], return].",
          explain: "The first element is the list of argument types; the second is the return type.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Fully typed price lookup", difficulty: 3,
          prompt: `Write typed functions: \`parse_menu(lines: list[str]) -> dict[str, float]\` (lines \`item=price\`), \`price_of(menu: dict[str, float], item: str) -> float | None\`, and \`bill(menu, items: list[str]) -> tuple[float, list[str]]\` returning the total and the list of unknown items. Read menu lines until \`---\`, then an order line; print \`total T\` (2 decimals) and \`unknown: a, b\` or \`unknown: none\`.`,
          starter: r`def parse_menu(lines: list[str]) -> dict[str, float]:
    return {}
`,
          tests: [
            { label: "Order", input: "tea=15\ncoffee=25.5\n---\ntea coffee cake tea\n", output: "total 55.50\nunknown: cake" },
            { label: "All known", input: "x=1\n---\nx x\n", output: "total 2.00\nunknown: none", hidden: true },
          ],
          hints: [
            "parse_menu splits each line at '=' and converts the price to float.",
            "price_of returns menu.get(item).",
            "bill accumulates known prices and collects unknown names.",
            "Check `if p is None` before adding — exactly what the Optional type demands.",
          ],
          solution: r`def parse_menu(lines: list[str]) -> dict[str, float]:
    menu: dict[str, float] = {}
    for line in lines:
        item, price = line.split("=")
        menu[item] = float(price)
    return menu

def price_of(menu: dict[str, float], item: str) -> float | None:
    return menu.get(item)

def bill(menu: dict[str, float], items: list[str]) -> tuple[float, list[str]]:
    total = 0.0
    unknown: list[str] = []
    for item in items:
        p = price_of(menu, item)
        if p is None:
            unknown.append(item)
        else:
            total += p
    return total, unknown

lines: list[str] = []
while (line := input()) != "---":
    lines.append(line)
total, unknown = bill(parse_menu(lines), input().split())
print(f"total {total:.2f}")
print("unknown:", ", ".join(unknown) if unknown else "none")`,
          notes: "Every signature documents its inputs and outputs; the `float | None` return forces the None branch that prevents crashes on unknown items.",
        },
        {
          id: "stretch", kind: "task", title: "Literal-driven formatter", difficulty: 3,
          prompt: `Write \`fmt(value: float, style: Literal["plain", "money", "percent"]) -> str\`: plain → \`str(value)\`, money → \`Rs 1,234.50\`, percent → \`12.5%\` (value is a fraction 0.125). For other styles raise \`ValueError(f"unknown style {style!r}")\`. Process lines \`value style\` until \`end\`.`,
          starter: r`from typing import Literal
`,
          tests: [
            { label: "Styles", input: "1234.5 money\n0.125 percent\n3.0 plain\n2 bold\nend\n", output: "Rs 1,234.50\n12.5%\n3.0\nerror: unknown style 'bold'" },
            { label: "Big money", input: "1000000 money\nend\n", output: "Rs 1,000,000.00", hidden: true },
          ],
          hints: [
            "Annotate the style parameter with Literal[...].",
            "money: `f\"Rs {value:,.2f}\"`; percent: `f\"{value:.1%}\"`.",
            "Raise for anything else (static checkers would flag bad literals in your own code, but input text can be anything).",
            "The loop catches ValueError and prints `error: …`.",
          ],
          solution: r`from typing import Literal

Style = Literal["plain", "money", "percent"]

def fmt(value: float, style: Style) -> str:
    if style == "plain":
        return str(value)
    if style == "money":
        return f"Rs {value:,.2f}"
    if style == "percent":
        return f"{value:.1%}"
    raise ValueError(f"unknown style {style!r}")

while (line := input()) != "end":
    value, style = line.split()
    try:
        print(fmt(float(value), style))  # type: ignore[arg-type]
    except ValueError as e:
        print("error:", e)`,
          notes: "Literal documents and checks the allowed values for code you write; data from outside (input, JSON) still needs run-time validation — the theme of the third lesson.",
        },
      ],
      realWorld: "Large Python codebases (Dropbox, Instagram, many startups) run mypy or Pyright in CI; FastAPI and pydantic read type hints to validate and document APIs automatically.",
      reteach: "Type hints are labels on boxes: 'this box holds a list of strings', 'this one might be empty (None)'. Python itself doesn't read the labels when the program runs — but a checker (mypy/Pyright) walks through the warehouse before opening time and complains wherever a label and its contents don't match.",
      summary: [
        "Annotate with built-ins: list[int], dict[str, float], tuple[int, ...], set[str].",
        "X | None (Optional), A | B (Union), Literal[...], Callable[[args], ret]; avoid Any.",
        "Hints aren't enforced at run time — use a static checker.",
      ],
    },

    {
      id: "py-generics-protocols",
      title: "TypeVar, generics, TypedDict and Protocol",
      minutes: 17,
      difficulty: 4,
      version: "`class Box[T]` / `def f[T]` syntax needs 3.12+; TypeVar works everywhere",
      objectives: [
        "Write generic functions and classes with type variables",
        "Describe dict-shaped data with TypedDict",
        "Describe interfaces structurally with Protocol",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "`def first(items: list[T]) -> T` — what does T achieve?",
        options: [
          { text: "Nothing; it's the same as Any", why: "Any loses the connection; T keeps it." },
          { text: "It ties the return type to the element type: list[str] → str, list[int] → int", why: "Correct." },
          { text: "It restricts items to text", why: "T can be any type." },
        ],
        answer: 1,
        hint: "A placeholder that is filled in at each call.",
        explain: "A type variable lets the checker know that the output type matches the input's element type.",
      },
      why: "Reusable code — containers, caches, utilities — works for many types. Generics keep that code precise ('a Stack of Orders', not 'a Stack of anything'), TypedDict types JSON-like data, and Protocols type duck-typed interfaces.",
      concept: [
        {
          title: "Type variables and generics",
          body: `\`\`\`python
from typing import TypeVar, Generic
T = TypeVar("T")

def first(items: list[T]) -> T:
    return items[0]

class Stack(Generic[T]):
    def __init__(self) -> None:
        self.items: list[T] = []
    def push(self, item: T) -> None:
        self.items.append(item)
    def pop(self) -> T:
        return self.items.pop()

# Python 3.12+: class Stack[T]: ... and def first[T](items: list[T]) -> T: ...
\`\`\`

Bounded: \`TypeVar("N", bound=float)\` only accepts float-like types.`,
        },
        {
          title: "TypedDict",
          body: `\`\`\`python
from typing import TypedDict, NotRequired
class Student(TypedDict):
    name: str
    marks: list[int]
    email: NotRequired[str]      # 3.11+
s: Student = {"name": "Asha", "marks": [91]}
\`\`\`

At run time it's a plain dict; checkers verify the keys and value types — ideal for JSON.`,
        },
        {
          title: "Protocol",
          body: `\`\`\`python
from typing import Protocol
class HasArea(Protocol):
    def area(self) -> float: ...
def total_area(shapes: list[HasArea]) -> float:
    return sum(s.area() for s in shapes)
\`\`\`

Any class with \`area() -> float\` is accepted — no inheritance needed (structural typing).`,
        },
      ],
      example: {
        title: "A generic, typed queue",
        code: r`from typing import Generic, TypeVar, TypedDict, Protocol

T = TypeVar("T")

class Queue(Generic[T]):
    def __init__(self) -> None:
        self._items: list[T] = []
    def put(self, item: T) -> None:
        self._items.append(item)
    def get(self) -> T:
        return self._items.pop(0)
    def __len__(self) -> int:
        return len(self._items)

class Job(TypedDict):
    id: int
    task: str

class HasPriority(Protocol):
    priority: int

class Ticket:
    def __init__(self, priority: int) -> None:
        self.priority = priority

def most_urgent(items: list[HasPriority]) -> int:
    return min(i.priority for i in items)

jobs: Queue[Job] = Queue()
jobs.put({"id": 1, "task": "backup"})
jobs.put({"id": 2, "task": "email"})
job = jobs.get()
print(job["task"], len(jobs), type(job).__name__)
print(most_urgent([Ticket(3), Ticket(1)]))
print(Queue[int].__origin__.__name__, Job.__required_keys__ == frozenset({"id", "task"}))`,
        output: "backup 1 dict\n1\nQueue True\n",
        lines: [
          [3, "T is a placeholder filled in per use: Queue[Job], Queue[int]…"],
          [5, "Generic[T] makes the class parameterisable."],
          [10, "get returns T — for Queue[Job], the checker knows it's a Job."],
          [15, "TypedDict documents the exact keys and types of a dict."],
          [19, "A Protocol with an attribute: anything with an int priority."],
          [33, "TypedDicts are plain dicts at run time."],
          [35, "Generics and TypedDicts keep their information for introspection tools."],
        ],
      },
      mistakes: [
        { title: "Reusing one TypeVar for unrelated types", body: "In one signature, every T must be the same type. Use separate TypeVars for independent types." },
        { title: "Expecting TypedDict validation at run time", body: "TypedDict is a static description; validate external JSON with code or pydantic." },
        { title: "Protocols with too many members", body: "Smaller protocols match more classes and document intent better." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`from typing import TypeVar
T = TypeVar("T")
def last(items: list[T]) -> T:
    return items[-1]
print(last([1, 2, 3]), last(["a", "b"]), last([[0], [1]]))`,
          answer: "3 b [1]\n",
          hint: "The function works for any element type.",
          explain: "T adapts to each call's element type; at run time it's just Python.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Make the class generic over T.",
          code: r`from typing import Generic, TypeVar
T = TypeVar("T")
class Box(___[T]):
    def __init__(self, item: T) -> None:
        self.item = item
print(Box[str]("hi").item)`,
          blanks: [["Generic"]],
          output: "hi\n",
          hint: "Inherit from the typing base for generic classes.",
          explain: "`class Box(Generic[T])` declares a generic class; `Box[str]` parameterises it.",
        },
        {
          id: "b1", kind: "bug", difficulty: 4,
          prompt: "A type checker accepts this code, but it crashes when the JSON lacks `email`. Which line should use a safe lookup?",
          code: r`from typing import TypedDict, NotRequired
class User(TypedDict):
    name: str
    email: NotRequired[str]
def contact(u: User) -> str:
    return u["email"]
print(contact({"name": "Asha"}))`,
          line: 6,
          fix: r`from typing import TypedDict, NotRequired
class User(TypedDict):
    name: str
    email: NotRequired[str]
def contact(u: User) -> str:
    return u.get("email", "no email")
print(contact({"name": "Asha"}))`,
          output: "no email\n",
          hint: "NotRequired means the key may be missing.",
          explain: "Optional keys must be read with .get() (or checked with `in`); indexing a missing key raises KeyError.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "What's the advantage of `list[HasArea]` (a Protocol) over `list[Shape]` (a base class)?",
          options: [
            { text: "It runs faster", why: "No run-time difference." },
            { text: "Classes don't need to inherit from anything to be accepted", why: "Correct." },
            { text: "It validates areas at run time", why: "Protocols are static (unless runtime_checkable, which only checks names)." },
          ],
          answer: 1,
          hint: "Structural vs nominal.",
          explain: "Protocols accept any class with the right members, including third-party classes.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Generic cache with stats", difficulty: 4,
          prompt: `Write \`Cache(Generic[K, V])\` with \`get(key) -> V | None\`, \`put(key, value)\`, and \`stats() -> tuple[int, int]\` (hits, misses). Read commands \`put K V\` / \`get K\` until \`end\` (keys and values are strings), printing get results (\`None\` for misses), then \`hits H misses M\`.`,
          starter: r`from typing import Generic, TypeVar
K = TypeVar("K")
V = TypeVar("V")
`,
          tests: [
            { label: "Session", input: "put a 1\nget a\nget b\nput b 2\nget b\nend\n", output: "1\nNone\n2\nhits 2 misses 1" },
            { label: "Only misses", input: "get x\nend\n", output: "None\nhits 0 misses 1", hidden: true },
          ],
          hints: [
            "class Cache(Generic[K, V]) with `self._data: dict[K, V] = {}`.",
            "get increments hits or misses and returns `self._data.get(key)`.",
            "Count before returning.",
            "Create `Cache[str, str]()` and dispatch commands.",
          ],
          solution: r`from typing import Generic, TypeVar
K = TypeVar("K")
V = TypeVar("V")

class Cache(Generic[K, V]):
    def __init__(self) -> None:
        self._data: dict[K, V] = {}
        self.hits = 0
        self.misses = 0

    def get(self, key: K) -> V | None:
        if key in self._data:
            self.hits += 1
            return self._data[key]
        self.misses += 1
        return None

    def put(self, key: K, value: V) -> None:
        self._data[key] = value

    def stats(self) -> tuple[int, int]:
        return self.hits, self.misses

cache: Cache[str, str] = Cache()
while (line := input()) != "end":
    parts = line.split()
    if parts[0] == "put":
        cache.put(parts[1], parts[2])
    else:
        print(cache.get(parts[1]))
hits, misses = cache.stats()
print("hits", hits, "misses", misses)`,
          notes: "Two type variables keep keys and values independently typed: a checker knows `Cache[str, int].get(...)` returns `int | None`.",
        },
        {
          id: "stretch", kind: "task", title: "Typed JSON records", difficulty: 4,
          prompt: `Define \`class Order(TypedDict)\` with \`id: int\`, \`items: list[str]\`, \`total: float\` and \`coupon: NotRequired[str]\`. Read one JSON array of orders (a single line), and print for each \`#ID: N items, Rs TOTAL\` plus \` (coupon CODE)\` when present, then the grand total (2 decimals).`,
          starter: r`import json
from typing import TypedDict, NotRequired
`,
          tests: [
            { label: "Two orders", input: "[{\"id\": 1, \"items\": [\"pen\", \"ink\"], \"total\": 40.5, \"coupon\": \"NEW10\"}, {\"id\": 2, \"items\": [\"bag\"], \"total\": 600}]\n", output: "#1: 2 items, Rs 40.5 (coupon NEW10)\n#2: 1 items, Rs 600\ngrand total 640.50" },
            { label: "Empty", input: "[]\n", output: "grand total 0.00", hidden: true, category: "edge" },
          ],
          hints: [
            "Declare the TypedDict with NotRequired for coupon.",
            "`orders: list[Order] = json.loads(input())`.",
            "Use `o.get(\"coupon\")` for the optional key.",
            "Sum `o[\"total\"]` for the grand total.",
          ],
          solution: r`import json
from typing import TypedDict, NotRequired

class Order(TypedDict):
    id: int
    items: list[str]
    total: float
    coupon: NotRequired[str]

orders: list[Order] = json.loads(input())
for o in orders:
    coupon = o.get("coupon")
    extra = f" (coupon {coupon})" if coupon else ""
    print(f"#{o['id']}: {len(o['items'])} items, Rs {o['total']}{extra}")
print(f"grand total {sum(o['total'] for o in orders):.2f}")`,
          notes: "TypedDict documents the JSON shape for editors and checkers, but json.loads does no validation — malformed data would only fail later. That's why APIs use validators like pydantic (next lesson).",
        },
      ],
      realWorld: "Generic containers and repositories (Repository[User]), TypedDicts for API payloads and configuration, and Protocols for pluggable backends are standard in typed codebases.",
      reteach: "A type variable is a blank in a form ('a box of ____') that's filled in each time you use it — a box of Orders, a box of ints. TypedDict is a form describing which keys a dict must have. Protocol is a job description that anyone with the right skills meets, no membership needed.",
      summary: [
        "TypeVar + Generic (or 3.12 `class X[T]`) make reusable code precisely typed.",
        "TypedDict types dict-shaped/JSON data; NotRequired marks optional keys.",
        "Protocol types structural interfaces.",
      ],
    },

    {
      id: "py-type-checking",
      title: "Static checkers vs runtime validation",
      minutes: 15,
      difficulty: 3,
      objectives: [
        "Explain what mypy and Pyright do and how to run them",
        "Validate untrusted data at run time with explicit checks",
        "Combine static typing and runtime validation at system boundaries",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "Your code is fully type-checked by mypy. Can a JSON request still put a string where an int is expected?",
        options: [
          { text: "No, mypy prevents it", why: "mypy only analyses your source code, not data arriving at run time." },
          { text: "Yes — external data must be validated at run time", why: "Correct." },
          { text: "Only on Windows", why: "Platform doesn't matter." },
        ],
        answer: 1,
        hint: "Static = before running.",
        explain: "Static checkers verify code; data from users, files and networks must be validated when it arrives.",
      },
      why: "Static checking catches programmer mistakes before running; runtime validation catches bad data while running. Real systems need both: type-checked internals, and strict validation wherever data enters.",
      concept: [
        {
          title: "mypy and Pyright",
          body: `\`\`\`
python -m pip install mypy
mypy src/            # reports type errors without running anything
\`\`\`

Pyright (and VS Code's Pylance) does the same, very fast, inside the editor. Start with \`--strict\` on new code; add \`# type: ignore[code]\` only with a reason. Checkers find: wrong argument types, missing None checks, typos in attribute names, wrong return types, unreachable code.`,
        },
        {
          title: "Runtime validation at the boundary",
          body: `\`\`\`python
def parse_user(data: object) -> User:
    if not isinstance(data, dict):
        raise ValueError("expected an object")
    name, age = data.get("name"), data.get("age")
    if not isinstance(name, str) or not name:
        raise ValueError("name must be a non-empty string")
    if not isinstance(age, int) or isinstance(age, bool) or not 0 < age < 130:
        raise ValueError("age must be an integer 1-129")
    return User(name, age)
\`\`\`

Once data passes the boundary, the rest of the program can trust the types. Libraries like **pydantic** generate this validation from type hints (FastAPI uses it).`,
        },
      ],
      example: {
        title: "Validate at the edge, trust inside",
        code: r`import json
from dataclasses import dataclass

@dataclass(frozen=True)
class Signup:
    name: str
    age: int
    plan: str

PLANS = {"free", "pro"}

def parse_signup(raw: str) -> Signup:
    data = json.loads(raw)
    if not isinstance(data, dict):
        raise ValueError("expected a JSON object")
    name, age, plan = data.get("name"), data.get("age"), data.get("plan", "free")
    if not isinstance(name, str) or not name.strip():
        raise ValueError("name is required")
    if type(age) is not int or not 13 <= age <= 120:
        raise ValueError("age must be a whole number 13-120")
    if plan not in PLANS:
        raise ValueError(f"plan must be one of {sorted(PLANS)}")
    return Signup(name.strip(), age, plan)

for raw in ['{"name": "Asha", "age": 16}', '{"name": "", "age": 20}', '{"name": "Ravi", "age": "20"}',
            '{"name": "Zoe", "age": 30, "plan": "gold"}', '[1, 2]', '{"name": "Dev", "age": true}']:
    try:
        print("ok", parse_signup(raw))
    except ValueError as e:
        print("rejected:", e)`,
        output: "ok Signup(name='Asha', age=16, plan='free')\nrejected: name is required\nrejected: age must be a whole number 13-120\nrejected: plan must be one of ['free', 'pro']\nrejected: expected a JSON object\nrejected: age must be a whole number 13-120\n",
        lines: [
          [12, "The boundary function: raw text in, a trusted, typed object out."],
          [13, "JSON can be any shape — check it's an object first."],
          [18, "`type(age) is not int` also rejects bools (True is an int subclass!) and strings."],
          [20, "Membership check for an allowed set of values."],
          [22, "After validation, the rest of the program works with a typed, immutable Signup."],
        ],
      },
      mistakes: [
        { title: "Trusting type hints for external data", body: "`def handle(age: int)` called with JSON data can still receive \"20\" or True. Validate at the boundary." },
        { title: "isinstance(x, int) accepting bools", body: "True and False are ints. Use `type(x) is int` or check bool explicitly when it matters." },
        { title: "Validating everywhere", body: "Repeating checks deep inside the program adds noise. Validate once at entry, then rely on types." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`for v in [5, True, "5", 5.0]:
    print(isinstance(v, int), type(v) is int, end=" | ")
print()`,
          answer: "True True | True False | False False | False False | \n",
          hint: "bool is a subclass of int.",
          explain: "isinstance(True, int) is True because bool subclasses int; `type(v) is int` is only True for real ints.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Reject anything that isn't a dict before reading keys.",
          code: r`import json
data = json.loads("[1, 2]")
if not ___(data, dict):
    print("expected an object")`,
          blanks: [["isinstance"]],
          output: "expected an object\n",
          hint: "A built-in type check.",
          explain: "`isinstance(data, dict)` guards against arrays, strings and numbers.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "The age check lets `true` (JSON boolean) through. Which line?",
          code: r`import json
def valid_age(v):
    return isinstance(v, int) and 0 < v < 130
print(valid_age(json.loads("true")), valid_age(42))`,
          line: 3,
          fix: r`import json
def valid_age(v):
    return type(v) is int and 0 < v < 130
print(valid_age(json.loads("true")), valid_age(42))`,
          output: "False True\n",
          hint: "Is True an int?",
          explain: "bool is a subclass of int, so isinstance(True, int) is True and True counts as 1. Use `type(v) is int`.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "Where should runtime validation of user data happen?",
          options: [
            { text: "In every function that uses the data", why: "Repetitive and easy to forget." },
            { text: "At the boundary where data enters (request handler, file loader)", why: "Correct." },
            { text: "Nowhere if you use type hints", why: "Hints don't check data." },
          ],
          answer: 1,
          hint: "Validate once, early.",
          explain: "Validate at entry and convert to trusted typed objects; inner code then relies on static types.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Validate a config file", difficulty: 3,
          prompt: `Read one JSON object (one line). Validate: \`port\` int 1–65535 (not bool), \`host\` non-empty string, \`debug\` bool (default false). Print \`OK host:port debug=…\` or every error found, one per line, as \`error: …\` (in the order port, host, debug).`,
          starter: r`import json
`,
          tests: [
            { label: "Valid", input: "{\"port\": 8080, \"host\": \"localhost\"}\n", output: "OK localhost:8080 debug=False" },
            { label: "Several errors", input: "{\"port\": \"80\", \"host\": \"\", \"debug\": \"yes\"}\n", output: "error: port must be an integer 1-65535\nerror: host must be a non-empty string\nerror: debug must be true or false" },
            { label: "Bool port", input: "{\"port\": true, \"host\": \"x\", \"debug\": true}\n", output: "error: port must be an integer 1-65535", hidden: true, category: "edge" },
          ],
          hints: [
            "Collect messages in a list instead of stopping at the first.",
            "Port: `type(p) is int and 1 <= p <= 65535`.",
            "Debug: `isinstance(d, bool)` (default False when missing).",
            "Print OK only when the error list is empty.",
          ],
          solution: r`import json

data = json.loads(input())
errors = []
port, host, debug = data.get("port"), data.get("host"), data.get("debug", False)
if type(port) is not int or not 1 <= port <= 65535:
    errors.append("port must be an integer 1-65535")
if not isinstance(host, str) or not host:
    errors.append("host must be a non-empty string")
if not isinstance(debug, bool):
    errors.append("debug must be true or false")
if errors:
    for e in errors:
        print("error:", e)
else:
    print(f"OK {host}:{port} debug={debug}")`,
          notes: "Reporting all errors at once is friendlier for configuration files. pydantic would generate equivalent checks from a typed model.",
        },
        {
          id: "stretch", kind: "task", title: "Schema-driven validator", difficulty: 4,
          prompt: `Write \`validate(data, schema)\` where schema maps field → (type, required). Return a list of error strings: \`missing FIELD\`, \`FIELD must be TYPE\` (bools never count as int/float; ints are accepted for float). Validate each JSON object line against \`{"name": (str, True), "age": (int, True), "score": (float, False)}\` until \`end\`, printing \`valid\` or the errors joined by \`; \`.`,
          starter: r`import json
SCHEMA = {"name": (str, True), "age": (int, True), "score": (float, False)}
`,
          tests: [
            { label: "Mixed", input: "{\"name\": \"Asha\", \"age\": 16, \"score\": 91}\n{\"age\": 16.5}\n{\"name\": \"Ravi\", \"age\": true, \"score\": \"high\"}\nend\n", output: "valid\nmissing name; age must be int\nage must be int; score must be float" },
          ],
          hints: [
            "Loop over the schema items.",
            "Missing + required → error; missing + optional → fine.",
            "A helper `matches(value, kind)` rejects bools, and accepts int for float.",
            "Join the list with '; ' or print 'valid'.",
          ],
          solution: r`import json
SCHEMA = {"name": (str, True), "age": (int, True), "score": (float, False)}

def matches(value, kind):
    if isinstance(value, bool):
        return kind is bool
    if kind is float:
        return isinstance(value, (int, float))
    return isinstance(value, kind)

def validate(data, schema):
    errors = []
    for field, (kind, required) in schema.items():
        if field not in data:
            if required:
                errors.append(f"missing {field}")
            continue
        if not matches(data[field], kind):
            errors.append(f"{field} must be {kind.__name__}")
    return errors

while (line := input()) != "end":
    errs = validate(json.loads(line), SCHEMA)
    print("; ".join(errs) if errs else "valid")`,
          notes: "A tiny declarative validator — the idea behind pydantic, marshmallow and JSON Schema: describe the shape once, validate any data against it.",
        },
      ],
      realWorld: "FastAPI validates every request body with pydantic models built from type hints and returns clear 422 errors; CI pipelines run mypy/pyright on every commit; data pipelines validate files before loading them into databases.",
      reteach: "Static checking is proofreading the recipe before cooking (mypy reads your code). Runtime validation is checking the ingredients that arrive at the door (data from users and files) — the best recipe can't stop a delivery of salt labelled sugar. Check deliveries at the door, then cook with confidence.",
      summary: [
        "mypy/Pyright check code statically (editor + CI); they never see run-time data.",
        "Validate external data at the boundary (types, ranges, required fields; beware bool-as-int).",
        "After validation, pass typed objects (dataclasses) inward; pydantic automates this from hints.",
      ],
      libraryCode: [{
        title: "The same validation with pydantic",
        code: `from pydantic import BaseModel, Field, ValidationError

class Signup(BaseModel):
    name: str = Field(min_length=1)
    age: int = Field(ge=13, le=120)
    plan: str = "free"

try:
    print(Signup.model_validate_json('{"name": "Asha", "age": "16"}'))
except ValidationError as e:
    print(e)`,
        note: "`pip install pydantic` (v2). pydantic generates validation from the type hints; note it *coerces* \"16\" to 16 by default — use strict mode (`model_config = {\"strict\": True}`) if you want to reject strings. Not run here: third-party package.",
      }],
    },
  ],
  exam: [
    {
      id: "e1", kind: "mcq", difficulty: 3,
      prompt: "Which signature correctly says 'returns a list of the same type as the input items'?",
      options: [
        { text: "`def dedupe(xs: list[Any]) -> list[Any]`", why: "Loses the connection between input and output." },
        { text: "`def dedupe(xs: list[T]) -> list[T]` with `T = TypeVar(\"T\")`", why: "Correct." },
        { text: "`def dedupe(xs: list) -> list[object]`", why: "Too vague." },
      ],
      answer: 1,
      hint: "Type variables connect types.",
      explain: "A TypeVar ties the output element type to the input element type.",
    },
    {
      id: "e2", kind: "predict", difficulty: 3,
      code: r`from typing import TypedDict
class P(TypedDict):
    x: int
p: P = {"x": "not an int"}
print(p["x"].upper(), type(p).__name__)`,
      answer: "NOT AN INT dict\n",
      hint: "TypedDict is static only.",
      explain: "At run time a TypedDict is just a dict and nothing is validated — a checker would flag the assignment.",
    },
    {
      id: "e3", kind: "fill", difficulty: 3,
      prompt: "Type a parameter that accepts one of three exact strings.",
      code: r`from typing import ___
def move(direction: Literal["up", "down", "stay"]) -> int:
    return {"up": 1, "down": -1, "stay": 0}[direction]
print(move("down"))`,
      blanks: [["Literal"]],
      output: "-1\n",
      hint: "Import the type for exact values.",
      explain: "`Literal[...]` restricts a parameter to specific values (checked statically).",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: typed event pipeline", difficulty: 4,
    prompt: `Build a typed pipeline for analytics events (JSON lines until \`end\`):

1. \`class Event(TypedDict)\`: \`user: str\`, \`kind: Literal["view", "click", "buy"]\`, \`amount: NotRequired[float]\`.
2. \`parse(line: str) -> Event\` validating at run time (\`ValueError\` with \`bad kind\`, \`missing user\`, \`buy needs amount\`).
3. A generic \`Counter(Generic[T])\` with \`add(item: T)\` and \`top(n) -> list[tuple[T, int]]\` (ties by first seen).

Print \`invalid: MESSAGE\` for bad lines, then \`events N\`, \`revenue R\` (2 decimals) and the top 2 users by event count as \`user count\`.`,
    starter: r`import json
from typing import Generic, Literal, NotRequired, TypedDict, TypeVar
`,
    tests: [
      { label: "Events", input: "{\"user\": \"asha\", \"kind\": \"view\"}\n{\"user\": \"asha\", \"kind\": \"buy\", \"amount\": 499}\n{\"user\": \"ravi\", \"kind\": \"click\"}\n{\"user\": \"zoe\", \"kind\": \"like\"}\n{\"kind\": \"view\"}\n{\"user\": \"ravi\", \"kind\": \"buy\"}\nend\n", output: "invalid: bad kind\ninvalid: missing user\ninvalid: buy needs amount\nevents 3\nrevenue 499.00\nasha 2\nravi 1" },
    ],
    hints: [
      "parse: json.loads, check user (non-empty str), kind in the allowed set, amount for buys.",
      "Counter keeps a dict; top sorts by count descending and relies on dict order for ties.",
      "`sorted(self.counts.items(), key=lambda kv: -kv[1])[:n]` is stable.",
      "Sum amounts of buy events for revenue.",
    ],
    solution: r`import json
from typing import Generic, Literal, NotRequired, TypedDict, TypeVar

T = TypeVar("T")
KINDS = ("view", "click", "buy")

class Event(TypedDict):
    user: str
    kind: Literal["view", "click", "buy"]
    amount: NotRequired[float]

def parse(line: str) -> Event:
    data = json.loads(line)
    user = data.get("user")
    if not isinstance(user, str) or not user:
        raise ValueError("missing user")
    kind = data.get("kind")
    if kind not in KINDS:
        raise ValueError("bad kind")
    if kind == "buy" and not isinstance(data.get("amount"), (int, float)):
        raise ValueError("buy needs amount")
    return data

class Counter(Generic[T]):
    def __init__(self) -> None:
        self.counts: dict[T, int] = {}
    def add(self, item: T) -> None:
        self.counts[item] = self.counts.get(item, 0) + 1
    def top(self, n: int) -> list[tuple[T, int]]:
        return sorted(self.counts.items(), key=lambda kv: -kv[1])[:n]

events: list[Event] = []
users: Counter[str] = Counter()
while (line := input()) != "end":
    try:
        e = parse(line)
    except ValueError as err:
        print("invalid:", err)
        continue
    events.append(e)
    users.add(e["user"])
print("events", len(events))
print(f"revenue {sum(e.get('amount', 0) for e in events if e['kind'] == 'buy'):.2f}")
for user, n in users.top(2):
    print(user, n)`,
    notes: "Static types (TypedDict, Literal, Generic) describe the data for tools; parse() enforces it at run time where the JSON arrives. Note the check order matters for messages — the test expects 'bad kind' for a valid user with a wrong kind.",
  },
};
