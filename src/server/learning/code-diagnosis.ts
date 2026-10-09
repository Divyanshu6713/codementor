/**
 * Deterministic diagnosis of a failed code submission: which misconception(s) the evidence points
 * to, what kind of mistake it is, and a plain "what happened" sentence built only from real judge
 * evidence (never from hidden test data).
 */
import type { DetectorDef } from "@/content/types";
import type { MistakeCategory } from "@/server/db/schema";
import type { JudgeOutcome, JudgedTest } from "@/server/execution/judge";
import { tokens } from "@/server/execution/judge";

export interface ForHeader {
  init: string;
  condition: string;
  update: string;
  emptyBody: boolean;
  text: string;
}

/** The first `for (…;…;…)` header in the code (comments and strings already don't matter here). */
export function parseFirstFor(source: string): ForHeader | null {
  const m = /for\s*\(([^;()]*);([^;]*);([^)]*)\)\s*(;)?/.exec(source);
  if (!m) return null;
  return { init: m[1].trim(), condition: m[2].trim(), update: m[3].trim(), emptyBody: Boolean(m[4]), text: m[0].replace(/\s*;?$/, "").trim() };
}

/** Static checks on the loop header against the direction the task requires. */
export function headerFindings(h: ForHeader, direction: "up" | "down"): { code: string; note: string }[] {
  const out: { code: string; note: string }[] = [];
  const cond = h.condition;
  const upd = h.update.replace(/\s+/g, "");
  if (h.emptyBody) out.push({ code: "MC-LOOP-08", note: "There's a `;` straight after the loop header, so the loop body is empty." });
  if (!upd) out.push({ code: "MC-LOOP-03", note: "The loop header has no update step, so the counter never changes." });
  const goesUp = /\+\+|\+=/.test(upd);
  const goesDown = /--|-=/.test(upd);
  if ((direction === "up" && goesDown) || (direction === "down" && goesUp)) {
    out.push({ code: "MC-LOOP-03", note: `The update \`${h.update}\` moves the counter away from the end.` });
  }
  const op = loopComparison(h);
  if (/[^<>!=]=[^=]/.test(` ${cond} `)) out.push({ code: "MC-REL-01", note: "The condition uses `=` (store) instead of a comparison." });
  else if (op === "==") out.push({ code: "MC-LOOP-01", note: `The condition \`${cond}\` is only true for one value, so the loop stops (or never starts) early.` });
  else if (direction === "up" && (op === ">" || op === ">=") && goesUp) out.push({ code: "MC-LOOP-02", note: `Counting up with \`${cond}\`: the comparison points the wrong way.` });
  else if (direction === "down" && (op === "<" || op === "<=") && goesDown) out.push({ code: "MC-LOOP-02", note: `Counting down with \`${cond}\`: the comparison points the wrong way.` });
  return out;
}

const FLIP: Record<string, string> = { "<": ">", "<=": ">=", ">": "<", ">=": "<=", "==": "==", "!=": "!=" };

/** The comparison as seen from the loop variable: `n >= i` is read as `i <= n`. */
export function loopComparison(h: ForHeader): string | null {
  const v = /([A-Za-z_]\w*)\s*=(?!=)/.exec(h.init)?.[1];
  const m = /^(.+?)\s*(<=|>=|==|!=|<|>)\s*(.+)$/.exec(h.condition);
  if (!v || !m) return null;
  if (m[1].trim() === v) return m[2];
  if (m[3].trim() === v) return FLIP[m[2]];
  return null;
}

const asInts = (s: string) => {
  const t = tokens(s);
  return t.every((x) => /^-?\d+$/.test(x)) ? t.map(Number) : null;
};
const eq = (a: number[], b: number[]) => a.length === b.length && a.every((v, i) => v === b[i]);

/** Compares the shape of a printed integer sequence with the expected one. */
export function sequenceFinding(expected: number[], actual: number[]): { code: string | null; note: string } | null {
  if (!expected.length) return null;
  if (!actual.length) return { code: "MC-LOOP-01", note: "nothing was printed — the loop body never ran" };
  if (eq(actual, expected.slice(0, -1))) return { code: "MC-LOOP-04", note: `the last value (${expected.at(-1)}) is missing` };
  if (eq(actual.slice(0, -1), expected) && actual.length === expected.length + 1) return { code: "MC-LOOP-04", note: `there's one extra value at the end (${actual.at(-1)})` };
  if (eq(actual, expected.slice(1))) return { code: "MC-LOOP-04", note: `the first value (${expected[0]}) is missing` };
  if (actual.length === expected.length + 1 && eq(actual.slice(1), expected)) return { code: "MC-LOOP-04", note: `there's one extra value at the start (${actual[0]})` };
  if (actual.length === expected.length && eq(actual.slice(1), expected.slice(0, -1))) return { code: "MC-LOOP-04", note: "every value is shifted by one step — check where the counter starts" };
  if (eq([...actual].reverse(), expected)) return { code: null, note: "the values came out in reverse order" };
  if (actual.length === 1 && expected.length > 1) return { code: "MC-LOOP-08", note: "only one value was printed" };
  return null;
}

/** For "print one accumulated number" tasks where the last term is n. */
export function accumulatorFinding(n: number, expected: number, actual: number): { code: string | null; note: string } | null {
  if (actual === expected) return null;
  if (actual === expected - n && n !== 0) return { code: "MC-LOOP-04", note: `the answer is exactly ${n} short — the last term (n) wasn't added` };
  if (actual === expected + n + 1) return { code: "MC-LOOP-04", note: "one extra term (n + 1) was added" };
  if (actual === 0 && expected !== 0) return { code: "MC-LOOP-01", note: "the total stayed 0 — the loop body never ran" };
  if (actual === n && expected !== n) return { code: "MC-LOOP-05", note: "the result equals the last value only — the total is being reset or overwritten inside the loop" };
  return null;
}

export interface CodeDiagnosis {
  misconceptions: string[];
  category: MistakeCategory;
  whatHappened: string;
  /** Short evidence lines for the AI explainer / mistake book (no hidden data). */
  evidence: string[];
}

function firstCompileError(output: string): string {
  const line = output.split("\n").find((l) => /error:/.test(l)) ?? output.split("\n")[0] ?? "";
  return line.trim().slice(0, 200);
}

const describeInput = (t: JudgedTest) => (t.visibility === "hidden" ? `a hidden ${t.category} test` : `input \`${t.input.trim() || "(empty)"}\``);

export function diagnoseSubmission(source: string, outcome: JudgeOutcome, detectors: DetectorDef[]): CodeDiagnosis {
  const found = new Set<string>();
  const evidence: string[] = [];

  if (outcome.compileStatus === "rejected") {
    return { misconceptions: [], category: "syntax", whatHappened: outcome.compileOutput, evidence: [outcome.compileOutput] };
  }
  if (outcome.compileStatus === "error") {
    const err = firstCompileError(outcome.compileOutput);
    const header = parseFirstFor(source);
    if (header?.emptyBody) found.add("MC-LOOP-08");
    const undeclared = /was not declared|undeclared/.test(err);
    return {
      misconceptions: [...found],
      category: undeclared ? "variable_confusion" : "syntax",
      whatHappened: `It didn't compile. The compiler's first complaint: ${err}`,
      evidence: [err],
    };
  }

  const header = parseFirstFor(source);
  const headerDetector = detectors.find((d): d is Extract<DetectorDef, { kind: "for_header" }> => d.kind === "for_header");
  // Visible failures first: they're what the student can see and reproduce.
  const failing = outcome.tests.filter((t) => !t.passed).sort((a, b) => Number(a.visibility === "hidden") - Number(b.visibility === "hidden"));
  const visibleFail = failing.find((t) => t.visibility !== "hidden");
  const anyFail = visibleFail ?? failing[0];
  let category: MistakeCategory = "logic";
  let what = "";

  if (anyFail?.status === "time_limit") {
    found.add("MC-LOOP-03");
    what = "Your program ran too long and was stopped — a loop may never be reaching its end.";
  } else if (anyFail?.status === "runtime_error") {
    what = `Your program crashed while running: ${anyFail.detail ?? "runtime error"}`;
  } else if (anyFail?.status === "output_limit") {
    found.add("MC-LOOP-03");
    what = "Your program printed far too much and was stopped — a loop may never be ending.";
  } else if (anyFail?.status === "memory_limit") {
    what = "Your program used too much memory and was stopped.";
  }
  const otherLimit = failing.find((t) => t !== anyFail && (t.status === "time_limit" || t.status === "output_limit"));
  if (otherLimit) evidence.push(`On ${otherLimit.visibility === "hidden" ? `a hidden ${otherLimit.category} case` : `input ${otherLimit.input.trim()}`} the program didn't stop (${otherLimit.status.replace("_", " ")}).`);

  if (header && headerDetector) {
    for (const f of headerFindings(header, headerDetector.direction)) {
      found.add(f.code);
      evidence.push(f.note);
    }
    evidence.push(`Loop header: \`${header.text}\``);
  }

  for (const d of detectors) {
    if (d.kind === "sequence") {
      for (const t of failing) {
        const exp = asInts(t.expected);
        const act = asInts(t.actual);
        if (!exp || !act) continue;
        const f = sequenceFinding(exp, act);
        if (f) {
          if (f.code) found.add(f.code);
          if (!what) {
            what = t.visibility === "hidden"
              ? `Your program passed the sample tests but failed a hidden ${t.category} case: ${f.note}.`
              : `For ${describeInput(t)} ${f.note}.`;
          }
          break;
        }
      }
    }
    if (d.kind === "accumulator") {
      for (const t of failing) {
        const n = Number(tokens(t.input)[0]);
        const exp = Number(tokens(t.expected)[0]);
        const actTokens = tokens(t.actual);
        if (!Number.isFinite(n) || actTokens.length !== 1 || !/^-?\d+$/.test(actTokens[0])) continue;
        const f = accumulatorFinding(n, exp, Number(actTokens[0]));
        if (f) {
          if (f.code) found.add(f.code);
          if (!what) {
            what = t.visibility === "hidden"
              ? `Your program passed the sample tests but failed a hidden ${t.category} case: ${f.note}.`
              : `For ${describeInput(t)} ${f.note}.`;
          }
          break;
        }
      }
    }
  }

  // MC-LOOP-02 and MC-LOOP-01 both explain "printed nothing"; keep the more specific header finding.
  if (found.has("MC-LOOP-02") && found.has("MC-LOOP-01") && !/==/.test(header?.condition ?? "")) found.delete("MC-LOOP-01");

  if (!what && anyFail) {
    what = anyFail.visibility === "hidden"
      ? `Your program passed ${outcome.testsPassed} of ${outcome.testsTotal} tests. A hidden ${anyFail.category} case gives a different answer.`
      : `For ${describeInput(anyFail)} it printed \`${anyFail.actual.trim().slice(0, 80) || "(nothing)"}\` but \`${anyFail.expected.trim().slice(0, 80) || "(nothing)"}\` was expected.`;
  }
  if ([...found].some((c) => c === "MC-LOOP-04")) category = "off_by_one";
  else if (found.has("MC-LOOP-08") || found.has("MC-REL-01")) category = "syntax";
  else if (found.has("MC-LOOP-01") || found.has("MC-LOOP-02")) category = "conceptual";
  if (anyFail?.category === "boundary" && category === "logic") category = "boundary";
  return { misconceptions: [...found], category, whatHappened: what, evidence };
}
