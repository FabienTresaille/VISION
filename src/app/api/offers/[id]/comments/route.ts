import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/offers/[id]/comments — Add a comment to a step
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { stepId, author, content } = body;

  if (!stepId || !author || !content) {
    return NextResponse.json(
      { error: "stepId, author et content sont requis" },
      { status: 400 }
    );
  }

  // Verify step belongs to this offer
  const step = await prisma.offerStep.findFirst({
    where: { id: stepId, offerId: params.id },
  });

  if (!step) {
    return NextResponse.json(
      { error: "Étape introuvable pour cette offre" },
      { status: 404 }
    );
  }

  const comment = await prisma.stepComment.create({
    data: {
      stepId,
      author,
      content,
    },
  });

  return NextResponse.json(comment, { status: 201 });
}
