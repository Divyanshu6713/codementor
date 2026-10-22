#!/usr/bin/env bash
# Nightly PostgreSQL backup (cron: 30 2 * * * /srv/codementor/app/deploy/vps/backup-postgres.sh)
# Keeps 14 daily dumps. Copy them off the VPS too (Hostinger VPS snapshots, or another server).
set -euo pipefail
DEST=/srv/codementor/backups
mkdir -p "$DEST"
STAMP=$(date +%F)
docker compose -f /srv/codementor/app/deploy/vps/docker-compose.postgres.yml exec -T postgres \
  pg_dump -U codementor -d codementor --format=custom > "$DEST/codementor-$STAMP.dump"
find "$DEST" -name 'codementor-*.dump' -mtime +14 -delete
echo "backup ok: $DEST/codementor-$STAMP.dump"
