/*
 * Python Mastery content schema. Curriculum is data, kept apart from the UI: lessons, questions,
 * exercises, module assessments and projects are typed objects reviewed in git.
 *
 * Every lesson follows the CodeMentor teaching flow (check what you know → one idea at a time →
 * why it matters → syntax + example → line by line → predict, then see the real output → step
 * through it → common mistakes → questions → coding tasks of rising difficulty → check → reteach).
 *
 * Truth is checked by machine, not by eye: tests/python-content.test.ts runs every worked example,
 * predict-the-output question, filled-in blank, bug fix and reference solution through the real
 * Python sandbox and compares the output with what the content claims.
 */

export type PyDifficulty = 1 | 2 | 3 | 4 | 5;

export const DIFFICULTY_NAMES: Record<PyDifficulty, string> = {
  1: "Beginner",
  2: "Basic application",
  3: "Intermediate reasoning",
  4: "Advanced problem-solving",
  5: "Expert challenge",
};

interface QuestionBase {
  /** Short id, unique within its lesson or module (the full id is `<lesson or module>/<id>`). */
  id: string;
  difficulty: PyDifficulty;
  /** A nudge shown before the answer (never the answer itself). */
  hint: string;
  /** Why the right answer is right — shown after an attempt. */
  explain: string;
}

/** Multiple choice. Each option says why it is right or wrong. */
export interface McqQuestion extends QuestionBase {
  kind: "mcq";
  prompt: string;
  code?: string;
  options: { text: string; why: string }[];
  /** Index into options. */
  answer: number;
}

/** Predict the output: the learner types what the code prints. `answer` is verified by running it. */
export interface PredictQuestion extends QuestionBase {
  kind: "predict";
  prompt?: string;
  code: string;
  input?: string;
  /** Helper modules/data files next to the program (shown to the learner). */
  files?: { name: string; content: string }[];
  answer: string;
}

/**
 * Fill in the blanks (`___` in the code, left to right). Each blank lists accepted answers
 * (compared ignoring surrounding spaces). With `output`, the code with the first accepted answers
 * filled in is run and must print exactly that.
 */
export interface FillQuestion extends QuestionBase {
  kind: "fill";
  prompt: string;
  code: string;
  blanks: string[][];
  output?: string;
}

/**
 * Find the bug: the learner picks the faulty line; afterwards they see the fixed code. With
 * `output`, the fixed code is run and must print exactly that (and the buggy code must not).
 */
export interface BugQuestion extends QuestionBase {
  kind: "bug";
  prompt: string;
  code: string;
  /** 1-based line number of the bug. */
  line: number;
  fix: string;
  input?: string;
  output?: string;
}

export type PyQuestion = McqQuestion | PredictQuestion | FillQuestion | BugQuestion;
export type PyQuestionKind = PyQuestion["kind"];

export interface PyTest {
  label: string;
  input: string;
  output: string;
  /** Hidden tests run on Check; only pass/fail and the kind of case reach the browser. */
  hidden?: boolean;
  category?: "normal" | "boundary" | "edge";
}

export interface PyExercise {
  /** Unique within its lesson / module / project. */
  id: string;
  /** task = core practice · debug = fix broken code · challenge = harder problem · project = mini-project. */
  kind: "task" | "debug" | "challenge" | "project";
  title: string;
  difficulty: PyDifficulty;
  /** What to build, in plain language (markdown). */
  prompt: string;
  starter: string;
  tests: PyTest[];
  /** lines (default): line by line, ignoring trailing spaces. tokens: whitespace-insensitive. */
  compare?: "lines" | "tokens";
  /** Files placed next to the program (data files, helper modules). */
  files?: { name: string; content: string }[];
  /** 1 guiding question · 2 the concept · 3 where to look · 4 the approach. */
  hints: [string, string, string, string];
  /** Reference solution — server-only, sent only when the learner explicitly asks for it. */
  solution: string;
  /** Walkthrough shown with the solution. */
  notes: string;
}

/** Code that needs a third-party library or a desktop: shown for reading, clearly NOT run here. */
export interface LibraryCode {
  title: string;
  code: string;
  /** How to run it on your own computer, and what it would do. */
  note: string;
}

export interface PyLesson {
  id: string;
  title: string;
  minutes: number;
  difficulty: PyDifficulty;
  objectives: string[];
  /** Extra prerequisite lesson ids (the previous lesson in the course is always implied). */
  prereqs?: string[];
  /** Step 1 — check what the learner already knows (a multiple-choice warm-up). */
  warmup: McqQuestion;
  /** Why the idea matters and where it is used. */
  why: string;
  /** One idea per section, with syntax and small examples (markdown; ```python fences). */
  concept: { title: string; body: string }[];
  /** A complete example: explained line by line, output verified, steppable in the sandbox. */
  example: {
    title: string;
    code: string;
    input?: string;
    /** Helper modules/data files next to the program. */
    files?: { name: string; content: string }[];
    output: string;
    /** When the example deliberately ends with an exception, its type (e.g. "ZeroDivisionError"). */
    raises?: string;
    /** [line number, explanation] — the line-by-line walkthrough. */
    lines: [number, string][];
  };
  mistakes: { title: string; body: string }[];
  /** Practice + the lesson's short assessment: needs at least one predict, fill and bug question. */
  questions: PyQuestion[];
  /** [0] is the core coding task; the rest get progressively harder. */
  exercises: PyExercise[];
  realWorld: string;
  /** "Explain it another way" — used when the learner struggles. */
  reteach: string;
  summary: string[];
  /** Side-by-side C++ comparison, where it helps. */
  cpp?: { python: string; cpp: string; note: string };
  /** Version-dependent feature label, e.g. "Python 3.10+". */
  version?: string;
  libraryCode?: LibraryCode[];
}

export interface PyModuleDef {
  id: string;
  number: number;
  level: number;
  title: string;
  summary: string;
  /** core = the language itself · specialist = an optional career path. */
  track: "core" | "specialist";
  /** For specialist/advanced modules: who needs it and who can skip it. */
  optionalNote?: string;
  /** Module ids that should be finished first. */
  prereqs: string[];
  lessons: PyLesson[];
  /** Extra questions used only in the module assessment (unseen during lessons). */
  exam: PyQuestion[];
  /** The module's practical mini-project, judged like any exercise. */
  project: PyExercise;
}

export interface PyLevelDef {
  number: number;
  title: string;
  summary: string;
}

export interface PyProject {
  id: string;
  tier: "beginner" | "intermediate" | "advanced" | "capstone";
  title: string;
  summary: string;
  /** Module ids the project draws on. */
  uses: string[];
  /** Guided milestones, each judged by tests in the sandbox. */
  milestones: PyExercise[];
  /** Honest limits: what this version leaves out before it could be used for real. */
  limitations: string[];
  /** Work to do on your own computer (frameworks, deployment …), when the project goes beyond the sandbox. */
  beyond?: string[];
}
