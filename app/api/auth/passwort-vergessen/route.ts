import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const { email: rawEmail } = await req.json();
  const email = rawEmail?.toLowerCase().trim() ?? "";
  if (!email) return NextResponse.json({ error: "E-Mail erforderlich." }, { status: 400 });

  // Always return success to prevent email enumeration
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ ok: true });

  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenExpiry: expiry },
  });

  try {
    await sendPasswordResetEmail(email, token);
  } catch {
    // Don't expose email sending errors to the client
  }

  return NextResponse.json({ ok: true });
}
