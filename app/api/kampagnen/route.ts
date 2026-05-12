import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET — list campaigns the current user belongs to
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (isAdmin) {
    const kampagnen = await prisma.kampagne.findMany({
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { mitglieder: true } } },
    });
    return NextResponse.json(kampagnen);
  }

  const mitglieder = await prisma.kampagneMitglied.findMany({
    where: { userId },
    include: {
      kampagne: { include: { _count: { select: { mitglieder: true } } } },
    },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(mitglieder.map((m) => ({ ...m.kampagne, isDM: m.isDM, isOwner: m.isOwner })));
}

// POST — create a new campaign (DM or Admin only)
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;
  const { name, beschreibung } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name erforderlich." }, { status: 400 });

  const kampagne = await prisma.kampagne.create({
    data: {
      name: name.trim(),
      beschreibung: beschreibung?.trim() || null,
      mitglieder: {
        create: { userId, isDM: true, isOwner: true },
      },
    },
  });

  return NextResponse.json(kampagne, { status: 201 });
}
