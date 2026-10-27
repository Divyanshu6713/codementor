import type { PracticeProblem } from "../types";
import { practice, starter, T } from "./helpers";

/** Practice problems for modules 4–5: conditional statements and loops. */
export const LOGIC_LOOPS_PRACTICE: Record<string, PracticeProblem[]> = {
  "comparison-operators": practice(
    {
      title: "Three comparisons",
      prompt: `Read three whole numbers \`a\`, \`b\`, \`c\`. Print three lines — the value (\`1\` or \`0\`) of:

1. \`a < b\`
2. \`b <= c\`
3. \`a == c\``,
      starterCode: starter("Print (a < b), (b <= c) and (a == c), one per line", "int a, b, c;\ncin >> a >> b >> c;"),
      tests: [
        T("1 2 3", "1 2 3\n", "1\n1\n0", "sample"),
        T("all equal", "4 4 4\n", "0\n1\n1", "visible", "edge"),
        T("descending", "9 5 1\n", "0\n0\n0"),
        T("b equals c", "2 7 7\n", "1\n1\n0", "hidden", "boundary"),
      ],
      hints: [
        "A comparison is an expression that gives true or false.",
        "Printing a bool with cout shows 1 or 0.",
        "Wrap each comparison in parentheses when printing: `cout << (a < b)`.",
        "Three cout lines, one comparison each.",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int a, b, c;
    cin >> a >> b >> c;
    cout << (a < b) << endl;
    cout << (b <= c) << endl;
    cout << (a == c) << endl;
    return 0;
}`,
      solutionNotes: "The parentheses matter: `cout << a < b` would try to compare the stream with b. Note `<=` is true when the values are equal.",
    },
    {
      title: "Same parity — even with negatives",
      prompt: `Read two whole numbers (they may be negative). Print \`1\` if they are **both even or both odd**, otherwise \`0\`. Use a single comparison expression (no \`if\`).

Careful: in C++, \`-3 % 2\` is \`-1\`, not \`1\`.`,
      starterCode: starter("Print 1 if a and b have the same parity, else 0", "int a, b;\ncin >> a >> b;"),
      tests: [
        T("both odd", "3 5\n", "1", "sample"),
        T("odd and even", "3 4\n", "0", "sample"),
        T("negative odd and positive odd", "-3 1\n", "1", "hidden", "edge"),
        T("both negative even", "-4 -10\n", "1", "hidden", "edge"),
        T("zero and odd", "0 -7\n", "0", "hidden", "edge"),
      ],
      hints: [
        "Two numbers have the same parity exactly when their difference is…?",
        "…even.",
        "`a % 2 == b % 2` fails for -3 and 1, because -3 % 2 is -1.",
        "cout << ((a - b) % 2 == 0);",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << ((a - b) % 2 == 0) << endl;
    return 0;
}`,
      solutionNotes: "Same parity ⇔ the difference is even. Checking the difference avoids the trap that `%` keeps the sign of the left operand for negative numbers.",
    },
  ),

  "logical-operators": practice(
    {
      title: "Can I ride?",
      prompt: `A ride needs riders to be **at least 10 years old AND at least 140 cm tall**. Read age and height (whole numbers). Print \`1\` if allowed, otherwise \`0\`.`,
      starterCode: starter("Print 1 if age >= 10 and height >= 140, otherwise 0", "int age, height;\ncin >> age >> height;"),
      tests: [
        T("allowed", "12 150\n", "1", "sample"),
        T("too short", "12 120\n", "0", "sample"),
        T("exactly the limits", "10 140\n", "1", "hidden", "boundary"),
        T("too young", "9 160\n", "0", "hidden", "boundary"),
        T("both fail", "5 100\n", "0"),
      ],
      hints: [
        "Both conditions must be true. Which operator means \"and\"?",
        "`&&`.",
        "\"At least\" includes the limit itself: `>=`.",
        "cout << (age >= 10 && height >= 140);",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int age, height;
    cin >> age >> height;
    cout << (age >= 10 && height >= 140) << endl;
    return 0;
}`,
      solutionNotes: "`&&` is true only when both sides are. \"At least\" means `>=`, so 10 and 140 exactly are allowed.",
    },
    {
      title: "Exactly one positive",
      prompt: `Read two whole numbers. Print \`1\` if **exactly one** of them is positive (greater than 0), otherwise \`0\`. Zero is not positive.`,
      starterCode: starter("Print 1 if exactly one of a, b is > 0, else 0", "int a, b;\ncin >> a >> b;"),
      tests: [
        T("one positive", "5 -2\n", "1", "sample"),
        T("both positive", "3 8\n", "0", "sample"),
        T("both not positive", "-1 0\n", "0", "hidden", "edge"),
        T("zero and positive", "0 4\n", "1", "hidden", "edge"),
        T("negative then positive", "-9 9\n", "1"),
      ],
      hints: [
        "\"Exactly one\" means one is true and the other is false.",
        "Write it as: (a positive and b not) or (b positive and a not).",
        "Shorter: two bools are different exactly when `!=` is true.",
        "cout << ((a > 0) != (b > 0));",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << ((a > 0) != (b > 0)) << endl;
    return 0;
}`,
      solutionNotes: "Comparing two bools with `!=` is \"exclusive or\": true when exactly one is true. The long form `(a > 0 && !(b > 0)) || (!(a > 0) && b > 0)` means the same.",
    },
  ),

  "if-statements": practice(
    {
      title: "Absolute value",
      prompt: `Read a whole number. If it is negative, make it positive. Print the result.`,
      starterCode: starter("If n is negative, flip its sign; then print n", "int n;\ncin >> n;"),
      tests: [
        T("negative", "-7\n", "7", "sample"),
        T("positive", "12\n", "12", "sample"),
        T("zero", "0\n", "0", "hidden", "edge"),
        T("large negative", "-100000\n", "100000"),
      ],
      hints: [
        "When does anything need to change?",
        "Only when n < 0.",
        "Flip the sign with `n = -n;`.",
        "if (n < 0) n = -n;\ncout << n;",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    if (n < 0) {
        n = -n;
    }
    cout << n << endl;
    return 0;
}`,
      solutionNotes: "The if changes n only when it's negative; the print runs either way because it's after the if.",
    },
    {
      title: "Speeding fine",
      prompt: `Read a speed (km/h). The fine starts at 0. Over **60** adds 500. Over **80** adds a further 1000. Over **100** adds a further 2000. Print the total fine.

| Input | Output |
| --- | --- |
| \`75\` | \`500\` |
| \`95\` | \`1500\` |`,
      starterCode: starter("Add to the fine with separate if statements, then print it", "int speed;\ncin >> speed;\nint fine = 0;"),
      tests: [
        T("75", "75\n", "500", "sample"),
        T("95", "95\n", "1500", "sample"),
        T("exactly 60", "60\n", "0", "hidden", "boundary"),
        T("exactly 80", "80\n", "500", "hidden", "boundary"),
        T("120", "120\n", "3500", "hidden"),
        T("slow", "30\n", "0", "hidden", "edge"),
      ],
      hints: [
        "Can more than one rule apply to the same speed?",
        "Yes — so use separate `if`s, not else-if.",
        "\"Over 60\" is `speed > 60` (60 itself is fine).",
        "if (speed > 60) fine += 500; if (speed > 80) fine += 1000; …",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int speed;
    cin >> speed;
    int fine = 0;
    if (speed > 60) fine += 500;
    if (speed > 80) fine += 1000;
    if (speed > 100) fine += 2000;
    cout << fine << endl;
    return 0;
}`,
      solutionNotes: "Each `if` is checked on its own, so a speed over 100 collects all three amounts. \"Over\" means `>`.",
    },
  ),

  "if-else": practice(
    {
      title: "The larger of two",
      prompt: `Read two whole numbers. Print the larger one (if they are equal, print that value).`,
      starterCode: starter("Print the larger of a and b", "int a, b;\ncin >> a >> b;"),
      tests: [
        T("3 9", "3 9\n", "9", "sample"),
        T("9 3", "9 3\n", "9", "sample"),
        T("equal", "4 4\n", "4", "hidden", "edge"),
        T("negatives", "-8 -2\n", "-2", "hidden", "edge"),
      ],
      hints: [
        "Exactly one of two things should be printed.",
        "That's if / else.",
        "If a is bigger than b, print a…",
        "if (a > b) cout << a; else cout << b;",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    if (a > b) {
        cout << a << endl;
    } else {
        cout << b << endl;
    }
    return 0;
}`,
      solutionNotes: "When they're equal, `a > b` is false, so the else prints b — which is the same value.",
    },
    {
      title: "Is it a triangle?",
      prompt: `Read three side lengths (positive whole numbers). They make a triangle only if **each** pair of sides adds up to **more** than the third side. Print \`valid\` or \`invalid\`.`,
      starterCode: starter("Print valid if a+b>c, a+c>b and b+c>a; otherwise invalid", "int a, b, c;\ncin >> a >> b >> c;"),
      tests: [
        T("3 4 5", "3 4 5\n", "valid", "sample"),
        T("1 2 10", "1 2 10\n", "invalid", "sample"),
        T("flat (sum equals third)", "2 3 5\n", "invalid", "hidden", "boundary"),
        T("equilateral", "7 7 7\n", "valid", "hidden"),
        T("long side first", "10 2 1\n", "invalid", "hidden", "edge"),
      ],
      hints: [
        "How many conditions must hold?",
        "Three: a+b>c, a+c>b, b+c>a.",
        "All of them — combine with &&.",
        "if (a + b > c && a + c > b && b + c > a) … else …",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int a, b, c;
    cin >> a >> b >> c;
    if (a + b > c && a + c > b && b + c > a) {
        cout << "valid" << endl;
    } else {
        cout << "invalid" << endl;
    }
    return 0;
}`,
      solutionNotes: "All three inequalities must be strict (`>`): when two sides add up to exactly the third, the \"triangle\" is flat.",
    },
  ),

  "else-if": practice(
    {
      title: "Weather words",
      prompt: `Read a temperature (whole number, °C) and print one word:

| Temperature | Word |
| --- | --- |
| below 0 | \`freezing\` |
| 0 to 14 | \`cold\` |
| 15 to 24 | \`pleasant\` |
| 25 or more | \`hot\` |`,
      starterCode: starter("Print freezing / cold / pleasant / hot", "int t;\ncin >> t;"),
      tests: [
        T("20", "20\n", "pleasant", "sample"),
        T("-5", "-5\n", "freezing", "sample"),
        T("0 is cold", "0\n", "cold", "hidden", "boundary"),
        T("14 is cold", "14\n", "cold", "hidden", "boundary"),
        T("15 is pleasant", "15\n", "pleasant", "hidden", "boundary"),
        T("25 is hot", "25\n", "hot", "hidden", "boundary"),
      ],
      hints: [
        "Exactly one word is printed — which structure guarantees that?",
        "An if / else-if / else ladder.",
        "Check the ranges in order from coldest to hottest.",
        "if (t < 0) … else if (t < 15) … else if (t < 25) … else …",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int t;
    cin >> t;
    if (t < 0) cout << "freezing";
    else if (t < 15) cout << "cold";
    else if (t < 25) cout << "pleasant";
    else cout << "hot";
    cout << endl;
    return 0;
}`,
      solutionNotes: "Because the ladder checks in order, each later test can assume the earlier ones failed — `t < 15` there already means 0 to 14.",
    },
    {
      title: "Electricity bill slabs",
      prompt: `Read the units used (0 or more). Charge per unit:

- the first 100 units at 5 each,
- the next 100 units (101–200) at 7 each,
- every unit above 200 at 10 each.

Print the total bill.

| Input | Output |
| --- | --- |
| \`150\` | \`850\` |`,
      starterCode: starter("Compute the bill using the three slabs", "int u;\ncin >> u;"),
      tests: [
        T("150", "150\n", "850", "sample"),
        T("50", "50\n", "250", "sample"),
        T("100 exactly", "100\n", "500", "hidden", "boundary"),
        T("200 exactly", "200\n", "1200", "hidden", "boundary"),
        T("350", "350\n", "2700", "hidden"),
        T("zero", "0\n", "0", "hidden", "edge"),
      ],
      hints: [
        "For 150 units: the first 100 cost 500, the other 50 cost 350.",
        "Use a ladder on the ranges: up to 100, up to 200, above 200.",
        "Above 200: 100×5 + 100×7 + (u − 200)×10.",
        "if (u <= 100) bill = u * 5; else if (u <= 200) bill = 500 + (u - 100) * 7; else …",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int u;
    cin >> u;
    int bill;
    if (u <= 100) bill = u * 5;
    else if (u <= 200) bill = 100 * 5 + (u - 100) * 7;
    else bill = 100 * 5 + 100 * 7 + (u - 200) * 10;
    cout << bill << endl;
    return 0;
}`,
      solutionNotes: "Slabs only charge the higher rate for the units inside that slab, so each branch adds the full lower slabs plus the part in its own slab.",
    },
  ),

  "nested-conditions": practice(
    {
      title: "Which quadrant?",
      prompt: `Read a point \`x y\`. Print \`Q1\`, \`Q2\`, \`Q3\` or \`Q4\` for the quadrant, or \`axis\` if the point is on either axis.

(Q1: x>0, y>0 · Q2: x<0, y>0 · Q3: x<0, y<0 · Q4: x>0, y<0)`,
      starterCode: starter("Print the quadrant, or axis", "int x, y;\ncin >> x >> y;"),
      tests: [
        T("3 4", "3 4\n", "Q1", "sample"),
        T("-2 5", "-2 5\n", "Q2", "sample"),
        T("-1 -1", "-1 -1\n", "Q3", "hidden"),
        T("7 -3", "7 -3\n", "Q4", "hidden"),
        T("on the y-axis", "0 5\n", "axis", "hidden", "edge"),
        T("origin", "0 0\n", "axis", "hidden", "edge"),
      ],
      hints: [
        "Handle the special case first: is the point on an axis?",
        "`x == 0 || y == 0` → axis.",
        "Otherwise, decide by the sign of x, then inside that by the sign of y.",
        "if (x > 0) { if (y > 0) Q1 else Q4 } else { if (y > 0) Q2 else Q3 }",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int x, y;
    cin >> x >> y;
    if (x == 0 || y == 0) {
        cout << "axis";
    } else if (x > 0) {
        if (y > 0) cout << "Q1";
        else cout << "Q4";
    } else {
        if (y > 0) cout << "Q2";
        else cout << "Q3";
    }
    cout << endl;
    return 0;
}`,
      solutionNotes: "Checking the axis case first means the nested checks only see non-zero x and y, so `else` safely means \"negative\".",
    },
    {
      title: "Cinema ticket",
      prompt: `Read an age and a day number (1 = Monday … 7 = Sunday). The base price is:

- under 12: 100
- 60 or over: 150
- everyone else: 250

On the weekend (day 6 or 7) add 50 — **except** for the 60-and-over group. Print the price. If the day isn't 1–7, print \`invalid\`.`,
      starterCode: starter("Work out the base price from age, add the weekend charge where it applies", "int age, day;\ncin >> age >> day;"),
      tests: [
        T("child on Monday", "8 1\n", "100", "sample"),
        T("adult on Saturday", "30 6\n", "300", "sample"),
        T("senior on Sunday", "65 7\n", "150", "hidden", "edge"),
        T("age 12 is an adult", "12 3\n", "250", "hidden", "boundary"),
        T("age 60 is a senior", "60 2\n", "150", "hidden", "boundary"),
        T("bad day", "20 9\n", "invalid", "hidden", "edge"),
        T("child on Sunday", "5 7\n", "150", "hidden"),
      ],
      hints: [
        "Check the invalid-day case first.",
        "Then pick the base price with an else-if ladder on age.",
        "The weekend extra depends on *two* things: the day and the age group.",
        "if (day >= 6 && age < 60) price += 50;",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int age, day;
    cin >> age >> day;
    if (day < 1 || day > 7) {
        cout << "invalid" << endl;
        return 0;
    }
    int price;
    if (age < 12) price = 100;
    else if (age >= 60) price = 150;
    else price = 250;
    if (day >= 6 && age < 60) price += 50;
    cout << price << endl;
    return 0;
}`,
      solutionNotes: "Validate first and stop early. Then compute the base price, and apply the weekend rule as a separate decision that looks at both the day and the age group.",
    },
  ),

  "switch": practice(
    {
      title: "A tiny calculator",
      prompt: `Read \`a op b\` where op is one of \`+ - * /\` (whole numbers, integer division). Print the result using a \`switch\` on op. Print \`error\` for division by zero and \`invalid\` for any other operator.

| Input | Output |
| --- | --- |
| \`7 * 6\` | \`42\` |`,
      starterCode: starter("switch on op and print the result (or error / invalid)", "int a, b;\nchar op;\ncin >> a >> op >> b;"),
      tests: [
        T("7 * 6", "7 * 6\n", "42", "sample"),
        T("9 - 12", "9 - 12\n", "-3", "sample"),
        T("integer division", "7 / 2\n", "3", "hidden"),
        T("divide by zero", "5 / 0\n", "error", "hidden", "edge"),
        T("unknown operator", "5 % 2\n", "invalid", "hidden", "edge"),
        T("addition", "100 + 23\n", "123", "hidden"),
      ],
      hints: [
        "op is a char — switch works on chars.",
        "One `case '+':` per operator, each ending with break.",
        "Inside the '/' case, check b == 0 before dividing.",
        "default: cout << \"invalid\";",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    char op;
    cin >> a >> op >> b;
    switch (op) {
        case '+': cout << a + b; break;
        case '-': cout << a - b; break;
        case '*': cout << a * b; break;
        case '/':
            if (b == 0) cout << "error";
            else cout << a / b;
            break;
        default: cout << "invalid";
    }
    cout << endl;
    return 0;
}`,
      solutionNotes: "Character cases are written with single quotes. Every case ends with `break` so only one runs, and `default` catches anything unexpected.",
    },
    {
      title: "Days in a month",
      prompt: `Read a month (1–12) and a year. Print the number of days in that month. February has 29 days in a leap year (divisible by 4, except centuries not divisible by 400). Use a \`switch\` where months with the same length **share** one block. Print \`invalid\` for a bad month.`,
      starterCode: starter("switch on the month; let months with the same length fall through to one block", "int m, y;\ncin >> m >> y;"),
      tests: [
        T("January", "1 2023\n", "31", "sample"),
        T("February 2024", "2 2024\n", "29", "sample"),
        T("February 1900", "2 1900\n", "28", "hidden", "edge"),
        T("February 2000", "2 2000\n", "29", "hidden", "edge"),
        T("September", "9 2023\n", "30", "hidden"),
        T("December", "12 2023\n", "31", "hidden"),
        T("bad month", "13 2023\n", "invalid", "hidden", "edge"),
      ],
      hints: [
        "Which months have 31 days? Which have 30?",
        "Cases can be stacked: `case 4: case 6: case 9: case 11: cout << 30; break;`",
        "February needs the leap-year rule.",
        "bool leap = (y % 4 == 0 && y % 100 != 0) || y % 400 == 0;",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int m, y;
    cin >> m >> y;
    bool leap = (y % 4 == 0 && y % 100 != 0) || y % 400 == 0;
    switch (m) {
        case 1: case 3: case 5: case 7: case 8: case 10: case 12:
            cout << 31;
            break;
        case 4: case 6: case 9: case 11:
            cout << 30;
            break;
        case 2:
            cout << (leap ? 29 : 28);
            break;
        default:
            cout << "invalid";
    }
    cout << endl;
    return 0;
}`,
      solutionNotes: "Stacked cases with no statements between them fall through to the same block — a deliberate use of fall-through.",
    },
  ),

  "why-loops": practice(
    {
      title: "The 7 times table",
      prompt: `Print the 7 times table from 1 to 10, one line each, in the form \`7 x 1 = 7\`. (No input.)`,
      starterCode: starter("Use a loop to print 7 x 1 = 7 up to 7 x 10 = 70"),
      tests: [
        T("the table", "", "7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35\n7 x 6 = 42\n7 x 7 = 49\n7 x 8 = 56\n7 x 9 = 63\n7 x 10 = 70", "sample"),
        T("same output again", "", "7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35\n7 x 6 = 42\n7 x 7 = 49\n7 x 8 = 56\n7 x 9 = 63\n7 x 10 = 70"),
      ],
      compare: "lines",
      hints: [
        "Ten lines that differ only in one number — a loop's job.",
        "Let a counter i go from 1 to 10.",
        "Each line prints 7, i and 7 * i.",
        "for (int i = 1; i <= 10; i++) cout << \"7 x \" << i << \" = \" << 7 * i << endl;",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    for (int i = 1; i <= 10; i++) {
        cout << "7 x " << i << " = " << 7 * i << endl;
    }
    return 0;
}`,
      solutionNotes: "One loop replaces ten nearly identical cout lines; only the counter changes.",
    },
    {
      title: "Even numbers to 50",
      prompt: `Print the even numbers from 2 to 50 on **one line**, separated by single spaces (no space after the last one). (No input.)`,
      starterCode: starter("Print 2 4 6 ... 50 on one line"),
      tests: [
        T("evens", "", "2 4 6 8 10 12 14 16 18 20 22 24 26 28 30 32 34 36 38 40 42 44 46 48 50", "sample"),
        T("same output again", "", "2 4 6 8 10 12 14 16 18 20 22 24 26 28 30 32 34 36 38 40 42 44 46 48 50"),
      ],
      compare: "lines",
      hints: [
        "Which loop step gives only even numbers?",
        "Start at 2 and add 2 each time.",
        "Print a space *before* every number except the first.",
        "for (int i = 2; i <= 50; i += 2) { if (i > 2) cout << \" \"; cout << i; }",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    for (int i = 2; i <= 50; i += 2) {
        if (i > 2) cout << " ";
        cout << i;
    }
    cout << endl;
    return 0;
}`,
      solutionNotes: "Stepping by 2 visits only even numbers. Printing the separator before every item except the first avoids a trailing space.",
    },
  ),

  "for-loops": practice(
    {
      title: "Sum of squares",
      prompt: `Read \`n\` (0 ≤ n ≤ 1000). Print 1² + 2² + … + n².`,
      starterCode: starter("Add up i * i for i from 1 to n", "int n;\ncin >> n;"),
      tests: [
        T("n = 3", "3\n", "14", "sample"),
        T("n = 1", "1\n", "1", "visible", "boundary"),
        T("n = 0", "0\n", "0", "hidden", "edge"),
        T("n = 10", "10\n", "385", "hidden"),
        T("n = 1000 (needs a big type)", "1000\n", "333833500", "hidden", "edge"),
      ],
      hints: [
        "You need a running total that starts at 0.",
        "Loop i from 1 to n and add i * i.",
        "For n = 1000 the total is about 333 million — does it fit in an int?",
        "long long sum = 0; for (int i = 1; i <= n; i++) sum += (long long)i * i;",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    long long sum = 0;
    for (int i = 1; i <= n; i++) {
        sum += (long long)i * i;
    }
    cout << sum << endl;
    return 0;
}`,
      solutionNotes: "An accumulator starts at 0 and grows inside the loop. long long keeps larger totals safe (an int would also hold 333,833,500, but only just).",
    },
    {
      title: "Multiples of 3 or 5 in a range",
      prompt: `Read \`a\` and \`b\` (a ≤ b, both between 1 and 1 000 000). Print how many numbers from a to b (inclusive) are divisible by **3 or 5**.`,
      starterCode: starter("Count numbers in [a, b] divisible by 3 or by 5", "int a, b;\ncin >> a >> b;"),
      tests: [
        T("1 to 10", "1 10\n", "5", "sample"),
        T("single number", "15 15\n", "1", "visible", "boundary"),
        T("none", "7 8\n", "0", "hidden", "edge"),
        T("1 to 100", "1 100\n", "47", "hidden"),
        T("large range", "1 1000000\n", "466667", "hidden", "edge"),
      ],
      hints: [
        "Loop over every number from a to b.",
        "Divisible by 3 means `i % 3 == 0`.",
        "\"3 or 5\" uses `||` — numbers like 15 are counted once.",
        "for (int i = a; i <= b; i++) if (i % 3 == 0 || i % 5 == 0) count++;",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    int count = 0;
    for (int i = a; i <= b; i++) {
        if (i % 3 == 0 || i % 5 == 0) count++;
    }
    cout << count << endl;
    return 0;
}`,
      solutionNotes: "The loop includes both ends (`i <= b`). Using `||` counts numbers divisible by both (like 15) only once.",
    },
  ),

  "while-loops": practice(
    {
      title: "Collatz steps",
      prompt: `Start with \`n\` (1 ≤ n ≤ 100 000). While n isn't 1: if n is even, halve it; otherwise make it 3n + 1. Print how many steps it takes to reach 1.

| Input | Output |
| --- | --- |
| \`6\` | \`8\` |`,
      starterCode: starter("Count the steps until n becomes 1", "long long n;\ncin >> n;"),
      tests: [
        T("n = 6", "6\n", "8", "sample"),
        T("n = 1", "1\n", "0", "visible", "edge"),
        T("n = 27", "27\n", "111", "hidden"),
        T("n = 2", "2\n", "1", "hidden", "boundary"),
        T("n = 97", "97\n", "118", "hidden"),
      ],
      hints: [
        "You don't know how many steps in advance — which loop fits?",
        "while (n != 1) { … }",
        "Inside: if even, n /= 2; else n = 3 * n + 1. Then count the step.",
        "Values can grow larger than n on the way — keep n a long long.",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    long long n;
    cin >> n;
    int steps = 0;
    while (n != 1) {
        if (n % 2 == 0) n /= 2;
        else n = 3 * n + 1;
        steps++;
    }
    cout << steps << endl;
    return 0;
}`,
      solutionNotes: "A while loop runs until a condition changes, which is exactly \"until n reaches 1\". For n = 1 the body never runs, so the answer is 0.",
    },
    {
      title: "Palindrome number",
      prompt: `Read a non-negative whole number. Print \`yes\` if its digits read the same forwards and backwards, otherwise \`no\`. Build the reversed number with a while loop.`,
      starterCode: starter("Reverse the digits with a while loop and compare with the original", "long long n;\ncin >> n;"),
      tests: [
        T("12321", "12321\n", "yes", "sample"),
        T("123", "123\n", "no", "sample"),
        T("single digit", "7\n", "yes", "hidden", "boundary"),
        T("zero", "0\n", "yes", "hidden", "edge"),
        T("trailing zero", "10\n", "no", "hidden", "edge"),
        T("even length", "4554\n", "yes", "hidden"),
      ],
      hints: [
        "Keep a copy of the original — the loop will destroy n.",
        "Reverse: rev = rev * 10 + n % 10; n /= 10;",
        "Loop while n > 0.",
        "Compare rev with the saved original.",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    long long n;
    cin >> n;
    long long original = n, rev = 0;
    while (n > 0) {
        rev = rev * 10 + n % 10;
        n /= 10;
    }
    cout << (rev == original ? "yes" : "no") << endl;
    return 0;
}`,
      solutionNotes: "Each pass moves the last digit of n onto the end of rev. 10 reverses to 1, which differs, so it's not a palindrome.",
    },
  ),

  "do-while": practice(
    {
      title: "Keep asking for a positive number",
      prompt: `Numbers are entered one at a time. Keep reading until you get a **positive** one. Print it and the number of attempts it took, separated by a space.

| Input | Output |
| --- | --- |
| \`-3 0 -1 8\` | \`8 4\` |`,
      starterCode: starter("Read with a do-while until x > 0; count the attempts", "int x;\nint attempts = 0;"),
      tests: [
        T("several tries", "-3 0 -1 8\n", "8 4", "sample"),
        T("first try", "5\n", "5 1", "visible", "boundary"),
        T("zero is not positive", "0 0 1\n", "1 3", "hidden", "edge"),
        T("long wait", "-1 -2 -3 -4 -5 9\n", "9 6", "hidden"),
      ],
      hints: [
        "You must read at least once before you can check anything.",
        "That's what do-while is for.",
        "do { cin >> x; attempts++; } while (…);",
        "Repeat while the number is not positive: while (x <= 0);",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int x;
    int attempts = 0;
    do {
        cin >> x;
        attempts++;
    } while (x <= 0);
    cout << x << " " << attempts << endl;
    return 0;
}`,
      solutionNotes: "do-while reads first and checks afterwards, so the condition always sees a freshly read value.",
    },
    {
      title: "Menu loop",
      prompt: `Process commands until \`0\`:

- \`1 X\` — add X to the total,
- \`2\` — print the total,
- \`3\` — reset the total to 0,
- \`0\` — stop.

Use a do-while loop. The total starts at 0.`,
      starterCode: starter("do { read a command and handle it } while (command != 0);", "int total = 0;\nint cmd;"),
      tests: [
        T("sample", "1 5\n1 7\n2\n3\n2\n0\n", "12\n0", "sample"),
        T("stop at once", "0\n", "", "visible", "edge"),
        T("negatives", "1 -4\n1 10\n2\n0\n", "6", "hidden"),
        T("ignores what comes after 0", "1 3\n0\n2\n", "", "hidden", "edge"),
      ],
      hints: [
        "Every command starts with a number — read it first.",
        "Command 1 needs a second number: read it inside that case.",
        "A switch (or if/else-if) on cmd picks the action.",
        "do { cin >> cmd; if (cmd == 1) { … } else if (cmd == 2) … } while (cmd != 0);",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int total = 0;
    int cmd;
    do {
        cin >> cmd;
        if (cmd == 1) {
            int x;
            cin >> x;
            total += x;
        } else if (cmd == 2) {
            cout << total << endl;
        } else if (cmd == 3) {
            total = 0;
        }
    } while (cmd != 0);
    return 0;
}`,
      solutionNotes: "Menus are the classic do-while: the body (read and handle a command) always runs once, and the loop checks afterwards whether it was the stop command.",
    },
  ),

  "nested-loops": practice(
    {
      title: "Hollow square",
      prompt: `Read \`n\` (2 ≤ n ≤ 20). Print an n × n square whose border is \`*\` and whose inside is spaces.

For n = 4:
\`\`\`
****
*  *
*  *
****
\`\`\``,
      starterCode: starter("Print a hollow n x n square of stars", "int n;\ncin >> n;"),
      tests: [
        T("n = 4", "4\n", "****\n*  *\n*  *\n****", "sample"),
        T("n = 2", "2\n", "**\n**", "visible", "boundary"),
        T("n = 3", "3\n", "***\n* *\n***", "hidden"),
        T("n = 5", "5\n", "*****\n*   *\n*   *\n*   *\n*****", "hidden"),
      ],
      compare: "lines",
      hints: [
        "Use one loop for rows and one for columns.",
        "When is a cell on the border?",
        "First or last row, or first or last column.",
        "if (r == 0 || r == n - 1 || c == 0 || c == n - 1) cout << '*'; else cout << ' ';",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    for (int r = 0; r < n; r++) {
        for (int c = 0; c < n; c++) {
            if (r == 0 || r == n - 1 || c == 0 || c == n - 1) cout << '*';
            else cout << ' ';
        }
        cout << endl;
    }
    return 0;
}`,
      solutionNotes: "Each cell decides on its own whether it's on the border. The inner spaces must be printed — only trailing spaces at the end of a line are ignored by the checker.",
    },
    {
      title: "Number pyramid",
      prompt: `Read \`n\` (1 ≤ n ≤ 9). Print a centred pyramid: row i has \`n − i\` leading spaces, then the digits 1 up to i and back down to 1.

For n = 4:
\`\`\`
   1
  121
 12321
1234321
\`\`\``,
      starterCode: starter("Print the number pyramid with leading spaces", "int n;\ncin >> n;"),
      tests: [
        T("n = 4", "4\n", "   1\n  121\n 12321\n1234321", "sample"),
        T("n = 1", "1\n", "1", "visible", "boundary"),
        T("n = 2", "2\n", " 1\n121", "hidden"),
        T("n = 5", "5\n", "    1\n   121\n  12321\n 1234321\n123454321", "hidden"),
      ],
      compare: "lines",
      hints: [
        "Each row has three parts: spaces, counting up, counting down.",
        "Row i (from 1): n − i spaces.",
        "Then j from 1 to i, then j from i − 1 down to 1.",
        "Three inner loops inside one outer loop.",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++) {
        for (int s = 0; s < n - i; s++) cout << ' ';
        for (int j = 1; j <= i; j++) cout << j;
        for (int j = i - 1; j >= 1; j--) cout << j;
        cout << endl;
    }
    return 0;
}`,
      solutionNotes: "Break a pattern row into pieces and give each piece its own loop. Leading spaces are significant; the checker only ignores trailing ones.",
    },
  ),

  "break-continue": practice(
    {
      title: "Sum until a negative",
      prompt: `Read \`n\`, then n whole numbers. Add them up, but **stop** at the first negative number (don't add it). Print the sum.`,
      starterCode: starter("Add numbers until the first negative one (use break)", "int n;\ncin >> n;\nint sum = 0;"),
      tests: [
        T("stops early", "5\n4 6 -1 10 2\n", "10", "sample"),
        T("no negatives", "3\n1 2 3\n", "6", "visible"),
        T("negative first", "3\n-5 7 8\n", "0", "hidden", "edge"),
        T("zero is fine", "4\n0 0 5 -9\n", "5", "hidden", "edge"),
      ],
      hints: [
        "Loop n times, reading one number each time.",
        "Check the number *before* adding it.",
        "`break;` leaves the loop immediately.",
        "for (…) { int x; cin >> x; if (x < 0) break; sum += x; }",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int sum = 0;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        if (x < 0) break;
        sum += x;
    }
    cout << sum << endl;
    return 0;
}`,
      solutionNotes: "`break` ends the loop at once, so nothing after the first negative is added (or even read).",
    },
    {
      title: "Positive sum with a stop code",
      prompt: `Read numbers until \`999\` (the stop code, not added). Skip zeros and negatives with \`continue\`. Print the sum of the positive numbers and how many there were, separated by a space.`,
      starterCode: starter("Loop forever; break on 999, continue on numbers <= 0, otherwise add and count", "int x;\nint sum = 0, count = 0;"),
      tests: [
        T("mixed", "5 -2 0 7 999\n", "12 2", "sample"),
        T("stop at once", "999\n", "0 0", "visible", "edge"),
        T("all skipped", "-1 -2 0 999\n", "0 0", "hidden", "edge"),
        T("ignores after stop", "1 2 999 50 60\n", "3 2", "hidden", "edge"),
        T("many", "10 20 30 -10 40 999\n", "100 4", "hidden"),
      ],
      hints: [
        "You don't know how many numbers there are — loop until the stop code.",
        "`while (cin >> x)` reads until the input ends.",
        "if (x == 999) break; if (x <= 0) continue;",
        "After the checks: sum += x; count++;",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int x;
    int sum = 0, count = 0;
    while (cin >> x) {
        if (x == 999) break;
        if (x <= 0) continue;
        sum += x;
        count++;
    }
    cout << sum << " " << count << endl;
    return 0;
}`,
      solutionNotes: "`break` leaves the loop; `continue` skips the rest of this pass and goes on to the next number.",
    },
  ),

  "loop-patterns": practice(
    {
      title: "Upside-down triangle",
      prompt: `Read \`n\`. Print a triangle of \`*\` with n rows: the first row has n stars, the next n − 1, … down to 1.`,
      starterCode: starter("Print rows of n, n-1, ..., 1 stars", "int n;\ncin >> n;"),
      tests: [
        T("n = 4", "4\n", "****\n***\n**\n*", "sample"),
        T("n = 1", "1\n", "*", "visible", "boundary"),
        T("n = 6", "6\n", "******\n*****\n****\n***\n**\n*", "hidden"),
        T("n = 2", "2\n", "**\n*", "hidden"),
      ],
      compare: "lines",
      hints: [
        "How many stars on row 1? Row 2?",
        "Let the row counter count down from n to 1.",
        "The inner loop prints that many stars.",
        "for (int r = n; r >= 1; r--) { for (int c = 0; c < r; c++) cout << '*'; cout << endl; }",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    for (int r = n; r >= 1; r--) {
        for (int c = 0; c < r; c++) cout << '*';
        cout << endl;
    }
    return 0;
}`,
      solutionNotes: "Counting the outer loop down makes the row length shrink naturally.",
    },
    {
      title: "Diamond",
      prompt: `Read \`n\` (1 ≤ n ≤ 20). Print a diamond of \`*\` that is 2n − 1 rows tall: rows grow by 2 stars down to the middle row of 2n − 1 stars, then shrink. Each row is centred with leading spaces.

For n = 3:
\`\`\`
  *
 ***
*****
 ***
  *
\`\`\``,
      starterCode: starter("Print the top half (rows 1..n) then the bottom half (rows n-1..1)", "int n;\ncin >> n;"),
      tests: [
        T("n = 3", "3\n", "  *\n ***\n*****\n ***\n  *", "sample"),
        T("n = 1", "1\n", "*", "visible", "boundary"),
        T("n = 2", "2\n", " *\n***\n *", "hidden"),
        T("n = 4", "4\n", "   *\n  ***\n *****\n*******\n *****\n  ***\n   *", "hidden"),
      ],
      compare: "lines",
      hints: [
        "For row i (1 to n) of the top half: how many spaces and how many stars?",
        "n − i spaces and 2i − 1 stars.",
        "The bottom half is the same rows for i = n − 1 down to 1.",
        "Write a helper loop that prints one row for a given i, and use it in both halves.",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++) {
        for (int s = 0; s < n - i; s++) cout << ' ';
        for (int k = 0; k < 2 * i - 1; k++) cout << '*';
        cout << endl;
    }
    for (int i = n - 1; i >= 1; i--) {
        for (int s = 0; s < n - i; s++) cout << ' ';
        for (int k = 0; k < 2 * i - 1; k++) cout << '*';
        cout << endl;
    }
    return 0;
}`,
      solutionNotes: "Find the formula for one row (spaces = n − i, stars = 2i − 1), then run i up to n and back down. In the Functions module you'll turn the repeated row code into one function.",
    },
  ),
};
