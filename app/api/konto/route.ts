import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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
