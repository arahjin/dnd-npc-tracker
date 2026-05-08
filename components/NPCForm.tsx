"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { STATUS_OPTIONS, BEZIEHUNG_OPTIONS, GESCHLECHT_OPTIONS, REGION_OPTIONS } from "@/lib/constants";

type NPCData = {
  name: string;
  image: string;
  status: string;
  beziehung: string;
  geschlecht: string;
  region: string;
  alter: string;
  rasse: string;
  herkunft: string;
  aktuellePosition: string;
  notizen: string;
};

type Props = {
  initial?: Partial<NPCData>;
  id?: string;
};

const EMPTY: NPCData = {
  name: "", image: "", status: "Unbekannt", beziehung: "Unbekannt",
  geschlecht: "", region: "",
  alter: "", rasse: "", herkunft: "", aktuellePosition: "", notizen: "",
};

export default function NPCForm({ initial, id }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<NPCData>({ ...EMPTY, ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Image generator state
  const [imagePrompt, setImagePrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState("");
  const [genError, setGenError] = useState("");

  function set(key: keyof NPCData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleGenerate() {
    if (!imagePrompt.trim()) return;
    setGenerating(true);
    setGenError("");
    setGeneratedImage("");

    const res = await fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: imagePrompt }),
    });

    const data = await res.json();
    if (!res.ok) {
      setGenError(data.error ?? "Fehler beim Generieren. Bitte erneut versuchen.");
      setGenerating(false);
      return;
    }

    setGeneratedImage(data.url);
    setGenerating(false);
  }

  function acceptGeneratedImage() {
    set("image", generatedImage);
    setGeneratedImage("");
    setImagePrompt("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name ist erforderlich."); return; }
    setSaving(true);
    setError("");

    const payload = {
      name: form.name.trim(),
      image: form.image.trim() || null,
      status: form.status,
      beziehung: form.beziehung,
      geschlecht: form.geschlecht || null,
      region: form.region || null,
      alter: form.alter.trim() || null,
      rasse: form.rasse.trim() || null,
      herkunft: form.herkunft.trim() || null,
      aktuellePosition: form.aktuellePosition.trim() || null,
      notizen: form.notizen.trim() || null,
    };

    const res = id
      ? await fetch(`/api/npcs/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/npcs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

    if (!res.ok) { setError("Fehler beim Speichern."); setSaving(false); return; }
    const npc = await res.json();
    router.push(`/npc/${npc.id}`);
    router.refresh();
  }

  const inputClass = "w-full px-4 py-2.5 text-base outline-none transition-colors";
  const inputStyle = {
    background: "#0A0A0A",
    border: "1px solid #2A2A2A",
    color: "var(--dnd-text)",
    fontFamily: "'Roboto', sans-serif",
  };
  const labelStyle = "font-cinzel text-xs tracking-[0.15em] uppercase block mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="font-cinzel text-sm px-4 py-3 tracking-wide"
          style={{ background: "#200D0D", border: "1px solid #991B1B", color: "#F87171" }}>
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Name *</label>
        <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
          placeholder="z.B. Thandrel Nachtschatten" className={inputClass} style={inputStyle} />
      </div>

      {/* Bild + Generator */}
      <div style={{ border: "1px solid #2A2A2A", background: "#0D0D0D" }}>
        {/* Section Header */}
        <div className="px-4 py-2 flex items-center gap-2" style={{ borderBottom: "1px solid #2A2A2A", background: "var(--dnd-red-dark)" }}>
          <span className="font-cinzel text-xs tracking-[0.15em] uppercase" style={{ color: "var(--dnd-heading)" }}>
            Charakterbild
          </span>
        </div>

        <div className="p-4 space-y-4">
          {/* Manual URL */}
          <div>
            <label className={labelStyle} style={{ color: "var(--dnd-text-muted)" }}>Bild-URL (optional)</label>
            <input type="url" value={form.image} onChange={(e) => set("image", e.target.value)}
              placeholder="https://..." className={inputClass} style={inputStyle} />
          </div>

          {/* Current image preview */}
          {form.image && (
            <div className="relative w-32 h-32 overflow-hidden" style={{ border: "1px solid var(--dnd-border)" }}>
              <Image src={form.image} alt="Vorschau" fill className="object-cover" />
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: "#2A2A2A" }} />
            <span className="font-cinzel text-xs" style={{ color: "var(--dnd-text-muted)" }}>oder mit KI generieren</span>
            <div className="h-px flex-1" style={{ background: "#2A2A2A" }} />
          </div>

          {/* AI Generator */}
          <div>
            <label className={labelStyle} style={{ color: "var(--dnd-text-muted)" }}>Beschreibung für DALL-E 3</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleGenerate())}
                placeholder="z.B. Elven rogue, dark hood, scarred face, mysterious"
                className={inputClass + " flex-1"}
                style={inputStyle}
              />
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating || !imagePrompt.trim()}
                className="font-cinzel text-xs tracking-widest px-4 py-2.5 transition-all disabled:opacity-40 shrink-0"
                style={{ background: "var(--dnd-gold)", color: "#0A0A0A", border: "1px solid #A07830" }}
              >
                {generating ? "..." : "GENERIEREN"}
              </button>
            </div>
            {generating && (
              <p className="mt-2 font-cinzel text-xs tracking-wide" style={{ color: "var(--dnd-gold)" }}>
                ✦ DALL-E 3 zeichnet deinen Charakter... (ca. 10 Sekunden)
              </p>
            )}
            {genError && (
              <p className="mt-2 text-xs" style={{ color: "#F87171" }}>{genError}</p>
            )}
          </div>

          {/* Generated Image Preview */}
          {generatedImage && (
            <div className="space-y-3">
              <div className="relative w-full aspect-square overflow-hidden" style={{ border: "1px solid var(--dnd-gold)", maxWidth: "300px" }}>
                <Image src={generatedImage} alt="Generiertes Bild" fill className="object-cover" />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={acceptGeneratedImage}
                  className="font-cinzel text-xs tracking-widest px-4 py-2 transition-all"
                  style={{ background: "var(--dnd-red)", color: "#F5EDD6", border: "1px solid var(--dnd-red-dark)" }}>
                  ✓ ÜBERNEHMEN
                </button>
                <button type="button" onClick={handleGenerate}
                  className="font-cinzel text-xs tracking-widest px-4 py-2 transition-all"
                  style={{ border: "1px solid #2A2A2A", color: "var(--dnd-text-muted)" }}>
                  ↺ NEU GENERIEREN
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status + Beziehung */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Status</label>
          <select value={form.status} onChange={(e) => set("status", e.target.value)}
            className={inputClass + " font-cinzel text-sm"} style={inputStyle}>
            {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Beziehung</label>
          <select value={form.beziehung} onChange={(e) => set("beziehung", e.target.value)}
            className={inputClass + " font-cinzel text-sm"} style={inputStyle}>
            {BEZIEHUNG_OPTIONS.map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>
      </div>

      {/* Geschlecht + Region */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Geschlecht</label>
          <select value={form.geschlecht} onChange={(e) => set("geschlecht", e.target.value)}
            className={inputClass + " font-cinzel text-sm"} style={inputStyle}>
            <option value="">— Wählen —</option>
            {GESCHLECHT_OPTIONS.map((g) => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Region</label>
          <select value={form.region} onChange={(e) => set("region", e.target.value)}
            className={inputClass + " font-cinzel text-sm"} style={inputStyle}>
            <option value="">— Wählen —</option>
            {REGION_OPTIONS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* Rasse + Alter */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Rasse</label>
          <input type="text" value={form.rasse} onChange={(e) => set("rasse", e.target.value)}
            placeholder="z.B. Elf, Mensch, Zwerg..." className={inputClass} style={inputStyle} />
        </div>
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Alter</label>
          <input type="text" value={form.alter} onChange={(e) => set("alter", e.target.value)}
            placeholder="z.B. 47" className={inputClass} style={inputStyle} />
        </div>
      </div>

      {/* Herkunft */}
      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Herkunft</label>
        <input type="text" value={form.herkunft} onChange={(e) => set("herkunft", e.target.value)}
          placeholder="Geburtsort oder Heimat" className={inputClass} style={inputStyle} />
      </div>

      {/* Aktuelle Position */}
      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Aktuelle Position</label>
        <input type="text" value={form.aktuellePosition} onChange={(e) => set("aktuellePosition", e.target.value)}
          placeholder="Wo hält sich der NPC auf?" className={inputClass} style={inputStyle} />
      </div>

      {/* Notizen */}
      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Notizen</label>
        <textarea value={form.notizen} onChange={(e) => set("notizen", e.target.value)}
          placeholder="Hintergrundgeschichte, Quests, wichtige Infos..."
          rows={6} className={inputClass + " resize-none"} style={inputStyle} />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, var(--dnd-red-dark), transparent)" }} />
        <span style={{ color: "var(--dnd-label)" }}>✦</span>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button type="submit" disabled={saving}
          className="font-cinzel text-sm tracking-widest px-8 py-3 transition-all disabled:opacity-50"
          style={{ background: "var(--dnd-red)", color: "#F5EDD6", border: "1px solid var(--dnd-red-dark)" }}>
          {saving ? "SPEICHERN..." : id ? "ÄNDERUNGEN SPEICHERN" : "NPC ERSTELLEN"}
        </button>
        <button type="button" onClick={() => router.back()}
          className="font-cinzel text-sm tracking-widest px-6 py-3 transition-all"
          style={{ border: "1px solid var(--dnd-border)", color: "var(--dnd-text-muted)" }}>
          ABBRECHEN
        </button>
      </div>
    </form>
  );
}
