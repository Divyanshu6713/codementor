import crypto from "node:crypto";
import { TRACES } from "../traces";
import { MODULE1_LESSONS } from "./module1";
import { MODULE2_LESSONS } from "./module2";
import { MODULE3_LESSONS } from "./module3";
import type { CourseLesson, CourseModule } from "./types";

export type { CourseLesson, CourseModule } from "./types";

/**
 * The V1 C++ roadmap. Modules 1–3 are complete; 4–7 are listed honestly as "coming later" so
 * students can see where the course goes without being offered unfinished lessons.
 */
export const COURSE_MODULES: CourseModule[] = [
  {
    id: "foundations", number: 1, title: "Programming foundations",
    summary: "What programs are, your first C++ program, input and output, variables, types and operators.",
    lessons: MODULE1_LESSONS.map((l) => l.id),
  },
  {
    id: "logic", number: 2, title: "Logic and decision making",
    summary: "Comparisons, and/or/not, if, else, else-if ladders, nesting and switch.",
    lessons: MODULE2_LESSONS.map((l) => l.id),
  },
  {
    id: "loops", number: 3, title: "Loops",
    summary: "Repeating work with for, while and do-while; nested loops, break/continue and patterns.",
    lessons: MODULE3_LESSONS.map((l) => l.id),
  },
  {
    id: "functions", number: 4, title: "Functions", lessons: [],
    summary: "Splitting programs into named, reusable pieces.",
    planned: ["Why functions are useful", "Declarations and definitions", "Parameters and arguments", "Return values", "Scope", "Basic recursion"],
  },
  {
    id: "arrays-strings", number: 5, title: "Arrays and strings", lessons: [],
    summary: "Storing many values and working with text.",
    planned: ["One-dimensional arrays", "Array traversal", "Searching arrays", "Basic array problems", "Two-dimensional arrays", "Strings", "Introductory string problems"],
  },
  {
    id: "pointers", number: 6, title: "Pointers and references", lessons: [],
    summary: "How values live in memory and how to refer to them.",
    planned: ["Memory basics", "Addresses", "Pointer declaration", "Dereferencing", "References", "Pointers and arrays", "Common pointer mistakes"],
  },
  {
    id: "dsa-intro", number: 7, title: "Introduction to DSA", lessons: [],
    summary: "First steps into data structures and algorithms.",
    planned: ["What is DSA?", "Time complexity intuition", "Linear search", "Binary search", "Basic sorting algorithms", "Vectors", "Introductory problem solving"],
  },
];

export const COURSE_LESSONS: CourseLesson[] = [...MODULE1_LESSONS, ...MODULE2_LESSONS, ...MODULE3_LESSONS];

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

/** What the browser may receive: hidden tests and the reference solution are removed. */
export function toPublicLesson(l: CourseLesson) {
  const { exercise, ...rest } = l;
  return {
    ...rest,
    exercise: {
      title: exercise.title,
      prompt: exercise.prompt,
      starterCode: exercise.starterCode,
      hints: exercise.hints,
      samples: exercise.tests.filter((t) => t.visibility !== "hidden").map((t) => ({ label: t.label, input: t.input, output: t.output })),
      hiddenCount: exercise.tests.filter((t) => t.visibility === "hidden").length,
      version: exerciseVersion(l),
    },
  };
}
export type PublicLesson = ReturnType<typeof toPublicLesson>;

/** A compact roadmap for navigation (no lesson bodies). */
export function roadmap() {
  return COURSE_MODULES.map((m) => ({
    id: m.id, number: m.number, title: m.title, summary: m.summary,
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
    if (l.quickCheck && !l.quickCheck.options.some((o) => o.id === l.quickCheck!.correct)) problems.push(`${l.id}: quick check answer missing`);
  }
  return problems;
}
