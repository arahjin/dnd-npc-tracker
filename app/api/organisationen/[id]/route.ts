import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
  const { id } = await params;
  const body = await req.json();
  const org = await prisma.organisation.update({ where: { id }, data: body });
  return NextResponse.json(org);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.organisation.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
