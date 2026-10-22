import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { EXECUTION_LIMITS, type ExecutionRequest, type ExecutionResponse, type RunResult } from "../../src/server/execution/protocol";
import { checkPythonSource, checkSource } from "./policy";
import type { SandboxBackend } from "./backends/types";

const HARNESS = path.join(__dirname, "python", "harness.py");

/** Removes the scratch directory path from compiler messages so students see `main.cpp:5:3: …`. */
export function cleanCompilerOutput(output: string, dir: string): string {
  const variants = [dir, dir.replace(/\\/g, "/"), dir.replace(/\//g, "\\")];
  let text = output;
  for (const v of variants) text = text.split(v + path.sep).join("").split(v + "/").join("").split(v).join("");
  return text.replace(/\r\n/g, "\n").slice(0, 8000);
}

const notRun = (id: string): RunResult => ({ id, status: "not_run", stdout: "", stderr: "", exitCode: null, detail: null, timeMs: 0 });

function runLimits(req: ExecutionRequest) {
  return {
    timeMs: Math.min(req.limits?.timeMs ?? EXECUTION_LIMITS.defaultTimeMs, EXECUTION_LIMITS.maxTimeMs),
    memoryMb: Math.min(req.limits?.memoryMb ?? EXECUTION_LIMITS.defaultMemoryMb, EXECUTION_LIMITS.maxMemoryMb),
    maxOutputBytes: EXECUTION_LIMITS.maxOutputBytes,
    maxStderrBytes: EXECUTION_LIMITS.maxStderrBytes,
  };
}

async function removeDir(dir: string) {
  // Retry briefly: Windows can keep an exe locked for a moment after the process exits.
  for (let i = 0; i < 5; i++) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 100 * (i + 1)));
    }
  }
}

/** Policy check → compile (C++) or syntax check (Python) once → run each test → always clean up. */
export async function executeRequest(backend: SandboxBackend, req: ExecutionRequest): Promise<ExecutionResponse> {
  if (req.language === "python") return executePython(backend, req);
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
    const limits = runLimits(req);
    const tests: RunResult[] = [];
    for (const t of req.tests) tests.push(await backend.run(dir, t.input, limits, t.id));
    return { ...base, compile: { status: "success", output: cleanCompilerOutput(compiled.output, dir) }, tests, durationMs: Date.now() - started };
  } finally {
    await removeDir(dir);
  }
}

/**
 * Python: main.py, the harness and any seed files go into a fresh folder; the harness checks the
 * syntax once, then every test runs in its own empty scratch folder (so one test's files can't
 * affect another's).
 */
async function executePython(backend: SandboxBackend, req: ExecutionRequest): Promise<ExecutionResponse> {
  const started = Date.now();
  const base = { executor: backend.id, isolation: backend.isolation };
  const rejected = (output: string): ExecutionResponse => ({ ...base, compile: { status: "rejected", output }, tests: req.tests.map((t) => notRun(t.id)), durationMs: Date.now() - started });
  if (!backend.python || !backend.checkPython || !backend.runPython) return rejected("Python isn't installed on this code runner.");
  const policy = checkPythonSource(req.source, req.files);
  if (!policy.ok) return rejected(policy.message);
  if (req.mode === "trace" && req.tests.length !== 1) return rejected("A step-by-step trace runs one input at a time.");

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cmk-py-"));
  try {
    fs.writeFileSync(path.join(dir, "main.py"), req.source, "utf8");
    fs.copyFileSync(HARNESS, path.join(dir, "harness.py"));
    if (req.files?.length) {
      fs.mkdirSync(path.join(dir, "files"));
      for (const f of req.files) {
        const target = path.join(dir, "files", ...f.name.split("/"));
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, f.content, "utf8");
      }
    }
    const checked = await backend.checkPython(dir);
    if (!checked.ok) {
      return { ...base, compile: { status: "error", output: cleanCompilerOutput(checked.output, dir) || "Python couldn't read this program." }, tests: req.tests.map((t) => notRun(t.id)), durationMs: Date.now() - started };
    }
    const limits = runLimits(req);
    const tests: RunResult[] = [];
    for (const t of req.tests) {
      const r = await backend.runPython(dir, t.input, limits, t.id, req.mode ?? "run");
      tests.push({ ...r, stderr: cleanCompilerOutput(r.stderr, dir) });
    }
    return { ...base, compile: { status: "success", output: cleanCompilerOutput(checked.output, dir) }, tests, durationMs: Date.now() - started };
  } finally {
    await removeDir(dir);
  }
}
