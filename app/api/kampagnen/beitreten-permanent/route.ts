import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const userId = session.user.id;
  const { token } = await req.json();
  if (!token?.trim()) return NextResponse.json({ error: "Kein Link angegeben." }, { status: 400 });

  const invite = await prisma.invite.findUnique({
    where: { token: token.trim() },
    include: { kampagne: { select: { id: true, name: true } } },
  });

  if (!invite || !invite.isPermanent || !invite.active) {
    return NextResponse.json({ error: "Einladungslink ungültig oder deaktiviert." }, { status: 400 });
  }
  if (!invite.kampagneId || !invite.kampagne) {
    return NextResponse.json({ error: "Kampagne nicht gefunden." }, { status: 400 });
  }

  const existing = await prisma.kampagneMitglied.findUnique({
    where: { kampagneId_userId: { kampagneId: invite.kampagneId, userId } },
  });
  if (existing) {
    return NextResponse.json({ error: "Du bist bereits Mitglied dieser Kampagne.", kampagneId: invite.kampagneId, kampagneName: invite.kampagne.name }, { status: 400 });
  }

  await prisma.kampagneMitglied.create({
    data: { kampagneId: invite.kampagneId, userId, isDM: false },
  });

  // Set the active campaign cookie so the user lands directly in the new campaign
  const jar = await cookies();
  jar.set("aktiveKampagne", invite.kampagneId, { path: "/", httpOnly: false, sameSite: "lax" });

  return NextResponse.json({ ok: true, kampagneId: invite.kampagneId, kampagneName: invite.kampagne.name });
}
