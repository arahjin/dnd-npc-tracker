import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [npcs, orgs, chars] = await Promise.all([
    prisma.nPC.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.organisation.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.charakter.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  return NextResponse.json([
    ...npcs.map((n) => ({ id: n.id, label: n.name, typ: "PERSON" })),
    ...orgs.map((o) => ({ id: o.id, label: o.name, typ: "ORGANISATION" })),
    ...chars.map((c) => ({ id: c.id, label: c.name, typ: "CHARAKTER" })),
  ]);
}
