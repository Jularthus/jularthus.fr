#!/bin/bash
# Puts a version of the site live in /var/www/jularthus.fr and, with sudo,
# keeps nginx in sync with ops/nginx/jularthus.fr.conf.
#
#   sudo ops/deploy.sh        first run: ownership, site, nginx (+ gzip)
#   ops/deploy.sh [version]   afterwards: switch versions, no password
#                             (default v2; any branch, tag or commit: v1,
#                             v2-checkpoint, ...)
#
# The live folder is a git checkout; nginx serves only its public/.
set -euo pipefail

REPO=$(cd "$(dirname "$0")/.." && pwd)
WEB=${WEB:-/var/www/jularthus.fr}
OWNER=${OWNER:-jularthus}
REF=${1:-v2}
CONF_SRC="$REPO/ops/nginx/jularthus.fr.conf"
CONF_DST=/etc/nginx/sites-available/jularthus.fr
NGINX_MAIN=/etc/nginx/nginx.conf
STAMP=$(date +%F-%H%M%S)
IS_ROOT=$([ "$(id -u)" -eq 0 ] && echo 1 || echo 0)

as_owner() {
  if [ "$IS_ROOT" = 1 ]; then sudo -H -u "$OWNER" "$@"; else "$@"; fi
}
g() { as_owner git -C "$WEB" "$@"; }

echo "== 1/4 Ownership"
if [ "$(stat -c %U "$WEB")" != "$OWNER" ]; then
  [ "$IS_ROOT" = 1 ] || { echo "$WEB belongs to $(stat -c %U "$WEB"): run this once with sudo." >&2; exit 1; }
  chown -R "$OWNER:$OWNER" "$WEB"
  echo "$WEB now belongs to $OWNER"
else
  echo "ok"
fi

echo "== 2/4 Fetch versions from $REPO"
g remote get-url dev >/dev/null 2>&1 || g remote add dev "$REPO"
g fetch -q --force dev '+refs/heads/*:refs/remotes/dev/*' '+refs/tags/*:refs/tags/*'
TARGET=$(g rev-parse -q --verify "refs/remotes/dev/$REF^{commit}" || g rev-parse -q --verify "$REF^{commit}") \
  || { echo "unknown version: $REF" >&2; exit 1; }

echo "== 3/4 Switch the site to $REF"
PREV=$(g rev-parse HEAD)
FIRST_MIGRATION=0
DIRTY=$(g status --porcelain --untracked-files=no)
if [ -n "$DIRTY" ]; then
  # The only edits we accept to discard are the pre-v2 live ones, which the
  # v1 snapshot recorded byte for byte.
  if [ -f "$WEB/index.html" ] && g show v1:public/index.html | cmp -s - "$WEB/index.html"; then
    echo "live edits are the ones saved in v1, discarding them"
    FIRST_MIGRATION=1
  else
    echo "uncommitted changes in $WEB, refusing to overwrite them:" >&2
    echo "$DIRTY" >&2
    exit 1
  fi
fi
g checkout -q -f -B live "$TARGET"
# wifi.sh is not part of the site's history; keep it reachable at /wifi.sh.
if [ -f "$WEB/wifi.sh" ] && [ ! -e "$WEB/public/wifi.sh" ]; then
  as_owner mv "$WEB/wifi.sh" "$WEB/public/wifi.sh"
fi
g log --oneline -1

echo "== 4/4 nginx"
if [ "$IS_ROOT" != 1 ]; then
  if ! cmp -s "$CONF_SRC" "$CONF_DST"; then
    echo "note: ops/nginx/jularthus.fr.conf differs from the live config; run with sudo to apply it."
  else
    echo "config already up to date"
  fi
elif cmp -s "$CONF_SRC" "$CONF_DST" && ! grep -qE '^\s*# gzip_types' "$NGINX_MAIN"; then
  echo "config already up to date"
else
  mkdir -p /etc/nginx/backup
  cp "$CONF_DST" "/etc/nginx/backup/jularthus.fr.$STAMP"
  cp "$NGINX_MAIN" "/etc/nginx/backup/nginx.conf.$STAMP"
  cp "$CONF_SRC" "$CONF_DST"
  # gzip for files nginx serves itself; gzip_proxied stays off on purpose
  # (compressing proxied app responses over TLS opens BREACH-style leaks).
  sed -i -E 's/^(\s*)# (gzip_vary on;)/\1\2/; s/^(\s*)# (gzip_comp_level 6;)/\1\2/; s/^(\s*)# (gzip_types .*)/\1\2/' "$NGINX_MAIN"
  if nginx -t; then
    systemctl reload nginx
    echo "nginx reloaded (backups in /etc/nginx/backup/*.$STAMP)"
  else
    echo "nginx -t failed: restoring the previous config and site." >&2
    cp "/etc/nginx/backup/jularthus.fr.$STAMP" "$CONF_DST"
    cp "/etc/nginx/backup/nginx.conf.$STAMP" "$NGINX_MAIN"
    [ -f "$WEB/public/wifi.sh" ] && [ ! -e "$WEB/wifi.sh" ] && as_owner mv "$WEB/public/wifi.sh" "$WEB/wifi.sh"
    g checkout -q -f "$PREV"
    if [ "$FIRST_MIGRATION" = 1 ]; then
      # put back the exact pre-v2 live state: v1's index.html, no oldindex.html
      g show v1:public/index.html | as_owner tee "$WEB/index.html" >/dev/null
      as_owner rm -f "$WEB/oldindex.html"
    fi
    exit 1
  fi
fi

cat <<MSG

Live: $REF. Switch or roll back any time with: $REPO/ops/deploy.sh <version>
MSG
