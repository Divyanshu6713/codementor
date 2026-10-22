import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 39 — Desktop GUI applications (specialist path). */
export const M39: PyModuleDef = {
  id: "py-gui",
  number: 39,
  level: 5,
  title: "Desktop GUI Applications",
  summary: "Event-driven programming; the event loop and callbacks; widgets, layout and state; keeping logic separate from the interface (MVC/MVP); validating input; state machines for UI; timers; tkinter, Qt (PySide6) and Kivy overview; packaging desktop apps.",
  track: "specialist",
  optionalNote: "For people building desktop tools (school utilities, shop billing, lab software). The sandbox has no screen, so you'll build and test the app logic here; the tkinter/Qt window code runs on your own computer.",
  prereqs: ["py-security"],
  lessons: [
    {
      id: "py-gui-events",
      title: "Event-driven programming",
      minutes: 17,
      difficulty: 3,
      objectives: [
        "Explain the event loop and callbacks",
        "Keep application state separate from widgets",
        "Simulate and test event handling without a screen",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "In a GUI app, when does your `on_click` function run?",
        options: [
          { text: "Immediately when the program starts", why: "It's only registered at start." },
          { text: "Whenever the event loop sees a click on that button and calls it", why: "Correct: it's a callback." },
          { text: "In a loop you write yourself, every second", why: "The toolkit's event loop does the waiting." },
        ],
        answer: 1,
        hint: "Don't call us, we'll call you.",
        explain: "You register callbacks; the toolkit's event loop waits for events and calls the matching function.",
      },
      why: "Console programs run top to bottom. GUI programs mostly wait — for clicks, key presses and timers — and react. That inversion of control is the heart of every desktop and mobile app (and of web front ends too).",
      concept: [
        {
          title: "The event loop",
          body: `\`\`\`python
root = tk.Tk()
button = tk.Button(root, text="Add", command=on_add)   # register a callback
root.mainloop()                                          # wait for events forever
\`\`\`

\`mainloop()\` repeatedly takes the next event (click, key, redraw, timer) and dispatches it to the registered handler. A handler that runs for a long time **freezes the window** — no redraws or clicks are processed until it returns. Long work goes to a thread or is split up with timers (\`root.after(ms, fn)\`).`,
        },
        {
          title: "State lives outside the widgets",
          body: `Keep the data (cart items, score, settings) in plain Python objects; widgets only **display** it and **send** user actions to it. Then:

- the logic can be tested without a screen,
- the same logic can get a different interface (web, mobile, CLI),
- bugs are easier to find, because there's one source of truth.`,
        },
      ],
      example: {
        title: "A tiny event loop with handlers (no screen needed)",
        code: r`from collections import deque

class Counter:
    """The app's state and rules — knows nothing about buttons."""
    def __init__(self, limit):
        self.value, self.limit = 0, limit
    def increment(self):
        if self.value < self.limit:
            self.value += 1
    def reset(self):
        self.value = 0

class FakeLoop:
    """Plays the role of tkinter's mainloop: queue events, dispatch to handlers."""
    def __init__(self):
        self.handlers, self.events = {}, deque()
    def bind(self, event, handler):
        self.handlers.setdefault(event, []).append(handler)
    def post(self, event):
        self.events.append(event)
    def run(self):
        while self.events:
            event = self.events.popleft()
            for handler in self.handlers.get(event, []):
                handler()

counter = Counter(limit=3)
label = {"text": ""}
def render():
    label["text"] = f"Count: {counter.value}" + (" (max)" if counter.value == counter.limit else "")
    print(label["text"])

loop = FakeLoop()
loop.bind("click:+", counter.increment)
loop.bind("click:+", render)
loop.bind("click:reset", counter.reset)
loop.bind("click:reset", render)
for e in ["click:+", "click:+", "click:+", "click:+", "click:reset", "key:x"]:
    loop.post(e)
loop.run()`,
        output: "Count: 1\nCount: 2\nCount: 3 (max)\nCount: 3 (max)\nCount: 0\n",
        lines: [
          [3, "The model: state and rules, no GUI code at all."],
          [13, "A stand-in for the toolkit's event loop."],
          [17, "bind registers callbacks for an event name (like command= or widget.bind)."],
          [21, "run takes events in order and calls every handler bound to them."],
          [29, "The view: turns state into what the user sees."],
          [34, "Two handlers per click: update the model, then re-render."],
          [38, "The fourth click is ignored by the model's rule (limit 3); key:x has no handler."],
        ],
      },
      mistakes: [
        { title: "Calling the handler instead of passing it", body: "`Button(command=on_add())` runs on_add once at start and passes its result. Pass the function: `command=on_add`." },
        { title: "Long work in a handler", body: "A 10-second download in on_click freezes the window. Use a thread or async task and update the UI when done." },
        { title: "State stored in widgets", body: "Reading numbers back out of labels gets messy fast. Keep a model object and render from it." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`calls = []
def on_save():
    calls.append("saved")
    return "done"
button_a = {"command": on_save}
button_b = {"command": on_save()}
print(calls, callable(button_a["command"]), button_b["command"])`,
          answer: "['saved'] True done\n",
          hint: "Which line calls on_save right away?",
          explain: "button_b stores the RESULT of calling on_save immediately ('done'), and that call already appended 'saved'. button_a stores the function itself.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Register the function (not its result) as the click handler.",
          code: r`handlers = {}
def greet():
    print("Hello!")
handlers["click"] = ___
handlers["click"]()`,
          blanks: [["greet"]],
          output: "Hello!\n",
          hint: "No parentheses.",
          explain: "Store `greet` itself; the loop calls it later with ().",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "The label should show the updated total after each click, but it's stuck at 0. Which line forgets to re-render?",
          code: r`total = {"value": 0}
label = {"text": "Total: 0"}
def render():
    label["text"] = f"Total: {total['value']}"
def add_ten():
    total["value"] += 10
for _ in range(3):
    add_ten()
print(label["text"])`,
          line: 6,
          fix: r`total = {"value": 0}
label = {"text": "Total: 0"}
def render():
    label["text"] = f"Total: {total['value']}"
def add_ten():
    total["value"] += 10
    render()
for _ in range(3):
    add_ten()
print(label["text"])`,
          output: "Total: 30\n",
          hint: "The model changes, but does the view know?",
          explain: "After changing state, the view must be refreshed (or observe the model).",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "Your 'Export' button runs a 30-second job and the window shows 'Not responding'. Why?",
          options: [
            { text: "The event loop is stuck inside your handler, so it can't process redraws or clicks", why: "Correct." },
            { text: "Exports always crash GUIs", why: "Not inherently." },
            { text: "The button is too small", why: "Size is irrelevant." },
          ],
          answer: 0,
          hint: "One thread, one loop.",
          explain: "Handlers run on the UI thread. Move long work to a thread/async task and post the result back to the UI.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Calculator model driven by events", difficulty: 3,
          prompt: `Write a \`Calculator\` model with handlers \`press_digit(d)\`, \`press_op(op)\` (\`+ - * /\`), \`press_equals()\` and \`press_clear()\`, and a \`display\` property (string). Rules: digits build the current number (no leading zeros except "0"); pressing an operator first finishes any pending operation (after \`9 * 3 -\` the stored number is 27), then stores the number and resets the display to \`0\`; equals computes left-to-right (whole-number results shown without .0); division by zero shows \`Error\`, and every key except \`C\` is ignored until clear. Input is a sequence of key events (one per line, until \`end\`); print the display after each event.`,
          starter: r`class Calculator:
    def __init__(self):
        pass
`,
          tests: [
            { label: "12+7=", input: "1\n2\n+\n7\n=\nend\n", output: "1\n12\n0\n7\n19" },
            { label: "Chain and divide by zero", input: "9\n*\n3\n-\n4\n=\n/\n0\n=\n5\nC\n0\n0\n8\nend\n", output: "9\n0\n3\n0\n4\n23\n0\n0\nError\nError\n0\n0\n0\n8", hidden: true },
          ],
          hints: [
            "Keep `current` (string being typed), `stored` (number) and `op`.",
            "On an operator: if there's a pending op, compute it first (left-to-right).",
            "Format results: `int(x)` if x is a whole number.",
            "Map events: digits → press_digit, 'C' → clear, '=' → equals, else press_op.",
          ],
          solution: r`class Calculator:
    def __init__(self):
        self.press_clear()

    def press_clear(self):
        self.current, self.stored, self.op, self.error = "0", None, None, False

    def press_digit(self, d):
        if self.error:
            return
        self.current = d if self.current == "0" else self.current + d

    def _apply(self):
        a, b = self.stored, float(self.current)
        if self.op == "/" and b == 0:
            self.error = True
            return
        result = {"+": a + b, "-": a - b, "*": a * b, "/": a / b if b else 0}[self.op]
        self.current = str(int(result)) if result == int(result) else str(result)

    def press_op(self, op):
        if self.error:
            return
        if self.op is not None:
            self._apply()
            if self.error:
                return
        self.stored, self.op = float(self.current), op
        self.current = "0"

    def press_equals(self):
        if self.error or self.op is None:
            return
        self._apply()
        self.op, self.stored = None, None

    @property
    def display(self):
        return "Error" if self.error else self.current

calc = Calculator()
while (key := input()) != "end":
    if key.isdigit():
        calc.press_digit(key)
    elif key == "C":
        calc.press_clear()
    elif key == "=":
        calc.press_equals()
    else:
        calc.press_op(key)
    print(calc.display)`,
          notes: "Because the calculator is a plain class, every rule is testable from a list of key presses. Wiring it to tkinter buttons is then just `command=lambda d=d: (calc.press_digit(d), refresh())` for each button.",
        },
        {
          id: "stretch", kind: "task", title: "Timer events without freezing", difficulty: 4,
          prompt: `GUIs schedule work with timers (\`root.after(ms, fn)\`) instead of sleeping. Simulate this: a \`Scheduler\` with \`after(ms, fn)\` and \`run_until(t)\` that runs due callbacks in time order (ties in scheduling order), advancing a fake clock. Build a **countdown**: \`start(n)\` shows \`n\` and schedules a tick every 1000 ms that decrements and shows the value; at 0 show \`Time's up!\` and stop; \`pause()\` cancels the pending tick; \`resume()\` schedules it again. Input: a starting number, then commands \`at <ms> start|pause|resume\` until \`end\` (sorted by time). Print \`<ms>: <display>\` each time the display changes. Run until 20000 ms.`,
          starter: r`import heapq, itertools
`,
          tests: [
            { label: "Pause and resume", input: "3\nat 0 start\nat 1500 pause\nat 4000 resume\nend\n", output: "0: 3\n1000: 2\n1500: 2 (paused)\n4000: 2\n5000: 1\n6000: Time's up!" },
          ],
          hints: [
            "Keep a heap of (time, seq, fn); seq from itertools.count() breaks ties.",
            "Commands are just scheduled callbacks too: `sched.after(ms - sched.now, command)`.",
            "Cancel by remembering the pending tick's id and ignoring it when popped (a cancelled set).",
            "show() prints only when the text changes.",
          ],
          solution: r`import heapq, itertools

class Scheduler:
    def __init__(self):
        self.now, self.queue, self.seq, self.cancelled = 0, [], itertools.count(), set()
    def after(self, ms, fn):
        job = next(self.seq)
        heapq.heappush(self.queue, (self.now + ms, job, fn))
        return job
    def cancel(self, job):
        self.cancelled.add(job)
    def run_until(self, t):
        while self.queue and self.queue[0][0] <= t:
            self.now, job, fn = heapq.heappop(self.queue)
            if job not in self.cancelled:
                fn()
        self.now = t

class Countdown:
    def __init__(self, sched):
        self.sched, self.value, self.pending, self.text = sched, 0, None, None
    def show(self, text):
        if text != self.text:
            self.text = text
            print(f"{self.sched.now}: {text}")
    def start(self, n):
        self.value = n
        self.show(str(n))
        self.pending = self.sched.after(1000, self.tick)
    def tick(self):
        self.value -= 1
        if self.value == 0:
            self.show("Time's up!")
            self.pending = None
        else:
            self.show(str(self.value))
            self.pending = self.sched.after(1000, self.tick)
    def pause(self):
        if self.pending is not None:
            self.sched.cancel(self.pending)
            self.pending = None
            self.show(f"{self.value} (paused)")
    def resume(self):
        if self.pending is None and self.value > 0:
            self.show(str(self.value))
            self.pending = self.sched.after(1000, self.tick)

sched = Scheduler()
cd = Countdown(sched)
n = int(input())
while (line := input()) != "end":
    _, ms, cmd = line.split()
    action = {"start": lambda: cd.start(n), "pause": cd.pause, "resume": cd.resume}[cmd]
    sched.after(int(ms), action)
sched.run_until(20000)`,
          notes: "This is exactly how tkinter's `after` and Qt's `QTimer` keep apps responsive: nothing sleeps; the loop wakes callbacks when they're due. A real timer would also account for drift using the actual clock.",
        },
      ],
      realWorld: "Billing software in shops, lab instrument control panels and school timetable tools are classic Python desktop apps; the same event-driven model powers Android, iOS and browser front ends.",
      reteach: "A GUI app is a receptionist at a front desk. They don't wander around doing tasks in a fixed order — they wait for the phone or the doorbell (events) and follow the instruction card pinned for each (callbacks). If one visitor keeps them busy for 10 minutes, the phone rings unanswered: that's a frozen window.",
      summary: [
        "The event loop waits for events and calls registered callbacks; pass functions, don't call them.",
        "Keep state in model objects; widgets display and forward actions; re-render after changes.",
        "Never block the loop: use timers (after/QTimer) and threads for long work.",
      ],
      libraryCode: [{
        title: "The counter as a real tkinter window",
        code: `import tkinter as tk

counter = Counter(limit=3)                      # the model from the lesson
root = tk.Tk()
root.title("Counter")
label = tk.Label(root, font=("Segoe UI", 20))
def render():
    label.config(text=f"Count: {counter.value}")
def on_plus():
    counter.increment(); render()
def on_reset():
    counter.reset(); render()
label.pack(padx=20, pady=10)
tk.Button(root, text="+1", command=on_plus).pack(side="left", padx=10, pady=10)
tk.Button(root, text="Reset", command=on_reset).pack(side="right", padx=10, pady=10)
render()
root.mainloop()`,
        note: "tkinter ships with most Python installs on Windows/macOS (Linux may need `sudo apt install python3-tk`). The sandbox blocks GUI toolkits because there's no screen.",
      }],
    },

    {
      id: "py-gui-architecture",
      title: "Forms, validation and app structure",
      minutes: 17,
      difficulty: 4,
      objectives: [
        "Structure GUI apps with model, view and controller roles",
        "Validate form input and give helpful feedback",
        "Model screens and modes as a state machine; choose a toolkit and package the app",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "When should a form tell the user that 'phone number must have 10 digits'?",
        options: [
          { text: "Only after the whole app crashes", why: "Never let bad input crash the app." },
          { text: "Near the field, as soon as they leave it or press Save, with the Save button blocked until fixed", why: "Correct." },
          { text: "In a log file the user never sees", why: "The user needs to know what to fix." },
        ],
        answer: 1,
        hint: "Clear, close, timely.",
        explain: "Good forms validate early, show messages next to the field, and prevent saving invalid data.",
      },
      why: "Desktop tools are mostly forms and screens: enter data, validate it, save it, move between views. Clear structure (who owns the data, who draws, who decides) and clear rules for states (editing, saving, error) are what keep these apps from turning into spaghetti.",
      concept: [
        {
          title: "Model, view, controller",
          body: `- **Model**: data and rules (an Invoice with line items, totals, validation).
- **View**: widgets that show the model and capture input.
- **Controller / presenter**: receives user actions, calls the model, tells the view what to show.

The model and controller are plain Python and fully testable; the view is thin. Qt formalises this with signals/slots and model/view classes.`,
        },
        {
          title: "Validation and feedback",
          body: `Validate per field (format, range, required) and per form (end date after start date). Collect **all** errors at once, show each next to its field, disable Save while invalid, and never lose what the user typed. Accessibility: label every input, support the keyboard, don't rely on colour alone.`,
        },
        {
          title: "State machines, toolkits and packaging",
          body: `A UI is often in one of a few **states** (idle → editing → saving → saved / error). Writing allowed transitions as a table prevents impossible combinations like "saving while already saving".

| Toolkit | Notes |
| --- | --- |
| **tkinter** | built in, simple, great for small tools |
| **PySide6 / PyQt6** | professional desktop apps, rich widgets, Qt Designer |
| **Kivy / BeeWare (Toga)** | touch and mobile-friendly |
| **Web UI** (Flask/FastAPI + browser, or Streamlit) | often simplest to share |

Package for users with **PyInstaller** (\`pyinstaller --onefile --windowed app.py\`) or Briefcase.`,
        },
      ],
      example: {
        title: "A validated form with a state machine",
        code: r`import re

TRANSITIONS = {
    ("idle", "edit"): "editing",
    ("editing", "edit"): "editing",
    ("editing", "save"): "saving",
    ("saving", "ok"): "saved",
    ("saving", "fail"): "error",
    ("error", "edit"): "editing",
    ("saved", "edit"): "editing",
}

class ContactForm:
    def __init__(self):
        self.state = "idle"
        self.fields = {"name": "", "phone": "", "age": ""}
    def fire(self, event):
        new = TRANSITIONS.get((self.state, event))
        if new is None:
            return f"ignored '{event}' while {self.state}"
        self.state = new
        return self.state
    def errors(self):
        errs = {}
        if not self.fields["name"].strip():
            errs["name"] = "required"
        if not re.fullmatch(r"[6-9]\d{9}", self.fields["phone"]):
            errs["phone"] = "10 digits, starting 6-9"
        if not (self.fields["age"].isdigit() and 1 <= int(self.fields["age"]) <= 120):
            errs["age"] = "1-120"
        return errs
    def edit(self, field, value):
        self.fields[field] = value
        return self.fire("edit")
    def save(self):
        if self.errors():
            return "save blocked: " + ", ".join(f"{k} ({v})" for k, v in self.errors().items())
        return self.fire("save")

form = ContactForm()
print(form.save())
print(form.edit("name", "Asha"), form.edit("phone", "12345"))
print(form.save())
form.edit("phone", "9876543210"); form.edit("age", "34")
print(form.save(), "->", form.fire("ok"))
print(form.fire("ok"))`,
        output: "save blocked: name (required), phone (10 digits, starting 6-9), age (1-120)\nediting editing\nsave blocked: phone (10 digits, starting 6-9), age (1-120)\nsaving -> saved\nignored 'ok' while saved\n",
        lines: [
          [3, "Allowed transitions as data: (current state, event) → next state."],
          [13, "The form model: state + field values, no widgets."],
          [18, "Events that aren't allowed in the current state are ignored, not half-applied."],
          [24, "Validation collects every error at once, keyed by field."],
          [27, "Indian mobile numbers: 10 digits starting 6–9."],
          [36, "Save is blocked while there are errors — the view would show each message by its field."],
          [45, "With valid data, saving moves through saving → saved."],
          [46, "'ok' again is meaningless in the saved state, so it's ignored."],
        ],
      },
      mistakes: [
        { title: "Validating only on save, one error at a time", body: "Users fix one thing, press Save, get another error… Show all problems together, near their fields." },
        { title: "Clearing the form on error", body: "Losing typed input is infuriating. Keep values and highlight what to fix." },
        { title: "Boolean flag soup", body: "is_saving, is_saved, has_error… can contradict each other. One `state` variable with defined transitions can't." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`T = {("off", "press"): "on", ("on", "press"): "off", ("on", "hold"): "dim"}
state = "off"
for event in ["press", "hold", "hold", "press"]:
    state = T.get((state, event), state)
print(state)`,
          answer: "dim\n",
          hint: "Unknown (state, event) pairs keep the state.",
          explain: "off → on (press) → dim (hold) → dim (hold has no rule in dim) → dim (press has no rule in dim).",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Check that the PIN code is exactly 6 digits.",
          code: r`import re
for pin in ["452001", "45200", "45200a"]:
    print(pin, bool(re.___(r"\d{6}", pin)))`,
          blanks: [["fullmatch"]],
          output: "452001 True\n45200 False\n45200a False\n",
          hint: "The whole string must match.",
          explain: "`re.fullmatch` requires the entire value to match the pattern.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "The form reports only the first problem, so users fix fields one at a time. Which line stops collecting errors too early?",
          code: r`def validate(fields):
    errors = []
    for name, value in fields.items():
        if not value:
            return [f"{name} is required"]
    return errors
print(validate({"name": "", "email": "", "city": "Pune"}))`,
          line: 5,
          fix: r`def validate(fields):
    errors = []
    for name, value in fields.items():
        if not value:
            errors.append(f"{name} is required")
    return errors
print(validate({"name": "", "email": "", "city": "Pune"}))`,
          output: "['name is required', 'email is required']\n",
          hint: "return exits the loop immediately.",
          explain: "Append each error and return the full list after the loop.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "You need a professional desktop app with tables, menus, dialogs and a visual designer. Which toolkit fits best?",
          options: [
            { text: "PySide6 (Qt)", why: "Correct." },
            { text: "print() and input()", why: "That's a console app." },
            { text: "turtle", why: "A teaching graphics library." },
          ],
          answer: 0,
          hint: "Industrial-strength desktop toolkit.",
          explain: "Qt (via PySide6/PyQt6) provides rich widgets, model/view tables and Qt Designer.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Registration form validator", difficulty: 3,
          prompt: `Validate a sign-up form given as \`field=value\` lines until \`end\`. Rules: \`name\` required (2–40 chars after stripping); \`email\` like \`x@y.z\` (no spaces); \`password\` ≥ 8 chars with a letter and a digit; \`confirm\` equals password; \`age\` integer 13–100. Print each problem as \`field: message\` in the order name, email, password, confirm, age (messages: \`required\`, \`invalid email\`, \`weak password\`, \`does not match\`, \`must be 13-100\`), or \`Saved!\` if none. Missing fields count as empty.`,
          starter: r`import re
`,
          tests: [
            { label: "Errors", input: "name= A\nemail=asha@mail\npassword=secret\nconfirm=secret1\nage=9\nend\n", output: "name: required\nemail: invalid email\npassword: weak password\nconfirm: does not match\nage: must be 13-100" },
            { label: "Valid", input: "name=Asha Rao\nemail=asha@example.in\npassword=monsoon26\nconfirm=monsoon26\nage=19\nend\n", output: "Saved!", hidden: true },
          ],
          hints: [
            "Read into a dict with partition('='); use .get(field, '').",
            "Write one check per field returning a message or None.",
            "Password: `len(p) >= 8 and re.search(r\"[A-Za-z]\", p) and re.search(r\"\\d\", p)`.",
            "Name: 2–40 chars after strip, else 'required'.",
          ],
          solution: r`import re

form = {}
while (line := input()) != "end":
    key, _, value = line.partition("=")
    form[key] = value

def check(form):
    name, email = form.get("name", "").strip(), form.get("email", "")
    pw, confirm, age = form.get("password", ""), form.get("confirm", ""), form.get("age", "")
    problems = []
    if not 2 <= len(name) <= 40:
        problems.append("name: required")
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
        problems.append("email: invalid email")
    if not (len(pw) >= 8 and re.search(r"[A-Za-z]", pw) and re.search(r"\d", pw)):
        problems.append("password: weak password")
    if confirm != pw:
        problems.append("confirm: does not match")
    if not (age.isdigit() and 13 <= int(age) <= 100):
        problems.append("age: must be 13-100")
    return problems

problems = check(form)
print("\n".join(problems) if problems else "Saved!")`,
          notes: "In a real GUI each message would appear under its field, and the Save button would stay disabled until `check(form)` returns an empty list.",
        },
        {
          id: "stretch", kind: "task", title: "Screen navigation state machine", difficulty: 4,
          prompt: `An app has screens \`login\`, \`home\`, \`settings\`, \`editor\`. Transitions: login --ok--> home; home --open_settings--> settings; home --new_doc--> editor; settings --back--> home; editor --back--> home **only if there are no unsaved changes** (otherwise stay and show \`unsaved changes!\`); editor --type--> editor (marks unsaved); editor --save--> editor (clears unsaved); any screen --logout--> login (from editor only when saved). Read events until \`end\`; print \`<event>: <screen>\` (with \` (unsaved)\` when in the editor with unsaved changes) or \`<event>: not allowed on <screen>\`, or \`<event>: unsaved changes!\`.`,
          starter: r`class App:
    def __init__(self):
        self.screen = "login"
        self.unsaved = False
`,
          tests: [
            { label: "Session", input: "new_doc\nok\nnew_doc\ntype\nback\nlogout\nsave\nback\nopen_settings\nback\nlogout\nend\n", output: "new_doc: not allowed on login\nok: home\nnew_doc: editor\ntype: editor (unsaved)\nback: unsaved changes!\nlogout: unsaved changes!\nsave: editor\nback: home\nopen_settings: settings\nback: home\nlogout: login" },
          ],
          hints: [
            "A dict of (screen, event) → next screen for the simple cases.",
            "Handle the guarded transitions (back/logout from editor) before the table.",
            "'type' sets unsaved; 'save' clears it.",
            "Describe the screen with a helper that adds ' (unsaved)'.",
          ],
          solution: r`class App:
    SIMPLE = {
        ("login", "ok"): "home",
        ("home", "open_settings"): "settings",
        ("home", "new_doc"): "editor",
        ("settings", "back"): "home",
        ("home", "logout"): "login",
        ("settings", "logout"): "login",
    }

    def __init__(self):
        self.screen = "login"
        self.unsaved = False

    def describe(self):
        return self.screen + (" (unsaved)" if self.screen == "editor" and self.unsaved else "")

    def handle(self, event):
        if self.screen == "editor":
            if event == "type":
                self.unsaved = True
                return self.describe()
            if event == "save":
                self.unsaved = False
                return self.describe()
            if event in ("back", "logout"):
                if self.unsaved:
                    return "unsaved changes!"
                self.screen = "home" if event == "back" else "login"
                return self.describe()
        nxt = self.SIMPLE.get((self.screen, event))
        if nxt is None:
            return f"not allowed on {self.screen}"
        self.screen = nxt
        return self.describe()

app = App()
while (event := input()) != "end":
    print(f"{event}: {app.handle(event)}")`,
          notes: "Guarding transitions in one place guarantees that no button anywhere can lose unsaved work. Libraries like `transitions` or Qt's QStateMachine formalise the same idea.",
        },
      ],
      realWorld: "Hospital admission forms, shop billing screens and installer wizards are form-and-state apps; Qt powers professional tools like Autodesk Maya's UI and many lab instruments; PyInstaller ships Python desktop apps to users without Python installed.",
      reteach: "MVC is a restaurant: the kitchen (model) owns the food and recipes, the waiter (controller) takes orders and carries messages, and the dining room (view) is just where things are shown. A state machine is the restaurant's opening rules: you can't serve before cooking, or cook after closing — every allowed move is written on the wall.",
      summary: [
        "Model (data + rules), view (widgets), controller (actions → model → view); keep the view thin.",
        "Validate per field and per form, show all errors near their fields, block saving until valid, keep user input.",
        "Represent UI modes as a state machine; pick tkinter/Qt/Kivy/web to fit; package with PyInstaller.",
      ],
      libraryCode: [{
        title: "A PySide6 form with live validation",
        code: `from PySide6.QtWidgets import QApplication, QFormLayout, QLabel, QLineEdit, QPushButton, QWidget

app = QApplication([])
window = QWidget(windowTitle="Contact")
layout = QFormLayout(window)
name, phone = QLineEdit(), QLineEdit()
error = QLabel(styleSheet="color: #b00020")
save = QPushButton("Save", enabled=False)
layout.addRow("Name", name); layout.addRow("Phone", phone); layout.addRow(error); layout.addRow(save)

def revalidate():
    problems = []
    if not name.text().strip(): problems.append("Name is required")
    if not (phone.text().isdigit() and len(phone.text()) == 10): problems.append("Phone needs 10 digits")
    error.setText("\\n".join(problems))
    save.setEnabled(not problems)

name.textChanged.connect(revalidate); phone.textChanged.connect(revalidate)   # signals → slots
revalidate(); window.show(); app.exec()`,
        note: "`pip install PySide6` on your own computer. `textChanged.connect` is Qt's version of binding a callback to an event.",
      }],
    },
  ],
  exam: [
    {
      id: "e1", kind: "mcq", difficulty: 3,
      prompt: "Which is the main benefit of keeping app logic in model classes rather than in widget callbacks?",
      options: [
        { text: "The window looks nicer", why: "Appearance is unaffected." },
        { text: "The logic can be tested without a screen and reused with another interface", why: "Correct." },
        { text: "It makes the app start faster", why: "Not the point." },
      ],
      answer: 1,
      hint: "Separation of concerns.",
      explain: "Plain-Python models are easy to unit-test and can back a desktop, web or CLI front end.",
    },
    {
      id: "e2", kind: "predict", difficulty: 3,
      code: r`import heapq
q = []
for t, name in [(300, "save"), (100, "blink"), (200, "tick"), (100, "beep")]:
    heapq.heappush(q, (t, name))
print([heapq.heappop(q)[1] for _ in range(len(q))])`,
      answer: "['beep', 'blink', 'tick', 'save']\n",
      hint: "Ordered by time, then by name on ties.",
      explain: "Tuples compare by time first, then name: beep (100) before blink (100), then tick, then save.",
    },
    {
      id: "e3", kind: "fill", difficulty: 3,
      prompt: "In tkinter, run a function again after 1000 ms without blocking.",
      code: r`method = "root.___(1000, tick)"
print(method)`,
      blanks: [["after"]],
      output: "root.after(1000, tick)\n",
      hint: "Run it after a delay.",
      explain: "`root.after(ms, fn)` schedules fn on the event loop instead of sleeping.",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: billing counter app logic", difficulty: 4,
    prompt: `Build the model and controller for a small shop billing screen (the window itself would be tkinter on your computer).

Catalogue lines \`code,name,price\` until \`---\`, then UI events until \`end\`:
- \`scan <code>\` → add 1 of the item (unknown code → \`unknown item <code>\`)
- \`qty <code> <n>\` → set quantity (n = 0 removes; must be 0–99, else \`invalid quantity\`)
- \`discount <percent>\` → 0–20 allowed (else \`discount not allowed\`)
- \`pay <amount>\` → if amount ≥ total: show \`change ₹X\` and the app moves to state \`paid\` (further scans: \`start a new bill\`); else \`insufficient amount\`
- \`new\` → empty bill, state \`billing\`
After every event print the status line \`[state] items N | total ₹T\` (T with 2 decimals, after discount), preceded by any message.`,
    starter: r`class Bill:
    pass
`,
    tests: [
      { label: "Bill", input: "A1,Notebook,45\nB2,Pen,10\nC3,Geometry box,120\n---\nscan A1\nscan B2\nscan B2\nscan Z9\nqty A1 3\nqty C3 120\ndiscount 10\npay 100\npay 200\nscan B2\nnew\nscan C3\nend\n", output: "[billing] items 1 | total ₹45.00\n[billing] items 2 | total ₹55.00\n[billing] items 3 | total ₹65.00\nunknown item Z9\n[billing] items 3 | total ₹65.00\n[billing] items 5 | total ₹155.00\ninvalid quantity\n[billing] items 5 | total ₹155.00\n[billing] items 5 | total ₹139.50\ninsufficient amount\n[billing] items 5 | total ₹139.50\nchange ₹60.50\n[paid] items 5 | total ₹139.50\nstart a new bill\n[paid] items 5 | total ₹139.50\n[billing] items 0 | total ₹0.00\n[billing] items 1 | total ₹120.00" },
    ],
    hints: [
      "Model: Bill with items {code: qty}, discount, state; methods return an optional message.",
      "total = sum(price × qty) × (1 − discount/100).",
      "Controller: parse each event, call the model, print message (if any) then status.",
      "items N counts units (sum of quantities).",
    ],
    solution: r`class Bill:
    def __init__(self, catalogue):
        self.catalogue = catalogue
        self.new()

    def new(self):
        self.items, self.discount, self.state = {}, 0, "billing"

    def total(self):
        gross = sum(self.catalogue[c][1] * q for c, q in self.items.items())
        return gross * (1 - self.discount / 100)

    def scan(self, code):
        if self.state != "billing":
            return "start a new bill"
        if code not in self.catalogue:
            return f"unknown item {code}"
        self.items[code] = self.items.get(code, 0) + 1

    def set_qty(self, code, n):
        if self.state != "billing":
            return "start a new bill"
        if code not in self.catalogue:
            return f"unknown item {code}"
        if not 0 <= n <= 99:
            return "invalid quantity"
        if n == 0:
            self.items.pop(code, None)
        else:
            self.items[code] = n

    def set_discount(self, pct):
        if not 0 <= pct <= 20:
            return "discount not allowed"
        self.discount = pct

    def pay(self, amount):
        if self.state != "billing":
            return "start a new bill"
        if amount < self.total():
            return "insufficient amount"
        self.state = "paid"
        return f"change ₹{amount - self.total():.2f}"

    def status(self):
        return f"[{self.state}] items {sum(self.items.values())} | total ₹{self.total():.2f}"

catalogue = {}
while (line := input()) != "---":
    code, name, price = line.split(",")
    catalogue[code] = (name, float(price))
bill = Bill(catalogue)
while (line := input()) != "end":
    cmd, *args = line.split()
    if cmd == "scan":
        msg = bill.scan(args[0])
    elif cmd == "qty":
        msg = bill.set_qty(args[0], int(args[1]))
    elif cmd == "discount":
        msg = bill.set_discount(int(args[0]))
    elif cmd == "pay":
        msg = bill.pay(float(args[0]))
    else:
        msg = bill.new()
    if msg:
        print(msg)
    print(bill.status())`,
    notes: "With the logic tested, the tkinter layer is small: an Entry for the barcode, a Treeview for items, labels bound to status(). Before real use you'd need GST calculation, printed receipts, a database for items and sales, user logins for staff, and backups.",
  },
};
