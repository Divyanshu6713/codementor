/**
 * Plain-language explanations of Python errors. The traceback itself is always shown too; these
 * notes say what the error means, where to look, and the usual fix. Built from the real error text
 * the sandbox returned — never guessed.
 */
import type { RunStatus } from "@/server/execution/protocol";
import type { FeedbackItem } from "./feedback";
import type { JudgeOutcome } from "@/server/execution/judge";

/** The last `File "main.py", line N` in a traceback: the learner's line closest to the error. */
export function pythonErrorLine(text: string): number | null {
  const all = [...text.matchAll(/File "main\.py", line (\d+)/g)];
  return all.length ? Number(all[all.length - 1][1]) : null;
}

/** "ValueError: invalid literal…" → { type: "ValueError", message: "invalid literal…" }. */
export function lastError(text: string): { type: string; message: string } | null {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim());
  for (let i = lines.length - 1; i >= 0; i--) {
    const m = /^([A-Za-z_][\w.]*(?:Error|Exception|Warning|Exit|Interrupt|Iteration))(?::\s?(.*))?$/.exec(lines[i].trim());
    if (m) return { type: m[1].split(".").pop()!, message: m[2] ?? "" };
  }
  return null;
}

const EXPLAIN: Record<string, (msg: string) => { title: string; body: string }> = {
  SyntaxError: (msg) => ({
    title: "Syntax error — Python couldn't read this line",
    body: /expected ':'/.test(msg)
      ? "A line that starts a block (`if`, `elif`, `else`, `for`, `while`, `def`, `class`, `try` …) must end with a colon `:`."
      : /was never closed|unexpected EOF|'\(' was never closed/.test(msg)
        ? "A bracket or quote was opened but never closed. Check the line shown and the lines just above it."
        : /invalid syntax\. Perhaps you forgot a comma/.test(msg)
          ? "Two values are next to each other without a comma between them."
          : /unterminated string/.test(msg)
            ? "A string is missing its closing quote."
            : /cannot assign to/.test(msg)
              ? "The left side of `=` must be a name (or an item/attribute). Did you mean `==` to compare?"
              : "The code breaks Python's grammar, so nothing ran. Look at the line shown — and the line before it — for a missing `:`, bracket, quote or comma.",
  }),
  IndentationError: (msg) => ({
    title: "Indentation error — the spaces at the start of a line are wrong",
    body: /expected an indented block/.test(msg)
      ? "After a line ending in `:`, the next line must be indented (4 spaces is the convention)."
      : /unexpected indent/.test(msg)
        ? "This line is indented but nothing above it opens a block. Remove the extra spaces."
        : "Lines in the same block must line up exactly. Use 4 spaces per level and don't mix tabs and spaces.",
  }),
  TabError: () => ({ title: "Tabs and spaces are mixed", body: "Python can't tell how far a line is indented when tabs and spaces are mixed. Re-indent the block with spaces only." }),
  NameError: (msg) => {
    const name = /name '([^']+)' is not defined/.exec(msg)?.[1];
    return {
      title: `Name error — ${name ? `\`${name}\` doesn't exist (yet)` : "a name doesn't exist"}`,
      body: `Python doesn't know ${name ? `\`${name}\`` : "this name"}. Common causes: a typo or wrong capital letter, using a variable before the line that creates it, or forgetting the quotes around text${name ? ` (did you mean \`"${name}"\`?)` : ""}.`,
    };
  },
  TypeError: (msg) => ({
    title: "Type error — this operation doesn't work on these types",
    body: /can only concatenate str/.test(msg)
      ? "You used `+` between text and a number. Convert the number with `str(...)`, use a comma in `print`, or use an f-string: `f\"Total: {total}\"`."
      : /unsupported operand type/.test(msg)
        ? "The two values can't be combined with this operator — often a number stored as text. Convert with `int(...)` or `float(...)` first."
        : /not callable/.test(msg)
          ? "You put `(...)` after something that isn't a function — maybe a variable has the same name as a function."
          : /missing \d+ required positional argument|takes \d+ positional argument/.test(msg)
            ? "The function was called with the wrong number of arguments. Compare the call with the `def` line."
            : /not subscriptable/.test(msg)
              ? "You used `[...]` on a value that can't be indexed (for example a number or `None`)."
              : /object is not iterable/.test(msg)
                ? "A `for` loop (or similar) was given something that isn't a collection — often a number instead of `range(number)`."
                : "Check the types of the values on this line with `type(...)` or `print(repr(...))`.",
  }),
  ValueError: (msg) => ({
    title: "Value error — right type, wrong value",
    body: /invalid literal for int/.test(msg)
      ? "`int(...)` was given text that isn't a whole number (for example `\"3.5\"`, `\"\"` or `\"ten\"`). Check the input, or use `float(...)` for decimals."
      : /could not convert string to float/.test(msg)
        ? "`float(...)` was given text that isn't a number."
        : /too many values to unpack|not enough values to unpack/.test(msg)
          ? "The number of names on the left doesn't match the number of values on the right."
          : "A function received a value it can't work with. Read the message for which value.",
  }),
  ZeroDivisionError: () => ({ title: "Division by zero", body: "Something was divided by 0 (with `/`, `//` or `%`). Check the divisor before dividing, e.g. `if count != 0:`." }),
  IndexError: () => ({ title: "Index error — position out of range", body: "You asked for a position that doesn't exist. Valid indexes for a list of length `n` are `0` to `n - 1` (or `-1` to `-n`). Loops ending at `len(x)` with `<=` are a common cause." }),
  KeyError: (msg) => ({ title: `Key error — ${msg ? `${msg} isn't in the dictionary` : "missing dictionary key"}`, body: "The dictionary has no such key. Check spelling and case, test with `if key in d:`, or use `d.get(key, default)`." }),
  AttributeError: (msg) => ({
    title: "Attribute error — this value has no such method or attribute",
    body: /'NoneType' object/.test(msg)
      ? "The value is `None` — often because a function didn't `return` anything, or a method like `list.sort()` returns `None`."
      : "Check the spelling, and the type of the value (`type(x)`): for example strings have `.upper()`, lists have `.append()`.",
  }),
  EOFError: () => ({ title: "The program asked for more input than it was given", body: "`input()` was called but there was no more input. In CodeMentor, type every line your program reads into the **Input** box (one value per line)." }),
  RecursionError: () => ({ title: "Recursion error — the function called itself too many times", body: "A recursive function needs a base case that stops it, and every call must move closer to that base case." }),
  ModuleNotFoundError: (msg) => {
    const mod = /No module named '([^']+)'/.exec(msg)?.[1] ?? "";
    return { title: `Module not found${mod ? `: ${mod}` : ""}`, body: `The sandbox has Python's standard library only. Third-party packages (numpy, pandas, flask, requests …) aren't installed here — run those examples on your own computer after \`pip install ${mod.split(".")[0] || "package"}\`. A typo in a standard module name causes this too.` };
  },
  ImportError: () => ({ title: "Import error", body: "The module was found but the name you imported from it doesn't exist. Check the spelling after `from module import ...`." }),
  FileNotFoundError: () => ({ title: "File not found", body: "No file with that name exists in the program's folder. Check the name and extension; files you create earlier in the same run can be opened later." }),
  SandboxError: () => ({ title: "Not available in CodeMentor's sandbox", body: "For safety, programs here can't use the network, start other programs, or touch files outside their own folder. Everything else in Python works normally." }),
  PermissionError: () => ({ title: "Permission denied", body: "The program tried to use a file or resource it isn't allowed to. Programs can only use files in their own folder." }),
  AssertionError: () => ({ title: "Assertion failed", body: "An `assert` condition was False. The assert states something the programmer believed must be true — find out why it isn't." }),
  UnboundLocalError: () => ({ title: "Variable used before it got a value inside the function", body: "Assigning to a name anywhere in a function makes it local to the whole function. Pass the value in as a parameter, or use `global`/`nonlocal` deliberately." }),
  StopIteration: () => ({ title: "StopIteration — the iterator is exhausted", body: "`next()` was called on an iterator with no items left. Use a `for` loop, or `next(it, default)`." }),
  OverflowError: () => ({ title: "Overflow error", body: "A floating-point result was too large to represent. Integers in Python can be any size; floats can't." }),
  MemoryError: () => ({ title: "Out of memory", body: "The program built something too large. Look for a list growing forever, or a loop that never ends." }),
  UnicodeDecodeError: () => ({ title: "Unicode decode error", body: "Bytes couldn't be decoded with that encoding. Open text files with `encoding=\"utf-8\"`." }),
  JSONDecodeError: () => ({ title: "Invalid JSON", body: "The text isn't valid JSON — check quotes (JSON needs double quotes), commas and brackets." }),
};

export function explainPythonError(stderr: string): FeedbackItem[] {
  const err = lastError(stderr);
  if (!err) return [];
  const make = EXPLAIN[err.type];
  const line = pythonErrorLine(stderr);
  if (!make) {
    return [{ title: `${err.type}${err.message ? `: ${err.message.slice(0, 120)}` : ""}`, body: "Read the traceback from the bottom: the last line says what went wrong, the line above it shows where in your code.", line }];
  }
  const e = make(err.message);
  return [{ title: e.title, body: `${e.body}${err.message && !e.title.includes(err.message) ? `\n\nPython says: \`${err.message.slice(0, 200)}\`` : ""}`, line }];
}

export function pythonRunFeedback(status: RunStatus, stderr: string): FeedbackItem[] {
  switch (status) {
    case "runtime_error": return explainPythonError(stderr);
    case "time_limit": return [{ title: "Your program took too long", body: "It was stopped after the time limit. Look for a `while` loop whose condition never becomes False, or an `input()` waiting for a value that isn't in the Input box." }];
    case "memory_limit": return [{ title: "Your program used too much memory", body: "Look for a list or string that keeps growing, e.g. appending inside a loop that never ends." }];
    case "output_limit": return [{ title: "Your program printed too much", body: "Output was cut off. A `print` inside a loop that never ends is the usual cause." }];
    case "internal_error": return [{ title: "The code runner had a problem", body: "This wasn't caused by your code. Please try again." }];
    default: return [];
  }
}

/** Feedback for a judged Python check (mirrors the C++ checkFeedback, with Python wording). */
export function pythonCheckFeedback(o: JudgeOutcome): FeedbackItem[] {
  if (o.compileStatus !== "success") return explainPythonError(o.compileOutput);
  const crash = o.tests.find((t) => t.status !== "ok" && t.status !== "not_run");
  if (crash) return pythonRunFeedback(crash.status, crash.detail ?? "");
  if (o.verdict === "accepted") return [];
  const sample = o.tests.find((t) => !t.passed && t.visibility !== "hidden");
  if (sample) {
    const got = sample.actual.replace(/\r\n/g, "\n").trimEnd();
    const want = sample.expected.trimEnd();
    if (got.toLowerCase() === want.toLowerCase()) return [{ title: "Almost — check capital letters", body: "Your output matches except for upper/lower case." }];
    if (got.replace(/\s+/g, " ") === want.replace(/\s+/g, " ")) return [{ title: "Almost — check spaces and line breaks", body: "The words and numbers are right, but spacing or line breaks differ. Commas in `print` add one space; each `print` ends the line." }];
    if (!got) return [{ title: "Your program printed nothing", body: "Did you `print` the result? In a script, values are only shown when printed." }];
    return [{ title: `The output for "${sample.label}" is different`, body: "Compare your output with the expected output line by line. Run your code with that input to see exactly what it prints." }];
  }
  return [{ title: "The examples pass, but some hidden tests don't", body: "Your program works for the examples but not for every input. Think about edge cases: zero, negative numbers, an empty input, a single item, very large values." }];
}
