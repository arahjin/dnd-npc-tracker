import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireKampagneApi } from "@/lib/kampagne";

/** GET — return the active permanent invite for the current campaign, or null. */
export async function GET() {
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Keine Kampagne ausgewählt." }, { status: 401 });
  if (!ctx.isDM) return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 });

  const invite = await prisma.invite.findFirst({
    where: { kampagneId: ctx.kampagneId, isPermanent: true, active: true },
    select: { token: true, createdAt: true },
  });

  return NextResponse.json(invite ?? null);
}

/** POST — generate a new permanent link (deactivates any existing one). */
export async function POST() {
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Keine Kampagne ausgewählt." }, { status: 401 });
  if (!ctx.isDM) return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 });

  await prisma.$transaction(async (tx) => {
    await tx.invite.updateMany({
      where: { kampagneId: ctx.kampagneId, isPermanent: true, active: true },
      data: { active: false },
    });
    await tx.invite.create({
      data: { kampagneId: ctx.kampagneId, isPermanent: true, active: true, role: "SPIELER" },
    });
  });

  const invite = await prisma.invite.findFirst({
    where: { kampagneId: ctx.kampagneId, isPermanent: true, active: true },
    select: { token: true, createdAt: true },
  });

  return NextResponse.json(invite);
}

/** DELETE — deactivate the current permanent invite. */
export async function DELETE() {
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Keine Kampagne ausgewählt." }, { status: 401 });
  if (!ctx.isDM) return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 });

  await prisma.invite.updateMany({
    where: { kampagneId: ctx.kampagneId, isPermanent: true, active: true },
    data: { active: false },
  });

  return NextResponse.json({ ok: true });
}
