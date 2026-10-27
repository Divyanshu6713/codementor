import type { QuestionDef } from "../types";
import { LPR, PAR } from "./helpers";

/**
 * Practice banks: pointers, OOP, the STL, modern C++, streams & exceptions, and advanced C++.
 * Verified with g++ by tests/question-bank.test.ts.
 */
export const CORE_CPP_QUESTIONS: QuestionDef[] = [
  // ── Pointers ──────────────────────────────────────────────────────────────
  {
    id: "pt-deref", type: "predict_output", conceptId: "pointers", difficulty: 1,
    skills: [{ id: "pointer_basics" }], purposes: LPR,
    prompt: "What does this print?",
    code: `int x = 10;
int* p = &x;
*p = 25;
cout << x;`,
    options: [
      { id: "a", text: "25" },
      { id: "b", text: "10", feedback: "p points at x, so writing through *p changes x." },
      { id: "c", text: "The address of x" },
      { id: "d", text: "It doesn't compile" },
    ],
    correct: "a",
    hints: [
      "What does `&x` give?",
      "The address of x — so p points at x.",
      "What does `*p = 25` change?",
      "*p is the thing p points at: x itself.",
      "x becomes 25.",
    ],
    explanation: "p holds x's address, so `*p = 25` stores 25 in x.",
  },
  {
    id: "pt-two-pointers", type: "predict_output", conceptId: "pointers", difficulty: 2,
    skills: [{ id: "pointer_basics" }], purposes: LPR,
    prompt: "What does this print?",
    code: `int a = 1, b = 2;
int* p = &a;
int* q = p;
*q = 7;
p = &b;
*p = 9;
cout << a << " " << b;`,
    options: [
      { id: "a", text: "7 9" },
      { id: "b", text: "9 2", feedback: "p is moved to point at b before *p = 9." },
      { id: "c", text: "1 9" },
      { id: "d", text: "7 2" },
    ],
    correct: "a",
    hints: [
      "After `int* q = p;`, where does q point?",
      "At a — the same place as p.",
      "*q = 7 changes a.",
      "Then p is redirected to b, and *p = 9 changes b.",
      "a = 7, b = 9.",
    ],
    explanation: "q copies p's address (a), so *q = 7 sets a. Then p points at b and *p = 9 sets b.",
  },
  {
    id: "pt-arith", type: "predict_output", conceptId: "pointers", difficulty: 2,
    skills: [{ id: "pointer_arithmetic" }], purposes: LPR,
    prompt: "What does this print?",
    code: `int a[] = {5, 10, 15, 20};
int* p = a;
cout << *(p + 2) << " " << *p + 2;`,
    options: [
      { id: "a", text: "15 7" },
      { id: "b", text: "15 15", feedback: "`*p + 2` dereferences first (5), then adds 2." },
      { id: "c", text: "7 15" },
      { id: "d", text: "10 7" },
    ],
    correct: "a",
    hints: [
      "Where does p point — which element?",
      "An array name gives a pointer to element 0.",
      "p + 2 points two elements further: a[2].",
      "`*p + 2` means (*p) + 2.",
      "a[2] and a[0] + 2.",
    ],
    explanation: "`*(p + 2)` is a[2] = 15. `*p + 2` is a[0] + 2 = 7 — * binds tighter than +.",
  },
  {
    id: "pt-ref-vs-ptr", type: "mcq", conceptId: "pointers", difficulty: 3,
    skills: [{ id: "pointer_arithmetic" }, { id: "pointer_basics", weight: 0.5 }], purposes: LPR,
    prompt: "Which statement about references (`int& r = x;`) is true?",
    options: [
      { id: "a", text: "A reference must be bound when it's created and can't be re-pointed to another variable" },
      { id: "b", text: "A reference can be null", feedback: "References always refer to an object; pointers can be null." },
      { id: "c", text: "You need *r to read the value", feedback: "A reference is used like the variable itself — no *." },
      { id: "d", text: "`r = y;` makes r refer to y", feedback: "That assigns y's value to x, through r." },
    ],
    correct: "a",
    hints: [
      "Can you write `int& r;` with nothing after it?",
      "No — a reference must be initialised.",
      "What does `r = y;` do then?",
      "It assigns through r into x; r still refers to x.",
      "References are fixed aliases.",
    ],
    explanation: "A reference is an alias fixed at creation. It can't be null or re-seated; assignment through it changes the original.",
  },
  {
    id: "pt-dangling", type: "identify_error", conceptId: "pointers", difficulty: 4,
    skills: [{ id: "dynamic_memory" }], purposes: LPR,
    prompt: "What's wrong with this function?",
    code: `int* makeNumber() {
    int n = 42;
    return &n;
}`,
    options: [
      { id: "a", text: "It returns the address of a local variable that no longer exists after the function returns" },
      { id: "b", text: "Functions can't return pointers", feedback: "They can — but this one points at something that's gone." },
      { id: "c", text: "It should return `*n`" },
      { id: "d", text: "Nothing is wrong" },
    ],
    correct: "a",
    hints: [
      "Where does n live, and for how long?",
      "n is a local variable on the stack.",
      "When the function returns, its locals are destroyed.",
      "The returned pointer dangles.",
      "Return the value (int), or allocate with new / use a smart pointer.",
    ],
    explanation: "n is destroyed when the function returns, so the pointer dangles. Return the int itself instead.",
  },
  {
    id: "pt-new-delete", type: "complete_code", conceptId: "pointers", difficulty: 3,
    skills: [{ id: "dynamic_memory" }], purposes: LPR,
    prompt: "Fill in the blank to free the array allocated with `new int[n]`.",
    code: `int n = 5;
int* data = new int[n];
data[0] = 1;
____ data;`,
    accepted: ["delete[]", "delete []"],
    wrongAnswers: [{ answer: "delete", feedback: "Memory from `new[]` must be freed with `delete[]`." }, { answer: "free", feedback: "free is for malloc. Use delete[] with new[]." }],
    hints: [
      "How was the memory allocated — one int or an array?",
      "`new int[n]` allocates an array.",
      "Each form of new has a matching delete.",
      "The array form has square brackets.",
      "delete___",
    ],
    explanation: "Memory from `new[]` must be released with `delete[]`.",
  },
  {
    id: "pt-unique", type: "predict_output", conceptId: "pointers", difficulty: 3,
    skills: [{ id: "dynamic_memory" }], purposes: LPR,
    prompt: "What does this print?",
    code: `auto p = make_unique<int>(5);
*p += 1;
unique_ptr<int> q = move(p);
cout << *q << " " << (p == nullptr);`,
    options: [
      { id: "a", text: "6 1" },
      { id: "b", text: "6 0", feedback: "Moving a unique_ptr leaves the source empty (null)." },
      { id: "c", text: "5 1" },
      { id: "d", text: "It doesn't compile: unique_ptr can't be moved", feedback: "It can't be *copied*; moving is allowed." },
    ],
    correct: "a",
    hints: [
      "What value does the int hold after `*p += 1`?",
      "A unique_ptr has exactly one owner.",
      "move(p) transfers ownership to q.",
      "What's left in p?",
      "Nothing — p is null.",
    ],
    explanation: "The value becomes 6; moving transfers ownership to q and leaves p null, so `p == nullptr` prints 1.",
  },
  {
    id: "pt-leak", type: "mcq", conceptId: "pointers", difficulty: 3,
    skills: [{ id: "dynamic_memory" }], purposes: LPR,
    prompt: "A loop runs `int* p = new int[1000];` a million times and never deletes. What happens?",
    options: [
      { id: "a", text: "A memory leak: the program keeps using more memory until it may run out" },
      { id: "b", text: "Nothing — memory is freed automatically at the end of each iteration", feedback: "Only memory from `new` needs a `delete`; it isn't freed automatically." },
      { id: "c", text: "It doesn't compile" },
      { id: "d", text: "The pointer p is leaked, but the memory is reused", feedback: "p is a local variable; the 1000 ints it pointed to are what's leaked." },
    ],
    correct: "a",
    hints: [
      "Who frees memory from new?",
      "Only an explicit delete (or a smart pointer).",
      "p is reassigned each time — the old block's address is lost.",
      "Lost blocks can never be freed.",
      "That's called a leak.",
    ],
    explanation: "Each `new` allocates memory that's never freed and whose address is lost — a leak. Prefer vector or unique_ptr.",
  },
  {
    id: "pt-swap-ptr", type: "complete_code", conceptId: "pointers", difficulty: 2,
    skills: [{ id: "pointer_basics" }, { id: "pointer_arithmetic", weight: 0.5 }], purposes: LPR,
    prompt: "Fill in the blank so the function adds 1 to the int that `p` points to.",
    code: `void bump(int* p) {
    ____ += 1;
}`,
    accepted: ["*p", "(*p)", "p[0]"],
    wrongAnswers: [{ answer: "p", feedback: "That moves the pointer to the next int instead of changing the value." }, { answer: "&p", feedback: "&p is the address of the pointer itself." }],
    hints: [
      "Do you want to change the pointer or what it points to?",
      "What it points to.",
      "Which operator follows a pointer to its target?",
      "Dereference with *.",
      "*___",
    ],
    explanation: "`*p += 1;` changes the int that p points at. `p += 1` would just move the pointer.",
  },

  // ── OOP ───────────────────────────────────────────────────────────────────
  {
    id: "oo-method", type: "predict_output", conceptId: "oop", difficulty: 1,
    skills: [{ id: "class_basics" }], purposes: LPR,
    prompt: "What does this print?",
    code: `class Counter {
public:
    int value = 0;
    void add(int n) { value += n; }
};

int main() {
    Counter a, b;
    a.add(3);
    a.add(4);
    b.add(1);
    cout << a.value << " " << b.value;
    return 0;
}`,
    options: [
      { id: "a", text: "7 1" },
      { id: "b", text: "8 8", feedback: "Each object has its own `value`." },
      { id: "c", text: "4 1" },
      { id: "d", text: "7 8" },
    ],
    correct: "a",
    hints: [
      "Do a and b share `value`?",
      "Each object has its own copy of every member variable.",
      "a.add is called twice, b.add once.",
      "a: 0 + 3 + 4. b: 0 + 1.",
      "7 and 1.",
    ],
    explanation: "Each object has its own `value`: a gets 3 + 4 = 7 and b gets 1.",
  },
  {
    id: "oo-private", type: "identify_error", conceptId: "oop", difficulty: 2,
    skills: [{ id: "class_basics" }], purposes: LPR,
    prompt: "Why doesn't this compile?",
    code: `class Account {
    double balance = 0;
public:
    void deposit(double amt) { balance += amt; }
};

int main() {
    Account acc;
    acc.balance = 1000000;
    return 0;
}`,
    options: [
      { id: "a", text: "balance is private (members of a class are private by default), so main can't access it" },
      { id: "b", text: "double members can't have a default value" },
      { id: "c", text: "deposit must be called first" },
      { id: "d", text: "Objects must be created with new" },
    ],
    correct: "a",
    hints: [
      "Which section is `balance` declared in?",
      "It's before `public:`.",
      "What is the default access in a class?",
      "In a class, members are private until you say otherwise.",
      "Only the class's own functions can touch balance.",
    ],
    explanation: "In a class, members before any access label are private. main must use deposit() — that's encapsulation.",
  },
  {
    id: "oo-ctor", type: "predict_output", conceptId: "oop", difficulty: 2,
    skills: [{ id: "constructors" }], purposes: LPR,
    prompt: "What does this print?",
    code: `class Point {
public:
    int x, y;
    Point() : x(0), y(0) {}
    Point(int a, int b) : x(a), y(b) {}
};

int main() {
    Point p;
    Point q(3, 4);
    cout << p.x + p.y << " " << q.x * q.y;
    return 0;
}`,
    options: [
      { id: "a", text: "0 12" },
      { id: "b", text: "7 12" },
      { id: "c", text: "0 7" },
      { id: "d", text: "It doesn't compile: two constructors", feedback: "Constructors can be overloaded like any function." },
    ],
    correct: "a",
    hints: [
      "Which constructor does `Point p;` use?",
      "The one with no parameters.",
      "Which does `Point q(3, 4);` use?",
      "The two-int constructor sets x = 3, y = 4.",
      "0 + 0 and 3 × 4.",
    ],
    explanation: "p uses the default constructor (0, 0); q uses the (3, 4) one. 0 + 0 = 0 and 3 × 4 = 12.",
  },
  {
    id: "oo-dtor-order", type: "predict_output", conceptId: "oop", difficulty: 4,
    skills: [{ id: "constructors" }], purposes: LPR,
    prompt: "What does this print?",
    code: `struct Noisy {
    char name;
    Noisy(char n) : name(n) { cout << "+" << name; }
    ~Noisy() { cout << "-" << name; }
};

int main() {
    Noisy a('A');
    {
        Noisy b('B');
    }
    Noisy c('C');
    return 0;
}`,
    options: [
      { id: "a", text: "+A+B-B+C-C-A" },
      { id: "b", text: "+A+B+C-A-B-C", feedback: "b is destroyed when its inner block ends, and objects die in reverse order." },
      { id: "c", text: "+A+B+C-C-B-A", feedback: "b's block ends before c is created." },
      { id: "d", text: "+A-A+B-B+C-C" },
    ],
    correct: "a",
    hints: [
      "When does a local object's destructor run?",
      "When its block (the braces it's in) ends.",
      "b lives only in the inner block.",
      "At the end of main, objects are destroyed in reverse order of creation.",
      "A, B (dies), C, then C and A die.",
    ],
    explanation: "b is destroyed at the end of its block. At the end of main, c then a are destroyed — reverse order of creation.",
  },
  {
    id: "oo-virtual", type: "predict_output", conceptId: "oop", difficulty: 3,
    skills: [{ id: "inheritance_poly" }], purposes: LPR,
    prompt: "What does this print?",
    code: `struct Animal {
    virtual string sound() { return "..."; }
    virtual ~Animal() {}
};
struct Dog : Animal {
    string sound() override { return "Woof"; }
};

int main() {
    Dog d;
    Animal& a = d;
    cout << a.sound();
    return 0;
}`,
    options: [
      { id: "a", text: "Woof" },
      { id: "b", text: "...", feedback: "sound is virtual, so the real (Dog) version runs even through an Animal&." },
      { id: "c", text: "...Woof" },
      { id: "d", text: "It doesn't compile" },
    ],
    correct: "a",
    hints: [
      "What kind of object does a really refer to?",
      "A Dog.",
      "What does `virtual` change?",
      "Virtual calls use the actual object's type at run time.",
      "Dog's version runs.",
    ],
    explanation: "Because sound() is virtual, calling it through an Animal& runs Dog's override: Woof.",
  },
  {
    id: "oo-novirtual", type: "predict_output", conceptId: "oop", difficulty: 4,
    skills: [{ id: "inheritance_poly" }], purposes: LPR,
    prompt: "Same as before, but without `virtual`. What does this print?",
    code: `struct Animal {
    string sound() { return "..."; }
};
struct Dog : Animal {
    string sound() { return "Woof"; }
};

int main() {
    Dog d;
    Animal& a = d;
    cout << a.sound() << " " << d.sound();
    return 0;
}`,
    options: [
      { id: "a", text: "... Woof" },
      { id: "b", text: "Woof Woof", feedback: "Without virtual, the call is decided by the reference's type (Animal)." },
      { id: "c", text: "... ..." },
      { id: "d", text: "Woof ..." },
    ],
    correct: "a",
    hints: [
      "Is sound() virtual now?",
      "No — so the compiler picks the version from the *declared* type.",
      "a is declared as Animal&.",
      "d is declared as Dog.",
      "Animal's version, then Dog's.",
    ],
    explanation: "Without virtual, a.sound() uses Animal's version (the declared type). d.sound() uses Dog's.",
  },
  {
    id: "oo-blank-public", type: "complete_code", conceptId: "oop", difficulty: 1,
    skills: [{ id: "class_basics" }], purposes: LPR,
    prompt: "Fill in the access label so code outside the class can call `area()`.",
    code: `class Square {
    double side = 2;
____:
    double area() { return side * side; }
};`,
    accepted: ["public"],
    wrongAnswers: [{ answer: "private", feedback: "private would hide area() from outside code." }, { answer: "protected", feedback: "protected is visible only to the class and derived classes." }],
    hints: [
      "Who should be able to call area()?",
      "Code outside the class.",
      "Which access label allows that?",
      "The opposite of private.",
      "p _ _ _ _ _",
    ],
    explanation: "`public:` makes area() callable from outside; side stays private.",
  },
  {
    id: "oo-blank-override", type: "complete_code", conceptId: "oop", difficulty: 3,
    skills: [{ id: "inheritance_poly" }], purposes: LPR,
    prompt: "Fill in the keyword that makes the base class's `area()` overridable at run time.",
    code: `struct Shape {
    ____ double area() const { return 0; }
    virtual ~Shape() {}
};`,
    accepted: ["virtual"],
    wrongAnswers: [{ answer: "override", feedback: "override goes on the *derived* class's function." }, { answer: "static", feedback: "static functions don't belong to an object at all." }],
    hints: [
      "Which keyword enables polymorphism?",
      "It goes on the base class function.",
      "The destructor below already uses it.",
      "Derived classes then mark theirs with `override`.",
      "v _ _ _ _ _ _",
    ],
    explanation: "`virtual` lets derived classes override area() and have their version called through a Shape& or Shape*.",
  },
  {
    id: "oo-code-rect", type: "write_code", conceptId: "oop", difficulty: 3,
    skills: [{ id: "class_basics" }, { id: "constructors" }], purposes: PAR,
    prompt: "Write a class `Rect` with private `width` and `height`, a constructor `Rect(int w, int h)`, and public methods `area()` and `perimeter()`. In `main`, read w and h, create a Rect, and print its area and perimeter separated by a space.",
    starterCode: `#include <iostream>
using namespace std;

// Write class Rect here

int main() {
    int w, h;
    cin >> w >> h;
    // Create a Rect and print its area and perimeter

    return 0;
}`,
    tests: [
      { label: "3 × 4", input: "3 4\n", output: "12 14", visibility: "sample", category: "normal" },
      { label: "square", input: "5 5\n", output: "25 20", visibility: "visible", category: "normal" },
      { label: "1 × 1", input: "1 1\n", output: "1 4", visibility: "hidden", category: "boundary" },
      { label: "long thin", input: "100 1\n", output: "100 202", visibility: "hidden", category: "edge" },
    ],
    compare: "tokens",
    referenceSolution: `#include <iostream>
using namespace std;

class Rect {
    int width, height;
public:
    Rect(int w, int h) : width(w), height(h) {}
    int area() const { return width * height; }
    int perimeter() const { return 2 * (width + height); }
};

int main() {
    int w, h;
    cin >> w >> h;
    Rect r(w, h);
    cout << r.area() << " " << r.perimeter() << endl;
    return 0;
}`,
    solutionWalkthrough: "Keep the data private, set it once in the constructor's initializer list, and expose the two calculations as const methods.",
    detectors: [],
    hints: [
      "What data does a rectangle need?",
      "width and height — keep them private.",
      "The constructor stores w and h: `Rect(int w, int h) : width(w), height(h) {}`.",
      "area = w × h, perimeter = 2(w + h).",
      "Rect r(w, h);\ncout << r.area() << \" \" << r.perimeter();",
    ],
    explanation: "Private fields set by the constructor; public area() and perimeter().",
  },

  // ── STL ───────────────────────────────────────────────────────────────────
  {
    id: "sl-vector", type: "predict_output", conceptId: "stl", difficulty: 1,
    skills: [{ id: "vector_ops" }], purposes: LPR,
    prompt: "What does this print?",
    code: `vector<int> v = {4, 8};
v.push_back(15);
v.push_back(16);
v.pop_back();
cout << v.size() << " " << v.back();`,
    options: [
      { id: "a", text: "3 15" },
      { id: "b", text: "4 16", feedback: "pop_back removes the last element (16)." },
      { id: "c", text: "3 16" },
      { id: "d", text: "2 8" },
    ],
    correct: "a",
    hints: [
      "Write the vector out after each line.",
      "push_back adds at the end.",
      "pop_back removes from the end.",
      "back() is the last element.",
      "{4, 8, 15}.",
    ],
    explanation: "After the pushes {4, 8, 15, 16}; pop_back removes 16, leaving 3 elements with 15 last.",
  },
  {
    id: "sl-erase-loop", type: "identify_error", conceptId: "stl", difficulty: 4,
    skills: [{ id: "vector_ops" }, { id: "stl_algorithms", weight: 0.5 }], purposes: LPR,
    prompt: "This is meant to remove every even number but skips some. Why?",
    code: `vector<int> v = {2, 4, 5, 6};
for (int i = 0; i < (int)v.size(); i++) {
    if (v[i] % 2 == 0) v.erase(v.begin() + i);
}`,
    options: [
      { id: "a", text: "After erasing, the next element shifts into index i, but i++ skips past it" },
      { id: "b", text: "erase can't be used inside a loop" },
      { id: "c", text: "v.size() should be stored before the loop", feedback: "That would make it worse — the size changes as you erase." },
      { id: "d", text: "% doesn't work on vector elements" },
    ],
    correct: "a",
    hints: [
      "Trace it: i = 0, v[0] = 2 is erased. What's at index 0 now?",
      "4 moved into index 0.",
      "Then i becomes 1. Was 4 checked?",
      "Elements after an erased one shift left.",
      "Only i++ when you didn't erase — or use the erase-remove idiom.",
    ],
    explanation: "Erasing shifts later elements left, so i++ skips the one that moved into position i. Advance only when nothing was erased, or use `v.erase(remove_if(...), v.end())`.",
  },
  {
    id: "sl-map-count", type: "predict_output", conceptId: "stl", difficulty: 2,
    skills: [{ id: "map_set" }], purposes: LPR,
    prompt: "What does this print?",
    code: `map<string, int> freq;
string words[] = {"cat", "dog", "cat", "ant", "cat"};
for (string w : words) freq[w]++;
for (auto& [word, n] : freq) cout << word << n << " ";`,
    options: [
      { id: "a", text: "ant1 cat3 dog1" },
      { id: "b", text: "cat3 dog1 ant1", feedback: "A map keeps its keys sorted, not in insertion order." },
      { id: "c", text: "cat1 dog1 cat2 ant1 cat3" },
      { id: "d", text: "ant1 cat1 dog1" },
    ],
    correct: "a",
    hints: [
      "What does `freq[w]++` do the first time w is seen?",
      "It creates the entry with 0, then adds 1.",
      "How many times does each word appear?",
      "In what order does a map visit its keys?",
      "Sorted alphabetically.",
    ],
    explanation: "freq counts each word; std::map iterates in sorted key order: ant, cat, dog.",
  },
  {
    id: "sl-set", type: "predict_output", conceptId: "stl", difficulty: 2,
    skills: [{ id: "map_set" }], purposes: LPR,
    prompt: "What does this print?",
    code: `set<int> s = {5, 1, 5, 3, 1};
s.insert(4);
cout << s.size() << ": ";
for (int x : s) cout << x << " ";`,
    options: [
      { id: "a", text: "4: 1 3 4 5" },
      { id: "b", text: "6: 1 1 3 4 5 5", feedback: "A set keeps only one copy of each value." },
      { id: "c", text: "4: 5 1 3 4", feedback: "A set is sorted." },
      { id: "d", text: "5: 1 3 4 5" },
    ],
    correct: "a",
    hints: [
      "Can a set hold duplicates?",
      "No — each value appears once.",
      "Which distinct values are there after inserting 4?",
      "In what order does a set store them?",
      "Sorted ascending.",
    ],
    explanation: "Duplicates are dropped: {1, 3, 4, 5}, stored in sorted order.",
  },
  {
    id: "sl-stack", type: "predict_output", conceptId: "stl", difficulty: 2,
    skills: [{ id: "stack_queue" }], purposes: LPR,
    prompt: "What does this print?",
    code: `stack<int> st;
queue<int> q;
for (int i = 1; i <= 3; i++) { st.push(i); q.push(i); }
cout << st.top() << q.front();
st.pop(); q.pop();
cout << st.top() << q.front();`,
    options: [
      { id: "a", text: "3122" },
      { id: "b", text: "1132", feedback: "A stack gives back the *last* item pushed." },
      { id: "c", text: "3132" },
      { id: "d", text: "3121" },
    ],
    correct: "a",
    hints: [
      "Which item is on top of a stack?",
      "The most recently pushed (last in, first out).",
      "Which item is at the front of a queue?",
      "The first pushed (first in, first out).",
      "Top 3, front 1; after popping: 2 and 2.",
    ],
    explanation: "Stack is LIFO (top 3, then 2); queue is FIFO (front 1, then 2): 3 1 2 2.",
  },
  {
    id: "sl-sort", type: "predict_output", conceptId: "stl", difficulty: 2,
    skills: [{ id: "stl_algorithms" }], purposes: LPR,
    prompt: "What does this print?",
    code: `vector<int> v = {5, 2, 9, 1};
sort(v.begin(), v.end(), greater<int>());
reverse(v.begin(), v.begin() + 2);
for (int x : v) cout << x;`,
    options: [
      { id: "a", text: "5921" },
      { id: "b", text: "9521", feedback: "Then the first two elements are reversed." },
      { id: "c", text: "1259" },
      { id: "d", text: "2591" },
    ],
    correct: "a",
    hints: [
      "What does `greater<int>()` do to the sort order?",
      "Sorts largest first: 9 5 2 1.",
      "reverse(begin, begin + 2) reverses which elements?",
      "Only the first two.",
      "9 5 → 5 9.",
    ],
    explanation: "Sorting descending gives 9 5 2 1; reversing the first two gives 5 9 2 1.",
  },
  {
    id: "sl-find", type: "complete_code", conceptId: "stl", difficulty: 3,
    skills: [{ id: "stl_algorithms" }], purposes: LPR,
    prompt: "Fill in the condition that is true when `find` did *not* find 7.",
    code: `vector<int> v = {1, 3, 5};
auto it = find(v.begin(), v.end(), 7);
if (____) cout << "not found";`,
    accepted: ["it == v.end()", "v.end() == it", "it==v.end()"],
    wrongAnswers: [{ answer: "it == -1", feedback: "find returns an iterator, not an index. A miss returns v.end()." }, { answer: "it == nullptr", feedback: "A miss returns the end iterator, not nullptr." }],
    hints: [
      "What does find return when the value isn't there?",
      "It returns the range's end.",
      "An iterator, not -1.",
      "Compare it with v.end().",
      "it == ___",
    ],
    explanation: "find returns the end iterator when nothing matches: `it == v.end()`.",
  },
  {
    id: "sl-map-lookup", type: "mcq", conceptId: "stl", difficulty: 3,
    skills: [{ id: "map_set" }], purposes: LPR,
    prompt: "`map<string,int> ages;` is empty. What does `cout << ages[\"Ravi\"];` do?",
    options: [
      { id: "a", text: "Prints 0 — and inserts \"Ravi\" into the map" },
      { id: "b", text: "Throws an exception", feedback: "That's what ages.at(\"Ravi\") would do." },
      { id: "c", text: "Prints nothing and leaves the map empty" },
      { id: "d", text: "Doesn't compile" },
    ],
    correct: "a",
    hints: [
      "What does operator[] do with a missing key?",
      "It creates the entry.",
      "With what value?",
      "A default-constructed int: 0.",
      "Use count() or find() to check without inserting.",
    ],
    explanation: "map's [] inserts a missing key with a default value (0) — so just looking can add entries. Use find/count/at to avoid that.",
  },
  {
    id: "sl-accumulate", type: "predict_output", conceptId: "stl", difficulty: 2,
    skills: [{ id: "stl_algorithms" }, { id: "vector_ops", weight: 0.5 }], purposes: LPR,
    prompt: "What does this print?",
    code: `vector<int> v = {3, 1, 4, 1, 5};
cout << accumulate(v.begin(), v.end(), 0) << " "
     << count(v.begin(), v.end(), 1) << " "
     << *max_element(v.begin(), v.end());`,
    options: [
      { id: "a", text: "14 2 5" },
      { id: "b", text: "14 1 5", feedback: "count counts how many elements equal 1." },
      { id: "c", text: "15 2 5" },
      { id: "d", text: "14 2 4" },
    ],
    correct: "a",
    hints: [
      "accumulate adds everything to a starting value.",
      "3 + 1 + 4 + 1 + 5 = ?",
      "count(…, 1) counts elements equal to 1.",
      "max_element returns an iterator to the largest.",
      "Sum, number of 1s, largest.",
    ],
    explanation: "Sum is 14, there are two 1s, and the largest element is 5.",
  },
  {
    id: "sl-queue-mcq", type: "mcq", conceptId: "stl", difficulty: 2,
    skills: [{ id: "stack_queue" }], purposes: LPR,
    prompt: "Which container fits checking that brackets like `({[]})` are balanced?",
    options: [
      { id: "a", text: "stack — the most recent opening bracket must close first" },
      { id: "b", text: "queue", feedback: "A queue gives back the *oldest* opening bracket, but the newest must close first." },
      { id: "c", text: "set", feedback: "A set loses order and duplicates." },
      { id: "d", text: "map" },
    ],
    correct: "a",
    hints: [
      "In `([)]`, which opener must `)` match?",
      "The most recently opened one.",
      "Which container gives back the most recent item?",
      "Last in, first out.",
      "s _ _ _ _",
    ],
    explanation: "Brackets close in reverse order of opening — last in, first out — which is a stack.",
  },
  {
    id: "sl-pair-sort", type: "predict_output", conceptId: "stl", difficulty: 3,
    skills: [{ id: "stl_algorithms" }, { id: "vector_ops", weight: 0.5 }], purposes: LPR,
    prompt: "What does this print?",
    code: `vector<pair<int, string>> v = {{3, "c"}, {1, "z"}, {3, "a"}, {2, "m"}};
sort(v.begin(), v.end());
for (auto& [n, s] : v) cout << n << s << " ";`,
    options: [
      { id: "a", text: "1z 2m 3a 3c" },
      { id: "b", text: "1z 2m 3c 3a", feedback: "Pairs compare by first, then by second when the firsts are equal." },
      { id: "c", text: "3a 3c 2m 1z" },
      { id: "d", text: "1z 3a 2m 3c" },
    ],
    correct: "a",
    hints: [
      "How does sort compare two pairs?",
      "By .first first.",
      "If .first is equal, by .second.",
      "Two pairs start with 3: compare \"c\" and \"a\".",
      "Ascending by number, ties by letter.",
    ],
    explanation: "Pairs sort by first, then by second: 1z, 2m, then 3a before 3c.",
  },
  {
    id: "sl-code-unique", type: "write_code", conceptId: "stl", difficulty: 3,
    skills: [{ id: "map_set" }, { id: "vector_ops" }], purposes: PAR,
    prompt: "Read `n` and then n words. Print each distinct word once, in the order it first appeared, separated by spaces.",
    starterCode: `#include <iostream>
#include <string>
#include <vector>
#include <set>
using namespace std;

int main() {
    int n;
    cin >> n;
    // Read n words and print each distinct word once, in first-seen order

    return 0;
}`,
    tests: [
      { label: "repeats", input: "6\nred blue red green blue red\n", output: "red blue green", visibility: "sample", category: "normal" },
      { label: "all same", input: "3\nhi hi hi\n", output: "hi", visibility: "visible", category: "edge" },
      { label: "all different", input: "3\nc b a\n", output: "c b a", visibility: "hidden", category: "normal" },
      { label: "one word", input: "1\nsolo\n", output: "solo", visibility: "hidden", category: "boundary" },
    ],
    compare: "tokens",
    referenceSolution: `#include <iostream>
#include <string>
#include <vector>
#include <set>
using namespace std;

int main() {
    int n;
    cin >> n;
    set<string> seen;
    vector<string> order;
    for (int i = 0; i < n; i++) {
        string w;
        cin >> w;
        if (!seen.count(w)) {
            seen.insert(w);
            order.push_back(w);
        }
    }
    for (size_t i = 0; i < order.size(); i++) cout << (i ? " " : "") << order[i];
    cout << endl;
    return 0;
}`,
    solutionWalkthrough: "A set answers \"have I seen this word?\" quickly, but it's sorted — so keep a vector for the first-seen order and only push a word the first time.",
    detectors: [],
    hints: [
      "Which container tells you quickly whether you've seen a word?",
      "A set — but its order is sorted, not first-seen.",
      "Use two containers: a set for \"seen\", a vector for the order.",
      "Push to the vector only when the set didn't have the word.",
      "if (!seen.count(w)) { seen.insert(w); order.push_back(w); }",
    ],
    explanation: "Track seen words in a set; keep first occurrences in a vector.",
  },

  // ── Modern C++ ────────────────────────────────────────────────────────────
  {
    id: "mc-lambda", type: "predict_output", conceptId: "modern-cpp", difficulty: 2,
    skills: [{ id: "auto_lambda" }], purposes: LPR,
    prompt: "What does this print?",
    code: `int bonus = 10;
auto add = [bonus](int x) { return x + bonus; };
bonus = 100;
cout << add(5);`,
    options: [
      { id: "a", text: "15" },
      { id: "b", text: "105", feedback: "[bonus] captures a *copy* when the lambda is created." },
      { id: "c", text: "5" },
      { id: "d", text: "It doesn't compile" },
    ],
    correct: "a",
    hints: [
      "What does [bonus] mean in the capture list?",
      "Capture bonus by value — a copy.",
      "When is that copy taken?",
      "When the lambda is created, while bonus is 10.",
      "5 + 10.",
    ],
    explanation: "[bonus] copies bonus (10) when the lambda is created; changing bonus later doesn't affect it.",
  },
  {
    id: "mc-lambda-ref", type: "predict_output", conceptId: "modern-cpp", difficulty: 3,
    skills: [{ id: "auto_lambda" }], purposes: LPR,
    prompt: "What does this print?",
    code: `int total = 0;
vector<int> v = {1, 2, 3, 4};
for_each(v.begin(), v.end(), [&total](int x) { total += x * x; });
cout << total;`,
    options: [
      { id: "a", text: "30" },
      { id: "b", text: "0", feedback: "[&total] captures by reference, so the lambda changes the real total." },
      { id: "c", text: "10" },
      { id: "d", text: "100" },
    ],
    correct: "a",
    hints: [
      "What does [&total] capture?",
      "A reference to total.",
      "The lambda is called once per element.",
      "Each call adds x².",
      "1 + 4 + 9 + 16.",
    ],
    explanation: "Capturing by reference lets the lambda update total: 1 + 4 + 9 + 16 = 30.",
  },
  {
    id: "mc-auto", type: "mcq", conceptId: "modern-cpp", difficulty: 2,
    skills: [{ id: "auto_lambda" }], purposes: LPR,
    prompt: "What type does `x` have in `auto x = 7 / 2;`?",
    options: [
      { id: "a", text: "int (and its value is 3)" },
      { id: "b", text: "double (3.5)", feedback: "auto takes the type of the expression, and int / int is int." },
      { id: "c", text: "auto is a type of its own" },
      { id: "d", text: "It can't be known until the program runs", feedback: "auto is resolved by the compiler." },
    ],
    correct: "a",
    hints: [
      "auto copies the type of the expression on the right.",
      "What's the type of 7 / 2?",
      "Both operands are ints.",
      "So it's integer division.",
      "int, value 3.",
    ],
    explanation: "auto deduces the expression's type at compile time: `7 / 2` is an int, 3.",
  },
  {
    id: "mc-template", type: "predict_output", conceptId: "modern-cpp", difficulty: 3,
    skills: [{ id: "templates" }], purposes: LPR,
    prompt: "What does this print?",
    code: `template <typename T>
T biggest(T a, T b) {
    return a > b ? a : b;
}

int main() {
    cout << biggest(3, 8) << " " << biggest(2.5, 1.5) << " " << biggest(string("pear"), string("apple"));
    return 0;
}`,
    options: [
      { id: "a", text: "8 2.5 pear" },
      { id: "b", text: "8 2 pear", feedback: "T is deduced as double for 2.5 and 1.5." },
      { id: "c", text: "8 2.5 apple", feedback: "\"pear\" > \"apple\" because 'p' > 'a'." },
      { id: "d", text: "It doesn't compile: T can't be a string" },
    ],
    correct: "a",
    hints: [
      "What is T in each call?",
      "int, then double, then string.",
      "The same code runs with each type.",
      "Strings compare alphabetically.",
      "8, 2.5, and the later word.",
    ],
    explanation: "The template is instantiated for int, double and string: 8, 2.5 and \"pear\" (which sorts after \"apple\").",
  },
  {
    id: "mc-template-blank", type: "complete_code", conceptId: "modern-cpp", difficulty: 2,
    skills: [{ id: "templates" }], purposes: LPR,
    prompt: "Fill in the first line so `twice` works for any type that supports `+`.",
    code: `____
T twice(T x) {
    return x + x;
}`,
    accepted: ["template <typename T>", "template<typename T>", "template <class T>", "template<class T>"],
    wrongAnswers: [{ answer: "typename T", feedback: "Start with the `template` keyword." }, { answer: "template T", feedback: "The parameter goes in angle brackets: template <typename T>." }],
    hints: [
      "How do you tell C++ that T is a placeholder type?",
      "With a template header.",
      "It starts with the word `template`.",
      "Then the parameter in angle brackets.",
      "template <typename ___>",
    ],
    explanation: "`template <typename T>` declares T as a type parameter for the function below.",
  },
  {
    id: "mc-optional", type: "predict_output", conceptId: "modern-cpp", difficulty: 3,
    skills: [{ id: "modern_types" }], purposes: LPR,
    prompt: "What does this print?",
    code: `optional<int> findAge(string name) {
    if (name == "Asha") return 14;
    return nullopt;
}

int main() {
    auto a = findAge("Asha");
    auto b = findAge("Bob");
    cout << a.value_or(-1) << " " << b.value_or(-1) << " " << b.has_value();
    return 0;
}`,
    options: [
      { id: "a", text: "14 -1 0" },
      { id: "b", text: "14 0 0", feedback: "value_or gives the fallback (-1) when empty." },
      { id: "c", text: "14 -1 1" },
      { id: "d", text: "It crashes for Bob" },
    ],
    correct: "a",
    hints: [
      "What does findAge return for Bob?",
      "nullopt — an empty optional.",
      "What does value_or do with an empty optional?",
      "It returns the fallback.",
      "has_value() is false (0) for Bob.",
    ],
    explanation: "a holds 14; b is empty so value_or returns -1, and has_value() is false.",
  },
  {
    id: "mc-enum-class", type: "mcq", conceptId: "modern-cpp", difficulty: 2,
    skills: [{ id: "modern_types" }], purposes: LPR,
    prompt: "Why prefer `enum class Color { Red, Green };` over a plain `enum`?",
    options: [
      { id: "a", text: "Its names are scoped (Color::Red) and it doesn't silently convert to int" },
      { id: "b", text: "It's faster" },
      { id: "c", text: "It can hold more values" },
      { id: "d", text: "Plain enums are no longer allowed", feedback: "They're allowed — just less safe." },
    ],
    correct: "a",
    hints: [
      "What problems do plain enums have?",
      "Their names leak into the surrounding scope.",
      "And they convert to int without warning.",
      "enum class fixes both.",
      "Scoped and strongly typed.",
    ],
    explanation: "enum class values must be written Color::Red and don't convert to int implicitly, preventing name clashes and accidental arithmetic.",
  },
  {
    id: "mc-range-for-bug", type: "identify_error", conceptId: "modern-cpp", difficulty: 3,
    skills: [{ id: "auto_lambda" }], purposes: LPR,
    prompt: "This is meant to double every element, but v is unchanged afterwards. Why?",
    code: `vector<int> v = {1, 2, 3};
for (auto x : v) {
    x *= 2;
}`,
    options: [
      { id: "a", text: "`auto x` is a copy of each element — use `auto& x` to change the vector" },
      { id: "b", text: "Range-for loops can't change anything" },
      { id: "c", text: "It should be `x = x * 2`", feedback: "Same thing — still on the copy." },
      { id: "d", text: "auto can't be used in loops" },
    ],
    correct: "a",
    hints: [
      "What is x on each pass — the element or a copy?",
      "`auto x` makes a copy.",
      "Changing a copy doesn't change v.",
      "How do you get the element itself?",
      "Add & : `auto& x`.",
    ],
    explanation: "`auto x` copies each element. Use `auto& x` to modify the elements in place.",
  },
  {
    id: "mc-code-filter", type: "write_code", conceptId: "modern-cpp", difficulty: 3,
    skills: [{ id: "auto_lambda" }, { id: "templates", weight: 0.5 }], purposes: PAR,
    prompt: "Read `n`, then n whole numbers, then a threshold `t`. Using `count_if` with a lambda, print how many numbers are at least t.",
    starterCode: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> v(n);
    for (auto& x : v) cin >> x;
    int t;
    cin >> t;
    // Use count_if with a lambda to count values >= t

    return 0;
}`,
    tests: [
      { label: "sample", input: "5\n3 8 1 9 4\n4\n", output: "3", visibility: "sample", category: "normal" },
      { label: "none", input: "3\n1 2 3\n10\n", output: "0", visibility: "visible", category: "edge" },
      { label: "all", input: "3\n5 5 5\n5\n", output: "3", visibility: "hidden", category: "boundary" },
      { label: "negatives", input: "4\n-1 -5 0 2\n-1\n", output: "3", visibility: "hidden", category: "edge" },
    ],
    compare: "tokens",
    referenceSolution: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> v(n);
    for (auto& x : v) cin >> x;
    int t;
    cin >> t;
    cout << count_if(v.begin(), v.end(), [t](int x) { return x >= t; }) << endl;
    return 0;
}`,
    solutionWalkthrough: "count_if calls the lambda for every element and counts the ones where it returns true. The lambda needs t, so capture it: [t].",
    detectors: [],
    hints: [
      "count_if(begin, end, predicate) counts elements where the predicate is true.",
      "The predicate can be a lambda.",
      "The lambda needs t from outside — capture it.",
      "`[t](int x) { return x >= t; }`",
      "cout << count_if(v.begin(), v.end(), ___);",
    ],
    explanation: "`count_if(v.begin(), v.end(), [t](int x) { return x >= t; })`.",
  },

  // ── Streams, exceptions & debugging ───────────────────────────────────────
  {
    id: "fe-sstream", type: "predict_output", conceptId: "files-exceptions", difficulty: 2,
    skills: [{ id: "streams" }], purposes: LPR,
    prompt: "What does this print?",
    code: `istringstream in("10 20 x 30");
int n, sum = 0;
while (in >> n) sum += n;
cout << sum;`,
    options: [
      { id: "a", text: "30" },
      { id: "b", text: "60", feedback: "Reading stops at \"x\": the stream fails and the loop ends." },
      { id: "c", text: "0" },
      { id: "d", text: "It loops forever" },
    ],
    correct: "a",
    hints: [
      "When does `in >> n` become false?",
      "When it can't read an int.",
      "What happens when it reaches \"x\"?",
      "The stream goes into a fail state and stops.",
      "10 + 20.",
    ],
    explanation: "`in >> n` reads 10 and 20, then fails on \"x\", ending the loop. 30 is never read.",
  },
  {
    id: "fe-getline", type: "predict_output", conceptId: "files-exceptions", difficulty: 3,
    skills: [{ id: "streams" }], purposes: LPR,
    prompt: "What does this print?",
    code: `istringstream in("Ada Lovelace,1815");
string name, year;
getline(in, name, ',');
getline(in, year);
cout << year << ":" << name;`,
    options: [
      { id: "a", text: "1815:Ada Lovelace" },
      { id: "b", text: "1815:Ada", feedback: "getline with ',' reads up to the comma, spaces included." },
      { id: "c", text: "Lovelace,1815:Ada" },
      { id: "d", text: ":Ada Lovelace,1815" },
    ],
    correct: "a",
    hints: [
      "What does the third argument to getline do?",
      "It's the delimiter: read until ','.",
      "Does getline stop at spaces?",
      "No — only at the delimiter.",
      "name = \"Ada Lovelace\", year = \"1815\".",
    ],
    explanation: "getline(in, name, ',') reads \"Ada Lovelace\" (spaces and all) and drops the comma; the next getline reads \"1815\".",
  },
  {
    id: "fe-throw", type: "predict_output", conceptId: "files-exceptions", difficulty: 2,
    skills: [{ id: "exceptions" }], purposes: LPR,
    prompt: "What does this print?",
    code: `int safeDivide(int a, int b) {
    if (b == 0) throw runtime_error("divide by zero");
    return a / b;
}

int main() {
    try {
        cout << safeDivide(10, 2) << " ";
        cout << safeDivide(1, 0) << " ";
        cout << "after ";
    } catch (const exception& e) {
        cout << "caught: " << e.what();
    }
    return 0;
}`,
    options: [
      { id: "a", text: "5 caught: divide by zero" },
      { id: "b", text: "5 caught: divide by zero after", feedback: "After a throw, the rest of the try block is skipped." },
      { id: "c", text: "caught: divide by zero" },
      { id: "d", text: "5 0 after" },
    ],
    correct: "a",
    hints: [
      "The first call works. What does it print?",
      "The second call throws.",
      "Where does execution go after a throw?",
      "Straight to the matching catch — the rest of the try is skipped.",
      "5, then the catch message.",
    ],
    explanation: "10 / 2 prints 5. The second call throws, skipping \"after\", and the catch prints the message.",
  },
  {
    id: "fe-catch-order", type: "predict_output", conceptId: "files-exceptions", difficulty: 4,
    skills: [{ id: "exceptions" }], purposes: LPR,
    prompt: "What does this print?",
    code: `try {
    vector<int> v(3);
    cout << v.at(5);
} catch (const out_of_range& e) {
    cout << "range";
} catch (const exception& e) {
    cout << "general";
}`,
    options: [
      { id: "a", text: "range" },
      { id: "b", text: "general", feedback: "Catch blocks are tried in order; out_of_range matches first." },
      { id: "c", text: "rangegeneral", feedback: "Only one catch block runs." },
      { id: "d", text: "0" },
    ],
    correct: "a",
    hints: [
      "What does `v.at(5)` do on a 3-element vector?",
      "at() checks bounds and throws std::out_of_range.",
      "Which catch is tried first?",
      "The first one that matches handles it — only one runs.",
      "out_of_range matches the first handler.",
    ],
    explanation: "at() throws out_of_range; the first matching handler runs and only that one.",
  },
  {
    id: "fe-blank-catch", type: "complete_code", conceptId: "files-exceptions", difficulty: 2,
    skills: [{ id: "exceptions" }], purposes: LPR,
    prompt: "Fill in the keyword that handles the exception.",
    code: `try {
    throw runtime_error("oops");
} ____ (const runtime_error& e) {
    cout << e.what();
}`,
    accepted: ["catch"],
    wrongAnswers: [{ answer: "except", feedback: "That's Python. C++ uses catch." }, { answer: "finally", feedback: "C++ has no finally — cleanup is done with RAII." }],
    hints: [
      "try … ? … — what's the partner of try?",
      "It takes the exception as a parameter.",
      "It's not `except` (that's Python).",
      "Five letters.",
      "c _ _ _ _",
    ],
    explanation: "Exceptions thrown in a try block are handled by a matching `catch`.",
  },
  {
    id: "fe-assert", type: "mcq", conceptId: "files-exceptions", difficulty: 2,
    skills: [{ id: "debugging" }], purposes: LPR,
    prompt: "What is `assert(index < size);` for?",
    options: [
      { id: "a", text: "To stop the program immediately (in debug builds) if an assumption the programmer made is false" },
      { id: "b", text: "To handle bad user input gracefully", feedback: "Expected bad input should be handled with checks or exceptions, not assert." },
      { id: "c", text: "To make the program faster" },
      { id: "d", text: "To print the value of index" },
    ],
    correct: "a",
    hints: [
      "Is assert for problems the user caused or bugs you caused?",
      "It checks assumptions that should always be true if the code is right.",
      "What happens when it fails?",
      "The program stops with a message saying which assertion failed.",
      "It's a bug detector.",
    ],
    explanation: "assert checks a condition that should always hold; if it doesn't, the program stops loudly so you find the bug early. It can be disabled in release builds.",
  },
  {
    id: "fe-debug-method", type: "mcq", conceptId: "files-exceptions", difficulty: 3,
    skills: [{ id: "debugging" }], purposes: LPR,
    prompt: "Your program prints the wrong total for a big input. What's the best first step?",
    options: [
      { id: "a", text: "Find the smallest input that still gives a wrong answer, then trace or print values step by step" },
      { id: "b", text: "Rewrite the program from scratch" },
      { id: "c", text: "Randomly change < to <= until it works", feedback: "Guessing can hide the bug instead of fixing it." },
      { id: "d", text: "Add more comments" },
    ],
    correct: "a",
    hints: [
      "Is it easier to debug a 1000-number input or a 3-number one?",
      "Shrink the failing case.",
      "Then you can check each step by hand.",
      "Print or trace the values to see where they first go wrong.",
      "Reproduce small, then trace.",
    ],
    explanation: "Reduce the failing input to the smallest case, then trace or print intermediate values to find the first wrong step.",
  },
  {
    id: "fe-overflow", type: "identify_error", conceptId: "files-exceptions", difficulty: 3,
    skills: [{ id: "debugging" }], purposes: LPR,
    prompt: "This prints a negative number for n = 20. What's the bug?",
    code: `int n = 20;
int fact = 1;
for (int i = 2; i <= n; i++) fact *= i;
cout << fact;`,
    options: [
      { id: "a", text: "20! is far too big for an int, so it overflows — use long long (unsigned long long for larger)" },
      { id: "b", text: "The loop should start at 1", feedback: "Multiplying by 1 changes nothing." },
      { id: "c", text: "fact should start at 0", feedback: "Then the product would always be 0." },
      { id: "d", text: "`*=` doesn't work with ints" },
    ],
    correct: "a",
    hints: [
      "Roughly how big is 20!?",
      "About 2.4 × 10¹⁸.",
      "What's the largest value an int can hold?",
      "About 2.1 × 10⁹.",
      "Use a bigger type.",
    ],
    explanation: "20! ≈ 2.4 × 10¹⁸ overflows a 32-bit int (max ≈ 2.1 × 10⁹). long long holds it.",
  },
  {
    id: "fe-code-parse", type: "write_code", conceptId: "files-exceptions", difficulty: 3,
    skills: [{ id: "streams" }, { id: "debugging", weight: 0.5 }], purposes: PAR,
    prompt: "Each input line has a name and some scores, e.g. `Asha 7 9 8`. Read lines until the input ends and print each name with the total of its scores, like `Asha 24`.",
    starterCode: `#include <iostream>
#include <sstream>
#include <string>
using namespace std;

int main() {
    string line;
    // Read every line, split it with an istringstream, and print name and total

    return 0;
}`,
    tests: [
      { label: "two lines", input: "Asha 7 9 8\nRavi 10 5\n", output: "Asha 24\nRavi 15", visibility: "sample", category: "normal" },
      { label: "no scores", input: "Zoe\n", output: "Zoe 0", visibility: "visible", category: "edge" },
      { label: "three people", input: "A 1\nB 2 2\nC 3 3 3\n", output: "A 1\nB 4\nC 9", visibility: "hidden", category: "normal" },
      { label: "many scores", input: "Max 1 2 3 4 5 6 7 8 9 10\n", output: "Max 55", visibility: "hidden", category: "normal" },
    ],
    compare: "lines",
    referenceSolution: `#include <iostream>
#include <sstream>
#include <string>
using namespace std;

int main() {
    string line;
    while (getline(cin, line)) {
        if (line.empty()) continue;
        istringstream in(line);
        string name;
        in >> name;
        int score, total = 0;
        while (in >> score) total += score;
        cout << name << " " << total << endl;
    }
    return 0;
}`,
    solutionWalkthrough: "getline reads one whole line at a time until the input ends. An istringstream over that line lets you read the name and then numbers until the line runs out.",
    detectors: [],
    hints: [
      "How do you read one whole line?",
      "`while (getline(cin, line))` loops until the input ends.",
      "How do you read words and numbers out of that line?",
      "Wrap it in an istringstream and use >>.",
      "istringstream in(line);\nin >> name;\nwhile (in >> score) total += score;",
    ],
    explanation: "Loop with getline; parse each line with an istringstream.",
  },

  // ── Advanced C++ ──────────────────────────────────────────────────────────
  {
    id: "ad-raii", type: "predict_output", conceptId: "advanced-cpp", difficulty: 3,
    skills: [{ id: "raii" }], purposes: LPR,
    prompt: "What does this print?",
    code: `struct Lock {
    Lock() { cout << "lock "; }
    ~Lock() { cout << "unlock "; }
};

void work(bool fail) {
    Lock l;
    if (fail) throw runtime_error("x");
    cout << "work ";
}

int main() {
    try { work(false); work(true); } catch (...) { cout << "caught"; }
    return 0;
}`,
    options: [
      { id: "a", text: "lock work unlock lock unlock caught" },
      { id: "b", text: "lock work unlock lock caught", feedback: "Destructors still run when an exception leaves the function." },
      { id: "c", text: "lock work unlock caught" },
      { id: "d", text: "lock work lock unlock unlock caught" },
    ],
    correct: "a",
    hints: [
      "When does Lock's destructor run?",
      "When the function's scope ends — however it ends.",
      "Does that include leaving by an exception?",
      "Yes: stack unwinding runs destructors.",
      "So the second call still unlocks before the catch.",
    ],
    explanation: "RAII: the destructor runs whenever l goes out of scope, including during stack unwinding, so the lock is always released.",
  },
  {
    id: "ad-shared", type: "predict_output", conceptId: "advanced-cpp", difficulty: 3,
    skills: [{ id: "raii" }], purposes: LPR,
    prompt: "What does this print?",
    code: `auto a = make_shared<int>(7);
cout << a.use_count() << " ";
{
    auto b = a;
    cout << a.use_count() << " ";
}
cout << a.use_count();`,
    options: [
      { id: "a", text: "1 2 1" },
      { id: "b", text: "1 2 2", feedback: "b is destroyed at the end of its block, dropping the count." },
      { id: "c", text: "1 1 1" },
      { id: "d", text: "0 1 0" },
    ],
    correct: "a",
    hints: [
      "use_count() counts how many shared_ptrs own the int.",
      "Copying a shared_ptr adds an owner.",
      "When b's block ends, b is destroyed.",
      "That removes an owner.",
      "1, then 2, then back to 1.",
    ],
    explanation: "a alone: 1. Copying into b: 2. b is destroyed at the end of its block: 1.",
  },
  {
    id: "ad-move", type: "predict_output", conceptId: "advanced-cpp", difficulty: 3,
    skills: [{ id: "move_semantics" }], purposes: LPR,
    prompt: "What does this print? (Assume a moved-from vector is left empty, as it is in practice.)",
    code: `vector<int> a = {1, 2, 3};
vector<int> b = a;
vector<int> c = move(a);
cout << a.size() << b.size() << c.size();`,
    options: [
      { id: "a", text: "033" },
      { id: "b", text: "333", feedback: "Moving transfers a's buffer to c, leaving a empty." },
      { id: "c", text: "303" },
      { id: "d", text: "003" },
    ],
    correct: "a",
    hints: [
      "`b = a` copies. Is a changed?",
      "No — copying leaves the source alone.",
      "`c = move(a)` moves. What happens to a?",
      "Its contents are transferred to c.",
      "a empty, b and c have 3.",
    ],
    explanation: "b is a copy (3). Moving into c steals a's buffer, so c has 3 and a is left empty.",
  },
  {
    id: "ad-rule-three", type: "mcq", conceptId: "advanced-cpp", difficulty: 4,
    skills: [{ id: "move_semantics" }, { id: "raii", weight: 0.5 }], purposes: LPR,
    prompt: "A class owns a raw `int* data = new int[n];` and deletes it in its destructor, but has no copy constructor. What happens when an object is copied?",
    options: [
      { id: "a", text: "Both copies point to the same array, so it gets deleted twice when they're destroyed" },
      { id: "b", text: "The array is copied automatically", feedback: "The default copy copies the pointer, not what it points to." },
      { id: "c", text: "It doesn't compile" },
      { id: "d", text: "Nothing bad — destructors are skipped for copies" },
    ],
    correct: "a",
    hints: [
      "What does the compiler-generated copy constructor copy?",
      "Each member — including the pointer value.",
      "So both objects hold the same address.",
      "Each destructor calls delete[] on it.",
      "Double delete. Follow the rule of three — or use vector.",
    ],
    explanation: "The default copy copies the pointer, so two objects own one array and both delete it. Define copy/move operations (rule of three/five) or, better, use std::vector.",
  },
  {
    id: "ad-ub-index", type: "identify_error", conceptId: "advanced-cpp", difficulty: 3,
    skills: [{ id: "undefined_behaviour" }], purposes: LPR,
    prompt: "This often \"works\" on one machine and crashes on another. Why?",
    code: `vector<int> v = {1, 2, 3};
int total = 0;
for (int i = 0; i <= 3; i++) total += v[i];
cout << total;`,
    options: [
      { id: "a", text: "v[3] is out of bounds — undefined behaviour, so any result (including \"working\") is possible" },
      { id: "b", text: "vectors can't be indexed with []" },
      { id: "c", text: "total should be a long long" },
      { id: "d", text: "It's correct; the crash must be the computer's fault" },
    ],
    correct: "a",
    hints: [
      "How many elements does v have? Which indexes are valid?",
      "0, 1, 2.",
      "Which i is too big?",
      "v[3] reads memory that isn't part of the vector.",
      "That's undefined behaviour: anything can happen.",
    ],
    explanation: "v[3] is out of range. operator[] doesn't check, so it's undefined behaviour — the result can differ between machines and runs. Use `i < v.size()` (or `.at()` while debugging).",
  },
  {
    id: "ad-ub-signed", type: "mcq", conceptId: "advanced-cpp", difficulty: 4,
    skills: [{ id: "undefined_behaviour" }], purposes: LPR,
    prompt: "Which of these is undefined behaviour in C++?",
    options: [
      { id: "a", text: "Adding 1 to INT_MAX in an int" },
      { id: "b", text: "Adding 1 to the largest unsigned int", feedback: "Unsigned arithmetic wraps around to 0 — that's well defined." },
      { id: "c", text: "Dividing 7 by 2 in ints", feedback: "That's simply 3." },
      { id: "d", text: "Comparing two ints with ==" },
    ],
    correct: "a",
    hints: [
      "Which of these could \"go past the edge\" of a type?",
      "Two options do — signed and unsigned.",
      "Unsigned overflow has a defined result.",
      "Signed overflow doesn't.",
      "INT_MAX + 1.",
    ],
    explanation: "Signed integer overflow is undefined behaviour; unsigned arithmetic is defined to wrap modulo 2ⁿ.",
  },
  {
    id: "ad-dangling-ref", type: "identify_error", conceptId: "advanced-cpp", difficulty: 4,
    skills: [{ id: "undefined_behaviour" }, { id: "move_semantics", weight: 0.5 }], purposes: LPR,
    prompt: "What's wrong here?",
    code: `vector<int> v = {1, 2, 3};
int& first = v[0];
v.push_back(4);
cout << first;`,
    options: [
      { id: "a", text: "push_back may reallocate the vector's storage, leaving `first` referring to freed memory" },
      { id: "b", text: "You can't take a reference to a vector element" },
      { id: "c", text: "push_back can't be called after taking a reference" },
      { id: "d", text: "Nothing — it prints 1" },
    ],
    correct: "a",
    hints: [
      "Where are a vector's elements stored?",
      "In a buffer it can replace when it grows.",
      "What happens to old references when it moves the elements?",
      "They still point at the old, freed buffer.",
      "Re-take the reference after modifying the vector.",
    ],
    explanation: "Growing a vector can move its elements to a new buffer, invalidating references, pointers and iterators to the old ones.",
  },
  {
    id: "ad-blank-unique", type: "complete_code", conceptId: "advanced-cpp", difficulty: 2,
    skills: [{ id: "raii" }], purposes: LPR,
    prompt: "Fill in the blank to create a uniquely-owned int holding 42, freed automatically.",
    code: `auto p = ____;
cout << *p;`,
    accepted: ["make_unique<int>(42)", "std::make_unique<int>(42)", "unique_ptr<int>(new int(42))"],
    wrongAnswers: [{ answer: "new int(42)", feedback: "A raw new needs a manual delete. Use make_unique." }, { answer: "make_shared<int>(42)", feedback: "That's shared ownership. For a single owner use make_unique." }],
    hints: [
      "Which smart pointer has exactly one owner?",
      "unique_ptr.",
      "There's a helper function that creates one.",
      "It's called make_…",
      "make_unique<int>(___)",
    ],
    explanation: "`make_unique<int>(42)` creates a unique_ptr that deletes the int automatically.",
  },
  {
    id: "ad-code-stackclass", type: "write_code", conceptId: "advanced-cpp", difficulty: 4,
    skills: [{ id: "raii" }, { id: "undefined_behaviour", weight: 0.5 }], purposes: PAR,
    prompt: "Implement a class `IntStack` that stores ints in a `std::vector` and has `push(int)`, `pop()` and `top()`. `pop()` and `top()` must throw `std::out_of_range` when the stack is empty. Commands are read one per line: `push X`, `pop`, `top`. For `top` print the value, and if a command throws, print `error`.",
    starterCode: `#include <iostream>
#include <vector>
#include <string>
#include <stdexcept>
using namespace std;

// Write class IntStack here

int main() {
    IntStack s;
    string cmd;
    while (cin >> cmd) {
        // Handle push / pop / top, printing "error" if a command throws
    }
    return 0;
}`,
    tests: [
      { label: "sample", input: "push 3\npush 5\ntop\npop\ntop\n", output: "5\n3", visibility: "sample", category: "normal" },
      { label: "empty top", input: "top\n", output: "error", visibility: "visible", category: "edge" },
      { label: "empty pop", input: "push 1\npop\npop\ntop\n", output: "error\nerror", visibility: "hidden", category: "edge" },
      { label: "many", input: "push 1\npush 2\npush 3\npop\npop\ntop\n", output: "1", visibility: "hidden", category: "normal" },
    ],
    compare: "lines",
    referenceSolution: `#include <iostream>
#include <vector>
#include <string>
#include <stdexcept>
using namespace std;

class IntStack {
    vector<int> data;
public:
    void push(int x) { data.push_back(x); }
    void pop() {
        if (data.empty()) throw out_of_range("pop on empty stack");
        data.pop_back();
    }
    int top() const {
        if (data.empty()) throw out_of_range("top on empty stack");
        return data.back();
    }
};

int main() {
    IntStack s;
    string cmd;
    while (cin >> cmd) {
        try {
            if (cmd == "push") { int x; cin >> x; s.push(x); }
            else if (cmd == "pop") s.pop();
            else if (cmd == "top") cout << s.top() << endl;
        } catch (const out_of_range&) {
            cout << "error" << endl;
        }
    }
    return 0;
}`,
    solutionWalkthrough: "Let std::vector own the memory (no new/delete, so no leaks). Check for empty before pop_back/back — calling them on an empty vector is undefined behaviour — and throw instead. main catches the exception per command.",
    detectors: [],
    hints: [
      "Who should own the memory — you or a vector?",
      "A vector member: push_back, pop_back, back.",
      "What does back() do on an empty vector?",
      "Undefined behaviour — so check empty() first and throw out_of_range.",
      "try { … } catch (const out_of_range&) { cout << \"error\" << endl; }",
    ],
    explanation: "Wrap a vector, throw out_of_range on empty pop/top, and catch per command.",
  },
];
