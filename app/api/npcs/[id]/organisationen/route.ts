import { NextRequest, NextResponse } from "next/server";
import { requireKampagneApi } from "@/lib/kampagne";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

async function assertBothInCampaign(npcId: string, organisationId: string, kampagneId: string) {
  const [npc, org] = await Promise.all([
    prisma.nPC.findUnique({ where: { id: npcId }, select: { kampagneId: true } }),
    prisma.organisation.findUnique({ where: { id: organisationId }, select: { kampagneId: true } }),
  ]);
  if (!npc || !org) return false;
  if (npc.kampagneId && npc.kampagneId !== kampagneId) return false;
  if (org.kampagneId && org.kampagneId !== kampagneId) return false;
  return true;
}

// Organisation zu NPC hinzufügen
export async function POST(req: NextRequest, { params }: Params) {
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: npcId } = await params;
  const { organisationId, rolle } = await req.json();
  if (!organisationId) return NextResponse.json({ error: "organisationId fehlt" }, { status: 400 });

  if (!(await assertBothInCampaign(npcId, organisationId, ctx.kampagneId)))
    return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

  const entry = await prisma.nPCOrganisation.upsert({
    where: { npcId_organisationId: { npcId, organisationId } },
    create: { npcId, organisationId, rolle: rolle || null },
    update: { rolle: rolle || null },
    include: { organisation: true },
  });
  return NextResponse.json(entry, { status: 201 });
}

// Organisation von NPC entfernen
export async function DELETE(req: NextRequest, { params }: Params) {
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: npcId } = await params;
  const { organisationId } = await req.json();
  if (!organisationId) return NextResponse.json({ error: "organisationId fehlt" }, { status: 400 });

  if (!(await assertBothInCampaign(npcId, organisationId, ctx.kampagneId)))
    return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

  await prisma.nPCOrganisation.delete({
    where: { npcId_organisationId: { npcId, organisationId } },
  });
  return NextResponse.json({ success: true });
}
