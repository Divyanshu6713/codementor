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
} as const;

export interface ExecutionRequest {
  language: "cpp";
  source: string;
  tests: { id: string; input: string }[];
  limits?: { timeMs?: number; memoryMb?: number };
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
}
