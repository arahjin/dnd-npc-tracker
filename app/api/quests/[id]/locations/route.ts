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

  const { locationId, rolle } = await req.json();
  if (!locationId) return NextResponse.json({ error: "locationId fehlt" }, { status: 400 });
  const loc = await prisma.location.findUnique({ where: { id: locationId }, select: { kampagneId: true } });
  if (!loc || loc.kampagneId !== ctx.kampagneId)
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });

  const link = await prisma.questLocation.upsert({
    where: { questId_locationId: { questId, locationId } },
    create: { questId, locationId, rolle: rolle || null },
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

  const { locationId } = await req.json();
  if (!locationId) return NextResponse.json({ error: "locationId fehlt" }, { status: 400 });
  await prisma.questLocation.delete({ where: { questId_locationId: { questId, locationId } } });
  return NextResponse.json({ ok: true });
}
