"use client";

import { useRef } from "react";
import BBCodeToolbar from "@/components/BBCodeToolbar";

type Props = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange" | "value"> & {
  value: string;
  onChange: (next: string) => void;
};

/** Plain <textarea> wrapped with a BBCodeToolbar that injects tags around the
 *  current selection (or at the cursor). Use this anywhere we don't need
 *  @-mention auto-complete (e.g. quest summary / gm-notes). */
export default function BBTextarea({ value, onChange, style, ...rest }: Props) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  function insert(open: string, close?: string) {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.substring(start, end);
    const inserted = close ? `${open}${selected}${close}` : open;
    const next = value.substring(0, start) + inserted + value.substring(end);
    onChange(next);
    // Restore focus + place selection inside the wrap so the user can type
    // immediately. requestAnimationFrame waits for the controlled value update
    // to be flushed.
    requestAnimationFrame(() => {
      el.focus();
      const newStart = start + open.length;
      const newEnd = newStart + selected.length;
      el.setSelectionRange(newStart, newEnd);
    });
  }

  return (
    <div>
      <BBCodeToolbar onInsert={insert} compact />
      <textarea
        {...rest}
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={style}
      />
    </div>
  );
}
