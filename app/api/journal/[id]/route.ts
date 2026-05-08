import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  const { id } = await params;
  const userId = session.user!.id as string;
  const isDM = (session.user as { role: string }).role === "DUNGEON_MASTER";

  const entry = await prisma.journalEntry.findUnique({ where: { id } });
  if (!entry) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  if (!isDM && entry.userId !== userId)
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 });

  await prisma.journalEntry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
