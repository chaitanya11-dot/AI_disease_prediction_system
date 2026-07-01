#!/usr/bin/env bash
# start.sh - Production startup for Render / gunicorn
# Runs seed_db.py (idempotent - skips existing records), then boots gunicorn.

set -e

echo "[start.sh] Seeding database..."
python seed_db.py

echo "[start.sh] Starting gunicorn..."
exec gunicorn app:app \
  --bind "0.0.0.0:${PORT:-5000}" \
  --workers 2 \
  --timeout 120 \
  --log-level info \
  --access-logfile -
