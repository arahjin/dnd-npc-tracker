import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * One-time migration: creates a "Standard-Kampagne" and assigns all existing
 * records that have no kampagneId to it. Also adds all existing users as members.
 *
 * Only callable by ADMIN.
 * Safe to call multiple times (idempotent for already-assigned records).
 */
export async function POST() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role ?? "";
  if (!session || role !== "ADMIN")
    return NextResponse.json({ error: "Nur Admins." }, { status: 403 });

  // Find or create the default campaign
  let kampagne = await prisma.kampagne.findFirst({
    where: { name: "Standard-Kampagne" },
  });
  if (!kampagne) {
    kampagne = await prisma.kampagne.create({
      data: { name: "Standard-Kampagne", beschreibung: "Automatisch migrierte Kampagne" },
    });
  }

  const kampagneId = kampagne.id;

  // Assign all unscoped records to the default campaign
  const [npcs, orgs, chars, entries] = await Promise.all([
    prisma.nPC.updateMany({ where: { kampagneId: null }, data: { kampagneId } }),
    prisma.organisation.updateMany({ where: { kampagneId: null }, data: { kampagneId } }),
    prisma.charakter.updateMany({ where: { kampagneId: null }, data: { kampagneId } }),
    prisma.journalEntry.updateMany({ where: { kampagneId: null }, data: { kampagneId } }),
  ]);

  // Add all existing users as campaign members (skip if already member)
  const allUsers = await prisma.user.findMany({ select: { id: true, role: true } });
  let addedMembers = 0;
  for (const user of allUsers) {
    const already = await prisma.kampagneMitglied.findUnique({
      where: { kampagneId_userId: { kampagneId, userId: user.id } },
    });
    if (!already) {
      await prisma.kampagneMitglied.create({
        data: {
          kampagneId,
          userId: user.id,
          isDM: user.role === "DUNGEON_MASTER" || user.role === "ADMIN",
        },
      });
      addedMembers++;
    }
  }

  return NextResponse.json({
    ok: true,
    kampagneId,
    kampagneName: kampagne.name,
    updated: { npcs: npcs.count, orgs: orgs.count, chars: chars.count, entries: entries.count },
    addedMembers,
  });
}
