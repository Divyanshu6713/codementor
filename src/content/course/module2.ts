import type { CourseLesson } from "./types";

const r = String.raw;

/** Module 2 — Logic and decision making. */
export const MODULE2_LESSONS: CourseLesson[] = [
  {
    id: "comparison-operators",
    moduleId: "logic",
    title: "Comparison operators",
    minutes: 12,
    goals: [
      "The six comparison operators: `<  <=  >  >=  ==  !=`",
      "That a comparison produces `true` or `false`",
      "The difference between `=` and `==`",
    ],
    intro: `Programs make decisions by **comparing** values: is the score at least 40? Is the password equal to the saved one? A comparison is a question whose answer is always **true** or **false**.`,
    sections: [
      {
        title: "Six questions you can ask",
        visual: "comparison-number-line",
        body: `| Operator | Asks | \`5 ? 3\` |
| --- | --- | --- |
| \`<\` | less than? | false |
| \`<=\` | less than **or equal**? | false |
| \`>\` | greater than? | true |
| \`>=\` | greater than **or equal**? | true |
| \`==\` | equal? | false |
| \`!=\` | not equal? | true |

The only difference between \`<\` and \`<=\` is the **edge**: \`5 < 5\` is false, \`5 <= 5\` is true. Drag the number line below to see which values make each comparison true.`,
      },
      {
        title: "Comparisons are values",
        body: `A comparison produces a \`bool\`. \`cout\` prints true as \`1\` and false as \`0\`:

\`\`\`cpp
int marks = 72;
cout << (marks >= 40);   // 1
cout << (marks == 100);  // 0
\`\`\`

Put brackets around a comparison when you print it — \`<<\` would otherwise grab the values first.`,
      },
    ],
    mistakes: [
      { title: "Using = instead of ==", body: "`=` **assigns** (stores a value). `==` **compares**. `if (x = 5)` stores 5 in x — almost never what you meant." },
      { title: "Getting the edge wrong", body: "\"At least 40\" means `>= 40`, not `> 40`. Always test the boundary value itself: what happens when marks is exactly 40?" },
      { title: "Writing => or =<", body: "The `=` always comes second: `>=` and `<=`." },
    ],
    example: {
      title: "Printing comparison results",
      intro: "Run with input `40`. Change it to 39 and 41 and watch which lines change.",
      code: r`#include <iostream>
using namespace std;

int main() {
    int marks;
    cin >> marks;
    cout << "passed (>= 40): " << (marks >= 40) << endl;
    cout << "above 40 (> 40): " << (marks > 40) << endl;
    cout << "exactly 40: " << (marks == 40) << endl;
    return 0;
}`,
      input: "40\n",
      output: "passed (>= 40): 1\nabove 40 (> 40): 0\nexactly 40: 1\n",
      notes: [
        { line: 7, text: "40 >= 40 is true → 1." },
        { line: 8, text: "40 > 40 is false → 0. This is the edge where `>` and `>=` differ." },
      ],
    },
    quickCheck: {
      prompt: "A shop gives free delivery for orders of **500 or more**. Which condition is right?",
      options: [
        { id: "a", text: "`total > 500`", feedback: "An order of exactly 500 wouldn't qualify. \"Or more\" includes 500." },
        { id: "b", text: "`total >= 500`", feedback: "Yes — this includes 500 itself." },
        { id: "c", text: "`total = 500`", feedback: "`=` assigns instead of comparing." },
      ],
      correct: "b",
      explanation: "\"500 or more\" includes the edge value, so use `>=`.",
    },
    exercise: {
      title: "Compare two numbers",
      prompt: `Read two whole numbers \`a\` and \`b\`. Print three lines — the result (\`1\` or \`0\`) of:

1. \`a < b\`
2. \`a == b\`
3. \`a != b\`

| Input | Output |
| --- | --- |
| \`3 8\` | \`1\`, \`0\`, \`1\` on three lines |`,
      starterCode: r`#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    // print (a < b), (a == b) and (a != b), one per line

    return 0;
}`,
      tests: [
        { label: "3 and 8", input: "3 8\n", output: "1\n0\n1", visibility: "sample", category: "normal" },
        { label: "equal numbers", input: "6 6\n", output: "0\n1\n0", visibility: "hidden", category: "edge" },
        { label: "first is bigger", input: "9 2\n", output: "0\n0\n1", visibility: "hidden", category: "normal" },
        { label: "negatives", input: "-5 -1\n", output: "1\n0\n1", visibility: "hidden", category: "normal" },
      ],
      compare: "lines",
      hints: [
        "What should each line print when the two numbers are equal?",
        "A comparison like `(a < b)` is a value — `cout` prints it as 1 or 0.",
        "You need three `cout` statements after the `cin` line, each with one comparison in brackets.",
        "`cout << (a < b) << endl;` then the same with `==` and `!=`.",
      ],
      solution: r`#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << (a < b) << endl;
    cout << (a == b) << endl;
    cout << (a != b) << endl;
    return 0;
}`,
      solutionNotes: "Each comparison is evaluated to true (1) or false (0) and printed. The brackets make sure the comparison happens before `<<` prints it.",
    },
    explainAgain: `A comparison is a yes/no question you ask the computer. "Is a less than b?" — it answers 1 for yes, 0 for no. \`==\` asks "are these the same?", while a single \`=\` isn't a question at all — it's an order: "put this value in that box".`,
    summary: [
      "`< <= > >= == !=` compare values and produce true (1) or false (0).",
      "`<=` and `>=` include the edge value; `<` and `>` don't.",
      "`=` assigns; `==` compares.",
    ],
  },

  {
    id: "logical-operators",
    moduleId: "logic",
    title: "Logical operators",
    minutes: 12,
    goals: [
      "Combining conditions with `&&` (and) and `||` (or)",
      "Flipping a condition with `!` (not)",
      "Writing range checks like \"between 10 and 20\"",
    ],
    intro: `Real decisions often depend on more than one thing: you can enter if you're 18 or older **and** have a ticket. Logical operators join simple comparisons into bigger conditions.`,
    sections: [
      {
        title: "And, or, not",
        body: `| Operator | True when… | Example |
| --- | --- | --- |
| \`&&\` (and) | **both** sides are true | \`age >= 18 && hasTicket\` |
| \`\\|\\|\` (or) | **at least one** side is true | \`day == 6 \\|\\| day == 7\` |
| \`!\` (not) | the condition is false | \`!finished\` |

\`||\` is typed with two vertical-bar keys (usually Shift + backslash).`,
      },
      {
        title: "Ranges",
        body: `"n is between 10 and 20 (inclusive)" needs **two** comparisons joined with and:

\`\`\`cpp
n >= 10 && n <= 20
\`\`\`

You can't write \`10 <= n <= 20\` in C++ — it compiles, but it means something different (it compares \`10 <= n\`, which is 0 or 1, with 20 — always true).`,
      },
    ],
    mistakes: [
      { title: "Chaining like maths: 10 <= n <= 20", body: "This doesn't check a range in C++. Write `n >= 10 && n <= 20`." },
      { title: "Mixing up && and ||", body: "\"Weekend\" is Saturday **or** Sunday — `day == 6 && day == 7` can never be true, because day can't be both at once." },
      { title: "Using a single & or |", body: "`&` and `|` are different operators (they work on bits). For conditions, use `&&` and `||`." },
    ],
    example: {
      title: "Can they enter?",
      intro: "Input is the age, then 1 if they have a ticket or 0 if not. Run with `20 1`, then try `20 0` and `15 1`.",
      code: r`#include <iostream>
using namespace std;

int main() {
    int age, ticket;
    cin >> age >> ticket;
    bool canEnter = age >= 18 && ticket == 1;
    bool child = !(age >= 18);
    cout << "can enter: " << canEnter << endl;
    cout << "child: " << child << endl;
    return 0;
}`,
      input: "20 1\n",
      output: "can enter: 1\nchild: 0\n",
      notes: [
        { line: 7, text: "Both comparisons are true, so `&&` gives true." },
        { line: 8, text: "`!` flips true to false." },
      ],
    },
    quickCheck: {
      prompt: "Which condition is true for **every** number from 1 to 5 (inclusive) and false otherwise?",
      options: [
        { id: "a", text: "`n >= 1 || n <= 5`", feedback: "With or, n = 100 passes (100 >= 1). A range needs both conditions." },
        { id: "b", text: "`1 <= n <= 5`", feedback: "C++ doesn't read this as a range — it's always true." },
        { id: "c", text: "`n >= 1 && n <= 5`", feedback: "Yes. Both ends must hold." },
      ],
      correct: "c",
      explanation: "A range check is two comparisons joined with `&&`.",
    },
    exercise: {
      title: "In range?",
      prompt: `Read a whole number \`n\`. Print \`1\` if n is **between 10 and 20, including both 10 and 20**, otherwise print \`0\`.

| Input | Output |
| --- | --- |
| \`15\` | \`1\` |
| \`9\` | \`0\` |`,
      starterCode: r`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    // print 1 if 10 <= n <= 20 (inclusive), otherwise 0

    return 0;
}`,
      tests: [
        { label: "15", input: "15\n", output: "1", visibility: "sample", category: "normal" },
        { label: "9", input: "9\n", output: "0", visibility: "sample", category: "boundary" },
        { label: "exactly 10", input: "10\n", output: "1", visibility: "hidden", category: "boundary" },
        { label: "exactly 20", input: "20\n", output: "1", visibility: "hidden", category: "boundary" },
        { label: "21", input: "21\n", output: "0", visibility: "hidden", category: "boundary" },
        { label: "negative", input: "-15\n", output: "0", visibility: "hidden", category: "edge" },
      ],
      compare: "tokens",
      hints: [
        "What two things must both be true for n to be inside the range?",
        "Join two comparisons with `&&` (and). Remember the range includes 10 and 20 themselves.",
        "Did you write `10 <= n <= 20`? C++ doesn't read that as a range. Check also `>` vs `>=` at the edges.",
        "`cout << (n >= 10 && n <= 20);`",
      ],
      solution: r`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    cout << (n >= 10 && n <= 20) << endl;
    return 0;
}`,
      solutionNotes: "The number must be at least 10 **and** at most 20. `>=` and `<=` include the edges; the whole condition is printed as 1 or 0.",
    },
    explainAgain: `\`&&\` is a strict security guard: you need **both** an ID card **and** a pass. \`||\` is a relaxed guard: **either** one is enough. \`!\` is the "opposite day" switch: it turns yes into no and no into yes.`,
    summary: [
      "`&&` needs both conditions; `||` needs at least one; `!` flips.",
      "A range check is `n >= low && n <= high`.",
      "Never chain comparisons like `a <= n <= b` in C++.",
    ],
  },

  {
    id: "if-statements",
    moduleId: "logic",
    title: "if statements",
    minutes: 12,
    goals: [
      "Running code only when a condition is true",
      "How braces mark what belongs to the `if`",
      "That code after the `if` always runs",
    ],
    intro: `An \`if\` statement lets a program **choose**: run some instructions only when a condition is true, and skip them otherwise. This is the first time your programs can behave differently for different inputs.`,
    sections: [
      {
        title: "The shape of an if",
        body: `\`\`\`cpp
if (condition) {
    // runs only when condition is true
}
// always runs
\`\`\`

The condition goes in **round brackets**. The instructions to run go in **braces**. If the condition is false, the program jumps past the closing brace and carries on.`,
      },
      {
        title: "Tracing an if",
        body: `\`\`\`cpp
int temp = 35;
if (temp > 30) {
    cout << "Hot" << endl;
}
cout << "Done" << endl;
\`\`\`

1. Is \`35 > 30\`? Yes → print *Hot*.
2. Continue after the brace → print *Done*.

With \`temp = 20\`, step 1 is false, so only *Done* is printed.`,
      },
    ],
    mistakes: [
      { title: "A semicolon after the condition", body: "`if (temp > 30);` ends the if right there — an empty statement. The block below then runs **every time**. Never put `;` straight after `if (...)`." },
      { title: "Leaving out the braces", body: "Without braces, only the **next single statement** belongs to the if. Always use braces, even for one line — it prevents surprises when you add a second line." },
    ],
    example: {
      title: "Only when it's true",
      intro: "Run with `35`, then with `20`.",
      code: r`#include <iostream>
using namespace std;

int main() {
    int temp;
    cin >> temp;
    if (temp > 30) {
        cout << "It's hot - drink water!" << endl;
    }
    cout << "Have a nice day." << endl;
    return 0;
}`,
      input: "35\n",
      output: "It's hot - drink water!\nHave a nice day.\n",
      notes: [
        { line: 7, text: "The condition is checked once." },
        { line: 8, text: "This line runs only when the condition is true." },
        { line: 10, text: "Outside the braces: always runs." },
      ],
    },
    quickCheck: {
      prompt: "What does this print?",
      code: r`int x = 5;
if (x > 10)
    cout << "big ";
    cout << "done";`,
      options: [
        { id: "a", text: "big done", feedback: "x > 10 is false, so the statement controlled by the if is skipped." },
        { id: "b", text: "done", feedback: "Right: without braces only the first statement belongs to the if. The indentation of the second line is misleading." },
        { id: "c", text: "Nothing", feedback: "The second cout is not part of the if, so it always runs." },
      ],
      correct: "b",
      explanation: "Without { }, an if controls exactly one statement. Always use braces so the code does what the indentation suggests.",
    },
    exercise: {
      title: "Hot day warning",
      prompt: `Read a temperature (a whole number). If it is **above 30**, print \`Hot\`. Then — always — print \`Done\`.

| Input | Output |
| --- | --- |
| \`35\` | \`Hot\` then \`Done\` |
| \`20\` | \`Done\` |`,
      starterCode: r`#include <iostream>
using namespace std;

int main() {
    int temp;
    cin >> temp;
    // print Hot only if temp is above 30

    cout << "Done" << endl;
    return 0;
}`,
      tests: [
        { label: "35", input: "35\n", output: "Hot\nDone", visibility: "sample", category: "normal" },
        { label: "20", input: "20\n", output: "Done", visibility: "sample", category: "normal" },
        { label: "exactly 30", input: "30\n", output: "Done", visibility: "hidden", category: "boundary" },
        { label: "31", input: "31\n", output: "Hot\nDone", visibility: "hidden", category: "boundary" },
        { label: "below zero", input: "-5\n", output: "Done", visibility: "hidden", category: "edge" },
      ],
      compare: "lines",
      hints: [
        "Should 30 itself count as hot? Read the task again: \"above 30\".",
        "An `if (condition) { ... }` runs its block only when the condition is true.",
        "Put the `if` between the `cin` line and the `cout << \"Done\"` line. Check for a stray `;` after the brackets.",
        "`if (temp > 30) { cout << \"Hot\" << endl; }` — `>` (not `>=`) because 30 is not above 30.",
      ],
      solution: r`#include <iostream>
using namespace std;

int main() {
    int temp;
    cin >> temp;
    if (temp > 30) {
        cout << "Hot" << endl;
    }
    cout << "Done" << endl;
    return 0;
}`,
      solutionNotes: "\"Above 30\" means strictly greater, so 30 prints only Done. `Done` is outside the braces, so it prints every time.",
    },
    explainAgain: `An \`if\` is like a door with a sensor. When you walk up (the program reaches the if), the sensor checks the condition. True → the door opens and you go through the room inside the braces. False → you walk past the door. Either way you continue down the corridor after it.`,
    summary: [
      "`if (condition) { … }` runs the block only when the condition is true.",
      "Code after the closing brace always runs.",
      "No `;` after `if (...)`, and always use braces.",
    ],
  },

  {
    id: "if-else",
    moduleId: "logic",
    title: "if-else",
    minutes: 12,
    goals: [
      "Choosing between two paths with `if` and `else`",
      "Exactly one of the two blocks runs",
      "Testing even/odd with `%`",
    ],
    intro: `An \`if\` alone either does something or nothing. Often you want **one thing or the other**: "pass" or "fail", "even" or "odd". That's what \`else\` is for.`,
    sections: [
      {
        title: "Two paths, exactly one runs",
        body: `\`\`\`cpp
if (marks >= 40) {
    cout << "Pass";
} else {
    cout << "Fail";
}
\`\`\`

If the condition is true, the first block runs and the \`else\` block is skipped. If it's false, the first block is skipped and the \`else\` block runs. **Never both, never neither.**`,
      },
      {
        title: "Even or odd",
        body: `A number is even when dividing by 2 leaves no remainder:

\`\`\`cpp
if (n % 2 == 0) {
    cout << "Even";
} else {
    cout << "Odd";
}
\`\`\`

Careful with negative numbers: in C++, \`-3 % 2\` is \`-1\`, not 1. That's why testing \`n % 2 == 0\` (is the remainder zero?) is safer than \`n % 2 == 1\`.`,
      },
    ],
    mistakes: [
      { title: "Giving else a condition", body: "`else (n < 0)` is not valid. `else` already means \"in every other case\". For another condition use `else if` (next lesson)." },
      { title: "Checking n % 2 == 1 for odd", body: "Fails for negative odd numbers (`-3 % 2` is `-1`). Check `n % 2 == 0` for even, and let else handle odd." },
    ],
    example: {
      title: "Pass or fail",
      intro: "Run with `39`, then `40`.",
      code: r`#include <iostream>
using namespace std;

int main() {
    int marks;
    cin >> marks;
    if (marks >= 40) {
        cout << "Pass" << endl;
    } else {
        cout << "Fail - try again" << endl;
    }
    return 0;
}`,
      input: "39\n",
      output: "Fail - try again\n",
      notes: [
        { line: 7, text: "39 >= 40 is false…" },
        { line: 10, text: "…so the else block runs instead." },
      ],
    },
    quickCheck: {
      prompt: "What does this print when `n` is 7?",
      code: r`if (n > 10) {
    cout << "A";
} else {
    cout << "B";
}
cout << "C";`,
      options: [
        { id: "a", text: "BC", feedback: "Right: 7 > 10 is false → B, then C always prints." },
        { id: "b", text: "B", feedback: "The last line is outside the if/else, so it always runs." },
        { id: "c", text: "ABC", feedback: "Only one of A or B can ever print." },
      ],
      correct: "a",
      explanation: "Exactly one branch runs (B here), then the program continues with the line after the if/else.",
    },
    exercise: {
      title: "Even or odd",
      prompt: `Read a whole number (it may be negative). Print \`Even\` if it is even, otherwise \`Odd\`.

| Input | Output |
| --- | --- |
| \`4\` | \`Even\` |
| \`7\` | \`Odd\` |`,
      starterCode: r`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    // print Even or Odd

    return 0;
}`,
      tests: [
        { label: "4", input: "4\n", output: "Even", visibility: "sample", category: "normal" },
        { label: "7", input: "7\n", output: "Odd", visibility: "sample", category: "normal" },
        { label: "zero", input: "0\n", output: "Even", visibility: "hidden", category: "edge" },
        { label: "negative odd", input: "-3\n", output: "Odd", visibility: "hidden", category: "edge" },
        { label: "negative even", input: "-8\n", output: "Even", visibility: "hidden", category: "edge" },
      ],
      compare: "tokens",
      hints: [
        "What is the remainder when an even number is divided by 2?",
        "`n % 2` gives the remainder after dividing by 2. Use it inside an if/else.",
        "If negative odd numbers fail, look at what you compare `n % 2` with: `-3 % 2` is `-1` in C++.",
        "`if (n % 2 == 0) { cout << \"Even\"; } else { cout << \"Odd\"; }`",
      ],
      solution: r`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    if (n % 2 == 0) {
        cout << "Even" << endl;
    } else {
        cout << "Odd" << endl;
    }
    return 0;
}`,
      solutionNotes: "Even numbers leave remainder 0. Checking `== 0` works for negatives too; every other case is odd, which is exactly what `else` covers.",
    },
    explainAgain: `if-else is a fork in the road with a signpost. The signpost (the condition) sends you left or right — you can't take both roads, and you can't stand still. After either road, both paths meet again and the program continues.`,
    summary: [
      "`if (…) { A } else { B }` runs exactly one of A or B.",
      "`else` has no condition — it's \"everything else\".",
      "`n % 2 == 0` tests for even numbers, including negatives.",
    ],
  },

  {
    id: "else-if",
    moduleId: "logic",
    title: "else-if ladders",
    minutes: 15,
    goals: [
      "Choosing between more than two options",
      "Why the order of conditions matters",
      "That only the first true branch runs",
    ],
    intro: `Grades, ticket prices, tax brackets — many decisions have more than two outcomes. An **else-if ladder** checks conditions one after another and runs the **first** one that's true.`,
    sections: [
      {
        title: "The ladder",
        body: `\`\`\`cpp
if (marks >= 90) {
    cout << "A";
} else if (marks >= 75) {
    cout << "B";
} else if (marks >= 50) {
    cout << "C";
} else {
    cout << "F";
}
\`\`\`

The conditions are checked **top to bottom**. As soon as one is true, its block runs and the rest of the ladder is skipped. The final \`else\` catches everything that didn't match.`,
      },
      {
        title: "Order matters",
        body: `For marks = 95, both \`marks >= 90\` and \`marks >= 50\` are true. Because the ladder stops at the first true one, 95 gets an A.

If you put \`marks >= 50\` first, **every** mark of 50 or more would get a C — the A and B branches could never be reached. With \`>=\` ladders, go from the **highest** threshold to the lowest.`,
      },
    ],
    mistakes: [
      { title: "Separate ifs instead of a ladder", body: "Three separate `if` statements can **all** run: a 95 would print A, B and C. Use `else if` so only one branch runs." },
      { title: "Thresholds in the wrong order", body: "Checking `>= 50` before `>= 90` means the higher branches never run. Start with the most restrictive condition." },
    ],
    example: {
      title: "Ticket price by age",
      intro: "Under 5: free. Under 18: 50. Otherwise: 100. Run with `12`.",
      code: r`#include <iostream>
using namespace std;

int main() {
    int age;
    cin >> age;
    if (age < 5) {
        cout << "Free" << endl;
    } else if (age < 18) {
        cout << "Rs 50" << endl;
    } else {
        cout << "Rs 100" << endl;
    }
    return 0;
}`,
      input: "12\n",
      output: "Rs 50\n",
      notes: [
        { line: 7, text: "12 < 5 is false → move down the ladder." },
        { line: 9, text: "12 < 18 is true → this branch runs, the rest is skipped." },
      ],
    },
    quickCheck: {
      prompt: "With m = 85, what does this print?",
      code: r`if (m >= 50) {
    cout << "pass";
} else if (m >= 80) {
    cout << "merit";
} else {
    cout << "fail";
}`,
      options: [
        { id: "a", text: "merit", feedback: "The ladder stops at the first true condition, and m >= 50 comes first." },
        { id: "b", text: "pass", feedback: "Right: 85 >= 50 is true, so that branch runs and the rest is skipped. The merit branch can never run — the order is wrong." },
        { id: "c", text: "passmerit", feedback: "Exactly one branch of an else-if ladder runs." },
      ],
      correct: "b",
      explanation: "In a ladder, put the most specific (highest) condition first: check >= 80 before >= 50.",
    },
    exercise: {
      title: "Grade calculator",
      prompt: `Read marks (0–100). Print the grade:

| Marks | Grade |
| --- | --- |
| 90 or more | \`A\` |
| 75 to 89 | \`B\` |
| 50 to 74 | \`C\` |
| below 50 | \`F\` |`,
      starterCode: r`#include <iostream>
using namespace std;

int main() {
    int marks;
    cin >> marks;
    // print A, B, C or F

    return 0;
}`,
      tests: [
        { label: "95", input: "95\n", output: "A", visibility: "sample", category: "normal" },
        { label: "60", input: "60\n", output: "C", visibility: "sample", category: "normal" },
        { label: "exactly 90", input: "90\n", output: "A", visibility: "hidden", category: "boundary" },
        { label: "89", input: "89\n", output: "B", visibility: "hidden", category: "boundary" },
        { label: "exactly 75", input: "75\n", output: "B", visibility: "hidden", category: "boundary" },
        { label: "exactly 50", input: "50\n", output: "C", visibility: "hidden", category: "boundary" },
        { label: "49", input: "49\n", output: "F", visibility: "hidden", category: "boundary" },
        { label: "zero", input: "0\n", output: "F", visibility: "hidden", category: "edge" },
      ],
      compare: "tokens",
      hints: [
        "If marks is 95, which grade rows does it satisfy? Which one should win?",
        "Use an else-if ladder: `if … else if … else if … else`. Only the first true branch runs.",
        "Check your order (highest threshold first) and your edges: 90, 75 and 50 must use `>=`.",
        "`if (marks >= 90) A; else if (marks >= 75) B; else if (marks >= 50) C; else F;` — each with braces and cout.",
      ],
      solution: r`#include <iostream>
using namespace std;

int main() {
    int marks;
    cin >> marks;
    if (marks >= 90) {
        cout << "A" << endl;
    } else if (marks >= 75) {
        cout << "B" << endl;
    } else if (marks >= 50) {
        cout << "C" << endl;
    } else {
        cout << "F" << endl;
    }
    return 0;
}`,
      solutionNotes: "Checking from the top down means each later condition only sees marks that failed the earlier ones — so `marks >= 75` really means \"75 to 89\" here.",
    },
    explainAgain: `An else-if ladder is like sorting letters into pigeonholes from top to bottom. You hold the letter against the top hole first; if it fits, in it goes and you're done. If not, you try the next hole down. The last \`else\` is the "everything else" tray at the bottom.`,
    summary: [
      "`if … else if … else` picks exactly one branch: the first true one.",
      "Order conditions from most to least restrictive.",
      "Separate `if`s can all run; a ladder can't.",
    ],
  },

  {
    id: "nested-conditions",
    moduleId: "logic",
    title: "Nested conditions",
    minutes: 15,
    goals: [
      "Putting an if inside another if",
      "When nesting is clearer than one long condition",
      "Reading nested code by its indentation",
    ],
    intro: `Sometimes a second question only makes sense after the first one is answered. "Is it a weekday? If so, is it before 9 am?" You can put an \`if\` **inside** another \`if\` — this is called **nesting**.`,
    sections: [
      {
        title: "An if inside an if",
        body: `\`\`\`cpp
if (n > 0) {
    if (n % 2 == 0) {
        cout << "positive and even";
    } else {
        cout << "positive and odd";
    }
} else {
    cout << "not positive";
}
\`\`\`

The inner if/else is only reached when the outer condition is true. Indentation shows the structure — each level of nesting moves four spaces to the right.`,
      },
      {
        title: "Nesting or &&?",
        body: `\`if (a) { if (b) { … } }\` does the same as \`if (a && b) { … }\`. Use \`&&\` when there's one action for "both true". Nest when the inner question has its **own** else, or when different outer cases need different inner questions — like the leap-year rule:

- divisible by 4 → maybe a leap year, but…
  - divisible by 100 → not a leap year, unless…
    - divisible by 400 → leap year.`,
      },
    ],
    mistakes: [
      { title: "Attaching an else to the wrong if", body: "An `else` belongs to the nearest unmatched `if` in the same braces. With braces and indentation, you can always see which one it is." },
      { title: "Nesting too deep", body: "If you're four levels deep, step back — an else-if ladder or a combined condition is usually clearer." },
    ],
    example: {
      title: "Largest of three",
      intro: "Find the biggest of three numbers with nested ifs. Run with `4 9 2`.",
      code: r`#include <iostream>
using namespace std;

int main() {
    int a, b, c;
    cin >> a >> b >> c;
    if (a >= b) {
        if (a >= c) {
            cout << a << endl;
        } else {
            cout << c << endl;
        }
    } else {
        if (b >= c) {
            cout << b << endl;
        } else {
            cout << c << endl;
        }
    }
    return 0;
}`,
      input: "4 9 2\n",
      output: "9\n",
      notes: [
        { line: 7, text: "4 >= 9 is false → go to the outer else." },
        { line: 14, text: "Only now ask the second question: 9 >= 2 → print 9." },
      ],
    },
    quickCheck: {
      prompt: "With age = 20 and hasId = false, what is printed?",
      code: r`if (age >= 18) {
    if (hasId) {
        cout << "enter";
    } else {
        cout << "show ID";
    }
} else {
    cout << "too young";
}`,
      options: [
        { id: "a", text: "enter", feedback: "The inner condition hasId is false." },
        { id: "b", text: "show ID", feedback: "Right: the outer check passes, then the inner else runs." },
        { id: "c", text: "too young", feedback: "20 >= 18 is true, so the outer else is skipped." },
      ],
      correct: "b",
      explanation: "The inner if/else only runs when the outer condition is true; then it picks one of its own two branches.",
    },
    exercise: {
      title: "Leap year",
      prompt: `Read a year. Print \`Leap year\` or \`Not a leap year\`.

The rule: a year is a leap year if it is divisible by 4 — **except** years divisible by 100, which are **not** leap years — **except** years divisible by 400, which **are**.

| Input | Output |
| --- | --- |
| \`2024\` | \`Leap year\` |
| \`1900\` | \`Not a leap year\` |`,
      starterCode: r`#include <iostream>
using namespace std;

int main() {
    int year;
    cin >> year;
    // apply the leap-year rule

    return 0;
}`,
      tests: [
        { label: "2024", input: "2024\n", output: "Leap year", visibility: "sample", category: "normal" },
        { label: "1900", input: "1900\n", output: "Not a leap year", visibility: "sample", category: "edge" },
        { label: "2023", input: "2023\n", output: "Not a leap year", visibility: "hidden", category: "normal" },
        { label: "2000", input: "2000\n", output: "Leap year", visibility: "hidden", category: "edge" },
        { label: "2100", input: "2100\n", output: "Not a leap year", visibility: "hidden", category: "edge" },
        { label: "1996", input: "1996\n", output: "Leap year", visibility: "hidden", category: "normal" },
      ],
      compare: "lines",
      hints: [
        "Work through 1900 by hand: is it divisible by 4? By 100? By 400? So which answer?",
        "\"Divisible by k\" means `year % k == 0`. The rule has three levels — nested ifs fit it well.",
        "Check the order: the 400 rule overrides the 100 rule, which overrides the 4 rule. Test 2000 and 1900 in the Input box.",
        "Outer: `if (year % 4 == 0)`. Inside it: `if (year % 100 == 0)` → leap only if `year % 400 == 0`; otherwise leap. Outer else → not leap.",
      ],
      solution: r`#include <iostream>
using namespace std;

int main() {
    int year;
    cin >> year;
    if (year % 4 == 0) {
        if (year % 100 == 0) {
            if (year % 400 == 0) {
                cout << "Leap year" << endl;
            } else {
                cout << "Not a leap year" << endl;
            }
        } else {
            cout << "Leap year" << endl;
        }
    } else {
        cout << "Not a leap year" << endl;
    }
    return 0;
}`,
      solutionNotes: "Each nested level handles one exception. The same rule as one condition is `(year % 4 == 0 && year % 100 != 0) || year % 400 == 0` — both are correct.",
    },
    explainAgain: `Nested conditions are like a doctor's questions. "Do you have a fever?" Only if yes: "Is it above 102?" The second question isn't asked at all if the answer to the first is no. Each inner if is a follow-up question that only makes sense in its branch.`,
    summary: [
      "An if can contain other ifs; inner ones run only when the outer condition allows.",
      "Use indentation to show the levels.",
      "Nest for follow-up questions; use `&&` for a single \"both true\" check.",
    ],
  },

  {
    id: "switch",
    moduleId: "logic",
    title: "switch statements",
    minutes: 12,
    goals: [
      "Choosing between many exact values with `switch`",
      "Why every `case` needs a `break`",
      "Using `default` for everything else",
    ],
    intro: `When you compare **one variable** against many **exact values** — menu option 1, 2, 3; day 1 to 7 — a \`switch\` is tidier than a long else-if ladder.`,
    sections: [
      {
        title: "The shape of a switch",
        body: `\`\`\`cpp
switch (choice) {
    case 1:
        cout << "Start";
        break;
    case 2:
        cout << "Settings";
        break;
    default:
        cout << "Unknown option";
}
\`\`\`

The program jumps to the \`case\` matching \`choice\`, runs from there, and \`break\` jumps out of the switch. \`default\` runs when no case matches.`,
      },
      {
        title: "Why break matters",
        body: `Without \`break\`, execution **falls through** into the next case and keeps going:

\`\`\`cpp
case 1:
    cout << "Start";      // no break!
case 2:
    cout << "Settings";
\`\`\`

With choice = 1 this prints *StartSettings*. Fall-through is occasionally useful, but usually it's a bug — put a \`break\` at the end of every case.

\`switch\` works with whole numbers and characters (\`case 'y':\`), not with ranges like "between 10 and 20" or with strings.`,
      },
    ],
    mistakes: [
      { title: "Forgetting break", body: "The next case's code runs too. If your output has two answers joined together, look for a missing `break`." },
      { title: "Trying ranges in a case", body: "`case marks >= 90:` doesn't work. A case must be one exact constant value. For ranges, use if/else-if." },
    ],
    example: {
      title: "A tiny menu",
      intro: "Run with `2`, then try `5`.",
      code: r`#include <iostream>
using namespace std;

int main() {
    int choice;
    cin >> choice;
    switch (choice) {
        case 1:
            cout << "New game" << endl;
            break;
        case 2:
            cout << "Load game" << endl;
            break;
        default:
            cout << "Please choose 1 or 2" << endl;
    }
    return 0;
}`,
      input: "2\n",
      output: "Load game\n",
      notes: [
        { line: 7, text: "The switch looks at the value of `choice` once." },
        { line: 12, text: "Matching case found: print, then `break` leaves the switch." },
      ],
    },
    quickCheck: {
      prompt: "With d = 2, what does this print?",
      code: r`switch (d) {
    case 1: cout << "one";
    case 2: cout << "two";
    case 3: cout << "three"; break;
    default: cout << "other";
}`,
      options: [
        { id: "a", text: "two", feedback: "There is no break after case 2, so execution continues into case 3." },
        { id: "b", text: "twothree", feedback: "Right: execution falls through from case 2 into case 3, then break stops it." },
        { id: "c", text: "twothreeother", feedback: "The break after case 3 leaves the switch before default." },
      ],
      correct: "b",
      explanation: "A case label is only an entry point. Without break, execution falls through into the following cases.",
    },
    exercise: {
      title: "Day of the week",
      prompt: `Read a number from 1 to 7 and print the day name: 1 → \`Monday\`, 2 → \`Tuesday\`, … 7 → \`Sunday\`. For any other number print \`Invalid\`.`,
      starterCode: r`#include <iostream>
using namespace std;

int main() {
    int day;
    cin >> day;
    switch (day) {
        case 1:
            cout << "Monday" << endl;
            break;
        // add the other days and a default
    }
    return 0;
}`,
      tests: [
        { label: "1", input: "1\n", output: "Monday", visibility: "sample", category: "normal" },
        { label: "3", input: "3\n", output: "Wednesday", visibility: "sample", category: "normal" },
        { label: "7", input: "7\n", output: "Sunday", visibility: "hidden", category: "boundary" },
        { label: "2", input: "2\n", output: "Tuesday", visibility: "hidden", category: "normal" },
        { label: "6", input: "6\n", output: "Saturday", visibility: "hidden", category: "normal" },
        { label: "0", input: "0\n", output: "Invalid", visibility: "hidden", category: "edge" },
        { label: "8", input: "8\n", output: "Invalid", visibility: "hidden", category: "edge" },
      ],
      compare: "tokens",
      hints: [
        "How many cases do you need, and what should happen for 0 or 8?",
        "One `case` per day, each ending with `break`, plus a `default:` for invalid numbers.",
        "If the output shows two day names together, a `break` is missing. If 0 prints nothing, `default` is missing.",
        "Copy the `case 1:` block for 2–7 with the right names (Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday), then `default: cout << \"Invalid\";`.",
      ],
      solution: r`#include <iostream>
using namespace std;

int main() {
    int day;
    cin >> day;
    switch (day) {
        case 1: cout << "Monday" << endl; break;
        case 2: cout << "Tuesday" << endl; break;
        case 3: cout << "Wednesday" << endl; break;
        case 4: cout << "Thursday" << endl; break;
        case 5: cout << "Friday" << endl; break;
        case 6: cout << "Saturday" << endl; break;
        case 7: cout << "Sunday" << endl; break;
        default: cout << "Invalid" << endl;
    }
    return 0;
}`,
      solutionNotes: "Each case prints one name and breaks out. `default` catches every number that isn't 1–7.",
    },
    explainAgain: `A switch is like a lift: you press a floor number (the value), the lift goes straight to that floor (the matching case) and the doors open. \`break\` is stepping out. Forget to step out and the lift carries you on to the next floor too. \`default\` is the reception desk for anyone who pressed a floor that doesn't exist.`,
    summary: [
      "`switch (x) { case 1: … break; … default: … }` picks a case by exact value.",
      "End every case with `break` to avoid fall-through.",
      "Use if/else-if for ranges and complex conditions.",
    ],
  },
];
