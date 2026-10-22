/* eslint-disable @typescript-eslint/no-explicit-any -- dev-only content helper */
// Dev helper: print what real Python prints for a lesson example / question / solution.
// usage: npx tsx scripts/_run.ts <lessonId|moduleId> <example|qid|exam:qid|ex:id|project>
// For ex:id and project, every test input defined in the content is run.
import { execFileSync } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PY_LESSONS, PY_MODULES } from "../src/content/python";
const [id, what] = process.argv.slice(2);
const lesson: any = (PY_LESSONS as any[]).find((l) => l.id === id);
const mod: any = (PY_MODULES as any[]).find((m) => m.id === id);
const dir = mkdtempSync(join(tmpdir(), "cm-"));
function py(code: string, input = "") {
  writeFileSync(join(dir, "main.py"), code);
  try {
    return execFileSync("python", ["-X", "utf8", "main.py"], { cwd: dir, input, env: { ...process.env, PYTHONHASHSEED: "0" } }).toString().replace(/\r\n/g, "\n");
  } catch (e: any) { return "ERROR " + e.stderr?.toString(); }
}
let ex: any = null;
if (what === "project") ex = mod.project;
else if (what.startsWith("ex:")) ex = lesson.exercises.find((e: any) => e.id === what.slice(3));
if (ex) {
  for (const t of ex.tests) {
    const got = py(ex.solution, t.input).trimEnd();
    console.log(`${t.label}: ${got === t.output ? "MATCH" : "DIFF"}\n${JSON.stringify(got)}`);
  }
} else {
  let code = "";
  if (what === "example") code = lesson.example.code;
  else if (what.startsWith("exam:")) code = mod.exam.find((q: any) => q.id === what.slice(5)).code;
  else {
    const q = lesson.questions.find((x: any) => x.id === what);
    code = q.kind === "bug" ? q.fix : q.kind === "fill" ? q.code.replace(/___/g, () => q.blanks.shift()[0]) : q.code;
  }
  console.log(JSON.stringify(py(code)));
}
