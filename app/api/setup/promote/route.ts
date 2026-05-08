import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Promotes the first user in the database to ADMIN.
// Safe to call multiple times; remove this file once done.
export async function POST() {
  const first = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (!first) return NextResponse.json({ error: "Kein Benutzer gefunden." }, { status: 404 });

  await prisma.user.update({ where: { id: first.id }, data: { role: "ADMIN" } });
  return NextResponse.json({ ok: true, name: first.name, email: first.email });
}
