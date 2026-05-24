import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireKampagneApi } from "@/lib/kampagne";
import { validateImageUrl } from "@/lib/imageUrl";

export async function GET() {
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const maps = await prisma.map.findMany({
    where: { kampagneId: ctx.kampagneId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      beschreibung: true,
      imageUrl: true,
      imageWidth: true,
      imageHeight: true,
      parentMapId: true,
      createdAt: true,
      _count: { select: { placements: true } },
    },
  });
  return NextResponse.json(maps);
}

export async function POST(req: NextRequest) {
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(ctx.isDM || ctx.isAdmin)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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

  const name = typeof b.name === "string" ? b.name.trim() : "";
  if (!name) return NextResponse.json({ error: "Name ist erforderlich." }, { status: 400 });

  const beschreibung =
    typeof b.beschreibung === "string" && b.beschreibung.trim().length > 0
      ? b.beschreibung.trim()
      : null;

  const imageUrlRaw = typeof b.imageUrl === "string" ? b.imageUrl : "";
  let imageUrl: string | null;
  try {
    imageUrl = validateImageUrl(imageUrlRaw);
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

  let parentMapId: string | null = null;
  if (b.parentMapId !== undefined && b.parentMapId !== null && b.parentMapId !== "") {
    if (typeof b.parentMapId !== "string") {
      return NextResponse.json({ error: "Ungültige Parent-Karte." }, { status: 400 });
    }
    const parent = await prisma.map.findFirst({
      where: { id: b.parentMapId, kampagneId: ctx.kampagneId },
      select: { id: true },
    });
    if (!parent) return NextResponse.json({ error: "Parent-Karte nicht gefunden." }, { status: 400 });
    parentMapId = b.parentMapId;
  }

  const created = await prisma.map.create({
    data: {
      kampagneId: ctx.kampagneId,
      erstellerId: ctx.userId,
      name,
      beschreibung,
      imageUrl,
      imageWidth: Math.round(imageWidth),
      imageHeight: Math.round(imageHeight),
      parentMapId,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
