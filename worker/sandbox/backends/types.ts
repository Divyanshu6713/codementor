import type { RunResult } from "../../../src/server/execution/protocol";

export interface CompileResult {
  ok: boolean;
  output: string;
}

export interface RunLimits {
  timeMs: number;
  memoryMb: number;
  maxOutputBytes: number;
  maxStderrBytes: number;
}

/** A way of compiling and running one program in isolation. */
export interface SandboxBackend {
  id: string;
  /** Plain-language description of the isolation this backend provides. */
  isolation: string;
  /** True when the backend is safe to expose beyond a developer's own machine. */
  production: boolean;
  compiler: string | null;
  init(): Promise<void>;
  /** Compiles `main.cpp` in `dir` into an executable in the same directory. */
  compile(dir: string): Promise<CompileResult>;
  run(dir: string, input: string, limits: RunLimits, id: string): Promise<RunResult>;
}
