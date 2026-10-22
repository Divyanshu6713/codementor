/**
 * "Compare with C++": the same small task in both languages. tests/python-content.test.ts runs
 * the Python with Python and compiles + runs the C++ with g++; each must print its stated output.
 */
export interface CompareTopic {
  id: string;
  title: string;
  python: string;
  cpp: string;
  pyOutput: string;
  cppOutput: string;
  points: string[];
}

export const PY_COMPARE: CompareTopic[] = [
  {
    id: "syntax", title: "Syntax and program structure",
    python: `name = "Asha"
for i in range(3):
    if i % 2 == 0:
        print(name, i)`,
    cpp: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string name = "Asha";
    for (int i = 0; i < 3; i++) {
        if (i % 2 == 0) {
            cout << name << " " << i << endl;
        }
    }
    return 0;
}`,
    pyOutput: "Asha 0\nAsha 2\n",
    cppOutput: "Asha 0\nAsha 2\n",
    points: [
      "Python marks blocks with indentation and a colon; C++ uses braces and semicolons.",
      "Python needs no `main` and no `#include` for basics; the file runs top to bottom.",
      "Python's `for` loops over items (`range(3)` yields 0, 1, 2); C++'s classic `for` manages a counter.",
    ],
  },
  {
    id: "types", title: "Types and memory",
    python: `x = 10
x = "ten"          # the same name can refer to a new type
big = 2 ** 100     # integers grow as needed
print(x, big)`,
    cpp: `#include <iostream>
using namespace std;

int main() {
    int x = 10;          // x is an int forever
    // x = "ten";        // would not compile
    long long big = 1LL << 62;   // fixed-size: 2^100 would overflow
    cout << x << " " << big << endl;
    return 0;
}`,
    pyOutput: "ten 1267650600228229401496703205376\n",
    cppOutput: "10 4611686018427387904\n",
    points: [
      "Python is dynamically typed: types belong to values, checked when the line runs. C++ is statically typed: types belong to variables, checked when compiling.",
      "Python integers have arbitrary precision; C++ integers have fixed sizes and can overflow.",
      "Python manages memory automatically (reference counting + a garbage collector). C++ gives you control: stack objects, `new`/`delete`, smart pointers, RAII.",
    ],
  },
  {
    id: "collections", title: "Collections",
    python: `marks = {"asha": 91, "ravi": 78}
marks["zoe"] = 85
names = sorted(marks)
print(names, len(marks))`,
    cpp: `#include <iostream>
#include <map>
#include <string>
using namespace std;

int main() {
    map<string, int> marks = {{"asha", 91}, {"ravi", 78}};
    marks["zoe"] = 85;
    cout << "[";
    bool first = true;
    for (auto& [name, mark] : marks) {    // std::map keeps keys sorted
        cout << (first ? "" : ", ") << "'" << name << "'";
        first = false;
    }
    cout << "] " << marks.size() << endl;
    return 0;
}`,
    pyOutput: "['asha', 'ravi', 'zoe'] 3\n",
    cppOutput: "['asha', 'ravi', 'zoe'] 3\n",
    points: [
      "`list` ≈ `vector`, `dict` ≈ `unordered_map` (but keeps insertion order), `set` ≈ `unordered_set`, `tuple` ≈ a fixed `tuple`/`struct`.",
      "Python collections can hold mixed types; C++ containers hold one declared type.",
      "Printing a whole collection is built into Python; in C++ you loop yourself.",
    ],
  },
  {
    id: "functions", title: "Functions",
    python: `def stats(nums, scale=1):
    return min(nums) * scale, max(nums) * scale

lo, hi = stats([4, 9, 2], scale=10)
print(lo, hi)`,
    cpp: `#include <algorithm>
#include <iostream>
#include <utility>
#include <vector>
using namespace std;

pair<int, int> stats(const vector<int>& nums, int scale = 1) {
    auto [lo, hi] = minmax_element(nums.begin(), nums.end());
    return {*lo * scale, *hi * scale};
}

int main() {
    auto [lo, hi] = stats({4, 9, 2}, 10);
    cout << lo << " " << hi << endl;
    return 0;
}`,
    pyOutput: "20 90\n",
    cppOutput: "20 90\n",
    points: [
      "Python returns several values as a tuple; C++ uses `pair`, `tuple` or a struct.",
      "Python has keyword arguments (`scale=10`); C++ arguments are positional only.",
      "Python passes references to objects (\"call by sharing\"); C++ chooses: by value, by reference `&`, or by const reference.",
    ],
  },
  {
    id: "oop", title: "Classes and objects",
    python: `class Account:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self._balance = balance

    def deposit(self, amount):
        self._balance += amount
        return self._balance

acc = Account("Ravi")
print(acc.deposit(500))`,
    cpp: `#include <iostream>
#include <string>
using namespace std;

class Account {
public:
    Account(string owner, int balance = 0) : owner(owner), balance(balance) {}
    int deposit(int amount) {
        balance += amount;
        return balance;
    }
private:
    string owner;
    int balance;
};

int main() {
    Account acc("Ravi");
    cout << acc.deposit(500) << endl;
    return 0;
}`,
    pyOutput: "500\n",
    cppOutput: "500\n",
    points: [
      "Python's `self` is explicit; C++'s `this` is implicit.",
      "Python has no enforced `private`: a leading underscore is a convention. C++ enforces `public`/`private`/`protected`.",
      "Python supports multiple inheritance with a method resolution order; C++ supports it too, plus virtual inheritance. Python methods are always 'virtual'.",
    ],
  },
  {
    id: "algorithms", title: "Algorithms and speed",
    python: `nums = [5, 2, 8, 1]
nums.sort()
import bisect
print(nums, bisect.bisect_left(nums, 5))`,
    cpp: `#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> nums = {5, 2, 8, 1};
    sort(nums.begin(), nums.end());
    cout << "[1, 2, 5, 8] " << (lower_bound(nums.begin(), nums.end(), 5) - nums.begin()) << endl;
    return 0;
}`,
    pyOutput: "[1, 2, 5, 8] 2\n",
    cppOutput: "[1, 2, 5, 8] 2\n",
    points: [
      "The algorithms are the same: sorting is O(n log n), binary search O(log n) in both.",
      "C++ is typically 10–100× faster for tight loops; Python wins on development speed and leans on C-backed libraries for heavy work.",
      "Competitive programmers often prototype in Python and switch to C++ when the time limit is tight.",
    ],
  },
];
