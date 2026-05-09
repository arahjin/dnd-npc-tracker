"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Mitglied = {
  id: string;
  charakterId: string;
  name: string;
  image: string | null;
  rolle: string | null;
  playerName: string;
};
type Charakter = { id: string; name: string; user: { name: string } };

export default function CharakterMitglieder({
  orgId,
  mitglieder,
  alleCharaktere,
}: {
  orgId: string;
  mitglieder: Mitglied[];
  alleCharaktere: Charakter[];
}) {
  const router = useRouter();
  const [selectedChar, setSelectedChar] = useState("");
  const [rolle, setRolle] = useState("");
  const [adding, setAdding] = useState(false);

  const verfuegbar = alleCharaktere.filter((c) => !mitglieder.find((m) => m.charakterId === c.id));

  async function handleAdd() {
    if (!selectedChar) return;
    setAdding(true);
    await fetch(`/api/organisationen/${orgId}/charaktermitglieder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ charakterId: selectedChar, rolle: rolle.trim() || null }),
    });
    setSelectedChar(""); setRolle("");
    setAdding(false);
    router.refresh();
  }

  async function handleRemove(charakterId: string) {
    if (!confirm("Charakter entfernen?")) return;
    await fetch(`/api/organisationen/${orgId}/charaktermitglieder`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ charakterId }),
    });
    router.refresh();
  }

  const inputStyle = { background: "#FFFFFF", border: "1px solid #C8C4BC", color: "var(--dnd-text)" };

  return (
    <div style={{ border: "1px solid var(--dnd-border)", background: "var(--dnd-bg-card)" }}>
      <div className="px-4 py-2" style={{ background: "var(--dnd-red-dark)", borderBottom: "1px solid var(--dnd-border)" }}>
        <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "var(--dnd-heading)" }}>
          Charaktere ({mitglieder.length})
        </h2>
      </div>

      <div className="divide-y" style={{ borderColor: "#E0DDD6" }}>
        {mitglieder.length === 0 && (
          <p className="px-4 py-4 text-sm" style={{ color: "var(--dnd-text-muted)" }}>Noch keine Charaktere zugeordnet.</p>
        )}
        {mitglieder.map((m) => (
          <div key={m.id} className="flex items-center gap-4 px-4 py-3">
            <div className="relative w-10 h-10 shrink-0 overflow-hidden" style={{ border: "1px solid var(--dnd-border)" }}>
              {m.image
                ? <Image src={m.image} alt={m.name} fill className="object-cover" />
                : <div className="flex h-full items-center justify-center text-lg" style={{ background: "#FFFFFF" }}>⚔</div>
              }
            </div>
            <div className="flex-1 min-w-0">
              <Link href={`/charaktere/${m.charakterId}`} className="font-cinzel text-sm font-semibold hover:underline" style={{ color: "var(--dnd-heading)" }}>
                {m.name}
              </Link>
              <p className="text-xs mt-0.5" style={{ color: "var(--dnd-gold)" }}>🎲 {m.playerName}</p>
              {m.rolle && <p className="text-xs" style={{ color: "var(--dnd-text-muted)" }}>{m.rolle}</p>}
            </div>
            <button onClick={() => handleRemove(m.charakterId)} className="font-cinzel text-xs px-3 py-1"
              style={{ border: "1px solid #991B1B", color: "#F87171" }}>✕</button>
          </div>
        ))}
      </div>

      {verfuegbar.length > 0 && (
        <div className="px-4 py-4 flex flex-wrap gap-2 items-end" style={{ borderTop: "1px solid #E0DDD6" }}>
          <div className="flex-1 min-w-36">
            <p className="font-cinzel text-xs tracking-widest mb-1.5" style={{ color: "var(--dnd-label)" }}>Charakter</p>
            <select value={selectedChar} onChange={(e) => setSelectedChar(e.target.value)}
              className="w-full px-3 py-2 font-cinzel text-sm outline-none" style={inputStyle}>
              <option value="">— Wählen —</option>
              {verfuegbar.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.user.name})</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-36">
            <p className="font-cinzel text-xs tracking-widest mb-1.5" style={{ color: "var(--dnd-label)" }}>Rolle</p>
            <input type="text" value={rolle} onChange={(e) => setRolle(e.target.value)}
              placeholder="z.B. Anführer, Mitglied..." className="w-full px-3 py-2 text-sm outline-none" style={inputStyle} />
          </div>
          <button onClick={handleAdd} disabled={!selectedChar || adding}
            className="font-cinzel text-xs tracking-widest px-4 py-2 transition-all disabled:opacity-40"
            style={{ background: "var(--dnd-red)", color: "#FFFFFF", border: "1px solid var(--dnd-red-dark)" }}>
            {adding ? "..." : "+ HINZUFÜGEN"}
          </button>
        </div>
      )}
    </div>
  );
}
