import type { CourseLesson } from "./types";
import { practice, starter, T } from "./practice/helpers";

const r = String.raw;

/** New lessons for Module 8 (pointers, references, dynamic memory) and Module 9 (OOP). */
export const EXTRA_POINTERS_OOP_LESSONS: CourseLesson[] = [
  // ── Module 8 ──────────────────────────────────────────────────────────────
  {
    id: "references-depth",
    moduleId: "pointers",
    after: "pointers-basics",
    title: "References in depth",
    minutes: 15,
    concepts: ["reference", "const reference", "alias", "range-for"],
    goals: [
      "Use references as aliases, and `const&` to pass big objects cheaply",
      "Return references safely — and recognise dangling ones",
      "Choose between a reference and a pointer",
    ],
    intro: `A reference is another name for an existing object. You've used them for parameters that a function changes; they're also the standard way to pass large objects without copying, to return access to an element, and to modify elements in a range-for loop.`,
    sections: [
      {
        title: "Three uses of &",
        body: `\`\`\`cpp
void addBonus(int& score);                 // 1. change the caller's variable
long long total(const vector<int>& v);     // 2. read a big object without copying it
for (auto& x : v) x *= 2;                  // 3. change each element in a loop
\`\`\`

\`const T&\` is the default for passing anything bigger than a few numbers (strings, vectors, objects): no copy, and the function promises not to change it.`,
      },
      {
        title: "Returning a reference",
        body: `A function may return a reference to something that **outlives the call** — an element of a container passed in, or a member of an object:

\`\`\`cpp
int& largest(vector<int>& v);       // fine: refers into the caller's vector
largest(v) = 0;                     // changes that element
\`\`\`

Never return a reference to a **local** variable: it is destroyed when the function returns, leaving a *dangling* reference.`,
      },
      {
        title: "Reference or pointer?",
        body: `| | Reference | Pointer |
| --- | --- | --- |
| Can be null | no | yes (\`nullptr\`) |
| Can be re-pointed | no | yes |
| Syntax | like the object | \`*p\`, \`p->x\` |
| Use for | parameters, aliases | optional/changeable links, arrays, dynamic memory |

Prefer references when "there is always exactly one object"; use pointers when "maybe none" or "it can change".`,
      },
    ],
    mistakes: [
      { title: "Copying by accident", body: "`void f(vector<int> v)` copies the whole vector. Use `const vector<int>&` when you only read it." },
      { title: "Range-for without &", body: "`for (auto x : v) x = 0;` changes copies. Use `auto&`." },
      { title: "Returning a reference to a local", body: "`string& f() { string s; return s; }` dangles. Return by value instead." },
    ],
    example: {
      title: "Aliases, const refs and returned refs",
      intro: "One vector, three kinds of reference.",
      code: r`#include <iostream>
#include <vector>
using namespace std;

long long total(const vector<int>& v) {
    long long s = 0;
    for (int x : v) s += x;
    return s;
}

int& largest(vector<int>& v) {
    int best = 0;
    for (int i = 1; i < (int)v.size(); i++)
        if (v[i] > v[best]) best = i;
    return v[best];
}

int main() {
    vector<int> v = {4, 9, 2};
    for (auto& x : v) x += 1;
    cout << total(v) << endl;
    largest(v) = 0;
    for (int x : v) cout << x << " ";
    cout << endl;
    int a = 5;
    int& alias = a;
    alias = 8;
    cout << a << endl;
    return 0;
}`,
      output: "18\n5 0 3 \n8\n",
      notes: [
        { line: 5, text: "const& — reads the vector without copying it." },
        { line: 11, text: "Returns a reference into the caller's vector." },
        { line: 20, text: "auto& changes the elements themselves: 5 10 3." },
        { line: 22, text: "Assigning through the returned reference zeroes the 10." },
      ],
    },
    quickCheck: {
      prompt: "Which parameter is best for a function that only *prints* a large `vector<string>`?",
      options: [
        { id: "a", text: "`const vector<string>& v`", feedback: "Yes — no copy, and it can't be changed by accident." },
        { id: "b", text: "`vector<string> v`", feedback: "Works, but copies every string on every call." },
        { id: "c", text: "`vector<string>& v`", feedback: "Avoids the copy but suggests the function changes the vector, and refuses temporaries." },
      ],
      correct: "a",
      explanation: "Pass by const reference when you only read: cheap and safe.",
    },
    exercise: {
      title: "Scale in place",
      prompt: `Write \`void scale(vector<long long>& v, long long factor)\` that multiplies every element (use \`auto&\`), and \`long long total(const vector<long long>& v)\`. Read \`n\`, the numbers and a factor; scale them, then print the scaled numbers and, on a second line, their total.`,
      starterCode: r`#include <iostream>
#include <vector>
using namespace std;

// Write scale and total here

int main() {
    int n;
    cin >> n;
    vector<long long> v(n);
    for (auto& x : v) cin >> x;
    long long factor;
    cin >> factor;
    // call scale, print the values, then print total(v)

    return 0;
}`,
      tests: [
        { label: "sample", input: "3\n1 2 3\n10\n", output: "10 20 30\n60", visibility: "sample", category: "normal" },
        { label: "negative factor", input: "2\n5 -1\n-3\n", output: "-15 3\n-12", visibility: "hidden", category: "edge" },
        { label: "zero factor", input: "2\n9 9\n0\n", output: "0 0\n0", visibility: "hidden", category: "edge" },
        { label: "empty", input: "0\n7\n", output: "\n0", visibility: "hidden", category: "edge" },
      ],
      compare: "lines",
      hints: [
        "scale must change the caller's vector — which parameter type allows that?",
        "Inside scale: `for (auto& x : v) x *= factor;`.",
        "total only reads, so it takes `const vector<long long>&`.",
        "Print the values on one line, then the total on the next.",
      ],
      solution: r`#include <iostream>
#include <vector>
using namespace std;

void scale(vector<long long>& v, long long factor) {
    for (auto& x : v) x *= factor;
}

long long total(const vector<long long>& v) {
    long long s = 0;
    for (long long x : v) s += x;
    return s;
}

int main() {
    int n;
    cin >> n;
    vector<long long> v(n);
    for (auto& x : v) cin >> x;
    long long factor;
    cin >> factor;
    scale(v, factor);
    for (long long x : v) cout << x << " ";
    cout << endl;
    cout << total(v) << endl;
    return 0;
}`,
      solutionNotes: "`vector<long long>&` lets scale change the caller's vector; `const vector<long long>&` lets total read it without a copy. `auto&` in the loop modifies the elements themselves.",
    },
    practice: practice(
      {
        title: "Return the longer one",
        prompt: `Write \`const string& longer(const string& a, const string& b)\` returning a reference to the longer string (the first if equal). Read pairs of words until the input ends and print the longer of each pair.`,
        starterCode: starter("Print longer(a, b) for each pair", "string a, b;", ["iostream", "string"], "// Write const string& longer(const string& a, const string& b) here"),
        tests: [
          T("sample", "cat tiger\nhello hi\n", "tiger\nhello", "sample"),
          T("equal keeps first", "abc xyz\n", "abc", "visible", "edge"),
          T("one letter", "a bb\n", "bb", "hidden", "boundary"),
        ],
        compare: "lines",
        hints: [
          "Returning a reference avoids copying a string.",
          "It's safe here because a and b refer to the caller's strings, which still exist after the call.",
          "Compare a.size() and b.size().",
          "return a.size() >= b.size() ? a : b;",
        ],
        solution: r`#include <iostream>
#include <string>
using namespace std;

const string& longer(const string& a, const string& b) {
    return a.size() >= b.size() ? a : b;
}

int main() {
    string a, b;
    while (cin >> a >> b) {
        cout << longer(a, b) << endl;
    }
    return 0;
}`,
        solutionNotes: "The returned reference points at one of the caller's own strings, which outlive the call — that's what makes returning a reference safe.",
      },
      {
        title: "Row operations through references",
        prompt: `Read an r × c grid. Write \`vector<long long>& row(vector<vector<long long>>& g, int i)\` and use it for two commands until the input ends: \`inc R K\` adds K to every element of row R; \`swap A B\` swaps rows A and B (with \`std::swap\` on the two row references). Finally print the grid.`,
        starterCode: starter("Handle inc and swap using references returned by row(), then print the grid", "int r, c;\ncin >> r >> c;\nvector<vector<long long>> g(r, vector<long long>(c));\nfor (auto& rw : g) for (auto& x : rw) cin >> x;", ["iostream", "vector", "string", "utility"], "// Write vector<long long>& row(vector<vector<long long>>& g, int i) here"),
        tests: [
          T("sample", "2 3\n1 2 3\n4 5 6\ninc 0 10\nswap 0 1\n", "4 5 6\n11 12 13", "sample"),
          T("no commands", "1 1\n7\n", "7", "visible", "edge"),
          T("same row swap", "2 2\n1 2\n3 4\nswap 1 1\ninc 1 -3\n", "1 2\n0 1", "hidden", "edge"),
          T("several", "3 1\n1\n2\n3\nswap 0 2\ninc 2 5\nswap 1 2\n", "3\n6\n2", "hidden"),
        ],
        compare: "lines",
        hints: [
          "row(g, i) returns g[i] by reference, so changes go into the grid.",
          "inc: for (auto& x : row(g, R)) x += K;",
          "swap: swap(row(g, A), row(g, B));",
          "Print each row on its own line.",
        ],
        solution: r`#include <iostream>
#include <vector>
#include <string>
#include <utility>
using namespace std;

vector<long long>& row(vector<vector<long long>>& g, int i) {
    return g[i];
}

int main() {
    int r, c;
    cin >> r >> c;
    vector<vector<long long>> g(r, vector<long long>(c));
    for (auto& rw : g) for (auto& x : rw) cin >> x;
    string cmd;
    while (cin >> cmd) {
        if (cmd == "inc") {
            int R;
            long long K;
            cin >> R >> K;
            for (auto& x : row(g, R)) x += K;
        } else if (cmd == "swap") {
            int A, B;
            cin >> A >> B;
            swap(row(g, A), row(g, B));
        }
    }
    for (const auto& rw : g) {
        for (size_t j = 0; j < rw.size(); j++) cout << (j ? " " : "") << rw[j];
        cout << endl;
    }
    return 0;
}`,
        solutionNotes: "Returning `vector<long long>&` gives callers direct access to a row inside the grid — no copies. std::swap on two vectors just exchanges their buffers, so it's O(1).",
      },
    ),
    explainAgain: `A reference is a nickname. If Rahul's friends call him "Ronnie", anything you hand to Ronnie, Rahul gets. A \`const&\` nickname lets you look but not touch. And you can only use a nickname while the person exists — a reference to a local variable outlives its owner, which is why returning one is a bug.`,
    summary: [
      "`T&` changes the caller's object; `const T&` reads without copying.",
      "Use `auto&` in range-for to modify elements.",
      "Only return references to things that outlive the call.",
    ],
  },

  {
    id: "pointer-to-pointer",
    moduleId: "pointers",
    after: "pointers-arrays",
    title: "Pointers to pointers and arrays of pointers",
    minutes: 20,
    concepts: ["int**", "array of pointers", "dynamic 2D array", "pointer to pointer"],
    goals: [
      "Read and write types like `int**` and `const char* names[]`",
      "Build and free a dynamic 2D array with `new int*[rows]`",
      "Change a caller's pointer through a pointer to it",
    ],
    intro: `A pointer is just a variable holding an address — so a pointer can point at another pointer. That's how C-style code builds 2D arrays, lists of strings, and functions that change *which* object a caller's pointer refers to.`,
    sections: [
      {
        title: "Levels of indirection",
        body: `\`\`\`cpp
int x = 5;
int* p = &x;     // p holds x's address
int** pp = &p;   // pp holds p's address
**pp = 7;        // follow two arrows: x becomes 7
\`\`\`

Read types from right to left: \`int** pp\` is "pp is a pointer to a pointer to int".`,
      },
      {
        title: "Arrays of pointers",
        body: `\`\`\`cpp
const char* names[] = {"Asha", "Ravi", "Meera"};   // 3 pointers to string literals
int* rows[3];                                       // 3 pointers, e.g. to different arrays
\`\`\`

A dynamic 2D array is an array of row pointers, each pointing at its own row:

\`\`\`cpp
int** g = new int*[r];
for (int i = 0; i < r; i++) g[i] = new int[c];
// ... g[i][j] ...
for (int i = 0; i < r; i++) delete[] g[i];
delete[] g;
\`\`\``,
      },
      {
        title: "Changing the caller's pointer",
        body: `To change an \`int\`, a function needs an \`int*\`. To change an \`int*\` (make it point elsewhere), it needs an \`int**\` — or, in C++, a reference \`int*&\`:

\`\`\`cpp
void pushFront(Node** head, int v) { *head = new Node{v, *head}; }
pushFront(&head, 3);
\`\`\``,
      },
    ],
    mistakes: [
      { title: "Freeing in the wrong order", body: "Delete each row before the array of row pointers — otherwise you lose the row addresses." },
      { title: "One star too few", body: "`void setNull(Node* p) { p = nullptr; }` only changes a copy. Pass `Node**` or `Node*&`." },
      { title: "Hand-rolled 2D arrays in modern code", body: "`vector<vector<int>>` does the allocation and freeing for you. Know int** for reading older code." },
    ],
    example: {
      title: "Two levels, and an array of pointers",
      intro: "Following pointers to pointers, and sorting pointers instead of the strings they point at.",
      code: r`#include <iostream>
#include <algorithm>
#include <cstring>
using namespace std;

int main() {
    int x = 5;
    int* p = &x;
    int** pp = &p;
    **pp = 7;
    cout << x << " " << (*pp == &x) << endl;
    const char* names[] = {"Meera", "Asha", "Ravi"};
    sort(names, names + 3, [](const char* a, const char* b) { return strcmp(a, b) < 0; });
    for (const char* n : names) cout << n << " ";
    cout << endl;
    return 0;
}`,
      output: "7 1\nAsha Meera Ravi \n",
      notes: [
        { line: 10, text: "Two dereferences reach x itself." },
        { line: 12, text: "An array of three pointers to string literals." },
        { line: 13, text: "Sorting moves the pointers; the text itself never moves." },
      ],
    },
    quickCheck: {
      prompt: "`void reset(int* p) { p = nullptr; }` is called as `reset(q);`. What happens to q?",
      options: [
        { id: "a", text: "Nothing — the function changed its own copy of the pointer", feedback: "Right. To change q, pass `int**` (or `int*&`)." },
        { id: "b", text: "q becomes nullptr", feedback: "Pointers are passed by value like anything else." },
        { id: "c", text: "The int q points to becomes 0", feedback: "That would be `*p = 0`." },
      ],
      correct: "a",
      explanation: "The pointer itself is copied into the parameter; changing the copy doesn't affect the caller.",
    },
    exercise: {
      title: "A dynamic multiplication table",
      prompt: `Read \`r\` and \`c\` (1 ≤ r, c ≤ 50). Allocate a table with \`int** t = new int*[r]\` and one \`new int[c]\` per row, fill \`t[i][j] = (i + 1) * (j + 1)\`, print it (space-separated rows), then free everything in the right order.`,
      starterCode: r`#include <iostream>
using namespace std;

int main() {
    int r, c;
    cin >> r >> c;
    // allocate int** t, fill, print, then delete each row and the row array

    return 0;
}`,
      tests: [
        { label: "3 × 4", input: "3 4\n", output: "1 2 3 4\n2 4 6 8\n3 6 9 12", visibility: "sample", category: "normal" },
        { label: "1 × 1", input: "1 1\n", output: "1", visibility: "hidden", category: "boundary" },
        { label: "column", input: "3 1\n", output: "1\n2\n3", visibility: "hidden", category: "edge" },
        { label: "2 × 5", input: "2 5\n", output: "1 2 3 4 5\n2 4 6 8 10", visibility: "hidden", category: "normal" },
      ],
      compare: "lines",
      hints: [
        "First the array of row pointers: `int** t = new int*[r];`.",
        "Then each row: `t[i] = new int[c];`.",
        "Use `t[i][j]` like a normal 2D array.",
        "Free each `t[i]` with `delete[]`, then `delete[] t`.",
      ],
      solution: r`#include <iostream>
using namespace std;

int main() {
    int r, c;
    cin >> r >> c;
    int** t = new int*[r];
    for (int i = 0; i < r; i++) t[i] = new int[c];
    for (int i = 0; i < r; i++)
        for (int j = 0; j < c; j++) t[i][j] = (i + 1) * (j + 1);
    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) cout << t[i][j] << (j + 1 < c ? " " : "\n");
    }
    for (int i = 0; i < r; i++) delete[] t[i];
    delete[] t;
    return 0;
}`,
      solutionNotes: "`t[i][j]` follows the row pointer t[i], then indexes into that row. Each `new[]` gets one `delete[]` — rows first, then the pointer array.",
    },
    practice: practice(
      {
        title: "Sort pointers, not words",
        prompt: `Read \`n\` words into a \`vector<string>\`. Build a \`vector<const string*>\` with a pointer to each word and sort **the pointers** by word length (ties alphabetical). Print the words in that order, then print the original vector to show it never moved.`,
        starterCode: starter("Sort a vector of pointers; print through them, then print the original order", "int n;\ncin >> n;\nvector<string> words(n);\nfor (auto& w : words) cin >> w;", ["iostream", "string", "vector", "algorithm"]),
        tests: [
          T("sample", "4\npear fig banana kiwi\n", "fig kiwi pear banana\npear fig banana kiwi", "sample"),
          T("one", "1\nsolo\n", "solo\nsolo", "visible", "boundary"),
          T("ties", "3\ncc aa bb\n", "aa bb cc\ncc aa bb", "hidden", "edge"),
        ],
        compare: "lines",
        hints: [
          "ptrs.push_back(&w) for each word (use a reference in the loop!).",
          "The comparator receives two `const string*`.",
          "Dereference to compare: a->size(), *a < *b.",
          "Print *p for each pointer.",
        ],
        solution: r`#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<string> words(n);
    for (auto& w : words) cin >> w;
    vector<const string*> ptrs;
    for (const auto& w : words) ptrs.push_back(&w);
    sort(ptrs.begin(), ptrs.end(), [](const string* a, const string* b) {
        if (a->size() != b->size()) return a->size() < b->size();
        return *a < *b;
    });
    for (size_t i = 0; i < ptrs.size(); i++) cout << (i ? " " : "") << *ptrs[i];
    cout << endl;
    for (size_t i = 0; i < words.size(); i++) cout << (i ? " " : "") << words[i];
    cout << endl;
    return 0;
}`,
        solutionNotes: "Sorting pointers moves 8-byte addresses instead of whole strings, and leaves the original order intact. The pointers stay valid because `words` isn't resized afterwards.",
      },
      {
        title: "Linked list with Node**",
        prompt: `Using \`struct Node { int v; Node* next; };\`, write \`void pushFront(Node** head, int v)\` and \`bool popFront(Node** head, int* out)\` — both change the caller's head pointer **through a pointer to it**. Process commands \`push X\`, \`pop\` (print the value or \`empty\`) and \`show\` (print the list front to back, or \`empty\`). Free everything at the end.`,
        starterCode: r`#include <iostream>
#include <string>
using namespace std;

struct Node {
    int v;
    Node* next;
};

// Write pushFront(Node** head, int v) and popFront(Node** head, int* out) here

int main() {
    Node* head = nullptr;
    string cmd;
    while (cin >> cmd) {
        // push / pop / show
    }
    return 0;
}`,
        tests: [
          T("sample", "push 1\npush 2\nshow\npop\nshow\n", "2 1\n2\n1", "sample"),
          T("empty pop", "pop\nshow\n", "empty\nempty", "visible", "edge"),
          T("drain", "push 5\npop\npop\n", "5\nempty", "hidden", "edge"),
          T("many", "push 3\npush 4\npush 5\nshow\n", "5 4 3", "hidden"),
        ],
        compare: "lines",
        hints: [
          "pushFront: `*head = new Node{v, *head};` — the new node points at the old head.",
          "popFront: if (*head == nullptr) return false; save the node, move *head to next, delete it.",
          "Call them with `&head`.",
          "Free remaining nodes by popping until empty.",
        ],
        solution: r`#include <iostream>
#include <string>
using namespace std;

struct Node {
    int v;
    Node* next;
};

void pushFront(Node** head, int v) {
    *head = new Node{v, *head};
}

bool popFront(Node** head, int* out) {
    if (*head == nullptr) return false;
    Node* old = *head;
    *out = old->v;
    *head = old->next;
    delete old;
    return true;
}

int main() {
    Node* head = nullptr;
    string cmd;
    while (cin >> cmd) {
        if (cmd == "push") {
            int x;
            cin >> x;
            pushFront(&head, x);
        } else if (cmd == "pop") {
            int v;
            if (popFront(&head, &v)) cout << v << endl;
            else cout << "empty" << endl;
        } else if (cmd == "show") {
            if (!head) cout << "empty";
            for (Node* p = head; p; p = p->next) cout << p->v << (p->next ? " " : "");
            cout << endl;
        }
    }
    int dummy;
    while (popFront(&head, &dummy)) {}
    return 0;
}`,
        solutionNotes: "Because the functions receive the *address of* head, assigning `*head = …` changes main's variable. In C++ a reference `Node*& head` does the same job with less syntax.",
      },
    ),
    explainAgain: `Think of addresses written on slips of paper. A pointer is a slip with someone's house address. A pointer-to-pointer is a slip that says where the *first slip* is kept — so with it you can rub out and rewrite the first slip, sending it to a different house.`,
    summary: [
      "`int**` points at an `int*`; `**pp` follows both arrows.",
      "Dynamic 2D arrays: an array of row pointers, each row allocated separately (free rows first).",
      "To change a caller's pointer, pass `T**` (or `T*&`).",
    ],
  },

  {
    id: "shared-weak-ptr",
    moduleId: "pointers",
    after: "dynamic-memory",
    title: "shared_ptr and weak_ptr",
    minutes: 20,
    concepts: ["shared_ptr", "weak_ptr", "reference counting", "cycles"],
    goals: [
      "Share ownership with `shared_ptr` and read its use count",
      "Break ownership cycles with `weak_ptr`",
      "Use `weak_ptr::lock()` to check whether an object still exists",
    ],
    intro: `\`unique_ptr\` has exactly one owner. Sometimes several parts of a program genuinely need to keep an object alive — that's \`shared_ptr\`. Its one danger is cycles, which \`weak_ptr\` exists to break.`,
    sections: [
      {
        title: "Shared ownership",
        body: `\`\`\`cpp
auto a = make_shared<Doc>("plan");   // count = 1
auto b = a;                          // count = 2 — both own it
a.reset();                           // count = 1
b.reset();                           // count = 0 → Doc destroyed
\`\`\`

\`use_count()\` reports the number of owners. The object is destroyed when the last owner lets go.`,
      },
      {
        title: "The cycle problem",
        body: `If a parent owns its children with \`shared_ptr\`, and each child owns its parent with \`shared_ptr\`, then parent and child keep each other alive forever — even after the rest of the program has dropped them. That's a memory leak.

The fix: one direction must **not** own. A child refers to its parent with a \`weak_ptr\`.`,
      },
      {
        title: "weak_ptr",
        body: `A \`weak_ptr\` watches an object without keeping it alive:

\`\`\`cpp
weak_ptr<Node> parent = someShared;
if (auto p = parent.lock()) {   // a shared_ptr, or empty if the object is gone
    cout << p->name;
}
parent.expired();               // true once the object has been destroyed
\`\`\``,
      },
    ],
    mistakes: [
      { title: "shared_ptr everywhere", body: "Default to unique_ptr. Use shared_ptr only when ownership is genuinely shared." },
      { title: "Cycles of shared_ptr", body: "Parent ↔ child, observer ↔ subject: make the back-link a weak_ptr." },
      { title: "Using a weak_ptr directly", body: "There's no `->` on weak_ptr. Call `lock()` and check the result first." },
    ],
    example: {
      title: "Counting owners and watching",
      intro: "A weak_ptr notices when the last owner lets go.",
      code: r`#include <iostream>
#include <memory>
#include <string>
using namespace std;

int main() {
    auto a = make_shared<string>("report");
    weak_ptr<string> watcher = a;
    {
        auto b = a;
        cout << "owners: " << a.use_count() << endl;
    }
    cout << "owners: " << a.use_count() << endl;
    if (auto p = watcher.lock()) cout << "still alive: " << *p << endl;
    a.reset();
    cout << "expired: " << watcher.expired() << endl;
    return 0;
}`,
      output: "owners: 2\nowners: 1\nstill alive: report\nexpired: 1\n",
      notes: [
        { line: 8, text: "A weak_ptr doesn't add to the count." },
        { line: 10, text: "b is a second owner until its block ends." },
        { line: 14, text: "lock() gives a temporary owner if the object still exists." },
        { line: 15, text: "The last owner let go, so the string was destroyed." },
      ],
    },
    quickCheck: {
      prompt: "A and B each hold a `shared_ptr` to the other, and nothing else refers to them. What happens?",
      options: [
        { id: "a", text: "Neither is ever destroyed — a leak", feedback: "Right: each keeps the other's count at 1. Make one link a weak_ptr." },
        { id: "b", text: "Both are destroyed when they go out of scope", feedback: "Their counts never reach zero." },
        { id: "c", text: "The program crashes immediately", feedback: "No crash — just memory that's never freed." },
      ],
      correct: "a",
      explanation: "Reference counting can't free a cycle; weak_ptr breaks it.",
    },
    exercise: {
      title: "A family tree without a leak",
      prompt: `Each person \`Node\` owns their children (\`vector<shared_ptr<Node>>\`) and refers to their parent. The starter stores the parent as a \`shared_ptr\`, which creates cycles — so the tree is never freed. Change it to a \`weak_ptr\` and fix the path printing.

Input: the root's name, then \`n\` lines \`PARENT CHILD\`, then \`q\` names. For each name print the path up to the root (\`a -> b -> root\`). Finally the program drops every owner and reports whether the tree was freed.`,
      starterCode: r`#include <iostream>
#include <map>
#include <memory>
#include <string>
#include <vector>
using namespace std;

struct Node {
    string name;
    vector<shared_ptr<Node>> children;
    shared_ptr<Node> parent;   // BUG: owning back-link creates cycles
};

int main() {
    string rootName;
    int n;
    cin >> rootName >> n;
    map<string, shared_ptr<Node>> byName;
    auto root = make_shared<Node>();
    root->name = rootName;
    byName[rootName] = root;
    for (int i = 0; i < n; i++) {
        string p, c;
        cin >> p >> c;
        auto child = make_shared<Node>();
        child->name = c;
        child->parent = byName[p];
        byName[p]->children.push_back(child);
        byName[c] = child;
    }
    int q;
    cin >> q;
    for (int i = 0; i < q; i++) {
        string who;
        cin >> who;
        shared_ptr<Node> cur = byName[who];
        cout << cur->name;
        while (cur->parent) {
            cur = cur->parent;
            cout << " -> " << cur->name;
        }
        cout << endl;
    }
    weak_ptr<Node> check = root;
    byName.clear();
    root.reset();
    cout << (check.expired() ? "tree freed" : "memory leaked") << endl;
    return 0;
}`,
      tests: [
        { label: "sample", input: "Dadi 3\nDadi Papa\nPapa Riya\nDadi Chacha\n2\nRiya\nChacha\n", output: "Riya -> Papa -> Dadi\nChacha -> Dadi\ntree freed", visibility: "sample", category: "normal" },
        { label: "root only", input: "Solo 0\n1\nSolo\n", output: "Solo\ntree freed", visibility: "hidden", category: "edge" },
        { label: "chain", input: "A 3\nA B\nB C\nC D\n1\nD\n", output: "D -> C -> B -> A\ntree freed", visibility: "hidden", category: "normal" },
      ],
      compare: "lines",
      hints: [
        "Who should own whom? Parents own children; a child only *refers* to its parent.",
        "Change the member to `weak_ptr<Node> parent;`.",
        "To walk up: `auto p = cur->parent.lock();` — it's empty at the root.",
        "`while (auto p = cur->parent.lock()) { cur = p; cout << \" -> \" << cur->name; }`",
      ],
      solution: r`#include <iostream>
#include <map>
#include <memory>
#include <string>
#include <vector>
using namespace std;

struct Node {
    string name;
    vector<shared_ptr<Node>> children;
    weak_ptr<Node> parent;
};

int main() {
    string rootName;
    int n;
    cin >> rootName >> n;
    map<string, shared_ptr<Node>> byName;
    auto root = make_shared<Node>();
    root->name = rootName;
    byName[rootName] = root;
    for (int i = 0; i < n; i++) {
        string p, c;
        cin >> p >> c;
        auto child = make_shared<Node>();
        child->name = c;
        child->parent = byName[p];
        byName[p]->children.push_back(child);
        byName[c] = child;
    }
    int q;
    cin >> q;
    for (int i = 0; i < q; i++) {
        string who;
        cin >> who;
        shared_ptr<Node> cur = byName[who];
        cout << cur->name;
        while (auto p = cur->parent.lock()) {
            cur = p;
            cout << " -> " << cur->name;
        }
        cout << endl;
    }
    weak_ptr<Node> check = root;
    byName.clear();
    root.reset();
    cout << (check.expired() ? "tree freed" : "memory leaked") << endl;
    return 0;
}`,
      solutionNotes: "With an owning back-link, every parent–child pair kept each other alive. Making the parent link weak leaves a single owner chain from the root down, so dropping the root frees the whole tree.",
    },
    practice: practice(
      {
        title: "A cache that doesn't keep things alive",
        prompt: `Simulate a cache: \`open NAME\` creates a document owned by the program (in a map of \`shared_ptr\`); \`close NAME\` drops that owner; \`get NAME\` asks a **cache of \`weak_ptr\`s**: print \`hit\` if the document is still alive, or \`miss\` (it was closed or never opened). Every \`open\` also puts a weak_ptr in the cache.`,
        starterCode: starter("Keep owners in one map and weak_ptrs in the cache; answer get with lock()", "map<string, shared_ptr<string>> open;\nmap<string, weak_ptr<string>> cache;\nstring cmd, name;", ["iostream", "map", "memory", "string"]),
        tests: [
          T("sample", "open a\nget a\nclose a\nget a\n", "hit\nmiss", "sample"),
          T("never opened", "get z\n", "miss", "visible", "edge"),
          T("reopen", "open x\nclose x\nopen x\nget x\n", "hit", "hidden", "edge"),
          T("two docs", "open a\nopen b\nclose a\nget a\nget b\n", "miss\nhit", "hidden"),
        ],
        compare: "lines",
        hints: [
          "open: open[name] = make_shared<string>(name); cache[name] = open[name];",
          "close: open.erase(name) — the last owner disappears.",
          "get: look in the cache, then try lock().",
          "A missing cache entry is a miss too.",
        ],
        solution: r`#include <iostream>
#include <map>
#include <memory>
#include <string>
using namespace std;

int main() {
    map<string, shared_ptr<string>> open;
    map<string, weak_ptr<string>> cache;
    string cmd, name;
    while (cin >> cmd >> name) {
        if (cmd == "open") {
            open[name] = make_shared<string>(name);
            cache[name] = open[name];
        } else if (cmd == "close") {
            open.erase(name);
        } else if (cmd == "get") {
            auto it = cache.find(name);
            bool alive = it != cache.end() && !it->second.expired();
            cout << (alive ? "hit" : "miss") << endl;
        }
    }
    return 0;
}`,
        solutionNotes: "The cache remembers documents without owning them, so closing a document really frees it — the cache just notices afterwards.",
      },
      {
        title: "Observers that may leave",
        prompt: `A subject keeps a list of \`weak_ptr\` observers. Commands: \`join NAME\` (create an observer owned by a map, and register a weak_ptr in join order), \`leave NAME\` (drop its owner), \`notify\` (print the names of observers still alive, in join order, space-separated, or \`nobody\` — and remove dead entries from the list). After processing, print how many entries the list still holds.`,
        starterCode: starter("Store weak_ptrs; notify prints living observers and prunes dead ones", "map<string, shared_ptr<string>> owners;\nvector<weak_ptr<string>> observers;\nstring cmd;", ["iostream", "map", "memory", "string", "vector"]),
        tests: [
          T("sample", "join a\njoin b\njoin c\nleave b\nnotify\n", "a c\n2", "sample"),
          T("everyone left", "join a\nleave a\nnotify\n", "nobody\n0", "visible", "edge"),
          T("no notify", "join a\nleave a\n", "1", "hidden", "edge"),
          T("rejoin", "join x\nleave x\njoin x\nnotify\n", "x\n1", "hidden", "edge"),
        ],
        compare: "lines",
        hints: [
          "join: owners[name] = make_shared<string>(name); observers.push_back(owners[name]);",
          "leave: owners.erase(name).",
          "notify: build a new list with only the entries whose lock() succeeds, printing their names.",
          "The list size is printed after all commands — dead entries are only removed by notify.",
        ],
        solution: r`#include <iostream>
#include <map>
#include <memory>
#include <string>
#include <vector>
using namespace std;

int main() {
    map<string, shared_ptr<string>> owners;
    vector<weak_ptr<string>> observers;
    string cmd;
    while (cin >> cmd) {
        if (cmd == "join") {
            string name;
            cin >> name;
            owners[name] = make_shared<string>(name);
            observers.push_back(owners[name]);
        } else if (cmd == "leave") {
            string name;
            cin >> name;
            owners.erase(name);
        } else if (cmd == "notify") {
            vector<weak_ptr<string>> alive;
            string line;
            for (auto& w : observers) {
                if (auto p = w.lock()) {
                    line += (line.empty() ? "" : " ") + *p;
                    alive.push_back(w);
                }
            }
            observers = alive;
            cout << (line.empty() ? "nobody" : line) << endl;
        }
    }
    cout << observers.size() << endl;
    return 0;
}`,
        solutionNotes: "The subject never keeps observers alive; it simply skips (and forgets) the ones that have gone. This is the standard way to avoid subject ↔ observer cycles.",
      },
    ),
    explainAgain: `shared_ptr is a library book with a sign-out sheet: it stays on the shelf of the living as long as anyone has it signed out. weak_ptr is just knowing which book it is — you can check whether it's still in the library (\`lock()\`), but you're not on the sheet, so you don't keep it from being thrown away.`,
    summary: [
      "`shared_ptr`: shared ownership; destroyed when `use_count()` hits 0.",
      "Cycles of shared_ptr leak; make back-links `weak_ptr`.",
      "`weak_ptr::lock()` gives a shared_ptr if the object still exists.",
    ],
  },

  // ── Module 9 ──────────────────────────────────────────────────────────────
  {
    id: "static-members",
    moduleId: "oop",
    after: "constructors-destructors",
    title: "Static members",
    minutes: 15,
    concepts: ["static data member", "static member function", "factory function"],
    goals: [
      "Share one variable among all objects of a class",
      "Write static member functions that don't need an object",
      "Use static factory functions for clearer construction",
    ],
    intro: `Normally every object has its own copy of every member. A \`static\` member belongs to the **class** instead: one copy, shared by all objects — useful for counters, IDs and helper functions.`,
    sections: [
      {
        title: "Static data members",
        body: `\`\`\`cpp
class Ticket {
public:
    static inline int issued = 0;   // one counter for the whole class (C++17)
    int id;
    Ticket() : id(++issued) {}
};
Ticket a, b, c;   // ids 1, 2, 3; Ticket::issued == 3
\`\`\`

Access it as \`Ticket::issued\` (no object needed). \`inline\` lets you initialise it inside the class; older code defines it once outside: \`int Ticket::issued = 0;\`.`,
      },
      {
        title: "Static member functions",
        body: `A static function has no \`this\` — it can only use static members (or its parameters):

\`\`\`cpp
static int count() { return issued; }
cout << Ticket::count();
\`\`\``,
      },
      {
        title: "Named constructors",
        body: `Constructors can't have names. When "a Temperature from 98.6" is ambiguous (Celsius? Fahrenheit?), static **factory** functions make it obvious:

\`\`\`cpp
Temperature::fromCelsius(37);
Temperature::fromFahrenheit(98.6);
\`\`\`

Making the constructor private forces callers to use them.`,
      },
    ],
    mistakes: [
      { title: "Expecting one per object", body: "A static member is shared — changing it through one object changes it for all." },
      { title: "Using members in a static function", body: "A static function has no object, so it can't read non-static members." },
      { title: "Forgetting the definition", body: "Without `inline`, a static data member must also be defined in one .cpp file, or the linker complains." },
    ],
    example: {
      title: "Counting live objects",
      intro: "The counter goes up in the constructor and down in the destructor.",
      code: r`#include <iostream>
using namespace std;

class Widget {
public:
    static inline int alive = 0;
    Widget() { alive++; }
    ~Widget() { alive--; }
    static int count() { return alive; }
};

int main() {
    Widget a;
    cout << Widget::count() << endl;
    {
        Widget b, c;
        cout << Widget::count() << endl;
    }
    cout << Widget::count() << endl;
    return 0;
}`,
      output: "1\n3\n1\n",
      notes: [
        { line: 6, text: "One shared counter for all Widgets." },
        { line: 9, text: "Called on the class, not an object." },
        { line: 17, text: "b and c were destroyed at the end of their block." },
      ],
    },
    quickCheck: {
      prompt: "A class has `static inline int total = 0;` and `void add(int x) { total += x; }`. Objects p and q each call `add(5)`. What is `total`?",
      options: [
        { id: "a", text: "10", feedback: "Yes — there's one shared total." },
        { id: "b", text: "5 in p, 5 in q", feedback: "Static members aren't per-object." },
        { id: "c", text: "It doesn't compile: non-static functions can't use static members", feedback: "They can; it's the other way round that's not allowed." },
      ],
      correct: "a",
      explanation: "Static data is shared by every object of the class.",
    },
    exercise: {
      title: "Numbered tickets",
      prompt: `Write a class \`Ticket\` with a static counter so each new ticket gets the next id (starting at 1), a member \`id\` and \`holder\`, and a static function \`issued()\`. Read names until the input ends, create a Ticket for each and print \`#ID NAME\`. Finally print \`issued: N\`.`,
      starterCode: r`#include <iostream>
#include <string>
#include <vector>
using namespace std;

// Write class Ticket here

int main() {
    vector<Ticket> tickets;
    string name;
    while (cin >> name) {
        // create a Ticket and print it
    }
    // print issued: N
    return 0;
}`,
      tests: [
        { label: "sample", input: "Asha Ravi Meera\n", output: "#1 Asha\n#2 Ravi\n#3 Meera\nissued: 3", visibility: "sample", category: "normal" },
        { label: "none", input: "\n", output: "issued: 0", visibility: "hidden", category: "edge" },
        { label: "one", input: "Zoe\n", output: "#1 Zoe\nissued: 1", visibility: "hidden", category: "boundary" },
      ],
      compare: "lines",
      hints: [
        "`static inline int next = 0;` inside the class.",
        "The constructor sets `id = ++next;` and stores the holder's name.",
        "`static int issued() { return next; }`",
        "In main: tickets.emplace_back(name); then print tickets.back().",
      ],
      solution: r`#include <iostream>
#include <string>
#include <vector>
using namespace std;

class Ticket {
    static inline int next = 0;
public:
    int id;
    string holder;
    explicit Ticket(string name) : id(++next), holder(name) {}
    static int issued() { return next; }
};

int main() {
    vector<Ticket> tickets;
    string name;
    while (cin >> name) {
        tickets.emplace_back(name);
        cout << "#" << tickets.back().id << " " << tickets.back().holder << endl;
    }
    cout << "issued: " << Ticket::issued() << endl;
    return 0;
}`,
      solutionNotes: "The static counter lives once for the class, so every constructor call sees and advances the same value. `Ticket::issued()` needs no object at all.",
    },
    practice: practice(
      {
        title: "How many are alive?",
        prompt: `A class \`Widget\` counts live objects in a static member (up in the constructor, down in the destructor). Objects are kept in a \`vector<unique_ptr<Widget>>\`. Commands: \`make\` (add one), \`drop\` (remove the last one, if any), \`count\` (print \`Widget::alive()\`).`,
        starterCode: r`#include <iostream>
#include <memory>
#include <string>
#include <vector>
using namespace std;

// Write class Widget with a static live counter here

int main() {
    vector<unique_ptr<Widget>> ws;
    string cmd;
    while (cin >> cmd) {
        // make / drop / count
    }
    return 0;
}`,
        tests: [
          T("sample", "make\nmake\ncount\ndrop\ncount\n", "2\n1", "sample"),
          T("drop when empty", "drop\ncount\n", "0", "visible", "edge"),
          T("many", "make\nmake\nmake\ndrop\nmake\ncount\n", "3", "hidden"),
        ],
        compare: "lines",
        hints: [
          "`static inline int live = 0;` with `++` in the constructor and `--` in the destructor.",
          "`static int alive() { return live; }`",
          "make: ws.push_back(make_unique<Widget>());",
          "drop: if (!ws.empty()) ws.pop_back(); — that runs the destructor.",
        ],
        solution: r`#include <iostream>
#include <memory>
#include <string>
#include <vector>
using namespace std;

class Widget {
    static inline int live = 0;
public:
    Widget() { live++; }
    ~Widget() { live--; }
    Widget(const Widget&) = delete;
    Widget& operator=(const Widget&) = delete;
    static int alive() { return live; }
};

int main() {
    vector<unique_ptr<Widget>> ws;
    string cmd;
    while (cin >> cmd) {
        if (cmd == "make") ws.push_back(make_unique<Widget>());
        else if (cmd == "drop") { if (!ws.empty()) ws.pop_back(); }
        else if (cmd == "count") cout << Widget::alive() << endl;
    }
    return 0;
}`,
        solutionNotes: "Constructor and destructor keep the shared count exact. Deleting the copy operations stops an accidental copy from being counted without a matching constructor call.",
      },
      {
        title: "Named constructors for temperatures",
        prompt: `Write a class \`Temperature\` storing Kelvin, with a **private** constructor and static factories \`fromCelsius\`, \`fromFahrenheit\` and \`fromKelvin\`, plus \`celsius()\`, \`fahrenheit()\` and \`kelvin()\`. Read lines \`VALUE UNIT\` (C, F or K) until the input ends; print each in all three units with 2 decimals: \`C F K\`.`,
        starterCode: starter("Create each Temperature through a factory and print celsius fahrenheit kelvin", "double v;\nchar unit;", ["iostream", "iomanip"], "// Write class Temperature here (private constructor, static factories)"),
        tests: [
          T("body temperature", "37 C\n", "37.00 98.60 310.15", "sample"),
          T("freezing in F", "32 F\n", "0.00 32.00 273.15", "sample"),
          T("absolute zero", "0 K\n", "-273.15 -459.67 0.00", "hidden", "edge"),
          T("minus forty", "-40 C\n", "-40.00 -40.00 233.15", "hidden", "edge"),
        ],
        compare: "lines",
        hints: [
          "Store one unit internally (Kelvin) and convert in the getters.",
          "C = K − 273.15; F = C × 9/5 + 32.",
          "`static Temperature fromCelsius(double c) { return Temperature(c + 273.15); }`",
          "The factories can call the private constructor because they're members.",
        ],
        solution: r`#include <iostream>
#include <iomanip>
using namespace std;

class Temperature {
    double k;
    explicit Temperature(double kelvin) : k(kelvin) {}
public:
    static Temperature fromKelvin(double v) { return Temperature(v); }
    static Temperature fromCelsius(double v) { return Temperature(v + 273.15); }
    static Temperature fromFahrenheit(double v) { return fromCelsius((v - 32) * 5 / 9); }
    double kelvin() const { return k; }
    double celsius() const { return k - 273.15; }
    double fahrenheit() const { return celsius() * 9 / 5 + 32; }
};

int main() {
    double v;
    char unit;
    cout << fixed << setprecision(2);
    while (cin >> v >> unit) {
        Temperature t = unit == 'C' ? Temperature::fromCelsius(v)
                      : unit == 'F' ? Temperature::fromFahrenheit(v)
                      :               Temperature::fromKelvin(v);
        cout << t.celsius() << " " << t.fahrenheit() << " " << t.kelvin() << endl;
    }
    return 0;
}`,
        solutionNotes: "`Temperature(37)` would be ambiguous; `Temperature::fromCelsius(37)` can't be misread. With the constructor private, the factories are the only way in.",
      },
    ),
    explainAgain: `Ordinary members are each student's own notebook. A static member is the class whiteboard: there's only one, everyone sees the same thing, and you can read it without picking any particular student.`,
    summary: [
      "`static` data is shared by all objects; `static inline` initialises it in the class.",
      "Static functions are called as `Class::f()` and have no `this`.",
      "Static factory functions act as named constructors.",
    ],
  },

  {
    id: "composition-aggregation",
    moduleId: "oop",
    after: "inheritance-polymorphism",
    title: "Composition and aggregation",
    minutes: 15,
    concepts: ["composition", "aggregation", "has-a", "member initialisation order"],
    goals: [
      "Build classes out of other classes (\"has-a\")",
      "Tell owning (composition) from referring (aggregation)",
      "Know the order in which members are constructed and destroyed",
    ],
    intro: `Inheritance models "is-a" (a Dog is an Animal). Most real designs are built from "has-a": a Car **has an** Engine, a Playlist **has** Songs. That's composition — and it's usually the better first choice.`,
    sections: [
      {
        title: "Composition: owning parts",
        body: `\`\`\`cpp
class Car {
    Engine engine;          // part of the Car — created and destroyed with it
    vector<Wheel> wheels;
};
\`\`\`

The parts' lifetimes are tied to the whole. Copying the Car copies its engine.`,
      },
      {
        title: "Aggregation: referring to others",
        body: `\`\`\`cpp
class Course {
    vector<Student*> enrolled;   // students exist independently
};
\`\`\`

The Course uses Students but doesn't own them: destroying the course doesn't destroy students. Use pointers or references (and make sure the referred-to objects live long enough).`,
      },
      {
        title: "Construction order",
        body: `Members are constructed **in the order they're declared in the class** (not the order in the initializer list), before the constructor body runs — and destroyed in the **reverse** order after the destructor body. Compilers warn if your initializer list is in a different order.`,
      },
    ],
    mistakes: [
      { title: "Inheriting to reuse code", body: "A Stack isn't a vector; it *has* one. Prefer a member over inheritance when there's no is-a relationship." },
      { title: "Pointers into a growing vector", body: "Aggregated pointers to elements of a vector dangle when it reallocates. Store `unique_ptr`s, or reserve, or use indexes." },
      { title: "Relying on initializer-list order", body: "Members initialise in declaration order. If one depends on another, declare it later." },
    ],
    example: {
      title: "Parts are built first",
      intro: "Members print when built and destroyed; watch the order.",
      code: r`#include <iostream>
#include <string>
using namespace std;

struct Part {
    string name;
    Part(string n) : name(n) { cout << "+" << name << " "; }
    ~Part() { cout << "-" << name << " "; }
};

class Car {
    Part engine{"engine"};
    Part wheels{"wheels"};
public:
    Car() { cout << "+car "; }
    ~Car() { cout << "-car "; }
};

int main() {
    {
        Car c;
        cout << "| ";
    }
    cout << endl;
    return 0;
}`,
      output: "+engine +wheels +car | -car -wheels -engine \n",
      notes: [
        { line: 12, text: "Declared first, so built first." },
        { line: 15, text: "The constructor body runs after all members exist." },
        { line: 23, text: "Destruction runs in exactly the reverse order." },
      ],
    },
    quickCheck: {
      prompt: "A `Team` holds `vector<Player*> players;` and players are created elsewhere. Which is it?",
      options: [
        { id: "a", text: "Aggregation — the team refers to players it doesn't own", feedback: "Right: destroying the team leaves the players alone." },
        { id: "b", text: "Composition — the team owns its players", feedback: "Raw pointers to objects made elsewhere don't own them." },
        { id: "c", text: "Inheritance", feedback: "No is-a relationship here." },
      ],
      correct: "a",
      explanation: "Owning members = composition; references/pointers to independent objects = aggregation.",
    },
    exercise: {
      title: "A playlist made of songs",
      prompt: `Write \`struct Song { string title; int seconds; }\` and a class \`Playlist\` that **has** a \`vector<Song>\`, with \`add(Song)\`, \`totalSeconds()\` and \`longest()\`. Read \`n\` songs as \`TITLE SECONDS\` (title is one word). Print the count, the total as \`M:SS\`, and the longest song's title (the first one if tied, or \`none\`).`,
      starterCode: r`#include <iostream>
#include <string>
#include <vector>
using namespace std;

// Write Song and Playlist here

int main() {
    int n;
    cin >> n;
    Playlist p;
    for (int i = 0; i < n; i++) {
        // read and add a song
    }
    // print count, total as M:SS, longest title
    return 0;
}`,
      tests: [
        { label: "sample", input: "3\nIntro 65\nAnthem 245\nOutro 30\n", output: "3\n5:40\nAnthem", visibility: "sample", category: "normal" },
        { label: "empty", input: "0\n", output: "0\n0:00\nnone", visibility: "hidden", category: "edge" },
        { label: "tie", input: "2\nA 100\nB 100\n", output: "2\n3:20\nA", visibility: "hidden", category: "edge" },
        { label: "long", input: "2\nEpic 3599\nShort 2\n", output: "2\n60:01\nEpic", visibility: "hidden", category: "normal" },
      ],
      compare: "lines",
      hints: [
        "Playlist keeps `vector<Song> songs;` as a private member.",
        "totalSeconds loops over songs and adds the seconds.",
        "longest returns a title; handle the empty case.",
        "M:SS — minutes = total / 60, seconds padded to 2 digits.",
      ],
      solution: r`#include <iostream>
#include <iomanip>
#include <string>
#include <vector>
using namespace std;

struct Song {
    string title;
    int seconds;
};

class Playlist {
    vector<Song> songs;
public:
    void add(const Song& s) { songs.push_back(s); }
    int count() const { return songs.size(); }
    int totalSeconds() const {
        int t = 0;
        for (const auto& s : songs) t += s.seconds;
        return t;
    }
    string longest() const {
        if (songs.empty()) return "none";
        const Song* best = &songs[0];
        for (const auto& s : songs)
            if (s.seconds > best->seconds) best = &s;
        return best->title;
    }
};

int main() {
    int n;
    cin >> n;
    Playlist p;
    for (int i = 0; i < n; i++) {
        Song s;
        cin >> s.title >> s.seconds;
        p.add(s);
    }
    int t = p.totalSeconds();
    cout << p.count() << endl;
    cout << t / 60 << ":" << setw(2) << setfill('0') << t % 60 << endl;
    cout << p.longest() << endl;
    return 0;
}`,
      solutionNotes: "The Playlist owns its songs (composition) and exposes only playlist-level operations. Nobody outside can push an invalid song or break its invariants.",
    },
    practice: practice(
      {
        title: "A course that refers to students",
        prompt: `Students are created once and stored as \`vector<unique_ptr<Student>>\` (each has a name and a mark). A \`Course\` holds \`vector<Student*>\` — it **refers** to students it doesn't own. Read \`n\` students, then \`m\` names to enrol. Then apply \`k\` updates \`NAME NEWMARK\` to the student list itself, and finally print the course average with 1 decimal — which must reflect the updates.`,
        starterCode: r`#include <iostream>
#include <iomanip>
#include <memory>
#include <string>
#include <vector>
using namespace std;

struct Student {
    string name;
    int mark;
};

// Write class Course here: it stores Student* and computes the average

int main() {
    int n;
    cin >> n;
    vector<unique_ptr<Student>> all;
    for (int i = 0; i < n; i++) {
        string name;
        int mark;
        cin >> name >> mark;
        all.push_back(make_unique<Student>(Student{name, mark}));
    }
    // enrol m students by name, apply k updates, print the course average
    return 0;
}`,
        tests: [
          T("sample", "3\nAsha 80\nRavi 60\nMeera 90\n2\nAsha\nRavi\n1\nRavi 100\n", "90.0", "sample"),
          T("no updates", "2\nA 10\nB 20\n2\nA\nB\n0\n", "15.0", "visible"),
          T("update outside course", "2\nA 50\nB 70\n1\nA\n1\nB 0\n", "50.0", "hidden", "edge"),
          T("empty course", "1\nA 50\n0\n0\n", "0.0", "hidden", "edge"),
        ],
        compare: "lines",
        hints: [
          "Find a student by name in `all` and enrol `all[i].get()`.",
          "Updates change the Student objects themselves.",
          "Because the course holds pointers, it sees the new marks.",
          "Guard the average against an empty course.",
        ],
        solution: r`#include <iostream>
#include <iomanip>
#include <memory>
#include <string>
#include <vector>
using namespace std;

struct Student {
    string name;
    int mark;
};

class Course {
    vector<Student*> enrolled;
public:
    void enrol(Student* s) { enrolled.push_back(s); }
    double average() const {
        if (enrolled.empty()) return 0;
        double sum = 0;
        for (const Student* s : enrolled) sum += s->mark;
        return sum / enrolled.size();
    }
};

Student* find(vector<unique_ptr<Student>>& all, const string& name) {
    for (auto& s : all) if (s->name == name) return s.get();
    return nullptr;
}

int main() {
    int n;
    cin >> n;
    vector<unique_ptr<Student>> all;
    for (int i = 0; i < n; i++) {
        string name;
        int mark;
        cin >> name >> mark;
        all.push_back(make_unique<Student>(Student{name, mark}));
    }
    Course c;
    int m;
    cin >> m;
    for (int i = 0; i < m; i++) {
        string name;
        cin >> name;
        if (Student* s = find(all, name)) c.enrol(s);
    }
    int k;
    cin >> k;
    for (int i = 0; i < k; i++) {
        string name;
        int mark;
        cin >> name >> mark;
        if (Student* s = find(all, name)) s->mark = mark;
    }
    cout << fixed << setprecision(1) << c.average() << endl;
    return 0;
}`,
        solutionNotes: "Aggregation: the course sees the same Student objects as everyone else. unique_ptr gives each student a stable address, so the course's pointers stay valid even as `all` grows.",
      },
      {
        title: "Fix the construction order",
        prompt: `A \`Report\` has three members whose constructors print their names. It must print \`header body footer\` when created — but it prints them in the wrong order, because members are built in **declaration** order, not initializer-list order. Reorder the member declarations (don't change the Part class or main).`,
        starterCode: r`#include <iostream>
#include <string>
using namespace std;

struct Part {
    Part(const string& name) { cout << name << " "; }
};

class Report {
    Part footer;
    Part body;
    Part header;
public:
    Report() : header("header"), body("body"), footer("footer") {}
};

int main() {
    Report r;
    cout << endl;
    return 0;
}`,
        tests: [
          T("order", "", "header body footer", "sample"),
          T("same output again", "", "header body footer"),
        ],
        compare: "lines",
        hints: [
          "The initializer list is already in the right order — why doesn't it matter?",
          "Members are always constructed in the order they're declared in the class.",
          "So the declarations must be header, body, footer.",
          "Move the three `Part …;` lines.",
        ],
        solution: r`#include <iostream>
#include <string>
using namespace std;

struct Part {
    Part(const string& name) { cout << name << " "; }
};

class Report {
    Part header;
    Part body;
    Part footer;
public:
    Report() : header("header"), body("body"), footer("footer") {}
};

int main() {
    Report r;
    cout << endl;
    return 0;
}`,
        solutionNotes: "Declaration order is the only thing that decides construction order. g++ warns (-Wreorder) when an initializer list is written in a different order — a hint that someone expected otherwise.",
      },
    ),
    explainAgain: `Composition is a car and its engine: they're made together and scrapped together. Aggregation is a school and its students: the school keeps a list of names, but closing the school doesn't make the students disappear. Ask "who owns this?" and choose a member object for owning, a pointer or reference for referring.`,
    summary: [
      "Composition: the class owns member objects; their lifetimes are tied together.",
      "Aggregation: the class refers (pointer/reference) to objects it doesn't own.",
      "Members are built in declaration order and destroyed in reverse.",
    ],
  },

  {
    id: "operator-overloading",
    moduleId: "oop",
    after: "composition-aggregation",
    title: "Operator overloading",
    minutes: 20,
    concepts: ["operator overloading", "operator<<", "operator==", "operator+"],
    goals: [
      "Give your own types natural operators like `+`, `==`, `<` and `<<`",
      "Choose between member and non-member operators",
      "Keep overloaded operators unsurprising",
    ],
    intro: `\`a + b\` reads better than \`add(a, b)\`. C++ lets you define what operators mean for your own classes — the standard library does exactly this for \`string\` (\`+\`), iterators (\`*\`, \`++\`) and streams (\`<<\`).`,
    sections: [
      {
        title: "Writing an operator",
        body: `An operator is a function with a special name:

\`\`\`cpp
struct Money {
    long long paise;
};
Money operator+(Money a, Money b) { return {a.paise + b.paise}; }
bool operator==(Money a, Money b) { return a.paise == b.paise; }
bool operator<(Money a, Money b)  { return a.paise < b.paise; }
\`\`\`

Now \`m1 + m2\`, \`m1 == m2\` and \`sort\` on a vector of Money all work.`,
      },
      {
        title: "Printing with <<",
        body: `\`\`\`cpp
ostream& operator<<(ostream& out, const Money& m) {
    return out << "Rs " << m.paise / 100 << "." << setw(2) << setfill('0') << m.paise % 100;
}
\`\`\`

It takes the stream by reference and **returns it**, so chains like \`cout << a << " " << b\` keep working.`,
      },
      {
        title: "Member or not?",
        body: `- Operators that change the object (\`+=\`, \`[]\`, \`=\`) are usually **members**.
- Symmetric ones (\`+\`, \`==\`, \`<\`) and \`<<\` are usually **non-members**, so both sides are treated alike (and \`<<\` must be: its left side is the stream).
- A common pattern: write \`+=\` as a member, then \`a + b\` as \`{ a += b; return a; }\`.

C++20 can generate \`!=\` from \`==\`, and \`<\`, \`<=\`, \`>\`, \`>=\` from \`<=>\`.`,
      },
    ],
    mistakes: [
      { title: "Surprising meanings", body: "`+` should add and `==` should compare. An operator that does something unexpected makes code unreadable." },
      { title: "Not returning the stream", body: "`void operator<<(ostream&, …)` breaks chaining. Return `ostream&`." },
      { title: "Inconsistent comparisons", body: "If `a < b` is false and `b < a` is false, `a == b` should be true. Sorting relies on this." },
    ],
    example: {
      title: "A 2D vector type",
      intro: "Arithmetic, comparison and printing for a small struct.",
      code: r`#include <iostream>
using namespace std;

struct Vec2 {
    int x, y;
    Vec2& operator+=(const Vec2& o) { x += o.x; y += o.y; return *this; }
};

Vec2 operator+(Vec2 a, const Vec2& b) { a += b; return a; }
Vec2 operator*(int k, const Vec2& v) { return {k * v.x, k * v.y}; }
bool operator==(const Vec2& a, const Vec2& b) { return a.x == b.x && a.y == b.y; }
ostream& operator<<(ostream& out, const Vec2& v) { return out << "(" << v.x << ", " << v.y << ")"; }

int main() {
    Vec2 a{1, 2}, b{3, 4};
    cout << a + b << " " << 3 * a << endl;
    a += b;
    cout << a << " " << (a == Vec2{4, 6}) << endl;
    return 0;
}`,
      output: "(4, 6) (3, 6)\n(4, 6) 1\n",
      notes: [
        { line: 6, text: "+= changes the object, so it's a member and returns *this." },
        { line: 9, text: "+ is built from += and takes its left side by value." },
        { line: 12, text: "<< returns the stream so it can be chained." },
      ],
    },
    quickCheck: {
      prompt: "Why must `operator<<` for printing be a non-member function?",
      options: [
        { id: "a", text: "Its left operand is the stream (cout), not your object", feedback: "Right — a member operator's left operand is always the object itself." },
        { id: "b", text: "Member functions can't return references", feedback: "They can; `+=` does." },
        { id: "c", text: "It doesn't have to be", feedback: "As a member it would be called as `obj << cout`, which reads backwards." },
      ],
      correct: "a",
      explanation: "For `cout << x`, the left-hand side is the stream, so the function can't be a member of x's class.",
    },
    exercise: {
      title: "Money that adds up",
      prompt: `Write \`struct Money { long long paise; }\` with \`+\`, \`-\`, \`==\`, \`<\` and \`<<\` (printing \`Rs R.PP\`, e.g. \`Rs 12.05\`; negative amounts as \`-Rs 3.50\`). Read \`n\` amounts in paise; print their total, the largest (using your \`<\`), and whether the first two are equal (\`1\`/\`0\`, or \`0\` if n < 2). Then print first minus second (or the first, if n < 2).`,
      starterCode: r`#include <iostream>
#include <iomanip>
#include <vector>
#include <algorithm>
using namespace std;

struct Money {
    long long paise;
};

// Write operator+, operator-, operator==, operator< and operator<< here

int main() {
    int n;
    cin >> n;
    vector<Money> v(n);
    for (auto& m : v) cin >> m.paise;
    // print total, largest, first==second, first-second
    return 0;
}`,
      tests: [
        { label: "sample", input: "3\n1205 50 1205\n", output: "Rs 24.60\nRs 12.05\n0\nRs 11.55", visibility: "sample", category: "normal" },
        { label: "equal pair", input: "2\n300 300\n", output: "Rs 6.00\nRs 3.00\n1\nRs 0.00", visibility: "hidden", category: "edge" },
        { label: "negative result", input: "2\n100 450\n", output: "Rs 5.50\nRs 4.50\n0\n-Rs 3.50", visibility: "hidden", category: "edge" },
        { label: "single", input: "1\n7\n", output: "Rs 0.07\nRs 0.07\n0\nRs 0.07", visibility: "hidden", category: "boundary" },
      ],
      compare: "lines",
      hints: [
        "Money operator+(Money a, Money b) { return {a.paise + b.paise}; }",
        "operator< compares paise; then `*max_element(v.begin(), v.end())` uses it.",
        "In <<, print a '-' first for negatives, then work with the absolute value.",
        "Paise with two digits: setw(2) << setfill('0').",
      ],
      solution: r`#include <iostream>
#include <iomanip>
#include <vector>
#include <algorithm>
using namespace std;

struct Money {
    long long paise;
};

Money operator+(Money a, Money b) { return {a.paise + b.paise}; }
Money operator-(Money a, Money b) { return {a.paise - b.paise}; }
bool operator==(Money a, Money b) { return a.paise == b.paise; }
bool operator<(Money a, Money b) { return a.paise < b.paise; }

ostream& operator<<(ostream& out, Money m) {
    long long p = m.paise;
    if (p < 0) { out << "-"; p = -p; }
    return out << "Rs " << p / 100 << "." << setw(2) << setfill('0') << p % 100;
}

int main() {
    int n;
    cin >> n;
    vector<Money> v(n);
    for (auto& m : v) cin >> m.paise;
    Money total{0};
    for (const auto& m : v) total = total + m;
    cout << total << endl;
    cout << *max_element(v.begin(), v.end()) << endl;
    cout << (n >= 2 && v[0] == v[1]) << endl;
    cout << (n >= 2 ? v[0] - v[1] : v[0]) << endl;
    return 0;
}`,
      solutionNotes: "With the operators defined, Money behaves like a built-in number: it adds, compares, works with max_element and prints. Storing paise keeps arithmetic exact.",
    },
    practice: practice(
      {
        title: "Fractions with operators",
        prompt: `Write \`struct Frac { long long n, d; }\` that is always stored in lowest terms with a positive denominator, plus \`+\`, \`*\` and \`<<\` (printing \`n/d\`, or just \`n\` when d is 1). Read two fractions \`a b c d\` (meaning a/b and c/d, b and d non-zero) and print their sum and product.`,
        starterCode: starter("Implement Frac with a reducing constructor, +, * and <<; print sum and product", "long long a, b, c, d;\ncin >> a >> b >> c >> d;", ["iostream", "numeric"], "// Write struct Frac and its operators here"),
        tests: [
          T("sample", "1 2 1 3\n", "5/6\n1/6", "sample"),
          T("whole", "1 2 1 2\n", "1\n1/4", "visible", "edge"),
          T("negatives", "-1 2 3 -4\n", "-5/4\n3/8", "hidden", "edge"),
          T("reduces", "2 4 6 8\n", "5/4\n3/8", "hidden"),
          T("zero", "0 5 7 3\n", "7/3\n0", "hidden", "edge"),
        ],
        compare: "lines",
        hints: [
          "A constructor Frac(n, d) divides both by gcd(|n|, |d|) and flips signs if d < 0.",
          "std::gcd is in <numeric>.",
          "a/b + c/d = (ad + cb)/bd; a/b × c/d = ac/bd — let the constructor reduce.",
          "In <<, print just n when d == 1.",
        ],
        solution: r`#include <iostream>
#include <numeric>
using namespace std;

struct Frac {
    long long n, d;
    Frac(long long num, long long den) {
        if (den < 0) { num = -num; den = -den; }
        long long g = gcd(num < 0 ? -num : num, den);
        if (g == 0) g = 1;
        n = num / g;
        d = den / g;
    }
};

Frac operator+(const Frac& a, const Frac& b) { return Frac(a.n * b.d + b.n * a.d, a.d * b.d); }
Frac operator*(const Frac& a, const Frac& b) { return Frac(a.n * b.n, a.d * b.d); }

ostream& operator<<(ostream& out, const Frac& f) {
    if (f.d == 1) return out << f.n;
    return out << f.n << "/" << f.d;
}

int main() {
    long long a, b, c, d;
    cin >> a >> b >> c >> d;
    Frac x(a, b), y(c, d);
    cout << x + y << endl;
    cout << x * y << endl;
    return 0;
}`,
        solutionNotes: "Putting the normalisation in the constructor guarantees every Frac is in lowest terms, so operators and printing never need to worry about it.",
      },
      {
        title: "Matrix power for Fibonacci",
        prompt: `Write \`struct Mat { long long a, b, c, d; }\` (a 2×2 matrix) with \`operator*\` that multiplies **modulo 1 000 000 007**. Using fast exponentiation on \`[[1, 1], [1, 0]]\`, print the n-th Fibonacci number mod 1 000 000 007 for each n read (0 ≤ n ≤ 10¹⁸; F(0) = 0, F(1) = 1).`,
        starterCode: starter("Raise [[1,1],[1,0]] to the n-th power with repeated squaring", "long long n;", ["iostream"], "// Write struct Mat and operator* (mod 1e9+7) here"),
        tests: [
          T("small", "0 1 2 10\n", "0\n1\n1\n55", "sample"),
          T("fifty", "50\n", "586268941", "visible"),
          T("huge", "1000000000000000000\n", "209783453", "hidden", "edge"),
          T("ninety", "90\n", "210345902", "hidden"),
        ],
        compare: "lines",
        hints: [
          "[[1,1],[1,0]]ⁿ = [[F(n+1), F(n)], [F(n), F(n−1)]].",
          "Multiply 2×2 matrices entry by entry, taking % MOD after each product sum.",
          "Fast power: result = identity; while n > 0: if n odd, result = result * base; base = base * base; n /= 2.",
          "The answer is the b entry of the result.",
        ],
        solution: r`#include <iostream>
using namespace std;

const long long MOD = 1000000007;

struct Mat {
    long long a, b, c, d;
};

Mat operator*(const Mat& x, const Mat& y) {
    return {
        (x.a * y.a + x.b * y.c) % MOD, (x.a * y.b + x.b * y.d) % MOD,
        (x.c * y.a + x.d * y.c) % MOD, (x.c * y.b + x.d * y.d) % MOD,
    };
}

long long fib(long long n) {
    Mat result{1, 0, 0, 1}, base{1, 1, 1, 0};
    while (n > 0) {
        if (n & 1) result = result * base;
        base = base * base;
        n >>= 1;
    }
    return result.b;
}

int main() {
    long long n;
    while (cin >> n) cout << fib(n) << endl;
    return 0;
}`,
        solutionNotes: "With `*` defined, the generic fast-power loop works on matrices exactly as on numbers, giving F(10¹⁸) in about 60 multiplications.",
      },
    ),
    explainAgain: `Operator overloading is giving your type the same "buttons" built-in types have. A Money type with \`+\` and \`<<\` can be added and printed just like an int. The rule of thumb: an operator should do what any reader would guess from its symbol.`,
    summary: [
      "Operators are functions named `operator+`, `operator==`, `operator<<`…",
      "Mutating operators (`+=`, `[]`) are members; symmetric ones and `<<` are non-members.",
      "`operator<<` takes and returns `ostream&` so output can be chained.",
    ],
  },

  {
    id: "friend-functions",
    moduleId: "oop",
    after: "operator-overloading",
    title: "Friend functions",
    minutes: 12,
    concepts: ["friend", "encapsulation", "friend class"],
    goals: [
      "Let a specific non-member function access private members with `friend`",
      "Know the typical uses: `operator<<`, symmetric operators, tightly coupled helpers",
      "Avoid friendship that undermines encapsulation",
    ],
    intro: `Private members keep a class in control of its own data. Occasionally a function outside the class genuinely needs that access — the classic case is \`operator<<\`, which must be a non-member. \`friend\` grants exactly that function access, and nothing else.`,
    sections: [
      {
        title: "Declaring a friend",
        body: `\`\`\`cpp
class Point {
    int x, y;
public:
    Point(int x, int y) : x(x), y(y) {}
    friend ostream& operator<<(ostream& out, const Point& p);
};

ostream& operator<<(ostream& out, const Point& p) {
    return out << "(" << p.x << ", " << p.y << ")";   // allowed: it's a friend
}
\`\`\`

The class decides who its friends are — a function can't make itself a friend.`,
      },
      {
        title: "Friend classes",
        body: `\`friend class Auditor;\` lets every member function of Auditor read the private parts. Use this for tightly connected pairs (a container and its iterator, a class and its test helper).`,
      },
      {
        title: "Use sparingly",
        body: `Friendship isn't inherited and isn't mutual. Before adding a friend, ask whether a public getter or a member function would do. Friends are part of the class's interface — a long friend list is a design smell.`,
      },
    ],
    mistakes: [
      { title: "Friend to avoid writing getters", body: "If many functions need private data, the class's public interface is probably missing something." },
      { title: "Assuming friendship is mutual", body: "If A declares B a friend, B can see A's privates — not the other way round." },
      { title: "Defining the friend as a member", body: "A friend function isn't a member: no `this`, and it's called as `f(obj)`, not `obj.f()`." },
    ],
    example: {
      title: "A friend printer and a friend helper",
      intro: "Two friend functions read private data; outside code can't.",
      code: r`#include <iostream>
using namespace std;

class Point {
    int x, y;
public:
    Point(int x, int y) : x(x), y(y) {}
    friend ostream& operator<<(ostream& out, const Point& p);
    friend long long dist2(const Point& a, const Point& b);
};

ostream& operator<<(ostream& out, const Point& p) {
    return out << "(" << p.x << ", " << p.y << ")";
}

long long dist2(const Point& a, const Point& b) {
    long long dx = a.x - b.x, dy = a.y - b.y;
    return dx * dx + dy * dy;
}

int main() {
    Point a(1, 2), b(4, 6);
    cout << a << " to " << b << ": " << dist2(a, b) << endl;
    return 0;
}`,
      output: "(1, 2) to (4, 6): 25\n",
      notes: [
        { line: 8, text: "The class names the functions it trusts." },
        { line: 16, text: "A friend reads private x and y of both points symmetrically." },
      ],
    },
    quickCheck: {
      prompt: "Class A declares `friend class B;`. Which is true?",
      options: [
        { id: "a", text: "B's member functions can access A's private members", feedback: "Yes — and only that direction." },
        { id: "b", text: "A can access B's private members too", feedback: "Friendship isn't mutual." },
        { id: "c", text: "Classes derived from B are friends of A too", feedback: "Friendship isn't inherited." },
      ],
      correct: "a",
      explanation: "Friendship is granted by A to B, one way only.",
    },
    exercise: {
      title: "Transfer between accounts",
      prompt: `\`Account\` keeps its balance private and has no setter. Write a **friend** function \`bool transfer(Account& from, Account& to, long long amount)\` that moves money only if \`from\` has enough (amount > 0), and a friend \`operator<<\` printing \`NAME: BALANCE\`. Read two accounts (\`name balance\` each), then transfers \`1->2 X\` or \`2->1 X\` until the input ends; print \`denied\` for refused ones, then both accounts.`,
      starterCode: r`#include <iostream>
#include <string>
using namespace std;

class Account {
    string name;
    long long balance;
public:
    Account(string n, long long b) : name(n), balance(b) {}
    // declare the two friends here
};

// define transfer and operator<< here

int main() {
    string n1, n2;
    long long b1, b2;
    cin >> n1 >> b1 >> n2 >> b2;
    Account a(n1, b1), b(n2, b2);
    string dir;
    long long x;
    while (cin >> dir >> x) {
        // perform the transfer in the given direction
    }
    cout << a << endl << b << endl;
    return 0;
}`,
      tests: [
        { label: "sample", input: "Asha 100 Ravi 50\n1->2 30\n2->1 500\n", output: "denied\nAsha: 70\nRavi: 80", visibility: "sample", category: "normal" },
        { label: "no transfers", input: "A 1 B 2\n", output: "A: 1\nB: 2", visibility: "hidden", category: "edge" },
        { label: "exact amount", input: "A 10 B 0\n1->2 10\n", output: "A: 0\nB: 10", visibility: "hidden", category: "boundary" },
        { label: "non-positive", input: "A 10 B 10\n1->2 0\n2->1 -5\n", output: "denied\ndenied\nA: 10\nB: 10", visibility: "hidden", category: "edge" },
      ],
      compare: "lines",
      hints: [
        "Inside the class: `friend bool transfer(Account&, Account&, long long);` and the `operator<<` declaration.",
        "transfer checks amount > 0 and from.balance >= amount before changing anything.",
        "main picks the order from the direction string.",
        "Print `denied` when transfer returns false.",
      ],
      solution: r`#include <iostream>
#include <string>
using namespace std;

class Account {
    string name;
    long long balance;
public:
    Account(string n, long long b) : name(n), balance(b) {}
    friend bool transfer(Account& from, Account& to, long long amount);
    friend ostream& operator<<(ostream& out, const Account& a);
};

bool transfer(Account& from, Account& to, long long amount) {
    if (amount <= 0 || from.balance < amount) return false;
    from.balance -= amount;
    to.balance += amount;
    return true;
}

ostream& operator<<(ostream& out, const Account& a) {
    return out << a.name << ": " << a.balance;
}

int main() {
    string n1, n2;
    long long b1, b2;
    cin >> n1 >> b1 >> n2 >> b2;
    Account a(n1, b1), b(n2, b2);
    string dir;
    long long x;
    while (cin >> dir >> x) {
        bool ok = dir == "1->2" ? transfer(a, b, x) : transfer(b, a, x);
        if (!ok) cout << "denied" << endl;
    }
    cout << a << endl << b << endl;
    return 0;
}`,
      solutionNotes: "A transfer touches two accounts symmetrically, so a friend function fits better than a member of either. The class still has no setter — only the trusted function can move money.",
    },
    practice: practice(
      {
        title: "Equality and printing for a private time",
        prompt: `\`Clock\` stores minutes since midnight privately. Write friends \`operator==\` and \`operator<<\` (printing \`HH:MM\`). Read pairs \`H1 M1 H2 M2\` until the input ends; for each print both clocks and \`same\` or \`different\`.`,
        starterCode: r`#include <iostream>
#include <iomanip>
using namespace std;

class Clock {
    int minutes;
public:
    Clock(int h, int m) : minutes((h * 60 + m) % 1440) {}
    // declare friend operator== and operator<< here
};

// define them here

int main() {
    int h1, m1, h2, m2;
    while (cin >> h1 >> m1 >> h2 >> m2) {
        Clock a(h1, m1), b(h2, m2);
        cout << a << " " << b << " " << (a == b ? "same" : "different") << endl;
    }
    return 0;
}`,
        tests: [
          T("sample", "9 5 9 5\n10 0 22 0\n", "09:05 09:05 same\n10:00 22:00 different", "sample"),
          T("wraps", "24 0 0 0\n", "00:00 00:00 same", "visible", "edge"),
          T("minutes overflow", "1 75 2 15\n", "02:15 02:15 same", "hidden", "edge"),
        ],
        compare: "lines",
        hints: [
          "friend bool operator==(const Clock&, const Clock&); inside the class.",
          "Compare the private minutes.",
          "For <<: hours = minutes / 60, mins = minutes % 60, both padded to 2 digits.",
          "setw(2) << setfill('0') before each.",
        ],
        solution: r`#include <iostream>
#include <iomanip>
using namespace std;

class Clock {
    int minutes;
public:
    Clock(int h, int m) : minutes((h * 60 + m) % 1440) {}
    friend bool operator==(const Clock& a, const Clock& b);
    friend ostream& operator<<(ostream& out, const Clock& c);
};

bool operator==(const Clock& a, const Clock& b) { return a.minutes == b.minutes; }

ostream& operator<<(ostream& out, const Clock& c) {
    return out << setw(2) << setfill('0') << c.minutes / 60 << ":" << setw(2) << setfill('0') << c.minutes % 60;
}

int main() {
    int h1, m1, h2, m2;
    while (cin >> h1 >> m1 >> h2 >> m2) {
        Clock a(h1, m1), b(h2, m2);
        cout << a << " " << b << " " << (a == b ? "same" : "different") << endl;
    }
    return 0;
}`,
        solutionNotes: "The representation (minutes since midnight) stays private; the friends give exactly the two capabilities outsiders need.",
      },
      {
        title: "An auditor class",
        prompt: `\`Wallet\` keeps \`owner\` and a private \`vector<long long> transactions\` (positive = in, negative = out). It declares \`friend class Auditor;\`. Write \`Auditor\` with a static function \`report(const Wallet&)\` that prints \`OWNER in=IN out=OUT balance=B\`. Read wallets as \`OWNER k t1 … tk\` until the input ends and print a report for each.`,
        starterCode: r`#include <iostream>
#include <string>
#include <vector>
using namespace std;

class Wallet {
    string owner;
    vector<long long> transactions;
public:
    Wallet(string o, vector<long long> t) : owner(o), transactions(t) {}
    friend class Auditor;
};

// Write class Auditor here

int main() {
    string owner;
    int k;
    while (cin >> owner >> k) {
        vector<long long> t(k);
        for (auto& x : t) cin >> x;
        Wallet w(owner, t);
        // Auditor::report(w);
    }
    return 0;
}`,
        tests: [
          T("sample", "Asha 3 100 -30 50\n", "Asha in=150 out=30 balance=120", "sample"),
          T("empty", "Ravi 0\n", "Ravi in=0 out=0 balance=0", "visible", "edge"),
          T("two wallets", "A 1 -5\nB 2 7 -7\n", "A in=0 out=5 balance=-5\nB in=7 out=7 balance=0", "hidden"),
        ],
        compare: "lines",
        hints: [
          "class Auditor { public: static void report(const Wallet& w) { … } };",
          "As a friend class, Auditor can read w.owner and w.transactions.",
          "Sum positives into in, negatives (as positive numbers) into out.",
          "balance = in − out.",
        ],
        solution: r`#include <iostream>
#include <string>
#include <vector>
using namespace std;

class Wallet {
    string owner;
    vector<long long> transactions;
public:
    Wallet(string o, vector<long long> t) : owner(o), transactions(t) {}
    friend class Auditor;
};

class Auditor {
public:
    static void report(const Wallet& w) {
        long long in = 0, out = 0;
        for (long long t : w.transactions) {
            if (t > 0) in += t;
            else out += -t;
        }
        cout << w.owner << " in=" << in << " out=" << out << " balance=" << in - out << endl;
    }
};

int main() {
    string owner;
    int k;
    while (cin >> owner >> k) {
        vector<long long> t(k);
        for (auto& x : t) cin >> x;
        Wallet w(owner, t);
        Auditor::report(w);
    }
    return 0;
}`,
        solutionNotes: "The Wallet chooses one trusted class to see its history; everyone else still only sees what Wallet makes public.",
      },
    ),
    explainAgain: `\`private\` is a locked room; \`friend\` hands a key to one named visitor. The class decides who gets keys. That's fine for a function that's really part of the class's job (like printing it), but if you find yourself handing out lots of keys, the room probably needs a proper door — public member functions.`,
    summary: [
      "`friend` lets a named function or class access private members.",
      "Typical uses: `operator<<`, symmetric operators, tightly coupled helper classes.",
      "Friendship is one-way and not inherited; keep it rare.",
    ],
  },

  {
    id: "class-from-scratch",
    moduleId: "oop",
    after: "friend-functions",
    title: "Mini project: a class from scratch",
    minutes: 30,
    concepts: ["class design", "invariants", "polynomial"],
    goals: [
      "Design a class: choose its data, its invariants and its interface",
      "Combine constructors, const methods, operators and a friend `<<`",
      "Test a class through a small command-driven program",
    ],
    intro: `Time to design a complete class: a **Polynomial** like 3x² − 2x + 5. You'll decide how to store it, what must always be true about it (its invariants), and which operations it offers.`,
    sections: [
      {
        title: "Data and invariants",
        body: `Store coefficients in a \`vector<long long>\` where index i holds the coefficient of xⁱ: 3x² − 2x + 5 is \`{5, -2, 3}\`.

**Invariant:** no trailing zero coefficients (so the vector's size tells you the degree), except that the zero polynomial is \`{}\`. A private \`trim()\` called after every change keeps it true.`,
      },
      {
        title: "The interface",
        body: `- \`Polynomial(vector<long long> coeffs)\` — trims on construction
- \`int degree() const\` — −1 for the zero polynomial
- \`long long operator()(long long x) const\` — evaluate (Horner's rule)
- \`operator+\`, \`operator*\`, and \`derivative()\`
- \`friend ostream& operator<<\` — prints like \`3x^2 - 2x + 5\``,
      },
      {
        title: "Horner's rule",
        body: `Evaluating 3x² − 2x + 5 as \`(3x − 2)x + 5\` needs one multiplication per coefficient:

\`\`\`cpp
long long r = 0;
for (int i = degree(); i >= 0; i--) r = r * x + c[i];
\`\`\``,
      },
    ],
    mistakes: [
      { title: "Forgetting the invariant", body: "If one operation leaves trailing zeros, degree() and printing break. Re-establish the invariant at the end of every mutating operation." },
      { title: "Printing edge cases", body: "Watch `1x`, `-1x`, `x^1`, `+ -3` and the zero polynomial — test each." },
      { title: "Public data", body: "If the vector were public, anyone could add trailing zeros and break the class." },
    ],
    example: {
      title: "Evaluating with Horner's rule",
      intro: "A minimal version of the class to start from.",
      code: r`#include <iostream>
#include <vector>
using namespace std;

class Polynomial {
    vector<long long> c;   // c[i] is the coefficient of x^i
    void trim() { while (!c.empty() && c.back() == 0) c.pop_back(); }
public:
    explicit Polynomial(vector<long long> coeffs) : c(coeffs) { trim(); }
    int degree() const { return (int)c.size() - 1; }
    long long operator()(long long x) const {
        long long r = 0;
        for (int i = degree(); i >= 0; i--) r = r * x + c[i];
        return r;
    }
};

int main() {
    Polynomial p({5, -2, 3, 0, 0});
    cout << "degree " << p.degree() << endl;
    cout << "p(2) = " << p(2) << endl;
    cout << "p(-1) = " << p(-1) << endl;
    return 0;
}`,
      output: "degree 2\np(2) = 13\np(-1) = 10\n",
      notes: [
        { line: 7, text: "The invariant: no trailing zeros." },
        { line: 9, text: "Trimming in the constructor means every Polynomial starts valid." },
        { line: 19, text: "The extra zeros are removed, so the degree is 2." },
      ],
    },
    quickCheck: {
      prompt: "Why keep the coefficient vector private?",
      options: [
        { id: "a", text: "So nothing outside the class can break the no-trailing-zeros invariant", feedback: "Yes — the class can only guarantee what it controls." },
        { id: "b", text: "Private data is faster", feedback: "Access control has no run-time cost either way." },
        { id: "c", text: "Vectors can't be public members", feedback: "They can; it's a design choice." },
      ],
      correct: "a",
      explanation: "Encapsulation exists so a class can keep its invariants true.",
    },
    exercise: {
      title: "Build the Polynomial class",
      prompt: `Complete \`Polynomial\` with: the trimming constructor, \`degree()\`, evaluation \`operator()\`, \`operator+\`, and a friend \`operator<<\` that prints terms from the highest power down, like \`3x^2 - 2x + 5\`:

- omit zero terms; print \`0\` for the zero polynomial,
- coefficient 1 or −1 is written as \`x\` / \`- x\`, except for the constant term,
- \`x^1\` is written \`x\`, \`x^0\` is just the number,
- a negative leading term starts with \`-\` (e.g. \`-x^3 + 1\`).

Input: two polynomials, each as a count k and k coefficients from x⁰ upwards, then a value x. Print p, q, p + q, and (p + q)(x) — one per line.`,
      starterCode: r`#include <iostream>
#include <vector>
using namespace std;

class Polynomial {
    vector<long long> c;
    void trim() { while (!c.empty() && c.back() == 0) c.pop_back(); }
public:
    explicit Polynomial(vector<long long> coeffs) : c(coeffs) { trim(); }
    // degree, operator(), operator+ (friend or member), friend operator<<
};

Polynomial readPoly() {
    int k;
    cin >> k;
    vector<long long> v(k);
    for (auto& x : v) cin >> x;
    return Polynomial(v);
}

int main() {
    Polynomial p = readPoly(), q = readPoly();
    long long x;
    cin >> x;
    // print p, q, p + q and (p + q)(x)
    return 0;
}`,
      tests: [
        { label: "sample", input: "3 5 -2 3\n2 1 1\n2\n", output: "3x^2 - 2x + 5\nx + 1\n3x^2 - x + 6\n16", visibility: "sample", category: "normal" },
        { label: "cancel to zero", input: "2 1 1\n2 -1 -1\n7\n", output: "x + 1\n-x - 1\n0\n0", visibility: "hidden", category: "edge" },
        { label: "leading negative", input: "4 1 0 0 -1\n1 0\n2\n", output: "-x^3 + 1\n0\n-x^3 + 1\n-7", visibility: "hidden", category: "edge" },
        { label: "constants", input: "1 4\n1 -9\n100\n", output: "4\n-9\n-5\n-5", visibility: "hidden", category: "boundary" },
      ],
      compare: "lines",
      hints: [
        "operator+: add coefficients position by position into a vector as long as the longer one, then construct (which trims).",
        "Printing: loop i from degree() down to 0, skip zeros, and track whether a term was printed already.",
        "For each term: sign (\"-\" or \" - \" / \" + \"), the absolute coefficient unless it's 1 with i > 0, then x or x^i.",
        "If nothing was printed, print 0.",
      ],
      solution: r`#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

class Polynomial {
    vector<long long> c;
    void trim() { while (!c.empty() && c.back() == 0) c.pop_back(); }
public:
    explicit Polynomial(vector<long long> coeffs) : c(coeffs) { trim(); }
    int degree() const { return (int)c.size() - 1; }
    long long operator()(long long x) const {
        long long r = 0;
        for (int i = degree(); i >= 0; i--) r = r * x + c[i];
        return r;
    }
    friend Polynomial operator+(const Polynomial& a, const Polynomial& b) {
        vector<long long> s(max(a.c.size(), b.c.size()), 0);
        for (size_t i = 0; i < a.c.size(); i++) s[i] += a.c[i];
        for (size_t i = 0; i < b.c.size(); i++) s[i] += b.c[i];
        return Polynomial(s);
    }
    friend ostream& operator<<(ostream& out, const Polynomial& p) {
        bool first = true;
        for (int i = p.degree(); i >= 0; i--) {
            long long k = p.c[i];
            if (k == 0) continue;
            if (first) out << (k < 0 ? "-" : "");
            else out << (k < 0 ? " - " : " + ");
            long long a = k < 0 ? -k : k;
            if (a != 1 || i == 0) out << a;
            if (i >= 1) out << "x";
            if (i >= 2) out << "^" << i;
            first = false;
        }
        if (first) out << 0;
        return out;
    }
};

Polynomial readPoly() {
    int k;
    cin >> k;
    vector<long long> v(k);
    for (auto& x : v) cin >> x;
    return Polynomial(v);
}

int main() {
    Polynomial p = readPoly(), q = readPoly();
    long long x;
    cin >> x;
    Polynomial s = p + q;
    cout << p << endl << q << endl << s << endl << s(x) << endl;
    return 0;
}`,
      solutionNotes: "Every Polynomial is built through the trimming constructor, so the invariant holds everywhere — including after `+` cancels the top terms. The printer handles its special cases one rule at a time.",
    },
    practice: practice(
      {
        title: "Multiply and differentiate",
        prompt: `Using the same representation, write \`operator*\` and \`derivative()\` for polynomials (you may copy your printer from the lesson). Read two polynomials (count + coefficients from x⁰ up). Print p × q, then the derivative of p × q.`,
        starterCode: starter("Implement Polynomial with *, derivative() and <<; print p*q and (p*q)'", "", ["iostream", "vector"], "// Write class Polynomial here (constructor that trims, *, derivative, <<)"),
        tests: [
          T("sample", "2 1 1\n2 -1 1\n", "x^2 - 1\n2x", "sample"),
          T("zero factor", "1 0\n3 1 2 3\n", "0\n0", "visible", "edge"),
          T("cubic", "2 2 3\n3 0 0 1\n", "3x^3 + 2x^2\n9x^2 + 4x", "hidden"),
          T("constants", "1 3\n1 -2\n", "-6\n0", "hidden", "boundary"),
        ],
        compare: "lines",
        hints: [
          "Product: result[i + j] += a[i] * b[j] for every pair of terms.",
          "Derivative: the coefficient of x^(i−1) is i × c[i].",
          "Construct the results through the trimming constructor.",
          "Reuse the printer rules: skip zeros, handle ±1, x^1 and the zero polynomial.",
        ],
        solution: r`#include <iostream>
#include <vector>
using namespace std;

class Polynomial {
    vector<long long> c;
    void trim() { while (!c.empty() && c.back() == 0) c.pop_back(); }
public:
    explicit Polynomial(vector<long long> coeffs) : c(coeffs) { trim(); }
    int degree() const { return (int)c.size() - 1; }
    Polynomial derivative() const {
        vector<long long> d;
        for (size_t i = 1; i < c.size(); i++) d.push_back((long long)i * c[i]);
        return Polynomial(d);
    }
    friend Polynomial operator*(const Polynomial& a, const Polynomial& b) {
        if (a.c.empty() || b.c.empty()) return Polynomial({});
        vector<long long> r(a.c.size() + b.c.size() - 1, 0);
        for (size_t i = 0; i < a.c.size(); i++)
            for (size_t j = 0; j < b.c.size(); j++) r[i + j] += a.c[i] * b.c[j];
        return Polynomial(r);
    }
    friend ostream& operator<<(ostream& out, const Polynomial& p) {
        bool first = true;
        for (int i = p.degree(); i >= 0; i--) {
            long long k = p.c[i];
            if (k == 0) continue;
            if (first) out << (k < 0 ? "-" : "");
            else out << (k < 0 ? " - " : " + ");
            long long a = k < 0 ? -k : k;
            if (a != 1 || i == 0) out << a;
            if (i >= 1) out << "x";
            if (i >= 2) out << "^" << i;
            first = false;
        }
        if (first) out << 0;
        return out;
    }
};

Polynomial readPoly() {
    int k;
    cin >> k;
    vector<long long> v(k);
    for (auto& x : v) cin >> x;
    return Polynomial(v);
}

int main() {
    Polynomial p = readPoly(), q = readPoly();
    Polynomial prod = p * q;
    cout << prod << endl << prod.derivative() << endl;
    return 0;
}`,
        solutionNotes: "Both operations build a raw coefficient vector and hand it to the constructor, which restores the invariant (the zero product becomes `{}` and prints as 0).",
      },
      {
        title: "Divide by (x − a)",
        prompt: `Add a member \`pair<Polynomial, long long> divideByLinear(long long a) const\` using **synthetic division**: it returns the quotient q and remainder r with p(x) = (x − a)·q(x) + r. Read a polynomial (count + coefficients from x⁰ up) and a, then print the quotient and the remainder (which equals p(a)).`,
        starterCode: starter("Implement synthetic division; print the quotient and the remainder", "", ["iostream", "vector", "utility"], "// Write class Polynomial here (trimming constructor, <<, divideByLinear)"),
        tests: [
          T("exact", "3 -1 0 1\n1\n", "x + 1\n0", "sample"),
          T("with remainder", "3 5 -2 3\n2\n", "3x + 4\n13", "sample"),
          T("constant", "1 7\n3\n", "0\n7", "hidden", "edge"),
          T("cubic", "4 -6 11 -6 1\n3\n", "x^2 - 3x + 2\n0", "hidden"),
        ],
        compare: "lines",
        hints: [
          "Work from the highest coefficient down: carry = c[n]; then carry = c[i] + a × carry.",
          "Each carry before the last is a quotient coefficient (from the top down).",
          "The final carry is the remainder.",
          "Build the quotient vector in reverse, then construct the Polynomial.",
        ],
        solution: r`#include <iostream>
#include <vector>
#include <utility>
#include <algorithm>
using namespace std;

class Polynomial {
    vector<long long> c;
    void trim() { while (!c.empty() && c.back() == 0) c.pop_back(); }
public:
    explicit Polynomial(vector<long long> coeffs) : c(coeffs) { trim(); }
    int degree() const { return (int)c.size() - 1; }
    pair<Polynomial, long long> divideByLinear(long long a) const {
        if (c.empty()) return {Polynomial({}), 0};
        vector<long long> q;
        long long carry = c.back();
        for (int i = degree() - 1; i >= 0; i--) {
            q.push_back(carry);
            carry = c[i] + a * carry;
        }
        reverse(q.begin(), q.end());
        return {Polynomial(q), carry};
    }
    friend ostream& operator<<(ostream& out, const Polynomial& p) {
        bool first = true;
        for (int i = p.degree(); i >= 0; i--) {
            long long k = p.c[i];
            if (k == 0) continue;
            if (first) out << (k < 0 ? "-" : "");
            else out << (k < 0 ? " - " : " + ");
            long long v = k < 0 ? -k : k;
            if (v != 1 || i == 0) out << v;
            if (i >= 1) out << "x";
            if (i >= 2) out << "^" << i;
            first = false;
        }
        if (first) out << 0;
        return out;
    }
};

int main() {
    int k;
    cin >> k;
    vector<long long> v(k);
    for (auto& x : v) cin >> x;
    long long a;
    cin >> a;
    auto [q, r] = Polynomial(v).divideByLinear(a);
    cout << q << endl << r << endl;
    return 0;
}`,
        solutionNotes: "Synthetic division is Horner's rule that also keeps its intermediate values: they are exactly the quotient's coefficients, and the last one is p(a) — the remainder theorem.",
      },
    ),
    explainAgain: `Designing a class is deciding three things: what it remembers (private data), what must always be true about that data (invariants), and what it lets others do (public interface). If every public operation leaves the invariant true, the rest of your program never has to worry about it.`,
    summary: [
      "Choose a representation, write down its invariant, keep the data private.",
      "Construct through one path that establishes the invariant; re-establish it after every change.",
      "Test every edge case of the interface, especially printing.",
    ],
  },
];
