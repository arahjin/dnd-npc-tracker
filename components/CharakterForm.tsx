"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { STATUS_OPTIONS, BEZIEHUNG_OPTIONS, GESCHLECHT_OPTIONS, REGION_OPTIONS } from "@/lib/constants";
import MentionTextarea from "./MentionTextarea";

type OrgMembership = { organisationId: string; rolle: string };

type CharData = {
  name: string; image: string; status: string; beziehung: string;
  geschlecht: string; region: string; alter: string; rasse: string;
  herkunft: string; aktuellePosition: string; gottheit: string; notizen: string;
};

type Props = {
  initial?: Partial<CharData>;
  id?: string;
  availableOrgs?: { id: string; name: string }[];
  initialOrgs?: OrgMembership[];
  onSuccess?: () => void;
};

const EMPTY: CharData = {
  name: "", image: "", status: "Lebendig", beziehung: "Neutral",
  geschlecht: "", region: "", alter: "", rasse: "", herkunft: "",
  aktuellePosition: "", gottheit: "", notizen: "",
};

export default function CharakterForm({ initial, id, availableOrgs = [], initialOrgs = [], onSuccess }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<CharData>({ ...EMPTY, ...initial });
  const [selectedOrgs, setSelectedOrgs] = useState<OrgMembership[]>(initialOrgs);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(key: keyof CharData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name ist erforderlich."); return; }
    setSaving(true); setError("");

    const payload: Record<string, unknown> = {
      name: form.name.trim(),
      image: form.image.trim() || null,
      status: form.status, beziehung: form.beziehung,
      geschlecht: form.geschlecht || null, region: form.region || null,
      alter: form.alter.trim() || null, rasse: form.rasse.trim() || null,
      herkunft: form.herkunft.trim() || null,
      aktuellePosition: form.aktuellePosition.trim() || null,
      gottheit: form.gottheit.trim() || null,
      notizen: form.notizen.trim() || null,
      organisationen: selectedOrgs.filter((o) => o.organisationId),
    };

    const res = id
      ? await fetch(`/api/charaktere/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/charaktere", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

    if (!res.ok) { setError("Fehler beim Speichern."); setSaving(false); return; }
    const c = await res.json();
    if (id && onSuccess) { router.refresh(); onSuccess(); }
    else { router.push(`/charaktere/${c.id}`); router.refresh(); }
  }

  const inputClass = "w-full px-4 py-2.5 text-base outline-none transition-colors";
  const inputStyle = { background: "#0A0A0A", border: "1px solid #2A2A2A", color: "var(--dnd-text)", fontFamily: "'Roboto', sans-serif" };
  const labelStyle = "font-cinzel text-xs tracking-[0.15em] uppercase block mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="font-cinzel text-sm px-4 py-3" style={{ background: "#200D0D", border: "1px solid #991B1B", color: "#F87171" }}>{error}</div>
      )}

      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Name *</label>
        <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
          placeholder="Charaktername" className={inputClass} style={inputStyle} />
      </div>

      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Bild-URL (optional)</label>
        <input type="url" value={form.image} onChange={(e) => set("image", e.target.value)}
          placeholder="https://..." className={inputClass} style={inputStyle} />
        {form.image && (
          <div className="mt-2 relative w-20 h-20 overflow-hidden" style={{ border: "1px solid var(--dnd-border)" }}>
            <Image src={form.image} alt="Vorschau" fill className="object-cover" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Status</label>
          <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputClass + " font-cinzel text-sm"} style={inputStyle}>
            {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Beziehung</label>
          <select value={form.beziehung} onChange={(e) => set("beziehung", e.target.value)} className={inputClass + " font-cinzel text-sm"} style={inputStyle}>
            {BEZIEHUNG_OPTIONS.map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Geschlecht</label>
          <select value={form.geschlecht} onChange={(e) => set("geschlecht", e.target.value)} className={inputClass + " font-cinzel text-sm"} style={inputStyle}>
            <option value="">— Wählen —</option>
            {GESCHLECHT_OPTIONS.map((g) => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Region</label>
          <select value={form.region} onChange={(e) => set("region", e.target.value)} className={inputClass + " font-cinzel text-sm"} style={inputStyle}>
            <option value="">— Wählen —</option>
            {REGION_OPTIONS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Rasse</label>
          <input type="text" value={form.rasse} onChange={(e) => set("rasse", e.target.value)} placeholder="z.B. Elf, Mensch..." className={inputClass} style={inputStyle} />
        </div>
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Alter</label>
          <input type="text" value={form.alter} onChange={(e) => set("alter", e.target.value)} className={inputClass} style={inputStyle} />
        </div>
      </div>

      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Herkunft</label>
        <input type="text" value={form.herkunft} onChange={(e) => set("herkunft", e.target.value)} className={inputClass} style={inputStyle} />
      </div>

      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Aktuelle Position</label>
        <input type="text" value={form.aktuellePosition} onChange={(e) => set("aktuellePosition", e.target.value)} className={inputClass} style={inputStyle} />
      </div>

      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Gottheit</label>
        <input type="text" value={form.gottheit} onChange={(e) => set("gottheit", e.target.value)}
          placeholder="Verehrte Gottheit(en)" className={inputClass} style={inputStyle} />
      </div>

      {availableOrgs.length > 0 && (
        <div style={{ border: "1px solid #2A2A2A", background: "#0D0D0D" }}>
          <div className="px-4 py-2" style={{ borderBottom: "1px solid #2A2A2A", background: "var(--dnd-red-dark)" }}>
            <span className="font-cinzel text-xs tracking-[0.15em] uppercase" style={{ color: "var(--dnd-heading)" }}>Organisationen</span>
          </div>
          <div className="p-4 space-y-2">
            {availableOrgs.map((org) => {
              const member = selectedOrgs.find((o) => o.organisationId === org.id);
              const checked = !!member;
              return (
                <div key={org.id}>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={checked} className="accent-red-700 w-4 h-4"
                      onChange={(e) => {
                        if (e.target.checked) setSelectedOrgs((p) => [...p, { organisationId: org.id, rolle: "" }]);
                        else setSelectedOrgs((p) => p.filter((o) => o.organisationId !== org.id));
                      }} />
                    <span className="font-cinzel text-sm" style={{ color: checked ? "var(--dnd-heading)" : "var(--dnd-text-muted)" }}>{org.name}</span>
                  </label>
                  {checked && (
                    <input type="text" placeholder="Rolle (optional)" value={member?.rolle ?? ""}
                      onChange={(e) => setSelectedOrgs((p) => p.map((o) => o.organisationId === org.id ? { ...o, rolle: e.target.value } : o))}
                      className="mt-1 ml-7 px-3 py-1.5 text-sm outline-none w-64"
                      style={{ background: "#0A0A0A", border: "1px solid #3A2A2A", color: "var(--dnd-text)", fontFamily: "'Roboto', sans-serif" }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>
          Notizen <span className="normal-case tracking-normal font-sans text-xs opacity-50">— @ tippen zum Verknüpfen</span>
        </label>
        <MentionTextarea value={form.notizen} onChange={(v) => set("notizen", v)}
          rows={6} className={inputClass + " resize-none"} style={inputStyle}
          placeholder="@ tippen um NPCs, Orgs oder Charaktere zu verknüpfen" />
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, var(--dnd-red-dark), transparent)" }} />
        <span style={{ color: "var(--dnd-label)" }}>✦</span>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="ddb-cta py-3 px-8">
          {saving ? "SPEICHERN..." : id ? "ÄNDERUNGEN SPEICHERN" : "CHARAKTER ERSTELLEN"}
        </button>
        <button type="button" onClick={() => router.back()} className="font-cinzel text-sm tracking-widest px-6 py-3 transition-all"
          style={{ border: "1px solid var(--dnd-border)", color: "var(--dnd-text-muted)" }}>
          ABBRECHEN
        </button>
      </div>
    </form>
  );
}
