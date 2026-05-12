import { NextRequest, NextResponse } from "next/server";
import { requireKampagneApi } from "@/lib/kampagne";
import { prisma } from "@/lib/prisma";
import { journalUpdateSchema, parseOrError } from "@/lib/entitySchemas";

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

  const parsed = parseOrError(journalUpdateSchema, await req.json());
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const { titel, inhalt, tags } = parsed.data;

  const updated = await prisma.$transaction(async (tx) => {
    await tx.journalTag.deleteMany({ where: { entryId: id } });
    return tx.journalEntry.update({
      where: { id },
      data: {
        titel,
        inhalt,
        ...(tags && tags.length > 0 && {
          tags: { create: tags.map((t) => ({ tagTyp: t.tagTyp, referenzId: t.referenzId })) },
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
