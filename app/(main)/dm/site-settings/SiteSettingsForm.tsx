"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type Settings = {
  copyrightText: string;
  kontaktEmail: string;
  discordUrl: string;
  impressumContent: string;
  datenschutzContent: string;
  landingTitle: string;
  landingSubtitle: string;
  landingBody: string;
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  background: "var(--dnd-bg)",
  border: "1px solid var(--dnd-border)",
  color: "var(--dnd-text)",
  fontFamily: "var(--font-roboto), sans-serif",
  fontSize: "0.9rem",
  outline: "none",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: "vertical",
  minHeight: "220px",
  lineHeight: "1.6",
};

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="font-cinzel text-xs tracking-widest uppercase block mb-1.5" style={{ color: "var(--dnd-label)" }}>
      {children}
    </label>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs" style={{ color: "var(--dnd-text-muted)" }}>{children}</p>;
}

export default function SiteSettingsForm({ initial }: { initial: Settings }) {
  const [form, setForm] = useState<Settings>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"allgemein" | "startseite" | "impressum" | "datenschutz">("allgemein");
  const t = useTranslations("siteSettings");

  function set(key: keyof Settings, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
    setSaved(false);
    setError("");
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/site-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? t("fallbackError"));
      setSaved(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("unknownError"));
    } finally {
      setSaving(false);
    }
  }

  const tabStyle = (tab: string): React.CSSProperties => ({
    fontFamily: "var(--font-oswald), sans-serif",
    fontSize: "0.7rem",
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
    padding: "10px 20px",
    cursor: "pointer",
    border: "none",
    background: "none",
    color: activeTab === tab ? "var(--dnd-heading)" : "var(--dnd-text-muted)",
    borderBottom: `2px solid ${activeTab === tab ? "var(--dnd-red)" : "transparent"}`,
    transition: "color 0.15s, border-color 0.15s",
  });

  return (
    <div>
      {/* Tabs */}
      <div style={{ borderBottom: "1px solid var(--dnd-border)", display: "flex", gap: 0, marginBottom: "24px" }}>
        <button style={tabStyle("allgemein")} onClick={() => setActiveTab("allgemein")}>{t("tabAllgemein")}</button>
        <button style={tabStyle("startseite")} onClick={() => setActiveTab("startseite")}>{t("tabStartseite")}</button>
        <button style={tabStyle("impressum")} onClick={() => setActiveTab("impressum")}>{t("tabImpressum")}</button>
        <button style={tabStyle("datenschutz")} onClick={() => setActiveTab("datenschutz")}>{t("tabDatenschutz")}</button>
      </div>

      {/* Tab: Allgemein */}
      {activeTab === "allgemein" && (
        <div className="space-y-6">
          <div style={{ border: "1px solid var(--dnd-border)", background: "var(--dnd-bg-card)" }}>
            <div className="px-4 py-2" style={{ background: "var(--dnd-red-dark)", borderBottom: "1px solid var(--dnd-border)" }}>
              <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "#FFFFFF" }}>{t("footerSection")}</h2>
            </div>
            <div className="px-5 py-5 space-y-5">
              <div>
                <Label>{t("copyrightLabel")}</Label>
                <input
                  type="text"
                  value={form.copyrightText}
                  onChange={(e) => set("copyrightText", e.target.value)}
                  placeholder={t("copyrightPlaceholder")}
                  style={inputStyle}
                />
                <Hint>{t("copyrightHint")}</Hint>
              </div>
              <div>
                <Label>{t("kontaktEmailLabel")}</Label>
                <input
                  type="email"
                  value={form.kontaktEmail}
                  onChange={(e) => set("kontaktEmail", e.target.value)}
                  placeholder={t("kontaktEmailPlaceholder")}
                  style={inputStyle}
                />
                <Hint>{t("kontaktEmailHint")}</Hint>
              </div>
              <div>
                <Label>{t("discordLabel")}</Label>
                <input
                  type="url"
                  value={form.discordUrl}
                  onChange={(e) => set("discordUrl", e.target.value)}
                  placeholder={t("discordPlaceholder")}
                  style={inputStyle}
                />
                <Hint>{t("discordHint")}</Hint>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Startseite */}
      {activeTab === "startseite" && (
        <div style={{ border: "1px solid var(--dnd-border)", background: "var(--dnd-bg-card)" }}>
          <div className="px-4 py-2" style={{ background: "var(--dnd-red-dark)", borderBottom: "1px solid var(--dnd-border)" }}>
            <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "#FFFFFF" }}>{t("landingSection")}</h2>
          </div>
          <div className="px-5 py-5 space-y-5">
            <div>
              <Label>{t("landingTitleLabel")}</Label>
              <input
                type="text"
                value={form.landingTitle}
                onChange={(e) => set("landingTitle", e.target.value)}
                placeholder={t("landingTitlePlaceholder")}
                style={inputStyle}
              />
              <Hint>{t("landingTitleHint")}</Hint>
            </div>
            <div>
              <Label>{t("landingSubtitleLabel")}</Label>
              <input
                type="text"
                value={form.landingSubtitle}
                onChange={(e) => set("landingSubtitle", e.target.value)}
                placeholder={t("landingSubtitlePlaceholder")}
                style={inputStyle}
              />
              <Hint>{t("landingSubtitleHint")}</Hint>
            </div>
            <div>
              <Label>{t("landingBodyLabel")}</Label>
              <textarea
                value={form.landingBody}
                onChange={(e) => set("landingBody", e.target.value)}
                placeholder={t("landingBodyPlaceholder")}
                style={textareaStyle}
              />
              <Hint>{t("landingBodyHint")}</Hint>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Impressum */}
      {activeTab === "impressum" && (
        <div style={{ border: "1px solid var(--dnd-border)", background: "var(--dnd-bg-card)" }}>
          <div className="px-4 py-2" style={{ background: "var(--dnd-red-dark)", borderBottom: "1px solid var(--dnd-border)" }}>
            <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "#FFFFFF" }}>{t("impressumSection")}</h2>
          </div>
          <div className="px-5 py-5">
            <Label>{t("impressumLabel")}</Label>
            <textarea
              value={form.impressumContent}
              onChange={(e) => set("impressumContent", e.target.value)}
              placeholder={t("impressumPlaceholder")}
              style={textareaStyle}
            />
            <Hint>{t("impressumHint")}</Hint>
          </div>
        </div>
      )}

      {/* Tab: Datenschutz */}
      {activeTab === "datenschutz" && (
        <div style={{ border: "1px solid var(--dnd-border)", background: "var(--dnd-bg-card)" }}>
          <div className="px-4 py-2" style={{ background: "var(--dnd-red-dark)", borderBottom: "1px solid var(--dnd-border)" }}>
            <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "#FFFFFF" }}>{t("datenschutzSection")}</h2>
          </div>
          <div className="px-5 py-5">
            <Label>{t("datenschutzLabel")}</Label>
            <textarea
              value={form.datenschutzContent}
              onChange={(e) => set("datenschutzContent", e.target.value)}
              placeholder={t("datenschutzPlaceholder")}
              style={textareaStyle}
            />
            <Hint>{t("datenschutzHint")}</Hint>
          </div>
        </div>
      )}

      {/* Save bar */}
      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="ddb-cta"
          style={{ opacity: saving ? 0.6 : 1 }}
        >
          {saving ? t("saving") : t("save")}
        </button>
        {saved && (
          <span className="font-cinzel text-xs tracking-wide" style={{ color: "var(--dnd-red-light)" }}>
            {t("saved")}
          </span>
        )}
        {error && (
          <span className="font-cinzel text-xs tracking-wide" style={{ color: "#F87171" }}>
            ✕ {error}
          </span>
        )}
      </div>
    </div>
  );
}
