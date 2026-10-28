import type { QuestionDef, TestCaseDef, WriteCodeQuestion } from "../types";
import { PAR, starter } from "./helpers";

/**
 * Practice Arena problems: classic judged programming exercises across the curriculum. Every
 * reference solution is compiled and run against its tests by tests/question-bank.test.ts.
 */

type ArenaInput = Omit<WriteCodeQuestion, "type" | "purposes" | "detectors" | "tests" | "compare"> & {
  tests: [string, string, string, TestCaseDef["visibility"], TestCaseDef["category"]?][];
  compare?: WriteCodeQuestion["compare"];
};

function problem(p: ArenaInput): WriteCodeQuestion {
  return {
    ...p,
    type: "write_code",
    purposes: PAR,
    detectors: [],
    compare: p.compare ?? "lines",
    tests: p.tests.map(([label, input, output, visibility, category]) => ({ label, input, output, visibility, category: category ?? "normal" })),
  };
}

export const ARENA_QUESTIONS: QuestionDef[] = [
  problem({
    id: "arena-fizzbuzz", conceptId: "for-loops", difficulty: 2,
    skills: [{ id: "loop_boundaries" }, { id: "loop_purpose", weight: 0.5 }],
    prompt: "Read `n`. For each number from 1 to n print `FizzBuzz` if it's divisible by both 3 and 5, `Fizz` if divisible by 3, `Buzz` if divisible by 5, otherwise the number itself — one per line.",
    starterCode: starter("Print FizzBuzz from 1 to n", "int n;\ncin >> n;"),
    tests: [
      ["sample", "5\n", "1\n2\nFizz\n4\nBuzz", "sample"],
      ["fifteen", "15\n", "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz", "hidden"],
      ["one", "1\n", "1", "hidden", "boundary"],
    ],
    referenceSolution: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++) {
        if (i % 15 == 0) cout << "FizzBuzz" << endl;
        else if (i % 3 == 0) cout << "Fizz" << endl;
        else if (i % 5 == 0) cout << "Buzz" << endl;
        else cout << i << endl;
    }
    return 0;
}`,
    solutionWalkthrough: "Check the combined case (divisible by 15) first — otherwise the `% 3` branch would catch 15 and print Fizz.",
    hints: [
      "Loop i from 1 to n inclusive.",
      "Which check has to come first?",
      "A number divisible by 3 and 5 is divisible by 15.",
      "if (i % 15 == 0) … else if (i % 3 == 0) … else if (i % 5 == 0) … else …",
      "for (int i = 1; i <= n; i++) { if (i % 15 == 0) cout << \"FizzBuzz\" << endl; else if … }",
    ],
    explanation: "Order the conditions from most specific to least specific.",
  }),
  problem({
    id: "arena-prime", conceptId: "while-loops", difficulty: 3,
    skills: [{ id: "while_loop" }],
    prompt: "For each number `n` (2 ≤ n ≤ 10¹², one per line, until the input ends) print `prime` or `composite`. Trying every divisor up to n is too slow — stop at √n.",
    starterCode: starter("For each n, print prime or composite", "long long n;"),
    tests: [
      ["sample", "2\n9\n13\n", "prime\ncomposite\nprime", "sample"],
      ["big prime", "999999999989\n", "prime", "hidden", "edge"],
      ["big square", "1000000000000\n", "composite", "hidden", "edge"],
      ["square of prime", "49\n", "composite", "hidden"],
    ],
    referenceSolution: `#include <iostream>
using namespace std;

int main() {
    long long n;
    while (cin >> n) {
        bool prime = n >= 2;
        long long d = 2;
        while (prime && d * d <= n) {
            if (n % d == 0) prime = false;
            d++;
        }
        cout << (prime ? "prime" : "composite") << endl;
    }
    return 0;
}`,
    solutionWalkthrough: "If n = a × b with a ≤ b, then a ≤ √n — so a divisor, if any, shows up by √n. `d * d <= n` avoids floating-point square roots. About 10⁶ steps for n = 10¹².",
    hints: [
      "A composite number has a divisor other than 1 and itself.",
      "If n = a × b, the smaller factor is at most √n.",
      "Loop while d * d <= n.",
      "Use long long for n and d.",
      "while (d * d <= n) { if (n % d == 0) { composite } d++; }",
    ],
    explanation: "Trial division up to √n: O(√n) per number.",
  }),
  problem({
    id: "arena-gcd-lcm", conceptId: "functions", difficulty: 3,
    skills: [{ id: "function_params_return" }],
    prompt: "Write `long long gcd(long long a, long long b)` using Euclid's algorithm and use it to print `gcd lcm` for each pair `a b` (1 ≤ a, b ≤ 10⁹) until the input ends.",
    starterCode: starter("Write gcd above main; print gcd and lcm for each pair", "long long a, b;"),
    tests: [
      ["sample", "12 18\n7 5\n", "6 36\n1 35", "sample"],
      ["equal", "9 9\n", "9 9", "hidden", "edge"],
      ["big", "1000000000 999999999\n", "1 999999999000000000", "hidden", "edge"],
    ],
    referenceSolution: `#include <iostream>
using namespace std;

long long gcd(long long a, long long b) {
    while (b != 0) {
        long long t = a % b;
        a = b;
        b = t;
    }
    return a;
}

int main() {
    long long a, b;
    while (cin >> a >> b) {
        long long g = gcd(a, b);
        cout << g << " " << a / g * b << endl;
    }
    return 0;
}`,
    solutionWalkthrough: "gcd(a, b) = gcd(b, a % b) until b is 0. lcm = a / gcd × b — dividing first keeps the intermediate value small.",
    hints: [
      "Euclid: gcd(a, b) = gcd(b, a % b).",
      "Stop when b becomes 0; the answer is a.",
      "lcm(a, b) = a × b / gcd(a, b).",
      "Divide before multiplying to avoid overflow: a / g * b.",
      "while (b) { long long t = a % b; a = b; b = t; } return a;",
    ],
    explanation: "Euclid's algorithm runs in O(log min(a, b)).",
  }),
  problem({
    id: "arena-digits", conceptId: "while-loops", difficulty: 2,
    skills: [{ id: "while_loop" }],
    prompt: "Read a non-negative whole number `n` (up to 10¹⁸). Print how many digits it has and the sum of its digits, separated by a space.",
    starterCode: starter("Print the digit count and digit sum", "long long n;\ncin >> n;"),
    tests: [
      ["sample", "9045\n", "4 18", "sample"],
      ["zero", "0\n", "1 0", "hidden", "edge"],
      ["huge", "999999999999999999\n", "18 162", "hidden", "boundary"],
    ],
    compare: "tokens",
    referenceSolution: `#include <iostream>
using namespace std;

int main() {
    long long n;
    cin >> n;
    int count = 0, sum = 0;
    do {
        sum += n % 10;
        n /= 10;
        count++;
    } while (n > 0);
    cout << count << " " << sum << endl;
    return 0;
}`,
    solutionWalkthrough: "n % 10 is the last digit and n / 10 drops it. A do-while runs at least once, so 0 correctly has one digit.",
    hints: [
      "n % 10 gives the last digit.",
      "n / 10 removes the last digit.",
      "Repeat until n becomes 0.",
      "What happens with n = 0? A do-while loop helps.",
      "do { sum += n % 10; n /= 10; count++; } while (n > 0);",
    ],
    explanation: "Peel digits off with % 10 and / 10; do-while handles zero.",
  }),
  problem({
    id: "arena-number-triangle", conceptId: "nested-loops", difficulty: 3,
    skills: [{ id: "nested_patterns" }],
    prompt: "Read `n`. Print a triangle with n rows: row i contains the numbers 1 to i separated by spaces.",
    starterCode: starter("Print the number triangle", "int n;\ncin >> n;"),
    tests: [
      ["sample", "3\n", "1\n1 2\n1 2 3", "sample"],
      ["one", "1\n", "1", "hidden", "boundary"],
      ["five", "5\n", "1\n1 2\n1 2 3\n1 2 3 4\n1 2 3 4 5", "hidden"],
    ],
    referenceSolution: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= i; j++) cout << j << (j < i ? " " : "");
        cout << endl;
    }
    return 0;
}`,
    solutionWalkthrough: "The inner loop's limit depends on the outer variable: row i has i numbers.",
    hints: [
      "The outer loop chooses the row i.",
      "How many numbers are on row i?",
      "The inner loop goes from 1 to i.",
      "Print a space between numbers, not after the last one.",
      "for (int i = 1; i <= n; i++) { for (int j = 1; j <= i; j++) … cout << endl; }",
    ],
    explanation: "Triangle patterns use an inner bound that depends on the outer counter.",
  }),
  problem({
    id: "arena-grade", conceptId: "conditions", difficulty: 2,
    skills: [{ id: "else_if" }],
    prompt: "For each mark (one per line, until the input ends) print its grade: 90–100 `A`, 75–89 `B`, 50–74 `C`, 0–49 `F`, and `invalid` for anything outside 0–100.",
    starterCode: starter("Print a grade for each mark", "int m;"),
    tests: [
      ["sample", "95\n80\n42\n", "A\nB\nF", "sample"],
      ["boundaries", "90\n89\n75\n74\n50\n49\n0\n100\n", "A\nB\nB\nC\nC\nF\nF\nA", "hidden", "boundary"],
      ["invalid", "-1\n101\n", "invalid\ninvalid", "hidden", "edge"],
    ],
    referenceSolution: `#include <iostream>
using namespace std;

int main() {
    int m;
    while (cin >> m) {
        if (m < 0 || m > 100) cout << "invalid" << endl;
        else if (m >= 90) cout << "A" << endl;
        else if (m >= 75) cout << "B" << endl;
        else if (m >= 50) cout << "C" << endl;
        else cout << "F" << endl;
    }
    return 0;
}`,
    solutionWalkthrough: "Reject invalid marks first, then test thresholds from the top down: each else-if only runs when the ones above failed.",
    hints: [
      "Handle invalid marks first.",
      "Then check the highest band.",
      "With else-if, each later check knows the earlier ones were false.",
      "m >= 90 → A; else m >= 75 → B; …",
      "if (m < 0 || m > 100) invalid; else if (m >= 90) A; else if (m >= 75) B; else if (m >= 50) C; else F",
    ],
    explanation: "An else-if chain checks ranges from one end to the other.",
  }),
  problem({
    id: "arena-second-largest", conceptId: "arrays", difficulty: 3,
    skills: [{ id: "array_algorithms" }],
    prompt: "Read `n` and n whole numbers. Print the second largest **distinct** value, or `none` if there isn't one. Use a single pass.",
    starterCode: starter("Track the largest and second largest distinct values", "int n;\ncin >> n;"),
    tests: [
      ["sample", "5\n4 9 2 9 7\n", "7", "sample"],
      ["all equal", "3\n5 5 5\n", "none", "hidden", "edge"],
      ["negatives", "4\n-3 -1 -7 -1\n", "-3", "hidden", "edge"],
      ["single", "1\n8\n", "none", "hidden", "boundary"],
    ],
    referenceSolution: `#include <iostream>
#include <climits>
using namespace std;

int main() {
    int n;
    cin >> n;
    long long first = LLONG_MIN, second = LLONG_MIN;
    for (int i = 0; i < n; i++) {
        long long x;
        cin >> x;
        if (x > first) {
            second = first;
            first = x;
        } else if (x < first && x > second) {
            second = x;
        }
    }
    if (second == LLONG_MIN) cout << "none" << endl;
    else cout << second << endl;
    return 0;
}`,
    solutionWalkthrough: "A new maximum pushes the old maximum down to second place. Values equal to the maximum are skipped, so duplicates don't count as a second value.",
    hints: [
      "Keep two variables: first and second.",
      "Start both at the smallest possible value (LLONG_MIN).",
      "A new maximum moves the old maximum to second.",
      "A value strictly between second and first becomes the new second.",
      "if (x > first) { second = first; first = x; } else if (x < first && x > second) second = x;",
    ],
    explanation: "One pass with two trackers; equal values are ignored to keep them distinct.",
  }),
  problem({
    id: "arena-rotate", conceptId: "arrays", difficulty: 3,
    skills: [{ id: "array_indexing" }],
    prompt: "Read `n`, `k` (0 ≤ k ≤ 10⁹) and n numbers. Print the array rotated right by k positions (the last k elements move to the front).",
    starterCode: starter("Rotate right by k and print", "int n;\nlong long k;\ncin >> n >> k;", ["iostream", "vector"]),
    tests: [
      ["sample", "5 2\n1 2 3 4 5\n", "4 5 1 2 3", "sample"],
      ["k = 0", "3 0\n7 8 9\n", "7 8 9", "hidden", "edge"],
      ["huge k", "4 1000000001\n1 2 3 4\n", "4 1 2 3", "hidden", "edge"],
    ],
    compare: "tokens",
    referenceSolution: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    long long k;
    cin >> n >> k;
    vector<long long> a(n), b(n);
    for (auto& x : a) cin >> x;
    k %= n;
    for (int i = 0; i < n; i++) b[(i + k) % n] = a[i];
    for (int i = 0; i < n; i++) cout << b[i] << (i + 1 < n ? " " : "\\n");
    return 0;
}`,
    solutionWalkthrough: "Rotating by n changes nothing, so reduce k modulo n first. Element i lands at (i + k) % n.",
    hints: [
      "Rotating by n positions gives the same array.",
      "So k can be reduced: k %= n.",
      "Where does element i end up after a right rotation by k?",
      "New index: (i + k) % n.",
      "for (int i = 0; i < n; i++) b[(i + k) % n] = a[i];",
    ],
    explanation: "Index arithmetic with % handles wrap-around.",
  }),
  problem({
    id: "arena-anagram", conceptId: "strings", difficulty: 3,
    skills: [{ id: "string_methods" }],
    prompt: "For each pair of lowercase words `a b` (one pair per line, until the input ends), print `anagram` if one is a rearrangement of the other, otherwise `different`.",
    starterCode: starter("Compare letter counts for each pair", "string a, b;", ["iostream", "string"]),
    tests: [
      ["sample", "listen silent\nabc abd\n", "anagram\ndifferent", "sample"],
      ["lengths differ", "ab abb\n", "different", "hidden", "edge"],
      ["same word", "level level\n", "anagram", "hidden", "edge"],
    ],
    referenceSolution: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string a, b;
    while (cin >> a >> b) {
        int count[26] = {0};
        for (char c : a) count[c - 'a']++;
        for (char c : b) count[c - 'a']--;
        bool same = true;
        for (int x : count) if (x != 0) same = false;
        cout << (same ? "anagram" : "different") << endl;
    }
    return 0;
}`,
    solutionWalkthrough: "Count letters up for the first word and down for the second; anagrams cancel out to all zeros. O(length), no sorting needed.",
    hints: [
      "Anagrams use the same letters the same number of times.",
      "Count how often each letter appears.",
      "An array of 26 counters works for lowercase words.",
      "Add for word a, subtract for word b — all zeros means anagram.",
      "for (char c : a) count[c - 'a']++; for (char c : b) count[c - 'a']--;",
    ],
    explanation: "Equal letter counts ⇔ anagrams.",
  }),
  problem({
    id: "arena-caesar", conceptId: "strings", difficulty: 3,
    skills: [{ id: "string_basics" }],
    prompt: "Read a shift `k` (0–25) and then one line of text. Shift every letter k places forward in the alphabet, wrapping around and keeping its case; leave other characters unchanged.",
    starterCode: starter("Shift each letter by k", "int k;\ncin >> k;\ncin.ignore();\nstring line;\ngetline(cin, line);", ["iostream", "string"]),
    tests: [
      ["sample", "3\nHello, World!\n", "Khoor, Zruog!", "sample"],
      ["wrap", "1\nxyz XYZ\n", "yza YZA", "hidden", "edge"],
      ["zero", "0\nC++ 20\n", "C++ 20", "hidden", "edge"],
    ],
    referenceSolution: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int k;
    cin >> k;
    cin.ignore();
    string line;
    getline(cin, line);
    for (char& c : line) {
        if (c >= 'a' && c <= 'z') c = 'a' + (c - 'a' + k) % 26;
        else if (c >= 'A' && c <= 'Z') c = 'A' + (c - 'A' + k) % 26;
    }
    cout << line << endl;
    return 0;
}`,
    solutionWalkthrough: "Convert a letter to 0–25, add k, wrap with % 26, convert back. Upper and lower case use different bases.",
    hints: [
      "c − 'a' turns a lowercase letter into 0–25.",
      "Add k and wrap with % 26.",
      "Add 'a' back to get a letter.",
      "Do the same with 'A' for uppercase; leave everything else.",
      "if (c >= 'a' && c <= 'z') c = 'a' + (c - 'a' + k) % 26;",
    ],
    explanation: "Letter arithmetic with a base character and % 26.",
  }),
  problem({
    id: "arena-transpose", conceptId: "2d-arrays", difficulty: 3,
    skills: [{ id: "matrix_indexing" }],
    prompt: "Read `r c` and an r × c matrix. Print its transpose (c rows of r numbers).",
    starterCode: starter("Print the transpose", "int r, c;\ncin >> r >> c;", ["iostream", "vector"]),
    tests: [
      ["sample", "2 3\n1 2 3\n4 5 6\n", "1 4\n2 5\n3 6", "sample"],
      ["single row", "1 3\n7 8 9\n", "7\n8\n9", "hidden", "edge"],
      ["square", "2 2\n1 2\n3 4\n", "1 3\n2 4", "hidden"],
    ],
    referenceSolution: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int r, c;
    cin >> r >> c;
    vector<vector<long long>> m(r, vector<long long>(c));
    for (auto& row : m)
        for (auto& x : row) cin >> x;
    for (int j = 0; j < c; j++) {
        for (int i = 0; i < r; i++) cout << m[i][j] << (i + 1 < r ? " " : "");
        cout << endl;
    }
    return 0;
}`,
    solutionWalkthrough: "Element (i, j) becomes (j, i): loop over columns on the outside and rows on the inside.",
    hints: [
      "Store the matrix first.",
      "In the transpose, row j is column j of the original.",
      "Outer loop over columns j, inner over rows i.",
      "Print m[i][j].",
      "for (int j = 0; j < c; j++) { for (int i = 0; i < r; i++) cout << m[i][j] …; cout << endl; }",
    ],
    explanation: "Transposing swaps the roles of the two indexes.",
  }),
  problem({
    id: "arena-spiral", conceptId: "2d-arrays", difficulty: 4,
    skills: [{ id: "matrix_indexing" }],
    prompt: "Read `r c` and an r × c matrix. Print its elements in clockwise spiral order, starting at the top-left, on one line.",
    starterCode: starter("Walk the matrix in a spiral", "int r, c;\ncin >> r >> c;", ["iostream", "vector"]),
    tests: [
      ["sample", "3 3\n1 2 3\n4 5 6\n7 8 9\n", "1 2 3 6 9 8 7 4 5", "sample"],
      ["wide", "2 4\n1 2 3 4\n5 6 7 8\n", "1 2 3 4 8 7 6 5", "hidden"],
      ["column", "3 1\n1\n2\n3\n", "1 2 3", "hidden", "edge"],
    ],
    compare: "tokens",
    referenceSolution: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int r, c;
    cin >> r >> c;
    vector<vector<int>> m(r, vector<int>(c));
    for (auto& row : m)
        for (auto& x : row) cin >> x;
    int top = 0, bottom = r - 1, left = 0, right = c - 1;
    vector<int> out;
    while (top <= bottom && left <= right) {
        for (int j = left; j <= right; j++) out.push_back(m[top][j]);
        top++;
        for (int i = top; i <= bottom; i++) out.push_back(m[i][right]);
        right--;
        if (top <= bottom) {
            for (int j = right; j >= left; j--) out.push_back(m[bottom][j]);
            bottom--;
        }
        if (left <= right) {
            for (int i = bottom; i >= top; i--) out.push_back(m[i][left]);
            left++;
        }
    }
    for (size_t i = 0; i < out.size(); i++) cout << out[i] << (i + 1 < out.size() ? " " : "\\n");
    return 0;
}`,
    solutionWalkthrough: "Keep four boundaries and peel one side at a time, shrinking the boundary after each side. The two checks stop single rows or columns being visited twice.",
    hints: [
      "Track top, bottom, left and right boundaries.",
      "Walk the top row left→right, then move top down.",
      "Then the right column top→bottom, the bottom row right→left, the left column bottom→top.",
      "After the first two sides, check the range is still non-empty before the next sides.",
      "while (top <= bottom && left <= right) { top row; top++; right col; right--; if (top <= bottom) bottom row; if (left <= right) left col; }",
    ],
    explanation: "Shrinking boundaries make spiral traversal O(r·c).",
  }),
  problem({
    id: "arena-balanced", conceptId: "stl", difficulty: 4,
    skills: [{ id: "stack_queue" }],
    prompt: "For each line (until the input ends) print `balanced` if every `(`, `[` and `{` is closed by the matching bracket in the right order, otherwise `unbalanced`. Other characters are ignored.",
    starterCode: starter("Use a stack<char> to match brackets", "string line;", ["iostream", "stack", "string"]),
    tests: [
      ["sample", "([]{})\n([)]\n", "balanced\nunbalanced", "sample"],
      ["text", "if (a[i] == b) { x(); }\n", "balanced", "hidden"],
      ["unclosed", "((\n", "unbalanced", "hidden", "edge"],
      ["extra close", "())\n", "unbalanced", "hidden", "edge"],
    ],
    referenceSolution: `#include <iostream>
#include <stack>
#include <string>
using namespace std;

int main() {
    string line;
    while (getline(cin, line)) {
        stack<char> st;
        bool ok = true;
        for (char c : line) {
            if (c == '(' || c == '[' || c == '{') st.push(c);
            else if (c == ')' || c == ']' || c == '}') {
                char want = c == ')' ? '(' : c == ']' ? '[' : '{';
                if (st.empty() || st.top() != want) { ok = false; break; }
                st.pop();
            }
        }
        if (!st.empty()) ok = false;
        cout << (ok ? "balanced" : "unbalanced") << endl;
    }
    return 0;
}`,
    solutionWalkthrough: "The most recent unclosed bracket must be closed first — last in, first out, so a stack. Leftover openers at the end also mean unbalanced.",
    hints: [
      "Which opening bracket must the next closing bracket match?",
      "The most recently opened one — use a stack.",
      "Push openers; for a closer, check the top matches, then pop.",
      "A closer with an empty stack, or openers left at the end, means unbalanced.",
      "if (st.empty() || st.top() != want) unbalanced; else st.pop();",
    ],
    explanation: "Bracket matching is the classic stack application.",
  }),
  problem({
    id: "arena-two-sum", conceptId: "stl", difficulty: 4,
    skills: [{ id: "map_set" }],
    prompt: "Read `n`, a target `t` and n numbers. Print the 0-based indexes `i j` (i < j) of the first pair (smallest j, then smallest i) whose values add up to t, or `none`. Use a hash map for O(n).",
    starterCode: starter("Remember each value's first index in an unordered_map", "int n;\nlong long t;\ncin >> n >> t;", ["iostream", "unordered_map"]),
    tests: [
      ["sample", "4 9\n2 7 11 15\n", "0 1", "sample"],
      ["none", "3 100\n1 2 3\n", "none", "hidden", "edge"],
      ["duplicates", "4 6\n3 1 3 5\n", "0 2", "hidden", "edge"],
      ["negatives", "5 -1\n4 -3 8 2 -9\n", "1 3", "hidden"],
    ],
    referenceSolution: `#include <iostream>
#include <unordered_map>
using namespace std;

int main() {
    int n;
    long long t;
    cin >> n >> t;
    unordered_map<long long, int> firstIndex;
    for (int j = 0; j < n; j++) {
        long long x;
        cin >> x;
        auto it = firstIndex.find(t - x);
        if (it != firstIndex.end()) {
            cout << it->second << " " << j << endl;
            return 0;
        }
        if (!firstIndex.count(x)) firstIndex[x] = j;
    }
    cout << "none" << endl;
    return 0;
}`,
    solutionWalkthrough: "For each new value x at index j, the partner it needs is t − x. If that was seen before, we have the pair with the smallest j; storing only the first index gives the smallest i.",
    hints: [
      "Comparing every pair is O(n²).",
      "For value x, which partner value do you need?",
      "Store values you've seen with their index.",
      "Check for t − x before inserting x.",
      "auto it = seen.find(t - x); if (it != seen.end()) print it->second and j;",
    ],
    explanation: "One pass with a hash map: O(n) on average.",
  }),
  problem({
    id: "arena-top-word", conceptId: "stl", difficulty: 3,
    skills: [{ id: "map_set" }],
    prompt: "Read words until the input ends. Print the most frequent word and its count (`word count`); on ties, the alphabetically smallest word.",
    starterCode: starter("Count words in a map and pick the best", "string w;", ["iostream", "map", "string"]),
    tests: [
      ["sample", "the cat and the hat\n", "the 2", "sample"],
      ["tie", "b a b a\n", "a 2", "hidden", "edge"],
      ["single", "hello\n", "hello 1", "hidden", "boundary"],
    ],
    referenceSolution: `#include <iostream>
#include <map>
#include <string>
using namespace std;

int main() {
    map<string, int> freq;
    string w;
    while (cin >> w) freq[w]++;
    string best;
    int count = 0;
    for (const auto& [word, c] : freq) {
        if (c > count) {
            best = word;
            count = c;
        }
    }
    cout << best << " " << count << endl;
    return 0;
}`,
    solutionWalkthrough: "map iterates words alphabetically, so using a strict > keeps the first (smallest) word among those tied for the highest count.",
    hints: [
      "Count with a map<string, int>.",
      "freq[w]++ creates the entry the first time.",
      "Then find the entry with the largest count.",
      "map is sorted — how does that help with ties?",
      "for (auto& [word, c] : freq) if (c > count) { best = word; count = c; }",
    ],
    explanation: "Counting with a map plus a strict comparison gives a deterministic tie-break.",
  }),
  problem({
    id: "arena-count-occurrences", conceptId: "searching-sorting", difficulty: 4,
    skills: [{ id: "binary_search" }],
    prompt: "Read `n`, n sorted numbers, `q` and q queries. For each query x print how many times x occurs, in O(log n) per query using `lower_bound` and `upper_bound`.",
    starterCode: starter("Answer each query with lower_bound/upper_bound", "int n;\ncin >> n;\nvector<long long> a(n);\nfor (auto& x : a) cin >> x;\nint q;\ncin >> q;", ["iostream", "vector", "algorithm"]),
    tests: [
      ["sample", "6\n1 2 2 2 5 7\n3\n2\n5\n3\n", "3\n1\n0", "sample"],
      ["ends", "3\n4 4 4\n2\n4\n9\n", "3\n0", "hidden", "edge"],
      ["below all", "2\n5 6\n1\n1\n", "0", "hidden", "edge"],
    ],
    referenceSolution: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<long long> a(n);
    for (auto& x : a) cin >> x;
    int q;
    cin >> q;
    while (q--) {
        long long x;
        cin >> x;
        cout << upper_bound(a.begin(), a.end(), x) - lower_bound(a.begin(), a.end(), x) << endl;
    }
    return 0;
}`,
    solutionWalkthrough: "lower_bound finds the first element ≥ x and upper_bound the first > x; the distance between them is the number of copies of x.",
    hints: [
      "The copies of x form one block in a sorted array.",
      "lower_bound returns the first position with a value ≥ x.",
      "upper_bound returns the first position with a value > x.",
      "The block's length is upper − lower.",
      "cout << upper_bound(a.begin(), a.end(), x) - lower_bound(a.begin(), a.end(), x);",
    ],
    explanation: "Two binary searches bound the block of equal values.",
  }),
  problem({
    id: "arena-leaderboard", conceptId: "searching-sorting", difficulty: 3,
    skills: [{ id: "sorting_algos" }],
    prompt: "Read `n` players as `NAME SCORE`. Print them ranked by score (highest first), ties by name A→Z, as `RANK. NAME SCORE`. Players with equal scores share a rank (1, 2, 2, 4 …).",
    starterCode: starter("Sort, then assign competition ranks", "int n;\ncin >> n;\nvector<pair<string, int>> p(n);\nfor (auto& [name, s] : p) cin >> name >> s;", ["iostream", "vector", "string", "algorithm", "utility"]),
    tests: [
      ["sample", "4\nravi 80\nasha 95\nmeera 80\nzoe 60\n", "1. asha 95\n2. meera 80\n2. ravi 80\n4. zoe 60", "sample"],
      ["single", "1\nsolo 10\n", "1. solo 10", "hidden", "boundary"],
      ["all tied", "3\nc 5\nb 5\na 5\n", "1. a 5\n1. b 5\n1. c 5", "hidden", "edge"],
    ],
    referenceSolution: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <utility>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<pair<string, int>> p(n);
    for (auto& [name, s] : p) cin >> name >> s;
    sort(p.begin(), p.end(), [](const auto& a, const auto& b) {
        if (a.second != b.second) return a.second > b.second;
        return a.first < b.first;
    });
    int rank = 1;
    for (int i = 0; i < n; i++) {
        if (i > 0 && p[i].second != p[i - 1].second) rank = i + 1;
        cout << rank << ". " << p[i].first << " " << p[i].second << endl;
    }
    return 0;
}`,
    solutionWalkthrough: "After sorting, a player's rank is 1 + the number of players ahead of them with a strictly higher score — which is i + 1 whenever the score changes.",
    hints: [
      "Sort by score descending, then name ascending.",
      "Walk the sorted list keeping the current rank.",
      "When does the rank change?",
      "Only when the score differs from the previous player's: rank = i + 1.",
      "if (i > 0 && p[i].second != p[i - 1].second) rank = i + 1;",
    ],
    explanation: "Sorting with a two-key comparator, then competition ranking.",
  }),
  problem({
    id: "arena-permutations", conceptId: "recursion", difficulty: 4,
    skills: [{ id: "recursive_trace" }, { id: "base_case", weight: 0.5 }],
    prompt: "Read a word of distinct lowercase letters (length ≤ 6). Print all its permutations in alphabetical order, one per line, using recursion (no `next_permutation`).",
    starterCode: starter("Sort the letters, then build permutations recursively", "string s;\ncin >> s;", ["iostream", "string", "algorithm"]),
    tests: [
      ["sample", "cab\n", "abc\nacb\nbac\nbca\ncab\ncba", "sample"],
      ["one", "z\n", "z", "hidden", "boundary"],
      ["two", "ba\n", "ab\nba", "hidden"],
    ],
    referenceSolution: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

string letters, cur;
bool used[26];

void build() {
    if (cur.size() == letters.size()) {
        cout << cur << endl;
        return;
    }
    for (size_t i = 0; i < letters.size(); i++) {
        if (used[i]) continue;
        used[i] = true;
        cur.push_back(letters[i]);
        build();
        cur.pop_back();
        used[i] = false;
    }
}

int main() {
    cin >> letters;
    sort(letters.begin(), letters.end());
    build();
    return 0;
}`,
    solutionWalkthrough: "Choose each unused letter for the next position, recurse, then undo the choice. Trying letters in sorted order makes the output alphabetical.",
    hints: [
      "Base case: the current string is as long as the word — print it.",
      "Otherwise try every letter that isn't used yet.",
      "Mark it used, append it, recurse, then undo both.",
      "Sort the letters first to get alphabetical output.",
      "for each i not used: used[i] = true; cur += s[i]; build(); cur.pop_back(); used[i] = false;",
    ],
    explanation: "Choose, recurse, un-choose: the backtracking template.",
  }),
  problem({
    id: "arena-hanoi", conceptId: "recursion", difficulty: 4,
    skills: [{ id: "base_case" }, { id: "recursive_trace", weight: 0.5 }],
    prompt: "Towers of Hanoi: read `n` (1 ≤ n ≤ 10) and print every move to take n disks from peg A to peg C using peg B, as `disk D: X -> Y`, then `moves M`.",
    starterCode: starter("Write a recursive hanoi(n, from, to, via)", "int n;\ncin >> n;"),
    tests: [
      ["sample", "2\n", "disk 1: A -> B\ndisk 2: A -> C\ndisk 1: B -> C\nmoves 3", "sample"],
      ["one", "1\n", "disk 1: A -> C\nmoves 1", "hidden", "boundary"],
      ["three", "3\n", "disk 1: A -> C\ndisk 2: A -> B\ndisk 1: C -> B\ndisk 3: A -> C\ndisk 1: B -> A\ndisk 2: B -> C\ndisk 1: A -> C\nmoves 7", "hidden"],
    ],
    referenceSolution: `#include <iostream>
using namespace std;

int moves = 0;

void hanoi(int n, char from, char to, char via) {
    if (n == 0) return;
    hanoi(n - 1, from, via, to);
    cout << "disk " << n << ": " << from << " -> " << to << endl;
    moves++;
    hanoi(n - 1, via, to, from);
}

int main() {
    int n;
    cin >> n;
    hanoi(n, 'A', 'C', 'B');
    cout << "moves " << moves << endl;
    return 0;
}`,
    solutionWalkthrough: "To move n disks: move n − 1 out of the way onto the spare peg, move the biggest disk, then move the n − 1 back on top. That's 2ⁿ − 1 moves.",
    hints: [
      "Trust the recursion: assume you can move n − 1 disks.",
      "Move n − 1 disks from the source to the spare peg.",
      "Move disk n to the target.",
      "Move the n − 1 disks from the spare peg to the target.",
      "hanoi(n - 1, from, via, to); print move; hanoi(n - 1, via, to, from);",
    ],
    explanation: "Two recursive calls around one move: T(n) = 2T(n − 1) + 1 = 2ⁿ − 1.",
  }),
  problem({
    id: "arena-grid-paths", conceptId: "algorithms", difficulty: 4,
    skills: [{ id: "dynamic_programming" }],
    prompt: "Read `r c` and a grid of `.` (free) and `#` (blocked). Moving only right or down from the top-left to the bottom-right, print the number of paths modulo 1 000 000 007 (0 if a corner is blocked).",
    starterCode: starter("dp[i][j] = paths into cell (i, j)", "int r, c;\ncin >> r >> c;\nvector<string> g(r);\nfor (auto& row : g) cin >> row;", ["iostream", "vector", "string"]),
    tests: [
      ["sample", "3 3\n...\n.#.\n...\n", "2", "sample"],
      ["open", "3 3\n...\n...\n...\n", "6", "hidden"],
      ["blocked start", "2 2\n#.\n..\n", "0", "hidden", "edge"],
      ["single", "1 1\n.\n", "1", "hidden", "boundary"],
    ],
    referenceSolution: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    const long long MOD = 1000000007;
    int r, c;
    cin >> r >> c;
    vector<string> g(r);
    for (auto& row : g) cin >> row;
    vector<vector<long long>> dp(r, vector<long long>(c, 0));
    for (int i = 0; i < r; i++)
        for (int j = 0; j < c; j++) {
            if (g[i][j] == '#') continue;
            if (i == 0 && j == 0) { dp[i][j] = 1; continue; }
            long long ways = 0;
            if (i > 0) ways += dp[i - 1][j];
            if (j > 0) ways += dp[i][j - 1];
            dp[i][j] = ways % MOD;
        }
    cout << dp[r - 1][c - 1] << endl;
    return 0;
}`,
    solutionWalkthrough: "Every path into a cell arrives from above or from the left, so paths(i, j) = paths(i − 1, j) + paths(i, j − 1); blocked cells have 0.",
    hints: [
      "How can a path arrive at cell (i, j)?",
      "Only from above or from the left.",
      "dp[i][j] = dp[i − 1][j] + dp[i][j − 1], with blocked cells 0.",
      "The start has exactly one path (if it's free).",
      "Fill row by row so the cells above and to the left are ready; reduce modulo 1e9 + 7.",
    ],
    explanation: "Grid path counting: a 2D DP over cells.",
  }),
  problem({
    id: "arena-coin-change", conceptId: "algorithms", difficulty: 5,
    skills: [{ id: "dynamic_programming" }, { id: "greedy", weight: 0.3 }],
    prompt: "Read `k` coin values and an amount `A` (≤ 100 000). Print the fewest coins that make exactly A (unlimited coins of each value), or `-1` if impossible. Greedy doesn't always work!",
    starterCode: starter("dp[x] = fewest coins for amount x", "int k;\ncin >> k;\nvector<int> coins(k);\nfor (auto& c : coins) cin >> c;\nint A;\ncin >> A;", ["iostream", "vector", "algorithm"]),
    tests: [
      ["sample", "3\n1 5 10\n27\n", "5", "sample"],
      ["greedy fails", "3\n1 3 4\n6\n", "2", "hidden", "edge"],
      ["impossible", "1\n2\n7\n", "-1", "hidden", "edge"],
      ["zero", "2\n3 7\n0\n", "0", "hidden", "boundary"],
    ],
    referenceSolution: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int k;
    cin >> k;
    vector<int> coins(k);
    for (auto& c : coins) cin >> c;
    int A;
    cin >> A;
    const int INF = 1e9;
    vector<int> dp(A + 1, INF);
    dp[0] = 0;
    for (int x = 1; x <= A; x++)
        for (int c : coins)
            if (c <= x && dp[x - c] != INF) dp[x] = min(dp[x], dp[x - c] + 1);
    cout << (dp[A] == INF ? -1 : dp[A]) << endl;
    return 0;
}`,
    solutionWalkthrough: "The last coin used is some c, leaving x − c to be made optimally: dp[x] = 1 + min dp[x − c]. With coins {1, 3, 4}, greedy picks 4 + 1 + 1 for 6, but 3 + 3 is better.",
    hints: [
      "Try greedy on coins {1, 3, 4} and amount 6 — is it optimal?",
      "Think about the last coin used to make amount x.",
      "dp[x] = 1 + min over coins c ≤ x of dp[x − c].",
      "dp[0] = 0; unreachable amounts stay at infinity.",
      "for x in 1..A: for c in coins: if (c <= x && dp[x - c] != INF) dp[x] = min(dp[x], dp[x - c] + 1);",
    ],
    explanation: "Unbounded coin change DP in O(A·k).",
  }),
  problem({
    id: "arena-window-sum", conceptId: "algorithms", difficulty: 3,
    skills: [{ id: "two_pointers" }],
    prompt: "Read `n k` and n numbers. Print the largest sum of k consecutive numbers, using a sliding window (O(n)).",
    starterCode: starter("Slide a window of size k", "int n, k;\ncin >> n >> k;\nvector<long long> a(n);\nfor (auto& x : a) cin >> x;", ["iostream", "vector", "algorithm"]),
    tests: [
      ["sample", "6 3\n2 1 5 1 3 2\n", "9", "sample"],
      ["k = n", "3 3\n1 -2 4\n", "3", "hidden", "boundary"],
      ["negatives", "4 2\n-5 -1 -3 -2\n", "-4", "hidden", "edge"],
    ],
    referenceSolution: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n, k;
    cin >> n >> k;
    vector<long long> a(n);
    for (auto& x : a) cin >> x;
    long long sum = 0;
    for (int i = 0; i < k; i++) sum += a[i];
    long long best = sum;
    for (int i = k; i < n; i++) {
        sum += a[i] - a[i - k];
        best = max(best, sum);
    }
    cout << best << endl;
    return 0;
}`,
    solutionWalkthrough: "Moving the window one step adds the new element and subtracts the one that left: O(1) per step instead of re-adding k numbers.",
    hints: [
      "Sum the first k numbers.",
      "When the window moves right by one, what changes?",
      "One element enters and one leaves.",
      "sum += a[i] − a[i − k].",
      "Track the best sum; start it at the first window's sum (not 0) for negative inputs.",
    ],
    explanation: "Sliding windows reuse the previous sum.",
  }),
  problem({
    id: "arena-bits", conceptId: "algorithms", difficulty: 3,
    skills: [{ id: "bits_math" }],
    prompt: "For each non-negative number `n` (< 2⁶²) until the input ends, print its binary form, how many 1 bits it has, and `yes`/`no` for whether it's a power of two: `BINARY ONES POW2`.",
    starterCode: starter("Print the binary form, popcount and power-of-two check", "long long n;", ["iostream", "string"]),
    tests: [
      ["sample", "10\n8\n", "1010 2 no\n1000 1 yes", "sample"],
      ["zero", "0\n", "0 0 no", "hidden", "edge"],
      ["one", "1\n", "1 1 yes", "hidden", "boundary"],
      ["big", "4611686018427387903\n", "11111111111111111111111111111111111111111111111111111111111111 62 no", "hidden"],
    ],
    compare: "tokens",
    referenceSolution: `#include <iostream>
#include <string>
using namespace std;

int main() {
    long long n;
    while (cin >> n) {
        string bin;
        int ones = 0;
        long long x = n;
        do {
            bin = char('0' + (x & 1)) + bin;
            ones += x & 1;
            x >>= 1;
        } while (x > 0);
        bool pow2 = n > 0 && (n & (n - 1)) == 0;
        cout << bin << " " << ones << " " << (pow2 ? "yes" : "no") << endl;
    }
    return 0;
}`,
    solutionWalkthrough: "x & 1 is the lowest bit and x >>= 1 drops it. A power of two has exactly one 1 bit, so n & (n − 1) — which clears the lowest 1 bit — is 0.",
    hints: [
      "x & 1 gives the last binary digit.",
      "x >>= 1 shifts the number right by one bit.",
      "Build the string from the right (prepend digits).",
      "n & (n − 1) clears the lowest set bit.",
      "pow2 = n > 0 && (n & (n - 1)) == 0;",
    ],
    explanation: "Bit operations: test, shift and the n & (n − 1) trick.",
  }),
  problem({
    id: "arena-components", conceptId: "data-structures", difficulty: 4,
    skills: [{ id: "graphs" }],
    prompt: "Read `n` (nodes 1…n) and `m` undirected edges. Print the number of connected components, then the size of the largest one.",
    starterCode: starter("BFS or DFS from every unvisited node", "int n, m;\ncin >> n >> m;", ["iostream", "vector", "queue", "algorithm"]),
    tests: [
      ["sample", "6 3\n1 2\n2 3\n4 5\n", "3\n3", "sample"],
      ["no edges", "3 0\n", "3\n1", "hidden", "edge"],
      ["connected", "4 3\n1 2\n2 3\n3 4\n", "1\n4", "hidden"],
    ],
    referenceSolution: `#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;
    vector<vector<int>> adj(n + 1);
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        adj[a].push_back(b);
        adj[b].push_back(a);
    }
    vector<bool> seen(n + 1, false);
    int components = 0, largest = 0;
    for (int s = 1; s <= n; s++) {
        if (seen[s]) continue;
        components++;
        int size = 0;
        queue<int> q;
        q.push(s);
        seen[s] = true;
        while (!q.empty()) {
            int v = q.front();
            q.pop();
            size++;
            for (int w : adj[v]) if (!seen[w]) { seen[w] = true; q.push(w); }
        }
        largest = max(largest, size);
    }
    cout << components << endl << largest << endl;
    return 0;
}`,
    solutionWalkthrough: "Each BFS from an unvisited node explores exactly one component; counting starts gives the number of components, and counting visits gives each size.",
    hints: [
      "Build adjacency lists (both directions).",
      "Keep a visited array.",
      "Every time you find an unvisited node, a new component starts.",
      "BFS/DFS from it, counting the nodes you visit.",
      "for s in 1..n: if !seen[s] { components++; bfs(s) counting size; }",
    ],
    explanation: "Repeated BFS/DFS labels components in O(n + m).",
  }),
  problem({
    id: "arena-reverse-list", conceptId: "pointers", difficulty: 4,
    skills: [{ id: "dynamic_memory" }, { id: "pointer_basics", weight: 0.5 }],
    prompt: "Read `n` and n numbers. Build a singly linked list with `new` (in input order), reverse it **in place** by re-pointing the `next` pointers, print it, then `delete` every node.",
    starterCode: starter("Build, reverse with three pointers, print, free", "int n;\ncin >> n;", ["iostream"]),
    tests: [
      ["sample", "4\n1 2 3 4\n", "4 3 2 1", "sample"],
      ["single", "1\n9\n", "9", "hidden", "boundary"],
      ["two", "2\n5 6\n", "6 5", "hidden"],
    ],
    compare: "tokens",
    referenceSolution: `#include <iostream>
using namespace std;

struct Node {
    int value;
    Node* next;
};

int main() {
    int n;
    cin >> n;
    Node* head = nullptr;
    Node* tail = nullptr;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        Node* node = new Node{x, nullptr};
        if (!head) head = node;
        else tail->next = node;
        tail = node;
    }
    Node* prev = nullptr;
    Node* cur = head;
    while (cur) {
        Node* nxt = cur->next;
        cur->next = prev;
        prev = cur;
        cur = nxt;
    }
    head = prev;
    for (Node* p = head; p; p = p->next) cout << p->value << (p->next ? " " : "\\n");
    while (head) {
        Node* nxt = head->next;
        delete head;
        head = nxt;
    }
    return 0;
}`,
    solutionWalkthrough: "Walk the list with prev/cur/next: save cur->next, point cur back at prev, advance. When cur runs off the end, prev is the new head. Free nodes by saving next before each delete.",
    hints: [
      "Keep a tail pointer while building so appending is O(1).",
      "To reverse, you need three pointers: prev, cur and next.",
      "Save next = cur->next before changing cur->next.",
      "cur->next = prev; prev = cur; cur = next. At the end, head = prev.",
      "When deleting, save the next pointer before delete — never use a node after deleting it.",
    ],
    explanation: "In-place reversal re-links nodes without allocating new ones.",
  }),
  problem({
    id: "arena-bank-account", conceptId: "oop", difficulty: 3,
    skills: [{ id: "class_basics" }, { id: "constructors", weight: 0.5 }],
    prompt: "Write a class `Account` with a private balance, a constructor taking the opening balance, `deposit`, `withdraw` (returns false and changes nothing if the balance would go negative) and a const `balance()` getter. Read the opening balance, then commands `deposit X` / `withdraw X` / `balance`; print `insufficient funds` for a failed withdrawal and the balance for `balance`.",
    starterCode: starter("Write class Account above main; process the commands", "long long opening;\ncin >> opening;\nstring cmd;", ["iostream", "string"]),
    tests: [
      ["sample", "100\ndeposit 50\nwithdraw 200\nwithdraw 30\nbalance\n", "insufficient funds\n120", "sample"],
      ["exact", "10\nwithdraw 10\nbalance\n", "0", "hidden", "boundary"],
      ["several", "0\nbalance\ndeposit 5\ndeposit 7\nbalance\n", "0\n12", "hidden"],
    ],
    referenceSolution: `#include <iostream>
#include <string>
using namespace std;

class Account {
    long long bal;
public:
    explicit Account(long long opening) : bal(opening) {}
    void deposit(long long x) { bal += x; }
    bool withdraw(long long x) {
        if (x > bal) return false;
        bal -= x;
        return true;
    }
    long long balance() const { return bal; }
};

int main() {
    long long opening;
    cin >> opening;
    Account acc(opening);
    string cmd;
    while (cin >> cmd) {
        if (cmd == "deposit") {
            long long x;
            cin >> x;
            acc.deposit(x);
        } else if (cmd == "withdraw") {
            long long x;
            cin >> x;
            if (!acc.withdraw(x)) cout << "insufficient funds" << endl;
        } else if (cmd == "balance") {
            cout << acc.balance() << endl;
        }
    }
    return 0;
}`,
    solutionWalkthrough: "The balance is private, so the only way to change it is through deposit and withdraw — which is where the 'never negative' rule lives.",
    hints: [
      "The balance should be a private member.",
      "The constructor sets the opening balance.",
      "withdraw checks first and only subtracts if there's enough.",
      "Return a bool so main can print the message.",
      "bool withdraw(long long x) { if (x > bal) return false; bal -= x; return true; }",
    ],
    explanation: "Encapsulation: the class protects its own invariant.",
  }),
  problem({
    id: "arena-safe-divide", conceptId: "files-exceptions", difficulty: 3,
    skills: [{ id: "exceptions" }],
    prompt: "Write `long long safeDivide(long long a, long long b)` that throws `std::invalid_argument(\"division by zero\")` when b is 0. For each pair `a b` until the input ends, print the quotient or `error: division by zero`, catching the exception in main.",
    starterCode: starter("Write safeDivide above main; call it inside try/catch", "long long a, b;", ["iostream", "stdexcept"]),
    tests: [
      ["sample", "10 3\n5 0\n-9 2\n", "3\nerror: division by zero\n-4", "sample"],
      ["zero numerator", "0 7\n", "0", "hidden", "edge"],
      ["all errors", "1 0\n2 0\n", "error: division by zero\nerror: division by zero", "hidden", "edge"],
    ],
    referenceSolution: `#include <iostream>
#include <stdexcept>
using namespace std;

long long safeDivide(long long a, long long b) {
    if (b == 0) throw invalid_argument("division by zero");
    return a / b;
}

int main() {
    long long a, b;
    while (cin >> a >> b) {
        try {
            cout << safeDivide(a, b) << endl;
        } catch (const invalid_argument& e) {
            cout << "error: " << e.what() << endl;
        }
    }
    return 0;
}`,
    solutionWalkthrough: "The function reports the problem with throw; main decides what to do with it. Integer division truncates toward zero, so −9 / 2 is −4.",
    hints: [
      "Check b before dividing.",
      "throw invalid_argument(\"division by zero\");",
      "Wrap the call in try { … }.",
      "catch (const invalid_argument& e) and print e.what().",
      "try { cout << safeDivide(a, b) << endl; } catch (const invalid_argument& e) { cout << \"error: \" << e.what() << endl; }",
    ],
    explanation: "Throw where the error is detected; catch where you can handle it.",
  }),
  problem({
    id: "arena-template-max", conceptId: "modern-cpp", difficulty: 3,
    skills: [{ id: "templates" }],
    prompt: "Write one function template `largest(const vector<T>& v)` that returns the largest element. Read `n` whole numbers and `m` words; print the largest number and the alphabetically last word, each on its own line, using the same template.",
    starterCode: starter("Write template largest above main and call it twice", "int n;\ncin >> n;\nvector<long long> nums(n);\nfor (auto& x : nums) cin >> x;\nint m;\ncin >> m;\nvector<string> words(m);\nfor (auto& w : words) cin >> w;", ["iostream", "vector", "string"]),
    tests: [
      ["sample", "3\n4 -2 9\n3\npear apple zebra\n", "9\nzebra", "sample"],
      ["negatives", "2\n-5 -3\n1\nsolo\n", "-3\nsolo", "hidden", "edge"],
      ["case", "1\n0\n2\nZoo apple\n", "0\napple", "hidden", "edge"],
    ],
    referenceSolution: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

template <typename T>
T largest(const vector<T>& v) {
    T best = v[0];
    for (const T& x : v)
        if (best < x) best = x;
    return best;
}

int main() {
    int n;
    cin >> n;
    vector<long long> nums(n);
    for (auto& x : nums) cin >> x;
    int m;
    cin >> m;
    vector<string> words(m);
    for (auto& w : words) cin >> w;
    cout << largest(nums) << endl;
    cout << largest(words) << endl;
    return 0;
}`,
    solutionWalkthrough: "The template only needs `<` to work for T, so it serves numbers and strings alike. Strings compare by character codes, so \"apple\" > \"Zoo\" (lowercase letters come after uppercase).",
    hints: [
      "template <typename T> T largest(const vector<T>& v).",
      "Start with best = v[0].",
      "Use only < so any comparable type works.",
      "The compiler generates one version for long long and one for string.",
      "for (const T& x : v) if (best < x) best = x;",
    ],
    explanation: "Templates write an algorithm once for every type that supports the needed operations.",
  }),
];
