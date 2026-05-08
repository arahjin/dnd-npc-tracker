import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function isPrivileged(role: string) {
  return role === "ADMIN" || role === "DUNGEON_MASTER";
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role ?? "";
  if (!session || !isPrivileged(role))
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const inviteRole = body.role === "DUNGEON_MASTER" ? "DUNGEON_MASTER" : "SPIELER";

  // Only ADMIN can create DM invites
  if (inviteRole === "DUNGEON_MASTER" && role !== "ADMIN")
    return NextResponse.json({ error: "Nur Admins können DM-Links erstellen." }, { status: 403 });

  const invite = await prisma.invite.create({ data: { role: inviteRole } });
  return NextResponse.json({ token: invite.token, role: invite.role });
}

export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role ?? "";
  if (!session || !isPrivileged(role))
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 });

  const invites = await prisma.invite.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(invites);
}
