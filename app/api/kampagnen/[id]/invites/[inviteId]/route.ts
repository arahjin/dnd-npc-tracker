import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string; inviteId: string }> };

async function requireDmAccess(kampagneId: string) {
  const session = await auth();
  if (!session?.user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const userId = session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (isAdmin) return { userId, isAdmin: true };

  const mitglied = await prisma.kampagneMitglied.findUnique({
    where: { kampagneId_userId: { kampagneId, userId } },
  });
  if (!mitglied) return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  if (!mitglied.isDM) return { error: NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 }) };
  return { userId, isAdmin: false };
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id, inviteId } = await params;
  const ctx = await requireDmAccess(id);
  if ("error" in ctx) return ctx.error;

  const invite = await prisma.invite.findUnique({ where: { id: inviteId } });
  if (!invite || invite.kampagneId !== id)
    return NextResponse.json({ error: "Einladung nicht gefunden." }, { status: 404 });

  await prisma.invite.update({ where: { id: inviteId }, data: { active: false } });
  return NextResponse.json({ ok: true });
}
