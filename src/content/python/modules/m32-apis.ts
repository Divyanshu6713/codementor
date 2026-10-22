import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 32 — Working with APIs and networking. */
export const M32: PyModuleDef = {
  id: "py-apis",
  number: 32,
  level: 4,
  title: "Working with APIs and Networking",
  summary: "HTTP fundamentals; REST APIs; JSON APIs; requests concepts; authentication; API keys and environment variables; error handling; timeouts; retries; rate limits; pagination; webhooks; websockets (overview); building API clients.",
  track: "core",
  optionalNote: "Needed whenever a program talks to another service — payments, maps, weather, AI models, your own back end.",
  prereqs: ["py-files", "py-exceptions"],
  lessons: [
    {
      id: "py-http-json",
      title: "HTTP, REST and JSON",
      minutes: 17,
      difficulty: 3,
      objectives: [
        "Describe an HTTP request and response: method, URL, headers, body, status",
        "Map REST operations to HTTP methods and status codes",
        "Build URLs safely and encode/decode JSON",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "An API replies with status 404. What does it mean?",
        options: [
          { text: "Success", why: "2xx means success." },
          { text: "The resource wasn't found", why: "Correct." },
          { text: "The server crashed", why: "That's 5xx (e.g. 500)." },
        ],
        answer: 1,
        hint: "4xx = client-side problem.",
        explain: "404 Not Found: the URL doesn't point to an existing resource.",
      },
      why: "Weather apps, payment buttons, maps, login with Google, AI assistants — they all work by programs sending HTTP requests to APIs and reading JSON back. Understanding the request/response shape lets you use any API from its documentation.",
      concept: [
        {
          title: "Request and response",
          body: `\`\`\`text
GET /v1/weather?city=Pune&units=metric HTTP/1.1      ← method, path, query string
Host: api.example.com
Authorization: Bearer <token>                        ← headers
Accept: application/json

HTTP/1.1 200 OK                                      ← status
Content-Type: application/json
{"city": "Pune", "temp": 29.5}                       ← body
\`\`\`

**Status families**: 2xx success (200 OK, 201 Created, 204 No Content) · 3xx redirect · 4xx your request is wrong (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Too Many Requests) · 5xx server problem (500, 502, 503).`,
        },
        {
          title: "REST conventions",
          body: `| Action | Method | URL | Typical status |
| --- | --- | --- | --- |
| list | GET | /books | 200 |
| read one | GET | /books/42 | 200 / 404 |
| create | POST | /books (JSON body) | 201 |
| replace / update | PUT / PATCH | /books/42 | 200 |
| delete | DELETE | /books/42 | 204 |

GET must not change anything; GET, PUT and DELETE are **idempotent** (repeating them has the same effect as doing them once).`,
        },
        {
          title: "URLs and JSON in Python",
          body: `\`\`\`python
from urllib.parse import urlencode, quote, urlparse
url = "https://api.example.com/v1/search?" + urlencode({"q": "Kid's bag & shoes", "page": 2})
json.dumps(payload)      # dict → JSON text for the request body
json.loads(text)         # JSON text → dict/list
\`\`\`

Never glue user text into URLs by hand — \`urlencode\`/\`quote\` escape spaces, \`&\`, \`?\` and non-ASCII characters.

**Sandbox note:** CodeMentor's sandbox has no internet access, so these lessons use recorded responses and fake servers. The libraryCode boxes show the same code with real HTTP for your own computer.`,
        },
      ],
      example: {
        title: "Building requests and reading responses",
        code: r`import json
from http import HTTPStatus
from urllib.parse import urlencode, urlparse, parse_qs

base = "https://api.example.com/v1/search"
params = {"q": "Kid's bag & shoes", "page": 2}
url = f"{base}?{urlencode(params)}"
print(url)
parts = urlparse(url)
print(parts.netloc, parts.path, parse_qs(parts.query)["q"])

body = json.dumps({"title": "Wings of Fire", "year": 1999})
print(body)

raw_response = '{"id": 42, "title": "Wings of Fire", "tags": ["memoir", "science"], "price": null}'
data = json.loads(raw_response)
print(data["id"], data["tags"][0], data["price"])

for code in (200, 201, 404, 429, 503):
    status = HTTPStatus(code)
    kind = "ok" if code < 300 else "client error" if code < 500 else "server error"
    print(code, status.phrase, "-", kind)`,
        output: "https://api.example.com/v1/search?q=Kid%27s+bag+%26+shoes&page=2\napi.example.com /v1/search [\"Kid's bag & shoes\"]\n{\"title\": \"Wings of Fire\", \"year\": 1999}\n42 memoir None\n200 OK - ok\n201 Created - ok\n404 Not Found - client error\n429 Too Many Requests - client error\n503 Service Unavailable - server error\n",
        lines: [
          [7, "urlencode escapes the apostrophe, spaces and & so they can't break the URL."],
          [9, "urlparse splits a URL into host, path and query."],
          [12, "json.dumps turns a dict into the JSON text sent as a request body."],
          [15, "A recorded JSON response (the sandbox has no network)."],
          [16, "json.loads gives back dicts and lists; JSON null becomes None."],
          [20, "HTTPStatus knows every standard status code and its phrase."],
        ],
      },
      mistakes: [
        { title: "Treating every response as success", body: "Check the status code before using the body — a 404 or 500 often still has a JSON body (an error message)." },
        { title: "Building query strings by hand", body: "`url + \"?q=\" + text` breaks on spaces and `&`, and can be abused. Use urlencode or the client's params argument." },
        { title: "Using GET to change data", body: "Crawlers and browsers may repeat GETs. Use POST/PUT/PATCH/DELETE for changes." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`import json
text = '{"items": [{"n": 1}, {"n": 2}], "next": null, "ok": true}'
data = json.loads(text)
print(len(data["items"]), data["next"], data["ok"], sum(i["n"] for i in data["items"]))`,
          answer: "2 None True 3\n",
          hint: "null → None, true → True.",
          explain: "Two items; null and true map to Python's None and True; 1 + 2 = 3.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Encode the parameters into a query string.",
          code: r`from urllib.parse import ___
print(urlencode({"city": "New Delhi", "units": "metric"}))`,
          blanks: [["urlencode"]],
          output: "city=New+Delhi&units=metric\n",
          hint: "URL-encode.",
          explain: "`urlencode` joins key=value pairs with & and escapes spaces as +.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "Searching for `salt & pepper` sends two parameters (`q=salt ` and ` pepper`) instead of one. Which line builds the URL wrongly?",
          code: r`from urllib.parse import urlencode, parse_qs, urlparse
term = "salt & pepper"
url = "https://shop.example/search?q=" + term
print(parse_qs(urlparse(url).query, keep_blank_values=True))`,
          line: 3,
          fix: r`from urllib.parse import urlencode, parse_qs, urlparse
term = "salt & pepper"
url = "https://shop.example/search?" + urlencode({"q": term})
print(parse_qs(urlparse(url).query, keep_blank_values=True))`,
          output: "{'q': ['salt & pepper']}\n",
          hint: "& separates parameters in a query string.",
          explain: "The raw & splits the query. urlencode escapes it as %26 so the server receives one q value.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "Your client creates a new order with the API. Which method and success status fit REST conventions?",
          options: [
            { text: "GET → 200", why: "GET must not create things." },
            { text: "POST → 201 Created", why: "Correct." },
            { text: "DELETE → 204", why: "That removes a resource." },
          ],
          answer: 1,
          hint: "Create = POST.",
          explain: "POST to the collection creates a resource; 201 Created (often with its URL in a Location header).",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Interpret API responses", difficulty: 3,
          prompt: `Each input line is a recorded response: \`STATUS JSON-BODY\` (until \`end\`). For each, print:
- 2xx: \`ok: <summary>\` where summary is the body's \`title\` if present, else the number of keys (\`N fields\`); status 204 has no body → \`ok: no content\`
- 4xx: \`client error <status> <phrase>: <body.error>\` (use \`-\` if there's no error field)
- 5xx: \`server error <status>, try later\`
- Invalid JSON: \`bad response\``,
          starter: r`import json
from http import HTTPStatus
`,
          tests: [
            { label: "Mixed", input: "200 {\"title\": \"Pune weather\", \"temp\": 29}\n201 {\"id\": 7, \"created\": true}\n204\n404 {\"error\": \"city not found\"}\n429 {}\n503 {\"error\": \"maintenance\"}\n200 {broken\nend\n", output: "ok: Pune weather\nok: 2 fields\nok: no content\nclient error 404 Not Found: city not found\nclient error 429 Too Many Requests: -\nserver error 503, try later\nbad response" },
          ],
          hints: [
            "`status, _, body = line.partition(\" \")`.",
            "Handle 204 before parsing JSON.",
            "Wrap json.loads in try/except json.JSONDecodeError.",
            "`HTTPStatus(code).phrase` gives the standard text.",
          ],
          solution: r`import json
from http import HTTPStatus

while (line := input()) != "end":
    status_text, _, body = line.partition(" ")
    status = int(status_text)
    if status == 204:
        print("ok: no content")
        continue
    if status >= 500:
        print(f"server error {status}, try later")
        continue
    try:
        data = json.loads(body)
    except json.JSONDecodeError:
        print("bad response")
        continue
    if status < 300:
        print("ok:", data.get("title", f"{len(data)} fields"))
    else:
        print(f"client error {status} {HTTPStatus(status).phrase}: {data.get('error', '-')}")`,
          notes: "Real clients branch exactly like this: success → use data; 4xx → fix the request (don't retry blindly); 5xx → retry later; unparsable → log and fail safely.",
        },
        {
          id: "stretch", kind: "task", title: "A tiny REST router", difficulty: 4,
          prompt: `Simulate the server side of a REST API for books, stored in a dict. Each line is \`METHOD PATH [JSON]\` until \`end\`. Support \`GET /books\` (200, list of titles sorted by id), \`GET /books/<id>\`, \`POST /books\` (needs a \`title\`; 201 with new id), \`DELETE /books/<id>\` (204). Respond with \`<status> <json>\` (\`204\` alone). Errors: unknown id → \`404 {"error": "not found"}\`; POST without title → \`400 {"error": "title required"}\`; anything else → \`405 {"error": "method not allowed"}\`.`,
          starter: r`import json

books = {}
next_id = 1
`,
          tests: [
            { label: "Session", input: "POST /books {\"title\": \"Wings of Fire\"}\nPOST /books {\"title\": \"Malgudi Days\"}\nPOST /books {\"year\": 2001}\nGET /books\nGET /books/2\nDELETE /books/1\nGET /books/1\nPUT /books/2 {}\nGET /books\nend\n", output: "201 {\"id\": 1, \"title\": \"Wings of Fire\"}\n201 {\"id\": 2, \"title\": \"Malgudi Days\"}\n400 {\"error\": \"title required\"}\n200 [\"Wings of Fire\", \"Malgudi Days\"]\n200 {\"id\": 2, \"title\": \"Malgudi Days\"}\n204\n404 {\"error\": \"not found\"}\n405 {\"error\": \"method not allowed\"}\n200 [\"Malgudi Days\"]" },
          ],
          hints: [
            "`method, path, *rest = line.split(\" \", 2)`; body = json.loads(rest[0]) if rest else {}.",
            "`parts = path.strip(\"/\").split(\"/\")` → ['books'] or ['books', '2'].",
            "Write a function that returns (status, payload) and print with json.dumps.",
            "Use `global next_id` when creating.",
          ],
          solution: r`import json

books = {}
next_id = 1

def handle(method, path, body):
    global next_id
    parts = path.strip("/").split("/")
    if parts == ["books"]:
        if method == "GET":
            return 200, [books[i]["title"] for i in sorted(books)]
        if method == "POST":
            if "title" not in body:
                return 400, {"error": "title required"}
            book = {"id": next_id, "title": body["title"]}
            books[next_id] = book
            next_id += 1
            return 201, book
    elif len(parts) == 2 and parts[0] == "books" and parts[1].isdigit():
        book_id = int(parts[1])
        if method in ("GET", "DELETE") and book_id not in books:
            return 404, {"error": "not found"}
        if method == "GET":
            return 200, books[book_id]
        if method == "DELETE":
            del books[book_id]
            return 204, None
    return 405, {"error": "method not allowed"}

while (line := input()) != "end":
    method, path, *rest = line.split(" ", 2)
    body = json.loads(rest[0]) if rest else {}
    status, payload = handle(method, path, body)
    print(status if payload is None else f"{status} {json.dumps(payload)}")`,
          notes: "Frameworks like FastAPI and Flask do the routing and JSON conversion for you, but underneath it's this: match method + path, validate, return a status and a body.",
        },
      ],
      realWorld: "Payment gateways (Razorpay, Stripe), maps, SMS and AI model providers all expose JSON REST APIs; Postman and curl are used daily to explore them.",
      reteach: "An HTTP request is a letter: the method is what you want (GET = 'please send me', POST = 'please file this'), the URL is the address, headers are notes on the envelope (who you are, what language you read), and the body is the content. The reply comes with a status stamp: 200 'done', 404 'no such address', 500 'our office is on fire'.",
      summary: [
        "Requests: method, URL (+ query), headers, body; responses: status, headers, body.",
        "REST: GET read, POST create (201), PUT/PATCH update, DELETE (204); 4xx = your fault, 5xx = theirs.",
        "Build URLs with urlencode; json.dumps/json.loads for bodies; always check the status.",
      ],
      libraryCode: [{
        title: "A real request with the requests library",
        code: `import requests

response = requests.get(
    "https://api.github.com/repos/python/cpython",
    headers={"Accept": "application/vnd.github+json"},
    timeout=10,
)
response.raise_for_status()          # raises for 4xx/5xx
repo = response.json()
print(repo["full_name"], repo["stargazers_count"])`,
        note: "Run on your own computer after `pip install requests` (needs internet). Standard-library alternative: urllib.request.",
      }],
    },

    {
      id: "py-api-client",
      title: "Building a robust API client",
      minutes: 18,
      difficulty: 4,
      objectives: [
        "Authenticate with API keys and tokens read from environment variables",
        "Apply timeouts, retries with backoff and rate-limit handling",
        "Walk through paginated results",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "Where should an API key for your app live?",
        options: [
          { text: "Hard-coded in the source file", why: "It ends up in git history and screenshots." },
          { text: "In an environment variable or secrets manager, read at runtime", why: "Correct." },
          { text: "In the JavaScript sent to the browser", why: "Anyone can read it there." },
        ],
        answer: 1,
        hint: "Keep secrets out of code.",
        explain: "Environment variables (from a .env file locally, a secrets manager in production) keep keys out of the codebase.",
      },
      why: "Real networks fail: servers time out, return 503s, and limit how often you can call them. A client that handles this calmly — with timeouts, a few spaced-out retries and respect for rate limits — is the difference between a flaky app and a reliable one.",
      concept: [
        {
          title: "Authentication and secrets",
          body: `\`\`\`python
import os
API_KEY = os.environ.get("WEATHER_API_KEY")     # never hard-code
if not API_KEY:
    raise SystemExit("Set WEATHER_API_KEY first")
headers = {"Authorization": f"Bearer {API_KEY}"}
\`\`\`

- Locally: a \`.env\` file (in \`.gitignore\`!) loaded with python-dotenv.
- Never print or log full keys; show only the last 4 characters.
- If a key leaks, **rotate** it (revoke and issue a new one) — deleting the commit isn't enough.`,
        },
        {
          title: "Timeouts, retries and rate limits",
          body: `- **Timeout** every request (e.g. 10 s). Without one a hung server hangs your program forever.
- **Retry** only things that may succeed later: timeouts, connection errors, 429, 502/503/504. Never retry 400/401/404.
- **Exponential backoff with jitter**: wait 0.5 s, 1 s, 2 s… plus a little randomness, up to a maximum number of attempts.
- **429 Too Many Requests**: honour the \`Retry-After\` header.
- Only retry **idempotent** requests automatically (GET, PUT, DELETE) — retrying a POST could charge a card twice, unless the API supports idempotency keys.`,
        },
        {
          title: "Pagination",
          body: `APIs return big lists in pages: \`?page=2&per_page=50\`, or a **cursor** (\`"next": "abc123"\`) you send back to get the following page. Loop until there's no next page — ideally as a generator so callers just iterate.`,
        },
      ],
      example: {
        title: "A client with an injected (fake) transport",
        code: r`import random

class FakeTransport:
    """Stands in for the network: replays scripted responses and records requests."""
    def __init__(self, script):
        self.script = list(script)
        self.requests = []
    def send(self, method, url, headers, timeout):
        self.requests.append((method, url))
        outcome = self.script.pop(0)
        if outcome == "timeout":
            raise TimeoutError("read timed out")
        return outcome

class ApiError(Exception):
    pass

class Client:
    RETRYABLE = {429, 502, 503, 504}
    def __init__(self, transport, api_key, max_attempts=4, sleep=None):
        self.transport, self.max_attempts = transport, max_attempts
        self.headers = {"Authorization": f"Bearer {api_key}"}
        self.sleep = sleep or (lambda s: None)
        self.waits = []
    def get(self, url):
        for attempt in range(1, self.max_attempts + 1):
            try:
                status, headers, body = self.transport.send("GET", url, self.headers, timeout=10)
            except TimeoutError:
                status, headers, body = None, {}, None
            if status is not None and status < 400:
                return body
            if status is not None and status not in self.RETRYABLE:
                raise ApiError(f"{status}: {body}")
            if attempt == self.max_attempts:
                raise ApiError(f"gave up after {attempt} attempts")
            wait = float(headers.get("Retry-After", 0.5 * 2 ** (attempt - 1)))
            wait += random.uniform(0, 0.1)
            self.waits.append(round(wait, 1))
            self.sleep(wait)

random.seed(1)
transport = FakeTransport(["timeout", (503, {}, None), (429, {"Retry-After": "3"}, None), (200, {}, {"temp": 29})])
client = Client(transport, api_key="sk_test_1234")
print(client.get("/weather?city=Pune"))
print("attempts:", len(transport.requests), "waits:", client.waits)

try:
    Client(FakeTransport([(404, {}, "no such city")]), "k").get("/weather?city=Atlantis")
except ApiError as e:
    print("error:", e)
print("key shown as:", "****" + "sk_test_1234"[-4:])`,
        output: "{'temp': 29}\nattempts: 4 waits: [0.5, 1.1, 3.1]\nerror: 404: no such city\nkey shown as: ****1234\n",
        lines: [
          [3, "The transport is the only part that touches the network; tests (and this sandbox) swap in a fake."],
          [19, "Only these statuses are worth retrying."],
          [22, "Auth goes in a header, never in the URL where it would be logged."],
          [23, "Sleeping is injected too, so tests don't really wait."],
          [28, "Every request has a timeout."],
          [33, "A 404 won't fix itself — fail immediately."],
          [37, "Exponential backoff (0.5, 1, 2 …) unless the server says Retry-After."],
          [38, "Jitter spreads out retries from many clients."],
          [52, "Only the last 4 characters of a secret are ever displayed."],
        ],
      },
      mistakes: [
        { title: "No timeout", body: "A request without a timeout can wait forever. Always pass one." },
        { title: "Retrying everything, instantly", body: "Hammering a struggling server makes it worse, and retrying 400s never helps. Back off and retry only transient failures." },
        { title: "Keys in code or logs", body: "Committed keys get scraped from GitHub within minutes. Use environment variables and mask keys in output." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`def backoff(attempt, base=0.5, cap=4.0):
    return min(cap, base * 2 ** (attempt - 1))
print([backoff(a) for a in range(1, 6)])`,
          answer: "[0.5, 1.0, 2.0, 4.0, 4.0]\n",
          hint: "Doubling, but capped.",
          explain: "0.5, 1, 2, 4, then 8 is capped at 4.0.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Read the API key from the environment (None if missing).",
          code: r`import os
os.environ["DEMO_API_KEY"] = "abc123"
key = os.environ.___("DEMO_API_KEY")
print(key[-3:], os.environ.get("MISSING_KEY"))`,
          blanks: [["get"]],
          output: "123 None\n",
          hint: "Dict-style safe lookup.",
          explain: "`os.environ.get(name)` returns None instead of raising KeyError when the variable isn't set.",
        },
        {
          id: "b1", kind: "bug", difficulty: 4,
          prompt: "This client keeps retrying a 401 Unauthorized (a wrong key will never start working). Which line decides what to retry?",
          code: r`responses = [401, 401, 401]
def should_retry(status):
    return status >= 400
attempts = 0
for status in responses:
    attempts += 1
    if not should_retry(status):
        break
print("attempts:", attempts)`,
          line: 3,
          fix: r`responses = [401, 401, 401]
def should_retry(status):
    return status in {429, 502, 503, 504}
attempts = 0
for status in responses:
    attempts += 1
    if not should_retry(status):
        break
print("attempts:", attempts)`,
          output: "attempts: 1\n",
          hint: "Which errors might succeed if you try again?",
          explain: "401 means the credentials are wrong; retrying just wastes calls (and may lock the account). Retry only transient statuses.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 4,
          prompt: "Why is automatically retrying a POST /payments request dangerous?",
          options: [
            { text: "POST requests can't be retried", why: "They can be — that's the danger." },
            { text: "If the first attempt actually succeeded, the retry may charge twice", why: "Correct — use an idempotency key." },
            { text: "POST is always slower", why: "Not the issue." },
          ],
          answer: 1,
          hint: "A timeout doesn't mean the server didn't do it.",
          explain: "POST isn't idempotent. Payment APIs accept an Idempotency-Key header so a repeated request is recognised and not processed twice.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Paginate everything", difficulty: 3,
          prompt: `A fake API returns pages: \`fetch_page(cursor)\` returns \`{"items": [...], "next": cursor-or-None}\`. Input: one line per page with comma-separated items (until \`end\`); page i's \`next\` is \`"p<i+1>"\` except the last. Write a **generator** \`all_items(fetch_page)\` that starts with cursor None and yields every item. Print the items joined by spaces and \`requests: N\`.`,
          starter: r`lines = []
while (line := input()) != "end":
    lines.append(line)

calls = []
def fetch_page(cursor):
    calls.append(cursor)
    index = 0 if cursor is None else int(cursor[1:])
    items = lines[index].split(",") if lines[index] else []
    nxt = f"p{index + 1}" if index + 1 < len(lines) else None
    return {"items": items, "next": nxt}
`,
          tests: [
            { label: "Three pages", input: "a,b,c\nd,e\nf\nend\n", output: "a b c d e f\nrequests: 3" },
            { label: "One page", input: "solo\nend\n", output: "solo\nrequests: 1", hidden: true },
          ],
          hints: [
            "`cursor = None` then `while True:`.",
            "`page = fetch_page(cursor); yield from page[\"items\"]`.",
            "Stop when page[\"next\"] is None; otherwise cursor = page[\"next\"].",
            "requests = len(calls).",
          ],
          solution: r`lines = []
while (line := input()) != "end":
    lines.append(line)

calls = []
def fetch_page(cursor):
    calls.append(cursor)
    index = 0 if cursor is None else int(cursor[1:])
    items = lines[index].split(",") if lines[index] else []
    nxt = f"p{index + 1}" if index + 1 < len(lines) else None
    return {"items": items, "next": nxt}

def all_items(fetch_page):
    cursor = None
    while True:
        page = fetch_page(cursor)
        yield from page["items"]
        cursor = page["next"]
        if cursor is None:
            return

print(" ".join(all_items(fetch_page)))
print("requests:", len(calls))`,
          notes: "Because it's a generator, a caller that only needs the first 10 items stops early and never fetches later pages.",
        },
        {
          id: "stretch", kind: "task", title: "Retry with backoff (simulated time)", difficulty: 4,
          prompt: `Write \`call_with_retries(send, max_attempts, base)\`. \`send()\` returns a status code or raises \`TimeoutError\`. Retry on TimeoutError and statuses 429/500/502/503/504 with waits \`base * 2**(attempt-1)\`; stop immediately on other 4xx; return on 2xx. Instead of sleeping, add each wait to a list. Input: \`max_attempts base\`, then the scripted outcomes (one per line: a status or \`timeout\`) until \`end\`. Print \`result <status>\` or \`failed <reason>\` (reason: \`status 404\`, or \`gave up after N attempts\`), then \`waits [...]\`.`,
          starter: r`def call_with_retries(send, max_attempts, base):
    pass
`,
          tests: [
            { label: "Recovers", input: "5 0.5\ntimeout\n503\n200\nend\n", output: "result 200\nwaits [0.5, 1.0]" },
            { label: "Gives up", input: "3 1\n503\n503\n503\n503\nend\n", output: "failed gave up after 3 attempts\nwaits [1.0, 2.0]", hidden: true },
            { label: "No retry on 404", input: "4 1\n404\n200\nend\n", output: "failed status 404\nwaits []", hidden: true, category: "edge" },
          ],
          hints: [
            "Make `send` pop the next scripted outcome and raise TimeoutError for 'timeout'.",
            "Loop attempt 1..max_attempts; on retryable failure, append the wait unless it was the last attempt.",
            "Return a tuple (ok, value, waits).",
            "Use float(base) so waits print as floats.",
          ],
          solution: r`RETRYABLE = {429, 500, 502, 503, 504}

def call_with_retries(send, max_attempts, base):
    waits = []
    for attempt in range(1, max_attempts + 1):
        try:
            status = send()
        except TimeoutError:
            status = None
        if status is not None and 200 <= status < 300:
            return True, f"result {status}", waits
        if status is not None and status not in RETRYABLE:
            return False, f"failed status {status}", waits
        if attempt < max_attempts:
            waits.append(base * 2 ** (attempt - 1))
    return False, f"failed gave up after {max_attempts} attempts", waits

max_attempts, base = input().split()
script = []
while (line := input()) != "end":
    script.append(line)

def send():
    outcome = script.pop(0)
    if outcome == "timeout":
        raise TimeoutError
    return int(outcome)

ok, message, waits = call_with_retries(send, int(max_attempts), float(base))
print(message)
print("waits", waits)`,
          notes: "Libraries like tenacity, urllib3's Retry and httpx transports implement this policy; production versions add jitter and a total time budget.",
        },
      ],
      realWorld: "Stripe and Razorpay SDKs retry with idempotency keys; GitHub's API returns rate-limit headers; cloud SDKs (boto3) retry throttled calls with exponential backoff and jitter.",
      reteach: "Calling an API is like phoning a busy office. Hang up if nobody answers in 10 seconds (timeout). If the line is busy (503/429), wait a bit longer each time before redialling (backoff) — and if they say 'call back in 3 minutes' (Retry-After), do that. If they say 'wrong number' (404) or 'you're not authorised' (401), redialling won't help.",
      summary: [
        "Keys from environment variables/secrets managers; send in headers; never log them in full.",
        "Always set timeouts; retry only transient failures with exponential backoff + jitter; honour Retry-After.",
        "Paginate with page numbers or cursors — wrap it in a generator; don't auto-retry non-idempotent requests.",
      ],
      libraryCode: [{
        title: "The same client with httpx",
        code: `import os, httpx

transport = httpx.HTTPTransport(retries=3)           # retries connection failures
with httpx.Client(
    base_url="https://api.example.com/v1",
    headers={"Authorization": f"Bearer {os.environ['EXAMPLE_API_KEY']}"},
    timeout=10.0,
    transport=transport,
) as client:
    r = client.get("/items", params={"page": 1})
    r.raise_for_status()
    print(r.json())`,
        note: "Needs `pip install httpx`, internet access and a real key in your environment — run on your own computer.",
      }],
    },

    {
      id: "py-webhooks-realtime",
      title: "Webhooks, signatures and real-time connections",
      minutes: 15,
      difficulty: 4,
      objectives: [
        "Explain polling vs webhooks vs websockets",
        "Verify a webhook's HMAC signature",
        "Make webhook handling idempotent",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "A payment provider needs to tell your server 'payment succeeded'. Instead of you asking every minute, it sends an HTTP POST to your URL. That's…",
        options: [
          { text: "Polling", why: "Polling is you asking repeatedly." },
          { text: "A webhook", why: "Correct." },
          { text: "A websocket", why: "Websockets are long-lived two-way connections." },
        ],
        answer: 1,
        hint: "They call you.",
        explain: "A webhook is a callback: the provider POSTs an event to an endpoint you registered.",
      },
      why: "Anyone can send a POST to your webhook URL — including attackers pretending to be the payment provider. Verifying signatures and handling duplicate deliveries are what make webhooks safe to act on.",
      concept: [
        {
          title: "Polling, webhooks, websockets",
          body: `| Approach | Who starts | Good for |
| --- | --- | --- |
| **Polling** | you, repeatedly | simple, infrequent checks |
| **Webhook** | the provider POSTs to you | events: payments, git pushes, form submissions |
| **WebSocket** | one long-lived two-way connection | chat, live scores, multiplayer, streaming |
| **Server-Sent Events** | server streams to client over HTTP | live feeds, AI token streaming |`,
        },
        {
          title: "Verifying signatures",
          body: `The provider signs the **raw body** with a shared secret using HMAC-SHA256 and sends the signature in a header. You recompute it and compare in constant time:

\`\`\`python
import hmac, hashlib
expected = hmac.new(SECRET, raw_body, hashlib.sha256).hexdigest()
if not hmac.compare_digest(expected, received_signature):
    return 401
\`\`\`

Also check a **timestamp** (reject old messages, stopping replays) and process each **event id** at most once — providers retry deliveries, so duplicates are normal.`,
        },
      ],
      example: {
        title: "A safe webhook handler",
        code: r`import hashlib, hmac, json, time

SECRET = b"whsec_demo_secret"
processed = set()

def sign(body, timestamp):
    message = f"{timestamp}.".encode() + body
    return hmac.new(SECRET, message, hashlib.sha256).hexdigest()

def handle(body, timestamp, signature, now, tolerance=300):
    if abs(now - timestamp) > tolerance:
        return 400, "stale"
    if not hmac.compare_digest(sign(body, timestamp), signature):
        return 401, "bad signature"
    event = json.loads(body)
    if event["id"] in processed:
        return 200, "duplicate ignored"
    processed.add(event["id"])
    return 200, f"{event['type']} for order {event['order']}"

now = 1_760_000_000
body = json.dumps({"id": "evt_1", "type": "payment.succeeded", "order": 42}).encode()
good = sign(body, now)
print(handle(body, now, good, now + 5))
print(handle(body, now, good, now + 6))
tampered = body.replace(b"42", b"43")
print(handle(tampered, now, good, now + 7))
print(handle(body, now - 3600, sign(body, now - 3600), now))`,
        output: "(200, 'payment.succeeded for order 42')\n(200, 'duplicate ignored')\n(401, 'bad signature')\n(400, 'stale')\n",
        lines: [
          [3, "The shared secret comes from the provider's dashboard (from an env var in real code)."],
          [8, "Sign the timestamp together with the raw body bytes."],
          [11, "Reject old messages so captured requests can't be replayed later."],
          [13, "compare_digest takes the same time whether or not it matches — no timing leaks."],
          [16, "Providers retry deliveries; remember event ids and process each once."],
          [26, "Changing one byte of the body breaks the signature."],
          [28, "A correctly signed but hour-old message is still rejected."],
        ],
      },
      mistakes: [
        { title: "Trusting the webhook body", body: "Without a signature check, anyone who discovers your URL can fake 'payment succeeded'." },
        { title: "Verifying a re-serialised body", body: "Sign/verify the exact raw bytes received. Parsing and re-dumping JSON can change spacing and break (or fake) the match." },
        { title: "Doing slow work before responding", body: "Providers time out and retry. Verify, store the event, respond 200 quickly, then process in the background." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`import hmac, hashlib
key = b"k"
a = hmac.new(key, b"amount=100", hashlib.sha256).hexdigest()
b = hmac.new(key, b"amount=100", hashlib.sha256).hexdigest()
c = hmac.new(key, b"amount=900", hashlib.sha256).hexdigest()
print(hmac.compare_digest(a, b), hmac.compare_digest(a, c), len(a))`,
          answer: "True False 64\n",
          hint: "SHA-256 hex digests are 64 characters.",
          explain: "Same key and message → same signature; a changed message → different signature. 256 bits = 64 hex characters.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Compare signatures in constant time.",
          code: r`import hmac
expected = "ab12"
received = "ab12"
print(hmac.___(expected, received))`,
          blanks: [["compare_digest"]],
          output: "True\n",
          hint: "compare + digest.",
          explain: "`hmac.compare_digest` avoids timing attacks that `==` can allow.",
        },
        {
          id: "b1", kind: "bug", difficulty: 4,
          prompt: "The same `evt_9` delivery arrives twice (providers retry) and the order is shipped twice. Which line should skip already-processed events?",
          code: r`seen = set()
shipped = []
def on_event(event):
    shipped.append(event["order"])
    seen.add(event["id"])
for e in [{"id": "evt_9", "order": 7}, {"id": "evt_9", "order": 7}]:
    on_event(e)
print(shipped)`,
          line: 4,
          fix: r`seen = set()
shipped = []
def on_event(event):
    if event["id"] in seen:
        return
    shipped.append(event["order"])
    seen.add(event["id"])
for e in [{"id": "evt_9", "order": 7}, {"id": "evt_9", "order": 7}]:
    on_event(e)
print(shipped)`,
          output: "[7]\n",
          hint: "Check before acting.",
          explain: "Webhook handlers must be idempotent: check the event id before doing anything with side effects.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "A multiplayer game needs the server to push positions to players 20 times a second, and players send moves back. Best fit?",
          options: [
            { text: "Polling every second", why: "Too slow and wasteful." },
            { text: "WebSockets", why: "Correct: a persistent two-way channel." },
            { text: "Webhooks", why: "Webhooks are server-to-server event callbacks." },
          ],
          answer: 1,
          hint: "Two-way, continuous.",
          explain: "WebSockets keep one connection open for low-latency messages in both directions.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Verify incoming webhooks", difficulty: 3,
          prompt: `The secret is \`b"shh"\`. Each input line is \`signature|body\` (until \`end\`), where the signature should be the hex HMAC-SHA256 of the body bytes. For each, print \`accepted <event type>\` (from the JSON body's \`type\`) or \`rejected\`. Also reject duplicates (same \`id\`) with \`duplicate\`. The tests compute valid signatures with the same secret.`,
          starter: r`import hashlib, hmac, json

SECRET = b"shh"
`,
          tests: [
            { label: "Deliveries", input: "4c20c3d2ba3b6b2d6b74c80fa1c2b5d32dff8b1f35834a4a2e21e2d3d6b1dc9a|{\"id\": 1, \"type\": \"fake\"}\n26a5e12f68082da8dc30ff4a1109602ab433ee053e9263ecc2f78a32b602ab29|{\"id\": 2, \"type\": \"order.paid\"}\n26a5e12f68082da8dc30ff4a1109602ab433ee053e9263ecc2f78a32b602ab29|{\"id\": 2, \"type\": \"order.paid\"}\nend\n", output: "rejected\naccepted order.paid\nduplicate" },
          ],
          hints: [
            "`sig, _, body = line.partition(\"|\")`.",
            "`hmac.new(SECRET, body.encode(), hashlib.sha256).hexdigest()`.",
            "Compare with hmac.compare_digest before parsing JSON.",
            "Keep a set of seen ids.",
          ],
          solution: r`import hashlib, hmac, json

SECRET = b"shh"
seen = set()
while (line := input()) != "end":
    signature, _, body = line.partition("|")
    expected = hmac.new(SECRET, body.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, signature):
        print("rejected")
        continue
    event = json.loads(body)
    if event["id"] in seen:
        print("duplicate")
        continue
    seen.add(event["id"])
    print("accepted", event["type"])`,
          notes: "Order matters: verify the signature on the raw text first, and only then parse and act on it.",
        },
        {
          id: "stretch", kind: "task", title: "Polling vs webhooks: count the calls", difficulty: 3,
          prompt: `An order's status changes at given minutes (input: \`minute status\` lines until \`end\`, ascending). Compare two designs over the period up to the last change:
- **Polling** every P minutes (first line of input is P), starting at minute P: count requests, and for each change the delay until the next poll sees it.
- **Webhook**: one request per change, zero delay.
Print \`polling: N requests, max delay D min\` and \`webhook: M requests, max delay 0 min\`.`,
          starter: r`import math
`,
          tests: [
            { label: "P=5", input: "5\n3 packed\n12 shipped\n40 delivered\nend\n", output: "polling: 8 requests, max delay 3 min\nwebhook: 3 requests, max delay 0 min" },
            { label: "P=1", input: "1\n2 paid\nend\n", output: "polling: 2 requests, max delay 0 min\nwebhook: 1 requests, max delay 0 min", hidden: true },
          ],
          hints: [
            "Polls happen at P, 2P, 3P… The change at minute m is seen at the first poll ≥ m: `math.ceil(m / P) * P`.",
            "Delay = seen - m.",
            "Number of polls = ceil(last_minute / P).",
            "Webhook requests = number of changes.",
          ],
          solution: r`import math

p = int(input())
changes = []
while (line := input()) != "end":
    minute, status = line.split()
    changes.append(int(minute))
polls = math.ceil(changes[-1] / p)
delays = [math.ceil(m / p) * p - m for m in changes]
print(f"polling: {polls} requests, max delay {max(delays)} min")
print(f"webhook: {len(changes)} requests, max delay 0 min")`,
          notes: "Polling wastes requests when nothing changes and still notices late; webhooks are efficient but need a public, secured endpoint. Many systems do both: webhooks for speed, occasional polling as a safety net.",
        },
      ],
      realWorld: "GitHub sends webhooks on every push to trigger CI; Razorpay/Stripe sign webhook payloads with HMAC; chat apps and live dashboards use WebSockets; AI APIs stream tokens with Server-Sent Events.",
      reteach: "Polling is asking 'are we there yet?' every five minutes. A webhook is the driver calling you when you arrive. The signature is a wax seal only the real sender can make — break or forge the seal and you know the letter was tampered with. A WebSocket is an open phone line you both keep talking on.",
      summary: [
        "Polling (you ask), webhooks (they POST to you), WebSockets/SSE (live connections).",
        "Verify HMAC signatures over the raw body with compare_digest; check timestamps against replays.",
        "Webhook handlers must be idempotent (dedupe by event id) and respond quickly.",
      ],
      libraryCode: [{
        title: "A WebSocket client",
        code: `import asyncio, websockets

async def main():
    async with websockets.connect("wss://echo.websocket.org") as ws:
        await ws.send("hello")
        print(await ws.recv())

asyncio.run(main())`,
        note: "Needs `pip install websockets` and internet access — run on your own computer.",
      }],
    },
  ],
  exam: [
    {
      id: "e1", kind: "mcq", difficulty: 3,
      prompt: "Which response should your client retry automatically (with backoff)?",
      options: [
        { text: "400 Bad Request", why: "The request itself is wrong." },
        { text: "503 Service Unavailable", why: "Correct: temporary." },
        { text: "403 Forbidden", why: "Permissions won't change by retrying." },
      ],
      answer: 1,
      hint: "Transient vs permanent.",
      explain: "503 signals a temporary server problem; 4xx (except 429) need a different request.",
    },
    {
      id: "e2", kind: "predict", difficulty: 3,
      code: r`from urllib.parse import urlencode
print(urlencode({"q": "chai & samosa", "lang": "hi"}))`,
      answer: "q=chai+%26+samosa&lang=hi\n",
      hint: "Spaces become +, & becomes %26.",
      explain: "urlencode escapes the value so the & doesn't start a new parameter.",
    },
    {
      id: "e3", kind: "fill", difficulty: 3,
      prompt: "Turn the JSON response text into Python data.",
      code: r`import json
text = '{"temp": 31, "city": "Chennai"}'
data = json.___(text)
print(data["city"], data["temp"])`,
      blanks: [["loads"]],
      output: "Chennai 31\n",
      hint: "load-string.",
      explain: "`json.loads` parses a JSON string.",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: weather client with fixture data", difficulty: 4,
    prompt: `Build a weather CLI on top of a **fake transport** (the sandbox has no internet; real code would plug in an HTTP library).

The starter's \`FakeWeatherAPI.send(path, params, headers)\` returns \`(status, json_text)\` from recorded fixtures, requires the header \`Authorization: Bearer demo-key\` (else 401), and returns 503 the first time a city is requested.

Write \`WeatherClient(api, key)\` with \`current(city)\` that builds params with the city, sends the auth header, retries 503 up to 3 attempts, raises \`LookupError\` on 404 and \`PermissionError\` on 401, and returns the parsed dict. Read \`key\` from the first input line, then cities until \`end\`, printing \`City: 29.5°C, humid\` (description lowercased), \`City: not found\`, or \`auth failed\` (then stop). Finally print \`requests: N\`.`,
    starter: r`import json

FIXTURES = {
    "pune": {"city": "Pune", "temp": 29.5, "desc": "Humid"},
    "leh": {"city": "Leh", "temp": -3.0, "desc": "Clear Sky"},
}

class FakeWeatherAPI:
    def __init__(self):
        self.calls = 0
        self.warmed = set()
    def send(self, path, params, headers):
        self.calls += 1
        if headers.get("Authorization") != "Bearer demo-key":
            return 401, json.dumps({"error": "invalid key"})
        city = params.get("city", "").lower()
        if city not in self.warmed:
            self.warmed.add(city)
            return 503, json.dumps({"error": "warming up"})
        if city not in FIXTURES:
            return 404, json.dumps({"error": "unknown city"})
        return 200, json.dumps(FIXTURES[city])

class WeatherClient:
    pass
`,
    tests: [
      { label: "Lookups", input: "demo-key\nPune\nAtlantis\nLeh\nend\n", output: "Pune: 29.5°C, humid\nAtlantis: not found\nLeh: -3.0°C, clear sky\nrequests: 6" },
      { label: "Bad key", input: "wrong\nPune\nLeh\nend\n", output: "auth failed\nrequests: 1", hidden: true, category: "edge" },
    ],
    hints: [
      "current(): loop up to 3 attempts; `status, text = self.api.send(\"/current\", {\"city\": city}, self.headers)`.",
      "503 → continue; 401 → PermissionError; 404 → LookupError; 200 → json.loads(text).",
      "In the main loop, catch LookupError per city and PermissionError to stop.",
      "Print `api.calls` at the end — including after an auth failure.",
    ],
    solution: r`import json

FIXTURES = {
    "pune": {"city": "Pune", "temp": 29.5, "desc": "Humid"},
    "leh": {"city": "Leh", "temp": -3.0, "desc": "Clear Sky"},
}

class FakeWeatherAPI:
    def __init__(self):
        self.calls = 0
        self.warmed = set()
    def send(self, path, params, headers):
        self.calls += 1
        if headers.get("Authorization") != "Bearer demo-key":
            return 401, json.dumps({"error": "invalid key"})
        city = params.get("city", "").lower()
        if city not in self.warmed:
            self.warmed.add(city)
            return 503, json.dumps({"error": "warming up"})
        if city not in FIXTURES:
            return 404, json.dumps({"error": "unknown city"})
        return 200, json.dumps(FIXTURES[city])

class WeatherClient:
    def __init__(self, api, key, max_attempts=3):
        self.api = api
        self.headers = {"Authorization": f"Bearer {key}"}
        self.max_attempts = max_attempts

    def current(self, city):
        for _ in range(self.max_attempts):
            status, text = self.api.send("/current", {"city": city}, self.headers)
            if status == 503:
                continue
            if status == 401:
                raise PermissionError("invalid API key")
            if status == 404:
                raise LookupError(city)
            return json.loads(text)
        raise ConnectionError("service unavailable")

api = FakeWeatherAPI()
client = WeatherClient(api, input().strip())
while (city := input()) != "end":
    try:
        w = client.current(city)
    except LookupError:
        print(f"{city}: not found")
    except PermissionError:
        print("auth failed")
        break
    else:
        print(f"{w['city']}: {w['temp']}°C, {w['desc'].lower()}")
print("requests:", api.calls)`,
    notes: "The client never knows it's talking to a fake — swap FakeWeatherAPI for one using httpx and a real key from an environment variable, and the same code works online. Still missing for real use: timeouts, caching, backoff waits, unit conversion and respecting the provider's rate limits and terms.",
  },
};
