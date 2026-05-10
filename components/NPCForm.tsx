"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { STATUS_OPTIONS, BEZIEHUNG_OPTIONS, GESCHLECHT_OPTIONS } from "@/lib/constants";
import MentionTextarea from "./MentionTextarea";
import { randomFantasyName } from "@/lib/nameGenerator";

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
  gottheit: string;
  notizen: string;
  sichtbarkeit: string;
  privateNotizen: string;
};

type OrgMembership = { organisationId: string; rolle: string };

type Props = {
  initial?: Partial<NPCData>;
  id?: string;
  availableOrgs?: { id: string; name: string }[];
  initialOrgs?: OrgMembership[];
  availableLocations?: { id: string; name: string }[];
  onSuccess?: () => void;
  onCancel?: () => void;
  canSeePrivate?: boolean;
};

const EMPTY: NPCData = {
  name: "", image: "", status: "Unbekannt", beziehung: "Unbekannt",
  geschlecht: "", region: "",
  alter: "", rasse: "", herkunft: "", aktuellePosition: "", gottheit: "", notizen: "",
  sichtbarkeit: "public", privateNotizen: "",
};

export default function NPCForm({ initial, id, availableOrgs = [], initialOrgs = [], availableLocations = [], onSuccess, onCancel, canSeePrivate = true }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<NPCData>({ ...EMPTY, ...initial });
  const [selectedOrgs, setSelectedOrgs] = useState<OrgMembership[]>(initialOrgs);
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

    const payload: Record<string, unknown> = {
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
      gottheit: form.gottheit.trim() || null,
      notizen: form.notizen.trim() || null,
      sichtbarkeit: form.sichtbarkeit,
      ...(canSeePrivate && { privateNotizen: form.privateNotizen.trim() || null }),
      organisationen: selectedOrgs.filter((o) => o.organisationId),
    };

    const res = id
      ? await fetch(`/api/npcs/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/npcs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

    if (!res.ok) { setError("Fehler beim Speichern."); setSaving(false); return; }
    const npc = await res.json();
    if (id) {
      // Edit mode
      if (onSuccess) { router.refresh(); onSuccess(); }
      else { router.push(`/npc/${npc.id}`); router.refresh(); }
    } else {
      // Create mode — close the modal (if any) then full-navigate to the new NPC
      if (onSuccess) onSuccess();
      window.location.href = `/npc/${npc.id}`;
    }
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
        <div style={{ display: "flex", gap: "8px" }}>
          <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
            placeholder="z.B. Thandrel Nachtschatten" className={inputClass} style={{ ...inputStyle, flex: 1 }} />
          <button
            type="button"
            title="Zufälligen Fantasy-Namen generieren"
            onClick={() => set("name", randomFantasyName(form.geschlecht as "männlich" | "weiblich" | "divers" | ""))}
            className="font-cinzel text-xs px-3 py-2 transition-all shrink-0"
            style={{ background: "#0A0A0A", border: "1px solid #2A2A2A", color: "var(--dnd-gold)" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--dnd-gold)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2A2A2A"; }}
          >
            ⚄ Namen würfeln
          </button>
        </div>
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
            {availableLocations.map((l) => <option key={l.id} value={l.name}>{l.name}</option>)}
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

      {/* Herkunft + Aktuelle Position */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Herkunft</label>
          <select value={form.herkunft} onChange={(e) => set("herkunft", e.target.value)}
            className={inputClass + " font-cinzel text-sm"} style={inputStyle}>
            <option value="">— Wählen —</option>
            {availableLocations.map((l) => <option key={l.id} value={l.name}>{l.name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Aktuelle Position</label>
          <select value={form.aktuellePosition} onChange={(e) => set("aktuellePosition", e.target.value)}
            className={inputClass + " font-cinzel text-sm"} style={inputStyle}>
            <option value="">— Wählen —</option>
            {availableLocations.map((l) => <option key={l.id} value={l.name}>{l.name}</option>)}
          </select>
        </div>
      </div>

      {/* Organisationen */}
      {/* Gottheit */}
      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Gottheit</label>
        <input type="text" value={form.gottheit} onChange={(e) => set("gottheit", e.target.value)}
          placeholder="Verehrte Gottheit(en)" className={inputClass} style={inputStyle} />
      </div>

      {availableOrgs.length > 0 && (
        <div style={{ border: "1px solid #2A2A2A", background: "#0D0D0D" }}>
          <div className="px-4 py-2" style={{ borderBottom: "1px solid #2A2A2A", background: "var(--dnd-red-dark)" }}>
            <span className="font-cinzel text-xs tracking-[0.15em] uppercase" style={{ color: "var(--dnd-heading)" }}>
              Organisationen
            </span>
          </div>
          <div className="p-4 space-y-2">
            {availableOrgs.map((org) => {
              const member = selectedOrgs.find((o) => o.organisationId === org.id);
              const checked = !!member;
              return (
                <div key={org.id} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedOrgs((prev) => [...prev, { organisationId: org.id, rolle: "" }]);
                      } else {
                        setSelectedOrgs((prev) => prev.filter((o) => o.organisationId !== org.id));
                      }
                    }}
                    className="accent-red-700 w-4 h-4 shrink-0 cursor-pointer"
                  />
                  <span className="font-cinzel text-sm shrink-0" style={{ color: checked ? "var(--dnd-heading)" : "var(--dnd-text-muted)" }}>
                    {org.name}
                  </span>
                  {checked && (
                    <input
                      type="text"
                      placeholder="Rolle (optional)"
                      value={member?.rolle ?? ""}
                      onChange={(e) => setSelectedOrgs((prev) =>
                        prev.map((o) => o.organisationId === org.id ? { ...o, rolle: e.target.value } : o)
                      )}
                      className="flex-1 px-3 py-1.5 text-sm outline-none"
                      style={{ background: "#0A0A0A", border: "1px solid #3A2A2A", color: "var(--dnd-text)", fontFamily: "'Roboto', sans-serif" }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Notizen */}
      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>
          Notizen <span className="normal-case tracking-normal font-sans text-xs opacity-50">— @ tippen zum Verknüpfen</span>
        </label>
        <MentionTextarea value={form.notizen} onChange={(v) => set("notizen", v)}
          placeholder={"Hintergrundgeschichte, Quests, wichtige Infos...\n\n@ tippen um NPCs, Orgs oder Charaktere zu verknüpfen"}
          rows={6} className={inputClass + " resize-none"} style={inputStyle} />
      </div>

      {/* Sichtbarkeit */}
      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Sichtbarkeit</label>
        <select value={form.sichtbarkeit} onChange={(e) => setForm(f => ({ ...f, sichtbarkeit: e.target.value }))}
          className={inputClass + " font-cinzel text-sm"} style={inputStyle}>
          <option value="public">Öffentlich – alle Kampagnenmitglieder</option>
          <option value="privat">Privat – nur Ersteller & DM</option>
        </select>
      </div>

      {/* Private Notizen */}
      {canSeePrivate && (
        <div>
          <label className={labelStyle} style={{ color: "#FCA5A5" }}>
            Private Notizen <span className="normal-case tracking-normal font-sans text-xs" style={{ opacity: 0.6 }}>— nur für Ersteller & DM sichtbar</span>
          </label>
          <textarea value={form.privateNotizen} onChange={(e) => setForm(f => ({ ...f, privateNotizen: e.target.value }))}
            placeholder="Geheime Infos, DM-Notizen..." rows={4}
            className={inputClass + " resize-none"}
            style={{ ...inputStyle, border: "1px solid #991B1B", background: "#120808" }} />
        </div>
      )}

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
        <button type="button" onClick={() => onCancel ? onCancel() : router.push(id ? `/npc/${id}` : "/npc")}
          className="font-cinzel text-sm tracking-widest px-6 py-3 transition-all"
          style={{ border: "1px solid var(--dnd-border)", color: "var(--dnd-text-muted)" }}>
          ABBRECHEN
        </button>
      </div>
    </form>
  );
}
