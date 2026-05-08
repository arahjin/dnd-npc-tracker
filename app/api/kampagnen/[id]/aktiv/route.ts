import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// POST — set a campaign as active (stored in cookie)
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;
  const role = (session.user as { role: string }).role;
  const isAdmin = role === "ADMIN";

  // Verify user has access to this campaign
  if (!isAdmin) {
    const mitglied = await prisma.kampagneMitglied.findUnique({
      where: { kampagneId_userId: { kampagneId: id, userId } },
    });
    if (!mitglied) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } else {
    const exists = await prisma.kampagne.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("aktiveKampagne", id, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
  return res;
}
