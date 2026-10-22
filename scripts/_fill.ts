/* eslint-disable @typescript-eslint/no-explicit-any -- dev-only content helper */
// Dev helper: replace "?" placeholders in a module file with what real Python prints.
// Traversal order matches source order: per lesson example → questions → exercise tests; then exam; then project tests.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PY_MODULES } from "../src/content/python";
const [file, moduleId] = process.argv.slice(2);
const mod: any = (PY_MODULES as any[]).find((m) => m.id === moduleId);
const dir = mkdtempSync(join(tmpdir(), "cmfill-"));
function py(code: string, input = "", files: any[] = []): string {
  writeFileSync(join(dir, "main.py"), code);
  for (const f of files) writeFileSync(join(dir, f.name), f.content);
  try {
    return execFileSync("python", ["-X", "utf8", "main.py"], { cwd: dir, input, env: { ...process.env, PYTHONHASHSEED: "0" } }).toString().replace(/\r\n/g, "\n");
  } catch (e: any) { throw new Error(`python failed:\n${code}\n${e.stderr}`); }
}
const values: string[] = [];
const fillQ = (q: any) => {
  if (q.kind === "predict" && q.answer === "?") values.push(py(q.code, q.input ?? "", q.files ?? []));
  if (q.kind === "fill" && q.output === "?") { let i = 0; values.push(py(q.code.replace(/___/g, () => q.blanks[i++][0]))); }
  if (q.kind === "bug" && q.output === "?") values.push(py(q.fix, q.input ?? ""));
};
const fillEx = (ex: any) => { for (const t of ex.tests) if (t.output === "?") values.push(py(ex.solution, t.input, ex.files ?? []).trimEnd()); };
for (const l of mod.lessons) {
  if (l.example.output === "?") values.push(py(l.example.code, "", l.example.files ?? []));
  l.questions.forEach(fillQ);
  l.exercises.forEach(fillEx);
}
mod.exam.forEach(fillQ);
fillEx(mod.project);
let src = readFileSync(file, "utf8");
let n = 0;
src = src.replace(/(output|answer): "\?"/g, (_m, key) => `${key}: ${JSON.stringify(values[n++])}`);
if (n !== values.length) throw new Error(`placeholder count ${n} != computed ${values.length}`);
writeFileSync(file, src);
console.log(`filled ${n} placeholders`);
