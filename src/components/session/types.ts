import type { SessionView } from "@/server/services/sessions";
import type { AnswerFeedback } from "@/server/services/session-types";

export type View = SessionView;
export type ItemView = Extract<SessionView["entry"], { kind: "item" }>["item"];
export type StepView = Extract<SessionView["entry"], { kind: "step" }>["step"];
export type Feedback = AnswerFeedback;
