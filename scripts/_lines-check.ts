import { PY_MODULES } from "../src/content/python/modules";
const from = Number(process.argv[2] ?? 1);
for (const m of PY_MODULES.filter((m) => m.number >= from)) {
  for (const l of m.lessons) {
    const code = l.example.code.split("\n");
    for (const [n, text] of l.example.lines) {
      console.log(`${l.id}:${n} | ${(code[n - 1] ?? "<<OUT OF RANGE>>").trim().slice(0, 70)}  <=  ${text.slice(0, 60)}`);
    }
  }
}
