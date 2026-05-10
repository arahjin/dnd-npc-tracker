import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireKampagneApi } from "@/lib/kampagne";
import { charakterVisibilityWhere } from "@/lib/visibility";
import { validateImageUrl } from "@/lib/imageUrl";
import { charakterCreateSchema, parseOrError } from "@/lib/entitySchemas";
import { checkPresetLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/rateLimit";

export async function GET() {
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Keine Kampagne ausgewählt." }, { status: 401 });

  const charaktere = await prisma.charakter.findMany({
    where: { kampagneId: ctx.kampagneId, ...charakterVisibilityWhere(ctx) },
    orderBy: { name: "asc" },
    include: { user: { select: { id: true, name: true } } },
  });
  return NextResponse.json(charaktere);
}

export async function POST(req: NextRequest) {
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Keine Kampagne ausgewählt." }, { status: 401 });

  if (!(await checkPresetLimit(ctx.userId, "charakter.create")))
    return rateLimitResponse(RATE_LIMITS["charakter.create"].windowSeconds);

  const raw = await req.json();
  const parsed = parseOrError(charakterCreateSchema, raw);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const { organisationen, ...data } = parsed.data;

  let validatedImage: string | null;
  try { validatedImage = validateImageUrl(raw.image); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Bild-URL ungültig" }, { status: 400 }); }

  const charakter = await prisma.charakter.create({
    data: {
      ...data,
      image: validatedImage,
      userId: ctx.userId,
      kampagneId: ctx.kampagneId,
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
  return NextResponse.json(charakter, { status: 201 });
}
