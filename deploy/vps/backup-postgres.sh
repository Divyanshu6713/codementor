#!/usr/bin/env bash
# PostgreSQL backup. Run nightly by /etc/cron.d/codementor, and by update.sh before every migration.
#   backup-postgres.sh [label]     → /srv/codementor/backups/codementor-<date>-<label>.dump
# Keeps BACKUP_KEEP_DAYS (default 14) days of dumps. If RCLONE_REMOTE is set in /etc/codementor/ops.env
# (e.g. b2:codementor-backups), each dump is also copied off the server — do this: a VPS backup that
# lives only on the VPS isn't a backup.
set -euo pipefail
ETC=/etc/codementor
[ -f "$ETC/ops.env" ] && . "$ETC/ops.env"
DEST=/srv/codementor/backups
KEEP=${BACKUP_KEEP_DAYS:-14}
LABEL=${1:-nightly}
COMPOSE=(docker compose -p codementor -f /srv/codementor/current/deploy/vps/docker-compose.postgres.yml --env-file "$ETC/postgres.env")
mkdir -p "$DEST"
FILE="$DEST/codementor-$(date -u +%Y%m%d-%H%M%S)-$LABEL.dump"
# PG_MODE=host (set by shared/install-shared.sh): the server's own PostgreSQL service.
if [ "${PG_MODE:-docker}" = "host" ]; then
  runuser -u postgres -- pg_dump -d codementor --format=custom > "$FILE.partial"
  # A dump that pg_restore can't list is not a backup.
  pg_restore --list < "$FILE.partial" > /dev/null
else
  "${COMPOSE[@]}" exec -T postgres pg_dump -U codementor -d codementor --format=custom > "$FILE.partial"
  # A dump that pg_restore can't list is not a backup.
  "${COMPOSE[@]}" exec -T postgres pg_restore --list < "$FILE.partial" > /dev/null
fi
mv "$FILE.partial" "$FILE"
chmod 640 "$FILE"
if [ -n "${RCLONE_REMOTE:-}" ] && command -v rclone >/dev/null; then
  rclone copy "$FILE" "$RCLONE_REMOTE" --quiet
fi
find "$DEST" -name 'codementor-*.dump' -mtime +"$KEEP" -delete
date -u +%s > "$DEST/.last-success"
echo "backup ok: $FILE ($(du -h "$FILE" | cut -f1))"
