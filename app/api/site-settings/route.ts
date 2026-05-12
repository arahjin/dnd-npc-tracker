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
      discordUrl: "",
      impressumContent: "",
      datenschutzContent: "",
      landingTitle: "Lorehub",
      landingSubtitle: "Dein digitales Kampagnen-Archiv",
      landingBody: "",
    });
  } catch {
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { copyrightText, kontaktEmail, discordUrl, impressumContent, datenschutzContent, landingTitle, landingSubtitle, landingBody } = body;

    const settings = await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      create: {
        id: "singleton",
        copyrightText: copyrightText ?? "",
        kontaktEmail: kontaktEmail ?? "",
        discordUrl: discordUrl ?? "",
        impressumContent: impressumContent ?? "",
        datenschutzContent: datenschutzContent ?? "",
        landingTitle: landingTitle ?? "Lorehub",
        landingSubtitle: landingSubtitle ?? "Dein digitales Kampagnen-Archiv",
        landingBody: landingBody ?? "",
      },
      update: {
        ...(copyrightText !== undefined && { copyrightText }),
        ...(kontaktEmail !== undefined && { kontaktEmail }),
        ...(discordUrl !== undefined && { discordUrl }),
        ...(impressumContent !== undefined && { impressumContent }),
        ...(datenschutzContent !== undefined && { datenschutzContent }),
        ...(landingTitle !== undefined && { landingTitle }),
        ...(landingSubtitle !== undefined && { landingSubtitle }),
        ...(landingBody !== undefined && { landingBody }),
      },
    });
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: "Fehler beim Speichern" }, { status: 500 });
  }
}
