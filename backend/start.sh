#!/usr/bin/env bash
# start.sh - Production startup script for Render (or any gunicorn-based host).
#
# Render's free-tier disk is ephemeral, and we're using a hosted Postgres
# database, so this script ensures the database schema exists and the disease
# dataset + default admin are seeded every time the service boots — this is
# idempotent (seed_db.py skips records that already exist), so it's safe to
# run on every deploy/restart, not just the first one.

set -e

echo "Running database seed (idempotent)..."
python seed_db.py

echo "Starting gunicorn..."
exec gunicorn app:app --bind 0.0.0.0:${PORT:-5000} --workers 2 --timeout 120
