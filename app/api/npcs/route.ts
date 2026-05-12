import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireKampagneApi } from "@/lib/kampagne";
import { visibilityWhere } from "@/lib/visibility";
import { validateImageUrl } from "@/lib/imageUrl";
import { npcCreateSchema, parseOrError } from "@/lib/entitySchemas";
import { checkPresetLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/rateLimit";

export async function GET() {
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Keine Kampagne ausgewählt." }, { status: 401 });

  const npcs = await prisma.nPC.findMany({
    where: { kampagneId: ctx.kampagneId, ...visibilityWhere(ctx) },
    orderBy: { name: "asc" },
    select: {
      id: true, name: true, image: true, status: true, beziehung: true,
      rasse: true, region: true, aktuellePosition: true,
    },
  });
  return NextResponse.json(npcs);
}

export async function POST(req: NextRequest) {
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Keine Kampagne ausgewählt." }, { status: 401 });

  if (!(await checkPresetLimit(ctx.userId, "npc.create")))
    return rateLimitResponse(RATE_LIMITS["npc.create"].windowSeconds);

  const raw = await req.json();
  const parsed = parseOrError(npcCreateSchema, raw);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const { organisationen, ...data } = parsed.data;

  let validatedImage: string | null;
  try {
    validatedImage = validateImageUrl(raw.image);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Bild-URL ungültig" }, { status: 400 });
  }

  const npc = await prisma.nPC.create({
    data: {
      ...data,
      image: validatedImage,
      kampagneId: ctx.kampagneId,
      erstellerId: ctx.userId,
      ...(organisationen && organisationen.length > 0 && {
        organisationen: {
          create: organisationen.map((o) => ({
            organisationId: o.organisationId,
            rolle: o.rolle,
          })),
        },
      }),
    },
  });
  return NextResponse.json(npc, { status: 201 });
}
