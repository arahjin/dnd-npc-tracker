import Link from "next/link";
import { notFound } from "next/navigation";
import { requireKampagne } from "@/lib/kampagne";
import { prisma } from "@/lib/prisma";
import { canSeePrivate } from "@/lib/visibility";
import { IconLock, IconScroll } from "@/components/Icons";
import QuestObjectivesChecklist from "@/components/QuestObjectivesChecklist";
import QuestDeleteButton from "@/components/QuestDeleteButton";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Aktiv:         { bg: "#0D2010", text: "#4ADE80", border: "#166534" },
  Abgeschlossen: { bg: "#0A1020", text: "#60A5FA", border: "#1E3A8A" },
  Gescheitert:   { bg: "#200D0D", text: "#F87171", border: "#991B1B" },
  Pausiert:      { bg: "#201A0A", text: "#FCD34D", border: "#92400E" },
  Unbekannt:     { bg: "#141414", text: "#9CA3AF", border: "#374151" },
};

const PRIORITAET_COLORS: Record<string, string> = {
  Hoch:    "var(--dnd-red)",
  Mittel:  "var(--dnd-gold)",
  Niedrig: "#9CA3AF",
};

function Badge({ label, colors }: { label: string; colors: { bg: string; text: string; border: string } }) {
  return (
    <span className="font-cinzel text-xs px-3 py-1 tracking-wide"
      style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
      {label}
    </span>
  );
}

function SectionBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid var(--dnd-border)", background: "var(--dnd-bg-card)" }}>
      <div className="px-4 py-2" style={{ background: "var(--dnd-red-dark)", borderBottom: "1px solid var(--dnd-border)" }}>
        <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "var(--dnd-heading)" }}>{title}</h2>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

export default async function QuestDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireKampagne();

  const quest = await prisma.quest.findUnique({
    where: { id },
    include: {
      objectives: { orderBy: { order: "asc" } },
      npcs: { include: { npc: { select: { id: true, name: true, image: true } } } },
      locations: { include: { location: { select: { id: true, name: true, art: true } } } },
      organisationen: { include: { organisation: { select: { id: true, name: true, typ: true } } } },
      charaktere: { include: { charakter: { select: { id: true, name: true, image: true } } } },
      journalEntries: { include: { entry: { select: { id: true, titel: true, typ: true, createdAt: true } } } },
      vorlaeuferVon: { include: { nachfolgerQuest: { select: { id: true, title: true, status: true } } } },
      nachfolgerVon: { include: { vorlaeuferQuest: { select: { id: true, title: true, status: true } } } },
    },
  });

  if (!quest || quest.kampagneId !== ctx.kampagneId) notFound();
  if (!canSeePrivate(ctx, quest.erstellerId)) notFound();

  const canEdit = ctx.isDM || ctx.isAdmin || quest.erstellerId === ctx.userId;
  const statusColors = STATUS_COLORS[quest.status] ?? STATUS_COLORS["Unbekannt"];

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      {/* Sub-header */}
      <header style={{ background: "#111111", borderBottom: "1px solid #252525" }}>
        <div style={{ height: "3px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-red) 30%, var(--dnd-gold) 50%, var(--dnd-red) 70%, var(--dnd-red-dark))" }} />
        <div className="mx-auto max-w-5xl px-4 md:px-6" style={{ height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/quests" className="ddb-nav-link" style={{ height: "60px", paddingLeft: 0 }}>
            ← Zurück zu Quests
          </Link>
          {canEdit && (
            <div className="flex gap-2">
              <Link
                href={`/quests/${id}/edit`}
                className="font-cinzel text-xs tracking-widest px-4 py-2 transition-all"
                style={{ border: "1px solid var(--dnd-border)", color: "var(--dnd-text-muted)" }}
              >
                BEARBEITEN
              </Link>
              <QuestDeleteButton id={id} />
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 md:px-6 py-10 space-y-6">
        {/* Title + Badges */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <IconScroll size={20} color="var(--dnd-gold)" />
            <h1 className="font-cinzel text-3xl md:text-4xl font-bold leading-tight" style={{ color: "var(--dnd-heading)" }}>
              {quest.title}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge label={quest.status} colors={statusColors} />
            <Badge label={quest.typ} colors={{ bg: "#141414", text: "#C8B8A8", border: "#2A2A2A" }} />
            {quest.prioritaet && (
              <span className="font-cinzel text-xs px-3 py-1 tracking-wide flex items-center gap-1.5"
                style={{ background: "#141414", color: PRIORITAET_COLORS[quest.prioritaet] ?? "#9CA3AF", border: "1px solid #2A2A2A" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: PRIORITAET_COLORS[quest.prioritaet] ?? "#9CA3AF", display: "inline-block" }} />
                {quest.prioritaet}
              </span>
            )}
            {quest.deadline && (
              <span className="font-cinzel text-xs px-3 py-1 tracking-wide"
                style={{ background: "#141414", color: "var(--dnd-text-muted)", border: "1px solid #2A2A2A" }}>
                Deadline: {quest.deadline}
              </span>
            )}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, var(--dnd-red), transparent)" }} />
            <span style={{ color: "var(--dnd-label)" }}>✦</span>
          </div>
        </div>

        {/* Summary */}
        {quest.summary && (
          <p className="text-base italic leading-relaxed" style={{ color: "var(--dnd-text-muted)", fontFamily: "'Roboto', sans-serif" }}>
            {quest.summary}
          </p>
        )}

        {/* Objectives */}
        {(quest.objectives.length > 0 || canEdit) && (
          <SectionBox title="Ziele">
            <QuestObjectivesChecklist
              questId={quest.id}
              initialObjectives={quest.objectives}
              canEdit={canEdit}
            />
          </SectionBox>
        )}

        {/* Description */}
        {quest.description && (
          <SectionBox title="Beschreibung">
            <p className="text-sm leading-relaxed" style={{ color: "var(--dnd-text)", fontFamily: "'Roboto', sans-serif", whiteSpace: "pre-wrap" }}>
              {quest.description}
            </p>
          </SectionBox>
        )}

        {/* Reward */}
        {quest.reward && (
          <SectionBox title="Belohnung">
            <p className="text-sm leading-relaxed" style={{ color: "var(--dnd-gold)", fontFamily: "'Roboto', sans-serif" }}>
              {quest.reward}
            </p>
          </SectionBox>
        )}

        {/* GM Notes — DM only */}
        {(ctx.isDM || ctx.isAdmin) && quest.gmNotes && (
          <div style={{ border: "1px solid #991B1B", background: "#120808" }}>
            <div className="px-4 py-2" style={{ background: "#200D0D", borderBottom: "1px solid #991B1B" }}>
              <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase flex items-center gap-2" style={{ color: "#FCA5A5" }}>
                <IconLock size={12} color="#FCA5A5" /> GM-Notizen — Nur für DMs sichtbar
              </h2>
            </div>
            <div className="px-4 py-3">
              <p className="text-sm leading-relaxed" style={{ color: "#FCA5A5", fontFamily: "'Roboto', sans-serif", whiteSpace: "pre-wrap" }}>
                {quest.gmNotes}
              </p>
            </div>
          </div>
        )}

        {/* Linked NPCs */}
        {quest.npcs.length > 0 && (
          <SectionBox title="Verknüpfte NPCs">
            <div className="flex flex-wrap gap-2">
              {quest.npcs.map((qn) => (
                <Link
                  key={qn.npcId}
                  href={`/npc/${qn.npcId}`}
                  className="font-cinzel text-xs px-3 py-1.5 transition-all"
                  style={{ background: "#141414", border: "1px solid var(--dnd-border)", color: "var(--dnd-heading)", textDecoration: "none" }}
                >
                  {qn.npc.name}
                  {qn.rolle && <span style={{ color: "var(--dnd-text-muted)", marginLeft: "6px" }}>· {qn.rolle}</span>}
                </Link>
              ))}
            </div>
          </SectionBox>
        )}

        {/* Linked Locations */}
        {quest.locations.length > 0 && (
          <SectionBox title="Verknüpfte Locations">
            <div className="flex flex-wrap gap-2">
              {quest.locations.map((ql) => (
                <Link
                  key={ql.locationId}
                  href={`/locations/${ql.locationId}`}
                  className="font-cinzel text-xs px-3 py-1.5 transition-all"
                  style={{ background: "#141414", border: "1px solid var(--dnd-border)", color: "var(--dnd-heading)", textDecoration: "none" }}
                >
                  {ql.location.name}
                  {ql.rolle && <span style={{ color: "var(--dnd-text-muted)", marginLeft: "6px" }}>· {ql.rolle}</span>}
                </Link>
              ))}
            </div>
          </SectionBox>
        )}

        {/* Linked Organisationen */}
        {quest.organisationen.length > 0 && (
          <SectionBox title="Verknüpfte Organisationen">
            <div className="flex flex-wrap gap-2">
              {quest.organisationen.map((qo) => (
                <Link
                  key={qo.organisationId}
                  href={`/organisationen/${qo.organisationId}`}
                  className="font-cinzel text-xs px-3 py-1.5 transition-all"
                  style={{ background: "#141414", border: "1px solid var(--dnd-border)", color: "var(--dnd-heading)", textDecoration: "none" }}
                >
                  {qo.organisation.name}
                  {qo.rolle && <span style={{ color: "var(--dnd-text-muted)", marginLeft: "6px" }}>· {qo.rolle}</span>}
                </Link>
              ))}
            </div>
          </SectionBox>
        )}

        {/* Linked Charaktere */}
        {quest.charaktere.length > 0 && (
          <SectionBox title="Verknüpfte Charaktere">
            <div className="flex flex-wrap gap-2">
              {quest.charaktere.map((qc) => (
                <Link
                  key={qc.charakterId}
                  href={`/charaktere/${qc.charakterId}`}
                  className="font-cinzel text-xs px-3 py-1.5 transition-all"
                  style={{ background: "#141414", border: "1px solid var(--dnd-border)", color: "var(--dnd-heading)", textDecoration: "none" }}
                >
                  {qc.charakter.name}
                  {qc.rolle && <span style={{ color: "var(--dnd-text-muted)", marginLeft: "6px" }}>· {qc.rolle}</span>}
                </Link>
              ))}
            </div>
          </SectionBox>
        )}

        {/* Related Quests */}
        {(quest.vorlaeuferVon.length > 0 || quest.nachfolgerVon.length > 0) && (
          <SectionBox title="Verwandte Quests">
            <div className="space-y-2">
              {quest.nachfolgerVon.map((qr) => (
                <div key={qr.id} className="flex items-center gap-2">
                  <span className="font-cinzel text-xs" style={{ color: "var(--dnd-text-muted)" }}>Vorgänger:</span>
                  <Link href={`/quests/${qr.vorlaeuferQuestId}`} className="font-cinzel text-xs hover:underline" style={{ color: "var(--dnd-heading)" }}>
                    {qr.vorlaeuferQuest.title}
                  </Link>
                </div>
              ))}
              {quest.vorlaeuferVon.map((qr) => (
                <div key={qr.id} className="flex items-center gap-2">
                  <span className="font-cinzel text-xs" style={{ color: "var(--dnd-text-muted)" }}>Nachfolger:</span>
                  <Link href={`/quests/${qr.nachfolgerQuestId}`} className="font-cinzel text-xs hover:underline" style={{ color: "var(--dnd-heading)" }}>
                    {qr.nachfolgerQuest.title}
                  </Link>
                </div>
              ))}
            </div>
          </SectionBox>
        )}
      </div>
    </main>
  );
}
