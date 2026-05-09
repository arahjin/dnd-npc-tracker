import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";

// POST — resend verification email for the currently logged-in user
export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const userId = session.user.id as string;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "Nutzer nicht gefunden." }, { status: 404 });
  if (user.emailVerified) return NextResponse.json({ error: "E-Mail bereits bestätigt." }, { status: 400 });

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.user.update({ where: { id: userId }, data: { emailVerifyToken: token } });

  try {
    await sendVerificationEmail(user.email, token);
  } catch {
    return NextResponse.json({ error: "E-Mail konnte nicht gesendet werden." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
