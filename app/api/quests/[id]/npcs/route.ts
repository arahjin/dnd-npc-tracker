import { NextRequest, NextResponse } from "next/server";
import { requireKampagneApi } from "@/lib/kampagne";
import { prisma } from "@/lib/prisma";
import { loadQuestForAuth, canManageQuest } from "@/lib/questAuth";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id: questId } = await params;
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const quest = await loadQuestForAuth(questId, ctx);
  if (!quest) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  if (!canManageQuest(ctx, quest)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { npcId, rolle } = await req.json();
  if (!npcId) return NextResponse.json({ error: "npcId fehlt" }, { status: 400 });
  // Ensure the NPC is in the same campaign
  const npc = await prisma.nPC.findUnique({ where: { id: npcId }, select: { kampagneId: true } });
  if (!npc || (npc.kampagneId && npc.kampagneId !== ctx.kampagneId))
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });

  const link = await prisma.questNPC.upsert({
    where: { questId_npcId: { questId, npcId } },
    create: { questId, npcId, rolle: rolle || null },
    update: { rolle: rolle || null },
  });
  return NextResponse.json(link);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id: questId } = await params;
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const quest = await loadQuestForAuth(questId, ctx);
  if (!quest) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  if (!canManageQuest(ctx, quest)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { npcId } = await req.json();
  if (!npcId) return NextResponse.json({ error: "npcId fehlt" }, { status: 400 });
  await prisma.questNPC.delete({ where: { questId_npcId: { questId, npcId } } });
  return NextResponse.json({ ok: true });
}
