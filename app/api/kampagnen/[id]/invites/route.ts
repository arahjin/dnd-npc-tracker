import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { checkPresetLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/rateLimit";

type Params = { params: Promise<{ id: string }> };

async function requireDmAccess(kampagneId: string) {
  const session = await auth();
  if (!session?.user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const userId = session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (isAdmin) return { userId, isAdmin: true, isDM: true };

  const mitglied = await prisma.kampagneMitglied.findUnique({
    where: { kampagneId_userId: { kampagneId, userId } },
  });
  if (!mitglied) return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  if (!mitglied.isDM) return { error: NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 }) };

  return { userId, isAdmin: false, isDM: true };
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const ctx = await requireDmAccess(id);
  if ("error" in ctx) return ctx.error;

  const invites = await prisma.invite.findMany({
    where: { kampagneId: id },
    orderBy: { createdAt: "desc" },
  });
  const userIds = Array.from(new Set(invites.map((i) => i.usedById).filter((x): x is string => !!x)));
  const users = userIds.length
    ? await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true } })
    : [];
  const userById = new Map(users.map((u) => [u.id, u]));
  const enriched = invites.map((i) => ({ ...i, usedBy: i.usedById ? userById.get(i.usedById) ?? null : null }));
  return NextResponse.json(enriched);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const ctx = await requireDmAccess(id);
  if ("error" in ctx) return ctx.error;

  if (!(await checkPresetLimit(ctx.userId, "invite.create")))
    return rateLimitResponse(RATE_LIMITS["invite.create"].windowSeconds);

  const body = await req.json().catch(() => ({}));
  const inviteRole = body.role === "DUNGEON_MASTER" ? "DUNGEON_MASTER" : "SPIELER";
  const isPermanent = !!body.isPermanent;

  if (inviteRole === "DUNGEON_MASTER" && !ctx.isAdmin)
    return NextResponse.json({ error: "Nur Admins können DM-Links erstellen." }, { status: 403 });

  if (isPermanent) {
    const invite = await prisma.$transaction(async (tx) => {
      await tx.invite.updateMany({
        where: { kampagneId: id, isPermanent: true, active: true },
        data: { active: false },
      });
      return tx.invite.create({
        data: {
          kampagneId: id,
          isPermanent: true,
          active: true,
          role: inviteRole,
          token: randomBytes(32).toString("base64url"),
        },
      });
    });
    return NextResponse.json(invite);
  }

  const invite = await prisma.invite.create({
    data: {
      kampagneId: id,
      role: inviteRole,
      token: randomBytes(32).toString("base64url"),
    },
  });
  return NextResponse.json(invite);
}
