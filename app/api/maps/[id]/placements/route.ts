import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireKampagneApi } from "@/lib/kampagne";
import { validateShape, isHexColor, PIN_ICON_KEYS, type MapShape } from "@/lib/mapShapes";

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
  const b = body as {
    locationId?: unknown;
    x?: unknown;
    y?: unknown;
    shape?: unknown;
    color?: unknown;
    icon?: unknown;
    linkedMapId?: unknown;
  };

  const locationId = typeof b.locationId === "string" ? b.locationId : "";
  if (!locationId) return NextResponse.json({ error: "Location erforderlich." }, { status: 400 });

  // Resolve shape: either passed explicitly, or built from {x,y} for backwards compat.
  let shape: MapShape;
  try {
    if (b.shape !== undefined && b.shape !== null) {
      shape = validateShape(b.shape);
    } else {
      const x = Number(b.x);
      const y = Number(b.y);
      shape = validateShape({ type: "point", x, y });
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Ungültige Shape." },
      { status: 400 },
    );
  }

  // Optional color
  let color: string | null = null;
  if (b.color !== undefined && b.color !== null && b.color !== "") {
    if (!isHexColor(b.color)) {
      return NextResponse.json({ error: "Ungültiger Farbwert (Hex erwartet)." }, { status: 400 });
    }
    color = b.color;
  }

  // Optional icon (only for points)
  let icon: string | null = null;
  if (b.icon !== undefined && b.icon !== null && b.icon !== "") {
    if (typeof b.icon !== "string" || !PIN_ICON_KEYS.includes(b.icon)) {
      return NextResponse.json({ error: "Unbekanntes Icon." }, { status: 400 });
    }
    if (shape.type !== "point") {
      return NextResponse.json({ error: "Icon nur für Punkt-Shapes erlaubt." }, { status: 400 });
    }
    icon = b.icon;
  }

  // Optional linkedMapId — must be in same campaign and not self
  let linkedMapId: string | null = null;
  if (b.linkedMapId !== undefined && b.linkedMapId !== null && b.linkedMapId !== "") {
    if (typeof b.linkedMapId !== "string") {
      return NextResponse.json({ error: "Ungültige Sub-Karte." }, { status: 400 });
    }
    if (b.linkedMapId === mapId) {
      return NextResponse.json({ error: "Karte darf nicht auf sich selbst verlinken." }, { status: 400 });
    }
    const sub = await prisma.map.findFirst({
      where: { id: b.linkedMapId, kampagneId: ctx.kampagneId },
      select: { id: true },
    });
    if (!sub) return NextResponse.json({ error: "Sub-Karte nicht in dieser Kampagne." }, { status: 400 });
    linkedMapId = b.linkedMapId;
  }

  const location = await prisma.location.findFirst({
    where: { id: locationId, kampagneId: ctx.kampagneId },
    select: { id: true },
  });
  if (!location) return NextResponse.json({ error: "Location nicht gefunden." }, { status: 400 });

  // Derive x/y from shape for the legacy columns (so existing list/queries still work).
  const center = shape.type === "point"
    ? { x: shape.x, y: shape.y }
    : shape.type === "circle"
      ? { x: shape.x, y: shape.y }
      : shape.type === "rect"
        ? { x: shape.x + shape.w / 2, y: shape.y + shape.h / 2 }
        : { x: shape.points[0][0], y: shape.points[0][1] };

  const placement = await prisma.mapPlacement.create({
    data: {
      mapId,
      locationId,
      x: center.x,
      y: center.y,
      shape: shape as object,
      color,
      icon,
      linkedMapId,
    },
    include: {
      location: { select: { id: true, name: true, art: true, sichtbarkeit: true } },
      linkedMap: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json(placement, { status: 201 });
}
