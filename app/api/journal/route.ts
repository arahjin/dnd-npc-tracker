import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireKampagneApi } from "@/lib/kampagne";
import { checkPresetLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/rateLimit";
import { journalCreateSchema, parseOrError } from "@/lib/entitySchemas";

export async function GET(req: NextRequest) {
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Keine Kampagne ausgewählt." }, { status: 401 });

  const typ = req.nextUrl.searchParams.get("typ");

  const where =
    typ === "GESCHICHTE"
      ? { kampagneId: ctx.kampagneId, typ: "GESCHICHTE" as const }
      : {
          kampagneId: ctx.kampagneId,
          typ: "TAGEBUCH" as const,
          ...(ctx.isDM ? {} : { userId: ctx.userId }),
        };

  const entries = await prisma.journalEntry.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true } },
      tags: true,
    },
  });
  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Keine Kampagne ausgewählt." }, { status: 401 });

  if (!(await checkPresetLimit(ctx.userId, "journal.create")))
    return rateLimitResponse(RATE_LIMITS["journal.create"].windowSeconds);

  const parsed = parseOrError(journalCreateSchema, await req.json());
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const { titel, inhalt, typ, tags } = parsed.data;

  const entry = await prisma.journalEntry.create({
    data: {
      userId: ctx.userId,
      kampagneId: ctx.kampagneId,
      typ,
      titel,
      inhalt,
      ...(tags && tags.length > 0 && {
        tags: { create: tags.map((t) => ({ tagTyp: t.tagTyp, referenzId: t.referenzId })) },
      }),
    },
    include: { user: { select: { id: true, name: true } }, tags: true },
  });
  return NextResponse.json(entry, { status: 201 });
}
