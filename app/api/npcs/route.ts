import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireKampagneApi } from "@/lib/kampagne";
import { visibilityWhere } from "@/lib/visibility";

export async function GET() {
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Keine Kampagne ausgewählt." }, { status: 401 });

  const npcs = await prisma.nPC.findMany({
    where: { kampagneId: ctx.kampagneId, ...visibilityWhere(ctx) },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(npcs);
}

export async function POST(req: NextRequest) {
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Keine Kampagne ausgewählt." }, { status: 401 });

  const body = await req.json();
  const { organisationen, erstellerId: _eid, ...data } = body;
  const npc = await prisma.nPC.create({
    data: {
      ...data,
      kampagneId: ctx.kampagneId,
      erstellerId: ctx.userId,
      ...(organisationen?.length > 0 && {
        organisationen: {
          create: organisationen.map((o: { organisationId: string; rolle: string }) => ({
            organisationId: o.organisationId,
            rolle: o.rolle || null,
          })),
        },
      }),
    },
  });
  return NextResponse.json(npc, { status: 201 });
}
