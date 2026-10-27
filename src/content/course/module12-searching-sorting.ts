import type { CourseLesson } from "./types";

const r = String.raw;

/**
 * Module 12 — Searching and sorting, opening with time & space complexity so every later
 * algorithm can be compared by how its cost grows.
 */
export const SEARCH_SORT_LESSONS: CourseLesson[] = [
  {
    id: "complexity",
    moduleId: "searching-sorting",
    title: "Time and space complexity",
    minutes: 25,
    concepts: ["Big-O", "time complexity", "space complexity", "O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n^2)", "constraints"],
    goals: [
      "Describing how an algorithm's work grows with input size (Big-O)",
      "Recognising O(1), O(log n), O(n), O(n log n) and O(n²) from loop shapes",
      "Using input limits to predict whether a solution is fast enough",
    ],
    intro: `Two correct programs can differ enormously in speed. For 10 numbers, anything is fast. For 300 000 numbers, a program that compares every pair does about 45 **billion** comparisons — far too slow — while a smarter one does a few hundred thousand steps. **Complexity** is how we predict that difference before running anything.`,
    sections: [
      {
        title: "Counting steps, not seconds",
        body: `Seconds depend on the computer. Instead we ask: **if the input grows, how does the number of basic steps grow?**

\`\`\`cpp
for (int i = 0; i < n; i++) total += a[i];        // ~n steps        → O(n)

for (int i = 0; i < n; i++)
    for (int j = 0; j < n; j++) ...               // ~n × n steps    → O(n²)

for (int m = n; m > 1; m /= 2) ...                // halves each time → O(log n)
\`\`\`

Big-O keeps only the **fastest-growing** part and drops constants: \`3n + 10\` is O(n); \`n²/2 + n\` is O(n²).`,
      },
      {
        title: "The common classes",
        body: `| Big-O | name | example | n = 1 000 000 |
|---|---|---|---|
| O(1) | constant | read \`a[i]\` | 1 |
| O(log n) | logarithmic | binary search | ~20 |
| O(n) | linear | sum an array | 10⁶ |
| O(n log n) | linearithmic | \`std::sort\` | ~2·10⁷ |
| O(n²) | quadratic | compare every pair | 10¹² |

A typical judge does roughly **10⁸ simple steps per second**. So with n = 10⁵, O(n²) = 10¹⁰ steps is too slow, but O(n log n) is easy.`,
      },
      {
        title: "Space complexity",
        body: `Memory counts too. Summing an array uses O(1) **extra** space (one variable). Building a frequency table of size \`k\` uses O(k); copying the array uses O(n).

Often you can trade space for time: a 1000-entry counting array can replace a nested loop, turning O(n²) time into O(n) time with O(1000) extra space.`,
      },
    ],
    mistakes: [
      { title: "Thinking a fast computer fixes it", body: "A computer 10× faster only lets an O(n²) program handle about 3× larger input. A better algorithm usually beats better hardware." },
      { title: "Hidden loops", body: "`v.erase(v.begin())`, `s.find(...)` on a string or `count(...)` inside a loop are themselves O(n) — inside another loop they make O(n²)." },
      { title: "Ignoring the constraints", body: "The input limits tell you the target: n ≤ 20 allows exponential, n ≤ 5000 allows O(n²), n ≤ 10⁶ needs O(n) or O(n log n)." },
    ],
    example: {
      title: "Counting the steps",
      intro: "Three loop shapes, and how their step counts grow as n doubles.",
      code: r`#include <iostream>
using namespace std;

int main() {
    for (int n = 8; n <= 32; n *= 2) {
        long long linear = 0, nested = 0, halving = 0;
        for (int i = 0; i < n; i++) {
            linear++;
        }
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                nested++;
            }
        }
        for (int m = n; m > 1; m /= 2) {
            halving++;
        }
        cout << "n=" << n << ": linear " << linear << ", nested " << nested << ", halving " << halving << endl;
    }
    return 0;
}`,
      output: "n=8: linear 8, nested 64, halving 3\nn=16: linear 16, nested 256, halving 4\nn=32: linear 32, nested 1024, halving 5\n",
      notes: [
        { line: 7, text: "O(n): doubling n doubles the work." },
        { line: 10, text: "O(n²): doubling n makes four times the work." },
        { line: 15, text: "O(log n): doubling n adds just one more step." },
      ],
    },
    quickCheck: {
      prompt: "What is the time complexity of this code?",
      code: r`for (int i = 0; i < n; i++) {
    for (int j = i + 1; j < n; j++) {
        if (a[i] + a[j] == k) count++;
    }
}`,
      options: [
        { id: "a", text: "O(n)", feedback: "The inner loop also runs up to n times for each i." },
        { id: "b", text: "O(n log n)", feedback: "Nothing here halves; the inner loop shrinks by only 1 each time." },
        { id: "c", text: "O(n²)", feedback: "Right: about n²/2 pairs are checked, and Big-O drops the /2." },
      ],
      correct: "c",
      explanation: "The pairs (i, j) with i < j number n(n − 1)/2, which grows like n².",
    },
    exercise: {
      title: "Make it fast enough",
      prompt: `The program builds an array of \`n\` values with \`a[i] = (i * 37 + 11) % 1000\` (so every value is between 0 and 999), then counts the pairs \`i < j\` with \`a[i] + a[j] == k\`.

The starter code is **correct** but O(n²). The hidden tests use **n = 300 000** — about 45 billion pair checks — and the time limit is 2 seconds. Rewrite \`countPairs\` to run in O(n). Input: \`n k\`.`,
      starterCode: r`#include <iostream>
#include <vector>
using namespace std;

// Correct, but O(n^2): too slow for n = 300000.
long long countPairs(const vector<int>& a, int k) {
    long long count = 0;
    int n = a.size();
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (a[i] + a[j] == k) {
                count++;
            }
        }
    }
    return count;
}

int main() {
    int n, k;
    cin >> n >> k;
    vector<int> a(n);
    for (int i = 0; i < n; i++) {
        a[i] = (int)((i * 37LL + 11) % 1000);
    }
    cout << countPairs(a, k) << endl;
    return 0;
}`,
      tests: [
        { label: "n = 5, k = 133", input: "5 133\n", output: "2", visibility: "sample", category: "normal" },
        { label: "n = 6, k = 96", input: "6 96\n", output: "1", visibility: "sample", category: "normal" },
        { label: "no pairs possible", input: "10 1000\n", output: "0", visibility: "hidden", category: "edge" },
        { label: "single element", input: "1 22\n", output: "0", visibility: "hidden", category: "boundary" },
        { label: "n = 300000, k = 1000", input: "300000 1000\n", output: "44954850", visibility: "hidden", category: "boundary" },
        { label: "n = 300000, k = 1337", input: "300000 1337\n", output: "29790000", visibility: "hidden", category: "boundary" },
        { label: "n = 300000, k = 5", input: "300000 5\n", output: "270000", visibility: "hidden", category: "boundary" },
      ],
      compare: "tokens",
      hints: [
        "The values are all between 0 and 999. How could that small range help?",
        "Walk the array once. For each value `x`, the partners you need are the **earlier** values equal to `k - x`.",
        "Keep a counting array `seen[1000]` of how many times each value has appeared so far. Before adding `x`, add `seen[k - x]` to the answer (if `k - x` is between 0 and 999).",
        "`vector<long long> seen(1000, 0); for (int x : a) { int y = k - x; if (y >= 0 && y < 1000) count += seen[y]; seen[x]++; }` — O(n) time, O(1000) extra space.",
      ],
      solution: r`#include <iostream>
#include <vector>
using namespace std;

long long countPairs(const vector<int>& a, int k) {
    vector<long long> seen(1000, 0);
    long long count = 0;
    for (int x : a) {
        int y = k - x;
        if (y >= 0 && y < 1000) {
            count += seen[y];
        }
        seen[x]++;
    }
    return count;
}

int main() {
    int n, k;
    cin >> n >> k;
    vector<int> a(n);
    for (int i = 0; i < n; i++) {
        a[i] = (int)((i * 37LL + 11) % 1000);
    }
    cout << countPairs(a, k) << endl;
    return 0;
}`,
      solutionNotes: "Counting only *earlier* values as partners counts each pair `i < j` exactly once. One pass is O(n) — 300 000 steps instead of 45 billion — using a fixed 1000-entry table of extra memory: a classic time-for-space trade.",
    },
    explainAgain: `Imagine finding two students in a hall of 300 000 whose roll numbers add up to 1000. Asking every possible pair "do you two add up?" would take years. Instead, walk past each student once, and keep a tally board of numbers seen so far: for each new student, glance at the board for their partner number. One walk instead of billions of conversations — that's the difference between O(n²) and O(n).`,
    summary: [
      "Big-O describes how steps grow with input size, ignoring constants and smaller terms.",
      "Single loop O(n), nested loops O(n²), halving O(log n); `sort` is O(n log n).",
      "Around 10⁸ simple steps per second: use the constraints to choose an algorithm.",
    ],
  },

  {
    id: "binary-search",
    moduleId: "searching-sorting",
    title: "Binary search",
    minutes: 25,
    concepts: ["binary search", "sorted array", "lower_bound", "O(log n)", "invariant"],
    goals: [
      "Why a sorted array can be searched in O(log n) steps",
      "Writing binary search with `lo`, `hi` and `mid` without off-by-one errors",
      "Using `lower_bound` and `binary_search` from `<algorithm>`",
    ],
    intro: `Linear search checks elements one by one: O(n). If the array is **sorted**, you can do much better. Look at the middle: if the target is bigger, it can only be in the right half — so half the array is ruled out with a single comparison. Repeat, and a million elements take only about 20 steps.`,
    sections: [
      {
        title: "The algorithm",
        body: `\`\`\`cpp
int lo = 0, hi = n - 1;
while (lo <= hi) {
    int mid = lo + (hi - lo) / 2;
    if (a[mid] == target) return mid;
    if (a[mid] < target) lo = mid + 1;   // answer is to the right
    else hi = mid - 1;                   // answer is to the left
}
return -1;                               // range became empty
\`\`\`

The **invariant**: if the target is in the array, it's always within \`[lo, hi]\`. Each step shrinks that range by about half, so it takes O(log n) steps. \`lo + (hi - lo) / 2\` avoids overflowing \`int\` when \`lo + hi\` is huge.`,
      },
      {
        title: "Lower bound: the first element ≥ x",
        body: `Often the question isn't "is x there?" but "where would x go?" — the first position whose value is **at least** x. That's called the **lower bound**:

\`\`\`cpp
int lo = 0, hi = n;          // answer is in [0, n]; n means "none"
while (lo < hi) {
    int mid = lo + (hi - lo) / 2;
    if (a[mid] < x) lo = mid + 1;
    else hi = mid;           // mid might be the answer — keep it
}
// lo is the first index with a[lo] >= x (or n)
\`\`\`

The STL version is \`lower_bound(v.begin(), v.end(), x)\`, which returns an iterator; \`binary_search(v.begin(), v.end(), x)\` returns true/false.`,
      },
    ],
    mistakes: [
      { title: "Searching unsorted data", body: "Binary search only works on sorted data. On an unsorted array it can miss values that are there." },
      { title: "Infinite loop from the update", body: "With `while (lo < hi)` and `lo = mid` (instead of `mid + 1`), the range can stop shrinking. Make sure every branch moves a bound past `mid` or onto it in the version that's safe." },
      { title: "Mixing the two styles", body: "`hi = n - 1` with `while (lo <= hi)` and `hi = n` with `while (lo < hi)` are both fine — mixing them causes off-by-one errors." },
    ],
    example: {
      title: "Halving the search space",
      intro: "Binary search reports how many steps it needed, then the STL's lower_bound finds where 20 would go.",
      code: r`#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

int binarySearch(const vector<int>& a, int target, int& steps) {
    int lo = 0, hi = (int)a.size() - 1;
    steps = 0;
    while (lo <= hi) {
        steps++;
        int mid = lo + (hi - lo) / 2;
        if (a[mid] == target) {
            return mid;
        }
        if (a[mid] < target) {
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }
    return -1;
}

int main() {
    vector<int> a = {3, 8, 15, 21, 30, 42, 57};
    int targets[3] = {30, 5, 57};
    for (int t : targets) {
        int steps;
        int pos = binarySearch(a, t, steps);
        if (pos >= 0) {
            cout << t << " found at " << pos << " in " << steps << " steps" << endl;
        } else {
            cout << t << " not found (" << steps << " steps)" << endl;
        }
    }
    auto it = lower_bound(a.begin(), a.end(), 20);
    cout << "20 would go at index " << (it - a.begin()) << endl;
    return 0;
}`,
      output: "30 found at 4 in 3 steps\n5 not found (3 steps)\n57 found at 6 in 3 steps\n20 would go at index 3\n",
      notes: [
        { line: 11, text: "The middle of the current range, computed without overflow." },
        { line: 16, text: "Target is bigger: discard the left half including `mid`." },
        { line: 36, text: "`lower_bound`: the first element that is not less than 20 is 21, at index 3." },
      ],
    },
    quickCheck: {
      prompt: "About how many steps does binary search need for 1 000 000 sorted elements in the worst case?",
      options: [
        { id: "a", text: "About 20", feedback: "Right: 2²⁰ ≈ 1 000 000, so about 20 halvings empty the range." },
        { id: "b", text: "About 1 000", feedback: "That's √n — binary search halves the range, which is much faster." },
        { id: "c", text: "About 500 000", feedback: "That's the average for linear search." },
      ],
      correct: "a",
      explanation: "Each step halves the range: log₂(1 000 000) ≈ 20.",
    },
    exercise: {
      title: "First position at least x",
      prompt: `Complete \`int firstAtLeast(const vector<int>& a, int x)\`: return the **index of the first element ≥ x** in the sorted array \`a\`, or **-1** if every element is smaller. Write the binary search yourself (don't call \`lower_bound\`).

Input: \`n\`, then \`n\` sorted numbers (duplicates possible), then \`q\` and \`q\` queries. Print one answer per query.`,
      starterCode: r`#include <iostream>
#include <vector>
using namespace std;

int firstAtLeast(const vector<int>& a, int x) {
    // Binary search for the first index with a[i] >= x; -1 if there is none.
    return -1;
}

int main() {
    int n;
    cin >> n;
    vector<int> a(n);
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }
    int q;
    cin >> q;
    for (int i = 0; i < q; i++) {
        int x;
        cin >> x;
        cout << firstAtLeast(a, x) << endl;
    }
    return 0;
}`,
      tests: [
        { label: "basic queries", input: "5\n2 4 4 7 9\n4\n4 5 1 10\n", output: "1\n3\n0\n-1", visibility: "sample", category: "normal" },
        { label: "exact last and first", input: "5\n2 4 4 7 9\n2\n9 2\n", output: "4\n0", visibility: "hidden", category: "boundary" },
        { label: "between values", input: "5\n2 4 4 7 9\n2\n7 8\n", output: "3\n4", visibility: "hidden", category: "normal" },
        { label: "all equal", input: "4\n5 5 5 5\n3\n5 4 6\n", output: "0\n0\n-1", visibility: "hidden", category: "edge" },
        { label: "single element", input: "1\n3\n2\n3 4\n", output: "0\n-1", visibility: "hidden", category: "boundary" },
      ],
      compare: "tokens",
      hints: [
        "If `a[mid] < x`, can `mid` or anything to its left be the answer?",
        "No — so `lo = mid + 1`. If `a[mid] >= x`, `mid` might be the answer, so keep it: `hi = mid`.",
        "Search the range `[0, n]` with `while (lo < hi)`; when the loop ends, `lo` is the answer position — `n` means none.",
        "`int lo = 0, hi = a.size(); while (lo < hi) { int mid = lo + (hi - lo) / 2; if (a[mid] < x) lo = mid + 1; else hi = mid; } return lo == (int)a.size() ? -1 : lo;`",
      ],
      solution: r`#include <iostream>
#include <vector>
using namespace std;

int firstAtLeast(const vector<int>& a, int x) {
    int lo = 0, hi = (int)a.size();
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] < x) {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    return lo == (int)a.size() ? -1 : lo;
}

int main() {
    int n;
    cin >> n;
    vector<int> a(n);
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }
    int q;
    cin >> q;
    for (int i = 0; i < q; i++) {
        int x;
        cin >> x;
        cout << firstAtLeast(a, x) << endl;
    }
    return 0;
}`,
      solutionNotes: "The answer always stays inside `[lo, hi]`, and every step shrinks the range, so the loop ends with `lo == hi` at the first element ≥ x. With duplicates (`4 4`) it correctly returns the first one.",
    },
    explainAgain: `It's the guessing game "I'm thinking of a number from 1 to 100". Smart players never guess 1, 2, 3…: they guess 50, hear "higher", guess 75, and so on. Each guess throws away half the possibilities, so 7 guesses always suffice. Binary search plays that game with a sorted array.`,
    summary: [
      "Binary search on sorted data halves the range each step: O(log n).",
      "Keep an invariant (the answer is inside `[lo, hi]`) and make sure the range always shrinks.",
      "`lower_bound` finds the first element ≥ x; `binary_search` just answers yes/no.",
    ],
  },

  {
    id: "simple-sorts",
    moduleId: "searching-sorting",
    title: "Sorting: bubble, selection, insertion and std::sort",
    minutes: 30,
    concepts: ["bubble sort", "selection sort", "insertion sort", "stability", "std::sort", "comparator"],
    goals: [
      "How bubble, selection and insertion sort work, step by step",
      "Why they are O(n²) — and when insertion sort is still a good choice",
      "Sorting with `std::sort` and a custom comparator",
    ],
    intro: `Sorting is everywhere: rank lists, leaderboards in a contest, preparing data for binary search. Writing the classic simple sorts yourself trains your loop reasoning; in real programs you'll call \`std::sort\`, which is O(n log n).`,
    sections: [
      {
        title: "Bubble sort",
        body: `Sweep through the array swapping **neighbours** that are in the wrong order. After pass 1 the largest value has "bubbled" to the end; after pass 2 the second largest is in place, and so on. If a pass makes no swaps, the array is sorted and you can stop early.`,
      },
      {
        title: "Selection and insertion sort",
        body: `**Selection sort**: for each position \`i\`, find the smallest value in the unsorted part and swap it into position \`i\`.

**Insertion sort**: grow a sorted prefix. Take the next element (the "key"), shift larger elements in the prefix one place right, and drop the key into the gap — like sorting playing cards in your hand.

\`\`\`cpp
for (int i = 1; i < n; i++) {
    int key = a[i];
    int j = i - 1;
    while (j >= 0 && a[j] > key) {
        a[j + 1] = a[j];
        j--;
    }
    a[j + 1] = key;
}
\`\`\`

All three are O(n²) in the worst case. Insertion sort is O(n) on nearly sorted data, which is why real libraries use it for small pieces.`,
      },
      {
        title: "std::sort and comparators",
        body: `\`\`\`cpp
sort(v.begin(), v.end());                       // ascending, O(n log n)
sort(v.begin(), v.end(), [](int a, int b) {     // custom order
    return a > b;                               // "a comes before b?"
});
\`\`\`

The comparator answers "should \`a\` come before \`b\`?" and must be a strict \`<\`-style test (never \`>=\`). A **stable** sort keeps equal elements in their original order; \`std::sort\` doesn't promise that — use \`stable_sort\` when it matters.`,
      },
    ],
    mistakes: [
      { title: "Off-by-one in the inner loop", body: "In bubble sort, comparing `a[j]` with `a[j + 1]` needs `j < n - 1 - pass`; going to `j < n` reads past the end." },
      { title: "Using >= in a comparator", body: "A comparator must return false for equal elements. `return a >= b;` breaks `std::sort` (it can even crash)." },
      { title: "Swapping instead of shifting in insertion sort", body: "Insertion sort shifts elements right and writes the key once at the end. Forgetting to save `key` first overwrites it." },
    ],
    example: {
      title: "Bubble sort, pass by pass",
      intro: "Each pass is printed; the early exit kicks in once a pass makes no swaps.",
      code: r`#include <iostream>
using namespace std;

int main() {
    int a[5] = {5, 1, 4, 2, 8};
    int n = 5;
    for (int pass = 0; pass < n - 1; pass++) {
        bool swapped = false;
        for (int j = 0; j < n - 1 - pass; j++) {
            if (a[j] > a[j + 1]) {
                int t = a[j];
                a[j] = a[j + 1];
                a[j + 1] = t;
                swapped = true;
            }
        }
        cout << "pass " << pass + 1 << ":";
        for (int i = 0; i < n; i++) {
            cout << " " << a[i];
        }
        cout << endl;
        if (!swapped) {
            break;
        }
    }
    return 0;
}`,
      output: "pass 1: 1 4 2 5 8\npass 2: 1 2 4 5 8\npass 3: 1 2 4 5 8\n",
      notes: [
        { line: 9, text: "Each pass can stop one place earlier: the end is already sorted." },
        { line: 10, text: "Neighbours in the wrong order are swapped." },
        { line: 22, text: "Pass 3 made no swaps, so the array is sorted — stop early." },
      ],
    },
    quickCheck: {
      prompt: "Insertion sort on `4 3 2 1`: what does the array look like after the first two insertions (i = 1 and i = 2)?",
      options: [
        { id: "a", text: "3 4 2 1", feedback: "That's after only the first insertion." },
        { id: "b", text: "2 3 4 1", feedback: "Right: 3 is inserted before 4, then 2 before both." },
        { id: "c", text: "1 2 3 4", feedback: "The last element, 1, hasn't been inserted yet." },
      ],
      correct: "b",
      explanation: "i = 1 inserts 3 → 3 4 2 1; i = 2 inserts 2 → 2 3 4 1. The prefix `a[0..i]` is always sorted.",
    },
    exercise: {
      title: "Insertion sort, step by step",
      prompt: `Read \`n\` (2 ≤ n ≤ 100) and \`n\` numbers. Sort them with **insertion sort** and print the whole array (space-separated) **after each insertion** — that is, after processing \`i = 1, 2, …, n − 1\`. That's \`n − 1\` lines.

(Calling \`std::sort\` won't produce the intermediate lines — this exercise checks the algorithm itself.)`,
      starterCode: r`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int a[100];
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }
    // For i = 1 .. n-1: insert a[i] into the sorted prefix, then print the array.

    return 0;
}`,
      tests: [
        { label: "6 numbers", input: "6\n5 2 4 6 1 3\n", output: "2 5 4 6 1 3\n2 4 5 6 1 3\n2 4 5 6 1 3\n1 2 4 5 6 3\n1 2 3 4 5 6", visibility: "sample", category: "normal" },
        { label: "already sorted", input: "3\n1 2 3\n", output: "1 2 3\n1 2 3", visibility: "hidden", category: "edge" },
        { label: "reversed", input: "3\n3 2 1\n", output: "2 3 1\n1 2 3", visibility: "hidden", category: "boundary" },
        { label: "duplicates", input: "4\n7 3 7 1\n", output: "3 7 7 1\n3 7 7 1\n1 3 7 7", visibility: "hidden", category: "edge" },
        { label: "negatives", input: "5\n2 -5 0 -5 9\n", output: "-5 2 0 -5 9\n-5 0 2 -5 9\n-5 -5 0 2 9\n-5 -5 0 2 9", visibility: "hidden", category: "normal" },
      ],
      compare: "tokens",
      hints: [
        "At step `i`, which part of the array is already sorted?",
        "`a[0..i-1]` is sorted. Save `key = a[i]`, then make room for it by shifting bigger elements right.",
        "`int j = i - 1; while (j >= 0 && a[j] > key) { a[j + 1] = a[j]; j--; } a[j + 1] = key;`",
        "Put that inside `for (int i = 1; i < n; i++)`, and print the full array at the end of each iteration.",
      ],
      solution: r`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int a[100];
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }
    for (int i = 1; i < n; i++) {
        int key = a[i];
        int j = i - 1;
        while (j >= 0 && a[j] > key) {
            a[j + 1] = a[j];
            j--;
        }
        a[j + 1] = key;
        for (int t = 0; t < n; t++) {
            cout << a[t] << " ";
        }
        cout << endl;
    }
    return 0;
}`,
      solutionNotes: "Using `a[j] > key` (not `>=`) stops at equal elements, which keeps insertion sort stable — the two 7s never swap places. The shifting loop runs 0 times on sorted input, so the whole sort is O(n) there and O(n²) when reversed.",
    },
    explainAgain: `Insertion sort is how most people sort a hand of cards: pick up the next card and slide it left until it's in the right place among the cards you've already sorted. Bubble sort is like repeatedly walking down a line of people, swapping any neighbours who are out of height order, until a full walk needs no swaps.`,
    summary: [
      "Bubble, selection and insertion sort are O(n²); insertion sort is fast on nearly sorted data.",
      "In real code use `std::sort` (O(n log n)) — or `stable_sort` when equal items must keep their order.",
      "A comparator answers \"does a come before b?\" and must be strict (never `>=`).",
    ],
  },
];
