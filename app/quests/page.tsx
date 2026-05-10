import { prisma } from "@/lib/prisma";
import { requireKampagne } from "@/lib/kampagne";
import { visibilityWhere } from "@/lib/visibility";
import SiteHeader from "@/components/SiteHeader";
import QuestCreateButton from "@/components/QuestCreateButton";
import QuestCard from "@/components/QuestCard";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  Aktiv:          "#4ADE80",
  Abgeschlossen:  "#60A5FA",
  Gescheitert:    "#F87171",
  Pausiert:       "#FCD34D",
  Unbekannt:      "#9CA3AF",
};

const PRIORITAET_COLORS: Record<string, string> = {
  Hoch:    "var(--dnd-red)",
  Mittel:  "var(--dnd-gold)",
  Niedrig: "#9CA3AF",
};

export default async function QuestsPage() {
  const ctx = await requireKampagne();

  const where = { kampagneId: ctx.kampagneId, ...visibilityWhere(ctx) };

  const [quests, npcs, locations, orgs, chars] = await Promise.all([
    prisma.quest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { objectives: { orderBy: { order: "asc" } } },
    }),
    prisma.nPC.findMany({ where: { kampagneId: ctx.kampagneId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.location.findMany({ where: { kampagneId: ctx.kampagneId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.organisation.findMany({ where: { kampagneId: ctx.kampagneId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.charakter.findMany({ where: { kampagneId: ctx.kampagneId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <SiteHeader active="quests" />
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "var(--dnd-label)" }}>
            {quests.length} {quests.length === 1 ? "Quest" : "Quests"}
          </p>
          <QuestCreateButton
              availableNpcs={npcs}
              availableLocations={locations}
              availableOrgs={orgs}
              availableChars={chars}
            />
        </div>

        {quests.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-cinzel text-sm tracking-widest" style={{ color: "var(--dnd-text-muted)" }}>
              Noch keine Quests vorhanden.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quests.map((quest) => {
              const statusColor = STATUS_COLORS[quest.status] ?? STATUS_COLORS["Unbekannt"];
              const prioritaetColor = quest.prioritaet ? PRIORITAET_COLORS[quest.prioritaet] : null;
              return (
                <QuestCard
                  key={quest.id}
                  id={quest.id}
                  title={quest.title}
                  status={quest.status}
                  typ={quest.typ}
                  prioritaet={quest.prioritaet}
                  summary={quest.summary}
                  objectives={quest.objectives}
                  statusColor={statusColor}
                  prioritaetColor={prioritaetColor}
                />
              );
            })}
          </div>
        )}
      </div>
      <footer className="mt-auto py-6 text-center">
        <p className="font-cinzel text-xs tracking-widest" style={{ color: "var(--dnd-text-muted)" }}>✦ {ctx.kampagneName.toUpperCase()} ✦</p>
      </footer>
    </main>
  );
}
