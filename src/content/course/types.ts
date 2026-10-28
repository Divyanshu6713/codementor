/*
 * The guest course: a fixed C++ roadmap of modules and lessons that anyone can open without an
 * account. Every lesson follows the same shape (learn → understand → example → practise → run →
 * improve → continue) so students always know where they are.
 *
 * Content is code: reviewed in git, type-checked, and every exercise's reference solution is
 * compiled and run against all of its tests by `tests/course-content.test.ts` (real g++), and every
 * example's stated output is checked the same way. Rich text uses the safe markdown subset rendered
 * by `components/Markdown.tsx` — never raw HTML.
 */
import type { TestCaseDef, VisualId } from "../types";

export type CourseLevel = "beginner" | "intermediate" | "advanced";
/** Language standard a lesson needs. The sandbox compiles with -std=c++20. */
export type CppStandard = "C++11" | "C++17" | "C++20" | "C++23";

export interface CourseModule {
  id: string;
  number: number;
  title: string;
  summary: string;
  level: CourseLevel;
  /** Lesson ids in teaching order (published, compiler-verified lessons only). */
  lessons: string[];
  /** Topics still to be written, shown honestly as "coming later" — never as empty lesson pages. */
  planned?: string[];
}

export interface ConceptSection {
  title: string;
  body: string;
  /** Optional interactive widget from components/lesson/Visuals. */
  visual?: VisualId;
  /** Optional step-through trace from content/traces. */
  traceId?: string;
}

export interface WorkedExample {
  title: string;
  intro: string;
  code: string;
  /** Standard input the example is run with (empty when it reads nothing). */
  input?: string;
  /** Exactly what the program prints — verified by the content test. */
  output: string;
  /** Short notes on the important lines (line numbers are 1-based). */
  notes: { line: number; text: string }[];
}

export interface QuickCheck {
  prompt: string;
  code?: string;
  options: { id: string; text: string; feedback: string }[];
  correct: string;
  explanation: string;
}

export interface Exercise {
  title: string;
  /** What to build, in plain language. Markdown. */
  prompt: string;
  starterCode: string;
  /**
   * sample  → shown in the lesson and run by "Check".
   * hidden  → run by "Check"; only pass/fail and the kind of case reach the browser (the student can
   *           choose to see one failing case after a wrong check).
   */
  tests: TestCaseDef[];
  /** tokens: whitespace-insensitive. lines: line by line, ignoring trailing spaces. */
  compare: "tokens" | "lines";
  /**
   * Progressive hints:
   * 1 a guiding question · 2 the relevant concept · 3 where to look · 4 the approach.
   * (Level 5 — the worked solution — is served separately and only when explicitly requested.)
   */
  hints: [string, string, string, string];
  /** Reference solution. Server-only: never part of the page payload. */
  solution: string;
  /** Walkthrough shown with the worked solution. */
  solutionNotes: string;
}

/**
 * Graded practice after the lesson exercise (which counts as the beginner problem):
 * p2 = intermediate, p3 = challenge. Same shape and guarantees as the exercise — the reference
 * solution passes every test and the starter doesn't (tests/course-content.test.ts).
 */
export interface PracticeProblem extends Exercise {
  id: "p2" | "p3";
  level: "intermediate" | "challenge";
}

export interface CourseLesson {
  id: string;
  moduleId: string;
  title: string;
  minutes: number;
  /** Defaults to C++17 (works on any compiler). Set "C++20" when a lesson needs it; the sandbox compiles C++20. */
  standard?: CppStandard;
  /** Short concept tags used by search and the mentor (e.g. "recursion", "base case"). */
  concepts?: string[];
  /** A. What you will learn. */
  goals: string[];
  intro: string;
  /** B. Understand the concept. */
  sections: ConceptSection[];
  /** B. Common misunderstandings. */
  mistakes: { title: string; body: string }[];
  /** C. Try an example. */
  example: WorkedExample;
  /** Optional one-question check before the exercise. */
  quickCheck?: QuickCheck;
  /** D–F. Practise, run, improve. */
  exercise: Exercise;
  /** Two more graded problems: intermediate (p2) and challenge (p3). */
  practice?: PracticeProblem[];
  /** Curated "explain it another way" — used when no AI provider is enabled. */
  explainAgain: string;
  /** G. Key takeaways. */
  summary: string[];
}
