/*
 * Authoring types for the canonical curriculum.
 *
 * Content is code so it is reviewed, versioned with git and type-checked. The sync step
 * (src/server/content/sync.ts) hashes every definition: a changed question or lesson becomes a new
 * version row, so past attempts stay attached to exactly what the student saw.
 *
 * Rich text uses a tiny safe markdown subset (paragraphs, **bold**, `code`, ```cpp blocks, "- " lists)
 * rendered to React elements — never raw HTML.
 */
import type { MistakeCategory, QuestionType } from "@/server/db/schema";

export type ContentStatus = "active" | "planned";

export interface TrackDef {
  id: string;
  title: string;
  description: string;
  order: number;
  status: ContentStatus;
}

export interface SkillDef {
  id: string;
  title: string;
  description: string;
}

export interface ConceptDef {
  id: string;
  trackId: string;
  title: string;
  summary: string;
  status: ContentStatus;
  prerequisites: { id: string; strength: "required" | "recommended" }[];
  skills: SkillDef[];
  /**
   * Step-by-step course lessons (src/content/course) that teach this concept, in order. A concept
   * with course lessons is open to everyone even when `status` is "planned" — `status` only says
   * whether the adaptive engine has its own questions for it yet. Prerequisites are advice, never locks.
   */
  courseLessons: string[];
}

export interface ReteachBlock {
  title: string;
  body: string;
}

export interface MisconceptionDef {
  code: string;
  conceptId: string;
  title: string;
  category: MistakeCategory;
  /** Internal description for teachers/admins. */
  description: string;
  /** Gentle student-facing wording: "You may be thinking …". */
  studentExplanation: string;
  /** A different explanation used when re-teaching after this misconception is detected. */
  reteach: ReteachBlock;
}

export type Purpose = "diagnostic" | "lesson" | "practice" | "assessment" | "revision";

/** Hint ladder. Level 0 = reflective question … level 4 = partial structure / pseudocode. */
export type HintLadder = [string, string, string, string, string];

interface QuestionBase {
  id: string;
  type: QuestionType;
  conceptId: string;
  skills: { id: string; weight?: number }[];
  /** 1 easy · 2 medium-easy · 3 medium · 4 medium-hard · 5 challenge */
  difficulty: 1 | 2 | 3 | 4 | 5;
  purposes: Purpose[];
  /** Misconceptions this question is designed to reveal (used to confirm they're resolved). */
  probes?: string[];
  prompt: string;
  /** Code shown with the question (read-only). */
  code?: string;
  hints: HintLadder;
  /** Why the answer is right — shown after the item is finished. */
  explanation: string;
}

export interface McqOption {
  id: string;
  text: string;
  /** Picking this option is evidence for that misconception. */
  misconception?: string;
  /** Short targeted feedback for this wrong choice. */
  feedback?: string;
}

export interface McqQuestion extends QuestionBase {
  type: "mcq" | "predict_output" | "identify_error";
  options: McqOption[];
  correct: string;
}

export interface CompleteCodeQuestion extends QuestionBase {
  type: "complete_code";
  /** `code` contains exactly one `____` blank. */
  accepted: string[];
  wrongAnswers?: { answer: string; misconception?: string; feedback?: string }[];
}

export interface ReorderQuestion extends QuestionBase {
  type: "reorder";
  /** Lines in the correct order. Presented shuffled (deterministically per student). */
  lines: string[];
}

export interface TraceQuestion extends QuestionBase {
  type: "trace";
  fields: { label: string; answer: string; wrong?: { answer: string; misconception?: string; feedback?: string }[] }[];
}

export interface TestCaseDef {
  label: string;
  input: string;
  output: string;
  visibility: "sample" | "visible" | "hidden";
  category: "normal" | "boundary" | "edge";
}

/** Deterministic diagnostics run on the judge evidence of a wrong submission. */
export type DetectorDef =
  /** Program should print a sequence of integers; compares the shape of what it printed instead. */
  | { kind: "sequence" }
  /** Program should print one accumulated number; spots "forgot the last term" and "reset inside loop". */
  | { kind: "accumulator"; lastTermOf: "n" }
  /** Static checks on the `for (…; …; …)` header and body. */
  | { kind: "for_header"; direction: "up" | "down" };

export interface WriteCodeQuestion extends QuestionBase {
  type: "write_code";
  starterCode: string;
  tests: TestCaseDef[];
  /** "tokens": whitespace-insensitive; "lines": line by line, trailing spaces ignored. */
  compare: "tokens" | "lines";
  referenceSolution: string;
  /** Shown only when the solution is revealed. */
  solutionWalkthrough: string;
  detectors: DetectorDef[];
}

export interface ExplainQuestion extends QuestionBase {
  type: "explain";
  rubric: {
    keyIdeas: { id: string; label: string; patterns: string[] }[];
    misconceptionPatterns?: { pattern: string; misconception: string }[];
    /** Key ideas needed to count as "explained". */
    required: number;
  };
}

export type QuestionDef =
  | McqQuestion
  | CompleteCodeQuestion
  | ReorderQuestion
  | TraceQuestion
  | WriteCodeQuestion
  | ExplainQuestion;

// ── Lessons ─────────────────────────────────────────────────────────────────

export type VisualId = "loop-anatomy" | "boundary-explorer" | "loop-flow" | "nested-grid" | "comparison-number-line";

export type LessonStepDef =
  | { key: string; kind: "concept"; title: string; body: string }
  | { key: string; kind: "visual"; title: string; visual: VisualId; body: string }
  | { key: string; kind: "dry_run"; title: string; traceId: string; body: string }
  | { key: string; kind: "example"; title: string; body: string; code: string; output: string }
  | {
      key: string;
      kind: "checkpoint";
      questionId: string;
      /** Misconception code → re-teach step key. "default" catches other wrong answers. */
      reteach: Record<string, string>;
      /** Asked after re-teaching, so the student retries a fresh variant rather than the same item. */
      retryQuestionId: string;
    }
  | { key: string; kind: "reteach"; title: string; body: string }
  | { key: string; kind: "code"; questionId: string; mode: "guided" | "independent" | "debug" }
  | { key: string; kind: "explain_back"; questionId: string }
  | { key: string; kind: "practice"; title: string; skills: string[]; count: number }
  | { key: string; kind: "exit_check"; skills: string[]; count: number }
  | { key: string; kind: "summary"; title: string; body: string };

export interface LessonDef {
  id: string;
  conceptId: string;
  kind: "core" | "remediation";
  title: string;
  estimatedMinutes: number;
  steps: LessonStepDef[];
}

export interface AchievementDef {
  code: string;
  title: string;
  description: string;
}
