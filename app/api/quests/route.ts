import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireKampagneApi } from "@/lib/kampagne";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const where: Record<string, unknown> = { kampagneId: ctx.kampagneId };
  if (!ctx.isDM && !ctx.isAdmin) where.sichtbarkeit = "public";
  const quests = await prisma.quest.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
    include: { objectives: { orderBy: { order: "asc" } } },
  });
  return NextResponse.json(quests);
}

export async function POST(req: NextRequest) {
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!ctx.isDM && !ctx.isAdmin) return NextResponse.json({ error: "Nur DMs können Quests erstellen." }, { status: 403 });
  const body = await req.json();
  if (!body.title?.trim()) return NextResponse.json({ error: "Titel erforderlich." }, { status: 400 });
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
      gmNotes: body.gmNotes?.trim() || null,
      deadline: body.deadline?.trim() || null,
      sichtbarkeit: body.sichtbarkeit ?? "public",
    },
  });
  return NextResponse.json(quest, { status: 201 });
}
