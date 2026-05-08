"use client";

import { useState, useEffect } from "react";

type Tag = { id: string; tagTyp: string; referenzId: string };
type Entry = {
  id: string; titel: string | null; inhalt: string; typ: string;
  createdAt: string; user: { id: string; name: string }; tags: Tag[];
};
type TagOption = { id: string; label: string; typ: string };

type Props = {
  typ: "TAGEBUCH" | "GESCHICHTE";
  userId: string;
  isDM: boolean;
  tagOptions: TagOption[];
};

export default function JournalView({ typ, userId, isDM, tagOptions }: Props) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [titel, setTitel] = useState("");
  const [inhalt, setInhalt] = useState("");
  const [selectedTags, setSelectedTags] = useState<TagOption[]>([]);
  const [tagSearch, setTagSearch] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadEntries(); }, []);

  async function loadEntries() {
    setLoading(true);
    const res = await fetch(`/api/journal?typ=${typ}`);
    if (res.ok) setEntries(await res.json());
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inhalt.trim()) return;
    setSaving(true);
    const res = await fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        typ, titel, inhalt,
        tags: selectedTags.map((t) => ({ tagTyp: t.typ, referenzId: t.id })),
      }),
    });
    if (res.ok) {
      setTitel(""); setInhalt(""); setSelectedTags([]); setShowForm(false);
      await loadEntries();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Eintrag löschen?")) return;
    await fetch(`/api/journal/${id}`, { method: "DELETE" });
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  const filteredTagOptions = tagOptions.filter(
    (t) => t.label.toLowerCase().includes(tagSearch.toLowerCase()) && !selectedTags.find((s) => s.id === t.id)
  );

  const inputStyle = { background: "#0A0A0A", border: "1px solid #2A2A2A", color: "#D8D0C8", fontFamily: "'Roboto', sans-serif" };

  return (
    <div>
      {/* New Entry Button */}
      {!showForm && (
        <button onClick={() => setShowForm(true)} className="ddb-cta mb-8">
          + Neuer Eintrag
        </button>
      )}

      {/* New Entry Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-5 space-y-4" style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}>
          <div style={{ height: "2px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-gold), var(--dnd-red-dark))" }} />
          <div>
            <label className="font-cinzel text-xs tracking-[0.15em] uppercase block mb-2" style={{ color: "var(--dnd-label)" }}>Titel (optional)</label>
            <input type="text" value={titel} onChange={(e) => setTitel(e.target.value)}
              placeholder="Titel des Eintrags" className="w-full px-4 py-2 outline-none" style={inputStyle} />
          </div>
          <div>
            <label className="font-cinzel text-xs tracking-[0.15em] uppercase block mb-2" style={{ color: "var(--dnd-label)" }}>Inhalt *</label>
            <textarea value={inhalt} onChange={(e) => setInhalt(e.target.value)} rows={6} required
              placeholder="Was ist passiert..." className="w-full px-4 py-2 outline-none resize-none" style={inputStyle} />
          </div>

          {/* Tagging */}
          <div>
            <label className="font-cinzel text-xs tracking-[0.15em] uppercase block mb-2" style={{ color: "var(--dnd-label)" }}>Personen / Orgs / Charaktere taggen</label>
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedTags.map((t) => (
                  <span key={t.id} className="font-cinzel text-xs px-2 py-1 flex items-center gap-1"
                    style={{ background: "#1A0A0A", border: "1px solid var(--dnd-red-dark)", color: "var(--dnd-red-light)" }}>
                    @{t.label}
                    <button type="button" onClick={() => setSelectedTags((p) => p.filter((s) => s.id !== t.id))} style={{ opacity: 0.7 }}>✕</button>
                  </span>
                ))}
              </div>
            )}
            <input type="text" value={tagSearch} onChange={(e) => setTagSearch(e.target.value)}
              placeholder="Person, Org oder Charakter suchen..." className="w-full px-4 py-2 outline-none" style={inputStyle} />
            {tagSearch && filteredTagOptions.length > 0 && (
              <div style={{ background: "#111", border: "1px solid var(--dnd-border)", maxHeight: "160px", overflowY: "auto" }}>
                {filteredTagOptions.slice(0, 8).map((t) => (
                  <button key={t.id} type="button"
                    onClick={() => { setSelectedTags((p) => [...p, t]); setTagSearch(""); }}
                    className="w-full text-left px-4 py-2 font-cinzel text-xs transition-colors"
                    style={{ color: "var(--dnd-text)", borderBottom: "1px solid #1A1A1A" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#1A1A1A")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
                    <span style={{ color: "var(--dnd-text-muted)" }}>{t.typ === "PERSON" ? "👤" : t.typ === "ORGANISATION" ? "🏛" : t.typ === "CHARAKTER" ? "⚔" : "🎲"}</span>
                    {" "}{t.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="ddb-cta">{saving ? "SPEICHERN..." : "EINTRAG SPEICHERN"}</button>
            <button type="button" onClick={() => setShowForm(false)} className="font-cinzel text-sm px-4 py-2"
              style={{ border: "1px solid var(--dnd-border)", color: "var(--dnd-text-muted)" }}>ABBRECHEN</button>
          </div>
        </form>
      )}

      {/* Entries */}
      {loading ? (
        <p className="font-cinzel text-sm" style={{ color: "var(--dnd-text-muted)" }}>Lade Einträge...</p>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center py-20">
          <p className="text-4xl mb-4">📖</p>
          <p className="font-cinzel text-sm" style={{ color: "var(--dnd-text-muted)" }}>Noch keine Einträge.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => {
            const canDelete = isDM || entry.user.id === userId;
            return (
              <article key={entry.id} style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}>
                <div style={{ height: "2px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-gold), var(--dnd-red-dark))" }} />
                <div className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      {entry.titel && (
                        <h3 className="font-cinzel text-base font-semibold mb-1" style={{ color: "var(--dnd-heading)" }}>{entry.titel}</h3>
                      )}
                      <p className="font-cinzel text-xs" style={{ color: "var(--dnd-text-muted)" }}>
                        {typ === "GESCHICHTE" && <span style={{ color: "var(--dnd-gold)" }}>{entry.user.name} · </span>}
                        {new Date(entry.createdAt).toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })}
                      </p>
                    </div>
                    {canDelete && (
                      <button onClick={() => handleDelete(entry.id)} className="font-cinzel text-xs px-3 py-1 shrink-0"
                        style={{ border: "1px solid #991B1B", color: "#F87171" }}>✕</button>
                    )}
                  </div>
                  <p className="leading-relaxed whitespace-pre-wrap" style={{ color: "var(--dnd-text)", fontFamily: "'Roboto', sans-serif" }}>{entry.inhalt}</p>
                  {entry.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {entry.tags.map((tag) => {
                        const opt = tagOptions.find((o) => o.id === tag.referenzId);
                        return opt ? (
                          <span key={tag.id} className="font-cinzel text-xs px-2 py-0.5"
                            style={{ background: "#1A0A0A", border: "1px solid var(--dnd-red-dark)", color: "var(--dnd-red-light)" }}>
                            @{opt.label}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
