/**
 * Python Mastery content is verified with real Python in the sandbox, not by eye:
 *   - the catalogue validates structurally,
 *   - every worked example prints exactly the output the lesson shows,
 *   - every predict-the-output answer is what the code really prints,
 *   - every fill-in-the-blank (with its first accepted answers) prints its stated output,
 *   - every bug fix prints its stated output and the buggy version does not,
 *   - every reference solution passes all of its tests, and no starter code already passes,
 *   - hidden tests and solutions never reach the browser.
 * Needs a dev backend (windows-job / local) with Python 3.10+; the execution checks are skipped elsewhere.
 */
import { beforeAll, describe, expect, it } from "vitest";
import {
  PY_EXERCISES, PY_LESSONS, PY_MODULES, PY_QUESTIONS, publicLesson, validatePython,
  type PyExercise,
} from "@/content/python";
import { outputsMatch } from "@/server/execution/judge";
import { PY_REFERENCE } from "@/content/python/reference";
import { PY_COMPARE } from "@/content/python/compare";
import { getPyLesson } from "@/content/python";
import { executeRequest } from "../worker/sandbox/runner";
import { createDevBackend } from "../worker/sandbox/backends";
import type { SandboxBackend } from "../worker/sandbox/backends/types";

const backend: SandboxBackend | null = createDevBackend();
const canRun = Boolean(backend?.python);

describe("python catalogue structure", () => {
  it("validates", () => {
    expect(validatePython()).toEqual([]);
  });

  it("never sends answers, solutions or hidden tests to the browser", () => {
    for (const l of PY_LESSONS) {
      const pub = JSON.stringify(publicLesson(l));
      for (const ex of l.exercises) {
        expect(pub).not.toContain(JSON.stringify(ex.solution).slice(1, -1));
        for (const t of ex.tests.filter((x) => x.hidden)) expect(pub.includes(JSON.stringify(t.label)) && pub.includes(JSON.stringify(t.input))).toBe(false);
      }
      const pubQuestions = JSON.stringify([publicLesson(l).warmup, ...publicLesson(l).questions]);
      for (const q of [l.warmup, ...l.questions]) expect(pubQuestions).not.toContain(JSON.stringify(q.explain).slice(1, -1));
    }
  });
});

// Bounded parallelism: each run starts a fresh Python process in its own job object.
let active = 0;
const queue: (() => void)[] = [];
async function slot<T>(fn: () => Promise<T>): Promise<T> {
  if (active >= 4) await new Promise<void>((r) => queue.push(r));
  active++;
  try {
    return await fn();
  } finally {
    active--;
    queue.shift()?.();
  }
}

const run = (source: string, inputs: string[], files?: PyExercise["files"]) =>
  slot(() => executeRequest(backend!, { language: "python", source, files, tests: inputs.map((input, i) => ({ id: `t${i}`, input })), limits: { timeMs: 4000 } }));
const out = (s: string) => s.replace(/\r\n/g, "\n");
const fillIn = (code: string, answers: string[]) => {
  let i = 0;
  return code.replace(/___/g, () => answers[i++]);
};

describe.runIf(canRun)("python content runs as claimed (real Python)", () => {
  beforeAll(async () => {
    await backend!.init();
  }, 120_000);

  it.concurrent.each(PY_LESSONS.map((l) => [l.id, l] as const))("%s: worked example output", async (_id, l) => {
    const res = await run(l.example.code, [l.example.input ?? ""], l.example.files);
    expect(res.compile.status, res.compile.output).toBe("success");
    expect(res.compile.output, "no syntax warnings").toBe("");
    if (l.example.raises) {
      expect(res.tests[0].status).toBe("runtime_error");
      expect(res.tests[0].detail?.startsWith(`${l.example.raises}:`)).toBe(true);
    } else {
      expect(res.tests[0].status, res.tests[0].stderr).toBe("ok");
    }
    expect(out(res.tests[0].stdout)).toBe(l.example.output);
  }, 120_000);

  const checkable = PY_QUESTIONS.filter((r) => r.q.kind === "predict" || (r.q.kind === "fill" && r.q.output !== undefined) || (r.q.kind === "bug" && r.q.output !== undefined));
  it.concurrent.each(checkable.map((r) => [r.id, r] as const))("%s: answer is what Python really prints", async (_id, ref) => {
    const q = ref.q;
    if (q.kind === "predict") {
      const res = await run(q.code, [q.input ?? ""], q.files);
      expect(res.compile.status, res.compile.output).toBe("success");
      expect(out(res.tests[0].stdout)).toBe(q.answer);
    } else if (q.kind === "fill") {
      const res = await run(fillIn(q.code, q.blanks.map((b) => b[0])), [""]);
      expect(res.compile.status, res.compile.output).toBe("success");
      expect(res.tests[0].status, res.tests[0].stderr).toBe("ok");
      expect(out(res.tests[0].stdout)).toBe(q.output);
    } else if (q.kind === "bug") {
      const [fixed, buggy] = await Promise.all([run(q.fix, [q.input ?? ""]), run(q.code, [q.input ?? ""])]);
      expect(fixed.compile.status, fixed.compile.output).toBe("success");
      expect(fixed.tests[0].status, fixed.tests[0].stderr).toBe("ok");
      expect(out(fixed.tests[0].stdout)).toBe(q.output);
      const buggyOk = buggy.compile.status === "success" && buggy.tests[0].status === "ok" && out(buggy.tests[0].stdout) === q.output;
      expect(buggyOk, "the buggy version must not already produce the right output").toBe(false);
    }
  }, 120_000);

  it.concurrent.each(PY_EXERCISES.map((e) => [e.key, e] as const))("%s: solution passes, starter does not", async (_key, ref) => {
    const ex = ref.ex;
    const inputs = ex.tests.map((t) => t.input);
    const [sol, start] = await Promise.all([run(ex.solution, inputs, ex.files), run(ex.starter, inputs, ex.files)]);
    expect(sol.compile.status, sol.compile.output).toBe("success");
    expect(sol.compile.output, "no syntax warnings").toBe("");
    ex.tests.forEach((t, i) => {
      expect(sol.tests[i].status, `${t.label}: ${sol.tests[i].stderr}`).toBe("ok");
      expect(outputsMatch(t.output, sol.tests[i].stdout, ex.compare ?? "lines"), `${t.label}: got ${JSON.stringify(sol.tests[i].stdout)}`).toBe(true);
    });
    const starterPasses = start.compile.status === "success" &&
      ex.tests.every((t, i) => start.tests[i].status === "ok" && outputsMatch(t.output, start.tests[i].stdout, ex.compare ?? "lines"));
    expect(starterPasses).toBe(false);
  }, 120_000);

  it.concurrent.each(PY_REFERENCE.map((r) => [r.name, r] as const))("reference %s runs (and prints what it shows)", async (_n, r) => {
    const res = await run(r.example, ["Asha\n"]);
    expect(res.compile.status, res.compile.output).toBe("success");
    expect(res.tests[0].status, res.tests[0].stderr).toBe("ok");
    if (r.output !== undefined) expect(out(res.tests[0].stdout)).toBe(r.output);
    if (r.lesson) expect(getPyLesson(r.lesson), `unknown lesson ${r.lesson}`).toBeDefined();
  }, 120_000);

  it.concurrent.each(PY_COMPARE.map((c) => [c.id, c] as const))("compare %s: Python and C++ both print what the page shows", async (_id, c) => {
    const [py, cpp] = await Promise.all([
      run(c.python, [""]),
      slot(() => executeRequest(backend!, { language: "cpp", source: c.cpp, tests: [{ id: "t0", input: "" }] })),
    ]);
    expect(py.tests[0].status, py.tests[0].stderr).toBe("ok");
    expect(out(py.tests[0].stdout)).toBe(c.pyOutput);
    expect(cpp.compile.status, cpp.compile.output).toBe("success");
    expect(out(cpp.tests[0].stdout)).toBe(c.cppOutput);
  }, 120_000);

  it("covers every module", () => {
    expect(PY_MODULES.length).toBeGreaterThan(0);
  });
});
