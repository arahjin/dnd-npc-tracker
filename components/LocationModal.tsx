"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import LocationForm from "./LocationForm";

type LinkedItem = { id: string; name: string };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  id?: string;
  availableNpcs?: LinkedItem[];
  availableOrgs?: LinkedItem[];
  availableChars?: LinkedItem[];
  canSeePrivate?: boolean;
};

export default function LocationModal({ isOpen, onClose, title, id, availableNpcs, availableOrgs, availableChars, canSeePrivate }: Props) {
  const tc = useTranslations("common");
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.85)" }}>
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative mx-auto my-10 w-full max-w-2xl px-4 pb-10">
        <div style={{ background: "var(--dnd-bg)", border: "1px solid var(--dnd-border)" }}>
          <div style={{ background: "#0A0A0A", borderBottom: "1px solid #2A1A1A" }}>
            <div style={{ height: "3px", background: "linear-gradient(90deg, transparent, var(--dnd-red), var(--dnd-gold), var(--dnd-red), transparent)" }} />
            <div className="px-6 py-4 flex items-center justify-between">
              <h2 className="font-cinzel text-xl font-bold" style={{ color: "var(--dnd-heading)" }}>{title}</h2>
              <button onClick={onClose} className="font-cinzel text-xs tracking-widest px-3 py-1.5 transition-all"
                style={{ border: "1px solid var(--dnd-border)", color: "var(--dnd-text-muted)" }}>
                {tc("closeUpper")}
              </button>
            </div>
          </div>
          <div className="px-6 py-8">
            <LocationForm
              id={id}
              availableNpcs={availableNpcs}
              availableOrgs={availableOrgs}
              availableChars={availableChars}
              onSuccess={onClose}
              onCancel={onClose}
              canSeePrivate={canSeePrivate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
