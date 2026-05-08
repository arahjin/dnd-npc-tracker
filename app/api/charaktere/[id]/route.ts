import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function canEdit(userId: string, charakterId: string, role: string) {
  if (role === "DUNGEON_MASTER") return true;
  const c = await prisma.charakter.findUnique({ where: { id: charakterId }, select: { userId: true } });
  return c?.userId === userId;
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const charakter = await prisma.charakter.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true } },
      organisationen: { include: { organisation: true }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!charakter) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  return NextResponse.json(charakter);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  const { id } = await params;
  const role = (session.user as { role: string }).role;
  if (!(await canEdit(session.user.id as string, id, role)))
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 });

  const { organisationen, ...data } = await req.json();
  const charakter = await prisma.$transaction(async (tx) => {
    await tx.charakterOrganisation.deleteMany({ where: { charakterId: id } });
    if (organisationen?.length > 0) {
      await tx.charakterOrganisation.createMany({
        data: organisationen.map((o: { organisationId: string; rolle: string }) => ({
          charakterId: id, organisationId: o.organisationId, rolle: o.rolle || null,
        })),
      });
    }
    return tx.charakter.update({ where: { id }, data });
  });
  return NextResponse.json(charakter);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  const { id } = await params;
  const role = (session.user as { role: string }).role;
  if (!(await canEdit(session.user.id as string, id, role)))
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 });
  await prisma.charakter.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
