export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireKampagne } from "@/lib/kampagne";
import { canSeePrivate } from "@/lib/visibility";
import LocationDeleteButton from "@/components/LocationDeleteButton";
import RenderMentions from "@/components/RenderMentions";
import { LocationArtIcon, IconLock } from "@/components/Icons";

function Field({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex gap-2 py-2.5" style={{ borderBottom: "1px solid #1A1A1A" }}>
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
          style={{ borderBottom: "1px solid #1A1A1A", color: "var(--dnd-text)" }}
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
  const session = await auth();
  const userId = session!.user!.id as string;
  const role = (session!.user! as { role: string }).role;
  const isDM = role === "DUNGEON_MASTER";
  const isAdmin = role === "ADMIN";

  const ctx = await requireKampagne();

  const location = await prisma.location.findFirst({
    where: { id, kampagneId: ctx.kampagneId },
    include: {
      npcs: { orderBy: { name: "asc" }, select: { id: true, name: true } },
      organisationen: { orderBy: { name: "asc" }, select: { id: true, name: true } },
      charaktere: { orderBy: { name: "asc" }, select: { id: true, name: true } },
      quests: { include: { quest: { select: { id: true, title: true, status: true, typ: true } } } },
    },
  });

  if (!location) notFound();
  if (location.sichtbarkeit === "privat" && !canSeePrivate({ userId, isDM, isAdmin }, location.erstellerId)) notFound();

  const showPrivate = canSeePrivate({ userId, isDM, isAdmin }, location.erstellerId);

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <header style={{ background: "#0A0A0A", borderBottom: "1px solid #2A1A1A" }}>
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
            <span className="text-4xl"><LocationArtIcon art={location.art} size={20} color="var(--dnd-text-muted)" /></span>
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
                <p className="text-sm leading-relaxed" style={{ color: "var(--dnd-text)" }}><RenderMentions text={location.floraFauna} /></p>
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
              <p className="text-base leading-relaxed" style={{ color: "var(--dnd-text)" }}><RenderMentions text={location.wissenswertes} /></p>
            </div>
          </div>
        )}

        {/* Private Notes */}
        {showPrivate && location.privateNotizen && (
          <div style={{ border: "1px solid var(--dnd-border)", background: "var(--dnd-bg-card)" }}>
            <div className="px-4 py-2" style={{ background: "#200D0D", borderBottom: "1px solid #991B1B" }}>
              <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "#FCA5A5" }}>
                <><IconLock size={13} color="#FCA5A5" /> Private Notizen</>
              </h2>
            </div>
            <div className="px-4 py-4">
              <p className="text-base leading-relaxed" style={{ color: "var(--dnd-text)", fontFamily: "'Roboto', sans-serif", whiteSpace: "pre-wrap" }}>
                {location.privateNotizen}
              </p>
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

        {/* Zugehörige Quests */}
        {location.quests && location.quests.length > 0 && (
          <div style={{ border: "1px solid var(--dnd-border)", background: "var(--dnd-bg-card)" }}>
            <div className="px-4 py-2" style={{ background: "var(--dnd-red-dark)", borderBottom: "1px solid var(--dnd-border)" }}>
              <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "var(--dnd-heading)" }}>Zugehörige Quests</h2>
            </div>
            <div className="px-4 py-3 flex flex-wrap gap-2">
              {location.quests.map((ql) => (
                <Link
                  key={ql.questId}
                  href={`/quests/${ql.questId}`}
                  className="font-cinzel text-xs px-3 py-1.5"
                  style={{ background: "#141414", border: "1px solid var(--dnd-border)", color: "var(--dnd-heading)", textDecoration: "none" }}
                >
                  {ql.quest.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
