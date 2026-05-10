import { NextRequest, NextResponse } from "next/server";
import { requireKampagneApi } from "@/lib/kampagne";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id: questId } = await params;
  const ctx = await requireKampagneApi();
  if (!ctx || (!ctx.isDM && !ctx.isAdmin)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { locationId, rolle } = await req.json();
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
  if (!ctx || (!ctx.isDM && !ctx.isAdmin)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { locationId } = await req.json();
  await prisma.questLocation.delete({ where: { questId_locationId: { questId, locationId } } });
  return NextResponse.json({ ok: true });
}
