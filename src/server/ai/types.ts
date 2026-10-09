/**
 * AI provider contract. The AI assists inside the learning system's boundaries: it phrases hints,
 * explains judged mistakes, evaluates explanations against a rubric, chats Socratically and drafts
 * questions — it never grades code, never changes progress directly, and every structured output
 * is schema-validated and guardrail-checked before use.
 */

/** Compact, structured learner profile (never the raw chat history). */
export interface StudentContext {
  displayName: string;
  grade: string | null;
  goal: string | null;
  /** "simple" | "standard" | "detailed" — derived from demonstrated ability, not age alone. */
  explanationLevel: "simple" | "standard" | "detailed";
  activeConcept: { id: string; title: string } | null;
  skills: { title: string; mastery: number; confidence: string }[];
  misconceptions: { title: string; occurrences: number; status: string }[];
  hintDependency: number | null;
  revisionDue: number;
}

/** Facts produced by the judge / grader — the only truth the AI may describe. */
export interface Evidence {
  questionType: string;
  verdict: string | null;
  testsPassed: number | null;
  testsTotal: number | null;
  compileOutput: string | null;
  whatHappened: string | null;
  misconceptions: { code: string; title: string; explanation: string }[];
}

export interface HintRequest {
  level: number;
  curatedHint: string;
  questionPrompt: string;
  questionCode: string | null;
  studentAnswer: string | null;
  evidence: Evidence | null;
  /** Server-only: used to steer the hint and to check it doesn't leak the answer. */
  answerSummary: string;
  student: StudentContext;
}

export interface MistakeRequest {
  questionPrompt: string;
  studentAnswer: string;
  evidence: Evidence;
  curatedExplanation: string;
  student: StudentContext;
}

export interface ExplanationEvalRequest {
  prompt: string;
  keyIdeas: { id: string; label: string }[];
  knownMisconceptions: { code: string; title: string }[];
  text: string;
  student: StudentContext;
}

export interface TutorRequest {
  message: string;
  /** Recent turns of THIS conversation only (bounded). */
  recentTurns: { role: "student" | "tutor"; text: string }[];
  lessonContext: { title: string; stepTitle: string | null; stepBody: string | null } | null;
  questionContext: { prompt: string; evidence: Evidence | null; answerSummary: string } | null;
  student: StudentContext;
}

export interface SimplifyRequest {
  title: string;
  body: string;
  student: StudentContext;
}

export interface GeneratedCodeQuestion {
  prompt: string;
  starterCode: string;
  referenceSolution: string;
  tests: { label: string; input: string; output: string; visibility: "sample" | "visible" | "hidden"; category: "normal" | "boundary" | "edge" }[];
  hints: [string, string, string, string, string];
  explanation: string;
  difficulty: number;
}

export interface QuestionGenRequest {
  conceptTitle: string;
  skills: { id: string; title: string }[];
  difficulty: number;
  avoidPrompts: string[];
}

export interface Usage {
  model: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
}

export interface AIResult<T> {
  value: T;
  source: "ai" | "curated";
  usage?: Usage;
}

/** What the guest lesson tutor can be asked to do. */
export type TutorMode = "concept" | "hint" | "error" | "review" | "ask";

export interface LessonTutorRequest {
  mode: TutorMode;
  /** 1 guiding question · 2 relevant concept · 3 likely problem area · 4 approach. Only for mode "hint". */
  hintLevel: number | null;
  lesson: {
    title: string;
    goals: string[];
    summary: string[];
    /** The lesson's concept text (trimmed). */
    conceptText: string;
    exercisePrompt: string;
    /** The reviewed hint for this level, when mode is "hint". */
    curatedHint: string | null;
  };
  /** Untrusted student input. */
  code: string | null;
  question: string | null;
  /** Facts from a real compile/run/judge done by the server for this request — or null. */
  evidence: Evidence | null;
  /** Server-only: the reference solution, used to steer and to check for leaks. */
  answerSummary: string;
}

export interface AIProvider {
  id: "claude" | "openai" | "curated";
  /** True when free-form AI features (tutor chat, generation) are available. */
  conversational: boolean;
  generateHint(req: HintRequest): Promise<AIResult<{ text: string }>>;
  analyzeMistake(req: MistakeRequest): Promise<AIResult<{ explanation: string; guidingQuestion: string | null }>>;
  evaluateExplanation(req: ExplanationEvalRequest): Promise<AIResult<{ ideasFound: string[]; misconceptions: string[]; feedback: string }> | null>;
  simplifyExplanation(req: SimplifyRequest): Promise<AIResult<{ text: string }> | null>;
  tutorReply(req: TutorRequest): Promise<AIResult<{ reply: string }>>;
  generateQuestions(req: QuestionGenRequest): Promise<AIResult<GeneratedCodeQuestion[]>>;
  lessonTutor(req: LessonTutorRequest): Promise<AIResult<{ text: string }>>;
}
