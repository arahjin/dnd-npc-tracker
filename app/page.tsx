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
      <SiteHeader active="npcs" actionSlot={<NPCCreateButton availableOrgs={orgs} />} />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <NPCGrid npcs={npcs} availableOrgs={orgs} />
      </div>
      <footer className="mt-auto py-6 text-center">
        <p className="font-cinzel text-xs tracking-widest" style={{ color: "var(--dnd-text-muted)" }}>✦ {ctx.kampagneName.toUpperCase()} ✦</p>
      </footer>
    </main>
  );
}
