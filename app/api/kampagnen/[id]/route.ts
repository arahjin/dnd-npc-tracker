import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// DELETE — delete campaign (only campaign owner or Admin).
// Body must contain { confirmName: <exact campaign name> } as a destructive-action guard.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;
  const role = (session.user as { role: string }).role;
  const isAdmin = role === "ADMIN";

  const kampagne = await prisma.kampagne.findUnique({
    where: { id },
    select: { id: true, name: true },
  });
  if (!kampagne) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });

  if (!isAdmin) {
    const mitglied = await prisma.kampagneMitglied.findUnique({
      where: { kampagneId_userId: { kampagneId: id, userId } },
      select: { isOwner: true },
    });
    if (!mitglied?.isOwner) return NextResponse.json({ error: "Nur der Kampagnen-Besitzer oder Admin darf löschen." }, { status: 403 });
  }

  // Require typed-name confirmation in body to prevent accidental cascading deletes.
  let confirmName = "";
  try {
    const body = await req.json();
    confirmName = typeof body?.confirmName === "string" ? body.confirmName : "";
  } catch {
    // empty body — confirmName stays ""
  }
  if (confirmName !== kampagne.name) {
    return NextResponse.json(
      { error: `Bestätigung fehlt — bitte den exakten Kampagnennamen „${kampagne.name}" senden.` },
      { status: 400 },
    );
  }

  await prisma.kampagne.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
