import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireKampagne } from "@/lib/kampagne";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ctx = await requireKampagne();
    const location = await prisma.location.findFirst({
      where: { id, kampagneId: ctx.kampagneId },
      include: {
        npcs: { select: { id: true, name: true }, orderBy: { name: "asc" } },
        organisationen: { select: { id: true, name: true }, orderBy: { name: "asc" } },
        charaktere: { select: { id: true, name: true }, orderBy: { name: "asc" } },
      },
    });
    if (!location) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
    return NextResponse.json(location);
  } catch {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ctx = await requireKampagne();
    const existing = await prisma.location.findFirst({ where: { id, kampagneId: ctx.kampagneId } });
    if (!existing) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });

    const { name, art, land, region, population, klima, floraFauna, wissenswertes, npcIds = [], orgIds = [], charakterIds = [] } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name ist erforderlich." }, { status: 400 });
    }

    // Disconnect all existing, then reconnect selected
    const location = await prisma.location.update({
      where: { id },
      data: {
        name: name.trim(),
        art: art || null,
        land: land || null,
        region: region || null,
        population: population != null && population !== "" ? Number(population) : null,
        klima: klima || null,
        floraFauna: floraFauna || null,
        wissenswertes: wissenswertes || null,
        npcs: { set: (npcIds as string[]).map((npcId) => ({ id: npcId })) },
        organisationen: { set: (orgIds as string[]).map((orgId) => ({ id: orgId })) },
        charaktere: { set: (charakterIds as string[]).map((cId) => ({ id: cId })) },
      },
    });

    return NextResponse.json(location);
  } catch {
    return NextResponse.json({ error: "Fehler beim Speichern." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ctx = await requireKampagne();
    const existing = await prisma.location.findFirst({ where: { id, kampagneId: ctx.kampagneId } });
    if (!existing) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
    await prisma.location.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Fehler beim Löschen." }, { status: 500 });
  }
}
