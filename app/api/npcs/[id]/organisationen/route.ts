import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Organisation zu NPC hinzufügen
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: npcId } = await params;
  const { organisationId, rolle } = await req.json();
  const entry = await prisma.nPCOrganisation.upsert({
    where: { npcId_organisationId: { npcId, organisationId } },
    create: { npcId, organisationId, rolle },
    update: { rolle },
    include: { organisation: true },
  });
  return NextResponse.json(entry, { status: 201 });
}

// Organisation von NPC entfernen
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: npcId } = await params;
  const { organisationId } = await req.json();
  await prisma.nPCOrganisation.delete({
    where: { npcId_organisationId: { npcId, organisationId } },
  });
  return NextResponse.json({ success: true });
}
