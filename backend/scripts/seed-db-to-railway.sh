#!/usr/bin/env bash
# Seed local PostgreSQL data to Railway.
# Usage:
#   ./scripts/seed-db-to-railway.sh
#   ./scripts/seed-db-to-railway.sh --migrate-only
#   ./scripts/seed-db-to-railway.sh --skip-migrate

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${ENV_FILE:-$ROOT_DIR/.env.railway}"
DUMP_FILE="$ROOT_DIR/scripts/.seed-dump.sql"

SKIP_MIGRATE=false
MIGRATE_ONLY=false

for arg in "$@"; do
  case "$arg" in
    --skip-migrate) SKIP_MIGRATE=true ;;
    --migrate-only) MIGRATE_ONLY=true ;;
    *) echo "Unknown option: $arg"; exit 1 ;;
  esac
done

load_env() {
  if [[ ! -f "$ENV_FILE" ]]; then
    echo "Env file not found: $ENV_FILE"
    echo "Copy .env.railway.example to .env.railway and fill in credentials."
    exit 1
  fi
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
}

parse_pg_url() {
  local url="$1"
  local clean="${url%%\?*}"
  if [[ ! "$clean" =~ ^postgres(ql)?://([^:]+):([^@]+)@([^:/]+):([0-9]+)/([^/]+)$ ]]; then
    echo "Invalid PostgreSQL URL: $url" >&2
    exit 1
  fi
  PG_USER="${BASH_REMATCH[2]}"
  PG_PASSWORD="${BASH_REMATCH[3]}"
  PG_HOST="${BASH_REMATCH[4]}"
  PG_PORT="${BASH_REMATCH[5]}"
  PG_DATABASE="${BASH_REMATCH[6]}"
}

ensure_remote_database() {
  echo "Ensuring database '${PG_DATABASE}' exists on Railway..."
  export PGPASSWORD="$PG_PASSWORD"
  local exists
  exists="$(psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '${PG_DATABASE}';" | tr -d '[:space:]')"
  if [[ "$exists" != "1" ]]; then
    echo "Creating database '${PG_DATABASE}'..."
    psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d postgres -v ON_ERROR_STOP=1 -c "CREATE DATABASE ${PG_DATABASE};"
  fi
}

run_migrate() {
  local runtime_config="$ROOT_DIR/migration/dbconfig.railway.runtime.yml"
  cat > "$runtime_config" <<EOF
railway:
  dialect: postgres
  datasource: host=${PG_HOST} dbname=${PG_DATABASE} user=${PG_USER} password=${PG_PASSWORD} sslmode=require port=${PG_PORT}
  dir: files
  table: migrations
EOF

  if ! command -v sql-migrate >/dev/null 2>&1; then
    echo "sql-migrate not found, installing..."
    go install github.com/rubenv/sql-migrate/...@latest
  fi

  echo "Running migrations on Railway..."
  (cd "$ROOT_DIR/migration" && sql-migrate up -config="dbconfig.railway.runtime.yml" -env=railway)
}

dump_local() {
  if [[ -n "${LOCAL_DB_CONTAINER:-}" ]] && docker ps --format '{{.Names}}' | grep -qx "$LOCAL_DB_CONTAINER"; then
    echo "Dumping local data via docker exec ($LOCAL_DB_CONTAINER)..."
    docker exec -e PGPASSWORD=postgres "$LOCAL_DB_CONTAINER" \
      pg_dump -U postgres -d sihp \
      --schema=sihp --data-only --no-owner --no-acl \
      --disable-triggers > "$DUMP_FILE"
    return
  fi

  local local_url="${LOCAL_DATABASE_URL:-postgresql://postgres:postgres@localhost:5435/sihp}"
  echo "Dumping local data via pg_dump ($local_url)..."
  pg_dump "$local_url" \
    --schema=sihp --data-only --no-owner --no-acl \
    --disable-triggers -f "$DUMP_FILE"
}

truncate_remote() {
  echo "Truncating remote sihp schema tables..."
  export PGPASSWORD="$PG_PASSWORD"
  export PGSSLMODE=require
  psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DATABASE" -v ON_ERROR_STOP=1 <<'SQL'
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'sihp') LOOP
    EXECUTE 'TRUNCATE TABLE sihp.' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE';
  END LOOP;
END $$;
SQL
}

cleanup() {
  rm -f "$DUMP_FILE"
}
trap cleanup EXIT

load_env

parse_pg_url "$DATABASE_PUBLIC_URL"
export PGSSLMODE=require

echo "=== SIHP DB Seeder: Local -> Railway ==="
echo "Remote: ${PG_HOST}:${PG_PORT}/${PG_DATABASE}"

if [[ "$SKIP_MIGRATE" != "true" ]]; then
  ensure_remote_database
  run_migrate
fi

if [[ "$MIGRATE_ONLY" == "true" ]]; then
  echo "MigrateOnly: done."
  exit 0
fi

dump_local

echo "Testing remote connection..."
export PGPASSWORD="$PG_PASSWORD"
psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DATABASE" -v ON_ERROR_STOP=1 -c "SELECT 1;"

truncate_remote

echo "Restoring data to Railway..."
psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DATABASE" -v ON_ERROR_STOP=1 -f "$DUMP_FILE"

echo "Done. Local sihp schema data copied to Railway."
