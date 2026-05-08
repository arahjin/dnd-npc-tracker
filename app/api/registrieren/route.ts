import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { token, name, email, password } = await req.json();

  if (!name || !email || !password)
    return NextResponse.json({ error: "Name, E-Mail und Passwort sind erforderlich." }, { status: 400 });
  if (password.length < 8)
    return NextResponse.json({ error: "Passwort muss mindestens 8 Zeichen haben." }, { status: 400 });

  // Validate invite token if provided
  let invite = null;
  if (token) {
    invite = await prisma.invite.findUnique({ where: { token } });
    if (!invite || invite.usedById)
      return NextResponse.json({ error: "Einladungslink ungültig oder bereits verwendet." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing)
    return NextResponse.json({ error: "E-Mail bereits registriert." }, { status: 400 });

  const passwordHash = await bcrypt.hash(password, 12);
  // Role from invite if present, otherwise default SPIELER
  const role = invite?.role ?? "SPIELER";

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: { email, name, passwordHash, role },
    });

    if (invite) {
      await tx.invite.update({ where: { token }, data: { usedById: newUser.id } });
      if (invite.kampagneId) {
        await tx.kampagneMitglied.create({
          data: {
            kampagneId: invite.kampagneId,
            userId: newUser.id,
            isDM: invite.role === "DUNGEON_MASTER",
          },
        });
      }
    }

    return newUser;
  });

  return NextResponse.json({
    ok: true,
    userId: user.id,
    // Return kampagneId so client can auto-activate it
    kampagneId: invite?.kampagneId ?? null,
  });
}
