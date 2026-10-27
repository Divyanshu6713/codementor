import type { CourseLesson } from "./types";

const r = String.raw;

/**
 * Module 6 — Functions and recursion. Builds on loops: students already repeat work; now they name
 * it, pass values in and out, and finally let a function call itself.
 */
export const FUNCTIONS_LESSONS: CourseLesson[] = [
  {
    id: "functions-intro",
    moduleId: "functions",
    title: "Functions: name a job, reuse it",
    minutes: 15,
    concepts: ["function", "call", "void", "declaration", "definition"],
    goals: [
      "What a function is and why programs are split into them",
      "Defining a function and calling it from `main`",
      "Declarations (prototypes) versus definitions",
    ],
    intro: `You already use a function in every program: \`main\`. A **function** is a named block of code that does one job. Write it once, then **call** it by name whenever you need that job done — instead of copying the same lines again and again.`,
    sections: [
      {
        title: "Defining and calling",
        body: `\`\`\`cpp
void printLine() {          // definition: return type, name, (parameters), body
    cout << "----------" << endl;
}

int main() {
    printLine();            // call: the name followed by ()
    printLine();
}
\`\`\`

- \`void\` means the function **doesn't give back a value** — it just does something.
- The **body** between \`{ }\` runs every time the function is called.
- A call needs the parentheses: \`printLine();\`. Without them nothing runs.`,
      },
      {
        title: "What happens during a call",
        body: `When \`main\` reaches \`printLine();\`:

1. \`main\` **pauses** at that line.
2. The program jumps into \`printLine\` and runs its body from the top.
3. At the closing \`}\` (or a \`return\`) it jumps **back** to \`main\`, right after the call.

So a function call is a detour: go and do the job, then come back exactly where you left off.`,
      },
      {
        title: "Declare before you use",
        body: `C++ reads your file from top to bottom, so a function must be **known** before it is called. Either define it above \`main\`, or put a **declaration** (a *prototype*) above \`main\` and the full definition below:

\`\`\`cpp
void printLine();           // declaration: promises the function exists

int main() {
    printLine();
}

void printLine() {          // definition: the actual body
    cout << "----------" << endl;
}
\`\`\`

The declaration is just the first line followed by \`;\`.`,
      },
    ],
    mistakes: [
      { title: "Forgetting the parentheses", body: "`printLine;` names the function but doesn't call it — nothing happens (the compiler may only warn). A call always needs `()`: `printLine();`." },
      { title: "Calling before it's declared", body: "If the definition is below `main` and there's no prototype above, the compiler stops with \"was not declared in this scope\". Move the function up or add a declaration." },
      { title: "Defining a function inside main", body: "Functions are written side by side at the top level, never inside another function's braces." },
    ],
    example: {
      title: "A reusable divider",
      intro: "The same divider line is printed twice without repeating the `cout` code.",
      code: r`#include <iostream>
using namespace std;

void printLine() {
    cout << "----------" << endl;
}

int main() {
    printLine();
    cout << "Scoreboard" << endl;
    printLine();
    return 0;
}`,
      output: "----------\nScoreboard\n----------\n",
      notes: [
        { line: 4, text: "`void`: the function does a job but gives nothing back." },
        { line: 9, text: "First call: jump into `printLine`, print the line, come back here." },
        { line: 11, text: "Second call: the same code runs again — written once, used twice." },
      ],
    },
    quickCheck: {
      prompt: "How many times is `Hi` printed?",
      code: r`void hi() { cout << "Hi "; }

int main() {
    for (int i = 0; i < 3; i++) {
        hi();
    }
    hi();
}`,
      options: [
        { id: "a", text: "1", feedback: "`hi` is called inside the loop too, not only once at the end." },
        { id: "b", text: "3", feedback: "Don't forget the extra call after the loop." },
        { id: "c", text: "4", feedback: "Yes: three calls from the loop (i = 0, 1, 2) plus one after it." },
      ],
      correct: "c",
      explanation: "Every `hi();` runs the body once: three times in the loop, then once more after it.",
    },
    exercise: {
      title: "Draw a box",
      prompt: `Read two whole numbers \`w\` and \`h\`. Print a rectangle of \`#\` characters that is \`w\` wide and \`h\` tall.

Write a function \`printRow(int w)\` that prints **one** row (\`w\` hash signs, then a new line), and call it \`h\` times from \`main\`.`,
      starterCode: r`#include <iostream>
using namespace std;

// Write printRow here: it prints w '#' characters, then a new line.

int main() {
    int w, h;
    cin >> w >> h;
    // Call printRow h times.

    return 0;
}`,
      tests: [
        { label: "3 wide, 2 tall", input: "3 2\n", output: "###\n###", visibility: "sample", category: "normal" },
        { label: "5 wide, 1 tall", input: "5 1\n", output: "#####", visibility: "sample", category: "boundary" },
        { label: "1 wide, 4 tall", input: "1 4\n", output: "#\n#\n#\n#", visibility: "hidden", category: "boundary" },
        { label: "4 wide, 3 tall", input: "4 3\n", output: "####\n####\n####", visibility: "hidden", category: "normal" },
      ],
      compare: "lines",
      hints: [
        "Which part of the rectangle repeats — and which part repeats inside that?",
        "A function can contain a loop. `printRow` needs a loop of `w` steps; `main` needs a loop of `h` calls.",
        "Write `void printRow(int w)` above `main`. Inside: a for loop printing `#`, then `cout << endl;` after the loop.",
        "In `main`: `for (int i = 0; i < h; i++) { printRow(w); }`. The new line belongs at the end of `printRow`, after its loop.",
      ],
      solution: r`#include <iostream>
using namespace std;

void printRow(int w) {
    for (int i = 0; i < w; i++) {
        cout << '#';
    }
    cout << endl;
}

int main() {
    int w, h;
    cin >> w >> h;
    for (int i = 0; i < h; i++) {
        printRow(w);
    }
    return 0;
}`,
      solutionNotes: "`printRow` owns the inner job (one row); `main` decides how many rows. Each call gets its own `i`, so the two loops don't interfere.",
    },
    explainAgain: `Think of a recipe book. Instead of writing "how to make dough" inside every recipe, you write it once on its own page titled *Dough*. Each recipe then just says "make the dough (see page 12)". You turn to that page, follow it, and come back to where you were.

A function is that page: \`printLine\` is the title, the body is the steps, and \`printLine();\` is "see page 12".`,
    summary: [
      "A function is a named block of code; `name();` runs it.",
      "A call jumps into the function and comes back to the line after the call.",
      "Define a function above `main`, or declare a prototype above and define it below.",
    ],
  },

  {
    id: "parameters-return",
    moduleId: "functions",
    title: "Parameters and return values",
    minutes: 20,
    concepts: ["parameter", "argument", "return", "bool function"],
    goals: [
      "Passing values into a function with parameters",
      "Sending a result back with `return`",
      "The difference between returning a value and printing it",
    ],
    intro: `A function becomes much more useful when you can **give it values to work with** and **get an answer back** — just like \`sqrt(16)\` takes 16 and gives back 4.`,
    sections: [
      {
        title: "Parameters and arguments",
        body: `\`\`\`cpp
int square(int x) {        // x is a PARAMETER: a variable the function receives
    return x * x;
}

int main() {
    cout << square(7);     // 7 is the ARGUMENT: the value passed in
}
\`\`\`

The **parameter** \`x\` is a local variable that starts out holding the **argument** from the call. Several parameters are separated by commas: \`int maxOf(int a, int b)\`.`,
      },
      {
        title: "return hands back an answer",
        body: `The type before the name (\`int\` above) says what kind of value comes back. \`return value;\` does two things:

1. sends \`value\` back to the caller, and
2. **ends the function immediately** — nothing after it runs.

The call itself becomes that value, so you can print it, store it (\`int s = square(7);\`) or use it inside a bigger expression (\`square(3) + square(4)\`).`,
      },
      {
        title: "Returning is not printing",
        body: `\`return\` gives a value to **the code that called the function**. It doesn't show anything on the screen. Only \`cout\` prints.

A function that computes something should usually \`return\` it and let the caller decide what to do — print it, compare it, or pass it on. That keeps the function reusable.`,
      },
    ],
    mistakes: [
      { title: "Printing instead of returning", body: "If `square` does `cout << x * x;` instead of `return`, then `int s = square(7);` gets nothing useful — and the compiler warns that a non-void function has no return." },
      { title: "Ignoring the returned value", body: "`square(7);` on its own line computes 49 and throws it away. Store it or print it: `cout << square(7);`." },
      { title: "Code after return", body: "Lines after a `return` in the same block never run. If a function has several paths, every path needs its own `return`." },
    ],
    example: {
      title: "The larger of two",
      intro: "`maxOf` returns whichever argument is bigger. Notice the call nested inside another call.",
      code: r`#include <iostream>
using namespace std;

int maxOf(int a, int b) {
    if (a > b) {
        return a;
    }
    return b;
}

int main() {
    cout << maxOf(3, 9) << endl;
    cout << maxOf(10, -2) << endl;
    int best = maxOf(maxOf(4, 7), 5);
    cout << best << endl;
    return 0;
}`,
      output: "9\n10\n7\n",
      notes: [
        { line: 4, text: "Two parameters, `a` and `b`; the result is an `int`." },
        { line: 6, text: "`return a;` ends the function right here when `a` is bigger." },
        { line: 14, text: "The inner call gives 7, so this is `maxOf(7, 5)`, which is 7." },
      ],
    },
    quickCheck: {
      prompt: "What does this program print?",
      code: r`int twice(int x) {
    return x * 2;
}

int main() {
    twice(5);
    cout << "done";
}`,
      options: [
        { id: "a", text: "10done", feedback: "`return` sends 10 back to `main`, but `main` doesn't print it." },
        { id: "b", text: "done", feedback: "Right: the 10 is returned and thrown away. Only `cout` prints." },
        { id: "c", text: "10", feedback: "`return` doesn't print, and `done` is still printed afterwards." },
      ],
      correct: "b",
      explanation: "`twice(5)` returns 10 to `main`, which ignores it. The only output is `done`.",
    },
    exercise: {
      title: "Prime checker",
      prompt: `Write a function \`bool isPrime(int n)\` that returns \`true\` when \`n\` is a prime number and \`false\` otherwise. (A prime is a whole number **greater than 1** whose only divisors are 1 and itself; 0 and 1 are not prime.)

The input starts with a count \`q\`, followed by \`q\` numbers. \`main\` is already written: it prints \`yes\` or \`no\` for each number using your function.`,
      starterCode: r`#include <iostream>
using namespace std;

bool isPrime(int n) {
    // Return true when n is prime, false otherwise.
    return false;
}

int main() {
    int q;
    cin >> q;
    for (int i = 0; i < q; i++) {
        int n;
        cin >> n;
        if (isPrime(n)) {
            cout << "yes" << endl;
        } else {
            cout << "no" << endl;
        }
    }
    return 0;
}`,
      tests: [
        { label: "2, 9, 13, 1", input: "4\n2 9 13 1\n", output: "yes\nno\nyes\nno", visibility: "sample", category: "normal" },
        { label: "97, 100, 0", input: "3\n97 100 0\n", output: "yes\nno\nno", visibility: "hidden", category: "edge" },
        { label: "just 2", input: "1\n2\n", output: "yes", visibility: "hidden", category: "boundary" },
        { label: "squares of primes", input: "5\n3 4 25 29 49\n", output: "yes\nno\nno\nyes\nno", visibility: "hidden", category: "boundary" },
      ],
      compare: "tokens",
      hints: [
        "What does it mean for some number `d` to divide `n` exactly?",
        "`n % d == 0` means `d` divides `n`. Prime means no `d` from 2 up to `n - 1` divides it.",
        "Handle `n < 2` first (return false). Then loop `d` from 2 and return false as soon as one divides `n`.",
        "If the loop finishes without finding a divisor, return true. You only need to try `d` while `d * d <= n` — that also makes it fast.",
      ],
      solution: r`#include <iostream>
using namespace std;

bool isPrime(int n) {
    if (n < 2) {
        return false;
    }
    for (int d = 2; d * d <= n; d++) {
        if (n % d == 0) {
            return false;
        }
    }
    return true;
}

int main() {
    int q;
    cin >> q;
    for (int i = 0; i < q; i++) {
        int n;
        cin >> n;
        if (isPrime(n)) {
            cout << "yes" << endl;
        } else {
            cout << "no" << endl;
        }
    }
    return 0;
}`,
      solutionNotes: "Return early: `false` as soon as a divisor is found, `true` only after none was found. Checking `d * d <= n` is enough because any divisor larger than √n pairs with one smaller than √n.",
    },
    explainAgain: `A function is like a vending machine. You **put something in** (the arguments: coins and a button number) and **something comes out** (the return value: a drink).

The machine doesn't drink it for you — it hands the drink to you, and you decide what to do with it. In the same way, \`return\` hands a value back; printing it is the caller's choice.`,
    summary: [
      "Parameters receive values from the call's arguments.",
      "`return value;` sends the result back and ends the function.",
      "Returning is not printing — the caller decides what to do with the value.",
    ],
  },

  {
    id: "pass-by-reference",
    moduleId: "functions",
    title: "Pass by value and by reference",
    minutes: 20,
    concepts: ["pass by value", "pass by reference", "reference parameter", "const reference"],
    goals: [
      "Why a function normally gets a copy of each argument",
      "Changing the caller's variables with reference parameters (`int&`)",
      "Using `const&` to avoid copies without allowing changes",
    ],
    intro: `By default a function receives **copies** of its arguments. That keeps the caller's variables safe — but sometimes you *want* a function to change them, or to send back more than one result. That's what **references** are for.`,
    sections: [
      {
        title: "Pass by value: the function gets a copy",
        body: `\`\`\`cpp
void addOne(int n) {
    n++;               // changes the copy only
}

int main() {
    int a = 5;
    addOne(a);
    cout << a;         // still 5
}
\`\`\`

\`n\` is a brand-new variable that starts with the value 5. Changing \`n\` doesn't touch \`a\`.`,
      },
      {
        title: "Pass by reference: the function gets the original",
        body: `Add \`&\` after the type and the parameter becomes a **reference** — another name for the caller's variable:

\`\`\`cpp
void addOne(int& n) {
    n++;               // changes the caller's variable
}
\`\`\`

Now \`addOne(a);\` really increases \`a\`. The argument must be a variable (you can't pass \`addOne(5)\` — there's nothing to change).

References also let a function **give back several results** through its parameters.`,
      },
      {
        title: "const references",
        body: `Copying a big \`string\` or array-like object just to read it is wasteful. A **const reference** passes the original without copying, and the \`const\` promises the function won't change it:

\`\`\`cpp
int countSpaces(const string& text) { ... }
\`\`\`

Rule of thumb: small values like \`int\` by value; big objects you only read by \`const&\`; things you must change by \`&\`.`,
      },
    ],
    mistakes: [
      { title: "Expecting a value parameter to change the caller", body: "With `void f(int x)`, any change to `x` is lost when the function ends. If the caller must see the change, use `int& x` (or return the new value)." },
      { title: "Forgetting & on one of several outputs", body: "`void minMax(int a, int b, int& lo, int hi)` updates `lo` but not `hi`. Every output parameter needs its own `&`." },
      { title: "Passing a literal to a non-const reference", body: "`addOne(5);` doesn't compile with `int&` — a reference must refer to a variable." },
    ],
    example: {
      title: "Two ways to swap",
      intro: "The same three lines swap two values — but only the reference version changes the caller's variables.",
      code: r`#include <iostream>
using namespace std;

void swapCopy(int a, int b) {
    int t = a;
    a = b;
    b = t;
}

void swapRef(int& a, int& b) {
    int t = a;
    a = b;
    b = t;
}

int main() {
    int x = 1, y = 2;
    swapCopy(x, y);
    cout << x << " " << y << endl;
    swapRef(x, y);
    cout << x << " " << y << endl;
    return 0;
}`,
      output: "1 2\n2 1\n",
      notes: [
        { line: 4, text: "`a` and `b` are copies; swapping them changes nothing outside." },
        { line: 10, text: "`int&`: `a` and `b` are other names for `x` and `y`." },
        { line: 19, text: "Still `1 2` — the copy version had no effect." },
        { line: 21, text: "Now `2 1` — the reference version swapped the originals." },
      ],
    },
    quickCheck: {
      prompt: "What is printed?",
      code: r`void addOne(int n) {
    n++;
}

int main() {
    int a = 5;
    addOne(a);
    cout << a;
}`,
      options: [
        { id: "a", text: "5", feedback: "Correct: `n` is a copy, so `a` is unchanged." },
        { id: "b", text: "6", feedback: "That would need `int& n`. Here the function only changes its own copy." },
        { id: "c", text: "It doesn't compile", feedback: "It compiles fine — it just doesn't change `a`." },
      ],
      correct: "a",
      explanation: "Without `&`, the parameter is a copy. `n++` changes the copy, and `a` stays 5.",
    },
    exercise: {
      title: "Smallest and largest at once",
      prompt: `Write \`void minMax(int a, int b, int c, int& lo, int& hi)\` that stores the smallest of \`a\`, \`b\`, \`c\` in \`lo\` and the largest in \`hi\`.

\`main\` reads three numbers, calls your function and prints \`lo hi\`.`,
      starterCode: r`#include <iostream>
using namespace std;

void minMax(int a, int b, int c, int& lo, int& hi) {
    // Store the smallest value in lo and the largest in hi.
}

int main() {
    int a, b, c;
    cin >> a >> b >> c;
    int lo = 0, hi = 0;
    minMax(a, b, c, lo, hi);
    cout << lo << " " << hi << endl;
    return 0;
}`,
      tests: [
        { label: "3 9 5", input: "3 9 5\n", output: "3 9", visibility: "sample", category: "normal" },
        { label: "negatives", input: "-1 -7 4\n", output: "-7 4", visibility: "sample", category: "normal" },
        { label: "all equal", input: "5 5 5\n", output: "5 5", visibility: "hidden", category: "edge" },
        { label: "largest first", input: "100 0 50\n", output: "0 100", visibility: "hidden", category: "boundary" },
        { label: "all negative", input: "-3 -9 -4\n", output: "-9 -3", visibility: "hidden", category: "edge" },
      ],
      compare: "tokens",
      hints: [
        "Why can't this function simply `return` its answer?",
        "It has two answers. The `int&` parameters let it write both straight into `main`'s `lo` and `hi`.",
        "Start with `lo = a; hi = a;` — then compare with `b` and `c` and update when you find something smaller or larger.",
        "`if (b < lo) lo = b; if (c < lo) lo = c;` and the same idea with `>` for `hi`.",
      ],
      solution: r`#include <iostream>
using namespace std;

void minMax(int a, int b, int c, int& lo, int& hi) {
    lo = a;
    hi = a;
    if (b < lo) lo = b;
    if (c < lo) lo = c;
    if (b > hi) hi = b;
    if (c > hi) hi = c;
}

int main() {
    int a, b, c;
    cin >> a >> b >> c;
    int lo = 0, hi = 0;
    minMax(a, b, c, lo, hi);
    cout << lo << " " << hi << endl;
    return 0;
}`,
      solutionNotes: "Because `lo` and `hi` are references, assigning to them inside `minMax` assigns to `main`'s variables. Starting both at `a` avoids guessing an initial value.",
    },
    explainAgain: `Passing by value is like **photocopying** a page and handing over the copy: whatever the other person scribbles on it, your original is untouched.

Passing by reference is like handing over **the original notebook**: any change they make, you'll see when you get it back. \`const&\` is handing over the original but saying "read only — don't write in it".`,
    summary: [
      "By default parameters are copies; changes don't reach the caller.",
      "`int&` makes the parameter refer to the caller's variable.",
      "Use `const&` to read big objects without copying them.",
    ],
  },

  {
    id: "scope-lifetime",
    moduleId: "functions",
    title: "Scope and lifetime",
    minutes: 15,
    concepts: ["scope", "local variable", "shadowing", "global variable", "static local"],
    goals: [
      "Where a variable can be used (its scope)",
      "How an inner variable can hide an outer one (shadowing)",
      "How long a variable lives, and what `static` changes",
    ],
    intro: `Every variable has a **scope** — the part of the code where its name means something — and a **lifetime** — how long it exists while the program runs. Most scope bugs come from a variable being created in one place and used, or re-created, somewhere else.`,
    sections: [
      {
        title: "Block scope",
        body: `A variable declared inside \`{ }\` exists only until that closing brace:

\`\`\`cpp
for (int i = 0; i < 3; i++) {
    int square = i * i;     // created fresh every iteration
}
// i and square don't exist here
\`\`\`

Each function's parameters and variables are **local** to it: \`main\`'s \`x\` and another function's \`x\` are completely different variables.`,
      },
      {
        title: "Shadowing",
        body: `If an inner block declares a variable with the **same name** as an outer one, the inner one **hides** (shadows) the outer one until the block ends:

\`\`\`cpp
int sum = 0;
while (...) {
    int sum = 0;    // a NEW variable — the outer sum is hidden
    sum += 5;       // changes the inner one only
}
// the outer sum is still 0
\`\`\`

It compiles without complaint, which makes it a sneaky bug. Use a different name — or don't redeclare.`,
      },
      {
        title: "Lifetime and static locals",
        body: `A normal local variable is **created** when its declaration runs and **destroyed** when its block ends — so it starts fresh on every call.

A \`static\` local variable is created **once** and keeps its value between calls:

\`\`\`cpp
int counter() {
    static int calls = 0;   // initialised only the first time
    calls++;
    return calls;
}
\`\`\`

Global variables (declared outside every function) live for the whole program and can be changed from anywhere — which is exactly why they make programs hard to reason about. Prefer parameters and return values.`,
      },
    ],
    mistakes: [
      { title: "Redeclaring instead of assigning", body: "Writing `int total = 0;` again inside a loop creates a second variable. To update the existing one, write `total = 0;` (or just `total += x;`)." },
      { title: "Using a loop variable after the loop", body: "`for (int i = 0; …) {}` then `cout << i;` doesn't compile — `i` only exists inside the loop. Declare it before the loop if you need it afterwards." },
      { title: "Expecting locals to remember", body: "A local `int count = 0;` is reset on every call. Use a parameter, a return value or (sparingly) `static` if a value must survive between calls." },
    ],
    example: {
      title: "Hiding and remembering",
      intro: "An inner `x` hides the outer one, and a `static` counter remembers how often it was called.",
      code: r`#include <iostream>
using namespace std;

int counter() {
    static int calls = 0;
    calls++;
    return calls;
}

int main() {
    int x = 10;
    {
        int x = 20;
        cout << "inner x = " << x << endl;
    }
    cout << "outer x = " << x << endl;
    counter();
    counter();
    cout << "calls = " << counter() << endl;
    return 0;
}`,
      output: "inner x = 20\nouter x = 10\ncalls = 3\n",
      notes: [
        { line: 5, text: "`static`: created once, keeps its value between calls." },
        { line: 13, text: "A new `x` that hides the outer one inside these braces." },
        { line: 16, text: "Back outside the block, `x` means the outer variable again: 10." },
        { line: 19, text: "This is the third call, so `calls` is 3." },
      ],
    },
    quickCheck: {
      prompt: "What happens with this code?",
      code: r`for (int i = 0; i < 3; i++) {
    int square = i * i;
}
cout << square;`,
      options: [
        { id: "a", text: "It prints 4", feedback: "`square` stopped existing at the loop's closing brace." },
        { id: "b", text: "It prints 0 1 4", feedback: "Even inside the loop nothing is printed — and outside, `square` isn't in scope." },
        { id: "c", text: "It doesn't compile", feedback: "Right: `square` is out of scope after the loop, so the compiler says it was not declared." },
      ],
      correct: "c",
      explanation: "`square` is declared inside the loop body, so its scope ends at that `}`. Using it afterwards is a compile error.",
    },
    exercise: {
      title: "Fix the digit sum",
      prompt: `This program should print the **sum of the digits** of each number (for 123 that's 1 + 2 + 3 = 6). The input is a count \`t\`, then \`t\` numbers. It compiles, but every answer is wrong.

Find the scope bug in \`digitSum\` and fix it.`,
      starterCode: r`#include <iostream>
using namespace std;

int digitSum(int n) {
    int sum = 0;
    while (n > 0) {
        int sum = 0;
        sum += n % 10;
        n /= 10;
    }
    return sum;
}

int main() {
    int t;
    cin >> t;
    for (int i = 0; i < t; i++) {
        int n;
        cin >> n;
        cout << digitSum(n) << endl;
    }
    return 0;
}`,
      tests: [
        { label: "123, 9, 4005", input: "3\n123 9 4005\n", output: "6\n9\n9", visibility: "sample", category: "normal" },
        { label: "0 and 99999", input: "2\n0 99999\n", output: "0\n45", visibility: "hidden", category: "edge" },
        { label: "one million", input: "1\n1000000\n", output: "1", visibility: "hidden", category: "boundary" },
      ],
      compare: "tokens",
      hints: [
        "Which `sum` does `return sum;` give back — and which `sum` does the loop add to?",
        "There are two variables called `sum`. The one inside the loop shadows the outer one.",
        "Look at line 7: it declares a new `sum` every iteration and throws it away at the `}`.",
        "Delete the inner declaration so the loop adds to the outer `sum`.",
      ],
      solution: r`#include <iostream>
using namespace std;

int digitSum(int n) {
    int sum = 0;
    while (n > 0) {
        sum += n % 10;
        n /= 10;
    }
    return sum;
}

int main() {
    int t;
    cin >> t;
    for (int i = 0; i < t; i++) {
        int n;
        cin >> n;
        cout << digitSum(n) << endl;
    }
    return 0;
}`,
      solutionNotes: "The inner `int sum = 0;` created a second variable on every iteration, so the outer `sum` — the one returned — stayed 0. Removing that line makes the loop update the real total.",
    },
    explainAgain: `Picture nested rooms. A name written on a whiteboard in the **inner room** can only be seen inside that room. If the inner room has its own board with the **same name** on it, people inside read the inner one and can't see the outer one — that's shadowing.

When you leave the room, its whiteboard is wiped (lifetime ends). A \`static\` variable is a whiteboard that's never wiped between visits.`,
    summary: [
      "A variable exists only inside the braces where it's declared.",
      "Redeclaring a name in an inner block shadows the outer variable.",
      "Locals start fresh on each call; `static` locals keep their value.",
    ],
  },

  {
    id: "overloading-defaults",
    moduleId: "functions",
    title: "Overloading and default arguments",
    minutes: 15,
    concepts: ["function overloading", "default arguments", "ambiguity"],
    goals: [
      "Giving several functions the same name with different parameters",
      "Making parameters optional with default arguments",
      "Avoiding calls the compiler can't decide between",
    ],
    intro: `Sometimes the same idea needs slightly different inputs: the area of a square needs one length, a rectangle needs two. C++ lets both functions be called \`area\` — the compiler picks the right one from the arguments you pass.`,
    sections: [
      {
        title: "Overloading",
        body: `Functions can share a name if their **parameter lists differ** (in number or types):

\`\`\`cpp
int area(int side)        { return side * side; }
int area(int w, int h)    { return w * h; }
\`\`\`

\`area(4)\` calls the first; \`area(3, 5)\` calls the second. Only the parameters count — two functions that differ **only** in their return type are not allowed.`,
      },
      {
        title: "Default arguments",
        body: `A parameter can have a **default value**, used when the caller leaves it out:

\`\`\`cpp
void greet(string name, string greeting = "Hello") {
    cout << greeting << ", " << name << "!" << endl;
}

greet("Asha");             // Hello, Asha!
greet("Ravi", "Welcome");  // Welcome, Ravi!
\`\`\`

Defaults must come **last**: once a parameter has a default, every parameter after it needs one too.`,
      },
      {
        title: "Ambiguous calls",
        body: `If two overloads fit a call equally well, the compiler refuses and reports an **ambiguous** call. For example \`void show(int)\` and \`void show(long)\` called with a \`double\` argument: the double could convert to either, so neither wins.

Keep overloads clearly different, and pass arguments of the exact types you mean.`,
      },
    ],
    mistakes: [
      { title: "Overloading on return type only", body: "`int f(int)` and `double f(int)` can't both exist — a call `f(3)` gives the compiler no way to choose." },
      { title: "A default before a non-default", body: "`void f(int a = 1, int b)` doesn't compile. Put parameters with defaults at the end." },
      { title: "Overloads that collide with defaults", body: "`void f(int a)` together with `void f(int a, int b = 0)` makes `f(5)` ambiguous — both fit." },
    ],
    example: {
      title: "One name, several shapes",
      intro: "Two `area` functions and a greeting with an optional word.",
      code: r`#include <iostream>
#include <string>
using namespace std;

int area(int side) {
    return side * side;
}

int area(int w, int h) {
    return w * h;
}

void greet(string name, string greeting = "Hello") {
    cout << greeting << ", " << name << "!" << endl;
}

int main() {
    cout << area(4) << endl;
    cout << area(3, 5) << endl;
    greet("Asha");
    greet("Ravi", "Welcome");
    return 0;
}`,
      output: "16\n15\nHello, Asha!\nWelcome, Ravi!\n",
      notes: [
        { line: 5, text: "One parameter: the square version." },
        { line: 9, text: "Two parameters: the rectangle version — same name, different list." },
        { line: 13, text: "`greeting` is optional; if it's left out it is \"Hello\"." },
        { line: 21, text: "Both arguments given, so the default isn't used." },
      ],
    },
    quickCheck: {
      prompt: "Which line is printed?",
      code: r`void show(int x)    { cout << "int"; }
void show(double x) { cout << "double"; }

int main() {
    show(2.5);
}`,
      options: [
        { id: "a", text: "int", feedback: "2.5 is a `double` literal, and there's an exact `double` overload." },
        { id: "b", text: "double", feedback: "Yes: the argument's type `double` matches the second overload exactly." },
        { id: "c", text: "It's ambiguous and doesn't compile", feedback: "An exact match beats a conversion, so there's no tie here." },
      ],
      correct: "b",
      explanation: "The compiler picks the overload that matches best. `2.5` is a `double`, so `show(double)` wins.",
    },
    exercise: {
      title: "Power with a default",
      prompt: `Write \`long long power(long long base, int exp = 2)\` that returns \`base\` multiplied by itself \`exp\` times. (\`power(b, 0)\` is 1, and with no exponent it squares.)

Each query line starts with how many arguments follow (1 or 2), then the arguments. \`main\` is written for you and calls \`power(b)\` or \`power(b, e)\`.`,
      starterCode: r`#include <iostream>
using namespace std;

long long power(long long base, int exp = 2) {
    // Multiply base by itself exp times. power(b, 0) is 1.
    return 0;
}

int main() {
    int q;
    cin >> q;
    for (int i = 0; i < q; i++) {
        int count;
        long long b;
        cin >> count >> b;
        if (count == 1) {
            cout << power(b) << endl;
        } else {
            int e;
            cin >> e;
            cout << power(b, e) << endl;
        }
    }
    return 0;
}`,
      tests: [
        { label: "5 squared, 2^10, 7^0", input: "3\n1 5\n2 2 10\n2 7 0\n", output: "25\n1024\n1", visibility: "sample", category: "normal" },
        { label: "negative bases", input: "2\n1 -3\n2 -2 3\n", output: "9\n-8", visibility: "hidden", category: "edge" },
        { label: "3^13", input: "1\n2 3 13\n", output: "1594323", visibility: "hidden", category: "normal" },
        { label: "large power", input: "1\n2 10 15\n", output: "1000000000000000", visibility: "hidden", category: "boundary" },
      ],
      compare: "tokens",
      hints: [
        "What should the answer start at before you multiply anything — and why not 0?",
        "Keep a running product, like a running sum but with `*=`. The default argument is already handled by C++.",
        "Start `long long result = 1;` then loop `exp` times, multiplying by `base` each time.",
        "`for (int i = 0; i < exp; i++) result *= base;` then `return result;`. With `exp = 0` the loop never runs, giving 1.",
      ],
      solution: r`#include <iostream>
using namespace std;

long long power(long long base, int exp = 2) {
    long long result = 1;
    for (int i = 0; i < exp; i++) {
        result *= base;
    }
    return result;
}

int main() {
    int q;
    cin >> q;
    for (int i = 0; i < q; i++) {
        int count;
        long long b;
        cin >> count >> b;
        if (count == 1) {
            cout << power(b) << endl;
        } else {
            int e;
            cin >> e;
            cout << power(b, e) << endl;
        }
    }
    return 0;
}`,
      solutionNotes: "A product starts at 1 (multiplying by 0 would wipe everything). `power(b)` uses the default `exp = 2`, so you never write a separate square function.",
    },
    explainAgain: `Overloading is like the word **"open"**: open a door, open a file, open a bank account. Same word, but which action you mean is clear from *what* you're opening.

A default argument is like ordering "tea" at a stall: unless you say otherwise, it comes with sugar. Say "tea, no sugar" and you override the default.`,
    summary: [
      "Overloads share a name but differ in their parameter lists.",
      "Default arguments make trailing parameters optional.",
      "If two overloads fit equally well, the call is ambiguous and won't compile.",
    ],
  },

  {
    id: "recursion",
    moduleId: "functions",
    title: "Recursion and base cases",
    minutes: 25,
    concepts: ["recursion", "base case", "call stack", "recursive case"],
    goals: [
      "What it means for a function to call itself",
      "Why every recursion needs a base case",
      "Following the call stack step by step",
    ],
    intro: `A **recursive** function solves a problem by calling **itself** on a smaller version of the same problem. It sounds circular, but it works as long as the problem keeps shrinking and there is a case simple enough to answer directly.`,
    sections: [
      {
        title: "Two parts: base case and recursive case",
        body: `\`\`\`cpp
int factorial(int n) {
    if (n <= 1) return 1;            // base case: answer directly
    return n * factorial(n - 1);     // recursive case: smaller problem
}
\`\`\`

- The **base case** stops the recursion. Without it the function would call itself forever.
- The **recursive case** must make the problem **smaller** (here \`n - 1\`), so it eventually reaches the base case.`,
      },
      {
        title: "Watch the call stack",
        traceId: "factorial-3",
        body: `Every call gets its **own** \`n\`. Calls pile up on the **call stack** until the base case returns; then each waiting call finishes its multiplication, from the most recent back to the first. Step through \`factorial(3)\`:`,
      },
      {
        title: "Recursion versus loops",
        body: `Anything a loop can do, recursion can do, and many recursive functions can be rewritten as loops. Recursion shines when a problem is naturally **self-similar** — trees, splitting a list in halves, exploring choices.

Each pending call uses stack memory, so very deep recursion (hundreds of thousands of levels) can crash with a **stack overflow**. For simple counting, a loop is usually the better choice.`,
      },
    ],
    mistakes: [
      { title: "No base case", body: "The function keeps calling itself until the stack runs out and the program crashes. Always write the stopping condition first." },
      { title: "Not shrinking the problem", body: "`return n * factorial(n);` calls itself with the same `n` forever. Each call must move closer to the base case." },
      { title: "Ignoring the recursive result", body: "`factorial(n - 1); return n;` computes the smaller answer and throws it away. Use the returned value: `return n * factorial(n - 1);`." },
    ],
    example: {
      title: "A table of factorials",
      intro: "The recursive `factorial` is called from an ordinary loop.",
      code: r`#include <iostream>
using namespace std;

int factorial(int n) {
    if (n <= 1) {
        return 1;
    }
    return n * factorial(n - 1);
}

int main() {
    for (int i = 1; i <= 5; i++) {
        cout << i << "! = " << factorial(i) << endl;
    }
    return 0;
}`,
      output: "1! = 1\n2! = 2\n3! = 6\n4! = 24\n5! = 120\n",
      notes: [
        { line: 5, text: "Base case: 1! (and 0!) are 1 — no further calls." },
        { line: 8, text: "Recursive case: n! is n times (n − 1)!, a smaller problem." },
        { line: 13, text: "Each `factorial(i)` builds its own chain of calls down to 1." },
      ],
    },
    quickCheck: {
      prompt: "What does `f(3)` print?",
      code: r`void f(int n) {
    if (n == 0) return;
    cout << n;
    f(n - 1);
}`,
      options: [
        { id: "a", text: "321", feedback: "Yes: print 3, then f(2) prints 2, then f(1) prints 1, then f(0) stops." },
        { id: "b", text: "123", feedback: "The print happens before the recursive call, so the larger number comes first." },
        { id: "c", text: "3210", feedback: "`f(0)` returns before printing anything." },
      ],
      correct: "a",
      explanation: "Each call prints its `n` and then calls with `n - 1`. The base case `n == 0` prints nothing.",
    },
    exercise: {
      title: "Recursive Fibonacci",
      prompt: `The Fibonacci numbers start \`0, 1\`, and every next number is the sum of the previous two: \`0, 1, 1, 2, 3, 5, 8, …\`.

Write a **recursive** function \`long long fib(int n)\` with \`fib(0) = 0\` and \`fib(1) = 1\`, and print \`fib(n)\` for the \`n\` you read (0 ≤ n ≤ 30).`,
      starterCode: r`#include <iostream>
using namespace std;

long long fib(int n) {
    // Base cases first, then the recursive case.
    return 0;
}

int main() {
    int n;
    cin >> n;
    cout << fib(n) << endl;
    return 0;
}`,
      tests: [
        { label: "n = 10", input: "10\n", output: "55", visibility: "sample", category: "normal" },
        { label: "n = 1", input: "1\n", output: "1", visibility: "sample", category: "boundary" },
        { label: "n = 0", input: "0\n", output: "0", visibility: "hidden", category: "edge" },
        { label: "n = 2", input: "2\n", output: "1", visibility: "hidden", category: "boundary" },
        { label: "n = 25", input: "25\n", output: "75025", visibility: "hidden", category: "normal" },
        { label: "n = 30", input: "30\n", output: "832040", visibility: "hidden", category: "boundary" },
      ],
      compare: "tokens",
      hints: [
        "Which values of `n` can you answer without any calculation?",
        "Those are the base cases: `fib(0)` and `fib(1)`. Every other value is built from two smaller ones.",
        "Write `if (n <= 1) return n;` first — it covers both base cases at once.",
        "The recursive case is `return fib(n - 1) + fib(n - 2);` — two smaller problems added together.",
      ],
      solution: r`#include <iostream>
using namespace std;

long long fib(int n) {
    if (n <= 1) {
        return n;
    }
    return fib(n - 1) + fib(n - 2);
}

int main() {
    int n;
    cin >> n;
    cout << fib(n) << endl;
    return 0;
}`,
      solutionNotes: "`if (n <= 1) return n;` handles 0 and 1 together. This version recomputes the same values many times (fine up to 30); the Algorithms module shows how memoization makes it fast.",
    },
    explainAgain: `Imagine a queue of people and you want to know your position, but you can only talk to the person in front of you. You ask them "what's your position?". They ask the person in front of them, and so on, until the first person says "I'm number 1" (the **base case**). Then the answers travel back: "I'm 2", "I'm 3"… until it reaches you.

Each person waiting for an answer is a call on the **call stack**.`,
    summary: [
      "A recursive function calls itself on a smaller version of the problem.",
      "The base case stops the recursion; without it the program crashes.",
      "Pending calls wait on the call stack and finish in reverse order.",
    ],
  },
];
