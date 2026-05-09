import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireKampagneApi } from "@/lib/kampagne";
import { visibilityWhere } from "@/lib/visibility";

export async function GET() {
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Keine Kampagne ausgewählt." }, { status: 401 });

  const orgs = await prisma.organisation.findMany({
    where: { kampagneId: ctx.kampagneId, ...visibilityWhere(ctx) },
    orderBy: { name: "asc" },
    include: { mitglieder: { include: { npc: true } } },
  });
  return NextResponse.json(orgs);
}

export async function POST(req: NextRequest) {
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Keine Kampagne ausgewählt." }, { status: 401 });

  const { erstellerId: _eid, ...body } = await req.json();
  const org = await prisma.organisation.create({
    data: { ...body, kampagneId: ctx.kampagneId, erstellerId: ctx.userId },
  });
  return NextResponse.json(org, { status: 201 });
}
