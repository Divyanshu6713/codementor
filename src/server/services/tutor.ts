/**
 * Tutor chat. Context = structured student profile + the current lesson step/question + this
 * conversation's last few turns. Messages are stored only if the student's retention setting allows.
 */
import { and, asc, eq, lt } from "drizzle-orm";
import { getDb, schema } from "@/server/db/client";
import { aiTutorReply } from "@/server/ai";
import type { LessonStepDef } from "@/content/types";
import { misconceptionByCode } from "@/content";
import { answerFacts, loadQuestionVersion } from "./questions";
import { studentContext } from "./learner";
import type { SessionPlan, SessionState } from "./session-types";
import { NotFoundError } from "@/server/errors";

export async function tutorChat(studentId: string, sessionId: string, message: string, recentTurns: { role: "student" | "tutor"; text: string }[]) {
  const db = await getDb();
  const s = await db.query.learningSessions.findFirst({ where: eq(schema.learningSessions.id, sessionId) });
  if (!s || s.studentId !== studentId) throw new NotFoundError("That session");
  const st = s.state as SessionState;
  const entry = st.queue[st.pos];
  let lessonContext = null;
  if (entry?.t === "step" && s.lessonVersionId) {
    const row = await db.query.lessonSteps.findFirst({ where: and(eq(schema.lessonSteps.lessonVersionId, s.lessonVersionId), eq(schema.lessonSteps.key, entry.key)) });
    const def = row?.content as LessonStepDef | undefined;
    lessonContext = { title: (s.plan as SessionPlan).title, stepTitle: def && "title" in def ? def.title : null, stepBody: def && "body" in def ? def.body : null };
  }
  let questionContext = null;
  let leak: { referenceSolution?: string | null; answerTexts?: string[] } = {};
  if (st.item && !st.item.resolved) {
    const q = await loadQuestionVersion(db, st.item.versionId);
    const facts = answerFacts(q);
    const last = st.item.last;
    questionContext = {
      prompt: q.content.prompt, answerSummary: facts.summary,
      evidence: last ? {
        questionType: q.type, verdict: last.judge?.verdict ?? (last.correct ? "accepted" : "wrong_answer"),
        testsPassed: last.judge?.testsPassed ?? null, testsTotal: last.judge?.testsTotal ?? null,
        compileOutput: last.judge && last.judge.compileStatus !== "success" ? last.judge.compileOutput : null,
        whatHappened: last.whatHappened, misconceptions: st.item.misconceptions.map((c) => ({ code: c, title: misconceptionByCode.get(c)?.title ?? c, explanation: misconceptionByCode.get(c)?.studentExplanation ?? "" })),
      } : null,
    };
    leak = { referenceSolution: q.referenceSolution, answerTexts: facts.answerTexts };
  }
  const res = await aiTutorReply(studentId, {
    message: message.slice(0, 1500), recentTurns: recentTurns.slice(-8).map((t) => ({ role: t.role, text: t.text.slice(0, 1500) })),
    lessonContext, questionContext, student: await studentContext(db, studentId, s.conceptId),
  }, leak);

  const profile = await db.query.studentProfiles.findFirst({ where: eq(schema.studentProfiles.userId, studentId) });
  if (profile && profile.tutorRetentionDays > 0) {
    await db.insert(schema.tutorMessages).values([
      { studentId, sessionId, role: "student", text: message.slice(0, 1500) },
      { studentId, sessionId, role: "tutor", text: res.value.reply },
    ]);
    await db.delete(schema.tutorMessages).where(and(eq(schema.tutorMessages.studentId, studentId), lt(schema.tutorMessages.createdAt, new Date(Date.now() - profile.tutorRetentionDays * 86_400_000))));
  }
  await db.insert(schema.sessionEvents).values({ studentId, sessionId, type: "tutor_message", payload: { stored: Boolean(profile && profile.tutorRetentionDays > 0) } });
  return { reply: res.value.reply, source: res.source };
}

export async function storedTutorMessages(studentId: string, sessionId: string) {
  const db = await getDb();
  return db.select({ role: schema.tutorMessages.role, text: schema.tutorMessages.text }).from(schema.tutorMessages)
    .where(and(eq(schema.tutorMessages.studentId, studentId), eq(schema.tutorMessages.sessionId, sessionId))).orderBy(asc(schema.tutorMessages.createdAt));
}
