import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 15 — File handling. */
export const M15: PyModuleDef = {
  id: "py-files",
  number: 15,
  level: 3,
  title: "File Handling",
  summary: "Opening, reading, writing and appending text files; context managers with `with`; paths and pathlib; directories and temporary files; CSV and JSON; binary files and encodings; handling file errors.",
  track: "core",
  prereqs: ["py-modules"],
  lessons: [
    {
      id: "py-text-files",
      title: "Reading and writing text files",
      minutes: 16,
      difficulty: 2,
      objectives: [
        "Open files in read, write and append mode",
        "Use `with` so files are always closed",
        "Read a whole file, line by line, or into a list of lines",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "What happens to an existing file opened with mode `\"w\"`?",
        options: [
          { text: "New text is added at the end", why: "That's append mode, \"a\"." },
          { text: "It's emptied first, then written", why: "Correct — \"w\" truncates the file." },
          { text: "Python refuses to open it", why: "That's mode \"x\" (exclusive create)." },
        ],
        answer: 1,
        hint: "w = write from scratch.",
        explain: "Mode \"w\" creates the file or empties an existing one; \"a\" appends; \"x\" fails if it exists.",
      },
      why: "Programs need to remember things after they stop: saved games, notes, logs, exported reports. Files are the simplest way — and every data format you'll use (CSV, JSON, config files) is built on reading and writing text.",
      concept: [
        {
          title: "open, modes and with",
          body: `\`\`\`python
with open("notes.txt", "w", encoding="utf-8") as f:
    f.write("first line\\n")
    f.write("second line\\n")
# the file is closed here, even if an error happened inside
\`\`\`

| Mode | Meaning |
| --- | --- |
| \`"r"\` | read (default); error if missing |
| \`"w"\` | write; creates or **empties** |
| \`"a"\` | append to the end; creates if missing |
| \`"x"\` | create; error if it exists |
| add \`"b"\` | binary (\`"rb"\`, \`"wb"\`) |

\`write\` doesn't add newlines — include \`\\n\` yourself. Always pass \`encoding="utf-8"\` for text.`,
        },
        {
          title: "Reading",
          body: `\`\`\`python
with open("notes.txt", encoding="utf-8") as f:
    text = f.read()            # the whole file as one string

with open("notes.txt", encoding="utf-8") as f:
    for line in f:             # one line at a time (memory-friendly)
        print(line.rstrip("\\n"))

lines = open("notes.txt", encoding="utf-8").read().splitlines()   # list without \\n
\`\`\`

A file object is an iterator: once you've read to the end, reading again gives nothing.`,
        },
      ],
      example: {
        title: "A tiny diary",
        code: r`with open("diary.txt", "w", encoding="utf-8") as f:
    f.write("Mon: learned files\n")
    f.write("Tue: practised with\n")
with open("diary.txt", "a", encoding="utf-8") as f:
    print("Wed: wrote a diary", file=f)
with open("diary.txt", encoding="utf-8") as f:
    for number, line in enumerate(f, start=1):
        print(number, line.rstrip("\n"))
with open("diary.txt", encoding="utf-8") as f:
    print(len(f.read()), "characters")`,
        output: "1 Mon: learned files\n2 Tue: practised with\n3 Wed: wrote a diary\n58 characters\n",
        lines: [
          [1, "Create (or empty) the file; `with` closes it at the end of the block."],
          [2, "write takes a string and doesn't add a newline — so we include \\n."],
          [4, "Append mode adds to the end instead of replacing."],
          [5, "print can write to a file too; it adds the newline for us."],
          [7, "Looping over a file gives one line at a time (with its \\n)."],
          [10, "read() returns the whole file as one string."],
        ],
      },
      mistakes: [
        { title: "Opening with \"w\" by accident", body: "\"w\" wipes the file immediately. Use \"a\" to add, \"r\" to read." },
        { title: "Forgetting newlines", body: "`f.write(\"a\")` twice gives `aa` on one line. Add `\\n`, or use `print(..., file=f)`." },
        { title: "Not closing files", body: "Without `with` (or `close()`), buffered data may never reach the disk. Always use `with`." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 2,
          code: r`with open("t.txt", "w") as f:
    f.write("a\nb\n")
with open("t.txt", "w") as f:
    f.write("c\n")
with open("t.txt") as f:
    print(f.read().splitlines())`,
          answer: "['c']\n",
          hint: "What does the second \"w\" do to the file?",
          explain: "Opening with \"w\" again empties the file, so only \"c\" remains.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Add a line to the end without deleting what's there.",
          code: r`with open("log.txt", "w") as f:
    f.write("start\n")
with open("log.txt", "___") as f:
    f.write("next\n")
print(open("log.txt").read().split())`,
          blanks: [["a"]],
          output: "['start', 'next']\n",
          hint: "The append mode.",
          explain: "Mode \"a\" writes at the end of the existing content.",
        },
        {
          id: "b1", kind: "bug", difficulty: 2,
          prompt: "This should print `2` (two lines) but prints `1`. Which line is the bug?",
          code: r`with open("names.txt", "w") as f:
    f.write("asha")
    f.write("ravi")
print(len(open("names.txt").read().splitlines()))`,
          line: 2,
          fix: r`with open("names.txt", "w") as f:
    f.write("asha\n")
    f.write("ravi\n")
print(len(open("names.txt").read().splitlines()))`,
          output: "2\n",
          hint: "Does write add a newline?",
          explain: "write doesn't add line breaks, so the file contains \"asharavi\" on one line. Add \\n to each write.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 2,
          prompt: "Why use `with open(...) as f:`?",
          options: [
            { text: "It's the only way to open files", why: "open works without with — but then you must close the file yourself." },
            { text: "It closes the file automatically, even if an error occurs", why: "Correct." },
            { text: "It makes reading faster", why: "Speed is the same." },
          ],
          answer: 1,
          hint: "What happens at the end of the block?",
          explain: "The with statement guarantees cleanup (Module 25 shows how it works).",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Save and reload a shopping list", difficulty: 2,
          prompt: `Read items from input until \`done\` and **write** them to \`list.txt\`, one per line. Then **read the file back** and print \`N items:\` followed by the items numbered from 1.`,
          starter: r`items = []
`,
          tests: [
            { label: "Three items", input: "milk\nbread\neggs\ndone\n", output: "3 items:\n1. milk\n2. bread\n3. eggs" },
            { label: "None", input: "done\n", output: "0 items:", hidden: true, category: "edge" },
          ],
          hints: [
            "Collect items in a loop, then write them all at once.",
            "`with open(\"list.txt\", \"w\", encoding=\"utf-8\") as f:` and `f.write(item + \"\\n\")`.",
            "Read back with `.read().splitlines()`.",
            "Print the count, then `enumerate(lines, start=1)`.",
          ],
          solution: r`items = []
while True:
    item = input()
    if item == "done":
        break
    items.append(item)
with open("list.txt", "w", encoding="utf-8") as f:
    for item in items:
        f.write(item + "\n")
with open("list.txt", encoding="utf-8") as f:
    lines = f.read().splitlines()
print(f"{len(lines)} items:")
for i, item in enumerate(lines, start=1):
    print(f"{i}. {item}")`,
          notes: "Reading back what you wrote proves it really reached the file. The sandbox gives your program a private folder that's emptied after the run.",
        },
        {
          id: "stretch", kind: "task", title: "Count lines, words and characters", difficulty: 3,
          prompt: `The file \`poem.txt\` sits next to your program. Print its line count, word count, character count (\`len\` of the whole text) and the longest line, like the Unix \`wc\` tool:

\`\`\`
lines 4
words 22
chars 107
longest: Twinkle twinkle little star how I wonder
\`\`\``,
          starter: r`with open("poem.txt", encoding="utf-8") as f:
    text = f.read()
`,
          files: [{ name: "poem.txt", content: "Twinkle twinkle little star how I wonder\nwhat you are\nup above the world so high\nlike a diamond in the sky\n" }],
          tests: [{ label: "Poem", input: "", output: "lines 4\nwords 22\nchars 107\nlongest: Twinkle twinkle little star how I wonder" }],
          hints: [
            "`text.splitlines()` gives the lines.",
            "`len(text.split())` counts words.",
            "`len(text)` counts characters including newlines.",
            "`max(lines, key=len)` is the longest line.",
          ],
          solution: r`with open("poem.txt", encoding="utf-8") as f:
    text = f.read()
lines = text.splitlines()
print("lines", len(lines))
print("words", len(text.split()))
print("chars", len(text))
print("longest:", max(lines, key=len))`,
          notes: "This is what `wc` does. For huge files you'd loop line by line instead of reading everything into memory.",
        },
      ],
      realWorld: "Log files, configuration files, exported reports, saved game data, notes apps — all are text files read and written exactly like this. Servers append to log files thousands of times a second.",
      reteach: "A file is a notebook on a shelf. `open` takes it down; the mode says what you'll do: read it (r), tear out every page and start fresh (w), or turn to the last page and keep writing (a). `with` makes sure the notebook goes back on the shelf, no matter what happens while you're writing.",
      summary: [
        "`with open(path, mode, encoding=\"utf-8\") as f:` — modes r, w (empties!), a, x, plus b for binary.",
        "write() doesn't add newlines; print(..., file=f) does.",
        "Read with read(), a for loop over lines, or read().splitlines().",
      ],
      cpp: {
        python: r`with open("a.txt", "w") as f:
    f.write("hi\n")`,
        cpp: r`#include <fstream>
std::ofstream f("a.txt");
f << "hi\n";   // closed automatically when f goes out of scope (RAII)`,
        note: "C++ closes files when the stream object is destroyed (RAII); Python uses `with` for the same guarantee. (CodeMentor's C++ sandbox blocks fstream; the Python sandbox allows files in a private folder.)",
      },
    },

    {
      id: "py-paths",
      title: "Paths, pathlib and directories",
      minutes: 16,
      difficulty: 3,
      objectives: [
        "Build and inspect paths with `pathlib.Path`",
        "Create, list and remove files and folders",
        "Use temporary files and folders safely",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "`Path(\"reports\") / \"2026\" / \"marks.csv\"` produces…",
        options: [
          { text: "An error: you can't divide strings", why: "Path overloads `/` to join path parts." },
          { text: "A path `reports/2026/marks.csv` (with the right separator for the OS)", why: "Correct." },
          { text: "The string \"reports2026marks.csv\"", why: "Path inserts separators." },
        ],
        answer: 1,
        hint: "pathlib overloads an operator.",
        explain: "Path objects use `/` to join parts and pick the correct separator for Windows or Linux.",
      },
      why: "Programs that organise files — download sorters, backup scripts, report generators — must build paths that work on every operating system and inspect names, extensions and folders. pathlib makes this clean.",
      concept: [
        {
          title: "Path objects",
          body: `\`\`\`python
from pathlib import Path
p = Path("reports") / "2026" / "marks.csv"
p.name        # 'marks.csv'
p.stem        # 'marks'
p.suffix      # '.csv'
p.parent      # Path('reports/2026')
p.exists(), p.is_file(), p.is_dir()
Path.cwd()    # current working directory
\`\`\`

Paths work with \`open(p)\`, and have shortcuts: \`p.read_text()\`, \`p.write_text(s)\`.`,
        },
        {
          title: "Directories",
          body: `\`\`\`python
Path("out/images").mkdir(parents=True, exist_ok=True)   # make folders
for item in Path(".").iterdir(): ...      # direct children
sorted(Path(".").glob("*.txt"))           # matching names
list(Path(".").rglob("*.py"))             # recursive
p.rename("new.txt"); p.unlink()           # rename, delete a file
Path("empty_dir").rmdir()                 # delete an EMPTY folder
\`\`\`

\`shutil\` copies and removes whole trees (\`shutil.copytree\`, \`shutil.rmtree\` — careful!).`,
        },
        {
          title: "Temporary files",
          body: `\`tempfile\` creates files/folders that are cleaned up for you:

\`\`\`python
import tempfile
with tempfile.TemporaryDirectory() as tmp:
    work = Path(tmp) / "scratch.txt"
    work.write_text("temp data")
# the folder and its contents are gone here
\`\`\``,
        },
      ],
      example: {
        title: "Organising files by extension",
        code: r`from pathlib import Path
for name in ["a.txt", "b.csv", "c.txt", "photo.jpg"]:
    Path(name).write_text("x")
for p in sorted(Path(".").glob("*.*")):
    folder = Path(p.suffix[1:])
    folder.mkdir(exist_ok=True)
    p.rename(folder / p.name)
for d in sorted(x for x in Path(".").iterdir() if x.is_dir()):
    print(d.name, sorted(f.name for f in d.iterdir()))
report = Path("txt") / "a.txt"
print(report.stem, report.suffix, report.parent, report.exists())`,
        output: "csv ['b.csv']\njpg ['photo.jpg']\ntxt ['a.txt', 'c.txt']\na .txt txt True\n",
        lines: [
          [3, "Create four small files to organise."],
          [4, "glob(\"*.*\") matches names with an extension."],
          [5, "The folder name is the extension without its dot."],
          [7, "Move the file into that folder."],
          [8, "List each folder and its sorted contents."],
          [11, "Path parts: stem, suffix, parent."],
        ],
      },
      mistakes: [
        { title: "Building paths with + and \"\\\\\"", body: "`folder + \"\\\\\" + name` breaks on Linux/macOS. Use `Path(folder) / name`." },
        { title: "Relative paths depend on where you run", body: "`open(\"data.csv\")` looks in the current working directory, not necessarily the script's folder. Use `Path(__file__).parent / \"data.csv\"` when it must be next to the script." },
        { title: "rmtree on the wrong path", body: "`shutil.rmtree` deletes everything without asking. Double-check the path (and never build it from untrusted input)." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 2,
          code: r`from pathlib import Path
p = Path("music") / "pop" / "song.final.mp3"
print(p.name, p.stem, p.suffix)
print(p.parent.name, p.with_suffix(".wav").name)`,
          answer: "song.final.mp3 song.final .mp3\npop song.final.wav\n",
          hint: "suffix is only the last extension.",
          explain: "name is the last part; stem drops only the final suffix; the parent folder is 'pop'; with_suffix swaps the extension.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Create nested folders even if some already exist.",
          code: r`from pathlib import Path
Path("a/b/c").mkdir(parents=True, exist_ok=___)
print(Path("a/b/c").is_dir())`,
          blanks: [["True"]],
          output: "True\n",
          hint: "Don't fail if it's already there.",
          explain: "`exist_ok=True` avoids FileExistsError; `parents=True` creates missing parents.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "This should list only the .txt files (`['a.txt', 'b.txt']`). Which line is wrong?",
          code: r`from pathlib import Path
for n in ["a.txt", "b.txt", "c.csv"]:
    Path(n).write_text("x")
print(sorted(p.name for p in Path(".").glob("*.csv")))`,
          line: 4,
          fix: r`from pathlib import Path
for n in ["a.txt", "b.txt", "c.csv"]:
    Path(n).write_text("x")
print(sorted(p.name for p in Path(".").glob("*.txt")))`,
          output: "['a.txt', 'b.txt']\n",
          hint: "Check the glob pattern.",
          explain: "The pattern selects .csv files. It should be `*.txt`.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 2,
          prompt: "Which deletes a folder **and everything inside it**?",
          options: [
            { text: "`Path(\"x\").rmdir()`", why: "Only works on empty folders." },
            { text: "`shutil.rmtree(\"x\")`", why: "Correct — use with great care." },
            { text: "`Path(\"x\").unlink()`", why: "unlink removes a file, not a folder." },
          ],
          answer: 1,
          hint: "A tree remover.",
          explain: "`shutil.rmtree` recursively deletes a directory tree.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Report the files in a folder", difficulty: 2,
          prompt: `Your folder contains some files (see the files list). Print every **file** sorted by name with its size in bytes, then a total line:

\`\`\`
data.csv 22
notes.txt 12
readme.md 9
3 files, 43 bytes
\`\`\`

Skip \`main.py\` (your own program file isn't in the folder in CodeMentor anyway — but real folders would include it).`,
          starter: r`from pathlib import Path
`,
          files: [
            { name: "notes.txt", content: "hello world\n" },
            { name: "data.csv", content: "name,mark\nasha,91\nb,1\n" },
            { name: "readme.md", content: "# Readme\n" },
          ],
          tests: [{ label: "Three files", input: "", output: "data.csv 22\nnotes.txt 12\nreadme.md 9\n3 files, 43 bytes" }],
          hints: [
            "`Path(\".\").iterdir()` lists the folder.",
            "Keep only `p.is_file()` and skip `main.py`.",
            "`p.stat().st_size` is the size in bytes.",
            "Sort by name, print each, and add up the sizes.",
          ],
          solution: r`from pathlib import Path

files = sorted((p for p in Path(".").iterdir() if p.is_file() and p.name != "main.py"), key=lambda p: p.name)
total = 0
for p in files:
    size = p.stat().st_size
    total += size
    print(p.name, size)
print(f"{len(files)} files, {total} bytes")`,
          notes: "`stat()` gives metadata like size and modification time. Sizes are bytes on disk, which can differ from `len(text)` for non-ASCII text.",
        },
        {
          id: "stretch", kind: "challenge", title: "File organiser", difficulty: 3,
          prompt: `Read file names (one per line) until \`end\` and create each as an empty file. Then move every file into a folder named after its extension (lower-case; files without an extension go to \`other\`). Finally print each folder alphabetically with its files: \`folder: a, b\`.`,
          starter: r`from pathlib import Path
`,
          tests: [
            { label: "Mixed", input: "Report.PDF\nphoto.jpg\nnotes\nscan.pdf\nend\n", output: "jpg: photo.jpg\nother: notes\npdf: Report.PDF, scan.pdf" },
            { label: "One type", input: "a.txt\nb.txt\nend\n", output: "txt: a.txt, b.txt", hidden: true },
          ],
          hints: [
            "Create files with `Path(name).touch()`.",
            "`p.suffix.lower()[1:]` or \"other\" if there's no suffix.",
            "`mkdir(exist_ok=True)` then `p.rename(folder / p.name)`.",
            "Print by iterating over sorted folders and their sorted files.",
          ],
          solution: r`from pathlib import Path

names = []
while True:
    n = input()
    if n == "end":
        break
    names.append(n)
for n in names:
    Path(n).touch()
for n in names:
    p = Path(n)
    folder = Path(p.suffix.lower()[1:] or "other")
    folder.mkdir(exist_ok=True)
    p.rename(folder / p.name)
for d in sorted(x for x in Path(".").iterdir() if x.is_dir()):
    print(f"{d.name}: {', '.join(sorted(f.name for f in d.iterdir()))}")`,
          notes: "A real downloads-folder organiser works exactly like this — but test it on a copy first, and decide what to do when a file with the same name already exists in the target folder.",
        },
      ],
      realWorld: "Automation scripts (Module 38) clean up downloads, rotate logs, back up project folders and generate reports into dated folders — all with pathlib. Web frameworks use Path to locate templates and static files relative to the code.",
      reteach: "A Path is an address written on an envelope, made of parts: country / city / street (`a / b / c`). pathlib knows how to read the parts (name, extension, parent folder) and how to write the address the local post office (operating system) expects.",
      summary: [
        "`Path(a) / b` builds paths portably; name, stem, suffix, parent describe them.",
        "mkdir(parents=True, exist_ok=True), iterdir, glob/rglob, rename, unlink, rmdir; shutil for trees.",
        "tempfile gives self-cleaning files and folders.",
      ],
    },

    {
      id: "py-csv-json",
      title: "CSV and JSON files",
      minutes: 17,
      difficulty: 3,
      objectives: [
        "Read and write CSV files with `csv.reader`, `DictReader` and `DictWriter`",
        "Convert between Python objects and JSON with `json`",
        "Choose CSV or JSON for a given kind of data",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "Why use the `csv` module instead of `line.split(\",\")`?",
        options: [
          { text: "It's the same thing", why: "Not when fields contain commas or quotes." },
          { text: "It correctly handles quoted fields like `\"Rao, Asha\"`", why: "Correct." },
          { text: "split doesn't work on strings", why: "It does — but it can't understand CSV quoting." },
        ],
        answer: 1,
        hint: "What if a value contains a comma?",
        explain: "CSV allows quoted fields containing commas and newlines; the csv module parses them correctly.",
      },
      why: "CSV is the language of spreadsheets and exports; JSON is the language of web APIs and config files. Converting between files and Python data correctly is a skill you'll use in nearly every data or web project.",
      concept: [
        {
          title: "CSV",
          body: `\`\`\`python
import csv
with open("marks.csv", newline="", encoding="utf-8") as f:
    for row in csv.DictReader(f):        # each row is a dict keyed by the header
        print(row["name"], int(row["mark"]))

with open("out.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=["name", "grade"])
    w.writeheader()
    w.writerow({"name": "Asha", "grade": "A"})
\`\`\`

Always open CSV files with \`newline=""\`. Every value comes back as a **string** — convert numbers yourself.`,
        },
        {
          title: "JSON",
          body: `\`\`\`python
import json
data = {"name": "Asha", "marks": [91, 84], "active": True, "phone": None}
text = json.dumps(data, indent=2)      # Python → JSON text
back = json.loads(text)                # JSON text → Python
json.dump(data, f)  /  json.load(f)    # straight to/from a file
\`\`\`

| JSON | Python |
| --- | --- |
| object \`{}\` | dict |
| array \`[]\` | list |
| string, number | str, int/float |
| true/false/null | True/False/None |

JSON keys are always strings, and tuples become lists. Never use \`eval\` on JSON — use \`json.loads\`.`,
        },
        {
          title: "Which format?",
          body: `- **CSV**: flat tables, same columns in every row, opened in Excel/Sheets.
- **JSON**: nested data (lists inside objects), APIs, configuration.`,
        },
      ],
      example: {
        title: "From CSV to a JSON summary",
        code: r`import csv, json
with open("marks.csv", newline="", encoding="utf-8") as f:
    rows = list(csv.DictReader(f))
print(rows[0])
summary = {}
for row in rows:
    summary.setdefault(row["class"], []).append(int(row["mark"]))
averages = {cls: round(sum(m) / len(m), 1) for cls, m in summary.items()}
with open("summary.json", "w", encoding="utf-8") as f:
    json.dump(averages, f, indent=2)
print(open("summary.json", encoding="utf-8").read())
print(json.loads('{"ok": true, "n": null}'))`,
        files: [{ name: "marks.csv", content: "name,class,mark\n\"Rao, Asha\",11-B,91\nRavi,11-B,78\nZoe,12-A,85\n" }],
        output: "{'name': 'Rao, Asha', 'class': '11-B', 'mark': '91'}\n{\n  \"11-B\": 84.5,\n  \"12-A\": 85.0\n}\n{'ok': True, 'n': None}\n",
        lines: [
          [3, "DictReader turns each row into a dict using the header line as keys."],
          [4, "The quoted name keeps its comma; note the mark is still a string."],
          [6, "Group marks by class, converting to int."],
          [8, "Average per class."],
          [10, "Write the dict as nicely indented JSON."],
          [12, "JSON true/null become Python True/None."],
        ],
      },
      mistakes: [
        { title: "Forgetting values are strings", body: "`row[\"mark\"] > 50` compares a str with an int (TypeError). Convert with int()/float()." },
        { title: "Blank lines in CSV on Windows", body: "Opening CSV for writing without `newline=\"\"` doubles line endings on Windows." },
        { title: "Single quotes in JSON", body: "JSON requires double quotes: `{'a': 1}` isn't valid JSON (json.loads raises JSONDecodeError)." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`import json
s = json.dumps({"t": (1, 2), "ok": False, 3: "x"})
print(s)
print(json.loads(s)["t"], type(json.loads(s)["t"]).__name__)`,
          answer: "{\"t\": [1, 2], \"ok\": false, \"3\": \"x\"}\n[1, 2] list\n",
          hint: "JSON has no tuples, and keys must be strings.",
          explain: "The tuple becomes a JSON array (a list when loaded back), False becomes false, and the int key 3 becomes the string \"3\".",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Turn JSON text into a Python dict.",
          code: r`import json
data = json.___('{"city": "Pune", "pin": 411001}')
print(data["pin"] + 1)`,
          blanks: [["loads"]],
          output: "411002\n",
          hint: "load from a String.",
          explain: "`json.loads` parses a JSON string; `json.load` reads from a file.",
        },
        {
          id: "b1", kind: "bug", difficulty: 2,
          prompt: "This should print the total of the marks (169) but crashes. Which line?",
          code: r`import csv, io
f = io.StringIO("name,mark\nA,91\nB,78\n")
total = 0
for row in csv.DictReader(f):
    total += row["mark"]
print(total)`,
          line: 5,
          fix: r`import csv, io
f = io.StringIO("name,mark\nA,91\nB,78\n")
total = 0
for row in csv.DictReader(f):
    total += int(row["mark"])
print(total)`,
          output: "169\n",
          hint: "What type are CSV values?",
          explain: "CSV values are strings; adding a str to an int fails. Convert with int(). (io.StringIO is an in-memory file.)",
        },
        {
          id: "m1", kind: "mcq", difficulty: 2,
          prompt: "Which data fits JSON better than CSV?",
          options: [
            { text: "A table of 1,000 students with name and mark", why: "Flat and tabular — CSV is natural." },
            { text: "A user profile with a list of addresses, each with several fields", why: "Correct — nested structure." },
            { text: "Daily temperature readings", why: "A simple table." },
          ],
          answer: 1,
          hint: "Nested or flat?",
          explain: "JSON represents nesting (lists of objects inside objects); CSV is one flat table.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "CSV marks report", difficulty: 2,
          prompt: `Read \`marks.csv\` (columns \`name,subject,mark\`). Print each student's total in alphabetical order, then the top student:

\`\`\`
Asha 172
Ravi 140
top: Asha
\`\`\``,
          starter: r`import csv
`,
          files: [{ name: "marks.csv", content: "name,subject,mark\nRavi,maths,62\nAsha,maths,88\nRavi,science,78\nAsha,science,84\n" }],
          tests: [{ label: "Two students", input: "", output: "Asha 172\nRavi 140\ntop: Asha" }],
          hints: [
            "Use csv.DictReader with `newline=\"\"`.",
            "Accumulate totals in a dict: `totals[name] = totals.get(name, 0) + int(row[\"mark\"])`.",
            "Print sorted by name.",
            "`max(totals, key=totals.get)` is the top student.",
          ],
          solution: r`import csv

totals = {}
with open("marks.csv", newline="", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        totals[row["name"]] = totals.get(row["name"], 0) + int(row["mark"])
for name in sorted(totals):
    print(name, totals[name])
print("top:", max(totals, key=totals.get))`,
          notes: "DictReader + a frequency-map-style accumulator is the bread and butter of CSV processing.",
        },
        {
          id: "stretch", kind: "task", title: "Settings file round trip", difficulty: 3,
          prompt: `Load \`settings.json\`, apply changes read from input lines \`key=value\` until \`end\` (values: \`true\`/\`false\` → bool, digits → int, otherwise text), save it back with \`indent=2\` and \`sort_keys=True\`, and print the saved file.`,
          starter: r`import json
`,
          files: [{ name: "settings.json", content: "{\"theme\": \"light\", \"font_size\": 14, \"autosave\": false}\n" }],
          tests: [
            { label: "Two changes", input: "theme=dark\nautosave=true\nend\n", output: "{\n  \"autosave\": true,\n  \"font_size\": 14,\n  \"theme\": \"dark\"\n}" },
            { label: "New key", input: "font_size=16\nlang=hi\nend\n", output: "{\n  \"autosave\": false,\n  \"font_size\": 16,\n  \"lang\": \"hi\",\n  \"theme\": \"light\"\n}", hidden: true },
          ],
          hints: [
            "`json.load(f)` gives a dict.",
            "Split each change at the first `=`: `key, value = line.split(\"=\", 1)`.",
            "Convert: \"true\"/\"false\" → bool, `value.isdigit()` → int.",
            "Write with `json.dump(settings, f, indent=2, sort_keys=True)` and print the file's text.",
          ],
          solution: r`import json

with open("settings.json", encoding="utf-8") as f:
    settings = json.load(f)
while True:
    line = input()
    if line == "end":
        break
    key, value = line.split("=", 1)
    if value in ("true", "false"):
        settings[key] = value == "true"
    elif value.isdigit():
        settings[key] = int(value)
    else:
        settings[key] = value
with open("settings.json", "w", encoding="utf-8") as f:
    json.dump(settings, f, indent=2, sort_keys=True)
with open("settings.json", encoding="utf-8") as f:
    print(f.read())`,
          notes: "Load → modify → save is how every app persists its settings. sort_keys makes the file stable and diff-friendly.",
        },
      ],
      realWorld: "Bank statements, school results and sales exports are CSV; every web API speaks JSON; VS Code, npm and many apps store settings in JSON. Data engineers spend much of their time converting between the two.",
      reteach: "CSV is a spreadsheet saved as text: rows separated by newlines, cells by commas (with quotes when a cell contains a comma). JSON is Python-ish data written down in a universal way: dicts become `{}`, lists `[]`, None `null`. The csv and json modules are careful translators — use them instead of translating by hand.",
      summary: [
        "csv.reader/DictReader/DictWriter; open with `newline=\"\"`; values are strings.",
        "json.dumps/loads (strings) and dump/load (files); JSON keys are strings, tuples become lists.",
        "CSV for flat tables, JSON for nested data and APIs.",
      ],
    },

    {
      id: "py-binary-encodings-errors",
      title: "Binary files, encodings and file errors",
      minutes: 16,
      difficulty: 3,
      objectives: [
        "Read and write bytes in binary mode",
        "Explain encodings and handle UnicodeDecodeError",
        "Catch FileNotFoundError and other file exceptions gracefully",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "What does `open(\"img.png\", \"rb\").read()` return?",
        options: [
          { text: "A str", why: "Binary mode returns bytes." },
          { text: "A bytes object", why: "Correct." },
          { text: "A list of lines", why: "read() returns one object." },
        ],
        answer: 1,
        hint: "b = binary.",
        explain: "Binary mode reads raw bytes; text mode decodes them into str using an encoding.",
      },
      why: "Not everything is text: images, PDFs, audio and zip files are bytes. And text files written on other machines may use other encodings. Robust programs handle both — and handle missing files without crashing.",
      concept: [
        {
          title: "Text vs bytes",
          body: `\`\`\`python
s = "₹100"                 # str: Unicode characters
b = s.encode("utf-8")      # bytes: b'\\xe2\\x82\\xb9100'
b.decode("utf-8")          # back to '₹100'
len(s), len(b)             # 4 characters, 6 bytes
\`\`\`

Binary mode (\`"rb"\`, \`"wb"\`) reads/writes \`bytes\` with no decoding. Use it to copy files exactly or to inspect file signatures (a PNG starts with \`b'\\x89PNG'\`).`,
        },
        {
          title: "Encodings",
          body: `Text mode decodes bytes with an encoding. If the file was saved in a different encoding, you get garbage (mojibake) or \`UnicodeDecodeError\`. Fixes:

- Use the right one: \`open(p, encoding="utf-8")\` (or \`"cp1252"\`, \`"utf-16"\` …).
- \`errors="replace"\` turns undecodable bytes into \`�\` instead of crashing.
- A UTF-8 file with a BOM: \`encoding="utf-8-sig"\`.`,
        },
        {
          title: "File exceptions",
          body: `\`\`\`python
try:
    with open("config.txt", encoding="utf-8") as f:
        text = f.read()
except FileNotFoundError:
    text = ""                     # sensible default
except PermissionError:
    print("Not allowed to read config.txt")
\`\`\`

Others: \`IsADirectoryError\`, \`FileExistsError\` (mode "x"), \`UnicodeDecodeError\`. They're all subclasses of \`OSError\` (except the Unicode one). Module 16 covers try/except fully.`,
        },
      ],
      example: {
        title: "Bytes, encodings and a missing file",
        code: r`data = bytes([72, 105, 33])
with open("raw.bin", "wb") as f:
    f.write(data)
with open("raw.bin", "rb") as f:
    print(f.read(), list(open("raw.bin", "rb").read()))
word = "naïve ₹"
encoded = word.encode("utf-8")
print(len(word), len(encoded), encoded.decode("utf-8"))
print(encoded.decode("ascii", errors="replace"))
try:
    open("missing.txt", encoding="utf-8")
except FileNotFoundError as e:
    print("No file:", e.filename)`,
        output: "b'Hi!' [72, 105, 33]\n7 10 naïve ₹\nna��ve ���\nNo file: missing.txt\n",
        lines: [
          [1, "bytes are numbers 0–255; 72, 105, 33 are the ASCII codes of 'H', 'i', '!'."],
          [2, "Binary write mode takes bytes, not str."],
          [5, "Reading in binary gives bytes back; list() shows the numbers."],
          [8, "ï and ₹ need several bytes each in UTF-8: 7 characters, 10 bytes."],
          [9, "Decoding with the wrong encoding: errors=\"replace\" marks bad bytes with �."],
          [12, "A missing file is an exception you can catch and handle."],
        ],
      },
      mistakes: [
        { title: "Writing str in binary mode", body: "`open(p, \"wb\").write(\"hi\")` is a TypeError — encode first or use text mode." },
        { title: "Relying on the default encoding", body: "Without `encoding=`, Windows may use cp1252 and corrupt non-English text. Always say utf-8." },
        { title: "Catching every exception", body: "`except Exception:` around file code hides real bugs. Catch the specific errors you can handle." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`b = "héllo".encode("utf-8")
print(len(b), b[:3], b.decode("latin-1"))`,
          answer: "6 b'h\\xc3\\xa9' hÃ©llo\n",
          hint: "é takes two bytes in UTF-8; latin-1 decodes each byte separately.",
          explain: "é is encoded as the two bytes C3 A9, so 6 bytes. Decoding those bytes as latin-1 shows each byte as its own character: Ã©.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Fall back to an empty string when the file doesn't exist.",
          code: r`try:
    text = open("nope.txt", encoding="utf-8").read()
except ___:
    text = ""
print(repr(text))`,
          blanks: [["FileNotFoundError", "OSError"]],
          output: "''\n",
          hint: "The specific exception for a missing file.",
          explain: "`FileNotFoundError` (a subclass of OSError) is raised when the file doesn't exist.",
        },
        {
          id: "b1", kind: "bug", difficulty: 2,
          prompt: "This should copy the file exactly but crashes. Which line?",
          code: r`with open("a.bin", "wb") as f:
    f.write(bytes([0, 255, 10]))
data = open("a.bin", "rb").read()
with open("copy.bin", "w") as f:
    f.write(data)
print(open("copy.bin", "rb").read() == data)`,
          line: 4,
          fix: r`with open("a.bin", "wb") as f:
    f.write(bytes([0, 255, 10]))
data = open("a.bin", "rb").read()
with open("copy.bin", "wb") as f:
    f.write(data)
print(open("copy.bin", "rb").read() == data)`,
          output: "True\n",
          hint: "What mode accepts bytes?",
          explain: "Text mode (\"w\") needs str; writing bytes requires \"wb\".",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "A CSV from an old Windows program shows `Ã©` instead of `é`. Most likely…",
          options: [
            { text: "The file is corrupt", why: "Usually not — it's an encoding mix-up." },
            { text: "UTF-8 bytes were decoded with a single-byte encoding like cp1252/latin-1 (or vice versa)", why: "Correct." },
            { text: "Python can't display é", why: "It can, with the right encoding." },
          ],
          answer: 1,
          hint: "Two bytes shown as two characters.",
          explain: "Mojibake like Ã© is the classic sign of UTF-8 bytes read with the wrong encoding; reopen with the correct encoding.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Safe config reader", difficulty: 2,
          prompt: `Read a file name from input. Print the number of non-empty lines in that file, or \`missing: NAME\` if it doesn't exist. (\`app.cfg\` exists next to your program.)`,
          starter: r`name = input()
`,
          files: [{ name: "app.cfg", content: "host=localhost\n\nport=8080\n# comment\n" }],
          tests: [
            { label: "Existing file", input: "app.cfg\n", output: "3" },
            { label: "Missing file", input: "other.cfg\n", output: "missing: other.cfg", category: "edge" },
          ],
          hints: [
            "Wrap the open in try/except.",
            "`except FileNotFoundError:` prints the missing message.",
            "Count lines where `line.strip()` is non-empty.",
            "`sum(1 for line in f if line.strip())`.",
          ],
          solution: r`name = input()
try:
    with open(name, encoding="utf-8") as f:
        print(sum(1 for line in f if line.strip()))
except FileNotFoundError:
    print("missing:", name)`,
          notes: "Handling the expected failure (a missing file) makes the program friendly; unexpected errors still surface.",
        },
        {
          id: "stretch", kind: "task", title: "Detect file types by signature", difficulty: 4,
          prompt: `Files \`a.dat\`, \`b.dat\` and \`c.dat\` have no meaningful extension. Read each in **binary** mode and identify it by its first bytes: PNG starts with \`b"\\x89PNG"\`, PDF with \`b"%PDF"\`, ZIP with \`b"PK\\x03\\x04"\`; otherwise \`unknown\`. Print \`name: type (N bytes)\` in name order.`,
          starter: r`from pathlib import Path
`,
          files: [
            { name: "a.dat", content: "%PDF-1.7 fake pdf" },
            { name: "b.dat", content: "PK\u0003\u0004fake zip" },
            { name: "c.dat", content: "just text" },
          ],
          tests: [{ label: "Three files", input: "", output: "a.dat: pdf (17 bytes)\nb.dat: zip (12 bytes)\nc.dat: unknown (9 bytes)" }],
          hints: [
            "`p.read_bytes()` gives the whole file as bytes.",
            "bytes have `.startswith(b\"...\")` too.",
            "Keep a list of (signature, type) pairs and check each.",
            "Loop over `sorted(Path(\".\").glob(\"*.dat\"))`.",
          ],
          solution: r`from pathlib import Path

SIGNATURES = [(b"\x89PNG", "png"), (b"%PDF", "pdf"), (b"PK\x03\x04", "zip")]
for p in sorted(Path(".").glob("*.dat")):
    data = p.read_bytes()
    kind = next((t for sig, t in SIGNATURES if data.startswith(sig)), "unknown")
    print(f"{p.name}: {kind} ({len(data)} bytes)")`,
          notes: "File extensions can lie; 'magic numbers' at the start of a file are how tools like `file` and upload validators decide what a file really is (part of secure file handling, Module 33).",
        },
      ],
      realWorld: "Image uploads, PDF generation, backups and network protocols work with bytes; data imported from older systems often needs the right encoding; every robust CLI tool handles missing files with a clear message instead of a traceback.",
      reteach: "Bytes are the raw numbers on disk; text is what those numbers mean once you know the 'alphabet' (the encoding). Read with the wrong alphabet and the words come out scrambled. Binary mode skips the alphabet entirely and gives you the raw numbers — exactly right for images and copies.",
      summary: [
        "Binary mode reads/writes bytes; text mode decodes with an encoding (say utf-8).",
        "str.encode() → bytes, bytes.decode() → str; wrong encodings cause mojibake or UnicodeDecodeError.",
        "Catch specific file errors (FileNotFoundError, PermissionError) and give clear messages.",
      ],
    },
  ],
  exam: [
    {
      id: "e1", kind: "predict", difficulty: 3,
      code: r`from pathlib import Path
p = Path("out.txt")
p.write_text("one\ntwo\n")
with p.open("a") as f:
    f.write("three\n")
lines = p.read_text().splitlines()
print(len(lines), lines[-1], p.suffix)`,
      answer: "3 three .txt\n",
      hint: "Append adds a third line.",
      explain: "write_text creates two lines, append adds \"three\"; the suffix is .txt.",
    },
    {
      id: "e2", kind: "mcq", difficulty: 2,
      prompt: "Which mode creates a file but fails if it already exists?",
      options: [
        { text: "\"w\"", why: "w overwrites." },
        { text: "\"a\"", why: "a appends." },
        { text: "\"x\"", why: "Correct — raises FileExistsError if it exists." },
      ],
      answer: 2,
      hint: "eXclusive.",
      explain: "Mode \"x\" is exclusive creation.",
    },
    {
      id: "e3", kind: "fill", difficulty: 2,
      prompt: "Write a dict to a JSON file with indentation.",
      code: r`import json
with open("d.json", "w") as f:
    json.___({"a": 1}, f, indent=2)
print(open("d.json").read())`,
      blanks: [["dump"]],
      output: "{\n  \"a\": 1\n}\n",
      hint: "The file version (not the string version).",
      explain: "`json.dump(obj, file)` writes to a file; `dumps` returns a string.",
    },
    {
      id: "e4", kind: "bug", difficulty: 3,
      prompt: "The CSV value should be compared numerically (prints `pass`). Which line?",
      code: r`import csv, io
row = next(csv.DictReader(io.StringIO("mark\n45\n")))
if row["mark"] >= "100":
    print("perfect")
else:
    print("pass")`,
      line: 3,
      fix: r`import csv, io
row = next(csv.DictReader(io.StringIO("mark\n45\n")))
if int(row["mark"]) >= 100:
    print("perfect")
else:
    print("pass")`,
      output: "pass\n",
      hint: "Comparing strings compares them alphabetically.",
      explain: "\"45\" >= \"100\" is True alphabetically ('4' > '1'). Convert to int before comparing numbers.",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: expense log with CSV and JSON", difficulty: 3,
    prompt: `\`expenses.csv\` (columns \`date,category,amount\`) is next to your program. Read commands until \`end\`:

- \`add DATE CATEGORY AMOUNT\` — append a row to the CSV,
- \`summary\` — print each category alphabetically with its total (\`category: total\`), then \`total: N\`,
- \`export\` — write \`summary.json\` (\`{"by_category": {...}, "total": N}\`, keys sorted, indent 2) and print \`exported\`.

After \`end\`, print the number of rows now in the CSV (excluding the header).`,
    starter: r`import csv, json
`,
    files: [{ name: "expenses.csv", content: "date,category,amount\n2026-10-01,food,120\n2026-10-02,travel,60\n2026-10-03,food,80\n" }],
    tests: [
      { label: "Session", input: "summary\nadd 2026-10-04 books 250\nsummary\nexport\nend\n", output: "food: 200\ntravel: 60\ntotal: 260\nbooks: 250\nfood: 200\ntravel: 60\ntotal: 510\nexported\nrows: 4" },
      { label: "Only adds", input: "add 2026-10-05 food 10\nadd 2026-10-06 fun 5\nend\n", output: "rows: 5", hidden: true },
    ],
    hints: [
      "Write a helper that reads the CSV and returns {category: total}.",
      "add: open in append mode with `newline=\"\"` and `csv.writer(f).writerow([...])`.",
      "export: `json.dump({\"by_category\": totals, \"total\": sum(totals.values())}, f, indent=2, sort_keys=True)`.",
      "Count rows at the end with `len(list(csv.DictReader(f)))`.",
    ],
    solution: r`import csv, json

def totals():
    by_cat = {}
    with open("expenses.csv", newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            by_cat[row["category"]] = by_cat.get(row["category"], 0) + int(row["amount"])
    return by_cat

while True:
    parts = input().split()
    if parts == ["end"]:
        break
    if parts[0] == "add":
        _, date, category, amount = parts
        with open("expenses.csv", "a", newline="", encoding="utf-8") as f:
            csv.writer(f).writerow([date, category, amount])
    elif parts[0] == "summary":
        t = totals()
        for cat in sorted(t):
            print(f"{cat}: {t[cat]}")
        print("total:", sum(t.values()))
    elif parts[0] == "export":
        t = totals()
        with open("summary.json", "w", encoding="utf-8") as f:
            json.dump({"by_category": t, "total": sum(t.values())}, f, indent=2, sort_keys=True)
        print("exported")
with open("expenses.csv", newline="", encoding="utf-8") as f:
    print("rows:", len(list(csv.DictReader(f))))`,
    notes: "The CSV file is the single source of truth: summaries are always recomputed from it, so they can never drift out of date.",
  },
};
