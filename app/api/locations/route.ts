import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireKampagneApi } from "@/lib/kampagne";
import { visibilityWhere } from "@/lib/visibility";
import { locationCreateSchema, parseOrError } from "@/lib/entitySchemas";
import { validateImageUrl } from "@/lib/imageUrl";
import { checkPresetLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/rateLimit";

export async function GET() {
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const locations = await prisma.location.findMany({
    where: { kampagneId: ctx.kampagneId, ...visibilityWhere(ctx) },
    orderBy: { name: "asc" },
    include: {
      npcs: { select: { id: true, name: true } },
      organisationen: { select: { id: true, name: true } },
      charaktere: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json(locations);
}

export async function POST(req: NextRequest) {
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!(await checkPresetLimit(ctx.userId, "location.create")))
    return rateLimitResponse(RATE_LIMITS["location.create"].windowSeconds);

  const parsed = parseOrError(locationCreateSchema, await req.json());
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const { npcIds, orgIds, charakterIds, image, ...rest } = parsed.data;

  let validatedImage: string | null;
  try { validatedImage = validateImageUrl(image); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Bild-URL ungültig" }, { status: 400 }); }

  if (Array.isArray(npcIds) && npcIds.length > 0) {
    const count = await prisma.nPC.count({ where: { id: { in: npcIds }, kampagneId: ctx.kampagneId } });
    if (count !== npcIds.length) return NextResponse.json({ error: "Ungültige NPC-Referenz" }, { status: 400 });
  }
  if (Array.isArray(orgIds) && orgIds.length > 0) {
    const count = await prisma.organisation.count({ where: { id: { in: orgIds }, kampagneId: ctx.kampagneId } });
    if (count !== orgIds.length) return NextResponse.json({ error: "Ungültige Organisations-Referenz" }, { status: 400 });
  }
  if (Array.isArray(charakterIds) && charakterIds.length > 0) {
    const count = await prisma.charakter.count({ where: { id: { in: charakterIds }, kampagneId: ctx.kampagneId } });
    if (count !== charakterIds.length) return NextResponse.json({ error: "Ungültige Charakter-Referenz" }, { status: 400 });
  }

  const location = await prisma.location.create({
    data: {
      ...rest,
      image: validatedImage,
      kampagneId: ctx.kampagneId,
      erstellerId: ctx.userId,
      ...(npcIds && npcIds.length > 0 && { npcs: { connect: npcIds.map((id) => ({ id })) } }),
      ...(orgIds && orgIds.length > 0 && { organisationen: { connect: orgIds.map((id) => ({ id })) } }),
      ...(charakterIds && charakterIds.length > 0 && { charaktere: { connect: charakterIds.map((id) => ({ id })) } }),
    },
  });

  return NextResponse.json(location, { status: 201 });
}
