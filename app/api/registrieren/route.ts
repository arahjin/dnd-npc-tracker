import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { token, name, email, password } = await req.json();

  if (!token || !name || !email || !password)
    return NextResponse.json({ error: "Alle Felder erforderlich." }, { status: 400 });

  const invite = await prisma.invite.findUnique({ where: { token } });
  if (!invite || invite.usedById)
    return NextResponse.json({ error: "Einladungslink ungültig oder bereits verwendet." }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing)
    return NextResponse.json({ error: "E-Mail bereits registriert." }, { status: 400 });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { email, name, passwordHash } });
  await prisma.invite.update({ where: { token }, data: { usedById: user.id } });

  return NextResponse.json({ ok: true });
}
