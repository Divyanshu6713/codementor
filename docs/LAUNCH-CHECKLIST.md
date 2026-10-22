# Launch checklist (GO / NO-GO)

Nothing here has been deployed publicly. Current status: **ready for private testing on a VPS; NOT yet ready for students** — the production sandbox and real AI calls are unverified.

## 1. Private testing (you + a few testers)
- [ ] VPS set up per `DEPLOYMENT-HOSTINGER.md` (Option A), HTTPS working, ports 3410/5432 not reachable from outside (`nmap` from another machine).
- [ ] `DATABASE_URL` set; `npm run db:migrate` ran; `/api/health` → `ok: true`.
- [ ] `GUEST_SECRET`, `SANDBOX_TOKEN` are long random values; `/etc/codementor/*.env` not world-readable; sandbox env holds no DB/AI secrets.
- [ ] `AI_PROVIDER=curated` (or AI enabled with a small budget, e.g. $5).
- [ ] Code execution may stay off; the UI says so.
**GO** when all ticked.

## 2. Small student pilot (~20–50 students)
- [ ] `tests/sandbox-docker.test.ts` **runs and passes** on the VPS with gVisor (not skipped).
- [ ] `EXECUTION_PUBLIC_ENABLED=true`; a lesson exercise passes end to end on the server.
- [ ] Manual abuse check on the server: infinite loop, fork bomb, 1 GB allocation, output flood, `#include <fstream>` → all contained; the site stays responsive.
- [ ] If AI is on: one real request per mentor mode; `/admin` shows spend; budget set; daily limit 10; a deliberately exhausted budget falls back to built-in help.
- [ ] `TRUST_PROXY=true` behind Caddy; rate limits verified from two networks.
- [ ] Nightly backup running **and one restore tested**.
- [ ] Uptime monitor on `/api/health`; someone reads `journalctl` daily during the pilot.
- [ ] Privacy page reviewed; no claim of IIIT Dharwad endorsement unless permission is obtained.
**GO** when all ticked. Watch: sandbox queue "busy" responses, CPU/RAM, AI spend per day.

## 3. Wider college rollout (hundreds of students)
- [ ] Pilot ran ≥ 2 weeks without data loss or sandbox incidents.
- [ ] Load test of `/api/code/run` and `/api/lessons/check` at expected peak (e.g. a lab of 60 pressing Check together); `SANDBOX_CONCURRENCY` / VPS size tuned; 95th-percentile check time acceptable.
- [ ] Sandbox worker on its own VPS (recommended) so a runner compromise can't reach the database.
- [ ] One web process (AI budget reservation is per process) or accept the documented overshoot bound.
- [ ] `npm run cleanup:guests` scheduled (dry run reviewed first).
- [ ] Content for Modules 4–7 reviewed with the same compiler-verified tests before it's shown.
**GO** only when all ticked.
