#!/bin/sh
set -e

echo "🚀 Vision - Starting up..."

# Run database migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy 2>/dev/null || echo "⚠️  Migrations skipped (first run or no migrations)"

echo "✅ Ready! Starting Next.js server..."
exec "$@"
