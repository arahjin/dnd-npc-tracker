import { NextRequest, NextResponse } from "next/server";
import { requireKampagneApi } from "@/lib/kampagne";
import { prisma } from "@/lib/prisma";
import { canSeePrivate } from "@/lib/visibility";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const org = await prisma.organisation.findUnique({
    where: { id },
    include: { mitglieder: { include: { npc: { select: { id: true, name: true, image: true } } } } },
  });
  if (!org) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  if (org.kampagneId && org.kampagneId !== ctx.kampagneId)
    return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  if (org.sichtbarkeit === "privat" && !canSeePrivate(ctx, org.erstellerId))
    return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

  const allowPrivate = canSeePrivate(ctx, org.erstellerId);
  const { privateNotizen, ...safe } = org;
  return NextResponse.json(allowPrivate ? org : safe);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.organisation.findUnique({
    where: { id },
    select: { erstellerId: true, kampagneId: true },
  });
  if (!existing) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  if (existing.kampagneId && existing.kampagneId !== ctx.kampagneId)
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });

  const { erstellerId: _eid, kampagneId: _kid, privateNotizen, ...rest } = await req.json();

  const allowPrivate = canSeePrivate(ctx, existing.erstellerId);
  const data = (allowPrivate && privateNotizen !== undefined)
    ? { ...rest, privateNotizen: privateNotizen || null }
    : rest;

  const org = await prisma.organisation.update({ where: { id }, data });
  return NextResponse.json(org);
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.organisation.findUnique({
    where: { id },
    select: { erstellerId: true, kampagneId: true },
  });
  if (!existing) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  if (existing.kampagneId && existing.kampagneId !== ctx.kampagneId)
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  if (!ctx.isDM && !ctx.isAdmin && existing.erstellerId !== ctx.userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.organisation.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
