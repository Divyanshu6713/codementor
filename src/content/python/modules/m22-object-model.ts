import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 22 — Python's object model. */
export const M22: PyModuleDef = {
  id: "py-object-model",
  number: 22,
  level: 4,
  title: "Python's Object Model",
  summary: "Everything is an object; references and identity; mutability and aliasing; equality vs identity; hashing; attribute lookup; name resolution and the LEGB rule; descriptors and properties; method resolution order; metaclasses and how classes are created.",
  track: "core",
  optionalNote: "Advanced but valuable for every Python developer; essential for library and framework authors.",
  prereqs: ["py-stdlib"],
  lessons: [
    {
      id: "py-objects-references",
      title: "Objects, references, identity and hashing",
      minutes: 17,
      difficulty: 4,
      objectives: [
        "Describe every value as an object with identity, type and value",
        "Predict aliasing effects of references, including in function calls",
        "Explain the hash/equality contract and why mutable objects aren't hashable",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "`def add(lst): lst.append(1)` — after `x = []; add(x)`, what is x?",
        options: [
          { text: "`[]`", why: "The function receives a reference to the same list." },
          { text: "`[1]`", why: "Correct — the list object is shared, so the change is visible." },
          { text: "An error", why: "Valid code." },
        ],
        answer: 1,
        hint: "Python passes references to objects.",
        explain: "Arguments are passed by object reference ('call by sharing'): mutating the object inside the function affects the caller's object.",
      },
      why: "Understanding what a name really is — a reference to an object — explains every surprising aliasing bug, why default arguments behave strangely, why some objects can be dict keys and others can't, and how to design classes that behave correctly in sets and dicts.",
      concept: [
        {
          title: "Identity, type, value",
          body: `Every object has an **identity** (\`id(x)\`, constant for its lifetime), a **type** (\`type(x)\`) and a **value**. Names are references; assignment binds a name to an object; it never copies.

Functions receive references too ("call by sharing"): **mutating** a passed object is visible to the caller, **rebinding** the parameter name is not:

\`\`\`python
def f(lst):
    lst.append(1)    # caller sees this
    lst = [9]        # rebinds the local name only
\`\`\``,
        },
        {
          title: "Equality, identity and interning",
          body: `\`==\` calls \`__eq__\` (value); \`is\` compares identities. CPython caches small ints (-5..256) and some strings, so \`a is b\` may be True by accident for those — never rely on it. \`None\`, \`True\`, \`False\` are singletons: compare with \`is\`.`,
        },
        {
          title: "Hashing",
          body: `Dicts and sets locate items by \`hash(x)\`. The contract: **if a == b then hash(a) == hash(b)**, and an object's hash must never change while it's in a dict/set. That's why mutable built-ins (list, dict, set) are unhashable.

For your classes: by default, instances hash by identity. Defining \`__eq__\` sets \`__hash__ = None\` (unhashable) unless you also define \`__hash__\` based on the **same immutable fields** — or use \`@dataclass(frozen=True)\`.`,
        },
      ],
      example: {
        title: "References in action",
        code: r`def modify(items, label):
    items.append("new")
    label = label + "!"
    return label

data, name = ["a"], "box"
result = modify(data, name)
print(data, name, result)
x = [1, 2]
y = x
z = list(x)
print(x is y, x is z, x == z)
class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __eq__(self, other):
        return (self.x, self.y) == (other.x, other.y)
    def __hash__(self):
        return hash((self.x, self.y))
pts = {Point(1, 2), Point(1, 2), Point(3, 4)}
print(len(pts), Point(1, 2) in pts, hash((1, 2)) == hash(Point(1, 2)))
try:
    {[1, 2]: "list key"}
except TypeError as e:
    print(type(e).__name__, "unhashable" in str(e))`,
        output: "['a', 'new'] box box!\nTrue False True\n2 True True\nTypeError True\n",
        lines: [
          [2, "Mutating the shared list: the caller's `data` changes."],
          [3, "Rebinding the local `label` to a new string: the caller's `name` is untouched."],
          [10, "y is another reference to the same list; z is a new list with equal contents."],
          [16, "Equality by value…"],
          [18, "…and a hash built from the same fields, so equal points collapse in a set."],
          [23, "Lists are mutable, so they can't be hashed: a TypeError whose message says \"unhashable\" (the exact wording changed in Python 3.14)."],
        ],
      },
      mistakes: [
        { title: "'Python passes by value/reference'", body: "Neither exactly: it passes references to objects. Mutation is shared; rebinding isn't." },
        { title: "Mutable objects as dict keys via custom __hash__", body: "If the fields used in __hash__ change after insertion, the object is 'lost' in the dict. Hash only immutable data." },
        { title: "`is` for numbers and strings", body: "Small-int and string caching makes `is` unpredictable. Use `==`." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 4,
          code: r`def f(a, b):
    a += [3]
    b += (3,)
    return a, b
lst, tup = [1], (1,)
f(lst, tup)
print(lst, tup)`,
          answer: "[1, 3] (1,)\n",
          hint: "`+=` mutates lists in place but creates new tuples.",
          explain: "For a list, += extends the same object (the caller sees it). For an immutable tuple, += builds a new tuple bound only to the local b.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Make equal Money objects hashable consistently with __eq__.",
          code: r`class Money:
    def __init__(self, paise):
        self.paise = paise
    def __eq__(self, o):
        return self.paise == o.paise
    def __hash__(self):
        return ___(self.paise)
print(len({Money(5), Money(5)}))`,
          blanks: [["hash"]],
          output: "1\n",
          hint: "Hash the same field used in __eq__.",
          explain: "`hash(self.paise)` keeps the contract: equal objects have equal hashes.",
        },
        {
          id: "b1", kind: "bug", difficulty: 4,
          prompt: "Putting Tags in a set crashes with `unhashable type`. Which line removed hashability?",
          code: r`class Tag:
    def __init__(self, name):
        self.name = name
    def __eq__(self, other):
        return self.name == other.name
print(len({Tag("py"), Tag("py")}))`,
          line: 4,
          fix: r`class Tag:
    def __init__(self, name):
        self.name = name
    def __eq__(self, other):
        return self.name == other.name
    def __hash__(self):
        return hash(self.name)
print(len({Tag("py"), Tag("py")}))`,
          output: "1\n",
          hint: "What happens to __hash__ when you define __eq__?",
          explain: "Defining __eq__ without __hash__ sets __hash__ to None. Add a __hash__ consistent with __eq__.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "Which statement about `id(x)` is true?",
          options: [
            { text: "It changes when x's value changes", why: "Identity is fixed for the object's lifetime, even if a mutable object changes." },
            { text: "It's unique among objects that exist at the same time", why: "Correct." },
            { text: "It's the same for equal objects", why: "Equal objects can be different objects." },
          ],
          answer: 1,
          hint: "Identity vs value.",
          explain: "id is unique for simultaneously alive objects (CPython: the memory address); it may be reused after an object is freed.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "debug", title: "Stop the shared-state bug", difficulty: 3,
          prompt: `\`normalise(scores)\` should return a NEW list scaled to 0–100 without changing the caller's list. Currently it changes the input. Fix it so the program prints the original list unchanged and the new list:

\`\`\`
[20, 40, 50]
[40.0, 80.0, 100.0]
\`\`\``,
          starter: r`def normalise(scores):
    top = max(scores)
    for i in range(len(scores)):
        scores[i] = round(scores[i] / top * 100, 1)
    return scores

raw = [int(x) for x in input().split()]
new = normalise(raw)
print(raw)
print(new)`,
          tests: [
            { label: "Three scores", input: "20 40 50\n", output: "[20, 40, 50]\n[40.0, 80.0, 100.0]" },
            { label: "Equal scores", input: "7 7\n", output: "[7, 7]\n[100.0, 100.0]", hidden: true },
          ],
          hints: [
            "Which object does the loop modify?",
            "`scores` is the caller's list — the same object as raw.",
            "Build and return a new list instead of assigning into scores.",
            "`return [round(s / top * 100, 1) for s in scores]`.",
          ],
          solution: r`def normalise(scores):
    top = max(scores)
    return [round(s / top * 100, 1) for s in scores]

raw = [int(x) for x in input().split()]
new = normalise(raw)
print(raw)
print(new)`,
          notes: "Returning a new object instead of mutating the argument removes a whole class of aliasing bugs — and makes the function pure.",
        },
        {
          id: "stretch", kind: "task", title: "Value objects in sets and dicts", difficulty: 4,
          prompt: `Write \`Coord(lat, lon)\` storing values rounded to 3 decimals, with \`__eq__\`, \`__hash__\` (on the rounded values) and \`__repr__\` \`Coord(12.972, 77.594)\`. Read coordinates \`lat lon\` until \`end\` and print the number of **distinct** places (after rounding) and then a dict mapping each distinct place to how many times it appeared, in first-seen order.`,
          starter: r`class Coord:
    pass
`,
          tests: [
            { label: "Repeats", input: "12.97161 77.59456\n12.9716 77.5946\n28.6139 77.2090\nend\n", output: "2\n{Coord(12.972, 77.595): 2, Coord(28.614, 77.209): 1}" },
            { label: "Single", input: "0 0\nend\n", output: "1\n{Coord(0.0, 0.0): 1}", hidden: true, category: "edge" },
          ],
          hints: [
            "Round in __init__ and store the rounded values (treat them as read-only).",
            "__eq__ compares (lat, lon); __hash__ hashes the same tuple.",
            "Count with a dict: `counts[c] = counts.get(c, 0) + 1`.",
            "`len(counts)` is the number of distinct places.",
          ],
          solution: r`class Coord:
    def __init__(self, lat, lon):
        self.lat = round(lat, 3)
        self.lon = round(lon, 3)

    def __eq__(self, other):
        return isinstance(other, Coord) and (self.lat, self.lon) == (other.lat, other.lon)

    def __hash__(self):
        return hash((self.lat, self.lon))

    def __repr__(self):
        return f"Coord({self.lat}, {self.lon})"

counts = {}
while (line := input()) != "end":
    c = Coord(*map(float, line.split()))
    counts[c] = counts.get(c, 0) + 1
print(len(counts))
print(counts)`,
          notes: "Equal-and-hash-consistent value objects collapse correctly in dicts and sets. A frozen dataclass would give the same behaviour with less code.",
        },
      ],
      realWorld: "ORMs keep an 'identity map' so one database row = one object; caching layers key dicts by value objects; many production bugs trace back to shared mutable state passed between functions.",
      reteach: "Names are luggage tags tied to suitcases (objects). Passing a suitcase to a function ties another tag to the same suitcase: if the function packs something in, you'll find it there. If the function re-ties its tag to a different suitcase, yours is untouched. A hash is the suitcase's locker number — it must not change while the suitcase is in the locker room.",
      summary: [
        "Objects have identity, type and value; names and arguments are references (call by sharing).",
        "`==` is value equality, `is` is identity (only for None/True/False and deliberate identity checks).",
        "Hash contract: a == b ⇒ hash(a) == hash(b); hash only immutable state; __eq__ without __hash__ makes instances unhashable.",
      ],
    },

    {
      id: "py-attribute-lookup",
      title: "Attribute lookup, descriptors and the MRO",
      minutes: 18,
      difficulty: 4,
      objectives: [
        "Trace how `obj.attr` is resolved (instance, class, parents)",
        "Write a descriptor and relate it to `property`",
        "Read a class's MRO and use `super()` in cooperative multiple inheritance",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "An instance attribute and a class attribute have the same name. Which does `obj.name` return?",
        options: [
          { text: "The class attribute", why: "Only if there's no instance attribute (or the class attribute is a data descriptor)." },
          { text: "The instance attribute (usually)", why: "Correct — the instance __dict__ is checked before the class, except for data descriptors like properties." },
          { text: "An error: ambiguous name", why: "No ambiguity error." },
        ],
        answer: 1,
        hint: "Instance first… with one exception.",
        explain: "Lookup checks data descriptors on the class, then the instance __dict__, then the class (and its MRO).",
      },
      why: "Properties, methods, `classmethod`, `staticmethod`, ORM fields and dataclass fields all work through the same attribute-lookup machinery. Understanding it lets you read framework code and write reusable validation.",
      concept: [
        {
          title: "How obj.attr is found",
          body: `Simplified order for \`obj.attr\`:

1. A **data descriptor** (defines \`__set__\`/\`__delete__\`, e.g. \`property\`) found on the class/MRO wins.
2. Otherwise \`obj.__dict__["attr"]\` (instance attribute).
3. Otherwise a non-data descriptor or plain attribute from the class/MRO (methods are non-data descriptors).
4. Otherwise \`__getattr__\` if defined, else AttributeError.

Name lookup inside functions follows **LEGB** (Module 12); attribute lookup follows the **MRO**.`,
        },
        {
          title: "Descriptors",
          body: `A descriptor is an object with \`__get__\` (and optionally \`__set__\`) stored as a **class** attribute:

\`\`\`python
class Positive:
    def __set_name__(self, owner, name):
        self.name = "_" + name
    def __get__(self, obj, objtype=None):
        return getattr(obj, self.name)
    def __set__(self, obj, value):
        if value <= 0:
            raise ValueError("must be positive")
        setattr(obj, self.name, value)

class Product:
    price = Positive()
    qty = Positive()
\`\`\`

\`property\` is a ready-made descriptor; this lets you reuse validation across many attributes.`,
        },
        {
          title: "MRO and cooperative super()",
          body: `With multiple inheritance, Python linearises the class graph (C3 algorithm) into \`Class.__mro__\`. \`super()\` means "the next class **in the MRO of the actual object**", not "my parent" — so every class in a diamond can call \`super()\` and each method runs exactly once.`,
        },
      ],
      example: {
        title: "A reusable validated field",
        code: r`class Bounded:
    def __init__(self, low, high):
        self.low, self.high = low, high
    def __set_name__(self, owner, name):
        self.private = "_" + name
        self.public = name
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return getattr(obj, self.private)
    def __set__(self, obj, value):
        if not self.low <= value <= self.high:
            raise ValueError(f"{self.public} must be {self.low}-{self.high}, got {value}")
        setattr(obj, self.private, value)

class Student:
    age = Bounded(5, 120)
    marks = Bounded(0, 100)
    def __init__(self, age, marks):
        self.age, self.marks = age, marks

s = Student(16, 91)
print(s.age, s.marks, sorted(k for k in vars(s)))
try:
    s.marks = 120
except ValueError as e:
    print(e)
class A:
    def hi(self): return "A"
class B(A):
    def hi(self): return "B>" + super().hi()
class C(A):
    def hi(self): return "C>" + super().hi()
class D(B, C):
    def hi(self): return "D>" + super().hi()
print(D().hi(), [k.__name__ for k in D.__mro__])`,
        output: "16 91 ['_age', '_marks']\nmarks must be 0-100, got 120\nD>B>C>A ['D', 'B', 'C', 'A', 'object']\n",
        lines: [
          [4, "__set_name__ tells the descriptor which attribute name it was assigned to."],
          [8, "Accessed on the class itself (obj is None) → return the descriptor."],
          [11, "Every assignment to the field goes through validation."],
          [16, "The same descriptor class guards two different fields."],
          [22, "Values live in _age/_marks on the instance."],
          [34, "Cooperative super(): B's super() goes to C (next in D's MRO), not straight to A."],
        ],
      },
      mistakes: [
        { title: "Storing descriptor data on the descriptor", body: "`self.value = x` inside __set__ shares one value across ALL instances. Store per-instance data on obj." },
        { title: "Thinking super() means 'parent'", body: "It means 'next in the MRO of this object' — crucial in multiple inheritance." },
        { title: "Overusing __getattr__", body: "Dynamic attributes confuse readers and tools. Prefer explicit properties." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 4,
          code: r`class K:
    x = "class"
    @property
    def y(self):
        return "property"
k = K()
k.__dict__["x"] = "instance"
k.__dict__["y"] = "instance"
print(k.x, k.y)`,
          answer: "instance property\n",
          hint: "property is a data descriptor.",
          explain: "x: the instance dict wins over a plain class attribute. y: a data descriptor (property) on the class wins over the instance dict.",
        },
        {
          id: "f1", kind: "fill", difficulty: 4,
          prompt: "Let the descriptor learn its attribute name.",
          code: r`class Named:
    def ___(self, owner, name):
        self.name = name
    def __get__(self, obj, objtype=None):
        return f"field {self.name}"
class M:
    title = Named()
print(M().title)`,
          blanks: [["__set_name__"]],
          output: "field title\n",
          hint: "Called automatically when the class is created.",
          explain: "`__set_name__(self, owner, name)` receives the attribute name.",
        },
        {
          id: "b1", kind: "bug", difficulty: 4,
          prompt: "Setting `b.size` changes `a.size` too. Which line stores the value in the wrong place?",
          code: r`class Size:
    def __get__(self, obj, objtype=None):
        return self.value
    def __set__(self, obj, value):
        self.value = value
class Box:
    size = Size()
a, b = Box(), Box()
a.size = 1
b.size = 2
print(a.size, b.size)`,
          line: 5,
          fix: r`class Size:
    def __get__(self, obj, objtype=None):
        return obj._size
    def __set__(self, obj, value):
        obj._size = value
class Box:
    size = Size()
a, b = Box(), Box()
a.size = 1
b.size = 2
print(a.size, b.size)`,
          output: "1 2\n",
          hint: "How many Size objects exist?",
          explain: "There is one descriptor per class, shared by all instances. Store values on the instance (obj), not on the descriptor.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 4,
          prompt: "Why are methods 'non-data descriptors'?",
          options: [
            { text: "Functions have __get__, which binds them to the instance (making `obj.method` a bound method)", why: "Correct." },
            { text: "Methods can't be read", why: "They can." },
            { text: "Methods are stored in the instance __dict__", why: "They live on the class." },
          ],
          answer: 0,
          hint: "How does self get passed?",
          explain: "Function objects implement __get__; accessing them through an instance returns a bound method with self filled in.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Typed field descriptor", difficulty: 4,
          prompt: `Write a descriptor \`Typed(kind)\` that only accepts values of that type (raise \`TypeError("NAME must be KIND")\` with the attribute and type names). Use it in \`Person\` for \`name: str\` and \`age: int\`. Test the given assignments.`,
          starter: r`class Typed:
    pass

class Person:
    name = Typed(str)
    age = Typed(int)
    def __init__(self, name, age):
        self.name = name
        self.age = age

p = Person("Asha", 16)
print(p.name, p.age)
for attr, value in [("age", "sixteen"), ("name", 42), ("age", 17)]:
    try:
        setattr(p, attr, value)
        print("set", attr, getattr(p, attr))
    except TypeError as e:
        print("TypeError:", e)`,
          tests: [{ label: "Assignments", input: "", output: "Asha 16\nTypeError: age must be int\nTypeError: name must be str\nset age 17" }],
          hints: [
            "Store `kind` in __init__ and the names in __set_name__.",
            "__set__ checks `isinstance(value, self.kind)`.",
            "Store accepted values on the instance under a private name.",
            "__get__ returns `getattr(obj, self.private)` (and self when obj is None).",
          ],
          solution: r`class Typed:
    def __init__(self, kind):
        self.kind = kind

    def __set_name__(self, owner, name):
        self.public = name
        self.private = "_" + name

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return getattr(obj, self.private)

    def __set__(self, obj, value):
        if not isinstance(value, self.kind):
            raise TypeError(f"{self.public} must be {self.kind.__name__}")
        setattr(obj, self.private, value)

class Person:
    name = Typed(str)
    age = Typed(int)
    def __init__(self, name, age):
        self.name = name
        self.age = age

p = Person("Asha", 16)
print(p.name, p.age)
for attr, value in [("age", "sixteen"), ("name", 42), ("age", 17)]:
    try:
        setattr(p, attr, value)
        print("set", attr, getattr(p, attr))
    except TypeError as e:
        print("TypeError:", e)`,
          notes: "This is a miniature of how ORMs (Django, SQLAlchemy) and validation libraries define fields.",
        },
        {
          id: "stretch", kind: "task", title: "Cooperative initialisation", difficulty: 4,
          prompt: `Create mixins \`Timestamped\` (sets \`created = "2026-10-09"\`) and \`Tagged\` (sets \`tags = []\`), and a base \`Record(title)\`. Make \`Note(Timestamped, Tagged, Record)\` initialise all three using **cooperative** \`super().__init__(**kwargs)\`. Print the MRO names and the attributes of \`Note(title="Todo")\`.`,
          starter: r`class Record:
    def __init__(self, title, **kwargs):
        super().__init__(**kwargs)
        self.title = title
`,
          tests: [{ label: "MRO and attributes", input: "", output: "['Note', 'Timestamped', 'Tagged', 'Record', 'object']\nTodo 2026-10-09 []" }],
          hints: [
            "Every class's __init__ accepts **kwargs and calls super().__init__(**kwargs).",
            "Mixins set their attribute and pass the rest on.",
            "Note doesn't need its own __init__.",
            "Print `[c.__name__ for c in Note.__mro__]` and the three attributes.",
          ],
          solution: r`class Record:
    def __init__(self, title, **kwargs):
        super().__init__(**kwargs)
        self.title = title

class Timestamped:
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.created = "2026-10-09"

class Tagged:
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.tags = []

class Note(Timestamped, Tagged, Record):
    pass

print([c.__name__ for c in Note.__mro__])
n = Note(title="Todo")
print(n.title, n.created, n.tags)`,
          notes: "Each __init__ calls the NEXT one in the MRO; keyword arguments flow through until Record consumes `title`. This is how mixin-heavy frameworks (Django class-based views) initialise.",
        },
      ],
      realWorld: "Django model fields and SQLAlchemy columns are descriptors; `@property`, `@classmethod` and `@staticmethod` are descriptors; Django's class-based views rely on the MRO and cooperative super() to combine mixins.",
      reteach: "Looking up `obj.attr` is like asking for a document: first check whether the building's rules desk (a data descriptor such as a property) handles it, then your own desk drawer (the instance dict), then the department's shared cabinets in order (the class and its MRO). A descriptor is a smart cabinet that runs code whenever someone reads or writes that document.",
      summary: [
        "Lookup: data descriptors → instance __dict__ → class/MRO attributes (incl. methods) → __getattr__.",
        "Descriptors (__get__/__set__/__set_name__) power properties, methods and reusable validated fields; store per-instance data on obj.",
        "super() follows the MRO of the actual object; cooperative classes pass **kwargs along.",
      ],
    },

    {
      id: "py-metaclasses",
      title: "How classes are created: type and metaclasses",
      minutes: 15,
      difficulty: 5,
      objectives: [
        "Explain that classes are objects created by `type`",
        "Create a class dynamically with `type(name, bases, namespace)`",
        "Use `__init_subclass__` (preferred) and know when a metaclass is justified",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 4,
        prompt: "What is `type(int)`?",
        options: [
          { text: "`int`", why: "int is the class; we're asking for the class's class." },
          { text: "`type`", why: "Correct — classes are instances of type (their metaclass)." },
          { text: "`object`", why: "object is int's base class, not its type." },
        ],
        answer: 1,
        hint: "Classes are objects too.",
        explain: "Every class is an object; the class that creates classes is `type`.",
      },
      why: "Most developers never write a metaclass — but frameworks use class creation hooks to register plugins, build ORM models and validate class definitions. Knowing how a `class` statement works demystifies that 'magic' and points you to simpler tools like `__init_subclass__`.",
      concept: [
        {
          title: "The class statement, step by step",
          body: `\`class Dog(Animal): body\`:

1. Python runs the body in a fresh namespace (a dict).
2. It calls the **metaclass** (normally \`type\`): \`Dog = type("Dog", (Animal,), namespace)\`.
3. The result is a class object, bound to the name Dog.

So you can create classes at run time with \`type\` directly — useful for generated code, tests and plugins.`,
        },
        {
          title: "__init_subclass__: the simple hook",
          body: `\`\`\`python
class Plugin:
    registry = {}
    def __init_subclass__(cls, /, name=None, **kwargs):
        super().__init_subclass__(**kwargs)
        Plugin.registry[name or cls.__name__.lower()] = cls

class Csv(Plugin, name="csv"): ...
Plugin.registry   # {'csv': <class 'Csv'>}
\`\`\`

It runs whenever a subclass is created — enough for registration and validation in most cases.`,
        },
        {
          title: "Metaclasses — rarely",
          body: `A metaclass is a subclass of \`type\` whose \`__new__\`/\`__init__\` customise class creation:

\`\`\`python
class Upper(type):
    def __new__(mcls, name, bases, ns):
        ns = {k.upper() if not k.startswith("__") else k: v for k, v in ns.items()}
        return super().__new__(mcls, name, bases, ns)
\`\`\`

Use one only when \`__init_subclass__\`, class decorators or descriptors can't do the job (e.g. controlling the namespace itself, as enum and some ORMs do). *"If you wonder whether you need metaclasses, you don't."* — Tim Peters.`,
        },
      ],
      example: {
        title: "Classes made by code",
        code: r`print(type(42), type(int), type(type))
def speak(self):
    return f"{self.name} says {self.sound}"
Cow = type("Cow", (), {"sound": "moo", "speak": speak, "__init__": lambda self, name: setattr(self, "name", name)})
print(Cow("Gauri").speak(), Cow.__name__)

class Command:
    registry = {}
    def __init_subclass__(cls, /, verb, **kwargs):
        super().__init_subclass__(**kwargs)
        Command.registry[verb] = cls

class Greet(Command, verb="hello"):
    def run(self):
        return "Hi there!"
class Leave(Command, verb="bye"):
    def run(self):
        return "Goodbye!"
print(sorted(Command.registry), Command.registry["bye"]().run())

class Loud(type):
    def __new__(mcls, name, bases, ns):
        ns["volume"] = "LOUD"
        return super().__new__(mcls, name, bases, ns)
class Speaker(metaclass=Loud):
    pass
print(Speaker.volume, type(Speaker).__name__)`,
        output: "<class 'int'> <class 'type'> <class 'type'>\nGauri says moo Cow\n['bye', 'hello'] Goodbye!\nLOUD Loud\n",
        lines: [
          [1, "Values are instances of classes; classes are instances of type; type is its own type."],
          [4, "type(name, bases, namespace) builds a class at run time — what `class` does for you."],
          [10, "__init_subclass__ runs for each new subclass, with keyword arguments from the class line."],
          [14, "`verb=\"hello\"` in the class statement is passed to __init_subclass__."],
          [22, "A metaclass customises class creation itself…"],
          [26, "…so every class it creates gets a volume attribute; the class's type is the metaclass."],
        ],
      },
      mistakes: [
        { title: "Reaching for metaclasses first", body: "Class decorators, __init_subclass__ and descriptors solve almost every case more simply." },
        { title: "Metaclass conflicts", body: "Combining base classes with different metaclasses raises 'metaclass conflict'. Another reason to avoid them." },
        { title: "Forgetting super() in __init_subclass__", body: "Not calling super().__init_subclass__(**kwargs) breaks other classes in the hierarchy that also use the hook." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 4,
          code: r`Point = type("Point", (), {"x": 1, "y": 2})
p = Point()
print(Point.__name__, p.x + p.y, isinstance(Point, type))`,
          answer: "Point 3 True\n",
          hint: "type with three arguments creates a class.",
          explain: "The namespace becomes class attributes; the new class is an instance of type.",
        },
        {
          id: "f1", kind: "fill", difficulty: 4,
          prompt: "Register every subclass automatically.",
          code: r`class Base:
    subclasses = []
    def ___(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        Base.subclasses.append(cls.__name__)
class A(Base): pass
class B(Base): pass
print(Base.subclasses)`,
          blanks: [["__init_subclass__"]],
          output: "['A', 'B']\n",
          hint: "The hook that runs when a subclass is defined.",
          explain: "`__init_subclass__` runs for each subclass definition (it's implicitly a classmethod).",
        },
        {
          id: "b1", kind: "bug", difficulty: 4,
          prompt: "Defining Child raises TypeError about an unexpected keyword. Which line is wrong?",
          code: r`class Base:
    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
class Child(Base, category="tools"):
    pass
print("defined", Child.__name__)`,
          line: 2,
          fix: r`class Base:
    def __init_subclass__(cls, category=None, **kwargs):
        super().__init_subclass__(**kwargs)
        cls.category = category
class Child(Base, category="tools"):
    pass
print("defined", Child.__name__)`,
          output: "defined Child\n",
          hint: "Who consumes the `category` keyword?",
          explain: "Base passes category on to object.__init_subclass__, which accepts no keywords. Base must take the parameter itself.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 4,
          prompt: "You want every plugin class to be registered by name when it's defined. Simplest tool?",
          options: [
            { text: "A metaclass", why: "Works, but heavier than needed." },
            { text: "`__init_subclass__` on the base class", why: "Correct." },
            { text: "A global list maintained by hand", why: "Easy to forget." },
          ],
          answer: 1,
          hint: "Prefer the simplest hook.",
          explain: "__init_subclass__ was added (3.6) precisely for registration and validation without metaclasses.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Shape registry", difficulty: 4,
          prompt: `Write a base class \`Shape\` with \`__init_subclass__(cls, key, **kwargs)\` that registers subclasses in \`Shape.registry[key]\`. Define \`Square(Shape, key="sq")\` and \`Circle(Shape, key="ci")\` with \`__init__(self, size)\` and \`area()\` (square: size², circle: π·size², round 2). For lines \`key size\` until \`end\`, create the right class from the registry and print its class name and area (or \`unknown shape\`).`,
          starter: r`import math

class Shape:
    registry = {}
`,
          tests: [
            { label: "Mixed", input: "sq 3\nci 1\ntri 2\nend\n", output: "Square 9\nCircle 3.14\nunknown shape" },
            { label: "Only circles", input: "ci 2\nend\n", output: "Circle 12.57", hidden: true },
          ],
          hints: [
            "`def __init_subclass__(cls, key, **kwargs): super().__init_subclass__(**kwargs); Shape.registry[key] = cls`.",
            "Pass the key in the class line: `class Square(Shape, key=\"sq\"):`.",
            "Look up with `Shape.registry.get(key)`.",
            "Print `type(shape).__name__` and `shape.area()`.",
          ],
          solution: r`import math

class Shape:
    registry = {}

    def __init_subclass__(cls, key, **kwargs):
        super().__init_subclass__(**kwargs)
        Shape.registry[key] = cls

    def __init__(self, size):
        self.size = size

class Square(Shape, key="sq"):
    def area(self):
        return self.size ** 2

class Circle(Shape, key="ci"):
    def area(self):
        return round(math.pi * self.size ** 2, 2)

while (line := input()) != "end":
    key, size = line.split()
    cls = Shape.registry.get(key)
    if cls is None:
        print("unknown shape")
        continue
    shape = cls(int(size))
    print(type(shape).__name__, shape.area())`,
          notes: "Defining a class is enough to register it — no central list to edit. Plugin systems, serializers and command routers use exactly this.",
        },
        {
          id: "stretch", kind: "task", title: "Generate classes from a schema", difficulty: 5,
          prompt: `Read a schema line \`ClassName field1 field2 …\` and then data lines (values matching the fields) until \`end\`. Use \`type()\` to build the class at run time with an \`__init__\` that sets the fields (from positional args) and a \`__repr__\` like \`Book(title='Dune', year='1965')\`. Print each object.`,
          starter: r`schema = input().split()
name, fields = schema[0], schema[1:]
`,
          tests: [
            { label: "Books", input: "Book title year\nDune 1965\nEmma 1815\nend\n", output: "Book(title='Dune', year='1965')\nBook(title='Emma', year='1815')" },
            { label: "One field", input: "Tag label\npy\nend\n", output: "Tag(label='py')", hidden: true },
          ],
          hints: [
            "Write ordinary functions `init(self, *values)` and `rep(self)` first.",
            "Inside init: `for f, v in zip(fields, values): setattr(self, f, v)`.",
            "rep builds `f\"{name}(\" + \", \".join(f\"{f}={getattr(self, f)!r}\" for f in fields) + \")\"`.",
            "`Model = type(name, (), {\"__init__\": init, \"__repr__\": rep})`.",
          ],
          solution: r`schema = input().split()
name, fields = schema[0], schema[1:]

def init(self, *values):
    for f, v in zip(fields, values):
        setattr(self, f, v)

def rep(self):
    inner = ", ".join(f"{f}={getattr(self, f)!r}" for f in fields)
    return f"{name}({inner})"

Model = type(name, (), {"__init__": init, "__repr__": rep})
while (line := input()) != "end":
    print(Model(*line.split()))`,
          notes: "This is what `collections.namedtuple` and `dataclasses.make_dataclass` do internally: build a class from data at run time.",
        },
      ],
      realWorld: "Django's ModelBase metaclass turns field declarations into database columns; Enum uses a metaclass; pydantic and SQLAlchemy build classes from declarations; plugin frameworks register subclasses via __init_subclass__.",
      reteach: "A class is a cookie cutter — and cookie cutters are themselves made by a machine called `type`. Normally the `class` statement runs that machine for you. A metaclass is a customised cutter-making machine; `__init_subclass__` is a simpler inspection step that checks or registers every new cutter as it comes off the line.",
      summary: [
        "Classes are objects created by type(name, bases, namespace); `class` statements call the metaclass.",
        "__init_subclass__ handles registration/validation of subclasses — prefer it.",
        "Metaclasses (subclasses of type) are a last resort for customising class creation.",
      ],
    },
  ],
  exam: [
    {
      id: "e1", kind: "predict", difficulty: 4,
      code: r`class Counter:
    total = 0
    def __init__(self):
        self.total += 1
a, b = Counter(), Counter()
print(a.total, b.total, Counter.total)`,
      answer: "1 1 0\n",
      hint: "`self.total += 1` reads the class attribute, then creates an INSTANCE attribute.",
      explain: "Each instance reads Counter.total (0), adds 1 and stores it on itself. The class attribute stays 0.",
    },
    {
      id: "e2", kind: "mcq", difficulty: 4,
      prompt: "Which pair of objects can both be keys in the same dict?",
      options: [
        { text: "`(1, [2])` and `(1, 2)`", why: "The first contains a list, so it's unhashable." },
        { text: "`frozenset({1, 2})` and `(1, 2)`", why: "Correct — both are hashable." },
        { text: "`{1: 2}` and `\"x\"`", why: "A dict is unhashable." },
      ],
      answer: 1,
      hint: "Only fully immutable containers are hashable.",
      explain: "frozensets and tuples of immutable values are hashable.",
    },
    {
      id: "e3", kind: "fill", difficulty: 4,
      prompt: "Inspect the method resolution order.",
      code: r`class A: pass
class B(A): pass
print([c.__name__ for c in B.___])`,
      blanks: [["__mro__", "mro()"]],
      output: "['B', 'A', 'object']\n",
      hint: "A special attribute holding the lookup order.",
      explain: "`B.__mro__` (or `B.mro()`) lists the classes searched for attributes.",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: a tiny validated model layer", difficulty: 5,
    prompt: `Build a mini 'ORM-style' model layer:

- Descriptor \`Field(kind, required=True)\` validating type (\`TypeError: NAME must be KIND\`) and storing on the instance.
- Base \`Model\` with \`__init_subclass__\` that collects its Field names (in definition order) into \`cls.fields\` and registers the class in \`Model.registry\`; \`__init__(**data)\` that sets every field (missing required field → \`ValueError: NAME is required\`; missing optional → None); and \`__repr__\` like \`User(name='Asha', age=16)\`.

Define \`User(name: str, age: int)\` and \`Post(title: str, views: int optional)\`. For each input line \`Class key=value …\` until \`end\` (values that are all digits become ints), print the object or the error as \`TypeError: …\` / \`ValueError: …\`, then the registry's sorted class names.`,
    starter: r`class Field:
    pass

class Model:
    pass
`,
    tests: [
      { label: "Session", input: "User name=Asha age=16\nUser name=Ravi\nUser name=Zoe age=old\nPost title=Hello\nPost title=Hi views=10\nend\n", output: "User(name='Asha', age=16)\nValueError: age is required\nTypeError: age must be int\nPost(title='Hello', views=None)\nPost(title='Hi', views=10)\n['Post', 'User']" },
    ],
    hints: [
      "Field needs __set_name__ (remember the name), __get__ and __set__ (validate unless value is None and not required).",
      "In __init_subclass__: `cls.fields = [k for k, v in cls.__dict__.items() if isinstance(v, Field)]`.",
      "Model.__init__ loops over cls.fields, checks required ones, then setattr.",
      "Parse `key=value` pairs, converting digit strings with int().",
    ],
    solution: r`class Field:
    def __init__(self, kind, required=True):
        self.kind = kind
        self.required = required

    def __set_name__(self, owner, name):
        self.name = name
        self.private = "_" + name

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return getattr(obj, self.private, None)

    def __set__(self, obj, value):
        if value is not None and not isinstance(value, self.kind):
            raise TypeError(f"{self.name} must be {self.kind.__name__}")
        setattr(obj, self.private, value)

class Model:
    registry = {}

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        cls.fields = [k for k, v in cls.__dict__.items() if isinstance(v, Field)]
        Model.registry[cls.__name__] = cls

    def __init__(self, **data):
        for name in self.fields:
            field = type(self).__dict__[name]
            if name not in data and field.required:
                raise ValueError(f"{name} is required")
            setattr(self, name, data.get(name))

    def __repr__(self):
        inner = ", ".join(f"{n}={getattr(self, n)!r}" for n in self.fields)
        return f"{type(self).__name__}({inner})"

class User(Model):
    name = Field(str)
    age = Field(int)

class Post(Model):
    title = Field(str)
    views = Field(int, required=False)

while (line := input()) != "end":
    cls_name, *pairs = line.split()
    data = {}
    for pair in pairs:
        key, value = pair.split("=", 1)
        data[key] = int(value) if value.isdigit() else value
    try:
        print(Model.registry[cls_name](**data))
    except (TypeError, ValueError) as e:
        print(f"{type(e).__name__}: {e}")
print(sorted(Model.registry))`,
    notes: "Descriptors validate each field, __init_subclass__ discovers fields and registers models, and __init__/__repr__ are written once for every model — the core ideas behind Django models and pydantic, in about 40 lines.",
  },
};
