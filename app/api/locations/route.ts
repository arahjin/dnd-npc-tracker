import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireKampagne } from "@/lib/kampagne";
import { visibilityWhere } from "@/lib/visibility";

export async function GET() {
  try {
    const ctx = await requireKampagne();
    const locations = await prisma.location.findMany({
      where: { kampagneId: ctx.kampagneId, ...visibilityWhere(ctx) },
      orderBy: { name: "asc" },
      include: {
        npcs: { select: { id: true, name: true } },
        organisationen: { select: { id: true, name: true } },
        charaktere: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json(locations);
  } catch {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireKampagne();
    const { name, art, land, region, population, klima, floraFauna, wissenswertes, sichtbarkeit, privateNotizen, npcIds = [], orgIds = [], charakterIds = [] } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name ist erforderlich." }, { status: 400 });
    }

    const location = await prisma.location.create({
      data: {
        kampagneId: ctx.kampagneId,
        name: name.trim(),
        art: art || null,
        land: land || null,
        region: region || null,
        population: population != null && population !== "" ? Number(population) : null,
        klima: klima || null,
        floraFauna: floraFauna || null,
        wissenswertes: wissenswertes || null,
        sichtbarkeit: sichtbarkeit || "public",
        privateNotizen: privateNotizen || null,
        erstellerId: ctx.userId,
        npcs: { connect: (npcIds as string[]).map((id) => ({ id })) },
        organisationen: { connect: (orgIds as string[]).map((id) => ({ id })) },
        charaktere: { connect: (charakterIds as string[]).map((id) => ({ id })) },
      },
    });

    return NextResponse.json(location, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Fehler beim Erstellen." }, { status: 500 });
  }
}
