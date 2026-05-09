import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function SiteFooter() {
  let settings = null;
  try {
    settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  } catch {
    // DB not reachable — render fallback
  }

  const copyright = settings?.copyrightText || "© Lorehub. Alle Rechte vorbehalten.";
  const email = settings?.kontaktEmail || "";

  return (
    <footer style={{
      background: "#1A1A1A",
      borderTop: "1px solid #2A2A2A",
      marginTop: "auto",
    }}>
      {/* Gold accent line */}
      <div style={{ height: "2px", background: "linear-gradient(90deg, transparent, var(--dnd-gold), transparent)" }} />

      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6"
        style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>

        {/* Copyright */}
        <p className="font-cinzel text-xs tracking-wide" style={{ color: "#6B6860" }}>
          {copyright}
        </p>

        {/* Links */}
        <nav style={{ display: "flex", alignItems: "center", gap: "0" }}>
          <Link
            href="/impressum"
            className="font-cinzel text-xs tracking-widest uppercase transition-colors"
            style={{ color: "#6B6860", padding: "4px 16px", borderRight: "1px solid #2A2A2A", textDecoration: "none" }}
            onMouseEnter={undefined}
          >
            Impressum
          </Link>
          <Link
            href="/datenschutz"
            className="font-cinzel text-xs tracking-widest uppercase transition-colors"
            style={{ color: "#6B6860", padding: "4px 16px", textDecoration: "none" }}
          >
            Datenschutz
          </Link>
          {email && (
            <>
              <div style={{ width: "1px", height: "14px", background: "#2A2A2A" }} />
              <a
                href={`mailto:${email}`}
                className="font-cinzel text-xs tracking-widest uppercase transition-colors"
                style={{ color: "#6B6860", padding: "4px 16px", textDecoration: "none" }}
              >
                Kontakt
              </a>
            </>
          )}
        </nav>
      </div>
    </footer>
  );
}
