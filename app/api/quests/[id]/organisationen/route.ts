import { NextRequest, NextResponse } from "next/server";
import { requireKampagneApi } from "@/lib/kampagne";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

async function canManage(ctx: Awaited<ReturnType<typeof requireKampagneApi>>, questId: string) {
  if (!ctx) return false;
  if (ctx.isDM || ctx.isAdmin) return true;
  const q = await prisma.quest.findUnique({ where: { id: questId }, select: { erstellerId: true } });
  return q?.erstellerId === ctx.userId;
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id: questId } = await params;
  const ctx = await requireKampagneApi();
  if (!await canManage(ctx, questId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { organisationId, rolle } = await req.json();
  const link = await prisma.questOrganisation.upsert({
    where: { questId_organisationId: { questId, organisationId } },
    create: { questId, organisationId, rolle: rolle || null },
    update: { rolle: rolle || null },
  });
  return NextResponse.json(link);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id: questId } = await params;
  const ctx = await requireKampagneApi();
  if (!await canManage(ctx, questId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { organisationId } = await req.json();
  await prisma.questOrganisation.delete({ where: { questId_organisationId: { questId, organisationId } } });
  return NextResponse.json({ ok: true });
}
