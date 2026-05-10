import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireKampagne } from "@/lib/kampagne";
import { visibilityWhere } from "@/lib/visibility";
import SiteHeader from "@/components/SiteHeader";
import QuestCreateButton from "@/components/QuestCreateButton";

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
              const doneCount = quest.objectives.filter((o) => o.done).length;
              const totalCount = quest.objectives.length;
              const statusColor = STATUS_COLORS[quest.status] ?? STATUS_COLORS["Unbekannt"];
              const prioritaetColor = quest.prioritaet ? PRIORITAET_COLORS[quest.prioritaet] : null;

              return (
                <Link
                  key={quest.id}
                  href={`/quests/${quest.id}`}
                  style={{
                    display: "block",
                    background: "var(--dnd-bg-card)",
                    border: "1px solid var(--dnd-border)",
                    textDecoration: "none",
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--dnd-gold)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--dnd-border)"; }}
                >
                  {/* Gold accent line */}
                  <div style={{ height: "2px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-gold), var(--dnd-red-dark))" }} />

                  <div className="p-4 space-y-2">
                    {/* Title */}
                    <h3 className="font-cinzel font-semibold text-base leading-snug" style={{ color: "var(--dnd-heading)" }}>
                      {quest.title}
                    </h3>

                    {/* Status badge */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="font-cinzel text-xs px-2 py-0.5"
                        style={{
                          color: statusColor,
                          background: statusColor + "1A",
                          border: `1px solid ${statusColor}44`,
                        }}
                      >
                        {quest.status}
                      </span>
                      {prioritaetColor && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: prioritaetColor, display: "inline-block" }} />
                          <span className="font-cinzel text-xs" style={{ color: "var(--dnd-text-muted)" }}>{quest.prioritaet}</span>
                        </span>
                      )}
                    </div>

                    {/* Typ */}
                    <p className="font-cinzel text-xs tracking-wide" style={{ color: "var(--dnd-text-muted)" }}>
                      {quest.typ}
                    </p>

                    {/* Summary */}
                    {quest.summary && (
                      <p className="text-sm leading-relaxed line-clamp-2" style={{ color: "var(--dnd-text)", fontFamily: "'Roboto', sans-serif" }}>
                        {quest.summary}
                      </p>
                    )}

                    {/* Objectives progress */}
                    {totalCount > 0 && (
                      <p className="text-xs" style={{ color: "var(--dnd-text-muted)" }}>
                        {doneCount}/{totalCount} Ziele
                      </p>
                    )}
                  </div>
                </Link>
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
