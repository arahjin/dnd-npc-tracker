import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireKampagne } from "@/lib/kampagne";
import { visibilityWhere } from "@/lib/visibility";
import { stripMentions } from "@/lib/mentions";
import { LocationArtIcon, IconPin, IconMap, IconGlobe, IconPeople } from "@/components/Icons";
import LocationCreateButton from "@/components/LocationCreateButton";

export const dynamic = "force-dynamic";

export default async function LocationsPage() {
  const ctx = await requireKampagne();

  const [locations, availableNpcs, availableOrgs, availableChars] = await Promise.all([
    prisma.location.findMany({
      where: { kampagneId: ctx.kampagneId, ...visibilityWhere(ctx) },
      orderBy: { name: "asc" },
      include: { _count: { select: { npcs: true, organisationen: true, charaktere: true } } },
    }),
    prisma.nPC.findMany({ where: { kampagneId: ctx.kampagneId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.organisation.findMany({ where: { kampagneId: ctx.kampagneId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.charakter.findMany({ where: { kampagneId: ctx.kampagneId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "var(--dnd-label)" }}>
            {locations.length} {locations.length === 1 ? "Location" : "Locations"}
          </p>
          <LocationCreateButton availableNpcs={availableNpcs} availableOrgs={availableOrgs} availableChars={availableChars} />
        </div>

        {locations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="mb-4" style={{ opacity: 0.3 }}><IconMap size={52} color="var(--dnd-text-muted)" /></div>
            <p className="font-cinzel text-lg" style={{ color: "var(--dnd-text-muted)" }}>Keine Locations erfasst</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {locations.map((loc) => {
              const linked = loc._count.npcs + loc._count.organisationen + loc._count.charaktere;
              return (
                <Link key={loc.id} href={`/locations/${loc.id}`}
                  className="group card-hover transition-all duration-300 block"
                  style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}>
                  <div style={{ height: "2px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-gold), var(--dnd-red-dark))" }} />
                  <div className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="shrink-0 flex items-center mt-0.5"><LocationArtIcon art={loc.art} size={20} color="var(--dnd-text-muted)" /></span>
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
                      {loc.land && (
                        <span className="text-xs flex items-center gap-1" style={{ color: "var(--dnd-text-muted)" }}>
                          <IconGlobe size={11} /> {loc.land}
                        </span>
                      )}
                      {loc.region && (
                        <span className="text-xs flex items-center gap-1" style={{ color: "var(--dnd-text-muted)" }}>
                          <IconPin size={11} /> {loc.region}
                        </span>
                      )}
                      {loc.population != null && (
                        <span className="text-xs flex items-center gap-1" style={{ color: "var(--dnd-text-muted)" }}>
                          <IconPeople size={11} /> {loc.population.toLocaleString("de-DE")}
                        </span>
                      )}
                    </div>

                    {loc.wissenswertes && (
                      <p className="text-sm leading-relaxed line-clamp-2 mb-3" style={{ color: "var(--dnd-text)" }}>
                        {stripMentions(loc.wissenswertes)}
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
