#!/usr/bin/env bash
# Install CodeMentor on a server that ALREADY runs other apps (e.g. Kisan Drishti).
# For an empty server use ../install.sh instead. Differences from that script:
#   - uses the server's existing PostgreSQL: a separate "codementor" database and login
#     (no PostgreSQL container, other databases untouched)
#   - adds ONE nginx site for DOMAIN plus a certbot certificate; other nginx sites are never edited
#   - leaves the firewall alone (only warns if 80/443 aren't open)
#   - stops before changing anything if a port it needs is taken by another program
#
#   sudo DOMAIN=codementor.mtc1.in REPO_URL=https://github.com/Divyanshu6713/codementor.git \
#        ADMIN_EMAIL=you@example.com bash deploy/vps/shared/install-shared.sh
#
# Safe to re-run. Code execution stays OFF until you run the sandbox tests on this machine and
# switch it on yourself (the commands are printed at the end).
# Optional: BRANCH=main, SANDBOX_CONCURRENCY=2, ALERT_WEBHOOK_URL=…, SKIP_CERT=1
set -euo pipefail

DOMAIN=${DOMAIN:?set DOMAIN, e.g. DOMAIN=codementor.mtc1.in}
REPO_URL=${REPO_URL:?set REPO_URL to your git repository}
ADMIN_EMAIL=${ADMIN_EMAIL:?set ADMIN_EMAIL (Let\'s Encrypt expiry notices go here)}
BRANCH=${BRANCH:-main}
CONCURRENCY=${SANDBOX_CONCURRENCY:-2}
WEB_PORT=3000
SANDBOX_PORT=3410
ROOT=/srv/codementor
ETC=/etc/codementor

log() { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33mWARNING: %s\033[0m\n' "$*" >&2; }
die() { printf '\033[1;31mSTOPPED: %s\033[0m\n' "$*" >&2; exit 1; }
rand() { openssl rand -base64 48 | tr -dc 'A-Za-z0-9' | head -c "${1:-40}"; }
port_owner() { ss -tlnpH "sport = :$1" 2>/dev/null | sed -E 's/.*users:\(\("([^"]+)".*/\1/' | sort -u | tr '\n' ' '; }
[ "$(id -u)" -eq 0 ] || die "Run as root (sudo)."

# ── 1. Checks. Nothing is changed until all of these pass. ──────────────────────────────────────
log "Checking the server (nothing changed yet)"
command -v nginx >/dev/null || die "nginx is not installed. This installer adds a site to an existing nginx."
systemctl is-active --quiet nginx || die "nginx is not running."
systemctl is-active --quiet postgresql || die "The PostgreSQL service is not running."
command -v psql >/dev/null || die "psql is not installed."
for p in $WEB_PORT $SANDBOX_PORT; do
  svc=codementor-web; [ "$p" = "$SANDBOX_PORT" ] && svc=codementor-sandbox
  owner=$(port_owner "$p")
  if [ -n "$owner" ] && ! systemctl is-active --quiet "$svc"; then
    die "Port $p is already used by: $owner. CodeMentor needs it — free it first."
  fi
done
DOMAIN_RE=${DOMAIN//./\\.}
if grep -RlsE "server_name[^;]*[[:space:]]${DOMAIN_RE}([[:space:];]|$)" /etc/nginx/sites-enabled/ /etc/nginx/conf.d/ \
     | grep -v '/codementor\.conf$' | grep -q .; then
  die "Another nginx site already uses $DOMAIN. Remove it or pick another DOMAIN."
fi
if command -v ufw >/dev/null && ufw status | grep -q "Status: active"; then
  ufw status | grep -qE '(^| )(443|80,443)(/tcp)? .*ALLOW|Nginx Full.*ALLOW' || warn "ufw is active but 443 doesn't look open; HTTPS may not be reachable."
fi
SERVER_IPS=$(hostname -I)
DNS_IPS=$(getent ahostsv4 "$DOMAIN" 2>/dev/null | awk '{print $1}' | sort -u | tr '\n' ' ')
DNS_OK=0
for ip in $DNS_IPS; do case " $SERVER_IPS " in *" $ip "*) DNS_OK=1 ;; esac; done
if [ "$DNS_OK" != 1 ]; then
  warn "$DOMAIN resolves to '${DNS_IPS:-nothing}', not this server ($SERVER_IPS). Everything else will be set up; the HTTPS certificate will be skipped until DNS is fixed."
fi
echo "Checks passed."

# ── 2. Packages, Docker and gVisor (for the sandbox only). ──────────────────────────────────────
log "Base packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -q
apt-get install -y -q git curl jq ca-certificates gnupg openssl

log "Node.js 22 LTS"
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 22 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y -q nodejs
fi
node --version
[ -x /usr/bin/node ] || die "The services start /usr/bin/node, but Node.js is installed elsewhere ($(command -v node)). Install Node 22 from NodeSource or symlink it to /usr/bin/node."

log "Docker (used only to run student code; no ports are published)"
if ! command -v docker >/dev/null; then
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker

log "gVisor (runsc) — isolation for untrusted student code"
if ! command -v runsc >/dev/null; then
  curl -fsSL https://gvisor.dev/archive.key | gpg --dearmor --yes -o /usr/share/keyrings/gvisor-archive-keyring.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/gvisor-archive-keyring.gpg] https://storage.googleapis.com/gvisor/releases release main" > /etc/apt/sources.list.d/gvisor.list
  apt-get update -q && apt-get install -y -q runsc
fi
if ! docker info --format '{{json .Runtimes}}' 2>/dev/null | grep -q runsc; then
  runsc install >/dev/null 2>&1 || true
  systemctl restart docker
fi
docker run --rm --runtime=runsc hello-world >/dev/null && echo "gVisor works." || die "gVisor test container failed. See https://gvisor.dev/docs/user_guide/install/"
docker pull -q gcc:14
docker pull -q python:3.12-slim

# ── 3. Users, folders, code. ────────────────────────────────────────────────────────────────────
log "Users and folders"
id codementor >/dev/null 2>&1 || adduser --system --group --home "$ROOT" codementor
id cmsandbox >/dev/null 2>&1 || adduser --system --group --no-create-home cmsandbox
usermod -aG docker cmsandbox
mkdir -p "$ROOT"/{releases,backups} "$ETC" /var/log/codementor
chown codementor:codementor "$ROOT" "$ROOT/releases" "$ROOT/backups"
chmod 750 "$ROOT/backups"

log "Source code"
if [ ! -d "$ROOT/repo/.git" ]; then
  sudo -u codementor git clone --branch "$BRANCH" "$REPO_URL" "$ROOT/repo"
fi

# ── 4. PostgreSQL: its own database and login on the existing server. ───────────────────────────
log "PostgreSQL: database 'codementor' with its own login (other databases untouched)"
if [ ! -f "$ETC/postgres.env" ]; then
  echo "POSTGRES_PASSWORD=$(rand 32)" > "$ETC/postgres.env"
fi
chmod 600 "$ETC/postgres.env"
# shellcheck disable=SC1091
. "$ETC/postgres.env"
pgq() { runuser -u postgres -- psql -v ON_ERROR_STOP=1 -qtAX -d postgres -c "$1"; }
# The password goes in through stdin so it never shows up in the process list.
if [ "$(pgq "select 1 from pg_roles where rolname = 'codementor'")" = "1" ]; then
  runuser -u postgres -- psql -v ON_ERROR_STOP=1 -qX -d postgres <<SQL
ALTER ROLE codementor WITH LOGIN PASSWORD '${POSTGRES_PASSWORD}';
SQL
else
  runuser -u postgres -- psql -v ON_ERROR_STOP=1 -qX -d postgres <<SQL
CREATE ROLE codementor WITH LOGIN PASSWORD '${POSTGRES_PASSWORD}';
SQL
fi
if [ "$(pgq "select 1 from pg_database where datname = 'codementor'")" != "1" ]; then
  pgq "CREATE DATABASE codementor OWNER codementor"
fi
pgq "REVOKE CONNECT ON DATABASE codementor FROM PUBLIC"
PGPASSWORD="$POSTGRES_PASSWORD" psql -h 127.0.0.1 -U codementor -d codementor -qtAX -c "select 1" >/dev/null \
  || die "Could not log in to PostgreSQL as 'codementor' over 127.0.0.1. Check /etc/postgresql/*/main/pg_hba.conf has a 'host all all 127.0.0.1/32 scram-sha-256' line."
echo "Database ready."

# ── 5. Configuration (generated once; existing files are kept). ─────────────────────────────────
log "Configuration in $ETC"
SANDBOX_TOKEN_VALUE=$(grep -s '^SANDBOX_TOKEN=' "$ETC/sandbox.env" | cut -d= -f2- || true)
SANDBOX_TOKEN_VALUE=${SANDBOX_TOKEN_VALUE:-$(rand 48)}
if [ ! -f "$ETC/web.env" ]; then
  cat > "$ETC/web.env" <<EOF
NODE_ENV=production
HOSTNAME=127.0.0.1
PORT=${WEB_PORT}
TRUST_PROXY=true
DATABASE_URL=postgres://codementor:${POSTGRES_PASSWORD}@127.0.0.1:5432/codementor
GUEST_SECRET=$(rand 48)
EXECUTION_PROVIDER=sandbox-worker
SANDBOX_URL=http://127.0.0.1:${SANDBOX_PORT}
SANDBOX_TOKEN=${SANDBOX_TOKEN_VALUE}
# Turn on only after tests/sandbox-docker.test.ts passes on this machine (see the end of the install).
EXECUTION_PUBLIC_ENABLED=false
# Curated hints only. Read docs/AI-AND-COSTS.md before enabling an AI provider.
AI_PROVIDER=curated
EOF
fi
if [ ! -f "$ETC/sandbox.env" ]; then
  cat > "$ETC/sandbox.env" <<EOF
NODE_ENV=production
SANDBOX_HOST=127.0.0.1
SANDBOX_PORT=${SANDBOX_PORT}
SANDBOX_TOKEN=${SANDBOX_TOKEN_VALUE}
SANDBOX_BACKEND=docker
SANDBOX_DOCKER_RUNTIME=runsc
SANDBOX_DOCKER_IMAGE=gcc:14
SANDBOX_DOCKER_PYTHON_IMAGE=python:3.12-slim
SANDBOX_CONCURRENCY=${CONCURRENCY}
SANDBOX_MAX_QUEUE=16
EOF
fi
if [ ! -f "$ETC/ops.env" ]; then
  cat > "$ETC/ops.env" <<EOF
# Used by healthcheck.sh / backup-postgres.sh / restore-test.sh (cron).
DOMAIN=${DOMAIN}
# host = the server's own PostgreSQL service (shared install); docker = the compose container.
PG_MODE=host
ALERT_WEBHOOK_URL=${ALERT_WEBHOOK_URL:-}
# Optional off-site copies: an rclone remote, e.g. b2:codementor-backups (configure rclone first).
RCLONE_REMOTE=
BACKUP_KEEP_DAYS=14
EOF
fi
chown root:codementor "$ETC/web.env" && chmod 640 "$ETC/web.env"
chown root:cmsandbox "$ETC/sandbox.env" && chmod 640 "$ETC/sandbox.env"
chmod 600 "$ETC/ops.env"

# ── 6. Services, nginx site, scheduled jobs. ────────────────────────────────────────────────────
log "Services and scheduled jobs"
install -m 644 "$ROOT/repo/deploy/vps/codementor-web.service" /etc/systemd/system/
install -m 644 "$ROOT/repo/deploy/vps/codementor-sandbox.service" /etc/systemd/system/
install -m 644 "$ROOT/repo/deploy/vps/codementor.cron" /etc/cron.d/codementor
systemctl daemon-reload
systemctl enable codementor-web codementor-sandbox >/dev/null

log "First release (build, migrate, start) — this takes a few minutes"
bash "$ROOT/repo/deploy/vps/update.sh"

log "nginx site for $DOMAIN (other sites untouched)"
SITE=/etc/nginx/sites-available/codementor.conf
if [ ! -f "$SITE" ]; then
  sed -e "s/__DOMAIN__/${DOMAIN}/g" -e "s/__PORT__/${WEB_PORT}/g" "$ROOT/repo/deploy/vps/shared/nginx-codementor.conf" > "$SITE"
else
  echo "Keeping the existing $SITE (it may already contain certbot's HTTPS settings)."
fi
ln -sfn "$SITE" /etc/nginx/sites-enabled/codementor.conf
if ! nginx -t 2>/tmp/codementor-nginx-test.log; then
  rm -f /etc/nginx/sites-enabled/codementor.conf
  cat /tmp/codementor-nginx-test.log >&2
  die "nginx rejected the configuration; the CodeMentor site was disabled again and nginx was not reloaded."
fi
systemctl reload nginx

if [ "${SKIP_CERT:-0}" = "1" ]; then
  echo "Skipping the certificate (SKIP_CERT=1)."
elif [ "$DNS_OK" = 1 ]; then
  log "HTTPS certificate (certbot)"
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$ADMIN_EMAIL" --redirect --keep-until-expiring \
    || warn "certbot failed — the site works on http:// for now. Re-run: sudo certbot --nginx -d $DOMAIN"
else
  warn "No certificate yet (DNS doesn't point here). After fixing DNS run: sudo certbot --nginx -d $DOMAIN --redirect"
fi

cat <<EOF

────────────────────────────────────────────────────────────────────────────
CodeMentor is installed next to your other apps.  https://${DOMAIN}

Next steps (in this order):
 1. Create your admin account:
      cd ${ROOT}/current && sudo -u codementor bash -c 'set -a; . ${ETC}/web.env; npm run admin:create'
 2. Verify the sandbox ON THIS MACHINE (all tests must run and pass, not be skipped):
      cd ${ROOT}/current && sudo -u cmsandbox env SANDBOX_DOCKER_RUNTIME=runsc npx vitest run tests/sandbox-docker.test.ts
 3. Then switch code execution on:
      sudo sed -i 's/^EXECUTION_PUBLIC_ENABLED=false/EXECUTION_PUBLIC_ENABLED=true/' ${ETC}/web.env
      sudo systemctl restart codementor-web
 4. Take a backup and test restoring it once:
      sudo bash ${ROOT}/current/deploy/vps/backup-postgres.sh first
      sudo bash ${ROOT}/current/deploy/vps/restore-test.sh
 5. Optional alerts: set ALERT_WEBHOOK_URL in ${ETC}/ops.env (ntfy, Slack or Discord webhook).
Updates later:  sudo bash ${ROOT}/current/deploy/vps/update.sh   (rollback: add --rollback)
────────────────────────────────────────────────────────────────────────────
EOF
