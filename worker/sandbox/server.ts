/**
 * CodeMentor sandbox worker — a separate process from the web app.
 *
 *   POST /v1/execute   (Authorization: Bearer $SANDBOX_TOKEN)  → ExecutionResponse
 *   GET  /health                                                → WorkerHealth
 *
 * Student code never runs inside the web server. This service binds to localhost by default,
 * requires a shared token, validates every request, limits concurrency and queue length, and
 * delegates to an isolation backend (docker in production, windows-job for local development).
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { z } from "zod";
import { EXECUTION_LIMITS, type WorkerHealth } from "../../src/server/execution/protocol";
import { executeRequest } from "./runner";
import type { SandboxBackend } from "./backends/types";
import { createWindowsJobBackend } from "./backends/windows-job";
import { createDockerBackend } from "./backends/docker";

for (const file of [".env.local", ".env"]) {
  const p = path.join(process.cwd(), file);
  if (fs.existsSync(p)) process.loadEnvFile(p);
}

const HOST = process.env.SANDBOX_HOST || "127.0.0.1";
const PORT = Number(process.env.SANDBOX_PORT || 3410);
const TOKEN = process.env.SANDBOX_TOKEN || "";
const CONCURRENCY = Math.max(1, Number(process.env.SANDBOX_CONCURRENCY || 2));
const MAX_QUEUE = Math.max(0, Number(process.env.SANDBOX_MAX_QUEUE || 16));
const IS_PRODUCTION = process.env.NODE_ENV === "production";

const RequestSchema = z.object({
  language: z.literal("cpp"),
  source: z.string().min(1).max(EXECUTION_LIMITS.maxSourceBytes),
  tests: z.array(z.object({ id: z.string().regex(/^[A-Za-z0-9_-]{1,40}$/), input: z.string().max(EXECUTION_LIMITS.maxInputBytes) }))
    .min(1).max(EXECUTION_LIMITS.maxTests),
  limits: z.object({
    timeMs: z.number().int().min(100).max(EXECUTION_LIMITS.maxTimeMs).optional(),
    memoryMb: z.number().int().min(16).max(EXECUTION_LIMITS.maxMemoryMb).optional(),
  }).optional(),
});

function chooseBackend(): SandboxBackend {
  const wanted = process.env.SANDBOX_BACKEND || (process.platform === "win32" ? "windows-job" : "docker");
  if (wanted === "docker") return createDockerBackend();
  if (wanted === "windows-job") return createWindowsJobBackend();
  throw new Error(`Unknown SANDBOX_BACKEND "${wanted}". Use "docker" or "windows-job".`);
}

// ── Concurrency: a tiny semaphore with a bounded queue ──
let running = 0;
const waiting: (() => void)[] = [];
async function withSlot<T>(fn: () => Promise<T>): Promise<T | "busy"> {
  if (running >= CONCURRENCY) {
    if (waiting.length >= MAX_QUEUE) return "busy";
    await new Promise<void>((resolve) => waiting.push(resolve));
  }
  running++;
  try {
    return await fn();
  } finally {
    running--;
    waiting.shift()?.();
  }
}

function send(res: http.ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { "content-type": "application/json", "cache-control": "no-store" });
  res.end(JSON.stringify(body));
}

function authorized(req: http.IncomingMessage) {
  const given = Buffer.from((req.headers.authorization ?? "").replace(/^Bearer\s+/i, ""));
  const expected = Buffer.from(TOKEN);
  return given.length === expected.length && crypto.timingSafeEqual(given, expected);
}

async function readBody(req: http.IncomingMessage, limit: number): Promise<string | null> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > limit) return null;
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export async function main() {
  if (!TOKEN || TOKEN.length < 24) throw new Error("SANDBOX_TOKEN must be set (24+ chars). Run `npm run setup` to create one in .env.local.");
  const backend = chooseBackend();
  if (IS_PRODUCTION && !backend.production && process.env.SANDBOX_ALLOW_DEV_BACKEND !== "1") {
    throw new Error(`The ${backend.id} backend is for local development only. Use SANDBOX_BACKEND=docker in production.`);
  }
  await backend.init();

  const server = http.createServer(async (req, res) => {
    try {
      if (req.method === "GET" && req.url === "/health") {
        const health: WorkerHealth = { ok: true, backend: backend.id, isolation: backend.isolation, production: backend.production, compiler: backend.compiler ? path.basename(backend.compiler) : null };
        return send(res, 200, health);
      }
      if (req.method !== "POST" || req.url !== "/v1/execute") return send(res, 404, { error: "not_found" });
      if (!authorized(req)) return send(res, 401, { error: "unauthorized" });
      const raw = await readBody(req, EXECUTION_LIMITS.maxSourceBytes + EXECUTION_LIMITS.maxTests * EXECUTION_LIMITS.maxInputBytes + 8192);
      if (raw === null) return send(res, 413, { error: "too_large" });
      let parsed;
      try {
        parsed = RequestSchema.parse(JSON.parse(raw));
      } catch {
        return send(res, 400, { error: "invalid_request" });
      }
      const result = await withSlot(() => executeRequest(backend, parsed));
      if (result === "busy") return send(res, 503, { error: "busy" });
      console.log(JSON.stringify({ t: new Date().toISOString(), event: "sandbox.execute", compile: result.compile.status, tests: result.tests.map((t) => t.status), ms: result.durationMs }));
      return send(res, 200, result);
    } catch (err) {
      console.error(JSON.stringify({ t: new Date().toISOString(), event: "sandbox.error", message: (err as Error).message }));
      return send(res, 500, { error: "internal" });
    }
  });
  server.listen(PORT, HOST, () => {
    console.log(`CodeMentor sandbox worker on http://${HOST}:${PORT} — backend: ${backend.id}${backend.production ? "" : " (DEV ONLY)"}`);
  });
}

if (require.main === module) {
  main().catch((err) => {
    console.error(`Sandbox worker failed to start: ${(err as Error).message}`);
    process.exit(1);
  });
}
