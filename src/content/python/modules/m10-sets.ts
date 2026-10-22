import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 10 — Sets. */
export const M10: PyModuleDef = {
  id: "py-sets",
  number: 10,
  level: 2,
  title: "Sets",
  summary: "Creating sets, uniqueness and hashing, adding and removing, union, intersection, difference, symmetric difference, subsets and supersets, frozensets, fast membership tests, duplicate removal and set-based challenges.",
  track: "core",
  prereqs: ["py-tuples"],
  lessons: [
    {
      id: "py-sets-basics",
      title: "Sets: unique items and fast membership",
      minutes: 15,
      difficulty: 2,
      objectives: [
        "Create sets and remove duplicates with `set()`",
        "Add and remove items with `add`, `remove`, `discard`, `pop`",
        "Explain why membership tests on sets are fast (hashing)",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 1,
        prompt: "What is `len({1, 2, 2, 3, 3, 3})`?",
        options: [
          { text: "6", why: "Sets don't keep duplicates." },
          { text: "3", why: "Correct — only the unique values 1, 2, 3." },
          { text: "An error", why: "Duplicates are silently dropped." },
        ],
        answer: 1,
        hint: "A set holds each value at most once.",
        explain: "Duplicates are discarded when a set is built.",
      },
      why: "Whenever you ask \"have I seen this before?\" or \"which items are unique?\", a set is the right tool: removing duplicate emails, tracking visited pages, checking whether a username is taken — in constant time even for millions of items.",
      concept: [
        {
          title: "Creating sets",
          body: `\`\`\`python
tags = {"python", "code", "fun"}
unique = set([3, 1, 3, 2])     # {1, 2, 3}
letters = set("banana")        # {'a', 'b', 'n'}
empty = set()                  # NOT {} — that's an empty dict
\`\`\`

Sets are **unordered** (no indexes, no slicing) and hold only **hashable** items (numbers, strings, tuples of those) — not lists or dicts. Use \`sorted(s)\` when you need a predictable order for printing.`,
        },
        {
          title: "Changing sets",
          body: `| Method | Does |
| --- | --- |
| \`s.add(x)\` | add x (no effect if already there) |
| \`s.remove(x)\` | remove x — KeyError if missing |
| \`s.discard(x)\` | remove x if present, no error |
| \`s.pop()\` | remove and return an arbitrary item |
| \`s.update([...])\` | add many |
| \`s.clear()\` | empty it |`,
        },
        {
          title: "Why membership is fast: hashing",
          body: `A set stores each item in a slot chosen by its **hash** — a number computed from the value (\`hash("python")\`). To check \`x in s\`, Python computes \`hash(x)\` and looks in one slot instead of scanning everything. So \`x in some_set\` is about the same speed for 10 or 10 million items (O(1) on average), while \`x in some_list\` gets slower as the list grows (O(n)).

That's also why items must be hashable: if an item could change, its hash would change and it would be in the wrong slot.`,
        },
      ],
      example: {
        title: "Unique visitors",
        code: r`visits = ["asha", "ravi", "asha", "zoe", "ravi", "asha"]
unique = set(visits)
print(len(visits), len(unique), sorted(unique))
seen = set()
for v in visits:
    if v in seen:
        print("again:", v)
    else:
        seen.add(v)
seen.discard("nobody")
seen.remove("zoe")
print(sorted(seen), "zoe" in seen)`,
        output: "6 3 ['asha', 'ravi', 'zoe']\nagain: asha\nagain: ravi\nagain: asha\n['asha', 'ravi'] False\n",
        lines: [
          [2, "Converting to a set drops the duplicates."],
          [3, "sorted() gives a predictable order for printing."],
          [6, "The fast membership test: have we seen this visitor?"],
          [9, "First time: remember them."],
          [10, "discard: no error for a missing item."],
          [11, "remove: would raise KeyError if \"zoe\" weren't there."],
        ],
      },
      mistakes: [
        { title: "`{}` for an empty set", body: "`{}` is an empty dictionary. Use `set()`." },
        { title: "Expecting order or indexes", body: "`s[0]` raises TypeError, and print order isn't guaranteed. Sort when you need order." },
        { title: "Putting lists in sets", body: "`{[1, 2]}` raises `TypeError: unhashable type: 'list'`. Use tuples." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 2,
          code: r`s = set("mississippi")
print(sorted(s), len(s))
s.add("m")
s.discard("x")
print(len(s))`,
          answer: "['i', 'm', 'p', 's'] 4\n4\n",
          hint: "Which distinct letters are in mississippi?",
          explain: "The distinct letters are i, m, p, s. Adding 'm' again changes nothing; discarding a missing item is fine.",
        },
        {
          id: "f1", kind: "fill", difficulty: 1,
          prompt: "Create an empty set and add one item.",
          code: r`names = ___
names.add("asha")
print(names)`,
          blanks: [["set()"]],
          output: "{'asha'}\n",
          hint: "Not `{}`.",
          explain: "`set()` creates an empty set; `{}` would be an empty dict.",
        },
        {
          id: "b1", kind: "bug", difficulty: 2,
          prompt: "This should store the two points but crashes. Which line?",
          code: r`visited = set()
visited.add([0, 0])
visited.add([1, 2])
print(len(visited))`,
          line: 2,
          fix: r`visited = set()
visited.add((0, 0))
visited.add((1, 2))
print(len(visited))`,
          output: "2\n",
          hint: "Can a list be put in a set?",
          explain: "Lists are unhashable. Store the points as tuples instead.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 2,
          prompt: "You check membership 100,000 times against 1,000,000 usernames. Which container should hold the usernames?",
          options: [
            { text: "list", why: "Each check scans the list: about 10¹¹ comparisons in the worst case." },
            { text: "set", why: "Correct — each check is O(1) on average." },
            { text: "string", why: "Substring checks would give wrong answers and be slow." },
          ],
          answer: 1,
          hint: "Which one uses hashing?",
          explain: "Sets use hashing, so each `in` test takes roughly constant time.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Remove duplicates, keep order", difficulty: 2,
          prompt: `Read a line of words. Print the words with duplicates removed, **keeping the first occurrence order**, joined with spaces. (A plain \`set\` loses the order — combine a set with a list.)`,
          starter: r`words = input().split()
`,
          tests: [
            { label: "Repeats", input: "red blue red green blue red\n", output: "red blue green" },
            { label: "No repeats", input: "a b c\n", output: "a b c", hidden: true },
            { label: "All same", input: "x x x\n", output: "x", hidden: true, category: "edge" },
          ],
          hints: [
            "Keep a set of words you've already output.",
            "Loop through the words in order.",
            "If a word is new, append it to a result list and add it to the set.",
            "`if w not in seen: seen.add(w); result.append(w)`.",
          ],
          solution: r`words = input().split()
seen = set()
result = []
for w in words:
    if w not in seen:
        seen.add(w)
        result.append(w)
print(" ".join(result))`,
          notes: "The set gives fast 'seen before?' checks; the list keeps the order. (`list(dict.fromkeys(words))` is a one-line alternative — dicts keep insertion order.)",
        },
        {
          id: "stretch", kind: "task", title: "First repeated character", difficulty: 3,
          prompt: `Read a string. Print the first character that appears **for the second time** while reading left to right, and its position (0-based) of that second appearance, like \`l at 3\`. If no character repeats, print \`none\`.`,
          starter: r`s = input()
`,
          tests: [
            { label: "hello", input: "hello\n", output: "l at 3" },
            { label: "abcabc", input: "abcabc\n", output: "a at 3", hidden: true },
            { label: "No repeats", input: "python\n", output: "none", category: "edge" },
            { label: "Spaces count", input: "a b c\n", output: "  at 3", hidden: true, category: "edge" },
          ],
          hints: [
            "Read characters in order and remember the ones you've seen.",
            "The moment a character is already in the set, you've found the answer.",
            "Use `enumerate(s)` or an index counter to know the position.",
            "Print and `break`; use a loop `else` for \"none\".",
          ],
          solution: r`s = input()
seen = set()
for i, ch in enumerate(s):
    if ch in seen:
        print(f"{ch} at {i}")
        break
    seen.add(ch)
else:
    print("none")`,
          notes: "One pass with a set: O(n). Comparing every pair of characters would be O(n²).",
        },
      ],
      realWorld: "Deduplicating email lists, tracking visited URLs in a web crawler, finding unique products, checking reserved words, and fast 'is this ID valid?' lookups all use sets.",
      reteach: "A set is a guest list at a door: each name can be on it only once, the order doesn't matter, and the bouncer can check whether you're on it instantly because the list is organised by a code computed from each name (the hash) — he doesn't read it from top to bottom.",
      summary: [
        "Sets hold unique, hashable items and have no order; `set()` makes an empty one.",
        "add, remove (KeyError), discard (no error), pop, update, clear.",
        "Membership tests on sets are O(1) on average thanks to hashing.",
      ],
      cpp: {
        python: r`s = {3, 1}
s.add(2)
print(2 in s)`,
        cpp: r`unordered_set<int> s = {3, 1};
s.insert(2);
cout << (s.count(2) > 0);`,
        note: "Python's `set` is a hash set like C++'s `unordered_set`; C++'s `set` is a sorted tree with O(log n) lookups.",
      },
    },

    {
      id: "py-set-operations",
      title: "Set operations and set-based problems",
      minutes: 16,
      difficulty: 3,
      objectives: [
        "Combine sets with union, intersection, difference and symmetric difference",
        "Test subsets and supersets; use frozensets",
        "Solve 'common', 'missing' and 'unique' problems with set algebra",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "`{1, 2, 3} & {2, 3, 4}` is…",
        options: [
          { text: "`{1, 2, 3, 4}`", why: "That's union (`|`)." },
          { text: "`{2, 3}`", why: "Correct — the intersection: items in both." },
          { text: "`{1, 4}`", why: "That's the symmetric difference (`^`)." },
        ],
        answer: 1,
        hint: "& = in both.",
        explain: "`&` is intersection: only items present in both sets.",
      },
      why: "Questions like \"which students take both maths and physics?\", \"which products are out of stock?\" or \"which permissions does this user lack?\" are one-line set operations instead of nested loops.",
      concept: [
        {
          title: "The four operations",
          body: `\`\`\`python
a = {"maths", "physics", "chem"}
b = {"physics", "bio"}
a | b     # union: in either          {'bio', 'chem', 'maths', 'physics'}
a & b     # intersection: in both     {'physics'}
a - b     # difference: in a, not b   {'chem', 'maths'}
a ^ b     # symmetric diff: in exactly one   {'bio', 'chem', 'maths'}
\`\`\`

Method forms (\`a.union(b)\`, \`a.intersection(b)\`, \`a.difference(b)\`, \`a.symmetric_difference(b)\`) also accept lists and other iterables.`,
        },
        {
          title: "Subsets, supersets, disjoint",
          body: `\`\`\`python
{1, 2} <= {1, 2, 3}         # subset: True
{1, 2, 3} >= {1, 2}         # superset: True
{1, 2} < {1, 2}             # proper subset: False (they're equal)
{1, 2}.isdisjoint({3, 4})   # no common items: True
\`\`\``,
        },
        {
          title: "frozenset",
          body: `A **frozenset** is an immutable set: no add/remove, but it's hashable, so it can be a dict key or an item of another set:

\`\`\`python
pair = frozenset({"asha", "ravi"})
friendships = {pair}
frozenset({"ravi", "asha"}) in friendships   # True: order doesn't matter
\`\`\``,
        },
      ],
      example: {
        title: "Clubs and members",
        code: r`coding = {"asha", "ravi", "zoe", "dev"}
robotics = {"ravi", "kim", "dev"}
print(sorted(coding & robotics))
print(sorted(coding | robotics))
print(sorted(coding - robotics), sorted(robotics - coding))
print(sorted(coding ^ robotics))
print({"ravi", "dev"} <= robotics, coding.isdisjoint({"tom"}))
pairs = {frozenset({"asha", "zoe"}), frozenset({"ravi", "kim"})}
print(frozenset({"zoe", "asha"}) in pairs)`,
        output: "['dev', 'ravi']\n['asha', 'dev', 'kim', 'ravi', 'zoe']\n['asha', 'zoe'] ['kim']\n['asha', 'kim', 'zoe']\nTrue True\nTrue\n",
        lines: [
          [3, "In both clubs."],
          [4, "In at least one club."],
          [5, "Only in coding; only in robotics."],
          [6, "In exactly one club."],
          [7, "Subset test, and a disjointness test."],
          [8, "frozensets can be members of a set; {a, b} and {b, a} are equal."],
        ],
      },
      mistakes: [
        { title: "Using `+` on sets", body: "`a + b` is a TypeError. Use `a | b`." },
        { title: "Mixing up `-` direction", body: "`a - b` and `b - a` are different: 'in a but not b' versus 'in b but not a'." },
        { title: "Forgetting operators need sets on both sides", body: "`{1, 2} | [3]` fails; the method `{1, 2}.union([3])` accepts any iterable." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 2,
          code: r`a, b = {1, 2, 3, 4}, {3, 4, 5}
print(sorted(a - b), sorted(b - a), sorted(a ^ b))
print(len(a | b), a > {1, 2}, {3} < b)`,
          answer: "[1, 2] [5] [1, 2, 5]\n5 True True\n",
          hint: "Difference is directional; > and < are proper superset/subset.",
          explain: "a − b = {1, 2}, b − a = {5}, symmetric difference {1, 2, 5}. The union has 5 items; a is a proper superset of {1, 2}; {3} is a proper subset of b.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Find the subjects both students take.",
          code: r`asha = {"maths", "art", "physics"}
ravi = {"physics", "music", "maths"}
print(sorted(asha ___ ravi))`,
          blanks: [["&"]],
          output: "['maths', 'physics']\n",
          hint: "Items in both sets.",
          explain: "`&` is intersection.",
        },
        {
          id: "b1", kind: "bug", difficulty: 2,
          prompt: "This should list the items still needed (`['eggs', 'milk']`). Which line is wrong?",
          code: r`needed = {"milk", "bread", "eggs"}
have = {"bread", "jam"}
missing = have - needed
print(sorted(missing))`,
          line: 3,
          fix: r`needed = {"milk", "bread", "eggs"}
have = {"bread", "jam"}
missing = needed - have
print(sorted(missing))`,
          output: "['eggs', 'milk']\n",
          hint: "Which set do you subtract from which?",
          explain: "We want items that are needed but not had: `needed - have`. The reverse gives what we have but don't need.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "Why use a `frozenset` instead of a `set`?",
          options: [
            { text: "It's faster for membership tests", why: "Both use the same hashing." },
            { text: "It's immutable and hashable, so it can be a dict key or a set item", why: "Correct." },
            { text: "It keeps items sorted", why: "Neither is sorted." },
          ],
          answer: 1,
          hint: "Think about what can go inside a set.",
          explain: "Only hashable (immutable) objects can be set items or dict keys; frozenset is the immutable set.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Common and unique words", difficulty: 2,
          prompt: `Read two lines of words. Print three lines (each sorted alphabetically, words separated by spaces, or \`-\` if empty):

1. words in **both** lines,
2. words **only in the first**,
3. words in **exactly one** line.`,
          starter: r`a = set(input().split())
b = set(input().split())
`,
          tests: [
            { label: "Overlap", input: "the cat sat\nthe dog sat down\n", output: "sat the\ncat\ncat dog down" },
            { label: "Identical", input: "a b\nb a\n", output: "a b\n-\n-", hidden: true, category: "edge" },
            { label: "Disjoint", input: "x y\nz\n", output: "-\nx y\nx y z", hidden: true },
          ],
          hints: [
            "Which three operators match the three questions?",
            "&, - and ^.",
            "Print `\" \".join(sorted(s))` or \"-\" when the set is empty.",
            "Write a small helper `show(s)` so you don't repeat yourself.",
          ],
          solution: r`a = set(input().split())
b = set(input().split())

def show(s):
    print(" ".join(sorted(s)) if s else "-")

show(a & b)
show(a - b)
show(a ^ b)`,
          notes: "Set algebra answers each question in a single operation; sorting makes the output deterministic.",
        },
        {
          id: "stretch", kind: "challenge", title: "Missing numbers", difficulty: 3,
          prompt: `Read n and then a line of numbers that should contain every integer from 1 to n, but some are missing and some may repeat. Print the missing numbers in increasing order (space-separated), or \`none\`.`,
          starter: r`n = int(input())
nums = [int(x) for x in input().split()]
`,
          tests: [
            { label: "Two missing", input: "6\n4 1 2 4 6\n", output: "3 5" },
            { label: "None missing", input: "3\n3 2 1\n", output: "none", category: "edge" },
            { label: "Out-of-range ignored", input: "4\n9 1 0 4\n", output: "2 3", hidden: true, category: "edge" },
            { label: "All missing", input: "3\n7\n", output: "1 2 3", hidden: true, category: "edge" },
          ],
          hints: [
            "What's the set of numbers that should be there?",
            "`set(range(1, n + 1))`.",
            "Subtract the set of numbers you have.",
            "`missing = sorted(set(range(1, n + 1)) - set(nums))`.",
          ],
          solution: r`n = int(input())
nums = [int(x) for x in input().split()]
missing = sorted(set(range(1, n + 1)) - set(nums))
print(" ".join(map(str, missing)) if missing else "none")`,
          notes: "Expected minus actual — duplicates and out-of-range values disappear automatically. O(n) instead of checking each number against a list.",
        },
      ],
      realWorld: "Access control (`required_perms <= user_perms`), syncing data (`local - remote` to upload, `remote - local` to download), finding common friends, and comparing two CSV exports are set operations.",
      reteach: "Draw two overlapping circles (a Venn diagram). `|` colours both circles, `&` only the overlap, `a - b` the part of circle a outside b, and `^` both circles except the overlap.",
      summary: [
        "`|` union, `&` intersection, `-` difference (directional), `^` symmetric difference.",
        "`<=`/`>=` subset/superset, `<`/`>` proper, `isdisjoint` for no overlap.",
        "frozenset is the immutable, hashable set.",
      ],
    },
  ],
  exam: [
    {
      id: "e1", kind: "predict", difficulty: 3,
      code: r`a = {x % 4 for x in range(10)}
b = set("2024")
print(sorted(a), sorted(b), len(a | {int(c) for c in b}))`,
      answer: "[0, 1, 2, 3] ['0', '2', '4'] 5\n",
      hint: "Set comprehension; characters vs integers.",
      explain: "Remainders mod 4 are {0, 1, 2, 3}. set(\"2024\") has the characters '0', '2', '4'. As ints {0, 2, 4}; the union with a is {0, 1, 2, 3, 4} → 5 items.",
    },
    {
      id: "e2", kind: "mcq", difficulty: 2,
      prompt: "Which expression is True when every item in `need` is in `have`?",
      options: [
        { text: "`need >= have`", why: "That asks whether need contains have." },
        { text: "`need <= have`", why: "Correct — need is a subset of have." },
        { text: "`need & have`", why: "That's a set, not a yes/no test (and only shows overlap)." },
      ],
      answer: 1,
      hint: "Subset.",
      explain: "`need <= have` (or `need.issubset(have)`) checks that everything needed is available.",
    },
    {
      id: "e3", kind: "fill", difficulty: 2,
      prompt: "Remove an item without risking an error if it's missing.",
      code: r`s = {"a", "b"}
s.___("z")
print(sorted(s))`,
      blanks: [["discard"]],
      output: "['a', 'b']\n",
      hint: "remove raises KeyError…",
      explain: "`discard` removes the item if present and does nothing otherwise.",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: course enrolment checker", difficulty: 3,
    prompt: `Read three lines: the prerequisites a course needs, the courses a student has completed, and the courses the student wants to take this term (each a line of course codes separated by spaces; a line may be empty).

Print:

1. \`Missing prerequisites: ...\` (sorted, or \`none\`),
2. \`Already completed: ...\` — wanted courses the student has already done (sorted, or \`none\`),
3. \`Eligible: True/False\` — True when no prerequisites are missing.`,
    starter: r`prereq = set(input().split())
done = set(input().split())
wanted = set(input().split())
`,
    tests: [
      { label: "One missing", input: "CS101 MA101\nCS101 PH101\nCS201 PH101\n", output: "Missing prerequisites: MA101\nAlready completed: PH101\nEligible: False" },
      { label: "All good", input: "CS101\nCS101 MA101\nCS201\n", output: "Missing prerequisites: none\nAlready completed: none\nEligible: True", hidden: true },
      { label: "No prerequisites", input: "\nCS101\nCS101 CS102\n", output: "Missing prerequisites: none\nAlready completed: CS101\nEligible: True", hidden: true, category: "edge" },
    ],
    hints: [
      "Missing = prerequisites not completed.",
      "Already completed = wanted ∩ done.",
      "Eligible = prerequisites are a subset of done.",
      "Write a helper that prints a sorted, space-separated set or `none`.",
    ],
    solution: r`prereq = set(input().split())
done = set(input().split())
wanted = set(input().split())

def fmt(s):
    return " ".join(sorted(s)) if s else "none"

print("Missing prerequisites:", fmt(prereq - done))
print("Already completed:", fmt(wanted & done))
print("Eligible:", prereq <= done)`,
    notes: "An empty line splits into an empty set, and the empty set is a subset of everything — so a course with no prerequisites is always eligible.",
  },
};
