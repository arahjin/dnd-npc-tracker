import { NextRequest, NextResponse } from "next/server";
import { requireKampagneApi } from "@/lib/kampagne";
import { prisma } from "@/lib/prisma";
import { canSeePrivate } from "@/lib/visibility";
import { validateImageUrl } from "@/lib/imageUrl";
import { npcUpdateSchema, parseOrError } from "@/lib/entitySchemas";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const npc = await prisma.nPC.findUnique({ where: { id } });
  if (!npc) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  if (npc.kampagneId && npc.kampagneId !== ctx.kampagneId)
    return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  if (npc.sichtbarkeit === "privat" && !canSeePrivate(ctx, npc.erstellerId))
    return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

  // Strip privateNotizen for users who can't see them
  const allowPrivate = canSeePrivate(ctx, npc.erstellerId);
  const { privateNotizen, ...safe } = npc;
  return NextResponse.json(allowPrivate ? npc : safe);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.nPC.findUnique({
    where: { id },
    select: { erstellerId: true, kampagneId: true, sichtbarkeit: true },
  });
  if (!existing) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  if (existing.kampagneId && existing.kampagneId !== ctx.kampagneId)
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  if (existing.sichtbarkeit === "privat" && !canSeePrivate(ctx, existing.erstellerId))
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });

  const raw = await req.json();
  const parsed = parseOrError(npcUpdateSchema, raw);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const { organisationen, privateNotizen, ...rest } = parsed.data;

  let validatedImage: string | null | undefined = undefined;
  if (raw.image !== undefined) {
    try { validatedImage = validateImageUrl(raw.image); }
    catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Bild-URL ungültig" }, { status: 400 }); }
  }

  const allowPrivate = canSeePrivate(ctx, existing.erstellerId);
  const baseData: Record<string, unknown> = { ...rest };
  if (validatedImage !== undefined) baseData.image = validatedImage;
  if (allowPrivate && privateNotizen !== undefined) baseData.privateNotizen = privateNotizen;

  const npc = await prisma.$transaction(async (tx) => {
    if (organisationen !== undefined) {
      await tx.nPCOrganisation.deleteMany({ where: { npcId: id } });
      if (organisationen.length > 0) {
        await tx.nPCOrganisation.createMany({
          data: organisationen.map((o) => ({
            npcId: id,
            organisationId: o.organisationId,
            rolle: o.rolle,
          })),
        });
      }
    }
    return tx.nPC.update({ where: { id }, data: baseData });
  });

  return NextResponse.json(npc);
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.nPC.findUnique({
    where: { id },
    select: { erstellerId: true, kampagneId: true },
  });
  if (!existing) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  if (existing.kampagneId && existing.kampagneId !== ctx.kampagneId)
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  // Only DM/Admin or creator may delete
  if (!ctx.isDM && !ctx.isAdmin && existing.erstellerId !== ctx.userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.nPC.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
