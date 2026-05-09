import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { requireKampagne } from "@/lib/kampagne";
import SiteHeader from "@/components/SiteHeader";

export const dynamic = "force-dynamic";

const TAG_ICON: Record<string, string> = { PERSON: "👤", ORGANISATION: "🏛", CHARAKTER: "⚔", SPIELER: "🎲" };

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase mb-4 pb-2 flex items-center justify-between"
      style={{ color: "var(--dnd-label)", borderBottom: "1px solid var(--dnd-border)" }}>
      {label}
      <span style={{ color: "var(--dnd-text-muted)" }}>{count}</span>
    </h2>
  );
}

export default async function SuchePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const ctx = await requireKampagne();
  const { kampagneId, userId, isDM } = ctx;

  const journalWhere = isDM
    ? { kampagneId }
    : { kampagneId, OR: [{ typ: "GESCHICHTE" as const }, { AND: [{ typ: "TAGEBUCH" as const }, { userId }] }] };

  const [npcs, orgs, chars, textEntries] = query
    ? await Promise.all([
        prisma.nPC.findMany({
          where: {
            kampagneId,
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { rasse: { contains: query, mode: "insensitive" } },
              { herkunft: { contains: query, mode: "insensitive" } },
              { aktuellePosition: { contains: query, mode: "insensitive" } },
              { notizen: { contains: query, mode: "insensitive" } },
            ],
          },
          orderBy: { name: "asc" },
          include: { organisationen: { include: { organisation: { select: { id: true, name: true } } } } },
        }),
        prisma.organisation.findMany({
          where: {
            kampagneId,
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { beschreibung: { contains: query, mode: "insensitive" } },
              { typ: { contains: query, mode: "insensitive" } },
              { region: { contains: query, mode: "insensitive" } },
            ],
          },
          orderBy: { name: "asc" },
        }),
        prisma.charakter.findMany({
          where: {
            kampagneId,
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { rasse: { contains: query, mode: "insensitive" } },
              { herkunft: { contains: query, mode: "insensitive" } },
              { notizen: { contains: query, mode: "insensitive" } },
            ],
          },
          orderBy: { name: "asc" },
          include: {
            user: { select: { id: true, name: true } },
            organisationen: { include: { organisation: { select: { id: true, name: true } } } },
          },
        }),
        prisma.journalEntry.findMany({
          where: {
            AND: [
              journalWhere,
              { OR: [{ titel: { contains: query, mode: "insensitive" } }, { inhalt: { contains: query, mode: "insensitive" } }] },
            ],
          },
          orderBy: { createdAt: "desc" },
          include: { user: { select: { id: true, name: true } }, tags: true },
        }),
      ])
    : [[], [], [], []];

  const foundIds = [...npcs.map((n) => n.id), ...orgs.map((o) => o.id), ...chars.map((c) => c.id)];
  const taggedEntries = foundIds.length > 0
    ? await prisma.journalEntry.findMany({
        where: { AND: [journalWhere, { tags: { some: { referenzId: { in: foundIds } } } }] },
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, name: true } }, tags: true },
      })
    : [];

  const seenIds = new Set<string>();
  const entries: typeof textEntries = [];
  for (const e of [...textEntries, ...taggedEntries]) {
    if (!seenIds.has(e.id)) { seenIds.add(e.id); entries.push(e); }
  }

  const nameMap = new Map<string, { name: string; typ: string }>();
  for (const n of npcs) nameMap.set(n.id, { name: n.name, typ: "PERSON" });
  for (const o of orgs) nameMap.set(o.id, { name: o.name, typ: "ORGANISATION" });
  for (const c of chars) nameMap.set(c.id, { name: c.name, typ: "CHARAKTER" });

  const extraIds = [...new Set(
    entries.flatMap((e) => e.tags.map((t) => t.referenzId)).filter((id) => !nameMap.has(id))
  )];
  if (extraIds.length > 0) {
    const [extraNpcs, extraOrgs, extraChars] = await Promise.all([
      prisma.nPC.findMany({ where: { id: { in: extraIds } }, select: { id: true, name: true } }),
      prisma.organisation.findMany({ where: { id: { in: extraIds } }, select: { id: true, name: true } }),
      prisma.charakter.findMany({ where: { id: { in: extraIds } }, select: { id: true, name: true } }),
    ]);
    for (const n of extraNpcs) nameMap.set(n.id, { name: n.name, typ: "PERSON" });
    for (const o of extraOrgs) nameMap.set(o.id, { name: o.name, typ: "ORGANISATION" });
    for (const c of extraChars) nameMap.set(c.id, { name: c.name, typ: "CHARAKTER" });
  }

  const total = npcs.length + orgs.length + chars.length + entries.length;

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <SiteHeader active="npcs" />
      <div className="mx-auto max-w-4xl px-4 md:px-6 py-10">
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

        {!query && <p className="font-cinzel text-sm" style={{ color: "var(--dnd-text-muted)" }}>Gib einen Suchbegriff in das Suchfeld oben ein.</p>}

        {query && total === 0 && (
          <div className="flex flex-col items-center py-24">
            <p className="text-5xl mb-4">🔍</p>
            <p className="font-cinzel text-lg" style={{ color: "var(--dnd-text-muted)" }}>Keine Ergebnisse gefunden</p>
          </div>
        )}

        {npcs.length > 0 && (
          <section className="mb-10">
            <SectionHeader label="NPCs" count={npcs.length} />
            <div className="space-y-2">
              {npcs.map((npc) => (
                <Link key={npc.id} href={`/npc/${npc.id}`} className="flex items-center gap-4 p-3 transition-all group"
                  style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}>
                  <div className="relative w-10 h-10 shrink-0 overflow-hidden" style={{ background: "#0A0A0A" }}>
                    {npc.image ? <Image src={npc.image} alt={npc.name} fill className="object-cover" /> : <div className="flex h-full items-center justify-center"><Image src="/lorehub_icon.png" alt="" width={32} height={14} className="object-contain opacity-20" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-cinzel text-sm font-semibold truncate" style={{ color: "var(--dnd-heading)" }}>{npc.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {npc.rasse && <span className="text-xs" style={{ color: "var(--dnd-text-muted)" }}>{npc.rasse}</span>}
                      {npc.organisationen.map((m) => (
                        <span key={m.id} className="font-cinzel text-xs px-1.5 py-0.5" style={{ background: "#111", border: "1px solid #2A2A2A", color: "var(--dnd-text-muted)" }}>🏛 {m.organisation.name}</span>
                      ))}
                    </div>
                  </div>
                  <span className="font-cinzel text-xs shrink-0" style={{ color: "var(--dnd-red-light)" }}>{npc.status}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {orgs.length > 0 && (
          <section className="mb-10">
            <SectionHeader label="Organisationen" count={orgs.length} />
            <div className="space-y-2">
              {orgs.map((org) => (
                <Link key={org.id} href={`/organisationen/${org.id}`} className="flex items-center gap-4 p-3 transition-all group"
                  style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}>
                  <div className="flex items-center justify-center w-10 h-10 shrink-0 text-xl" style={{ background: "#0A0A0A" }}>🏛</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-cinzel text-sm font-semibold truncate" style={{ color: "var(--dnd-heading)" }}>{org.name}</p>
                    {(org.typ || org.region) && <p className="text-xs truncate" style={{ color: "var(--dnd-text-muted)" }}>{[org.typ, org.region].filter(Boolean).join(" · ")}</p>}
                  </div>
                  {org.alignment && <span className="font-cinzel text-xs shrink-0" style={{ color: "var(--dnd-text-muted)" }}>{org.alignment}</span>}
                </Link>
              ))}
            </div>
          </section>
        )}

        {chars.length > 0 && (
          <section className="mb-10">
            <SectionHeader label="Charaktere" count={chars.length} />
            <div className="space-y-2">
              {chars.map((c) => (
                <Link key={c.id} href={`/charaktere/${c.id}`} className="flex items-center gap-4 p-3 transition-all group"
                  style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}>
                  <div className="relative w-10 h-10 shrink-0 overflow-hidden" style={{ background: "#0A0A0A" }}>
                    {c.image ? <Image src={c.image} alt={c.name} fill className="object-cover" /> : <div className="flex h-full items-center justify-center"><Image src="/lorehub_icon.png" alt="" width={32} height={14} className="object-contain opacity-20" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-cinzel text-sm font-semibold truncate" style={{ color: "var(--dnd-heading)" }}>{c.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="text-xs" style={{ color: "var(--dnd-gold)" }}>🎲 {c.user.name}</span>
                      {c.rasse && <span className="text-xs" style={{ color: "var(--dnd-text-muted)" }}>· {c.rasse}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {entries.length > 0 && (
          <section className="mb-10">
            <SectionHeader label="Tagebuch & Geschichte" count={entries.length} />
            <div className="space-y-3">
              {entries.map((entry) => (
                <article key={entry.id} style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}>
                  <div style={{ height: "2px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-gold), var(--dnd-red-dark))" }} />
                  <div className="px-4 py-3">
                    <p className="font-cinzel text-xs mb-2" style={{ color: "var(--dnd-text-muted)" }}>
                      <span style={{ color: "var(--dnd-gold)" }}>{entry.user.name}</span>
                      {" · "}
                      <span className="px-1.5 py-0.5 text-xs" style={{ background: entry.typ === "GESCHICHTE" ? "#0A1A0A" : "#0A0A1A", color: entry.typ === "GESCHICHTE" ? "#4ADE80" : "#818CF8" }}>
                        {entry.typ === "GESCHICHTE" ? "Geschichte" : "Tagebuch"}
                      </span>
                      {" · "}{new Date(entry.createdAt).toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                    {entry.titel && <p className="font-cinzel text-sm font-semibold mb-1" style={{ color: "var(--dnd-heading)" }}>{entry.titel}</p>}
                    <p className="text-sm leading-relaxed line-clamp-3" style={{ color: "var(--dnd-text)", fontFamily: "'Roboto', sans-serif" }}>{entry.inhalt}</p>
                    {entry.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {entry.tags.map((tag) => {
                          const obj = nameMap.get(tag.referenzId);
                          return obj ? (
                            <span key={tag.id} className="font-cinzel text-xs px-1.5 py-0.5"
                              style={{ background: "#1A0A0A", border: "1px solid var(--dnd-red-dark)", color: "var(--dnd-red-light)" }}>
                              {TAG_ICON[obj.typ]} {obj.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
