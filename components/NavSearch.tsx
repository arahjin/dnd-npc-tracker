"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function NavSearch({ compact }: { compact?: boolean }) {
  const t = useTranslations("common");
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/suche?q=${encodeURIComponent(q)}`);
  }

  const baseWidth = compact ? 110 : 180;
  const focusWidth = compact ? 150 : 220;

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", alignItems: "center" }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("searchPlaceholder")}
        className="font-cinzel"
        style={{
          background: "#1A1A1A",
          border: "1px solid #333",
          borderRadius: "2px",
          color: "#D8D0C8",
          fontSize: "0.7rem",
          letterSpacing: "0.06em",
          padding: compact ? "6px 10px" : "6px 12px",
          width: `${baseWidth}px`,
          outline: "none",
          transition: "border-color 0.15s, width 0.2s",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "var(--dnd-red)";
          e.target.style.width = `${focusWidth}px`;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#333";
          e.target.style.width = `${baseWidth}px`;
        }}
      />
    </form>
  );
}
