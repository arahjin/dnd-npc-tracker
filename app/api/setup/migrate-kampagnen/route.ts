import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * One-time migration: creates a "Standard-Kampagne" and assigns all existing
 * records that have no kampagneId to it. Also adds all existing users as members.
 *
 * POST { dryRun?: boolean } — when dryRun is true, only counts are returned and
 * no writes happen. Useful to preview the migration before committing.
 *
 * Only callable by ADMIN. Idempotent for already-assigned records.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role ?? "";
  if (!session || role !== "ADMIN")
    return NextResponse.json({ error: "Nur Admins." }, { status: 403 });

  let dryRun = false;
  try {
    const body = await req.json();
    dryRun = body?.dryRun === true;
  } catch {
    // No body — treat as live run.
  }

  if (dryRun) {
    const [npcs, orgs, chars, entries, existingKampagne, allUsers] = await Promise.all([
      prisma.nPC.count({ where: { kampagneId: null } }),
      prisma.organisation.count({ where: { kampagneId: null } }),
      prisma.charakter.count({ where: { kampagneId: null } }),
      prisma.journalEntry.count({ where: { kampagneId: null } }),
      prisma.kampagne.findFirst({ where: { name: "Standard-Kampagne" }, select: { id: true } }),
      prisma.user.findMany({ select: { id: true } }),
    ]);

    let addedMembers = allUsers.length;
    if (existingKampagne) {
      const existingMemberIds = await prisma.kampagneMitglied.findMany({
        where: { kampagneId: existingKampagne.id },
        select: { userId: true },
      });
      const existing = new Set(existingMemberIds.map((m) => m.userId));
      addedMembers = allUsers.filter((u) => !existing.has(u.id)).length;
    }

    return NextResponse.json({
      ok: true,
      dryRun: true,
      wouldCreateKampagne: !existingKampagne,
      kampagneId: existingKampagne?.id ?? null,
      kampagneName: "Standard-Kampagne",
      updated: { npcs, orgs, chars, entries },
      addedMembers,
    });
  }

  let kampagne = await prisma.kampagne.findFirst({
    where: { name: "Standard-Kampagne" },
  });
  if (!kampagne) {
    kampagne = await prisma.kampagne.create({
      data: { name: "Standard-Kampagne", beschreibung: "Automatisch migrierte Kampagne" },
    });
  }

  const kampagneId = kampagne.id;

  const [npcs, orgs, chars, entries] = await Promise.all([
    prisma.nPC.updateMany({ where: { kampagneId: null }, data: { kampagneId } }),
    prisma.organisation.updateMany({ where: { kampagneId: null }, data: { kampagneId } }),
    prisma.charakter.updateMany({ where: { kampagneId: null }, data: { kampagneId } }),
    prisma.journalEntry.updateMany({ where: { kampagneId: null }, data: { kampagneId } }),
  ]);

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
    dryRun: false,
    kampagneId,
    kampagneName: kampagne.name,
    updated: { npcs: npcs.count, orgs: orgs.count, chars: chars.count, entries: entries.count },
    addedMembers,
  });
}
