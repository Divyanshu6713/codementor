import type { CourseLesson } from "./types";
import { practice, starter, T } from "./practice/helpers";

const r = String.raw;

/**
 * New lessons for Module 16 (advanced C++ and engineering practice). The sandbox runs single
 * console programs, so concurrency, multi-file builds, CMake and Git are taught with the real
 * syntax as reading material and practised through deterministic simulations.
 */
export const EXTRA_ENGINEERING_LESSONS: CourseLesson[] = [
  {
    id: "concurrency-races",
    moduleId: "advanced-cpp",
    after: "undefined-behaviour",
    title: "Threads, mutexes and race conditions",
    minutes: 25,
    concepts: ["std::thread", "data race", "std::mutex", "lock_guard", "deadlock", "atomic"],
    goals: [
      "Explain why `counter++` from two threads can lose updates",
      "Protect shared data with `std::mutex` and `std::lock_guard`",
      "Recognise deadlock and avoid it with a consistent lock order",
    ],
    intro: `Modern CPUs have many cores, and C++ can run several **threads** at once. Threads share memory — which is powerful and dangerous. CodeMentor's sandbox runs one thread, so this lesson shows the real code as reading and lets you *simulate* the interleavings that cause bugs, deterministically.`,
    sections: [
      {
        title: "The real code (run it on your own machine)",
        body: `\`\`\`cpp
#include <thread>
#include <mutex>

long long counter = 0;
std::mutex m;

void work() {
    for (int i = 0; i < 100000; i++) {
        std::lock_guard<std::mutex> guard(m);   // locked until guard is destroyed
        counter++;
    }
}

int main() {
    std::thread a(work), b(work);
    a.join(); b.join();          // wait for both
    std::cout << counter;        // 200000 — without the mutex, usually less
}
\`\`\`

Compile with \`g++ -std=c++20 -pthread\`. For a single counter, \`std::atomic<long long>\` is simpler and faster.`,
      },
      {
        title: "Why updates get lost",
        body: `\`counter++\` is really three steps: **load** the value into a register, **add** 1, **store** it back. If thread A loads 5, then B loads 5, both store 6: one increment vanished. Unsynchronised access like this is a **data race** — undefined behaviour in C++, not just a wrong number.`,
      },
      {
        title: "Deadlock",
        body: `Thread A locks \`m1\` then waits for \`m2\`; thread B locks \`m2\` then waits for \`m1\`. Neither can continue. The fix: every thread takes locks in the **same global order** (or use \`std::scoped_lock(m1, m2)\`, which locks several mutexes safely).`,
      },
    ],
    mistakes: [
      { title: "\"It worked when I ran it\"", body: "Races depend on timing; a racy program can pass a hundred runs and fail on the next. Use ThreadSanitizer (-fsanitize=thread)." },
      { title: "Locking with lock()/unlock() by hand", body: "An early return or exception skips unlock. lock_guard (RAII) always unlocks." },
      { title: "Inconsistent lock order", body: "The classic cause of deadlock. Pick an order and always follow it." },
    ],
    example: {
      title: "Simulating a lost update",
      intro: "Two workers each do load / add / store once. The schedule decides who runs each step.",
      code: r`#include <iostream>
#include <string>
using namespace std;

int main() {
    long long counter = 0;
    long long reg[2] = {0, 0};
    int step[2] = {0, 0};
    string schedule = "AABBAB";
    for (char c : schedule) {
        int w = c - 'A';
        if (step[w] == 0) reg[w] = counter;
        else if (step[w] == 1) reg[w] += 1;
        else counter = reg[w];
        cout << c << (step[w] == 0 ? " load " : step[w] == 1 ? " add  " : " store") << " counter=" << counter << endl;
        step[w]++;
    }
    cout << "final " << counter << " (expected 2)" << endl;
    return 0;
}`,
      output: "A load  counter=0\nA add   counter=0\nB load  counter=0\nB add   counter=0\nA store counter=1\nB store counter=1\nfinal 1 (expected 2)\n",
      notes: [
        { line: 9, text: "One character per step: which worker runs next." },
        { line: 12, text: "Each worker has its own register — like a CPU core." },
        { line: 14, text: "Both stored 1: A's increment was overwritten." },
      ],
    },
    quickCheck: {
      prompt: "Why doesn't `counter++` from two threads always add 2?",
      options: [
        { id: "a", text: "It's a load, an add and a store, and the threads' steps can interleave", feedback: "Right — both can load the same old value." },
        { id: "b", text: "Only one thread can run at a time", feedback: "On multi-core CPUs they really run simultaneously." },
        { id: "c", text: "++ is slower than += 1", feedback: "Both have the same problem." },
      ],
      correct: "a",
      explanation: "Read-modify-write is not atomic unless you make it so (mutex or std::atomic).",
    },
    exercise: {
      title: "Interleaving simulator",
      prompt: `Simulate two workers, A and B, that each increment a shared counter \`k\` times using the steps load / add / store. Read \`k\` and a schedule string (letters A and B; each letter runs that worker's next step; letters for a worker that has finished are ignored). Then read \`mode\`: \`race\` (no protection) or \`mutex\` (a worker must hold the lock for its load…store; if the other worker holds it, the step is skipped — it waits). After the schedule, let any unfinished workers run to completion, A first. Print the final counter.`,
      starterCode: r`#include <iostream>
#include <string>
using namespace std;

int main() {
    int k;
    string schedule, mode;
    cin >> k >> schedule >> mode;
    long long counter = 0;
    // per worker: register, step (0 load, 1 add, 2 store), increments done
    // in mutex mode, a worker takes the lock at load and releases it after store

    return 0;
}`,
      tests: [
        { label: "lost update", input: "1\nAABBAB\nrace\n", output: "1", visibility: "sample", category: "normal" },
        { label: "mutex", input: "1\nAABBAB\nmutex\n", output: "2", visibility: "hidden", category: "normal" },
        { label: "no overlap", input: "1\nAAABBB\nrace\n", output: "2", visibility: "hidden", category: "edge" },
        { label: "two each", input: "2\nABABABABABAB\nrace\n", output: "2", visibility: "hidden", category: "normal" },
        { label: "empty schedule", input: "3\nX\nrace\n", output: "6", visibility: "hidden", category: "edge" },
      ],
      compare: "lines",
      hints: [
        "Write a function step(w) that performs worker w's next step and returns false if it couldn't (finished, or waiting for the lock).",
        "In mutex mode, a load requires lock == -1 or lock == w; take it (lock = w). A store releases it.",
        "A worker is finished when done == k.",
        "After the schedule: while A isn't finished, step(A); then the same for B. (Other characters in the schedule are ignored.)",
      ],
      solution: r`#include <iostream>
#include <string>
using namespace std;

int k;
bool useMutex;
long long counter = 0;
long long reg[2];
int stepOf[2] = {0, 0}, done[2] = {0, 0};
int lockOwner = -1;

bool step(int w) {
    if (done[w] == k) return false;
    if (stepOf[w] == 0) {
        if (useMutex) {
            if (lockOwner != -1 && lockOwner != w) return false;
            lockOwner = w;
        }
        reg[w] = counter;
    } else if (stepOf[w] == 1) {
        reg[w] += 1;
    } else {
        counter = reg[w];
        done[w]++;
        if (useMutex) lockOwner = -1;
    }
    stepOf[w] = (stepOf[w] + 1) % 3;
    return true;
}

int main() {
    string schedule, mode;
    cin >> k >> schedule >> mode;
    useMutex = mode == "mutex";
    for (char c : schedule) {
        if (c == 'A') step(0);
        else if (c == 'B') step(1);
    }
    while (done[0] < k) step(0);
    while (done[1] < k) step(1);
    cout << counter << endl;
    return 0;
}`,
      solutionNotes: "With the mutex, B's load waits until A has stored, so no update is lost whatever the schedule. In the alternating race schedule each round loses one update: 4 increments, final 2.",
    },
    practice: practice(
      {
        title: "Spot the deadlock risk",
        prompt: `Each worker acquires locks in a fixed order. Read \`n\` workers; each line is \`NAME K L1 L2 … LK\` (the locks it takes, in order, holding all of them). A deadlock is **possible** if the "taken before" relation between locks has a cycle (some worker takes x before y, and some worker — possibly via others — takes y before x). Print \`deadlock possible\` or \`safe\`.`,
        starterCode: starter("Add an edge Li -> Lj for every i < j in each worker's order, then look for a cycle", "int n;\ncin >> n;", ["iostream", "string", "map", "set", "vector"]),
        tests: [
          T("sample", "2\nA 2 m1 m2\nB 2 m2 m1\n", "deadlock possible", "sample"),
          T("same order", "2\nA 2 m1 m2\nB 2 m1 m2\n", "safe", "visible"),
          T("three-way", "3\nA 2 x y\nB 2 y z\nC 2 z x\n", "deadlock possible", "hidden"),
          T("single locks", "2\nA 1 m\nB 1 m\n", "safe", "hidden", "edge"),
        ],
        hints: [
          "Map lock names to ids.",
          "For each worker, add edges from every earlier lock to every later lock.",
          "Detect a cycle with DFS colours (white/grey/black) or Kahn's algorithm.",
          "Any cycle means some interleaving can deadlock.",
        ],
        solution: r`#include <iostream>
#include <string>
#include <map>
#include <set>
#include <vector>
using namespace std;

map<string, int> idOf;
vector<set<int>> adj;
vector<int> colour;

int id(const string& s) {
    auto it = idOf.find(s);
    if (it != idOf.end()) return it->second;
    int v = idOf.size();
    idOf[s] = v;
    adj.emplace_back();
    return v;
}

bool hasCycle(int v) {
    colour[v] = 1;
    for (int w : adj[v]) {
        if (colour[w] == 1) return true;
        if (colour[w] == 0 && hasCycle(w)) return true;
    }
    colour[v] = 2;
    return false;
}

int main() {
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) {
        string name;
        int k;
        cin >> name >> k;
        vector<int> order(k);
        for (auto& x : order) {
            string lockName;
            cin >> lockName;
            x = id(lockName);
        }
        for (int a = 0; a < k; a++)
            for (int b = a + 1; b < k; b++) adj[order[a]].insert(order[b]);
    }
    colour.assign(adj.size(), 0);
    bool cycle = false;
    for (int v = 0; v < (int)adj.size() && !cycle; v++)
        if (colour[v] == 0 && hasCycle(v)) cycle = true;
    cout << (cycle ? "deadlock possible" : "safe") << endl;
    return 0;
}`,
        solutionNotes: "This is how lock-order checkers work: build a graph of 'acquired before' and look for cycles. A global lock order makes the graph acyclic by construction.",
      },
      {
        title: "Bounded buffer (producer–consumer)",
        prompt: `A producer P and a consumer C share a buffer of capacity \`cap\`. Read \`cap\` and a schedule of \`P\`/\`C\` letters. P produces items numbered 1, 2, 3, …: if the buffer is full it **waits** (print \`P waits\`). C takes the oldest item (print \`C got N\`) or waits if empty (\`C waits\`). Process the schedule, then print \`left: …\` — the items still in the buffer, or \`left: none\`.`,
        starterCode: starter("Simulate with a queue<int>; print a line for every waiting step and every consumption", "int cap;\nstring schedule;\ncin >> cap >> schedule;", ["iostream", "queue", "string"]),
        tests: [
          T("sample", "2\nPPPCCC\n", "P waits\nC got 1\nC got 2\nC waits\nleft: none", "sample"),
          T("consume first", "1\nCPC\n", "C waits\nC got 1\nleft: none", "visible", "edge"),
          T("leftovers", "3\nPPCPP\n", "C got 1\nleft: 2 3 4", "hidden"),
        ],
        compare: "lines",
        hints: [
          "Keep a queue<int> and a counter next = 1.",
          "P: if size == cap print P waits, else push(next++).",
          "C: if empty print C waits, else print and pop the front.",
          "At the end, print the remaining queue in order.",
        ],
        solution: r`#include <iostream>
#include <queue>
#include <string>
using namespace std;

int main() {
    int cap;
    string schedule;
    cin >> cap >> schedule;
    queue<int> buf;
    int next = 1;
    for (char c : schedule) {
        if (c == 'P') {
            if ((int)buf.size() == cap) cout << "P waits" << endl;
            else buf.push(next++);
        } else if (c == 'C') {
            if (buf.empty()) cout << "C waits" << endl;
            else {
                cout << "C got " << buf.front() << endl;
                buf.pop();
            }
        }
    }
    cout << "left:";
    if (buf.empty()) cout << " none";
    while (!buf.empty()) {
        cout << " " << buf.front();
        buf.pop();
    }
    cout << endl;
    return 0;
}`,
        solutionNotes: "With real threads, the waiting is done by std::condition_variable while holding a mutex — the logic of 'full → producer waits, empty → consumer waits' is exactly this.",
      },
    ),
    explainAgain: `Two cashiers share one notebook with the shop's total. Each reads the total, adds a sale in their head, and writes the new total. If both read 50 before either writes, one sale disappears. A mutex is a rule: "only the person holding the pen may read and write". Deadlock is two cashiers each holding one of two pens and waiting forever for the other.`,
    summary: [
      "Threads share memory; unsynchronised read-modify-write loses updates (a data race = UB).",
      "Protect shared data with std::mutex + lock_guard, or use std::atomic for simple counters.",
      "Avoid deadlock by always taking locks in the same order (or std::scoped_lock).",
    ],
  },

  {
    id: "separate-compilation",
    moduleId: "advanced-cpp",
    after: "concurrency-races",
    title: "Separate compilation and header guards",
    minutes: 20,
    concepts: ["translation unit", "declaration vs definition", "linker", "one definition rule", "header guard"],
    goals: [
      "Split a program into headers (declarations) and .cpp files (definitions)",
      "Explain what the compiler and the linker each do",
      "Diagnose \"undefined reference\" and \"multiple definition\" errors",
    ],
    intro: `Real programs have dozens or thousands of files. Each \`.cpp\` file is compiled **on its own** into an object file, and the **linker** stitches them together. Knowing which step does what turns mysterious build errors into obvious fixes.`,
    sections: [
      {
        title: "A three-file program",
        body: `\`\`\`cpp
// geometry.h — declarations: "these exist somewhere"
#pragma once
double area(double r);

// geometry.cpp — definitions: "here is the code"
#include "geometry.h"
double area(double r) { return 3.14159 * r * r; }

// main.cpp
#include <iostream>
#include "geometry.h"
int main() { std::cout << area(2.0); }
\`\`\`

Build: \`g++ -c geometry.cpp\`, \`g++ -c main.cpp\`, then \`g++ geometry.o main.o -o app\`. Change only main.cpp, and only main.cpp needs recompiling.`,
      },
      {
        title: "Compiler versus linker errors",
        body: `- The **compiler** sees one file at a time. It needs a *declaration* before a name is used: "'area' was not declared in this scope" → include the header.
- The **linker** matches uses to definitions across files. "undefined reference to area(double)" → the definition is missing or its .cpp wasn't linked. "multiple definition of area" → two files define it — usually a function *defined* in a header included twice. Mark header-defined functions \`inline\`, or move the body to one .cpp.`,
      },
      {
        title: "Header guards",
        body: `\`#include\` pastes the file's text. If a.h and b.h both include common.h, a file including both would see common.h twice — redefining its structs. A guard skips the second copy:

\`\`\`cpp
#ifndef COMMON_H
#define COMMON_H
struct Point { int x, y; };
#endif
\`\`\`

\`#pragma once\` does the same and is supported by all major compilers.`,
      },
    ],
    mistakes: [
      { title: "Defining non-inline functions in headers", body: "Every .cpp that includes it gets a copy → multiple definition at link time." },
      { title: "Forgetting to compile/link a .cpp", body: "The compiler is happy, the linker reports undefined references." },
      { title: "Including .cpp files", body: "#include \"x.cpp\" defines everything again. Include headers, link .cpp files." },
    ],
    example: {
      title: "Declarations before definitions",
      intro: "In one file you can still see the split: a declaration lets main call a function defined later.",
      code: r`#include <iostream>
using namespace std;

// "header" part: declarations
double area(double r);
int countCalls();

// "main.cpp" part
int main() {
    cout << area(1.0) << " " << area(2.0) << endl;
    cout << "calls: " << countCalls() << endl;
    return 0;
}

// "geometry.cpp" part: definitions
static int calls = 0;
double area(double r) {
    calls++;
    return 3.0 * r * r;
}
int countCalls() { return calls; }`,
      output: "3 12\ncalls: 2\n",
      notes: [
        { line: 5, text: "A declaration: enough for the compiler to check the call." },
        { line: 16, text: "static: visible only in this file (internal linkage)." },
        { line: 17, text: "The definition — the linker connects main's calls to it." },
      ],
    },
    quickCheck: {
      prompt: "The build says `undefined reference to 'parse(std::string)'`. Which step failed, and what's the usual cause?",
      options: [
        { id: "a", text: "Linking: parse is declared but its definition wasn't compiled in", feedback: "Right — add the .cpp file that defines it to the build (or fix the signature mismatch)." },
        { id: "b", text: "Compiling: a missing #include", feedback: "A missing include gives 'not declared in this scope', from the compiler." },
        { id: "c", text: "Running: parse crashed", feedback: "The program never got built." },
      ],
      correct: "a",
      explanation: "\"undefined reference\" is always a linker message.",
    },
    exercise: {
      title: "Simulate #include with guards",
      prompt: `Simulate the preprocessor. Read \`n\` files. Each starts with a line \`FILE NAME K\`, followed by K lines that are either \`#include OTHER\` or plain text. Then read the name of the file to compile. Print the expanded text: plain lines in order, and each \`#include\` replaced by that file's expansion — but each file is expanded **at most once** (as if every header had a guard). Includes of unknown files print \`error: OTHER not found\` in their place.`,
      starterCode: r`#include <iostream>
#include <map>
#include <set>
#include <string>
#include <vector>
using namespace std;

map<string, vector<string>> files;
set<string> included;

// void expand(const string& name)

int main() {
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) {
        string tag, name;
        int k;
        cin >> tag >> name >> k;
        cin.ignore();
        for (int j = 0; j < k; j++) {
            string line;
            getline(cin, line);
            files[name].push_back(line);
        }
    }
    string target;
    cin >> target;
    // expand(target)

    return 0;
}`,
      tests: [
        { label: "sample", input: "3\nFILE point.h 1\nstruct Point;\nFILE shapes.h 2\n#include point.h\nstruct Shape;\nFILE main.cpp 3\n#include point.h\n#include shapes.h\nint main();\nmain.cpp\n", output: "struct Point;\nstruct Shape;\nint main();", visibility: "sample", category: "normal" },
        { label: "missing", input: "1\nFILE a.cpp 2\n#include nope.h\nx\na.cpp\n", output: "error: nope.h not found\nx", visibility: "hidden", category: "edge" },
        { label: "self include", input: "1\nFILE loop.h 2\n#include loop.h\ny\nloop.h\n", output: "y", visibility: "hidden", category: "edge" },
      ],
      compare: "lines",
      hints: [
        "expand(name): if name is already in included, return; otherwise insert it first.",
        "Inserting before expanding stops self-includes and cycles.",
        "For each line: if it starts with \"#include \", expand the rest (or print the error); else print the line.",
        "line.rfind(\"#include \", 0) == 0 tests the prefix.",
      ],
      solution: r`#include <iostream>
#include <map>
#include <set>
#include <string>
#include <vector>
using namespace std;

map<string, vector<string>> files;
set<string> included;

void expand(const string& name) {
    if (included.count(name)) return;
    included.insert(name);
    for (const string& line : files[name]) {
        if (line.rfind("#include ", 0) == 0) {
            string other = line.substr(9);
            if (!files.count(other)) cout << "error: " << other << " not found" << endl;
            else expand(other);
        } else {
            cout << line << endl;
        }
    }
}

int main() {
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) {
        string tag, name;
        int k;
        cin >> tag >> name >> k;
        cin.ignore();
        for (int j = 0; j < k; j++) {
            string line;
            getline(cin, line);
            files[name].push_back(line);
        }
    }
    string target;
    cin >> target;
    expand(target);
    return 0;
}`,
      solutionNotes: "point.h appears once even though main.cpp includes it directly and through shapes.h — exactly what #pragma once or an #ifndef guard achieves.",
    },
    practice: practice(
      {
        title: "Who includes whom?",
        prompt: `Read \`m\` lines \`A B\` meaning file A includes header B. Then read a header name H. Print, sorted, every file that would need **recompiling** if H changes (files that include H directly or indirectly; not H itself), or \`none\`.`,
        starterCode: starter("Reverse the edges (B -> A), then BFS/DFS from H", "int m;\ncin >> m;", ["iostream", "map", "set", "string", "vector", "queue"]),
        tests: [
          T("sample", "4\nmain.cpp shapes.h\nshapes.h point.h\nutil.cpp point.h\ntest.cpp main.h\npoint.h\n", "main.cpp shapes.h util.cpp", "sample"),
          T("nobody", "1\na.cpp b.h\nc.h\n", "none", "visible", "edge"),
          T("cycle", "2\na.h b.h\nb.h a.h\na.h\n", "b.h", "hidden", "edge"),
        ],
        compare: "tokens",
        hints: [
          "Store includedBy[B].push_back(A).",
          "BFS from H through includedBy.",
          "Use a set for visited files — it also keeps them sorted.",
          "Don't output H itself.",
        ],
        solution: r`#include <iostream>
#include <map>
#include <set>
#include <string>
#include <vector>
#include <queue>
using namespace std;

int main() {
    int m;
    cin >> m;
    map<string, vector<string>> includedBy;
    for (int i = 0; i < m; i++) {
        string a, b;
        cin >> a >> b;
        includedBy[b].push_back(a);
    }
    string h;
    cin >> h;
    set<string> seen;
    queue<string> q;
    q.push(h);
    while (!q.empty()) {
        string cur = q.front();
        q.pop();
        for (const string& f : includedBy[cur]) {
            if (f != h && seen.insert(f).second) q.push(f);
        }
    }
    if (seen.empty()) cout << "none";
    bool first = true;
    for (const auto& f : seen) {
        cout << (first ? "" : " ") << f;
        first = false;
    }
    cout << endl;
    return 0;
}`,
        solutionNotes: "This is what build tools do to decide what to rebuild — and why touching a header included everywhere triggers a full rebuild.",
      },
      {
        title: "Play the linker",
        prompt: `Read \`n\` object files: \`NAME D U\`, then D defined symbols, then U used symbols. Report, in this order: every symbol defined in more than one file as \`multiple definition of S\` (sorted by symbol), then every used symbol defined nowhere as \`undefined reference to S\` (sorted, once each). If there are no problems, print \`linked OK\`.`,
        starterCode: starter("Count definitions per symbol; collect used symbols", "int n;\ncin >> n;", ["iostream", "map", "set", "string"]),
        tests: [
          T("sample", "2\nmain.o 1 2\nmain\narea\nprint\ngeo.o 1 0\narea\n", "undefined reference to print", "sample"),
          T("ok", "2\na.o 1 1\nf\ng\nb.o 1 1\ng\nf\n", "linked OK", "visible"),
          T("both problems", "3\na.o 1 1\nhelper\nmissing\nb.o 1 0\nhelper\nc.o 0 1\nmissing\n", "multiple definition of helper\nundefined reference to missing", "hidden"),
        ],
        compare: "lines",
        hints: [
          "map<string, int> defs counts definitions.",
          "set<string> used collects every used symbol.",
          "First loop over defs for counts > 1.",
          "Then loop over used for symbols not in defs.",
        ],
        solution: r`#include <iostream>
#include <map>
#include <set>
#include <string>
using namespace std;

int main() {
    int n;
    cin >> n;
    map<string, int> defs;
    set<string> used;
    for (int i = 0; i < n; i++) {
        string name;
        int d, u;
        cin >> name >> d >> u;
        for (int j = 0; j < d; j++) {
            string s;
            cin >> s;
            defs[s]++;
        }
        for (int j = 0; j < u; j++) {
            string s;
            cin >> s;
            used.insert(s);
        }
    }
    bool ok = true;
    for (const auto& [s, c] : defs)
        if (c > 1) { cout << "multiple definition of " << s << endl; ok = false; }
    for (const auto& s : used)
        if (!defs.count(s)) { cout << "undefined reference to " << s << endl; ok = false; }
    if (ok) cout << "linked OK" << endl;
    return 0;
}`,
        solutionNotes: "Exactly the two checks a real linker reports: the One Definition Rule (one definition per symbol) and that every use resolves to some definition.",
      },
    ),
    explainAgain: `Writing a book with friends: each person writes a chapter separately (compiling). The editor (linker) binds them together, checking that every "see chapter 7" points at a chapter that exists, and that no chapter appears twice. Headers are the shared table of contents everyone copies into their chapter — with a guard so nobody pastes it twice.`,
    summary: [
      "Headers declare, .cpp files define; each .cpp compiles separately, then the linker joins them.",
      "\"not declared\" = compiler (missing include); \"undefined reference\" / \"multiple definition\" = linker.",
      "Protect headers with #pragma once or #ifndef guards; don't define non-inline functions in them.",
    ],
  },

  {
    id: "cmake-basics",
    moduleId: "advanced-cpp",
    after: "separate-compilation",
    title: "CMake fundamentals",
    minutes: 20,
    concepts: ["CMakeLists.txt", "add_executable", "add_library", "target_link_libraries", "build directory"],
    goals: [
      "Read and write a small CMakeLists.txt",
      "Define executables and libraries and link them",
      "Run the configure and build steps",
    ],
    intro: `Typing g++ commands for every file doesn't scale. **CMake** is the most common C++ build system generator: you describe *targets* (programs and libraries) once, and it generates Makefiles or Ninja/Visual Studio projects for any platform.`,
    sections: [
      {
        title: "A minimal project",
        body: `\`\`\`cmake
cmake_minimum_required(VERSION 3.20)
project(Shapes LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_library(geometry geometry.cpp)          # a library target
add_executable(app main.cpp)                # a program target
target_link_libraries(app PRIVATE geometry) # app uses geometry
\`\`\``,
      },
      {
        title: "Configure, then build",
        body: `\`\`\`bash
cmake -S . -B build           # configure: read CMakeLists.txt, generate build files in build/
cmake --build build           # compile and link
./build/app
\`\`\`

Keep builds out of the source folder. Add \`-DCMAKE_BUILD_TYPE=Debug\` for a debuggable build (or Release for speed).`,
      },
      {
        title: "Targets and dependencies",
        body: `CMake works out the order: \`geometry\` must be built before \`app\` can be linked. \`target_include_directories(geometry PUBLIC include)\` and \`target_compile_options(app PRIVATE -Wall -Wextra)\` attach settings to a target; **PUBLIC** settings propagate to everything that links it, **PRIVATE** ones don't.`,
      },
    ],
    mistakes: [
      { title: "Building in the source folder", body: "Generated files mix with your code. Always use a separate build directory." },
      { title: "Global settings", body: "include_directories() and add_compile_options() affect everything. Prefer the target_… versions." },
      { title: "Forgetting to link", body: "Using a library's functions without target_link_libraries gives undefined references." },
    ],
    example: {
      title: "Reading CMake commands",
      intro: "A tiny parser that understands three CMake commands and lists the targets.",
      code: r`#include <iostream>
#include <sstream>
#include <string>
#include <vector>
using namespace std;

int main() {
    vector<string> lines = {
        "project(Shapes)",
        "add_library(geometry geometry.cpp shapes.cpp)",
        "add_executable(app main.cpp)",
        "target_link_libraries(app geometry)",
    };
    for (const string& line : lines) {
        size_t open = line.find('('), close = line.rfind(')');
        string command = line.substr(0, open);
        stringstream args(line.substr(open + 1, close - open - 1));
        string first, rest, word;
        args >> first;
        while (args >> word) rest += " " + word;
        cout << command << " -> " << first << (rest.empty() ? "" : " :" + rest) << endl;
    }
    return 0;
}`,
      output: "project -> Shapes\nadd_library -> geometry : geometry.cpp shapes.cpp\nadd_executable -> app : main.cpp\ntarget_link_libraries -> app : geometry\n",
      notes: [
        { line: 15, text: "A command is a name followed by arguments in parentheses." },
        { line: 19, text: "The first argument is usually the target name." },
      ],
    },
    quickCheck: {
      prompt: "What does `cmake -S . -B build` do?",
      options: [
        { id: "a", text: "Configures the project: reads CMakeLists.txt and generates build files in build/", feedback: "Right — nothing is compiled yet." },
        { id: "b", text: "Compiles and links everything", feedback: "That's `cmake --build build`." },
        { id: "c", text: "Deletes the build folder", feedback: "No — it creates/updates it." },
      ],
      correct: "a",
      explanation: "CMake has two phases: configure (generate) and build.",
    },
    exercise: {
      title: "Plan the build",
      prompt: `Read a mini CMakeLists.txt (until the input ends) containing \`add_library(NAME src…)\`, \`add_executable(NAME src…)\` and \`target_link_libraries(NAME lib…)\` lines (others are ignored). Print a build order where every library comes before the targets that link it, choosing the alphabetically smallest ready target each time, as \`lib NAME (N sources)\` or \`exe NAME (N sources)\`. If the links form a cycle or reference an unknown target, print \`error\` instead.`,
      starterCode: r`#include <iostream>
#include <map>
#include <set>
#include <sstream>
#include <string>
#include <vector>
using namespace std;

int main() {
    // parse each line into a command and its arguments
    // then topologically sort the targets (smallest name first)

    return 0;
}`,
      tests: [
        { label: "sample", input: "project(Shapes)\nadd_executable(app main.cpp)\nadd_library(geometry geometry.cpp shapes.cpp)\ntarget_link_libraries(app geometry)\n", output: "lib geometry (2 sources)\nexe app (1 sources)", visibility: "sample", category: "normal" },
        { label: "chain", input: "add_library(core core.cpp)\nadd_library(io io.cpp)\ntarget_link_libraries(io core)\nadd_executable(tool tool.cpp)\ntarget_link_libraries(tool io core)\n", output: "lib core (1 sources)\nlib io (1 sources)\nexe tool (1 sources)", visibility: "hidden", category: "normal" },
        { label: "unknown", input: "add_executable(app main.cpp)\ntarget_link_libraries(app missing)\n", output: "error", visibility: "hidden", category: "edge" },
        { label: "independent", input: "add_executable(b b.cpp)\nadd_executable(a a.cpp x.cpp)\n", output: "exe a (2 sources)\nexe b (1 sources)", visibility: "hidden", category: "edge" },
      ],
      compare: "lines",
      hints: [
        "Split a line at '(' and the last ')'; read the arguments with a stringstream.",
        "Store each target's kind and source count; for links, add edges lib → target.",
        "If a link names a target that's never defined, it's an error (check after reading everything).",
        "Kahn's algorithm with a set<string> of ready targets gives the alphabetical tie-break; fewer outputs than targets means a cycle.",
      ],
      solution: r`#include <iostream>
#include <map>
#include <set>
#include <sstream>
#include <string>
#include <vector>
using namespace std;

int main() {
    map<string, pair<string, int>> targets;
    vector<pair<string, string>> links;
    string line;
    while (getline(cin, line)) {
        size_t open = line.find('('), close = line.rfind(')');
        if (open == string::npos || close == string::npos || close < open) continue;
        string command = line.substr(0, open);
        stringstream args(line.substr(open + 1, close - open - 1));
        string name, word;
        args >> name;
        vector<string> rest;
        while (args >> word) rest.push_back(word);
        if (command == "add_library") targets[name] = {"lib", (int)rest.size()};
        else if (command == "add_executable") targets[name] = {"exe", (int)rest.size()};
        else if (command == "target_link_libraries")
            for (const auto& lib : rest) links.push_back({lib, name});
    }
    map<string, vector<string>> adj;
    map<string, int> indeg;
    for (const auto& [name, info] : targets) indeg[name] = 0;
    for (const auto& [lib, user] : links) {
        if (!targets.count(lib) || !targets.count(user)) {
            cout << "error" << endl;
            return 0;
        }
        adj[lib].push_back(user);
        indeg[user]++;
    }
    set<string> ready;
    for (const auto& [name, d] : indeg) if (d == 0) ready.insert(name);
    vector<string> order;
    while (!ready.empty()) {
        string cur = *ready.begin();
        ready.erase(ready.begin());
        order.push_back(cur);
        for (const auto& next : adj[cur]) if (--indeg[next] == 0) ready.insert(next);
    }
    if (order.size() != targets.size()) {
        cout << "error" << endl;
        return 0;
    }
    for (const auto& name : order)
        cout << targets[name].first << " " << name << " (" << targets[name].second << " sources)" << endl;
    return 0;
}`,
      solutionNotes: "Under the hood CMake builds exactly this dependency graph between targets; the generated build system then compiles independent targets in parallel.",
    },
    practice: practice(
      {
        title: "Generate the compile commands",
        prompt: `Read lines \`add_executable(NAME src…)\` until the input ends. For each target in input order, print one \`g++ -std=c++20 -c SRC -o SRC.o\` line per source (in order), then \`g++ OBJS -o NAME\` where OBJS are its object files separated by spaces.`,
        starterCode: starter("Parse each add_executable and print the compile and link commands", "string line;", ["iostream", "sstream", "string", "vector"]),
        tests: [
          T("sample", "add_executable(app main.cpp util.cpp)\n", "g++ -std=c++20 -c main.cpp -o main.cpp.o\ng++ -std=c++20 -c util.cpp -o util.cpp.o\ng++ main.cpp.o util.cpp.o -o app", "sample"),
          T("two targets", "add_executable(a a.cpp)\nadd_executable(b b.cpp)\n", "g++ -std=c++20 -c a.cpp -o a.cpp.o\ng++ a.cpp.o -o a\ng++ -std=c++20 -c b.cpp -o b.cpp.o\ng++ b.cpp.o -o b", "visible"),
          T("ignore others", "project(X)\nadd_executable(t t.cpp)\n", "g++ -std=c++20 -c t.cpp -o t.cpp.o\ng++ t.cpp.o -o t", "hidden", "edge"),
        ],
        compare: "lines",
        hints: [
          "Only handle lines whose command is add_executable.",
          "The first argument is the name; the rest are sources.",
          "Print a compile line per source, collecting the object names.",
          "Then print the link line.",
        ],
        solution: r`#include <iostream>
#include <sstream>
#include <string>
#include <vector>
using namespace std;

int main() {
    string line;
    while (getline(cin, line)) {
        size_t open = line.find('('), close = line.rfind(')');
        if (open == string::npos || close == string::npos) continue;
        if (line.substr(0, open) != "add_executable") continue;
        stringstream args(line.substr(open + 1, close - open - 1));
        string name, src;
        args >> name;
        vector<string> objs;
        while (args >> src) {
            cout << "g++ -std=c++20 -c " << src << " -o " << src << ".o" << endl;
            objs.push_back(src + ".o");
        }
        cout << "g++";
        for (const auto& o : objs) cout << " " << o;
        cout << " -o " << name << endl;
    }
    return 0;
}`,
        solutionNotes: "This is the essence of what the generated build files contain: compile each source to an object, then link the objects.",
      },
      {
        title: "PUBLIC or PRIVATE?",
        prompt: `Libraries can have include directories marked PUBLIC (passed on to anything that links them, transitively) or PRIVATE (only for the library itself). Read lines until the input ends: \`include LIB public|private DIR\` and \`link TARGET LIB\`. Then for the final line \`query TARGET\`, print the sorted include directories TARGET compiles with (its own, plus PUBLIC ones of everything it links, transitively through PUBLIC chains), or \`none\`. Assume \`link\` is always PUBLIC.`,
        starterCode: starter("Collect own dirs plus public dirs reachable through links", "string cmd;", ["iostream", "map", "set", "string", "vector"]),
        tests: [
          T("sample", "include geometry public geometry/include\ninclude geometry private geometry/src\nlink app geometry\nquery app\n", "geometry/include", "sample"),
          T("own private", "include geometry public g/inc\ninclude geometry private g/src\nquery geometry\n", "g/inc g/src", "visible"),
          T("transitive", "include core public core/inc\ninclude io public io/inc\nlink io core\nlink app io\nquery app\n", "core/inc io/inc", "hidden"),
          T("none", "link app util\nquery app\n", "none", "hidden", "edge"),
        ],
        compare: "tokens",
        hints: [
          "Store publicDirs[lib], privateDirs[lib] and links[target].",
          "The answer starts with the target's own public and private dirs.",
          "DFS through links, adding only public dirs of each linked library.",
          "Keep a visited set so cycles don't loop forever.",
        ],
        solution: r`#include <iostream>
#include <map>
#include <set>
#include <string>
#include <vector>
using namespace std;

map<string, vector<string>> publicDirs, privateDirs, links;

void addPublic(const string& lib, set<string>& out, set<string>& seen) {
    if (!seen.insert(lib).second) return;
    for (const auto& d : publicDirs[lib]) out.insert(d);
    for (const auto& next : links[lib]) addPublic(next, out, seen);
}

int main() {
    string cmd;
    while (cin >> cmd) {
        if (cmd == "include") {
            string lib, vis, dir;
            cin >> lib >> vis >> dir;
            (vis == "public" ? publicDirs : privateDirs)[lib].push_back(dir);
        } else if (cmd == "link") {
            string target, lib;
            cin >> target >> lib;
            links[target].push_back(lib);
        } else if (cmd == "query") {
            string target;
            cin >> target;
            set<string> out, seen;
            seen.insert(target);
            for (const auto& d : publicDirs[target]) out.insert(d);
            for (const auto& d : privateDirs[target]) out.insert(d);
            for (const auto& lib : links[target]) addPublic(lib, out, seen);
            if (out.empty()) cout << "none";
            bool first = true;
            for (const auto& d : out) {
                cout << (first ? "" : " ") << d;
                first = false;
            }
            cout << endl;
        }
    }
    return 0;
}`,
        solutionNotes: "PUBLIC means \"my users need this too\" (e.g. headers in my public API); PRIVATE means \"only my own .cpp files need it\". CMake propagates usage requirements exactly like this.",
      },
    ),
    explainAgain: `CMakeLists.txt is a recipe card: "the app is made from main.cpp and needs the geometry library, which is made from geometry.cpp". CMake reads the card, works out what must be cooked first, and writes detailed instructions for whichever kitchen (Make, Ninja, Visual Studio) you have.`,
    summary: [
      "Describe targets: add_executable, add_library, target_link_libraries.",
      "Configure with `cmake -S . -B build`, then `cmake --build build`.",
      "Prefer target_… commands; PUBLIC settings propagate to users, PRIVATE ones don't.",
    ],
  },

  {
    id: "git-workflow",
    moduleId: "advanced-cpp",
    after: "cmake-basics",
    title: "A basic Git workflow",
    minutes: 20,
    concepts: ["repository", "staging area", "commit", "branch", "merge", "conflict"],
    goals: [
      "Track changes with add and commit",
      "Work on branches and merge them",
      "Understand what a merge conflict is and how to resolve it",
    ],
    intro: `Git records snapshots of your project so you can see what changed, undo mistakes and work with others without overwriting each other's work. You'll use it on every real project — including this one.`,
    sections: [
      {
        title: "The everyday loop",
        body: `\`\`\`bash
git init                       # start tracking a folder
git status                     # what changed?
git add main.cpp               # stage a file for the next commit
git commit -m "Add parser"     # save a snapshot of everything staged
git log --oneline              # history, newest first
\`\`\`

Three places: the **working folder** (your files), the **staging area** (what goes into the next commit), and the **history** (commits).`,
      },
      {
        title: "Branches",
        body: `A branch is a movable label pointing at a commit.

\`\`\`bash
git switch -c feature/search   # create a branch and move to it
# …edit, add, commit…
git switch main
git merge feature/search       # bring the work into main
\`\`\`

If main hasn't moved since the branch was created, the merge just moves the label forward (**fast-forward**).`,
      },
      {
        title: "Conflicts",
        body: `If both branches changed the **same lines** differently, Git can't choose, and marks the file:

\`\`\`
<<<<<<< HEAD
int limit = 10;
=======
int limit = 20;
>>>>>>> feature/search
\`\`\`

Edit the file to the correct version, remove the markers, then \`git add\` and \`git commit\`. Changes to different lines merge automatically.`,
      },
    ],
    mistakes: [
      { title: "Committing build outputs", body: "Add build/, *.o and executables to .gitignore." },
      { title: "Huge vague commits", body: "Small commits with messages saying why (\"Fix off-by-one in binary search\") make history useful." },
      { title: "Working directly on main", body: "Use a branch per feature; merge when it works." },
    ],
    example: {
      title: "Snapshots, simulated",
      intro: "A miniature model of staging and committing.",
      code: r`#include <iostream>
#include <map>
#include <string>
#include <vector>
using namespace std;

int main() {
    map<string, string> working, staged;
    vector<pair<string, map<string, string>>> history;
    working["main.cpp"] = "v1";
    staged = working;
    history.push_back({"Initial commit", staged});
    working["main.cpp"] = "v2";
    working["util.cpp"] = "v1";
    staged["util.cpp"] = working["util.cpp"];
    history.push_back({"Add util", staged});
    for (int i = history.size() - 1; i >= 0; i--) {
        cout << i << " " << history[i].first << ":";
        for (const auto& [file, ver] : history[i].second) cout << " " << file << "=" << ver;
        cout << endl;
    }
    cout << "unstaged: main.cpp is " << working["main.cpp"] << ", committed " << staged["main.cpp"] << endl;
    return 0;
}`,
      output: "1 Add util: main.cpp=v1 util.cpp=v1\n0 Initial commit: main.cpp=v1\nunstaged: main.cpp is v2, committed v1\n",
      notes: [
        { line: 11, text: "A commit saves a snapshot of the staging area." },
        { line: 14, text: "Only util.cpp is staged; the edit to main.cpp is left out." },
        { line: 16, text: "git log shows the newest commit first." },
      ],
    },
    quickCheck: {
      prompt: "You edited a.cpp and b.cpp, then ran `git add a.cpp` and `git commit`. What's in the commit?",
      options: [
        { id: "a", text: "Only the change to a.cpp", feedback: "Right — b.cpp's change stays in your working folder, unstaged." },
        { id: "b", text: "Both changes", feedback: "Only staged changes are committed (unless you use commit -a)." },
        { id: "c", text: "Nothing", feedback: "a.cpp was staged, so its change is committed." },
      ],
      correct: "a",
      explanation: "A commit records the staging area, not everything in the folder.",
    },
    exercise: {
      title: "A tiny Git",
      prompt: `Simulate Git for a single branch. Commands: \`edit FILE CONTENT\` (change a working file), \`add FILE\` (stage it; \`error: FILE not found\` if it isn't in the working folder), \`commit MESSAGE\` (one word; \`nothing to commit\` if nothing is staged since the last commit), \`status\` (print \`staged: …\` and \`modified: …\` — sorted file names, or \`-\`; modified means the working content differs from what's staged), \`log\` (commits newest first as \`N MESSAGE\`, numbered from 1).`,
      starterCode: r`#include <iostream>
#include <map>
#include <set>
#include <string>
#include <vector>
using namespace std;

int main() {
    map<string, string> working, index;
    set<string> stagedSinceCommit;
    vector<string> log;
    string cmd;
    while (cin >> cmd) {
        // edit / add / commit / status / log
    }
    return 0;
}`,
      tests: [
        { label: "sample", input: "edit main.cpp v1\nadd main.cpp\ncommit init\nedit main.cpp v2\nedit util.cpp v1\nadd util.cpp\nstatus\ncommit util\nlog\n", output: "staged: util.cpp\nmodified: main.cpp\n2 util\n1 init", visibility: "sample", category: "normal" },
        { label: "nothing", input: "commit empty\nadd ghost.cpp\nstatus\n", output: "nothing to commit\nerror: ghost.cpp not found\nstaged: -\nmodified: -", visibility: "hidden", category: "edge" },
        { label: "re-edit after add", input: "edit a x\nadd a\nedit a y\nstatus\n", output: "staged: a\nmodified: a", visibility: "hidden", category: "edge" },
      ],
      compare: "lines",
      hints: [
        "index holds the staged content of each file (it persists between commits).",
        "add copies working[FILE] into index and records FILE in stagedSinceCommit.",
        "commit: if stagedSinceCommit is empty → nothing to commit; else push the message and clear the set.",
        "modified: files in working whose content differs from index (or that aren't in index at all).",
      ],
      solution: r`#include <iostream>
#include <map>
#include <set>
#include <string>
#include <vector>
using namespace std;

void printList(const string& label, const set<string>& items) {
    cout << label << ":";
    if (items.empty()) cout << " -";
    for (const auto& s : items) cout << " " << s;
    cout << endl;
}

int main() {
    map<string, string> working, index;
    set<string> stagedSinceCommit;
    vector<string> log;
    string cmd;
    while (cin >> cmd) {
        if (cmd == "edit") {
            string file, content;
            cin >> file >> content;
            working[file] = content;
        } else if (cmd == "add") {
            string file;
            cin >> file;
            if (!working.count(file)) {
                cout << "error: " << file << " not found" << endl;
                continue;
            }
            index[file] = working[file];
            stagedSinceCommit.insert(file);
        } else if (cmd == "commit") {
            string message;
            cin >> message;
            if (stagedSinceCommit.empty()) {
                cout << "nothing to commit" << endl;
                continue;
            }
            log.push_back(message);
            stagedSinceCommit.clear();
        } else if (cmd == "status") {
            set<string> modified;
            for (const auto& [file, content] : working) {
                auto it = index.find(file);
                if (it == index.end() || it->second != content) modified.insert(file);
            }
            printList("staged", stagedSinceCommit);
            printList("modified", modified);
        } else if (cmd == "log") {
            for (int i = log.size() - 1; i >= 0; i--) cout << i + 1 << " " << log[i] << endl;
        }
    }
    return 0;
}`,
      solutionNotes: "A file can be both staged and modified: the staged version is what you added, and you've changed it again since. That's exactly what `git status` shows in the same situation.",
    },
    practice: practice(
      {
        title: "Branches as labels",
        prompt: `Commits are numbered 1, 2, 3, … and each has one parent. Start on branch \`main\` with no commits. Commands: \`commit\` (new commit whose parent is the current branch's commit; the branch moves to it), \`branch NAME\` (new label at the current commit), \`switch NAME\` (or \`error: no branch NAME\`), \`log\` (the current branch's history from its commit back to the first, space-separated, or \`(no commits)\`).`,
        starterCode: starter("map<string, int> branches; vector<int> parent; string current", "string cmd;", ["iostream", "map", "string", "vector"]),
        tests: [
          T("sample", "commit\ncommit\nbranch feature\nswitch feature\ncommit\nlog\nswitch main\ncommit\nlog\n", "3 2 1\n4 2 1", "sample"),
          T("empty", "log\nswitch dev\n", "(no commits)\nerror: no branch dev", "visible", "edge"),
          T("branch before commits", "branch dev\nswitch dev\ncommit\nlog\nswitch main\nlog\n", "1\n(no commits)", "hidden", "edge"),
        ],
        compare: "lines",
        hints: [
          "branches[\"main\"] = 0 means no commit yet; parent[0] is unused.",
          "commit: id = parent.size(); parent.push_back(branches[current]); branches[current] = id.",
          "Start parent with one dummy entry so ids begin at 1.",
          "log: follow parent from branches[current] until 0.",
        ],
        solution: r`#include <iostream>
#include <map>
#include <string>
#include <vector>
using namespace std;

int main() {
    map<string, int> branches = {{"main", 0}};
    vector<int> parent = {0};
    string current = "main", cmd;
    while (cin >> cmd) {
        if (cmd == "commit") {
            int id = parent.size();
            parent.push_back(branches[current]);
            branches[current] = id;
        } else if (cmd == "branch") {
            string name;
            cin >> name;
            branches[name] = branches[current];
        } else if (cmd == "switch") {
            string name;
            cin >> name;
            if (!branches.count(name)) cout << "error: no branch " << name << endl;
            else current = name;
        } else if (cmd == "log") {
            int c = branches[current];
            if (c == 0) cout << "(no commits)";
            for (bool first = true; c != 0; c = parent[c], first = false) cout << (first ? "" : " ") << c;
            cout << endl;
        }
    }
    return 0;
}`,
        solutionNotes: "A branch is just a name for one commit; the history is found by following parent links. Creating a branch is instant because nothing is copied.",
      },
      {
        title: "Three-way merge",
        prompt: `Merge line by line. Read \`n\`, then n lines of the **base** version, n lines of **ours** and n lines of **theirs** (same number of lines; each line is one word). For each line: if ours and theirs are equal, keep it; if only one side changed it from base, take that side; if both changed it differently, output the conflict block \`<<<<<<< ours\`, our line, \`=======\`, their line, \`>>>>>>> theirs\`. Finally print \`conflicts: N\`.`,
        starterCode: starter("Compare each line of ours and theirs with base", "int n;\ncin >> n;\nvector<string> base(n), ours(n), theirs(n);\nfor (auto& s : base) cin >> s;\nfor (auto& s : ours) cin >> s;\nfor (auto& s : theirs) cin >> s;", ["iostream", "string", "vector"]),
        tests: [
          T("sample", "3\nlimit=10\nname=app\ndebug=off\nlimit=20\nname=app\ndebug=off\nlimit=10\nname=tool\ndebug=off\n", "limit=20\nname=tool\ndebug=off\nconflicts: 0", "sample"),
          T("conflict", "1\nx=1\nx=2\nx=3\n", "<<<<<<< ours\nx=2\n=======\nx=3\n>>>>>>> theirs\nconflicts: 1", "visible", "edge"),
          T("same change", "2\na\nb\nA\nb\nA\nb\n", "A\nb\nconflicts: 0", "hidden", "edge"),
        ],
        compare: "lines",
        hints: [
          "If ours[i] == theirs[i]: output it.",
          "Else if ours[i] == base[i]: theirs changed → output theirs[i].",
          "Else if theirs[i] == base[i]: ours changed → output ours[i].",
          "Otherwise: conflict block, and count it.",
        ],
        solution: r`#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<string> base(n), ours(n), theirs(n);
    for (auto& s : base) cin >> s;
    for (auto& s : ours) cin >> s;
    for (auto& s : theirs) cin >> s;
    int conflicts = 0;
    for (int i = 0; i < n; i++) {
        if (ours[i] == theirs[i]) cout << ours[i] << endl;
        else if (ours[i] == base[i]) cout << theirs[i] << endl;
        else if (theirs[i] == base[i]) cout << ours[i] << endl;
        else {
            conflicts++;
            cout << "<<<<<<< ours" << endl << ours[i] << endl << "=======" << endl
                 << theirs[i] << endl << ">>>>>>> theirs" << endl;
        }
    }
    cout << "conflicts: " << conflicts << endl;
    return 0;
}`,
        solutionNotes: "The base is what makes merging smart: knowing the original tells Git which side made a change. Only lines both sides changed differently need a human.",
      },
    ),
    explainAgain: `Git is a photo album of your project. \`add\` chooses which changes go into the next photo, \`commit\` takes it, \`log\` flips back through the album. A branch is a bookmark you can move forward on its own; merging combines two bookmarks' photos, and only asks you when both changed the same spot differently.`,
    summary: [
      "Working folder → `git add` → staging area → `git commit` → history.",
      "Branches are movable labels; merge brings work together (fast-forward when possible).",
      "Conflicts happen only when both sides changed the same lines; edit, add, commit to resolve.",
    ],
  },
];
