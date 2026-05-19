#!/bin/sh

echo "🚀 Vision - Starting up..."

# ── 1. Sync database schema (runs as root) ────────────────
echo "📦 Synchronizing database schema..."
prisma db push --schema=/app/prisma/schema.prisma --accept-data-loss --skip-generate
if [ $? -eq 0 ]; then
  echo "✅ Database schema synchronized!"
else
  echo "❌ ERROR: Failed to sync database schema. Check DATABASE_URL."
  exit 1
fi

# ── 2. Run seed if users table is empty ───────────────────
echo "🌱 Checking if seed is needed..."
node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.count().then(c => {
  if (c === 0) {
    console.log('   → No users found, running seed...');
    require('./prisma/seed.js');
  } else {
    console.log('   → Database already seeded (' + c + ' users). Skipping.');
    p.\$disconnect();
  }
}).catch(e => {
  console.log('   → Seed check failed:', e.message);
  p.\$disconnect();
});
"

# ── 3. Create uploads directory ───────────────────────────
echo "📁 Setting up uploads directory..."
mkdir -p /app/uploads/attachments /app/uploads/action-attachments
chown -R nextjs:nodejs /app/uploads

# ── 4. Drop to nextjs user and start server ───────────────
echo "✅ Ready! Starting Next.js server..."
exec su -s /bin/sh nextjs -c "exec $*"
