#!/bin/sh
set -e

# Settings from environment or defaults
host="${POSTGRES_HOST:-db}"
port="${POSTGRES_PORT:-5432}"
user="${POSTGRES_USER:-postgres}"
password="${POSTGRES_PASSWORD:-0605}"
database="${POSTGRES_DATABASE:-dbms_mini_2}"

export PGPASSWORD=$password

max_attempts=30
delay=2
i=0

check_db() {
  psql -h "$host" -p "$port" -U "$user" -d "$database" -c "SELECT 1" >/dev/null 2>&1
}

echo "Waiting for PostgreSQL at $host:$port (db: $database, user: $user) ..."

until check_db; do
  i=$((i+1))
  if [ $i -eq $max_attempts ]; then
    echo "Max attempts reached. PostgreSQL is not available. Exiting..."
    exit 1
  fi
  echo "PostgreSQL is unavailable - sleeping for $delay seconds (Attempt $i/$max_attempts)"
  sleep $delay
done

echo "PostgreSQL is up and running! Executing: $@"
exec "$@"