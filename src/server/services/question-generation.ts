/**
 * AI question generation pipeline (§26):
 *   AI draft → schema checks → sandbox policy → reference solution compiled and run on every test
 *   → rejected (logged) or stored as `pending_review` for a human to approve.
 * Nothing generated is ever shown to a learner before it passes this pipeline and review.
 */
import crypto from "node:crypto";
import { z } from "zod";
import { getDb, schema } from "@/server/db/client";
import { conceptById } from "@/content";
import { aiGenerateQuestions } from "@/server/ai";
import { judgeSubmission } from "@/server/execution/judge";
import { checkSource } from "../../../worker/sandbox/policy";
import { contentHash } from "@/server/content/sync";
import { logger } from "@/server/logger";
import { AppError } from "@/server/errors";
import type { GeneratedCodeQuestion } from "@/server/ai/types";

const GeneratedSchema = z.object({
  prompt: z.string().min(20).max(1200),
  starterCode: z.string().min(20).max(4000),
  referenceSolution: z.string().min(20).max(8000),
  tests: z.array(z.object({
    label: z.string().min(1).max(80), input: z.string().max(2000), output: z.string().max(4000),
    visibility: z.enum(["sample", "visible", "hidden"]), category: z.enum(["normal", "boundary", "edge"]),
  })).min(4).max(12)
    .refine((t) => t.some((x) => x.visibility === "sample"), "needs a sample test")
    .refine((t) => t.some((x) => x.visibility === "hidden"), "needs a hidden test"),
  hints: z.array(z.string().min(3).max(600)).length(5),
  explanation: z.string().min(10).max(1200),
  difficulty: z.number().int().min(1).max(5),
});

export interface ValidationReport {
  accepted: { questionId: string; prompt: string }[];
  rejected: { prompt: string; reason: string }[];
}

/** Validates one generated question; returns null when it passes. */
export async function validateGenerated(q: GeneratedCodeQuestion): Promise<string | null> {
  const parsed = GeneratedSchema.safeParse(q);
  if (!parsed.success) return `schema: ${parsed.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`;
  for (const src of [q.referenceSolution, q.starterCode]) {
    const p = checkSource(src);
    if (!p.ok) return `policy: ${p.message}`;
  }
  const outcome = await judgeSubmission(q.referenceSolution, q.tests.map((t, i) => ({ id: `g${i}`, label: t.label, input: t.input, expected: t.output, visibility: t.visibility, category: t.category })), "tokens");
  if (outcome.compileStatus !== "success") return `reference solution did not compile: ${outcome.compileOutput.slice(0, 200)}`;
  if (outcome.verdict !== "accepted") return `reference solution failed ${outcome.testsTotal - outcome.testsPassed} of ${outcome.testsTotal} of its own tests (${outcome.verdict})`;
  const starter = await judgeSubmission(q.starterCode, [{ id: "s", label: "starter", input: q.tests[0].input, expected: q.tests[0].output, visibility: "sample", category: "normal" }], "tokens");
  if (starter.compileStatus !== "success") return "starter code does not compile";
  if (starter.verdict === "accepted") return "starter code already solves the problem";
  return null;
}

export async function generateAndValidate(actorId: string, conceptId: string, difficulty: number): Promise<ValidationReport> {
  const concept = conceptById.get(conceptId);
  if (!concept || !concept.skills.length) throw new AppError("Pick a concept that has skills.");
  const db = await getDb();
  const existing = await db.select({ id: schema.questions.id }).from(schema.questions);
  const res = await aiGenerateQuestions({
    conceptTitle: concept.title, skills: concept.skills.map((s) => ({ id: s.id, title: s.title })), difficulty,
    avoidPrompts: existing.map((e) => e.id),
  });
  const report: ValidationReport = { accepted: [], rejected: [] };
  for (const q of res.value) {
    const reason = await validateGenerated(q);
    if (reason) {
      report.rejected.push({ prompt: q.prompt?.slice(0, 120) ?? "", reason });
      logger.warn("question_gen.rejected", { conceptId, reason });
      await db.insert(schema.contentFlags).values({ questionId: null, kind: "validation_failed", details: { source: "ai_generation", conceptId, reason, prompt: q.prompt?.slice(0, 300) } });
      continue;
    }
    const id = `ai-${conceptId}-${crypto.randomBytes(4).toString("hex")}`;
    await db.transaction(async (tx) => {
      await tx.insert(schema.questions).values({
        id, type: "write_code", status: "pending_review", origin: "ai_generated", conceptId, language: "cpp",
        difficulty: q.difficulty, purposes: ["practice", "revision"], currentVersion: 1,
      });
      const [qv] = await tx.insert(schema.questionVersions).values({
        questionId: id, version: 1, contentHash: contentHash(q),
        content: { type: "write_code", prompt: q.prompt, starterCode: q.starterCode, compare: "tokens", samples: q.tests.filter((t) => t.visibility !== "hidden").map((t) => ({ label: t.label, input: t.input, output: t.output })) },
        answerKey: { type: "write_code", compare: "tokens", detectors: [], solutionWalkthrough: q.explanation },
        hints: q.hints, explanation: q.explanation, referenceSolution: q.referenceSolution,
        validationStatus: "validated", validationLog: { at: new Date().toISOString(), source: "ai_generation_pipeline" },
      }).returning({ id: schema.questionVersions.id });
      await tx.insert(schema.questionTestCases).values(q.tests.map((t, order) => ({ questionVersionId: qv.id, order, label: t.label, input: t.input, expectedOutput: t.output, visibility: t.visibility, category: t.category })));
      await tx.insert(schema.questionSkills).values(concept.skills.slice(0, 2).map((s) => ({ questionId: id, skillId: s.id, weight: 1 })));
      await tx.insert(schema.auditLog).values({ actorId, action: "question.generated", targetType: "question", targetId: id });
    });
    report.accepted.push({ questionId: id, prompt: q.prompt.slice(0, 120) });
  }
  return report;
}
