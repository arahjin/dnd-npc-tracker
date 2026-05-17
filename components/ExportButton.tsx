"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function ExportButton() {
  const t = useTranslations("dmExport");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleExport() {
    setLoading(true);
    setError("");

    const res = await fetch("/api/kampagnen/export");
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? t("error"));
      setLoading(false);
      return;
    }

    const disposition = res.headers.get("Content-Disposition") ?? "";
    const match = disposition.match(/filename="([^"]+)"/);
    const filename = match?.[1] ?? "lorehub-export.json";

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    setLoading(false);
  }

  return (
    <div>
      <button
        onClick={handleExport}
        disabled={loading}
        className="ddb-cta disabled:opacity-50"
        style={{ padding: "12px 32px", fontSize: "0.8rem" }}>
        {loading ? t("loading") : t("button")}
      </button>
      {error && <p className="mt-3 text-sm" style={{ color: "#F87171" }}>{error}</p>}
    </div>
  );
}
