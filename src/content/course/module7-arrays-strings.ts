import type { CourseLesson } from "./types";

const r = String.raw;

/**
 * Module 7 — Arrays and strings. Students can loop and write functions; now they store many values
 * under one name and process text.
 */
export const ARRAYS_STRINGS_LESSONS: CourseLesson[] = [
  {
    id: "arrays-intro",
    moduleId: "arrays-strings",
    title: "Arrays: many values, one name",
    minutes: 15,
    concepts: ["array", "index", "zero-based", "out of bounds"],
    goals: [
      "Declaring an array and reading/writing its elements",
      "Why indexes start at 0 and end at size − 1",
      "Filling an array from input with a loop",
    ],
    intro: `Storing five marks in \`m1, m2, m3, m4, m5\` works — until there are 500. An **array** is a row of boxes that share one name; each box is reached by its position, called its **index**.`,
    sections: [
      {
        title: "Declaring and indexing",
        body: `\`\`\`cpp
int marks[5];                     // 5 int boxes, values not set yet
int primes[4] = {2, 3, 5, 7};     // declared and filled

cout << primes[0];   // 2 — the FIRST element
cout << primes[3];   // 7 — the LAST element
primes[1] = 13;      // change the second element
\`\`\`

An array of size \`n\` has indexes \`0, 1, …, n − 1\`. The index says how many steps from the start, so the first element is 0 steps away.`,
      },
      {
        title: "Loops and arrays belong together",
        body: `Because the index is just a number, a \`for\` loop can visit every element:

\`\`\`cpp
int n;
cin >> n;
int a[100];                       // room for up to 100 values
for (int i = 0; i < n; i++) {
    cin >> a[i];                  // read into box i
}
\`\`\`

The pattern \`for (int i = 0; i < n; i++)\` — **starting at 0, stopping before n** — matches the valid indexes exactly.`,
      },
      {
        title: "Out of bounds",
        body: `C++ does **not** check indexes for you. \`primes[4]\` on a 4-element array reads memory that isn't part of the array: the program may print garbage, crash, or seem to work and fail later. This is called **undefined behaviour**.

Keep every index between \`0\` and \`size − 1\`, and make sure the array is big enough for the largest input.`,
      },
    ],
    mistakes: [
      { title: "Using index n", body: "In an array of size `n` the last index is `n - 1`. A loop condition `i <= n` touches one box too many." },
      { title: "Starting at 1", body: "Looping from `i = 1` skips the first element, `a[0]`." },
      { title: "Reading uninitialised values", body: "`int a[5];` inside a function holds leftover garbage until you assign to it. Fill it (or write `int a[5] = {};` for all zeros) before reading." },
    ],
    example: {
      title: "Store, then use",
      intro: "Read five temperatures, then print the first, the last and all of them.",
      code: r`#include <iostream>
using namespace std;

int main() {
    int temp[5];
    for (int i = 0; i < 5; i++) {
        cin >> temp[i];
    }
    cout << "first: " << temp[0] << endl;
    cout << "last: " << temp[4] << endl;
    for (int i = 0; i < 5; i++) {
        cout << temp[i] << " ";
    }
    cout << endl;
    return 0;
}`,
      input: "31 29 35 33 30\n",
      output: "first: 31\nlast: 30\n31 29 35 33 30 \n",
      notes: [
        { line: 5, text: "Five `int` boxes: `temp[0]` to `temp[4]`." },
        { line: 7, text: "Box `i` gets the next number from the input." },
        { line: 10, text: "Size 5, so the last index is 4." },
      ],
    },
    quickCheck: {
      prompt: "What does this print?",
      code: r`int a[4] = {10, 20, 30, 40};
a[2] = a[0] + a[3];
cout << a[2];`,
      options: [
        { id: "a", text: "30", feedback: "`a[2]` was 30, but the second line replaces it." },
        { id: "b", text: "50", feedback: "Right: `a[0]` is 10 and `a[3]` is 40, so `a[2]` becomes 50." },
        { id: "c", text: "70", feedback: "Check the indexes: `a[3]` is the fourth element, 40." },
      ],
      correct: "b",
      explanation: "Indexes start at 0: `a[0]` = 10, `a[3]` = 40. Their sum, 50, is stored in `a[2]`.",
    },
    exercise: {
      title: "Reverse the list",
      prompt: `Read \`n\` (1 ≤ n ≤ 100) and then \`n\` whole numbers. Print them in **reverse order**, separated by spaces.`,
      starterCode: r`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int a[100];
    // Read n numbers into a, then print them from last to first.

    return 0;
}`,
      tests: [
        { label: "1 2 3 4 5", input: "5\n1 2 3 4 5\n", output: "5 4 3 2 1", visibility: "sample", category: "normal" },
        { label: "single value", input: "1\n42\n", output: "42", visibility: "sample", category: "boundary" },
        { label: "negatives", input: "4\n-3 0 7 -1\n", output: "-1 7 0 -3", visibility: "hidden", category: "edge" },
        { label: "repeated values", input: "6\n9 9 1 1 2 2\n", output: "2 2 1 1 9 9", visibility: "hidden", category: "normal" },
      ],
      compare: "tokens",
      hints: [
        "You have to print the last number first — so what must happen before you print anything?",
        "Store all the numbers in the array first, then walk the array in the other direction.",
        "The last element is at index `n - 1`, the first at index 0.",
        "Read with `for (int i = 0; i < n; i++) cin >> a[i];` then print with `for (int i = n - 1; i >= 0; i--)`.",
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
    for (int i = n - 1; i >= 0; i--) {
        cout << a[i] << " ";
    }
    cout << endl;
    return 0;
}`,
      solutionNotes: "Two loops: one forwards to fill the array, one backwards from `n - 1` down to `0` to print. Without the array you couldn't get back to the earlier numbers.",
    },
    explainAgain: `An array is like a row of numbered lockers in a school corridor. They all belong to one corridor (the array name) and you find one by its number (the index).

The lockers are numbered from **0**, so in a corridor of 5 lockers the last one is number 4. Asking for locker 5 means opening a door that belongs to someone else's corridor.`,
    summary: [
      "An array holds many values of one type under one name.",
      "Valid indexes run from 0 to size − 1; C++ doesn't check them for you.",
      "`for (int i = 0; i < n; i++)` visits every element exactly once.",
    ],
  },

  {
    id: "array-traversal",
    moduleId: "arrays-strings",
    title: "Traversal: sum, max and counting",
    minutes: 20,
    concepts: ["traversal", "accumulator", "running maximum", "average"],
    goals: [
      "Visiting every element to compute a total or an average",
      "Finding the largest and smallest values",
      "Using a stored array for a second pass",
    ],
    intro: `Most array work is a **traversal**: visit each element once and update something as you go — a total, a best-so-far, a counter. These are the same loop patterns you learned in Loops, now applied to stored data.`,
    sections: [
      {
        title: "Total and average",
        body: `\`\`\`cpp
long long total = 0;
for (int i = 0; i < n; i++) {
    total += a[i];
}
double average = (double)total / n;
\`\`\`

Cast to \`double\` before dividing, or integer division throws the fraction away.`,
      },
      {
        title: "Best so far",
        body: `To find the maximum, start with the **first element** (not with 0 — all values might be negative) and update whenever something bigger appears:

\`\`\`cpp
int best = a[0];
for (int i = 1; i < n; i++) {
    if (a[i] > best) best = a[i];
}
\`\`\``,
      },
      {
        title: "Two passes",
        body: `Some questions need the whole array first. "How many values are above the average?" can't be answered while reading, because the average isn't known until the end. With an array you can: **pass 1** computes the average, **pass 2** compares every element with it.`,
      },
    ],
    mistakes: [
      { title: "Starting the maximum at 0", body: "If every value is negative, `best = 0` is never beaten and the answer is wrong. Start from `a[0]`." },
      { title: "Integer average", body: "`total / n` with two ints drops the fraction: 7 / 2 is 3. Use `(double)total / n`, or avoid dividing at all (compare `a[i] * n > total`)." },
      { title: "Overflowing the total", body: "Many large values can exceed the `int` range. Use `long long` for sums." },
    ],
    example: {
      title: "Class report",
      intro: "Sum, largest, smallest and average of the marks read from input.",
      code: r`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int a[100];
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }
    long long total = 0;
    int hi = a[0], lo = a[0];
    for (int i = 0; i < n; i++) {
        total += a[i];
        if (a[i] > hi) hi = a[i];
        if (a[i] < lo) lo = a[i];
    }
    cout << "total " << total << endl;
    cout << "max " << hi << " min " << lo << endl;
    cout << "average " << (double)total / n << endl;
    return 0;
}`,
      input: "4\n70 85 60 95\n",
      output: "total 310\nmax 95 min 60\naverage 77.5\n",
      notes: [
        { line: 12, text: "Best-so-far values start from the first element." },
        { line: 14, text: "One pass updates all three results." },
        { line: 20, text: "Cast before dividing: 310 / 4 = 77.5, not 77." },
      ],
    },
    quickCheck: {
      prompt: "The array is `{-5, -2, -9}`. This code prints…",
      code: r`int best = 0;
for (int i = 0; i < 3; i++) {
    if (a[i] > best) best = a[i];
}
cout << best;`,
      options: [
        { id: "a", text: "-2", feedback: "That's the correct maximum — but this code can't find it." },
        { id: "b", text: "0", feedback: "Yes — no element is bigger than 0, so `best` never changes. Start from `a[0]` instead." },
        { id: "c", text: "-9", feedback: "That's the minimum, and it isn't bigger than 0 either." },
      ],
      correct: "b",
      explanation: "Starting at 0 is a bug when all values are negative. `int best = a[0];` fixes it.",
    },
    exercise: {
      title: "Above average",
      prompt: `Read \`n\` (1 ≤ n ≤ 100) and \`n\` whole numbers. Print how many of them are **strictly greater** than the average of all \`n\` numbers.`,
      starterCode: r`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int a[100];
    // Pass 1: read the numbers and add them up.
    // Pass 2: count the values above the average.

    return 0;
}`,
      tests: [
        { label: "1 2 3 4 5", input: "5\n1 2 3 4 5\n", output: "2", visibility: "sample", category: "normal" },
        { label: "all equal", input: "3\n7 7 7\n", output: "0", visibility: "sample", category: "edge" },
        { label: "fractional average", input: "4\n1 2 2 2\n", output: "3", visibility: "hidden", category: "boundary" },
        { label: "one big value", input: "5\n1 1 1 1 100\n", output: "1", visibility: "hidden", category: "normal" },
        { label: "negatives", input: "3\n-4 -1 -1\n", output: "2", visibility: "hidden", category: "edge" },
      ],
      compare: "tokens",
      hints: [
        "Can you know whether the first number is above average at the moment you read it?",
        "No — so store the numbers, compute the total in one pass, then compare in a second pass.",
        "Watch the average: for `1 2 2 2` it is 1.75, so integer division (giving 1) would count wrongly.",
        "Avoid division entirely: `a[i] > total / n` is the same as `a[i] * n > total`. Count those with a second loop.",
      ],
      solution: r`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int a[100];
    long long total = 0;
    for (int i = 0; i < n; i++) {
        cin >> a[i];
        total += a[i];
    }
    int count = 0;
    for (int i = 0; i < n; i++) {
        if ((long long)a[i] * n > total) {
            count++;
        }
    }
    cout << count << endl;
    return 0;
}`,
      solutionNotes: "Comparing `a[i] * n > total` is exact — no fractions, no rounding. The first loop both reads and sums; the second can only run once the total is known.",
    },
    explainAgain: `Think of a teacher with a stack of answer sheets. To find the top score, they look at the first sheet and remember its score, then flip through the rest, replacing the remembered score whenever they see a higher one.

To find how many students beat the class average, they need to go through the stack **twice**: once to add everything up, once to compare.`,
    summary: [
      "A traversal visits each element once and updates a result.",
      "Start maximum/minimum from the first element, not from 0.",
      "Some questions need a second pass over the stored array.",
    ],
  },

  {
    id: "array-search",
    moduleId: "arrays-strings",
    title: "Searching and frequency counting",
    minutes: 20,
    concepts: ["linear search", "sentinel -1", "frequency array", "counting"],
    goals: [
      "Finding where a value appears (linear search)",
      "Returning -1 when it isn't there",
      "Counting how often each value occurs with a frequency array",
    ],
    intro: `Two questions come up constantly: **"where is this value?"** and **"how many times does each value appear?"**. Both have short, reliable patterns.`,
    sections: [
      {
        title: "Linear search",
        body: `Check each element in order and stop at the first match:

\`\`\`cpp
int pos = -1;                    // -1 means "not found"
for (int i = 0; i < n; i++) {
    if (a[i] == target) {
        pos = i;
        break;                   // first match is enough
    }
}
\`\`\`

\`-1\` is safe as a "not found" signal because it can never be a valid index.`,
      },
      {
        title: "Frequency arrays",
        body: `When the values are small whole numbers (say 0–9), use the **value itself as an index** into a counting array:

\`\`\`cpp
int freq[10] = {};               // all ten counters start at 0
for (int i = 0; i < n; i++) {
    freq[a[i]]++;                // one more of value a[i]
}
\`\`\`

After one pass, \`freq[7]\` is how many 7s there were. This is far quicker than searching the whole array for each value.`,
      },
    ],
    mistakes: [
      { title: "Returning inside the else", body: "`if (a[i] == t) return i; else return -1;` gives up after checking only the first element. Return -1 **after** the loop." },
      { title: "Forgetting break", body: "Without `break`, the search keeps going and `pos` ends up at the **last** match, not the first." },
      { title: "Uninitialised counters", body: "`int freq[10];` inside a function starts with garbage. Write `int freq[10] = {};` so every counter starts at 0." },
    ],
    example: {
      title: "Dice statistics",
      intro: "Count how many times each face of a die came up.",
      code: r`#include <iostream>
using namespace std;

int main() {
    int rolls[8] = {3, 6, 1, 3, 6, 6, 2, 3};
    int freq[7] = {};
    for (int i = 0; i < 8; i++) {
        freq[rolls[i]]++;
    }
    for (int face = 1; face <= 6; face++) {
        cout << face << ": " << freq[face] << endl;
    }
    return 0;
}`,
      output: "1: 1\n2: 1\n3: 3\n4: 0\n5: 0\n6: 3\n",
      notes: [
        { line: 6, text: "Size 7 so that indexes 1–6 exist; `= {}` sets every counter to 0." },
        { line: 8, text: "The roll's value picks which counter to increase." },
        { line: 10, text: "Faces start at 1, so this loop starts at 1 too." },
      ],
    },
    quickCheck: {
      prompt: "The array is `{4, 8, 4, 2}` and `target` is 4. What is `pos`?",
      code: r`int pos = -1;
for (int i = 0; i < 4; i++) {
    if (a[i] == target) pos = i;
}`,
      options: [
        { id: "a", text: "0", feedback: "That would be the first match — but there's no `break`, so the loop keeps going." },
        { id: "b", text: "2", feedback: "Right: without `break` the later match at index 2 overwrites the first." },
        { id: "c", text: "-1", feedback: "4 is in the array, so `pos` is updated." },
      ],
      correct: "b",
      explanation: "With no `break`, every match overwrites `pos`, leaving the last one (index 2).",
    },
    exercise: {
      title: "Where is it?",
      prompt: `Read \`n\` (1 ≤ n ≤ 100), then \`n\` whole numbers, then a \`target\`.

Print the **index of the first** element equal to \`target\` (indexes start at 0), or \`-1\` if it doesn't appear. On a second line print **how many times** it appears.`,
      starterCode: r`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int a[100];
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }
    int target;
    cin >> target;
    // Find the first index of target (or -1), and count how many times it appears.

    return 0;
}`,
      tests: [
        { label: "found twice", input: "5\n4 8 15 8 23\n8\n", output: "1\n2", visibility: "sample", category: "normal" },
        { label: "not found", input: "3\n1 2 3\n9\n", output: "-1\n0", visibility: "sample", category: "edge" },
        { label: "first element", input: "4\n7 7 7 7\n7\n", output: "0\n4", visibility: "hidden", category: "boundary" },
        { label: "last element", input: "6\n5 4 3 2 1 0\n0\n", output: "5\n1", visibility: "hidden", category: "boundary" },
      ],
      compare: "tokens",
      hints: [
        "What two pieces of information do you track while walking the array?",
        "A position that starts as -1 (not found yet), and a counter that starts at 0.",
        "Every match increases the counter, but only the **first** match should set the position.",
        "In the loop: `if (a[i] == target) { count++; if (pos == -1) pos = i; }`. Don't `break` — you still need to count the rest.",
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
    int target;
    cin >> target;
    int pos = -1, count = 0;
    for (int i = 0; i < n; i++) {
        if (a[i] == target) {
            count++;
            if (pos == -1) {
                pos = i;
            }
        }
    }
    cout << pos << endl;
    cout << count << endl;
    return 0;
}`,
      solutionNotes: "`pos == -1` means \"no match yet\", so only the first match sets it. Because we also count, the loop must visit every element instead of breaking early.",
    },
    explainAgain: `Linear search is looking for your friend in a cinema queue: you walk from the front and check each face. The moment you spot them, you stop. If you reach the end, they're not there (-1).

A frequency array is a tally sheet: one column per possible value, and each time you see a value you add a mark in its column.`,
    summary: [
      "Linear search checks elements in order; -1 signals \"not found\".",
      "Return/report \"not found\" only after the whole loop.",
      "A frequency array uses values as indexes to count occurrences in one pass.",
    ],
  },

  {
    id: "arrays-functions",
    moduleId: "arrays-strings",
    title: "Arrays in functions, and std::vector",
    minutes: 20,
    concepts: ["array parameter", "size parameter", "std::vector", "push_back", "size()"],
    goals: [
      "Passing an array to a function together with its size",
      "Why a function can change the caller's array",
      "Using `std::vector`, an array that knows its own size and can grow",
    ],
    intro: `Arrays and functions combine naturally — "sum this array", "rotate this array". There are two surprises: a function doesn't know the array's size unless you pass it, and it works on the **original** array, not a copy. Then we meet \`vector\`, the array you'll use most in modern C++.`,
    sections: [
      {
        title: "Passing an array",
        body: `\`\`\`cpp
int sum(int a[], int n) {        // the array and how many elements to use
    int s = 0;
    for (int i = 0; i < n; i++) s += a[i];
    return s;
}

int marks[3] = {10, 20, 30};
cout << sum(marks, 3);
\`\`\`

Inside \`sum\`, \`a\` is really just the address of the first element, so the function has **no way to know the length** — always pass \`n\`. And because it's the address, changes to \`a[i]\` change the caller's array.`,
      },
      {
        title: "std::vector",
        body: `\`vector\` (from \`<vector>\`) is a resizable array that **knows its size**:

\`\`\`cpp
#include <vector>

vector<int> v;            // empty
v.push_back(4);           // add to the end → {4}
v.push_back(9);           // {4, 9}
cout << v.size();         // 2
cout << v[1];             // 9 — same [] indexing as arrays

vector<int> zeros(5, 0);  // five zeros
\`\`\`

Pass vectors by reference — \`vector<int>& v\` to change, \`const vector<int>& v\` to read — so they aren't copied.`,
      },
      {
        title: "Fixed array or vector?",
        body: `| | built-in array \`int a[100]\` | \`vector<int>\` |
|---|---|---|
| size | fixed when written | grows with \`push_back\` |
| knows its size | no — pass \`n\` | yes — \`v.size()\` |
| passed to a function | always the original | copied unless you use \`&\` |

In new code, prefer \`vector\`. Built-in arrays are still worth knowing — you'll meet them in older code and in how memory works (Module 8).`,
      },
    ],
    mistakes: [
      { title: "Using sizeof on an array parameter", body: "Inside a function, `sizeof(a) / sizeof(a[0])` doesn't give the length — `a` is only a pointer there. Pass the size, or use `vector`." },
      { title: "Passing a vector by value", body: "`void fill(vector<int> v)` changes a copy; the caller sees nothing. Use `vector<int>& v`." },
      { title: "Indexing past size()", body: "`v[v.size()]` is out of bounds, just like with arrays. The last element is `v[v.size() - 1]` (or `v.back()`)." },
    ],
    example: {
      title: "Double everything",
      intro: "A function changes the caller's vector through a reference, and another reads it through a const reference.",
      code: r`#include <iostream>
#include <vector>
using namespace std;

void doubleAll(vector<int>& v) {
    for (int i = 0; i < (int)v.size(); i++) {
        v[i] *= 2;
    }
}

void print(const vector<int>& v) {
    for (int x : v) {
        cout << x << " ";
    }
    cout << endl;
}

int main() {
    vector<int> nums;
    nums.push_back(3);
    nums.push_back(5);
    nums.push_back(8);
    doubleAll(nums);
    print(nums);
    cout << "size " << nums.size() << endl;
    return 0;
}`,
      output: "6 10 16 \nsize 3\n",
      notes: [
        { line: 5, text: "`&`: works on the caller's vector, not a copy." },
        { line: 12, text: "A range-for loop: `x` takes each element in turn." },
        { line: 20, text: "`push_back` adds to the end; the vector grows to fit." },
      ],
    },
    quickCheck: {
      prompt: "What is printed?",
      code: r`void reset(int a[], int n) {
    for (int i = 0; i < n; i++) a[i] = 0;
}

int main() {
    int a[3] = {1, 2, 3};
    reset(a, 3);
    cout << a[1];
}`,
      options: [
        { id: "a", text: "2", feedback: "Arrays aren't copied when passed — `reset` changes the original." },
        { id: "b", text: "0", feedback: "Correct: the function receives the array's address, so its changes are visible in `main`." },
        { id: "c", text: "It doesn't compile", feedback: "`int a[]` is a valid parameter; this compiles." },
      ],
      correct: "b",
      explanation: "A built-in array parameter refers to the caller's array, so `reset` sets the real elements to 0.",
    },
    exercise: {
      title: "Rotate left",
      prompt: `Complete \`void rotateLeft(vector<int>& v, int k)\`: shift every element \`k\` places to the left, with elements that fall off the front reappearing at the back. For \`{1, 2, 3, 4, 5}\` and \`k = 2\` the result is \`{3, 4, 5, 1, 2}\`.

\`k\` can be larger than the size (rotating by the size gives back the same vector). Input: \`n k\`, then \`n\` numbers.`,
      starterCode: r`#include <iostream>
#include <vector>
using namespace std;

void rotateLeft(vector<int>& v, int k) {
    // Shift every element k places to the left (wrapping around).
}

int main() {
    int n, k;
    cin >> n >> k;
    vector<int> v(n);
    for (int i = 0; i < n; i++) {
        cin >> v[i];
    }
    rotateLeft(v, k);
    for (int x : v) {
        cout << x << " ";
    }
    cout << endl;
    return 0;
}`,
      tests: [
        { label: "5 numbers, k = 2", input: "5 2\n1 2 3 4 5\n", output: "3 4 5 1 2", visibility: "sample", category: "normal" },
        { label: "k = 0", input: "3 0\n7 8 9\n", output: "7 8 9", visibility: "sample", category: "edge" },
        { label: "k equals size", input: "4 4\n1 2 3 4\n", output: "1 2 3 4", visibility: "hidden", category: "boundary" },
        { label: "k larger than size", input: "3 7\n10 20 30\n", output: "20 30 10", visibility: "hidden", category: "boundary" },
        { label: "single element", input: "1 5\n42\n", output: "42", visibility: "hidden", category: "edge" },
      ],
      compare: "tokens",
      hints: [
        "After rotating, which original element ends up at position 0? At position 1?",
        "Position `i` of the result holds the original element at `(i + k) % n`. The `%` handles the wrap-around and large `k`.",
        "Writing into `v` while you still need its old values breaks things — build the answer in a second vector first.",
        "`vector<int> out(n); for (int i = 0; i < n; i++) out[i] = v[(i + k) % n]; v = out;` (and do nothing when the vector is empty).",
      ],
      solution: r`#include <iostream>
#include <vector>
using namespace std;

void rotateLeft(vector<int>& v, int k) {
    int n = v.size();
    if (n == 0) {
        return;
    }
    vector<int> out(n);
    for (int i = 0; i < n; i++) {
        out[i] = v[(i + k) % n];
    }
    v = out;
}

int main() {
    int n, k;
    cin >> n >> k;
    vector<int> v(n);
    for (int i = 0; i < n; i++) {
        cin >> v[i];
    }
    rotateLeft(v, k);
    for (int x : v) {
        cout << x << " ";
    }
    cout << endl;
    return 0;
}`,
      solutionNotes: "`(i + k) % n` maps each new position to the old element and wraps past the end; it also makes `k = 7` on 3 elements behave like `k = 1`. Copying into `out` avoids overwriting values that are still needed; `v = out;` then replaces the caller's vector through the reference.",
    },
    explainAgain: `Passing a built-in array is like giving someone **your house address**: they go to your actual house, and whatever they rearrange, you'll find rearranged. But the address alone doesn't say how many rooms there are — so you tell them (\`n\`).

A \`vector\` is a house that carries its own floor plan (\`size()\`) and can add rooms (\`push_back\`).`,
    summary: [
      "A function receiving a built-in array needs the size passed separately.",
      "Array parameters work on the caller's array; vectors need `&` for that.",
      "`vector` knows its size, grows with `push_back`, and is the default choice in modern C++.",
    ],
  },

  {
    id: "two-d-arrays",
    moduleId: "arrays-strings",
    title: "2D arrays: grids and tables",
    minutes: 20,
    concepts: ["2D array", "row", "column", "nested loops", "matrix"],
    goals: [
      "Declaring a grid with rows and columns",
      "Visiting every cell with nested loops",
      "Row sums, column sums and swapping rows with columns",
    ],
    intro: `Seating plans, game boards, spreadsheets and images are **grids**. A 2D array stores one: \`grid[row][col]\`. The nested loops from Module 5 are exactly what you need to walk through it.`,
    sections: [
      {
        title: "Declaring and indexing",
        body: `\`\`\`cpp
int g[2][3] = {
    {1, 2, 3},     // row 0
    {4, 5, 6}      // row 1
};
cout << g[1][2];   // row 1, column 2 → 6
\`\`\`

The first index picks the **row**, the second the **column**. Both start at 0.`,
      },
      {
        title: "Visiting every cell",
        body: `The outer loop chooses a row; the inner loop walks across it:

\`\`\`cpp
for (int r = 0; r < rows; r++) {
    for (int c = 0; c < cols; c++) {
        cout << g[r][c] << " ";
    }
    cout << endl;          // end of a row
}
\`\`\`

Swap the loops (columns outside, rows inside) to walk **down** each column instead.`,
      },
    ],
    mistakes: [
      { title: "Mixing up rows and columns", body: "`g[c][r]` instead of `g[r][c]` reads the wrong cell — or goes out of bounds when the grid isn't square." },
      { title: "Using the wrong limit", body: "The row loop stops at `rows`, the column loop at `cols`. Using `rows` for both breaks non-square grids." },
      { title: "Printing the new line in the wrong loop", body: "`cout << endl` inside the inner loop puts every number on its own line. It belongs after the inner loop." },
    ],
    example: {
      title: "Row and column totals",
      intro: "Marks of 2 students in 3 subjects: total per student (row) and per subject (column).",
      code: r`#include <iostream>
using namespace std;

int main() {
    int marks[2][3] = {
        {70, 80, 90},
        {60, 75, 85}
    };
    for (int r = 0; r < 2; r++) {
        int rowSum = 0;
        for (int c = 0; c < 3; c++) {
            rowSum += marks[r][c];
        }
        cout << "student " << r << ": " << rowSum << endl;
    }
    for (int c = 0; c < 3; c++) {
        int colSum = 0;
        for (int r = 0; r < 2; r++) {
            colSum += marks[r][c];
        }
        cout << "subject " << c << ": " << colSum << endl;
    }
    return 0;
}`,
      output: "student 0: 240\nstudent 1: 220\nsubject 0: 130\nsubject 1: 155\nsubject 2: 175\n",
      notes: [
        { line: 5, text: "2 rows (students) × 3 columns (subjects)." },
        { line: 9, text: "Rows outside, columns inside: add across a row." },
        { line: 16, text: "Columns outside, rows inside: add down a column." },
      ],
    },
    quickCheck: {
      prompt: "What is `g[2][0]`?",
      code: r`int g[3][2] = {
    {1, 2},
    {3, 4},
    {5, 6}
};`,
      options: [
        { id: "a", text: "5", feedback: "Yes: row 2 is `{5, 6}`, and column 0 of it is 5." },
        { id: "b", text: "2", feedback: "That's `g[0][1]` — the first index is the row." },
        { id: "c", text: "Out of bounds", feedback: "There are 3 rows (0–2) and 2 columns (0–1), so `[2][0]` is valid." },
      ],
      correct: "a",
      explanation: "The first index selects the row (`{5, 6}` is row 2), the second the column (0 → 5).",
    },
    exercise: {
      title: "Transpose",
      prompt: `Read \`r\` and \`c\` (1 ≤ r, c ≤ 10), then a grid of \`r\` rows with \`c\` numbers each. Print its **transpose**: \`c\` rows of \`r\` numbers, where row \`i\` of the output is column \`i\` of the input.

Separate numbers with single spaces, one row per line.`,
      starterCode: r`#include <iostream>
using namespace std;

int main() {
    int r, c;
    cin >> r >> c;
    int g[10][10];
    // Read the r x c grid, then print its c x r transpose.

    return 0;
}`,
      tests: [
        { label: "2 x 3", input: "2 3\n1 2 3\n4 5 6\n", output: "1 4\n2 5\n3 6", visibility: "sample", category: "normal" },
        { label: "1 x 4 row", input: "1 4\n9 8 7 6\n", output: "9\n8\n7\n6", visibility: "hidden", category: "boundary" },
        { label: "square", input: "3 3\n1 2 3\n4 5 6\n7 8 9\n", output: "1 4 7\n2 5 8\n3 6 9", visibility: "hidden", category: "normal" },
        { label: "single cell", input: "1 1\n-5\n", output: "-5", visibility: "hidden", category: "edge" },
      ],
      compare: "lines",
      hints: [
        "In the output, what does the first line contain — the first row or the first column of the input?",
        "The first column. So the outer loop of your printing should go over columns, the inner over rows.",
        "Read normally with `g[i][j]` (rows outside). For printing: outer `j` from 0 to `c`, inner `i` from 0 to `r`, print `g[i][j]`.",
        "Print a space only **between** numbers (`if (i > 0) cout << ' ';`) and `endl` after each inner loop — this check compares line by line.",
      ],
      solution: r`#include <iostream>
using namespace std;

int main() {
    int r, c;
    cin >> r >> c;
    int g[10][10];
    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) {
            cin >> g[i][j];
        }
    }
    for (int j = 0; j < c; j++) {
        for (int i = 0; i < r; i++) {
            if (i > 0) {
                cout << ' ';
            }
            cout << g[i][j];
        }
        cout << endl;
    }
    return 0;
}`,
      solutionNotes: "Reading uses rows outside; printing swaps the loops so each output line walks down one input column. The `if (i > 0)` puts spaces only between numbers.",
    },
    explainAgain: `A 2D array is a cinema seating chart: "row D, seat 7" is \`seats[3][6]\` (counting from 0). To check every seat, an usher walks one row from left to right, then moves to the next row — the outer loop picks the row, the inner loop walks the seats.

Transposing is turning the chart on its side: the rows become columns.`,
    summary: [
      "`g[r][c]`: the first index is the row, the second the column.",
      "Nested loops visit every cell; the loop order decides row-wise or column-wise.",
      "Use separate limits for rows and columns so non-square grids work.",
    ],
  },

  {
    id: "strings-basics",
    moduleId: "arrays-strings",
    title: "Strings: working with text",
    minutes: 20,
    concepts: ["std::string", "getline", "length", "char", "concatenation"],
    goals: [
      "Reading a word with `cin` and a whole line with `getline`",
      "Visiting the characters of a string like an array",
      "Joining strings and comparing them",
    ],
    intro: `A \`string\` is a sequence of characters — and in many ways it behaves like a \`vector<char>\`: it knows its length, you can index it with \`[]\`, and you can loop over it. That makes text problems feel just like array problems.`,
    sections: [
      {
        title: "Reading text",
        body: `\`\`\`cpp
#include <string>

string word;
cin >> word;            // reads ONE word — stops at a space

string line;
getline(cin, line);     // reads the WHOLE line, spaces included
\`\`\`

If you use \`cin >> x\` and then \`getline\`, the leftover new line from the first read makes \`getline\` return an empty line. Call \`cin.ignore();\` between them, or use only \`getline\`.`,
      },
      {
        title: "Characters and length",
        body: `\`s.length()\` (or \`s.size()\`) is the number of characters, and \`s[i]\` is the character at index \`i\` — a \`char\`, written in single quotes:

\`\`\`cpp
string s = "Hello";
cout << s.length();     // 5
cout << s[0];           // H
if (s[1] == 'e') ...    // compare with a char: single quotes
\`\`\`

Loop over all characters with \`for (int i = 0; i < (int)s.length(); i++)\` or \`for (char ch : s)\`.`,
      },
      {
        title: "Joining and comparing",
        body: `\`+\` joins strings (\`"Code" + string("Mentor")\`), and \`==\`, \`<\` compare them — \`<\` is dictionary order, so \`"apple" < "banana"\`. Uppercase letters come before lowercase ones, so \`"Zebra" < "apple"\` is also true.`,
      },
    ],
    mistakes: [
      { title: "Using cin for a sentence", body: "`cin >> s` with input `hello world` reads only `hello`. Use `getline(cin, s)` for full lines." },
      { title: "Double quotes for a char", body: "`s[0] == \"a\"` compares a char with a string and doesn't compile. A single character uses single quotes: `'a'`." },
      { title: "getline after cin >>", body: "The new line left by `cin >> n` is read by `getline` as an empty line. Add `cin.ignore();` before `getline`." },
    ],
    example: {
      title: "Line statistics",
      intro: "Read a full line and count its characters, spaces and uppercase letters.",
      code: r`#include <iostream>
#include <string>
using namespace std;

int main() {
    string line;
    getline(cin, line);
    int spaces = 0, upper = 0;
    for (char ch : line) {
        if (ch == ' ') spaces++;
        if (ch >= 'A' && ch <= 'Z') upper++;
    }
    cout << "length " << line.length() << endl;
    cout << "spaces " << spaces << endl;
    cout << "capitals " << upper << endl;
    cout << "first word starts with " << line[0] << endl;
    return 0;
}`,
      input: "Learn C++ Every Day\n",
      output: "length 19\nspaces 3\ncapitals 4\nfirst word starts with L\n",
      notes: [
        { line: 7, text: "`getline` keeps the spaces, so the whole sentence is read." },
        { line: 9, text: "`ch` takes each character of `line` in turn." },
        { line: 11, text: "Letters are stored as numbers in order, so a range check finds capitals." },
      ],
    },
    quickCheck: {
      prompt: "The input is `New Delhi`. What does this print?",
      code: r`string city;
cin >> city;
cout << city.length();`,
      options: [
        { id: "a", text: "9", feedback: "That's the full line's length — but `cin >>` stops at the space." },
        { id: "b", text: "3", feedback: "Right: `cin >>` reads only `New`." },
        { id: "c", text: "5", feedback: "That's `Delhi`, the second word, which isn't read." },
      ],
      correct: "b",
      explanation: "`cin >>` reads up to the first space. Use `getline(cin, city)` to read `New Delhi` completely.",
    },
    exercise: {
      title: "Count the vowels",
      prompt: `Read one full line of text (it may contain spaces). Print how many **vowels** it contains — a, e, i, o, u, in **either case**.`,
      starterCode: r`#include <iostream>
#include <string>
using namespace std;

int main() {
    string line;
    // Read the whole line, then count a, e, i, o, u (upper or lower case).

    return 0;
}`,
      tests: [
        { label: "Hello World", input: "Hello World\n", output: "3", visibility: "sample", category: "normal" },
        { label: "capitals", input: "AEIOU aeiou\n", output: "10", visibility: "sample", category: "edge" },
        { label: "no vowels", input: "Rhythm 123\n", output: "0", visibility: "hidden", category: "edge" },
        { label: "sentence", input: "Practice makes progress\n", output: "7", visibility: "hidden", category: "normal" },
      ],
      compare: "tokens",
      hints: [
        "Which reading method keeps the spaces — and does it matter if you lose them here?",
        "Use `getline(cin, line)`: `cin >>` would stop after the first word and miss the rest.",
        "Loop over every `char`. To handle both cases, turn each character into lowercase with `tolower(ch)` (from `<cctype>`) before checking.",
        "`char lc = tolower(ch); if (lc == 'a' || lc == 'e' || lc == 'i' || lc == 'o' || lc == 'u') count++;`",
      ],
      solution: r`#include <iostream>
#include <string>
#include <cctype>
using namespace std;

int main() {
    string line;
    getline(cin, line);
    int count = 0;
    for (char ch : line) {
        char lc = tolower(ch);
        if (lc == 'a' || lc == 'e' || lc == 'i' || lc == 'o' || lc == 'u') {
            count++;
        }
    }
    cout << count << endl;
    return 0;
}`,
      solutionNotes: "`getline` reads every word. Lower-casing each character first means one check covers both `A` and `a`.",
    },
    explainAgain: `A string is a necklace of letter beads. \`length()\` counts the beads, \`s[0]\` is the first bead, and a loop slides your fingers along the necklace one bead at a time.

\`cin >>\` grabs beads only until it reaches a gap (a space); \`getline\` takes the whole necklace.`,
    summary: [
      "`cin >>` reads one word; `getline(cin, s)` reads a full line.",
      "`s.length()` gives the size and `s[i]` a single `char` (single quotes).",
      "Loop over a string exactly like an array to count or check characters.",
    ],
  },

  {
    id: "string-problems",
    moduleId: "arrays-strings",
    title: "String problems: palindromes and C-strings",
    minutes: 20,
    concepts: ["two pointers", "palindrome", "isalpha", "C-style string", "null terminator"],
    goals: [
      "Comparing a string from both ends (two-pointer pattern)",
      "Ignoring characters that don't matter",
      "What C-style `char` arrays are and why `std::string` is safer",
    ],
    intro: `Many string problems come down to **comparing characters from two positions** at once. The classic is the palindrome — a word that reads the same backwards, like \`level\` or \`racecar\`.`,
    sections: [
      {
        title: "Two pointers",
        body: `Keep one index at the start and one at the end, compare, and move them towards each other:

\`\`\`cpp
int i = 0, j = s.length() - 1;
bool same = true;
while (i < j) {
    if (s[i] != s[j]) { same = false; break; }
    i++;
    j--;
}
\`\`\`

The loop stops when they meet in the middle — each pair is checked once.`,
      },
      {
        title: "Ignoring characters",
        body: `Real phrases have spaces, punctuation and capitals: *"Never odd or even"* is a palindrome if you only look at letters. Two common approaches:

- **Clean first:** build a new string containing only the letters you care about, lowercased, then check that.
- **Skip while scanning:** move \`i\` forward / \`j\` backward past characters that aren't letters.

\`isalpha(ch)\`, \`isdigit(ch)\` and \`tolower(ch)\` from \`<cctype>\` do the classification.`,
      },
      {
        title: "C-style strings",
        body: `Before \`std::string\`, text was stored in a \`char\` array ending with a special **null character** \`'\\0'\`:

\`\`\`cpp
char name[6] = "Asha";      // A s h a \0 (and one spare)
\`\`\`

The array must have room for the \`'\\0'\`, functions like \`strlen\` count up to it, and writing past the end corrupts memory. You'll meet C-strings in older code and system APIs — but for your own programs, \`std::string\` manages the size for you.`,
      },
    ],
    mistakes: [
      { title: "Comparing every pair twice", body: "Looping `i` over the whole string compares each pair twice. `while (i < j)` stops in the middle." },
      { title: "Empty string and j", body: "`s.length() - 1` on an empty string is a huge unsigned number. Store the length in an `int` first, or check for empty input." },
      { title: "No room for '\\0'", body: "`char word[4] = \"Asha\";` doesn't compile — the null character needs a fifth slot." },
    ],
    example: {
      title: "Reverse and compare",
      intro: "One simple palindrome check builds the reversed word and compares it with the original.",
      code: r`#include <iostream>
#include <string>
using namespace std;

string reversed(const string& s) {
    string out = "";
    for (int i = (int)s.length() - 1; i >= 0; i--) {
        out += s[i];
    }
    return out;
}

int main() {
    string words[3] = {"level", "code", "noon"};
    for (int k = 0; k < 3; k++) {
        string w = words[k];
        cout << w << " -> " << reversed(w);
        if (w == reversed(w)) {
            cout << " (palindrome)";
        }
        cout << endl;
    }
    return 0;
}`,
      output: "level -> level (palindrome)\ncode -> edoc\nnoon -> noon (palindrome)\n",
      notes: [
        { line: 5, text: "`const string&`: read the word without copying it." },
        { line: 8, text: "`+=` appends one character to the end of `out`." },
        { line: 18, text: "Strings compare with `==` character by character." },
      ],
    },
    quickCheck: {
      prompt: "For `s = \"abca\"`, which pair does the two-pointer loop compare second?",
      code: r`int i = 0, j = 3;
while (i < j) {
    // compare s[i] and s[j]
    i++;
    j--;
}`,
      options: [
        { id: "a", text: "`s[0]` and `s[3]`", feedback: "That's the first comparison." },
        { id: "b", text: "`s[1]` and `s[2]`", feedback: "Right: after one step i = 1 and j = 2 — 'b' versus 'c', which differ." },
        { id: "c", text: "`s[1]` and `s[3]`", feedback: "Both pointers move each step: i goes up and j comes down." },
      ],
      correct: "b",
      explanation: "Each iteration moves `i` forward and `j` backward, so the second pair is (1, 2).",
    },
    exercise: {
      title: "Phrase palindrome",
      prompt: `Read one full line. Ignoring everything except letters and digits, and ignoring upper/lower case, decide whether it reads the same forwards and backwards. Print \`YES\` or \`NO\`.

A line with no letters or digits counts as a palindrome.`,
      starterCode: r`#include <iostream>
#include <string>
#include <cctype>
using namespace std;

int main() {
    string line;
    getline(cin, line);
    // Keep only letters and digits (lowercased), then check from both ends.

    return 0;
}`,
      tests: [
        { label: "racecar", input: "racecar\n", output: "YES", visibility: "sample", category: "normal" },
        { label: "phrase with spaces", input: "Never odd or even\n", output: "YES", visibility: "sample", category: "normal" },
        { label: "not a palindrome", input: "Hello\n", output: "NO", visibility: "hidden", category: "normal" },
        { label: "punctuation", input: "A man, a plan, a canal: Panama!\n", output: "YES", visibility: "hidden", category: "edge" },
        { label: "digits", input: "12321 x 12321\n", output: "YES", visibility: "hidden", category: "boundary" },
        { label: "almost", input: "ab ca\n", output: "NO", visibility: "hidden", category: "boundary" },
      ],
      compare: "tokens",
      hints: [
        "If you removed the spaces and punctuation and lowercased everything, what would the phrase look like?",
        "\"Never odd or even\" becomes \"neveroddoreven\" — then it's the ordinary palindrome check.",
        "Build `clean` with a loop: append `tolower(ch)` only when `isalnum(ch)` is true. Then compare `clean[i]` with `clean[j]` from both ends.",
        "`int i = 0, j = (int)clean.length() - 1; while (i < j) { if (clean[i] != clean[j]) → NO; i++; j--; }` — if the loop finishes, print YES.",
      ],
      solution: r`#include <iostream>
#include <string>
#include <cctype>
using namespace std;

int main() {
    string line;
    getline(cin, line);
    string clean = "";
    for (char ch : line) {
        if (isalnum((unsigned char)ch)) {
            clean += (char)tolower((unsigned char)ch);
        }
    }
    int i = 0, j = (int)clean.length() - 1;
    bool ok = true;
    while (i < j) {
        if (clean[i] != clean[j]) {
            ok = false;
            break;
        }
        i++;
        j--;
    }
    cout << (ok ? "YES" : "NO") << endl;
    return 0;
}`,
      solutionNotes: "Cleaning first turns a messy phrase into a plain palindrome check. Storing the length in an `int` keeps `j` at -1 for an empty `clean`, so the loop simply doesn't run and the answer is YES.",
    },
    explainAgain: `Two pointers are like two friends reading a word from opposite ends, one letter at a time, calling out what they see. As long as they keep calling the same letter, it's a palindrome. The moment they disagree, it isn't. When they meet in the middle, they're done.`,
    summary: [
      "Two pointers compare characters from both ends and meet in the middle.",
      "Clean the text first (letters/digits only, lowercased) when only some characters matter.",
      "C-strings are `char` arrays ending in `'\\0'`; prefer `std::string` in your own code.",
    ],
  },
];
