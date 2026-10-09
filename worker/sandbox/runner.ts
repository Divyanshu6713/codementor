import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { EXECUTION_LIMITS, type ExecutionRequest, type ExecutionResponse, type RunResult } from "../../src/server/execution/protocol";
import { checkSource } from "./policy";
import type { SandboxBackend } from "./backends/types";

/** Removes the scratch directory path from compiler messages so students see `main.cpp:5:3: …`. */
export function cleanCompilerOutput(output: string, dir: string): string {
  const variants = [dir, dir.replace(/\\/g, "/"), dir.replace(/\//g, "\\")];
  let text = output;
  for (const v of variants) text = text.split(v + path.sep).join("").split(v + "/").join("").split(v).join("");
  return text.replace(/\r\n/g, "\n").slice(0, 8000);
}

const notRun = (id: string): RunResult => ({ id, status: "not_run", stdout: "", stderr: "", exitCode: null, detail: null, timeMs: 0 });

/** Policy check → compile once → run each test → always clean up. */
export async function executeRequest(backend: SandboxBackend, req: ExecutionRequest): Promise<ExecutionResponse> {
  const started = Date.now();
  const base = { executor: backend.id, isolation: backend.isolation };
  const policy = checkSource(req.source);
  if (!policy.ok) {
    const where = policy.line ? `Line ${policy.line}: ` : "";
    return { ...base, compile: { status: "rejected", output: `${where}${policy.message}` }, tests: req.tests.map((t) => notRun(t.id)), durationMs: Date.now() - started };
  }

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cmk-"));
  try {
    fs.writeFileSync(path.join(dir, "main.cpp"), req.source, "utf8");
    const compiled = await backend.compile(dir);
    if (!compiled.ok) {
      return { ...base, compile: { status: "error", output: cleanCompilerOutput(compiled.output, dir) || "Compilation failed." }, tests: req.tests.map((t) => notRun(t.id)), durationMs: Date.now() - started };
    }
    const limits = {
      timeMs: Math.min(req.limits?.timeMs ?? EXECUTION_LIMITS.defaultTimeMs, EXECUTION_LIMITS.maxTimeMs),
      memoryMb: Math.min(req.limits?.memoryMb ?? EXECUTION_LIMITS.defaultMemoryMb, EXECUTION_LIMITS.maxMemoryMb),
      maxOutputBytes: EXECUTION_LIMITS.maxOutputBytes,
      maxStderrBytes: EXECUTION_LIMITS.maxStderrBytes,
    };
    const tests: RunResult[] = [];
    for (const t of req.tests) tests.push(await backend.run(dir, t.input, limits, t.id));
    return { ...base, compile: { status: "success", output: cleanCompilerOutput(compiled.output, dir) }, tests, durationMs: Date.now() - started };
  } finally {
    // Retry briefly: Windows can keep an exe locked for a moment after the process exits.
    for (let i = 0; i < 5; i++) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
        break;
      } catch {
        await new Promise((r) => setTimeout(r, 100 * (i + 1)));
      }
    }
  }
}
