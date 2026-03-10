#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "🛑 Stopping services and removing volumes..."
docker compose down -v

echo "🚀 Restarting infrastructure services..."
docker compose up -d

echo "⏳ Waiting for PostgreSQL to be ready..."
until docker compose exec postgres pg_isready -U agentgate > /dev/null 2>&1; do
  sleep 1
done
echo "✅ PostgreSQL is ready."

echo "📦 Pushing database schema..."
cd src/api
npx drizzle-kit push
cd ../..

echo ""
echo "==========================================="
echo "  Database has been reset!"
echo "  All data has been wiped and schema re-applied."
echo "==========================================="
