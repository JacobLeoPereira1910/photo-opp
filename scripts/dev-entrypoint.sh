#!/bin/sh
set -eu

SERVICE_NAME="${1:-}"

if [ -z "$SERVICE_NAME" ]; then
  echo "Usage: sh scripts/dev-entrypoint.sh <api|web>"
  exit 1
fi

log() {
  printf '\n[%s] %s\n' "$SERVICE_NAME" "$1"
}

install_dependencies() {
  WORKDIR_PATH="$1"
  cd "$WORKDIR_PATH"

  if [ ! -f package-lock.json ]; then
    log "package-lock.json not found in $WORKDIR_PATH"
    exit 1
  fi

  LOCKFILE_HASH="$(sha256sum package-lock.json | awk '{print $1}')"
  STAMP_FILE="node_modules/.package-lock.sha256"

  if [ ! -d node_modules ] || [ ! -f "$STAMP_FILE" ] || [ "$(cat "$STAMP_FILE")" != "$LOCKFILE_HASH" ]; then
    log "Installing dependencies in $WORKDIR_PATH"
    npm ci
    mkdir -p node_modules
    printf '%s' "$LOCKFILE_HASH" > "$STAMP_FILE"
  else
    log "Dependencies already up to date in $WORKDIR_PATH"
  fi
}

run_api() {
  API_DIR="/workspace/api"

  install_dependencies "$API_DIR"

  cd "$API_DIR"
  log "Generating Prisma client"
  npx prisma generate

  log "Applying database migrations"
  npx prisma migrate deploy

  if [ "${API_RUN_SEED:-true}" = "true" ]; then
    log "Running seed"
    npm run db:seed
  fi

  log "Starting Fastify API"
  exec npm run dev
}

run_web() {
  WEB_DIR="/workspace/web"

  install_dependencies "$WEB_DIR"

  cd "$WEB_DIR"
  log "Starting Vite dev server"
  exec npm run dev -- --host 0.0.0.0 --port 5173 --strictPort
}

case "$SERVICE_NAME" in
  api)
    run_api
    ;;
  web)
    run_web
    ;;
  *)
    echo "Unknown service: $SERVICE_NAME"
    exit 1
    ;;
esac
