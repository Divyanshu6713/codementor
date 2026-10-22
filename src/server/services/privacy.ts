/** Data export and account deletion (§47). */
import bcrypt from "bcryptjs";
import { eq, or } from "drizzle-orm";
import { getDb, schema } from "@/server/db/client";
import { AppError } from "@/server/errors";

export async function exportData(userId: string) {
  const db = await getDb();
  const [user, profile, skills, misconceptions, mistakes, sessions, outcomes, explanations, achievements, revision, tutor, code] = await Promise.all([
    db.query.users.findFirst({ where: eq(schema.users.id, userId), columns: { passwordHash: false } }),
    db.query.studentProfiles.findFirst({ where: eq(schema.studentProfiles.userId, userId) }),
    db.select().from(schema.studentSkills).where(eq(schema.studentSkills.studentId, userId)),
    db.select().from(schema.studentMisconceptions).where(eq(schema.studentMisconceptions.studentId, userId)),
    db.select().from(schema.mistakes).where(eq(schema.mistakes.studentId, userId)),
    db.select({ id: schema.learningSessions.id, kind: schema.learningSessions.kind, status: schema.learningSessions.status, startedAt: schema.learningSessions.startedAt, endedAt: schema.learningSessions.endedAt, report: schema.learningSessions.report })
      .from(schema.learningSessions).where(eq(schema.learningSessions.studentId, userId)),
    db.select().from(schema.itemOutcomes).where(eq(schema.itemOutcomes.studentId, userId)),
    db.select().from(schema.explanations).where(eq(schema.explanations.studentId, userId)),
    db.select().from(schema.studentAchievements).where(eq(schema.studentAchievements.studentId, userId)),
    db.select().from(schema.revisionItems).where(eq(schema.revisionItems.studentId, userId)),
    db.select().from(schema.tutorMessages).where(eq(schema.tutorMessages.studentId, userId)),
    db.select({ createdAt: schema.codeSubmissions.createdAt, kind: schema.codeSubmissions.kind, source: schema.codeSubmissions.source }).from(schema.codeSubmissions).where(eq(schema.codeSubmissions.studentId, userId)),
  ]);
  const [pyAttempts, pyExercises, pyReviews, pyAssessments, pySettings, pyActivity, pyCode] = await Promise.all([
    db.select().from(schema.pyAttempts).where(eq(schema.pyAttempts.studentId, userId)),
    db.select().from(schema.pyExerciseProgress).where(eq(schema.pyExerciseProgress.studentId, userId)),
    db.select().from(schema.pyReviews).where(eq(schema.pyReviews.studentId, userId)),
    db.select().from(schema.pyAssessments).where(eq(schema.pyAssessments.studentId, userId)),
    db.select().from(schema.pySettings).where(eq(schema.pySettings.studentId, userId)),
    db.select().from(schema.pyActivity).where(eq(schema.pyActivity.studentId, userId)),
    db.select().from(schema.pyCodeSaves).where(eq(schema.pyCodeSaves.studentId, userId)),
  ]);
  return {
    exportedAt: new Date().toISOString(), format: "codementor-export-v1",
    python: { attempts: pyAttempts, exercises: pyExercises, revision: pyReviews, assessments: pyAssessments, settings: pySettings, activity: pyActivity, savedCode: pyCode },
    user, profile, skills, misconceptions, mistakes, sessions, itemOutcomes: outcomes, explanations, achievements,
    revision, tutorMessages: tutor, codeSubmissions: code,
  };
}

/**
 * Permanently deletes the account and everything that cascades from it. Requires the password —
 * except for guest accounts, which have none (their session is the only credential).
 */
export async function deleteAccount(userId: string, password: string) {
  const db = await getDb();
  const user = await db.query.users.findFirst({ where: eq(schema.users.id, userId) });
  if (!user || (!user.isGuest && !(await bcrypt.compare(password, user.passwordHash)))) throw new AppError("That password isn't right.", 403, "forbidden");
  await db.transaction(async (tx) => {
    await tx.delete(schema.parentStudentLinks).where(or(eq(schema.parentStudentLinks.parentId, userId), eq(schema.parentStudentLinks.studentId, userId)));
    await tx.delete(schema.users).where(eq(schema.users.id, userId));
    // The audit entry keeps no personal data — just that a deletion happened.
    await tx.insert(schema.auditLog).values({ actorId: null, action: "account.deleted", targetType: "user", targetId: null, details: { role: user.role } });
  });
}

export async function updatePreferences(studentId: string, prefs: { tutorRetentionDays?: number; askConfidence?: boolean }) {
  const db = await getDb();
  await db.update(schema.studentProfiles).set(prefs).where(eq(schema.studentProfiles.userId, studentId));
  if (prefs.tutorRetentionDays === 0) await db.delete(schema.tutorMessages).where(eq(schema.tutorMessages.studentId, studentId));
}
