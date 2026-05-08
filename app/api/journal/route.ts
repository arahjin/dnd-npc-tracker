import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireKampagneApi } from "@/lib/kampagne";

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

  const { titel, inhalt, typ, tags } = await req.json();

  if (!inhalt?.trim()) return NextResponse.json({ error: "Inhalt darf nicht leer sein." }, { status: 400 });
  if (!["TAGEBUCH", "GESCHICHTE"].includes(typ))
    return NextResponse.json({ error: "Ungültiger Typ." }, { status: 400 });

  const entry = await prisma.journalEntry.create({
    data: {
      userId: ctx.userId,
      kampagneId: ctx.kampagneId,
      typ,
      titel: titel?.trim() || null,
      inhalt: inhalt.trim(),
      ...(tags?.length > 0 && {
        tags: {
          create: tags.map((t: { tagTyp: string; referenzId: string }) => ({
            tagTyp: t.tagTyp, referenzId: t.referenzId,
          })),
        },
      }),
    },
    include: { user: { select: { id: true, name: true } }, tags: true },
  });
  return NextResponse.json(entry, { status: 201 });
}
