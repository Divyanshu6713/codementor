import { spawn } from "node:child_process";

export interface CapturedRun {
  stdout: string;
  stderr: string;
  code: number | null;
  /** The signal that ended the process (POSIX), e.g. "SIGSEGV". */
  signal: NodeJS.Signals | null;
  outputLimitHit: boolean;
  killedByGuard: boolean;
  wallMs: number;
}

/**
 * Spawns a process, writes `input` to stdin, and captures output up to hard caps.
 * Exceeding the stdout cap kills the process immediately (the job object then kills the program).
 * `guardMs` is a last-resort wall clock in case the backend's own timeout fails.
 */
export function runCaptured(cmd: string, args: string[], opts: {
  input: string; env: Record<string, string | undefined>; cwd: string; maxStdout: number; maxStderr: number; guardMs: number;
  onTimeout?: () => void;
}): Promise<CapturedRun> {
  return new Promise((resolve) => {
    const started = Date.now();
    const child = spawn(cmd, args, { cwd: opts.cwd, env: opts.env as NodeJS.ProcessEnv, windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
    const out: Buffer[] = [];
    const err: Buffer[] = [];
    let outBytes = 0;
    let errBytes = 0;
    let outputLimitHit = false;
    let killedByGuard = false;
    let settled = false;

    const kill = () => {
      try {
        child.kill("SIGKILL");
      } catch {
        /* already gone */
      }
    };
    const guard = setTimeout(() => {
      killedByGuard = true;
      opts.onTimeout?.();
      kill();
    }, opts.guardMs);

    child.stdout.on("data", (chunk: Buffer) => {
      if (outputLimitHit) return;
      outBytes += chunk.length;
      if (outBytes > opts.maxStdout) {
        outputLimitHit = true;
        out.push(chunk.subarray(0, Math.max(0, chunk.length - (outBytes - opts.maxStdout))));
        kill();
        return;
      }
      out.push(chunk);
    });
    child.stderr.on("data", (chunk: Buffer) => {
      if (errBytes >= opts.maxStderr) return;
      errBytes += chunk.length;
      err.push(chunk.subarray(0, Math.max(0, chunk.length - Math.max(0, errBytes - opts.maxStderr))));
    });
    child.stdin.on("error", () => {
      /* program exited before reading all input — fine */
    });
    child.stdin.end(opts.input);

    const finish = (code: number | null, signal: NodeJS.Signals | null = null) => {
      if (settled) return;
      settled = true;
      clearTimeout(guard);
      resolve({
        stdout: Buffer.concat(out).toString("utf8"),
        stderr: Buffer.concat(err).toString("utf8"),
        code, signal, outputLimitHit, killedByGuard, wallMs: Date.now() - started,
      });
    };
    child.on("close", (code, signal) => finish(code, signal));
    child.on("error", () => finish(null));
  });
}
