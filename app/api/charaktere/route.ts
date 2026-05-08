import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  const isDM = (session.user as { role: string }).role === "DUNGEON_MASTER";
  const charaktere = await prisma.charakter.findMany({
    where: isDM ? undefined : undefined, // all chars visible to everyone
    orderBy: { name: "asc" },
    include: { user: { select: { id: true, name: true } } },
  });
  return NextResponse.json(charaktere);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  const userId = session.user!.id as string;
  const { organisationen, ...data } = await req.json();

  const charakter = await prisma.charakter.create({
    data: {
      ...data,
      userId,
      ...(organisationen?.length > 0 && {
        organisationen: {
          create: organisationen.map((o: { organisationId: string; rolle: string }) => ({
            organisationId: o.organisationId,
            rolle: o.rolle || null,
          })),
        },
      }),
    },
  });
  return NextResponse.json(charakter, { status: 201 });
}
