import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireKampagneApi } from "@/lib/kampagne";

export async function GET() {
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Keine Kampagne ausgewählt." }, { status: 401 });

  const orgs = await prisma.organisation.findMany({
    where: { kampagneId: ctx.kampagneId },
    orderBy: { name: "asc" },
    include: { mitglieder: { include: { npc: true } } },
  });
  return NextResponse.json(orgs);
}

export async function POST(req: NextRequest) {
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Keine Kampagne ausgewählt." }, { status: 401 });

  const body = await req.json();
  const org = await prisma.organisation.create({
    data: { ...body, kampagneId: ctx.kampagneId },
  });
  return NextResponse.json(org, { status: 201 });
}
