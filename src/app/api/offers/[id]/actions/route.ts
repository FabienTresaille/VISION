import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateOfferProgress } from "@/lib/workflow";

// POST /api/offers/[id]/actions — Complete or update an action
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { actionId, status, comment, dueDate } = body;

  if (!actionId || !status) {
    return NextResponse.json(
      { error: "actionId et status sont requis" },
      { status: 400 }
    );
  }

  // Update the action
  const action = await prisma.offerAction.update({
    where: { id: actionId },
    data: {
      status,
      comment,
      dueDate: dueDate ? new Date(dueDate) : null,
      completedAt: status === "completed" ? new Date() : null,
    },
    include: {
      step: {
        include: {
          actions: true,
          offer: {
            include: {
              steps: {
                include: { actions: true },
                orderBy: { stepNumber: "asc" },
              },
            },
          },
        },
      },
    },
  });

  const step = action.step;
  const offer = step.offer;

  // Recalculate step progress
  const totalActions = step.actions.length;
  const completedActions = step.actions.filter(
    (a) => a.id === actionId ? status === "completed" : a.status === "completed"
  ).length;
  const stepProgress = Math.round((completedActions / totalActions) * 100);

  // Check if step is completed
  const stepCompleted = completedActions === totalActions;

  await prisma.offerStep.update({
    where: { id: step.id },
    data: {
      progressPercent: stepProgress,
      status: stepCompleted ? "completed" : "in_progress",
      completedAt: stepCompleted ? new Date() : null,
      durationHours: stepCompleted && step.startedAt
        ? Math.round(
            (new Date().getTime() - step.startedAt.getTime()) / (1000 * 60 * 60)
          )
        : null,
    },
  });

  // If step completed, advance to next step
  if (stepCompleted && step.stepNumber < 6) {
    const nextStepNumber = step.stepNumber + 1;
    await prisma.offerStep.updateMany({
      where: {
        offerId: offer.id,
        stepNumber: nextStepNumber,
      },
      data: {
        status: "in_progress",
        startedAt: new Date(),
      },
    });

    await prisma.offer.update({
      where: { id: offer.id },
      data: { currentStep: nextStepNumber },
    });
  }

  // If step 6 completed, mark offer as validated
  if (stepCompleted && step.stepNumber === 6) {
    await prisma.offer.update({
      where: { id: offer.id },
      data: { status: "validated" },
    });
  }

  // Recalculate overall offer progress
  const updatedOffer = await prisma.offer.findUnique({
    where: { id: offer.id },
    include: {
      steps: {
        include: { actions: true },
        orderBy: { stepNumber: "asc" },
      },
    },
  });

  if (updatedOffer) {
    const progress = calculateOfferProgress(
      updatedOffer.steps.map((s) => ({
        stepNumber: s.stepNumber,
        status: s.id === step.id ? (stepCompleted ? "completed" : "in_progress") : s.status,
        actions: s.actions.map((a) => ({
          status: a.id === actionId ? status : a.status,
        })),
      }))
    );

    await prisma.offer.update({
      where: { id: offer.id },
      data: { progressPercent: progress },
    });
  }

  // Return full updated offer
  const result = await prisma.offer.findUnique({
    where: { id: offer.id },
    include: {
      category: true,
      offerTags: {
        include: { category: true, subCategory: true },
      },
      steps: {
        include: {
          actions: { orderBy: { orderIndex: "asc" } },
          validations: true,
          comments: { orderBy: { createdAt: "asc" } },
          attachments: { orderBy: { createdAt: "desc" } },
          members: { orderBy: { role: "asc" } },
        },
        orderBy: { stepNumber: "asc" },
      },
    },
  });

  return NextResponse.json(result);
}
