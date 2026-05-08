import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: organisationId } = await params;
  const { charakterId, rolle } = await req.json();
  const mitglied = await prisma.charakterOrganisation.create({
    data: { charakterId, organisationId, rolle: rolle || null },
    include: { charakter: { include: { user: { select: { id: true, name: true } } } } },
  });
  return NextResponse.json(mitglied, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: organisationId } = await params;
  const { charakterId } = await req.json();
  await prisma.charakterOrganisation.delete({
    where: { charakterId_organisationId: { charakterId, organisationId } },
  });
  return NextResponse.json({ success: true });
}
