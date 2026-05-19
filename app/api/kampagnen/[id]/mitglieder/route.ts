import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// GET — list members of a campaign (only for members themselves)
export async function GET(_req: NextRequest, { params }: Params) {
  const { id: kampagneId } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isAdmin) {
    const self = await prisma.kampagneMitglied.findUnique({
      where: { kampagneId_userId: { kampagneId, userId } },
    });
    if (!self) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [mitglieder, charaktere, usedInvites] = await Promise.all([
    prisma.kampagneMitglied.findMany({
      where: { kampagneId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: [{ isOwner: "desc" }, { isDM: "desc" }, { createdAt: "asc" }],
    }),
    prisma.charakter.findMany({
      where: { kampagneId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, userId: true },
    }),
    prisma.invite.findMany({
      where: { kampagneId, usedById: { not: null } },
      select: { id: true, role: true, isPermanent: true, usedById: true },
    }),
  ]);

  // Group characters by owning user so the client can render them inline.
  const byUser = new Map<string, { id: string; name: string }[]>();
  for (const c of charaktere) {
    const list = byUser.get(c.userId) ?? [];
    list.push({ id: c.id, name: c.name });
    byUser.set(c.userId, list);
  }
  const inviteByUser = new Map<string, { id: string; role: string; isPermanent: boolean }>();
  for (const inv of usedInvites) {
    if (inv.usedById) inviteByUser.set(inv.usedById, { id: inv.id, role: inv.role, isPermanent: inv.isPermanent });
  }
  const enriched = mitglieder.map((m) => ({
    ...m,
    charaktere: byUser.get(m.userId) ?? [],
    viaInvite: inviteByUser.get(m.userId) ?? null,
  }));

  return NextResponse.json(enriched);
}

// DELETE — leave campaign (self) or remove a member (DM/Admin)
// Body: { userId: string }
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id: kampagneId } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requesterId = session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  const { userId: targetUserId } = await req.json();

  if (!targetUserId) return NextResponse.json({ error: "userId erforderlich." }, { status: 400 });

  const isSelf = targetUserId === requesterId;

  // Check requester's membership
  const requesterMitglied = isAdmin
    ? { isDM: true, isOwner: true }
    : await prisma.kampagneMitglied.findUnique({
        where: { kampagneId_userId: { kampagneId, userId: requesterId } },
      });

  if (!requesterMitglied) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Only DMs/admins can remove others
  if (!isSelf && !requesterMitglied.isDM) {
    return NextResponse.json({ error: "Nur DMs können Mitglieder entfernen." }, { status: 403 });
  }

  // Get target membership
  const targetMitglied = await prisma.kampagneMitglied.findUnique({
    where: { kampagneId_userId: { kampagneId, userId: targetUserId } },
  });
  if (!targetMitglied) return NextResponse.json({ error: "Mitglied nicht gefunden." }, { status: 404 });

  // Owners can never be removed by non-admins
  if (targetMitglied.isOwner && !isAdmin) {
    return NextResponse.json({ error: "Der Ersteller kann nicht entfernt werden." }, { status: 403 });
  }

  // Only owners (or admins) can remove other DMs
  if (targetMitglied.isDM && !targetMitglied.isOwner && !requesterMitglied.isOwner && !isAdmin) {
    return NextResponse.json({ error: "Nur der Ersteller kann andere DMs entfernen." }, { status: 403 });
  }

  // Protect the last DM from leaving (non-admin)
  if (isSelf && targetMitglied.isDM && !isAdmin) {
    const dmCount = await prisma.kampagneMitglied.count({ where: { kampagneId, isDM: true } });
    if (dmCount <= 1) {
      return NextResponse.json({ error: "Du bist der letzte DM. Lösche die Kampagne stattdessen." }, { status: 400 });
    }
  }

  await prisma.kampagneMitglied.delete({
    where: { kampagneId_userId: { kampagneId, userId: targetUserId } },
  });

  return NextResponse.json({ ok: true });
}
