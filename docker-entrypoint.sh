#!/bin/sh
set -e

ENV_FILE=/srv/__env.js

echo "window.__ENV__ = {" > "$ENV_FILE"
env | while IFS='=' read -r key value; do
  case "$key" in
    KIOSK_*)
      printf '  "%s": %s,\n' "$key" "$(printf '%s' "$value" | jq -Rs .)" >> "$ENV_FILE"
      ;;
  esac
done
echo "};" >> "$ENV_FILE"

exec "$@"
