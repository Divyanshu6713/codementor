/**
 * Local-development backend for Windows (no Docker/WSL needed).
 *
 * Each compile and run goes through `jobrun.exe` (launcher/jobrun.c), which puts the process in a
 * Job Object with OS-enforced limits: memory, CPU time, wall time, ONE process (no child processes,
 * so no fork bombs or shell escapes), kill-on-close and UI restrictions. Student programs also run
 * with a privilege-less LOW-integrity token, which blocks writes to the user's files and registry,
 * and with an empty environment (no secrets to read).
 *
 * Python programs run the same way (python.exe under jobrun, through worker/sandbox/python/harness.py),
 * each in its own scratch folder labelled low-integrity so file-handling lessons can write there.
 *
 * What it does NOT do: network isolation (the Python harness refuses network access, but that is
 * defence in depth, not a boundary). That's why `production` is false and the worker refuses to use
 * this backend in production unless explicitly overridden.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { EXECUTION_LIMITS, type RunResult } from "../../../src/server/execution/protocol";
import type { CompileResult, RunLimits, SandboxBackend } from "./types";
import { runCaptured } from "./proc";
import { describeExit, describePythonExit } from "./exit-codes";

const LAUNCHER_SRC = path.join(__dirname, "..", "launcher", "jobrun.c");
const BIN_DIR = path.join(__dirname, "..", "bin");
const LAUNCHER = path.join(BIN_DIR, "jobrun.exe");

function findCompiler(): string | null {
  const configured = process.env.SANDBOX_GXX;
  if (configured && fs.existsSync(configured)) return configured;
  for (const candidate of ["C:\\msys64\\ucrt64\\bin\\g++.exe", "C:\\msys64\\mingw64\\bin\\g++.exe"]) {
    if (fs.existsSync(candidate)) return candidate;
  }
  try {
    const found = execFileSync("where", ["g++"], { encoding: "utf8" }).split(/\r?\n/)[0]?.trim();
    return found || null;
  } catch {
    return null;
  }
}

/** A real CPython 3.10+ (match-case is taught), never the Microsoft Store stub. */
export function findPython(): { exe: string; version: string } | null {
  const candidates: string[] = [];
  if (process.env.SANDBOX_PYTHON) candidates.push(process.env.SANDBOX_PYTHON);
  try {
    candidates.push(...execFileSync("where", ["python"], { encoding: "utf8" }).split(/\r?\n/).map((l) => l.trim()).filter(Boolean));
  } catch {
    /* not on PATH */
  }
  for (const exe of candidates) {
    if (!fs.existsSync(exe) || /WindowsApps/i.test(exe) || /msys64/i.test(exe)) continue;
    try {
      const version = execFileSync(exe, ["-S", "-c", "import sys;print('%d.%d.%d' % sys.version_info[:3])"], { encoding: "utf8", timeout: 10_000 }).trim();
      const [major, minor] = version.split(".").map(Number);
      if (major === 3 && minor >= 10) return { exe, version };
    } catch {
      /* broken interpreter — try the next one */
    }
  }
  return null;
}

interface LauncherReport {
  status: "ok" | "cpu_timeout" | "wall_timeout" | "memory_limit" | "error";
  exitCode: number;
  cpuMs: number;
  wallMs: number;
  peakMemKb: number;
  procLimitHit: boolean;
  error: string;
}

function readReport(file: string): LauncherReport | null {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as LauncherReport;
  } catch {
    return null;
  }
}

export function createWindowsJobBackend(): SandboxBackend {
  const gxx = findCompiler();
  const py = findPython();
  const toolDir = gxx ? path.dirname(gxx) : "";
  const systemRoot = process.env.SystemRoot || "C:\\Windows";

  /** Runs one program under the job-object launcher and classifies the launcher's report. */
  async function launch(a: {
    dir: string; cwd: string; id: string; input: string; limits: RunLimits; program: string[];
    env: Record<string, string>; maxStdout: number; describe: (code: number, stderr: string) => string;
  }): Promise<RunResult> {
    const report = path.join(a.dir, `run-${a.id}.json`);
    try {
      fs.rmSync(report, { force: true });
    } catch {
      /* ignore */
    }
    // CPU limit = time limit; wall clock gets headroom for process start-up and slow disks.
    const wall = a.limits.timeMs + 1500;
    const res = await runCaptured(LAUNCHER, [
      "--mem", String(a.limits.memoryMb), "--cpu", String(a.limits.timeMs), "--wall", String(wall), "--procs", "1", "--low",
      "--report", report, "--", ...a.program,
    ], {
      input: a.input, env: a.env, cwd: a.cwd,
      maxStdout: a.maxStdout, maxStderr: a.limits.maxStderrBytes, guardMs: wall + 3000,
    });
    const base = { id: a.id, stdout: res.stdout, stderr: res.stderr, processLimitHit: false };
    if (res.outputLimitHit) {
      return { ...base, status: "output_limit", exitCode: null, detail: "The program printed too much output.", timeMs: res.wallMs };
    }
    const r = readReport(report);
    if (!r || res.killedByGuard) {
      return { ...base, status: res.killedByGuard ? "time_limit" : "internal_error", exitCode: null, detail: null, timeMs: res.wallMs };
    }
    base.processLimitHit = r.procLimitHit;
    if (r.status === "error") return { ...base, status: "internal_error", exitCode: null, detail: r.error, timeMs: r.wallMs };
    if (r.status === "cpu_timeout" || r.status === "wall_timeout") {
      return { ...base, status: "time_limit", exitCode: null, detail: "The program ran too long and was stopped.", timeMs: r.wallMs };
    }
    if (r.status === "memory_limit") {
      return { ...base, status: "memory_limit", exitCode: r.exitCode, detail: "The program used too much memory.", timeMs: r.wallMs };
    }
    if (r.exitCode !== 0) {
      return { ...base, status: "runtime_error", exitCode: r.exitCode, detail: a.describe(r.exitCode, res.stderr), timeMs: r.wallMs };
    }
    return { ...base, status: "ok", exitCode: 0, detail: null, timeMs: r.wallMs };
  }

  /**
   * Each Python test gets its own empty scratch folder. Their parent carries a LOW integrity label
   * (inherited by the folders created inside it), so the low-integrity program can write there and
   * nowhere else on the machine.
   */
  function scratchFolder(dir: string, id: string): string {
    const root = path.join(dir, "work");
    if (!fs.existsSync(root)) {
      fs.mkdirSync(root);
      execFileSync("icacls", [root, "/setintegritylevel", "(OI)(CI)low"], { stdio: "pipe", windowsHide: true });
    }
    const folder = path.join(root, id);
    fs.mkdirSync(folder);
    return folder;
  }

  const pythonArgs = (dir: string, mode: "check" | "run" | "trace") => [py!.exe, "-S", "-B", "-X", "utf8", path.join(dir, "harness.py"), mode, dir];

  return {
    id: "windows-job",
    isolation: "Local dev sandbox: Windows job object (memory, CPU, time and single-process limits), low-integrity token, empty environment. No network isolation.",
    production: false,
    compiler: gxx,
    python: py?.version ?? null,

    async init() {
      if (process.platform !== "win32") throw new Error("The windows-job backend only runs on Windows.");
      if (!gxx) throw new Error("No g++ found. Install MSYS2 (ucrt64 toolchain) or set SANDBOX_GXX.");
      if (!py) console.warn("[sandbox] No Python 3.10+ found (set SANDBOX_PYTHON) — Python code can't run.");
      const stale = !fs.existsSync(LAUNCHER) || fs.statSync(LAUNCHER).mtimeMs < fs.statSync(LAUNCHER_SRC).mtimeMs;
      if (stale) {
        fs.mkdirSync(BIN_DIR, { recursive: true });
        const gcc = path.join(toolDir, "gcc.exe");
        execFileSync(gcc, ["-O2", "-o", LAUNCHER, LAUNCHER_SRC, "-ladvapi32"], {
          env: { ...process.env, PATH: `${toolDir};${process.env.PATH ?? ""}` },
          stdio: "pipe",
        });
      }
    },

    async compile(dir: string): Promise<CompileResult> {
      const report = path.join(dir, "compile.json");
      const env = { PATH: `${toolDir};${systemRoot}\\System32`, SystemRoot: systemRoot, TEMP: dir, TMP: dir };
      const res = await runCaptured(LAUNCHER, [
        "--mem", "1024", "--cpu", "20000", "--wall", "30000", "--procs", "8", "--report", report, "--",
        gxx!, "-std=c++17", "-O2", "-static", "-pipe", "-fno-asm", "-fmax-errors=5", "-fdiagnostics-color=never",
        "-o", "main.exe", "main.cpp",
      ], { input: "", env, cwd: dir, maxStdout: 16 * 1024, maxStderr: 16 * 1024, guardMs: 35_000 });
      const r = readReport(report);
      if (r && r.status !== "ok") {
        return { ok: false, output: r.status === "memory_limit" ? "The compiler ran out of memory on this program." : "Compiling took too long and was stopped." };
      }
      const exe = path.join(dir, "main.exe");
      return { ok: fs.existsSync(exe) && res.code === 0, output: `${res.stdout}${res.stderr}` };
    },

    async run(dir: string, input: string, limits: RunLimits, id: string): Promise<RunResult> {
      return launch({
        dir, cwd: dir, id, input, limits, program: [path.join(dir, "main.exe")], env: { SystemRoot: systemRoot },
        maxStdout: limits.maxOutputBytes, describe: (code) => describeExit(code),
      });
    },

    async checkPython(dir: string): Promise<CompileResult> {
      if (!py) return { ok: false, output: "Python isn't installed on this code runner." };
      const res = await launch({
        dir, cwd: dir, id: "check", input: "",
        limits: { timeMs: 5000, memoryMb: 256, maxOutputBytes: 16 * 1024, maxStderrBytes: 16 * 1024 },
        program: pythonArgs(dir, "check"), env: { SystemRoot: systemRoot }, maxStdout: 16 * 1024, describe: () => "",
      });
      if (res.status === "ok") return { ok: true, output: res.stderr };
      if (res.status === "runtime_error") return { ok: false, output: res.stderr || "Python couldn't read this program." };
      return { ok: false, output: "Checking the program took too long and was stopped." };
    },

    async runPython(dir: string, input: string, limits: RunLimits, id: string, mode: "run" | "trace"): Promise<RunResult> {
      if (!py) throw new Error("Python isn't installed on this code runner.");
      return launch({
        dir, cwd: scratchFolder(dir, id), id, input, limits, program: pythonArgs(dir, mode),
        // PYTHONHASHSEED=0 makes the order of sets of strings repeatable between runs and tests.
        env: { SystemRoot: systemRoot, PYTHONHASHSEED: "0" },
        maxStdout: mode === "trace" ? EXECUTION_LIMITS.maxTraceBytes : limits.maxOutputBytes,
        describe: describePythonExit,
      });
    },
  };
}
