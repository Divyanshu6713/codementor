import type { CourseLesson } from "./types";
import { practice, starter, T } from "./practice/helpers";

const r = String.raw;

/** New lessons for Module 12 (searching and sorting). */
export const EXTRA_SORTING_LESSONS: CourseLesson[] = [
  {
    id: "merge-sort",
    moduleId: "searching-sorting",
    after: "simple-sorts",
    title: "Merge sort",
    minutes: 20,
    concepts: ["divide and conquer", "merge", "O(n log n)", "stable sort"],
    goals: [
      "Split, sort the halves recursively, and merge them",
      "Write the merge step with two indexes",
      "Explain why merge sort is O(n log n) and stable",
    ],
    intro: `Bubble, selection and insertion sort are O(n²): fine for 1 000 numbers, hopeless for 1 000 000. Merge sort is the first O(n log n) sort most people learn, and its key idea — **merging two sorted lists is easy** — shows up everywhere.`,
    sections: [
      {
        title: "The idea",
        body: `1. A list of 0 or 1 elements is already sorted.
2. Otherwise split it in half, sort each half (recursively).
3. **Merge** the two sorted halves: repeatedly take the smaller front element.

\`\`\`
[5 2 4 1]  →  [5 2] [4 1]  →  [5] [2] [4] [1]
           →  [2 5] [1 4]  →  [1 2 4 5]
\`\`\``,
      },
      {
        title: "The merge step",
        traceId: "merge-step",
        body: `\`\`\`cpp
// a[lo..mid) and a[mid..hi) are sorted
vector<int> tmp;
int i = lo, j = mid;
while (i < mid && j < hi) tmp.push_back(a[i] <= a[j] ? a[i++] : a[j++]);
while (i < mid) tmp.push_back(a[i++]);
while (j < hi)  tmp.push_back(a[j++]);
copy(tmp.begin(), tmp.end(), a.begin() + lo);
\`\`\`

Using \`<=\` (take from the left on ties) keeps equal elements in their original order: the sort is **stable**.`,
      },
      {
        title: "Why n log n",
        body: `Each level of splitting does O(n) merging work in total, and halving n repeatedly gives about log₂ n levels. For a million elements that's ~20 levels × 1 000 000 ≈ 20 million steps, versus ~10¹² for an O(n²) sort. The price: O(n) extra memory for the temporary arrays.`,
      },
    ],
    mistakes: [
      { title: "Wrong split for small ranges", body: "With half-open ranges [lo, hi), stop when hi − lo <= 1; otherwise a 1-element range recurses forever." },
      { title: "Forgetting the leftovers", body: "When one half runs out, copy the rest of the other half." },
      { title: "Using < in the merge", body: "Taking from the right on ties breaks stability." },
    ],
    example: {
      title: "Merge sort with a trace",
      intro: "Each merge prints the range it just finished.",
      code: r`#include <iostream>
#include <vector>
using namespace std;

void mergeSort(vector<int>& a, int lo, int hi) {
    if (hi - lo <= 1) return;
    int mid = (lo + hi) / 2;
    mergeSort(a, lo, mid);
    mergeSort(a, mid, hi);
    vector<int> tmp;
    int i = lo, j = mid;
    while (i < mid && j < hi) tmp.push_back(a[i] <= a[j] ? a[i++] : a[j++]);
    while (i < mid) tmp.push_back(a[i++]);
    while (j < hi) tmp.push_back(a[j++]);
    for (int k = 0; k < (int)tmp.size(); k++) a[lo + k] = tmp[k];
    cout << "merged [" << lo << "," << hi << "):";
    for (int k = lo; k < hi; k++) cout << " " << a[k];
    cout << endl;
}

int main() {
    vector<int> a = {5, 2, 4, 1};
    mergeSort(a, 0, a.size());
    return 0;
}`,
      output: "merged [0,2): 2 5\nmerged [2,4): 1 4\nmerged [0,4): 1 2 4 5\n",
      notes: [
        { line: 6, text: "Base case: zero or one element." },
        { line: 8, text: "Sort each half recursively." },
        { line: 12, text: "Take the smaller front; <= keeps it stable." },
        { line: 13, text: "Copy whatever is left over." },
      ],
    },
    quickCheck: {
      prompt: "Merging `[1 4 9]` and `[2 3 10]` — what are the first four values written?",
      options: [
        { id: "a", text: "1 2 3 4", feedback: "Yes: always take the smaller of the two front elements." },
        { id: "b", text: "1 4 9 2", feedback: "That just concatenates the lists." },
        { id: "c", text: "1 2 4 3", feedback: "After 2 is taken, the fronts are 4 and 3 — so 3 comes next." },
      ],
      correct: "a",
      explanation: "The merge compares the two front elements and takes the smaller each time.",
    },
    exercise: {
      title: "Implement merge sort",
      prompt: `Read \`n\` and n whole numbers (n up to 200 000 — an O(n²) sort is too slow). Sort them with your own merge sort (no \`std::sort\`) and print them space-separated.`,
      starterCode: r`#include <iostream>
#include <vector>
using namespace std;

// Write mergeSort(vector<long long>& a, vector<long long>& tmp, int lo, int hi) here

int main() {
    int n;
    cin >> n;
    vector<long long> a(n);
    for (auto& x : a) cin >> x;
    // sort a with merge sort and print it

    return 0;
}`,
      tests: [
        { label: "sample", input: "6\n5 2 9 1 5 6\n", output: "1 2 5 5 6 9", visibility: "sample", category: "normal" },
        { label: "single", input: "1\n42\n", output: "42", visibility: "hidden", category: "boundary" },
        { label: "reversed", input: "5\n5 4 3 2 1\n", output: "1 2 3 4 5", visibility: "hidden", category: "edge" },
        { label: "negatives", input: "4\n0 -7 3 -7\n", output: "-7 -7 0 3", visibility: "hidden", category: "edge" },
      ],
      compare: "tokens",
      hints: [
        "Base case: if hi − lo <= 1, return.",
        "mid = (lo + hi) / 2; sort [lo, mid) and [mid, hi).",
        "Merge into a shared temporary vector, then copy back.",
        "Allocating tmp once (size n) avoids a new vector per call.",
      ],
      solution: r`#include <iostream>
#include <vector>
using namespace std;

void mergeSort(vector<long long>& a, vector<long long>& tmp, int lo, int hi) {
    if (hi - lo <= 1) return;
    int mid = lo + (hi - lo) / 2;
    mergeSort(a, tmp, lo, mid);
    mergeSort(a, tmp, mid, hi);
    int i = lo, j = mid, k = lo;
    while (i < mid && j < hi) tmp[k++] = a[i] <= a[j] ? a[i++] : a[j++];
    while (i < mid) tmp[k++] = a[i++];
    while (j < hi) tmp[k++] = a[j++];
    for (int t = lo; t < hi; t++) a[t] = tmp[t];
}

int main() {
    int n;
    cin >> n;
    vector<long long> a(n), tmp(n);
    for (auto& x : a) cin >> x;
    mergeSort(a, tmp, 0, n);
    for (int i = 0; i < n; i++) cout << a[i] << (i + 1 < n ? " " : "\n");
    return 0;
}`,
      solutionNotes: "One shared buffer keeps memory at O(n) and avoids repeated allocation. The recursion depth is only about log₂ n.",
    },
    practice: practice(
      {
        title: "Merge two sorted lists",
        prompt: `Read two sorted lists: \`n\` then n numbers, \`m\` then m numbers. Print the merged sorted list in one O(n + m) pass (don't sort again). Print \`empty\` if both are empty.`,
        starterCode: starter("Merge the two sorted vectors with two indexes", "int n;\ncin >> n;\nvector<long long> a(n);\nfor (auto& x : a) cin >> x;\nint m;\ncin >> m;\nvector<long long> b(m);\nfor (auto& x : b) cin >> x;", ["iostream", "vector"]),
        tests: [
          T("sample", "3\n1 4 9\n3\n2 3 10\n", "1 2 3 4 9 10", "sample"),
          T("one empty", "0\n2\n5 6\n", "5 6", "visible", "edge"),
          T("both empty", "0\n0\n", "empty", "hidden", "edge"),
          T("duplicates", "2\n1 1\n2\n1 2\n", "1 1 1 2", "hidden"),
        ],
        compare: "tokens",
        hints: [
          "Two indexes i and j, starting at 0.",
          "While both have elements, output the smaller front.",
          "Then output the rest of whichever list remains.",
          "Collect into a vector so you can check for empty.",
        ],
        solution: r`#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<long long> a(n);
    for (auto& x : a) cin >> x;
    int m;
    cin >> m;
    vector<long long> b(m);
    for (auto& x : b) cin >> x;
    vector<long long> out;
    size_t i = 0, j = 0;
    while (i < a.size() && j < b.size()) out.push_back(a[i] <= b[j] ? a[i++] : b[j++]);
    while (i < a.size()) out.push_back(a[i++]);
    while (j < b.size()) out.push_back(b[j++]);
    if (out.empty()) cout << "empty";
    for (size_t k = 0; k < out.size(); k++) cout << (k ? " " : "") << out[k];
    cout << endl;
    return 0;
}`,
        solutionNotes: "This is the heart of merge sort on its own: each element is looked at once.",
      },
      {
        title: "Count inversions",
        prompt: `An **inversion** is a pair i < j with a[i] > a[j] — a measure of how unsorted a list is. Read \`n\` (up to 200 000) and the numbers; print the number of inversions. O(n²) is too slow: count them during merge sort — when you take an element from the right half, it's smaller than every element left in the left half.`,
        starterCode: starter("Merge sort that returns the inversion count (use long long)", "int n;\ncin >> n;\nvector<long long> a(n);\nfor (auto& x : a) cin >> x;", ["iostream", "vector"], "// long long sortCount(vector<long long>& a, vector<long long>& tmp, int lo, int hi)"),
        tests: [
          T("sample", "5\n2 4 1 3 5\n", "3", "sample"),
          T("sorted", "4\n1 2 3 4\n", "0", "visible", "edge"),
          T("reversed", "5\n5 4 3 2 1\n", "10", "hidden", "edge"),
          T("equal values", "3\n2 2 2\n", "0", "hidden", "edge"),
          T("mixed", "6\n3 1 2 6 5 4\n", "5", "hidden"),
        ],
        hints: [
          "Return inversions(left) + inversions(right) + inversions across the halves.",
          "During the merge, if a[j] (right) < a[i] (left), then a[j] is smaller than all of a[i..mid).",
          "So add mid − i when you take from the right.",
          "Take from the left on ties (<=) so equal values aren't counted.",
        ],
        solution: r`#include <iostream>
#include <vector>
using namespace std;

long long sortCount(vector<long long>& a, vector<long long>& tmp, int lo, int hi) {
    if (hi - lo <= 1) return 0;
    int mid = lo + (hi - lo) / 2;
    long long inv = sortCount(a, tmp, lo, mid) + sortCount(a, tmp, mid, hi);
    int i = lo, j = mid, k = lo;
    while (i < mid && j < hi) {
        if (a[i] <= a[j]) tmp[k++] = a[i++];
        else {
            inv += mid - i;
            tmp[k++] = a[j++];
        }
    }
    while (i < mid) tmp[k++] = a[i++];
    while (j < hi) tmp[k++] = a[j++];
    for (int t = lo; t < hi; t++) a[t] = tmp[t];
    return inv;
}

int main() {
    int n;
    cin >> n;
    vector<long long> a(n), tmp(n);
    for (auto& x : a) cin >> x;
    cout << sortCount(a, tmp, 0, n) << endl;
    return 0;
}`,
        solutionNotes: "Merge sort already compares every left/right pair implicitly; counting `mid − i` at the right moments turns that into an O(n log n) inversion counter. The count can reach ~2×10¹⁰, so it needs long long.",
      },
    ),
    explainAgain: `Imagine sorting a huge pile of exam papers with a friend. Split the pile, each of you sorts half (perhaps by splitting again), then you merge: look at the top paper of each sorted pile and keep taking the smaller one. Merging two sorted piles is quick, and halving keeps the number of rounds small.`,
    summary: [
      "Merge sort: split in half, sort each half recursively, merge.",
      "Merging takes the smaller front element; `<=` keeps it stable.",
      "O(n log n) time, O(n) extra memory.",
    ],
  },

  {
    id: "quicksort",
    moduleId: "searching-sorting",
    after: "merge-sort",
    title: "Quicksort",
    minutes: 20,
    concepts: ["partition", "pivot", "average O(n log n)", "worst case O(n²)"],
    goals: [
      "Partition an array around a pivot",
      "Sort recursively on each side of the pivot",
      "Know why the pivot choice matters",
    ],
    intro: `Quicksort is the other classic O(n log n) sort, and the ancestor of most library sorts. Instead of merging after recursion, it does the work *before*: it **partitions** the array so small values go left and big values go right, then sorts each side.`,
    sections: [
      {
        title: "Partition (Lomuto scheme)",
        body: `Pick a pivot (here: the last element). Walk through the range keeping a boundary \`i\`: everything before i is < pivot.

\`\`\`cpp
int partition(vector<int>& a, int lo, int hi) {   // inclusive range [lo, hi]
    int pivot = a[hi], i = lo;
    for (int j = lo; j < hi; j++)
        if (a[j] < pivot) swap(a[i++], a[j]);
    swap(a[i], a[hi]);                              // pivot to its final place
    return i;
}
\`\`\`

After partition, the pivot is exactly where it belongs in sorted order.`,
      },
      {
        title: "Recursion",
        body: `\`\`\`cpp
void quickSort(vector<int>& a, int lo, int hi) {
    if (lo >= hi) return;
    int p = partition(a, lo, hi);
    quickSort(a, lo, p - 1);
    quickSort(a, p + 1, hi);
}
\`\`\``,
      },
      {
        title: "Good and bad pivots",
        body: `If pivots split the range roughly in half, quicksort takes O(n log n). If the pivot is always the smallest or largest (e.g. last element of an already sorted array), every partition peels off just one element: **O(n²)**. Fixes: pick a random pivot, or the median of three. \`std::sort\` uses introsort — quicksort that switches to heapsort if it goes too deep — so it's O(n log n) guaranteed. Quicksort is in-place but **not stable**.`,
      },
    ],
    mistakes: [
      { title: "Including the pivot in a recursive call", body: "Recurse on [lo, p−1] and [p+1, hi]; including p can loop forever." },
      { title: "Always using the last element on sorted data", body: "That's the worst case. Randomise the pivot." },
      { title: "Expecting stability", body: "Partitioning swaps distant elements; equal keys can change order." },
    ],
    example: {
      title: "One partition step",
      intro: "The pivot (5) ends at index 3; everything left is smaller, everything right is larger or equal.",
      code: r`#include <iostream>
#include <vector>
#include <utility>
using namespace std;

int partitionLast(vector<int>& a, int lo, int hi) {
    int pivot = a[hi], i = lo;
    for (int j = lo; j < hi; j++)
        if (a[j] < pivot) swap(a[i++], a[j]);
    swap(a[i], a[hi]);
    return i;
}

int main() {
    vector<int> a = {7, 2, 9, 1, 8, 3, 5};
    int p = partitionLast(a, 0, a.size() - 1);
    cout << "pivot at " << p << ":";
    for (int x : a) cout << " " << x;
    cout << endl;
    return 0;
}`,
      output: "pivot at 3: 2 1 3 5 8 9 7\n",
      notes: [
        { line: 7, text: "The last element is the pivot." },
        { line: 9, text: "Smaller values are swapped into the growing left part." },
        { line: 10, text: "Finally the pivot moves just after the smaller values." },
      ],
    },
    quickCheck: {
      prompt: "Quicksort with the last element as pivot is given an array that is already sorted. What happens?",
      options: [
        { id: "a", text: "It degrades to O(n²)", feedback: "Right — every partition removes only the pivot." },
        { id: "b", text: "It finishes in O(n)", feedback: "It still partitions every level; there's no early exit." },
        { id: "c", text: "It stays O(n log n)", feedback: "Only with balanced splits, which this input never gives." },
      ],
      correct: "a",
      explanation: "Sorted input plus a last-element pivot gives the most unbalanced split possible each time.",
    },
    exercise: {
      title: "Implement quicksort",
      prompt: `Read \`n\` and n whole numbers. Sort them with your own quicksort (Lomuto partition) using the **middle** element as the pivot — swap it to the end first — so sorted inputs aren't the worst case. Print the sorted numbers.`,
      starterCode: r`#include <iostream>
#include <vector>
#include <utility>
using namespace std;

// Write partition and quickSort here

int main() {
    int n;
    cin >> n;
    vector<long long> a(n);
    for (auto& x : a) cin >> x;
    // quickSort(a, 0, n - 1) and print

    return 0;
}`,
      tests: [
        { label: "sample", input: "7\n7 2 9 1 8 3 5\n", output: "1 2 3 5 7 8 9", visibility: "sample", category: "normal" },
        { label: "sorted", input: "5\n1 2 3 4 5\n", output: "1 2 3 4 5", visibility: "hidden", category: "edge" },
        { label: "duplicates", input: "6\n3 3 1 3 2 1\n", output: "1 1 2 3 3 3", visibility: "hidden", category: "edge" },
        { label: "single", input: "1\n-4\n", output: "-4", visibility: "hidden", category: "boundary" },
      ],
      compare: "tokens",
      hints: [
        "In partition: swap(a[(lo + hi) / 2], a[hi]) first, then use a[hi] as the pivot.",
        "The loop moves values < pivot to the front.",
        "Return the pivot's final index p.",
        "quickSort(lo, p − 1) and quickSort(p + 1, hi); stop when lo >= hi.",
      ],
      solution: r`#include <iostream>
#include <vector>
#include <utility>
using namespace std;

int partitionMid(vector<long long>& a, int lo, int hi) {
    swap(a[lo + (hi - lo) / 2], a[hi]);
    long long pivot = a[hi];
    int i = lo;
    for (int j = lo; j < hi; j++)
        if (a[j] < pivot) swap(a[i++], a[j]);
    swap(a[i], a[hi]);
    return i;
}

void quickSort(vector<long long>& a, int lo, int hi) {
    if (lo >= hi) return;
    int p = partitionMid(a, lo, hi);
    quickSort(a, lo, p - 1);
    quickSort(a, p + 1, hi);
}

int main() {
    int n;
    cin >> n;
    vector<long long> a(n);
    for (auto& x : a) cin >> x;
    quickSort(a, 0, n - 1);
    for (int i = 0; i < n; i++) cout << a[i] << (i + 1 < n ? " " : "\n");
    return 0;
}`,
      solutionNotes: "The middle element of a sorted range is its median, so sorted and reverse-sorted inputs now split evenly. (Many equal values can still be slow with Lomuto; three-way partitioning fixes that.)",
    },
    practice: practice(
      {
        title: "Partition around a value",
        prompt: `Read \`n\`, the numbers and a value \`x\`. Rearrange in place (one pass, swaps only) so all numbers < x come first, keeping the **Lomuto** order your loop produces, then print the array and the count of numbers < x.`,
        starterCode: starter("One Lomuto-style pass: swap each a[j] < x into position i", "int n;\ncin >> n;\nvector<long long> a(n);\nfor (auto& v : a) cin >> v;\nlong long x;\ncin >> x;", ["iostream", "vector", "utility"]),
        tests: [
          T("sample", "6\n7 2 9 1 8 3\n5\n", "2 1 3 7 8 9\n3", "sample"),
          T("none smaller", "3\n5 6 7\n5\n", "5 6 7\n0", "visible", "edge"),
          T("all smaller", "3\n3 1 2\n9\n", "3 1 2\n3", "hidden", "edge"),
        ],
        compare: "lines",
        hints: [
          "i starts at 0.",
          "For each j: if a[j] < x, swap(a[i], a[j]) and i++.",
          "At the end, i is the count of smaller values.",
          "Print the array on one line and i on the next.",
        ],
        solution: r`#include <iostream>
#include <vector>
#include <utility>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<long long> a(n);
    for (auto& v : a) cin >> v;
    long long x;
    cin >> x;
    int i = 0;
    for (int j = 0; j < n; j++)
        if (a[j] < x) swap(a[i++], a[j]);
    for (int k = 0; k < n; k++) cout << a[k] << (k + 1 < n ? " " : "\n");
    cout << i << endl;
    return 0;
}`,
        solutionNotes: "Partitioning is useful on its own: splitting passed/failed students, or evens/odds, in O(n) with no extra memory.",
      },
      {
        title: "Quickselect: the k-th smallest",
        prompt: `Read \`n\`, the numbers and \`k\` (1-based). Print the k-th smallest number **without fully sorting**: partition, then recurse only into the side that contains position k − 1. Average O(n).`,
        starterCode: starter("Partition repeatedly, keeping only the side that holds index k-1", "int n;\ncin >> n;\nvector<long long> a(n);\nfor (auto& v : a) cin >> v;\nint k;\ncin >> k;", ["iostream", "vector", "utility"], "// Write partition and quickselect here"),
        tests: [
          T("sample", "7\n7 2 9 1 8 3 5\n3\n", "3", "sample"),
          T("smallest", "4\n4 3 2 1\n1\n", "1", "visible", "boundary"),
          T("largest", "4\n4 9 2 1\n4\n", "9", "hidden", "boundary"),
          T("duplicates", "5\n5 5 1 5 2\n4\n", "5", "hidden", "edge"),
        ],
        hints: [
          "Use the same partition as quicksort (middle pivot swapped to the end).",
          "Let target = k − 1. After partition returns p: if p == target, done.",
          "If target < p, continue on [lo, p − 1]; otherwise on [p + 1, hi].",
          "A loop instead of recursion works nicely here.",
        ],
        solution: r`#include <iostream>
#include <vector>
#include <utility>
using namespace std;

int partitionMid(vector<long long>& a, int lo, int hi) {
    swap(a[lo + (hi - lo) / 2], a[hi]);
    long long pivot = a[hi];
    int i = lo;
    for (int j = lo; j < hi; j++)
        if (a[j] < pivot) swap(a[i++], a[j]);
    swap(a[i], a[hi]);
    return i;
}

int main() {
    int n;
    cin >> n;
    vector<long long> a(n);
    for (auto& v : a) cin >> v;
    int k;
    cin >> k;
    int target = k - 1, lo = 0, hi = n - 1;
    while (lo < hi) {
        int p = partitionMid(a, lo, hi);
        if (p == target) break;
        if (target < p) hi = p - 1;
        else lo = p + 1;
    }
    cout << a[target] << endl;
    return 0;
}`,
        solutionNotes: "Each round throws away one side, so the work is n + n/2 + n/4 + … ≈ 2n on average. The standard library version is std::nth_element.",
      },
    ),
    explainAgain: `Quicksort is like organising a class by height: pick one student as the "pivot", send everyone shorter to the left and taller to the right. The pivot is now in the right spot. Repeat with each group. If you keep picking the shortest student as the pivot, though, each round only places one person — that's the slow worst case.`,
    summary: [
      "Partition around a pivot, then quicksort each side.",
      "Average O(n log n), in-place, not stable; worst case O(n²) with bad pivots.",
      "Partitioning alone also solves k-th smallest (quickselect) in average O(n).",
    ],
  },

  {
    id: "counting-sort",
    moduleId: "searching-sorting",
    after: "quicksort",
    title: "Counting sort",
    minutes: 15,
    concepts: ["counting sort", "frequency array", "O(n + k)", "non-comparison sort"],
    goals: [
      "Sort small-range integers in O(n + k) with a frequency array",
      "Make counting sort stable with prefix sums",
      "Know when it beats comparison sorts — and when it can't be used",
    ],
    intro: `No comparison sort can beat O(n log n) in general. But if the values are small whole numbers — exam marks 0…100, ages, digits — you don't need comparisons at all: just **count** how many times each value occurs.`,
    sections: [
      {
        title: "Count, then write out",
        body: `\`\`\`cpp
vector<int> cnt(101, 0);          // values 0..100
for (int x : marks) cnt[x]++;
for (int v = 0; v <= 100; v++)
    for (int c = 0; c < cnt[v]; c++) cout << v << " ";
\`\`\`

Time O(n + k), where k is the size of the value range.`,
      },
      {
        title: "Stable counting sort",
        body: `To sort *records* (name + mark) and keep equal marks in input order:

1. Count each key.
2. Turn counts into starting positions with a prefix sum: \`start[v] = cnt[0] + … + cnt[v−1]\`.
3. Walk the input in order, placing each record at \`start[key]++\`.

This stable version is the building block of **radix sort**.`,
      },
      {
        title: "When not to use it",
        body: `If values range up to 10⁹, the count array would need a billion slots. Counting sort is for small ranges (or values you can shift into one: for −50…50 use \`cnt[x + 50]\`).`,
      },
    ],
    mistakes: [
      { title: "Forgetting negative values", body: "cnt[-3] is out of bounds. Shift by the minimum value." },
      { title: "Huge ranges", body: "k = 10⁹ means gigabytes of counts. Use std::sort instead." },
      { title: "Losing stability", body: "Writing records from the counts alone loses their order; use positions from prefix sums." },
    ],
    example: {
      title: "Counting marks",
      intro: "Sort marks 0–10 by counting.",
      code: r`#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> marks = {7, 3, 10, 3, 0, 7, 7};
    vector<int> cnt(11, 0);
    for (int m : marks) cnt[m]++;
    for (int v = 0; v <= 10; v++)
        for (int c = 0; c < cnt[v]; c++) cout << v << " ";
    cout << endl;
    cout << "sevens: " << cnt[7] << endl;
    return 0;
}`,
      output: "0 3 3 7 7 7 10 \nsevens: 3\n",
      notes: [
        { line: 7, text: "One counter per possible value." },
        { line: 8, text: "One pass counts everything: O(n)." },
        { line: 9, text: "Walk the value range in order: O(k)." },
      ],
    },
    quickCheck: {
      prompt: "Which data is a good fit for counting sort?",
      options: [
        { id: "a", text: "A million ages between 0 and 120", feedback: "Yes — the range is tiny compared with n." },
        { id: "b", text: "A thousand phone numbers up to 10¹⁰", feedback: "The range is enormous; the count array wouldn't fit." },
        { id: "c", text: "A list of decimal prices", feedback: "Counting sort needs whole-number keys (you could convert to paise first, if the range is small)." },
      ],
      correct: "a",
      explanation: "Counting sort costs O(n + k): great when k is small.",
    },
    exercise: {
      title: "Sort scores from −100 to 100",
      prompt: `Read \`n\` (up to 1 000 000) and n whole scores between −100 and 100. Print them sorted with counting sort, then print the most common score (the smallest one if tied).`,
      starterCode: r`#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    // count with an offset of 100, then print

    return 0;
}`,
      tests: [
        { label: "sample", input: "6\n5 -3 5 0 -100 5\n", output: "-100 -3 0 5 5 5\n5", visibility: "sample", category: "normal" },
        { label: "tie", input: "4\n2 1 2 1\n", output: "1 1 2 2\n1", visibility: "hidden", category: "edge" },
        { label: "extremes", input: "2\n100 -100\n", output: "-100 100\n-100", visibility: "hidden", category: "boundary" },
      ],
      compare: "lines",
      hints: [
        "vector<int> cnt(201, 0); cnt[x + 100]++.",
        "Walk v from 0 to 200 and print v − 100, cnt[v] times.",
        "Track the index with the largest count; use > so the smallest wins ties.",
        "Build the output with spaces between values.",
      ],
      solution: r`#include <iostream>
#include <vector>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> cnt(201, 0);
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        cnt[x + 100]++;
    }
    bool first = true;
    int best = 0;
    for (int v = 0; v <= 200; v++) {
        for (int c = 0; c < cnt[v]; c++) {
            cout << (first ? "" : " ") << v - 100;
            first = false;
        }
        if (cnt[v] > cnt[best]) best = v;
    }
    cout << "\n" << best - 100 << "\n";
    return 0;
}`,
      solutionNotes: "Shifting by 100 maps −100…100 onto indexes 0…200. The mode falls out of the same count array for free.",
    },
    practice: practice(
      {
        title: "Stable sort by grade",
        prompt: `Read \`n\` students as \`NAME GRADE\` (grades 1–5). Print them sorted by grade ascending, keeping input order within a grade, using a **stable counting sort** with prefix sums (no std::sort).`,
        starterCode: starter("Count grades, prefix-sum into start positions, place records in input order", "int n;\ncin >> n;\nvector<pair<string, int>> s(n);\nfor (auto& [name, g] : s) cin >> name >> g;", ["iostream", "vector", "string", "utility"]),
        tests: [
          T("sample", "5\nasha 3\nravi 1\nmeera 3\nzoe 2\nkabir 1\n", "ravi 1\nkabir 1\nzoe 2\nasha 3\nmeera 3", "sample"),
          T("one grade", "2\nb 4\na 4\n", "b 4\na 4", "visible", "edge"),
          T("reverse", "3\nx 5\ny 3\nz 1\n", "z 1\ny 3\nx 5", "hidden"),
        ],
        compare: "lines",
        hints: [
          "cnt[g]++ for each student (size 6 for grades 1..5).",
          "start[g] = start[g − 1] + cnt[g − 1].",
          "Walk students in input order: out[start[g]++] = student.",
          "Print out in order.",
        ],
        solution: r`#include <iostream>
#include <vector>
#include <string>
#include <utility>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<pair<string, int>> s(n);
    for (auto& [name, g] : s) cin >> name >> g;
    vector<int> cnt(7, 0), start(7, 0);
    for (const auto& p : s) cnt[p.second]++;
    for (int g = 1; g <= 6; g++) start[g] = start[g - 1] + cnt[g - 1];
    vector<pair<string, int>> out(n);
    for (const auto& p : s) out[start[p.second]++] = p;
    for (const auto& [name, g] : out) cout << name << " " << g << endl;
    return 0;
}`,
        solutionNotes: "The prefix sums say where each grade's block begins; filling blocks in input order is what makes it stable.",
      },
      {
        title: "Radix sort",
        prompt: `Read \`n\` non-negative whole numbers (each < 10⁹). Sort them with **LSD radix sort**: a stable counting sort on the last decimal digit, then the tens digit, and so on — 9 passes. Print the result, and on a second line the array after the **first** pass.`,
        starterCode: starter("Stable counting sort by digit (exp = 1, 10, 100, ...)", "int n;\ncin >> n;\nvector<long long> a(n);\nfor (auto& x : a) cin >> x;", ["iostream", "vector"], "// Write countingPass(vector<long long>& a, long long exp) here"),
        tests: [
          T("sample", "6\n170 45 75 90 802 24\n", "24 45 75 90 170 802\n170 90 802 24 45 75", "sample"),
          T("single digit", "4\n3 1 2 1\n", "1 1 2 3\n1 1 2 3", "visible", "edge"),
          T("large", "3\n999999999 0 123456789\n", "0 123456789 999999999\n0 999999999 123456789", "hidden", "boundary"),
        ],
        compare: "lines",
        hints: [
          "Digit of x for this pass: (x / exp) % 10.",
          "Count digits, prefix-sum to positions, place in input order (stability is essential!).",
          "Run passes for exp = 1, 10, …, 10⁸.",
          "Save a copy of the array after the first pass to print it last.",
        ],
        solution: r`#include <iostream>
#include <vector>
using namespace std;

void countingPass(vector<long long>& a, long long exp) {
    vector<int> cnt(10, 0), start(10, 0);
    for (long long x : a) cnt[(x / exp) % 10]++;
    for (int d = 1; d < 10; d++) start[d] = start[d - 1] + cnt[d - 1];
    vector<long long> out(a.size());
    for (long long x : a) out[start[(x / exp) % 10]++] = x;
    a = out;
}

void printAll(const vector<long long>& a) {
    for (size_t i = 0; i < a.size(); i++) cout << (i ? " " : "") << a[i];
    cout << endl;
}

int main() {
    int n;
    cin >> n;
    vector<long long> a(n);
    for (auto& x : a) cin >> x;
    vector<long long> afterFirst;
    long long exp = 1;
    for (int pass = 0; pass < 9; pass++, exp *= 10) {
        countingPass(a, exp);
        if (pass == 0) afterFirst = a;
    }
    printAll(a);
    printAll(afterFirst);
    return 0;
}`,
        solutionNotes: "Each pass is a stable counting sort on one digit, so earlier (less significant) orderings survive inside each digit group. 9 passes × O(n + 10) = O(n) for fixed-width numbers.",
      },
    ),
    explainAgain: `To sort a stack of exam papers marked 0–10, you don't need to compare papers at all: make 11 piles, drop each paper on the pile for its mark, then stack the piles in order. That's counting sort — fast when there are few possible marks, useless when every paper could have a different mark from 0 to a billion.`,
    summary: [
      "Counting sort: count each value, then output values in range order — O(n + k).",
      "Prefix sums turn counts into positions for a stable version.",
      "Only for small whole-number ranges; radix sort extends it digit by digit.",
    ],
  },

  {
    id: "comparing-sorts",
    moduleId: "searching-sorting",
    after: "counting-sort",
    title: "Comparing algorithms by constraints",
    minutes: 15,
    concepts: ["constraints", "operations budget", "stability", "std::stable_sort"],
    goals: [
      "Estimate whether an algorithm fits the time limit from n",
      "Choose between std::sort, stable_sort, counting sort and partial methods",
      "Use the right library call for top-k and k-th element problems",
    ],
    intro: `Problem statements tell you the size of the input: "n ≤ 200 000". That single line usually decides the algorithm. A typical judge does roughly **10⁸ simple operations per second** — so you can check a plan with arithmetic before writing any code.`,
    sections: [
      {
        title: "The rule of thumb",
        body: `| n up to | Affordable complexity |
| --- | --- |
| 10–12 | O(n!) — all permutations |
| 20–25 | O(2ⁿ) — all subsets |
| 500 | O(n³) |
| 5 000 | O(n²) |
| 10⁶ | O(n log n) |
| 10⁸ | O(n) |
| bigger | O(log n) or O(1) — math or binary search |`,
      },
      {
        title: "Choosing a sort",
        body: `| Situation | Use |
| --- | --- |
| general sorting | \`std::sort\` (introsort, O(n log n)) |
| equal keys must keep input order | \`std::stable_sort\` (merge-based) |
| small integer range | counting sort, O(n + k) |
| only the smallest k, in order | \`std::partial_sort\`, O(n log k) |
| only the k-th element | \`std::nth_element\`, average O(n) |
| almost sorted, small n | insertion sort |`,
      },
      {
        title: "Memory matters too",
        body: `A typical limit is 256 MB: about 64 million ints or 32 million long longs. A 10⁹-sized count array won't fit, and an n × n table with n = 10⁵ (10¹⁰ cells) is impossible.`,
      },
    ],
    mistakes: [
      { title: "Ignoring the constraints", body: "A correct O(n²) solution still fails when n = 200 000 — 4×10¹⁰ steps is minutes, not a second." },
      { title: "Sorting when you don't have to", body: "Finding the maximum, or the k-th element, doesn't need a full sort." },
      { title: "Assuming std::sort is stable", body: "It isn't. Use stable_sort, or add a tie-breaker." },
    ],
    example: {
      title: "partial_sort, nth_element and stable_sort",
      intro: "Three library tools that do less than a full sort — or a more careful one.",
      code: r`#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    vector<int> v = {9, 4, 7, 1, 8, 2, 6};
    vector<int> top = v;
    partial_sort(top.begin(), top.begin() + 3, top.end());
    cout << "3 smallest: " << top[0] << " " << top[1] << " " << top[2] << endl;
    vector<int> med = v;
    nth_element(med.begin(), med.begin() + 3, med.end());
    cout << "median: " << med[3] << endl;
    vector<pair<string, int>> s = {{"ravi", 2}, {"asha", 1}, {"meera", 2}, {"zoe", 1}};
    stable_sort(s.begin(), s.end(), [](const auto& a, const auto& b) { return a.second < b.second; });
    for (const auto& [name, g] : s) cout << name << " ";
    cout << endl;
    return 0;
}`,
      output: "3 smallest: 1 2 4\nmedian: 6\nasha zoe ravi meera \n",
      notes: [
        { line: 10, text: "Only the first 3 positions are sorted: O(n log k)." },
        { line: 13, text: "Puts the element that belongs at index 3 there: average O(n)." },
        { line: 16, text: "Equal groups keep their input order." },
      ],
    },
    quickCheck: {
      prompt: "n ≤ 200 000. Which plan fits a 1-second limit?",
      options: [
        { id: "a", text: "Sort, then one linear pass: O(n log n)", feedback: "≈ 3.5 million steps — easily." },
        { id: "b", text: "Compare every pair: O(n²)", feedback: "4×10¹⁰ steps: hundreds of seconds." },
        { id: "c", text: "Try every subset: O(2ⁿ)", feedback: "Astronomically too slow." },
      ],
      correct: "a",
      explanation: "With ~10⁸ operations per second, n log n is the comfortable choice for n in the hundreds of thousands.",
    },
    exercise: {
      title: "Top k scores",
      prompt: `Read \`n\` (up to 10⁶), \`k\` and n scores. Print the k highest scores in descending order. Don't sort the whole array — use \`partial_sort\` with \`greater<>()\` (O(n log k)).`,
      starterCode: r`#include <iostream>
#include <vector>
#include <algorithm>
#include <functional>
using namespace std;

int main() {
    int n, k;
    cin >> n >> k;
    vector<long long> a(n);
    for (auto& x : a) cin >> x;
    // partial_sort the first k positions in descending order and print them

    return 0;
}`,
      tests: [
        { label: "sample", input: "7 3\n9 4 7 1 8 2 6\n", output: "9 8 7", visibility: "sample", category: "normal" },
        { label: "k = n", input: "3 3\n1 3 2\n", output: "3 2 1", visibility: "hidden", category: "boundary" },
        { label: "duplicates", input: "5 2\n5 5 5 1 5\n", output: "5 5", visibility: "hidden", category: "edge" },
        { label: "k = 1", input: "4 1\n-5 -2 -9 -3\n", output: "-2", visibility: "hidden", category: "boundary" },
      ],
      compare: "tokens",
      hints: [
        "partial_sort(first, middle, last, comp) sorts only [first, middle).",
        "middle = a.begin() + k.",
        "greater<long long>() gives descending order.",
        "Print a[0] … a[k − 1].",
      ],
      solution: r`#include <iostream>
#include <vector>
#include <algorithm>
#include <functional>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, k;
    cin >> n >> k;
    vector<long long> a(n);
    for (auto& x : a) cin >> x;
    partial_sort(a.begin(), a.begin() + k, a.end(), greater<long long>());
    for (int i = 0; i < k; i++) cout << a[i] << (i + 1 < k ? " " : "\n");
    return 0;
}`,
      solutionNotes: "For small k, O(n log k) is close to O(n). The fast I/O lines matter at a million numbers.",
    },
    practice: practice(
      {
        title: "Which complexity fits?",
        prompt: `For each query \`n\` (one per line, until the input ends), print the **fastest-growing** complexity class that still fits 10⁸ operations, checking in this order: \`O(2^n)\`, \`O(n^3)\`, \`O(n^2)\`, \`O(nlogn)\`, \`O(n)\`, otherwise \`O(logn)\`. Use \`2^n\`, \`n³\`, \`n²\`, \`n·log₂n\` and \`n\` — computed carefully so they don't overflow.`,
        starterCode: starter("Check each class against 1e8 in order", "long long n;", ["iostream", "cmath"]),
        tests: [
          T("sample", "20\n400\n5000\n", "O(2^n)\nO(n^3)\nO(n^2)", "sample"),
          T("big", "1000000\n100000000\n1000000000000\n", "O(nlogn)\nO(n)\nO(logn)", "visible"),
          T("boundaries", "26\n27\n464\n465\n10000\n10001\n", "O(2^n)\nO(n^3)\nO(n^3)\nO(n^2)\nO(n^2)\nO(nlogn)", "hidden", "boundary"),
        ],
        compare: "lines",
        hints: [
          "2^n fits if n <= 26 (2²⁶ ≈ 6.7×10⁷; 2²⁷ ≈ 1.3×10⁸).",
          "Use doubles for n³ and n·log₂n to avoid overflow: (double)n * n * n.",
          "Compare each with 1e8 using <=.",
          "log2 comes from <cmath>.",
        ],
        solution: r`#include <iostream>
#include <cmath>
using namespace std;

int main() {
    const double LIMIT = 1e8;
    long long n;
    while (cin >> n) {
        double d = (double)n;
        if (n <= 62 && pow(2.0, d) <= LIMIT) cout << "O(2^n)" << endl;
        else if (d * d * d <= LIMIT) cout << "O(n^3)" << endl;
        else if (d * d <= LIMIT) cout << "O(n^2)" << endl;
        else if (d * log2(d) <= LIMIT) cout << "O(nlogn)" << endl;
        else if (d <= LIMIT) cout << "O(n)" << endl;
        else cout << "O(logn)" << endl;
    }
    return 0;
}`,
        solutionNotes: "This is the estimate you should do in your head before choosing an algorithm. Doubles avoid overflow; they're precise enough for a rough budget.",
      },
      {
        title: "Median of a big list",
        prompt: `Read \`n\` (up to 10⁶) and n numbers. Print the lower median (the element at index (n − 1) / 2 in sorted order) using \`nth_element\`, then print how many numbers are strictly greater than it.`,
        starterCode: starter("nth_element, then count the values above the median", "int n;\ncin >> n;\nvector<long long> a(n);\nfor (auto& x : a) cin >> x;", ["iostream", "vector", "algorithm"]),
        tests: [
          T("sample", "5\n9 1 7 3 5\n", "5\n2", "sample"),
          T("even", "4\n4 1 3 2\n", "2\n2", "visible", "edge"),
          T("all equal", "3\n6 6 6\n", "6\n0", "hidden", "edge"),
          T("single", "1\n-1\n", "-1\n0", "hidden", "boundary"),
        ],
        compare: "lines",
        hints: [
          "auto mid = a.begin() + (n − 1) / 2;",
          "nth_element(a.begin(), mid, a.end());",
          "The median is *mid.",
          "count_if with a lambda counts values > *mid.",
        ],
        solution: r`#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<long long> a(n);
    for (auto& x : a) cin >> x;
    auto mid = a.begin() + (n - 1) / 2;
    nth_element(a.begin(), mid, a.end());
    long long med = *mid;
    long long above = count_if(a.begin(), a.end(), [med](long long x) { return x > med; });
    cout << med << "\n" << above << "\n";
    return 0;
}`,
        solutionNotes: "nth_element is quickselect: average O(n), versus O(n log n) to sort everything just to read one position.",
      },
    ),
    explainAgain: `Before cooking, check the guest list: dinner for 4 and dinner for 400 need different plans. The constraints in a problem are the guest list. Multiply out the steps your idea needs, compare with about 100 million per second, and you'll know whether to start cooking or pick a different recipe.`,
    summary: [
      "≈10⁸ simple operations per second: estimate before coding.",
      "n ≤ 5 000 → O(n²) is fine; n ≤ 10⁶ → aim for O(n log n).",
      "Use stable_sort for stability, partial_sort for top-k, nth_element for one position.",
    ],
  },
];
