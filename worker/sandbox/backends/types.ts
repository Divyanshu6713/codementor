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
  /** Python interpreter version (e.g. "3.12.10"), or null when this backend can't run Python. */
  python: string | null;
  init(): Promise<void>;
  /** Compiles `main.cpp` in `dir` into an executable in the same directory. */
  compile(dir: string): Promise<CompileResult>;
  run(dir: string, input: string, limits: RunLimits, id: string): Promise<RunResult>;
  /** Python: syntax-checks `dir/main.py` with the harness (nothing runs). */
  checkPython?(dir: string): Promise<CompileResult>;
  /**
   * Python: runs `dir/main.py` through `dir/harness.py` in a fresh, private scratch folder.
   * mode "trace" prints a JSON trace instead of the program's output.
   */
  runPython?(dir: string, input: string, limits: RunLimits, id: string, mode: "run" | "trace"): Promise<RunResult>;
}
