import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const orgs = await prisma.organisation.findMany({
    orderBy: { name: "asc" },
    include: { mitglieder: { include: { npc: true } } },
  });
  return NextResponse.json(orgs);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const org = await prisma.organisation.create({ data: body });
  return NextResponse.json(org, { status: 201 });
}
