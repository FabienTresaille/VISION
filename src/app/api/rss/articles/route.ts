import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/rss/articles — List RSS articles with tags
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");
  const offerGenerated = searchParams.get("offerGenerated");

  const where: any = {};
  if (categoryId) {
    where.tags = { some: { categoryId } };
  }
  if (offerGenerated !== null && offerGenerated !== undefined) {
    where.offerGenerated = offerGenerated === "true";
  }

  const [articles, total] = await Promise.all([
    prisma.rssArticle.findMany({
      where,
      include: {
        feed: { include: { category: true } },
        tags: {
          include: { category: true, subCategory: true },
        },
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.rssArticle.count({ where }),
  ]);

  return NextResponse.json({ articles, total, limit, offset });
}
