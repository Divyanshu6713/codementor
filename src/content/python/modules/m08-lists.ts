import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 8 — Lists. */
export const M08: PyModuleDef = {
  id: "py-lists",
  number: 8,
  level: 2,
  title: "Lists",
  summary: "Creating, indexing, slicing, updating and deleting; list methods; sorting with sort(), sorted() and key; nested lists and matrices; copying, aliasing, shallow vs deep copies; comprehensions; two-pointer and sliding-window ideas; common pitfalls.",
  track: "core",
  prereqs: ["py-strings"],
  lessons: [
    {
      id: "py-lists-basics",
      title: "Creating, indexing and changing lists",
      minutes: 16,
      difficulty: 2,
      objectives: [
        "Create lists and read items with indexes and slices",
        "Change, add and delete items",
        "Loop over a list and build a new one",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 1,
        prompt: "`nums = [4, 8, 15]`. What is `nums[-1]`?",
        options: [
          { text: "4", why: "That's `nums[0]`." },
          { text: "15", why: "Correct — the last item." },
          { text: "An error", why: "Negative indexes are allowed." },
        ],
        answer: 1,
        hint: "Lists index like strings.",
        explain: "Lists use the same indexing as strings: -1 is the last item.",
      },
      why: "Lists hold collections: marks of a class, items in a cart, readings from a sensor. Unlike strings they can be changed — grown, shrunk, edited — which makes them Python's everyday container.",
      concept: [
        {
          title: "Creating and reading",
          body: `\`\`\`python
marks = [78, 91, 64]
mixed = ["Asha", 15, True]     # any types
empty = []
nums = list(range(5))          # [0, 1, 2, 3, 4]
marks[0], marks[-1], marks[1:]  # 78, 64, [91, 64]
len(marks)                      # 3
\`\`\`

Indexing and slicing work exactly like strings; a slice of a list is a new list.`,
        },
        {
          title: "Changing lists",
          body: `Lists are **mutable**:

\`\`\`python
marks[1] = 95           # replace an item
marks.append(70)        # add to the end
marks.insert(0, 50)     # add at a position
del marks[2]            # delete by position
marks.remove(70)        # delete the first matching value
last = marks.pop()      # remove and return the last item
marks[1:3] = [1, 2, 3]  # replace a slice (can change the length)
\`\`\``,
        },
        {
          title: "Looping and building",
          body: `\`\`\`python
doubled = []
for m in marks:
    doubled.append(m * 2)
\`\`\`

\`+\` joins lists into a **new** list; \`*\` repeats; \`in\` tests membership; \`min\`, \`max\`, \`sum\` work on numbers.`,
        },
      ],
      example: {
        title: "A shopping list",
        code: r`cart = ["rice", "dal", "milk"]
cart.append("eggs")
cart.insert(1, "salt")
cart[3] = "curd"
removed = cart.pop(0)
print(cart, removed, len(cart))
print("dal" in cart, cart[1:3], cart + ["tea"])
prices = [60, 35, 120]
print(sum(prices), max(prices), min(prices))`,
        output: "['salt', 'dal', 'curd', 'eggs'] rice 4\nTrue ['dal', 'curd'] ['salt', 'dal', 'curd', 'eggs', 'tea']\n215 120 35\n",
        lines: [
          [2, "append adds to the end: rice, dal, milk, eggs."],
          [3, "insert(1, …) puts salt at index 1, shifting the rest right."],
          [4, "Index 3 is now milk; replace it with curd."],
          [5, "pop(0) removes and returns the first item, rice."],
          [7, "Membership, a slice, and `+` (which makes a new list)."],
          [9, "Built-ins for number lists."],
        ],
      },
      mistakes: [
        { title: "Index out of range", body: "The last valid index is `len(lst) - 1`. Appending uses `append`, not `lst[len(lst)] = x`." },
        { title: "`remove` with a value that's not there", body: "Raises ValueError. Check `if x in lst:` first." },
        { title: "Expecting append to return the list", body: "`lst = lst.append(3)` sets lst to None. append changes the list in place and returns None." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 2,
          code: r`a = [1, 2, 3, 4, 5]
a[1:3] = [9]
a.append(a.pop(0))
print(a, len(a))`,
          answer: "[9, 4, 5, 1] 4\n",
          hint: "Replacing a 2-item slice with 1 item shrinks the list.",
          explain: "After the slice assignment a is [1, 9, 4, 5]; pop(0) removes 1 and append adds it at the end.",
        },
        {
          id: "f1", kind: "fill", difficulty: 1,
          prompt: "Add 40 to the end of the list.",
          code: r`scores = [10, 20, 30]
scores.___(40)
print(scores)`,
          blanks: [["append"]],
          output: "[10, 20, 30, 40]\n",
          hint: "The method that adds one item at the end.",
          explain: "`append` adds a single item to the end of the list.",
        },
        {
          id: "b1", kind: "bug", difficulty: 2,
          prompt: "This should print `[1, 2, 3]` but prints `None`. Which line?",
          code: r`nums = [1, 2]
nums = nums.append(3)
print(nums)`,
          line: 2,
          fix: r`nums = [1, 2]
nums.append(3)
print(nums)`,
          output: "[1, 2, 3]\n",
          hint: "What does append return?",
          explain: "`append` modifies the list and returns None; assigning that result replaces the list with None.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 2,
          prompt: "Which removes the item **at index 2**?",
          options: [
            { text: "`lst.remove(2)`", why: "remove deletes the first item *equal to* 2." },
            { text: "`del lst[2]` or `lst.pop(2)`", why: "Correct — both remove by position." },
            { text: "`lst[2] = None`", why: "That replaces it; the list keeps its length." },
          ],
          answer: 1,
          hint: "remove works by value, not position.",
          explain: "`del lst[i]` and `lst.pop(i)` remove by position; `remove(x)` removes by value.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Keep the passing marks", difficulty: 2,
          prompt: `Read a line of marks. Build a **new list** of the marks that are 40 or more, and print it, then its length and its average (1 decimal). If no one passed print \`none passed\`:

\`\`\`
[72, 40, 88]
3
66.7
\`\`\``,
          starter: r`marks = [int(x) for x in input().split()]
passed = []
`,
          tests: [
            { label: "Mixed", input: "72 35 40 88 12\n", output: "[72, 40, 88]\n3\n66.7" },
            { label: "Nobody", input: "10 20\n", output: "none passed", category: "edge" },
            { label: "Everybody", input: "50 60\n", output: "[50, 60]\n2\n55.0", hidden: true },
          ],
          hints: [
            "Loop over marks and decide for each one.",
            "Use `passed.append(m)` when `m >= 40`.",
            "Check for an empty list before dividing.",
            "`if passed: print(passed); print(len(passed)); print(round(sum(passed) / len(passed), 1))` else print the message.",
          ],
          solution: r`marks = [int(x) for x in input().split()]
passed = []
for m in marks:
    if m >= 40:
        passed.append(m)
if passed:
    print(passed)
    print(len(passed))
    print(round(sum(passed) / len(passed), 1))
else:
    print("none passed")`,
          notes: "Building a new list (filtering) is safer than deleting from the list you're looping over. An empty list is falsy — and checking it avoids dividing by zero.",
        },
        {
          id: "stretch", kind: "task", title: "Rotate a list", difficulty: 3,
          prompt: `Read a line of words and a number k. Rotate the list **right** by k positions (the last k words move to the front) and print it joined with spaces. k may be larger than the number of words.`,
          starter: r`words = input().split()
k = int(input())
`,
          tests: [
            { label: "k = 2", input: "a b c d e\n2\n", output: "d e a b c" },
            { label: "k = 0", input: "x y z\n0\n", output: "x y z", category: "boundary" },
            { label: "k larger than length", input: "1 2 3\n7\n", output: "3 1 2", hidden: true, category: "edge" },
            { label: "k equals length", input: "p q\n2\n", output: "p q", hidden: true, category: "boundary" },
          ],
          hints: [
            "Rotating by the length gives the same list — so reduce k first.",
            "`k = k % len(words)`.",
            "The result is the last k items followed by the rest.",
            "`rotated = words[-k:] + words[:-k]` — but careful when k is 0 (`words[-0:]` is the whole list!). Use `words[len(words) - k:] + words[:len(words) - k]`.",
          ],
          solution: r`words = input().split()
k = int(input())
n = len(words)
k = k % n
rotated = words[n - k:] + words[:n - k]
print(" ".join(rotated))`,
          notes: "Slicing with `n - k` avoids the `-0` trap: `words[-0:]` is the whole list because -0 == 0. Using `% n` handles k bigger than the list.",
        },
      ],
      realWorld: "Lists hold rows from a CSV, results from a database query, the moves in a game, the files in a folder — almost every collection of data passes through a list at some point.",
      reteach: "A list is a numbered row of lockers that you're allowed to rearrange: open a locker by number (index), swap its contents (assign), add lockers at the end (append) or in the middle (insert), or remove them (pop, del, remove). A string is the same row, but welded shut.",
      summary: [
        "Lists are ordered, mutable and can hold any types; index and slice like strings.",
        "Change them with assignment, append, insert, pop, remove, del and slice assignment.",
        "Methods like append change the list in place and return None.",
      ],
      cpp: {
        python: r`v = [1, 2]
v.append(3)
print(len(v))`,
        cpp: r`vector<int> v = {1, 2};
v.push_back(3);
cout << v.size();`,
        note: "A Python list is like C++'s `vector`, but can hold mixed types and does bounds checking (IndexError instead of undefined behaviour).",
      },
    },

    {
      id: "py-list-methods-sorting",
      title: "List methods and sorting",
      minutes: 16,
      difficulty: 2,
      objectives: [
        "Use `extend`, `index`, `count`, `reverse`, `clear`",
        "Sort with `list.sort()` and `sorted()`, ascending and descending",
        "Sort by a custom rule with `key=`",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "What's the difference between `lst.sort()` and `sorted(lst)`?",
        options: [
          { text: "None", why: "They differ in what they change and return." },
          { text: "`sort()` changes the list and returns None; `sorted()` returns a new sorted list", why: "Correct." },
          { text: "`sorted()` only works on numbers", why: "Both sort anything comparable." },
        ],
        answer: 1,
        hint: "One is a method, one is a built-in function.",
        explain: "`lst.sort()` sorts in place (returns None); `sorted(x)` works on any iterable and returns a new list.",
      },
      why: "Sorting is one of the most common operations in computing: leaderboards, alphabetical lists, cheapest-first products, timelines. Custom sort keys let you sort by anything — length, a column, a computed score.",
      concept: [
        {
          title: "More list methods",
          body: `| Method | Does |
| --- | --- |
| \`a.extend([4, 5])\` | add each item (vs append, which adds the list as one item) |
| \`a.index(x)\` | position of the first x (ValueError if missing) |
| \`a.count(x)\` | how many times x appears |
| \`a.reverse()\` | reverse in place |
| \`a.clear()\` | remove everything |`,
        },
        {
          title: "sort and sorted",
          body: `\`\`\`python
nums = [5, 2, 9]
nums.sort()                  # nums is now [2, 5, 9]
nums.sort(reverse=True)      # [9, 5, 2]
names = sorted(["zoe", "Asha", "ravi"])   # ['Asha', 'ravi', 'zoe'] (capitals first!)
\`\`\`

Python's sort is **stable**: items that compare equal keep their original order.`,
        },
        {
          title: "Sorting with key=",
          body: `\`key\` is a function applied to each item; the list is sorted by the results:

\`\`\`python
sorted(names, key=str.lower)          # case-insensitive
sorted(words, key=len)                # shortest first
students = [("Asha", 91), ("Ravi", 78)]
sorted(students, key=lambda s: s[1], reverse=True)   # by marks, highest first
\`\`\`

\`lambda s: s[1]\` is a tiny inline function (Module 18). For a tie-breaker, return a tuple: \`key=lambda s: (-s[1], s[0])\` = marks descending, then name ascending.`,
        },
      ],
      example: {
        title: "A leaderboard",
        code: r`scores = [("Asha", 91), ("ravi", 78), ("Zoe", 91), ("Dev", 85)]
by_score = sorted(scores, key=lambda s: (-s[1], s[0].lower()))
for rank, (name, pts) in enumerate(by_score, start=1):
    print(rank, name, pts)
words = ["kiwi", "fig", "banana", "apple"]
words.sort(key=len)
print(words)
a = [1, 2]
a.extend([3, 4])
a.append([5, 6])
print(a, a.index(3), a.count(2))`,
        output: "1 Asha 91\n2 Zoe 91\n3 Dev 85\n4 ravi 78\n['fig', 'kiwi', 'apple', 'banana']\n[1, 2, 3, 4, [5, 6]] 2 1\n",
        lines: [
          [2, "Key: negative score (so higher comes first), then lower-cased name to break ties."],
          [3, "enumerate numbers the ranks from 1 (Module 13)."],
          [6, "Sort by length; kiwi and apple keep their order relative to equal-length words (stable)."],
          [9, "extend adds 3 and 4 as separate items…"],
          [10, "…append adds the whole list [5, 6] as one item."],
        ],
      },
      mistakes: [
        { title: "`x = lst.sort()`", body: "sort returns None. Use `x = sorted(lst)` or sort first, then use lst." },
        { title: "append vs extend", body: "`a.append([1, 2])` adds one item (a list); `a.extend([1, 2])` adds two items." },
        { title: "Case-sensitive sorting surprises", body: "Capital letters sort before lower-case ones. Use `key=str.lower` for human ordering." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 2,
          code: r`a = [3, 1, 2]
b = sorted(a)
c = a.sort()
print(a, b, c)`,
          answer: "[1, 2, 3] [1, 2, 3] None\n",
          hint: "What does each one return, and what does each one change?",
          explain: "sorted returns a new sorted list; a.sort() sorts a in place and returns None.",
        },
        {
          id: "p2", kind: "predict", difficulty: 3,
          code: r`w = ["pear", "Fig", "apple", "date"]
print(sorted(w))
print(sorted(w, key=str.lower))
print(sorted(w, key=len, reverse=True))`,
          answer: "['Fig', 'apple', 'date', 'pear']\n['apple', 'date', 'Fig', 'pear']\n['apple', 'pear', 'date', 'Fig']\n",
          hint: "Capitals come first; the sort is stable.",
          explain: "Plain sort puts 'Fig' first (capital F). key=str.lower sorts alphabetically. By length descending: apple (5), then pear and date (4, original order), then Fig (3).",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Sort the words from longest to shortest.",
          code: r`words = ["a", "abc", "ab"]
print(sorted(words, key=___, reverse=___))`,
          blanks: [["len"], ["True"]],
          output: "['abc', 'ab', 'a']\n",
          hint: "Sort by length, in reverse.",
          explain: "`key=len` sorts by length; `reverse=True` puts the longest first.",
        },
        {
          id: "b1", kind: "bug", difficulty: 2,
          prompt: "This should print `[1, 2, 3, 4]` but crashes. Which line?",
          code: r`nums = [4, 1, 3, 2]
ordered = nums.sort()
print(ordered[0:4])`,
          line: 2,
          fix: r`nums = [4, 1, 3, 2]
ordered = sorted(nums)
print(ordered[0:4])`,
          output: "[1, 2, 3, 4]\n",
          hint: "What value does `nums.sort()` give back?",
          explain: "`sort()` returns None, so `ordered[0:4]` fails. Use `sorted(nums)` to get a new list.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Top three", difficulty: 2,
          prompt: `Read a line of scores. Print the **three highest** scores, highest first, separated by spaces. If there are fewer than three scores, print all of them sorted highest first.`,
          starter: r`scores = [int(x) for x in input().split()]
`,
          tests: [
            { label: "Six scores", input: "45 88 72 91 60 88\n", output: "91 88 88" },
            { label: "Two scores", input: "5 9\n", output: "9 5", category: "edge" },
            { label: "Negatives", input: "-1 -5 -3 -2\n", output: "-1 -2 -3", hidden: true },
          ],
          hints: [
            "Sort descending, then take the first three.",
            "`sorted(scores, reverse=True)[:3]`.",
            "Slicing past the end is safe, so fewer than 3 works automatically.",
            "`print(\" \".join(str(s) for s in top))`.",
          ],
          solution: r`scores = [int(x) for x in input().split()]
top = sorted(scores, reverse=True)[:3]
print(" ".join(str(s) for s in top))`,
          notes: "Slices never raise IndexError, so `[:3]` on a 2-item list just gives both. (For huge lists, `heapq.nlargest(3, scores)` avoids a full sort — Module 21.)",
        },
        {
          id: "stretch", kind: "task", title: "Sort students by marks then name", difficulty: 3,
          prompt: `Read n, then n lines of \`name marks\`. Print the students sorted by marks **highest first**; students with equal marks in **alphabetical** order (ignoring case). Format: \`name marks\`.`,
          starter: r`n = int(input())
students = []
for _ in range(n):
    name, marks = input().split()
    students.append((name, int(marks)))
`,
          tests: [
            { label: "Ties", input: "4\nravi 80\nAsha 92\nzoe 80\nDev 75\n", output: "Asha 92\nravi 80\nzoe 80\nDev 75" },
            { label: "Case-insensitive tie", input: "2\nbob 50\nAmy 50\n", output: "Amy 50\nbob 50", hidden: true, category: "edge" },
            { label: "One student", input: "1\nKim 10\n", output: "Kim 10", hidden: true, category: "boundary" },
          ],
          hints: [
            "Sort by two things: marks (descending) and name (ascending).",
            "A key function can return a tuple; tuples compare item by item.",
            "Negate the marks to get descending order inside an ascending sort.",
            "`students.sort(key=lambda s: (-s[1], s[0].lower()))`.",
          ],
          solution: r`n = int(input())
students = []
for _ in range(n):
    name, marks = input().split()
    students.append((name, int(marks)))
students.sort(key=lambda s: (-s[1], s[0].lower()))
for name, marks in students:
    print(name, marks)`,
          notes: "Tuple keys sort by the first item, then the second for ties. Negating a number reverses its order without needing `reverse=True` for the whole sort.",
        },
      ],
      realWorld: "Every ranking — search results, leaderboards, cheapest flights, newest posts — is a sort with a key. Python's built-in sort (Timsort) is used across the industry and also powers Java's object sorting.",
      reteach: "`sort` rearranges the books on your own shelf; `sorted` gives you a new shelf with the books in order and leaves yours alone. A `key` is the label you sort by — the book's height, its author, its price — written on a sticky note for each book.",
      summary: [
        "extend vs append; index, count, reverse, clear.",
        "`lst.sort()` sorts in place (returns None); `sorted(x)` returns a new list; both accept reverse=.",
        "`key=` sorts by a computed value; tuple keys give tie-breakers; the sort is stable.",
      ],
    },

    {
      id: "py-nested-lists-copying",
      title: "Nested lists, matrices and copying",
      minutes: 17,
      difficulty: 3,
      objectives: [
        "Represent a table or matrix as a list of lists",
        "Avoid the `[[0] * n] * m` aliasing trap",
        "Choose between assignment, shallow copy and deep copy",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "`grid = [[0] * 3] * 2`, then `grid[0][0] = 9`. What is `grid`?",
        options: [
          { text: "`[[9, 0, 0], [0, 0, 0]]`", why: "That's what most people expect — but both rows are the same object." },
          { text: "`[[9, 0, 0], [9, 0, 0]]`", why: "Correct — `* 2` repeats a reference to the same inner list." },
          { text: "An error", why: "It's valid code." },
        ],
        answer: 1,
        hint: "Does `* 2` copy the inner list?",
        explain: "Multiplying a list of lists repeats references, so both rows are one list. Use a comprehension: `[[0] * 3 for _ in range(2)]`.",
      },
      why: "Grids are everywhere: game boards, seating plans, spreadsheets, images, matrices in maths and machine learning. And copying nested data correctly prevents some of the most confusing bugs in Python.",
      concept: [
        {
          title: "Lists of lists",
          body: `\`\`\`python
grid = [
    [1, 2, 3],
    [4, 5, 6],
]
grid[1][2]          # row 1, column 2 → 6
len(grid), len(grid[0])   # 2 rows, 3 columns
for row in grid:
    for value in row:
        ...
\`\`\`

Build an m × n grid safely with a comprehension: \`[[0] * n for _ in range(m)]\` — each row is a new list.`,
        },
        {
          title: "Three ways to 'copy'",
          body: `| Code | New outer list? | New inner lists? |
| --- | --- | --- |
| \`b = a\` | no (alias) | no |
| \`b = a.copy()\` / \`a[:]\` / \`list(a)\` | yes (**shallow**) | no — shared |
| \`b = copy.deepcopy(a)\` | yes | yes (**deep**) |

A shallow copy is enough for a flat list of numbers or strings. With nested mutable items, changes to an inner list show through a shallow copy — use \`deepcopy\`.`,
        },
      ],
      example: {
        title: "Grids and copies",
        code: r`import copy
bad = [[0] * 3] * 2
good = [[0] * 3 for _ in range(2)]
bad[0][0] = 1
good[0][0] = 1
print(bad, good)
matrix = [[1, 2], [3, 4]]
shallow = matrix.copy()
deep = copy.deepcopy(matrix)
matrix[0][0] = 99
print(shallow[0], deep[0])
print([row[1] for row in matrix], sum(sum(row) for row in matrix))`,
        output: "[[1, 0, 0], [1, 0, 0]] [[1, 0, 0], [0, 0, 0]]\n[99, 2] [1, 2]\n[2, 4] 108\n",
        lines: [
          [2, "One inner list, referenced twice — the trap."],
          [3, "A comprehension builds a fresh inner list for every row."],
          [6, "The bad grid changed in both rows."],
          [8, "A shallow copy: a new outer list, but the same inner lists."],
          [9, "A deep copy duplicates the inner lists too."],
          [11, "The change to matrix[0] shows through the shallow copy only."],
          [12, "Column 1 of each row, and the total of all values."],
        ],
      },
      mistakes: [
        { title: "`[[0] * n] * m`", body: "Creates m references to the same row. Use `[[0] * n for _ in range(m)]`." },
        { title: "Shallow-copying nested data", body: "`b = a.copy()` shares inner lists; `copy.deepcopy(a)` doesn't." },
        { title: "Row/column mix-ups", body: "`grid[r][c]`: first index is the row (which inner list), second the column." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`a = [[1], [2]]
b = a[:]
b[0].append(5)
b[1] = [7]
print(a, b)`,
          answer: "[[1, 5], [2]] [[1, 5], [7]]\n",
          hint: "The slice copies the outer list only.",
          explain: "b[0] is the same inner list as a[0], so appending shows in both. Assigning b[1] replaces b's reference only.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Read the value in row 2, column 0 (prints 7).",
          code: r`m = [[1, 2], [4, 5], [7, 8]]
print(m___)`,
          blanks: [["[2][0]"]],
          output: "7\n",
          hint: "Row first, then column.",
          explain: "`m[2]` is [7, 8]; `[0]` of that is 7.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "This should mark only seat (0, 1) as taken but marks a whole column. Which line?",
          code: r`seats = [["."] * 3] * 3
seats[0][1] = "X"
for row in seats:
    print("".join(row))`,
          line: 1,
          fix: r`seats = [["."] * 3 for _ in range(3)]
seats[0][1] = "X"
for row in seats:
    print("".join(row))`,
          output: ".X.\n...\n...\n",
          hint: "Are the three rows different lists?",
          explain: "`* 3` on the outer list repeats one row three times. Build each row separately with a comprehension.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "You have `config = {\"tags\": [\"a\"]}`-style nested data and want an independent copy you can freely edit. Use…",
          options: [
            { text: "`new = config`", why: "Just an alias." },
            { text: "a shallow copy", why: "Inner lists would still be shared." },
            { text: "`copy.deepcopy(config)`", why: "Correct." },
          ],
          answer: 2,
          hint: "Nested + mutable = ?",
          explain: "Only deepcopy duplicates nested mutable objects.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Row and column totals", difficulty: 3,
          prompt: `Read r and c, then r lines of c numbers. Print each row's total on one line (space-separated), then each column's total:

\`\`\`
6 15
5 7 9
\`\`\`

(for the grid 1 2 3 / 4 5 6).`,
          starter: r`r, c = map(int, input().split())
grid = [[int(x) for x in input().split()] for _ in range(r)]
`,
          tests: [
            { label: "2 × 3", input: "2 3\n1 2 3\n4 5 6\n", output: "6 15\n5 7 9" },
            { label: "1 × 1", input: "1 1\n7\n", output: "7\n7", hidden: true, category: "boundary" },
            { label: "3 × 2", input: "3 2\n1 1\n2 2\n3 -3\n", output: "2 4 0\n6 0", hidden: true },
          ],
          hints: [
            "Row totals are easy: `sum(row)` for each row.",
            "A column total adds `grid[i][j]` for every row i, at a fixed column j.",
            "Loop over j in range(c), and inside over the rows.",
            "`col_totals = [sum(grid[i][j] for i in range(r)) for j in range(c)]`, then join both lists with spaces.",
          ],
          solution: r`r, c = map(int, input().split())
grid = [[int(x) for x in input().split()] for _ in range(r)]
row_totals = [sum(row) for row in grid]
col_totals = []
for j in range(c):
    total = 0
    for i in range(r):
        total += grid[i][j]
    col_totals.append(total)
print(" ".join(map(str, row_totals)))
print(" ".join(map(str, col_totals)))`,
          notes: "Rows are the inner lists; columns cut across them, so they need an index loop. `zip(*grid)` (Module 13) gives the columns directly.",
        },
        {
          id: "stretch", kind: "challenge", title: "Transpose a matrix", difficulty: 3,
          prompt: `Read r and c, then an r × c matrix. Print its transpose (c rows of r numbers): row j of the result is column j of the input.`,
          starter: r`r, c = map(int, input().split())
m = [[int(x) for x in input().split()] for _ in range(r)]
`,
          tests: [
            { label: "2 × 3", input: "2 3\n1 2 3\n4 5 6\n", output: "1 4\n2 5\n3 6" },
            { label: "1 × 3", input: "1 3\n7 8 9\n", output: "7\n8\n9", hidden: true, category: "edge" },
            { label: "Square", input: "2 2\n1 2\n3 4\n", output: "1 3\n2 4", hidden: true },
          ],
          hints: [
            "The result has c rows and r columns.",
            "Result[j][i] = m[i][j].",
            "Build the result with a nested comprehension or nested loops (with a fresh row each time!).",
            "`t = [[m[i][j] for i in range(r)] for j in range(c)]`.",
          ],
          solution: r`r, c = map(int, input().split())
m = [[int(x) for x in input().split()] for _ in range(r)]
t = [[m[i][j] for i in range(r)] for j in range(c)]
for row in t:
    print(" ".join(map(str, row)))`,
          notes: "The outer comprehension makes a new row for each column j, so no aliasing. `[list(col) for col in zip(*m)]` is the idiomatic shortcut.",
        },
      ],
      realWorld: "Images are grids of pixels, spreadsheets are grids of cells, and machine-learning data is matrices — NumPy (Module 35) stores them efficiently, but the row/column thinking is the same. Shallow-copy bugs regularly appear in config handling and game state.",
      reteach: "A list of lists is a building: the outer list is the list of floors, each floor is a list of rooms. `[[0]*3]*2` builds one floor and puts two signs pointing at it — paint a room and it's painted on 'both' floors. A shallow copy makes a new list of signs; a deep copy rebuilds every floor.",
      summary: [
        "Grids are lists of lists: `grid[row][col]`; build them with `[[v] * n for _ in range(m)]`.",
        "`b = a` aliases; `.copy()`/`[:]` copies one level (shallow); `copy.deepcopy` copies everything.",
        "Row totals with `sum(row)`; columns need an index loop (or `zip(*grid)`).",
      ],
    },

    {
      id: "py-list-comprehensions",
      title: "List comprehensions, two pointers and sliding windows",
      minutes: 18,
      difficulty: 3,
      objectives: [
        "Write list comprehensions with conditions",
        "Use two pointers to solve problems on sorted lists",
        "Use a sliding window to process consecutive items efficiently",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "What is `[x * x for x in range(4)]`?",
        options: [
          { text: "`[0, 1, 4, 9]`", why: "Correct." },
          { text: "`[1, 4, 9, 16]`", why: "range(4) starts at 0." },
          { text: "`16`", why: "A comprehension builds a list." },
        ],
        answer: 0,
        hint: "Square each of 0, 1, 2, 3.",
        explain: "The comprehension applies `x * x` to each x from range(4).",
      },
      why: "Comprehensions are how Python programmers build lists — short, readable and fast. Two pointers and sliding windows are the first 'algorithmic' patterns you'll meet: they turn slow nested-loop solutions into single passes, and they're interview favourites.",
      concept: [
        {
          title: "List comprehensions",
          body: `\`\`\`python
squares = [n * n for n in range(10)]
evens = [n for n in nums if n % 2 == 0]           # filter
labels = ["pass" if m >= 40 else "fail" for m in marks]   # transform with a choice
pairs = [(a, b) for a in range(3) for b in range(3) if a < b]
\`\`\`

Shape: \`[expression for item in iterable if condition]\`. Use them for simple build-a-list loops; if it gets complicated, a normal loop is clearer.`,
        },
        {
          title: "Two pointers",
          body: `On a **sorted** list, keep one index at each end and move them towards each other:

\`\`\`python
i, j = 0, len(a) - 1
while i < j:
    s = a[i] + a[j]
    if s == target: ...      # found a pair
    elif s < target: i += 1  # need a bigger sum
    else: j -= 1             # need a smaller sum
\`\`\`

One pass (O(n)) instead of checking every pair (O(n²)).`,
        },
        {
          title: "Sliding window",
          body: `For "best sum of k consecutive items", don't re-add k items each time. Slide: add the new item, subtract the one that left:

\`\`\`python
window = sum(a[:k])
best = window
for i in range(k, len(a)):
    window += a[i] - a[i - k]
    best = max(best, window)
\`\`\`

Common pitfalls with lists in these loops: modifying a list while looping over it, and off-by-one window edges.`,
        },
      ],
      example: {
        title: "Comprehension, pair sum and window",
        code: r`temps = [31, 35, 29, 40, 38, 27, 33]
hot = [t for t in temps if t >= 35]
f = [round(t * 9 / 5 + 32) for t in temps[:3]]
print(hot, f)
a, target = [1, 3, 5, 8, 11], 13
i, j = 0, len(a) - 1
while i < j:
    s = a[i] + a[j]
    if s == target:
        print("pair:", a[i], a[j])
        break
    if s < target:
        i += 1
    else:
        j -= 1
k = 3
window = sum(temps[:k])
best = window
for idx in range(k, len(temps)):
    window += temps[idx] - temps[idx - k]
    best = max(best, window)
print("best 3-day total:", best)`,
        output: "[35, 40, 38] [88, 95, 84]\npair: 5 8\nbest 3-day total: 107\n",
        lines: [
          [2, "Filter: keep temperatures of 35 and above."],
          [3, "Transform the first three to Fahrenheit."],
          [6, "Two pointers at both ends of the sorted list."],
          [8, "1 + 11 = 12 is too small, move i; 3 + 11 = 14 too big, move j; 3 + 8 = 11, move i; 5 + 8 = 13 found."],
          [17, "The first window is days 0–2."],
          [19, "Slide one day: add the new day, drop the oldest."],
          [21, "Windows: 95, 104, 107, 105, 98 — days 3–5 (29 + 40 + 38 = 107) are the best three consecutive days."],
        ],
      },
      mistakes: [
        { title: "Removing items while looping over the same list", body: "Skips elements. Build a new list with a comprehension instead: `nums = [n for n in nums if n != 0]`." },
        { title: "Comprehension for side effects", body: "`[print(x) for x in xs]` builds a useless list of None. Use a normal for loop." },
        { title: "Two pointers on unsorted data", body: "The pointer moves are only correct when the list is sorted." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 2,
          code: r`nums = [3, 8, 1, 6]
print([n * 10 for n in nums if n > 2])
print(["even" if n % 2 == 0 else "odd" for n in nums])`,
          answer: "[30, 80, 60]\n['odd', 'even', 'odd', 'even']\n",
          hint: "An `if` at the end filters; an `if/else` before `for` chooses a value.",
          explain: "1 is filtered out in the first; the second labels every number.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Keep only the non-empty names.",
          code: r`names = ["asha", "", "ravi", ""]
print([n for n in names ___ n])`,
          blanks: [["if"]],
          output: "['asha', 'ravi']\n",
          hint: "A filter clause.",
          explain: "`if n` keeps truthy (non-empty) strings.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "This should remove all zeros but leaves one in. Which line causes it?",
          code: r`nums = [0, 0, 5, 0, 7]
for n in nums:
    if n == 0:
        nums.remove(n)
print(nums)`,
          line: 2,
          fix: r`nums = [0, 0, 5, 0, 7]
nums = [n for n in nums if n != 0]
print(nums)`,
          output: "[5, 7]\n",
          hint: "What happens to the loop's position when an item is removed under it?",
          explain: "Removing items while iterating shifts the list under the loop, so some items are skipped. Build a new list instead.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "For the maximum sum of k consecutive numbers in a list of n numbers, the sliding window does about how much work?",
          options: [
            { text: "n × k additions", why: "That's recomputing each window from scratch." },
            { text: "about n additions/subtractions", why: "Correct — one add and one subtract per step." },
            { text: "n² additions", why: "Even the naive version is n × k, not n²." },
          ],
          answer: 1,
          hint: "How much changes between neighbouring windows?",
          explain: "Each slide only adds one element and removes one, so the total work is linear in n.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Clean and square", difficulty: 2,
          prompt: `Read a line of integers. Using **list comprehensions**, print:

1. the list of positive numbers,
2. their squares,
3. the words \`"big"\`/\`"small"\` for each positive number (big if > 10).

\`\`\`
[4, 12, 7]
[16, 144, 49]
['small', 'big', 'small']
\`\`\``,
          starter: r`nums = [int(x) for x in input().split()]
`,
          tests: [
            { label: "Mixed", input: "4 -3 12 0 7\n", output: "[4, 12, 7]\n[16, 144, 49]\n['small', 'big', 'small']" },
            { label: "No positives", input: "-1 0\n", output: "[]\n[]\n[]", hidden: true, category: "edge" },
          ],
          hints: [
            "Three comprehensions, each building from the previous result.",
            "Filter with `if n > 0`.",
            "Transform: `[p * p for p in pos]`.",
            "Choose: `[\"big\" if p > 10 else \"small\" for p in pos]`.",
          ],
          solution: r`nums = [int(x) for x in input().split()]
pos = [n for n in nums if n > 0]
print(pos)
print([p * p for p in pos])
print(["big" if p > 10 else "small" for p in pos])`,
          notes: "Filter (`if` at the end) versus choose (`if/else` before `for`) is the key difference to remember.",
        },
        {
          id: "stretch", kind: "challenge", title: "Best k-day streak", difficulty: 4,
          prompt: `Read a line of daily step counts and k. Print the **highest total** over any k consecutive days and the **starting day** (1-based) of the first such window, like \`total 23000 from day 3\`. Use a sliding window (one pass). Assume 1 ≤ k ≤ number of days.`,
          starter: r`steps = [int(x) for x in input().split()]
k = int(input())
`,
          tests: [
            { label: "Week", input: "5000 3000 8000 9000 6000 2000 7000\n3\n", output: "total 23000 from day 3" },
            { label: "k = 1", input: "4 9 2\n1\n", output: "total 9 from day 2", category: "boundary" },
            { label: "Whole list", input: "1 2 3\n3\n", output: "total 6 from day 1", hidden: true, category: "boundary" },
            { label: "Tie keeps the first", input: "5 5 1 5 5\n2\n", output: "total 10 from day 1", hidden: true, category: "edge" },
          ],
          hints: [
            "Start with the sum of the first k days.",
            "Slide: for each new day i, add steps[i] and subtract steps[i - k].",
            "Update the best (and its start) only when strictly greater, so ties keep the earliest.",
            "The window ending at i starts at day `i - k + 2` (1-based).",
          ],
          solution: r`steps = [int(x) for x in input().split()]
k = int(input())
window = sum(steps[:k])
best, start = window, 1
for i in range(k, len(steps)):
    window += steps[i] - steps[i - k]
    if window > best:
        best, start = window, i - k + 2
print(f"total {best} from day {start}")`,
          notes: "The window covering indexes i−k+1 … i starts on day i−k+2 when counting from 1. One pass, O(n), no matter how big k is.",
        },
      ],
      realWorld: "Comprehensions are everywhere in Python codebases. Sliding windows compute moving averages (stock prices, sensor smoothing) and rate limiting; two pointers appear in merging sorted data and many interview questions.",
      reteach: "A comprehension is a recipe in one line: *for each item, (if it passes the test) put this into the new list*. Two pointers are two people walking towards each other along a sorted row, each stepping only when it helps. A sliding window is a picture frame you slide along the row: when it moves one step, one item enters and one leaves — you don't need to recount everything inside.",
      summary: [
        "`[expr for x in it if cond]` builds a list; `a if c else b` before `for` chooses values.",
        "Don't change a list while looping over it — build a new one.",
        "Two pointers (sorted data) and sliding windows turn O(n²) or O(n·k) work into O(n).",
      ],
      cpp: {
        python: r`sq = [x * x for x in nums if x > 0]`,
        cpp: r`vector<int> sq;
for (int x : nums) if (x > 0) sq.push_back(x * x);`,
        note: "C++ has no list comprehensions (C++20 ranges come closest). The algorithmic patterns — two pointers, sliding window — are identical in both languages.",
      },
    },
  ],
  exam: [
    {
      id: "e1", kind: "predict", difficulty: 3,
      code: r`a = [5, 3, 8]
b = a
c = sorted(a)
a.append(1)
b.sort(reverse=True)
print(a, c, a is b)`,
      answer: "[8, 5, 3, 1] [3, 5, 8] True\n",
      hint: "b is an alias; c is a new list made before the append.",
      explain: "sorted created c before the append; a and b are one list, which got 1 appended and was then sorted descending.",
    },
    {
      id: "e2", kind: "mcq", difficulty: 3,
      prompt: "Which creates a 3 × 3 grid of zeros whose rows are independent?",
      options: [
        { text: "`[[0] * 3] * 3`", why: "All rows are the same list." },
        { text: "`[[0] * 3 for _ in range(3)]`", why: "Correct." },
        { text: "`[0] * 9`", why: "A flat list, not a grid." },
      ],
      answer: 1,
      hint: "Each row must be created separately.",
      explain: "The comprehension evaluates `[0] * 3` once per row, creating a new list each time.",
    },
    {
      id: "e3", kind: "fill", difficulty: 2,
      prompt: "Sort the words case-insensitively.",
      code: r`w = ["banana", "Apple", "cherry"]
print(sorted(w, key=str.___))`,
      blanks: [["lower"]],
      output: "['Apple', 'banana', 'cherry']\n",
      hint: "Compare lower-cased versions.",
      explain: "`key=str.lower` sorts by the lower-cased word.",
    },
    {
      id: "e4", kind: "bug", difficulty: 3,
      prompt: "`backup` should keep the original numbers `[[1, 2], [3]]`. Which line is the bug?",
      code: r`data = [[1, 2], [3]]
backup = data.copy()
data[0].append(99)
print(backup)`,
      line: 2,
      fix: r`import copy
data = [[1, 2], [3]]
backup = copy.deepcopy(data)
data[0].append(99)
print(backup)`,
      output: "[[1, 2], [3]]\n",
      hint: "Is a shallow copy enough for nested lists?",
      explain: "A shallow copy shares the inner lists, so appending to data[0] shows in backup. Use `copy.deepcopy`.",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: class marks manager", difficulty: 3,
    prompt: `Read n, then n lines \`name m1 m2 m3\` (three marks out of 100). Print:

1. a ranked list \`rank. name total\` by total **highest first** (ties alphabetical),
2. the class average total with 1 decimal: \`Class average: 210.5\`,
3. the names of students whose every mark is at least 40, in input order: \`All passed: Asha, Zoe\` (or \`All passed: none\`).`,
    starter: r`n = int(input())
students = []
`,
    tests: [
      { label: "Four students", input: "4\nAsha 80 75 90\nRavi 30 90 85\nZoe 70 70 70\nDev 95 35 80\n", output: "1. Asha 245\n2. Dev 210\n3. Zoe 210\n4. Ravi 205\nClass average: 217.5\nAll passed: Asha, Zoe" },
      { label: "Nobody passes all", input: "2\nA 10 90 90\nB 90 90 39\n", output: "1. B 219\n2. A 190\nClass average: 204.5\nAll passed: none", hidden: true, category: "edge" },
    ],
    hints: [
      "Store each student as `(name, [m1, m2, m3])` or `(name, total, marks)`.",
      "Rank with `sorted(..., key=lambda s: (-total, name))`.",
      "Average: sum of totals / n, formatted with `:.1f`.",
      "Passed: `[name for name, marks in students if min(marks) >= 40]`, joined with \", \" (or \"none\").",
    ],
    solution: r`n = int(input())
students = []
for _ in range(n):
    parts = input().split()
    name, marks = parts[0], [int(x) for x in parts[1:]]
    students.append((name, marks))
ranked = sorted(students, key=lambda s: (-sum(s[1]), s[0]))
for rank, (name, marks) in enumerate(ranked, start=1):
    print(f"{rank}. {name} {sum(marks)}")
average = sum(sum(m) for _, m in students) / n
print(f"Class average: {average:.1f}")
passed = [name for name, marks in students if min(marks) >= 40]
print("All passed:", ", ".join(passed) if passed else "none")`,
    notes: "Lists of tuples, a sort key with a tie-breaker, comprehensions and joining — the core list skills in one program.",
  },
};
