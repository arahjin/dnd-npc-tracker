import { NextRequest, NextResponse } from "next/server";
import { requireKampagneApi } from "@/lib/kampagne";
import { canSeePrivate } from "@/lib/visibility";
import { prisma } from "@/lib/prisma";
import { loadQuestForAuth, canManageQuest } from "@/lib/questAuth";
import { questUpdateSchema } from "@/lib/questSchemas";

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

  if (!quest || quest.kampagneId !== ctx.kampagneId)
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });

  // Private quests: only visible to creator, DM, or Admin
  if (quest.sichtbarkeit === "privat" && !canSeePrivate(ctx, quest.erstellerId))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Strip gmNotes for non-DM/Admin users
  const canSeeGm = ctx.isDM || ctx.isAdmin;
  const { gmNotes, ...questWithoutGm } = quest;
  return NextResponse.json(canSeeGm ? quest : questWithoutGm);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const quest = await loadQuestForAuth(id, ctx);
  if (!quest) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  if (!canManageQuest(ctx, quest))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = questUpdateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe.", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const body = parsed.data;
  const canSeeGm = ctx.isDM || ctx.isAdmin;

  const updated = await prisma.quest.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.typ !== undefined && { typ: body.typ }),
      ...(body.prioritaet !== undefined && { prioritaet: body.prioritaet ?? null }),
      ...(body.summary !== undefined && { summary: body.summary }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.reward !== undefined && { reward: body.reward }),
      ...(canSeeGm && body.gmNotes !== undefined && { gmNotes: body.gmNotes }),
      ...(body.deadline !== undefined && { deadline: body.deadline }),
      ...(body.sichtbarkeit !== undefined && { sichtbarkeit: body.sichtbarkeit }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const quest = await loadQuestForAuth(id, ctx);
  if (!quest) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  if (!canManageQuest(ctx, quest))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.quest.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
