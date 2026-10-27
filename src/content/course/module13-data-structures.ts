import type { CourseLesson } from "./types";

const r = String.raw;

/** Module 13 — Data structures: building the containers the STL gives you, and graphs. */
export const DATA_STRUCTURES_LESSONS: CourseLesson[] = [
  {
    id: "linked-lists",
    moduleId: "data-structures",
    title: "Linked lists",
    minutes: 30,
    concepts: ["linked list", "node", "head", "traversal", "insertion", "deletion", "std::list"],
    goals: [
      "How a linked list stores elements in separate nodes joined by pointers",
      "Inserting, traversing and removing nodes — and freeing them",
      "When a linked list beats a vector, and when it doesn't",
    ],
    intro: `A vector keeps elements side by side in one block of memory. A **linked list** scatters them: each element lives in its own **node**, which holds the value and a pointer to the next node. Inserting at the front is then just re-pointing one pointer — no shifting.`,
    sections: [
      {
        title: "Nodes and the head pointer",
        body: `\`\`\`cpp
struct Node {
    int value;
    Node* next;     // nullptr marks the end
};

Node* head = nullptr;              // an empty list
head = new Node{3, head};          // insert 3 at the front
head = new Node{2, head};          // list is now 2 -> 3
\`\`\`

The list is reached through **head** only. Lose the head pointer and the whole list is unreachable (a leak).`,
      },
      {
        title: "Traversal, removal and cleanup",
        body: `Walk with a cursor until it becomes \`nullptr\`:

\`\`\`cpp
for (Node* cur = head; cur != nullptr; cur = cur->next) { ... }
\`\`\`

\`cur->next\` is shorthand for \`(*cur).next\`. To **remove** the node after \`prev\`: remember it, link around it, then delete it:

\`\`\`cpp
Node* gone = prev->next;
prev->next = gone->next;
delete gone;
\`\`\`

Every \`new Node\` needs a matching \`delete\` — free the list by walking it and deleting node by node.`,
      },
      {
        title: "List or vector?",
        body: `| | vector | linked list |
|---|---|---|
| access element i | O(1) | O(n) — walk from head |
| insert/remove at front | O(n) — shift | O(1) |
| insert/remove after a known node | O(n) | O(1) |
| memory | compact, cache-friendly | one allocation per node |

In practice \`vector\` wins most of the time because of the cache. \`std::list\` (doubly linked) exists for the cases where O(1) splicing really matters. Linked lists also appear inside other structures — hash table buckets, adjacency lists.`,
      },
    ],
    mistakes: [
      { title: "Losing the rest of the list", body: "Deleting a node before saving `node->next` leaves you with no way to reach the remaining nodes. Save `next` first." },
      { title: "Dereferencing nullptr at the end", body: "`cur->next->value` crashes when `cur` is the last node. Check `cur->next != nullptr` first." },
      { title: "Forgetting the empty list", body: "Functions must handle `head == nullptr` — and reversing or removing must update `head` itself (pass `Node*&` or return the new head)." },
    ],
    example: {
      title: "Build, unlink, free",
      intro: "Three nodes are pushed to the front, the middle one is removed, then every node is freed.",
      code: r`#include <iostream>
using namespace std;

struct Node {
    int value;
    Node* next;
};

void pushFront(Node*& head, int v) {
    head = new Node{v, head};
}

void print(const Node* head) {
    for (const Node* cur = head; cur != nullptr; cur = cur->next) {
        cout << cur->value << " -> ";
    }
    cout << "null" << endl;
}

void freeList(Node*& head) {
    while (head != nullptr) {
        Node* nextNode = head->next;
        delete head;
        head = nextNode;
    }
}

int main() {
    Node* head = nullptr;
    pushFront(head, 3);
    pushFront(head, 2);
    pushFront(head, 1);
    print(head);
    Node* second = head->next;
    head->next = second->next;
    delete second;
    print(head);
    freeList(head);
    print(head);
    return 0;
}`,
      output: "1 -> 2 -> 3 -> null\n1 -> 3 -> null\nnull\n",
      notes: [
        { line: 10, text: "The new node points at the old head, then becomes the head." },
        { line: 14, text: "Walk node to node until the cursor falls off the end." },
        { line: 22, text: "Save `next` before deleting, or the rest of the list is lost." },
        { line: 35, text: "Link around the middle node, then free it." },
      ],
    },
    quickCheck: {
      prompt: "The list is `5 -> 8 -> 2 -> null`. After `head = head->next;` (and nothing else), what's true?",
      options: [
        { id: "a", text: "The list is 8 -> 2 and nothing is wrong", feedback: "The list *reads* 8 -> 2, but what happened to the node holding 5?" },
        { id: "b", text: "The list is 8 -> 2, and the node holding 5 is leaked", feedback: "Right: nothing points to it any more and it was never deleted." },
        { id: "c", text: "The list is now empty", feedback: "`head` moved one step; the other nodes are still linked." },
      ],
      correct: "b",
      explanation: "Removing the first node properly: `Node* old = head; head = head->next; delete old;`.",
    },
    exercise: {
      title: "Reverse a linked list",
      prompt: `Complete \`Node* reverse(Node* head)\`: reverse the list **by re-pointing the \`next\` pointers** (don't create new nodes) and return the new head.

\`main\` builds the list from the input (\`n\`, then \`n\` values in order), reverses it, prints the values and frees the nodes.`,
      starterCode: r`#include <iostream>
using namespace std;

struct Node {
    int value;
    Node* next;
};

Node* reverse(Node* head) {
    // Re-point every next pointer; return the new head.
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
        if (head == nullptr) {
            head = node;
        } else {
            tail->next = node;
        }
        tail = node;
    }
    head = reverse(head);
    for (Node* cur = head; cur != nullptr; cur = cur->next) {
        cout << cur->value << " ";
    }
    cout << endl;
    while (head != nullptr) {
        Node* next = head->next;
        delete head;
        head = next;
    }
    return 0;
}`,
      tests: [
        { label: "1 2 3 4", input: "4\n1 2 3 4\n", output: "4 3 2 1", visibility: "sample", category: "normal" },
        { label: "two nodes", input: "2\n9 8\n", output: "8 9", visibility: "hidden", category: "boundary" },
        { label: "single node", input: "1\n7\n", output: "7", visibility: "hidden", category: "edge" },
        { label: "duplicates", input: "5\n1 1 2 2 3\n", output: "3 2 2 1 1", visibility: "hidden", category: "normal" },
      ],
      compare: "tokens",
      hints: [
        "If you point the first node's `next` backwards, how do you still reach the second node?",
        "Keep three pointers: `prev` (already reversed part), `cur` (node being turned), and `next` (saved before you change `cur->next`).",
        "Start with `prev = nullptr`, `cur = head`. Each step: save `next = cur->next`, set `cur->next = prev`, then move `prev = cur; cur = next;`.",
        "When `cur` becomes `nullptr`, `prev` is the new head: `return prev;`. An empty list returns `nullptr` automatically.",
      ],
      solution: r`#include <iostream>
using namespace std;

struct Node {
    int value;
    Node* next;
};

Node* reverse(Node* head) {
    Node* prev = nullptr;
    Node* cur = head;
    while (cur != nullptr) {
        Node* next = cur->next;
        cur->next = prev;
        prev = cur;
        cur = next;
    }
    return prev;
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
        if (head == nullptr) {
            head = node;
        } else {
            tail->next = node;
        }
        tail = node;
    }
    head = reverse(head);
    for (Node* cur = head; cur != nullptr; cur = cur->next) {
        cout << cur->value << " ";
    }
    cout << endl;
    while (head != nullptr) {
        Node* next = head->next;
        delete head;
        head = next;
    }
    return 0;
}`,
      solutionNotes: "The classic three-pointer reversal: O(n) time, O(1) extra space, and no new nodes. Saving `next` before overwriting `cur->next` is the one step that can't be skipped.",
    },
    explainAgain: `A linked list is a treasure hunt: each clue (node) holds a prize (value) and says where the next clue is hidden. You can only start from the first clue (head). Adding a clue at the start is easy — write the old first location on the new clue. Reversing means rewriting every clue to point back the way you came.`,
    summary: [
      "A linked list is nodes holding a value and a `next` pointer; `head` is the only entry point.",
      "Insert/remove at a known spot is O(1); reaching element i is O(n).",
      "Save `next` before deleting or re-pointing, and free every node you allocate.",
    ],
  },

  {
    id: "trees-bst",
    moduleId: "data-structures",
    title: "Trees and binary search trees",
    minutes: 30,
    concepts: ["tree", "binary tree", "binary search tree", "root", "leaf", "height", "inorder traversal"],
    goals: [
      "Tree vocabulary: root, child, leaf, height",
      "The binary-search-tree rule, and inserting and searching with it",
      "Recursive traversals — and why inorder visits a BST in sorted order",
    ],
    intro: `Family trees, folders on a disk, a tournament bracket: data that **branches**. In a **binary tree** every node has at most two children. Add one ordering rule and you get a **binary search tree (BST)**, where finding a value works like binary search — but the structure can grow and shrink.`,
    sections: [
      {
        title: "Vocabulary and the BST rule",
        body: `The top node is the **root**; nodes with no children are **leaves**; the **height** is the number of nodes on the longest root-to-leaf path (an empty tree has height 0).

**BST rule:** for every node, everything in its **left** subtree is smaller and everything in its **right** subtree is greater or equal.

\`\`\`cpp
struct Node {
    int value;
    Node* left = nullptr;
    Node* right = nullptr;
    Node(int v) : value(v) {}
};
\`\`\``,
      },
      {
        title: "Recursion fits trees",
        body: `A tree is made of smaller trees, so tree functions are naturally recursive: handle the empty tree (base case), then combine the answers for the left and right subtrees.

\`\`\`cpp
Node* insert(Node* root, int v) {
    if (root == nullptr) return new Node(v);
    if (v < root->value) root->left = insert(root->left, v);
    else root->right = insert(root->right, v);
    return root;
}
\`\`\`

**Inorder** traversal (left, node, right) visits a BST in **sorted order**. Preorder (node, left, right) and postorder (left, right, node) are the other two classics — postorder is how you delete a tree.`,
      },
      {
        title: "Balance matters",
        body: `Searching a BST costs O(height). A **balanced** tree has height about log₂ n — fast. But inserting already-sorted data (1, 2, 3, …) builds a "tree" that is really a linked list: height n, O(n) search. Self-balancing trees (red-black, AVL) fix this; \`std::map\` and \`std::set\` are red-black trees under the hood.`,
      },
    ],
    mistakes: [
      { title: "No base case for the empty tree", body: "Every recursive tree function must handle `root == nullptr` first, or it dereferences a null pointer." },
      { title: "Forgetting to re-attach after insert", body: "`insert(root->left, v);` without `root->left = …` loses the new node when the subtree was empty." },
      { title: "Height off by one", body: "Decide your convention and stick to it. Here: empty tree 0, single node 1, so `height = 1 + max(left, right)`." },
    ],
    example: {
      title: "A BST of seven values",
      intro: "Insert, print in order, search, and free the tree with a postorder walk.",
      code: r`#include <iostream>
using namespace std;

struct Node {
    int value;
    Node* left = nullptr;
    Node* right = nullptr;
    Node(int v) : value(v) {}
};

Node* insert(Node* root, int v) {
    if (root == nullptr) {
        return new Node(v);
    }
    if (v < root->value) {
        root->left = insert(root->left, v);
    } else {
        root->right = insert(root->right, v);
    }
    return root;
}

bool contains(const Node* root, int v) {
    while (root != nullptr) {
        if (v == root->value) {
            return true;
        }
        root = (v < root->value) ? root->left : root->right;
    }
    return false;
}

void inorder(const Node* root) {
    if (root == nullptr) {
        return;
    }
    inorder(root->left);
    cout << root->value << " ";
    inorder(root->right);
}

void destroy(Node* root) {
    if (root == nullptr) {
        return;
    }
    destroy(root->left);
    destroy(root->right);
    delete root;
}

int main() {
    Node* root = nullptr;
    for (int v : {50, 30, 70, 20, 40, 60, 80}) {
        root = insert(root, v);
    }
    inorder(root);
    cout << endl;
    cout << "60? " << (contains(root, 60) ? "yes" : "no") << endl;
    cout << "65? " << (contains(root, 65) ? "yes" : "no") << endl;
    destroy(root);
    return 0;
}`,
      output: "20 30 40 50 60 70 80 \n60? yes\n65? no\n",
      notes: [
        { line: 12, text: "Base case: an empty spot is where the new value goes." },
        { line: 28, text: "Each comparison discards one whole subtree — like binary search." },
        { line: 37, text: "Left, node, right: a BST comes out sorted." },
        { line: 46, text: "Postorder: free both children before the node itself." },
      ],
    },
    quickCheck: {
      prompt: "Inserting 10, 5, 15, 3 into an empty BST: where does 3 go?",
      options: [
        { id: "a", text: "Right child of 5", feedback: "3 < 5, so it goes to the left." },
        { id: "b", text: "Left child of 5", feedback: "Right: 3 < 10 → go left to 5; 3 < 5 → left child of 5." },
        { id: "c", text: "Left child of 15", feedback: "3 < 10 sends it into 10's left subtree, away from 15." },
      ],
      correct: "b",
      explanation: "At each node, smaller goes left and greater-or-equal goes right, until an empty spot is found.",
    },
    exercise: {
      title: "Height and leaves",
      prompt: `Complete two recursive functions:

- \`int height(const Node* root)\` — 0 for an empty tree, 1 for a single node, otherwise 1 + the larger child height.
- \`int countLeaves(const Node* root)\` — the number of nodes with **no** children.

\`main\` inserts \`n\` values into a BST (duplicates go right) and prints \`height H leaves L\`.`,
      starterCode: r`#include <iostream>
using namespace std;

struct Node {
    int value;
    Node* left = nullptr;
    Node* right = nullptr;
    Node(int v) : value(v) {}
};

Node* insert(Node* root, int v) {
    if (root == nullptr) {
        return new Node(v);
    }
    if (v < root->value) {
        root->left = insert(root->left, v);
    } else {
        root->right = insert(root->right, v);
    }
    return root;
}

int height(const Node* root) {
    return 0;
}

int countLeaves(const Node* root) {
    return 0;
}

void destroy(Node* root) {
    if (root == nullptr) {
        return;
    }
    destroy(root->left);
    destroy(root->right);
    delete root;
}

int main() {
    int n;
    cin >> n;
    Node* root = nullptr;
    for (int i = 0; i < n; i++) {
        int v;
        cin >> v;
        root = insert(root, v);
    }
    cout << "height " << height(root) << " leaves " << countLeaves(root) << endl;
    destroy(root);
    return 0;
}`,
      tests: [
        { label: "balanced seven", input: "7\n50 30 70 20 40 60 80\n", output: "height 3 leaves 4", visibility: "sample", category: "normal" },
        { label: "sorted input", input: "5\n1 2 3 4 5\n", output: "height 5 leaves 1", visibility: "sample", category: "edge" },
        { label: "single node", input: "1\n42\n", output: "height 1 leaves 1", visibility: "hidden", category: "boundary" },
        { label: "uneven tree", input: "6\n8 3 10 1 6 14\n", output: "height 3 leaves 3", visibility: "hidden", category: "normal" },
        { label: "empty tree", input: "0\n", output: "height 0 leaves 0", visibility: "hidden", category: "edge" },
      ],
      compare: "tokens",
      hints: [
        "What's the answer for an empty tree, and for a tree whose children's answers you already know?",
        "Both functions: base case `root == nullptr` → 0. Then combine the results of the two subtrees.",
        "height: `1 + max(height(root->left), height(root->right))`. A leaf is a node where both children are `nullptr`.",
        "countLeaves: `if (!root) return 0; if (!root->left && !root->right) return 1; return countLeaves(root->left) + countLeaves(root->right);`",
      ],
      solution: r`#include <iostream>
using namespace std;

struct Node {
    int value;
    Node* left = nullptr;
    Node* right = nullptr;
    Node(int v) : value(v) {}
};

Node* insert(Node* root, int v) {
    if (root == nullptr) {
        return new Node(v);
    }
    if (v < root->value) {
        root->left = insert(root->left, v);
    } else {
        root->right = insert(root->right, v);
    }
    return root;
}

int height(const Node* root) {
    if (root == nullptr) {
        return 0;
    }
    int l = height(root->left);
    int r = height(root->right);
    return 1 + (l > r ? l : r);
}

int countLeaves(const Node* root) {
    if (root == nullptr) {
        return 0;
    }
    if (root->left == nullptr && root->right == nullptr) {
        return 1;
    }
    return countLeaves(root->left) + countLeaves(root->right);
}

void destroy(Node* root) {
    if (root == nullptr) {
        return;
    }
    destroy(root->left);
    destroy(root->right);
    delete root;
}

int main() {
    int n;
    cin >> n;
    Node* root = nullptr;
    for (int i = 0; i < n; i++) {
        int v;
        cin >> v;
        root = insert(root, v);
    }
    cout << "height " << height(root) << " leaves " << countLeaves(root) << endl;
    destroy(root);
    return 0;
}`,
      solutionNotes: "Both are \"ask the children, combine\" recursions with the empty tree as base case. The sorted-input test shows the danger from the lesson: five values, height five — a list in disguise.",
    },
    explainAgain: `A BST is a well-organised library where every shelf has a sign: "smaller titles to the left, larger to the right". To find a book you never search the whole library — at each sign you turn one way and ignore the other half.`,
    summary: [
      "A BST keeps smaller values left and greater-or-equal values right of every node.",
      "Tree functions are recursive: empty tree as base case, then combine the subtrees.",
      "Inorder traversal gives sorted order; search cost is O(height), so balance matters.",
    ],
  },

  {
    id: "hashing-heaps",
    moduleId: "data-structures",
    title: "Hash tables and heaps",
    minutes: 30,
    concepts: ["hash table", "hash function", "bucket", "collision", "load factor", "heap", "priority queue", "top-k"],
    goals: [
      "How a hash table turns a key into a bucket — and what happens on collisions",
      "How a heap keeps the smallest (or largest) item at the top in O(log n)",
      "Combining `unordered_map` and sorting/heaps to answer \"top k\" questions",
    ],
    intro: `\`unordered_map\` and \`priority_queue\` felt like magic in the STL module. Underneath they are two classic structures: a **hash table** (jump straight to where a key should be) and a **heap** (a tree squeezed into an array that always knows its best element).`,
    sections: [
      {
        title: "Hash tables",
        body: `A **hash function** turns a key into a number; modulo the number of **buckets** gives the bucket index. To find a key, compute its bucket and look only there.

Two different keys can land in the same bucket — a **collision**. With **chaining**, each bucket is a small list. As long as the buckets stay short (the **load factor** = items / buckets stays low; the table grows and rehashes when it doesn't), lookups are **O(1) on average**. A terrible hash that sends everything to one bucket degrades to O(n).`,
      },
      {
        title: "Heaps",
        body: `A **binary heap** is a complete binary tree stored in an array: the children of index \`i\` are \`2i + 1\` and \`2i + 2\`, the parent is \`(i - 1) / 2\`. The **heap property**: every parent is ≤ its children (min-heap) — so the minimum is always at index 0.

- **push**: put the item at the end, then swap it up while it's smaller than its parent — O(log n).
- **pop**: move the last item to the root, then swap it down with its smaller child — O(log n).

\`priority_queue\` is exactly this (a max-heap by default).`,
      },
    ],
    mistakes: [
      { title: "Relying on unordered_map order", body: "Iteration order of a hash table is unspecified and can change after rehashing. Sort the results if the output needs an order." },
      { title: "Sorting everything for top-k", body: "Sorting all n items is O(n log n). A heap of size k gives the top k in O(n log k) — it matters when k is small and n is huge." },
      { title: "Using a heap to search", body: "A heap only knows its top element. Finding an arbitrary value in it is O(n) — use a set or hash table for that." },
    ],
    example: {
      title: "Buckets and a min-heap",
      intro: "A tiny hand-made hash table shows a collision, then a min-heap hands back numbers smallest first.",
      code: r`#include <iostream>
#include <queue>
#include <string>
#include <utility>
#include <vector>
using namespace std;

int bucketOf(const string& key, int buckets) {
    int sum = 0;
    for (char c : key) {
        sum += c;
    }
    return sum % buckets;
}

int main() {
    const int B = 5;
    vector<vector<pair<string, int>>> table(B);
    string keys[4] = {"apple", "mango", "kiwi", "fig"};
    for (int i = 0; i < 4; i++) {
        table[bucketOf(keys[i], B)].push_back({keys[i], (i + 1) * 10});
    }
    for (int b = 0; b < B; b++) {
        cout << "bucket " << b << ":";
        for (const auto& [k, v] : table[b]) {
            cout << " " << k << "=" << v;
        }
        cout << endl;
    }
    priority_queue<int, vector<int>, greater<int>> minHeap;
    for (int x : {42, 7, 19, 3}) {
        minHeap.push(x);
    }
    cout << "smallest first:";
    while (!minHeap.empty()) {
        cout << " " << minHeap.top();
        minHeap.pop();
    }
    cout << endl;
    return 0;
}`,
      output: "bucket 0: apple=10 mango=20 fig=40\nbucket 1: kiwi=30\nbucket 2:\nbucket 3:\nbucket 4:\nsmallest first: 3 7 19 42\n",
      notes: [
        { line: 8, text: "A (deliberately weak) hash: add up the character codes." },
        { line: 21, text: "Chaining: each bucket is a list, so collisions just share a bucket." },
        { line: 30, text: "`greater<int>` turns the default max-heap into a min-heap." },
      ],
    },
    quickCheck: {
      prompt: "In an array-based heap, what are the children of index 3?",
      options: [
        { id: "a", text: "4 and 5", feedback: "Those are just the next indexes, not the children." },
        { id: "b", text: "6 and 7", feedback: "Close — that's 2i and 2i + 1, which is the 1-based formula." },
        { id: "c", text: "7 and 8", feedback: "Right: with 0-based indexes the children are 2i + 1 and 2i + 2." },
      ],
      correct: "c",
      explanation: "0-based heap: children 2·3 + 1 = 7 and 2·3 + 2 = 8; parent (3 − 1) / 2 = 1.",
    },
    exercise: {
      title: "Top k frequent",
      prompt: `Read \`n\` and \`k\`, then \`n\` whole numbers. Print the \`k\` **most frequent** values, one per line as \`value count\`: highest count first, and for equal counts the **smaller value first**. If there are fewer than \`k\` distinct values, print them all.`,
      starterCode: r`#include <algorithm>
#include <iostream>
#include <unordered_map>
#include <utility>
#include <vector>
using namespace std;

int main() {
    int n, k;
    cin >> n >> k;
    // 1. Count each value with an unordered_map<int, int>.
    // 2. Move the (value, count) pairs into a vector and order them.
    // 3. Print the first k (or all, if there are fewer).

    return 0;
}`,
      tests: [
        { label: "top 2", input: "8 2\n4 1 4 2 1 4 3 3\n", output: "4 3\n1 2", visibility: "sample", category: "normal" },
        { label: "fewer distinct than k", input: "5 3\n9 9 9 9 9\n", output: "9 5", visibility: "hidden", category: "edge" },
        { label: "all counts equal", input: "6 6\n5 4 3 2 1 0\n", output: "0 1\n1 1\n2 1\n3 1\n4 1\n5 1", visibility: "hidden", category: "boundary" },
        { label: "tie with negatives", input: "7 1\n-2 -2 7 7 -2 7 0\n", output: "-2 3", visibility: "hidden", category: "edge" },
      ],
      compare: "lines",
      hints: [
        "Two separate jobs: counting, then ordering. Which structure suits each?",
        "Count with `unordered_map<int, int> freq; freq[x]++`. A hash table has no order, so copy the entries into a `vector<pair<int, int>>`.",
        "Sort the vector with a lambda: higher count first; on equal counts, smaller value first.",
        "Then print `min(k, (int)v.size())` entries as `value count`.",
      ],
      solution: r`#include <algorithm>
#include <iostream>
#include <unordered_map>
#include <utility>
#include <vector>
using namespace std;

int main() {
    int n, k;
    cin >> n >> k;
    unordered_map<int, int> freq;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        freq[x]++;
    }
    vector<pair<int, int>> v(freq.begin(), freq.end());
    sort(v.begin(), v.end(), [](const pair<int, int>& a, const pair<int, int>& b) {
        if (a.second != b.second) {
            return a.second > b.second;
        }
        return a.first < b.first;
    });
    int shown = min(k, (int)v.size());
    for (int i = 0; i < shown; i++) {
        cout << v[i].first << " " << v[i].second << endl;
    }
    return 0;
}`,
      solutionNotes: "Hash table for O(1) average counting, then an explicit order because hash tables have none. For huge inputs with small k, a size-k heap would avoid sorting every distinct value.",
    },
    explainAgain: `A hash table is a post office with numbered pigeonholes: a rule turns each name into a pigeonhole number, so you walk straight to the right hole. Sometimes two names share a hole (a collision) — then you check the few letters inside.

A heap is a tournament: the winner always sits at the top. When the winner leaves, a quick replay of just one path finds the next winner.`,
    summary: [
      "Hash tables map keys to buckets; collisions are chained; average O(1) while buckets stay short.",
      "A heap is an array-shaped tree whose top is always the min (or max); push/pop are O(log n).",
      "Hash tables have no order — sort (or use a heap) when the output needs one.",
    ],
  },

  {
    id: "graphs-bfs-dfs",
    moduleId: "data-structures",
    title: "Graphs: BFS and DFS",
    minutes: 35,
    concepts: ["graph", "vertex", "edge", "adjacency list", "BFS", "DFS", "shortest path", "connected components"],
    goals: [
      "Representing a graph with an adjacency list",
      "Breadth-first search (BFS) and why it finds shortest paths in unweighted graphs",
      "Depth-first search (DFS) for exploring and counting connected components",
    ],
    intro: `Road maps, friendships, web links, course prerequisites: all **graphs** — **vertices** (things) joined by **edges** (connections). Two searches unlock most graph problems: **BFS** spreads out level by level like a ripple; **DFS** follows one path as deep as it can before backing up.`,
    sections: [
      {
        title: "Adjacency lists",
        body: `Number the vertices 0 … n − 1 and store, for each vertex, the list of its neighbours:

\`\`\`cpp
vector<vector<int>> adj(n);
adj[u].push_back(v);      // edge u — v
adj[v].push_back(u);      // undirected: add both directions
\`\`\`

Memory is O(n + m) for m edges — much better than an n × n grid when most pairs aren't connected.`,
      },
      {
        title: "BFS: level by level",
        body: `\`\`\`cpp
vector<int> dist(n, -1);
queue<int> q;
dist[s] = 0;
q.push(s);
while (!q.empty()) {
    int u = q.front(); q.pop();
    for (int v : adj[u]) {
        if (dist[v] == -1) {          // not seen yet
            dist[v] = dist[u] + 1;
            q.push(v);
        }
    }
}
\`\`\`

The queue processes all vertices at distance 1, then 2, and so on — so the first time BFS reaches a vertex is along a **shortest path** (fewest edges). O(n + m).`,
      },
      {
        title: "DFS: go deep, then back up",
        body: `\`\`\`cpp
void dfs(int u, const vector<vector<int>>& adj, vector<bool>& seen) {
    seen[u] = true;
    for (int v : adj[u])
        if (!seen[v]) dfs(v, adj, seen);
}
\`\`\`

Starting a DFS from every unseen vertex and counting how many times you start gives the number of **connected components**. DFS also detects cycles and orders tasks with dependencies (topological sort). Very deep graphs can overflow the call stack — an explicit stack avoids that.`,
      },
    ],
    mistakes: [
      { title: "Marking visited too late", body: "In BFS, mark a vertex when you **push** it, not when you pop it — otherwise it can be pushed many times." },
      { title: "One-way edges by accident", body: "For an undirected graph, add the edge to both `adj[u]` and `adj[v]`." },
      { title: "Using DFS for shortest paths", body: "DFS finds *a* path, not the shortest. In unweighted graphs use BFS; with weights you need Dijkstra." },
    ],
    example: {
      title: "Distances, an isolated vertex and a DFS order",
      intro: "Six vertices: BFS distances from 0, the DFS visiting order, and the number of components.",
      code: r`#include <iostream>
#include <queue>
#include <vector>
using namespace std;

void dfs(int u, const vector<vector<int>>& adj, vector<bool>& seen, vector<int>& order) {
    seen[u] = true;
    order.push_back(u);
    for (int v : adj[u]) {
        if (!seen[v]) {
            dfs(v, adj, seen, order);
        }
    }
}

int main() {
    int n = 6;
    vector<vector<int>> adj(n);
    int edges[5][2] = {{0, 1}, {0, 2}, {1, 3}, {2, 3}, {3, 4}};
    for (auto& e : edges) {
        adj[e[0]].push_back(e[1]);
        adj[e[1]].push_back(e[0]);
    }
    vector<int> dist(n, -1);
    queue<int> q;
    dist[0] = 0;
    q.push(0);
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
    cout << "distances from 0:";
    for (int d : dist) {
        cout << " " << d;
    }
    cout << endl;
    vector<bool> seen(n, false);
    vector<int> order;
    int components = 0;
    for (int s = 0; s < n; s++) {
        if (!seen[s]) {
            components++;
            dfs(s, adj, seen, order);
        }
    }
    cout << "dfs order:";
    for (int u : order) {
        cout << " " << u;
    }
    cout << endl << "components: " << components << endl;
    return 0;
}`,
      output: "distances from 0: 0 1 1 2 3 -1\ndfs order: 0 1 3 2 4 5\ncomponents: 2\n",
      notes: [
        { line: 11, text: "DFS dives into the first unseen neighbour before trying the next." },
        { line: 21, text: "Undirected: each edge is added in both directions." },
        { line: 33, text: "First visit = shortest distance; mark it as soon as it's queued." },
        { line: 49, text: "Each fresh DFS start is a new connected component (vertex 5 is alone)." },
      ],
    },
    quickCheck: {
      prompt: "Why does BFS find shortest paths in an unweighted graph?",
      options: [
        { id: "a", text: "It always picks the smallest-numbered neighbour", feedback: "The order of neighbours doesn't matter for distances." },
        { id: "b", text: "Its queue finishes every vertex at distance d before any at distance d + 1", feedback: "Right: so the first time a vertex is reached is along a path with the fewest edges." },
        { id: "c", text: "It tries every possible path", feedback: "That would be exponential; BFS visits each vertex once." },
      ],
      correct: "b",
      explanation: "The FIFO queue processes vertices in order of distance, so the first discovery is the shortest.",
    },
    exercise: {
      title: "Shortest hops",
      prompt: `An undirected graph has \`n\` vertices (0 … n − 1) and \`m\` edges. Read \`n m\`, then \`m\` lines \`u v\`, then a start vertex \`s\`.

Print the **fewest number of edges** from \`s\` to every vertex, separated by spaces, with \`-1\` for vertices that can't be reached.`,
      starterCode: r`#include <iostream>
#include <queue>
#include <vector>
using namespace std;

vector<int> bfs(const vector<vector<int>>& adj, int s) {
    vector<int> dist(adj.size(), -1);
    // Breadth-first search from s.
    return dist;
}

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
    int s;
    cin >> s;
    vector<int> dist = bfs(adj, s);
    for (int i = 0; i < n; i++) {
        cout << dist[i] << " ";
    }
    cout << endl;
    return 0;
}`,
      tests: [
        { label: "six vertices", input: "6 5\n0 1\n0 2\n1 3\n2 3\n3 4\n0\n", output: "0 1 1 2 3 -1", visibility: "sample", category: "normal" },
        { label: "a path, from the far end", input: "4 3\n0 1\n1 2\n2 3\n3\n", output: "3 2 1 0", visibility: "hidden", category: "normal" },
        { label: "no edges", input: "3 0\n1\n", output: "-1 0 -1", visibility: "hidden", category: "edge" },
        { label: "with cycles", input: "5 6\n0 1\n1 2\n2 0\n2 3\n3 4\n4 2\n0\n", output: "0 1 1 2 2", visibility: "hidden", category: "boundary" },
      ],
      compare: "tokens",
      hints: [
        "Which container processes vertices in the order they were discovered?",
        "A `queue<int>`. Start with `dist[s] = 0` and push `s`.",
        "Pop `u`; for each neighbour `v` with `dist[v] == -1`, set `dist[v] = dist[u] + 1` and push `v`.",
        "Loop `while (!q.empty())`. Vertices never reached keep their `-1` — exactly the output needed.",
      ],
      solution: r`#include <iostream>
#include <queue>
#include <vector>
using namespace std;

vector<int> bfs(const vector<vector<int>>& adj, int s) {
    vector<int> dist(adj.size(), -1);
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
    return dist;
}

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
    int s;
    cin >> s;
    vector<int> dist = bfs(adj, s);
    for (int i = 0; i < n; i++) {
        cout << dist[i] << " ";
    }
    cout << endl;
    return 0;
}`,
      solutionNotes: "`dist[v] == -1` doubles as the visited check, so each vertex is queued once: O(n + m). Cycles can't cause repeats because a vertex's distance is fixed the first time it's seen.",
    },
    explainAgain: `BFS is news spreading through a class: first your friends hear it (1 hop), then their friends (2 hops), and so on — so the first time someone hears it, it took the fewest hops. DFS is exploring a maze with one hand on the wall: go as deep as possible, and only back up at dead ends.`,
    summary: [
      "Store graphs as adjacency lists: `vector<vector<int>>`, both directions for undirected edges.",
      "BFS with a queue gives shortest paths (in edges) in O(n + m); mark vertices when you queue them.",
      "DFS explores deeply; restarting it from unseen vertices counts connected components.",
    ],
  },
];
