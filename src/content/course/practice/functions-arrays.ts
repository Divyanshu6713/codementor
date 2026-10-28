import type { PracticeProblem } from "../types";
import { practice, starter, T } from "./helpers";

/** Practice problems for modules 6–7: functions & recursion, arrays & strings. */
export const FUNCTIONS_ARRAYS_PRACTICE: Record<string, PracticeProblem[]> = {
  "functions-intro": practice(
    {
      title: "Triangle of any character",
      prompt: `Read a character \`c\` and a number \`n\`. Print a triangle of n rows where row i has i copies of c. Write and use a function \`void printRow(char c, int count)\`.

| Input | Output |
| --- | --- |
| \`# 3\` | \`#\` / \`##\` / \`###\` |`,
      starterCode: starter("Call printRow for each row", "char c;\nint n;\ncin >> c >> n;", ["iostream"], "// Write void printRow(char c, int count) here: print c count times, then a new line"),
      tests: [
        T("# 3", "# 3\n", "#\n##\n###", "sample"),
        T("one row", "* 1\n", "*", "visible", "boundary"),
        T("digits", "7 4\n", "7\n77\n777\n7777", "hidden"),
        T("zero rows", "@ 0\n", "", "hidden", "edge"),
      ],
      compare: "lines",
      hints: [
        "What does one row need to know? The character and how many.",
        "printRow loops `count` times printing c, then prints endl.",
        "main calls printRow(c, i) for i from 1 to n.",
        "void printRow(char c, int count) { for (int k = 0; k < count; k++) cout << c; cout << endl; }",
      ],
      solution: `#include <iostream>
using namespace std;

void printRow(char c, int count) {
    for (int k = 0; k < count; k++) cout << c;
    cout << endl;
}

int main() {
    char c;
    int n;
    cin >> c >> n;
    for (int i = 1; i <= n; i++) printRow(c, i);
    return 0;
}`,
      solutionNotes: "The function does one well-defined job (one row); main decides how many rows and how long each is.",
    },
    {
      title: "Frame a word",
      prompt: `Read one word. Print it inside a frame of \`*\` with one space of padding on each side. Write a function \`void border(int width)\` that prints one line of \`width\` stars, and use it twice.

For \`hey\`:
\`\`\`
*******
* hey *
*******
\`\`\``,
      starterCode: starter("Use border() for the top and bottom lines", "string w;\ncin >> w;", ["iostream", "string"], "// Write void border(int width) here"),
      tests: [
        T("hey", "hey\n", "*******\n* hey *\n*******", "sample"),
        T("single letter", "a\n", "*****\n* a *\n*****", "visible", "boundary"),
        T("longer word", "framework\n", "*************\n* framework *\n*************", "hidden"),
        T("digits", "2026\n", "********\n* 2026 *\n********", "hidden"),
      ],
      compare: "lines",
      hints: [
        "How wide is the frame for a word of length L?",
        "Star, space, the word, space, star: L + 4.",
        "border(int width) prints width stars and a new line.",
        "border(w.size() + 4); cout << \"* \" << w << \" *\" << endl; border(w.size() + 4);",
      ],
      solution: `#include <iostream>
#include <string>
using namespace std;

void border(int width) {
    for (int i = 0; i < width; i++) cout << '*';
    cout << endl;
}

int main() {
    string w;
    cin >> w;
    int width = w.size() + 4;
    border(width);
    cout << "* " << w << " *" << endl;
    border(width);
    return 0;
}`,
      solutionNotes: "Writing the repeated line once as a function avoids copying the loop, and the width is computed from the data, not hard-coded.",
    },
  ),

  "parameters-return": practice(
    {
      title: "gcd and lcm",
      prompt: `Write \`int gcd(int a, int b)\` using Euclid's algorithm (repeat: a, b = b, a % b until b is 0). Read two positive numbers and print their gcd and lcm (lcm = a / gcd × b), separated by a space.`,
      starterCode: starter("Print gcd(a, b) and the lcm", "long long a, b;\ncin >> a >> b;", ["iostream"], "// Write gcd here"),
      tests: [
        T("12 18", "12 18\n", "6 36", "sample"),
        T("coprime", "7 9\n", "1 63", "visible"),
        T("equal", "5 5\n", "5 5", "hidden", "edge"),
        T("one divides the other", "4 20\n", "4 20", "hidden"),
        T("large", "1000000 999999\n", "1 999999000000", "hidden", "edge"),
      ],
      hints: [
        "gcd(a, b) = gcd(b, a % b), and gcd(a, 0) = a.",
        "Write it with a while loop: while (b != 0) { … }",
        "lcm can overflow an int — use long long.",
        "Divide before multiplying: a / g * b.",
      ],
      solution: `#include <iostream>
using namespace std;

long long gcd(long long a, long long b) {
    while (b != 0) {
        long long t = a % b;
        a = b;
        b = t;
    }
    return a;
}

int main() {
    long long a, b;
    cin >> a >> b;
    long long g = gcd(a, b);
    cout << g << " " << a / g * b << endl;
    return 0;
}`,
      solutionNotes: "The function returns a value main can reuse twice. Dividing by the gcd before multiplying keeps the intermediate value smaller.",
    },
    {
      title: "Primes in a range",
      prompt: `Write \`bool isPrime(int n)\` that checks divisors only up to √n. Read \`a\` and \`b\` (1 ≤ a ≤ b ≤ 200 000) and print how many primes lie in [a, b].`,
      starterCode: starter("Count the primes from a to b using isPrime", "int a, b;\ncin >> a >> b;", ["iostream"], "// Write bool isPrime(int n) here"),
      tests: [
        T("1 to 10", "1 10\n", "4", "sample"),
        T("single prime", "13 13\n", "1", "visible", "boundary"),
        T("no primes", "24 28\n", "0", "hidden", "edge"),
        T("1 alone", "1 1\n", "0", "hidden", "edge"),
        T("to 200000", "1 200000\n", "17984", "hidden"),
      ],
      hints: [
        "Numbers below 2 aren't prime.",
        "If n has a divisor bigger than √n, it also has one smaller than √n.",
        "Loop d while d * d <= n.",
        "Then count with a loop in main: if (isPrime(i)) count++;",
      ],
      solution: `#include <iostream>
using namespace std;

bool isPrime(int n) {
    if (n < 2) return false;
    for (int d = 2; (long long)d * d <= n; d++) {
        if (n % d == 0) return false;
    }
    return true;
}

int main() {
    int a, b;
    cin >> a >> b;
    int count = 0;
    for (int i = a; i <= b; i++) {
        if (isPrime(i)) count++;
    }
    cout << count << endl;
    return 0;
}`,
      solutionNotes: "Stopping at √n makes each check about 450 steps instead of up to 200 000, so the whole range runs fast. `return false` inside the loop stops at the first divisor.",
    },
  ),

  "pass-by-reference": practice(
    {
      title: "Quotient and remainder at once",
      prompt: `Write \`void divide(int a, int b, int& q, int& r)\` that stores a / b in q and a % b in r. Read a and b (b ≠ 0), call it, and print q and r separated by a space.`,
      starterCode: starter("Call divide(a, b, q, r) and print q and r", "int a, b;\ncin >> a >> b;\nint q, r;", ["iostream"], "// Write divide here"),
      tests: [
        T("17 5", "17 5\n", "3 2", "sample"),
        T("exact", "20 4\n", "5 0", "visible"),
        T("smaller first", "3 8\n", "0 3", "hidden", "edge"),
        T("negative", "-7 2\n", "-3 -1", "hidden", "edge"),
      ],
      hints: [
        "A function can only return one value. How else can it give two back?",
        "Through reference parameters.",
        "`int& q` makes q another name for main's variable.",
        "void divide(int a, int b, int& q, int& r) { q = a / b; r = a % b; }",
      ],
      solution: `#include <iostream>
using namespace std;

void divide(int a, int b, int& q, int& r) {
    q = a / b;
    r = a % b;
}

int main() {
    int a, b;
    cin >> a >> b;
    int q, r;
    divide(a, b, q, r);
    cout << q << " " << r << endl;
    return 0;
}`,
      solutionNotes: "Reference parameters let one call fill in several results. a and b are inputs, so they stay by value.",
    },
    {
      title: "Normalise a time",
      prompt: `Write \`void normalise(long long& h, long long& m, long long& s)\` that carries extra seconds into minutes and extra minutes into hours, so that s < 60 and m < 60. Read h, m, s (all ≥ 0, possibly large), normalise them, and print \`h m s\`.

| Input | Output |
| --- | --- |
| \`1 75 130\` | \`2 17 10\` |`,
      starterCode: starter("Call normalise(h, m, s), then print h m s", "long long h, m, s;\ncin >> h >> m >> s;", ["iostream"], "// Write normalise here"),
      tests: [
        T("1 75 130", "1 75 130\n", "2 17 10", "sample"),
        T("already normal", "3 5 9\n", "3 5 9", "visible"),
        T("only seconds", "0 0 3600\n", "1 0 0", "hidden", "boundary"),
        T("big", "0 0 1000000\n", "277 46 40", "hidden", "edge"),
        T("carry chain", "0 59 60\n", "1 0 0", "hidden", "edge"),
      ],
      hints: [
        "Carry seconds first, then minutes — why that order?",
        "Carrying seconds can push minutes over 60.",
        "m += s / 60; s %= 60;",
        "Then h += m / 60; m %= 60;",
      ],
      solution: `#include <iostream>
using namespace std;

void normalise(long long& h, long long& m, long long& s) {
    m += s / 60;
    s %= 60;
    h += m / 60;
    m %= 60;
}

int main() {
    long long h, m, s;
    cin >> h >> m >> s;
    normalise(h, m, s);
    cout << h << " " << m << " " << s << endl;
    return 0;
}`,
      solutionNotes: "All three values change, so all three are references. Carry from the smallest unit up, so a carry into minutes can then carry into hours.",
    },
  ),

  "scope-lifetime": practice(
    {
      title: "Fix the counter",
      prompt: `This program should read \`n\` numbers and print how many are even, but it always prints 0. Find the scope bug and fix it.`,
      starterCode: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int count = 0;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        int count = 0;
        if (x % 2 == 0) count++;
    }
    cout << count << endl;
    return 0;
}`,
      tests: [
        T("sample", "5\n1 2 3 4 6\n", "3", "sample"),
        T("none even", "3\n1 3 5\n", "0", "visible", "edge"),
        T("all even", "4\n2 4 6 8\n", "4", "hidden"),
        T("negatives", "3\n-2 -3 0\n", "2", "hidden", "edge"),
      ],
      hints: [
        "How many variables named count are there?",
        "The one inside the loop is a new variable that hides the outer one.",
        "It's created fresh (as 0) every pass and disappears at the end of it.",
        "Delete the inner declaration so the loop updates the outer count.",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int count = 0;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        if (x % 2 == 0) count++;
    }
    cout << count << endl;
    return 0;
}`,
      solutionNotes: "A variable declared inside the loop body is a different variable that shadows the outer one and is reset every iteration. Remove it so `count++` reaches the outer counter.",
    },
    {
      title: "Ticket numbers with a static counter",
      prompt: `Write \`int nextTicket()\` that returns 101 the first time it's called, then 102, 103, … — keep the counter **inside the function** with \`static\`. Read \`n\` and then n names; print \`TICKET NAME\` for each.`,
      starterCode: starter("For each name, print nextTicket() and the name", "int n;\ncin >> n;", ["iostream", "string"], "// Write int nextTicket() here — use a static local variable"),
      tests: [
        T("three people", "3\nAsha\nRavi\nMeera\n", "101 Asha\n102 Ravi\n103 Meera", "sample"),
        T("one", "1\nZoe\n", "101 Zoe", "visible", "boundary"),
        T("none", "0\n", "", "hidden", "edge"),
        T("five", "5\nA\nB\nC\nD\nE\n", "101 A\n102 B\n103 C\n104 D\n105 E", "hidden"),
      ],
      compare: "lines",
      hints: [
        "A normal local variable is recreated (and reset) every call.",
        "`static` gives a local variable a lifetime as long as the program's.",
        "It's initialised only once.",
        "int nextTicket() { static int next = 101; return next++; }",
      ],
      solution: `#include <iostream>
#include <string>
using namespace std;

int nextTicket() {
    static int next = 101;
    return next++;
}

int main() {
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) {
        string name;
        cin >> name;
        cout << nextTicket() << " " << name << endl;
    }
    return 0;
}`,
      solutionNotes: "A `static` local keeps its value between calls but is still only visible inside the function — no global variable needed. `next++` returns the old value, then increments.",
    },
  ),

  "overloading-defaults": practice(
    {
      title: "One name, three areas",
      prompt: `Write three overloads: \`long long area(long long side)\` (square), \`long long area(long long w, long long h)\` (rectangle) and \`double area(double r)\` (circle, π = 3.14159265358979). Read \`q\` shapes, each \`S side\`, \`R w h\` or \`C r\`, and print each area — the circle with 2 decimals.`,
      starterCode: starter("For each shape, call the right area() overload and print the result", "int q;\ncin >> q;", ["iostream", "iomanip"], "// Write the three area overloads here"),
      tests: [
        T("one of each", "3\nS 4\nR 3 5\nC 1\n", "16\n15\n3.14", "sample"),
        T("big rectangle", "1\nR 100000 100000\n", "10000000000", "visible", "edge"),
        T("circle with decimals", "1\nC 2.5\n", "19.63", "hidden"),
        T("mixed", "4\nC 10\nS 1\nR 2 9\nS 0\n", "314.16\n1\n18\n0", "hidden"),
      ],
      compare: "lines",
      hints: [
        "Overloads share a name but differ in their parameter lists.",
        "Read the shape letter, then the right number of values.",
        "For C, read a double and call area(r) with a double so the circle version is chosen.",
        "Print the circle with fixed << setprecision(2), and reset with defaultfloat — or only use fixed for circles.",
      ],
      solution: `#include <iostream>
#include <iomanip>
using namespace std;

long long area(long long side) { return side * side; }
long long area(long long w, long long h) { return w * h; }
double area(double r) { return 3.14159265358979 * r * r; }

int main() {
    int q;
    cin >> q;
    for (int i = 0; i < q; i++) {
        char t;
        cin >> t;
        if (t == 'S') {
            long long s;
            cin >> s;
            cout << area(s) << endl;
        } else if (t == 'R') {
            long long w, h;
            cin >> w >> h;
            cout << area(w, h) << endl;
        } else {
            double r;
            cin >> r;
            cout << fixed << setprecision(2) << area(r) << defaultfloat << endl;
        }
    }
    return 0;
}`,
      solutionNotes: "The compiler picks the overload from the argument types: a long long calls the square, two long longs the rectangle, a double the circle. `defaultfloat` undoes `fixed` so later whole numbers print normally.",
    },
    {
      title: "Repeat with defaults",
      prompt: `Write \`string repeat(const string& s, int times = 2, const string& sep = "")\` that joins \`times\` copies of s with sep between them. Read a word, a count and a separator word, then print three lines:

1. \`repeat(word)\`
2. \`repeat(word, count)\`
3. \`repeat(word, count, sep)\``,
      starterCode: starter("Print repeat(w), repeat(w, n) and repeat(w, n, sep)", "string w, sep;\nint n;\ncin >> w >> n >> sep;", ["iostream", "string"], "// Write repeat here with default arguments"),
      tests: [
        T("ab 3 -", "ab 3 -\n", "abab\nababab\nab-ab-ab", "sample"),
        T("count 1", "x 1 ,\n", "xx\nx\nx", "visible", "boundary"),
        T("count 0", "hi 0 +\n", "hihi\n\n", "hidden", "edge"),
        T("long separator", "na 4 ..\n", "nana\nnananana\nna..na..na..na", "hidden"),
      ],
      compare: "lines",
      hints: [
        "Default values go in the parameter list: `int times = 2`.",
        "Build the result in a string, adding s each time.",
        "Add sep *between* copies, not before the first.",
        "for (int i = 0; i < times; i++) { if (i > 0) out += sep; out += s; }",
      ],
      solution: `#include <iostream>
#include <string>
using namespace std;

string repeat(const string& s, int times = 2, const string& sep = "") {
    string out;
    for (int i = 0; i < times; i++) {
        if (i > 0) out += sep;
        out += s;
    }
    return out;
}

int main() {
    string w, sep;
    int n;
    cin >> w >> n >> sep;
    cout << repeat(w) << endl;
    cout << repeat(w, n) << endl;
    cout << repeat(w, n, sep) << endl;
    return 0;
}`,
      solutionNotes: "Defaults fill in missing arguments from the right. With times = 0 the loop never runs and the result is an empty line.",
    },
  ),

  "recursion": practice(
    {
      title: "Binary, recursively",
      prompt: `Write a **recursive** function \`void printBinary(int n)\` that prints n in binary. Read n (0 ≤ n ≤ 1 000 000 000) and print it in binary (0 prints \`0\`).`,
      starterCode: starter("Print n in binary using a recursive function", "int n;\ncin >> n;", ["iostream"], "// Write void printBinary(int n) here — recursively"),
      tests: [
        T("10", "10\n", "1010", "sample"),
        T("1", "1\n", "1", "visible", "boundary"),
        T("0", "0\n", "0", "hidden", "edge"),
        T("255", "255\n", "11111111", "hidden"),
        T("1e9", "1000000000\n", "111011100110101100101000000000", "hidden", "edge"),
      ],
      hints: [
        "The last binary digit of n is n % 2.",
        "The digits before it are the binary of n / 2.",
        "So: print the binary of n / 2 first, then n % 2.",
        "Base case: n < 2 — just print n. Handle 0 by that same base case.",
      ],
      solution: `#include <iostream>
using namespace std;

void printBinary(int n) {
    if (n < 2) {
        cout << n;
        return;
    }
    printBinary(n / 2);
    cout << n % 2;
}

int main() {
    int n;
    cin >> n;
    printBinary(n);
    cout << endl;
    return 0;
}`,
      solutionNotes: "Recursing *before* printing reverses the order for free: the most significant bits are printed first, on the way back up.",
    },
    {
      title: "Tower of Hanoi",
      prompt: `Move n disks from peg 1 to peg 3 using peg 2, never putting a bigger disk on a smaller one. Print each move as \`FROM -> TO\`, then the total number of moves. Use recursion.

For n = 2:
\`\`\`
1 -> 2
1 -> 3
2 -> 3
3
\`\`\``,
      starterCode: starter("Solve Hanoi recursively, printing each move, then the move count", "int n;\ncin >> n;", ["iostream"], "// Write a recursive hanoi(n, from, to, via) here"),
      tests: [
        T("n = 2", "2\n", "1 -> 2\n1 -> 3\n2 -> 3\n3", "sample"),
        T("n = 1", "1\n", "1 -> 3\n1", "visible", "boundary"),
        T("n = 3", "3\n", "1 -> 3\n1 -> 2\n3 -> 2\n1 -> 3\n2 -> 1\n2 -> 3\n1 -> 3\n7", "hidden"),
        T("n = 0", "0\n", "0", "hidden", "edge"),
      ],
      compare: "lines",
      hints: [
        "To move n disks, the biggest must move once, from `from` to `to`.",
        "Before that, the n − 1 smaller disks must get out of the way onto `via`.",
        "Afterwards, move those n − 1 disks from `via` onto `to`.",
        "hanoi(n-1, from, via, to); print from -> to; hanoi(n-1, via, to, from);",
      ],
      solution: `#include <iostream>
using namespace std;

int moves = 0;

void hanoi(int n, int from, int to, int via) {
    if (n == 0) return;
    hanoi(n - 1, from, via, to);
    cout << from << " -> " << to << endl;
    moves++;
    hanoi(n - 1, via, to, from);
}

int main() {
    int n;
    cin >> n;
    hanoi(n, 1, 3, 2);
    cout << moves << endl;
    return 0;
}`,
      solutionNotes: "Trust the recursion: if hanoi can move n − 1 disks, moving n is \"n − 1 aside, biggest across, n − 1 back on top\". The count is 2ⁿ − 1.",
    },
  ),

  "arrays-intro": practice(
    {
      title: "Second largest",
      prompt: `Read \`n\` (1 ≤ n ≤ 100) and n whole numbers. Print the **second largest distinct** value, or \`none\` if all values are equal.`,
      starterCode: starter("Find the largest and the second largest distinct value", "int n;\ncin >> n;\nint a[100];\nfor (int i = 0; i < n; i++) cin >> a[i];"),
      tests: [
        T("sample", "5\n3 9 4 9 7\n", "7", "sample"),
        T("all same", "3\n5 5 5\n", "none", "visible", "edge"),
        T("one value", "1\n8\n", "none", "hidden", "boundary"),
        T("negatives", "4\n-1 -5 -3 -1\n", "-3", "hidden", "edge"),
        T("largest first", "3\n10 2 3\n", "3", "hidden"),
      ],
      hints: [
        "First find the largest value.",
        "Then look for the biggest value that is strictly smaller than it.",
        "Use a flag to remember whether you found any such value.",
        "Two passes over the array keep it simple.",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int a[100];
    for (int i = 0; i < n; i++) cin >> a[i];
    int largest = a[0];
    for (int i = 1; i < n; i++) if (a[i] > largest) largest = a[i];
    bool found = false;
    int second = 0;
    for (int i = 0; i < n; i++) {
        if (a[i] < largest && (!found || a[i] > second)) {
            second = a[i];
            found = true;
        }
    }
    if (found) cout << second << endl;
    else cout << "none" << endl;
    return 0;
}`,
      solutionNotes: "\"Distinct\" means duplicates of the maximum don't count. A `found` flag avoids guessing a starting value like 0, which would be wrong for negative inputs.",
    },
    {
      title: "Merge two sorted lists",
      prompt: `Read \`n\` and a sorted list of n numbers, then \`m\` and a sorted list of m numbers (each list up to 100 numbers). Print all n + m numbers in sorted order — **without** sorting again: walk both lists at the same time.`,
      starterCode: starter("Merge the two sorted arrays with two indexes", "int n, m;\nint a[100], b[100];\ncin >> n;\nfor (int i = 0; i < n; i++) cin >> a[i];\ncin >> m;\nfor (int j = 0; j < m; j++) cin >> b[j];"),
      tests: [
        T("sample", "3\n1 4 9\n4\n2 3 10 11\n", "1 2 3 4 9 10 11", "sample"),
        T("one empty", "0\n3\n5 6 7\n", "5 6 7", "visible", "edge"),
        T("duplicates", "2\n2 2\n2\n2 3\n", "2 2 2 3", "hidden", "edge"),
        T("all of a smaller", "2\n1 2\n2\n8 9\n", "1 2 8 9", "hidden"),
      ],
      hints: [
        "Keep an index i into a and j into b.",
        "Compare a[i] with b[j] and print the smaller, advancing its index.",
        "When one list runs out, print the rest of the other.",
        "while (i < n && j < m) { … } then two loops for the leftovers.",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int n, m;
    int a[100], b[100];
    cin >> n;
    for (int i = 0; i < n; i++) cin >> a[i];
    cin >> m;
    for (int j = 0; j < m; j++) cin >> b[j];
    int i = 0, j = 0;
    while (i < n && j < m) {
        if (a[i] <= b[j]) cout << a[i++] << " ";
        else cout << b[j++] << " ";
    }
    while (i < n) cout << a[i++] << " ";
    while (j < m) cout << b[j++] << " ";
    cout << endl;
    return 0;
}`,
      solutionNotes: "Merging two sorted lists takes O(n + m): every comparison prints one number. This is the heart of merge sort.",
    },
  ),

  "array-traversal": practice(
    {
      title: "Maximum and where it is",
      prompt: `Read \`n\` (1 ≤ n ≤ 100) and n whole numbers. Print the maximum value and the index (from 0) of its **first** occurrence.`,
      starterCode: starter("Track the best value and its index", "int n;\ncin >> n;\nint a[100];\nfor (int i = 0; i < n; i++) cin >> a[i];"),
      tests: [
        T("sample", "5\n4 9 2 9 1\n", "9 1", "sample"),
        T("first is max", "3\n7 1 2\n", "7 0", "visible", "boundary"),
        T("all negative", "3\n-4 -2 -9\n", "-2 1", "hidden", "edge"),
        T("single", "1\n5\n", "5 0", "hidden", "boundary"),
      ],
      hints: [
        "Keep two things: the best value so far and where it was.",
        "Start both from element 0.",
        "Update only when a strictly bigger value appears — that keeps the first occurrence.",
        "if (a[i] > best) { best = a[i]; pos = i; }",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int a[100];
    for (int i = 0; i < n; i++) cin >> a[i];
    int best = a[0], pos = 0;
    for (int i = 1; i < n; i++) {
        if (a[i] > best) {
            best = a[i];
            pos = i;
        }
    }
    cout << best << " " << pos << endl;
    return 0;
}`,
      solutionNotes: "Using `>` (not `>=`) means a later equal value doesn't replace the first one.",
    },
    {
      title: "Longest rising run",
      prompt: `Read \`n\` (1 ≤ n ≤ 100) and n whole numbers. Print the length of the longest run of consecutive elements where each is **strictly greater** than the one before.`,
      starterCode: starter("Track the current run length and the best run length", "int n;\ncin >> n;\nint a[100];\nfor (int i = 0; i < n; i++) cin >> a[i];"),
      tests: [
        T("sample", "7\n1 2 3 1 2 3 4\n", "4", "sample"),
        T("all falling", "4\n9 7 5 3\n", "1", "visible", "edge"),
        T("equal is not rising", "5\n1 2 2 3 4\n", "3", "hidden", "edge"),
        T("single", "1\n42\n", "1", "hidden", "boundary"),
        T("all rising", "5\n-3 -1 0 5 9\n", "5", "hidden"),
      ],
      hints: [
        "A single element is a run of length 1.",
        "Walk the array: if a[i] > a[i − 1], the run continues; otherwise it restarts at 1.",
        "Remember the longest run seen.",
        "cur = (a[i] > a[i-1]) ? cur + 1 : 1; best = max(best, cur);",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int a[100];
    for (int i = 0; i < n; i++) cin >> a[i];
    int best = 1, cur = 1;
    for (int i = 1; i < n; i++) {
        if (a[i] > a[i - 1]) cur++;
        else cur = 1;
        if (cur > best) best = cur;
    }
    cout << best << endl;
    return 0;
}`,
      solutionNotes: "One pass with two counters: the run ending here and the best so far. Comparing each element with its neighbour starts the loop at index 1.",
    },
  ),

  "array-search": practice(
    {
      title: "Count and last position",
      prompt: `Read \`n\` (1 ≤ n ≤ 100), n whole numbers, then a \`target\`. Print how many times target appears and the index of its **last** occurrence (or -1).`,
      starterCode: starter("Count occurrences of target and remember the last index", "int n;\ncin >> n;\nint a[100];\nfor (int i = 0; i < n; i++) cin >> a[i];\nint target;\ncin >> target;"),
      tests: [
        T("sample", "6\n3 1 3 5 3 2\n3\n", "3 4", "sample"),
        T("missing", "3\n1 2 3\n9\n", "0 -1", "visible", "edge"),
        T("at the end", "4\n7 7 7 7\n7\n", "4 3", "hidden", "boundary"),
        T("once at the start", "3\n5 1 2\n5\n", "1 0", "hidden", "boundary"),
      ],
      hints: [
        "One pass can do both jobs.",
        "Start last at -1 for \"not found\".",
        "Every match: count++ and last = i.",
        "Because later matches overwrite last, it ends as the final one.",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int a[100];
    for (int i = 0; i < n; i++) cin >> a[i];
    int target;
    cin >> target;
    int count = 0, last = -1;
    for (int i = 0; i < n; i++) {
        if (a[i] == target) {
            count++;
            last = i;
        }
    }
    cout << count << " " << last << endl;
    return 0;
}`,
      solutionNotes: "Scanning forwards and overwriting `last` on every match leaves the last match. -1 is the conventional \"not found\" index.",
    },
    {
      title: "Most frequent value",
      prompt: `Read \`n\` (1 ≤ n ≤ 10 000) and n values, each between 0 and 1000. Print the value that appears most often and how many times; if several tie, print the **smallest** of them. Use a frequency array.`,
      starterCode: starter("Count with freq[value]++ and pick the best value", "int n;\ncin >> n;"),
      tests: [
        T("sample", "7\n4 1 4 2 1 4 3\n", "4 3", "sample"),
        T("tie goes to smaller", "4\n9 2 9 2\n", "2 2", "visible", "edge"),
        T("single", "1\n1000\n", "1000 1", "hidden", "boundary"),
        T("zeros", "5\n0 0 5 5 0\n", "0 3", "hidden", "edge"),
      ],
      hints: [
        "Values are small (0–1000), so they can be array indexes.",
        "int freq[1001] = {}; then freq[x]++ for each value.",
        "Scan v from 0 to 1000 and keep the v with the highest count.",
        "Use `>` so an equal count later doesn't replace a smaller value.",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int freq[1001] = {};
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        freq[x]++;
    }
    int best = 0;
    for (int v = 1; v <= 1000; v++) {
        if (freq[v] > freq[best]) best = v;
    }
    cout << best << " " << freq[best] << endl;
    return 0;
}`,
      solutionNotes: "Using the value itself as an index turns counting into one array update per number. Scanning values in increasing order with `>` picks the smallest among ties.",
    },
  ),

  "arrays-functions": practice(
    {
      title: "Keep the evens",
      prompt: `Write \`vector<int> evens(const vector<int>& v)\` that returns a new vector with only the even values, in order. Read \`n\` and n numbers, then print the result (space-separated), or \`none\` if it's empty.`,
      starterCode: starter("Call evens(v) and print the result or none", "int n;\ncin >> n;\nvector<int> v(n);\nfor (int& x : v) cin >> x;", ["iostream", "vector"], "// Write vector<int> evens(const vector<int>& v) here"),
      tests: [
        T("sample", "6\n1 2 3 4 5 6\n", "2 4 6", "sample"),
        T("none", "3\n1 3 5\n", "none", "visible", "edge"),
        T("negatives and zero", "4\n-4 -3 0 7\n", "-4 0", "hidden", "edge"),
        T("empty input", "0\n", "none", "hidden", "edge"),
      ],
      hints: [
        "Passing by const reference avoids copying the input and promises not to change it.",
        "Create an empty result vector inside the function.",
        "push_back each even value.",
        "Return the result; in main, check .empty() before printing.",
      ],
      solution: `#include <iostream>
#include <vector>
using namespace std;

vector<int> evens(const vector<int>& v) {
    vector<int> out;
    for (int x : v) {
        if (x % 2 == 0) out.push_back(x);
    }
    return out;
}

int main() {
    int n;
    cin >> n;
    vector<int> v(n);
    for (int& x : v) cin >> x;
    vector<int> e = evens(v);
    if (e.empty()) {
        cout << "none" << endl;
    } else {
        for (int x : e) cout << x << " ";
        cout << endl;
    }
    return 0;
}`,
      solutionNotes: "Unlike a C array, a vector knows its size and can be returned from a function. `x % 2 == 0` also works for negative even numbers.",
    },
    {
      title: "Remove duplicates in place",
      prompt: `Write \`void dedupe(vector<int>& v)\` for a **sorted** vector: keep one copy of each value, in place (no second vector), then shrink v. Read \`n\` and n sorted numbers, call it, and print the new size, then the values.`,
      starterCode: starter("Call dedupe(v), then print v.size() and the values", "int n;\ncin >> n;\nvector<int> v(n);\nfor (int& x : v) cin >> x;", ["iostream", "vector"], "// Write void dedupe(vector<int>& v) here — no second vector"),
      tests: [
        T("sample", "7\n1 1 2 3 3 3 5\n", "4\n1 2 3 5", "sample"),
        T("no duplicates", "3\n1 2 3\n", "3\n1 2 3", "visible"),
        T("all the same", "4\n9 9 9 9\n", "1\n9", "hidden", "edge"),
        T("empty", "0\n", "0", "hidden", "edge"),
      ],
      hints: [
        "Because v is sorted, duplicates sit next to each other.",
        "Keep a write position w: the next slot to fill with a new value.",
        "For each i, if v[i] differs from the last kept value, copy it to v[w++].",
        "At the end, v.resize(w).",
      ],
      solution: `#include <iostream>
#include <vector>
using namespace std;

void dedupe(vector<int>& v) {
    if (v.empty()) return;
    int w = 1;
    for (size_t i = 1; i < v.size(); i++) {
        if (v[i] != v[w - 1]) v[w++] = v[i];
    }
    v.resize(w);
}

int main() {
    int n;
    cin >> n;
    vector<int> v(n);
    for (int& x : v) cin >> x;
    dedupe(v);
    cout << v.size() << endl;
    for (int x : v) cout << x << " ";
    cout << endl;
    return 0;
}`,
      solutionNotes: "The read index i runs ahead of the write index w; each new value is copied down. Passing by reference lets the function change the caller's vector. (`std::unique` does the same job.)",
    },
  ),

  "two-d-arrays": practice(
    {
      title: "Row with the biggest sum",
      prompt: `Read \`r\` and \`c\` (1 ≤ r, c ≤ 10), then the grid. Print the index (from 0) of the row with the largest sum — the first such row if there's a tie — and that sum.`,
      starterCode: starter("Sum each row and keep the best", "int r, c;\ncin >> r >> c;\nint g[10][10];\nfor (int i = 0; i < r; i++)\n    for (int j = 0; j < c; j++) cin >> g[i][j];"),
      tests: [
        T("sample", "3 3\n1 2 3\n9 0 0\n4 4 4\n", "2 12", "sample"),
        T("tie keeps the first", "2 2\n5 5\n6 4\n", "0 10", "visible", "edge"),
        T("negatives", "2 3\n-1 -1 -1\n-5 0 0\n", "0 -3", "hidden", "edge"),
        T("single cell", "1 1\n7\n", "0 7", "hidden", "boundary"),
      ],
      hints: [
        "For each row, add up its c values.",
        "Reset the sum at the start of every row.",
        "Keep the best sum and its row; start from row 0.",
        "Update only on a strictly larger sum to keep the first row in a tie.",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int r, c;
    cin >> r >> c;
    int g[10][10];
    for (int i = 0; i < r; i++)
        for (int j = 0; j < c; j++) cin >> g[i][j];
    int bestRow = 0, bestSum = 0;
    for (int i = 0; i < r; i++) {
        int s = 0;
        for (int j = 0; j < c; j++) s += g[i][j];
        if (i == 0 || s > bestSum) {
            bestSum = s;
            bestRow = i;
        }
    }
    cout << bestRow << " " << bestSum << endl;
    return 0;
}`,
      solutionNotes: "Initialising bestSum from row 0 (rather than 0) handles grids where every row sum is negative.",
    },
    {
      title: "Spiral order",
      prompt: `Read \`r\` and \`c\` (1 ≤ r, c ≤ 10) and the grid. Print its values in **clockwise spiral** order starting at the top-left, space-separated.

\`\`\`
1 2 3
4 5 6
7 8 9
\`\`\`
→ \`1 2 3 6 9 8 7 4 5\``,
      starterCode: starter("Walk the grid in a spiral using top, bottom, left and right boundaries", "int r, c;\ncin >> r >> c;\nint g[10][10];\nfor (int i = 0; i < r; i++)\n    for (int j = 0; j < c; j++) cin >> g[i][j];"),
      tests: [
        T("3 × 3", "3 3\n1 2 3\n4 5 6\n7 8 9\n", "1 2 3 6 9 8 7 4 5", "sample"),
        T("single row", "1 4\n1 2 3 4\n", "1 2 3 4", "visible", "edge"),
        T("single column", "3 1\n1\n2\n3\n", "1 2 3", "hidden", "edge"),
        T("3 × 4", "3 4\n1 2 3 4\n5 6 7 8\n9 10 11 12\n", "1 2 3 4 8 12 11 10 9 5 6 7", "hidden"),
        T("2 × 2", "2 2\n1 2\n3 4\n", "1 2 4 3", "hidden"),
      ],
      hints: [
        "Keep four boundaries: top, bottom, left, right.",
        "Go right along top, then down the right column, then left along bottom, then up the left column — and shrink each boundary after using it.",
        "Stop when top > bottom or left > right.",
        "Check the boundaries again before the bottom row and left column, or single rows/columns print twice.",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int r, c;
    cin >> r >> c;
    int g[10][10];
    for (int i = 0; i < r; i++)
        for (int j = 0; j < c; j++) cin >> g[i][j];
    int top = 0, bottom = r - 1, left = 0, right = c - 1;
    while (top <= bottom && left <= right) {
        for (int j = left; j <= right; j++) cout << g[top][j] << " ";
        top++;
        for (int i = top; i <= bottom; i++) cout << g[i][right] << " ";
        right--;
        if (top <= bottom) {
            for (int j = right; j >= left; j--) cout << g[bottom][j] << " ";
            bottom--;
        }
        if (left <= right) {
            for (int i = bottom; i >= top; i--) cout << g[i][left] << " ";
            left++;
        }
    }
    cout << endl;
    return 0;
}`,
      solutionNotes: "Each side of the current ring is walked once and then removed by moving its boundary inwards. The two extra checks stop a leftover single row or column from being printed twice.",
    },
  ),

  "strings-basics": practice(
    {
      title: "Title Case",
      prompt: `Read a full line of words separated by single spaces. Print it with the first letter of each word in uppercase and every other letter in lowercase.

| Input | Output |
| --- | --- |
| \`hELLO wORLD\` | \`Hello World\` |`,
      starterCode: starter("Uppercase the first letter of each word, lowercase the rest", "string s;\ngetline(cin, s);", ["iostream", "string", "cctype"]),
      tests: [
        T("sample", "hELLO wORLD\n", "Hello World", "sample"),
        T("one word", "cODE\n", "Code", "visible"),
        T("numbers stay", "learn c++ in 30 days\n", "Learn C++ In 30 Days", "hidden", "edge"),
        T("single letters", "a b c\n", "A B C", "hidden", "edge"),
      ],
      compare: "lines",
      hints: [
        "When is a character the start of a word?",
        "When it's the first character, or the character before it is a space.",
        "Use toupper for word starts and tolower for everything else.",
        "for (size_t i = 0; i < s.size(); i++) s[i] = (i == 0 || s[i-1] == ' ') ? toupper(s[i]) : tolower(s[i]);",
      ],
      solution: `#include <iostream>
#include <string>
#include <cctype>
using namespace std;

int main() {
    string s;
    getline(cin, s);
    for (size_t i = 0; i < s.size(); i++) {
        if (i == 0 || s[i - 1] == ' ') s[i] = toupper(s[i]);
        else s[i] = tolower(s[i]);
    }
    cout << s << endl;
    return 0;
}`,
      solutionNotes: "`getline` keeps the spaces. A character starts a word when it's first or follows a space; toupper/tolower leave digits and symbols unchanged.",
    },
    {
      title: "Run-length encoding",
      prompt: `Read one word (lowercase letters). Compress runs of the same letter as the letter followed by the run length.

| Input | Output |
| --- | --- |
| \`aaabccdddd\` | \`a3b1c2d4\` |`,
      starterCode: starter("Print each letter followed by how many times it repeats in a row", "string s;\ncin >> s;", ["iostream", "string"]),
      tests: [
        T("sample", "aaabccdddd\n", "a3b1c2d4", "sample"),
        T("no repeats", "abc\n", "a1b1c1", "visible"),
        T("one long run", "zzzzzzzzzzzz\n", "z12", "hidden", "edge"),
        T("single", "q\n", "q1", "hidden", "boundary"),
        T("runs come back", "aabaa\n", "a2b1a2", "hidden", "edge"),
      ],
      hints: [
        "Walk through the string, counting how long the current run is.",
        "A run ends when the next character is different — or the string ends.",
        "At the end of a run, print the character and the count, then reset.",
        "Use a second index j that moves forward while s[j] == s[i].",
      ],
      solution: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s;
    cin >> s;
    size_t i = 0;
    while (i < s.size()) {
        size_t j = i;
        while (j < s.size() && s[j] == s[i]) j++;
        cout << s[i] << (j - i);
        i = j;
    }
    cout << endl;
    return 0;
}`,
      solutionNotes: "The inner loop finds where the run starting at i ends; then i jumps there. The same letter can start a new run later (\"aabaa\").",
    },
  ),

  "string-problems": practice(
    {
      title: "Anagrams",
      prompt: `Read two words. Print \`yes\` if they are anagrams of each other (the same letters, each the same number of times, ignoring upper/lower case), otherwise \`no\`.`,
      starterCode: starter("Compare letter counts of the two words (ignore case)", "string a, b;\ncin >> a >> b;", ["iostream", "string", "cctype"]),
      tests: [
        T("listen / silent", "listen silent\n", "yes", "sample"),
        T("different", "apple paple\n", "yes", "visible"),
        T("case-insensitive", "Dormitory dirtyroom\n", "yes", "hidden", "edge"),
        T("counts differ", "aab abb\n", "no", "hidden", "edge"),
        T("lengths differ", "abc abcd\n", "no", "hidden", "edge"),
      ],
      hints: [
        "Count each letter in the first word, then un-count it for the second.",
        "An `int count[26]` indexed by `letter - 'a'` works.",
        "Lowercase every character first.",
        "They're anagrams if every count ends at 0.",
      ],
      solution: `#include <iostream>
#include <string>
#include <cctype>
using namespace std;

int main() {
    string a, b;
    cin >> a >> b;
    int count[26] = {};
    for (char ch : a) count[tolower(ch) - 'a']++;
    for (char ch : b) count[tolower(ch) - 'a']--;
    bool same = true;
    for (int k = 0; k < 26; k++) {
        if (count[k] != 0) same = false;
    }
    cout << (same ? "yes" : "no") << endl;
    return 0;
}`,
      solutionNotes: "Counting letters is O(n). (Sorting both lowercased strings and comparing them also works, in O(n log n).)",
    },
    {
      title: "Caesar cipher",
      prompt: `Read a shift \`k\` (any whole number, possibly negative or over 26) on the first line, then a line of text. Shift every letter k places along the alphabet, wrapping around and keeping its case; leave all other characters unchanged.

| Input | Output |
| --- | --- |
| \`3\` / \`Hello, World!\` | \`Khoor, Zruog!\` |`,
      starterCode: starter("Shift each letter by k with wrap-around, keeping case", "int k;\ncin >> k;\ncin.ignore();\nstring s;\ngetline(cin, s);", ["iostream", "string", "cctype"]),
      tests: [
        T("sample", "3\nHello, World!\n", "Khoor, Zruog!", "sample"),
        T("wrap at z", "1\nxyz XYZ\n", "yza YZA", "visible", "boundary"),
        T("negative shift", "-3\nKhoor\n", "Hello", "hidden", "edge"),
        T("shift over 26", "29\nabc\n", "def", "hidden", "edge"),
        T("big negative", "-27\nB2b\n", "A2a", "hidden", "edge"),
      ],
      compare: "lines",
      hints: [
        "Turn the letter into a position 0–25: ch - 'a' (or ch - 'A').",
        "New position: (pos + k) % 26 — but % can be negative in C++.",
        "Normalise k first: k = ((k % 26) + 26) % 26.",
        "Then convert back: 'a' + (pos + k) % 26.",
      ],
      solution: `#include <iostream>
#include <string>
#include <cctype>
using namespace std;

int main() {
    int k;
    cin >> k;
    cin.ignore();
    string s;
    getline(cin, s);
    k = ((k % 26) + 26) % 26;
    for (char& ch : s) {
        if (islower(ch)) ch = 'a' + (ch - 'a' + k) % 26;
        else if (isupper(ch)) ch = 'A' + (ch - 'A' + k) % 26;
    }
    cout << s << endl;
    return 0;
}`,
      solutionNotes: "Normalising k to 0–25 first handles negative and large shifts, because `%` keeps the sign of the left side in C++. `cin.ignore()` skips the newline left after reading k so getline reads the text line.",
    },
  ),
};
