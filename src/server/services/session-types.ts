import type { Decision, SessionLength } from "@/server/learning/engine";
import type { DiagAnswer } from "@/server/learning/diagnostic";
import type { PublicJudgeView } from "@/server/execution/judge";

/** Why a question is being asked — controls attempts, hints and how the answer counts. */
export type ItemRole = "diagnostic" | "checkpoint" | "retry" | "code" | "explain" | "practice" | "exit" | "revision";

export type QueueEntry =
  | { t: "step"; key: string }
  | { t: "notice"; title: string; body: string }
  | { t: "q"; questionId: string; role: ItemRole; stepKey?: string; mode?: "guided" | "independent" | "debug" }
  /** Expands into adaptively chosen questions when the runner reaches it. */
  | { t: "slot"; role: "practice" | "exit" | "revision"; skills: string[]; remaining: number };

export interface AnswerFeedback {
  correct: boolean;
  score: number;
  /** Authored feedback for this particular wrong answer. */
  feedback: string | null;
  /** Deterministic description of what the code/answer did. */
  whatHappened: string | null;
  /** Misconceptions explained to the student (only once the item is resolved or re-taught). */
  misconceptions: { code: string; title: string; explanation: string }[];
  /** AI (or curated) explanation and guiding question for a wrong answer. */
  tutor: { text: string; question: string | null; source: "ai" | "curated" } | null;
  judge: PublicJudgeView | null;
  fieldResults?: boolean[];
  ideas?: { id: string; label: string; found: boolean }[];
  evaluator?: "rubric" | "ai";
  /** Misconceptions not recorded because the student said they were guessing. */
  uncertain?: boolean;
  /** XP earned for finishing this item (only when resolved; never negative). */
  xp?: number;
  /** Misconceptions this answer cleared (two clean answers in a row on probing questions). */
  cleared?: string[];
}

export interface ItemState {
  itemKey: string;
  questionId: string;
  versionId: string;
  role: ItemRole;
  mode?: "guided" | "independent" | "debug";
  attempts: number;
  maxHint: number;
  revealed: boolean;
  resolved: boolean;
  correct: boolean | null;
  misconceptions: string[];
  askConfidence: boolean;
  hints: { level: number; text: string; source: "ai" | "curated" }[];
  last: AnswerFeedback | null;
  /** Last code the student submitted (so a reload keeps their work). */
  lastSource: string | null;
  /**
   * Hidden test cases are shown after a wrong submission (practice/lesson coding only). Solving
   * after that still counts, but like using a hint — not as a solo solve.
   */
  testsRevealed?: boolean;
  solution: { answer: string | null; code: string | null; walkthrough: string } | null;
  stepKey?: string;
}

export interface SessionState {
  queue: QueueEntry[];
  pos: number;
  item: ItemState | null;
  /** Difficulty ladder for adaptive slots. */
  difficulty: number;
  history: { correct: boolean; independent: boolean; maxHintLevel: number }[];
  served: string[];
  itemCount: number;
  diag?: { entry: number; answers: DiagAnswer[] };
}

export interface SessionPlan {
  decision: Decision | null;
  lessonId?: string;
  length: SessionLength;
  mistakeId?: string;
  title: string;
}
