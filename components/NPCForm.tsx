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
  name: "",
  image: "",
  status: "Unbekannt",
  beziehung: "Unbekannt",
  organisationen: "",
  alter: "",
  rasse: "",
  herkunft: "",
  aktuellePosition: "",
  notizen: "",
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

  const inputClass = "w-full rounded-lg border border-amber-900/50 bg-[#120d06] px-4 py-2.5 text-amber-100 placeholder-amber-900 outline-none focus:border-amber-600 transition-colors";
  const labelClass = "block text-sm font-medium text-amber-600 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg bg-red-900/30 border border-red-800 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label className={labelClass}>Name *</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="z.B. Thandrel Nachtschatten"
          className={inputClass}
        />
      </div>

      {/* Bild */}
      <div>
        <label className={labelClass}>Bild (URL)</label>
        <input
          type="url"
          value={form.image}
          onChange={(e) => set("image", e.target.value)}
          placeholder="https://..."
          className={inputClass}
        />
      </div>

      {/* Status + Beziehung */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Status</label>
          <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputClass}>
            {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Beziehung</label>
          <select value={form.beziehung} onChange={(e) => set("beziehung", e.target.value)} className={inputClass}>
            {BEZIEHUNG_OPTIONS.map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>
      </div>

      {/* Rasse + Alter */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Rasse</label>
          <input type="text" value={form.rasse} onChange={(e) => set("rasse", e.target.value)} placeholder="z.B. Elf, Mensch, Zwerg..." className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Alter</label>
          <input type="text" value={form.alter} onChange={(e) => set("alter", e.target.value)} placeholder="z.B. 47 oder unbekannt" className={inputClass} />
        </div>
      </div>

      {/* Herkunft */}
      <div>
        <label className={labelClass}>Herkunft</label>
        <input type="text" value={form.herkunft} onChange={(e) => set("herkunft", e.target.value)} placeholder="Geburtsort oder Heimat" className={inputClass} />
      </div>

      {/* Aktuelle Position */}
      <div>
        <label className={labelClass}>Aktuelle Position</label>
        <input type="text" value={form.aktuellePosition} onChange={(e) => set("aktuellePosition", e.target.value)} placeholder="Wo hält sich der NPC auf?" className={inputClass} />
      </div>

      {/* Organisationen */}
      <div>
        <label className={labelClass}>Organisationen</label>
        <input type="text" value={form.organisationen} onChange={(e) => set("organisationen", e.target.value)} placeholder="Gilden, Fraktionen, Orden..." className={inputClass} />
      </div>

      {/* Notizen */}
      <div>
        <label className={labelClass}>Notizen</label>
        <textarea
          value={form.notizen}
          onChange={(e) => set("notizen", e.target.value)}
          placeholder="Hintergrundgeschichte, Quests, wichtige Infos..."
          rows={5}
          className={inputClass + " resize-none"}
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-amber-700 px-6 py-2.5 text-sm font-semibold text-amber-100 hover:bg-amber-600 transition-colors disabled:opacity-50"
        >
          {saving ? "Speichern..." : id ? "Änderungen speichern" : "NPC erstellen"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-amber-900/50 px-6 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-900/20 transition-colors"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}
