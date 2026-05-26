import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireKampagneApi } from "@/lib/kampagne";
import { validateShape, isHexColor, PIN_ICON_KEYS, type MapShape } from "@/lib/mapShapes";

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

export async function PUT(req: NextRequest, { params }: Params) {
  const { id: mapId, placementId } = await params;
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(ctx.isDM || ctx.isAdmin)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const existing = await prisma.mapPlacement.findFirst({
    where: { id: placementId, mapId, map: { kampagneId: ctx.kampagneId } },
  });
  if (!existing) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige JSON-Daten." }, { status: 400 });
  }
  const b = body as {
    shape?: unknown;
    color?: unknown;
    icon?: unknown;
    linkedMapId?: unknown;
    locationId?: unknown;
    questId?: unknown;
  };

  type UpdateData = {
    shape?: object;
    x?: number;
    y?: number;
    color?: string | null;
    icon?: string | null;
    linkedMapId?: string | null;
    locationId?: string | null;
    questId?: string | null;
  };
  const data: UpdateData = {};

  // shape (optional)
  let resolvedShape: MapShape | null = null;
  if (b.shape !== undefined) {
    if (b.shape === null) {
      return NextResponse.json({ error: "Shape darf nicht leer sein." }, { status: 400 });
    }
    try {
      resolvedShape = validateShape(b.shape);
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Ungültige Shape." },
        { status: 400 },
      );
    }
    data.shape = resolvedShape as object;
    const center = resolvedShape.type === "point"
      ? { x: resolvedShape.x, y: resolvedShape.y }
      : resolvedShape.type === "circle"
        ? { x: resolvedShape.x, y: resolvedShape.y }
        : resolvedShape.type === "rect"
          ? { x: resolvedShape.x + resolvedShape.w / 2, y: resolvedShape.y + resolvedShape.h / 2 }
          : { x: resolvedShape.points[0][0], y: resolvedShape.points[0][1] };
    data.x = center.x;
    data.y = center.y;
  }

  // color
  if (b.color !== undefined) {
    if (b.color === null || b.color === "") {
      data.color = null;
    } else if (isHexColor(b.color)) {
      data.color = b.color;
    } else {
      return NextResponse.json({ error: "Ungültiger Farbwert (Hex erwartet)." }, { status: 400 });
    }
  }

  // icon — only valid for point shapes
  if (b.icon !== undefined) {
    if (b.icon === null || b.icon === "") {
      data.icon = null;
    } else if (typeof b.icon === "string" && PIN_ICON_KEYS.includes(b.icon)) {
      // ensure shape is a point (resolved or stored)
      const shapeType = resolvedShape?.type
        ?? (existing.shape && typeof existing.shape === "object" && "type" in existing.shape
          ? (existing.shape as { type: string }).type
          : "point");
      if (shapeType !== "point") {
        return NextResponse.json({ error: "Icon nur für Punkt-Shapes erlaubt." }, { status: 400 });
      }
      data.icon = b.icon;
    } else {
      return NextResponse.json({ error: "Unbekanntes Icon." }, { status: 400 });
    }
  }

  // linkedMapId
  if (b.linkedMapId !== undefined) {
    if (b.linkedMapId === null || b.linkedMapId === "") {
      data.linkedMapId = null;
    } else if (typeof b.linkedMapId === "string") {
      if (b.linkedMapId === mapId) {
        return NextResponse.json({ error: "Karte darf nicht auf sich selbst verlinken." }, { status: 400 });
      }
      const sub = await prisma.map.findFirst({
        where: { id: b.linkedMapId, kampagneId: ctx.kampagneId },
        select: { id: true },
      });
      if (!sub) return NextResponse.json({ error: "Sub-Karte nicht in dieser Kampagne." }, { status: 400 });
      data.linkedMapId = b.linkedMapId;
    } else {
      return NextResponse.json({ error: "Ungültige Sub-Karte." }, { status: 400 });
    }
  }

  // Target: locationId or questId — when either is provided, swap the target.
  // Exactly one must remain set on the row.
  const locProvided = b.locationId !== undefined;
  const questProvided = b.questId !== undefined;
  if (locProvided || questProvided) {
    const newLocationId =
      locProvided && typeof b.locationId === "string" && b.locationId.length > 0 ? b.locationId : null;
    const newQuestId =
      questProvided && typeof b.questId === "string" && b.questId.length > 0 ? b.questId : null;

    // Resolve the effective final state. If only one of the keys was provided,
    // assume the OTHER target should be cleared (swap semantics).
    const finalLocationId = locProvided ? newLocationId : questProvided ? null : existing.locationId;
    const finalQuestId = questProvided ? newQuestId : locProvided ? null : existing.questId;

    if ((finalLocationId && finalQuestId) || (!finalLocationId && !finalQuestId)) {
      return NextResponse.json(
        { error: "Genau ein Ziel (Location oder Quest) muss angegeben werden." },
        { status: 400 },
      );
    }

    if (finalLocationId && finalLocationId !== existing.locationId) {
      const loc = await prisma.location.findFirst({
        where: { id: finalLocationId, kampagneId: ctx.kampagneId },
        select: { id: true },
      });
      if (!loc) return NextResponse.json({ error: "Location nicht gefunden." }, { status: 400 });
    }
    if (finalQuestId && finalQuestId !== existing.questId) {
      const quest = await prisma.quest.findFirst({
        where: { id: finalQuestId, kampagneId: ctx.kampagneId },
        select: { id: true },
      });
      if (!quest) return NextResponse.json({ error: "Quest gehört nicht zu dieser Kampagne." }, { status: 400 });
    }

    data.locationId = finalLocationId;
    data.questId = finalQuestId;
  }

  const updated = await prisma.mapPlacement.update({
    where: { id: placementId },
    data,
    include: {
      location: { select: { id: true, name: true, art: true, sichtbarkeit: true } },
      quest: { select: { id: true, title: true, status: true, sichtbarkeit: true } },
      linkedMap: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json(updated);
}
