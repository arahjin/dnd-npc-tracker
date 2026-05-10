"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconSword } from "@/components/Icons";

type Kampagne = { id: string; name: string };

type Props = {
  aktiveId: string;
  aktiveKampagne: string;
  kampagnen: Kampagne[];
};

export default function KampagneSelector({ aktiveId, aktiveKampagne, kampagnen }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  async function switchTo(id: string) {
    if (id === aktiveId) { setOpen(false); return; }
    setSwitching(true);
    await fetch(`/api/kampagnen/${id}/aktiv`, { method: "POST" });
    router.push("/npc");
    router.refresh();
    setOpen(false);
    setSwitching(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 font-cinzel text-xs tracking-wide px-3 py-1.5 transition-all"
        style={{ background: "#1A0A0A", border: "1px solid var(--dnd-gold)", color: "var(--dnd-gold)" }}
      >
        <IconSword size={14} color="var(--dnd-gold)" />
        <span className="max-w-32 truncate">{aktiveKampagne}</span>
        <span style={{ opacity: 0.6 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-1 z-50 min-w-48"
            style={{ background: "#111", border: "1px solid var(--dnd-border)", boxShadow: "0 8px 24px rgba(0,0,0,0.6)" }}
          >
            <div className="px-3 py-2" style={{ borderBottom: "1px solid #1A1A1A" }}>
              <span className="font-cinzel text-xs tracking-widest uppercase" style={{ color: "var(--dnd-text-muted)" }}>
                Kampagne wechseln
              </span>
            </div>
            {kampagnen.map((k) => (
              <button
                key={k.id}
                onClick={() => switchTo(k.id)}
                disabled={switching}
                className="w-full text-left px-4 py-2.5 font-cinzel text-xs flex items-center gap-2 transition-colors"
                style={{
                  color: k.id === aktiveId ? "var(--dnd-gold)" : "var(--dnd-text)",
                  background: k.id === aktiveId ? "#1A0A0A" : "transparent",
                  borderBottom: "1px solid #141414",
                }}
                onMouseEnter={(e) => { if (k.id !== aktiveId) (e.currentTarget.style.background = "#1A1A1A"); }}
                onMouseLeave={(e) => { if (k.id !== aktiveId) (e.currentTarget.style.background = "transparent"); }}
              >
                {k.id === aktiveId && <span>✦</span>}
                <span className="truncate">{k.name}</span>
              </button>
            ))}
            <Link
              href="/kampagnen/neu"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 font-cinzel text-xs transition-colors"
              style={{ color: "var(--dnd-text-muted)", borderTop: "1px solid #1A1A1A" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#1A1A1A")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
            >
              + Neue Kampagne
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
