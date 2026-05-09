"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ART_OPTIONS = ["Land", "Region", "Stadt", "Dorf", "Besonderer Ort", "Wald", "Gewässer"];

type LinkedItem = { id: string; name: string };

type Props = {
  id?: string;
  initial?: {
    name?: string; art?: string; land?: string; region?: string;
    population?: number | null; klima?: string; floraFauna?: string; wissenswertes?: string;
  };
  initialNpcIds?: string[];
  initialOrgIds?: string[];
  initialCharIds?: string[];
  availableNpcs?: LinkedItem[];
  availableOrgs?: LinkedItem[];
  availableChars?: LinkedItem[];
};

const inputStyle: React.CSSProperties = {
  background: "#0A0A0A", border: "1px solid #2A2A2A",
  color: "var(--dnd-text)", fontFamily: "'Roboto', sans-serif",
};
const labelStyle = "font-cinzel text-xs tracking-[0.15em] uppercase block mb-2";

function MultiSelect({
  label, items, selected, onToggle, searchPlaceholder,
}: {
  label: string;
  items: LinkedItem[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  searchPlaceholder: string;
}) {
  const [search, setSearch] = useState("");
  const filtered = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <p className={labelStyle} style={{ color: "var(--dnd-label)" }}>{label}</p>
      {items.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--dnd-text-muted)" }}>Keine verfügbar</p>
      ) : (
        <div style={{ border: "1px solid #2A2A2A", background: "#0A0A0A" }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full px-3 py-2 text-sm outline-none"
            style={{ ...inputStyle, borderBottom: "1px solid #2A2A2A" }}
          />
          <div className="max-h-40 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm" style={{ color: "var(--dnd-text-muted)" }}>Keine Treffer</p>
            ) : (
              filtered.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 px-3 py-2 cursor-pointer"
                  style={{
                    borderBottom: "1px solid #1A1A1A",
                    background: selected.has(item.id) ? "rgba(163,32,32,0.12)" : "transparent",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(item.id)}
                    onChange={() => onToggle(item.id)}
                    className="accent-red-700"
                  />
                  <span className="font-cinzel text-sm" style={{ color: selected.has(item.id) ? "var(--dnd-heading)" : "var(--dnd-text)" }}>
                    {item.name}
                  </span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LocationForm({
  id,
  initial = {},
  initialNpcIds = [],
  initialOrgIds = [],
  initialCharIds = [],
  availableNpcs = [],
  availableOrgs = [],
  availableChars = [],
}: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial.name ?? "");
  const [art, setArt] = useState(initial.art ?? "");
  const [land, setLand] = useState(initial.land ?? "");
  const [region, setRegion] = useState(initial.region ?? "");
  const [population, setPopulation] = useState(initial.population != null ? String(initial.population) : "");
  const [klima, setKlima] = useState(initial.klima ?? "");
  const [floraFauna, setFloraFauna] = useState(initial.floraFauna ?? "");
  const [wissenswertes, setWissenswertes] = useState(initial.wissenswertes ?? "");

  const [npcIds, setNpcIds] = useState<Set<string>>(new Set(initialNpcIds));
  const [orgIds, setOrgIds] = useState<Set<string>>(new Set(initialOrgIds));
  const [charIds, setCharIds] = useState<Set<string>>(new Set(initialCharIds));

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function toggle(set: Set<string>, setFn: (s: Set<string>) => void, id: string) {
    const next = new Set(set);
    next.has(id) ? next.delete(id) : next.add(id);
    setFn(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Name ist erforderlich."); return; }
    setSaving(true);
    setError("");

    const body = {
      name, art, land, region,
      population: population !== "" ? Number(population) : null,
      klima, floraFauna, wissenswertes,
      npcIds: [...npcIds],
      orgIds: [...orgIds],
      charakterIds: [...charIds],
    };

    const url = id ? `/api/locations/${id}` : "/api/locations";
    const method = id ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Fehler beim Speichern.");
      setSaving(false);
      return;
    }

    const result = await res.json();
    router.push(`/locations/${id ?? result.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="font-cinzel text-sm px-4 py-3"
          style={{ background: "#200D0D", border: "1px solid #991B1B", color: "#F87171" }}>
          ✗ {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Name *</label>
        <input
          type="text" value={name} onChange={(e) => setName(e.target.value)}
          placeholder="z.B. Silberstadt" autoFocus
          className="w-full px-4 py-2.5 text-base outline-none"
          style={inputStyle}
        />
      </div>

      {/* Art */}
      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Art</label>
        <select
          value={art} onChange={(e) => setArt(e.target.value)}
          className="w-full px-4 py-2.5 text-sm outline-none"
          style={inputStyle}
        >
          <option value="">– Art wählen –</option>
          {ART_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      {/* Land + Region row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Land</label>
          <input
            type="text" value={land} onChange={(e) => setLand(e.target.value)}
            placeholder="z.B. Königreich Valoria"
            className="w-full px-4 py-2.5 text-sm outline-none"
            style={inputStyle}
          />
        </div>
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Region</label>
          <input
            type="text" value={region} onChange={(e) => setRegion(e.target.value)}
            placeholder="z.B. Nordmark"
            className="w-full px-4 py-2.5 text-sm outline-none"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Population */}
      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Population</label>
        <input
          type="number" value={population} onChange={(e) => setPopulation(e.target.value)}
          placeholder="z.B. 5000" min={0}
          className="w-full px-4 py-2.5 text-sm outline-none"
          style={inputStyle}
        />
      </div>

      {/* Klima */}
      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Klima</label>
        <input
          type="text" value={klima} onChange={(e) => setKlima(e.target.value)}
          placeholder="z.B. Gemäßigt, feucht"
          className="w-full px-4 py-2.5 text-sm outline-none"
          style={inputStyle}
        />
      </div>

      {/* Flora & Fauna */}
      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Flora & Fauna</label>
        <textarea
          value={floraFauna} onChange={(e) => setFloraFauna(e.target.value)}
          rows={3} placeholder="Typische Pflanzen und Tiere..."
          className="w-full px-4 py-2.5 text-sm outline-none resize-none"
          style={inputStyle}
        />
      </div>

      {/* Wissenswertes */}
      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Wissenswertes</label>
        <textarea
          value={wissenswertes} onChange={(e) => setWissenswertes(e.target.value)}
          rows={6} placeholder="Geschichte, Besonderheiten, Geheimnisse..."
          className="w-full px-4 py-2.5 text-sm outline-none resize-none"
          style={inputStyle}
        />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 pt-2">
        <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, var(--dnd-red), transparent)" }} />
        <span className="font-cinzel text-xs tracking-widest" style={{ color: "var(--dnd-label)" }}>VERKNÜPFUNGEN</span>
        <div className="h-px flex-1" style={{ background: "linear-gradient(270deg, var(--dnd-red), transparent)" }} />
      </div>

      {/* Multi-selects */}
      <MultiSelect
        label="NPCs"
        items={availableNpcs}
        selected={npcIds}
        onToggle={(id) => toggle(npcIds, setNpcIds, id)}
        searchPlaceholder="NPC suchen..."
      />
      <MultiSelect
        label="Organisationen"
        items={availableOrgs}
        selected={orgIds}
        onToggle={(id) => toggle(orgIds, setOrgIds, id)}
        searchPlaceholder="Organisation suchen..."
      />
      <MultiSelect
        label="Charaktere"
        items={availableChars}
        selected={charIds}
        onToggle={(id) => toggle(charIds, setCharIds, id)}
        searchPlaceholder="Charakter suchen..."
      />

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="ddb-cta py-3 px-8">
          {saving ? "SPEICHERN..." : id ? "ÄNDERUNGEN SPEICHERN" : "LOCATION ERSTELLEN"}
        </button>
        <button
          type="button" onClick={() => router.back()}
          className="font-cinzel text-sm tracking-widest px-6 py-3"
          style={{ border: "1px solid var(--dnd-border)", color: "var(--dnd-text-muted)" }}>
          ABBRECHEN
        </button>
      </div>
    </form>
  );
}
