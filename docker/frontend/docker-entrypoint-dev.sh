#!/bin/sh
set -e
if [ ! -f node_modules/@tanstack/react-query/package.json ] || [ ! -f node_modules/next/package.json ]; then
  echo "frontend: node_modules incomplete — running npm ci…"
  npm ci
fi
exec "$@"
