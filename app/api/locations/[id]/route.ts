import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireKampagneApi } from "@/lib/kampagne";
import { canSeePrivate } from "@/lib/visibility";
import { locationUpdateSchema, parseOrError } from "@/lib/entitySchemas";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const location = await prisma.location.findFirst({
    where: { id, kampagneId: ctx.kampagneId },
    include: {
      npcs: { select: { id: true, name: true }, orderBy: { name: "asc" } },
      organisationen: { select: { id: true, name: true }, orderBy: { name: "asc" } },
      charaktere: { select: { id: true, name: true }, orderBy: { name: "asc" } },
    },
  });
  if (!location) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  if (location.sichtbarkeit === "privat" && !canSeePrivate(ctx, location.erstellerId))
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  return NextResponse.json(location);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.location.findFirst({
    where: { id, kampagneId: ctx.kampagneId },
    select: { erstellerId: true, sichtbarkeit: true },
  });
  if (!existing) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  if (existing.sichtbarkeit === "privat" && !canSeePrivate(ctx, existing.erstellerId))
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });

  const parsed = parseOrError(locationUpdateSchema, await req.json());
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const { npcIds, orgIds, charakterIds, privateNotizen, ...rest } = parsed.data;

  const allowPrivate = canSeePrivate(ctx, existing.erstellerId);
  const data: Record<string, unknown> = { ...rest };
  if (allowPrivate && privateNotizen !== undefined) data.privateNotizen = privateNotizen;
  if (npcIds !== undefined) data.npcs = { set: npcIds.map((nId) => ({ id: nId })) };
  if (orgIds !== undefined) data.organisationen = { set: orgIds.map((oId) => ({ id: oId })) };
  if (charakterIds !== undefined) data.charaktere = { set: charakterIds.map((cId) => ({ id: cId })) };

  const location = await prisma.location.update({ where: { id }, data });
  return NextResponse.json(location);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.location.findFirst({
    where: { id, kampagneId: ctx.kampagneId },
    select: { erstellerId: true, sichtbarkeit: true },
  });
  if (!existing) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  if (existing.sichtbarkeit === "privat" && !canSeePrivate(ctx, existing.erstellerId))
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  if (!ctx.isDM && !ctx.isAdmin && existing.erstellerId !== ctx.userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.location.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
