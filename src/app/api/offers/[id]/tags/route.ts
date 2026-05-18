import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/offers/[id]/tags — Add a category tag to an offer
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { categoryId, subCategoryId } = body;

  if (!categoryId) {
    return NextResponse.json(
      { error: "categoryId est requis" },
      { status: 400 }
    );
  }

  // Verify offer exists
  const offer = await prisma.offer.findUnique({
    where: { id: params.id },
  });

  if (!offer) {
    return NextResponse.json(
      { error: "Offre introuvable" },
      { status: 404 }
    );
  }

  // Verify category exists
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    return NextResponse.json(
      { error: "Catégorie introuvable" },
      { status: 404 }
    );
  }

  // If subCategoryId provided, verify it belongs to this category
  if (subCategoryId) {
    const subCategory = await prisma.subCategory.findFirst({
      where: { id: subCategoryId, categoryId },
    });

    if (!subCategory) {
      return NextResponse.json(
        { error: "Sous-catégorie introuvable pour cette catégorie" },
        { status: 404 }
      );
    }
  }

  // Check for existing tag
  const existing = await prisma.offerCategoryTag.findFirst({
    where: {
      offerId: params.id,
      categoryId,
      subCategoryId: subCategoryId || null,
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Ce tag existe déjà pour cette offre" },
      { status: 409 }
    );
  }

  const tag = await prisma.offerCategoryTag.create({
    data: {
      offerId: params.id,
      categoryId,
      subCategoryId: subCategoryId || null,
    },
    include: {
      category: true,
      subCategory: true,
    },
  });

  return NextResponse.json(tag, { status: 201 });
}

// DELETE /api/offers/[id]/tags — Remove a category tag from an offer
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const tagId = searchParams.get("tagId");

  if (!tagId) {
    return NextResponse.json(
      { error: "tagId est requis" },
      { status: 400 }
    );
  }

  const tag = await prisma.offerCategoryTag.findUnique({
    where: { id: tagId },
  });

  if (!tag || tag.offerId !== params.id) {
    return NextResponse.json(
      { error: "Tag introuvable" },
      { status: 404 }
    );
  }

  await prisma.offerCategoryTag.delete({
    where: { id: tagId },
  });

  return NextResponse.json({ success: true });
}
