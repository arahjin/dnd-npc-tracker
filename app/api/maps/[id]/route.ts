import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireKampagneApi } from "@/lib/kampagne";
import { validateImageUrl } from "@/lib/imageUrl";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const map = await prisma.map.findFirst({
    where: { id, kampagneId: ctx.kampagneId },
    include: {
      placements: {
        include: {
          location: { select: { id: true, name: true, art: true, sichtbarkeit: true } },
          quest: { select: { id: true, title: true, status: true, sichtbarkeit: true } },
          linkedMap: { select: { id: true, name: true } },
        },
      },
    },
  });
  if (!map) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });

  const placements =
    ctx.isDM || ctx.isAdmin
      ? map.placements
      : map.placements.filter((p) => {
          if (p.location && p.location.sichtbarkeit !== "public") return false;
          if (p.quest && p.quest.sichtbarkeit !== "public") return false;
          return p.location || p.quest;
        });

  return NextResponse.json({ ...map, placements });
}

/** Recursively collect all descendant map ids (children, grandchildren, …). */
async function collectDescendantIds(rootId: string, kampagneId: string): Promise<Set<string>> {
  const out = new Set<string>();
  const queue = [rootId];
  while (queue.length) {
    const current = queue.shift()!;
    const kids = await prisma.map.findMany({
      where: { parentMapId: current, kampagneId },
      select: { id: true },
    });
    for (const k of kids) {
      if (!out.has(k.id)) {
        out.add(k.id);
        queue.push(k.id);
      }
    }
  }
  return out;
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(ctx.isDM || ctx.isAdmin)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const existing = await prisma.map.findFirst({
    where: { id, kampagneId: ctx.kampagneId },
    select: { id: true },
  });
  if (!existing) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige JSON-Daten." }, { status: 400 });
  }
  const b = body as {
    name?: unknown;
    beschreibung?: unknown;
    imageUrl?: unknown;
    imageWidth?: unknown;
    imageHeight?: unknown;
    parentMapId?: unknown;
  };

  type UpdateData = {
    name?: string;
    beschreibung?: string | null;
    imageUrl?: string;
    imageWidth?: number;
    imageHeight?: number;
    parentMapId?: string | null;
  };
  const data: UpdateData = {};
  if (b.name !== undefined) {
    if (typeof b.name !== "string" || !b.name.trim()) {
      return NextResponse.json({ error: "Name ist erforderlich." }, { status: 400 });
    }
    data.name = b.name.trim();
  }
  if (b.beschreibung !== undefined) {
    data.beschreibung =
      typeof b.beschreibung === "string" && b.beschreibung.trim().length > 0
        ? b.beschreibung.trim()
        : null;
  }

  // Image replacement: imageUrl + imageWidth + imageHeight must all be provided together.
  const hasImageUrl = b.imageUrl !== undefined;
  const hasW = b.imageWidth !== undefined;
  const hasH = b.imageHeight !== undefined;
  if (hasImageUrl || hasW || hasH) {
    if (!(hasImageUrl && hasW && hasH)) {
      return NextResponse.json(
        { error: "imageUrl, imageWidth und imageHeight gemeinsam angeben." },
        { status: 400 },
      );
    }
    let imageUrl: string | null;
    try {
      imageUrl = validateImageUrl(typeof b.imageUrl === "string" ? b.imageUrl : "");
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Bild-URL ungültig" },
        { status: 400 },
      );
    }
    if (!imageUrl) return NextResponse.json({ error: "Bild-URL ist erforderlich." }, { status: 400 });
    const imageWidth = Number(b.imageWidth);
    const imageHeight = Number(b.imageHeight);
    if (!Number.isFinite(imageWidth) || !Number.isFinite(imageHeight) || imageWidth <= 0 || imageHeight <= 0) {
      return NextResponse.json({ error: "Ungültige Bildgröße." }, { status: 400 });
    }
    data.imageUrl = imageUrl;
    data.imageWidth = Math.round(imageWidth);
    data.imageHeight = Math.round(imageHeight);
  }

  if (b.parentMapId !== undefined) {
    if (b.parentMapId === null || b.parentMapId === "") {
      data.parentMapId = null;
    } else if (typeof b.parentMapId !== "string") {
      return NextResponse.json({ error: "Ungültige Parent-Karte." }, { status: 400 });
    } else {
      if (b.parentMapId === id) {
        return NextResponse.json({ error: "Karte darf nicht ihr eigener Parent sein." }, { status: 400 });
      }
      const parent = await prisma.map.findFirst({
        where: { id: b.parentMapId, kampagneId: ctx.kampagneId },
        select: { id: true },
      });
      if (!parent) return NextResponse.json({ error: "Parent-Karte nicht gefunden." }, { status: 400 });
      // Cycle check: parent must not be a descendant of this map.
      const descendants = await collectDescendantIds(id, ctx.kampagneId);
      if (descendants.has(b.parentMapId)) {
        return NextResponse.json({ error: "Zyklische Hierarchie nicht erlaubt." }, { status: 400 });
      }
      data.parentMapId = b.parentMapId;
    }
  }

  const updated = await prisma.map.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(ctx.isDM || ctx.isAdmin)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const existing = await prisma.map.findFirst({
    where: { id, kampagneId: ctx.kampagneId },
    select: { id: true },
  });
  if (!existing) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });

  await prisma.map.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
