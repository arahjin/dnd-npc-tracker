import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function getEntry(id: string) {
  return prisma.journalEntry.findUnique({ where: { id } });
}

function isPrivileged(role: string) {
  return ["DUNGEON_MASTER", "ADMIN"].includes(role);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  const { id } = await params;
  const userId = session.user!.id as string;
  const role = (session.user as { role: string }).role;

  const entry = await getEntry(id);
  if (!entry) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  if (!isPrivileged(role) && entry.userId !== userId)
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 });

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

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  const { id } = await params;
  const userId = session.user!.id as string;
  const role = (session.user as { role: string }).role;

  const entry = await getEntry(id);
  if (!entry) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  if (!isPrivileged(role) && entry.userId !== userId)
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 });

  await prisma.journalEntry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
