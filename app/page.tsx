import Link from "next/link";
import { prisma } from "@/lib/prisma";
import NPCGrid from "@/components/NPCGrid";

export const dynamic = "force-dynamic";

export default async function Home() {
  const npcs = await prisma.nPC.findMany({ orderBy: { name: "asc" } });

  return (
    <main className="min-h-screen bg-[#1a1209] text-amber-100">
      <header className="border-b border-amber-900/50 bg-[#120d06] px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-amber-400">⚔ NPC Tracker</h1>
            <p className="text-xs text-amber-700">Dungeons &amp; Dragons</p>
          </div>
          <Link
            href="/npc/new"
            className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-amber-100 hover:bg-amber-600 transition-colors"
          >
            + NPC hinzufügen
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <NPCGrid npcs={npcs} />
      </div>
    </main>
  );
}
