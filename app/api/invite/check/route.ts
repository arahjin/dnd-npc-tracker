import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ valid: false });
  const invite = await prisma.invite.findUnique({ where: { token } });
  return NextResponse.json({ valid: !!invite && !invite.usedById });
}
