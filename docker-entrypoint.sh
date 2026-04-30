#!/bin/sh
set -e

# Generate a JS file from all ENV vars prefixed with VITE_PUBLIC_
# (or use your own prefix convention)
ENV_FILE=/srv/__env.js

echo "window.__ENV__ = {" > "$ENV_FILE"
env | while IFS='=' read -r key value; do
  # Export all vars, or filter to a prefix e.g. [ "${key#VITE_}" != "$key" ]
  printf '  "%s": %s,\n' "$key" "$(printf '%s' "$value" | jq -Rs .)" >> "$ENV_FILE"
done
echo "};" >> "$ENV_FILE"

exec "$@"
