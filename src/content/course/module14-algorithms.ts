import type { CourseLesson } from "./types";

const r = String.raw;

/** Module 14 — Algorithms and problem solving: the patterns behind most contest and interview problems. */
export const ALGORITHMS_LESSONS: CourseLesson[] = [
  {
    id: "two-pointers-window",
    moduleId: "algorithms",
    title: "Prefix sums, two pointers and sliding windows",
    minutes: 30,
    concepts: ["prefix sums", "two pointers", "sliding window", "brute force to optimisation"],
    goals: [
      "Answering range-sum questions in O(1) with prefix sums",
      "Using two pointers on sorted data instead of checking every pair",
      "Fixed and variable sliding windows over an array",
    ],
    intro: `Many problems ask about **pairs** or **contiguous ranges** of an array. The brute-force answer checks all of them — O(n²) or worse. Three patterns turn most of these into a single O(n) pass: **prefix sums**, **two pointers** and **sliding windows**.`,
    sections: [
      {
        title: "Prefix sums",
        body: `Let \`pre[i]\` be the sum of the first \`i\` elements (\`pre[0] = 0\`). Then the sum of \`a[l..r]\` is \`pre[r + 1] - pre[l]\` — O(1) per query after one O(n) pass.

\`\`\`cpp
vector<long long> pre(n + 1, 0);
for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + a[i];
\`\`\``,
      },
      {
        title: "Two pointers",
        traceId: "two-pointer-reverse",
        body: `On a **sorted** array, find two values that add up to \`target\`: start one pointer at each end. If the sum is too small, the left value must grow → move \`lo\` right; too big → move \`hi\` left. Each step discards a value for good, so it's O(n).`,
      },
      {
        title: "Sliding windows",
        body: `A **window** is a contiguous range \`[l, r]\`. Instead of re-adding every element, update the sum as the window moves: add the element entering on the right, subtract the one leaving on the left.

- **Fixed size k** — slide one step at a time: O(n).
- **Variable size** (e.g. "shortest window with sum ≥ target", all values positive) — grow \`r\`; while the condition holds, record the answer and shrink from \`l\`. Each index enters and leaves once: O(n).`,
      },
    ],
    mistakes: [
      { title: "Off-by-one in prefix sums", body: "With `pre` of size n + 1, the sum of `a[l..r]` is `pre[r + 1] - pre[l]`, not `pre[r] - pre[l]`." },
      { title: "Two pointers on unsorted data", body: "The \"move the smaller side\" logic only works when the array is sorted." },
      { title: "Variable windows with negative numbers", body: "Shrinking the window when the sum is big enough assumes adding elements never decreases it. With negative values this breaks — prefix sums plus a map are needed instead." },
    ],
    example: {
      title: "Three patterns, one array",
      intro: "Range sums from prefix sums, a target pair with two pointers, and the best fixed-size window.",
      code: r`#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {2, 7, 1, 8, 2, 8, 1};
    int n = a.size();
    vector<long long> pre(n + 1, 0);
    for (int i = 0; i < n; i++) {
        pre[i + 1] = pre[i] + a[i];
    }
    cout << "sum a[1..3] = " << pre[4] - pre[1] << endl;
    cout << "sum a[0..6] = " << pre[7] - pre[0] << endl;

    vector<int> s = a;
    sort(s.begin(), s.end());
    int lo = 0, hi = n - 1, target = 10;
    while (lo < hi && s[lo] + s[hi] != target) {
        if (s[lo] + s[hi] < target) {
            lo++;
        } else {
            hi--;
        }
    }
    cout << "pair for 10: " << s[lo] << " + " << s[hi] << endl;

    int k = 3, window = 0;
    for (int i = 0; i < k; i++) {
        window += a[i];
    }
    int best = window, bestStart = 0;
    for (int r = k; r < n; r++) {
        window += a[r] - a[r - k];
        if (window > best) {
            best = window;
            bestStart = r - k + 1;
        }
    }
    cout << "best window of 3: " << best << " (starts at " << bestStart << ")" << endl;
    return 0;
}`,
      output: "sum a[1..3] = 16\nsum a[0..6] = 29\npair for 10: 2 + 8\nbest window of 3: 18 (starts at 3)\n",
      notes: [
        { line: 13, text: "Sum of a[1..3] = pre[3 + 1] − pre[1]: one subtraction." },
        { line: 20, text: "Too small → the left value must grow; too big → the right must shrink." },
        { line: 34, text: "Slide: add the new element, subtract the one that left." },
      ],
    },
    quickCheck: {
      prompt: "With `pre[i]` = sum of the first i elements, which expression is the sum of `a[2..5]`?",
      options: [
        { id: "a", text: "pre[5] - pre[2]", feedback: "That's a[2..4] — it misses a[5]." },
        { id: "b", text: "pre[6] - pre[2]", feedback: "Right: the first 6 elements minus the first 2 leaves indexes 2 to 5." },
        { id: "c", text: "pre[6] - pre[1]", feedback: "That also includes a[1]." },
      ],
      correct: "b",
      explanation: "Sum of a[l..r] = pre[r + 1] − pre[l].",
    },
    exercise: {
      title: "Shortest window reaching a target",
      prompt: `Read \`n\` and \`target\`, then \`n\` **positive** whole numbers. Print the **length of the shortest contiguous range** whose sum is **at least** \`target\`, or \`0\` if no range reaches it.

Aim for a single O(n) pass with a variable sliding window.`,
      starterCode: r`#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    long long target;
    cin >> n >> target;
    vector<long long> a(n);
    for (auto& x : a) {
        cin >> x;
    }
    // Grow the window on the right; while its sum >= target, record the length and shrink from the left.

    return 0;
}`,
      tests: [
        { label: "classic", input: "6 7\n2 3 1 2 4 3\n", output: "2", visibility: "sample", category: "normal" },
        { label: "impossible", input: "3 100\n1 2 3\n", output: "0", visibility: "sample", category: "edge" },
        { label: "single element enough", input: "5 5\n5 1 1 1 1\n", output: "1", visibility: "hidden", category: "boundary" },
        { label: "needs most of the array", input: "8 15\n1 2 3 4 5 1 1 1\n", output: "5", visibility: "hidden", category: "normal" },
        { label: "whole array", input: "11 11\n1 1 1 1 1 1 1 1 1 1 1\n", output: "11", visibility: "hidden", category: "boundary" },
      ],
      compare: "tokens",
      hints: [
        "Once a window's sum is at least the target, why is it pointless to extend it further to the right?",
        "Any longer window starting at the same `l` is worse. So record the length, then try to shrink from the left.",
        "Keep `l = 0`, `sum = 0`. For each `r`: `sum += a[r]`; `while (sum >= target) { best = min(best, r - l + 1); sum -= a[l]; l++; }`.",
        "Start `best` at a value larger than any length (e.g. `n + 1`) and print `0` if it never changed.",
      ],
      solution: r`#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    long long target;
    cin >> n >> target;
    vector<long long> a(n);
    for (auto& x : a) {
        cin >> x;
    }
    int best = n + 1;
    long long sum = 0;
    int l = 0;
    for (int r = 0; r < n; r++) {
        sum += a[r];
        while (sum >= target) {
            if (r - l + 1 < best) {
                best = r - l + 1;
            }
            sum -= a[l];
            l++;
        }
    }
    cout << (best == n + 1 ? 0 : best) << endl;
    return 0;
}`,
      solutionNotes: "Each index is added once (as `r`) and removed at most once (as `l`), so the nested-looking `while` is O(n) overall. It relies on all values being positive: shrinking can only lower the sum.",
    },
    explainAgain: `A sliding window is like reading a long scroll through a cardboard frame. You don't re-read everything each time you move the frame — one new line appears at the bottom, one old line disappears at the top. Prefix sums are page totals written in the margin: the total of pages 3–7 is "total up to 7" minus "total up to 2".`,
    summary: [
      "Prefix sums answer range sums in O(1): `pre[r + 1] - pre[l]`.",
      "Two pointers on sorted data find pairs in O(n) by discarding one value per step.",
      "Sliding windows update a running value as the range moves; variable windows need positive values.",
    ],
  },

  {
    id: "greedy",
    moduleId: "algorithms",
    title: "Greedy algorithms",
    minutes: 25,
    concepts: ["greedy", "activity selection", "exchange argument", "counterexample"],
    goals: [
      "What a greedy algorithm is: take the locally best choice, never undo it",
      "Classic greedy problems: making change, scheduling the most meetings",
      "Why a greedy rule must be justified — and how a counterexample breaks it",
    ],
    intro: `A **greedy** algorithm builds an answer one step at a time, always taking what looks best *right now*, and never reconsidering. When it works it is simple and fast. The catch: it doesn't always work, so every greedy rule needs a reason.`,
    sections: [
      {
        title: "When greedy works",
        body: `**Making change with Indian notes and coins** (1, 2, 5, 10, 20, 50, 100, 200, 500): repeatedly take the largest denomination that fits. For these values that always uses the fewest pieces.

**Scheduling meetings in one room** (as many as possible, none overlapping): sort by **end time** and take each meeting that starts after the last chosen one ends. Finishing earliest leaves the most room for everything else — swapping any optimal solution's first meeting for the earliest-ending one never makes it worse (an *exchange argument*).`,
      },
      {
        title: "When greedy fails",
        body: `With coins {1, 3, 4}, making 6 greedily gives 4 + 1 + 1 (3 coins) but 3 + 3 uses only 2. The "largest first" rule isn't safe for every coin system — that problem needs dynamic programming (next lessons).

Before trusting a greedy rule, look for a small counterexample. If you can't find one, try to argue *why* the greedy choice is never worse than the alternative.`,
      },
    ],
    mistakes: [
      { title: "Sorting by the wrong key", body: "For meetings, sorting by start time or by length both fail on simple cases; sorting by end time is the one that's provably right." },
      { title: "Assuming greedy is optimal", body: "Greedy often looks right on the examples given. Test it against a brute force on small random inputs." },
      { title: "Touching endpoints", body: "Decide whether a meeting ending at 3 and one starting at 3 conflict. Here they don't (`start >= lastEnd`)." },
    ],
    example: {
      title: "Change for 376 — and a coin system where greedy fails",
      intro: "Greedy change with Indian denominations, then the same rule on {1, 3, 4}.",
      code: r`#include <iostream>
#include <vector>
using namespace std;

vector<int> greedyChange(const vector<int>& coins, int amount) {
    vector<int> used;
    for (int i = (int)coins.size() - 1; i >= 0; i--) {
        while (amount >= coins[i]) {
            amount -= coins[i];
            used.push_back(coins[i]);
        }
    }
    return used;
}

int main() {
    vector<int> rupees = {1, 2, 5, 10, 20, 50, 100, 200, 500};
    vector<int> used = greedyChange(rupees, 376);
    cout << "376 =";
    for (int c : used) {
        cout << " " << c;
    }
    cout << " (" << used.size() << " pieces)" << endl;
    vector<int> odd = {1, 3, 4};
    cout << "greedy for 6 with {1,3,4}: " << greedyChange(odd, 6).size() << " coins, but 3 + 3 needs 2" << endl;
    return 0;
}`,
      output: "376 = 200 100 50 20 5 1 (6 pieces)\ngreedy for 6 with {1,3,4}: 3 coins, but 3 + 3 needs 2\n",
      notes: [
        { line: 7, text: "Largest denomination first (the list is sorted ascending)." },
        { line: 8, text: "Take it as many times as it fits — a choice that is never undone." },
        { line: 24, text: "Same rule, different coins: no longer optimal." },
      ],
    },
    quickCheck: {
      prompt: "Meetings [1,4), [3,5), [0,6), [5,7), [3,9), [5,9), [6,10), [8,11). Greedy by earliest end picks first…",
      options: [
        { id: "a", text: "[0,6)", feedback: "It starts earliest, but ends late and blocks a lot." },
        { id: "b", text: "[1,4)", feedback: "Right: it ends earliest (at 4), leaving the most time for the rest." },
        { id: "c", text: "[3,5)", feedback: "Short, but [1,4) ends earlier." },
      ],
      correct: "b",
      explanation: "The earliest-ending meeting is always a safe first choice; then repeat on what's left.",
    },
    exercise: {
      title: "Most meetings in one room",
      prompt: `Read \`n\`, then \`n\` meetings as \`start end\` (a meeting occupies \`[start, end)\`, so one ending at 3 and another starting at 3 do **not** clash). Print the **maximum number of meetings** that can be held in one room.`,
      starterCode: r`#include <algorithm>
#include <iostream>
#include <utility>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<pair<int, int>> m(n);
    for (auto& [s, e] : m) {
        cin >> s >> e;
    }
    // Sort by end time, then take every meeting that starts at or after the last chosen end.

    return 0;
}`,
      tests: [
        { label: "five meetings", input: "5\n1 3\n2 5\n3 9\n6 8\n8 10\n", output: "3", visibility: "sample", category: "normal" },
        { label: "one long meeting vs short ones", input: "4\n1 10\n2 3\n4 5\n6 7\n", output: "3", visibility: "hidden", category: "normal" },
        { label: "identical meetings", input: "3\n1 2\n1 2\n1 2\n", output: "1", visibility: "hidden", category: "edge" },
        { label: "single meeting", input: "1\n0 5\n", output: "1", visibility: "hidden", category: "boundary" },
        { label: "back to back, unsorted", input: "5\n5 6\n1 2\n2 3\n3 4\n4 5\n", output: "5", visibility: "hidden", category: "boundary" },
      ],
      compare: "tokens",
      hints: [
        "Which meeting is always safe to choose first?",
        "The one that ends earliest — it leaves the most time for the others.",
        "Sort by end time (`sort` with a lambda comparing `.second`), keep `lastEnd`, and count meetings with `start >= lastEnd`.",
        "Start `lastEnd` below every start time (e.g. `INT_MIN` or -1 if times are non-negative); after taking a meeting, set `lastEnd = end`.",
      ],
      solution: r`#include <algorithm>
#include <iostream>
#include <utility>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<pair<int, int>> m(n);
    for (auto& [s, e] : m) {
        cin >> s >> e;
    }
    sort(m.begin(), m.end(), [](const pair<int, int>& a, const pair<int, int>& b) {
        return a.second < b.second;
    });
    int count = 0;
    long long lastEnd = -1000000000LL;
    for (const auto& [s, e] : m) {
        if (s >= lastEnd) {
            count++;
            lastEnd = e;
        }
    }
    cout << count << endl;
    return 0;
}`,
      solutionNotes: "Sorting is O(n log n) and the scan is O(n). The \"one long meeting\" test shows why sorting by start time fails: [1,10) starts first but blocks three short meetings.",
    },
    explainAgain: `Greedy is packing a day planner by always choosing the activity that frees you up soonest. It's like eating at a buffet by always grabbing the nearest tasty dish: often fine, but sometimes you fill up before reaching the best food. A greedy rule needs a reason it can't paint you into a corner.`,
    summary: [
      "Greedy takes the locally best choice at each step and never undoes it.",
      "Scheduling by earliest end time and change-making with standard currency are provably optimal.",
      "Always look for a counterexample; when greedy fails (e.g. coins {1,3,4}), use dynamic programming.",
    ],
  },

  {
    id: "backtracking",
    moduleId: "algorithms",
    title: "Backtracking",
    minutes: 30,
    concepts: ["backtracking", "recursion", "search tree", "permutations", "combinations", "pruning"],
    goals: [
      "Exploring every possibility with choose → explore → un-choose",
      "Generating permutations and combinations in order",
      "Pruning: abandoning a branch as soon as it can't lead to a valid answer",
    ],
    intro: `Some problems have no clever shortcut: you must try possibilities — every arrangement, every subset, every way to place pieces on a board. **Backtracking** does this systematically with recursion: make a choice, explore everything that follows from it, then undo the choice and try the next.`,
    sections: [
      {
        title: "Choose, explore, un-choose",
        body: `\`\`\`cpp
void permute(string& cur, vector<bool>& used, const string& letters) {
    if (cur.size() == letters.size()) { cout << cur << "\\n"; return; }  // complete
    for (int i = 0; i < (int)letters.size(); i++) {
        if (used[i]) continue;
        used[i] = true; cur.push_back(letters[i]);    // choose
        permute(cur, used, letters);                  // explore
        cur.pop_back(); used[i] = false;              // un-choose
    }
}
\`\`\`

The calls form a **search tree**: each level is one decision. Undoing the choice restores the state exactly, so the next branch starts clean.`,
      },
      {
        title: "Pruning",
        body: `Backtracking is exponential — n! permutations, 2ⁿ subsets — so it's only usable for small n (about 10–20). **Pruning** makes it practical: stop exploring a branch as soon as it's invalid. In the **N-Queens** puzzle, a queen is placed row by row, and a placement attacking an earlier queen is rejected immediately instead of after filling the whole board.`,
      },
    ],
    mistakes: [
      { title: "Forgetting to un-choose", body: "If `used[i] = false` or `pop_back()` is missing, later branches see leftovers from earlier ones and the output is wrong." },
      { title: "No base case", body: "The recursion must stop when the answer is complete (or impossible), or it runs forever." },
      { title: "Using it for large n", body: "20! is about 2.4 × 10¹⁸. Check the constraints: large n calls for DP or greedy instead." },
    ],
    example: {
      title: "Permutations and N-Queens",
      intro: "All orderings of \"abc\" in alphabetical order, then the number of ways to place 6 non-attacking queens.",
      code: r`#include <iostream>
#include <string>
#include <vector>
using namespace std;

void permute(string& cur, vector<bool>& used, const string& letters) {
    if (cur.size() == letters.size()) {
        cout << cur << " ";
        return;
    }
    for (int i = 0; i < (int)letters.size(); i++) {
        if (used[i]) {
            continue;
        }
        used[i] = true;
        cur.push_back(letters[i]);
        permute(cur, used, letters);
        cur.pop_back();
        used[i] = false;
    }
}

int queens(int row, int n, vector<int>& colOf) {
    if (row == n) {
        return 1;
    }
    int ways = 0;
    for (int c = 0; c < n; c++) {
        bool safe = true;
        for (int r = 0; r < row; r++) {
            if (colOf[r] == c || row - r == c - colOf[r] || row - r == colOf[r] - c) {
                safe = false;
                break;
            }
        }
        if (safe) {
            colOf[row] = c;
            ways += queens(row + 1, n, colOf);
        }
    }
    return ways;
}

int main() {
    string cur;
    vector<bool> used(3, false);
    permute(cur, used, "abc");
    cout << endl;
    vector<int> colOf(6);
    cout << "6-queens solutions: " << queens(0, 6, colOf) << endl;
    return 0;
}`,
      output: "abc acb bac bca cab cba \n6-queens solutions: 4\n",
      notes: [
        { line: 7, text: "Base case: a complete arrangement." },
        { line: 15, text: "Choose a letter that isn't used yet…" },
        { line: 17, text: "…explore everything after that choice…" },
        { line: 18, text: "…then undo it so the next branch starts clean." },
        { line: 31, text: "Pruning: same column or same diagonal as an earlier queen." },
      ],
    },
    quickCheck: {
      prompt: "How many leaves (complete arrangements) does the permutation search tree for 4 distinct letters have?",
      options: [
        { id: "a", text: "16", feedback: "That's 4², but each level has one fewer choice." },
        { id: "b", text: "24", feedback: "Right: 4 × 3 × 2 × 1 = 4! = 24." },
        { id: "c", text: "10", feedback: "That's the number of 2-element combinations of 5." },
      ],
      correct: "b",
      explanation: "4 choices for the first letter, 3 for the second, 2, then 1: 4! = 24.",
    },
    exercise: {
      title: "All combinations",
      prompt: `Read \`n\` and \`k\` (1 ≤ k ≤ n ≤ 10). Print every way to choose \`k\` different numbers from \`1 … n\`, each as increasing numbers separated by spaces, one per line, in **lexicographic order** (\`1 2\` before \`1 3\` before \`2 3\`).`,
      starterCode: r`#include <iostream>
#include <vector>
using namespace std;

void choose(int start, int n, int k, vector<int>& cur) {
    // If cur has k numbers, print them. Otherwise try each next number from start to n.
}

int main() {
    int n, k;
    cin >> n >> k;
    vector<int> cur;
    choose(1, n, k, cur);
    return 0;
}`,
      tests: [
        { label: "4 choose 2", input: "4 2\n", output: "1 2\n1 3\n1 4\n2 3\n2 4\n3 4", visibility: "sample", category: "normal" },
        { label: "choose all", input: "3 3\n", output: "1 2 3", visibility: "hidden", category: "boundary" },
        { label: "choose one", input: "5 1\n", output: "1\n2\n3\n4\n5", visibility: "hidden", category: "boundary" },
        { label: "5 choose 3", input: "5 3\n", output: "1 2 3\n1 2 4\n1 2 5\n1 3 4\n1 3 5\n1 4 5\n2 3 4\n2 3 5\n2 4 5\n3 4 5", visibility: "hidden", category: "normal" },
      ],
      compare: "lines",
      hints: [
        "Why does the next number only need to be tried from `start` upwards?",
        "Numbers in a combination are increasing, so after choosing x, the next one must be > x. That avoids duplicates like `2 1`.",
        "Base case: `cur.size() == k` → print and return. Otherwise `for (int x = start; x <= n; x++) { cur.push_back(x); choose(x + 1, n, k, cur); cur.pop_back(); }`.",
        "Print with a space only between numbers so each line matches exactly (this check compares line by line).",
      ],
      solution: r`#include <iostream>
#include <vector>
using namespace std;

void choose(int start, int n, int k, vector<int>& cur) {
    if ((int)cur.size() == k) {
        for (int i = 0; i < k; i++) {
            if (i > 0) {
                cout << ' ';
            }
            cout << cur[i];
        }
        cout << endl;
        return;
    }
    for (int x = start; x <= n; x++) {
        cur.push_back(x);
        choose(x + 1, n, k, cur);
        cur.pop_back();
    }
}

int main() {
    int n, k;
    cin >> n >> k;
    vector<int> cur;
    choose(1, n, k, cur);
    return 0;
}`,
      solutionNotes: "Choose (`push_back`), explore (`choose(x + 1, …)`), un-choose (`pop_back`). Starting the next choice at `x + 1` both keeps each line increasing and produces lexicographic order for free.",
    },
    explainAgain: `Backtracking is solving a maze by trying a corridor, and if it dead-ends, walking back to the last junction and trying the next corridor. "Un-choose" is walking back. Pruning is noticing a corridor is blocked from the entrance and not walking down it at all.`,
    summary: [
      "Backtracking = choose, explore recursively, un-choose — exploring a search tree.",
      "It is exponential, so it suits small inputs; pruning cuts invalid branches early.",
      "Ordering choices carefully (e.g. increasing) avoids duplicates and gives sorted output.",
    ],
  },

  {
    id: "dynamic-programming",
    moduleId: "algorithms",
    title: "Dynamic programming",
    minutes: 35,
    concepts: ["dynamic programming", "overlapping subproblems", "memoization", "tabulation", "state", "coin change"],
    goals: [
      "Spotting overlapping subproblems in a recursive solution",
      "Memoization (top-down) and tabulation (bottom-up)",
      "Designing a DP: state, transition, base case — coin change as the worked case",
    ],
    intro: `Recursive Fibonacci recomputes the same values again and again: \`fib(20)\` makes over 20 000 calls. **Dynamic programming (DP)** stores each subproblem's answer the first time and reuses it, turning exponential time into linear. It is the tool for problems where greedy fails — like the coins {1, 3, 4}.`,
    sections: [
      {
        title: "Memoization: remember answers",
        body: `\`\`\`cpp
vector<long long> memo(n + 1, -1);
long long fib(int n) {
    if (n <= 1) return n;
    if (memo[n] != -1) return memo[n];        // already solved
    return memo[n] = fib(n - 1) + fib(n - 2); // solve once, store
}
\`\`\`

Same recursion, plus a table. Each \`fib(k)\` is computed once: O(n).`,
      },
      {
        title: "Tabulation: fill a table bottom-up",
        traceId: "fibonacci-dp",
        body: `Instead of recursing from the top, fill the table from the smallest subproblem upwards:

\`\`\`cpp
vector<long long> ways(n + 1);
ways[0] = 1; ways[1] = 1;                     // stairs: 1 or 2 steps at a time
for (int i = 2; i <= n; i++) ways[i] = ways[i - 1] + ways[i - 2];
\`\`\`

No recursion, no stack-depth limit, and often easy to optimise memory.`,
      },
      {
        title: "Designing a DP",
        body: `1. **State** — what does \`dp[x]\` mean? For coin change: *the fewest coins that make amount x*.
2. **Transition** — how does it follow from smaller states? \`dp[x] = 1 + min(dp[x - c])\` over coins \`c ≤ x\`.
3. **Base case** — \`dp[0] = 0\`.
4. **Order** — compute x = 1, 2, … so smaller amounts are ready first.

Amounts that can't be made stay at "infinity"; the answer is \`dp[amount]\`. Time O(amount × coins).`,
      },
    ],
    mistakes: [
      { title: "No clear state definition", body: "Write down in words what `dp[i]` means before coding. Most DP bugs are a fuzzy state." },
      { title: "Wrong fill order", body: "Tabulation must compute every state a transition reads before it's needed." },
      { title: "Overflow from \"infinity\"", body: "`INT_MAX + 1` overflows. Use a large-but-safe value (e.g. `1e9`) or check before adding." },
    ],
    example: {
      title: "Counting the calls DP saves",
      intro: "Plain recursion versus memoization for fib(20), then a bottom-up stairs table.",
      code: r`#include <iostream>
#include <vector>
using namespace std;

long long naiveCalls = 0, memoCalls = 0;
vector<long long> memo(21, -1);

long long fibNaive(int n) {
    naiveCalls++;
    if (n <= 1) {
        return n;
    }
    return fibNaive(n - 1) + fibNaive(n - 2);
}

long long fibMemo(int n) {
    memoCalls++;
    if (n <= 1) {
        return n;
    }
    if (memo[n] != -1) {
        return memo[n];
    }
    return memo[n] = fibMemo(n - 1) + fibMemo(n - 2);
}

int main() {
    cout << "fib(20) = " << fibNaive(20) << " with " << naiveCalls << " calls" << endl;
    cout << "fib(20) = " << fibMemo(20) << " with " << memoCalls << " calls" << endl;
    vector<long long> ways(7);
    ways[0] = 1;
    ways[1] = 1;
    for (int i = 2; i <= 6; i++) {
        ways[i] = ways[i - 1] + ways[i - 2];
    }
    cout << "ways to climb 1..6 stairs:";
    for (int i = 1; i <= 6; i++) {
        cout << " " << ways[i];
    }
    cout << endl;
    return 0;
}`,
      output: "fib(20) = 6765 with 21891 calls\nfib(20) = 6765 with 39 calls\nways to climb 1..6 stairs: 1 2 3 5 8 13\n",
      notes: [
        { line: 13, text: "Two recursive calls per call, recomputing the same values." },
        { line: 21, text: "Solved before? Return the stored answer immediately." },
        { line: 34, text: "Bottom-up: each entry uses two already-filled entries." },
      ],
    },
    quickCheck: {
      prompt: "For coin change, `dp[x]` = fewest coins to make x. With coins {1, 3, 4}, what is `dp[6]`?",
      options: [
        { id: "a", text: "3", feedback: "That's the greedy answer 4 + 1 + 1. Try 1 + dp[6 − 3]." },
        { id: "b", text: "2", feedback: "Right: dp[3] = 1, so dp[6] = 1 + dp[3] = 2 (3 + 3)." },
        { id: "c", text: "6", feedback: "That's using only 1s — DP takes the minimum over all coins." },
      ],
      correct: "b",
      explanation: "dp[6] = 1 + min(dp[5], dp[3], dp[2]) = 1 + min(2, 1, 2) = 2.",
    },
    exercise: {
      title: "Fewest coins",
      prompt: `Read \`c\` and \`amount\` (0 ≤ amount ≤ 10 000), then \`c\` coin values. Using each coin value **as many times as you like**, print the **fewest coins** that add up to exactly \`amount\`, or \`-1\` if it's impossible.

(Greedy is wrong here — e.g. coins {1, 3, 4} and amount 6.)`,
      starterCode: r`#include <iostream>
#include <vector>
using namespace std;

int main() {
    int c, amount;
    cin >> c >> amount;
    vector<int> coins(c);
    for (auto& x : coins) {
        cin >> x;
    }
    // dp[x] = fewest coins that make x. dp[0] = 0; unreachable amounts stay "infinite".

    return 0;
}`,
      tests: [
        { label: "greedy trap", input: "3 6\n1 3 4\n", output: "2", visibility: "sample", category: "normal" },
        { label: "impossible", input: "1 3\n2\n", output: "-1", visibility: "sample", category: "edge" },
        { label: "amount 0", input: "3 0\n1 2 5\n", output: "0", visibility: "hidden", category: "boundary" },
        { label: "classic 11", input: "3 11\n1 2 5\n", output: "3", visibility: "hidden", category: "normal" },
        { label: "large amount", input: "2 9999\n2 7\n", output: "1432", visibility: "hidden", category: "boundary" },
        { label: "awkward coins", input: "4 10000\n7 13 29 37\n", output: "272", visibility: "hidden", category: "normal" },
      ],
      compare: "tokens",
      hints: [
        "If you knew the best answer for every smaller amount, how would you get the answer for `x`?",
        "The last coin used is some `c`. Then the rest is `x - c`, so `dp[x] = 1 + min over coins of dp[x - c]`.",
        "Make `vector<int> dp(amount + 1, INF)` with `INF = 1e9`, set `dp[0] = 0`, and fill x = 1 … amount, skipping coins larger than x and states that are still INF.",
        "Answer: `dp[amount] >= INF ? -1 : dp[amount]`.",
      ],
      solution: r`#include <iostream>
#include <vector>
using namespace std;

int main() {
    int c, amount;
    cin >> c >> amount;
    vector<int> coins(c);
    for (auto& x : coins) {
        cin >> x;
    }
    const int INF = 1000000000;
    vector<int> dp(amount + 1, INF);
    dp[0] = 0;
    for (int x = 1; x <= amount; x++) {
        for (int coin : coins) {
            if (coin <= x && dp[x - coin] != INF && dp[x - coin] + 1 < dp[x]) {
                dp[x] = dp[x - coin] + 1;
            }
        }
    }
    cout << (dp[amount] >= INF ? -1 : dp[amount]) << endl;
    return 0;
}`,
      solutionNotes: "State `dp[x]`, transition over the last coin, base `dp[0] = 0`, increasing order. O(amount × c) time and O(amount) memory — 40 000 steps for the largest test.",
    },
    explainAgain: `DP is doing homework with a notebook of solved problems. Before solving a sub-question, you check the notebook; if it's there, you copy the answer instead of working it out again. Memoization fills the notebook as questions come up; tabulation fills it page by page from the easiest question.`,
    summary: [
      "DP applies when a problem breaks into overlapping subproblems.",
      "Memoization caches recursive results; tabulation fills a table bottom-up.",
      "Define the state in words, then the transition, base case and fill order.",
    ],
  },

  {
    id: "bits-number-theory",
    moduleId: "algorithms",
    title: "Bit manipulation and number theory",
    minutes: 30,
    concepts: ["binary", "bitwise operators", "power of two", "gcd", "lcm", "modular arithmetic", "sieve of Eratosthenes"],
    goals: [
      "Reading and changing individual bits with `&`, `|`, `^`, `<<`, `>>`",
      "Euclid's GCD, LCM and modular exponentiation",
      "Finding all primes up to n with the Sieve of Eratosthenes",
    ],
    intro: `Two toolkits that appear in almost every programming contest: **bits** (integers are just rows of 0s and 1s you can manipulate directly) and **number theory** (divisibility, primes and remainders, done efficiently).`,
    sections: [
      {
        title: "Bitwise operators",
        body: `| expression | meaning |
|---|---|
| \`x & y\` | 1 where both have 1 |
| \`x \\| y\` | 1 where either has 1 |
| \`x ^ y\` | 1 where they differ |
| \`x << k\` | shift left: multiply by 2ᵏ |
| \`(x >> i) & 1\` | the value of bit i |

Tricks: \`x & (x - 1)\` clears the lowest set bit, so \`x > 0 && (x & (x - 1)) == 0\` tests for a **power of two**. Looping \`x &= x - 1\` until 0 counts the set bits.`,
      },
      {
        title: "GCD, LCM and modular arithmetic",
        traceId: "gcd-48-18",
        body: `**Euclid:** \`gcd(a, b) = gcd(b, a % b)\`, and \`gcd(a, 0) = a\` — O(log) steps. Then \`lcm(a, b) = a / gcd(a, b) * b\` (divide first to avoid overflow). C++17 has \`std::gcd\` and \`std::lcm\` in \`<numeric>\`.

Answers are often asked "modulo 1 000 000 007" to keep numbers small. \`(a + b) % m\` and \`(a * b) % m\` can be reduced at every step. **Fast power** squares the base and halves the exponent: \`aᵇ mod m\` in O(log b).`,
      },
      {
        title: "Sieve of Eratosthenes",
        body: `To find all primes up to n, start with every number marked prime; for each prime \`p\` (from 2 while \`p * p <= n\`), cross out \`p*p, p*p + p, …\`. What remains is prime. O(n log log n) — n = 10⁶ takes milliseconds, far faster than testing each number separately.`,
      },
    ],
    mistakes: [
      { title: "Precedence of bitwise operators", body: "`x & 1 == 0` means `x & (1 == 0)`. Always bracket: `(x & 1) == 0`." },
      { title: "Overflow in a * b % m", body: "With `int`, `a * b` overflows before `%` is applied. Use `long long` (and keep a, b below m)." },
      { title: "Shifting by too much", body: "`1 << 31` overflows an int and `1 << 40` is undefined. Use `1LL << k` for k ≥ 31." },
    ],
    example: {
      title: "Bits, gcd and a small sieve",
      intro: "Inspect the bits of 13, test powers of two, compute gcd/lcm and a modular power, and sieve primes to 30.",
      code: r`#include <iostream>
#include <vector>
using namespace std;

long long gcdOf(long long a, long long b) {
    while (b != 0) {
        long long t = a % b;
        a = b;
        b = t;
    }
    return a;
}

long long powMod(long long base, long long exp, long long mod) {
    long long result = 1;
    base %= mod;
    while (exp > 0) {
        if (exp & 1) {
            result = result * base % mod;
        }
        base = base * base % mod;
        exp >>= 1;
    }
    return result;
}

int main() {
    int x = 13;
    cout << "13 in binary: ";
    for (int i = 3; i >= 0; i--) {
        cout << ((x >> i) & 1);
    }
    int bits = 0;
    for (int y = x; y > 0; y &= y - 1) {
        bits++;
    }
    cout << " (" << bits << " ones)" << endl;
    for (int v : {16, 18}) {
        cout << v << (v > 0 && (v & (v - 1)) == 0 ? " is" : " is not") << " a power of two" << endl;
    }
    cout << "gcd(12, 18) = " << gcdOf(12, 18) << ", lcm = " << 12 / gcdOf(12, 18) * 18 << endl;
    cout << "2^10 mod 1000 = " << powMod(2, 10, 1000) << endl;
    int n = 30;
    vector<bool> prime(n + 1, true);
    prime[0] = prime[1] = false;
    for (int p = 2; p * p <= n; p++) {
        if (prime[p]) {
            for (int m = p * p; m <= n; m += p) {
                prime[m] = false;
            }
        }
    }
    cout << "primes to 30:";
    for (int i = 2; i <= n; i++) {
        if (prime[i]) {
            cout << " " << i;
        }
    }
    cout << endl;
    return 0;
}`,
      output: "13 in binary: 1101 (3 ones)\n16 is a power of two\n18 is not a power of two\ngcd(12, 18) = 6, lcm = 36\n2^10 mod 1000 = 24\nprimes to 30: 2 3 5 7 11 13 17 19 23 29\n",
      notes: [
        { line: 6, text: "Euclid: replace (a, b) by (b, a % b) until b is 0." },
        { line: 18, text: "Odd exponent: multiply one copy of the base into the result." },
        { line: 34, text: "`y &= y - 1` removes one set bit per step." },
        { line: 48, text: "Cross out multiples starting from p², the first not already crossed out." },
      ],
    },
    quickCheck: {
      prompt: "What is `12 & 10`? (12 = 1100₂, 10 = 1010₂)",
      options: [
        { id: "a", text: "8", feedback: "Right: only the 8s bit is 1 in both → 1000₂ = 8." },
        { id: "b", text: "14", feedback: "That's `12 | 10` (bits set in either)." },
        { id: "c", text: "6", feedback: "That's `12 ^ 10` (bits that differ)." },
      ],
      correct: "a",
      explanation: "AND keeps a bit only where both numbers have it: 1100 & 1010 = 1000.",
    },
    exercise: {
      title: "Count the primes",
      prompt: `Read \`n\` (2 ≤ n ≤ 1 000 000). Print the **number of primes ≤ n** and the **largest prime ≤ n**, separated by a space.

Use the Sieve of Eratosthenes — the largest test has n = 1 000 000.`,
      starterCode: r`#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    // Sieve: mark every number prime, then cross out multiples of each prime p, starting at p * p.

    return 0;
}`,
      tests: [
        { label: "n = 10", input: "10\n", output: "4 7", visibility: "sample", category: "normal" },
        { label: "n = 2", input: "2\n", output: "1 2", visibility: "sample", category: "boundary" },
        { label: "n = 30", input: "30\n", output: "10 29", visibility: "hidden", category: "normal" },
        { label: "n = 100", input: "100\n", output: "25 97", visibility: "hidden", category: "normal" },
        { label: "n = 1 000 000", input: "1000000\n", output: "78498 999983", visibility: "hidden", category: "boundary" },
      ],
      compare: "tokens",
      hints: [
        "Instead of testing each number for primality, which numbers can you rule out all at once?",
        "Every multiple of a prime p (other than p) is composite. Cross them out in a `vector<bool>`.",
        "`vector<bool> prime(n + 1, true); prime[0] = prime[1] = false; for (int p = 2; (long long)p * p <= n; p++) if (prime[p]) for (int m = p * p; m <= n; m += p) prime[m] = false;`",
        "Then loop i = 2 … n: count the primes and remember the last one seen.",
      ],
      solution: r`#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<bool> prime(n + 1, true);
    prime[0] = false;
    prime[1] = false;
    for (int p = 2; (long long)p * p <= n; p++) {
        if (prime[p]) {
            for (int m = p * p; m <= n; m += p) {
                prime[m] = false;
            }
        }
    }
    int count = 0, largest = 0;
    for (int i = 2; i <= n; i++) {
        if (prime[i]) {
            count++;
            largest = i;
        }
    }
    cout << count << " " << largest << endl;
    return 0;
}`,
      solutionNotes: "Starting the inner loop at p² is safe because smaller multiples of p were already crossed out by smaller primes. The `(long long)p * p` guard avoids overflow for very large n.",
    },
    explainAgain: `Bits are a row of light switches: \`&\` keeps a light on only if it's on in both rows, \`|\` if it's on in either, \`^\` if they differ, and shifting slides the whole row. The sieve is a classroom roll call where each prime student stands up and says "everyone whose roll number is a multiple of mine, sit down" — whoever is left standing is prime.`,
    summary: [
      "Bitwise operators work on individual bits; bracket them in comparisons.",
      "Euclid's algorithm gives gcd in O(log); fast power computes aᵇ mod m in O(log b).",
      "The sieve finds all primes up to n in about O(n log log n).",
    ],
  },
];
