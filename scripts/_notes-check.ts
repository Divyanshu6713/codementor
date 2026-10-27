// Dev helper: print every worked-example note next to the code line it points at, for review.
// usage: npx tsx scripts/_notes-check.ts <moduleId>
import { COURSE_LESSONS } from "../src/content/course";

const moduleId = process.argv[2];
for (const l of COURSE_LESSONS.filter((x) => !moduleId || x.moduleId === moduleId)) {
  const lines = l.example.code.split("\n");
  console.log(`\n# ${l.id}`);
  for (const n of l.example.notes) console.log(`  ${n.line}: ${lines[n.line - 1]?.trim()}\n     ↳ ${n.text}`);
}
