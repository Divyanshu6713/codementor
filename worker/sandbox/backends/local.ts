/**
 * Local-development backend for macOS and Linux (no Docker needed).
 *
 * Compiles with the machine's own g++ (or Apple clang behind `g++`) and runs each program as a
 * direct child process with OS resource limits set by `ulimit` just before it starts: CPU time,
 * address space (Linux), file size, open files, core dumps and — for C++ — processes. On top of
 * that it uses whatever isolation the machine offers, detected once at start-up with a self-test:
 *
 *   - Linux as root (servers, containers): a private network namespace (`unshare -n`) and the
 *     unprivileged user 65534 (`setpriv`), so the program has no network and can't write your files.
 *   - Linux as a normal user: a user + network namespace (`unshare -rn`) when the kernel allows it.
 *   - macOS: a `sandbox-exec` profile that denies network access, process creation (C++) and file
 *     writes outside the program's scratch folder. macOS ignores memory rlimits, so a watchdog
 *     polls the program's memory and stops it at the limit.
 *
 * It is for running your OWN code on your OWN machine. `production` is false, and the worker
 * refuses to use it in production; public sites use the docker backend (see docs/SANDBOX.md).
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFile, execFileSync, spawnSync } from "node:child_process";
import { EXECUTION_LIMITS, type RunResult } from "../../../src/server/execution/protocol";
import type { CompileResult, RunLimits, SandboxBackend } from "./types";
import { runCaptured, type CapturedRun } from "./proc";
import { describeExit, describePythonExit } from "./exit-codes";

function which(cmd: string): string | null {
  try {
    const found = execFileSync("/bin/sh", ["-c", `command -v ${cmd}`], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    return found || null;
  } catch {
    return null;
  }
}

function findCompiler(): string | null {
  const configured = process.env.SANDBOX_GXX;
  if (configured && fs.existsSync(configured)) return configured;
  return which("g++") ?? which("clang++");
}

/** A real CPython 3.10+ (match-case is taught). */
export function findPosixPython(): { exe: string; version: string } | null {
  const candidates = [process.env.SANDBOX_PYTHON, which("python3"), which("python")].filter((c): c is string => Boolean(c));
  for (const exe of candidates) {
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

/** macOS sandbox profile. DIR is the scratch folder (real path); writes are allowed only there. */
const MAC_PROFILE = (allowFork: boolean) => `(version 1)
(allow default)
(deny network*)
${allowFork ? "" : "(deny process-fork)\n"}(deny file-write*)
(allow file-write* (subpath (param "DIR")) (literal "/dev/null") (literal "/dev/stdout") (literal "/dev/stderr") (literal "/dev/tty") (literal "/dev/dtracehelper"))`;

type Wrapper = (dir: string, opts: { allowFork: boolean }) => string[];

interface Isolation {
  wrap: Wrapper;
  /** True when the program can't write files outside its folder or start a shell. */
  contained: boolean;
  description: string;
}

function works(cmd: string, args: string[]): boolean {
  try {
    const r = spawnSync(cmd, args, { stdio: "ignore", timeout: 5000 });
    return r.status === 0;
  } catch {
    return false;
  }
}

/** Picks the strongest isolation that actually works on this machine (self-tested). */
function detectIsolation(): Isolation {
  const none: Isolation = { wrap: () => [], contained: false, description: "resource limits only (no network or file isolation)" };
  if (process.env.SANDBOX_LOCAL_ISOLATION === "none") return none;
  const truePath = fs.existsSync("/usr/bin/true") ? "/usr/bin/true" : "/bin/true";

  if (process.platform === "darwin") {
    const sbx = "/usr/bin/sandbox-exec";
    if (fs.existsSync(sbx)) {
      const probe = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "cmk-probe-")));
      const ok = works(sbx, ["-D", `DIR=${probe}`, "-p", MAC_PROFILE(false), truePath]);
      fs.rmSync(probe, { recursive: true, force: true });
      if (ok) {
        return {
          wrap: (dir, { allowFork }) => [sbx, "-D", `DIR=${fs.realpathSync(dir)}`, "-p", MAC_PROFILE(allowFork)],
          contained: true,
          description: "macOS sandbox profile (no network, no new processes, writes only in its own folder)",
        };
      }
    }
    return none;
  }

  if (process.platform === "linux") {
    const unshare = which("unshare");
    const setpriv = which("setpriv");
    const isRoot = typeof process.getuid === "function" && process.getuid() === 0;
    if (isRoot && unshare && setpriv) {
      const prefix = [unshare, "-n", setpriv, "--reuid=65534", "--regid=65534", "--clear-groups", "--"];
      if (works(prefix[0], [...prefix.slice(1), truePath])) {
        return {
          wrap: () => prefix,
          contained: true,
          description: "private network namespace + unprivileged user 65534 (no network, can't write your files)",
        };
      }
    }
    if (!isRoot && unshare) {
      const prefix = [unshare, "-rn", "--"];
      if (works(prefix[0], [...prefix.slice(1), truePath])) {
        return { wrap: () => prefix, contained: false, description: "user + network namespace (no network; runs as you, so file writes aren't blocked)" };
      }
    }
  }
  return none;
}

/**
 * `sh -c 'ulimit …; exec "$0" "$@"' program args…` — limits apply to the program only, and `exec`
 * means the PID we watch IS the program (so signals like SIGSEGV reach us directly).
 */
function limitedCommand(program: string[], l: { cpuSeconds: number; memoryMb: number; noFork: boolean }): string[] {
  const set = (flag: string, value: number | string) => `ulimit ${flag} ${value} 2>/dev/null;`;
  const script = [
    set("-c", 0),
    set("-n", 64),
    set("-f", 2048), // file size, in 512-byte (sh) or 1 KB (bash) blocks: ≤ 2 MB either way
    set("-t", l.cpuSeconds),
    process.platform === "linux" ? set("-v", l.memoryMb * 1024 + 64 * 1024) : "",
    // Max processes for this user: -u in bash/zsh (macOS), -p in dash (Debian/Ubuntu /bin/sh).
    l.noFork ? "ulimit -u 1 2>/dev/null || ulimit -p 1 2>/dev/null;" : "",
    'exec "$0" "$@"',
  ].join(" ");
  return ["/bin/sh", "-c", script, ...program];
}

/** Polls a process's resident memory (KB, via `ps`) and calls `onExceed` once it passes the limit. */
function watchMemory(pid: number, memoryMb: number, onExceed: () => void): () => void {
  let stopped = false;
  const check = () => {
    if (stopped) return;
    execFile("ps", ["-o", "rss=", "-p", String(pid)], (err, out) => {
      if (stopped || err) return;
      const kb = Number(out.trim());
      if (Number.isFinite(kb) && kb > memoryMb * 1024) {
        stopped = true;
        onExceed();
      }
    });
  };
  const timer = setInterval(check, 50);
  return () => {
    stopped = true;
    clearInterval(timer);
  };
}

const SIGNAL_NUMBERS = os.constants.signals as Record<string, number>;

function classify(res: CapturedRun, id: string, limits: RunLimits, describe: (code: number, stderr: string) => string): RunResult {
  const base = { id, stdout: res.stdout, stderr: res.stderr };
  if (res.outputLimitHit) return { ...base, status: "output_limit", exitCode: null, detail: "The program printed too much output.", timeMs: res.wallMs };
  if (res.killedByGuard || res.signal === "SIGXCPU" || (res.signal === "SIGKILL" && res.wallMs >= limits.timeMs)) {
    return { ...base, status: "time_limit", exitCode: null, detail: "The program ran too long and was stopped.", timeMs: res.wallMs };
  }
  if (/std::bad_alloc|MemoryError|Cannot allocate memory|out of memory/i.test(res.stderr) && (res.signal || res.code !== 0)) {
    return { ...base, status: "memory_limit", exitCode: res.code, detail: "The program used too much memory.", timeMs: res.wallMs };
  }
  if (res.signal) {
    const code = 128 + (SIGNAL_NUMBERS[res.signal] ?? 0);
    return { ...base, status: "runtime_error", exitCode: code, detail: describe(code, res.stderr), timeMs: res.wallMs };
  }
  if (res.code !== 0) return { ...base, status: "runtime_error", exitCode: res.code, detail: describe(res.code ?? -1, res.stderr), timeMs: res.wallMs };
  return { ...base, status: "ok", exitCode: 0, detail: null, timeMs: res.wallMs };
}

export function createLocalBackend(): SandboxBackend {
  const gxx = findCompiler();
  const py = findPosixPython();
  let isClang = false;
  let isolation: Isolation | null = null;

  const exec = async (a: {
    dir: string; cwd: string; id: string; input: string; limits: RunLimits; program: string[];
    env: Record<string, string>; maxStdout: number; allowFork: boolean; describe: (code: number, stderr: string) => string;
  }): Promise<RunResult> => {
    const iso = isolation ?? detectIsolation();
    const cmd = [
      ...iso.wrap(a.dir, { allowFork: a.allowFork }),
      ...limitedCommand(a.program, { cpuSeconds: Math.max(1, Math.ceil(a.limits.timeMs / 1000)), memoryMb: a.limits.memoryMb, noFork: !a.allowFork }),
    ];
    let memoryKilled = false;
    const res = await runCaptured(cmd[0], cmd.slice(1), {
      input: a.input, env: a.env, cwd: a.cwd, maxStdout: a.maxStdout, maxStderr: a.limits.maxStderrBytes,
      guardMs: a.limits.timeMs + 1500,
      // macOS ignores memory rlimits, so watch the program's resident memory instead.
      onSpawn: process.platform === "linux" ? undefined : (pid, kill) => watchMemory(pid, a.limits.memoryMb, () => {
        memoryKilled = true;
        kill();
      }),
    });
    if (memoryKilled) return { id: a.id, stdout: res.stdout, stderr: res.stderr, status: "memory_limit", exitCode: null, detail: "The program used too much memory.", timeMs: res.wallMs };
    return classify(res, a.id, a.limits, a.describe);
  };

  const pythonArgs = (dir: string, mode: "check" | "run" | "trace") => [py!.exe, "-S", "-B", "-X", "utf8", path.join(dir, "harness.py"), mode, dir];

  /** Each Python test gets its own empty, world-writable scratch folder (the program may run as user 65534). */
  function scratchFolder(dir: string, id: string): string {
    const root = path.join(dir, "work");
    if (!fs.existsSync(root)) fs.mkdirSync(root, { mode: 0o777 });
    const folder = path.join(root, id);
    fs.mkdirSync(folder);
    fs.chmodSync(root, 0o777);
    fs.chmodSync(folder, 0o777);
    return folder;
  }

  return {
    id: "local",
    get isolation() {
      return `Local dev sandbox (${process.platform}): CPU, memory, file-size and process limits; ${(isolation ?? { description: "isolation detected at start-up" }).description}.`;
    },
    production: false,
    get contained() {
      return isolation?.contained ?? false;
    },
    compiler: gxx,
    python: py?.version ?? null,

    async init() {
      if (process.platform === "win32") throw new Error("The local backend is for macOS and Linux. On Windows use SANDBOX_BACKEND=windows-job.");
      if (!gxx) {
        throw new Error(process.platform === "darwin"
          ? "No C++ compiler found. Install the Xcode command line tools: xcode-select --install"
          : "No g++ found. Install it (e.g. sudo apt install g++) or set SANDBOX_GXX.");
      }
      try {
        isClang = /clang/i.test(execFileSync(gxx, ["--version"], { encoding: "utf8" }));
      } catch {
        isClang = false;
      }
      isolation = detectIsolation();
      if (!py) console.warn("[sandbox] No Python 3.10+ found (set SANDBOX_PYTHON) — Python code can't run.");
    },

    async compile(dir: string): Promise<CompileResult> {
      const flags = isClang
        ? ["-std=c++20", "-O2", "-pipe", "-ferror-limit=5", "-fno-color-diagnostics"]
        : ["-std=c++20", "-O2", "-pipe", "-fno-asm", "-fmax-errors=5", "-fdiagnostics-color=never"];
      const env = { PATH: process.env.PATH ?? "/usr/bin:/bin", TMPDIR: dir, HOME: dir, LANG: "C" };
      const res = await runCaptured(gxx!, [...flags, "-o", "main", "main.cpp"], {
        input: "", env, cwd: dir, maxStdout: 16 * 1024, maxStderr: 16 * 1024, guardMs: 30_000,
      });
      if (res.killedByGuard) return { ok: false, output: "Compiling took too long and was stopped." };
      const exe = path.join(dir, "main");
      const ok = res.code === 0 && fs.existsSync(exe);
      if (ok) {
        // The program may run as another (unprivileged) user: it needs to read and execute, nothing more.
        fs.chmodSync(dir, 0o755);
        fs.chmodSync(exe, 0o755);
      }
      return { ok, output: `${res.stdout}${res.stderr}` };
    },

    async run(dir: string, input: string, limits: RunLimits, id: string): Promise<RunResult> {
      return exec({
        dir, cwd: dir, id, input, limits, program: [path.join(dir, "main")], env: { LANG: "C" },
        maxStdout: limits.maxOutputBytes, allowFork: false, describe: (code) => describeExit(code),
      });
    },

    async checkPython(dir: string): Promise<CompileResult> {
      if (!py) return { ok: false, output: "Python isn't installed on this code runner." };
      fs.chmodSync(dir, 0o755);
      const res = await exec({
        dir, cwd: dir, id: "check", input: "",
        limits: { timeMs: 5000, memoryMb: 256, maxOutputBytes: 16 * 1024, maxStderrBytes: 16 * 1024 },
        program: pythonArgs(dir, "check"), env: { LANG: "C.UTF-8" }, maxStdout: 16 * 1024, allowFork: true, describe: () => "",
      });
      if (res.status === "ok") return { ok: true, output: res.stderr };
      if (res.status === "runtime_error") return { ok: false, output: res.stderr || "Python couldn't read this program." };
      return { ok: false, output: "Checking the program took too long and was stopped." };
    },

    async runPython(dir: string, input: string, limits: RunLimits, id: string, mode: "run" | "trace"): Promise<RunResult> {
      if (!py) throw new Error("Python isn't installed on this code runner.");
      const cwd = scratchFolder(dir, id);
      return exec({
        dir: cwd, cwd, id, input, limits, program: pythonArgs(dir, mode),
        // PYTHONHASHSEED=0 makes the order of sets of strings repeatable between runs and tests.
        env: { LANG: "C.UTF-8", PYTHONHASHSEED: "0" },
        maxStdout: mode === "trace" ? EXECUTION_LIMITS.maxTraceBytes : limits.maxOutputBytes,
        // Threads count as processes on Linux, and concurrency lessons start a few.
        allowFork: true, describe: describePythonExit,
      });
    },
  };
}
