"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { STATUS_OPTIONS, BEZIEHUNG_OPTIONS, GESCHLECHT_OPTIONS } from "@/lib/constants";
import MentionTextarea from "./MentionTextarea";
import ImageGeneratorField from "./ImageGeneratorField";
import { randomFantasyName } from "@/lib/nameGenerator";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("form");
  const tc = useTranslations("constants");
  const STATUS_LABELS: Record<string, string> = {
    "Lebendig": tc("statusLebendig"), "Tot": tc("statusTot"),
    "Vermisst": tc("statusVermisst"), "Unbekannt": tc("statusUnbekannt"),
  };
  const BEZIEHUNG_LABELS: Record<string, string> = {
    "Verbündet": tc("beziehungVerbuendet"), "Freundlich": tc("beziehungFreundlich"),
    "Neutral": tc("beziehungNeutral"), "Feindlich": tc("beziehungFeindlich"),
    "Unbekannt": tc("beziehungUnbekannt"),
  };
  const GESCHLECHT_LABELS: Record<string, string> = {
    "Männlich": tc("geschlechtMaennlich"), "Weiblich": tc("geschlechtWeiblich"),
    "Divers": tc("geschlechtDivers"),
  };
  const [form, setForm] = useState<NPCData>({ ...EMPTY, ...initial });
  const [selectedOrgs, setSelectedOrgs] = useState<OrgMembership[]>(initialOrgs);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(key: keyof NPCData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError(t("nameRequired")); return; }
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

    if (!res.ok) {
      let msg = t("errorStatus", { status: res.status });
      try { const j = await res.json(); msg = j.error ?? msg; } catch { /* ignore */ }
      setError(msg);
      setSaving(false);
      return;
    }
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
    fontFamily: "var(--font-roboto), sans-serif",
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
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>{t("nameLabel")}</label>
        <div style={{ display: "flex", gap: "8px" }}>
          <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
            placeholder={t("npcNamePlaceholder")} className={inputClass} style={{ ...inputStyle, flex: 1 }} />
          <button
            type="button"
            title={t("rollName")}
            onClick={() => set("name", randomFantasyName(form.geschlecht as "männlich" | "weiblich" | "divers" | ""))}
            className="font-cinzel text-xs px-3 py-2 transition-all shrink-0"
            style={{ background: "#0A0A0A", border: "1px solid #2A2A2A", color: "var(--dnd-gold)" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--dnd-gold)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2A2A2A"; }}
          >
            {t("rollName")}
          </button>
        </div>
      </div>

      <ImageGeneratorField
        value={form.image}
        onChange={(url) => set("image", url)}
        kind="character"
        label={t("charImageLabel")}
        generatorPlaceholder={t("aiPromptNPC")}
      />

      {/* Status + Beziehung */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>{t("statusLabel")}</label>
          <select value={form.status} onChange={(e) => set("status", e.target.value)}
            className={inputClass + " font-cinzel text-sm"} style={inputStyle}>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s] ?? s}</option>)}
          </select>
        </div>
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>{t("beziehungLabel")}</label>
          <select value={form.beziehung} onChange={(e) => set("beziehung", e.target.value)}
            className={inputClass + " font-cinzel text-sm"} style={inputStyle}>
            {BEZIEHUNG_OPTIONS.map((b) => <option key={b} value={b}>{BEZIEHUNG_LABELS[b] ?? b}</option>)}
          </select>
        </div>
      </div>

      {/* Geschlecht + Region */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>{t("geschlechtLabel")}</label>
          <select value={form.geschlecht} onChange={(e) => set("geschlecht", e.target.value)}
            className={inputClass + " font-cinzel text-sm"} style={inputStyle}>
            <option value="">{t("selectPlaceholder")}</option>
            {GESCHLECHT_OPTIONS.map((g) => <option key={g} value={g}>{GESCHLECHT_LABELS[g] ?? g}</option>)}
          </select>
        </div>
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>{t("regionLabel")}</label>
          <select value={form.region} onChange={(e) => set("region", e.target.value)}
            className={inputClass + " font-cinzel text-sm"} style={inputStyle}>
            <option value="">{t("selectPlaceholder")}</option>
            {availableLocations.map((l) => <option key={l.id} value={l.name}>{l.name}</option>)}
          </select>
        </div>
      </div>

      {/* Rasse + Alter */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>{t("rasseLabel")}</label>
          <input type="text" value={form.rasse} onChange={(e) => set("rasse", e.target.value)}
            placeholder={t("rasseAlterPlaceholder")} className={inputClass} style={inputStyle} />
        </div>
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>{t("alterLabel")}</label>
          <input type="text" value={form.alter} onChange={(e) => set("alter", e.target.value)}
            placeholder={t("alterPlaceholder")} className={inputClass} style={inputStyle} />
        </div>
      </div>

      {/* Herkunft + Aktuelle Position */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>{t("herkunftLabel")}</label>
          <select value={form.herkunft} onChange={(e) => set("herkunft", e.target.value)}
            className={inputClass + " font-cinzel text-sm"} style={inputStyle}>
            <option value="">{t("selectPlaceholder")}</option>
            {availableLocations.map((l) => <option key={l.id} value={l.name}>{l.name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>{t("aktuellePositionLabel")}</label>
          <select value={form.aktuellePosition} onChange={(e) => set("aktuellePosition", e.target.value)}
            className={inputClass + " font-cinzel text-sm"} style={inputStyle}>
            <option value="">{t("selectPlaceholder")}</option>
            {availableLocations.map((l) => <option key={l.id} value={l.name}>{l.name}</option>)}
          </select>
        </div>
      </div>

      {/* Organisationen */}
      {/* Gottheit */}
      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>{t("gottheitLabel")}</label>
        <input type="text" value={form.gottheit} onChange={(e) => set("gottheit", e.target.value)}
          placeholder={t("gottheitPlaceholder")} className={inputClass} style={inputStyle} />
      </div>

      {availableOrgs.length > 0 && (
        <div style={{ border: "1px solid #2A2A2A", background: "#0D0D0D" }}>
          <div className="px-4 py-2" style={{ borderBottom: "1px solid #2A2A2A", background: "var(--dnd-red-dark)" }}>
            <span className="font-cinzel text-xs tracking-[0.15em] uppercase" style={{ color: "var(--dnd-heading)" }}>
              {t("orgsLabel")}
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
                      placeholder={t("rollePlaceholder")}
                      value={member?.rolle ?? ""}
                      onChange={(e) => setSelectedOrgs((prev) =>
                        prev.map((o) => o.organisationId === org.id ? { ...o, rolle: e.target.value } : o)
                      )}
                      className="flex-1 px-3 py-1.5 text-sm outline-none"
                      style={{ background: "#0A0A0A", border: "1px solid #3A2A2A", color: "var(--dnd-text)", fontFamily: "var(--font-roboto), sans-serif" }}
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
          {t("notizenLabel")} <span className="normal-case tracking-normal font-sans text-xs opacity-50">{t("mentionHint")}</span>
        </label>
        <MentionTextarea value={form.notizen} onChange={(v) => set("notizen", v)}
          placeholder={t("notizenPlaceholder")}
          rows={6} className={inputClass + " resize-none"} style={inputStyle} />
      </div>

      {/* Sichtbarkeit */}
      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>{t("visibilityLabel")}</label>
        <select value={form.sichtbarkeit} onChange={(e) => setForm(f => ({ ...f, sichtbarkeit: e.target.value }))}
          className={inputClass + " font-cinzel text-sm"} style={inputStyle}>
          <option value="public">{t("visibilityPublic")}</option>
          <option value="privat">{t("visibilityPrivate")}</option>
        </select>
      </div>

      {/* Private Notizen */}
      {canSeePrivate && (
        <div>
          <label className={labelStyle} style={{ color: "#FCA5A5" }}>
            {t("privateNotesLabel")} <span className="normal-case tracking-normal font-sans text-xs" style={{ opacity: 0.6 }}>{t("privateNotesHint")}</span>
          </label>
          <textarea value={form.privateNotizen} onChange={(e) => setForm(f => ({ ...f, privateNotizen: e.target.value }))}
            placeholder={t("privateNotesPlaceholder")} rows={4}
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
          {saving ? t("saving") : id ? t("saveChanges") : t("npcCreateButton")}
        </button>
        <button type="button" onClick={() => onCancel ? onCancel() : router.push(id ? `/npc/${id}` : "/npc")}
          className="font-cinzel text-sm tracking-widest px-6 py-3 transition-all"
          style={{ border: "1px solid var(--dnd-border)", color: "var(--dnd-text-muted)" }}>
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}
