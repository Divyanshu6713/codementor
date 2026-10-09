/**
 * Parent side: linking via a short-lived code the student creates, and a plain-language summary.
 * Parents see learning time, progress, strengths, areas to practise and important mistake *types* —
 * not code, not tutor chat, not low-level telemetry.
 */
import crypto from "node:crypto";
import { and, desc, eq, gte } from "drizzle-orm";
import { getDb, schema } from "@/server/db/client";
import { AppError, NotFoundError } from "@/server/errors";
import { CONCEPTS, conceptById, misconceptionByCode, skillTitle } from "@/content";
import { isMastered } from "@/server/learning/mastery";
import { loadSkillStates } from "./student-model";
import { learningDaysThisWeek, nextDecision } from "./learner";

const hash = (code: string) => crypto.createHash("sha256").update(code.toUpperCase()).digest("hex");
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export async function createLinkCode(studentId: string) {
  const db = await getDb();
  const code = Array.from(crypto.randomBytes(8)).map((b) => ALPHABET[b % ALPHABET.length]).join("");
  const expiresAt = new Date(Date.now() + 24 * 3_600_000);
  await db.delete(schema.linkCodes).where(eq(schema.linkCodes.studentId, studentId));
  await db.insert(schema.linkCodes).values({ codeHash: hash(code), studentId, expiresAt });
  return { code, expiresAt: expiresAt.toISOString() };
}

export async function linkWithCode(parentId: string, code: string) {
  const db = await getDb();
  const row = await db.query.linkCodes.findFirst({ where: and(eq(schema.linkCodes.codeHash, hash(code.trim())), gte(schema.linkCodes.expiresAt, new Date())) });
  if (!row) throw new AppError("That code isn't valid or has expired. Ask the student to create a new one in Settings.", 400, "invalid_code");
  await db.transaction(async (tx) => {
    await tx.insert(schema.parentStudentLinks).values({ parentId, studentId: row.studentId }).onConflictDoNothing();
    await tx.delete(schema.linkCodes).where(eq(schema.linkCodes.codeHash, row.codeHash));
    await tx.insert(schema.auditLog).values({ actorId: parentId, action: "parent.linked", targetType: "user", targetId: row.studentId });
  });
}

export async function linkedParents(studentId: string) {
  const db = await getDb();
  return db.select({ id: schema.users.id, displayName: schema.users.displayName, linkedAt: schema.parentStudentLinks.createdAt })
    .from(schema.parentStudentLinks).innerJoin(schema.users, eq(schema.users.id, schema.parentStudentLinks.parentId))
    .where(eq(schema.parentStudentLinks.studentId, studentId));
}

export async function unlinkParent(studentId: string, parentId: string, actorId: string) {
  const db = await getDb();
  await db.delete(schema.parentStudentLinks).where(and(eq(schema.parentStudentLinks.parentId, parentId), eq(schema.parentStudentLinks.studentId, studentId)));
  await db.insert(schema.auditLog).values({ actorId, action: "parent.unlinked", targetType: "user", targetId: studentId, details: { parentId } });
}

export async function parentOverview(parentId: string) {
  const db = await getDb();
  const kids = await db.select({ id: schema.users.id, name: schema.users.displayName })
    .from(schema.parentStudentLinks).innerJoin(schema.users, eq(schema.users.id, schema.parentStudentLinks.studentId))
    .where(eq(schema.parentStudentLinks.parentId, parentId));
  return Promise.all(kids.map((k) => childSummary(k.id, k.name)));
}

export async function childSummary(studentId: string, name: string) {
  const db = await getDb();
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000);
  const [sessions, states, mcs, revisions, snapshots] = await Promise.all([
    db.select().from(schema.learningSessions).where(and(eq(schema.learningSessions.studentId, studentId), eq(schema.learningSessions.status, "completed"), gte(schema.learningSessions.startedAt, weekAgo))),
    loadSkillStates(db, studentId),
    db.select().from(schema.studentMisconceptions).where(eq(schema.studentMisconceptions.studentId, studentId)).orderBy(desc(schema.studentMisconceptions.lastDetectedAt)),
    db.select().from(schema.revisionItems).where(eq(schema.revisionItems.studentId, studentId)),
    db.select().from(schema.progressSnapshots).where(and(eq(schema.progressSnapshots.studentId, studentId), gte(schema.progressSnapshots.createdAt, weekAgo))).orderBy(schema.progressSnapshots.createdAt),
  ]);
  const minutes = sessions.reduce((m, s) => m + Math.max(1, Math.round(((s.endedAt ?? s.startedAt).getTime() - s.startedAt.getTime()) / 60_000)), 0);
  const assessed = [...states].filter(([, s]) => s.source === "assessed" && s.evidenceCount > 0);
  const hasActivity = assessed.length > 0;

  const conceptsLearned = CONCEPTS.filter((c) => c.skills.length && c.skills.every((s) => {
    const st = states.get(s.id);
    return st && st.source === "assessed" && isMastered(st);
  })).map((c) => c.title);
  const practising = CONCEPTS.filter((c) => c.skills.some((s) => {
    const st = states.get(s.id);
    return st && st.source === "assessed" && (st.status === "LEARNING" || st.status === "PRACTICING" || st.status === "REINFORCING");
  })).map((c) => c.title);
  const strengths = assessed.filter(([, s]) => s.mastery >= 0.8 && s.evidenceCount >= 2).sort((a, b) => b[1].mastery - a[1].mastery).slice(0, 4).map(([id]) => skillTitle.get(id) ?? id);
  const toPractise = assessed.filter(([, s]) => s.mastery < 0.6).sort((a, b) => a[1].mastery - b[1].mastery).slice(0, 4).map(([id]) => skillTitle.get(id) ?? id);
  const mistakes = mcs.filter((m) => m.status === "active").slice(0, 3).map((m) => ({ title: misconceptionByCode.get(m.code)?.title ?? m.code, times: m.occurrences }));

  const reviewedRecently = revisions.filter((r) => r.lastReviewedAt && r.lastReviewedAt >= weekAgo).length;
  const overdue = revisions.filter((r) => r.dueAt < new Date(now.getTime() - 2 * 86_400_000)).length;

  let weekly: { concept: string; from: number | null; to: number }[] = [];
  if (snapshots.length) {
    const first = (snapshots[0].conceptMastery ?? {}) as Record<string, number | null>;
    const last = (snapshots.at(-1)!.conceptMastery ?? {}) as Record<string, number | null>;
    weekly = Object.entries(last).filter(([k, v]) => v !== null && v !== (first[k] ?? null) || (snapshots.length === 1 && v !== null))
      .map(([k, v]) => ({ concept: conceptById.get(k)?.title ?? k, from: snapshots.length === 1 ? null : first[k] ?? null, to: v as number }));
  }

  // One honest sentence, built only from what's actually recorded.
  let headline: string | null = null;
  if (hasActivity) {
    const good = strengths[0];
    const weak = toPractise[0] ?? mistakes[0]?.title;
    headline = good && weak ? `${name} is doing well with ${good.toLowerCase()} but still needs practice with ${weak.toLowerCase()}.`
      : good ? `${name} is doing well with ${good.toLowerCase()}.`
      : weak ? `${name} is still building confidence with ${weak.toLowerCase()}.` : null;
  }
  const decision = hasActivity ? await nextDecision(db, studentId, now) : null;
  const support = !hasActivity ? null
    : mistakes[0] ? `Ask ${name} to explain "${mistakes[0].title.toLowerCase()}" in their own words — explaining is one of the best ways to fix it.`
    : overdue ? `${name} has reviews waiting. A short 10-minute revision session helps new ideas stick.`
    : decision?.title ? `Next on ${name}'s path: ${decision.title.replace(/^Learn: /, "")}.` : null;

  return {
    studentId, name, hasActivity,
    week: { minutes, sessions: sessions.length, learningDays: await learningDaysThisWeek(db, studentId, now) },
    headline, conceptsLearned, practising, strengths, toPractise, mistakes,
    revision: { reviewedThisWeek: reviewedRecently, overdue },
    weekly, support,
  };
}

export async function assertParentOf(parentId: string, studentId: string) {
  const db = await getDb();
  const link = await db.query.parentStudentLinks.findFirst({ where: and(eq(schema.parentStudentLinks.parentId, parentId), eq(schema.parentStudentLinks.studentId, studentId)) });
  if (!link) throw new NotFoundError("That student");
}
