/**
 * Python Mastery: the course catalogue (levels → modules → lessons), lookups, public (answer-free)
 * views and structural validation. The machine checks that every example, answer and solution is
 * actually correct live in tests/python-content.test.ts.
 */
import crypto from "node:crypto";
import { PY_MODULES } from "./modules";
import { PY_PROJECTS } from "./projects";
import type { PyExercise, PyLesson, PyLevelDef, PyModuleDef, PyProject, PyQuestion } from "./types";

export * from "./types";
export { PY_MODULES, PY_PROJECTS };

export const PY_LEVELS: PyLevelDef[] = [
  { number: 1, title: "Python Foundations", summary: "From your first line of code to decisions and loops." },
  { number: 2, title: "Core Python Programming", summary: "Strings, the built-in collections, functions and iteration." },
  { number: 3, title: "Intermediate Python", summary: "Modules, files, errors, object-oriented programming, generators, regex and the standard library." },
  { number: 4, title: "Advanced Python", summary: "The object model, design, typing, concurrency, async, performance, testing, packaging, databases, APIs and security." },
  { number: 5, title: "Specialized Python Development", summary: "Optional career paths: web, data, machine learning, AI, automation, desktop, science, games and tooling." },
  { number: 6, title: "Data Structures, Algorithms and Interviews", summary: "Implement the classic structures, master the classic algorithms, and prepare for interviews." },
  { number: 7, title: "Professional Python and Capstone Projects", summary: "Architecture, deployment and a portfolio of guided projects." },
];

// ── Lookups ───────────────────────────────────────────────────────────────────────────────────

export const PY_LESSONS: PyLesson[] = PY_MODULES.flatMap((m) => m.lessons);
const lessonById = new Map(PY_LESSONS.map((l) => [l.id, l]));
const moduleOfLesson = new Map(PY_MODULES.flatMap((m) => m.lessons.map((l) => [l.id, m] as const)));
const moduleById = new Map(PY_MODULES.map((m) => [m.id, m]));

export const getPyLesson = (id: string) => lessonById.get(id);
export const getPyModule = (id: string) => moduleById.get(id);
export const pyModuleOf = (lessonId: string) => moduleOfLesson.get(lessonId);
export const getPyProject = (id: string) => PY_PROJECTS.find((p) => p.id === id);

/** A question with its place in the course: every question is linked to the concept it tests. */
export interface QuestionRef {
  /** Global id: `<lesson>/<q>` for lesson questions (warm-up = `<lesson>/w`), `<module>/exam/<q>` for exam questions. */
  id: string;
  q: PyQuestion;
  lessonId: string | null;
  moduleId: string;
  /** warmup | lesson | exam */
  source: "warmup" | "lesson" | "exam";
}

export const PY_QUESTIONS: QuestionRef[] = PY_MODULES.flatMap((m) => [
  ...m.lessons.flatMap((l) => [
    { id: `${l.id}/${l.warmup.id}`, q: l.warmup as PyQuestion, lessonId: l.id, moduleId: m.id, source: "warmup" as const },
    ...l.questions.map((q) => ({ id: `${l.id}/${q.id}`, q, lessonId: l.id, moduleId: m.id, source: "lesson" as const })),
  ]),
  ...m.exam.map((q) => ({ id: `${m.id}/exam/${q.id}`, q, lessonId: null, moduleId: m.id, source: "exam" as const })),
]);
const questionById = new Map(PY_QUESTIONS.map((r) => [r.id, r]));
export const getPyQuestion = (id: string) => questionById.get(id);

/** An exercise with its place in the course. Keys: `<lesson>/<id>`, `<module>/project`, `project:<id>/<milestone>`. */
export interface ExerciseRef {
  key: string;
  ex: PyExercise;
  lessonId: string | null;
  moduleId: string | null;
  projectId: string | null;
  title: string;
}

export const PY_EXERCISES: ExerciseRef[] = [
  ...PY_MODULES.flatMap((m) => [
    ...m.lessons.flatMap((l) => l.exercises.map((ex) => ({ key: `${l.id}/${ex.id}`, ex, lessonId: l.id, moduleId: m.id, projectId: null, title: ex.title }))),
    { key: `${m.id}/${m.project.id}`, ex: m.project, lessonId: null, moduleId: m.id, projectId: null, title: m.project.title },
  ]),
  ...PY_PROJECTS.flatMap((p) => p.milestones.map((ex) => ({ key: `project:${p.id}/${ex.id}`, ex, lessonId: null, moduleId: null, projectId: p.id, title: `${p.title}: ${ex.title}` }))),
];
const exerciseByKey = new Map(PY_EXERCISES.map((e) => [e.key, e]));
export const getPyExercise = (key: string) => exerciseByKey.get(key);
/** The exercise that completes a lesson (its first one). */
export const coreExerciseKey = (l: PyLesson) => `${l.id}/${l.exercises[0].id}`;

/**
 * Course order and the implicit prerequisite: inside a module, the previous lesson; for a module's
 * first lesson, the last lesson of the nearest earlier *core* module — so the optional specialist
 * paths never block each other or the core modules that follow them.
 */
export function lessonPrereqs(lessonId: string): string[] {
  const i = PY_LESSONS.findIndex((l) => l.id === lessonId);
  if (i < 0) return [];
  const explicit = PY_LESSONS[i].prereqs ?? [];
  const mod = moduleOfLesson.get(lessonId)!;
  let implicit: string | null = null;
  if (mod.lessons[0].id !== lessonId) implicit = PY_LESSONS[i - 1].id;
  else {
    const mi = PY_MODULES.indexOf(mod);
    const prevCore = PY_MODULES.slice(0, mi).reverse().find((m) => m.track === "core");
    implicit = prevCore ? prevCore.lessons[prevCore.lessons.length - 1].id : null;
  }
  return [...new Set([...(implicit ? [implicit] : []), ...explicit])];
}

export function pyNeighbours(id: string) {
  const i = PY_LESSONS.findIndex((l) => l.id === id);
  return { prev: i > 0 ? PY_LESSONS[i - 1] : null, next: i >= 0 && i < PY_LESSONS.length - 1 ? PY_LESSONS[i + 1] : null };
}

export const pyExerciseVersion = (ex: PyExercise) => crypto.createHash("sha256").update(ex.prompt + ex.starter).digest("hex").slice(0, 10);

// ── Public views: what the browser may receive before an attempt ─────────────────────────────

export function publicQuestion(ref: QuestionRef) {
  const q = ref.q;
  const base = { id: ref.id, kind: q.kind, difficulty: q.difficulty, hint: q.hint, lessonId: ref.lessonId, moduleId: ref.moduleId, files: q.kind === "predict" ? q.files ?? [] : [] };
  switch (q.kind) {
    case "mcq": return { ...base, prompt: q.prompt, code: q.code ?? null, options: q.options.map((o) => o.text), input: null, blanks: 0, lines: 0 };
    case "predict": return { ...base, prompt: q.prompt ?? "What does this program print?", code: q.code, options: null, input: q.input ?? null, blanks: 0, lines: 0 };
    case "fill": return { ...base, prompt: q.prompt, code: q.code, options: null, input: null, blanks: q.blanks.length, lines: 0 };
    case "bug": return { ...base, prompt: q.prompt, code: q.code, options: null, input: q.input ?? null, blanks: 0, lines: q.code.split("\n").length };
  }
}
export type PublicQuestion = ReturnType<typeof publicQuestion>;

export function publicExercise(ref: ExerciseRef) {
  const { ex } = ref;
  return {
    key: ref.key, kind: ex.kind, title: ex.title, difficulty: ex.difficulty, prompt: ex.prompt, starter: ex.starter,
    files: ex.files ?? [],
    samples: ex.tests.filter((t) => !t.hidden).map((t) => ({ label: t.label, input: t.input, output: t.output })),
    hiddenCount: ex.tests.filter((t) => t.hidden).length,
    hintCount: ex.hints.length,
    version: pyExerciseVersion(ex),
  };
}
export type PublicExercise = ReturnType<typeof publicExercise>;

/** A lesson for the page: no exercise solutions, no hidden tests, no question answers. */
export function publicLesson(l: PyLesson) {
  const m = pyModuleOf(l.id)!;
  return {
    id: l.id, title: l.title, minutes: l.minutes, difficulty: l.difficulty, objectives: l.objectives, why: l.why,
    concept: l.concept, example: l.example, mistakes: l.mistakes, realWorld: l.realWorld, summary: l.summary,
    cpp: l.cpp ?? null, version: l.version ?? null, libraryCode: l.libraryCode ?? [],
    warmup: publicQuestion(getPyQuestion(`${l.id}/${l.warmup.id}`)!),
    questions: l.questions.map((q) => publicQuestion(getPyQuestion(`${l.id}/${q.id}`)!)),
    exercises: l.exercises.map((ex) => publicExercise(getPyExercise(`${l.id}/${ex.id}`)!)),
    moduleId: m.id,
  };
}
export type PublicLesson = ReturnType<typeof publicLesson>;

// ── Structural validation (content tests also run everything through the sandbox) ────────────

const BLANK = /___/g;

function checkQuestion(where: string, q: PyQuestion, problems: string[]) {
  if (!q.hint.trim() || !q.explain.trim()) problems.push(`${where}: needs a hint and an explanation`);
  if (q.difficulty < 1 || q.difficulty > 5) problems.push(`${where}: difficulty must be 1..5`);
  switch (q.kind) {
    case "mcq":
      if (q.options.length < 2) problems.push(`${where}: needs at least 2 options`);
      if (q.answer < 0 || q.answer >= q.options.length) problems.push(`${where}: answer out of range`);
      if (q.options.some((o) => !o.why.trim())) problems.push(`${where}: every option needs a why`);
      break;
    case "predict":
      if (!q.code.trim()) problems.push(`${where}: predict needs code`);
      break;
    case "fill": {
      const n = q.code.match(BLANK)?.length ?? 0;
      if (n === 0 || n !== q.blanks.length) problems.push(`${where}: ${n} blanks in code but ${q.blanks.length} answer lists`);
      if (q.blanks.some((b) => !b.length || b.some((a) => !a.trim()))) problems.push(`${where}: empty blank answer`);
      break;
    }
    case "bug": {
      const lines = q.code.split("\n").length;
      if (q.line < 1 || q.line > lines) problems.push(`${where}: bug line ${q.line} out of range`);
      if (q.fix === q.code) problems.push(`${where}: fix is identical to the buggy code`);
      break;
    }
  }
}

function checkExercise(where: string, ex: PyExercise, problems: string[]) {
  if (!ex.tests.some((t) => !t.hidden)) problems.push(`${where}: needs a visible test`);
  if (ex.tests.length > 20) problems.push(`${where}: too many tests (max 20)`);
  if (ex.hints.length !== 4 || ex.hints.some((h) => !h.trim())) problems.push(`${where}: needs 4 hints`);
  if (!ex.solution.trim() || !ex.notes.trim()) problems.push(`${where}: needs a solution and notes`);
  if ((ex.files?.length ?? 0) > 6) problems.push(`${where}: too many files`);
}

export function validatePython(): string[] {
  const problems: string[] = [];
  const seenLessons = new Set<string>();
  const seenModules = new Set<string>();
  PY_MODULES.forEach((m, mi) => {
    if (m.number !== mi + 1) problems.push(`${m.id}: module number ${m.number} should be ${mi + 1}`);
    if (seenModules.has(m.id)) problems.push(`${m.id}: duplicate module id`);
    if (!PY_LEVELS.some((lv) => lv.number === m.level)) problems.push(`${m.id}: unknown level ${m.level}`);
    if (mi > 0 && m.level < PY_MODULES[mi - 1].level) problems.push(`${m.id}: levels must not go backwards`);
    for (const p of m.prereqs) if (!seenModules.has(p)) problems.push(`${m.id}: prerequisite ${p} must be an earlier module`);
    seenModules.add(m.id);
    if (!m.lessons.length) problems.push(`${m.id}: needs lessons`);
    if (m.exam.length < 3) problems.push(`${m.id}: module assessment needs at least 3 extra questions`);
    if (m.project.kind !== "project") problems.push(`${m.id}: mini-project must have kind "project"`);
    m.exam.forEach((q) => checkQuestion(`${m.id}/exam/${q.id}`, q, problems));
    if (new Set(m.exam.map((q) => q.id)).size !== m.exam.length) problems.push(`${m.id}: duplicate exam question id`);
    checkExercise(`${m.id}/project`, m.project, problems);

    for (const l of m.lessons) {
      const at = l.id;
      if (seenLessons.has(l.id)) problems.push(`${at}: duplicate lesson id`);
      if (!/^py-[a-z0-9-]{2,60}$/.test(l.id)) problems.push(`${at}: id must look like py-lower-case`);
      for (const p of l.prereqs ?? []) if (!seenLessons.has(p)) problems.push(`${at}: prerequisite ${p} must be an earlier lesson`);
      seenLessons.add(l.id);
      if (l.objectives.length < 2) problems.push(`${at}: needs at least 2 objectives`);
      if (!l.why.trim() || !l.realWorld.trim() || !l.reteach.trim()) problems.push(`${at}: needs why, real-world and reteach text`);
      if (!l.concept.length) problems.push(`${at}: needs concept sections`);
      if (l.mistakes.length < 2) problems.push(`${at}: needs at least 2 common mistakes`);
      if (l.summary.length < 2) problems.push(`${at}: needs a summary`);
      const codeLines = l.example.code.split("\n").length;
      if (l.example.lines.length < Math.min(3, codeLines)) problems.push(`${at}: example needs a line-by-line walkthrough`);
      const exampleLines = l.example.code.split("\n");
      for (const [n] of l.example.lines) {
        if (n < 1 || n > codeLines) problems.push(`${at}: walkthrough points at line ${n}`);
        else if (!exampleLines[n - 1].trim()) problems.push(`${at}: walkthrough points at blank line ${n}`);
      }
      if (l.warmup.kind !== "mcq") problems.push(`${at}: warm-up must be multiple choice`);
      checkQuestion(`${at}/${l.warmup.id}`, l.warmup, problems);
      const ids = new Set<string>([l.warmup.id]);
      for (const q of l.questions) {
        if (ids.has(q.id)) problems.push(`${at}: duplicate question id ${q.id}`);
        ids.add(q.id);
        checkQuestion(`${at}/${q.id}`, q, problems);
      }
      for (const kind of ["predict", "fill", "bug"] as const) {
        if (!l.questions.some((q) => q.kind === kind)) problems.push(`${at}: needs a ${kind} question`);
      }
      if (l.exercises.length < 2) problems.push(`${at}: needs a coding task and a harder follow-up`);
      if (l.exercises[0] && !["task", "debug"].includes(l.exercises[0].kind)) problems.push(`${at}: first exercise must be the core task`);
      const exIds = new Set<string>();
      l.exercises.forEach((ex, i) => {
        if (exIds.has(ex.id)) problems.push(`${at}: duplicate exercise id ${ex.id}`);
        exIds.add(ex.id);
        if (i > 0 && ex.difficulty < l.exercises[i - 1].difficulty) problems.push(`${at}: exercises must get harder (${ex.id})`);
        checkExercise(`${at}/${ex.id}`, ex, problems);
      });
      if (l.cpp && (!l.cpp.python.trim() || !l.cpp.cpp.trim())) problems.push(`${at}: incomplete C++ comparison`);
    }
  });
  const projectIds = new Set<string>();
  for (const p of PY_PROJECTS) {
    if (projectIds.has(p.id)) problems.push(`project ${p.id}: duplicate id`);
    projectIds.add(p.id);
    if (p.milestones.length < 2) problems.push(`project ${p.id}: needs at least 2 milestones`);
    if (!p.limitations.length) problems.push(`project ${p.id}: must state its limitations`);
    for (const u of p.uses) if (!moduleById.has(u)) problems.push(`project ${p.id}: unknown module ${u}`);
    p.milestones.forEach((ex) => checkExercise(`project ${p.id}/${ex.id}`, ex, problems));
  }
  return problems;
}

/** Lesson count per module etc. for the roadmap (no bodies). */
export function pyCatalog() {
  return PY_LEVELS.map((lv) => ({
    ...lv,
    modules: PY_MODULES.filter((m) => m.level === lv.number).map((m) => ({
      id: m.id, number: m.number, title: m.title, summary: m.summary, track: m.track, optionalNote: m.optionalNote ?? null, prereqs: m.prereqs,
      lessons: m.lessons.map((l) => ({ id: l.id, title: l.title, minutes: l.minutes, difficulty: l.difficulty })),
    })),
  }));
}

export type { PyModuleDef, PyProject };
