import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canSeePrivate } from "@/lib/visibility";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const org = await prisma.organisation.findUnique({
    where: { id },
    include: { mitglieder: { include: { npc: true } } },
  });
  if (!org) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  return NextResponse.json(org);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  const { id } = await params;
  const userId = session.user!.id as string;
  const role = (session.user! as { role: string }).role;
  const isDM = role === "DUNGEON_MASTER";
  const isAdmin = role === "ADMIN";

  const existing = await prisma.organisation.findUnique({ where: { id }, select: { erstellerId: true } });
  if (!existing) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });

  const { erstellerId: _eid, privateNotizen, ...rest } = await req.json();

  // Only update privateNotizen if user is authorized and field was explicitly sent
  const allowPrivate = canSeePrivate({ userId, isDM, isAdmin }, existing.erstellerId);
  const data = (allowPrivate && privateNotizen !== undefined)
    ? { ...rest, privateNotizen: privateNotizen || null }
    : rest;

  const org = await prisma.organisation.update({ where: { id }, data });
  return NextResponse.json(org);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.organisation.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
