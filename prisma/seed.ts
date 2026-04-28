import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── CATEGORIES & RSS FEEDS ────────────────────────────────
const CATEGORIES = [
  {
    name: "BACKUP",
    code: "BACKUP",
    responsible: "FTE",
    color: "#3b82f6",
    icon: "database",
    subCategories: [
      { name: "ISI FULLBACKUP IMMUABLE", code: "ISI_FULLBACKUP_IMMUABLE" },
      { name: "ISI BACKUP", code: "ISI_BACKUP" },
      { name: "ISI BACKUP 365", code: "ISI_BACKUP_365" },
    ],
    feeds: [],
  },
  {
    name: "MICROSOFT",
    code: "MICROSOFT",
    responsible: "MALN / FTE",
    color: "#8b5cf6",
    icon: "monitor",
    subCategories: [
      { name: "ISI MCO 365", code: "ISI_MCO_365" },
      { name: "ISI MAILBOX", code: "ISI_MAILBOX" },
    ],
    feeds: [
      { name: "O365 Reports", url: "https://o365reports.com/feed/" },
    ],
  },
  {
    name: "NETWORK & MSP",
    code: "NETWORK_MSP",
    responsible: "EDS",
    color: "#06b6d4",
    icon: "network",
    subCategories: [
      { name: "ISI FIREWALL", code: "ISI_FIREWALL" },
      { name: "ISI MCO", code: "ISI_MCO" },
    ],
    feeds: [],
  },
  {
    name: "CYBERSECURITY",
    code: "CYBERSECURITY",
    responsible: "NIBS / JIAX",
    color: "#ef4444",
    icon: "shield",
    subCategories: [
      { name: "ISI VULNERABILITY", code: "ISI_VULNERABILITY" },
      { name: "ISI SECURE ID", code: "ISI_SECURE_ID" },
      { name: "ISI CRYPTO", code: "ISI_CRYPTO" },
    ],
    feeds: [],
  },
  {
    name: "CLOUD",
    code: "CLOUD",
    responsible: "JOPU / EDS",
    color: "#10b981",
    icon: "cloud",
    subCategories: [
      { name: "ISI CLOUD", code: "ISI_CLOUD" },
      { name: "ISI HOUSING", code: "ISI_HOUSING" },
      { name: "ISI DRIVE", code: "ISI_DRIVE" },
    ],
    feeds: [],
  },
  {
    name: "AUTRE",
    code: "AUTRE",
    responsible: "—",
    color: "#f59e0b",
    icon: "layers",
    subCategories: [
      { name: "ISI PRIORITY", code: "ISI_PRIORITY" },
      { name: "ISI SAAS", code: "ISI_SAAS" },
      { name: "ISI SAFETY", code: "ISI_SAFETY" },
    ],
    feeds: [
      { name: "LeMagIT", url: "https://www.lemagit.fr/rss/ContentSyndication.xml" },
      { name: "Cigref", url: "https://www.cigref.fr/feed" },
      { name: "InfoDSI", url: "http://rss.infodsi.com/" },
      { name: "ZDNet FR", url: "https://www.zdnet.fr/feeds/rss/actualites/" },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding Vision database...\n");

  // ── 1. Create admin user ──────────────────────────────────
  const adminPassword = await bcrypt.hash("VisionAlsek2026!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@alsek.fr" },
    update: {},
    create: {
      email: "admin@alsek.fr",
      name: "Administrateur",
      password: adminPassword,
      role: "admin",
    },
  });
  console.log(`✅ Utilisateur admin: ${admin.email} (mot de passe: VisionAlsek2026!)`);

  // ── 2. Seed categories, subcategories, and RSS feeds ──────
  for (const cat of CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { code: cat.code },
      update: {
        name: cat.name,
        responsible: cat.responsible,
        color: cat.color,
        icon: cat.icon,
      },
      create: {
        name: cat.name,
        code: cat.code,
        responsible: cat.responsible,
        color: cat.color,
        icon: cat.icon,
      },
    });

    console.log(`\n📂 Catégorie: ${category.name}`);

    // Subcategories
    for (const sub of cat.subCategories) {
      await prisma.subCategory.upsert({
        where: {
          categoryId_code: { categoryId: category.id, code: sub.code },
        },
        update: { name: sub.name },
        create: {
          name: sub.name,
          code: sub.code,
          categoryId: category.id,
        },
      });
      console.log(`   └─ ${sub.name}`);
    }

    // RSS feeds
    for (const feed of cat.feeds) {
      await prisma.rssFeed.upsert({
        where: { url: feed.url },
        update: { name: feed.name, categoryId: category.id },
        create: {
          name: feed.name,
          url: feed.url,
          categoryId: category.id,
          active: true,
        },
      });
      console.log(`   📡 Feed: ${feed.name}`);
    }
  }

  console.log("\n🎉 Seed terminé avec succès !");
  console.log("═══════════════════════════════════════════");
  console.log("Connexion : admin@alsek.fr / VisionAlsek2026!");
  console.log("⚠️  Changez le mot de passe après la première connexion !");
  console.log("═══════════════════════════════════════════");
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
