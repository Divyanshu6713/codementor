import type { QuestionDef } from "../types";
import { LPR, PAR } from "./helpers";

/**
 * Practice banks: complexity, searching & sorting, recursion, data structures, algorithms and
 * projects. Verified with g++ by tests/question-bank.test.ts.
 */
export const DSA_QUESTIONS: QuestionDef[] = [
  // ── Complexity ────────────────────────────────────────────────────────────
  {
    id: "cx-nested", type: "mcq", conceptId: "complexity", difficulty: 2,
    skills: [{ id: "loop_complexity" }, { id: "big_o", weight: 0.5 }], purposes: LPR,
    prompt: "What is the time complexity of this code?",
    code: `for (int i = 0; i < n; i++)
    for (int j = 0; j < n; j++)
        total += a[i] * a[j];`,
    options: [
      { id: "a", text: "O(n²)" },
      { id: "b", text: "O(n)", feedback: "The inner loop runs n times for *each* of the n outer iterations." },
      { id: "c", text: "O(2n)" },
      { id: "d", text: "O(log n)" },
    ],
    correct: "a",
    hints: [
      "How many times does the innermost line run?",
      "The inner loop runs n times per outer iteration.",
      "There are n outer iterations.",
      "n × n.",
      "O(n²).",
    ],
    explanation: "The body runs n × n times, so the work grows like n²: O(n²).",
  },
  {
    id: "cx-halving", type: "mcq", conceptId: "complexity", difficulty: 3,
    skills: [{ id: "loop_complexity" }], purposes: LPR,
    prompt: "What is the time complexity of this loop?",
    code: `int steps = 0;
for (int i = n; i > 1; i /= 2)
    steps++;`,
    options: [
      { id: "a", text: "O(log n)" },
      { id: "b", text: "O(n)", feedback: "i is halved each time, not decreased by 1." },
      { id: "c", text: "O(n / 2)" },
      { id: "d", text: "O(1)" },
    ],
    correct: "a",
    hints: [
      "How does i change each time?",
      "It halves.",
      "How many halvings get from n down to 1?",
      "That's log₂ n.",
      "O(log n).",
    ],
    explanation: "Halving n repeatedly takes about log₂ n steps: O(log n).",
  },
  {
    id: "cx-count", type: "predict_output", conceptId: "complexity", difficulty: 3,
    skills: [{ id: "loop_complexity" }], purposes: LPR,
    prompt: "How many times does `ops++` run when n = 16? (This prints the count.)",
    code: `int n = 16, ops = 0;
for (int i = 1; i < n; i *= 2)
    for (int j = 0; j < n; j++)
        ops++;
cout << ops;`,
    options: [
      { id: "a", text: "64" },
      { id: "b", text: "256", feedback: "The outer loop doubles i, so it runs only log₂ 16 = 4 times." },
      { id: "c", text: "16" },
      { id: "d", text: "80" },
    ],
    correct: "a",
    hints: [
      "Which values does i take?",
      "1, 2, 4, 8 — then 16 stops it.",
      "That's 4 outer iterations.",
      "The inner loop runs 16 times each.",
      "4 × 16.",
    ],
    explanation: "The outer loop runs log₂ 16 = 4 times, the inner 16 times each: 64 — an O(n log n) pattern.",
  },
  {
    id: "cx-order", type: "mcq", conceptId: "complexity", difficulty: 2,
    skills: [{ id: "big_o" }], purposes: LPR,
    prompt: "For a large n, which is fastest to slowest?",
    options: [
      { id: "a", text: "O(1), O(log n), O(n), O(n log n), O(n²)" },
      { id: "b", text: "O(log n), O(1), O(n), O(n²), O(n log n)" },
      { id: "c", text: "O(1), O(n), O(log n), O(n log n), O(n²)", feedback: "log n grows much more slowly than n." },
      { id: "d", text: "O(n²), O(n log n), O(n), O(log n), O(1)", feedback: "That's slowest to fastest." },
    ],
    correct: "a",
    hints: [
      "Which doesn't grow at all?",
      "Constant time, O(1).",
      "log n grows very slowly — 20 for a million.",
      "n log n is a little more than n.",
      "n² is the biggest.",
    ],
    explanation: "Constant < logarithmic < linear < linearithmic < quadratic.",
  },
  {
    id: "cx-drop-constants", type: "mcq", conceptId: "complexity", difficulty: 2,
    skills: [{ id: "big_o" }], purposes: LPR,
    prompt: "A function does `3n + 100` steps. What is its Big-O?",
    options: [
      { id: "a", text: "O(n)" },
      { id: "b", text: "O(3n + 100)", feedback: "Big-O drops constant factors and smaller terms." },
      { id: "c", text: "O(100)" },
      { id: "d", text: "O(n²)" },
    ],
    correct: "a",
    hints: [
      "Big-O describes how the work *grows*.",
      "Constant factors like 3 don't change the shape.",
      "The +100 doesn't grow with n.",
      "Keep only the fastest-growing term, without its constant.",
      "O(n).",
    ],
    explanation: "Big-O keeps the dominant term without constant factors: 3n + 100 is O(n).",
  },
  {
    id: "cx-space", type: "mcq", conceptId: "complexity", difficulty: 3,
    skills: [{ id: "big_o" }, { id: "loop_complexity", weight: 0.5 }], purposes: LPR,
    prompt: "A function copies an n-element vector into a new vector and returns it. What extra space does it use?",
    options: [
      { id: "a", text: "O(n)" },
      { id: "b", text: "O(1)", feedback: "The new vector holds n elements." },
      { id: "c", text: "O(n²)" },
      { id: "d", text: "O(log n)" },
    ],
    correct: "a",
    hints: [
      "Space complexity counts the extra memory used.",
      "How big is the copy?",
      "It has n elements.",
      "That grows linearly with n.",
      "O(n).",
    ],
    explanation: "The copy needs n elements of new memory: O(n) extra space.",
  },

  // ── Searching & sorting ───────────────────────────────────────────────────
  {
    id: "ss-binary-steps", type: "predict_output", conceptId: "searching-sorting", difficulty: 2,
    skills: [{ id: "binary_search" }], purposes: LPR,
    prompt: "Binary search for 23 in this sorted array. Which middle values are checked? (The code prints them.)",
    code: `int a[] = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};
int lo = 0, hi = 9, target = 23;
while (lo <= hi) {
    int mid = (lo + hi) / 2;
    cout << a[mid] << " ";
    if (a[mid] == target) break;
    if (a[mid] < target) lo = mid + 1;
    else hi = mid - 1;
}`,
    options: [
      { id: "a", text: "16 56 23" },
      { id: "b", text: "16 38 23" },
      { id: "c", text: "2 5 8 12 16 23", feedback: "That's a linear search. Binary search starts in the middle." },
      { id: "d", text: "16 23" },
    ],
    correct: "a",
    hints: [
      "First mid = (0 + 9) / 2 = 4.",
      "a[4] = 16 < 23, so lo = 5.",
      "mid = (5 + 9) / 2 = 7 → a[7] = 56.",
      "56 > 23, so hi = 6. mid = (5 + 6) / 2 = 5.",
      "a[5] = 23. Found.",
    ],
    explanation: "mid = 4 (16) → go right; mid = 7 (56) → go left; mid = 5 (23) → found.",
  },
  {
    id: "ss-binary-precond", type: "mcq", conceptId: "searching-sorting", difficulty: 1,
    skills: [{ id: "binary_search" }], purposes: LPR,
    prompt: "What must be true about an array before you can binary search it?",
    options: [
      { id: "a", text: "It must be sorted" },
      { id: "b", text: "It must have an even number of elements", feedback: "Any size works." },
      { id: "c", text: "It must contain the target", feedback: "Binary search can report \"not found\"." },
      { id: "d", text: "It must have no duplicates" },
    ],
    correct: "a",
    hints: [
      "How does binary search decide which half to discard?",
      "By comparing with the middle element.",
      "\"Smaller than the middle → left half\" only works if…",
      "…everything is in order.",
      "Sorted.",
    ],
    explanation: "Binary search throws away half the range based on the middle element — that's only valid when the array is sorted.",
  },
  {
    id: "ss-bubble-pass", type: "predict_output", conceptId: "searching-sorting", difficulty: 3,
    skills: [{ id: "sorting_algos" }], purposes: LPR,
    prompt: "What does the array look like after ONE pass of bubble sort?",
    code: `int a[] = {5, 1, 4, 2, 8};
for (int j = 0; j < 4; j++)
    if (a[j] > a[j + 1]) { int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t; }
for (int x : a) cout << x << " ";`,
    options: [
      { id: "a", text: "1 4 2 5 8" },
      { id: "b", text: "1 2 4 5 8", feedback: "One pass only moves the largest value to the end." },
      { id: "c", text: "1 5 4 2 8" },
      { id: "d", text: "5 1 4 2 8" },
    ],
    correct: "a",
    hints: [
      "Compare neighbours left to right, swapping if out of order.",
      "5 > 1 → swap: 1 5 4 2 8.",
      "5 > 4 → swap: 1 4 5 2 8.",
      "5 > 2 → swap: 1 4 2 5 8. 5 < 8: no swap.",
      "The largest has bubbled to the end.",
    ],
    explanation: "One pass bubbles the largest value to the end: 1 4 2 5 8.",
  },
  {
    id: "ss-mid-bug", type: "identify_error", conceptId: "searching-sorting", difficulty: 4,
    skills: [{ id: "binary_search" }], purposes: LPR,
    prompt: "This binary search sometimes loops forever. Why?",
    code: `int lo = 0, hi = n - 1;
while (lo < hi) {
    int mid = (lo + hi) / 2;
    if (a[mid] < target) lo = mid;
    else hi = mid;
}`,
    options: [
      { id: "a", text: "`lo = mid` can leave lo unchanged (e.g. lo = 3, hi = 4 → mid = 3), so the range never shrinks; use `lo = mid + 1`" },
      { id: "b", text: "It should use `<=`" },
      { id: "c", text: "mid should be computed with doubles" },
      { id: "d", text: "hi should start at n" },
    ],
    correct: "a",
    hints: [
      "Each iteration must make the range smaller.",
      "Try lo = 3, hi = 4. What is mid?",
      "If a[mid] < target, what does lo become?",
      "Still 3 — nothing changed.",
      "a[mid] is too small, so mid itself can be excluded: lo = mid + 1.",
    ],
    explanation: "When hi = lo + 1, mid = lo; `lo = mid` doesn't move, so it loops forever. Since a[mid] < target, mid can't be the answer: `lo = mid + 1`.",
  },
  {
    id: "ss-sort-cmp", type: "complete_code", conceptId: "searching-sorting", difficulty: 3,
    skills: [{ id: "sorting_algos" }], purposes: LPR,
    prompt: "Fill in the comparator so words are sorted from shortest to longest.",
    code: `vector<string> w = {"banana", "fig", "apple"};
sort(w.begin(), w.end(), [](const string& a, const string& b) {
    return ____;
});`,
    accepted: ["a.size() < b.size()", "a.length() < b.length()", "b.size() > a.size()", "b.length() > a.length()"],
    wrongAnswers: [{ answer: "a.size() <= b.size()", feedback: "A comparator must be strict (<), not <=." }, { answer: "a < b", feedback: "That sorts alphabetically, not by length." }],
    hints: [
      "The comparator answers: should a come before b?",
      "Shorter words first.",
      "Compare their lengths.",
      "It must be a strict comparison.",
      "a.size() ___ b.size()",
    ],
    explanation: "Return true when a should come first: `a.size() < b.size()` — strict, as sort requires.",
  },
  {
    id: "ss-insertion", type: "mcq", conceptId: "searching-sorting", difficulty: 3,
    skills: [{ id: "sorting_algos" }], purposes: LPR,
    prompt: "Which sorting algorithm is very fast (nearly O(n)) on an array that's already almost sorted?",
    options: [
      { id: "a", text: "Insertion sort" },
      { id: "b", text: "Selection sort", feedback: "Selection sort always scans the whole unsorted part: O(n²) regardless." },
      { id: "c", text: "None — all simple sorts are always O(n²)" },
      { id: "d", text: "Bubble sort without an early exit", feedback: "Without stopping when no swaps happen, it still does every pass." },
    ],
    correct: "a",
    hints: [
      "How far does each element move in an almost-sorted array?",
      "Only a little.",
      "Which algorithm's work depends on how far elements move?",
      "It shifts each new element left only until it fits.",
      "Insertion sort.",
    ],
    explanation: "Insertion sort only shifts each element as far as it's out of place, so nearly sorted input takes close to O(n).",
  },
  {
    id: "ss-code-first", type: "write_code", conceptId: "searching-sorting", difficulty: 4,
    skills: [{ id: "binary_search" }], purposes: PAR,
    prompt: "Read `n`, then n sorted whole numbers (duplicates allowed), then a target. Using binary search, print the index of the **first** occurrence of the target, or -1 if it isn't there.",
    starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> a(n);
    for (auto& x : a) cin >> x;
    int target;
    cin >> target;
    // Binary search for the FIRST index holding target, or -1

    return 0;
}`,
    tests: [
      { label: "duplicates", input: "7\n1 3 3 3 5 8 9\n3\n", output: "1", visibility: "sample", category: "normal" },
      { label: "missing", input: "5\n1 2 4 5 6\n3\n", output: "-1", visibility: "visible", category: "edge" },
      { label: "first element", input: "4\n2 2 2 2\n2\n", output: "0", visibility: "hidden", category: "edge" },
      { label: "last element", input: "5\n1 2 3 4 9\n9\n", output: "4", visibility: "hidden", category: "boundary" },
      { label: "single", input: "1\n5\n4\n", output: "-1", visibility: "hidden", category: "boundary" },
    ],
    compare: "tokens",
    referenceSolution: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> a(n);
    for (auto& x : a) cin >> x;
    int target;
    cin >> target;
    int lo = 0, hi = n - 1, ans = -1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] == target) {
            ans = mid;
            hi = mid - 1;  // keep looking to the left
        } else if (a[mid] < target) {
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }
    cout << ans << endl;
    return 0;
}`,
    solutionWalkthrough: "A normal binary search stops at any match. To find the first one, remember the match and keep searching the left half (hi = mid - 1).",
    detectors: [],
    hints: [
      "A normal binary search might land on the middle 3, not the first.",
      "When you find the target, is that necessarily the first one?",
      "Record it, then keep searching to the left.",
      "On a match: ans = mid; hi = mid - 1.",
      "while (lo <= hi) {\n    int mid = lo + (hi - lo) / 2;\n    if (a[mid] == target) { ans = mid; hi = mid - 1; }\n    …\n}",
    ],
    explanation: "On a match, save it and continue in the left half.",
  },

  // ── Recursion ─────────────────────────────────────────────────────────────
  {
    id: "rc-fact", type: "predict_output", conceptId: "recursion", difficulty: 1,
    skills: [{ id: "base_case" }, { id: "recursive_trace", weight: 0.5 }], purposes: LPR,
    prompt: "What does this print?",
    code: `int f(int n) {
    if (n <= 1) return 1;
    return n * f(n - 1);
}

int main() {
    cout << f(5);
    return 0;
}`,
    options: [
      { id: "a", text: "120" },
      { id: "b", text: "15", feedback: "It multiplies, it doesn't add." },
      { id: "c", text: "24" },
      { id: "d", text: "It never stops" },
    ],
    correct: "a",
    hints: [
      "What does f(1) return?",
      "That's the base case: 1.",
      "f(2) = 2 × f(1).",
      "Keep building up to f(5).",
      "5 × 4 × 3 × 2 × 1.",
    ],
    explanation: "f is factorial: 5 × 4 × 3 × 2 × 1 = 120.",
  },
  {
    id: "rc-order", type: "predict_output", conceptId: "recursion", difficulty: 3,
    skills: [{ id: "recursive_trace" }], purposes: LPR,
    prompt: "What does this print?",
    code: `void show(int n) {
    if (n == 0) return;
    show(n - 1);
    cout << n << " ";
}

int main() {
    show(3);
    return 0;
}`,
    options: [
      { id: "a", text: "1 2 3" },
      { id: "b", text: "3 2 1", feedback: "The print happens *after* the recursive call returns." },
      { id: "c", text: "3" },
      { id: "d", text: "0 1 2 3" },
    ],
    correct: "a",
    hints: [
      "Does show(3) print before or after calling show(2)?",
      "After.",
      "So the deepest call prints first.",
      "show(1) prints 1, then show(2) prints 2…",
      "Printing on the way back up.",
    ],
    explanation: "Each call recurses first and prints on the way back, so the smallest is printed first: 1 2 3.",
  },
  {
    id: "rc-no-base", type: "identify_error", conceptId: "recursion", difficulty: 2,
    skills: [{ id: "base_case" }], purposes: LPR,
    prompt: "This crashes with a stack overflow. Why?",
    code: `int sumTo(int n) {
    return n + sumTo(n - 1);
}`,
    options: [
      { id: "a", text: "There's no base case, so it calls itself forever (n goes 3, 2, 1, 0, -1, …)" },
      { id: "b", text: "Recursion can't add numbers" },
      { id: "c", text: "It should call sumTo(n + 1)", feedback: "That would run away even faster." },
      { id: "d", text: "int is too small" },
    ],
    correct: "a",
    hints: [
      "When does this function stop calling itself?",
      "Never — every call makes another.",
      "Each call uses stack space.",
      "Eventually the stack runs out.",
      "Add `if (n == 0) return 0;`.",
    ],
    explanation: "Without a base case the calls never stop, and the call stack overflows. Add `if (n <= 0) return 0;`.",
  },
  {
    id: "rc-blank-base", type: "complete_code", conceptId: "recursion", difficulty: 2,
    skills: [{ id: "base_case" }], purposes: LPR,
    prompt: "Fill in the base case so `power(b, e)` computes b to the power e (e ≥ 0).",
    code: `int power(int b, int e) {
    if (e == 0) return ____;
    return b * power(b, e - 1);
}`,
    accepted: ["1"],
    wrongAnswers: [{ answer: "0", feedback: "Then every result would be 0. Anything to the power 0 is 1." }, { answer: "b", feedback: "b⁰ is 1, not b." }],
    hints: [
      "What is any number to the power 0?",
      "It's the identity for multiplication.",
      "Multiplying by it changes nothing.",
      "If it were 0, everything would become 0.",
      "1.",
    ],
    explanation: "b⁰ = 1, which also makes the multiplications above it work out.",
  },
  {
    id: "rc-fib-calls", type: "predict_output", conceptId: "recursion", difficulty: 4,
    skills: [{ id: "recursive_trace" }], purposes: LPR,
    prompt: "How many times is `fib` called in total for fib(5)? (The program counts.)",
    code: `int calls = 0;
int fib(int n) {
    calls++;
    if (n < 2) return n;
    return fib(n - 1) + fib(n - 2);
}

int main() {
    fib(5);
    cout << calls;
    return 0;
}`,
    options: [
      { id: "a", text: "15" },
      { id: "b", text: "5", feedback: "Each call (above the base case) makes two more calls." },
      { id: "c", text: "6" },
      { id: "d", text: "32" },
    ],
    correct: "a",
    hints: [
      "Let C(n) be the number of calls for fib(n).",
      "C(0) = C(1) = 1.",
      "C(n) = 1 + C(n − 1) + C(n − 2).",
      "C(2) = 3, C(3) = 5, C(4) = 9.",
      "C(5) = 1 + 9 + 5.",
    ],
    explanation: "Calls repeat the same subproblems: C(5) = 1 + C(4) + C(3) = 1 + 9 + 5 = 15. That repetition is why memoisation helps.",
  },
  {
    id: "rc-code-digits", type: "write_code", conceptId: "recursion", difficulty: 3,
    skills: [{ id: "base_case" }, { id: "recursive_trace" }], purposes: PAR,
    prompt: "Write a **recursive** function `int digitSum(int n)` that returns the sum of the digits of a non-negative n. Read n and print digitSum(n).",
    starterCode: `#include <iostream>
using namespace std;

// Write digitSum recursively here (no loops)

int main() {
    int n;
    cin >> n;
    // Print digitSum(n)

    return 0;
}`,
    tests: [
      { label: "4096", input: "4096\n", output: "19", visibility: "sample", category: "normal" },
      { label: "0", input: "0\n", output: "0", visibility: "visible", category: "boundary" },
      { label: "9", input: "9\n", output: "9", visibility: "hidden", category: "boundary" },
      { label: "999999", input: "999999\n", output: "54", visibility: "hidden", category: "normal" },
      { label: "100000", input: "100000\n", output: "1", visibility: "hidden", category: "edge" },
    ],
    compare: "tokens",
    referenceSolution: `#include <iostream>
using namespace std;

int digitSum(int n) {
    if (n < 10) return n;
    return n % 10 + digitSum(n / 10);
}

int main() {
    int n;
    cin >> n;
    cout << digitSum(n) << endl;
    return 0;
}`,
    solutionWalkthrough: "Base case: a single digit is its own sum. Otherwise the answer is the last digit (n % 10) plus the digit sum of the rest (n / 10).",
    detectors: [],
    hints: [
      "What's the simplest n you can answer straight away?",
      "A single digit: n < 10.",
      "How do you split n into its last digit and the rest?",
      "n % 10 and n / 10.",
      "return n % 10 + digitSum(n / 10);",
    ],
    explanation: "digitSum(n) = n % 10 + digitSum(n / 10), with n < 10 as the base case.",
  },

  // ── Data structures ───────────────────────────────────────────────────────
  {
    id: "ds-list-walk", type: "predict_output", conceptId: "data-structures", difficulty: 2,
    skills: [{ id: "linked_lists" }], purposes: LPR,
    prompt: "What does this print?",
    code: `struct Node { int val; Node* next; };

int main() {
    Node c{3, nullptr};
    Node b{2, &c};
    Node a{1, &b};
    int sum = 0;
    for (Node* p = &a; p != nullptr; p = p->next) sum = sum * 10 + p->val;
    cout << sum;
    return 0;
}`,
    options: [
      { id: "a", text: "123" },
      { id: "b", text: "321", feedback: "The walk starts at a (1) and follows next pointers." },
      { id: "c", text: "6" },
      { id: "d", text: "12" },
    ],
    correct: "a",
    hints: [
      "Which node does the walk start at?",
      "a, whose next is b, whose next is c.",
      "The loop stops when p is nullptr.",
      "sum builds a number digit by digit.",
      "1, then 12, then 123.",
    ],
    explanation: "The walk visits 1 → 2 → 3, building 123.",
  },
  {
    id: "ds-list-insert", type: "complete_code", conceptId: "data-structures", difficulty: 3,
    skills: [{ id: "linked_lists" }], purposes: LPR,
    prompt: "Fill in the blank to insert `n` at the front of the list.",
    code: `struct Node { int val; Node* next; };

void pushFront(Node*& head, Node* n) {
    n->next = ____;
    head = n;
}`,
    accepted: ["head"],
    wrongAnswers: [{ answer: "nullptr", feedback: "That would cut off the rest of the list." }, { answer: "head->next", feedback: "That skips the old first node." }],
    hints: [
      "After inserting, what should come right after n?",
      "The old first node.",
      "Which variable points to the old first node?",
      "Do it before head changes.",
      "n->next = ___;",
    ],
    explanation: "Point n at the old first node (`head`), then make n the new head.",
  },
  {
    id: "ds-bst-inorder", type: "predict_output", conceptId: "data-structures", difficulty: 3,
    skills: [{ id: "trees_bst" }], purposes: LPR,
    prompt: "Values are inserted into a BST in this order. What does the in-order traversal print?",
    code: `struct T { int v; T* l = nullptr; T* r = nullptr; T(int x) : v(x) {} };

T* insert(T* t, int x) {
    if (!t) return new T(x);
    if (x < t->v) t->l = insert(t->l, x);
    else t->r = insert(t->r, x);
    return t;
}
void inorder(T* t) {
    if (!t) return;
    inorder(t->l);
    cout << t->v << " ";
    inorder(t->r);
}

int main() {
    T* root = nullptr;
    for (int x : {50, 30, 70, 20, 40, 60}) root = insert(root, x);
    inorder(root);
    return 0;
}`,
    options: [
      { id: "a", text: "20 30 40 50 60 70" },
      { id: "b", text: "50 30 20 40 70 60", feedback: "That's pre-order (root first)." },
      { id: "c", text: "50 30 70 20 40 60", feedback: "That's insertion / level order." },
      { id: "d", text: "20 40 30 60 70 50", feedback: "That's post-order." },
    ],
    correct: "a",
    hints: [
      "In-order visits left subtree, node, right subtree.",
      "In a BST, everything left is smaller, right is larger.",
      "So in-order visits values in…",
      "…sorted order.",
      "Ascending.",
    ],
    explanation: "In-order traversal of a BST always prints the values in sorted order.",
  },
  {
    id: "ds-bst-height", type: "mcq", conceptId: "data-structures", difficulty: 3,
    skills: [{ id: "trees_bst" }], purposes: LPR,
    prompt: "You insert 1, 2, 3, 4, 5 (in that order) into a plain BST. What happens to search speed?",
    options: [
      { id: "a", text: "The tree becomes a chain, so search is O(n) instead of O(log n)" },
      { id: "b", text: "It stays O(log n) because BSTs are always balanced", feedback: "A plain BST doesn't rebalance itself." },
      { id: "c", text: "Search becomes O(1)" },
      { id: "d", text: "Sorted input can't be inserted into a BST" },
    ],
    correct: "a",
    hints: [
      "Where does 2 go relative to 1? 3 relative to 2?",
      "Always to the right.",
      "What shape does that make?",
      "A straight line — like a linked list.",
      "Height n means O(n) search.",
    ],
    explanation: "Sorted insertions make every node a right child: a chain of height n. Balanced trees (like std::set's red-black tree) avoid this.",
  },
  {
    id: "ds-heap", type: "predict_output", conceptId: "data-structures", difficulty: 2,
    skills: [{ id: "hash_heap" }], purposes: LPR,
    prompt: "What does this print?",
    code: `priority_queue<int> pq;
for (int x : {4, 9, 1, 7}) pq.push(x);
cout << pq.top() << " ";
pq.pop();
cout << pq.top() << " " << pq.size();`,
    options: [
      { id: "a", text: "9 7 3" },
      { id: "b", text: "4 9 3", feedback: "A priority_queue isn't first-in-first-out; top is the largest." },
      { id: "c", text: "1 4 3", feedback: "By default it's a max-heap: top is the largest." },
      { id: "d", text: "9 7 4" },
    ],
    correct: "a",
    hints: [
      "Which element is at the top of a priority_queue<int>?",
      "The largest (it's a max-heap by default).",
      "pop removes that one.",
      "What's the next largest?",
      "9, then 7, with 3 left.",
    ],
    explanation: "priority_queue is a max-heap: top is 9; after pop, 7; three elements remain.",
  },
  {
    id: "ds-min-heap", type: "complete_code", conceptId: "data-structures", difficulty: 3,
    skills: [{ id: "hash_heap" }], purposes: LPR,
    prompt: "Fill in the type so `pq.top()` is the *smallest* value.",
    code: `priority_queue<int, vector<int>, ____> pq;
pq.push(5); pq.push(2); pq.push(8);
cout << pq.top();`,
    accepted: ["greater<int>", "std::greater<int>", "greater<>"],
    wrongAnswers: [{ answer: "less<int>", feedback: "less<int> is the default — a max-heap." }],
    hints: [
      "The third template argument is the comparison.",
      "The default makes a max-heap.",
      "You want the opposite ordering.",
      "There's a standard function object for \">\".",
      "greater<___>",
    ],
    explanation: "`greater<int>` flips the ordering, turning priority_queue into a min-heap.",
  },
  {
    id: "ds-hash", type: "mcq", conceptId: "data-structures", difficulty: 2,
    skills: [{ id: "hash_heap" }], purposes: LPR,
    prompt: "Why might you choose `unordered_map` over `map`?",
    options: [
      { id: "a", text: "Average O(1) lookups instead of O(log n), when you don't need the keys in sorted order" },
      { id: "b", text: "It keeps keys sorted", feedback: "That's map. unordered_map has no order." },
      { id: "c", text: "It allows duplicate keys" },
      { id: "d", text: "It always uses less memory" },
    ],
    correct: "a",
    hints: [
      "How is unordered_map implemented?",
      "As a hash table.",
      "What does hashing give you on average?",
      "Constant-time lookup.",
      "But no ordering.",
    ],
    explanation: "unordered_map is a hash table: average O(1) operations, but iteration order is unspecified. map is a balanced tree: O(log n), sorted.",
  },
  {
    id: "ds-bfs", type: "predict_output", conceptId: "data-structures", difficulty: 3,
    skills: [{ id: "graphs" }], purposes: LPR,
    prompt: "What does this BFS from node 0 print?",
    code: `vector<vector<int>> adj = {{1, 2}, {3}, {3, 4}, {5}, {5}, {}};
vector<int> dist(6, -1);
queue<int> q;
q.push(0);
dist[0] = 0;
while (!q.empty()) {
    int u = q.front(); q.pop();
    for (int v : adj[u])
        if (dist[v] == -1) { dist[v] = dist[u] + 1; q.push(v); }
}
for (int d : dist) cout << d;`,
    options: [
      { id: "a", text: "011223" },
      { id: "b", text: "012345", feedback: "dist is the number of edges on the shortest path, not the node number." },
      { id: "c", text: "011233" },
      { id: "d", text: "011222" },
    ],
    correct: "a",
    hints: [
      "BFS finds shortest distances (in edges) from the start.",
      "0 → 1 and 0 → 2 are 1 edge.",
      "3 and 4 are reachable in 2 edges.",
      "5 is reachable from 3 or 4.",
      "dist: 0 1 1 2 2 3.",
    ],
    explanation: "BFS explores level by level: node 0 at 0, nodes 1–2 at 1, nodes 3–4 at 2, node 5 at 3.",
  },
  {
    id: "ds-dfs-visited", type: "identify_error", conceptId: "data-structures", difficulty: 3,
    skills: [{ id: "graphs" }], purposes: LPR,
    prompt: "This DFS crashes with a stack overflow on a graph with a cycle. Why?",
    code: `void dfs(int u, vector<vector<int>>& adj) {
    cout << u << " ";
    for (int v : adj[u]) dfs(v, adj);
}`,
    options: [
      { id: "a", text: "There's no visited check, so it goes round the cycle forever" },
      { id: "b", text: "DFS must use a queue", feedback: "BFS uses a queue; DFS uses recursion or a stack." },
      { id: "c", text: "adj should be passed by value" },
      { id: "d", text: "It should print after the loop" },
    ],
    correct: "a",
    hints: [
      "What happens with edges 0 → 1 → 0?",
      "dfs(0) calls dfs(1), which calls dfs(0)…",
      "Nothing remembers which nodes were already seen.",
      "Keep a visited array.",
      "Skip v if visited[v].",
    ],
    explanation: "Without marking visited nodes, DFS follows a cycle forever. Keep a `visited` array and skip already-seen nodes.",
  },
  {
    id: "ds-graph-repr", type: "mcq", conceptId: "data-structures", difficulty: 2,
    skills: [{ id: "graphs" }], purposes: LPR,
    prompt: "A road map has 100,000 towns, each connected to about 3 others. How should you store it?",
    options: [
      { id: "a", text: "An adjacency list: each town keeps a list of its neighbours" },
      { id: "b", text: "An adjacency matrix (100,000 × 100,000)", feedback: "That's 10 billion cells, almost all empty." },
      { id: "c", text: "One big string" },
      { id: "d", text: "A stack" },
    ],
    correct: "a",
    hints: [
      "How many possible pairs of towns are there?",
      "About 10¹⁰.",
      "How many roads actually exist?",
      "About 300,000.",
      "Store only the edges that exist.",
    ],
    explanation: "The graph is sparse, so an adjacency list (O(V + E) memory) beats a V × V matrix.",
  },
  {
    id: "ds-stack-vs-queue", type: "mcq", conceptId: "data-structures", difficulty: 2,
    skills: [{ id: "linked_lists" }, { id: "graphs", weight: 0.5 }], purposes: LPR,
    prompt: "Inserting at the front of a linked list vs a vector of n elements — which is true?",
    options: [
      { id: "a", text: "Linked list: O(1). Vector: O(n), because every element shifts" },
      { id: "b", text: "Both are O(1)" },
      { id: "c", text: "Linked list: O(n). Vector: O(1)" },
      { id: "d", text: "Both are O(n)" },
    ],
    correct: "a",
    hints: [
      "What has to move when you insert at the front of a vector?",
      "Every existing element shifts one place.",
      "What changes in a linked list?",
      "Just a couple of pointers.",
      "Constant vs linear.",
    ],
    explanation: "A linked list just relinks pointers (O(1)); a vector must shift all n elements (O(n)).",
  },
  {
    id: "ds-code-bfs", type: "write_code", conceptId: "data-structures", difficulty: 4,
    skills: [{ id: "graphs" }], purposes: PAR,
    prompt: "Read `n` (nodes 0..n−1) and `m`, then m undirected edges `u v`, then two nodes `s t`. Print the length (number of edges) of the shortest path from s to t, or -1 if t can't be reached.",
    starterCode: `#include <iostream>
#include <vector>
#include <queue>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;
    vector<vector<int>> adj(n);
    // Read the edges, then s and t, and print the shortest path length with BFS

    return 0;
}`,
    tests: [
      { label: "sample", input: "5 5\n0 1\n1 2\n2 3\n0 4\n4 3\n0 3\n", output: "2", visibility: "sample", category: "normal" },
      { label: "same node", input: "3 1\n0 1\n2 2\n", output: "0", visibility: "visible", category: "edge" },
      { label: "unreachable", input: "4 2\n0 1\n2 3\n0 3\n", output: "-1", visibility: "hidden", category: "edge" },
      { label: "chain", input: "6 5\n0 1\n1 2\n2 3\n3 4\n4 5\n5 0\n", output: "5", visibility: "hidden", category: "normal" },
    ],
    compare: "tokens",
    referenceSolution: `#include <iostream>
#include <vector>
#include <queue>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;
    vector<vector<int>> adj(n);
    for (int i = 0; i < m; i++) {
        int u, v;
        cin >> u >> v;
        adj[u].push_back(v);
        adj[v].push_back(u);
    }
    int s, t;
    cin >> s >> t;
    vector<int> dist(n, -1);
    queue<int> q;
    dist[s] = 0;
    q.push(s);
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        for (int v : adj[u]) {
            if (dist[v] == -1) {
                dist[v] = dist[u] + 1;
                q.push(v);
            }
        }
    }
    cout << dist[t] << endl;
    return 0;
}`,
    solutionWalkthrough: "Undirected edges go into both adjacency lists. BFS from s visits nodes in order of distance; dist starts at -1 so unreachable nodes keep -1 and visited nodes aren't revisited.",
    detectors: [],
    hints: [
      "Which search finds shortest paths when every edge counts as 1?",
      "BFS, with a queue.",
      "Undirected: add each edge in both directions.",
      "Use dist[] = -1 as \"not visited yet\".",
      "dist[s] = 0; q.push(s);\nwhile (!q.empty()) { u = front; for v in adj[u] if dist[v] == -1 … }",
    ],
    explanation: "Build adjacency lists both ways and BFS from s; dist[t] is the answer.",
  },

  // ── Algorithms ────────────────────────────────────────────────────────────
  {
    id: "al-prefix", type: "predict_output", conceptId: "algorithms", difficulty: 2,
    skills: [{ id: "two_pointers" }], purposes: LPR,
    prompt: "What does this print?",
    code: `int a[] = {3, 1, 4, 1, 5, 9};
int pre[7] = {0};
for (int i = 0; i < 6; i++) pre[i + 1] = pre[i] + a[i];
cout << pre[6] << " " << pre[5] - pre[2];`,
    options: [
      { id: "a", text: "23 10" },
      { id: "b", text: "23 14", feedback: "pre[5] − pre[2] is the sum of a[2..4]: 4 + 1 + 5." },
      { id: "c", text: "9 10" },
      { id: "d", text: "23 6" },
    ],
    correct: "a",
    hints: [
      "pre[k] is the sum of the first k elements.",
      "pre[6] is the sum of everything.",
      "pre[5] − pre[2] is the sum of elements with index 2, 3, 4.",
      "4 + 1 + 5.",
      "23 and 10.",
    ],
    explanation: "pre[6] = 23 (all elements). pre[5] − pre[2] = sum of a[2..4] = 10 — any range sum in O(1).",
  },
  {
    id: "al-two-sum", type: "predict_output", conceptId: "algorithms", difficulty: 3,
    skills: [{ id: "two_pointers" }], purposes: LPR,
    prompt: "Two pointers on a sorted array, looking for a pair that sums to 9. What does it print?",
    code: `int a[] = {1, 2, 4, 5, 7, 11};
int i = 0, j = 5, steps = 0;
while (i < j) {
    steps++;
    int s = a[i] + a[j];
    if (s == 9) break;
    if (s < 9) i++;
    else j--;
}
cout << a[i] << "+" << a[j] << " in " << steps;`,
    options: [
      { id: "a", text: "2+7 in 3" },
      { id: "b", text: "4+5 in 5", feedback: "The search stops at the first pair it finds." },
      { id: "c", text: "2+7 in 15", feedback: "Two pointers never tries every pair — that's the point." },
      { id: "d", text: "1+11 in 1" },
    ],
    correct: "a",
    hints: [
      "Start: 1 + 11 = 12. Too big — which pointer moves?",
      "Too big → move j left (to a smaller number).",
      "1 + 7 = 8. Too small → move i right.",
      "2 + 7 = 9. Found.",
      "Count the comparisons.",
    ],
    explanation: "12 (j--), 8 (i++), 9 — found 2 + 7 after 3 steps. Each step discards a candidate, so it's O(n).",
  },
  {
    id: "al-window", type: "predict_output", conceptId: "algorithms", difficulty: 3,
    skills: [{ id: "two_pointers" }], purposes: LPR,
    prompt: "What does this print? (Maximum sum of any 3 consecutive elements.)",
    code: `int a[] = {2, 1, 5, 1, 3, 2};
int k = 3, win = 0;
for (int i = 0; i < k; i++) win += a[i];
int best = win;
for (int i = k; i < 6; i++) {
    win += a[i] - a[i - k];
    if (win > best) best = win;
}
cout << best;`,
    options: [
      { id: "a", text: "9" },
      { id: "b", text: "8", feedback: "Check the window 5, 1, 3." },
      { id: "c", text: "14" },
      { id: "d", text: "6" },
    ],
    correct: "a",
    hints: [
      "First window: 2 + 1 + 5.",
      "Slide: add the new element, subtract the one that left.",
      "Windows: 8, 7, 9, 6.",
      "Keep the largest.",
      "9.",
    ],
    explanation: "Window sums are 8, 7, 9, 6 — each computed in O(1) by sliding. The best is 9.",
  },
  {
    id: "al-greedy-coins", type: "predict_output", conceptId: "algorithms", difficulty: 2,
    skills: [{ id: "greedy" }], purposes: LPR,
    prompt: "Greedy change-making with Indian coins. How many coins for 289?",
    code: `int coins[] = {100, 50, 20, 10, 5, 2, 1};
int amount = 289, used = 0;
for (int c : coins) {
    used += amount / c;
    amount %= c;
}
cout << used;`,
    options: [
      { id: "a", text: "8" },
      { id: "b", text: "7" },
      { id: "c", text: "289" },
      { id: "d", text: "10" },
    ],
    correct: "a",
    hints: [
      "Take as many of the largest coin as fit.",
      "289 = 2 × 100 + 89.",
      "89 = 50 + 20 + 10 + 5 + 2 + 2.",
      "Count them all.",
      "2 + 1 + 1 + 1 + 1 + 2.",
    ],
    explanation: "Greedy takes 100, 100, 50, 20, 10, 5, 2, 2 = 8 coins. For this coin system greedy is optimal.",
  },
  {
    id: "al-greedy-fail", type: "mcq", conceptId: "algorithms", difficulty: 4,
    skills: [{ id: "greedy" }, { id: "dynamic_programming", weight: 0.5 }], purposes: LPR,
    prompt: "Coins are {1, 3, 4}. For amount 6, greedy picks 4 + 1 + 1 (3 coins). What's the point?",
    options: [
      { id: "a", text: "Greedy isn't always optimal — 3 + 3 uses only 2 coins, so this needs DP" },
      { id: "b", text: "Greedy is optimal: 3 coins is the minimum", feedback: "3 + 3 = 6 with just 2 coins." },
      { id: "c", text: "Amount 6 can't be made with these coins" },
      { id: "d", text: "Greedy should start with the smallest coin" },
    ],
    correct: "a",
    hints: [
      "Can you make 6 with fewer than 3 coins?",
      "Try using 3s.",
      "3 + 3 = 6.",
      "So taking the largest coin first was a mistake here.",
      "Greedy needs proof; otherwise use DP.",
    ],
    explanation: "Greedy's locally best choice (4) leads to 3 coins, but 3 + 3 needs only 2. When greedy isn't provably correct, dynamic programming finds the optimum.",
  },
  {
    id: "al-dp-stairs", type: "predict_output", conceptId: "algorithms", difficulty: 3,
    skills: [{ id: "dynamic_programming" }], purposes: LPR,
    prompt: "Ways to climb 6 stairs taking 1 or 2 steps at a time. What does this print?",
    code: `int ways[7];
ways[0] = 1;
ways[1] = 1;
for (int i = 2; i <= 6; i++) ways[i] = ways[i - 1] + ways[i - 2];
cout << ways[6];`,
    options: [
      { id: "a", text: "13" },
      { id: "b", text: "8" },
      { id: "c", text: "12" },
      { id: "d", text: "64" },
    ],
    correct: "a",
    hints: [
      "To reach stair i, the last move was from i − 1 or i − 2.",
      "So ways[i] = ways[i − 1] + ways[i − 2].",
      "1, 1, 2, 3, 5, 8, …",
      "Fill the table up to 6.",
      "ways[6] = 8 + 5.",
    ],
    explanation: "The table fills 1, 1, 2, 3, 5, 8, 13 — each subproblem solved once, O(n).",
  },
  {
    id: "al-memo", type: "complete_code", conceptId: "algorithms", difficulty: 3,
    skills: [{ id: "dynamic_programming" }], purposes: LPR,
    prompt: "Fill in the blank so already-computed answers are reused (memoisation).",
    code: `long long memo[91];
bool known[91];

long long fib(int n) {
    if (n < 2) return n;
    if (known[n]) return ____;
    known[n] = true;
    return memo[n] = fib(n - 1) + fib(n - 2);
}`,
    accepted: ["memo[n]"],
    wrongAnswers: [{ answer: "fib(n)", feedback: "That would recurse forever. Return the stored answer." }, { answer: "n", feedback: "Return the stored result for n, not n itself." }],
    hints: [
      "If fib(n) was already computed, where is it stored?",
      "In the memo array.",
      "At which index?",
      "The same n.",
      "memo[___]",
    ],
    explanation: "Return the cached `memo[n]` instead of recomputing — that turns exponential recursion into O(n).",
  },
  {
    id: "al-backtrack", type: "predict_output", conceptId: "algorithms", difficulty: 4,
    skills: [{ id: "backtracking" }], purposes: LPR,
    prompt: "What does this print?",
    code: `string cur;
void gen(int n) {
    if ((int)cur.size() == n) { cout << cur << " "; return; }
    for (char c : {'a', 'b'}) {
        cur.push_back(c);
        gen(n);
        cur.pop_back();
    }
}

int main() {
    gen(2);
    return 0;
}`,
    options: [
      { id: "a", text: "aa ab ba bb" },
      { id: "b", text: "aa bb" },
      { id: "c", text: "ab ba" },
      { id: "d", text: "a b aa ab ba bb", feedback: "Only strings of length n are printed." },
    ],
    correct: "a",
    hints: [
      "Each level chooses one character, then recurses.",
      "pop_back undoes the choice before trying the next one.",
      "Strings are printed only at length 2.",
      "First choice 'a': then 'a' or 'b'.",
      "All 4 combinations in order.",
    ],
    explanation: "Choose, recurse, un-choose: it generates every length-2 string over {a, b} in order.",
  },
  {
    id: "al-backtrack-undo", type: "identify_error", conceptId: "algorithms", difficulty: 4,
    skills: [{ id: "backtracking" }], purposes: LPR,
    prompt: "This should print all subsets of {1, 2, 3}, but later subsets contain leftovers. What's missing?",
    code: `vector<int> cur;
void subsets(int i, vector<int>& a) {
    if (i == (int)a.size()) { print(cur); return; }
    subsets(i + 1, a);        // skip a[i]
    cur.push_back(a[i]);
    subsets(i + 1, a);        // take a[i]
}`,
    options: [
      { id: "a", text: "After \"take a[i]\" it never undoes the choice — it needs `cur.pop_back();`" },
      { id: "b", text: "The base case should be i == 0" },
      { id: "c", text: "It should skip after taking", feedback: "The order of skip/take doesn't matter — undoing does." },
      { id: "d", text: "cur should be passed by value" },
    ],
    correct: "a",
    hints: [
      "Backtracking = choose, explore, ...?",
      "…un-choose.",
      "After exploring with a[i], is a[i] removed?",
      "No — it stays in cur for the next branches.",
      "Add cur.pop_back() after the second call.",
    ],
    explanation: "Each choice must be undone after exploring it. Without `cur.pop_back()`, elements pile up across branches.",
  },
  {
    id: "al-bits", type: "predict_output", conceptId: "algorithms", difficulty: 3,
    skills: [{ id: "bits_math" }], purposes: LPR,
    prompt: "What does this print?",
    code: `int x = 12;              // binary 1100
cout << (x & 5) << " "     // 5 = 0101
     << (x | 3) << " "     // 3 = 0011
     << (x >> 2) << " "
     << (1 << 4);`,
    options: [
      { id: "a", text: "4 15 3 16" },
      { id: "b", text: "0 15 3 16" },
      { id: "c", text: "4 15 48 16", feedback: ">> shifts right (divides by 2 each step)." },
      { id: "d", text: "17 15 3 4" },
    ],
    correct: "a",
    hints: [
      "& keeps bits set in both: 1100 & 0101.",
      "That's 0100 = 4.",
      "| keeps bits set in either: 1100 | 0011 = 1111.",
      "x >> 2 divides by 4.",
      "1 << 4 = 16.",
    ],
    explanation: "1100 & 0101 = 0100 (4); 1100 | 0011 = 1111 (15); 12 >> 2 = 3; 1 << 4 = 16.",
  },
  {
    id: "al-gcd", type: "predict_output", conceptId: "algorithms", difficulty: 2,
    skills: [{ id: "bits_math" }], purposes: LPR,
    prompt: "What does this print?",
    code: `int g(int a, int b) {
    return b == 0 ? a : g(b, a % b);
}

int main() {
    cout << g(84, 36) << " " << 84 / g(84, 36) * 36;
    return 0;
}`,
    options: [
      { id: "a", text: "12 252" },
      { id: "b", text: "6 504" },
      { id: "c", text: "12 3024", feedback: "84 / 12 × 36 is the lcm: 7 × 36." },
      { id: "d", text: "4 756" },
    ],
    correct: "a",
    hints: [
      "Euclid: gcd(a, b) = gcd(b, a % b).",
      "gcd(84, 36) → gcd(36, 12) → gcd(12, 0).",
      "So the gcd is 12.",
      "lcm = a / gcd × b.",
      "84 / 12 = 7, 7 × 36.",
    ],
    explanation: "Euclid's algorithm gives gcd 12; the lcm is 84 / 12 × 36 = 252.",
  },
  {
    id: "al-power-of-two", type: "complete_code", conceptId: "algorithms", difficulty: 3,
    skills: [{ id: "bits_math" }], purposes: LPR,
    prompt: "Fill in the condition that is true exactly when a positive n is a power of two.",
    code: `int n = 64;
if (____) cout << "power of two";`,
    accepted: ["(n & (n - 1)) == 0", "!(n & (n - 1))", "(n & (n-1)) == 0", "__builtin_popcount(n) == 1"],
    wrongAnswers: [{ answer: "n % 2 == 0", feedback: "That's true for every even number, like 6." }, { answer: "n & (n - 1) == 0", feedback: "== binds tighter than &. Add parentheses: (n & (n - 1)) == 0." }],
    hints: [
      "A power of two has exactly one 1-bit.",
      "What does n − 1 look like in binary? (e.g. 1000 − 1 = 0111)",
      "So n & (n − 1) clears the lowest set bit.",
      "If that leaves 0, there was only one bit.",
      "(n & (n - 1)) == ___",
    ],
    explanation: "`n & (n - 1)` removes the lowest 1-bit; it's 0 only if n had a single 1-bit. Parenthesise because == binds tighter than &.",
  },
  {
    id: "al-xor", type: "predict_output", conceptId: "algorithms", difficulty: 3,
    skills: [{ id: "bits_math" }, { id: "two_pointers", weight: 0.5 }], purposes: LPR,
    prompt: "Every number appears twice except one. What does this print?",
    code: `int a[] = {4, 7, 2, 7, 4, 9, 2};
int x = 0;
for (int v : a) x ^= v;
cout << x;`,
    options: [
      { id: "a", text: "9" },
      { id: "b", text: "0", feedback: "Pairs cancel out (v ^ v = 0), but the unpaired value remains." },
      { id: "c", text: "35" },
      { id: "d", text: "7" },
    ],
    correct: "a",
    hints: [
      "What is v ^ v for any v?",
      "0 — equal bits cancel.",
      "What is 0 ^ v?",
      "v. And XOR's order doesn't matter.",
      "All pairs cancel, leaving the single one.",
    ],
    explanation: "XOR is commutative and v ^ v = 0, so every pair cancels and only the unpaired 9 remains — O(n) time, O(1) space.",
  },
  {
    id: "al-code-maxsub", type: "write_code", conceptId: "algorithms", difficulty: 4,
    skills: [{ id: "dynamic_programming" }, { id: "greedy", weight: 0.5 }], purposes: PAR,
    prompt: "Read `n` and then n whole numbers (some may be negative). Print the largest possible sum of a non-empty run of consecutive numbers.",
    starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<long long> a(n);
    for (auto& x : a) cin >> x;
    // Print the maximum sum of a contiguous, non-empty subarray

    return 0;
}`,
    tests: [
      { label: "classic", input: "9\n-2 1 -3 4 -1 2 1 -5 4\n", output: "6", visibility: "sample", category: "normal" },
      { label: "all negative", input: "3\n-5 -2 -8\n", output: "-2", visibility: "visible", category: "edge" },
      { label: "single", input: "1\n7\n", output: "7", visibility: "hidden", category: "boundary" },
      { label: "all positive", input: "4\n1 2 3 4\n", output: "10", visibility: "hidden", category: "normal" },
      { label: "big values", input: "3\n1000000000 1000000000 -1\n", output: "2000000000", visibility: "hidden", category: "edge" },
    ],
    compare: "tokens",
    referenceSolution: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<long long> a(n);
    for (auto& x : a) cin >> x;
    long long best = a[0], cur = a[0];
    for (int i = 1; i < n; i++) {
        cur = max(a[i], cur + a[i]);
        best = max(best, cur);
    }
    cout << best << endl;
    return 0;
}`,
    solutionWalkthrough: "Kadane's algorithm: the best run ending at i either extends the best run ending at i − 1 or starts fresh at a[i]. Track the best seen. Starting from a[0] (not 0) handles all-negative input.",
    detectors: [],
    hints: [
      "Think about the best run that *ends* at position i.",
      "It either continues the run ending at i − 1, or starts again at a[i].",
      "cur = max(a[i], cur + a[i]).",
      "Keep the best cur ever seen. Start both at a[0] so all-negative inputs work.",
      "for (int i = 1; i < n; i++) { cur = max(a[i], cur + a[i]); best = max(best, cur); }",
    ],
    explanation: "Kadane: cur = max(a[i], cur + a[i]); best = max(best, cur).",
  },
  {
    id: "al-dp-mcq", type: "mcq", conceptId: "algorithms", difficulty: 3,
    skills: [{ id: "dynamic_programming" }], purposes: LPR,
    prompt: "Which two properties make a problem a good fit for dynamic programming?",
    options: [
      { id: "a", text: "Overlapping subproblems and optimal substructure" },
      { id: "b", text: "Sorted input and no duplicates" },
      { id: "c", text: "A greedy choice that's always safe", feedback: "If greedy is always safe, you don't need DP." },
      { id: "d", text: "Small input and recursion" },
    ],
    correct: "a",
    hints: [
      "Why does memoisation help fib?",
      "The same subproblems are solved again and again.",
      "And the answer is built from answers to smaller problems.",
      "Those are the two properties.",
      "Overlapping + optimal substructure.",
    ],
    explanation: "DP works when subproblems repeat (so caching pays off) and an optimal answer is built from optimal answers to subproblems.",
  },

  // ── Projects ──────────────────────────────────────────────────────────────
  {
    id: "pj-split", type: "mcq", conceptId: "projects", difficulty: 2,
    skills: [{ id: "program_design" }], purposes: LPR,
    prompt: "Your 300-line main() handles a library: adding books, searching and printing reports. What's the best first refactor?",
    options: [
      { id: "a", text: "Move each task into its own well-named function (or a Library class) so main just reads commands and calls them" },
      { id: "b", text: "Put it all on fewer lines" },
      { id: "c", text: "Add more global variables so functions can share data", feedback: "Globals make code harder to follow and test." },
      { id: "d", text: "Rename the variables to single letters" },
    ],
    correct: "a",
    hints: [
      "What makes a big program easier to read and change?",
      "Small pieces with one job each.",
      "Each task (add, search, report) can be a function.",
      "Related data and functions can live in a class.",
      "main becomes a short command loop.",
    ],
    explanation: "Splitting by responsibility — functions or a class per concept — keeps each piece small and testable, and main becomes a simple dispatcher.",
  },
  {
    id: "pj-menu", type: "predict_output", conceptId: "projects", difficulty: 2,
    skills: [{ id: "input_handling" }], purposes: LPR,
    prompt: "A command loop reads these commands. What does it print?",
    code: `istringstream in("add 5\\nadd 7\\nshow\\nsub 2\\nshow\\nquit\\nadd 100\\n");
int balance = 0;
string cmd;
while (in >> cmd && cmd != "quit") {
    if (cmd == "add") { int x; in >> x; balance += x; }
    else if (cmd == "sub") { int x; in >> x; balance -= x; }
    else if (cmd == "show") cout << balance << " ";
}`,
    options: [
      { id: "a", text: "12 10" },
      { id: "b", text: "12 10 110", feedback: "The loop stops at quit, so add 100 never runs." },
      { id: "c", text: "5 12 10" },
      { id: "d", text: "12" },
    ],
    correct: "a",
    hints: [
      "Process the commands one at a time.",
      "add 5, add 7 → balance 12. show prints it.",
      "sub 2 → 10. show prints it.",
      "What happens at quit?",
      "The loop ends before add 100.",
    ],
    explanation: "Balance becomes 12 (printed), then 10 (printed). quit ends the loop.",
  },
  {
    id: "pj-validate", type: "complete_code", conceptId: "projects", difficulty: 3,
    skills: [{ id: "input_handling" }], purposes: LPR,
    prompt: "Fill in the condition so the loop keeps asking until the user enters a number from 1 to 5.",
    code: `int choice = 0;
istringstream cin("9 0 3");  // stands in for the keyboard
cin >> choice;
while (____) {
    cout << "Please enter 1-5: ";
    cin >> choice;
}`,
    accepted: ["choice < 1 || choice > 5", "!(choice >= 1 && choice <= 5)", "choice > 5 || choice < 1"],
    wrongAnswers: [{ answer: "choice < 1 && choice > 5", feedback: "No number is both below 1 and above 5." }, { answer: "choice >= 1 && choice <= 5", feedback: "That repeats while the choice is *valid*." }],
    hints: [
      "The loop should repeat while the choice is bad.",
      "When is a choice bad?",
      "Below 1 or above 5.",
      "\"or\" is ||.",
      "choice < 1 || choice > ___",
    ],
    explanation: "Keep asking while the choice is out of range: `choice < 1 || choice > 5`.",
  },
  {
    id: "pj-struct", type: "mcq", conceptId: "projects", difficulty: 2,
    skills: [{ id: "program_design" }], purposes: LPR,
    prompt: "A program keeps `vector<string> names; vector<int> marks; vector<int> rolls;` in sync. What's a better design?",
    options: [
      { id: "a", text: "A `struct Student { string name; int mark; int roll; };` and one `vector<Student>`" },
      { id: "b", text: "Three separate arrays instead of vectors" },
      { id: "c", text: "One long string holding everything" },
      { id: "d", text: "Nothing — parallel vectors are ideal", feedback: "They're easy to get out of sync, e.g. when sorting or deleting." },
    ],
    correct: "a",
    hints: [
      "What goes wrong if you sort only `marks`?",
      "Names and marks no longer line up.",
      "The three values describe one thing.",
      "Group them into a type.",
      "A struct per student.",
    ],
    explanation: "Grouping each student's data into a struct keeps it together when sorting, adding or removing.",
  },
  {
    id: "pj-dispatch-bug", type: "identify_error", conceptId: "projects", difficulty: 3,
    skills: [{ id: "input_handling" }, { id: "program_design", weight: 0.5 }], purposes: LPR,
    prompt: "After the user types a word instead of a number, this menu loops forever printing the menu. Why?",
    code: `int choice;
while (true) {
    cout << "1) Add 2) Quit: ";
    cin >> choice;
    if (choice == 2) break;
}`,
    options: [
      { id: "a", text: "cin fails on the word and stays failed; every later `cin >> choice` fails too. Check `if (!(cin >> choice))` and clear/ignore the bad input" },
      { id: "b", text: "while (true) is never allowed" },
      { id: "c", text: "choice should be a string" },
      { id: "d", text: "break doesn't work inside while" },
    ],
    correct: "a",
    hints: [
      "What happens to cin when it can't read an int?",
      "It goes into a fail state.",
      "Does the bad word get removed from the input?",
      "No — and a failed stream refuses all further reads.",
      "Detect the failure, then cin.clear() and skip the rest of the line.",
    ],
    explanation: "A failed read sets cin's fail state and leaves the bad text in the input. Check the read and recover with `cin.clear()` and `cin.ignore(...)` (or stop at end of input).",
  },
  {
    id: "pj-code-inventory", type: "write_code", conceptId: "projects", difficulty: 4,
    skills: [{ id: "program_design" }, { id: "input_handling" }], purposes: PAR,
    prompt: "Build a tiny inventory. Commands (one per line): `add NAME QTY` adds QTY to NAME's stock, `remove NAME QTY` removes QTY (print `not enough` and change nothing if there isn't enough), `stock NAME` prints the quantity (0 if unknown), `report` prints every item with stock above 0 as `NAME QTY`, one per line, in alphabetical order.",
    starterCode: `#include <iostream>
#include <map>
#include <string>
using namespace std;

int main() {
    string cmd;
    while (cin >> cmd) {
        // Handle add / remove / stock / report
    }
    return 0;
}`,
    tests: [
      { label: "sample", input: "add pen 10\nadd ink 3\nremove pen 4\nstock pen\nreport\n", output: "6\nink 3\npen 6", visibility: "sample", category: "normal" },
      { label: "not enough", input: "add cup 2\nremove cup 5\nstock cup\n", output: "not enough\n2", visibility: "visible", category: "edge" },
      { label: "unknown item", input: "stock bat\nremove bat 1\nreport\n", output: "0\nnot enough", visibility: "hidden", category: "edge" },
      { label: "sold out hidden from report", input: "add a 1\nadd b 2\nremove a 1\nreport\n", output: "b 2", visibility: "hidden", category: "edge" },
    ],
    compare: "lines",
    referenceSolution: `#include <iostream>
#include <map>
#include <string>
using namespace std;

class Inventory {
    map<string, int> stock;
public:
    void add(const string& name, int qty) { stock[name] += qty; }
    bool take(const string& name, int qty) {
        auto it = stock.find(name);
        if (it == stock.end() || it->second < qty) return false;
        it->second -= qty;
        return true;
    }
    int quantity(const string& name) const {
        auto it = stock.find(name);
        return it == stock.end() ? 0 : it->second;
    }
    void report() const {
        for (const auto& [name, qty] : stock)
            if (qty > 0) cout << name << " " << qty << endl;
    }
};

int main() {
    Inventory inv;
    string cmd, name;
    int qty;
    while (cin >> cmd) {
        if (cmd == "add") { cin >> name >> qty; inv.add(name, qty); }
        else if (cmd == "remove") { cin >> name >> qty; if (!inv.take(name, qty)) cout << "not enough" << endl; }
        else if (cmd == "stock") { cin >> name; cout << inv.quantity(name) << endl; }
        else if (cmd == "report") inv.report();
    }
    return 0;
}`,
    solutionWalkthrough: "A map gives alphabetical order for the report for free. Wrapping it in a class keeps the rules (no negative stock, unknown items count as 0) in one place; main only parses commands. Use find() rather than [] for lookups so checking an unknown item doesn't add it.",
    detectors: [],
    hints: [
      "Which container maps a name to a quantity and keeps names sorted?",
      "map<string, int>.",
      "Check stock before removing; don't change anything if it's not enough.",
      "Use find() for stock/remove so unknown names aren't inserted.",
      "report: loop over the map and print entries with qty > 0.",
    ],
    explanation: "A map<string,int> in a small class, with main dispatching the commands.",
  },
];
