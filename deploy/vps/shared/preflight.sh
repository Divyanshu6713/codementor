#!/usr/bin/env bash
# READ-ONLY check before installing CodeMentor on a server that already runs other apps
# (e.g. Kisan Drishti). It changes nothing: no installs, no restarts, no firewall or config edits.
# It prints what is running so the shared install can fit around it. No passwords are printed.
#
#   sudo DOMAIN=codementor.mtc1.in bash deploy/vps/shared/preflight.sh
#
# (Or paste it into a file on the server: nano preflight.sh, then run the line above.)
set -uo pipefail
DOMAIN=${DOMAIN:-}

h() { printf '\n=== %s ===\n' "$*"; }
have() { command -v "$1" >/dev/null 2>&1; }
owner() { ss -tlnpH "sport = :$1" 2>/dev/null | sed -E 's/.*users:\(\("([^"]+)".*/\1/' | sort -u | tr '\n' ' '; }

[ "$(id -u)" -eq 0 ] || echo "(Not root: some details will be missing. Run with sudo for the full report.)"

h "Machine"
. /etc/os-release 2>/dev/null && echo "OS: ${PRETTY_NAME:-unknown}"
echo "Kernel: $(uname -r)   Arch: $(uname -m)   Virtualisation: $(systemd-detect-virt 2>/dev/null || echo unknown)"
echo "CPUs: $(nproc)"
free -h | sed -n '1,2p'
df -h / | sed -n '1,2p'
uptime

h "Ports CodeMentor needs"
for p in 80 443 3000 3410 5432; do
  o=$(owner "$p")
  printf '%-5s %s\n' "$p" "${o:-free}"
done

h "All listening TCP ports (address:port  process)"
ss -tlnpH 2>/dev/null | awk '{print $4, $6}' | sed -E 's/users:\(\("([^"]+)".*/\1/' | sort -u

h "Web server on 80/443"
for s in nginx caddy apache2 httpd; do
  systemctl is-active --quiet "$s" 2>/dev/null && echo "ACTIVE: $s"
done
if have nginx; then
  echo "nginx sites (server_name):"
  grep -rhoE 'server_name[^;]+' /etc/nginx/sites-enabled /etc/nginx/conf.d 2>/dev/null | sort -u | sed 's/^/  /'
fi
if [ -f /etc/caddy/Caddyfile ]; then
  echo "Caddyfile site labels:"
  grep -E '^[^#[:space:]{][^{]*\{' /etc/caddy/Caddyfile | sed 's/{$//; s/^/  /'
fi
have certbot && echo "certbot: installed ($(certbot --version 2>&1 | head -1))"

h "PostgreSQL"
have psql && echo "psql client: $(psql --version)"
for s in postgresql postgresql@16-main postgresql@15-main postgresql@14-main; do
  systemctl is-active --quiet "$s" 2>/dev/null && echo "ACTIVE service: $s"
done
echo "Listening on 5432: $(ss -tlnH 'sport = :5432' 2>/dev/null | awk '{print $4}' | tr '\n' ' ')"
if have sudo && id postgres >/dev/null 2>&1; then
  echo "Databases (names only):"
  sudo -u postgres psql -At -c "select datname from pg_database where not datistemplate" 2>/dev/null | sed 's/^/  /' || echo "  (could not list — host PostgreSQL may not be used)"
  sudo -u postgres psql -At -c "show server_version" 2>/dev/null | sed 's/^/Server version: /'
fi

h "Docker"
if have docker; then
  docker --version
  docker info --format 'Runtimes: {{range $k, $v := .Runtimes}}{{$k}} {{end}}' 2>/dev/null
  echo "Running containers (name  image  ports):"
  docker ps --format '  {{.Names}}  {{.Image}}  {{.Ports}}' 2>/dev/null
  docker compose version 2>/dev/null
else
  echo "Docker: not installed"
fi
have runsc && echo "gVisor (runsc): $(runsc --version 2>/dev/null | head -1)" || echo "gVisor (runsc): not installed"

h "Firewall"
if have ufw; then ufw status verbose 2>/dev/null | sed -n '1,25p'; else echo "ufw: not installed"; fi

h "Runtimes"
have node && echo "Node.js: $(node --version)" || echo "Node.js: not installed"
have npm && echo "npm: $(npm --version)"
have git && echo "git: $(git --version)"
have python3 && echo "python3: $(python3 --version 2>&1)"

h "Services that look like apps (running)"
systemctl list-units --type=service --state=running --no-legend 2>/dev/null \
  | grep -Ei 'kisan|kd|uvicorn|gunicorn|node|pm2|codementor|api|web' | awk '{print "  " $1}'

h "Existing CodeMentor install?"
ls -d /srv/codementor /etc/codementor 2>/dev/null || echo "none"

h "DNS"
echo "This server's addresses: $(hostname -I 2>/dev/null)"
if [ -n "$DOMAIN" ]; then
  echo "$DOMAIN resolves to: $(getent ahostsv4 "$DOMAIN" 2>/dev/null | awk '{print $1}' | sort -u | tr '\n' ' ')"
else
  echo "(set DOMAIN=codementor.mtc1.in to check the DNS record)"
fi

h "Done — nothing was changed. Paste everything above back into the chat."
