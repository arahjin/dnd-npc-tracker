"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ALIGNMENT_OPTIONS, ORGANISATION_TYP_OPTIONS } from "@/lib/constants";
import MentionTextarea from "./MentionTextarea";

type OrgData = {
  name: string;
  beschreibung: string;
  typ: string;
  region: string;
  alignment: string;
  beziehungZurGruppe: string;
  gottheit: string;
};

const EMPTY: OrgData = {
  name: "", beschreibung: "", typ: "", region: "", alignment: "", beziehungZurGruppe: "", gottheit: "",
};

export default function OrgForm({ initial, id, availableLocations = [] }: { initial?: Partial<OrgData>; id?: string; availableLocations?: { id: string; name: string }[] }) {
  const router = useRouter();
  const [form, setForm] = useState<OrgData>({ ...EMPTY, ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(key: keyof OrgData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name ist erforderlich."); return; }
    setSaving(true);
    setError("");
    const payload = {
      name: form.name.trim(),
      beschreibung: form.beschreibung.trim() || null,
      typ: form.typ || null,
      region: form.region || null,
      alignment: form.alignment || null,
      beziehungZurGruppe: form.beziehungZurGruppe.trim() || null,
      gottheit: form.gottheit.trim() || null,
    };
    const res = id
      ? await fetch(`/api/organisationen/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/organisationen", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) { setError("Fehler beim Speichern."); setSaving(false); return; }
    const org = await res.json();
    window.location.href = `/organisationen/${org.id}`;
  }

  const inputClass = "w-full px-4 py-2.5 text-base outline-none transition-colors";
  const inputStyle = { background: "#FFFFFF", border: "1px solid #C8C4BC", color: "var(--dnd-text)", fontFamily: "'Roboto', sans-serif" };
  const labelStyle = "font-cinzel text-xs tracking-[0.15em] uppercase block mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="font-cinzel text-sm px-4 py-3" style={{ background: "#200D0D", border: "1px solid #991B1B", color: "#F87171" }}>{error}</div>}

      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Name *</label>
        <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="z.B. Die Scharlachroten Klingen" className={inputClass} style={inputStyle} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Typ</label>
          <select value={form.typ} onChange={(e) => set("typ", e.target.value)} className={inputClass + " font-cinzel text-sm"} style={inputStyle}>
            <option value="">— Wählen —</option>
            {ORGANISATION_TYP_OPTIONS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Region</label>
          <select value={form.region} onChange={(e) => set("region", e.target.value)} className={inputClass + " font-cinzel text-sm"} style={inputStyle}>
            <option value="">— Wählen —</option>
            {availableLocations.map((l) => <option key={l.id} value={l.name}>{l.name}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Alignment</label>
        <select value={form.alignment} onChange={(e) => set("alignment", e.target.value)} className={inputClass + " font-cinzel text-sm"} style={inputStyle}>
          <option value="">— Wählen —</option>
          {ALIGNMENT_OPTIONS.map((a) => <option key={a}>{a}</option>)}
        </select>
      </div>

      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Beziehung zur Gruppe</label>
        <textarea value={form.beziehungZurGruppe} onChange={(e) => set("beziehungZurGruppe", e.target.value)}
          placeholder="Wie verhält sich die Organisation zur Spielergruppe?" rows={3} className={inputClass + " resize-none"} style={inputStyle} />
      </div>

      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Gottheit</label>
        <input type="text" value={form.gottheit} onChange={(e) => set("gottheit", e.target.value)}
          placeholder="Verehrte oder schützende Gottheit(en)" className={inputClass} style={inputStyle} />
      </div>

      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>
          Beschreibung <span className="normal-case tracking-normal font-sans text-xs opacity-50">— @ tippen zum Verknüpfen</span>
        </label>
        <MentionTextarea value={form.beschreibung} onChange={(v) => set("beschreibung", v)}
          placeholder={"Geschichte, Ziele, Aktivitäten...\n\n@ tippen um NPCs, Orgs, Chars oder Locations zu verknüpfen"}
          rows={5} className={inputClass + " resize-none"} style={inputStyle} />
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, var(--dnd-red-dark), transparent)" }} />
        <span style={{ color: "var(--dnd-red)" }}>✦</span>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="font-cinzel text-sm tracking-widest px-8 py-3 transition-all disabled:opacity-50"
          style={{ background: "var(--dnd-red)", color: "#FFFFFF", border: "1px solid var(--dnd-red-dark)" }}>
          {saving ? "SPEICHERN..." : id ? "ÄNDERUNGEN SPEICHERN" : "ORGANISATION ERSTELLEN"}
        </button>
        <button type="button" onClick={() => router.back()} className="font-cinzel text-sm tracking-widest px-6 py-3 transition-all"
          style={{ border: "1px solid var(--dnd-border)", color: "var(--dnd-text-muted)" }}>
          ABBRECHEN
        </button>
      </div>
    </form>
  );
}
