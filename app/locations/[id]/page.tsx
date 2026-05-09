export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireKampagne } from "@/lib/kampagne";
import SiteHeader from "@/components/SiteHeader";
import LocationDeleteButton from "@/components/LocationDeleteButton";

const ART_ICON: Record<string, string> = {
  Land: "🌍",
  Region: "🗺️",
  Stadt: "🏰",
  Dorf: "🏘️",
  "Besonderer Ort": "✨",
  Wald: "🌲",
  Gewässer: "🌊",
};

function Field({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex gap-2 py-2.5" style={{ borderBottom: "1px solid #FFFFFF" }}>
      <span className="font-cinzel text-xs tracking-wide shrink-0 w-32" style={{ color: "var(--dnd-label)" }}>{label}</span>
      <span className="text-sm" style={{ color: "var(--dnd-text)" }}>{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid var(--dnd-border)", background: "var(--dnd-bg-card)" }}>
      <div className="px-4 py-2" style={{ background: "var(--dnd-red-dark)", borderBottom: "1px solid var(--dnd-border)" }}>
        <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "var(--dnd-heading)" }}>{title}</h2>
      </div>
      <div className="px-4">{children}</div>
    </div>
  );
}

function LinkedList({ items, baseHref }: { items: { id: string; name: string }[]; baseHref: string }) {
  if (items.length === 0) {
    return <p className="py-3 text-sm" style={{ color: "var(--dnd-text-muted)" }}>Keine Verknüpfungen</p>;
  }
  return (
    <div className="py-2">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`${baseHref}/${item.id}`}
          className="flex items-center gap-2 py-2 transition-colors"
          style={{ borderBottom: "1px solid #FFFFFF", color: "var(--dnd-text)" }}
        >
          <span className="font-cinzel text-sm" style={{ color: "var(--dnd-heading)" }}>{item.name}</span>
          <span className="text-xs ml-auto" style={{ color: "var(--dnd-text-muted)" }}>→</span>
        </Link>
      ))}
    </div>
  );
}

export default async function LocationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireKampagne();

  const location = await prisma.location.findFirst({
    where: { id, kampagneId: ctx.kampagneId },
    include: {
      npcs: { orderBy: { name: "asc" }, select: { id: true, name: true } },
      organisationen: { orderBy: { name: "asc" }, select: { id: true, name: true } },
      charaktere: { orderBy: { name: "asc" }, select: { id: true, name: true } },
    },
  });

  if (!location) notFound();

  const icon = location.art ? (ART_ICON[location.art] ?? "📍") : "📍";

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <SiteHeader active="locations" />

      <header style={{ background: "#FFFFFF", borderBottom: "1px solid #D4D0C8" }}>
        <div style={{ height: "3px", background: "linear-gradient(90deg, transparent, var(--dnd-red), var(--dnd-gold), var(--dnd-red), transparent)" }} />
        <div className="mx-auto max-w-5xl px-4 md:px-6 py-4 flex items-center justify-between">
          <Link href="/locations" className="font-cinzel text-xs tracking-widest uppercase"
            style={{ color: "var(--dnd-text-muted)" }}>
            ← Locations
          </Link>
          <div className="flex gap-2">
            <Link href={`/locations/${id}/edit`}
              className="font-cinzel text-xs tracking-widest px-4 py-2 transition-all"
              style={{ border: "1px solid var(--dnd-gold)", color: "var(--dnd-gold)" }}>
              BEARBEITEN
            </Link>
            <LocationDeleteButton id={id} />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 md:px-6 py-10 space-y-8">
        {/* Title */}
        <div>
          <div className="flex flex-wrap items-center gap-4 mb-2">
            <span className="text-4xl">{icon}</span>
            <div>
              <h1 className="font-cinzel text-4xl font-bold" style={{ color: "var(--dnd-heading)" }}>
                {location.name}
              </h1>
              {location.art && (
                <p className="font-cinzel text-sm mt-1" style={{ color: "var(--dnd-text-muted)" }}>{location.art}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, var(--dnd-red), transparent)" }} />
            <span style={{ color: "var(--dnd-red)" }}>✦</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Details */}
          <Section title="Details">
            <Field label="Art" value={location.art} />
            <Field label="Land" value={location.land} />
            <Field label="Region" value={location.region} />
            <Field label="Population" value={location.population != null ? location.population.toLocaleString("de-DE") : null} />
            <Field label="Klima" value={location.klima} />
          </Section>

          {/* Flora & Fauna */}
          {location.floraFauna && (
            <div style={{ border: "1px solid var(--dnd-border)", background: "var(--dnd-bg-card)" }}>
              <div className="px-4 py-2" style={{ background: "var(--dnd-red-dark)", borderBottom: "1px solid var(--dnd-border)" }}>
                <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "var(--dnd-heading)" }}>Flora & Fauna</h2>
              </div>
              <div className="px-4 py-4">
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--dnd-text)" }}>{location.floraFauna}</p>
              </div>
            </div>
          )}
        </div>

        {/* Wissenswertes */}
        {location.wissenswertes && (
          <div style={{ border: "1px solid var(--dnd-border)", background: "var(--dnd-bg-card)" }}>
            <div className="px-4 py-2" style={{ background: "var(--dnd-red-dark)", borderBottom: "1px solid var(--dnd-border)" }}>
              <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "var(--dnd-heading)" }}>Wissenswertes</h2>
            </div>
            <div className="px-4 py-4">
              <p className="text-base leading-relaxed whitespace-pre-wrap" style={{ color: "var(--dnd-text)" }}>{location.wissenswertes}</p>
            </div>
          </div>
        )}

        {/* Verknüpfungen */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Section title={`NPCs (${location.npcs.length})`}>
            <LinkedList items={location.npcs} baseHref="/npc" />
          </Section>
          <Section title={`Organisationen (${location.organisationen.length})`}>
            <LinkedList items={location.organisationen} baseHref="/organisationen" />
          </Section>
          <Section title={`Charaktere (${location.charaktere.length})`}>
            <LinkedList items={location.charaktere} baseHref="/charaktere" />
          </Section>
        </div>
      </div>
    </main>
  );
}
