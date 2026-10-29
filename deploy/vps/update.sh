#!/usr/bin/env bash
# Deploy the latest code as a new release, with a backup first and automatic rollback.
#
#   sudo bash /srv/codementor/current/deploy/vps/update.sh            # latest commit of the branch
#   sudo REF=v1.2.0 bash /srv/codementor/current/deploy/vps/update.sh # a tag or commit
#   sudo bash /srv/codementor/current/deploy/vps/update.sh --rollback # back to the previous release
#
# Layout: /srv/codementor/repo (git clone) → /srv/codementor/releases/<time>-<sha> (one folder per
# release, built in place) → /srv/codementor/current (symlink the services run from). The running
# site keeps serving the old release until the new one is built and migrated; if the new one fails
# its health check, the symlink goes back and the old release is restarted.
set -euo pipefail

ROOT=/srv/codementor
ETC=/etc/codementor
KEEP=${KEEP_RELEASES:-3}
log() { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
[ "$(id -u)" -eq 0 ] || { echo "Run as root (sudo)." >&2; exit 1; }
as_app() { sudo -u codementor -H bash -c "$1"; }

health() {
  for _ in $(seq 1 30); do
    # -s without -S: "connection refused" while the app is still starting is expected, not an error.
    if curl -fs --max-time 5 http://127.0.0.1:3000/api/health | jq -e '.ok == true' >/dev/null 2>&1; then return 0; fi
    sleep 2
  done
  return 1
}

restart() {
  systemctl restart codementor-sandbox
  systemctl restart codementor-web
}

if [ "${1:-}" = "--rollback" ]; then
  cur=$(readlink -f "$ROOT/current")
  prev=$(find "$ROOT/releases" -mindepth 1 -maxdepth 1 -type d | sort | awk -v c="$cur" '$0 < c' | tail -1 || true)
  [ -n "$prev" ] || { echo "No previous release to roll back to." >&2; exit 1; }
  log "Rolling back to $(basename "$prev")"
  ln -sfn "$prev" "$ROOT/current"
  restart
  health && echo "Rolled back. (Database migrations are additive, so older code keeps working.)" || { echo "Health check failed after rollback — check journalctl -u codementor-web" >&2; exit 1; }
  exit 0
fi

log "Fetching code"
as_app "cd $ROOT/repo && git fetch --quiet --tags origin"
REF=${REF:-origin/$(as_app "cd $ROOT/repo && git rev-parse --abbrev-ref HEAD")}
SHA=$(as_app "cd $ROOT/repo && git rev-parse --short=10 '$REF'")
if [ -L "$ROOT/current" ] && [ "$(basename "$(readlink -f "$ROOT/current")" | cut -d- -f3)" = "$SHA" ]; then
  echo "Already running $SHA."; exit 0
fi
REL="$ROOT/releases/$(date -u +%Y%m%d-%H%M%S)-$SHA"
as_app "mkdir -p '$REL' && cd $ROOT/repo && git archive '$REF' | tar -x -C '$REL'"
echo "Release: $REL"

log "Installing dependencies and building"
as_app "cd '$REL' && npm ci --no-audit --no-fund --loglevel=error"
as_app "cd '$REL' && NEXT_STANDALONE=true NEXT_TELEMETRY_DISABLED=1 npm run build"
as_app "cd '$REL' && cp -r .next/static .next/standalone/.next/static && { [ -d public ] && cp -r public .next/standalone/public || true; }"

if [ -L "$ROOT/current" ]; then
  log "Backing up the database before migrating"
  bash "$ROOT/current/deploy/vps/backup-postgres.sh" pre-update || { echo "Backup failed — not deploying." >&2; exit 1; }
fi

log "Migrating the database"
as_app "cd '$REL' && set -a && . $ETC/web.env && set +a && npm run --silent db:migrate"

PREV=$( [ -L "$ROOT/current" ] && readlink -f "$ROOT/current" || true )
log "Switching to the new release"
ln -sfn "$REL" "$ROOT/current"
restart
if health; then
  echo "Healthy: $SHA is live."
else
  echo "New release failed its health check." >&2
  if [ -n "$PREV" ]; then
    ln -sfn "$PREV" "$ROOT/current"
    restart
    health && echo "Rolled back to $(basename "$PREV")." >&2
  fi
  echo "Logs: journalctl -u codementor-web -n 100" >&2
  exit 1
fi

log "Cleaning up old releases (keeping $KEEP)"
find "$ROOT/releases" -mindepth 1 -maxdepth 1 -type d | sort | head -n -"$KEEP" | while read -r old; do
  [ "$old" = "$(readlink -f "$ROOT/current")" ] || rm -rf "$old"
done
echo "Done."
