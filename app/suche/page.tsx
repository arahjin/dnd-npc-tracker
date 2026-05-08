import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import SiteHeader from "@/components/SiteHeader";

export const dynamic = "force-dynamic";

export default async function SuchePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const [npcs, orgs] = query
    ? await Promise.all([
        prisma.nPC.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { rasse: { contains: query, mode: "insensitive" } },
              { herkunft: { contains: query, mode: "insensitive" } },
              { aktuellePosition: { contains: query, mode: "insensitive" } },
              { notizen: { contains: query, mode: "insensitive" } },
            ],
          },
          orderBy: { name: "asc" },
        }),
        prisma.organisation.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { beschreibung: { contains: query, mode: "insensitive" } },
              { typ: { contains: query, mode: "insensitive" } },
              { region: { contains: query, mode: "insensitive" } },
            ],
          },
          orderBy: { name: "asc" },
        }),
      ])
    : [[], []];

  const total = npcs.length + orgs.length;

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <SiteHeader active="npcs" />

      <div className="mx-auto max-w-4xl px-6 py-10">
        {/* Heading */}
        <div className="mb-8">
          <h1 className="font-cinzel text-2xl font-bold" style={{ color: "var(--dnd-heading)" }}>
            {query ? `Suchergebnisse für „${query}"` : "Suche"}
          </h1>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, var(--dnd-red), transparent)" }} />
            <span style={{ color: "var(--dnd-red)" }}>✦</span>
          </div>
          {query && (
            <p className="mt-2 font-cinzel text-xs tracking-widest" style={{ color: "var(--dnd-text-muted)" }}>
              {total} {total === 1 ? "ERGEBNIS" : "ERGEBNISSE"} GEFUNDEN
            </p>
          )}
        </div>

        {!query && (
          <p className="font-cinzel text-sm" style={{ color: "var(--dnd-text-muted)" }}>
            Gib einen Suchbegriff in das Suchfeld oben ein.
          </p>
        )}

        {query && total === 0 && (
          <div className="flex flex-col items-center py-24">
            <p className="text-5xl mb-4">🔍</p>
            <p className="font-cinzel text-lg" style={{ color: "var(--dnd-text-muted)" }}>Keine Ergebnisse gefunden</p>
          </div>
        )}

        {/* NPC Results */}
        {npcs.length > 0 && (
          <section className="mb-10">
            <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase mb-4 pb-2"
              style={{ color: "var(--dnd-label)", borderBottom: "1px solid var(--dnd-border)" }}>
              Personen ({npcs.length})
            </h2>
            <div className="space-y-2">
              {npcs.map((npc) => (
                <Link key={npc.id} href={`/npc/${npc.id}`}
                  className="flex items-center gap-4 p-3 transition-all group"
                  style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}>
                  <div className="relative w-10 h-10 shrink-0 overflow-hidden" style={{ background: "#0A0A0A" }}>
                    {npc.image
                      ? <Image src={npc.image} alt={npc.name} fill className="object-cover" />
                      : <div className="flex h-full items-center justify-center text-lg opacity-30">⚔️</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-cinzel text-sm font-semibold group-hover:text-white transition-colors truncate"
                      style={{ color: "var(--dnd-heading)" }}>{npc.name}</p>
                    {(npc.rasse || npc.aktuellePosition) && (
                      <p className="text-xs truncate" style={{ color: "var(--dnd-text-muted)" }}>
                        {[npc.rasse, npc.aktuellePosition].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                  <span className="font-cinzel text-xs shrink-0" style={{ color: "var(--dnd-red-light)" }}>
                    {npc.status}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Organisation Results */}
        {orgs.length > 0 && (
          <section>
            <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase mb-4 pb-2"
              style={{ color: "var(--dnd-label)", borderBottom: "1px solid var(--dnd-border)" }}>
              Organisationen ({orgs.length})
            </h2>
            <div className="space-y-2">
              {orgs.map((org) => (
                <Link key={org.id} href={`/organisationen/${org.id}`}
                  className="flex items-center gap-4 p-3 transition-all group"
                  style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}>
                  <div className="flex items-center justify-center w-10 h-10 shrink-0 text-xl"
                    style={{ background: "#0A0A0A" }}>🏛</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-cinzel text-sm font-semibold group-hover:text-white transition-colors truncate"
                      style={{ color: "var(--dnd-heading)" }}>{org.name}</p>
                    {(org.typ || org.region) && (
                      <p className="text-xs truncate" style={{ color: "var(--dnd-text-muted)" }}>
                        {[org.typ, org.region].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                  {org.alignment && (
                    <span className="font-cinzel text-xs shrink-0" style={{ color: "var(--dnd-text-muted)" }}>
                      {org.alignment}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
