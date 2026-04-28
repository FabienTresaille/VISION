#!/bin/sh
set -e

echo "🚀 Vision - Starting up..."

# Run database sync
echo "📦 Synchronizing database schema..."
npx prisma db push --accept-data-loss || echo "⚠️  Schema sync failed, but continuing..."

echo "✅ Ready! Starting Next.js server..."
exec "$@"
