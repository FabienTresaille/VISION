import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/offers/[id]/members — Add a member to a step
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { stepId, name, role, email } = body;

  if (!stepId || !name || !role) {
    return NextResponse.json(
      { error: "stepId, name et role sont requis" },
      { status: 400 }
    );
  }

  if (!["responsible", "stakeholder"].includes(role)) {
    return NextResponse.json(
      { error: "role doit être 'responsible' ou 'stakeholder'" },
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

  // Check if member already exists
  const existing = await prisma.stepMember.findUnique({
    where: {
      stepId_name_role: { stepId, name, role },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Ce membre existe déjà pour cette étape" },
      { status: 409 }
    );
  }

  const member = await prisma.stepMember.create({
    data: {
      stepId,
      name,
      role,
      email: email || null,
    },
  });

  return NextResponse.json(member, { status: 201 });
}

// DELETE /api/offers/[id]/members — Remove a member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get("memberId");

  if (!memberId) {
    return NextResponse.json(
      { error: "memberId est requis" },
      { status: 400 }
    );
  }

  const member = await prisma.stepMember.findUnique({
    where: { id: memberId },
    include: { step: true },
  });

  if (!member || member.step.offerId !== params.id) {
    return NextResponse.json(
      { error: "Membre introuvable" },
      { status: 404 }
    );
  }

  await prisma.stepMember.delete({
    where: { id: memberId },
  });

  return NextResponse.json({ success: true });
}
