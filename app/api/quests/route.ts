import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireKampagneApi } from "@/lib/kampagne";
import { visibilityWhere } from "@/lib/visibility";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const quests = await prisma.quest.findMany({
    where: { kampagneId: ctx.kampagneId, ...visibilityWhere(ctx) },
    orderBy: [{ createdAt: "desc" }],
    include: { objectives: { orderBy: { order: "asc" } } },
  });

  // Strip gmNotes for non-DM/Admin users
  const canSeeGmNotes = ctx.isDM || ctx.isAdmin;
  const result = canSeeGmNotes ? quests : quests.map(({ gmNotes: _, ...q }) => q);

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.title?.trim()) return NextResponse.json({ error: "Titel erforderlich." }, { status: 400 });

  const canSeeGmNotes = ctx.isDM || ctx.isAdmin;

  const quest = await prisma.quest.create({
    data: {
      kampagneId: ctx.kampagneId,
      erstellerId: ctx.userId,
      title: body.title.trim(),
      status: body.status ?? "Aktiv",
      typ: body.typ ?? "Nebenquest",
      prioritaet: body.prioritaet || null,
      summary: body.summary?.trim() || null,
      description: body.description?.trim() || null,
      reward: body.reward?.trim() || null,
      gmNotes: canSeeGmNotes ? (body.gmNotes?.trim() || null) : null,
      deadline: body.deadline?.trim() || null,
      sichtbarkeit: body.sichtbarkeit ?? "public",
    },
  });
  return NextResponse.json(quest, { status: 201 });
}
