import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireKampagneApi } from "@/lib/kampagne";
import { visibilityWhere } from "@/lib/visibility";
import { organisationCreateSchema, parseOrError } from "@/lib/entitySchemas";

export async function GET() {
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Keine Kampagne ausgewählt." }, { status: 401 });

  const orgs = await prisma.organisation.findMany({
    where: { kampagneId: ctx.kampagneId, ...visibilityWhere(ctx) },
    orderBy: { name: "asc" },
    include: { mitglieder: { include: { npc: { select: { id: true, name: true, image: true } } } } },
  });
  return NextResponse.json(orgs);
}

export async function POST(req: NextRequest) {
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Keine Kampagne ausgewählt." }, { status: 401 });

  const parsed = parseOrError(organisationCreateSchema, await req.json());
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const org = await prisma.organisation.create({
    data: { ...parsed.data, kampagneId: ctx.kampagneId, erstellerId: ctx.userId },
  });
  return NextResponse.json(org, { status: 201 });
}
