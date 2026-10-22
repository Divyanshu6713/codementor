/**
 * The step-by-step lesson path inside the app: progress is stored server-side per student (guest or
 * named account), so XP and completion can't be faked from the browser. A lesson is passed only
 * when the deterministic judge accepts the exercise.
 */
import { and, eq, sql } from "drizzle-orm";
import { COURSE_LESSONS, COURSE_MODULES, getCourseLesson } from "@/content/course";
import { getDb, schema, type Tx } from "@/server/db/client";
import { checkAchievements, achievementCodes } from "./achievements";
import { XP_RULES, pathXpEvents } from "./progression";

export type LessonState = { hintLevel: number; solutionViewed: boolean; passed: boolean; xp: number };

export async function pathProgress(db: Tx, studentId: string) {
  const rows = await db.select().from(schema.courseProgress).where(eq(schema.courseProgress.studentId, studentId));
  const byId = new Map(rows.map((r) => [r.lessonId, r]));
  const xpByLesson = new Map(pathXpEvents(rows).filter((e) => e.lessonId).map((e) => [e.lessonId!, e.xp]));
  const lessonState = (id: string): LessonState => {
    const r = byId.get(id);
    return { hintLevel: r?.hintLevel ?? 0, solutionViewed: Boolean(r?.solutionViewedAt), passed: Boolean(r?.passedAt), xp: xpByLesson.get(id) ?? 0 };
  };
  const passed = (id: string) => Boolean(byId.get(id)?.passedAt);
  const modules = COURSE_MODULES.map((m) => ({
    id: m.id, number: m.number, title: m.title, summary: m.summary, planned: m.planned ?? [],
    lessons: m.lessons.map((id) => ({ id, title: getCourseLesson(id)!.title, minutes: getCourseLesson(id)!.minutes, ...lessonState(id) })),
    done: m.lessons.filter(passed).length,
    complete: m.lessons.length > 0 && m.lessons.every(passed),
  }));
  const order = COURSE_LESSONS.map((l) => l.id);
  const next = order.find((id) => !passed(id)) ?? null;
  return { modules, lessonState, next, passedCount: order.filter(passed).length, total: order.length };
}

async function upsert(db: Tx, studentId: string, lessonId: string, set: Partial<typeof schema.courseProgress.$inferInsert>) {
  await db.insert(schema.courseProgress).values({ studentId, lessonId, ...set })
    .onConflictDoUpdate({ target: [schema.courseProgress.studentId, schema.courseProgress.lessonId], set: { ...set, updatedAt: new Date() } });
}

/** Remembers the highest hint level opened (it lowers the XP a later pass earns). */
export async function noteHint(studentId: string, lessonId: string, level: number) {
  const db = await getDb();
  await db.insert(schema.courseProgress).values({ studentId, lessonId, hintLevel: level })
    .onConflictDoUpdate({
      target: [schema.courseProgress.studentId, schema.courseProgress.lessonId],
      set: { hintLevel: sql`greatest(${schema.courseProgress.hintLevel}, ${level})`, updatedAt: new Date() },
    });
}

export async function noteSolutionViewed(studentId: string, lessonId: string) {
  const db = await getDb();
  const row = await db.query.courseProgress.findFirst({ where: and(eq(schema.courseProgress.studentId, studentId), eq(schema.courseProgress.lessonId, lessonId)) });
  if (!row?.solutionViewedAt) await upsert(db, studentId, lessonId, { solutionViewedAt: new Date() });
}

export interface PassReward {
  firstPass: boolean;
  xp: number;
  moduleCompleted: { title: string; xp: number } | null;
  achievements: { code: string; title: string }[];
}

/** Records a judged pass (first pass only earns XP) and reports what it unlocked. */
export async function recordPass(studentId: string, lessonId: string): Promise<PassReward> {
  const db = await getDb();
  return db.transaction(async (tx) => {
    const row = await tx.query.courseProgress.findFirst({ where: and(eq(schema.courseProgress.studentId, studentId), eq(schema.courseProgress.lessonId, lessonId)) });
    if (row?.passedAt) return { firstPass: false, xp: 0, moduleCompleted: null, achievements: [] };
    const hintLevel = row?.hintLevel ?? 0;
    const afterSolution = Boolean(row?.solutionViewedAt);
    await upsert(tx, studentId, lessonId, { passedAt: new Date(), passedHintLevel: hintLevel, passedAfterSolution: afterSolution });
    const progress = await pathProgress(tx, studentId);
    const mod = progress.modules.find((m) => m.lessons.some((l) => l.id === lessonId));
    const earned = await checkAchievements(tx, studentId);
    const titles = await achievementCodes(tx, earned);
    return {
      firstPass: true,
      xp: XP_RULES.lessonPassed(hintLevel, afterSolution),
      moduleCompleted: mod?.complete ? { title: mod.title, xp: XP_RULES.moduleCompleted } : null,
      achievements: titles.map((a) => ({ code: a.code, title: a.title })),
    };
  });
}
