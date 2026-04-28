import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchAllFeeds } from "@/lib/rss";

// GET /api/rss/feeds — List RSS feeds
export async function GET() {
  const feeds = await prisma.rssFeed.findMany({
    include: {
      category: true,
      _count: { select: { articles: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(feeds);
}

// POST /api/rss/feeds — Add a new RSS feed
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, url, categoryId } = body;

  if (!name || !url || !categoryId) {
    return NextResponse.json(
      { error: "name, url et categoryId sont requis" },
      { status: 400 }
    );
  }

  const feed = await prisma.rssFeed.create({
    data: { name, url, categoryId, active: true },
    include: { category: true },
  });

  return NextResponse.json(feed, { status: 201 });
}
