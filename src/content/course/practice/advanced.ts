import type { PracticeProblem } from "../types";
import { practice, starter, T } from "./helpers";

/** Practice problems for modules 15–17: streams & exceptions, advanced C++, projects. */
export const ADVANCED_PRACTICE: Record<string, PracticeProblem[]> = {
  "streams-parsing": practice(
    {
      title: "Shopping list totals",
      prompt: `Read lines until the input ends. Each line is \`item,qty,price\` (the item name may contain spaces). For each line print \`item: total\` (qty × price with 2 decimals), then a final line \`TOTAL: sum\`.`,
      starterCode: starter("getline each line, split on commas with a stringstream, print totals", "", ["iostream", "sstream", "string", "iomanip"]),
      tests: [
        T("sample", "pen,3,10.5\nnote book,2,45\n", "pen: 31.50\nnote book: 90.00\nTOTAL: 121.50", "sample"),
        T("one line", "milk,1,0.99\n", "milk: 0.99\nTOTAL: 0.99", "visible"),
        T("empty input", "", "TOTAL: 0.00", "hidden", "edge"),
        T("zero quantity", "gift wrap,0,25\nbox,10,1.25\n", "gift wrap: 0.00\nbox: 12.50\nTOTAL: 12.50", "hidden", "edge"),
      ],
      compare: "lines",
      hints: [
        "`while (getline(cin, line))` reads one whole line at a time.",
        "Wrap the line: `istringstream in(line);`",
        "getline(in, item, ',') reads up to the comma; then `in >> qty` and skip the next comma.",
        "Print with `fixed << setprecision(2)`.",
      ],
      solution: `#include <iostream>
#include <sstream>
#include <string>
#include <iomanip>
using namespace std;

int main() {
    string line;
    double grand = 0;
    cout << fixed << setprecision(2);
    while (getline(cin, line)) {
        if (line.empty()) continue;
        istringstream in(line);
        string item;
        int qty;
        double price;
        char comma;
        getline(in, item, ',');
        in >> qty >> comma >> price;
        double total = qty * price;
        grand += total;
        cout << item << ": " << total << endl;
    }
    cout << "TOTAL: " << grand << endl;
    return 0;
}`,
      solutionNotes: "getline with ',' handles names containing spaces; after that, `>>` reads the numbers and a char variable swallows the comma between them.",
    },
    {
      title: "A tiny word counter",
      prompt: `Read all of the input. Print three numbers like the \`wc\` tool: the number of **lines**, **words** (runs of non-space characters) and **characters** (every character except the newline at the end of each line). Then print the longest word (the first one if tied), or \`-\` if there are no words.`,
      starterCode: starter("Read line by line; count lines, words and characters; track the longest word", "", ["iostream", "sstream", "string"]),
      tests: [
        T("sample", "the cat sat\non the mat\n", "2 6 21\nthe", "sample"),
        T("longest", "a bb ccc\ndddd\n", "2 4 12\ndddd", "visible"),
        T("blank lines count", "hi\n\nthere\n", "3 2 7\nthere", "hidden", "edge"),
        T("nothing", "", "0 0 0\n-", "hidden", "edge"),
        T("extra spaces", "  spaced   out  \n", "1 2 16\nspaced", "hidden", "edge"),
      ],
      compare: "lines",
      hints: [
        "Each getline is one line; line.size() counts its characters (without the newline).",
        "To count words in a line, read from an istringstream with >> until it fails.",
        "Keep the longest word; use > so the first one wins ties.",
        "Print `-` if no word was ever read.",
      ],
      solution: `#include <iostream>
#include <sstream>
#include <string>
using namespace std;

int main() {
    string line, longest;
    long long lines = 0, words = 0, chars = 0;
    while (getline(cin, line)) {
        lines++;
        chars += line.size();
        istringstream in(line);
        string w;
        while (in >> w) {
            words++;
            if (w.size() > longest.size()) longest = w;
        }
    }
    cout << lines << " " << words << " " << chars << endl;
    cout << (longest.empty() ? "-" : longest) << endl;
    return 0;
}`,
      solutionNotes: "Reading by lines and then by words combines both stream styles: getline for structure, >> for whitespace-separated tokens. `>>` skips any amount of whitespace, so extra spaces don't create empty words.",
    },
  ),

  "exceptions": practice(
    {
      title: "Parse a positive number",
      prompt: `Write \`int parsePositive(const string& s)\` that throws \`invalid_argument("not a number")\` if s isn't all digits (or is empty), and \`out_of_range("not positive")\` if the value is 0 — the input has at most 9 digits. Read tokens until the input ends and print the value or \`error: MESSAGE\`.`,
      starterCode: starter("For each token: try parsePositive, catch and print the message", "", ["iostream", "string", "stdexcept", "cctype"], "// Write int parsePositive(const string& s) here — throw on bad input"),
      tests: [
        T("sample", "42 abc 0 007\n", "42\nerror: not a number\nerror: not positive\n7", "sample"),
        T("negative sign", "-5\n", "error: not a number", "visible", "edge"),
        T("mixed", "12x 1\n", "error: not a number\n1", "hidden", "edge"),
        T("zeros", "000\n", "error: not positive", "hidden", "edge"),
      ],
      compare: "lines",
      hints: [
        "Check every character with isdigit before converting.",
        "throw invalid_argument(\"not a number\"); stops the function at once.",
        "Convert with stoi, then check for 0.",
        "In main: try { cout << parsePositive(tok); } catch (const exception& e) { cout << \"error: \" << e.what(); }",
      ],
      solution: `#include <iostream>
#include <string>
#include <stdexcept>
#include <cctype>
using namespace std;

int parsePositive(const string& s) {
    if (s.empty()) throw invalid_argument("not a number");
    for (char c : s) {
        if (!isdigit(static_cast<unsigned char>(c))) throw invalid_argument("not a number");
    }
    int v = stoi(s);
    if (v == 0) throw out_of_range("not positive");
    return v;
}

int main() {
    string tok;
    while (cin >> tok) {
        try {
            cout << parsePositive(tok) << endl;
        } catch (const exception& e) {
            cout << "error: " << e.what() << endl;
        }
    }
    return 0;
}`,
      solutionNotes: "Both exception types derive from std::exception, so one `catch (const exception&)` handles them and `what()` gives the message. Catching per token lets the loop continue after a bad one.",
    },
    {
      title: "A custom exception for stock",
      prompt: `Define \`class OutOfStock : public runtime_error\` that also stores the item name. An inventory processes \`add ITEM QTY\` and \`take ITEM QTY\`; taking more than is available throws \`OutOfStock\`. A quantity ≤ 0 throws \`invalid_argument\`. Print \`ok\` for success; for \`OutOfStock\` print \`out of stock: ITEM\`; for any other exception print \`error: MESSAGE\`. Catch the specific type **first**.`,
      starterCode: `#include <iostream>
#include <map>
#include <stdexcept>
#include <string>
using namespace std;

// Write class OutOfStock here

int main() {
    map<string, int> stock;
    string cmd, item;
    int qty;
    while (cin >> cmd >> item >> qty) {
        // try { ... } catch (const OutOfStock& e) { ... } catch (const exception& e) { ... }
    }
    return 0;
}`,
      tests: [
        T("sample", "add pen 5\ntake pen 3\ntake pen 3\ntake ink 1\n", "ok\nok\nout of stock: pen\nout of stock: ink", "sample"),
        T("bad quantity", "add cup 0\ntake cup -2\n", "error: quantity must be positive\nerror: quantity must be positive", "visible", "edge"),
        T("exact amount", "add box 2\ntake box 2\ntake box 1\n", "ok\nok\nout of stock: box", "hidden", "boundary"),
        T("refill", "add a 1\ntake a 2\nadd a 1\ntake a 2\n", "ok\nout of stock: a\nok\nok", "hidden"),
      ],
      compare: "lines",
      hints: [
        "class OutOfStock : public runtime_error { string item_; public: OutOfStock(const string& item) : runtime_error(\"out of stock\"), item_(item) {} … };",
        "Give it an `item()` accessor.",
        "Validate qty first, then check the stock before changing it.",
        "Order the catch blocks from most specific to most general.",
      ],
      solution: `#include <iostream>
#include <map>
#include <stdexcept>
#include <string>
using namespace std;

class OutOfStock : public runtime_error {
    string item_;
public:
    explicit OutOfStock(const string& item) : runtime_error("out of stock"), item_(item) {}
    const string& item() const { return item_; }
};

int main() {
    map<string, int> stock;
    string cmd, item;
    int qty;
    while (cin >> cmd >> item >> qty) {
        try {
            if (qty <= 0) throw invalid_argument("quantity must be positive");
            if (cmd == "add") {
                stock[item] += qty;
            } else {
                auto it = stock.find(item);
                if (it == stock.end() || it->second < qty) throw OutOfStock(item);
                it->second -= qty;
            }
            cout << "ok" << endl;
        } catch (const OutOfStock& e) {
            cout << "out of stock: " << e.item() << endl;
        } catch (const exception& e) {
            cout << "error: " << e.what() << endl;
        }
    }
    return 0;
}`,
      solutionNotes: "A custom exception can carry extra data (the item). Because OutOfStock is also a std::exception, the general handler would catch it too — so the specific handler must come first.",
    },
  ),

  "debugging-testing": practice(
    {
      title: "Fix the average of positives",
      prompt: `This program should read \`n\` numbers and print the average of the **positive** ones with 2 decimals (or \`none\`). It compiles but gives wrong answers — there are **two** bugs. Test it with small inputs, find them and fix them.`,
      starterCode: `#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    int n;
    cin >> n;
    int sum = 0, count = 0;
    for (int i = 1; i < n; i++) {
        int x;
        cin >> x;
        if (x > 0) {
            sum += x;
            count++;
        }
    }
    if (count == 0) cout << "none" << endl;
    else cout << fixed << setprecision(2) << sum / count << endl;
    return 0;
}`,
      tests: [
        T("sample", "4\n1 -2 2 3\n", "2.00", "sample"),
        T("fraction", "2\n1 2\n", "1.50", "visible", "edge"),
        T("none positive", "3\n-1 0 -5\n", "none", "hidden", "edge"),
        T("first number matters", "1\n7\n", "7.00", "hidden", "boundary"),
      ],
      hints: [
        "Try n = 1 with the number 7. What does it print? Why?",
        "How many times does `for (int i = 1; i < n; i++)` run?",
        "Try 1 and 2: the average should be 1.50. What's the type of sum / count?",
        "Loop from 0 (or use <=), and divide as doubles: (double)sum / count.",
      ],
      solution: `#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    int n;
    cin >> n;
    int sum = 0, count = 0;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        if (x > 0) {
            sum += x;
            count++;
        }
    }
    if (count == 0) cout << "none" << endl;
    else cout << fixed << setprecision(2) << (double)sum / count << endl;
    return 0;
}`,
      solutionNotes: "Bug 1: the loop ran n − 1 times (off by one), skipping the last number. Bug 2: `sum / count` was integer division, losing the .5. Small hand-checked inputs expose both.",
    },
    {
      title: "Fix the median",
      prompt: `This program should print the **median** of n numbers (for even n, the average of the two middle values, with 1 decimal). It has **three** bugs. Fix them.`,
      starterCode: `#include <iostream>
#include <iomanip>
#include <vector>
#include <algorithm>
using namespace std;

double median(vector<int> v) {
    int n = v.size();
    if (n % 2 == 1) return v[n / 2];
    return (v[n / 2 - 1] + v[n / 2]) / 2;
}

int main() {
    int n;
    cin >> n;
    vector<int> v(n);
    for (int i = 0; i <= n; i++) cin >> v[i];
    cout << fixed << setprecision(1) << median(v) << endl;
    return 0;
}`,
      tests: [
        T("sample", "5\n9 1 7 3 5\n", "5.0", "sample"),
        T("even count", "4\n4 1 3 2\n", "2.5", "visible", "edge"),
        T("one", "1\n8\n", "8.0", "hidden", "boundary"),
        T("negatives", "2\n-3 -4\n", "-3.5", "hidden", "edge"),
      ],
      hints: [
        "Is the vector sorted before taking the middle?",
        "Look at the reading loop's condition: which index does `i <= n` reach?",
        "What does (int + int) / 2 do to 2 + 3?",
        "Sort a copy, read with i < n, and divide by 2.0.",
      ],
      solution: `#include <iostream>
#include <iomanip>
#include <vector>
#include <algorithm>
using namespace std;

double median(vector<int> v) {
    sort(v.begin(), v.end());
    int n = v.size();
    if (n % 2 == 1) return v[n / 2];
    return (v[n / 2 - 1] + v[n / 2]) / 2.0;
}

int main() {
    int n;
    cin >> n;
    vector<int> v(n);
    for (int i = 0; i < n; i++) cin >> v[i];
    cout << fixed << setprecision(1) << median(v) << endl;
    return 0;
}`,
      solutionNotes: "Three classic bugs: forgetting to sort, an out-of-bounds write (`i <= n` writes v[n] — undefined behaviour), and integer division. v is passed by value, so sorting inside doesn't change main's vector.",
    },
  ),

  "raii-ownership": practice(
    {
      title: "Who owns the resource?",
      prompt: `\`Resource(id)\` prints \`acquire ID\` when created and \`release ID\` when destroyed. Hold the current resource in a \`unique_ptr<Resource>\` and process commands: \`open ID\` (replace the current one, if any), \`close\` (release it now), \`show\` (print the current ID or \`none\`). When the input ends, whatever is still held must be released automatically.`,
      starterCode: `#include <iostream>
#include <memory>
#include <string>
using namespace std;

struct Resource {
    int id;
    explicit Resource(int i) : id(i) { cout << "acquire " << id << endl; }
    ~Resource() { cout << "release " << id << endl; }
};

int main() {
    unique_ptr<Resource> current;
    string cmd;
    while (cin >> cmd) {
        // open ID / close / show
    }
    return 0;
}`,
      tests: [
        T("sample", "open 1\nshow\nopen 2\nclose\nshow\nopen 3\n", "acquire 1\n1\nacquire 2\nrelease 1\nrelease 2\nnone\nacquire 3\nrelease 3", "sample"),
        T("close twice", "open 5\nclose\nclose\n", "acquire 5\nrelease 5", "visible", "edge"),
        T("nothing", "show\n", "none", "hidden", "edge"),
        T("released at the end", "open 9\n", "acquire 9\nrelease 9", "hidden"),
      ],
      compare: "lines",
      hints: [
        "make_unique<Resource>(id) creates the new one.",
        "Assigning a new unique_ptr to `current` destroys the old object.",
        "current.reset() releases it now; resetting an empty pointer does nothing.",
        "No delete anywhere: when main ends, current's destructor releases what's left.",
      ],
      solution: `#include <iostream>
#include <memory>
#include <string>
using namespace std;

struct Resource {
    int id;
    explicit Resource(int i) : id(i) { cout << "acquire " << id << endl; }
    ~Resource() { cout << "release " << id << endl; }
};

int main() {
    unique_ptr<Resource> current;
    string cmd;
    while (cin >> cmd) {
        if (cmd == "open") {
            int id;
            cin >> id;
            current = make_unique<Resource>(id);
        } else if (cmd == "close") {
            current.reset();
        } else if (cmd == "show") {
            if (current) cout << current->id << endl;
            else cout << "none" << endl;
        }
    }
    return 0;
}`,
      solutionNotes: "Note the order in the sample: the new resource is acquired *before* the old one is released, because make_unique runs before the assignment. Ownership is always clear and nothing can leak.",
    },
    {
      title: "Shared ownership",
      prompt: `\`Doc(name)\` prints \`freed NAME\` when destroyed. Variables are named by letters. Commands: \`make X NAME\` (X owns a new Doc), \`copy X Y\` (Y shares X's Doc), \`reset X\` (X lets go), \`count X\` (print how many owners X's Doc has, or 0 if X is empty). A Doc must be freed exactly when its **last** owner lets go. Use \`shared_ptr\`.`,
      starterCode: `#include <iostream>
#include <map>
#include <memory>
#include <string>
using namespace std;

struct Doc {
    string name;
    explicit Doc(string n) : name(n) {}
    ~Doc() { cout << "freed " << name << endl; }
};

int main() {
    map<string, shared_ptr<Doc>> vars;
    string cmd;
    while (cin >> cmd) {
        // make / copy / reset / count
    }
    vars.clear();
    return 0;
}`,
      tests: [
        T("sample", "make a report\ncopy a b\ncount a\nreset a\ncount b\nreset b\n", "2\n1\nfreed report", "sample"),
        T("overwrite frees the old doc", "make a one\nmake a two\ncount a\n", "freed one\n1\nfreed two", "visible", "edge"),
        T("count empty", "count z\n", "0", "hidden", "edge"),
        T("freed at the end", "make p plan\ncopy p q\ncopy q r\ncount r\n", "3\nfreed plan", "hidden"),
      ],
      compare: "lines",
      hints: [
        "vars[x] = make_shared<Doc>(name); — assigning drops x's previous Doc.",
        "copy: vars[y] = vars[x]; — both now share one Doc.",
        "reset: vars[x].reset();",
        "count: use_count() of vars[x], or 0 when it's empty (use find so count doesn't create entries — or check for null).",
      ],
      solution: `#include <iostream>
#include <map>
#include <memory>
#include <string>
using namespace std;

struct Doc {
    string name;
    explicit Doc(string n) : name(n) {}
    ~Doc() { cout << "freed " << name << endl; }
};

int main() {
    map<string, shared_ptr<Doc>> vars;
    string cmd;
    while (cin >> cmd) {
        if (cmd == "make") {
            string x, name;
            cin >> x >> name;
            vars[x] = make_shared<Doc>(name);
        } else if (cmd == "copy") {
            string x, y;
            cin >> x >> y;
            vars[y] = vars[x];
        } else if (cmd == "reset") {
            string x;
            cin >> x;
            vars[x].reset();
        } else if (cmd == "count") {
            string x;
            cin >> x;
            auto it = vars.find(x);
            cout << (it == vars.end() || !it->second ? 0 : it->second.use_count()) << endl;
        }
    }
    vars.clear();
    return 0;
}`,
      solutionNotes: "shared_ptr keeps a count of owners and destroys the object when it drops to zero — when the last owner resets, is overwritten or is destroyed.",
    },
  ),

  "move-semantics": practice(
    {
      title: "Deep copy",
      prompt: `\`IntBox\` owns a heap array. The starter's copy constructor copies the **pointer**, so two boxes share one array (and it gets freed twice). Write a proper **deep-copy** constructor and copy assignment so copies are independent. The program then reads values, copies the box, changes the copy and prints both.`,
      starterCode: `#include <iostream>
using namespace std;

class IntBox {
    int* data;
    int n;
public:
    explicit IntBox(int size) : data(new int[size]()), n(size) {}
    ~IntBox() { delete[] data; }
    IntBox(const IntBox& other) : data(other.data), n(other.n) {}   // BUG: shallow copy
    IntBox& operator=(const IntBox& other) {                         // BUG: shallow copy
        data = other.data;
        n = other.n;
        return *this;
    }
    int size() const { return n; }
    int& at(int i) { return data[i]; }
    int at(int i) const { return data[i]; }
};

void print(const IntBox& b) {
    for (int i = 0; i < b.size(); i++) cout << b.at(i) << " ";
    cout << endl;
}

int main() {
    int n;
    cin >> n;
    IntBox a(n);
    for (int i = 0; i < n; i++) cin >> a.at(i);
    IntBox b = a;          // copy constructor
    IntBox c(1);
    c = a;                 // copy assignment
    if (n > 0) { b.at(0) = -1; c.at(n - 1) = -2; }
    print(a);
    print(b);
    print(c);
    return 0;
}`,
      tests: [
        T("sample", "3\n1 2 3\n", "1 2 3\n-1 2 3\n1 2 -2", "sample"),
        T("one value", "1\n5\n", "5\n-1\n-2", "visible", "boundary"),
        T("empty", "0\n", "\n\n", "hidden", "edge"),
        T("longer", "5\n9 8 7 6 5\n", "9 8 7 6 5\n-1 8 7 6 5\n9 8 7 6 -2", "hidden"),
      ],
      compare: "lines",
      hints: [
        "A deep copy allocates its own array and copies the values.",
        "Copy constructor: data(new int[other.n]), n(other.n), then copy element by element.",
        "Copy assignment: guard against self-assignment, allocate the new array, copy, then delete[] the old one.",
        "Return *this from operator=.",
      ],
      solution: `#include <iostream>
using namespace std;

class IntBox {
    int* data;
    int n;
public:
    explicit IntBox(int size) : data(new int[size]()), n(size) {}
    ~IntBox() { delete[] data; }
    IntBox(const IntBox& other) : data(new int[other.n]), n(other.n) {
        for (int i = 0; i < n; i++) data[i] = other.data[i];
    }
    IntBox& operator=(const IntBox& other) {
        if (this == &other) return *this;
        int* fresh = new int[other.n];
        for (int i = 0; i < other.n; i++) fresh[i] = other.data[i];
        delete[] data;
        data = fresh;
        n = other.n;
        return *this;
    }
    int size() const { return n; }
    int& at(int i) { return data[i]; }
    int at(int i) const { return data[i]; }
};

void print(const IntBox& b) {
    for (int i = 0; i < b.size(); i++) cout << b.at(i) << " ";
    cout << endl;
}

int main() {
    int n;
    cin >> n;
    IntBox a(n);
    for (int i = 0; i < n; i++) cin >> a.at(i);
    IntBox b = a;
    IntBox c(1);
    c = a;
    if (n > 0) { b.at(0) = -1; c.at(n - 1) = -2; }
    print(a);
    print(b);
    print(c);
    return 0;
}`,
      solutionNotes: "With a shallow copy, changing b changed a too, and the shared array was deleted twice. The assignment allocates before deleting, so a failure can't leave the object pointing at freed memory, and it frees the array it used to own (no leak).",
    },
    {
      title: "Move instead of copy",
      prompt: `\`Text\` owns a \`char*\` buffer. Add a **move constructor** and **move assignment** that steal the buffer and leave the source empty (size 0, null buffer). The program counts how many times the buffer was allocated — moves must not allocate.

It reads a word, builds \`Text a(word)\`, then does \`Text b = std::move(a); Text c("x"); c = std::move(b);\` and prints the sizes of a, b and c, c's text, and the allocation count.`,
      starterCode: `#include <iostream>
#include <cstring>
#include <string>
#include <utility>
using namespace std;

int allocations = 0;

class Text {
    char* buf = nullptr;
    size_t len = 0;
public:
    explicit Text(const char* s) : len(strlen(s)) {
        buf = new char[len + 1];
        allocations++;
        memcpy(buf, s, len + 1);
    }
    ~Text() { delete[] buf; }
    Text(const Text& o) : len(o.len) {
        buf = new char[len + 1];
        allocations++;
        memcpy(buf, o.buf, len + 1);
    }
    Text& operator=(const Text& o) {
        if (this != &o) {
            char* fresh = new char[o.len + 1];
            allocations++;
            memcpy(fresh, o.buf, o.len + 1);
            delete[] buf;
            buf = fresh;
            len = o.len;
        }
        return *this;
    }
    // Add a move constructor and a move assignment operator here

    size_t size() const { return len; }
    string str() const { return buf ? string(buf) : string(); }
};

int main() {
    string word;
    cin >> word;
    Text a(word.c_str());
    Text b = std::move(a);
    Text c("x");
    c = std::move(b);
    cout << a.size() << " " << b.size() << " " << c.size() << endl;
    cout << c.str() << endl;
    cout << "allocations: " << allocations << endl;
    return 0;
}`,
      tests: [
        T("sample", "hello\n", "0 0 5\nhello\nallocations: 2", "sample"),
        T("one letter", "q\n", "0 0 1\nq\nallocations: 2", "visible", "boundary"),
        T("long word", "supercalifragilistic\n", "0 0 20\nsupercalifragilistic\nallocations: 2", "hidden"),
      ],
      compare: "lines",
      hints: [
        "A move constructor takes `Text&& o` and is usually `noexcept`.",
        "Steal: buf = o.buf; len = o.len; then leave o empty: o.buf = nullptr; o.len = 0;",
        "Move assignment: if (this != &o) { delete[] buf; steal; empty o; } return *this;",
        "Only the two `Text(const char*)` constructions should allocate.",
      ],
      solution: `#include <iostream>
#include <cstring>
#include <string>
#include <utility>
using namespace std;

int allocations = 0;

class Text {
    char* buf = nullptr;
    size_t len = 0;
public:
    explicit Text(const char* s) : len(strlen(s)) {
        buf = new char[len + 1];
        allocations++;
        memcpy(buf, s, len + 1);
    }
    ~Text() { delete[] buf; }
    Text(const Text& o) : len(o.len) {
        buf = new char[len + 1];
        allocations++;
        memcpy(buf, o.buf, len + 1);
    }
    Text& operator=(const Text& o) {
        if (this != &o) {
            char* fresh = new char[o.len + 1];
            allocations++;
            memcpy(fresh, o.buf, o.len + 1);
            delete[] buf;
            buf = fresh;
            len = o.len;
        }
        return *this;
    }
    Text(Text&& o) noexcept : buf(o.buf), len(o.len) {
        o.buf = nullptr;
        o.len = 0;
    }
    Text& operator=(Text&& o) noexcept {
        if (this != &o) {
            delete[] buf;
            buf = o.buf;
            len = o.len;
            o.buf = nullptr;
            o.len = 0;
        }
        return *this;
    }
    size_t size() const { return len; }
    string str() const { return buf ? string(buf) : string(); }
};

int main() {
    string word;
    cin >> word;
    Text a(word.c_str());
    Text b = std::move(a);
    Text c("x");
    c = std::move(b);
    cout << a.size() << " " << b.size() << " " << c.size() << endl;
    cout << c.str() << endl;
    cout << "allocations: " << allocations << endl;
    return 0;
}`,
      solutionNotes: "Without move operations, std::move falls back to the copy operations, which allocate (4 allocations in total). Moving just transfers the pointer, and the empty source can still be destroyed safely because delete[] nullptr does nothing.",
    },
  ),

  "undefined-behaviour": practice(
    {
      title: "Checked indexing",
      prompt: `Read \`n\` numbers, then \`q\` queries, each an index that may be **negative or too large**. Print the element, or \`out of range\`. Never read outside the vector — reading v[i] out of range is undefined behaviour, even if it seems to work.`,
      starterCode: starter("Answer each index query safely", "int n;\ncin >> n;\nvector<int> v(n);\nfor (auto& x : v) cin >> x;\nint q;\ncin >> q;", ["iostream", "vector"]),
      tests: [
        T("sample", "3\n10 20 30\n4\n0\n2\n3\n-1\n", "10\n30\nout of range\nout of range", "sample"),
        T("empty vector", "0\n1\n0\n", "out of range", "visible", "edge"),
        T("huge index", "2\n5 6\n1\n9223372036854775807\n", "out of range", "hidden", "edge"),
        T("very negative", "2\n5 6\n1\n-9223372036854775807\n", "out of range", "hidden", "edge"),
      ],
      compare: "lines",
      hints: [
        "Read each index into a long long — it might not fit in an int.",
        "Valid indexes satisfy 0 <= i < n.",
        "Compare before indexing; don't convert first.",
        "if (i >= 0 && i < (long long)v.size()) cout << v[i]; else cout << \"out of range\";",
      ],
      solution: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> v(n);
    for (auto& x : v) cin >> x;
    int q;
    cin >> q;
    for (int k = 0; k < q; k++) {
        long long i;
        cin >> i;
        if (i >= 0 && i < (long long)v.size()) cout << v[i] << endl;
        else cout << "out of range" << endl;
    }
    return 0;
}`,
      solutionNotes: "Validate before you index. Reading the index as long long and comparing with a signed size avoids both overflow and the signed/unsigned trap where a negative number turns into a huge size_t.",
    },
    {
      title: "Overflow-safe multiplication",
      prompt: `Write \`bool safeMul(long long a, long long b, long long& out)\`: if a × b fits in a \`long long\`, store it and return true; otherwise return false — **without** ever performing an overflowing multiplication (signed overflow is undefined behaviour). Read pairs until the input ends and print the product or \`overflow\`.`,
      starterCode: starter("For each pair, print the product or overflow — without overflowing", "long long a, b;", ["iostream", "climits"], "// Write bool safeMul(long long a, long long b, long long& out) here"),
      tests: [
        T("sample", "3 4\n1000000000000 1000000000000\n", "12\noverflow", "sample"),
        T("zero", "0 9223372036854775807\n", "0", "visible", "edge"),
        T("negatives", "-3000000000 3000000000\n-4 -5\n", "-9000000000000000000\n20", "hidden", "edge"),
        T("limits", "-1 -9223372036854775807\n9223372036854775807 1\n2 4611686018427387904\n", "9223372036854775807\n9223372036854775807\noverflow", "hidden", "edge"),
        T("just fits", "3037000499 3037000499\n3037000500 3037000500\n", "9223372030926249001\noverflow", "hidden", "boundary"),
      ],
      compare: "lines",
      hints: [
        "If either number is 0, the product is 0.",
        "Otherwise a × b overflows exactly when |a| > LLONG_MAX / |b| (ignoring the one extra negative value).",
        "GCC has a built-in that does this check: __builtin_mul_overflow(a, b, &out) returns true on overflow.",
        "Either approach is fine — but never compute a * b first and check afterwards.",
      ],
      solution: `#include <iostream>
#include <climits>
using namespace std;

bool safeMul(long long a, long long b, long long& out) {
    return !__builtin_mul_overflow(a, b, &out);
}

int main() {
    long long a, b;
    while (cin >> a >> b) {
        long long p;
        if (safeMul(a, b, p)) cout << p << endl;
        else cout << "overflow" << endl;
    }
    return 0;
}`,
      solutionNotes: "Checking `a * b` after computing it is too late: the overflow has already happened, and the compiler may assume it can't. `__builtin_mul_overflow` (GCC/Clang) checks correctly; a portable version compares |a| with LLONG_MAX / |b| and handles LLONG_MIN separately.",
    },
  ),

  "project-grade-manager": practice(
    {
      title: "Class statistics",
      prompt: `Read \`n\` (≥ 1) students as \`name mark\`. Print the highest mark with the name (the first one if tied), the lowest mark with the name, the class average with 2 decimals, and how many students scored **above** the average.

| Output line | Example |
| --- | --- |
| 1 | \`top: Asha 92\` |
| 2 | \`bottom: Ravi 41\` |
| 3 | \`average: 70.33\` |
| 4 | \`above average: 2\` |`,
      starterCode: starter("Store the students, then compute the four results", "int n;\ncin >> n;", ["iostream", "iomanip", "string", "vector"]),
      tests: [
        T("sample", "3\nAsha 92\nRavi 41\nMeera 78\n", "top: Asha 92\nbottom: Ravi 41\naverage: 70.33\nabove average: 2", "sample"),
        T("one student", "1\nSolo 50\n", "top: Solo 50\nbottom: Solo 50\naverage: 50.00\nabove average: 0", "visible", "boundary"),
        T("ties", "4\nA 80\nB 80\nC 60\nD 60\n", "top: A 80\nbottom: C 60\naverage: 70.00\nabove average: 2", "hidden", "edge"),
        T("all equal", "3\nX 7\nY 7\nZ 7\n", "top: X 7\nbottom: X 7\naverage: 7.00\nabove average: 0", "hidden", "edge"),
      ],
      compare: "lines",
      hints: [
        "A struct Student { string name; int mark; }; and a vector of them keep the data together.",
        "One pass for top, bottom and the total; use > and < so the first tied student wins.",
        "A second pass counts marks above the average (compare as doubles).",
        "Print with fixed << setprecision(2) only for the average.",
      ],
      solution: `#include <iostream>
#include <iomanip>
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
    vector<Student> s(n);
    for (auto& st : s) cin >> st.name >> st.mark;
    int top = 0, bottom = 0;
    long long total = 0;
    for (int i = 0; i < n; i++) {
        if (s[i].mark > s[top].mark) top = i;
        if (s[i].mark < s[bottom].mark) bottom = i;
        total += s[i].mark;
    }
    double avg = (double)total / n;
    int above = 0;
    for (const auto& st : s) if (st.mark > avg) above++;
    cout << "top: " << s[top].name << " " << s[top].mark << endl;
    cout << "bottom: " << s[bottom].name << " " << s[bottom].mark << endl;
    cout << "average: " << fixed << setprecision(2) << avg << endl;
    cout << "above average: " << above << endl;
    return 0;
}`,
      solutionNotes: "Storing students as structs keeps names and marks together. Tracking indexes (not just values) gives the name with the extreme mark; `>`/`<` keep the first one on ties.",
    },
    {
      title: "Report card with ranks",
      prompt: `Read \`n\` students as \`name mark\`. Print them sorted by mark (highest first), ties by name alphabetically, each as \`RANK name mark\`. Ranks use **competition ranking**: equal marks share a rank and the next rank skips (1, 2, 2, 4).`,
      starterCode: starter("Sort, then assign competition ranks", "int n;\ncin >> n;", ["iostream", "string", "vector", "algorithm"]),
      tests: [
        T("sample", "4\nRavi 80\nAsha 95\nMeera 80\nZoe 70\n", "1 Asha 95\n2 Meera 80\n2 Ravi 80\n4 Zoe 70", "sample"),
        T("no ties", "3\nA 3\nB 2\nC 1\n", "1 A 3\n2 B 2\n3 C 1", "visible"),
        T("all tied", "3\nc 5\na 5\nb 5\n", "1 a 5\n1 b 5\n1 c 5", "hidden", "edge"),
        T("one", "1\nSolo 0\n", "1 Solo 0", "hidden", "boundary"),
        T("ties at the end", "4\nA 9\nB 8\nC 7\nD 7\n", "1 A 9\n2 B 8\n3 C 7\n3 D 7", "hidden", "edge"),
      ],
      compare: "lines",
      hints: [
        "Sort with a comparator: higher mark first; if equal, smaller name first.",
        "Walk the sorted list with position i (from 1).",
        "If this mark equals the previous one, keep the previous rank; otherwise the rank is i.",
        "That gives 1, 2, 2, 4 automatically.",
      ],
      solution: `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
using namespace std;

struct Student {
    string name;
    int mark;
};

int main() {
    int n;
    cin >> n;
    vector<Student> s(n);
    for (auto& st : s) cin >> st.name >> st.mark;
    sort(s.begin(), s.end(), [](const Student& a, const Student& b) {
        if (a.mark != b.mark) return a.mark > b.mark;
        return a.name < b.name;
    });
    int rank = 0;
    for (int i = 0; i < n; i++) {
        if (i == 0 || s[i].mark != s[i - 1].mark) rank = i + 1;
        cout << rank << " " << s[i].name << " " << s[i].mark << endl;
    }
    return 0;
}`,
      solutionNotes: "After sorting, equal marks are adjacent. A new rank starts only when the mark changes, and it's the 1-based position — which produces the skip after a tie.",
    },
  ),

  "project-bank-system": practice(
    {
      title: "Transfers ledger",
      prompt: `Accounts are numbered 1 to \`n\` and start at 0. Process \`q\` transactions: \`dep ACC X\`, \`wd ACC X\` and \`tr FROM TO X\`. Reject (print \`error K\`, where K is the transaction's number starting at 1) any transaction with an unknown account, X ≤ 0, or not enough money; rejected ones change nothing. At the end print every balance on one line.`,
      starterCode: starter("Validate each transaction; print error K for rejected ones; print balances at the end", "int n, q;\ncin >> n >> q;\nvector<long long> bal(n + 1, 0);", ["iostream", "string", "vector"]),
      tests: [
        T("sample", "3 5\ndep 1 100\ntr 1 2 30\nwd 2 50\ntr 2 3 30\nwd 1 70\n", "error 3\n0 0 30", "sample"),
        T("unknown account", "2 2\ndep 3 10\ntr 1 0 5\n", "error 1\nerror 2\n0 0", "visible", "edge"),
        T("non-positive amount", "1 2\ndep 1 0\ndep 1 -5\n", "error 1\nerror 2\n0", "hidden", "edge"),
        T("transfer to self", "1 2\ndep 1 10\ntr 1 1 10\n", "10", "hidden", "edge"),
      ],
      compare: "lines",
      hints: [
        "Write a helper valid(acc) that checks 1 <= acc <= n.",
        "Check everything first; only change balances if the whole transaction is OK.",
        "A transfer needs both accounts valid and enough money in FROM.",
        "Number transactions from 1 for the error messages.",
      ],
      solution: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    int n, q;
    cin >> n >> q;
    vector<long long> bal(n + 1, 0);
    auto valid = [&](int acc) { return acc >= 1 && acc <= n; };
    for (int k = 1; k <= q; k++) {
        string type;
        cin >> type;
        bool ok = false;
        if (type == "dep") {
            int a; long long x;
            cin >> a >> x;
            if (valid(a) && x > 0) { bal[a] += x; ok = true; }
        } else if (type == "wd") {
            int a; long long x;
            cin >> a >> x;
            if (valid(a) && x > 0 && bal[a] >= x) { bal[a] -= x; ok = true; }
        } else if (type == "tr") {
            int a, b; long long x;
            cin >> a >> b >> x;
            if (valid(a) && valid(b) && x > 0 && bal[a] >= x) { bal[a] -= x; bal[b] += x; ok = true; }
        }
        if (!ok) cout << "error " << k << endl;
    }
    for (int i = 1; i <= n; i++) cout << bal[i] << (i < n ? " " : "\\n");
    return 0;
}`,
      solutionNotes: "Validate the whole transaction before changing anything, so a rejected transfer can never take money from one account without adding it to the other.",
    },
    {
      title: "Undo the last transaction",
      prompt: `One account starts at 0. Commands: \`dep X\`, \`wd X\` (print \`denied\` if not enough money; a denied withdrawal isn't recorded), \`undo\` (reverse the most recent **successful** deposit or withdrawal still on the history; print \`nothing to undo\` if there's none) and \`bal\` (print the balance). Use a stack for the history.`,
      starterCode: starter("Keep a stack of successful transactions; undo pops and reverses one", "long long balance = 0;\nstring cmd;", ["iostream", "string", "stack"]),
      tests: [
        T("sample", "dep 100\nwd 30\nbal\nundo\nbal\nundo\nbal\n", "70\n100\n0", "sample"),
        T("denied is not undone", "dep 10\nwd 50\nundo\nbal\n", "denied\n0", "visible", "edge"),
        T("nothing to undo", "undo\nbal\n", "nothing to undo\n0", "hidden", "edge"),
        T("undo a withdrawal", "dep 50\nwd 20\nundo\nwd 60\nbal\n", "denied\n50", "hidden"),
      ],
      compare: "lines",
      hints: [
        "Push each successful transaction as a signed amount: +X or −X.",
        "Undo pops the top and subtracts it from the balance.",
        "Check for an empty stack first.",
        "A denied withdrawal is never pushed.",
      ],
      solution: `#include <iostream>
#include <string>
#include <stack>
using namespace std;

int main() {
    long long balance = 0;
    string cmd;
    stack<long long> history;
    while (cin >> cmd) {
        if (cmd == "dep") {
            long long x;
            cin >> x;
            balance += x;
            history.push(x);
        } else if (cmd == "wd") {
            long long x;
            cin >> x;
            if (x > balance) {
                cout << "denied" << endl;
            } else {
                balance -= x;
                history.push(-x);
            }
        } else if (cmd == "undo") {
            if (history.empty()) {
                cout << "nothing to undo" << endl;
            } else {
                balance -= history.top();
                history.pop();
            }
        } else if (cmd == "bal") {
            cout << balance << endl;
        }
    }
    return 0;
}`,
      solutionNotes: "Recording each change as a signed amount means undo is always \"subtract the last change\". Undo order is last-in-first-out — a stack.",
    },
  ),

  "capstone-library": practice(
    {
      title: "Search the catalogue",
      prompt: `Read \`n\` books as \`ID TITLE\` (the title is the rest of the line), then \`q\` search words. For each word, print the IDs of books whose title contains it (**case-insensitive**, as part of any word), in increasing ID order separated by spaces, or \`none\`.`,
      starterCode: starter("Store the books; for each query, collect matching IDs in order", "int n;\ncin >> n;", ["iostream", "string", "vector", "algorithm", "cctype"]),
      tests: [
        T("sample", "3\n12 The C++ Programming Language\n5 Clean Code\n8 Code Complete\n2\ncode\npython\n", "5 8\nnone", "sample"),
        T("part of a word", "2\n1 Programming Pearls\n2 Effective Modern C++\n1\ngram\n", "1", "visible", "edge"),
        T("case", "2\n3 Algorithms\n4 ALGORITHM DESIGN\n1\nAlGoRiThM\n", "3 4", "hidden", "edge"),
        T("all", "3\n9 a\n1 ab\n4 ba\n1\na\n", "1 4 9", "hidden"),
      ],
      compare: "lines",
      hints: [
        "After `cin >> id`, use getline to read the rest of the line as the title (and drop the leading space).",
        "Lowercase both the title and the query before comparing.",
        "title.find(query) != string::npos means it's contained.",
        "Sort the books by ID once, so the matches come out in order.",
      ],
      solution: `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
#include <cctype>
using namespace std;

string lower(string s) {
    for (char& c : s) c = tolower(static_cast<unsigned char>(c));
    return s;
}

int main() {
    int n;
    cin >> n;
    vector<pair<int, string>> books(n);
    for (auto& [id, title] : books) {
        cin >> id;
        getline(cin, title);
        if (!title.empty() && title[0] == ' ') title.erase(0, 1);
        title = lower(title);
    }
    sort(books.begin(), books.end());
    int q;
    cin >> q;
    for (int k = 0; k < q; k++) {
        string word;
        cin >> word;
        word = lower(word);
        bool any = false;
        for (const auto& [id, title] : books) {
            if (title.find(word) != string::npos) {
                cout << (any ? " " : "") << id;
                any = true;
            }
        }
        cout << (any ? "" : "none") << endl;
    }
    return 0;
}`,
      solutionNotes: "Normalising case once when storing makes every search a plain substring check. Sorting pairs sorts by ID first.",
    },
    {
      title: "Late fees",
      prompt: `Process \`borrow BOOK MEMBER DAY\` and \`return BOOK DAY\`. A book may be kept for 14 days; each day beyond that costs 5. On a return print \`MEMBER owes FEE\` (FEE may be 0). Errors: borrowing a book that's already out prints \`unavailable\`; returning a book that isn't out prints \`not borrowed\`. At the end print \`total FEES\`.`,
      starterCode: starter("Track who has each book and since when; compute fees on return", "string cmd;", ["iostream", "string", "map"]),
      tests: [
        T("sample", "borrow 1 asha 1\nborrow 2 ravi 3\nreturn 1 10\nreturn 2 20\n", "asha owes 0\nravi owes 15\ntotal 15", "sample"),
        T("errors", "return 7 5\nborrow 7 zoe 1\nborrow 7 max 2\n", "not borrowed\nunavailable\ntotal 0", "visible", "edge"),
        T("exactly 14 days", "borrow 4 ira 10\nreturn 4 24\n", "ira owes 0\ntotal 0", "hidden", "boundary"),
        T("borrow again after return", "borrow 1 a 1\nreturn 1 30\nborrow 1 b 30\nreturn 1 31\n", "a owes 75\nb owes 0\ntotal 75", "hidden"),
      ],
      compare: "lines",
      hints: [
        "map<string, pair<string, int>> loans: book → (member, day borrowed).",
        "borrow: if the book is already in the map, it's unavailable.",
        "return: days = returnDay − borrowDay; fee = max(0, days − 14) * 5; then erase the loan.",
        "Keep a running total for the last line.",
      ],
      solution: `#include <iostream>
#include <string>
#include <map>
#include <algorithm>
using namespace std;

int main() {
    map<string, pair<string, int>> loans;
    long long total = 0;
    string cmd;
    while (cin >> cmd) {
        if (cmd == "borrow") {
            string book, member;
            int day;
            cin >> book >> member >> day;
            if (loans.count(book)) cout << "unavailable" << endl;
            else loans[book] = {member, day};
        } else if (cmd == "return") {
            string book;
            int day;
            cin >> book >> day;
            auto it = loans.find(book);
            if (it == loans.end()) {
                cout << "not borrowed" << endl;
            } else {
                int fee = max(0, day - it->second.second - 14) * 5;
                cout << it->second.first << " owes " << fee << endl;
                total += fee;
                loans.erase(it);
            }
        }
    }
    cout << "total " << total << endl;
    return 0;
}`,
      solutionNotes: "The map's presence check answers \"is it out?\". Erasing on return makes the book available again. 14 days or fewer costs nothing, so the fee is max(0, days − 14) × 5.",
    },
  ),
};
