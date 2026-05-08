import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// NPC zu Organisation hinzufügen
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: organisationId } = await params;
  const { npcId, rolle } = await req.json();
  const mitglied = await prisma.nPCOrganisation.create({
    data: { npcId, organisationId, rolle },
    include: { npc: true },
  });
  return NextResponse.json(mitglied, { status: 201 });
}

// NPC aus Organisation entfernen
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: organisationId } = await params;
  const { npcId } = await req.json();
  await prisma.nPCOrganisation.delete({
    where: { npcId_organisationId: { npcId, organisationId } },
  });
  return NextResponse.json({ success: true });
}
