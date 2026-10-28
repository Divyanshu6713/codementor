import type { CourseLesson } from "./types";
import { practice, starter, T } from "./practice/helpers";

const r = String.raw;

/** New lessons for Module 13 (data structures). */
export const EXTRA_DS_LESSONS: CourseLesson[] = [
  {
    id: "dynamic-arrays",
    moduleId: "data-structures",
    after: "linked-lists",
    title: "How vector grows (dynamic arrays)",
    minutes: 20,
    concepts: ["capacity", "size", "reallocation", "amortised O(1)", "iterator invalidation"],
    goals: [
      "Explain size versus capacity",
      "Build a growable array that doubles its capacity",
      "Understand why push_back is amortised O(1) — and why it can invalidate pointers",
    ],
    intro: `A plain array has a fixed size. \`vector\` seems to grow forever — but underneath it *is* a fixed-size array. When it fills up, vector allocates a bigger one, copies everything over and frees the old one. Building that yourself explains both why vector is fast and why references into it can suddenly dangle.`,
    sections: [
      {
        title: "size and capacity",
        body: `- **size**: how many elements are stored.
- **capacity**: how many fit before the next reallocation.

When size reaches capacity, a new array (typically 1.5× or 2× bigger) is allocated and the elements move across. \`reserve(n)\` sets the capacity up front when you know how many elements are coming.`,
      },
      {
        title: "Why doubling is cheap on average",
        body: `With doubling, pushing n elements copies at most 1 + 2 + 4 + … + n/2 < n elements in total. So each push costs O(1) **on average** (amortised), even though an individual push that triggers growth costs O(n). Growing by a fixed +10 instead would copy ~n²/20 elements — quadratic.`,
      },
      {
        title: "Invalidation",
        body: `\`\`\`cpp
vector<int> v = {1, 2, 3};
int* p = &v[0];
v.push_back(4);   // may reallocate
cout << *p;       // undefined behaviour if it did
\`\`\`

After any operation that can reallocate (push_back, insert, resize), pointers, references and iterators into the vector may be invalid. Store indexes instead, or reserve first.`,
      },
    ],
    mistakes: [
      { title: "Keeping pointers across push_back", body: "They can dangle after a reallocation. Re-take them, or keep indexes." },
      { title: "Growing by a constant", body: "+1 or +10 per growth makes n pushes O(n²). Multiply the capacity." },
      { title: "Confusing reserve and resize", body: "reserve changes capacity only; resize changes size (adding default elements)." },
    ],
    example: {
      title: "A tiny growable array",
      intro: "A doubling array that reports every reallocation.",
      code: r`#include <iostream>
using namespace std;

class IntArray {
    int* data = nullptr;
    int sz = 0, cap = 0;
public:
    ~IntArray() { delete[] data; }
    void push(int x) {
        if (sz == cap) {
            int newCap = cap == 0 ? 1 : cap * 2;
            int* bigger = new int[newCap];
            for (int i = 0; i < sz; i++) bigger[i] = data[i];
            delete[] data;
            data = bigger;
            cap = newCap;
            cout << "grow to " << cap << endl;
        }
        data[sz++] = x;
    }
    int size() const { return sz; }
    int at(int i) const { return data[i]; }
};

int main() {
    IntArray a;
    for (int i = 1; i <= 5; i++) a.push(i * 10);
    cout << "size " << a.size() << ", last " << a.at(a.size() - 1) << endl;
    return 0;
}`,
      output: "grow to 1\ngrow to 2\ngrow to 4\ngrow to 8\nsize 5, last 50\n",
      notes: [
        { line: 10, text: "Full: time to grow." },
        { line: 11, text: "Double the capacity (start at 1)." },
        { line: 13, text: "Copy the old elements across — the O(n) part." },
        { line: 14, text: "Free the old block; pointers into it are now invalid." },
      ],
    },
    quickCheck: {
      prompt: "A doubling array starts with capacity 1. How many reallocations happen while pushing 9 elements?",
      options: [
        { id: "a", text: "5 (capacities 1, 2, 4, 8, 16)", feedback: "Yes — growth happens when pushing elements 1, 2, 3, 5 and 9." },
        { id: "b", text: "9", feedback: "Only pushes into a full array trigger growth." },
        { id: "c", text: "3", feedback: "Count again: 1 → 2 → 4 → 8 → 16, starting from 0." },
      ],
      correct: "a",
      explanation: "Doubling means only about log₂ n reallocations.",
    },
    exercise: {
      title: "Build a growable array",
      prompt: `Write a class \`DynArray\` storing \`long long\` values in a \`new[]\` block that **doubles** (starting at capacity 1). Support commands: \`push X\`, \`pop\` (remove the last, or print \`empty\`), \`get I\` (print element I or \`out of range\`), \`size\` (print \`size S capacity C\`). Count every element copied during growth and print \`copies N\` at the end. Free the memory in the destructor.`,
      starterCode: r`#include <iostream>
#include <string>
using namespace std;

class DynArray {
    long long* data = nullptr;
    int sz = 0, cap = 0;
    long long copies = 0;
public:
    // destructor, push, pop, get, size ...
};

int main() {
    DynArray a;
    string cmd;
    while (cin >> cmd) {
        // dispatch the commands
    }
    // print copies N
    return 0;
}`,
      tests: [
        { label: "sample", input: "push 5\npush 6\npush 7\nsize\nget 2\npop\nsize\n", output: "size 3 capacity 4\n7\nsize 2 capacity 4\ncopies 3", visibility: "sample", category: "normal" },
        { label: "empty", input: "pop\nget 0\nsize\n", output: "empty\nout of range\nsize 0 capacity 0\ncopies 0", visibility: "hidden", category: "edge" },
        { label: "nine pushes", input: "push 1\npush 2\npush 3\npush 4\npush 5\npush 6\npush 7\npush 8\npush 9\nsize\nget -1\n", output: "size 9 capacity 16\nout of range\ncopies 15", visibility: "hidden", category: "normal" },
      ],
      compare: "lines",
      hints: [
        "push: if sz == cap, allocate newCap = cap ? cap * 2 : 1, copy sz elements (copies += sz), delete[] the old block.",
        "pop just decreases sz (capacity stays).",
        "get checks 0 <= i < sz.",
        "~DynArray() { delete[] data; }",
      ],
      solution: r`#include <iostream>
#include <string>
using namespace std;

class DynArray {
    long long* data = nullptr;
    int sz = 0, cap = 0;
    long long copies = 0;
public:
    DynArray() = default;
    DynArray(const DynArray&) = delete;
    DynArray& operator=(const DynArray&) = delete;
    ~DynArray() { delete[] data; }
    void push(long long x) {
        if (sz == cap) {
            int newCap = cap ? cap * 2 : 1;
            long long* bigger = new long long[newCap];
            for (int i = 0; i < sz; i++) bigger[i] = data[i];
            copies += sz;
            delete[] data;
            data = bigger;
            cap = newCap;
        }
        data[sz++] = x;
    }
    bool pop() {
        if (sz == 0) return false;
        sz--;
        return true;
    }
    bool get(int i, long long& out) const {
        if (i < 0 || i >= sz) return false;
        out = data[i];
        return true;
    }
    int size() const { return sz; }
    int capacity() const { return cap; }
    long long copyCount() const { return copies; }
};

int main() {
    DynArray a;
    string cmd;
    while (cin >> cmd) {
        if (cmd == "push") {
            long long x;
            cin >> x;
            a.push(x);
        } else if (cmd == "pop") {
            if (!a.pop()) cout << "empty" << endl;
        } else if (cmd == "get") {
            int i;
            cin >> i;
            long long v;
            if (a.get(i, v)) cout << v << endl;
            else cout << "out of range" << endl;
        } else if (cmd == "size") {
            cout << "size " << a.size() << " capacity " << a.capacity() << endl;
        }
    }
    cout << "copies " << a.copyCount() << endl;
    return 0;
}`,
      solutionNotes: "Nine pushes copy 1 + 2 + 4 + 8 = 15 elements — fewer than 2n. Copying is deleted so two objects can never own the same block.",
    },
    practice: practice(
      {
        title: "Doubling versus +10",
        prompt: `Read pushes \`n\` (up to 10⁶, one per line, until the input ends). For each, print the total number of element copies made while pushing n elements into an initially empty array (capacity 0) with two strategies: **doubling** (0 → 1 → 2 → 4 …) and **+10** (0 → 10 → 20 → 30 …). Format: \`double D, plus10 P\`. Simulate the growth arithmetically — no real array needed.`,
        starterCode: starter("Simulate capacity growth for both strategies", "long long n;", ["iostream"]),
        tests: [
          T("sample", "9\n", "double 15, plus10 0", "sample"),
          T("thirty", "30\n", "double 31, plus10 30", "visible"),
          T("big", "1000000\n", "double 1048575, plus10 49999500000", "hidden"),
          T("zero", "0\n", "double 0, plus10 0", "hidden", "edge"),
        ],
        compare: "lines",
        hints: [
          "Loop pushes i = 0 … n − 1, where i is the current size.",
          "If i == cap, growth copies i elements, then cap grows.",
          "Doubling: cap = cap ? 2 * cap : 1. Plus10: cap += 10.",
          "Use long long — the +10 total is about n² / 20.",
        ],
        solution: r`#include <iostream>
using namespace std;

int main() {
    long long n;
    while (cin >> n) {
        long long capD = 0, copiesD = 0, capP = 0, copiesP = 0;
        for (long long i = 0; i < n; i++) {
            if (i == capD) { copiesD += i; capD = capD ? capD * 2 : 1; }
            if (i == capP) { copiesP += i; capP += 10; }
        }
        cout << "double " << copiesD << ", plus10 " << copiesP << endl;
    }
    return 0;
}`,
        solutionNotes: "For a million pushes: about a million copies with doubling, about fifty billion with +10. That gap is why vector multiplies its capacity.",
      },
      {
        title: "Insert in the middle",
        prompt: `Using a \`vector<long long>\`, support \`insert I X\` (insert X before index I, 0 ≤ I ≤ size, else print \`bad index\`), \`erase I\` (or \`bad index\`) and \`print\`. Count how many elements had to **shift** in total (inserting at I shifts size − I elements; erasing at I shifts size − I − 1) and print \`shifted N\` at the end.`,
        starterCode: starter("Implement insert/erase/print and count shifted elements", "vector<long long> v;\nlong long shifted = 0;\nstring cmd;", ["iostream", "vector", "string"]),
        tests: [
          T("sample", "insert 0 5\ninsert 0 3\ninsert 1 4\nprint\nerase 0\nprint\n", "3 4 5\n4 5\nshifted 4", "sample"),
          T("bad", "insert 1 9\nerase 0\nprint\n", "bad index\nbad index\n(empty)\nshifted 0", "visible", "edge"),
          T("append", "insert 0 1\ninsert 1 2\ninsert 2 3\nprint\n", "1 2 3\nshifted 0", "hidden"),
        ],
        compare: "lines",
        hints: [
          "v.insert(v.begin() + i, x) after checking 0 <= i <= v.size().",
          "Before inserting: shifted += v.size() − i.",
          "erase: check 0 <= i < v.size(); shifted += v.size() − i − 1.",
          "print `(empty)` for an empty vector.",
        ],
        solution: r`#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    vector<long long> v;
    long long shifted = 0;
    string cmd;
    while (cin >> cmd) {
        if (cmd == "insert") {
            long long i, x;
            cin >> i >> x;
            if (i < 0 || i > (long long)v.size()) { cout << "bad index" << endl; continue; }
            shifted += (long long)v.size() - i;
            v.insert(v.begin() + i, x);
        } else if (cmd == "erase") {
            long long i;
            cin >> i;
            if (i < 0 || i >= (long long)v.size()) { cout << "bad index" << endl; continue; }
            shifted += (long long)v.size() - i - 1;
            v.erase(v.begin() + i);
        } else if (cmd == "print") {
            if (v.empty()) cout << "(empty)";
            for (size_t k = 0; k < v.size(); k++) cout << (k ? " " : "") << v[k];
            cout << endl;
        }
    }
    cout << "shifted " << shifted << endl;
    return 0;
}`,
        solutionNotes: "Appending shifts nothing; inserting at the front shifts everything. That's why vector insertion in the middle is O(n), and why deque or list exist.",
      },
    ),
    explainAgain: `A vector is a row of lockers. When every locker is full and someone new arrives, the school builds a new row twice as long, moves everyone's things over and knocks down the old row. Moving is slow, but it happens so rarely that, on average, each newcomer is cheap. Anyone who wrote down "locker 3 in the old row" now has a wrong address.`,
    summary: [
      "vector = a heap array with size ≤ capacity; growth reallocates and copies.",
      "Multiplying capacity makes push_back amortised O(1).",
      "Reallocation invalidates pointers, references and iterators.",
    ],
  },

  {
    id: "stacks-queues-scratch",
    moduleId: "data-structures",
    after: "dynamic-arrays",
    title: "Stacks and queues from scratch",
    minutes: 20,
    concepts: ["stack", "queue", "circular buffer", "two-stack queue"],
    goals: [
      "Implement a stack on top of an array",
      "Implement a fixed-size queue as a circular buffer",
      "Build one structure from another (a queue from two stacks)",
    ],
    intro: `\`std::stack\` and \`std::queue\` are thin wrappers. Writing them yourself shows the two classic tricks: a stack only ever touches the end of an array, and a queue can reuse its space by **wrapping around** like a clock face.`,
    sections: [
      {
        title: "A stack is an array plus a top index",
        body: `Push writes at \`top\` and increments; pop decrements. Both are O(1). Using a \`vector\` as storage, \`push_back\`/\`pop_back\`/\`back\` are exactly a stack.`,
      },
      {
        title: "A circular queue",
        body: `With a fixed array of capacity C, keep \`head\` (front index) and \`count\`:

\`\`\`cpp
void push(int x) { buf[(head + count) % C] = x; count++; }
int  pop()       { int x = buf[head]; head = (head + 1) % C; count--; return x; }
\`\`\`

The \`% C\` wraps the indexes around, so freed slots at the front get reused — no shifting, every operation O(1).`,
      },
      {
        title: "A queue from two stacks",
        body: `Push onto an "in" stack. To pop, if the "out" stack is empty, pour everything from "in" into "out" (reversing it), then pop "out". Each element moves at most once, so operations are amortised O(1).`,
      },
    ],
    mistakes: [
      { title: "Forgetting to wrap", body: "Without % C, indexes run off the end of the buffer." },
      { title: "Confusing full and empty", body: "With head and tail alone, head == tail is ambiguous. Keeping a count avoids it." },
      { title: "Popping an empty structure", body: "Always check before pop/top/front." },
    ],
    example: {
      title: "A circular buffer wrapping around",
      intro: "Capacity 3: after two pops, new elements reuse the front slots.",
      code: r`#include <iostream>
using namespace std;

const int C = 3;
int buf[C];
int head = 0, cnt = 0;

bool push(int x) {
    if (cnt == C) return false;
    buf[(head + cnt) % C] = x;
    cnt++;
    return true;
}

int pop() {
    int x = buf[head];
    head = (head + 1) % C;
    cnt--;
    return x;
}

int main() {
    push(1); push(2); push(3);
    cout << "full? " << !push(4) << endl;
    cout << pop() << " " << pop() << endl;
    push(5); push(6);
    cout << "head " << head << ":";
    while (cnt > 0) cout << " " << pop();
    cout << endl;
    return 0;
}`,
      output: "full? 1\n1 2\nhead 2: 3 5 6\n",
      notes: [
        { line: 10, text: "The next free slot, wrapped around with % C." },
        { line: 17, text: "Moving head forward also wraps." },
        { line: 26, text: "5 and 6 land in slots 0 and 1, which were freed by the pops." },
      ],
    },
    quickCheck: {
      prompt: "A circular queue has capacity 5, head = 3 and count = 4. Where does the next push go?",
      options: [
        { id: "a", text: "Index 2", feedback: "Yes: (3 + 4) % 5 = 2." },
        { id: "b", text: "Index 7", feedback: "There's no index 7 — wrap with % 5." },
        { id: "c", text: "It's full", feedback: "count is 4, capacity is 5: one slot is free." },
      ],
      correct: "a",
      explanation: "The tail position is (head + count) % capacity.",
    },
    exercise: {
      title: "A circular queue class",
      prompt: `Read the capacity \`C\`, then commands: \`push X\` (print \`full\` if full), \`pop\` (print the value or \`empty\`), \`front\` (print it or \`empty\`), \`size\`. Implement \`CircularQueue\` on a \`vector<long long>\` of size C with head and count — no std::queue or deque.`,
      starterCode: r`#include <iostream>
#include <string>
#include <vector>
using namespace std;

class CircularQueue {
    vector<long long> buf;
    int head = 0, cnt = 0;
public:
    explicit CircularQueue(int c) : buf(c) {}
    // push, pop, front, size ...
};

int main() {
    int C;
    cin >> C;
    CircularQueue q(C);
    string cmd;
    while (cin >> cmd) {
        // dispatch
    }
    return 0;
}`,
      tests: [
        { label: "sample", input: "2\npush 1\npush 2\npush 3\npop\npush 4\nfront\nsize\n", output: "full\n1\n2\n2", visibility: "sample", category: "normal" },
        { label: "empty", input: "3\npop\nfront\nsize\n", output: "empty\nempty\n0", visibility: "hidden", category: "edge" },
        { label: "wrap many times", input: "1\npush 7\npop\npush 8\npop\npush 9\nfront\n", output: "7\n8\n9", visibility: "hidden", category: "edge" },
      ],
      compare: "lines",
      hints: [
        "Full when cnt == buf.size(); empty when cnt == 0.",
        "push writes at (head + cnt) % C.",
        "pop reads buf[head], then head = (head + 1) % C.",
        "Return bool from push/pop to report full/empty.",
      ],
      solution: r`#include <iostream>
#include <string>
#include <vector>
using namespace std;

class CircularQueue {
    vector<long long> buf;
    int head = 0, cnt = 0;
public:
    explicit CircularQueue(int c) : buf(c) {}
    bool push(long long x) {
        if (cnt == (int)buf.size()) return false;
        buf[(head + cnt) % buf.size()] = x;
        cnt++;
        return true;
    }
    bool pop(long long& out) {
        if (cnt == 0) return false;
        out = buf[head];
        head = (head + 1) % buf.size();
        cnt--;
        return true;
    }
    bool front(long long& out) const {
        if (cnt == 0) return false;
        out = buf[head];
        return true;
    }
    int size() const { return cnt; }
};

int main() {
    int C;
    cin >> C;
    CircularQueue q(C);
    string cmd;
    while (cin >> cmd) {
        long long v;
        if (cmd == "push") {
            cin >> v;
            if (!q.push(v)) cout << "full" << endl;
        } else if (cmd == "pop") {
            if (q.pop(v)) cout << v << endl;
            else cout << "empty" << endl;
        } else if (cmd == "front") {
            if (q.front(v)) cout << v << endl;
            else cout << "empty" << endl;
        } else if (cmd == "size") {
            cout << q.size() << endl;
        }
    }
    return 0;
}`,
      solutionNotes: "Every operation is O(1) and the memory never grows: this is how audio buffers, keyboard buffers and network queues work.",
    },
    practice: practice(
      {
        title: "Queue from two stacks",
        prompt: `Implement a queue using only two \`std::stack<long long>\`s. Commands: \`push X\`, \`pop\` (print the value or \`empty\`). At the end print \`moved N\` — how many elements were poured from the in-stack to the out-stack in total.`,
        starterCode: starter("Push onto 'in'; pop from 'out', refilling it from 'in' only when it's empty", "stack<long long> in, out;\nlong long moved = 0;\nstring cmd;", ["iostream", "stack", "string"]),
        tests: [
          T("sample", "push 1\npush 2\npop\npush 3\npop\npop\npop\n", "1\n2\n3\nempty\nmoved 3", "sample"),
          T("empty", "pop\n", "empty\nmoved 0", "visible", "edge"),
          T("batches", "push 1\npush 2\npush 3\npop\npush 4\npop\npop\npop\n", "1\n2\n3\n4\nmoved 4", "hidden"),
        ],
        compare: "lines",
        hints: [
          "push: in.push(x).",
          "pop: if out is empty, move everything from in to out (counting moves).",
          "Then if out is still empty, print empty; else print and pop out.top().",
          "Each element moves at most once — amortised O(1).",
        ],
        solution: r`#include <iostream>
#include <stack>
#include <string>
using namespace std;

int main() {
    stack<long long> in, out;
    long long moved = 0;
    string cmd;
    while (cin >> cmd) {
        if (cmd == "push") {
            long long x;
            cin >> x;
            in.push(x);
        } else if (cmd == "pop") {
            if (out.empty()) {
                while (!in.empty()) {
                    out.push(in.top());
                    in.pop();
                    moved++;
                }
            }
            if (out.empty()) cout << "empty" << endl;
            else {
                cout << out.top() << endl;
                out.pop();
            }
        }
    }
    cout << "moved " << moved << endl;
    return 0;
}`,
        solutionNotes: "Pouring reverses the order, so the oldest element ends up on top of 'out'. Refilling only when 'out' is empty is what keeps the order right.",
      },
      {
        title: "Stack with O(1) minimum",
        prompt: `Implement a stack supporting \`push X\`, \`pop\` (print \`empty\` if empty), \`top\` and \`min\` (print the value or \`empty\`) — **all O(1)**. Keep a second stack holding the minimum at each depth.`,
        starterCode: starter("Keep (value, minSoFar) pairs or a parallel min stack", "string cmd;", ["iostream", "vector", "string", "algorithm", "utility"]),
        tests: [
          T("sample", "push 5\npush 2\npush 8\nmin\npop\npop\nmin\ntop\n", "2\n5\n5", "sample"),
          T("empty", "min\ntop\npop\n", "empty\nempty\nempty", "visible", "edge"),
          T("equal minimums", "push 3\npush 3\npop\nmin\n", "3", "hidden", "edge"),
          T("negatives", "push -1\npush -5\npush 0\nmin\npop\npop\nmin\n", "-5\n-1", "hidden"),
        ],
        compare: "lines",
        hints: [
          "Store pairs: (value, minimum of the stack including this value).",
          "push x: newMin = empty ? x : min(x, back().second).",
          "min is back().second; top is back().first.",
          "pop just pops — the previous minimum is still stored underneath.",
        ],
        solution: r`#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <utility>
using namespace std;

int main() {
    vector<pair<long long, long long>> st;
    string cmd;
    while (cin >> cmd) {
        if (cmd == "push") {
            long long x;
            cin >> x;
            long long m = st.empty() ? x : min(x, st.back().second);
            st.push_back({x, m});
        } else if (cmd == "pop") {
            if (st.empty()) cout << "empty" << endl;
            else st.pop_back();
        } else if (cmd == "top") {
            if (st.empty()) cout << "empty" << endl;
            else cout << st.back().first << endl;
        } else if (cmd == "min") {
            if (st.empty()) cout << "empty" << endl;
            else cout << st.back().second << endl;
        }
    }
    return 0;
}`,
        solutionNotes: "Each entry remembers the minimum of everything at or below it. Popping restores the previous minimum automatically, so nothing ever needs recomputing.",
      },
    ),
    explainAgain: `A stack is a pile of plates: you only touch the top. A circular queue is a round table with a fixed number of seats: people join at the next free seat going clockwise and leave from the front; when you reach the last seat, you continue at seat 0.`,
    summary: [
      "A stack is an array plus a top: push/pop at the end in O(1).",
      "A circular queue wraps indexes with % capacity: O(1), fixed memory.",
      "Two stacks make a queue with amortised O(1) operations.",
    ],
  },

  {
    id: "tries",
    moduleId: "data-structures",
    after: "trees-bst",
    title: "Tries",
    minutes: 20,
    concepts: ["trie", "prefix tree", "end-of-word marker", "autocomplete"],
    goals: [
      "Store words letter by letter in a prefix tree",
      "Insert, search and test prefixes in O(word length)",
      "Count and list words that start with a prefix",
    ],
    intro: `How does a phone suggest words as you type? Searching a list of 100 000 words for every keystroke would be slow. A **trie** stores words as paths of letters, so all words starting with "ca" live under the same branch.`,
    sections: [
      {
        title: "The structure",
        body: `Each node has up to 26 children (one per letter) and a flag saying "a word ends here".

\`\`\`
(root) ─c─ a ─t*      words: cat, car, cart, do
              └r* ─t*
       └d─ o*
\`\`\`

Storing nodes in a \`vector\` and children as indexes avoids manual \`new\`/\`delete\`:

\`\`\`cpp
struct Node { int next[26]; bool end = false; int pass = 0; };
\`\`\``,
      },
      {
        title: "Insert and search",
        body: `\`\`\`cpp
void insert(const string& w) {
    int cur = 0;
    for (char ch : w) {
        int c = ch - 'a';
        if (nodes[cur].next[c] == -1) { nodes[cur].next[c] = nodes.size(); nodes.push_back(Node()); }
        cur = nodes[cur].next[c];
        nodes[cur].pass++;           // words passing through this node
    }
    nodes[cur].end = true;
}
\`\`\`

Search follows the same path; it's a word if the final node has \`end\`, and a prefix if the path exists at all. Each costs O(length), no matter how many words are stored.`,
      },
      {
        title: "Listing completions",
        body: `To list all words with a prefix, walk to the prefix's node and then do a DFS, visiting children a → z. That produces the words in alphabetical order.`,
      },
    ],
    mistakes: [
      { title: "Forgetting the end marker", body: "Without it, inserting \"cart\" would make \"car\" and \"ca\" look like words too." },
      { title: "Indexing with uppercase or other characters", body: "'A' − 'a' is negative. Normalise the input or size the child array for the alphabet you actually have." },
      { title: "Taking a reference into the node vector, then pushing", body: "push_back can reallocate; re-index nodes[cur] after adding." },
    ],
    example: {
      title: "Words and prefixes",
      intro: "A vector-backed trie answering word and prefix questions.",
      code: r`#include <iostream>
#include <string>
#include <vector>
using namespace std;

struct Node {
    int next[26];
    bool end = false;
    Node() { for (int& x : next) x = -1; }
};

vector<Node> nodes(1);

void insert(const string& w) {
    int cur = 0;
    for (char ch : w) {
        int c = ch - 'a';
        if (nodes[cur].next[c] == -1) {
            nodes[cur].next[c] = nodes.size();
            nodes.push_back(Node());
        }
        cur = nodes[cur].next[c];
    }
    nodes[cur].end = true;
}

int walk(const string& s) {
    int cur = 0;
    for (char ch : s) {
        cur = nodes[cur].next[ch - 'a'];
        if (cur == -1) return -1;
    }
    return cur;
}

int main() {
    for (string w : {"cat", "car", "cart", "do"}) insert(w);
    for (string q : {"car", "ca", "dog", "do"}) {
        int n = walk(q);
        cout << q << ": " << (n != -1 && nodes[n].end ? "word" : n != -1 ? "prefix" : "absent") << endl;
    }
    cout << "nodes " << nodes.size() << endl;
    return 0;
}`,
      output: "car: word\nca: prefix\ndog: absent\ndo: word\nnodes 8\n",
      notes: [
        { line: 8, text: "-1 means \"no child for this letter\"." },
        { line: 19, text: "A missing letter gets a fresh node at the end of the vector." },
        { line: 24, text: "Mark the end of the word." },
        { line: 41, text: "c, a, t, r, t, d, o plus the root: 8 nodes for 4 words that share prefixes." },
      ],
    },
    quickCheck: {
      prompt: "A trie holds only \"cart\". Does searching for the word \"car\" succeed?",
      options: [
        { id: "a", text: "No — the path exists, but the 'r' node isn't marked as a word end", feedback: "Right: \"car\" is a prefix here, not a stored word." },
        { id: "b", text: "Yes — the letters c, a, r are all there", feedback: "The end marker is what distinguishes words from prefixes." },
        { id: "c", text: "It depends on the order of insertion", feedback: "The structure is the same whatever the insertion order." },
      ],
      correct: "a",
      explanation: "Words are paths that end at a node with the end flag set.",
    },
    exercise: {
      title: "Dictionary with prefix counts",
      prompt: `Implement a trie for lowercase words. Commands: \`add WORD\`, \`has WORD\` (\`yes\`/\`no\`), \`count PREFIX\` (how many added words start with PREFIX; adding the same word twice counts twice).`,
      starterCode: r`#include <iostream>
#include <string>
#include <vector>
using namespace std;

struct Node {
    int next[26];
    bool end = false;
    int pass = 0;
    Node() { for (int& x : next) x = -1; }
};

int main() {
    vector<Node> nodes(1);
    string cmd, s;
    while (cin >> cmd >> s) {
        // add / has / count
    }
    return 0;
}`,
      tests: [
        { label: "sample", input: "add cat\nadd car\nadd cart\ncount ca\ncount car\nhas car\nhas ca\n", output: "3\n2\nyes\nno", visibility: "sample", category: "normal" },
        { label: "missing prefix", input: "add apple\ncount b\nhas apple\n", output: "0\nyes", visibility: "hidden", category: "edge" },
        { label: "duplicates", input: "add go\nadd go\ncount g\nhas go\n", output: "2\nyes", visibility: "hidden", category: "edge" },
      ],
      compare: "lines",
      hints: [
        "add walks/creates the path and increments pass on every node it enters.",
        "Set end = true on the last node.",
        "Write a walk(s) helper returning the final node index, or −1.",
        "count: node == −1 ? 0 : nodes[node].pass. has: node != −1 && nodes[node].end.",
      ],
      solution: r`#include <iostream>
#include <string>
#include <vector>
using namespace std;

struct Node {
    int next[26];
    bool end = false;
    int pass = 0;
    Node() { for (int& x : next) x = -1; }
};

int main() {
    vector<Node> nodes(1);
    auto walk = [&](const string& s) {
        int cur = 0;
        for (char ch : s) {
            cur = nodes[cur].next[ch - 'a'];
            if (cur == -1) return -1;
        }
        return cur;
    };
    string cmd, s;
    while (cin >> cmd >> s) {
        if (cmd == "add") {
            int cur = 0;
            for (char ch : s) {
                int c = ch - 'a';
                if (nodes[cur].next[c] == -1) {
                    nodes[cur].next[c] = nodes.size();
                    nodes.push_back(Node());
                }
                cur = nodes[cur].next[c];
                nodes[cur].pass++;
            }
            nodes[cur].end = true;
        } else if (cmd == "has") {
            int n = walk(s);
            cout << (n != -1 && nodes[n].end ? "yes" : "no") << endl;
        } else if (cmd == "count") {
            int n = walk(s);
            cout << (n == -1 ? 0 : nodes[n].pass) << endl;
        }
    }
    return 0;
}`,
      solutionNotes: "The pass counter on each node answers prefix counts in O(prefix length) — no need to visit the words below.",
    },
    practice: practice(
      {
        title: "Longest common prefix",
        prompt: `Read \`n\` lowercase words. Insert them into a trie, then walk down from the root while the current node has **exactly one** child and isn't the end of a word. Print the longest common prefix of all words, or \`(none)\` if it's empty.`,
        starterCode: starter("Build a trie, then follow single-child, non-terminal nodes", "int n;\ncin >> n;\nvector<string> words(n);\nfor (auto& w : words) cin >> w;", ["iostream", "string", "vector"], "// struct Node { int next[26]; bool end = false; Node() { for (int& x : next) x = -1; } };"),
        tests: [
          T("sample", "3\nflower\nflow\nflight\n", "fl", "sample"),
          T("none", "2\ndog\ncar\n", "(none)", "visible", "edge"),
          T("one word is the prefix", "2\nab\nabc\n", "ab", "hidden", "edge"),
          T("single word", "1\nhello\n", "hello", "hidden", "boundary"),
        ],
        hints: [
          "Insert every word as usual.",
          "From the root, count non-(−1) children; continue only if there's exactly one and the node isn't an end.",
          "Append that child's letter to the answer and move to it.",
          "Stop at a word end: shorter words limit the prefix.",
        ],
        solution: r`#include <iostream>
#include <string>
#include <vector>
using namespace std;

struct Node {
    int next[26];
    bool end = false;
    Node() { for (int& x : next) x = -1; }
};

int main() {
    int n;
    cin >> n;
    vector<string> words(n);
    for (auto& w : words) cin >> w;
    vector<Node> nodes(1);
    for (const auto& w : words) {
        int cur = 0;
        for (char ch : w) {
            int c = ch - 'a';
            if (nodes[cur].next[c] == -1) {
                nodes[cur].next[c] = nodes.size();
                nodes.push_back(Node());
            }
            cur = nodes[cur].next[c];
        }
        nodes[cur].end = true;
    }
    string prefix;
    int cur = 0;
    while (!nodes[cur].end) {
        int only = -1, children = 0;
        for (int c = 0; c < 26; c++)
            if (nodes[cur].next[c] != -1) { children++; only = c; }
        if (children != 1) break;
        prefix += char('a' + only);
        cur = nodes[cur].next[only];
    }
    cout << (prefix.empty() ? "(none)" : prefix) << endl;
    return 0;
}`,
        solutionNotes: "Where the trie first branches (or a word ends) is exactly where the words stop agreeing.",
      },
      {
        title: "Autocomplete",
        prompt: `Read \`n\` dictionary words, then queries (one prefix per line, until the input ends). For each, print up to **3** dictionary words starting with the prefix in alphabetical order, space-separated, or \`-\` if there are none. Duplicates in the dictionary appear once. Use a trie and a DFS that visits letters a → z and stops after 3 results.`,
        starterCode: starter("Walk to the prefix node, then DFS a..z collecting at most 3 words", "int n;\ncin >> n;", ["iostream", "string", "vector"], "// struct Node … and a recursive collect function"),
        tests: [
          T("sample", "6\ncar\ncat\ncart\ncare\ndog\ncab\nca\ncar\nd\nx\n", "cab car care\ncar care cart\ndog\n-", "sample"),
          T("exact word", "2\nab\nab\nab\n", "ab", "visible", "edge"),
          T("fewer than three", "2\nzoo\nzebra\nz\n", "zebra zoo", "hidden"),
        ],
        compare: "lines",
        hints: [
          "Insert all words; set end on the last node (duplicates just set it again).",
          "Walk to the prefix node; if missing, print -.",
          "collect(node, current string): if end, add the word; then for c = 0..25 recurse into children while results < 3.",
          "Start collect with the prefix itself as the current string.",
        ],
        solution: r`#include <iostream>
#include <string>
#include <vector>
using namespace std;

struct Node {
    int next[26];
    bool end = false;
    Node() { for (int& x : next) x = -1; }
};

vector<Node> nodes(1);

void collect(int node, string& cur, vector<string>& out) {
    if (out.size() >= 3) return;
    if (nodes[node].end) out.push_back(cur);
    for (int c = 0; c < 26 && out.size() < 3; c++) {
        int nx = nodes[node].next[c];
        if (nx == -1) continue;
        cur.push_back(char('a' + c));
        collect(nx, cur, out);
        cur.pop_back();
    }
}

int main() {
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) {
        string w;
        cin >> w;
        int cur = 0;
        for (char ch : w) {
            int c = ch - 'a';
            if (nodes[cur].next[c] == -1) {
                nodes[cur].next[c] = nodes.size();
                nodes.push_back(Node());
            }
            cur = nodes[cur].next[c];
        }
        nodes[cur].end = true;
    }
    string q;
    while (cin >> q) {
        int cur = 0;
        for (char ch : q) {
            cur = nodes[cur].next[ch - 'a'];
            if (cur == -1) break;
        }
        vector<string> out;
        if (cur != -1) {
            string s = q;
            collect(cur, s, out);
        }
        if (out.empty()) cout << "-";
        for (size_t i = 0; i < out.size(); i++) cout << (i ? " " : "") << out[i];
        cout << endl;
    }
    return 0;
}`,
        solutionNotes: "A word ends before its extensions, and children are visited a → z, so the DFS produces words in alphabetical order and can stop as soon as it has three.",
      },
    ),
    explainAgain: `A trie is like a dictionary's thumb tabs taken to the extreme: first a tab for each first letter, inside that a tab for each second letter, and so on. Every word that starts with "ca" is behind the same two tabs, so finding them is as quick as the prefix is long.`,
    summary: [
      "A trie stores words as paths of letters; nodes mark where words end.",
      "Insert, search and prefix checks cost O(length), independent of the number of words.",
      "Counters on nodes give prefix counts; a DFS a→z lists completions alphabetically.",
    ],
  },

  {
    id: "topological-sort",
    moduleId: "data-structures",
    after: "graphs-bfs-dfs",
    title: "Topological sort",
    minutes: 20,
    concepts: ["directed acyclic graph", "in-degree", "Kahn's algorithm", "cycle detection"],
    goals: [
      "Order tasks so every prerequisite comes first",
      "Implement Kahn's algorithm with in-degrees and a queue",
      "Detect when no valid order exists (a cycle)",
    ],
    intro: `Courses have prerequisites; build steps depend on each other; you put on socks before shoes. A **topological order** lists every task after all the tasks it depends on. It exists exactly when the dependency graph has no cycle.`,
    sections: [
      {
        title: "Kahn's algorithm",
        body: `1. Count each node's **in-degree** (how many prerequisites it has).
2. Put every node with in-degree 0 in a queue — they can be done now.
3. Repeatedly take a node, output it, and decrement the in-degree of everything that depends on it; any that reach 0 join the queue.

O(V + E).`,
      },
      {
        title: "Detecting cycles",
        body: `If the output has fewer than V nodes, the rest are stuck waiting on each other: there's a cycle and no valid order.`,
      },
      {
        title: "Which order?",
        body: `Many valid orders usually exist. To get a specific one — say, the smallest-numbered available task first — use a \`priority_queue\` (min-heap) instead of a queue. That costs O((V + E) log V).`,
      },
    ],
    mistakes: [
      { title: "Edge direction", body: "For \"a must come before b\", the edge is a → b, and it raises b's in-degree." },
      { title: "Not checking for cycles", body: "Always compare the output size with V." },
      { title: "Expecting one unique answer", body: "Tests that need a specific order specify a tie-break rule; follow it." },
    ],
    example: {
      title: "Getting dressed",
      intro: "Kahn's algorithm on six tasks; ties broken by smallest index.",
      code: r`#include <iostream>
#include <queue>
#include <string>
#include <vector>
#include <functional>
using namespace std;

int main() {
    vector<string> name = {"socks", "shoes", "pants", "belt", "shirt", "tie"};
    vector<pair<int, int>> before = {{0, 1}, {2, 1}, {2, 3}, {4, 3}, {4, 5}};
    int n = name.size();
    vector<vector<int>> adj(n);
    vector<int> indeg(n, 0);
    for (auto [a, b] : before) { adj[a].push_back(b); indeg[b]++; }
    priority_queue<int, vector<int>, greater<int>> ready;
    for (int v = 0; v < n; v++) if (indeg[v] == 0) ready.push(v);
    while (!ready.empty()) {
        int v = ready.top();
        ready.pop();
        cout << name[v] << " ";
        for (int w : adj[v]) if (--indeg[w] == 0) ready.push(w);
    }
    cout << endl;
    return 0;
}`,
      output: "socks pants shoes shirt belt tie \n",
      notes: [
        { line: 10, text: "Each pair (a, b) means a must happen before b." },
        { line: 14, text: "An edge a → b adds one prerequisite to b." },
        { line: 15, text: "A min-heap always picks the smallest ready task." },
        { line: 21, text: "When a task's last prerequisite is done, it becomes ready." },
      ],
    },
    quickCheck: {
      prompt: "Kahn's algorithm outputs 4 of a graph's 6 nodes and then the queue is empty. What does that mean?",
      options: [
        { id: "a", text: "The remaining 2 nodes are in (or behind) a cycle", feedback: "Yes — their in-degrees never reach 0." },
        { id: "b", text: "The graph is disconnected", feedback: "Disconnected parts are fine: their sources start with in-degree 0." },
        { id: "c", text: "Two nodes have no edges", feedback: "Nodes with no edges have in-degree 0 and are output immediately." },
      ],
      correct: "a",
      explanation: "Kahn's algorithm processes every node exactly when the graph is acyclic.",
    },
    exercise: {
      title: "Course schedule",
      prompt: `Read \`n\` courses (1…n) and \`m\` lines \`a b\` meaning course a must be taken before b. Print a valid order that always takes the **smallest-numbered** available course next, or \`impossible\` if there's a cycle.`,
      starterCode: r`#include <iostream>
#include <queue>
#include <vector>
#include <functional>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;
    // build adjacency lists and in-degrees, then run Kahn's algorithm with a min-heap

    return 0;
}`,
      tests: [
        { label: "sample", input: "4 3\n1 2\n1 3\n3 2\n", output: "1 3 2 4", visibility: "sample", category: "normal" },
        { label: "cycle", input: "3 3\n1 2\n2 3\n3 1\n", output: "impossible", visibility: "hidden", category: "edge" },
        { label: "no edges", input: "3 0\n", output: "1 2 3", visibility: "hidden", category: "boundary" },
        { label: "reverse chain", input: "3 2\n3 2\n2 1\n", output: "3 2 1", visibility: "hidden", category: "normal" },
      ],
      compare: "tokens",
      hints: [
        "adj[a].push_back(b); indeg[b]++.",
        "Push every course with indeg 0 into a min-heap.",
        "Pop the smallest, add it to the order, decrement its neighbours.",
        "If the order has fewer than n courses, print impossible.",
      ],
      solution: r`#include <iostream>
#include <queue>
#include <vector>
#include <functional>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;
    vector<vector<int>> adj(n + 1);
    vector<int> indeg(n + 1, 0);
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        adj[a].push_back(b);
        indeg[b]++;
    }
    priority_queue<int, vector<int>, greater<int>> ready;
    for (int v = 1; v <= n; v++) if (indeg[v] == 0) ready.push(v);
    vector<int> order;
    while (!ready.empty()) {
        int v = ready.top();
        ready.pop();
        order.push_back(v);
        for (int w : adj[v]) if (--indeg[w] == 0) ready.push(w);
    }
    if ((int)order.size() < n) {
        cout << "impossible" << endl;
        return 0;
    }
    for (int i = 0; i < n; i++) cout << order[i] << (i + 1 < n ? " " : "\n");
    return 0;
}`,
      solutionNotes: "The min-heap makes the order unique and testable. Course 4 has no prerequisites, but it waits behind smaller ready numbers.",
    },
    practice: practice(
      {
        title: "Can it be built?",
        prompt: `Read \`n\` modules (1…n) and \`m\` dependencies \`a b\` (a must be built before b). Print \`ok\` if a build order exists; otherwise print \`cycle\` followed by how many modules can **never** be built.`,
        starterCode: starter("Run Kahn's algorithm and count the processed nodes", "int n, m;\ncin >> n >> m;", ["iostream", "queue", "vector"]),
        tests: [
          T("sample", "3 2\n1 2\n2 3\n", "ok", "sample"),
          T("cycle", "4 4\n1 2\n2 3\n3 2\n3 4\n", "cycle 3", "visible", "edge"),
          T("self loop", "2 1\n2 2\n", "cycle 1", "hidden", "edge"),
          T("empty", "5 0\n", "ok", "hidden", "boundary"),
        ],
        hints: [
          "Build in-degrees and adjacency lists.",
          "A plain queue is enough — order doesn't matter here.",
          "Count how many nodes leave the queue.",
          "If processed < n, the stuck count is n − processed.",
        ],
        solution: r`#include <iostream>
#include <queue>
#include <vector>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;
    vector<vector<int>> adj(n + 1);
    vector<int> indeg(n + 1, 0);
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        adj[a].push_back(b);
        indeg[b]++;
    }
    queue<int> q;
    for (int v = 1; v <= n; v++) if (indeg[v] == 0) q.push(v);
    int processed = 0;
    while (!q.empty()) {
        int v = q.front();
        q.pop();
        processed++;
        for (int w : adj[v]) if (--indeg[w] == 0) q.push(w);
    }
    if (processed == n) cout << "ok" << endl;
    else cout << "cycle " << n - processed << endl;
    return 0;
}`,
        solutionNotes: "Nodes on a cycle, and everything that depends on them, never reach in-degree 0. Module 4 in the second test is blocked by the 2–3 cycle.",
      },
      {
        title: "Minimum semesters",
        prompt: `Read \`n\` courses and \`m\` prerequisites \`a b\`. In each semester you may take any number of courses whose prerequisites are all done. Print the minimum number of semesters, or \`impossible\`. Process Kahn's algorithm **level by level**.`,
        starterCode: starter("BFS by levels: each round takes every currently-ready course", "int n, m;\ncin >> n >> m;", ["iostream", "queue", "vector"]),
        tests: [
          T("sample", "4 3\n1 2\n1 3\n3 4\n", "3", "sample"),
          T("parallel", "3 0\n", "1", "visible", "boundary"),
          T("cycle", "2 2\n1 2\n2 1\n", "impossible", "hidden", "edge"),
          T("diamond", "4 4\n1 2\n1 3\n2 4\n3 4\n", "3", "hidden"),
        ],
        hints: [
          "Start with all in-degree-0 courses: that's semester 1.",
          "Process the whole current queue (its size at the start of the round) as one semester.",
          "Courses that become ready go into the next round.",
          "Count rounds; check that every course was taken.",
        ],
        solution: r`#include <iostream>
#include <queue>
#include <vector>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;
    vector<vector<int>> adj(n + 1);
    vector<int> indeg(n + 1, 0);
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        adj[a].push_back(b);
        indeg[b]++;
    }
    queue<int> q;
    for (int v = 1; v <= n; v++) if (indeg[v] == 0) q.push(v);
    int semesters = 0, taken = 0;
    while (!q.empty()) {
        semesters++;
        int k = q.size();
        for (int i = 0; i < k; i++) {
            int v = q.front();
            q.pop();
            taken++;
            for (int w : adj[v]) if (--indeg[w] == 0) q.push(w);
        }
    }
    if (taken < n) cout << "impossible" << endl;
    else cout << semesters << endl;
    return 0;
}`,
        solutionNotes: "Each round is one semester. The number of rounds equals the length of the longest prerequisite chain.",
      },
    ),
    explainAgain: `Imagine sticky notes for tasks, with arrows for "must happen first". Pick up any note with no arrows pointing at it, do that task, and peel off its arrows. Repeat. If you get stuck with notes left but every one still has an arrow pointing at it, those tasks are waiting on each other in a circle.`,
    summary: [
      "A topological order puts every task after its prerequisites; it exists only for acyclic graphs.",
      "Kahn's algorithm: in-degrees + a queue of ready nodes, O(V + E).",
      "Fewer than V nodes output means a cycle; a min-heap gives the smallest-first order.",
    ],
  },

  {
    id: "disjoint-set-union",
    moduleId: "data-structures",
    after: "topological-sort",
    title: "Disjoint-set union",
    minutes: 20,
    concepts: ["union-find", "path compression", "union by size", "connected components"],
    goals: [
      "Track groups that merge over time with union-find",
      "Speed it up with path compression and union by size",
      "Use it for connectivity questions and Kruskal's minimum spanning tree",
    ],
    intro: `"Are these two people in the same friend group?" — when groups only ever **merge**, there's a structure that answers in almost O(1): the disjoint-set union (DSU), also called union-find.`,
    sections: [
      {
        title: "Each group is a tree with a root",
        body: `\`parent[v]\` points towards the group's representative (root). Two elements are in the same group if they have the same root.

\`\`\`cpp
int find(int v) {
    if (parent[v] == v) return v;
    return parent[v] = find(parent[v]);   // path compression
}
bool unite(int a, int b) {
    a = find(a); b = find(b);
    if (a == b) return false;              // already together
    if (sz[a] < sz[b]) swap(a, b);
    parent[b] = a;                         // attach the smaller tree
    sz[a] += sz[b];
    return true;
}
\`\`\``,
      },
      {
        title: "Why it's fast",
        body: `Path compression makes every node on a find path point straight at the root. Union by size keeps trees shallow. Together, each operation costs O(α(n)) — the inverse Ackermann function, which is at most 4 for any n you will ever meet.`,
      },
      {
        title: "Kruskal's minimum spanning tree",
        body: `To connect all cities with the cheapest set of roads: sort roads by cost, and add each road if it joins two *different* groups (\`unite\` returns true). Skipping roads inside a group avoids cycles.`,
      },
    ],
    mistakes: [
      { title: "Comparing parents instead of roots", body: "parent[a] == parent[b] isn't enough; compare find(a) with find(b)." },
      { title: "Uniting non-roots", body: "Always attach root to root, or trees get corrupted." },
      { title: "Expecting splits", body: "DSU can merge groups but not split them. For removals, process the operations backwards or use another approach." },
    ],
    example: {
      title: "Friend groups",
      intro: "Merging groups and asking about them.",
      code: r`#include <iostream>
#include <vector>
#include <numeric>
#include <utility>
using namespace std;

vector<int> parent, sz;

int find(int v) { return parent[v] == v ? v : parent[v] = find(parent[v]); }

bool unite(int a, int b) {
    a = find(a); b = find(b);
    if (a == b) return false;
    if (sz[a] < sz[b]) swap(a, b);
    parent[b] = a;
    sz[a] += sz[b];
    return true;
}

int main() {
    int n = 6;
    parent.resize(n);
    iota(parent.begin(), parent.end(), 0);
    sz.assign(n, 1);
    unite(0, 1); unite(2, 3); unite(1, 3);
    cout << (find(0) == find(2) ? "same" : "different") << endl;
    cout << (find(0) == find(4) ? "same" : "different") << endl;
    cout << "group of 3 has " << sz[find(3)] << " people" << endl;
    cout << "unite again: " << unite(0, 2) << endl;
    return 0;
}`,
      output: "same\ndifferent\ngroup of 3 has 4 people\nunite again: 0\n",
      notes: [
        { line: 9, text: "find with path compression in one line." },
        { line: 12, text: "Already in one group: nothing to do." },
        { line: 23, text: "iota fills parent with 0, 1, 2, …: everyone starts alone." },
        { line: 25, text: "0–1 and 2–3, then 1–3 joins the two pairs." },
      ],
    },
    quickCheck: {
      prompt: "After unite(1, 2), unite(3, 4) and unite(2, 4) on five elements, how many groups are there?",
      options: [
        { id: "a", text: "2: {1, 2, 3, 4} and {5}", feedback: "Yes — 2–4 merges the two pairs." },
        { id: "b", text: "3", feedback: "unite(2, 4) joins {1, 2} and {3, 4}." },
        { id: "c", text: "1", feedback: "Element 5 was never united with anything." },
      ],
      correct: "a",
      explanation: "Each successful unite reduces the number of groups by one: 5 − 3 = 2.",
    },
    exercise: {
      title: "Network connections",
      prompt: `Read \`n\` computers (1…n), then commands: \`link A B\`, \`ask A B\` (\`yes\` if connected, else \`no\`), \`groups\` (number of separate networks), \`size A\` (computers in A's network). Use a DSU with path compression and union by size.`,
      starterCode: r`#include <iostream>
#include <string>
#include <vector>
#include <numeric>
#include <utility>
using namespace std;

vector<int> parent, sz;

// Write find and unite here

int main() {
    int n;
    cin >> n;
    // initialise the DSU, then process commands

    return 0;
}`,
      tests: [
        { label: "sample", input: "5\nlink 1 2\nlink 3 4\nask 1 3\nlink 2 4\nask 1 3\ngroups\nsize 4\n", output: "no\nyes\n2\n4", visibility: "sample", category: "normal" },
        { label: "redundant link", input: "3\nlink 1 2\nlink 2 1\ngroups\nsize 3\n", output: "2\n1", visibility: "hidden", category: "edge" },
        { label: "self", input: "2\nask 2 2\ngroups\n", output: "yes\n2", visibility: "hidden", category: "edge" },
      ],
      compare: "lines",
      hints: [
        "parent.resize(n + 1); iota(...); sz.assign(n + 1, 1).",
        "Keep a groups counter starting at n; subtract 1 whenever unite succeeds.",
        "ask: find(a) == find(b).",
        "size: sz[find(a)].",
      ],
      solution: r`#include <iostream>
#include <string>
#include <vector>
#include <numeric>
#include <utility>
using namespace std;

vector<int> parent, sz;

int find(int v) { return parent[v] == v ? v : parent[v] = find(parent[v]); }

bool unite(int a, int b) {
    a = find(a);
    b = find(b);
    if (a == b) return false;
    if (sz[a] < sz[b]) swap(a, b);
    parent[b] = a;
    sz[a] += sz[b];
    return true;
}

int main() {
    int n;
    cin >> n;
    parent.resize(n + 1);
    iota(parent.begin(), parent.end(), 0);
    sz.assign(n + 1, 1);
    int groups = n;
    string cmd;
    while (cin >> cmd) {
        if (cmd == "link") {
            int a, b;
            cin >> a >> b;
            if (unite(a, b)) groups--;
        } else if (cmd == "ask") {
            int a, b;
            cin >> a >> b;
            cout << (find(a) == find(b) ? "yes" : "no") << endl;
        } else if (cmd == "groups") {
            cout << groups << endl;
        } else if (cmd == "size") {
            int a;
            cin >> a;
            cout << sz[find(a)] << endl;
        }
    }
    return 0;
}`,
      solutionNotes: "Sizes are only correct at roots, so size asks find first. Every operation is effectively constant time.",
    },
    practice: practice(
      {
        title: "Redundant cable",
        prompt: `Cables are added one at a time between \`n\` computers. Read n and \`m\` cables \`a b\`. Print the 1-based index of the **first** cable that connects two computers already connected (it creates a loop), or \`none\`.`,
        starterCode: starter("unite returns false exactly when a cable is redundant", "int n, m;\ncin >> n >> m;", ["iostream", "vector", "numeric", "utility"], "// Write the DSU here"),
        tests: [
          T("sample", "4 4\n1 2\n2 3\n3 1\n3 4\n", "3", "sample"),
          T("tree", "3 2\n1 2\n2 3\n", "none", "visible", "edge"),
          T("duplicate cable", "2 2\n1 2\n2 1\n", "2", "hidden", "edge"),
          T("later loop", "5 5\n1 2\n3 4\n4 5\n2 3\n5 1\n", "5", "hidden"),
        ],
        hints: [
          "Initialise the DSU for n computers.",
          "For cable i: if unite(a, b) is false, print i and stop.",
          "Keep reading? No need — stop at the first one.",
          "If every unite succeeds, print none.",
        ],
        solution: r`#include <iostream>
#include <vector>
#include <numeric>
#include <utility>
using namespace std;

vector<int> parent, sz;

int find(int v) { return parent[v] == v ? v : parent[v] = find(parent[v]); }

bool unite(int a, int b) {
    a = find(a);
    b = find(b);
    if (a == b) return false;
    if (sz[a] < sz[b]) swap(a, b);
    parent[b] = a;
    sz[a] += sz[b];
    return true;
}

int main() {
    int n, m;
    cin >> n >> m;
    parent.resize(n + 1);
    iota(parent.begin(), parent.end(), 0);
    sz.assign(n + 1, 1);
    for (int i = 1; i <= m; i++) {
        int a, b;
        cin >> a >> b;
        if (!unite(a, b)) {
            cout << i << endl;
            return 0;
        }
    }
    cout << "none" << endl;
    return 0;
}`,
        solutionNotes: "A cable between two computers that already share a root closes a loop. DSU detects cycles in undirected graphs as edges arrive.",
      },
      {
        title: "Cheapest road network (Kruskal)",
        prompt: `Read \`n\` cities and \`m\` possible roads \`a b cost\`. Print the minimum total cost to connect all cities, and the number of roads used, as \`COST ROADS\` — or \`impossible\` if they can't all be connected. Use Kruskal's algorithm.`,
        starterCode: starter("Sort roads by cost; take each road that unites two different groups", "int n, m;\ncin >> n >> m;", ["iostream", "vector", "numeric", "algorithm", "tuple", "utility"], "// Write the DSU here"),
        tests: [
          T("sample", "4 5\n1 2 1\n2 3 4\n1 3 3\n3 4 2\n2 4 5\n", "6 3", "sample"),
          T("disconnected", "3 1\n1 2 5\n", "impossible", "visible", "edge"),
          T("single city", "1 0\n", "0 0", "hidden", "boundary"),
          T("parallel roads", "2 3\n1 2 9\n1 2 4\n2 1 7\n", "4 1", "hidden", "edge"),
        ],
        hints: [
          "Store roads as tuple<cost, a, b> and sort them.",
          "For each road in order, if unite(a, b) succeeds, add its cost and count it.",
          "A spanning tree on n cities has exactly n − 1 roads.",
          "If fewer than n − 1 roads were used, print impossible. Use long long for the total.",
        ],
        solution: r`#include <iostream>
#include <vector>
#include <numeric>
#include <algorithm>
#include <tuple>
#include <utility>
using namespace std;

vector<int> parent, sz;

int find(int v) { return parent[v] == v ? v : parent[v] = find(parent[v]); }

bool unite(int a, int b) {
    a = find(a);
    b = find(b);
    if (a == b) return false;
    if (sz[a] < sz[b]) swap(a, b);
    parent[b] = a;
    sz[a] += sz[b];
    return true;
}

int main() {
    int n, m;
    cin >> n >> m;
    vector<tuple<long long, int, int>> roads(m);
    for (auto& [c, a, b] : roads) cin >> a >> b >> c;
    sort(roads.begin(), roads.end());
    parent.resize(n + 1);
    iota(parent.begin(), parent.end(), 0);
    sz.assign(n + 1, 1);
    long long total = 0;
    int used = 0;
    for (const auto& [c, a, b] : roads) {
        if (unite(a, b)) {
            total += c;
            used++;
        }
    }
    if (used != n - 1) cout << "impossible" << endl;
    else cout << total << " " << used << endl;
    return 0;
}`,
        solutionNotes: "Greedy works here: the cheapest road between two separate groups is always safe to take. DSU makes the \"separate groups?\" check almost free, so sorting dominates: O(m log m).",
      },
    ),
    explainAgain: `Every group elects a leader. To check whether two people are in the same group, ask each "who's your leader?" (following the chain up). To merge groups, the smaller group's leader agrees to follow the bigger group's leader. Path compression is everyone writing down the top leader's name directly, so next time the answer is instant.`,
    summary: [
      "DSU tracks merging groups: find(v) gives the root, unite(a, b) merges.",
      "Path compression + union by size → effectively O(1) per operation.",
      "Used for connectivity, cycle detection and Kruskal's minimum spanning tree.",
    ],
  },

  {
    id: "dijkstra",
    moduleId: "data-structures",
    after: "disjoint-set-union",
    title: "Shortest paths: Dijkstra",
    minutes: 25,
    concepts: ["weighted graph", "Dijkstra's algorithm", "priority queue", "path reconstruction"],
    goals: [
      "Find shortest distances in graphs with non-negative edge weights",
      "Implement Dijkstra with a min-priority queue and lazy deletion",
      "Rebuild the actual path using parent pointers",
    ],
    intro: `BFS finds shortest paths when every edge costs the same. Real maps have roads of different lengths. **Dijkstra's algorithm** handles any non-negative weights by always expanding the closest unfinished node next.`,
    sections: [
      {
        title: "The algorithm",
        body: `1. \`dist[source] = 0\`, every other distance = ∞.
2. Push (0, source) into a min-priority queue.
3. Pop the smallest (d, v). If d > dist[v], it's an outdated entry — skip it.
4. For each edge v → w with weight c: if \`dist[v] + c < dist[w]\`, update dist[w] and push (dist[w], w).

\`\`\`cpp
priority_queue<pair<ll, int>, vector<pair<ll, int>>, greater<>> pq;
\`\`\`

Complexity O((V + E) log V).`,
      },
      {
        title: "Why non-negative?",
        body: `When the closest node is popped, no other route can be shorter — every other route goes through nodes that are already at least as far, and adding non-negative edges can't make it shorter. A **negative** edge breaks this; use Bellman–Ford for those graphs.`,
      },
      {
        title: "Recovering the path",
        body: `Whenever dist[w] improves via v, set \`par[w] = v\`. Afterwards, follow par from the target back to the source and reverse the list.`,
      },
    ],
    mistakes: [
      { title: "Forgetting the stale-entry check", body: "Without `if (d > dist[v]) continue;`, outdated queue entries redo work (still correct, but slower)." },
      { title: "Using int for distances", body: "Sums of many large weights overflow int. Use long long and a big INF like 1e18." },
      { title: "Max-heap by default", body: "priority_queue is a max-heap; use greater<> to pop the smallest distance." },
    ],
    example: {
      title: "Distances from city 1",
      intro: "Dijkstra on a small road map; the longer-looking route wins.",
      code: r`#include <iostream>
#include <queue>
#include <vector>
#include <functional>
#include <utility>
using namespace std;

int main() {
    int n = 4;
    vector<vector<pair<int, long long>>> adj(n + 1);
    auto road = [&](int a, int b, long long c) { adj[a].push_back({b, c}); adj[b].push_back({a, c}); };
    road(1, 2, 7); road(1, 3, 2); road(3, 2, 3); road(2, 4, 1);
    const long long INF = 1e18;
    vector<long long> dist(n + 1, INF);
    priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq;
    dist[1] = 0;
    pq.push({0, 1});
    while (!pq.empty()) {
        auto [d, v] = pq.top();
        pq.pop();
        if (d > dist[v]) continue;
        for (auto [w, c] : adj[v]) {
            if (dist[v] + c < dist[w]) {
                dist[w] = dist[v] + c;
                pq.push({dist[w], w});
            }
        }
    }
    for (int v = 1; v <= n; v++) cout << v << ":" << dist[v] << " ";
    cout << endl;
    return 0;
}`,
      output: "1:0 2:5 3:2 4:6 \n",
      notes: [
        { line: 12, text: "The direct road 1–2 costs 7; going 1–3–2 costs 5." },
        { line: 15, text: "greater<> turns the priority queue into a min-heap." },
        { line: 21, text: "Skip outdated entries." },
        { line: 23, text: "Relax: a shorter way to w was found." },
      ],
    },
    quickCheck: {
      prompt: "Why can't plain BFS find the shortest route on this map?",
      options: [
        { id: "a", text: "BFS minimises the number of roads, not their total length", feedback: "Right — 1–2 is one road but longer than the two-road route 1–3–2." },
        { id: "b", text: "BFS can't handle undirected graphs", feedback: "It can; the problem is weights." },
        { id: "c", text: "BFS is too slow", feedback: "BFS is faster; it just answers a different question." },
      ],
      correct: "a",
      explanation: "With unequal weights, fewest edges ≠ shortest distance.",
    },
    exercise: {
      title: "Shortest distances",
      prompt: `Read \`n\` nodes, \`m\` **directed** edges \`a b w\` (0 ≤ w ≤ 10⁹) and a source \`s\`. Print the shortest distance from s to every node 1…n, space-separated, using \`-1\` for unreachable nodes.`,
      starterCode: r`#include <iostream>
#include <queue>
#include <vector>
#include <functional>
#include <utility>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;
    // read edges, then the source, then run Dijkstra

    return 0;
}`,
      tests: [
        { label: "sample", input: "4 5\n1 2 7\n1 3 2\n3 2 3\n2 4 1\n4 1 1\n1\n", output: "0 5 2 6", visibility: "sample", category: "normal" },
        { label: "unreachable", input: "3 1\n2 3 5\n1\n", output: "0 -1 -1", visibility: "hidden", category: "edge" },
        { label: "big weights", input: "3 2\n1 2 1000000000\n2 3 1000000000\n1\n", output: "0 1000000000 2000000000", visibility: "hidden", category: "edge" },
        { label: "other source", input: "3 3\n1 2 1\n2 3 1\n3 1 1\n3\n", output: "1 2 0", visibility: "hidden", category: "normal" },
      ],
      compare: "tokens",
      hints: [
        "adj[a].push_back({b, w}) — directed, so only one direction.",
        "dist as long long, initialised to a large INF.",
        "Min-heap of (distance, node); skip entries where d > dist[v].",
        "Print −1 where dist is still INF.",
      ],
      solution: r`#include <iostream>
#include <queue>
#include <vector>
#include <functional>
#include <utility>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;
    vector<vector<pair<int, long long>>> adj(n + 1);
    for (int i = 0; i < m; i++) {
        int a, b;
        long long w;
        cin >> a >> b >> w;
        adj[a].push_back({b, w});
    }
    int s;
    cin >> s;
    const long long INF = 4e18;
    vector<long long> dist(n + 1, INF);
    priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq;
    dist[s] = 0;
    pq.push({0, s});
    while (!pq.empty()) {
        auto [d, v] = pq.top();
        pq.pop();
        if (d > dist[v]) continue;
        for (auto [w, c] : adj[v]) {
            if (d + c < dist[w]) {
                dist[w] = d + c;
                pq.push({dist[w], w});
            }
        }
    }
    for (int v = 1; v <= n; v++) cout << (dist[v] == INF ? -1 : dist[v]) << (v < n ? " " : "\n");
    return 0;
}`,
      solutionNotes: "Distances can reach about 10⁵ × 10⁹, so they need long long. Unreached nodes keep INF and print as −1.",
    },
    practice: practice(
      {
        title: "Show the route",
        prompt: `Read \`n\`, \`m\` **undirected** roads \`a b w\`, then \`s t\`. Print the shortest distance from s to t and the route as \`s -> … -> t\` on the next line, or \`unreachable\`. If several routes tie, any is accepted only if it's the one your Dijkstra finds by updating on strict improvement — the tests avoid ties.`,
        starterCode: starter("Dijkstra with a parent array, then walk back from t", "int n, m;\ncin >> n >> m;", ["iostream", "queue", "vector", "functional", "utility", "algorithm"]),
        tests: [
          T("sample", "4 4\n1 2 7\n1 3 2\n3 2 3\n2 4 1\n1 4\n", "6\n1 -> 3 -> 2 -> 4", "sample"),
          T("same node", "2 1\n1 2 5\n2 2\n", "0\n2", "visible", "boundary"),
          T("unreachable", "3 1\n1 2 1\n1 3\n", "unreachable", "hidden", "edge"),
          T("longer chain", "5 5\n1 2 2\n2 3 2\n3 5 2\n1 4 3\n4 5 4\n5 1\n", "6\n5 -> 3 -> 2 -> 1", "hidden"),
        ],
        compare: "lines",
        hints: [
          "Add each road in both directions.",
          "When dist[w] improves via v, set par[w] = v.",
          "From t, follow par until reaching s; push each node into a vector.",
          "Reverse the vector and print it joined with \" -> \".",
        ],
        solution: r`#include <iostream>
#include <queue>
#include <vector>
#include <functional>
#include <utility>
#include <algorithm>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;
    vector<vector<pair<int, long long>>> adj(n + 1);
    for (int i = 0; i < m; i++) {
        int a, b;
        long long w;
        cin >> a >> b >> w;
        adj[a].push_back({b, w});
        adj[b].push_back({a, w});
    }
    int s, t;
    cin >> s >> t;
    const long long INF = 4e18;
    vector<long long> dist(n + 1, INF);
    vector<int> par(n + 1, -1);
    priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq;
    dist[s] = 0;
    pq.push({0, s});
    while (!pq.empty()) {
        auto [d, v] = pq.top();
        pq.pop();
        if (d > dist[v]) continue;
        for (auto [w, c] : adj[v]) {
            if (d + c < dist[w]) {
                dist[w] = d + c;
                par[w] = v;
                pq.push({dist[w], w});
            }
        }
    }
    if (dist[t] == INF) {
        cout << "unreachable" << endl;
        return 0;
    }
    vector<int> path;
    for (int v = t; v != -1; v = par[v]) path.push_back(v);
    reverse(path.begin(), path.end());
    cout << dist[t] << endl;
    for (size_t i = 0; i < path.size(); i++) cout << (i ? " -> " : "") << path[i];
    cout << endl;
    return 0;
}`,
        solutionNotes: "par[s] stays −1, which ends the walk back. Each node remembers only its predecessor, yet together they spell out the whole route.",
      },
      {
        title: "Cheapest walk across a grid",
        prompt: `Read \`R C\` and a grid of digits (each cell's cost to **enter**, 0–9). Starting at the top-left (its cost counts) and moving up/down/left/right, print the minimum total cost to reach the bottom-right. Run Dijkstra on the cells.`,
        starterCode: starter("Dijkstra where nodes are cells and the edge weight is the target cell's digit", "int R, C;\ncin >> R >> C;\nvector<string> g(R);\nfor (auto& row : g) cin >> row;", ["iostream", "queue", "vector", "string", "functional", "tuple"]),
        tests: [
          T("sample", "3 3\n131\n151\n111\n", "5", "sample"),
          T("single cell", "1 1\n7\n", "7", "visible", "boundary"),
          T("detour", "3 4\n1999\n1111\n9991\n", "6", "hidden"),
          T("zeros", "2 2\n00\n00\n", "0", "hidden", "edge"),
        ],
        hints: [
          "dist[r][c] starts at INF; dist[0][0] = g[0][0] − '0'.",
          "The heap holds tuple<cost, r, c>.",
          "Neighbours: four directions, staying inside the grid.",
          "New cost = d + (g[nr][nc] − '0').",
        ],
        solution: r`#include <iostream>
#include <queue>
#include <vector>
#include <string>
#include <functional>
#include <tuple>
using namespace std;

int main() {
    int R, C;
    cin >> R >> C;
    vector<string> g(R);
    for (auto& row : g) cin >> row;
    const long long INF = 4e18;
    vector<vector<long long>> dist(R, vector<long long>(C, INF));
    priority_queue<tuple<long long, int, int>, vector<tuple<long long, int, int>>, greater<>> pq;
    dist[0][0] = g[0][0] - '0';
    pq.push({dist[0][0], 0, 0});
    int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
    while (!pq.empty()) {
        auto [d, r, c] = pq.top();
        pq.pop();
        if (d > dist[r][c]) continue;
        for (int k = 0; k < 4; k++) {
            int nr = r + dr[k], nc = c + dc[k];
            if (nr < 0 || nr >= R || nc < 0 || nc >= C) continue;
            long long nd = d + (g[nr][nc] - '0');
            if (nd < dist[nr][nc]) {
                dist[nr][nc] = nd;
                pq.push({nd, nr, nc});
            }
        }
    }
    cout << dist[R - 1][C - 1] << endl;
    return 0;
}`,
        solutionNotes: "A grid is a graph in disguise: cells are nodes, moves are edges, and the cost of entering a cell is the edge weight.",
      },
    ),
    explainAgain: `Picture water spreading from the starting city along roads, travelling at constant speed. The water reaches each city first along the shortest route. Dijkstra simulates that: the priority queue always tells you which city the water reaches next.`,
    summary: [
      "Dijkstra finds shortest paths with non-negative weights in O((V + E) log V).",
      "Use a min-heap of (distance, node) and skip stale entries.",
      "A parent array rebuilds the route; negative edges need Bellman–Ford.",
    ],
  },
];
