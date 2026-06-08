"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

/** Compact, collapsible BB-Code reference shown beneath rich-text fields. */
export default function BBCodeHelp() {
  const t = useTranslations("bbcode");
  const [open, setOpen] = useState(false);

  const tagStyle: React.CSSProperties = {
    fontFamily: "var(--font-mono, ui-monospace), monospace",
    background: "#1A1A1A",
    border: "1px solid #2A2A2A",
    padding: "1px 4px",
    color: "var(--dnd-gold)",
  };

  const rows: Array<{ tag: React.ReactNode; label: string }> = [
    { tag: "[b]…[/b]",                              label: t("bold") },
    { tag: "[i]…[/i]",                              label: t("italic") },
    { tag: "[u]…[/u]",                              label: t("underline") },
    { tag: "[s]…[/s]",                              label: t("strike") },
    { tag: "[color=gold]…[/color]",                 label: `${t("color")} (red, gold, blue, green, purple, orange, #RRGGBB)` },
    { tag: "[url=https://…]…[/url]",                label: t("link") },
    { tag: "[quote]…[/quote]",                      label: t("quote") },
    { tag: "[code]…[/code]",                        label: t("code") },
    { tag: "[list][*]…[*]…[/list]",                 label: t("list") },
    { tag: "[h1]…[/h1] · [h2]…[/h2] · [h3]…[/h3]", label: t("heading") },
    { tag: "[hr]",                                  label: t("hr") },
  ];

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="font-cinzel text-xs tracking-wide hover:underline"
        style={{ color: "var(--dnd-text-muted)" }}
        aria-expanded={open}
      >
        {open ? `${t("helpHide")} ▴` : `${t("helpToggle")} ▾`}
      </button>

      {open && (
        <div
          className="mt-2 p-3 text-xs"
          style={{
            background: "#0D0D0D",
            border: "1px solid var(--dnd-border)",
            color: "var(--dnd-text-muted)",
          }}
        >
          <div
            className="font-cinzel tracking-wide mb-2 text-xs uppercase"
            style={{ color: "var(--dnd-heading)" }}
          >
            {t("helpTitle")}
          </div>
          <ul className="space-y-1 list-none m-0 p-0">
            {rows.map((row, i) => (
              <li key={i} className="flex flex-wrap items-baseline gap-2">
                <code style={tagStyle}>{row.tag}</code>
                <span>{row.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
