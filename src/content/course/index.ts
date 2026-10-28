import crypto from "node:crypto";
import { CONCEPTS } from "../curriculum";
import { TRACES } from "../traces";
import { MODULE1_LESSONS } from "./module1";
import { MODULE2_LESSONS } from "./module2";
import { MODULE3_LESSONS } from "./module3";
import { FUNCTIONS_LESSONS } from "./module6-functions";
import { ARRAYS_STRINGS_LESSONS } from "./module7-arrays-strings";
import { POINTERS_LESSONS } from "./module8-pointers";
import { OOP_LESSONS } from "./module9-oop";
import { MODERN_CPP_LESSONS } from "./module10-modern-cpp";
import { STL_LESSONS } from "./module11-stl";
import { SEARCH_SORT_LESSONS } from "./module12-searching-sorting";
import { DATA_STRUCTURES_LESSONS } from "./module13-data-structures";
import { ALGORITHMS_LESSONS } from "./module14-algorithms";
import { FILES_EXCEPTIONS_LESSONS } from "./module15-files-exceptions";
import { ADVANCED_CPP_LESSONS } from "./module16-advanced-cpp";
import { PROJECT_LESSONS } from "./module17-projects";
import { EXTRA_BASICS_LESSONS } from "./extra-basics";
import { EXTRA_OPERATORS_LOGIC_LESSONS } from "./extra-operators-logic";
import { EXTRA_POINTERS_OOP_LESSONS } from "./extra-pointers-oop";
import { EXTRA_MODERN_STL_LESSONS } from "./extra-modern-stl";
import { EXTRA_SORTING_LESSONS } from "./extra-sorting";
import { EXTRA_DS_LESSONS } from "./extra-ds";
import { EXTRA_ALGORITHMS_LESSONS } from "./extra-algorithms";
import { EXTRA_ENGINEERING_LESSONS } from "./extra-engineering";
import { EXTRA_PROJECT_LESSONS } from "./extra-projects";
import type { CourseLesson, CourseLevel, CourseModule, Exercise, PracticeProblem } from "./types";
import { PRACTICE_BY_LESSON } from "./practice";

export type { CourseLesson, CourseModule, Exercise, PracticeProblem } from "./types";

/**
 * Every written lesson. Each declares its own `moduleId`, which is the single source of membership.
 * Practice problems live in ./practice (keyed by lesson id) and are attached here.
 */
const ALL_LESSONS: CourseLesson[] = [
  ...MODULE1_LESSONS, ...MODULE2_LESSONS, ...MODULE3_LESSONS, ...FUNCTIONS_LESSONS, ...ARRAYS_STRINGS_LESSONS,
  ...POINTERS_LESSONS, ...OOP_LESSONS, ...MODERN_CPP_LESSONS, ...STL_LESSONS, ...SEARCH_SORT_LESSONS,
  ...DATA_STRUCTURES_LESSONS, ...ALGORITHMS_LESSONS, ...FILES_EXCEPTIONS_LESSONS, ...ADVANCED_CPP_LESSONS,
  ...PROJECT_LESSONS,
  ...EXTRA_BASICS_LESSONS,
  ...EXTRA_OPERATORS_LOGIC_LESSONS,
  ...EXTRA_POINTERS_OOP_LESSONS,
  ...EXTRA_MODERN_STL_LESSONS,
  ...EXTRA_SORTING_LESSONS,
  ...EXTRA_DS_LESSONS,
  ...EXTRA_ALGORITHMS_LESSONS,
  ...EXTRA_ENGINEERING_LESSONS,
  ...EXTRA_PROJECT_LESSONS,
].map((l) => ({ ...l, practice: l.practice ?? PRACTICE_BY_LESSON[l.id] }));

/** Lessons written later name the lesson they follow (`after`), so modules read in teaching order. */
const START = "@start";

function placeLessons(list: CourseLesson[]): CourseLesson[] {
  const out = list.filter((l) => !l.after);
  // `after: "@start"` opens its module (before the module's first anchored lesson).
  for (const l of list.filter((x) => x.after === START)) {
    const i = out.findIndex((x) => x.moduleId === l.moduleId);
    if (i >= 0) out.splice(i, 0, l);
    else out.push(l);
  }
  let pending = list.filter((l) => l.after && l.after !== START);
  while (pending.length) {
    const next: CourseLesson[] = [];
    for (const l of pending) {
      const i = out.findIndex((x) => x.id === l.after);
      if (i >= 0) out.splice(i + 1 + out.slice(i + 1).filter((x) => x.after === l.after).length, 0, l);
      else next.push(l);
    }
    if (next.length === pending.length) {
      out.push(...next); // unknown anchors: reported by validateCourse
      break;
    }
    pending = next;
  }
  return out;
}

type ModuleDef = Omit<CourseModule, "lessons" | "number">;

/**
 * The 17-module C++ roadmap, beginner → advanced. Module ids are stable (progress and module XP
 * are keyed to them). A module lists the lessons that are written and compiler-verified; topics
 * that are not written yet are listed in `planned` and shown as "coming later" — never as empty
 * pages. Nothing is locked: every published lesson can be opened in any order.
 */
const MODULE_DEFS: ModuleDef[] = [
  {
    id: "foundations", level: "beginner", title: "Introduction to C++",
    summary: "What programming is, how a program is built and run, the structure of a C++ program and your first output.",
  },
  {
    id: "variables-io", level: "beginner", title: "Variables, data types and input/output",
    summary: "Storing values, choosing types, reading input with cin and getline, and printing with cout.",
  },
  {
    id: "operators", level: "beginner", title: "Operators and expressions",
    summary: "Arithmetic, assignment, increment, precedence, integer division, modulo and type conversion.",
  },
  {
    id: "logic", level: "beginner", title: "Conditional statements",
    summary: "Comparisons, and/or/not, if, else, else-if ladders, nesting, switch and real eligibility rules.",
  },
  {
    id: "loops", level: "beginner", title: "Loops",
    summary: "for, while and do-while; nested loops, break/continue, tracing, off-by-one errors and patterns.",
  },
  {
    id: "functions", level: "beginner", title: "Functions and recursion",
    summary: "Naming and reusing work, parameters and return values, references, scope, overloading and recursion.",
  },
  {
    id: "arrays-strings", level: "beginner", title: "Arrays and strings",
    summary: "Many values under one name, traversal, searching, 2D grids, std::string and a first look at std::vector.",
  },
  {
    id: "pointers", level: "intermediate", title: "Pointers, references and dynamic memory",
    summary: "Addresses, pointers, dereferencing, pointer arithmetic, new/delete, leaks, dangling pointers and smart pointers.",
  },
  {
    id: "oop", level: "intermediate", title: "Object-oriented programming",
    summary: "Classes and objects, encapsulation, constructors and destructors, inheritance and polymorphism.",
  },
  {
    id: "modern-cpp", level: "intermediate", title: "Modern C++ and advanced functions",
    summary: "auto, range-based for, lambdas, templates, namespaces, const correctness and newer standard features.",
  },
  {
    id: "stl", level: "intermediate", title: "The Standard Template Library",
    summary: "vector, pair, string, stack, queue, deque, priority_queue, set, map, unordered containers, iterators and algorithms.",
  },
  {
    id: "searching-sorting", level: "intermediate", title: "Searching and sorting",
    summary: "Time and space complexity, binary search, bubble, selection, insertion, merge and quick sort, and std::sort.",
  },
  {
    id: "data-structures", level: "advanced", title: "Data structures",
    summary: "Linked lists, stacks, queues, hash tables, trees, BSTs, heaps, tries, graphs and union-find.",
  },
  {
    id: "algorithms", level: "advanced", title: "Algorithms and problem solving",
    summary: "Two pointers, sliding window, prefix sums, recursion, backtracking, greedy, divide and conquer, DP, bits and number theory.",
  },
  {
    id: "files-exceptions", level: "advanced", title: "Files, exceptions and debugging",
    summary: "File streams, exceptions, defensive programming, reading compiler warnings, debugging and basic testing.",
  },
  {
    id: "advanced-cpp", level: "advanced", title: "Advanced C++ and engineering practice",
    summary: "RAII, ownership, move semantics, the rule of zero/three/five, undefined behaviour, concurrency basics and tooling.",
  },
  {
    id: "projects", level: "advanced", title: "Projects and capstone",
    summary: "Guided projects that combine everything: from a calculator to a full command-line application.",
  },
];

const ORDERED_LESSONS = placeLessons(ALL_LESSONS);

export const COURSE_MODULES: CourseModule[] = MODULE_DEFS.map((m, i) => ({
  ...m,
  number: i + 1,
  lessons: ORDERED_LESSONS.filter((l) => l.moduleId === m.id).map((l) => l.id),
}));

/** Teaching order: module by module (so "next" always continues into the following module). */
export const COURSE_LESSONS: CourseLesson[] = COURSE_MODULES.flatMap((m) => m.lessons.map((id) => ALL_LESSONS.find((l) => l.id === id)!));

export const LEVEL_LABEL: Record<CourseLevel, string> = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };

const byId = new Map(COURSE_LESSONS.map((l) => [l.id, l]));
export const getCourseLesson = (id: string) => byId.get(id);
export const firstLessonId = COURSE_LESSONS[0].id;

export function neighbours(id: string) {
  const i = COURSE_LESSONS.findIndex((l) => l.id === id);
  return { prev: i > 0 ? COURSE_LESSONS[i - 1] : null, next: i >= 0 && i < COURSE_LESSONS.length - 1 ? COURSE_LESSONS[i + 1] : null };
}

/**
 * Fingerprint of the published lesson set. Saved with guest progress so the browser can drop
 * entries for lessons that no longer exist. Exercise starter code is hashed separately per lesson
 * so a saved draft can be flagged when the exercise it was written for changes.
 */
export const COURSE_VERSION = crypto.createHash("sha256").update(COURSE_LESSONS.map((l) => l.id).join("|")).digest("hex").slice(0, 12);
export const exerciseVersion = (l: CourseLesson) =>
  crypto.createHash("sha256").update(l.exercise.prompt + l.exercise.starterCode).digest("hex").slice(0, 10);

/**
 * Exercise keys address every judged problem on the path: "<lessonId>" is the lesson exercise
 * (the beginner problem), "<lessonId>~p2" / "<lessonId>~p3" are its intermediate and challenge
 * practice problems. Progress, hints and XP are stored per key.
 */
export const EXERCISE_KEY = /^[a-z0-9-]{1,60}(~p[23])?$/;
/** Progress key for an exercise solved in "Complete the code" mode: "<exercise key>+fill". */
export const FILL_SUFFIX = "+fill";
export const isFillKey = (key: string) => key.endsWith(FILL_SUFFIX);
export const PRACTICE_LEVEL_LABEL = { beginner: "Beginner", intermediate: "Intermediate", challenge: "Challenge" } as const;

export function exerciseKey(lessonId: string, problemId?: string | null) {
  return problemId ? `${lessonId}~${problemId}` : lessonId;
}

export function resolveExercise(key: string): { lesson: CourseLesson; exercise: Exercise; problem: PracticeProblem | null } | null {
  const [lessonId, problemId] = key.split("~");
  const lesson = byId.get(lessonId);
  if (!lesson) return null;
  if (!problemId) return { lesson, exercise: lesson.exercise, problem: null };
  const problem = lesson.practice?.find((p) => p.id === problemId) ?? null;
  return problem ? { lesson, exercise: problem, problem } : null;
}

/** Every practice problem key on the path, in teaching order. */
export const PRACTICE_KEYS: string[] = COURSE_LESSONS.flatMap((l) => (l.practice ?? []).map((p) => exerciseKey(l.id, p.id)));

function publicExercise(exercise: Exercise, version: string) {
  return {
    title: exercise.title,
    prompt: exercise.prompt,
    starterCode: exercise.starterCode,
    hints: exercise.hints,
    samples: exercise.tests.filter((t) => t.visibility !== "hidden").map((t) => ({ label: t.label, input: t.input, output: t.output })),
    hiddenCount: exercise.tests.filter((t) => t.visibility === "hidden").length,
    version,
  };
}

/** What the browser may receive: hidden tests and the reference solutions are removed. */
export function toPublicLesson(l: CourseLesson) {
  const { exercise, practice, ...rest } = l;
  return {
    ...rest,
    exercise: publicExercise(exercise, exerciseVersion(l)),
    practice: (practice ?? []).map((p) => ({ id: p.id, level: p.level, title: p.title })),
  };
}
export type PublicLesson = ReturnType<typeof toPublicLesson>;

/** A practice problem as the browser may see it. */
export function toPublicProblem(p: PracticeProblem) {
  const version = crypto.createHash("sha256").update(p.prompt + p.starterCode).digest("hex").slice(0, 10);
  return { id: p.id, level: p.level, ...publicExercise(p, version) };
}

/** A compact roadmap for navigation (no lesson bodies). */
export function roadmap() {
  return COURSE_MODULES.map((m) => ({
    id: m.id, number: m.number, title: m.title, summary: m.summary, level: m.level,
    lessons: m.lessons.map((id) => ({ id, title: byId.get(id)!.title, minutes: byId.get(id)!.minutes })),
    planned: m.planned ?? [],
  }));
}
export type Roadmap = ReturnType<typeof roadmap>;

/** Structural checks (the compiler-based checks live in tests/course-content.test.ts). */
export function validateCourse(): string[] {
  const problems: string[] = [];
  const traceIds = new Set(TRACES.map((t) => t.id));
  const seen = new Set<string>();
  const moduleIds = new Set<string>();
  for (const m of COURSE_MODULES) {
    if (moduleIds.has(m.id)) problems.push(`module ${m.id}: duplicate id`);
    moduleIds.add(m.id);
    if (!m.lessons.length && !(m.planned?.length)) problems.push(`module ${m.id}: has neither lessons nor planned topics`);
  }
  // Checked over every written lesson, so one with a misspelt moduleId can't silently disappear.
  for (const l of ALL_LESSONS) {
    if (!moduleIds.has(l.moduleId)) problems.push(`${l.id}: unknown module ${l.moduleId}`);
    if (l.after && l.after !== START) {
      const anchor = ALL_LESSONS.find((x) => x.id === l.after);
      if (!anchor) problems.push(`${l.id}: placed after unknown lesson ${l.after}`);
      else if (anchor.moduleId !== l.moduleId) problems.push(`${l.id}: placed after ${l.after}, which is in another module`);
    }
  }
  for (const id of Object.keys(PRACTICE_BY_LESSON)) if (!ALL_LESSONS.some((l) => l.id === id)) problems.push(`practice: unknown lesson ${id}`);
  // The concept map links to lessons by id: a typo would turn into a dead "Open lesson" link.
  for (const c of CONCEPTS) {
    for (const id of c.courseLessons) if (!ALL_LESSONS.some((l) => l.id === id)) problems.push(`concept ${c.id}: unknown course lesson ${id}`);
  }
  for (const l of COURSE_LESSONS) {
    if (seen.has(l.id)) problems.push(`${l.id}: duplicate id`);
    seen.add(l.id);
    if (!/^[a-z0-9-]{2,60}$/.test(l.id)) problems.push(`${l.id}: id must be lowercase-with-dashes`);
    const mod = COURSE_MODULES.find((m) => m.id === l.moduleId);
    if (!mod || !mod.lessons.includes(l.id)) problems.push(`${l.id}: not listed in module ${l.moduleId}`);
    if (l.goals.length < 2) problems.push(`${l.id}: needs at least 2 goals`);
    if (!l.sections.length) problems.push(`${l.id}: needs concept sections`);
    if (!l.mistakes.length) problems.push(`${l.id}: needs common mistakes`);
    if (l.summary.length < 2) problems.push(`${l.id}: needs a summary`);
    if (!l.explainAgain.trim()) problems.push(`${l.id}: needs an explain-again text`);
    for (const s of l.sections) if (s.traceId && !traceIds.has(s.traceId)) problems.push(`${l.id}: unknown trace ${s.traceId}`);
    for (const n of l.example.notes) if (n.line < 1 || n.line > l.example.code.split("\n").length) problems.push(`${l.id}: example note points at line ${n.line}`);
    const ex = l.exercise;
    if (!ex.tests.some((t) => t.visibility === "sample")) problems.push(`${l.id}: exercise needs a sample test`);
    if (ex.hints.length !== 4 || ex.hints.some((h) => !h.trim())) problems.push(`${l.id}: exercise needs 4 hints`);
    if (!ex.solution.includes("main")) problems.push(`${l.id}: exercise solution missing`);
    if (ex.tests.length > 20) problems.push(`${l.id}: too many tests (max 20)`);
    // Publication minimum: a knowledge check, hidden tests, and at least two common mistakes.
    if (!l.quickCheck) problems.push(`${l.id}: needs a quick check (knowledge check)`);
    else if (l.quickCheck.options.length < 3 || l.quickCheck.options.some((o) => !o.feedback.trim())) problems.push(`${l.id}: quick check needs 3+ options, each with feedback`);
    // Fixed-output first programs read nothing, so only exercises with input need hidden cases.
    if (ex.tests.some((t) => t.input.trim()) && !ex.tests.some((t) => t.visibility === "hidden")) problems.push(`${l.id}: exercise needs a hidden test`);
    if (l.mistakes.length < 2) problems.push(`${l.id}: needs at least 2 common mistakes`);
    if (l.quickCheck && !l.quickCheck.options.some((o) => o.id === l.quickCheck!.correct)) problems.push(`${l.id}: quick check answer missing`);
    const practice = l.practice ?? [];
    if (practice.map((p) => p.id).join(",") !== "p2,p3") problems.push(`${l.id}: needs two practice problems [p2 intermediate, p3 challenge]`);
    for (const p of practice) {
      if (p.level !== (p.id === "p2" ? "intermediate" : "challenge")) problems.push(`${l.id}~${p.id}: wrong level ${p.level}`);
      if (!p.tests.some((t) => t.visibility === "sample")) problems.push(`${l.id}~${p.id}: needs a sample test`);
      if (!p.tests.some((t) => t.visibility === "hidden")) problems.push(`${l.id}~${p.id}: needs a hidden test`);
      if (p.hints.length !== 4 || p.hints.some((h) => !h.trim())) problems.push(`${l.id}~${p.id}: needs 4 hints`);
      if (!p.solution.includes("main")) problems.push(`${l.id}~${p.id}: solution missing`);
      if (p.tests.length > 20) problems.push(`${l.id}~${p.id}: too many tests (max 20)`);
    }
  }
  return problems;
}

export { fillInPuzzle, assembleFillIn, MAX_ANSWER_LENGTH, MAX_BLANKS } from "./fill-in";
export type { FillInPuzzle, FillInBlank } from "./fill-in";
