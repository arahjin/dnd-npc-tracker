import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteSettingsForm from "./SiteSettingsForm";

export const dynamic = "force-dynamic";

export default async function SiteSettingsPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") redirect("/");

  const raw = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  const initial = {
    copyrightText: raw?.copyrightText ?? "© Lorehub. Alle Rechte vorbehalten.",
    kontaktEmail: raw?.kontaktEmail ?? "",
    impressumContent: raw?.impressumContent ?? "",
    datenschutzContent: raw?.datenschutzContent ?? "",
  };

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <SiteHeader active="npcs" />

      <div className="mx-auto max-w-3xl px-4 md:px-6 py-10">
        {/* Back */}
        <Link href="/dm/admin" className="font-cinzel text-xs tracking-widest uppercase" style={{ color: "var(--dnd-text-muted)" }}>
          ← Admin-Bereich
        </Link>

        {/* Title */}
        <h1 className="font-cinzel text-3xl font-bold mt-6 mb-2" style={{ color: "var(--dnd-heading)" }}>
          Website-Einstellungen
        </h1>
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, var(--dnd-red), transparent)" }} />
          <span style={{ color: "var(--dnd-red)" }}>✦</span>
        </div>

        <p className="text-sm mb-8" style={{ color: "var(--dnd-text-muted)" }}>
          Pflege hier den Footer sowie die rechtlich erforderlichen Seiten Impressum und Datenschutzerklärung.
          Die Änderungen sind sofort auf der Website sichtbar.
        </p>

        <SiteSettingsForm initial={initial} />

        {/* Preview links */}
        <div className="mt-8 pt-6 flex gap-4" style={{ borderTop: "1px solid var(--dnd-border)" }}>
          <span className="font-cinzel text-xs tracking-widest uppercase" style={{ color: "var(--dnd-label)" }}>Vorschau:</span>
          <a href="/impressum" target="_blank" className="font-cinzel text-xs tracking-widest uppercase" style={{ color: "var(--dnd-red-light)" }}>
            Impressum ↗
          </a>
          <a href="/datenschutz" target="_blank" className="font-cinzel text-xs tracking-widest uppercase" style={{ color: "var(--dnd-red-light)" }}>
            Datenschutz ↗
          </a>
        </div>
      </div>
    </main>
  );
}
