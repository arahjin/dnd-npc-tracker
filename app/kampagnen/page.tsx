"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconSword } from "@/components/Icons";

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

  // Join-by-code state
  const [joinCode, setJoinCode] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);

  // Create campaign state
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newBeschreibung, setNewBeschreibung] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => { loadKampagnen(); }, []);

  async function loadKampagnen() {
    const res = await fetch("/api/kampagnen");
    if (res.ok) setKampagnen(await res.json());
    setLoading(false);
  }

  async function activate(id: string) {
    setActivating(id);
    await fetch(`/api/kampagnen/${id}/aktiv`, { method: "POST" });
    router.push("/npc");
    router.refresh();
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setJoinLoading(true);
    setJoinError(null);
    setJoinSuccess(null);
    const res = await fetch("/api/kampagnen/beitreten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: joinCode }),
    });
    const data = await res.json();
    if (!res.ok) {
      setJoinError(data.error ?? "Fehler.");
      setJoinLoading(false);
      return;
    }
    // Auto-activate and redirect
    await fetch(`/api/kampagnen/${data.kampagneId}/aktiv`, { method: "POST" });
    router.push("/npc");
    router.refresh();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) { setCreateError("Name ist erforderlich."); return; }
    setCreateLoading(true);
    setCreateError(null);
    const res = await fetch("/api/kampagnen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), beschreibung: newBeschreibung.trim() || undefined }),
    });
    const data = await res.json();
    if (!res.ok) {
      setCreateError(data.error ?? "Fehler beim Erstellen.");
      setCreateLoading(false);
      return;
    }
    await fetch(`/api/kampagnen/${data.id}/aktiv`, { method: "POST" });
    router.push("/npc");
    router.refresh();
  }

  const inputStyle = {
    background: "#0A0A0A", border: "1px solid #2A2A2A",
    color: "var(--dnd-text)", fontFamily: "'Roboto', sans-serif",
  };

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <header style={{ background: "#111111", borderBottom: "1px solid #252525" }}>
        <div style={{ height: "3px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-red) 30%, var(--dnd-gold) 50%, var(--dnd-red) 70%, var(--dnd-red-dark))" }} />
        <div className="mx-auto max-w-2xl px-4 md:px-6" style={{ height: "60px", display: "flex", alignItems: "center" }}>
          <h1 className="font-cinzel text-lg font-bold tracking-widest" style={{ color: "var(--dnd-heading)" }}>
            <IconSword size={14} color="var(--dnd-gold)" /> Kampagnen
          </h1>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 md:px-6 py-10 space-y-8">

        {/* Existing campaigns */}
        {!loading && kampagnen.length > 0 && (
          <section>
            <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase mb-4 pb-2"
              style={{ color: "var(--dnd-label)", borderBottom: "1px solid var(--dnd-border)" }}>
              Meine Kampagnen
            </h2>
            <div className="space-y-3">
              {kampagnen.map((k) => (
                <div key={k.id} className="flex items-center gap-4 p-4"
                  style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-cinzel font-semibold" style={{ color: "var(--dnd-heading)" }}>{k.name}</p>
                      {k.isDM && (
                        <span className="font-cinzel text-xs px-1.5 py-0.5"
                          style={{ background: "#1A0800", border: "1px solid var(--dnd-gold)", color: "var(--dnd-gold)" }}>
                          DM
                        </span>
                      )}
                    </div>
                    {k.beschreibung && (
                      <p className="text-sm" style={{ color: "var(--dnd-text-muted)" }}>{k.beschreibung}</p>
                    )}
                    <p className="font-cinzel text-xs mt-1" style={{ color: "var(--dnd-text-muted)" }}>
                      {k._count.mitglieder} {k._count.mitglieder === 1 ? "Mitglied" : "Mitglieder"}
                    </p>
                  </div>
                  <button onClick={() => activate(k.id)} disabled={activating === k.id} className="ddb-cta shrink-0">
                    {activating === k.id ? "..." : "Betreten →"}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {loading && (
          <p className="font-cinzel text-sm" style={{ color: "var(--dnd-text-muted)" }}>Lade Kampagnen...</p>
        )}

        {/* Join by code */}
        <section>
          <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase mb-4 pb-2"
            style={{ color: "var(--dnd-label)", borderBottom: "1px solid var(--dnd-border)" }}>
            Mit Einladungscode beitreten
          </h2>
          <div style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}>
            <div style={{ height: "2px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-gold), var(--dnd-red-dark))" }} />
            <form onSubmit={handleJoin} className="p-4 flex gap-3 items-start flex-wrap">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Einladungscode eingeben..."
                className="flex-1 min-w-0 px-4 py-2.5 text-sm outline-none"
                style={inputStyle}
              />
              <button type="submit" disabled={joinLoading || !joinCode.trim()} className="ddb-cta shrink-0">
                {joinLoading ? "..." : "Beitreten"}
              </button>
              {joinError && (
                <p className="w-full font-cinzel text-xs" style={{ color: "var(--dnd-red-light)" }}>✗ {joinError}</p>
              )}
              {joinSuccess && (
                <p className="w-full font-cinzel text-xs" style={{ color: "#4ADE80" }}>✓ {joinSuccess}</p>
              )}
            </form>
          </div>
        </section>

        {/* Create new campaign */}
        <section>
          <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase mb-4 pb-2"
            style={{ color: "var(--dnd-label)", borderBottom: "1px solid var(--dnd-border)" }}>
            Neue Kampagne erstellen
          </h2>
          <div style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}>
            <div style={{ height: "2px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-gold), var(--dnd-red-dark))" }} />
            {!showCreate ? (
              <div className="p-4">
                <p className="text-sm mb-3" style={{ color: "var(--dnd-text-muted)" }}>
                  Erstelle eine eigene Kampagne — du wirst automatisch zum Dungeon Master.
                </p>
                <button onClick={() => setShowCreate(true)} className="ddb-cta">
                  + Kampagne erstellen
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="p-4 space-y-4">
                {createError && (
                  <p className="font-cinzel text-xs" style={{ color: "var(--dnd-red-light)" }}>✗ {createError}</p>
                )}
                <div>
                  <label className="font-cinzel text-xs tracking-[0.15em] uppercase block mb-2" style={{ color: "var(--dnd-label)" }}>
                    Kampagnenname *
                  </label>
                  <input
                    type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                    placeholder="z.B. Lorehub Kampagne" autoFocus
                    className="w-full px-4 py-2.5 text-sm outline-none" style={inputStyle}
                  />
                </div>
                <div>
                  <label className="font-cinzel text-xs tracking-[0.15em] uppercase block mb-2" style={{ color: "var(--dnd-label)" }}>
                    Beschreibung (optional)
                  </label>
                  <input
                    type="text" value={newBeschreibung} onChange={(e) => setNewBeschreibung(e.target.value)}
                    placeholder="Kurze Beschreibung..."
                    className="w-full px-4 py-2.5 text-sm outline-none" style={inputStyle}
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={createLoading} className="ddb-cta">
                    {createLoading ? "ERSTELLEN..." : "KAMPAGNE ERSTELLEN"}
                  </button>
                  <button type="button" onClick={() => { setShowCreate(false); setCreateError(null); }}
                    className="font-cinzel text-xs px-4 py-2"
                    style={{ border: "1px solid var(--dnd-border)", color: "var(--dnd-text-muted)" }}>
                    ABBRECHEN
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

      </div>
    </main>
  );
}
