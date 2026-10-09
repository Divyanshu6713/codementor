/**
 * The judge — the only thing that decides whether code is correct. AI never does.
 *
 * Compile once → run visible + hidden tests → compare outputs deterministically → structured result.
 * Hidden test inputs/outputs stay on the server; the browser only learns how many passed and the
 * kind of case (normal / boundary / edge) that failed.
 */
import { execute } from "./providers";
import type { RunResult } from "./protocol";

export interface JudgeTest {
  id: string;
  label: string;
  input: string;
  expected: string;
  visibility: "sample" | "visible" | "hidden";
  category: "normal" | "boundary" | "edge";
}

export type Verdict =
  | "accepted" | "wrong_answer" | "compile_error" | "rejected" | "runtime_error"
  | "time_limit" | "memory_limit" | "output_limit" | "internal_error";

export interface JudgedTest {
  id: string;
  label: string;
  visibility: JudgeTest["visibility"];
  category: JudgeTest["category"];
  passed: boolean;
  status: RunResult["status"];
  input: string;
  expected: string;
  actual: string;
  detail: string | null;
}

export interface JudgeOutcome {
  verdict: Verdict;
  compileStatus: "success" | "error" | "rejected";
  compileOutput: string;
  testsPassed: number;
  testsTotal: number;
  runtimeError: string | null;
  timeLimitExceeded: boolean;
  memoryLimitExceeded: boolean;
  outputLimitExceeded: boolean;
  tests: JudgedTest[];
  executor: string;
  isolation: string;
  durationMs: number;
}

export function normalizeLines(s: string): string[] {
  const lines = s.replace(/\r\n?/g, "\n").split("\n").map((l) => l.replace(/\s+$/, ""));
  while (lines.length && lines[lines.length - 1] === "") lines.pop();
  return lines;
}

export function tokens(s: string): string[] {
  return s.split(/\s+/).filter(Boolean);
}

/** tokens: whitespace-insensitive. lines: line by line, ignoring trailing spaces / final newline. */
export function outputsMatch(expected: string, actual: string, mode: "tokens" | "lines"): boolean {
  if (mode === "tokens") {
    const a = tokens(expected);
    const b = tokens(actual);
    return a.length === b.length && a.every((t, i) => t === b[i]);
  }
  const a = normalizeLines(expected);
  const b = normalizeLines(actual);
  return a.length === b.length && a.every((l, i) => l === b[i]);
}

const VERDICT_PRIORITY: Verdict[] = ["time_limit", "memory_limit", "output_limit", "runtime_error", "wrong_answer"];

export async function judgeSubmission(source: string, tests: JudgeTest[], compare: "tokens" | "lines"): Promise<JudgeOutcome> {
  const res = await execute({ language: "cpp", source, tests: tests.map((t, i) => ({ id: `t${i}`, input: t.input })) });
  const base = {
    compileOutput: res.compile.output, testsTotal: tests.length, executor: res.executor, isolation: res.isolation, durationMs: res.durationMs,
  };
  if (res.compile.status !== "success") {
    return {
      ...base, verdict: res.compile.status === "rejected" ? "rejected" : "compile_error", compileStatus: res.compile.status,
      testsPassed: 0, runtimeError: null, timeLimitExceeded: false, memoryLimitExceeded: false, outputLimitExceeded: false,
      tests: tests.map((t) => ({ id: t.id, label: t.label, visibility: t.visibility, category: t.category, passed: false, status: "not_run", input: t.input, expected: t.expected, actual: "", detail: null })),
    };
  }
  const judged: JudgedTest[] = tests.map((t, i) => {
    const r = res.tests[i];
    const passed = r?.status === "ok" && outputsMatch(t.expected, r.stdout, compare);
    return {
      id: t.id, label: t.label, visibility: t.visibility, category: t.category, passed,
      status: r?.status ?? "internal_error", input: t.input, expected: t.expected, actual: r?.stdout ?? "", detail: r?.detail ?? null,
    };
  });
  const statuses = new Set<string>(judged.filter((t) => !t.passed).map((t) => (t.status === "ok" ? "wrong_answer" : t.status)));
  const internal = judged.some((t) => t.status === "internal_error");
  const passedCount = judged.filter((t) => t.passed).length;
  const verdict: Verdict = internal ? "internal_error" : passedCount === tests.length ? "accepted" : VERDICT_PRIORITY.find((v) => statuses.has(v)) ?? "wrong_answer";
  return {
    ...base, verdict, compileStatus: "success", testsPassed: passedCount,
    runtimeError: judged.find((t) => t.status === "runtime_error")?.detail ?? null,
    timeLimitExceeded: statuses.has("time_limit"), memoryLimitExceeded: statuses.has("memory_limit"), outputLimitExceeded: statuses.has("output_limit"),
    tests: judged,
  };
}

/**
 * What the browser may see. Visible tests always come in full. Hidden tests come as pass/fail plus
 * the kind of case — unless `revealHidden` is set (after a wrong practice submission), when their
 * input, expected and actual output are included too, marked `revealed`.
 */
export function publicJudgeView(o: JudgeOutcome, opts: { revealHidden?: boolean } = {}) {
  let hiddenN = 0;
  return {
    verdict: o.verdict, compileStatus: o.compileStatus, compileOutput: o.compileOutput,
    testsPassed: o.testsPassed, testsTotal: o.testsTotal, runtimeError: o.runtimeError,
    timeLimitExceeded: o.timeLimitExceeded, memoryLimitExceeded: o.memoryLimitExceeded, outputLimitExceeded: o.outputLimitExceeded,
    executor: o.executor, isolation: o.isolation,
    hiddenRevealed: Boolean(opts.revealHidden),
    tests: o.tests.map((t) => {
      if (t.visibility !== "hidden") {
        return { label: t.label, hidden: false as const, revealed: false, category: t.category, passed: t.passed, status: t.status, input: t.input, expected: t.expected, actual: t.actual.slice(0, 4000), detail: t.detail };
      }
      const label = `Hidden test ${++hiddenN}`;
      return opts.revealHidden
        ? { label: `${label} · ${t.label}`, hidden: true as const, revealed: true, category: t.category, passed: t.passed, status: t.status, input: t.input, expected: t.expected, actual: t.actual.slice(0, 4000), detail: t.detail }
        : { label, hidden: true as const, revealed: false, category: t.category, passed: t.passed, status: t.status, input: undefined, expected: undefined, actual: undefined, detail: null };
    }),
  };
}
export type PublicJudgeView = ReturnType<typeof publicJudgeView>;
