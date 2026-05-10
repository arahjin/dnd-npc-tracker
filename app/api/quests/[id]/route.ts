import { NextRequest, NextResponse } from "next/server";
import { requireKampagneApi } from "@/lib/kampagne";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const quest = await prisma.quest.findUnique({
    where: { id },
    include: {
      objectives: { orderBy: { order: "asc" } },
      npcs: { include: { npc: { select: { id: true, name: true, image: true } } } },
      locations: { include: { location: { select: { id: true, name: true, art: true } } } },
      organisationen: { include: { organisation: { select: { id: true, name: true, typ: true } } } },
      charaktere: { include: { charakter: { select: { id: true, name: true, image: true } } } },
      journalEntries: { include: { entry: { select: { id: true, titel: true, typ: true, createdAt: true } } } },
      vorlaeuferVon: { include: { nachfolgerQuest: { select: { id: true, title: true, status: true } } } },
      nachfolgerVon: { include: { vorlaeuferQuest: { select: { id: true, title: true, status: true } } } },
    },
  });
  if (!quest || quest.kampagneId !== ctx.kampagneId) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  if (quest.sichtbarkeit !== "public" && !ctx.isDM && !ctx.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json(quest);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!ctx.isDM && !ctx.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const quest = await prisma.quest.update({
    where: { id },
    data: {
      title: body.title?.trim(),
      status: body.status,
      typ: body.typ,
      prioritaet: body.prioritaet || null,
      summary: body.summary?.trim() || null,
      description: body.description?.trim() || null,
      reward: body.reward?.trim() || null,
      gmNotes: body.gmNotes?.trim() || null,
      deadline: body.deadline?.trim() || null,
      sichtbarkeit: body.sichtbarkeit,
    },
  });
  return NextResponse.json(quest);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!ctx.isDM && !ctx.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await prisma.quest.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
