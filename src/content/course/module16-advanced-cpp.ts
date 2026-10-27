import type { CourseLesson } from "./types";

const r = String.raw;

/** Module 16 — Advanced C++ and engineering practice: ownership, moves and undefined behaviour. */
export const ADVANCED_CPP_LESSONS: CourseLesson[] = [
  {
    id: "raii-ownership",
    moduleId: "advanced-cpp",
    title: "RAII and ownership",
    minutes: 30,
    concepts: ["RAII", "ownership", "unique_ptr", "shared_ptr", "use_count", "deleted copy", "scope guard"],
    goals: [
      "Resource Acquisition Is Initialization: tie every resource to an object's lifetime",
      "Exclusive ownership with `unique_ptr` (move, never copy) and shared ownership with `shared_ptr`",
      "Writing your own RAII class — and forbidding copies that would release a resource twice",
    ],
    intro: `Memory, files, network connections and locks all share one rule: what you acquire, you must release — on every path, including early returns and exceptions. C++'s answer is **RAII**: acquire in a constructor, release in the destructor, and let scope do the rest. It's the single most important idea in modern C++.`,
    sections: [
      {
        title: "Acquire in the constructor, release in the destructor",
        body: `\`\`\`cpp
class Connection {
public:
    Connection(string host) { /* open */ }
    ~Connection()           { /* close — always runs */ }
};

void work() {
    Connection c("server");
    if (problem) return;           // c is closed here…
    mayThrow();                    // …and here, if an exception leaves work()
}                                  // …and here
\`\`\`

No \`close()\` calls to forget. \`vector\`, \`string\`, file streams, \`unique_ptr\` and \`lock_guard\` all work this way.`,
      },
      {
        title: "Ownership: unique and shared",
        body: `- \`unique_ptr<T>\` — **one owner**. It can't be copied (two owners would both delete), only **moved**: \`auto b = std::move(a);\` leaves \`a\` empty.
- \`shared_ptr<T>\` — **shared** ownership with a reference count; the object is deleted when the last \`shared_ptr\` goes away. \`use_count()\` shows the count. Costs a little more; use it only when ownership is genuinely shared.
- A raw pointer or reference that doesn't own anything is fine for *observing* — it just must never \`delete\`.`,
      },
      {
        title: "Writing an RAII class",
        body: `If your class releases something in its destructor, copying it would make two objects release the same thing. Forbid that explicitly:

\`\`\`cpp
class Guard {
public:
    explicit Guard(Lock& l) : lock(l) { lock.lock(); }
    ~Guard() { lock.unlock(); }
    Guard(const Guard&) = delete;             // no copies
    Guard& operator=(const Guard&) = delete;
private:
    Lock& lock;
};
\`\`\`

The standard library's \`std::lock_guard\` is exactly this for mutexes.`,
      },
    ],
    mistakes: [
      { title: "Manual cleanup calls", body: "`open(); … close();` leaks on any early return or exception between them. Wrap the resource in an object." },
      { title: "Copying a resource owner", body: "A class that frees memory in its destructor but keeps the default copy constructor will free the same memory twice. Delete or implement the copy operations (next lesson)." },
      { title: "shared_ptr everywhere", body: "Shared ownership hides who is responsible and can form reference cycles that never free. Default to `unique_ptr`." },
    ],
    example: {
      title: "Release on every path",
      intro: "A connection closes on normal exit and on an exception; a unique_ptr changes owner; a shared_ptr counts its users.",
      code: r`#include <iostream>
#include <memory>
#include <stdexcept>
#include <string>
using namespace std;

class Connection {
    string name;
public:
    Connection(string n) : name(n) { cout << "connect " << name << endl; }
    ~Connection() { cout << "disconnect " << name << endl; }
};

void work(bool fail) {
    Connection c(fail ? "B" : "A");
    if (fail) {
        throw runtime_error("network error");
    }
    cout << "working with A" << endl;
}

int main() {
    work(false);
    try {
        work(true);
    } catch (const exception& e) {
        cout << "error: " << e.what() << endl;
    }
    auto owner = make_unique<Connection>("C");
    auto newOwner = move(owner);
    cout << (owner ? "owner still has C" : "ownership moved") << endl;
    shared_ptr<int> a = make_shared<int>(5);
    {
        shared_ptr<int> b = a;
        cout << "users: " << a.use_count() << endl;
    }
    cout << "users: " << a.use_count() << endl;
    return 0;
}`,
      output: "connect A\nworking with A\ndisconnect A\nconnect B\ndisconnect B\nerror: network error\nconnect C\nownership moved\nusers: 2\nusers: 1\ndisconnect C\n",
      notes: [
        { line: 17, text: "The exception leaves `work`, and `c` is still disconnected on the way out." },
        { line: 30, text: "A `unique_ptr` can only be moved: `owner` is empty afterwards." },
        { line: 34, text: "Two `shared_ptr`s share one int; `b` leaving scope drops the count back to 1." },
        { line: 38, text: "At the end of `main`, `newOwner` is destroyed and C disconnects — no `delete` written anywhere." },
      ],
    },
    quickCheck: {
      prompt: "Which line does NOT compile?",
      code: r`auto p = make_unique<int>(7);   // line 1
auto q = p;                      // line 2
auto s = move(p);                // line 3`,
      options: [
        { id: "a", text: "Line 1", feedback: "`make_unique` is the normal way to create one." },
        { id: "b", text: "Line 2", feedback: "Right: copying a `unique_ptr` would create two owners, so it's deleted." },
        { id: "c", text: "Line 3", feedback: "Moving transfers ownership and is allowed." },
      ],
      correct: "b",
      explanation: "`unique_ptr` is move-only. Use `std::move` to transfer ownership, or `shared_ptr` if ownership must really be shared.",
    },
    exercise: {
      title: "A lock guard",
      prompt: `\`process\` must hold the lock while it works — and release it on **every** path: normal finish, early \`return\` (for 0), and a thrown exception (for negative values).

Complete the RAII class \`Guard\`: its constructor calls \`lock()\`, its destructor calls \`unlock()\`, and copying is forbidden. \`process\` and \`main\` are given.`,
      starterCode: r`#include <iostream>
#include <stdexcept>
using namespace std;

struct Lock {
    void lock() { cout << "lock" << endl; }
    void unlock() { cout << "unlock" << endl; }
};

class Guard {
public:
    explicit Guard(Lock& l) : lock(l) {
        // acquire
    }
    ~Guard() {
        // release
    }
    Guard(const Guard&) = delete;
    Guard& operator=(const Guard&) = delete;
private:
    Lock& lock;
};

void process(Lock& l, int x) {
    Guard g(l);
    if (x < 0) {
        throw invalid_argument("negative");
    }
    if (x == 0) {
        return;
    }
    cout << "processed " << x << endl;
}

int main() {
    Lock l;
    int t;
    cin >> t;
    for (int i = 0; i < t; i++) {
        int x;
        cin >> x;
        try {
            process(l, x);
        } catch (const exception& e) {
            cout << "error: " << e.what() << endl;
        }
    }
    return 0;
}`,
      tests: [
        { label: "all three paths", input: "3\n5\n0\n-2\n", output: "lock\nprocessed 5\nunlock\nlock\nunlock\nlock\nunlock\nerror: negative", visibility: "sample", category: "normal" },
        { label: "only exceptions", input: "2\n-1\n-9\n", output: "lock\nunlock\nerror: negative\nlock\nunlock\nerror: negative", visibility: "hidden", category: "edge" },
        { label: "only normal", input: "1\n7\n", output: "lock\nprocessed 7\nunlock", visibility: "hidden", category: "normal" },
      ],
      compare: "lines",
      hints: [
        "Which two moments in the guard's life match \"start working\" and \"stop working\"?",
        "Creation (constructor) and destruction (destructor). The destructor runs on every way out of `process`.",
        "In the constructor call `lock.lock();`, in the destructor `lock.unlock();`.",
        "Notice the order in the sample: for -2 the unlock is printed *before* \"error: negative\" — the guard is destroyed while the exception leaves `process`, before `main`'s catch runs.",
      ],
      solution: r`#include <iostream>
#include <stdexcept>
using namespace std;

struct Lock {
    void lock() { cout << "lock" << endl; }
    void unlock() { cout << "unlock" << endl; }
};

class Guard {
public:
    explicit Guard(Lock& l) : lock(l) {
        lock.lock();
    }
    ~Guard() {
        lock.unlock();
    }
    Guard(const Guard&) = delete;
    Guard& operator=(const Guard&) = delete;
private:
    Lock& lock;
};

void process(Lock& l, int x) {
    Guard g(l);
    if (x < 0) {
        throw invalid_argument("negative");
    }
    if (x == 0) {
        return;
    }
    cout << "processed " << x << endl;
}

int main() {
    Lock l;
    int t;
    cin >> t;
    for (int i = 0; i < t; i++) {
        int x;
        cin >> x;
        try {
            process(l, x);
        } catch (const exception& e) {
            cout << "error: " << e.what() << endl;
        }
    }
    return 0;
}`,
      solutionNotes: "Two lines of code, three exit paths covered. `process` never mentions unlocking — the guard's lifetime does it. Deleting the copy operations stops anyone from accidentally creating a second guard that would unlock twice.",
    },
    explainAgain: `RAII is a hotel key card that deactivates itself at checkout. You don't have to remember to hand it in: the moment your stay ends — normally, early, or because of a fire alarm — the card stops working. A \`unique_ptr\` is a key card that can be handed to someone else but never duplicated; \`shared_ptr\` is a family booking where the room is released when the last guest leaves.`,
    summary: [
      "RAII: acquire in the constructor, release in the destructor — cleanup happens on every path.",
      "`unique_ptr` = single, movable owner; `shared_ptr` = counted shared owner; default to unique.",
      "Classes that release resources must forbid (or properly implement) copying.",
    ],
  },

  {
    id: "move-semantics",
    moduleId: "advanced-cpp",
    title: "Copy, move and the rule of five",
    minutes: 35,
    concepts: ["copy constructor", "copy assignment", "move constructor", "rvalue reference", "std::move", "rule of three", "rule of five", "rule of zero"],
    goals: [
      "What copying an object really does — and why a raw-pointer member needs a deep copy",
      "Moving: stealing resources from objects that are about to disappear (`T&&`, `std::move`)",
      "The rules of zero, three and five",
    ],
    intro: `\`Buffer b = a;\` looks simple, but for a class that owns heap memory it's a design decision: should \`b\` share \`a\`'s memory, get its own copy, or take it over? C++ lets you define each operation — and mostly lets you avoid writing any of them.`,
    sections: [
      {
        title: "Copies: shallow versus deep",
        body: `The compiler-generated copy constructor copies each member. For an \`int*\` member that copies the **address**, not the data — both objects then point at the same array (a **shallow copy**). Changing one changes the other, and both destructors \`delete[]\` the same memory: a crash.

A class that owns a resource needs a **deep copy**: allocate new memory and copy the elements.

\`\`\`cpp
IntArray(const IntArray& o) : n(o.n), data(new int[o.n]) {
    for (int i = 0; i < n; i++) data[i] = o.data[i];
}
\`\`\``,
      },
      {
        title: "Moves",
        body: `Copying is wasteful when the source is about to disappear (a temporary, or a variable you won't use again). A **move constructor** takes an **rvalue reference** \`T&&\` and *steals* the resource, leaving the source empty but valid:

\`\`\`cpp
IntArray(IntArray&& o) noexcept : n(o.n), data(o.data) {
    o.n = 0;
    o.data = nullptr;          // the source must not delete it any more
}
\`\`\`

\`std::move(x)\` doesn't move anything by itself — it *permits* a move by treating \`x\` as an rvalue. After it, only assign to \`x\` or destroy it.`,
      },
      {
        title: "Rule of zero, three, five",
        body: `- **Rule of three**: if you write a destructor, copy constructor *or* copy assignment, you almost certainly need all three.
- **Rule of five**: add the move constructor and move assignment for efficiency.
- **Rule of zero** (the goal): build classes from members that already manage themselves — \`vector\`, \`string\`, \`unique_ptr\` — and write **none** of the five. The compiler-generated versions are then correct.

Copy assignment must also handle **self-assignment** (\`a = a;\`) and free the old contents.`,
      },
    ],
    mistakes: [
      { title: "Shallow copy of an owning pointer", body: "Default copying of a class with `int* data` leads to shared data and a double `delete[]`. Deep-copy, forbid copying, or use `vector`." },
      { title: "Using an object after std::move", body: "A moved-from object is valid but unspecified (often empty). Don't read its contents expecting the old value." },
      { title: "Forgetting self-assignment", body: "`a = a;` with a naive copy assignment deletes the data and then copies from the deleted array. Check `if (this == &other) return *this;`." },
    ],
    example: {
      title: "Watching copies and moves",
      intro: "A class that announces its special member functions shows when C++ copies and when it moves.",
      code: r`#include <iostream>
#include <string>
#include <utility>
#include <vector>
using namespace std;

class Buffer {
    string name;
public:
    Buffer(string n) : name(n) { cout << "create " << name << endl; }
    Buffer(const Buffer& o) : name(o.name) { cout << "copy " << name << endl; }
    Buffer(Buffer&& o) noexcept : name(move(o.name)) {
        o.name = "empty";
        cout << "move " << name << endl;
    }
    string getName() const { return name; }
};

int main() {
    Buffer a("A");
    Buffer b = a;
    Buffer c = move(a);
    vector<Buffer> v;
    v.reserve(2);
    v.push_back(Buffer("T"));
    cout << "a is now " << a.getName() << ", c is " << c.getName() << endl;
    return 0;
}`,
      output: "create A\ncopy A\nmove A\ncreate T\nmove T\na is now empty, c is A\n",
      notes: [
        { line: 11, text: "Copy constructor: called for `Buffer b = a;`." },
        { line: 12, text: "Move constructor: takes `Buffer&&` and steals the name." },
        { line: 22, text: "`std::move(a)` allows the move; `a` is left empty." },
        { line: 25, text: "A temporary is moved into the vector, never copied." },
      ],
    },
    quickCheck: {
      prompt: "A class has an `int* data` member, a destructor that does `delete[] data`, and no copy constructor. What happens with `IntArray b = a;`?",
      options: [
        { id: "a", text: "b gets its own copy of the array", feedback: "The default copy constructor copies the pointer, not the array." },
        { id: "b", text: "a and b share the array, and it is deleted twice at the end", feedback: "Right: a shallow copy — and a double delete, which is undefined behaviour." },
        { id: "c", text: "It doesn't compile", feedback: "It compiles; that's what makes the bug dangerous." },
      ],
      correct: "b",
      explanation: "Rule of three: a class with a custom destructor needs a matching copy constructor and copy assignment (or must forbid copying).",
    },
    exercise: {
      title: "Rule of five for IntArray",
      prompt: `\`IntArray\` owns a heap array. Its constructor, destructor and accessors are written. Complete:

- the **copy constructor** — a deep copy,
- the **copy assignment** — deep copy, frees the old array, safe for \`c = c;\`,
- the **move constructor** — steals the array and leaves the source with size 0 and \`nullptr\`.

\`main\` (given) checks that copies are independent and that a moved-from array is empty.`,
      starterCode: r`#include <iostream>
#include <utility>
using namespace std;

class IntArray {
    int n;
    int* data;
public:
    explicit IntArray(int size) : n(size), data(new int[size]()) {}
    ~IntArray() { delete[] data; }

    IntArray(const IntArray& other) : n(0), data(nullptr) {
        // deep copy
    }
    IntArray& operator=(const IntArray& other) {
        // deep copy; free the old array; handle self-assignment
        return *this;
    }
    IntArray(IntArray&& other) noexcept : n(0), data(nullptr) {
        // steal other's array, leave other empty
    }

    int size() const { return n; }
    int get(int i) const { return data[i]; }
    void set(int i, int v) { data[i] = v; }
};

int main() {
    int n;
    cin >> n;
    IntArray a(n);
    for (int i = 0; i < n; i++) {
        int v;
        cin >> v;
        a.set(i, v);
    }
    IntArray b = a;
    b.set(0, 999);
    cout << a.get(0) << " " << b.get(0) << endl;
    IntArray c(1);
    c = a;
    c.set(n - 1, -1);
    cout << a.get(n - 1) << " " << c.get(n - 1) << endl;
    IntArray d = move(a);
    cout << d.size() << " " << a.size() << endl;
    c = c;
    cout << c.get(0) << endl;
    return 0;
}`,
      tests: [
        { label: "three values", input: "3\n1 2 3\n", output: "1 999\n3 -1\n3 0\n1", visibility: "sample", category: "normal" },
        { label: "one value", input: "1\n42\n", output: "42 999\n42 -1\n1 0\n-1", visibility: "hidden", category: "boundary" },
        { label: "four values", input: "4\n-5 0 5 10\n", output: "-5 999\n10 -1\n4 0\n-5", visibility: "hidden", category: "normal" },
      ],
      compare: "lines",
      hints: [
        "After `IntArray b = a;`, why must `b.set(0, 999)` leave `a` unchanged?",
        "Each object must own its *own* array. Copying means: allocate `new int[other.n]` and copy every element.",
        "Copy assignment: `if (this == &other) return *this;` then `delete[] data;`, allocate and copy, `return *this;`. Move: take `other.n` and `other.data`, then set `other.n = 0; other.data = nullptr;`.",
        "Copy constructor body: `n = other.n; data = new int[n]; for (int i = 0; i < n; i++) data[i] = other.data[i];`",
      ],
      solution: r`#include <iostream>
#include <utility>
using namespace std;

class IntArray {
    int n;
    int* data;
public:
    explicit IntArray(int size) : n(size), data(new int[size]()) {}
    ~IntArray() { delete[] data; }

    IntArray(const IntArray& other) : n(other.n), data(new int[other.n]) {
        for (int i = 0; i < n; i++) {
            data[i] = other.data[i];
        }
    }
    IntArray& operator=(const IntArray& other) {
        if (this == &other) {
            return *this;
        }
        int* fresh = new int[other.n];
        for (int i = 0; i < other.n; i++) {
            fresh[i] = other.data[i];
        }
        delete[] data;
        data = fresh;
        n = other.n;
        return *this;
    }
    IntArray(IntArray&& other) noexcept : n(other.n), data(other.data) {
        other.n = 0;
        other.data = nullptr;
    }

    int size() const { return n; }
    int get(int i) const { return data[i]; }
    void set(int i, int v) { data[i] = v; }
};

int main() {
    int n;
    cin >> n;
    IntArray a(n);
    for (int i = 0; i < n; i++) {
        int v;
        cin >> v;
        a.set(i, v);
    }
    IntArray b = a;
    b.set(0, 999);
    cout << a.get(0) << " " << b.get(0) << endl;
    IntArray c(1);
    c = a;
    c.set(n - 1, -1);
    cout << a.get(n - 1) << " " << c.get(n - 1) << endl;
    IntArray d = move(a);
    cout << d.size() << " " << a.size() << endl;
    c = c;
    cout << c.get(0) << endl;
    return 0;
}`,
      solutionNotes: "Copy assignment allocates the new array *before* deleting the old one, so a failed allocation leaves the object unchanged; the self-assignment check covers `c = c`. The move constructor just swaps pointers — O(1). (The rule of five's fifth member, move assignment, follows the same pattern.) In real code, `vector<int>` would make all of this unnecessary — the rule of zero.",
    },
    explainAgain: `Copying a house deed (shallow copy) doesn't give you a second house — two people now claim the same one, and both try to sell it. A deep copy builds an identical second house. A move is the owner handing over the keys and moving out: fast, and the old owner no longer has a house.`,
    summary: [
      "Default copies are member-wise: shallow for raw owning pointers — deep-copy, forbid, or avoid raw ownership.",
      "Move operations (`T&&`) steal resources from objects that are about to go away; `std::move` permits it.",
      "Prefer the rule of zero; if you write one of destructor/copy/move, you probably need all five.",
    ],
  },

  {
    id: "undefined-behaviour",
    moduleId: "advanced-cpp",
    title: "Undefined behaviour and writing safe code",
    minutes: 30,
    concepts: ["undefined behaviour", "signed overflow", "out of bounds", "uninitialised variable", "dangling reference", "sanitizers", "numeric_limits"],
    goals: [
      "What undefined behaviour (UB) is, and why \"it worked on my machine\" proves nothing",
      "The common sources: out-of-bounds access, signed overflow, uninitialised values, dangling pointers, data races",
      "Defensive habits and tools: checked access, overflow checks, warnings and sanitizers",
    ],
    intro: `C++ trusts you. When a program breaks certain rules — reading past an array, overflowing a signed int — the language doesn't promise *anything*: the program may crash, print garbage, or seem to work today and fail after a compiler upgrade. That's **undefined behaviour**, and avoiding it is a core professional skill.`,
    sections: [
      {
        title: "Why UB is dangerous",
        body: `The compiler optimises *assuming UB never happens*. For example, it may assume \`x + 1 > x\` is always true for a signed \`int\` and delete your overflow check entirely. So a UB bug can appear only with optimisations on, only on some inputs, or only on another machine — the worst kind of bug to find.`,
      },
      {
        title: "Common sources",
        body: `| UB | safer habit |
|---|---|
| \`a[i]\` with i out of range | check bounds, or \`v.at(i)\` while developing |
| signed overflow (\`INT_MAX + 1\`) | check against \`numeric_limits\` first, or use \`long long\` |
| reading an uninitialised variable | always initialise: \`int x = 0;\` |
| dangling pointer/reference | RAII, no references to locals that end |
| two threads writing the same data | mutexes / atomics |
| dividing by zero | check the divisor |

Unsigned integers are different: they **wrap around** by definition (\`0u - 1\` is the largest unsigned) — defined, but often still a bug.`,
      },
      {
        title: "Tools",
        body: `- Compile with **warnings**: \`-Wall -Wextra\`.
- **Sanitizers** add run-time checks: \`-fsanitize=address\` (out-of-bounds, use-after-free), \`-fsanitize=undefined\` (overflow, bad shifts), \`-fsanitize=thread\` (data races). Use them in testing; they're too slow for production.
- Static analysers (clang-tidy, cppcheck) catch suspicious patterns before you run anything.`,
      },
    ],
    mistakes: [
      { title: "Checking for overflow after it happened", body: "`if (a + b < a)` is itself UB for signed ints — the overflow already occurred and the compiler may remove the check. Test *before*: `b > 0 && a > INT_MAX - b`." },
      { title: "Trusting one successful run", body: "UB can produce the expected output by luck. A test passing doesn't prove the code is correct." },
      { title: "Mixing signed and unsigned", body: "`if (i < v.size() - 1)` with an empty vector: `v.size() - 1` wraps to a huge number. Convert sizes to `int` deliberately, or check `empty()` first." },
    ],
    example: {
      title: "Defined alternatives to UB",
      intro: "Overflow is detected before it happens, unsigned wrap-around is shown (defined), and `at()` turns an out-of-range read into an exception.",
      code: r`#include <climits>
#include <iostream>
#include <stdexcept>
#include <vector>
using namespace std;

int main() {
    int big = INT_MAX;
    cout << "INT_MAX = " << big << endl;
    long long wide = (long long)big + 1;
    cout << "as long long: " << wide << endl;
    bool wouldOverflow = big > INT_MAX - 1;
    cout << "big + 1 would overflow int: " << (wouldOverflow ? "yes" : "no") << endl;
    unsigned int u = 0;
    u = u - 1;
    cout << "unsigned 0 - 1 = " << u << endl;
    vector<int> v(3);
    cout << "v[0] = " << v[0] << " (vectors start zeroed)" << endl;
    try {
        cout << v.at(3) << endl;
    } catch (const out_of_range&) {
        cout << "v.at(3) throws instead of reading garbage" << endl;
    }
    return 0;
}`,
      output: "INT_MAX = 2147483647\nas long long: 2147483648\nbig + 1 would overflow int: yes\nunsigned 0 - 1 = 4294967295\nv[0] = 0 (vectors start zeroed)\nv.at(3) throws instead of reading garbage\n",
      notes: [
        { line: 10, text: "Widen first, then add: the sum fits in `long long`." },
        { line: 12, text: "Check before adding: `big + 1` would overflow exactly when `big > INT_MAX - 1`." },
        { line: 15, text: "Unsigned arithmetic wraps around — defined, unlike signed overflow." },
        { line: 20, text: "`at()` checks the index; `v[3]` would be undefined behaviour." },
      ],
    },
    quickCheck: {
      prompt: "Which of these is undefined behaviour?",
      options: [
        { id: "a", text: "unsigned int u = 0; u--;", feedback: "Unsigned wrap-around is well-defined (u becomes the largest unsigned value)." },
        { id: "b", text: "int x = INT_MAX; x++;", feedback: "Right: signed integer overflow is undefined behaviour." },
        { id: "c", text: "vector<int> v(3); v.at(5);", feedback: "`at()` is defined to throw `out_of_range`." },
      ],
      correct: "b",
      explanation: "Signed overflow is UB; unsigned wrap-around and `at()`'s exception are defined behaviour.",
    },
    exercise: {
      title: "Overflow-safe addition",
      prompt: `Write \`bool safeAdd(int a, int b, int& out)\`: if \`a + b\` fits in an \`int\`, store it in \`out\` and return \`true\`; otherwise return \`false\` — **without ever computing an overflowing \`int\` sum** (that would be undefined behaviour).

\`main\` reads \`t\` pairs and prints the sum or \`overflow\`.`,
      starterCode: r`#include <climits>
#include <iostream>
using namespace std;

bool safeAdd(int a, int b, int& out) {
    out = a + b;   // undefined behaviour when the sum doesn't fit!
    return true;
}

int main() {
    int t;
    cin >> t;
    for (int i = 0; i < t; i++) {
        int a, b, sum;
        cin >> a >> b;
        if (safeAdd(a, b, sum)) {
            cout << sum << endl;
        } else {
            cout << "overflow" << endl;
        }
    }
    return 0;
}`,
      tests: [
        { label: "small and at both limits", input: "3\n1 2\n2147483647 1\n-2147483648 -1\n", output: "3\noverflow\noverflow", visibility: "sample", category: "normal" },
        { label: "exactly at the limits", input: "2\n2147483647 0\n-2147483648 2147483647\n", output: "2147483647\n-1", visibility: "hidden", category: "boundary" },
        { label: "two billion fits, minus 2.5 billion does not", input: "2\n1000000000 1000000000\n-1000000000 -1500000000\n", output: "2000000000\noverflow", visibility: "hidden", category: "edge" },
        { label: "just fits", input: "1\n2147483646 1\n", output: "2147483647", visibility: "hidden", category: "boundary" },
      ],
      compare: "lines",
      hints: [
        "When can adding two ints overflow upwards? When can it overflow downwards?",
        "Upwards only if `b > 0` and `a` is already too close to `INT_MAX`; downwards only if `b < 0` and `a` is too close to `INT_MIN`.",
        "Rearrange so nothing overflows: `a + b > INT_MAX` is the same as `a > INT_MAX - b` (safe to compute when `b > 0`).",
        "`if (b > 0 && a > INT_MAX - b) return false; if (b < 0 && a < INT_MIN - b) return false; out = a + b; return true;`",
      ],
      solution: r`#include <climits>
#include <iostream>
using namespace std;

bool safeAdd(int a, int b, int& out) {
    if (b > 0 && a > INT_MAX - b) {
        return false;
    }
    if (b < 0 && a < INT_MIN - b) {
        return false;
    }
    out = a + b;
    return true;
}

int main() {
    int t;
    cin >> t;
    for (int i = 0; i < t; i++) {
        int a, b, sum;
        cin >> a >> b;
        if (safeAdd(a, b, sum)) {
            cout << sum << endl;
        } else {
            cout << "overflow" << endl;
        }
    }
    return 0;
}`,
      solutionNotes: "`INT_MAX - b` can't overflow when `b > 0`, and `INT_MIN - b` can't when `b < 0`, so every expression evaluated is defined. The addition only happens once it's known to fit. (GCC and Clang also offer `__builtin_add_overflow`, a non-standard extension.)",
    },
    explainAgain: `Undefined behaviour is driving through a red light at 3 a.m. "It worked" — no crash — doesn't mean it was allowed, and it doesn't mean it will work next time. The compiler is a driver who assumes nobody ever runs red lights and plans the route accordingly. Checks *before* the risky step are the brakes.`,
    summary: [
      "Undefined behaviour means no guarantees at all — a correct-looking run proves nothing.",
      "Main sources: out-of-bounds, signed overflow, uninitialised values, dangling references, data races.",
      "Check before the risky operation, initialise everything, and test with warnings and sanitizers.",
    ],
  },
];
