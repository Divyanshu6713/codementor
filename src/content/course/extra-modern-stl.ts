import type { CourseLesson } from "./types";
import { practice, starter, T } from "./practice/helpers";

const r = String.raw;

/** New lessons for Module 10 (modern C++) and Module 11 (the STL). */
export const EXTRA_MODERN_STL_LESSONS: CourseLesson[] = [
  // ── Module 10 ─────────────────────────────────────────────────────────────
  {
    id: "const-correctness",
    moduleId: "modern-cpp",
    after: "auto-lambdas",
    title: "const correctness in depth",
    minutes: 15,
    concepts: ["const member function", "pointer to const", "mutable"],
    goals: [
      "Mark member functions `const` when they don't change the object",
      "Read `const int*`, `int* const` and `const int* const`",
      "Use `mutable` for caches that don't change the observable value",
    ],
    intro: `\`const\` isn't just for constants. Used consistently, it documents which functions read and which ones change, lets the compiler catch accidental modifications — and is required the moment you pass objects by \`const&\`.`,
    sections: [
      {
        title: "const member functions",
        body: `\`\`\`cpp
class Account {
    long long bal = 0;
public:
    long long balance() const { return bal; }   // promises not to change *this
    void deposit(long long x) { bal += x; }
};

void show(const Account& a) {
    cout << a.balance();   // OK: balance() is const
    a.deposit(5);          // error: deposit isn't const
}
\`\`\`

Rule: if a member function doesn't change the object, mark it \`const\`. Otherwise it can't be called on const objects or through \`const&\`.`,
      },
      {
        title: "const and pointers",
        body: `Read right to left:

| Declaration | Meaning |
| --- | --- |
| \`const int* p\` | pointer to a const int: can't change \`*p\`, can move p |
| \`int* const p\` | const pointer to int: can change \`*p\`, can't move p |
| \`const int* const p\` | neither |`,
      },
      {
        title: "mutable",
        body: `Sometimes a const function needs to update internal bookkeeping that doesn't change the object's *observable* value — like a cache. Mark that member \`mutable\`:

\`\`\`cpp
mutable optional<long long> cachedSum;
long long sum() const { if (!cachedSum) cachedSum = compute(); return *cachedSum; }
\`\`\``,
      },
    ],
    mistakes: [
      { title: "Forgetting const on getters", body: "Then `const&` parameters can't call them — the first error appears far from the real cause." },
      { title: "Casting const away", body: "`const_cast` to modify a truly const object is undefined behaviour. Fix the design instead." },
      { title: "Overusing mutable", body: "mutable is for caches and counters, not a way to sneak changes into const functions." },
    ],
    example: {
      title: "const methods, const pointers, mutable",
      intro: "A class whose reads are const, plus the two kinds of const pointer.",
      code: r`#include <iostream>
#include <vector>
using namespace std;

class Scores {
    vector<int> v;
    mutable int queries = 0;
public:
    void add(int x) { v.push_back(x); }
    int best() const {
        queries++;
        int b = v[0];
        for (int x : v) if (x > b) b = x;
        return b;
    }
    int queryCount() const { return queries; }
};

void report(const Scores& s) {
    cout << "best " << s.best() << endl;
}

int main() {
    Scores s;
    s.add(70); s.add(95); s.add(80);
    report(s);
    report(s);
    cout << "queries " << s.queryCount() << endl;
    int a = 1, b = 2;
    const int* p = &a;
    p = &b;
    int* const q = &a;
    *q = 10;
    cout << *p << " " << a << endl;
    return 0;
}`,
      output: "best 95\nbest 95\nqueries 2\n2 10\n",
      notes: [
        { line: 10, text: "best() is const, so report can call it through a const&." },
        { line: 11, text: "A mutable counter may change even inside a const function." },
        { line: 30, text: "Pointer to const: the pointer can move to b." },
        { line: 32, text: "Const pointer: it can't move, but *q can change a." },
      ],
    },
    quickCheck: {
      prompt: "`const int* p = &x;` Which line compiles?",
      options: [
        { id: "a", text: "`p = &y;`", feedback: "Yes — the pointer itself isn't const; the int it points to is." },
        { id: "b", text: "`*p = 5;`", feedback: "p points to a const int, so you can't write through it." },
        { id: "c", text: "Neither", feedback: "Re-pointing p is allowed." },
      ],
      correct: "a",
      explanation: "`const int*` makes the pointee read-only, not the pointer.",
    },
    exercise: {
      title: "Make it const-correct",
      prompt: `This program doesn't compile: \`printReport\` takes a \`const Inventory&\`, but the class's read-only functions aren't marked \`const\`. Add \`const\` where it belongs (don't remove it from printReport). Then it reads \`n\` items as \`NAME QTY\` and prints the report.`,
      starterCode: r`#include <iostream>
#include <string>
#include <vector>
using namespace std;

class Inventory {
    vector<pair<string, int>> items;
public:
    void add(const string& name, int qty) { items.push_back({name, qty}); }
    int count() { return items.size(); }
    int total() {
        int t = 0;
        for (auto& it : items) t += it.second;
        return t;
    }
    string largest() {
        if (items.empty()) return "none";
        auto best = items[0];
        for (auto& it : items) if (it.second > best.second) best = it;
        return best.first;
    }
};

void printReport(const Inventory& inv) {
    cout << "items: " << inv.count() << endl;
    cout << "total: " << inv.total() << endl;
    cout << "largest: " << inv.largest() << endl;
}

int main() {
    int n;
    cin >> n;
    Inventory inv;
    for (int i = 0; i < n; i++) {
        string name;
        int q;
        cin >> name >> q;
        inv.add(name, q);
    }
    printReport(inv);
    return 0;
}`,
      tests: [
        { label: "sample", input: "3\npens 10\nink 4\npads 25\n", output: "items: 3\ntotal: 39\nlargest: pads", visibility: "sample", category: "normal" },
        { label: "empty", input: "0\n", output: "items: 0\ntotal: 0\nlargest: none", visibility: "hidden", category: "edge" },
        { label: "tie", input: "2\na 5\nb 5\n", output: "items: 2\ntotal: 10\nlargest: a", visibility: "hidden", category: "edge" },
      ],
      compare: "lines",
      hints: [
        "Read the error: which functions are called on a const object?",
        "count, total and largest only read the items.",
        "Add `const` after their parameter lists: `int count() const`.",
        "Inside const functions, loop with `const auto&`.",
      ],
      solution: r`#include <iostream>
#include <string>
#include <vector>
using namespace std;

class Inventory {
    vector<pair<string, int>> items;
public:
    void add(const string& name, int qty) { items.push_back({name, qty}); }
    int count() const { return items.size(); }
    int total() const {
        int t = 0;
        for (const auto& it : items) t += it.second;
        return t;
    }
    string largest() const {
        if (items.empty()) return "none";
        auto best = items[0];
        for (const auto& it : items) if (it.second > best.second) best = it;
        return best.first;
    }
};

void printReport(const Inventory& inv) {
    cout << "items: " << inv.count() << endl;
    cout << "total: " << inv.total() << endl;
    cout << "largest: " << inv.largest() << endl;
}

int main() {
    int n;
    cin >> n;
    Inventory inv;
    for (int i = 0; i < n; i++) {
        string name;
        int q;
        cin >> name >> q;
        inv.add(name, q);
    }
    printReport(inv);
    return 0;
}`,
      solutionNotes: "Three readers become const; `add` stays non-const because it changes the inventory. Now the compiler enforces the split.",
    },
    practice: practice(
      {
        title: "Pointer to const, const pointer",
        prompt: `Write \`long long sum(const int* p, int n)\` (it may move p but never write through it) and \`void fill(int* const p, int n, int value)\` (it writes through p but never moves it). Read n and n numbers into a vector; print the sum, then fill everything with the first number and print the vector.`,
        starterCode: starter("Implement sum(const int*, int) and fill(int* const, int, int); use them", "int n;\ncin >> n;\nvector<int> v(n);\nfor (auto& x : v) cin >> x;", ["iostream", "vector"], "// Write sum and fill here"),
        tests: [
          T("sample", "3\n4 5 6\n", "15\n4 4 4", "sample"),
          T("single", "1\n-2\n", "-2\n-2", "visible", "boundary"),
          T("negatives", "4\n-1 2 -3 4\n", "2\n-1 -1 -1 -1", "hidden"),
        ],
        compare: "lines",
        hints: [
          "sum: `for (int i = 0; i < n; i++, p++) total += *p;` — moving p is fine.",
          "fill: `for (int i = 0; i < n; i++) p[i] = value;` — p itself never changes.",
          "Pass v.data() to get a pointer to the first element.",
          "Read the first element before filling.",
        ],
        solution: r`#include <iostream>
#include <vector>
using namespace std;

long long sum(const int* p, int n) {
    long long total = 0;
    for (int i = 0; i < n; i++, p++) total += *p;
    return total;
}

void fill(int* const p, int n, int value) {
    for (int i = 0; i < n; i++) p[i] = value;
}

int main() {
    int n;
    cin >> n;
    vector<int> v(n);
    for (auto& x : v) cin >> x;
    cout << sum(v.data(), n) << endl;
    fill(v.data(), n, v[0]);
    for (int i = 0; i < n; i++) cout << v[i] << (i + 1 < n ? " " : "\n");
    return 0;
}`,
        solutionNotes: "`const int*` documents \"read-only access\"; `int* const` documents \"this pointer won't be re-aimed\". The compiler rejects any code that breaks either promise.",
      },
      {
        title: "A cached statistic",
        prompt: `Write a class \`Stats\` holding numbers, with \`add(x)\` and a **const** \`median()\` that sorts a copy only when the data changed since the last call — cache the result in \`mutable\` members, and count real computations in a mutable counter. Commands: \`add X\`, \`median\` (print it; lower median for even counts; \`none\` if empty). At the end print \`computed N times\`.`,
        starterCode: starter("Implement Stats with a mutable cache; handle add/median; print the computation count", "", ["iostream", "vector", "algorithm", "string"], "// Write class Stats here"),
        tests: [
          T("sample", "add 5\nadd 1\nmedian\nmedian\nadd 3\nmedian\n", "1\n1\n3\ncomputed 2 times", "sample"),
          T("empty", "median\n", "none\ncomputed 0 times", "visible", "edge"),
          T("no queries", "add 1\nadd 2\n", "computed 0 times", "hidden", "edge"),
          T("repeated", "add 9\nmedian\nmedian\nmedian\n", "9\n9\n9\ncomputed 1 times", "hidden"),
        ],
        compare: "lines",
        hints: [
          "Members: vector<long long> data; mutable bool dirty = true; mutable long long cached; mutable int computations = 0.",
          "add pushes and sets dirty = true.",
          "median() const: if dirty, sort a copy, store the lower median, computations++, dirty = false.",
          "Lower median of size n: element (n − 1) / 2 of the sorted copy.",
        ],
        solution: r`#include <iostream>
#include <vector>
#include <algorithm>
#include <string>
using namespace std;

class Stats {
    vector<long long> data;
    mutable bool dirty = true;
    mutable long long cached = 0;
    mutable int computations = 0;
public:
    void add(long long x) { data.push_back(x); dirty = true; }
    bool empty() const { return data.empty(); }
    long long median() const {
        if (dirty) {
            vector<long long> s = data;
            sort(s.begin(), s.end());
            cached = s[(s.size() - 1) / 2];
            computations++;
            dirty = false;
        }
        return cached;
    }
    int computed() const { return computations; }
};

int main() {
    Stats st;
    string cmd;
    while (cin >> cmd) {
        if (cmd == "add") {
            long long x;
            cin >> x;
            st.add(x);
        } else if (cmd == "median") {
            if (st.empty()) cout << "none" << endl;
            else cout << st.median() << endl;
        }
    }
    cout << "computed " << st.computed() << " times" << endl;
    return 0;
}`,
        solutionNotes: "median() is logically const — asking twice can't change the answer — so it stays const. The cache and counter are implementation details, which is exactly what mutable is for.",
      },
    ),
    explainAgain: `const is a promise you write into the code. On a function, "I only look." On a parameter, "I won't change what you lend me." On a pointer, either "I won't write through it" or "I won't point it elsewhere". The compiler holds you to every promise — which catches bugs early.`,
    summary: [
      "Mark read-only member functions `const`; const objects and `const&` can only call those.",
      "`const int*` = read-only target; `int* const` = fixed pointer.",
      "`mutable` is for caches and counters inside const functions.",
    ],
  },

  {
    id: "function-pointers",
    moduleId: "modern-cpp",
    after: "const-correctness",
    title: "Function pointers and std::function",
    minutes: 15,
    concepts: ["function pointer", "std::function", "callback", "dispatch table"],
    goals: [
      "Store and call functions through function pointers",
      "Use `std::function` to hold any callable: functions, lambdas with captures, functors",
      "Replace long if/else chains with a table of functions",
    ],
    intro: `Functions can be values too: stored in variables, kept in a map, passed to other functions. That's how sort takes a comparator, how buttons run callbacks, and how a calculator can look up an operation instead of using a giant switch.`,
    sections: [
      {
        title: "Function pointers",
        body: `\`\`\`cpp
int add(int a, int b) { return a + b; }
int (*op)(int, int) = add;    // a pointer to a function taking (int, int), returning int
cout << op(2, 3);             // 5
\`\`\`

The syntax is awkward; \`using BinOp = int(*)(int, int);\` helps. Plain function pointers can't hold lambdas that capture variables.`,
      },
      {
        title: "std::function",
        body: `\`std::function<int(int, int)>\` holds **any** callable with that signature — a function, a capturing lambda, a function object:

\`\`\`cpp
int bonus = 10;
function<int(int)> f = [bonus](int x) { return x + bonus; };
\`\`\`

It's a little slower than a direct call, but far more flexible.`,
      },
      {
        title: "Dispatch tables",
        body: `\`\`\`cpp
map<char, function<long long(long long, long long)>> ops = {
    {'+', [](long long a, long long b) { return a + b; }},
    {'*', [](long long a, long long b) { return a * b; }},
};
cout << ops.at('*')(6, 7);   // 42
\`\`\`

Adding an operation means adding one entry — no switch to update.`,
      },
    ],
    mistakes: [
      { title: "Calling an empty std::function", body: "Calling a default-constructed std::function throws bad_function_call. Check it (`if (f)`) or use `map::find`." },
      { title: "Capturing lambdas in function pointers", body: "Only captureless lambdas convert to function pointers. Use std::function for the rest." },
      { title: "Dangling captures", body: "A stored lambda that captured a local by reference dangles once that local is gone. Capture by value when the callback outlives the scope." },
    ],
    example: {
      title: "A table of operations",
      intro: "Functions, a capturing lambda and a function pointer, all called the same way.",
      code: r`#include <iostream>
#include <functional>
#include <map>
using namespace std;

long long power(long long a, long long b) {
    long long r = 1;
    while (b-- > 0) r *= a;
    return r;
}

int main() {
    map<char, function<long long(long long, long long)>> ops = {
        {'+', [](long long a, long long b) { return a + b; }},
        {'-', [](long long a, long long b) { return a - b; }},
        {'^', power},
    };
    cout << ops['+'](2, 3) << " " << ops['-'](2, 3) << " " << ops['^'](2, 10) << endl;
    int calls = 0;
    function<int(int)> twice = [&calls](int x) { calls++; return 2 * x; };
    cout << twice(twice(5)) << " after " << calls << " calls" << endl;
    long long (*fp)(long long, long long) = power;
    cout << fp(3, 3) << endl;
    return 0;
}`,
      output: "5 -1 1024\n20 after 2 calls\n27\n",
      notes: [
        { line: 13, text: "One map holds lambdas and a normal function alike." },
        { line: 20, text: "A capturing lambda inside a std::function." },
        { line: 22, text: "A plain function pointer to power." },
      ],
    },
    quickCheck: {
      prompt: "Which can hold `[count](int x) { return x + count; }`?",
      options: [
        { id: "a", text: "`std::function<int(int)>`", feedback: "Yes — std::function holds any callable, including capturing lambdas." },
        { id: "b", text: "`int (*)(int)`", feedback: "A capturing lambda can't convert to a plain function pointer." },
        { id: "c", text: "Neither", feedback: "std::function can." },
      ],
      correct: "a",
      explanation: "Only captureless lambdas convert to function pointers; std::function stores anything callable.",
    },
    exercise: {
      title: "A calculator with a dispatch table",
      prompt: `Build a \`map<string, function<long long(long long, long long)>>\` with \`add\`, \`sub\`, \`mul\`, \`max\` and \`pow\` (non-negative exponent). Read lines \`OP A B\` until the input ends and print the result, or \`unknown\` for an operation that isn't in the table. No if/else chain on the operation name.`,
      starterCode: r`#include <iostream>
#include <functional>
#include <map>
#include <string>
using namespace std;

int main() {
    map<string, function<long long(long long, long long)>> ops;
    // fill the table

    string op;
    long long a, b;
    while (cin >> op >> a >> b) {
        // look up op and print the result or unknown
    }
    return 0;
}`,
      tests: [
        { label: "sample", input: "add 2 3\nmul 6 7\npow 2 10\n", output: "5\n42\n1024", visibility: "sample", category: "normal" },
        { label: "unknown", input: "div 6 3\n", output: "unknown", visibility: "hidden", category: "edge" },
        { label: "max and sub", input: "max -3 -8\nsub 1 10\n", output: "-3\n-9", visibility: "hidden", category: "normal" },
        { label: "pow zero", input: "pow 9 0\n", output: "1", visibility: "hidden", category: "edge" },
      ],
      compare: "lines",
      hints: [
        "ops[\"add\"] = [](long long a, long long b) { return a + b; };",
        "max: return a > b ? a : b.",
        "Look up with find so an unknown name isn't inserted.",
        "auto it = ops.find(op); if (it == ops.end()) unknown; else it->second(a, b).",
      ],
      solution: r`#include <iostream>
#include <functional>
#include <map>
#include <string>
using namespace std;

int main() {
    map<string, function<long long(long long, long long)>> ops;
    ops["add"] = [](long long a, long long b) { return a + b; };
    ops["sub"] = [](long long a, long long b) { return a - b; };
    ops["mul"] = [](long long a, long long b) { return a * b; };
    ops["max"] = [](long long a, long long b) { return a > b ? a : b; };
    ops["pow"] = [](long long a, long long b) {
        long long r = 1;
        while (b-- > 0) r *= a;
        return r;
    };
    string op;
    long long a, b;
    while (cin >> op >> a >> b) {
        auto it = ops.find(op);
        if (it == ops.end()) cout << "unknown" << endl;
        else cout << it->second(a, b) << endl;
    }
    return 0;
}`,
      solutionNotes: "The map turns \"which operation?\" into a lookup. Using find avoids creating an empty std::function for unknown names (calling one would throw).",
    },
    practice: practice(
      {
        title: "A pipeline of steps",
        prompt: `Available steps: \`double\`, \`square\`, \`negate\`, \`inc\`. Read a number k and k step names to build a pipeline (a \`vector<function<long long(long long)>>\`). Then read values until the input ends and print each value after passing through every step in order.`,
        starterCode: starter("Build the pipeline from the step names, then run every value through it", "int k;\ncin >> k;", ["iostream", "functional", "map", "string", "vector"]),
        tests: [
          T("sample", "2\ninc square\n1 2 3\n", "4\n9\n16", "sample"),
          T("no steps", "0\n7\n", "7", "visible", "edge"),
          T("order matters", "2\nsquare inc\n3\n", "10", "hidden", "edge"),
          T("all", "4\ndouble negate inc square\n5\n", "81", "hidden"),
        ],
        compare: "lines",
        hints: [
          "A map from step name to function makes building the pipeline easy.",
          "pipeline.push_back(table[name]);",
          "For each value: for (auto& f : pipeline) x = f(x);",
          "double then negate then inc then square on 5: 10 → −10 → −9 → 81.",
        ],
        solution: r`#include <iostream>
#include <functional>
#include <map>
#include <string>
#include <vector>
using namespace std;

int main() {
    map<string, function<long long(long long)>> table = {
        {"double", [](long long x) { return 2 * x; }},
        {"square", [](long long x) { return x * x; }},
        {"negate", [](long long x) { return -x; }},
        {"inc", [](long long x) { return x + 1; }},
    };
    int k;
    cin >> k;
    vector<function<long long(long long)>> pipeline;
    for (int i = 0; i < k; i++) {
        string name;
        cin >> name;
        pipeline.push_back(table.at(name));
    }
    long long x;
    while (cin >> x) {
        for (auto& f : pipeline) x = f(x);
        cout << x << endl;
    }
    return 0;
}`,
        solutionNotes: "Functions stored in a vector become data: the program's behaviour is assembled at run time from the input.",
      },
      {
        title: "Event callbacks with state",
        prompt: `An event bus maps event names to lists of callbacks. Commands: \`counter EVENT\` registers a callback that counts how many times EVENT fired and prints \`EVENT count N\`; \`echo EVENT TEXT\` registers one that prints TEXT; \`fire EVENT\` runs all callbacks for EVENT in registration order (nothing if none). Each counter callback keeps **its own** count in its captured state.`,
        starterCode: starter("Store vector<function<void()>> per event; counters capture their own count", "map<string, vector<function<void()>>> bus;\nstring cmd;", ["iostream", "functional", "map", "string", "vector", "memory"]),
        tests: [
          T("sample", "counter click\necho click hello\nfire click\nfire click\n", "click count 1\nhello\nclick count 2\nhello", "sample"),
          T("unknown event", "fire nothing\n", "", "visible", "edge"),
          T("two counters", "counter a\ncounter a\nfire a\n", "a count 1\na count 1", "hidden", "edge"),
          T("separate events", "counter a\ncounter b\nfire a\nfire a\nfire b\n", "a count 1\na count 2\nb count 1", "hidden"),
        ],
        compare: "lines",
        hints: [
          "A lambda declared `mutable` can change its own captured copy: [name, n = 0]() mutable { … }.",
          "Push the callbacks into bus[event].",
          "echo captures the text by value.",
          "fire: loop over bus[event] and call each function — use find so unknown events do nothing.",
        ],
        solution: r`#include <iostream>
#include <functional>
#include <map>
#include <string>
#include <vector>
#include <memory>
using namespace std;

int main() {
    map<string, vector<function<void()>>> bus;
    string cmd;
    while (cin >> cmd) {
        string event;
        cin >> event;
        if (cmd == "counter") {
            bus[event].push_back([event, n = 0]() mutable {
                n++;
                cout << event << " count " << n << endl;
            });
        } else if (cmd == "echo") {
            string text;
            cin >> text;
            bus[event].push_back([text]() { cout << text << endl; });
        } else if (cmd == "fire") {
            auto it = bus.find(event);
            if (it != bus.end()) for (auto& cb : it->second) cb();
        }
    }
    return 0;
}`,
        solutionNotes: "Each `counter` creates a new lambda with its own `n`, so two counters on one event count independently. std::function stores these stateful callables just like plain functions.",
      },
    ),
    explainAgain: `A function pointer is a phone number for a function: you can write it down, store it and call it later. std::function is a contact card that can hold a phone number *or* a person with their own notes (a lambda with captured values). Tables of them let data decide what code runs.`,
    summary: [
      "Function pointers store plain functions: `int (*f)(int)`.",
      "`std::function<R(Args...)>` stores any callable, including capturing lambdas.",
      "A `map<key, function<...>>` replaces long if/else dispatch chains.",
    ],
  },

  {
    id: "variadic-templates",
    moduleId: "modern-cpp",
    after: "templates",
    title: "Variadic templates",
    minutes: 15,
    concepts: ["parameter pack", "fold expression", "sizeof..."],
    goals: [
      "Write functions that accept any number of arguments of any types",
      "Expand parameter packs with fold expressions (C++17)",
      "Recognise recursive variadic templates in older code",
    ],
    intro: `How does \`make_unique<T>(args...)\` forward any number of constructor arguments? With **variadic templates**: templates that take a *pack* of parameters. Fold expressions make them short and readable.`,
    sections: [
      {
        title: "Parameter packs",
        body: `\`\`\`cpp
template <typename... Ts>          // a pack of types
int countArgs(Ts... args) {        // a pack of values
    return sizeof...(args);        // how many
}
countArgs(1, "two", 3.0);          // 3
\`\`\``,
      },
      {
        title: "Fold expressions",
        body: `A fold applies an operator across the whole pack:

\`\`\`cpp
template <typename... Ts>
auto sumAll(Ts... xs) { return (xs + ... + 0); }   // xs1 + (xs2 + (... + 0))

template <typename... Ts>
void printAll(Ts... xs) { ((cout << xs << " "), ...); }  // fold over the comma operator
\`\`\``,
      },
      {
        title: "The older recursive style",
        body: `Before C++17, packs were processed one element at a time with recursion plus a base case:

\`\`\`cpp
long long maxOf(long long x) { return x; }                 // base case
template <typename... Ts>
long long maxOf(long long x, Ts... rest) {                  // peel off the first
    long long m = maxOf(rest...);
    return x > m ? x : m;
}
\`\`\``,
      },
    ],
    mistakes: [
      { title: "Forgetting the brackets around a fold", body: "A fold must be in parentheses: `(xs + ...)`." },
      { title: "Empty packs", body: "`(xs + ...)` with no arguments doesn't compile for +; give an initial value: `(xs + ... + 0)`." },
      { title: "Missing base case", body: "Recursive variadic functions need a non-variadic overload to stop the recursion." },
    ],
    example: {
      title: "Counting, summing and printing a pack",
      intro: "Three fold-expression helpers called with different numbers of arguments.",
      code: r`#include <iostream>
#include <string>
using namespace std;

template <typename... Ts>
int countArgs(Ts... args) { return sizeof...(args); }

template <typename... Ts>
auto sumAll(Ts... xs) { return (xs + ... + 0); }

template <typename... Ts>
void printAll(Ts... xs) {
    ((cout << xs << ' '), ...);
    cout << endl;
}

int main() {
    cout << countArgs() << " " << countArgs(1, 'a', 2.5) << endl;
    cout << sumAll(1, 2, 3, 4) << " " << sumAll() << endl;
    printAll("x =", 42, 'c', 3.5, string("done"));
    return 0;
}`,
      output: "0 3\n10 0\nx = 42 c 3.5 done \n",
      notes: [
        { line: 6, text: "sizeof... counts the arguments in the pack." },
        { line: 9, text: "A binary fold with 0 as the starting value handles the empty case." },
        { line: 13, text: "Folding over the comma operator runs the output once per argument, in order." },
      ],
    },
    quickCheck: {
      prompt: "What does `sumAll(5, 10, 20)` return if `sumAll` is `(xs + ... + 0)`?",
      options: [
        { id: "a", text: "35", feedback: "Yes: 5 + (10 + (20 + 0))." },
        { id: "b", text: "3", feedback: "That's the number of arguments (sizeof...)." },
        { id: "c", text: "It doesn't compile", feedback: "Folds over + work for any number of arguments." },
      ],
      correct: "a",
      explanation: "The fold expands to 5 + (10 + (20 + 0)).",
    },
    exercise: {
      title: "Sum and count any number of values",
      prompt: `Write \`sumAll(xs...)\` with a fold expression and \`countArgs(xs...)\` with \`sizeof...\`. Read four whole numbers a, b, c, d and print four lines: \`sumAll(a) countArgs(a)\`, then the same for (a, b), (a, b, c) and (a, b, c, d).`,
      starterCode: r`#include <iostream>
using namespace std;

// Write template sumAll and countArgs here

int main() {
    long long a, b, c, d;
    cin >> a >> b >> c >> d;
    // print sum and count for 1, 2, 3 and 4 arguments

    return 0;
}`,
      tests: [
        { label: "sample", input: "1 2 3 4\n", output: "1 1\n3 2\n6 3\n10 4", visibility: "sample", category: "normal" },
        { label: "negatives", input: "-5 5 -5 5\n", output: "-5 1\n0 2\n-5 3\n0 4", visibility: "hidden", category: "edge" },
        { label: "large", input: "1000000000 1000000000 1000000000 1000000000\n", output: "1000000000 1\n2000000000 2\n3000000000 3\n4000000000 4", visibility: "hidden", category: "edge" },
      ],
      compare: "lines",
      hints: [
        "template <typename... Ts> auto sumAll(Ts... xs) { return (xs + ...); }",
        "template <typename... Ts> int countArgs(Ts... xs) { return sizeof...(xs); }",
        "Call them with 1, 2, 3 and 4 arguments.",
        "Because a…d are long long, the sums are long long too.",
      ],
      solution: r`#include <iostream>
using namespace std;

template <typename... Ts>
auto sumAll(Ts... xs) { return (xs + ...); }

template <typename... Ts>
int countArgs(Ts... xs) { return sizeof...(xs); }

int main() {
    long long a, b, c, d;
    cin >> a >> b >> c >> d;
    cout << sumAll(a) << " " << countArgs(a) << endl;
    cout << sumAll(a, b) << " " << countArgs(a, b) << endl;
    cout << sumAll(a, b, c) << " " << countArgs(a, b, c) << endl;
    cout << sumAll(a, b, c, d) << " " << countArgs(a, b, c, d) << endl;
    return 0;
}`,
      solutionNotes: "The compiler generates one sumAll for each argument count it sees. A unary fold `(xs + ...)` is fine here because it's never called with zero arguments.",
    },
    practice: practice(
      {
        title: "maxOf, the recursive way",
        prompt: `Write \`maxOf\` as a **recursive** variadic template with a one-argument base case (no fold). Read five whole numbers a…e and print \`maxOf(a, b)\`, \`maxOf(a, b, c)\` and \`maxOf(a, b, c, d, e)\` on one line.`,
        starterCode: starter("Print maxOf(a, b), maxOf(a, b, c) and maxOf(a, b, c, d, e)", "long long a, b, c, d, e;\ncin >> a >> b >> c >> d >> e;", ["iostream"], "// Write the base case and the recursive variadic maxOf here"),
        tests: [
          T("sample", "3 9 4 1 7\n", "9 9 9", "sample"),
          T("last is max", "1 2 3 4 5\n", "2 3 5", "visible"),
          T("negatives", "-8 -3 -5 -1 -9\n", "-3 -3 -1", "hidden", "edge"),
          T("equal", "4 4 4 4 4\n", "4 4 4", "hidden", "edge"),
        ],
        hints: [
          "Base case: long long maxOf(long long x) { return x; }",
          "Recursive case: template <typename... Ts> long long maxOf(long long x, Ts... rest).",
          "Compute the max of the rest, then compare with x.",
          "Declare the base case first so the recursive one can see it.",
        ],
        solution: r`#include <iostream>
using namespace std;

long long maxOf(long long x) { return x; }

template <typename... Ts>
long long maxOf(long long x, Ts... rest) {
    long long m = maxOf(rest...);
    return x > m ? x : m;
}

int main() {
    long long a, b, c, d, e;
    cin >> a >> b >> c >> d >> e;
    cout << maxOf(a, b) << " " << maxOf(a, b, c) << " " << maxOf(a, b, c, d, e) << endl;
    return 0;
}`,
        solutionNotes: "Each call peels off the first argument and recurses on the rest until only one is left. The fold version would be `std::max({xs...})`, or a fold over a helper.",
      },
      {
        title: "Join anything",
        prompt: `Write \`template <typename... Ts> string joinAll(const string& sep, const Ts&... xs)\` that prints every argument (any printable type) into a string with \`sep\` between them, using an \`ostringstream\` and a fold. Read a name, an age, a height (decimal) and a separator, then print \`joinAll(sep, name, age, height)\` and \`joinAll(sep, age)\`.`,
        starterCode: starter("Print joinAll(sep, name, age, height) and joinAll(sep, age)", "string name, sep;\nint age;\ndouble height;\ncin >> name >> age >> height >> sep;", ["iostream", "sstream", "string"], "// Write joinAll here"),
        tests: [
          T("sample", "Asha 14 1.55 |\n", "Asha|14|1.55\n14", "sample"),
          T("longer sep", "Ravi 9 1.3 --\n", "Ravi--9--1.3\n9", "visible"),
          T("comma", "Z 0 2 ,\n", "Z,0,2\n0", "hidden", "edge"),
        ],
        compare: "lines",
        hints: [
          "Keep a bool `first = true` and an ostringstream.",
          "For each argument: if not first, write sep; then write the argument.",
          "A fold over the comma operator runs a lambda for each argument: (add(xs), ...);",
          "Return out.str().",
        ],
        solution: r`#include <iostream>
#include <sstream>
#include <string>
using namespace std;

template <typename... Ts>
string joinAll(const string& sep, const Ts&... xs) {
    ostringstream out;
    bool first = true;
    auto add = [&](const auto& x) {
        if (!first) out << sep;
        out << x;
        first = false;
    };
    (add(xs), ...);
    return out.str();
}

int main() {
    string name, sep;
    int age;
    double height;
    cin >> name >> age >> height >> sep;
    cout << joinAll(sep, name, age, height) << endl;
    cout << joinAll(sep, age) << endl;
    return 0;
}`,
        solutionNotes: "A generic lambda (`const auto& x`) handles each argument's type; the comma fold calls it once per argument, left to right.",
      },
    ),
    explainAgain: `A variadic template is a recipe that says "and the rest": it works for one ingredient, three, or ten, of any kinds. A fold expression is the instruction "do this between every pair" — add them all up, or print them all in a row.`,
    summary: [
      "`typename... Ts` and `Ts... args` declare packs; `sizeof...(args)` counts them.",
      "Folds like `(xs + ... + 0)` and `((cout << xs), ...)` expand a pack in one line.",
      "Older code recurses: peel off the first argument, with a base-case overload.",
    ],
  },

  {
    id: "namespaces-headers",
    moduleId: "modern-cpp",
    after: "modern-features",
    title: "Namespaces and headers",
    minutes: 15,
    concepts: ["namespace", "using declaration", "header file", "include guard"],
    goals: [
      "Group names in namespaces and avoid clashes",
      "Know why `using namespace std;` is risky in headers and big programs",
      "Understand what goes in a header and how include guards work",
    ],
    intro: `In a big program — or when combining libraries — two different things often want the same name: \`count\`, \`max\`, \`area\`. Namespaces keep them apart, and headers let many files share declarations.`,
    sections: [
      {
        title: "Namespaces",
        body: `\`\`\`cpp
namespace geometry {
    double area(double r) { return 3.14159 * r * r; }
}
namespace finance {
    double area(double w, double h) { return w * h; }   // "area" of a plot
}
geometry::area(2.0);
\`\`\`

Nested namespaces can be written \`namespace school::grades { … }\`, and long names can get an alias: \`namespace sg = school::grades;\`.`,
      },
      {
        title: "using: declarations and directives",
        body: `- \`using std::cout;\` brings in **one** name.
- \`using namespace std;\` brings in **all** of std's names — handy in small programs (and in these lessons), but it can collide with your own names. A global variable called \`count\` plus \`<algorithm>\` gives *reference to 'count' is ambiguous*.
- Never put \`using namespace\` in a header: it leaks into every file that includes it.`,
      },
      {
        title: "Headers and include guards",
        body: `A header (\`.h\`/\`.hpp\`) holds declarations shared by several \`.cpp\` files. Because headers can be included twice (directly and via another header), they're protected:

\`\`\`cpp
#pragma once            // most compilers
// or the portable form:
#ifndef GEOMETRY_H
#define GEOMETRY_H
double area(double r);
#endif
\`\`\`

(CodeMentor runs single files, so headers appear here as reading material.)`,
      },
    ],
    mistakes: [
      { title: "using namespace std in headers", body: "Every file that includes the header inherits all of std's names. Qualify names in headers instead." },
      { title: "Global names that clash with std", body: "`count`, `max`, `distance`, `data` and `size` are std names. Prefer local variables or your own namespace." },
      { title: "Defining non-inline functions in headers", body: "Two .cpp files including the header both define the function → 'multiple definition'. Declare in the header, define in one .cpp (or mark it `inline`)." },
    ],
    example: {
      title: "Same name, different namespaces",
      intro: "Two `area` functions coexist, plus a nested namespace and an alias.",
      code: r`#include <iostream>
#include <string>

namespace geometry {
    double area(double r) { return 3.0 * r * r; }
}

namespace finance {
    double area(double w, double h) { return w * h; }
}

namespace school::grades {
    std::string letter(int m) { return m >= 75 ? "A" : m >= 50 ? "B" : "C"; }
}

int main() {
    namespace sg = school::grades;
    using std::cout;
    using std::endl;
    cout << geometry::area(2) << " " << finance::area(3, 4) << endl;
    cout << sg::letter(80) << sg::letter(60) << sg::letter(10) << endl;
    return 0;
}`,
      output: "12 12\nABC\n",
      notes: [
        { line: 4, text: "geometry::area and finance::area don't clash." },
        { line: 12, text: "A nested namespace written in one line (C++17)." },
        { line: 17, text: "A namespace alias shortens a long name." },
        { line: 18, text: "Using-declarations bring in just the names you need." },
      ],
    },
    quickCheck: {
      prompt: "Why shouldn't a header file contain `using namespace std;`?",
      options: [
        { id: "a", text: "It forces every file that includes the header to import all of std's names", feedback: "Right — and they can't undo it." },
        { id: "b", text: "Headers can't contain using directives", feedback: "They can; it's just a bad idea." },
        { id: "c", text: "It makes the program slower", feedback: "It has no run-time cost; the problem is name clashes." },
      ],
      correct: "a",
      explanation: "A using directive in a header silently changes name lookup in every includer.",
    },
    exercise: {
      title: "Untangle the name clash",
      prompt: `This program doesn't compile: its global variable \`count\` clashes with \`std::count\` from \`<algorithm>\` because of \`using namespace std;\`. Fix the clash **without renaming the variable** (put it in a namespace, or stop importing all of std). Then it reads words until the input ends and prints how many there were and how many equal \`cpp\` (using \`std::count\`).`,
      starterCode: r`#include <iostream>
#include <algorithm>
#include <string>
#include <vector>
using namespace std;

int count = 0;

int main() {
    vector<string> words;
    string w;
    while (cin >> w) {
        words.push_back(w);
        count++;
    }
    cout << count << endl;
    cout << std::count(words.begin(), words.end(), "cpp") << endl;
    return 0;
}`,
      tests: [
        { label: "sample", input: "cpp is fun cpp\n", output: "4\n2", visibility: "sample", category: "normal" },
        { label: "none", input: "\n", output: "0\n0", visibility: "hidden", category: "edge" },
        { label: "no match", input: "java python\n", output: "2\n0", visibility: "hidden", category: "edge" },
      ],
      compare: "lines",
      hints: [
        "Read the error: *reference to 'count' is ambiguous*.",
        "Both `::count` and `std::count` are visible as plain `count`.",
        "Option 1: wrap the variable in `namespace app { int count = 0; }` and use `app::count`.",
        "Option 2: remove `using namespace std;` and write std:: where needed.",
      ],
      solution: r`#include <iostream>
#include <algorithm>
#include <string>
#include <vector>

namespace app {
    int count = 0;
}

int main() {
    std::vector<std::string> words;
    std::string w;
    while (std::cin >> w) {
        words.push_back(w);
        app::count++;
    }
    std::cout << app::count << std::endl;
    std::cout << std::count(words.begin(), words.end(), "cpp") << std::endl;
    return 0;
}`,
      solutionNotes: "Putting your own names in a namespace and qualifying std names removes the ambiguity entirely. In larger programs this is the normal style.",
    },
    practice: practice(
      {
        title: "Two libraries, one name",
        prompt: `Write \`namespace metric { double distance(double km) }\` returning metres and \`namespace imperial { double distance(double km) }\` returning miles (1 km = 0.621371 mi). Read kilometre values until the input ends and print both conversions with 2 decimals: \`M m, MI mi\`.`,
        starterCode: starter("Call metric::distance and imperial::distance for each value", "double km;", ["iostream", "iomanip"], "// Write the two namespaces here"),
        tests: [
          T("sample", "1\n", "1000.00 m, 0.62 mi", "sample"),
          T("marathon", "42.195\n", "42195.00 m, 26.22 mi", "visible"),
          T("zero", "0\n", "0.00 m, 0.00 mi", "hidden", "edge"),
        ],
        compare: "lines",
        hints: [
          "namespace metric { double distance(double km) { return km * 1000; } }",
          "The imperial version multiplies by 0.621371.",
          "Call them as metric::distance(km) and imperial::distance(km).",
          "fixed << setprecision(2) for both.",
        ],
        solution: r`#include <iostream>
#include <iomanip>
using namespace std;

namespace metric {
    double distance(double km) { return km * 1000; }
}

namespace imperial {
    double distance(double km) { return km * 0.621371; }
}

int main() {
    double km;
    cout << fixed << setprecision(2);
    while (cin >> km) {
        cout << metric::distance(km) << " m, " << imperial::distance(km) << " mi" << endl;
    }
    return 0;
}`,
        solutionNotes: "Same function name and signature, no clash: the namespace is part of each function's full name.",
      },
      {
        title: "Helpers private to one file",
        prompt: `An **unnamed namespace** makes names visible only inside one file — like \`static\` functions. Put a helper \`isVowel(char)\` and a counter in an unnamed namespace, and expose one public function \`text::vowelCount(const string&)\` in a named namespace. Read lines until the input ends and print the vowel count of each (a, e, i, o, u in either case).`,
        starterCode: starter("Implement the helpers in an unnamed namespace and text::vowelCount", "string line;", ["iostream", "string", "cctype"], "// namespace { … }  and  namespace text { … }"),
        tests: [
          T("sample", "Hello World\nC++\n", "3\n0", "sample"),
          T("all vowels", "AEIOUaeiou\n", "10", "visible", "edge"),
          T("empty line", "\n", "0", "hidden", "edge"),
        ],
        compare: "lines",
        hints: [
          "namespace { bool isVowel(char c) { … } }",
          "Inside it, lowercase with tolower and compare with the five vowels.",
          "namespace text { int vowelCount(const string& s) { … uses isVowel … } }",
          "Read with getline and print text::vowelCount(line).",
        ],
        solution: r`#include <iostream>
#include <string>
#include <cctype>
using namespace std;

namespace {
    bool isVowel(char c) {
        char l = static_cast<char>(tolower(static_cast<unsigned char>(c)));
        return l == 'a' || l == 'e' || l == 'i' || l == 'o' || l == 'u';
    }
}

namespace text {
    int vowelCount(const string& s) {
        int n = 0;
        for (char c : s) if (isVowel(c)) n++;
        return n;
    }
}

int main() {
    string line;
    while (getline(cin, line)) {
        cout << text::vowelCount(line) << endl;
    }
    return 0;
}`,
        solutionNotes: "Names in an unnamed namespace have internal linkage: another .cpp file could have its own isVowel without a 'multiple definition' error. The public API lives in a named namespace.",
      },
    ),
    explainAgain: `Namespaces are surnames for code. Two people called "area" can live in the same town if one is geometry::area and the other is finance::area. \`using namespace std;\` drops all of std's surnames — fine in a tiny program, confusing in a big one, and rude in a header that other files share.`,
    summary: [
      "Namespaces group names: `geometry::area` vs `finance::area`.",
      "Prefer `using std::cout;` or `std::` over `using namespace std;` in real projects — never in headers.",
      "Headers hold declarations, protected by `#pragma once` or include guards.",
    ],
  },

  // ── Module 11 ─────────────────────────────────────────────────────────────
  {
    id: "pair-tuple",
    moduleId: "stl",
    after: "vector-algorithms",
    title: "pair and tuple",
    minutes: 15,
    concepts: ["pair", "tuple", "structured bindings", "tie", "lexicographic order"],
    goals: [
      "Group two or more values with `pair` and `tuple`",
      "Unpack them with structured bindings",
      "Sort by several keys using tuple comparison",
    ],
    intro: `Sometimes you need to return two things from a function, or sort students by marks *and then* by name. \`pair\` and \`tuple\` bundle values without writing a struct, and they compare element by element — which makes multi-key sorting a one-liner.`,
    sections: [
      {
        title: "pair and tuple",
        body: `\`\`\`cpp
pair<string, int> p = {"Asha", 92};
p.first; p.second;

tuple<string, int, double> t = {"Ravi", 14, 1.55};
get<0>(t); get<2>(t);

auto [name, age, height] = t;     // structured bindings
\`\`\``,
      },
      {
        title: "Comparison is lexicographic",
        body: `Pairs and tuples compare the first elements, and only if those are equal, the second, and so on. So sorting a \`vector<pair<int, string>>\` orders by the int, breaking ties by the string.

To sort by marks **descending** and name ascending, compare tuples with the mark negated:

\`\`\`cpp
sort(v.begin(), v.end(), [](const Student& a, const Student& b) {
    return make_tuple(-a.mark, a.name) < make_tuple(-b.mark, b.name);
});
\`\`\``,
      },
      {
        title: "Returning several values",
        body: `\`\`\`cpp
tuple<int, int, double> stats(const vector<int>& v);   // min, max, average
auto [lo, hi, avg] = stats(v);
\`\`\`

For anything used widely, a named \`struct\` is clearer than \`get<2>(t)\`.`,
      },
    ],
    mistakes: [
      { title: "Unreadable get<N>", body: "`get<3>(t)` says nothing about meaning. Unpack with names, or use a struct." },
      { title: "Forgetting tie-break order", body: "Tuples compare left to right: put the most important key first." },
      { title: "Negating unsigned or strings", body: "Negation only works for signed numbers. For a descending string key, swap a and b in that position." },
    ],
    example: {
      title: "Sorting by two keys",
      intro: "Marks descending, then names ascending — with one tuple comparison.",
      code: r`#include <iostream>
#include <string>
#include <tuple>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<pair<string, int>> v = {{"Ravi", 80}, {"Asha", 95}, {"Meera", 80}, {"Zoe", 70}};
    sort(v.begin(), v.end(), [](const auto& a, const auto& b) {
        return make_tuple(-a.second, a.first) < make_tuple(-b.second, b.first);
    });
    for (const auto& [name, mark] : v) cout << name << " " << mark << endl;
    tuple<int, int, double> t = {1, 9, 4.5};
    auto [lo, hi, avg] = t;
    cout << lo << " " << hi << " " << avg << endl;
    return 0;
}`,
      output: "Asha 95\nMeera 80\nRavi 80\nZoe 70\n1 9 4.5\n",
      notes: [
        { line: 11, text: "Higher marks first (negated), then alphabetical." },
        { line: 13, text: "Structured bindings name each part." },
      ],
    },
    quickCheck: {
      prompt: "Which pair is smaller: `{3, \"b\"}` or `{3, \"a\"}`?",
      options: [
        { id: "a", text: "{3, \"a\"}", feedback: "Yes — the first elements tie, so the second decides." },
        { id: "b", text: "{3, \"b\"}", feedback: "\"a\" < \"b\", so {3, \"a\"} is smaller." },
        { id: "c", text: "They're equal", feedback: "Only if every element matches." },
      ],
      correct: "a",
      explanation: "Lexicographic comparison: first elements, then second elements on a tie.",
    },
    exercise: {
      title: "Rank by marks, then name",
      prompt: `Read \`n\` students as \`NAME MARK\`. Print them sorted by mark (highest first), ties by name (A→Z), using tuple comparison. Then print \`min max average\` of the marks (average with 2 decimals), returned from a function as a \`tuple<int, int, double>\` and unpacked with structured bindings.`,
      starterCode: r`#include <iostream>
#include <iomanip>
#include <string>
#include <tuple>
#include <vector>
#include <algorithm>
using namespace std;

// Write tuple<int, int, double> stats(const vector<pair<string, int>>& v) here

int main() {
    int n;
    cin >> n;
    vector<pair<string, int>> v(n);
    for (auto& [name, mark] : v) cin >> name >> mark;
    // sort, print, then print the stats

    return 0;
}`,
      tests: [
        { label: "sample", input: "4\nRavi 80\nAsha 95\nMeera 80\nZoe 70\n", output: "Asha 95\nMeera 80\nRavi 80\nZoe 70\n70 95 81.25", visibility: "sample", category: "normal" },
        { label: "one", input: "1\nSolo 50\n", output: "Solo 50\n50 50 50.00", visibility: "hidden", category: "boundary" },
        { label: "all tied", input: "3\nc 60\na 60\nb 60\n", output: "a 60\nb 60\nc 60\n60 60 60.00", visibility: "hidden", category: "edge" },
      ],
      compare: "lines",
      hints: [
        "Comparator: make_tuple(-a.second, a.first) < make_tuple(-b.second, b.first).",
        "stats loops once to find min, max and the sum.",
        "Return {lo, hi, (double)sum / v.size()}.",
        "auto [lo, hi, avg] = stats(v);",
      ],
      solution: r`#include <iostream>
#include <iomanip>
#include <string>
#include <tuple>
#include <vector>
#include <algorithm>
using namespace std;

tuple<int, int, double> stats(const vector<pair<string, int>>& v) {
    int lo = v[0].second, hi = v[0].second;
    long long sum = 0;
    for (const auto& [name, mark] : v) {
        lo = min(lo, mark);
        hi = max(hi, mark);
        sum += mark;
    }
    return {lo, hi, (double)sum / v.size()};
}

int main() {
    int n;
    cin >> n;
    vector<pair<string, int>> v(n);
    for (auto& [name, mark] : v) cin >> name >> mark;
    sort(v.begin(), v.end(), [](const auto& a, const auto& b) {
        return make_tuple(-a.second, a.first) < make_tuple(-b.second, b.first);
    });
    for (const auto& [name, mark] : v) cout << name << " " << mark << endl;
    auto [lo, hi, avg] = stats(v);
    cout << lo << " " << hi << " " << fixed << setprecision(2) << avg << endl;
    return 0;
}`,
      solutionNotes: "Tuple comparison expresses \"by this, then by that\" directly. Returning a tuple and unpacking it gives a function three named results.",
    },
    practice: practice(
      {
        title: "Closest points first",
        prompt: `Read \`n\` points \`x y\`. Sort them by squared distance from the origin, then by x, then by y (all ascending), using a \`vector<pair<int, int>>\` and tuple comparison. Print them one per line.`,
        starterCode: starter("Sort by (x*x + y*y, x, y)", "int n;\ncin >> n;\nvector<pair<int, int>> pts(n);\nfor (auto& [x, y] : pts) cin >> x >> y;", ["iostream", "vector", "tuple", "algorithm"]),
        tests: [
          T("sample", "4\n3 4\n-1 0\n0 1\n1 1\n", "-1 0\n0 1\n1 1\n3 4", "sample"),
          T("ties broken by x", "2\n0 -2\n-2 0\n", "-2 0\n0 -2", "visible", "edge"),
          T("same x", "2\n1 2\n1 -2\n", "1 -2\n1 2", "hidden", "edge"),
          T("origin", "1\n0 0\n", "0 0", "hidden", "boundary"),
        ],
        compare: "lines",
        hints: [
          "Key: make_tuple(x*x + y*y, x, y).",
          "Compare a's key with b's key using <.",
          "Use long long for the squared distance if coordinates are large.",
          "Print x and y separated by a space.",
        ],
        solution: r`#include <iostream>
#include <vector>
#include <tuple>
#include <algorithm>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<pair<int, int>> pts(n);
    for (auto& [x, y] : pts) cin >> x >> y;
    auto key = [](const pair<int, int>& p) {
        return make_tuple((long long)p.first * p.first + (long long)p.second * p.second, p.first, p.second);
    };
    sort(pts.begin(), pts.end(), [&](const auto& a, const auto& b) { return key(a) < key(b); });
    for (const auto& [x, y] : pts) cout << x << " " << y << endl;
    return 0;
}`,
        solutionNotes: "A key function returning a tuple keeps the comparator tiny and makes the sort order self-documenting.",
      },
      {
        title: "Swap with tie",
        prompt: `\`std::tie\` makes a tuple of **references**, so it can assign several variables at once. Read a, b and c, then rotate them so a gets b, b gets c and c gets a — in **one** statement using \`tie\` and \`make_tuple\`. Print \`a b c\`. Then use \`tie\` again to compute the next Fibonacci pair: starting from (x, y) = (0, 1), apply \`tie(x, y) = make_tuple(y, x + y)\` a times and print x.`,
        starterCode: starter("Rotate with tie(a, b, c) = make_tuple(b, c, a); then the Fibonacci loop", "long long a, b, c;\ncin >> a >> b >> c;", ["iostream", "tuple"]),
        tests: [
          T("sample", "5 2 3\n", "2 3 5\n1", "sample"),
          T("zero steps", "1 0 5\n", "0 5 1\n0", "visible", "edge"),
          T("more steps", "10 1 1\n", "1 1 10\n1", "hidden"),
          T("fib", "1 50 2\n", "50 2 1\n12586269025", "hidden"),
        ],
        compare: "lines",
        hints: [
          "make_tuple(b, c, a) copies the old values first, then tie assigns them.",
          "So the rotation needs no temporary variable.",
          "The Fibonacci step must also evaluate y and x + y before assigning.",
          "Loop the step `a` times — after the rotation, a holds the old b.",
        ],
        solution: r`#include <iostream>
#include <tuple>
using namespace std;

int main() {
    long long a, b, c;
    cin >> a >> b >> c;
    tie(a, b, c) = make_tuple(b, c, a);
    cout << a << " " << b << " " << c << endl;
    long long x = 0, y = 1;
    for (long long i = 0; i < a; i++) tie(x, y) = make_tuple(y, x + y);
    cout << x << endl;
    return 0;
}`,
        solutionNotes: "make_tuple evaluates every value from the *old* variables before tie assigns any of them, so simultaneous assignment just works. (For two values, `std::swap` does the same.)",
      },
    ),
    explainAgain: `A pair or tuple is an envelope holding a few values. Envelopes are compared like dictionary words: look at the first item; only if those match, look at the next. That's why putting your sort keys into a tuple — most important first — gives you multi-level sorting for free.`,
    summary: [
      "`pair<A, B>` and `tuple<A, B, C>` bundle values; unpack with `auto [x, y] = …`.",
      "They compare lexicographically: perfect for multi-key sorting.",
      "Return a tuple for a few results; prefer a struct when the meaning matters.",
    ],
  },

  {
    id: "multiset-multimap",
    moduleId: "stl",
    after: "map-set",
    title: "multiset and multimap",
    minutes: 15,
    concepts: ["multiset", "multimap", "equal_range", "erase one"],
    goals: [
      "Keep sorted collections that allow duplicate keys",
      "Remove one copy versus all copies",
      "Find all entries with a key using `equal_range`",
    ],
    intro: `\`set\` and \`map\` keep one entry per key. Real data often has duplicates — several students with the same mark, several phone numbers for one name. \`multiset\` and \`multimap\` keep them all, still sorted.`,
    sections: [
      {
        title: "multiset",
        body: `\`\`\`cpp
multiset<int> ms = {5, 1, 5, 3};   // {1, 3, 5, 5}
ms.count(5);          // 2
*ms.begin();          // smallest: 1
*ms.rbegin();         // largest: 5
ms.erase(5);          // removes ALL 5s!
ms.erase(ms.find(5)); // removes ONE 5
\`\`\`

Insert, erase and find are all O(log n), and the smallest and largest are always at the ends.`,
      },
      {
        title: "multimap",
        body: `\`\`\`cpp
multimap<string, string> phone;
phone.insert({"Asha", "98765"});
phone.insert({"Asha", "11111"});
auto [lo, hi] = phone.equal_range("Asha");
for (auto it = lo; it != hi; ++it) cout << it->second << " ";
\`\`\`

Equal keys stay in insertion order. multimap has no \`[]\` — there's no single value to return.`,
      },
      {
        title: "A useful pattern",
        body: `A multiset is a sorted bag you can add to and remove from in O(log n) — perfect for "what's the smallest end time right now?" (meeting rooms), running medians, or leaderboards that change.`,
      },
    ],
    mistakes: [
      { title: "erase(value) removes every copy", body: "Use `erase(ms.find(value))` to remove just one — and check find didn't return end()." },
      { title: "Using [] on multimap", body: "It doesn't exist. Use insert, find, equal_range or count." },
      { title: "Choosing set when duplicates matter", body: "A set silently drops the second 80 — your count of students would be wrong." },
    ],
    example: {
      title: "Duplicates kept, one removed",
      intro: "Counting, removing a single copy, and listing all values for a key.",
      code: r`#include <iostream>
#include <map>
#include <set>
#include <string>
using namespace std;

int main() {
    multiset<int> marks = {80, 95, 80, 70};
    cout << marks.size() << " " << marks.count(80) << endl;
    marks.erase(marks.find(80));
    for (int m : marks) cout << m << " ";
    cout << "| min " << *marks.begin() << " max " << *marks.rbegin() << endl;
    multimap<string, string> phone = {{"Asha", "98765"}, {"Ravi", "22222"}, {"Asha", "11111"}};
    auto [lo, hi] = phone.equal_range("Asha");
    for (auto it = lo; it != hi; ++it) cout << it->second << " ";
    cout << endl;
    return 0;
}`,
      output: "4 2\n70 80 95 | min 70 max 95\n98765 11111 \n",
      notes: [
        { line: 9, text: "Both 80s are kept." },
        { line: 10, text: "erase(find(x)) removes exactly one copy." },
        { line: 14, text: "equal_range gives all entries for a key, in insertion order." },
      ],
    },
    quickCheck: {
      prompt: "`multiset<int> s = {2, 2, 2};` What is `s.size()` after `s.erase(2);`?",
      options: [
        { id: "a", text: "0", feedback: "Right — erase by value removes every matching element." },
        { id: "b", text: "2", feedback: "That's what `s.erase(s.find(2))` would leave." },
        { id: "c", text: "It doesn't compile", feedback: "It compiles; it just removes more than people expect." },
      ],
      correct: "a",
      explanation: "erase(key) removes all elements equal to key and returns how many it removed.",
    },
    exercise: {
      title: "A live scoreboard",
      prompt: `Maintain a multiset of scores. Commands: \`add X\`, \`remove X\` (remove **one** X, or print \`missing\`), \`min\`, \`max\`, \`count X\`. Print \`empty\` for min/max on an empty board.`,
      starterCode: r`#include <iostream>
#include <set>
#include <string>
using namespace std;

int main() {
    multiset<long long> board;
    string cmd;
    while (cin >> cmd) {
        // add / remove / min / max / count
    }
    return 0;
}`,
      tests: [
        { label: "sample", input: "add 5\nadd 9\nadd 5\ncount 5\nremove 5\ncount 5\nmin\nmax\n", output: "2\n1\n5\n9", visibility: "sample", category: "normal" },
        { label: "missing", input: "remove 3\nmin\n", output: "missing\nempty", visibility: "hidden", category: "edge" },
        { label: "remove until empty", input: "add 1\nremove 1\nmax\ncount 1\n", output: "empty\n0", visibility: "hidden", category: "edge" },
        { label: "negatives", input: "add -3\nadd 7\nadd -10\nmin\nmax\n", output: "-10\n7", visibility: "hidden", category: "normal" },
      ],
      compare: "lines",
      hints: [
        "add: board.insert(x).",
        "remove: auto it = board.find(x); if (it == end) missing; else board.erase(it).",
        "min is *board.begin(), max is *board.rbegin().",
        "count: board.count(x).",
      ],
      solution: r`#include <iostream>
#include <set>
#include <string>
using namespace std;

int main() {
    multiset<long long> board;
    string cmd;
    while (cin >> cmd) {
        if (cmd == "add") {
            long long x;
            cin >> x;
            board.insert(x);
        } else if (cmd == "remove") {
            long long x;
            cin >> x;
            auto it = board.find(x);
            if (it == board.end()) cout << "missing" << endl;
            else board.erase(it);
        } else if (cmd == "min") {
            if (board.empty()) cout << "empty" << endl;
            else cout << *board.begin() << endl;
        } else if (cmd == "max") {
            if (board.empty()) cout << "empty" << endl;
            else cout << *board.rbegin() << endl;
        } else if (cmd == "count") {
            long long x;
            cin >> x;
            cout << board.count(x) << endl;
        }
    }
    return 0;
}`,
      solutionNotes: "Erasing through an iterator removes one element; erasing by value would wipe every copy. Every operation stays O(log n).",
    },
    practice: practice(
      {
        title: "Several numbers per name",
        prompt: `Use a \`multimap<string, string>\`. Commands: \`add NAME NUMBER\`, \`list NAME\` (all numbers in the order added, space-separated, or \`none\`), \`count NAME\`.`,
        starterCode: starter("Handle add / list / count with a multimap", "multimap<string, string> book;\nstring cmd, name;", ["iostream", "map", "string"]),
        tests: [
          T("sample", "add asha 111\nadd ravi 222\nadd asha 333\nlist asha\ncount asha\n", "111 333\n2", "sample"),
          T("unknown", "list zoe\ncount zoe\n", "none\n0", "visible", "edge"),
          T("duplicate numbers", "add a 1\nadd a 1\nlist a\n", "1 1", "hidden", "edge"),
        ],
        compare: "lines",
        hints: [
          "add: book.insert({name, number}).",
          "list: auto [lo, hi] = book.equal_range(name).",
          "If lo == hi, print none.",
          "count: book.count(name).",
        ],
        solution: r`#include <iostream>
#include <map>
#include <string>
using namespace std;

int main() {
    multimap<string, string> book;
    string cmd, name;
    while (cin >> cmd >> name) {
        if (cmd == "add") {
            string number;
            cin >> number;
            book.insert({name, number});
        } else if (cmd == "list") {
            auto [lo, hi] = book.equal_range(name);
            if (lo == hi) cout << "none";
            for (auto it = lo; it != hi; ++it) cout << (it == lo ? "" : " ") << it->second;
            cout << endl;
        } else if (cmd == "count") {
            cout << book.count(name) << endl;
        }
    }
    return 0;
}`,
        solutionNotes: "A multimap keeps all values for a key, and equal_range gives exactly that run of entries — already in insertion order.",
      },
      {
        title: "How many rooms?",
        prompt: `Read \`n\` meetings \`start end\` (a meeting occupies [start, end); one ending at 10 and one starting at 10 can share a room). Print the minimum number of rooms needed. Process meetings by start time and keep a **multiset of end times** of rooms in use.`,
        starterCode: starter("Sort by start; free rooms whose end <= start; track the most rooms in use", "int n;\ncin >> n;\nvector<pair<long long, long long>> m(n);\nfor (auto& [s, e] : m) cin >> s >> e;", ["iostream", "vector", "set", "algorithm", "utility"]),
        tests: [
          T("sample", "3\n0 30\n5 10\n15 20\n", "2", "sample"),
          T("back to back", "3\n0 10\n10 20\n20 30\n", "1", "visible", "boundary"),
          T("all overlap", "3\n1 5\n2 6\n3 7\n", "3", "hidden"),
          T("none", "0\n", "0", "hidden", "edge"),
          T("mixed", "5\n1 4\n2 3\n3 6\n5 7\n6 8\n", "2", "hidden"),
        ],
        hints: [
          "Sort meetings by start time.",
          "Before placing a meeting, remove every end time ≤ its start (those rooms are free).",
          "Insert the meeting's end time; the multiset's size is the rooms in use now.",
          "The answer is the largest size seen.",
        ],
        solution: r`#include <iostream>
#include <vector>
#include <set>
#include <algorithm>
#include <utility>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<pair<long long, long long>> m(n);
    for (auto& [s, e] : m) cin >> s >> e;
    sort(m.begin(), m.end());
    multiset<long long> ends;
    size_t best = 0;
    for (const auto& [s, e] : m) {
        while (!ends.empty() && *ends.begin() <= s) ends.erase(ends.begin());
        ends.insert(e);
        best = max(best, ends.size());
    }
    cout << best << endl;
    return 0;
}`,
        solutionNotes: "The multiset always holds the end times of busy rooms, smallest first — duplicates matter because two meetings can end at the same time.",
      },
    ),
    explainAgain: `A set is a guest list where each name appears once; a multiset is a bag of marbles where you can have several of the same colour, always sorted. Remove *a* red marble with \`erase(find(red))\`; \`erase(red)\` tips out every red one.`,
    summary: [
      "multiset/multimap keep duplicate keys, sorted; equal keys keep insertion order.",
      "`erase(value)` removes all copies; `erase(find(value))` removes one.",
      "`equal_range(key)` gives every entry with that key.",
    ],
  },

  {
    id: "unordered-containers",
    moduleId: "stl",
    after: "multiset-multimap",
    title: "unordered_map and unordered_set in depth",
    minutes: 15,
    concepts: ["hash table", "unordered_map", "unordered_set", "custom hash"],
    goals: [
      "Use hash containers for average O(1) lookups",
      "Remember that their iteration order is unspecified",
      "Hash your own key types, like pairs",
    ],
    intro: `\`map\` and \`set\` keep keys sorted, at O(log n) per operation. When you only need "is it there?" and "how many?", the hash-based \`unordered_map\` and \`unordered_set\` do it in O(1) on average — often several times faster for large data.`,
    sections: [
      {
        title: "Same interface, different engine",
        body: `\`\`\`cpp
unordered_set<int> seen;
seen.insert(4); seen.count(4);       // 1
unordered_map<string, int> freq;
freq["cat"]++;
\`\`\`

A hash function turns each key into a bucket number, so lookup jumps straight to the right bucket instead of walking a tree.`,
      },
      {
        title: "Order is not guaranteed",
        body: `Iterating an unordered container visits elements in an order that depends on the hash function, the bucket count and the library — it can even change when you insert more elements. **If output order matters, copy the keys into a vector and sort them.** \`reserve(n)\` avoids repeated rehashing when you know the size.`,
      },
      {
        title: "Hashing your own types",
        body: `There's no built-in hash for \`pair<int, int>\`. Provide one:

\`\`\`cpp
struct PairHash {
    size_t operator()(const pair<int, int>& p) const {
        return hash<long long>()(((long long)p.first << 32) ^ (unsigned)p.second);
    }
};
unordered_set<pair<int, int>, PairHash> visited;
\`\`\``,
      },
    ],
    mistakes: [
      { title: "Printing in iteration order", body: "Tests that expect sorted output fail on another machine. Sort explicitly." },
      { title: "Assuming O(1) always", body: "Bad hashes or adversarial input can make it O(n) per operation. map gives guaranteed O(log n)." },
      { title: "Using [] just to check", body: "`m[key]` inserts a default value. Use `count` or `find` to test membership." },
    ],
    example: {
      title: "Fast membership, sorted output",
      intro: "Find duplicates with an unordered_set; sort before printing.",
      code: r`#include <iostream>
#include <unordered_set>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> v = {7, 3, 7, 1, 3, 9, 7};
    unordered_set<int> seen, dupes;
    for (int x : v) {
        if (seen.count(x)) dupes.insert(x);
        else seen.insert(x);
    }
    vector<int> out(dupes.begin(), dupes.end());
    sort(out.begin(), out.end());
    for (int x : out) cout << x << " ";
    cout << "| distinct " << seen.size() << endl;
    return 0;
}`,
      output: "3 7 | distinct 4\n",
      notes: [
        { line: 10, text: "Average O(1) membership test." },
        { line: 14, text: "Copy into a vector and sort — the set's own order isn't defined." },
      ],
    },
    quickCheck: {
      prompt: "You need to print every distinct word in alphabetical order. Which is simplest?",
      options: [
        { id: "a", text: "`set<string>` — it's already sorted", feedback: "Yes. unordered_set would need an extra sort." },
        { id: "b", text: "`unordered_set<string>` and print it", feedback: "Its iteration order isn't alphabetical (or even predictable)." },
        { id: "c", text: "`unordered_map<string, int>`", feedback: "Same ordering problem." },
      ],
      correct: "a",
      explanation: "Pick unordered containers for speed when order doesn't matter, ordered ones when it does.",
    },
    exercise: {
      title: "First repeated value",
      prompt: `Read \`n\` and n whole numbers. Print the **first value that appears for the second time** (scanning left to right) and the index of that second appearance, or \`none\`. Use an \`unordered_set\`.`,
      starterCode: r`#include <iostream>
#include <unordered_set>
using namespace std;

int main() {
    int n;
    cin >> n;
    // scan the numbers; stop at the first one already seen

    return 0;
}`,
      tests: [
        { label: "sample", input: "6\n4 8 2 8 4 9\n", output: "8 3", visibility: "sample", category: "normal" },
        { label: "none", input: "3\n1 2 3\n", output: "none", visibility: "hidden", category: "edge" },
        { label: "adjacent", input: "2\n5 5\n", output: "5 1", visibility: "hidden", category: "boundary" },
        { label: "negatives", input: "4\n-1 0 1 -1\n", output: "-1 3", visibility: "hidden", category: "edge" },
      ],
      compare: "tokens",
      hints: [
        "Read the numbers one at a time.",
        "If the set already contains x, that's the answer — print and stop.",
        "Otherwise insert x and continue.",
        "If the loop finishes, print none.",
      ],
      solution: r`#include <iostream>
#include <unordered_set>
using namespace std;

int main() {
    int n;
    cin >> n;
    unordered_set<long long> seen;
    seen.reserve(n);
    for (int i = 0; i < n; i++) {
        long long x;
        cin >> x;
        if (seen.count(x)) {
            cout << x << " " << i << endl;
            return 0;
        }
        seen.insert(x);
    }
    cout << "none" << endl;
    return 0;
}`,
      solutionNotes: "One pass with O(1) average lookups: O(n) total, versus O(n²) comparing every pair.",
    },
    practice: practice(
      {
        title: "Word counts, sorted output",
        prompt: `Read words until the input ends. Count them with an \`unordered_map\`. Print each distinct word with its count, sorted by count (highest first), ties alphabetically.`,
        starterCode: starter("Count in an unordered_map, then copy to a vector and sort", "unordered_map<string, int> freq;\nstring w;", ["iostream", "string", "unordered_map", "vector", "algorithm"]),
        tests: [
          T("sample", "the cat the dog the cat\n", "the 3\ncat 2\ndog 1", "sample"),
          T("ties", "b a c\n", "a 1\nb 1\nc 1", "visible", "edge"),
          T("one word", "hi\n", "hi 1", "hidden", "boundary"),
        ],
        compare: "lines",
        hints: [
          "freq[w]++ counts.",
          "vector<pair<string, int>> v(freq.begin(), freq.end());",
          "Sort by count descending, then word ascending.",
          "Never print in the unordered_map's own order.",
        ],
        solution: r`#include <iostream>
#include <string>
#include <unordered_map>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    unordered_map<string, int> freq;
    string w;
    while (cin >> w) freq[w]++;
    vector<pair<string, int>> v(freq.begin(), freq.end());
    sort(v.begin(), v.end(), [](const auto& a, const auto& b) {
        if (a.second != b.second) return a.second > b.second;
        return a.first < b.first;
    });
    for (const auto& [word, count] : v) cout << word << " " << count << endl;
    return 0;
}`,
        solutionNotes: "Fast counting with a hash map, then an explicit sort for deterministic output — the standard combination.",
      },
      {
        title: "Places visited on a walk",
        prompt: `A walker starts at (0, 0). Read a string of moves \`U D L R\`. Using an \`unordered_set<pair<int, int>, PairHash>\` with your own hash, print how many **distinct** points were visited (including the start), and \`yes\`/\`no\`: did the walk ever revisit a point?`,
        starterCode: starter("Track visited points in an unordered_set with a custom pair hash", "string moves;\ncin >> moves;", ["iostream", "string", "unordered_set", "utility", "functional"], "// Write struct PairHash here"),
        tests: [
          T("square", "URDL\n", "4\nyes", "sample"),
          T("straight line", "RRRR\n", "5\nno", "visible"),
          T("back and forth", "UDUD\n", "2\nyes", "hidden", "edge"),
          T("single", "L\n", "2\nno", "hidden", "boundary"),
        ],
        compare: "lines",
        hints: [
          "struct PairHash { size_t operator()(const pair<int,int>& p) const { … } };",
          "Combine the two ints into one 64-bit number and hash that.",
          "insert returns a pair whose .second is false if the point was already there.",
          "Count = visited.size(); revisit = whether any insert failed.",
        ],
        solution: r`#include <iostream>
#include <string>
#include <unordered_set>
#include <utility>
#include <functional>
using namespace std;

struct PairHash {
    size_t operator()(const pair<int, int>& p) const {
        long long key = ((long long)p.first << 32) ^ (unsigned int)p.second;
        return hash<long long>()(key);
    }
};

int main() {
    string moves;
    cin >> moves;
    unordered_set<pair<int, int>, PairHash> visited;
    int x = 0, y = 0;
    visited.insert({0, 0});
    bool revisit = false;
    for (char m : moves) {
        if (m == 'U') y++;
        else if (m == 'D') y--;
        else if (m == 'L') x--;
        else if (m == 'R') x++;
        if (!visited.insert({x, y}).second) revisit = true;
    }
    cout << visited.size() << endl;
    cout << (revisit ? "yes" : "no") << endl;
    return 0;
}`,
        solutionNotes: "Packing both coordinates into one 64-bit key gives a hash with no collisions between different points. insert(...).second reports whether the element was new.",
      },
    ),
    explainAgain: `A map is a sorted filing cabinet: to find a folder you flip through it in order (log n steps). An unordered_map is a wall of numbered pigeonholes: a formula tells you exactly which hole to look in. Much faster — but the pigeonholes aren't in any meaningful order, so sort before you print.`,
    summary: [
      "unordered_map/unordered_set: average O(1) lookups via hashing.",
      "Iteration order is unspecified — sort before printing.",
      "Custom key types need a hash function (and ==).",
    ],
  },

  {
    id: "custom-comparators",
    moduleId: "stl",
    after: "unordered-containers",
    title: "Custom comparators",
    minutes: 15,
    concepts: ["comparator", "strict weak ordering", "functor", "priority_queue order"],
    goals: [
      "Write comparators for sort, set, map and priority_queue",
      "Follow the strict-weak-ordering rules so containers behave",
      "Remember that priority_queue's comparator is \"reversed\"",
    ],
    intro: `"Sorted" can mean many things: shortest first, case-insensitive, by priority then arrival. A **comparator** tells the STL what "comes before" means — and the same comparator works for sort, set, map and heaps.`,
    sections: [
      {
        title: "Where comparators go",
        body: `\`\`\`cpp
sort(v.begin(), v.end(), cmp);                    // a function or lambda
set<string, CaseLess> words;                      // a type (functor)
priority_queue<Task, vector<Task>, ByPriority> q; // a type
\`\`\`

A functor is a struct with \`bool operator()(const T& a, const T& b) const\`.`,
      },
      {
        title: "The rules (strict weak ordering)",
        body: `\`cmp(a, b)\` must mean "a must come strictly before b":

- \`cmp(a, a)\` is **false** — use \`<\`, never \`<=\`.
- If \`cmp(a, b)\` then not \`cmp(b, a)\`.
- It must be consistent (transitive).

For a set or map, two keys are treated as **the same** when neither comes before the other — so a case-insensitive set keeps only one of "Cat" and "cat".`,
      },
      {
        title: "priority_queue is backwards",
        body: `A priority_queue puts the **largest** element (by its comparator) on top. With \`less\` (the default) that's the maximum. If you want the task with the *lowest* number on top, your comparator must say "a comes before b" when a has the *higher* number — the opposite of sort.`,
      },
    ],
    mistakes: [
      { title: "Using <= in a comparator", body: "It breaks the rules; sort can crash or loop with it. Use <." },
      { title: "Inconsistent tie-breaking", body: "If two elements aren't equal, the comparator should order them consistently, or results vary." },
      { title: "Forgetting priority_queue's inversion", body: "Test with two elements: the one you want on top must be the 'larger' one by your comparator." },
    ],
    example: {
      title: "One idea, three containers",
      intro: "A case-insensitive set, a sort by length, and a min-heap of tasks.",
      code: r`#include <iostream>
#include <queue>
#include <set>
#include <string>
#include <vector>
#include <algorithm>
#include <cctype>
using namespace std;

struct CaseLess {
    bool operator()(const string& a, const string& b) const {
        return lexicographical_compare(a.begin(), a.end(), b.begin(), b.end(),
            [](char x, char y) { return tolower(x) < tolower(y); });
    }
};

int main() {
    set<string, CaseLess> words = {"cat", "Apple", "CAT", "banana"};
    for (const auto& w : words) cout << w << " ";
    cout << endl;
    vector<string> v = {"ccc", "a", "bb"};
    sort(v.begin(), v.end(), [](const string& a, const string& b) { return a.size() < b.size(); });
    for (const auto& w : v) cout << w << " ";
    cout << endl;
    priority_queue<int, vector<int>, greater<int>> minHeap;
    for (int x : {5, 1, 4}) minHeap.push(x);
    cout << minHeap.top() << endl;
    return 0;
}`,
      output: "Apple banana cat \na bb ccc \n1\n",
      notes: [
        { line: 19, text: "\"CAT\" counts as equal to \"cat\", so only the first is kept." },
        { line: 23, text: "A lambda comparator for sort." },
        { line: 27, text: "greater<int> makes the smallest element the 'largest' — on top." },
      ],
    },
    quickCheck: {
      prompt: "A comparator returns `a.score <= b.score`. What's wrong?",
      options: [
        { id: "a", text: "cmp(a, a) is true, which breaks strict weak ordering", feedback: "Right — use `<`. With `<=`, sort's behaviour is undefined." },
        { id: "b", text: "Nothing, it sorts ascending", feedback: "It may appear to work, then crash on certain inputs." },
        { id: "c", text: "It sorts descending", feedback: "Direction isn't the problem; reflexivity is." },
      ],
      correct: "a",
      explanation: "A comparator must be irreflexive: an element never comes before itself.",
    },
    exercise: {
      title: "Sort intervals",
      prompt: `Read \`n\` intervals \`start end\`. Print them sorted by start ascending; for equal starts, the **longer** interval first; if still tied, keep any order (they're identical). Use a lambda comparator with \`<\`-style logic.`,
      starterCode: r`#include <iostream>
#include <vector>
#include <algorithm>
#include <utility>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<pair<long long, long long>> v(n);
    for (auto& [s, e] : v) cin >> s >> e;
    // sort with a comparator, then print

    return 0;
}`,
      tests: [
        { label: "sample", input: "4\n5 6\n1 10\n1 3\n2 4\n", output: "1 10\n1 3\n2 4\n5 6", visibility: "sample", category: "normal" },
        { label: "duplicates", input: "2\n3 4\n3 4\n", output: "3 4\n3 4", visibility: "hidden", category: "edge" },
        { label: "negatives", input: "3\n-5 0\n-5 5\n-10 -9\n", output: "-10 -9\n-5 5\n-5 0", visibility: "hidden", category: "edge" },
      ],
      compare: "lines",
      hints: [
        "If the starts differ, the smaller start comes first.",
        "Otherwise, the larger length (end − start) comes first.",
        "Return false when they're completely equal.",
        "if (a.first != b.first) return a.first < b.first; return a.second - a.first > b.second - b.first;",
      ],
      solution: r`#include <iostream>
#include <vector>
#include <algorithm>
#include <utility>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<pair<long long, long long>> v(n);
    for (auto& [s, e] : v) cin >> s >> e;
    sort(v.begin(), v.end(), [](const auto& a, const auto& b) {
        if (a.first != b.first) return a.first < b.first;
        return (a.second - a.first) > (b.second - b.first);
    });
    for (const auto& [s, e] : v) cout << s << " " << e << endl;
    return 0;
}`,
      solutionNotes: "Each branch uses a strict comparison, so identical intervals give false both ways — a valid strict weak ordering.",
    },
    practice: practice(
      {
        title: "Case-insensitive unique words",
        prompt: `Read words until the input ends. Keep them in a \`set<string, CaseLess>\` so words differing only by case count once (the first spelling seen is kept). Print the set in its (case-insensitive) order, then its size.`,
        starterCode: starter("Insert into a set with a case-insensitive comparator; print it and its size", "string w;", ["iostream", "set", "string", "algorithm", "cctype"], "// Write struct CaseLess here"),
        tests: [
          T("sample", "Cat apple cat Banana APPLE\n", "apple Banana Cat\n3", "sample"),
          T("all same", "a A a\n", "a\n1", "visible", "edge"),
          T("mixed", "Zeta alpha Beta\n", "alpha Beta Zeta\n3", "hidden"),
        ],
        compare: "lines",
        hints: [
          "Compare character by character with tolower.",
          "std::lexicographical_compare with a char comparator does it.",
          "set.insert keeps the existing element when an 'equal' one is inserted.",
          "Print with spaces, then the size on its own line.",
        ],
        solution: r`#include <iostream>
#include <set>
#include <string>
#include <algorithm>
#include <cctype>
using namespace std;

struct CaseLess {
    bool operator()(const string& a, const string& b) const {
        return lexicographical_compare(a.begin(), a.end(), b.begin(), b.end(), [](char x, char y) {
            return tolower(static_cast<unsigned char>(x)) < tolower(static_cast<unsigned char>(y));
        });
    }
};

int main() {
    set<string, CaseLess> words;
    string w;
    while (cin >> w) words.insert(w);
    bool first = true;
    for (const auto& x : words) {
        cout << (first ? "" : " ") << x;
        first = false;
    }
    cout << endl << words.size() << endl;
    return 0;
}`,
        solutionNotes: "The set uses the comparator for both ordering and equality: \"apple\" and \"APPLE\" are equivalent, so the second insert is ignored.",
      },
      {
        title: "Task queue",
        prompt: `Tasks have a name, a priority (higher = more urgent) and arrive in order. Commands: \`add NAME PRIORITY\` and \`next\` (print and remove the most urgent task; among equal priorities, the one that arrived **first**; print \`idle\` if none). Use a \`priority_queue\` with your own comparator.`,
        starterCode: starter("priority_queue with a comparator on (priority, arrival)", "string cmd;", ["iostream", "queue", "string", "vector"], "// Write struct Task and struct ByUrgency here"),
        tests: [
          T("sample", "add wash 2\nadd cook 5\nadd shop 5\nnext\nnext\nnext\nnext\n", "cook\nshop\nwash\nidle", "sample"),
          T("idle first", "next\n", "idle", "visible", "edge"),
          T("interleaved", "add a 1\nnext\nadd b 1\nadd c 3\nnext\nnext\n", "a\nc\nb", "hidden"),
        ],
        compare: "lines",
        hints: [
          "Store an arrival counter in each task.",
          "priority_queue puts the element that is 'largest' by the comparator on top.",
          "So cmp(a, b) should be true when a is LESS urgent: lower priority, or same priority but later arrival.",
          "return a.priority != b.priority ? a.priority < b.priority : a.arrival > b.arrival;",
        ],
        solution: r`#include <iostream>
#include <queue>
#include <string>
#include <vector>
using namespace std;

struct Task {
    string name;
    int priority;
    int arrival;
};

struct ByUrgency {
    bool operator()(const Task& a, const Task& b) const {
        if (a.priority != b.priority) return a.priority < b.priority;
        return a.arrival > b.arrival;
    }
};

int main() {
    priority_queue<Task, vector<Task>, ByUrgency> q;
    string cmd;
    int arrivals = 0;
    while (cin >> cmd) {
        if (cmd == "add") {
            string name;
            int p;
            cin >> name >> p;
            q.push({name, p, arrivals++});
        } else if (cmd == "next") {
            if (q.empty()) {
                cout << "idle" << endl;
            } else {
                cout << q.top().name << endl;
                q.pop();
            }
        }
    }
    return 0;
}`,
        solutionNotes: "The comparator answers \"is a less urgent than b?\". The heap keeps the most urgent on top. A heap isn't stable on its own, so the arrival counter makes equal priorities first-come, first-served.",
      },
    ),
    explainAgain: `A comparator is the referee's rulebook for "who goes first". Sort, set and map read it directly. A priority_queue reads it as "who is smaller", and serves the biggest — so write the rule for who should wait longer. And whatever the rule, nobody goes before themselves: use \`<\`, never \`<=\`.`,
    summary: [
      "Comparators define order for sort (functions/lambdas) and for set/map/priority_queue (types).",
      "Follow strict weak ordering: use `<`, never `<=`.",
      "priority_queue serves the 'largest' by its comparator — invert accordingly.",
    ],
  },

  {
    id: "choosing-containers",
    moduleId: "stl",
    after: "custom-comparators",
    title: "Choosing the right container",
    minutes: 20,
    concepts: ["container choice", "deque", "list", "LRU cache", "monotonic deque"],
    goals: [
      "Match each container to the operations a problem needs",
      "Use `deque` for both-ends access and sliding windows",
      "Combine containers (list + unordered_map) for an LRU cache",
    ],
    intro: `Picking a container is picking which operations are cheap. Write down what your program does most — look up by key? add at both ends? always take the smallest? — and the right container usually picks itself.`,
    sections: [
      {
        title: "A decision guide",
        body: `| You need… | Use |
| --- | --- |
| a list you index and append to | \`vector\` (the default) |
| add/remove at **both** ends | \`deque\` |
| sorted unique keys, ordered iteration | \`set\` / \`map\` |
| fast lookup, order doesn't matter | \`unordered_set\` / \`unordered_map\` |
| duplicates, sorted | \`multiset\` / \`multimap\` |
| always the largest/smallest next | \`priority_queue\` |
| LIFO / FIFO only | \`stack\` / \`queue\` |
| insert/erase in the middle with stable positions | \`list\` (rarely) |`,
      },
      {
        title: "Costs at a glance",
        body: `| | vector | deque | list | set/map | unordered |
| --- | --- | --- | --- | --- | --- |
| index [i] | O(1) | O(1) | — | — | — |
| push back | O(1)* | O(1) | O(1) | — | — |
| push front | O(n) | O(1) | O(1) | — | — |
| find by key | O(n) | O(n) | O(n) | O(log n) | O(1) avg |

\\* amortised. In practice \`vector\` is often fastest even when the big-O ties, thanks to memory locality.`,
      },
      {
        title: "Combining containers",
        body: `Many classic designs use two containers at once. An **LRU cache** (evict the least recently used item) keeps a \`list\` in usage order plus an \`unordered_map\` from key to list position — both lookups and moves are O(1).`,
      },
    ],
    mistakes: [
      { title: "Reaching for list", body: "Linked lists are slow to traverse and rarely beat vector. Use them when you truly need stable iterators with mid-sequence edits." },
      { title: "Searching a vector repeatedly", body: "If the program asks \"is x present?\" thousands of times, use a set or hash set." },
      { title: "Inserting at the front of a vector", body: "Each insert shifts everything: O(n). Use deque." },
    ],
    example: {
      title: "deque at both ends",
      intro: "Push and pop on both sides in O(1).",
      code: r`#include <iostream>
#include <deque>
using namespace std;

int main() {
    deque<int> d;
    d.push_back(2);
    d.push_back(3);
    d.push_front(1);
    d.push_front(0);
    for (int x : d) cout << x << " ";
    cout << "| front " << d.front() << " back " << d.back() << " d[2] " << d[2] << endl;
    d.pop_front();
    d.pop_back();
    for (int x : d) cout << x << " ";
    cout << endl;
    return 0;
}`,
      output: "0 1 2 3 | front 0 back 3 d[2] 2\n1 2 \n",
      notes: [
        { line: 9, text: "push_front is O(1) on a deque (O(n) on a vector)." },
        { line: 11, text: "A deque can still be indexed." },
      ],
    },
    quickCheck: {
      prompt: "A program receives a stream of user IDs and must answer \"have I seen this ID before?\" a million times. Order doesn't matter. Which container?",
      options: [
        { id: "a", text: "unordered_set", feedback: "Yes — average O(1) membership tests." },
        { id: "b", text: "vector with a linear search", feedback: "O(n) per question: far too slow for a million queries." },
        { id: "c", text: "list", feedback: "Also O(n) searches, and slower to traverse than a vector." },
      ],
      correct: "a",
      explanation: "Membership tests with no ordering need are exactly what hash sets are for.",
    },
    exercise: {
      title: "Sliding window maximum",
      prompt: `Read \`n\`, \`k\` and n whole numbers. Print the maximum of every window of k consecutive numbers (n − k + 1 values, space-separated). With n up to 100 000, recomputing each window is too slow — keep a **deque of indexes** whose values are decreasing, so the front is always the window's maximum.`,
      starterCode: r`#include <iostream>
#include <deque>
#include <vector>
using namespace std;

int main() {
    int n, k;
    cin >> n >> k;
    vector<long long> a(n);
    for (auto& x : a) cin >> x;
    // monotonic deque of indexes

    return 0;
}`,
      tests: [
        { label: "sample", input: "8 3\n1 3 -1 -3 5 3 6 7\n", output: "3 3 5 5 6 7", visibility: "sample", category: "normal" },
        { label: "k = 1", input: "3 1\n4 2 9\n", output: "4 2 9", visibility: "hidden", category: "boundary" },
        { label: "k = n", input: "4 4\n2 8 1 5\n", output: "8", visibility: "hidden", category: "boundary" },
        { label: "decreasing", input: "5 2\n9 7 5 3 1\n", output: "9 7 5 3", visibility: "hidden", category: "edge" },
      ],
      compare: "tokens",
      hints: [
        "For each new index i: pop from the back while a[back] <= a[i] — they can never be a maximum again.",
        "Push i at the back.",
        "Pop from the front if that index has left the window (front <= i − k).",
        "Once i >= k − 1, a[front] is this window's maximum.",
      ],
      solution: r`#include <iostream>
#include <deque>
#include <vector>
using namespace std;

int main() {
    int n, k;
    cin >> n >> k;
    vector<long long> a(n);
    for (auto& x : a) cin >> x;
    deque<int> dq;
    for (int i = 0; i < n; i++) {
        while (!dq.empty() && a[dq.back()] <= a[i]) dq.pop_back();
        dq.push_back(i);
        if (dq.front() <= i - k) dq.pop_front();
        if (i >= k - 1) cout << a[dq.front()] << (i + 1 < n ? " " : "\n");
    }
    return 0;
}`,
      solutionNotes: "Each index enters and leaves the deque at most once, so the whole thing is O(n). It needs removal at both ends — exactly what a deque offers.",
    },
    practice: practice(
      {
        title: "Pick the container: undo/redo",
        prompt: `A text editor has \`type WORD\`, \`undo\` and \`redo\` (redo replays the most recently undone word; typing clears the redo history), and \`show\` (print the words or \`(empty)\`). Choose suitable containers (hint: two stacks, or a vector and a stack).`,
        starterCode: starter("Implement type / undo / redo / show", "string cmd;", ["iostream", "string", "vector", "stack"]),
        tests: [
          T("sample", "type a\ntype b\nundo\nshow\nredo\nshow\n", "a\na b", "sample"),
          T("typing clears redo", "type a\nundo\ntype b\nredo\nshow\n", "b", "visible", "edge"),
          T("undo too far", "undo\nredo\nshow\n", "(empty)", "hidden", "edge"),
          T("multiple", "type x\ntype y\ntype z\nundo\nundo\nredo\nshow\n", "x y", "hidden"),
        ],
        compare: "lines",
        hints: [
          "The document is a vector of words (push_back/pop_back).",
          "Undone words go onto a redo stack.",
          "redo pops from that stack and pushes back onto the document.",
          "type clears the redo stack.",
        ],
        solution: r`#include <iostream>
#include <string>
#include <vector>
#include <stack>
using namespace std;

int main() {
    vector<string> doc;
    stack<string> redo;
    string cmd;
    while (cin >> cmd) {
        if (cmd == "type") {
            string w;
            cin >> w;
            doc.push_back(w);
            redo = stack<string>();
        } else if (cmd == "undo") {
            if (!doc.empty()) { redo.push(doc.back()); doc.pop_back(); }
        } else if (cmd == "redo") {
            if (!redo.empty()) { doc.push_back(redo.top()); redo.pop(); }
        } else if (cmd == "show") {
            if (doc.empty()) cout << "(empty)";
            for (size_t i = 0; i < doc.size(); i++) cout << (i ? " " : "") << doc[i];
            cout << endl;
        }
    }
    return 0;
}`,
        solutionNotes: "Both histories are last-in-first-out. A vector serves as the document's stack because it also needs to be printed in order.",
      },
      {
        title: "LRU cache",
        prompt: `Implement a cache of capacity \`C\` holding key → value. \`get K\` prints the value (or \`-1\`) and marks K as most recently used. \`put K V\` inserts/updates K as most recently used; if that exceeds the capacity, evict the **least recently used** key and print \`evict KEY\`. Both operations must be O(1): use a \`list\` of keys in usage order plus an \`unordered_map\` from key to (value, list iterator).`,
        starterCode: starter("list for recency + unordered_map key -> (value, iterator)", "int C;\ncin >> C;\nstring cmd;", ["iostream", "list", "string", "unordered_map", "utility"]),
        tests: [
          T("sample", "2\nput 1 10\nput 2 20\nget 1\nput 3 30\nget 2\nget 3\n", "10\nevict 2\n-1\n30", "sample"),
          T("update keeps size", "1\nput 1 5\nput 1 6\nget 1\n", "6", "visible", "edge"),
          T("capacity 1", "1\nput 1 1\nput 2 2\nget 1\n", "evict 1\n-1", "hidden", "edge"),
          T("get refreshes", "2\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 1\nget 2\n", "1\nevict 2\n1\n-1", "hidden"),
        ],
        compare: "lines",
        hints: [
          "Keep keys in a list: most recent at the front.",
          "The map stores each key's value and its iterator in the list.",
          "Touching a key: lst.splice(lst.begin(), lst, it) moves it to the front in O(1).",
          "Evict: the key at lst.back(); erase it from both containers.",
        ],
        solution: r`#include <iostream>
#include <list>
#include <string>
#include <unordered_map>
#include <utility>
using namespace std;

int main() {
    int C;
    cin >> C;
    list<long long> order;
    unordered_map<long long, pair<long long, list<long long>::iterator>> data;
    string cmd;
    while (cin >> cmd) {
        if (cmd == "get") {
            long long k;
            cin >> k;
            auto it = data.find(k);
            if (it == data.end()) {
                cout << -1 << endl;
            } else {
                order.splice(order.begin(), order, it->second.second);
                cout << it->second.first << endl;
            }
        } else if (cmd == "put") {
            long long k, v;
            cin >> k >> v;
            auto it = data.find(k);
            if (it != data.end()) {
                it->second.first = v;
                order.splice(order.begin(), order, it->second.second);
            } else {
                order.push_front(k);
                data[k] = {v, order.begin()};
                if ((int)data.size() > C) {
                    long long old = order.back();
                    order.pop_back();
                    data.erase(old);
                    cout << "evict " << old << endl;
                }
            }
        }
    }
    return 0;
}`,
        solutionNotes: "The hash map finds a key in O(1); the list keeps usage order and `splice` moves a node to the front without invalidating iterators. Neither container alone can do both.",
      },
    ),
    explainAgain: `Containers are tools in a toolbox. A vector is the hammer you reach for first. A deque is a hammer with a claw at both ends. A hash set is a lookup index. When one tool can't do every job fast enough, use two together — like the list-plus-map inside an LRU cache.`,
    summary: [
      "Start from the operations you need, then pick the container whose costs fit.",
      "vector by default; deque for both ends; hash containers for fast lookup; heaps for 'next best'.",
      "Combine containers when one can't make every operation fast.",
    ],
  },
];
