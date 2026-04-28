import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/dashboard — Aggregated dashboard data
export async function GET() {
  const [
    offersInProgress,
    offersValidated,
    offersRejected,
    totalOffers,
    recentArticlesCount,
    testRequestsPending,
    recentOffers,
    recentActivity,
    offersByStep,
  ] = await Promise.all([
    prisma.offer.count({ where: { status: "in_progress" } }),
    prisma.offer.count({ where: { status: "validated" } }),
    prisma.offer.count({ where: { status: "rejected" } }),
    prisma.offer.count(),
    prisma.rssArticle.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.testRequest.count({ where: { status: "pending" } }),
    prisma.offer.findMany({
      where: { status: "in_progress" },
      include: {
        category: true,
        steps: {
          where: { status: "in_progress" },
          include: {
            actions: {
              where: { status: { not: "completed" } },
              orderBy: { orderIndex: "asc" },
              take: 1,
            },
          },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.offerAction.findMany({
      where: { status: "completed" },
      include: {
        step: {
          include: { offer: { select: { name: true } } },
        },
      },
      orderBy: { completedAt: "desc" },
      take: 10,
    }),
    prisma.offerStep.groupBy({
      by: ["stepNumber"],
      where: { offer: { status: "in_progress" } },
      _count: true,
    }),
  ]);

  return NextResponse.json({
    kpis: {
      inProgress: offersInProgress,
      validated: offersValidated,
      rejected: offersRejected,
      total: totalOffers,
      articlesToday: recentArticlesCount,
      pendingTests: testRequestsPending,
    },
    recentOffers,
    recentActivity,
    offersByStep,
  });
}
