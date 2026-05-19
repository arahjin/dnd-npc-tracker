import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// PATCH — update the current user's profile (currently: display name)
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht eingeloggt." }, { status: 401 });
  }
  const userId = session.user.id as string;

  let body: unknown;
  try { body = await req.json(); } catch { body = {}; }
  const raw = (body as { name?: unknown }).name;
  const name = typeof raw === "string" ? raw.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Name ist erforderlich." }, { status: 400 });
  }
  if (name.length > 100) {
    return NextResponse.json({ error: "Name ist zu lang (max. 100 Zeichen)." }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { name },
    select: { id: true, name: true },
  });
  return NextResponse.json(user);
}

// DELETE — permanently delete the current user's account
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht eingeloggt." }, { status: 401 });
  }

  const userId = session.user.id as string;

  // Delete user — Prisma cascade handles:
  // KampagneMitglied, JournalEntry, Charakter, BildGenerierung (Cascade)
  // NPC.erstellerId, Organisation.erstellerId, Location.erstellerId (SetNull)
  await prisma.user.delete({ where: { id: userId } });

  return NextResponse.json({ ok: true });
}
