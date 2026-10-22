import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 20 — Regular expressions. */
export const M20: PyModuleDef = {
  id: "py-regex",
  number: 20,
  level: 3,
  title: "Regular Expressions",
  summary: "Pattern matching with re; character classes; quantifiers; groups (capturing, non-capturing, named); lookaheads and lookbehinds; substitution and splitting; raw strings; validation examples; and when NOT to use regular expressions.",
  track: "core",
  prereqs: ["py-generators"],
  lessons: [
    {
      id: "py-regex-basics",
      title: "Patterns, classes and quantifiers",
      minutes: 18,
      difficulty: 3,
      objectives: [
        "Write raw-string patterns with character classes and quantifiers",
        "Choose between `re.search`, `re.match`, `re.fullmatch` and `re.findall`",
        "Use anchors and greedy vs lazy quantifiers",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "What does the pattern `\\d+` match?",
        options: [
          { text: "The letter d one or more times", why: "\\d is a character class, not the letter d." },
          { text: "One or more digits", why: "Correct." },
          { text: "Exactly one digit", why: "+ means one or more." },
        ],
        answer: 1,
        hint: "\\d = digit; + = one or more.",
        explain: "`\\d` matches a digit and `+` repeats it one or more times, so `\\d+` matches a whole run of digits.",
      },
      why: "Regular expressions find and validate patterns in text: phone numbers in a document, dates in log lines, hashtags in posts, codes in filenames. One line of regex can replace dozens of lines of string code — when used for the right job.",
      concept: [
        {
          title: "Building blocks",
          body: `| Pattern | Matches |
| --- | --- |
| \`abc\` | the literal text abc |
| \`.\` | any character except newline |
| \`\\d\` \`\\w\` \`\\s\` | digit, word char (letter/digit/_), whitespace |
| \`\\D\` \`\\W\` \`\\S\` | NOT digit / word char / whitespace |
| \`[aeiou]\` \`[A-Z]\` \`[^0-9]\` | one of / a range / NOT one of |
| \`^\` \`$\` | start / end of the string (or line with re.M) |
| \`\\b\` | word boundary |

Always write patterns as **raw strings**: \`r"\\d+"\` — otherwise Python's own escapes (like \`\\b\` = backspace) interfere.`,
        },
        {
          title: "Quantifiers",
          body: `| Quantifier | Means |
| --- | --- |
| \`*\` | 0 or more |
| \`+\` | 1 or more |
| \`?\` | 0 or 1 (optional) |
| \`{3}\` \`{2,4}\` \`{2,}\` | exactly 3, 2 to 4, 2 or more |

Quantifiers are **greedy** (take as much as possible); add \`?\` for **lazy** (as little as possible): \`<.+?>\` matches one HTML tag, \`<.+>\` would run to the last \`>\`.`,
        },
        {
          title: "re functions",
          body: `\`\`\`python
import re
re.search(r"\\d+", "order 66 now")       # first match anywhere → Match object
re.match(r"\\d+", "66 now")              # only at the START
re.fullmatch(r"\\d{6}", "411001")        # the WHOLE string must match → validation
re.findall(r"\\d+", "a1 b22 c333")       # ['1', '22', '333']
re.finditer(...)                        # Match objects, lazily
m = re.search(r"\\d+", "x 42"); m.group(), m.start(), m.end()
\`\`\`

No match → \`None\`, so check before using the result. For repeated use, compile: \`PIN = re.compile(r"\\d{6}")\`.`,
        },
      ],
      example: {
        title: "Finding things in text",
        code: r`import re
text = "Call 98450-12345 or 080-2345678 before 9:30 on 2026-10-09. #python #CodeMentor"
print(re.findall(r"\d+", text)[:4])
print(re.findall(r"#\w+", text))
print(re.search(r"\d{4}-\d{2}-\d{2}", text).group())
print(bool(re.fullmatch(r"[1-9]\d{5}", "411001")), bool(re.fullmatch(r"[1-9]\d{5}", "011001")))
html = "<b>bold</b> and <i>italic</i>"
print(re.findall(r"<.+>", html), re.findall(r"<.+?>", html))
print(re.findall(r"\bcat\b", "cat concat cats cat."))`,
        output: "['98450', '12345', '080', '2345678']\n['#python', '#CodeMentor']\n2026-10-09\nTrue False\n['<b>bold</b> and <i>italic</i>'] ['<b>', '</b>', '<i>', '</i>']\n['cat', 'cat']\n",
        lines: [
          [3, "Every run of digits (first four shown)."],
          [4, "A # followed by word characters: hashtags."],
          [5, "A date shape: 4 digits, dash, 2, dash, 2."],
          [6, "fullmatch for validation: a 6-digit PIN code not starting with 0."],
          [8, "Greedy .+ swallows everything up to the last >; lazy .+? stops at the first."],
          [9, "\\b word boundaries match 'cat' as a whole word only."],
        ],
      },
      mistakes: [
        { title: "Forgetting raw strings", body: "`\"\\bword\\b\"` contains backspace characters. Write `r\"\\bword\\b\"`." },
        { title: "search vs match vs fullmatch", body: "`re.match` only checks the start; validation needs `re.fullmatch` (or ^…$)." },
        { title: "Not checking for None", body: "`re.search(...).group()` crashes with AttributeError when nothing matched." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`import re
s = "a1b22c333"
print(re.findall(r"\d", s), re.findall(r"\d+", s), re.findall(r"[a-z]\d{2}", s))`,
          answer: "['1', '2', '2', '3', '3', '3'] ['1', '22', '333'] ['b22', 'c33']\n",
          hint: "{2} means exactly two.",
          explain: "\\d matches single digits; \\d+ whole runs; a letter followed by exactly two digits matches b22 and c33 (non-overlapping).",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Validate that the whole string is exactly 10 digits.",
          code: r`import re
print(bool(re.___(r"\d{10}", "9845012345")), bool(re.fullmatch(r"\d{10}", "98450 12345")))`,
          blanks: [["fullmatch"]],
          output: "True False\n",
          hint: "The function that requires the entire string to match.",
          explain: "`re.fullmatch` succeeds only if the pattern matches the whole string.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "This should accept only codes like `AB-1234` but also accepts `XAB-12345`. Which line?",
          code: r`import re
def valid(code):
    return re.search(r"[A-Z]{2}-\d{4}", code) is not None
print(valid("AB-1234"), valid("XAB-12345"))`,
          line: 3,
          fix: r`import re
def valid(code):
    return re.fullmatch(r"[A-Z]{2}-\d{4}", code) is not None
print(valid("AB-1234"), valid("XAB-12345"))`,
          output: "True False\n",
          hint: "search finds the pattern anywhere inside the string.",
          explain: "`re.search` finds AB-1234 inside XAB-12345. Validation must match the whole string: `re.fullmatch`.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "Which pattern matches an optional `+91 ` prefix followed by 10 digits?",
          options: [
            { text: "`r\"+91 \\d{10}\"`", why: "+ is a quantifier; it must be escaped, and the prefix isn't optional here." },
            { text: "`r\"(\\+91 )?\\d{10}\"`", why: "Correct — escaped plus, optional group." },
            { text: "`r\"91?\\d{10}\"`", why: "? only makes the 1 optional." },
          ],
          answer: 1,
          hint: "Escape special characters; make a group optional with ?.",
          explain: "`\\+` matches a literal plus; `( … )?` makes the whole prefix optional.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Extract emails and phone numbers", difficulty: 3,
          prompt: `Read a paragraph. Print all email addresses (simple form: word characters, dots or dashes, then @, then a domain with at least one dot), then all 10-digit Indian mobile numbers (starting 6–9), each on its own line in order of appearance, under the headings \`emails:\` and \`phones:\`.`,
          starter: r`import re
text = input()
`,
          tests: [
            { label: "Mixed text", input: "Mail asha.k@school.edu or ravi-9@mail.co.in, call 9845012345 or 12345 or 7012345678.\n", output: "emails:\nasha.k@school.edu\nravi-9@mail.co.in\nphones:\n9845012345\n7012345678" },
            { label: "Nothing", input: "No contacts here.\n", output: "emails:\nphones:", hidden: true, category: "edge" },
          ],
          hints: [
            "Email: `[\\w.-]+@[\\w-]+(\\.[\\w-]+)+` — but findall returns groups if there are groups!",
            "Use a non-capturing group `(?:...)` so findall returns the whole match.",
            "Phone: `\\b[6-9]\\d{9}\\b`.",
            "Print the heading, then each match.",
          ],
          solution: r`import re
text = input()
emails = re.findall(r"[\w.-]+@[\w-]+(?:\.[\w-]+)+", text)
phones = re.findall(r"\b[6-9]\d{9}\b", text)
print("emails:")
for e in emails:
    print(e)
print("phones:")
for p in phones:
    print(p)`,
          notes: "If a pattern contains a capturing group, findall returns the group instead of the whole match — `(?:…)` avoids that. Real email validation is much harder; libraries and a confirmation email are the robust approach.",
        },
        {
          id: "stretch", kind: "task", title: "Password rules with regex", difficulty: 4,
          prompt: `Check each input line (until \`end\`) as a password: at least 8 characters, at least one lower-case letter, one upper-case letter, one digit, and no spaces. Print \`strong\` or the **first** failed rule: \`too short\`, \`needs lowercase\`, \`needs uppercase\`, \`needs digit\`, \`no spaces allowed\`.`,
          starter: r`import re
RULES = []
`,
          tests: [
            { label: "Mixed", input: "Monsoon2026\nshort1A\nalllower123\nALLUPPER123\nNoDigitsHere\nHas Space1A\nend\n", output: "strong\ntoo short\nneeds uppercase\nneeds lowercase\nneeds digit\nno spaces allowed" },
            { label: "Exactly 8", input: "Abcdefg1\nend\n", output: "strong", hidden: true, category: "boundary" },
          ],
          hints: [
            "Make a list of (pattern, message, must_match) rules.",
            "Length: `r\".{8,}\"` with fullmatch; lower `r\"[a-z]\"` with search …",
            "Spaces: the pattern `r\"\\s\"` must NOT be found.",
            "Loop over the rules and print the first failing message, else strong.",
          ],
          solution: r`import re
RULES = [
    (r".{8,}", "too short", True),
    (r"[a-z]", "needs lowercase", True),
    (r"[A-Z]", "needs uppercase", True),
    (r"\d", "needs digit", True),
    (r"\s", "no spaces allowed", False),
]

def check(pw):
    for pattern, message, must in RULES:
        found = re.search(pattern, pw) is not None
        if found != must:
            return message
    return "strong"

while (line := input()) != "end":
    print(check(line))`,
          notes: "Several small, readable patterns beat one giant regex with lookaheads. (Real password policy: prefer length and breach checks over composition rules — NIST guidance.)",
        },
      ],
      realWorld: "Log parsing, form validation (PIN codes, IFSC codes, GSTINs), data cleaning, search-and-replace in editors and IDEs, and URL routing in web frameworks all use regular expressions.",
      reteach: "A regex is a description of a shape of text: 'a digit, then three more digits, then a dash' = `\\d{4}-`. Classes like `\\d` and `[A-Z]` say *what kind* of character; quantifiers like `+` and `{3}` say *how many*. Python then slides that shape along your text looking for a fit.",
      summary: [
        "Always use raw strings; classes `\\d \\w \\s [..]`, anchors `^ $ \\b`, quantifiers `* + ? {m,n}` (lazy with ?).",
        "search (anywhere), match (start), fullmatch (whole — for validation), findall/finditer (all).",
        "Check for None before calling .group(); compile patterns you reuse.",
      ],
    },

    {
      id: "py-regex-groups",
      title: "Groups, lookarounds, substitution and when not to use regex",
      minutes: 18,
      difficulty: 4,
      objectives: [
        "Extract parts with capturing, named and non-capturing groups",
        "Use lookaheads and lookbehinds",
        "Transform text with `re.sub` and `re.split` — and know when plain string methods are better",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "`re.search(r\"(\\d+)-(\\d+)\", \"pages 10-25\").group(2)` is…",
        options: [
          { text: "\"10\"", why: "That's group 1." },
          { text: "\"25\"", why: "Correct — the second capturing group." },
          { text: "\"10-25\"", why: "That's group 0 (the whole match)." },
        ],
        answer: 1,
        hint: "Groups are numbered from 1 by their opening bracket.",
        explain: "group(0) is the whole match; group(1) and group(2) are the bracketed parts.",
      },
      why: "Finding a match is only half the job — usually you need its parts (day, month, year), or you want to rewrite text (mask numbers, normalise dates). Groups and substitution do this; knowing regex's limits keeps your code maintainable.",
      concept: [
        {
          title: "Groups",
          body: `\`\`\`python
m = re.search(r"(\\d{4})-(\\d{2})-(\\d{2})", "due 2026-10-09")
m.group(1), m.groups()          # '2026', ('2026', '10', '09')

m = re.search(r"(?P<year>\\d{4})-(?P<month>\\d{2})", "2026-10")
m["year"], m.groupdict()        # named groups

re.findall(r"(?:ab)+", "ababx")  # (?:...) groups without capturing
\`\`\`

Backreference: \`r"(\\w)\\1"\` matches a doubled character ("ll" in hello).`,
        },
        {
          title: "Lookarounds",
          body: `Lookarounds check context **without consuming** it:

| Syntax | Meaning |
| --- | --- |
| \`X(?=Y)\` | X followed by Y |
| \`X(?!Y)\` | X not followed by Y |
| \`(?<=Y)X\` | X preceded by Y |
| \`(?<!Y)X\` | X not preceded by Y |

\`re.findall(r"(?<=Rs )\\d+", "Rs 50 and Rs 75")\` → \`['50', '75']\` (the "Rs " isn't part of the match). Lookbehinds must be fixed-width.`,
        },
        {
          title: "sub, split — and when not to use regex",
          body: `\`\`\`python
re.sub(r"\\s+", " ", "too    many   spaces")            # collapse whitespace
re.sub(r"(\\d{2})/(\\d{2})/(\\d{4})", r"\\3-\\2-\\1", "09/10/2026")   # '2026-10-09'
re.sub(r"\\d", lambda m: "*", "pin 1234")                # function replacement
re.split(r"[;,]\\s*", "a, b;c")                           # ['a', 'b', 'c']
\`\`\`

**Don't use regex** when a string method is clearer (\`startswith\`, \`split\`, \`in\`), for structured formats with real parsers (HTML → an HTML parser, JSON → json, CSV → csv, email addresses → a library), or when the pattern becomes unreadable. Use \`re.VERBOSE\` to comment complex patterns.`,
        },
      ],
      example: {
        title: "Parsing and rewriting a log",
        code: r`import re
log = "2026-10-09 14:05:33 ERROR [payments] card 4111111111111111 declined after 3 tries"
pattern = re.compile(r"(?P<date>\d{4}-\d{2}-\d{2}) (?P<time>[\d:]+) (?P<level>\w+) \[(?P<module>\w+)\]")
m = pattern.match(log)
print(m["level"], m["module"], m.group("date"))
masked = re.sub(r"\d{12}(\d{4})", r"************\1", log)
print(masked[37:])
print(re.findall(r"\d+(?= tries)", log), re.findall(r"(?<=\[)\w+(?=\])", log))
print(re.sub(r"(\w)\1", r"[\1\1]", "bookkeeper"))
print(re.split(r"\s*[;,|]\s*", "red , green;blue|  yellow"))`,
        output: "ERROR payments 2026-10-09\ncard ************1111 declined after 3 tries\n['3'] ['payments']\nb[oo][kk][ee]per\n['red', 'green', 'blue', 'yellow']\n",
        lines: [
          [3, "Named groups document each part of the pattern."],
          [5, "Access groups by name."],
          [6, "\\1 in the replacement refers to the captured last four digits."],
          [8, "Lookahead: digits followed by ' tries'; look-behind + lookahead: the word inside [ ]."],
          [9, "Backreference \\1 finds doubled letters."],
          [10, "split on any of ; , | with surrounding spaces."],
        ],
      },
      mistakes: [
        { title: "Parsing HTML/JSON with regex", body: "Nested structures break regex. Use html.parser/BeautifulSoup, json, csv." },
        { title: "Unreadable mega-patterns", body: "Split into steps, name groups, or use re.VERBOSE with comments." },
        { title: "Catastrophic backtracking", body: "Patterns like `(a+)+$` on long non-matching input can take forever. Keep patterns specific (relevant to denial-of-service — Module 33)." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 4,
          code: r`import re
print(re.sub(r"(\w+)@(\w+)\.com", r"\2 at \1", "mail asha@site.com now"))
print(re.findall(r"(\d)(\d)", "12345"))`,
          answer: "mail site at asha now\n[('1', '2'), ('3', '4')]\n",
          hint: "With two groups, findall returns tuples.",
          explain: "The replacement swaps the captured parts. findall with two groups returns pairs; '5' has no partner.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Collapse runs of spaces into one space.",
          code: r`import re
print(re.___(r" +", " ", "a   b    c"))`,
          blanks: [["sub"]],
          output: "a b c\n",
          hint: "Substitute.",
          explain: "`re.sub(pattern, replacement, text)` replaces every match.",
        },
        {
          id: "b1", kind: "bug", difficulty: 4,
          prompt: "This should print only the amounts `['50', '75']`, but it also includes the currency text. Which line?",
          code: r`import re
text = "Rs 50 and Rs 75"
print(re.findall(r"Rs \d+", text))`,
          line: 3,
          fix: r`import re
text = "Rs 50 and Rs 75"
print(re.findall(r"(?<=Rs )\d+", text))`,
          output: "['50', '75']\n",
          hint: "Check the context without including it in the match.",
          explain: "A lookbehind `(?<=Rs )` requires the prefix but doesn't consume it. (A capturing group `Rs (\\d+)` would also work.)",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "Which task should NOT be done with a regular expression?",
          options: [
            { text: "Finding all 6-digit PIN codes in a text", why: "A perfect regex job." },
            { text: "Extracting all links from an HTML page", why: "Correct — use an HTML parser; HTML is nested and irregular." },
            { text: "Collapsing repeated spaces", why: "A simple re.sub." },
          ],
          answer: 1,
          hint: "Nested structure.",
          explain: "HTML has nesting, attributes in any order, comments and quoting rules — a parser handles it reliably.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Reformat dates", difficulty: 3,
          prompt: `Read a line of text containing dates in \`DD/MM/YYYY\` form. Rewrite every date as \`YYYY-MM-DD\` with \`re.sub\` and print the result, then the list of years found.`,
          starter: r`import re
text = input()
`,
          tests: [
            { label: "Two dates", input: "Exams 09/10/2026 to 23/10/2026, results 01/12/2026.\n", output: "Exams 2026-10-09 to 2026-10-23, results 2026-12-01.\n['2026', '2026', '2026']" },
            { label: "No dates", input: "Nothing scheduled.\n", output: "Nothing scheduled.\n[]", hidden: true, category: "edge" },
          ],
          hints: [
            "Capture day, month and year separately.",
            "`r\"(\\d{2})/(\\d{2})/(\\d{4})\"`.",
            "The replacement reorders: `r\"\\3-\\2-\\1\"`.",
            "Years: `re.findall(r\"\\d{2}/\\d{2}/(\\d{4})\", text)` returns just the year group.",
          ],
          solution: r`import re
text = input()
DATE = r"(\d{2})/(\d{2})/(\d{4})"
print(re.sub(DATE, r"\3-\2-\1", text))
print(re.findall(r"\d{2}/\d{2}/(\d{4})", text))`,
          notes: "Backreferences in the replacement reorder captured parts. ISO dates (YYYY-MM-DD) sort correctly as text — a good reason to store dates that way.",
        },
        {
          id: "stretch", kind: "challenge", title: "Parse log lines into records", difficulty: 4,
          prompt: `Read log lines until \`end\`. Each valid line looks like \`[LEVEL] HH:MM user=NAME action=ACTION\` (LEVEL is INFO/WARN/ERROR; NAME and ACTION are word characters). Use a compiled pattern with **named groups**. Print \`HH:MM NAME ACTION (LEVEL)\` for valid lines and \`skipped: LINE\` for others, then counts per level in alphabetical order as \`LEVEL: N\`.`,
          starter: r`import re
`,
          tests: [
            { label: "Log", input: "[INFO] 09:15 user=asha action=login\n[ERROR] 09:16 user=ravi action=pay\ngarbage line\n[INFO] 09:20 user=asha action=logout\nend\n", output: "09:15 asha login (INFO)\n09:16 ravi pay (ERROR)\nskipped: garbage line\n09:20 asha logout (INFO)\nERROR: 1\nINFO: 2" },
            { label: "Bad level", input: "[DEBUG] 10:00 user=x action=y\nend\n", output: "skipped: [DEBUG] 10:00 user=x action=y", hidden: true, category: "edge" },
          ],
          hints: [
            "Escape the square brackets: `\\[` and `\\]`.",
            "`(?P<level>INFO|WARN|ERROR)` restricts the level.",
            "Use `pattern.fullmatch(line)` and check for None.",
            "Count levels in a dict and print sorted.",
          ],
          solution: r`import re
LINE = re.compile(r"\[(?P<level>INFO|WARN|ERROR)\] (?P<time>\d{2}:\d{2}) user=(?P<user>\w+) action=(?P<action>\w+)")
counts = {}
while (line := input()) != "end":
    m = LINE.fullmatch(line)
    if m is None:
        print("skipped:", line)
        continue
    print(f"{m['time']} {m['user']} {m['action']} ({m['level']})")
    counts[m["level"]] = counts.get(m["level"], 0) + 1
for level in sorted(counts):
    print(f"{level}: {counts[level]}")`,
          notes: "Compiling once and using named groups keeps the parser readable. Real systems often emit structured (JSON) logs precisely so nobody has to regex-parse them.",
        },
      ],
      realWorld: "Data masking of card and phone numbers, log parsing in monitoring tools, URL routing (`/users/(?P<id>\\d+)`), and editor-wide search-and-replace are everyday uses of groups and substitution.",
      reteach: "Groups are scissors inside the pattern: bracket the parts you want to cut out and keep (`(\\d{4})` = 'keep the year'). Lookarounds are glances to the side — 'make sure there's an Rs before it' — without picking that bit up. `re.sub` is find-and-replace where the replacement can reuse the cut-out pieces.",
      summary: [
        "Capturing `( )`, named `(?P<name> )`, non-capturing `(?: )` groups; backreferences `\\1`.",
        "Lookaheads `(?= )` `(?! )` and lookbehinds `(?<= )` `(?<! )` check context without consuming.",
        "re.sub (with \\1 or a function) and re.split transform text; use parsers or string methods when they're clearer.",
      ],
    },
  ],
  exam: [
    {
      id: "e1", kind: "predict", difficulty: 4,
      code: r`import re
s = "id:42, id:7, ref:13"
print(re.findall(r"id:(\d+)", s), re.sub(r"id:(\d+)", r"#\1", s))`,
      answer: "['42', '7'] #42, #7, ref:13\n",
      hint: "findall with one group returns just the group.",
      explain: "The two id numbers are captured; sub replaces each id:N with #N and leaves ref:13 alone.",
    },
    {
      id: "e2", kind: "mcq", difficulty: 3,
      prompt: "Why write regex patterns as raw strings (r\"...\")?",
      options: [
        { text: "They run faster", why: "Speed is identical." },
        { text: "Backslashes reach the regex engine unchanged instead of being Python escapes", why: "Correct." },
        { text: "Raw strings ignore case", why: "Use re.IGNORECASE for that." },
      ],
      answer: 1,
      hint: "\\b in a normal string is a backspace character.",
      explain: "In a normal string `\\b` and `\\1` are Python escapes; raw strings pass them through to `re`.",
    },
    {
      id: "e3", kind: "fill", difficulty: 3,
      prompt: "Match case-insensitively.",
      code: r`import re
print(re.findall(r"python", "Python PYTHON python", flags=re.___))`,
      blanks: [["IGNORECASE", "I"]],
      output: "['Python', 'PYTHON', 'python']\n",
      hint: "A flag in the re module.",
      explain: "`re.IGNORECASE` (or `re.I`) makes matching case-insensitive.",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: contact-card extractor", difficulty: 4,
    prompt: `Read free-form lines until \`end\`. From each line extract, if present: a name after \`Name:\` (two capitalised words), an email, and a 10-digit mobile (optionally written as \`+91 \` followed by 10 digits, or with a dash after 5 digits like \`98450-12345\`). Normalise phones to 10 plain digits. Print one card per line that has at least a name: \`NAME | EMAIL or - | PHONE or -\`, then \`cards: N\`.`,
    starter: r`import re
`,
    tests: [
      { label: "Lines", input: "Name: Asha Rao, mail asha@school.in, ph +91 9845012345\nrandom text 12345\nName: Ravi Iyer call 98450-11111\nName: zoe lowercase\nend\n", output: "Asha Rao | asha@school.in | 9845012345\nRavi Iyer | - | 9845011111\ncards: 2" },
      { label: "Name only", input: "Name: Dev Shah\nend\n", output: "Dev Shah | - | -\ncards: 1", hidden: true },
    ],
    hints: [
      "Name: `Name:\\s*([A-Z][a-z]+ [A-Z][a-z]+)`.",
      "Email: `[\\w.-]+@[\\w-]+(?:\\.[\\w-]+)+`.",
      "Phone: `(?:\\+91 )?([6-9]\\d{4})-?(\\d{5})` and join the two groups.",
      "Skip lines without a name; count printed cards.",
    ],
    solution: r`import re
NAME = re.compile(r"Name:\s*([A-Z][a-z]+ [A-Z][a-z]+)")
EMAIL = re.compile(r"[\w.-]+@[\w-]+(?:\.[\w-]+)+")
PHONE = re.compile(r"(?:\+91 )?\b([6-9]\d{4})-?(\d{5})\b")
cards = 0
while (line := input()) != "end":
    name = NAME.search(line)
    if not name:
        continue
    email = EMAIL.search(line)
    phone = PHONE.search(line)
    cards += 1
    print(" | ".join([
        name.group(1),
        email.group() if email else "-",
        phone.group(1) + phone.group(2) if phone else "-",
    ]))
print("cards:", cards)`,
    notes: "Each field has its own small, compiled pattern; normalisation happens by joining captured groups. Real contact extraction would add a parser library and human review for the messy cases.",
  },
};
