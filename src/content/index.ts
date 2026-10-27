import { CONCEPTS, DIAGNOSTIC_LADDER, TRACKS } from "./curriculum";
import { MISCONCEPTIONS } from "./misconceptions";
import { DIAGNOSTIC_QUESTIONS } from "./questions/diagnostic";
import { FOR_LOOP_QUESTIONS } from "./questions/for-loops";
import { COMPARISON_QUESTIONS } from "./questions/comparison";
import { FOUNDATION_QUESTIONS } from "./questions/foundations";
import { FUNCTIONS_ARRAYS_QUESTIONS } from "./questions/functions-arrays";
import { FOR_LOOPS_LESSON } from "./lessons/for-loops";
import { COMPARISON_LESSON } from "./lessons/comparison-ops";
import { TRACES } from "./traces";
import type { AchievementDef, ConceptDef, LessonDef, MisconceptionDef, QuestionDef } from "./types";
import { PY_ACHIEVEMENTS } from "./python/achievements";

export const ACHIEVEMENTS: AchievementDef[] = [
  { code: "FIRST_PROGRAM", title: "First Program", description: "Compiled and ran your first C++ program." },
  { code: "FIRST_LOOP", title: "First Loop", description: "Wrote a working for loop that passed every test." },
  { code: "SOLVED_10", title: "10 Problems Solved", description: "Finished 10 questions correctly." },
  { code: "INDEPENDENT_5", title: "On Your Own", description: "Solved 5 coding problems without any hints." },
  { code: "FIXED_MISTAKE", title: "Mistake Fixed", description: "Went back to a mistake and got it right." },
  { code: "FIXED_10", title: "Fixed 10 Mistakes", description: "Turned 10 mistakes into correct answers." },
  { code: "DEBUGGER", title: "Debugging Master", description: "Fixed 3 buggy programs." },
  { code: "EXPLAINER", title: "Explainer", description: "Explained a concept back in your own words." },
  { code: "CONCEPT_MASTERED", title: "Concept Mastered", description: "Reached mastery on every skill in a concept." },
  { code: "CAME_BACK", title: "Came Back to Revise", description: "Completed a revision session." },
  { code: "FIRST_LESSON", title: "First Steps", description: "Passed the exercise of your first step-by-step lesson." },
  { code: "MODULE_FOUNDATIONS", title: "Foundations Built", description: "Completed every lesson in Module 1: Programming foundations." },
  { code: "MODULE_LOGIC", title: "Decision Maker", description: "Completed every lesson in Module 2: Logic and decision making." },
  { code: "MODULE_LOOPS", title: "Loop Master", description: "Completed every lesson in Module 3: Loops." },
  { code: "LESSON_SOLO_5", title: "No Hints Needed", description: "Passed 5 lesson exercises without opening more than one hint." },
  ...PY_ACHIEVEMENTS,
];

export const QUESTIONS: QuestionDef[] = [...DIAGNOSTIC_QUESTIONS, ...FOR_LOOP_QUESTIONS, ...COMPARISON_QUESTIONS, ...FOUNDATION_QUESTIONS, ...FUNCTIONS_ARRAYS_QUESTIONS];
export const LESSONS: LessonDef[] = [FOR_LOOPS_LESSON, COMPARISON_LESSON];
export { CONCEPTS, DIAGNOSTIC_LADDER, MISCONCEPTIONS, TRACES, TRACKS };

const byId = <T, K extends keyof T>(list: T[], key: K) => new Map(list.map((x) => [x[key] as unknown as string, x]));
export const conceptById = byId(CONCEPTS, "id") as Map<string, ConceptDef>;
export const questionById = byId(QUESTIONS, "id") as Map<string, QuestionDef>;
export const misconceptionByCode = byId(MISCONCEPTIONS, "code") as Map<string, MisconceptionDef>;
export const lessonById = byId(LESSONS, "id") as Map<string, LessonDef>;

export const skillToConcept = new Map<string, string>(CONCEPTS.flatMap((c) => c.skills.map((s) => [s.id, c.id] as const)));
export const skillTitle = new Map<string, string>(CONCEPTS.flatMap((c) => c.skills.map((s) => [s.id, s.title] as const)));

export function lessonsForConcept(conceptId: string, kind?: "core" | "remediation") {
  return LESSONS.filter((l) => l.conceptId === conceptId && (!kind || l.kind === kind));
}

/**
 * Referential integrity of the authored content. Returns a list of problems (empty = valid).
 * Run by the sync step (fails fast) and by tests.
 */
export function validateContent(): string[] {
  const problems: string[] = [];
  const conceptIds = new Set(CONCEPTS.map((c) => c.id));
  const skillIds = new Set(skillToConcept.keys());
  const mcCodes = new Set(MISCONCEPTIONS.map((m) => m.code));
  const traceIds = new Set(TRACES.map((t) => t.id));
  const seen = new Set<string>();

  CONCEPTS.forEach((c, i) => {
    if (!TRACKS.some((t) => t.id === c.trackId)) problems.push(`concept ${c.id}: unknown track ${c.trackId}`);
    for (const p of c.prerequisites) {
      if (!conceptIds.has(p.id)) problems.push(`concept ${c.id}: unknown prerequisite ${p.id}`);
      else if (CONCEPTS.findIndex((x) => x.id === p.id) > i) problems.push(`concept ${c.id}: prerequisite ${p.id} appears later (order must be topological)`);
    }
  });
  for (const id of DIAGNOSTIC_LADDER) if (!conceptIds.has(id)) problems.push(`ladder: unknown concept ${id}`);
  for (const m of MISCONCEPTIONS) if (!conceptIds.has(m.conceptId)) problems.push(`misconception ${m.code}: unknown concept`);

  for (const q of QUESTIONS) {
    if (seen.has(q.id)) problems.push(`question ${q.id}: duplicate id`);
    seen.add(q.id);
    if (!conceptIds.has(q.conceptId)) problems.push(`question ${q.id}: unknown concept ${q.conceptId}`);
    if (!q.skills.length) problems.push(`question ${q.id}: no skills`);
    for (const s of q.skills) if (!skillIds.has(s.id)) problems.push(`question ${q.id}: unknown skill ${s.id}`);
    for (const p of q.probes ?? []) if (!mcCodes.has(p)) problems.push(`question ${q.id}: unknown probe ${p}`);
    if (q.hints.length !== 5 || q.hints.some((h) => !h.trim())) problems.push(`question ${q.id}: needs 5 hint levels`);
    switch (q.type) {
      case "mcq": case "predict_output": case "identify_error": {
        const ids = q.options.map((o) => o.id);
        if (new Set(ids).size !== ids.length) problems.push(`question ${q.id}: duplicate option ids`);
        if (!ids.includes(q.correct)) problems.push(`question ${q.id}: correct option missing`);
        for (const o of q.options) {
          if (o.misconception && !mcCodes.has(o.misconception)) problems.push(`question ${q.id}: option ${o.id} unknown misconception`);
          if (o.id === q.correct && o.misconception) problems.push(`question ${q.id}: correct option tagged with a misconception`);
        }
        if ((q.type === "predict_output" || q.type === "identify_error") && !q.code) problems.push(`question ${q.id}: needs code`);
        break;
      }
      case "complete_code":
        if ((q.code?.match(/____/g) ?? []).length !== 1) problems.push(`question ${q.id}: needs exactly one ____ blank`);
        if (!q.accepted.length) problems.push(`question ${q.id}: no accepted answers`);
        for (const w of q.wrongAnswers ?? []) if (w.misconception && !mcCodes.has(w.misconception)) problems.push(`question ${q.id}: unknown misconception ${w.misconception}`);
        break;
      case "reorder":
        if (q.lines.length < 3) problems.push(`question ${q.id}: reorder needs 3+ lines`);
        if (new Set(q.lines).size !== q.lines.length) problems.push(`question ${q.id}: duplicate reorder lines`);
        break;
      case "trace":
        if (!q.fields.length || !q.code) problems.push(`question ${q.id}: trace needs code and fields`);
        break;
      case "write_code":
        if (!q.tests.some((t) => t.visibility === "sample")) problems.push(`question ${q.id}: needs a sample test`);
        if (!q.tests.some((t) => t.visibility === "hidden")) problems.push(`question ${q.id}: needs a hidden test`);
        break;
      case "explain":
        if (q.rubric.required > q.rubric.keyIdeas.length) problems.push(`question ${q.id}: rubric requires more ideas than exist`);
        for (const k of q.rubric.keyIdeas) for (const p of k.patterns) {
          try { new RegExp(p, "i"); } catch { problems.push(`question ${q.id}: bad pattern ${p}`); }
        }
        break;
    }
  }

  for (const l of LESSONS) {
    if (!conceptIds.has(l.conceptId)) problems.push(`lesson ${l.id}: unknown concept`);
    const keys = new Set<string>();
    for (const s of l.steps) {
      if (keys.has(s.key)) problems.push(`lesson ${l.id}: duplicate step ${s.key}`);
      keys.add(s.key);
    }
    for (const s of l.steps) {
      if (s.kind === "checkpoint") {
        for (const [code, target] of Object.entries(s.reteach)) {
          if (code !== "default" && !mcCodes.has(code)) problems.push(`lesson ${l.id}/${s.key}: unknown misconception ${code}`);
          const t = l.steps.find((x) => x.key === target);
          if (!t || t.kind !== "reteach") problems.push(`lesson ${l.id}/${s.key}: reteach target ${target} is not a reteach step`);
        }
        for (const qid of [s.questionId, s.retryQuestionId]) {
          const q = questionById.get(qid);
          if (!q) problems.push(`lesson ${l.id}/${s.key}: unknown question ${qid}`);
          else if (q.type === "write_code" || q.type === "explain") problems.push(`lesson ${l.id}/${s.key}: checkpoints must be quick questions`);
        }
      }
      if (s.kind === "code") {
        const q = questionById.get(s.questionId);
        if (!q || q.type !== "write_code") problems.push(`lesson ${l.id}/${s.key}: code step needs a write_code question`);
      }
      if (s.kind === "explain_back") {
        const q = questionById.get(s.questionId);
        if (!q || q.type !== "explain") problems.push(`lesson ${l.id}/${s.key}: explain step needs an explain question`);
      }
      if (s.kind === "dry_run" && !traceIds.has(s.traceId)) problems.push(`lesson ${l.id}/${s.key}: unknown trace ${s.traceId}`);
      if ((s.kind === "practice" || s.kind === "exit_check")) {
        for (const sk of s.skills) if (!skillIds.has(sk)) problems.push(`lesson ${l.id}/${s.key}: unknown skill ${sk}`);
      }
    }
  }
  return problems;
}
