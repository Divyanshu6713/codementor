/**
 * Production backend: one throw-away container per compile and per test run.
 *
 * Every container: no network, read-only root filesystem, all capabilities dropped,
 * no-new-privileges, unprivileged user, pids limit (fork bombs), memory + swap limit, one CPU, and
 * a hard kill after the time limit. The program directory is mounted read-only for runs.
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
import type { RunResult } from "../../../src/server/execution/protocol";
import type { CompileResult, RunLimits, SandboxBackend } from "./types";
import { runCaptured } from "./proc";
import { describeExit } from "./exit-codes";

const IMAGE = process.env.SANDBOX_DOCKER_IMAGE || "gcc:14";
const RUNTIME = process.env.SANDBOX_DOCKER_RUNTIME || "";

const HARDENING = [
  ...(RUNTIME ? ["--runtime", RUNTIME] : []),
  "--network", "none", "--read-only", "--cap-drop", "ALL", "--security-opt", "no-new-privileges",
  "--user", "65534:65534", "--cpus", "1", "--ipc", "none", "--log-driver", "none",
  "--ulimit", "nofile=64:64", "--ulimit", "fsize=1048576", "--ulimit", "core=0",
];

function dockerKill(name: string) {
  execFile("docker", ["kill", name], () => undefined);
}

export function createDockerBackend(): SandboxBackend {
  return {
    id: "docker",
    isolation: `Container per run${RUNTIME ? ` (runtime: ${RUNTIME})` : " (runc — shared kernel)"}: no network, read-only filesystem, no capabilities, unprivileged user, pid/memory/CPU/time limits.`,
    production: true,
    compiler: `${IMAGE} g++`,

    async init() {
      if (process.env.NODE_ENV === "production" && RUNTIME !== "runsc" && process.env.SANDBOX_ALLOW_RUNC !== "1") {
        throw new Error("Refusing to start: set SANDBOX_DOCKER_RUNTIME=runsc (gVisor) for public use, or SANDBOX_ALLOW_RUNC=1 to accept plain Docker isolation.");
      }
      await new Promise<void>((resolve, reject) =>
        execFile("docker", ["image", "inspect", IMAGE], (err) => (err ? reject(new Error(`Docker image ${IMAGE} is not available (docker pull ${IMAGE}).`)) : resolve())),
      );
    },

    async compile(dir: string): Promise<CompileResult> {
      fs.chmodSync(dir, 0o777);
      const name = `cmk-c-${crypto.randomBytes(6).toString("hex")}`;
      const res = await runCaptured("docker", [
        "run", "--rm", "--name", name, ...HARDENING, "--memory", "1g", "--memory-swap", "1g", "--pids-limit", "64",
        "--tmpfs", "/tmp:rw,exec,size=128m", "-v", `${dir}:/box`, "-w", "/box", IMAGE,
        "timeout", "-s", "KILL", "30", "g++", "-std=c++17", "-O2", "-pipe", "-fno-asm", "-fmax-errors=5",
        "-fdiagnostics-color=never", "-o", "main", "main.cpp",
      ], { input: "", env: process.env, cwd: dir, maxStdout: 16 * 1024, maxStderr: 16 * 1024, guardMs: 40_000, onTimeout: () => dockerKill(name) });
      return { ok: res.code === 0 && fs.existsSync(`${dir}/main`), output: `${res.stdout}${res.stderr}` };
    },

    async run(dir: string, input: string, limits: RunLimits, id: string): Promise<RunResult> {
      const name = `cmk-r-${crypto.randomBytes(6).toString("hex")}`;
      const seconds = Math.max(1, Math.ceil(limits.timeMs / 1000));
      const res = await runCaptured("docker", [
        "run", "--rm", "-i", "--name", name, ...HARDENING, "--memory", `${limits.memoryMb}m`, "--memory-swap", `${limits.memoryMb}m`,
        "--pids-limit", "8", "-v", `${dir}:/box:ro`, "-w", "/box", IMAGE, "timeout", "-s", "KILL", String(seconds), "/box/main",
      ], {
        input, env: process.env, cwd: dir, maxStdout: limits.maxOutputBytes, maxStderr: limits.maxStderrBytes,
        guardMs: limits.timeMs + 10_000, onTimeout: () => dockerKill(name),
      });
      const base = { id, stdout: res.stdout, stderr: res.stderr };
      if (res.outputLimitHit) {
        dockerKill(name);
        return { ...base, status: "output_limit", exitCode: null, detail: "The program printed too much output.", timeMs: res.wallMs };
      }
      if (res.killedByGuard || res.code === 137 || res.code === 124) {
        // 137 = SIGKILL from `timeout` or the OOM killer; distinguish by elapsed time.
        const timedOut = res.killedByGuard || res.wallMs >= seconds * 1000;
        return {
          ...base, status: timedOut ? "time_limit" : "memory_limit", exitCode: res.code,
          detail: timedOut ? "The program ran too long and was stopped." : "The program used too much memory.", timeMs: res.wallMs,
        };
      }
      if (res.code !== 0) return { ...base, status: "runtime_error", exitCode: res.code, detail: describeExit(res.code ?? -1), timeMs: res.wallMs };
      return { ...base, status: "ok", exitCode: 0, detail: null, timeMs: res.wallMs };
    },
  };
}
