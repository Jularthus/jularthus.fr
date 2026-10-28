#!/bin/bash
# One-off: move jularthus.fr from static files in /var/www/jularthus.fr to
# the Docker container (compose.yml), behind host nginx like every other
# project. Run once:  sudo ops/migrate-to-docker.sh
#
# Safe to rerun. On any failure the previous nginx vhost is restored, and
# the old static setup keeps working: /var/www/jularthus.fr is not touched.
set -euo pipefail

REPO=$(cd "$(dirname "$0")/.." && pwd)
OWNER=${OWNER:-jularthus}
CONF_SRC="$REPO/ops/nginx/jularthus.fr.conf"
CONF_DST=/etc/nginx/sites-available/jularthus.fr
STAMP=$(date +%F-%H%M%S)
[ "$(id -u)" -eq 0 ] || { echo "Run me with sudo." >&2; exit 1; }
as_owner() { sudo -H -u "$OWNER" "$@"; }

PORT=$(grep -E '^PORT=' "$REPO/.env" 2>/dev/null | cut -d= -f2 || true)
PORT=${PORT:-8380}

echo "== 1/4 Start the container (make up)"
[ -f "$REPO/.env" ] || as_owner cp "$REPO/.env.example" "$REPO/.env"
as_owner make -C "$REPO" up
for _ in $(seq 1 45); do
  status=$(docker inspect -f '{{.State.Health.Status}}' jularthus 2>/dev/null || echo missing)
  [ "$status" = healthy ] && break
  sleep 2
done
[ "$status" = healthy ] || { echo "The container is not healthy ($status): nothing else was changed." >&2; exit 1; }
curl -fsS "http://127.0.0.1:$PORT/health" >/dev/null
echo "healthy on 127.0.0.1:$PORT"

echo "== 2/4 Install the proxy vhost"
mkdir -p /etc/nginx/backup
cp "$CONF_DST" "/etc/nginx/backup/jularthus.fr.$STAMP"
restore() {
  echo "$1: restoring the previous vhost." >&2
  cp "/etc/nginx/backup/jularthus.fr.$STAMP" "$CONF_DST"
  nginx -t 2>/dev/null && systemctl reload nginx
  exit 1
}
cp "$CONF_SRC" "$CONF_DST"
nginx -t || restore "nginx -t failed"
systemctl reload nginx

echo "== 3/4 Check https://jularthus.fr through the new path"
sleep 1
c() { curl -sk --max-time 10 --resolve jularthus.fr:443:127.0.0.1 "$@"; }
[ "$(c -o /dev/null -w '%{http_code}' https://jularthus.fr/)" = 200 ] || restore "home page not 200"
[ "$(c -o /dev/null -w '%{http_code}' https://jularthus.fr/this-page-does-not-exist)" = 404 ] || restore "404 page broken"
c -I https://jularthus.fr/ | grep -qi '^content-security-policy' || restore "security headers missing"
c https://jularthus.fr/ | grep -q 'jularthus.fr' || restore "unexpected home page"
echo "home 200, 404 page, security headers: ok"

echo "== 4/4 Done"
cat <<MSG

jularthus.fr is now served by the container (make up / make logs / make deploy).
Rollback if needed:
  sudo cp /etc/nginx/backup/jularthus.fr.$STAMP $CONF_DST && sudo nginx -t && sudo systemctl reload nginx
Once you're happy, the old static folder can go:  sudo rm -rf /var/www/jularthus.fr
MSG
