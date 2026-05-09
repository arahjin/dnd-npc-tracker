"use client";

import { useState } from "react";

type Settings = {
  copyrightText: string;
  kontaktEmail: string;
  impressumContent: string;
  datenschutzContent: string;
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  background: "var(--dnd-bg)",
  border: "1px solid var(--dnd-border)",
  color: "var(--dnd-text)",
  fontFamily: "'Roboto', sans-serif",
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
  const [activeTab, setActiveTab] = useState<"allgemein" | "impressum" | "datenschutz">("allgemein");

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
      if (!res.ok) throw new Error((await res.json()).error ?? "Fehler");
      setSaved(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
    } finally {
      setSaving(false);
    }
  }

  const tabStyle = (tab: string): React.CSSProperties => ({
    fontFamily: "'Oswald', sans-serif",
    fontSize: "0.7rem",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
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
        <button style={tabStyle("allgemein")} onClick={() => setActiveTab("allgemein")}>Allgemein</button>
        <button style={tabStyle("impressum")} onClick={() => setActiveTab("impressum")}>Impressum</button>
        <button style={tabStyle("datenschutz")} onClick={() => setActiveTab("datenschutz")}>Datenschutz</button>
      </div>

      {/* Tab: Allgemein */}
      {activeTab === "allgemein" && (
        <div className="space-y-6">
          <div style={{ border: "1px solid var(--dnd-border)", background: "var(--dnd-bg-card)" }}>
            <div className="px-4 py-2" style={{ background: "var(--dnd-red-dark)", borderBottom: "1px solid var(--dnd-border)" }}>
              <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "#FFFFFF" }}>Footer-Einstellungen</h2>
            </div>
            <div className="px-5 py-5 space-y-5">
              <div>
                <Label>Copyright-Text</Label>
                <input
                  type="text"
                  value={form.copyrightText}
                  onChange={(e) => set("copyrightText", e.target.value)}
                  placeholder="© 2025 Meine Organisation. Alle Rechte vorbehalten."
                  style={inputStyle}
                />
                <Hint>Wird im Footer links angezeigt.</Hint>
              </div>
              <div>
                <Label>Kontakt-E-Mail</Label>
                <input
                  type="email"
                  value={form.kontaktEmail}
                  onChange={(e) => set("kontaktEmail", e.target.value)}
                  placeholder="kontakt@beispiel.de"
                  style={inputStyle}
                />
                <Hint>Wird als mailto-Link im Footer angezeigt. Leer lassen = kein Kontakt-Link.</Hint>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Impressum */}
      {activeTab === "impressum" && (
        <div style={{ border: "1px solid var(--dnd-border)", background: "var(--dnd-bg-card)" }}>
          <div className="px-4 py-2" style={{ background: "var(--dnd-red-dark)", borderBottom: "1px solid var(--dnd-border)" }}>
            <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "#FFFFFF" }}>Impressum-Inhalt</h2>
          </div>
          <div className="px-5 py-5">
            <Label>Text (Pflichtangaben gemäß § 5 TMG)</Label>
            <textarea
              value={form.impressumContent}
              onChange={(e) => set("impressumContent", e.target.value)}
              placeholder={"Name / Organisation\nStraße Hausnummer\nPLZ Ort\n\nTelefon: +49 ...\nE-Mail: ...\n\nVerantwortlich für den Inhalt nach § 55 Abs. 2 RStV:\nVor- und Nachname, Anschrift"}
              style={textareaStyle}
            />
            <Hint>Leerzeile = neuer Absatz. Einfache Zeilenumbrüche bleiben erhalten.</Hint>
          </div>
        </div>
      )}

      {/* Tab: Datenschutz */}
      {activeTab === "datenschutz" && (
        <div style={{ border: "1px solid var(--dnd-border)", background: "var(--dnd-bg-card)" }}>
          <div className="px-4 py-2" style={{ background: "var(--dnd-red-dark)", borderBottom: "1px solid var(--dnd-border)" }}>
            <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "#FFFFFF" }}>Datenschutzerklärung-Inhalt</h2>
          </div>
          <div className="px-5 py-5">
            <Label>Text (DSGVO-konform)</Label>
            <textarea
              value={form.datenschutzContent}
              onChange={(e) => set("datenschutzContent", e.target.value)}
              placeholder={"1. Datenschutz auf einen Blick\n\nDiese Website erhebt und verarbeitet personenbezogene Daten nur im Rahmen der gesetzlichen Bestimmungen...\n\n2. Verantwortliche Stelle\n\nName und Kontaktdaten des Verantwortlichen..."}
              style={textareaStyle}
            />
            <Hint>Leerzeile = neuer Absatz. Einfache Zeilenumbrüche bleiben erhalten.</Hint>
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
          {saving ? "Speichert…" : "Speichern"}
        </button>
        {saved && (
          <span className="font-cinzel text-xs tracking-wide" style={{ color: "var(--dnd-red-light)" }}>
            ✓ Gespeichert
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
