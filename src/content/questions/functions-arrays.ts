import type { QuestionDef } from "../types";
import { LPR, PAR, starter } from "./helpers";

/** Practice banks: functions, arrays, strings and 2D arrays. Verified with g++ by tests/question-bank.test.ts. */
export const FUNCTIONS_ARRAYS_QUESTIONS: QuestionDef[] = [
  // ── Functions ─────────────────────────────────────────────────────────────
  {
    id: "fn-call", type: "predict_output", conceptId: "functions", difficulty: 1,
    skills: [{ id: "function_basics" }], purposes: LPR,
    prompt: "What does this print?",
    code: `void greet() {
    cout << "Hi ";
}

int main() {
    greet();
    greet();
    cout << "!";
    return 0;
}`,
    options: [
      { id: "a", text: "Hi Hi !" },
      { id: "b", text: "Hi !", feedback: "greet() is called twice." },
      { id: "c", text: "!" , feedback: "Calling a function runs its body."},
      { id: "d", text: "Hi Hi" },
    ],
    correct: "a",
    hints: [
      "What happens each time `greet();` runs?",
      "Calling a function runs its body, then comes back.",
      "How many calls are there?",
      "After the calls, main prints \"!\".",
      "Hi, Hi, then !.",
    ],
    explanation: "Each call runs the body once: two \"Hi \"s, then main prints \"!\".",
  },
  {
    id: "fn-return", type: "predict_output", conceptId: "functions", difficulty: 2,
    skills: [{ id: "function_params_return" }], purposes: LPR,
    prompt: "What does this print?",
    code: `int square(int x) {
    return x * x;
}

int main() {
    int a = square(3) + square(2);
    cout << a;
    return 0;
}`,
    options: [
      { id: "a", text: "13" },
      { id: "b", text: "25", feedback: "Each call is evaluated separately: 9 + 4." },
      { id: "c", text: "10" },
      { id: "d", text: "94" },
    ],
    correct: "a",
    hints: [
      "What value does square(3) give back?",
      "`return` sends a value back to where the call was.",
      "square(3) is 9, square(2) is 4.",
      "Then they're added like normal numbers.",
      "9 + 4.",
    ],
    explanation: "square(3) returns 9 and square(2) returns 4; their sum is 13.",
  },
  {
    id: "fn-by-value", type: "predict_output", conceptId: "functions", difficulty: 2,
    skills: [{ id: "pass_by_reference" }, { id: "function_params_return", weight: 0.5 }], purposes: LPR,
    prompt: "What does this print?",
    code: `void addTen(int n) {
    n = n + 10;
}

int main() {
    int score = 5;
    addTen(score);
    cout << score;
    return 0;
}`,
    options: [
      { id: "a", text: "5" },
      { id: "b", text: "15", feedback: "n is a copy of score. Changing the copy doesn't change score." },
      { id: "c", text: "10" },
      { id: "d", text: "It doesn't compile" },
    ],
    correct: "a",
    hints: [
      "Is n the same variable as score, or a copy?",
      "Without `&`, a parameter is a copy.",
      "addTen changes its own copy.",
      "score in main is untouched.",
      "To change score, use `int& n`.",
    ],
    explanation: "Parameters are passed by value: n is a copy. Changing it doesn't affect score. Use `int& n` to change the caller's variable.",
  },
  {
    id: "fn-by-ref", type: "predict_output", conceptId: "functions", difficulty: 3,
    skills: [{ id: "pass_by_reference" }], purposes: LPR,
    prompt: "What does this print?",
    code: `void swapIt(int& a, int& b) {
    int t = a;
    a = b;
    b = t;
}

int main() {
    int x = 1, y = 2;
    swapIt(x, y);
    cout << x << y;
    return 0;
}`,
    options: [
      { id: "a", text: "21" },
      { id: "b", text: "12", feedback: "`int&` makes a and b other names for x and y." },
      { id: "c", text: "22" },
      { id: "d", text: "11" },
    ],
    correct: "a",
    hints: [
      "What does the `&` in `int& a` mean?",
      "a is a reference: another name for x itself.",
      "Changing a changes x.",
      "The function swaps through a temporary.",
      "x and y end up swapped.",
    ],
    explanation: "a and b refer to x and y, so the swap changes the caller's variables: 21.",
  },
  {
    id: "fn-missing-return", type: "identify_error", conceptId: "functions", difficulty: 3,
    skills: [{ id: "function_params_return" }], purposes: LPR,
    prompt: "This compiles with a warning and sometimes prints garbage. What's wrong?",
    code: `int bigger(int a, int b) {
    if (a > b) {
        return a;
    }
}`,
    options: [
      { id: "a", text: "When a <= b, the function ends without returning a value" },
      { id: "b", text: "A function can't have two parameters", feedback: "Functions can take as many parameters as you need." },
      { id: "c", text: "`return` can't be inside an if", feedback: "It can — but every path must return." },
      { id: "d", text: "It should be `void`", feedback: "It's meant to give a number back, so int is right." },
    ],
    correct: "a",
    hints: [
      "Follow the code when a is 2 and b is 7.",
      "Which return statement runs?",
      "None — the function reaches its closing brace.",
      "A non-void function must return a value on every path.",
      "Add `return b;` after the if.",
    ],
    explanation: "If a <= b, no return runs. Falling off the end of a non-void function is undefined behaviour. Add `return b;`.",
  },
  {
    id: "fn-scope", type: "predict_output", conceptId: "functions", difficulty: 3,
    skills: [{ id: "scope_lifetime" }], purposes: LPR,
    prompt: "What does this print?",
    code: `int x = 1;

void f() {
    int x = 5;
    x++;
}

int main() {
    f();
    cout << x;
    return 0;
}`,
    options: [
      { id: "a", text: "1" },
      { id: "b", text: "6", feedback: "f has its own local x that hides the global one." },
      { id: "c", text: "2" },
      { id: "d", text: "5" },
    ],
    correct: "a",
    hints: [
      "How many variables called x are there?",
      "`int x = 5;` inside f declares a new, local x.",
      "f changes only its own x.",
      "main prints the global x.",
      "The global x was never changed.",
    ],
    explanation: "f declares its own local x (it shadows the global). The global x stays 1.",
  },
  {
    id: "fn-overload", type: "predict_output", conceptId: "functions", difficulty: 3,
    skills: [{ id: "scope_lifetime" }], purposes: LPR,
    prompt: "What does this print?",
    code: `void show(int n) { cout << "int "; }
void show(double d) { cout << "double "; }
void show(string s) { cout << "string "; }

int main() {
    show(3);
    show(3.0);
    show(string("3"));
    return 0;
}`,
    options: [
      { id: "a", text: "int double string" },
      { id: "b", text: "int int int", feedback: "Overloads are chosen by the argument's type." },
      { id: "c", text: "double double string" },
      { id: "d", text: "It doesn't compile: two functions can't share a name", feedback: "They can if their parameter lists differ — that's overloading." },
    ],
    correct: "a",
    hints: [
      "Three functions share the name show. How does C++ pick one?",
      "It looks at the type of the argument.",
      "3 is an int, 3.0 a double.",
      "string(\"3\") is a string.",
      "Each call picks its matching version.",
    ],
    explanation: "Overloaded functions are chosen by argument type: int, double, string.",
  },
  {
    id: "fn-default", type: "predict_output", conceptId: "functions", difficulty: 2,
    skills: [{ id: "function_params_return" }, { id: "scope_lifetime", weight: 0.5 }], purposes: LPR,
    prompt: "What does this print?",
    code: `int power(int base, int exp = 2) {
    int r = 1;
    for (int i = 0; i < exp; i++) r *= base;
    return r;
}

int main() {
    cout << power(5) << " " << power(2, 3);
    return 0;
}`,
    options: [
      { id: "a", text: "25 8" },
      { id: "b", text: "5 8", feedback: "When exp isn't given it defaults to 2." },
      { id: "c", text: "25 6" },
      { id: "d", text: "It doesn't compile" },
    ],
    correct: "a",
    hints: [
      "power(5) passes only one argument. What is exp?",
      "`int exp = 2` is a default value.",
      "5² = ?",
      "power(2, 3) passes exp explicitly.",
      "2³ = ?",
    ],
    explanation: "power(5) uses the default exp = 2: 25. power(2, 3) is 2³ = 8.",
  },
  {
    id: "fn-blank-return", type: "complete_code", conceptId: "functions", difficulty: 2,
    skills: [{ id: "function_params_return" }], purposes: LPR,
    prompt: "Fill in the blank so `isEven` gives back true for even numbers.",
    code: `bool isEven(int n) {
    ____ n % 2 == 0;
}`,
    accepted: ["return"],
    wrongAnswers: [{ answer: "cout <<", feedback: "Printing shows the value, but the caller can't use it. Return it." }, { answer: "bool", feedback: "That would declare a variable, not give a value back." }],
    hints: [
      "How does a function hand a value back to the caller?",
      "There's a keyword for it.",
      "It ends the function too.",
      "Printing isn't the same as giving back.",
      "r _ _ _ _ _",
    ],
    explanation: "`return n % 2 == 0;` sends the true/false result back to the caller.",
  },
  {
    id: "fn-blank-ref", type: "complete_code", conceptId: "functions", difficulty: 3,
    skills: [{ id: "pass_by_reference" }], purposes: LPR,
    prompt: "Fill in the parameter so `doubleIt(x)` really doubles the caller's x.",
    code: `void doubleIt(____) {
    v = v * 2;
}`,
    accepted: ["int& v", "int &v", "int & v"],
    wrongAnswers: [{ answer: "int v", feedback: "That's a copy — the caller's x wouldn't change." }, { answer: "int* v", feedback: "A pointer would need *v and the caller to pass &x. Use a reference." }],
    hints: [
      "Should v be a copy or the caller's variable itself?",
      "To change the caller's variable, pass by reference.",
      "References are written with one symbol after the type.",
      "The symbol is &.",
      "int& v",
    ],
    explanation: "`int& v` makes v refer to the caller's variable, so doubling v doubles x.",
  },
  {
    id: "fn-mcq-void", type: "mcq", conceptId: "functions", difficulty: 1,
    skills: [{ id: "function_basics" }], purposes: LPR,
    prompt: "What does `void` mean in `void printLine()`?",
    options: [
      { id: "a", text: "The function doesn't return a value" },
      { id: "b", text: "The function takes no parameters", feedback: "The empty () means no parameters. void is about the return value." },
      { id: "c", text: "The function is empty" },
      { id: "d", text: "The function can only be called once" },
    ],
    correct: "a",
    hints: [
      "Where does `void` appear — before the name or in the brackets?",
      "The word before the name is the return type.",
      "What would `int` there mean?",
      "void means \"nothing\".",
      "It returns nothing.",
    ],
    explanation: "The type before the name is what the function returns; `void` means it returns nothing.",
  },
  {
    id: "fn-code-max3", type: "write_code", conceptId: "functions", difficulty: 2,
    skills: [{ id: "function_basics" }, { id: "function_params_return" }], purposes: PAR,
    prompt: "Write a function `int maxOf3(int a, int b, int c)` that returns the largest of three numbers. In `main`, read three numbers and print `maxOf3` of them.",
    starterCode: `#include <iostream>
using namespace std;

// Write maxOf3 here

int main() {
    int a, b, c;
    cin >> a >> b >> c;
    // Print maxOf3(a, b, c)

    return 0;
}`,
    tests: [
      { label: "3 9 4", input: "3 9 4\n", output: "9", visibility: "sample", category: "normal" },
      { label: "largest last", input: "1 2 3\n", output: "3", visibility: "visible", category: "normal" },
      { label: "largest first", input: "8 2 3\n", output: "8", visibility: "hidden", category: "normal" },
      { label: "all equal", input: "5 5 5\n", output: "5", visibility: "hidden", category: "edge" },
      { label: "negatives", input: "-7 -2 -9\n", output: "-2", visibility: "hidden", category: "edge" },
    ],
    compare: "tokens",
    referenceSolution: `#include <iostream>
using namespace std;

int maxOf3(int a, int b, int c) {
    int m = a;
    if (b > m) m = b;
    if (c > m) m = c;
    return m;
}

int main() {
    int a, b, c;
    cin >> a >> b >> c;
    cout << maxOf3(a, b, c) << endl;
    return 0;
}`,
    solutionWalkthrough: "Keep a running maximum: start with a, replace it with b or c if they're bigger, and return it.",
    detectors: [],
    hints: [
      "What does the function need to give back?",
      "Start with \"the biggest so far is a\".",
      "Compare b, then c, with the biggest so far.",
      "Return the result; print it in main.",
      "int maxOf3(int a, int b, int c) {\n    int m = a;\n    if (b > m) m = b;\n    …\n    return m;\n}",
    ],
    explanation: "Track the largest so far and return it.",
  },
  {
    id: "fn-code-swap", type: "write_code", conceptId: "functions", difficulty: 3,
    skills: [{ id: "pass_by_reference" }, { id: "scope_lifetime", weight: 0.5 }], purposes: PAR,
    prompt: "Write `void sortTwo(int& a, int& b)` that rearranges a and b so that a <= b. In `main`, read two numbers, call it, and print them separated by a space.",
    starterCode: `#include <iostream>
using namespace std;

// Write sortTwo here

int main() {
    int a, b;
    cin >> a >> b;
    // Call sortTwo, then print a and b

    return 0;
}`,
    tests: [
      { label: "9 4", input: "9 4\n", output: "4 9", visibility: "sample", category: "normal" },
      { label: "already sorted", input: "1 2\n", output: "1 2", visibility: "visible", category: "normal" },
      { label: "equal", input: "3 3\n", output: "3 3", visibility: "hidden", category: "edge" },
      { label: "negatives", input: "0 -5\n", output: "-5 0", visibility: "hidden", category: "edge" },
    ],
    compare: "tokens",
    referenceSolution: `#include <iostream>
using namespace std;

void sortTwo(int& a, int& b) {
    if (a > b) {
        int t = a;
        a = b;
        b = t;
    }
}

int main() {
    int a, b;
    cin >> a >> b;
    sortTwo(a, b);
    cout << a << " " << b << endl;
    return 0;
}`,
    solutionWalkthrough: "Because the parameters are references, swapping them inside the function swaps main's variables. Only swap when a > b.",
    detectors: [],
    hints: [
      "When does anything need to change?",
      "Only when a > b.",
      "Swapping needs a temporary variable.",
      "The & in the parameters makes the swap visible in main.",
      "if (a > b) { int t = a; a = b; b = t; }",
    ],
    explanation: "Swap through references when a > b.",
  },

  // ── Arrays ────────────────────────────────────────────────────────────────
  {
    id: "arr-index", type: "predict_output", conceptId: "arrays", difficulty: 1,
    skills: [{ id: "array_indexing" }], purposes: LPR,
    prompt: "What does this print?",
    code: `int a[5] = {10, 20, 30, 40, 50};
cout << a[1] << " " << a[4];`,
    options: [
      { id: "a", text: "20 50" },
      { id: "b", text: "10 40", feedback: "Indexes start at 0, so a[1] is the second element." },
      { id: "c", text: "20 40" },
      { id: "d", text: "10 50" },
    ],
    correct: "a",
    hints: [
      "Which index does the first element have?",
      "Arrays start at index 0.",
      "a[0] = 10, so a[1] = ?",
      "The last of 5 elements is at index 4.",
      "Second element and fifth element.",
    ],
    explanation: "a[0] is 10, so a[1] is 20 and a[4] (the last) is 50.",
  },
  {
    id: "arr-init", type: "predict_output", conceptId: "arrays", difficulty: 2,
    skills: [{ id: "array_indexing" }], purposes: LPR,
    prompt: "What does this print?",
    code: `int a[5] = {7, 8};
cout << a[0] << " " << a[1] << " " << a[3];`,
    options: [
      { id: "a", text: "7 8 0" },
      { id: "b", text: "7 8 8", feedback: "Missing values aren't copied from the last one." },
      { id: "c", text: "7 8 and then a random number", feedback: "With a brace list, the missing elements are set to 0." },
      { id: "d", text: "It doesn't compile: 5 values are needed", feedback: "You may give fewer values than the size." },
    ],
    correct: "a",
    hints: [
      "How many values are listed, and how big is the array?",
      "Two values for five slots.",
      "What happens to the slots you didn't fill?",
      "With `= { … }`, the rest are set to zero.",
      "a[3] is one of the unfilled slots.",
    ],
    explanation: "With a brace initialiser, elements without a listed value are zero-initialised, so a[3] is 0.",
  },
  {
    id: "arr-sum-loop", type: "predict_output", conceptId: "arrays", difficulty: 2,
    skills: [{ id: "array_traversal" }], purposes: LPR,
    prompt: "What does this print?",
    code: `int a[] = {3, 1, 4, 1, 5};
int s = 0;
for (int i = 0; i < 5; i += 2) s += a[i];
cout << s;`,
    options: [
      { id: "a", text: "12" },
      { id: "b", text: "14", feedback: "i += 2 visits only indexes 0, 2, 4." },
      { id: "c", text: "2" },
      { id: "d", text: "9" },
    ],
    correct: "a",
    hints: [
      "Which indexes does i take?",
      "0, 2, 4.",
      "What are a[0], a[2], a[4]?",
      "Add them.",
      "3 + 4 + 5.",
    ],
    explanation: "i visits 0, 2, 4: 3 + 4 + 5 = 12.",
  },
  {
    id: "arr-oob", type: "identify_error", conceptId: "arrays", difficulty: 2,
    skills: [{ id: "array_indexing" }, { id: "array_traversal", weight: 0.5 }], purposes: LPR,
    prompt: "This sometimes prints a strange extra number or crashes. Why?",
    code: `int a[4] = {1, 2, 3, 4};
for (int i = 0; i <= 4; i++) {
    cout << a[i] << " ";
}`,
    options: [
      { id: "a", text: "`i <= 4` reaches a[4], which is past the end (valid indexes are 0–3)" },
      { id: "b", text: "Arrays can't be printed in a loop" },
      { id: "c", text: "i should start at 1", feedback: "Starting at 1 would skip a[0]." },
      { id: "d", text: "The array needs 5 values" },
    ],
    correct: "a",
    hints: [
      "What's the last valid index of a 4-element array?",
      "Indexes go from 0 to size − 1.",
      "What's the last i the loop uses?",
      "a[4] doesn't exist — it reads beyond the array.",
      "Use `i < 4`.",
    ],
    explanation: "A 4-element array has indexes 0–3. `i <= 4` reads a[4], out of bounds (undefined behaviour). Use `i < 4`.",
  },
  {
    id: "arr-max", type: "complete_code", conceptId: "arrays", difficulty: 3,
    skills: [{ id: "array_algorithms" }], purposes: LPR,
    prompt: "Fill in the starting value so `best` ends up as the largest element — even if every element is negative.",
    code: `int arr[5] = {-8, -3, -9, -4, -7};
int best = ____;
for (int i = 1; i < 5; i++)
    if (arr[i] > best) best = arr[i];
cout << best;`,
    accepted: ["arr[0]", "INT_MIN"],
    wrongAnswers: [{ answer: "0", feedback: "With all-negative values, 0 would wrongly stay the maximum." }, { answer: "arr[1]", feedback: "The loop starts at index 1, so start with the element before it." }],
    hints: [
      "What if every number is negative?",
      "Starting at 0 would beat all of them.",
      "Start with a value that's actually in the array.",
      "The loop starts at index 1 — which element hasn't been looked at?",
      "arr[___]",
    ],
    explanation: "Start with the first element, `arr[0]`, so the answer is always one of the values.",
  },
  {
    id: "arr-count", type: "predict_output", conceptId: "arrays", difficulty: 2,
    skills: [{ id: "array_algorithms" }, { id: "array_traversal", weight: 0.5 }], purposes: LPR,
    prompt: "What does this print?",
    code: `int a[] = {4, 7, 4, 2, 4, 9};
int target = 4, c = 0;
for (int x : a)
    if (x == target) c++;
cout << c;`,
    options: [
      { id: "a", text: "3" },
      { id: "b", text: "4", feedback: "c counts occurrences, it doesn't hold the value." },
      { id: "c", text: "1" },
      { id: "d", text: "12" },
    ],
    correct: "a",
    hints: [
      "What does `for (int x : a)` do?",
      "It visits each element in turn as x.",
      "c goes up by 1 each time x equals 4.",
      "How many 4s are there?",
      "Count them.",
    ],
    explanation: "The range-for visits every element; 4 appears 3 times.",
  },
  {
    id: "arr-func-size", type: "mcq", conceptId: "arrays", difficulty: 3,
    skills: [{ id: "array_algorithms" }], purposes: LPR,
    prompt: "Why do functions that take a C-style array usually also take its size, like `int sum(int a[], int n)`?",
    options: [
      { id: "a", text: "Inside the function, `a` is just a pointer — it doesn't know how many elements there are" },
      { id: "b", text: "C++ requires every function to have two parameters" },
      { id: "c", text: "So the function can make the array bigger", feedback: "C-style arrays have a fixed size." },
      { id: "d", text: "It's only a style choice; sizeof(a) works fine inside", feedback: "Inside the function sizeof(a) is the size of a pointer, not the array." },
    ],
    correct: "a",
    hints: [
      "What actually gets passed when you pass an array?",
      "Arrays decay to a pointer to their first element.",
      "Does a pointer carry a length?",
      "So the function needs to be told.",
      "That's what n is for.",
    ],
    explanation: "An array argument decays to a pointer to its first element, so the length is lost. Pass it separately (or use std::vector).",
  },
  {
    id: "arr-reverse", type: "predict_output", conceptId: "arrays", difficulty: 3,
    skills: [{ id: "array_traversal" }], purposes: LPR,
    prompt: "What does this print?",
    code: `int a[] = {1, 2, 3, 4, 5};
for (int i = 0, j = 4; i < j; i++, j--) {
    int t = a[i]; a[i] = a[j]; a[j] = t;
}
for (int x : a) cout << x;`,
    options: [
      { id: "a", text: "54321" },
      { id: "b", text: "12345", feedback: "The swaps happen while i < j, which reverses the array." },
      { id: "c", text: "52341" },
      { id: "d", text: "54345" },
    ],
    correct: "a",
    hints: [
      "Which pairs get swapped?",
      "(0,4), (1,3)…",
      "When i reaches 2, j is 2 — the loop stops.",
      "Swapping the outer pairs inwards reverses the order.",
      "The middle stays in place.",
    ],
    explanation: "Swapping pairs from both ends towards the middle reverses the array.",
  },
  {
    id: "arr-code-above-avg", type: "write_code", conceptId: "arrays", difficulty: 3,
    skills: [{ id: "array_traversal" }, { id: "array_algorithms" }], purposes: PAR,
    prompt: "Read `n` (1 ≤ n ≤ 100), then n whole numbers. Print how many of them are strictly greater than their average.",
    starterCode: starter("Read n numbers into an array, then count how many are above the average", "int n;\ncin >> n;"),
    tests: [
      { label: "1 2 3 4 5", input: "5\n1 2 3 4 5\n", output: "2", visibility: "sample", category: "normal" },
      { label: "all equal", input: "3\n7 7 7\n", output: "0", visibility: "visible", category: "edge" },
      { label: "one value", input: "1\n42\n", output: "0", visibility: "hidden", category: "boundary" },
      { label: "average is a fraction", input: "4\n1 2 2 2\n", output: "3", visibility: "hidden", category: "edge" },
      { label: "negatives", input: "4\n-10 -2 -3 5\n", output: "2", visibility: "hidden", category: "normal" },
    ],
    compare: "tokens",
    referenceSolution: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int a[100];
    long long sum = 0;
    for (int i = 0; i < n; i++) {
        cin >> a[i];
        sum += a[i];
    }
    int count = 0;
    for (int i = 0; i < n; i++) {
        // a[i] > sum / n, without losing the fraction
        if ((long long)a[i] * n > sum) count++;
    }
    cout << count << endl;
    return 0;
}`,
    solutionWalkthrough: "You need two passes: one to read and sum, a second to compare each value with the average. Compare `a[i] * n > sum` (or use a double average) so a fractional average isn't rounded down.",
    detectors: [],
    hints: [
      "Can you know the average before reading every number?",
      "Store the numbers, then loop over them again.",
      "The first loop reads and adds up; the second counts.",
      "Watch out: with ints, sum / n drops the fraction. Use a double or compare a[i] * n > sum.",
      "for (…) { cin >> a[i]; sum += a[i]; }\nfor (…) if (a[i] * n > sum) count++;",
    ],
    explanation: "Store the values, compute the sum, then count values with a[i] * n > sum.",
  },

  // ── Strings ───────────────────────────────────────────────────────────────
  {
    id: "st-length", type: "predict_output", conceptId: "strings", difficulty: 1,
    skills: [{ id: "string_basics" }], purposes: LPR,
    prompt: "What does this print?",
    code: `string s = "coding";
cout << s.length() << " " << s[0] << s[s.length() - 1];`,
    options: [
      { id: "a", text: "6 cg" },
      { id: "b", text: "6 c", feedback: "s[length − 1] is the last character, 'g'." },
      { id: "c", text: "5 cg" },
      { id: "d", text: "6 co" },
    ],
    correct: "a",
    hints: [
      "How many characters are in \"coding\"?",
      "length() counts characters.",
      "s[0] is the first character.",
      "The last character is at index length − 1.",
      "First and last letters.",
    ],
    explanation: "\"coding\" has 6 characters; s[0] is 'c' and s[5] is 'g'.",
  },
  {
    id: "st-concat", type: "predict_output", conceptId: "strings", difficulty: 2,
    skills: [{ id: "string_methods" }], purposes: LPR,
    prompt: "What does this print?",
    code: `string a = "ice", b = "cream";
string c = a + " " + b;
c += "!";
cout << c << " " << c.size();`,
    options: [
      { id: "a", text: "ice cream! 10" },
      { id: "b", text: "ice cream! 9", feedback: "Count the space and the ! too." },
      { id: "c", text: "icecream! 9" },
      { id: "d", text: "ice cream 9" },
    ],
    correct: "a",
    hints: [
      "What does + do with strings?",
      "It joins them.",
      "+= adds to the end.",
      "Count every character, including space and !.",
      "3 + 1 + 5 + 1.",
    ],
    explanation: "\"ice\" + \" \" + \"cream\" + \"!\" is \"ice cream!\", 10 characters.",
  },
  {
    id: "st-substr", type: "predict_output", conceptId: "strings", difficulty: 3,
    skills: [{ id: "string_methods" }], purposes: LPR,
    prompt: "What does this print?",
    code: `string s = "programming";
cout << s.substr(3, 4) << " " << s.find('g');`,
    options: [
      { id: "a", text: "gram 3" },
      { id: "b", text: "gramm 3", feedback: "substr(3, 4) takes 4 characters starting at index 3." },
      { id: "c", text: "ogra 3", feedback: "Indexes start at 0: index 3 is 'g'." },
      { id: "d", text: "gram 10", feedback: "find returns the *first* match." },
    ],
    correct: "a",
    hints: [
      "substr(pos, len): start where, take how many?",
      "Index 0 is 'p'. What is at index 3?",
      "Take 4 characters from there.",
      "find gives the index of the first match.",
      "The first 'g' is at index 3.",
    ],
    explanation: "Starting at index 3 ('g'), 4 characters give \"gram\". The first 'g' is at index 3.",
  },
  {
    id: "st-count-vowels", type: "predict_output", conceptId: "strings", difficulty: 2,
    skills: [{ id: "string_basics" }], purposes: LPR,
    prompt: "What does this print?",
    code: `string s = "Banana";
int v = 0;
for (char ch : s)
    if (ch == 'a' || ch == 'e' || ch == 'i' || ch == 'o' || ch == 'u') v++;
cout << v;`,
    options: [
      { id: "a", text: "3" },
      { id: "b", text: "4", feedback: "'B' isn't a vowel and there's no capital-letter check needed here." },
      { id: "c", text: "6" },
      { id: "d", text: "2" },
    ],
    correct: "a",
    hints: [
      "Which characters count?",
      "Only lowercase a, e, i, o, u.",
      "Go through B-a-n-a-n-a.",
      "Count the a's.",
      "There are three.",
    ],
    explanation: "The loop checks each character; \"Banana\" has three lowercase vowels (a, a, a).",
  },
  {
    id: "st-compare", type: "mcq", conceptId: "strings", difficulty: 3,
    skills: [{ id: "string_methods" }], purposes: LPR,
    prompt: "Which of these is true?",
    options: [
      { id: "a", text: "string(\"apple\") < string(\"banana\")" },
      { id: "b", text: "string(\"Zoo\") > string(\"apple\")", feedback: "Uppercase letters come before lowercase in character order, so \"Zoo\" < \"apple\"." },
      { id: "c", text: "string(\"10\") > string(\"9\")", feedback: "Strings compare character by character: '1' < '9'." },
      { id: "d", text: "string(\"cat\") == string(\"Cat\")", feedback: "Comparison is case-sensitive." },
    ],
    correct: "a",
    hints: [
      "How are strings compared?",
      "Character by character, like a dictionary.",
      "But it uses character codes: 'A'–'Z' come before 'a'–'z'.",
      "Digits are compared as characters, not numbers.",
      "Find the one that's true by dictionary order.",
    ],
    explanation: "Strings compare by character codes from the left. \"apple\" < \"banana\" because 'a' < 'b'. Uppercase sorts before lowercase, and \"10\" < \"9\".",
  },
  {
    id: "st-upper", type: "complete_code", conceptId: "strings", difficulty: 3,
    skills: [{ id: "string_methods" }], purposes: LPR,
    prompt: "Fill in the blank to turn every character of `s` into uppercase.",
    code: `string s = "hello";
for (char& c : s)
    c = ____;
cout << s;`,
    accepted: ["toupper(c)", "std::toupper(c)", "(char)toupper(c)", "char(toupper(c))"],
    wrongAnswers: [{ answer: "c - 32", feedback: "That works only for lowercase letters — toupper is safe for any character." }, { answer: "upper(c)", feedback: "The function is called toupper (from <cctype>)." }],
    hints: [
      "Is there a library function that uppercases one character?",
      "It's in <cctype>.",
      "Its name starts with \"to\".",
      "Because c is a reference (char&), assigning to it changes s.",
      "toupper(___)",
    ],
    explanation: "`c = toupper(c);` — since c is a reference, each character in s is changed.",
  },
  {
    id: "st-palin-bug", type: "identify_error", conceptId: "strings", difficulty: 3,
    skills: [{ id: "string_basics" }], purposes: LPR,
    prompt: "This palindrome check reads past the end of the string. Where's the bug?",
    code: `bool isPal(string s) {
    int n = s.length();
    for (int i = 0; i < n; i++)
        if (s[i] != s[n - i]) return false;
    return true;
}`,
    options: [
      { id: "a", text: "The mirror of index i is n - 1 - i, not n - i" },
      { id: "b", text: "The loop should start at 1", feedback: "Index 0 must be checked too." },
      { id: "c", text: "It should return true inside the loop" },
      { id: "d", text: "Strings can't be indexed with []" },
    ],
    correct: "a",
    hints: [
      "When i is 0, which index should it be compared with?",
      "The last character, at index n − 1.",
      "What does n - i give when i is 0?",
      "s[n] is one past the end.",
      "Use s[n - 1 - i].",
    ],
    explanation: "The character mirroring index i is at n − 1 − i. `s[n - i]` reads s[n] on the first pass, past the end.",
  },
  {
    id: "st-code-words", type: "write_code", conceptId: "strings", difficulty: 3,
    skills: [{ id: "string_basics" }, { id: "string_methods" }], purposes: PAR,
    prompt: "Read one word. Print `yes` if it's a palindrome (reads the same backwards, ignoring upper/lower case), otherwise `no`.",
    starterCode: starter("Read a word and print yes if it is a palindrome (ignore case)", "string w;\ncin >> w;", ["iostream", "string", "cctype"]),
    tests: [
      { label: "Level", input: "Level\n", output: "yes", visibility: "sample", category: "normal" },
      { label: "coder", input: "coder\n", output: "no", visibility: "sample", category: "normal" },
      { label: "single letter", input: "x\n", output: "yes", visibility: "hidden", category: "boundary" },
      { label: "even length", input: "abBA\n", output: "yes", visibility: "hidden", category: "edge" },
      { label: "almost", input: "abca\n", output: "no", visibility: "hidden", category: "edge" },
    ],
    compare: "tokens",
    referenceSolution: `#include <iostream>
#include <string>
#include <cctype>
using namespace std;

int main() {
    string w;
    cin >> w;
    int n = w.length();
    bool pal = true;
    for (int i = 0; i < n / 2; i++) {
        if (tolower(w[i]) != tolower(w[n - 1 - i])) pal = false;
    }
    cout << (pal ? "yes" : "no") << endl;
    return 0;
}`,
    solutionWalkthrough: "Compare character i with its mirror n − 1 − i for the first half of the word, lowercasing both so case doesn't matter.",
    detectors: [],
    hints: [
      "Which pairs of characters must match?",
      "The first and last, the second and second-last…",
      "The mirror of index i is n − 1 − i.",
      "Use tolower on both sides so 'L' matches 'l'.",
      "for (int i = 0; i < n / 2; i++)\n    if (tolower(w[i]) != tolower(w[n - 1 - i])) …",
    ],
    explanation: "Compare mirrored characters case-insensitively for the first half.",
  },

  // ── 2D arrays ─────────────────────────────────────────────────────────────
  {
    id: "md-index", type: "predict_output", conceptId: "2d-arrays", difficulty: 1,
    skills: [{ id: "matrix_indexing" }], purposes: LPR,
    prompt: "What does this print?",
    code: `int g[2][3] = {{1, 2, 3},
               {4, 5, 6}};
cout << g[1][0] << " " << g[0][2];`,
    options: [
      { id: "a", text: "4 3" },
      { id: "b", text: "2 3", feedback: "The first index is the row: g[1] is the second row." },
      { id: "c", text: "4 5" },
      { id: "d", text: "2 4" },
    ],
    correct: "a",
    hints: [
      "Which index is the row, which the column?",
      "g[row][column], counting from 0.",
      "g[1] is the second row: {4, 5, 6}.",
      "g[0][2] is the first row, third column.",
      "Row 1 col 0, row 0 col 2.",
    ],
    explanation: "g[1][0] is row 1, column 0 → 4. g[0][2] is row 0, column 2 → 3.",
  },
  {
    id: "md-rowsum", type: "predict_output", conceptId: "2d-arrays", difficulty: 2,
    skills: [{ id: "matrix_traversal" }], purposes: LPR,
    prompt: "What does this print?",
    code: `int g[3][3] = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
for (int r = 0; r < 3; r++) {
    int s = 0;
    for (int c = 0; c < 3; c++) s += g[r][c];
    cout << s << " ";
}`,
    options: [
      { id: "a", text: "6 15 24" },
      { id: "b", text: "12 15 18", feedback: "Those are column sums. The inner loop goes across a row." },
      { id: "c", text: "45" },
      { id: "d", text: "6 21 45", feedback: "s is reset to 0 for each row." },
    ],
    correct: "a",
    hints: [
      "Which loop changes the column?",
      "The inner loop moves across one row.",
      "s starts at 0 again for every row.",
      "Add each row: 1+2+3, …",
      "Three row totals.",
    ],
    explanation: "For each row, s is reset and the inner loop adds that row: 6, 15, 24.",
  },
  {
    id: "md-diagonal", type: "complete_code", conceptId: "2d-arrays", difficulty: 2,
    skills: [{ id: "matrix_indexing" }], purposes: LPR,
    prompt: "Fill in the blank to add up the main diagonal (top-left to bottom-right).",
    code: `int grid[3][3] = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
int d = 0;
for (int i = 0; i < 3; i++)
    d += ____;
cout << d;`,
    accepted: ["grid[i][i]"],
    wrongAnswers: [{ answer: "grid[i][2 - i]", feedback: "That's the other diagonal (top-right to bottom-left)." }, { answer: "grid[0][i]", feedback: "That walks along the first row." }],
    hints: [
      "Which cells are on the main diagonal?",
      "(0,0), (1,1), (2,2).",
      "What do the row and column have in common there?",
      "They're equal.",
      "grid[i][___]",
    ],
    explanation: "On the main diagonal row == column, so add `grid[i][i]`.",
  },
  {
    id: "md-transpose", type: "predict_output", conceptId: "2d-arrays", difficulty: 3,
    skills: [{ id: "matrix_traversal" }, { id: "matrix_indexing", weight: 0.5 }], purposes: LPR,
    prompt: "What does this print?",
    code: `int m[2][3] = {{1, 2, 3}, {4, 5, 6}};
for (int c = 0; c < 3; c++) {
    for (int r = 0; r < 2; r++) cout << m[r][c];
    cout << " ";
}`,
    options: [
      { id: "a", text: "14 25 36" },
      { id: "b", text: "123 456", feedback: "The outer loop is over columns here, so it reads down each column." },
      { id: "c", text: "12 34 56" },
      { id: "d", text: "41 52 63" },
    ],
    correct: "a",
    hints: [
      "Which loop is outside — rows or columns?",
      "Columns: for each column, go down the rows.",
      "Column 0 holds 1 and 4.",
      "So each group is one column read top to bottom.",
      "Three columns.",
    ],
    explanation: "With columns outside, each group reads one column top to bottom: 14, 25, 36 (the transpose).",
  },
  {
    id: "md-bounds", type: "identify_error", conceptId: "2d-arrays", difficulty: 3,
    skills: [{ id: "matrix_indexing" }], purposes: LPR,
    prompt: "This is meant to print a 3-row × 4-column grid but misbehaves. Why?",
    code: `int g[3][4] = {};
for (int r = 0; r < 4; r++)
    for (int c = 0; c < 3; c++)
        cout << g[r][c];`,
    options: [
      { id: "a", text: "The loop limits are swapped: r must go to 3 (rows) and c to 4 (columns)" },
      { id: "b", text: "2D arrays must be printed with one loop" },
      { id: "c", text: "`= {}` leaves the values uninitialised", feedback: "`= {}` sets every element to 0." },
      { id: "d", text: "c must be the outer loop" },
    ],
    correct: "a",
    hints: [
      "How many rows and columns does `int g[3][4]` have?",
      "3 rows, 4 columns.",
      "Which loop variable is used as the row index?",
      "r goes up to 3 — but row index 3 doesn't exist.",
      "Rows < 3, columns < 4.",
    ],
    explanation: "g has 3 rows and 4 columns. r < 4 reads row 3, which doesn't exist, and c < 3 skips the last column.",
  },
  {
    id: "md-code-borders", type: "write_code", conceptId: "2d-arrays", difficulty: 3,
    skills: [{ id: "matrix_traversal" }, { id: "matrix_indexing" }], purposes: PAR,
    prompt: "Read `r` and `c` (1 ≤ r, c ≤ 50), then an r × c grid of whole numbers. Print the sum of each column, separated by spaces.",
    starterCode: starter("Read the grid and print the sum of each column", "int r, c;\ncin >> r >> c;"),
    tests: [
      { label: "2 × 3", input: "2 3\n1 2 3\n4 5 6\n", output: "5 7 9", visibility: "sample", category: "normal" },
      { label: "1 × 1", input: "1 1\n7\n", output: "7", visibility: "visible", category: "boundary" },
      { label: "single column", input: "3 1\n1\n2\n3\n", output: "6", visibility: "hidden", category: "boundary" },
      { label: "negatives", input: "2 2\n-1 5\n1 -5\n", output: "0 0", visibility: "hidden", category: "edge" },
    ],
    compare: "tokens",
    referenceSolution: `#include <iostream>
using namespace std;

int main() {
    int r, c;
    cin >> r >> c;
    int g[50][50];
    for (int i = 0; i < r; i++)
        for (int j = 0; j < c; j++)
            cin >> g[i][j];
    for (int j = 0; j < c; j++) {
        int s = 0;
        for (int i = 0; i < r; i++) s += g[i][j];
        cout << s << (j + 1 < c ? " " : "\\n");
    }
    return 0;
}`,
    solutionWalkthrough: "Read row by row into g[i][j]. To sum columns, put the column loop outside and the row loop inside, resetting the sum for each column.",
    detectors: [],
    hints: [
      "First read everything into a 2D array.",
      "Reading: rows outside, columns inside.",
      "Summing a column means going *down* the rows.",
      "So for column sums, the column loop goes outside.",
      "for (int j = 0; j < c; j++) {\n    int s = 0;\n    for (int i = 0; i < r; i++) s += g[i][j];\n    …\n}",
    ],
    explanation: "Store the grid, then for each column add down the rows.",
  },
];
