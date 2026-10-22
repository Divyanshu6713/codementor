import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 34 — Web development with Python (specialist path). */
export const M34: PyModuleDef = {
  id: "py-web",
  number: 34,
  level: 5,
  title: "Web Development with Python",
  summary: "How web frameworks work (WSGI/ASGI); routing; requests and responses; templates and escaping; forms and validation; cookies and sessions; authentication; REST APIs; Flask, Django and FastAPI; deployment concepts.",
  track: "specialist",
  optionalNote: "For anyone building websites or back-end APIs. The sandbox has no network server, so you'll call web apps directly with test requests — exactly how framework test clients work — and run Flask/Django/FastAPI on your own computer.",
  prereqs: ["py-security"],
  lessons: [
    {
      id: "py-web-wsgi",
      title: "Inside a web framework: requests, routing, templates",
      minutes: 18,
      difficulty: 4,
      objectives: [
        "Explain what a web framework does between the server and your code",
        "Write a WSGI application with routing",
        "Render HTML safely from templates and handle form data",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "At its core, what does a web framework do with each HTTP request?",
        options: [
          { text: "Stores it in a database", why: "Only if your code does that." },
          { text: "Finds the function for the URL, calls it, and turns its result into an HTTP response", why: "Correct: routing + request/response handling." },
          { text: "Draws the page in the browser", why: "Browsers render; servers send HTML/JSON." },
        ],
        answer: 1,
        hint: "URL → function → response.",
        explain: "Frameworks parse the request, route it to your view function, and build the response — plus helpers for templates, forms, sessions and security.",
      },
      why: "Flask, Django and FastAPI feel like magic until you see the small contract underneath: a function receives a request and returns a response. Knowing that contract makes every framework easier to learn and debug.",
      concept: [
        {
          title: "WSGI and ASGI",
          body: `**WSGI** (Flask, Django) is a standard: the server calls \`app(environ, start_response)\` for each request.

- \`environ\` — a dict: \`REQUEST_METHOD\`, \`PATH_INFO\`, \`QUERY_STRING\`, headers, body stream.
- \`start_response(status, headers)\` — sets the status line and headers.
- The return value — an iterable of **bytes** (the body).

**ASGI** (FastAPI, Starlette, Django async) is the async successor, which also supports WebSockets. Servers: gunicorn/uWSGI (WSGI), uvicorn/hypercorn (ASGI).`,
        },
        {
          title: "Routing, templates, forms",
          body: `- **Routing** maps method + path to a view: \`@app.get("/books/<id>")\`.
- **Templates** produce HTML from data; real engines (Jinja2, Django) **auto-escape** variables. Python's \`string.Template\` doesn't — escape with \`html.escape\` yourself.
- **Forms** arrive as \`application/x-www-form-urlencoded\` bodies: \`urllib.parse.parse_qs\`. Validate on the server (Module 33), then **redirect after POST** (303) so refreshing doesn't resubmit.`,
        },
      ],
      example: {
        title: "A tiny framework on WSGI, tested without a server",
        code: r`import html, io, json
from string import Template
from urllib.parse import parse_qs

ROUTES = {}
def route(method, path):
    def register(fn):
        ROUTES[(method, path)] = fn
        return fn
    return register

PAGE = Template("<h1>$title</h1><ul>$items</ul>")
BOOKS = ["Wings of Fire"]

@route("GET", "/")
def home(request):
    items = "".join(f"<li>{html.escape(b)}</li>" for b in BOOKS)
    return "200 OK", "text/html", PAGE.substitute(title="Books", items=items)

@route("POST", "/books")
def add_book(request):
    title = parse_qs(request["body"]).get("title", [""])[0].strip()
    if not title or len(title) > 100:
        return "400 Bad Request", "application/json", json.dumps({"error": "title required"})
    BOOKS.append(title)
    return "303 See Other", "text/plain", ""

def app(environ, start_response):
    size = int(environ.get("CONTENT_LENGTH") or 0)
    request = {"body": environ["wsgi.input"].read(size).decode()}
    view = ROUTES.get((environ["REQUEST_METHOD"], environ["PATH_INFO"]))
    status, ctype, body = view(request) if view else ("404 Not Found", "text/plain", "not found")
    headers = [("Content-Type", ctype)] + ([("Location", "/")] if status.startswith("303") else [])
    start_response(status, headers)
    return [body.encode()]

def call(method, path, body=""):
    data = body.encode()
    environ = {"REQUEST_METHOD": method, "PATH_INFO": path, "CONTENT_LENGTH": str(len(data)), "wsgi.input": io.BytesIO(data)}
    seen = {}
    chunks = app(environ, lambda status, headers: seen.update(status=status, headers=dict(headers)))
    return seen["status"], b"".join(chunks).decode(), seen["headers"]

print(call("POST", "/books", "title=Malgudi+Days+%3Cb%3E")[0])
print(call("GET", "/")[1])
print(call("POST", "/books", "title=")[:2])
print(call("GET", "/missing")[0])`,
        output: "303 See Other\n<h1>Books</h1><ul><li>Wings of Fire</li><li>Malgudi Days &lt;b&gt;</li></ul>\n('400 Bad Request', '{\"error\": \"title required\"}')\n404 Not Found\n",
        lines: [
          [6, "A decorator registers each view under (method, path) — what @app.route does."],
          [12, "string.Template fills in placeholders but does NOT escape…"],
          [17, "…so we escape every user-supplied value ourselves."],
          [22, "Form bodies are URL-encoded; parse_qs decodes them."],
          [23, "Validate on the server before saving anything."],
          [26, "303 tells the browser to GET the page again — no double submit on refresh."],
          [28, "The WSGI contract: environ in, start_response called, bytes out."],
          [37, "A test client: build environ by hand and call the app directly, no network needed."],
        ],
      },
      mistakes: [
        { title: "Returning str from WSGI", body: "WSGI bodies must be bytes. Frameworks encode for you; raw WSGI code must `.encode()`." },
        { title: "Rendering without escaping", body: "Only auto-escaping template engines are safe by default. Never mark user content as safe HTML." },
        { title: "Doing work on GET", body: "Links get prefetched and crawled. Changes belong in POST/PUT/DELETE handlers." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`from urllib.parse import parse_qs
body = "name=Asha+Rao&tags=py&tags=web&empty="
print(parse_qs(body))
print(parse_qs(body, keep_blank_values=True)["empty"])`,
          answer: "{'name': ['Asha Rao'], 'tags': ['py', 'web']}\n['']\n",
          hint: "Values are lists; blanks are dropped by default.",
          explain: "+ decodes to a space, repeated keys collect into one list, and empty values appear only with keep_blank_values=True.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Fill the template's placeholder.",
          code: r`from string import Template
t = Template("Hello, $name!")
print(t.___(name="Ravi"))`,
          blanks: [["substitute", "safe_substitute"]],
          output: "Hello, Ravi!\n",
          hint: "Substitute the values in.",
          explain: "`substitute` replaces $name (raising KeyError if missing); safe_substitute leaves missing ones untouched.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "This route table sends GET /about to the wrong view. Which line registers the route incorrectly?",
          code: r`ROUTES = {}
def home(): return "home"
def about(): return "about"
ROUTES[("GET", "/")] = home
ROUTES[("GET", "/about")] = home
print(ROUTES[("GET", "/about")]())`,
          line: 5,
          fix: r`ROUTES = {}
def home(): return "home"
def about(): return "about"
ROUTES[("GET", "/")] = home
ROUTES[("GET", "/about")] = about
print(ROUTES[("GET", "/about")]())`,
          output: "about\n",
          hint: "Which function should handle /about?",
          explain: "The /about route points at home; register the about view.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "After a successful form POST, why redirect with 303 instead of returning a page?",
          options: [
            { text: "It's faster", why: "It's an extra request, actually." },
            { text: "Refreshing the result page won't resubmit the form", why: "Correct: Post/Redirect/Get." },
            { text: "Browsers can't display POST responses", why: "They can." },
          ],
          answer: 1,
          hint: "What happens on F5?",
          explain: "Post/Redirect/Get: the browser ends on a GET page, so refresh repeats the GET, not the POST.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Route matcher with parameters", difficulty: 3,
          prompt: `Write \`match(pattern, path)\` for routes like \`/books/<id>\` and \`/users/<name>/posts/<pid>\`: return a dict of parameters if the path matches (same number of segments, literal segments equal), else None. Read routes \`METHOD pattern view\` until \`---\`, then requests \`METHOD path\` until \`end\`; print \`view {params}\` for the first matching route, \`405\` if the path matches a route but with another method, else \`404\`.`,
          starter: r`def match(pattern, path):
    pass
`,
          tests: [
            { label: "Routing", input: "GET / home\nGET /books/<id> show_book\nPOST /books create_book\nGET /users/<name>/posts/<pid> show_post\n---\nGET /\nGET /books/42\nDELETE /books/42\nGET /users/asha/posts/7\nGET /users/asha\nPOST /books\nend\n", output: "home {}\nshow_book {'id': '42'}\n405\nshow_post {'name': 'asha', 'pid': '7'}\n404\ncreate_book {}" },
          ],
          hints: [
            "Split both on '/' after stripping it.",
            "A segment like `<id>` captures; others must be equal.",
            "Track whether any route matched the path at all (for 405).",
            "Check the method only after the path matches.",
          ],
          solution: r`def match(pattern, path):
    p_parts = pattern.strip("/").split("/")
    parts = path.strip("/").split("/")
    if len(p_parts) != len(parts):
        return None
    params = {}
    for want, got in zip(p_parts, parts):
        if want.startswith("<") and want.endswith(">"):
            params[want[1:-1]] = got
        elif want != got:
            return None
    return params

routes = []
while (line := input()) != "---":
    method, pattern, view = line.split()
    routes.append((method, pattern, view))
while (line := input()) != "end":
    method, path = line.split()
    path_matched = False
    for r_method, pattern, view in routes:
        params = match(pattern, path)
        if params is None:
            continue
        path_matched = True
        if r_method == method:
            print(view, params)
            break
    else:
        print(405 if path_matched else 404)`,
          notes: "Flask (Werkzeug), Django and FastAPI all do this, with type converters like `<int:id>` that validate and convert the captured text.",
        },
        {
          id: "stretch", kind: "task", title: "A form with validation and PRG", difficulty: 4,
          prompt: `Using the WSGI pattern from the example, build an app for a feedback form:
- \`GET /\` → 200 HTML: \`<h1>Feedback</h1>\` followed by one \`<p>name: message</p>\` per saved entry (escaped)
- \`POST /feedback\` with form fields \`name\` (1–30 chars) and \`message\` (1–200 chars) → 303 with Location \`/\`; invalid → 400 with body \`invalid: <field>[, <field>]\`
- anything else → 404 \`not found\`
Each input line is \`METHOD PATH [BODY]\` (until \`end\`); print \`<status> <body>\` (body may be empty).`,
          starter: r`import html, io
from urllib.parse import parse_qs

def app(environ, start_response):
    pass

def call(method, path, body=""):
    data = body.encode()
    environ = {"REQUEST_METHOD": method, "PATH_INFO": path, "CONTENT_LENGTH": str(len(data)), "wsgi.input": io.BytesIO(data)}
    seen = {}
    chunks = app(environ, lambda status, headers: seen.update(status=status))
    return seen["status"], b"".join(chunks).decode()
`,
          tests: [
            { label: "Flow", input: "GET /\nPOST /feedback name=Asha&message=Loved+the+%3Cb%3Elesson%3C%2Fb%3E\nPOST /feedback name=&message=hi\nPOST /feedback message=\nGET /\nGET /admin\nend\n", output: "200 OK <h1>Feedback</h1>\n303 See Other \n400 Bad Request invalid: name\n400 Bad Request invalid: name, message\n200 OK <h1>Feedback</h1><p>Asha: Loved the &lt;b&gt;lesson&lt;/b&gt;</p>\n404 Not Found not found" },
          ],
          hints: [
            "Read the body with CONTENT_LENGTH; parse with parse_qs(..., keep_blank_values=True).",
            "Collect invalid field names in order: name, then message.",
            "Store entries in a module-level list.",
            "Main loop: `method, path, *rest = line.split(\" \", 2)`, then print status and body.",
          ],
          solution: r`import html, io
from urllib.parse import parse_qs

ENTRIES = []

def app(environ, start_response):
    size = int(environ.get("CONTENT_LENGTH") or 0)
    form = parse_qs(environ["wsgi.input"].read(size).decode(), keep_blank_values=True)
    method, path = environ["REQUEST_METHOD"], environ["PATH_INFO"]
    if (method, path) == ("GET", "/"):
        items = "".join(f"<p>{html.escape(n)}: {html.escape(m)}</p>" for n, m in ENTRIES)
        status, headers, body = "200 OK", [("Content-Type", "text/html")], "<h1>Feedback</h1>" + items
    elif (method, path) == ("POST", "/feedback"):
        name = form.get("name", [""])[0].strip()
        message = form.get("message", [""])[0].strip()
        bad = [f for f, v, limit in (("name", name, 30), ("message", message, 200)) if not 1 <= len(v) <= limit]
        if bad:
            status, headers, body = "400 Bad Request", [("Content-Type", "text/plain")], "invalid: " + ", ".join(bad)
        else:
            ENTRIES.append((name, message))
            status, headers, body = "303 See Other", [("Location", "/")], ""
    else:
        status, headers, body = "404 Not Found", [("Content-Type", "text/plain")], "not found"
    start_response(status, headers)
    return [body.encode()]

def call(method, path, body=""):
    data = body.encode()
    environ = {"REQUEST_METHOD": method, "PATH_INFO": path, "CONTENT_LENGTH": str(len(data)), "wsgi.input": io.BytesIO(data)}
    seen = {}
    chunks = app(environ, lambda status, headers: seen.update(status=status))
    return seen["status"], b"".join(chunks).decode()

while (line := input()) != "end":
    method, path, *rest = line.split(" ", 2)
    status, body = call(method, path, rest[0] if rest else "")
    print(status, body)`,
          notes: "This app could be served for real with `wsgiref.simple_server.make_server(\"\", 8000, app).serve_forever()` on your own computer. Frameworks add CSRF protection, sessions and auto-escaping templates on top.",
        },
      ],
      realWorld: "Instagram's back end started on Django; Flask powers countless internal tools; FastAPI is popular for ML model APIs; all of them are tested with test clients that call the app directly, as we did here.",
      reteach: "A web framework is a restaurant's front desk. Each order slip (request) says what you want (method) and from which menu section (path). The desk looks up which chef handles it (routing), the chef cooks (your view function), and the desk hands back the plate with a receipt (status and headers). WSGI is the standard shape of the order slip, so any desk works with any chef.",
      summary: [
        "WSGI: app(environ, start_response) → iterable of bytes; ASGI is the async version.",
        "Routing maps method+path to views; templates must escape user data (Jinja2/Django do it automatically).",
        "Parse forms with parse_qs, validate server-side, and Post/Redirect/Get with 303.",
      ],
      libraryCode: [{
        title: "The same app in Flask",
        code: `from flask import Flask, request, redirect, render_template_string

app = Flask(__name__)
BOOKS = ["Wings of Fire"]
PAGE = "<h1>Books</h1><ul>{% for b in books %}<li>{{ b }}</li>{% endfor %}</ul>"

@app.get("/")
def home():
    return render_template_string(PAGE, books=BOOKS)      # Jinja2 auto-escapes {{ b }}

@app.post("/books")
def add_book():
    title = request.form.get("title", "").strip()
    if not title:
        return {"error": "title required"}, 400
    BOOKS.append(title)
    return redirect("/", code=303)

# pip install flask  →  flask --app app run --debug   (never use --debug in production)`,
        note: "Run on your own computer. Flask's test client (`app.test_client().get(\"/\")`) calls the app the same way our `call()` helper does.",
      }],
    },

    {
      id: "py-web-apis",
      title: "Sessions, authentication and REST APIs",
      minutes: 18,
      difficulty: 4,
      objectives: [
        "Use cookies and server-side sessions to remember users",
        "Protect routes with authentication and authorisation checks",
        "Design JSON API endpoints and choose between Flask, Django and FastAPI",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "HTTP is stateless. How does a site remember you're logged in between requests?",
        options: [
          { text: "It remembers your IP address", why: "IPs are shared and change." },
          { text: "It sets a cookie holding a random session id (or signed token) the browser sends back", why: "Correct." },
          { text: "It stores your password in the URL", why: "Never." },
        ],
        answer: 1,
        hint: "The browser sends something back each time.",
        explain: "The server issues an unguessable session id in a cookie; each request carries it, and the server looks up who it belongs to.",
      },
      why: "Almost every web app has accounts. Getting sessions and cookies right — secure flags, expiry, server-side checks — is what separates a demo from something you can trust with real users.",
      concept: [
        {
          title: "Cookies and sessions",
          body: `\`\`\`text
Set-Cookie: sid=Xk3…; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600
\`\`\`

- **HttpOnly**: JavaScript can't read it (limits XSS damage). **Secure**: HTTPS only. **SameSite**: blocks most CSRF.
- Store only a random **session id** in the cookie; keep user data on the server (or use a **signed** cookie/JWT whose contents users can read but not change).
- Rotate the session id at login; expire sessions; delete them at logout.`,
        },
        {
          title: "Protecting routes and designing APIs",
          body: `- Authentication middleware/decorators: \`@login_required\`, FastAPI dependencies. Check **authorisation** per object (Module 33).
- JSON APIs: nouns for resources (\`/api/v1/books/42\`), correct status codes, consistent error bodies (\`{"error": {"code": "...", "message": "..."}}\`), pagination, versioning.
- APIs used by other sites need **CORS** headers; APIs for scripts use tokens in the \`Authorization\` header instead of cookies.

| Framework | Style | Strengths |
| --- | --- | --- |
| **Flask** | micro, WSGI | simple, flexible, huge ecosystem |
| **Django** | batteries included | ORM, admin, auth, forms, migrations |
| **FastAPI** | ASGI, type hints | automatic validation and OpenAPI docs, async |`,
        },
      ],
      example: {
        title: "Sessions with secure cookies, and a protected API",
        code: r`import json, secrets
from http.cookies import SimpleCookie

SESSIONS = {}
USERS = {"asha": "tiger-42-stripes"}

def login(username, password):
    if USERS.get(username) != password:
        return 401, {}, {"error": "invalid credentials"}
    sid = secrets.token_urlsafe(24)
    SESSIONS[sid] = {"user": username}
    cookie = SimpleCookie()
    cookie["sid"] = sid
    cookie["sid"].update({"httponly": True, "secure": True, "samesite": "Lax", "path": "/", "max-age": 3600})
    return 200, {"Set-Cookie": cookie["sid"].OutputString()}, {"ok": True}

def current_user(cookie_header):
    jar = SimpleCookie(cookie_header or "")
    session = SESSIONS.get(jar["sid"].value) if "sid" in jar else None
    return session["user"] if session else None

def api_me(cookie_header):
    user = current_user(cookie_header)
    if user is None:
        return 401, {"error": "login required"}
    return 200, {"user": user, "notes": 3}

status, headers, body = login("asha", "wrong")
print(status, body)
status, headers, body = login("asha", "tiger-42-stripes")
set_cookie = headers["Set-Cookie"]
print(status, "HttpOnly" in set_cookie, "Secure" in set_cookie, "SameSite=Lax" in set_cookie)
sid = set_cookie.split(";")[0]
print(api_me(sid))
print(api_me(None))
print(api_me("sid=guessed-value"))
print(json.dumps(api_me(sid)[1]))`,
        output: "401 {'error': 'invalid credentials'}\n200 True True True\n(200, {'user': 'asha', 'notes': 3})\n(401, {'error': 'login required'})\n(401, {'error': 'login required'})\n{\"user\": \"asha\", \"notes\": 3}\n",
        lines: [
          [5, "Demo only: real apps store salted password hashes (Module 33)."],
          [10, "An unguessable random session id."],
          [11, "User data stays on the server; the cookie only carries the id."],
          [14, "Security flags: no JavaScript access, HTTPS only, cross-site requests limited."],
          [18, "Parse the Cookie header the browser sends back."],
          [23, "Every protected endpoint checks the session first."],
          [36, "A guessed or stale session id finds nothing."],
        ],
      },
      mistakes: [
        { title: "Storing user data in plain cookies", body: "Users can edit cookies (`role=admin`). Store an id, or sign the cookie and verify the signature." },
        { title: "Missing cookie flags", body: "Without HttpOnly/Secure/SameSite, XSS and CSRF become much more damaging." },
        { title: "Debug mode in production", body: "Flask/Django debug pages reveal code and settings — and Werkzeug's debugger can execute code." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`from http.cookies import SimpleCookie
jar = SimpleCookie("sid=abc123; theme=dark")
print(sorted(jar), jar["theme"].value)`,
          answer: "['sid', 'theme'] dark\n",
          hint: "A SimpleCookie behaves like a dict of morsels.",
          explain: "Parsing the header gives two cookies; .value is the string value.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Generate an unguessable session id.",
          code: r`import secrets
sid = secrets.___(24)
print(len(sid) >= 32)`,
          blanks: [["token_urlsafe"]],
          output: "True\n",
          hint: "A URL-safe token.",
          explain: "`secrets.token_urlsafe(24)` gives 24 random bytes as ~32 URL-safe characters.",
        },
        {
          id: "b1", kind: "bug", difficulty: 4,
          prompt: "Anyone can become admin by editing their cookie. Which line trusts the client?",
          code: r`from http.cookies import SimpleCookie
SESSIONS = {"s1": {"user": "asha", "role": "viewer"}}
def role_of(cookie_header):
    jar = SimpleCookie(cookie_header)
    return jar["role"].value if "role" in jar else SESSIONS.get(jar["sid"].value, {}).get("role")
print(role_of("sid=s1; role=admin"))`,
          line: 5,
          fix: r`from http.cookies import SimpleCookie
SESSIONS = {"s1": {"user": "asha", "role": "viewer"}}
def role_of(cookie_header):
    jar = SimpleCookie(cookie_header)
    return SESSIONS.get(jar["sid"].value, {}).get("role")
print(role_of("sid=s1; role=admin"))`,
          output: "viewer\n",
          hint: "Where should the role come from?",
          explain: "Permissions must come from server-side session data, never from values the client can edit.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "You need an API with automatic request validation and interactive docs from type hints. Which framework fits best?",
          options: [
            { text: "FastAPI", why: "Correct." },
            { text: "Plain WSGI", why: "You'd build everything yourself." },
            { text: "tkinter", why: "That's a desktop GUI toolkit." },
          ],
          answer: 0,
          hint: "Type hints → validation → OpenAPI.",
          explain: "FastAPI uses type hints and Pydantic to validate requests and generate OpenAPI docs automatically.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Session store with expiry", difficulty: 3,
          prompt: `Implement a \`SessionStore\` with \`create(user, now)\` (returns a new id: use \`f"s{n}"\` with a counter so tests are repeatable — real code uses secrets), \`get(sid, now)\` (the user, or None if missing or older than \`ttl\` seconds; expired sessions are deleted) and \`destroy(sid)\`. TTL is 60. Commands until \`end\`: \`login user t\`, \`get sid t\`, \`logout sid\`, \`count\` (live sessions).`,
          starter: r`class SessionStore:
    def __init__(self, ttl=60):
        pass
`,
          tests: [
            { label: "Lifecycle", input: "login asha 0\nlogin ravi 10\nget s1 30\nget s1 61\nget s2 65\ncount\nlogout s2\nget s2 66\ncount\nend\n", output: "s1\ns2\nasha\nNone\nravi\n1\nNone\n0" },
          ],
          hints: [
            "Store {sid: (user, created_at)}.",
            "In get: if now - created > ttl, delete and return None.",
            "destroy: `self.sessions.pop(sid, None)`.",
            "count = len(self.sessions).",
          ],
          solution: r`class SessionStore:
    def __init__(self, ttl=60):
        self.ttl = ttl
        self.sessions = {}
        self.counter = 0

    def create(self, user, now):
        self.counter += 1
        sid = f"s{self.counter}"
        self.sessions[sid] = (user, now)
        return sid

    def get(self, sid, now):
        entry = self.sessions.get(sid)
        if entry is None:
            return None
        user, created = entry
        if now - created > self.ttl:
            del self.sessions[sid]
            return None
        return user

    def destroy(self, sid):
        self.sessions.pop(sid, None)

store = SessionStore()
while (line := input()) != "end":
    cmd, *args = line.split()
    if cmd == "login":
        print(store.create(args[0], int(args[1])))
    elif cmd == "get":
        print(store.get(args[0], int(args[1])))
    elif cmd == "logout":
        store.destroy(args[0])
    elif cmd == "count":
        print(len(store.sessions))`,
          notes: "Production stores live in Redis or a database so every server process shares them, and ids come from secrets.token_urlsafe. 'Sliding' expiry renews the timestamp on each request.",
        },
        {
          id: "stretch", kind: "task", title: "Versioned JSON API with pagination", difficulty: 4,
          prompt: `Implement \`handle(method, path, query)\` for \`/api/v1/products\`. Products are read first (\`name price\` until \`---\`) and get ids 1, 2, ….
- \`GET /api/v1/products?page=P&per_page=N\` (defaults 1 and 2, per_page max 50) → 200 \`{"items": [...], "page": P, "total": T, "next": P+1 or null}\`
- \`GET /api/v1/products/<id>\` → 200 product or 404 \`{"error": {"code": "not_found", "message": "product <id> not found"}}\`
- bad page/per_page (not positive integers, or per_page > 50) → 400 \`{"error": {"code": "bad_request", "message": "invalid pagination"}}\`
- other paths → 404 code \`no_route\`, message \`no such endpoint\`.
Requests are \`GET path?query\` lines until \`end\`; print \`status json\` (json.dumps).`,
          starter: r`import json
from urllib.parse import urlsplit, parse_qs
`,
          tests: [
            { label: "API", input: "pen 10\nbook 250\nlamp 899\n---\nGET /api/v1/products\nGET /api/v1/products?page=2\nGET /api/v1/products?per_page=5\nGET /api/v1/products/2\nGET /api/v1/products/9\nGET /api/v1/products?page=0\nGET /api/v2/products\nend\n", output: "200 {\"items\": [{\"id\": 1, \"name\": \"pen\", \"price\": 10}, {\"id\": 2, \"name\": \"book\", \"price\": 250}], \"page\": 1, \"total\": 3, \"next\": 2}\n200 {\"items\": [{\"id\": 3, \"name\": \"lamp\", \"price\": 899}], \"page\": 2, \"total\": 3, \"next\": null}\n200 {\"items\": [{\"id\": 1, \"name\": \"pen\", \"price\": 10}, {\"id\": 2, \"name\": \"book\", \"price\": 250}, {\"id\": 3, \"name\": \"lamp\", \"price\": 899}], \"page\": 1, \"total\": 3, \"next\": null}\n200 {\"id\": 2, \"name\": \"book\", \"price\": 250}\n404 {\"error\": {\"code\": \"not_found\", \"message\": \"product 9 not found\"}}\n400 {\"error\": {\"code\": \"bad_request\", \"message\": \"invalid pagination\"}}\n404 {\"error\": {\"code\": \"no_route\", \"message\": \"no such endpoint\"}}" },
          ],
          hints: [
            "`parts = urlsplit(target)`; `query = parse_qs(parts.query)`.",
            "Write an `error(status, code, message)` helper returning (status, body).",
            "Slice: `items[(page-1)*per:(page)*per]`; next exists if page*per < total.",
            "Validate with isdigit() and > 0.",
          ],
          solution: r`import json
from urllib.parse import urlsplit, parse_qs

PRODUCTS = []
while (line := input()) != "---":
    name, price = line.split()
    PRODUCTS.append({"id": len(PRODUCTS) + 1, "name": name, "price": int(price)})

def error(status, code, message):
    return status, {"error": {"code": code, "message": message}}

def handle(method, path, query):
    parts = path.strip("/").split("/")
    if method != "GET" or parts[:3] != ["api", "v1", "products"]:
        return error(404, "no_route", "no such endpoint")
    if len(parts) == 4:
        pid = parts[3]
        for p in PRODUCTS:
            if pid.isdigit() and p["id"] == int(pid):
                return 200, p
        return error(404, "not_found", f"product {pid} not found")
    if len(parts) != 3:
        return error(404, "no_route", "no such endpoint")
    page_text = query.get("page", ["1"])[0]
    per_text = query.get("per_page", ["2"])[0]
    if not (page_text.isdigit() and per_text.isdigit()) or int(page_text) < 1 or not 1 <= int(per_text) <= 50:
        return error(400, "bad_request", "invalid pagination")
    page, per = int(page_text), int(per_text)
    items = PRODUCTS[(page - 1) * per: page * per]
    nxt = page + 1 if page * per < len(PRODUCTS) else None
    return 200, {"items": items, "page": page, "total": len(PRODUCTS), "next": nxt}

while (line := input()) != "end":
    method, target = line.split()
    url = urlsplit(target)
    status, body = handle(method, url.path, parse_qs(url.query))
    print(status, json.dumps(body))`,
          notes: "Consistent error objects, sensible defaults, limits on page size and a version prefix are what make an API pleasant (and safe) for other developers. FastAPI would validate the query parameters from type hints.",
        },
      ],
      realWorld: "Django's session framework and Flask-Login implement exactly this; Stripe's API is famous for consistent error objects and versioning; FastAPI generates OpenAPI docs that front-end teams use to build clients.",
      reteach: "A session cookie is a cloakroom ticket. The cloakroom (server) keeps your coat (your data); you only carry a numbered ticket (session id). Nobody can claim your coat by guessing a number if tickets are long random strings — and the ticket is useless after closing time (expiry).",
      summary: [
        "Cookies carry a random session id (HttpOnly, Secure, SameSite); data stays server-side.",
        "Check authentication and per-object authorisation on every protected route; never trust client-side values.",
        "JSON APIs: resource URLs, correct status codes, consistent errors, pagination, versioning. Flask = micro, Django = batteries, FastAPI = typed async APIs.",
      ],
      libraryCode: [{
        title: "A typed API in FastAPI",
        code: `from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel

app = FastAPI()

class Product(BaseModel):
    id: int
    name: str
    price: int

PRODUCTS = [Product(id=1, name="pen", price=10), Product(id=2, name="book", price=250)]

@app.get("/api/v1/products")
def list_products(page: int = Query(1, ge=1), per_page: int = Query(2, ge=1, le=50)):
    start = (page - 1) * per_page
    return {"items": PRODUCTS[start:start + per_page], "page": page, "total": len(PRODUCTS)}

@app.get("/api/v1/products/{pid}")
def get_product(pid: int) -> Product:
    for p in PRODUCTS:
        if p.id == pid:
            return p
    raise HTTPException(404, f"product {pid} not found")

# pip install "fastapi[standard]"  →  fastapi dev main.py  → open http://127.0.0.1:8000/docs`,
        note: "Run on your own computer. The query validation (ge=1, le=50) replaces the hand-written checks in the exercise, and /docs shows interactive documentation.",
      }],
    },
  ],
  exam: [
    {
      id: "e1", kind: "mcq", difficulty: 3,
      prompt: "Which cookie flag stops JavaScript on the page from reading the session cookie?",
      options: [
        { text: "Secure", why: "That restricts it to HTTPS." },
        { text: "HttpOnly", why: "Correct." },
        { text: "Path=/", why: "That sets which URLs receive it." },
      ],
      answer: 1,
      hint: "HTTP only — not scripts.",
      explain: "HttpOnly cookies are sent with requests but invisible to document.cookie.",
    },
    {
      id: "e2", kind: "predict", difficulty: 3,
      code: r`import html
from string import Template
t = Template("<p>$msg</p>")
print(t.substitute(msg=html.escape("1 < 2 & 3 > 2")))`,
      answer: "<p>1 &lt; 2 &amp; 3 &gt; 2</p>\n",
      hint: "Escape before substituting.",
      explain: "html.escape converts < & > into entities, then the template inserts the safe text.",
    },
    {
      id: "e3", kind: "fill", difficulty: 3,
      prompt: "Status code that sends the browser to another page with a GET after a form POST.",
      code: r`status = "___ See Other"
print(status)`,
      blanks: [["303"]],
      output: "303 See Other\n",
      hint: "Three hundred and three.",
      explain: "303 See Other tells the client to GET the Location URL.",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: a to-do web app (tested with a WSGI client)", difficulty: 4,
    prompt: `Build a small to-do app as a WSGI application with sessions. Requests are lines \`METHOD PATH [COOKIE] [BODY]\` — use \`-\` for no cookie (until \`end\`). Print \`<status> <body>\`.

- \`POST /login\` body \`user=<name>\` (any name of 3–20 letters) → 200 body \`ok\`, plus print a second line \`cookie <sid>\` with the session id (\`s1\`, \`s2\`, … for repeatable tests)
- \`GET /todos\` → 200 with the user's todos as \`1. text [done]\` lines joined by \` | \`, or \`(empty)\`; 401 \`login required\` without a valid session
- \`POST /todos\` body \`text=<…>\` (1–80 chars) → 201 \`added <n>\`; 400 \`invalid text\`
- \`POST /todos/<n>/done\` → 200 \`done <n>\`; 404 \`no such todo\`
- \`POST /logout\` → 200 \`bye\` and the session is deleted
- anything else → 404 \`not found\`
Each user sees only their own todos. Escape nothing (plain-text responses) but never trust the cookie beyond looking up the session.`,
    starter: r`import io
from urllib.parse import parse_qs

def app(environ, start_response):
    pass
`,
    tests: [
      { label: "Two users", input: "GET /todos -\nPOST /login - user=asha\nPOST /todos s1 text=Buy+milk\nPOST /todos s1 text=Revise+Python\nPOST /todos/2/done s1\nGET /todos s1\nPOST /login - user=ravi\nGET /todos s2\nPOST /todos/1/done s2\nPOST /todos s2 text=\nPOST /logout s1\nGET /todos s1\nGET /admin s2\nend\n", output: "401 login required\n200 ok\ncookie s1\n201 added 1\n201 added 2\n200 done 2\n200 1. Buy milk | 2. Revise Python [done]\n200 ok\ncookie s2\n200 (empty)\n404 no such todo\n400 invalid text\n200 bye\n401 login required\n404 not found" },
    ],
    hints: [
      "Pass the cookie in environ as HTTP_COOKIE (value `sid=<id>`), like a real server would.",
      "Keep SESSIONS = {sid: user} and TODOS = {user: [[text, done], …]}.",
      "Route with `path.strip(\"/\").split(\"/\")`.",
      "For login, return the sid in a Set-Cookie header and have the caller print it.",
    ],
    solution: r`import io, re
from urllib.parse import parse_qs

SESSIONS, TODOS = {}, {}
counter = 0

def app(environ, start_response):
    global counter
    size = int(environ.get("CONTENT_LENGTH") or 0)
    form = parse_qs(environ["wsgi.input"].read(size).decode(), keep_blank_values=True)
    cookie = environ.get("HTTP_COOKIE", "")
    user = SESSIONS.get(cookie.removeprefix("sid=")) if cookie.startswith("sid=") else None
    method, parts = environ["REQUEST_METHOD"], environ["PATH_INFO"].strip("/").split("/")
    headers = [("Content-Type", "text/plain")]

    if (method, parts) == ("POST", ["login"]):
        name = form.get("user", [""])[0]
        if not re.fullmatch(r"[A-Za-z]{3,20}", name):
            status, body = "400 Bad Request", "invalid user"
        else:
            counter += 1
            sid = f"s{counter}"
            SESSIONS[sid] = name
            TODOS.setdefault(name, [])
            headers.append(("Set-Cookie", f"sid={sid}; HttpOnly; SameSite=Lax"))
            status, body = "200 OK", "ok"
    elif parts[0] in ("todos", "logout") and user is None:
        status, body = "401 Unauthorized", "login required"
    elif (method, parts) == ("GET", ["todos"]):
        lines = [f"{i}. {t}" + (" [done]" if d else "") for i, (t, d) in enumerate(TODOS[user], 1)]
        status, body = "200 OK", " | ".join(lines) or "(empty)"
    elif (method, parts) == ("POST", ["todos"]):
        text = form.get("text", [""])[0].strip()
        if not 1 <= len(text) <= 80:
            status, body = "400 Bad Request", "invalid text"
        else:
            TODOS[user].append([text, False])
            status, body = "201 Created", f"added {len(TODOS[user])}"
    elif method == "POST" and len(parts) == 3 and parts[0] == "todos" and parts[2] == "done":
        n = int(parts[1]) if parts[1].isdigit() else 0
        if 1 <= n <= len(TODOS[user]):
            TODOS[user][n - 1][1] = True
            status, body = "200 OK", f"done {n}"
        else:
            status, body = "404 Not Found", "no such todo"
    elif (method, parts) == ("POST", ["logout"]):
        SESSIONS.pop(cookie.removeprefix("sid="), None)
        status, body = "200 OK", "bye"
    else:
        status, body = "404 Not Found", "not found"
    start_response(status, headers)
    return [body.encode()]

def call(method, path, cookie, body):
    data = body.encode()
    environ = {"REQUEST_METHOD": method, "PATH_INFO": path, "CONTENT_LENGTH": str(len(data)), "wsgi.input": io.BytesIO(data)}
    if cookie != "-":
        environ["HTTP_COOKIE"] = f"sid={cookie}"
    seen = {}
    chunks = app(environ, lambda status, headers: seen.update(status=status, headers=headers))
    return seen["status"], b"".join(chunks).decode(), dict(seen["headers"])

while (line := input()) != "end":
    method, path, cookie, *rest = line.split(" ", 3)
    status, body, headers = call(method, path, cookie, rest[0] if rest else "")
    print(status.split()[0], body)
    if "Set-Cookie" in headers:
        print("cookie", headers["Set-Cookie"].split(";")[0].removeprefix("sid="))`,
    notes: "The app logic is complete and testable, but it is not production-ready: there are no passwords or real authentication, ids are predictable (use secrets), data lives in memory, there's no CSRF protection, and it needs HTTPS, a real WSGI server (gunicorn) and a database before anyone else uses it.",
  },
};
