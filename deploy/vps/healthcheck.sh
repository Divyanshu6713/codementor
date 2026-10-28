#!/usr/bin/env bash
# Every 5 minutes (cron): is the site up, is the code runner up, is there disk space, is the
# backup recent? Problems are logged to /var/log/codementor/health.log and, if ALERT_WEBHOOK_URL is
# set in /etc/codementor/ops.env, posted there (at most once an hour per problem, plus a
# "recovered" message). Works with ntfy.sh topics and Slack/Discord-style webhooks.
set -uo pipefail
ETC=/etc/codementor
[ -f "$ETC/ops.env" ] && . "$ETC/ops.env"
STATE=/var/lib/codementor-health
mkdir -p "$STATE" /var/log/codementor
LOG=/var/log/codementor/health.log
problems=()

health=$(curl -fsS --max-time 10 http://127.0.0.1:3000/api/health 2>/dev/null || true)
if ! echo "$health" | jq -e '.ok == true' >/dev/null 2>&1; then problems+=("web: /api/health is not ok (${health:-no response})"); fi
if [ -n "${DOMAIN:-}" ] && ! curl -fsS --max-time 15 -o /dev/null "https://$DOMAIN/api/health"; then problems+=("https: https://$DOMAIN is not reachable"); fi
systemctl is-active --quiet codementor-sandbox || problems+=("sandbox: codementor-sandbox service is not running")
if grep -q '^EXECUTION_PUBLIC_ENABLED=true' "$ETC/web.env" 2>/dev/null && ! echo "$health" | jq -e '.execution == "available"' >/dev/null 2>&1; then
  problems+=("sandbox: code execution is enabled but unavailable")
fi
used=$(df --output=pcent / | tail -1 | tr -dc '0-9')
[ "${used:-0}" -lt 85 ] || problems+=("disk: / is ${used}% full")
mem=$(free | awk '/Mem:/ {printf "%d", $7 / $2 * 100}')
[ "${mem:-100}" -gt 5 ] || problems+=("memory: only ${mem}% available")
last=$(cat /srv/codementor/backups/.last-success 2>/dev/null || echo 0)
[ $(( $(date -u +%s) - last )) -lt $(( 26 * 3600 )) ] || problems+=("backup: no successful backup in the last 26 hours")

notify() {
  [ -n "${ALERT_WEBHOOK_URL:-}" ] || return 0
  local text="[CodeMentor ${DOMAIN:-vps}] $1"
  if [[ "$ALERT_WEBHOOK_URL" == *ntfy* ]]; then
    curl -fsS --max-time 10 -d "$text" "$ALERT_WEBHOOK_URL" >/dev/null || true
  else
    curl -fsS --max-time 10 -H 'content-type: application/json' -d "$(jq -n --arg t "$text" '{text: $t, content: $t}')" "$ALERT_WEBHOOK_URL" >/dev/null || true
  fi
}

now=$(date -u +%s)
if [ ${#problems[@]} -eq 0 ]; then
  if [ -f "$STATE/failing" ]; then
    rm -f "$STATE/failing" "$STATE"/sent-*
    echo "$(date -Is) recovered" >> "$LOG"
    notify "✅ recovered — all checks pass"
  fi
  exit 0
fi
touch "$STATE/failing"
for p in "${problems[@]}"; do
  echo "$(date -Is) PROBLEM $p" >> "$LOG"
  key="$STATE/sent-$(echo "$p" | cut -d: -f1)"
  if [ ! -f "$key" ] || [ $(( now - $(cat "$key") )) -gt 3600 ]; then
    echo "$now" > "$key"
    notify "⚠️ $p"
  fi
done
exit 1
