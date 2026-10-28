# Deploying CodeMentor on Hostinger

CodeMentor has three parts:

| Part | What it needs | Managed Node.js hosting (Business / Cloud) | Hostinger VPS |
|---|---|---|---|
| **Web app** (Next.js 16, Node ≥ 20.9) | a Node.js process | ✅ supported | ✅ |
| **PostgreSQL** (durable progress, XP, quotas, AI spend) | a database server | ❌ PostgreSQL isn't offered on Web/Cloud plans | ✅ |
| **Sandbox worker** (compiles + runs student C++) | Docker (+ gVisor recommended) | ❌ no Docker / no privileged features | ✅ |

What Hostinger documents (checked 2026-10-09; confirm in hPanel, plans change):
- Node.js web apps run on **Business Web Hosting and Cloud Startup/Professional/Enterprise/Enterprise Plus**; runtimes **Node 18, 20, 22, 24** (default 22); deploy from **GitHub** (auto-rebuild on push) or an **archive upload**; environment variables are set in hPanel; build logs and runtime logs are shown. ([Creating a Node.js app](https://docs.hostinger.com/node.js/creating-an-app), [Node.js hosting options](https://www.hostinger.com/support/node-js-hosting-options-at-hostinger/))
- Next.js apps are **always built in standalone mode** (Hostinger overrides `output`), API routes and middleware run at runtime, Node 20+ is required, and only `next.config.js/.mjs/.ts/.mts` are read. ([Hostinger Next.js docs](https://docs.hostinger.com/node.js/overview-1/next))
- The live build lives in `~/domains/<domain>/hbuilds/current` (a symlink that is **replaced on every deploy**) — so nothing that must survive a deploy may be written inside the app folder. ([Creating a Node.js app](https://docs.hostinger.com/node.js/creating-an-app))
- **PostgreSQL is not supported on Web and Cloud plans**; Hostinger recommends a VPS for it. ([Is PostgreSQL supported at Hostinger?](https://www.hostinger.com/support/1583659-is-postgresql-supported-at-hostinger/))
- VPS plans offer an **Ubuntu 24.04 + Docker template** and a Docker Manager. ([Docker VPS template](https://www.hostinger.com/support/8306612-how-to-use-the-docker-vps-template/), [Docker Manager](https://www.hostinger.com/support/12040789-hostinger-docker-manager-for-vps-simplify-your-container-deployments/))

**Consequence:** the safe code runner and PostgreSQL need a VPS whichever plan hosts the web app. Two layouts:

- **Option A — everything on one Hostinger VPS (recommended for the pilot).** Simplest and most private: the database and the code runner are reachable only from `127.0.0.1`.
- **Option B — web app on managed Business/Cloud hosting + a VPS for PostgreSQL and the code runner.** Use it if you want Hostinger to run the web process. The VPS services must then be reachable over the internet (TLS + secrets + firewall), which is more to secure.
- **Managed hosting with no VPS** works only for a **private preview**: no code execution (the safety gate keeps it off and the UI says so), and PGlite with `ALLOW_PGLITE_IN_PRODUCTION=true` on a directory **outside** `hbuilds` — not suitable for students.

---

## Option A — single Hostinger VPS

Suggested size for a pilot of a few hundred students: 2 vCPU / 8 GB RAM (each compile uses up to ~1 GB for a moment; `SANDBOX_CONCURRENCY` bounds how many run at once). Start with the **Ubuntu 24.04 + Docker** template.

### Quick start (scripted)

1. In Hostinger's DNS zone editor, point an **A record** for your domain (e.g. `learn.example.com`) at the VPS's IP.
2. Push this repository to a git host the VPS can clone (a private repo works with a deploy key or a token in the URL).
3. On the VPS, as root:
   ```bash
   git clone <your repo> /tmp/codementor && cd /tmp/codementor
   DOMAIN=learn.example.com REPO_URL=<your repo> ADMIN_EMAIL=you@example.com bash deploy/vps/install.sh
   ```
   `install.sh` is idempotent (safe to re-run). It installs Node 22, Docker, **gVisor**, Caddy, a firewall (only SSH/80/443), fail2ban and automatic security updates; creates the `codementor` (web) and `cmsandbox` (code runner) users; generates every secret once into `/etc/codementor/*.env` (mode 640/600); starts PostgreSQL on `127.0.0.1` only; installs the systemd services, the Caddyfile (automatic HTTPS) and the cron jobs; and deploys the first release with `update.sh`.
4. Follow the steps it prints: create the admin account, run the sandbox tests **on the VPS**, then switch execution on, and test a restore.

### Layout on the server

| Path | What |
|---|---|
| `/srv/codementor/repo` | git clone used to fetch new versions |
| `/srv/codementor/releases/<time>-<sha>` | one built release per deploy (the last 3 are kept) |
| `/srv/codementor/current` | symlink to the live release — the services run from here |
| `/srv/codementor/pgdata` | PostgreSQL data (Docker volume) |
| `/srv/codementor/backups` | database dumps |
| `/etc/codementor/web.env` | web app config + secrets (`root:codementor 640`) |
| `/etc/codementor/sandbox.env` | code runner config: **only** `SANDBOX_TOKEN`, no DB/AI secrets (`root:cmsandbox 640`) |
| `/etc/codementor/postgres.env`, `ops.env` | DB password; alert webhook / off-site backup settings (root only) |
| `/etc/cron.d/codementor` | backups, restore test, health checks, guest cleanup |

### Updating and rolling back

```bash
sudo bash /srv/codementor/current/deploy/vps/update.sh              # deploy the branch's latest commit
sudo REF=v1.2.0 bash /srv/codementor/current/deploy/vps/update.sh   # deploy a tag or commit
sudo bash /srv/codementor/current/deploy/vps/update.sh --rollback   # back to the previous release
```
An update builds the new release in its own folder while the old one keeps serving, **backs up the database**, runs migrations, switches the symlink, restarts and checks `/api/health`. If the check fails it switches back automatically. Migrations only ever add things, so rolling back the code is safe.

### Backups, restore tests and monitoring (set up by install.sh)

- **Nightly backup** at 02:30 (`backup-postgres.sh`): a `pg_dump` that is verified with `pg_restore --list` before it's kept; 14 days retained; also before every update. **Copy dumps off the VPS**: install and configure `rclone`, then set `RCLONE_REMOTE=` in `/etc/codementor/ops.env` (Backblaze B2, Google Drive, S3 …). Hostinger's weekly VPS snapshots are a second layer, not a replacement.
- **Restore test** monthly (`restore-test.sh`): restores the newest dump into a throw-away database and checks it. Run it by hand once before launch.
- **Health checks** every 5 minutes (`healthcheck.sh`): local and public `/api/health`, the code runner, disk (< 85 %), memory, and "a backup succeeded in the last 26 h". Problems go to `/var/log/codementor/health.log` and, if `ALERT_WEBHOOK_URL` is set in `ops.env`, to your phone — an [ntfy](https://ntfy.sh) topic URL, or a Slack/Discord incoming webhook. One alert per problem per hour, plus a "recovered" message.
- Also add an external uptime monitor (e.g. UptimeRobot) on `https://<domain>/api/health` — it catches the case where the whole VPS is down and can't alert you itself.
- Logs: `journalctl -u codementor-web -f`, `journalctl -u codementor-sandbox -f` (structured JSON; no student code or AI text), `/var/log/caddy/codementor.log`.

> These scripts were checked with `bash -n`, and the backup, restore-test and health-check scripts were run against PostgreSQL 16 in Docker; the systemd/Caddy/gVisor parts can only be exercised on a real VPS — read the output of the first `install.sh` run.

### Manual setup (what install.sh does, step by step)

#### 1. Base system
```bash
apt update && apt upgrade -y
apt install -y git curl ufw caddy jq fail2ban unattended-upgrades
curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt install -y nodejs   # Node 22 LTS
ufw default deny incoming && ufw allow OpenSSH && ufw allow 80,443/tcp && ufw enable
adduser --system --group --home /srv/codementor codementor          # runs the web app
adduser --system --group --no-create-home cmsandbox                 # runs the code runner (docker group, no app secrets)
usermod -aG docker cmsandbox
mkdir -p /etc/codementor /srv/codementor/{releases,backups,pgdata} && chown codementor:codementor /srv/codementor
```

#### 2. gVisor (strongly recommended isolation for untrusted code)
Install `runsc` from gVisor's apt repository, register it with Docker (`runsc install` adds the `runsc` runtime to `/etc/docker/daemon.json`) and `systemctl restart docker`. Check: `docker run --rm --runtime=runsc hello-world`. Pull the compiler image once: `docker pull gcc:14` (pin its digest in `SANDBOX_DOCKER_IMAGE` for reproducibility).

#### 3. PostgreSQL
```bash
echo "POSTGRES_PASSWORD=$(openssl rand -base64 24)" > /etc/codementor/postgres.env && chmod 600 /etc/codementor/postgres.env
sudo -u codementor git clone <your repo> /srv/codementor/repo
docker compose -p codementor -f /srv/codementor/repo/deploy/vps/docker-compose.postgres.yml --env-file /etc/codementor/postgres.env up -d
```
It listens on `127.0.0.1:5432` only. Data lives in `/srv/codementor/pgdata`.

#### 4. Configuration
Create `/etc/codementor/web.env` (`chmod 640`, `chown root:codementor`) from `.env.example`:
```
NODE_ENV=production
HOSTNAME=127.0.0.1
PORT=3000
TRUST_PROXY=true
DATABASE_URL=postgres://codementor:<password from postgres.env>@127.0.0.1:5432/codementor
GUEST_SECRET=<32+ random chars>
EXECUTION_PROVIDER=sandbox-worker
SANDBOX_URL=http://127.0.0.1:3410
SANDBOX_TOKEN=<32+ random chars>
EXECUTION_PUBLIC_ENABLED=false        # turn on only after the launch checks
AI_PROVIDER=curated                   # see docs/AI-AND-COSTS.md before enabling AI
```
Create `/etc/codementor/sandbox.env` (`chmod 640`, `chown root:cmsandbox`) — **only** what the runner needs:
```
NODE_ENV=production
SANDBOX_HOST=127.0.0.1
SANDBOX_PORT=3410
SANDBOX_TOKEN=<same token>
SANDBOX_BACKEND=docker
SANDBOX_DOCKER_RUNTIME=runsc
SANDBOX_DOCKER_IMAGE=gcc:14
SANDBOX_CONCURRENCY=2
SANDBOX_MAX_QUEUE=16
```

#### 5. Build, migrate, start
```bash
cp deploy/vps/codementor-web.service deploy/vps/codementor-sandbox.service /etc/systemd/system/
cp deploy/vps/codementor.cron /etc/cron.d/codementor
sed "s/codementor.example.com/<your-domain>/; s/admin@example.com/<your-email>/" deploy/vps/Caddyfile > /etc/caddy/Caddyfile
systemctl daemon-reload && systemctl enable codementor-sandbox codementor-web
bash /srv/codementor/repo/deploy/vps/update.sh      # builds a release, migrates, switches /srv/codementor/current, starts
systemctl reload caddy
curl -s https://<your-domain>/api/health
```

#### 6. Verify the sandbox on this host, then open execution
```bash
cd /srv/codementor/current && sudo -u cmsandbox env SANDBOX_DOCKER_RUNTIME=runsc npx vitest run tests/sandbox-docker.test.ts
```
All tests must **run and pass** (if they show as skipped, Docker wasn't reachable). Then set `EXECUTION_PUBLIC_ENABLED=true` in `web.env` and `systemctl restart codementor-web`.

#### 7. Accounts and recovery
- Admin: `cd /srv/codementor/current && sudo -u codementor bash -c 'set -a; . /etc/codementor/web.env; npm run admin:create'` — the password is written to `.data/admin-account.json` in the release folder; read it, sign in, change it under the console's *Password and recovery* card, make a recovery code, then delete the file.
- Students and parents who forget a password use their **recovery code** at `/forgot`. If they lost that too, a linked parent (parent dashboard) or an admin (console → *Account recovery*) can create a one-time reset link valid for 24 hours. There is no email; nothing is sent anywhere.
- Abandoned guest accounts are cleaned weekly by cron (`npm run cleanup:guests -- --confirm`); run it once without `--confirm` first to see what it would delete.

---

## Option B — managed Node.js hosting + VPS

### Web app on Business/Cloud hosting
1. hPanel → Websites → Add website → **Node.js web app** → import the GitHub repository (or upload a `.zip` without `node_modules`/`.git`).
2. Build settings: framework **Next.js**, Node **22**, build command `build` (`npm run build`), output directory `.next`. Hostinger builds standalone and starts the server with the platform port — don't hardcode a port (`npm start` = `next start`, which reads `PORT`).
3. Environment variables (hPanel): as in `web.env` above, except `DATABASE_URL=postgres://…@<vps-host>:5432/codementor` with `DATABASE_SSL=require`, `SANDBOX_URL=https://runner.<your-domain>` and **no** `HOSTNAME`. `AUTO_MIGRATE=true` (runs migrations on first request after a deploy; there is no separate release step).
4. Do not set `ALLOW_PGLITE_IN_PRODUCTION` — the build folder is replaced on every deploy.

### VPS for PostgreSQL and the runner
- PostgreSQL must accept remote connections: bind to the VPS's public interface, require TLS (`ssl=on` with a certificate), use a strong password, and in `ufw` allow 5432 **only from the managed host's outbound IP** (ask Hostinger support for it; if it isn't fixed, this option is weaker — prefer Option A).
- The runner stays on `127.0.0.1:3410`; expose it via Caddy on `runner.<your-domain>` with HTTPS, and restrict by source IP the same way. The bearer `SANDBOX_TOKEN` is required on every request.
- Everything else (gVisor, sandbox tests, backups) as in Option A.

---

## Production rules this app enforces
- `next dev` is never the public server: the services run `server.js` from the production build.
- Without `DATABASE_URL` the app refuses to start in production (PGlite is for development).
- Without `EXECUTION_PUBLIC_ENABLED=true` **and** a worker reporting a production backend, no student code runs; the UI says so instead of faking output.
- The Docker backend refuses to start in production without gVisor (`SANDBOX_DOCKER_RUNTIME=runsc`) unless `SANDBOX_ALLOW_RUNC=1` records an explicit decision to accept plain Docker isolation.
- Without `GUEST_SECRET` in production, paid AI stays off (quotas can't be keyed).
