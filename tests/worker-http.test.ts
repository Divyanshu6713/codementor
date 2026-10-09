/**
 * The sandbox worker as a real separate process over HTTP: authentication, request validation,
 * and behaviour under many simultaneous requests (bounded concurrency + bounded queue → "busy",
 * never a pile-up). Uses the Windows development backend, so it runs only where that exists.
 */
import { spawn, type ChildProcess } from "node:child_process";
import crypto from "node:crypto";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { canExecute } from "./helpers";

const PORT = 34000 + Math.floor(Math.random() * 1000);
const BASE = `http://127.0.0.1:${PORT}`;
const TOKEN = crypto.randomBytes(24).toString("base64url");
let worker: ChildProcess;

const busyProgram = `#include <iostream>
int main() { volatile long long x = 0; for (long long i = 0; i < 300000000LL; i++) x += i; std::cout << "done"; return 0; }`;

async function execute(source: string, token = TOKEN) {
  const res = await fetch(`${BASE}/v1/execute`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify({ language: "cpp", source, tests: [{ id: "t0", input: "" }] }),
  });
  return { status: res.status, body: (await res.json()) as Record<string, unknown> };
}

describe.runIf(canExecute)("sandbox worker over HTTP", () => {
  beforeAll(async () => {
    worker = spawn(process.execPath, ["--import", "tsx", path.join("worker", "sandbox", "server.ts")], {
      env: { ...process.env, NODE_ENV: "development", SANDBOX_PORT: String(PORT), SANDBOX_TOKEN: TOKEN, SANDBOX_CONCURRENCY: "2", SANDBOX_MAX_QUEUE: "2", SANDBOX_BACKEND: "windows-job" },
      stdio: "ignore",
    });
    for (let i = 0; i < 120; i++) {
      try {
        if ((await fetch(`${BASE}/health`)).ok) return;
      } catch {
        /* not up yet */
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    throw new Error("worker did not start");
  }, 90_000);

  afterAll(() => {
    if (worker?.pid) spawn("taskkill", ["/pid", String(worker.pid), "/T", "/F"], { stdio: "ignore" });
  });

  it("reports health without exposing secrets", async () => {
    const h = await (await fetch(`${BASE}/health`)).json();
    expect(h).toMatchObject({ ok: true, backend: "windows-job", production: false });
    expect(JSON.stringify(h)).not.toContain(TOKEN);
  });

  it("refuses requests without the shared token", async () => {
    expect((await execute("int main(){}", "wrong-token-wrong-token-xx")).status).toBe(401);
  });

  it("rejects malformed requests", async () => {
    const res = await fetch(`${BASE}/v1/execute`, { method: "POST", headers: { authorization: `Bearer ${TOKEN}`, "content-type": "application/json" }, body: "{\"language\":\"python\"}" });
    expect(res.status).toBe(400);
  });

  it("handles many simultaneous requests: runs what fits, turns the rest away as busy", async () => {
    const results = await Promise.all(Array.from({ length: 8 }, () => execute(busyProgram)));
    const ok = results.filter((r) => r.status === 200);
    const busy = results.filter((r) => r.status === 503);
    // 2 running + 2 queued can be accepted; everything else must be refused immediately.
    expect(ok.length).toBeGreaterThanOrEqual(2);
    expect(ok.length).toBeLessThanOrEqual(4);
    expect(ok.length + busy.length).toBe(8);
    for (const r of ok) expect((r.body.tests as { status: string }[])[0].status).toMatch(/ok|time_limit/);
    // And the worker is still healthy afterwards.
    expect((await fetch(`${BASE}/health`)).ok).toBe(true);
  }, 120_000);
});
