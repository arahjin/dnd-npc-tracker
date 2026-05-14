import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { validatePassword } from "@/lib/password";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { token, name, email: rawEmail, password } = await req.json();
  const email = rawEmail?.toLowerCase().trim() ?? "";

  if (!name || !email || !password)
    return NextResponse.json({ error: "Name, E-Mail und Passwort sind erforderlich." }, { status: 400 });

  const pwError = validatePassword(password);
  if (pwError) return NextResponse.json({ error: pwError }, { status: 400 });

  // Validate invite token if provided
  let invite = null;
  if (token) {
    invite = await prisma.invite.findUnique({ where: { token } });
    if (!invite || invite.usedById)
      return NextResponse.json({ error: "Einladungslink ungültig oder bereits verwendet." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // S-13: Don't reveal email enumeration. Return the same success-shape
    // response without creating anything or consuming the invite. The
    // client's auto-signIn will succeed only if the password matches the
    // existing account; otherwise the user lands on /login.
    return NextResponse.json({ ok: true, userId: null, kampagneId: null });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const role = invite?.role ?? "SPIELER";
  const emailVerifyToken = crypto.randomBytes(32).toString("hex");

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: { email, name, passwordHash, role, emailVerified: false, emailVerifyToken },
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

  // Send verification email — best effort, don't block registration if it fails
  try {
    await sendVerificationEmail(email, emailVerifyToken);
  } catch {
    // logged server-side; user can request resend from /email-bestaetigen/warten
  }

  return NextResponse.json({
    ok: true,
    userId: user.id,
    kampagneId: invite?.kampagneId ?? null,
  });
}
