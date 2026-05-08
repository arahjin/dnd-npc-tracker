import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// DELETE — delete campaign (only campaign DM or Admin)
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;
  const role = (session.user as { role: string }).role;
  const isAdmin = role === "ADMIN";

  if (!isAdmin) {
    const mitglied = await prisma.kampagneMitglied.findUnique({
      where: { kampagneId_userId: { kampagneId: id, userId } },
    });
    if (!mitglied?.isDM) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.kampagne.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
