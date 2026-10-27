import type { SandboxBackend } from "./types";
import { createWindowsJobBackend } from "./windows-job";
import { createLocalBackend } from "./local";
import { createDockerBackend } from "./docker";

/** The development backend for this operating system: windows-job on Windows, local on macOS/Linux. */
export function createDevBackend(): SandboxBackend {
  return process.platform === "win32" ? createWindowsJobBackend() : createLocalBackend();
}

/**
 * SANDBOX_BACKEND wins. Otherwise production uses docker and development uses this OS's local
 * backend, so `npm run dev` runs code on Windows, macOS and Linux without Docker.
 */
export function chooseBackend(env: NodeJS.ProcessEnv = process.env): SandboxBackend {
  const wanted = env.SANDBOX_BACKEND || (env.NODE_ENV === "production" ? "docker" : process.platform === "win32" ? "windows-job" : "local");
  if (wanted === "docker") return createDockerBackend();
  if (wanted === "windows-job") return createWindowsJobBackend();
  if (wanted === "local") return createLocalBackend();
  throw new Error(`Unknown SANDBOX_BACKEND "${wanted}". Use "docker", "local" (macOS/Linux dev) or "windows-job" (Windows dev).`);
}
