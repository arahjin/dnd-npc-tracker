"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { STATUS_OPTIONS, BEZIEHUNG_OPTIONS } from "@/lib/constants";

type NPCData = {
  name: string;
  image: string;
  status: string;
  beziehung: string;
  organisationen: string;
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
  organisationen: "", alter: "", rasse: "", herkunft: "", aktuellePosition: "", notizen: "",
};

export default function NPCForm({ initial, id }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<NPCData>({ ...EMPTY, ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(key: keyof NPCData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
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
      organisationen: form.organisationen.trim() || null,
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
    fontFamily: "'Crimson Text', serif",
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
        <label className={labelStyle} style={{ color: "var(--dnd-red)" }}>Name *</label>
        <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
          placeholder="z.B. Thandrel Nachtschatten" className={inputClass} style={inputStyle} />
      </div>

      {/* Bild */}
      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-red)" }}>Bild (URL)</label>
        <input type="url" value={form.image} onChange={(e) => set("image", e.target.value)}
          placeholder="https://..." className={inputClass} style={inputStyle} />
      </div>

      {/* Status + Beziehung */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-red)" }}>Status</label>
          <select value={form.status} onChange={(e) => set("status", e.target.value)}
            className={inputClass + " font-cinzel text-sm"} style={inputStyle}>
            {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-red)" }}>Beziehung</label>
          <select value={form.beziehung} onChange={(e) => set("beziehung", e.target.value)}
            className={inputClass + " font-cinzel text-sm"} style={inputStyle}>
            {BEZIEHUNG_OPTIONS.map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>
      </div>

      {/* Rasse + Alter */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-red)" }}>Rasse</label>
          <input type="text" value={form.rasse} onChange={(e) => set("rasse", e.target.value)}
            placeholder="z.B. Elf, Mensch, Zwerg..." className={inputClass} style={inputStyle} />
        </div>
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-red)" }}>Alter</label>
          <input type="text" value={form.alter} onChange={(e) => set("alter", e.target.value)}
            placeholder="z.B. 47" className={inputClass} style={inputStyle} />
        </div>
      </div>

      {/* Herkunft */}
      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-red)" }}>Herkunft</label>
        <input type="text" value={form.herkunft} onChange={(e) => set("herkunft", e.target.value)}
          placeholder="Geburtsort oder Heimat" className={inputClass} style={inputStyle} />
      </div>

      {/* Aktuelle Position */}
      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-red)" }}>Aktuelle Position</label>
        <input type="text" value={form.aktuellePosition} onChange={(e) => set("aktuellePosition", e.target.value)}
          placeholder="Wo hält sich der NPC auf?" className={inputClass} style={inputStyle} />
      </div>

      {/* Organisationen */}
      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-red)" }}>Organisationen</label>
        <input type="text" value={form.organisationen} onChange={(e) => set("organisationen", e.target.value)}
          placeholder="Gilden, Fraktionen, Orden..." className={inputClass} style={inputStyle} />
      </div>

      {/* Notizen */}
      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-red)" }}>Notizen</label>
        <textarea value={form.notizen} onChange={(e) => set("notizen", e.target.value)}
          placeholder="Hintergrundgeschichte, Quests, wichtige Infos..."
          rows={6} className={inputClass + " resize-none"} style={inputStyle} />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, var(--dnd-red-dark), transparent)" }} />
        <span style={{ color: "var(--dnd-red)" }}>✦</span>
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
