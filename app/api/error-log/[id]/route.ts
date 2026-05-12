import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (session?.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.errorLog.update({ where: { id }, data: { resolved: true } });
  return NextResponse.json({ ok: true });
}
