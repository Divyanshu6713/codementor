import type { CourseLesson } from "./types";

const r = String.raw;

/** Module 9 — Object-oriented programming: bundling data with the functions that guard it. */
export const OOP_LESSONS: CourseLesson[] = [
  {
    id: "classes-objects",
    moduleId: "oop",
    title: "Classes and objects",
    minutes: 25,
    concepts: ["class", "object", "member function", "public", "private", "encapsulation", "struct"],
    goals: [
      "Defining a class with data members and member functions",
      "Creating objects and calling their member functions",
      "Using `private` to protect data and keep objects valid (encapsulation)",
    ],
    intro: `So far data and the functions that work on it have lived separately. A **class** bundles them: a \`BankAccount\` holds a balance *and* knows how to deposit and withdraw. Each variable of that class type is an **object** with its own copy of the data.`,
    sections: [
      {
        title: "A first class",
        body: `\`\`\`cpp
class Counter {
public:
    int value = 0;           // data member
    void increment() {       // member function
        value++;
    }
};

Counter clicks;              // an object
clicks.increment();
cout << clicks.value;        // 1
\`\`\`

The class is the **blueprint**; \`clicks\` is one object built from it. A second \`Counter\` would have its own separate \`value\`. Note the \`;\` after the closing brace of the class.`,
      },
      {
        title: "public and private",
        body: `Members under \`private:\` can only be used **inside** the class's own member functions. Members under \`public:\` can be used by anyone.

\`\`\`cpp
class BankAccount {
private:
    int balance = 0;                    // can't be changed from outside
public:
    void deposit(int amount) {
        if (amount > 0) balance += amount;
    }
    int getBalance() const { return balance; }
};
\`\`\`

Now nobody can write \`acc.balance = -500;\`. Every change goes through \`deposit\`, which checks it. That's **encapsulation**: the class protects its own rules (here: the balance never goes negative).`,
      },
      {
        title: "const member functions and struct",
        body: `\`int getBalance() const\` promises the function **doesn't change** the object — it only reads. Mark every "getter" \`const\`.

\`struct\` is the same as \`class\` except members are \`public\` by default. Use \`struct\` for simple bundles of data (\`struct Point { int x, y; };\`) and \`class\` when there are rules to protect.`,
      },
    ],
    mistakes: [
      { title: "Missing ; after the class", body: "`class A { ... }` must end with `};`. Forgetting it gives confusing errors on the *next* line." },
      { title: "Accessing a private member", body: "`acc.balance` from `main` fails with \"is private within this context\". Add a public member function instead of making the data public." },
      { title: "Calling a member without an object", body: "`deposit(50);` inside `main` doesn't know *which* account. Call it on an object: `acc.deposit(50);`." },
    ],
    example: {
      title: "A bank account that protects its balance",
      intro: "Withdrawals that would overdraw the account are refused by the class itself.",
      code: r`#include <iostream>
using namespace std;

class BankAccount {
private:
    int balance = 0;
public:
    void deposit(int amount) {
        if (amount > 0) {
            balance += amount;
        }
    }
    bool withdraw(int amount) {
        if (amount <= 0 || amount > balance) {
            return false;
        }
        balance -= amount;
        return true;
    }
    int getBalance() const {
        return balance;
    }
};

int main() {
    BankAccount asha, ravi;
    asha.deposit(500);
    ravi.deposit(100);
    cout << "asha: " << asha.getBalance() << endl;
    cout << (asha.withdraw(200) ? "withdrew 200" : "refused") << endl;
    cout << (ravi.withdraw(300) ? "withdrew 300" : "refused") << endl;
    cout << "asha: " << asha.getBalance() << ", ravi: " << ravi.getBalance() << endl;
    return 0;
}`,
      output: "asha: 500\nwithdrew 200\nrefused\nasha: 300, ravi: 100\n",
      notes: [
        { line: 5, text: "`private`: only `BankAccount`'s own functions can touch `balance`." },
        { line: 14, text: "The class enforces its rule: no overdrafts, no negative withdrawals." },
        { line: 20, text: "`const`: a getter that only reads." },
        { line: 26, text: "Two objects from one blueprint, each with its own balance." },
      ],
    },
    quickCheck: {
      prompt: "Which line does NOT compile?",
      code: r`class Box {
private:
    int size = 1;
public:
    int getSize() const { return size; }
};

int main() {
    Box b;
    cout << b.getSize();   // line A
    b.size = 5;            // line B
    Box c;                 // line C
}`,
      options: [
        { id: "a", text: "Line A", feedback: "`getSize` is public — calling it is fine." },
        { id: "b", text: "Line B", feedback: "Right: `size` is private, so `main` can't assign to it." },
        { id: "c", text: "Line C", feedback: "Creating another object is fine." },
      ],
      correct: "b",
      explanation: "Private members are only reachable from inside the class. Outside code must use the public interface.",
    },
    exercise: {
      title: "A rectangle class",
      prompt: `Complete the class \`Rectangle\`. It stores a private width and height and has:

- \`void set(int w, int h)\` — store the size; if either value is negative, store 0 for it instead,
- \`int area() const\`, \`int perimeter() const\`,
- \`bool isSquare() const\`.

\`main\` reads \`q\` rectangles and prints \`area perimeter square|not\` for each.`,
      starterCode: r`#include <iostream>
using namespace std;

class Rectangle {
private:
    int width = 0;
    int height = 0;
public:
    void set(int w, int h) {
        // Store w and h (negative values become 0).
    }
    int area() const {
        return 0;
    }
    int perimeter() const {
        return 0;
    }
    bool isSquare() const {
        return false;
    }
};

int main() {
    int q;
    cin >> q;
    for (int i = 0; i < q; i++) {
        int w, h;
        cin >> w >> h;
        Rectangle rect;
        rect.set(w, h);
        cout << rect.area() << " " << rect.perimeter() << " " << (rect.isSquare() ? "square" : "not") << endl;
    }
    return 0;
}`,
      tests: [
        { label: "3x4 and 5x5", input: "2\n3 4\n5 5\n", output: "12 14 not\n25 20 square", visibility: "sample", category: "normal" },
        { label: "negative width", input: "1\n-3 4\n", output: "0 8 not", visibility: "hidden", category: "edge" },
        { label: "both negative", input: "1\n-1 -1\n", output: "0 0 square", visibility: "hidden", category: "edge" },
        { label: "1 x 1", input: "1\n1 1\n", output: "1 4 square", visibility: "hidden", category: "boundary" },
      ],
      compare: "tokens",
      hints: [
        "Which member function is the only place that writes `width` and `height`?",
        "`set` is the gatekeeper: it decides what gets stored. The other functions only read.",
        "In `set`: `width = (w < 0) ? 0 : w;` and the same for `height`. Then fill in the three formulas.",
        "Area `width * height`, perimeter `2 * (width + height)`, square `width == height`.",
      ],
      solution: r`#include <iostream>
using namespace std;

class Rectangle {
private:
    int width = 0;
    int height = 0;
public:
    void set(int w, int h) {
        width = (w < 0) ? 0 : w;
        height = (h < 0) ? 0 : h;
    }
    int area() const {
        return width * height;
    }
    int perimeter() const {
        return 2 * (width + height);
    }
    bool isSquare() const {
        return width == height;
    }
};

int main() {
    int q;
    cin >> q;
    for (int i = 0; i < q; i++) {
        int w, h;
        cin >> w >> h;
        Rectangle rect;
        rect.set(w, h);
        cout << rect.area() << " " << rect.perimeter() << " " << (rect.isSquare() ? "square" : "not") << endl;
    }
    return 0;
}`,
      solutionNotes: "Because `width` and `height` are private, `set` is the only way in — so the \"no negative sizes\" rule can't be bypassed. The getters are `const` because they only read.",
    },
    explainAgain: `A class is like a **vending machine design**; each machine built from it is an object. The coins inside (private data) are locked away — you can't reach in and grab them. You use the buttons on the front (public member functions), and the machine itself decides what's allowed.`,
    summary: [
      "A class bundles data members and member functions; objects are instances of it.",
      "`private` data can only be changed through the class's own functions — encapsulation.",
      "Mark functions that only read as `const`; `struct` is a class whose members default to public.",
    ],
  },

  {
    id: "constructors-destructors",
    moduleId: "oop",
    title: "Constructors and destructors",
    minutes: 25,
    concepts: ["constructor", "initializer list", "default constructor", "destructor", "object lifetime"],
    goals: [
      "Making objects valid from the moment they're created with constructors",
      "Initializer lists and overloaded constructors",
      "When destructors run, and in what order",
    ],
    intro: `In the last lesson an object started with default values and needed a \`set\` call to become useful. A **constructor** runs automatically when an object is created, so it can never exist in a half-ready state. Its partner, the **destructor**, runs automatically when the object is destroyed.`,
    sections: [
      {
        title: "Constructors",
        body: `A constructor has the **class's name** and **no return type**:

\`\`\`cpp
class Point {
    int x, y;
public:
    Point(int px, int py) : x(px), y(py) {}   // initializer list
    Point() : x(0), y(0) {}                   // default constructor
};

Point a(3, 4);    // calls Point(int, int)
Point origin;     // calls Point()
\`\`\`

The **initializer list** (\`: x(px), y(py)\`) sets members before the body runs — the preferred way to initialise. Constructors can be overloaded like any function.`,
      },
      {
        title: "Keeping objects valid",
        body: `A constructor is the ideal place to enforce rules. A \`Fraction\` with denominator 0 makes no sense, and \`2/4\` should be stored as \`1/2\` — so the constructor can normalise it once and every other member function can rely on it.

If you write any constructor yourself, the compiler no longer provides the default one — add \`ClassName() {...}\` if you still need it.`,
      },
      {
        title: "Destructors and lifetime",
        body: `The destructor is \`~ClassName()\`. It runs when the object's lifetime ends — for a local object, at the closing \`}\` of its block. Objects in the same block are destroyed in **reverse** order of creation.

\`\`\`cpp
class Noisy {
    string name;
public:
    Noisy(string n) : name(n) { cout << name << " created\n"; }
    ~Noisy() { cout << name << " destroyed\n"; }
};
\`\`\`

Destructors release resources: closing files, freeing memory. That's how \`vector\` frees its elements and \`unique_ptr\` deletes its object.`,
      },
    ],
    mistakes: [
      { title: "Giving a constructor a return type", body: "`void Point(int x, int y)` is an ordinary member function, not a constructor. Constructors have no return type at all." },
      { title: "Point p();", body: "This declares a *function* named `p` that returns a Point (the \"most vexing parse\"). Write `Point p;` or `Point p{};`." },
      { title: "Losing the default constructor", body: "After writing `Point(int, int)`, `Point p;` no longer compiles unless you also write `Point()`." },
    ],
    example: {
      title: "Watching objects live and die",
      intro: "Constructors and destructors announce themselves, revealing the order objects are created and destroyed.",
      code: r`#include <iostream>
#include <string>
using namespace std;

class Noisy {
    string name;
public:
    Noisy(string n) : name(n) {
        cout << name << " created" << endl;
    }
    ~Noisy() {
        cout << name << " destroyed" << endl;
    }
};

int main() {
    Noisy a("A");
    {
        Noisy b("B");
        Noisy c("C");
        cout << "end of inner block" << endl;
    }
    cout << "end of main" << endl;
    return 0;
}`,
      output: "A created\nB created\nC created\nend of inner block\nC destroyed\nB destroyed\nend of main\nA destroyed\n",
      notes: [
        { line: 8, text: "Constructor with an initializer list: `name` is set before the body runs." },
        { line: 11, text: "Destructor: `~` plus the class name, no parameters." },
        { line: 22, text: "Leaving the block destroys C, then B — reverse order." },
        { line: 25, text: "`a` is destroyed after `return`, when `main`'s block ends." },
      ],
    },
    quickCheck: {
      prompt: "Which constructor runs for `Point q;` here?",
      code: r`class Point {
    int x, y;
public:
    Point(int px, int py) : x(px), y(py) {}
};`,
      options: [
        { id: "a", text: "Point(int, int) with zeros", feedback: "C++ doesn't invent arguments for you." },
        { id: "b", text: "A compiler-generated default constructor", feedback: "Once you write any constructor, the compiler stops generating the default one." },
        { id: "c", text: "None — it doesn't compile", feedback: "Right: there's no constructor that takes zero arguments." },
      ],
      correct: "c",
      explanation: "Declaring `Point(int, int)` removes the implicit default constructor. Add `Point() : x(0), y(0) {}` to allow `Point q;`.",
    },
    exercise: {
      title: "A self-simplifying fraction",
      prompt: `Complete the constructor of \`Fraction\` so every fraction is stored in **lowest terms** with a **positive denominator**:

- \`6/8\` → \`3/4\`, \`-2/4\` → \`-1/2\`, \`3/-9\` → \`-1/3\`, \`0/5\` → \`0/1\`.

You may assume the denominator is never 0. \`main\` reads \`q\` pairs and prints each fraction as \`n/d\`.`,
      starterCode: r`#include <iostream>
using namespace std;

int gcd(int a, int b) {
    if (a < 0) a = -a;
    if (b < 0) b = -b;
    while (b != 0) {
        int t = a % b;
        a = b;
        b = t;
    }
    return a;
}

class Fraction {
    int num, den;
public:
    Fraction(int n, int d) : num(n), den(d) {
        // Make den positive, then divide both by their gcd.
    }
    void print() const {
        cout << num << "/" << den << endl;
    }
};

int main() {
    int q;
    cin >> q;
    for (int i = 0; i < q; i++) {
        int n, d;
        cin >> n >> d;
        Fraction f(n, d);
        f.print();
    }
    return 0;
}`,
      tests: [
        { label: "6/8 and 10/5", input: "2\n6 8\n10 5\n", output: "3/4\n2/1", visibility: "sample", category: "normal" },
        { label: "signs", input: "3\n-2 4\n3 -9\n-4 -6\n", output: "-1/2\n-1/3\n2/3", visibility: "sample", category: "edge" },
        { label: "zero numerator", input: "1\n0 5\n", output: "0/1", visibility: "hidden", category: "edge" },
        { label: "already simple", input: "2\n7 13\n1 1\n", output: "7/13\n1/1", visibility: "hidden", category: "boundary" },
        { label: "large", input: "1\n1000000 -250000\n", output: "-4/1", visibility: "hidden", category: "normal" },
      ],
      compare: "tokens",
      hints: [
        "What two separate jobs does the constructor have to do?",
        "Fix the sign (denominator must be positive), and reduce by the greatest common divisor.",
        "If `den < 0`, flip the sign of both `num` and `den`. Then `int g = gcd(num, den);` and divide both by `g`.",
        "`gcd(0, 5)` is 5, so `0/5` becomes `0/1` automatically. Since `den` is never 0, `g` is never 0 either.",
      ],
      solution: r`#include <iostream>
using namespace std;

int gcd(int a, int b) {
    if (a < 0) a = -a;
    if (b < 0) b = -b;
    while (b != 0) {
        int t = a % b;
        a = b;
        b = t;
    }
    return a;
}

class Fraction {
    int num, den;
public:
    Fraction(int n, int d) : num(n), den(d) {
        if (den < 0) {
            num = -num;
            den = -den;
        }
        int g = gcd(num, den);
        num /= g;
        den /= g;
    }
    void print() const {
        cout << num << "/" << den << endl;
    }
};

int main() {
    int q;
    cin >> q;
    for (int i = 0; i < q; i++) {
        int n, d;
        cin >> n >> d;
        Fraction f(n, d);
        f.print();
    }
    return 0;
}`,
      solutionNotes: "The constructor establishes the rule (lowest terms, positive denominator) once, so every `Fraction` that exists already obeys it — no other function needs to check again.",
    },
    explainAgain: `A constructor is the **factory assembly line**: nothing leaves the factory half-built. A destructor is the **recycling step** when the product's life ends.

Objects in a block are like plates stacked in a sink: the last one you put on top is the first one you take off — so the last object created is the first destroyed.`,
    summary: [
      "A constructor (class name, no return type) runs when an object is created; use initializer lists.",
      "Writing any constructor removes the implicit default constructor.",
      "Destructors (`~Name`) run when an object's lifetime ends, in reverse order of creation.",
    ],
  },

  {
    id: "inheritance-polymorphism",
    moduleId: "oop",
    title: "Inheritance and polymorphism",
    minutes: 30,
    concepts: ["inheritance", "base class", "derived class", "virtual", "override", "abstract class", "polymorphism"],
    goals: [
      "Deriving a class from a base class and reusing its members",
      "Overriding `virtual` functions so the right version runs through a base pointer",
      "Pure virtual functions, abstract classes and virtual destructors",
    ],
    intro: `Many things share a common shape: circles and rectangles are both shapes; salaried and hourly staff are both employees. **Inheritance** lets a class build on another. **Polymorphism** lets one piece of code — "print every shape's area" — work with all of them, each answering in its own way.`,
    sections: [
      {
        title: "Base and derived classes",
        body: `\`\`\`cpp
class Animal {
public:
    string name;
    Animal(string n) : name(n) {}
};

class Dog : public Animal {          // Dog IS-A Animal
public:
    Dog(string n) : Animal(n) {}     // call the base constructor
    void fetch() { cout << name << " fetches\n"; }
};
\`\`\`

A \`Dog\` has everything an \`Animal\` has (\`name\`) plus its own extras. \`protected\` members are like private ones, but derived classes can use them too.`,
      },
      {
        title: "virtual and override",
        body: `\`\`\`cpp
class Animal {
public:
    virtual string sound() const { return "..."; }
    virtual ~Animal() = default;
};
class Dog : public Animal {
public:
    string sound() const override { return "Woof"; }
};

Animal* a = new Dog;
cout << a->sound();    // "Woof" — chosen at run time
\`\`\`

Because \`sound\` is **virtual**, calling it through an \`Animal*\` or \`Animal&\` runs the version of the **actual** object. Without \`virtual\` it would always run \`Animal::sound\`. \`override\` asks the compiler to check you really are overriding something (catching typos in the signature).`,
      },
      {
        title: "Abstract classes and virtual destructors",
        body: `\`virtual double area() const = 0;\` is a **pure virtual** function: no body, and every concrete derived class must provide one. A class with a pure virtual function is **abstract** — you can't create objects of it directly, only of its derived classes.

When objects are deleted through a base pointer (including via \`unique_ptr<Base>\`), the base class needs a **virtual destructor**, or the derived part is never cleaned up.`,
      },
    ],
    mistakes: [
      { title: "Forgetting virtual", body: "Without `virtual` in the base class, a call through a base pointer always runs the base version — the derived override is silently ignored." },
      { title: "Signature mismatch", body: "`string sound()` in Dog does not override `string sound() const` in Animal — it's a different function. Writing `override` turns this into a compile error instead of a silent bug." },
      { title: "Storing derived objects by value", body: "`vector<Animal>` slices every Dog down to a plain Animal. Store pointers instead: `vector<unique_ptr<Animal>>`." },
    ],
    example: {
      title: "Shapes answering for themselves",
      intro: "One loop asks every shape for its name and area; each class answers its own way.",
      code: r`#include <iostream>
#include <memory>
#include <string>
#include <vector>
using namespace std;

class Shape {
public:
    virtual string name() const = 0;
    virtual int area() const = 0;
    virtual ~Shape() = default;
};

class Rect : public Shape {
    int w, h;
public:
    Rect(int w_, int h_) : w(w_), h(h_) {}
    string name() const override { return "rect"; }
    int area() const override { return w * h; }
};

class Square : public Rect {
public:
    Square(int s) : Rect(s, s) {}
    string name() const override { return "square"; }
};

class Triangle : public Shape {
    int b, h;
public:
    Triangle(int b_, int h_) : b(b_), h(h_) {}
    string name() const override { return "triangle"; }
    int area() const override { return b * h / 2; }
};

int main() {
    vector<unique_ptr<Shape>> shapes;
    shapes.push_back(make_unique<Rect>(3, 4));
    shapes.push_back(make_unique<Square>(5));
    shapes.push_back(make_unique<Triangle>(6, 3));
    int total = 0;
    for (const auto& s : shapes) {
        cout << s->name() << ": " << s->area() << endl;
        total += s->area();
    }
    cout << "total: " << total << endl;
    return 0;
}`,
      output: "rect: 12\nsquare: 25\ntriangle: 9\ntotal: 46\n",
      notes: [
        { line: 9, text: "Pure virtual: every concrete shape must say what it's called." },
        { line: 11, text: "Virtual destructor: deleting through `Shape*` cleans up correctly." },
        { line: 22, text: "Square reuses Rect's area and only changes its name." },
        { line: 43, text: "`s->area()` runs the right version for each actual object." },
      ],
    },
    quickCheck: {
      prompt: "What is printed?",
      code: r`class A {
public:
    string who() const { return "A"; }
};
class B : public A {
public:
    string who() const { return "B"; }
};

int main() {
    B b;
    A& ref = b;
    cout << ref.who() << b.who();
}`,
      options: [
        { id: "a", text: "BB", feedback: "That would need `who` to be `virtual` in A." },
        { id: "b", text: "AB", feedback: "Right: without `virtual`, a call through an `A&` uses A's version." },
        { id: "c", text: "AA", feedback: "`b.who()` is called on a B directly, so B's version runs." },
      ],
      correct: "b",
      explanation: "Non-virtual calls are decided by the static type (`A&` → `A::who`). Make it `virtual` and both would print B.",
    },
    exercise: {
      title: "Payroll",
      prompt: `Complete two classes derived from the abstract \`Employee\`:

- \`Salaried(name, monthly)\` — pay is \`monthly\`.
- \`Hourly(name, rate, hours)\` — pay is \`rate × hours\`, but every hour **beyond 40** is paid at **double** the rate.

Each input line is \`S name monthly\` or \`H name rate hours\`. \`main\` prints \`name pay\` per employee and then \`total X\`.`,
      starterCode: r`#include <iostream>
#include <memory>
#include <string>
#include <vector>
using namespace std;

class Employee {
protected:
    string name;
public:
    Employee(string n) : name(n) {}
    string getName() const { return name; }
    virtual int pay() const = 0;
    virtual ~Employee() = default;
};

class Salaried : public Employee {
    int monthly;
public:
    Salaried(string n, int m) : Employee(n), monthly(m) {}
    int pay() const override {
        return 0;
    }
};

class Hourly : public Employee {
    int rate, hours;
public:
    Hourly(string n, int r, int h) : Employee(n), rate(r), hours(h) {}
    int pay() const override {
        return 0;
    }
};

int main() {
    int q;
    cin >> q;
    vector<unique_ptr<Employee>> staff;
    for (int i = 0; i < q; i++) {
        char kind;
        string name;
        cin >> kind >> name;
        if (kind == 'S') {
            int m;
            cin >> m;
            staff.push_back(make_unique<Salaried>(name, m));
        } else {
            int r, h;
            cin >> r >> h;
            staff.push_back(make_unique<Hourly>(name, r, h));
        }
    }
    int total = 0;
    for (const auto& e : staff) {
        cout << e->getName() << " " << e->pay() << endl;
        total += e->pay();
    }
    cout << "total " << total << endl;
    return 0;
}`,
      tests: [
        { label: "one of each", input: "2\nS asha 30000\nH ravi 200 45\n", output: "asha 30000\nravi 10000\ntotal 40000", visibility: "sample", category: "normal" },
        { label: "exactly 40 hours", input: "1\nH meena 150 40\n", output: "meena 6000\ntotal 6000", visibility: "hidden", category: "boundary" },
        { label: "under 40 hours", input: "1\nH dev 100 10\n", output: "dev 1000\ntotal 1000", visibility: "hidden", category: "normal" },
        { label: "mixed staff", input: "3\nH a 10 50\nS b 500\nH c 20 0\n", output: "a 600\nb 500\nc 0\ntotal 1100", visibility: "hidden", category: "edge" },
      ],
      compare: "lines",
      hints: [
        "`main` only ever talks to `Employee` pointers. Which function decides what each employee is paid?",
        "Each derived class overrides `pay()` with its own rule — that's polymorphism doing the work.",
        "Salaried: `return monthly;`. Hourly: split hours into normal hours (up to 40) and extra hours (above 40).",
        "`int extra = hours > 40 ? hours - 40 : 0; int normal = hours - extra; return normal * rate + extra * rate * 2;`",
      ],
      solution: r`#include <iostream>
#include <memory>
#include <string>
#include <vector>
using namespace std;

class Employee {
protected:
    string name;
public:
    Employee(string n) : name(n) {}
    string getName() const { return name; }
    virtual int pay() const = 0;
    virtual ~Employee() = default;
};

class Salaried : public Employee {
    int monthly;
public:
    Salaried(string n, int m) : Employee(n), monthly(m) {}
    int pay() const override {
        return monthly;
    }
};

class Hourly : public Employee {
    int rate, hours;
public:
    Hourly(string n, int r, int h) : Employee(n), rate(r), hours(h) {}
    int pay() const override {
        int extra = hours > 40 ? hours - 40 : 0;
        int normal = hours - extra;
        return normal * rate + extra * rate * 2;
    }
};

int main() {
    int q;
    cin >> q;
    vector<unique_ptr<Employee>> staff;
    for (int i = 0; i < q; i++) {
        char kind;
        string name;
        cin >> kind >> name;
        if (kind == 'S') {
            int m;
            cin >> m;
            staff.push_back(make_unique<Salaried>(name, m));
        } else {
            int r, h;
            cin >> r >> h;
            staff.push_back(make_unique<Hourly>(name, r, h));
        }
    }
    int total = 0;
    for (const auto& e : staff) {
        cout << e->getName() << " " << e->pay() << endl;
        total += e->pay();
    }
    cout << "total " << total << endl;
    return 0;
}`,
      solutionNotes: "`main` never checks what kind of employee it has: `e->pay()` dispatches to the right override at run time. Adding a third kind of employee later wouldn't change `main` at all.",
    },
    explainAgain: `Think of a **remote control** labelled "play". Point it at a TV, a music system or a projector and each does its own kind of playing. The remote (a base-class pointer) doesn't need to know which device it's aimed at — the device decides. That's polymorphism; \`virtual\` is what lets the device decide.`,
    summary: [
      "`class D : public B` makes D a B with extras; call the base constructor in the initializer list.",
      "`virtual` + `override` let calls through a base pointer/reference run the derived version.",
      "Pure virtual (`= 0`) makes a class abstract; give polymorphic bases a virtual destructor.",
    ],
  },
];
