import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 31 — Databases with Python. */
export const M31: PyModuleDef = {
  id: "py-databases",
  number: 31,
  level: 4,
  title: "Databases with Python",
  summary: "Database concepts; SQL basics; SQLite with Python; connecting, querying, CRUD; parameterised queries; transactions; database errors; joins and indexes; ORM concepts; SQLAlchemy overview; migrations.",
  track: "core",
  optionalNote: "Needed by almost every app that stores data — web back ends, tools, analytics.",
  prereqs: ["py-exceptions", "py-files"],
  lessons: [
    {
      id: "py-sqlite-crud",
      title: "SQL and SQLite: create, read, update, delete",
      minutes: 18,
      difficulty: 3,
      objectives: [
        "Explain tables, rows, columns and primary keys",
        "Connect to SQLite and run SQL from Python",
        "Perform CRUD operations and fetch results",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "Why use a database instead of a JSON file for an app's data?",
        options: [
          { text: "Databases are always smaller", why: "Not necessarily." },
          { text: "Fast queries, safe concurrent updates and transactions", why: "Correct." },
          { text: "JSON can't store numbers", why: "It can." },
        ],
        answer: 1,
        hint: "Think: many users, lots of data, crashes mid-write.",
        explain: "Databases index data for fast lookups, handle many writers safely and make multi-step changes all-or-nothing.",
      },
      why: "Almost every real application — a shop, a school portal, a banking app — keeps its data in a database. SQL is the language for asking it questions, and Python's built-in sqlite3 lets you practise with a real database engine without installing anything.",
      concept: [
        {
          title: "Relational basics",
          body: `A **table** is like a spreadsheet: **columns** have names and types, each **row** is one record. A **primary key** uniquely identifies a row.

\`\`\`sql
CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT NOT NULL, marks INTEGER);
INSERT INTO students (name, marks) VALUES ('Asha', 91);
SELECT name, marks FROM students WHERE marks >= 50 ORDER BY marks DESC;
UPDATE students SET marks = 95 WHERE id = 1;
DELETE FROM students WHERE id = 1;
\`\`\`

These are **CRUD**: Create, Read, Update, Delete. Without \`ORDER BY\`, row order is **not guaranteed**.`,
        },
        {
          title: "sqlite3 in Python",
          body: `\`\`\`python
import sqlite3
conn = sqlite3.connect("school.db")     # or ":memory:" for a temporary database
conn.row_factory = sqlite3.Row         # rows behave like dicts: row["name"]
cur = conn.execute("SELECT * FROM students")
rows = cur.fetchall()                  # list of rows; fetchone() for one (or None)
conn.commit()                          # save changes
conn.close()
\`\`\`

SQLite stores a whole database in one file — great for apps, tests and learning. Server databases (PostgreSQL, MySQL) use the same SQL ideas.`,
        },
      ],
      example: {
        title: "A small student database",
        code: r`import sqlite3

conn = sqlite3.connect(":memory:")
conn.row_factory = sqlite3.Row
conn.execute("CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT NOT NULL, marks INTEGER)")

conn.executemany(
    "INSERT INTO students (name, marks) VALUES (?, ?)",
    [("Asha", 91), ("Ravi", 47), ("Meera", 78)],
)
conn.commit()

for row in conn.execute("SELECT id, name, marks FROM students ORDER BY marks DESC"):
    print(row["id"], row["name"], row["marks"])

conn.execute("UPDATE students SET marks = marks + 5 WHERE name = ?", ("Ravi",))
conn.execute("DELETE FROM students WHERE marks < ?", (60,))
conn.commit()

count, avg = conn.execute("SELECT COUNT(*), AVG(marks) FROM students").fetchone()
print("left:", count, "average:", avg)
print(conn.execute("SELECT name FROM students WHERE name = 'Zoe'").fetchone())
conn.close()`,
        output: "1 Asha 91\n3 Meera 78\n2 Ravi 47\nleft: 2 average: 84.5\nNone\n",
        lines: [
          [3, "\":memory:\" creates a temporary database that disappears when closed."],
          [4, "Row objects can be read by column name."],
          [5, "CREATE TABLE defines the columns; id is filled in automatically."],
          [7, "executemany runs one INSERT per tuple; ? are placeholders for values."],
          [13, "ORDER BY makes the order predictable."],
          [16, "UPDATE changes matching rows — Ravi now has 52."],
          [17, "DELETE removes rows below 60, so Ravi is gone."],
          [20, "Aggregate functions return a single row; fetchone() gets it."],
          [22, "No matching row → fetchone() returns None."],
        ],
      },
      mistakes: [
        { title: "Forgetting commit()", body: "Changes are kept in an open transaction; if you close without commit they're lost." },
        { title: "UPDATE/DELETE without WHERE", body: "`DELETE FROM students` deletes every row. Always double-check the WHERE clause." },
        { title: "Relying on row order", body: "Without ORDER BY, the database may return rows in any order." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`import sqlite3
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE t (n INTEGER)")
db.executemany("INSERT INTO t VALUES (?)", [(5,), (2,), (9,)])
print(db.execute("SELECT n FROM t ORDER BY n").fetchall())
print(db.execute("SELECT MAX(n), SUM(n) FROM t").fetchone())`,
          answer: "[(2,), (5,), (9,)]\n(9, 16)\n",
          hint: "Without row_factory, rows are tuples.",
          explain: "fetchall returns a list of one-item tuples in sorted order; MAX is 9 and SUM 16.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Get just the first result row.",
          code: r`import sqlite3
db = sqlite3.connect(":memory:")
row = db.execute("SELECT 2 + 3").___()
print(row)`,
          blanks: [["fetchone"]],
          output: "(5,)\n",
          hint: "Fetch one.",
          explain: "`fetchone()` returns the next row (a tuple) or None.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "Only Ravi's marks should change, but every student ends up with 100. Which line is wrong?",
          code: r`import sqlite3
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE s (name TEXT, marks INTEGER)")
db.executemany("INSERT INTO s VALUES (?, ?)", [("Asha", 91), ("Ravi", 47)])
db.execute("UPDATE s SET marks = 100")
print(db.execute("SELECT name, marks FROM s ORDER BY name").fetchall())`,
          line: 5,
          fix: r`import sqlite3
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE s (name TEXT, marks INTEGER)")
db.executemany("INSERT INTO s VALUES (?, ?)", [("Asha", 91), ("Ravi", 47)])
db.execute("UPDATE s SET marks = 100 WHERE name = ?", ("Ravi",))
print(db.execute("SELECT name, marks FROM s ORDER BY name").fetchall())`,
          output: "[('Asha', 91), ('Ravi', 100)]\n",
          hint: "Which rows does the UPDATE match?",
          explain: "Without WHERE, UPDATE changes every row.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 2,
          prompt: "What does a PRIMARY KEY guarantee?",
          options: [
            { text: "Each row has a unique identifier", why: "Correct." },
            { text: "The table is sorted by it", why: "Not guaranteed — use ORDER BY." },
            { text: "The column is encrypted", why: "Unrelated." },
          ],
          answer: 0,
          hint: "Key = identity.",
          explain: "No two rows can share a primary key value, so it reliably identifies one row.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Library catalogue", difficulty: 3,
          prompt: `Create an in-memory table \`books(id INTEGER PRIMARY KEY, title TEXT, author TEXT, year INTEGER)\`. Read commands until \`end\`:
- \`add|title|author|year\` → insert, print \`added #id\` (use \`cursor.lastrowid\`)
- \`by|author\` → titles by that author, alphabetically, comma-separated (or \`none\`)
- \`before|year\` → count of books published before that year: \`N books\`
- \`del|id\` → delete, print \`deleted\` or \`no such book\` (use \`cursor.rowcount\`)`,
          starter: r`import sqlite3
db = sqlite3.connect(":memory:")
`,
          tests: [
            { label: "Session", input: "add|Wings of Fire|Kalam|1999\nadd|Ignited Minds|Kalam|2002\nadd|Malgudi Days|Narayan|1943\nby|Kalam\nbefore|2000\ndel|2\ndel|9\nby|Kalam\nend\n", output: "added #1\nadded #2\nadded #3\nIgnited Minds, Wings of Fire\n2 books\ndeleted\nno such book\nWings of Fire" },
            { label: "Unknown author", input: "by|Nobody\nend\n", output: "none", hidden: true, category: "edge" },
          ],
          hints: [
            "`cur = db.execute(\"INSERT ... VALUES (?, ?, ?)\", (title, author, int(year)))` then `cur.lastrowid`.",
            "`SELECT title FROM books WHERE author = ? ORDER BY title`.",
            "`SELECT COUNT(*) FROM books WHERE year < ?`.",
            "After DELETE, `cur.rowcount` is the number of rows removed.",
          ],
          solution: r`import sqlite3
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT, author TEXT, year INTEGER)")

while (line := input()) != "end":
    cmd, *args = line.split("|")
    if cmd == "add":
        title, author, year = args
        cur = db.execute("INSERT INTO books (title, author, year) VALUES (?, ?, ?)", (title, author, int(year)))
        print(f"added #{cur.lastrowid}")
    elif cmd == "by":
        rows = db.execute("SELECT title FROM books WHERE author = ? ORDER BY title", (args[0],)).fetchall()
        print(", ".join(t for (t,) in rows) if rows else "none")
    elif cmd == "before":
        (n,) = db.execute("SELECT COUNT(*) FROM books WHERE year < ?", (int(args[0]),)).fetchone()
        print(f"{n} books")
    elif cmd == "del":
        cur = db.execute("DELETE FROM books WHERE id = ?", (int(args[0]),))
        print("deleted" if cur.rowcount else "no such book")
db.commit()`,
          notes: "lastrowid and rowcount tell you what a write actually did — useful for API responses like '201 Created' or '404 Not Found'.",
        },
        {
          id: "stretch", kind: "task", title: "Group and report", difficulty: 4,
          prompt: `Load sales lines \`region,product,amount\` until \`end\` into a table. Using **one SQL query** with GROUP BY, print each region's total and number of sales, highest total first (ties by region name): \`region: total (n sales)\`. Then print the single best-selling product overall: \`top product: name (total)\`. Amounts are integers.`,
          starter: r`import sqlite3
db = sqlite3.connect(":memory:")
`,
          tests: [
            { label: "Sales", input: "north,pen,100\nsouth,book,300\nnorth,book,250\neast,pen,50\nsouth,pen,80\nend\n", output: "south: 380 (2 sales)\nnorth: 350 (2 sales)\neast: 50 (1 sales)\ntop product: book (550)" },
          ],
          hints: [
            "CREATE TABLE sales (region TEXT, product TEXT, amount INTEGER).",
            "`SELECT region, SUM(amount) AS total, COUNT(*) FROM sales GROUP BY region ORDER BY total DESC, region`.",
            "Top product: GROUP BY product ORDER BY SUM(amount) DESC LIMIT 1.",
            "fetchone() for the single top row.",
          ],
          solution: r`import sqlite3
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE sales (region TEXT, product TEXT, amount INTEGER)")
rows = []
while (line := input()) != "end":
    region, product, amount = line.split(",")
    rows.append((region, product, int(amount)))
db.executemany("INSERT INTO sales VALUES (?, ?, ?)", rows)

query = """
    SELECT region, SUM(amount) AS total, COUNT(*) AS n
    FROM sales GROUP BY region
    ORDER BY total DESC, region
"""
for region, total, n in db.execute(query):
    print(f"{region}: {total} ({n} sales)")
name, total = db.execute(
    "SELECT product, SUM(amount) AS t FROM sales GROUP BY product ORDER BY t DESC, product LIMIT 1"
).fetchone()
print(f"top product: {name} ({total})")`,
          notes: "Letting the database aggregate is usually far faster than pulling every row into Python — essential when tables hold millions of rows.",
        },
      ],
      realWorld: "Mobile apps (Android, iOS) store local data in SQLite; Django and Flask apps talk SQL to PostgreSQL; analysts write GROUP BY queries all day.",
      reteach: "A database is a very organised filing cabinet. Each drawer is a table, each folder a row, each labelled field on the folder a column. SQL is the precise way to ask the clerk: 'bring me every folder in the Students drawer with marks above 50, sorted by marks'.",
      summary: [
        "Tables have typed columns and rows; a primary key identifies each row.",
        "sqlite3: connect, execute, fetchone/fetchall, commit, close; ':memory:' for temporary DBs.",
        "CRUD = INSERT, SELECT, UPDATE, DELETE — always use WHERE for updates/deletes and ORDER BY for order.",
      ],
    },

    {
      id: "py-sql-safety",
      title: "Parameterised queries, transactions and joins",
      minutes: 18,
      difficulty: 4,
      objectives: [
        "Prevent SQL injection with parameterised queries",
        "Use transactions to make changes all-or-nothing",
        "Join related tables and handle database errors",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "`f\"SELECT * FROM users WHERE name = '{name}'\"` with name = `x' OR '1'='1` returns…",
        options: [
          { text: "No rows", why: "The injected text changes the query's logic." },
          { text: "Every user — SQL injection", why: "Correct." },
          { text: "An error always", why: "The quotes are balanced, so it runs." },
        ],
        answer: 1,
        hint: "Paste the text into the query and read it.",
        explain: "The query becomes WHERE name = 'x' OR '1'='1', which is true for every row.",
      },
      why: "SQL injection is one of the most damaging and common security bugs: attackers have dumped entire customer databases through a single search box. The fix is simple and must become a habit. Transactions protect you from the other classic disaster — half-finished changes, like money leaving one account but never arriving in the other.",
      concept: [
        {
          title: "Never build SQL with string formatting",
          body: `\`\`\`python
# DANGEROUS
db.execute(f"SELECT * FROM users WHERE name = '{name}'")
# SAFE — the driver sends the value separately; it can never become SQL
db.execute("SELECT * FROM users WHERE name = ?", (name,))
db.execute("SELECT * FROM users WHERE name = :name", {"name": name})
\`\`\`

Placeholders work for **values** only. Table or column names can't be parameters — if they must vary, choose from a fixed allow-list.`,
        },
        {
          title: "Transactions",
          body: `A transaction groups statements so they **all** succeed or **none** do (atomicity).

\`\`\`python
try:
    with conn:            # commits on success, rolls back on exception
        conn.execute("UPDATE accounts SET balance = balance - ? WHERE id = ?", (amt, src))
        conn.execute("UPDATE accounts SET balance = balance + ? WHERE id = ?", (amt, dst))
except sqlite3.Error as e:
    print("transfer failed:", e)
\`\`\`

Constraints (\`NOT NULL\`, \`UNIQUE\`, \`CHECK (balance >= 0)\`, \`FOREIGN KEY\`) make the database itself reject bad data with \`sqlite3.IntegrityError\`.`,
        },
        {
          title: "Joins and indexes",
          body: `Data is split into related tables (customers, orders) linked by keys. **JOIN** combines them:

\`\`\`sql
SELECT c.name, o.amount
FROM orders o JOIN customers c ON c.id = o.customer_id;
\`\`\`

\`LEFT JOIN\` keeps rows with no match (customers without orders). An **index** (\`CREATE INDEX idx_orders_customer ON orders(customer_id)\`) makes lookups on that column fast, at the cost of slightly slower writes.`,
        },
      ],
      example: {
        title: "Injection, safely handled — and an atomic transfer",
        code: r`import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE users (name TEXT, secret TEXT)")
db.executemany("INSERT INTO users VALUES (?, ?)", [("asha", "s1"), ("ravi", "s2")])

attack = "x' OR '1'='1"
unsafe = db.execute(f"SELECT name FROM users WHERE name = '{attack}'").fetchall()
safe = db.execute("SELECT name FROM users WHERE name = ?", (attack,)).fetchall()
print("unsafe query leaked:", len(unsafe), "rows; safe query:", len(safe), "rows")

db.execute("CREATE TABLE accounts (id INTEGER PRIMARY KEY, owner TEXT, balance INTEGER CHECK (balance >= 0))")
db.executemany("INSERT INTO accounts (owner, balance) VALUES (?, ?)", [("asha", 500), ("ravi", 100)])
db.commit()

def transfer(src, dst, amount):
    try:
        with db:
            db.execute("UPDATE accounts SET balance = balance + ? WHERE id = ?", (amount, dst))
            db.execute("UPDATE accounts SET balance = balance - ? WHERE id = ?", (amount, src))
        return "ok"
    except sqlite3.IntegrityError as e:
        return f"rolled back ({e})"

print(transfer(1, 2, 200))
print(transfer(2, 1, 1000))
print(db.execute("SELECT owner, balance FROM accounts ORDER BY id").fetchall())

db.execute("CREATE TABLE orders (id INTEGER PRIMARY KEY, account_id INTEGER, item TEXT)")
db.executemany("INSERT INTO orders (account_id, item) VALUES (?, ?)", [(1, "pen"), (1, "bag")])
rows = db.execute("""
    SELECT a.owner, COUNT(o.id) FROM accounts a
    LEFT JOIN orders o ON o.account_id = a.id
    GROUP BY a.id ORDER BY a.id
""").fetchall()
print(rows)`,
        output: "unsafe query leaked: 2 rows; safe query: 0 rows\nok\nrolled back (CHECK constraint failed: balance >= 0)\n[('asha', 300), ('ravi', 300)]\n[('asha', 2), ('ravi', 0)]\n",
        lines: [
          [8, "The f-string pastes attacker text into the SQL — the WHERE becomes always true."],
          [9, "With a placeholder, the whole string is just a name to compare — no rows match."],
          [12, "A CHECK constraint makes the database refuse negative balances."],
          [18, "`with db:` starts a transaction: commit if the block succeeds, rollback if it raises."],
          [19, "The credit runs first…"],
          [20, "…and if the debit violates the CHECK, the credit is undone too."],
          [27, "The failed transfer left no trace: balances are still consistent."],
          [33, "LEFT JOIN keeps ravi even though he has no orders (count 0)."],
        ],
      },
      mistakes: [
        { title: "f-strings or + in SQL", body: "Any user-controlled text in the SQL string is an injection risk. Always use placeholders for values." },
        { title: "Escaping quotes by hand", body: "Home-made escaping misses edge cases. Parameters are the only reliable fix." },
        { title: "Catching errors without rolling back", body: "A half-applied change plus a swallowed exception is the worst case. Use `with conn:` or call rollback()." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 4,
          code: r`import sqlite3
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE t (code TEXT UNIQUE)")
try:
    with db:
        db.execute("INSERT INTO t VALUES ('A')")
        db.execute("INSERT INTO t VALUES ('B')")
        db.execute("INSERT INTO t VALUES ('A')")
except sqlite3.IntegrityError:
    print("failed")
print(db.execute("SELECT COUNT(*) FROM t").fetchone()[0])`,
          answer: "failed\n0\n",
          hint: "The whole with-block is one transaction.",
          explain: "The duplicate 'A' violates UNIQUE, so the transaction rolls back — including the first two inserts.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Pass the name safely as a parameter.",
          code: r`import sqlite3
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE u (name TEXT)")
db.execute("INSERT INTO u VALUES ('o''brien')")
name = "o'brien"
print(db.execute("SELECT COUNT(*) FROM u WHERE name = ___", (name,)).fetchone())`,
          blanks: [["?"]],
          output: "(1,)\n",
          hint: "SQLite's positional placeholder.",
          explain: "`?` is replaced safely by the value — even names containing quotes work.",
        },
        {
          id: "b1", kind: "bug", difficulty: 4,
          prompt: "Searching for the product `Kid's bag` crashes with a syntax error (and attackers could inject SQL). Which line is wrong?",
          code: r`import sqlite3
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE p (name TEXT, price INTEGER)")
db.execute("INSERT INTO p VALUES (?, ?)", ("Kid's bag", 499))
term = "Kid's bag"
row = db.execute(f"SELECT price FROM p WHERE name = '{term}'").fetchone()
print(row)`,
          line: 6,
          fix: r`import sqlite3
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE p (name TEXT, price INTEGER)")
db.execute("INSERT INTO p VALUES (?, ?)", ("Kid's bag", 499))
term = "Kid's bag"
row = db.execute("SELECT price FROM p WHERE name = ?", (term,)).fetchone()
print(row)`,
          output: "(499,)\n",
          hint: "The apostrophe ends the SQL string early.",
          explain: "Formatting the value into the SQL breaks on quotes and allows injection. A placeholder fixes both.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "A table name must come from user input (e.g. a report picker). Safest approach?",
          options: [
            { text: "Use a ? placeholder for the table name", why: "Placeholders only work for values." },
            { text: "Check it against a fixed allow-list of known table names", why: "Correct." },
            { text: "Remove spaces from it", why: "Not nearly enough." },
          ],
          answer: 1,
          hint: "Only accept what you expect.",
          explain: "Map user choices to a fixed set of table names; reject anything else.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Safe login check", difficulty: 3,
          prompt: `Users are stored with a **salted hash** (provided helper). Read \`username password\` attempts until \`end\` and print \`welcome <user>\` or \`denied\`. Use a parameterised query. The tests include an injection attempt, which must be denied.`,
          starter: r`import hashlib, sqlite3

def hash_pw(password, salt):
    return hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 10_000).hex()

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE users (name TEXT PRIMARY KEY, salt TEXT, pw_hash TEXT)")
for name, pw, salt in [("asha", "tiger42", "s1"), ("ravi", "monsoon!", "s2")]:
    db.execute("INSERT INTO users VALUES (?, ?, ?)", (name, salt, hash_pw(pw, salt)))
`,
          tests: [
            { label: "Attempts", input: "asha tiger42\nravi wrong\nnobody x\nend\n", output: "welcome asha\ndenied\ndenied" },
            { label: "Injection", input: "x'--OR-'1'='1 anything\nasha' --  tiger42\nend\n", output: "denied\ndenied", hidden: true, category: "edge" },
          ],
          hints: [
            "Split each line on the LAST space: `name, pw = line.rsplit(\" \", 1)`.",
            "`SELECT salt, pw_hash FROM users WHERE name = ?`.",
            "If no row, deny; else compare hash_pw(pw, salt) with the stored hash.",
            "Use `hmac.compare_digest` for the comparison.",
          ],
          solution: r`import hashlib, hmac, sqlite3

def hash_pw(password, salt):
    return hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 10_000).hex()

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE users (name TEXT PRIMARY KEY, salt TEXT, pw_hash TEXT)")
for name, pw, salt in [("asha", "tiger42", "s1"), ("ravi", "monsoon!", "s2")]:
    db.execute("INSERT INTO users VALUES (?, ?, ?)", (name, salt, hash_pw(pw, salt)))

while (line := input()) != "end":
    name, pw = line.rsplit(" ", 1)
    row = db.execute("SELECT salt, pw_hash FROM users WHERE name = ?", (name,)).fetchone()
    if row and hmac.compare_digest(hash_pw(pw, row[0]), row[1]):
        print(f"welcome {name}")
    else:
        print("denied")`,
          notes: "Passwords are never stored in plain text — only salted, slow hashes (Module 33 explains why). Real systems use random salts from `secrets`, more iterations or argon2/bcrypt, rate limiting and account lockout.",
        },
        {
          id: "stretch", kind: "task", title: "Orders with joins and a transaction", difficulty: 4,
          prompt: `Tables: \`products(id, name, stock CHECK (stock >= 0))\` and \`orders(id, product_id, qty)\`. Products are given as \`name stock\` lines until \`---\`. Then order lines \`name qty\` until \`end\`: each order must, **in one transaction**, insert into orders and reduce stock; if stock would go negative, roll back and print \`rejected <name> x<qty>\`, else \`ok <name> x<qty>\`. Unknown products print \`unknown <name>\`. Finally print a LEFT JOIN report per product (by id): \`name: stock left, ordered N\`.`,
          starter: r`import sqlite3
db = sqlite3.connect(":memory:")
`,
          tests: [
            { label: "Shop", input: "pen 10\nbook 2\nlamp 1\n---\npen 4\nbook 3\nlamp 1\nmug 1\npen 6\nend\n", output: "ok pen x4\nrejected book x3\nok lamp x1\nunknown mug\nok pen x6\npen: 0 left, ordered 10\nbook: 2 left, ordered 0\nlamp: 0 left, ordered 1" },
          ],
          hints: [
            "Look up the product id first; None → unknown.",
            "`with db:` around the INSERT and the UPDATE; catch sqlite3.IntegrityError.",
            "Report: `SELECT p.name, p.stock, COALESCE(SUM(o.qty), 0) FROM products p LEFT JOIN orders o ON o.product_id = p.id GROUP BY p.id ORDER BY p.id`.",
            "COALESCE turns NULL (no orders) into 0.",
          ],
          solution: r`import sqlite3
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT UNIQUE, stock INTEGER CHECK (stock >= 0))")
db.execute("CREATE TABLE orders (id INTEGER PRIMARY KEY, product_id INTEGER REFERENCES products(id), qty INTEGER)")
while (line := input()) != "---":
    name, stock = line.split()
    db.execute("INSERT INTO products (name, stock) VALUES (?, ?)", (name, int(stock)))
db.commit()

while (line := input()) != "end":
    name, qty = line.split()
    qty = int(qty)
    row = db.execute("SELECT id FROM products WHERE name = ?", (name,)).fetchone()
    if row is None:
        print(f"unknown {name}")
        continue
    try:
        with db:
            db.execute("INSERT INTO orders (product_id, qty) VALUES (?, ?)", (row[0], qty))
            db.execute("UPDATE products SET stock = stock - ? WHERE id = ?", (qty, row[0]))
        print(f"ok {name} x{qty}")
    except sqlite3.IntegrityError:
        print(f"rejected {name} x{qty}")

report = db.execute("""
    SELECT p.name, p.stock, COALESCE(SUM(o.qty), 0)
    FROM products p LEFT JOIN orders o ON o.product_id = p.id
    GROUP BY p.id ORDER BY p.id
""")
for name, stock, ordered in report:
    print(f"{name}: {stock} left, ordered {ordered}")`,
          notes: "The rejected order's INSERT was rolled back together with the failed UPDATE, so 'ordered' never counts it. That's the guarantee that stops shops overselling stock.",
        },
      ],
      realWorld: "Banks wrap every transfer in a transaction; OWASP lists injection among the top web risks; every ORM uses parameterised queries under the hood.",
      reteach: "A parameterised query is a form with boxes: whatever someone writes in the 'name' box stays in that box — it can never change the question being asked. A transaction is a shopping trolley at the checkout: either everything in it is paid for together, or you walk away with nothing.",
      summary: [
        "Always use placeholders (? or :name) for values; allow-list identifiers.",
        "`with conn:` = transaction: commit on success, roll back on exception; constraints enforce rules.",
        "JOIN combines related tables (LEFT JOIN keeps unmatched rows); indexes speed up lookups.",
      ],
      cpp: {
        python: r`db.execute("SELECT * FROM users WHERE name = ?", (name,))`,
        cpp: r`sqlite3_prepare_v2(db, "SELECT * FROM users WHERE name = ?", -1, &stmt, nullptr);
sqlite3_bind_text(stmt, 1, name.c_str(), -1, SQLITE_TRANSIENT);`,
        note: "Same SQLite engine, same rule: bind values to placeholders. Python's sqlite3 module wraps the prepare/bind/step C API for you.",
      },
    },

    {
      id: "py-orm-migrations",
      title: "ORMs, repositories and migrations",
      minutes: 15,
      difficulty: 4,
      objectives: [
        "Explain what an ORM does and its trade-offs",
        "Wrap SQL in a small repository class that returns Python objects",
        "Understand schema migrations",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "What does an ORM (like SQLAlchemy or Django's ORM) do?",
        options: [
          { text: "Replaces the database", why: "It still uses a database underneath." },
          { text: "Maps database rows to Python objects and generates SQL for you", why: "Correct." },
          { text: "Makes SQL injection impossible in all cases", why: "Raw SQL through an ORM can still be unsafe." },
        ],
        answer: 1,
        hint: "Object–Relational Mapping.",
        explain: "An ORM lets you work with classes and objects; it writes parameterised SQL and maps results back to objects.",
      },
      why: "Writing SQL strings everywhere gets repetitive and scatters database details across an app. ORMs and repository classes keep data access in one place, and migrations let a live database's structure evolve safely as features are added.",
      concept: [
        {
          title: "ORM in one picture",
          body: `\`\`\`python
# SQLAlchemy 2.0 style (runs on your own computer)
class Student(Base):
    __tablename__ = "students"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    marks: Mapped[int]

with Session(engine) as session:
    session.add(Student(name="Asha", marks=91))
    session.commit()
    top = session.scalars(select(Student).where(Student.marks > 80)).all()
\`\`\`

**Pros**: less boilerplate, safe parameters, database portability, relationships as attributes. **Cons**: hidden queries (the "N+1 query" problem), harder complex reports — teams still drop to SQL when needed.`,
        },
        {
          title: "The repository pattern",
          body: `Without a full ORM you can still keep SQL in one class: a **repository** exposes methods like \`add(student)\`, \`get(id)\`, \`top(n)\` and returns dataclasses. The rest of the app never sees SQL, and tests can swap in a fake repository.`,
        },
        {
          title: "Migrations",
          body: `Databases outlive code versions. A **migration** is a numbered, versioned script that changes the schema (add a column, create an index). Tools like **Alembic** (SQLAlchemy) and Django migrations record which migrations a database has applied and run the missing ones in order — on every developer machine and in production.

SQLite stores a user version number: \`PRAGMA user_version\`.`,
        },
      ],
      example: {
        title: "A repository with dataclasses and migrations",
        code: r`import sqlite3
from dataclasses import dataclass

MIGRATIONS = [
    "CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT NOT NULL, marks INTEGER)",
    "ALTER TABLE students ADD COLUMN grade TEXT DEFAULT 'pending'",
    "CREATE INDEX idx_students_marks ON students(marks)",
]

def migrate(conn):
    current = conn.execute("PRAGMA user_version").fetchone()[0]
    for number, sql in enumerate(MIGRATIONS[current:], start=current + 1):
        with conn:
            conn.execute(sql)
            conn.execute(f"PRAGMA user_version = {number}")
        print("applied migration", number)
    return conn.execute("PRAGMA user_version").fetchone()[0]

@dataclass
class Student:
    name: str
    marks: int
    id: int | None = None

class StudentRepo:
    def __init__(self, conn):
        self.conn = conn
    def add(self, s):
        cur = self.conn.execute("INSERT INTO students (name, marks) VALUES (?, ?)", (s.name, s.marks))
        s.id = cur.lastrowid
        return s
    def top(self, n):
        rows = self.conn.execute("SELECT id, name, marks FROM students ORDER BY marks DESC LIMIT ?", (n,))
        return [Student(name, marks, id_) for id_, name, marks in rows]

conn = sqlite3.connect(":memory:")
print("schema version", migrate(conn))
print("schema version", migrate(conn))
repo = StudentRepo(conn)
for name, marks in [("Asha", 91), ("Ravi", 52), ("Meera", 78)]:
    repo.add(Student(name, marks))
print(repo.top(2))`,
        output: "applied migration 1\napplied migration 2\napplied migration 3\nschema version 3\nschema version 3\n[Student(name='Asha', marks=91, id=1), Student(name='Meera', marks=78, id=3)]\n",
        lines: [
          [4, "Migrations are an ordered list; never edit one that has already run — add a new one."],
          [11, "The database remembers which version it's at."],
          [12, "Only migrations newer than the current version run."],
          [15, "Each migration and its version bump commit together. (The version number is our own int, never user input.)"],
          [20, "A dataclass is the Python-side shape of a row."],
          [25, "The repository hides SQL behind clear method names."],
          [38, "Running migrate again applies nothing — it's idempotent."],
          [42, "Callers get Student objects, not tuples."],
        ],
      },
      mistakes: [
        { title: "The N+1 query problem", body: "Loading 100 orders, then running one query per order for its customer = 101 queries. Use joins / eager loading." },
        { title: "Editing old migrations", body: "Databases that already ran them won't run them again. Add a new migration instead." },
        { title: "Raw SQL strings inside an ORM", body: "`session.execute(text(f\"... {name}\"))` reintroduces injection. Use bound parameters there too." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`import sqlite3
db = sqlite3.connect(":memory:")
print(db.execute("PRAGMA user_version").fetchone()[0])
db.execute("PRAGMA user_version = 4")
print(db.execute("PRAGMA user_version").fetchone()[0])`,
          answer: "0\n4\n",
          hint: "A new database starts at version 0.",
          explain: "user_version defaults to 0 and stores whatever integer you set.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Turn each row into a Product object.",
          code: r`import sqlite3
from dataclasses import dataclass
@dataclass
class Product:
    name: str
    price: int
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE p (name TEXT, price INTEGER)")
db.execute("INSERT INTO p VALUES ('pen', 10)")
items = [___(*row) for row in db.execute("SELECT name, price FROM p")]
print(items)`,
          blanks: [["Product"]],
          output: "[Product(name='pen', price=10)]\n",
          hint: "Call the dataclass with the row's values.",
          explain: "`Product(*row)` unpacks the (name, price) tuple into the constructor — a tiny ORM.",
        },
        {
          id: "b1", kind: "bug", difficulty: 4,
          prompt: "The migration runner should skip migrations already applied, but on the second run it crashes with 'table students already exists'. Which line is wrong?",
          code: r`import sqlite3
MIGRATIONS = ["CREATE TABLE students (name TEXT)", "ALTER TABLE students ADD COLUMN marks INTEGER"]
def migrate(conn):
    current = conn.execute("PRAGMA user_version").fetchone()[0]
    for number, sql in enumerate(MIGRATIONS, start=1):
        conn.execute(sql)
        conn.execute(f"PRAGMA user_version = {number}")
    return conn.execute("PRAGMA user_version").fetchone()[0]
db = sqlite3.connect(":memory:")
try:
    print(migrate(db), migrate(db))
except sqlite3.OperationalError as e:
    print("error:", e)`,
          line: 5,
          fix: r`import sqlite3
MIGRATIONS = ["CREATE TABLE students (name TEXT)", "ALTER TABLE students ADD COLUMN marks INTEGER"]
def migrate(conn):
    current = conn.execute("PRAGMA user_version").fetchone()[0]
    for number, sql in enumerate(MIGRATIONS[current:], start=current + 1):
        conn.execute(sql)
        conn.execute(f"PRAGMA user_version = {number}")
    return conn.execute("PRAGMA user_version").fetchone()[0]
db = sqlite3.connect(":memory:")
try:
    print(migrate(db), migrate(db))
except sqlite3.OperationalError as e:
    print("error:", e)`,
          output: "2 2\n",
          hint: "`current` is read but never used.",
          explain: "The loop must start after the current version: `MIGRATIONS[current:]` numbered from current + 1.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "A page lists 50 orders and, for each, runs a separate query to load its customer. This is…",
          options: [
            { text: "The N+1 query problem — use a join or eager loading", why: "Correct." },
            { text: "Fine, databases are fast", why: "51 round-trips per page adds up quickly." },
            { text: "SQL injection", why: "Unrelated." },
          ],
          answer: 0,
          hint: "Count the queries.",
          explain: "1 query for orders + N for customers. One JOIN (or ORM eager loading) fetches everything at once.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Contacts repository", difficulty: 3,
          prompt: `Implement \`ContactRepo\` over SQLite with methods \`add(name, phone)\` (returns a \`Contact\` dataclass with its id; names must be unique — return None for duplicates), \`find(prefix)\` (contacts whose name starts with prefix, case-insensitive, sorted by name) and \`delete(id)\` (returns True/False). Process commands until \`end\`: \`add name phone\`, \`find prefix\`, \`del id\`, printing the returned values.`,
          starter: r`import sqlite3
from dataclasses import dataclass

@dataclass
class Contact:
    id: int
    name: str
    phone: str

class ContactRepo:
    pass
`,
          tests: [
            { label: "Session", input: "add Asha 98765\nadd Arjun 91234\nadd asha 11111\nadd Ravi 55555\nfind a\ndel 2\ndel 7\nfind A\nend\n", output: "Contact(id=1, name='Asha', phone='98765')\nContact(id=2, name='Arjun', phone='91234')\nNone\nContact(id=3, name='Ravi', phone='55555')\n[Contact(id=2, name='Arjun', phone='91234'), Contact(id=1, name='Asha', phone='98765')]\nTrue\nFalse\n[Contact(id=1, name='Asha', phone='98765')]" },
          ],
          hints: [
            "Create the table with `name TEXT UNIQUE COLLATE NOCASE` so 'asha' duplicates 'Asha'.",
            "Catch sqlite3.IntegrityError in add and return None.",
            "find: `WHERE name LIKE ? ORDER BY name` with `prefix + \"%\"` (LIKE is case-insensitive for ASCII).",
            "delete: return `cur.rowcount > 0`.",
          ],
          solution: r`import sqlite3
from dataclasses import dataclass

@dataclass
class Contact:
    id: int
    name: str
    phone: str

class ContactRepo:
    def __init__(self, conn):
        self.conn = conn
        conn.execute("CREATE TABLE contacts (id INTEGER PRIMARY KEY, name TEXT UNIQUE COLLATE NOCASE, phone TEXT)")

    def add(self, name, phone):
        try:
            with self.conn:
                cur = self.conn.execute("INSERT INTO contacts (name, phone) VALUES (?, ?)", (name, phone))
        except sqlite3.IntegrityError:
            return None
        return Contact(cur.lastrowid, name, phone)

    def find(self, prefix):
        rows = self.conn.execute(
            "SELECT id, name, phone FROM contacts WHERE name LIKE ? ORDER BY name", (prefix + "%",)
        )
        return [Contact(*row) for row in rows]

    def delete(self, contact_id):
        with self.conn:
            cur = self.conn.execute("DELETE FROM contacts WHERE id = ?", (contact_id,))
        return cur.rowcount > 0

repo = ContactRepo(sqlite3.connect(":memory:"))
while (line := input()) != "end":
    cmd, *args = line.split()
    if cmd == "add":
        print(repo.add(*args))
    elif cmd == "find":
        print(repo.find(args[0]))
    elif cmd == "del":
        print(repo.delete(int(args[0])))`,
          notes: "Note how the failed duplicate insert didn't use up id 3? SQLite reuses the next rowid when nothing was stored. A prefix containing % or _ would act as a wildcard — real code escapes them with LIKE ... ESCAPE.",
        },
        {
          id: "stretch", kind: "task", title: "Run pending migrations", difficulty: 4,
          prompt: `Write \`migrate(conn, migrations)\` that applies only pending migrations (tracked with \`PRAGMA user_version\`), each inside its own transaction, and stops at the first failing migration (printing \`migration N failed: <error>\`), leaving the version at the last success. Input: migration SQL lines until \`---\`, then a second batch until \`end\` (the second batch is the first batch **plus** new ones, as when you deploy a new version). Run migrate once per batch and print \`version N\` after each.`,
          starter: r`import sqlite3
`,
          tests: [
            { label: "Two deploys", input: "CREATE TABLE a (x INTEGER)\nCREATE TABLE b (y INTEGER)\n---\nCREATE TABLE a (x INTEGER)\nCREATE TABLE b (y INTEGER)\nALTER TABLE a ADD COLUMN z TEXT\nend\n", output: "version 2\nversion 3" },
            { label: "Failure", input: "CREATE TABLE a (x INTEGER)\nALTER TABLE missing ADD COLUMN q\n---\nCREATE TABLE a (x INTEGER)\nend\n", output: "migration 2 failed: no such table: missing\nversion 1\nversion 1", hidden: true, category: "edge" },
          ],
          hints: [
            "current = PRAGMA user_version.",
            "Loop over `enumerate(migrations[current:], start=current + 1)`.",
            "Inside `with conn:` execute the SQL then set the version; catch sqlite3.Error, print and break.",
            "The version is an int you computed — safe to format into the PRAGMA.",
          ],
          solution: r`import sqlite3

def migrate(conn, migrations):
    current = conn.execute("PRAGMA user_version").fetchone()[0]
    for number, sql in enumerate(migrations[current:], start=current + 1):
        try:
            with conn:
                conn.execute(sql)
                conn.execute(f"PRAGMA user_version = {int(number)}")
        except sqlite3.Error as e:
            print(f"migration {number} failed: {e}")
            break
    return conn.execute("PRAGMA user_version").fetchone()[0]

def read_batch(stop):
    batch = []
    while (line := input()) != stop:
        batch.append(line)
    return batch

conn = sqlite3.connect(":memory:")
for stop in ("---", "end"):
    print("version", migrate(conn, read_batch(stop)))`,
          notes: "Production migration tools add more: down-migrations, locking so two servers don't migrate at once, and dry runs. Always back up before migrating a real database.",
        },
      ],
      realWorld: "Django and Rails apps ship migrations with every release; SQLAlchemy + Alembic power many FastAPI and Flask back ends; repositories keep business logic testable with in-memory SQLite.",
      reteach: "An ORM is a translator: you speak Python ('give me students with marks above 80'), it speaks SQL to the database and translates the answer back into Python objects. Migrations are renovation plans numbered in order — the building keeps a note of which plans it has already been through.",
      summary: [
        "ORMs map classes ↔ tables and generate parameterised SQL; watch for N+1 queries.",
        "A repository class keeps SQL in one place and returns dataclasses.",
        "Migrations are ordered, versioned schema changes; never edit applied ones.",
      ],
      version: "`int | None` annotations: Python 3.10+",
      libraryCode: [{
        title: "The same model with SQLAlchemy 2.0",
        code: `from sqlalchemy import create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session

class Base(DeclarativeBase):
    pass

class Student(Base):
    __tablename__ = "students"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    marks: Mapped[int]

engine = create_engine("sqlite:///school.db")
Base.metadata.create_all(engine)
with Session(engine) as session:
    session.add_all([Student(name="Asha", marks=91), Student(name="Ravi", marks=52)])
    session.commit()
    for s in session.scalars(select(Student).order_by(Student.marks.desc())):
        print(s.name, s.marks)`,
        note: "Needs `pip install sqlalchemy` on your own computer (not available in the sandbox). Use Alembic for migrations with SQLAlchemy.",
      }],
    },
  ],
  exam: [
    {
      id: "e1", kind: "mcq", difficulty: 4,
      prompt: "Which line is safe against SQL injection?",
      options: [
        { text: "db.execute(\"SELECT * FROM t WHERE id = \" + user_id)", why: "Concatenation." },
        { text: "db.execute(\"SELECT * FROM t WHERE id = ?\", (user_id,))", why: "Correct." },
        { text: "db.execute(f\"SELECT * FROM t WHERE id = '{user_id.replace(\"'\", \"\")}'\")", why: "Hand-made escaping is fragile." },
      ],
      answer: 1,
      hint: "Placeholders.",
      explain: "Only the parameterised version keeps the value separate from the SQL.",
    },
    {
      id: "e2", kind: "predict", difficulty: 4,
      code: r`import sqlite3
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE a (n INTEGER CHECK (n > 0))")
for v in [3, -1, 5]:
    try:
        with db:
            db.execute("INSERT INTO a VALUES (?)", (v,))
    except sqlite3.IntegrityError:
        print("skip", v)
print(db.execute("SELECT SUM(n) FROM a").fetchone()[0])`,
      answer: "skip -1\n8\n",
      hint: "Each insert is its own transaction.",
      explain: "-1 violates the CHECK and only that insert rolls back; 3 + 5 = 8 remain.",
    },
    {
      id: "e3", kind: "fill", difficulty: 3,
      prompt: "Keep customers that have no orders.",
      code: r`import sqlite3
db = sqlite3.connect(":memory:")
db.executescript("CREATE TABLE c (id INTEGER, name TEXT); CREATE TABLE o (cid INTEGER); INSERT INTO c VALUES (1, 'asha'), (2, 'ravi'); INSERT INTO o VALUES (1);")
print(db.execute("SELECT c.name, COUNT(o.cid) FROM c ___ JOIN o ON o.cid = c.id GROUP BY c.id ORDER BY c.id").fetchall())`,
      blanks: [["LEFT", "left"]],
      output: "[('asha', 1), ('ravi', 0)]\n",
      hint: "Keep every row from the left table.",
      explain: "A LEFT JOIN keeps ravi with a NULL match, which COUNT turns into 0.",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: SQLite expense tracker", difficulty: 4,
    prompt: `Build an expense tracker on SQLite with a \`categories\` table (unique names) and an \`expenses\` table referencing it. Commands until \`end\`:
- \`cat name\` → add a category: \`category added\` or \`category exists\`
- \`spend category amount note…\` → \`#id saved\`; unknown category → \`no category <name>\`; amount ≤ 0 → \`invalid amount\` (enforce with a CHECK constraint)
- \`report\` → per category (alphabetical, including ones with no spending): \`name: total\` (2 decimals), then \`total: X\`
- \`search word\` → notes containing the word (case-insensitive), as \`#id category amount note\` ordered by id, or \`no matches\`

All values must go through parameterised queries.`,
    starter: r`import sqlite3
db = sqlite3.connect(":memory:")
`,
    tests: [
      { label: "Session", input: "cat food\ncat travel\ncat food\ncat rent\nspend food 120.5 lunch with team\nspend travel 300 train to Pune\nspend toys 50 kite\nspend food -5 refund\nspend food 80 Team dinner\nreport\nsearch team\nsearch flight\nend\n", output: "category added\ncategory added\ncategory exists\ncategory added\n#1 saved\n#2 saved\nno category toys\ninvalid amount\n#3 saved\nfood: 200.50\nrent: 0.00\ntravel: 300.00\ntotal: 500.50\n#1 food 120.5 lunch with team\n#3 food 80.0 Team dinner\nno matches" },
      { label: "Injection-looking text", input: "cat misc\nspend misc 10 it's '); DROP TABLE expenses;--\nsearch drop\nreport\nend\n", output: "category added\n#1 saved\n#1 misc 10.0 it's '); DROP TABLE expenses;--\nmisc: 10.00\ntotal: 10.00", hidden: true, category: "edge" },
    ],
    hints: [
      "expenses: id, category_id REFERENCES categories(id), amount REAL CHECK (amount > 0), note TEXT.",
      "Split spend with `line.split(maxsplit=3)` so the note keeps its spaces.",
      "Report: LEFT JOIN with COALESCE(SUM(e.amount), 0) GROUP BY c.id ORDER BY c.name.",
      "Search: `WHERE lower(e.note) LIKE ?` with `\"%\" + word.lower() + \"%\"`.",
    ],
    solution: r`import sqlite3
db = sqlite3.connect(":memory:")
db.executescript("""
CREATE TABLE categories (id INTEGER PRIMARY KEY, name TEXT UNIQUE NOT NULL);
CREATE TABLE expenses (
    id INTEGER PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    amount REAL NOT NULL CHECK (amount > 0),
    note TEXT
);
""")

while (line := input()) != "end":
    parts = line.split(maxsplit=3)
    cmd = parts[0]
    if cmd == "cat":
        try:
            with db:
                db.execute("INSERT INTO categories (name) VALUES (?)", (parts[1],))
            print("category added")
        except sqlite3.IntegrityError:
            print("category exists")
    elif cmd == "spend":
        _, category, amount, note = parts
        row = db.execute("SELECT id FROM categories WHERE name = ?", (category,)).fetchone()
        if row is None:
            print(f"no category {category}")
            continue
        try:
            with db:
                cur = db.execute(
                    "INSERT INTO expenses (category_id, amount, note) VALUES (?, ?, ?)",
                    (row[0], float(amount), note),
                )
            print(f"#{cur.lastrowid} saved")
        except sqlite3.IntegrityError:
            print("invalid amount")
    elif cmd == "report":
        rows = db.execute("""
            SELECT c.name, COALESCE(SUM(e.amount), 0)
            FROM categories c LEFT JOIN expenses e ON e.category_id = c.id
            GROUP BY c.id ORDER BY c.name
        """).fetchall()
        for name, total in rows:
            print(f"{name}: {total:.2f}")
        print(f"total: {sum(t for _, t in rows):.2f}")
    elif cmd == "search":
        rows = db.execute("""
            SELECT e.id, c.name, e.amount, e.note
            FROM expenses e JOIN categories c ON c.id = e.category_id
            WHERE lower(e.note) LIKE ? ORDER BY e.id
        """, ("%" + parts[1].lower() + "%",)).fetchall()
        if not rows:
            print("no matches")
        for id_, name, amount, note in rows:
            print(f"#{id_} {name} {amount} {note}")`,
    notes: "The second test stores a note that looks like an attack; with placeholders it's just text. Before real use you'd want: a file database with backups, money stored as integer paise (not floats), user accounts, input limits, and an export feature.",
  },
};
