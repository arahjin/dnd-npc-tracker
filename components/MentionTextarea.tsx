"use client";

import { useState, useRef, useEffect } from "react";
import { MENTION_ICON, MENTION_REGEX, type MentionOption } from "@/lib/mentions";

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

// ── Chip factory ─────────────────────────────────────────────────────────────

function mkChip(label: string, typ: string, id: string): HTMLSpanElement {
  const s = document.createElement("span");
  s.dataset.mention = "true";
  s.dataset.label   = label;
  s.dataset.typ     = typ;
  s.dataset.id      = id;
  s.contentEditable = "false";
  s.textContent     = `${MENTION_ICON[typ] ?? ""}${label}`;
  s.style.cssText   =
    "background:#1A0A0A;border:1px solid #7F1D1D;color:#FCA5A5;" +
    "padding:1px 6px;border-radius:2px;font-size:0.82em;" +
    "font-family:'Cinzel',serif;cursor:default;user-select:none;white-space:nowrap;";
  return s;
}

// ── Serialize DOM → storage string ───────────────────────────────────────────

function serialize(el: HTMLElement): string {
  // Lone <br> = visually empty editor
  if (
    el.childNodes.length === 1 &&
    (el.childNodes[0] as HTMLElement).tagName === "BR"
  ) return "";

  let out = "";
  el.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      out += node.textContent ?? "";
    } else {
      const e = node as HTMLElement;
      if (e.dataset.mention === "true") {
        out += `@[${e.dataset.label}](${e.dataset.typ}:${e.dataset.id})`;
      } else if (e.tagName === "BR") {
        out += "\n";
      } else if (e.tagName === "DIV" || e.tagName === "P") {
        out += "\n" + serialize(e);
      } else {
        out += serialize(e);
      }
    }
  });
  return out;
}

// ── Hydrate storage string → DOM ─────────────────────────────────────────────

const MENTION_RE = new RegExp(MENTION_REGEX.source, "g");

function hydrate(el: HTMLElement, text: string) {
  el.innerHTML = "";
  if (!text) return;
  let last = 0;
  for (const m of text.matchAll(MENTION_RE)) {
    const before = text.slice(last, m.index);
    if (before) injectText(el, before);
    el.appendChild(mkChip(m[1], m[2], m[3]));
    el.appendChild(document.createTextNode(" "));
    last = m.index! + m[0].length;
  }
  const tail = text.slice(last);
  if (tail) injectText(el, tail);
}

function injectText(el: HTMLElement, text: string) {
  text.split("\n").forEach((line, i) => {
    if (i > 0) el.appendChild(document.createElement("br"));
    if (line) el.appendChild(document.createTextNode(line));
  });
}

// ── Cursor helpers ────────────────────────────────────────────────────────────

function textBeforeCursor(el: HTMLElement): string {
  const sel = window.getSelection();
  if (!sel?.rangeCount) return "";
  const r = sel.getRangeAt(0).cloneRange();
  r.collapse(true);
  const pre = document.createRange();
  pre.selectNodeContents(el);
  pre.setEnd(r.startContainer, r.startOffset);
  return pre.toString();
}

function insertChipAtCursor(el: HTMLElement, opt: MentionOption): boolean {
  const sel = window.getSelection();
  if (!sel?.rangeCount) return false;
  const range = sel.getRangeAt(0);
  let container = range.startContainer;
  let offset    = range.startOffset;

  // If cursor is inside an element node, look for the preceding text node
  if (container.nodeType !== Node.TEXT_NODE) {
    const elem = container as Element;
    if (offset > 0 && elem.childNodes[offset - 1]?.nodeType === Node.TEXT_NODE) {
      container = elem.childNodes[offset - 1];
      offset    = (container as Text).length;
    } else {
      return false;
    }
  }

  const textNode  = container as Text;
  const full      = textNode.textContent ?? "";
  const before    = full.slice(0, offset);
  const match     = before.match(/@([^@\[\n]*)$/);
  if (!match) return false;

  const atIdx = offset - match[0].length;
  const parent = textNode.parentNode!;
  const next   = textNode.nextSibling;
  const after  = full.slice(offset);

  // Trim text node to before the "@"
  textNode.textContent = full.slice(0, atIdx);

  // Insert chip + trailing space
  const chip  = mkChip(opt.label, opt.typ, opt.id);
  const space = document.createTextNode(" ");
  parent.insertBefore(chip,  next);
  parent.insertBefore(space, chip.nextSibling);
  if (after) parent.insertBefore(document.createTextNode(after), space.nextSibling);

  // Move cursor after the space
  const nr = document.createRange();
  nr.setStartAfter(space);
  nr.collapse(true);
  sel.removeAllRanges();
  sel.addRange(nr);
  return true;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MentionTextarea({
  value, onChange, tagOptions: propOptions,
  rows = 4, placeholder, required, className, style,
}: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastVal   = useRef<string | null>(null);

  const [options, setOptions] = useState<MentionOption[]>(propOptions ?? []);
  const [fetched, setFetched] = useState(!!propOptions);
  const [query,   setQuery]   = useState<string | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  // Keep external prop options in sync
  useEffect(() => {
    if (propOptions) { setOptions(propOptions); setFetched(true); }
  }, [propOptions]);

  // Hydrate editor when value changes externally
  useEffect(() => {
    const el = editorRef.current;
    if (!el || value === lastVal.current) return;
    lastVal.current = value;
    hydrate(el, value);
  }, [value]);

  async function ensureOptions() {
    if (fetched) return;
    const res = await fetch("/api/tag-options");
    if (res.ok) setOptions(await res.json());
    setFetched(true);
  }

  const filtered = query !== null
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : [];

  function syncValue() {
    const el = editorRef.current;
    if (!el) return;
    const v = serialize(el);
    lastVal.current = v;
    onChange(v);
  }

  function handleInput() {
    const el = editorRef.current;
    if (!el) return;
    syncValue();
    const before = textBeforeCursor(el);
    const m = before.match(/@([^@\[\n]*)$/);
    if (m) { setQuery(m[1]); setActiveIdx(0); ensureOptions(); }
    else setQuery(null);
  }

  function insertMention(opt: MentionOption) {
    const el = editorRef.current;
    if (!el) return;
    insertChipAtCursor(el, opt);
    setQuery(null);
    requestAnimationFrame(() => { syncValue(); el.focus(); });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter") {
      if (query !== null && filtered.length > 0) {
        e.preventDefault();
        insertMention(filtered[activeIdx]);
        return;
      }
      // Insert <br> instead of <div> so serialization stays simple
      e.preventDefault();
      document.execCommand("insertLineBreak");
      syncValue();
      return;
    }
    if (query === null || filtered.length === 0) return;
    if (e.key === "ArrowDown")  { e.preventDefault(); setActiveIdx((i) => (i + 1) % filtered.length); }
    else if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIdx((i) => (i - 1 + filtered.length) % filtered.length); }
    else if (e.key === "Tab")       { e.preventDefault(); insertMention(filtered[activeIdx]); }
    else if (e.key === "Escape")    { setQuery(null); }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    handleInput();
  }

  function handleClick() {
    const el = editorRef.current;
    if (!el) return;
    const m = textBeforeCursor(el).match(/@([^@\[\n]*)$/);
    setQuery(m ? m[1] : null);
  }

  return (
    <div className="relative">
      {/* Contenteditable editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onClick={handleClick}
        className={className}
        style={{
          ...style,
          minHeight: `${rows * 1.65}em`,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
        role="textbox"
        aria-multiline="true"
        aria-required={required}
      />

      {/* Placeholder overlay */}
      {!value && placeholder && (
        <div
          className="absolute top-0 left-0 pointer-events-none px-4 py-2.5 text-base"
          style={{ color: "#4A4540", fontFamily: "'Roboto', sans-serif" }}
        >
          {placeholder}
        </div>
      )}

      {/* Hidden input for native required validation */}
      {required && (
        <input
          tabIndex={-1}
          required
          value={value}
          onChange={() => {}}
          style={{ position: "absolute", opacity: 0, height: 0, width: 0, pointerEvents: "none" }}
        />
      )}

      {/* Mention dropdown */}
      {query !== null && filtered.length > 0 && (
        <div
          className="absolute left-0 right-0 z-30 shadow-xl"
          style={{ top: "100%", background: "#0E0E0E", border: "1px solid #2A2A2A", maxHeight: "220px", overflowY: "auto" }}
        >
          <div className="px-3 py-1.5" style={{ borderBottom: "1px solid #1A1A1A" }}>
            <span className="font-cinzel text-xs" style={{ color: "var(--dnd-text-muted)" }}>
              @ Erwähnung einfügen
            </span>
          </div>
          {filtered.map((opt, i) => (
            <button
              key={opt.id}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); insertMention(opt); }}
              className="w-full text-left px-4 py-2 font-cinzel text-xs flex items-center gap-2 transition-colors"
              style={{
                background: i === activeIdx ? "#1A1A1A" : "transparent",
                color: "var(--dnd-text)",
                borderBottom: "1px solid #141414",
              }}
              onMouseEnter={() => setActiveIdx(i)}
            >
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
