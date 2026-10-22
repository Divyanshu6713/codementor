/**
 * Wire format between the web app and any execution backend (our sandbox worker, or adapters that
 * translate Piston/Judge0 responses into it). Kept dependency-free so the worker can import it.
 */

export const EXECUTION_LIMITS = {
  maxTests: 20,
  maxInputBytes: 16 * 1024,
  maxSourceBytes: 64 * 1024,
  defaultTimeMs: 2000,
  maxTimeMs: 5000,
  defaultMemoryMb: 256,
  maxMemoryMb: 512,
  /** Captured stdout per test; anything beyond is an output-limit failure. */
  maxOutputBytes: 64 * 1024,
  maxStderrBytes: 8 * 1024,
  /** Python only: seed files copied into the program's scratch folder (data files, helper modules). */
  maxFiles: 6,
  maxFileBytes: 32 * 1024,
  /** A step-by-step trace is JSON, so it may be larger than ordinary output. */
  maxTraceBytes: 512 * 1024,
} as const;

export type ExecLanguage = "cpp" | "python";

export interface ExecutionRequest {
  language: ExecLanguage;
  source: string;
  tests: { id: string; input: string }[];
  limits?: { timeMs?: number; memoryMb?: number };
  /** Python only: files placed in the program's folder before it starts (e.g. data.csv, helpers.py). */
  files?: { name: string; content: string }[];
  /**
   * Python only. "trace" runs the single test under a line tracer; that test's stdout is then a
   * JSON PythonTrace instead of the program's own output.
   */
  mode?: "run" | "trace";
}

/** One recorded step of a traced Python run (see worker/sandbox/python/harness.py). */
export interface PythonTraceStep {
  line: number;
  event: "line" | "call" | "return" | "exception";
  func: string;
  depth: number;
  vars: Record<string, string>;
  /** Length of the program's output so far (slice `stdout` to show output at this step). */
  out: number;
  value?: string;
}

export interface PythonTrace {
  steps: PythonTraceStep[];
  stdout: string;
  error: string | null;
  truncated: boolean;
}

export type RunStatus = "ok" | "runtime_error" | "time_limit" | "memory_limit" | "output_limit" | "internal_error" | "not_run";

export interface RunResult {
  id: string;
  status: RunStatus;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  /** Human-readable cause for runtime errors (e.g. "invalid memory access"). */
  detail: string | null;
  timeMs: number;
  /** The program tried to start another process and was refused. */
  processLimitHit?: boolean;
}

export interface ExecutionResponse {
  /** For Python, "compile" is the syntax check that runs before any test. */
  compile: { status: "success" | "error" | "rejected"; output: string };
  tests: RunResult[];
  executor: string;
  /** Plain description of the isolation actually applied, shown in the UI. */
  isolation: string;
  durationMs: number;
}

export interface WorkerHealth {
  ok: boolean;
  backend: string;
  isolation: string;
  production: boolean;
  compiler: string | null;
  /** Languages this worker can run, with the toolchain version (older workers omit it: C++ only). */
  languages?: Partial<Record<ExecLanguage, string>>;
}
