"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { QUEST_STATUS_OPTIONS } from "@/lib/constants";
import QuestCard from "./QuestCard";
import ViewToggle from "@/components/ViewToggle";
import { useViewMode } from "@/lib/useViewMode";

type Objective = { id: string; label: string; done: boolean; order: number };
type Quest = {
  id: string;
  title: string;
  status: string;
  typ: string;
  prioritaet: string | null;
  summary: string | null;
  sichtbarkeit: string;
  objectives: Objective[];
};

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

export default function QuestGrid({ quests, isDM = false }: { quests: Quest[]; isDM?: boolean }) {
  const t = useTranslations("quest");
  const tCommon = useTranslations("common");
  const tc = useTranslations("constants");
  const QUEST_STATUS_LABELS: Record<string, string> = {
    "Aktiv": tc("questStatusAktiv"), "Abgeschlossen": tc("questStatusAbgeschlossen"),
    "Gescheitert": tc("questStatusGescheitert"), "Pausiert": tc("questStatusPausiert"),
    "Unbekannt": tc("questStatusUnbekannt"),
  };

  const [filterStatus, setFilterStatus] = useState("");
  const [filterVisibility, setFilterVisibility] = useState("");
  const [view, setView] = useViewMode("quest");

  const filtered = quests.filter((q) => {
    const matchStatus = filterStatus ? q.status === filterStatus : true;
    const matchVisibility = filterVisibility ? q.sichtbarkeit === filterVisibility : true;
    return matchStatus && matchVisibility;
  });

  const selectClass = "font-cinzel text-sm px-3 py-2 outline-none tracking-wide transition-colors";
  const selectStyle = { background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)", color: "var(--dnd-text)" };

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-3 items-center">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={selectClass}
          style={selectStyle}
        >
          <option value="">{t("allStatus")}</option>
          {QUEST_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{QUEST_STATUS_LABELS[s] ?? s}</option>)}
        </select>
        {isDM && (
          <select
            value={filterVisibility}
            onChange={(e) => setFilterVisibility(e.target.value)}
            className={selectClass}
            style={selectStyle}
          >
            <option value="">{tCommon("allVisibilities")}</option>
            <option value="public">{tCommon("public")}</option>
            <option value="privat">{tCommon("private")}</option>
          </select>
        )}
        <p className="font-cinzel text-xs tracking-widest" style={{ color: "var(--dnd-text-muted)" }}>
          {filtered.length} {filtered.length === 1 ? t("countSingle") : t("countPlural")} {tCommon("found")}
        </p>
        <div className="ml-auto"><ViewToggle value={view} onChange={setView} /></div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-cinzel text-sm tracking-widest" style={{ color: "var(--dnd-text-muted)" }}>
            {t("emptyFiltered")}
          </p>
        </div>
      ) : view === "list" ? (
        <div style={{ border: "1px solid var(--dnd-border)", background: "var(--dnd-bg-card)" }}>
          {filtered.map((quest) => {
            const statusColor = STATUS_COLORS[quest.status] ?? STATUS_COLORS["Unbekannt"];
            const prioColor = quest.prioritaet ? (PRIORITAET_COLORS[quest.prioritaet] ?? null) : null;
            return (
              <Link key={quest.id} href={`/quests/${quest.id}`}
                className="flex items-center gap-4 px-4 py-2.5 transition-colors hover:bg-white/5"
                style={{ borderBottom: "1px solid var(--dnd-border)", color: "var(--dnd-text)" }}>
                <span
                  className="w-8 h-8 shrink-0 flex items-center justify-center rounded-sm"
                  style={{ background: statusColor + "1A", border: `1px solid ${statusColor}44` }}
                >
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: statusColor, display: "inline-block" }} />
                </span>
                <span className="font-cinzel font-semibold text-sm truncate" style={{ color: "var(--dnd-heading)" }}>{quest.title}</span>
                <span className="hidden md:inline font-cinzel text-xs truncate" style={{ color: "var(--dnd-text-muted)" }}>{quest.typ}</span>
                <div className="ml-auto flex items-center gap-2 shrink-0">
                  <span
                    className="font-cinzel text-xs px-2 py-0.5"
                    style={{ color: statusColor, background: statusColor + "1A", border: `1px solid ${statusColor}44` }}
                  >
                    {quest.status}
                  </span>
                  {prioColor && (
                    <span className="hidden sm:inline-flex items-center gap-1">
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: prioColor, display: "inline-block" }} />
                      <span className="font-cinzel text-xs" style={{ color: "var(--dnd-text-muted)" }}>{quest.prioritaet}</span>
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((quest) => (
            <QuestCard
              key={quest.id}
              id={quest.id}
              title={quest.title}
              status={quest.status}
              typ={quest.typ}
              prioritaet={quest.prioritaet}
              summary={quest.summary}
              objectives={quest.objectives}
              statusColor={STATUS_COLORS[quest.status] ?? STATUS_COLORS["Unbekannt"]}
              prioritaetColor={quest.prioritaet ? (PRIORITAET_COLORS[quest.prioritaet] ?? null) : null}
            />
          ))}
        </div>
      )}
    </>
  );
}
