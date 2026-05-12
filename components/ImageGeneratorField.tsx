"use client";

import { useRef, useState } from "react";
import Image from "next/image";

type Kind = "character" | "location" | "organisation";

type Props = {
  value: string;
  onChange: (url: string) => void;
  /** Determines the DALL-E prompt template used server-side. */
  kind: Kind;
  /** Section heading shown above the URL input. */
  label: string;
  /** Placeholder hint for the generator prompt input. */
  generatorPlaceholder?: string;
};

const KIND_HINT: Record<Kind, string> = {
  character:    "DALL-E 3 zeichnet deinen Charakter…",
  location:     "DALL-E 3 zeichnet deine Location…",
  organisation: "DALL-E 3 zeichnet das Wappen…",
};

const inputClass = "w-full px-4 py-2.5 text-base outline-none transition-colors";
const inputStyle = { background: "#0A0A0A", border: "1px solid #2A2A2A", color: "var(--dnd-text)", fontFamily: "var(--font-roboto), sans-serif" };
const labelStyle = "font-cinzel text-xs tracking-[0.15em] uppercase block mb-2";
const divider = (text: string) => (
  <div className="flex items-center gap-3">
    <div className="h-px flex-1" style={{ background: "#2A2A2A" }} />
    <span className="font-cinzel text-xs" style={{ color: "var(--dnd-text-muted)" }}>{text}</span>
    <div className="h-px flex-1" style={{ background: "#2A2A2A" }} />
  </div>
);

export default function ImageGeneratorField({ value, onChange, kind, label, generatorPlaceholder }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState("");
  const [genError, setGenError] = useState("");

  async function handleUpload(file: File) {
    setUploading(true);
    setUploadError("");

    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/upload-image", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);

    if (!res.ok) {
      setUploadError(data.error ?? "Upload fehlgeschlagen.");
      return;
    }
    onChange(data.url);
  }

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setGenerating(true);
    setGenError("");
    setGenerated("");

    const res = await fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, kind }),
    });
    const data = await res.json();
    setGenerating(false);

    if (!res.ok) {
      setGenError(data.error ?? "Fehler beim Generieren.");
      return;
    }
    setGenerated(data.url);
  }

  function accept() {
    onChange(generated);
    setGenerated("");
    setPrompt("");
  }

  return (
    <div style={{ border: "1px solid #2A2A2A", background: "#0D0D0D" }}>
      <div className="px-4 py-2 flex items-center gap-2" style={{ borderBottom: "1px solid #2A2A2A", background: "var(--dnd-red-dark)" }}>
        <span className="font-cinzel text-xs tracking-[0.15em] uppercase" style={{ color: "var(--dnd-heading)" }}>
          {label}
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* URL input */}
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-text-muted)" }}>Bild-URL (optional)</label>
          <input type="url" value={value} onChange={(e) => onChange(e.target.value)}
            placeholder="https://..." className={inputClass} style={inputStyle} />
        </div>

        {/* Preview */}
        {value && (
          <div className="flex items-start gap-3">
            <div className="relative w-32 h-32 overflow-hidden shrink-0" style={{ border: "1px solid var(--dnd-border)" }}>
              <Image src={value} alt="Vorschau" fill sizes="128px" className="object-cover" />
            </div>
            <button type="button" onClick={() => onChange("")}
              className="font-cinzel text-xs tracking-wide px-3 py-1.5 transition-all"
              style={{ border: "1px solid #2A2A2A", color: "var(--dnd-text-muted)" }}>
              ✕ Entfernen
            </button>
          </div>
        )}

        {/* Upload */}
        {divider("oder hochladen")}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
              e.target.value = "";
            }}
          />
          <button type="button" onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="font-cinzel text-xs tracking-widest px-4 py-2.5 transition-all disabled:opacity-40"
            style={{ border: "1px solid #2A2A2A", color: "var(--dnd-text-muted)" }}>
            {uploading ? "⏳ Wird hochgeladen…" : "↑ DATEI WÄHLEN"}
          </button>
          <p className="mt-1 text-xs" style={{ color: "var(--dnd-text-muted)", fontFamily: "var(--font-roboto), sans-serif" }}>
            JPG, PNG, WebP, GIF · max. 5 MB
          </p>
          {uploadError && <p className="mt-2 text-xs" style={{ color: "#F87171" }}>{uploadError}</p>}
        </div>

        {/* DALL-E */}
        {divider("oder mit KI generieren")}
        <div>
          <label className={labelStyle} style={{ color: "var(--dnd-text-muted)" }}>Beschreibung für DALL-E 3</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleGenerate())}
              placeholder={generatorPlaceholder}
              className={inputClass + " flex-1"}
              style={inputStyle}
            />
            <button type="button" onClick={handleGenerate}
              disabled={generating || !prompt.trim()}
              className="font-cinzel text-xs tracking-widest px-4 py-2.5 transition-all disabled:opacity-40 shrink-0"
              style={{ background: "var(--dnd-gold)", color: "#0A0A0A", border: "1px solid #A07830" }}>
              {generating ? "..." : "GENERIEREN"}
            </button>
          </div>
          {generating && (
            <p className="mt-2 font-cinzel text-xs tracking-wide" style={{ color: "var(--dnd-gold)" }}>
              ✦ {KIND_HINT[kind]} (ca. 10 Sekunden)
            </p>
          )}
          {genError && <p className="mt-2 text-xs" style={{ color: "#F87171" }}>{genError}</p>}
        </div>

        {generated && (
          <div className="space-y-3">
            <div className="relative w-full aspect-square overflow-hidden" style={{ border: "1px solid var(--dnd-gold)", maxWidth: "300px" }}>
              <Image src={generated} alt="Generiertes Bild" fill sizes="300px" className="object-cover" />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={accept}
                className="font-cinzel text-xs tracking-widest px-4 py-2 transition-all"
                style={{ background: "var(--dnd-red)", color: "#F5EDD6", border: "1px solid var(--dnd-red-dark)" }}>
                ✓ ÜBERNEHMEN
              </button>
              <button type="button" onClick={handleGenerate}
                className="font-cinzel text-xs tracking-widest px-4 py-2 transition-all"
                style={{ border: "1px solid #2A2A2A", color: "var(--dnd-text-muted)" }}>
                ↺ NEU GENERIEREN
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
