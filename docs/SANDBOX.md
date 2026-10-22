# Safe code execution

Student code is untrusted. It never runs inside the Next.js process or on managed (shared) hosting.

```
Browser ──HTTPS──▶ Next.js web app ──HTTP + bearer token (127.0.0.1)──▶ sandbox worker ──▶ one throw-away container per compile / per test
                   (no compiler)                                        (worker/sandbox)      (docker + gVisor)
```

## Layers
1. **Web app gate** (`src/server/execution/providers.ts`)
   - Source ≤ 64 KB, stdin ≤ 16 KB, request bodies size-checked; per-student rate limit on runs/checks.
   - Bounded concurrency + queue per web instance (`EXECUTION_MAX_CONCURRENT`, `EXECUTION_MAX_QUEUED`); overflow → "busy", never a pile-up.
   - **Production safety gate:** code runs only if `EXECUTION_PUBLIC_ENABLED=true` *and* the worker reports a production backend. A development sandbox is never used in production. When off, the UI says "Running code isn't available right now" — nothing is simulated.
2. **Worker** (`worker/sandbox/server.ts`) — a separate process holding only `SANDBOX_TOKEN`
   - Binds to `127.0.0.1` by default; constant-time token check; zod-validated requests; ≤ 20 tests per request.
   - Its own concurrency limit and bounded queue (`SANDBOX_CONCURRENCY`, `SANDBOX_MAX_QUEUE`) → HTTP 503 when full.
3. **Source policy** (`worker/sandbox/policy.ts`) — first line of defence, not relied on alone
   - Header allow-list; no quoted includes, `#embed`, `#define`, trigraphs/digraphs, line splices; banned identifiers for files, processes, sockets, threads, environment, inline asm.
4. **Isolation backend**
   - `docker` (production): one container per compile and per test; `--network none`, read-only root, `--cap-drop ALL`, `no-new-privileges`, uid 65534, `--pids-limit` (fork bombs), memory = swap limit, 1 CPU, `--ipc none`, `--log-driver none`, nofile/fsize/core ulimits, hard kill on timeout, program mounted read-only for runs. **gVisor (`runsc`) required in production** unless `SANDBOX_ALLOW_RUNC=1`.
   - `windows-job` (development only): job object (memory, CPU, wall time, one process), low-integrity token, empty environment. **No network isolation** → refuses to start in production.
5. **Limits per run** (`src/server/execution/protocol.ts`): 2 s CPU default (max 5 s), 256 MB default (max 512 MB), 64 KB stdout, 8 KB stderr; compile limited to 30 s / 1 GB.

## Why the worker gets its own user and host secrets
Controlling Docker is root-equivalent. The worker runs as `cmsandbox` (in the `docker` group) with only `SANDBOX_TOKEN` in its environment — no `DATABASE_URL`, no AI keys — so a worker compromise doesn't hand over student data or paid API keys. On a single VPS this is separation by OS user; a dedicated execution VPS is stronger and recommended before a college-wide rollout.

## Verification status
| Check | Where | Result |
|---|---|---|
| Policy rejections, compile errors, infinite loop, waiting for input, memory, output flood, runtime errors, malformed input, file writes blocked, child processes blocked | `tests/sandbox.test.ts` (windows-job, real g++) | ✅ pass on the dev machine |
| Worker over HTTP: auth, validation, 8 simultaneous requests → bounded accept + 503 busy, healthy afterwards | `tests/worker-http.test.ts` | ✅ pass on the dev machine |
| Docker backend: normal run, infinite loop, memory, fork bomb, **no network**, no writes / no secrets, output flood | `tests/sandbox-docker.test.ts` | ⚠️ **not run** — no Docker on the dev machine. Must pass on the VPS before `EXECUTION_PUBLIC_ENABLED=true` |
| gVisor | VPS | ⚠️ not verified |
