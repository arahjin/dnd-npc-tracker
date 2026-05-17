"use client";

import { useState, useEffect } from "react";
import MentionTextarea from "./MentionTextarea";
import RenderMentions from "./RenderMentions";
import { extractTagsFromText, type MentionOption } from "@/lib/mentions";
import { IconPerson, IconOrganisation, IconSword, IconPin, IconBook } from "@/components/Icons";
import { useTranslations } from "next-intl";

function MentionTypeIcon({ typ }: { typ: string }) {
  const p = { size: 12 };
  if (typ === "PERSON")       return <IconPerson {...p} />;
  if (typ === "ORGANISATION") return <IconOrganisation {...p} />;
  if (typ === "CHARAKTER")    return <IconSword {...p} />;
  if (typ === "LOCATION")     return <IconPin {...p} />;
  return null;
}

type Tag = { id: string; tagTyp: string; referenzId: string };
type Entry = {
  id: string; titel: string | null; inhalt: string; typ: string;
  createdAt: string; user: { id: string; name: string }; tags: Tag[];
};

type Props = {
  typ: "TAGEBUCH" | "GESCHICHTE";
  userId: string;
  isDM: boolean;
  tagOptions: MentionOption[];
};

export default function JournalView({ typ, userId, isDM, tagOptions }: Props) {
  const t = useTranslations("journal");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // new entry
  const [titel, setTitel] = useState("");
  const [inhalt, setInhalt] = useState("");
  const [saving, setSaving] = useState(false);

  // filter
  const [filterTag, setFilterTag] = useState<MentionOption | null>(null);
  const [filterSearch, setFilterSearch] = useState("");

  // editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitel, setEditTitel] = useState("");
  const [editInhalt, setEditInhalt] = useState("");
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
    const tags = extractTagsFromText(inhalt);
    const res = await fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ typ, titel, inhalt, tags }),
    });
    if (res.ok) {
      setTitel(""); setInhalt(""); setShowForm(false);
      await loadEntries();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm(t("deleteConfirm"))) return;
    await fetch(`/api/journal/${id}`, { method: "DELETE" });
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function startEdit(entry: Entry) {
    setEditingId(entry.id);
    setEditTitel(entry.titel ?? "");
    setEditInhalt(entry.inhalt);
  }

  function cancelEdit() {
    setEditingId(null); setEditTitel(""); setEditInhalt("");
  }

  async function handleEdit(e: React.FormEvent, id: string) {
    e.preventDefault();
    if (!editInhalt.trim()) return;
    setEditSaving(true);
    const tags = extractTagsFromText(editInhalt);
    const res = await fetch(`/api/journal/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titel: editTitel, inhalt: editInhalt, tags }),
    });
    if (res.ok) {
      const updated = await res.json();
      setEntries((prev) => prev.map((en) => (en.id === id ? updated : en)));
      cancelEdit();
    }
    setEditSaving(false);
  }

  const filterTagOptions = tagOptions.filter(
    (t) => t.label.toLowerCase().includes(filterSearch.toLowerCase()) && t.id !== filterTag?.id
  );

  const visibleEntries = filterTag
    ? entries.filter((e) => e.tags.some((t) => t.referenzId === filterTag.id))
    : entries;

  const inputStyle = { background: "#0A0A0A", border: "1px solid #2A2A2A", color: "#D8D0C8", fontFamily: "var(--font-roboto), sans-serif" };
  const labelStyle = "font-cinzel text-xs tracking-[0.15em] uppercase block mb-2";

  return (
    <div>
      {/* ── Tag Filter ── */}
      <div className="mb-6 p-4" style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}>
        <div className="flex items-center gap-3">
          <span className="font-cinzel text-xs tracking-widest uppercase shrink-0" style={{ color: "var(--dnd-label)" }}>Filter</span>
          {filterTag ? (
            <span className="font-cinzel text-xs px-2 py-1 flex items-center gap-2"
              style={{ background: "#1A0A0A", border: "1px solid var(--dnd-red-dark)", color: "var(--dnd-red-light)" }}>
              <MentionTypeIcon typ={filterTag.typ} /> {filterTag.label}
              <button onClick={() => { setFilterTag(null); setFilterSearch(""); }} style={{ opacity: 0.7 }}>✕</button>
            </span>
          ) : (
            <div className="relative flex-1">
              <input type="text" value={filterSearch} onChange={(e) => setFilterSearch(e.target.value)}
                placeholder={t("filterPlaceholder")}
                className="w-full px-3 py-1.5 text-sm outline-none" style={inputStyle} />
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
                      <MentionTypeIcon typ={t.typ} /> {t.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {filterTag && (
            <span className="font-cinzel text-xs" style={{ color: "var(--dnd-text-muted)" }}>
              {t("entryCount", { count: visibleEntries.length })}
            </span>
          )}
        </div>
      </div>

      {/* ── New Entry Button ── */}
      {!showForm && (
        <button onClick={() => setShowForm(true)} className="ddb-cta mb-8">{t("newEntry")}</button>
      )}

      {/* ── New Entry Form ── */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-5 space-y-4" style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}>
          <div style={{ height: "2px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-gold), var(--dnd-red-dark))" }} />
          <div>
            <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>{t("titleLabel")}</label>
            <input type="text" value={titel} onChange={(e) => setTitel(e.target.value)}
              placeholder={t("titlePlaceholder")} className="w-full px-4 py-2 outline-none" style={inputStyle} />
          </div>
          <div>
            <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>
              {t("contentLabel")} <span className="normal-case tracking-normal opacity-60">{t("contentMention")}</span>
            </label>
            <MentionTextarea
              value={inhalt} onChange={setInhalt} tagOptions={tagOptions} rows={6} required
              placeholder={t("contentPlaceholder")}
              className="w-full px-4 py-2 outline-none resize-none" style={inputStyle}
            />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="ddb-cta">{saving ? t("saving") : t("saveEntry")}</button>
            <button type="button" onClick={() => setShowForm(false)} className="font-cinzel text-sm px-4 py-2"
              style={{ border: "1px solid var(--dnd-border)", color: "var(--dnd-text-muted)" }}>{t("cancel")}</button>
          </div>
        </form>
      )}

      {/* ── Entries ── */}
      {loading ? (
        <p className="font-cinzel text-sm" style={{ color: "var(--dnd-text-muted)" }}>{t("loading")}</p>
      ) : visibleEntries.length === 0 ? (
        <div className="flex flex-col items-center py-20">
          <div className="mb-4" style={{ opacity: 0.3 }}><IconBook size={52} color="var(--dnd-text-muted)" /></div>
          <p className="font-cinzel text-sm" style={{ color: "var(--dnd-text-muted)" }}>
            {filterTag ? t("emptyFiltered", { name: filterTag.label }) : t("empty")}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleEntries.map((entry) => {
            const canEdit = isDM || entry.user.id === userId;
            const isEditing = editingId === entry.id;
            return (
              <article key={entry.id} style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}>
                <div style={{ height: "2px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-gold), var(--dnd-red-dark))" }} />

                {isEditing ? (
                  <form onSubmit={(e) => handleEdit(e, entry.id)} className="px-5 py-4 space-y-4">
                    <div>
                      <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>{t("titleLabel")}</label>
                      <input type="text" value={editTitel} onChange={(e) => setEditTitel(e.target.value)}
                        className="w-full px-4 py-2 outline-none" style={inputStyle} />
                    </div>
                    <div>
                      <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>
                        {t("contentLabel")} <span className="normal-case tracking-normal opacity-60">{t("contentMention")}</span>
                      </label>
                      <MentionTextarea
                        value={editInhalt} onChange={setEditInhalt} tagOptions={tagOptions} rows={6} required
                        className="w-full px-4 py-2 outline-none resize-none" style={inputStyle}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" disabled={editSaving} className="ddb-cta">
                        {editSaving ? t("saving") : t("saveChanges")}
                      </button>
                      <button type="button" onClick={cancelEdit} className="font-cinzel text-sm px-4 py-2"
                        style={{ border: "1px solid var(--dnd-border)", color: "var(--dnd-text-muted)" }}>{t("cancel")}</button>
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
                    <div className="leading-relaxed" style={{ color: "var(--dnd-text)", fontFamily: "var(--font-roboto), sans-serif" }}>
                      <RenderMentions text={entry.inhalt} />
                    </div>
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
