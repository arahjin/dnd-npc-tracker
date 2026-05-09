import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireKampagneApi } from "@/lib/kampagne";

export async function GET() {
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Keine Kampagne ausgewählt." }, { status: 401 });

  const [npcs, orgs, chars, locations] = await Promise.all([
    prisma.nPC.findMany({ where: { kampagneId: ctx.kampagneId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.organisation.findMany({ where: { kampagneId: ctx.kampagneId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.charakter.findMany({ where: { kampagneId: ctx.kampagneId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.location.findMany({ where: { kampagneId: ctx.kampagneId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  return NextResponse.json([
    ...npcs.map((n) => ({ id: n.id, label: n.name, typ: "PERSON" })),
    ...orgs.map((o) => ({ id: o.id, label: o.name, typ: "ORGANISATION" })),
    ...chars.map((c) => ({ id: c.id, label: c.name, typ: "CHARAKTER" })),
    ...locations.map((l) => ({ id: l.id, label: l.name, typ: "LOCATION" })),
  ]);
}
