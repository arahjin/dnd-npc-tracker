"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { STATUS_OPTIONS, BEZIEHUNG_OPTIONS, GESCHLECHT_OPTIONS } from "@/lib/constants";
import MentionTextarea from "./MentionTextarea";
import ImageGeneratorField from "./ImageGeneratorField";
import { useTranslations } from "next-intl";

type OrgMembership = { organisationId: string; rolle: string };

type CharData = {
  name: string; image: string; status: string; beziehung: string;
  geschlecht: string; region: string; alter: string; rasse: string;
  herkunft: string; aktuellePosition: string; gottheit: string; notizen: string;
  sichtbarkeit: string; privateNotizen: string;
};

type Props = {
  initial?: Partial<CharData>;
  id?: string;
  availableOrgs?: { id: string; name: string }[];
  initialOrgs?: OrgMembership[];
  availableLocations?: { id: string; name: string }[];
  onSuccess?: () => void;
  onCancel?: () => void;
  canSeePrivate?: boolean;
};

const EMPTY: CharData = {
  name: "", image: "", status: "Lebendig", beziehung: "Neutral",
  geschlecht: "", region: "", alter: "", rasse: "", herkunft: "",
  aktuellePosition: "", gottheit: "", notizen: "",
  sichtbarkeit: "public", privateNotizen: "",
};

export default function CharakterForm({ initial, id, availableOrgs = [], initialOrgs = [], availableLocations = [], onSuccess, onCancel, canSeePrivate = true }: Props) {
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
  const [form, setForm] = useState<CharData>({ ...EMPTY, ...initial });
  const [selectedOrgs, setSelectedOrgs] = useState<OrgMembership[]>(initialOrgs);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(key: keyof CharData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError(t("nameRequired")); return; }
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
      sichtbarkeit: form.sichtbarkeit,
      ...(canSeePrivate && { privateNotizen: form.privateNotizen.trim() || null }),
      organisationen: selectedOrgs.filter((o) => o.organisationId),
    };

    const res = id
      ? await fetch(`/api/charaktere/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/charaktere", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

    if (!res.ok) {
      let msg = `Fehler ${res.status}`;
      try { const j = await res.json(); msg = j.error ?? msg; } catch { /* ignore */ }
      setError(msg);
      setSaving(false);
      return;
    }
    const c = await res.json();
    if (id && onSuccess) { router.refresh(); onSuccess(); }
    else { router.push(`/charaktere/${c.id}`); router.refresh(); }
  }

  const inputClass = "w-full px-4 py-2.5 text-base outline-none transition-colors";
  const inputStyle = { background: "#0A0A0A", border: "1px solid #2A2A2A", color: "var(--dnd-text)", fontFamily: "var(--font-roboto), sans-serif" };
  const labelStyle = "font-cinzel text-xs tracking-[0.15em] uppercase block mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="font-cinzel text-sm px-4 py-3" style={{ background: "#200D0D", border: "1px solid #991B1B", color: "#F87171" }}>{error}</div>
      )}

      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>{t("nameLabel")}</label>
        <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
          placeholder={t("charNamePlaceholder")} className={inputClass} style={inputStyle} />
      </div>

      <ImageGeneratorField
        value={form.image}
        onChange={(url) => set("image", url)}
        kind="character"
        label={t("charImageLabel")}
        generatorPlaceholder="z.B. Human paladin, silver armor, blue cloak, holy aura"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>{t("statusLabel")}</label>
          <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputClass + " font-cinzel text-sm"} style={inputStyle}>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s] ?? s}</option>)}
          </select>
        </div>
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>{t("beziehungLabel")}</label>
          <select value={form.beziehung} onChange={(e) => set("beziehung", e.target.value)} className={inputClass + " font-cinzel text-sm"} style={inputStyle}>
            {BEZIEHUNG_OPTIONS.map((b) => <option key={b} value={b}>{BEZIEHUNG_LABELS[b] ?? b}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>{t("geschlechtLabel")}</label>
          <select value={form.geschlecht} onChange={(e) => set("geschlecht", e.target.value)} className={inputClass + " font-cinzel text-sm"} style={inputStyle}>
            <option value="">{t("selectPlaceholder")}</option>
            {GESCHLECHT_OPTIONS.map((g) => <option key={g} value={g}>{GESCHLECHT_LABELS[g] ?? g}</option>)}
          </select>
        </div>
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>{t("regionLabel")}</label>
          <select value={form.region} onChange={(e) => set("region", e.target.value)} className={inputClass + " font-cinzel text-sm"} style={inputStyle}>
            <option value="">{t("selectPlaceholder")}</option>
            {availableLocations.map((l) => <option key={l.id} value={l.name}>{l.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>{t("rasseLabel")}</label>
          <input type="text" value={form.rasse} onChange={(e) => set("rasse", e.target.value)} placeholder={t("charRassePlaceholder")} className={inputClass} style={inputStyle} />
        </div>
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>{t("alterLabel")}</label>
          <input type="text" value={form.alter} onChange={(e) => set("alter", e.target.value)} className={inputClass} style={inputStyle} />
        </div>
      </div>

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

      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>{t("gottheitLabel")}</label>
        <input type="text" value={form.gottheit} onChange={(e) => set("gottheit", e.target.value)}
          placeholder={t("gottheitPlaceholder")} className={inputClass} style={inputStyle} />
      </div>

      {availableOrgs.length > 0 && (
        <div style={{ border: "1px solid #2A2A2A", background: "#0D0D0D" }}>
          <div className="px-4 py-2" style={{ borderBottom: "1px solid #2A2A2A", background: "var(--dnd-red-dark)" }}>
            <span className="font-cinzel text-xs tracking-[0.15em] uppercase" style={{ color: "var(--dnd-heading)" }}>{t("orgsLabel")}</span>
          </div>
          <div className="p-4 space-y-2">
            {availableOrgs.map((org) => {
              const member = selectedOrgs.find((o) => o.organisationId === org.id);
              const checked = !!member;
              return (
                <div key={org.id} className="flex items-center gap-3">
                  <input type="checkbox" checked={checked} className="accent-red-700 w-4 h-4 shrink-0 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.checked) setSelectedOrgs((p) => [...p, { organisationId: org.id, rolle: "" }]);
                      else setSelectedOrgs((p) => p.filter((o) => o.organisationId !== org.id));
                    }} />
                  <span className="font-cinzel text-sm shrink-0" style={{ color: checked ? "var(--dnd-heading)" : "var(--dnd-text-muted)" }}>{org.name}</span>
                  {checked && (
                    <input type="text" placeholder={t("rollePlaceholder")} value={member?.rolle ?? ""}
                      onChange={(e) => setSelectedOrgs((p) => p.map((o) => o.organisationId === org.id ? { ...o, rolle: e.target.value } : o))}
                      className="flex-1 px-3 py-1.5 text-sm outline-none"
                      style={{ background: "#0A0A0A", border: "1px solid #3A2A2A", color: "var(--dnd-text)", fontFamily: "var(--font-roboto), sans-serif" }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>
          {t("notizenLabel")} <span className="normal-case tracking-normal font-sans text-xs opacity-50">{t("mentionHint")}</span>
        </label>
        <MentionTextarea value={form.notizen} onChange={(v) => set("notizen", v)}
          rows={6} className={inputClass + " resize-none"} style={inputStyle}
          placeholder={t("notizenPlaceholder")} />
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

      <div className="flex items-center gap-3">
        <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, var(--dnd-red-dark), transparent)" }} />
        <span style={{ color: "var(--dnd-label)" }}>✦</span>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="ddb-cta py-3 px-8">
          {saving ? t("saving") : id ? t("saveChanges") : t("charCreateButton")}
        </button>
        <button type="button" onClick={() => onCancel ? onCancel() : router.back()} className="font-cinzel text-sm tracking-widest px-6 py-3 transition-all"
          style={{ border: "1px solid var(--dnd-border)", color: "var(--dnd-text-muted)" }}>
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}
