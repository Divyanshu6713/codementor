import type { QuestionDef } from "@/content/types";
import type { AnswerKey, QuestionContent } from "@/types/questions";

/** Small deterministic PRNG so a question's shuffled lines are stable across syncs. */
function seededRandom(seed: string) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/** Shuffled indices that are guaranteed not to be the identity order. */
export function shuffledOrder(n: number, seed: string): number[] {
  const rand = seededRandom(seed);
  for (let tries = 0; tries < 20; tries++) {
    const idx = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    if (idx.some((v, i) => v !== i)) return idx;
  }
  return Array.from({ length: n }, (_, i) => (i + 1) % n);
}

/** Splits an authored question into what the browser may see and the server-only answer key. */
export function splitQuestion(q: QuestionDef): { content: QuestionContent; answerKey: AnswerKey } {
  switch (q.type) {
    case "mcq":
    case "predict_output":
    case "identify_error":
      return {
        content: { type: q.type, prompt: q.prompt, code: q.code, options: q.options.map((o) => ({ id: o.id, text: o.text })) },
        answerKey: {
          type: q.type, correct: q.correct,
          options: q.options.map((o) => ({ id: o.id, misconception: o.misconception, feedback: o.feedback })),
        },
      };
    case "complete_code":
      return {
        content: { type: "complete_code", prompt: q.prompt, code: q.code! },
        answerKey: { type: "complete_code", accepted: q.accepted, wrongAnswers: q.wrongAnswers ?? [] },
      };
    case "reorder": {
      // shown[k] = q.lines[perm[k]]; the correct k-th line sits at position perm.indexOf(k).
      const perm = shuffledOrder(q.lines.length, q.id);
      return {
        content: { type: "reorder", prompt: q.prompt, lines: perm.map((i) => q.lines[i]) },
        answerKey: { type: "reorder", order: q.lines.map((_, k) => perm.indexOf(k)) },
      };
    }
    case "trace":
      return {
        content: { type: "trace", prompt: q.prompt, code: q.code!, fields: q.fields.map((f) => ({ label: f.label })) },
        answerKey: { type: "trace", fields: q.fields.map((f) => ({ answer: f.answer, wrong: f.wrong ?? [] })) },
      };
    case "write_code":
      return {
        content: {
          type: "write_code", prompt: q.prompt, starterCode: q.starterCode, compare: q.compare,
          samples: q.tests.filter((t) => t.visibility !== "hidden").map((t) => ({ label: t.label, input: t.input, output: t.output })),
        },
        answerKey: { type: "write_code", compare: q.compare, detectors: q.detectors, solutionWalkthrough: q.solutionWalkthrough },
      };
    case "explain":
      return {
        content: { type: "explain", prompt: q.prompt },
        answerKey: {
          type: "explain",
          rubric: { keyIdeas: q.rubric.keyIdeas, misconceptionPatterns: q.rubric.misconceptionPatterns ?? [], required: q.rubric.required },
        },
      };
  }
}
