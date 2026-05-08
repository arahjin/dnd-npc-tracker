import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const npcs = await prisma.nPC.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(npcs);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { organisationen, ...data } = body;
  const npc = await prisma.nPC.create({
    data: {
      ...data,
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
