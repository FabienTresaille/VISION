import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { STEP_DEFINITIONS } from "@/lib/workflow";

// PATCH /api/test-requests/[id] — Update status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Le statut est requis" }, { status: 400 });
    }

    const testRequest = await prisma.testRequest.findUnique({ where: { id } });
    if (!testRequest) {
      return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    }

    const updatedRequest = await prisma.testRequest.update({
      where: { id },
      data: { status },
    });

    // If approved and no offer is linked yet, generate an offer and enter workflow
    if (status === "approved" && !updatedRequest.offerId) {
      // Find a default category
      let category = await prisma.category.findFirst({ where: { code: "AUTRE" } });
      if (!category) {
        category = await prisma.category.findFirst();
      }

      if (category) {
        const newOffer = await prisma.offer.create({
          data: {
            name: `[POC] ${testRequest.solutionName}`,
            description: `Demande de test par ${testRequest.requesterName} (${testRequest.requesterEmail})\n\n${testRequest.description}`,
            categoryId: category.id,
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
        });

        // Link offer to test request
        await prisma.testRequest.update({
          where: { id },
          data: { offerId: newOffer.id },
        });
      }
    }

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("Error updating test request:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}
