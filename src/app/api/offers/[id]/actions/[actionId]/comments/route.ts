import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/offers/[id]/actions/[actionId]/comments — Add a comment to an action
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; actionId: string } }
) {
  const body = await request.json();
  const { author, content } = body;

  if (!author || !content) {
    return NextResponse.json(
      { error: "author et content sont requis" },
      { status: 400 }
    );
  }

  // Verify action belongs to this offer
  const action = await prisma.offerAction.findFirst({
    where: {
      id: params.actionId,
      step: { offerId: params.id },
    },
  });

  if (!action) {
    return NextResponse.json(
      { error: "Action introuvable pour cette offre" },
      { status: 404 }
    );
  }

  const comment = await prisma.actionComment.create({
    data: {
      actionId: params.actionId,
      author,
      content,
    },
  });

  return NextResponse.json(comment, { status: 201 });
}
