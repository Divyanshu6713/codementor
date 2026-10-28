/**
 * Course content is verified with the real compiler, not by eye:
 *   - every exercise's reference solution passes all of its tests,
 *   - every starter program does NOT already pass (so the exercise asks for real work),
 *   - every worked example prints exactly the output the lesson claims,
 *   - and the structure validates.
 * Needs a sandbox backend with g++ (windows-job on Windows, local on macOS/Linux); skipped without one.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { COURSE_LESSONS, COURSE_MODULES, neighbours, roadmap, toPublicLesson, toPublicProblem, validateCourse } from "@/content/course";
import { TRACES } from "@/content/traces";
import { CONCEPTS } from "@/content/curriculum";
import { renderManifest } from "@/content/course/manifest";
import { assembleFillIn, blankAnswer, fillInPuzzle } from "@/content/course/fill-in";
import { readFileSync } from "node:fs";
import { outputsMatch } from "@/server/execution/judge";
import { executeRequest } from "../worker/sandbox/runner";
import { createDevBackend } from "../worker/sandbox/backends";
import type { SandboxBackend } from "../worker/sandbox/backends/types";

const backend: SandboxBackend | null = createDevBackend();
const canRun = Boolean(backend?.compiler);

describe("course structure", () => {
  it("validates", () => {
    expect(validateCourse()).toEqual([]);
  });

  it("has the 17-module roadmap, and every module has published lessons", () => {
    expect(COURSE_MODULES.map((m) => m.id)).toEqual([
      "foundations", "variables-io", "operators", "logic", "loops", "functions", "arrays-strings", "pointers", "oop",
      "modern-cpp", "stl", "searching-sorting", "data-structures", "algorithms", "files-exceptions", "advanced-cpp", "projects",
    ]);
    expect(COURSE_MODULES.map((m) => m.number)).toEqual(COURSE_MODULES.map((_, i) => i + 1));
    // Every one of the 17 areas has published, compiler-verified lessons (not just planned titles).
    for (const m of COURSE_MODULES) expect(m.lessons.length, m.id).toBeGreaterThan(0);
    expect(COURSE_LESSONS.length).toBe(COURSE_MODULES.reduce((n, m) => n + m.lessons.length, 0));
  });

  // Regression: the course used to end after Loops because later modules had no lessons.
  it("continues past Loops into Functions and Arrays & Strings", () => {
    const fn = COURSE_MODULES.find((m) => m.id === "functions")!;
    const arr = COURSE_MODULES.find((m) => m.id === "arrays-strings")!;
    expect(fn.lessons.length).toBeGreaterThanOrEqual(6);
    expect(arr.lessons.length).toBeGreaterThanOrEqual(7);
    expect(neighbours("loop-patterns").next?.id).toBe(fn.lessons[0]);
    expect(neighbours(fn.lessons[0]).prev?.id).toBe("loop-patterns");
    expect(neighbours(fn.lessons.at(-1)!).next?.id).toBe(arr.lessons[0]);
  });

  it("links every lesson to the next one, in roadmap order, with no dead ends", () => {
    const order = roadmap().flatMap((m) => m.lessons.map((l) => l.id));
    expect(order).toEqual(COURSE_LESSONS.map((l) => l.id));
    order.forEach((id, i) => {
      const { prev, next } = neighbours(id);
      expect(prev?.id ?? null, id).toBe(order[i - 1] ?? null);
      expect(next?.id ?? null, id).toBe(order[i + 1] ?? null);
    });
  });

  // Regression: the concept map ("The full path") showed these as "coming later" with a lock and no link.
  it("every concept in the full path opens at least one published lesson — no 'coming later' rows", () => {
    const published = new Set(COURSE_LESSONS.map((l) => l.id));
    for (const c of CONCEPTS) {
      expect(c.courseLessons.length, c.id).toBeGreaterThan(0);
      for (const id of c.courseLessons) expect(published.has(id), `${c.id} → ${id}`).toBe(true);
    }
    const reported = ["strings", "2d-arrays", "pointers", "oop", "stl", "complexity", "searching-sorting", "recursion"];
    for (const id of reported) expect(CONCEPTS.find((c) => c.id === id)?.courseLessons.length, id).toBeGreaterThan(0);
  });

  it("prerequisites are advice: every one names a real concept that comes earlier in the path", () => {
    const order = CONCEPTS.map((c) => c.id);
    for (const c of CONCEPTS) for (const p of c.prerequisites) expect(order.indexOf(p.id), `${c.id} → ${p.id}`).toBeGreaterThanOrEqual(0);
    for (const c of CONCEPTS) for (const p of c.prerequisites) expect(order.indexOf(p.id), `${c.id} → ${p.id}`).toBeLessThan(order.indexOf(c.id));
  });

  it("keeps the module ids that progress, XP bonuses and achievements depend on", () => {
    const ids = new Set(COURSE_MODULES.map((m) => m.id));
    for (const id of ["foundations", "logic", "loops", "functions", "arrays-strings", "pointers"]) expect(ids.has(id), id).toBe(true);
    // Lesson ids are the progress keys: renaming one would orphan stored progress.
    for (const id of ["what-is-programming", "variables", "operators", "if-else", "why-loops", "for-loops", "loop-patterns"]) {
      expect(COURSE_LESSONS.some((l) => l.id === id), id).toBe(true);
    }
  });

  it("docs/CPP_CURRICULUM_MANIFEST.md is up to date (run npm run content:manifest)", () => {
    expect(readFileSync("docs/CPP_CURRICULUM_MANIFEST.md", "utf8").replace(/\r\n/g, "\n")).toBe(renderManifest());
  });

  it("never sends hidden tests or reference solutions to the browser", () => {
    for (const l of COURSE_LESSONS) {
      const pub = JSON.stringify(toPublicLesson(l));
      expect(pub).not.toContain(l.exercise.solution);
      for (const p of l.practice ?? []) {
        expect(pub).not.toContain(p.solution);
        const pp = JSON.stringify(toPublicProblem(p));
        expect(pp).not.toContain(p.solution);
        for (const t of p.tests.filter((x) => x.visibility === "hidden")) {
          expect(pp.includes(JSON.stringify(t.label)) && pp.includes(JSON.stringify(t.input))).toBe(false);
        }
      }
      for (const t of l.exercise.tests.filter((x) => x.visibility === "hidden")) {
        expect(pub.includes(JSON.stringify(t.label)) && pub.includes(JSON.stringify(t.input))).toBe(false);
      }
    }
  });
});

describe("Complete the code", () => {
  const all = COURSE_LESSONS.flatMap((l) => [l.exercise, ...(l.practice ?? [])].map((ex) => ({ id: l.id, ex })));

  it("has a puzzle for nearly every exercise, with 1–3 blanks", () => {
    const withPuzzle = all.filter(({ ex }) => fillInPuzzle(ex));
    expect(withPuzzle.length / all.length).toBeGreaterThan(0.9);
    for (const { ex } of withPuzzle) {
      const n = fillInPuzzle(ex)!.blanks.length;
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(3);
    }
  });

  it("our own answers rebuild exactly the reference solution, and the puzzle hides those lines", () => {
    for (const { id, ex } of all) {
      const p = fillInPuzzle(ex);
      if (!p) continue;
      const answers = p.blanks.map((b) => blankAnswer(ex, b));
      expect(assembleFillIn(p, answers), `${id}: ${ex.title}`).toBe(ex.solution);
      for (const b of p.blanks) expect(p.lines[b.line], id).toBeNull();
      // Blanks are never lines the starter already gives away (a line may appear once in the starter and twice in the solution).
      const count = (text: string, line: string) => text.split("\n").filter((l) => l.trim() === line).length;
      for (const b of p.blanks) {
        const line = ex.solution.split("\n")[b.line].trim();
        expect(count(ex.solution, line), `${id}: ${line}`).toBeGreaterThan(count(ex.starterCode, line));
      }
    }
  });
});

describe.runIf(canRun)("course content compiles and is correct (real g++)", () => {
  beforeAll(async () => {
    await backend!.init();
  }, 120_000);

  const run = (source: string, inputs: string[]) =>
    executeRequest(backend!, { language: "cpp", source, tests: inputs.map((input, i) => ({ id: `t${i}`, input })) });

  it.each(COURSE_LESSONS.map((l) => [l.id, l] as const))("%s: solution passes every test", async (_id, l) => {
    const res = await run(l.exercise.solution, l.exercise.tests.map((t) => t.input));
    expect(res.compile.status, res.compile.output).toBe("success");
    l.exercise.tests.forEach((t, i) => {
      expect(res.tests[i].status, t.label).toBe("ok");
      expect(outputsMatch(t.output, res.tests[i].stdout, l.exercise.compare), `${t.label}: got ${JSON.stringify(res.tests[i].stdout)}`).toBe(true);
    });
  }, 60_000);

  it.each(COURSE_LESSONS.map((l) => [l.id, l] as const))("%s: starter code does not already pass", async (_id, l) => {
    const res = await run(l.exercise.starterCode, l.exercise.tests.map((t) => t.input));
    const allPass = res.compile.status === "success" &&
      l.exercise.tests.every((t, i) => res.tests[i].status === "ok" && outputsMatch(t.output, res.tests[i].stdout, l.exercise.compare));
    expect(allPass).toBe(false);
  }, 60_000);

  const PRACTICE = COURSE_LESSONS.flatMap((l) => (l.practice ?? []).map((p) => [`${l.id}~${p.id}`, p] as const));
  it.each(PRACTICE)("practice %s: solution passes every test, starter doesn't", async (_key, p) => {
    const inputs = p.tests.map((t) => t.input);
    const res = await run(p.solution, inputs);
    expect(res.compile.status, res.compile.output).toBe("success");
    p.tests.forEach((t, i) => {
      expect(res.tests[i].status, t.label).toBe("ok");
      expect(outputsMatch(t.output, res.tests[i].stdout, p.compare), `${t.label}: got ${JSON.stringify(res.tests[i].stdout)}`).toBe(true);
    });
    const st = await run(p.starterCode, inputs);
    const allPass = st.compile.status === "success" && p.tests.every((t, i) => st.tests[i].status === "ok" && outputsMatch(t.output, st.tests[i].stdout, p.compare));
    expect(allPass, "starter already passes").toBe(false);
  }, 60_000);

  // Dry-run traces are hand-modelled in TypeScript; this keeps them honest against real C++.
  it.each(TRACES.map((t) => [t.id, t] as const))("trace %s ends with the output real C++ prints", async (_id, t) => {
    const body = t.code.includes("main(") ? t.code : `int main() {\n${t.code}\n}`;
    const res = await run(`#include <iostream>\nusing namespace std;\n${body}\n`, [""]);
    expect(res.compile.status, res.compile.output).toBe("success");
    expect(res.tests[0].stdout.replace(/\r\n/g, "\n")).toBe(t.steps.at(-1)!.output);
  }, 60_000);

  it.each(COURSE_LESSONS.map((l) => [l.id, l] as const))("%s: worked example prints what the lesson says", async (_id, l) => {
    const res = await run(l.example.code, [l.example.input ?? ""]);
    expect(res.compile.status, res.compile.output).toBe("success");
    expect(res.tests[0].stdout.replace(/\r\n/g, "\n")).toBe(l.example.output);
  }, 60_000);
});
