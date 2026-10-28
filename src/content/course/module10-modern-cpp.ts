import type { CourseLesson } from "./types";

const r = String.raw;

/** Module 10 — Modern C++: auto, lambdas, templates and the C++17 vocabulary types. */
export const MODERN_CPP_LESSONS: CourseLesson[] = [
  {
    id: "auto-lambdas",
    moduleId: "modern-cpp",
    title: "auto, range-for and lambdas",
    minutes: 25,
    concepts: ["auto", "range-based for", "lambda", "capture", "comparator", "count_if"],
    goals: [
      "Letting the compiler deduce types with `auto` (and when not to)",
      "Range-based `for` with `auto&` and `const auto&`",
      "Writing lambdas, capturing variables by value or by reference, and passing them to algorithms",
    ],
    intro: `Modern C++ (C++11 onwards) added features that make everyday code shorter *and* safer. The three you'll use constantly are \`auto\`, the range-based \`for\`, and **lambdas** — small unnamed functions you write right where you need them, for example as a custom sort order.`,
    sections: [
      {
        title: "auto and range-based for",
        body: `\`auto\` asks the compiler to deduce a variable's type from its initial value:

\`\`\`cpp
auto count = 0;                 // int
auto it = names.begin();        // vector<string>::iterator — no need to spell it
\`\`\`

In a range-based \`for\`, pick how each element is bound:

\`\`\`cpp
for (auto x : v)          // a copy — changes don't affect v
for (auto& x : v)         // a reference — can modify the elements
for (const auto& x : v)   // read-only reference — no copy (best for strings, objects)
\`\`\`

Use \`auto\` when the type is obvious or long; write the type when it documents intent (\`int total = 0;\`).`,
      },
      {
        title: "Lambdas",
        body: `\`\`\`cpp
auto square = [](int x) { return x * x; };
cout << square(5);    // 25
\`\`\`

\`[]\` is the **capture list**: which outside variables the lambda may use.

- \`[limit]\` — copy \`limit\` into the lambda (by value).
- \`[&total]\` — use \`total\` by reference, so the lambda can change it.
- \`[=]\` / \`[&]\` — capture everything used, by value / by reference (convenient, but less explicit).

Lambdas shine as arguments to algorithms:

\`\`\`cpp
sort(v.begin(), v.end(), [](int a, int b) { return a > b; });   // descending
int big = count_if(v.begin(), v.end(), [limit](int x) { return x > limit; });
\`\`\``,
      },
    ],
    mistakes: [
      { title: "auto copies by default", body: "`for (auto s : names) s += \"!\";` changes copies only. Use `auto&` to modify the elements." },
      { title: "Capturing by reference, then outliving the variable", body: "A lambda that captured a local by `&` and is called after that local's scope ended reads a dangling reference. Capture by value when the lambda is stored for later." },
      { title: "A comparator that isn't strict", body: "`[](int a, int b) { return a >= b; }` breaks `sort`. Comparators answer \"must a come strictly before b?\"." },
    ],
    example: {
      title: "Names, sorted and counted",
      intro: "`auto&` edits elements in place, a lambda defines a two-level sort order, and captures pass in a limit and a counter.",
      code: r`#include <algorithm>
#include <cctype>
#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    vector<string> names = {"ravi", "asha", "meenakshi", "dev"};
    for (auto& n : names) {
        n[0] = (char)toupper((unsigned char)n[0]);
    }
    sort(names.begin(), names.end(), [](const string& a, const string& b) {
        if (a.size() != b.size()) {
            return a.size() < b.size();
        }
        return a < b;
    });
    for (const auto& n : names) {
        cout << n << " ";
    }
    cout << endl;
    size_t minLen = 4;
    auto longNames = count_if(names.begin(), names.end(), [minLen](const string& s) { return s.size() >= minLen; });
    cout << longNames << " names have at least " << minLen << " letters" << endl;
    int calls = 0;
    auto tick = [&calls]() { calls++; };
    tick();
    tick();
    cout << "tick was called " << calls << " times" << endl;
    return 0;
}`,
      output: "Dev Asha Ravi Meenakshi \n3 names have at least 4 letters\ntick was called 2 times\n",
      notes: [
        { line: 10, text: "`auto&`: each `n` is the real element, so the capital letter sticks." },
        { line: 13, text: "A lambda comparator: shorter first, alphabetical on ties." },
        { line: 24, text: "`[minLen]` copies the limit into the lambda." },
        { line: 27, text: "`[&calls]` lets the lambda change the outside counter." },
      ],
    },
    quickCheck: {
      prompt: "What does this print?",
      code: r`vector<int> v = {1, 2, 3};
for (auto x : v) x *= 10;
for (auto& x : v) x += 1;
cout << v[0] << " " << v[2];`,
      options: [
        { id: "a", text: "11 31", feedback: "The first loop works on copies, so the ×10 is lost." },
        { id: "b", text: "2 4", feedback: "Right: only the `auto&` loop changes the elements." },
        { id: "c", text: "10 30", feedback: "The first loop's changes don't reach the vector, and the second does add 1." },
      ],
      correct: "b",
      explanation: "`auto x` is a copy; `auto& x` is a reference to the element.",
    },
    exercise: {
      title: "Rank list",
      prompt: `Read \`n\` students, each as \`name mark\`. Print them as \`name mark\`, one per line, sorted by **mark from highest to lowest**; students with the **same mark** appear in **alphabetical order**.

Use \`sort\` with a lambda comparator.`,
      starterCode: r`#include <algorithm>
#include <iostream>
#include <string>
#include <vector>
using namespace std;

struct Student {
    string name;
    int mark;
};

int main() {
    int n;
    cin >> n;
    vector<Student> list(n);
    for (auto& s : list) {
        cin >> s.name >> s.mark;
    }
    // Sort with a lambda: higher mark first, then alphabetical by name.

    for (const auto& s : list) {
        cout << s.name << " " << s.mark << endl;
    }
    return 0;
}`,
      tests: [
        { label: "ties on 90", input: "4\nasha 90\nravi 75\ndev 90\nmeena 82\n", output: "asha 90\ndev 90\nmeena 82\nravi 75", visibility: "sample", category: "normal" },
        { label: "all equal marks", input: "3\nzoe 50\namy 50\nkim 50\n", output: "amy 50\nkim 50\nzoe 50", visibility: "hidden", category: "edge" },
        { label: "reverse input", input: "5\ne 1\nd 2\nc 3\nb 4\na 5\n", output: "a 5\nb 4\nc 3\nd 2\ne 1", visibility: "hidden", category: "normal" },
        { label: "single student", input: "1\nx 0\n", output: "x 0", visibility: "hidden", category: "boundary" },
      ],
      compare: "lines",
      hints: [
        "A comparator answers one question about two students `a` and `b`. What is it?",
        "\"Should `a` come before `b`?\" — yes if `a.mark > b.mark`, or if the marks are equal and `a.name < b.name`.",
        "`sort(list.begin(), list.end(), [](const Student& a, const Student& b) { ... });`",
        "Inside: `if (a.mark != b.mark) return a.mark > b.mark; return a.name < b.name;`",
      ],
      solution: r`#include <algorithm>
#include <iostream>
#include <string>
#include <vector>
using namespace std;

struct Student {
    string name;
    int mark;
};

int main() {
    int n;
    cin >> n;
    vector<Student> list(n);
    for (auto& s : list) {
        cin >> s.name >> s.mark;
    }
    sort(list.begin(), list.end(), [](const Student& a, const Student& b) {
        if (a.mark != b.mark) {
            return a.mark > b.mark;
        }
        return a.name < b.name;
    });
    for (const auto& s : list) {
        cout << s.name << " " << s.mark << endl;
    }
    return 0;
}`,
      solutionNotes: "A two-level comparator: the primary key (mark, descending) decides unless it's a tie, then the secondary key (name, ascending) decides. Both branches are strict, so `sort` is well-defined.",
    },
    explainAgain: `A lambda is like a sticky note with instructions you hand to a helper: "sort these, and here's the rule". The capture list is what you clip to the note — a copy of a number (\`[limit]\`), or a pointer to your own notebook so they can write in it (\`[&calls]\`).`,
    summary: [
      "`auto` deduces types; in range-for choose `auto`, `auto&` or `const auto&` deliberately.",
      "Lambdas are inline functions; the capture list decides which outside variables they use, by value or reference.",
      "Lambdas make custom orders and conditions for `sort`, `count_if`, `find_if` easy.",
    ],
  },

  {
    id: "templates",
    moduleId: "modern-cpp",
    title: "Function and class templates",
    minutes: 25,
    concepts: ["template", "typename", "type deduction", "class template", "generic programming"],
    goals: [
      "Writing one function that works for many types with a function template",
      "Writing a class template such as `Box<T>`",
      "How the compiler deduces `T` — and what a type must support to be used",
    ],
    intro: `\`vector<int>\`, \`vector<string>\`, \`max(a, b)\`… you've been using **templates** all along. A template is a recipe with a blank for the type: write the logic once, and the compiler makes a version for every type you use it with.`,
    sections: [
      {
        title: "Function templates",
        body: `\`\`\`cpp
template <typename T>
T largest(const vector<T>& v) {
    T best = v[0];
    for (const T& x : v) {
        if (x > best) best = x;
    }
    return best;
}

largest(vector<int>{3, 9, 4});          // T = int    → 9
largest(vector<string>{"kiwi", "fig"}); // T = string → "kiwi"
\`\`\`

The compiler **deduces** \`T\` from the arguments. The only requirement on \`T\` is what the body uses — here: copying and \`>\`. Use it with a type that has no \`>\` and you get a compile error.`,
      },
      {
        title: "Class templates",
        body: `\`\`\`cpp
template <typename T>
class Box {
    T value;
public:
    Box(T v) : value(v) {}
    T get() const { return value; }
};

Box<int> a(5);
Box<string> b("hi");
\`\`\`

For classes you usually write the type in angle brackets (C++17 can often deduce it: \`Box c(2.5);\`). This is exactly how \`vector<T>\`, \`map<K, V>\` and \`unique_ptr<T>\` are built.`,
      },
      {
        title: "Templates and C++20 concepts",
        body: `Template errors can be long, because the compiler only discovers a missing operation deep inside the body. **C++20 concepts** let you state requirements up front — \`template <std::totally_ordered T>\` — giving clear errors. CodeMentor's sandbox compiles C++20, so you can try concepts in the Playground:

\`\`\`cpp
#include <concepts>
template <std::totally_ordered T>
T biggest(T a, T b) { return a > b ? a : b; }
\`\`\``,
      },
    ],
    mistakes: [
      { title: "Mixing types in one call", body: "`largest2(3, 4.5)` with `template <typename T> T largest2(T a, T b)` fails: is T int or double? Make the types match or write `largest2<double>(3, 4.5)`." },
      { title: "Using an operation the type lacks", body: "A template that uses `<` can't be used with a struct that doesn't define `<`. The error points inside the template — read it from the bottom up." },
      { title: "Templates in .cpp files", body: "In multi-file projects, template definitions usually go in headers: the compiler must see the full body wherever it creates a version." },
    ],
    example: {
      title: "One recipe, many types",
      intro: "The same `largest` works for ints, doubles and strings, and `Box<T>` holds any type.",
      code: r`#include <iostream>
#include <string>
#include <vector>
using namespace std;

template <typename T>
T largest(const vector<T>& v) {
    T best = v[0];
    for (const T& x : v) {
        if (x > best) {
            best = x;
        }
    }
    return best;
}

template <typename T>
class Box {
    T value;
public:
    Box(T v) : value(v) {}
    T get() const { return value; }
    void set(T v) { value = v; }
};

int main() {
    cout << largest(vector<int>{3, 9, 4}) << endl;
    cout << largest(vector<double>{2.5, 1.5}) << endl;
    cout << largest(vector<string>{"kiwi", "apple", "mango"}) << endl;
    Box<int> b(5);
    b.set(b.get() * 2);
    cout << b.get() << endl;
    Box<string> s("hi");
    cout << s.get() + "!" << endl;
    return 0;
}`,
      output: "9\n2.5\nmango\n10\nhi!\n",
      notes: [
        { line: 6, text: "`T` is a placeholder type, filled in for each use." },
        { line: 29, text: "Strings compare alphabetically, so \"mango\" is the largest." },
        { line: 30, text: "Class templates take the type in angle brackets." },
      ],
    },
    quickCheck: {
      prompt: "Which call does NOT compile with `template <typename T> T bigger(T a, T b) { return a > b ? a : b; }`?",
      options: [
        { id: "a", text: "bigger(3, 7)", feedback: "Both are int: T = int." },
        { id: "b", text: "bigger(2.5, 1)", feedback: "Right: 2.5 is double and 1 is int, so T can't be deduced to one type." },
        { id: "c", text: "bigger(string(\"a\"), string(\"b\"))", feedback: "Both are string, and strings support `>`." },
      ],
      correct: "b",
      explanation: "Deduction needs a single `T`. `bigger<double>(2.5, 1)` or `bigger(2.5, 1.0)` would work.",
    },
    exercise: {
      title: "Count greater — for any type",
      prompt: `Write a function template \`int countGreater(const vector<T>& v, const T& x)\` that returns how many elements of \`v\` are **greater than** \`x\`.

\`main\` (given) uses it three times: with ints, doubles and strings. Input: \`n\`, \`n\` ints, \`x\`; then \`m\`, \`m\` doubles, \`y\`; then \`k\`, \`k\` words, \`w\`.`,
      starterCode: r`#include <iostream>
#include <string>
#include <vector>
using namespace std;

// Write the function template countGreater here.
template <typename T>
int countGreater(const vector<T>& v, const T& x) {
    return 0;
}

template <typename T>
vector<T> readList() {
    int n;
    cin >> n;
    vector<T> v(n);
    for (auto& e : v) {
        cin >> e;
    }
    return v;
}

int main() {
    vector<int> a = readList<int>();
    int x;
    cin >> x;
    vector<double> b = readList<double>();
    double y;
    cin >> y;
    vector<string> c = readList<string>();
    string w;
    cin >> w;
    cout << countGreater(a, x) << endl;
    cout << countGreater(b, y) << endl;
    cout << countGreater(c, w) << endl;
    return 0;
}`,
      tests: [
        { label: "mixed lists", input: "4\n1 5 3 7\n6\n3\n1.5 2.5 0.5\n1.0\n3\napple pear fig\nbanana\n", output: "1\n2\n2", visibility: "sample", category: "normal" },
        { label: "none greater, capitals", input: "3\n-1 -2 -3\n0\n2\n0.1 0.2\n0.15\n2\nZebra apple\napple\n", output: "0\n1\n0", visibility: "hidden", category: "edge" },
        { label: "equal is not greater", input: "1\n10\n10\n1\n3.5\n3.5\n1\nb\na\n", output: "0\n0\n1", visibility: "hidden", category: "boundary" },
      ],
      compare: "tokens",
      hints: [
        "Write the body as if `T` were `int`. What would it look like?",
        "A counter and a loop over `v`, adding 1 whenever an element is `> x`. Templates don't change the logic.",
        "`int count = 0; for (const T& e : v) { if (e > x) count++; } return count;`",
        "The same body compiles for ints, doubles and strings, because all three support `>`. (Uppercase letters sort before lowercase, which is why \"Zebra\" is not greater than \"apple\".)",
      ],
      solution: r`#include <iostream>
#include <string>
#include <vector>
using namespace std;

template <typename T>
int countGreater(const vector<T>& v, const T& x) {
    int count = 0;
    for (const T& e : v) {
        if (e > x) {
            count++;
        }
    }
    return count;
}

template <typename T>
vector<T> readList() {
    int n;
    cin >> n;
    vector<T> v(n);
    for (auto& e : v) {
        cin >> e;
    }
    return v;
}

int main() {
    vector<int> a = readList<int>();
    int x;
    cin >> x;
    vector<double> b = readList<double>();
    double y;
    cin >> y;
    vector<string> c = readList<string>();
    string w;
    cin >> w;
    cout << countGreater(a, x) << endl;
    cout << countGreater(b, y) << endl;
    cout << countGreater(c, w) << endl;
    return 0;
}`,
      solutionNotes: "One template, three instantiations. `readList<T>()` shows the other direction: when T can't be deduced from arguments, you name it explicitly.",
    },
    explainAgain: `A template is a cookie cutter. The shape (the logic) is fixed; the dough (the type) changes. Press it into int dough and you get an int function; press it into string dough and you get a string function. The cutter only works if the dough supports what the shape needs — here, comparing with \`>\`.`,
    summary: [
      "`template <typename T>` writes one function or class for many types.",
      "The compiler deduces `T` from arguments; name it explicitly (`f<double>`) when it can't.",
      "A type works with a template only if it supports every operation the template uses.",
    ],
  },

  {
    id: "modern-features",
    moduleId: "modern-cpp",
    title: "Modern C++17 tools: optional, string_view, enum class",
    minutes: 25,
    standard: "C++17",
    concepts: ["std::optional", "std::string_view", "enum class", "structured bindings", "constexpr", "C++20"],
    goals: [
      "Returning \"maybe a value\" with `std::optional` instead of magic numbers like -1",
      "Passing text cheaply with `std::string_view`",
      "Safer enums with `enum class`, structured bindings and `constexpr` — plus a map of what C++20 adds",
    ],
    intro: `Older C++ code is full of conventions: "return -1 if not found", "pass \`const string&\`", plain \`enum\`s that silently turn into ints. C++17 gives each of these a clearer, type-checked tool.`,
    sections: [
      {
        title: "std::optional",
        body: `\`\`\`cpp
#include <optional>

optional<int> indexOf(const vector<string>& v, string_view target) {
    for (int i = 0; i < (int)v.size(); i++)
        if (v[i] == target) return i;      // a value
    return nullopt;                        // "no value"
}

if (auto pos = indexOf(topics, "loops")) {  // true only if there is a value
    cout << *pos;                           // read it with *
}
\`\`\`

\`has_value()\` tests it; \`value_or(d)\` gives a default. The return type itself now says "this might not find anything".`,
      },
      {
        title: "std::string_view and enum class",
        body: `\`string_view\` is a lightweight, **read-only window** onto characters — no copy. It accepts a \`string\`, a literal or part of a string. Don't keep one longer than the text it looks at.

\`enum class\` creates a proper type whose values don't leak into the surrounding scope or convert to \`int\` by accident:

\`\`\`cpp
enum class Level { Beginner, Intermediate, Advanced };
Level l = Level::Advanced;     // must be qualified
// int x = l;                  // error — no silent conversion
\`\`\``,
      },
      {
        title: "Structured bindings, constexpr — and what C++20 adds",
        body: `\`for (const auto& [name, level] : m)\` unpacks pairs (C++17). \`constexpr int maxScore = 100;\` is a constant known at compile time.

**C++20 (the sandbox compiles C++20, so try these in the Playground):** \`std::span\` (a view over contiguous elements), **concepts** (named template requirements), **ranges** (\`views::filter\`, \`views::transform\` pipelines), \`std::format\`, and the \`<=>\` "spaceship" comparison operator. **C++23** adds \`std::print\`, \`std::expected\` and more.`,
      },
    ],
    mistakes: [
      { title: "Reading an empty optional", body: "`*opt` when `opt` is empty is undefined behaviour. Check it first, or use `opt.value_or(default)`." },
      { title: "A dangling string_view", body: "`string_view v = makeString();` views a temporary string that is destroyed at the end of the line. Keep a `string` when you need to own the text." },
      { title: "Plain enums leaking", body: "Two plain `enum`s with a value called `Red` clash. `enum class` keeps each name inside its own type." },
    ],
    example: {
      title: "A small modern toolkit",
      intro: "enum class + string_view for labels, structured bindings over a map, and optional for a search that might fail.",
      code: r`#include <iostream>
#include <map>
#include <optional>
#include <string>
#include <string_view>
#include <vector>
using namespace std;

enum class Level { Beginner, Intermediate, Advanced };

string_view label(Level l) {
    switch (l) {
        case Level::Beginner: return "beginner";
        case Level::Intermediate: return "intermediate";
        case Level::Advanced: return "advanced";
    }
    return "unknown";
}

optional<int> indexOf(const vector<string>& v, string_view target) {
    for (int i = 0; i < (int)v.size(); i++) {
        if (v[i] == target) {
            return i;
        }
    }
    return nullopt;
}

int main() {
    constexpr int maxScore = 100;
    map<string, Level> students = {{"asha", Level::Advanced}, {"ravi", Level::Beginner}};
    for (const auto& [name, level] : students) {
        cout << name << " is " << label(level) << endl;
    }
    vector<string> topics = {"loops", "pointers", "templates"};
    if (auto pos = indexOf(topics, "pointers")) {
        cout << "pointers at " << *pos << endl;
    }
    cout << "graphs found? " << (indexOf(topics, "graphs").has_value() ? "yes" : "no") << endl;
    cout << "max score " << maxScore << endl;
    return 0;
}`,
      output: "asha is advanced\nravi is beginner\npointers at 1\ngraphs found? no\nmax score 100\n",
      notes: [
        { line: 9, text: "`enum class`: values are written `Level::Advanced` and never become ints silently." },
        { line: 20, text: "The return type says \"an int, or nothing\"." },
        { line: 32, text: "Structured binding unpacks each map entry into `name` and `level`." },
        { line: 36, text: "The `if` runs only when a value was found." },
      ],
    },
    quickCheck: {
      prompt: "Which line is the safe way to print an `optional<int> o` that might be empty?",
      options: [
        { id: "a", text: "cout << *o;", feedback: "If `o` is empty this is undefined behaviour." },
        { id: "b", text: "cout << o.value_or(0);", feedback: "Right: it prints the value, or 0 when there is none." },
        { id: "c", text: "cout << o;", feedback: "`optional` has no `<<` operator — this doesn't compile." },
      ],
      correct: "b",
      explanation: "Use `value_or`, or check `if (o)` before `*o`.",
    },
    exercise: {
      title: "Parse an age",
      prompt: `Write \`optional<int> parseAge(string_view s)\`. It returns the age when \`s\` is **1 to 3 digits only** and the value is **at most 150**; otherwise it returns \`nullopt\`.

\`main\` reads \`t\` tokens and prints \`age N\` or \`invalid\` for each.`,
      starterCode: r`#include <iostream>
#include <optional>
#include <string>
#include <string_view>
using namespace std;

optional<int> parseAge(string_view s) {
    // 1-3 digits only, value <= 150; otherwise nullopt.
    return nullopt;
}

int main() {
    int t;
    cin >> t;
    for (int i = 0; i < t; i++) {
        string token;
        cin >> token;
        optional<int> age = parseAge(token);
        if (age) {
            cout << "age " << *age << endl;
        } else {
            cout << "invalid" << endl;
        }
    }
    return 0;
}`,
      tests: [
        { label: "mixed tokens", input: "4\n25\nabc\n200\n007\n", output: "age 25\ninvalid\ninvalid\nage 7", visibility: "sample", category: "normal" },
        { label: "edges of the range", input: "3\n0\n150\n151\n", output: "age 0\nage 150\ninvalid", visibility: "hidden", category: "boundary" },
        { label: "letters and signs", input: "2\n12a\n-5\n", output: "invalid\ninvalid", visibility: "hidden", category: "edge" },
        { label: "too many digits", input: "1\n1000\n", output: "invalid", visibility: "hidden", category: "edge" },
      ],
      compare: "lines",
      hints: [
        "Which checks must pass before you even compute the number?",
        "Length between 1 and 3, and every character a digit (`isdigit`). Only then build the value.",
        "Build it digit by digit: `value = value * 10 + (c - '0');`, then reject `value > 150`.",
        "`if (s.empty() || s.size() > 3) return nullopt; for (char c : s) if (!isdigit((unsigned char)c)) return nullopt;` … `return value <= 150 ? optional<int>(value) : nullopt;`",
      ],
      solution: r`#include <cctype>
#include <iostream>
#include <optional>
#include <string>
#include <string_view>
using namespace std;

optional<int> parseAge(string_view s) {
    if (s.empty() || s.size() > 3) {
        return nullopt;
    }
    int value = 0;
    for (char c : s) {
        if (!isdigit((unsigned char)c)) {
            return nullopt;
        }
        value = value * 10 + (c - '0');
    }
    if (value > 150) {
        return nullopt;
    }
    return value;
}

int main() {
    int t;
    cin >> t;
    for (int i = 0; i < t; i++) {
        string token;
        cin >> token;
        optional<int> age = parseAge(token);
        if (age) {
            cout << "age " << *age << endl;
        } else {
            cout << "invalid" << endl;
        }
    }
    return 0;
}`,
      solutionNotes: "Validation first, conversion second. The `optional` return type means callers can't forget that parsing may fail — compare that with returning -1, which a caller could accidentally print as an age.",
    },
    explainAgain: `\`optional\` is a gift box that might be empty: you check before you unwrap it. \`string_view\` is reading someone's notes through a window instead of photocopying them — quick, but the notes must still be there while you read. \`enum class\` is a labelled drawer set: \`Level::Advanced\` can't be mixed up with a plain number.`,
    summary: [
      "`optional<T>` returns \"a value or nothing\"; check before using `*`, or use `value_or`.",
      "`string_view` passes text without copying — never keep it longer than the text.",
      "`enum class`, structured bindings and `constexpr` make code clearer; C++20 adds concepts, ranges and span.",
    ],
  },
];
