import { z } from "zod";
import { getDb } from "@/server/db/client";
import { NotFoundError } from "@/server/errors";
import { rateLimit, readJson, withStudent } from "@/server/http";
import { startAssessment, submitAssessment } from "@/server/python/assessments";
import { checkPython, pyHint, pySolution, runPython, saveCode, startTimer, tracePython } from "@/server/python/exercises";
import { AnswerSchema } from "@/server/python/grading";
import { addActiveTime, setGuided, unlockLesson } from "@/server/python/learner";
import { answerQuestion, completeRevision, nextPracticeQuestion, revealQuestion, revisionSet } from "@/server/python/questions";

type Ctx = { params: Promise<{ action: string }> };

const Key = z.string().regex(/^[A-Za-z0-9:/_-]{1,140}$/);
const QuestionId = z.string().regex(/^[a-z0-9-]+(\/exam)?\/[A-Za-z0-9_-]{1,20}$/);
const LessonId = z.string().regex(/^py-[a-z0-9-]{2,60}$/);
const Source = z.string().min(1).max(64 * 1024);
const Files = z.array(z.object({ name: z.string().max(60), content: z.string().max(32 * 1024) })).max(6).default([]);
const Mode = z.enum(["learn", "practice", "revision"]);

const schemas = {
  run: z.object({ source: Source, input: z.string().max(16 * 1024).default(""), files: Files }),
  trace: z.object({ source: Source, input: z.string().max(16 * 1024).default(""), files: Files }),
  check: z.object({ key: Key, source: Source, showFailingHidden: z.boolean().default(false), mode: z.enum(["learn", "challenge", "project", "interview"]).optional() }),
  hint: z.object({ key: Key, level: z.number().int().min(1).max(4) }),
  solution: z.object({ key: Key }),
  timer: z.object({ key: Key }),
  save: z.object({ key: z.string().max(150), code: z.string().max(64 * 1024) }),
  answer: z.object({ questionId: QuestionId, answer: AnswerSchema, mode: Mode, hintUsed: z.boolean().default(false) }),
  reveal: z.object({ questionId: QuestionId, mode: Mode }),
  practice: z.object({ scope: z.union([
    z.object({ type: z.enum(["lesson", "module"]), id: z.string().max(80) }),
    z.object({ type: z.enum(["mixed", "weak", "level"]), id: z.string().max(10).optional() }),
  ]) }),
  "revision-set": z.object({ lessonId: LessonId }),
  "revision-done": z.object({ lessonId: LessonId, questionIds: z.array(QuestionId).min(1).max(5) }),
  "assessment-start": z.object({ kind: z.enum(["module", "level", "final", "mixed", "interview"]), scopeId: z.string().max(200) }),
  "assessment-submit": z.object({ id: z.string().uuid(), answers: z.record(QuestionId, AnswerSchema) }),
  settings: z.object({ guided: z.boolean() }),
  unlock: z.object({ lessonId: LessonId }),
  heartbeat: z.object({ seconds: z.number().min(0).max(60) }),
};

/** Python Mastery actions. Every one is per-student and validated; code runs only in the sandbox worker. */
export const POST = withStudent(async (req, user, ctx: Ctx) => {
  const { action } = await ctx.params;
  switch (action) {
    case "run": {
      rateLimit(`run:${user.id}`, 15, 15);
      const b = await readJson(req, schemas.run, 300 * 1024);
      return Response.json(await runPython(b.source, b.input, b.files));
    }
    case "trace": {
      rateLimit(`run:${user.id}`, 15, 15);
      const b = await readJson(req, schemas.trace, 300 * 1024);
      return Response.json(await tracePython(b.source, b.input, b.files));
    }
    case "check": {
      rateLimit(`run:${user.id}`, 15, 15);
      const b = await readJson(req, schemas.check, 100 * 1024);
      return Response.json(await checkPython(user.id, b.key, b.source, { showFailingHidden: b.showFailingHidden, mode: b.mode }));
    }
    case "hint": {
      const b = await readJson(req, schemas.hint);
      return Response.json(await pyHint(user.id, b.key, b.level));
    }
    case "solution": {
      const b = await readJson(req, schemas.solution);
      return Response.json(await pySolution(user.id, b.key));
    }
    case "timer": {
      const b = await readJson(req, schemas.timer);
      return Response.json(await startTimer(user.id, b.key));
    }
    case "save": {
      rateLimit(`pysave:${user.id}`, 30, 30);
      const b = await readJson(req, schemas.save, 100 * 1024);
      return Response.json(await saveCode(user.id, b.key, b.code));
    }
    case "answer": {
      rateLimit(`pyanswer:${user.id}`, 40, 40);
      const b = await readJson(req, schemas.answer);
      return Response.json(await answerQuestion(user.id, b));
    }
    case "reveal": {
      const b = await readJson(req, schemas.reveal);
      return Response.json(await revealQuestion(user.id, b.questionId, b.mode));
    }
    case "practice": {
      const b = await readJson(req, schemas.practice);
      return Response.json(await nextPracticeQuestion(await getDb(), user.id, b.scope));
    }
    case "revision-set": {
      const b = await readJson(req, schemas["revision-set"]);
      return Response.json(await revisionSet(await getDb(), user.id, b.lessonId));
    }
    case "revision-done": {
      const b = await readJson(req, schemas["revision-done"]);
      return Response.json(await completeRevision(user.id, b.lessonId, b.questionIds));
    }
    case "assessment-start": {
      rateLimit(`pyexam:${user.id}`, 10, 5);
      const b = await readJson(req, schemas["assessment-start"]);
      return Response.json(await startAssessment(user.id, b.kind, b.scopeId));
    }
    case "assessment-submit": {
      const b = await readJson(req, schemas["assessment-submit"], 300 * 1024);
      return Response.json(await submitAssessment(user.id, b.id, b.answers));
    }
    case "settings": {
      const b = await readJson(req, schemas.settings);
      await setGuided(user.id, b.guided);
      return Response.json({ ok: true });
    }
    case "unlock": {
      const b = await readJson(req, schemas.unlock);
      await unlockLesson(user.id, b.lessonId);
      return Response.json({ ok: true });
    }
    case "heartbeat": {
      rateLimit(`pybeat:${user.id}`, 3, 2.5);
      const b = await readJson(req, schemas.heartbeat);
      await addActiveTime(user.id, b.seconds);
      return Response.json({ ok: true });
    }
    default:
      throw new NotFoundError("That action");
  }
});
