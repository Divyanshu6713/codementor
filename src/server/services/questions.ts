import { and, desc, eq, inArray } from "drizzle-orm";
import { schema, type Tx } from "@/server/db/client";
import type { QuestionType } from "@/server/db/schema";
import type { AnswerKey, QuestionContent } from "@/types/questions";
import type { JudgeTest } from "@/server/execution/judge";
import { judgeSubmission } from "@/server/execution/judge";
import { executionStatus } from "@/server/execution/providers";
import type { PoolQuestion } from "@/server/learning/picker";
import { DIFFICULTY_LABELS } from "@/server/learning/adaptivity";
import { conceptById } from "@/content";
import { logger } from "@/server/logger";
import { NotFoundError } from "@/server/errors";

export interface LoadedQuestion {
  id: string;
  type: QuestionType;
  conceptId: string;
  difficulty: number;
  purposes: string[];
  status: string;
  versionId: string;
  version: number;
  content: QuestionContent;
  answerKey: AnswerKey;
  hints: string[];
  explanation: string;
  referenceSolution: string | null;
  validationStatus: string;
  skills: { id: string; weight: number }[];
  probes: string[];
  tests: JudgeTest[];
}

async function hydrate(db: Tx, q: typeof schema.questions.$inferSelect, v: typeof schema.questionVersions.$inferSelect): Promise<LoadedQuestion> {
  const [skills, probes, tests] = await Promise.all([
    db.select().from(schema.questionSkills).where(eq(schema.questionSkills.questionId, q.id)),
    db.select().from(schema.questionMisconceptions).where(eq(schema.questionMisconceptions.questionId, q.id)),
    q.type === "write_code"
      ? db.select().from(schema.questionTestCases).where(eq(schema.questionTestCases.questionVersionId, v.id)).orderBy(schema.questionTestCases.order)
      : Promise.resolve([]),
  ]);
  return {
    id: q.id, type: q.type, conceptId: q.conceptId, difficulty: q.difficulty, purposes: q.purposes, status: q.status,
    versionId: v.id, version: v.version, content: v.content as QuestionContent, answerKey: v.answerKey as AnswerKey,
    hints: v.hints as string[], explanation: v.explanation, referenceSolution: v.referenceSolution, validationStatus: v.validationStatus,
    skills: skills.map((s) => ({ id: s.skillId, weight: s.weight })), probes: probes.map((p) => p.misconceptionCode),
    tests: tests.map((t) => ({ id: t.id, label: t.label, input: t.input, expected: t.expectedOutput, visibility: t.visibility, category: t.category })),
  };
}

/** The current version of a question. */
export async function loadQuestion(db: Tx, id: string): Promise<LoadedQuestion> {
  const q = await db.query.questions.findFirst({ where: eq(schema.questions.id, id) });
  if (!q) throw new NotFoundError("That question");
  const v = await db.query.questionVersions.findFirst({
    where: and(eq(schema.questionVersions.questionId, id), eq(schema.questionVersions.version, q.currentVersion)),
  });
  if (!v) throw new NotFoundError("That question version");
  return hydrate(db, q, v);
}

/** A specific version — used for grading so a mid-session content update can't change the key. */
export async function loadQuestionVersion(db: Tx, versionId: string): Promise<LoadedQuestion> {
  const v = await db.query.questionVersions.findFirst({ where: eq(schema.questionVersions.id, versionId) });
  if (!v) throw new NotFoundError("That question version");
  const q = await db.query.questions.findFirst({ where: eq(schema.questions.id, v.questionId) });
  if (!q) throw new NotFoundError("That question");
  return hydrate(db, q, v);
}

/** Active questions whose current version may be shown (failed validation is excluded). */
export async function getPool(db: Tx): Promise<PoolQuestion[]> {
  const rows = await db.select({
    id: schema.questions.id, type: schema.questions.type, conceptId: schema.questions.conceptId,
    difficulty: schema.questions.difficulty, purposes: schema.questions.purposes, validation: schema.questionVersions.validationStatus,
  })
    .from(schema.questions)
    .innerJoin(schema.questionVersions, and(eq(schema.questionVersions.questionId, schema.questions.id), eq(schema.questionVersions.version, schema.questions.currentVersion)))
    .where(eq(schema.questions.status, "active"));
  const usable = rows.filter((r) => r.validation !== "failed");
  const ids = usable.map((r) => r.id);
  if (!ids.length) return [];
  const [skills, probes] = await Promise.all([
    db.select().from(schema.questionSkills).where(inArray(schema.questionSkills.questionId, ids)),
    db.select().from(schema.questionMisconceptions).where(inArray(schema.questionMisconceptions.questionId, ids)),
  ]);
  return usable.map((r) => ({
    id: r.id, type: r.type, conceptId: r.conceptId, difficulty: r.difficulty, purposes: r.purposes,
    skills: skills.filter((s) => s.questionId === r.id).map((s) => ({ id: s.skillId, weight: s.weight })),
    probes: probes.filter((p) => p.misconceptionCode && p.questionId === r.id).map((p) => p.misconceptionCode),
  }));
}

/**
 * The validation gate (§26): a judged question is shown only after its reference solution compiles
 * and passes every one of its own tests on the real judge. Runs once per question version.
 */
export async function ensureValidated(db: Tx, q: LoadedQuestion): Promise<"ok" | "failed" | "unavailable"> {
  if (q.type !== "write_code" || q.validationStatus === "validated" || q.validationStatus === "not_required") return "ok";
  if (q.validationStatus === "failed") return "failed";
  const status = await executionStatus();
  if (!status.available || !q.referenceSolution) return "unavailable";
  const key = q.answerKey;
  if (key.type !== "write_code") return "failed";
  const outcome = await judgeSubmission(q.referenceSolution, q.tests, key.compare);
  const ok = outcome.verdict === "accepted";
  const log = { at: new Date().toISOString(), executor: outcome.executor, verdict: outcome.verdict, passed: outcome.testsPassed, total: outcome.testsTotal, failing: outcome.tests.filter((t) => !t.passed).map((t) => t.label), compile: outcome.compileOutput.slice(0, 500) };
  await db.update(schema.questionVersions).set({ validationStatus: ok ? "validated" : "failed", validationLog: log }).where(eq(schema.questionVersions.id, q.versionId));
  if (!ok) {
    logger.error("question.validation_failed", { questionId: q.id, version: q.version, verdict: outcome.verdict });
    await db.insert(schema.contentFlags).values({ questionId: q.id, kind: "validation_failed", details: log });
  }
  q.validationStatus = ok ? "validated" : "failed";
  return ok ? "ok" : "failed";
}

/** Latest version ids for many questions (for "last seen" lookups). */
export async function currentVersionIds(db: Tx, ids: string[]) {
  if (!ids.length) return [];
  return db.select({ questionId: schema.questionVersions.questionId, id: schema.questionVersions.id })
    .from(schema.questionVersions).where(inArray(schema.questionVersions.questionId, ids)).orderBy(desc(schema.questionVersions.version));
}

/** Text a hint/tutor model may know but must never reveal; also used by the leak guardrail. */
export function answerFacts(q: LoadedQuestion): { summary: string; answerTexts: string[] } {
  const key = q.answerKey;
  const content = q.content;
  switch (key.type) {
    case "mcq": case "predict_output": case "identify_error": {
      const text = content.type === key.type ? content.options.find((o) => o.id === key.correct)?.text ?? "" : "";
      return { summary: `Correct option: ${text}`, answerTexts: text.length >= 4 ? [text] : [] };
    }
    case "complete_code":
      return { summary: `Accepted answers: ${key.accepted.join(" | ")}`, answerTexts: key.accepted };
    case "trace":
      return { summary: `Field answers: ${key.fields.map((f) => f.answer).join(", ")}`, answerTexts: [] };
    case "reorder":
      return { summary: "A specific line order (not shown).", answerTexts: [] };
    case "write_code":
      return { summary: `A reference solution exists. Approach: ${key.solutionWalkthrough}`, answerTexts: [] };
    case "explain":
      return { summary: `Key ideas: ${key.rubric.keyIdeas.map((k) => k.label).join("; ")}`, answerTexts: [] };
  }
}

export function presentQuestion(q: LoadedQuestion) {
  return {
    id: q.id,
    type: q.type,
    content: q.content,
    difficulty: q.difficulty,
    difficultyLabel: DIFFICULTY_LABELS[q.difficulty] ?? "",
    conceptTitle: conceptById.get(q.conceptId)?.title ?? q.conceptId,
  };
}
export type QuestionView = ReturnType<typeof presentQuestion>;
