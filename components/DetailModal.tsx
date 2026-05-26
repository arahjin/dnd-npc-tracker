"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DetailModal({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  function close() { router.back(); }

  // Escape key closes modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  });

  // Prevent background scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <>
      {/* Backdrop — semi-transparent, shows the list page behind.
          z-indices are deliberately well above Leaflet's panes (which go up
          to 700 for popups) so map content can't bleed through the modal. */}
      <div
        className="fixed inset-0"
        style={{ background: "rgba(4, 0, 0, 0.78)", zIndex: 9000 }}
        onClick={close}
      />

      {/* Scrollable overlay layer */}
      <div className="fixed inset-0 overflow-y-auto" style={{ zIndex: 9001 }}>
        <div className="flex min-h-full items-start justify-center py-8 px-4">
          {/* Modal panel */}
          <div
            className="relative w-full max-w-5xl"
            style={{
              background: "var(--dnd-bg)",
              border: "1px solid var(--dnd-border)",
              boxShadow: "0 25px 60px rgba(0,0,0,0.8)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Signature top gradient */}
            <div style={{ height: "3px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-red) 30%, var(--dnd-gold) 50%, var(--dnd-red) 70%, var(--dnd-red-dark))" }} />
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
