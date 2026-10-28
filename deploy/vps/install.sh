#!/usr/bin/env bash
# One-time setup of CodeMentor on a fresh Hostinger VPS (Ubuntu 24.04 + Docker template).
#
#   sudo DOMAIN=learn.example.com REPO_URL=https://github.com/you/codementor.git \
#        ADMIN_EMAIL=you@example.com bash deploy/vps/install.sh
#
# Safe to re-run: every step checks whether it's already done. Secrets are generated once and kept
# in /etc/codementor (never in the repo). Code execution stays OFF until you have run the sandbox
# tests on this machine (the script prints the command) and switched it on yourself.
#
# Optional: BRANCH=main, SKIP_GVISOR=1 (not recommended), SANDBOX_CONCURRENCY=2, ALERT_WEBHOOK_URL=…
set -euo pipefail

DOMAIN=${DOMAIN:?set DOMAIN, e.g. DOMAIN=learn.example.com}
REPO_URL=${REPO_URL:?set REPO_URL to your git repository}
ADMIN_EMAIL=${ADMIN_EMAIL:?set ADMIN_EMAIL (used for Let\'s Encrypt notices)}
BRANCH=${BRANCH:-main}
CONCURRENCY=${SANDBOX_CONCURRENCY:-2}
ROOT=/srv/codementor
ETC=/etc/codementor

log() { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
need_root() { [ "$(id -u)" -eq 0 ] || { echo "Run as root (sudo)." >&2; exit 1; }; }
rand() { openssl rand -base64 48 | tr -dc 'A-Za-z0-9' | head -c "${1:-40}"; }
need_root

log "Base packages, firewall and automatic security updates"
export DEBIAN_FRONTEND=noninteractive
apt-get update -q
apt-get install -y -q git curl ca-certificates gnupg ufw unattended-upgrades fail2ban jq debian-keyring debian-archive-keyring apt-transport-https
dpkg-reconfigure -f noninteractive unattended-upgrades >/dev/null
ufw default deny incoming >/dev/null
ufw default allow outgoing >/dev/null
ufw allow OpenSSH >/dev/null
ufw allow 80/tcp >/dev/null
ufw allow 443/tcp >/dev/null
ufw --force enable >/dev/null
systemctl enable --now fail2ban >/dev/null

log "Node.js 22 LTS"
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 22 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y -q nodejs
fi
node --version

log "Docker"
if ! command -v docker >/dev/null; then
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker

log "gVisor (runsc) — isolation for untrusted student code"
if [ "${SKIP_GVISOR:-0}" != "1" ]; then
  if ! command -v runsc >/dev/null; then
    curl -fsSL https://gvisor.dev/archive.key | gpg --dearmor -o /usr/share/keyrings/gvisor-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/gvisor-archive-keyring.gpg] https://storage.googleapis.com/gvisor/releases release main" > /etc/apt/sources.list.d/gvisor.list
    apt-get update -q && apt-get install -y -q runsc
  fi
  runsc install >/dev/null 2>&1 || true
  systemctl restart docker
  docker run --rm --runtime=runsc hello-world >/dev/null && echo "gVisor works."
else
  echo "Skipping gVisor. The sandbox will refuse to start in production unless SANDBOX_ALLOW_RUNC=1 is set." >&2
fi
docker pull -q gcc:14

log "Caddy (HTTPS reverse proxy)"
if ! command -v caddy >/dev/null; then
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -q && apt-get install -y -q caddy
fi

log "Users and folders"
id codementor >/dev/null 2>&1 || adduser --system --group --home "$ROOT" codementor
id cmsandbox >/dev/null 2>&1 || adduser --system --group --no-create-home cmsandbox
usermod -aG docker cmsandbox
mkdir -p "$ROOT"/{releases,backups,pgdata} "$ETC" /var/log/codementor
chown codementor:codementor "$ROOT" "$ROOT/releases" "$ROOT/backups"
chmod 750 "$ROOT/backups"

log "Source code"
if [ ! -d "$ROOT/repo/.git" ]; then
  sudo -u codementor git clone --branch "$BRANCH" "$REPO_URL" "$ROOT/repo"
fi

log "Secrets (generated once)"
if [ ! -f "$ETC/postgres.env" ]; then
  echo "POSTGRES_PASSWORD=$(rand 32)" > "$ETC/postgres.env"
fi
chmod 600 "$ETC/postgres.env"
# shellcheck disable=SC1091
. "$ETC/postgres.env"
SANDBOX_TOKEN_VALUE=$(grep -s '^SANDBOX_TOKEN=' "$ETC/sandbox.env" | cut -d= -f2- || true)
SANDBOX_TOKEN_VALUE=${SANDBOX_TOKEN_VALUE:-$(rand 48)}
if [ ! -f "$ETC/web.env" ]; then
  cat > "$ETC/web.env" <<EOF
NODE_ENV=production
HOSTNAME=127.0.0.1
PORT=3000
TRUST_PROXY=true
DATABASE_URL=postgres://codementor:${POSTGRES_PASSWORD}@127.0.0.1:5432/codementor
GUEST_SECRET=$(rand 48)
EXECUTION_PROVIDER=sandbox-worker
SANDBOX_URL=http://127.0.0.1:3410
SANDBOX_TOKEN=${SANDBOX_TOKEN_VALUE}
# Turn on only after tests/sandbox-docker.test.ts passes on this machine (see the end of install.sh).
EXECUTION_PUBLIC_ENABLED=false
# Curated hints only. Read docs/AI-AND-COSTS.md before enabling an AI provider.
AI_PROVIDER=curated
EOF
fi
if [ ! -f "$ETC/sandbox.env" ]; then
  cat > "$ETC/sandbox.env" <<EOF
NODE_ENV=production
SANDBOX_HOST=127.0.0.1
SANDBOX_PORT=3410
SANDBOX_TOKEN=${SANDBOX_TOKEN_VALUE}
SANDBOX_BACKEND=docker
SANDBOX_DOCKER_RUNTIME=runsc
SANDBOX_DOCKER_IMAGE=gcc:14
SANDBOX_CONCURRENCY=${CONCURRENCY}
SANDBOX_MAX_QUEUE=16
EOF
fi
if [ ! -f "$ETC/ops.env" ]; then
  cat > "$ETC/ops.env" <<EOF
# Used by healthcheck.sh / backup-postgres.sh (cron). Leave ALERT_WEBHOOK_URL empty for log-only.
DOMAIN=${DOMAIN}
ALERT_WEBHOOK_URL=${ALERT_WEBHOOK_URL:-}
# Optional off-site copies: an rclone remote, e.g. b2:codementor-backups (configure rclone first).
RCLONE_REMOTE=
BACKUP_KEEP_DAYS=14
EOF
fi
chown root:codementor "$ETC/web.env" && chmod 640 "$ETC/web.env"
chown root:cmsandbox "$ETC/sandbox.env" && chmod 640 "$ETC/sandbox.env"
chmod 600 "$ETC/ops.env"

log "PostgreSQL (127.0.0.1 only)"
docker compose -f "$ROOT/repo/deploy/vps/docker-compose.postgres.yml" --env-file "$ETC/postgres.env" -p codementor up -d
for _ in $(seq 1 30); do
  docker compose -p codementor -f "$ROOT/repo/deploy/vps/docker-compose.postgres.yml" exec -T postgres pg_isready -U codementor -d codementor >/dev/null 2>&1 && break
  sleep 2
done

log "Services, HTTPS and scheduled jobs"
install -m 644 "$ROOT/repo/deploy/vps/codementor-web.service" /etc/systemd/system/
install -m 644 "$ROOT/repo/deploy/vps/codementor-sandbox.service" /etc/systemd/system/
sed -e "s/codementor.example.com/${DOMAIN}/" -e "s/admin@example.com/${ADMIN_EMAIL}/" "$ROOT/repo/deploy/vps/Caddyfile" > /etc/caddy/Caddyfile
mkdir -p /var/log/caddy && chown caddy:caddy /var/log/caddy
install -m 644 "$ROOT/repo/deploy/vps/codementor.cron" /etc/cron.d/codementor
systemctl daemon-reload
systemctl enable codementor-web codementor-sandbox >/dev/null

log "First release (build, migrate, start)"
bash "$ROOT/repo/deploy/vps/update.sh"
systemctl reload caddy

cat <<EOF

────────────────────────────────────────────────────────────────────────────
CodeMentor is installed.  https://${DOMAIN}  (DNS A record must point here)

Next steps (in this order):
 1. Create your admin account:
      cd ${ROOT}/current && sudo -u codementor bash -c 'set -a; . ${ETC}/web.env; npm run admin:create'
 2. Verify the sandbox ON THIS MACHINE (all tests must run and pass, not be skipped):
      cd ${ROOT}/current && sudo -u cmsandbox env SANDBOX_DOCKER_RUNTIME=runsc npx vitest run tests/sandbox-docker.test.ts
 3. Then switch code execution on:
      sudo sed -i 's/^EXECUTION_PUBLIC_ENABLED=false/EXECUTION_PUBLIC_ENABLED=true/' ${ETC}/web.env
      sudo systemctl restart codementor-web
 4. Test a restore once:  sudo bash ${ROOT}/current/deploy/vps/restore-test.sh
 5. Optional alerts: set ALERT_WEBHOOK_URL in ${ETC}/ops.env (ntfy, Slack or Discord webhook).
Then work through docs/LAUNCH-CHECKLIST.md.
────────────────────────────────────────────────────────────────────────────
EOF
