import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 17 — Object-oriented programming. */
export const M17: PyModuleDef = {
  id: "py-oop",
  number: 17,
  level: 3,
  title: "Object-Oriented Programming",
  summary: "Classes and objects; attributes and methods; __init__; instance, class and static methods; instance and class attributes; encapsulation and properties; inheritance (multilevel, multiple), overriding, super() and polymorphism; abstraction and ABCs; composition vs inheritance; dataclasses; operator overloading and dunder methods; object lifecycle and garbage collection.",
  track: "core",
  prereqs: ["py-exceptions"],
  lessons: [
    {
      id: "py-classes-objects",
      title: "Classes, objects and __init__",
      minutes: 17,
      difficulty: 2,
      objectives: [
        "Define a class with `__init__`, attributes and methods",
        "Create objects (instances) and call their methods",
        "Tell instance attributes from class attributes",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "In `class Dog:` … `def bark(self):`, what is `self`?",
        options: [
          { text: "A keyword that must be written exactly", why: "It's a convention, not a keyword — but always use it." },
          { text: "The object the method was called on", why: "Correct: in `rex.bark()`, self is rex." },
          { text: "The class Dog itself", why: "That would be a class method's `cls`." },
        ],
        answer: 1,
        hint: "Which dog is barking?",
        explain: "Python passes the instance automatically as the first argument; by convention it's named self.",
      },
      why: "Classes let you bundle data with the behaviour that belongs to it: a BankAccount knows its balance and how to deposit; a Student knows their marks and how to compute an average. Most large Python programs — and every framework — are built from classes.",
      concept: [
        {
          title: "Defining and using a class",
          body: `\`\`\`python
class Student:
    school = "Govt PU College"          # class attribute: shared by all

    def __init__(self, name, marks):    # runs when you create an object
        self.name = name                # instance attributes: one per object
        self.marks = marks

    def average(self):                  # a method: a function that belongs to the class
        return sum(self.marks) / len(self.marks)

asha = Student("Asha", [91, 84])        # create an instance
asha.average()                          # 87.5 — Python passes asha as self
\`\`\`

A **class** is a blueprint; each **object** (instance) has its own attribute values.`,
        },
        {
          title: "Instance vs class attributes",
          body: `- \`self.name = ...\` creates an attribute on **that** object.
- A name assigned in the class body is shared: \`Student.school\`, readable as \`asha.school\` too.
- Assigning \`asha.school = "X"\` creates a new instance attribute that hides the class one — for \`asha\` only.

Never put a mutable value (like a list) as a class attribute meant to be per-object — all instances would share it.`,
        },
        {
          title: "A readable representation",
          body: `Printing an object shows \`<__main__.Student object at 0x…>\` unless you define \`__repr__\` (or \`__str__\`):

\`\`\`python
def __repr__(self):
    return f"Student({self.name!r}, {self.marks})"
\`\`\`

Lesson 5 covers these special ("dunder") methods.`,
        },
      ],
      example: {
        title: "Bank accounts",
        code: r`class Account:
    bank = "CodeMentor Bank"
    count = 0

    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance
        Account.count += 1

    def deposit(self, amount):
        self.balance += amount
        return self.balance

    def __repr__(self):
        return f"Account({self.owner!r}, {self.balance})"

a = Account("Asha", 500)
b = Account("Ravi")
a.deposit(250)
b.deposit(100)
print(a, b)
print(a.bank, Account.count, a.owner == b.owner)`,
        output: "Account('Asha', 750) Account('Ravi', 100)\nCodeMentor Bank 2 False\n",
        lines: [
          [2, "Class attributes: shared by every account."],
          [5, "__init__ sets up each new object; balance defaults to 0."],
          [8, "Update the shared counter through the class name."],
          [10, "A method uses self to reach this account's data."],
          [14, "__repr__ controls how the object is printed."],
          [17, "Calling the class creates an instance and runs __init__."],
          [19, "Each object has its own balance."],
        ],
      },
      mistakes: [
        { title: "Forgetting self", body: "`def deposit(amount):` → calling `a.deposit(5)` raises `TypeError: takes 1 positional argument but 2 were given`." },
        { title: "`balance = 0` instead of `self.balance = 0`", body: "Without `self.`, it's a local variable that disappears when __init__ ends." },
        { title: "Mutable class attributes", body: "`items = []` in the class body is shared by every instance. Create lists in __init__." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 2,
          code: r`class Counter:
    def __init__(self):
        self.n = 0
    def tick(self):
        self.n += 1
        return self.n

c1, c2 = Counter(), Counter()
c1.tick(); c1.tick()
print(c1.n, c2.tick(), c1.n)`,
          answer: "2 1 2\n",
          hint: "Each object has its own n.",
          explain: "c1 ticks twice (2); c2's first tick returns 1; c1 is unchanged.",
        },
        {
          id: "f1", kind: "fill", difficulty: 1,
          prompt: "Complete the constructor.",
          code: r`class Point:
    def ___(self, x, y):
        self.x = x
        self.y = y

p = Point(3, 4)
print(p.x + p.y)`,
          blanks: [["__init__"]],
          output: "7\n",
          hint: "The special method that runs on creation.",
          explain: "`__init__` initialises each new instance.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "Each cart should have its own items, but adding to one cart adds to all. Which line?",
          code: r`class Cart:
    items = []
    def add(self, item):
        self.items.append(item)

a, b = Cart(), Cart()
a.add("milk")
print(len(a.items), len(b.items))`,
          line: 2,
          fix: r`class Cart:
    def __init__(self):
        self.items = []
    def add(self, item):
        self.items.append(item)

a, b = Cart(), Cart()
a.add("milk")
print(len(a.items), len(b.items))`,
          output: "1 0\n",
          hint: "Where is the list created, and how many lists are there?",
          explain: "A list in the class body is one shared class attribute. Create a new list per instance in __init__.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 2,
          prompt: "What's the difference between a class and an object?",
          options: [
            { text: "They're the same thing", why: "A class describes; an object is one concrete thing." },
            { text: "A class is the blueprint; objects are instances built from it, each with its own data", why: "Correct." },
            { text: "Objects contain classes", why: "It's the other way round: classes create objects." },
          ],
          answer: 1,
          hint: "Blueprint vs house.",
          explain: "One Student class can create thousands of Student objects.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "A Rectangle class", difficulty: 2,
          prompt: `Write a class \`Rectangle\` with \`__init__(self, width, height)\`, methods \`area()\`, \`perimeter()\`, \`is_square()\`, and a \`__repr__\` returning \`Rectangle(3x4)\`. The given code reads sizes and prints a summary for each.`,
          starter: r`class Rectangle:
    pass

for line in iter(input, "end"):
    w, h = map(int, line.split())
    r = Rectangle(w, h)
    print(r, r.area(), r.perimeter(), r.is_square())`,
          tests: [
            { label: "Two shapes", input: "3 4\n5 5\nend\n", output: "Rectangle(3x4) 12 14 False\nRectangle(5x5) 25 20 True" },
            { label: "Thin", input: "1 10\nend\n", output: "Rectangle(1x10) 10 22 False", hidden: true },
          ],
          hints: [
            "Store width and height on self in __init__.",
            "Each method returns a value computed from self.width and self.height.",
            "is_square compares them.",
            "`def __repr__(self): return f\"Rectangle({self.width}x{self.height})\"`.",
          ],
          solution: r`class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

    def perimeter(self):
        return 2 * (self.width + self.height)

    def is_square(self):
        return self.width == self.height

    def __repr__(self):
        return f"Rectangle({self.width}x{self.height})"

for line in iter(input, "end"):
    w, h = map(int, line.split())
    r = Rectangle(w, h)
    print(r, r.area(), r.perimeter(), r.is_square())`,
          notes: "`iter(input, \"end\")` calls input() repeatedly until it returns \"end\" — a neat sentinel loop.",
        },
        {
          id: "stretch", kind: "task", title: "Student with marks", difficulty: 3,
          prompt: `Write \`Student\` with \`__init__(self, name)\` (empty marks list), \`add(mark)\` (raise \`ValueError("mark must be 0-100")\` outside 0–100), \`average()\` (0.0 if no marks, else rounded to 1 decimal) and \`grade()\` (A ≥ 90, B ≥ 75, C ≥ 50, else F). Also a class attribute \`count\` of students created. Process commands: \`new NAME\`, \`mark NAME M\`, \`show NAME\` → \`NAME: avg A (G)\`, and at \`end\` print \`students: N\`.`,
          starter: r`class Student:
    pass

students = {}
`,
          tests: [
            { label: "Session", input: "new asha\nnew ravi\nmark asha 91\nmark asha 85\nmark ravi 150\nshow asha\nshow ravi\nend\n", output: "error: mark must be 0-100\nasha: avg 88.0 (B)\nravi: avg 0.0 (F)\nstudents: 2" },
            { label: "One student", input: "new zoe\nmark zoe 95\nshow zoe\nend\n", output: "zoe: avg 95.0 (A)\nstudents: 1", hidden: true },
          ],
          hints: [
            "`count = 0` in the class body; `Student.count += 1` in __init__.",
            "add validates then appends to self.marks.",
            "average guards the empty list.",
            "The command loop catches ValueError from add and prints `error: …`.",
          ],
          solution: r`class Student:
    count = 0

    def __init__(self, name):
        self.name = name
        self.marks = []
        Student.count += 1

    def add(self, mark):
        if not 0 <= mark <= 100:
            raise ValueError("mark must be 0-100")
        self.marks.append(mark)

    def average(self):
        if not self.marks:
            return 0.0
        return round(sum(self.marks) / len(self.marks), 1)

    def grade(self):
        avg = self.average()
        if avg >= 90:
            return "A"
        if avg >= 75:
            return "B"
        if avg >= 50:
            return "C"
        return "F"

students = {}
while (line := input()) != "end":
    parts = line.split()
    if parts[0] == "new":
        students[parts[1]] = Student(parts[1])
    elif parts[0] == "mark":
        try:
            students[parts[1]].add(int(parts[2]))
        except ValueError as e:
            print("error:", e)
    elif parts[0] == "show":
        s = students[parts[1]]
        print(f"{s.name}: avg {s.average()} ({s.grade()})")
print("students:", Student.count)`,
          notes: "Data (name, marks) and the rules about it (validation, averaging, grading) live together in one class. The command loop just coordinates objects.",
        },
      ],
      realWorld: "Django models, pandas DataFrames, game characters, GUI widgets and API clients are all classes. Designing good classes — what data they hold and what they're responsible for — is a core professional skill.",
      reteach: "A class is a cookie cutter; objects are the cookies. Every cookie has the same shape (methods), but each can have different icing (attribute values). `self` is 'this particular cookie' — so `self.icing` means *my* icing, not every cookie's.",
      summary: [
        "`class Name:` defines a blueprint; `Name(args)` creates an instance and runs `__init__`.",
        "Methods take `self`; `self.attr` belongs to one object, class-body names are shared.",
        "Create mutable per-object data in __init__; define __repr__ for readable printing.",
      ],
      cpp: {
        python: r`class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y`,
        cpp: r`struct Point {
    int x, y;
    Point(int x, int y) : x(x), y(y) {}
};`,
        note: "C++ declares fields and their types up front; Python creates attributes when you assign them (usually in __init__). Python's `self` is C++'s implicit `this`.",
      },
    },

    {
      id: "py-methods-encapsulation",
      title: "Class/static methods, encapsulation and properties",
      minutes: 17,
      difficulty: 3,
      objectives: [
        "Choose between instance, class and static methods",
        "Signal private details with `_name` and protect invariants",
        "Use `@property` for computed and validated attributes",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "What does a leading underscore in `self._balance` mean in Python?",
        options: [
          { text: "Python blocks access from outside the class", why: "Python doesn't enforce privacy." },
          { text: "A convention: 'internal detail — don't touch from outside'", why: "Correct." },
          { text: "It makes the attribute a class attribute", why: "Underscores don't change that." },
        ],
        answer: 1,
        hint: "Python trusts programmers.",
        explain: "Single underscore = 'internal' by convention. (Double underscore triggers name mangling, rarely needed.)",
      },
      why: "Good classes protect their own consistency: a bank balance should never go negative behind the class's back, a temperature can't be below absolute zero. Properties and the right kind of method keep the public interface clean while the class guards its rules.",
      concept: [
        {
          title: "Three kinds of methods",
          body: `\`\`\`python
class Temperature:
    def __init__(self, celsius):           # instance method: gets self
        self.celsius = celsius

    @classmethod
    def from_fahrenheit(cls, f):           # class method: gets the class → alternative constructor
        return cls((f - 32) * 5 / 9)

    @staticmethod
    def is_valid(c):                       # static method: no self, no cls — a helper
        return c >= -273.15
\`\`\`

\`Temperature.from_fahrenheit(212)\` builds an instance; \`Temperature.is_valid(-300)\` is just a related function.`,
        },
        {
          title: "Encapsulation by convention",
          body: `Python has no \`private\` keyword. Conventions:

- \`name\` — public, part of the interface.
- \`_name\` — internal; outside code shouldn't rely on it.
- \`__name\` — name-mangled to \`_Class__name\` to avoid clashes in subclasses (rarely needed).

Encapsulation means outside code uses **methods/properties**, so the class can enforce its rules (\`withdraw\` refuses to overdraw) and change its internals later.`,
        },
        {
          title: "Properties",
          body: `\`\`\`python
class Account:
    def __init__(self, balance):
        self._balance = balance

    @property
    def balance(self):                 # read like an attribute: acc.balance
        return self._balance

    @balance.setter
    def balance(self, value):          # acc.balance = 50 runs this
        if value < 0:
            raise ValueError("balance can't be negative")
        self._balance = value
\`\`\`

A property without a setter is **read-only**. Properties are built on **descriptors** — objects that control attribute access (Module 22).`,
        },
      ],
      example: {
        title: "A validated temperature",
        code: r`class Temperature:
    ABSOLUTE_ZERO = -273.15

    def __init__(self, celsius):
        self.celsius = celsius

    @property
    def celsius(self):
        return self._c

    @celsius.setter
    def celsius(self, value):
        if not self.is_valid(value):
            raise ValueError(f"{value} is below absolute zero")
        self._c = value

    @property
    def fahrenheit(self):
        return round(self._c * 9 / 5 + 32, 1)

    @classmethod
    def from_fahrenheit(cls, f):
        return cls(round((f - 32) * 5 / 9, 2))

    @staticmethod
    def is_valid(c):
        return c >= Temperature.ABSOLUTE_ZERO

t = Temperature(25)
print(t.celsius, t.fahrenheit)
boil = Temperature.from_fahrenheit(212)
print(boil.celsius, Temperature.is_valid(-300))
try:
    t.celsius = -500
except ValueError as e:
    print("refused:", e)`,
        output: "25 77.0\n100.0 False\nrefused: -500 is below absolute zero\n",
        lines: [
          [5, "Assigning self.celsius goes through the property setter — even in __init__."],
          [7, "The getter: t.celsius reads the internal _c."],
          [12, "The setter enforces the rule before storing."],
          [17, "A computed, read-only property."],
          [21, "A class method: an alternative constructor that calls cls(...)."],
          [25, "A static method: a helper that needs neither self nor cls."],
          [34, "Assignment to the property is validated — the object can't get into a bad state."],
        ],
      },
      mistakes: [
        { title: "Property and attribute with the same name", body: "Inside the setter, `self.celsius = value` would call the setter again forever (RecursionError). Store in `self._c`." },
        { title: "Getters/setters everywhere", body: "Python style: start with plain attributes; switch to a property later only when you need validation or computation — callers won't need to change." },
        { title: "Static method that needs the class", body: "If a helper must create instances or read class data, make it a classmethod." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`class Box:
    def __init__(self, w):
        self.w = w
    @property
    def area(self):
        return self.w ** 2
    @classmethod
    def unit(cls):
        return cls(1)

b = Box(3)
print(b.area, Box.unit().area)
b.w = 5
print(b.area)`,
          answer: "9 1\n25\n",
          hint: "A property is recomputed every time it's read.",
          explain: "area is 3² = 9; Box.unit() makes a Box(1); after changing w, area reads 25.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Make `name_upper` readable like an attribute.",
          code: r`class User:
    def __init__(self, name):
        self.name = name
    @___
    def name_upper(self):
        return self.name.upper()

print(User("asha").name_upper)`,
          blanks: [["property"]],
          output: "ASHA\n",
          hint: "The decorator for computed attributes.",
          explain: "`@property` lets `obj.name_upper` call the method without brackets.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "Setting the price crashes with RecursionError. Which line?",
          code: r`class Item:
    def __init__(self, price):
        self.price = price
    @property
    def price(self):
        return self._price
    @price.setter
    def price(self, value):
        self.price = max(0, value)

print(Item(-5).price)`,
          line: 9,
          fix: r`class Item:
    def __init__(self, price):
        self.price = price
    @property
    def price(self):
        return self._price
    @price.setter
    def price(self, value):
        self._price = max(0, value)

print(Item(-5).price)`,
          output: "0\n",
          hint: "What does `self.price = ...` call inside the setter?",
          explain: "Assigning to self.price calls the setter again, endlessly. Store the value in the internal `self._price`.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "Which method kind fits `Date.from_string(\"2026-10-09\")` that returns a new Date?",
          options: [
            { text: "instance method", why: "You don't have a Date yet." },
            { text: "class method", why: "Correct — an alternative constructor using cls(...)." },
            { text: "static method", why: "Could work, but breaks for subclasses; classmethod is the idiom." },
          ],
          answer: 1,
          hint: "Alternative constructors.",
          explain: "Class methods receive the class, so `cls(...)` also works for subclasses.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Protected bank account", difficulty: 3,
          prompt: `Write \`Account\` with a read-only property \`balance\` (no setter), and methods \`deposit(x)\` and \`withdraw(x)\` that raise \`ValueError\` for non-positive amounts (\`amount must be positive\`) or overdrafts (\`insufficient funds\`). Process commands \`dep N\`, \`wd N\` until \`end\`, printing the balance after each successful one or \`error: …\`. Finally try \`acc.balance = 10**6\` and print \`read-only\` if it raises AttributeError.`,
          starter: r`class Account:
    pass

acc = Account()
`,
          tests: [
            { label: "Session", input: "dep 500\nwd 200\nwd 1000\ndep -5\nend\n", output: "500\n300\nerror: insufficient funds\nerror: amount must be positive\nread-only" },
            { label: "Only deposits", input: "dep 1\ndep 2\nend\n", output: "1\n3\nread-only", hidden: true },
          ],
          hints: [
            "Store the balance in `self._balance`, starting at 0.",
            "A `@property` without a setter can't be assigned.",
            "Validate in both methods before changing anything.",
            "Wrap the final assignment in try/except AttributeError.",
          ],
          solution: r`class Account:
    def __init__(self):
        self._balance = 0

    @property
    def balance(self):
        return self._balance

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("amount must be positive")
        self._balance += amount

    def withdraw(self, amount):
        if amount <= 0:
            raise ValueError("amount must be positive")
        if amount > self._balance:
            raise ValueError("insufficient funds")
        self._balance -= amount

acc = Account()
while (line := input()) != "end":
    cmd, amount = line.split()
    try:
        (acc.deposit if cmd == "dep" else acc.withdraw)(int(amount))
        print(acc.balance)
    except ValueError as e:
        print("error:", e)
try:
    acc.balance = 10**6
except AttributeError:
    print("read-only")`,
          notes: "The only ways to change the balance are the two methods, which enforce the rules — that's encapsulation. (The `_balance` can still be touched from outside, but the underscore says 'don't'.)",
        },
        {
          id: "stretch", kind: "task", title: "Alternative constructors", difficulty: 3,
          prompt: `Write \`Duration\` storing total seconds, with class methods \`from_hms("1:02:03")\` and \`from_minutes(m)\`, a static method \`is_hms(text)\` (True if it looks like H:MM:SS), and a property \`hms\` returning \`H:MM:SS\`. For each input line until \`end\`: if \`is_hms\`, build with from_hms; if it's an integer, treat it as minutes; otherwise print \`invalid\`. Print \`hms (seconds)\` for valid ones.`,
          starter: r`class Duration:
    pass
`,
          tests: [
            { label: "Mixed", input: "1:02:03\n90\nabc\n0:00:59\nend\n", output: "1:02:03 (3723)\n1:30:00 (5400)\ninvalid\n0:00:59 (59)" },
            { label: "Large", input: "25:00:00\nend\n", output: "25:00:00 (90000)", hidden: true },
          ],
          hints: [
            "`__init__(self, seconds)` stores the total.",
            "from_hms splits at ':' and returns `cls(h * 3600 + m * 60 + s)`.",
            "is_hms: three parts, all digits.",
            "hms: `f\"{s // 3600}:{s % 3600 // 60:02d}:{s % 60:02d}\"`.",
          ],
          solution: r`class Duration:
    def __init__(self, seconds):
        self.seconds = seconds

    @classmethod
    def from_hms(cls, text):
        h, m, s = map(int, text.split(":"))
        return cls(h * 3600 + m * 60 + s)

    @classmethod
    def from_minutes(cls, minutes):
        return cls(minutes * 60)

    @staticmethod
    def is_hms(text):
        parts = text.split(":")
        return len(parts) == 3 and all(p.isdigit() for p in parts)

    @property
    def hms(self):
        s = self.seconds
        return f"{s // 3600}:{s % 3600 // 60:02d}:{s % 60:02d}"

while (line := input()) != "end":
    if Duration.is_hms(line):
        d = Duration.from_hms(line)
    elif line.isdigit():
        d = Duration.from_minutes(int(line))
    else:
        print("invalid")
        continue
    print(f"{d.hms} ({d.seconds})")`,
          notes: "Class methods give readable, named ways to build objects from different inputs (`datetime.fromisoformat`, `dict.fromkeys` are built-in examples).",
        },
      ],
      realWorld: "`datetime.date.today()` and `dict.fromkeys()` are class methods; Django model fields and SQLAlchemy columns are descriptors; properties guard invariants in financial and scientific code.",
      reteach: "Instance methods work on *one* object (this account). Class methods work on the *blueprint* (make me a new account from this form). Static methods are tools that just live in the same toolbox. A property is a front desk: callers ask for `balance` as if it were a plain value, but a receptionist (getter/setter) checks the rules before answering or accepting changes.",
      summary: [
        "Instance methods get self; @classmethod gets cls (alternative constructors); @staticmethod gets neither.",
        "`_name` signals internal; encapsulation = change state through methods that enforce rules.",
        "@property for computed/validated attributes; no setter → read-only; store data in `_name`.",
      ],
    },

    {
      id: "py-inheritance",
      title: "Inheritance, super() and polymorphism",
      minutes: 18,
      difficulty: 3,
      objectives: [
        "Create subclasses that reuse and extend a parent class",
        "Override methods and call the parent version with `super()`",
        "Use polymorphism: treat different objects through the same interface",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "`class Dog(Animal):` means…",
        options: [
          { text: "Dog contains an Animal attribute", why: "That's composition." },
          { text: "Dog is a kind of Animal: it inherits Animal's attributes and methods", why: "Correct." },
          { text: "Animal inherits from Dog", why: "The parent is in the brackets." },
        ],
        answer: 1,
        hint: "Is-a relationship.",
        explain: "The class in brackets is the parent (base) class; Dog inherits everything and can add or override.",
      },
      why: "Inheritance lets related classes share code: every kind of payment has an amount and a receipt, but each pays differently. Polymorphism lets the rest of the program treat them all the same way — `payment.pay()` — without caring which kind it is.",
      concept: [
        {
          title: "Subclasses and overriding",
          body: `\`\`\`python
class Animal:
    def __init__(self, name):
        self.name = name
    def speak(self):
        return "..."
    def intro(self):
        return f"{self.name} says {self.speak()}"

class Dog(Animal):
    def speak(self):                  # override
        return "Woof"

Dog("Rex").intro()                    # 'Rex says Woof' — intro is inherited
\`\`\`

\`isinstance(rex, Animal)\` is True; \`issubclass(Dog, Animal)\` is True.`,
        },
        {
          title: "super()",
          body: `\`super()\` calls the parent's version — typically to extend \`__init__\`:

\`\`\`python
class Puppy(Dog):
    def __init__(self, name, age_months):
        super().__init__(name)        # let Animal set the name
        self.age_months = age_months
    def speak(self):
        return super().speak() + "!"  # extend, don't replace
\`\`\`

**Multilevel**: Puppy → Dog → Animal. **Multiple**: \`class Duck(Flyer, Swimmer)\` — Python searches parents in the **MRO** (method resolution order): \`Duck.__mro__\`.`,
        },
        {
          title: "Polymorphism",
          body: `Code written against a shared interface works with any subclass:

\`\`\`python
for animal in [Dog("Rex"), Cat("Tom"), Cow("Gauri")]:
    print(animal.intro())    # each speaks its own way
\`\`\`

Python is also **duck-typed**: any object with a \`speak()\` method works here, even if it doesn't inherit from Animal.`,
        },
      ],
      example: {
        title: "Payments",
        code: r`class Payment:
    def __init__(self, amount):
        self.amount = amount
    def fee(self):
        return 0
    def receipt(self):
        return f"{type(self).__name__}: {self.amount} + fee {self.fee()} = {self.amount + self.fee()}"

class Card(Payment):
    def fee(self):
        return round(self.amount * 0.02, 2)

class UPI(Payment):
    pass

class InternationalCard(Card):
    def fee(self):
        return round(super().fee() + 50, 2)

for p in [UPI(500), Card(1000), InternationalCard(1000)]:
    print(p.receipt())
print(isinstance(InternationalCard(1), Payment), [c.__name__ for c in InternationalCard.__mro__])`,
        output: "UPI: 500 + fee 0 = 500\nCard: 1000 + fee 20.0 = 1020.0\nInternationalCard: 1000 + fee 70.0 = 1070.0\nTrue ['InternationalCard', 'Card', 'Payment', 'object']\n",
        lines: [
          [6, "receipt is written once in the parent and calls self.fee() — whichever fee belongs to the actual object."],
          [9, "Card overrides fee: 2%."],
          [13, "UPI inherits everything unchanged (fee 0)."],
          [16, "Multilevel: InternationalCard extends Card's fee with super()."],
          [20, "Polymorphism: the same call, three behaviours."],
          [21, "The MRO is the order Python searches for methods."],
        ],
      },
      mistakes: [
        { title: "Forgetting super().__init__", body: "If a subclass defines __init__ and doesn't call the parent's, the parent's attributes are never set (AttributeError later)." },
        { title: "Inheritance for code reuse only", body: "If B isn't really 'a kind of' A, prefer composition (next lesson)." },
        { title: "Deep hierarchies", body: "Five levels of inheritance are hard to follow. Keep hierarchies shallow." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`class A:
    def hello(self):
        return "A"
    def greet(self):
        return "I am " + self.hello()
class B(A):
    def hello(self):
        return "B+" + super().hello()

print(A().greet(), B().greet())`,
          answer: "I am A I am B+A\n",
          hint: "greet calls self.hello() — whose hello?",
          explain: "For a B object, self.hello() runs B.hello, which adds to A's version via super().",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Call the parent constructor.",
          code: r`class Vehicle:
    def __init__(self, wheels):
        self.wheels = wheels
class Bike(Vehicle):
    def __init__(self):
        ___().__init__(2)

print(Bike().wheels)`,
          blanks: [["super"]],
          output: "2\n",
          hint: "Reach the parent class.",
          explain: "`super().__init__(2)` runs Vehicle's initialiser.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "Printing the manager crashes with AttributeError: no attribute 'name'. Which line is missing something?",
          code: r`class Employee:
    def __init__(self, name):
        self.name = name
class Manager(Employee):
    def __init__(self, name, team):
        self.team = team

m = Manager("Asha", 5)
print(m.name, m.team)`,
          line: 6,
          fix: r`class Employee:
    def __init__(self, name):
        self.name = name
class Manager(Employee):
    def __init__(self, name, team):
        super().__init__(name)
        self.team = team

m = Manager("Asha", 5)
print(m.name, m.team)`,
          output: "Asha 5\n",
          hint: "Who sets self.name?",
          explain: "Manager's __init__ replaces Employee's, so name is never set. Call `super().__init__(name)` first.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "`class C(A, B)` and both A and B define `run()`. Which runs for `C().run()`?",
          options: [
            { text: "A.run — A comes first in the MRO", why: "Correct." },
            { text: "B.run — the last parent wins", why: "Python searches left to right." },
            { text: "Both, in order", why: "Only the first found runs (unless they call super())." },
          ],
          answer: 0,
          hint: "Method resolution order.",
          explain: "The MRO for C is C, A, B, object — A's run is found first.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Shapes with polymorphism", difficulty: 3,
          prompt: `Write a base class \`Shape\` with \`area()\` returning 0 and \`describe()\` returning \`"<ClassName> with area <area rounded to 2>"\`. Subclasses \`Circle(r)\`, \`Rectangle(w, h)\` and \`Square(side)\` (a subclass of Rectangle). Read lines like \`circle 2\`, \`rect 3 4\`, \`square 5\` until \`end\`, print each description, then the total area rounded to 2.`,
          starter: r`import math

class Shape:
    pass
`,
          tests: [
            { label: "Three shapes", input: "circle 1\nrect 3 4\nsquare 2\nend\n", output: "Circle with area 3.14\nRectangle with area 12\nSquare with area 4\ntotal 19.14" },
            { label: "Only circles", input: "circle 2\ncircle 3\nend\n", output: "Circle with area 12.57\nCircle with area 28.27\ntotal 40.84", hidden: true },
          ],
          hints: [
            "describe uses `type(self).__name__` and `self.area()`.",
            "Circle and Rectangle override area.",
            "Square's __init__ calls `super().__init__(side, side)`.",
            "Build objects from the commands, then loop and sum `s.area()`.",
          ],
          solution: r`import math

class Shape:
    def area(self):
        return 0

    def describe(self):
        return f"{type(self).__name__} with area {round(self.area(), 2)}"

class Circle(Shape):
    def __init__(self, r):
        self.r = r

    def area(self):
        return math.pi * self.r ** 2

class Rectangle(Shape):
    def __init__(self, w, h):
        self.w, self.h = w, h

    def area(self):
        return self.w * self.h

class Square(Rectangle):
    def __init__(self, side):
        super().__init__(side, side)

shapes = []
while (line := input()) != "end":
    kind, *nums = line.split()
    nums = [float(n) if "." in n else int(n) for n in nums]
    if kind == "circle":
        shapes.append(Circle(*nums))
    elif kind == "rect":
        shapes.append(Rectangle(*nums))
    elif kind == "square":
        shapes.append(Square(*nums))
for s in shapes:
    print(s.describe())
print("total", round(sum(s.area() for s in shapes), 2))`,
          notes: "describe() is written once; each subclass only says how to compute its area. The final loop doesn't care which shape it has — polymorphism.",
        },
        {
          id: "stretch", kind: "task", title: "Employees and payroll", difficulty: 4,
          prompt: `Base \`Employee(name, base)\` with \`pay()\` = base. \`Manager(name, base, reports)\` pays base + 1000 per report (use super().pay()). \`Intern(name, stipend)\` pays the stipend (call Employee's __init__ with base=stipend). \`Contractor\` is NOT an Employee: it has \`name\` and \`hours\`, \`rate\` and its own \`pay()\` (hours × rate) — duck typing. Read lines until \`end\` and print \`name: pay\` for each, then \`total: N\`.`,
          starter: r`class Employee:
    pass
`,
          tests: [
            { label: "Mixed staff", input: "emp Asha 40000\nmgr Ravi 60000 3\nintern Zoe 15000\ncontract Dev 120 500\nend\n", output: "Asha: 40000\nRavi: 63000\nZoe: 15000\nDev: 60000\ntotal: 178000" },
            { label: "Manager with no reports", input: "mgr Kim 50000 0\nend\n", output: "Kim: 50000\ntotal: 50000", hidden: true, category: "edge" },
          ],
          hints: [
            "Employee stores name and base; pay returns base.",
            "Manager: `super().__init__(name, base)`, pay = `super().pay() + 1000 * self.reports`.",
            "Intern: `super().__init__(name, stipend)` — no need to override pay.",
            "Contractor is a separate class with a pay() method; the payroll loop just calls `.pay()` on everything.",
          ],
          solution: r`class Employee:
    def __init__(self, name, base):
        self.name = name
        self.base = base

    def pay(self):
        return self.base

class Manager(Employee):
    def __init__(self, name, base, reports):
        super().__init__(name, base)
        self.reports = reports

    def pay(self):
        return super().pay() + 1000 * self.reports

class Intern(Employee):
    def __init__(self, name, stipend):
        super().__init__(name, stipend)

class Contractor:
    def __init__(self, name, hours, rate):
        self.name = name
        self.hours = hours
        self.rate = rate

    def pay(self):
        return self.hours * self.rate

staff = []
while (line := input()) != "end":
    kind, name, *nums = line.split()
    nums = list(map(int, nums))
    cls = {"emp": Employee, "mgr": Manager, "intern": Intern, "contract": Contractor}[kind]
    staff.append(cls(name, *nums))
for person in staff:
    print(f"{person.name}: {person.pay()}")
print("total:", sum(p.pay() for p in staff))`,
          notes: "Managers and interns reuse Employee through inheritance; Contractor works in the same payroll loop only because it has `name` and `pay()` — duck typing. Choosing the class from a dict is a factory in miniature (Module 23).",
        },
      ],
      realWorld: "Django class-based views, unittest.TestCase, Exception hierarchies and GUI widget trees all use inheritance; plugin systems rely on polymorphism so new types work without changing the core.",
      reteach: "Inheritance is a family recipe book: the child copy has all the parent's recipes, can rewrite some (override) and can add 'Mum's version, plus extra chilli' (super() + more). Polymorphism is calling 'make dinner' on any cook — each makes their own dinner, and you don't need to know whose kitchen you're in.",
      summary: [
        "`class Child(Parent):` inherits; override methods to specialise.",
        "`super()` calls the parent version — always in an overriding __init__.",
        "MRO decides lookup order (multiple inheritance); polymorphism and duck typing let one interface serve many types.",
      ],
      cpp: {
        python: r`class Dog(Animal):
    def speak(self):
        return "Woof"`,
        cpp: r`class Dog : public Animal {
public:
    std::string speak() const override { return "Woof"; }
};`,
        note: "In C++ a method must be `virtual` for overriding to work through a base-class pointer; in Python every method is effectively virtual.",
      },
    },

    {
      id: "py-abstraction-composition",
      title: "Abstraction, ABCs and composition",
      minutes: 17,
      difficulty: 4,
      objectives: [
        "Define abstract base classes with `abc.ABC` and `@abstractmethod`",
        "Prefer composition ('has-a') over inheritance ('is-a') where it fits",
        "Design a small system from cooperating objects",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "What happens when you instantiate a class that still has an unimplemented `@abstractmethod`?",
        options: [
          { text: "It works; the method returns None", why: "ABCs prevent this." },
          { text: "TypeError: Can't instantiate abstract class", why: "Correct." },
          { text: "A warning is printed", why: "It's a hard error." },
        ],
        answer: 1,
        hint: "Abstract = incomplete.",
        explain: "ABCs refuse to create instances until every abstract method is implemented in a subclass.",
      },
      why: "Abstraction defines *what* something can do without fixing *how* — every storage backend can save and load; every notifier can send. Composition builds objects out of other objects, which usually leads to more flexible designs than deep inheritance trees.",
      concept: [
        {
          title: "Abstract base classes",
          body: `\`\`\`python
from abc import ABC, abstractmethod

class Notifier(ABC):
    @abstractmethod
    def send(self, to, message): ...

    def broadcast(self, people, message):     # concrete method built on the abstract one
        for p in people:
            self.send(p, message)

class SMS(Notifier):
    def send(self, to, message):
        print(f"SMS to {to}: {message}")
\`\`\`

\`Notifier()\` raises TypeError; \`SMS()\` works. The ABC documents and **enforces** the required interface.`,
        },
        {
          title: "Composition: has-a",
          body: `Instead of making a \`Car\` *be* an \`Engine\`, a car **has** an engine:

\`\`\`python
class Engine:
    def start(self): return "vroom"

class Car:
    def __init__(self, engine):
        self.engine = engine           # composed
    def start(self):
        return self.engine.start()     # delegate
\`\`\`

Swap in an \`ElectricEngine\` without touching \`Car\`. Rule of thumb: **inherit for 'is-a' with shared behaviour; compose for 'has-a' or 'uses-a'.**`,
        },
      ],
      example: {
        title: "An order system built from parts",
        code: r`from abc import ABC, abstractmethod

class Discount(ABC):
    @abstractmethod
    def apply(self, total): ...

class NoDiscount(Discount):
    def apply(self, total):
        return total

class Percent(Discount):
    def __init__(self, pct):
        self.pct = pct
    def apply(self, total):
        return round(total * (1 - self.pct / 100), 2)

class Order:
    def __init__(self, discount):
        self.items = []
        self.discount = discount
    def add(self, name, price):
        self.items.append((name, price))
    def total(self):
        return self.discount.apply(sum(p for _, p in self.items))

o = Order(Percent(10))
o.add("book", 300)
o.add("pen", 50)
print(o.total(), Order(NoDiscount()).total())
try:
    Discount()
except TypeError as e:
    print("TypeError:", str(e).split(" with")[0])`,
        output: "315.0 0\nTypeError: Can't instantiate abstract class Discount\n",
        lines: [
          [3, "The abstract interface: every discount must implement apply."],
          [11, "A concrete strategy with its own data."],
          [17, "Order HAS a discount (composition) rather than being one."],
          [23, "It delegates the discount calculation to whichever object it was given."],
          [26, "Plug in a 10% discount: 350 → 315.0."],
          [30, "The ABC can't be instantiated."],
        ],
      },
      mistakes: [
        { title: "Inheriting to reuse one method", body: "If a class only needs one helper from another, compose or call a function instead of inheriting everything." },
        { title: "Forgetting to implement an abstract method", body: "TypeError at instantiation — implement every @abstractmethod (check the spelling)." },
        { title: "God objects", body: "A class that does everything (UI, database, rules) is hard to change. Split into cooperating parts." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`from abc import ABC, abstractmethod
class Greeter(ABC):
    @abstractmethod
    def word(self): ...
    def greet(self, name):
        return f"{self.word()}, {name}"
class Hindi(Greeter):
    def word(self):
        return "Namaste"
class Partial(Greeter):
    pass
print(Hindi().greet("Asha"))
try:
    Partial()
except TypeError:
    print("Partial is abstract")`,
          answer: "Namaste, Asha\nPartial is abstract\n",
          hint: "Partial doesn't implement word().",
          explain: "Hindi implements the abstract method; Partial doesn't, so creating it raises TypeError.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Mark `area` as a method every subclass must implement.",
          code: r`from abc import ABC, abstractmethod
class Shape(ABC):
    @___
    def area(self): ...
class Sq(Shape):
    def area(self):
        return 4
print(Sq().area())`,
          blanks: [["abstractmethod"]],
          output: "4\n",
          hint: "The decorator from abc.",
          explain: "`@abstractmethod` marks a required method.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "This subclass still can't be created. Which line is the bug?",
          code: r`from abc import ABC, abstractmethod
class Storage(ABC):
    @abstractmethod
    def save(self, data): ...
class Memory(Storage):
    def sav(self, data):
        return "saved " + data
print(Memory().save("x"))`,
          line: 6,
          fix: r`from abc import ABC, abstractmethod
class Storage(ABC):
    @abstractmethod
    def save(self, data): ...
class Memory(Storage):
    def save(self, data):
        return "saved " + data
print(Memory().save("x"))`,
          output: "saved x\n",
          hint: "Compare the method names.",
          explain: "`sav` is a typo, so `save` is still abstract and Memory can't be instantiated.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "A `Library` keeps a list of `Book` objects. Which relationship is that?",
          options: [
            { text: "Inheritance: Library is a Book", why: "A library isn't a kind of book." },
            { text: "Composition: Library has Books", why: "Correct." },
            { text: "Polymorphism", why: "That's about using different types through one interface." },
          ],
          answer: 1,
          hint: "Is-a or has-a?",
          explain: "A library contains books — composition.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Pluggable storage", difficulty: 3,
          prompt: `Define an ABC \`Storage\` with abstract methods \`save(key, value)\` and \`load(key)\`. Implement \`MemoryStorage\` (a dict inside) and \`LoggedStorage\`, which **wraps** (composes) another Storage and prints \`LOG save KEY\` / \`LOG load KEY\` before delegating to it. Process \`set K V\` / \`get K\` commands until \`end\` using \`LoggedStorage(MemoryStorage())\`; \`get\` prints the value or \`missing\`.`,
          starter: r`from abc import ABC, abstractmethod

class Storage(ABC):
    pass
`,
          tests: [
            { label: "Session", input: "set name Asha\nget name\nget age\nend\n", output: "LOG save name\nLOG load name\nAsha\nLOG load age\nmissing" },
            { label: "Overwrite", input: "set a 1\nset a 2\nget a\nend\n", output: "LOG save a\nLOG save a\nLOG load a\n2", hidden: true },
          ],
          hints: [
            "Storage declares save and load as @abstractmethod.",
            "MemoryStorage keeps `self._data = {}` and uses `.get(key)` in load (returns None if missing).",
            "LoggedStorage(inner) prints, then calls `self.inner.save(...)` / `self.inner.load(...)`.",
            "Print `missing` when load returns None.",
          ],
          solution: r`from abc import ABC, abstractmethod

class Storage(ABC):
    @abstractmethod
    def save(self, key, value): ...

    @abstractmethod
    def load(self, key): ...

class MemoryStorage(Storage):
    def __init__(self):
        self._data = {}

    def save(self, key, value):
        self._data[key] = value

    def load(self, key):
        return self._data.get(key)

class LoggedStorage(Storage):
    def __init__(self, inner):
        self.inner = inner

    def save(self, key, value):
        print("LOG save", key)
        self.inner.save(key, value)

    def load(self, key):
        print("LOG load", key)
        return self.inner.load(key)

store = LoggedStorage(MemoryStorage())
while (line := input()) != "end":
    parts = line.split()
    if parts[0] == "set":
        store.save(parts[1], parts[2])
    else:
        value = store.load(parts[1])
        print(value if value is not None else "missing")`,
          notes: "LoggedStorage is a decorator-style wrapper built by composition: it adds behaviour to any Storage without subclassing it. Swapping MemoryStorage for a FileStorage wouldn't change a line of LoggedStorage.",
        },
        {
          id: "stretch", kind: "challenge", title: "A playlist built from parts", difficulty: 4,
          prompt: `Classes: \`Song(title, seconds)\`; \`Playlist\` that **has** a list of songs plus a **shuffle strategy** object with a \`order(songs)\` method. Strategies: \`InOrder\` (as added), \`ShortestFirst\` (by length, ties by title), \`Alphabetical\`. Read the strategy name on the first line, then songs \`title seconds\` until \`end\`. Print the play order as \`m:ss title\` and the total as \`total m:ss\`.`,
          starter: r`class Song:
    pass
`,
          tests: [
            { label: "Shortest first", input: "shortest\nIntro 95\nAnthem 240\nOutro 95\nbaby 180\nend\n", output: "1:35 Intro\n1:35 Outro\n3:00 baby\n4:00 Anthem\ntotal 10:10" },
            { label: "Alphabetical", input: "alpha\nzed 60\nAce 61\nend\n", output: "1:01 Ace\n1:00 zed\ntotal 2:01", hidden: true },
            { label: "In order", input: "inorder\nB 5\nA 600\nend\n", output: "0:05 B\n10:00 A\ntotal 10:05", hidden: true },
          ],
          hints: [
            "Each strategy class has one method `order(self, songs)` returning a new list.",
            "ShortestFirst: `sorted(songs, key=lambda s: (s.seconds, s.title))`.",
            "Playlist(strategy) stores songs and calls `self.strategy.order(self.songs)`.",
            "Format seconds with `f\"{s // 60}:{s % 60:02d}\"`.",
          ],
          solution: r`class Song:
    def __init__(self, title, seconds):
        self.title = title
        self.seconds = seconds

class InOrder:
    def order(self, songs):
        return list(songs)

class ShortestFirst:
    def order(self, songs):
        return sorted(songs, key=lambda s: (s.seconds, s.title))

class Alphabetical:
    def order(self, songs):
        return sorted(songs, key=lambda s: s.title.lower())

class Playlist:
    def __init__(self, strategy):
        self.strategy = strategy
        self.songs = []

    def add(self, song):
        self.songs.append(song)

    def play_order(self):
        return self.strategy.order(self.songs)

def mmss(s):
    return f"{s // 60}:{s % 60:02d}"

STRATEGIES = {"inorder": InOrder, "shortest": ShortestFirst, "alpha": Alphabetical}
playlist = Playlist(STRATEGIES[input()]())
while (line := input()) != "end":
    title, secs = line.rsplit(" ", 1)
    playlist.add(Song(title, int(secs)))
for song in playlist.play_order():
    print(mmss(song.seconds), song.title)
print("total", mmss(sum(s.seconds for s in playlist.songs)))`,
          notes: "This is the Strategy pattern (Module 23): the Playlist delegates ordering to an interchangeable object. Adding a new ordering means adding a class — Playlist never changes.",
        },
      ],
      realWorld: "Python's `collections.abc` defines the interfaces behind lists and dicts; web frameworks compose request handlers, middleware and storage backends; payment, notification and storage systems are usually 'interface + several implementations' plugged together.",
      reteach: "An abstract class is a job description: 'must be able to send messages'. It can't do the job itself — you hire someone who fills in how (SMS, email). Composition is building a team: a car *has* an engine and *has* wheels, and you can swap the engine without rebuilding the car.",
      summary: [
        "`class X(ABC)` with `@abstractmethod` defines an enforced interface; it can't be instantiated.",
        "Composition (has-a) + delegation keeps parts swappable; inheritance is for genuine is-a.",
        "Design systems from small cooperating objects with clear responsibilities.",
      ],
    },

    {
      id: "py-dataclasses-dunders",
      title: "Dataclasses, operator overloading and object lifecycle",
      minutes: 18,
      difficulty: 4,
      objectives: [
        "Define data-holding classes concisely with `@dataclass`",
        "Implement dunder methods: __str__/__repr__, __eq__, __lt__, __add__, __len__",
        "Describe how objects are created and garbage-collected",
      ],
      version: "dataclasses: 3.7+ (slots=True, kw_only: 3.10+)",
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "What does `@dataclass` generate for you?",
        options: [
          { text: "Nothing — it's documentation only", why: "It generates real methods." },
          { text: "__init__, __repr__ and __eq__ from the field annotations", why: "Correct (and more with options like order=True)." },
          { text: "A database table", why: "That's an ORM (Module 31)." },
        ],
        answer: 1,
        hint: "Less boilerplate.",
        explain: "Dataclasses read the annotated fields and write the usual special methods for you.",
      },
      why: "Most classes mainly hold data: points, products, records. Dataclasses remove the boilerplate. Dunder ('double underscore') methods let your objects work with Python's operators and built-ins — `+`, `==`, `<`, `len()`, `print()`, `sorted()` — so they feel like built-in types.",
      concept: [
        {
          title: "@dataclass",
          body: `\`\`\`python
from dataclasses import dataclass, field

@dataclass
class Product:
    name: str
    price: float
    tags: list[str] = field(default_factory=list)   # safe mutable default

p = Product("pen", 10.0)       # __init__ generated
print(p)                       # Product(name='pen', price=10.0, tags=[])
p == Product("pen", 10.0)      # True: __eq__ compares fields
\`\`\`

Options: \`@dataclass(frozen=True)\` (immutable, hashable), \`order=True\` (adds < <= > >= by field order), \`slots=True\` (3.10+, less memory). \`__post_init__\` runs after the generated __init__ — good for validation.`,
        },
        {
          title: "Dunder methods",
          body: `| Method | Enables |
| --- | --- |
| \`__repr__\` / \`__str__\` | debugging repr / \`print\` and \`str()\` |
| \`__eq__\`, \`__lt__\` … | \`==\`, \`<\` (and \`sorted\`) |
| \`__add__\`, \`__mul__\` … | \`+\`, \`*\` (operator overloading) |
| \`__len__\`, \`__getitem__\`, \`__contains__\`, \`__iter__\` | \`len()\`, \`[]\`, \`in\`, \`for\` |
| \`__hash__\` | use as dict key / set item |
| \`__call__\` | call the object like a function |

Return \`NotImplemented\` from an operator method when the other operand's type isn't supported.`,
        },
        {
          title: "Object lifecycle",
          body: `1. **Creation**: \`__new__\` makes the object, \`__init__\` initialises it.
2. **Use**: names refer to it; each reference adds to its **reference count**.
3. **Destruction**: when no references remain (count reaches 0), CPython frees it immediately; a **cyclic garbage collector** (\`gc\` module) cleans up groups of objects that refer only to each other.

\`__del__\` exists but is unreliable for cleanup — use \`with\` (context managers, Module 25) for resources. Module 28 goes deeper into memory.`,
        },
      ],
      example: {
        title: "Money that behaves like a number",
        code: r`from dataclasses import dataclass

@dataclass(frozen=True, order=True)
class Money:
    paise: int

    def __add__(self, other):
        if not isinstance(other, Money):
            return NotImplemented
        return Money(self.paise + other.paise)

    def __mul__(self, k):
        return Money(self.paise * k)

    def __str__(self):
        return f"Rs {self.paise // 100}.{self.paise % 100:02d}"

tea, samosa = Money(1250), Money(1500)
bill = tea * 2 + samosa
print(bill, repr(bill))
print(bill > tea, sorted([samosa, tea])[0], tea == Money(1250))
prices = {tea: "tea"}
print(prices[Money(1250)])`,
        output: "Rs 40.00 Money(paise=4000)\nTrue Rs 12.50 True\ntea\n",
        lines: [
          [3, "frozen → immutable and hashable; order → comparison operators by field."],
          [4, "One annotated field; __init__, __repr__, __eq__ are generated."],
          [7, "Operator overloading: + between two Money objects."],
          [9, "Return NotImplemented for unsupported types (Python then tries the other side, then raises TypeError)."],
          [15, "__str__ is used by print; repr shows the generated __repr__."],
          [18, "Comparisons and sorted() work thanks to order=True."],
          [19, "Frozen dataclasses can be dict keys."],
        ],
      },
      mistakes: [
        { title: "Mutable default in a dataclass", body: "`tags: list = []` raises ValueError. Use `field(default_factory=list)`." },
        { title: "__eq__ without thinking about __hash__", body: "Defining __eq__ on a normal class sets __hash__ to None (unhashable). Use frozen dataclasses for value objects you'll put in sets." },
        { title: "Relying on __del__", body: "Its timing isn't guaranteed (especially with cycles or other Python implementations). Use `with` for cleanup." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`from dataclasses import dataclass
@dataclass
class P:
    x: int
    y: int = 0
a, b = P(1), P(1, 0)
print(a, a == b, a is b)`,
          answer: "P(x=1, y=0) True False\n",
          hint: "Generated __repr__ and __eq__.",
          explain: "The repr shows the fields; __eq__ compares field values (equal) but they're different objects.",
        },
        {
          id: "p2", kind: "predict", difficulty: 3,
          code: r`class Basket:
    def __init__(self, items):
        self.items = items
    def __len__(self):
        return len(self.items)
    def __contains__(self, x):
        return x in self.items
    def __str__(self):
        return " + ".join(self.items)
b = Basket(["rice", "dal"])
print(len(b), "dal" in b, b, bool(Basket([])))`,
          answer: "2 True rice + dal False\n",
          hint: "With __len__, an empty object is falsy.",
          explain: "len uses __len__; `in` uses __contains__; print uses __str__; truthiness falls back to __len__ (0 → False).",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Give the dataclass a safe empty-list default.",
          code: r`from dataclasses import dataclass, field
@dataclass
class Team:
    name: str
    members: list = field(default_factory=___)
print(Team("A").members, Team("B").members is Team("C").members)`,
          blanks: [["list"]],
          output: "[] False\n",
          hint: "A callable that makes a new empty list.",
          explain: "`default_factory=list` calls list() for each new instance.",
        },
        {
          id: "b1", kind: "bug", difficulty: 4,
          prompt: "`v1 + v2` should give `Vec(4, 6)` but raises TypeError. Which line?",
          code: r`class Vec:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def add(self, other):
        return Vec(self.x + other.x, self.y + other.y)
    def __repr__(self):
        return f"Vec({self.x}, {self.y})"
print(Vec(1, 2) + Vec(3, 4))`,
          line: 4,
          fix: r`class Vec:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __add__(self, other):
        return Vec(self.x + other.x, self.y + other.y)
    def __repr__(self):
        return f"Vec({self.x}, {self.y})"
print(Vec(1, 2) + Vec(3, 4))`,
          output: "Vec(4, 6)\n",
          hint: "Which method name does `+` look for?",
          explain: "The + operator calls `__add__`; a method named `add` is just an ordinary method.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Sortable products", difficulty: 3,
          prompt: `Define a dataclass \`Product(name: str, price: float, rating: float)\`. Read products \`name price rating\` until \`end\` and print them sorted by **rating descending, then price ascending**, each as \`name (price, ★rating)\`, then the cheapest product's repr.`,
          starter: r`from dataclasses import dataclass
`,
          tests: [
            { label: "Four products", input: "pen 10 4.5\nbook 300 4.8\nbag 650 4.5\nink 5 3.9\nend\n", output: "book (300.0, ★4.8)\npen (10.0, ★4.5)\nbag (650.0, ★4.5)\nink (5.0, ★3.9)\nProduct(name='ink', price=5.0, rating=3.9)" },
            { label: "One", input: "x 1 1\nend\n", output: "x (1.0, ★1.0)\nProduct(name='x', price=1.0, rating=1.0)", hidden: true },
          ],
          hints: [
            "Annotate the three fields; the decorator writes __init__ and __repr__.",
            "Convert price and rating with float().",
            "`sorted(products, key=lambda p: (-p.rating, p.price))`.",
            "Cheapest: `min(products, key=lambda p: p.price)` and print it directly (repr).",
          ],
          solution: r`from dataclasses import dataclass

@dataclass
class Product:
    name: str
    price: float
    rating: float

products = []
while (line := input()) != "end":
    name, price, rating = line.split()
    products.append(Product(name, float(price), float(rating)))
for p in sorted(products, key=lambda p: (-p.rating, p.price)):
    print(f"{p.name} ({p.price}, ★{p.rating})")
print(repr(min(products, key=lambda p: p.price)))`,
          notes: "The dataclass gives a readable repr for free. A key function is clearer than order=True here, because the sort order isn't simply the field order.",
        },
        {
          id: "stretch", kind: "challenge", title: "Fractions with operators", difficulty: 4,
          prompt: `Write \`Frac(num, den)\` that always stores the fraction in lowest terms with a positive denominator (use math.gcd), raising \`ZeroDivisionError\` for den 0. Implement \`__add__\`, \`__mul__\`, \`__eq__\`, \`__lt__\`, \`__str__\` (\`3/4\`, or just \`2\` when den is 1) and \`__repr__\` (\`Frac(3, 4)\`). Evaluate input lines \`a/b op c/d\` (op is +, * , < or ==) until \`end\`.`,
          starter: r`import math
`,
          tests: [
            { label: "Operations", input: "1/2 + 1/3\n2/4 * 2/1\n1/3 < 1/2\n2/4 == 1/2\n3/-6 + 1/2\nend\n", output: "5/6\n1\nTrue\nTrue\n0" },
            { label: "Negative result", input: "1/4 + -3/4\nend\n", output: "-1/2", hidden: true, category: "edge" },
          ],
          hints: [
            "Normalise in __init__: divide by gcd, and if den < 0 flip both signs.",
            "a/b + c/d = (ad + cb)/bd; a/b * c/d = ac/bd.",
            "Compare with cross-multiplication: a*d < c*b (denominators are positive).",
            "Parse each side with `map(int, text.split(\"/\"))`.",
          ],
          solution: r`import math

class Frac:
    def __init__(self, num, den):
        if den == 0:
            raise ZeroDivisionError("denominator is zero")
        if den < 0:
            num, den = -num, -den
        g = math.gcd(num, den)
        self.num, self.den = num // g, den // g

    def __add__(self, other):
        return Frac(self.num * other.den + other.num * self.den, self.den * other.den)

    def __mul__(self, other):
        return Frac(self.num * other.num, self.den * other.den)

    def __eq__(self, other):
        return isinstance(other, Frac) and (self.num, self.den) == (other.num, other.den)

    def __lt__(self, other):
        return self.num * other.den < other.num * self.den

    def __str__(self):
        return str(self.num) if self.den == 1 else f"{self.num}/{self.den}"

    def __repr__(self):
        return f"Frac({self.num}, {self.den})"

def parse(text):
    a, b = map(int, text.split("/"))
    return Frac(a, b)

while (line := input()) != "end":
    left, op, right = line.split()
    x, y = parse(left), parse(right)
    if op == "+":
        print(x + y)
    elif op == "*":
        print(x * y)
    elif op == "<":
        print(x < y)
    else:
        print(x == y)`,
          notes: "Normalising in one place (__init__) makes equality trivial. The standard library's `fractions.Fraction` does all this — writing it yourself shows how operator overloading works.",
        },
      ],
      realWorld: "Dataclasses (and pydantic models) represent API payloads and config; NumPy arrays, pandas DataFrames, Decimal and Path all overload operators (`/` for paths!); SQLAlchemy overloads `==` to build SQL queries.",
      reteach: "Dunder methods are the 'sockets' Python's built-in tools plug into: `print` plugs into __str__, `+` into __add__, `len` into __len__, `sorted` into __lt__. Implement the socket and the tool works with your object. A dataclass is a kit that wires up the most common sockets for you from a list of fields.",
      summary: [
        "@dataclass generates __init__/__repr__/__eq__; frozen, order, slots, field(default_factory=…), __post_init__.",
        "Dunders connect objects to operators and built-ins; return NotImplemented for unsupported types.",
        "Objects are freed when their reference count hits 0; gc collects cycles; use `with` (not __del__) for cleanup.",
      ],
      cpp: {
        python: r`def __add__(self, other):
    return Vec(self.x + other.x, self.y + other.y)`,
        cpp: r`Vec operator+(const Vec& o) const {
    return {x + o.x, y + o.y};
}`,
        note: "Both languages overload operators with special method names. C++ destroys objects deterministically at scope end (RAII); CPython frees them when the reference count drops to zero.",
      },
    },
  ],
  exam: [
    {
      id: "e1", kind: "predict", difficulty: 3,
      code: r`class Base:
    count = 0
    def __init__(self):
        Base.count += 1
        self.id = Base.count
class Child(Base):
    def __init__(self, tag):
        super().__init__()
        self.tag = tag
objs = [Base(), Child("x"), Child("y")]
print([o.id for o in objs], Base.count, isinstance(objs[1], Base))`,
      answer: "[1, 2, 3] 3 True\n",
      hint: "The class attribute is shared and updated through Base.",
      explain: "Every construction (including via super()) increments the shared counter.",
    },
    {
      id: "e2", kind: "mcq", difficulty: 3,
      prompt: "Which is the best design for 'a Car has an Engine that can be petrol or electric'?",
      options: [
        { text: "`class Car(Engine)`", why: "A car isn't a kind of engine." },
        { text: "`Car` holds an `engine` object; `PetrolEngine` and `ElectricEngine` share an Engine interface", why: "Correct — composition plus polymorphism." },
        { text: "Two separate Car classes with copied code", why: "Duplication." },
      ],
      answer: 1,
      hint: "Has-a.",
      explain: "Compose the car from an engine object; engines are interchangeable implementations of one interface.",
    },
    {
      id: "e3", kind: "fill", difficulty: 3,
      prompt: "Make the dataclass immutable and hashable.",
      code: r`from dataclasses import dataclass
@dataclass(___=True)
class Point:
    x: int
    y: int
print(len({Point(1, 2), Point(1, 2)}))`,
      blanks: [["frozen"]],
      output: "1\n",
      hint: "Frozen.",
      explain: "`frozen=True` makes instances immutable and hashable, so equal points collapse in a set.",
    },
    {
      id: "e4", kind: "bug", difficulty: 3,
      prompt: "The subclass's describe() should include the parent's text. Which line is wrong?",
      code: r`class Animal:
    def describe(self):
        return "animal"
class Bird(Animal):
    def describe(self):
        return Animal.describe() + " that flies"
print(Bird().describe())`,
      line: 6,
      fix: r`class Animal:
    def describe(self):
        return "animal"
class Bird(Animal):
    def describe(self):
        return super().describe() + " that flies"
print(Bird().describe())`,
      output: "animal that flies\n",
      hint: "Calling a method through the class needs an instance argument.",
      explain: "`Animal.describe()` is missing self (TypeError). Use `super().describe()` (or `Animal.describe(self)`).",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: library management with classes", difficulty: 4,
    prompt: `Model a library with \`Book\` (dataclass: isbn, title, author, available=True), \`Member\` (name, borrowed list, limit property: 3 for "student", 5 for "staff"), and \`Library\` (has books and members). Commands until \`end\`:

- \`book ISBN TITLE AUTHOR\` (single words), \`member NAME TYPE\`,
- \`borrow NAME ISBN\` → \`ok\` or \`error: …\` (\`no such book\`, \`not available\`, \`limit reached\`),
- \`return NAME ISBN\` → \`ok\` or \`error: not borrowed\`,
- \`report\` → each book in ISBN order: \`ISBN TITLE [available|out]\`.

Use a custom \`LibraryError\` raised by Library methods and caught by the command loop.`,
    starter: r`from dataclasses import dataclass, field
`,
    tests: [
      {
        label: "Session",
        input: "book 1 Dune Herbert\nbook 2 Emma Austen\nmember asha student\nborrow asha 1\nborrow asha 1\nborrow asha 9\nreturn asha 2\nreturn asha 1\nborrow asha 2\nreport\nend\n",
        output: "ok\nerror: not available\nerror: no such book\nerror: not borrowed\nok\nok\n1 Dune [available]\n2 Emma [out]",
      },
      {
        label: "Limit",
        input: "book 1 A x\nbook 2 B x\nbook 3 C x\nbook 4 D x\nmember zoe student\nborrow zoe 1\nborrow zoe 2\nborrow zoe 3\nborrow zoe 4\nend\n",
        output: "ok\nok\nok\nerror: limit reached",
        hidden: true,
      },
    ],
    hints: [
      "Book is a dataclass; Member is a normal class with a `limit` property.",
      "Library keeps dicts: isbn → Book, name → Member.",
      "borrow checks: book exists, available, member under limit; then updates both objects.",
      "The loop wraps each command in try/except LibraryError and prints `error: …`.",
    ],
    solution: r`from dataclasses import dataclass, field

class LibraryError(Exception):
    pass

@dataclass
class Book:
    isbn: str
    title: str
    author: str
    available: bool = True

class Member:
    def __init__(self, name, kind):
        self.name = name
        self.kind = kind
        self.borrowed = []

    @property
    def limit(self):
        return 5 if self.kind == "staff" else 3

class Library:
    def __init__(self):
        self.books = {}
        self.members = {}

    def add_book(self, isbn, title, author):
        self.books[isbn] = Book(isbn, title, author)

    def add_member(self, name, kind):
        self.members[name] = Member(name, kind)

    def borrow(self, name, isbn):
        member = self.members[name]
        book = self.books.get(isbn)
        if book is None:
            raise LibraryError("no such book")
        if not book.available:
            raise LibraryError("not available")
        if len(member.borrowed) >= member.limit:
            raise LibraryError("limit reached")
        book.available = False
        member.borrowed.append(isbn)

    def give_back(self, name, isbn):
        member = self.members[name]
        if isbn not in member.borrowed:
            raise LibraryError("not borrowed")
        member.borrowed.remove(isbn)
        self.books[isbn].available = True

lib = Library()
while (line := input()) != "end":
    cmd, *args = line.split()
    try:
        if cmd == "book":
            lib.add_book(*args)
        elif cmd == "member":
            lib.add_member(*args)
        elif cmd == "borrow":
            lib.borrow(*args)
            print("ok")
        elif cmd == "return":
            lib.give_back(*args)
            print("ok")
        elif cmd == "report":
            for isbn in sorted(lib.books):
                b = lib.books[isbn]
                print(f"{b.isbn} {b.title} [{'available' if b.available else 'out'}]")
    except LibraryError as e:
        print("error:", e)`,
    notes: "Each class owns its own rules (Member knows its limit, Library enforces borrowing); the command loop only translates text into method calls. That separation is what keeps OOP programs maintainable.",
  },
};
