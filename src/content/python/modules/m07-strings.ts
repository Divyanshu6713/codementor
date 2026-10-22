import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 7 — Strings. */
export const M07: PyModuleDef = {
  id: "py-strings",
  number: 7,
  level: 2,
  title: "Strings",
  summary: "Indexing and slicing, immutability, string methods, searching and replacing, splitting and joining, formatting with f-strings, format() and %, Unicode basics, and classic string problems.",
  track: "core",
  prereqs: ["py-loops"],
  lessons: [
    {
      id: "py-strings-basics",
      title: "Indexing, slicing and immutability",
      minutes: 16,
      difficulty: 2,
      objectives: [
        "Read single characters with positive and negative indexes",
        "Cut out parts of a string with slices `s[start:stop:step]`",
        "Explain why strings can't be changed in place and how to build new ones",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 1,
        prompt: "`s = \"python\"`. What is `s[0]`?",
        options: [
          { text: "\"p\"", why: "Correct — indexes start at 0." },
          { text: "\"y\"", why: "That's `s[1]`." },
          { text: "\"n\"", why: "That's `s[-1]` (the last character)." },
        ],
        answer: 0,
        hint: "Python counts from 0.",
        explain: "The first character has index 0; the last has index -1.",
      },
      why: "Text processing is a huge part of programming: names, file paths, messages, DNA sequences, web pages. Indexing and slicing let you pick out exactly the characters you need — a first name, a file extension, the last 4 digits of a number.",
      concept: [
        {
          title: "Indexes: from the front and from the back",
          body: `\`\`\`
 p   y   t   h   o   n
 0   1   2   3   4   5
-6  -5  -4  -3  -2  -1
\`\`\`

\`s[0]\` is the first character, \`s[-1]\` the last, \`s[len(s) - 1]\` also the last. An index outside the string raises \`IndexError\`.`,
        },
        {
          title: "Slices",
          body: `\`s[start:stop]\` gives the characters from \`start\` up to, **but not including**, \`stop\` (just like \`range\`). Missing values mean "from the beginning" / "to the end":

\`\`\`python
s = "python"
s[1:4]     # "yth"
s[:2]      # "py"
s[2:]      # "thon"
s[-3:]     # "hon"   (last three)
s[::2]     # "pto"   (every second)
s[::-1]    # "nohtyp" (reversed)
\`\`\`

Slices never raise IndexError: \`s[2:100]\` simply stops at the end.`,
        },
        {
          title: "Strings are immutable",
          body: `You can't change a character in place: \`s[0] = "P"\` raises \`TypeError: 'str' object does not support item assignment\`. Build a new string instead:

\`\`\`python
s = "P" + s[1:]        # "Python"
\`\`\`

Every "modifying" string method (\`upper\`, \`replace\`, \`strip\` …) returns a **new** string and leaves the original unchanged.`,
        },
      ],
      example: {
        title: "Picking parts of an ID",
        code: r`roll = "CS2026-0457"
print(roll[0], roll[-1], len(roll))
print(roll[:2], roll[2:6], roll[-4:])
print(roll[::-1])
course = roll[:2]
fixed = course.lower() + roll[2:]
print(fixed, roll)`,
        output: "C 7 11\nCS 2026 0457\n7540-6202SC\ncs2026-0457 CS2026-0457\n",
        lines: [
          [2, "First character, last character, and the length (11)."],
          [3, "Department code, year (indexes 2–5) and the last four digits."],
          [4, "A step of -1 walks backwards: the reversed string."],
          [6, "Build a new string from a lower-cased part plus a slice."],
          [7, "The original `roll` is unchanged — strings are immutable."],
        ],
      },
      mistakes: [
        { title: "Off by one at the end of a slice", body: "`s[0:3]` has 3 characters (0, 1, 2) — the stop index isn't included." },
        { title: "`s[len(s)]`", body: "The last valid index is `len(s) - 1` (or `-1`). `s[len(s)]` raises IndexError." },
        { title: "Trying to assign to s[i]", body: "Strings are immutable; build a new one with slices and `+`." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 2,
          code: r`w = "keyboard"
print(w[3], w[-2], w[2:5], w[:3] + w[-3:])`,
          answer: "b r ybo keyard\n",
          hint: "Index 3 is the 4th letter; -2 is the second to last.",
          explain: "k-e-y-b-o-a-r-d: w[3] = b, w[-2] = r, w[2:5] = ybo, first three \"key\" + last three \"ard\".",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Print the file extension (the last 3 characters).",
          code: r`name = "report.pdf"
print(name[___])`,
          blanks: [["-3:"]],
          output: "pdf\n",
          hint: "A negative start index, no stop.",
          explain: "`name[-3:]` takes the last three characters.",
        },
        {
          id: "b1", kind: "bug", difficulty: 2,
          prompt: "This should print `Hello` (capital H) but crashes. Which line?",
          code: r`word = "hello"
word[0] = "H"
print(word)`,
          line: 2,
          fix: r`word = "hello"
word = "H" + word[1:]
print(word)`,
          output: "Hello\n",
          hint: "Can a string be changed in place?",
          explain: "Strings are immutable, so item assignment raises TypeError. Build a new string: `\"H\" + word[1:]` (or `word.capitalize()`).",
        },
        {
          id: "m1", kind: "mcq", difficulty: 2,
          prompt: "`s = \"abcdef\"`. What is `s[1:5:2]`?",
          options: [
            { text: "\"bd\"", why: "Correct: indexes 1 and 3." },
            { text: "\"bdf\"", why: "Index 5 is excluded." },
            { text: "\"ace\"", why: "That's `s[::2]`." },
          ],
          answer: 0,
          hint: "Start at 1, step 2, stop before 5.",
          explain: "Indexes 1 and 3 → \"b\" and \"d\".",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Initials and last letter", difficulty: 1,
          prompt: `Read a first name and a last name (two lines). Print the initials with dots, then the last letter of the last name:

\`\`\`
A.K.
r
\`\`\`

(for \`Asha\` and \`Kumar\`).`,
          starter: r`first = input()
last = input()
`,
          tests: [
            { label: "Asha Kumar", input: "Asha\nKumar\n", output: "A.K.\nr" },
            { label: "Ravi Iyer", input: "Ravi\nIyer\n", output: "R.I.\nr", hidden: true },
            { label: "One-letter surname", input: "Zoe\nX\n", output: "Z.X.\nX", hidden: true, category: "edge" },
          ],
          hints: [
            "Which index gives the first character? The last?",
            "`first[0]`, `last[0]` and `last[-1]`.",
            "Join the initials with dots using `+` or an f-string.",
            "`print(first[0] + \".\" + last[0] + \".\")` then `print(last[-1])`.",
          ],
          solution: r`first = input()
last = input()
print(first[0] + "." + last[0] + ".")
print(last[-1])`,
          notes: "Negative indexes count from the end, so `last[-1]` works for any length — even a one-letter name.",
        },
        {
          id: "stretch", kind: "task", title: "Mask a phone number", difficulty: 2,
          prompt: `Read a 10-digit phone number and print it with all but the last 4 digits replaced by \`*\`:

\`\`\`
******3210
\`\`\``,
          starter: r`phone = input()
`,
          tests: [
            { label: "9876543210", input: "9876543210\n", output: "******3210" },
            { label: "Another", input: "9000012345\n", output: "******2345", hidden: true },
          ],
          hints: [
            "How many characters must be hidden?",
            "`len(phone) - 4` stars, then the last 4 digits.",
            "`\"*\" * n` repeats the star.",
            "`print(\"*\" * (len(phone) - 4) + phone[-4:])`.",
          ],
          solution: r`phone = input()
print("*" * (len(phone) - 4) + phone[-4:])`,
          notes: "Using `len(phone) - 4` (instead of a fixed 6) makes it work for any length. Banks and apps mask numbers exactly like this.",
        },
      ],
      realWorld: "Slicing pulls fields out of fixed-format data (dates like 2026-10-09, roll numbers, bank statements), file extensions, and the last digits of card numbers on receipts.",
      reteach: "Picture the string as a row of numbered boxes, numbered from 0 on the left — and also from -1 on the right. An index opens one box. A slice is a pair of scissors: cut at position `start` and at position `stop`, and keep what's between.",
      summary: [
        "Indexes start at 0; negative indexes count from the end (-1 is the last).",
        "`s[start:stop:step]` — stop excluded; omitted values mean start/end; `[::-1]` reverses.",
        "Strings are immutable: build new strings with slices, `+` and methods.",
      ],
      cpp: {
        python: r`s = "python"
print(s[1:4], s[-1])`,
        cpp: r`string s = "python";
cout << s.substr(1, 3) << " " << s.back();`,
        note: "C++'s `substr(pos, length)` takes a length, not an end index; C++ strings are mutable (`s[0] = 'P'` works).",
      },
    },

    {
      id: "py-string-methods",
      title: "String methods: search, replace, split and join",
      minutes: 17,
      difficulty: 2,
      objectives: [
        "Change case and clean whitespace with string methods",
        "Search with `find`, `count`, `startswith`, `in`; replace with `replace`",
        "Split text into words and join words back into text",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "What does `\"a,b,c\".split(\",\")` return?",
        options: [
          { text: "\"abc\"", why: "split returns a list, not a string." },
          { text: "`['a', 'b', 'c']`", why: "Correct." },
          { text: "`['a,b,c']`", why: "That's what you'd get splitting on a character that isn't there." },
        ],
        answer: 1,
        hint: "split cuts at each separator.",
        explain: "`split(\",\")` cuts the text at every comma and returns the pieces as a list.",
      },
      why: "Cleaning and reshaping text is daily work: trimming spaces from form input, making searches case-insensitive, splitting CSV lines, building sentences from words. String methods do all of it in a line.",
      concept: [
        {
          title: "Case and whitespace",
          body: `\`\`\`python
s = "  Hello World  "
s.upper(), s.lower(), s.title(), s.swapcase()
s.strip()     # "Hello World"   (also lstrip / rstrip)
"ab".center(6, "*")    # "**ab**"
"7".zfill(3)           # "007"
\`\`\`

Methods return **new** strings — assign the result: \`name = name.strip()\`.`,
        },
        {
          title: "Searching and replacing",
          body: `| Method | Result |
| --- | --- |
| \`s.find("x")\` | index of first "x", or -1 |
| \`s.index("x")\` | same, but ValueError if missing |
| \`s.count("x")\` | number of non-overlapping occurrences |
| \`s.startswith("ab")\`, \`s.endswith(".py")\` | True/False |
| \`"x" in s\` | True/False |
| \`s.replace("old", "new")\` | every occurrence replaced (optional count) |`,
        },
        {
          title: "Splitting, joining, classifying",
          body: `\`\`\`python
"one two  three".split()        # ['one', 'two', 'three']  (any whitespace)
"2026-10-09".split("-")         # ['2026', '10', '09']
" | ".join(["a", "b", "c"])     # 'a | b | c'
"line1\\nline2".splitlines()      # ['line1', 'line2']
\`\`\`

\`join\` is called on the **separator** and needs a list of strings.

Character tests: \`isdigit()\`, \`isalpha()\`, \`isalnum()\`, \`isspace()\`, \`isupper()\`, \`islower()\`.`,
        },
      ],
      example: {
        title: "Cleaning a messy entry",
        code: r`raw = "   asha KUMAR , Class 11-B   "
name, cls = raw.split(",")
name = name.strip().title()
cls = cls.strip().replace("Class ", "")
print(name, "|", cls)
print(name.count("a"), name.find("K"), name.startswith("Asha"))
words = "the quick brown fox".split()
print("-".join(words), len(words))
print("2026".isdigit(), "11-B".isalnum())`,
        output: "Asha Kumar | 11-B\n2 5 True\nthe-quick-brown-fox 4\nTrue False\n",
        lines: [
          [2, "Split at the comma into two parts (multiple assignment unpacks them)."],
          [3, "Remove surrounding spaces and fix the capitalisation."],
          [4, "Clean the class field and drop the word \"Class \"."],
          [6, "count is case-sensitive: \"Asha Kumar\" has 2 lower-case a's (A is different); K is at index 5."],
          [7, "With no argument, split uses any run of whitespace."],
          [8, "join is called on the separator."],
          [9, "\"11-B\" contains a dash, so it's not alphanumeric."],
        ],
      },
      mistakes: [
        { title: "Forgetting to assign the result", body: "`name.strip()` on its own does nothing to `name`. Write `name = name.strip()`." },
        { title: "`list.join`", body: "It's `\", \".join(items)`, not `items.join(\", \")`. And every item must be a string: `\", \".join(map(str, nums))`." },
        { title: "`split(\" \")` vs `split()`", body: "`split(\" \")` keeps empty strings for double spaces; `split()` handles any whitespace." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 2,
          code: r`s = "banana"
print(s.find("an"), s.count("an"), s.replace("a", "o", 2))
print("+".join("abc"), "x y  z".split(" "))`,
          answer: "1 2 bonona\na+b+c ['x', 'y', '', 'z']\n",
          hint: "replace's third argument limits the number of replacements; split(\" \") keeps empty pieces.",
          explain: "\"an\" first appears at 1 and occurs twice; only the first two a's become o. join over a string joins its characters. Splitting on single spaces leaves an empty string between the two spaces.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Turn the list into `red, green, blue`.",
          code: r`colors = ["red", "green", "blue"]
print(___.join(colors))`,
          blanks: [["\", \"", "', '"]],
          output: "red, green, blue\n",
          hint: "join is called on the separator string.",
          explain: "`\", \".join(colors)` puts a comma and a space between items.",
        },
        {
          id: "b1", kind: "bug", difficulty: 2,
          prompt: "The input is `  yes  ` (with spaces). This should print `confirmed`. Which line needs fixing?",
          code: r`answer = input()
answer.strip()
if answer == "yes":
    print("confirmed")
else:
    print("cancelled")`,
          input: "  yes  \n",
          line: 2,
          fix: r`answer = input()
answer = answer.strip()
if answer == "yes":
    print("confirmed")
else:
    print("cancelled")`,
          output: "confirmed\n",
          hint: "What happens to the result of `strip()`?",
          explain: "`strip()` returns a new string; without assigning it, `answer` still has the spaces.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 2,
          prompt: "Which is the best way to check, ignoring case, whether a sentence mentions \"python\"?",
          options: [
            { text: "`\"python\" in sentence`", why: "Misses \"Python\"." },
            { text: "`\"python\" in sentence.lower()`", why: "Correct." },
            { text: "`sentence.find(\"python\") == True`", why: "find returns an index, never True." },
          ],
          answer: 1,
          hint: "Normalise the case first.",
          explain: "Lower-casing the sentence makes the membership test case-insensitive.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Username generator", difficulty: 2,
          prompt: `Read a full name (first and last, any spacing/case). Print a username: the first name in lower case, a dot, the last name in lower case — and the length of the username:

\`\`\`
asha.kumar (10)
\`\`\`

(for input \`  Asha   KUMAR \`).`,
          starter: r`full = input()
`,
          tests: [
            { label: "Messy spacing", input: "  Asha   KUMAR \n", output: "asha.kumar (10)" },
            { label: "Simple", input: "Ravi Iyer\n", output: "ravi.iyer (9)", hidden: true },
            { label: "Mixed case", input: "zOE dSouza\n", output: "zoe.dsouza (10)", hidden: true },
          ],
          hints: [
            "Which split handles any amount of whitespace?",
            "`full.split()` gives a list of the words.",
            "Lower-case each part and join them with a dot.",
            "`first, last = full.lower().split()` then `user = first + \".\" + last` and print with `len(user)`.",
          ],
          solution: r`full = input()
first, last = full.lower().split()
user = f"{first}.{last}"
print(f"{user} ({len(user)})")`,
          notes: "`split()` with no argument ignores leading, trailing and repeated spaces — perfect for messy user input.",
        },
        {
          id: "stretch", kind: "task", title: "Censor a word", difficulty: 3,
          prompt: `Read a sentence and a banned word (two lines). Replace every occurrence of the banned word — **ignoring case** — with stars of the same length, keeping the rest of the sentence exactly. Print the result and the number of replacements:

\`\`\`
This is *** and so is ***!
2
\`\`\`

(for \`This is bad and so is BAD!\` and \`bad\`). Hint: search in a lower-cased copy, replace in the original by position.`,
          starter: r`sentence = input()
word = input()
`,
          tests: [
            { label: "Two matches", input: "This is bad and so is BAD!\nbad\n", output: "This is *** and so is ***!\n2" },
            { label: "No match", input: "All good here\nbad\n", output: "All good here\n0", hidden: true, category: "edge" },
            { label: "Inside words too", input: "Spam spammer SPAM\nspam\n", output: "**** ****mer ****\n3", hidden: true },
          ],
          hints: [
            "`replace` is case-sensitive — so search in `sentence.lower()` instead.",
            "Use `find(word, start)` in a loop to locate each match in the lower-cased copy.",
            "At each position, rebuild: `sentence[:pos] + \"*\" * len(word) + sentence[pos + len(word):]`.",
            "Continue searching from `pos + len(word)`; stop when find returns -1.",
          ],
          solution: r`sentence = input()
word = input()
low = sentence.lower()
target = word.lower()
count = 0
pos = low.find(target)
while pos != -1:
    sentence = sentence[:pos] + "*" * len(word) + sentence[pos + len(word):]
    count += 1
    pos = low.find(target, pos + len(word))
print(sentence)
print(count)`,
          notes: "Searching a lower-cased copy and editing the original by position keeps the original's other characters. Because the stars have the same length as the word, positions in both strings stay aligned. (Module 20's `re.sub(..., flags=re.IGNORECASE)` does this in one line.)",
        },
      ],
      realWorld: "Data cleaning pipelines strip, lower-case and split millions of text fields; search boxes normalise case; chat apps filter words; CSV and log parsers split lines into fields.",
      reteach: "String methods are tools on a workbench: `strip` sands off the rough edges, `lower` repaints everything one colour, `split` cuts a plank into pieces at every mark, and `join` glues pieces back together with whatever glue (separator) you choose. Each tool gives you a *new* plank — the original stays as it was.",
      summary: [
        "Case: upper/lower/title; whitespace: strip/lstrip/rstrip — methods return new strings.",
        "Search: find (−1 if missing), index, count, startswith/endswith, `in`; replace for substitution.",
        "`split()` → list of parts; `sep.join(list)` → one string; isdigit/isalpha/isalnum classify characters.",
      ],
    },

    {
      id: "py-string-formatting",
      title: "Formatting text and Unicode",
      minutes: 16,
      difficulty: 2,
      objectives: [
        "Format numbers and align text with f-string format specs",
        "Recognise `str.format()` and `%` formatting in older code",
        "Explain characters, code points and UTF-8 at a basic level",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "What does `f\"{3.14159:.2f}\"` produce?",
        options: [
          { text: "\"3.14\"", why: "Correct — 2 digits after the decimal point." },
          { text: "\"3.1\"", why: ".2 means two decimals." },
          { text: "\"3.14159\"", why: "The format spec changes the display." },
        ],
        answer: 0,
        hint: ".2f = fixed-point, 2 decimals.",
        explain: "`:.2f` rounds to two decimal places for display.",
      },
      why: "Reports, receipts, tables and log messages must look right: aligned columns, two-decimal prices, thousands separators, padded IDs. And because users write in Hindi, Kannada, Tamil, emoji and more, you need to know how Python handles all the world's characters.",
      concept: [
        {
          title: "Format specs in f-strings",
          body: `Inside \`{value:spec}\`:

| Spec | Example | Result |
| --- | --- | --- |
| \`.2f\` | \`f"{2/3:.2f}"\` | \`0.67\` |
| \`,\` | \`f"{1234567:,}"\` | \`1,234,567\` |
| \`>8\` \`<8\` \`^8\` | \`f"{'hi':>5}"\` | \`'   hi'\` |
| \`05d\` | \`f"{42:05d}"\` | \`00042\` |
| \`.1%\` | \`f"{0.256:.1%}"\` | \`25.6%\` |
| \`x\` \`b\` | \`f"{255:x}"\` | \`ff\` |

Expressions work too: \`f"{price * qty:.2f}"\`, and \`f"{name=}"\` prints \`name='Asha'\` (handy for debugging).`,
        },
        {
          title: "Older styles: format() and %",
          body: `You'll meet these in existing code:

\`\`\`python
"{} scored {:.1f}".format("Asha", 91.25)     # 'Asha scored 91.2'
"%s scored %.1f" % ("Asha", 91.25)           # same
\`\`\`

f-strings (Python 3.6+) are the modern choice: shorter and easier to read.`,
        },
        {
          title: "Unicode basics",
          body: `A Python \`str\` is a sequence of **Unicode code points** — numbers for every character in every script. \`ord("A")\` is 65, \`chr(2309)\` is "अ", and \`len("नमस्ते")\` counts code points (6), which isn't always what a reader calls "letters".

To store or send text it is **encoded** to bytes, almost always as **UTF-8**: \`"₹".encode("utf-8")\` is 3 bytes. Always pass \`encoding="utf-8"\` when opening text files (Module 15).`,
        },
      ],
      example: {
        title: "A neat bill",
        code: r`items = [("Chai", 2, 12.5), ("Samosa", 3, 15), ("Paneer roll", 1, 85)]
print(f"{'Item':<12}{'Qty':>4}{'Amount':>10}")
total = 0
for name, qty, price in items:
    amount = qty * price
    total += amount
    print(f"{name:<12}{qty:>4}{amount:>10.2f}")
print(f"{'Total':<16}{total:>10,.2f}")
print("Tax %.1f%%" % 5.0, "| {} items".format(len(items)))
print(ord("A"), chr(8377), len("नमस्ते"), len("₹".encode("utf-8")))`,
        output: "Item         Qty    Amount\nChai           2     25.00\nSamosa         3     45.00\nPaneer roll    1     85.00\nTotal               155.00\nTax 5.0% | 3 items\n65 ₹ 6 3\n",
        lines: [
          [2, "Header: left-align in 12, right-align in 4 and 10."],
          [4, "Each item is a tuple unpacked into three names (Module 9)."],
          [7, "Same widths for every row → aligned columns; amounts with 2 decimals."],
          [8, "`,.2f`: thousands separator and two decimals."],
          [9, "Old-style % formatting (`%%` prints a literal %) and `.format()`."],
          [10, "Code points: A is 65, 8377 is ₹; the Hindi word has 6 code points; ₹ takes 3 bytes in UTF-8."],
        ],
      },
      mistakes: [
        { title: "Formatting before calculating", body: "`f\"{price:.2f}\" * 2` repeats the text. Do the maths inside: `f\"{price * 2:.2f}\"`." },
        { title: "Width without alignment", body: "Strings are left-aligned and numbers right-aligned by default; be explicit with `<` and `>` for tables." },
        { title: "Assuming one character = one byte", body: "In UTF-8 many characters take 2–4 bytes. `len(text)` counts code points, `len(text.encode())` counts bytes." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 2,
          code: r`x = 7.5
print(f"[{x:6.2f}]", f"[{'ok':^6}]", f"{1500000:,}")
print(f"{0.4567:.0%}", f"{9:03d}")`,
          answer: "[  7.50] [  ok  ] 1,500,000\n46% 009\n",
          hint: "Width 6 includes the decimal point; ^ centres.",
          explain: "\"7.50\" padded to 6 → two spaces in front; \"ok\" centred in 6; thousands separators. 0.4567 as a percentage with 0 decimals is 46%; 9 padded to 3 digits.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Right-align the number in 8 characters with 1 decimal: `|    12.3|`.",
          code: r`v = 12.34
print(f"|{v:___}|")`,
          blanks: [[">8.1f", "8.1f"]],
          output: "|    12.3|\n",
          hint: "Alignment, width, precision, type.",
          explain: "`>8.1f` right-aligns in 8 characters with one decimal (numbers right-align by default, so `8.1f` also works).",
        },
        {
          id: "b1", kind: "bug", difficulty: 2,
          prompt: "This should print `Total: 30.00` but prints `Total: 15.0015.00`. Which line?",
          code: r`price = 15
line = f"{price:.2f}" * 2
print("Total:", line)`,
          line: 2,
          fix: r`price = 15
line = f"{price * 2:.2f}"
print("Total:", line)`,
          output: "Total: 30.00\n",
          hint: "Is the multiplication done on a number or on text?",
          explain: "The f-string turns the price into text first; `* 2` then repeats the text. Multiply inside the braces.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 2,
          prompt: "What does `ord(\"a\")` return?",
          options: [
            { text: "1", why: "Code points aren't alphabet positions." },
            { text: "97", why: "Correct — the Unicode code point of 'a'." },
            { text: "\"a\"", why: "ord returns a number; chr goes the other way." },
          ],
          answer: 1,
          hint: "ord gives the character's code point.",
          explain: "'a' is code point 97 (and 'A' is 65). `chr(97)` gives back 'a'.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Mark sheet table", difficulty: 2,
          prompt: `Read three lines, each \`name marks\` (marks out of 50). Print a table: name left-aligned in 8, marks right-aligned in 3, percentage right-aligned in 7 with 1 decimal and a % sign:

\`\`\`
Asha     42  84.0%
Ravi     37  74.0%
Zoe      50 100.0%
\`\`\``,
          starter: r`for _ in range(3):
    name, marks = input().split()
`,
          tests: [
            { label: "Three students", input: "Asha 42\nRavi 37\nZoe 50\n", output: "Asha     42  84.0%\nRavi     37  74.0%\nZoe      50 100.0%" },
            { label: "Low marks", input: "Al 0\nBea 5\nCy 49\n", output: "Al        0   0.0%\nBea       5  10.0%\nCy       49  98.0%", hidden: true, category: "edge" },
          ],
          hints: [
            "Convert marks to int, then the percentage is marks / 50 * 100.",
            "Format specs: `:<8`, `:>3`, `:>6.1f` followed by a literal `%`.",
            "The percentage column is 7 wide including the %, so the number gets 6.",
            "`print(f\"{name:<8}{m:>3}{m / 50 * 100:>6.1f}%\")`.",
          ],
          solution: r`for _ in range(3):
    name, marks = input().split()
    m = int(marks)
    print(f"{name:<8}{m:>3}{m / 50 * 100:>6.1f}%")`,
          notes: "Fixed widths line up the columns. (`:.1%` would also work on `m / 50`, but then the % sign is inside the width.)",
        },
        {
          id: "stretch", kind: "task", title: "Caesar cipher", difficulty: 3,
          prompt: `Read a message and a shift (a whole number). Shift every **lower-case** letter forward by the shift, wrapping from z to a; leave everything else unchanged. Use \`ord\` and \`chr\`:

\`\`\`
khoor, zruog!
\`\`\`

(for \`hello, world!\` and \`3\`).`,
          starter: r`msg = input()
shift = int(input())
`,
          tests: [
            { label: "Shift 3", input: "hello, world!\n3\n", output: "khoor, zruog!" },
            { label: "Wrap around", input: "xyz\n3\n", output: "abc", category: "boundary" },
            { label: "Capitals unchanged", input: "Hi there\n1\n", output: "Hj uifsf", hidden: true, category: "edge" },
            { label: "Shift 26", input: "same\n26\n", output: "same", hidden: true, category: "edge" },
          ],
          hints: [
            "Convert a letter to a number 0–25: `ord(ch) - ord(\"a\")`.",
            "Add the shift and wrap with `% 26`.",
            "Back to a letter: `chr(new + ord(\"a\"))`.",
            "Build the result with `+=` in a loop; only transform when `\"a\" <= ch <= \"z\"`.",
          ],
          solution: r`msg = input()
shift = int(input())
out = ""
for ch in msg:
    if "a" <= ch <= "z":
        out += chr((ord(ch) - ord("a") + shift) % 26 + ord("a"))
    else:
        out += ch
print(out)`,
          notes: "`% 26` handles wrap-around and any shift size. Building a string with `+=` in a loop is fine for short text; for long text collect characters in a list and `\"\".join` them.",
        },
      ],
      realWorld: "Invoices, payslips and dashboards format numbers with separators and fixed decimals; Indian apps format rupees and dates; every web app must handle UTF-8 text in many scripts correctly.",
      reteach: "A format spec is a set of instructions for a sign-painter: how wide the board is (`8`), which side to paint on (`<`, `>`, `^`), how many decimals (`.2f`). Unicode is the giant dictionary that gives every character in every language a number; UTF-8 is the way those numbers are packed into bytes.",
      summary: [
        "f-string specs: width/alignment `<8 >8 ^8`, `.2f`, `,`, `05d`, `.1%`, `x`/`b`; `{x=}` for debugging.",
        "`str.format()` and `%` formatting appear in older code; prefer f-strings.",
        "str = Unicode code points (`ord`/`chr`); files and networks use UTF-8 bytes.",
      ],
    },

    {
      id: "py-string-problems",
      title: "Classic string problems",
      minutes: 18,
      difficulty: 3,
      objectives: [
        "Check palindromes and anagrams correctly",
        "Count character and word frequencies",
        "Combine slicing, methods and loops to solve string challenges",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "Which check tells whether `s` is a palindrome (reads the same backwards)?",
        options: [
          { text: "`s == s[::-1]`", why: "Correct." },
          { text: "`s == sorted(s)`", why: "That compares with a sorted list." },
          { text: "`s[0] == s[-1]`", why: "Only checks the first and last characters." },
        ],
        answer: 0,
        hint: "Reverse it and compare.",
        explain: "`s[::-1]` is s reversed; a palindrome equals its reverse.",
      },
      why: "Palindromes, anagrams and frequency counts appear in interviews, puzzles and real tasks: spotting duplicate names, word clouds, spam detection, DNA analysis. They train you to combine the string tools you know.",
      concept: [
        {
          title: "Palindromes and normalisation",
          body: `\`s == s[::-1]\` works for clean text. Real sentences need **normalising** first — keep only letters/digits and ignore case:

\`\`\`python
clean = "".join(ch.lower() for ch in s if ch.isalnum())
is_pal = clean == clean[::-1]
\`\`\`

("A man, a plan, a canal: Panama" is a palindrome after cleaning.)`,
        },
        {
          title: "Anagrams",
          body: `Two words are anagrams if they use the same letters the same number of times: "listen" / "silent". Compare their **sorted** letters:

\`\`\`python
sorted("listen") == sorted("silent")    # True
\`\`\`

(Normalise case and spaces first for phrases.)`,
        },
        {
          title: "Frequency counting",
          body: `Count with a dictionary (Module 11) — or, for now, with \`str.count\` on each distinct character:

\`\`\`python
for ch in sorted(set(word)):
    print(ch, word.count(ch))
\`\`\`

\`set(word)\` gives the distinct characters (Module 10). For long texts a dictionary or \`collections.Counter\` is faster: one pass instead of one pass per character.`,
        },
      ],
      example: {
        title: "Three classic checks",
        code: r`phrase = "Never odd or even"
clean = "".join(ch.lower() for ch in phrase if ch.isalnum())
print(clean, clean == clean[::-1])
a, b = "Dormitory", "dirty room"
key = lambda s: sorted(s.lower().replace(" ", ""))
print(key(a) == key(b))
word = "mississippi"
for ch in sorted(set(word)):
    print(ch, word.count(ch), end="; ")
print()`,
        output: "neveroddoreven True\nTrue\ni 4; m 1; p 2; s 4; \n",
        lines: [
          [2, "Keep letters/digits, lower-cased, joined into one string (a generator expression, Module 13)."],
          [3, "Compare with its reverse: a palindrome."],
          [5, "A small helper: lower-case, drop spaces, sort the letters (`lambda` is covered in Module 18)."],
          [6, "Same sorted letters → anagrams."],
          [8, "Distinct letters in alphabetical order, each with its count."],
        ],
      },
      mistakes: [
        { title: "Forgetting to normalise", body: "\"Racecar\" isn't equal to \"racecaR\" — lower-case first, and drop punctuation for sentences." },
        { title: "Comparing sorted lists to strings", body: "`sorted(\"abc\")` is a list `['a','b','c']`, not \"abc\". Compare sorted with sorted, or `\"\".join(sorted(s))`." },
        { title: "Quadratic counting on big text", body: "Calling `count` for every character re-scans the text each time. Use a dict/Counter for long inputs." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`s = "level"
t = "Level"
print(s == s[::-1], t == t[::-1], t.lower() == t.lower()[::-1])
print(sorted("cab"), "".join(sorted("cab")))`,
          answer: "True False True\n['a', 'b', 'c'] abc\n",
          hint: "Case matters until you lower() it.",
          explain: "\"level\" reversed is the same; \"Level\" reversed is \"leveL\". After lowering it's a palindrome. sorted gives a list; join makes it a string.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Check whether two words are anagrams (prints `True`).",
          code: r`x, y = "night", "thing"
print(___(x) == ___(y))`,
          blanks: [["sorted"], ["sorted"]],
          output: "True\n",
          hint: "Same letters in the same amounts ⇔ same letters when sorted.",
          explain: "`sorted(x) == sorted(y)` compares the letters regardless of order.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "This should print `True` for the palindrome sentence, but prints `False`. Which line is the bug?",
          code: r`s = "Was it a car or a cat I saw"
clean = s.lower()
print(clean == clean[::-1])`,
          line: 2,
          fix: r`s = "Was it a car or a cat I saw"
clean = s.lower().replace(" ", "")
print(clean == clean[::-1])`,
          output: "True\n",
          hint: "What else besides case differs between the sentence and its reverse?",
          explain: "The spaces are in different places when reversed. Remove them (and punctuation, if any) before comparing.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "Which approach counts how often each character appears in a 1,000,000-character text most efficiently?",
          options: [
            { text: "For each distinct character, call `text.count(ch)`", why: "Re-scans the whole text once per distinct character." },
            { text: "One loop over the text updating a dictionary of counts", why: "Correct — one pass, O(n)." },
            { text: "Sort the text, then compare neighbours", why: "Works but sorting costs O(n log n)." },
          ],
          answer: 1,
          hint: "How many times does each approach read the text?",
          explain: "A single pass with a dictionary (or collections.Counter) reads each character once.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Sentence palindrome", difficulty: 2,
          prompt: `Read a sentence. Ignoring case, spaces and punctuation (keep only letters and digits), print \`palindrome\` or \`not a palindrome\`.`,
          starter: r`s = input()
`,
          tests: [
            { label: "Panama", input: "A man, a plan, a canal: Panama\n", output: "palindrome" },
            { label: "Not one", input: "Hello, world\n", output: "not a palindrome" },
            { label: "Digits", input: "12 3 21\n", output: "palindrome", hidden: true },
            { label: "Single char", input: "x\n", output: "palindrome", hidden: true, category: "edge" },
            { label: "Almost", input: "Racecars\n", output: "not a palindrome", hidden: true },
          ],
          hints: [
            "First build a cleaned version of the sentence.",
            "Loop over characters, keep `ch.lower()` when `ch.isalnum()`.",
            "Compare the cleaned string with its reverse.",
            "`clean = \"\".join(ch.lower() for ch in s if ch.isalnum())` then compare with `clean[::-1]`.",
          ],
          solution: r`s = input()
clean = ""
for ch in s:
    if ch.isalnum():
        clean += ch.lower()
print("palindrome" if clean == clean[::-1] else "not a palindrome")`,
          notes: "Normalise, then compare with the reverse. The loop builds the same string the one-line generator expression would.",
        },
        {
          id: "stretch", kind: "challenge", title: "Most frequent letter", difficulty: 3,
          prompt: `Read a line of text. Print the most frequent **letter** (ignore case, ignore non-letters) and its count, like \`e 4\`. If several letters tie, print the one that comes first in the alphabet. If there are no letters, print \`none\`.`,
          starter: r`text = input()
`,
          tests: [
            { label: "Sentence", input: "Here we see eleven trees\n", output: "e 10" },
            { label: "Tie → alphabetical", input: "aabb\n", output: "a 2", category: "edge" },
            { label: "No letters", input: "123 !!\n", output: "none", hidden: true, category: "edge" },
            { label: "Mixed case", input: "Mississippi\n", output: "i 4", hidden: true },
          ],
          hints: [
            "Clean first: lower-case letters only.",
            "Loop over the distinct letters in alphabetical order and count each.",
            "Keep a running best: replace it only when a count is strictly higher (so ties keep the earlier letter).",
            "`for ch in sorted(set(clean)): c = clean.count(ch); if c > best_count: ...`.",
          ],
          solution: r`text = input()
clean = "".join(ch for ch in text.lower() if ch.isalpha())
best, best_count = None, 0
for ch in sorted(set(clean)):
    c = clean.count(ch)
    if c > best_count:
        best, best_count = ch, c
print(f"{best} {best_count}" if best else "none")`,
          notes: "Visiting letters alphabetically and updating only on a strictly greater count resolves ties towards the earlier letter. Module 11 shows the one-pass dictionary version.",
        },
      ],
      realWorld: "Plagiarism checkers and search engines normalise text before comparing; word-frequency counts drive search ranking and word clouds; anagram-style 'signature' keys group equivalent items (Module 11).",
      reteach: "Most string puzzles have two steps: first *clean* the text so irrelevant differences disappear (case, spaces, punctuation), then *compare or count*. Palindrome = compare with its mirror image; anagram = compare the sorted letters; frequency = count each distinct letter.",
      summary: [
        "Normalise first: lower-case and keep only `isalnum()` characters.",
        "Palindrome: `s == s[::-1]`; anagram: `sorted(a) == sorted(b)`.",
        "Frequency: count each distinct character; for big text use one pass with a dict/Counter.",
      ],
    },
  ],
  exam: [
    {
      id: "e1", kind: "predict", difficulty: 3,
      code: r`s = "Data Science"
print(s[5:], s[:4].upper(), s.split()[1][::-1])
print(s.lower().count("e"), s.find("z"), "-".join(s.split()))`,
      answer: "Science DATA ecneicS\n2 -1 Data-Science\n",
      hint: "Work out each piece separately — and count the e's carefully.",
      explain: "s[5:] is \"Science\"; first four upper-cased; the second word reversed. \"data science\" has two e's (both in \"science\"); find returns -1 for a missing char; join puts a dash between the words.",
    },
    {
      id: "e2", kind: "mcq", difficulty: 2,
      prompt: "Which line produces `007`?",
      options: [
        { text: "`f\"{7:3d}\"`", why: "That pads with spaces: '  7'." },
        { text: "`f\"{7:03d}\"`", why: "Correct — zero-padded to width 3." },
        { text: "`\"7\" * 3`", why: "That's '777'." },
      ],
      answer: 1,
      hint: "Zero padding goes before the width.",
      explain: "`03d` pads an integer with zeros to width 3. `\"7\".zfill(3)` also works.",
    },
    {
      id: "e3", kind: "fill", difficulty: 2,
      prompt: "Split a date into its parts.",
      code: r`d = "09/10/2026"
day, month, year = d.___("/")
print(year, month, day)`,
      blanks: [["split"]],
      output: "2026 10 09\n",
      hint: "Cut at each slash.",
      explain: "`split(\"/\")` returns three strings, unpacked into three names.",
    },
    {
      id: "e4", kind: "bug", difficulty: 3,
      prompt: "This should print the numbers joined with commas (`1,2,3`) but crashes. Which line?",
      code: r`nums = [1, 2, 3]
text = ",".join(nums)
print(text)`,
      line: 2,
      fix: r`nums = [1, 2, 3]
text = ",".join(str(n) for n in nums)
print(text)`,
      output: "1,2,3\n",
      hint: "What type must the items be for join?",
      explain: "`join` only accepts strings; joining ints raises TypeError. Convert each item with `str` (or `map(str, nums)`).",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: text analyser", difficulty: 3,
    prompt: `Read one paragraph (a single line). Print a report — for \`the fox jumps over the lazy dog. it ran quickly!\`:

\`\`\`
Characters: 48
Words: 10
Sentences: 2
Longest word: quickly
Capitalised: The Fox Jumps Over The Lazy Dog. It Ran Quickly!
\`\`\`

- Characters: \`len\` of the line as typed.
- Words: split on whitespace.
- Sentences: count of \`.\`, \`!\` and \`?\` characters.
- Longest word: strip punctuation \`.,!?;:\` from each word and lower-case it; on a tie, the **first** longest wins.
- Capitalised: \`title()\` of the line.`,
    starter: r`text = input()
`,
    tests: [
      { label: "Two sentences", input: "the fox jumps over the lazy dog. it ran quickly!\n", output: "Characters: 48\nWords: 10\nSentences: 2\nLongest word: quickly\nCapitalised: The Fox Jumps Over The Lazy Dog. It Ran Quickly!" },
      { label: "Question", input: "Is Python fun? Yes, very.\n", output: "Characters: 25\nWords: 5\nSentences: 2\nLongest word: python\nCapitalised: Is Python Fun? Yes, Very.", hidden: true },
      { label: "No punctuation", input: "hello world\n", output: "Characters: 11\nWords: 2\nSentences: 0\nLongest word: hello\nCapitalised: Hello World", hidden: true, category: "edge" },
    ],
    hints: [
      "Each line of the report is one small calculation.",
      "Sentences: `text.count(\".\") + text.count(\"!\") + text.count(\"?\")`.",
      "Longest word: loop over `text.split()`, clean each with `.strip(\".,!?;:\").lower()`, keep it if strictly longer.",
      "Capitalised: `text.title()`.",
    ],
    solution: r`text = input()
words = text.split()
print("Characters:", len(text))
print("Words:", len(words))
print("Sentences:", text.count(".") + text.count("!") + text.count("?"))
longest = ""
for w in words:
    w = w.strip(".,!?;:").lower()
    if len(w) > len(longest):
        longest = w
print("Longest word:", longest)
print("Capitalised:", text.title())`,
    notes: "Counting, splitting, stripping, lower-casing, title-casing and a running 'longest so far' — a compact tour of the module.",
  },
};
