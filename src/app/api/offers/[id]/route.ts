import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateOfferProgress } from "@/lib/workflow";

// GET /api/offers/[id] — Get offer details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const offer = await prisma.offer.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      sourceArticle: true,
      steps: {
        include: {
          actions: { orderBy: { orderIndex: "asc" } },
          validations: { orderBy: { validatedAt: "desc" } },
        },
        orderBy: { stepNumber: "asc" },
      },
      testRequests: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!offer) {
    return NextResponse.json({ error: "Offre introuvable" }, { status: 404 });
  }

  return NextResponse.json(offer);
}

// PATCH /api/offers/[id] — Update offer (reject, archive, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { status, rejectionReason, name, description } = body;

  // Validate rejection requires a reason
  if (status === "rejected" && !rejectionReason) {
    return NextResponse.json(
      { error: "Un motif de rejet est obligatoire" },
      { status: 400 }
    );
  }

  const data: any = {};
  if (name) data.name = name;
  if (description) data.description = description;
  if (status) {
    data.status = status;
    if (status === "rejected") {
      data.rejectionReason = rejectionReason;
      data.rejectedAt = new Date();
    }
  }

  const offer = await prisma.offer.update({
    where: { id: params.id },
    data,
    include: {
      category: true,
      steps: {
        include: { actions: { orderBy: { orderIndex: "asc" } } },
        orderBy: { stepNumber: "asc" },
      },
    },
  });

  return NextResponse.json(offer);
}

// DELETE /api/offers/[id] — Delete offer
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.offer.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
