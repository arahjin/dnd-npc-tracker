"use client";

import { useState } from "react";
import { QUEST_STATUS_OPTIONS } from "@/lib/constants";
import QuestCard from "./QuestCard";

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
  const [filterStatus, setFilterStatus] = useState("");
  const [filterVisibility, setFilterVisibility] = useState("");

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
          <option value="">Alle Status</option>
          {QUEST_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {isDM && (
          <select
            value={filterVisibility}
            onChange={(e) => setFilterVisibility(e.target.value)}
            className={selectClass}
            style={selectStyle}
          >
            <option value="">Alle Sichtbarkeiten</option>
            <option value="public">Öffentlich</option>
            <option value="privat">Privat</option>
          </select>
        )}
        <p className="font-cinzel text-xs tracking-widest" style={{ color: "var(--dnd-text-muted)" }}>
          {filtered.length} {filtered.length === 1 ? "QUEST" : "QUESTS"} GEFUNDEN
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-cinzel text-sm tracking-widest" style={{ color: "var(--dnd-text-muted)" }}>
            Keine Quests entsprechen dem Filter.
          </p>
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
