import { NextRequest, NextResponse } from "next/server";
import { fetchAllFeeds } from "@/lib/rss";

// POST /api/rss/fetch — Trigger RSS ingestion
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const categoryId = body?.categoryId;

  try {
    const results = await fetchAllFeeds(categoryId);
    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erreur lors de l'ingestion RSS", details: error.message },
      { status: 500 }
    );
  }
}
