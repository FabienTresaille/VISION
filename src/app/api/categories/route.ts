import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/categories
export async function GET() {
  const categories = await prisma.category.findMany({
    include: {
      subCategories: true,
      _count: {
        select: {
          offers: true,
          rssFeeds: true,
          articleTags: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(categories);
}
