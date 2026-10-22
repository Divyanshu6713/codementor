/**
 * The learner's Python state, computed only from stored evidence (attempts, judged checks,
 * assessments, revision schedule, activity heartbeats). Nothing here is a stored or hard-coded
 * percentage: completion, mastery, streaks, time and XP are all derived on read.
 */
import { and, desc, eq, isNotNull } from "drizzle-orm";
import {
  PY_LESSONS, PY_LEVELS, PY_MODULES, PY_PROJECTS, coreExerciseKey, getPyExercise, getPyLesson, getPyQuestion, lessonPrereqs, pyModuleOf,
} from "@/content/python";
import { schema, type Tx } from "@/server/db/client";

export const PASS_MARK = 0.7;
export const MASTERY_GOOD = 0.6;
export const REVIEW_INTERVALS_DAYS = [1, 3, 7, 14, 30, 60];

/**
 * Python XP (added to the same total as the C++ path). Exercises use the C++ lesson rule — by help
 * used before passing: ≤1 hint 25, 2 hints 20, 3–4 hints 15, after the worked solution 5.
 */
export const PY_XP = {
  exercise: (hintLevel: number, afterSolution: boolean) => (afterSolution ? 5 : hintLevel <= 1 ? 25 : hintLevel === 2 ? 20 : 15),
  miniProject: (afterSolution: boolean) => (afterSolution ? 10 : 40),
  milestone: (afterSolution: boolean) => (afterSolution ? 10 : 30),
  question: 2,
  lesson: 10,
  examPassed: 30,
  module: 50,
  portfolioProject: 100,
} as const;

export type LessonStatus = "locked" | "available" | "in_progress" | "completed";

export async function loadPyRecords(db: Tx, studentId: string) {
  const [attempts, exercises, reviews, settings, assessments, activity] = await Promise.all([
    db.select({
      itemId: schema.pyAttempts.itemId, lessonId: schema.pyAttempts.lessonId, moduleId: schema.pyAttempts.moduleId, kind: schema.pyAttempts.kind,
      mode: schema.pyAttempts.mode, correct: schema.pyAttempts.correct, revealed: schema.pyAttempts.revealed, difficulty: schema.pyAttempts.difficulty,
      createdAt: schema.pyAttempts.createdAt,
    }).from(schema.pyAttempts).where(eq(schema.pyAttempts.studentId, studentId)).orderBy(schema.pyAttempts.createdAt),
    db.select().from(schema.pyExerciseProgress).where(eq(schema.pyExerciseProgress.studentId, studentId)),
    db.select().from(schema.pyReviews).where(eq(schema.pyReviews.studentId, studentId)),
    db.query.pySettings.findFirst({ where: eq(schema.pySettings.studentId, studentId) }),
    db.select().from(schema.pyAssessments).where(and(eq(schema.pyAssessments.studentId, studentId), isNotNull(schema.pyAssessments.submittedAt))).orderBy(desc(schema.pyAssessments.submittedAt)),
    db.select().from(schema.pyActivity).where(eq(schema.pyActivity.studentId, studentId)),
  ]);
  return { attempts, exercises, reviews, settings: settings ?? { guided: true, unlocked: [] as string[] }, assessments, activity };
}
export type PyRecords = Awaited<ReturnType<typeof loadPyRecords>>;
type Attempt = PyRecords["attempts"][number];

const day = (d: Date) => d.toISOString().slice(0, 10);

/** Recency-weighted accuracy over the last 8 graded attempts (newest counts most); null = no evidence. */
export function masteryOf(attempts: Pick<Attempt, "correct" | "revealed">[]): number | null {
  const recent = attempts.slice(-8);
  if (!recent.length) return null;
  let num = 0;
  let den = 0;
  recent.forEach((a, i) => {
    const w = i + 1;
    den += w;
    if (a.correct && !a.revealed) num += w;
  });
  return num / den;
}

/** Consecutive active days ending today (or yesterday, if nothing yet today). */
export function streakOf(days: Set<string>, now: Date) {
  const sorted = [...days].sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of sorted) {
    run = prev && Date.parse(d) - Date.parse(prev) === 86_400_000 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  let current = 0;
  const cursor = new Date(Date.parse(day(now)));
  if (!days.has(day(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1);
  while (days.has(day(cursor))) {
    current++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return { current, best, activeToday: days.has(day(now)) };
}

export function computePyState(rec: PyRecords, now = new Date()) {
  const graded = rec.attempts.filter((a) => a.kind === "code" || getPyQuestion(a.itemId)?.source !== "warmup");
  const byLesson = new Map<string, Attempt[]>();
  for (const a of graded) if (a.lessonId) byLesson.set(a.lessonId, [...(byLesson.get(a.lessonId) ?? []), a]);
  const exByKey = new Map(rec.exercises.map((e) => [e.exerciseKey, e]));
  const passed = (key: string) => Boolean(exByKey.get(key)?.passedAt);
  const correctOnce = new Map<string, Date>();
  for (const a of rec.attempts) if (a.correct && !a.revealed && !correctOnce.has(a.itemId)) correctOnce.set(a.itemId, a.createdAt);
  const unlocked = new Set(rec.settings.unlocked ?? []);
  const touched = new Set(rec.attempts.map((a) => a.lessonId).filter(Boolean) as string[]);
  for (const e of rec.exercises) {
    const ref = getPyExercise(e.exerciseKey);
    if (ref?.lessonId && (e.checks > 0 || e.hintLevel > 0)) touched.add(ref.lessonId);
  }

  // ── Lessons ──
  const lessonInfo = new Map<string, {
    id: string; title: string; minutes: number; difficulty: number; status: LessonStatus; mastery: number | null; attempts: number;
    corePassed: boolean; questionsDone: number; questionsTotal: number; completedAt: Date | null; exercisesPassed: number; exercisesTotal: number;
  }>();
  for (const l of PY_LESSONS) {
    const qIds = l.questions.map((q) => `${l.id}/${q.id}`);
    const done = qIds.filter((id) => correctOnce.has(id));
    const attempts = byLesson.get(l.id) ?? [];
    const mastery = masteryOf(attempts);
    const coreKey = coreExerciseKey(l);
    const corePassed = passed(coreKey);
    const complete = corePassed && done.length === qIds.length && (mastery ?? 0) >= MASTERY_GOOD;
    const completedAt = complete
      ? new Date(Math.max(exByKey.get(coreKey)!.passedAt!.getTime(), ...done.map((id) => correctOnce.get(id)!.getTime())))
      : null;
    lessonInfo.set(l.id, {
      id: l.id, title: l.title, minutes: l.minutes, difficulty: l.difficulty, status: complete ? "completed" : "available", mastery, attempts: attempts.length,
      corePassed, questionsDone: done.length, questionsTotal: qIds.length, completedAt,
      exercisesPassed: l.exercises.filter((ex) => passed(`${l.id}/${ex.id}`)).length, exercisesTotal: l.exercises.length,
    });
  }
  for (const l of PY_LESSONS) {
    const info = lessonInfo.get(l.id)!;
    if (info.status === "completed") continue;
    const ready = lessonPrereqs(l.id).every((p) => lessonInfo.get(p)?.status === "completed");
    info.status = touched.has(l.id) ? "in_progress" : ready || !rec.settings.guided || unlocked.has(l.id) ? "available" : "locked";
  }

  // ── Modules, levels ──
  const examsBy = new Map<string, PyRecords["assessments"]>();
  for (const a of rec.assessments) if (a.kind === "module") examsBy.set(a.scopeId, [...(examsBy.get(a.scopeId) ?? []), a]);
  const modules = PY_MODULES.map((m) => {
    const lessons = m.lessons.map((l) => lessonInfo.get(l.id)!);
    const exams = examsBy.get(m.id) ?? [];
    const best = exams.reduce<number | null>((b, a) => (a.total ? Math.max(b ?? 0, (a.score ?? 0) / a.total) : b), null);
    const firstPass = exams.filter((a) => a.passed).map((a) => a.submittedAt!).sort((x, y) => x.getTime() - y.getTime())[0] ?? null;
    const lessonsDone = lessons.filter((l) => l.status === "completed").length;
    const masteries = lessons.map((l) => l.mastery).filter((x): x is number => x !== null);
    const complete = lessonsDone === lessons.length && Boolean(firstPass);
    return {
      id: m.id, number: m.number, level: m.level, title: m.title, summary: m.summary, track: m.track, optionalNote: m.optionalNote ?? null,
      lessons, lessonsDone, lessonsTotal: lessons.length,
      mastery: masteries.length ? masteries.reduce((s, x) => s + x, 0) / masteries.length : null,
      examBest: best, examPassedAt: firstPass, examAttempts: exams.length,
      projectPassed: passed(`${m.id}/${m.project.id}`),
      complete,
      completedAt: complete ? new Date(Math.max(firstPass!.getTime(), ...lessons.map((l) => l.completedAt!.getTime()))) : null,
      started: lessons.some((l) => l.status === "in_progress" || l.status === "completed"),
    };
  });
  const levels = PY_LEVELS.map((lv) => {
    const ms = modules.filter((m) => m.level === lv.number);
    return { ...lv, modulesDone: ms.filter((m) => m.complete).length, modulesTotal: ms.length, complete: ms.length > 0 && ms.every((m) => m.complete) };
  });

  // ── Recommendations, weak topics, mistakes, revision ──
  const lessons = PY_LESSONS.map((l) => lessonInfo.get(l.id)!);
  // Recommend lessons already in progress first, then core lessons; optional specialist paths only once
  // the learner has started one (or when no core lesson is left).
  const open = lessons.filter((l) => l.status === "in_progress" || l.status === "available");
  const isCore = (id: string) => pyModuleOf(id)?.track === "core";
  const next = (open.find((l) => l.status === "in_progress") ?? open.find((l) => isCore(l.id)) ?? open[0])?.id ?? null;
  const weak = lessons
    .filter((l) => l.attempts >= 3 && l.mastery !== null && l.mastery < MASTERY_GOOD)
    .sort((a, b) => (a.mastery ?? 0) - (b.mastery ?? 0))
    .map((l) => ({ lessonId: l.id, title: l.title, mastery: l.mastery!, attempts: l.attempts }));
  const latest = new Map<string, Attempt>();
  for (const a of rec.attempts) if (a.kind !== "code" && a.mode !== "exam" && a.mode !== "interview") latest.set(a.itemId, a);
  const mistakes = [...latest.values()].filter((a) => !a.correct).map((a) => ({ questionId: a.itemId, lessonId: a.lessonId, at: a.createdAt }));
  const due = rec.reviews.filter((r) => r.dueAt <= now).sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime())
    .map((r) => ({ lessonId: r.lessonId, title: getPyLesson(r.lessonId)?.title ?? r.lessonId, box: r.box, dueAt: r.dueAt }));

  // ── Activity, streak, time, accuracy ──
  const activeDays = new Set<string>(rec.attempts.map((a) => day(a.createdAt)));
  for (const a of rec.activity) if (a.seconds >= 60) activeDays.add(a.day);
  const streak = streakOf(activeDays, now);
  const weekAgo = day(new Date(now.getTime() - 6 * 86_400_000));
  const timeSeconds = rec.activity.reduce((s, a) => s + a.seconds, 0);
  const weekSeconds = rec.activity.filter((a) => a.day >= weekAgo).reduce((s, a) => s + a.seconds, 0);
  const codeChecks = rec.attempts.filter((a) => a.kind === "code");
  const questionAttempts = rec.attempts.filter((a) => a.kind !== "code");

  // ── Projects ──
  const portfolioDone = PY_PROJECTS.filter((p) => p.milestones.every((ms) => passed(`project:${p.id}/${ms.id}`)));
  const projectMilestonesPassed = PY_PROJECTS.reduce((s, p) => s + p.milestones.filter((ms) => passed(`project:${p.id}/${ms.id}`)).length, 0);

  // ── XP (shared with the C++ path's level and leaderboard) ──
  const xpEvents: { at: Date; xp: number; label: string }[] = [];
  for (const e of rec.exercises) {
    if (!e.passedAt) continue;
    const ref = getPyExercise(e.exerciseKey);
    if (!ref) continue;
    const after = Boolean(e.passedAfterSolution);
    const xp = ref.projectId ? PY_XP.milestone(after) : ref.ex.kind === "project" ? PY_XP.miniProject(after) : PY_XP.exercise(e.passedHintLevel ?? 0, after);
    xpEvents.push({ at: e.passedAt, xp, label: ref.title });
  }
  for (const [id, at] of correctOnce) {
    const ref = getPyQuestion(id);
    if (ref && ref.source !== "exam") xpEvents.push({ at, xp: PY_XP.question, label: "Question" });
  }
  for (const l of lessons) if (l.completedAt) xpEvents.push({ at: l.completedAt, xp: PY_XP.lesson, label: `Lesson: ${l.title}` });
  for (const m of modules) {
    if (m.examPassedAt) xpEvents.push({ at: m.examPassedAt, xp: PY_XP.examPassed, label: `Exam passed: ${m.title}` });
    if (m.completedAt) xpEvents.push({ at: m.completedAt, xp: PY_XP.module, label: `Module complete: ${m.title}` });
  }
  for (const p of portfolioDone) {
    const at = new Date(Math.max(...p.milestones.map((ms) => exByKey.get(`project:${p.id}/${ms.id}`)!.passedAt!.getTime())));
    xpEvents.push({ at, xp: PY_XP.portfolioProject, label: `Project complete: ${p.title}` });
  }

  const lessonsDone = lessons.filter((l) => l.status === "completed").length;
  const firstPass = rec.exercises.filter((e) => e.passedAt).map((e) => e.passedAt!).sort((a, b) => a.getTime() - b.getTime())[0] ?? null;
  const firstLesson = lessons.map((l) => l.completedAt).filter((d): d is Date => d !== null).sort((a, b) => a.getTime() - b.getTime())[0] ?? null;
  const firstModule = modules.map((m) => m.completedAt).filter((d): d is Date => d !== null).sort((a, b) => a.getTime() - b.getTime())[0] ?? null;
  const level1 = levels[0]?.complete ? new Date(Math.max(...modules.filter((m) => m.level === 1).map((m) => m.completedAt!.getTime()))) : null;
  const milestones = [
    { id: "first-program", title: "First Python program passed", at: firstPass },
    { id: "first-lesson", title: "First lesson completed", at: firstLesson },
    { id: "answers-50", title: "50 questions answered", at: questionAttempts[49]?.createdAt ?? null },
    { id: "first-module", title: "First module completed (lessons + assessment)", at: firstModule },
    { id: "first-project", title: "First mini-project passed", at: rec.exercises.filter((e) => e.passedAt && getPyExercise(e.exerciseKey)?.ex.kind === "project").map((e) => e.passedAt!).sort((a, b) => a.getTime() - b.getTime())[0] ?? null },
    { id: "streak-7", title: "7-day learning streak", at: streak.best >= 7 ? now : null },
    { id: "level-1", title: "Level 1: Python Foundations complete", at: level1 },
    { id: "portfolio", title: "Portfolio project completed", at: portfolioDone.length ? xpEvents.find((e) => e.label.startsWith("Project complete"))!.at : null },
  ];

  return {
    lessons, lessonInfo, modules, levels, next, weak, mistakes, revisionDue: due,
    settings: { guided: rec.settings.guided, unlocked: [...unlocked] },
    totals: {
      lessonsDone, lessonsTotal: lessons.length, modulesDone: modules.filter((m) => m.complete).length, modulesTotal: modules.length,
      percent: lessons.length ? lessonsDone / lessons.length : 0,
      questionsAnswered: questionAttempts.length, questionAccuracy: questionAttempts.length ? questionAttempts.filter((a) => a.correct && !a.revealed).length / questionAttempts.length : null,
    },
    coding: { checks: codeChecks.length, passedChecks: codeChecks.filter((a) => a.correct).length, accuracy: codeChecks.length ? codeChecks.filter((a) => a.correct).length / codeChecks.length : null, exercisesPassed: rec.exercises.filter((e) => e.passedAt).length },
    streak, timeSeconds, weekSeconds,
    assessments: rec.assessments.map((a) => ({ id: a.id, kind: a.kind, scopeId: a.scopeId, score: a.score ?? 0, total: a.total ?? 0, passed: Boolean(a.passed), at: a.submittedAt! })),
    projects: { modulePassed: modules.filter((m) => m.projectPassed).length, portfolioDone: portfolioDone.map((p) => p.id), milestonesPassed: projectMilestonesPassed },
    xp: xpEvents.reduce((s, e) => s + e.xp, 0), xpEvents, milestones,
    history: historyByDay(rec.attempts),
  };
}
export type PyState = ReturnType<typeof computePyState>;

/** Practice history: per day and mode, how many answered and how many correct (last 14 active days). */
function historyByDay(attempts: Attempt[]) {
  const map = new Map<string, { day: string; answered: number; correct: number; checks: number; passed: number; modes: Set<string> }>();
  for (const a of attempts) {
    const d = day(a.createdAt);
    const row = map.get(d) ?? { day: d, answered: 0, correct: 0, checks: 0, passed: 0, modes: new Set<string>() };
    if (a.kind === "code") {
      row.checks++;
      if (a.correct) row.passed++;
    } else {
      row.answered++;
      if (a.correct && !a.revealed) row.correct++;
    }
    row.modes.add(a.mode);
    map.set(d, row);
  }
  return [...map.values()].sort((a, b) => b.day.localeCompare(a.day)).slice(0, 14).map((r) => ({ ...r, modes: [...r.modes] }));
}

export async function pyState(db: Tx, studentId: string, now = new Date()) {
  return computePyState(await loadPyRecords(db, studentId), now);
}

/** Lesson module lookup for attempts. */
export function lessonModule(lessonId: string | null) {
  return lessonId ? pyModuleOf(lessonId)?.id ?? null : null;
}
