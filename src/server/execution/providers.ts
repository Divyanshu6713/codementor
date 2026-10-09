/**
 * Execution provider abstraction. The web app never compiles or runs student code itself — it
 * sends a request to one of these providers:
 *   - sandbox-worker: our worker service (worker/sandbox) over HTTP with a shared token
 *   - piston:         a Piston-compatible service (one call per test; adapter, not verified here)
 *   - none:           execution is not configured → the UI says so; nothing is simulated
 */
import { config } from "@/server/config";
import { AppError } from "@/server/errors";
import { logger } from "@/server/logger";
import type { ExecutionRequest, ExecutionResponse, RunResult, WorkerHealth } from "./protocol";

export class ExecutionUnavailableError extends AppError {
  constructor(message = "Code execution environment not configured.") {
    super(message, 503, "execution_unavailable");
  }
}

export interface ExecutionStatus {
  available: boolean;
  provider: string;
  isolation: string | null;
  /** True when the isolation is a local-development backend (shown as a banner). */
  devOnly: boolean;
  message: string | null;
}

export interface ExecutionProvider {
  id: string;
  status(): Promise<ExecutionStatus>;
  execute(req: ExecutionRequest): Promise<ExecutionResponse>;
}

const notConfigured: ExecutionProvider = {
  id: "none",
  async status() {
    return { available: false, provider: "none", isolation: null, devOnly: false, message: "Code execution environment not configured." };
  },
  async execute() {
    throw new ExecutionUnavailableError();
  },
};

function sandboxWorker(): ExecutionProvider {
  const base = config.execution.sandboxUrl.replace(/\/$/, "");
  let cached: { at: number; value: ExecutionStatus } | null = null;
  return {
    id: "sandbox-worker",
    async status() {
      if (cached && Date.now() - cached.at < 10_000) return cached.value;
      let value: ExecutionStatus;
      try {
        const res = await fetch(`${base}/health`, { signal: AbortSignal.timeout(2000), cache: "no-store" });
        const h = (await res.json()) as WorkerHealth;
        value = { available: h.ok, provider: `sandbox-worker:${h.backend}`, isolation: h.isolation, devOnly: !h.production, message: null };
      } catch {
        value = { available: false, provider: "sandbox-worker", isolation: null, devOnly: false, message: "The code runner isn't reachable right now. (Is the sandbox worker running?)" };
      }
      cached = { at: Date.now(), value };
      return value;
    },
    async execute(req) {
      if (!config.execution.sandboxToken) throw new ExecutionUnavailableError("Code execution environment not configured (SANDBOX_TOKEN missing).");
      let res: Response;
      try {
        res = await fetch(`${base}/v1/execute`, {
          method: "POST",
          headers: { "content-type": "application/json", authorization: `Bearer ${config.execution.sandboxToken}` },
          body: JSON.stringify(req),
          signal: AbortSignal.timeout(120_000),
        });
      } catch (err) {
        cached = null;
        logger.error("execution.worker_unreachable", { err });
        throw new ExecutionUnavailableError("The code runner isn't reachable right now. Please try again in a moment.");
      }
      if (res.status === 503) throw new AppError("The code runner is busy. Please try again in a few seconds.", 503, "execution_busy");
      if (!res.ok) {
        logger.error("execution.worker_error", { status: res.status });
        throw new AppError("The code runner had a problem. Please try again.", 502, "execution_failed");
      }
      return (await res.json()) as ExecutionResponse;
    },
  };
}

/** Adapter for a Piston-compatible API (https://github.com/engineer-man/piston). */
function piston(): ExecutionProvider {
  const base = config.execution.pistonUrl.replace(/\/$/, "");
  const isolation = "Piston service (isolation provided by the Piston deployment).";
  return {
    id: "piston",
    async status() {
      if (!base) return { available: false, provider: "piston", isolation: null, devOnly: false, message: "Code execution environment not configured (PISTON_URL missing)." };
      return { available: true, provider: "piston", isolation, devOnly: false, message: null };
    },
    async execute(req) {
      if (!base) throw new ExecutionUnavailableError();
      const started = Date.now();
      const tests: RunResult[] = [];
      let compile: ExecutionResponse["compile"] = { status: "success", output: "" };
      for (const t of req.tests) {
        const res = await fetch(`${base}/api/v2/execute`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            language: "c++", version: config.execution.pistonCppVersion, files: [{ name: "main.cpp", content: req.source }], stdin: t.input,
            run_timeout: req.limits?.timeMs ?? 2000, compile_timeout: 10_000, run_memory_limit: (req.limits?.memoryMb ?? 256) * 1024 * 1024,
          }),
          signal: AbortSignal.timeout(60_000),
        }).catch(() => null);
        if (!res?.ok) throw new AppError("The code runner had a problem. Please try again.", 502, "execution_failed");
        const body = (await res.json()) as {
          compile?: { code: number | null; stderr: string; stdout: string };
          run: { code: number | null; signal: string | null; stdout: string; stderr: string };
        };
        if (body.compile && body.compile.code !== 0) {
          compile = { status: "error", output: `${body.compile.stdout}${body.compile.stderr}`.slice(0, 8000) };
          return { compile, tests: req.tests.map((x) => ({ id: x.id, status: "not_run", stdout: "", stderr: "", exitCode: null, detail: null, timeMs: 0 })), executor: "piston", isolation, durationMs: Date.now() - started };
        }
        const killed = body.run.signal === "SIGKILL";
        tests.push({
          id: t.id, stdout: body.run.stdout.slice(0, 65536), stderr: body.run.stderr.slice(0, 8192), exitCode: body.run.code, timeMs: 0,
          status: killed ? "time_limit" : body.run.code === 0 ? "ok" : "runtime_error",
          detail: killed ? "The program ran too long or used too much memory." : body.run.code === 0 ? null : `The program exited with code ${body.run.code}.`,
        });
      }
      return { compile, tests, executor: "piston", isolation, durationMs: Date.now() - started };
    },
  };
}

// ── Web-side admission control: bounded concurrency + queue per web instance ──
const gate = ((globalThis as Record<string, unknown>).__cmkExecGate as { running: number; waiting: (() => void)[] }) ??
  ((globalThis as Record<string, unknown>).__cmkExecGate = { running: 0, waiting: [] });

async function admitted<T>(fn: () => Promise<T>): Promise<T> {
  if (gate.running >= config.execution.maxConcurrent) {
    if (gate.waiting.length >= config.execution.maxQueued) {
      throw new AppError("Lots of people are running code right now. Please try again in a few seconds.", 503, "execution_busy");
    }
    await new Promise<void>((resolve) => gate.waiting.push(resolve));
  }
  gate.running++;
  try {
    return await fn();
  } finally {
    gate.running--;
    gate.waiting.shift()?.();
  }
}

let override: ExecutionProvider | null = null;
/** Tests inject a fake provider; production code never calls this. */
export function setExecutionProviderForTesting(p: ExecutionProvider | null) {
  override = p;
}

export function getExecutionProvider(): ExecutionProvider {
  if (override) return override;
  switch (config.execution.provider) {
    case "sandbox-worker":
      return sandboxWorker();
    case "piston":
      return piston();
    default:
      return notConfigured;
  }
}

// Module-scoped (not globalThis) so a hot reload gets a fresh provider with current error classes.
let cachedProvider: ExecutionProvider | null = null;

function provider(): ExecutionProvider {
  if (override) return override;
  return (cachedProvider ??= getExecutionProvider());
}

/**
 * The production safety gate. In production, student code runs only when the administrator has
 * set EXECUTION_PUBLIC_ENABLED=true AND the executor reports a production-grade isolation backend.
 * A development sandbox (e.g. windows-job, which has no network isolation) is never used in
 * production through this path. Development builds are not gated.
 */
export function applySafetyGate(s: ExecutionStatus, production = config.isProduction): ExecutionStatus {
  if (!production || !s.available) return s;
  if (!config.execution.publicEnabled) {
    return { ...s, available: false, message: "Code execution is switched off on this server until its sandbox has passed the launch checks." };
  }
  if (s.devOnly) {
    return { ...s, available: false, message: "Code execution is off: the code runner is using a development-only sandbox." };
  }
  return s;
}

export async function executionStatus(): Promise<ExecutionStatus> {
  const s = await provider().status();
  return override ? s : applySafetyGate(s);
}

export async function execute(req: ExecutionRequest): Promise<ExecutionResponse> {
  if (config.isProduction && !override) {
    const s = await executionStatus();
    if (!s.available) throw new ExecutionUnavailableError(s.message ?? undefined);
  }
  if (Buffer.byteLength(req.source, "utf8") > config.execution.maxSourceBytes) throw new AppError("This program is too long to run (64 KB limit).");
  if (req.tests.some((t) => Buffer.byteLength(t.input, "utf8") > config.execution.maxStdinBytes)) throw new AppError("The input is too long (16 KB limit).");
  return admitted(() => provider().execute(req));
}
