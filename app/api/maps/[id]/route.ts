import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireKampagneApi } from "@/lib/kampagne";

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
        },
      },
    },
  });
  if (!map) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });

  const placements =
    ctx.isDM || ctx.isAdmin
      ? map.placements
      : map.placements.filter((p) => p.location.sichtbarkeit === "public");

  return NextResponse.json({ ...map, placements });
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
  const b = body as { name?: unknown; beschreibung?: unknown };

  const data: { name?: string; beschreibung?: string | null } = {};
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
