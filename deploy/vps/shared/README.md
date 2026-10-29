# Installing CodeMentor on a server that already runs other apps

Use this when the VPS already hosts something else — for example Kisan Drishti with nginx and
PostgreSQL. For an empty server use [`../install.sh`](../install.sh).

| | `../install.sh` (empty server) | `shared/install-shared.sh` (this folder) |
|---|---|---|
| PostgreSQL | starts its own container on 5432 | uses the existing service: new `codementor` database + login only |
| HTTPS | installs Caddy and writes `/etc/caddy/Caddyfile` | adds one nginx site (`codementor.conf`) + a certbot certificate |
| Firewall | resets ufw to SSH/80/443 | not touched (warns if 443 isn't open) |
| Port clash | — | stops before changing anything |
| Backups | `docker compose exec pg_dump` | `PG_MODE=host` → `pg_dump` as the `postgres` user |

Docker and gVisor are installed only to run student code (no container publishes a port).

## Steps

1. **Check the server (read-only):**
   ```bash
   sudo DOMAIN=codementor.example.com bash deploy/vps/shared/preflight.sh
   ```
2. **DNS:** an A record for the domain must point to the server (preflight shows it).
3. **Install:**
   ```bash
   sudo DOMAIN=codementor.example.com REPO_URL=https://github.com/you/codementor.git ADMIN_EMAIL=you@example.com bash deploy/vps/shared/install-shared.sh
   ```
4. Follow the steps the installer prints: admin account → sandbox tests on the server → switch on
   code execution → first backup + restore test.

## What it creates

- `/srv/codementor` (code and releases), `/etc/codementor/*.env` (secrets, root-readable only)
- users `codementor` (web app) and `cmsandbox` (code runner, no database or AI secrets)
- services `codementor-web` (127.0.0.1:3000) and `codementor-sandbox` (127.0.0.1:3410)
- `/etc/nginx/sites-available/codementor.conf`, `/etc/cron.d/codementor`
- PostgreSQL role and database `codementor` (`REVOKE CONNECT … FROM PUBLIC`)

## Removing it

```bash
sudo systemctl disable --now codementor-web codementor-sandbox
sudo rm /etc/nginx/sites-enabled/codementor.conf /etc/cron.d/codementor && sudo systemctl reload nginx
sudo -u postgres psql -c "DROP DATABASE codementor" -c "DROP ROLE codementor"
```
(Take a backup first if you want to keep the data.)

## Sharing a server: what to know

- Student code runs in gVisor containers with no network, but on the same machine as your other
  apps. Fine for a pilot; for a public launch, move just the sandbox worker to its own small VPS
  (`SANDBOX_URL` + `SANDBOX_TOKEN` in `/etc/codementor/web.env`).
- `cmsandbox` is in the `docker` group, which is root-equivalent: keep the worker bound to
  127.0.0.1 (the default) so only the web app can reach it.
- CPU: each code run gets 1 CPU; `SANDBOX_CONCURRENCY=2` on a 2-CPU server. Heavy jobs of other
  apps (e.g. ML training) will slow code checks down while they run.
