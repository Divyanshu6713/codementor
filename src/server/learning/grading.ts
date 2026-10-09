/**
 * Deterministic grading for every non-code question type, including which misconceptions an
 * answer is evidence for. Code questions are graded by the judge (src/server/execution/judge.ts).
 */
import type { MistakeCategory } from "@/server/db/schema";
import type { AnswerKey, StudentAnswer, WrongAnswer } from "@/types/questions";

export interface GradeResult {
  correct: boolean;
  /** 0..1 partial score */
  score: number;
  misconceptions: string[];
  /** Short, specific feedback for this particular wrong answer (authored). */
  feedback: string | null;
  /** Trace questions: which fields were right. */
  fieldResults?: boolean[];
  /** Explain questions: which key ideas were found. */
  ideas?: { id: string; label: string; found: boolean }[];
}

/** Whitespace-insensitive, trailing-semicolon-insensitive comparison for code fragments. */
export function normalizeFragment(s: string) {
  return s.replace(/\s+/g, "").replace(/;+$/, "").toLowerCase();
}

export function normalizeValue(s: string) {
  return s.trim().replace(/\s+/g, " ").replace(/^"(.*)"$/, "$1").toLowerCase();
}

function matchWrong(wrong: WrongAnswer[], value: string, norm: (s: string) => string) {
  return wrong.find((w) => norm(w.answer) === norm(value));
}

export function gradeAnswer(key: AnswerKey, answer: StudentAnswer): GradeResult {
  switch (key.type) {
    case "mcq":
    case "predict_output":
    case "identify_error": {
      if (answer.type !== "choice") throw new Error("Expected a choice answer.");
      const correct = answer.optionId === key.correct;
      const opt = key.options.find((o) => o.id === answer.optionId);
      if (!opt) throw new Error("Unknown option.");
      return {
        correct, score: correct ? 1 : 0,
        misconceptions: !correct && opt.misconception ? [opt.misconception] : [],
        feedback: correct ? null : opt.feedback ?? null,
      };
    }
    case "complete_code": {
      if (answer.type !== "text") throw new Error("Expected a text answer.");
      const value = normalizeFragment(answer.text);
      const correct = key.accepted.some((a) => normalizeFragment(a) === value);
      const wrong = correct ? undefined : matchWrong(key.wrongAnswers, answer.text, normalizeFragment);
      return {
        correct, score: correct ? 1 : 0,
        misconceptions: wrong?.misconception ? [wrong.misconception] : [],
        feedback: wrong?.feedback ?? null,
      };
    }
    case "reorder": {
      if (answer.type !== "order") throw new Error("Expected an order answer.");
      const n = key.order.length;
      if (answer.order.length !== n || new Set(answer.order).size !== n || answer.order.some((i) => i < 0 || i >= n)) {
        throw new Error("The order must use every line exactly once.");
      }
      const right = answer.order.filter((v, i) => v === key.order[i]).length;
      return { correct: right === n, score: right / n, misconceptions: [], feedback: null };
    }
    case "trace": {
      if (answer.type !== "fields") throw new Error("Expected field answers.");
      const fieldResults = key.fields.map((f, i) => normalizeValue(answer.values[i] ?? "") === normalizeValue(f.answer));
      const misconceptions = new Set<string>();
      let feedback: string | null = null;
      key.fields.forEach((f, i) => {
        if (fieldResults[i]) return;
        const w = matchWrong(f.wrong, answer.values[i] ?? "", normalizeValue);
        if (w?.misconception) misconceptions.add(w.misconception);
        feedback ??= w?.feedback ?? null;
      });
      const right = fieldResults.filter(Boolean).length;
      return { correct: right === key.fields.length, score: right / key.fields.length, misconceptions: [...misconceptions], feedback, fieldResults };
    }
    case "explain": {
      if (answer.type !== "text") throw new Error("Expected a text answer.");
      return evaluateExplanationRubric(key.rubric, answer.text);
    }
    case "write_code":
      throw new Error("Code answers are graded by the judge.");
  }
}

/**
 * Rubric check for explain-it-back answers: looks for each key idea's phrasings. It's a coarse,
 * transparent signal (the UI says so) and only one input to mastery, with low weight.
 * Writing style, spelling and grammar are deliberately ignored.
 */
export function evaluateExplanationRubric(rubric: Extract<AnswerKey, { type: "explain" }>["rubric"], text: string): GradeResult {
  const t = text.toLowerCase();
  const ideas = rubric.keyIdeas.map((k) => ({ id: k.id, label: k.label, found: k.patterns.some((p) => new RegExp(p, "i").test(t)) }));
  const misconceptions = rubric.misconceptionPatterns.filter((m) => new RegExp(m.pattern, "i").test(t)).map((m) => m.misconception);
  const hits = ideas.filter((i) => i.found).length;
  const tooShort = t.trim().split(/\s+/).length < 6;
  const score = tooShort ? 0 : Math.min(1, hits / rubric.required);
  return { correct: !tooShort && hits >= rubric.required && !misconceptions.length, score, misconceptions, feedback: null, ideas };
}

/** Default mistake category when no misconception pins it down. */
export function defaultCategory(questionType: string, misconceptionCategory?: MistakeCategory): MistakeCategory {
  if (misconceptionCategory) return misconceptionCategory;
  if (questionType === "identify_error") return "syntax";
  if (questionType === "write_code") return "logic";
  return "conceptual";
}
