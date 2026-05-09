import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SiteFooter from "@/components/SiteFooter";

export const dynamic = "force-dynamic";

export default async function StartPage() {
  let settings = null;
  try {
    settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  } catch {
    // DB not reachable — use defaults
  }

  const title = settings?.landingTitle || "Lorehub";
  const subtitle = settings?.landingSubtitle || "Dein digitales Kampagnen-Archiv";
  const bodyText = settings?.landingBody || "";

  const paragraphs = bodyText
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--dnd-bg)" }}>
      {/* Top bar */}
      <header style={{ background: "#111111", borderBottom: "1px solid #2A2A2A" }}>
        <div className="mx-auto max-w-7xl px-4 md:px-6" style={{ height: "68px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/start" style={{ display: "flex", alignItems: "center" }}>
            <Image
              src="/lorehub_logo.png"
              alt="Lorehub"
              width={140} height={63}
              className="object-contain"
              style={{ width: "clamp(80px, 14vw, 120px)", height: "auto", filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.6))" }}
            />
          </Link>
          <Link href="/login" className="ddb-cta">
            Anmelden
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{ flex: "1 0 auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px 60px" }}>
        {/* Gold accent line */}
        <div style={{ width: "60px", height: "2px", background: "var(--dnd-gold)", marginBottom: "32px", opacity: 0.7 }} />

        <h1 className="font-cinzel text-center font-bold" style={{
          color: "var(--dnd-heading)",
          fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
          lineHeight: 1.1,
          letterSpacing: "0.02em",
          maxWidth: "800px",
        }}>
          {title}
        </h1>

        {subtitle && (
          <p className="font-cinzel text-center mt-4" style={{
            color: "var(--dnd-gold)",
            fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
            letterSpacing: "0.08em",
            maxWidth: "600px",
          }}>
            {subtitle}
          </p>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4 my-8" style={{ width: "100%", maxWidth: "480px" }}>
          <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, var(--dnd-red))" }} />
          <span style={{ color: "var(--dnd-red)" }}>✦</span>
          <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, var(--dnd-red), transparent)" }} />
        </div>

        {/* Body text */}
        {paragraphs.length > 0 && (
          <div className="text-center space-y-4" style={{ maxWidth: "680px", marginBottom: "48px" }}>
            {paragraphs.map((p, i) => (
              <p key={i} className="text-base leading-relaxed" style={{ color: "var(--dnd-text)", fontFamily: "'Roboto', sans-serif" }}>
                {p}
              </p>
            ))}
          </div>
        )}

        {/* CTA buttons */}
        <div className="flex flex-wrap gap-4 justify-center mt-4">
          <Link href="/login" className="ddb-cta" style={{ fontSize: "0.85rem", padding: "12px 32px" }}>
            Jetzt anmelden
          </Link>
        </div>
      </section>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
