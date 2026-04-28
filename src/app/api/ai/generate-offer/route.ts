import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOfferDraft } from "@/lib/gemini";

// POST /api/ai/generate-offer — Generate an offer draft from an article
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { articleId } = body;

  if (!articleId) {
    return NextResponse.json(
      { error: "articleId est requis" },
      { status: 400 }
    );
  }

  const article = await prisma.rssArticle.findUnique({
    where: { id: articleId },
    include: {
      feed: { include: { category: true } },
    },
  });

  if (!article) {
    return NextResponse.json(
      { error: "Article introuvable" },
      { status: 404 }
    );
  }

  const draft = await generateOfferDraft(
    article.title,
    article.summary || "",
    article.feed.category.name
  );

  if (!draft) {
    return NextResponse.json(
      { error: "Impossible de générer le draft d'offre" },
      { status: 500 }
    );
  }

  // Save draft to article
  await prisma.rssArticle.update({
    where: { id: articleId },
    data: { aiOfferDraft: JSON.stringify(draft) },
  });

  return NextResponse.json(draft);
}
