#!/usr/bin/env bash
# Proves the latest backup can be restored: loads it into a throw-away database, checks the main
# tables have rows, then drops it. Run once before launch and monthly after (cron does the latter).
#   sudo bash /srv/codementor/current/deploy/vps/restore-test.sh [dump-file]
set -euo pipefail
ETC=/etc/codementor
COMPOSE=(docker compose -p codementor -f /srv/codementor/current/deploy/vps/docker-compose.postgres.yml --env-file "$ETC/postgres.env")
DUMP=${1:-$(ls -1t /srv/codementor/backups/codementor-*.dump | head -1)}
[ -f "$DUMP" ] || { echo "No dump found." >&2; exit 1; }
DB=codementor_restore_test
psql() { "${COMPOSE[@]}" exec -T postgres psql -U codementor -d "$1" -v ON_ERROR_STOP=1 -qtA -c "$2"; }
psql postgres "DROP DATABASE IF EXISTS $DB"
psql postgres "CREATE DATABASE $DB"
trap 'psql postgres "DROP DATABASE IF EXISTS $DB" >/dev/null' EXIT
"${COMPOSE[@]}" exec -T postgres pg_restore -U codementor -d "$DB" --no-owner < "$DUMP"
users=$(psql "$DB" "select count(*) from users")
migrations=$(psql "$DB" "select count(*) from drizzle.__drizzle_migrations")
questions=$(psql "$DB" "select count(*) from questions")
echo "Restored $(basename "$DUMP"): $users users, $questions questions, $migrations migrations applied."
[ "$migrations" -gt 0 ] && [ "$questions" -gt 0 ] || { echo "Restore looks wrong." >&2; exit 1; }
date -u +%s > /srv/codementor/backups/.last-restore-test
echo "restore test ok"
