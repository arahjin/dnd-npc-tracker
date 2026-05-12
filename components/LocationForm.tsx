"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import MentionTextarea from "./MentionTextarea";
import ImageGeneratorField from "./ImageGeneratorField";

const ART_OPTIONS = ["Kontinent", "Land", "Region", "Stadt", "Dorf", "Besonderer Ort", "Wald", "Gewässer", "Insel"];

type LinkedItem = { id: string; name: string };

type Props = {
  id?: string;
  initial?: {
    name?: string; image?: string; art?: string; land?: string; region?: string;
    population?: number | null; klima?: string; floraFauna?: string; wissenswertes?: string;
    sichtbarkeit?: string; privateNotizen?: string;
  };
  initialNpcIds?: string[];
  initialOrgIds?: string[];
  initialCharIds?: string[];
  availableNpcs?: LinkedItem[];
  availableOrgs?: LinkedItem[];
  availableChars?: LinkedItem[];
  canSeePrivate?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const inputStyle: React.CSSProperties = {
  background: "#0A0A0A", border: "1px solid #2A2A2A",
  color: "var(--dnd-text)", fontFamily: "var(--font-roboto), sans-serif",
};
const labelStyle = "font-cinzel text-xs tracking-[0.15em] uppercase block mb-2";

// ── Dropdown Multi-Select ────────────────────────────────────────────────────

function MultiSelect({
  label,
  items,
  selected,
  onToggle,
  placeholder,
}: {
  label: string;
  items: LinkedItem[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selectedItems = items.filter((i) => selected.has(i.id));
  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <p className={labelStyle} style={{ color: "var(--dnd-label)" }}>{label}</p>

      {/* Trigger: shows tags + opens dropdown */}
      <div
        onClick={() => { setOpen((o) => !o); }}
        style={{
          cursor: "pointer",
          border: "1px solid #2A2A2A",
          background: "#0A0A0A",
          minHeight: "42px",
          padding: "6px 10px",
          display: "flex",
          flexWrap: "wrap",
          gap: "4px",
          alignItems: "center",
          userSelect: "none",
        }}
      >
        {selectedItems.length === 0 ? (
          <span style={{ color: "var(--dnd-text-muted)", fontSize: "0.875rem", flex: 1 }}>
            {placeholder}
          </span>
        ) : (
          selectedItems.map((item) => (
            <span
              key={item.id}
              className="font-cinzel"
              style={{
                background: "rgba(163,32,32,0.18)",
                border: "1px solid var(--dnd-red)",
                color: "var(--dnd-heading)",
                fontSize: "0.7rem",
                letterSpacing: "0.06em",
                padding: "2px 4px 2px 8px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              {item.name}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onToggle(item.id); }}
                style={{
                  color: "var(--dnd-red-light)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  lineHeight: 1,
                  padding: "0 2px",
                  fontSize: "0.9rem",
                }}
              >
                ×
              </button>
            </span>
          ))
        )}
        <span style={{ marginLeft: "auto", color: "var(--dnd-text-muted)", fontSize: "0.75rem", paddingLeft: "4px" }}>
          {open ? "▴" : "▾"}
        </span>
      </div>

      {/* Dropdown panel */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 2px)",
            left: 0,
            right: 0,
            zIndex: 100,
            background: "#0E0E0E",
            border: "1px solid #2A2A2A",
            boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
            maxHeight: "220px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Search inside dropdown */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Suchen…"
            autoFocus
            onClick={(e) => e.stopPropagation()}
            className="text-sm outline-none"
            style={{
              ...inputStyle,
              border: "none",
              borderBottom: "1px solid #2A2A2A",
              padding: "8px 12px",
              flexShrink: 0,
            }}
          />

          {/* Options list */}
          <div style={{ overflowY: "auto" }}>
            {items.length === 0 ? (
              <p className="px-3 py-2 text-sm" style={{ color: "var(--dnd-text-muted)" }}>
                Keine verfügbar
              </p>
            ) : filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm" style={{ color: "var(--dnd-text-muted)" }}>
                Keine Treffer
              </p>
            ) : (
              filtered.map((item) => {
                const isSelected = selected.has(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={(e) => { e.stopPropagation(); onToggle(item.id); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "9px 12px",
                      cursor: "pointer",
                      borderBottom: "1px solid #181818",
                      background: isSelected ? "rgba(163,32,32,0.12)" : "transparent",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background = isSelected ? "rgba(163,32,32,0.12)" : "transparent";
                    }}
                  >
                    {/* Checkmark indicator */}
                    <span style={{
                      width: 14, height: 14, flexShrink: 0,
                      border: isSelected ? "1px solid var(--dnd-red)" : "1px solid #444",
                      background: isSelected ? "var(--dnd-red)" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {isSelected && (
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                          <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span
                      className="font-cinzel text-sm"
                      style={{ color: isSelected ? "var(--dnd-heading)" : "var(--dnd-text)" }}
                    >
                      {item.name}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Form ────────────────────────────────────────────────────────────────

export default function LocationForm({
  id,
  initial = {},
  initialNpcIds = [],
  initialOrgIds = [],
  initialCharIds = [],
  availableNpcs = [],
  availableOrgs = [],
  availableChars = [],
  canSeePrivate = true,
  onSuccess,
  onCancel,
}: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial.name ?? "");
  const [image, setImage] = useState(initial.image ?? "");
  const [art, setArt] = useState(initial.art ?? "");
  const [land, setLand] = useState(initial.land ?? "");
  const [region, setRegion] = useState(initial.region ?? "");
  const [population, setPopulation] = useState(
    initial.population != null ? String(initial.population) : ""
  );
  const [klima, setKlima] = useState(initial.klima ?? "");
  const [floraFauna, setFloraFauna] = useState(initial.floraFauna ?? "");
  const [wissenswertes, setWissenswertes] = useState(initial.wissenswertes ?? "");
  const [sichtbarkeit, setSichtbarkeit] = useState(initial.sichtbarkeit ?? "public");
  const [privateNotizen, setPrivateNotizen] = useState(initial.privateNotizen ?? "");

  const [npcIds, setNpcIds] = useState<Set<string>>(new Set(initialNpcIds));
  const [orgIds, setOrgIds] = useState<Set<string>>(new Set(initialOrgIds));
  const [charIds, setCharIds] = useState<Set<string>>(new Set(initialCharIds));

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function toggle(set: Set<string>, setFn: (s: Set<string>) => void, itemId: string) {
    const next = new Set(set);
    next.has(itemId) ? next.delete(itemId) : next.add(itemId);
    setFn(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Name ist erforderlich."); return; }
    setSaving(true);
    setError("");

    const body = {
      name, image: image.trim() || null, art, land, region,
      population: population !== "" ? Number(population) : null,
      klima, floraFauna, wissenswertes,
      sichtbarkeit,
      ...(canSeePrivate && { privateNotizen: privateNotizen.trim() || null }),
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
    if (onSuccess) { router.refresh(); onSuccess(); }
    else { window.location.href = `/locations/${id ?? result.id}`; }
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

      <ImageGeneratorField
        value={image}
        onChange={setImage}
        kind="location"
        label="Bild"
        generatorPlaceholder="z.B. Misty mountain village, snowy peaks, glowing windows at dusk"
      />

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

      {/* Population – no spinner */}
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
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>
          Flora &amp; Fauna <span className="normal-case tracking-normal font-sans text-xs opacity-50">— @ tippen zum Verknüpfen</span>
        </label>
        <MentionTextarea
          value={floraFauna} onChange={(v) => setFloraFauna(v)}
          rows={3} placeholder={"Typische Pflanzen und Tiere...\n\n@ tippen um NPCs, Orgs oder Charaktere zu verknüpfen"}
          className="w-full px-4 py-2.5 text-sm outline-none resize-none"
          style={inputStyle}
        />
      </div>

      {/* Wissenswertes */}
      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>
          Wissenswertes <span className="normal-case tracking-normal font-sans text-xs opacity-50">— @ tippen zum Verknüpfen</span>
        </label>
        <MentionTextarea
          value={wissenswertes} onChange={(v) => setWissenswertes(v)}
          rows={6} placeholder={"Geschichte, Besonderheiten, Geheimnisse...\n\n@ tippen um NPCs, Orgs oder Charaktere zu verknüpfen"}
          className="w-full px-4 py-2.5 text-sm outline-none resize-none"
          style={inputStyle}
        />
      </div>

      {/* Sichtbarkeit */}
      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Sichtbarkeit</label>
        <select value={sichtbarkeit} onChange={(e) => setSichtbarkeit(e.target.value)}
          className="w-full px-4 py-2.5 text-sm outline-none font-cinzel"
          style={inputStyle}>
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
          <textarea value={privateNotizen} onChange={(e) => setPrivateNotizen(e.target.value)}
            placeholder="Geheime Infos, DM-Notizen..." rows={4}
            className="w-full px-4 py-2.5 text-sm outline-none resize-none"
            style={{ ...inputStyle, border: "1px solid #991B1B", background: "#120808" }} />
        </div>
      )}

      {/* Divider */}
      <div className="flex items-center gap-3 pt-2">
        <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, var(--dnd-red), transparent)" }} />
        <span className="font-cinzel text-xs tracking-widest" style={{ color: "var(--dnd-label)" }}>VERKNÜPFUNGEN</span>
        <div className="h-px flex-1" style={{ background: "linear-gradient(270deg, var(--dnd-red), transparent)" }} />
      </div>

      {/* Dropdown multi-selects */}
      <MultiSelect
        label="NPCs"
        items={availableNpcs}
        selected={npcIds}
        onToggle={(itemId) => toggle(npcIds, setNpcIds, itemId)}
        placeholder="NPCs auswählen…"
      />
      <MultiSelect
        label="Organisationen"
        items={availableOrgs}
        selected={orgIds}
        onToggle={(itemId) => toggle(orgIds, setOrgIds, itemId)}
        placeholder="Organisationen auswählen…"
      />
      <MultiSelect
        label="Charaktere"
        items={availableChars}
        selected={charIds}
        onToggle={(itemId) => toggle(charIds, setCharIds, itemId)}
        placeholder="Charaktere auswählen…"
      />

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="ddb-cta py-3 px-8">
          {saving ? "SPEICHERN..." : id ? "ÄNDERUNGEN SPEICHERN" : "LOCATION ERSTELLEN"}
        </button>
        <button
          type="button" onClick={() => onCancel ? onCancel() : router.back()}
          className="font-cinzel text-sm tracking-widest px-6 py-3"
          style={{ border: "1px solid var(--dnd-border)", color: "var(--dnd-text-muted)" }}>
          ABBRECHEN
        </button>
      </div>
    </form>
  );
}
