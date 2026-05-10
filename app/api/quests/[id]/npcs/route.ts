import { NextRequest, NextResponse } from "next/server";
import { requireKampagneApi } from "@/lib/kampagne";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

async function canManage(ctx: Awaited<ReturnType<typeof requireKampagneApi>>, questId: string) {
  if (!ctx) return false;
  if (ctx.isDM || ctx.isAdmin) return true;
  const q = await prisma.quest.findUnique({ where: { id: questId }, select: { erstellerId: true } });
  return q?.erstellerId === ctx.userId;
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id: questId } = await params;
  const ctx = await requireKampagneApi();
  if (!await canManage(ctx, questId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { npcId, rolle } = await req.json();
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
  if (!await canManage(ctx, questId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { npcId } = await req.json();
  await prisma.questNPC.delete({ where: { questId_npcId: { questId, npcId } } });
  return NextResponse.json({ ok: true });
}
