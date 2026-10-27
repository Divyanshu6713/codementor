/**
 * The adaptive question bank is verified with the real compiler, not by eye:
 *   - every predict_output question's correct option is exactly what its code prints,
 *   - every write_code question's reference solution passes all of its tests, and its starter doesn't,
 *   - every complete_code question compiles with its first accepted answer filled in.
 * Snippets without `int main` are wrapped in one (with the common headers) before compiling.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { QUESTIONS, CONCEPTS } from "@/content";
import { outputsMatch } from "@/server/execution/judge";
import { executeRequest } from "../worker/sandbox/runner";
import { createDevBackend } from "../worker/sandbox/backends";
import type { CompleteCodeQuestion, McqQuestion, WriteCodeQuestion } from "@/content/types";

const backend = createDevBackend();
const canRun = Boolean(backend.compiler);

const HEADERS = ["iostream", "iomanip", "string", "vector", "array", "algorithm", "numeric", "utility", "cmath", "climits",
  "cstring", "cctype", "map", "set", "unordered_map", "unordered_set", "stack", "queue", "deque", "list", "sstream",
  "functional", "tuple", "memory", "stdexcept", "optional", "string_view", "limits", "bitset"];

export function asProgram(code: string): string {
  const prelude = `${HEADERS.map((h) => `#include <${h}>`).join("\n")}\nusing namespace std;\n`;
  if (/\bint\s+main\s*\(/.test(code)) return `${prelude}${code}`;
  return `${prelude}int main() {\n${code}\n    return 0;\n}\n`;
}

const norm = (s: string) => s.replace(/`/g, "").replace(/\s+/g, " ").trim();

async function run(source: string, input = "") {
  return executeRequest(backend, { language: "cpp", source, tests: [{ id: "t", input }] });
}

describe("question bank structure", () => {
  it("every concept on the path has skills and a practice bank (3+ questions per skill)", () => {
    for (const c of CONCEPTS) {
      expect(c.skills.length, c.id).toBeGreaterThan(0);
      expect(c.status, c.id).toBe("active");
      const practice = QUESTIONS.filter((q) => q.conceptId === c.id && q.purposes.includes("practice"));
      expect(practice.length, `${c.id} practice questions`).toBeGreaterThanOrEqual(Math.max(6, c.skills.length * 3));
      for (const s of c.skills) {
        const n = practice.filter((q) => q.skills.some((x) => x.id === s.id)).length;
        expect(n, `${c.id}/${s.id} practice questions`).toBeGreaterThanOrEqual(2);
      }
    }
  });
});

describe.runIf(canRun)("question bank (real g++)", () => {
  beforeAll(async () => {
    await backend.init();
  }, 120_000);

  const predict = QUESTIONS.filter((q): q is McqQuestion => q.type === "predict_output" && q.verify !== false && Boolean(q.code));
  it.each(predict.map((q) => [q.id, q] as const))("%s prints its correct option", async (_id, q) => {
    const r = await run(asProgram(q.code!));
    expect(r.compile.status, r.compile.output).toBe("success");
    const correct = q.options.find((o) => o.id === q.correct)!.text;
    expect(norm(r.tests[0].stdout)).toBe(norm(correct));
    // ...and no wrong option is also exactly the output.
    for (const o of q.options) if (o.id !== q.correct) expect(norm(o.text), `${q.id} option ${o.id}`).not.toBe(norm(r.tests[0].stdout));
  });

  const writes = QUESTIONS.filter((q): q is WriteCodeQuestion => q.type === "write_code");
  it.each(writes.map((q) => [q.id, q] as const))("%s: reference passes, starter doesn't", async (_id, q) => {
    const tests = q.tests.map((t, i) => ({ id: `t${i}`, input: t.input }));
    const ref = await executeRequest(backend, { language: "cpp", source: q.referenceSolution, tests });
    expect(ref.compile.status, ref.compile.output).toBe("success");
    ref.tests.forEach((r, i) => expect(outputsMatch(r.stdout, q.tests[i].output, q.compare), `${q.id} / ${q.tests[i].label}: got ${JSON.stringify(r.stdout)}`).toBe(true));
    const starter = await executeRequest(backend, { language: "cpp", source: q.starterCode, tests });
    const allPass = starter.compile.status === "success" && starter.tests.every((r, i) => r.status === "ok" && outputsMatch(r.stdout, q.tests[i].output, q.compare));
    expect(allPass, `${q.id}: starter already passes`).toBe(false);
  });

  const blanks = QUESTIONS.filter((q): q is CompleteCodeQuestion => q.type === "complete_code" && q.verify !== false);
  it.each(blanks.map((q) => [q.id, q] as const))("%s compiles with its accepted answer", async (_id, q) => {
    const code = q.code!.replace("____", q.accepted[0]);
    const isDefinition = /^\s*(template\s*<[^>]*>\s*)?(struct|class|[\w:<>,&*]+\s+[\w:~]+\s*\([^;{]*\)\s*(const)?\s*\{)/.test(code);
    const program = /\bint\s+main\s*\(/.test(code) ? code
      : isDefinition ? `${code}\nint main() { return 0; }`
      : `{\n${declsFor(code)}\n${code}\n}`;
    const r = await run(asProgram(program));
    expect(r.compile.status, r.compile.output).toBe("success");
  });
});

/**
 * complete_code snippets often use variables declared elsewhere (age, n, arr…). Declare any
 * single-letter or common names that the snippet uses but doesn't declare, so it can compile.
 */
function declsFor(code: string): string {
  const decl: string[] = [];
  const known: Record<string, string> = {
    age: "int age = 0;", n: "int n = 3;", x: "int x = 0;", y: "int y = 0;", score: "int score = 0;", a: "int a = 1;", b: "int b = 2;",
    sum: "int sum = 0;", total: "int total = 0;", arr: "int arr[5] = {1, 2, 3, 4, 5};", v: "vector<int> v = {1, 2, 3};",
    s: "string s = \"abc\";", word: "string word = \"abc\";", grid: "int grid[3][3] = {};", p: "int* p = nullptr;",
    num: "int num = 5;", marks: "int marks = 50;", temp: "int temp = 20;", year: "int year = 2024;", i: "", count: "int count = 0;",
  };
  for (const [name, d] of Object.entries(known)) {
    if (!d) continue;
    const used = new RegExp(`\\b${name}\\b`).test(code);
    const declared = new RegExp(`\\b(int|double|string|char|bool|auto|long|vector<[^>]+>)[\\s*&]+([A-Za-z_]\\w*(\\s*=\\s*[^,;]+)?\\s*,\\s*)*${name}\\b`).test(code);
    if (used && !declared) decl.push(d);
  }
  return decl.join("\n");
}
