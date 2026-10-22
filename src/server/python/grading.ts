/**
 * Deterministic grading of Python questions (multiple choice, predict-the-output, fill-in-the-blank,
 * find-the-bug). Pure functions: no database, no AI. Every result explains why the answer is right
 * or wrong.
 */
import { z } from "zod";
import type { PyQuestion, QuestionRef } from "@/content/python";

export const AnswerSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("mcq"), choice: z.number().int().min(0).max(20) }),
  z.object({ kind: z.literal("predict"), text: z.string().max(4000) }),
  z.object({ kind: z.literal("fill"), blanks: z.array(z.string().max(300)).max(10) }),
  z.object({ kind: z.literal("bug"), line: z.number().int().min(1).max(400) }),
]);
export type PyAnswer = z.infer<typeof AnswerSchema>;

export interface GradeResult {
  correct: boolean;
  /** Why the learner's specific answer is right or wrong. */
  feedback: string;
  /** Why the correct answer is correct. */
  explanation: string;
  /** The correct answer, for display after the attempt. */
  correctAnswer: { kind: PyQuestion["kind"]; text: string; code?: string; choice?: number; line?: number; blanks?: string[] };
}

/**
 * Output comparison for predict-the-output: line by line, ignoring trailing spaces and blank lines
 * at the end. A tab counts as one space (a tab can't be typed into the answer box).
 */
export function normalizeOutput(s: string): string {
  const lines = s.replace(/\r\n?/g, "\n").replace(/\t/g, " ").split("\n").map((l) => l.replace(/\s+$/, ""));
  while (lines.length && lines[lines.length - 1] === "") lines.pop();
  return lines.join("\n");
}

/** Fill-in answers compare without whitespace (so `range(1,5)` and `range(1, 5)` both count). */
const squash = (s: string) => s.replace(/\s+/g, "");

export function correctAnswerOf(q: PyQuestion): GradeResult["correctAnswer"] {
  switch (q.kind) {
    case "mcq": return { kind: "mcq", choice: q.answer, text: q.options[q.answer].text };
    case "predict": return { kind: "predict", text: normalizeOutput(q.answer) };
    case "fill": return { kind: "fill", blanks: q.blanks.map((b) => b[0]), text: q.blanks.map((b) => b[0]).join(" · ") };
    case "bug": return { kind: "bug", line: q.line, text: `Line ${q.line}`, code: q.fix };
  }
}

export function gradeAnswer(ref: QuestionRef, answer: PyAnswer): GradeResult {
  const q = ref.q;
  const correctAnswer = correctAnswerOf(q);
  if (answer.kind !== q.kind) throw new Error(`Answer kind ${answer.kind} doesn't match question kind ${q.kind}`);
  switch (q.kind) {
    case "mcq": {
      const a = answer as Extract<PyAnswer, { kind: "mcq" }>;
      const chosen = q.options[a.choice];
      const correct = a.choice === q.answer;
      return { correct, feedback: chosen ? chosen.why : "That option doesn't exist.", explanation: q.explain, correctAnswer };
    }
    case "predict": {
      const a = answer as Extract<PyAnswer, { kind: "predict" }>;
      const got = normalizeOutput(a.text);
      const want = normalizeOutput(q.answer);
      const correct = got === want;
      let feedback = correct ? "Exactly what Python prints." : "That's not what Python prints.";
      if (!correct) {
        if (got.toLowerCase() === want.toLowerCase()) feedback = "Very close — but check upper and lower case.";
        else if (got.replace(/\s+/g, " ").trim() === want.replace(/\s+/g, " ").trim()) feedback = "The values are right, but the spaces or line breaks differ. Remember: each `print` ends its line, and commas add one space.";
        else if (got.split("\n").length !== want.split("\n").length) feedback = `Python prints ${want.split("\n").length} line${want.split("\n").length === 1 ? "" : "s"}; you wrote ${got ? got.split("\n").length : 0}.`;
      }
      return { correct, feedback, explanation: q.explain, correctAnswer };
    }
    case "fill": {
      const a = answer as Extract<PyAnswer, { kind: "fill" }>;
      const results = q.blanks.map((accepted, i) => accepted.some((acc) => squash(acc) === squash(a.blanks[i] ?? "")));
      const correct = results.every(Boolean) && a.blanks.length === q.blanks.length;
      const wrong = results.map((ok, i) => (ok ? null : i + 1)).filter((x): x is number => x !== null);
      return {
        correct,
        feedback: correct ? "All blanks are right." : wrong.length === q.blanks.length ? "None of the blanks are right yet." : `Blank${wrong.length > 1 ? "s" : ""} ${wrong.join(", ")} ${wrong.length > 1 ? "aren't" : "isn't"} right.`,
        explanation: q.explain, correctAnswer,
      };
    }
    case "bug": {
      const a = answer as Extract<PyAnswer, { kind: "bug" }>;
      const correct = a.line === q.line;
      const near = Math.abs(a.line - q.line) === 1;
      return {
        correct,
        feedback: correct ? "Yes — that's the faulty line." : near ? "Close — the problem is on a neighbouring line. Python sometimes reports an error a line late, but look at what each line actually does." : `Line ${a.line} is fine.`,
        explanation: q.explain, correctAnswer,
      };
    }
  }
}

/** A short, safe copy of the answer for the learner's history. */
export function answerSummary(answer: PyAnswer, q: PyQuestion): string {
  switch (answer.kind) {
    case "mcq": return q.kind === "mcq" ? (q.options[answer.choice]?.text ?? "?").slice(0, 200) : "?";
    case "predict": return answer.text.slice(0, 300);
    case "fill": return answer.blanks.join(" · ").slice(0, 300);
    case "bug": return `line ${answer.line}`;
  }
}
