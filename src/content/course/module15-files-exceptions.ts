import type { CourseLesson } from "./types";

const r = String.raw;

/**
 * Module 15 — Files, exceptions and debugging. The sandbox deliberately has no file system, so
 * file streams are taught in the text and every runnable example uses the same stream interface
 * through cin and string streams (an `istream&` function works unchanged with an `ifstream`).
 */
export const FILES_EXCEPTIONS_LESSONS: CourseLesson[] = [
  {
    id: "streams-parsing",
    moduleId: "files-exceptions",
    title: "Streams: files, string streams and parsing",
    minutes: 30,
    concepts: ["stream", "ifstream", "ofstream", "stringstream", "getline", "delimiter", "stream errors", "istream&"],
    goals: [
      "How file streams (`ifstream`, `ofstream`) work — opening, checking, reading in a loop, writing",
      "Parsing text with `stringstream` and `getline` with a delimiter",
      "Writing functions that take `istream&` so they work with files, `cin` and strings alike",
    ],
    intro: `\`cin\` and \`cout\` are **streams**: sequences of characters you read from or write to. Files and strings are streams too, with exactly the same \`>>\`, \`<<\` and \`getline\`. Learn the stream interface once and you can read a keyboard, a file or a line of CSV the same way.`,
    sections: [
      {
        title: "File streams (in your own projects)",
        body: `\`\`\`cpp
#include <fstream>

ifstream in("marks.txt");          // open for reading
if (!in) {                         // always check it opened
    cerr << "cannot open marks.txt\n";
    return 1;
}
string line;
while (getline(in, line)) { ... }  // read line by line until the end

ofstream out("report.txt");                // create/overwrite
ofstream log("log.txt", ios::app);         // append
out << "total " << 245 << "\n";
\`\`\`

The file closes automatically when the stream object is destroyed (RAII). **Note:** CodeMentor's sandbox has no file system — for safety, programs here can only use the console — so the runnable examples below read from \`cin\` and string streams. Everything else is identical.`,
      },
      {
        title: "String streams and delimiters",
        body: `\`#include <sstream>\` gives \`istringstream\` (read from a string), \`ostringstream\` (build a string) and \`stringstream\` (both).

\`\`\`cpp
stringstream ss("asha,91,Delhi");
string name, mark, city;
getline(ss, name, ',');            // read up to the next comma
getline(ss, mark, ',');
getline(ss, city);
int m = stoi(mark);                // string → int
\`\`\`

This is the standard way to split CSV-style lines whose fields may contain spaces.`,
      },
      {
        title: "Stream state and istream&",
        body: `A failed read (e.g. letters where a number was expected) puts the stream into a **fail state**: \`>>\` stops working until you \`clear()\` it. \`while (in >> x)\` naturally stops at the end of the data *or* at bad input.

Write reading functions against the base class \`istream&\`:

\`\`\`cpp
int totalMarks(istream& in) { ... }
totalMarks(cin);            // keyboard
totalMarks(fileStream);     // an ifstream
totalMarks(stringStream);   // an istringstream — handy for testing
\`\`\``,
      },
    ],
    mistakes: [
      { title: "Not checking that a file opened", body: "A misspelt file name gives a stream in the fail state; every read silently does nothing. Check `if (!in)` right after opening." },
      { title: "getline after >>", body: "`cin >> t;` leaves the newline behind, so the next `getline` reads an empty line. Call `cin.ignore();` (or `getline` once) in between." },
      { title: "while (!in.eof())", body: "`eof()` only becomes true *after* a read fails, so this loop processes the last item twice. Loop on the read itself: `while (getline(in, line))`." },
    ],
    example: {
      title: "One interface, three sources",
      intro: "An `istream&` function reads from a string stream, a CSV line is split on commas, a report is built with `ostringstream`, and a bad read is detected.",
      code: r`#include <iostream>
#include <sstream>
#include <string>
using namespace std;

int totalMarks(istream& in) {
    int total = 0, mark;
    while (in >> mark) {
        total += mark;
    }
    return total;
}

int main() {
    istringstream data("70 85 90");
    cout << "total " << totalMarks(data) << endl;

    string line = "asha,91,Delhi";
    stringstream ss(line);
    string name, mark, city;
    getline(ss, name, ',');
    getline(ss, mark, ',');
    getline(ss, city);
    cout << name << " scored " << stoi(mark) << " in " << city << endl;

    ostringstream out;
    out << "report: " << name << '=' << mark;
    cout << out.str() << endl;

    istringstream bad("12 x 7");
    int a, b;
    bad >> a >> b;
    cout << "read " << a << ", then failed: " << (bad.fail() ? "yes" : "no") << endl;
    return 0;
}`,
      output: "total 245\nasha scored 91 in Delhi\nreport: asha=91\nread 12, then failed: yes\n",
      notes: [
        { line: 6, text: "Takes any input stream: cin, a file or a string." },
        { line: 8, text: "The loop stops when the stream runs out (or hits bad data)." },
        { line: 21, text: "Read up to the comma, so fields may contain spaces." },
        { line: 32, text: "\"x\" isn't a number: the stream enters the fail state." },
      ],
    },
    quickCheck: {
      prompt: "Input is `3` on one line and `Asha Rao` on the next. What does `name` hold?",
      code: r`int t;
string name;
cin >> t;
getline(cin, name);`,
      options: [
        { id: "a", text: "Asha Rao", feedback: "`>>` stopped before the newline, so `getline` sees that newline first." },
        { id: "b", text: "An empty string", feedback: "Right: `getline` reads the rest of the first line, which is empty. Add `cin.ignore();` before it." },
        { id: "c", text: "Asha", feedback: "`getline` doesn't stop at spaces — but here it never reaches the second line." },
      ],
      correct: "b",
      explanation: "After `cin >> t` the newline is still waiting. `cin.ignore()` skips it so `getline` reads the next line.",
    },
    exercise: {
      title: "CSV marks report",
      prompt: `Read \`t\`, then \`t\` lines of the form \`name,m1,m2,m3\` (a name may contain spaces). For each line print the name, a space, and the **average of the three marks with exactly one decimal place** (use \`fixed\` and \`setprecision(1)\` from \`<iomanip>\`).`,
      starterCode: r`#include <iomanip>
#include <iostream>
#include <sstream>
#include <string>
using namespace std;

int main() {
    int t;
    cin >> t;
    cin.ignore();
    for (int i = 0; i < t; i++) {
        string line;
        getline(cin, line);
        // Split line on commas with a stringstream, convert the marks, print "name average".
    }
    return 0;
}`,
      tests: [
        { label: "three students", input: "3\nasha,80,90,85\nravi,70,72,72\nmeena devi,60,70,70\n", output: "asha 85.0\nravi 71.3\nmeena devi 66.7", visibility: "sample", category: "normal" },
        { label: "small values", input: "1\nx,0,0,1\n", output: "x 0.3", visibility: "hidden", category: "edge" },
        { label: "full marks and rounding up", input: "2\nTop Scorer,100,100,100\nb,1,2,2\n", output: "Top Scorer 100.0\nb 1.7", visibility: "hidden", category: "boundary" },
      ],
      compare: "lines",
      hints: [
        "Why can't you read the name with `>>`?",
        "Names can contain spaces, so split on commas instead: `stringstream ss(line); getline(ss, name, ',');`.",
        "Read the three marks the same way, convert with `stoi`, add them up, and divide by `3.0` (not 3) to keep the fraction.",
        "Print with `cout << name << \" \" << fixed << setprecision(1) << avg << endl;`.",
      ],
      solution: r`#include <iomanip>
#include <iostream>
#include <sstream>
#include <string>
using namespace std;

int main() {
    int t;
    cin >> t;
    cin.ignore();
    for (int i = 0; i < t; i++) {
        string line;
        getline(cin, line);
        stringstream ss(line);
        string name, field;
        getline(ss, name, ',');
        int total = 0;
        for (int k = 0; k < 3; k++) {
            getline(ss, field, ',');
            total += stoi(field);
        }
        double avg = total / 3.0;
        cout << name << " " << fixed << setprecision(1) << avg << endl;
    }
    return 0;
}`,
      solutionNotes: "`getline` with a ',' delimiter keeps spaces inside fields. Dividing by `3.0` makes it floating-point division; `fixed` + `setprecision(1)` rounds to one decimal (214 / 3 = 71.33… → 71.3).",
    },
    explainAgain: `A stream is a conveyor belt of characters. \`cin\` brings them from the keyboard, an \`ifstream\` from a file, a \`stringstream\` from a string you already have — but you pick items off every belt the same way. \`getline(ss, field, ',')\` is "take everything until the next comma".`,
    summary: [
      "File, console and string streams share one interface: `>>`, `<<`, `getline`.",
      "Check that files opened, loop on the read itself, and mind the newline after `>>`.",
      "`stringstream` + `getline(…, ',')` parses delimited text; take `istream&` to make code reusable and testable.",
    ],
  },

  {
    id: "exceptions",
    moduleId: "files-exceptions",
    title: "Exceptions: throw, try and catch",
    minutes: 30,
    concepts: ["exception", "throw", "try", "catch", "std::exception", "invalid_argument", "runtime_error", "out_of_range", "stack unwinding"],
    goals: [
      "Signalling errors with `throw` and handling them with `try` / `catch`",
      "The standard exception types and catching by `const&`",
      "Stack unwinding: why destructors (RAII) keep resources safe when an exception flies",
    ],
    intro: `Some errors can't be handled where they're detected. A \`withdraw\` function knows the balance is too low, but only the caller knows whether to show a message, retry, or give up. **Exceptions** carry the error up to the code that can deal with it — without every function in between having to pass error codes along.`,
    sections: [
      {
        title: "throw, try, catch",
        body: `\`\`\`cpp
#include <stdexcept>

double safeDivide(double a, double b) {
    if (b == 0) throw invalid_argument("division by zero");
    return a / b;
}

try {
    cout << safeDivide(1, 0);
} catch (const invalid_argument& e) {
    cout << "error: " << e.what();
}
\`\`\`

\`throw\` stops the function immediately. Control jumps to the nearest matching \`catch\`; the rest of the \`try\` block is skipped. Catch by **const reference**.`,
      },
      {
        title: "Standard exception types",
        body: `All standard exceptions derive from \`std::exception\`, which has \`what()\`:

| type | typical use |
|---|---|
| \`invalid_argument\` | a parameter makes no sense |
| \`out_of_range\` | an index or value outside its range (\`v.at(i)\` throws it) |
| \`runtime_error\` | something went wrong while running |
| \`bad_alloc\` | \`new\` couldn't get memory |

Catch the most specific types first, and \`const exception&\` last as a catch-all.`,
      },
      {
        title: "Stack unwinding and when not to throw",
        body: `When an exception leaves a function, every local object in it is **destroyed** on the way out — destructors run. That's why RAII types (\`vector\`, \`unique_ptr\`, file streams) never leak even when errors happen.

Exceptions are for **exceptional** situations, not normal control flow. Expected outcomes — "not found", "invalid user input" in a loop — are often better as return values (\`optional\`, \`bool\`).`,
      },
    ],
    mistakes: [
      { title: "Catching by value", body: "`catch (exception e)` copies and *slices* the exception, losing the derived type. Use `catch (const exception& e)`." },
      { title: "Catch-all first", body: "If `catch (const exception&)` comes before `catch (const out_of_range&)`, the specific handler is never reached." },
      { title: "Throwing from a destructor", body: "Destructors run during unwinding; throwing from one then calls `std::terminate`. Don't throw from destructors." },
    ],
    example: {
      title: "Throwing, catching and unwinding",
      intro: "A bad argument, an out-of-range index and a thrown error that passes through a function with a local object.",
      code: r`#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>
using namespace std;

double safeDivide(double a, double b) {
    if (b == 0) {
        throw invalid_argument("division by zero");
    }
    return a / b;
}

struct Logger {
    string name;
    Logger(string n) : name(n) { cout << "open " << name << endl; }
    ~Logger() { cout << "close " << name << endl; }
};

void risky() {
    Logger log("risky");
    throw runtime_error("something failed");
}

int main() {
    try {
        cout << safeDivide(10, 4) << endl;
        cout << safeDivide(1, 0) << endl;
    } catch (const invalid_argument& e) {
        cout << "invalid argument: " << e.what() << endl;
    }
    vector<int> v = {1, 2, 3};
    try {
        cout << v.at(5) << endl;
    } catch (const out_of_range&) {
        cout << "index 5 is out of range" << endl;
    }
    try {
        risky();
    } catch (const exception& e) {
        cout << "caught: " << e.what() << endl;
    }
    cout << "program continues" << endl;
    return 0;
}`,
      output: "2.5\ninvalid argument: division by zero\nindex 5 is out of range\nopen risky\nclose risky\ncaught: something failed\nprogram continues\n",
      notes: [
        { line: 9, text: "`throw` leaves the function at once; nothing after it runs." },
        { line: 22, text: "Unwinding: `log`'s destructor runs before the `catch` in `main`." },
        { line: 28, text: "This line throws, so the rest of the `try` block is skipped." },
        { line: 34, text: "`at()` checks the index and throws `out_of_range` (`[]` wouldn't)." },
      ],
    },
    quickCheck: {
      prompt: "What is printed?",
      code: r`try {
    cout << "A";
    throw runtime_error("x");
    cout << "B";
} catch (const exception& e) {
    cout << "C";
}
cout << "D";`,
      options: [
        { id: "a", text: "ABCD", feedback: "After `throw`, the rest of the `try` block is skipped." },
        { id: "b", text: "ACD", feedback: "Right: A, then the throw jumps to the catch (C), then execution continues (D)." },
        { id: "c", text: "AC", feedback: "Once the exception is caught, the program continues after the try/catch." },
      ],
      correct: "b",
      explanation: "`throw` skips to the matching `catch`; after it, normal execution resumes.",
    },
    exercise: {
      title: "An account that refuses bad requests",
      prompt: `Complete \`deposit\` and \`withdraw\` in \`Account\`:

- an amount **≤ 0** throws \`invalid_argument("amount must be positive")\` (check this first),
- a withdrawal **larger than the balance** throws \`runtime_error("insufficient funds")\`.

\`main\` (given) runs \`t\` commands (\`deposit X\` / \`withdraw X\`), prints \`error: <message>\` for each one that throws, and finally \`balance B\`.`,
      starterCode: r`#include <iostream>
#include <stdexcept>
#include <string>
using namespace std;

class Account {
    long long balance = 0;
public:
    void deposit(long long amount) {
        balance += amount;
    }
    void withdraw(long long amount) {
        balance -= amount;
    }
    long long getBalance() const { return balance; }
};

int main() {
    int t;
    cin >> t;
    Account acc;
    for (int i = 0; i < t; i++) {
        string cmd;
        long long amount;
        cin >> cmd >> amount;
        try {
            if (cmd == "deposit") {
                acc.deposit(amount);
            } else {
                acc.withdraw(amount);
            }
        } catch (const exception& e) {
            cout << "error: " << e.what() << endl;
        }
    }
    cout << "balance " << acc.getBalance() << endl;
    return 0;
}`,
      tests: [
        { label: "mixed commands", input: "4\ndeposit 100\nwithdraw 30\nwithdraw 100\ndeposit -5\n", output: "error: insufficient funds\nerror: amount must be positive\nbalance 70", visibility: "sample", category: "normal" },
        { label: "empty account", input: "2\nwithdraw 1\ndeposit 0\n", output: "error: insufficient funds\nerror: amount must be positive\nbalance 0", visibility: "hidden", category: "edge" },
        { label: "exact balance, then zero", input: "3\ndeposit 50\nwithdraw 50\nwithdraw 0\n", output: "error: amount must be positive\nbalance 0", visibility: "hidden", category: "boundary" },
        { label: "large deposit", input: "1\ndeposit 1000000\n", output: "balance 1000000", visibility: "hidden", category: "normal" },
      ],
      compare: "lines",
      hints: [
        "Where should the rules live — in `main`, or inside the class?",
        "Inside `Account`: it refuses invalid changes by throwing; `main` decides how to report them.",
        "In both functions start with `if (amount <= 0) throw invalid_argument(\"amount must be positive\");`.",
        "In `withdraw`, after that: `if (amount > balance) throw runtime_error(\"insufficient funds\");` — then subtract. Withdrawing exactly the balance is allowed.",
      ],
      solution: r`#include <iostream>
#include <stdexcept>
#include <string>
using namespace std;

class Account {
    long long balance = 0;
public:
    void deposit(long long amount) {
        if (amount <= 0) {
            throw invalid_argument("amount must be positive");
        }
        balance += amount;
    }
    void withdraw(long long amount) {
        if (amount <= 0) {
            throw invalid_argument("amount must be positive");
        }
        if (amount > balance) {
            throw runtime_error("insufficient funds");
        }
        balance -= amount;
    }
    long long getBalance() const { return balance; }
};

int main() {
    int t;
    cin >> t;
    Account acc;
    for (int i = 0; i < t; i++) {
        string cmd;
        long long amount;
        cin >> cmd >> amount;
        try {
            if (cmd == "deposit") {
                acc.deposit(amount);
            } else {
                acc.withdraw(amount);
            }
        } catch (const exception& e) {
            cout << "error: " << e.what() << endl;
        }
    }
    cout << "balance " << acc.getBalance() << endl;
    return 0;
}`,
      solutionNotes: "The class guards its own invariant (balance never negative) and throws *before* changing anything, so a failed command leaves the account untouched. `main` catches `const exception&`, which covers both exception types.",
    },
    explainAgain: `Throwing an exception is pulling a fire alarm. You don't need to know who will respond — you just raise the alarm and stop what you're doing. Everyone leaving the building on the way out (stack unwinding) switches off their own equipment (destructors). Whoever is trained to respond (the matching \`catch\`) takes over.`,
    summary: [
      "`throw` signals an error; the nearest matching `catch` handles it and execution continues after it.",
      "Use the standard types (`invalid_argument`, `out_of_range`, `runtime_error`) and catch by `const&`.",
      "Destructors run during unwinding, so RAII keeps resources safe; use exceptions for exceptional cases.",
    ],
  },

  {
    id: "debugging-testing",
    moduleId: "files-exceptions",
    title: "Debugging and testing your code",
    minutes: 25,
    concepts: ["compiler errors", "warnings", "assert", "debug output", "unit test", "edge cases", "minimal reproduction"],
    goals: [
      "Reading compiler errors and warnings efficiently",
      "Finding logic bugs systematically: predict, trace, narrow down",
      "Writing small automated checks (and `assert`) so bugs stay fixed",
    ],
    intro: `Every programmer writes bugs; good programmers find them quickly. Debugging is a skill with a method: understand what the program *should* do, find the first place where reality differs, and fix the cause rather than the symptom. Tests then make sure the bug never quietly returns.`,
    sections: [
      {
        title: "Compiler errors and warnings",
        body: `- Fix the **first** error first — later ones are often caused by it.
- The reported line is where the compiler *noticed* the problem; a missing \`;\` or \`}\` is often on the line **before**.
- Compile with warnings on (\`g++ -Wall -Wextra\`). Warnings like "unused variable", "comparison of signed and unsigned" or "control reaches end of non-void function" frequently point straight at real bugs.`,
      },
      {
        title: "Finding logic bugs",
        body: `1. **Reproduce** with the smallest input that fails.
2. **Predict** what each step should produce (a dry run on paper).
3. **Observe**: print intermediate values (to \`cerr\`, so they don't mix with real output) or step through in a debugger with breakpoints.
4. **Narrow down**: the bug is between the last correct value and the first wrong one.
5. **Explain** the code line by line to someone — or to a rubber duck. Saying it aloud exposes wrong assumptions.

Classic suspects: off-by-one bounds (\`<\` vs \`<=\`), loops starting at 1 instead of 0, \`>=\` where \`>\` was meant, uninitialised variables, integer division.`,
      },
      {
        title: "Testing: checks that run themselves",
        body: `A **unit test** calls a function with a known input and compares the result with the expected answer. Test normal cases, **edge cases** (empty, one element, zero, negative, largest) and cases that once failed.

\`assert(condition)\` (from \`<cassert>\`) stops the program immediately if the condition is false — great for "this can never happen" checks during development. Real projects use frameworks such as GoogleTest or Catch2; the idea is the same.`,
      },
    ],
    mistakes: [
      { title: "Changing code at random", body: "Editing until the output looks right hides the real cause. Form a hypothesis, test it, then fix." },
      { title: "Testing only the example", body: "The example in the problem is usually the easy case. Bugs live at the edges: empty input, duplicates, the first and last element." },
      { title: "Debug prints on cout", body: "Leftover debug lines on `cout` break the expected output. Print diagnostics to `cerr`, and remove them when done." },
    ],
    example: {
      title: "A tiny test harness",
      intro: "Each check compares an actual and an expected value; one deliberately buggy function is caught.",
      code: r`#include <cassert>
#include <iostream>
#include <string>
using namespace std;

int checks = 0, failures = 0;

void expectEqual(int actual, int expected, const string& what) {
    checks++;
    if (actual != expected) {
        failures++;
        cout << "FAIL " << what << ": expected " << expected << ", got " << actual << endl;
    }
}

int digitCount(int n) {
    int count = 0;
    do {
        count++;
        n /= 10;
    } while (n != 0);
    return count;
}

int buggyMax(int a, int b) {
    return a < b ? a : b;
}

int main() {
    expectEqual(digitCount(0), 1, "digitCount(0)");
    expectEqual(digitCount(12345), 5, "digitCount(12345)");
    expectEqual(digitCount(-77), 2, "digitCount(-77)");
    expectEqual(buggyMax(3, 9), 9, "buggyMax(3, 9)");
    assert(digitCount(7) == 1);
    cout << checks - failures << "/" << checks << " checks passed" << endl;
    return 0;
}`,
      output: "FAIL buggyMax(3, 9): expected 9, got 3\n3/4 checks passed\n",
      notes: [
        { line: 8, text: "A reusable check: report only what fails." },
        { line: 18, text: "`do … while` makes 0 count as one digit — an edge case worth testing." },
        { line: 26, text: "The bug the test caught: this returns the smaller value." },
        { line: 34, text: "`assert` aborts the program if the condition is ever false." },
      ],
    },
    quickCheck: {
      prompt: "The compiler reports `expected ';' before 'return'` on line 8. Where is the mistake most likely?",
      options: [
        { id: "a", text: "On line 8, inside the return statement", feedback: "Line 8 is where the compiler noticed — the missing `;` belongs earlier." },
        { id: "b", text: "At the end of line 7 (the previous statement)", feedback: "Right: the previous statement wasn't finished, so `return` was unexpected." },
        { id: "c", text: "In the #include lines", feedback: "Missing headers give \"was not declared\" errors, not this one." },
      ],
      correct: "b",
      explanation: "Errors are reported where the compiler realises something is wrong — often just after the real mistake.",
    },
    exercise: {
      title: "Find and fix three bugs",
      prompt: `This program compiles, but gives wrong answers. It should:

- \`countInRange(v, lo, hi)\` — count elements with **lo ≤ x ≤ hi** (inclusive),
- \`indexOfMax(v)\` — return the index of the **first** occurrence of the largest value.

Input: \`n\`, \`n\` numbers, then \`q\` queries \`lo hi\`. Output: one count per query, then \`max at I\`. There are **three** bugs. Trace a small input by hand to find them.`,
      starterCode: r`#include <iostream>
#include <vector>
using namespace std;

int countInRange(const vector<int>& v, int lo, int hi) {
    int count = 0;
    for (int i = 1; i < (int)v.size(); i++) {
        if (v[i] > lo && v[i] < hi) {
            count++;
        }
    }
    return count;
}

int indexOfMax(const vector<int>& v) {
    int best = 0;
    for (int i = 0; i < (int)v.size(); i++) {
        if (v[i] >= v[best]) {
            best = i;
        }
    }
    return best;
}

int main() {
    int n;
    cin >> n;
    vector<int> v(n);
    for (auto& x : v) {
        cin >> x;
    }
    int q;
    cin >> q;
    for (int i = 0; i < q; i++) {
        int lo, hi;
        cin >> lo >> hi;
        cout << countInRange(v, lo, hi) << endl;
    }
    cout << "max at " << indexOfMax(v) << endl;
    return 0;
}`,
      tests: [
        { label: "repeated maximum", input: "5\n4 9 2 9 7\n2\n2 7\n9 9\n", output: "3\n2\nmax at 1", visibility: "sample", category: "normal" },
        { label: "single element", input: "1\n5\n1\n5 5\n", output: "1\nmax at 0", visibility: "hidden", category: "boundary" },
        { label: "all equal", input: "4\n-1 -1 -1 -1\n1\n-1 0\n", output: "4\nmax at 0", visibility: "hidden", category: "edge" },
        { label: "first element matters", input: "6\n10 3 3 10 1 0\n2\n0 0\n3 10\n", output: "1\n4\nmax at 0", visibility: "hidden", category: "edge" },
      ],
      compare: "lines",
      hints: [
        "Run the sample by hand: which elements does the loop in `countInRange` actually look at?",
        "Check three things: where the loop starts, whether the range test includes the end points, and which maximum `indexOfMax` keeps when values tie.",
        "Bug 1: the loop starts at `i = 1`, skipping `v[0]`. Bug 2: `>` and `<` exclude `lo` and `hi`. Bug 3: `>=` moves `best` to the *last* maximum.",
        "Use `for (int i = 0; …)`, `v[i] >= lo && v[i] <= hi`, and `v[i] > v[best]`.",
      ],
      solution: r`#include <iostream>
#include <vector>
using namespace std;

int countInRange(const vector<int>& v, int lo, int hi) {
    int count = 0;
    for (int i = 0; i < (int)v.size(); i++) {
        if (v[i] >= lo && v[i] <= hi) {
            count++;
        }
    }
    return count;
}

int indexOfMax(const vector<int>& v) {
    int best = 0;
    for (int i = 0; i < (int)v.size(); i++) {
        if (v[i] > v[best]) {
            best = i;
        }
    }
    return best;
}

int main() {
    int n;
    cin >> n;
    vector<int> v(n);
    for (auto& x : v) {
        cin >> x;
    }
    int q;
    cin >> q;
    for (int i = 0; i < q; i++) {
        int lo, hi;
        cin >> lo >> hi;
        cout << countInRange(v, lo, hi) << endl;
    }
    cout << "max at " << indexOfMax(v) << endl;
    return 0;
}`,
      solutionNotes: "All three are classic boundary bugs: a skipped first element, exclusive instead of inclusive bounds, and `>=` vs `>` deciding which tie wins. Each hidden test targets one of them — exactly the edge cases worth writing tests for.",
    },
    explainAgain: `Debugging is detective work. The program's output is the crime scene; the expected output is the witness statement. Don't arrest the first suspect you see — retrace the steps (dry run), find the exact moment the story and the evidence disagree, and that's where the culprit is. Tests are the security cameras that catch the same culprit if they come back.`,
    summary: [
      "Fix the first compiler error first; the real mistake is often just before the reported line.",
      "Debug systematically: smallest failing input → predict → observe → narrow down.",
      "Automated checks (and `assert`) on edge cases keep fixed bugs fixed.",
    ],
  },
];
