import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { cookies } from "next/headers";

// POST — clear the aktiveKampagne cookie if it matches the given kampagneId
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { kampagneId } = await req.json();
  const cookieStore = await cookies();
  const active = cookieStore.get("aktiveKampagne")?.value;

  const res = NextResponse.json({ ok: true });
  if (!kampagneId || active === kampagneId) {
    res.cookies.set("aktiveKampagne", "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
  }
  return res;
}
