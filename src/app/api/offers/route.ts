import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { STEP_DEFINITIONS, calculateOfferProgress } from "@/lib/workflow";

export const dynamic = "force-dynamic";

// GET /api/offers — List all offers
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const categoryId = searchParams.get("categoryId");
  const step = searchParams.get("step");

  const where: any = {};
  if (status) where.status = status;
  if (categoryId) where.categoryId = categoryId;
  if (step) where.currentStep = parseInt(step);

  const offers = await prisma.offer.findMany({
    where,
    include: {
      category: true,
      sourceArticle: true,
      steps: {
        include: { actions: { orderBy: { orderIndex: "asc" } } },
        orderBy: { stepNumber: "asc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(offers);
}

// POST /api/offers — Create a new offer with all 7 steps and pre-defined actions
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, description, categoryId, sourceArticleId } = body;

  if (!name) {
    return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
  }

  const offer = await prisma.offer.create({
    data: {
      name,
      description,
      categoryId,
      sourceArticleId,
      currentStep: 0,
      progressPercent: 0,
      status: "in_progress",
      steps: {
        create: STEP_DEFINITIONS.map((stepDef) => ({
          stepNumber: stepDef.stepNumber,
          stepName: stepDef.stepName,
          status: stepDef.stepNumber === 0 ? "in_progress" : "pending",
          responsibleRole: stepDef.responsibleRole,
          slaWeeks: stepDef.slaWeeks,
          progressPercent: 0,
          startedAt: stepDef.stepNumber === 0 ? new Date() : null,
          actions: {
            create: stepDef.actions.map((action, index) => ({
              label: action.label,
              responsible: action.responsible,
              status: "pending",
              orderIndex: index,
            })),
          },
        })),
      },
    },
    include: {
      category: true,
      steps: {
        include: { actions: { orderBy: { orderIndex: "asc" } } },
        orderBy: { stepNumber: "asc" },
      },
    },
  });

  // Mark source article as offer generated
  if (sourceArticleId) {
    await prisma.rssArticle.update({
      where: { id: sourceArticleId },
      data: { offerGenerated: true },
    });
  }

  return NextResponse.json(offer, { status: 201 });
}
