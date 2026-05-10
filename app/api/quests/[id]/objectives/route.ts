import { NextRequest, NextResponse } from "next/server";
import { requireKampagneApi } from "@/lib/kampagne";
import { prisma } from "@/lib/prisma";
import { loadQuestForAuth, canManageQuest } from "@/lib/questAuth";
import {
  questObjectiveCreateSchema,
  questObjectiveUpdateSchema,
  questObjectiveDeleteSchema,
} from "@/lib/questSchemas";

type Params = { params: Promise<{ id: string }> };

function bad(msg: string) { return NextResponse.json({ error: msg }, { status: 400 }); }

export async function POST(req: NextRequest, { params }: Params) {
  const { id: questId } = await params;
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const quest = await loadQuestForAuth(questId, ctx);
  if (!quest) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  if (!canManageQuest(ctx, quest)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = questObjectiveCreateSchema.safeParse(await req.json());
  if (!parsed.success) return bad(parsed.error.issues[0]?.message ?? "Ungültige Eingabe.");
  const { label } = parsed.data;

  // Atomic ordering: derive next order in a single transaction
  const obj = await prisma.$transaction(async (tx) => {
    const last = await tx.questObjective.findFirst({
      where: { questId },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    return tx.questObjective.create({
      data: { questId, label, order: (last?.order ?? -1) + 1 },
    });
  });
  return NextResponse.json(obj);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id: questId } = await params;
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const quest = await loadQuestForAuth(questId, ctx);
  if (!quest) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  if (!canManageQuest(ctx, quest)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = questObjectiveUpdateSchema.safeParse(await req.json());
  if (!parsed.success) return bad(parsed.error.issues[0]?.message ?? "Ungültige Eingabe.");
  const { objectiveId, done } = parsed.data;

  const obj = await prisma.questObjective.update({
    where: { id: objectiveId, questId },
    data: { done },
  });
  return NextResponse.json(obj);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id: questId } = await params;
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const quest = await loadQuestForAuth(questId, ctx);
  if (!quest) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  if (!canManageQuest(ctx, quest)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = questObjectiveDeleteSchema.safeParse(await req.json());
  if (!parsed.success) return bad(parsed.error.issues[0]?.message ?? "Ungültige Eingabe.");
  const { objectiveId } = parsed.data;

  await prisma.questObjective.delete({ where: { id: objectiveId, questId } });
  return NextResponse.json({ ok: true });
}
