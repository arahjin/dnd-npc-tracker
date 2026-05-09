import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireKampagne } from "@/lib/kampagne";
import { visibilityWhere } from "@/lib/visibility";
import SiteHeader from "@/components/SiteHeader";

export const dynamic = "force-dynamic";

const ART_ICON: Record<string, string> = {
  Land: "🌍",
  Region: "🗺️",
  Stadt: "🏰",
  Dorf: "🏘️",
  "Besonderer Ort": "✨",
  Wald: "🌲",
  Gewässer: "🌊",
};

export default async function LocationsPage() {
  const ctx = await requireKampagne();

  const locations = await prisma.location.findMany({
    where: { kampagneId: ctx.kampagneId, ...visibilityWhere(ctx) },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { npcs: true, organisationen: true, charaktere: true } },
    },
  });

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <SiteHeader active="locations" />
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "var(--dnd-label)" }}>
            {locations.length} {locations.length === 1 ? "Location" : "Locations"}
          </p>
          <a href="/locations/neu" className="ddb-cta">+ Location</a>
        </div>

        {locations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <p className="text-5xl mb-4">🗺️</p>
            <p className="font-cinzel text-lg" style={{ color: "var(--dnd-text-muted)" }}>Keine Locations erfasst</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {locations.map((loc) => {
              const icon = loc.art ? (ART_ICON[loc.art] ?? "📍") : "📍";
              const linked = loc._count.npcs + loc._count.organisationen + loc._count.charaktere;
              return (
                <Link key={loc.id} href={`/locations/${loc.id}`}
                  className="group card-hover transition-all duration-300 block"
                  style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}>
                  <div style={{ height: "2px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-gold), var(--dnd-red-dark))" }} />
                  <div className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-2xl shrink-0 mt-0.5">{icon}</span>
                      <div className="flex-1 min-w-0">
                        <h2 className="font-cinzel font-semibold text-lg leading-tight" style={{ color: "var(--dnd-heading)" }}>
                          {loc.name}
                        </h2>
                        {loc.art && (
                          <p className="font-cinzel text-xs mt-0.5" style={{ color: "var(--dnd-text-muted)" }}>{loc.art}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mb-3">
                      {loc.land && <span className="text-xs" style={{ color: "var(--dnd-text-muted)" }}>🌍 {loc.land}</span>}
                      {loc.region && <span className="text-xs" style={{ color: "var(--dnd-text-muted)" }}>📍 {loc.region}</span>}
                      {loc.population != null && (
                        <span className="text-xs" style={{ color: "var(--dnd-text-muted)" }}>
                          👥 {loc.population.toLocaleString("de-DE")}
                        </span>
                      )}
                    </div>

                    {loc.wissenswertes && (
                      <p className="text-sm leading-relaxed line-clamp-2 mb-3" style={{ color: "var(--dnd-text)" }}>
                        {loc.wissenswertes}
                      </p>
                    )}

                    {linked > 0 && (
                      <p className="font-cinzel text-xs tracking-wide" style={{ color: "var(--dnd-red-light)" }}>
                        {linked} {linked === 1 ? "Verknüpfung" : "Verknüpfungen"}
                      </p>
                    )}
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
