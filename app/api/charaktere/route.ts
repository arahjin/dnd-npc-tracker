import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireKampagneApi } from "@/lib/kampagne";
import { charakterVisibilityWhere } from "@/lib/visibility";

export async function GET() {
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Keine Kampagne ausgewählt." }, { status: 401 });

  const charaktere = await prisma.charakter.findMany({
    where: { kampagneId: ctx.kampagneId, ...charakterVisibilityWhere(ctx) },
    orderBy: { name: "asc" },
    include: { user: { select: { id: true, name: true } } },
  });
  return NextResponse.json(charaktere);
}

export async function POST(req: NextRequest) {
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Keine Kampagne ausgewählt." }, { status: 401 });

  const { organisationen, ...data } = await req.json();

  const charakter = await prisma.charakter.create({
    data: {
      ...data,
      userId: ctx.userId,
      kampagneId: ctx.kampagneId,
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
  return NextResponse.json(charakter, { status: 201 });
}
