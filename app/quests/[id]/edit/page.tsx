import Link from "next/link";
import { notFound } from "next/navigation";
import { requireKampagne } from "@/lib/kampagne";
import { prisma } from "@/lib/prisma";
import QuestForm from "@/components/QuestForm";

export const dynamic = "force-dynamic";

export default async function QuestEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireKampagne();

  if (!ctx.isDM && !ctx.isAdmin) notFound();

  const [quest, npcs, locations, orgs, chars] = await Promise.all([
    prisma.quest.findUnique({
      where: { id },
      include: {
        objectives: { orderBy: { order: "asc" } },
        npcs: true,
        locations: true,
        organisationen: true,
        charaktere: true,
      },
    }),
    prisma.nPC.findMany({ where: { kampagneId: ctx.kampagneId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.location.findMany({ where: { kampagneId: ctx.kampagneId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.organisation.findMany({ where: { kampagneId: ctx.kampagneId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.charakter.findMany({ where: { kampagneId: ctx.kampagneId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!quest || quest.kampagneId !== ctx.kampagneId) notFound();

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <header style={{ background: "#111111", borderBottom: "1px solid #252525" }}>
        <div style={{ height: "3px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-red) 30%, var(--dnd-gold) 50%, var(--dnd-red) 70%, var(--dnd-red-dark))" }} />
        <div className="mx-auto max-w-3xl px-4 md:px-6" style={{ height: "60px", display: "flex", alignItems: "center" }}>
          <Link href={`/quests/${id}`} className="ddb-nav-link" style={{ height: "60px", paddingLeft: 0 }}>
            ← Zurück zur Quest
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 md:px-6 py-10">
        <h1 className="font-cinzel text-2xl font-bold mb-6" style={{ color: "var(--dnd-heading)" }}>
          Quest bearbeiten
        </h1>
        <QuestForm
          id={id}
          initial={{
            title: quest.title,
            status: quest.status,
            typ: quest.typ,
            prioritaet: quest.prioritaet ?? "",
            summary: quest.summary ?? "",
            description: quest.description ?? "",
            reward: quest.reward ?? "",
            gmNotes: quest.gmNotes ?? "",
            deadline: quest.deadline ?? "",
            sichtbarkeit: quest.sichtbarkeit,
          }}
          availableNpcs={npcs}
          availableLocations={locations}
          availableOrgs={orgs}
          availableChars={chars}
          initialNpcs={quest.npcs.map((n) => ({ npcId: n.npcId, rolle: n.rolle ?? "" }))}
          initialLocations={quest.locations.map((l) => ({ locationId: l.locationId, rolle: l.rolle ?? "" }))}
          initialOrgs={quest.organisationen.map((o) => ({ organisationId: o.organisationId, rolle: o.rolle ?? "" }))}
          initialChars={quest.charaktere.map((c) => ({ charakterId: c.charakterId, rolle: c.rolle ?? "" }))}
          canSeePrivate={true}
        />
      </div>
    </main>
  );
}
