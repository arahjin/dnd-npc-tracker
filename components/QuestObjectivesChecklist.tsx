"use client";

import { useState } from "react";

type Objective = { id: string; label: string; done: boolean; order: number };

type Props = {
  questId: string;
  initialObjectives: Objective[];
  canEdit: boolean;
};

export default function QuestObjectivesChecklist({ questId, initialObjectives, canEdit }: Props) {
  const [objectives, setObjectives] = useState<Objective[]>(initialObjectives);
  const [newLabel, setNewLabel] = useState("");
  const [adding, setAdding] = useState(false);

  async function toggleDone(objective: Objective) {
    // Optimistic update
    setObjectives((prev) =>
      prev.map((o) => o.id === objective.id ? { ...o, done: !o.done } : o)
    );
    await fetch(`/api/quests/${questId}/objectives`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ objectiveId: objective.id, done: !objective.done }),
    });
  }

  async function addObjective() {
    if (!newLabel.trim()) return;
    setAdding(true);
    const res = await fetch(`/api/quests/${questId}/objectives`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: newLabel.trim() }),
    });
    if (res.ok) {
      const obj = await res.json();
      setObjectives((prev) => [...prev, obj]);
      setNewLabel("");
    }
    setAdding(false);
  }

  async function deleteObjective(objectiveId: string) {
    setObjectives((prev) => prev.filter((o) => o.id !== objectiveId));
    await fetch(`/api/quests/${questId}/objectives`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ objectiveId }),
    });
  }

  if (objectives.length === 0 && !canEdit) {
    return (
      <p className="text-sm py-2" style={{ color: "var(--dnd-text-muted)" }}>Keine Ziele definiert.</p>
    );
  }

  return (
    <div className="space-y-2">
      {objectives.map((obj) => (
        <div key={obj.id} className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={obj.done}
            disabled={!canEdit}
            onChange={() => toggleDone(obj)}
            className="accent-red-700 w-4 h-4 shrink-0"
            style={{ cursor: canEdit ? "pointer" : "not-allowed" }}
          />
          <span
            className="text-sm flex-1"
            style={{
              color: obj.done ? "var(--dnd-text-muted)" : "var(--dnd-text)",
              fontFamily: "'Roboto', sans-serif",
              textDecoration: obj.done ? "line-through" : "none",
            }}
          >
            {obj.label}
          </span>
          {canEdit && (
            <button
              type="button"
              onClick={() => deleteObjective(obj.id)}
              className="font-cinzel text-xs px-1.5 py-0.5 shrink-0 transition-all"
              style={{ color: "#F87171", background: "transparent", border: "none", cursor: "pointer" }}
            >
              ✕
            </button>
          )}
        </div>
      ))}

      {canEdit && (
        <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: "1px solid #1E1E1E" }}>
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addObjective())}
            placeholder="Neues Ziel hinzufügen..."
            className="flex-1 px-3 py-1.5 text-sm outline-none"
            style={{
              background: "#0A0A0A",
              border: "1px solid #2A2A2A",
              color: "var(--dnd-text)",
              fontFamily: "'Roboto', sans-serif",
            }}
          />
          <button
            type="button"
            onClick={addObjective}
            disabled={adding || !newLabel.trim()}
            className="font-cinzel text-xs tracking-widest px-4 py-1.5 transition-all disabled:opacity-40"
            style={{ background: "var(--dnd-red)", color: "#F5EDD6", border: "1px solid var(--dnd-red-dark)" }}
          >
            {adding ? "..." : "+ Hinzufügen"}
          </button>
        </div>
      )}
    </div>
  );
}
