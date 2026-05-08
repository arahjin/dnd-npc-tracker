import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// POST — join a campaign using an invite token
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const userId = session.user.id as string;
  const { token } = await req.json();

  if (!token?.trim())
    return NextResponse.json({ error: "Kein Code angegeben." }, { status: 400 });

  const invite = await prisma.invite.findUnique({ where: { token: token.trim() } });
  if (!invite || invite.usedById)
    return NextResponse.json({ error: "Einladungscode ungültig oder bereits verwendet." }, { status: 400 });

  if (!invite.kampagneId)
    return NextResponse.json({ error: "Dieser Einladungscode ist keiner Kampagne zugeordnet." }, { status: 400 });

  // Check if already a member
  const existing = await prisma.kampagneMitglied.findUnique({
    where: { kampagneId_userId: { kampagneId: invite.kampagneId, userId } },
  });
  if (existing)
    return NextResponse.json({ error: "Du bist bereits Mitglied dieser Kampagne." }, { status: 400 });

  await prisma.$transaction(async (tx) => {
    await tx.kampagneMitglied.create({
      data: {
        kampagneId: invite.kampagneId!,
        userId,
        isDM: invite.role === "DUNGEON_MASTER",
      },
    });
    await tx.invite.update({ where: { token: token.trim() }, data: { usedById: userId } });
  });

  const kampagne = await prisma.kampagne.findUnique({
    where: { id: invite.kampagneId },
    select: { id: true, name: true },
  });

  return NextResponse.json({ ok: true, kampagneId: invite.kampagneId, kampagneName: kampagne?.name });
}
