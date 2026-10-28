import type { CourseLesson } from "./types";
import { practice, starter, T } from "./practice/helpers";

const r = String.raw;

/** New lessons for Module 3 (operators), Module 4 (conditions), Module 5 (loops) and Module 7 (arrays & strings). */
export const EXTRA_OPERATORS_LOGIC_LESSONS: CourseLesson[] = [
  // ── Module 3: operators ───────────────────────────────────────────────────
  {
    id: "precedence-associativity",
    moduleId: "operators",
    after: "operators",
    title: "Precedence and associativity",
    minutes: 15,
    concepts: ["precedence", "associativity", "parentheses"],
    goals: [
      "Know which operators are applied first",
      "Know which way equal-precedence operators group (associativity)",
      "Spot the classic traps: `a + b / 2`, `x & 1 == 0`, `a < b < c`",
    ],
    intro: `\`2 + 3 * 4\` is 14 because \`*\` binds tighter than \`+\`. C++ has many more operators, and their order decides what an expression means. When in doubt, add parentheses — they cost nothing and remove all doubt.`,
    sections: [
      {
        title: "The order that matters most",
        body: `From **tightest** to **loosest** (the most common ones):

| Level | Operators |
| --- | --- |
| 1 | \`()\` \`[]\` function calls, \`x++\` |
| 2 | \`!\` \`-x\` \`++x\` casts |
| 3 | \`*\` \`/\` \`%\` |
| 4 | \`+\` \`-\` |
| 5 | \`<<\` \`>>\` |
| 6 | \`<\` \`<=\` \`>\` \`>=\` |
| 7 | \`==\` \`!=\` |
| 8 | \`&\`, then \`^\`, then \`|\` |
| 9 | \`&&\` |
| 10 | \`||\` |
| 11 | \`?:\` \`=\` \`+=\` … |`,
      },
      {
        title: "Associativity",
        body: `When operators have the same precedence, **associativity** decides the grouping:

- Most binary operators group **left to right**: \`a - b - c\` is \`(a - b) - c\`; \`a / b / c\` is \`(a / b) / c\`.
- Assignment groups **right to left**: \`a = b = 5\` is \`a = (b = 5)\`, so both become 5.`,
      },
      {
        title: "Classic traps",
        body: `\`\`\`cpp
avg = a + b / 2;        // means a + (b / 2)       → write (a + b) / 2
if (x & 1 == 0)         // means x & (1 == 0) = x & 0 → write (x & 1) == 0
if (a < b < c)          // means (a < b) < c, a bool vs c → write a < b && b < c
cout << a < b;          // means (cout << a) < b  → write cout << (a < b)
\`\`\``,
      },
    ],
    mistakes: [
      { title: "Averages without brackets", body: "`a + b / 2` divides only b. Bracket the sum: `(a + b) / 2`." },
      { title: "Bitwise & versus ==", body: "`==` binds tighter than `&`, so `x & 1 == 0` is always 0. Write `(x & 1) == 0`." },
      { title: "Relying on memory", body: "Nobody remembers all 17 levels. If an expression needs thought, it needs parentheses." },
    ],
    example: {
      title: "Same numbers, different groupings",
      intro: "Each pair uses the same values; only the grouping changes.",
      code: r`#include <iostream>
using namespace std;

int main() {
    int a = 10, b = 4, c = 2;
    cout << a + b / c << " vs " << (a + b) / c << endl;
    cout << a - b - c << " vs " << a - (b - c) << endl;
    cout << a / b / c << " vs " << a / (b / c) << endl;
    int x, y;
    x = y = 7;
    cout << x << " " << y << endl;
    cout << ((a & 1) == 0) << " vs " << (a & 1 == 0) << endl;
    return 0;
}`,
      output: "12 vs 7\n4 vs 8\n1 vs 5\n7 7\n1 vs 0\n",
      notes: [
        { line: 6, text: "`/` before `+`: 10 + 2 = 12; with brackets (14) / 2 = 7." },
        { line: 7, text: "Left to right: (10 − 4) − 2 = 4." },
        { line: 10, text: "Right to left: y = 7 first, then x = y." },
        { line: 12, text: "`a & 1 == 0` is `a & (1 == 0)` = `a & 0` = 0." },
      ],
    },
    quickCheck: {
      prompt: "What is `20 - 8 - 2`?",
      options: [
        { id: "a", text: "10", feedback: "Yes: subtraction groups left to right, (20 − 8) − 2 = 10." },
        { id: "b", text: "14", feedback: "That's 20 − (8 − 2): right-to-left grouping, which subtraction doesn't use." },
        { id: "c", text: "It depends on the compiler", feedback: "Associativity is fixed by the language." },
      ],
      correct: "a",
      explanation: "Binary `-` is left-associative, so the leftmost subtraction happens first.",
    },
    exercise: {
      title: "Add the brackets",
      prompt: `Read three whole numbers a, b, c. Print two lines: their average (integer division) and \`1\` if their sum is even, else \`0\`. The starter has the right idea but the wrong precedence twice — fix it with brackets.`,
      starterCode: r`#include <iostream>
using namespace std;

int main() {
    int a, b, c;
    cin >> a >> b >> c;
    cout << a + b + c / 3 << endl;
    cout << (a + b + c & 1 == 0) << endl;
    return 0;
}`,
      tests: [
        { label: "3 6 9", input: "3 6 9\n", output: "6\n1", visibility: "sample", category: "normal" },
        { label: "odd sum", input: "1 2 4\n", output: "2\n0", visibility: "hidden", category: "normal" },
        { label: "zeros", input: "0 0 0\n", output: "0\n1", visibility: "hidden", category: "edge" },
        { label: "larger", input: "100 200 301\n", output: "200\n0", visibility: "hidden", category: "normal" },
      ],
      compare: "lines",
      hints: [
        "In the first line, which part does `/ 3` apply to?",
        "Only to c — division binds tighter than addition.",
        "In the second, `1 == 0` happens before `&`.",
        "`(a + b + c) / 3` and `((a + b + c) & 1) == 0`.",
      ],
      solution: r`#include <iostream>
using namespace std;

int main() {
    int a, b, c;
    cin >> a >> b >> c;
    cout << (a + b + c) / 3 << endl;
    cout << (((a + b + c) & 1) == 0) << endl;
    return 0;
}`,
      solutionNotes: "Brackets make the intended grouping explicit. (`% 2 == 0` would also work for the second line and is easier to read.)",
    },
    practice: practice(
      {
        title: "Celsius to Fahrenheit, in ints",
        prompt: `Read a whole-number temperature C. Print \`C * 9 / 5 + 32\` using **integer** arithmetic exactly in that order. The starter writes \`9 / 5 * C + 32\` — explain to yourself why that's wrong, then fix it.`,
        starterCode: r`#include <iostream>
using namespace std;

int main() {
    int c;
    cin >> c;
    cout << 9 / 5 * c + 32 << endl;
    return 0;
}`,
        tests: [
          T("100", "100\n", "212", "sample"),
          T("37", "37\n", "98", "visible"),
          T("0", "0\n", "32", "hidden", "edge"),
          T("negative", "-40\n", "-40", "hidden", "edge"),
          T("7", "7\n", "44", "hidden"),
        ],
        hints: [
          "What is `9 / 5` in integer arithmetic?",
          "It's 1 — so the starter computes c + 32.",
          "Multiply before dividing so the fraction isn't lost early.",
          "`c * 9 / 5 + 32` — left to right: (c * 9) / 5.",
        ],
        solution: r`#include <iostream>
using namespace std;

int main() {
    int c;
    cin >> c;
    cout << c * 9 / 5 + 32 << endl;
    return 0;
}`,
        solutionNotes: "`*` and `/` have equal precedence and group left to right, so the order you write them in matters with integer division.",
      },
      {
        title: "Precedence versus left to right",
        prompt: `Read five whole numbers a b c d e (e ≠ 0). Print two lines:

1. \`a + b * c - d / e\` evaluated the C++ way,
2. the same operators applied **strictly left to right**: \`((((a + b) * c) - d) / e)\`.`,
        starterCode: starter("Print the C++ result, then the strict left-to-right result", "long long a, b, c, d, e;\ncin >> a >> b >> c >> d >> e;"),
        tests: [
          T("sample", "2 3 4 10 5\n", "12\n2", "sample"),
          T("ones", "1 1 1 1 1\n", "1\n1", "visible"),
          T("negatives", "-5 2 -3 7 2\n", "-14\n1", "hidden", "edge"),
          T("big", "100 200 300 400 7\n", "60043\n12800", "hidden"),
        ],
        compare: "lines",
        hints: [
          "The first line is just the expression as written.",
          "C++ does b * c and d / e first.",
          "For the second, add brackets so each step uses the previous result.",
          "`(((a + b) * c) - d) / e`",
        ],
        solution: r`#include <iostream>
using namespace std;

int main() {
    long long a, b, c, d, e;
    cin >> a >> b >> c >> d >> e;
    cout << a + b * c - d / e << endl;
    cout << (((a + b) * c) - d) / e << endl;
    return 0;
}`,
        solutionNotes: "2 + 12 − 2 = 12 the C++ way; ((5 × 4) − 10) / 5 = 2 left to right. A calculator that ignores precedence gets the second.",
      },
    ),
    explainAgain: `Precedence is like BODMAS from school, extended to all of C++'s operators; associativity is the tie-breaker when two operators are equally strong. Since nobody memorises the full table, the professional habit is simple: when it isn't obvious, add brackets.`,
    summary: [
      "`* / %` before `+ -`, comparisons before `&&`, `&&` before `||`.",
      "Most operators group left to right; assignment groups right to left.",
      "Bracket anything non-obvious: `(a + b) / 2`, `(x & 1) == 0`.",
    ],
  },

  {
    id: "division-modulo-deep",
    moduleId: "operators",
    after: "precedence-associativity",
    title: "Integer division and modulo in depth",
    minutes: 15,
    concepts: ["integer division", "modulo", "negative numbers", "base conversion"],
    goals: [
      "Predict `/` and `%` with negative numbers",
      "Write a modulo that's always between 0 and m − 1",
      "Use `/` and `%` to wrap around and to convert between bases",
    ],
    intro: `\`/\` and \`%\` are among the most useful operators in programming — clocks, calendars, digits, hashing and number bases all rely on them. But with negative numbers, C++ does something you might not expect.`,
    sections: [
      {
        title: "Rounding toward zero",
        body: `Integer division in C++ **truncates toward zero**, and \`%\` takes the sign of the left operand:

| Expression | Result |
| --- | --- |
| \`7 / 2\`, \`7 % 2\` | 3, 1 |
| \`-7 / 2\`, \`-7 % 2\` | −3, −1 |
| \`7 / -2\`, \`7 % -2\` | −3, 1 |

The rule that always holds: \`(a / b) * b + a % b == a\`.`,
      },
      {
        title: "A modulo that's never negative",
        body: `For wrapping around (clock hours, array indexes, days of the week) you usually want a result from 0 to m − 1:

\`\`\`cpp
int mod(int a, int m) { return ((a % m) + m) % m; }   // mod(-1, 7) == 6
\`\`\`

Similarly, *floor* division (rounding down, like Python's \`//\`) differs from C++'s \`/\` for negatives: floor(−7 / 2) is −4.`,
      },
      {
        title: "Digits and bases",
        body: `\`n % b\` gives the last digit of n in base b, and \`n / b\` removes it. Repeating that converts to any base:

\`\`\`cpp
// 13 in base 2: 13%2=1, 6%2=0, 3%2=1, 1%2=1 → read backwards: 1101
\`\`\``,
      },
    ],
    mistakes: [
      { title: "Negative remainders", body: "`-1 % 7` is −1, which is out of range as an index. Use `((a % m) + m) % m`." },
      { title: "Assuming floor division", body: "`-7 / 2` is −3 in C++, not −4." },
      { title: "Modulo by zero", body: "`x % 0` is undefined behaviour (usually a crash), just like `x / 0`." },
    ],
    example: {
      title: "Signs and wrap-around",
      intro: "C++'s truncating division next to a wrap-around modulo.",
      code: r`#include <iostream>
using namespace std;

int mod(int a, int m) { return ((a % m) + m) % m; }

int main() {
    cout << -7 / 2 << " " << -7 % 2 << endl;
    cout << 7 / -2 << " " << 7 % -2 << endl;
    cout << mod(-1, 7) << " " << mod(15, 7) << endl;
    int hour = 22;
    cout << "5 hours after 22:00 is " << (hour + 5) % 24 << ":00" << endl;
    cout << "30 hours before 22:00 is " << mod(hour - 30, 24) << ":00" << endl;
    return 0;
}`,
      output: "-3 -1\n-3 1\n6 1\n5 hours after 22:00 is 3:00\n30 hours before 22:00 is 16:00\n",
      notes: [
        { line: 7, text: "Truncation toward zero; the remainder takes the dividend's sign." },
        { line: 9, text: "The helper always lands in 0…6." },
        { line: 12, text: "22 − 30 = −8, and −8 wrapped into 0…23 is 16." },
      ],
    },
    quickCheck: {
      prompt: "What is `-10 % 3` in C++?",
      options: [
        { id: "a", text: "-1", feedback: "Yes: −10 / 3 is −3, and −10 − (−9) = −1." },
        { id: "b", text: "2", feedback: "That's the mathematical (always non-negative) modulo, which C++'s `%` isn't." },
        { id: "c", text: "1", feedback: "Check with (a / b) * b + a % b == a: (−3)(3) + 1 = −8, not −10." },
      ],
      correct: "a",
      explanation: "C++'s % keeps the sign of the left operand: −10 = (−3)·3 + (−1).",
    },
    exercise: {
      title: "Floor division and true modulo",
      prompt: `Read a and m (m > 0; a may be negative). Print four numbers separated by spaces: C++'s \`a / m\` and \`a % m\`, then the **floor** division and the **non-negative** modulo (from 0 to m − 1).

| Input | Output |
| --- | --- |
| \`-7 2\` | \`-3 -1 -4 1\` |`,
      starterCode: r`#include <iostream>
using namespace std;

int main() {
    long long a, m;
    cin >> a >> m;
    // Print a / m, a % m, floor(a / m) and the non-negative modulo

    return 0;
}`,
      tests: [
        { label: "-7 2", input: "-7 2\n", output: "-3 -1 -4 1", visibility: "sample", category: "normal" },
        { label: "positive", input: "17 5\n", output: "3 2 3 2", visibility: "sample", category: "normal" },
        { label: "exact negative", input: "-6 3\n", output: "-2 0 -2 0", visibility: "hidden", category: "edge" },
        { label: "small negative", input: "-1 10\n", output: "0 -1 -1 9", visibility: "hidden", category: "edge" },
        { label: "zero", input: "0 4\n", output: "0 0 0 0", visibility: "hidden", category: "edge" },
      ],
      compare: "tokens",
      hints: [
        "The first two are just `/` and `%`.",
        "Non-negative modulo: `((a % m) + m) % m`.",
        "Floor division: (a − mod) / m, where mod is the non-negative modulo.",
        "That subtraction makes the division exact, so truncation and floor agree.",
      ],
      solution: r`#include <iostream>
using namespace std;

int main() {
    long long a, m;
    cin >> a >> m;
    long long r = ((a % m) + m) % m;
    long long q = (a - r) / m;
    cout << a / m << " " << a % m << " " << q << " " << r << endl;
    return 0;
}`,
      solutionNotes: "With the non-negative remainder r, a − r is an exact multiple of m, so dividing it gives the floor quotient. Then a = q·m + r with 0 ≤ r < m.",
    },
    practice: practice(
      {
        title: "Day of the week after k days",
        prompt: `Days are numbered 0 = Monday … 6 = Sunday. Read today's number and k (k can be negative, meaning days ago, and large). Print the name of the day k days from today.`,
        starterCode: starter("Wrap (today + k) into 0..6 and print the day name", "long long today, k;\ncin >> today >> k;", ["iostream", "string"]),
        tests: [
          T("forward", "0 3\n", "Thursday", "sample"),
          T("backward", "0 -1\n", "Sunday", "sample"),
          T("a week", "4 7\n", "Friday", "hidden", "boundary"),
          T("big", "2 1000000000000\n", "Thursday", "hidden", "edge"),
          T("big negative", "6 -100\n", "Friday", "hidden", "edge"),
        ],
        hints: [
          "Add k to today, then wrap into 0..6.",
          "% alone can give a negative result for negative k.",
          "Use ((x % 7) + 7) % 7.",
          "Index an array of 7 names with the result.",
        ],
        solution: r`#include <iostream>
#include <string>
using namespace std;

int main() {
    long long today, k;
    cin >> today >> k;
    string names[] = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"};
    long long d = ((today + k) % 7 + 7) % 7;
    cout << names[d] << endl;
    return 0;
}`,
        solutionNotes: "Wrap-around arithmetic needs the non-negative modulo, otherwise \"1 day ago\" from Monday would index names[-1].",
      },
      {
        title: "Any base from 2 to 16",
        prompt: `Read a non-negative whole number n and a base b (2 ≤ b ≤ 16). Print n in base b using the digits \`0123456789ABCDEF\`.`,
        starterCode: starter("Collect digits with % and /, then print them in reverse", "long long n;\nint b;\ncin >> n >> b;", ["iostream", "string"]),
        tests: [
          T("binary", "13 2\n", "1101", "sample"),
          T("hex", "255 16\n", "FF", "sample"),
          T("zero", "0 7\n", "0", "hidden", "edge"),
          T("base 10", "2026 10\n", "2026", "hidden"),
          T("large hex", "3735928559 16\n", "DEADBEEF", "hidden"),
          T("base 3", "100 3\n", "10201", "hidden"),
        ],
        hints: [
          "n % b is the last digit; n / b removes it.",
          "Digits come out last-first, so build a string and reverse it (or prepend).",
          "`\"0123456789ABCDEF\"[d]` turns a digit value into its character.",
          "0 is a special case: the loop never runs, so print \"0\".",
        ],
        solution: r`#include <iostream>
#include <string>
using namespace std;

int main() {
    long long n;
    int b;
    cin >> n >> b;
    const string digits = "0123456789ABCDEF";
    if (n == 0) {
        cout << 0 << endl;
        return 0;
    }
    string out;
    while (n > 0) {
        out = digits[n % b] + out;
        n /= b;
    }
    cout << out << endl;
    return 0;
}`,
        solutionNotes: "Repeated `% b` and `/ b` peel digits off the right; prepending puts them back in order.",
      },
    ),
    explainAgain: `C++'s division chops toward zero, like cutting a number line at 0: −3.5 becomes −3. The remainder then has to make up the difference, so it can be negative. When you need "clock arithmetic" — always landing on 0…m−1 — add m and take % again.`,
    summary: [
      "`/` truncates toward zero; `%` has the sign of the left operand.",
      "Non-negative modulo: `((a % m) + m) % m`.",
      "`% b` and `/ b` extract digits in any base.",
    ],
  },

  {
    id: "casting-promotion",
    moduleId: "operators",
    after: "division-modulo-deep",
    title: "Type promotion and casting",
    minutes: 15,
    concepts: ["static_cast", "implicit conversion", "rounding", "narrowing"],
    goals: [
      "Predict the type of a mixed expression like `int + double`",
      "Convert explicitly with `static_cast`",
      "Choose between truncating, rounding, floor and ceil",
    ],
    intro: `When an expression mixes types, C++ converts them to a common type first. Most of the time that's what you want; sometimes it silently throws information away. Explicit casts make your intent clear.`,
    sections: [
      {
        title: "Promotion in expressions",
        body: `- \`int\` with \`double\` → the int becomes a \`double\`: \`7 / 2.0\` is 3.5.
- \`char\` and \`short\` become \`int\` in arithmetic: \`'a' + 1\` is the int 98.
- \`int\` with \`long long\` → \`long long\`.
- The **operands** decide, not the variable you assign to: \`double d = 7 / 2;\` stores 3.0.`,
      },
      {
        title: "static_cast",
        body: `\`\`\`cpp
int total = 7, count = 2;
double avg = static_cast<double>(total) / count;   // 3.5
char next = static_cast<char>('a' + 1);            // 'b'
\`\`\`

\`static_cast<T>(x)\` is the modern, searchable form of the older \`(double)total\`. It shows exactly where a conversion happens.`,
      },
      {
        title: "Turning doubles into ints",
        body: `| Function | 2.7 | −2.7 |
| --- | --- | --- |
| \`static_cast<int>(x)\` (truncate) | 2 | −2 |
| \`lround(x)\` (nearest) | 3 | −3 |
| \`floor(x)\` | 2 | −3 |
| \`ceil(x)\` | 3 | −2 |

Converting a double to an int **truncates toward zero**. Narrowing conversions like \`int x = 3.9;\` compile (with a warning); brace initialisation \`int x{3.9};\` refuses them.`,
      },
    ],
    mistakes: [
      { title: "Casting too late", body: "`static_cast<double>(a / b)` divides as ints first. Cast an operand: `static_cast<double>(a) / b`." },
      { title: "Expecting rounding", body: "`int x = 2.9;` gives 2. Use `lround` for the nearest whole number." },
      { title: "Printing chars as numbers", body: "`cout << c + 1;` prints a number (int). Cast back to char to print a letter." },
    ],
    example: {
      title: "Conversions side by side",
      intro: "Watch where each conversion happens.",
      code: r`#include <iostream>
#include <cmath>
using namespace std;

int main() {
    int total = 7, count = 2;
    cout << total / count << " " << static_cast<double>(total) / count << endl;
    double x = -2.7;
    cout << static_cast<int>(x) << " " << lround(x) << " " << floor(x) << " " << ceil(x) << endl;
    char c = 'a';
    cout << c + 1 << " " << static_cast<char>(c + 1) << endl;
    return 0;
}`,
      output: "3 3.5\n-2 -3 -3 -2\n98 b\n",
      notes: [
        { line: 7, text: "Casting one operand makes the whole division happen in double." },
        { line: 9, text: "Truncate, round, floor and ceil all differ for negative numbers." },
        { line: 11, text: "`c + 1` is an int (98); casting back gives the letter." },
      ],
    },
    quickCheck: {
      prompt: "What does `static_cast<double>(9 / 2)` give?",
      options: [
        { id: "a", text: "4.0", feedback: "Yes — 9 / 2 is integer division (4) before the cast." },
        { id: "b", text: "4.5", feedback: "Only if you cast an operand first: `static_cast<double>(9) / 2`." },
        { id: "c", text: "5.0", feedback: "Integer division truncates, it doesn't round." },
      ],
      correct: "a",
      explanation: "The expression inside the cast is evaluated first, as ints.",
    },
    exercise: {
      title: "Percentage, exact and rounded",
      prompt: `Read marks obtained and the total (both whole numbers, total > 0). Print the percentage with 2 decimals, then the percentage rounded to the nearest whole number.

| Input | Output |
| --- | --- |
| \`437 500\` | \`87.40\` / \`87\` |`,
      starterCode: r`#include <iostream>
#include <iomanip>
#include <cmath>
using namespace std;

int main() {
    int got, total;
    cin >> got >> total;
    double pct = got / total * 100;
    cout << fixed << setprecision(2) << pct << endl;
    cout << (int)pct << endl;
    return 0;
}`,
      tests: [
        { label: "437/500", input: "437 500\n", output: "87.40\n87", visibility: "sample", category: "normal" },
        { label: "rounds up", input: "2 3\n", output: "66.67\n67", visibility: "sample", category: "normal" },
        { label: "full", input: "50 50\n", output: "100.00\n100", visibility: "hidden", category: "boundary" },
        { label: "zero", input: "0 10\n", output: "0.00\n0", visibility: "hidden", category: "edge" },
        { label: "half", input: "1 8\n", output: "12.50\n13", visibility: "hidden", category: "edge" },
      ],
      compare: "lines",
      hints: [
        "What is `got / total` when both are ints and got < total?",
        "0 — so the starter always prints 0.",
        "Cast one operand: `static_cast<double>(got) / total * 100`.",
        "For the second line, round with `lround(pct)` instead of truncating.",
      ],
      solution: r`#include <iostream>
#include <iomanip>
#include <cmath>
using namespace std;

int main() {
    int got, total;
    cin >> got >> total;
    double pct = static_cast<double>(got) / total * 100;
    cout << fixed << setprecision(2) << pct << endl;
    cout << lround(pct) << endl;
    return 0;
}`,
      solutionNotes: "Two conversion bugs: integer division before the cast, and truncation where rounding was wanted. `lround(12.5)` rounds half away from zero to 13.",
    },
    practice: practice(
      {
        title: "Four ways to make it whole",
        prompt: `Read numbers (they may be negative) until the input ends. For each, print four integers separated by spaces: truncated, rounded to nearest, floor and ceil.`,
        starterCode: starter("For each number print trunc, round, floor and ceil", "double x;", ["iostream", "cmath"]),
        tests: [
          T("positive", "2.7\n", "2 3 2 3", "sample"),
          T("negative", "-2.7\n", "-2 -3 -3 -2", "sample"),
          T("whole", "5\n", "5 5 5 5", "hidden", "edge"),
          T("halves", "2.5 -2.5\n", "2 3 2 3\n-2 -3 -3 -2", "hidden", "edge"),
          T("small negative", "-0.2\n", "0 0 -1 0", "hidden", "edge"),
        ],
        hints: [
          "Truncation: static_cast<long long>(x).",
          "lround(x) rounds to the nearest (halves away from zero).",
          "floor and ceil return doubles — cast them to long long to print as integers.",
          "Watch out: floor(-0.2) is -1.",
        ],
        solution: r`#include <iostream>
#include <cmath>
using namespace std;

int main() {
    double x;
    while (cin >> x) {
        cout << static_cast<long long>(x) << " " << lround(x) << " "
             << static_cast<long long>(floor(x)) << " " << static_cast<long long>(ceil(x)) << endl;
    }
    return 0;
}`,
        solutionNotes: "For positive numbers truncation equals floor; for negative numbers it equals ceil. Printing floor(-0.2) directly would show `-1`, but ceil(-0.2) is `-0` as a double — casting to an integer avoids that.",
      },
      {
        title: "The average letter",
        prompt: `Read one word. Print the average character code with 2 decimals, then the character whose code is that average **rounded to the nearest** whole number.

| Input | Output |
| --- | --- |
| \`ace\` | \`99.00\` / \`c\` |`,
        starterCode: starter("Average the codes as a double, then round and cast back to char", "string w;\ncin >> w;", ["iostream", "iomanip", "string", "cmath"]),
        tests: [
          T("ace", "ace\n", "99.00\nc", "sample"),
          T("az", "az\n", "109.50\nn", "visible", "edge"),
          T("single", "Q\n", "81.00\nQ", "hidden", "boundary"),
          T("digits", "19\n", "53.00\n5", "hidden"),
        ],
        compare: "lines",
        hints: [
          "Sum the codes in an int: each char promotes to int in `sum += ch`.",
          "Average: static_cast<double>(sum) / w.size().",
          "Round with lround, then static_cast<char>.",
          "Print the char, not its number.",
        ],
        solution: r`#include <iostream>
#include <iomanip>
#include <string>
#include <cmath>
using namespace std;

int main() {
    string w;
    cin >> w;
    int sum = 0;
    for (char ch : w) sum += ch;
    double avg = static_cast<double>(sum) / w.size();
    cout << fixed << setprecision(2) << avg << endl;
    cout << static_cast<char>(lround(avg)) << endl;
    return 0;
}`,
        solutionNotes: "Three conversions: char → int when summing, int → double for the average, and double → char via rounding.",
      },
    ),
    explainAgain: `In a mixed expression, C++ lifts everything to the "bigger" type before doing the maths — but only at the moment the operator runs. So decide where you want the conversion and put the cast there: on an operand before dividing, not on the result afterwards.`,
    summary: [
      "Mixed int/double arithmetic happens in double; char and short become int.",
      "`static_cast<T>(x)` makes conversions explicit — cast an operand, not the finished result.",
      "double → int truncates; use `lround`, `floor` or `ceil` for other rounding.",
    ],
  },

  {
    id: "predict-output",
    moduleId: "operators",
    after: "casting-promotion",
    title: "Predict-the-output challenges",
    minutes: 15,
    concepts: ["tracing", "increment", "integer division", "char arithmetic"],
    goals: [
      "Trace expressions step by step before running them",
      "Combine everything from this module: precedence, division, casts and increments",
      "Fix code whose output differs from what was intended",
    ],
    intro: `Predicting output *before* running code is the best test of whether you really understand it. This lesson is a set of puzzles that combine the module's ideas. Write your prediction down, then check it.`,
    sections: [
      {
        title: "A tracing method",
        body: `1. Write every variable's value on paper.
2. For each expression, bracket it the way C++ would (precedence, then associativity).
3. Work out each operation with its **types**: int/int truncates, char + int is int.
4. Update the values after each statement, including \`++\` and \`+=\`.`,
      },
      {
        title: "Increment inside expressions",
        body: `\`i++\` gives the old value and then increments; \`++i\` increments first. Using the same variable twice in one expression with \`++\` (like \`i++ + i++\`) has unspecified or undefined results — never do that. One increment per statement keeps code predictable.`,
      },
      {
        title: "Puzzle warm-up",
        body: `\`\`\`cpp
int a = 5;
int b = a++ * 2;     // b = 10, a = 6
int c = ++a / 4;     // a = 7, c = 1
double d = c / 2;    // 0.0 — int division
char e = 'A' + c;    // 'B'
\`\`\``,
      },
    ],
    mistakes: [
      { title: "Guessing instead of tracing", body: "Write down values after every line. Most wrong predictions skip one update." },
      { title: "Ignoring types", body: "`c / 2` with int c is integer division even when stored in a double." },
      { title: "Multiple ++ on one variable in one expression", body: "`i = i++ + 1;` and friends are undefined or confusing. Split them up." },
    ],
    example: {
      title: "A combined puzzle",
      intro: "Predict each line before you reveal the output.",
      code: r`#include <iostream>
using namespace std;

int main() {
    int a = 5;
    int b = a++ * 2;
    int c = ++a / 4;
    double d = c / 2;
    char e = 'A' + c;
    cout << a << " " << b << " " << c << endl;
    cout << d << " " << e << endl;
    cout << 10 - 4 / 3 * 3 << endl;
    cout << (7 % 3 == 1 && 2 + 2 * 2 == 6) << endl;
    return 0;
}`,
      output: "7 10 1\n0 B\n7\n1\n",
      notes: [
        { line: 6, text: "a++ gives 5 (then a = 6): b = 10." },
        { line: 7, text: "++a makes a 7: 7 / 4 = 1." },
        { line: 12, text: "4 / 3 = 1, 1 × 3 = 3, 10 − 3 = 7." },
        { line: 13, text: "Both comparisons are true." },
      ],
    },
    quickCheck: {
      prompt: "`int x = 3; int y = x++ + 10;` — what are x and y?",
      options: [
        { id: "a", text: "x = 4, y = 13", feedback: "Yes: x++ yields 3, then x becomes 4." },
        { id: "b", text: "x = 4, y = 14", feedback: "That would be `++x + 10`." },
        { id: "c", text: "x = 3, y = 13", feedback: "x++ does increment x — after giving its old value." },
      ],
      correct: "a",
      explanation: "Post-increment returns the old value, then increments the variable.",
    },
    exercise: {
      title: "Make the output match the intent",
      prompt: `Read a whole number n (n ≥ 1). The program should print three lines:

1. the average of n and n + 1, as a decimal (e.g. 3.5),
2. the letter that is n places after \`a\` (wrapping z → a),
3. \`n\` and then \`n + 1\`, separated by a space.

The starter gets all three wrong in small ways. Trace it, then fix it.`,
      starterCode: r`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    double avg = (n + n + 1) / 2;
    cout << avg << endl;
    cout << 'a' + n % 26 << endl;
    int m = n;
    cout << m << " " << m++ << endl;
    return 0;
}`,
      tests: [
        { label: "n = 3", input: "3\n", output: "3.5\nd\n3 4", visibility: "sample", category: "normal" },
        { label: "wraps", input: "27\n", output: "27.5\nb\n27 28", visibility: "hidden", category: "edge" },
        { label: "n = 1", input: "1\n", output: "1.5\nb\n1 2", visibility: "hidden", category: "boundary" },
        { label: "n = 25", input: "25\n", output: "25.5\nz\n25 26", visibility: "hidden", category: "boundary" },
      ],
      compare: "lines",
      hints: [
        "Line 1: what type is `(n + n + 1) / 2`?",
        "Line 2: `'a' + n % 26` is an int — cast it to char.",
        "Line 3: `m++` gives the old value; you want m + 1.",
        "`(2 * n + 1) / 2.0`, `static_cast<char>('a' + n % 26)`, and `n + 1`.",
      ],
      solution: r`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    double avg = (2 * n + 1) / 2.0;
    cout << avg << endl;
    cout << static_cast<char>('a' + n % 26) << endl;
    cout << n << " " << n + 1 << endl;
    return 0;
}`,
      solutionNotes: "Integer division, char arithmetic producing an int, and a post-increment returning the old value — the three classic surprises, each fixed by saying exactly what's meant.",
    },
    practice: practice(
      {
        title: "Swap without a temporary",
        prompt: `Read two whole numbers a and b. Swap them **without** a third variable using only \`+\` and \`-\` (a = a + b; b = a − b; a = a − b), then print \`a b\`. Use \`long long\` so the sum can't overflow.`,
        starterCode: starter("Swap with a = a + b; b = a - b; a = a - b", "long long a, b;\ncin >> a >> b;"),
        tests: [
          T("sample", "3 8\n", "8 3", "sample"),
          T("equal", "5 5\n", "5 5", "visible", "edge"),
          T("negatives", "-4 9\n", "9 -4", "hidden"),
          T("large", "2000000000 2000000000\n", "2000000000 2000000000", "hidden", "edge"),
        ],
        hints: [
          "Trace it on paper with a = 3, b = 8.",
          "After a = a + b: a = 11, b = 8.",
          "b = a − b gives the old a; a = a − b gives the old b.",
          "The order of the three lines matters.",
        ],
        solution: r`#include <iostream>
using namespace std;

int main() {
    long long a, b;
    cin >> a >> b;
    a = a + b;
    b = a - b;
    a = a - b;
    cout << a << " " << b << endl;
    return 0;
}`,
        solutionNotes: "A good tracing exercise. In practice use `std::swap(a, b)` — it's clearer and can't overflow.",
      },
      {
        title: "Digital root",
        prompt: `Read a non-negative whole number n (up to 10¹⁸). Repeatedly replace it with the sum of its digits until one digit is left, and print it. Then print the same answer using the formula \`n == 0 ? 0 : 1 + (n - 1) % 9\`, to check your loop.`,
        starterCode: starter("Loop: replace n by its digit sum until n < 10; then print the formula version", "long long n;\ncin >> n;"),
        tests: [
          T("sample", "38\n", "2\n2", "sample"),
          T("zero", "0\n", "0\n0", "visible", "edge"),
          T("nine", "999999999999999999\n", "9\n9", "hidden", "edge"),
          T("big", "123456789012345678\n", "9\n9", "hidden"),
          T("single digit", "7\n", "7\n7", "hidden", "boundary"),
        ],
        compare: "lines",
        hints: [
          "Keep a copy of n for the formula.",
          "Outer loop: while (x >= 10).",
          "Inner loop: sum the digits with % 10 and / 10.",
          "The formula needs n − 1 before %, so handle 0 separately.",
        ],
        solution: r`#include <iostream>
using namespace std;

int main() {
    long long n;
    cin >> n;
    long long x = n;
    while (x >= 10) {
        long long s = 0;
        while (x > 0) {
            s += x % 10;
            x /= 10;
        }
        x = s;
    }
    cout << x << endl;
    cout << (n == 0 ? 0 : 1 + (n - 1) % 9) << endl;
    return 0;
}`,
        solutionNotes: "The digital root equals n mod 9 (with 9 instead of 0, except for 0 itself). Writing both and comparing is a tiny self-test.",
      },
    ),
    explainAgain: `Predicting output is reading code the way the computer does: one statement at a time, one operator at a time, keeping track of types. If your prediction is wrong, the gap between your guess and the real output points exactly at the rule you misremembered.`,
    summary: [
      "Trace with a written table of values, updating after every statement.",
      "Bracket expressions the way C++ does, and track each operation's type.",
      "Keep one `++` per statement — never modify a variable twice in one expression.",
    ],
  },

  // ── Module 4: conditions ──────────────────────────────────────────────────
  {
    id: "ternary-operator",
    moduleId: "logic",
    after: "switch",
    title: "The ternary operator",
    minutes: 10,
    concepts: ["ternary", "conditional expression"],
    goals: [
      "Write `condition ? a : b` to choose between two values",
      "Know when a ternary is clearer than if/else — and when it isn't",
      "Use it inside output and assignments",
    ],
    intro: `\`if\`/\`else\` chooses between two *actions*. The ternary operator \`?:\` chooses between two *values* — in one expression, so it can sit inside a \`cout\`, an assignment or a function's return.`,
    sections: [
      {
        title: "The syntax",
        body: `\`\`\`cpp
condition ? valueIfTrue : valueIfFalse
\`\`\`

\`\`\`cpp
int bigger = (a > b) ? a : b;
cout << n << (n == 1 ? " item" : " items");
\`\`\``,
      },
      {
        title: "Both sides need a common type",
        body: `The two values must be convertible to one type. \`cond ? 1 : 2.5\` is a double. \`cond ? "yes" : string("no")\` is a string. Printing \`cond ? 1 : "no"\` doesn't compile — an int and text have no common type.`,
      },
      {
        title: "Keep it readable",
        body: `A nested ternary can be fine when laid out like a table:

\`\`\`cpp
string grade = marks >= 90 ? "A"
             : marks >= 75 ? "B"
             : marks >= 50 ? "C"
             :               "F";
\`\`\`

If the branches *do* things (several statements), use if/else.`,
      },
    ],
    mistakes: [
      { title: "Forgetting brackets in cout", body: "`cout << x > 0 ? \"pos\" : \"neg\";` parses wrongly. Write `cout << (x > 0 ? \"pos\" : \"neg\");`." },
      { title: "Mismatched types", body: "Both results need a common type: don't mix a number and a string literal." },
      { title: "Squeezing actions into a ternary", body: "`ok ? save() : warn();` works but hides control flow. Use if/else for actions." },
    ],
    example: {
      title: "Choosing values inline",
      intro: "Three ternaries: a maximum, a plural and a sign.",
      code: r`#include <iostream>
using namespace std;

int main() {
    int a = 7, b = 12, n = 1, x = -5;
    int bigger = a > b ? a : b;
    cout << "bigger: " << bigger << endl;
    cout << n << (n == 1 ? " apple" : " apples") << endl;
    int sign = x > 0 ? 1 : (x < 0 ? -1 : 0);
    cout << "sign: " << sign << endl;
    return 0;
}`,
      output: "bigger: 12\n1 apple\nsign: -1\n",
      notes: [
        { line: 6, text: "a > b is false, so the value after `:` is chosen." },
        { line: 8, text: "The brackets keep the ternary separate from `<<`." },
        { line: 9, text: "A nested ternary gives three outcomes." },
      ],
    },
    quickCheck: {
      prompt: "What is `x` after `int x = (5 % 2 == 0) ? 10 : 20;`?",
      options: [
        { id: "a", text: "20", feedback: "Yes — 5 % 2 is 1, so the condition is false." },
        { id: "b", text: "10", feedback: "That's the value when the condition is true." },
        { id: "c", text: "1", feedback: "The ternary picks one of 10 or 20." },
      ],
      correct: "a",
      explanation: "The condition is false, so the value after the colon is used.",
    },
    exercise: {
      title: "Plural and parity",
      prompt: `Read numbers until the input ends. For each n, print one line: \`n item\` or \`n items\` (singular only for exactly 1), followed by \` (even)\` or \` (odd)\`. Use ternaries, not if/else.

| Input | Output |
| --- | --- |
| \`1\` | \`1 item (odd)\` |
| \`4\` | \`4 items (even)\` |`,
      starterCode: r`#include <iostream>
using namespace std;

int main() {
    long long n;
    while (cin >> n) {
        // one cout line using two ternaries
    }
    return 0;
}`,
      tests: [
        { label: "1 and 4", input: "1 4\n", output: "1 item (odd)\n4 items (even)", visibility: "sample", category: "normal" },
        { label: "zero", input: "0\n", output: "0 items (even)", visibility: "hidden", category: "edge" },
        { label: "negative", input: "-3\n", output: "-3 items (odd)", visibility: "hidden", category: "edge" },
        { label: "large", input: "1000000000001\n", output: "1000000000001 items (odd)", visibility: "hidden", category: "normal" },
      ],
      compare: "lines",
      hints: [
        "The first ternary picks \" item\" or \" items\".",
        "The second picks \" (even)\" or \" (odd)\".",
        "Bracket each ternary inside the cout.",
        "`cout << n << (n == 1 ? \" item\" : \" items\") << (n % 2 == 0 ? \" (even)\" : \" (odd)\") << endl;`",
      ],
      solution: r`#include <iostream>
using namespace std;

int main() {
    long long n;
    while (cin >> n) {
        cout << n << (n == 1 ? " item" : " items") << (n % 2 == 0 ? " (even)" : " (odd)") << endl;
    }
    return 0;
}`,
      solutionNotes: "Each ternary produces a piece of text inside one output statement. `n % 2 == 0` is right for negatives too (−3 % 2 is −1, not 0).",
    },
    practice: practice(
      {
        title: "Clamp a value",
        prompt: `Read \`lo hi\` (lo ≤ hi) and then numbers until the input ends. For each x, print it clamped into [lo, hi]: lo if it's below, hi if it's above, otherwise x. Use one nested ternary.`,
        starterCode: starter("Print x clamped to [lo, hi] using a nested ternary", "long long lo, hi, x;\ncin >> lo >> hi;"),
        tests: [
          T("sample", "0 10\n-5 5 15\n", "0\n5\n10", "sample"),
          T("edges", "1 3\n1 3\n", "1\n3", "visible", "boundary"),
          T("single point", "4 4\n0 9\n", "4\n4", "hidden", "edge"),
          T("negatives", "-10 -2\n-20 -5 0\n", "-10\n-5\n-2", "hidden"),
        ],
        compare: "lines",
        hints: [
          "Three outcomes: below, above, inside.",
          "x < lo ? lo : (x > hi ? hi : x)",
          "Loop with while (cin >> x).",
          "C++17 also has std::clamp(x, lo, hi) in <algorithm>.",
        ],
        solution: r`#include <iostream>
using namespace std;

int main() {
    long long lo, hi, x;
    cin >> lo >> hi;
    while (cin >> x) {
        cout << (x < lo ? lo : (x > hi ? hi : x)) << endl;
    }
    return 0;
}`,
        solutionNotes: "A nested ternary works well for three clear cases. `std::clamp` does the same job.",
      },
      {
        title: "Grade table",
        prompt: `Read marks until the input ends. For each, print the mark and its grade using one nested ternary laid out as a table: 90+ \`A\`, 75–89 \`B\`, 50–74 \`C\`, 35–49 \`D\`, below 35 \`F\`.`,
        starterCode: starter("Pick the grade with a table-style nested ternary", "int m;", ["iostream", "string"]),
        tests: [
          T("sample", "95 80 60 40 10\n", "95 A\n80 B\n60 C\n40 D\n10 F", "sample"),
          T("boundaries", "90 75 50 35\n", "90 A\n75 B\n50 C\n35 D", "visible", "boundary"),
          T("just below", "89 74 49 34\n", "89 B\n74 C\n49 D\n34 F", "hidden", "boundary"),
          T("extremes", "100 0\n", "100 A\n0 F", "hidden", "edge"),
        ],
        compare: "lines",
        hints: [
          "Check the highest band first.",
          "Each `:` starts the next check.",
          "Lay it out over several lines so each band lines up.",
          "string g = m >= 90 ? \"A\" : m >= 75 ? \"B\" : …;",
        ],
        solution: r`#include <iostream>
#include <string>
using namespace std;

int main() {
    int m;
    while (cin >> m) {
        string g = m >= 90 ? "A"
                 : m >= 75 ? "B"
                 : m >= 50 ? "C"
                 : m >= 35 ? "D"
                 :           "F";
        cout << m << " " << g << endl;
    }
    return 0;
}`,
        solutionNotes: "Ternaries group right to left, so this reads exactly like an else-if ladder. Laid out as a table it stays readable.",
      },
    ),
    explainAgain: `The ternary is an "if" that *returns something*. Read \`a ? b : c\` as "if a then b otherwise c" and use it when you need a value — inside a print, an assignment or a return. When you need to *do* several things, go back to if/else.`,
    summary: [
      "`cond ? x : y` evaluates to x or y.",
      "Bracket it inside `cout`; both branches need a common type.",
      "Use it for values; use if/else for actions.",
    ],
  },

  {
    id: "eligibility-grading",
    moduleId: "logic",
    after: "ternary-operator",
    title: "Eligibility and grading problems",
    minutes: 20,
    concepts: ["compound conditions", "rule tables", "validation order"],
    goals: [
      "Turn a written rule into exact conditions",
      "Order checks so each one can rely on the earlier ones",
      "Report the *reason* a check failed",
    ],
    intro: `Real decisions — exam results, admissions, loans, tax — come as paragraphs of rules. The skill is translating each rule into a precise condition, testing the boundaries, and putting the checks in an order that keeps the code simple.`,
    sections: [
      {
        title: "From words to conditions",
        body: `| Rule | Condition |
| --- | --- |
| "at least 18" | \`age >= 18\` |
| "more than 60%" | \`pct > 60\` |
| "between 21 and 60 years" | \`age >= 21 && age <= 60\` |
| "pass in every subject" | every mark \`>= 35\` (a loop or \`&&\` chain) |
| "A or (B and C)" | \`a || (b && c)\` — keep the brackets |

Watch words like *at least*, *more than*, *up to* and *between*: they decide \`<\` versus \`<=\`.`,
      },
      {
        title: "Order the checks",
        body: `Check the conditions that **rule something out** first, and return or move on:

\`\`\`cpp
if (age < 21 || age > 60) reason = "age";
else if (income < 25000)  reason = "income";
else if (...)
\`\`\`

Each later check can assume the earlier ones passed.`,
      },
      {
        title: "Test the edges",
        body: `For every threshold, test the value exactly on it and one either side: for "at least 35", test 34, 35 and 36. Most bugs in rule code are at the boundaries.`,
      },
    ],
    mistakes: [
      { title: "Fuzzy boundaries", body: "\"Above 40%\" is `> 40`; \"40% and above\" is `>= 40`. Re-read the rule for every comparison." },
      { title: "Mixing && and || without brackets", body: "`a || b && c` means `a || (b && c)`. Write the brackets you mean." },
      { title: "Checking aggregates only", body: "A rule like \"pass every subject AND 40% overall\" needs both checks; a high average can hide one failed subject." },
    ],
    example: {
      title: "A scholarship rule",
      intro: "Eligible if marks ≥ 85, OR marks ≥ 75 with family income below 3 lakh.",
      code: r`#include <iostream>
using namespace std;

int main() {
    int marks[] = {90, 80, 80, 70};
    long long income[] = {900000, 250000, 400000, 100000};
    for (int i = 0; i < 4; i++) {
        bool eligible = marks[i] >= 85 || (marks[i] >= 75 && income[i] < 300000);
        cout << marks[i] << " " << income[i] << ": " << (eligible ? "eligible" : "not eligible") << endl;
    }
    return 0;
}`,
      output: "90 900000: eligible\n80 250000: eligible\n80 400000: not eligible\n70 100000: not eligible\n",
      notes: [
        { line: 8, text: "The brackets mirror the rule's wording: merit, OR (good marks AND need)." },
      ],
    },
    quickCheck: {
      prompt: "\"Pass if every subject is at least 35 **and** the total is at least 40%.\" Marks are 80, 30, 90 out of 100 each. Pass?",
      options: [
        { id: "a", text: "Fail — one subject is below 35", feedback: "Right: the 66.7% total doesn't make up for the failed subject." },
        { id: "b", text: "Pass — the total is 66.7%", feedback: "Both conditions must hold; 30 < 35." },
        { id: "c", text: "Pass — two of three subjects pass", feedback: "\"Every subject\" means all of them." },
      ],
      correct: "a",
      explanation: "With AND, one failing condition is enough to fail.",
    },
    exercise: {
      title: "Exam result with division",
      prompt: `Read 5 marks (each out of 100). The student **passes** only if every mark is at least 35 **and** the percentage is at least 40. Print \`FAIL\`, or \`PASS\` followed by the division: \`First\` (≥ 60%), \`Second\` (≥ 45%), otherwise \`Third\`. Then print the percentage with 1 decimal.

| Input | Output |
| --- | --- |
| \`70 65 80 55 60\` | \`PASS First\` / \`66.0\` |`,
      starterCode: r`#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    int m[5];
    for (int i = 0; i < 5; i++) cin >> m[i];
    // decide PASS/FAIL and the division, then print the percentage

    return 0;
}`,
      tests: [
        { label: "first", input: "70 65 80 55 60\n", output: "PASS First\n66.0", visibility: "sample", category: "normal" },
        { label: "one subject fails", input: "90 90 90 90 34\n", output: "FAIL\n78.8", visibility: "sample", category: "edge" },
        { label: "low total", input: "36 36 36 36 36\n", output: "FAIL\n36.0", visibility: "hidden", category: "edge" },
        { label: "second boundary", input: "45 45 45 45 45\n", output: "PASS Second\n45.0", visibility: "hidden", category: "boundary" },
        { label: "third", input: "40 40 40 40 41\n", output: "PASS Third\n40.2", visibility: "hidden", category: "boundary" },
        { label: "first boundary", input: "60 60 60 60 60\n", output: "PASS First\n60.0", visibility: "hidden", category: "boundary" },
      ],
      compare: "lines",
      hints: [
        "Two pieces of information: the lowest mark and the total.",
        "pass = (lowest >= 35) && (pct >= 40).",
        "Then the division ladder: >= 60, >= 45, else Third.",
        "pct = total / 5.0 (out of 500 → percent).",
      ],
      solution: r`#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    int m[5];
    for (int i = 0; i < 5; i++) cin >> m[i];
    int total = 0, lowest = 100;
    for (int i = 0; i < 5; i++) {
        total += m[i];
        if (m[i] < lowest) lowest = m[i];
    }
    double pct = total / 5.0;
    if (lowest >= 35 && pct >= 40) {
        cout << "PASS " << (pct >= 60 ? "First" : pct >= 45 ? "Second" : "Third") << endl;
    } else {
        cout << "FAIL" << endl;
    }
    cout << fixed << setprecision(1) << pct << endl;
    return 0;
}`,
      solutionNotes: "Two separate requirements, joined with &&. The lowest mark captures \"every subject\" in one value. Boundaries use `>=` because the rule says \"at least\".",
    },
    practice: practice(
      {
        title: "Loan eligibility with a reason",
        prompt: `Read age, monthly income, credit score and whether there's a guarantor (\`1\`/\`0\`). Check in this order and print the **first** reason that fails, or \`eligible\`:

1. age must be 21 to 60 → \`age\`
2. income at least 25000 → \`income\`
3. credit score at least 700, **or** at least 650 with a guarantor → \`credit\``,
        starterCode: starter("Check age, then income, then credit; print the first failure or eligible", "int age, score, guarantor;\nlong long income;\ncin >> age >> income >> score >> guarantor;"),
        tests: [
          T("eligible", "30 40000 720 0\n", "eligible", "sample"),
          T("guarantor helps", "45 30000 660 1\n", "eligible", "sample"),
          T("no guarantor", "45 30000 660 0\n", "credit", "hidden", "edge"),
          T("too young", "20 90000 800 1\n", "age", "hidden", "boundary"),
          T("age 60 ok", "60 25000 700 0\n", "eligible", "hidden", "boundary"),
          T("income first", "61 1000 100 0\n", "age", "hidden", "edge"),
          T("low income", "35 24999 900 1\n", "income", "hidden", "boundary"),
        ],
        hints: [
          "An else-if chain reports only the first failure.",
          "Age: if (age < 21 || age > 60).",
          "Credit passes when: score >= 700 || (score >= 650 && guarantor == 1).",
          "So it fails when the opposite holds: use `!( … )`.",
        ],
        solution: r`#include <iostream>
using namespace std;

int main() {
    int age, score, guarantor;
    long long income;
    cin >> age >> income >> score >> guarantor;
    bool creditOk = score >= 700 || (score >= 650 && guarantor == 1);
    if (age < 21 || age > 60) cout << "age" << endl;
    else if (income < 25000) cout << "income" << endl;
    else if (!creditOk) cout << "credit" << endl;
    else cout << "eligible" << endl;
    return 0;
}`,
        solutionNotes: "Naming the compound condition (`creditOk`) keeps the ladder readable, and the order of the ladder matches the order of the rules.",
      },
      {
        title: "Income tax by slabs",
        prompt: `Read a yearly income (whole rupees). Tax is charged per slab on the part of the income inside it:

| Income slab | Rate |
| --- | --- |
| 0 – 3,00,000 | 0% |
| 3,00,001 – 7,00,000 | 5% |
| 7,00,001 – 10,00,000 | 10% |
| 10,00,001 – 12,00,000 | 15% |
| 12,00,001 – 15,00,000 | 20% |
| above 15,00,000 | 30% |

Add a 4% cess on the tax. Print the total rounded to the nearest rupee.`,
        starterCode: starter("Add up the tax slab by slab, add 4% cess, round", "long long income;\ncin >> income;", ["iostream", "cmath"]),
        tests: [
          T("no tax", "300000\n", "0", "sample"),
          T("second slab", "500000\n", "10400", "sample"),
          T("ten lakh", "1000000\n", "52000", "hidden", "boundary"),
          T("twenty lakh", "2000000\n", "301600", "hidden"),
          T("just over", "300001\n", "0", "hidden", "edge"),
        ],
        hints: [
          "Keep an array of slab upper limits and their rates.",
          "For each slab, the taxable part is min(income, upper) − lower, if positive.",
          "Sum rate × part, then multiply by 1.04.",
          "Round with llround at the end.",
        ],
        solution: r`#include <iostream>
#include <cmath>
using namespace std;

int main() {
    long long income;
    cin >> income;
    long long limits[] = {300000, 700000, 1000000, 1200000, 1500000};
    double rates[] = {0.0, 0.05, 0.10, 0.15, 0.20};
    double tax = 0;
    long long lower = 0;
    for (int i = 0; i < 5; i++) {
        long long upper = limits[i];
        if (income > lower) tax += rates[i] * (min(income, upper) - lower);
        lower = upper;
    }
    if (income > lower) tax += 0.30 * (income - lower);
    cout << llround(tax * 1.04) << endl;
    return 0;
}`,
        solutionNotes: "Slab rules tax each band separately, so a table of limits and rates plus one loop beats a long if-chain. 300,001 is taxed 5% on 1 rupee = 0.05 → rounds to 0.",
      },
    ),
    explainAgain: `Rule problems are translation exercises. Underline every number and every "at least / more than / and / or" in the rule, write the matching condition next to it, and test each threshold with the value just below, on, and just above it.`,
    summary: [
      "Translate each phrase precisely: \"at least\" is `>=`, \"more than\" is `>`.",
      "Bracket mixed `&&`/`||` the way the rule reads.",
      "Order checks so later ones rely on earlier ones; report the first failure.",
    ],
  },

  // ── Module 5: loops ───────────────────────────────────────────────────────
  {
    id: "infinite-loops",
    moduleId: "loops",
    after: "break-continue",
    title: "Infinite loops and how to spot them",
    minutes: 15,
    concepts: ["infinite loop", "loop variant", "termination"],
    goals: [
      "Recognise the common causes of loops that never stop",
      "Check that every loop makes progress toward its exit",
      "Use deliberate `while (true)` loops safely",
    ],
    intro: `A loop that never ends looks like a frozen program — or, on CodeMentor, a "time limit" verdict. Almost every infinite loop comes from one of a handful of causes, and you can check for all of them before you run anything.`,
    sections: [
      {
        title: "The usual suspects",
        body: `| Cause | Example |
| --- | --- |
| No update | \`while (i < n) { sum += i; }\` |
| Update in the wrong direction | \`for (int i = 0; i < n; i--)\` |
| Wrong variable updated | \`for (int i = 0; i < n; j++)\` |
| Condition can never become false | \`for (size_t i = n; i >= 0; i--)\` |
| Exact floating-point comparison | \`for (double x = 0; x != 1.0; x += 0.1)\` |
| A \`;\` after the header | \`while (i < n); { i++; }\` |`,
      },
      {
        title: "Progress check",
        body: `For every loop, ask: **what changes each time, and does it move toward making the condition false?** If i must reach n, i must grow and the condition must be \`i < n\`. If you can't point at the changing value, the loop may never end.`,
      },
      {
        title: "Deliberate infinite loops",
        body: `\`while (true)\` is fine when the exit is inside — a \`break\` or \`return\` that's guaranteed to happen eventually (end of input, a quit command). Make sure *every* path through the body either makes progress or exits.`,
      },
    ],
    mistakes: [
      { title: "Comparing doubles exactly", body: "0.1 added ten times isn't exactly 1.0, so `x != 1.0` stays true. Loop over an integer counter instead." },
      { title: "Forgetting `continue` skips the update", body: "In a while loop, a `continue` before `i++` jumps back to the condition with i unchanged." },
      { title: "Reading input without checking it", body: "`while (x != 0) cin >> x;` spins forever if the input ends or contains a word. Use `while (cin >> x && x != 0)`." },
    ],
    example: {
      title: "Floating-point counter, fixed",
      intro: "Looping on an integer and computing the double from it always terminates.",
      code: r`#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    // for (double x = 0; x != 1.0; x += 0.1) would never stop
    cout << fixed << setprecision(1);
    for (int i = 0; i <= 10; i += 2) {
        double x = i / 10.0;
        cout << x << " ";
    }
    cout << endl;
    int n = 5, steps = 0;
    while (n != 1) {
        n = (n % 2 == 0) ? n / 2 : 3 * n + 1;
        steps++;
    }
    cout << "steps: " << steps << endl;
    return 0;
}`,
      output: "0.0 0.2 0.4 0.6 0.8 1.0 \nsteps: 5\n",
      notes: [
        { line: 8, text: "The integer counter is exact, so the loop ends." },
        { line: 13, text: "Here n changes every pass; the Collatz rule is believed (not proven!) to always reach 1." },
      ],
    },
    quickCheck: {
      prompt: "Which loop never ends?",
      options: [
        { id: "a", text: "`for (int i = 10; i > 0; i++)`", feedback: "Yes — i grows, so `i > 0` stays true (until overflow, which is undefined)." },
        { id: "b", text: "`for (int i = 10; i > 0; i--)`", feedback: "This counts down to 0 and stops." },
        { id: "c", text: "`for (int i = 0; i < 10; i += 3)`", feedback: "0, 3, 6, 9, then 12 stops it." },
      ],
      correct: "a",
      explanation: "The update moves i away from the exit condition.",
    },
    exercise: {
      title: "Unfreeze the sum",
      prompt: `This program should add up the odd numbers from 1 to n, but it never finishes. Find the reason and fix it. Read n (0 ≤ n ≤ 100000) and print the sum.`,
      starterCode: r`#include <iostream>
using namespace std;

int main() {
    long long n;
    cin >> n;
    long long sum = 0;
    long long i = 1;
    while (i <= n) {
        if (i % 2 == 0) continue;
        sum += i;
        i++;
    }
    cout << sum << endl;
    return 0;
}`,
      tests: [
        { label: "n = 5", input: "5\n", output: "9", visibility: "sample", category: "normal" },
        { label: "n = 0", input: "0\n", output: "0", visibility: "hidden", category: "edge" },
        { label: "n = 1", input: "1\n", output: "1", visibility: "hidden", category: "boundary" },
        { label: "n = 100000", input: "100000\n", output: "2500000000", visibility: "hidden", category: "normal" },
      ],
      compare: "tokens",
      hints: [
        "Trace it for n = 5: what happens when i becomes 2?",
        "`continue` jumps straight back to the condition.",
        "So `i++` is skipped and i stays 2 forever.",
        "Increment before continuing — or use a for loop, where the update always runs.",
      ],
      solution: r`#include <iostream>
using namespace std;

int main() {
    long long n;
    cin >> n;
    long long sum = 0;
    for (long long i = 1; i <= n; i++) {
        if (i % 2 == 0) continue;
        sum += i;
    }
    cout << sum << endl;
    return 0;
}`,
      solutionNotes: "In a for loop, `continue` still runs the update (i++). In the while loop the update was below the continue, so it was skipped. (Stepping i += 2 avoids the check entirely.)",
    },
    practice: practice(
      {
        title: "Wrong direction",
        prompt: `This countdown should print n, n−1, … , 1 on one line and then \`Go!\`, but it never stops. Fix it. Read n (0 ≤ n ≤ 1000).`,
        starterCode: r`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    for (int i = n; i >= 1; i++) {
        cout << i << " ";
    }
    cout << endl << "Go!" << endl;
    return 0;
}`,
        tests: [
          T("n = 3", "3\n", "3 2 1\nGo!", "sample"),
          T("n = 0", "0\n", "\nGo!", "visible", "edge"),
          T("n = 1", "1\n", "1\nGo!", "hidden", "boundary"),
          T("n = 10", "10\n", "10 9 8 7 6 5 4 3 2 1\nGo!", "hidden"),
        ],
        compare: "lines",
        hints: [
          "The condition is `i >= 1`. Does i get closer to 0 or further away?",
          "`i++` makes it bigger every time.",
          "Counting down needs `i--`.",
          "for (int i = n; i >= 1; i--)",
        ],
        solution: r`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    for (int i = n; i >= 1; i--) {
        cout << i << " ";
    }
    cout << endl << "Go!" << endl;
    return 0;
}`,
        solutionNotes: "The progress check: the condition wants i to fall below 1, so the update must decrease i.",
      },
      {
        title: "Tenths without drift",
        prompt: `Read a whole number k (1 ≤ k ≤ 100). Print the values 0.0, 0.1, 0.2, … up to k/10, one per line with 1 decimal. The starter uses a \`double\` counter compared with \`!=\` and never stops — rewrite it with an integer counter.`,
        starterCode: r`#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    int k;
    cin >> k;
    double end = k / 10.0;
    cout << fixed << setprecision(1);
    for (double x = 0.0; x != end + 0.1; x += 0.1) {
        cout << x << endl;
    }
    return 0;
}`,
        tests: [
          T("k = 3", "3\n", "0.0\n0.1\n0.2\n0.3", "sample"),
          T("k = 1", "1\n", "0.0\n0.1", "visible", "boundary"),
          T("k = 10", "10\n", "0.0\n0.1\n0.2\n0.3\n0.4\n0.5\n0.6\n0.7\n0.8\n0.9\n1.0", "hidden"),
          T("k = 100 (last line)", "100\n", Array.from({ length: 101 }, (_, i) => (i / 10).toFixed(1)).join("\n"), "hidden", "edge"),
        ],
        compare: "lines",
        hints: [
          "Repeatedly adding 0.1 produces values like 0.30000000000000004.",
          "So `x != end + 0.1` may never be exactly false.",
          "Loop over an int i from 0 to k.",
          "Print i / 10.0.",
        ],
        solution: r`#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    int k;
    cin >> k;
    cout << fixed << setprecision(1);
    for (int i = 0; i <= k; i++) {
        cout << i / 10.0 << endl;
    }
    return 0;
}`,
        solutionNotes: "Integers are exact, so the integer loop runs exactly k + 1 times; the double is computed fresh each time instead of accumulating error.",
      },
    ),
    explainAgain: `Every loop is a promise: "I'll stop when the condition is false." Before running a loop, point at the thing that changes each time and check it's walking *toward* that stop condition. If nothing changes, or it walks the wrong way, or it can't land exactly on the stop value, the promise is broken.`,
    summary: [
      "Infinite loops: missing or wrong update, impossible condition, float equality, stray `;`.",
      "Check progress: what changes, and does it move toward the exit?",
      "`while (true)` is fine when a `break`/`return` is guaranteed.",
    ],
  },

  {
    id: "debug-loop-missions",
    moduleId: "loops",
    after: "infinite-loops",
    title: "Debug-the-loop missions",
    minutes: 20,
    concepts: ["debugging", "off-by-one", "tracing", "loop invariants"],
    goals: [
      "Find loop bugs by tracing small cases",
      "Fix off-by-one errors at the start and end of a loop",
      "Check initialisation and reset of accumulators",
    ],
    intro: `Loop bugs hide in four places: where the loop **starts**, where it **stops**, how it **steps**, and what's **initialised or reset**. These missions give you programs that compile and run but give wrong answers. Trace a tiny input, find the first place reality differs from your expectation, and fix it.`,
    sections: [
      {
        title: "The four checkpoints",
        body: `1. **Start** — is the first value right (0 or 1? first element or second?)
2. **Stop** — \`<\` or \`<=\`? Does it include the last value you need — and no more?
3. **Step** — does it visit every value it should (\`i++\` vs \`i += 2\`)?
4. **Accumulators** — initialised before the loop? Reset where needed (e.g. per row)?`,
      },
      {
        title: "Trace the smallest interesting input",
        body: `Pick an input of size 0, 1 and 2, work out the correct answer by hand, then trace the program with a table of variable values. The first row where your table and the program disagree is where the bug is. Adding a temporary \`cout\` inside the loop shows the same table automatically.`,
      },
      {
        title: "Edge cases to always try",
        body: `- n = 0 (does the loop run at all? should it?)
- n = 1
- the number 0 as data (digit-counting loops often fail on it)
- all values equal, all negative`,
      },
    ],
    mistakes: [
      { title: "Fixing symptoms", body: "Adding `-1` somewhere until the sample passes often breaks another case. Find out *why* it's off." },
      { title: "Accumulator outside the outer loop", body: "A row sum declared outside the row loop keeps growing across rows." },
      { title: "Forgetting n = 0", body: "Many loop bugs only appear when the loop runs zero times." },
    ],
    example: {
      title: "Tracing with a temporary print",
      intro: "A debug print inside the loop shows each step. (Remove it when done.)",
      code: r`#include <iostream>
using namespace std;

int main() {
    int n = 4;
    int sum = 0;
    for (int i = 1; i <= n; i++) {
        sum += i * i;
        cout << "i=" << i << " sum=" << sum << endl;
    }
    cout << "total " << sum << endl;
    return 0;
}`,
      output: "i=1 sum=1\ni=2 sum=5\ni=3 sum=14\ni=4 sum=30\ntotal 30\n",
      notes: [
        { line: 9, text: "Each line of output is one row of a trace table." },
      ],
    },
    quickCheck: {
      prompt: "A digit-counting loop `while (n > 0) { n /= 10; count++; }` prints 0 for the input 0. Which checkpoint failed?",
      options: [
        { id: "a", text: "The loop runs zero times for n = 0, but 0 has one digit", feedback: "Right — a do-while, or a special case for 0, fixes it." },
        { id: "b", text: "The step should be n /= 100", feedback: "That would skip digits." },
        { id: "c", text: "count should start at 1 for every input", feedback: "Then 5 would report 2 digits." },
      ],
      correct: "a",
      explanation: "It's an edge case of the start/stop checkpoint: the body must run at least once.",
    },
    exercise: {
      title: "Mission 1: the average of the evens",
      prompt: `Read \`n\` and then n whole numbers. Print the average of the **even** ones with 2 decimals, or \`none\`. The program has **two** bugs. Trace small inputs to find them.`,
      starterCode: r`#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    int n;
    cin >> n;
    int sum = 0, count = 0;
    for (int i = 1; i < n; i++) {
        int x;
        cin >> x;
        if (x % 2 == 0) sum += x;
        count++;
    }
    if (count == 0) cout << "none" << endl;
    else cout << fixed << setprecision(2) << (double)sum / count << endl;
    return 0;
}`,
      tests: [
        { label: "sample", input: "4\n1 2 3 4\n", output: "3.00", visibility: "sample", category: "normal" },
        { label: "no evens", input: "3\n1 3 5\n", output: "none", visibility: "hidden", category: "edge" },
        { label: "one number", input: "1\n8\n", output: "8.00", visibility: "hidden", category: "boundary" },
        { label: "negatives", input: "3\n-4 -1 2\n", output: "-1.00", visibility: "hidden", category: "edge" },
      ],
      compare: "tokens",
      hints: [
        "Try n = 1 with the number 8. How many numbers does the loop read?",
        "The loop runs n − 1 times — the last number is never read.",
        "Try 1 2 3 4: count becomes 3 or 4 — but only 2 numbers are even.",
        "Start i at 0, and put `count++` inside the if (use braces).",
      ],
      solution: r`#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    int n;
    cin >> n;
    int sum = 0, count = 0;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        if (x % 2 == 0) {
            sum += x;
            count++;
        }
    }
    if (count == 0) cout << "none" << endl;
    else cout << fixed << setprecision(2) << (double)sum / count << endl;
    return 0;
}`,
      solutionNotes: "A start bug (i = 1 with i < n reads one number too few) and a scope bug (without braces, only `sum += x` belonged to the if; `count++` ran every time).",
    },
    practice: practice(
      {
        title: "Mission 2: digit count",
        prompt: `Read numbers until the input ends (each 0 or more). For each, print how many digits it has. The program is wrong for one important input. Find and fix it.`,
        starterCode: r`#include <iostream>
using namespace std;

int main() {
    long long n;
    while (cin >> n) {
        int count = 0;
        while (n > 0) {
            n /= 10;
            count++;
        }
        cout << count << endl;
    }
    return 0;
}`,
        tests: [
          T("sample", "7 1234\n", "1\n4", "sample"),
          T("zero", "0\n", "1", "visible", "edge"),
          T("powers of ten", "10 100 1000000000\n", "2\n3\n10", "hidden", "boundary"),
          T("big", "999999999999999999\n", "18", "hidden"),
        ],
        compare: "lines",
        hints: [
          "Which input makes the inner loop run zero times?",
          "0 — but 0 has one digit.",
          "The body must run at least once.",
          "Use a do-while: do { n /= 10; count++; } while (n > 0);",
        ],
        solution: r`#include <iostream>
using namespace std;

int main() {
    long long n;
    while (cin >> n) {
        int count = 0;
        do {
            n /= 10;
            count++;
        } while (n > 0);
        cout << count << endl;
    }
    return 0;
}`,
        solutionNotes: "A do-while runs its body at least once, which is exactly right for counting digits — even 0 has one.",
      },
      {
        title: "Mission 3: row totals",
        prompt: `Read \`r\` and \`c\`, then an r × c grid of whole numbers. Print the total of each row on its own line, then the grand total. The program has **two** bugs.`,
        starterCode: r`#include <iostream>
using namespace std;

int main() {
    int r, c;
    cin >> r >> c;
    long long rowSum = 0, grand = 0;
    for (int i = 0; i < r; i++) {
        for (int j = 0; j <= c; j++) {
            long long x;
            cin >> x;
            rowSum += x;
        }
        cout << rowSum << endl;
        grand += rowSum;
    }
    cout << grand << endl;
    return 0;
}`,
        tests: [
          T("sample", "2 3\n1 2 3\n4 5 6\n", "6\n15\n21", "sample"),
          T("one row", "1 2\n5 5\n", "10\n10", "visible", "boundary"),
          T("negatives", "3 1\n-1\n2\n-3\n", "-1\n2\n-3\n-2", "hidden", "edge"),
          T("zeros", "2 2\n0 0\n0 0\n", "0\n0\n0", "hidden", "edge"),
        ],
        compare: "lines",
        hints: [
          "How many numbers does the inner loop read per row?",
          "`j <= c` reads c + 1 — one from the next row.",
          "Where does rowSum go back to 0?",
          "Use `j < c`, and declare/reset rowSum inside the outer loop.",
        ],
        solution: r`#include <iostream>
using namespace std;

int main() {
    int r, c;
    cin >> r >> c;
    long long grand = 0;
    for (int i = 0; i < r; i++) {
        long long rowSum = 0;
        for (int j = 0; j < c; j++) {
            long long x;
            cin >> x;
            rowSum += x;
        }
        cout << rowSum << endl;
        grand += rowSum;
    }
    cout << grand << endl;
    return 0;
}`,
        solutionNotes: "A stop bug (`<=` read one extra number) and a reset bug (rowSum carried over between rows). Declaring an accumulator inside the loop that owns it makes the reset automatic.",
      },
    ),
    explainAgain: `Debugging a loop is detective work with four suspects: the start, the stop, the step and the accumulators. Give the program the smallest input that shows the problem, write down what *should* happen at each step, and compare with what *does* happen. The first difference names the culprit.`,
    summary: [
      "Check start, stop, step and accumulator initialisation/reset.",
      "Trace tiny inputs (0, 1, 2 items) against a hand-made table.",
      "Fix the cause you find, not the symptom you see.",
    ],
  },

  // ── Module 7: arrays & strings ────────────────────────────────────────────
  {
    id: "prefix-sums",
    moduleId: "arrays-strings",
    after: "array-traversal",
    title: "Prefix sums",
    minutes: 15,
    concepts: ["prefix sums", "range queries", "precomputation"],
    goals: [
      "Build a prefix-sum array in one pass",
      "Answer \"sum from l to r\" in O(1) with a subtraction",
      "Use prefix counts for other range questions",
    ],
    intro: `If you need the sum of many different ranges of the same array, adding each range from scratch is slow. A **prefix-sum** array does the adding once; after that every range sum is a single subtraction.`,
    sections: [
      {
        title: "The idea",
        traceId: "prefix-sums",
        body: `\`pre[k]\` = the sum of the first k elements (\`pre[0] = 0\`):

| i | 0 | 1 | 2 | 3 | 4 |
| --- | --- | --- | --- | --- | --- |
| a[i] | 3 | 1 | 4 | 1 | 5 |
| pre[i + 1] | 3 | 4 | 8 | 9 | 14 |

\`\`\`cpp
vector<long long> pre(n + 1, 0);
for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + a[i];
\`\`\``,
      },
      {
        title: "Range sums",
        body: `The sum of a[l] … a[r] (inclusive) is everything up to r minus everything before l:

\`\`\`cpp
sum(l, r) = pre[r + 1] - pre[l];
\`\`\`

Building costs O(n) once; each query is O(1). For q queries that's O(n + q) instead of O(n · q).`,
      },
      {
        title: "Prefix counts",
        body: `The same trick counts things: let \`cnt[i + 1] = cnt[i] + (a[i] is even ? 1 : 0)\`; then the number of even values in [l, r] is \`cnt[r + 1] - cnt[l]\`.`,
      },
    ],
    mistakes: [
      { title: "Off-by-one in the formula", body: "With `pre[0] = 0`, a range [l, r] is `pre[r + 1] - pre[l]`. Draw the table for a small array to check." },
      { title: "Overflowing the sums", body: "Prefix sums grow large; use `long long`." },
      { title: "Rebuilding per query", body: "Build the prefix array once, before reading the queries." },
    ],
    example: {
      title: "Building and querying",
      intro: "One pass to build, then each query is a subtraction.",
      code: r`#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {3, 1, 4, 1, 5, 9, 2};
    int n = a.size();
    vector<long long> pre(n + 1, 0);
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + a[i];
    cout << "sum[0..6] = " << pre[7] - pre[0] << endl;
    cout << "sum[2..4] = " << pre[5] - pre[2] << endl;
    cout << "sum[5..5] = " << pre[6] - pre[5] << endl;
    return 0;
}`,
      output: "sum[0..6] = 25\nsum[2..4] = 10\nsum[5..5] = 9\n",
      notes: [
        { line: 9, text: "Each prefix adds one element to the previous prefix." },
        { line: 11, text: "4 + 1 + 5 = 10, found without looping." },
      ],
    },
    quickCheck: {
      prompt: "With `pre[0] = 0` and `pre[i + 1] = pre[i] + a[i]`, which gives the sum of a[2] … a[5]?",
      options: [
        { id: "a", text: "pre[6] - pre[2]", feedback: "Yes — up to index 5 is pre[6]; before index 2 is pre[2]." },
        { id: "b", text: "pre[5] - pre[2]", feedback: "That stops at a[4]." },
        { id: "c", text: "pre[5] - pre[1]", feedback: "That's a[1] … a[4]." },
      ],
      correct: "a",
      explanation: "sum(l, r) = pre[r + 1] − pre[l].",
    },
    exercise: {
      title: "Range sum queries",
      prompt: `Read \`n\`, then n whole numbers, then \`q\` queries \`l r\` (0-based, inclusive). Print the sum of each range on its own line. Build a prefix-sum array once.`,
      starterCode: r`#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<long long> a(n);
    for (auto& x : a) cin >> x;
    // Build the prefix sums here, then answer the queries

    return 0;
}`,
      tests: [
        { label: "sample", input: "5\n3 1 4 1 5\n3\n0 4\n1 3\n2 2\n", output: "14\n6\n4", visibility: "sample", category: "normal" },
        { label: "negatives", input: "4\n-1 2 -3 4\n2\n0 1\n1 3\n", output: "1\n3", visibility: "hidden", category: "edge" },
        { label: "single", input: "1\n7\n1\n0 0\n", output: "7", visibility: "hidden", category: "boundary" },
        { label: "large values", input: "3\n1000000000 1000000000 1000000000\n1\n0 2\n", output: "3000000000", visibility: "hidden", category: "edge" },
      ],
      compare: "lines",
      hints: [
        "pre has n + 1 entries, starting with 0.",
        "pre[i + 1] = pre[i] + a[i].",
        "Then read q and loop over the queries.",
        "Each answer is pre[r + 1] - pre[l].",
      ],
      solution: r`#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<long long> a(n);
    for (auto& x : a) cin >> x;
    vector<long long> pre(n + 1, 0);
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + a[i];
    int q;
    cin >> q;
    for (int k = 0; k < q; k++) {
        int l, r;
        cin >> l >> r;
        cout << pre[r + 1] - pre[l] << endl;
    }
    return 0;
}`,
      solutionNotes: "The extra leading 0 in pre means a range starting at index 0 needs no special case.",
    },
    practice: practice(
      {
        title: "Even numbers in a range",
        prompt: `Read \`n\` and n whole numbers, then \`q\` queries \`l r\`. For each, print how many even numbers are in a[l..r]. Use a prefix **count** array.`,
        starterCode: starter("Build cnt[i + 1] = cnt[i] + (a[i] even), then answer each query", "int n;\ncin >> n;\nvector<long long> a(n);\nfor (auto& x : a) cin >> x;", ["iostream", "vector"]),
        tests: [
          T("sample", "6\n1 2 3 4 5 6\n3\n0 5\n0 0\n1 3\n", "3\n0\n2", "sample"),
          T("all even", "3\n2 4 6\n1\n0 2\n", "3", "visible"),
          T("negatives", "4\n-2 -3 0 7\n2\n0 3\n1 1\n", "2\n0", "hidden", "edge"),
          T("single", "1\n9\n1\n0 0\n", "0", "hidden", "boundary"),
        ],
        compare: "lines",
        hints: [
          "Instead of adding values, add 1 for each even value.",
          "cnt[i + 1] = cnt[i] + (a[i] % 2 == 0 ? 1 : 0).",
          "The count in [l, r] is cnt[r + 1] − cnt[l].",
          "x % 2 == 0 works for negative even numbers too.",
        ],
        solution: r`#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<long long> a(n);
    for (auto& x : a) cin >> x;
    vector<int> cnt(n + 1, 0);
    for (int i = 0; i < n; i++) cnt[i + 1] = cnt[i] + (a[i] % 2 == 0 ? 1 : 0);
    int q;
    cin >> q;
    for (int k = 0; k < q; k++) {
        int l, r;
        cin >> l >> r;
        cout << cnt[r + 1] - cnt[l] << endl;
    }
    return 0;
}`,
        solutionNotes: "Prefix sums work for anything you can add up — here, ones and zeros.",
      },
      {
        title: "Rectangle sums in a grid",
        prompt: `Read \`r c\` and an r × c grid, then \`q\` queries \`r1 c1 r2 c2\` (0-based, inclusive corners). Print the sum of each rectangle. Use a **2D** prefix sum: \`P[i + 1][j + 1]\` = sum of the top-left i + 1 rows and j + 1 columns.`,
        starterCode: starter("Build P with inclusion–exclusion, then answer each rectangle query", "int r, c;\ncin >> r >> c;\nvector<vector<long long>> g(r, vector<long long>(c));\nfor (auto& row : g) for (auto& x : row) cin >> x;", ["iostream", "vector"]),
        tests: [
          T("sample", "3 3\n1 2 3\n4 5 6\n7 8 9\n3\n0 0 2 2\n1 1 2 2\n0 1 1 2\n", "45\n28\n16", "sample"),
          T("single cell", "2 2\n1 2\n3 4\n1\n1 0 1 0\n", "3", "visible", "boundary"),
          T("a row", "2 4\n1 1 1 1\n2 2 2 2\n1\n1 0 1 3\n", "8", "hidden"),
          T("negatives", "2 2\n-1 -2\n-3 -4\n1\n0 0 1 1\n", "-10", "hidden", "edge"),
        ],
        compare: "lines",
        hints: [
          "P[i+1][j+1] = g[i][j] + P[i][j+1] + P[i+1][j] − P[i][j] (the overlap was added twice).",
          "P has (r + 1) × (c + 1) entries, row 0 and column 0 all zero.",
          "Rectangle sum = P[r2+1][c2+1] − P[r1][c2+1] − P[r2+1][c1] + P[r1][c1].",
          "Draw the four regions on paper to see why the last term is added back.",
        ],
        solution: r`#include <iostream>
#include <vector>
using namespace std;

int main() {
    int r, c;
    cin >> r >> c;
    vector<vector<long long>> g(r, vector<long long>(c));
    for (auto& row : g) for (auto& x : row) cin >> x;
    vector<vector<long long>> P(r + 1, vector<long long>(c + 1, 0));
    for (int i = 0; i < r; i++)
        for (int j = 0; j < c; j++)
            P[i + 1][j + 1] = g[i][j] + P[i][j + 1] + P[i + 1][j] - P[i][j];
    int q;
    cin >> q;
    for (int k = 0; k < q; k++) {
        int r1, c1, r2, c2;
        cin >> r1 >> c1 >> r2 >> c2;
        cout << P[r2 + 1][c2 + 1] - P[r1][c2 + 1] - P[r2 + 1][c1] + P[r1][c1] << endl;
    }
    return 0;
}`,
        solutionNotes: "Inclusion–exclusion: subtract the strip above and the strip to the left, then add back the corner that was subtracted twice. Every rectangle query is O(1).",
      },
    ),
    explainAgain: `A prefix-sum array is like the odometer readings at each milestone of a trip. To know how far you drove between milestone 3 and milestone 7, you don't re-measure the road — you subtract the two readings.`,
    summary: [
      "`pre[0] = 0`, `pre[i + 1] = pre[i] + a[i]` — built in one pass.",
      "Range sum [l, r] = `pre[r + 1] - pre[l]`, in O(1).",
      "Works for counts and in 2D (inclusion–exclusion).",
    ],
  },

  {
    id: "c-strings",
    moduleId: "arrays-strings",
    after: "string-problems",
    title: "C-style strings and character arrays in depth",
    minutes: 20,
    concepts: ["char array", "null terminator", "strlen", "strcmp", "buffer overflow"],
    goals: [
      "Understand how a C-string is stored: characters followed by `'\\0'`",
      "Use and implement `strlen`, `strcpy`-style copying and `strcmp`",
      "Avoid buffer overflows, and convert to and from `std::string`",
    ],
    intro: `Before \`std::string\`, text in C and C++ was a plain array of \`char\` ending in a special **null character** \`'\\0'\`. You'll meet C-strings in older code, in library functions and every time you write a string literal — and their pitfalls explain why \`std::string\` exists.`,
    sections: [
      {
        title: "How a C-string is stored",
        body: `\`\`\`cpp
char word[8] = "hello";
\`\`\`

| index | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| char | h | e | l | l | o | \\0 | ? | ? |

The array has room for 8 chars, the text uses 5, and \`'\\0'\` marks the end. Every function that works on C-strings walks until it finds that \`'\\0'\` — the array itself doesn't know its text length.`,
      },
      {
        title: "The classic functions (<cstring>)",
        body: `| Function | Does |
| --- | --- |
| \`strlen(s)\` | counts chars before \`'\\0'\` |
| \`strcpy(dst, src)\` | copies src (with \`'\\0'\`) into dst — **no size check!** |
| \`strncpy(dst, src, n)\` / \`snprintf\` | bounded copies |
| \`strcmp(a, b)\` | < 0, 0 or > 0, like dictionary order |
| \`strcat(dst, src)\` | appends — also unchecked |

Comparing C-strings with \`==\` compares **addresses**, not text. Use \`strcmp\`.`,
      },
      {
        title: "Buffer overflows and std::string",
        body: `\`strcpy\` into a buffer that's too small writes past its end — undefined behaviour and a classic security hole. Prefer \`std::string\`, and convert at the edges:

\`\`\`cpp
std::string s = cstr;          // C-string → string
const char* p = s.c_str();     // string → C-string (read-only, valid while s lives)
\`\`\``,
      },
    ],
    mistakes: [
      { title: "Forgetting room for '\\0'", body: "\"hello\" needs 6 chars of space, not 5." },
      { title: "Comparing with ==", body: "`a == b` on char arrays compares pointers. Use `strcmp(a, b) == 0` — or std::string." },
      { title: "Unbounded copies", body: "`strcpy`/`strcat` don't know the destination size. Check lengths, or use std::string." },
    ],
    example: {
      title: "Walking to the terminator",
      intro: "A hand-written length function next to the library one.",
      code: r`#include <iostream>
#include <cstring>
using namespace std;

int myLength(const char* s) {
    int n = 0;
    while (s[n] != '\0') n++;
    return n;
}

int main() {
    char word[8] = "hello";
    cout << myLength(word) << " " << strlen(word) << " " << sizeof(word) << endl;
    word[1] = 'a';
    word[3] = '\0';
    cout << word << " " << strlen(word) << endl;
    cout << (strcmp("apple", "banana") < 0) << " " << strcmp("cat", "cat") << endl;
    return 0;
}`,
      output: "5 5 8\nhal 3\n1 0\n",
      notes: [
        { line: 7, text: "Count characters until the null terminator." },
        { line: 13, text: "The array holds 8 chars, but the text is 5 long." },
        { line: 15, text: "Putting '\\0' at index 3 cuts the string to \"hal\"." },
      ],
    },
    quickCheck: {
      prompt: "`char s[5] = \"hello\";` — what's wrong?",
      options: [
        { id: "a", text: "There's no room for the '\\0' terminator", feedback: "Yes — \"hello\" needs 6 chars. (C++ rejects this initialiser.)" },
        { id: "b", text: "Nothing, 5 letters fit in 5 chars", feedback: "The terminator needs its own slot." },
        { id: "c", text: "Strings can't be stored in char arrays", feedback: "They can — that's exactly what a C-string is." },
      ],
      correct: "a",
      explanation: "A C-string of length n needs n + 1 chars of storage.",
    },
    exercise: {
      title: "Reverse in place",
      prompt: `Write \`void reverseInPlace(char* s)\` that reverses a C-string **in its own array**, using only the \`'\\0'\` terminator to find the end (no \`strlen\`, no std::string inside the function). The starter copies each input line into a \`char buf[101]\` and prints it after your function runs.`,
      starterCode: r`#include <iostream>
#include <string>
#include <cstring>
using namespace std;

void reverseInPlace(char* s) {
    // find the end by walking to '\0', then swap from both ends
}

int main() {
    string line;
    while (getline(cin, line)) {
        char buf[101];
        strncpy(buf, line.c_str(), 100);
        buf[100] = '\0';
        reverseInPlace(buf);
        cout << buf << endl;
    }
    return 0;
}`,
      tests: [
        { label: "word", input: "hello\n", output: "olleh", visibility: "sample", category: "normal" },
        { label: "with spaces", input: "C++ is fun\n", output: "nuf si ++C", visibility: "sample", category: "normal" },
        { label: "single", input: "x\n", output: "x", visibility: "hidden", category: "boundary" },
        { label: "even length", input: "abcd\n", output: "dcba", visibility: "hidden", category: "edge" },
        { label: "empty line", input: "\n", output: "", visibility: "hidden", category: "edge" },
      ],
      compare: "lines",
      hints: [
        "First find n: walk while s[n] != '\\0'.",
        "Then swap s[i] with s[n − 1 − i] for the first half.",
        "Use two indexes moving toward each other.",
        "`int i = 0, j = n - 1; while (i < j) { char t = s[i]; s[i] = s[j]; s[j] = t; i++; j--; }`",
      ],
      solution: r`#include <iostream>
#include <string>
#include <cstring>
using namespace std;

void reverseInPlace(char* s) {
    int n = 0;
    while (s[n] != '\0') n++;
    int i = 0, j = n - 1;
    while (i < j) {
        char t = s[i];
        s[i] = s[j];
        s[j] = t;
        i++;
        j--;
    }
}

int main() {
    string line;
    while (getline(cin, line)) {
        char buf[101];
        strncpy(buf, line.c_str(), 100);
        buf[100] = '\0';
        reverseInPlace(buf);
        cout << buf << endl;
    }
    return 0;
}`,
      solutionNotes: "The function never needs the array's size — only the terminator. The '\\0' stays where it is, so the reversed text is still a valid C-string. (`strncpy` doesn't always add a terminator, which is why main sets buf[100].)",
    },
    practice: practice(
      {
        title: "Write your own strcmp",
        prompt: `Write \`int myCompare(const char* a, const char* b)\` returning −1, 0 or 1 like dictionary order (by character codes), walking both strings with pointers. Read pairs of words until the input ends and print the result for each pair.`,
        starterCode: starter("Print myCompare(a.c_str(), b.c_str()) for each pair", "string a, b;", ["iostream", "string"], "// Write int myCompare(const char* a, const char* b) here"),
        tests: [
          T("sample", "apple banana\ncat cat\nzoo zebra\n", "-1\n0\n1", "sample"),
          T("prefix", "car cart\ncart car\n", "-1\n1", "visible", "edge"),
          T("case", "Zebra apple\n", "-1", "hidden", "edge"),
          T("single letters", "b a\n", "1", "hidden", "boundary"),
        ],
        compare: "lines",
        hints: [
          "Move both pointers while the characters are equal and not '\\0'.",
          "Stop at the first difference (or the end of either string).",
          "Compare the two characters there — as unsigned char.",
          "A shorter prefix ends with '\\0', which is smaller than any letter.",
        ],
        solution: r`#include <iostream>
#include <string>
using namespace std;

int myCompare(const char* a, const char* b) {
    while (*a != '\0' && *a == *b) {
        a++;
        b++;
    }
    unsigned char ca = *a, cb = *b;
    if (ca < cb) return -1;
    if (ca > cb) return 1;
    return 0;
}

int main() {
    string a, b;
    while (cin >> a >> b) {
        cout << myCompare(a.c_str(), b.c_str()) << endl;
    }
    return 0;
}`,
        solutionNotes: "When one string is a prefix of the other, the shorter one reaches '\\0' (code 0) first, so it compares as smaller — \"car\" < \"cart\". Uppercase letters have smaller codes than lowercase.",
      },
      {
        title: "A bounded join",
        prompt: `Write \`void safeJoin(char* dst, int cap, const char* a, const char* b)\` that writes a, a single space, then b into \`dst\` — but never more than \`cap − 1\` characters, always ending with \`'\\0'\`. Read \`cap\` (1 ≤ cap ≤ 50), then pairs of words; print the joined result for each pair.`,
        starterCode: r`#include <iostream>
#include <string>
using namespace std;

void safeJoin(char* dst, int cap, const char* a, const char* b) {
    // copy a, then ' ', then b — stop at cap - 1 characters, then add '\0'
}

int main() {
    int cap;
    cin >> cap;
    string a, b;
    while (cin >> a >> b) {
        char buf[50];
        safeJoin(buf, cap, a.c_str(), b.c_str());
        cout << "[" << buf << "]" << endl;
    }
    return 0;
}`,
        tests: [
          T("fits", "20\nhello world\n", "[hello world]", "sample"),
          T("truncated", "8\nhello world\n", "[hello w]", "sample"),
          T("cap 1", "1\nab cd\n", "[]", "hidden", "edge"),
          T("exact", "12\nhello world\n", "[hello world]", "hidden", "boundary"),
          T("cut at space", "6\nhello world\n", "[hello]", "hidden", "edge"),
        ],
        compare: "lines",
        hints: [
          "Keep an index n of how many characters you've written.",
          "Write a helper step: if n < cap − 1, dst[n++] = ch.",
          "Feed it every char of a, then ' ', then every char of b.",
          "Finish with dst[n] = '\\0' (n ≤ cap − 1 always).",
        ],
        solution: r`#include <iostream>
#include <string>
using namespace std;

void safeJoin(char* dst, int cap, const char* a, const char* b) {
    int n = 0;
    auto put = [&](char ch) {
        if (n < cap - 1) dst[n++] = ch;
    };
    for (const char* p = a; *p; p++) put(*p);
    put(' ');
    for (const char* p = b; *p; p++) put(*p);
    dst[n] = '\0';
}

int main() {
    int cap;
    cin >> cap;
    string a, b;
    while (cin >> a >> b) {
        char buf[50];
        safeJoin(buf, cap, a.c_str(), b.c_str());
        cout << "[" << buf << "]" << endl;
    }
    return 0;
}`,
        solutionNotes: "Every write goes through one bounds check, so the buffer can never overflow, and one slot is always kept for the terminator. With cap 6, \"hello \" is cut to \"hello\" plus '\\0' — the trailing space doesn't fit.",
      },
    ),
    explainAgain: `A C-string is a row of boxes with letters, and a special "stop" box ('\\0') after the last letter. Nothing else records where the text ends — so every function walks the boxes until it hits the stop sign. Forget the stop sign, or write past the last box, and things go badly wrong. std::string does that bookkeeping for you.`,
    summary: [
      "A C-string is chars followed by `'\\0'`; it needs length + 1 slots.",
      "`strlen`, `strcmp`, `strcpy` walk to the terminator; `==` compares addresses.",
      "Unbounded copies overflow; prefer std::string and `.c_str()` at the edges.",
    ],
  },
];
