import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireKampagneApi } from "@/lib/kampagne";
import { canSeePrivate } from "@/lib/visibility";
import { locationUpdateSchema, parseOrError } from "@/lib/entitySchemas";
import { validateImageUrl } from "@/lib/imageUrl";

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
  const { npcIds, orgIds, charakterIds, privateNotizen, image, ...rest } = parsed.data;

  const allowPrivate = canSeePrivate(ctx, existing.erstellerId);
  const data: Record<string, unknown> = { ...rest };
  if (allowPrivate && privateNotizen !== undefined) data.privateNotizen = privateNotizen;
  if (image !== undefined) {
    try { data.image = validateImageUrl(image); }
    catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Bild-URL ungültig" }, { status: 400 }); }
  }
  if (npcIds !== undefined) {
    if (npcIds.length > 0) {
      const count = await prisma.nPC.count({ where: { id: { in: npcIds }, kampagneId: ctx.kampagneId } });
      if (count !== npcIds.length) return NextResponse.json({ error: "Ungültige NPC-Referenz" }, { status: 400 });
    }
    data.npcs = { set: npcIds.map((nId) => ({ id: nId })) };
  }
  if (orgIds !== undefined) {
    if (orgIds.length > 0) {
      const count = await prisma.organisation.count({ where: { id: { in: orgIds }, kampagneId: ctx.kampagneId } });
      if (count !== orgIds.length) return NextResponse.json({ error: "Ungültige Organisations-Referenz" }, { status: 400 });
    }
    data.organisationen = { set: orgIds.map((oId) => ({ id: oId })) };
  }
  if (charakterIds !== undefined) {
    if (charakterIds.length > 0) {
      const count = await prisma.charakter.count({ where: { id: { in: charakterIds }, kampagneId: ctx.kampagneId } });
      if (count !== charakterIds.length) return NextResponse.json({ error: "Ungültige Charakter-Referenz" }, { status: 400 });
    }
    data.charaktere = { set: charakterIds.map((cId) => ({ id: cId })) };
  }

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
