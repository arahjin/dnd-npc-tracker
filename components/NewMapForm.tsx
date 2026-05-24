"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { upload } from "@vercel/blob/client";

const inputStyle: React.CSSProperties = {
  background: "#0A0A0A",
  border: "1px solid #2A2A2A",
  color: "var(--dnd-text)",
  fontFamily: "var(--font-roboto), sans-serif",
};
const labelStyle = "font-cinzel text-xs tracking-[0.15em] uppercase block mb-2";

type UploadedImage = { url: string; width: number; height: number };

export default function NewMapForm() {
  const t = useTranslations("karten");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const [name, setName] = useState("");
  const [beschreibung, setBeschreibung] = useState("");
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploadError("");
    setUploading(true);
    try {
      // Use Vercel Blob's client-upload pattern: file goes directly from the
      // browser to blob storage, bypassing Vercel's 4.5 MB serverless body limit.
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/maps/upload-token",
        contentType: file.type,
      });
      const url = blob.url;
      // Probe dimensions
      const dims = await new Promise<{ w: number; h: number }>((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = () => reject(new Error("Bild konnte nicht geladen werden."));
        img.src = url;
      });
      setImage({ url, width: dims.w, height: dims.h });
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Unbekannter Fehler.");
    } finally {
      setUploading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError(t("nameRequired"));
      return;
    }
    if (!image) {
      setError(t("imageRequired"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/maps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          beschreibung: beschreibung.trim() || null,
          imageUrl: image.url,
          imageWidth: image.width,
          imageHeight: image.height,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Fehler beim Erstellen.");
        setSubmitting(false);
        return;
      }
      router.push(`/karten/${data.id}`);
      router.refresh();
    } catch {
      setError("Netzwerkfehler.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-text-muted)" }}>
          {t("nameLabel")} <span style={{ color: "var(--dnd-red)" }}>*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("namePlaceholder")}
          className="w-full px-4 py-2.5 text-base outline-none"
          style={inputStyle}
          required
        />
      </div>

      <div>
        <label className={labelStyle} style={{ color: "var(--dnd-text-muted)" }}>
          {t("descLabel")}
        </label>
        <textarea
          value={beschreibung}
          onChange={(e) => setBeschreibung(e.target.value)}
          placeholder={t("descPlaceholder")}
          rows={3}
          className="w-full px-4 py-2.5 text-base outline-none resize-y"
          style={inputStyle}
        />
      </div>

      <div style={{ border: "1px solid #2A2A2A", background: "#0D0D0D" }}>
        <div
          className="px-4 py-2"
          style={{ borderBottom: "1px solid #2A2A2A", background: "var(--dnd-red-dark)" }}
        >
          <span
            className="font-cinzel text-xs tracking-[0.15em] uppercase"
            style={{ color: "var(--dnd-heading)" }}
          >
            {t("imageLabel")} <span style={{ color: "var(--dnd-red)" }}>*</span>
          </span>
        </div>
        <div className="p-4 space-y-3">
          {image && (
            <div
              className="relative w-full overflow-hidden"
              style={{ aspectRatio: "16 / 9", border: "1px solid #2A2A2A" }}
            >
              <Image src={image.url} alt="Vorschau" fill className="object-contain" />
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="ddb-cta"
          >
            {uploading ? tCommon("loading") : t("uploadImage")}
          </button>
          {image && (
            <p className="font-cinzel text-xs" style={{ color: "var(--dnd-text-muted)" }}>
              {image.width} × {image.height}
            </p>
          )}
          {uploadError && (
            <p className="text-xs" style={{ color: "#F87171" }}>
              {uploadError}
            </p>
          )}
        </div>
      </div>

      {error && (
        <p
          className="font-cinzel text-xs px-3 py-2"
          style={{ background: "#200D0D", border: "1px solid #7F1D1D", color: "#F87171" }}
        >
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={submitting} className="ddb-cta">
          {submitting ? t("creating") : t("createButton")}
        </button>
        <Link
          href="/karten"
          className="font-cinzel text-xs tracking-widest uppercase"
          style={{ color: "var(--dnd-text-muted)" }}
        >
          {t("cancel")}
        </Link>
      </div>
    </form>
  );
}
