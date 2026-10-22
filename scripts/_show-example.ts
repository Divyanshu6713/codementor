/* eslint-disable @typescript-eslint/no-explicit-any -- dev-only content helper */
import { PY_LESSONS } from "../src/content/python";
for (const id of process.argv.slice(2)) {
  const [lid, at] = id.split(":");
  const l = (PY_LESSONS as any[]).find((x) => x.id === lid);
  const code = l.example.code.split("\n");
  const n = at ? Number(at) : 0;
  for (let i = n ? Math.max(1, n - 3) : 1; i <= (n ? Math.min(code.length, n + 3) : code.length); i++) console.log(`${lid} ${i}: ${code[i - 1]}`);
  console.log("--");
}
