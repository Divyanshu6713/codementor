import type { PracticeProblem } from "../types";
import { practice, starter, T } from "./helpers";

/** Practice problems for modules 1–3: foundations, variables & I/O, operators. */
export const BASICS_PRACTICE: Record<string, PracticeProblem[]> = {
  "what-is-programming": practice(
    {
      title: "Make a sandwich",
      prompt: `The steps below are in the wrong order. Rearrange the lines so the program prints:

\`\`\`
Take two slices of bread
Spread the butter
Add the filling
Close the sandwich
\`\`\``,
      starterCode: `#include <iostream>
using namespace std;

int main() {
    cout << "Add the filling" << endl;
    cout << "Close the sandwich" << endl;
    cout << "Take two slices of bread" << endl;
    cout << "Spread the butter" << endl;
    return 0;
}`,
      tests: [
        T("prints the steps in order", "", "Take two slices of bread\nSpread the butter\nAdd the filling\nClose the sandwich", "sample"),
        T("same output again", "", "Take two slices of bread\nSpread the butter\nAdd the filling\nClose the sandwich"),
      ],
      compare: "lines",
      hints: [
        "Which step has to happen first in real life?",
        "A program runs its lines from top to bottom.",
        "Move whole `cout` lines — don't change the text inside the quotes.",
        "Order: bread, butter, filling, close.",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    cout << "Take two slices of bread" << endl;
    cout << "Spread the butter" << endl;
    cout << "Add the filling" << endl;
    cout << "Close the sandwich" << endl;
    return 0;
}`,
      solutionNotes: "The computer runs the statements in the order they're written, so the order of the lines *is* the order of the steps.",
    },
    {
      title: "Morning routine — with a missing step",
      prompt: `This program should print a five-step morning routine, but one step is missing and two are swapped. Make it print exactly:

\`\`\`
1. Wake up
2. Brush teeth
3. Have breakfast
4. Pack the bag
5. Leave for school
\`\`\``,
      starterCode: `#include <iostream>
using namespace std;

int main() {
    cout << "1. Wake up" << endl;
    cout << "3. Have breakfast" << endl;
    cout << "2. Brush teeth" << endl;
    cout << "5. Leave for school" << endl;
    return 0;
}`,
      tests: [
        T("the full routine", "", "1. Wake up\n2. Brush teeth\n3. Have breakfast\n4. Pack the bag\n5. Leave for school", "sample"),
        T("same output again", "", "1. Wake up\n2. Brush teeth\n3. Have breakfast\n4. Pack the bag\n5. Leave for school"),
      ],
      compare: "lines",
      hints: [
        "Compare the expected output with what the program prints now. Which lines differ?",
        "Two lines are swapped, and one is missing entirely.",
        "Copy an existing `cout` line and change its text to add the missing step.",
        "Every step needs its own `cout … << endl;` line, in order 1 to 5.",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    cout << "1. Wake up" << endl;
    cout << "2. Brush teeth" << endl;
    cout << "3. Have breakfast" << endl;
    cout << "4. Pack the bag" << endl;
    cout << "5. Leave for school" << endl;
    return 0;
}`,
      solutionNotes: "Swap the breakfast and teeth lines, then add a new `cout` line for step 4 between breakfast and leaving.",
    },
  ),

  "how-programs-work": practice(
    {
      title: "Fix two compile errors",
      prompt: `This program should print:

\`\`\`
Compilers are strict
\`\`\`

…but it has **two** mistakes. Press **Run**, read the first error, fix it, and run again.`,
      starterCode: `#include <iostream>
using namespace std;

int main() {
    cout << "Compilers are strict << endl
    return 0;
}`,
      tests: [
        T("prints the sentence", "", "Compilers are strict", "sample"),
        T("same output again", "", "Compilers are strict"),
      ],
      compare: "lines",
      hints: [
        "Read the compiler's first message: which line does it point at?",
        "Text in C++ must start *and end* with a double quote.",
        "Every statement ends with a semicolon.",
        "Close the string after `strict`, and put `;` after `endl`.",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    cout << "Compilers are strict" << endl;
    return 0;
}`,
      solutionNotes: "The string was never closed (missing `\"`) and the statement had no `;`. Fixing the first error often reveals the next one.",
    },
    {
      title: "Fix three compile errors",
      prompt: `Make this program compile and print exactly:

\`\`\`
Errors are clues
Read them carefully
\`\`\`

There are **three** separate mistakes. C++ is case-sensitive!`,
      starterCode: `#include <iostream>
using namespace std;

int Main() {
    Cout << "Errors are clues" << endl;
    cout << "Read them carefully" << endl;
    return 0;
`,
      tests: [
        T("prints both lines", "", "Errors are clues\nRead them carefully", "sample"),
        T("same output again", "", "Errors are clues\nRead them carefully"),
      ],
      compare: "lines",
      hints: [
        "Look at the capital letters. Is `Cout` the same as `cout` to the compiler?",
        "The program must have a function called exactly `main`.",
        "Count the braces: every `{` needs a matching `}`.",
        "Fix `Main` → `main`, `Cout` → `cout`, and add the closing `}`.",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    cout << "Errors are clues" << endl;
    cout << "Read them carefully" << endl;
    return 0;
}`,
      solutionNotes: "C++ is case-sensitive: `Main` and `Cout` are different names from `main` and `cout`. The final closing brace was also missing.",
    },
  ),

  "program-structure": practice(
    {
      title: "Two lines from scratch",
      prompt: `Write a complete program that prints exactly:

\`\`\`
Line one
Line two
\`\`\``,
      starterCode: `// Write a complete C++ program here.
// It needs: an #include, using namespace std;, int main() { ... } and return 0;
`,
      tests: [
        T("prints both lines", "", "Line one\nLine two", "sample"),
        T("same output again", "", "Line one\nLine two"),
      ],
      compare: "lines",
      hints: [
        "Which header gives you `cout`?",
        "Start with `#include <iostream>` and `using namespace std;`.",
        "Everything the program does goes inside `int main() { … }`.",
        "Two `cout` statements, each ending with `endl`, then `return 0;`.",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    cout << "Line one" << endl;
    cout << "Line two" << endl;
    return 0;
}`,
      solutionNotes: "Every program has the same skeleton: the include, the using line, main with its statements, and `return 0;`.",
    },
    {
      title: "A boxed title",
      prompt: `Write a complete program that prints this box exactly (no spaces at the ends of lines):

\`\`\`
+--------+
| C++ 17 |
+--------+
\`\`\``,
      starterCode: `// Write a complete C++ program that prints the box.
`,
      tests: [
        T("prints the box", "", "+--------+\n| C++ 17 |\n+--------+", "sample"),
        T("same output again", "", "+--------+\n| C++ 17 |\n+--------+"),
      ],
      compare: "lines",
      hints: [
        "How many lines does the box have?",
        "Each line is one `cout` with the text in quotes.",
        "Count the dashes: 8 between the `+` signs.",
        "The middle line is `| C++ 17 |` — a space after `|` and before `|`.",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    cout << "+--------+" << endl;
    cout << "| C++ 17 |" << endl;
    cout << "+--------+" << endl;
    return 0;
}`,
      solutionNotes: "Output is exact: the number of dashes and spaces must match. Printing characters like `+`, `-` and `|` needs nothing special.",
    },
  ),

  "hello-world": practice(
    {
      title: "Quotes inside text",
      prompt: `Print exactly this line, quotes included:

\`\`\`
She said "Hello, World!"
\`\`\``,
      starterCode: starter("Print the line, including the double quotes"),
      tests: [
        T("prints the quote", "", "She said \"Hello, World!\"", "sample"),
        T("same output again", "", "She said \"Hello, World!\""),
      ],
      compare: "lines",
      hints: [
        "A `\"` normally ends a string. How can you print one?",
        "Escape sequences start with a backslash.",
        "`\\\"` inside a string prints a double quote.",
        "cout << \"She said \\\"Hello, World!\\\"\" << endl;",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    cout << "She said \\"Hello, World!\\"" << endl;
    return 0;
}`,
      solutionNotes: "`\\\"` is an escape sequence: it puts a double quote inside a string without ending it.",
    },
    {
      title: "A file path and a table",
      prompt: `Print exactly these three lines:

\`\`\`
Path: C:\\code\\main.cpp
Item	Qty
Pen	3
\`\`\`

The gap in lines 2 and 3 is a single **tab** character, not spaces.`,
      starterCode: starter("Print the path (with backslashes) and the two tab-separated lines"),
      tests: [
        T("prints all three lines", "", "Path: C:\\code\\main.cpp\nItem\tQty\nPen\t3", "sample"),
        T("same output again", "", "Path: C:\\code\\main.cpp\nItem\tQty\nPen\t3"),
      ],
      compare: "lines",
      hints: [
        "A backslash starts an escape sequence. How do you print a real backslash?",
        "`\\\\` prints one backslash.",
        "A tab is written `\\t`.",
        "cout << \"Item\\tQty\" << endl;",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    cout << "Path: C:\\\\code\\\\main.cpp" << endl;
    cout << "Item\\tQty" << endl;
    cout << "Pen\\t3" << endl;
    return 0;
}`,
      solutionNotes: "Inside a string, `\\\\` is one backslash and `\\t` is a tab. Without escaping, `\\c` and `\\m` would be read as (invalid) escape sequences.",
    },
  ),

  "input-output": practice(
    {
      title: "Sum, difference, product",
      prompt: `Read two whole numbers \`a\` and \`b\`. Print three lines: \`a + b\`, \`a - b\` and \`a * b\`.

| Input | Output |
| --- | --- |
| \`7 3\` | \`10\` / \`4\` / \`21\` |`,
      starterCode: starter("Read a and b, then print a + b, a - b and a * b on separate lines"),
      tests: [
        T("7 and 3", "7 3\n", "10\n4\n21", "sample"),
        T("negative result", "2 9\n", "11\n-7\n18", "visible", "edge"),
        T("zero", "0 5\n", "5\n-5\n0", "hidden", "edge"),
        T("larger", "120 45\n", "165\n75\n5400"),
      ],
      hints: [
        "How many numbers do you read, and into which variables?",
        "`cin >> a >> b;` reads both.",
        "Each result goes on its own line.",
        "cout << a + b << endl; … then a - b, then a * b.",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    cout << a - b << endl;
    cout << a * b << endl;
    return 0;
}`,
      solutionNotes: "Read both numbers with one `cin`, then print each expression followed by `endl`.",
    },
    {
      title: "Greeting with next year's age",
      prompt: `Read a first name (one word) and an age. Print:

\`\`\`
Hello, NAME! Next year you will be AGE+1.
\`\`\`

| Input | Output |
| --- | --- |
| \`Riya 14\` | \`Hello, Riya! Next year you will be 15.\` |`,
      starterCode: starter("Read the name and age, then print the greeting", "", ["iostream", "string"]),
      tests: [
        T("Riya 14", "Riya 14\n", "Hello, Riya! Next year you will be 15.", "sample"),
        T("Arjun 9", "Arjun 9\n", "Hello, Arjun! Next year you will be 10.", "visible"),
        T("age 0", "Baby 0\n", "Hello, Baby! Next year you will be 1.", "hidden", "edge"),
        T("age 99", "Dadi 99\n", "Hello, Dadi! Next year you will be 100."),
      ],
      compare: "lines",
      hints: [
        "Which type holds a word? Which holds the age?",
        "`string name; int age; cin >> name >> age;`",
        "Build the sentence from pieces joined with `<<`.",
        "Mind the comma, the `!` and the final `.` — the output must match exactly.",
      ],
      solution: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string name;
    int age;
    cin >> name >> age;
    cout << "Hello, " << name << "! Next year you will be " << age + 1 << "." << endl;
    return 0;
}`,
      solutionNotes: "`cin >>` reads the word into the string and the number into the int. Text and values are joined with `<<`, and `age + 1` is computed while printing.",
    },
  ),

  "variables": practice(
    {
      title: "Rotate three values",
      prompt: `Read three whole numbers into \`a\`, \`b\` and \`c\`. Rotate them so that \`a\` gets \`b\`'s value, \`b\` gets \`c\`'s, and \`c\` gets \`a\`'s original value. Print \`a b c\`.

| Input | Output |
| --- | --- |
| \`1 2 3\` | \`2 3 1\` |`,
      starterCode: starter("Rotate the values (a <- b, b <- c, c <- old a), then print a b c", "int a, b, c;\ncin >> a >> b >> c;"),
      tests: [
        T("1 2 3", "1 2 3\n", "2 3 1", "sample"),
        T("all the same", "5 5 5\n", "5 5 5", "visible", "edge"),
        T("negatives", "-1 0 7\n", "0 7 -1"),
        T("larger", "10 20 30\n", "20 30 10"),
      ],
      hints: [
        "If you do `a = b;` first, what happens to a's original value?",
        "It's lost — so save it first.",
        "Use one temporary variable: `int t = a;`.",
        "int t = a; a = b; b = c; c = t;",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int a, b, c;
    cin >> a >> b >> c;
    int t = a;
    a = b;
    b = c;
    c = t;
    cout << a << " " << b << " " << c << endl;
    return 0;
}`,
      solutionNotes: "Assignment overwrites, so keep a's original value in `t` before it's replaced, and give it to `c` at the end.",
    },
    {
      title: "Running total",
      prompt: `Read four whole numbers. After reading each one, print the total so far — using **one** variable for the total.

| Input | Output |
| --- | --- |
| \`5 3 10 2\` | \`5\` / \`8\` / \`18\` / \`20\` |`,
      starterCode: starter("Keep one total variable; read each number, add it, print the total so far", "int total = 0;\nint x;"),
      tests: [
        T("5 3 10 2", "5 3 10 2\n", "5\n8\n18\n20", "sample"),
        T("with negatives", "4 -4 1 -1\n", "4\n0\n1\n0", "visible", "edge"),
        T("zeros", "0 0 0 0\n", "0\n0\n0\n0", "hidden", "edge"),
        T("larger", "100 250 1000 9\n", "100\n350\n1350\n1359"),
      ],
      hints: [
        "You can reuse one variable `x` for each number you read.",
        "`total += x;` adds the new number to the total.",
        "Print the total right after each addition.",
        "Repeat four times: cin >> x; total += x; cout << total << endl;",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int total = 0;
    int x;
    cin >> x; total += x; cout << total << endl;
    cin >> x; total += x; cout << total << endl;
    cin >> x; total += x; cout << total << endl;
    cin >> x; total += x; cout << total << endl;
    return 0;
}`,
      solutionNotes: "A variable keeps its value until you change it, so `total += x` keeps growing. (In the Loops module you'll write this with one loop instead of four copies.)",
    },
  ),

  "data-types": practice(
    {
      title: "Next letter and its code",
      prompt: `Read one character. Print the **next** character and the original character's numeric code, separated by a space.

| Input | Output |
| --- | --- |
| \`a\` | \`b 97\` |
| \`Y\` | \`Z 89\` |`,
      starterCode: starter("Read a char, print the next character and the original's code"),
      tests: [
        T("a", "a\n", "b 97", "sample"),
        T("Y", "Y\n", "Z 89", "visible"),
        T("digit 0", "0\n", "1 48"),
        T("m", "m\n", "n 109"),
      ],
      hints: [
        "Characters are stored as numbers. Which type reads one character?",
        "`char c; cin >> c;`",
        "`char(c + 1)` is the next character; `int(c)` is its code.",
        "cout << char(c + 1) << \" \" << int(c);",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    char c;
    cin >> c;
    char next = c + 1;
    cout << next << " " << int(c) << endl;
    return 0;
}`,
      solutionNotes: "A char is a small integer holding a character code. Storing `c + 1` back in a char prints a letter; converting with `int(c)` prints the number.",
    },
    {
      title: "Bill with a discount",
      prompt: `Read a price (it may have decimals) and a quantity (whole number). The total is price × quantity, but if the total is **more than 1000**, take 10% off. Print the final amount with **exactly 2 decimal places**.

| Input | Output |
| --- | --- |
| \`250.5 4\` | \`901.80\` |
| \`99.99 3\` | \`299.97\` |`,
      starterCode: starter("Compute the total, apply 10% off above 1000, print with 2 decimals", "", ["iostream", "iomanip"]),
      tests: [
        T("discount applies", "250.5 4\n", "901.80", "sample"),
        T("no discount", "99.99 3\n", "299.97", "sample"),
        T("exactly 1000 (no discount)", "250 4\n", "1000.00", "hidden", "boundary"),
        T("just over 1000", "1000.01 1\n", "900.01", "hidden", "boundary"),
        T("zero quantity", "15.5 0\n", "0.00", "hidden", "edge"),
      ],
      hints: [
        "Which type holds 250.5? And the quantity?",
        "Compute `double total = price * qty;`.",
        "Use an `if` for the discount: `if (total > 1000) total *= 0.9;`.",
        "`cout << fixed << setprecision(2) << total;` prints exactly two decimals.",
      ],
      solution: `#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    double price;
    int qty;
    cin >> price >> qty;
    double total = price * qty;
    if (total > 1000) total *= 0.9;
    cout << fixed << setprecision(2) << total << endl;
    return 0;
}`,
      solutionNotes: "Use a double for money here, and `fixed << setprecision(2)` to always show two decimals (1000 prints as `1000.00`). \"More than 1000\" means `>`, so exactly 1000 gets no discount.",
    },
  ),

  "operators": practice(
    {
      title: "Digit sum of a 3-digit number",
      prompt: `Read a 3-digit number (100–999). Print the sum of its digits — **without a loop**, using \`/\` and \`%\`.

| Input | Output |
| --- | --- |
| \`482\` | \`14\` |`,
      starterCode: starter("Split the number into hundreds, tens and ones with / and %, then add them", "int n;\ncin >> n;"),
      tests: [
        T("482", "482\n", "14", "sample"),
        T("100", "100\n", "1", "visible", "boundary"),
        T("999", "999\n", "27", "hidden", "boundary"),
        T("305", "305\n", "8"),
      ],
      hints: [
        "How do you get the last digit of a number?",
        "`n % 10` is the ones digit.",
        "`n / 10 % 10` is the tens digit, `n / 100` the hundreds.",
        "cout << n / 100 + n / 10 % 10 + n % 10;",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int hundreds = n / 100;
    int tens = n / 10 % 10;
    int ones = n % 10;
    cout << hundreds + tens + ones << endl;
    return 0;
}`,
      solutionNotes: "Integer division drops digits from the right; `% 10` keeps only the last digit. Combining them extracts any digit.",
    },
    {
      title: "Seconds to a clock",
      prompt: `Read a number of seconds (0 to 359999). Print it as \`H:MM:SS\` — hours without padding, minutes and seconds always with two digits.

| Input | Output |
| --- | --- |
| \`3725\` | \`1:02:05\` |
| \`59\` | \`0:00:59\` |`,
      starterCode: starter("Convert to hours, minutes and seconds; pad minutes and seconds to 2 digits", "int s;\ncin >> s;", ["iostream", "iomanip"]),
      tests: [
        T("3725", "3725\n", "1:02:05", "sample"),
        T("59", "59\n", "0:00:59", "sample"),
        T("0", "0\n", "0:00:00", "hidden", "edge"),
        T("one hour exactly", "3600\n", "1:00:00", "hidden", "boundary"),
        T("largest", "359999\n", "99:59:59", "hidden", "boundary"),
      ],
      compare: "lines",
      hints: [
        "How many seconds are in an hour? In a minute?",
        "Hours: s / 3600. What's left: s % 3600. Minutes: that / 60. Seconds: s % 60.",
        "To print 2 as `02`, use `setw(2)` with `setfill('0')` from <iomanip>.",
        "cout << h << \":\" << setfill('0') << setw(2) << m << \":\" << setw(2) << sec;",
      ],
      solution: `#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    int s;
    cin >> s;
    int h = s / 3600;
    int m = s % 3600 / 60;
    int sec = s % 60;
    cout << h << ":" << setfill('0') << setw(2) << m << ":" << setw(2) << sec << endl;
    return 0;
}`,
      solutionNotes: "Peel off units from largest to smallest with `/` and `%`. `setw(2)` applies only to the next value, so it's repeated for the seconds; `setfill('0')` stays in effect.",
    },
  ),
};
