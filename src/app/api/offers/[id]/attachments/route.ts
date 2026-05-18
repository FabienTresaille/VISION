import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, unlink, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 Mo
const UPLOAD_DIR = path.join(process.cwd(), "uploads", "attachments");

// POST /api/offers/[id]/attachments — Upload a file to a step
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const stepId = formData.get("stepId") as string | null;
    const uploadedBy = formData.get("uploadedBy") as string | null;

    if (!file || !stepId || !uploadedBy) {
      return NextResponse.json(
        { error: "file, stepId et uploadedBy sont requis" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Le fichier dépasse la limite de 50 Mo (${Math.round(file.size / 1024 / 1024)} Mo)` },
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

    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // Generate unique filename
    const ext = path.extname(file.name);
    const uniqueName = `${randomUUID()}${ext}`;
    const filePath = path.join(UPLOAD_DIR, uniqueName);
    const relativePath = `attachments/${uniqueName}`;

    // Write file to disk
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    // Save metadata to DB
    const attachment = await prisma.stepAttachment.create({
      data: {
        stepId,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || "application/octet-stream",
        filePath: relativePath,
        uploadedBy,
      },
    });

    return NextResponse.json(attachment, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload" },
      { status: 500 }
    );
  }
}

// DELETE /api/offers/[id]/attachments — Delete an attachment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const attachmentId = searchParams.get("attachmentId");

  if (!attachmentId) {
    return NextResponse.json(
      { error: "attachmentId est requis" },
      { status: 400 }
    );
  }

  const attachment = await prisma.stepAttachment.findUnique({
    where: { id: attachmentId },
    include: { step: true },
  });

  if (!attachment || attachment.step.offerId !== params.id) {
    return NextResponse.json(
      { error: "Pièce jointe introuvable" },
      { status: 404 }
    );
  }

  // Delete file from disk
  try {
    const fullPath = path.join(process.cwd(), "uploads", attachment.filePath);
    if (existsSync(fullPath)) {
      await unlink(fullPath);
    }
  } catch (err) {
    console.error("Error deleting file:", err);
  }

  // Delete from DB
  await prisma.stepAttachment.delete({
    where: { id: attachmentId },
  });

  return NextResponse.json({ success: true });
}

// GET /api/offers/[id]/attachments — Download a file
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const attachmentId = searchParams.get("attachmentId");

  if (!attachmentId) {
    return NextResponse.json(
      { error: "attachmentId est requis" },
      { status: 400 }
    );
  }

  const attachment = await prisma.stepAttachment.findUnique({
    where: { id: attachmentId },
    include: { step: true },
  });

  if (!attachment || attachment.step.offerId !== params.id) {
    return NextResponse.json(
      { error: "Pièce jointe introuvable" },
      { status: 404 }
    );
  }

  try {
    const fullPath = path.join(process.cwd(), "uploads", attachment.filePath);
    const { readFile } = await import("fs/promises");
    const fileBuffer = await readFile(fullPath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": attachment.mimeType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(attachment.fileName)}"`,
        "Content-Length": String(attachment.fileSize),
      },
    });
  } catch (err) {
    console.error("Error reading file:", err);
    return NextResponse.json(
      { error: "Fichier introuvable sur le disque" },
      { status: 404 }
    );
  }
}
