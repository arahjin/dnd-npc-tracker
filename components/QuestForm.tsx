"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  QUEST_STATUS_OPTIONS,
  QUEST_TYP_OPTIONS,
  QUEST_PRIORITAET_OPTIONS,
  QUEST_NPC_ROLLEN,
  QUEST_LOCATION_ROLLEN,
  QUEST_ORG_ROLLEN,
  QUEST_CHAR_ROLLEN,
} from "@/lib/constants";
import { useTranslations } from "next-intl";

type QuestData = {
  title: string;
  status: string;
  typ: string;
  prioritaet: string;
  summary: string;
  description: string;
  reward: string;
  gmNotes: string;
  deadline: string;
  sichtbarkeit: string;
};

type AssocItem<K extends string> = { [key in K]: string } & { rolle: string };

type Props = {
  initial?: Partial<QuestData>;
  id?: string;
  availableNpcs?: { id: string; name: string }[];
  availableLocations?: { id: string; name: string }[];
  availableOrgs?: { id: string; name: string }[];
  availableChars?: { id: string; name: string }[];
  initialNpcs?: { npcId: string; rolle: string }[];
  initialLocations?: { locationId: string; rolle: string }[];
  initialOrgs?: { organisationId: string; rolle: string }[];
  initialChars?: { charakterId: string; rolle: string }[];
  onSuccess?: () => void;
  onCancel?: () => void;
  canSeePrivate?: boolean;
};

const EMPTY: QuestData = {
  title: "",
  status: "Aktiv",
  typ: "Nebenquest",
  prioritaet: "",
  summary: "",
  description: "",
  reward: "",
  gmNotes: "",
  deadline: "",
  sichtbarkeit: "public",
};

export default function QuestForm({
  initial,
  id,
  availableNpcs: availableNpcsProp,
  availableLocations: availableLocationsProp,
  availableOrgs: availableOrgsProp,
  availableChars: availableCharsProp,
  initialNpcs = [],
  initialLocations = [],
  initialOrgs = [],
  initialChars = [],
  onSuccess,
  onCancel,
  canSeePrivate = true,
}: Props) {
  const router = useRouter();
  const t = useTranslations("form");
  const tc = useTranslations("constants");
  const QUEST_STATUS_LABELS: Record<string, string> = {
    "Aktiv": tc("questStatusAktiv"), "Abgeschlossen": tc("questStatusAbgeschlossen"),
    "Gescheitert": tc("questStatusGescheitert"), "Pausiert": tc("questStatusPausiert"),
    "Unbekannt": tc("questStatusUnbekannt"),
  };
  const QUEST_TYP_LABELS: Record<string, string> = {
    "Hauptquest": tc("questTypHauptquest"), "Nebenquest": tc("questTypNebenquest"),
    "Gildenauftrag": tc("questTypGildenauftrag"), "Persönlich": tc("questTypPersoenlich"),
    "Geheim": tc("questTypGeheim"),
  };
  const QUEST_PRIORITAET_LABELS: Record<string, string> = {
    "Hoch": tc("questPrioritaetHoch"), "Mittel": tc("questPrioritaetMittel"),
    "Niedrig": tc("questPrioritaetNiedrig"),
  };
  const [form, setForm] = useState<QuestData>({ ...EMPTY, ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Lazy-load relation lists if not supplied via props
  const propsHaveRelations =
    availableNpcsProp !== undefined ||
    availableLocationsProp !== undefined ||
    availableOrgsProp !== undefined ||
    availableCharsProp !== undefined;
  const [availableNpcs, setAvailableNpcs] = useState(availableNpcsProp ?? []);
  const [availableLocations, setAvailableLocations] = useState(availableLocationsProp ?? []);
  const [availableOrgs, setAvailableOrgs] = useState(availableOrgsProp ?? []);
  const [availableChars, setAvailableChars] = useState(availableCharsProp ?? []);
  useEffect(() => {
    if (propsHaveRelations) return;
    let cancelled = false;
    fetch("/api/quests/relations")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data || cancelled) return;
        setAvailableNpcs(data.npcs ?? []);
        setAvailableLocations(data.locations ?? []);
        setAvailableOrgs(data.organisationen ?? []);
        setAvailableChars(data.charaktere ?? []);
      })
      .catch(() => { /* non-fatal: dropdowns stay empty */ });
    return () => { cancelled = true; };
  }, [propsHaveRelations]);

  // Association state
  const [selectedNpcs, setSelectedNpcs] = useState<AssocItem<"npcId">[]>(initialNpcs);
  const [selectedLocations, setSelectedLocations] = useState<AssocItem<"locationId">[]>(initialLocations);
  const [selectedOrgs, setSelectedOrgs] = useState<AssocItem<"organisationId">[]>(initialOrgs);
  const [selectedChars, setSelectedChars] = useState<AssocItem<"charakterId">[]>(initialChars);

  // Track removed associations for edit mode
  const [removedNpcs, setRemovedNpcs] = useState<string[]>([]);
  const [removedLocations, setRemovedLocations] = useState<string[]>([]);
  const [removedOrgs, setRemovedOrgs] = useState<string[]>([]);
  const [removedChars, setRemovedChars] = useState<string[]>([]);

  const inputClass = "w-full px-4 py-2.5 text-base outline-none transition-colors";
  const inputStyle = {
    background: "#0A0A0A",
    border: "1px solid #2A2A2A",
    color: "var(--dnd-text)",
    fontFamily: "var(--font-roboto), sans-serif",
  };
  const labelStyle = "font-cinzel text-xs tracking-[0.15em] uppercase block mb-2";

  function set(key: keyof QuestData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError(t("titleRequired")); return; }
    setSaving(true);
    setError("");

    const payload = {
      title: form.title.trim(),
      status: form.status,
      typ: form.typ,
      prioritaet: form.prioritaet || null,
      summary: form.summary.trim() || null,
      description: form.description.trim() || null,
      reward: form.reward.trim() || null,
      gmNotes: canSeePrivate ? (form.gmNotes.trim() || null) : undefined,
      deadline: form.deadline.trim() || null,
      sichtbarkeit: form.sichtbarkeit,
    };

    const res = id
      ? await fetch(`/api/quests/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/quests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

    if (!res.ok) {
      let msg = t("errorStatus", { status: res.status });
      try { const j = await res.json(); msg = j.error ?? msg; } catch { /* ignore */ }
      setError(msg);
      setSaving(false);
      return;
    }
    const quest = await res.json();
    const questId: string = quest.id;

    // Handle associations
    await Promise.all([
      // Delete removed
      ...removedNpcs.map((npcId) =>
        fetch(`/api/quests/${questId}/npcs`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ npcId }) })
      ),
      ...removedLocations.map((locationId) =>
        fetch(`/api/quests/${questId}/locations`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ locationId }) })
      ),
      ...removedOrgs.map((organisationId) =>
        fetch(`/api/quests/${questId}/organisationen`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ organisationId }) })
      ),
      ...removedChars.map((charakterId) =>
        fetch(`/api/quests/${questId}/charaktere`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ charakterId }) })
      ),
      // Upsert current
      ...selectedNpcs.map((n) =>
        fetch(`/api/quests/${questId}/npcs`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ npcId: n.npcId, rolle: n.rolle }) })
      ),
      ...selectedLocations.map((l) =>
        fetch(`/api/quests/${questId}/locations`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ locationId: l.locationId, rolle: l.rolle }) })
      ),
      ...selectedOrgs.map((o) =>
        fetch(`/api/quests/${questId}/organisationen`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ organisationId: o.organisationId, rolle: o.rolle }) })
      ),
      ...selectedChars.map((c) =>
        fetch(`/api/quests/${questId}/charaktere`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ charakterId: c.charakterId, rolle: c.rolle }) })
      ),
    ]);

    if (id) {
      if (onSuccess) { router.refresh(); onSuccess(); }
      else { router.push(`/quests/${questId}`); router.refresh(); }
    } else {
      if (onSuccess) onSuccess();
      window.location.href = `/quests/${questId}`;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="font-cinzel text-sm px-4 py-3 tracking-wide"
          style={{ background: "#200D0D", border: "1px solid #991B1B", color: "#F87171" }}>
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>{t("questTitleLabel")}</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder={t("questTitlePlaceholder")}
          className={inputClass}
          style={inputStyle}
        />
      </div>

      {/* Status + Typ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>{t("statusLabel")}</label>
          <select value={form.status} onChange={(e) => set("status", e.target.value)}
            className={inputClass + " font-cinzel text-sm"} style={inputStyle}>
            {QUEST_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{QUEST_STATUS_LABELS[s] ?? s}</option>)}
          </select>
        </div>
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>{t("typLabel")}</label>
          <select value={form.typ} onChange={(e) => set("typ", e.target.value)}
            className={inputClass + " font-cinzel text-sm"} style={inputStyle}>
            {QUEST_TYP_OPTIONS.map((o) => <option key={o} value={o}>{QUEST_TYP_LABELS[o] ?? o}</option>)}
          </select>
        </div>
      </div>

      {/* Priorität + Sichtbarkeit */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>{t("prioritaetLabel")}</label>
          <select value={form.prioritaet} onChange={(e) => set("prioritaet", e.target.value)}
            className={inputClass + " font-cinzel text-sm"} style={inputStyle}>
            <option value="">{t("noPriorityOption")}</option>
            {QUEST_PRIORITAET_OPTIONS.map((p) => <option key={p} value={p}>{QUEST_PRIORITAET_LABELS[p] ?? p}</option>)}
          </select>
        </div>
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>{t("visibilityLabel")}</label>
          <select value={form.sichtbarkeit} onChange={(e) => set("sichtbarkeit", e.target.value)}
            className={inputClass + " font-cinzel text-sm"} style={inputStyle}>
            <option value="public">{t("visibilityPublic")}</option>
            <option value="privat">{t("visibilityPrivateDM")}</option>
          </select>
        </div>
      </div>

      {/* Deadline */}
      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>{t("deadlineLabel")}</label>
        <input
          type="text"
          value={form.deadline}
          onChange={(e) => set("deadline", e.target.value)}
          placeholder={t("deadlinePlaceholder")}
          className={inputClass}
          style={inputStyle}
        />
      </div>

      {/* Summary */}
      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>{t("summaryLabel")}</label>
        <textarea
          value={form.summary}
          onChange={(e) => set("summary", e.target.value)}
          placeholder={t("summaryPlaceholder")}
          rows={2}
          className={inputClass + " resize-none"}
          style={inputStyle}
        />
      </div>

      {/* Description */}
      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>{t("beschreibungLabel")}</label>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder={t("questDescriptionPlaceholder")}
          rows={5}
          className={inputClass + " resize-none"}
          style={inputStyle}
        />
      </div>

      {/* Reward */}
      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>{t("rewardLabel")}</label>
        <input
          type="text"
          value={form.reward}
          onChange={(e) => set("reward", e.target.value)}
          placeholder={t("rewardPlaceholder")}
          className={inputClass}
          style={inputStyle}
        />
      </div>

      {/* GM Notes */}
      {canSeePrivate && (
        <div>
          <label className={labelStyle} style={{ color: "#FCA5A5" }}>
            {t("gmNotesLabel")} <span className="normal-case tracking-normal font-sans text-xs" style={{ opacity: 0.6 }}>{t("gmNotesHint")}</span>
          </label>
          <textarea
            value={form.gmNotes}
            onChange={(e) => set("gmNotes", e.target.value)}
            placeholder={t("gmNotesPlaceholder")}
            rows={3}
            className={inputClass + " resize-none"}
            style={{ ...inputStyle, border: "1px solid #991B1B", background: "#120808" }}
          />
        </div>
      )}

      {/* ── Associations ── */}

      {/* NPCs */}
      {availableNpcs.length > 0 && (
        <AssociationSection
          title="NPCs"
          items={availableNpcs}
          selected={selectedNpcs}
          idKey="npcId"
          rolleOptions={QUEST_NPC_ROLLEN}
          onAdd={(npcId) => setSelectedNpcs((prev) => [...prev, { npcId, rolle: "" }])}
          onRemove={(npcId) => {
            setSelectedNpcs((prev) => prev.filter((n) => n.npcId !== npcId));
            if (id) setRemovedNpcs((prev) => [...prev, npcId]);
          }}
          onRolleChange={(npcId, rolle) =>
            setSelectedNpcs((prev) => prev.map((n) => n.npcId === npcId ? { ...n, rolle } : n))
          }
          rolleOptionLabel={t("rolleOption")}
          addItemLabel={t("addItem", { title: "NPCs" })}
        />
      )}

      {/* Locations */}
      {availableLocations.length > 0 && (
        <AssociationSection
          title="Locations"
          items={availableLocations}
          selected={selectedLocations}
          idKey="locationId"
          rolleOptions={QUEST_LOCATION_ROLLEN}
          onAdd={(locationId) => setSelectedLocations((prev) => [...prev, { locationId, rolle: "" }])}
          onRemove={(locationId) => {
            setSelectedLocations((prev) => prev.filter((l) => l.locationId !== locationId));
            if (id) setRemovedLocations((prev) => [...prev, locationId]);
          }}
          onRolleChange={(locationId, rolle) =>
            setSelectedLocations((prev) => prev.map((l) => l.locationId === locationId ? { ...l, rolle } : l))
          }
          rolleOptionLabel={t("rolleOption")}
          addItemLabel={t("addItem", { title: "Locations" })}
        />
      )}

      {/* Organisationen */}
      {availableOrgs.length > 0 && (
        <AssociationSection
          title={t("orgsLabel")}
          items={availableOrgs}
          selected={selectedOrgs}
          idKey="organisationId"
          rolleOptions={QUEST_ORG_ROLLEN}
          onAdd={(organisationId) => setSelectedOrgs((prev) => [...prev, { organisationId, rolle: "" }])}
          onRemove={(organisationId) => {
            setSelectedOrgs((prev) => prev.filter((o) => o.organisationId !== organisationId));
            if (id) setRemovedOrgs((prev) => [...prev, organisationId]);
          }}
          onRolleChange={(organisationId, rolle) =>
            setSelectedOrgs((prev) => prev.map((o) => o.organisationId === organisationId ? { ...o, rolle } : o))
          }
          rolleOptionLabel={t("rolleOption")}
          addItemLabel={t("addItem", { title: t("orgsLabel") })}
        />
      )}

      {/* Charaktere */}
      {availableChars.length > 0 && (
        <AssociationSection
          title={t("charaktereLabel")}
          items={availableChars}
          selected={selectedChars}
          idKey="charakterId"
          rolleOptions={QUEST_CHAR_ROLLEN}
          onAdd={(charakterId) => setSelectedChars((prev) => [...prev, { charakterId, rolle: "" }])}
          onRemove={(charakterId) => {
            setSelectedChars((prev) => prev.filter((c) => c.charakterId !== charakterId));
            if (id) setRemovedChars((prev) => [...prev, charakterId]);
          }}
          onRolleChange={(charakterId, rolle) =>
            setSelectedChars((prev) => prev.map((c) => c.charakterId === charakterId ? { ...c, rolle } : c))
          }
          rolleOptionLabel={t("rolleOption")}
          addItemLabel={t("addItem", { title: t("charaktereLabel") })}
        />
      )}

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, var(--dnd-red-dark), transparent)" }} />
        <span style={{ color: "var(--dnd-label)" }}>✦</span>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="font-cinzel text-sm tracking-widest px-8 py-3 transition-all disabled:opacity-50"
          style={{ background: "var(--dnd-red)", color: "#F5EDD6", border: "1px solid var(--dnd-red-dark)" }}
        >
          {saving ? t("saving") : id ? t("saveChanges") : t("questCreateButton")}
        </button>
        <button
          type="button"
          onClick={() => onCancel ? onCancel() : router.push(id ? `/quests/${id}` : "/quests")}
          className="font-cinzel text-sm tracking-widest px-6 py-3 transition-all"
          style={{ border: "1px solid var(--dnd-border)", color: "var(--dnd-text-muted)" }}
        >
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}

// ── Association Section ──────────────────────────────────

type AssocSectionProps<K extends string> = {
  title: string;
  items: { id: string; name: string }[];
  selected: AssocItem<K>[];
  idKey: K;
  rolleOptions: readonly string[];
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  onRolleChange: (id: string, rolle: string) => void;
  rolleOptionLabel: string;
  addItemLabel: string;
};

function AssociationSection<K extends string>({
  title,
  items,
  selected,
  idKey,
  rolleOptions,
  onAdd,
  onRemove,
  onRolleChange,
  rolleOptionLabel,
  addItemLabel,
}: AssocSectionProps<K>) {
  const selectedIds = selected.map((s) => s[idKey] as string);
  const available = items.filter((i) => !selectedIds.includes(i.id));

  const inputStyle = {
    background: "#0A0A0A",
    border: "1px solid #2A2A2A",
    color: "var(--dnd-text)",
    fontFamily: "var(--font-roboto), sans-serif",
  };

  return (
    <div style={{ border: "1px solid #2A2A2A", background: "#0D0D0D" }}>
      <div className="px-4 py-2" style={{ borderBottom: "1px solid #2A2A2A", background: "var(--dnd-red-dark)" }}>
        <span className="font-cinzel text-xs tracking-[0.15em] uppercase" style={{ color: "var(--dnd-heading)" }}>
          {title}
        </span>
      </div>
      <div className="p-4 space-y-2">
        {selected.map((item) => {
          const itemId = item[idKey] as string;
          const found = items.find((i) => i.id === itemId);
          return (
            <div key={itemId} className="flex items-center gap-2">
              <span className="font-cinzel text-sm shrink-0" style={{ color: "var(--dnd-heading)", minWidth: "120px" }}>
                {found?.name ?? itemId}
              </span>
              <select
                value={item.rolle}
                onChange={(e) => onRolleChange(itemId, e.target.value)}
                className="flex-1 px-3 py-1.5 text-sm outline-none font-cinzel"
                style={inputStyle}
              >
                <option value="">{rolleOptionLabel}</option>
                {rolleOptions.map((r) => <option key={r}>{r}</option>)}
              </select>
              <button
                type="button"
                onClick={() => onRemove(itemId)}
                className="font-cinzel text-xs px-2 py-1.5 shrink-0 transition-all"
                style={{ border: "1px solid #991B1B", color: "#F87171", background: "transparent" }}
              >
                ✕
              </button>
            </div>
          );
        })}
        {available.length > 0 && (
          <select
            value=""
            onChange={(e) => { if (e.target.value) onAdd(e.target.value); }}
            className="w-full px-3 py-2 text-sm outline-none font-cinzel"
            style={{ ...inputStyle, border: "1px solid #3A2A2A" }}
          >
            <option value="">{addItemLabel}</option>
            {available.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
