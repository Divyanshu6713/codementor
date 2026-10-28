import type { CourseLesson } from "./types";

const r = String.raw;

/** Module 11 — The Standard Template Library: containers, iterators and algorithms. */
export const STL_LESSONS: CourseLesson[] = [
  {
    id: "vector-algorithms",
    moduleId: "stl",
    title: "vector, iterators and algorithms",
    minutes: 25,
    concepts: ["vector", "iterator", "begin/end", "sort", "find", "count", "accumulate", "unique"],
    goals: [
      "Using `vector` beyond `push_back`: `size`, `back`, `pop_back`, `insert`, `erase`",
      "What iterators are and why algorithms take `begin()` and `end()`",
      "Ready-made algorithms: `sort`, `reverse`, `find`, `count`, `accumulate`, `min_element`, `unique`",
    ],
    intro: `The **STL** (Standard Template Library) gives you tested containers and dozens of algorithms that work on them. Instead of writing a sort or a search by hand every time, you call one — and spend your effort on the actual problem.`,
    sections: [
      {
        title: "Iterators: pointers for containers",
        body: `\`v.begin()\` is an **iterator** to the first element and \`v.end()\` is one **past** the last — exactly the half-open \`[begin, end)\` range from the pointers module. \`*it\` reads an element and \`++it\` moves on.

Algorithms take a range, so the same \`sort\` works on a whole vector, on part of it, or on a plain array:

\`\`\`cpp
sort(v.begin(), v.end());            // whole vector
sort(v.begin(), v.begin() + 3);      // first three only
\`\`\``,
      },
      {
        title: "A toolbox of algorithms",
        body: `\`\`\`cpp
#include <algorithm>   // sort, reverse, find, count, min_element, max_element, unique
#include <numeric>     // accumulate

sort(v.begin(), v.end());                       // ascending
sort(v.begin(), v.end(), greater<int>());       // descending
reverse(v.begin(), v.end());
auto it = find(v.begin(), v.end(), 7);          // iterator to first 7, or v.end()
int sevens = count(v.begin(), v.end(), 7);
long long total = accumulate(v.begin(), v.end(), 0LL);
int smallest = *min_element(v.begin(), v.end());
\`\`\`

\`find\` returns \`v.end()\` when nothing is found — always compare before dereferencing.`,
      },
      {
        title: "Removing duplicates: sort + unique + erase",
        body: `\`unique\` doesn't delete anything: it moves the first of each run of **equal neighbours** to the front and returns an iterator to the new logical end. Sort first so duplicates become neighbours, then erase the leftovers:

\`\`\`cpp
sort(v.begin(), v.end());
v.erase(unique(v.begin(), v.end()), v.end());
\`\`\``,
      },
    ],
    mistakes: [
      { title: "Dereferencing end()", body: "`*find(...)` when the value isn't there dereferences `end()` — undefined behaviour. Check `it != v.end()` first." },
      { title: "unique without sort", body: "`unique` only removes *adjacent* duplicates. `{1, 2, 1}` stays `{1, 2, 1}` unless you sort first." },
      { title: "accumulate with 0 for big sums", body: "`accumulate(…, 0)` sums in `int` because `0` is an int, which can overflow. Use `0LL` for a `long long` total." },
    ],
    example: {
      title: "Exam scores with the STL",
      intro: "Sort, sum, find extremes and look up a value without writing a single loop by hand.",
      code: r`#include <algorithm>
#include <iostream>
#include <numeric>
#include <vector>
using namespace std;

int main() {
    vector<int> scores = {72, 95, 60, 88, 95, 41};
    sort(scores.begin(), scores.end());
    for (int s : scores) {
        cout << s << " ";
    }
    cout << endl;
    cout << "total " << accumulate(scores.begin(), scores.end(), 0) << endl;
    cout << "lowest " << *min_element(scores.begin(), scores.end()) << endl;
    cout << "95 appears " << count(scores.begin(), scores.end(), 95) << " times" << endl;
    auto it = find(scores.begin(), scores.end(), 88);
    if (it != scores.end()) {
        cout << "88 is at index " << (it - scores.begin()) << endl;
    }
    scores.pop_back();
    cout << "after pop_back the last is " << scores.back() << endl;
    return 0;
}`,
      output: "41 60 72 88 95 95 \ntotal 451\nlowest 41\n95 appears 2 times\n88 is at index 3\nafter pop_back the last is 95\n",
      notes: [
        { line: 9, text: "One call sorts the whole range `[begin, end)`." },
        { line: 17, text: "`find` returns an iterator; `end()` would mean \"not found\"." },
        { line: 19, text: "Iterator minus `begin()` gives the index." },
        { line: 21, text: "`pop_back` removes the last element; `back` reads the new last one." },
      ],
    },
    quickCheck: {
      prompt: "After these lines, what does `v` contain?",
      code: r`vector<int> v = {3, 1, 3, 2, 1};
sort(v.begin(), v.end());
v.erase(unique(v.begin(), v.end()), v.end());`,
      options: [
        { id: "a", text: "{1, 2, 3}", feedback: "Right: sorting groups the duplicates, `unique` + `erase` keeps one of each." },
        { id: "b", text: "{3, 1, 2}", feedback: "The vector is sorted first, so the original order is gone." },
        { id: "c", text: "{1, 1, 2, 3, 3}", feedback: "That's after `sort` only — `unique` + `erase` then remove the repeats." },
      ],
      correct: "a",
      explanation: "Sort → {1,1,2,3,3}; unique moves the distinct values to the front; erase drops the rest → {1,2,3}.",
    },
    exercise: {
      title: "Distinct values",
      prompt: `Read \`n\` and then \`n\` whole numbers into a \`vector<int>\`. Print the **number of distinct values** on the first line, and the distinct values in **ascending order** on the second line.

Use STL algorithms rather than writing your own sort.`,
      starterCode: r`#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> v(n);
    for (int i = 0; i < n; i++) {
        cin >> v[i];
    }
    // Sort, remove duplicates, then print the count and the values.

    return 0;
}`,
      tests: [
        { label: "some repeats", input: "6\n4 2 4 9 2 4\n", output: "3\n2 4 9", visibility: "sample", category: "normal" },
        { label: "all same", input: "4\n7 7 7 7\n", output: "1\n7", visibility: "sample", category: "edge" },
        { label: "already distinct", input: "5\n5 4 3 2 1\n", output: "5\n1 2 3 4 5", visibility: "hidden", category: "normal" },
        { label: "negatives", input: "5\n-1 0 -1 3 0\n", output: "3\n-1 0 3", visibility: "hidden", category: "edge" },
        { label: "single", input: "1\n42\n", output: "1\n42", visibility: "hidden", category: "boundary" },
      ],
      compare: "tokens",
      hints: [
        "What has to be true about duplicates before `unique` can remove them?",
        "They must be next to each other — so sort first.",
        "`sort(v.begin(), v.end());` then `v.erase(unique(v.begin(), v.end()), v.end());` — now `v.size()` is the answer.",
        "Print `v.size()` and `endl`, then loop `for (int x : v) cout << x << \" \";`.",
      ],
      solution: r`#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> v(n);
    for (int i = 0; i < n; i++) {
        cin >> v[i];
    }
    sort(v.begin(), v.end());
    v.erase(unique(v.begin(), v.end()), v.end());
    cout << v.size() << endl;
    for (int x : v) {
        cout << x << " ";
    }
    cout << endl;
    return 0;
}`,
      solutionNotes: "Sort + unique + erase is the standard STL idiom for de-duplicating. After it, the vector itself holds the answer: its size is the count, its contents the sorted distinct values.",
    },
    explainAgain: `The STL is a well-stocked toolbox. A container (\`vector\`) is the box of parts; an iterator is your finger pointing at one part; an algorithm (\`sort\`, \`find\`) is a power tool you aim at a range "from here to there". You don't build the drill yourself — you learn which tool fits the job.`,
    summary: [
      "Algorithms work on iterator ranges `[begin, end)`, just like pointer ranges.",
      "`sort`, `find`, `count`, `accumulate`, `min_element` replace hand-written loops.",
      "Sort + `unique` + `erase` removes duplicates; check `find` against `end()`.",
    ],
  },

  {
    id: "map-set",
    moduleId: "stl",
    title: "set and map",
    minutes: 25,
    concepts: ["set", "map", "key-value", "insert", "count", "find", "unordered_map", "ordered iteration"],
    goals: [
      "Keeping unique, sorted values with `set`",
      "Looking things up by key with `map` (e.g. counting words)",
      "When `unordered_map` / `unordered_set` are a better fit",
    ],
    intro: `A vector answers "what's at position 3?". Many problems ask different questions: "have I seen this before?", "how many times did this word appear?", "what's Asha's score?". **set** and **map** answer those directly and quickly.`,
    sections: [
      {
        title: "set: unique and sorted",
        body: `\`\`\`cpp
#include <set>

set<int> seen;
seen.insert(5);
seen.insert(2);
seen.insert(5);            // already there — ignored
cout << seen.size();       // 2
if (seen.count(2)) ...     // 1 if present, 0 if not
for (int x : seen) ...     // visits 2, then 5 — always sorted
\`\`\``,
      },
      {
        title: "map: keys to values",
        body: `\`\`\`cpp
#include <map>

map<string, int> marks;
marks["asha"] = 91;
marks["ravi"] = 78;
marks["asha"] += 2;        // 93
cout << marks.size();      // 2
\`\`\`

Using \`m[key]\` on a missing key **creates** it with a default value (0 for \`int\`) — that's what makes counting so short: \`freq[word]++\`. To check without creating, use \`m.count(key)\` or \`m.find(key) != m.end()\`.

Iterating a \`map\` visits entries in **key order**; each entry has \`.first\` (key) and \`.second\` (value):

\`\`\`cpp
for (const auto& [name, mark] : marks)   // C++17 structured binding
    cout << name << " " << mark << "\\n";
\`\`\``,
      },
      {
        title: "Ordered or unordered?",
        body: `\`set\`/\`map\` keep keys sorted; each lookup or insert takes **O(log n)** time. \`unordered_set\`/\`unordered_map\` use hashing: **O(1)** on average, but iteration order is unspecified. Use the ordered versions when you need sorted output, the unordered ones when you only need fast lookups.`,
      },
    ],
    mistakes: [
      { title: "Accidental insertion with []", body: "`if (m[\"zara\"] > 0)` adds `zara` with value 0 to the map. Use `m.count(\"zara\")` to test for presence." },
      { title: "Expecting insertion order", body: "A `map` iterates in key order, not the order you inserted. `unordered_map` has no meaningful order at all." },
      { title: "Changing set elements in place", body: "Elements of a `set` are read-only (changing one could break the sorting). Erase and insert instead." },
    ],
    example: {
      title: "Attendance and marks",
      intro: "A set records who attended; a map stores marks and is printed in name order.",
      code: r`#include <iostream>
#include <map>
#include <set>
#include <string>
using namespace std;

int main() {
    set<string> present = {"ravi", "asha", "meena", "asha"};
    cout << present.size() << " students present" << endl;
    cout << "is dev present? " << (present.count("dev") ? "yes" : "no") << endl;

    map<string, int> marks;
    marks["ravi"] = 78;
    marks["asha"] = 91;
    marks["meena"] = 85;
    marks["ravi"] += 4;
    for (const auto& [name, mark] : marks) {
        cout << name << " " << mark << endl;
    }
    return 0;
}`,
      output: "3 students present\nis dev present? no\nasha 91\nmeena 85\nravi 82\n",
      notes: [
        { line: 8, text: "The duplicate \"asha\" is stored only once." },
        { line: 10, text: "`count` tests membership without changing the set." },
        { line: 16, text: "`[]` finds the existing entry and updates it." },
        { line: 17, text: "Entries come out in key (alphabetical) order." },
      ],
    },
    quickCheck: {
      prompt: "What does this print?",
      code: r`map<string, int> m;
m["a"] = 1;
if (m["b"] == 0) {
    cout << "zero ";
}
cout << m.size();`,
      options: [
        { id: "a", text: "zero 1", feedback: "Reading `m[\"b\"]` with `[]` inserts \"b\" into the map." },
        { id: "b", text: "zero 2", feedback: "Right: `m[\"b\"]` created a new entry with value 0, so the size became 2." },
        { id: "c", text: "1", feedback: "`m[\"b\"]` is 0 (a freshly created value), so \"zero\" is printed." },
      ],
      correct: "b",
      explanation: "`operator[]` inserts missing keys. Use `count` or `find` when you only want to look.",
    },
    exercise: {
      title: "Word frequency",
      prompt: `Read \`n\` and then \`n\` words (lowercase, no spaces inside a word). Print every **distinct word** with how many times it appeared, one per line as \`word count\`, in **alphabetical order**.`,
      starterCode: r`#include <iostream>
#include <map>
#include <string>
using namespace std;

int main() {
    int n;
    cin >> n;
    // Count each word in a map<string, int>, then print the entries.

    return 0;
}`,
      tests: [
        { label: "short sentence", input: "6\nthe cat and the hat the\n", output: "and 1\ncat 1\nhat 1\nthe 3", visibility: "sample", category: "normal" },
        { label: "one word", input: "1\ncode\n", output: "code 1", visibility: "hidden", category: "boundary" },
        { label: "all same", input: "4\nhi hi hi hi\n", output: "hi 4", visibility: "hidden", category: "edge" },
        { label: "alphabetical order", input: "5\nzebra apple mango apple banana\n", output: "apple 2\nbanana 1\nmango 1\nzebra 1", visibility: "hidden", category: "normal" },
      ],
      compare: "lines",
      hints: [
        "Which container gives you \"a count per word\" and keeps the words sorted?",
        "A `map<string, int>`: the word is the key, the count is the value; iteration is alphabetical.",
        "For each word read: `freq[word]++;` — a new word starts at 0 automatically.",
        "Then `for (const auto& [w, c] : freq) cout << w << \" \" << c << endl;`.",
      ],
      solution: r`#include <iostream>
#include <map>
#include <string>
using namespace std;

int main() {
    int n;
    cin >> n;
    map<string, int> freq;
    for (int i = 0; i < n; i++) {
        string word;
        cin >> word;
        freq[word]++;
    }
    for (const auto& [w, c] : freq) {
        cout << w << " " << c << endl;
    }
    return 0;
}`,
      solutionNotes: "`freq[word]++` creates a missing word with 0 and then increments it, so one line handles both new and repeated words. The map's key order gives the alphabetical output for free.",
    },
    explainAgain: `A \`set\` is a guest list at the door: each name is written once, and the list is kept alphabetical. A \`map\` is a phone book: look up a name (the key) to get a number (the value). Asking the phone book with \`[]\` for someone who isn't in it quietly adds a blank entry — use \`count\` if you're only checking.`,
    summary: [
      "`set` stores unique values in sorted order; `count` tests membership.",
      "`map` maps keys to values; `m[key]` inserts missing keys, so `freq[x]++` counts.",
      "Ordered containers are O(log n) and sorted; unordered ones are O(1) on average with no order.",
    ],
  },

  {
    id: "stack-queue",
    moduleId: "stl",
    title: "stack, queue and priority_queue",
    minutes: 25,
    concepts: ["stack", "LIFO", "queue", "FIFO", "deque", "priority_queue"],
    goals: [
      "Last-in-first-out processing with `stack`",
      "First-in-first-out processing with `queue` (and `deque` for both ends)",
      "Always taking the largest (or smallest) item with `priority_queue`",
    ],
    intro: `Some problems care about **order of arrival**. Undo history needs the most recent action first; a ticket counter serves whoever came first; an emergency room treats the most urgent case first. The STL has a container adaptor for each.`,
    sections: [
      {
        title: "stack: last in, first out",
        body: `\`\`\`cpp
#include <stack>

stack<int> s;
s.push(1); s.push(2); s.push(3);
cout << s.top();     // 3 — the most recent
s.pop();             // removes 3 (returns nothing)
cout << s.size();    // 2
\`\`\`

Stacks match nested structure: brackets, undo, function calls (the call stack from Recursion).`,
      },
      {
        title: "queue and deque: first in, first out",
        visual: "stack-queue",
        body: `\`\`\`cpp
#include <queue>

queue<string> line;
line.push("asha"); line.push("ravi");
cout << line.front();   // asha — the earliest
line.pop();
\`\`\`

\`deque\` (double-ended queue) allows \`push_front\`/\`push_back\` and \`pop_front\`/\`pop_back\`, plus indexing. Queues are the heart of breadth-first search (Data structures).`,
      },
      {
        title: "priority_queue: always the best next",
        body: `\`\`\`cpp
priority_queue<int> pq;                               // largest on top
pq.push(4); pq.push(9); pq.push(1);
cout << pq.top();                                     // 9

priority_queue<int, vector<int>, greater<int>> minq;  // smallest on top
\`\`\`

Each push/pop is O(log n), and \`top\` is O(1). It's a **heap** under the hood.`,
      },
    ],
    mistakes: [
      { title: "top() or front() on an empty container", body: "Calling `top()` on an empty stack is undefined behaviour. Check `!s.empty()` first." },
      { title: "Expecting pop() to return the value", body: "`pop()` returns nothing. Read `top()`/`front()` first, then `pop()`." },
      { title: "Wrong end of a priority_queue", body: "`priority_queue<int>` keeps the *largest* on top. For the smallest, use `greater<int>` as the comparator." },
    ],
    example: {
      title: "Three ways to wait",
      intro: "The same three numbers come out in three different orders.",
      code: r`#include <iostream>
#include <queue>
#include <stack>
using namespace std;

int main() {
    int items[3] = {5, 1, 8};
    stack<int> s;
    queue<int> q;
    priority_queue<int> pq;
    for (int x : items) {
        s.push(x);
        q.push(x);
        pq.push(x);
    }
    cout << "stack:";
    while (!s.empty()) {
        cout << " " << s.top();
        s.pop();
    }
    cout << endl << "queue:";
    while (!q.empty()) {
        cout << " " << q.front();
        q.pop();
    }
    cout << endl << "priority_queue:";
    while (!pq.empty()) {
        cout << " " << pq.top();
        pq.pop();
    }
    cout << endl;
    return 0;
}`,
      output: "stack: 8 1 5\nqueue: 5 1 8\npriority_queue: 8 5 1\n",
      notes: [
        { line: 18, text: "A stack hands back the most recent item first." },
        { line: 23, text: "A queue hands back the earliest item first." },
        { line: 28, text: "A priority_queue hands back the largest item first." },
      ],
    },
    quickCheck: {
      prompt: "After `push(1); push(2); pop(); push(3);` what is on top of a stack — and at the front of a queue?",
      options: [
        { id: "a", text: "stack 3, queue 2", feedback: "Right: the stack popped 2 and its top is the newest (3); the queue popped 1 and its front is 2." },
        { id: "b", text: "stack 3, queue 3", feedback: "A queue's front is the oldest remaining item, not the newest." },
        { id: "c", text: "stack 1, queue 2", feedback: "After pushing 3, the stack's top is 3." },
      ],
      correct: "a",
      explanation: "Stack pop removes the newest (2) → {1, 3}, top 3. Queue pop removes the oldest (1) → {2, 3}, front 2.",
    },
    exercise: {
      title: "Balanced brackets",
      prompt: `Each test string contains only the characters \`( ) [ ] { }\`. It is **balanced** if every opening bracket is closed by the matching kind, in the right order — like \`([]{})\` but not \`(]\` or \`([)]\`.

Read \`t\`, then \`t\` strings. Print \`YES\` or \`NO\` for each.`,
      starterCode: r`#include <iostream>
#include <stack>
#include <string>
using namespace std;

bool balanced(const string& s) {
    // Push opening brackets; on a closing bracket, check the top matches.
    return false;
}

int main() {
    int t;
    cin >> t;
    for (int i = 0; i < t; i++) {
        string s;
        cin >> s;
        cout << (balanced(s) ? "YES" : "NO") << endl;
    }
    return 0;
}`,
      tests: [
        { label: "mixed", input: "3\n([]{})\n(]\n((\n", output: "YES\nNO\nNO", visibility: "sample", category: "normal" },
        { label: "interleaved", input: "2\n([)]\n{[()()]}\n", output: "NO\nYES", visibility: "hidden", category: "edge" },
        { label: "closing first", input: "2\n)(\n]\n", output: "NO\nNO", visibility: "hidden", category: "edge" },
        { label: "single pair", input: "1\n{}\n", output: "YES", visibility: "hidden", category: "boundary" },
      ],
      compare: "tokens",
      hints: [
        "When you meet a closing bracket, which opening bracket must it match?",
        "The most recent unmatched opening bracket — that's exactly what a stack's `top()` gives you.",
        "Opening → `push`. Closing → if the stack is empty or `top()` isn't its partner, answer NO; otherwise `pop`.",
        "After the loop the string is balanced only if the stack is empty — `((` leaves two unmatched openers.",
      ],
      solution: r`#include <iostream>
#include <stack>
#include <string>
using namespace std;

bool balanced(const string& s) {
    stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '[' || c == '{') {
            st.push(c);
        } else {
            if (st.empty()) {
                return false;
            }
            char open = st.top();
            if ((c == ')' && open != '(') || (c == ']' && open != '[') || (c == '}' && open != '{')) {
                return false;
            }
            st.pop();
        }
    }
    return st.empty();
}

int main() {
    int t;
    cin >> t;
    for (int i = 0; i < t; i++) {
        string s;
        cin >> s;
        cout << (balanced(s) ? "YES" : "NO") << endl;
    }
    return 0;
}`,
      solutionNotes: "The stack always holds the openers still waiting for a partner, newest on top. Three ways to fail: a closer with nothing open, a closer of the wrong kind, or openers left over at the end.",
    },
    explainAgain: `A **stack** is a pile of plates: you add and take from the top. A **queue** is a line at a ticket counter: first come, first served. A **priority queue** is a hospital emergency room: whoever is most urgent goes next, no matter when they arrived.`,
    summary: [
      "`stack`: last in, first out — `push`, `top`, `pop`.",
      "`queue`: first in, first out — `push`, `front`, `pop`; `deque` works at both ends.",
      "`priority_queue`: largest on top by default (use `greater<>` for smallest); check `empty()` before reading.",
    ],
  },
];
