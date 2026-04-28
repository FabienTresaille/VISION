import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/test-requests
export async function GET() {
  const requests = await prisma.testRequest.findMany({
    include: { offer: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(requests);
}

// POST /api/test-requests — Create a test request
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { requesterName, requesterEmail, solutionName, description, offerId } = body;

  if (!requesterName || !requesterEmail || !solutionName || !description) {
    return NextResponse.json(
      { error: "Tous les champs sont requis" },
      { status: 400 }
    );
  }

  const testRequest = await prisma.testRequest.create({
    data: {
      requesterName,
      requesterEmail,
      solutionName,
      description,
      offerId: offerId || null,
      status: "pending",
    },
  });

  return NextResponse.json(testRequest, { status: 201 });
}
