import type { QuestionDef } from "../types";

/**
 * Diagnostic bank: 2–3 items per rung of the ladder, mixed types, distractors tagged with the
 * misconception they reveal. Most are also usable for revision of that concept.
 */
export const DIAGNOSTIC_QUESTIONS: QuestionDef[] = [
  // ── Program basics ──
  {
    id: "d-bas-cout", type: "predict_output", conceptId: "cpp-basics", difficulty: 1,
    skills: [{ id: "output_cout" }], purposes: ["diagnostic", "revision"], probes: ["MC-IO-01"],
    prompt: "What does this print?",
    code: `cout << "Hi" << 5 << "!";`,
    options: [
      { id: "a", text: "Hi5!" },
      { id: "b", text: "Hi 5 !", misconception: "MC-IO-01", feedback: "cout doesn't add spaces between the pieces." },
      { id: "c", text: "\"Hi\"5\"!\"", feedback: "The quotes only mark where the text starts and ends; they aren't printed." },
      { id: "d", text: "Hi 5!", misconception: "MC-IO-01", feedback: "No space is printed unless you send one." },
    ],
    correct: "a",
    hints: [
      "Does cout ever print something you didn't send it?",
      "Think about what each `<<` sends to the screen.",
      "There are three pieces: \"Hi\", 5 and \"!\". Is a space one of them?",
      "cout prints exactly the characters you give it, back to back.",
      "Write the three pieces next to each other with nothing between them.",
    ],
    explanation: "cout prints each piece exactly, one after another: Hi, then 5, then ! — giving Hi5!.",
  },
  {
    id: "d-bas-error", type: "identify_error", conceptId: "cpp-basics", difficulty: 2,
    skills: [{ id: "program_structure" }, { id: "input_cin", weight: 0.5 }], purposes: ["diagnostic", "revision"],
    prompt: "This program won't compile. What is wrong?",
    code: `#include <iostream>
using namespace std;

int main() {
    int age;
    cin >> age
    cout << age + 1;
    return 0;
}`,
    options: [
      { id: "a", text: "Line 6 is missing a ; at the end" },
      { id: "b", text: "Line 2: using namespace std; isn't allowed here" },
      { id: "c", text: "Line 7: you can't do arithmetic inside cout" },
      { id: "d", text: "Line 8: main must not return a value" },
    ],
    correct: "a",
    hints: [
      "How does C++ know where one statement ends?",
      "Every statement ends with the same character.",
      "Look at the line that reads the age.",
      "Without a ; C++ reads `cin >> age cout << …` as one long statement and gets confused.",
      "Add the missing character at the end of line 6.",
    ],
    explanation: "Each statement must end with a semicolon. `cin >> age` on line 6 has none, so the compiler fails at the next line.",
  },
  {
    id: "d-bas-sum", type: "write_code", conceptId: "cpp-basics", difficulty: 2,
    skills: [{ id: "input_cin" }, { id: "output_cout" }, { id: "program_structure", weight: 0.5 }],
    purposes: ["diagnostic"],
    prompt: "Read two whole numbers and print their sum.",
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // Read two numbers, then print their sum

    return 0;
}`,
    tests: [
      { label: "3 and 4", input: "3 4\n", output: "7", visibility: "sample", category: "normal" },
      { label: "negative number", input: "10 -2\n", output: "8", visibility: "visible", category: "normal" },
      { label: "zeros", input: "0 0\n", output: "0", visibility: "hidden", category: "edge" },
      { label: "larger numbers", input: "1000 2000\n", output: "3000", visibility: "hidden", category: "normal" },
    ],
    compare: "tokens",
    referenceSolution: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b;
    return 0;
}`,
    solutionWalkthrough: "Declare two int variables, read both with one `cin >> a >> b;`, then print `a + b`.",
    detectors: [],
    hints: [
      "Where will the two numbers be stored after you read them?",
      "You need two variables, cin to read them and cout to print.",
      "Your code goes where the comment is, before `return 0;`.",
      "`cin >> a >> b;` reads two numbers in one line.",
      "int a, b;\ncin >> a >> b;\ncout << ___;",
    ],
    explanation: "Store the inputs in variables with cin, then print the expression a + b.",
  },
  // ── Variables & types ──
  {
    id: "d-var-copy", type: "predict_output", conceptId: "variables-types", difficulty: 2,
    skills: [{ id: "variables" }], purposes: ["diagnostic", "revision"], probes: ["MC-VAR-01"],
    prompt: "What does this print?",
    code: `int a = 5;
int b = a;
a = 9;
cout << b;`,
    options: [
      { id: "a", text: "5" },
      { id: "b", text: "9", misconception: "MC-VAR-01", feedback: "b got a copy of a's value at line 2; changing a later doesn't change b." },
      { id: "c", text: "14" },
      { id: "d", text: "It doesn't compile" },
    ],
    correct: "a",
    hints: [
      "What value does b get on line 2?",
      "Assignment copies a value at one moment in time.",
      "Line 3 changes a. Does that line mention b?",
      "`b = a` copies the 5. The variables aren't linked afterwards.",
      "Track each variable's value line by line: a=5; b=5; a=9.",
    ],
    explanation: "Line 2 copies 5 into b. Line 3 changes only a, so b is still 5.",
  },
  {
    id: "d-var-type", type: "mcq", conceptId: "variables-types", difficulty: 1,
    skills: [{ id: "data_types" }], purposes: ["diagnostic", "revision"],
    prompt: "Which type should store an average mark like 87.5?",
    options: [
      { id: "a", text: "int", feedback: "An int can't hold the .5 — it would be dropped." },
      { id: "b", text: "double" },
      { id: "c", text: "char", feedback: "char holds a single character such as 'A'." },
      { id: "d", text: "bool", feedback: "bool holds only true or false." },
    ],
    correct: "b",
    hints: [
      "What's special about 87.5 compared with 87?",
      "Some types hold whole numbers only.",
      "Look for the type that can store a decimal part.",
      "int drops decimals; double keeps them.",
      "Choose the floating-point type.",
    ],
    explanation: "87.5 has a fractional part, so it needs a floating-point type like double.",
  },
  // ── Arithmetic ──
  {
    id: "d-ari-div", type: "predict_output", conceptId: "arithmetic-ops", difficulty: 2,
    skills: [{ id: "integer_division" }], purposes: ["diagnostic", "revision"], probes: ["MC-INT-01"],
    prompt: "What does this print?",
    code: `cout << 7 / 2 << " " << 7 % 2;`,
    options: [
      { id: "a", text: "3.5 1", misconception: "MC-INT-01", feedback: "7 and 2 are both ints, so 7 / 2 is an int too." },
      { id: "b", text: "3 1" },
      { id: "c", text: "3.5 0.5", misconception: "MC-INT-01" },
      { id: "d", text: "1 3", feedback: "/ gives the quotient and % gives the remainder — in that order here." },
    ],
    correct: "b",
    hints: [
      "What type is 7? What type is 2?",
      "When both sides are ints, the result is an int.",
      "% gives what is left over after dividing.",
      "7 / 2 = 3 remainder 1.",
      "Quotient first, then a space, then the remainder.",
    ],
    explanation: "Both operands are int, so 7 / 2 is 3 (the .5 is dropped), and 7 % 2 is the remainder, 1.",
  },
  {
    id: "d-ari-inc", type: "predict_output", conceptId: "arithmetic-ops", difficulty: 2,
    skills: [{ id: "increment_ops" }], purposes: ["diagnostic", "revision"], probes: ["MC-INC-01"],
    prompt: "What does this print?",
    code: `int i = 4;
int j = i + 1;
i++;
cout << i << " " << j;`,
    options: [
      { id: "a", text: "5 5" },
      { id: "b", text: "6 5", misconception: "MC-INC-01", feedback: "`i + 1` on line 2 calculates 5 for j but doesn't change i." },
      { id: "c", text: "4 5", feedback: "Line 3 (`i++`) does change i." },
      { id: "d", text: "5 6" },
    ],
    correct: "a",
    hints: [
      "Which lines actually change i?",
      "Calculating a value is different from storing it.",
      "Line 2 stores something in j. Line 3 changes i.",
      "`i + 1` leaves i at 4; `i++` makes it 5.",
      "After line 2: i=4, j=5. After line 3: i=5.",
    ],
    explanation: "Line 2 stores 4 + 1 = 5 in j without changing i. Line 3 increments i to 5. So it prints 5 5.",
  },
  {
    id: "d-ari-prec", type: "predict_output", conceptId: "arithmetic-ops", difficulty: 2,
    skills: [{ id: "arithmetic_ops" }], purposes: ["diagnostic", "revision"],
    prompt: "What does this print?",
    code: `cout << 2 + 3 * 4;`,
    options: [
      { id: "a", text: "20", feedback: "Multiplication happens before addition." },
      { id: "b", text: "14" },
      { id: "c", text: "24" },
      { id: "d", text: "9" },
    ],
    correct: "b",
    hints: [
      "Which operation happens first?",
      "C++ follows the same order of operations as maths.",
      "Look at 3 * 4 first.",
      "* and / are done before + and -.",
      "3 * 4 = 12, then 2 + 12.",
    ],
    explanation: "Multiplication comes first: 3 * 4 = 12, then 2 + 12 = 14.",
  },
  // ── Comparison ──
  {
    id: "d-cmp-edge", type: "mcq", conceptId: "comparison-ops", difficulty: 1,
    skills: [{ id: "relational_ops" }], purposes: ["diagnostic", "revision"], probes: ["MC-REL-02"],
    prompt: "What does the expression `5 < 5` evaluate to?",
    options: [
      { id: "a", text: "true", misconception: "MC-REL-02", feedback: "Is 5 smaller than 5? `<` doesn't include equal values." },
      { id: "b", text: "false" },
      { id: "c", text: "It causes an error" },
      { id: "d", text: "5" },
    ],
    correct: "b",
    hints: [
      "Can a number be smaller than itself?",
      "`<` means strictly less than.",
      "Compare with `5 <= 5`.",
      "Equal values are not 'less than' each other.",
      "Answer with a true/false value.",
    ],
    explanation: "5 is not strictly less than 5, so `5 < 5` is false. (`5 <= 5` would be true.)",
  },
  {
    id: "d-cmp-logic", type: "predict_output", conceptId: "comparison-ops", difficulty: 2,
    skills: [{ id: "logical_ops" }, { id: "relational_ops", weight: 0.5 }], purposes: ["diagnostic", "revision"],
    prompt: "What does this print? (cout prints true as 1 and false as 0.)",
    code: `int x = 7;
cout << (x >= 7 && x < 10) << " " << (x == 8 || x != 7);`,
    options: [
      { id: "a", text: "1 0" },
      { id: "b", text: "1 1" },
      { id: "c", text: "0 0", misconception: "MC-REL-02", feedback: "x >= 7 includes 7 itself." },
      { id: "d", text: "true false", feedback: "cout prints bool values as 1 and 0." },
    ],
    correct: "a",
    hints: [
      "Evaluate each comparison separately before combining.",
      "&& needs both sides true; || needs at least one.",
      "x is 7: is 7 >= 7? Is 7 < 10?",
      "Second part: is 7 == 8? Is 7 != 7?",
      "true && true → 1; false || false → 0.",
    ],
    explanation: "7 >= 7 and 7 < 10 are both true, so && gives 1. 7 == 8 and 7 != 7 are both false, so || gives 0.",
  },
  {
    id: "d-cmp-assign", type: "identify_error", conceptId: "comparison-ops", difficulty: 2,
    skills: [{ id: "relational_ops" }], purposes: ["diagnostic", "lesson", "revision"], probes: ["MC-REL-01"],
    prompt: "This is supposed to print \"ten\" only when x is 10. What's wrong?",
    code: `int x;
cin >> x;
if (x = 10) {
    cout << "ten";
}`,
    options: [
      { id: "a", text: "Line 3: `=` stores 10 in x; comparing needs `==`" },
      { id: "b", text: "Line 2: cin can't read into x before it has a value" },
      { id: "c", text: "Line 4: text must use single quotes" },
      { id: "d", text: "Nothing — it prints \"ten\" only when x is 10", misconception: "MC-REL-01", feedback: "`x = 10` assigns 10 to x, and 10 counts as true — so it always prints." },
    ],
    correct: "a",
    hints: [
      "What does `x = 10` do to x?",
      "C++ has one operator for storing and another for comparing.",
      "Look at the condition on line 3.",
      "`=` assigns; `==` compares. An assignment inside if is almost always a bug.",
      "Change the condition to compare x with 10.",
    ],
    explanation: "`x = 10` assigns 10 to x and is then treated as true, so \"ten\" is always printed. The comparison is `x == 10`.",
  },
  // ── Conditions ──
  {
    id: "d-con-ladder", type: "predict_output", conceptId: "conditions", difficulty: 2,
    skills: [{ id: "else_if" }], purposes: ["diagnostic", "revision"], probes: ["MC-COND-01"],
    prompt: "What does this print?",
    code: `int marks = 85;
if (marks >= 90) cout << "A";
else if (marks >= 80) cout << "B";
else if (marks >= 70) cout << "C";
else cout << "D";`,
    options: [
      { id: "a", text: "A" },
      { id: "b", text: "B" },
      { id: "c", text: "BC", misconception: "MC-COND-01", feedback: "Once a branch runs, the rest of the ladder is skipped." },
      { id: "d", text: "D" },
    ],
    correct: "b",
    hints: [
      "Which condition is the first one that's true for 85?",
      "An if / else-if ladder runs at most one branch.",
      "Check 85 >= 90 first, then 85 >= 80.",
      "After the first true condition, the remaining else-ifs aren't checked.",
      "85 >= 90 is false; 85 >= 80 is true → stop there.",
    ],
    explanation: "85 >= 90 is false, 85 >= 80 is true, so it prints B and skips the rest of the ladder.",
  },
  {
    id: "d-con-nested", type: "predict_output", conceptId: "conditions", difficulty: 3,
    skills: [{ id: "if_else" }], purposes: ["diagnostic", "revision"],
    prompt: "What does this print?",
    code: `int a = 4, b = 9;
if (a > b) {
    cout << "x";
} else {
    if (b % 2 == 0) cout << "y";
    else cout << "z";
}`,
    options: [
      { id: "a", text: "x" },
      { id: "b", text: "y" },
      { id: "c", text: "z" },
      { id: "d", text: "yz", misconception: "MC-COND-01" },
    ],
    correct: "c",
    hints: [
      "Which branch of the outer if runs?",
      "Is 4 > 9?",
      "Inside the else, check whether 9 is even.",
      "9 % 2 is 1, so `b % 2 == 0` is false.",
      "Outer: else branch. Inner: else branch.",
    ],
    explanation: "4 > 9 is false, so the outer else runs. 9 % 2 is 1, not 0, so the inner else prints z.",
  },
  // ── For loops ──
  {
    id: "d-for-print", type: "predict_output", conceptId: "for-loops", difficulty: 2,
    skills: [{ id: "loop_boundaries" }, { id: "loop_init", weight: 0.5 }], purposes: ["diagnostic"],
    probes: ["MC-LOOP-04", "MC-LOOP-09"],
    prompt: "What does this print?",
    code: `for (int i = 1; i <= 4; i++) {
    cout << i << " ";
}`,
    options: [
      { id: "a", text: "1 2 3 4" },
      { id: "b", text: "1 2 3", misconception: "MC-LOOP-04", feedback: "`<=` includes 4 itself." },
      { id: "c", text: "2 3 4 5", misconception: "MC-LOOP-09", feedback: "i++ runs after the body, so the first iteration uses i = 1." },
      { id: "d", text: "0 1 2 3 4", misconception: "MC-LOOP-04" },
    ],
    correct: "a",
    hints: [
      "What is i in the very first iteration?",
      "The condition is checked before every iteration.",
      "What's the last value of i for which `i <= 4` is true?",
      "Start at 1, keep going while i ≤ 4.",
      "List the values: 1, 2, …",
    ],
    explanation: "i starts at 1 and the loop keeps going while i ≤ 4, so it prints 1 2 3 4.",
  },
  {
    id: "d-for-count", type: "mcq", conceptId: "for-loops", difficulty: 3,
    skills: [{ id: "loop_tracing" }, { id: "loop_update", weight: 0.5 }], purposes: ["diagnostic"], probes: ["MC-LOOP-07"],
    prompt: "How many times does the body of this loop run?",
    code: `for (int i = 0; i < 10; i += 2) {
    // body
}`,
    options: [
      { id: "a", text: "4", misconception: "MC-LOOP-07" },
      { id: "b", text: "5" },
      { id: "c", text: "6", misconception: "MC-LOOP-07" },
      { id: "d", text: "10", feedback: "i goes up by 2 each time, not by 1." },
    ],
    correct: "b",
    hints: [
      "Which values does i take?",
      "Write the values down and count them.",
      "Start at 0 and add 2 until the condition fails.",
      "0, 2, 4, 6, 8 — is 10 < 10?",
      "Count the list 0, 2, 4, 6, 8.",
    ],
    explanation: "i takes the values 0, 2, 4, 6, 8. At 10, `10 < 10` is false. That's 5 iterations.",
  },
  {
    id: "d-for-down", type: "predict_output", conceptId: "for-loops", difficulty: 3,
    skills: [{ id: "loop_counting_down" }, { id: "loop_accumulation", weight: 0.5 }, { id: "loop_condition", weight: 0.5 }],
    purposes: ["diagnostic"], probes: ["MC-LOOP-01", "MC-LOOP-09"],
    prompt: "What does this print?",
    code: `int total = 0;
for (int i = 5; i > 0; i--) {
    total += i;
}
cout << total;`,
    options: [
      { id: "a", text: "15" },
      { id: "b", text: "10", misconception: "MC-LOOP-09", feedback: "The first iteration uses i = 5; i-- happens after the body." },
      { id: "c", text: "14" },
      { id: "d", text: "0", misconception: "MC-LOOP-01", feedback: "`i > 0` is true at the start (5 > 0), so the loop does run." },
    ],
    correct: "a",
    hints: [
      "Is the condition true when the loop starts?",
      "The loop keeps going while i > 0.",
      "Which values of i get added to total?",
      "5, 4, 3, 2, 1 — stop when i is 0.",
      "Add them: 5 + 4 + 3 + 2 + 1.",
    ],
    explanation: "i takes 5, 4, 3, 2, 1 (stopping when i is 0), so total = 15.",
  },
  {
    id: "d-for-sum", type: "write_code", conceptId: "for-loops", difficulty: 3,
    skills: [{ id: "loop_accumulation" }, { id: "loop_boundaries" }, { id: "loop_condition", weight: 0.5 }],
    purposes: ["diagnostic"], probes: ["MC-LOOP-04", "MC-LOOP-05"],
    prompt: "Read a number n and print the sum 1 + 2 + … + n.",
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    // Print 1 + 2 + ... + n

    return 0;
}`,
    tests: [
      { label: "n = 5", input: "5\n", output: "15", visibility: "sample", category: "normal" },
      { label: "n = 1", input: "1\n", output: "1", visibility: "visible", category: "boundary" },
      { label: "n = 10", input: "10\n", output: "55", visibility: "hidden", category: "normal" },
      { label: "n = 100", input: "100\n", output: "5050", visibility: "hidden", category: "normal" },
      { label: "n = 0", input: "0\n", output: "0", visibility: "hidden", category: "edge" },
    ],
    compare: "tokens",
    referenceSolution: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int sum = 0;
    for (int i = 1; i <= n; i++) {
        sum += i;
    }
    cout << sum;
    return 0;
}`,
    solutionWalkthrough: "Create `sum = 0` before the loop, loop i from 1 while i <= n, add i each time, print sum after the loop.",
    detectors: [{ kind: "accumulator", lastTermOf: "n" }, { kind: "for_header", direction: "up" }],
    hints: [
      "Where will you keep the running total, and what should it start at?",
      "This needs a loop that visits 1, 2, …, n and adds each one.",
      "Create the total before the loop; add inside; print after.",
      "To include n itself, the condition must still be true when i equals n.",
      "int sum = 0;\nfor (int i = 1; i <= n; i++) {\n    sum += ___;\n}\ncout << sum;",
    ],
    explanation: "Keep a running total that starts at 0 before the loop and add each i from 1 to n.",
  },
  // ── Nested loops ──
  {
    id: "d-nest-count", type: "mcq", conceptId: "nested-loops", difficulty: 3,
    skills: [{ id: "nested_intro" }], purposes: ["diagnostic"], probes: ["MC-NEST-01"],
    prompt: "How many stars does this print?",
    code: `for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 4; j++) {
        cout << "*";
    }
}`,
    options: [
      { id: "a", text: "7", feedback: "The counts multiply rather than add." },
      { id: "b", text: "12" },
      { id: "c", text: "4", misconception: "MC-NEST-01", feedback: "The inner loop runs fully for each of the 3 outer iterations." },
      { id: "d", text: "3", misconception: "MC-NEST-01" },
    ],
    correct: "b",
    hints: [
      "How many times does the inner loop start?",
      "The inner loop runs completely for every outer iteration.",
      "Outer: 3 iterations. Inner: 4 each time.",
      "Total = outer count × inner count.",
      "3 × 4 = ?",
    ],
    explanation: "The inner loop prints 4 stars and runs once for each of the 3 outer iterations: 3 × 4 = 12.",
  },
  {
    id: "d-nest-tri", type: "predict_output", conceptId: "nested-loops", difficulty: 4,
    skills: [{ id: "nested_patterns" }, { id: "nested_intro", weight: 0.5 }], purposes: ["diagnostic"],
    prompt: "What does this print?",
    code: `for (int i = 1; i <= 3; i++) {
    for (int j = 1; j <= i; j++) {
        cout << j;
    }
    cout << " ";
}`,
    options: [
      { id: "a", text: "1 12 123" },
      { id: "b", text: "123 123 123", feedback: "The inner condition is `j <= i`, so the inner loop gets longer each time." },
      { id: "c", text: "1 2 3", misconception: "MC-NEST-01" },
      { id: "d", text: "111 222 333" },
    ],
    correct: "a",
    hints: [
      "How many times does the inner loop run when i is 1?",
      "The inner loop's limit depends on i.",
      "Trace i = 1, then i = 2, then i = 3.",
      "For each i, j goes from 1 up to i, then a space is printed.",
      "i=1 → 1; i=2 → 12; i=3 → 123.",
    ],
    explanation: "For each i the inner loop prints 1..i: \"1\", \"12\", \"123\", each followed by a space.",
  },
  // ── Functions ──
  {
    id: "d-fun-return", type: "predict_output", conceptId: "functions", difficulty: 3,
    skills: [{ id: "function_params_return" }, { id: "function_basics", weight: 0.5 }], purposes: ["diagnostic"], probes: ["MC-FUNC-01"],
    prompt: "What does this program print?",
    code: `int twice(int x) {
    return x * 2;
}

int main() {
    int r = twice(4);
    cout << r + 1;
}`,
    options: [
      { id: "a", text: "9" },
      { id: "b", text: "8", feedback: "r is 8, but the program prints r + 1." },
      { id: "c", text: "89", misconception: "MC-FUNC-01", feedback: "return gives 8 back to main; it doesn't print it." },
      { id: "d", text: "5" },
    ],
    correct: "a",
    hints: [
      "What value does twice(4) give back?",
      "return hands a value back to the caller.",
      "Follow r: what is stored in it?",
      "Only cout prints; return doesn't.",
      "r = 8, then print r + 1.",
    ],
    explanation: "twice(4) returns 8 into r (nothing is printed by return). Then main prints r + 1 = 9.",
  },
  {
    id: "d-fun-value", type: "predict_output", conceptId: "functions", difficulty: 3,
    skills: [{ id: "function_params_return" }], purposes: ["diagnostic"],
    prompt: "What does this program print?",
    code: `void show(int n) {
    n = n + 10;
}

int main() {
    int n = 5;
    show(n);
    cout << n;
}`,
    options: [
      { id: "a", text: "5" },
      { id: "b", text: "15", feedback: "show() gets a copy of n; changing the copy doesn't change main's n." },
      { id: "c", text: "10" },
      { id: "d", text: "It doesn't compile" },
    ],
    correct: "a",
    hints: [
      "Does show() change main's variable or its own copy?",
      "Parameters like `int n` receive a copy of the argument.",
      "Look at which n is printed.",
      "Pass-by-value: the function works on a copy.",
      "main's n never changes from 5.",
    ],
    explanation: "show receives a copy of n. Adding 10 to the copy leaves main's n at 5.",
  },
  // ── Arrays ──
  {
    id: "d-arr-index", type: "predict_output", conceptId: "arrays", difficulty: 2,
    skills: [{ id: "array_indexing" }], purposes: ["diagnostic"], probes: ["MC-ARRAY-01"],
    prompt: "What does this print?",
    code: `int a[4] = {7, 3, 9, 2};
cout << a[1];`,
    options: [
      { id: "a", text: "7", misconception: "MC-ARRAY-01", feedback: "Array indexes start at 0, so a[1] is the second element." },
      { id: "b", text: "3" },
      { id: "c", text: "9" },
      { id: "d", text: "2" },
    ],
    correct: "b",
    hints: [
      "What index does the first element have?",
      "C++ arrays count from 0.",
      "a[0] is 7. What comes next?",
      "a[1] is the second element.",
      "7 is a[0], 3 is a[1].",
    ],
    explanation: "Indexes start at 0: a[0] = 7, a[1] = 3.",
  },
  {
    id: "d-arr-loop", type: "complete_code", conceptId: "arrays", difficulty: 3,
    skills: [{ id: "array_traversal" }, { id: "array_indexing", weight: 0.5 }], purposes: ["diagnostic"], probes: ["MC-ARRAY-01"],
    prompt: "Fill in the blank so the loop prints every element of the 5-element array `a`.",
    code: `int a[5] = {4, 8, 15, 16, 23};
for (int i = 0; ____; i++) {
    cout << a[i] << " ";
}`,
    accepted: ["i < 5", "i <= 4", "5 > i", "4 >= i"],
    wrongAnswers: [
      { answer: "i <= 5", misconception: "MC-ARRAY-01", feedback: "That reaches a[5], which doesn't exist — the last index is 4." },
      { answer: "i < 4", feedback: "That stops before a[4], the last element." },
    ],
    hints: [
      "What is the index of the last element?",
      "With 5 elements, indexes go from 0 to …?",
      "The condition must be true for i = 4 and false for i = 5.",
      "The last index is size − 1.",
      "i < ___",
    ],
    explanation: "Indexes run 0..4, so the condition must allow i = 4 and stop at 5: `i < 5` (or `i <= 4`).",
  },
  // ── Strings ──
  {
    id: "d-str-basic", type: "predict_output", conceptId: "strings", difficulty: 3,
    skills: [{ id: "string_basics" }], purposes: ["diagnostic"], probes: ["MC-ARRAY-01"],
    prompt: "What does this print?",
    code: `string s = "loop";
cout << s.length() << s[0];`,
    options: [
      { id: "a", text: "4l" },
      { id: "b", text: "3l" },
      { id: "c", text: "4 l", misconception: "MC-IO-01" },
      { id: "d", text: "4o", misconception: "MC-ARRAY-01", feedback: "s[0] is the first character." },
    ],
    correct: "a",
    hints: [
      "How many characters are in \"loop\"?",
      "length() counts characters; [] picks one by index.",
      "Indexes in a string start at 0, like arrays.",
      "Nothing is printed between the two values.",
      "4 then the first character.",
    ],
    explanation: "\"loop\" has 4 characters, and s[0] is 'l'. With no space between them it prints 4l.",
  },
];
