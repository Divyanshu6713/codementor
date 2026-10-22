import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 6 — Loops. */
export const M06: PyModuleDef = {
  id: "py-loops",
  number: 6,
  level: 1,
  title: "Loops",
  summary: "while and for loops, range(), break/continue/pass, loop else, avoiding infinite loops, counters and accumulators, number problems, nested loops and patterns, dry runs and time-complexity intuition.",
  track: "core",
  prereqs: ["py-conditions"],
  lessons: [
    {
      id: "py-while-loops",
      title: "while loops",
      minutes: 15,
      difficulty: 2,
      objectives: [
        "Repeat code while a condition stays true",
        "Make sure every while loop moves towards stopping",
        "Use a while loop to process input until a sentinel value",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 1,
        prompt: "`n = 3`, then `while n > 0: print(n); n -= 1`. How many lines are printed?",
        options: [
          { text: "2", why: "Count again: 3, 2, 1." },
          { text: "3", why: "Correct: 3, 2 and 1 — then n is 0 and the condition is False." },
          { text: "Infinitely many", why: "n decreases each time, so the loop ends." },
        ],
        answer: 1,
        hint: "Trace n: 3 → 2 → 1 → 0.",
        explain: "The body runs for n = 3, 2, 1; when n becomes 0, `n > 0` is False and the loop stops.",
      },
      why: "Many tasks repeat an unknown number of times: keep asking until the answer is valid, keep halving until the number is small, keep reading until the input ends. `while` is the loop for \"repeat as long as…\".",
      concept: [
        {
          title: "How a while loop runs",
          body: `\`\`\`python
count = 1
while count <= 3:
    print("Round", count)
    count += 1
print("Done")
\`\`\`

1. Check the condition. 2. If True, run the body, then go back to step 1. 3. If False, continue after the loop.

The condition is checked **before** each round — if it's False at the start, the body never runs.`,
        },
        {
          title: "Infinite loops and termination",
          body: `If nothing in the body changes the condition, the loop never stops:

\`\`\`python
n = 5
while n > 0:
    print(n)      # forgot n -= 1  → runs forever
\`\`\`

Before writing a while loop, answer: **what changes each round, and why will the condition eventually become False?** (In CodeMentor the sandbox stops runaway programs after about 2 seconds.)

\`while True:\` with a \`break\` inside is a deliberate, common pattern (next lessons).`,
        },
        {
          title: "Sentinel loops",
          body: `Read values until a special "stop" value (the **sentinel**):

\`\`\`python
total = 0
value = int(input())
while value != 0:      # 0 means "no more numbers"
    total += value
    value = int(input())
print(total)
\`\`\``,
        },
      ],
      example: {
        title: "Halving until small",
        code: r`n = 100
steps = 0
while n > 1:
    n = n // 2
    steps += 1
    print("step", steps, "->", n)
print("finished after", steps, "steps")`,
        output: "step 1 -> 50\nstep 2 -> 25\nstep 3 -> 12\nstep 4 -> 6\nstep 5 -> 3\nstep 6 -> 1\nfinished after 6 steps\n",
        lines: [
          [3, "Checked before every round: keep going while n is bigger than 1."],
          [4, "Progress: n halves (whole-number division) each round, so it must eventually reach 1."],
          [5, "A counter: how many rounds have run."],
          [7, "After the loop ends (n is 1), report the count."],
        ],
      },
      mistakes: [
        { title: "Forgetting to update the variable", body: "If the body never changes what the condition tests, the loop runs forever." },
        { title: "Off-by-one conditions", body: "`while i < 5` and `while i <= 5` differ by one round. Trace the first and last round on paper." },
        { title: "Reading input only once in a sentinel loop", body: "The next value must be read inside the loop, at the end of the body." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 2,
          code: r`i = 10
while i > 0:
    print(i, end=" ")
    i -= 3
print()
print("i =", i)`,
          answer: "10 7 4 1 \ni = -2\n",
          hint: "Subtract 3 each time and check before every round.",
          explain: "The body runs for 10, 7, 4, 1; then i becomes -2 and `i > 0` is False. `print()` ends the line.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Make the loop stop: it should print 1 2 3.",
          code: r`k = 1
while k <= 3:
    print(k)
    k ___ 1`,
          blanks: [["+="]],
          output: "1\n2\n3\n",
          hint: "Increase k each round.",
          explain: "`k += 1` moves k towards making `k <= 3` False.",
        },
        {
          id: "b1", kind: "bug", difficulty: 2,
          prompt: "This should count down 5 4 3 2 1 but never stops. Which line is wrong?",
          code: r`n = 5
while n > 0:
    print(n)
    n += 1`,
          line: 4,
          fix: r`n = 5
while n > 0:
    print(n)
    n -= 1`,
          output: "5\n4\n3\n2\n1\n",
          hint: "Is n moving towards 0?",
          explain: "`n += 1` moves n away from 0, so `n > 0` stays True forever. It must decrease: `n -= 1`.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 2,
          prompt: "`x = 10` then `while x < 5: print(x)`. What happens?",
          options: [
            { text: "Prints 10 once", why: "The condition is checked before the first round." },
            { text: "Nothing is printed", why: "Correct — 10 < 5 is False from the start." },
            { text: "Infinite loop", why: "The body never runs." },
          ],
          answer: 1,
          hint: "When is the condition first checked?",
          explain: "A while loop may run zero times: the condition is tested before each round, including the first.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Sum until zero", difficulty: 2,
          prompt: `Read whole numbers, one per line, until the number \`0\` appears. Print their total and how many numbers there were (not counting the 0):

\`\`\`
Total: 30
Count: 3
\`\`\`

(for 5, 10, 15, 0).`,
          starter: r`total = 0
count = 0
value = int(input())
`,
          tests: [
            { label: "5 10 15 0", input: "5\n10\n15\n0\n", output: "Total: 30\nCount: 3" },
            { label: "Only 0", input: "0\n", output: "Total: 0\nCount: 0", category: "edge" },
            { label: "Negatives", input: "-4\n7\n-3\n0\n", output: "Total: 0\nCount: 3", hidden: true },
            { label: "One number", input: "42\n0\n", output: "Total: 42\nCount: 1", hidden: true },
          ],
          hints: [
            "What condition should keep the loop going?",
            "`while value != 0:`",
            "Inside: add to `total`, add 1 to `count`, then read the next value.",
            "Reading the next value must be the last line of the body.",
          ],
          solution: r`total = 0
count = 0
value = int(input())
while value != 0:
    total += value
    count += 1
    value = int(input())
print("Total:", total)
print("Count:", count)`,
          notes: "The classic sentinel pattern: read once before the loop, then read again at the end of each round.",
        },
        {
          id: "stretch", kind: "task", title: "Count the digits", difficulty: 3,
          prompt: `Read a non-negative whole number and print how many digits it has, using a while loop and \`// 10\` (no strings). Note that \`0\` has 1 digit.`,
          starter: r`n = int(input())
`,
          tests: [
            { label: "4728", input: "4728\n", output: "4" },
            { label: "0", input: "0\n", output: "1", category: "edge" },
            { label: "7", input: "7\n", output: "1", hidden: true, category: "boundary" },
            { label: "1000000", input: "1000000\n", output: "7", hidden: true },
          ],
          hints: [
            "What does `n // 10` do to the number of digits?",
            "Each `// 10` removes one digit; count how many times until n is 0.",
            "0 needs special care: the loop `while n > 0` wouldn't run.",
            "Start `digits = 1` and loop `while n >= 10: n //= 10; digits += 1`.",
          ],
          solution: r`n = int(input())
digits = 1
while n >= 10:
    n //= 10
    digits += 1
print(digits)`,
          notes: "Starting at 1 and looping while n has more than one digit handles 0 neatly. The number of rounds grows with the number of digits — about log₁₀(n).",
        },
      ],
      realWorld: "Servers run `while True:` loops waiting for requests; games run a loop until the player quits; retry logic loops until a network call succeeds or attempts run out.",
      reteach: "A while loop is a 'keep going until' instruction: *keep stirring while the sauce is lumpy*. You check the sauce before every stir. If stirring never changes the sauce, you'd stir forever — so something in the body must make progress.",
      summary: [
        "`while condition:` repeats the body as long as the condition is true; it's checked before each round.",
        "Every loop needs progress towards stopping; otherwise it's an infinite loop.",
        "Sentinel loops read until a stop value; read once before and again at the end of the body.",
      ],
      cpp: {
        python: r`while n > 0:
    n //= 10`,
        cpp: r`while (n > 0) {
    n /= 10;
}`,
        note: "Same idea; Python uses `:` and indentation, and has no `do … while` (use `while True:` with `break`).",
      },
    },

    {
      id: "py-for-range",
      title: "for loops and range()",
      minutes: 15,
      difficulty: 1,
      objectives: [
        "Loop over the items of a string or list with `for`",
        "Generate number sequences with `range(stop)`, `range(start, stop)`, `range(start, stop, step)`",
        "Choose between `for` and `while`",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 1,
        prompt: "Which numbers does `range(1, 5)` produce?",
        options: [
          { text: "1, 2, 3, 4, 5", why: "The stop value is excluded." },
          { text: "1, 2, 3, 4", why: "Correct — start is included, stop is not." },
          { text: "0, 1, 2, 3, 4", why: "That's `range(5)`." },
        ],
        answer: 1,
        hint: "range stops *before* the stop value.",
        explain: "`range(start, stop)` includes start and excludes stop.",
      },
      why: "Most repetition has a known size: every student in a list, every character in a word, every number from 1 to n. Python's `for` loop walks through such sequences directly and is the loop you'll write most often.",
      concept: [
        {
          title: "for item in sequence",
          body: `\`\`\`python
for letter in "hey":
    print(letter)          # h, e, y on separate lines

for name in ["Asha", "Ravi"]:
    print("Hello", name)
\`\`\`

The loop variable takes each item in turn; the body runs once per item. No counter to manage, so no off-by-one mistakes.`,
        },
        {
          title: "range()",
          body: `| Call | Produces |
| --- | --- |
| \`range(5)\` | 0 1 2 3 4 |
| \`range(2, 6)\` | 2 3 4 5 |
| \`range(1, 10, 3)\` | 1 4 7 |
| \`range(5, 0, -1)\` | 5 4 3 2 1 |

Rule: **start included, stop excluded**. \`range(n)\` runs exactly n times. \`range\` produces numbers lazily, so \`range(10**9)\` costs no memory.`,
        },
        {
          title: "for or while?",
          body: `- Know the items or the count in advance → **for**.
- Repeat until something happens (unknown count) → **while**.

\`for i in range(len(names)):\` works but is usually un-Pythonic; loop over the items directly, or use \`enumerate\` (Module 13) when you need the index too.`,
        },
      ],
      example: {
        title: "Times table and countdown",
        code: r`n = int(input())
for i in range(1, 6):
    print(n, "x", i, "=", n * i)
for t in range(3, 0, -1):
    print(t, end=" ")
print("Go!")
for ch in "ok":
    print(ch.upper())`,
        input: "7\n",
        output: "7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35\n3 2 1 Go!\nO\nK\n",
        lines: [
          [2, "i takes the values 1, 2, 3, 4, 5 (6 is excluded)."],
          [3, "The body runs once for each value of i."],
          [4, "A negative step counts down: 3, 2, 1."],
          [5, "`end=\" \"` keeps the countdown on one line."],
          [7, "Looping over a string gives one character at a time."],
        ],
      },
      mistakes: [
        { title: "Expecting range to include stop", body: "`range(1, 10)` stops at 9. For 1 to 10 use `range(1, 11)`." },
        { title: "Changing the loop variable to skip items", body: "Assigning to `i` inside `for i in range(...)` doesn't affect the next value. Use `continue` or a while loop." },
        { title: "Counting down without a negative step", body: "`range(5, 0)` is empty. Use `range(5, 0, -1)`." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 1,
          code: r`for i in range(0, 10, 4):
    print(i)
print(list(range(3)))`,
          answer: "0\n4\n8\n[0, 1, 2]\n",
          hint: "Start at 0, add 4 each time, stop before 10.",
          explain: "0, 4, 8 (12 would be past 10). `list(range(3))` shows [0, 1, 2].",
        },
        {
          id: "p2", kind: "predict", difficulty: 2,
          code: r`for i in range(3):
    i = i * 10
    print(i, end=" ")
print()`,
          answer: "0 10 20 \n",
          hint: "Does changing i affect the next round?",
          explain: "Each round i is set fresh from the range (0, 1, 2); multiplying it only changes it for that round.",
        },
        {
          id: "f1", kind: "fill", difficulty: 1,
          prompt: "Print the numbers 1 to 5.",
          code: r`for n in range(1, ___):
    print(n)`,
          blanks: [["6"]],
          output: "1\n2\n3\n4\n5\n",
          hint: "The stop value is excluded.",
          explain: "`range(1, 6)` gives 1–5.",
        },
        {
          id: "b1", kind: "bug", difficulty: 2,
          prompt: "This should print the even numbers from 10 down to 2. Which line is wrong?",
          code: r`for n in range(10, 0, 2):
    print(n)`,
          line: 1,
          fix: r`for n in range(10, 0, -2):
    print(n)`,
          output: "10\n8\n6\n4\n2\n",
          hint: "Counting down needs which kind of step?",
          explain: "With a positive step, `range(10, 0, 2)` is empty. A step of -2 counts down.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Sum 1 to n", difficulty: 1,
          prompt: `Read \`n\` and print the sum 1 + 2 + … + n using a for loop.`,
          starter: r`n = int(input())
total = 0
`,
          tests: [
            { label: "n = 10", input: "10\n", output: "55" },
            { label: "n = 1", input: "1\n", output: "1", hidden: true, category: "boundary" },
            { label: "n = 0", input: "0\n", output: "0", hidden: true, category: "edge" },
            { label: "n = 1000", input: "1000\n", output: "500500", hidden: true },
          ],
          hints: [
            "Which range gives 1 to n inclusive?",
            "`range(1, n + 1)`.",
            "Add each number to `total` inside the loop.",
            "`for i in range(1, n + 1): total += i`, then `print(total)`.",
          ],
          solution: r`n = int(input())
total = 0
for i in range(1, n + 1):
    total += i
print(total)`,
          notes: "For n = 0 the range is empty and the total stays 0. (Gauss's formula n(n+1)/2 gives the same answer without a loop.)",
        },
        {
          id: "stretch", kind: "task", title: "Count vowels in a word", difficulty: 2,
          prompt: `Read a word and print how many of its letters are vowels (a, e, i, o, u — upper or lower case).`,
          starter: r`word = input()
`,
          tests: [
            { label: "education", input: "education\n", output: "5" },
            { label: "Rhythm", input: "Rhythm\n", output: "0", hidden: true, category: "edge" },
            { label: "AEIOU", input: "AEIOU\n", output: "5", hidden: true },
            { label: "Banana", input: "Banana\n", output: "3", hidden: true },
          ],
          hints: [
            "How do you visit each letter?",
            "`for ch in word:` and check `ch in \"aeiou\"`.",
            "Handle capitals with `ch.lower()`.",
            "Keep a counter that goes up by 1 for each vowel.",
          ],
          solution: r`word = input()
count = 0
for ch in word:
    if ch.lower() in "aeiou":
        count += 1
print(count)`,
          notes: "Looping directly over the string is simpler than indexing. Lower-casing each character makes the check case-insensitive.",
        },
      ],
      realWorld: "Processing every row of a spreadsheet, every file in a folder, every pixel in an image or every user in a database is a for loop. range() drives anything counted: pages, retries, simulation steps.",
      reteach: "A for loop is a conveyor belt: items come past one at a time, and for each one you do the same job. `range` is a conveyor belt of numbers that starts where you say and stops just before the number you give.",
      summary: [
        "`for x in sequence:` runs the body once per item.",
        "`range(start, stop, step)`: start included, stop excluded; negative steps count down.",
        "Use for when the items/count are known; while for 'until something happens'.",
      ],
      cpp: {
        python: r`for i in range(1, 6):
    print(i)`,
        cpp: r`for (int i = 1; i < 6; i++) {
    cout << i << endl;
}`,
        note: "C++'s for loop manages a counter explicitly; Python's for walks through a sequence (range produces the numbers). C++11's range-for `for (auto x : v)` is the closer equivalent of Python's for.",
      },
    },

    {
      id: "py-break-continue",
      title: "break, continue, pass and loop else",
      minutes: 15,
      difficulty: 2,
      objectives: [
        "Leave a loop early with `break`",
        "Skip to the next round with `continue`",
        "Use `pass` as a placeholder and `else` on loops for 'not found' cases",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "What does `continue` do inside a loop?",
        options: [
          { text: "Stops the loop completely", why: "That's `break`." },
          { text: "Skips the rest of this round and starts the next one", why: "Correct." },
          { text: "Does nothing", why: "That's `pass`." },
        ],
        answer: 1,
        hint: "\"Continue with the next round.\"",
        explain: "`continue` jumps straight to the next round; `break` leaves the loop; `pass` does nothing.",
      },
      why: "Real loops often need to stop early (found what we were looking for), skip bad data (blank lines), or wait for a special signal. `break` and `continue` keep this logic simple; loop `else` is Python's neat way to say \"searched everything, found nothing\".",
      concept: [
        {
          title: "break and continue",
          body: `\`\`\`python
for n in [4, 7, -1, 9]:
    if n < 0:
        break          # stop the whole loop
    print(n)           # 4, 7

for n in [4, 0, 9]:
    if n == 0:
        continue       # skip this one
    print(10 / n)      # 2.5, then 1.11…
\`\`\`

Both affect only the **innermost** loop they're in.`,
        },
        {
          title: "while True with break",
          body: `When the stopping test belongs in the middle of the body:

\`\`\`python
while True:
    answer = input()
    if answer == "quit":
        break
    print("You said", answer)
\`\`\`

This is Python's version of a do-while loop.`,
        },
        {
          title: "pass and loop else",
          body: `\`pass\` does nothing — a placeholder where a statement is required (\`if x: pass\` while you're still writing it).

A loop can have an \`else\`: it runs if the loop finished **without** \`break\`:

\`\`\`python
for n in numbers:
    if n % 7 == 0:
        print("found", n)
        break
else:
    print("no multiple of 7")
\`\`\``,
        },
      ],
      example: {
        title: "Searching for a prime factor",
        code: r`n = 91
for d in range(2, n):
    if n % d == 0:
        print(n, "is divisible by", d)
        break
else:
    print(n, "is prime")
for word in ["ok", "", "fine", "skip", "end", "never"]:
    if word == "":
        continue
    if word == "end":
        break
    if word == "skip":
        pass
    print(word)`,
        output: "91 is divisible by 7\nok\nfine\nskip\n",
        lines: [
          [2, "Try every possible divisor from 2 up to n - 1."],
          [3, "The first divisor found is 7 (91 = 7 × 13)…"],
          [5, "…so we stop searching."],
          [6, "This `else` belongs to the `for`: it would run only if no `break` happened."],
          [9, "Empty strings are skipped with `continue`."],
          [11, "\"end\" stops the loop; \"never\" is never reached."],
          [13, "`pass` does nothing — \"skip\" is still printed by the next line."],
        ],
      },
      mistakes: [
        { title: "Indenting loop-else like if-else", body: "The `else` must line up with the `for`/`while`, not with an `if` inside the loop." },
        { title: "`continue` before the update in a while loop", body: "`while i < 10: if i % 2: continue; i += 1` loops forever because `continue` skips the update." },
        { title: "Expecting break to leave all nested loops", body: "`break` leaves only the innermost loop. Use a flag, or put the loops in a function and `return`." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 2,
          code: r`for i in range(1, 10):
    if i % 3 == 0:
        continue
    if i > 7:
        break
    print(i, end=" ")
print()`,
          answer: "1 2 4 5 7 \n",
          hint: "Multiples of 3 are skipped; the loop stops at the first number above 7.",
          explain: "3 and 6 are skipped; 8 > 7 triggers break. Printed: 1 2 4 5 7.",
        },
        {
          id: "p2", kind: "predict", difficulty: 3,
          code: r`for n in [3, 5, 9]:
    if n % 2 == 0:
        print("even found")
        break
else:
    print("all odd")`,
          answer: "all odd\n",
          hint: "When does a loop's else run?",
          explain: "No even number, so `break` never runs and the loop's `else` executes.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Stop reading as soon as `stop` appears (prints `a` then `b`).",
          code: r`for w in ["a", "b", "stop", "c"]:
    if w == "stop":
        ___
    print(w)`,
          blanks: [["break"]],
          output: "a\nb\n",
          hint: "Leave the loop entirely.",
          explain: "`break` ends the loop, so \"c\" is never printed.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "This should print the odd numbers below 6 (1 3 5) but hangs forever. Which line is the problem?",
          code: r`i = 0
while i < 6:
    if i % 2 == 0:
        continue
    print(i)
    i += 1`,
          line: 4,
          fix: r`i = 0
while i < 6:
    i += 1
    if i % 2 == 0:
        continue
    print(i)`,
          output: "1\n3\n5\n",
          hint: "When `continue` runs, what gets skipped?",
          explain: "For i = 0, `continue` skips `i += 1`, so i stays 0 forever. Update the counter before any `continue` (and adjust so the loop prints 1, 3, 5).",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "First negative number", difficulty: 2,
          prompt: `Read a line of whole numbers separated by spaces. Print the **position** (starting from 1) and value of the first negative number, like \`position 3: -4\`. If there is none, print \`no negatives\` (use a loop \`else\`).

Get the numbers with \`nums = [int(x) for x in input().split()]\` (you'll learn this syntax in Module 8).`,
          starter: r`nums = [int(x) for x in input().split()]
position = 0
`,
          tests: [
            { label: "Has one", input: "5 8 -4 2 -9\n", output: "position 3: -4" },
            { label: "None", input: "1 2 3\n", output: "no negatives", category: "edge" },
            { label: "First item", input: "-1 5\n", output: "position 1: -1", hidden: true, category: "boundary" },
            { label: "Zero isn't negative", input: "0 0 -7\n", output: "position 3: -7", hidden: true },
          ],
          hints: [
            "Loop over `nums`, counting positions as you go.",
            "When a number is below 0, print and `break`.",
            "Put an `else:` on the `for` for the not-found message.",
            "Increase `position` at the top of the body so the first item is position 1.",
          ],
          solution: r`nums = [int(x) for x in input().split()]
position = 0
for n in nums:
    position += 1
    if n < 0:
        print(f"position {position}: {n}")
        break
else:
    print("no negatives")`,
          notes: "`break` + loop `else` replaces the usual `found = False` flag. (Module 13's `enumerate` will give positions without a manual counter.)",
        },
        {
          id: "stretch", kind: "task", title: "Guess the secret number", difficulty: 3,
          prompt: `The secret number is **42**. Read guesses one per line (the input has at most 10). For each guess print \`too low\`, \`too high\` or \`correct in N guesses\` — and stop at the correct guess. If the input runs out after 5 guesses without a correct answer, stop and print \`out of guesses\`: allow at most **5** guesses.`,
          starter: r`SECRET = 42
`,
          tests: [
            { label: "Found on 3rd", input: "50\n30\n42\n", output: "too high\ntoo low\ncorrect in 3 guesses" },
            { label: "First try", input: "42\n", output: "correct in 1 guesses", hidden: true, category: "boundary" },
            { label: "Five wrong", input: "1\n2\n3\n4\n5\n6\n", output: "too low\ntoo low\ntoo low\ntoo low\ntoo low\nout of guesses", hidden: true, category: "edge" },
            { label: "Fifth is right", input: "10\n90\n40\n44\n42\n", output: "too low\ntoo high\ntoo low\ntoo high\ncorrect in 5 guesses", hidden: true, category: "boundary" },
          ],
          hints: [
            "At most 5 guesses: which loop fits a known maximum?",
            "`for attempt in range(1, 6):` and read a guess inside.",
            "On a correct guess print the message and `break`.",
            "The loop's `else:` prints \"out of guesses\" when no break happened.",
          ],
          solution: r`SECRET = 42
for attempt in range(1, 6):
    guess = int(input())
    if guess < SECRET:
        print("too low")
    elif guess > SECRET:
        print("too high")
    else:
        print(f"correct in {attempt} guesses")
        break
else:
    print("out of guesses")`,
          notes: "A for loop caps the number of tries; break handles success; loop else handles failure. The sixth input line in the edge test is never read.",
        },
      ],
      realWorld: "Searching logs for the first error (`break`), skipping comment lines in config files (`continue`), menu loops (`while True` + `break`), and retry loops with a 'gave up' branch (loop `else`) are everyday patterns.",
      reteach: "Inside a loop: `break` is the emergency exit (leave the building now), `continue` is 'skip to the next item on the belt', and `pass` is 'do nothing, just stand here'. A loop's `else` is the note you leave when you checked every item and never used the emergency exit.",
      summary: [
        "`break` leaves the innermost loop; `continue` skips to its next round.",
        "`while True:` + `break` handles 'test in the middle' loops.",
        "`pass` is an empty placeholder; a loop's `else` runs only if it ended without `break`.",
      ],
    },

    {
      id: "py-counters-accumulators",
      title: "Counters, accumulators and number problems",
      minutes: 16,
      difficulty: 3,
      objectives: [
        "Use counters, running totals, running maximums and flags",
        "Solve classic number problems: digits, factors, primes, GCD",
        "Dry-run a loop by tracing its variables",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "To find the largest number in a list with a loop, what should `best` start as?",
        options: [
          { text: "0", why: "Wrong when all numbers are negative." },
          { text: "The first number in the list", why: "Correct — it works for any values." },
          { text: "A very small guess like -1000", why: "Fails for numbers below your guess." },
        ],
        answer: 1,
        hint: "Pick a starting value that can't be wrong.",
        explain: "Starting from the first element (or `None` with a check) is always correct.",
      },
      why: "Most loop problems are combinations of a few patterns: count things, add things up, remember the best so far, or remember whether something happened. Recognising them turns new problems into familiar ones.",
      concept: [
        {
          title: "Four loop patterns",
          body: `\`\`\`python
count = 0          # counter
total = 0          # accumulator
best = None        # running maximum
found = False      # flag
for x in data:
    count += 1
    total += x
    if best is None or x > best:
        best = x
    if x < 0:
        found = True
\`\`\`

Initialise **before** the loop, update **inside**, use **after**.`,
        },
        {
          title: "Classic number problems",
          body: `- **Digits**: \`n % 10\` and \`n //= 10\` in a while loop.
- **Factors**: test \`n % d == 0\` for each d.
- **Prime**: no divisor from 2 to √n (\`d * d <= n\`) — checking up to √n is enough because factors come in pairs.
- **GCD** (Euclid): \`while b: a, b = b, a % b\`.
- **Reverse a number**: \`rev = rev * 10 + n % 10\`.`,
        },
        {
          title: "Dry runs: trace tables",
          body: `To understand (or debug) a loop, write a table with one row per round:

| round | n | n % 10 | rev |
| --- | --- | --- | --- |
| start | 123 | – | 0 |
| 1 | 12 | 3 | 3 |
| 2 | 1 | 2 | 32 |
| 3 | 0 | 1 | 321 |

**Step through** in CodeMentor builds this table for you from a real run.`,
        },
      ],
      example: {
        title: "Reverse, GCD and primes",
        code: r`n = 1234
rev = 0
while n > 0:
    rev = rev * 10 + n % 10
    n //= 10
print("reversed:", rev)
a, b = 84, 36
while b:
    a, b = b, a % b
print("gcd:", a)
primes = 0
for x in range(2, 30):
    d = 2
    while d * d <= x and x % d != 0:
        d += 1
    if d * d > x:
        primes += 1
print("primes below 30:", primes)`,
        output: "reversed: 4321\ngcd: 12\nprimes below 30: 10\n",
        lines: [
          [4, "Shift rev left one digit and add n's last digit."],
          [5, "Drop the last digit of n."],
          [8, "Euclid's algorithm: replace (a, b) with (b, a % b) until b is 0."],
          [12, "Count primes: for each x, search for a divisor up to √x."],
          [14, "Stop at the first divisor, or once d² passes x."],
          [16, "If we passed √x without finding a divisor, x is prime."],
        ],
      },
      mistakes: [
        { title: "Initialising inside the loop", body: "`total = 0` inside the loop resets it every round." },
        { title: "Starting a maximum at 0", body: "Fails for all-negative data. Start with the first item or `None`." },
        { title: "Checking divisors up to n", body: "Correct but slow; up to √n is enough and much faster for big n." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`n = 507
s = 0
while n:
    s += n % 10
    n //= 10
print(s)`,
          answer: "12\n",
          hint: "Trace the digits 7, 0, 5.",
          explain: "s = 7, then 7 + 0, then 7 + 5 = 12; n becomes 0 and the loop stops (`while n` is falsy at 0).",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Track the smallest value.",
          code: r`nums = [8, 3, 9, 1, 4]
low = nums[0]
for x in nums:
    if x ___ low:
        low = x
print(low)`,
          blanks: [["<"]],
          output: "1\n",
          hint: "Replace `low` when a smaller value appears.",
          explain: "`if x < low: low = x` keeps the running minimum.",
        },
        {
          id: "b1", kind: "bug", difficulty: 2,
          prompt: "This should print the total 60 but prints 30. Which line is wrong?",
          code: r`marks = [10, 20, 30]
for m in marks:
    total = 0
    total += m
print(total)`,
          line: 3,
          fix: r`marks = [10, 20, 30]
total = 0
for m in marks:
    total += m
print(total)`,
          output: "60\n",
          hint: "How many times does `total = 0` run?",
          explain: "Resetting `total` inside the loop throws away earlier rounds. Initialise once, before the loop.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "Why does a prime check only need to test divisors `d` with `d * d <= n`?",
          options: [
            { text: "Because primes are small", why: "Primes can be huge." },
            { text: "Because if n = a × b with a ≤ b, then a ≤ √n — a small factor would already be found", why: "Correct." },
            { text: "It's an approximation that's usually right", why: "It's exact, not an approximation." },
          ],
          answer: 1,
          hint: "Factors come in pairs.",
          explain: "Every factor above √n pairs with one below √n, so checking up to √n finds a factor if one exists.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Class statistics", difficulty: 2,
          prompt: `Read a line of marks separated by spaces. Print the count, the total, the highest, the lowest and the average (2 decimals):

\`\`\`
count: 4
total: 300
highest: 95
lowest: 55
average: 75.00
\`\`\`

Use a single loop with accumulators (don't use \`sum\`, \`max\` or \`min\`).`,
          starter: r`marks = [int(x) for x in input().split()]
`,
          tests: [
            { label: "4 marks", input: "80 70 95 55\n", output: "count: 4\ntotal: 300\nhighest: 95\nlowest: 55\naverage: 75.00" },
            { label: "One mark", input: "42\n", output: "count: 1\ntotal: 42\nhighest: 42\nlowest: 42\naverage: 42.00", hidden: true, category: "edge" },
            { label: "Uneven average", input: "10 20 25\n", output: "count: 3\ntotal: 55\nhighest: 25\nlowest: 10\naverage: 18.33", hidden: true },
          ],
          hints: [
            "Which variables do you need before the loop?",
            "count = 0, total = 0, highest and lowest = the first mark.",
            "Inside the loop update all four.",
            "Average = total / count, printed with `:.2f`.",
          ],
          solution: r`marks = [int(x) for x in input().split()]
count = 0
total = 0
highest = lowest = marks[0]
for m in marks:
    count += 1
    total += m
    if m > highest:
        highest = m
    if m < lowest:
        lowest = m
print("count:", count)
print("total:", total)
print("highest:", highest)
print("lowest:", lowest)
print(f"average: {total / count:.2f}")`,
          notes: "One pass, four accumulators. In practice you'd use `len`, `sum`, `max`, `min` — which do exactly these loops internally.",
        },
        {
          id: "stretch", kind: "challenge", title: "Perfect, abundant or deficient", difficulty: 3,
          prompt: `A number is **perfect** if the sum of its proper divisors (divisors smaller than itself) equals the number (6 = 1 + 2 + 3), **abundant** if the sum is larger, **deficient** if smaller. Read n (≥ 1) and print e.g. \`6 is perfect (divisor sum 6)\`.`,
          starter: r`n = int(input())
`,
          tests: [
            { label: "6", input: "6\n", output: "6 is perfect (divisor sum 6)" },
            { label: "12", input: "12\n", output: "12 is abundant (divisor sum 16)" },
            { label: "1", input: "1\n", output: "1 is deficient (divisor sum 0)", hidden: true, category: "edge" },
            { label: "28", input: "28\n", output: "28 is perfect (divisor sum 28)", hidden: true },
            { label: "Prime 13", input: "13\n", output: "13 is deficient (divisor sum 1)", hidden: true },
            { label: "Large 8128", input: "8128\n", output: "8128 is perfect (divisor sum 8128)", hidden: true },
          ],
          hints: [
            "Proper divisors of n are the d with 1 ≤ d < n and n % d == 0.",
            "Accumulate them in a loop over `range(1, n)`.",
            "Compare the sum with n using if/elif/else.",
            "Print `f\"{n} is {kind} (divisor sum {s})\"`.",
          ],
          solution: r`n = int(input())
s = 0
for d in range(1, n):
    if n % d == 0:
        s += d
if s == n:
    kind = "perfect"
elif s > n:
    kind = "abundant"
else:
    kind = "deficient"
print(f"{n} is {kind} (divisor sum {s})")`,
          notes: "This loop does n − 1 checks — fine for n = 8128. Pairing divisors up to √n would make it much faster for huge n.",
        },
      ],
      realWorld: "Accumulators are behind every report: totals, averages, highest sale, count of failed logins. Euclid's GCD (2,300 years old) is still used — for example to simplify fractions and in cryptography (RSA).",
      reteach: "Before a long walk you get a notebook ready (initialise). At every step you write one thing down (update): how many steps, how far, the highest hill so far. At the end you read the notebook (use). Forgetting to prepare the notebook, or tearing out the page every step (initialising inside the loop), are the classic mistakes.",
      summary: [
        "Counters, accumulators, running max/min and flags: initialise before, update inside, use after.",
        "Digits with `% 10` / `// 10`; primes by testing divisors up to √n; GCD with Euclid's algorithm.",
        "Trace tables (or Step through) show how loop variables change round by round.",
      ],
    },

    {
      id: "py-nested-loops",
      title: "Nested loops, patterns and complexity",
      minutes: 18,
      difficulty: 3,
      objectives: [
        "Use a loop inside a loop for grids, pairs and patterns",
        "Print star and number patterns row by row",
        "Estimate how the number of steps grows (time-complexity intuition)",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "An outer loop runs 3 times and the inner loop runs 4 times per outer round. How many times does the inner body run?",
        options: [
          { text: "7", why: "That's 3 + 4; nested loops multiply." },
          { text: "12", why: "Correct: 3 × 4." },
          { text: "4", why: "The inner loop restarts for every outer round." },
        ],
        answer: 1,
        hint: "The inner loop runs completely for each outer round.",
        explain: "Nested loops multiply: 3 outer rounds × 4 inner rounds = 12.",
      },
      why: "Tables, grids, game boards, seating plans and comparing every pair of items all need a loop inside a loop. Nested loops are also where programs get slow — knowing how the work grows is your first step into algorithms.",
      concept: [
        {
          title: "A loop inside a loop",
          body: `\`\`\`python
for row in range(1, 4):
    for col in range(1, 4):
        print(row * col, end="\\t")
    print()        # end of the row
\`\`\`

For each outer round the inner loop runs **all** of its rounds. The outer loop usually means *rows*, the inner one *columns*.`,
        },
        {
          title: "Pattern printing",
          body: `Patterns are row-by-row rules. For row i (starting at 1):

- right triangle: i stars → \`print("*" * i)\`
- inverted triangle: n − i + 1 stars
- pyramid: \`" " * (n - i) + "*" * (2 * i - 1)\`

You can use string repetition instead of an inner loop — but writing it with an inner loop is good practice for the logic.`,
        },
        {
          title: "Time-complexity intuition",
          body: `Count the work as the input grows:

| Code | Steps for n | Name |
| --- | --- | --- |
| one loop over n items | n | linear, O(n) |
| loop inside loop, both n | n × n | quadratic, O(n²) |
| halving loop (\`n //= 2\`) | about log₂ n | logarithmic, O(log n) |

For n = 1,000: linear is 1,000 steps, quadratic is 1,000,000. For n = 100,000, quadratic is 10 billion — too slow. Module 44 makes this precise.`,
        },
      ],
      example: {
        title: "Patterns and pairs",
        code: r`n = 4
for i in range(1, n + 1):
    print("*" * i)
for i in range(1, n + 1):
    print(" " * (n - i) + "*" * (2 * i - 1))
pairs = 0
for a in range(1, 6):
    for b in range(a + 1, 6):
        pairs += 1
print("pairs from 5 items:", pairs)`,
        output: "*\n**\n***\n****\n   *\n  ***\n *****\n*******\npairs from 5 items: 10\n",
        lines: [
          [2, "Row i of a right triangle has i stars."],
          [5, "Pyramid row i: n - i spaces, then 2i - 1 stars."],
          [7, "Outer loop picks the first item of a pair…"],
          [8, "…inner loop picks a later item, so each pair is counted once."],
          [10, "5 × 4 / 2 = 10 pairs — the inner work shrinks each round but still grows like n²."],
        ],
      },
      mistakes: [
        { title: "Forgetting to end the row", body: "With `end=\" \"` in the inner loop, you need `print()` after it, at the outer loop's indentation." },
        { title: "Reusing the same loop variable", body: "`for i ...: for i ...:` — the inner loop overwrites the outer `i`. Use different names." },
        { title: "Accidentally quadratic", body: "A loop that checks `x in big_list` inside another loop over big_list is n² — fine for 100 items, painful for 100,000." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 2,
          code: r`for i in range(1, 4):
    for j in range(i):
        print(i, end="")
    print()`,
          answer: "1\n22\n333\n",
          hint: "The inner loop runs i times on row i.",
          explain: "Row 1 prints 1 once; row 2 prints 2 twice; row 3 prints 3 three times.",
        },
        {
          id: "p2", kind: "predict", difficulty: 3,
          code: r`count = 0
for i in range(4):
    for j in range(4):
        if i != j:
            count += 1
print(count)`,
          answer: "12\n",
          hint: "16 combinations in total; how many have i == j?",
          explain: "4 × 4 = 16 pairs, minus the 4 where i == j: 12.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Print a 3 × 5 rectangle of `#`.",
          code: r`for row in range(3):
    for col in range(___):
        print("#", end="")
    ___`,
          blanks: [["5"], ["print()"]],
          output: "#####\n#####\n#####\n",
          hint: "5 columns, then end the row.",
          explain: "The inner loop prints 5 characters; `print()` after it starts the next row.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "This should print a 2-row multiplication table (1 2 3 / 2 4 6) but prints everything on one line. Which line is wrong?",
          code: r`for i in range(1, 3):
    for j in range(1, 4):
        print(i * j, end=" ")
        print()`,
          line: 4,
          fix: r`for i in range(1, 3):
    for j in range(1, 4):
        print(i * j, end=" ")
    print()`,
          output: "1 2 3 \n2 4 6 \n",
          hint: "Which loop should end the line?",
          explain: "`print()` is inside the inner loop, so it ends the line after every number. It belongs to the outer loop: dedent it one level.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Number triangle", difficulty: 2,
          prompt: `Read n and print a triangle of numbers where row i contains 1 to i separated by spaces. For n = 4:

\`\`\`
1
1 2
1 2 3
1 2 3 4
\`\`\``,
          starter: r`n = int(input())
`,
          tests: [
            { label: "n = 4", input: "4\n", output: "1\n1 2\n1 2 3\n1 2 3 4" },
            { label: "n = 1", input: "1\n", output: "1", hidden: true, category: "boundary" },
            { label: "n = 6", input: "6\n", output: "1\n1 2\n1 2 3\n1 2 3 4\n1 2 3 4 5\n1 2 3 4 5 6", hidden: true },
          ],
          hints: [
            "How many numbers are on row i?",
            "Outer loop over rows 1..n; inner loop over 1..i.",
            "Print numbers with `end=\" \"` and end each row with `print()` — trailing spaces are ignored by the checker.",
            "`for i in range(1, n + 1): for j in range(1, i + 1): print(j, end=\" \")` then `print()`.",
          ],
          solution: r`n = int(input())
for i in range(1, n + 1):
    for j in range(1, i + 1):
        print(j, end=" ")
    print()`,
          notes: "The inner loop's range depends on the outer variable — a common shape for triangle patterns.",
        },
        {
          id: "stretch", kind: "challenge", title: "Hollow square", difficulty: 3,
          prompt: `Read n (n ≥ 2) and print an n × n hollow square of \`*\`: stars on the border, spaces inside. For n = 4:

\`\`\`
****
*  *
*  *
****
\`\`\``,
          starter: r`n = int(input())
`,
          tests: [
            { label: "n = 4", input: "4\n", output: "****\n*  *\n*  *\n****" },
            { label: "n = 2", input: "2\n", output: "**\n**", hidden: true, category: "boundary" },
            { label: "n = 5", input: "5\n", output: "*****\n*   *\n*   *\n*   *\n*****", hidden: true },
          ],
          hints: [
            "When is a cell on the border?",
            "Row is first or last, or column is first or last.",
            "Use two loops over 0..n-1 and print `*` or a space with `end=\"\"`.",
            "`if r in (0, n - 1) or c in (0, n - 1): print(\"*\", end=\"\")` else print a space; end each row with `print()`.",
          ],
          solution: r`n = int(input())
for r in range(n):
    for c in range(n):
        if r in (0, n - 1) or c in (0, n - 1):
            print("*", end="")
        else:
            print(" ", end="")
    print()`,
          notes: "Thinking in terms of a condition on (row, column) works for every grid pattern: borders, diagonals (r == c), checkerboards ((r + c) % 2).",
        },
      ],
      realWorld: "Image processing walks every pixel (row × column); spreadsheets compute cells in a grid; recommendation systems compare pairs of users. Knowing that nested loops cost n² is why engineers reach for smarter algorithms when n gets large.",
      reteach: "Nested loops are like a clock: the minute hand (inner loop) goes all the way round for every single step of the hour hand (outer loop). That's why the total number of ticks is the product of the two — and why it grows so quickly.",
      summary: [
        "The inner loop runs completely for every round of the outer loop; total work multiplies.",
        "Patterns: decide what row i contains; end each row with `print()`.",
        "Growth: one loop ≈ n steps, nested loops ≈ n², halving ≈ log n.",
      ],
      cpp: {
        python: r`for i in range(3):
    for j in range(3):
        print(i * j, end=" ")
    print()`,
        cpp: r`for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 3; j++) cout << i * j << " ";
    cout << "\n";
}`,
        note: "Identical structure. C++ runs the same nested loop roughly 50× faster — the complexity (n²) is the same in both.",
      },
    },
  ],
  exam: [
    {
      id: "e1", kind: "predict", difficulty: 3,
      code: r`total = 0
for i in range(1, 6):
    if i == 4:
        break
    for j in range(i):
        total += 1
print(total)`,
      answer: "6\n",
      hint: "Which values of i reach the inner loop?",
      explain: "i = 1, 2, 3 add 1 + 2 + 3 = 6; at i = 4 the loop breaks.",
    },
    {
      id: "e2", kind: "mcq", difficulty: 3,
      prompt: "A program loops over n students and, for each, loops over all n students again. Going from 1,000 to 2,000 students, the work becomes about…",
      options: [
        { text: "2× as much", why: "That's linear growth." },
        { text: "4× as much", why: "Correct: n² grows by 2² = 4 when n doubles." },
        { text: "The same", why: "More students means more pairs." },
      ],
      answer: 1,
      hint: "Nested loops over n → n² steps.",
      explain: "Doubling n quadruples n²: (2n)² = 4n².",
    },
    {
      id: "e3", kind: "fill", difficulty: 2,
      prompt: "Count down from 5 to 1.",
      code: r`for i in range(5, 0, ___):
    print(i, end=" ")
print()`,
      blanks: [["-1"]],
      output: "5 4 3 2 1 \n",
      hint: "A negative step.",
      explain: "`range(5, 0, -1)` gives 5, 4, 3, 2, 1 (0 is excluded).",
    },
    {
      id: "e4", kind: "bug", difficulty: 3,
      prompt: "This should print `7 is prime` but prints `7 is not prime`. Which line is wrong?",
      code: r`n = 7
for d in range(1, n):
    if n % d == 0:
        print(n, "is not prime")
        break
else:
    print(n, "is prime")`,
      line: 2,
      fix: r`n = 7
for d in range(2, n):
    if n % d == 0:
        print(n, "is not prime")
        break
else:
    print(n, "is prime")`,
      output: "7 is prime\n",
      hint: "Which number divides every number?",
      explain: "Starting at 1 finds `7 % 1 == 0` immediately. Divisors must be tested from 2.",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: number-guessing game with stats", difficulty: 3,
    prompt: `Build a guessing game for the secret number **37** (range 1–100). Read guesses until the correct one (the input always contains it, maybe after invalid lines). For each guess:

- outside 1–100 → print \`out of range\` (doesn't count as a guess)
- too low / too high → print \`higher\` / \`lower\`
- correct → print \`correct!\`

Then print a summary line: \`guesses: N, closest miss: D\` where N counts only valid guesses (including the correct one) and D is the smallest distance between a wrong valid guess and 37 (print \`none\` if the first valid guess was correct).`,
    starter: r`SECRET = 37
`,
    tests: [
      { label: "Typical game", input: "50\n20\n40\n37\n", output: "lower\nhigher\nlower\ncorrect!\nguesses: 4, closest miss: 3" },
      { label: "Out of range ignored", input: "0\n150\n36\n37\n", output: "out of range\nout of range\nhigher\ncorrect!\nguesses: 2, closest miss: 1", hidden: true, category: "edge" },
      { label: "First try", input: "37\n", output: "correct!\nguesses: 1, closest miss: none", hidden: true, category: "boundary" },
    ],
    hints: [
      "Which loop fits 'until the correct guess'?",
      "`while True:` reading a guess, with `break` on the correct one.",
      "Use a counter for valid guesses and a running minimum for the miss distance (start at None).",
      "`dist = abs(guess - SECRET)`; `if closest is None or dist < closest: closest = dist`. Print `closest if closest is not None else 'none'`.",
    ],
    solution: r`SECRET = 37
guesses = 0
closest = None
while True:
    guess = int(input())
    if guess < 1 or guess > 100:
        print("out of range")
        continue
    guesses += 1
    if guess == SECRET:
        print("correct!")
        break
    print("higher" if guess < SECRET else "lower")
    dist = abs(guess - SECRET)
    if closest is None or dist < closest:
        closest = dist
print(f"guesses: {guesses}, closest miss: {closest if closest is not None else 'none'}")`,
    notes: "`while True` + `break`, `continue` to skip invalid input, a counter, and a running minimum that starts as None — the whole module in one game.",
  },
};
