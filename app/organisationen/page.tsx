import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireKampagne } from "@/lib/kampagne";
import { visibilityWhere } from "@/lib/visibility";
import { stripMentions } from "@/lib/mentions";
import SiteHeader from "@/components/SiteHeader";

export const dynamic = "force-dynamic";

const ALIGNMENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Rechtschaffen Gut":    { bg: "#0A1020", text: "#60A5FA", border: "#1E3A8A" },
  "Neutral Gut":          { bg: "#0A1A12", text: "#34D399", border: "#065F46" },
  "Chaotisch Gut":        { bg: "#0D1A0A", text: "#86EFAC", border: "#166534" },
  "Rechtschaffen Neutral":{ bg: "#141414", text: "#D1D5DB", border: "#374151" },
  "Wahrhaft Neutral":     { bg: "#141414", text: "#9CA3AF", border: "#374151" },
  "Chaotisch Neutral":    { bg: "#1A1208", text: "#FCD34D", border: "#92400E" },
  "Rechtschaffen Böse":   { bg: "#200D0D", text: "#FCA5A5", border: "#991B1B" },
  "Neutral Böse":         { bg: "#200D0D", text: "#F87171", border: "#991B1B" },
  "Chaotisch Böse":       { bg: "#1A0A0A", text: "#EF4444", border: "#7F1D1D" },
};

export default async function OrganisationenPage() {
  const ctx = await requireKampagne();

  const orgs = await prisma.organisation.findMany({
    where: { kampagneId: ctx.kampagneId, ...visibilityWhere(ctx) },
    orderBy: { name: "asc" },
    include: { mitglieder: true },
  });

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <SiteHeader active="organisationen" />
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "var(--dnd-label)" }}>
            {orgs.length} {orgs.length === 1 ? "Organisation" : "Organisationen"}
          </p>
          <a href="/organisationen/neu" className="ddb-cta">+ Organisation</a>
        </div>
        {orgs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <p className="text-5xl mb-4">🏛️</p>
            <p className="font-cinzel text-lg" style={{ color: "var(--dnd-text-muted)" }}>Keine Organisationen erfasst</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {orgs.map((org) => {
              const alignColors = org.alignment ? (ALIGNMENT_COLORS[org.alignment] ?? ALIGNMENT_COLORS["Wahrhaft Neutral"]) : ALIGNMENT_COLORS["Wahrhaft Neutral"];
              return (
                <Link key={org.id} href={`/organisationen/${org.id}`}
                  className="group card-hover transition-all duration-300 block"
                  style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}>
                  <div style={{ height: "2px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-gold), var(--dnd-red-dark))" }} />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h2 className="font-cinzel font-semibold text-lg leading-tight" style={{ color: "var(--dnd-heading)" }}>{org.name}</h2>
                      {org.alignment && (
                        <span className="font-cinzel text-xs px-2 py-0.5 shrink-0" style={{ background: alignColors.bg, color: alignColors.text, border: `1px solid ${alignColors.border}` }}>
                          {org.alignment}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3 mb-3">
                      {org.typ && <span className="text-xs" style={{ color: "var(--dnd-text-muted)" }}>🏛 {org.typ}</span>}
                      {org.region && <span className="text-xs" style={{ color: "var(--dnd-text-muted)" }}>📍 {org.region}</span>}
                    </div>
                    {org.beschreibung && (
                      <p className="text-sm leading-relaxed line-clamp-2" style={{ color: "var(--dnd-text)" }}>{stripMentions(org.beschreibung)}</p>
                    )}
                    <p className="mt-3 font-cinzel text-xs tracking-wide" style={{ color: "var(--dnd-red-light)" }}>
                      {org.mitglieder.length} {org.mitglieder.length === 1 ? "Mitglied" : "Mitglieder"}
                    </p>
                  </div>
                  <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, var(--dnd-border), transparent)" }} />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
