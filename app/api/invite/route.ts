import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireKampagneApi } from "@/lib/kampagne";

export async function POST(req: NextRequest) {
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Keine Kampagne ausgewählt." }, { status: 401 });
  if (!ctx.isDM) return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const inviteRole = body.role === "DUNGEON_MASTER" ? "DUNGEON_MASTER" : "SPIELER";

  // Only ADMIN can create DM invites
  if (inviteRole === "DUNGEON_MASTER" && !ctx.isAdmin)
    return NextResponse.json({ error: "Nur Admins können DM-Links erstellen." }, { status: 403 });

  const invite = await prisma.invite.create({
    data: { role: inviteRole, kampagneId: ctx.kampagneId },
  });
  return NextResponse.json({ token: invite.token, role: invite.role });
}

export async function GET() {
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Keine Kampagne ausgewählt." }, { status: 401 });
  if (!ctx.isDM) return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 });

  const invites = await prisma.invite.findMany({
    where: { kampagneId: ctx.kampagneId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(invites);
}
