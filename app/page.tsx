import { prisma } from "@/lib/prisma";
import { requireKampagne } from "@/lib/kampagne";
import NPCGrid from "@/components/NPCGrid";
import SiteHeader from "@/components/SiteHeader";
import NPCCreateButton from "@/components/NPCCreateButton";

export const dynamic = "force-dynamic";

export default async function Home() {
  const ctx = await requireKampagne();

  const [npcs, orgs] = await Promise.all([
    prisma.nPC.findMany({
      where: { kampagneId: ctx.kampagneId },
      orderBy: { name: "asc" },
      include: { organisationen: { include: { organisation: { select: { id: true, name: true } } } } },
    }),
    prisma.organisation.findMany({
      where: { kampagneId: ctx.kampagneId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <SiteHeader active="npcs" />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "var(--dnd-label)" }}>
            {npcs.length} {npcs.length === 1 ? "NPC" : "NPCs"}
          </p>
          <NPCCreateButton availableOrgs={orgs} />
        </div>
        <NPCGrid npcs={npcs} availableOrgs={orgs} />
      </div>
      <footer className="mt-auto py-6 text-center">
        <p className="font-cinzel text-xs tracking-widest" style={{ color: "var(--dnd-text-muted)" }}>✦ {ctx.kampagneName.toUpperCase()} ✦</p>
      </footer>
    </main>
  );
}
