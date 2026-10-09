/**
 * Curated, deterministic feedback for the guest lessons — works with no AI at all.
 *
 * `explainCompilerOutput` turns common g++ messages into plain language (the student still sees
 * the real compiler output next to it). `runFeedback` explains time/memory/output limits and
 * runtime errors. `checkFeedback` summarises a judged submission without revealing hidden tests.
 * Everything here describes what actually happened; nothing is guessed.
 */
import type { JudgeOutcome } from "@/server/execution/judge";
import type { RunStatus } from "@/server/execution/protocol";

export interface FeedbackItem {
  title: string;
  body: string;
  /** 1-based source line the item refers to, when known. */
  line?: number | null;
}

interface Rule {
  test: RegExp;
  explain: (m: RegExpMatchArray) => { title: string; body: string };
}

const STD_NAMES = new Set(["cout", "cin", "endl", "string", "vector", "swap", "max", "min", "abs", "sqrt", "pow", "getline"]);

const RULES: Rule[] = [
  {
    test: /'([A-Za-z_][A-Za-z0-9_]*)' was not declared in this scope/,
    explain: (m) => STD_NAMES.has(m[1])
      ? { title: `C++ doesn't recognise \`${m[1]}\``, body: `\`${m[1]}\` comes from the standard library. Check that the right \`#include\` is at the top (for example \`#include <iostream>\` for cout/cin, \`#include <string>\` for string) and that \`using namespace std;\` is there.` }
      : { title: `\`${m[1]}\` is used but was never declared`, body: `The compiler has never seen a variable or function called \`${m[1]}\` at this point. Check the spelling (C++ is case-sensitive: \`total\` and \`Total\` are different), and that it is declared *before* this line and inside the same braces { } where you use it.` },
  },
  {
    test: /expected ';' before/,
    explain: () => ({ title: "A semicolon is missing", body: "A statement isn't finished with `;`. The compiler usually notices on the **next** line, so look at the end of the line *above* the one it points to." }),
  },
  {
    test: /expected '}' at end of input/,
    explain: () => ({ title: "A closing brace } is missing", body: "Every `{` needs a matching `}`. Count them — often the `}` that ends `main` (or a loop/if) is missing." }),
  },
  {
    test: /expected '\)' before|expected '\(' before/,
    explain: () => ({ title: "Brackets don't match", body: "Round brackets ( ) come in pairs. Check conditions like `if (…)` and `for (…; …; …)` for a missing or extra bracket." }),
  },
  {
    test: /no match for 'operator>>'/,
    explain: () => ({ title: "The arrows point the wrong way (or the type can't be read)", body: "Reading uses `cin >> variable;` and printing uses `cout << value;`. Check you didn't write `cout >>` or `cin <<`, and that you read into a variable (not into a number or text)." }),
  },
  {
    test: /no match for 'operator<<'/,
    explain: () => ({ title: "The arrows point the wrong way (or this can't be printed)", body: "Printing uses `cout << value;`. Check you didn't write `cin << …`, and that you're printing a simple value like a number or text." }),
  },
  {
    test: /missing terminating " character|missing terminating ' character/,
    explain: () => ({ title: "Text in quotes isn't closed", body: "A string started with `\"` but the closing `\"` is missing on that line. Text must open and close on the same line." }),
  },
  {
    test: /invalid conversion from 'const char\*' to 'char'|multi-character character constant/,
    explain: () => ({ title: "Single vs double quotes", body: "Single quotes are for one character (`'A'`); double quotes are for text (`\"Hello\"`). Use double quotes for words." }),
  },
  {
    test: /'else' without a previous 'if'/,
    explain: () => ({ title: "This else has no matching if", body: "Usually caused by a `;` right after `if (…)` or by a brace in the wrong place. The `else` must come straight after the `}` that ends the if block." }),
  },
  {
    test: /redeclaration of|conflicting declaration/,
    explain: () => ({ title: "The same name is declared twice", body: "You declared a variable with this name earlier. Declare it once (with its type), then just use the name: `x = 5;` rather than `int x = 5;` again." }),
  },
  {
    test: /lvalue required as left operand of assignment/,
    explain: () => ({ title: "Something that can't be assigned to is on the left of =", body: "`=` stores the right side **into** a variable on the left. Check for things like `5 = x` or `a + b = c`. If you meant to *compare*, use `==`." }),
  },
  {
    test: /does not name a type/,
    explain: () => ({ title: "A statement is outside main, or a type name is misspelled", body: "Instructions like `cout << …;` must be inside the braces of `int main() { … }`. Also check the spelling of type names (`int`, `double`, `string`)." }),
  },
  {
    test: /undefined reference to `?(?:main|WinMain)/,
    explain: () => ({ title: "There is no main function", body: "Every program needs `int main() { … }` — that's where it starts. Check that it's spelled `main` and has its brackets and braces." }),
  },
  {
    test: /expected primary-expression before/,
    explain: () => ({ title: "Something is missing in an expression", body: "The compiler expected a value here (a number, a variable, a bracket…). Look for a stray operator, an empty `cout <<`, or a missing value between two operators." }),
  },
  {
    test: /expected unqualified-id before/,
    explain: () => ({ title: "Unexpected symbol", body: "There is a word or symbol where C++ doesn't expect one — often a statement outside `main`, a stray `}` that closes main too early, or a typo." }),
  },
];

/** First `main.cpp:LINE:COL: error:` line number in g++ output. */
export function firstErrorLine(output: string): number | null {
  const m = /main\.cpp:(\d+):\d+:\s*(?:fatal )?error/.exec(output);
  return m ? Number(m[1]) : null;
}

/** Plain-language explanations for the errors in g++ output (first error first, at most 2). */
export function explainCompilerOutput(output: string, status: "error" | "rejected" = "error"): FeedbackItem[] {
  if (status === "rejected") {
    const line = /^Line (\d+):/.exec(output)?.[1];
    return [{ title: "This program uses something the sandbox doesn't allow", body: output.replace(/^Line \d+:\s*/, ""), line: line ? Number(line) : null }];
  }
  const errorLines = output.split("\n").filter((l) => /error:/.test(l));
  const items: FeedbackItem[] = [];
  const seen = new Set<string>();
  for (const l of errorLines) {
    const rule = RULES.find((r) => r.test.test(l));
    if (!rule) continue;
    const item = rule.explain(l.match(rule.test)!);
    if (seen.has(item.title)) continue;
    seen.add(item.title);
    const ln = /main\.cpp:(\d+):/.exec(l);
    items.push({ ...item, line: ln ? Number(ln[1]) : null });
    if (items.length >= 2) break;
  }
  if (!items.length) {
    items.push({
      title: "The program didn't compile",
      body: "Read the first error message: it starts with `main.cpp:LINE:COLUMN`. Go to that line (and the one above it), compare it carefully with the lesson's examples, then run again. Fix one error at a time — later errors are often caused by the first.",
      line: firstErrorLine(output),
    });
  }
  return items;
}

/** Explanation for a run that didn't finish normally. */
export function runFeedback(status: RunStatus, detail: string | null): FeedbackItem | null {
  switch (status) {
    case "time_limit":
      return { title: "The program ran too long and was stopped", body: "The most common cause is a loop that never ends — check that the loop's condition eventually becomes false (is the counter updated in the right direction?). It also happens when the program waits for more input than it was given." };
    case "memory_limit":
      return { title: "The program used too much memory", body: "Something keeps growing without stopping — usually a loop that keeps adding to a vector or string, or a very large array." };
    case "output_limit":
      return { title: "The program printed far too much", body: "Output was cut off. This is almost always a loop that never ends with a `cout` inside it." };
    case "runtime_error":
      return { title: "The program crashed while running", body: `${detail ?? "It stopped with an error."} Common causes: dividing by zero, reading outside an array, or recursion that never stops.` };
    case "internal_error":
      return { title: "The code runner had a problem", body: "This wasn't caused by your code. Please try again in a moment." };
    default:
      return null;
  }
}

const hasLetters = (s: string) => /[A-Za-z]{3,}/.test(s);

/** Summary of a judged submission. Never includes hidden test inputs or outputs. */
export function checkFeedback(o: JudgeOutcome): FeedbackItem[] {
  if (o.verdict === "accepted") {
    return [{ title: `All ${o.testsTotal} tests passed`, body: "Your program produced the expected output for every test case, including the hidden ones." }];
  }
  if (o.compileStatus !== "success") return explainCompilerOutput(o.compileOutput, o.compileStatus === "rejected" ? "rejected" : "error");
  const items: FeedbackItem[] = [];
  const failed = o.tests.filter((t) => !t.passed);
  const crash = failed.find((t) => t.status !== "ok");
  if (crash) {
    const f = runFeedback(crash.status, crash.detail);
    if (f) items.push(f);
  }
  const wrongSample = failed.find((t) => t.status === "ok" && t.visibility !== "hidden");
  if (wrongSample) {
    const extraWords = hasLetters(wrongSample.actual) && !hasLetters(wrongSample.expected);
    items.push({
      title: `Different output for "${wrongSample.label}"`,
      body: extraWords
        ? "Your program printed extra words. The checker compares output exactly — remove prompts like \"Enter a number\" and print only what the task asks for."
        : "Compare your output with the expected output line by line. Look for an off-by-one (a missing or extra value at the start or end), a missing space or new line, or a wrong calculation.",
    });
  }
  const hiddenFailed = failed.filter((t) => t.visibility === "hidden" && t.status === "ok");
  if (hiddenFailed.length && !wrongSample) {
    const kinds = [...new Set(hiddenFailed.map((t) => t.category))];
    const kindText = kinds.map((k) => (k === "edge" ? "an unusual/edge input" : k === "boundary" ? "a boundary value (the smallest/largest or exactly-on-the-limit case)" : "a normal input")).join(" and ");
    items.push({
      title: `${hiddenFailed.length} hidden test${hiddenFailed.length > 1 ? "s" : ""} failed`,
      body: `The examples pass, but the output was different for ${kindText}. Try your own inputs in the Input box — for example 0, 1, a negative number, or exactly the limit mentioned in the task.`,
    });
  }
  return items;
}
