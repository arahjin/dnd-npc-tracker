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

const TAG_ICON: Record<string, string> = { PERSON: "👤", ORGANISATION: "🏛", CHARAKTER: "⚔", SPIELER: "🎲" };

export default function JournalView({ typ, userId, isDM, tagOptions }: Props) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // new entry
  const [titel, setTitel] = useState("");
  const [inhalt, setInhalt] = useState("");
  const [selectedTags, setSelectedTags] = useState<TagOption[]>([]);
  const [tagSearch, setTagSearch] = useState("");
  const [saving, setSaving] = useState(false);

  // filter
  const [filterTag, setFilterTag] = useState<TagOption | null>(null);
  const [filterSearch, setFilterSearch] = useState("");

  // editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitel, setEditTitel] = useState("");
  const [editInhalt, setEditInhalt] = useState("");
  const [editTags, setEditTags] = useState<TagOption[]>([]);
  const [editTagSearch, setEditTagSearch] = useState("");
  const [editSaving, setEditSaving] = useState(false);

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

  function startEdit(entry: Entry) {
    setEditingId(entry.id);
    setEditTitel(entry.titel ?? "");
    setEditInhalt(entry.inhalt);
    setEditTags(
      entry.tags
        .map((t) => tagOptions.find((o) => o.id === t.referenzId))
        .filter((o): o is TagOption => !!o)
    );
    setEditTagSearch("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitel(""); setEditInhalt(""); setEditTags([]); setEditTagSearch("");
  }

  async function handleEdit(e: React.FormEvent, id: string) {
    e.preventDefault();
    if (!editInhalt.trim()) return;
    setEditSaving(true);
    const res = await fetch(`/api/journal/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titel: editTitel,
        inhalt: editInhalt,
        tags: editTags.map((t) => ({ tagTyp: t.typ, referenzId: t.id })),
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setEntries((prev) => prev.map((en) => (en.id === id ? updated : en)));
      cancelEdit();
    }
    setEditSaving(false);
  }

  const filteredTagOptions = tagOptions.filter(
    (t) => t.label.toLowerCase().includes(tagSearch.toLowerCase()) && !selectedTags.find((s) => s.id === t.id)
  );

  const filterTagOptions = tagOptions.filter(
    (t) => t.label.toLowerCase().includes(filterSearch.toLowerCase()) && t.id !== filterTag?.id
  );

  const visibleEntries = filterTag
    ? entries.filter((e) => e.tags.some((t) => t.referenzId === filterTag.id))
    : entries;

  const inputStyle = { background: "#0A0A0A", border: "1px solid #2A2A2A", color: "#D8D0C8", fontFamily: "'Roboto', sans-serif" };

  return (
    <div>
      {/* ── Tag Filter ── */}
      <div className="mb-6 p-4" style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}>
        <div className="flex items-center gap-3">
          <span className="font-cinzel text-xs tracking-widest uppercase shrink-0" style={{ color: "var(--dnd-label)" }}>
            Filter
          </span>
          {filterTag ? (
            <span className="font-cinzel text-xs px-2 py-1 flex items-center gap-2"
              style={{ background: "#1A0A0A", border: "1px solid var(--dnd-red-dark)", color: "var(--dnd-red-light)" }}>
              {TAG_ICON[filterTag.typ]} {filterTag.label}
              <button onClick={() => { setFilterTag(null); setFilterSearch(""); }} style={{ opacity: 0.7 }}>✕</button>
            </span>
          ) : (
            <div className="relative flex-1">
              <input
                type="text"
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                placeholder="Nach Person, Org oder Charakter filtern..."
                className="w-full px-3 py-1.5 text-sm outline-none"
                style={inputStyle}
              />
              {filterSearch && filterTagOptions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-20"
                  style={{ background: "#111", border: "1px solid var(--dnd-border)", maxHeight: "160px", overflowY: "auto" }}>
                  {filterTagOptions.slice(0, 8).map((t) => (
                    <button key={t.id} type="button"
                      onClick={() => { setFilterTag(t); setFilterSearch(""); }}
                      className="w-full text-left px-4 py-2 font-cinzel text-xs"
                      style={{ color: "var(--dnd-text)", borderBottom: "1px solid #1A1A1A" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#1A1A1A")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
                      {TAG_ICON[t.typ]} {t.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {filterTag && (
            <span className="font-cinzel text-xs" style={{ color: "var(--dnd-text-muted)" }}>
              {visibleEntries.length} {visibleEntries.length === 1 ? "Eintrag" : "Einträge"}
            </span>
          )}
        </div>
      </div>

      {/* ── New Entry Button ── */}
      {!showForm && (
        <button onClick={() => setShowForm(true)} className="ddb-cta mb-8">
          + Neuer Eintrag
        </button>
      )}

      {/* ── New Entry Form ── */}
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
                    <span style={{ color: "var(--dnd-text-muted)" }}>{TAG_ICON[t.typ]}</span>{" "}{t.label}
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

      {/* ── Entries ── */}
      {loading ? (
        <p className="font-cinzel text-sm" style={{ color: "var(--dnd-text-muted)" }}>Lade Einträge...</p>
      ) : visibleEntries.length === 0 ? (
        <div className="flex flex-col items-center py-20">
          <p className="text-4xl mb-4">📖</p>
          <p className="font-cinzel text-sm" style={{ color: "var(--dnd-text-muted)" }}>
            {filterTag ? `Keine Einträge mit Tag @${filterTag.label}.` : "Noch keine Einträge."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleEntries.map((entry) => {
            const canEdit = isDM || entry.user.id === userId;
            const isEditing = editingId === entry.id;
            const editFilteredTags = tagOptions.filter(
              (t) => t.label.toLowerCase().includes(editTagSearch.toLowerCase()) && !editTags.find((s) => s.id === t.id)
            );
            return (
              <article key={entry.id} style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}>
                <div style={{ height: "2px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-gold), var(--dnd-red-dark))" }} />

                {isEditing ? (
                  <form onSubmit={(e) => handleEdit(e, entry.id)} className="px-5 py-4 space-y-4">
                    <div>
                      <label className="font-cinzel text-xs tracking-[0.15em] uppercase block mb-2" style={{ color: "var(--dnd-label)" }}>Titel (optional)</label>
                      <input type="text" value={editTitel} onChange={(e) => setEditTitel(e.target.value)}
                        className="w-full px-4 py-2 outline-none" style={inputStyle} />
                    </div>
                    <div>
                      <label className="font-cinzel text-xs tracking-[0.15em] uppercase block mb-2" style={{ color: "var(--dnd-label)" }}>Inhalt *</label>
                      <textarea value={editInhalt} onChange={(e) => setEditInhalt(e.target.value)} rows={6} required
                        className="w-full px-4 py-2 outline-none resize-none" style={inputStyle} />
                    </div>
                    <div>
                      <label className="font-cinzel text-xs tracking-[0.15em] uppercase block mb-2" style={{ color: "var(--dnd-label)" }}>Tags</label>
                      {editTags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {editTags.map((t) => (
                            <span key={t.id} className="font-cinzel text-xs px-2 py-1 flex items-center gap-1"
                              style={{ background: "#1A0A0A", border: "1px solid var(--dnd-red-dark)", color: "var(--dnd-red-light)" }}>
                              @{t.label}
                              <button type="button" onClick={() => setEditTags((p) => p.filter((s) => s.id !== t.id))} style={{ opacity: 0.7 }}>✕</button>
                            </span>
                          ))}
                        </div>
                      )}
                      <input type="text" value={editTagSearch} onChange={(e) => setEditTagSearch(e.target.value)}
                        placeholder="Person, Org oder Charakter suchen..." className="w-full px-4 py-2 outline-none" style={inputStyle} />
                      {editTagSearch && editFilteredTags.length > 0 && (
                        <div style={{ background: "#111", border: "1px solid var(--dnd-border)", maxHeight: "160px", overflowY: "auto" }}>
                          {editFilteredTags.slice(0, 8).map((t) => (
                            <button key={t.id} type="button"
                              onClick={() => { setEditTags((p) => [...p, t]); setEditTagSearch(""); }}
                              className="w-full text-left px-4 py-2 font-cinzel text-xs"
                              style={{ color: "var(--dnd-text)", borderBottom: "1px solid #1A1A1A" }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#1A1A1A")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
                              {TAG_ICON[t.typ]} {t.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" disabled={editSaving} className="ddb-cta">
                        {editSaving ? "SPEICHERN..." : "ÄNDERUNGEN SPEICHERN"}
                      </button>
                      <button type="button" onClick={cancelEdit} className="font-cinzel text-sm px-4 py-2"
                        style={{ border: "1px solid var(--dnd-border)", color: "var(--dnd-text-muted)" }}>ABBRECHEN</button>
                    </div>
                  </form>
                ) : (
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
                      {canEdit && (
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => startEdit(entry)} className="font-cinzel text-xs px-3 py-1"
                            style={{ border: "1px solid var(--dnd-border)", color: "var(--dnd-text-muted)" }}>✎</button>
                          <button onClick={() => handleDelete(entry.id)} className="font-cinzel text-xs px-3 py-1"
                            style={{ border: "1px solid #991B1B", color: "#F87171" }}>✕</button>
                        </div>
                      )}
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap" style={{ color: "var(--dnd-text)", fontFamily: "'Roboto', sans-serif" }}>{entry.inhalt}</p>
                    {entry.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {entry.tags.map((tag) => {
                          const opt = tagOptions.find((o) => o.id === tag.referenzId);
                          return opt ? (
                            <button key={tag.id}
                              onClick={() => { setFilterTag(opt); setFilterSearch(""); }}
                              className="font-cinzel text-xs px-2 py-0.5 transition-opacity hover:opacity-80"
                              style={{ background: "#1A0A0A", border: "1px solid var(--dnd-red-dark)", color: "var(--dnd-red-light)" }}>
                              @{opt.label}
                            </button>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
