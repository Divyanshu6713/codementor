import type { CourseLesson } from "./types";
import { practice, starter, T } from "./practice/helpers";

const r = String.raw;

/** New lessons for Module 1 (foundations) and Module 2 (variables, data types and I/O). */
export const EXTRA_BASICS_LESSONS: CourseLesson[] = [
  // ── Module 1 ──────────────────────────────────────────────────────────────
  {
    id: "compiling-linking",
    moduleId: "foundations",
    after: "hello-world",
    title: "Source files, compiling and linking",
    minutes: 15,
    concepts: ["compiler", "linker", "declaration", "definition", "prototype"],
    goals: [
      "What the preprocessor, the compiler and the linker each do",
      "The difference between **declaring** and **defining** a function",
      "How to read an \"undefined reference\" linker error",
    ],
    intro: `Pressing **Run** hides three separate steps. Knowing them tells you which tool is complaining when something goes wrong — and why a program can compile perfectly and still fail to build.`,
    sections: [
      {
        title: "From source to program",
        body: `1. The **preprocessor** handles lines starting with \`#\`: \`#include <iostream>\` pastes in the declarations of \`cout\` and friends.
2. The **compiler** turns each \`.cpp\` file into machine code (an *object file*), checking types and syntax as it goes.
3. The **linker** joins the object files and the standard library into one executable, connecting every function call to the code that implements it.

\`\`\`
main.cpp ─preprocess─▶ compile ─▶ main.o ┐
math.cpp ─preprocess─▶ compile ─▶ math.o ┴─ link ─▶ program
\`\`\``,
      },
      {
        title: "Declarations and definitions",
        body: `A **declaration** (also called a *prototype*) tells the compiler a function exists and what it looks like:

\`\`\`cpp
int square(int x);          // declaration: name, parameters, return type
\`\`\`

A **definition** gives its body:

\`\`\`cpp
int square(int x) { return x * x; }   // definition
\`\`\`

The compiler only needs the declaration to check a call. The linker needs exactly **one** definition somewhere. That's why a call works even when the function is defined *below* \`main\` — as long as it's declared above.`,
      },
      {
        title: "Programs in several files",
        body: `Real projects put declarations in a **header** (\`math.h\`) and definitions in a source file (\`math.cpp\`). Every file that calls \`square\` includes the header; only \`math.cpp\` defines it. Building is then:

\`\`\`
g++ -std=c++20 main.cpp math.cpp -o program
\`\`\`

CodeMentor runs single files, so in lessons the declaration simply sits above \`main\`.`,
      },
    ],
    mistakes: [
      { title: "Calling before declaring", body: "If `main` calls `square` and `square` is defined below `main` with no declaration above, the **compiler** stops: *'square' was not declared in this scope*." },
      { title: "Declaring but never defining", body: "If there is a declaration but no definition, compiling succeeds and the **linker** fails: *undefined reference to `square(int)'*. Find the missing body." },
      { title: "Defining twice", body: "Two definitions of the same function make the linker report *multiple definition*. Declarations can repeat; definitions can't." },
    ],
    example: {
      title: "Declare above, define below",
      intro: "`main` uses `area` before its body appears. The declaration on line 4 makes that legal.",
      code: r`#include <iostream>
using namespace std;

int area(int w, int h);   // declaration (prototype)

int main() {
    cout << area(3, 4) << endl;
    cout << area(5, 5) << endl;
    return 0;
}

int area(int w, int h) {  // definition
    return w * h;
}`,
      output: "12\n25\n",
      notes: [
        { line: 4, text: "Tells the compiler: a function `area` takes two ints and returns an int." },
        { line: 7, text: "The compiler checks this call against the declaration." },
        { line: 12, text: "The definition. The linker connects the calls to this code." },
      ],
    },
    quickCheck: {
      prompt: "A program compiles, but building it fails with `undefined reference to 'cube(int)'`. Which tool reported this, and why?",
      options: [
        { id: "a", text: "The linker: `cube` was declared but never defined", feedback: "Right — the compiler was happy with the declaration; the linker couldn't find a body." },
        { id: "b", text: "The compiler: `cube` was never declared", feedback: "A missing declaration gives *'cube' was not declared in this scope* during compiling." },
        { id: "c", text: "The preprocessor: a header is missing", feedback: "The preprocessor only handles `#` lines; it never reports undefined references." },
      ],
      correct: "a",
      explanation: "\"Undefined reference\" always comes from the linker: something was declared (so it compiled) but no definition was found.",
    },
    exercise: {
      title: "Supply the missing definition",
      prompt: `This program **compiles** but doesn't **link**: \`cube\` is declared and used, but never defined. Press **Run** to see the linker error, then add the definition below \`main\`.

Read \`n\` and print \`cube(n)\` and \`cube(n + 1)\` on separate lines.`,
      starterCode: r`#include <iostream>
using namespace std;

long long cube(long long x);   // declared...

int main() {
    long long n;
    cin >> n;
    cout << cube(n) << endl;
    cout << cube(n + 1) << endl;
    return 0;
}

// ...but never defined. Add the definition here.
`,
      tests: [
        { label: "n = 2", input: "2\n", output: "8\n27", visibility: "sample", category: "normal" },
        { label: "n = 0", input: "0\n", output: "0\n1", visibility: "hidden", category: "edge" },
        { label: "negative", input: "-3\n", output: "-27\n-8", visibility: "hidden", category: "edge" },
        { label: "large", input: "100000\n", output: "1000000000000000\n1000030000300001", visibility: "hidden", category: "boundary" },
      ],
      compare: "lines",
      hints: [
        "Read the error message: which tool is complaining — the compiler or the linker?",
        "The linker needs a definition: the same first line as the declaration, but with a body instead of `;`.",
        "Write it below `main`, after the comment.",
        "`long long cube(long long x) { return x * x * x; }`",
      ],
      solution: r`#include <iostream>
using namespace std;

long long cube(long long x);

int main() {
    long long n;
    cin >> n;
    cout << cube(n) << endl;
    cout << cube(n + 1) << endl;
    return 0;
}

long long cube(long long x) {
    return x * x * x;
}`,
      solutionNotes: "The declaration let `main` compile; the definition gives the linker the code to connect the calls to. Its first line must match the declaration exactly.",
    },
    practice: practice(
      {
        title: "Declare before use",
        prompt: `Here \`main\` calls \`average\`, which is defined **below** it with no declaration — so it doesn't compile. Add a declaration (prototype) above \`main\`; don't move the function. Read two whole numbers and print their average with 1 decimal place.`,
        starterCode: r`#include <iostream>
#include <iomanip>
using namespace std;

// Add the declaration of average here

int main() {
    int a, b;
    cin >> a >> b;
    cout << fixed << setprecision(1) << average(a, b) << endl;
    return 0;
}

double average(int a, int b) {
    return (a + b) / 2.0;
}`,
        tests: [
          T("3 4", "3 4\n", "3.5", "sample"),
          T("equal", "6 6\n", "6.0", "visible", "edge"),
          T("negative", "-5 2\n", "-1.5"),
          T("large", "1000000000 1000000000\n", "1000000000.0", "hidden", "edge"),
        ],
        hints: [
          "What does the compiler say about `average`?",
          "It reads top to bottom: at the call, it hasn't seen `average` yet.",
          "A declaration is the function's first line followed by `;`.",
          "`double average(int a, int b);` above main.",
        ],
        solution: r`#include <iostream>
#include <iomanip>
using namespace std;

double average(int a, int b);

int main() {
    int a, b;
    cin >> a >> b;
    cout << fixed << setprecision(1) << average(a, b) << endl;
    return 0;
}

double average(int a, int b) {
    return (a + b) / 2.0;
}`,
        solutionNotes: "The prototype gives the compiler everything it needs to check the call. (The large test also shows why the body divides by 2.0 after adding — two billions still fit in the int sum here.)",
      },
      {
        title: "Functions that call each other",
        prompt: `Write \`bool isEven(int n)\` and \`bool isOdd(int n)\` for n ≥ 0 that call **each other**: \`isEven(0)\` is true, \`isOdd(0)\` is false, and otherwise \`isEven(n) = isOdd(n − 1)\` and \`isOdd(n) = isEven(n − 1)\`. Read numbers until the input ends and print \`even\` or \`odd\` for each, using \`isEven\`.`,
        starterCode: starter("For each number, print even or odd using isEven", "int n;", ["iostream"], "// Declare both functions first, then define them (they call each other)"),
        tests: [
          T("small", "0 1 2 7\n", "even\nodd\neven\nodd", "sample"),
          T("one", "5\n", "odd", "visible"),
          T("bigger", "100 999\n", "even\nodd", "hidden"),
          T("deep", "20000\n", "even", "hidden", "edge"),
        ],
        compare: "lines",
        hints: [
          "Whichever you define first will call one that isn't defined yet.",
          "Declare both at the top: `bool isEven(int n);` and `bool isOdd(int n);`.",
          "Then define them in any order.",
          "`bool isEven(int n) { return n == 0 ? true : isOdd(n - 1); }`",
        ],
        solution: r`#include <iostream>
using namespace std;

bool isEven(int n);
bool isOdd(int n);

bool isEven(int n) {
    if (n == 0) return true;
    return isOdd(n - 1);
}

bool isOdd(int n) {
    if (n == 0) return false;
    return isEven(n - 1);
}

int main() {
    int n;
    while (cin >> n) {
        cout << (isEven(n) ? "even" : "odd") << endl;
    }
    return 0;
}`,
        solutionNotes: "Mutually recursive functions *need* declarations: there's no order of definitions in which each is seen before the other is used. (It's a demonstration — `n % 2` is the practical way.)",
      },
    ),
    explainAgain: `Think of building a car. The **compiler** checks each part against its drawing (the declaration) and builds it. The **linker** is the assembly line: it bolts the parts together, and if a part was drawn but never built — no definition — it stops and says it can't find it ("undefined reference").`,
    summary: [
      "Preprocessor (`#include`) → compiler (each file) → linker (joins everything).",
      "A declaration (`int f(int);`) lets you call a function; exactly one definition gives its body.",
      "\"not declared in this scope\" = compiler; \"undefined reference\" = linker.",
    ],
  },

  {
    id: "reading-compiler-errors",
    moduleId: "foundations",
    after: "compiling-linking",
    title: "Reading compiler errors",
    minutes: 15,
    concepts: ["compiler errors", "warnings", "debugging"],
    goals: [
      "Read an error line: file, line, column and message",
      "Fix the **first** error first — later ones are often caused by it",
      "Recognise the most common messages and what they usually mean",
    ],
    intro: `Error messages look scary, but they follow a pattern — and the compiler is almost always pointing very close to the real problem. Reading them well is the fastest skill you can build as a beginner.`,
    sections: [
      {
        title: "Anatomy of a message",
        body: `\`\`\`
main.cpp:7:15: error: 'totl' was not declared in this scope; did you mean 'total'?
\`\`\`

| Part | Meaning |
| --- | --- |
| \`main.cpp\` | the file |
| \`7:15\` | line 7, column 15 |
| \`error\` | must be fixed (a \`warning\` compiles but is suspicious) |
| the rest | what's wrong — and often a suggestion |`,
      },
      {
        title: "Fix the first one first",
        body: `One mistake can confuse the compiler about everything after it. A missing \`;\` on line 5 might be reported on line 6, followed by several more errors that disappear once it's fixed. So: **read the first error, fix it, compile again.**`,
      },
      {
        title: "Messages you'll see most",
        body: `| Message (shortened) | Usually means |
| --- | --- |
| \`expected ';' before …\` | the line *above* is missing \`;\` |
| \`'x' was not declared in this scope\` | typo, or used outside the block where it was declared |
| \`no match for 'operator<<'\` / \`'operator>>'\` | arrows the wrong way, or printing a type cout can't print |
| \`invalid conversion from 'const char*' to 'int'\` | text where a number is expected |
| \`expected '}' at end of input\` | a missing closing brace |
| \`too few arguments to function\` | a call doesn't match the function's parameters |`,
      },
    ],
    mistakes: [
      { title: "Fixing the last error first", body: "Later errors are often side effects. Start at the top of the list." },
      { title: "Looking only at the reported line", body: "For a missing `;` or `}` the real mistake is often on the line *before* the one reported." },
      { title: "Ignoring warnings", body: "`warning: suggest parentheses around assignment used as truth value` usually means you wrote `=` where you meant `==`. Warnings point at real bugs." },
    ],
    example: {
      title: "A fixed program",
      intro: "This version compiles. Each note says what the compiler reported before the fix.",
      code: r`#include <iostream>
#include <string>
using namespace std;

int main() {
    int total = 0;
    int count = 3;
    total = count * 5;
    string label = "Total";
    cout << label << ": " << total << endl;
    return 0;
}`,
      output: "Total: 15\n",
      notes: [
        { line: 6, text: "Was `int total = 0` with no `;` → *expected ',' or ';' before 'int'*, reported on line 7." },
        { line: 8, text: "Was `totl = …` → *'totl' was not declared in this scope; did you mean 'total'?*" },
        { line: 10, text: "Was `cout >> label` → *no match for 'operator>>'*: output uses `<<`." },
      ],
    },
    quickCheck: {
      prompt: "The compiler reports 12 errors. What should you do first?",
      options: [
        { id: "a", text: "Fix the first error, then compile again", feedback: "Yes — many of the others are usually knock-on effects of the first." },
        { id: "b", text: "Fix the last one, since it's the most recent", feedback: "The order of the list is the order in the file; the first is the one most likely to be the real cause." },
        { id: "c", text: "Rewrite the program from scratch", feedback: "Usually one or two small fixes make most of the errors vanish." },
      ],
      correct: "a",
      explanation: "One real mistake often produces a cascade of messages. Fixing the first and recompiling is the quickest path.",
    },
    exercise: {
      title: "Three messages, three fixes",
      prompt: `This program has **three** compile errors, each with a different message. Run it, read the first error, fix it, and repeat. When fixed it reads a number of items and a price and prints:

\`\`\`
Items: N
Cost: N*PRICE
\`\`\``,
      starterCode: r`#include <iostream>
using namespace std;

int main() {
    int items;
    int price = "20";
    cin >> items
    cout << "Items: " << items << endl;
    cout << "Cost: " << itms * price << endl;
    return 0;
}`,
      tests: [
        { label: "3 items", input: "3\n", output: "Items: 3\nCost: 60", visibility: "sample", category: "normal" },
        { label: "none", input: "0\n", output: "Items: 0\nCost: 0", visibility: "hidden", category: "edge" },
        { label: "many", input: "250\n", output: "Items: 250\nCost: 5000", visibility: "hidden", category: "normal" },
      ],
      compare: "lines",
      hints: [
        "Start with the first message. Which line does it point to?",
        "`int price = \"20\";` — is `\"20\"` a number or text?",
        "\"expected ';'\" is reported on the line after the real problem.",
        "Fix: `int price = 20;`, add `;` after `cin >> items`, and correct the typo `itms` → `items`.",
      ],
      solution: r`#include <iostream>
using namespace std;

int main() {
    int items;
    int price = 20;
    cin >> items;
    cout << "Items: " << items << endl;
    cout << "Cost: " << items * price << endl;
    return 0;
}`,
      solutionNotes: "*invalid conversion from 'const char*' to 'int'* (quotes make text), *expected ';' before 'cout'* (reported one line late) and *'itms' was not declared* (a typo). Each message pointed straight at its fix.",
    },
    practice: practice(
      {
        title: "Arrows and braces",
        prompt: `Fix the compile errors. When fixed, the program reads a name (one word) and prints \`Hi, NAME!\`.`,
        starterCode: r`#include <iostream>
#include <string>
using namespace std;

int main() {
    string name;
    cin << name;
    cout >> "Hi, " >> name >> "!" >> endl;
    return 0;
`,
        tests: [
          T("Asha", "Asha\n", "Hi, Asha!", "sample"),
          T("Ravi", "Ravi\n", "Hi, Ravi!"),
          T("short", "Z\n", "Hi, Z!", "hidden", "edge"),
        ],
        compare: "lines",
        hints: [
          "*no match for 'operator<<'* on the cin line: which way should input arrows point?",
          "Input flows *into* the variable: `>>`. Output flows *out* to cout: `<<`.",
          "*expected '}' at end of input*: something isn't closed.",
          "`cin >> name;`, `cout << \"Hi, \" << name << \"!\" << endl;`, and a final `}`.",
        ],
        solution: r`#include <iostream>
#include <string>
using namespace std;

int main() {
    string name;
    cin >> name;
    cout << "Hi, " << name << "!" << endl;
    return 0;
}`,
        solutionNotes: "Swapped arrows produce long *no match for operator* messages — look for the operator named in the first line. A missing brace is reported at the very end of the file.",
      },
      {
        title: "Errors and a warning",
        prompt: `Fix this program. It has **three** compile errors and one **logic** bug that only shows as a warning. When fixed it reads a mark and prints \`full marks\` if it is 100, otherwise \`MARK/100\`.`,
        starterCode: r`#include <iostream>
using namespace std;

describe(int mark) {
    if (mark = 100) {
        cout << "full marks" << endl;
    } else {
        cout << mark << "/100" << endl;
    }
}

int main() {
    int mark;
    cin >> mark;
    describe(mark, 100);
    retrun 0;
}`,
        tests: [
          T("full", "100\n", "full marks", "sample"),
          T("not full", "73\n", "73/100", "sample"),
          T("zero", "0\n", "0/100", "hidden", "edge"),
          T("99", "99\n", "99/100", "hidden", "boundary"),
        ],
        compare: "lines",
        hints: [
          "*ISO C++ forbids declaration of 'describe' with no type*: what does describe return?",
          "*too many arguments to function*: compare the call with the parameter list.",
          "`retrun` isn't a keyword.",
          "The warning *suggest parentheses around assignment* means `=` should be `==`.",
        ],
        solution: r`#include <iostream>
using namespace std;

void describe(int mark) {
    if (mark == 100) {
        cout << "full marks" << endl;
    } else {
        cout << mark << "/100" << endl;
    }
}

int main() {
    int mark;
    cin >> mark;
    describe(mark);
    return 0;
}`,
        solutionNotes: "`void` was missing, the call passed an extra argument, and `retrun` was a typo. The `=`/`==` mix-up compiles — only the warning hints at it, and without the fix every mark prints \"full marks\".",
      },
    ),
    explainAgain: `A compiler message is like a sat-nav that says "you went wrong *around here*". It gives a file, a line and a column, and a short description. Go to the first one, look at that line **and the one before it**, fix it, and ask again.`,
    summary: [
      "`file:line:column: error: message` — go to the first one.",
      "Missing `;` or `}` is usually reported one line (or the whole file) later.",
      "Warnings compile but often point at real bugs like `=` instead of `==`.",
    ],
  },

  {
    id: "portable-cpp",
    moduleId: "foundations",
    after: "reading-compiler-errors",
    title: "Writing portable C++",
    minutes: 15,
    concepts: ["portability", "standard C++", "fixed-width integers", "cstdint"],
    goals: [
      "Avoid headers and tricks that only work on one compiler or system",
      "Use `long long` or `<cstdint>` types when the size of an integer matters",
      "Write code that behaves the same on Windows, Linux and macOS",
    ],
    intro: `Code that works on your laptop might not compile — or might silently give a different answer — on the judge, a friend's Mac or a college lab machine. Standard C++ avoids those surprises.`,
    sections: [
      {
        title: "Stick to standard headers",
        body: `| Avoid | Why | Use instead |
| --- | --- | --- |
| \`#include <bits/stdc++.h>\` | GCC-only internal header | the specific headers: \`<iostream>\`, \`<vector>\`… |
| \`#include <conio.h>\`, \`getch()\` | old Windows-only | standard input |
| \`system("pause")\`, \`system("cls")\` | runs a Windows shell command | nothing — or \`cin.get()\` |
| \`void main()\` | not valid C++ | \`int main()\` |
| \`int a[n];\` with n read at run time | a GCC extension (VLA) | \`vector<int> a(n);\` |

CodeMentor's sandbox only accepts standard headers, so non-portable code is rejected here too.`,
      },
      {
        title: "Integer sizes aren't fixed",
        body: `The standard only guarantees *minimum* sizes. In practice \`int\` is 32 bits everywhere, but **\`long\` is 32 bits on Windows and 64 bits on Linux and macOS** — so a program using \`long\` for big numbers can work on one machine and overflow on another.

- Use \`long long\` (always at least 64 bits) for big numbers.
- When an exact size matters, use \`<cstdint>\`: \`int32_t\`, \`int64_t\`, \`uint8_t\`, \`uint32_t\`, \`uint64_t\`.`,
      },
      {
        title: "Same input, same output",
        body: `Portable code also means **deterministic** code: don't rely on undefined behaviour (it can differ between compilers), on the order of an \`unordered_map\`, or on how a particular CPU stores bytes in memory. Use shifts and masks to get bytes out of a number — that works the same everywhere.`,
      },
    ],
    mistakes: [
      { title: "Using bits/stdc++.h", body: "It's convenient in contests on GCC, but fails on Clang (macOS) and MSVC (Visual Studio). Include what you use." },
      { title: "Assuming long is 64 bits", body: "On Windows, `long` holds at most about 2.1 billion. Use `long long` or `int64_t`." },
      { title: "Variable-length arrays", body: "`int a[n];` with a run-time n compiles on GCC but isn't standard and can overflow the stack. Use `vector<int> a(n);`." },
    ],
    example: {
      title: "Exact-width integers",
      intro: "`<cstdint>` types have the same size on every platform, so these results are identical everywhere.",
      code: r`#include <iostream>
#include <cstdint>
using namespace std;

int main() {
    int64_t big = 3000000000LL;
    uint32_t wrap = 4294967295u;
    wrap = wrap + 1;
    uint8_t byte = 200;
    cout << big * 2 << endl;
    cout << wrap << endl;
    cout << int(byte) << endl;
    return 0;
}`,
      output: "6000000000\n0\n200\n",
      notes: [
        { line: 6, text: "Exactly 64 bits on every system — 6 billion fits." },
        { line: 8, text: "Unsigned arithmetic wraps around by design: 2³² − 1 + 1 becomes 0." },
        { line: 12, text: "`uint8_t` is a character type, so convert it to `int` to print the number." },
      ],
    },
    quickCheck: {
      prompt: "A program stores 3 000 000 000 in a `long`. It works on Linux but prints a negative number on Windows. Why?",
      options: [
        { id: "a", text: "`long` is 64 bits on Linux but 32 bits on Windows", feedback: "Exactly — use `long long` or `int64_t`." },
        { id: "b", text: "Windows can't store numbers above a billion", feedback: "It can — but not in a 32-bit type." },
        { id: "c", text: "The Linux compiler is more accurate", feedback: "Both are correct for their platform; the type just has a different size." },
      ],
      correct: "a",
      explanation: "Type sizes can differ between platforms. When the size matters, choose a type whose size is guaranteed.",
    },
    exercise: {
      title: "Make it portable",
      prompt: `This program only builds with GCC and can overflow on Windows. Replace the non-standard header with the standard one it needs, and use a type that's 64 bits everywhere.

Read two whole numbers a and b (each up to 1 000 000 000) and print \`a * b\`.`,
      starterCode: r`#include <bits/stdc++.h>
using namespace std;

int main() {
    long a, b;
    cin >> a >> b;
    cout << a * b << endl;
    return 0;
}`,
      tests: [
        { label: "small", input: "6 7\n", output: "42", visibility: "sample", category: "normal" },
        { label: "big", input: "1000000000 1000000000\n", output: "1000000000000000000", visibility: "sample", category: "boundary" },
        { label: "zero", input: "0 999\n", output: "0", visibility: "hidden", category: "edge" },
        { label: "over 32 bits", input: "70000 70000\n", output: "4900000000", visibility: "hidden", category: "edge" },
      ],
      compare: "tokens",
      hints: [
        "Which standard header gives you `cin` and `cout`?",
        "`#include <iostream>` — that's all this program needs.",
        "Which integer type is at least 64 bits on every platform?",
        "Use `long long a, b;` (or `int64_t` from `<cstdint>`).",
      ],
      solution: r`#include <iostream>
using namespace std;

int main() {
    long long a, b;
    cin >> a >> b;
    cout << a * b << endl;
    return 0;
}`,
      solutionNotes: "`<iostream>` is the standard header for console I/O, and `long long` is at least 64 bits everywhere, so 10⁹ × 10⁹ = 10¹⁸ fits on every system.",
    },
    practice: practice(
      {
        title: "A wrapping checksum",
        prompt: `Read \`n\` and then n byte values (0–255). Compute a checksum: start at 0 and, for each byte b, set \`sum = sum * 31 + b\` — using a \`uint32_t\`, so it wraps around modulo 2³² the same way on every system. Print the final checksum.`,
        starterCode: starter("Use a uint32_t accumulator: sum = sum * 31 + b", "int n;\ncin >> n;", ["iostream", "cstdint"]),
        tests: [
          T("sample", "3\n1 2 3\n", "1026", "sample"),
          T("none", "0\n", "0", "visible", "edge"),
          T("wraps", "8\n255 255 255 255 255 255 255 255\n", "3963989888", "hidden", "edge"),
          T("text bytes", "5\n104 101 108 108 111\n", "99162322", "hidden"),
        ],
        hints: [
          "Which type is exactly 32 bits and unsigned?",
          "`uint32_t sum = 0;` from `<cstdint>`.",
          "Unsigned overflow is well defined: it wraps modulo 2³².",
          "Print it directly — cout prints uint32_t as a number.",
        ],
        solution: r`#include <iostream>
#include <cstdint>
using namespace std;

int main() {
    int n;
    cin >> n;
    uint32_t sum = 0;
    for (int i = 0; i < n; i++) {
        int b;
        cin >> b;
        sum = sum * 31 + static_cast<uint32_t>(b);
    }
    cout << sum << endl;
    return 0;
}`,
        solutionNotes: "With an exact-width unsigned type the wrap-around is identical on every platform. (\"hello\" in bytes gives the same hash as Java's String.hashCode.)",
      },
      {
        title: "Bytes, most significant first",
        prompt: `Read a whole number from 0 to 4 294 967 295. Print its 4 bytes from the **most** significant to the least, as two-digit hexadecimal numbers separated by spaces. Use shifts and masks (\`>>\` and \`& 0xFF\`), not memory tricks — so the result doesn't depend on the computer.

| Input | Output |
| --- | --- |
| \`305419896\` | \`12 34 56 78\` |`,
        starterCode: starter("Extract each byte with >> and & 0xFF; print as 2-digit hex", "uint32_t x;\ncin >> x;", ["iostream", "iomanip", "cstdint"]),
        tests: [
          T("sample", "305419896\n", "12 34 56 78", "sample"),
          T("zero", "0\n", "00 00 00 00", "visible", "edge"),
          T("max", "4294967295\n", "ff ff ff ff", "hidden", "boundary"),
          T("one", "1\n", "00 00 00 01", "hidden", "edge"),
          T("mixed", "3735928559\n", "de ad be ef", "hidden"),
        ],
        compare: "lines",
        hints: [
          "The most significant byte is `x >> 24`.",
          "Mask with `& 0xFF` to keep only the lowest 8 bits.",
          "Loop shift = 24, 16, 8, 0.",
          "Print with `hex << setw(2) << setfill('0')`.",
        ],
        solution: r`#include <iostream>
#include <iomanip>
#include <cstdint>
using namespace std;

int main() {
    uint32_t x;
    cin >> x;
    for (int shift = 24; shift >= 0; shift -= 8) {
        unsigned byte = (x >> shift) & 0xFF;
        cout << hex << setw(2) << setfill('0') << byte;
        cout << (shift > 0 ? " " : "\n");
    }
    return 0;
}`,
        solutionNotes: "Shifts work on values, not on memory, so they give the same bytes on little- and big-endian machines. Reading a number's bytes through a pointer would print them in the machine's own order (78 56 34 12 on most PCs).",
      },
    ),
    explainAgain: `Portable C++ is like writing a letter in plain English instead of local slang: everyone can read it. Use the standard headers, pick integer types whose size is guaranteed when it matters, and avoid compiler-specific shortcuts.`,
    summary: [
      "Include the standard headers you use — not `bits/stdc++.h`, `conio.h` or `system(...)`.",
      "`long` can be 32 bits; use `long long` or `<cstdint>` types for big or exact-size numbers.",
      "Use shifts and masks rather than memory layout; avoid undefined behaviour.",
    ],
  },

  // ── Module 2 ──────────────────────────────────────────────────────────────
  {
    id: "constants-const",
    moduleId: "variables-io",
    after: "data-types",
    title: "Constants and const",
    minutes: 12,
    concepts: ["const", "constexpr", "magic numbers"],
    goals: [
      "Make a value unchangeable with `const`",
      "Use `constexpr` for values known when the program is compiled",
      "Replace \"magic numbers\" with named constants",
    ],
    intro: `Some values should never change while a program runs: the number of days in a week, a tax rate, the size of a board. Marking them \`const\` documents that — and the compiler then stops anyone (including you) from changing them by accident.`,
    sections: [
      {
        title: "const",
        body: `\`\`\`cpp
const double TAX_RATE = 0.18;
const int DAYS_PER_WEEK = 7;
TAX_RATE = 0.2;   // error: assignment of read-only variable
\`\`\`

A \`const\` variable must be given its value when it's declared, and can't be assigned afterwards. Constants are often written in \`UPPER_CASE\` so they stand out.`,
      },
      {
        title: "constexpr",
        body: `\`constexpr\` means "computed at compile time". It's perfect for values built from other constants:

\`\`\`cpp
constexpr int SECONDS_PER_MINUTE = 60;
constexpr int SECONDS_PER_DAY = 24 * 60 * SECONDS_PER_MINUTE;   // 86400
\`\`\`

A \`const\` can be set from input at run time (\`const int n = readNumber();\`); a \`constexpr\` can't.`,
      },
      {
        title: "No magic numbers",
        body: `Compare:

\`\`\`cpp
total = price * 1.18;            // what is 1.18?
total = price * (1 + TAX_RATE);  // clear, and changed in one place
\`\`\`

A **magic number** is a bare value whose meaning you have to guess. Naming it explains it, and if the rate changes you edit one line instead of hunting for every \`1.18\`.`,
      },
    ],
    mistakes: [
      { title: "Forgetting to initialise", body: "`const int MAX;` is an error — a constant needs its value at the point it's declared." },
      { title: "Trying to change a constant", body: "If you need to change it, it isn't a constant. Use a normal variable." },
      { title: "constexpr from input", body: "`constexpr int n = x;` fails if x is only known at run time. Use `const` for run-time values that won't change afterwards." },
    ],
    example: {
      title: "Named constants",
      intro: "Every number with a meaning gets a name, so the calculation reads like a sentence.",
      code: r`#include <iostream>
using namespace std;

constexpr int MINUTES_PER_HOUR = 60;
constexpr int HOURS_PER_DAY = 24;
constexpr int MINUTES_PER_DAY = MINUTES_PER_HOUR * HOURS_PER_DAY;

int main() {
    const int days = 3;
    cout << "Minutes in a day: " << MINUTES_PER_DAY << endl;
    cout << "Minutes in " << days << " days: " << days * MINUTES_PER_DAY << endl;
    return 0;
}`,
      output: "Minutes in a day: 1440\nMinutes in 3 days: 4320\n",
      notes: [
        { line: 6, text: "Built from other constants — worked out by the compiler." },
        { line: 9, text: "A local constant: `days` can't be changed below this line." },
      ],
    },
    quickCheck: {
      prompt: "Which line does **not** compile?",
      code: r`const int A = 5;
int b = A + 1;
b = 10;
A = 10;`,
      options: [
        { id: "a", text: "A = 10;", feedback: "Right — A is const, so it can't be assigned after its declaration." },
        { id: "b", text: "int b = A + 1;", feedback: "Reading a constant is fine; b is an ordinary variable." },
        { id: "c", text: "b = 10;", feedback: "b isn't const, so assigning to it is fine." },
      ],
      correct: "a",
      explanation: "Constants can be read and used in expressions, but never assigned again.",
    },
    exercise: {
      title: "Price with tax",
      prompt: `Define a constant \`TAX_RATE\` of 0.18 (18%). Read a price (it may have decimals) and print the price including tax, with 2 decimal places. Don't write \`0.18\` or \`1.18\` anywhere except in the constant's definition.`,
      starterCode: r`#include <iostream>
#include <iomanip>
using namespace std;

// Define TAX_RATE here

int main() {
    double price;
    cin >> price;
    // Print the price with tax, 2 decimals

    return 0;
}`,
      tests: [
        { label: "100", input: "100\n", output: "118.00", visibility: "sample", category: "normal" },
        { label: "zero", input: "0\n", output: "0.00", visibility: "hidden", category: "edge" },
        { label: "decimals", input: "49.99\n", output: "58.99", visibility: "hidden", category: "normal" },
        { label: "large", input: "125000\n", output: "147500.00", visibility: "hidden", category: "normal" },
      ],
      compare: "tokens",
      hints: [
        "A constant needs a type, a name and its value: `const double … = …;`.",
        "Price with tax = price × (1 + rate).",
        "Use `fixed << setprecision(2)` for two decimals.",
        "`const double TAX_RATE = 0.18;` … `cout << fixed << setprecision(2) << price * (1 + TAX_RATE);`",
      ],
      solution: r`#include <iostream>
#include <iomanip>
using namespace std;

const double TAX_RATE = 0.18;

int main() {
    double price;
    cin >> price;
    cout << fixed << setprecision(2) << price * (1 + TAX_RATE) << endl;
    return 0;
}`,
      solutionNotes: "The rate lives in one named place. If it changes to 0.12, you edit exactly one line.",
    },
    practice: practice(
      {
        title: "Seconds in a span of years",
        prompt: `Using \`constexpr\` constants built from each other (seconds per minute, minutes per hour, hours per day, days per year = 365), read a number of years and print how many seconds that is.`,
        starterCode: starter("Build the constants with constexpr and print years * SECONDS_PER_YEAR", "long long years;\ncin >> years;", ["iostream"], "// Define your constexpr constants here"),
        tests: [
          T("1 year", "1\n", "31536000", "sample"),
          T("zero", "0\n", "0", "visible", "edge"),
          T("100 years", "100\n", "3153600000", "hidden", "boundary"),
          T("big", "1000000\n", "31536000000000", "hidden", "edge"),
        ],
        hints: [
          "Start with `constexpr long long SECONDS_PER_MINUTE = 60;`.",
          "Each next constant multiplies the previous one.",
          "SECONDS_PER_YEAR = 365 × SECONDS_PER_DAY.",
          "Use long long so 100 years (over 3 billion) fits.",
        ],
        solution: r`#include <iostream>
using namespace std;

constexpr long long SECONDS_PER_MINUTE = 60;
constexpr long long SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE;
constexpr long long SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR;
constexpr long long SECONDS_PER_YEAR = 365 * SECONDS_PER_DAY;

int main() {
    long long years;
    cin >> years;
    cout << years * SECONDS_PER_YEAR << endl;
    return 0;
}`,
        solutionNotes: "Each constant is computed by the compiler from the one before, so the code explains itself and costs nothing at run time.",
      },
      {
        title: "Length converter",
        prompt: `Read a length and its unit (\`km\`, \`m\`, \`cm\` or \`mm\`). Print it in all four units, one per line, as \`VALUE UNIT\` with up to 6 significant digits (default cout formatting). Keep the conversion factors as named constants — e.g. \`const double M_PER_KM = 1000;\`.`,
        starterCode: starter("Convert to metres using named constants, then print all four units", "double value;\nstring unit;\ncin >> value >> unit;", ["iostream", "string"], "// Define the conversion constants here"),
        tests: [
          T("2 km", "2 km\n", "2 km\n2000 m\n200000 cm\n2e+06 mm", "sample"),
          T("150 cm", "150 cm\n", "0.0015 km\n1.5 m\n150 cm\n1500 mm", "visible"),
          T("mm", "5 mm\n", "5e-06 km\n0.005 m\n0.5 cm\n5 mm", "hidden", "edge"),
          T("zero", "0 m\n", "0 km\n0 m\n0 cm\n0 mm", "hidden", "edge"),
        ],
        compare: "lines",
        hints: [
          "Convert everything to one base unit (metres) first.",
          "Constants: M_PER_KM = 1000, CM_PER_M = 100, MM_PER_M = 1000.",
          "From metres: km = m / M_PER_KM, cm = m × CM_PER_M, mm = m × MM_PER_M.",
          "Plain `cout << x` prints up to 6 significant digits (that's where 2e+06 comes from).",
        ],
        solution: r`#include <iostream>
#include <string>
using namespace std;

const double M_PER_KM = 1000;
const double CM_PER_M = 100;
const double MM_PER_M = 1000;

int main() {
    double value;
    string unit;
    cin >> value >> unit;
    double m = value;
    if (unit == "km") m = value * M_PER_KM;
    else if (unit == "cm") m = value / CM_PER_M;
    else if (unit == "mm") m = value / MM_PER_M;
    cout << m / M_PER_KM << " km" << endl;
    cout << m << " m" << endl;
    cout << m * CM_PER_M << " cm" << endl;
    cout << m * MM_PER_M << " mm" << endl;
    return 0;
}`,
        solutionNotes: "Converting through one base unit means 3 constants instead of 12 pairwise factors. Named constants make each line readable.",
      },
    ),
    explainAgain: `A \`const\` is a label stuck on a box with glue: you can look inside as often as you like, but you can't swap the contents. Use it for anything with a fixed meaning, and give it a name so nobody has to guess what a bare number means.`,
    summary: [
      "`const` values are set once and can't be assigned again.",
      "`constexpr` values are computed at compile time from other constants.",
      "Name your numbers: `TAX_RATE`, not `0.18` scattered through the code.",
    ],
  },

  {
    id: "escape-sizeof",
    moduleId: "variables-io",
    after: "constants-const",
    title: "Escape sequences and sizeof",
    minutes: 12,
    concepts: ["escape sequences", "sizeof", "char codes"],
    goals: [
      "Print special characters with escape sequences: `\\n`, `\\t`, `\\\\`, `\\\"`",
      "Measure types and arrays with `sizeof`",
      "Count an array's elements with `sizeof(a) / sizeof(a[0])`",
    ],
    intro: `Some characters can't be typed straight into a string: a new line, a tab, a double quote that shouldn't end the string. Escape sequences solve that. And \`sizeof\` tells you how much memory something uses — useful for arrays.`,
    sections: [
      {
        title: "Escape sequences",
        body: `| Write | Means |
| --- | --- |
| \`\\n\` | new line |
| \`\\t\` | tab |
| \`\\\\\` | one backslash |
| \`\\"\` | a double quote inside a string |
| \`\\'\` | a single quote as a char: \`'\\''\` |
| \`\\0\` | the null character that ends C-strings |

\`cout << "Name:\\t\\"Asha\\"\\n";\` prints \`Name:\` a tab, \`"Asha"\` and a new line.`,
      },
      {
        title: "sizeof",
        body: `\`sizeof\` gives a size in **bytes**:

\`\`\`cpp
sizeof(char)     // always 1
sizeof(int)      // 4 on all common systems
sizeof(double)   // 8 on all common systems
\`\`\`

(Sizes like \`sizeof(long)\` differ between systems — see *Writing portable C++*.)`,
      },
      {
        title: "Counting array elements",
        body: `For a real array (not a pointer), \`sizeof(a)\` is the size of the whole array, so:

\`\`\`cpp
int a[] = {4, 8, 15, 16, 23, 42};
int n = sizeof(a) / sizeof(a[0]);   // 24 / 4 = 6
\`\`\`

This only works where the array was declared. Inside a function that received the array, it has become a pointer — modern code uses \`std::size(a)\` or a \`vector\`.`,
      },
    ],
    mistakes: [
      { title: "A single backslash in a path", body: "`\"C:\\new\"` contains `\\n` — a new line! Write `\"C:\\\\new\"`." },
      { title: "sizeof on a pointer", body: "Inside `void f(int a[])`, `sizeof(a)` is the size of a pointer (usually 8), not the array." },
      { title: "Forgetting sizeof is in bytes", body: "`sizeof(a)` for 6 ints is 24, not 6. Divide by `sizeof(a[0])` to count elements." },
    ],
    example: {
      title: "Escapes and sizes",
      intro: "A small table using tabs, plus sizeof on types and an array.",
      code: r`#include <iostream>
using namespace std;

int main() {
    int primes[] = {2, 3, 5, 7, 11};
    int n = sizeof(primes) / sizeof(primes[0]);
    cout << "Type\tBytes\n";
    cout << "char\t" << sizeof(char) << "\n";
    cout << "int\t" << sizeof(int) << "\n";
    cout << "array\t" << sizeof(primes) << "\n";
    cout << "\"primes\" has " << n << " elements\n";
    return 0;
}`,
      output: "Type\tBytes\nchar\t1\nint\t4\narray\t20\n\"primes\" has 5 elements\n",
      notes: [
        { line: 6, text: "20 bytes ÷ 4 bytes per int = 5 elements." },
        { line: 7, text: "`\\t` lines the columns up; `\\n` ends the line." },
        { line: 11, text: "`\\\"` puts quote marks inside the text." },
      ],
    },
    quickCheck: {
      prompt: "What does `cout << \"a\\\\b\";` print?",
      options: [
        { id: "a", text: "a\\b", feedback: "Yes — `\\\\` is one backslash." },
        { id: "b", text: "a\\\\b", feedback: "Each `\\\\` pair prints a single backslash." },
        { id: "c", text: "a then a backspace", feedback: "That would be `\\b` alone. Here the backslash is escaped." },
      ],
      correct: "a",
      explanation: "In a string, `\\\\` stands for one literal backslash.",
    },
    exercise: {
      title: "Character code table",
      prompt: `Read a character \`c\` and a count \`n\`. Print a header line \`char<TAB>code\`, then n rows: the character c, c+1, …, a tab, and its numeric code.

For \`A 3\`:
\`\`\`
char	code
A	65
B	66
C	67
\`\`\``,
      starterCode: r`#include <iostream>
using namespace std;

int main() {
    char c;
    int n;
    cin >> c >> n;
    // Print the header, then n rows separated by a tab

    return 0;
}`,
      tests: [
        { label: "A 3", input: "A 3\n", output: "char\tcode\nA\t65\nB\t66\nC\t67", visibility: "sample", category: "normal" },
        { label: "digits", input: "0 2\n", output: "char\tcode\n0\t48\n1\t49", visibility: "hidden", category: "normal" },
        { label: "none", input: "x 0\n", output: "char\tcode", visibility: "hidden", category: "edge" },
        { label: "lowercase", input: "y 2\n", output: "char\tcode\ny\t121\nz\t122", visibility: "hidden", category: "boundary" },
      ],
      compare: "lines",
      hints: [
        "A tab inside a string is `\\t`.",
        "Loop i from 0 to n − 1; the character is `char(c + i)`.",
        "Its code is `int(c + i)`.",
        "`cout << char(c + i) << \"\\t\" << int(c + i) << \"\\n\";`",
      ],
      solution: r`#include <iostream>
using namespace std;

int main() {
    char c;
    int n;
    cin >> c >> n;
    cout << "char\tcode\n";
    for (int i = 0; i < n; i++) {
        cout << char(c + i) << "\t" << int(c + i) << "\n";
    }
    return 0;
}`,
      solutionNotes: "`c + i` is an int; converting it with `char(...)` prints a character, with `int(...)` the number. `\\t` separates the columns.",
    },
    practice: practice(
      {
        title: "Count with sizeof",
        prompt: `The starter declares an array of marks. Without typing its length anywhere, use \`sizeof\` to find how many marks there are, then print the count and the total, separated by a space. (No input.)`,
        starterCode: r`#include <iostream>
using namespace std;

int main() {
    int marks[] = {78, 92, 64, 88, 71, 95, 59};
    // Find the number of elements with sizeof, then print count and total

    return 0;
}`,
        tests: [
          T("marks", "", "7 547", "sample"),
          T("same output again", "", "7 547"),
        ],
        hints: [
          "sizeof(marks) is the whole array in bytes.",
          "sizeof(marks[0]) is one element in bytes.",
          "Divide them to get the count.",
          "Then loop over that many elements to add them up.",
        ],
        solution: r`#include <iostream>
using namespace std;

int main() {
    int marks[] = {78, 92, 64, 88, 71, 95, 59};
    int n = sizeof(marks) / sizeof(marks[0]);
    int total = 0;
    for (int i = 0; i < n; i++) total += marks[i];
    cout << n << " " << total << endl;
    return 0;
}`,
        solutionNotes: "Deriving the length from the array itself means adding an eighth mark needs no other change.",
      },
      {
        title: "A JSON line",
        prompt: `Read a name (one word), an age and a city (one word). Print them as one line of JSON exactly like this:

\`\`\`
{"name": "Asha", "age": 14, "city": "Pune"}
\`\`\``,
        starterCode: starter("Print the JSON line using escaped quotes", "string name, city;\nint age;\ncin >> name >> age >> city;", ["iostream", "string"]),
        tests: [
          T("sample", "Asha 14 Pune\n", "{\"name\": \"Asha\", \"age\": 14, \"city\": \"Pune\"}", "sample"),
          T("another", "Ravi 9 Delhi\n", "{\"name\": \"Ravi\", \"age\": 9, \"city\": \"Delhi\"}"),
          T("zero age", "Baby 0 Goa\n", "{\"name\": \"Baby\", \"age\": 0, \"city\": \"Goa\"}", "hidden", "edge"),
        ],
        compare: "lines",
        hints: [
          "Every `\"` that should appear in the output needs to be written `\\\"`.",
          "The age is a number in JSON, so it has no quotes.",
          "Build it from pieces: `\"{\\\"name\\\": \\\"\" << name << \"\\\", …`",
          "Check the spaces after each colon and comma.",
        ],
        solution: r`#include <iostream>
#include <string>
using namespace std;

int main() {
    string name, city;
    int age;
    cin >> name >> age >> city;
    cout << "{\"name\": \"" << name << "\", \"age\": " << age << ", \"city\": \"" << city << "\"}" << endl;
    return 0;
}`,
        solutionNotes: "Escaped quotes `\\\"` let a string contain the quote characters JSON needs. (C++ raw strings `R\"(...)\"` are another way to write text full of quotes.)",
      },
    ),
    explainAgain: `A backslash in a string means "the next character is special". \`\\n\` isn't a backslash and an n — it's one new-line character. And \`sizeof\` is a measuring tape for memory: in bytes, so divide by one element's size to count elements.`,
    summary: [
      "`\\n` new line, `\\t` tab, `\\\\` backslash, `\\\"` quote.",
      "`sizeof` gives sizes in bytes; `sizeof(char)` is always 1.",
      "`sizeof(a) / sizeof(a[0])` counts a real array's elements (not through a pointer).",
    ],
  },

  {
    id: "getline-input",
    moduleId: "variables-io",
    after: "escape-sizeof",
    title: "getline and whole-line input",
    minutes: 15,
    concepts: ["getline", "cin.ignore", "whitespace"],
    goals: [
      "Read a whole line, spaces included, with `getline`",
      "Fix the classic \"getline returns an empty line\" bug after `cin >>`",
      "Read lines until the input ends",
    ],
    intro: `\`cin >> name\` stops at the first space, so "Asha Rao" becomes just "Asha". To read a full name, an address or a sentence, you need \`getline\` — and one small trick when mixing it with \`>>\`.`,
    sections: [
      {
        title: "Reading a whole line",
        body: `\`\`\`cpp
string line;
getline(cin, line);   // everything up to (not including) the Enter key
\`\`\`

\`>>\` skips leading spaces and reads one word. \`getline\` reads every character — spaces too — until the end of the line.`,
      },
      {
        title: "The leftover newline",
        body: `After \`cin >> age;\` the Enter the user pressed is still waiting in the input. A following \`getline\` reads that empty rest-of-line immediately:

\`\`\`cpp
int age;
string name;
cin >> age;            // input: "14⏎Asha Rao⏎"
getline(cin, name);    // gets "" — the rest of the first line!
\`\`\`

Fix it by skipping the rest of the line first:

\`\`\`cpp
cin >> age;
cin.ignore(numeric_limits<streamsize>::max(), '\\n');  // or: getline(cin >> ws, name);
getline(cin, name);
\`\`\``,
      },
      {
        title: "Reading until the input ends",
        body: `\`getline\` returns the stream, which is "false" once there's nothing left:

\`\`\`cpp
string line;
while (getline(cin, line)) {
    // handle one line
}
\`\`\``,
      },
    ],
    mistakes: [
      { title: "Empty line after cin >>", body: "Always skip the leftover newline (`cin.ignore(...)` or `cin >> ws`) before a `getline` that follows `>>`." },
      { title: "Using >> for names with spaces", body: "`cin >> name` reads only the first word. Use `getline`." },
      { title: "Windows line endings", body: "Files from Windows may end lines with `\\r\\n`; the `\\r` stays in the string. Strip it if lines look one character too long." },
    ],
    example: {
      title: "A number, then a full line",
      intro: "Run with the input on two lines: `3` and then `Asha Rao`.",
      code: r`#include <iostream>
#include <limits>
#include <string>
using namespace std;

int main() {
    int tickets;
    string name;
    cin >> tickets;
    cin.ignore(numeric_limits<streamsize>::max(), '\n');
    getline(cin, name);
    cout << name << " booked " << tickets << " tickets" << endl;
    cout << "Name length: " << name.size() << endl;
    return 0;
}`,
      input: "3\nAsha Rao\n",
      output: "Asha Rao booked 3 tickets\nName length: 8\n",
      notes: [
        { line: 9, text: "Reads 3; the newline after it stays in the input." },
        { line: 10, text: "Throws away everything up to and including that newline." },
        { line: 11, text: "Now getline reads the whole second line, space included." },
      ],
    },
    quickCheck: {
      prompt: "Input is `20⏎Delhi⏎`. The code does `cin >> n; getline(cin, city);`. What is `city`?",
      options: [
        { id: "a", text: "An empty string", feedback: "Right — getline read the rest of the first line, which was empty." },
        { id: "b", text: "\"Delhi\"", feedback: "Not without skipping the newline that `cin >> n` left behind." },
        { id: "c", text: "\"20\"", feedback: "`>>` already consumed 20." },
      ],
      correct: "a",
      explanation: "`>>` stops before the newline; getline then reads up to that newline — an empty line.",
    },
    exercise: {
      title: "Age, then full name",
      prompt: `The first line has an age; the second line has a full name (it may contain spaces). Print \`NAME is AGE years old\`.`,
      starterCode: r`#include <iostream>
#include <string>
using namespace std;

int main() {
    int age;
    string name;
    cin >> age;
    getline(cin, name);
    cout << name << " is " << age << " years old" << endl;
    return 0;
}`,
      tests: [
        { label: "two words", input: "14\nAsha Rao\n", output: "Asha Rao is 14 years old", visibility: "sample", category: "normal" },
        { label: "one word", input: "30\nMeera\n", output: "Meera is 30 years old", visibility: "hidden", category: "normal" },
        { label: "three words", input: "65\nRam Prasad Bismil\n", output: "Ram Prasad Bismil is 65 years old", visibility: "hidden", category: "normal" },
      ],
      compare: "lines",
      hints: [
        "Run it: what does the name come out as?",
        "`cin >> age` leaves the newline behind; getline reads that empty rest of the line.",
        "Skip the leftover newline before calling getline.",
        "`cin.ignore(numeric_limits<streamsize>::max(), '\\n');` (include `<limits>`) or `getline(cin >> ws, name);`",
      ],
      solution: r`#include <iostream>
#include <limits>
#include <string>
using namespace std;

int main() {
    int age;
    string name;
    cin >> age;
    cin.ignore(numeric_limits<streamsize>::max(), '\n');
    getline(cin, name);
    cout << name << " is " << age << " years old" << endl;
    return 0;
}`,
      solutionNotes: "The starter printed \" is 14 years old\" because getline read the empty remainder of the first line. Ignoring up to the newline fixes it.",
    },
    practice: practice(
      {
        title: "Number the lines",
        prompt: `The first line has a count \`n\`; then come n lines of text (they may contain spaces or be empty). Print each one prefixed with its number: \`1: …\`.`,
        starterCode: starter("Skip the newline after n, then getline n times", "int n;\ncin >> n;", ["iostream", "string", "limits"]),
        tests: [
          T("sample", "2\nhello world\nC++ is fun\n", "1: hello world\n2: C++ is fun", "sample"),
          T("empty line", "3\na\n\nc\n", "1: a\n2:\n3: c", "visible", "edge"),
          T("none", "0\n", "", "hidden", "edge"),
          T("spaces kept", "1\n   indented\n", "1:    indented", "hidden", "edge"),
        ],
        compare: "lines",
        hints: [
          "After `cin >> n`, skip the rest of that line.",
          "Then loop n times with getline.",
          "Print the number, a colon and a space, then the line.",
          "Lines can be empty — getline still reads them.",
        ],
        solution: r`#include <iostream>
#include <string>
#include <limits>
using namespace std;

int main() {
    int n;
    cin >> n;
    cin.ignore(numeric_limits<streamsize>::max(), '\n');
    for (int i = 1; i <= n; i++) {
        string line;
        getline(cin, line);
        cout << i << ": " << line << endl;
    }
    return 0;
}`,
        solutionNotes: "getline keeps leading spaces and reads empty lines as empty strings — unlike `>>`, which skips whitespace.",
      },
      {
        title: "Longest line until END",
        prompt: `Read lines until a line that is exactly \`END\` (or the input ends). Print how many lines came before it, and then the longest of them (the first one if tied; print nothing on the second line if there were none).`,
        starterCode: starter("Loop with getline, stop at END, track the count and the longest line", "string line;", ["iostream", "string"]),
        tests: [
          T("sample", "short\na much longer line\nmid size\nEND\nignored\n", "3\na much longer line", "sample"),
          T("tie keeps first", "abc\nxyz\nEND\n", "2\nabc", "visible", "edge"),
          T("immediately END", "END\n", "0\n", "hidden", "edge"),
          T("no END", "one\ntwo words\n", "2\ntwo words", "hidden", "edge"),
        ],
        compare: "lines",
        hints: [
          "`while (getline(cin, line))` stops when the input ends.",
          "Inside, `if (line == \"END\") break;`.",
          "Count the line and compare its size with the longest so far.",
          "Use `>` so an equally long later line doesn't replace the first.",
        ],
        solution: r`#include <iostream>
#include <string>
using namespace std;

int main() {
    string line, longest;
    int count = 0;
    while (getline(cin, line)) {
        if (line == "END") break;
        count++;
        if (line.size() > longest.size()) longest = line;
    }
    cout << count << endl;
    cout << longest << endl;
    return 0;
}`,
        solutionNotes: "A sentinel line (END) and the end of input both stop the loop. The comparison uses the whole line, spaces included.",
      },
    ),
    explainAgain: `Think of the input as a long ribbon of characters. \`>>\` cuts out one word and leaves you standing just before the newline. \`getline\` cuts from where you stand up to the next newline — so if you're standing right in front of one, you get nothing. Step over it first (\`ignore\`), then cut.`,
    summary: [
      "`getline(cin, s)` reads a whole line, spaces included.",
      "After `cin >> x`, skip the leftover newline before `getline`.",
      "`while (getline(cin, line))` reads every line until the input ends.",
    ],
  },

  {
    id: "overflow-signed",
    moduleId: "variables-io",
    after: "getline-input",
    title: "Integer overflow, signed and unsigned",
    minutes: 15,
    concepts: ["overflow", "INT_MAX", "unsigned", "size_t"],
    goals: [
      "Know the range of `int`, `long long` and unsigned types",
      "Recognise overflow — and why signed overflow is dangerous",
      "Avoid the classic unsigned bugs with `.size()`",
    ],
    intro: `Integers in C++ have a fixed number of bits, so they have a largest value. Go past it and you get **overflow**: a wrong answer with no error message. This lesson shows how to see it coming.`,
    sections: [
      {
        title: "Ranges",
        body: `| Type | Typical range |
| --- | --- |
| \`int\` | −2 147 483 648 … 2 147 483 647 (about ±2.1 × 10⁹) |
| \`long long\` | about ±9.2 × 10¹⁸ |
| \`unsigned int\` | 0 … 4 294 967 295 |
| \`unsigned long long\` | 0 … about 1.8 × 10¹⁹ |

\`<climits>\` names them: \`INT_MAX\`, \`INT_MIN\`, \`LLONG_MAX\`, \`ULLONG_MAX\`.`,
      },
      {
        title: "Overflow",
        body: `\`\`\`cpp
int a = 100000, b = 100000;
long long wrong = a * b;              // multiplied as int first: overflow!
long long right = (long long)a * b;   // 10 000 000 000
\`\`\`

The type of \`a * b\` is decided by \`a\` and \`b\`, not by the variable you store it in. **Signed** overflow is *undefined behaviour* — the compiler may assume it never happens. **Unsigned** arithmetic is defined to wrap around (\`0u - 1\` is \`4294967295\`).`,
      },
      {
        title: "Unsigned traps",
        body: `\`.size()\` returns an unsigned \`size_t\`. So with an empty vector, \`v.size() - 1\` is not −1 — it's a huge number. And \`for (size_t i = n - 1; i >= 0; i--)\` never ends, because an unsigned value is *always* \`>= 0\`.

Safer patterns:

\`\`\`cpp
for (int i = (int)v.size() - 1; i >= 0; i--)   // signed index
for (size_t i = v.size(); i-- > 0; )            // or count down with i-- > 0
\`\`\``,
      },
    ],
    mistakes: [
      { title: "Storing into long long isn't enough", body: "`long long x = a * b;` overflows if a and b are ints. Convert one operand first: `(long long)a * b`." },
      { title: "Comparing signed and unsigned", body: "`-1 < v.size()` is false: -1 is converted to a huge unsigned value. Compilers warn about this (-Wsign-compare)." },
      { title: "Counting down with size_t", body: "`size_t i >= 0` is always true. Use a signed index or `i-- > 0`." },
    ],
    example: {
      title: "Seeing overflow",
      intro: "The same multiplication done in int and in long long, plus unsigned wrap-around.",
      code: r`#include <iostream>
#include <climits>
using namespace std;

int main() {
    int a = 50000, b = 50000;
    long long good = (long long)a * b;
    cout << "INT_MAX = " << INT_MAX << endl;
    cout << "50000 * 50000 = " << good << endl;
    cout << "fits in int? " << (good <= INT_MAX ? "yes" : "no") << endl;
    unsigned int u = 0;
    u = u - 1;
    cout << "0u - 1 = " << u << endl;
    return 0;
}`,
      output: "INT_MAX = 2147483647\n50000 * 50000 = 2500000000\nfits in int? no\n0u - 1 = 4294967295\n",
      notes: [
        { line: 7, text: "Converting `a` first makes the whole multiplication 64-bit." },
        { line: 10, text: "2.5 billion is larger than INT_MAX, so it would overflow an int." },
        { line: 12, text: "Unsigned values wrap around — this one is well defined." },
      ],
    },
    quickCheck: {
      prompt: "`vector<int> v;` is empty. What is `v.size() - 1`?",
      options: [
        { id: "a", text: "A huge positive number", feedback: "Yes — size() is unsigned, so 0 − 1 wraps around." },
        { id: "b", text: "-1", feedback: "Only if converted to a signed type first: `(int)v.size() - 1`." },
        { id: "c", text: "A compile error", feedback: "It compiles (maybe with a warning) — which is what makes it dangerous." },
      ],
      correct: "a",
      explanation: "size_t is unsigned, so subtracting below zero wraps to its largest value.",
    },
    exercise: {
      title: "Will it fit in an int?",
      prompt: `Read two whole numbers a and b (each between −1 000 000 000 and 1 000 000 000). Print their exact product on the first line, and \`fits\` or \`too big\` on the second, depending on whether the product fits in an \`int\` (between \`INT_MIN\` and \`INT_MAX\`).`,
      starterCode: r`#include <iostream>
#include <climits>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    int product = a * b;
    cout << product << endl;
    // print fits or too big

    return 0;
}`,
      tests: [
        { label: "small", input: "1000 2000\n", output: "2000000\nfits", visibility: "sample", category: "normal" },
        { label: "big", input: "100000 100000\n", output: "10000000000\ntoo big", visibility: "sample", category: "normal" },
        { label: "exactly INT_MAX", input: "2147483647 1\n", output: "2147483647\nfits", visibility: "hidden", category: "boundary" },
        { label: "negative edge", input: "-2147483648 1\n", output: "-2147483648\nfits", visibility: "hidden", category: "boundary" },
        { label: "negative too big", input: "-1000000000 3\n", output: "-3000000000\ntoo big", visibility: "hidden", category: "edge" },
      ],
      compare: "lines",
      hints: [
        "Which type can hold the exact product of two numbers up to 10⁹?",
        "`int * int` overflows before you can check anything.",
        "Compute `long long product = (long long)a * b;`.",
        "Then compare with INT_MIN and INT_MAX.",
      ],
      solution: r`#include <iostream>
#include <climits>
using namespace std;

int main() {
    long long a, b;
    cin >> a >> b;
    long long product = a * b;
    cout << product << endl;
    cout << (product >= INT_MIN && product <= INT_MAX ? "fits" : "too big") << endl;
    return 0;
}`,
      solutionNotes: "Computing in long long gives the true product; only then can you check the int range. Checking after an int multiplication is too late — it already overflowed.",
    },
    practice: practice(
      {
        title: "The countdown that never ends",
        prompt: `This program should print a list in reverse, but it crashes: the loop condition is always true. Run it and see. Fix it so it prints the numbers in reverse order (or nothing for an empty list).`,
        starterCode: r`#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> v(n);
    for (auto& x : v) cin >> x;
    for (size_t i = v.size() - 1; i >= 0; i--) {
        cout << v[i] << " ";
    }
    cout << endl;
    return 0;
}`,
        tests: [
          T("sample", "4\n1 2 3 4\n", "4 3 2 1", "sample"),
          T("one", "1\n9\n", "9", "visible", "boundary"),
          T("empty", "0\n", "", "hidden", "edge"),
          T("negatives", "3\n-1 0 -5\n", "-5 0 -1", "hidden"),
        ],
        hints: [
          "Can a `size_t` ever be less than 0?",
          "So `i >= 0` is always true — when i reaches 0, `i--` wraps to a huge number.",
          "Use a signed index: `for (int i = (int)v.size() - 1; i >= 0; i--)`.",
          "An empty vector must print nothing — a signed index handles that too (it starts at -1).",
        ],
        solution: r`#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> v(n);
    for (auto& x : v) cin >> x;
    for (int i = (int)v.size() - 1; i >= 0; i--) {
        cout << v[i] << " ";
    }
    cout << endl;
    return 0;
}`,
        solutionNotes: "With a signed index, `i >= 0` really can become false. In the starter, after printing v[0], `i--` wrapped to about 1.8 × 10¹⁹ and `v[i]` read far outside the vector — undefined behaviour that usually crashes.",
      },
      {
        title: "How far can factorial go?",
        prompt: `Read numbers n (0 ≤ n ≤ 30) until the input ends. For each, print n! if it fits in an \`unsigned long long\`, otherwise \`overflow\`. Detect overflow **before** multiplying: \`result * i\` overflows exactly when \`result > ULLONG_MAX / i\`.`,
        starterCode: starter("For each n, multiply step by step, checking result > ULLONG_MAX / i first", "int n;", ["iostream", "climits"]),
        tests: [
          T("small", "0 1 5 10\n", "1\n1\n120\n3628800", "sample"),
          T("largest that fits", "20\n", "2432902008176640000", "visible", "boundary"),
          T("first too big", "21\n", "overflow", "hidden", "boundary"),
          T("far too big", "30\n", "overflow", "hidden", "edge"),
        ],
        compare: "lines",
        hints: [
          "Start with `unsigned long long result = 1;`.",
          "For i from 2 to n: check `result > ULLONG_MAX / i` before multiplying.",
          "If it would overflow, remember that and stop.",
          "0! and 1! are both 1.",
        ],
        solution: r`#include <iostream>
#include <climits>
using namespace std;

int main() {
    int n;
    while (cin >> n) {
        unsigned long long result = 1;
        bool overflow = false;
        for (int i = 2; i <= n; i++) {
            if (result > ULLONG_MAX / i) {
                overflow = true;
                break;
            }
            result *= i;
        }
        if (overflow) cout << "overflow" << endl;
        else cout << result << endl;
    }
    return 0;
}`,
        solutionNotes: "Dividing the limit by i asks \"would multiplying by i go past the maximum?\" without ever going past it. 20! is the largest factorial that fits in 64 bits.",
      },
    ),
    explainAgain: `An integer variable is like a car's odometer with a fixed number of digits. Drive past 999999 and it rolls over to 000000 — no warning. For unsigned numbers that roll-over is the official rule; for signed numbers it's undefined, which is worse. The fix is to use a bigger odometer (long long) or check before you drive past the end.`,
    summary: [
      "`int` holds about ±2.1 × 10⁹; `long long` about ±9.2 × 10¹⁸.",
      "Convert before multiplying: `(long long)a * b`.",
      "`size()` is unsigned: `v.size() - 1` and `i >= 0` with size_t are classic traps.",
    ],
  },

  {
    id: "floating-point",
    moduleId: "variables-io",
    after: "overflow-signed",
    title: "Floating-point precision",
    minutes: 15,
    concepts: ["double", "precision", "epsilon", "setprecision"],
    goals: [
      "Understand why `0.1 + 0.2` isn't exactly `0.3`",
      "Compare doubles with a tolerance instead of `==`",
      "Control how many decimals are printed, and keep money exact with integers",
    ],
    intro: `\`double\` stores numbers in binary with about 15–16 significant digits. Most decimal fractions — like 0.1 — can't be stored exactly, so tiny errors creep in. They rarely matter, but they matter a lot when you compare with \`==\` or add up money.`,
    sections: [
      {
        title: "Why 0.1 + 0.2 != 0.3",
        body: `Just as 1/3 can't be written exactly in decimal (0.3333…), 1/10 can't be written exactly in binary. So:

\`\`\`cpp
double x = 0.1 + 0.2;
cout << (x == 0.3);                       // 0 (false)!
cout << setprecision(17) << x;            // 0.30000000000000004
\`\`\``,
      },
      {
        title: "Compare with a tolerance",
        body: `Instead of \`a == b\`, ask whether they're *close enough*:

\`\`\`cpp
const double EPS = 1e-9;
if (fabs(a - b) < EPS) { /* equal for our purposes */ }
\`\`\`

Choose EPS to suit the size of your numbers.`,
      },
      {
        title: "Printing and money",
        body: `\`cout << fixed << setprecision(2) << x;\` always shows 2 decimals (rounded). Without \`fixed\`, \`setprecision(n)\` means *n significant digits*.

For money, don't add up doubles: store **paise** (or cents) in a \`long long\`, and convert only when printing:

\`\`\`cpp
long long paise = llround(price * 100);
\`\`\``,
      },
    ],
    mistakes: [
      { title: "Using == on doubles", body: "Results of calculations are rarely bit-for-bit equal. Compare with a tolerance." },
      { title: "Summing money in double", body: "Errors accumulate over many additions. Count in integer paise." },
      { title: "Integer division sneaking in", body: "`double avg = sum / n;` with int sum and n divides as integers first. Write `(double)sum / n`." },
    ],
    example: {
      title: "Seeing the error",
      intro: "The same value printed different ways, and a safe comparison.",
      code: r`#include <iostream>
#include <iomanip>
#include <cmath>
using namespace std;

int main() {
    double x = 0.1 + 0.2;
    cout << x << endl;
    cout << setprecision(17) << x << endl;
    cout << (x == 0.3 ? "equal" : "not equal") << endl;
    cout << (fabs(x - 0.3) < 1e-9 ? "close enough" : "different") << endl;
    cout << fixed << setprecision(2) << x << endl;
    return 0;
}`,
      output: "0.3\n0.30000000000000004\nnot equal\nclose enough\n0.30\n",
      notes: [
        { line: 8, text: "Default printing shows 6 significant digits, which hides the error." },
        { line: 9, text: "With 17 significant digits you can see it." },
        { line: 11, text: "A tolerance comparison treats them as equal." },
      ],
    },
    quickCheck: {
      prompt: "How should you check whether two computed doubles `a` and `b` are equal?",
      options: [
        { id: "a", text: "`fabs(a - b) < 1e-9`", feedback: "Yes — a tolerance absorbs the tiny rounding errors." },
        { id: "b", text: "`a == b`", feedback: "Rounding errors usually make this false even when the maths says they're equal." },
        { id: "c", text: "`(int)a == (int)b`", feedback: "That throws away the fraction: 2.1 and 2.9 would count as equal." },
      ],
      correct: "a",
      explanation: "Floating-point results carry tiny errors, so compare them with a tolerance.",
    },
    exercise: {
      title: "Equal within a tolerance",
      prompt: `Read three numbers \`a\`, \`b\` and \`eps\`. Print \`equal\` if a and b differ by **less than** eps, otherwise \`different\`, and then the absolute difference with 6 decimal places.`,
      starterCode: r`#include <iostream>
#include <iomanip>
#include <cmath>
using namespace std;

int main() {
    double a, b, eps;
    cin >> a >> b >> eps;
    // compare with a tolerance and print the difference

    return 0;
}`,
      tests: [
        { label: "close", input: "0.3 0.30000001 0.000001\n", output: "equal\n0.000000", visibility: "sample", category: "normal" },
        { label: "far", input: "1.5 1.6 0.01\n", output: "different\n0.100000", visibility: "sample", category: "normal" },
        { label: "identical", input: "2 2 0.5\n", output: "equal\n0.000000", visibility: "hidden", category: "edge" },
        { label: "order doesn't matter", input: "10 9.99 0.1\n", output: "equal\n0.010000", visibility: "hidden", category: "edge" },
      ],
      compare: "lines",
      hints: [
        "The distance between two numbers is the absolute value of their difference.",
        "`fabs(a - b)` from `<cmath>`.",
        "Compare it with eps using `<`.",
        "Print the difference with `fixed << setprecision(6)`.",
      ],
      solution: r`#include <iostream>
#include <iomanip>
#include <cmath>
using namespace std;

int main() {
    double a, b, eps;
    cin >> a >> b >> eps;
    double diff = fabs(a - b);
    cout << (diff < eps ? "equal" : "different") << endl;
    cout << fixed << setprecision(6) << diff << endl;
    return 0;
}`,
      solutionNotes: "`fabs` makes the order of a and b irrelevant. The tolerance is the program's definition of \"equal enough\".",
    },
    practice: practice(
      {
        title: "Exact money in paise",
        prompt: `Read \`n\` item prices (each with at most 2 decimals, like \`19.99\`). Add them up **in paise** using a \`long long\` (convert each price with \`llround(price * 100)\`), and print the total as rupees with exactly 2 decimals.`,
        starterCode: starter("Convert each price to paise with llround, add as long long, print rupees.paise", "int n;\ncin >> n;", ["iostream", "iomanip", "cmath"]),
        tests: [
          T("sample", "3\n0.10\n0.20\n0.30\n", "0.60", "sample"),
          T("many dimes", "10\n0.1\n0.1\n0.1\n0.1\n0.1\n0.1\n0.1\n0.1\n0.1\n0.1\n", "1.00", "visible", "edge"),
          T("prices", "2\n19.99\n5.01\n", "25.00", "hidden"),
          T("none", "0\n", "0.00", "hidden", "edge"),
        ],
        hints: [
          "llround(19.99 * 100) gives exactly 1999.",
          "Add the paise into a long long.",
          "Rupees = total / 100, paise = total % 100.",
          "Print paise with two digits: setw(2) << setfill('0').",
        ],
        solution: r`#include <iostream>
#include <iomanip>
#include <cmath>
using namespace std;

int main() {
    int n;
    cin >> n;
    long long paise = 0;
    for (int i = 0; i < n; i++) {
        double price;
        cin >> price;
        paise += llround(price * 100);
    }
    cout << paise / 100 << "." << setw(2) << setfill('0') << paise % 100 << endl;
    return 0;
}`,
        solutionNotes: "Rounding each price to whole paise once, then adding integers, can't accumulate error — ten 0.1s give exactly 1.00.",
      },
      {
        title: "Roots of a quadratic",
        prompt: `Read a, b, c (a ≠ 0) for ax² + bx + c = 0. Print:

- \`two roots X1 X2\` (smaller first) if the discriminant is positive,
- \`one root X\` if it's zero (treat |discriminant| < 1e-9 as zero),
- \`no real roots\` otherwise.

Print roots with 3 decimals.`,
        starterCode: starter("Compute the discriminant and print the roots with 3 decimals", "double a, b, c;\ncin >> a >> b >> c;", ["iostream", "iomanip", "cmath", "algorithm"]),
        tests: [
          T("two", "1 -3 2\n", "two roots 1.000 2.000", "sample"),
          T("one", "1 2 1\n", "one root -1.000", "sample"),
          T("none", "1 0 1\n", "no real roots", "hidden", "edge"),
          T("decimals", "2 -1 -1\n", "two roots -0.500 1.000", "hidden"),
          T("negative a", "-1 0 4\n", "two roots -2.000 2.000", "hidden", "edge"),
        ],
        compare: "lines",
        hints: [
          "The discriminant is b² − 4ac.",
          "Compare it with a tolerance for the zero case.",
          "Roots: (−b ± √d) / (2a). With negative a, the + root may be the smaller one.",
          "Use min/max to order them before printing.",
        ],
        solution: r`#include <iostream>
#include <iomanip>
#include <cmath>
#include <algorithm>
using namespace std;

int main() {
    double a, b, c;
    cin >> a >> b >> c;
    double d = b * b - 4 * a * c;
    cout << fixed << setprecision(3);
    if (fabs(d) < 1e-9) {
        cout << "one root " << -b / (2 * a) << endl;
    } else if (d < 0) {
        cout << "no real roots" << endl;
    } else {
        double r1 = (-b - sqrt(d)) / (2 * a);
        double r2 = (-b + sqrt(d)) / (2 * a);
        cout << "two roots " << min(r1, r2) << " " << max(r1, r2) << endl;
    }
    return 0;
}`,
        solutionNotes: "The zero case uses a tolerance because a computed discriminant may come out as 1e-17 instead of 0. Sorting the roots handles a negative a.",
      },
    ),
    explainAgain: `A double is like a ruler with very fine — but not infinitely fine — markings. 0.1 falls between two markings, so it's stored as the nearest one. Usually you can't see the difference, but asking "is it *exactly* on 0.3?" can fail. So ask "is it within a hair of 0.3?" instead, and count money in whole paise.`,
    summary: [
      "Most decimal fractions aren't exact in binary: `0.1 + 0.2 != 0.3`.",
      "Compare doubles with `fabs(a - b) < EPS`.",
      "`fixed << setprecision(2)` for display; integer paise for money.",
    ],
  },

  {
    id: "validating-input",
    moduleId: "variables-io",
    after: "floating-point",
    title: "Validating input",
    minutes: 15,
    concepts: ["cin.fail", "cin.clear", "input validation"],
    goals: [
      "Detect when `cin >>` fails to read a number",
      "Recover with `cin.clear()` and skip the bad input",
      "Check ranges and formats before trusting a value",
    ],
    intro: `Users type the unexpected: letters where you wanted a number, 500 for a percentage, nothing at all. A robust program checks every value and recovers instead of looping forever or computing nonsense.`,
    sections: [
      {
        title: "When >> fails",
        body: `If the next text isn't a valid number, \`cin >> x\` **fails**: x is set to 0, the bad text stays in the input, and the stream enters a *fail state* — every later read fails too.

\`\`\`cpp
int x;
if (!(cin >> x)) {
    // reading failed (bad text or end of input)
}
\`\`\``,
      },
      {
        title: "Recovering",
        body: `\`\`\`cpp
cin.clear();                 // 1. leave the fail state
string junk;
cin >> junk;                 // 2. throw away the bad word
// or: cin.ignore(numeric_limits<streamsize>::max(), '\\n');  — throw away the line
\`\`\`

Forgetting either step gives the famous infinite loop: the same bad word is read and rejected forever.`,
      },
      {
        title: "Check ranges and formats",
        body: `A value can be a valid number and still be wrong: a mark of 150, a month of 13. Validate after reading:

\`\`\`cpp
if (mark < 0 || mark > 100) { /* reject */ }
\`\`\`

For structured text (dates, codes), read it as a string first and check each part.`,
      },
    ],
    mistakes: [
      { title: "Not clearing the fail state", body: "Until `cin.clear()` is called, every read fails immediately." },
      { title: "Not removing the bad text", body: "After clear(), the bad text is still there; the next `>>` fails on it again." },
      { title: "Trusting the range", body: "Reading succeeded doesn't mean the value makes sense. Check it." },
    ],
    example: {
      title: "Skipping bad entries",
      intro: "Run with the input `7 abc 12 x9 3`. Words that aren't numbers are skipped.",
      code: r`#include <iostream>
#include <string>
using namespace std;

int main() {
    int x, sum = 0, bad = 0;
    while (true) {
        if (cin >> x) {
            sum += x;
        } else if (cin.eof()) {
            break;
        } else {
            cin.clear();
            string junk;
            cin >> junk;
            bad++;
        }
    }
    cout << "sum " << sum << ", skipped " << bad << endl;
    return 0;
}`,
      input: "7 abc 12 x9 3\n",
      output: "sum 22, skipped 2\n",
      notes: [
        { line: 8, text: "A successful read returns true." },
        { line: 10, text: "At the end of the input, stop." },
        { line: 13, text: "Otherwise: clear the fail state and discard the bad word." },
      ],
    },
    quickCheck: {
      prompt: "`cin >> x` just failed on the text `abc`. You call `cin >> x` again straight away. What happens?",
      options: [
        { id: "a", text: "It fails again immediately", feedback: "Right — the stream is still in its fail state, and `abc` is still waiting." },
        { id: "b", text: "It skips `abc` and reads the next number", feedback: "Not without `cin.clear()` and discarding `abc` first." },
        { id: "c", text: "The program crashes", feedback: "No crash — just failed reads, which is why programs loop forever." },
      ],
      correct: "a",
      explanation: "A failed stream stays failed until cleared, and the bad text stays in the input until removed.",
    },
    exercise: {
      title: "Ask until it's a valid percentage",
      prompt: `Read entries until one is a whole number from **0 to 100**. Entries may be words or numbers out of range. Print the valid number and how many invalid entries came before it. If the input ends without a valid entry, print \`none\` and the count.

| Input | Output |
| --- | --- |
| \`abc 500 -3 42\` | \`42 3\` |`,
      starterCode: r`#include <iostream>
#include <string>
using namespace std;

int main() {
    int x;
    int invalid = 0;
    // Keep reading until a number from 0 to 100 appears

    return 0;
}`,
      tests: [
        { label: "sample", input: "abc 500 -3 42\n", output: "42 3", visibility: "sample", category: "normal" },
        { label: "first is valid", input: "0\n", output: "0 0", visibility: "hidden", category: "boundary" },
        { label: "boundary 100", input: "101 100\n", output: "100 1", visibility: "hidden", category: "boundary" },
        { label: "never valid", input: "x y 1000\n", output: "none 3", visibility: "hidden", category: "edge" },
        { label: "mixed text", input: "12abc 50\n", output: "12 0", visibility: "hidden", category: "edge" },
      ],
      compare: "tokens",
      hints: [
        "Loop forever; inside, try `cin >> x`.",
        "If it succeeded and 0 <= x <= 100, print and stop.",
        "If it succeeded but out of range, count it and continue.",
        "If it failed: at end of input print none; otherwise clear(), discard the word, count it.",
      ],
      solution: r`#include <iostream>
#include <string>
using namespace std;

int main() {
    int x;
    int invalid = 0;
    while (true) {
        if (cin >> x) {
            if (x >= 0 && x <= 100) {
                cout << x << " " << invalid << endl;
                return 0;
            }
            invalid++;
        } else if (cin.eof()) {
            cout << "none " << invalid << endl;
            return 0;
        } else {
            cin.clear();
            string junk;
            cin >> junk;
            invalid++;
        }
    }
}`,
      solutionNotes: "Three outcomes per read: a good number, a number out of range, or no number at all. Note `12abc`: `>>` happily reads 12 and leaves `abc` — reading a whole word and checking it (next practice) is stricter.",
    },
    practice: practice(
      {
        title: "Strict integers only",
        prompt: `Read words until the input ends. A word counts as a valid integer only if **all** of it is: an optional \`-\` followed by 1–9 digits. Print the sum of the valid ones and how many words were invalid. (\`12abc\` is invalid here.)`,
        starterCode: starter("Read each word as a string and check every character", "string w;\nlong long sum = 0;\nint invalid = 0;", ["iostream", "string", "cctype"]),
        tests: [
          T("sample", "10 12abc -5 x 7\n", "12 2", "sample"),
          T("only a minus", "- 3\n", "3 1", "visible", "edge"),
          T("too many digits", "1234567890 1\n", "1 1", "hidden", "edge"),
          T("nothing valid", "a b c\n", "0 3", "hidden", "edge"),
          T("negatives", "-1 -2 -3\n", "-6 0", "hidden"),
        ],
        hints: [
          "Read with `while (cin >> w)` — every word, valid or not.",
          "Skip a leading '-' if present, then require 1 to 9 characters, all digits.",
          "isdigit checks one character.",
          "Valid → stoll(w) and add; otherwise invalid++.",
        ],
        solution: r`#include <iostream>
#include <string>
#include <cctype>
using namespace std;

bool isInteger(const string& w) {
    size_t start = (!w.empty() && w[0] == '-') ? 1 : 0;
    size_t digits = w.size() - start;
    if (digits < 1 || digits > 9) return false;
    for (size_t i = start; i < w.size(); i++) {
        if (!isdigit(static_cast<unsigned char>(w[i]))) return false;
    }
    return true;
}

int main() {
    string w;
    long long sum = 0;
    int invalid = 0;
    while (cin >> w) {
        if (isInteger(w)) sum += stoll(w);
        else invalid++;
    }
    cout << sum << " " << invalid << endl;
    return 0;
}`,
        solutionNotes: "Reading words as strings never puts cin into a fail state, and checking every character rejects partial numbers like `12abc` that `>>` would accept.",
      },
      {
        title: "Is this a real date?",
        prompt: `Read lines until the input ends, each meant to be a date \`DD/MM/YYYY\`. Print \`valid\`, or the first problem found: \`bad format\` (not exactly 2 digits / 2 digits / 4 digits), \`bad month\` (not 1–12) or \`bad day\` (not possible in that month — February has 29 days in leap years).`,
        starterCode: starter("Check the format, then the month, then the day", "string line;", ["iostream", "string", "cctype"]),
        tests: [
          T("sample", "15/08/1947\n31/04/2024\n29/02/2023\n", "valid\nbad day\nbad day", "sample"),
          T("leap day", "29/02/2024\n", "valid", "visible", "edge"),
          T("month 13", "01/13/2020\n", "bad month", "hidden", "edge"),
          T("format", "1/1/2020\n12-12-2012\n", "bad format\nbad format", "hidden", "edge"),
          T("1900 not leap, 2000 leap", "29/02/1900\n29/02/2000\n", "bad day\nvalid", "hidden", "edge"),
          T("day zero", "00/05/2020\n", "bad day", "hidden", "edge"),
        ],
        compare: "lines",
        hints: [
          "Format first: length 10, '/' at positions 2 and 5, digits everywhere else.",
          "Then stoi(line.substr(0, 2)) etc. for day, month and year.",
          "Days per month: 31,28,31,30,31,30,31,31,30,31,30,31, with 29 for February in a leap year.",
          "Leap: (y % 4 == 0 && y % 100 != 0) || y % 400 == 0.",
        ],
        solution: r`#include <iostream>
#include <string>
#include <cctype>
using namespace std;

string check(const string& s) {
    if (s.size() != 10 || s[2] != '/' || s[5] != '/') return "bad format";
    for (int i = 0; i < 10; i++) {
        if (i == 2 || i == 5) continue;
        if (!isdigit(static_cast<unsigned char>(s[i]))) return "bad format";
    }
    int d = stoi(s.substr(0, 2)), m = stoi(s.substr(3, 2)), y = stoi(s.substr(6, 4));
    if (m < 1 || m > 12) return "bad month";
    int days[] = {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
    bool leap = (y % 4 == 0 && y % 100 != 0) || y % 400 == 0;
    int maxDay = days[m - 1] + (m == 2 && leap ? 1 : 0);
    if (d < 1 || d > maxDay) return "bad day";
    return "valid";
}

int main() {
    string line;
    while (getline(cin, line)) {
        if (line.empty()) continue;
        cout << check(line) << endl;
    }
    return 0;
}`,
        solutionNotes: "Validate in layers — shape, then each field, then fields that depend on each other (day depends on month and year). Each layer can assume the earlier ones passed.",
      },
    ),
    explainAgain: `Reading input is like a shop accepting coins. If someone hands over a button, the till jams (fail state) until you reset it (\`clear\`) and remove the button (discard the word). And a real coin can still be the wrong value — so check the amount too.`,
    summary: [
      "`if (cin >> x)` tells you whether a number was actually read.",
      "Recover with `cin.clear()` and discarding the bad text.",
      "Check ranges and formats; read as strings for strict validation.",
    ],
  },
];
