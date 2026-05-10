import { NextRequest, NextResponse } from "next/server";
import { requireKampagneApi } from "@/lib/kampagne";
import { prisma } from "@/lib/prisma";
import { loadQuestForAuth, canManageQuest } from "@/lib/questAuth";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id: questId } = await params;
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const quest = await loadQuestForAuth(questId, ctx);
  if (!quest) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  if (!canManageQuest(ctx, quest)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { organisationId, rolle } = await req.json();
  if (!organisationId) return NextResponse.json({ error: "organisationId fehlt" }, { status: 400 });
  const org = await prisma.organisation.findUnique({ where: { id: organisationId }, select: { kampagneId: true } });
  if (!org || (org.kampagneId && org.kampagneId !== ctx.kampagneId))
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });

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
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const quest = await loadQuestForAuth(questId, ctx);
  if (!quest) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  if (!canManageQuest(ctx, quest)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { organisationId } = await req.json();
  if (!organisationId) return NextResponse.json({ error: "organisationId fehlt" }, { status: 400 });
  await prisma.questOrganisation.delete({ where: { questId_organisationId: { questId, organisationId } } });
  return NextResponse.json({ ok: true });
}
