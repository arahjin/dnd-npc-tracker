import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// One-time setup route to create the first Admin account.
// Disabled once any user exists in the database.
export async function POST(req: NextRequest) {
  const count = await prisma.user.count();
  if (count > 0)
    return NextResponse.json({ error: "Setup bereits abgeschlossen." }, { status: 403 });

  const { name, email, password } = await req.json();
  if (!name || !email || !password)
    return NextResponse.json({ error: "Alle Felder erforderlich." }, { status: 400 });
  if (password.length < 8)
    return NextResponse.json({ error: "Passwort muss mindestens 8 Zeichen haben." }, { status: 400 });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: "ADMIN" },
  });

  return NextResponse.json({ ok: true, id: user.id });
}
