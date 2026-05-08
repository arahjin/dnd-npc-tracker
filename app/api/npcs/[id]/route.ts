import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const npc = await prisma.nPC.findUnique({ where: { id } });
  if (!npc) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  return NextResponse.json(npc);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { organisationen, ...data } = await req.json();

  const npc = await prisma.$transaction(async (tx) => {
    await tx.nPCOrganisation.deleteMany({ where: { npcId: id } });
    if (organisationen?.length > 0) {
      await tx.nPCOrganisation.createMany({
        data: organisationen.map((o: { organisationId: string; rolle: string }) => ({
          npcId: id,
          organisationId: o.organisationId,
          rolle: o.rolle || null,
        })),
      });
    }
    return tx.nPC.update({ where: { id }, data });
  });

  return NextResponse.json(npc);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.nPC.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
