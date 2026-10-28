import type { PracticeProblem } from "../types";
import { practice, starter, T } from "./helpers";

/** Practice problems for modules 12–14: searching & sorting, data structures, algorithms. */
export const DSA_PRACTICE: Record<string, PracticeProblem[]> = {
  "complexity": practice(
    {
      title: "Pairs that add up — fast",
      prompt: `Read \`n\` and \`K\`. The program builds \`a[i] = (i * 7919) % 100003\` for i = 0 … n − 1. Print how many pairs i < j have \`a[i] + a[j] == K\`.

n can be 200 000, so checking every pair (about 2 × 10¹⁰ steps) is far too slow. Count in **one pass** instead: for each element, how many earlier elements complete it?`,
      starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    long long K;
    cin >> n >> K;
    vector<int> a(n);
    for (int i = 0; i < n; i++) a[i] = (long long)i * 7919 % 100003;

    long long pairs = 0;
    // Too slow for large n: O(n^2). Replace with an O(n) approach.
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            if (a[i] + a[j] == K) pairs++;
    cout << pairs << endl;
    return 0;
}`,
      tests: [
        T("small", "10 63352\n", "4", "sample"),
        T("no pairs", "5 1\n", "0", "visible", "edge"),
        T("medium", "1000 100003\n", "0", "hidden"),
        T("large n (needs O(n))", "200000 100000\n", "199989", "hidden", "edge"),
        T("large n, other K", "200000 150000\n", "99997", "hidden", "edge"),
      ],
      hints: [
        "For a[j], which value would an earlier a[i] need to be?",
        "K − a[j].",
        "Keep a count of every value seen so far — values are below 100003, so an array works.",
        "For each j: pairs += seen[K − a[j]] (if that's in range); then seen[a[j]]++.",
      ],
      solution: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    long long K;
    cin >> n >> K;
    vector<int> a(n);
    for (int i = 0; i < n; i++) a[i] = (long long)i * 7919 % 100003;
    vector<long long> seen(100003, 0);
    long long pairs = 0;
    for (int j = 0; j < n; j++) {
        long long need = K - a[j];
        if (need >= 0 && need < 100003) pairs += seen[need];
        seen[a[j]]++;
    }
    cout << pairs << endl;
    return 0;
}`,
      solutionNotes: "Trading memory for time: a counting array answers \"how many earlier elements equal X?\" in O(1), so the whole count is O(n) instead of O(n²).",
    },
    {
      title: "Answer many range sums",
      prompt: `Read \`n\` and \`q\`. The program builds \`a[i] = (i * 31 + 7) % 1000\` and \`q\` queries: query j asks for the sum of \`a[l..r]\` with \`l = j * 17 % n\` and \`r = l + j * 13 % (n − l)\`. Print the **total** of all query answers.

With n = q = 200 000, adding each range element by element is up to 4 × 10¹⁰ steps. Precompute prefix sums so every query is O(1).`,
      starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n, q;
    cin >> n >> q;
    vector<long long> a(n);
    for (int i = 0; i < n; i++) a[i] = ((long long)i * 31 + 7) % 1000;

    long long total = 0;
    for (int j = 0; j < q; j++) {
        int l = (long long)j * 17 % n;
        int r = l + (long long)j * 13 % (n - l);
        // Too slow: O(length) per query. Use prefix sums instead.
        for (int i = l; i <= r; i++) total += a[i];
    }
    cout << total << endl;
    return 0;
}`,
      tests: [
        T("small", "10 5\n", "1565", "sample"),
        T("one element", "1 3\n", "21", "visible", "edge"),
        T("medium", "1000 1000\n", "122691300", "hidden"),
        T("large (needs prefix sums)", "200000 200000\n", "4924416171914", "hidden", "edge"),
      ],
      hints: [
        "Let pre[k] = a[0] + … + a[k − 1], with pre[0] = 0.",
        "Then sum(l..r) = pre[r + 1] − pre[l].",
        "Build pre once in O(n).",
        "Replace the inner loop with that subtraction.",
      ],
      solution: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n, q;
    cin >> n >> q;
    vector<long long> a(n), pre(n + 1, 0);
    for (int i = 0; i < n; i++) a[i] = ((long long)i * 31 + 7) % 1000;
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + a[i];
    long long total = 0;
    for (int j = 0; j < q; j++) {
        int l = (long long)j * 17 % n;
        int r = l + (long long)j * 13 % (n - l);
        total += pre[r + 1] - pre[l];
    }
    cout << total << endl;
    return 0;
}`,
      solutionNotes: "O(n) preprocessing turns each query from O(n) into O(1), so the whole job is O(n + q).",
    },
  ),

  "binary-search": practice(
    {
      title: "Integer square root",
      prompt: `Read \`n\` (0 ≤ n ≤ 10¹⁸). Print ⌊√n⌋ — the largest x with x² ≤ n — using **binary search** on x (don't use \`sqrt\`: doubles aren't exact this large).`,
      starterCode: starter("Binary search for the largest x with x * x <= n", "long long n;\ncin >> n;"),
      tests: [
        T("17", "17\n", "4", "sample"),
        T("perfect square", "144\n", "12", "visible", "boundary"),
        T("zero", "0\n", "0", "hidden", "edge"),
        T("one", "1\n", "1", "hidden", "edge"),
        T("10^18", "1000000000000000000\n", "1000000000", "hidden", "edge"),
        T("just below a square", "999999999999999999\n", "999999999", "hidden", "edge"),
      ],
      hints: [
        "The answer lies between 0 and 10⁹.",
        "Check mid: if mid * mid <= n, the answer is mid or larger.",
        "Keep the best mid that worked and search higher; otherwise search lower.",
        "mid * mid fits in long long when mid ≤ 10⁹, so keep hi at 10⁹ (or check mid <= n / mid).",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    long long n;
    cin >> n;
    long long lo = 0, hi = 1000000000, ans = 0;
    while (lo <= hi) {
        long long mid = lo + (hi - lo) / 2;
        if (mid * mid <= n) {
            ans = mid;
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }
    cout << ans << endl;
    return 0;
}`,
      solutionNotes: "Binary search works on any yes/no question that flips once (\"is mid² ≤ n?\"), not just on arrays. About 30 steps cover 0…10⁹.",
    },
    {
      title: "Smallest truck capacity",
      prompt: `Parcels with weights w₁ … wₙ must be shipped **in order** within \`D\` days; each day the truck takes parcels in order until the next one would exceed its capacity. Read \`n D\` and the weights; print the **smallest capacity** that ships everything within D days.

Binary search on the capacity, with a helper that counts the days a given capacity needs.`,
      starterCode: starter("Binary search the capacity; check each guess by simulating the days", "int n, D;\ncin >> n >> D;\nvector<long long> w(n);\nfor (auto& x : w) cin >> x;", ["iostream", "vector", "algorithm", "numeric"]),
      tests: [
        T("sample", "10 5\n1 2 3 4 5 6 7 8 9 10\n", "15", "sample"),
        T("one day", "3 1\n3 2 2\n", "7", "visible", "boundary"),
        T("a day per parcel", "4 4\n1 9 2 3\n", "9", "hidden", "edge"),
        T("more days than parcels", "2 10\n5 5\n", "5", "hidden", "edge"),
        T("classic", "6 3\n3 2 2 4 1 4\n", "6", "hidden"),
      ],
      hints: [
        "The capacity must be at least the heaviest parcel, and the total weight always works.",
        "daysNeeded(cap): fill each day until the next parcel won't fit, then start a new day.",
        "If daysNeeded(mid) <= D, mid works — try smaller; otherwise try bigger.",
        "lo = max weight, hi = sum; standard binary search for the first capacity that works.",
      ],
      solution: `#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>
using namespace std;

int daysNeeded(const vector<long long>& w, long long cap) {
    int days = 1;
    long long load = 0;
    for (long long x : w) {
        if (load + x > cap) {
            days++;
            load = 0;
        }
        load += x;
    }
    return days;
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
        if (daysNeeded(w, mid) <= D) hi = mid;
        else lo = mid + 1;
    }
    cout << lo << endl;
    return 0;
}`,
      solutionNotes: "\"Binary search on the answer\": bigger capacities never need more days, so the yes/no answer flips once. Each check is O(n), so the total is O(n log(sum)).",
    },
  ),

  "simple-sorts": practice(
    {
      title: "Selection sort, pass by pass",
      prompt: `Read \`n\` (2 ≤ n ≤ 50) and n numbers. Sort them with **selection sort**: on pass i, find the smallest element from i onwards and swap it into position i. Print the array after each of the n − 1 passes.`,
      starterCode: starter("Selection sort, printing the array after every pass", "int n;\ncin >> n;\nint a[50];\nfor (int i = 0; i < n; i++) cin >> a[i];"),
      tests: [
        T("sample", "4\n4 3 1 2\n", "1 3 4 2\n1 2 4 3\n1 2 3 4", "sample"),
        T("already sorted", "3\n1 2 3\n", "1 2 3\n1 2 3", "visible", "edge"),
        T("reversed", "3\n3 2 1\n", "1 2 3\n1 2 3", "hidden"),
        T("duplicates", "4\n2 1 2 1\n", "1 2 2 1\n1 1 2 2\n1 1 2 2", "hidden", "edge"),
      ],
      compare: "lines",
      hints: [
        "Outer loop: i from 0 to n − 2.",
        "Inner loop: find the index of the smallest element in a[i..n−1].",
        "Swap it with a[i] (use the first smallest, so ties keep their order as in the example).",
        "Print the whole array after each outer pass.",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int a[50];
    for (int i = 0; i < n; i++) cin >> a[i];
    for (int i = 0; i < n - 1; i++) {
        int m = i;
        for (int j = i + 1; j < n; j++) {
            if (a[j] < a[m]) m = j;
        }
        int t = a[i]; a[i] = a[m]; a[m] = t;
        for (int k = 0; k < n; k++) cout << a[k] << (k + 1 < n ? " " : "\\n");
    }
    return 0;
}`,
      solutionNotes: "After pass i, the first i + 1 positions hold the smallest values in order. Selection sort always does n − 1 passes, even on sorted input.",
    },
    {
      title: "Bubble sort with an early exit",
      prompt: `Read \`n\` (1 ≤ n ≤ 1000) and n numbers. Run bubble sort that **stops as soon as a pass makes no swaps**. Print the number of passes performed (including that final, swap-free pass), the total number of swaps, and then the sorted array.`,
      starterCode: starter("Bubble sort; count passes and swaps; stop after a pass with no swaps", "int n;\ncin >> n;\nvector<int> a(n);\nfor (auto& x : a) cin >> x;", ["iostream", "vector"]),
      tests: [
        T("sample", "5\n5 1 4 2 8\n", "3 4\n1 2 4 5 8", "sample"),
        T("already sorted", "4\n1 2 3 4\n", "1 0\n1 2 3 4", "visible", "edge"),
        T("reversed", "4\n4 3 2 1\n", "4 6\n1 2 3 4", "hidden"),
        T("single", "1\n9\n", "1 0\n9", "hidden", "boundary"),
        T("duplicates", "4\n2 2 1 1\n", "3 4\n1 1 2 2", "hidden", "edge"),
      ],
      compare: "lines",
      hints: [
        "Use a `swapped` flag that each pass resets to false.",
        "Count every pass you start, and every swap.",
        "Stop when a pass ends with swapped still false.",
        "Only swap when a[j] > a[j + 1] (strictly), so equal values don't count as swaps.",
      ],
      solution: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> a(n);
    for (auto& x : a) cin >> x;
    int passes = 0;
    long long swaps = 0;
    bool swapped = true;
    for (int end = n - 1; swapped; end--) {
        swapped = false;
        passes++;
        for (int j = 0; j < end; j++) {
            if (a[j] > a[j + 1]) {
                int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;
                swaps++;
                swapped = true;
            }
        }
    }
    cout << passes << " " << swaps << endl;
    for (int i = 0; i < n; i++) cout << a[i] << (i + 1 < n ? " " : "\\n");
    return 0;
}`,
      solutionNotes: "The early exit makes bubble sort O(n) on sorted input. The number of swaps always equals the number of out-of-order pairs (inversions).",
    },
  ),

  "linked-lists": practice(
    {
      title: "Middle of a linked list",
      prompt: `The starter builds a singly linked list from the input. Complete \`Node* middle(Node* head)\` using a **slow and a fast pointer** (fast moves two steps, slow one). For an even length, return the **second** of the two middle nodes. Print its value.`,
      starterCode: `#include <iostream>
using namespace std;

struct Node {
    int val;
    Node* next;
};

Node* middle(Node* head) {
    // Move slow one step and fast two steps until fast reaches the end
    return head;
}

int main() {
    int n;
    cin >> n;
    Node* head = nullptr;
    Node* tail = nullptr;
    for (int i = 0; i < n; i++) {
        int v;
        cin >> v;
        Node* node = new Node{v, nullptr};
        if (!head) head = node; else tail->next = node;
        tail = node;
    }
    cout << middle(head)->val << endl;
    while (head) { Node* nx = head->next; delete head; head = nx; }
    return 0;
}`,
      tests: [
        T("odd", "5\n1 2 3 4 5\n", "3", "sample"),
        T("even", "4\n1 2 3 4\n", "3", "visible", "edge"),
        T("one", "1\n42\n", "42", "hidden", "boundary"),
        T("two", "2\n7 8\n", "8", "hidden", "edge"),
      ],
      hints: [
        "When fast has gone the whole way, slow has gone half way.",
        "Loop while fast and fast->next are both not null.",
        "slow = slow->next; fast = fast->next->next;",
        "Return slow.",
      ],
      solution: `#include <iostream>
using namespace std;

struct Node {
    int val;
    Node* next;
};

Node* middle(Node* head) {
    Node* slow = head;
    Node* fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
    }
    return slow;
}

int main() {
    int n;
    cin >> n;
    Node* head = nullptr;
    Node* tail = nullptr;
    for (int i = 0; i < n; i++) {
        int v;
        cin >> v;
        Node* node = new Node{v, nullptr};
        if (!head) head = node; else tail->next = node;
        tail = node;
    }
    cout << middle(head)->val << endl;
    while (head) { Node* nx = head->next; delete head; head = nx; }
    return 0;
}`,
      solutionNotes: "One pass, no counting: the fast pointer covers twice the distance, so slow stops in the middle. Checking `fast->next` before stepping twice avoids following a null pointer.",
    },
    {
      title: "Remove every x",
      prompt: `Complete \`Node* removeAll(Node* head, int x)\`: delete every node whose value is x (including at the head) and return the new head. The starter reads the list and x, then prints the list (or \`empty\`).`,
      starterCode: `#include <iostream>
using namespace std;

struct Node {
    int val;
    Node* next;
};

Node* removeAll(Node* head, int x) {
    // Unlink and delete every node with value x; return the (possibly new) head
    return head;
}

int main() {
    int n, x;
    cin >> n;
    Node* head = nullptr;
    Node* tail = nullptr;
    for (int i = 0; i < n; i++) {
        int v;
        cin >> v;
        Node* node = new Node{v, nullptr};
        if (!head) head = node; else tail->next = node;
        tail = node;
    }
    cin >> x;
    head = removeAll(head, x);
    if (!head) cout << "empty";
    for (Node* p = head; p; p = p->next) cout << p->val << " ";
    cout << endl;
    while (head) { Node* nx = head->next; delete head; head = nx; }
    return 0;
}`,
      tests: [
        T("middle values", "6\n1 2 6 3 6 4\n6\n", "1 2 3 4", "sample"),
        T("head values", "4\n7 7 1 7\n7\n", "1", "visible", "edge"),
        T("everything", "3\n5 5 5\n5\n", "empty", "hidden", "edge"),
        T("nothing to remove", "3\n1 2 3\n9\n", "1 2 3", "hidden"),
        T("empty list", "0\n4\n", "empty", "hidden", "edge"),
      ],
      hints: [
        "First remove matches at the head: while (head && head->val == x) …",
        "Then walk with a pointer `cur` and look at cur->next.",
        "If cur->next matches, unlink it (cur->next = cur->next->next) and delete it — don't advance cur.",
        "Otherwise advance cur.",
      ],
      solution: `#include <iostream>
using namespace std;

struct Node {
    int val;
    Node* next;
};

Node* removeAll(Node* head, int x) {
    while (head && head->val == x) {
        Node* dead = head;
        head = head->next;
        delete dead;
    }
    for (Node* cur = head; cur && cur->next; ) {
        if (cur->next->val == x) {
            Node* dead = cur->next;
            cur->next = dead->next;
            delete dead;
        } else {
            cur = cur->next;
        }
    }
    return head;
}

int main() {
    int n, x;
    cin >> n;
    Node* head = nullptr;
    Node* tail = nullptr;
    for (int i = 0; i < n; i++) {
        int v;
        cin >> v;
        Node* node = new Node{v, nullptr};
        if (!head) head = node; else tail->next = node;
        tail = node;
    }
    cin >> x;
    head = removeAll(head, x);
    if (!head) cout << "empty";
    for (Node* p = head; p; p = p->next) cout << p->val << " ";
    cout << endl;
    while (head) { Node* nx = head->next; delete head; head = nx; }
    return 0;
}`,
      solutionNotes: "The head is special because nothing points to it, so it's handled first. After unlinking cur->next, stay on cur — the new cur->next might also be x.",
    },
  ),

  "trees-bst": practice(
    {
      title: "Minimum, maximum and search in a BST",
      prompt: `Insert \`n\` values into a binary search tree (smaller to the left, equal or larger to the right). Then print the minimum and maximum, and for each of \`q\` queries print \`yes\` or \`no\` — is the value in the tree? Search by walking down the tree, not by scanning everything.`,
      starterCode: `#include <iostream>
using namespace std;

struct Node {
    int v;
    Node* left = nullptr;
    Node* right = nullptr;
    Node(int x) : v(x) {}
};

Node* insert(Node* t, int x) {
    if (!t) return new Node(x);
    if (x < t->v) t->left = insert(t->left, x);
    else t->right = insert(t->right, x);
    return t;
}

// Write: int minValue(Node*), int maxValue(Node*), bool contains(Node*, int)

int main() {
    int n;
    cin >> n;
    Node* root = nullptr;
    for (int i = 0; i < n; i++) { int x; cin >> x; root = insert(root, x); }
    // Print min and max, then answer the q queries
    return 0;
}`,
      tests: [
        T("sample", "6\n50 30 70 20 40 60\n3\n40\n55\n70\n", "20 70\nyes\nno\nyes", "sample"),
        T("single", "1\n5\n1\n5\n", "5 5\nyes", "visible", "boundary"),
        T("chain", "4\n1 2 3 4\n2\n4\n0\n", "1 4\nyes\nno", "hidden", "edge"),
        T("duplicates", "3\n5 5 5\n1\n6\n", "5 5\nno", "hidden", "edge"),
      ],
      compare: "lines",
      hints: [
        "The minimum is as far left as you can go; the maximum as far right.",
        "contains: compare x with the node; go left if smaller, right if larger.",
        "Stop with false when you reach nullptr.",
        "Each search follows one path: O(height), not O(n).",
      ],
      solution: `#include <iostream>
using namespace std;

struct Node {
    int v;
    Node* left = nullptr;
    Node* right = nullptr;
    Node(int x) : v(x) {}
};

Node* insert(Node* t, int x) {
    if (!t) return new Node(x);
    if (x < t->v) t->left = insert(t->left, x);
    else t->right = insert(t->right, x);
    return t;
}

int minValue(Node* t) {
    while (t->left) t = t->left;
    return t->v;
}

int maxValue(Node* t) {
    while (t->right) t = t->right;
    return t->v;
}

bool contains(Node* t, int x) {
    while (t) {
        if (x == t->v) return true;
        t = x < t->v ? t->left : t->right;
    }
    return false;
}

int main() {
    int n;
    cin >> n;
    Node* root = nullptr;
    for (int i = 0; i < n; i++) { int x; cin >> x; root = insert(root, x); }
    cout << minValue(root) << " " << maxValue(root) << endl;
    int q;
    cin >> q;
    for (int i = 0; i < q; i++) {
        int x;
        cin >> x;
        cout << (contains(root, x) ? "yes" : "no") << endl;
    }
    return 0;
}`,
      solutionNotes: "The BST ordering means every decision discards a whole subtree. Iterative loops are fine here — no recursion needed to walk one path.",
    },
    {
      title: "Level by level",
      prompt: `Insert \`n\` values into a BST (same rule as before), then print the tree **level by level** (breadth-first): each level on its own line, left to right.`,
      starterCode: `#include <iostream>
#include <queue>
using namespace std;

struct Node {
    int v;
    Node* left = nullptr;
    Node* right = nullptr;
    Node(int x) : v(x) {}
};

Node* insert(Node* t, int x) {
    if (!t) return new Node(x);
    if (x < t->v) t->left = insert(t->left, x);
    else t->right = insert(t->right, x);
    return t;
}

int main() {
    int n;
    cin >> n;
    Node* root = nullptr;
    for (int i = 0; i < n; i++) { int x; cin >> x; root = insert(root, x); }
    // Print the tree level by level using a queue
    return 0;
}`,
      tests: [
        T("sample", "6\n50 30 70 20 40 60\n", "50\n30 70\n20 40 60", "sample"),
        T("single", "1\n9\n", "9", "visible", "boundary"),
        T("chain", "3\n1 2 3\n", "1\n2\n3", "hidden", "edge"),
        T("full", "7\n4 2 6 1 3 5 7\n", "4\n2 6\n1 3 5 7", "hidden"),
      ],
      compare: "lines",
      hints: [
        "Breadth-first order uses a queue.",
        "Process the tree one level at a time: remember how many nodes are in the queue when a level starts.",
        "Pop exactly that many, printing them and pushing their children.",
        "Then print a new line and continue with the next level.",
      ],
      solution: `#include <iostream>
#include <queue>
using namespace std;

struct Node {
    int v;
    Node* left = nullptr;
    Node* right = nullptr;
    Node(int x) : v(x) {}
};

Node* insert(Node* t, int x) {
    if (!t) return new Node(x);
    if (x < t->v) t->left = insert(t->left, x);
    else t->right = insert(t->right, x);
    return t;
}

int main() {
    int n;
    cin >> n;
    Node* root = nullptr;
    for (int i = 0; i < n; i++) { int x; cin >> x; root = insert(root, x); }
    if (!root) return 0;
    queue<Node*> q;
    q.push(root);
    while (!q.empty()) {
        int levelSize = q.size();
        for (int i = 0; i < levelSize; i++) {
            Node* t = q.front();
            q.pop();
            cout << t->v << (i + 1 < levelSize ? " " : "\\n");
            if (t->left) q.push(t->left);
            if (t->right) q.push(t->right);
        }
    }
    return 0;
}`,
      solutionNotes: "When a level starts, the queue holds exactly that level's nodes; their children (the next level) are added behind them. Recording the size first separates the levels.",
    },
  ),

  "hashing-heaps": practice(
    {
      title: "First word that appears once",
      prompt: `Read \`n\` words. Print the **first** word (in input order) that appears exactly once in the whole list, or \`none\`. Use an \`unordered_map\` for the counts.`,
      starterCode: starter("Count with an unordered_map, then scan the words in order", "int n;\ncin >> n;\nvector<string> words(n);\nfor (auto& w : words) cin >> w;", ["iostream", "string", "vector", "unordered_map"]),
      tests: [
        T("sample", "6\ncat dog cat bird dog fish\n", "bird", "sample"),
        T("none", "4\na b a b\n", "none", "visible", "edge"),
        T("first word", "3\nsolo x x\n", "solo", "hidden", "boundary"),
        T("last word", "5\nq q w w e\n", "e", "hidden", "boundary"),
      ],
      hints: [
        "You need the counts for the whole list before you can decide.",
        "First pass: count[w]++.",
        "Second pass over the original order: the first w with count 1 is the answer.",
        "unordered_map gives average O(1) per update and lookup.",
      ],
      solution: `#include <iostream>
#include <string>
#include <vector>
#include <unordered_map>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<string> words(n);
    for (auto& w : words) cin >> w;
    unordered_map<string, int> count;
    for (const auto& w : words) count[w]++;
    for (const auto& w : words) {
        if (count[w] == 1) {
            cout << w << endl;
            return 0;
        }
    }
    cout << "none" << endl;
    return 0;
}`,
      solutionNotes: "Two passes: one to count (hash map), one in the original order to find the first unique word. The hash map's order doesn't matter because order comes from the vector.",
    },
    {
      title: "Running median",
      prompt: `Read numbers one by one (\`n\`, then n numbers). After each, print the median of everything read so far; for an even count print the **lower** of the two middle values. Use two heaps: a max-heap for the lower half and a min-heap for the upper half.`,
      starterCode: starter("Keep a max-heap (lower half) and a min-heap (upper half) balanced", "int n;\ncin >> n;", ["iostream", "queue", "vector", "functional"]),
      tests: [
        T("sample", "5\n5 15 1 3 8\n", "5\n5\n5\n3\n5", "sample"),
        T("increasing", "4\n1 2 3 4\n", "1\n1\n2\n2", "visible"),
        T("duplicates", "3\n7 7 7\n", "7\n7\n7", "hidden", "edge"),
        T("negatives", "4\n-1 -5 10 0\n", "-1\n-5\n-1\n-1", "hidden", "edge"),
      ],
      compare: "lines",
      hints: [
        "lower: priority_queue<int> (largest on top); upper: priority_queue<int, vector<int>, greater<int>>.",
        "Push into lower if the number ≤ lower.top() (or lower is empty), otherwise into upper.",
        "Rebalance so lower has the same size as upper or one more.",
        "The (lower) median is then always lower.top().",
      ],
      solution: `#include <iostream>
#include <queue>
#include <vector>
#include <functional>
using namespace std;

int main() {
    int n;
    cin >> n;
    priority_queue<int> lower;
    priority_queue<int, vector<int>, greater<int>> upper;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        if (lower.empty() || x <= lower.top()) lower.push(x);
        else upper.push(x);
        if (lower.size() > upper.size() + 1) { upper.push(lower.top()); lower.pop(); }
        else if (upper.size() > lower.size()) { lower.push(upper.top()); upper.pop(); }
        cout << lower.top() << endl;
    }
    return 0;
}`,
      solutionNotes: "Each heap keeps half the numbers with its boundary value on top. Every insert is O(log n), versus re-sorting everything each time.",
    },
  ),

  "graphs-bfs-dfs": practice(
    {
      title: "Count the islands of friends",
      prompt: `An undirected graph has \`n\` vertices (0 … n − 1) and \`m\` edges. Print the number of **connected components**. Use DFS (or BFS) with a visited array.`,
      starterCode: starter("Count connected components with DFS and a visited array", "int n, m;\ncin >> n >> m;\nvector<vector<int>> adj(n);\nfor (int i = 0; i < m; i++) {\n    int u, v;\n    cin >> u >> v;\n    adj[u].push_back(v);\n    adj[v].push_back(u);\n}", ["iostream", "vector"]),
      tests: [
        T("sample", "6 3\n0 1\n1 2\n3 4\n", "3", "sample"),
        T("no edges", "4 0\n", "4", "visible", "edge"),
        T("all connected", "4 3\n0 1\n1 2\n2 3\n", "1", "hidden"),
        T("cycle", "3 3\n0 1\n1 2\n2 0\n", "1", "hidden", "edge"),
      ],
      hints: [
        "Each time you find an unvisited vertex, you've found a new component.",
        "Then visit everything reachable from it, marking it visited.",
        "Write a recursive dfs(u) that marks u and calls dfs on unvisited neighbours.",
        "for (int s = 0; s < n; s++) if (!seen[s]) { components++; dfs(s); }",
      ],
      solution: `#include <iostream>
#include <vector>
using namespace std;

vector<vector<int>> adj;
vector<bool> seen;

void dfs(int u) {
    seen[u] = true;
    for (int v : adj[u]) {
        if (!seen[v]) dfs(v);
    }
}

int main() {
    int n, m;
    cin >> n >> m;
    adj.assign(n, {});
    for (int i = 0; i < m; i++) {
        int u, v;
        cin >> u >> v;
        adj[u].push_back(v);
        adj[v].push_back(u);
    }
    seen.assign(n, false);
    int components = 0;
    for (int s = 0; s < n; s++) {
        if (!seen[s]) {
            components++;
            dfs(s);
        }
    }
    cout << components << endl;
    return 0;
}`,
      solutionNotes: "Every DFS started from an unvisited vertex marks one whole component. The visited array also stops DFS from looping round cycles.",
    },
    {
      title: "Escape the maze",
      prompt: `Read a grid of \`r\` rows and \`c\` columns made of \`.\` (open), \`#\` (wall), one \`S\` (start) and one \`E\` (exit). Moving up, down, left or right, print the fewest steps from S to E, or \`-1\` if it's impossible. Use BFS.`,
      starterCode: starter("BFS from S over open cells; print the distance to E", "int r, c;\ncin >> r >> c;\nvector<string> g(r);\nfor (auto& row : g) cin >> row;", ["iostream", "string", "vector", "queue"]),
      tests: [
        T("sample", "3 4\nS..#\n.#..\n...E\n", "5", "sample"),
        T("blocked", "2 3\nS#E\n.#.\n", "-1", "visible", "edge"),
        T("adjacent", "1 2\nSE\n", "1", "hidden", "boundary"),
        T("winding", "4 4\nS#..\n.#.#\n...#\n##.E\n", "6", "hidden"),
        T("long way round", "5 5\nS....\n####.\n.....\n.####\n....E\n", "16", "hidden"),
      ],
      hints: [
        "BFS explores cells in order of distance, so the first time it reaches E is the shortest path.",
        "Keep dist[r][c] = -1 for unvisited cells.",
        "Neighbours: (r±1, c) and (r, c±1) — check they're inside the grid and not '#'.",
        "Use arrays dr = {1,-1,0,0}, dc = {0,0,1,-1} to loop over the four moves.",
      ],
      solution: `#include <iostream>
#include <string>
#include <vector>
#include <queue>
using namespace std;

int main() {
    int r, c;
    cin >> r >> c;
    vector<string> g(r);
    for (auto& row : g) cin >> row;
    vector<vector<int>> dist(r, vector<int>(c, -1));
    queue<pair<int, int>> q;
    for (int i = 0; i < r; i++)
        for (int j = 0; j < c; j++)
            if (g[i][j] == 'S') { dist[i][j] = 0; q.push({i, j}); }
    int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
    while (!q.empty()) {
        auto [i, j] = q.front();
        q.pop();
        if (g[i][j] == 'E') {
            cout << dist[i][j] << endl;
            return 0;
        }
        for (int k = 0; k < 4; k++) {
            int ni = i + dr[k], nj = j + dc[k];
            if (ni < 0 || nj < 0 || ni >= r || nj >= c) continue;
            if (g[ni][nj] == '#' || dist[ni][nj] != -1) continue;
            dist[ni][nj] = dist[i][j] + 1;
            q.push({ni, nj});
        }
    }
    cout << -1 << endl;
    return 0;
}`,
      solutionNotes: "A grid is a graph whose vertices are cells. BFS gives the fewest moves because it finishes every distance d before any cell at distance d + 1.",
    },
  ),

  "two-pointers-window": practice(
    {
      title: "Longest stretch without repeats",
      prompt: `Read a string (letters and digits, no spaces). Print the length of the longest substring with **no repeated characters**. Use a sliding window.`,
      starterCode: starter("Slide a window; move the left edge forward whenever a character repeats", "string s;\ncin >> s;", ["iostream", "string"]),
      tests: [
        T("sample", "abcabcbb\n", "3", "sample"),
        T("all same", "bbbbb\n", "1", "visible", "edge"),
        T("in the middle", "pwwkew\n", "3", "hidden"),
        T("all different", "abcdef\n", "6", "hidden", "boundary"),
        T("repeat far back", "abba\n", "2", "hidden", "edge"),
      ],
      hints: [
        "Keep a window [left, right] with no repeats, and grow right one step at a time.",
        "Remember where each character was last seen: int last[256], filled with -1.",
        "If s[right] was last seen inside the window, move left just past it.",
        "left = max(left, last[s[right]] + 1); best = max(best, right - left + 1).",
      ],
      solution: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    string s;
    cin >> s;
    int last[256];
    fill(last, last + 256, -1);
    int left = 0, best = 0;
    for (int right = 0; right < (int)s.size(); right++) {
        unsigned char ch = s[right];
        left = max(left, last[ch] + 1);
        last[ch] = right;
        best = max(best, right - left + 1);
    }
    cout << best << endl;
    return 0;
}`,
      solutionNotes: "Both edges only move forward, so it's O(n). `max(left, …)` matters: in \"abba\", the second 'a' was last seen *before* the window, so left mustn't move backwards.",
    },
    {
      title: "Subarrays that sum to K",
      prompt: `Read \`n\`, \`K\`, then n whole numbers (they may be **negative**). Print how many contiguous subarrays sum to exactly K. A sliding window doesn't work with negatives — use prefix sums and a hash map of how often each prefix sum has occurred.`,
      starterCode: starter("Count prefix sums seen so far; for each prefix p, add count[p - K]", "int n;\nlong long K;\ncin >> n >> K;", ["iostream", "unordered_map"]),
      tests: [
        T("sample", "5 3\n1 2 1 2 1\n", "4", "sample"),
        T("negatives", "3 0\n1 -1 0\n", "3", "visible", "edge"),
        T("none", "3 100\n1 2 3\n", "0", "hidden", "edge"),
        T("all zeros", "4 0\n0 0 0 0\n", "10", "hidden", "edge"),
        T("single match", "1 -5\n-5\n", "1", "hidden", "boundary"),
      ],
      hints: [
        "sum(i..j) = pre[j + 1] − pre[i].",
        "So a subarray ending at j sums to K exactly when an earlier prefix equals pre[j + 1] − K.",
        "Keep count[prefix] for prefixes seen so far, starting with count[0] = 1.",
        "For each element: p += x; answer += count[p - K]; count[p]++.",
      ],
      solution: `#include <iostream>
#include <unordered_map>
using namespace std;

int main() {
    int n;
    long long K;
    cin >> n >> K;
    unordered_map<long long, long long> count;
    count[0] = 1;
    long long p = 0, answer = 0;
    for (int i = 0; i < n; i++) {
        long long x;
        cin >> x;
        p += x;
        auto it = count.find(p - K);
        if (it != count.end()) answer += it->second;
        count[p]++;
    }
    cout << answer << endl;
    return 0;
}`,
      solutionNotes: "Prefix sums turn \"a range sums to K\" into \"two prefixes differ by K\". Counting earlier prefixes in a hash map makes it O(n) even with negative numbers.",
    },
  ),

  "greedy": practice(
    {
      title: "Hand out the sweets",
      prompt: `Each child wants a sweet of at least some size (their greed); each sweet has a size. A child is happy with one sweet at least as big as their greed. Read \`n\` greeds and \`m\` sizes; print the **maximum** number of happy children.`,
      starterCode: starter("Sort both lists and match greedily with two pointers", "int n, m;\ncin >> n;\nvector<int> g(n);\nfor (auto& x : g) cin >> x;\ncin >> m;\nvector<int> s(m);\nfor (auto& x : s) cin >> x;", ["iostream", "vector", "algorithm"]),
      tests: [
        T("sample", "3\n1 2 3\n2\n1 1\n", "1", "sample"),
        T("enough", "2\n1 2\n3\n1 2 3\n", "2", "visible"),
        T("no sweets", "2\n1 1\n0\n", "0", "hidden", "edge"),
        T("big sweets only", "3\n5 5 5\n2\n10 10\n", "2", "hidden", "edge"),
        T("mixed", "4\n3 1 4 2\n4\n2 2 1 5\n", "3", "hidden"),
      ],
      hints: [
        "Give each sweet to the least greedy child it can satisfy.",
        "Sort greeds and sizes.",
        "Walk through the sweets; if the current sweet satisfies the current child, both move on; otherwise try a bigger sweet.",
        "Count how many children were satisfied.",
      ],
      solution: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n, m;
    cin >> n;
    vector<int> g(n);
    for (auto& x : g) cin >> x;
    cin >> m;
    vector<int> s(m);
    for (auto& x : s) cin >> x;
    sort(g.begin(), g.end());
    sort(s.begin(), s.end());
    int child = 0;
    for (int j = 0; j < m && child < n; j++) {
        if (s[j] >= g[child]) child++;
    }
    cout << child << endl;
    return 0;
}`,
      solutionNotes: "Wasting a big sweet on an easy child can never help, so the smallest sweet that works goes to the least greedy child. That exchange argument is why the greedy choice is safe.",
    },
    {
      title: "Fewest arrows",
      prompt: `Balloons are intervals \`[start, end]\` on a line. An arrow shot at x bursts every balloon with start ≤ x ≤ end. Read \`n\` balloons and print the **fewest arrows** that burst them all.`,
      starterCode: starter("Sort by end; shoot at the end of the first unburst balloon", "int n;\ncin >> n;\nvector<pair<long long, long long>> b(n);\nfor (auto& [s, e] : b) cin >> s >> e;", ["iostream", "vector", "algorithm", "utility"]),
      tests: [
        T("sample", "4\n10 16\n2 8\n1 6\n7 12\n", "2", "sample"),
        T("no overlap", "3\n1 2\n3 4\n5 6\n", "3", "visible"),
        T("touching ends", "2\n1 2\n2 3\n", "1", "hidden", "boundary"),
        T("none", "0\n", "0", "hidden", "edge"),
        T("nested", "3\n1 10\n2 3\n4 5\n", "2", "hidden", "edge"),
      ],
      hints: [
        "Which balloon must some arrow hit no later than its end?",
        "The one that ends first.",
        "Shoot it at its end — that also bursts every balloon starting before then.",
        "Sort by end; whenever a balloon starts after the last arrow, shoot a new arrow at its end.",
      ],
      solution: `#include <iostream>
#include <vector>
#include <algorithm>
#include <utility>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<pair<long long, long long>> b(n);
    for (auto& [s, e] : b) cin >> s >> e;
    sort(b.begin(), b.end(), [](const auto& x, const auto& y) { return x.second < y.second; });
    int arrows = 0;
    long long last = 0;
    for (int i = 0; i < n; i++) {
        if (arrows == 0 || b[i].first > last) {
            arrows++;
            last = b[i].second;
        }
    }
    cout << arrows << endl;
    return 0;
}`,
      solutionNotes: "Shooting as late as possible for the earliest-ending balloon covers the most others. It's the same idea as scheduling the most meetings: sort by end time.",
    },
  ),

  "backtracking": practice(
    {
      title: "All arrangements",
      prompt: `Read a word with distinct letters, given in alphabetical order (up to 7 letters). Print every permutation, one per line, in alphabetical order — using backtracking (choose an unused letter, recurse, un-choose).`,
      starterCode: starter("Build permutations with a used[] array and recursion", "string s;\ncin >> s;", ["iostream", "string", "vector"], "// Write a recursive function that builds permutations here"),
      tests: [
        T("abc", "abc\n", "abc\nacb\nbac\nbca\ncab\ncba", "sample"),
        T("one letter", "x\n", "x", "visible", "boundary"),
        T("two letters", "ab\n", "ab\nba", "hidden"),
        T("four letters (count)", "abcd\n", "abcd\nabdc\nacbd\nacdb\nadbc\nadcb\nbacd\nbadc\nbcad\nbcda\nbdac\nbdca\ncabd\ncadb\ncbad\ncbda\ncdab\ncdba\ndabc\ndacb\ndbac\ndbca\ndcab\ndcba", "hidden"),
      ],
      compare: "lines",
      hints: [
        "Build the answer one position at a time.",
        "At each position, try every letter not used yet — in order, so the output is alphabetical.",
        "Mark it used, recurse, then unmark it and remove it (backtrack).",
        "When the current string has every letter, print it.",
      ],
      solution: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

string s, cur;
vector<bool> used;

void build() {
    if (cur.size() == s.size()) {
        cout << cur << "\\n";
        return;
    }
    for (size_t i = 0; i < s.size(); i++) {
        if (used[i]) continue;
        used[i] = true;
        cur.push_back(s[i]);
        build();
        cur.pop_back();
        used[i] = false;
    }
}

int main() {
    cin >> s;
    used.assign(s.size(), false);
    build();
    return 0;
}`,
      solutionNotes: "Choose → explore → un-choose. Trying letters in sorted order at every level produces the permutations in alphabetical order without sorting afterwards.",
    },
    {
      title: "N queens",
      prompt: `Place \`n\` queens on an n × n chessboard so that no two attack each other (same row, column or diagonal). Read n (1 ≤ n ≤ 10) and print how many arrangements exist.`,
      starterCode: starter("Place one queen per row; backtrack when a column or diagonal is taken", "int n;\ncin >> n;", ["iostream", "vector"], "// Write a recursive place(row) here"),
      tests: [
        T("n = 4", "4\n", "2", "sample"),
        T("n = 1", "1\n", "1", "visible", "boundary"),
        T("n = 2 and 3 have none", "3\n", "0", "hidden", "edge"),
        T("n = 6", "6\n", "4", "hidden"),
        T("n = 8", "8\n", "92", "hidden"),
        T("n = 10", "10\n", "724", "hidden", "edge"),
      ],
      hints: [
        "Exactly one queen goes in each row — so recurse row by row.",
        "For each column in this row, check it's free: column, and both diagonals.",
        "Diagonals: cells on one share r − c, on the other r + c.",
        "Mark, recurse to row + 1, unmark. Count when row == n.",
      ],
      solution: `#include <iostream>
#include <vector>
using namespace std;

int n, solutions = 0;
vector<bool> col, diag1, diag2;

void place(int r) {
    if (r == n) {
        solutions++;
        return;
    }
    for (int c = 0; c < n; c++) {
        if (col[c] || diag1[r - c + n - 1] || diag2[r + c]) continue;
        col[c] = diag1[r - c + n - 1] = diag2[r + c] = true;
        place(r + 1);
        col[c] = diag1[r - c + n - 1] = diag2[r + c] = false;
    }
}

int main() {
    cin >> n;
    col.assign(n, false);
    diag1.assign(2 * n - 1, false);
    diag2.assign(2 * n - 1, false);
    place(0);
    cout << solutions << endl;
    return 0;
}`,
      solutionNotes: "Placing row by row removes the row check. Boolean arrays for columns and the two diagonal directions make each safety check O(1), and pruning skips whole subtrees of hopeless placements.",
    },
  ),

  "dynamic-programming": practice(
    {
      title: "Longest common subsequence",
      prompt: `Read two words (each up to 1000 letters). Print the length of their longest common subsequence — letters in the same order in both, not necessarily next to each other.`,
      starterCode: starter("Fill a (len(a)+1) x (len(b)+1) DP table", "string a, b;\ncin >> a >> b;", ["iostream", "string", "vector", "algorithm"]),
      tests: [
        T("sample", "abcde ace\n", "3", "sample"),
        T("nothing common", "abc xyz\n", "0", "visible", "edge"),
        T("identical", "dynamic dynamic\n", "7", "hidden", "boundary"),
        T("classic", "AGGTAB GXTXAYB\n", "4", "hidden"),
      ],
      hints: [
        "Let dp[i][j] = the LCS length of the first i letters of a and the first j letters of b.",
        "If a[i − 1] == b[j − 1], that letter extends dp[i − 1][j − 1].",
        "Otherwise dp[i][j] = max(dp[i − 1][j], dp[i][j − 1]).",
        "Row 0 and column 0 are 0. The answer is dp[n][m].",
      ],
      solution: `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    string a, b;
    cin >> a >> b;
    int n = a.size(), m = b.size();
    vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            if (a[i - 1] == b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
            else dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);
        }
    }
    cout << dp[n][m] << endl;
    return 0;
}`,
      solutionNotes: "Each cell is solved once from three smaller ones: O(n·m) instead of trying all subsequences (exponential).",
    },
    {
      title: "Knapsack",
      prompt: `Read \`n\` items and a capacity \`W\` (n ≤ 100, W ≤ 10 000), then each item's weight and value. Each item can be taken **at most once**. Print the maximum total value that fits.`,
      starterCode: starter("0/1 knapsack: best[w] = best value with capacity w", "int n, W;\ncin >> n >> W;", ["iostream", "vector", "algorithm"]),
      tests: [
        T("sample", "3 50\n10 60\n20 100\n30 120\n", "220", "sample"),
        T("nothing fits", "2 5\n6 10\n7 20\n", "0", "visible", "edge"),
        T("one item only once", "1 100\n10 5\n", "5", "hidden", "edge"),
        T("exact fit", "4 10\n5 10\n4 40\n6 30\n3 50\n", "90", "hidden"),
      ],
      hints: [
        "best[w] = the most value achievable with total weight ≤ w.",
        "For each item, update best from high w down to its weight.",
        "best[w] = max(best[w], best[w − weight] + value).",
        "Going downwards stops one item being used twice.",
      ],
      solution: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n, W;
    cin >> n >> W;
    vector<long long> best(W + 1, 0);
    for (int i = 0; i < n; i++) {
        int w;
        long long v;
        cin >> w >> v;
        for (int c = W; c >= w; c--) {
            best[c] = max(best[c], best[c - w] + v);
        }
    }
    cout << best[W] << endl;
    return 0;
}`,
      solutionNotes: "A one-dimensional table over capacities works if each item is processed once, iterating capacities from high to low so best[c − w] still refers to the state before this item.",
    },
  ),

  "bits-number-theory": practice(
    {
      title: "Fast power modulo m",
      prompt: `Read \`a\`, \`b\` and \`m\` (0 ≤ a ≤ 10⁹, 0 ≤ b ≤ 10¹⁸, 1 ≤ m ≤ 10⁹). Print aᵇ mod m. Multiplying b times is far too slow — use **binary exponentiation** (square the base and halve b).`,
      starterCode: starter("Binary exponentiation: square the base, look at b's bits", "long long a, b, m;\ncin >> a >> b >> m;"),
      tests: [
        T("2^10 mod 1000", "2 10 1000\n", "24", "sample"),
        T("b = 0", "5 0 7\n", "1", "visible", "edge"),
        T("m = 1", "123 456 1\n", "0", "hidden", "edge"),
        T("huge exponent", "2 1000000000000000000 1000000007\n", "719476260", "hidden", "edge"),
        T("big base", "999999999 999999999999 999999937\n", "151712473", "hidden"),
      ],
      hints: [
        "aᵇ = (a²)^(b/2) when b is even; one extra factor of a when b is odd.",
        "Loop while b > 0: if b is odd, multiply the result by the base.",
        "Then square the base and halve b.",
        "Take % m after every multiplication; values stay below 10¹⁸, which fits in long long.",
      ],
      solution: `#include <iostream>
using namespace std;

int main() {
    long long a, b, m;
    cin >> a >> b >> m;
    long long result = 1 % m;
    long long base = a % m;
    while (b > 0) {
        if (b & 1) result = result * base % m;
        base = base * base % m;
        b >>= 1;
    }
    cout << result << endl;
    return 0;
}`,
      solutionNotes: "About 60 loop steps for b = 10¹⁸ instead of 10¹⁸ multiplications. Starting with `1 % m` makes m = 1 give 0.",
    },
    {
      title: "Subsets with a given sum",
      prompt: `Read \`n\` (1 ≤ n ≤ 20), a target \`S\`, then n whole numbers. Print how many of the 2ⁿ subsets (including the empty one) add up to exactly S. Loop over **bitmasks**: bit i of the mask says whether item i is in the subset.`,
      starterCode: starter("For mask from 0 to 2^n - 1, add up the items whose bit is set", "int n;\nlong long S;\ncin >> n >> S;\nvector<long long> a(n);\nfor (auto& x : a) cin >> x;", ["iostream", "vector"]),
      tests: [
        T("sample", "4 5\n1 2 3 4\n", "2", "sample"),
        T("empty subset counts", "2 0\n1 2\n", "1", "visible", "edge"),
        T("duplicates are different items", "3 2\n2 2 2\n", "3", "hidden", "edge"),
        T("negatives", "3 0\n-1 1 0\n", "4", "hidden", "edge"),
        T("twenty items", "20 10\n1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1\n", "184756", "hidden"),
      ],
      hints: [
        "There are 1 << n masks.",
        "Item i is in the subset when (mask >> i) & 1 is 1.",
        "Sum the chosen items and compare with S.",
        "2²⁰ × 20 ≈ 2 × 10⁷ steps — fine.",
      ],
      solution: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    long long S;
    cin >> n >> S;
    vector<long long> a(n);
    for (auto& x : a) cin >> x;
    long long count = 0;
    for (int mask = 0; mask < (1 << n); mask++) {
        long long sum = 0;
        for (int i = 0; i < n; i++) {
            if ((mask >> i) & 1) sum += a[i];
        }
        if (sum == S) count++;
    }
    cout << count << endl;
    return 0;
}`,
      solutionNotes: "Each integer from 0 to 2ⁿ − 1 is a different subset, so one loop enumerates them all. It's exponential, so only for small n (about 20).",
    },
  ),
};
