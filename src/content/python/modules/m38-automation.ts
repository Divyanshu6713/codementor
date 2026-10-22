import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 38 — Automation and scripting (specialist path). */
export const M38: PyModuleDef = {
  id: "py-automation",
  number: 38,
  level: 5,
  title: "Automation and Scripting",
  summary: "Automating file and folder tasks safely (dry runs, logging, idempotence); renaming, organising and archiving; reports from data; composing emails; scraping HTML responsibly (robots.txt, rate limits, terms); scheduling scripts.",
  track: "specialist",
  optionalNote: "For anyone who repeats computer chores — office work, research, IT admin. The sandbox lets you work with files in your own scratch folder; it can't reach websites or send email, so those parts use saved pages and build messages without sending them.",
  prereqs: ["py-security"],
  lessons: [
    {
      id: "py-automation-files",
      title: "Automating files safely",
      minutes: 17,
      difficulty: 3,
      objectives: [
        "Find files with pathlib and glob patterns",
        "Plan changes as a dry run before applying them",
        "Make scripts idempotent, logged and reversible where possible",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "Your script will rename 2,000 photos. What should it do first?",
        options: [
          { text: "Rename them all immediately", why: "One bug could scramble every file." },
          { text: "Print the planned renames (a dry run) and check for clashes", why: "Correct." },
          { text: "Delete the old names", why: "Renaming doesn't need deleting — and deletion is irreversible." },
        ],
        answer: 1,
        hint: "Look before you leap.",
        explain: "A dry run shows exactly what would change, so mistakes are caught before they touch real files.",
      },
      why: "A 30-line script can save hours every week: sorting downloads, renaming scans, archiving old reports. But scripts act fast and at scale — a mistake can wreck thousands of files in a second. Safe automation habits matter as much as the code.",
      concept: [
        {
          title: "Finding files",
          body: `\`\`\`python
from pathlib import Path
folder = Path("downloads")
for p in folder.glob("*.pdf"): ...        # this folder only
for p in folder.rglob("*.jpg"): ...       # including sub-folders
p.name, p.stem, p.suffix, p.stat().st_size
\`\`\`

Sort results (\`sorted(...)\`) — the operating system doesn't guarantee an order.`,
        },
        {
          title: "Safe changes",
          body: `1. **Plan** every change as data (\`[(old, new), ...]\`).
2. **Check** the plan: name clashes, overwriting existing files, files outside the target folder.
3. **Dry run** by default (\`--apply\` to really do it).
4. **Apply** with \`Path.rename\`/\`shutil.move\`/\`shutil.copy2\`, logging each action.
5. Make it **idempotent**: running twice shouldn't break anything (skip files already done).
6. Prefer moving to an archive folder over deleting; back up first.`,
        },
        {
          title: "Scheduling",
          body: `Run scripts automatically with **cron** (Linux/macOS: \`0 9 * * 1 python report.py\` = 9:00 every Monday), **Windows Task Scheduler**, or a CI schedule (GitHub Actions \`on: schedule\`). Scheduled scripts must log to a file and report failures, because nobody is watching.`,
        },
      ],
      example: {
        title: "Organise files by type — dry run first",
        code: r`from pathlib import Path
import shutil

inbox = Path("inbox")
inbox.mkdir(exist_ok=True)
for name in ["report.PDF", "photo1.jpg", "notes.txt", "photo2.JPG", "budget.xlsx", "photo1.jpeg"]:
    (inbox / name).write_text("demo")
(inbox / "images").mkdir(exist_ok=True)
(inbox / "images" / "photo1.jpg").write_text("sorted last week")

GROUPS = {".pdf": "documents", ".txt": "documents", ".xlsx": "spreadsheets", ".jpg": "images", ".jpeg": "images"}

def plan(folder):
    moves, seen = [], set()
    for p in sorted(folder.iterdir()):
        if not p.is_file():
            continue
        target_dir = folder / GROUPS.get(p.suffix.lower(), "other")
        target = target_dir / p.name
        if target in seen or target.exists():
            target = target_dir / f"{p.stem}_dup{p.suffix}"
        seen.add(target)
        moves.append((p, target))
    return moves

moves = plan(inbox)
for src, dst in moves:
    print(f"DRY RUN  {src.name:<12} -> {dst.relative_to(inbox).as_posix()}")

for src, dst in moves:
    dst.parent.mkdir(exist_ok=True)
    shutil.move(src, dst)
print(sorted(p.relative_to(inbox).as_posix() for p in inbox.rglob("*") if p.is_file()))
print("second run plans", len(plan(inbox)), "moves")`,
        output: "DRY RUN  budget.xlsx  -> spreadsheets/budget.xlsx\nDRY RUN  notes.txt    -> documents/notes.txt\nDRY RUN  photo1.jpeg  -> images/photo1.jpeg\nDRY RUN  photo1.jpg   -> images/photo1_dup.jpg\nDRY RUN  photo2.JPG   -> images/photo2.JPG\nDRY RUN  report.PDF   -> documents/report.PDF\n['documents/notes.txt', 'documents/report.PDF', 'images/photo1.jpeg', 'images/photo1.jpg', 'images/photo1_dup.jpg', 'images/photo2.JPG', 'spreadsheets/budget.xlsx']\nsecond run plans 0 moves\n",
        lines: [
          [5, "Set up demo files in our own scratch folder (the sandbox only allows that)."],
          [8, "A file sorted last week is already in images/ — the plan must not overwrite it."],
          [11, "A mapping from extension to folder — easy to read and change."],
          [13, "plan() only decides; it changes nothing."],
          [15, "Sort for a predictable order."],
          [18, "Compare extensions in lowercase so .PDF and .pdf match."],
          [20, "Avoid overwriting: a clashing name gets a suffix."],
          [28, "The dry run shows every planned move."],
          [30, "Only now do we apply the plan."],
          [34, "Idempotent: files are already sorted into sub-folders, so a second run plans nothing."],
        ],
      },
      mistakes: [
        { title: "Overwriting files", body: "`rename`/`move` can replace an existing file silently on some systems. Check `target.exists()` first." },
        { title: "Following the wrong path", body: "A script run from a different folder acts on a different `Path(\"data\")`. Build paths from `Path(__file__).parent` or an explicit argument." },
        { title: "Deleting instead of archiving", body: "Deletion is permanent. Move to an archive or recycle folder and clean up later, after checking." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`from pathlib import Path
p = Path("reports/2026/March Sales.final.xlsx")
print(p.name, "|", p.stem, "|", p.suffix, "|", p.parent.name)`,
          answer: "March Sales.final.xlsx | March Sales.final | .xlsx | 2026\n",
          hint: "The suffix is only the last extension.",
          explain: "name is the full file name; stem drops the last suffix only ('March Sales.final'); parent is the '2026' folder.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Find every .txt file in the folder and its sub-folders.",
          code: r`from pathlib import Path
base = Path("notes")
(base / "week1").mkdir(parents=True, exist_ok=True)
(base / "a.txt").write_text("x")
(base / "week1" / "b.txt").write_text("y")
print(sorted(p.name for p in base.___("*.txt")))`,
          blanks: [["rglob"]],
          output: "['a.txt', 'b.txt']\n",
          hint: "Recursive glob.",
          explain: "`rglob` searches the folder and every sub-folder.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "The plan should keep both photos, but the second one overwrites the first because both get the same name. Which line forgets to check for clashes?",
          code: r`names = ["IMG_001.jpg", "img_001.JPG", "IMG_002.jpg"]
plan = {}
for n in names:
    new = n.lower()
    plan[new] = n
print(len(plan), sorted(plan))`,
          line: 5,
          fix: r`names = ["IMG_001.jpg", "img_001.JPG", "IMG_002.jpg"]
plan = {}
for n in names:
    new = n.lower()
    if new in plan:
        new = new.replace(".jpg", "_2.jpg")
    plan[new] = n
print(len(plan), sorted(plan))`,
          output: "3 ['img_001.jpg', 'img_001_2.jpg', 'img_002.jpg']\n",
          hint: "What if `new` is already taken?",
          explain: "Lowercasing turns two different names into one; without a clash check the second silently replaces the first.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 2,
          prompt: "What does 'idempotent' mean for an automation script?",
          options: [
            { text: "It runs very fast", why: "Not related." },
            { text: "Running it again doesn't change anything further or cause errors", why: "Correct." },
            { text: "It needs no input", why: "Not related." },
          ],
          answer: 1,
          hint: "Twice = once.",
          explain: "Idempotent scripts can be re-run safely after a crash or by a scheduler, because finished work is skipped.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Bulk-rename plan with clash detection", difficulty: 3,
          prompt: `Plan renames for scanned files to the pattern \`<prefix>_<NNN><ext>\` (NNN = 3-digit counter from 001, ext lowercased), in alphabetical order of the original names. Input: the prefix, then file names until \`end\`. Skip names that already match the pattern \`<prefix>_<3 digits>.<ext>\` (they're done — idempotence) and don't reuse their numbers. Print each planned rename \`old -> new\`, then \`planned N, skipped S\`.`,
          starter: r`import re
`,
          tests: [
            { label: "Scans", input: "receipt\nscan 3.PDF\nreceipt_002.pdf\nIMG_4421.JPG\nscan 1.pdf\nend\n", output: "IMG_4421.JPG -> receipt_001.jpg\nscan 1.pdf -> receipt_003.pdf\nscan 3.PDF -> receipt_004.pdf\nplanned 3, skipped 1" },
            { label: "All done", input: "doc\ndoc_001.pdf\nend\n", output: "planned 0, skipped 1", hidden: true, category: "edge" },
          ],
          hints: [
            "Pattern: `re.fullmatch(rf\"{re.escape(prefix)}_(\\d{{3}})\\.\\w+\", name)`.",
            "Collect numbers already used by done files into a set.",
            "For the others (sorted), take the next counter value not in the used set.",
            "Extension: `Path(name).suffix.lower()`.",
          ],
          solution: r`import re
from pathlib import Path

prefix = input()
names = []
while (line := input()) != "end":
    names.append(line)

done = re.compile(rf"{re.escape(prefix)}_(\d{{3}})\.\w+")
used = {int(m.group(1)) for n in names if (m := done.fullmatch(n))}
todo = sorted(n for n in names if not done.fullmatch(n))
counter = 1
for name in todo:
    while counter in used:
        counter += 1
    used.add(counter)
    print(f"{name} -> {prefix}_{counter:03d}{Path(name).suffix.lower()}")
print(f"planned {len(todo)}, skipped {len(names) - len(todo)}")`,
          notes: "Because done files are recognised and their numbers reserved, running the script after adding new scans continues the sequence instead of starting again.",
        },
        {
          id: "stretch", kind: "task", title: "Archive old reports", difficulty: 4,
          prompt: `Create the files described in the input inside a folder \`reports\` (lines \`name days_old\` until \`end\`; write the text \`report\` in each). Then archive every \`.csv\` or \`.txt\` file **older than 30 days** into \`reports/archive.zip\` (inside the zip, use just the file name), and remove the originals only **after** verifying the zip contains them (\`zipfile.ZipFile.namelist()\`). Use the days_old values (not real timestamps) to decide age. Print \`archived: …\` (sorted names, comma-separated, or \`none\`), \`kept: …\` (sorted remaining files in reports, excluding archive.zip), and \`zip ok: True\`.`,
          starter: r`import zipfile
from pathlib import Path
`,
          tests: [
            { label: "Reports", input: "jan.csv 70\nfeb.csv 40\nmar.csv 10\nnotes.txt 45\nlogo.png 90\nend\n", output: "archived: feb.csv, jan.csv, notes.txt\nkept: logo.png, mar.csv\nzip ok: True" },
          ],
          hints: [
            "Write files with `(folder / name).write_text(\"report\")` and remember ages in a dict.",
            "Select: suffix in {'.csv', '.txt'} and age > 30.",
            "`with zipfile.ZipFile(folder / \"archive.zip\", \"w\") as z: z.write(path, arcname=path.name)`.",
            "Re-open the zip to check namelist() before unlinking originals.",
          ],
          solution: r`import zipfile
from pathlib import Path

folder = Path("reports")
folder.mkdir(exist_ok=True)
ages = {}
while (line := input()) != "end":
    name, days = line.split()
    (folder / name).write_text("report")
    ages[name] = int(days)

old = sorted(n for n, d in ages.items() if Path(n).suffix in {".csv", ".txt"} and d > 30)
archive = folder / "archive.zip"
with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED) as z:
    for name in old:
        z.write(folder / name, arcname=name)
with zipfile.ZipFile(archive) as z:
    ok = sorted(z.namelist()) == old and z.testzip() is None
if ok:
    for name in old:
        (folder / name).unlink()
print("archived:", ", ".join(old) or "none")
print("kept:", ", ".join(sorted(p.name for p in folder.iterdir() if p.name != "archive.zip")))
print("zip ok:", ok)`,
          notes: "Verify, then delete — never the other way round. On a real system you'd use file modification times (`p.stat().st_mtime`) instead of the given ages, and keep a log of what was archived.",
        },
      ],
      realWorld: "Accountants auto-file invoices into month folders; labs rename instrument output; IT teams rotate and compress logs nightly with scheduled scripts.",
      reteach: "Automating files is like hiring a very fast, very literal assistant. First ask them to write down what they plan to do (dry run) and read the list. Tell them never to put two things in the same drawer (clash check), never to throw anything away without photocopying it first (verify before delete), and to skip work that's already done (idempotence).",
      summary: [
        "pathlib: glob/rglob, name/stem/suffix; sort results for a stable order.",
        "Plan → check → dry run → apply → log; avoid overwrites; archive instead of deleting.",
        "Make scripts idempotent and schedule them with cron/Task Scheduler/CI, logging failures.",
      ],
      libraryCode: [{
        title: "A command-line organiser with --apply",
        code: `import argparse, logging, shutil
from pathlib import Path

parser = argparse.ArgumentParser(description="Sort files into folders by type")
parser.add_argument("folder", type=Path)
parser.add_argument("--apply", action="store_true", help="really move files (default: dry run)")
args = parser.parse_args()
logging.basicConfig(filename="organise.log", level=logging.INFO, format="%(asctime)s %(message)s")
for src, dst in plan(args.folder):          # plan() from the lesson
    if args.apply:
        dst.parent.mkdir(exist_ok=True)
        shutil.move(src, dst)
        logging.info("moved %s -> %s", src, dst)
    else:
        print("would move", src, "->", dst)`,
        note: "Run on your own computer: `python organise.py Downloads` to preview, then `python organise.py Downloads --apply`. Try it on a copy of a folder first.",
      }],
    },

    {
      id: "py-automation-web-reports",
      title: "Scraping responsibly and automating reports",
      minutes: 18,
      difficulty: 4,
      objectives: [
        "Extract data from HTML with a parser",
        "Respect robots.txt, rate limits and terms of use",
        "Generate reports and compose emails programmatically",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "Before scraping a website, what should you check first?",
        options: [
          { text: "Whether it has an official API, its terms of use and robots.txt", why: "Correct." },
          { text: "How fast your internet connection is", why: "Not the first concern." },
          { text: "Nothing — public pages are free to copy", why: "Terms, copyright, privacy law and server load all matter." },
        ],
        answer: 0,
        hint: "Permission and politeness.",
        explain: "Prefer an official API; respect robots.txt and terms; avoid personal data; go slowly so you don't overload the site.",
      },
      why: "Many chores involve collecting numbers from web pages, turning them into a summary and emailing it to someone. Python can do the whole chain — as long as it does it politely, legally and robustly.",
      concept: [
        {
          title: "Parsing HTML",
          body: `Never pick data out of HTML with string searches or regex — use a parser. The standard library has \`html.parser.HTMLParser\` (event-based: \`handle_starttag\`, \`handle_data\`, \`handle_endtag\`); **BeautifulSoup** and **lxml** are friendlier on your own computer:

\`\`\`python
soup = BeautifulSoup(html, "html.parser")
for row in soup.select("table.prices tr")[1:]:
    name, price = [td.get_text(strip=True) for td in row.find_all("td")]
\`\`\``,
        },
        {
          title: "Scraping responsibly",
          body: `- Use an **official API** if there is one.
- Read **robots.txt** (\`urllib.robotparser\`) and the **terms of use**; identify your bot with a User-Agent.
- **Rate-limit** (e.g. one request per second), cache pages, and stop on errors.
- Don't collect **personal data** without a lawful reason (India's DPDP Act, GDPR).
- Pages change: validate what you extract and fail loudly when the layout changes.`,
        },
        {
          title: "Reports and email",
          body: `Build reports as CSV (\`csv.writer\`), text or HTML. Compose email with \`email.message.EmailMessage\` (subject, to, plain-text body, attachments) and send with \`smtplib\` using credentials from environment variables — or a transactional email service's API. Always test with your own address first.`,
        },
      ],
      example: {
        title: "Parse a saved page, check robots.txt, build an email",
        code: r`from email.message import EmailMessage
from html.parser import HTMLParser
from urllib.robotparser import RobotFileParser

PAGE = """<html><body><h1>Mandi prices</h1>
<table class="prices"><tr><th>Crop</th><th>Price (₹/quintal)</th></tr>
<tr><td>Wheat</td><td>2,275</td></tr><tr><td>Onion</td><td> 1,850 </td></tr>
<tr><td>Tomato</td><td>n/a</td></tr></table></body></html>"""

class TableParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.rows, self.row, self.in_cell = [], None, False
    def handle_starttag(self, tag, attrs):
        if tag == "tr":
            self.row = []
        elif tag in ("td", "th"):
            self.in_cell = True
            self.row.append("")
    def handle_endtag(self, tag):
        if tag in ("td", "th"):
            self.in_cell = False
        elif tag == "tr":
            self.rows.append([c.strip() for c in self.row])
    def handle_data(self, data):
        if self.in_cell:
            self.row[-1] += data

parser = TableParser()
parser.feed(PAGE)
prices, problems = {}, []
for crop, price in parser.rows[1:]:
    try:
        prices[crop] = int(price.replace(",", ""))
    except ValueError:
        problems.append(crop)
print(prices, "unparsed:", problems)

robots = RobotFileParser()
robots.parse(["User-agent: *", "Disallow: /admin/", "Crawl-delay: 2"])
print(robots.can_fetch("price-bot", "https://example.org/mandi/prices"), robots.can_fetch("price-bot", "https://example.org/admin/x"), robots.crawl_delay("price-bot"))

msg = EmailMessage()
msg["Subject"] = "Daily mandi prices"
msg["From"], msg["To"] = "bot@example.org", "farmer@example.org"
msg.set_content("\n".join(f"{c}: ₹{p:,}" for c, p in prices.items()))
print(msg["Subject"], "|", msg.get_content().strip().replace("\n", " / "))`,
        output: "{'Wheat': 2275, 'Onion': 1850} unparsed: ['Tomato']\nTrue False 2\nDaily mandi prices | Wheat: ₹2,275 / Onion: ₹1,850\n",
        lines: [
          [5, "A saved copy of a page — the sandbox has no internet, and saved pages make tests repeatable."],
          [14, "HTMLParser calls our methods as it reads tags and text."],
          [19, "Start a new cell for every td/th."],
          [27, "Text can arrive in pieces, so we append."],
          [36, "Validate as you extract: 'n/a' is reported, not silently turned into 0."],
          [40, "robots.txt rules, parsed from lines here (read() would download them)."],
          [41, "Allowed path, disallowed path, and the requested delay between requests."],
          [43, "An email is built as an object — sending is a separate, deliberate step (smtplib)."],
        ],
      },
      mistakes: [
        { title: "Regex on HTML", body: "HTML nests and varies; regexes break on the first unexpected attribute. Use a parser." },
        { title: "Hammering a server", body: "Hundreds of requests per second can take a small site down and get you blocked. Add delays and caching." },
        { title: "Silent layout changes", body: "When a site redesigns, a scraper may return empty or wrong data. Check counts and formats and alert on anomalies." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`from html.parser import HTMLParser
class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
    def handle_starttag(self, tag, attrs):
        if tag == "a":
            self.links.append(dict(attrs).get("href"))
p = Links()
p.feed('<p><a href="/a">A</a> <A HREF="/b">B</A> <a>no link</a></p>')
print(p.links)`,
          answer: "['/a', '/b', None]\n",
          hint: "HTMLParser lowercases tag and attribute names.",
          explain: "Both <a> and <A HREF> are found (names are lowercased); the third has no href, so get returns None.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Check whether the bot may fetch a URL.",
          code: r`from urllib.robotparser import RobotFileParser
rp = RobotFileParser()
rp.parse(["User-agent: *", "Disallow: /private/"])
print(rp.___("my-bot", "https://site.example/private/data"))`,
          blanks: [["can_fetch"]],
          output: "False\n",
          hint: "Can it fetch?",
          explain: "`can_fetch(agent, url)` applies the robots.txt rules — here the path is disallowed, so False.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "The total should be 4125, but the prices contain thousands separators and the sum crashes. Which line should clean the text before converting?",
          code: r`cells = ["2,275", " 1,850 "]
total = 0
for text in cells:
    total += int(text.strip())
print(total)`,
          line: 4,
          fix: r`cells = ["2,275", " 1,850 "]
total = 0
for text in cells:
    total += int(text.strip().replace(",", ""))
print(total)`,
          output: "4125\n",
          hint: "int('2,275') fails.",
          explain: "Scraped numbers carry formatting (commas, spaces, currency symbols); strip it before converting.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "Where should the SMTP password for your report-emailing script live?",
          options: [
            { text: "In the script, so it's easy to find", why: "It'll end up in git and backups." },
            { text: "In an environment variable or the OS keyring, read at runtime", why: "Correct." },
            { text: "In the email subject", why: "Definitely not." },
          ],
          answer: 1,
          hint: "Secrets out of code.",
          explain: "Read credentials from the environment (or a keyring/secret manager); use app-specific passwords where available.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Scrape a saved product page", difficulty: 3,
          prompt: `A saved page (HTML, lines until \`END\`) lists products as \`<div class="product"><h2>Name</h2><span class="price">₹1,299</span></div>\` (attributes may appear in any order, and some products have no price). Use HTMLParser to extract each product's name and price (as an int, without ₹ and commas). Print \`name: price\` or \`name: price missing\`, then \`products N, priced P, average A\` (A as an integer, floor division).`,
          starter: r`from html.parser import HTMLParser
`,
          tests: [
            { label: "Shop", input: "<html><body>\n<div class=\"product\"><h2>Steel bottle</h2><span class=\"price\">₹499</span></div>\n<div id=\"p2\" class=\"product\"><h2>Lunch box</h2><span data-x=\"1\" class=\"price\"> ₹1,299 </span></div>\n<div class=\"product\"><h2>Mystery item</h2></div>\n</body></html>\nEND\n", output: "Steel bottle: 499\nLunch box: 1299\nMystery item: price missing\nproducts 3, priced 2, average 899" },
          ],
          hints: [
            "Track which element you're inside: set a flag on starttag h2 / span with class 'price'.",
            "`dict(attrs).get(\"class\")` reads the class whatever the attribute order.",
            "Start a new product dict when a div with class 'product' begins.",
            "Clean prices with `.strip().lstrip(\"₹\").replace(\",\", \"\")`.",
          ],
          solution: r`from html.parser import HTMLParser

class Products(HTMLParser):
    def __init__(self):
        super().__init__()
        self.items, self.field = [], None
    def handle_starttag(self, tag, attrs):
        cls = dict(attrs).get("class")
        if tag == "div" and cls == "product":
            self.items.append({"name": "", "price": None})
        elif tag == "h2" and self.items:
            self.field = "name"
        elif tag == "span" and cls == "price" and self.items:
            self.field = "price"
    def handle_endtag(self, tag):
        if tag in ("h2", "span"):
            self.field = None
    def handle_data(self, data):
        if self.field == "name":
            self.items[-1]["name"] += data
        elif self.field == "price":
            self.items[-1]["price"] = int(data.strip().lstrip("₹").replace(",", ""))

lines = []
while (line := input()) != "END":
    lines.append(line)
p = Products()
p.feed("\n".join(lines))
priced = [i["price"] for i in p.items if i["price"] is not None]
for item in p.items:
    print(f"{item['name']}: {item['price'] if item['price'] is not None else 'price missing'}")
print(f"products {len(p.items)}, priced {len(priced)}, average {sum(priced) // len(priced) if priced else 0}")`,
          notes: "Reporting 'price missing' instead of skipping silently makes layout changes visible. With BeautifulSoup this would be `soup.select(\"div.product\")` and `.select_one(\"span.price\")`.",
        },
        {
          id: "stretch", kind: "task", title: "Polite crawl plan", difficulty: 4,
          prompt: `Plan a crawl without fetching anything. Input: robots.txt lines until \`---\`, then URLs until \`end\`. Using RobotFileParser with user agent \`study-bot\`:
- skip disallowed URLs (\`blocked <url>\`) and duplicates (\`duplicate <url>\`)
- schedule allowed URLs one per crawl-delay seconds (default 1 if none), starting at t=0: \`t=<seconds> GET <url>\`
Then print \`requests R, blocked B, duplicates D, total time T s\` (time of the last request, or 0).`,
          starter: r`from urllib.robotparser import RobotFileParser
`,
          tests: [
            { label: "Crawl", input: "User-agent: *\nDisallow: /cart\nCrawl-delay: 3\n---\nhttps://shop.example/\nhttps://shop.example/item/1\nhttps://shop.example/cart\nhttps://shop.example/item/1\nhttps://shop.example/item/2\nend\n", output: "t=0 GET https://shop.example/\nt=3 GET https://shop.example/item/1\nblocked https://shop.example/cart\nduplicate https://shop.example/item/1\nt=6 GET https://shop.example/item/2\nrequests 3, blocked 1, duplicates 1, total time 6 s" },
            { label: "No delay rule", input: "User-agent: *\nDisallow:\n---\nhttps://a.example/x\nhttps://a.example/y\nend\n", output: "t=0 GET https://a.example/x\nt=1 GET https://a.example/y\nrequests 2, blocked 0, duplicates 0, total time 1 s", hidden: true },
          ],
          hints: [
            "`rp.parse(lines)` then `rp.can_fetch(\"study-bot\", url)` and `rp.crawl_delay(\"study-bot\")`.",
            "delay = crawl_delay or 1.",
            "Keep a set of seen URLs.",
            "The n-th request (from 0) is at n * delay.",
          ],
          solution: r`from urllib.robotparser import RobotFileParser

rules = []
while (line := input()) != "---":
    rules.append(line)
rp = RobotFileParser()
rp.parse(rules)
delay = rp.crawl_delay("study-bot") or 1

seen, scheduled, blocked, dupes = set(), 0, 0, 0
last = 0
while (url := input()) != "end":
    if url in seen:
        dupes += 1
        print("duplicate", url)
        continue
    seen.add(url)
    if not rp.can_fetch("study-bot", url):
        blocked += 1
        print("blocked", url)
        continue
    last = scheduled * delay
    print(f"t={last} GET {url}")
    scheduled += 1
print(f"requests {scheduled}, blocked {blocked}, duplicates {dupes}, total time {last} s")`,
          notes: "In a real crawler, `time.sleep(delay)` goes between requests, responses are cached, and the bot identifies itself with a User-Agent that includes contact details.",
        },
      ],
      realWorld: "Price-comparison sites and researchers collect public data with polite crawlers; newsrooms scrape government tables for stories; offices email automated daily reports built from spreadsheets.",
      reteach: "Scraping is like copying notes from a library's noticeboard. Check the library's rules first (terms, robots.txt), ask at the desk if they have a printed copy (an API), copy calmly instead of shoving everyone aside (rate limits), and don't copy people's phone numbers (personal data). Then write your summary letter (report) and post it yourself.",
      summary: [
        "Parse HTML with a parser (HTMLParser/BeautifulSoup), validate extracted values, report gaps.",
        "Prefer APIs; obey robots.txt, terms and privacy law; rate-limit and cache.",
        "Build reports (csv) and emails (EmailMessage); keep SMTP credentials in the environment.",
      ],
      libraryCode: [{
        title: "Fetch politely with requests + BeautifulSoup",
        code: `import os, smtplib, time, requests
from bs4 import BeautifulSoup

session = requests.Session()
session.headers["User-Agent"] = "study-bot/1.0 (contact: you@example.org)"
for url in urls_allowed_by_robots:
    html = session.get(url, timeout=10).text
    soup = BeautifulSoup(html, "html.parser")
    ...
    time.sleep(2)                                   # crawl delay

with smtplib.SMTP_SSL("smtp.example.org", 465) as smtp:
    smtp.login(os.environ["SMTP_USER"], os.environ["SMTP_PASSWORD"])
    smtp.send_message(msg)                          # msg built as in the lesson`,
        note: "`pip install requests beautifulsoup4` and run on your own computer. Send test emails only to yourself until the report is right.",
      }],
    },
  ],
  exam: [
    {
      id: "e1", kind: "mcq", difficulty: 3,
      prompt: "A cleanup script must delete temp files older than 7 days. Which approach is safest?",
      options: [
        { text: "Delete everything matching *.* in the folder", why: "Far too broad." },
        { text: "Dry-run list matches of a narrow pattern, move them to an archive, delete the archive later", why: "Correct." },
        { text: "Run it as administrator so nothing blocks it", why: "More power means bigger mistakes." },
      ],
      answer: 1,
      hint: "Narrow, visible, reversible.",
      explain: "Narrow patterns, dry runs and reversible steps limit the damage a bug can do.",
    },
    {
      id: "e2", kind: "predict", difficulty: 3,
      code: r`from email.message import EmailMessage
m = EmailMessage()
m["Subject"] = "Weekly report"
m["To"] = "team@example.org"
m.set_content("All systems normal.")
print(m["To"], "|", m.get_content_type(), "|", m.get_content().strip())`,
      answer: "team@example.org | text/plain | All systems normal.\n",
      hint: "set_content with a string makes a plain-text message.",
      explain: "Headers read back as set; the content type is text/plain.",
    },
    {
      id: "e3", kind: "fill", difficulty: 3,
      prompt: "Get the file name without its extension.",
      code: r`from pathlib import Path
print(Path("invoices/INV-0042.pdf").___)`,
      blanks: [["stem"]],
      output: "INV-0042\n",
      hint: "The trunk of the name.",
      explain: "`Path.stem` is the final component without its last suffix.",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: weekly sales report bot", difficulty: 4,
    prompt: `Automate a weekly report from shop CSV files (all inside your scratch folder).

Input: blocks for several CSV files — a line \`FILE name.csv\` followed by its lines — until \`end\`. Write each file into a folder \`sales\`. Then:
1. Read every \`sales/*.csv\` (sorted by name) with csv.DictReader (columns \`date,item,qty,price\`). Skip rows with bad numbers, logging \`skipped <file> line <n>\` (n counts data rows from 1).
2. Write \`sales/report.csv\` with columns \`item,qty,revenue\` (items sorted by revenue desc, then name; revenue with 2 decimals).
3. Build (don't send) an EmailMessage: subject \`Weekly sales: ₹<total>\` (total with 2 decimals), to \`owner@example.org\`, plain-text body with one line per item \`item: qty sold, ₹revenue\`, and attach report.csv.
Print the log lines, then \`report rows R\`, the subject, the body, and \`attachments: report.csv\`.`,
    starter: r`import csv
from email.message import EmailMessage
from pathlib import Path
`,
    tests: [
      { label: "Two days", input: "FILE mon.csv\ndate,item,qty,price\n2026-10-05,chai,30,12\n2026-10-05,samosa,20,15\nFILE tue.csv\ndate,item,qty,price\n2026-10-06,chai,25,12\n2026-10-06,samosa,x,15\n2026-10-06,vada pav,18,20\nend\n", output: "skipped tue.csv line 2\nreport rows 3\nWeekly sales: ₹1320.00\nchai: 55 sold, ₹660.00\nvada pav: 18 sold, ₹360.00\nsamosa: 20 sold, ₹300.00\nattachments: report.csv" },
    ],
    hints: [
      "Parse the input into {filename: [lines]} and write each with write_text(\"\\n\".join(lines)).",
      "Accumulate qty and revenue per item across all files.",
      "Write report.csv with csv.writer (newline=\"\").",
      "`msg.add_attachment(data, maintype=\"text\", subtype=\"csv\", filename=\"report.csv\")`; list attachments with `msg.iter_attachments()`.",
    ],
    solution: r`import csv
from email.message import EmailMessage
from pathlib import Path

folder = Path("sales")
folder.mkdir(exist_ok=True)
files, current = {}, None
while (line := input()) != "end":
    if line.startswith("FILE "):
        current = line[5:]
        files[current] = []
    else:
        files[current].append(line)
for name, lines in files.items():
    (folder / name).write_text("\n".join(lines) + "\n", encoding="utf-8")

qty, revenue = {}, {}
for path in sorted(folder.glob("*.csv")):
    if path.name == "report.csv":
        continue
    with path.open(newline="", encoding="utf-8") as f:
        for n, row in enumerate(csv.DictReader(f), 1):
            try:
                q, p = int(row["qty"]), float(row["price"])
            except ValueError:
                print(f"skipped {path.name} line {n}")
                continue
            qty[row["item"]] = qty.get(row["item"], 0) + q
            revenue[row["item"]] = revenue.get(row["item"], 0) + q * p

items = sorted(revenue, key=lambda i: (-revenue[i], i))
report = folder / "report.csv"
with report.open("w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["item", "qty", "revenue"])
    for i in items:
        w.writerow([i, qty[i], f"{revenue[i]:.2f}"])

msg = EmailMessage()
msg["Subject"] = f"Weekly sales: ₹{sum(revenue.values()):.2f}"
msg["From"], msg["To"] = "report-bot@example.org", "owner@example.org"
msg.set_content("\n".join(f"{i}: {qty[i]} sold, ₹{revenue[i]:.2f}" for i in items))
msg.add_attachment(report.read_bytes(), maintype="text", subtype="csv", filename="report.csv")

print("report rows", len(items))
print(msg["Subject"])
print(msg.get_body(preferencelist=("plain",)).get_content().strip())
print("attachments:", ", ".join(a.get_filename() for a in msg.iter_attachments()))`,
    notes: "Everything except the final send is automated and checkable. To run it weekly you'd read the shop's real export folder, send with smtplib (credentials from the environment) after a test run to yourself, log to a file, and schedule it with cron or Task Scheduler. Still missing for real use: alerts when files are missing, and a check that the week's dates are complete.",
  },
};
