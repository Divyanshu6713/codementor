import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 35 — Data analysis (specialist path). */
export const M35: PyModuleDef = {
  id: "py-data-analysis",
  number: 35,
  level: 5,
  title: "Data Analysis",
  summary: "Loading data; cleaning (missing values, types, duplicates, outliers); descriptive statistics; grouping and aggregation; joining datasets; pivot tables; correlation; visualisation; NumPy and pandas concepts; reporting findings honestly.",
  track: "specialist",
  optionalNote: "For analysts, scientists and anyone answering questions with data. Exercises use the standard library (csv, statistics) so every step runs here; pandas, NumPy and matplotlib versions are shown for your own computer.",
  prereqs: ["py-security"],
  lessons: [
    {
      id: "py-data-cleaning",
      title: "Loading and cleaning data",
      minutes: 18,
      difficulty: 3,
      objectives: [
        "Load CSV data into records",
        "Handle missing values, wrong types, duplicates and outliers",
        "Summarise data with descriptive statistics",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "A column of exam marks contains `78`, `''`, `91`, `absent`, `85`. What should you do before computing the average?",
        options: [
          { text: "Treat blanks and 'absent' as 0", why: "That silently drags the average down — it invents data." },
          { text: "Decide explicitly: exclude or flag non-numeric entries, and report how many", why: "Correct." },
          { text: "Nothing — Python will skip them", why: "It will crash on the strings." },
        ],
        answer: 1,
        hint: "Missing isn't the same as zero.",
        explain: "Cleaning decisions change results. Make them explicit and report them (e.g. 'mean of 3 valid marks; 2 missing').",
      },
      why: "Analysts often say 80% of the work is cleaning. Real data has blanks, typos, duplicate rows and impossible values; analysing it as-is gives confident, wrong answers. Careful, documented cleaning is what makes the final numbers trustworthy.",
      concept: [
        {
          title: "Load into records",
          body: `\`\`\`python
import csv, io
rows = list(csv.DictReader(open("sales.csv", newline="", encoding="utf-8")))
# each row: {"date": "2026-01-05", "region": "north", "amount": "1200"}
\`\`\`

Everything from a CSV is a **string** — convert types deliberately. (In pandas: \`pd.read_csv(...)\` infers types for you, with \`df.dtypes\` to check.)`,
        },
        {
          title: "Common cleaning steps",
          body: `| Problem | Typical fix |
| --- | --- |
| Missing values | drop the row, fill with a sensible value, or keep and flag — and say which |
| Wrong types | \`int()\`/\`float()\`/\`date.fromisoformat()\` inside try/except; collect failures |
| Inconsistent text | \`.strip().lower()\`, map synonyms (\`"N" → "north"\`) |
| Duplicates | key on the fields that identify a record; keep the first |
| Outliers | check against domain rules (age 0–120) or statistics (beyond Q3 + 1.5 × IQR); investigate before deleting |

Keep a **cleaning log**: how many rows were dropped and why.`,
        },
        {
          title: "Descriptive statistics",
          body: `\`statistics\`: \`mean\`, \`median\`, \`mode\`, \`stdev\` (sample), \`pstdev\`, \`quantiles(data, n=4)\` (quartiles). The **median** resists outliers; the **mean** doesn't — one ₹10 crore sale changes the mean a lot and the median barely at all.`,
        },
      ],
      example: {
        title: "Cleaning a messy sales file",
        code: r`import csv, io, statistics

RAW = """date,region,amount
2026-01-05,North,1200
2026-01-05,North,1200
2026-01-06, south ,850
2026-01-07,N,
2026-01-08,east,abc
2026-01-09,South,990000
2026-01-10,east,640
"""

ALIASES = {"n": "north", "s": "south", "e": "east"}
log = {"duplicates": 0, "missing": 0, "bad_type": 0}
seen, clean = set(), []
for row in csv.DictReader(io.StringIO(RAW)):
    key = tuple(row.values())
    if key in seen:
        log["duplicates"] += 1
        continue
    seen.add(key)
    region = row["region"].strip().lower()
    region = ALIASES.get(region, region)
    if not row["amount"].strip():
        log["missing"] += 1
        continue
    try:
        amount = int(row["amount"])
    except ValueError:
        log["bad_type"] += 1
        continue
    clean.append({"date": row["date"], "region": region, "amount": amount})

amounts = [r["amount"] for r in clean]
print(len(clean), "clean rows;", log)
print("mean", round(statistics.mean(amounts), 1), "median", statistics.median(amounts))
q1, q2, q3 = statistics.quantiles(amounts, n=4)
limit = q3 + 1.5 * (q3 - q1)
print("outliers above", limit, ":", [a for a in amounts if a > limit])`,
        output: "4 clean rows; {'duplicates': 1, 'missing': 1, 'bad_type': 1}\nmean 248172.5 median 1025.0\noutliers above 1855961.25 : []\n",
        lines: [
          [3, "Raw data with a duplicate, messy spacing and case, an alias, a blank, a non-number and a suspicious value."],
          [13, "Map abbreviations to one spelling."],
          [14, "A cleaning log records every decision."],
          [17, "A whole-row key catches exact duplicates."],
          [22, "Normalise text: strip spaces, lowercase, resolve aliases."],
          [27, "Convert types explicitly and count failures rather than crashing or guessing."],
          [36, "One huge value pulls the mean far above the median."],
          [37, "The IQR rule: with only 4 values the quartiles are wide, so 990000 isn't flagged — small samples make outlier rules weak."],
        ],
      },
      mistakes: [
        { title: "Silently filling missing values with 0", body: "That changes averages and totals. Fill only when you can justify it, and say so." },
        { title: "Deleting outliers automatically", body: "An outlier may be a typo — or your most important customer. Investigate before removing." },
        { title: "Forgetting everything in a CSV is text", body: "\"100\" < \"9\" as strings. Convert before comparing or summing." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`import statistics
data = [10, 12, 11, 13, 200]
print(statistics.mean(data), statistics.median(data))`,
          answer: "49.2 12\n",
          hint: "One big value affects only one of them much.",
          explain: "The mean is 246 / 5 = 49.2; the median is the middle value, 12.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Read CSV rows as dictionaries keyed by the header.",
          code: r`import csv, io
text = "name,marks\nasha,91\nravi,78\n"
rows = list(csv.___(io.StringIO(text)))
print(rows[1]["name"], int(rows[1]["marks"]) + 1)`,
          blanks: [["DictReader"]],
          output: "ravi 79\n",
          hint: "A reader that gives dicts.",
          explain: "`csv.DictReader` uses the first line as keys; values stay strings until converted.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "The 'top scorer' comes out as asha, but ravi scored 100. Which line compares the wrong type?",
          code: r`import csv, io
rows = list(csv.DictReader(io.StringIO("name,marks\nasha,95\nravi,100\nmeera,88\n")))
best = max(rows, key=lambda r: r["marks"])
print(best["name"])`,
          line: 3,
          fix: r`import csv, io
rows = list(csv.DictReader(io.StringIO("name,marks\nasha,95\nravi,100\nmeera,88\n")))
best = max(rows, key=lambda r: int(r["marks"]))
print(best["name"])`,
          output: "ravi\n",
          hint: "\"95\" vs \"100\" as text.",
          explain: "As strings, '95' > '100' because '9' > '1'. Convert to int before comparing.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "House prices in an area are mostly ₹50–80 lakh, with two mansions at ₹40 crore. Which summary best describes a typical house?",
          options: [
            { text: "Mean", why: "Pulled far up by the mansions." },
            { text: "Median", why: "Correct: robust to extreme values." },
            { text: "Maximum", why: "Describes the most expensive one only." },
          ],
          answer: 1,
          hint: "Which ignores extremes?",
          explain: "The median is the middle value and barely moves when a few extreme values are added.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Clean a survey", difficulty: 3,
          prompt: `Survey CSV (header \`id,age,city,rating\`) is given until \`end\`. Clean it:
- drop rows whose \`id\` was already seen (count \`duplicates\`)
- \`age\` must be an integer 10–100, else drop (count \`bad_age\`)
- \`rating\` must be an integer 1–5, else drop (count \`bad_rating\`)
- \`city\`: strip and title-case; blank → \`Unknown\`
Print \`kept N\`, the log as \`duplicates D, bad_age A, bad_rating R\`, then \`mean rating X\` (2 decimals) and \`median age Y\`.`,
          starter: r`import csv, io, statistics
`,
          tests: [
            { label: "Survey", input: "id,age,city,rating\n1,23, pune ,4\n2,17,DELHI,5\n2,17,DELHI,5\n3,abc,Pune,3\n4,40,,2\n5,31,mumbai,9\n6,65,Pune,5\nend\n", output: "kept 4\nduplicates 1, bad_age 1, bad_rating 1\nmean rating 4.00\nmedian age 31.5" },
          ],
          hints: [
            "Collect lines until end, join with \\n, and use csv.DictReader(io.StringIO(text)).",
            "Check duplicates first, then age, then rating.",
            "A small `to_int(text)` helper returning None on failure keeps it tidy.",
            "statistics.median of the kept ages.",
          ],
          solution: r`import csv, io, statistics

lines = []
while (line := input()) != "end":
    lines.append(line)

def to_int(text):
    try:
        return int(text)
    except ValueError:
        return None

seen, kept = set(), []
log = {"duplicates": 0, "bad_age": 0, "bad_rating": 0}
for row in csv.DictReader(io.StringIO("\n".join(lines))):
    if row["id"] in seen:
        log["duplicates"] += 1
        continue
    seen.add(row["id"])
    age, rating = to_int(row["age"]), to_int(row["rating"])
    if age is None or not 10 <= age <= 100:
        log["bad_age"] += 1
        continue
    if rating is None or not 1 <= rating <= 5:
        log["bad_rating"] += 1
        continue
    kept.append({"age": age, "city": row["city"].strip().title() or "Unknown", "rating": rating})

print("kept", len(kept))
print(", ".join(f"{k} {v}" for k, v in log.items()))
print(f"mean rating {statistics.mean(r['rating'] for r in kept):.2f}")
print("median age", statistics.median(r["age"] for r in kept))`,
          notes: "Reporting the cleaning log next to the results lets readers judge them: 4 of 7 responses survived, which matters as much as the average itself.",
        },
        {
          id: "stretch", kind: "task", title: "Flag outliers with the IQR rule", difficulty: 4,
          prompt: `Read delivery times in minutes (one per line, until \`end\`; ignore non-numbers). Using \`statistics.quantiles(data, n=4)\` (default method), compute Q1, Q3 and IQR, and fences \`Q1 − 1.5·IQR\` and \`Q3 + 1.5·IQR\`. Print \`Q1 a, Q3 b, IQR c\` (1 decimal), \`fences [lo, hi]\` (1 decimal), \`outliers: …\` (values outside, in input order, or \`none\`), and \`median with outliers X, without Y\`.`,
          starter: r`import statistics
`,
          tests: [
            { label: "Times", input: "32\n28\n35\n30\n31\n29\n140\n33\nlate\n27\n2\nend\n", output: "Q1 27.8, Q3 33.5, IQR 5.8\nfences [19.1, 42.1]\noutliers: 140, 2\nmedian with outliers 30.5, without 30.5" },
          ],
          hints: [
            "Parse with try/except, skipping bad lines.",
            "`q1, _, q3 = statistics.quantiles(data, n=4)`.",
            "Format with :.1f.",
            "The median here doesn't move — that's the point of a robust statistic.",
          ],
          solution: r`import statistics

data = []
while (line := input()) != "end":
    try:
        data.append(float(line))
    except ValueError:
        pass
q1, _, q3 = statistics.quantiles(data, n=4)
iqr = q3 - q1
lo, hi = q1 - 1.5 * iqr, q3 + 1.5 * iqr
outliers = [x for x in data if x < lo or x > hi]
print(f"Q1 {q1:.1f}, Q3 {q3:.1f}, IQR {iqr:.1f}")
print(f"fences [{lo:.1f}, {hi:.1f}]")
print("outliers:", ", ".join(f"{x:g}" for x in outliers) or "none")
kept = [x for x in data if lo <= x <= hi]
print(f"median with outliers {statistics.median(data):g}, without {statistics.median(kept):g}")`,
          notes: "The 140-minute delivery might be a real disaster worth investigating, and 2 minutes is probably a data-entry error. The rule flags them; a human decides.",
        },
      ],
      realWorld: "Hospitals clean patient records before studies; e-commerce teams de-duplicate orders before reporting revenue; government statistics publish methodology notes describing exactly these cleaning choices.",
      reteach: "Cleaning data is washing vegetables before cooking: remove the dirt (bad types), throw out the spoiled ones (impossible values), don't cook the same carrot twice (duplicates), and look twice at the strangely huge pumpkin before deciding whether it belongs (outliers). Then write down what you threw away.",
      summary: [
        "CSV values are text — convert types explicitly and count failures.",
        "Handle missing values, duplicates, inconsistent text and outliers deliberately; keep a cleaning log.",
        "Mean vs median: the median resists outliers; quartiles and IQR describe spread.",
      ],
      version: "statistics.quantiles: 3.8+",
      libraryCode: [{
        title: "The same cleaning in pandas",
        code: `import pandas as pd

df = pd.read_csv("sales.csv")
df = df.drop_duplicates()
df["region"] = df["region"].str.strip().str.lower().replace({"n": "north", "s": "south", "e": "east"})
df["amount"] = pd.to_numeric(df["amount"], errors="coerce")    # bad values → NaN
print(df["amount"].isna().sum(), "rows without a valid amount")
df = df.dropna(subset=["amount"])
print(df["amount"].describe())                                   # count, mean, std, quartiles…`,
        note: "`pip install pandas` on your own computer. pandas does each step on whole columns at once (vectorised), which is much faster on large data.",
      }],
    },

    {
      id: "py-data-grouping",
      title: "Grouping, joining, correlation and charts",
      minutes: 18,
      difficulty: 4,
      objectives: [
        "Group and aggregate records, and build pivot tables",
        "Join two datasets on a key",
        "Measure correlation and present findings honestly with charts",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "Ice-cream sales and drowning incidents rise together over the year. What can you conclude?",
        options: [
          { text: "Ice cream causes drowning", why: "Correlation isn't causation." },
          { text: "They're correlated — possibly both caused by something else (hot weather)", why: "Correct." },
          { text: "Nothing — correlation is meaningless", why: "It's meaningful, just not proof of cause." },
        ],
        answer: 1,
        hint: "Look for a hidden third factor.",
        explain: "Summer heat drives both. Correlation tells you things move together, not why.",
      },
      why: "Questions like 'which region grew fastest?' or 'do discounts increase order size?' are answered by grouping, joining and comparing. Doing it right — and describing the result honestly — is the core skill of data analysis.",
      concept: [
        {
          title: "Group-by and pivot",
          body: `**Split → apply → combine**: split rows into groups by a key, apply an aggregate (sum, mean, count), combine into a table.

\`\`\`python
totals = defaultdict(float)
for r in rows:
    totals[r["region"]] += r["amount"]
\`\`\`

A **pivot table** groups by two keys — rows × columns (region × month). In pandas: \`df.groupby("region")["amount"].sum()\` and \`df.pivot_table(index="region", columns="month", values="amount", aggfunc="sum")\`.`,
        },
        {
          title: "Joins",
          body: `Combine tables on a shared key (customer_id). **Inner** join keeps only matches; **left** join keeps every row from the left table, with missing values where there's no match. Build a dict index of the right table for O(1) lookups. Always check for keys that didn't match — they often reveal data problems.`,
        },
        {
          title: "Correlation and honest charts",
          body: `\`statistics.correlation(x, y)\` (Pearson, 3.10+) ranges −1 … +1: strength of a **linear** relationship. It doesn't prove cause, can miss curved relationships, and is sensitive to outliers.

Charts: start bar-chart axes at zero, label units, show sample sizes, don't cherry-pick date ranges. matplotlib/seaborn/plotly draw charts on your computer; here we draw text bar charts.`,
        },
      ],
      example: {
        title: "Grouping, a pivot, a join and a text chart",
        code: r`import statistics
from collections import defaultdict

orders = [
    ("o1", "c1", "Jan", 1200), ("o2", "c2", "Jan", 800), ("o3", "c1", "Feb", 1500),
    ("o4", "c3", "Feb", 400), ("o5", "c2", "Mar", 950), ("o6", "c9", "Mar", 300),
]
customers = {"c1": "north", "c2": "south", "c3": "north"}

by_region = defaultdict(int)
pivot = defaultdict(lambda: defaultdict(int))
unmatched = []
for oid, cid, month, amount in orders:
    region = customers.get(cid)
    if region is None:
        unmatched.append(oid)
        continue
    by_region[region] += amount
    pivot[region][month] += amount

months = ["Jan", "Feb", "Mar"]
print("region  " + "  ".join(f"{m:>5}" for m in months))
for region in sorted(pivot):
    print(f"{region:<7} " + "  ".join(f"{pivot[region][m]:>5}" for m in months))
print("unmatched orders:", unmatched)

top = max(by_region.values())
for region, total in sorted(by_region.items(), key=lambda kv: -kv[1]):
    print(f"{region:<6} {'#' * round(20 * total / top):<20} {total}")

ad_spend = [10, 20, 30, 40, 50]
visits = [120, 190, 310, 380, 520]
print("correlation:", round(statistics.correlation(ad_spend, visits), 3))`,
        output: "region    Jan    Feb    Mar\nnorth    1200   1900      0\nsouth     800      0    950\nunmatched orders: ['o6']\nnorth  #################### 3100\nsouth  ###########          1750\ncorrelation: 0.993\n",
        lines: [
          [8, "A lookup table of customers — the 'right side' of the join."],
          [14, "Look up each order's customer: an O(1) dict join."],
          [16, "Orders with unknown customers are collected, not silently dropped."],
          [18, "Group-by: total per region."],
          [19, "Pivot: total per region per month."],
          [22, "Missing combinations show as 0 thanks to defaultdict."],
          [28, "A text bar chart scaled so the largest bar is 20 characters (starting from zero)."],
          [33, "Strong positive correlation — which still doesn't prove ads caused the visits."],
        ],
      },
      mistakes: [
        { title: "Dropping unmatched rows silently", body: "An inner join can hide missing customers or typos in keys. Count and inspect what didn't match." },
        { title: "Averaging averages", body: "The mean of group means isn't the overall mean when groups differ in size. Recompute from totals and counts." },
        { title: "Truncated axes and cherry-picked ranges", body: "Starting a bar chart at 95 makes a 1% difference look huge. Show context and sample sizes." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`from collections import defaultdict
sales = [("pen", 3), ("book", 1), ("pen", 2), ("lamp", 1)]
count = defaultdict(int)
for item, qty in sales:
    count[item] += qty
print(dict(count), max(count, key=count.get))`,
          answer: "{'pen': 5, 'book': 1, 'lamp': 1} pen\n",
          hint: "Quantities are summed per item.",
          explain: "pen: 3 + 2 = 5; book and lamp 1 each; pen is the maximum.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Compute Pearson's correlation (Python 3.10+).",
          code: r`import statistics
hours = [1, 2, 3, 4]
marks = [50, 60, 70, 80]
print(statistics.___(hours, marks))`,
          blanks: [["correlation"]],
          output: "1.0\n",
          hint: "The function's name says what it measures.",
          explain: "A perfectly straight line gives a correlation of 1.0.",
        },
        {
          id: "b1", kind: "bug", difficulty: 4,
          prompt: "The overall average order value should be total revenue ÷ total orders (= 220.0), but this averages the region averages. Which line is wrong?",
          code: r`import statistics
regions = {"north": [100, 100, 100, 100], "south": [700]}
region_avgs = [statistics.mean(v) for v in regions.values()]
overall = statistics.mean(region_avgs)
print(overall)`,
          line: 4,
          fix: r`import statistics
regions = {"north": [100, 100, 100, 100], "south": [700]}
region_avgs = [statistics.mean(v) for v in regions.values()]
overall = sum(sum(v) for v in regions.values()) / sum(len(v) for v in regions.values())
print(overall)`,
          output: "220.0\n",
          hint: "North has 4 orders, south has 1.",
          explain: "The mean of averages gives each region equal weight (400). Weight by count: 1100 / 5 = 220.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "You left-join 1,000 orders to a customer table and 37 orders get no customer. Best next step?",
          options: [
            { text: "Drop them and carry on", why: "You'd lose data without knowing why." },
            { text: "Inspect the unmatched keys — typos, deleted customers, or a data bug?", why: "Correct." },
            { text: "Assign them to a random customer", why: "Fabricates data." },
          ],
          answer: 1,
          hint: "Unmatched keys are a clue.",
          explain: "Unmatched rows often reveal formatting differences ('C001' vs 'c001') or missing reference data. Investigate and report.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Monthly report by category", difficulty: 3,
          prompt: `Read expenses \`YYYY-MM-DD,category,amount\` until \`end\`. Print a pivot table with categories as rows (alphabetical) and months as columns (\`YYYY-MM\`, chronological): first a header \`category\` followed by the months, then each category's totals, then a \`TOTAL\` row. Columns are separated by \` | \`; amounts are integers.`,
          starter: r`from collections import defaultdict
`,
          tests: [
            { label: "Expenses", input: "2026-02-03,food,300\n2026-01-15,rent,9000\n2026-01-20,food,450\n2026-02-01,rent,9000\n2026-02-14,fun,600\nend\n", output: "category | 2026-01 | 2026-02\nfood | 450 | 300\nfun | 0 | 600\nrent | 9000 | 9000\nTOTAL | 9450 | 9900" },
          ],
          hints: [
            "month = date[:7].",
            "`table = defaultdict(lambda: defaultdict(int))`; collect a set of months.",
            "Sorted month strings in YYYY-MM form are chronological.",
            "Build each row as a list of strings and join with ' | '.",
          ],
          solution: r`from collections import defaultdict

table = defaultdict(lambda: defaultdict(int))
months = set()
while (line := input()) != "end":
    date, category, amount = line.split(",")
    month = date[:7]
    months.add(month)
    table[category][month] += int(amount)

months = sorted(months)
print(" | ".join(["category", *months]))
for category in sorted(table):
    print(" | ".join([category, *(str(table[category][m]) for m in months)]))
print(" | ".join(["TOTAL", *(str(sum(table[c][m] for c in table)) for m in months)]))`,
          notes: "In pandas this whole exercise is one call: `df.pivot_table(index=\"category\", columns=\"month\", values=\"amount\", aggfunc=\"sum\", fill_value=0, margins=True)`.",
        },
        {
          id: "stretch", kind: "task", title: "Join, compare and report honestly", difficulty: 4,
          prompt: `Students (\`id,name,attended_classes\`) are given until \`---\`, then exam marks (\`id,marks\`) until \`end\`. Left-join marks onto students. Print:
- \`joined N, missing marks: <names>\` (students without marks, input order, or \`none\`) and \`unknown ids: <ids>\` (marks for ids not in the student list, or \`none\`)
- \`correlation attendance-marks: r\` (3 decimals, using only students with marks)
- a text chart: for each student with marks (by marks desc, then name): \`name   ##### marks\` with \`marks // 10\` hashes and the name padded to 6
- a final caution line exactly: \`note: correlation from N students; it does not show that attendance causes higher marks\``,
          starter: r`import statistics
`,
          tests: [
            { label: "Class", input: "1,Asha,28\n2,Ravi,15\n3,Meera,25\n4,Zoe,30\n5,Kabir,10\n---\n1,88\n2,61\n3,79\n4,92\n9,70\nend\n", output: "joined 4, missing marks: Kabir\nunknown ids: 9\ncorrelation attendance-marks: 0.995\nZoe    ######### 92\nAsha   ######## 88\nMeera  ####### 79\nRavi   ###### 61\nnote: correlation from 4 students; it does not show that attendance causes higher marks" },
          ],
          hints: [
            "Store students as {id: (name, attended)} in input order (dicts keep order).",
            "Marks: {id: marks}; unknown ids are those not in students.",
            "Build parallel lists of attendance and marks for joined students.",
            "`f\"{name:<6} {'#' * (m // 10)} {m}\"`.",
          ],
          solution: r`import statistics

students = {}
while (line := input()) != "---":
    sid, name, attended = line.split(",")
    students[sid] = (name, int(attended))
marks = {}
while (line := input()) != "end":
    sid, m = line.split(",")
    marks[sid] = int(m)

joined = [(name, att, marks[sid]) for sid, (name, att) in students.items() if sid in marks]
missing = [name for sid, (name, _) in students.items() if sid not in marks]
unknown = [sid for sid in marks if sid not in students]
print(f"joined {len(joined)}, missing marks: {', '.join(missing) or 'none'}")
print(f"unknown ids: {', '.join(unknown) or 'none'}")
r = statistics.correlation([a for _, a, _ in joined], [m for _, _, m in joined])
print(f"correlation attendance-marks: {r:.3f}")
for name, _, m in sorted(joined, key=lambda t: (-t[2], t[0])):
    print(f"{name:<6} {'#' * (m // 10)} {m}")
print(f"note: correlation from {len(joined)} students; it does not show that attendance causes higher marks")`,
          notes: "Four students and a correlation of 0.995 is a striking but fragile result — a fifth student could change it a lot. Good reports state the sample size and the limits of what the numbers show.",
        },
      ],
      realWorld: "Business analysts build pivot tables of sales by region and month; public-health researchers join hospital and census data; newsrooms fact-check charts for truncated axes and misleading correlations.",
      reteach: "Grouping is sorting a pile of receipts into envelopes by shop and adding up each envelope. A pivot table is a grid of envelopes: shops down the side, months across the top. A join is matching each receipt to the customer card with the same number — and putting aside the receipts whose card you can't find, so you can ask why.",
      summary: [
        "Split-apply-combine with dicts/defaultdict; pivot tables group by two keys.",
        "Join via a dict index; always count and inspect unmatched keys; weight averages by counts.",
        "Correlation (−1…1) measures linear association, not causation; honest charts start at zero and state sample sizes.",
      ],
      version: "statistics.correlation: Python 3.10+",
      libraryCode: [{
        title: "pandas + matplotlib version",
        code: `import pandas as pd
import matplotlib.pyplot as plt

orders = pd.read_csv("orders.csv")          # order_id, customer_id, month, amount
customers = pd.read_csv("customers.csv")    # customer_id, region
df = orders.merge(customers, on="customer_id", how="left", indicator=True)
print(df["_merge"].value_counts())          # how many orders had no customer?

pivot = df.pivot_table(index="region", columns="month", values="amount", aggfunc="sum", fill_value=0)
print(pivot)
pivot.sum(axis=1).plot.bar(title="Revenue by region (₹)")
plt.ylabel("₹"); plt.tight_layout(); plt.savefig("revenue.png")`,
        note: "`pip install pandas matplotlib` on your own computer. `indicator=True` adds the column that reveals unmatched rows — the same check we did by hand.",
      }],
    },
  ],
  exam: [
    {
      id: "e1", kind: "mcq", difficulty: 3,
      prompt: "A dataset has 10% of incomes missing. Which is the most defensible first step?",
      options: [
        { text: "Replace them with 0", why: "Invents very low incomes." },
        { text: "Report how many are missing and analyse with and without an explicit fill strategy", why: "Correct." },
        { text: "Delete the column", why: "Throws away 90% good data." },
      ],
      answer: 1,
      hint: "Transparency first.",
      explain: "Document missingness, choose a justified approach (drop, impute, flag) and check how much the result depends on it.",
    },
    {
      id: "e2", kind: "predict", difficulty: 3,
      code: r`import statistics
print(statistics.quantiles([1, 2, 3, 4, 5, 6, 7, 8], n=4))`,
      answer: "[2.25, 4.5, 6.75]\n",
      hint: "Default method is 'exclusive'.",
      explain: "statistics.quantiles returns the three cut points between quartiles: 2.25, 4.5 and 6.75.",
    },
    {
      id: "e3", kind: "fill", difficulty: 3,
      prompt: "Create a dict whose missing keys start at 0.",
      code: r`from collections import ___
totals = defaultdict(int)
for city, n in [("pune", 2), ("pune", 3), ("goa", 1)]:
    totals[city] += n
print(dict(totals))`,
      blanks: [["defaultdict"]],
      output: "{'pune': 5, 'goa': 1}\n",
      hint: "A dict with a default.",
      explain: "`defaultdict(int)` creates 0 for new keys, so += works immediately.",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: CSV sales analyser", difficulty: 4,
    prompt: `Analyse a store's sales CSV (header \`date,product,category,qty,unit_price\`, until \`end\`).

1. **Clean**: skip rows with non-integer qty or non-numeric price, qty ≤ 0, or price < 0; normalise category to lowercase/stripped. Print \`rows: kept K, skipped S\`.
2. **Summary**: \`revenue: R\` (sum of qty × price, 2 decimals) and \`orders: K\`.
3. **By category** (revenue desc): \`category: revenue (share%)\` — share to 1 decimal.
4. **Best day**: \`best day: YYYY-MM-DD (revenue)\` (ties → earliest date).
5. **Top products** by quantity (top 3, ties by name): \`top products: a (q), b (q), c (q)\`.`,
    starter: r`import csv, io
from collections import defaultdict
`,
    tests: [
      { label: "Sales", input: "date,product,category,qty,unit_price\n2026-03-01,pen,Stationery ,10,12.5\n2026-03-01,notebook,stationery,5,40\n2026-03-02,mug,Kitchen,2,250\n2026-03-02,pen,stationery,x,12.5\n2026-03-03,kettle,kitchen,1,1499\n2026-03-03,stapler,stationery,0,180\n2026-03-03,pen,stationery,4,12.5\nend\n", output: "rows: kept 5, skipped 2\nrevenue: 2374.00\norders: 5\nkitchen: 1999.00 (84.2%)\nstationery: 375.00 (15.8%)\nbest day: 2026-03-03 (1549.00)\ntop products: pen (14), notebook (5), mug (2)" },
    ],
    hints: [
      "Parse with csv.DictReader(io.StringIO(text)); convert inside try/except.",
      "Accumulate revenue per category, per day and quantity per product with defaultdicts.",
      "Shares: 100 * cat_rev / total.",
      "Best day: sort the day totals by (-revenue, date) and take the first.",
    ],
    solution: r`import csv, io
from collections import defaultdict

lines = []
while (line := input()) != "end":
    lines.append(line)

kept, skipped = [], 0
for row in csv.DictReader(io.StringIO("\n".join(lines))):
    try:
        qty, price = int(row["qty"]), float(row["unit_price"])
    except ValueError:
        skipped += 1
        continue
    if qty <= 0 or price < 0:
        skipped += 1
        continue
    kept.append((row["date"], row["product"].strip(), row["category"].strip().lower(), qty, qty * price))

total = sum(r[4] for r in kept)
by_cat, by_day, by_product = defaultdict(float), defaultdict(float), defaultdict(int)
for date, product, category, qty, revenue in kept:
    by_cat[category] += revenue
    by_day[date] += revenue
    by_product[product] += qty

print(f"rows: kept {len(kept)}, skipped {skipped}")
print(f"revenue: {total:.2f}")
print(f"orders: {len(kept)}")
for category, rev in sorted(by_cat.items(), key=lambda kv: -kv[1]):
    print(f"{category}: {rev:.2f} ({100 * rev / total:.1f}%)")
day, rev = sorted(by_day.items(), key=lambda kv: (-kv[1], kv[0]))[0]
print(f"best day: {day} ({rev:.2f})")
top = sorted(by_product.items(), key=lambda kv: (-kv[1], kv[0]))[:3]
print("top products:", ", ".join(f"{p} ({q})" for p, q in top))`,
    notes: "Always sanity-check a report: the category shares should add up to 100% (allowing for rounding) and the category revenues to the total. Before real use: read the file from disk, store money as Decimal or integer paise, add date-range filters and charts (matplotlib), and test with a large file.",
  },
};
