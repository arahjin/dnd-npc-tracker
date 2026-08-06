"use client";

import { useTranslations } from "next-intl";
import type { ViewMode } from "@/lib/useViewMode";

type Props = {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
};

export default function ViewToggle({ value, onChange }: Props) {
  const t = useTranslations("view");

  const btnBase =
    "font-cinzel text-sm px-2.5 py-1.5 tracking-wide transition-colors flex items-center justify-center";

  const activeStyle = {
    background: "var(--dnd-gold)",
    color: "#0A0A0A",
  } as const;

  const inactiveStyle = {
    background: "var(--dnd-bg-card)",
    color: "var(--dnd-text-muted)",
  } as const;

  return (
    <div
      className="inline-flex"
      style={{ border: "1px solid var(--dnd-border)" }}
      role="group"
      aria-label={t("toggleLabel")}
    >
      <button
        type="button"
        onClick={() => onChange("grid")}
        aria-pressed={value === "grid"}
        aria-label={t("grid")}
        title={t("grid")}
        className={btnBase}
        style={value === "grid" ? activeStyle : inactiveStyle}
      >
        {/* Grid icon */}
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <rect x="1" y="1" width="6" height="6" />
          <rect x="9" y="1" width="6" height="6" />
          <rect x="1" y="9" width="6" height="6" />
          <rect x="9" y="9" width="6" height="6" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => onChange("list")}
        aria-pressed={value === "list"}
        aria-label={t("list")}
        title={t("list")}
        className={btnBase}
        style={{
          ...(value === "list" ? activeStyle : inactiveStyle),
          borderLeft: "1px solid var(--dnd-border)",
        }}
      >
        {/* List icon */}
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <rect x="1" y="2" width="14" height="2" />
          <rect x="1" y="7" width="14" height="2" />
          <rect x="1" y="12" width="14" height="2" />
        </svg>
      </button>
    </div>
  );
}
