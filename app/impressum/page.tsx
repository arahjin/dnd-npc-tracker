import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function ImpressumPage() {
  let settings = null;
  try {
    settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  } catch {
    // fallback
  }

  const content = settings?.impressumContent?.trim() || null;
  const email = settings?.kontaktEmail || "";

  const paragraphs = content
    ? content.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)
    : null;

  const t = await getTranslations("impressum");
  const tCommon = await getTranslations("common");

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      {/* Header */}
      <header style={{ background: "#FFFFFF", borderBottom: "1px solid #D4D0C8" }}>
        <div style={{ height: "3px", background: "linear-gradient(90deg, transparent, var(--dnd-red), var(--dnd-gold), var(--dnd-red), transparent)" }} />
        <div className="mx-auto max-w-3xl px-4 md:px-6 py-4">
          <Link href="/" className="font-cinzel text-xs tracking-widest uppercase" style={{ color: "var(--dnd-text-muted)" }}>
            {tCommon("back")}
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 md:px-6 py-10">
        {/* Title */}
        <h1 className="font-cinzel text-3xl font-bold mb-2" style={{ color: "var(--dnd-heading)" }}>
          {t("title")}
        </h1>
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, var(--dnd-red), transparent)" }} />
          <span style={{ color: "var(--dnd-red)" }}>✦</span>
        </div>

        {/* Content */}
        <div style={{ border: "1px solid var(--dnd-border)", background: "var(--dnd-bg-card)" }}>
          <div className="px-4 py-2" style={{ background: "var(--dnd-red-dark)", borderBottom: "1px solid var(--dnd-border)" }}>
            <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "#FFFFFF" }}>
              {t("section")}
            </h2>
          </div>
          <div className="px-6 py-6">
            {paragraphs ? (
              <div className="space-y-4">
                {paragraphs.map((para, i) => (
                  <p key={i} className="text-base leading-relaxed" style={{ color: "var(--dnd-text)", whiteSpace: "pre-wrap" }}>
                    {para}
                  </p>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="font-cinzel text-sm mb-2" style={{ color: "var(--dnd-text-muted)" }}>
                  {t("empty")}
                </p>
                <p className="text-xs" style={{ color: "var(--dnd-text-muted)" }}>
                  {t("adminsHintPrefix")}{" "}
                  <Link href="/dm/site-settings" style={{ color: "var(--dnd-red-light)" }}>
                    {t("adminsHintLink")}
                  </Link>{" "}
                  {t("adminsHintSuffix")}
                </p>
              </div>
            )}
            {email && (
              <div className="mt-6 pt-5" style={{ borderTop: "1px solid var(--dnd-border)" }}>
                <p className="font-cinzel text-xs tracking-widest uppercase mb-1" style={{ color: "var(--dnd-label)" }}>
                  {t("contactHeading")}
                </p>
                <a href={`mailto:${email}`} className="text-base" style={{ color: "var(--dnd-red-light)" }}>
                  {email}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
