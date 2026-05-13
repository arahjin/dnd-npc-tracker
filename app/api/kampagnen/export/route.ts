import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireKampagneApi } from "@/lib/kampagne";

export async function GET() {
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Keine Kampagne ausgewählt." }, { status: 401 });
  if (!ctx.isDM) return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 });

  const [kampagne, npcs, organisationen, locations, charaktere, journal, quests] = await Promise.all([
    prisma.kampagne.findUnique({
      where: { id: ctx.kampagneId },
      select: { id: true, name: true, beschreibung: true, createdAt: true },
    }),
    prisma.nPC.findMany({
      where: { kampagneId: ctx.kampagneId },
      orderBy: { name: "asc" },
      include: {
        organisationen: { select: { rolle: true, organisation: { select: { id: true, name: true } } } },
        locations: { select: { id: true, name: true } },
      },
    }),
    prisma.organisation.findMany({
      where: { kampagneId: ctx.kampagneId },
      orderBy: { name: "asc" },
      include: {
        mitglieder: { select: { rolle: true, npc: { select: { id: true, name: true } } } },
        locations: { select: { id: true, name: true } },
      },
    }),
    prisma.location.findMany({
      where: { kampagneId: ctx.kampagneId },
      orderBy: { name: "asc" },
      include: {
        npcs: { select: { id: true, name: true } },
        organisationen: { select: { id: true, name: true } },
        charaktere: { select: { id: true, name: true } },
      },
    }),
    prisma.charakter.findMany({
      where: { kampagneId: ctx.kampagneId },
      orderBy: { name: "asc" },
      include: {
        user: { select: { name: true, email: true } },
        organisationen: { select: { rolle: true, organisation: { select: { id: true, name: true } } } },
        locations: { select: { id: true, name: true } },
      },
    }),
    prisma.journalEntry.findMany({
      where: { kampagneId: ctx.kampagneId },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        tags: true,
      },
    }),
    prisma.quest.findMany({
      where: { kampagneId: ctx.kampagneId },
      orderBy: { createdAt: "desc" },
      include: {
        objectives: { orderBy: { order: "asc" } },
        npcs: { select: { rolle: true, npc: { select: { id: true, name: true } } } },
        locations: { select: { rolle: true, location: { select: { id: true, name: true } } } },
        organisationen: { select: { rolle: true, organisation: { select: { id: true, name: true } } } },
        charaktere: { select: { rolle: true, charakter: { select: { id: true, name: true } } } },
      },
    }),
  ]);

  const payload = {
    meta: {
      exportedAt: new Date().toISOString(),
      version: "1.0",
      kampagne,
    },
    npcs,
    organisationen,
    locations,
    charaktere,
    journal,
    quests,
  };

  const safeName = (kampagne?.name ?? "kampagne")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const date = new Date().toISOString().slice(0, 10);
  const filename = `lorehub-${safeName}-${date}.json`;

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
