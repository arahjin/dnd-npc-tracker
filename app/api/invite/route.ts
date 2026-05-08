import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session || (session.user as { role: string }).role !== "DUNGEON_MASTER")
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 });

  const invite = await prisma.invite.create({ data: {} });
  return NextResponse.json({ token: invite.token });
}

export async function GET() {
  const session = await auth();
  if (!session || (session.user as { role: string }).role !== "DUNGEON_MASTER")
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 });

  const invites = await prisma.invite.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(invites);
}
