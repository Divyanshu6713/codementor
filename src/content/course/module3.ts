import type { CourseLesson } from "./types";
import { exerciseFromQuestion } from "./reuse";

const r = String.raw;

/** Module 3 — Loops. Reuses the engine's reviewed for-loop exercises, traces and visuals. */
export const MODULE3_LESSONS: CourseLesson[] = [
  {
    id: "why-loops",
    moduleId: "loops",
    title: "Why loops are needed",
    minutes: 10,
    goals: [
      "The problem loops solve: repeating work without copying code",
      "What one iteration is",
      "Reading a simple loop before learning its details",
    ],
    intro: `Print the numbers 1 to 100. You *could* write 100 \`cout\` lines — but that's slow, easy to get wrong, and impossible if the count comes from input. A **loop** writes the work **once** and tells the computer how many times to repeat it.`,
    sections: [
      {
        title: "The copy-paste problem",
        body: `\`\`\`cpp
cout << 1 << endl;
cout << 2 << endl;
cout << 3 << endl;
// … 97 more lines …
\`\`\`

Every line does the **same job** with a number that goes up by one. Whenever you notice "the same job, again and again, with a small change", that's a loop waiting to be written.`,
      },
      {
        title: "A first look at a loop",
        body: `\`\`\`cpp
for (int i = 1; i <= 3; i++) {
    cout << i << endl;
}
\`\`\`

Read it as: *start \`i\` at 1; keep going while \`i\` is at most 3; add 1 to \`i\` after each round.* The body (inside the braces) runs once per round — each round is called an **iteration**. Here there are three iterations, printing 1, 2 and 3.

Don't worry about every detail yet — the next lesson takes the \`for\` loop apart piece by piece.`,
      },
    ],
    mistakes: [
      { title: "Copying code instead of looping", body: "If you find yourself pasting the same line with a number changed, stop and write a loop. It's shorter, and changing the count becomes a one-character edit." },
      { title: "Thinking the loop variable is special", body: "`i` is an ordinary int variable. It's just a convention for \"the counter\" — you could call it `count` or `n`." },
    ],
    example: {
      title: "Ten lines, one statement",
      intro: "The body runs five times. Change `5` to `10` and run again — no other change needed.",
      code: r`#include <iostream>
using namespace std;

int main() {
    for (int i = 1; i <= 5; i++) {
        cout << "Practice round " << i << endl;
    }
    cout << "All rounds done!" << endl;
    return 0;
}`,
      output: "Practice round 1\nPractice round 2\nPractice round 3\nPractice round 4\nPractice round 5\nAll rounds done!\n",
      notes: [
        { line: 5, text: "Start at 1, keep going while i <= 5, add 1 each time." },
        { line: 6, text: "The body runs once per iteration, with a different `i` each time." },
        { line: 8, text: "After the loop finishes, the program continues normally." },
      ],
    },
    quickCheck: {
      prompt: "You need to print the numbers 1 to 1000. What is the main advantage of a loop over 1000 cout lines?",
      options: [
        { id: "a", text: "The program runs much faster", feedback: "Speed is about the same — the computer still prints 1000 numbers." },
        { id: "b", text: "A few lines handle any count, and a change is made in one place", feedback: "Right: change 1000 to n, or the format of each line, by editing one spot." },
        { id: "c", text: "It uses no memory", feedback: "Loops use memory like any other code; that isn't the point." },
      ],
      correct: "b",
      explanation: "Loops express repetition once. The count can even come from input, which 1000 copied lines can never do.",
    },
    exercise: {
      title: "Count to ten",
      prompt: `The program prints 1 to 3. Change it so it prints the numbers **1 to 10**, each on its own line. (No input.)`,
      starterCode: r`#include <iostream>
using namespace std;

int main() {
    for (int i = 1; i <= 3; i++) {
        cout << i << endl;
    }
    return 0;
}`,
      tests: [
        { label: "Prints 1 to 10", input: "", output: "1\n2\n3\n4\n5\n6\n7\n8\n9\n10", visibility: "sample", category: "normal" },
      ],
      compare: "lines",
      hints: [
        "Which number in the loop decides where it stops?",
        "The loop keeps going while `i <= 3` is true. That's the part to change.",
        "Look at the middle part of the `for (…; …; …)` header.",
        "Change `i <= 3` to `i <= 10`.",
      ],
      solution: r`#include <iostream>
using namespace std;

int main() {
    for (int i = 1; i <= 10; i++) {
        cout << i << endl;
    }
    return 0;
}`,
      solutionNotes: "Only the keep-going condition changes. That's the power of a loop: the amount of work is a number you can change, not lines you copy.",
    },
    explainAgain: `A loop is like telling someone "do 20 push-ups" instead of saying "do a push-up" 20 times. You describe the action once, plus a rule for how many times — and they keep count.`,
    summary: [
      "Loops repeat a block of code instead of copying it.",
      "Each repetition is an iteration.",
      "Changing the loop's limit changes how much work is done.",
    ],
  },

  {
    id: "for-loops",
    moduleId: "loops",
    title: "for loops",
    minutes: 20,
    goals: [
      "The three parts of a for loop: start, keep-going condition, update",
      "The exact order in which a for loop runs",
      "Getting the first and last values right (< vs <=)",
    ],
    intro: `The \`for\` loop is the counting loop. It packs three things into one header line: where the counter **starts**, the rule for **keeping going**, and how the counter **changes** after each iteration.`,
    sections: [
      {
        title: "The three parts",
        visual: "loop-anatomy",
        body: `\`\`\`cpp
for (int i = 1; i <= 5; i++) {
    cout << i;
}
\`\`\`

- **Initialization** \`int i = 1\` — runs **once**, at the very start.
- **Condition** \`i <= 5\` — checked **before every iteration**. True → run the body. False → leave the loop.
- **Update** \`i++\` — runs **after every iteration**.

Click each part of the header below to see what it does.`,
      },
      {
        title: "Watch it run",
        traceId: "sum-1-to-5",
        body: "Step through a loop that adds 1 to 5. Watch **when** the condition is checked and **when** `i++` happens — the update always comes *after* the body.",
      },
      {
        title: "The condition is a \"keep going\" rule",
        visual: "boundary-explorer",
        body: `Read the condition as **"keep going while…"**, not "stop when…". \`i <= 5\` keeps going for 1, 2, 3, 4, 5 and stops when i becomes 6.

The difference between \`<\` and \`<=\` is exactly one iteration — the last one. \`i < 5\` stops after 4. Use the explorer below to see which values are included.`,
      },
    ],
    mistakes: [
      { title: "Reading the condition as \"stop when\"", body: "`for (int i = 1; i > 5; i++)` doesn't run \"until i is greater than 5\" — it checks `1 > 5`, which is false, so the body runs zero times." },
      { title: "Off by one", body: "Using `<` when you need `<=` (or the other way round) misses or adds the last value. Always ask: what is the last value printed?" },
      { title: "A semicolon after the header", body: "`for (…);` gives the loop an empty body. The block below then runs once, after the loop. No `;` after the `)`." },
    ],
    example: {
      title: "Counting down",
      intro: "A for loop can count down too: start high, keep going while i >= 1, and subtract 1 each time.",
      code: r`#include <iostream>
using namespace std;

int main() {
    for (int i = 3; i >= 1; i--) {
        cout << i << " ";
    }
    cout << "Go!" << endl;
    return 0;
}`,
      output: "3 2 1 Go!\n",
      notes: [
        { line: 5, text: "Start at 3; keep going while i >= 1; `i--` subtracts 1 after each iteration." },
        { line: 8, text: "Runs once, after the loop ends (when i becomes 0)." },
      ],
    },
    quickCheck: {
      prompt: "How many times does the body run?",
      code: r`for (int i = 0; i < 4; i++) {
    cout << i;
}`,
      options: [
        { id: "a", text: "3", feedback: "Count the values: 0, 1, 2, 3. That's four." },
        { id: "b", text: "4", feedback: "Yes: i = 0, 1, 2, 3. When i becomes 4, `4 < 4` is false." },
        { id: "c", text: "5", feedback: "`<` stops before 4, so 4 itself is not included." },
      ],
      correct: "b",
      explanation: "Starting at 0 with `< 4` gives exactly 4 iterations: 0, 1, 2, 3.",
    },
    exercise: exerciseFromQuestion("fl-code-count-up", "Count from 1 to n"),
    explainAgain: `A for loop is like running laps with a lap counter:

1. Before the race, set the counter to 1 (initialization).
2. Before each lap, check the rule "keep running while the counter is at most 5" (condition).
3. Run the lap (body).
4. Click the counter up by one (update), then go back to step 2.

When the rule becomes false — on lap 6 — you stop. The rule says when you may continue, not where the finish line is.`,
    summary: [
      "`for (start; keep-going condition; update) { body }`.",
      "Order: initialize once → check → body → update → check → …",
      "`<` vs `<=` decides whether the last value is included.",
    ],
  },

  {
    id: "while-loops",
    moduleId: "loops",
    title: "while loops",
    minutes: 15,
    goals: [
      "Repeating while a condition stays true",
      "When a while loop fits better than a for loop",
      "Making sure the loop eventually stops",
    ],
    intro: `A \`for\` loop is ideal when you know how many times to repeat. A \`while\` loop is for "keep going **until something happens**" — until the number runs out of digits, until the user types 0, until the money runs out.`,
    sections: [
      {
        title: "The shape of a while loop",
        visual: "loop-flow",
        body: `\`\`\`cpp
while (condition) {
    // body
}
\`\`\`

Before each iteration the condition is checked. True → run the body and come back to check again. False → continue after the loop. If it's false the very first time, the body runs **zero** times.

A \`for\` loop is really a \`while\` loop with the start and update written in the header.`,
      },
      {
        title: "Taking a number apart",
        body: `A classic while loop removes the last digit of a number until nothing is left:

\`\`\`cpp
while (n > 0) {
    int digit = n % 10;   // last digit
    n = n / 10;           // drop the last digit
}
\`\`\`

For n = 472: digit 2 (n becomes 47), digit 7 (n becomes 4), digit 4 (n becomes 0) → stop. We don't know in advance how many digits there are — that's why \`while\` fits.`,
      },
    ],
    mistakes: [
      { title: "Infinite loops", body: "If nothing in the body changes the condition, it stays true forever. CodeMentor stops programs that run too long — if you see a time-limit message, check that the body moves the loop towards stopping (like `n = n / 10`)." },
      { title: "Forgetting to initialise the total", body: "`int sum;` starts with garbage. Write `int sum = 0;` before the loop." },
    ],
    example: {
      title: "Halving until 1",
      intro: "How many times can you halve a number before reaching 1? Run with `20`.",
      code: r`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int steps = 0;
    while (n > 1) {
        n = n / 2;
        steps++;
        cout << "now " << n << endl;
    }
    cout << "steps: " << steps << endl;
    return 0;
}`,
      input: "20\n",
      output: "now 10\nnow 5\nnow 2\nnow 1\nsteps: 4\n",
      notes: [
        { line: 8, text: "Checked before every iteration: still bigger than 1?" },
        { line: 9, text: "This line moves the loop towards stopping. Without it, the loop would never end." },
      ],
    },
    quickCheck: {
      prompt: "What is printed?",
      code: r`int n = 1;
while (n < 20) {
    n *= 3;
}
cout << n;`,
      options: [
        { id: "a", text: "9", feedback: "9 < 20 is still true, so the body runs once more." },
        { id: "b", text: "27", feedback: "Right: 1 → 3 → 9 → 27, and 27 < 20 is false." },
        { id: "c", text: "20", feedback: "n is multiplied by 3 each time; it never equals exactly 20." },
      ],
      correct: "b",
      explanation: "The condition is checked before every repetition. The loop stops at the first value that fails it — which can overshoot the limit.",
    },
    exercise: {
      title: "Sum of digits",
      prompt: `Read a whole number \`n\` (0 or more). Print the **sum of its digits**.

| Input | Output |
| --- | --- |
| \`1234\` | \`10\` |
| \`7\` | \`7\` |`,
      starterCode: r`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int sum = 0;
    // add up the digits of n with a while loop

    cout << sum << endl;
    return 0;
}`,
      tests: [
        { label: "1234", input: "1234\n", output: "10", visibility: "sample", category: "normal" },
        { label: "7", input: "7\n", output: "7", visibility: "sample", category: "boundary" },
        { label: "zero", input: "0\n", output: "0", visibility: "hidden", category: "edge" },
        { label: "1000", input: "1000\n", output: "1", visibility: "hidden", category: "edge" },
        { label: "99999", input: "99999\n", output: "45", visibility: "hidden", category: "normal" },
      ],
      compare: "tokens",
      hints: [
        "How do you get the last digit of a number? How do you remove it?",
        "`n % 10` is the last digit; `n / 10` drops it. Repeat while there are digits left — a while loop.",
        "Inside the loop you need two updates: add the last digit to `sum`, then shrink `n`. Is your loop condition `n > 0`?",
        "`while (n > 0) { sum += n % 10; n = n / 10; }`",
      ],
      solution: r`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int sum = 0;
    while (n > 0) {
        sum += n % 10;
        n = n / 10;
    }
    cout << sum << endl;
    return 0;
}`,
      solutionNotes: "Each iteration peels off the last digit (`% 10`), adds it, and removes it (`/ 10`). When n reaches 0 there are no digits left. For n = 0 the loop runs zero times and the sum stays 0.",
    },
    explainAgain: `A while loop is like eating biscuits from a packet: "while there are biscuits left, eat one". You don't need to count them first. The important part is that each round **changes something** (one fewer biscuit) — otherwise you'd be eating forever.`,
    summary: [
      "`while (condition) { … }` repeats as long as the condition is true.",
      "Use while when you don't know the number of iterations in advance.",
      "Something in the body must eventually make the condition false.",
    ],
  },

  {
    id: "do-while",
    moduleId: "loops",
    title: "do-while loops",
    minutes: 12,
    goals: [
      "A loop that always runs at least once",
      "The difference between checking before and after the body",
      "Where do-while is the natural choice",
    ],
    intro: `\`while\` checks **before** each iteration, so its body may never run. \`do-while\` checks **after** each iteration, so its body always runs **at least once**.`,
    sections: [
      {
        title: "Check after, not before",
        body: `\`\`\`cpp
do {
    // body — runs at least once
} while (condition);
\`\`\`

Note the **semicolon** after \`while (condition)\` — it's required here (unlike after a normal while header).

Order: body → check → body → check → … until the check is false.`,
      },
      {
        title: "When \"at least once\" matters",
        body: `Counting the digits of a number with a plain \`while (n > 0)\` loop gives **0** for the number 0 — but 0 has one digit! The body should run at least once:

\`\`\`cpp
int digits = 0;
do {
    digits++;
    n = n / 10;
} while (n > 0);
\`\`\`

For n = 0: the body runs (digits = 1), then \`0 > 0\` is false → stop. Menus are another classic: show the menu at least once, then repeat while the user doesn't choose "exit".`,
      },
    ],
    mistakes: [
      { title: "Forgetting the final semicolon", body: "`} while (n > 0)` without `;` is a compile error. do-while is the one loop that ends with a semicolon." },
      { title: "Using do-while when zero iterations are possible", body: "If the body must *not* run for some inputs (e.g. an empty list), use a plain while instead." },
    ],
    example: {
      title: "Runs once even when the condition is false",
      intro: "The condition is false from the start, yet the body runs once.",
      code: r`#include <iostream>
using namespace std;

int main() {
    int i = 10;
    do {
        cout << "i is " << i << endl;
        i++;
    } while (i < 5);
    cout << "after the loop i is " << i << endl;
    return 0;
}`,
      output: "i is 10\nafter the loop i is 11\n",
      notes: [
        { line: 7, text: "The body runs before any check." },
        { line: 9, text: "Now the check: 11 < 5 is false → leave the loop." },
      ],
    },
    quickCheck: {
      prompt: "With `n = 0`, how many times does each body run?",
      code: r`while (n > 0) { n--; }      // loop A
do { n--; } while (n > 0);   // loop B (n reset to 0 first)`,
      options: [
        { id: "a", text: "A: 0 times, B: 1 time", feedback: "Right: while checks first; do-while runs once before checking." },
        { id: "b", text: "A: 1 time, B: 0 times", feedback: "It's the other way round: do-while is the one that always runs once." },
        { id: "c", text: "Both 0 times", feedback: "do-while always runs its body at least once." },
      ],
      correct: "a",
      explanation: "while: check, then maybe run. do-while: run, then check.",
    },
    exercise: {
      title: "Count the digits",
      prompt: `Read a whole number \`n\` (0 or more). Print **how many digits** it has. Remember that \`0\` has one digit.

| Input | Output |
| --- | --- |
| \`12345\` | \`5\` |
| \`0\` | \`1\` |`,
      starterCode: r`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int digits = 0;
    // count the digits — make sure 0 counts as one digit

    cout << digits << endl;
    return 0;
}`,
      tests: [
        { label: "12345", input: "12345\n", output: "5", visibility: "sample", category: "normal" },
        { label: "zero", input: "0\n", output: "1", visibility: "sample", category: "edge" },
        { label: "7", input: "7\n", output: "1", visibility: "hidden", category: "boundary" },
        { label: "100", input: "100\n", output: "3", visibility: "hidden", category: "normal" },
        { label: "large", input: "2000000000\n", output: "10", visibility: "hidden", category: "boundary" },
      ],
      compare: "tokens",
      hints: [
        "What should happen for n = 0? Does your loop body run at all in that case?",
        "Remove one digit per iteration with `n = n / 10` and count iterations. A do-while runs at least once, which handles 0.",
        "If 0 prints 0, your loop checks before running. Switch to `do { … } while (n > 0);` — with the semicolon.",
        "`do { digits++; n = n / 10; } while (n > 0);`",
      ],
      solution: r`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int digits = 0;
    do {
        digits++;
        n = n / 10;
    } while (n > 0);
    cout << digits << endl;
    return 0;
}`,
      solutionNotes: "Each iteration counts one digit and removes it. Because do-while runs the body before checking, 0 is counted as one digit — a plain while loop would print 0.",
    },
    explainAgain: `while is "look before you leap": check first, maybe never jump. do-while is "leap, then look": you always jump once, then decide whether to jump again. Pick do-while when doing it once is always right.`,
    summary: [
      "`do { … } while (condition);` runs the body first, then checks.",
      "The body always runs at least once.",
      "Don't forget the semicolon after `while (…)`.",
    ],
  },

  {
    id: "nested-loops",
    moduleId: "loops",
    title: "Nested loops",
    minutes: 18,
    goals: [
      "A loop inside another loop",
      "That the inner loop runs completely for every outer iteration",
      "Using rows and columns to print grids",
    ],
    intro: `Some work has two levels: rows **and** columns, days **and** hours. A loop inside another loop handles both — the outer loop picks a row, the inner loop does everything in that row.`,
    sections: [
      {
        title: "The inner loop starts over",
        visual: "nested-grid",
        body: `\`\`\`cpp
for (int row = 1; row <= 2; row++) {
    for (int col = 1; col <= 3; col++) {
        cout << "*";
    }
    cout << endl;
}
\`\`\`

For **every** value of \`row\`, the inner loop runs **all** of its iterations (col = 1, 2, 3) and then the row ends with a new line. 2 rows × 3 columns = 6 stars in total.`,
      },
      {
        title: "Step through it",
        traceId: "nested-2x3",
        body: "Watch `col` go back to 1 each time `row` changes. The new line is printed after the inner loop finishes — inside the outer loop.",
      },
    ],
    mistakes: [
      { title: "New line in the wrong place", body: "Inside the inner loop, every star gets its own line. Outside both loops, everything ends up on one line. It belongs after the inner loop, inside the outer one." },
      { title: "Reusing the same counter", body: "Both loops using `i` makes the inner loop change the outer counter. Use different names, like `row` and `col`." },
    ],
    example: {
      title: "A times table grid",
      intro: "The outer loop is the row number, the inner loop the column. Each cell is row × col.",
      code: r`#include <iostream>
using namespace std;

int main() {
    for (int row = 1; row <= 3; row++) {
        for (int col = 1; col <= 4; col++) {
            cout << row * col << " ";
        }
        cout << endl;
    }
    return 0;
}`,
      output: "1 2 3 4 \n2 4 6 8 \n3 6 9 12 \n",
      notes: [
        { line: 5, text: "Three rows." },
        { line: 6, text: "For each row, four columns — col restarts at 1 every time." },
        { line: 9, text: "End of a row: new line." },
      ],
    },
    quickCheck: {
      prompt: "What is the value of count afterwards?",
      code: r`int count = 0;
for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 4; j++) {
        count++;
    }
}`,
      options: [
        { id: "a", text: "7", feedback: "That's 3 + 4. The inner loop runs completely for every outer step." },
        { id: "b", text: "12", feedback: "Right: 3 outer steps × 4 inner steps each." },
        { id: "c", text: "4", feedback: "The inner loop starts over for each of the 3 outer steps." },
      ],
      correct: "b",
      explanation: "For every iteration of the outer loop, the inner loop runs all of its iterations: 3 × 4 = 12.",
    },
    exercise: exerciseFromQuestion("fl-code-square", "Square of stars"),
    explainAgain: `Think of a clock: the minute hand (inner loop) goes all the way round, 0 to 59, for **each** step of the hour hand (outer loop). The hour hand moves once; the minute hand does a full circle. Nested loops work exactly like that.`,
    summary: [
      "The inner loop runs fully for each iteration of the outer loop.",
      "Total iterations = outer count × inner count.",
      "Use separate counter names; end rows after the inner loop.",
    ],
  },

  {
    id: "break-continue",
    moduleId: "loops",
    title: "break and continue",
    minutes: 12,
    goals: [
      "Leaving a loop early with `break`",
      "Skipping the rest of one iteration with `continue`",
      "Searching for the first match",
    ],
    intro: `Sometimes you don't need to finish a loop: you were searching and you found it. Sometimes you want to skip just one item. \`break\` and \`continue\` give you that control.`,
    sections: [
      {
        title: "break: stop the loop now",
        body: `\`\`\`cpp
for (int i = 1; i <= 100; i++) {
    if (i * i > 50) {
        cout << "first square above 50: " << i * i;
        break;
    }
}
\`\`\`

\`break\` leaves the **innermost** loop immediately; the program continues after it. Here the loop stops at i = 8, without checking 9 to 100.`,
      },
      {
        title: "continue: skip to the next iteration",
        body: `\`\`\`cpp
for (int i = 1; i <= 10; i++) {
    if (i % 3 == 0) {
        continue;      // skip multiples of 3
    }
    cout << i << " ";
}
\`\`\`

\`continue\` jumps straight to the next iteration (in a for loop, the update \`i++\` still happens). This prints \`1 2 4 5 7 8 10\`.`,
      },
    ],
    mistakes: [
      { title: "Printing \"not found\" inside the loop", body: "If you print \"None\" every time an item doesn't match, it's printed many times. Use a variable (like `bool found = false;`) and decide **after** the loop." },
      { title: "continue in a while loop skipping the update", body: "In a while loop, `continue` jumps back to the check — if the update (`i++`) is below the continue, it's skipped and the loop may never end." },
    ],
    example: {
      title: "Skip and stop",
      intro: "Prints numbers from 1, skipping multiples of 3, and stops completely at the first number above 10.",
      code: r`#include <iostream>
using namespace std;

int main() {
    for (int i = 1; i <= 20; i++) {
        if (i > 10) {
            break;
        }
        if (i % 3 == 0) {
            continue;
        }
        cout << i << " ";
    }
    cout << endl << "finished" << endl;
    return 0;
}`,
      output: "1 2 4 5 7 8 10 \nfinished\n",
      notes: [
        { line: 7, text: "At i = 11 the whole loop ends." },
        { line: 10, text: "For 3, 6, 9 the print is skipped." },
      ],
    },
    quickCheck: {
      prompt: "What does this print?",
      code: r`for (int i = 1; i <= 6; i++) {
    if (i == 3) continue;
    if (i == 5) break;
    cout << i;
}`,
      options: [
        { id: "a", text: "12456", feedback: "break at i == 5 ends the whole loop, so 5 and 6 never print." },
        { id: "b", text: "124", feedback: "Right: 3 is skipped by continue, and the loop stops completely at 5." },
        { id: "c", text: "12", feedback: "continue only skips the rest of that one iteration; the loop goes on with 4." },
      ],
      correct: "b",
      explanation: "continue jumps to the next iteration; break leaves the loop entirely.",
    },
    exercise: {
      title: "First multiple of 7",
      prompt: `The first number is \`n\`, followed by \`n\` positive whole numbers. Print the **first** of them that is divisible by 7. If none is, print \`None\`.

| Input | Output |
| --- | --- |
| \`5\` then \`3 14 21 4 5\` | \`14\` |
| \`3\` then \`1 2 3\` | \`None\` |`,
      starterCode: r`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    // read the n numbers one by one;
    // print the first multiple of 7 and stop, or None if there isn't one

    return 0;
}`,
      tests: [
        { label: "found in the middle", input: "5\n3 14 21 4 5\n", output: "14", visibility: "sample", category: "normal" },
        { label: "none", input: "3\n1 2 3\n", output: "None", visibility: "sample", category: "edge" },
        { label: "only one number", input: "1\n7\n", output: "7", visibility: "hidden", category: "boundary" },
        { label: "last number", input: "4\n1 2 3 49\n", output: "49", visibility: "hidden", category: "boundary" },
        { label: "several matches", input: "6\n8 70 35 7 1 14\n", output: "70", visibility: "hidden", category: "normal" },
      ],
      compare: "tokens",
      hints: [
        "Once you've found a multiple of 7, do you need to look at the rest?",
        "Read each number inside a loop. `x % 7 == 0` tests divisibility; `break` stops the loop.",
        "Print \"None\" only after the loop, and only if nothing was found — use a `bool found = false;` variable.",
        "Loop n times: read x; if `x % 7 == 0` print x, set found = true, break. After the loop: `if (!found) cout << \"None\";`",
      ],
      solution: r`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    bool found = false;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        if (x % 7 == 0) {
            cout << x << endl;
            found = true;
            break;
        }
    }
    if (!found) {
        cout << "None" << endl;
    }
    return 0;
}`,
      solutionNotes: "The loop stops at the first match with `break`. The `found` flag remembers whether anything matched, so \"None\" is decided once, after the loop.",
    },
    explainAgain: `Searching a bookshelf for your book: you check one book at a time, and once you find it you stop looking — that's \`break\`. If a shelf slot holds a magazine you don't bother reading it, you just move to the next slot — that's \`continue\`.`,
    summary: [
      "`break` ends the innermost loop immediately.",
      "`continue` skips to the next iteration.",
      "Decide \"not found\" after the loop, using a flag variable.",
    ],
  },

  {
    id: "loop-patterns",
    moduleId: "loops",
    title: "Number and pattern problems",
    minutes: 18,
    goals: [
      "Turning a picture of the output into loops",
      "Inner loops whose length depends on the outer counter",
      "A step-by-step method for pattern problems",
    ],
    intro: `Pattern problems — triangles of stars, number pyramids — are popular in practical exams because they test whether you really understand nested loops. The trick is to describe each **row** in terms of its row number.`,
    sections: [
      {
        title: "A method for any pattern",
        body: `1. Write out the expected output for a small n (say 4).
2. Number the rows 1, 2, 3, 4.
3. For each row, write **what** is printed and **how many** — in terms of the row number.
4. Outer loop = rows. Inner loop(s) = what's in one row. New line after each row.

For a right triangle with n = 4:

| Row | Printed | Count |
| --- | --- | --- |
| 1 | \`*\` | 1 |
| 2 | \`**\` | 2 |
| 3 | \`***\` | 3 |
| 4 | \`****\` | 4 |

Row number \`row\` has \`row\` stars — so the inner loop runs while \`col <= row\`.`,
      },
      {
        title: "Number patterns",
        body: `Change what the inner loop prints and you get number patterns. Printing \`col\` instead of \`*\`:

\`\`\`
1
1 2
1 2 3
\`\`\`

Printing \`row\` instead gives \`1\`, \`2 2\`, \`3 3 3\`. Look at the table you wrote in step 3 to decide which variable to print.`,
      },
    ],
    mistakes: [
      { title: "Inner loop with a fixed limit", body: "`col <= n` prints a square. For a triangle, the inner limit must depend on the row: `col <= row`." },
      { title: "Guessing instead of tabulating", body: "If the pattern is wrong, write the row/count table on paper first. The loop conditions come straight from it." },
    ],
    example: {
      title: "Number triangle",
      intro: "Each row prints the numbers from 1 up to its row number. Run with `4`.",
      code: r`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    for (int row = 1; row <= n; row++) {
        for (int col = 1; col <= row; col++) {
            cout << col << " ";
        }
        cout << endl;
    }
    return 0;
}`,
      input: "4\n",
      output: "1 \n1 2 \n1 2 3 \n1 2 3 4 \n",
      notes: [
        { line: 8, text: "The inner limit is `row`, so row 1 prints one number, row 4 prints four." },
      ],
    },
    quickCheck: {
      prompt: "What is printed?",
      code: r`int n = 1234, sum = 0;
while (n > 0) {
    sum += n % 10;
    n /= 10;
}
cout << sum;`,
      options: [
        { id: "a", text: "1234", feedback: "sum only collects single digits." },
        { id: "b", text: "10", feedback: "Right: % 10 takes the last digit and / 10 removes it: 4 + 3 + 2 + 1." },
        { id: "c", text: "4", feedback: "The loop repeats until n reaches 0, adding every digit." },
      ],
      correct: "b",
      explanation: "n % 10 is the last digit and n /= 10 drops it — the standard pattern for walking through the digits of a number.",
    },
    exercise: {
      title: "Right triangle of stars",
      prompt: `Read \`n\` and print a right triangle of \`*\` with \`n\` rows: row 1 has one star, row 2 has two, … row n has n.

| Input | Output |
| --- | --- |
| \`3\` | \`*\`, \`**\`, \`***\` on three lines |`,
      starterCode: r`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    // row r has r stars

    return 0;
}`,
      tests: [
        { label: "n = 3", input: "3\n", output: "*\n**\n***", visibility: "sample", category: "normal" },
        { label: "n = 1", input: "1\n", output: "*", visibility: "hidden", category: "boundary" },
        { label: "n = 5", input: "5\n", output: "*\n**\n***\n****\n*****", visibility: "hidden", category: "normal" },
        { label: "n = 2", input: "2\n", output: "*\n**", visibility: "hidden", category: "normal" },
      ],
      compare: "lines",
      hints: [
        "Write the output for n = 4 and count the stars in each row. How does the count relate to the row number?",
        "Outer loop over rows; inner loop prints the stars for one row. Row `row` has `row` stars.",
        "If you get a square, your inner loop uses `n` as its limit — it should use the row number. Check where the new line is.",
        "`for (int row = 1; row <= n; row++) { for (int col = 1; col <= row; col++) cout << \"*\"; cout << endl; }`",
      ],
      solution: r`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    for (int row = 1; row <= n; row++) {
        for (int col = 1; col <= row; col++) {
            cout << "*";
        }
        cout << endl;
    }
    return 0;
}`,
      solutionNotes: "The only change from the square is the inner limit: `col <= row` instead of `col <= n`, so each row is one star longer than the last.",
    },
    explainAgain: `Think of building a staircase out of blocks. Step 1 needs one block, step 2 needs two, step 3 needs three. The outer loop walks up the steps; for each step, the inner loop places as many blocks as the step's number.`,
    summary: [
      "Tabulate: row number → what is printed and how many times.",
      "The inner loop's limit can depend on the outer counter.",
      "New line after the inner loop, inside the outer loop.",
    ],
  },
];
