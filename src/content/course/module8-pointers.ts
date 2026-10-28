import type { CourseLesson } from "./types";

const r = String.raw;

/**
 * Module 8 — Pointers, references and dynamic memory. Students already pass by reference and use
 * arrays; now they see the addresses underneath, and memory they allocate themselves.
 * Examples never print raw addresses: those differ on every run, so outputs stay checkable.
 */
export const POINTERS_LESSONS: CourseLesson[] = [
  {
    id: "pointers-basics",
    moduleId: "pointers",
    title: "Addresses and pointers",
    minutes: 20,
    concepts: ["address", "pointer", "dereference", "nullptr", "address-of operator"],
    goals: [
      "What a memory address is and how `&` gets one",
      "Declaring a pointer and reading or changing a value through it with `*`",
      "Using `nullptr` for \"points nowhere\" and checking before use",
    ],
    intro: `Every variable lives somewhere in memory, and that place has an **address**. A **pointer** is a variable that stores an address — so it can reach, read and change another variable without being that variable. References (from Functions) are a safer, friendlier cousin of the same idea.`,
    sections: [
      {
        title: "Address-of: &",
        body: `\`&score\` means "the address of \`score\`". Printing it shows a hexadecimal number like \`0x7ffd5c3a\` that changes from run to run — the exact number doesn't matter; what matters is that it **identifies where** \`score\` lives.

\`\`\`cpp
int score = 40;
cout << &score;     // some address, e.g. 0x7ffd...
\`\`\``,
      },
      {
        title: "Pointer variables and dereferencing: *",
        visual: "memory-boxes",
        body: `\`\`\`cpp
int score = 40;
int* p = &score;    // p holds the address of score
cout << *p;         // 40 — "the value at the address in p"
*p = 75;            // writes 75 into score
\`\`\`

The \`*\` means two different things:

- in a **declaration** (\`int* p\`) it says "p is a pointer to int";
- in an **expression** (\`*p\`) it **dereferences**: follow the address and use the value there.

A pointer's type must match: an \`int*\` points at \`int\`s, a \`double*\` at \`double\`s.`,
      },
      {
        title: "nullptr: pointing nowhere",
        body: `A pointer that doesn't point at anything yet should hold \`nullptr\`:

\`\`\`cpp
int* q = nullptr;
if (q != nullptr) {
    cout << *q;     // only dereference when it's safe
}
\`\`\`

Dereferencing \`nullptr\` (or an uninitialised pointer) is **undefined behaviour** — usually a crash. Always initialise pointers, and check them when they might be empty.`,
      },
      {
        title: "Pointers versus references",
        body: `| | reference \`int& r = x;\` | pointer \`int* p = &x;\` |
|---|---|---|
| can be empty | no | yes (\`nullptr\`) |
| can be re-pointed | no | yes (\`p = &y;\`) |
| syntax to reach the value | just \`r\` | \`*p\` |

Prefer references when something must always exist; use pointers when "nothing" is a valid answer or the target changes.`,
      },
    ],
    mistakes: [
      { title: "Forgetting to dereference", body: "`p = 75;` tries to store 75 *as an address* (and won't compile for `int*`). To change the value pointed to, write `*p = 75;`." },
      { title: "Uninitialised pointers", body: "`int* p;` holds a random address. Using `*p` may corrupt memory or crash. Initialise with an address or `nullptr`." },
      { title: "int* a, b;", body: "This declares `a` as a pointer but `b` as a plain `int`. Declare one pointer per line: `int* a; int* b;`." },
    ],
    example: {
      title: "Changing a variable through a pointer",
      intro: "A pointer reads and then changes `score`; a second pointer is safely empty.",
      code: r`#include <iostream>
using namespace std;

int main() {
    int score = 40;
    int* p = &score;
    cout << "score = " << score << endl;
    cout << "*p = " << *p << endl;
    *p = 75;
    cout << "score is now " << score << endl;
    if (p == &score) {
        cout << "p points to score" << endl;
    }
    int* q = nullptr;
    if (q == nullptr) {
        cout << "q points nowhere" << endl;
    }
    return 0;
}`,
      output: "score = 40\n*p = 40\nscore is now 75\np points to score\nq points nowhere\n",
      notes: [
        { line: 6, text: "`p` stores the address of `score`." },
        { line: 9, text: "Dereference and assign: the 75 lands in `score` itself." },
        { line: 14, text: "`nullptr` means \"no target\" — safe to compare, never to dereference." },
      ],
    },
    quickCheck: {
      prompt: "What does this print?",
      code: r`int a = 3, b = 8;
int* p = &a;
*p = *p + 1;
p = &b;
*p = *p * 2;
cout << a << " " << b;`,
      options: [
        { id: "a", text: "4 16", feedback: "Right: the first change goes to `a` (3 → 4), then `p` is re-pointed at `b` (8 → 16)." },
        { id: "b", text: "8 8", feedback: "Follow where `p` points at each moment — it changes on line 4." },
        { id: "c", text: "4 8", feedback: "After `p = &b;` the doubling changes `b`." },
      ],
      correct: "a",
      explanation: "`*p` always means \"whatever p points to right now\". It points at `a` first, then at `b`.",
    },
    exercise: {
      title: "Bonus points through a pointer",
      prompt: `Complete \`void addBonus(int* p, int bonus)\`: add \`bonus\` to the value that \`p\` points to — but if \`p\` is \`nullptr\`, do nothing (and don't crash).

\`main\` reads \`a\`, \`b\` and \`k\`, then calls \`addBonus(&a, k)\`, \`addBonus(nullptr, k)\` and \`addBonus(&b, 2 * k)\`, and prints \`a b\`.`,
      starterCode: r`#include <iostream>
using namespace std;

void addBonus(int* p, int bonus) {
    // Add bonus to the value p points to. If p is nullptr, do nothing.
}

int main() {
    int a, b, k;
    cin >> a >> b >> k;
    addBonus(&a, k);
    addBonus(nullptr, k);
    addBonus(&b, 2 * k);
    cout << a << " " << b << endl;
    return 0;
}`,
      tests: [
        { label: "10 20, bonus 5", input: "10 20 5\n", output: "15 30", visibility: "sample", category: "normal" },
        { label: "negative bonus", input: "7 7 -2\n", output: "5 3", visibility: "hidden", category: "edge" },
        { label: "zero bonus", input: "0 0 0\n", output: "0 0", visibility: "hidden", category: "boundary" },
        { label: "large values", input: "1000000 2000000 300000\n", output: "1300000 2600000", visibility: "hidden", category: "normal" },
      ],
      compare: "tokens",
      hints: [
        "How do you reach the variable that `p` points to — and when is that not allowed?",
        "`*p` is the pointed-to variable. Dereferencing `nullptr` crashes, so check first.",
        "Wrap the change in `if (p != nullptr) { ... }`.",
        "`if (p != nullptr) { *p += bonus; }` — the `nullptr` call then simply does nothing.",
      ],
      solution: r`#include <iostream>
using namespace std;

void addBonus(int* p, int bonus) {
    if (p != nullptr) {
        *p += bonus;
    }
}

int main() {
    int a, b, k;
    cin >> a >> b >> k;
    addBonus(&a, k);
    addBonus(nullptr, k);
    addBonus(&b, 2 * k);
    cout << a << " " << b << endl;
    return 0;
}`,
      solutionNotes: "`*p += bonus` changes the caller's variable through its address. The `nullptr` check is what makes the middle call safe — without it, the program would crash.",
    },
    explainAgain: `Think of memory as a street of houses. A variable is a house; its **address** is the house number. A pointer is a slip of paper with a house number written on it.

\`&score\` reads the number off the house. \`*p\` means "go to the house written on the slip". And \`nullptr\` is a blank slip — you can't visit a blank address, so check before you go.`,
    summary: [
      "`&x` gives the address of `x`; a pointer stores an address.",
      "`*p` follows the pointer to read or change the value it points to.",
      "Initialise pointers, use `nullptr` for \"nothing\", and check before dereferencing.",
    ],
  },

  {
    id: "pointers-arrays",
    moduleId: "pointers",
    title: "Pointers, arrays and functions",
    minutes: 20,
    concepts: ["pointer arithmetic", "array decay", "begin/end pointers", "const pointer"],
    goals: [
      "Why an array name behaves like a pointer to its first element",
      "Moving through memory with pointer arithmetic (`p + 1`, `p++`)",
      "Passing a range to a function as a begin and an end pointer",
    ],
    intro: `In Arrays you learned that a function receiving an array really gets an address. Now you can see exactly what that means — and walk an array with a pointer instead of an index. This is how the STL's iterators work, so it pays off later.`,
    sections: [
      {
        title: "An array name is the address of its first element",
        body: `\`\`\`cpp
int a[5] = {10, 20, 30, 40, 50};
int* p = a;          // same as &a[0]
cout << *p;          // 10
\`\`\`

When you use \`a\` in an expression, it **decays** to a pointer to \`a[0]\`. That's why passing \`a\` to \`void f(int* data)\` works.`,
      },
      {
        title: "Pointer arithmetic",
        body: `Adding 1 to a pointer moves it to the **next element**, not the next byte — C++ scales by the element size:

\`\`\`cpp
cout << *(p + 2);    // 30  (two elements on)
p++;                 // now points at a[1]
cout << *p;          // 20
\`\`\`

In fact \`a[i]\` is defined as \`*(a + i)\`. Subtracting two pointers into the same array gives the number of elements between them.`,
      },
      {
        title: "Ranges: begin and end",
        body: `A common way to describe part of an array is a **half-open range**: a pointer to the first element and a pointer **one past** the last.

\`\`\`cpp
int sum(const int* begin, const int* end) {
    int s = 0;
    for (const int* it = begin; it != end; ++it) {
        s += *it;
    }
    return s;
}

sum(a, a + 5);       // the whole array
sum(a + 1, a + 3);   // just a[1] and a[2]
\`\`\`

\`end\` itself is never dereferenced — it only marks where to stop. \`const int*\` means "I won't change the values through this pointer".`,
      },
    ],
    mistakes: [
      { title: "Dereferencing the end pointer", body: "In a half-open range `[begin, end)`, `end` is one past the last element. `*end` reads outside the array." },
      { title: "Walking past the array", body: "Pointer arithmetic isn't checked. `p + 10` on a 5-element array is out of bounds, just like `a[10]`." },
      { title: "Confusing *p++ and (*p)++", body: "`*p++` reads the value and then moves the pointer. `(*p)++` increases the value and leaves the pointer where it is." },
    ],
    example: {
      title: "Walking an array with a pointer",
      intro: "Index and pointer access side by side, then a sum over a sub-range.",
      code: r`#include <iostream>
using namespace std;

int sumRange(const int* begin, const int* end) {
    int s = 0;
    for (const int* it = begin; it != end; ++it) {
        s += *it;
    }
    return s;
}

int main() {
    int a[5] = {10, 20, 30, 40, 50};
    int* p = a;
    cout << *p << " " << *(p + 2) << " " << a[2] << endl;
    p++;
    cout << *p << endl;
    cout << "elements from p to the end: " << (a + 5) - p << endl;
    cout << "sum of all: " << sumRange(a, a + 5) << endl;
    cout << "sum of a[1..2]: " << sumRange(a + 1, a + 3) << endl;
    return 0;
}`,
      output: "10 30 30\n20\nelements from p to the end: 4\nsum of all: 150\nsum of a[1..2]: 50\n",
      notes: [
        { line: 6, text: "`it` walks from `begin` up to — but not including — `end`." },
        { line: 15, text: "`*(p + 2)` and `a[2]` are the same element." },
        { line: 18, text: "Pointer subtraction counts elements: 5 − 1 = 4." },
        { line: 20, text: "`a + 1` to `a + 3` covers `a[1]` and `a[2]`: 20 + 30." },
      ],
    },
    quickCheck: {
      prompt: "With `int a[4] = {5, 6, 7, 8}; int* p = a + 1;`, what is `*(p + 2)`?",
      options: [
        { id: "a", text: "7", feedback: "`p` already starts at `a[1]`, so two more steps reach `a[3]`." },
        { id: "b", text: "8", feedback: "Yes: `p` is at index 1, `p + 2` is index 3, which holds 8." },
        { id: "c", text: "Out of bounds", feedback: "Index 3 is the last valid element of a 4-element array." },
      ],
      correct: "b",
      explanation: "`a + 1` points at index 1. Adding 2 moves to index 3: `*(a + 3)` is 8.",
    },
    exercise: {
      title: "Reverse a range in place",
      prompt: `Complete \`void reverseRange(int* begin, int* end)\` so it reverses the elements in the half-open range \`[begin, end)\` **using pointers** (no indexes needed).

Input: \`n k\`, then \`n\` numbers. \`main\` calls \`reverseRange(a, a + k)\` — reversing only the first \`k\` elements — and prints the whole array.`,
      starterCode: r`#include <iostream>
using namespace std;

void reverseRange(int* begin, int* end) {
    // Swap elements from both ends of [begin, end) moving inwards.
}

int main() {
    int n, k;
    cin >> n >> k;
    int a[100];
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }
    reverseRange(a, a + k);
    for (int i = 0; i < n; i++) {
        cout << a[i] << " ";
    }
    cout << endl;
    return 0;
}`,
      tests: [
        { label: "first 3 of 5", input: "5 3\n1 2 3 4 5\n", output: "3 2 1 4 5", visibility: "sample", category: "normal" },
        { label: "whole array", input: "4 4\n9 8 7 6\n", output: "6 7 8 9", visibility: "sample", category: "normal" },
        { label: "k = 0", input: "3 0\n1 2 3\n", output: "1 2 3", visibility: "hidden", category: "edge" },
        { label: "k = 1", input: "3 1\n4 5 6\n", output: "4 5 6", visibility: "hidden", category: "boundary" },
        { label: "even length", input: "6 6\n1 2 3 4 5 6\n", output: "6 5 4 3 2 1", visibility: "hidden", category: "normal" },
      ],
      compare: "tokens",
      hints: [
        "Which two elements swap first, and where are they relative to `begin` and `end`?",
        "The first swap is `*begin` with the element just **before** `end` — `end` itself is one past the range.",
        "Make `end` point at the last element first (`--end`), then swap and move both pointers inwards while `begin < end`.",
        "`if (begin == end) return; --end; while (begin < end) { int t = *begin; *begin = *end; *end = t; ++begin; --end; }`",
      ],
      solution: r`#include <iostream>
using namespace std;

void reverseRange(int* begin, int* end) {
    if (begin == end) {
        return;
    }
    --end;
    while (begin < end) {
        int t = *begin;
        *begin = *end;
        *end = t;
        ++begin;
        --end;
    }
}

int main() {
    int n, k;
    cin >> n >> k;
    int a[100];
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }
    reverseRange(a, a + k);
    for (int i = 0; i < n; i++) {
        cout << a[i] << " ";
    }
    cout << endl;
    return 0;
}`,
      solutionNotes: "This is the two-pointer reverse from Strings, written with pointers instead of indexes. Stepping `end` back once first turns \"one past the end\" into \"the last element\"; the empty-range check avoids stepping before `begin`.",
    },
    explainAgain: `Picture the array as numbered parking spaces in a row. A pointer is your finger on one space. \`p + 2\` is "two spaces further along"; \`p++\` slides your finger to the next space.

A range \`[begin, end)\` is two fingers: one on the first car, one on the **empty space just after** the last car. You stop when the moving finger reaches the second one.`,
    summary: [
      "An array name decays to a pointer to its first element; `a[i]` is `*(a + i)`.",
      "Pointer arithmetic moves by whole elements; subtracting pointers counts elements.",
      "A half-open range `[begin, end)` never dereferences `end`.",
    ],
  },

  {
    id: "dynamic-memory",
    moduleId: "pointers",
    title: "Dynamic memory: new, delete and smart pointers",
    minutes: 25,
    concepts: ["stack", "heap", "new", "delete", "memory leak", "dangling pointer", "unique_ptr"],
    goals: [
      "The difference between stack (automatic) and heap (dynamic) memory",
      "Allocating with `new`/`new[]` and releasing with `delete`/`delete[]`",
      "Avoiding leaks and dangling pointers — and letting `unique_ptr` or `vector` do it for you",
    ],
    intro: `Local variables appear and disappear automatically with their block — that memory is the **stack**. Sometimes you need memory whose size is only known at run time, or that must outlive the function that created it. That comes from the **heap**, and with it comes a responsibility: giving it back.`,
    sections: [
      {
        title: "new and delete",
        body: `\`\`\`cpp
int* one = new int(7);       // one int on the heap, value 7
delete one;                  // give it back

int n;
cin >> n;
int* arr = new int[n];       // n ints, size chosen at run time
arr[0] = 1;                  // used like an array
delete[] arr;                // arrays need delete[]
\`\`\`

Every \`new\` needs exactly one matching \`delete\`, and every \`new[]\` exactly one \`delete[]\`.`,
      },
      {
        title: "Leaks and dangling pointers",
        body: `Two classic bugs:

- **Memory leak** — losing the last pointer to heap memory without deleting it. The memory stays reserved until the program ends. In a long-running program, leaks pile up.
- **Dangling pointer** — using a pointer after its memory was deleted. The memory may already be reused; reading or writing it is undefined behaviour.

\`\`\`cpp
int* p = new int(5);
delete p;
p = nullptr;   // good habit: a deleted pointer shouldn't look valid
\`\`\`

Deleting the same memory twice (**double delete**) is also undefined behaviour.`,
      },
      {
        title: "Let the library own it: unique_ptr and vector",
        body: `Modern C++ rarely writes \`delete\` by hand. A **smart pointer** deletes its object automatically when it goes out of scope:

\`\`\`cpp
#include <memory>

unique_ptr<int> box = make_unique<int>(42);
cout << *box;                // 42
// no delete: box frees the int at the end of its scope
\`\`\`

For a run-time-sized array, \`vector<int> v(n);\` is almost always the better choice than \`new int[n]\`. This idea — an object that owns a resource and releases it in its destructor — is called **RAII** (Module 16).`,
      },
    ],
    mistakes: [
      { title: "delete instead of delete[]", body: "Memory from `new int[n]` must be released with `delete[]`. Mixing them up is undefined behaviour." },
      { title: "Returning the address of a local", body: "`int* f() { int x = 5; return &x; }` returns a pointer to a variable that no longer exists once `f` returns — a dangling pointer." },
      { title: "Forgetting delete on an early return", body: "If a function can `return` before reaching `delete`, the memory leaks. This is exactly what `unique_ptr` and `vector` prevent." },
    ],
    example: {
      title: "Heap array, then a smart pointer",
      intro: "A run-time-sized array is filled, printed and released; then `unique_ptr` cleans up by itself.",
      code: r`#include <iostream>
#include <memory>
using namespace std;

int main() {
    int n = 4;
    int* squares = new int[n];
    for (int i = 0; i < n; i++) {
        squares[i] = (i + 1) * (i + 1);
    }
    for (int i = 0; i < n; i++) {
        cout << squares[i] << " ";
    }
    cout << endl;
    delete[] squares;
    squares = nullptr;

    unique_ptr<int> box = make_unique<int>(42);
    *box += 1;
    cout << "box holds " << *box << endl;
    return 0;
}`,
      output: "1 4 9 16 \nbox holds 43\n",
      notes: [
        { line: 7, text: "`new int[n]`: an array whose size could come from input." },
        { line: 15, text: "`new[]` is paired with `delete[]`." },
        { line: 16, text: "Clearing the pointer so it can't be used by mistake." },
        { line: 18, text: "`unique_ptr` owns the int and deletes it automatically." },
      ],
    },
    quickCheck: {
      prompt: "What is wrong with this function?",
      code: r`void report(int n) {
    int* data = new int[n];
    if (n > 100) {
        return;
    }
    // ... use data ...
    delete[] data;
}`,
      options: [
        { id: "a", text: "Nothing — the memory is deleted at the end", feedback: "Look at what happens when `n > 100`." },
        { id: "b", text: "It leaks memory when n > 100", feedback: "Right: the early `return` skips `delete[]`. A `vector<int> data(n);` would never leak." },
        { id: "c", text: "It should use delete, not delete[]", feedback: "`new int[n]` must be paired with `delete[]` — that part is correct." },
      ],
      correct: "b",
      explanation: "Every path out of the function must release the memory. Early returns are the classic leak; RAII types like `vector` and `unique_ptr` make it automatic.",
    },
    exercise: {
      title: "Running totals on the heap",
      prompt: `Read \`n\` (1 ≤ n ≤ 1000) and then \`n\` whole numbers. Store them in an array allocated with \`new int[n]\`, build a second heap array where element \`i\` is the sum of the first \`i + 1\` numbers (a **running total**), print the running totals separated by spaces, and release **both** arrays with \`delete[]\`.

(The checker can only see your output — releasing the memory is your job as the programmer.)`,
      starterCode: r`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    // 1. Allocate an int array of size n with new and read the numbers into it.
    // 2. Allocate a second array for the running totals and fill it.
    // 3. Print the totals, then delete[] both arrays.

    return 0;
}`,
      tests: [
        { label: "1 2 3 4", input: "4\n1 2 3 4\n", output: "1 3 6 10", visibility: "sample", category: "normal" },
        { label: "single", input: "1\n9\n", output: "9", visibility: "sample", category: "boundary" },
        { label: "negatives", input: "5\n5 -2 -3 10 0\n", output: "5 3 0 10 10", visibility: "hidden", category: "edge" },
        { label: "all zeros", input: "3\n0 0 0\n", output: "0 0 0", visibility: "hidden", category: "edge" },
      ],
      compare: "tokens",
      hints: [
        "Why can't you just write `int a[n];` here in standard C++?",
        "Array sizes must be known at compile time in standard C++; `new int[n]` asks for the memory at run time.",
        "Running total: `total[0] = data[0]`, and `total[i] = total[i - 1] + data[i]` for the rest.",
        "`int* data = new int[n]; int* total = new int[n];` … fill, print … then `delete[] data; delete[] total;` before `return 0;`.",
      ],
      solution: r`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int* data = new int[n];
    for (int i = 0; i < n; i++) {
        cin >> data[i];
    }
    int* total = new int[n];
    total[0] = data[0];
    for (int i = 1; i < n; i++) {
        total[i] = total[i - 1] + data[i];
    }
    for (int i = 0; i < n; i++) {
        cout << total[i] << " ";
    }
    cout << endl;
    delete[] data;
    delete[] total;
    return 0;
}`,
      solutionNotes: "Two `new[]` allocations, two matching `delete[]`s. In real code you'd write `vector<int> data(n), total(n);` and let the vectors free themselves — this exercise is about seeing what they do for you.",
    },
    explainAgain: `Stack memory is like a hotel room that's cleaned automatically when you check out (leave the block). Heap memory is like renting a storage unit: it stays yours until **you** hand back the key with \`delete\`.

Lose the key without returning the unit and you've got a leak — you keep paying for space you can't use. Use the key after returning the unit and you're opening someone else's storage: a dangling pointer. A \`unique_ptr\` is a key that returns itself when you leave.`,
    summary: [
      "Heap memory from `new` / `new[]` must be released with `delete` / `delete[]` exactly once.",
      "Leaks lose memory; dangling pointers use memory that's already gone.",
      "Prefer `vector` and `unique_ptr` — they release memory automatically (RAII).",
    ],
  },
];
