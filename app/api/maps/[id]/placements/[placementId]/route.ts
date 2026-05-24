import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireKampagneApi } from "@/lib/kampagne";

type Params = { params: Promise<{ id: string; placementId: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id: mapId, placementId } = await params;
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(ctx.isDM || ctx.isAdmin)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const placement = await prisma.mapPlacement.findFirst({
    where: { id: placementId, mapId, map: { kampagneId: ctx.kampagneId } },
    select: { id: true },
  });
  if (!placement) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });

  await prisma.mapPlacement.delete({ where: { id: placementId } });
  return NextResponse.json({ ok: true });
}
