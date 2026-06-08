"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

type Props = {
  /** Called when the user clicks a button. `close` is omitted for self-closing
   *  tags ([hr]) and when the toolbar is inserting a complete snippet (list). */
  onInsert: (open: string, close?: string) => void;
  /** Slight density variant for compact textareas (e.g. quest summary). */
  compact?: boolean;
};

// Predefined colors (must stay in sync with lib/bbcode.ts color whitelist).
const COLOR_OPTIONS: { key: string; hex: string }[] = [
  { key: "gold",   hex: "#C9A84C" },
  { key: "red",    hex: "#DC2626" },
  { key: "orange", hex: "#EA580C" },
  { key: "green",  hex: "#16A34A" },
  { key: "blue",   hex: "#2563EB" },
  { key: "purple", hex: "#9333EA" },
];

export default function BBCodeToolbar({ onInsert, compact = false }: Props) {
  const t = useTranslations("bbcode");
  const [colorOpen, setColorOpen] = useState(false);
  const [headingOpen, setHeadingOpen] = useState(false);
  const colorRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click.
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (colorRef.current && !colorRef.current.contains(target)) setColorOpen(false);
      if (headingRef.current && !headingRef.current.contains(target)) setHeadingOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function handleLink() {
    const url = window.prompt(t("linkPrompt"), "https://");
    if (!url) return;
    // Basic protocol guard — same as the parser allowlist.
    if (!/^https?:\/\//i.test(url)) {
      window.alert(t("linkInvalid"));
      return;
    }
    onInsert(`[url=${url}]`, "[/url]");
  }

  const btnPadding = compact ? "6px 8px" : "6px 10px";
  const btnFontSize = compact ? "0.82rem" : "0.88rem";

  const btnStyle: React.CSSProperties = {
    background: "#0E0E0E",
    border: "1px solid #2A2A2A",
    color: "#C8B8A8",
    cursor: "pointer",
    padding: btnPadding,
    fontSize: btnFontSize,
    lineHeight: 1,
    fontFamily: "var(--font-cinzel), serif",
    transition: "all 120ms",
    height: compact ? 28 : 32,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: compact ? 28 : 32,
  };

  const Button = ({
    title,
    onClick,
    children,
    style,
  }: {
    title: string;
    onClick: () => void;
    children: React.ReactNode;
    style?: React.CSSProperties;
  }) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{ ...btnStyle, ...style }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--dnd-gold)";
        e.currentTarget.style.color = "#F5EDD6";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#2A2A2A";
        e.currentTarget.style.color = "#C8B8A8";
      }}
    >
      {children}
    </button>
  );

  const Divider = () => (
    <span style={{ width: 1, height: compact ? 18 : 22, background: "#2A2A2A", margin: "0 2px" }} />
  );

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 4,
        padding: compact ? "4px 6px" : "6px 8px",
        background: "#111",
        border: "1px solid #2A2A2A",
        borderBottom: "none",
      }}
    >
      <Button title={t("bold")} onClick={() => onInsert("[b]", "[/b]")}>
        <strong>B</strong>
      </Button>
      <Button title={t("italic")} onClick={() => onInsert("[i]", "[/i]")}>
        <em>I</em>
      </Button>
      <Button title={t("underline")} onClick={() => onInsert("[u]", "[/u]")}>
        <span style={{ textDecoration: "underline" }}>U</span>
      </Button>
      <Button title={t("strike")} onClick={() => onInsert("[s]", "[/s]")}>
        <span style={{ textDecoration: "line-through" }}>S</span>
      </Button>

      <Divider />

      {/* Color dropdown */}
      <div ref={colorRef} style={{ position: "relative" }}>
        <Button title={t("color")} onClick={() => { setColorOpen((v) => !v); setHeadingOpen(false); }}>
          <span style={{ color: "var(--dnd-gold)", fontWeight: 700 }}>A</span>
          <span style={{ marginLeft: 4, fontSize: "0.6rem", opacity: 0.6 }}>▾</span>
        </Button>
        {colorOpen && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              marginTop: 2,
              padding: 6,
              background: "#111",
              border: "1px solid #2A2A2A",
              boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
              zIndex: 30,
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 4,
            }}
          >
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c.key}
                type="button"
                title={c.key}
                onClick={() => {
                  setColorOpen(false);
                  onInsert(`[color=${c.key}]`, "[/color]");
                }}
                style={{
                  width: 28,
                  height: 22,
                  background: c.hex,
                  border: "1px solid #2A2A2A",
                  cursor: "pointer",
                  padding: 0,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Heading dropdown */}
      <div ref={headingRef} style={{ position: "relative" }}>
        <Button title={t("heading")} onClick={() => { setHeadingOpen((v) => !v); setColorOpen(false); }}>
          H<span style={{ marginLeft: 4, fontSize: "0.6rem", opacity: 0.6 }}>▾</span>
        </Button>
        {headingOpen && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              marginTop: 2,
              background: "#111",
              border: "1px solid #2A2A2A",
              boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
              zIndex: 30,
              minWidth: 110,
            }}
          >
            {[1, 2, 3].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => {
                  setHeadingOpen(false);
                  onInsert(`[h${lvl}]`, `[/h${lvl}]`);
                }}
                className="font-cinzel"
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  background: "transparent",
                  border: "none",
                  color: "#C8B8A8",
                  padding: "8px 12px",
                  fontSize: lvl === 1 ? "1rem" : lvl === 2 ? "0.92rem" : "0.84rem",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#1A1A1A")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                H{lvl} · {t("heading")} {lvl}
              </button>
            ))}
          </div>
        )}
      </div>

      <Divider />

      <Button title={t("list")} onClick={() => onInsert("[list]\n[*] ", "\n[/list]")}>
        <span style={{ fontSize: "0.82em" }}>☰</span>
      </Button>
      <Button title={t("quote")} onClick={() => onInsert("[quote]", "[/quote]")}>
        <span style={{ fontFamily: "Georgia, serif", fontSize: "1.05em" }}>"</span>
      </Button>
      <Button title={t("code")} onClick={() => onInsert("[code]", "[/code]")}>
        <span style={{ fontFamily: "monospace", fontSize: "0.78em" }}>{"<>"}</span>
      </Button>
      <Button title={t("link")} onClick={handleLink}>
        🔗
      </Button>

      <Divider />

      <Button title={t("hr")} onClick={() => onInsert("[hr]")}>
        —
      </Button>
    </div>
  );
}
