"use client";

import { useState, useRef, useEffect } from "react";
import { MENTION_ICON, type MentionOption } from "@/lib/mentions";

interface Props {
  value: string;
  onChange: (value: string) => void;
  /** If omitted, options are fetched lazily from /api/tag-options on first "@" */
  tagOptions?: MentionOption[];
  rows?: number;
  placeholder?: string;
  required?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function MentionTextarea({
  value, onChange, tagOptions: propOptions,
  rows = 4, placeholder, required, className, style,
}: Props) {
  const [options, setOptions] = useState<MentionOption[]>(propOptions ?? []);
  const [optionsFetched, setOptionsFetched] = useState(!!propOptions);
  const [query, setQuery] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Keep options in sync if prop changes
  useEffect(() => {
    if (propOptions) { setOptions(propOptions); setOptionsFetched(true); }
  }, [propOptions]);

  async function ensureOptions() {
    if (optionsFetched) return;
    const res = await fetch("/api/tag-options");
    if (res.ok) setOptions(await res.json());
    setOptionsFetched(true);
  }

  const filtered = query !== null
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : [];

  function detectQuery(val: string, cursor: number) {
    const before = val.slice(0, cursor);
    // Match "@" followed by any chars except "@", "[", newline — i.e. an active mention being typed
    const match = before.match(/@([^@\[\n]*)$/);
    if (match) {
      setQuery(match[1]);
      setActiveIndex(0);
    } else {
      setQuery(null);
    }
  }

  async function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    const cursor = e.target.selectionStart ?? val.length;
    onChange(val);
    if (val.slice(0, cursor).includes("@")) {
      await ensureOptions();
      detectQuery(val, cursor);
    } else {
      setQuery(null);
    }
  }

  function insertMention(opt: MentionOption) {
    const el = textareaRef.current;
    const cursor = el?.selectionStart ?? value.length;
    const before = value.slice(0, cursor);
    const after = value.slice(cursor);
    const newBefore = before.replace(/@([^@\[\n]*)$/, `@[${opt.label}](${opt.typ}:${opt.id}) `);
    const newValue = newBefore + after;
    onChange(newValue);
    setQuery(null);
    // Restore focus + cursor
    setTimeout(() => {
      if (el) {
        el.focus();
        const pos = newBefore.length;
        el.setSelectionRange(pos, pos);
      }
    }, 0);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (query === null || filtered.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      insertMention(filtered[activeIndex]);
    } else if (e.key === "Escape") {
      setQuery(null);
    }
  }

  function handleClick(e: React.MouseEvent<HTMLTextAreaElement>) {
    const cursor = (e.target as HTMLTextAreaElement).selectionStart ?? value.length;
    detectQuery(value, cursor);
  }

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        rows={rows}
        placeholder={placeholder}
        required={required}
        className={className}
        style={style}
      />
      {query !== null && filtered.length > 0 && (
        <div className="absolute left-0 right-0 z-30 shadow-xl"
          style={{ background: "#0E0E0E", border: "1px solid #2A2A2A", maxHeight: "220px", overflowY: "auto" }}>
          <div className="px-3 py-1.5" style={{ borderBottom: "1px solid #1A1A1A" }}>
            <span className="font-cinzel text-xs" style={{ color: "var(--dnd-text-muted)" }}>
              @ Erwähnung einfügen
            </span>
          </div>
          {filtered.map((opt, i) => (
            <button key={opt.id} type="button"
              onMouseDown={(e) => { e.preventDefault(); insertMention(opt); }}
              className="w-full text-left px-4 py-2 font-cinzel text-xs flex items-center gap-2 transition-colors"
              style={{
                background: i === activeIndex ? "#1A1A1A" : "transparent",
                color: "var(--dnd-text)",
                borderBottom: "1px solid #141414",
              }}
              onMouseEnter={() => setActiveIndex(i)}>
              <span style={{ color: "var(--dnd-text-muted)" }}>{MENTION_ICON[opt.typ]}</span>
              {opt.label}
              <span className="ml-auto font-cinzel text-xs opacity-40">{opt.typ}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
