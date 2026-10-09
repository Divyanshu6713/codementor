/**
 * Course content is verified with the real compiler, not by eye:
 *   - every exercise's reference solution passes all of its tests,
 *   - every starter program does NOT already pass (so the exercise asks for real work),
 *   - every worked example prints exactly the output the lesson claims,
 *   - and the structure validates.
 * Needs a sandbox backend (windows-job on Windows with g++); skipped elsewhere.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { COURSE_LESSONS, COURSE_MODULES, toPublicLesson, validateCourse } from "@/content/course";
import { outputsMatch } from "@/server/execution/judge";
import { executeRequest } from "../worker/sandbox/runner";
import { createWindowsJobBackend } from "../worker/sandbox/backends/windows-job";
import type { SandboxBackend } from "../worker/sandbox/backends/types";

const backend: SandboxBackend | null = process.platform === "win32" ? createWindowsJobBackend() : null;
const canRun = Boolean(backend?.compiler);

describe("course structure", () => {
  it("validates", () => {
    expect(validateCourse()).toEqual([]);
  });

  it("covers modules 1–3 with complete lessons and lists the rest as planned", () => {
    expect(COURSE_MODULES.slice(0, 3).map((m) => m.lessons.length)).toEqual([8, 7, 7]);
    expect(COURSE_MODULES.slice(3).every((m) => m.lessons.length === 0 && (m.planned?.length ?? 0) > 0)).toBe(true);
  });

  it("never sends hidden tests or reference solutions to the browser", () => {
    for (const l of COURSE_LESSONS) {
      const pub = JSON.stringify(toPublicLesson(l));
      expect(pub).not.toContain(l.exercise.solution);
      for (const t of l.exercise.tests.filter((x) => x.visibility === "hidden")) {
        expect(pub.includes(JSON.stringify(t.label)) && pub.includes(JSON.stringify(t.input))).toBe(false);
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

  it.each(COURSE_LESSONS.map((l) => [l.id, l] as const))("%s: worked example prints what the lesson says", async (_id, l) => {
    const res = await run(l.example.code, [l.example.input ?? ""]);
    expect(res.compile.status, res.compile.output).toBe("success");
    expect(res.tests[0].stdout.replace(/\r\n/g, "\n")).toBe(l.example.output);
  }, 60_000);
});
