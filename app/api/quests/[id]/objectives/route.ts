import { NextRequest, NextResponse } from "next/server";
import { requireKampagneApi } from "@/lib/kampagne";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id: questId } = await params;
  const ctx = await requireKampagneApi();
  if (!ctx || (!ctx.isDM && !ctx.isAdmin)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { label } = await req.json();
  if (!label?.trim()) return NextResponse.json({ error: "Label erforderlich." }, { status: 400 });
  const count = await prisma.questObjective.count({ where: { questId } });
  const obj = await prisma.questObjective.create({ data: { questId, label: label.trim(), order: count } });
  return NextResponse.json(obj);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id: questId } = await params;
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { objectiveId, done } = await req.json();
  const obj = await prisma.questObjective.update({ where: { id: objectiveId, questId }, data: { done } });
  return NextResponse.json(obj);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id: questId } = await params;
  const ctx = await requireKampagneApi();
  if (!ctx || (!ctx.isDM && !ctx.isAdmin)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { objectiveId } = await req.json();
  await prisma.questObjective.delete({ where: { id: objectiveId, questId } });
  return NextResponse.json({ ok: true });
}
