"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Kampagne = {
  id: string;
  name: string;
  beschreibung: string | null;
  isDM?: boolean;
  _count: { mitglieder: number };
};

export default function KampagnenPage() {
  const router = useRouter();
  const [kampagnen, setKampagnen] = useState<Kampagne[]>([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/kampagnen")
      .then((r) => r.json())
      .then((data) => { setKampagnen(data); setLoading(false); });
  }, []);

  async function activate(id: string) {
    setActivating(id);
    await fetch(`/api/kampagnen/${id}/aktiv`, { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      {/* Header */}
      <header style={{ background: "#111111", borderBottom: "1px solid #252525" }}>
        <div style={{ height: "3px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-red) 30%, var(--dnd-gold) 50%, var(--dnd-red) 70%, var(--dnd-red-dark))" }} />
        <div className="mx-auto max-w-5xl px-6" style={{ height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 className="font-cinzel text-lg font-bold tracking-widest" style={{ color: "var(--dnd-heading)" }}>
            ⚔ Kampagnen
          </h1>
          <Link href="/kampagnen/new" className="ddb-cta">
            + Neue Kampagne
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        {loading ? (
          <p className="font-cinzel text-sm" style={{ color: "var(--dnd-text-muted)" }}>Lade Kampagnen...</p>
        ) : kampagnen.length === 0 ? (
          <div className="flex flex-col items-center py-24 gap-4">
            <p className="text-5xl">⚔</p>
            <p className="font-cinzel text-lg font-semibold" style={{ color: "var(--dnd-heading)" }}>
              Keine Kampagnen vorhanden
            </p>
            <p className="font-cinzel text-sm" style={{ color: "var(--dnd-text-muted)" }}>
              Erstelle eine neue Kampagne oder warte auf eine Einladung.
            </p>
            <Link href="/kampagnen/new" className="ddb-cta mt-4">+ Neue Kampagne erstellen</Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="font-cinzel text-xs tracking-widest uppercase mb-6" style={{ color: "var(--dnd-text-muted)" }}>
              Wähle eine Kampagne um fortzufahren
            </p>
            {kampagnen.map((k) => (
              <div
                key={k.id}
                className="flex items-center gap-6 p-5 transition-all"
                style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="font-cinzel text-xl font-bold" style={{ color: "var(--dnd-heading)" }}>{k.name}</h2>
                    {k.isDM && (
                      <span className="font-cinzel text-xs px-2 py-0.5" style={{ background: "#1A0800", border: "1px solid var(--dnd-gold)", color: "var(--dnd-gold)" }}>
                        DM
                      </span>
                    )}
                  </div>
                  {k.beschreibung && (
                    <p className="text-sm" style={{ color: "var(--dnd-text-muted)", fontFamily: "'Roboto', sans-serif" }}>{k.beschreibung}</p>
                  )}
                  <p className="font-cinzel text-xs mt-2" style={{ color: "var(--dnd-text-muted)" }}>
                    {k._count.mitglieder} {k._count.mitglieder === 1 ? "Mitglied" : "Mitglieder"}
                  </p>
                </div>
                <button
                  onClick={() => activate(k.id)}
                  disabled={activating === k.id}
                  className="ddb-cta shrink-0"
                >
                  {activating === k.id ? "..." : "Betreten →"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
