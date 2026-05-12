import { NextRequest, NextResponse } from "next/server";
import { requireKampagneApi } from "@/lib/kampagne";
import { prisma } from "@/lib/prisma";
import { validateImageUrl } from "@/lib/imageUrl";
import { charakterUpdateSchema, parseOrError } from "@/lib/entitySchemas";
type Params = { params: Promise<{ id: string }> };

function canEdit(ctx: { userId: string; isDM: boolean; isAdmin: boolean }, ownerId: string) {
  return ctx.isDM || ctx.isAdmin || ownerId === ctx.userId;
}

export async function GET(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const charakter = await prisma.charakter.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true } },
      organisationen: { include: { organisation: true }, orderBy: { organisation: { name: "asc" } } },
    },
  });
  if (!charakter) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  if (charakter.kampagneId && charakter.kampagneId !== ctx.kampagneId)
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });

  // Apply visibility (charaktere use userId-based visibility, not erstellerId)
  if (!ctx.isDM && !ctx.isAdmin && charakter.sichtbarkeit === "privat" && charakter.userId !== ctx.userId)
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });

  return NextResponse.json(charakter);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.charakter.findUnique({
    where: { id },
    select: { userId: true, kampagneId: true },
  });
  if (!existing) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  if (existing.kampagneId && existing.kampagneId !== ctx.kampagneId)
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  if (!canEdit(ctx, existing.userId))
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 });

  const raw = await req.json();
  const parsed = parseOrError(charakterUpdateSchema, raw);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const { organisationen, ...rest } = parsed.data;

  const data: Record<string, unknown> = { ...rest };
  if (raw.image !== undefined) {
    try { data.image = validateImageUrl(raw.image); }
    catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Bild-URL ungültig" }, { status: 400 }); }
  }

  const charakter = await prisma.$transaction(async (tx) => {
    if (organisationen !== undefined) {
      await tx.charakterOrganisation.deleteMany({ where: { charakterId: id } });
      if (organisationen.length > 0) {
        await tx.charakterOrganisation.createMany({
          data: organisationen.map((o) => ({
            charakterId: id, organisationId: o.organisationId, rolle: o.rolle,
          })),
        });
      }
    }
    return tx.charakter.update({ where: { id }, data });
  });
  return NextResponse.json(charakter);
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.charakter.findUnique({
    where: { id },
    select: { userId: true, kampagneId: true },
  });
  if (!existing) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  if (existing.kampagneId && existing.kampagneId !== ctx.kampagneId)
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  if (!canEdit(ctx, existing.userId))
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 });

  await prisma.charakter.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
