"use client";

import { useEffect } from "react";
import CharakterForm from "./CharakterForm";

type OrgMembership = { organisationId: string; rolle: string };

type Props = {
  isOpen: boolean; onClose: () => void; title: string;
  id?: string;
  availableOrgs?: { id: string; name: string }[];
  initialOrgs?: OrgMembership[];
  availableLocations?: { id: string; name: string }[];
  initial?: Record<string, string>;
};

export default function CharakterModal({ isOpen, onClose, title, id, availableOrgs, initialOrgs, availableLocations, initial }: Props) {
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto" style={{ background: "rgba(0,0,0,0.85)" }}>
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative mx-auto my-10 w-full max-w-2xl px-4 pb-10">
        <div style={{ background: "var(--dnd-bg)", border: "1px solid var(--dnd-border)" }}>
          <div style={{ background: "#0A0A0A", borderBottom: "1px solid #2A1A1A" }}>
            <div style={{ height: "3px", background: "linear-gradient(90deg, transparent, var(--dnd-red), var(--dnd-gold), var(--dnd-red), transparent)" }} />
            <div className="px-6 py-4 flex items-center justify-between">
              <h2 className="font-cinzel text-xl font-bold" style={{ color: "var(--dnd-heading)" }}>{title}</h2>
              <button onClick={onClose} className="font-cinzel text-xs tracking-widest px-3 py-1.5 transition-all"
                style={{ border: "1px solid var(--dnd-border)", color: "var(--dnd-text-muted)" }}>✕ SCHLIESSEN</button>
            </div>
          </div>
          <div className="px-6 py-8">
            <CharakterForm id={id} availableOrgs={availableOrgs} initialOrgs={initialOrgs} availableLocations={availableLocations} initial={initial} onSuccess={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
}
