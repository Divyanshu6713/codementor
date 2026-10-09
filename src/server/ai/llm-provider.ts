/**
 * Builds an AIProvider on top of any structured-output model backend (Claude or OpenAI). Prompts
 * and message layout live here once; backends only know how to send one request and return a
 * schema-validated object. Every call is metered (budget + concurrency + spend ledger).
 */
import { z } from "zod";
import type { PaidAIProviderId } from "@/server/config";
import { config } from "@/server/config";
import { metered } from "./metering";
import { PROMPTS, evidenceBlock, studentBlock } from "./prompts";
import type { AIProvider, GeneratedCodeQuestion, Usage } from "./types";

export type Effort = "low" | "medium" | "high";

export interface StructuredBackend {
  id: PaidAIProviderId;
  /** Sends one request (with at most one retry on invalid output) and reports usage via metering.reportUsage. */
  structured<T extends z.ZodType>(opts: { schema: T; system: string; user: string; effort: Effort; maxTokens: number }): Promise<{ value: z.infer<T>; usage: Usage }>;
}

/** Wraps untrusted text in a tag, removing anything that could close the tag early. */
export function fence(tag: string, text: string): string {
  const cleaned = text.replace(new RegExp(`</?\\s*${tag}\\s*>`, "gi"), "");
  return `<${tag}>\n${cleaned}\n</${tag}>`;
}

const TextOut = z.object({ text: z.string() });

export function makeLLMProvider(backend: StructuredBackend): AIProvider {
  /** One metered structured call. */
  const call = <T extends z.ZodType>(purpose: string, opts: { schema: T; system: string; user: string; effort: Effort; maxTokens: number }) =>
    metered({
      provider: backend.id, purpose, inputChars: opts.system.length + opts.user.length, maxOutputTokens: opts.maxTokens,
      call: () => backend.structured(opts),
    });

  return {
    id: backend.id,
    conversational: true,

    async generateHint(req) {
      const { value, usage } = await call("hint", {
        schema: TextOut, effort: "low", maxTokens: 2000,
        system: PROMPTS.hint(req.level),
        user: `${studentBlock(req.student)}
<question>${req.questionPrompt}${req.questionCode ? `\n\`\`\`cpp\n${req.questionCode}\n\`\`\`` : ""}</question>
<correct_answer_for_your_eyes_only>${req.answerSummary}</correct_answer_for_your_eyes_only>
<student_answer>${req.studentAnswer ?? "(not answered yet)"}</student_answer>
${evidenceBlock(req.evidence)}
<curated_hint level="${req.level}">${req.curatedHint}</curated_hint>`,
      });
      return { source: "ai", value: { text: value.text.trim() }, usage };
    },

    async analyzeMistake(req) {
      const schema = z.object({ explanation: z.string(), guiding_question: z.string() });
      const { value, usage } = await call("mistake", {
        schema, effort: "low", maxTokens: 2000, system: PROMPTS.mistake,
        user: `${studentBlock(req.student)}
<question>${req.questionPrompt}</question>
<student_answer>${req.studentAnswer.slice(0, 4000)}</student_answer>
${evidenceBlock(req.evidence)}
<curated_explanation>${req.curatedExplanation}</curated_explanation>`,
      });
      return { source: "ai", value: { explanation: value.explanation.trim(), guidingQuestion: value.guiding_question.trim() || null }, usage };
    },

    async evaluateExplanation(req) {
      const schema = z.object({ ideas_found: z.array(z.string()), misconceptions: z.array(z.string()), feedback: z.string() });
      const { value, usage } = await call("explanationEval", {
        schema, effort: "low", maxTokens: 2000, system: PROMPTS.explanationEval,
        user: `${studentBlock(req.student)}
<prompt>${req.prompt}</prompt>
<key_ideas>${req.keyIdeas.map((k) => `${k.id}: ${k.label}`).join("\n")}</key_ideas>
<possible_misconceptions>${req.knownMisconceptions.map((m) => `${m.code}: ${m.title}`).join("\n") || "none"}</possible_misconceptions>
<student_explanation>${req.text.slice(0, 3000)}</student_explanation>`,
      });
      // Keep only ids we actually offered.
      const ideaIds = new Set(req.keyIdeas.map((k) => k.id));
      const mcIds = new Set(req.knownMisconceptions.map((m) => m.code));
      return {
        source: "ai", usage,
        value: { ideasFound: value.ideas_found.filter((i) => ideaIds.has(i)), misconceptions: value.misconceptions.filter((m) => mcIds.has(m)), feedback: value.feedback.trim() },
      };
    },

    async simplifyExplanation(req) {
      const { value, usage } = await call("simplify", {
        schema: TextOut, effort: "low", maxTokens: 3000, system: PROMPTS.simplify,
        user: `${studentBlock(req.student)}\n<lesson_title>${req.title}</lesson_title>\n<lesson_text>\n${req.body}\n</lesson_text>`,
      });
      return { source: "ai", value: { text: value.text.trim() }, usage };
    },

    async tutorReply(req) {
      const schema = z.object({ reply: z.string() });
      const turns = req.recentTurns.slice(-8).map((t) => `${t.role === "student" ? "Student" : "Tutor"}: ${t.text}`).join("\n");
      const { value, usage } = await call("tutor", {
        schema, effort: "medium", maxTokens: 3000, system: PROMPTS.tutor,
        user: `${studentBlock(req.student)}
${req.lessonContext ? `<lesson title="${req.lessonContext.title}">${req.lessonContext.stepTitle ?? ""}\n${(req.lessonContext.stepBody ?? "").slice(0, 2500)}</lesson>` : ""}
${req.questionContext ? `<current_question>${req.questionContext.prompt}</current_question>\n<correct_answer_for_your_eyes_only>${req.questionContext.answerSummary}</correct_answer_for_your_eyes_only>\n${evidenceBlock(req.questionContext.evidence)}` : evidenceBlock(null)}
<conversation>\n${turns}\nStudent: ${req.message}\n</conversation>`,
      });
      return { source: "ai", value: { reply: value.reply.trim() }, usage };
    },

    async generateQuestions(req) {
      const Test = z.object({ label: z.string(), input: z.string(), output: z.string(), visibility: z.enum(["sample", "visible", "hidden"]), category: z.enum(["normal", "boundary", "edge"]) });
      const Q = z.object({
        prompt: z.string(), starter_code: z.string(), reference_solution: z.string(), tests: z.array(Test),
        hints: z.array(z.string()), explanation: z.string(), difficulty: z.number().int(),
      });
      const { value, usage } = await call("questionGen", {
        schema: z.object({ questions: z.array(Q) }), effort: "medium", maxTokens: 12000, system: PROMPTS.questionGen,
        user: `Concept: ${req.conceptTitle}\nSkills: ${req.skills.map((s) => s.title).join(", ")}\nTarget difficulty (1 easy … 5 challenge): ${req.difficulty}\nWrite 3 problems.\nAvoid these existing prompts:\n${req.avoidPrompts.slice(0, 20).map((p) => `- ${p}`).join("\n") || "- (none)"}`,
      });
      const out: GeneratedCodeQuestion[] = value.questions.map((q) => ({
        prompt: q.prompt, starterCode: q.starter_code, referenceSolution: q.reference_solution, tests: q.tests,
        hints: q.hints as GeneratedCodeQuestion["hints"], explanation: q.explanation, difficulty: q.difficulty,
      }));
      return { source: "ai", value: out, usage };
    },

    async lessonTutor(req) {
      const max = config.ai.maxInputChars;
      const user = [
        `<lesson title="${req.lesson.title}">`,
        `Goals: ${req.lesson.goals.join("; ")}`,
        req.lesson.conceptText.slice(0, 4000),
        `Key points: ${req.lesson.summary.join("; ")}`,
        `</lesson>`,
        `<exercise>${req.lesson.exercisePrompt.slice(0, 1500)}</exercise>`,
        `<reference_solution_for_your_eyes_only>\n${req.answerSummary}\n</reference_solution_for_your_eyes_only>`,
        req.lesson.curatedHint ? `<curated_hint level="${req.hintLevel}">${req.lesson.curatedHint}</curated_hint>` : "",
        req.code ? fence("student_code", req.code.slice(0, max)) : "<student_code>(none)</student_code>",
        req.question ? fence("student_question", req.question.slice(0, 1500)) : "",
        evidenceBlock(req.evidence),
      ].filter(Boolean).join("\n");
      const { value, usage } = await call(`lessonTutor:${req.mode}`, {
        schema: TextOut, effort: "low", maxTokens: config.ai.maxOutputTokens,
        system: PROMPTS.lessonTutor(req.mode, req.hintLevel), user,
      });
      return { source: "ai", value: { text: value.text.trim() }, usage };
    },
  };
}
