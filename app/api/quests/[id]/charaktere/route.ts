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

  const { charakterId, rolle } = await req.json();
  if (!charakterId) return NextResponse.json({ error: "charakterId fehlt" }, { status: 400 });
  const ch = await prisma.charakter.findUnique({ where: { id: charakterId }, select: { kampagneId: true } });
  if (!ch || (ch.kampagneId && ch.kampagneId !== ctx.kampagneId))
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });

  const link = await prisma.questCharakter.upsert({
    where: { questId_charakterId: { questId, charakterId } },
    create: { questId, charakterId, rolle: rolle || null },
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

  const { charakterId } = await req.json();
  if (!charakterId) return NextResponse.json({ error: "charakterId fehlt" }, { status: 400 });
  await prisma.questCharakter.delete({ where: { questId_charakterId: { questId, charakterId } } });
  return NextResponse.json({ ok: true });
}
