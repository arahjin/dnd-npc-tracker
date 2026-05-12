import { prisma } from "@/lib/prisma";
import { requireKampagne } from "@/lib/kampagne";
import { visibilityWhere } from "@/lib/visibility";
import QuestCreateButton from "@/components/QuestCreateButton";
import QuestGrid from "@/components/QuestGrid";

export default async function QuestsPage() {
  const ctx = await requireKampagne();

  const quests = await prisma.quest.findMany({
    where: { kampagneId: ctx.kampagneId, ...visibilityWhere(ctx) },
    orderBy: { createdAt: "desc" },
    include: { objectives: { orderBy: { order: "asc" } } },
  });

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "var(--dnd-label)" }}>
            {quests.length} {quests.length === 1 ? "Quest" : "Quests"}
          </p>
          <QuestCreateButton />
        </div>

        {quests.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-cinzel text-sm tracking-widest" style={{ color: "var(--dnd-text-muted)" }}>
              Noch keine Quests vorhanden.
            </p>
          </div>
        ) : (
          <QuestGrid quests={quests} />
        )}
      </div>
      <footer className="mt-auto py-6 text-center">
        <p className="font-cinzel text-xs tracking-widest" style={{ color: "var(--dnd-text-muted)" }}>✦ {ctx.kampagneName.toUpperCase()} ✦</p>
      </footer>
    </main>
  );
}
