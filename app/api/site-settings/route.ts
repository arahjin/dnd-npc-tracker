import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
    return NextResponse.json(settings ?? {
      id: "singleton",
      copyrightText: "© Lorehub. Alle Rechte vorbehalten.",
      kontaktEmail: "",
      impressumContent: "",
      datenschutzContent: "",
    });
  } catch {
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { copyrightText, kontaktEmail, impressumContent, datenschutzContent } = body;

    const settings = await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      create: {
        id: "singleton",
        copyrightText: copyrightText ?? "",
        kontaktEmail: kontaktEmail ?? "",
        impressumContent: impressumContent ?? "",
        datenschutzContent: datenschutzContent ?? "",
      },
      update: {
        ...(copyrightText !== undefined && { copyrightText }),
        ...(kontaktEmail !== undefined && { kontaktEmail }),
        ...(impressumContent !== undefined && { impressumContent }),
        ...(datenschutzContent !== undefined && { datenschutzContent }),
      },
    });
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: "Fehler beim Speichern" }, { status: 500 });
  }
}
