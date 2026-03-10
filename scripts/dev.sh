#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "🔍 Checking Docker..."
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker Desktop and try again."
  exit 1
fi

echo "🚀 Starting infrastructure services..."
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
echo "  AgentGate dev environment is ready!"
echo "  API URL: http://localhost:3100"
echo ""
echo "  Start the API server:"
echo "    cd src/api && npm run dev"
echo "==========================================="
