"use client";

import Link from "next/link";

interface QuestObjective {
  done: boolean;
}

interface QuestCardProps {
  id: string;
  title: string;
  status: string;
  typ: string;
  prioritaet: string | null;
  summary: string | null;
  objectives: QuestObjective[];
  statusColor: string;
  prioritaetColor: string | null;
}

export default function QuestCard({
  id,
  title,
  status,
  typ,
  prioritaet,
  summary,
  objectives,
  statusColor,
  prioritaetColor,
}: QuestCardProps) {
  const doneCount = objectives.filter((o) => o.done).length;
  const totalCount = objectives.length;

  return (
    <Link
      href={`/quests/${id}`}
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
          {title}
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
            {status}
          </span>
          {prioritaetColor && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: prioritaetColor, display: "inline-block" }} />
              <span className="font-cinzel text-xs" style={{ color: "var(--dnd-text-muted)" }}>{prioritaet}</span>
            </span>
          )}
        </div>

        {/* Typ */}
        <p className="font-cinzel text-xs tracking-wide" style={{ color: "var(--dnd-text-muted)" }}>
          {typ}
        </p>

        {/* Summary */}
        {summary && (
          <p className="text-sm leading-relaxed line-clamp-2" style={{ color: "var(--dnd-text)", fontFamily: "'Roboto', sans-serif" }}>
            {summary}
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
}
