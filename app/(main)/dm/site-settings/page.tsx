import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SiteSettingsForm from "./SiteSettingsForm";

export default async function SiteSettingsPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");

  const raw = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  const initial = {
    copyrightText: raw?.copyrightText ?? "© Lorehub. Alle Rechte vorbehalten.",
    kontaktEmail: raw?.kontaktEmail ?? "",
    discordUrl: raw?.discordUrl ?? "",
    impressumContent: raw?.impressumContent ?? "",
    datenschutzContent: raw?.datenschutzContent ?? "",
    landingTitle: raw?.landingTitle ?? "Lorehub",
    landingSubtitle: raw?.landingSubtitle ?? "Dein digitales Kampagnen-Archiv",
    landingBody: raw?.landingBody ?? "",
  };

  const t = await getTranslations("siteSettings");

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>

      <div className="mx-auto max-w-3xl px-4 md:px-6 py-10">
        {/* Back */}
        <Link href="/dm/admin" className="font-cinzel text-xs tracking-widest uppercase" style={{ color: "var(--dnd-text-muted)" }}>
          {t("back")}
        </Link>

        {/* Title */}
        <h1 className="font-cinzel text-3xl font-bold mt-6 mb-2" style={{ color: "var(--dnd-heading)" }}>
          {t("title")}
        </h1>
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, var(--dnd-red), transparent)" }} />
          <span style={{ color: "var(--dnd-red)" }}>✦</span>
        </div>

        <p className="text-sm mb-8" style={{ color: "var(--dnd-text-muted)" }}>
          {t("intro")}
        </p>

        <SiteSettingsForm initial={initial} />

        {/* Preview links */}
        <div className="mt-8 pt-6 flex flex-wrap gap-4" style={{ borderTop: "1px solid var(--dnd-border)" }}>
          <span className="font-cinzel text-xs tracking-widest uppercase" style={{ color: "var(--dnd-label)" }}>{t("preview")}</span>
          <a href="/" target="_blank" className="font-cinzel text-xs tracking-widest uppercase" style={{ color: "var(--dnd-red-light)" }}>
            {t("previewHome")}
          </a>
          <a href="/impressum" target="_blank" className="font-cinzel text-xs tracking-widest uppercase" style={{ color: "var(--dnd-red-light)" }}>
            {t("previewImpressum")}
          </a>
          <a href="/datenschutz" target="_blank" className="font-cinzel text-xs tracking-widest uppercase" style={{ color: "var(--dnd-red-light)" }}>
            {t("previewDatenschutz")}
          </a>
        </div>
      </div>
    </main>
  );
}
