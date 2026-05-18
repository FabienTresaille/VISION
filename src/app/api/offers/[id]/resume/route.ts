import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { STEP_DEFINITIONS } from "@/lib/workflow";

// POST /api/offers/[id]/resume — Resume a rejected offer as a new version
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Fetch the original offer
  const originalOffer = await prisma.offer.findUnique({
    where: { id: params.id },
    include: {
      offerTags: true,
      category: true,
    },
  });

  if (!originalOffer) {
    return NextResponse.json(
      { error: "Offre introuvable" },
      { status: 404 }
    );
  }

  if (originalOffer.status !== "rejected") {
    return NextResponse.json(
      { error: "Seule une offre rejetée peut être reprise" },
      { status: 400 }
    );
  }

  // Determine root offer (the original V1)
  const rootOfferId = originalOffer.parentOfferId || originalOffer.id;

  // Count existing versions from this root
  const existingVersions = await prisma.offer.count({
    where: {
      OR: [
        { id: rootOfferId },
        { parentOfferId: rootOfferId },
      ],
    },
  });

  const newVersion = existingVersions + 1;

  // Build new offer name: strip existing Vx suffix and add new one
  let baseName = originalOffer.name.replace(/\s*—\s*V\d+$/, "");
  const newName = `${baseName} — V${newVersion}`;

  // Create the new offer with full workflow
  const newOffer = await prisma.offer.create({
    data: {
      name: newName,
      description: originalOffer.description,
      categoryId: originalOffer.categoryId,
      sourceArticleId: originalOffer.sourceArticleId,
      currentStep: 0,
      progressPercent: 0,
      status: "in_progress",
      version: newVersion,
      parentOfferId: rootOfferId,
      // Create all steps with actions
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

  // Copy category tags from original offer
  if (originalOffer.offerTags.length > 0) {
    await prisma.offerCategoryTag.createMany({
      data: originalOffer.offerTags.map((tag) => ({
        offerId: newOffer.id,
        categoryId: tag.categoryId,
        subCategoryId: tag.subCategoryId,
      })),
    });
  }

  return NextResponse.json(newOffer, { status: 201 });
}
