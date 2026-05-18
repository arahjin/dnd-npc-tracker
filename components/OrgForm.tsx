"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ALIGNMENT_OPTIONS, ORGANISATION_TYP_OPTIONS } from "@/lib/constants";
import MentionTextarea from "./MentionTextarea";
import ImageGeneratorField from "./ImageGeneratorField";
import { useTranslations } from "next-intl";

type OrgData = {
  name: string;
  image: string;
  beschreibung: string;
  typ: string;
  region: string;
  alignment: string;
  beziehungZurGruppe: string;
  gottheit: string;
  sichtbarkeit: string;
  privateNotizen: string;
};

const EMPTY: OrgData = {
  name: "", image: "", beschreibung: "", typ: "", region: "", alignment: "", beziehungZurGruppe: "", gottheit: "",
  sichtbarkeit: "public", privateNotizen: "",
};

export default function OrgForm({ initial, id, availableLocations = [], onSuccess, onCancel, canSeePrivate = true }: { initial?: Partial<OrgData & { sichtbarkeit?: string; privateNotizen?: string }>; id?: string; availableLocations?: { id: string; name: string }[]; onSuccess?: () => void; onCancel?: () => void; canSeePrivate?: boolean }) {
  const router = useRouter();
  const t = useTranslations("form");
  const tc = useTranslations("constants");
  const ALIGNMENT_LABELS: Record<string, string> = {
    "Rechtschaffen Gut": tc("alignmentLG"), "Neutral Gut": tc("alignmentNG"),
    "Chaotisch Gut": tc("alignmentCG"), "Rechtschaffen Neutral": tc("alignmentLN"),
    "Wahrhaft Neutral": tc("alignmentNN"), "Chaotisch Neutral": tc("alignmentCN"),
    "Rechtschaffen Böse": tc("alignmentLE"), "Neutral Böse": tc("alignmentNE"),
    "Chaotisch Böse": tc("alignmentCE"),
  };
  const ORG_TYP_LABELS: Record<string, string> = {
    "Gilde": tc("orgTypGilde"), "Fraktion": tc("orgTypFraktion"),
    "Orden": tc("orgTypOrden"), "Regierung": tc("orgTypRegierung"),
    "Kult": tc("orgTypKult"), "Händlerverband": tc("orgTypHaendlerverband"),
    "Militär": tc("orgTypMilitaer"), "Kriminelle Organisation": tc("orgTypKriminell"),
    "Sonstiges": tc("orgTypSonstiges"),
  };
  const [form, setForm] = useState<OrgData>({ ...EMPTY, ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(key: keyof OrgData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError(t("nameRequired")); return; }
    setSaving(true);
    setError("");
    const payload = {
      name: form.name.trim(),
      image: form.image.trim() || null,
      beschreibung: form.beschreibung.trim() || null,
      typ: form.typ || null,
      region: form.region || null,
      alignment: form.alignment || null,
      beziehungZurGruppe: form.beziehungZurGruppe.trim() || null,
      gottheit: form.gottheit.trim() || null,
      sichtbarkeit: form.sichtbarkeit,
      ...(canSeePrivate && { privateNotizen: form.privateNotizen.trim() || null }),
    };
    const res = id
      ? await fetch(`/api/organisationen/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/organisationen", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) {
      let msg = t("errorStatus", { status: res.status });
      try { const j = await res.json(); msg = j.error ?? msg; } catch { /* ignore */ }
      setError(msg);
      setSaving(false);
      return;
    }
    const org = await res.json();
    if (onSuccess) { router.refresh(); onSuccess(); }
    else { window.location.href = `/organisationen/${org.id}`; }
  }

  const inputClass = "w-full px-4 py-2.5 text-base outline-none transition-colors";
  const inputStyle = { background: "#0A0A0A", border: "1px solid #2A2A2A", color: "var(--dnd-text)", fontFamily: "var(--font-roboto), sans-serif" };
  const labelStyle = "font-cinzel text-xs tracking-[0.15em] uppercase block mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="font-cinzel text-sm px-4 py-3" style={{ background: "#200D0D", border: "1px solid #991B1B", color: "#F87171" }}>{error}</div>}

      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>{t("nameLabel")}</label>
        <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder={t("orgNamePlaceholder")} className={inputClass} style={inputStyle} />
      </div>

      <ImageGeneratorField
        value={form.image}
        onChange={(url) => set("image", url)}
        kind="organisation"
        label={t("orgImageLabel")}
        generatorPlaceholder={t("aiPromptOrg")}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>{t("typLabel")}</label>
          <select value={form.typ} onChange={(e) => set("typ", e.target.value)} className={inputClass + " font-cinzel text-sm"} style={inputStyle}>
            <option value="">{t("selectPlaceholder")}</option>
            {ORGANISATION_TYP_OPTIONS.map((o) => <option key={o} value={o}>{ORG_TYP_LABELS[o] ?? o}</option>)}
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

      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>{t("alignmentLabel")}</label>
        <select value={form.alignment} onChange={(e) => set("alignment", e.target.value)} className={inputClass + " font-cinzel text-sm"} style={inputStyle}>
          <option value="">{t("selectPlaceholder")}</option>
          {ALIGNMENT_OPTIONS.map((a) => <option key={a} value={a}>{ALIGNMENT_LABELS[a] ?? a}</option>)}
        </select>
      </div>

      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>{t("beziehungZurGruppeLabel")}</label>
        <textarea value={form.beziehungZurGruppe} onChange={(e) => set("beziehungZurGruppe", e.target.value)}
          placeholder={t("beziehungZurGruppePlaceholder")} rows={3} className={inputClass + " resize-none"} style={inputStyle} />
      </div>

      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>{t("gottheitLabel")}</label>
        <input type="text" value={form.gottheit} onChange={(e) => set("gottheit", e.target.value)}
          placeholder={t("gottheitOrgPlaceholder")} className={inputClass} style={inputStyle} />
      </div>

      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>
          {t("beschreibungLabel")} <span className="normal-case tracking-normal font-sans text-xs opacity-50">{t("mentionHint")}</span>
        </label>
        <MentionTextarea value={form.beschreibung} onChange={(v) => set("beschreibung", v)}
          placeholder={t("orgBeschreibungPlaceholder")}
          rows={5} className={inputClass + " resize-none"} style={inputStyle} />
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
          <textarea value={form.privateNotizen} onChange={(e) => set("privateNotizen", e.target.value)}
            placeholder={t("privateNotesPlaceholder")} rows={4}
            className={inputClass + " resize-none"}
            style={{ ...inputStyle, border: "1px solid #991B1B", background: "#120808" }} />
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, var(--dnd-red-dark), transparent)" }} />
        <span style={{ color: "var(--dnd-red)" }}>✦</span>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="font-cinzel text-sm tracking-widest px-8 py-3 transition-all disabled:opacity-50"
          style={{ background: "var(--dnd-red)", color: "#F5EDD6", border: "1px solid var(--dnd-red-dark)" }}>
          {saving ? t("saving") : id ? t("saveChanges") : t("orgCreateButton")}
        </button>
        <button type="button" onClick={() => onCancel ? onCancel() : router.back()} className="font-cinzel text-sm tracking-widest px-6 py-3 transition-all"
          style={{ border: "1px solid var(--dnd-border)", color: "var(--dnd-text-muted)" }}>
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}
