/**
 * The no-AI provider: uses only reviewed, curated content. Hints, mistake explanations and
 * re-teaching all still work; free-form chat and question generation honestly report that the AI
 * tutor isn't configured.
 */
import { AppError } from "@/server/errors";
import type { AIProvider } from "./types";

export class AINotConfiguredError extends AppError {
  constructor() {
    super("The AI tutor isn't configured on this server. Curated hints and explanations still work.", 503, "ai_not_configured");
  }
}

export const curatedProvider: AIProvider = {
  id: "curated",
  conversational: false,
  async generateHint(req) {
    return { source: "curated", value: { text: req.curatedHint } };
  },
  async analyzeMistake(req) {
    const mc = req.evidence.misconceptions[0];
    return {
      source: "curated",
      value: { explanation: mc ? `${req.evidence.whatHappened ?? ""} ${mc.explanation}`.trim() : req.curatedExplanation, guidingQuestion: null },
    };
  },
  async evaluateExplanation() {
    return null; // rubric evaluation is used instead
  },
  async simplifyExplanation() {
    return null; // curated alternative explanations (re-teach blocks) are used instead
  },
  async tutorReply() {
    throw new AINotConfiguredError();
  },
  async generateQuestions() {
    throw new AINotConfiguredError();
  },
  async lessonTutor() {
    // The guest tutor builds its curated answers itself (services/guest-tutor.ts).
    throw new AINotConfiguredError();
  },
};
