/**
 * Shapes of question content as stored in question_versions.
 * `QuestionContent` is safe to send to the browser; `AnswerKey` never leaves the server.
 */
import type { DetectorDef } from "@/content/types";

export type QuestionContent =
  | { type: "mcq" | "predict_output" | "identify_error"; prompt: string; code?: string; options: { id: string; text: string }[] }
  | { type: "complete_code"; prompt: string; code: string }
  | { type: "reorder"; prompt: string; lines: string[] }
  | { type: "trace"; prompt: string; code: string; fields: { label: string }[] }
  | { type: "write_code"; prompt: string; starterCode: string; samples: { label: string; input: string; output: string }[]; compare: "tokens" | "lines" }
  | { type: "explain"; prompt: string };

export interface WrongAnswer {
  answer: string;
  misconception?: string;
  feedback?: string;
}

export type AnswerKey =
  | { type: "mcq" | "predict_output" | "identify_error"; correct: string; options: { id: string; misconception?: string; feedback?: string }[] }
  | { type: "complete_code"; accepted: string[]; wrongAnswers: WrongAnswer[] }
  /** order[k] = index (in the presented, shuffled list) of the k-th line of the correct program. */
  | { type: "reorder"; order: number[] }
  | { type: "trace"; fields: { answer: string; wrong: WrongAnswer[] }[] }
  | { type: "write_code"; compare: "tokens" | "lines"; detectors: DetectorDef[]; solutionWalkthrough: string }
  | {
      type: "explain";
      rubric: {
        keyIdeas: { id: string; label: string; patterns: string[] }[];
        misconceptionPatterns: { pattern: string; misconception: string }[];
        required: number;
      };
    };

/** What a student submits for each question type. */
export type StudentAnswer =
  | { type: "choice"; optionId: string }
  | { type: "text"; text: string }
  | { type: "order"; order: number[] }
  | { type: "fields"; values: string[] }
  | { type: "code"; source: string };
