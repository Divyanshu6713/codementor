import { FOR_LOOP_QUESTIONS } from "../questions/for-loops";
import type { WriteCodeQuestion } from "../types";
import type { Exercise } from "./types";

/**
 * Reuses an already-reviewed coding question from the adaptive engine's bank as a course
 * exercise, so the two experiences share one validated source (tests + reference solution).
 * The engine's five hint levels map onto the course's four: its level-4 fill-in skeleton is
 * appended to the "approach" hint.
 */
export function exerciseFromQuestion(id: string, title: string): Exercise {
  const q = FOR_LOOP_QUESTIONS.find((x): x is WriteCodeQuestion => x.id === id && x.type === "write_code");
  if (!q) throw new Error(`exerciseFromQuestion: no write_code question "${id}"`);
  const [h1, h2, h3, h4, skeleton] = q.hints;
  return {
    title,
    prompt: q.prompt,
    starterCode: q.starterCode,
    // "visible" tests are shown in the lesson just like samples.
    tests: q.tests.map((t) => ({ ...t, visibility: t.visibility === "hidden" ? "hidden" : "sample" })),
    compare: q.compare,
    hints: [h1, h2, h3, `${h4}\n\n\`\`\`cpp\n${skeleton}\n\`\`\``],
    solution: q.referenceSolution,
    solutionNotes: q.solutionWalkthrough,
  };
}
