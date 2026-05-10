import { NextRequest, NextResponse } from "next/server";
import { requireKampagneApi } from "@/lib/kampagne";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id: questId } = await params;
  const ctx = await requireKampagneApi();
  if (!ctx || (!ctx.isDM && !ctx.isAdmin)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { charakterId, rolle } = await req.json();
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
  if (!ctx || (!ctx.isDM && !ctx.isAdmin)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { charakterId } = await req.json();
  await prisma.questCharakter.delete({ where: { questId_charakterId: { questId, charakterId } } });
  return NextResponse.json({ ok: true });
}
