import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const testRequest = await prisma.testRequest.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(testRequest);
  } catch (error) {
    console.error("Error updating test request:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}
