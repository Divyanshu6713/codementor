/**
 * Python Mastery platform: grading, progress, mastery, locking, revision, assessments, practice,
 * activity time and XP — against a real (in-memory PGlite) database and, where available, the
 * real Python sandbox for judged exercises.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { PY_LESSONS, coreExerciseKey, getPyExercise, getPyQuestion, publicQuestion, type PyQuestion } from "@/content/python";
import { schema, type DB } from "@/server/db/client";
import { gradeAnswer, normalizeOutput, type PyAnswer } from "@/server/python/grading";
import { answerQuestion, completeRevision, nextPracticeQuestion, revealQuestion, revisionSet } from "@/server/python/questions";
import { checkPython, pyHint, pySolution, saveCode, loadCode } from "@/server/python/exercises";
import { getAssessment, startAssessment, submitAssessment } from "@/server/python/assessments";
import { addActiveTime, setGuided, unlockLesson } from "@/server/python/learner";
import { computePyState, masteryOf, pyState, streakOf } from "@/server/python/state";
import { progression } from "@/server/services/progression";
import { canExecute, freshDb, makeStudent, noExecution, useLocalSandbox } from "./helpers";

const right = (q: PyQuestion): PyAnswer => {
  switch (q.kind) {
    case "mcq": return { kind: "mcq", choice: q.answer };
    case "predict": return { kind: "predict", text: q.answer };
    case "fill": return { kind: "fill", blanks: q.blanks.map((b) => b[0]) };
    case "bug": return { kind: "bug", line: q.line };
  }
};
const wrong = (q: PyQuestion): PyAnswer => {
  switch (q.kind) {
    case "mcq": return { kind: "mcq", choice: (q.answer + 1) % q.options.length };
    case "predict": return { kind: "predict", text: "definitely not this" };
    case "fill": return { kind: "fill", blanks: q.blanks.map(() => "zzz") };
    case "bug": return { kind: "bug", line: q.line === 1 ? 2 : 1 };
  }
};

describe("grading (pure)", () => {
  const lesson = PY_LESSONS[0];
  it("grades every kind and explains", () => {
    for (const q of lesson.questions) {
      const ref = getPyQuestion(`${lesson.id}/${q.id}`)!;
      const ok = gradeAnswer(ref, right(q));
      const bad = gradeAnswer(ref, wrong(q));
      expect(ok.correct, q.id).toBe(true);
      expect(bad.correct, q.id).toBe(false);
      expect(bad.explanation.length).toBeGreaterThan(10);
      expect(bad.feedback.length).toBeGreaterThan(3);
    }
  });

  it("is lenient only where it should be", () => {
    expect(normalizeOutput("a  \r\nb\n\n")).toBe("a\nb");
    expect(normalizeOutput("x\ty")).toBe("x y");
    const fill = getPyQuestion("py-first-program/f1")!;
    expect(gradeAnswer(fill, { kind: "fill", blanks: [" , "] }).correct).toBe(true);
  });

  it("public questions carry no answers", () => {
    for (const lesson of PY_LESSONS) {
      for (const q of lesson.questions) {
        const pub = JSON.stringify(publicQuestion(getPyQuestion(`${lesson.id}/${q.id}`)!));
        expect(pub).not.toContain(q.explain);
        if (q.kind === "predict") expect(pub.includes(JSON.stringify(q.answer).slice(1, -1)) && q.answer.length > 6 && !q.code.includes(q.answer.trim())).toBe(false);
        if (q.kind === "bug") expect(pub).not.toContain(JSON.stringify(q.fix).slice(1, -1));
      }
    }
  });
});

describe("state helpers (pure)", () => {
  it("weights recent answers more", () => {
    expect(masteryOf([])).toBeNull();
    const early = masteryOf([{ correct: true, revealed: false }, { correct: false, revealed: false }]);
    const late = masteryOf([{ correct: false, revealed: false }, { correct: true, revealed: false }]);
    expect(late!).toBeGreaterThan(early!);
    expect(masteryOf([{ correct: true, revealed: true }])).toBe(0);
  });

  it("computes streaks from active days", () => {
    const now = new Date("2026-10-09T10:00:00Z");
    expect(streakOf(new Set(["2026-10-07", "2026-10-08", "2026-10-09"]), now)).toEqual({ current: 3, best: 3, activeToday: true });
    expect(streakOf(new Set(["2026-10-07", "2026-10-08"]), now).current).toBe(2);
    expect(streakOf(new Set(["2026-10-01", "2026-10-02", "2026-10-03", "2026-10-08"]), now)).toEqual({ current: 1, best: 3, activeToday: false });
  });

  it("an empty learner has honest zeros, not decoration", () => {
    const s = computePyState({ attempts: [], exercises: [], reviews: [], settings: { guided: true, unlocked: [] }, assessments: [], activity: [] });
    expect(s.totals.lessonsDone).toBe(0);
    expect(s.totals.percent).toBe(0);
    expect(s.coding.accuracy).toBeNull();
    expect(s.totals.questionAccuracy).toBeNull();
    expect(s.streak.current).toBe(0);
    expect(s.xp).toBe(0);
    expect(s.lessons[0].status).toBe("available");
    expect(s.lessons[1].status).toBe("locked");
    expect(s.next).toBe(PY_LESSONS[0].id);
  });
});

describe("python learning flow (database)", () => {
  let db: DB;
  let close: () => Promise<void>;
  beforeAll(async () => {
    ({ db, close } = await freshDb());
    noExecution();
  });
  afterAll(async () => close());

  it("records answers, adapts mastery, suggests reteaching after two misses", async () => {
    const s = await makeStudent();
    const l = PY_LESSONS[0];
    const [q1, q2] = l.questions;
    const a = await answerQuestion(s.id, { questionId: `${l.id}/${q1.id}`, answer: wrong(q1), mode: "learn", hintUsed: false });
    expect(a.correct).toBe(false);
    expect(a.reteach).toBeNull();
    const b = await answerQuestion(s.id, { questionId: `${l.id}/${q2.id}`, answer: wrong(q2), mode: "learn", hintUsed: true });
    expect(b.reteach).toBe(l.reteach);
    const state = await pyState(db, s.id);
    expect(state.lessonInfo.get(l.id)!.mastery).toBe(0);
    expect(state.lessonInfo.get(l.id)!.status).toBe("in_progress");
    expect(state.mistakes.length).toBe(2);
  });

  it("revealing an answer counts as not correct", async () => {
    const s = await makeStudent();
    const l = PY_LESSONS[0];
    const r = await revealQuestion(s.id, `${l.id}/${l.questions[0].id}`, "practice");
    expect(r.correctAnswer).toBeTruthy();
    const state = await pyState(db, s.id);
    expect(state.totals.questionAccuracy).toBe(0);
  });

  it("refuses to answer exam questions outside an assessment", async () => {
    const s = await makeStudent();
    await expect(answerQuestion(s.id, { questionId: "py-intro/exam/e1", answer: { kind: "mcq", choice: 1 }, mode: "practice", hintUsed: false })).rejects.toThrow(/inside the assessment/);
  });

  it("locks later lessons in guided order; explicit unlock and free mode open them", async () => {
    const s = await makeStudent();
    const third = PY_LESSONS[2].id;
    expect((await pyState(db, s.id)).lessonInfo.get(third)!.status).toBe("locked");
    await unlockLesson(s.id, third);
    expect((await pyState(db, s.id)).lessonInfo.get(third)!.status).toBe("available");
    const s2 = await makeStudent();
    await setGuided(s2.id, false);
    expect((await pyState(db, s2.id)).lessons.every((l) => l.status === "available")).toBe(true);
  });

  it("hints and solution views are recorded; code saves resume", async () => {
    const s = await makeStudent();
    const key = coreExerciseKey(PY_LESSONS[0]);
    expect((await pyHint(s.id, key, 2)).hint).toBe(getPyExercise(key)!.ex.hints[1]);
    await pyHint(s.id, key, 1);
    const row = await db.query.pyExerciseProgress.findFirst({ where: eq(schema.pyExerciseProgress.studentId, s.id) });
    expect(row!.hintLevel).toBe(2);
    expect((await pySolution(s.id, key)).solution).toContain("print");
    await saveCode(s.id, `ex:${key}`, "print('draft')");
    expect((await loadCode(db, s.id, `ex:${key}`))!.code).toBe("print('draft')");
    await expect(saveCode(s.id, "ex:nope/none", "x")).rejects.toThrow();
  });

  it("practice adapts and never serves exam questions", async () => {
    const s = await makeStudent();
    const l = PY_LESSONS[0];
    for (let i = 0; i < 6; i++) {
      const next = await nextPracticeQuestion(db, s.id, { type: "module", id: "py-intro" });
      expect(next.question).not.toBeNull();
      expect(next.question!.id).not.toContain("/exam/");
      const ref = getPyQuestion(next.question!.id)!;
      await answerQuestion(s.id, { questionId: ref.id, answer: right(ref.q), mode: "practice", hintUsed: false });
    }
    const after = await nextPracticeQuestion(db, s.id, { type: "module", id: "py-intro" });
    expect(after.targetDifficulty).toBeGreaterThanOrEqual(2);
    const weak = await nextPracticeQuestion(db, s.id, { type: "weak" });
    expect(weak.question).toBeNull();
    expect(l).toBeTruthy();
  });

  it("module assessment: server-chosen unseen questions, graded on submit, can't resubmit", async () => {
    const s = await makeStudent();
    const { id } = await startAssessment(s.id, "module", "py-intro");
    const a = await getAssessment(db, s.id, id);
    expect(a.questions.some((q) => q.id.includes("/exam/"))).toBe(true);
    expect(JSON.stringify(a)).not.toContain("\"answer\"");
    const answers = Object.fromEntries(a.questions.map((q) => [q.id, right(getPyQuestion(q.id)!.q)]));
    const res = await submitAssessment(s.id, id, answers);
    expect(res.score).toBe(res.total);
    expect(res.passed).toBe(true);
    await expect(submitAssessment(s.id, id, answers)).rejects.toThrow(/already submitted/);
    const after = await getAssessment(db, s.id, id);
    expect(after.details!.items.every((i) => i.correct)).toBe(true);
    const other = await makeStudent();
    await expect(getAssessment(db, other.id, id)).rejects.toThrow();
  });

  it("wrong assessment answers schedule their lessons for revision; revision rounds reschedule", async () => {
    const s = await makeStudent();
    const l = PY_LESSONS[0];
    await db.insert(schema.pyReviews).values({ studentId: s.id, lessonId: l.id, box: 2, dueAt: new Date(Date.now() + 5 * 86_400_000) });
    const { id } = await startAssessment(s.id, "module", "py-intro");
    const a = await getAssessment(db, s.id, id);
    const answers = Object.fromEntries(a.questions.map((q) => [q.id, wrong(getPyQuestion(q.id)!.q)]));
    const res = await submitAssessment(s.id, id, answers);
    expect(res.passed).toBe(false);
    const state = await pyState(db, s.id);
    const lessonMissed = (await getAssessment(db, s.id, id)).details!.weakLessons;
    if (lessonMissed.includes(l.id)) expect(state.revisionDue.some((d) => d.lessonId === l.id)).toBe(true);
    const set = await revisionSet(db, s.id, l.id);
    expect(set.questions.length).toBeGreaterThan(0);
    for (const q of set.questions) await answerQuestion(s.id, { questionId: q.id, answer: right(getPyQuestion(q.id)!.q), mode: "revision", hintUsed: false });
    const done = await completeRevision(s.id, l.id, set.questions.map((q) => q.id));
    expect(done.good).toBe(true);
    expect(done.box).toBe(3);
  });

  it("timed assessments submitted late can't pass", async () => {
    const s = await makeStudent();
    const { id } = await startAssessment(s.id, "level", "1");
    await db.update(schema.pyAssessments).set({ startedAt: new Date(Date.now() - 2 * 3600_000) }).where(eq(schema.pyAssessments.id, id));
    const a = await getAssessment(db, s.id, id);
    const answers = Object.fromEntries(a.questions.map((q) => [q.id, right(getPyQuestion(q.id)!.q)]));
    const res = await submitAssessment(s.id, id, answers);
    expect(res.late).toBe(true);
    expect(res.passed).toBe(false);
  });

  it("active time is capped per heartbeat and counted", async () => {
    const s = await makeStudent();
    await addActiveTime(s.id, 30);
    await addActiveTime(s.id, 500);
    expect((await pyState(db, s.id)).timeSeconds).toBe(60);
  });
});

describe.runIf(canExecute)("judged python exercises and lesson completion (real sandbox)", () => {
  let db: DB;
  let close: () => Promise<void>;
  beforeAll(async () => {
    ({ db, close } = await freshDb());
    await useLocalSandbox();
  }, 120_000);
  afterAll(async () => close());

  it("a wrong program fails, a right one passes once, and the lesson completes when questions are mastered", async () => {
    const s = await makeStudent();
    const lesson = PY_LESSONS[0];
    const key = coreExerciseKey(lesson);
    const ex = getPyExercise(key)!.ex;
    const bad = await checkPython(s.id, key, "print('nope')");
    expect(bad.passed).toBe(false);
    expect(bad.reward).toBeNull();
    const good = await checkPython(s.id, key, ex.solution);
    expect(good.passed).toBe(true);
    expect(good.reward!.firstPass).toBe(true);
    expect(good.reward!.xp).toBe(25);
    expect(good.reward!.achievements.map((a) => a.code)).toContain("PY_HELLO");
    expect(good.reward!.lessonCompleted).toBeNull(); // questions not answered yet
    const again = await checkPython(s.id, key, ex.solution);
    expect(again.reward!.firstPass).toBe(false);

    let completed = null;
    for (const q of lesson.questions) {
      const r = await answerQuestion(s.id, { questionId: `${lesson.id}/${q.id}`, answer: right(q), mode: "learn", hintUsed: false });
      completed = r.lessonCompleted ?? completed;
    }
    expect(completed?.id).toBe(lesson.id);
    const state = await pyState(db, s.id);
    expect(state.lessonInfo.get(lesson.id)!.status).toBe("completed");
    expect(state.lessons[1].status).toBe("available");
    expect(state.totals.lessonsDone).toBe(1);
    expect(state.coding).toMatchObject({ checks: 3, passedChecks: 2 });
    const review = await db.query.pyReviews.findFirst({ where: eq(schema.pyReviews.studentId, s.id) });
    expect(review?.lessonId).toBe(lesson.id);

    // Python XP flows into the shared learner profile.
    const prog = await progression(db, s.id);
    expect(prog.xp).toBe(state.xp);
    expect(state.xp).toBe(25 + lesson.questions.length * 2 + 10);
  }, 120_000);

  it("a syntax error is reported without running tests; a pass after the solution earns 5 XP", async () => {
    const s = await makeStudent();
    const key = coreExerciseKey(PY_LESSONS[1]);
    const r = await checkPython(s.id, key, "print('x'");
    expect(r.compileStatus).toBe("error");
    expect(r.feedback[0].title).toMatch(/Syntax|bracket/i);
    await pySolution(s.id, key);
    const ok = await checkPython(s.id, key, getPyExercise(key)!.ex.solution);
    expect(ok.reward!.xp).toBe(5);
  }, 120_000);
});
