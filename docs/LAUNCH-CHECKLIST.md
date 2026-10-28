# Launch checklist (GO / NO-GO)

Nothing here has been deployed publicly. Current status: **ready for private testing on a VPS; NOT yet ready for students** — the production sandbox (Docker + gVisor on the VPS) and real AI calls are unverified on the target machine.

The VPS is set up with `deploy/vps/install.sh` and updated with `deploy/vps/update.sh` (see `DEPLOYMENT-HOSTINGER.md`, Option A).

## 1. Private testing (you + a few testers)
- [ ] `install.sh` ran without errors; `https://<domain>` loads with a valid certificate.
- [ ] Ports 3410 (sandbox) and 5432 (PostgreSQL) are **not** reachable from outside (`nmap -p 3410,5432 <vps-ip>` from another machine shows them filtered/closed).
- [ ] `/api/health` → `ok: true`; `journalctl -u codementor-web` shows no errors.
- [ ] `/etc/codementor/*.env` are not world-readable; `sandbox.env` holds no DB/AI secrets.
- [ ] Admin account created; its password changed; a recovery code made; `.data/admin-account.json` deleted.
- [ ] `AI_PROVIDER=curated` (or AI enabled with a small budget, e.g. $5).
- [ ] Code execution may stay off; the UI says so.
**GO** when all ticked.

## 2. Small student pilot (~20–50 students)
- [ ] `tests/sandbox-docker.test.ts` **runs and passes** on the VPS with gVisor (not skipped).
- [ ] `EXECUTION_PUBLIC_ENABLED=true`; a lesson exercise, a practice problem, a "Complete the code" puzzle and an Arena problem pass end to end on the server.
- [ ] Manual abuse check on the server: infinite loop, fork bomb, 1 GB allocation, output flood, `#include <fstream>` → all contained; the site stays responsive.
- [ ] Account recovery tried once on the server: sign up → save the code → `/forgot` with it; and a reset link from the admin console.
- [ ] If AI is on: one real request per mentor mode; `/admin` shows spend; budget set; daily limit 10; a deliberately exhausted budget falls back to built-in help.
- [ ] `TRUST_PROXY=true` behind Caddy; rate limits verified from two networks.
- [ ] Nightly backup running (`/var/log/codementor/backup.log`), **off-site copy configured** (`RCLONE_REMOTE`), and `restore-test.sh` passed once.
- [ ] Alerts reach you: set `ALERT_WEBHOOK_URL`, stop the web service for 10 minutes, receive the alert and the "recovered" message. External uptime monitor on `/api/health`.
- [ ] `update.sh` and `update.sh --rollback` tried once.
- [ ] Privacy page reviewed; no claim of IIIT Dharwad endorsement unless permission is obtained.
**GO** when all ticked. Watch: sandbox queue "busy" responses, CPU/RAM, AI spend per day.

## 3. Wider college rollout (hundreds of students)
- [ ] Pilot ran ≥ 2 weeks without data loss or sandbox incidents.
- [ ] Load test of `/api/code/run` and `/api/lessons/check` at expected peak (e.g. a lab of 60 pressing Check together); `SANDBOX_CONCURRENCY` / VPS size tuned; 95th-percentile check time acceptable.
- [ ] Sandbox worker on its own VPS (recommended) so a runner compromise can't reach the database.
- [ ] One web process (AI budget reservation is per process) or accept the documented overshoot bound.
- [ ] Guest cleanup cron reviewed (dry run output checked once).
- [ ] A teacher or senior student has reviewed a sample of the 127 lessons for clarity (correctness is already compiler-verified).
**GO** only when all ticked.
