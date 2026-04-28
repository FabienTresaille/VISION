import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { chatWithContext } from "@/lib/gemini";

// POST /api/ai/chat — Chat with Vision AI assistant
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { message, sessionId } = body;

  if (!message) {
    return NextResponse.json(
      { error: "Le message est requis" },
      { status: 400 }
    );
  }

  const sid = sessionId || crypto.randomUUID();

  // Save user message
  await prisma.chatMessage.create({
    data: { sessionId: sid, role: "user", content: message },
  });

  // Build context from database
  const [offers, recentArticles, stats] = await Promise.all([
    prisma.offer.findMany({
      select: {
        name: true,
        status: true,
        currentStep: true,
        progressPercent: true,
        rejectionReason: true,
      },
    }),
    prisma.rssArticle.findMany({
      take: 20,
      orderBy: { publishedAt: "desc" },
      include: {
        tags: { include: { category: true } },
      },
    }),
    prisma.offer.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  const statsObj = {
    totalOffers: offers.length,
    inProgress: stats.find((s) => s.status === "in_progress")?._count || 0,
    validated: stats.find((s) => s.status === "validated")?._count || 0,
    rejected: stats.find((s) => s.status === "rejected")?._count || 0,
  };

  const articlesForContext = recentArticles.map((a) => ({
    title: a.title,
    categories: a.tags.map((t) => t.category.name),
  }));

  // Get AI response
  const response = await chatWithContext(message, {
    offers,
    recentArticles: articlesForContext,
    stats: statsObj,
  });

  // Save assistant message
  await prisma.chatMessage.create({
    data: { sessionId: sid, role: "assistant", content: response },
  });

  return NextResponse.json({ response, sessionId: sid });
}
