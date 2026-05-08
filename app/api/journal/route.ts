import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const typ = req.nextUrl.searchParams.get("typ");
  const userId = session.user!.id as string;
  const isDM = ["DUNGEON_MASTER", "ADMIN"].includes((session.user as { role: string }).role);

  const where =
    typ === "GESCHICHTE"
      ? { typ: "GESCHICHTE" as const }
      : { typ: "TAGEBUCH" as const, userId: isDM ? undefined : userId };

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
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const userId = session.user!.id as string;
  const { titel, inhalt, typ, tags } = await req.json();

  if (!inhalt?.trim()) return NextResponse.json({ error: "Inhalt darf nicht leer sein." }, { status: 400 });
  if (!["TAGEBUCH", "GESCHICHTE"].includes(typ))
    return NextResponse.json({ error: "Ungültiger Typ." }, { status: 400 });

  const entry = await prisma.journalEntry.create({
    data: {
      userId, typ, titel: titel?.trim() || null, inhalt: inhalt.trim(),
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
