import type { PracticeProblem } from "../types";
import { practice, starter, T } from "./helpers";

/** Practice problems for modules 8–11: pointers, OOP, modern C++ and the STL. */
export const CORE_PRACTICE: Record<string, PracticeProblem[]> = {
  "pointers-basics": practice(
    {
      title: "Swap through pointers",
      prompt: `Write \`void swapValues(int* a, int* b)\` that swaps the two ints the pointers point to. In \`main\`, read x and y, call \`swapValues(&x, &y)\`, and print x and y.`,
      starterCode: starter("Call swapValues(&x, &y), then print x y", "int x, y;\ncin >> x >> y;", ["iostream"], "// Write void swapValues(int* a, int* b) here"),
      tests: [
        T("3 8", "3 8\n", "8 3", "sample"),
        T("equal", "5 5\n", "5 5", "visible", "edge"),
        T("negatives", "-1 4\n", "4 -1", "hidden"),
        T("zero", "0 99\n", "99 0", "hidden"),
      ],
      hints: [
        "Inside the function, `a` is an address. How do you reach the int it points to?",
        "Dereference: `*a`.",
        "Swap needs a temporary: `int t = *a;`.",
        "int t = *a; *a = *b; *b = t;",
      ],
      solution: `#include <iostream>
using namespace std;

void swapValues(int* a, int* b) {
    int t = *a;
    *a = *b;
    *b = t;
}

int main() {
    int x, y;
    cin >> x >> y;
    swapValues(&x, &y);
    cout << x << " " << y << endl;
    return 0;
}`,
      solutionNotes: "Passing addresses lets the function change main's variables. Swapping the pointers themselves (`int* t = a; a = b; b = t;`) would change nothing outside.",
    },
    {
      title: "Pointer to the maximum",
      prompt: `Write \`int* findMax(int* arr, int n)\` that returns a pointer to the largest element (the first one if tied), or \`nullptr\` when n is 0. Read n and the array. If the result isn't null, print the max and its index (\`p - arr\`), set that element to 0 **through the pointer**, and print the array. Otherwise print \`empty\`.`,
      starterCode: starter("Use findMax; print max and index, zero it through the pointer, print the array (or empty)", "int n;\ncin >> n;\nint arr[100];\nfor (int i = 0; i < n; i++) cin >> arr[i];", ["iostream"], "// Write int* findMax(int* arr, int n) here"),
      tests: [
        T("sample", "5\n3 9 2 9 1\n", "9 1\n3 0 2 9 1", "sample"),
        T("empty", "0\n", "empty", "visible", "edge"),
        T("single", "1\n-4\n", "-4 0\n0", "hidden", "boundary"),
        T("max at the end", "3\n1 2 3\n", "3 2\n1 2 0", "hidden"),
      ],
      compare: "lines",
      hints: [
        "Keep a pointer `best` to the largest element seen so far.",
        "Compare with `*best`; move best when you find something bigger.",
        "Subtracting two pointers into the same array gives the distance in elements.",
        "*p = 0; changes the array element itself.",
      ],
      solution: `#include <iostream>
using namespace std;

int* findMax(int* arr, int n) {
    if (n == 0) return nullptr;
    int* best = arr;
    for (int* p = arr + 1; p < arr + n; p++) {
        if (*p > *best) best = p;
    }
    return best;
}

int main() {
    int n;
    cin >> n;
    int arr[100];
    for (int i = 0; i < n; i++) cin >> arr[i];
    int* p = findMax(arr, n);
    if (p == nullptr) {
        cout << "empty" << endl;
        return 0;
    }
    cout << *p << " " << (p - arr) << endl;
    *p = 0;
    for (int i = 0; i < n; i++) cout << arr[i] << " ";
    cout << endl;
    return 0;
}`,
      solutionNotes: "Returning a pointer gives the caller both the value (`*p`) and the position (`p - arr`), and lets it modify the element. nullptr is the honest answer for an empty range.",
    },
  ),

  "pointers-arrays": practice(
    {
      title: "Sum a range with pointers",
      prompt: `Write \`long long sumRange(const int* begin, const int* end)\` that adds the elements in [begin, end) by moving a pointer — no indexes. Read n, the array, then \`l r\` (0 ≤ l ≤ r ≤ n) and print \`sumRange(arr + l, arr + r)\`.`,
      starterCode: starter("Call sumRange(arr + l, arr + r) and print the result", "int n;\ncin >> n;\nint arr[100];\nfor (int i = 0; i < n; i++) cin >> arr[i];\nint l, r;\ncin >> l >> r;", ["iostream"], "// Write long long sumRange(const int* begin, const int* end) here"),
      tests: [
        T("middle", "5\n1 2 3 4 5\n1 4\n", "9", "sample"),
        T("whole array", "3\n10 20 30\n0 3\n", "60", "visible"),
        T("empty range", "3\n1 2 3\n2 2\n", "0", "hidden", "edge"),
        T("negatives", "4\n-5 5 -5 5\n0 3\n", "-5", "hidden", "edge"),
      ],
      hints: [
        "A pointer can walk forward with p++.",
        "Stop when it reaches end (end itself isn't included).",
        "for (const int* p = begin; p != end; p++) total += *p;",
        "const int* means you can read but not change the elements.",
      ],
      solution: `#include <iostream>
using namespace std;

long long sumRange(const int* begin, const int* end) {
    long long total = 0;
    for (const int* p = begin; p != end; p++) total += *p;
    return total;
}

int main() {
    int n;
    cin >> n;
    int arr[100];
    for (int i = 0; i < n; i++) cin >> arr[i];
    int l, r;
    cin >> l >> r;
    cout << sumRange(arr + l, arr + r) << endl;
    return 0;
}`,
      solutionNotes: "Half-open ranges [begin, end) make an empty range easy (begin == end) and are the same convention the STL uses with iterators.",
    },
    {
      title: "Count words with a char pointer",
      prompt: `Write \`int countWords(const char* s)\` that walks a C-string with a pointer until the terminating \`'\\0'\` and counts words (runs of non-space characters). Read a full line and print \`countWords(line.c_str())\`.`,
      starterCode: starter("Print countWords(line.c_str())", "string line;\ngetline(cin, line);", ["iostream", "string"], "// Write int countWords(const char* s) here — walk the pointer to '\\\\0'"),
      tests: [
        T("sample", "the quick brown fox\n", "4", "sample"),
        T("extra spaces", "   hello    world  \n", "2", "visible", "edge"),
        T("empty line", "\n", "0", "hidden", "edge"),
        T("one word", "C++\n", "1", "hidden", "boundary"),
        T("tabs count as spaces", "a\tb c\n", "3", "hidden", "edge"),
      ],
      hints: [
        "A C-string ends at the character '\\0'.",
        "Loop: while (*s != '\\0') { … s++; }",
        "A word starts where a non-space follows a space (or the start).",
        "Keep a flag `inWord`; count when it turns from false to true. isspace() handles tabs.",
      ],
      solution: `#include <iostream>
#include <string>
#include <cctype>
using namespace std;

int countWords(const char* s) {
    int count = 0;
    bool inWord = false;
    while (*s != '\\0') {
        if (isspace(static_cast<unsigned char>(*s))) {
            inWord = false;
        } else if (!inWord) {
            inWord = true;
            count++;
        }
        s++;
    }
    return count;
}

int main() {
    string line;
    getline(cin, line);
    cout << countWords(line.c_str()) << endl;
    return 0;
}`,
      solutionNotes: "The pointer itself is the loop variable. Counting transitions into a word (rather than spaces) handles leading, trailing and repeated spaces.",
    },
  ),

  "dynamic-memory": practice(
    {
      title: "Reverse on the heap",
      prompt: `Read \`n\` (0 ≤ n ≤ 100 000), allocate an array with \`new int[n]\`, read the numbers into it, print them in reverse order, and free the memory with \`delete[]\`.`,
      starterCode: starter("new int[n], read, print backwards, delete[]", "int n;\ncin >> n;"),
      tests: [
        T("sample", "4\n1 2 3 4\n", "4 3 2 1", "sample"),
        T("one", "1\n7\n", "7", "visible", "boundary"),
        T("empty", "0\n", "", "hidden", "edge"),
        T("negatives", "3\n-1 0 1\n", "1 0 -1", "hidden"),
      ],
      hints: [
        "The size is only known at run time, so allocate on the heap.",
        "int* a = new int[n];",
        "Use it like a normal array: a[i].",
        "Every new[] needs exactly one delete[] when you're done.",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int* a = new int[n];
    for (int i = 0; i < n; i++) cin >> a[i];
    for (int i = n - 1; i >= 0; i--) cout << a[i] << " ";
    cout << endl;
    delete[] a;
    return 0;
}`,
      solutionNotes: "`new int[n]` works for any n read at run time. `delete[]` (with brackets) matches `new[]`. In real code a std::vector does both for you.",
    },
    {
      title: "A growable array by hand",
      prompt: `Read numbers until the input ends and store them in a dynamic array you manage yourself: start with capacity 1; when it's full, allocate one **twice as big**, copy the elements across, and \`delete[]\` the old one. At the end print the count, the final capacity and the sum, separated by spaces.

| Input | Output |
| --- | --- |
| \`5 1 4 2 3\` | \`5 8 15\` |`,
      starterCode: starter("Grow the array by doubling whenever it's full", "int capacity = 1, size = 0;\nint* data = new int[capacity];\nint x;"),
      tests: [
        T("sample", "5 1 4 2 3\n", "5 8 15", "sample"),
        T("nothing", "\n", "0 1 0", "visible", "edge"),
        T("exactly a power of two", "1 1 1 1\n", "4 4 4", "hidden", "boundary"),
        T("seventeen values", "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17\n", "17 32 153", "hidden"),
      ],
      hints: [
        "while (cin >> x) reads until the input ends.",
        "Before storing, check: if (size == capacity) grow.",
        "Grow: int* bigger = new int[capacity * 2]; copy; delete[] data; data = bigger; capacity *= 2;",
        "Remember to delete[] data at the end.",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int capacity = 1, size = 0;
    int* data = new int[capacity];
    int x;
    while (cin >> x) {
        if (size == capacity) {
            int* bigger = new int[capacity * 2];
            for (int i = 0; i < size; i++) bigger[i] = data[i];
            delete[] data;
            data = bigger;
            capacity *= 2;
        }
        data[size++] = x;
    }
    long long sum = 0;
    for (int i = 0; i < size; i++) sum += data[i];
    cout << size << " " << capacity << " " << sum << endl;
    delete[] data;
    return 0;
}`,
      solutionNotes: "This is how std::vector grows. Doubling means copies are rare: n pushes cost O(n) in total. Forgetting `delete[] data` before reassigning would leak the old block.",
    },
  ),

  "classes-objects": practice(
    {
      title: "A simple bank account",
      prompt: `Write a class \`Account\` with a private balance (starting at 0), and public \`deposit(long long)\`, \`bool withdraw(long long)\` (refuses and returns false if there isn't enough) and \`balance()\`. Process commands: \`deposit X\`, \`withdraw X\` (print \`denied\` if refused) and \`balance\`.`,
      starterCode: `#include <iostream>
#include <string>
using namespace std;

// Write class Account here

int main() {
    Account acc;
    string cmd;
    while (cin >> cmd) {
        // Handle deposit / withdraw / balance
    }
    return 0;
}`,
      tests: [
        T("sample", "deposit 100\nwithdraw 30\nbalance\nwithdraw 500\nbalance\n", "70\ndenied\n70", "sample"),
        T("empty account", "balance\nwithdraw 1\n", "0\ndenied", "visible", "edge"),
        T("withdraw everything", "deposit 50\nwithdraw 50\nbalance\n", "0", "hidden", "boundary"),
        T("many", "deposit 1000000000\ndeposit 1000000000\nbalance\n", "2000000000", "hidden", "edge"),
      ],
      compare: "lines",
      hints: [
        "Keep balance private so only the class can change it.",
        "withdraw checks first: if (amount > bal) return false;",
        "balance() should be const — it doesn't change anything.",
        "In main: if (!acc.withdraw(x)) cout << \"denied\" << endl;",
      ],
      solution: `#include <iostream>
#include <string>
using namespace std;

class Account {
    long long bal = 0;
public:
    void deposit(long long amount) { bal += amount; }
    bool withdraw(long long amount) {
        if (amount > bal) return false;
        bal -= amount;
        return true;
    }
    long long balance() const { return bal; }
};

int main() {
    Account acc;
    string cmd;
    while (cin >> cmd) {
        if (cmd == "deposit") { long long x; cin >> x; acc.deposit(x); }
        else if (cmd == "withdraw") { long long x; cin >> x; if (!acc.withdraw(x)) cout << "denied" << endl; }
        else if (cmd == "balance") cout << acc.balance() << endl;
    }
    return 0;
}`,
      solutionNotes: "Encapsulation: the only way to change the balance is through methods that enforce the rule, so it can never go negative.",
    },
    {
      title: "A 24-hour clock class",
      prompt: `Write a class \`Clock\` with private hours and minutes, a method \`set(int h, int m)\`, \`addMinutes(int)\` (wrapping past midnight; the amount may be large) and \`string show() const\` returning \`HH:MM\` with leading zeros. Read a start time \`h m\`, then \`q\` amounts; after each, print the time.`,
      starterCode: `#include <iostream>
#include <string>
using namespace std;

// Write class Clock here

int main() {
    int h, m, q;
    cin >> h >> m >> q;
    Clock c;
    c.set(h, m);
    for (int i = 0; i < q; i++) {
        int add;
        cin >> add;
        // add the minutes and print c.show()
    }
    return 0;
}`,
      tests: [
        T("sample", "23 50 2\n15\n60\n", "00:05\n01:05", "sample"),
        T("no change", "9 5 1\n0\n", "09:05", "visible", "edge"),
        T("a full day", "12 0 1\n1440\n", "12:00", "hidden", "edge"),
        T("large amount", "0 0 1\n100000\n", "10:40", "hidden", "edge"),
      ],
      compare: "lines",
      hints: [
        "It's easiest to work in total minutes since midnight.",
        "total = (h * 60 + m + add) % 1440.",
        "Then h = total / 60 and m = total % 60.",
        "For leading zeros: (h < 10 ? \"0\" : \"\") + to_string(h).",
      ],
      solution: `#include <iostream>
#include <string>
using namespace std;

class Clock {
    int hours = 0, minutes = 0;
    static string two(int v) { return (v < 10 ? "0" : "") + to_string(v); }
public:
    void set(int h, int m) { hours = h; minutes = m; }
    void addMinutes(int add) {
        int total = (hours * 60 + minutes + add % 1440) % 1440;
        hours = total / 60;
        minutes = total % 60;
    }
    string show() const { return two(hours) + ":" + two(minutes); }
};

int main() {
    int h, m, q;
    cin >> h >> m >> q;
    Clock c;
    c.set(h, m);
    for (int i = 0; i < q; i++) {
        int add;
        cin >> add;
        c.addMinutes(add);
        cout << c.show() << endl;
    }
    return 0;
}`,
      solutionNotes: "Converting to one number (minutes since midnight) makes wrap-around a single `% 1440`. A private static helper formats two-digit values.",
    },
  ),

  "constructors-destructors": practice(
    {
      title: "Student with an initializer list",
      prompt: `Write a class \`Student\` whose constructor \`Student(string name, int a, int b, int c)\` stores a name and three marks using an **initializer list**, with \`name()\` and \`double average() const\`. Read \`n\` students and print each name and average with 1 decimal place.`,
      starterCode: `#include <iostream>
#include <iomanip>
#include <string>
using namespace std;

// Write class Student here

int main() {
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) {
        string name;
        int a, b, c;
        cin >> name >> a >> b >> c;
        // Construct a Student and print name and average (1 decimal)
    }
    return 0;
}`,
      tests: [
        T("sample", "2\nAsha 90 80 70\nRavi 50 51 51\n", "Asha 80.0\nRavi 50.7", "sample"),
        T("all zero", "1\nZed 0 0 0\n", "Zed 0.0", "visible", "edge"),
        T("perfect", "1\nMax 100 100 100\n", "Max 100.0", "hidden", "boundary"),
        T("rounding", "1\nIra 1 1 2\n", "Ira 1.3", "hidden", "edge"),
      ],
      compare: "lines",
      hints: [
        "An initializer list goes after the constructor's `)`: `: n(name), m1(a)…`.",
        "Members are initialised there before the body runs.",
        "average() must divide by 3.0, not 3.",
        "cout << fixed << setprecision(1) << s.average();",
      ],
      solution: `#include <iostream>
#include <iomanip>
#include <string>
using namespace std;

class Student {
    string n;
    int m1, m2, m3;
public:
    Student(string name, int a, int b, int c) : n(name), m1(a), m2(b), m3(c) {}
    string name() const { return n; }
    double average() const { return (m1 + m2 + m3) / 3.0; }
};

int main() {
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) {
        string name;
        int a, b, c;
        cin >> name >> a >> b >> c;
        Student s(name, a, b, c);
        cout << s.name() << " " << fixed << setprecision(1) << s.average() << endl;
    }
    return 0;
}`,
      solutionNotes: "The initializer list constructs members directly with their values. Dividing by 3.0 keeps the fraction (152 / 3 = 50.67 → 50.7).",
    },
    {
      title: "A fixed-capacity stack that cleans up",
      prompt: `Write a class \`IntStack\` whose constructor \`IntStack(int capacity)\` allocates \`new int[capacity]\` and whose **destructor** frees it. Methods: \`bool push(int)\` (false when full), \`bool pop(int& out)\` (false when empty). Read the capacity, then commands \`push X\` / \`pop\`: print \`full\` for a refused push, the value for a successful pop, or \`empty\`.`,
      starterCode: `#include <iostream>
#include <string>
using namespace std;

// Write class IntStack here (constructor allocates, destructor frees)

int main() {
    int cap;
    cin >> cap;
    IntStack st(cap);
    string cmd;
    while (cin >> cmd) {
        // Handle push / pop
    }
    return 0;
}`,
      tests: [
        T("sample", "2\npush 1\npush 2\npush 3\npop\npop\npop\n", "full\n2\n1\nempty", "sample"),
        T("pop when empty", "3\npop\n", "empty", "visible", "edge"),
        T("reuse after pop", "1\npush 5\npop\npush 6\npop\n", "5\n6", "hidden"),
        T("capacity zero", "0\npush 1\npop\n", "full\nempty", "hidden", "edge"),
      ],
      compare: "lines",
      hints: [
        "Store a pointer to the heap array, the capacity and the current size.",
        "Constructor: data = new int[capacity]; destructor: delete[] data;",
        "push: if (size == cap) return false; data[size++] = x;",
        "pop: if (size == 0) return false; out = data[--size];",
      ],
      solution: `#include <iostream>
#include <string>
using namespace std;

class IntStack {
    int* data;
    int cap;
    int size = 0;
public:
    explicit IntStack(int capacity) : data(new int[capacity]), cap(capacity) {}
    ~IntStack() { delete[] data; }
    IntStack(const IntStack&) = delete;
    IntStack& operator=(const IntStack&) = delete;
    bool push(int x) {
        if (size == cap) return false;
        data[size++] = x;
        return true;
    }
    bool pop(int& out) {
        if (size == 0) return false;
        out = data[--size];
        return true;
    }
};

int main() {
    int cap;
    cin >> cap;
    IntStack st(cap);
    string cmd;
    while (cin >> cmd) {
        if (cmd == "push") {
            int x;
            cin >> x;
            if (!st.push(x)) cout << "full" << endl;
        } else if (cmd == "pop") {
            int v;
            if (st.pop(v)) cout << v << endl;
            else cout << "empty" << endl;
        }
    }
    return 0;
}`,
      solutionNotes: "The constructor acquires the memory and the destructor releases it, so it can't leak. Deleting the copy operations stops two objects from sharing (and double-freeing) one array — the rule of three in its simplest form.",
    },
  ),

  "inheritance-polymorphism": practice(
    {
      title: "Shapes and their areas",
      prompt: `Write an abstract base class \`Shape\` with \`virtual double area() const = 0\` and \`virtual string name() const = 0\`, and derived classes \`Circle(r)\`, \`Rect(w, h)\` and \`Triangle(base, height)\`. Read \`n\` shapes (\`C r\`, \`R w h\`, \`T b h\`), store them as \`unique_ptr<Shape>\` in a vector, then print each \`name area\` (2 decimals) and finally \`total\` with the sum. Use π = 3.14159265358979.`,
      starterCode: `#include <iostream>
#include <iomanip>
#include <memory>
#include <string>
#include <vector>
using namespace std;

// Write Shape, Circle, Rect and Triangle here

int main() {
    int n;
    cin >> n;
    vector<unique_ptr<Shape>> shapes;
    // Read the shapes, then print each name and area, then the total
    return 0;
}`,
      tests: [
        T("sample", "3\nC 1\nR 2 3\nT 4 5\n", "circle 3.14\nrect 6.00\ntriangle 10.00\ntotal 19.14", "sample"),
        T("one rect", "1\nR 1.5 2\n", "rect 3.00\ntotal 3.00", "visible"),
        T("no shapes", "0\n", "total 0.00", "hidden", "edge"),
        T("circles", "2\nC 2\nC 0.5\n", "circle 12.57\ncircle 0.79\ntotal 13.35", "hidden"),
      ],
      compare: "lines",
      hints: [
        "`= 0` makes a function pure virtual: derived classes must override it.",
        "Each derived class stores its own sizes and overrides area() and name().",
        "shapes.push_back(make_unique<Circle>(r));",
        "Loop over shapes calling s->area() — the right override runs for each.",
      ],
      solution: `#include <iostream>
#include <iomanip>
#include <memory>
#include <string>
#include <vector>
using namespace std;

struct Shape {
    virtual double area() const = 0;
    virtual string name() const = 0;
    virtual ~Shape() = default;
};

struct Circle : Shape {
    double r;
    explicit Circle(double r) : r(r) {}
    double area() const override { return 3.14159265358979 * r * r; }
    string name() const override { return "circle"; }
};

struct Rect : Shape {
    double w, h;
    Rect(double w, double h) : w(w), h(h) {}
    double area() const override { return w * h; }
    string name() const override { return "rect"; }
};

struct Triangle : Shape {
    double b, h;
    Triangle(double b, double h) : b(b), h(h) {}
    double area() const override { return 0.5 * b * h; }
    string name() const override { return "triangle"; }
};

int main() {
    int n;
    cin >> n;
    vector<unique_ptr<Shape>> shapes;
    for (int i = 0; i < n; i++) {
        char t;
        cin >> t;
        if (t == 'C') { double r; cin >> r; shapes.push_back(make_unique<Circle>(r)); }
        else if (t == 'R') { double w, h; cin >> w >> h; shapes.push_back(make_unique<Rect>(w, h)); }
        else { double b, h; cin >> b >> h; shapes.push_back(make_unique<Triangle>(b, h)); }
    }
    double total = 0;
    cout << fixed << setprecision(2);
    for (const auto& s : shapes) {
        cout << s->name() << " " << s->area() << endl;
        total += s->area();
    }
    cout << "total " << total << endl;
    return 0;
}`,
      solutionNotes: "The vector holds base-class pointers, and virtual dispatch picks each object's own area(). A virtual destructor makes deleting through a Shape pointer safe.",
    },
    {
      title: "Stacking discounts",
      prompt: `Write a base class \`Discount\` with \`virtual double apply(double price) const\`, and three kinds:

- \`P x\` — PercentOff: take x% off,
- \`F x\` — FlatOff: subtract x, but never go below 0,
- \`B t x\` — BigSpender: subtract x only if the price is **at least** t.

Read a starting price and \`n\` discounts; apply them **in order** through a \`vector<unique_ptr<Discount>>\` and print the final price with 2 decimals.`,
      starterCode: `#include <iostream>
#include <iomanip>
#include <memory>
#include <vector>
using namespace std;

// Write Discount, PercentOff, FlatOff and BigSpender here

int main() {
    double price;
    int n;
    cin >> price >> n;
    vector<unique_ptr<Discount>> ds;
    // Read the discounts, apply them in order, print the final price (2 decimals)
    return 0;
}`,
      tests: [
        T("sample", "1000 3\nP 10\nF 50\nB 800 100\n", "750.00", "sample"),
        T("order matters", "1000 2\nB 950 100\nP 10\n", "810.00", "visible", "edge"),
        T("flat floor at zero", "30 1\nF 50\n", "0.00", "hidden", "edge"),
        T("threshold not met", "500 1\nB 600 100\n", "500.00", "hidden", "boundary"),
        T("threshold exactly met", "600 1\nB 600 100\n", "500.00", "hidden", "boundary"),
      ],
      compare: "lines",
      hints: [
        "Each kind stores its own numbers and overrides apply().",
        "PercentOff: price * (1 - x / 100).",
        "FlatOff: max(0.0, price - x).",
        "Apply in a loop: for (auto& d : ds) price = d->apply(price);",
      ],
      solution: `#include <iostream>
#include <iomanip>
#include <memory>
#include <vector>
#include <algorithm>
using namespace std;

struct Discount {
    virtual double apply(double price) const = 0;
    virtual ~Discount() = default;
};

struct PercentOff : Discount {
    double pct;
    explicit PercentOff(double p) : pct(p) {}
    double apply(double price) const override { return price * (1 - pct / 100); }
};

struct FlatOff : Discount {
    double amount;
    explicit FlatOff(double a) : amount(a) {}
    double apply(double price) const override { return max(0.0, price - amount); }
};

struct BigSpender : Discount {
    double threshold, amount;
    BigSpender(double t, double a) : threshold(t), amount(a) {}
    double apply(double price) const override { return price >= threshold ? price - amount : price; }
};

int main() {
    double price;
    int n;
    cin >> price >> n;
    vector<unique_ptr<Discount>> ds;
    for (int i = 0; i < n; i++) {
        char k;
        cin >> k;
        if (k == 'P') { double x; cin >> x; ds.push_back(make_unique<PercentOff>(x)); }
        else if (k == 'F') { double x; cin >> x; ds.push_back(make_unique<FlatOff>(x)); }
        else { double t, x; cin >> t >> x; ds.push_back(make_unique<BigSpender>(t, x)); }
    }
    for (const auto& d : ds) price = d->apply(price);
    cout << fixed << setprecision(2) << price << endl;
    return 0;
}`,
      solutionNotes: "Each discount is a small object with one virtual operation; the loop doesn't care which kind it holds. New kinds can be added without changing the loop.",
    },
  ),

  "auto-lambdas": practice(
    {
      title: "Sort words by length",
      prompt: `Read \`n\` words. Print them sorted by **length** (shortest first); words of the same length in alphabetical order. Use \`sort\` with a lambda.`,
      starterCode: starter("sort(words) with a lambda comparing length, then alphabetical order", "int n;\ncin >> n;\nvector<string> words(n);\nfor (auto& w : words) cin >> w;", ["iostream", "string", "vector", "algorithm"]),
      tests: [
        T("sample", "5\npear fig banana kiwi apple\n", "fig kiwi pear apple banana", "sample"),
        T("same length", "3\ncc aa bb\n", "aa bb cc", "visible", "edge"),
        T("one", "1\nsolo\n", "solo", "hidden", "boundary"),
        T("duplicates", "4\nb a b a\n", "a a b b", "hidden", "edge"),
      ],
      hints: [
        "sort(begin, end, comparator) — the comparator says whether a comes before b.",
        "Compare sizes first.",
        "If the sizes are equal, compare the words themselves.",
        "[](const string& a, const string& b) { if (a.size() != b.size()) return a.size() < b.size(); return a < b; }",
      ],
      solution: `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<string> words(n);
    for (auto& w : words) cin >> w;
    sort(words.begin(), words.end(), [](const string& a, const string& b) {
        if (a.size() != b.size()) return a.size() < b.size();
        return a < b;
    });
    for (const auto& w : words) cout << w << " ";
    cout << endl;
    return 0;
}`,
      solutionNotes: "A lambda writes the comparison right where it's used. Comparing a second key only when the first ties gives a stable, predictable order.",
    },
    {
      title: "Closest to k",
      prompt: `Read \`n\`, then n whole numbers, then \`k\`. Print the numbers ordered by their distance from k (closest first); for equal distances, the **smaller** number first. Use a lambda that **captures** k.`,
      starterCode: starter("Sort by |x - k| using a lambda that captures k", "int n;\ncin >> n;\nvector<int> v(n);\nfor (auto& x : v) cin >> x;\nint k;\ncin >> k;", ["iostream", "vector", "algorithm", "cstdlib"]),
      tests: [
        T("sample", "5\n1 7 4 10 5\n5\n", "5 4 7 1 10", "sample"),
        T("ties", "4\n3 7 2 8\n5\n", "3 7 2 8", "visible", "edge"),
        T("negatives", "3\n-5 5 0\n-1\n", "0 -5 5", "hidden", "edge"),
        T("one", "1\n9\n100\n", "9", "hidden", "boundary"),
      ],
      hints: [
        "The comparator needs k, which lives outside it.",
        "Capture it: [k](int a, int b) { … }.",
        "Compare abs(a - k) with abs(b - k).",
        "If the distances are equal, return a < b.",
      ],
      solution: `#include <iostream>
#include <vector>
#include <algorithm>
#include <cstdlib>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> v(n);
    for (auto& x : v) cin >> x;
    int k;
    cin >> k;
    sort(v.begin(), v.end(), [k](int a, int b) {
        int da = abs(a - k), db = abs(b - k);
        if (da != db) return da < db;
        return a < b;
    });
    for (int x : v) cout << x << " ";
    cout << endl;
    return 0;
}`,
      solutionNotes: "`[k]` copies k into the lambda, so the comparator can use it. The tie-break makes the order fully defined.",
    },
  ),

  "templates": practice(
    {
      title: "Largest of anything",
      prompt: `Write a function template \`T largest(const vector<T>& v)\`. Read \`n\` whole numbers and then \`m\` words, and print the largest number and the alphabetically last word on separate lines — using the same template for both.`,
      starterCode: starter("Print largest(nums) and largest(words)", "int n;\ncin >> n;\nvector<int> nums(n);\nfor (auto& x : nums) cin >> x;\nint m;\ncin >> m;\nvector<string> words(m);\nfor (auto& w : words) cin >> w;", ["iostream", "string", "vector"], "// Write template <typename T> T largest(const vector<T>& v) here"),
      tests: [
        T("sample", "3\n4 9 2\n3\npear apple zebra\n", "9\nzebra", "sample"),
        T("negatives", "2\n-5 -3\n1\nonly\n", "-3\nonly", "visible", "edge"),
        T("ties", "3\n7 7 7\n2\nab ab\n", "7\nab", "hidden", "edge"),
        T("uppercase sorts first", "1\n0\n3\nBanana apple Cherry\n", "0\napple", "hidden", "edge"),
      ],
      compare: "lines",
      hints: [
        "Start the template with `template <typename T>`.",
        "Inside, T is whatever type the vector holds.",
        "Track the best so far, starting with v[0].",
        "The compiler creates an int version and a string version from one template.",
      ],
      solution: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

template <typename T>
T largest(const vector<T>& v) {
    T best = v[0];
    for (const T& x : v) {
        if (x > best) best = x;
    }
    return best;
}

int main() {
    int n;
    cin >> n;
    vector<int> nums(n);
    for (auto& x : nums) cin >> x;
    int m;
    cin >> m;
    vector<string> words(m);
    for (auto& w : words) cin >> w;
    cout << largest(nums) << endl;
    cout << largest(words) << endl;
    return 0;
}`,
      solutionNotes: "One template, two instantiations: the compiler deduces T = int and T = string. Strings compare by character codes, so lowercase \"apple\" beats uppercase \"Cherry\".",
    },
    {
      title: "A generic min-max tracker",
      prompt: `Write a class template \`MinMax<T>\` with \`add(const T&)\`, \`T min() const\`, \`T max() const\` and \`int count() const\`. Read \`n\` whole numbers into a \`MinMax<int>\` and \`m\` words into a \`MinMax<string>\`. Print \`count min max\` for each on its own line (\`0\` alone if a tracker is empty).`,
      starterCode: starter("Fill a MinMax<int> and a MinMax<string>, print count min max for each", "", ["iostream", "string"], "// Write template <typename T> class MinMax here"),
      tests: [
        T("sample", "4\n5 -2 9 3\n3\nkiwi apple mango\n", "4 -2 9\n3 apple mango", "sample"),
        T("empty words", "1\n7\n0\n", "1 7 7\n0", "visible", "edge"),
        T("both empty", "0\n0\n", "0\n0", "hidden", "edge"),
        T("equal values", "3\n4 4 4\n2\nz z\n", "3 4 4\n2 z z", "hidden"),
      ],
      compare: "lines",
      hints: [
        "Store lo, hi and a count as members of type T, T and int.",
        "On the first add, set both lo and hi to the value.",
        "Afterwards update lo and hi with < and >.",
        "In main, read the values and call add for each; check count() before printing min/max.",
      ],
      solution: `#include <iostream>
#include <string>
using namespace std;

template <typename T>
class MinMax {
    T lo{}, hi{};
    int n = 0;
public:
    void add(const T& x) {
        if (n == 0 || x < lo) lo = x;
        if (n == 0 || x > hi) hi = x;
        n++;
    }
    T min() const { return lo; }
    T max() const { return hi; }
    int count() const { return n; }
};

template <typename T>
void report(const MinMax<T>& m) {
    if (m.count() == 0) cout << 0 << endl;
    else cout << m.count() << " " << m.min() << " " << m.max() << endl;
}

int main() {
    int n;
    cin >> n;
    MinMax<int> ints;
    for (int i = 0; i < n; i++) { int x; cin >> x; ints.add(x); }
    int m;
    cin >> m;
    MinMax<string> words;
    for (int i = 0; i < m; i++) { string w; cin >> w; words.add(w); }
    report(ints);
    report(words);
    return 0;
}`,
      solutionNotes: "A class template is a blueprint for a family of classes. Any type with < and > works, and the helper `report` is itself a function template.",
    },
  ),

  "modern-features": practice(
    {
      title: "Traffic lights with enum class",
      prompt: `Write \`enum class Light { Red, Green, Yellow }\` with \`Light next(Light)\` (Red → Green → Yellow → Red) and \`string name(Light)\`. Read a starting colour (\`red\`, \`green\` or \`yellow\`) and a number of steps (may be large); print the colour after that many steps.`,
      starterCode: starter("Convert the input to a Light, step it, and print its name", "string start;\nlong long steps;\ncin >> start >> steps;", ["iostream", "string"], "// Write enum class Light, next() and name() here"),
      tests: [
        T("sample", "red 2\n", "yellow", "sample"),
        T("no steps", "green 0\n", "green", "visible", "edge"),
        T("wrap", "yellow 1\n", "red", "hidden", "boundary"),
        T("huge", "red 1000000000000\n", "green", "hidden", "edge"),
      ],
      hints: [
        "Write each enum value as Light::Red etc.",
        "A switch on the Light handles next() and name().",
        "The cycle has length 3, so only steps % 3 matters.",
        "Parse the input with if/else on the string.",
      ],
      solution: `#include <iostream>
#include <string>
using namespace std;

enum class Light { Red, Green, Yellow };

Light next(Light l) {
    switch (l) {
        case Light::Red: return Light::Green;
        case Light::Green: return Light::Yellow;
        default: return Light::Red;
    }
}

string name(Light l) {
    switch (l) {
        case Light::Red: return "red";
        case Light::Green: return "green";
        default: return "yellow";
    }
}

int main() {
    string start;
    long long steps;
    cin >> start >> steps;
    Light l = start == "red" ? Light::Red : start == "green" ? Light::Green : Light::Yellow;
    for (long long i = 0; i < steps % 3; i++) l = next(l);
    cout << name(l) << endl;
    return 0;
}`,
      solutionNotes: "enum class names are scoped (Light::Red) and won't silently turn into ints. Since the cycle repeats every 3 steps, a trillion steps is the same as 1000000000000 % 3 = 1.",
    },
    {
      title: "Parse key=value with optional",
      prompt: `Write \`optional<pair<string, int>> parse(string_view line)\`. A line is valid when it contains exactly one \`=\`, the key before it is non-empty and made of letters, and the value after it is a non-empty run of digits (at most 9). Read \`q\` lines and print \`key -> value\` for valid ones, otherwise \`invalid\`.`,
      starterCode: starter("For each line, call parse() and print key -> value or invalid", "int q;\ncin >> q;\ncin.ignore();", ["iostream", "string", "string_view", "optional", "utility", "cctype"], "// Write optional<pair<string, int>> parse(string_view line) here"),
      tests: [
        T("sample", "3\nage=14\nname=Asha\n=5\n", "age -> 14\ninvalid\ninvalid", "sample"),
        T("missing value", "1\nscore=\n", "invalid", "visible", "edge"),
        T("two equals", "1\na=1=2\n", "invalid", "hidden", "edge"),
        T("leading zeros", "1\nx=007\n", "x -> 7", "hidden", "edge"),
        T("too long", "1\nbig=1234567890\n", "invalid", "hidden", "boundary"),
      ],
      compare: "lines",
      hints: [
        "Find the '=' with line.find('='); also check there's no second one.",
        "Split with substr into key and value views.",
        "Check every character: isalpha for the key, isdigit for the value.",
        "Return nullopt for invalid input, or make_pair(string(key), stoi(string(value))).",
      ],
      solution: `#include <iostream>
#include <string>
#include <string_view>
#include <optional>
#include <utility>
#include <cctype>
using namespace std;

optional<pair<string, int>> parse(string_view line) {
    size_t eq = line.find('=');
    if (eq == string_view::npos || line.find('=', eq + 1) != string_view::npos) return nullopt;
    string_view key = line.substr(0, eq), value = line.substr(eq + 1);
    if (key.empty() || value.empty() || value.size() > 9) return nullopt;
    for (char c : key) if (!isalpha(static_cast<unsigned char>(c))) return nullopt;
    for (char c : value) if (!isdigit(static_cast<unsigned char>(c))) return nullopt;
    return make_pair(string(key), stoi(string(value)));
}

int main() {
    int q;
    cin >> q;
    cin.ignore();
    for (int i = 0; i < q; i++) {
        string line;
        getline(cin, line);
        auto r = parse(line);
        if (r) cout << r->first << " -> " << r->second << endl;
        else cout << "invalid" << endl;
    }
    return 0;
}`,
      solutionNotes: "string_view looks at the line without copying it; substr on a view is free. optional makes \"no result\" part of the return type instead of a magic value.",
    },
  ),

  "vector-algorithms": practice(
    {
      title: "Stats with algorithms",
      prompt: `Read \`n\` (≥ 1) whole numbers into a vector. Using standard algorithms, print on one line: the minimum, the maximum, the sum, and how many are negative.`,
      starterCode: starter("Use min_element, max_element, accumulate and count_if", "int n;\ncin >> n;\nvector<int> v(n);\nfor (auto& x : v) cin >> x;", ["iostream", "vector", "algorithm", "numeric"]),
      tests: [
        T("sample", "5\n3 -1 4 -1 5\n", "-1 5 10 2", "sample"),
        T("one", "1\n7\n", "7 7 7 0", "visible", "boundary"),
        T("all negative", "3\n-3 -2 -1\n", "-3 -1 -6 3", "hidden", "edge"),
        T("big sum", "3\n2000000000 2000000000 2000000000\n", "2000000000 2000000000 6000000000 0", "hidden", "edge"),
      ],
      hints: [
        "min_element and max_element return iterators — dereference them.",
        "accumulate(v.begin(), v.end(), 0LL) adds as long long (note the LL).",
        "count_if takes a predicate: [](int x) { return x < 0; }.",
        "Print all four with spaces between.",
      ],
      solution: `#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> v(n);
    for (auto& x : v) cin >> x;
    cout << *min_element(v.begin(), v.end()) << " "
         << *max_element(v.begin(), v.end()) << " "
         << accumulate(v.begin(), v.end(), 0LL) << " "
         << count_if(v.begin(), v.end(), [](int x) { return x < 0; }) << endl;
    return 0;
}`,
      solutionNotes: "accumulate's result type is the type of its starting value: `0` would sum in int and overflow; `0LL` sums in long long.",
    },
    {
      title: "How many are at most x?",
      prompt: `Read \`n\` numbers, then \`q\` queries. For each query \`x\`, print how many of the numbers are **≤ x**. n and q can both be 100 000, so sort once and answer each query with \`upper_bound\` (binary search).`,
      starterCode: starter("Sort once, then answer each query with upper_bound", "int n;\ncin >> n;\nvector<int> v(n);\nfor (auto& x : v) cin >> x;\nint q;\ncin >> q;", ["iostream", "vector", "algorithm"]),
      tests: [
        T("sample", "5\n4 1 7 4 2\n3\n4\n0\n10\n", "4\n0\n5", "sample"),
        T("between values", "3\n10 20 30\n1\n25\n", "2", "visible"),
        T("duplicates", "4\n5 5 5 5\n2\n5\n4\n", "4\n0", "hidden", "edge"),
        T("negatives", "3\n-3 -1 2\n2\n-2\n-1\n", "1\n2", "hidden", "edge"),
      ],
      compare: "lines",
      hints: [
        "Checking every number for every query is n × q = 10¹⁰ steps — too slow.",
        "After sorting, all numbers ≤ x come first.",
        "upper_bound(begin, end, x) points to the first element > x.",
        "Its distance from begin is the count: upper_bound(...) - v.begin().",
      ],
      solution: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> v(n);
    for (auto& x : v) cin >> x;
    sort(v.begin(), v.end());
    int q;
    cin >> q;
    for (int i = 0; i < q; i++) {
        int x;
        cin >> x;
        cout << (upper_bound(v.begin(), v.end(), x) - v.begin()) << "\\n";
    }
    return 0;
}`,
      solutionNotes: "Sorting costs O(n log n) once; each query is then O(log n). upper_bound finds the first element greater than x, so everything before it is ≤ x.",
    },
  ),

  "map-set": practice(
    {
      title: "Phone book",
      prompt: `Process commands: \`add NAME NUMBER\` (adds or replaces), \`find NAME\` (print the number or \`not found\`), \`remove NAME\` and \`count\` (print how many entries there are). Use a \`map<string, string>\`.`,
      starterCode: `#include <iostream>
#include <map>
#include <string>
using namespace std;

int main() {
    map<string, string> book;
    string cmd;
    while (cin >> cmd) {
        // Handle add / find / remove / count
    }
    return 0;
}`,
      tests: [
        T("sample", "add asha 98765\nadd ravi 12345\nfind asha\ncount\nremove asha\nfind asha\ncount\n", "98765\n2\nnot found\n1", "sample"),
        T("replace", "add a 1\nadd a 2\nfind a\ncount\n", "2\n1", "visible", "edge"),
        T("find never added", "find ghost\ncount\n", "not found\n0", "hidden", "edge"),
        T("remove missing is fine", "remove x\ncount\n", "0", "hidden", "edge"),
      ],
      compare: "lines",
      hints: [
        "book[name] = number adds or replaces.",
        "Use find() for lookups — [] would insert an empty entry.",
        "book.erase(name) removes (and does nothing if it's missing).",
        "book.size() is the count.",
      ],
      solution: `#include <iostream>
#include <map>
#include <string>
using namespace std;

int main() {
    map<string, string> book;
    string cmd;
    while (cin >> cmd) {
        if (cmd == "add") {
            string name, number;
            cin >> name >> number;
            book[name] = number;
        } else if (cmd == "find") {
            string name;
            cin >> name;
            auto it = book.find(name);
            cout << (it == book.end() ? "not found" : it->second) << endl;
        } else if (cmd == "remove") {
            string name;
            cin >> name;
            book.erase(name);
        } else if (cmd == "count") {
            cout << book.size() << endl;
        }
    }
    return 0;
}`,
      solutionNotes: "Using `book[name]` to look someone up would quietly add an empty entry and break the count — find() looks without inserting.",
    },
    {
      title: "Group anagrams",
      prompt: `Read \`n\` words. Group words that are anagrams of each other. Print one group per line: groups ordered by their **sorted-letters key**, words within a group in the order they appeared.

| Input | Output |
| --- | --- |
| \`5\` / \`eat tea tan ate nat\` | \`eat tea ate\` / \`tan nat\` |`,
      starterCode: starter("Group by the word's sorted letters using a map<string, vector<string>>", "int n;\ncin >> n;", ["iostream", "string", "vector", "map", "algorithm"]),
      tests: [
        T("sample", "5\neat tea tan ate nat\n", "eat tea ate\ntan nat", "sample"),
        T("no anagrams", "3\ndog cat bird\n", "cat\nbird\ndog", "visible"),
        T("one group", "3\nabc cab bca\n", "abc cab bca", "hidden"),
        T("repeated word", "2\nsee see\n", "see see", "hidden", "edge"),
      ],
      compare: "lines",
      hints: [
        "Two words are anagrams exactly when their sorted letters are equal.",
        "Use the sorted word as a map key.",
        "map<string, vector<string>> groups; groups[key].push_back(word);",
        "A map iterates its keys in sorted order — that's the group order.",
      ],
      solution: `#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <algorithm>
using namespace std;

int main() {
    int n;
    cin >> n;
    map<string, vector<string>> groups;
    for (int i = 0; i < n; i++) {
        string w;
        cin >> w;
        string key = w;
        sort(key.begin(), key.end());
        groups[key].push_back(w);
    }
    for (const auto& [key, words] : groups) {
        for (size_t i = 0; i < words.size(); i++) cout << (i ? " " : "") << words[i];
        cout << endl;
    }
    return 0;
}`,
      solutionNotes: "Sorting the letters gives every anagram the same \"signature\". The map groups by signature and keeps signatures sorted (\"act\" < \"bdir\" < \"dgo\"); push_back keeps input order within a group.",
    },
  ),

  "stack-queue": practice(
    {
      title: "Undo",
      prompt: `A tiny editor: \`type WORD\` adds a word, \`undo\` removes the most recent word still present (does nothing if there are none), and \`show\` prints the words in order separated by spaces (or \`(empty)\`). Use a stack — or a vector used as one.`,
      starterCode: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    vector<string> words;  // used as a stack: push_back / pop_back
    string cmd;
    while (cin >> cmd) {
        // Handle type / undo / show
    }
    return 0;
}`,
      tests: [
        T("sample", "type hello\ntype big\ntype world\nundo\ntype there\nshow\n", "hello big there", "sample"),
        T("undo too many", "type a\nundo\nundo\nshow\n", "(empty)", "visible", "edge"),
        T("show twice", "type x\nshow\ntype y\nshow\n", "x\nx y", "hidden"),
        T("nothing", "show\n", "(empty)", "hidden", "edge"),
      ],
      compare: "lines",
      hints: [
        "Undo always removes the newest item — last in, first out.",
        "push_back for type, pop_back for undo.",
        "Check empty() before pop_back.",
        "Unlike std::stack, a vector lets you print every element in order.",
      ],
      solution: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    vector<string> words;
    string cmd;
    while (cin >> cmd) {
        if (cmd == "type") {
            string w;
            cin >> w;
            words.push_back(w);
        } else if (cmd == "undo") {
            if (!words.empty()) words.pop_back();
        } else if (cmd == "show") {
            if (words.empty()) cout << "(empty)";
            for (size_t i = 0; i < words.size(); i++) cout << (i ? " " : "") << words[i];
            cout << endl;
        }
    }
    return 0;
}`,
      solutionNotes: "Undo is LIFO. A vector supports the stack operations (push_back/pop_back/back) and also lets you print everything, which std::stack doesn't.",
    },
    {
      title: "Counting-out game",
      prompt: `n children (numbered 1 to n) stand in a circle. Counting starts at child 1; every **k-th** child counted leaves the circle, and counting continues with the next child. Print the order in which children leave. Use a \`queue<int>\`.

| Input | Output |
| --- | --- |
| \`7 3\` | \`3 6 2 7 5 1 4\` |`,
      starterCode: starter("Rotate the queue k-1 times, then remove the front; repeat", "int n, k;\ncin >> n >> k;", ["iostream", "queue"]),
      tests: [
        T("7 3", "7 3\n", "3 6 2 7 5 1 4", "sample"),
        T("k = 1", "4 1\n", "1 2 3 4", "visible", "edge"),
        T("one child", "1 5\n", "1", "hidden", "boundary"),
        T("k bigger than n", "3 5\n", "2 3 1", "hidden", "edge"),
      ],
      hints: [
        "Put 1…n in a queue.",
        "Skipping a child = take it from the front and push it to the back.",
        "Skip k − 1 children, then the front child leaves (print and pop).",
        "Repeat until the queue is empty.",
      ],
      solution: `#include <iostream>
#include <queue>
using namespace std;

int main() {
    int n, k;
    cin >> n >> k;
    queue<int> q;
    for (int i = 1; i <= n; i++) q.push(i);
    while (!q.empty()) {
        for (int s = 0; s < k - 1; s++) {
            q.push(q.front());
            q.pop();
        }
        cout << q.front() << " ";
        q.pop();
    }
    cout << endl;
    return 0;
}`,
      solutionNotes: "A queue models the circle: moving the front to the back is \"pass it on\". This is the Josephus problem.",
    },
  ),
};
