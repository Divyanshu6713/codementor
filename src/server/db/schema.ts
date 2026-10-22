import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/*
 * CodeMentor data model.
 *
 * Canonical curriculum (tracks, concepts, skills, misconceptions, lessons, questions) is authored in
 * src/content and synced into these tables with versions, so historical attempts always point at the
 * exact question/lesson version a student saw. Everything a student "has" (mastery, misconceptions,
 * revision schedule, mistakes, achievements) is derived from stored attempts — never from the client.
 */

const id = () => uuid("id").primaryKey().defaultRandom();
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

export const ROLES = ["STUDENT", "PARENT", "ADMIN", "CONTENT_EDITOR"] as const;
export type Role = (typeof ROLES)[number];

// ── Accounts ────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: id(),
  /** Login name, stored lower-case. Students don't need an email address. */
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ROLES }).notNull(),
  displayName: text("display_name").notNull(),
  /**
   * Guest students start learning with one click: a server-side account with no password and no
   * personal data, kept by its session cookie. They can claim it later with a username + password.
   */
  isGuest: boolean("is_guest").notNull().default(false),
  createdAt: createdAt(),
});

export const authSessions = pgTable("auth_sessions", {
  /** sha256 of the cookie token — the raw token is never stored. */
  id: text("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: createdAt(),
}, (t) => [index("auth_sessions_user_idx").on(t.userId)]);

export const EXPERIENCE = ["none", "a_little", "some", "comfortable"] as const;
export const GOALS = ["learn_from_scratch", "school_college", "problem_solving", "prepare_dsa", "placements", "competitive", "revise_cpp"] as const;
export const SELF_CONFIDENCE = ["guessing", "somewhat", "very"] as const;

export const studentProfiles = pgTable("student_profiles", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  grade: text("grade"),
  experience: text("experience", { enum: EXPERIENCE }),
  usedCpp: boolean("used_cpp"),
  /** 1 = not confident … 3 = confident (self-reported at onboarding). */
  confidence: integer("confidence"),
  goal: text("goal", { enum: GOALS }),
  onboardedAt: timestamp("onboarded_at", { withTimezone: true }),
  diagnosticCompletedAt: timestamp("diagnostic_completed_at", { withTimezone: true }),
  /** Days to keep tutor chat messages; 0 = don't store them at all. */
  tutorRetentionDays: integer("tutor_retention_days").notNull().default(0),
  askConfidence: boolean("ask_confidence").notNull().default(true),
  /** Opt-in: show display name + weekly XP on the leaderboard (off by default — no public profiles). */
  showOnLeaderboard: boolean("show_on_leaderboard").notNull().default(false),
  createdAt: createdAt(),
});

export const parentProfiles = pgTable("parent_profiles", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
});

export const parentStudentLinks = pgTable("parent_student_links", {
  parentId: uuid("parent_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  studentId: uuid("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
}, (t) => [primaryKey({ columns: [t.parentId, t.studentId] })]);

/** Short-lived codes a student shares with a parent to link accounts. Stored hashed. */
export const linkCodes = pgTable("link_codes", {
  codeHash: text("code_hash").primaryKey(),
  studentId: uuid("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: createdAt(),
});

// ── Curriculum (synced from src/content) ───────────────────────────────────

export const CONTENT_STATUS = ["active", "planned", "disabled"] as const;

export const curriculumTracks = pgTable("curriculum_tracks", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  order: integer("order").notNull(),
  status: text("status", { enum: CONTENT_STATUS }).notNull(),
});

export const concepts = pgTable("concepts", {
  id: text("id").primaryKey(),
  trackId: text("track_id").notNull().references(() => curriculumTracks.id),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  order: integer("order").notNull(),
  status: text("status", { enum: CONTENT_STATUS }).notNull(),
  contentVersion: integer("content_version").notNull().default(1),
});

export const conceptPrerequisites = pgTable("concept_prerequisites", {
  conceptId: text("concept_id").notNull().references(() => concepts.id),
  prerequisiteId: text("prerequisite_id").notNull().references(() => concepts.id),
  strength: text("strength", { enum: ["required", "recommended"] }).notNull(),
}, (t) => [primaryKey({ columns: [t.conceptId, t.prerequisiteId] })]);

export const skills = pgTable("skills", {
  id: text("id").primaryKey(),
  conceptId: text("concept_id").notNull().references(() => concepts.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  order: integer("order").notNull(),
});

export const MISTAKE_CATEGORIES = [
  "syntax", "logic", "conceptual", "boundary", "off_by_one", "variable_confusion",
  "input_output", "data_type", "algorithm", "careless",
] as const;
export type MistakeCategory = (typeof MISTAKE_CATEGORIES)[number];

export const misconceptions = pgTable("misconceptions", {
  code: text("code").primaryKey(),
  conceptId: text("concept_id").notNull().references(() => concepts.id),
  title: text("title").notNull(),
  category: text("category", { enum: MISTAKE_CATEGORIES }).notNull(),
  description: text("description").notNull(),
  /** Student-facing, gentle wording ("You may be thinking…"). */
  studentExplanation: text("student_explanation").notNull(),
  contentVersion: integer("content_version").notNull().default(1),
});

export const lessons = pgTable("lessons", {
  id: text("id").primaryKey(),
  conceptId: text("concept_id").notNull().references(() => concepts.id),
  kind: text("kind", { enum: ["core", "remediation"] }).notNull(),
  title: text("title").notNull(),
  currentVersion: integer("current_version").notNull(),
  estimatedMinutes: integer("estimated_minutes").notNull(),
  status: text("status", { enum: CONTENT_STATUS }).notNull(),
});

export const lessonVersions = pgTable("lesson_versions", {
  id: id(),
  lessonId: text("lesson_id").notNull().references(() => lessons.id),
  version: integer("version").notNull(),
  /** Hash of the authored definition — a changed hash without a version bump fails the sync. */
  contentHash: text("content_hash").notNull(),
  createdAt: createdAt(),
}, (t) => [uniqueIndex("lesson_versions_uq").on(t.lessonId, t.version)]);

export const lessonSteps = pgTable("lesson_steps", {
  id: id(),
  lessonVersionId: uuid("lesson_version_id").notNull().references(() => lessonVersions.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  order: integer("order").notNull(),
  kind: text("kind").notNull(),
  /** True for steps only reachable through a branch (re-teach blocks). */
  branchOnly: boolean("branch_only").notNull().default(false),
  content: jsonb("content").notNull(),
}, (t) => [uniqueIndex("lesson_steps_uq").on(t.lessonVersionId, t.key)]);

export const QUESTION_TYPES = [
  "mcq", "predict_output", "identify_error", "complete_code", "reorder", "trace", "write_code", "explain",
] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export const QUESTION_STATUS = ["active", "disabled", "pending_review", "rejected"] as const;

export const questions = pgTable("questions", {
  id: text("id").primaryKey(),
  type: text("type", { enum: QUESTION_TYPES }).notNull(),
  status: text("status", { enum: QUESTION_STATUS }).notNull(),
  origin: text("origin", { enum: ["curated", "ai_generated"] }).notNull(),
  conceptId: text("concept_id").notNull().references(() => concepts.id),
  /** Language of any code in the question; null for language-neutral questions. */
  language: text("language"),
  /** Authored estimate, 1 (easy) … 5 (challenge). */
  difficulty: integer("difficulty").notNull(),
  /** Where the question may be used: diagnostic, lesson, practice, assessment, revision. */
  purposes: text("purposes").array().notNull(),
  currentVersion: integer("current_version").notNull(),
  /** Set when calibration finds the authored difficulty disagrees with learner results. */
  flaggedReason: text("flagged_reason"),
  createdAt: createdAt(),
}, (t) => [index("questions_concept_idx").on(t.conceptId)]);

export const VALIDATION_STATUS = ["not_required", "pending", "validated", "failed"] as const;

export const questionVersions = pgTable("question_versions", {
  id: id(),
  questionId: text("question_id").notNull().references(() => questions.id),
  version: integer("version").notNull(),
  contentHash: text("content_hash").notNull(),
  /** Student-visible content (prompt, code, options, starter code …). */
  content: jsonb("content").notNull(),
  /** Server-only: correct answers, distractor → misconception map, rubric. Never sent to the browser. */
  answerKey: jsonb("answer_key").notNull(),
  hints: jsonb("hints").notNull(),
  explanation: text("explanation").notNull(),
  referenceSolution: text("reference_solution"),
  validationStatus: text("validation_status", { enum: VALIDATION_STATUS }).notNull(),
  validationLog: jsonb("validation_log"),
  createdAt: createdAt(),
}, (t) => [uniqueIndex("question_versions_uq").on(t.questionId, t.version)]);

export const TEST_VISIBILITY = ["sample", "visible", "hidden"] as const;

export const questionTestCases = pgTable("question_test_cases", {
  id: id(),
  questionVersionId: uuid("question_version_id").notNull().references(() => questionVersions.id, { onDelete: "cascade" }),
  order: integer("order").notNull(),
  label: text("label").notNull(),
  input: text("input").notNull(),
  expectedOutput: text("expected_output").notNull(),
  visibility: text("visibility", { enum: TEST_VISIBILITY }).notNull(),
  category: text("category", { enum: ["normal", "boundary", "edge"] }).notNull(),
}, (t) => [index("question_test_cases_qv_idx").on(t.questionVersionId)]);

export const questionSkills = pgTable("question_skills", {
  questionId: text("question_id").notNull().references(() => questions.id),
  skillId: text("skill_id").notNull().references(() => skills.id),
  weight: real("weight").notNull().default(1),
}, (t) => [primaryKey({ columns: [t.questionId, t.skillId] })]);

/** Misconceptions a question is designed to probe (used to confirm a misconception is resolved). */
export const questionMisconceptions = pgTable("question_misconceptions", {
  questionId: text("question_id").notNull().references(() => questions.id),
  misconceptionCode: text("misconception_code").notNull().references(() => misconceptions.code),
}, (t) => [primaryKey({ columns: [t.questionId, t.misconceptionCode] })]);

/** Problems found with content: AI validation failures, calibration drift, judge inconsistencies. */
export const contentFlags = pgTable("content_flags", {
  id: id(),
  questionId: text("question_id"),
  kind: text("kind", { enum: ["validation_failed", "difficulty_drift", "unexpected_compile_failure", "student_report"] }).notNull(),
  details: jsonb("details").notNull(),
  resolved: boolean("resolved").notNull().default(false),
  createdAt: createdAt(),
});

// ── Learning activity ──────────────────────────────────────────────────────

export const SESSION_KINDS = ["diagnostic", "lesson", "practice", "revision"] as const;
export type SessionKind = (typeof SESSION_KINDS)[number];

export const learningSessions = pgTable("learning_sessions", {
  id: id(),
  studentId: uuid("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  kind: text("kind", { enum: SESSION_KINDS }).notNull(),
  conceptId: text("concept_id").references(() => concepts.id),
  lessonVersionId: uuid("lesson_version_id").references(() => lessonVersions.id),
  status: text("status", { enum: ["active", "completed", "abandoned"] }).notNull(),
  /** The learning-engine decision that created the session (incl. "why" reasons). */
  plan: jsonb("plan").notNull(),
  /** Server-owned runner state (current step, queue, difficulty …). */
  state: jsonb("state").notNull(),
  masteryBefore: jsonb("mastery_before"),
  report: jsonb("report"),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  lastActivityAt: timestamp("last_activity_at", { withTimezone: true }).notNull().defaultNow(),
  endedAt: timestamp("ended_at", { withTimezone: true }),
}, (t) => [index("learning_sessions_student_idx").on(t.studentId, t.startedAt)]);

/** Educational analytics events (not page views). Payloads never contain personal data. */
export const sessionEvents = pgTable("session_events", {
  id: id(),
  studentId: uuid("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: uuid("session_id").references(() => learningSessions.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  payload: jsonb("payload").notNull().default(sql`'{}'::jsonb`),
  createdAt: createdAt(),
}, (t) => [index("session_events_student_idx").on(t.studentId, t.createdAt)]);

export const assessments = pgTable("assessments", {
  id: id(),
  studentId: uuid("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: uuid("session_id").references(() => learningSessions.id, { onDelete: "cascade" }),
  kind: text("kind", { enum: ["diagnostic", "exit_check"] }).notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  result: jsonb("result"),
});

export const assessmentQuestions = pgTable("assessment_questions", {
  id: id(),
  assessmentId: uuid("assessment_id").notNull().references(() => assessments.id, { onDelete: "cascade" }),
  questionVersionId: uuid("question_version_id").notNull().references(() => questionVersions.id),
  order: integer("order").notNull(),
  conceptId: text("concept_id").notNull(),
  /** Why the adaptive algorithm asked it: calibration, confirm, probe_up, probe_down. */
  purpose: text("purpose").notNull(),
});

export const attempts = pgTable("attempts", {
  id: id(),
  studentId: uuid("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: uuid("session_id").references(() => learningSessions.id, { onDelete: "cascade" }),
  questionId: text("question_id").notNull().references(() => questions.id),
  questionVersionId: uuid("question_version_id").notNull().references(() => questionVersions.id),
  /** Identifies one presentation of a question in a session; retries share it. */
  itemKey: text("item_key").notNull(),
  attemptNumber: integer("attempt_number").notNull(),
  answer: jsonb("answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  /** Partial score 0..1 (e.g. tests passed / total). */
  score: real("score").notNull(),
  /** Hint level shown before this attempt (-1 = none). */
  hintLevelBefore: integer("hint_level_before").notNull().default(-1),
  selfConfidence: text("self_confidence", { enum: SELF_CONFIDENCE }),
  mistakeCategory: text("mistake_category", { enum: MISTAKE_CATEGORIES }),
  misconceptionCodes: text("misconception_codes").array().notNull().default(sql`'{}'::text[]`),
  durationMs: integer("duration_ms"),
  createdAt: createdAt(),
}, (t) => [
  index("attempts_student_idx").on(t.studentId, t.createdAt),
  index("attempts_session_item_idx").on(t.sessionId, t.itemKey),
  index("attempts_question_idx").on(t.questionId),
]);

/** The final outcome of one item (question presentation): the unit that feeds mastery. */
export const itemOutcomes = pgTable("item_outcomes", {
  id: id(),
  studentId: uuid("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: uuid("session_id").references(() => learningSessions.id, { onDelete: "cascade" }),
  questionId: text("question_id").notNull().references(() => questions.id),
  questionVersionId: uuid("question_version_id").notNull().references(() => questionVersions.id),
  itemKey: text("item_key").notNull(),
  correct: boolean("correct").notNull(),
  firstAttemptCorrect: boolean("first_attempt_correct").notNull(),
  independent: boolean("independent").notNull(),
  attempts: integer("attempts").notNull(),
  maxHintLevel: integer("max_hint_level").notNull(),
  solutionRevealed: boolean("solution_revealed").notNull(),
  credit: real("credit").notNull(),
  difficulty: integer("difficulty").notNull(),
  context: text("context").notNull(),
  createdAt: createdAt(),
}, (t) => [
  uniqueIndex("item_outcomes_item_uq").on(t.studentId, t.itemKey),
  index("item_outcomes_student_idx").on(t.studentId, t.createdAt),
]);

export const codeSubmissions = pgTable("code_submissions", {
  id: id(),
  studentId: uuid("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: uuid("session_id").references(() => learningSessions.id, { onDelete: "cascade" }),
  attemptId: uuid("attempt_id").references(() => attempts.id, { onDelete: "cascade" }),
  questionVersionId: uuid("question_version_id").references(() => questionVersions.id),
  kind: text("kind", { enum: ["run", "submit", "playground"] }).notNull(),
  language: text("language").notNull(),
  source: text("source").notNull(),
  createdAt: createdAt(),
}, (t) => [index("code_submissions_student_idx").on(t.studentId, t.createdAt)]);

export const judgeResults = pgTable("judge_results", {
  id: id(),
  submissionId: uuid("submission_id").notNull().references(() => codeSubmissions.id, { onDelete: "cascade" }),
  executor: text("executor").notNull(),
  verdict: text("verdict").notNull(),
  compileStatus: text("compile_status", { enum: ["success", "error", "rejected", "unavailable"] }).notNull(),
  compileOutput: text("compile_output"),
  testsPassed: integer("tests_passed").notNull(),
  testsTotal: integer("tests_total").notNull(),
  runtimeError: text("runtime_error"),
  timeLimitExceeded: boolean("time_limit_exceeded").notNull(),
  memoryLimitExceeded: boolean("memory_limit_exceeded").notNull(),
  outputLimitExceeded: boolean("output_limit_exceeded").notNull(),
  /** Per-test details; hidden tests store results but are summarised before reaching the browser. */
  details: jsonb("details").notNull(),
  durationMs: integer("duration_ms").notNull(),
  createdAt: createdAt(),
});

export const hintRequests = pgTable("hint_requests", {
  id: id(),
  studentId: uuid("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: uuid("session_id").references(() => learningSessions.id, { onDelete: "cascade" }),
  questionVersionId: uuid("question_version_id").notNull().references(() => questionVersions.id),
  itemKey: text("item_key").notNull(),
  /** 0–4 = hint ladder, 5 = full solution. */
  level: integer("level").notNull(),
  source: text("source", { enum: ["curated", "ai"] }).notNull(),
  createdAt: createdAt(),
}, (t) => [index("hint_requests_item_idx").on(t.studentId, t.itemKey)]);

// ── Student model ──────────────────────────────────────────────────────────

export const SKILL_STATUS = ["NEW", "LEARNING", "PRACTICING", "MASTERED", "REVISION_DUE", "REINFORCING"] as const;
export type SkillStatus = (typeof SKILL_STATUS)[number];

export const studentSkills = pgTable("student_skills", {
  studentId: uuid("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  skillId: text("skill_id").notNull().references(() => skills.id),
  alpha: real("alpha").notNull(),
  beta: real("beta").notNull(),
  mastery: real("mastery").notNull(),
  confidence: real("confidence").notNull(),
  evidenceCount: integer("evidence_count").notNull(),
  correctCount: integer("correct_count").notNull(),
  independentCount: integer("independent_count").notNull(),
  /** Last ≤10 outcomes, newest last: { c: credit, i: independent, h: max hint, at }. */
  recent: jsonb("recent").notNull(),
  explainScore: real("explain_score"),
  status: text("status", { enum: SKILL_STATUS }).notNull(),
  /** "assessed" = from real answers; "inferred" = assumed from the diagnostic ladder. */
  source: text("source", { enum: ["assessed", "inferred"] }).notNull(),
  lastPracticedAt: timestamp("last_practiced_at", { withTimezone: true }),
  updatedAt: updatedAt(),
}, (t) => [primaryKey({ columns: [t.studentId, t.skillId] })]);

export const studentMisconceptions = pgTable("student_misconceptions", {
  studentId: uuid("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  code: text("code").notNull().references(() => misconceptions.code),
  occurrences: integer("occurrences").notNull(),
  /** Times it came back after being resolved. */
  recurrences: integer("recurrences").notNull().default(0),
  /** Consecutive correct answers on questions that probe this misconception. */
  probeStreak: integer("probe_streak").notNull().default(0),
  status: text("status", { enum: ["active", "resolved"] }).notNull(),
  firstDetectedAt: timestamp("first_detected_at", { withTimezone: true }).notNull(),
  lastDetectedAt: timestamp("last_detected_at", { withTimezone: true }).notNull(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  /** Last ≤5 pieces of evidence: { questionId, attemptId, summary, at, selfConfidence }. */
  evidence: jsonb("evidence").notNull(),
}, (t) => [primaryKey({ columns: [t.studentId, t.code] })]);

export const mistakes = pgTable("mistakes", {
  id: id(),
  studentId: uuid("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  questionId: text("question_id").notNull().references(() => questions.id),
  questionVersionId: uuid("question_version_id").notNull().references(() => questionVersions.id),
  attemptId: uuid("attempt_id").references(() => attempts.id, { onDelete: "set null" }),
  conceptId: text("concept_id").notNull(),
  skillId: text("skill_id"),
  misconceptionCode: text("misconception_code").references(() => misconceptions.code),
  category: text("category", { enum: MISTAKE_CATEGORIES }).notNull(),
  /** The student's code or answer at the time (trimmed). */
  snapshot: text("snapshot").notNull(),
  whatHappened: text("what_happened").notNull(),
  occurrences: integer("occurrences").notNull().default(1),
  status: text("status", { enum: ["open", "fixed"] }).notNull(),
  retryQuestionId: text("retry_question_id").references(() => questions.id),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  fixedAt: timestamp("fixed_at", { withTimezone: true }),
}, (t) => [index("mistakes_student_idx").on(t.studentId, t.status)]);

export const revisionItems = pgTable("revision_items", {
  id: id(),
  studentId: uuid("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  skillId: text("skill_id").notNull().references(() => skills.id),
  /** Index into the interval ladder. */
  stage: integer("stage").notNull(),
  intervalDays: real("interval_days").notNull(),
  dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
  reason: text("reason", { enum: ["scheduled", "misconception", "failed_recall"] }).notNull(),
  lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }),
  lastQuality: real("last_quality"),
  reviews: integer("reviews").notNull().default(0),
  createdAt: createdAt(),
}, (t) => [uniqueIndex("revision_items_uq").on(t.studentId, t.skillId)]);

export const achievements = pgTable("achievements", {
  code: text("code").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
});

export const studentAchievements = pgTable("student_achievements", {
  studentId: uuid("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  code: text("code").notNull().references(() => achievements.code),
  awardedAt: timestamp("awarded_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [primaryKey({ columns: [t.studentId, t.code] })]);

/** Concept-level mastery at the end of each session, for "recent changes" and parent summaries. */
export const progressSnapshots = pgTable("progress_snapshots", {
  id: id(),
  studentId: uuid("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: uuid("session_id").references(() => learningSessions.id, { onDelete: "cascade" }),
  conceptMastery: jsonb("concept_mastery").notNull(),
  createdAt: createdAt(),
}, (t) => [index("progress_snapshots_student_idx").on(t.studentId, t.createdAt)]);

/** Explain-it-back answers (text kept so the student can see their own explanation later). */
export const explanations = pgTable("explanations", {
  id: id(),
  studentId: uuid("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: uuid("session_id").references(() => learningSessions.id, { onDelete: "cascade" }),
  promptKey: text("prompt_key").notNull(),
  text: text("text").notNull(),
  score: real("score").notNull(),
  evaluation: jsonb("evaluation").notNull(),
  evaluator: text("evaluator", { enum: ["rubric", "ai"] }).notNull(),
  createdAt: createdAt(),
});

/** Tutor chat messages — only stored when the student's retention setting allows it. */
export const tutorMessages = pgTable("tutor_messages", {
  id: id(),
  studentId: uuid("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: uuid("session_id").references(() => learningSessions.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["student", "tutor"] }).notNull(),
  text: text("text").notNull(),
  createdAt: createdAt(),
});

/** Metadata about every AI call: cost/latency/validation — never the prompt or reply text. */
export const aiInteractions = pgTable("ai_interactions", {
  id: id(),
  studentId: uuid("student_id").references(() => users.id, { onDelete: "set null" }),
  purpose: text("purpose").notNull(),
  provider: text("provider").notNull(),
  model: text("model"),
  promptVersion: text("prompt_version").notNull(),
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  latencyMs: integer("latency_ms").notNull(),
  status: text("status", { enum: ["ok", "invalid_output", "guardrail_rejected", "error"] }).notNull(),
  createdAt: createdAt(),
});

/**
 * Progress through the step-by-step C++ lesson path (content in src/content/course). A lesson is
 * passed only when the deterministic judge accepts the student's exercise. Hint level and whether
 * the worked solution was opened before passing decide how much XP the pass earns.
 */
export const courseProgress = pgTable("course_progress", {
  studentId: uuid("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  lessonId: text("lesson_id").notNull(),
  /** Highest hint level opened (0–4). */
  hintLevel: integer("hint_level").notNull().default(0),
  solutionViewedAt: timestamp("solution_viewed_at", { withTimezone: true }),
  passedAt: timestamp("passed_at", { withTimezone: true }),
  /** Hint level / solution state frozen at the moment of passing (XP is computed from these). */
  passedHintLevel: integer("passed_hint_level"),
  passedAfterSolution: boolean("passed_after_solution"),
  updatedAt: updatedAt(),
}, (t) => [primaryKey({ columns: [t.studentId, t.lessonId] })]);

/**
 * The AI spending ledger: one row per billed model response (including retries). The monthly
 * budget is enforced against the sum of `cost_usd` here. No prompt or reply content.
 */
export const aiSpend = pgTable("ai_spend", {
  id: id(),
  provider: text("provider").notNull(),
  model: text("model"),
  purpose: text("purpose").notNull(),
  inputTokens: integer("input_tokens").notNull(),
  outputTokens: integer("output_tokens").notNull(),
  costUsd: real("cost_usd").notNull(),
  createdAt: createdAt(),
}, (t) => [index("ai_spend_created_idx").on(t.createdAt)]);

/**
 * Daily AI request counters. `key` is never a raw identifier: guest ids and network addresses are
 * HMAC-hashed with GUEST_SECRET (addresses with the day mixed in), so the table can't be joined
 * back to a person. Rows older than a few days carry no value and can be deleted.
 */
export const aiQuota = pgTable("ai_quota", {
  key: text("key").notNull(),
  day: text("day").notNull(),
  count: integer("count").notNull().default(0),
}, (t) => [primaryKey({ columns: [t.key, t.day] })]);

export const auditLog = pgTable("audit_log", {
  id: id(),
  actorId: uuid("actor_id"),
  action: text("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id"),
  details: jsonb("details").notNull().default(sql`'{}'::jsonb`),
  createdAt: createdAt(),
});

// ── Python Mastery ──────────────────────────────────────────────────────────────────────────
// Content lives in src/content/python (ids are stable strings). Everything below is per-learner
// evidence; progress, mastery, streaks and time are always computed from these rows.

export const PY_MODES = ["learn", "practice", "revision", "exam", "interview", "challenge", "project"] as const;

/** One answer to a Python question, or one judged Check of a Python exercise (kind "code"). */
export const pyAttempts = pgTable("py_attempts", {
  id: id(),
  studentId: uuid("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  /** Question id (`lesson/q`, `module/exam/q`) or exercise key for kind "code". */
  itemId: text("item_id").notNull(),
  lessonId: text("lesson_id"),
  moduleId: text("module_id"),
  kind: text("kind").notNull(),
  mode: text("mode", { enum: PY_MODES }).notNull(),
  correct: boolean("correct").notNull(),
  /** The learner looked at the answer instead of answering (counts as not correct). */
  revealed: boolean("revealed").notNull().default(false),
  hintUsed: boolean("hint_used").notNull().default(false),
  difficulty: integer("difficulty").notNull(),
  /** Short copy of the answer for the learner's own history (never code, which isn't stored). */
  answer: text("answer"),
  assessmentId: uuid("assessment_id"),
  createdAt: createdAt(),
}, (t) => [index("py_attempts_student_idx").on(t.studentId, t.createdAt), index("py_attempts_lesson_idx").on(t.studentId, t.lessonId)]);

/** Exercise state: hints opened, worked solution viewed, first judged pass (XP is computed from these). */
export const pyExerciseProgress = pgTable("py_exercise_progress", {
  studentId: uuid("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  exerciseKey: text("exercise_key").notNull(),
  hintLevel: integer("hint_level").notNull().default(0),
  solutionViewedAt: timestamp("solution_viewed_at", { withTimezone: true }),
  passedAt: timestamp("passed_at", { withTimezone: true }),
  passedHintLevel: integer("passed_hint_level"),
  passedAfterSolution: boolean("passed_after_solution"),
  checks: integer("checks").notNull().default(0),
  /** Challenge mode: when the timer was started, and the fastest judged pass (ms). */
  timerStartedAt: timestamp("timer_started_at", { withTimezone: true }),
  bestMs: integer("best_ms"),
  updatedAt: updatedAt(),
}, (t) => [primaryKey({ columns: [t.studentId, t.exerciseKey] })]);

/** Spaced revision per lesson (Leitner boxes 1..6 → 1, 3, 7, 14, 30, 60 days). */
export const pyReviews = pgTable("py_reviews", {
  studentId: uuid("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  lessonId: text("lesson_id").notNull(),
  box: integer("box").notNull().default(1),
  dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
  lastResult: boolean("last_result"),
  updatedAt: updatedAt(),
}, (t) => [primaryKey({ columns: [t.studentId, t.lessonId] })]);

export const PY_ASSESSMENT_KINDS = ["module", "level", "final", "mixed", "interview"] as const;

/** A module exam, level checkpoint, final, mixed-topic test or mock interview. */
export const pyAssessments = pgTable("py_assessments", {
  id: id(),
  studentId: uuid("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  kind: text("kind", { enum: PY_ASSESSMENT_KINDS }).notNull(),
  /** Module id, level number, or "all". */
  scopeId: text("scope_id").notNull(),
  questionIds: jsonb("question_ids").$type<string[]>().notNull(),
  /** Mock interviews include one coding problem. */
  exerciseKey: text("exercise_key"),
  timeLimitS: integer("time_limit_s"),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  score: integer("score"),
  total: integer("total"),
  passed: boolean("passed"),
  details: jsonb("details").$type<Record<string, unknown>>(),
}, (t) => [index("py_assessments_student_idx").on(t.studentId, t.startedAt)]);

/** Learner settings for the Python path, and lessons opened early by explicit choice. */
export const pySettings = pgTable("py_settings", {
  studentId: uuid("student_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  /** true = lessons unlock in order (with an explicit "open anyway"); false = everything open. */
  guided: boolean("guided").notNull().default(true),
  unlocked: jsonb("unlocked").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  updatedAt: updatedAt(),
});

/** Active learning time per day (heartbeats from Python pages while the learner is active). */
export const pyActivity = pgTable("py_activity", {
  studentId: uuid("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  day: text("day").notNull(),
  seconds: integer("seconds").notNull().default(0),
}, (t) => [primaryKey({ columns: [t.studentId, t.day] })]);

/** Saved code (exercise drafts and workspace files), so work resumes on any device. */
export const pyCodeSaves = pgTable("py_code_saves", {
  studentId: uuid("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  code: text("code").notNull(),
  updatedAt: updatedAt(),
}, (t) => [primaryKey({ columns: [t.studentId, t.key] })]);
