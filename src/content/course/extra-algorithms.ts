import type { CourseLesson } from "./types";
import { practice, starter, T } from "./practice/helpers";

const r = String.raw;

/** New lessons for Module 14 (algorithms) and Module 15 (files, exceptions, debugging). */
export const EXTRA_ALGORITHMS_LESSONS: CourseLesson[] = [
  // ── Module 14 ─────────────────────────────────────────────────────────────
  {
    id: "divide-and-conquer",
    moduleId: "algorithms",
    after: "backtracking",
    title: "Divide and conquer",
    minutes: 20,
    concepts: ["divide and conquer", "recurrence", "fast exponentiation", "maximum subarray"],
    goals: [
      "Split a problem into smaller copies, solve them, and combine the answers",
      "Compute powers in O(log n) by halving the exponent",
      "Solve maximum subarray by combining left, right and crossing answers",
    ],
    intro: `Merge sort and binary search share a pattern: cut the problem into smaller copies of itself, solve those, then **combine**. When the pieces are much smaller (usually halves), the total work drops dramatically.`,
    sections: [
      {
        title: "Three steps",
        body: `1. **Divide** — split the input (often in half).
2. **Conquer** — solve each piece recursively; tiny pieces are base cases.
3. **Combine** — build the full answer from the pieces' answers.

If each level does O(n) combining work and there are log n levels, the total is O(n log n). If the combine is O(1) and only one piece is needed (binary search), it's O(log n).`,
      },
      {
        title: "Fast exponentiation",
        body: `\`\`\`cpp
long long power(long long a, long long n, long long mod) {
    if (n == 0) return 1 % mod;
    long long half = power(a, n / 2, mod);   // solve one smaller problem
    long long res = half * half % mod;        // combine
    if (n % 2 == 1) res = res * (a % mod) % mod;
    return res;
}
\`\`\`

a¹⁰⁰⁰⁰⁰⁰⁰⁰⁰ takes about 30 multiplications instead of a billion.`,
      },
      {
        title: "Maximum subarray, divided",
        body: `The best subarray of a range is either entirely in the left half, entirely in the right half, or **crosses the middle**. The crossing one is the best suffix of the left half plus the best prefix of the right half — found in O(n). (Kadane's algorithm solves this in O(n) too; the divide-and-conquer version shows the combine idea.)`,
      },
    ],
    mistakes: [
      { title: "Recomputing the same half twice", body: "`power(a, n/2) * power(a, n/2)` makes two calls per level — back to O(n). Store the half result." },
      { title: "Missing the crossing case", body: "Most combine bugs forget answers that span both halves." },
      { title: "Overflow before the modulo", body: "Reduce after every multiplication: (x * y) % mod with x, y < mod fits in long long when mod ≈ 10⁹." },
    ],
    example: {
      title: "Counting multiplications",
      intro: "Fast power versus a simple loop for the same answer.",
      code: r`#include <iostream>
using namespace std;

int mults = 0;

long long fastPow(long long a, int n) {
    if (n == 0) return 1;
    long long half = fastPow(a, n / 2);
    long long res = half * half;
    mults++;
    if (n % 2 == 1) { res *= a; mults++; }
    return res;
}

int main() {
    long long slow = 1;
    for (int i = 0; i < 40; i++) slow *= 2;
    cout << slow << " with 40 multiplications" << endl;
    long long fast = fastPow(2, 40);
    cout << fast << " with " << mults << " multiplications" << endl;
    return 0;
}`,
      output: "1099511627776 with 40 multiplications\n1099511627776 with 8 multiplications\n",
      notes: [
        { line: 8, text: "Solve the half-sized problem once." },
        { line: 9, text: "Combine: square it." },
        { line: 11, text: "An odd exponent needs one extra factor." },
      ],
    },
    quickCheck: {
      prompt: "Why is `return power(a, n/2) * power(a, n/2);` slow?",
      options: [
        { id: "a", text: "It makes two recursive calls per level, so the work doubles each level", feedback: "Right — that's O(n) calls in total. Compute the half once and square it." },
        { id: "b", text: "Multiplication is slow", feedback: "The problem is the number of calls, not each multiplication." },
        { id: "c", text: "It isn't slow", feedback: "It does about n calls: as slow as a loop." },
      ],
      correct: "a",
      explanation: "Divide and conquer only pays off if repeated subproblems are solved once.",
    },
    exercise: {
      title: "Maximum subarray by divide and conquer",
      prompt: `Read \`n\` and n whole numbers (at least one). Print the largest sum of a non-empty contiguous subarray, computed with a divide-and-conquer function \`best(lo, hi)\` that combines the left answer, the right answer and the best crossing sum.`,
      starterCode: r`#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

vector<long long> a;

// long long best(int lo, int hi)  — inclusive range

int main() {
    int n;
    cin >> n;
    a.resize(n);
    for (auto& x : a) cin >> x;
    // print best(0, n - 1)

    return 0;
}`,
      tests: [
        { label: "sample", input: "9\n-2 1 -3 4 -1 2 1 -5 4\n", output: "6", visibility: "sample", category: "normal" },
        { label: "all negative", input: "3\n-8 -3 -5\n", output: "-3", visibility: "hidden", category: "edge" },
        { label: "single", input: "1\n7\n", output: "7", visibility: "hidden", category: "boundary" },
        { label: "whole array", input: "4\n2 -1 2 3\n", output: "6", visibility: "hidden", category: "normal" },
      ],
      compare: "lines",
      hints: [
        "Base case: lo == hi returns a[lo].",
        "mid = (lo + hi) / 2; recurse on [lo, mid] and [mid + 1, hi].",
        "Crossing: walk left from mid keeping the best suffix sum, and right from mid + 1 keeping the best prefix sum.",
        "Return the max of the three.",
      ],
      solution: r`#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

vector<long long> a;

long long best(int lo, int hi) {
    if (lo == hi) return a[lo];
    int mid = (lo + hi) / 2;
    long long leftBest = best(lo, mid), rightBest = best(mid + 1, hi);
    long long sum = 0, suffix = a[mid];
    for (int i = mid; i >= lo; i--) { sum += a[i]; suffix = max(suffix, sum); }
    sum = 0;
    long long prefix = a[mid + 1];
    for (int i = mid + 1; i <= hi; i++) { sum += a[i]; prefix = max(prefix, sum); }
    return max({leftBest, rightBest, suffix + prefix});
}

int main() {
    int n;
    cin >> n;
    a.resize(n);
    for (auto& x : a) cin >> x;
    cout << best(0, n - 1) << endl;
    return 0;
}`,
      solutionNotes: "Each level scans its ranges once (O(n)) and there are log n levels: O(n log n). The crossing sum must include a[mid] and a[mid + 1], which is why both start from those elements.",
    },
    practice: practice(
      {
        title: "Modular power",
        prompt: `For each line \`a n\` (0 ≤ a ≤ 10¹⁸, 0 ≤ n ≤ 10¹⁸) until the input ends, print aⁿ mod 1 000 000 007 using recursive fast exponentiation.`,
        starterCode: starter("Implement power(a, n) recursively with mod 1e9+7", "long long a, n;", ["iostream"], "const long long MOD = 1000000007;"),
        tests: [
          T("sample", "2 10\n3 0\n", "1024\n1", "sample"),
          T("big exponent", "2 1000000006\n", "1", "visible"),
          T("big base", "1000000000000000000 2\n", "2401", "hidden", "edge"),
          T("zero base", "0 5\n0 0\n", "0\n1", "hidden", "edge"),
        ],
        compare: "lines",
        hints: [
          "Reduce a modulo MOD first.",
          "power(a, 0) = 1.",
          "half = power(a, n / 2); result = half * half % MOD.",
          "If n is odd, multiply once more by a.",
        ],
        solution: r`#include <iostream>
using namespace std;

const long long MOD = 1000000007;

long long power(long long a, long long n) {
    if (n == 0) return 1;
    long long half = power(a, n / 2);
    long long res = half * half % MOD;
    if (n % 2 == 1) res = res * a % MOD;
    return res;
}

int main() {
    long long a, n;
    while (cin >> a >> n) {
        cout << power(a % MOD, n) << endl;
    }
    return 0;
}`,
        solutionNotes: "Only about 60 levels of recursion for n = 10¹⁸. 2^(p−1) ≡ 1 (mod p) for the prime p = 10⁹ + 7 (Fermat's little theorem) — a handy self-check.",
      },
      {
        title: "Fibonacci in O(log n)",
        prompt: `For each \`n\` (0 ≤ n ≤ 10¹⁸) until the input ends, print F(n) mod 1 000 000 007, where F(0) = 0, F(1) = 1. Use fast exponentiation of the matrix [[1, 1], [1, 0]]: its n-th power is [[F(n+1), F(n)], [F(n), F(n−1)]].`,
        starterCode: starter("Square-and-multiply a 2x2 matrix modulo 1e9+7", "long long n;", ["iostream", "array"], "const long long MOD = 1000000007;\nusing Mat = array<array<long long, 2>, 2>;"),
        tests: [
          T("sample", "0\n1\n10\n", "0\n1\n55", "sample"),
          T("ninety", "90\n", "210345902", "visible"),
          T("huge", "1000000000000000000\n", "209783453", "hidden", "edge"),
          T("two", "2\n", "1", "hidden", "boundary"),
        ],
        compare: "lines",
        hints: [
          "Write mul(A, B) for 2×2 matrices, reducing every entry mod MOD.",
          "matPow(M, n): identity for n = 0; otherwise square the half power, times M if n is odd.",
          "Answer: matPow([[1,1],[1,0]], n)[0][1].",
          "Each multiplication is 8 products — fine for 60 levels.",
        ],
        solution: r`#include <iostream>
#include <array>
using namespace std;

const long long MOD = 1000000007;
using Mat = array<array<long long, 2>, 2>;

Mat mul(const Mat& A, const Mat& B) {
    Mat C{};
    for (int i = 0; i < 2; i++)
        for (int j = 0; j < 2; j++)
            for (int k = 0; k < 2; k++)
                C[i][j] = (C[i][j] + A[i][k] * B[k][j]) % MOD;
    return C;
}

Mat matPow(const Mat& M, long long n) {
    if (n == 0) return Mat{{{1, 0}, {0, 1}}};
    Mat half = matPow(M, n / 2);
    Mat res = mul(half, half);
    if (n % 2 == 1) res = mul(res, M);
    return res;
}

int main() {
    long long n;
    Mat base{{{1, 1}, {1, 0}}};
    while (cin >> n) {
        cout << matPow(base, n)[0][1] << endl;
    }
    return 0;
}`,
        solutionNotes: "The same halving trick works for anything you can multiply associatively — numbers, matrices, even permutations.",
      },
    ),
    explainAgain: `To count the people in a stadium, give each half to a different friend, who splits their half again, and so on, until each person counts one row. Then everybody adds up the two numbers they get back. Splitting is quick, and the adding happens in a few rounds instead of one person walking past every seat.`,
    summary: [
      "Divide, conquer recursively, combine.",
      "Halving gives log n levels: O(log n) for one branch, O(n log n) with linear combining.",
      "Solve each subproblem once; don't forget answers that cross the split.",
    ],
  },

  {
    id: "more-dp",
    moduleId: "algorithms",
    after: "dynamic-programming",
    title: "More DP: knapsack and longest increasing subsequence",
    minutes: 25,
    concepts: ["0/1 knapsack", "1D DP table", "LIS", "patience sorting", "edit distance"],
    goals: [
      "Solve 0/1 knapsack with a DP over capacities",
      "Find the longest increasing subsequence in O(n²) and O(n log n)",
      "Define states and transitions for two-string problems",
    ],
    intro: `Dynamic programming is "remember answers to smaller questions". The hard part is choosing **what** to remember — the state. These three classics each teach a reusable shape of state.`,
    sections: [
      {
        title: "0/1 knapsack",
        body: `Items have weight w and value v; the bag holds capacity W; each item is used at most once.

State: \`dp[c]\` = best value with total weight ≤ c using the items seen so far.

\`\`\`cpp
for (each item (w, v))
    for (int c = W; c >= w; c--)          // backwards!
        dp[c] = max(dp[c], dp[c - w] + v);
\`\`\`

Iterating capacities **downwards** ensures each item is used once (going upwards would allow reusing it — the unbounded knapsack). O(n·W).`,
      },
      {
        title: "Longest increasing subsequence",
        body: `O(n²): \`len[i]\` = longest increasing subsequence ending at i = 1 + max(len[j]) over j < i with a[j] < a[i].

O(n log n): keep \`tails[k]\` = the smallest possible last value of an increasing subsequence of length k + 1. For each x, replace the first tail ≥ x (\`lower_bound\`), or append if none. The number of tails is the answer.`,
      },
      {
        title: "Two strings: edit distance",
        body: `\`dp[i][j]\` = edits to turn the first i letters of A into the first j letters of B. If A[i−1] == B[j−1], dp[i][j] = dp[i−1][j−1]; otherwise 1 + min(insert, delete, replace). Many string DPs (LCS, diff tools, spell checkers) use this grid.`,
      },
    ],
    mistakes: [
      { title: "Forward loop in 0/1 knapsack", body: "Going c = w … W lets one item be picked repeatedly." },
      { title: "upper_bound vs lower_bound in LIS", body: "Strictly increasing uses lower_bound; non-decreasing uses upper_bound." },
      { title: "Thinking tails is the subsequence", body: "tails has the right length but isn't necessarily a real subsequence." },
    ],
    example: {
      title: "Knapsack and LIS side by side",
      intro: "Both classics on tiny inputs.",
      code: r`#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int W = 7;
    vector<pair<int, int>> items = {{3, 4}, {4, 5}, {2, 3}};
    vector<int> dp(W + 1, 0);
    for (auto [w, v] : items)
        for (int c = W; c >= w; c--)
            dp[c] = max(dp[c], dp[c - w] + v);
    cout << "knapsack: " << dp[W] << endl;
    vector<int> a = {3, 1, 4, 1, 5, 9, 2, 6};
    vector<int> tails;
    for (int x : a) {
        auto it = lower_bound(tails.begin(), tails.end(), x);
        if (it == tails.end()) tails.push_back(x);
        else *it = x;
    }
    cout << "LIS length: " << tails.size() << endl;
    return 0;
}`,
      output: "knapsack: 9\nLIS length: 4\n",
      notes: [
        { line: 10, text: "Capacities go downwards so each item is used at most once." },
        { line: 12, text: "Best of: skip the item, or take it." },
        { line: 16, text: "The first tail ≥ x gets replaced by a smaller ending." },
      ],
    },
    quickCheck: {
      prompt: "In 0/1 knapsack with a 1D dp array, what happens if the capacity loop goes upwards (c = w … W)?",
      options: [
        { id: "a", text: "Items can be used more than once", feedback: "Right — dp[c − w] may already include this item. That's the unbounded knapsack." },
        { id: "b", text: "Nothing changes", feedback: "Try it on a single item of weight 1 and capacity 3." },
        { id: "c", text: "It runs out of memory", feedback: "Memory is the same; the answer is wrong." },
      ],
      correct: "a",
      explanation: "The loop direction decides whether dp[c − w] is from the previous item set or the current one.",
    },
    exercise: {
      title: "Pack the bag",
      prompt: `Read \`n\` items and capacity \`W\` (W ≤ 100 000), then n lines \`weight value\`. Print the maximum total value with total weight ≤ W, each item used at most once.`,
      starterCode: r`#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n, W;
    cin >> n >> W;
    // 1D DP over capacities, looping downwards

    return 0;
}`,
      tests: [
        { label: "sample", input: "3 7\n3 4\n4 5\n2 3\n", output: "9", visibility: "sample", category: "normal" },
        { label: "nothing fits", input: "2 1\n2 10\n3 20\n", output: "0", visibility: "hidden", category: "edge" },
        { label: "use once", input: "1 10\n1 5\n", output: "5", visibility: "hidden", category: "edge" },
        { label: "greedy fails", input: "3 10\n6 30\n5 20\n5 20\n", output: "40", visibility: "hidden", category: "normal" },
      ],
      compare: "lines",
      hints: [
        "vector<long long> dp(W + 1, 0).",
        "For each item, loop c from W down to its weight.",
        "dp[c] = max(dp[c], dp[c − w] + v).",
        "The answer is dp[W].",
      ],
      solution: r`#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n, W;
    cin >> n >> W;
    vector<long long> dp(W + 1, 0);
    for (int i = 0; i < n; i++) {
        int w;
        long long v;
        cin >> w >> v;
        for (int c = W; c >= w; c--) dp[c] = max(dp[c], dp[c - w] + v);
    }
    cout << dp[W] << endl;
    return 0;
}`,
      solutionNotes: "The last test shows why greedy (best value per weight first) fails: taking the 6-weight item blocks the better pair of 5s.",
    },
    practice: practice(
      {
        title: "LIS for big inputs",
        prompt: `Read \`n\` (up to 200 000) and the numbers. Print the length of the longest **strictly** increasing subsequence, using the O(n log n) tails method.`,
        starterCode: starter("Maintain tails with lower_bound", "int n;\ncin >> n;\nvector<long long> a(n);\nfor (auto& x : a) cin >> x;", ["iostream", "vector", "algorithm"]),
        tests: [
          T("sample", "8\n3 1 4 1 5 9 2 6\n", "4", "sample"),
          T("decreasing", "4\n4 3 2 1\n", "1", "visible", "edge"),
          T("equal values", "4\n2 2 2 2\n", "1", "hidden", "edge"),
          T("increasing", "5\n1 2 3 4 5\n", "5", "hidden", "boundary"),
        ],
        hints: [
          "tails starts empty.",
          "For each x: it = lower_bound(tails, x).",
          "If it is end, push x; otherwise *it = x.",
          "lower_bound (not upper_bound) because equal values don't extend a strictly increasing run.",
        ],
        solution: r`#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<long long> a(n);
    for (auto& x : a) cin >> x;
    vector<long long> tails;
    for (long long x : a) {
        auto it = lower_bound(tails.begin(), tails.end(), x);
        if (it == tails.end()) tails.push_back(x);
        else *it = x;
    }
    cout << tails.size() << endl;
    return 0;
}`,
        solutionNotes: "tails stays sorted, so each step is a binary search: O(n log n) overall versus O(n²) for the simple DP.",
      },
      {
        title: "Edit distance",
        prompt: `For each pair of lowercase words \`A B\` (one pair per line, until the input ends; lengths ≤ 1000), print the minimum number of single-letter insertions, deletions and replacements to turn A into B.`,
        starterCode: starter("dp[i][j] over prefixes of A and B", "string A, B;", ["iostream", "string", "vector", "algorithm"]),
        tests: [
          T("sample", "kitten sitting\nflaw lawn\n", "3\n2", "sample"),
          T("same", "abc abc\n", "0", "visible", "edge"),
          T("into nothing", "abc x\n", "3", "hidden", "edge"),
          T("intention", "intention execution\n", "5", "hidden"),
        ],
        compare: "lines",
        hints: [
          "dp[i][0] = i (delete everything); dp[0][j] = j (insert everything).",
          "If A[i−1] == B[j−1]: dp[i][j] = dp[i−1][j−1].",
          "Otherwise 1 + min(dp[i−1][j] (delete), dp[i][j−1] (insert), dp[i−1][j−1] (replace)).",
          "The answer is dp[|A|][|B|].",
        ],
        solution: r`#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    string A, B;
    while (cin >> A >> B) {
        size_t n = A.size(), m = B.size();
        vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));
        for (size_t i = 0; i <= n; i++) dp[i][0] = i;
        for (size_t j = 0; j <= m; j++) dp[0][j] = j;
        for (size_t i = 1; i <= n; i++)
            for (size_t j = 1; j <= m; j++) {
                if (A[i - 1] == B[j - 1]) dp[i][j] = dp[i - 1][j - 1];
                else dp[i][j] = 1 + min({dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]});
            }
        cout << dp[n][m] << endl;
    }
    return 0;
}`,
        solutionNotes: "Each cell depends on three neighbours above and to the left. O(|A|·|B|) time — about a million steps for 1000-letter words.",
      },
    ),
    explainAgain: `DP is a notebook of small answers. For packing a bag, the notebook page for "capacity 5" says the best value you can fit into 5 kg so far. Each new item asks: "Is it better to skip me, or to take me and use the best answer for the space that's left?"`,
    summary: [
      "0/1 knapsack: dp over capacity, looping downwards; O(n·W).",
      "LIS: O(n²) with len[i], or O(n log n) with tails + lower_bound.",
      "Two-sequence problems use a grid dp[i][j] over prefixes.",
    ],
  },

  {
    id: "choosing-approach",
    moduleId: "algorithms",
    after: "bits-number-theory",
    title: "Choosing an approach from constraints",
    minutes: 20,
    concepts: ["problem patterns", "binary search on the answer", "prefix sums with hashing", "bitmask brute force"],
    goals: [
      "Map common problem shapes to the techniques you've learned",
      "Use n to rule approaches in or out before coding",
      "Apply binary search on the answer to optimisation problems",
    ],
    intro: `Most problems are a familiar technique in disguise. Reading the constraints and asking the right questions — "is n tiny?", "is the answer monotonic?", "do I need sums of ranges?" — usually leads straight to it.`,
    sections: [
      {
        title: "Clues to techniques",
        body: `| If the problem… | Try |
| --- | --- |
| has n ≤ 20 and asks about subsets | bitmask brute force, O(2ⁿ · n) |
| asks for many range sums | prefix sums |
| counts subarrays with a given sum | prefix sums + hash map |
| asks for the minimum X such that something is possible, and bigger X is always fine | binary search on the answer |
| has shortest paths, unit weights | BFS; weighted → Dijkstra |
| has overlapping subproblems | DP |
| has "pick the locally best" that provably works | greedy (and try to break it with an example!) |
| merges groups | DSU |`,
      },
      {
        title: "Binary search on the answer",
        body: `"What's the smallest capacity that ships all packages in D days?" Checking one capacity is easy (simulate, O(n)), and if capacity C works, C + 1 works too. So binary search over C:

\`\`\`cpp
long long lo = maxItem, hi = totalSum;
while (lo < hi) {
    long long mid = lo + (hi - lo) / 2;
    if (feasible(mid)) hi = mid; else lo = mid + 1;
}
\`\`\`

O(n log(sum)).`,
      },
      {
        title: "Brute force first",
        body: `Write the obvious solution first, even if it's slow. It's your reference to test the clever one against — and sometimes the constraints say it's already fast enough.`,
      },
    ],
    mistakes: [
      { title: "Using a clever technique when brute force fits", body: "If n ≤ 20, 2²⁰ ≈ 10⁶ subsets is instant." },
      { title: "Binary searching a non-monotonic condition", body: "It only works if \"feasible\" switches from false to true exactly once." },
      { title: "Trusting greedy without proof", body: "Look for a counter-example before committing." },
    ],
    example: {
      title: "Subarrays that sum to k",
      intro: "Prefix sums plus a hash map turn an O(n²) count into O(n).",
      code: r`#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

int main() {
    vector<int> a = {1, 2, 3, -2, 2, 1};
    int k = 3;
    unordered_map<long long, int> seen;
    seen[0] = 1;
    long long prefix = 0, count = 0;
    for (int x : a) {
        prefix += x;
        if (seen.count(prefix - k)) count += seen[prefix - k];
        seen[prefix]++;
    }
    cout << count << endl;
    return 0;
}`,
      output: "5\n",
      notes: [
        { line: 10, text: "The empty prefix has sum 0." },
        { line: 14, text: "A subarray ending here sums to k when an earlier prefix equals prefix − k." },
      ],
    },
    quickCheck: {
      prompt: "n ≤ 18 and you must check every way to split items into two groups. Approach?",
      options: [
        { id: "a", text: "Try all 2¹⁸ ≈ 262 000 bitmasks", feedback: "Yes — tiny n means brute force is fine." },
        { id: "b", text: "Dijkstra", feedback: "There's no graph here." },
        { id: "c", text: "It's impossible to do in time", feedback: "262 000 × 18 steps is a few million — instant." },
      ],
      correct: "a",
      explanation: "Small n is the problem setter telling you exponential search is allowed.",
    },
    exercise: {
      title: "Ship within D days",
      prompt: `Packages with weights \`w₁…wₙ\` must be shipped **in order**; each day the ship carries a prefix of the remaining packages with total weight ≤ capacity C. Read \`n D\` and the weights; print the minimum C that ships everything within D days. Use binary search on C with a greedy feasibility check.`,
      starterCode: r`#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

// bool feasible(const vector<long long>& w, long long C, int D)

int main() {
    int n, D;
    cin >> n >> D;
    vector<long long> w(n);
    for (auto& x : w) cin >> x;
    // binary search between max(w) and sum(w)

    return 0;
}`,
      tests: [
        { label: "sample", input: "10 5\n1 2 3 4 5 6 7 8 9 10\n", output: "15", visibility: "sample", category: "normal" },
        { label: "one day", input: "3 1\n3 2 2\n", output: "7", visibility: "hidden", category: "boundary" },
        { label: "a day each", input: "3 3\n3 2 2\n", output: "3", visibility: "hidden", category: "boundary" },
        { label: "uneven", input: "6 3\n3 2 2 4 1 4\n", output: "6", visibility: "hidden", category: "normal" },
      ],
      compare: "lines",
      hints: [
        "feasible: fill each day greedily; start a new day when the next package doesn't fit.",
        "Count days; feasible if days <= D.",
        "lo = largest single package, hi = total weight.",
        "while (lo < hi): mid; if feasible(mid) hi = mid else lo = mid + 1.",
      ],
      solution: r`#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>
using namespace std;

bool feasible(const vector<long long>& w, long long C, int D) {
    int days = 1;
    long long load = 0;
    for (long long x : w) {
        if (load + x > C) {
            days++;
            load = 0;
        }
        load += x;
    }
    return days <= D;
}

int main() {
    int n, D;
    cin >> n >> D;
    vector<long long> w(n);
    for (auto& x : w) cin >> x;
    long long lo = *max_element(w.begin(), w.end());
    long long hi = accumulate(w.begin(), w.end(), 0LL);
    while (lo < hi) {
        long long mid = lo + (hi - lo) / 2;
        if (feasible(w, mid, D)) hi = mid;
        else lo = mid + 1;
    }
    cout << lo << endl;
    return 0;
}`,
      solutionNotes: "The answer space is monotonic — any capacity above a working one also works — so binary search finds the boundary in about log₂(total) checks.",
    },
    practice: practice(
      {
        title: "Count subarrays with sum k",
        prompt: `Read \`n k\` (n up to 200 000) and the numbers (may be negative). Print how many contiguous non-empty subarrays sum to exactly k. O(n²) is too slow — use prefix sums and a hash map.`,
        starterCode: starter("Count earlier prefixes equal to prefix - k", "int n;\nlong long k;\ncin >> n >> k;", ["iostream", "unordered_map"]),
        tests: [
          T("sample", "6 3\n1 2 3 -2 2 1\n", "5", "sample"),
          T("zeros", "3 0\n0 0 0\n", "6", "visible", "edge"),
          T("none", "3 10\n1 2 3\n", "0", "hidden", "edge"),
          T("negatives", "4 -1\n-1 1 -1 1\n", "3", "hidden"),
        ],
        hints: [
          "seen[0] = 1 for the empty prefix.",
          "For each x: prefix += x; count += seen[prefix − k]; seen[prefix]++.",
          "Use find or count to avoid inserting zeros for missing keys (optional).",
          "Use long long for the count: it can reach n²/2.",
        ],
        solution: r`#include <iostream>
#include <unordered_map>
using namespace std;

int main() {
    int n;
    long long k;
    cin >> n >> k;
    unordered_map<long long, long long> seen;
    seen.reserve(2 * n + 1);
    seen[0] = 1;
    long long prefix = 0, count = 0;
    for (int i = 0; i < n; i++) {
        long long x;
        cin >> x;
        prefix += x;
        auto it = seen.find(prefix - k);
        if (it != seen.end()) count += it->second;
        seen[prefix]++;
    }
    cout << count << endl;
    return 0;
}`,
        solutionNotes: "sum(i..j) = prefix[j] − prefix[i−1], so \"sum equals k\" becomes \"an earlier prefix equals prefix − k\" — a hash map lookup.",
      },
      {
        title: "Fair split (n ≤ 20)",
        prompt: `Read \`n\` (1 ≤ n ≤ 20) item values. Split them into two groups (each item in exactly one group, a group may be empty) to minimise the absolute difference of their sums. Print the minimum difference and the number of bitmasks that achieve it.`,
        starterCode: starter("Try all 2^n masks: group A = items whose bit is set", "int n;\ncin >> n;\nvector<long long> v(n);\nfor (auto& x : v) cin >> x;", ["iostream", "vector", "cstdlib", "climits"]),
        tests: [
          T("sample", "4\n1 6 11 5\n", "1 4", "sample"),
          T("single", "1\n7\n", "7 2", "visible", "boundary"),
          T("perfect", "4\n1 2 3 4\n", "0 2", "hidden"),
          T("equal pair", "2\n5 5\n", "0 2", "hidden", "edge"),
        ],
        hints: [
          "Loop mask from 0 to (1 << n) − 1.",
          "Sum the items whose bit is set; the other group is total − that sum.",
          "diff = |total − 2·sumA|.",
          "Track the best diff and how many masks reach it (each split is counted from both sides).",
        ],
        solution: r`#include <iostream>
#include <vector>
#include <cstdlib>
#include <climits>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<long long> v(n);
    for (auto& x : v) cin >> x;
    long long total = 0;
    for (long long x : v) total += x;
    long long best = LLONG_MAX, ways = 0;
    for (int mask = 0; mask < (1 << n); mask++) {
        long long a = 0;
        for (int i = 0; i < n; i++)
            if (mask & (1 << i)) a += v[i];
        long long diff = llabs(total - 2 * a);
        if (diff < best) { best = diff; ways = 1; }
        else if (diff == best) ways++;
    }
    cout << best << " " << ways << endl;
    return 0;
}`,
        solutionNotes: "2²⁰ × 20 ≈ 2×10⁷ steps: comfortably fast. Every split appears twice (a mask and its complement), which is why the counts are even.",
      },
    ),
    explainAgain: `Constraints are the problem setter's hint. Tiny n whispers "brute force is fine". A million elements says "one or two passes". "Find the smallest X that works" with "bigger X always works" says "binary search the answer". Match the clue to the tool before you start building.`,
    summary: [
      "Read n first: it limits which complexities are possible.",
      "Learn the pattern table: subsets → bitmasks, range sums → prefix sums, monotonic feasibility → binary search on the answer.",
      "A brute-force reference makes clever solutions testable.",
    ],
  },

  // ── Module 15 ─────────────────────────────────────────────────────────────
  {
    id: "paths-filesystem",
    moduleId: "files-exceptions",
    after: "streams-parsing",
    title: "std::filesystem",
    minutes: 20,
    concepts: ["std::filesystem::path", "directory iteration", "path components", "normalisation"],
    goals: [
      "Know what `std::filesystem` offers: paths, directory listing, file metadata",
      "Split paths into parent, filename, stem and extension",
      "Normalise paths with `.` and `..` — practised with string processing",
    ],
    intro: `C++17 added \`<filesystem>\`: a portable way to build paths, list folders, check whether files exist and read their sizes. CodeMentor's sandbox has no file system access, so this lesson shows the real API as reading, and you practise the *path logic* — the part that causes most bugs — with plain strings.`,
    sections: [
      {
        title: "The real API (to use on your own computer)",
        body: `\`\`\`cpp
#include <filesystem>
namespace fs = std::filesystem;

fs::path p = "/home/asha/notes/todo.txt";
p.parent_path();   // "/home/asha/notes"
p.filename();      // "todo.txt"
p.stem();          // "todo"
p.extension();     // ".txt"
fs::path q = p.parent_path() / "done.txt";   // operator/ joins paths

if (fs::exists(q)) cout << fs::file_size(q);
for (const auto& entry : fs::directory_iterator("/home/asha/notes"))
    cout << entry.path().filename() << "\n";
fs::create_directories("out/reports");
\`\`\`

Filesystem calls can fail (missing folder, no permission); they throw \`fs::filesystem_error\` unless you pass a \`std::error_code\`.`,
      },
      {
        title: "Path pieces",
        body: `| Path | parent | filename | stem | extension |
| --- | --- | --- | --- | --- |
| \`/a/b/report.pdf\` | \`/a/b\` | \`report.pdf\` | \`report\` | \`.pdf\` |
| \`archive.tar.gz\` | (empty) | \`archive.tar.gz\` | \`archive.tar\` | \`.gz\` |
| \`.bashrc\` | (empty) | \`.bashrc\` | \`.bashrc\` | (empty) |

The extension is from the **last** dot — and a leading dot (hidden file) doesn't count.`,
      },
      {
        title: "Normalising",
        body: `\`/a/./b/../c\` means \`/a/c\`: \`.\` is "this folder", \`..\` is "go up one". Splitting on \`/\` and using a stack of folder names resolves it. The real API offers \`p.lexically_normal()\`.`,
      },
    ],
    mistakes: [
      { title: "Joining paths with +", body: "\"dir\" + \"file\" gives \"dirfile\". fs::path's / inserts the separator." },
      { title: "Hard-coding '\\\\' or '/'", body: "fs::path handles the platform's separator for you." },
      { title: "Ignoring errors", body: "A folder can vanish between exists() and opening it. Handle exceptions or error codes." },
    ],
    example: {
      title: "Splitting a path by hand",
      intro: "What parent_path, filename, stem and extension compute.",
      code: r`#include <iostream>
#include <string>
using namespace std;

int main() {
    string p = "/home/asha/notes/archive.tar.gz";
    size_t slash = p.rfind('/');
    string parent = slash == string::npos ? "" : p.substr(0, slash);
    string filename = slash == string::npos ? p : p.substr(slash + 1);
    size_t dot = filename.rfind('.');
    string stem = filename, ext = "";
    if (dot != string::npos && dot != 0) {
        stem = filename.substr(0, dot);
        ext = filename.substr(dot);
    }
    cout << "parent:    " << parent << endl;
    cout << "filename:  " << filename << endl;
    cout << "stem:      " << stem << endl;
    cout << "extension: " << ext << endl;
    return 0;
}`,
      output: "parent:    /home/asha/notes\nfilename:  archive.tar.gz\nstem:      archive.tar\nextension: .gz\n",
      notes: [
        { line: 7, text: "The last separator splits folder from file name." },
        { line: 10, text: "The extension starts at the last dot." },
        { line: 12, text: "A dot at position 0 is a hidden file, not an extension." },
      ],
    },
    quickCheck: {
      prompt: "What is the extension of `.gitignore`?",
      options: [
        { id: "a", text: "Empty — a leading dot marks a hidden file", feedback: "Right: filesystem::path agrees; the stem is \".gitignore\"." },
        { id: "b", text: "\".gitignore\"", feedback: "That's the filename and the stem." },
        { id: "c", text: "\"gitignore\"", feedback: "Extensions include their dot, and this file has none." },
      ],
      correct: "a",
      explanation: "A filename that starts with a dot and has no other dot has no extension.",
    },
    exercise: {
      title: "Path inspector",
      prompt: `For each path (one per line, until the input ends), print \`parent|filename|stem|extension\` following the rules above (use an empty field where a part is missing). Paths use \`/\` and don't end with \`/\`.`,
      starterCode: r`#include <iostream>
#include <string>
using namespace std;

int main() {
    string p;
    while (getline(cin, p)) {
        // split into the four parts and print them separated by |
    }
    return 0;
}`,
      tests: [
        { label: "sample", input: "/a/b/report.pdf\narchive.tar.gz\n", output: "/a/b|report.pdf|report|.pdf\n|archive.tar.gz|archive.tar|.gz", visibility: "sample", category: "normal" },
        { label: "hidden file", input: "/home/x/.bashrc\n", output: "/home/x|.bashrc|.bashrc|", visibility: "hidden", category: "edge" },
        { label: "no extension", input: "src/Makefile\n", output: "src|Makefile|Makefile|", visibility: "hidden", category: "edge" },
        { label: "root file", input: "/notes.txt\n", output: "|notes.txt|notes|.txt", visibility: "hidden", category: "boundary" },
      ],
      compare: "lines",
      hints: [
        "slash = p.rfind('/').",
        "parent = everything before it; filename = everything after it (or all of p if there's no slash).",
        "dot = filename.rfind('.'); it's an extension only if dot != npos and dot != 0.",
        "For \"/notes.txt\", the parent is the part before position 0: empty.",
      ],
      solution: r`#include <iostream>
#include <string>
using namespace std;

int main() {
    string p;
    while (getline(cin, p)) {
        size_t slash = p.rfind('/');
        string parent = slash == string::npos ? "" : p.substr(0, slash);
        string filename = slash == string::npos ? p : p.substr(slash + 1);
        size_t dot = filename.rfind('.');
        string stem = filename, ext;
        if (dot != string::npos && dot != 0) {
            stem = filename.substr(0, dot);
            ext = filename.substr(dot);
        }
        cout << parent << "|" << filename << "|" << stem << "|" << ext << endl;
    }
    return 0;
}`,
      solutionNotes: "This is what fs::path does internally for these cases. (The real parent_path of \"/notes.txt\" is \"/\" — the root is kept — one of the subtleties the library handles for you.)",
    },
    practice: practice(
      {
        title: "Normalise a path",
        prompt: `For each absolute path (starting with \`/\`) until the input ends, print its normal form: remove empty parts and \`.\`, let \`..\` go up one level (never above the root), join with single slashes. The root alone is \`/\`.`,
        starterCode: starter("Split on '/', keep a vector of folder names as a stack", "string p;", ["iostream", "string", "vector", "sstream"]),
        tests: [
          T("sample", "/a/./b/../c\n/home//user/\n", "/a/c\n/home/user", "sample"),
          T("above root", "/../..\n", "/", "visible", "edge"),
          T("dots in names", "/x/.../y/..\n", "/x/...", "hidden", "edge"),
          T("root", "/\n", "/", "hidden", "boundary"),
        ],
        compare: "lines",
        hints: [
          "Read parts with getline(stream, part, '/').",
          "Skip empty parts and \".\".",
          "\"..\" pops the stack if it isn't empty; anything else is pushed.",
          "Print \"/\" + parts joined by \"/\", or \"/\" if none.",
        ],
        solution: r`#include <iostream>
#include <string>
#include <vector>
#include <sstream>
using namespace std;

int main() {
    string p;
    while (getline(cin, p)) {
        stringstream ss(p);
        string part;
        vector<string> stack;
        while (getline(ss, part, '/')) {
            if (part.empty() || part == ".") continue;
            if (part == "..") {
                if (!stack.empty()) stack.pop_back();
            } else {
                stack.push_back(part);
            }
        }
        string out;
        for (const auto& s : stack) out += "/" + s;
        cout << (out.empty() ? "/" : out) << endl;
    }
    return 0;
}`,
        solutionNotes: "\"...\" is an ordinary (odd) folder name — only exactly \".\" and \"..\" are special. This mirrors fs::path::lexically_normal for absolute paths.",
      },
      {
        title: "An in-memory file system",
        prompt: `Simulate folders and files. Commands: \`mkdir PATH\` (create all missing folders), \`touch PATH SIZE\` (create/overwrite a file of SIZE bytes; its folders must exist, otherwise print \`no such folder\`), \`ls PATH\` (print the folder's entries sorted by name, folders with a trailing \`/\`, space-separated, or \`(empty)\`; \`no such folder\` if missing), \`du PATH\` (total bytes of all files under the folder). Paths are absolute.`,
        starterCode: starter("A tree of Dir nodes: map<string, unique_ptr<Dir>> dirs; map<string, long long> files", "string cmd;", ["iostream", "string", "vector", "map", "memory", "sstream"], "// struct Dir { … }; and a helper that splits a path into parts"),
        tests: [
          T("sample", "mkdir /docs/school\ntouch /docs/school/maths.txt 120\ntouch /docs/todo.txt 30\nls /docs\ndu /docs\nls /docs/school\n", "school/ todo.txt\n150\nmaths.txt", "sample"),
          T("missing folder", "touch /x/a.txt 5\nls /x\n", "no such folder\nno such folder", "visible", "edge"),
          T("root and overwrite", "touch /a 5\ntouch /a 7\nmkdir /b\nls /\ndu /\nls /b\n", "a b/\n7\n(empty)", "hidden"),
        ],
        compare: "lines",
        hints: [
          "Split \"/docs/school\" into {\"docs\", \"school\"}; the root has no parts.",
          "mkdir walks the parts, creating missing Dirs with make_unique.",
          "find(parts) walks without creating, returning nullptr if something is missing.",
          "du is recursive: sum of this folder's files plus du of each subfolder.",
        ],
        solution: r`#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <memory>
#include <sstream>
using namespace std;

struct Dir {
    map<string, unique_ptr<Dir>> dirs;
    map<string, long long> files;
};

vector<string> split(const string& path) {
    vector<string> parts;
    stringstream ss(path);
    string part;
    while (getline(ss, part, '/'))
        if (!part.empty()) parts.push_back(part);
    return parts;
}

Dir* walk(Dir* d, const vector<string>& parts, size_t count, bool create) {
    for (size_t i = 0; i < count; i++) {
        auto it = d->dirs.find(parts[i]);
        if (it == d->dirs.end()) {
            if (!create) return nullptr;
            it = d->dirs.emplace(parts[i], make_unique<Dir>()).first;
        }
        d = it->second.get();
    }
    return d;
}

long long du(const Dir* d) {
    long long total = 0;
    for (const auto& [name, size] : d->files) total += size;
    for (const auto& [name, sub] : d->dirs) total += du(sub.get());
    return total;
}

int main() {
    Dir root;
    string cmd, path;
    while (cin >> cmd >> path) {
        vector<string> parts = split(path);
        if (cmd == "mkdir") {
            walk(&root, parts, parts.size(), true);
        } else if (cmd == "touch") {
            long long size;
            cin >> size;
            Dir* d = parts.empty() ? nullptr : walk(&root, parts, parts.size() - 1, false);
            if (!d) cout << "no such folder" << endl;
            else d->files[parts.back()] = size;
        } else if (cmd == "ls" || cmd == "du") {
            Dir* d = walk(&root, parts, parts.size(), false);
            if (!d) { cout << "no such folder" << endl; continue; }
            if (cmd == "du") { cout << du(d) << endl; continue; }
            map<string, string> entries;
            for (const auto& [name, sub] : d->dirs) entries[name] = name + "/";
            for (const auto& [name, size] : d->files) entries[name] = name;
            if (entries.empty()) cout << "(empty)";
            bool first = true;
            for (const auto& [name, shown] : entries) {
                cout << (first ? "" : " ") << shown;
                first = false;
            }
            cout << endl;
        }
    }
    return 0;
}`,
        solutionNotes: "A file system is a tree: folders own their subfolders (unique_ptr), and sizes are summed recursively — exactly what `du` and `fs::recursive_directory_iterator` do on a real disk.",
      },
    ),
    explainAgain: `A path is an address: country/city/street/house. The filename is the house, the parent is the street, the extension is what kind of building it is. \`..\` means "go back up one level". std::filesystem understands these addresses and can actually visit them on your computer; here we practise reading the address correctly.`,
    summary: [
      "`std::filesystem` gives portable paths, directory listing and file info (on your own machine).",
      "parent / filename / stem / extension split at the last `/` and the last `.` (not a leading dot).",
      "Normalise `.` and `..` with a stack of folder names; join paths with `/`, not `+`.",
    ],
  },

  {
    id: "debugging-ide",
    moduleId: "files-exceptions",
    after: "debugging-testing",
    title: "Debugging with breakpoints in an IDE",
    minutes: 15,
    concepts: ["breakpoint", "step over", "step into", "watch", "call stack", "conditional breakpoint"],
    goals: [
      "Pause a program at a breakpoint and inspect variables",
      "Choose between step over, step into and step out",
      "Read the call stack and use conditional breakpoints for loops",
    ],
    intro: `Print statements work, but a debugger lets you **freeze** the program at any line and look at everything: every variable, the chain of function calls that led here, and what happens one line at a time. VS Code, CLion, Visual Studio and Xcode all work the same way.`,
    sections: [
      {
        title: "The controls",
        body: `| Action | What it does |
| --- | --- |
| **Breakpoint** (click the gutter) | pause when execution reaches this line |
| **Continue** | run until the next breakpoint |
| **Step over** | run the current line, including any function calls, and stop at the next line |
| **Step into** | if the line calls a function, enter it and stop at its first line |
| **Step out** | finish the current function and stop in its caller |
| **Watch** | keep an expression (e.g. \`lo + hi\`, \`v.size()\`) on screen |`,
      },
      {
        title: "The call stack",
        body: `The call stack panel lists the functions that are currently running, innermost on top: \`fact(1) ← fact(2) ← fact(3) ← main\`. Clicking a frame shows that function's local variables — essential for recursion.`,
      },
      {
        title: "Conditional breakpoints and build settings",
        body: `A loop that runs 100 000 times? Right-click the breakpoint and add a condition like \`i == 99999\` or \`total < 0\`. Compile with debug info and without optimisation (\`g++ -g -O0\`), otherwise variables may show as "optimised out" and lines may be skipped.`,
      },
    ],
    mistakes: [
      { title: "Debugging an optimised build", body: "With -O2 the compiler reorders and removes code; use -g -O0 while debugging." },
      { title: "Stepping into library code", body: "Step into on `v.push_back(x)` drops you inside the STL. Use step over, or step out to escape." },
      { title: "Changing code without rebuilding", body: "The debugger runs the last build; rebuild after every edit." },
    ],
    example: {
      title: "What the call stack looks like",
      intro: "This program prints what a debugger's call-stack panel would show at the deepest point of the recursion.",
      code: r`#include <iostream>
#include <string>
#include <vector>
using namespace std;

vector<string> callStack;

long long fact(int n) {
    callStack.push_back("fact(" + to_string(n) + ")");
    long long result;
    if (n <= 1) {
        cout << "paused at the base case. Call stack:" << endl;
        for (int i = callStack.size() - 1; i >= 0; i--) cout << "  " << callStack[i] << endl;
        cout << "  main()" << endl;
        result = 1;
    } else {
        result = n * fact(n - 1);
    }
    callStack.pop_back();
    return result;
}

int main() {
    long long r = fact(3);
    cout << "result " << r << endl;
    return 0;
}`,
      output: "paused at the base case. Call stack:\n  fact(1)\n  fact(2)\n  fact(3)\n  main()\nresult 6\n",
      notes: [
        { line: 9, text: "Entering a function pushes a frame." },
        { line: 13, text: "Innermost frame first — the order a debugger shows." },
        { line: 19, text: "Returning pops the frame." },
      ],
    },
    quickCheck: {
      prompt: "You're paused on `total += price(item);` and suspect `price` is wrong. Which control?",
      options: [
        { id: "a", text: "Step into", feedback: "Yes — it enters price() so you can watch it run." },
        { id: "b", text: "Step over", feedback: "That runs price() completely and you only see the result." },
        { id: "c", text: "Continue", feedback: "That runs until the next breakpoint, skipping what you want to see." },
      ],
      correct: "a",
      explanation: "Step into enters the called function; step over treats it as one step.",
    },
    exercise: {
      title: "Find the bug like a debugger would",
      prompt: `This binary search sometimes loops forever or misses values. Imagine watching \`lo\`, \`hi\` and \`mid\`: when the range is two elements and the target is the larger one, \`lo = mid\` never moves. Fix the search (keep the overall structure) so that, for each query, it prints the index of the value in the sorted array or \`-1\`.`,
      starterCode: r`#include <iostream>
#include <vector>
using namespace std;

int findIndex(const vector<int>& a, int target) {
    int lo = 0, hi = a.size() - 1;
    while (lo < hi) {
        int mid = (lo + hi) / 2;
        if (a[mid] < target) lo = mid;
        else hi = mid;
    }
    if (a[lo] == target) return lo;
    return -1;
}

int main() {
    int n, q;
    cin >> n >> q;
    vector<int> a(n);
    for (auto& x : a) cin >> x;
    for (int i = 0; i < q; i++) {
        int t;
        cin >> t;
        cout << findIndex(a, t) << endl;
    }
    return 0;
}`,
      tests: [
        { label: "sample", input: "5 3\n1 3 5 7 9\n7\n4\n9\n", output: "3\n-1\n4", visibility: "sample", category: "normal" },
        { label: "two elements", input: "2 2\n4 8\n8\n4\n", output: "1\n0", visibility: "hidden", category: "edge" },
        { label: "single", input: "1 2\n5\n5\n6\n", output: "0\n-1", visibility: "hidden", category: "boundary" },
        { label: "bigger than all", input: "3 1\n1 2 3\n10\n", output: "-1", visibility: "hidden", category: "edge" },
      ],
      compare: "lines",
      hints: [
        "Trace a = {4, 8}, target 8: lo = 0, hi = 1, mid = 0, a[0] < 8 so lo = 0 again — stuck.",
        "When a[mid] < target, mid itself can't be the answer.",
        "So the fix is lo = mid + 1.",
        "With that change the loop always shrinks the range.",
      ],
      solution: r`#include <iostream>
#include <vector>
using namespace std;

int findIndex(const vector<int>& a, int target) {
    int lo = 0, hi = a.size() - 1;
    while (lo < hi) {
        int mid = (lo + hi) / 2;
        if (a[mid] < target) lo = mid + 1;
        else hi = mid;
    }
    if (a[lo] == target) return lo;
    return -1;
}

int main() {
    int n, q;
    cin >> n >> q;
    vector<int> a(n);
    for (auto& x : a) cin >> x;
    for (int i = 0; i < q; i++) {
        int t;
        cin >> t;
        cout << findIndex(a, t) << endl;
    }
    return 0;
}`,
      solutionNotes: "In a debugger you'd see lo and mid stuck at the same value on every iteration — a classic infinite loop. The rule: every branch must make the range strictly smaller.",
    },
    practice: practice(
      {
        title: "A trace like a watch window",
        prompt: `Read \`n\` and n numbers. Run this loop: \`best = a[0]; for i = 1..n−1: if a[i] > best then best = a[i]\`, and print a "watch window" line **each time best changes**: \`i=I a[i]=V best=B\`. Finally print \`best B\`.`,
        starterCode: starter("Print a line every time best changes", "int n;\ncin >> n;\nvector<long long> a(n);\nfor (auto& x : a) cin >> x;", ["iostream", "vector"]),
        tests: [
          T("sample", "5\n3 1 4 1 5\n", "i=2 a[i]=4 best=4\ni=4 a[i]=5 best=5\nbest 5", "sample"),
          T("no changes", "3\n9 1 2\n", "best 9", "visible", "edge"),
          T("every step", "3\n1 2 3\n", "i=1 a[i]=2 best=2\ni=2 a[i]=3 best=3\nbest 3", "hidden"),
        ],
        compare: "lines",
        hints: [
          "best starts as a[0] — no line for the start.",
          "Inside the if, update best and print the line.",
          "Use the exact format: i=I a[i]=V best=B.",
          "Print the final line after the loop.",
        ],
        solution: r`#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<long long> a(n);
    for (auto& x : a) cin >> x;
    long long best = a[0];
    for (int i = 1; i < n; i++) {
        if (a[i] > best) {
            best = a[i];
            cout << "i=" << i << " a[i]=" << a[i] << " best=" << best << endl;
        }
    }
    cout << "best " << best << endl;
    return 0;
}`,
        solutionNotes: "Printing only when a value changes is like a data breakpoint (watchpoint): you see exactly the moments that matter instead of every iteration.",
      },
      {
        title: "Conditional breakpoint",
        prompt: `A running total of n transactions should never go negative. Read \`n\`, a starting balance and n amounts. Print the first index where the balance becomes negative and the balance at that moment — \`paused at i=I balance=B\` — like a breakpoint with the condition \`balance < 0\`, or \`never negative, final B\`.`,
        starterCode: starter("Stop at the first i where balance < 0", "int n;\nlong long balance;\ncin >> n >> balance;", ["iostream"]),
        tests: [
          T("sample", "4 100\n-30 -50 -40 70\n", "paused at i=2 balance=-20", "sample"),
          T("fine", "2 10\n-5 5\n", "never negative, final 10", "visible", "edge"),
          T("first step", "1 0\n-1\n", "paused at i=0 balance=-1", "hidden", "boundary"),
        ],
        compare: "lines",
        hints: [
          "Read each amount inside the loop and add it.",
          "Check the condition right after updating.",
          "Print and stop (return) at the first match.",
          "If the loop finishes, print the final balance.",
        ],
        solution: r`#include <iostream>
using namespace std;

int main() {
    int n;
    long long balance;
    cin >> n >> balance;
    for (int i = 0; i < n; i++) {
        long long amount;
        cin >> amount;
        balance += amount;
        if (balance < 0) {
            cout << "paused at i=" << i << " balance=" << balance << endl;
            return 0;
        }
    }
    cout << "never negative, final " << balance << endl;
    return 0;
}`,
        solutionNotes: "In an IDE you'd put a breakpoint on the `balance += amount` line with condition `balance < 0` — the program runs at full speed until the moment something goes wrong.",
      },
    ),
    explainAgain: `A debugger is a pause button and a magnifying glass for your program. Breakpoints say where to pause, stepping moves forward one line (or into a function), the watch window shows the numbers you care about, and the call stack shows how you got here — like breadcrumbs.`,
    summary: [
      "Breakpoints pause; step over/into/out move through code; watches show values.",
      "The call stack shows nested calls — and their locals — innermost first.",
      "Use conditional breakpoints for loops, and debug -g -O0 builds.",
    ],
  },
];
