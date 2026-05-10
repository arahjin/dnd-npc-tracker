import { NextRequest, NextResponse } from "next/server";
import { requireKampagneApi } from "@/lib/kampagne";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

async function loadAndAuthorize(id: string, ctx: { userId: string; isDM: boolean; isAdmin: boolean; kampagneId: string }) {
  const entry = await prisma.journalEntry.findUnique({
    where: { id },
    select: { id: true, userId: true, kampagneId: true },
  });
  if (!entry) return { entry: null, error: NextResponse.json({ error: "Nicht gefunden." }, { status: 404 }) };
  if (entry.kampagneId && entry.kampagneId !== ctx.kampagneId)
    return { entry: null, error: NextResponse.json({ error: "Nicht gefunden." }, { status: 404 }) };
  if (!ctx.isDM && !ctx.isAdmin && entry.userId !== ctx.userId)
    return { entry: null, error: NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 }) };
  return { entry, error: null as null };
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { entry, error } = await loadAndAuthorize(id, ctx);
  if (error) return error;
  void entry;

  const { titel, inhalt, tags } = await req.json();
  if (!inhalt?.trim()) return NextResponse.json({ error: "Inhalt darf nicht leer sein." }, { status: 400 });

  const updated = await prisma.$transaction(async (tx) => {
    await tx.journalTag.deleteMany({ where: { entryId: id } });
    return tx.journalEntry.update({
      where: { id },
      data: {
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
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await loadAndAuthorize(id, ctx);
  if (error) return error;

  await prisma.journalEntry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
