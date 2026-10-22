import path from "node:path";

/** Centralised server configuration. Never import this from client components. */
function int(name: string, fallback: number): number {
  const raw = process.env[name];
  const n = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

function num(name: string): number | null {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export type ExecutionProviderId = "sandbox-worker" | "piston" | "none";
export type PaidAIProviderId = "claude" | "openai";
/**
 * curated → no external AI at all (the default).
 * claude / openai → only that provider; if it is unavailable, curated content is used — never the other provider.
 * auto → the first provider in AI_AUTO_ORDER that is fully configured.
 */
export type AIProviderSetting = "curated" | "claude" | "openai" | "auto";

const providerSetting = (process.env.AI_PROVIDER || "curated").trim().toLowerCase();

export const config = {
  databaseUrl: process.env.DATABASE_URL || null,
  autoMigrate: process.env.AUTO_MIGRATE !== "false",
  dataDir: process.env.CODEMENTOR_DATA_DIR || path.join(process.cwd(), ".data"),
  sessionDays: int("SESSION_DAYS", 14),
  /** Guests have no password, so their session cookie is their account: keep it longer. */
  guestSessionDays: int("GUEST_SESSION_DAYS", 180),
  /** New guest accounts allowed per hour across the whole app (abuse brake). */
  guestCreationsPerHour: int("GUEST_CREATIONS_PER_HOUR", 600),
  /** Only trust X-Forwarded-For / X-Real-IP when a proxy you control (e.g. Vercel) sets them. */
  trustProxy: process.env.TRUST_PROXY === "true" || process.env.VERCEL === "1",
  ai: {
    provider: (["curated", "claude", "openai", "auto"].includes(providerSetting) ? providerSetting : "curated") as AIProviderSetting,
    /** Providers "auto" may use, in order. Leaving a provider out disables it for auto mode. */
    autoOrder: (process.env.AI_AUTO_ORDER || "claude,openai").split(",").map((s) => s.trim()).filter((s): s is PaidAIProviderId => s === "claude" || s === "openai"),
    anthropic: {
      keyPresent: Boolean(process.env.ANTHROPIC_API_KEY),
      // AI_MODEL is the older name for this setting and is still honoured.
      model: process.env.ANTHROPIC_MODEL || process.env.AI_MODEL || "claude-opus-5-5",
      inputUsdPerMTok: num("ANTHROPIC_INPUT_USD_PER_MTOK"),
      outputUsdPerMTok: num("ANTHROPIC_OUTPUT_USD_PER_MTOK"),
    },
    openai: {
      keyPresent: Boolean(process.env.OPENAI_API_KEY),
      /** No default: the administrator must choose a model they have verified. */
      model: process.env.OPENAI_MODEL || null,
      inputUsdPerMTok: num("OPENAI_INPUT_USD_PER_MTOK"),
      outputUsdPerMTok: num("OPENAI_OUTPUT_USD_PER_MTOK"),
      /** Optional reasoning effort for reasoning models (e.g. "low"). Unset = provider default. */
      reasoningEffort: process.env.OPENAI_REASONING_EFFORT || null,
    },
    /** Student-triggered AI requests per guest per UTC day. */
    dailyRequestLimit: int("AI_DAILY_REQUEST_LIMIT", 10),
    /**
     * Automatic AI calls the adaptive engine makes for a student (phrasing hints, explaining a judged
     * mistake) per day. Beyond it the curated text is used — the student never sees an error.
     */
    autoDailyLimit: int("AI_AUTO_DAILY_LIMIT", 40),
    /** Per network address per UTC day — a backstop against cookie clearing, sized for shared campus networks. */
    ipDailyLimit: int("AI_IP_DAILY_LIMIT", 300),
    /** All student AI requests per day across the whole app. */
    globalDailyLimit: int("AI_GLOBAL_DAILY_LIMIT", 3000),
    /** Daily quotas reset at local midnight for this UTC offset (default 330 = India Standard Time). */
    quotaTzOffsetMinutes: int("AI_QUOTA_TZ_OFFSET_MINUTES", 330),
    /** Hard monthly spending cap (USD), enforced before every paid call. 0 disables paid AI. */
    monthlyBudgetUsd: num("AI_MONTHLY_BUDGET_USD") ?? 20,
    maxConcurrent: int("AI_MAX_CONCURRENT", 4),
    maxQueued: int("AI_MAX_QUEUED", 16),
    timeoutMs: int("AI_TIMEOUT_MS", 45_000),
    /** Output-token cap for tutor replies (includes any model thinking). */
    maxOutputTokens: int("AI_MAX_OUTPUT_TOKENS", 4000),
    /** Max characters of student input (question + code) sent to a model. */
    maxInputChars: int("AI_MAX_INPUT_CHARS", 12_000),
  },
  guest: {
    /** HMAC key for guest cookies and hashed quota keys. Required in production for guest AI. */
    secret: process.env.GUEST_SECRET || null,
  },
  execution: {
    provider: (process.env.EXECUTION_PROVIDER || "none") as ExecutionProviderId,
    sandboxUrl: process.env.SANDBOX_URL || "http://127.0.0.1:3410",
    sandboxToken: process.env.SANDBOX_TOKEN || "",
    pistonUrl: process.env.PISTON_URL || "",
    pistonCppVersion: process.env.PISTON_CPP_VERSION || "*",
    pistonPythonVersion: process.env.PISTON_PYTHON_VERSION || "3.12.0",
    /** Requests the web app lets through to the executor at once (per web instance). */
    maxConcurrent: int("EXECUTION_MAX_CONCURRENT", 4),
    maxQueued: int("EXECUTION_MAX_QUEUED", 20),
    maxSourceBytes: int("EXECUTION_MAX_SOURCE_BYTES", 64 * 1024),
    maxStdinBytes: int("EXECUTION_MAX_STDIN_BYTES", 16 * 1024),
    /**
     * Safety gate. In production, code only runs when this is "true" AND the executor reports a
     * production-grade isolation backend. Development builds always allow the local dev sandbox.
     */
    publicEnabled: process.env.EXECUTION_PUBLIC_ENABLED === "true",
  },
  isProduction: process.env.NODE_ENV === "production",
};
