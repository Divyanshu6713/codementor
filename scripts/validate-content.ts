/**
 * `npm run content:validate` — structural checks for all curated content (adaptive engine + guest
 * course). The compiler-backed checks (solutions pass, examples print what they claim) run in
 * `npx vitest run tests/course-content.test.ts`.
 */
import { validateContent } from "../src/content";
import { COURSE_LESSONS, validateCourse } from "../src/content/course";

const problems = [...validateContent().map((p) => `engine: ${p}`), ...validateCourse().map((p) => `course: ${p}`)];
if (problems.length) {
  console.error(`Content has ${problems.length} problem(s):\n${problems.map((p) => `  - ${p}`).join("\n")}`);
  process.exit(1);
}
console.log(`Content OK — ${COURSE_LESSONS.length} course lessons and the adaptive engine's question bank validate.`);
