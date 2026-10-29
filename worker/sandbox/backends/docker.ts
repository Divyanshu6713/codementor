/**
 * Production backend: one throw-away container per compile and per test run.
 *
 * Every container: no network, read-only root filesystem, all capabilities dropped,
 * no-new-privileges, unprivileged user, pids limit (fork bombs), memory + swap limit, one CPU, and
 * a hard kill after the time limit. The program directory is mounted read-only for runs.
 *
 * Python runs in its own image (SANDBOX_DOCKER_PYTHON_IMAGE, default python:3.12-slim) through
 * worker/sandbox/python/harness.py, with a small private tmpfs as the program's writable folder.
 *
 * Plain Docker (runc) shares the host kernel, so a kernel bug can become an escape. For public use
 * set SANDBOX_DOCKER_RUNTIME=runsc (gVisor), which gives each container its own user-space kernel.
 * In production the worker refuses to start without it unless SANDBOX_ALLOW_RUNC=1 records that an
 * administrator accepted the weaker isolation.
 *
 * NOTE: written for Linux hosts with Docker; it could not be exercised on the Windows machine this
 * was built on (no Docker there). Verify with `npx vitest run tests/sandbox-docker.test.ts` on the
 * Docker host before launch (see docs/DEPLOYMENT.md).
 */
import fs from "node:fs";
import crypto from "node:crypto";
import { execFile } from "node:child_process";
import { EXECUTION_LIMITS, type RunResult } from "../../../src/server/execution/protocol";
import type { CompileResult, RunLimits, SandboxBackend } from "./types";
import { runCaptured, type CapturedRun } from "./proc";
import { describeExit, describePythonExit } from "./exit-codes";

const IMAGE = process.env.SANDBOX_DOCKER_IMAGE || "gcc:14";
const PY_IMAGE = process.env.SANDBOX_DOCKER_PYTHON_IMAGE || "python:3.12-slim";
const RUNTIME = process.env.SANDBOX_DOCKER_RUNTIME || "";

const HARDENING = [
  ...(RUNTIME ? ["--runtime", RUNTIME] : []),
  "--network", "none", "--read-only", "--cap-drop", "ALL", "--security-opt", "no-new-privileges",
  "--user", "65534:65534", "--cpus", "1", "--ipc", "none", "--log-driver", "none",
  "--ulimit", "nofile=64:64", "--ulimit", "fsize=1048576", "--ulimit", "core=0",
];

/**
 * Process limit per container. Under gVisor the host pids cgroup also counts gVisor's own sentry
 * threads, which need more than a handful: with a limit of 8 the sandbox can't even start
 * ("fork/exec gvisor-sentry-prewarmer: resource temporarily unavailable", verified on Ubuntu 24.04).
 * Student programs never run as host processes there, so fork bombs stay bounded by the memory
 * and time limits (tests/sandbox-docker.test.ts checks this on the server).
 */
const RUNSC_MIN_PIDS = 64;
const pids = (n: number) => String(RUNTIME === "runsc" ? Math.max(n, RUNSC_MIN_PIDS) : n);

function dockerKill(name: string) {
  execFile("docker", ["kill", name], () => undefined);
}

function imageExists(image: string): Promise<boolean> {
  return new Promise((resolve) => execFile("docker", ["image", "inspect", image], (err) => resolve(!err)));
}

/** Turns a finished container run into a RunResult (137/124 = killed by `timeout` or the OOM killer). */
function classify(res: CapturedRun, id: string, name: string, seconds: number, describe: (code: number, stderr: string) => string): RunResult {
  const base = { id, stdout: res.stdout, stderr: res.stderr };
  if (res.outputLimitHit) {
    dockerKill(name);
    return { ...base, status: "output_limit", exitCode: null, detail: "The program printed too much output.", timeMs: res.wallMs };
  }
  if (res.killedByGuard || res.code === 137 || res.code === 124) {
    // Distinguish a timeout from the OOM killer by elapsed time.
    const timedOut = res.killedByGuard || res.wallMs >= seconds * 1000;
    return {
      ...base, status: timedOut ? "time_limit" : "memory_limit", exitCode: res.code,
      detail: timedOut ? "The program ran too long and was stopped." : "The program used too much memory.", timeMs: res.wallMs,
    };
  }
  if (res.code !== 0) return { ...base, status: "runtime_error", exitCode: res.code, detail: describe(res.code ?? -1, res.stderr), timeMs: res.wallMs };
  return { ...base, status: "ok", exitCode: 0, detail: null, timeMs: res.wallMs };
}

export function createDockerBackend(): SandboxBackend {
  let pythonVersion: string | null = null;
  const python = ["python", "-S", "-B", "-X", "utf8", "/box/harness.py"];

  return {
    id: "docker",
    isolation: `Container per run${RUNTIME ? ` (runtime: ${RUNTIME})` : " (runc — shared kernel)"}: no network, read-only filesystem, no capabilities, unprivileged user, pid/memory/CPU/time limits.`,
    production: true,
    compiler: `${IMAGE} g++`,
    get python() {
      return pythonVersion;
    },

    async init() {
      if (process.env.NODE_ENV === "production" && RUNTIME !== "runsc" && process.env.SANDBOX_ALLOW_RUNC !== "1") {
        throw new Error("Refusing to start: set SANDBOX_DOCKER_RUNTIME=runsc (gVisor) for public use, or SANDBOX_ALLOW_RUNC=1 to accept plain Docker isolation.");
      }
      if (!(await imageExists(IMAGE))) throw new Error(`Docker image ${IMAGE} is not available (docker pull ${IMAGE}).`);
      if (await imageExists(PY_IMAGE)) {
        const res = await runCaptured("docker", ["run", "--rm", ...HARDENING, "--memory", "128m", PY_IMAGE, "python", "-S", "-c", "import sys;print('%d.%d.%d' % sys.version_info[:3])"], {
          input: "", env: process.env, cwd: process.cwd(), maxStdout: 256, maxStderr: 1024, guardMs: 30_000,
        });
        pythonVersion = res.code === 0 ? res.stdout.trim() : null;
      }
      if (!pythonVersion) console.warn(`[sandbox] Python image ${PY_IMAGE} unavailable (docker pull ${PY_IMAGE}) — Python code can't run.`);
    },

    async compile(dir: string): Promise<CompileResult> {
      fs.chmodSync(dir, 0o777);
      const name = `cmk-c-${crypto.randomBytes(6).toString("hex")}`;
      const res = await runCaptured("docker", [
        "run", "--rm", "--name", name, ...HARDENING, "--memory", "1g", "--memory-swap", "1g", "--pids-limit", pids(64),
        "--tmpfs", "/tmp:rw,exec,size=128m", "-v", `${dir}:/box`, "-w", "/box", IMAGE,
        "timeout", "-s", "KILL", "30", "g++", "-std=c++20", "-O2", "-pipe", "-fno-asm", "-fmax-errors=5",
        "-fdiagnostics-color=never", "-o", "main", "main.cpp",
      ], { input: "", env: process.env, cwd: dir, maxStdout: 16 * 1024, maxStderr: 16 * 1024, guardMs: 40_000, onTimeout: () => dockerKill(name) });
      return { ok: res.code === 0 && fs.existsSync(`${dir}/main`), output: `${res.stdout}${res.stderr}` };
    },

    async run(dir: string, input: string, limits: RunLimits, id: string): Promise<RunResult> {
      const name = `cmk-r-${crypto.randomBytes(6).toString("hex")}`;
      const seconds = Math.max(1, Math.ceil(limits.timeMs / 1000));
      const res = await runCaptured("docker", [
        "run", "--rm", "-i", "--name", name, ...HARDENING, "--memory", `${limits.memoryMb}m`, "--memory-swap", `${limits.memoryMb}m`,
        "--pids-limit", pids(8), "-v", `${dir}:/box:ro`, "-w", "/box", IMAGE, "timeout", "-s", "KILL", String(seconds), "/box/main",
      ], {
        input, env: process.env, cwd: dir, maxStdout: limits.maxOutputBytes, maxStderr: limits.maxStderrBytes,
        guardMs: limits.timeMs + 10_000, onTimeout: () => dockerKill(name),
      });
      return classify(res, id, name, seconds, (code) => describeExit(code));
    },

    async checkPython(dir: string): Promise<CompileResult> {
      if (!pythonVersion) return { ok: false, output: "Python isn't installed on this code runner." };
      fs.chmodSync(dir, 0o755);
      const name = `cmk-p-${crypto.randomBytes(6).toString("hex")}`;
      const res = await runCaptured("docker", [
        "run", "--rm", "--name", name, ...HARDENING, "--memory", "256m", "--memory-swap", "256m", "--pids-limit", pids(16),
        "-v", `${dir}:/box:ro`, "--tmpfs", "/work:rw,size=4m,mode=1777", "-w", "/work", PY_IMAGE,
        "timeout", "-s", "KILL", "10", ...python, "check", "/box",
      ], { input: "", env: process.env, cwd: dir, maxStdout: 16 * 1024, maxStderr: 16 * 1024, guardMs: 30_000, onTimeout: () => dockerKill(name) });
      if (res.code === 0) return { ok: true, output: res.stderr };
      return { ok: false, output: res.code === 1 ? res.stderr : "Checking the program took too long and was stopped." };
    },

    async runPython(dir: string, input: string, limits: RunLimits, id: string, mode: "run" | "trace"): Promise<RunResult> {
      if (!pythonVersion) throw new Error("Python isn't installed on this code runner.");
      const name = `cmk-py-${crypto.randomBytes(6).toString("hex")}`;
      const seconds = Math.max(1, Math.ceil(limits.timeMs / 1000));
      const res = await runCaptured("docker", [
        "run", "--rm", "-i", "--name", name, ...HARDENING, "--memory", `${limits.memoryMb}m`, "--memory-swap", `${limits.memoryMb}m`,
        // Threads count against the pids limit on Linux; concurrency lessons start a few.
        "--pids-limit", pids(32), "-e", "PYTHONHASHSEED=0", "-v", `${dir}:/box:ro`, "--tmpfs", "/work:rw,size=16m,mode=1777", "-w", "/work",
        PY_IMAGE, "timeout", "-s", "KILL", String(seconds), ...python, mode, "/box",
      ], {
        input, env: process.env, cwd: dir, maxStdout: mode === "trace" ? EXECUTION_LIMITS.maxTraceBytes : limits.maxOutputBytes,
        maxStderr: limits.maxStderrBytes, guardMs: limits.timeMs + 10_000, onTimeout: () => dockerKill(name),
      });
      return classify(res, id, name, seconds, describePythonExit);
    },
  };
}
