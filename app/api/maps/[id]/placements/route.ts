import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireKampagneApi } from "@/lib/kampagne";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id: mapId } = await params;
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(ctx.isDM || ctx.isAdmin)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const map = await prisma.map.findFirst({
    where: { id: mapId, kampagneId: ctx.kampagneId },
    select: { id: true },
  });
  if (!map) return NextResponse.json({ error: "Karte nicht gefunden." }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige JSON-Daten." }, { status: 400 });
  }
  const b = body as { locationId?: unknown; x?: unknown; y?: unknown };

  const locationId = typeof b.locationId === "string" ? b.locationId : "";
  const x = Number(b.x);
  const y = Number(b.y);
  if (!locationId) return NextResponse.json({ error: "Location erforderlich." }, { status: 400 });
  if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 1 || y < 0 || y > 1) {
    return NextResponse.json({ error: "Koordinaten müssen zwischen 0 und 1 liegen." }, { status: 400 });
  }

  const location = await prisma.location.findFirst({
    where: { id: locationId, kampagneId: ctx.kampagneId },
    select: { id: true },
  });
  if (!location) return NextResponse.json({ error: "Location nicht gefunden." }, { status: 400 });

  const placement = await prisma.mapPlacement.create({
    data: { mapId, locationId, x, y },
    include: {
      location: { select: { id: true, name: true, art: true, sichtbarkeit: true } },
    },
  });
  return NextResponse.json(placement, { status: 201 });
}
