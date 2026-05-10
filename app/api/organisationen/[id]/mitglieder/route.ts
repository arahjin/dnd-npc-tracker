import { NextRequest, NextResponse } from "next/server";
import { requireKampagneApi } from "@/lib/kampagne";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

async function assertBothInCampaign(organisationId: string, npcId: string, kampagneId: string) {
  const [org, npc] = await Promise.all([
    prisma.organisation.findUnique({ where: { id: organisationId }, select: { kampagneId: true } }),
    prisma.nPC.findUnique({ where: { id: npcId }, select: { kampagneId: true } }),
  ]);
  if (!org || !npc) return false;
  if (org.kampagneId && org.kampagneId !== kampagneId) return false;
  if (npc.kampagneId && npc.kampagneId !== kampagneId) return false;
  return true;
}

// NPC zu Organisation hinzufügen
export async function POST(req: NextRequest, { params }: Params) {
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: organisationId } = await params;
  const { npcId, rolle } = await req.json();
  if (!npcId) return NextResponse.json({ error: "npcId fehlt" }, { status: 400 });

  if (!(await assertBothInCampaign(organisationId, npcId, ctx.kampagneId)))
    return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

  const mitglied = await prisma.nPCOrganisation.upsert({
    where: { npcId_organisationId: { npcId, organisationId } },
    create: { npcId, organisationId, rolle: rolle || null },
    update: { rolle: rolle || null },
    include: { npc: { select: { id: true, name: true, image: true } } },
  });
  return NextResponse.json(mitglied, { status: 201 });
}

// NPC aus Organisation entfernen
export async function DELETE(req: NextRequest, { params }: Params) {
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: organisationId } = await params;
  const { npcId } = await req.json();
  if (!npcId) return NextResponse.json({ error: "npcId fehlt" }, { status: 400 });

  if (!(await assertBothInCampaign(organisationId, npcId, ctx.kampagneId)))
    return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

  await prisma.nPCOrganisation.delete({
    where: { npcId_organisationId: { npcId, organisationId } },
  });
  return NextResponse.json({ success: true });
}
