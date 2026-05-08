import { prisma } from "@/lib/prisma";
import NPCGrid from "@/components/NPCGrid";
import SiteHeader from "@/components/SiteHeader";

export const dynamic = "force-dynamic";

export default async function Home() {
  const npcs = await prisma.nPC.findMany({ orderBy: { name: "asc" } });

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <SiteHeader active="npcs" />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <NPCGrid npcs={npcs} />
      </div>
      <footer className="mt-auto py-6 text-center">
        <p className="font-cinzel text-xs tracking-widest" style={{ color: "var(--dnd-text-muted)" }}>✦ WILDGIPFEL KAMPAGNE ✦</p>
      </footer>
    </main>
  );
}
