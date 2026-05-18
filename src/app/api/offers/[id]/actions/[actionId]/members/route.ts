import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/offers/[id]/actions/[actionId]/members — Add or replace a member on an action
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; actionId: string } }
) {
  const body = await request.json();
  const { name, role, email } = body;

  if (!name || !role) {
    return NextResponse.json(
      { error: "name et role sont requis" },
      { status: 400 }
    );
  }

  if (!["responsible", "member"].includes(role)) {
    return NextResponse.json(
      { error: "role doit être 'responsible' ou 'member'" },
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

  // If role is "responsible", replace any existing responsible
  if (role === "responsible") {
    await prisma.actionMember.deleteMany({
      where: {
        actionId: params.actionId,
        role: "responsible",
      },
    });
  }

  // Check if this exact member already exists (for "member" role)
  if (role === "member") {
    const existing = await prisma.actionMember.findUnique({
      where: {
        actionId_name_role: {
          actionId: params.actionId,
          name,
          role,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ce membre existe déjà pour cette action" },
        { status: 409 }
      );
    }
  }

  const member = await prisma.actionMember.create({
    data: {
      actionId: params.actionId,
      name,
      role,
      email: email || null,
    },
  });

  return NextResponse.json(member, { status: 201 });
}

// DELETE /api/offers/[id]/actions/[actionId]/members — Remove a member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; actionId: string } }
) {
  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get("memberId");

  if (!memberId) {
    return NextResponse.json(
      { error: "memberId est requis" },
      { status: 400 }
    );
  }

  const member = await prisma.actionMember.findUnique({
    where: { id: memberId },
    include: { action: { include: { step: true } } },
  });

  if (!member || member.action.step.offerId !== params.id) {
    return NextResponse.json(
      { error: "Membre introuvable" },
      { status: 404 }
    );
  }

  await prisma.actionMember.delete({
    where: { id: memberId },
  });

  return NextResponse.json({ success: true });
}
