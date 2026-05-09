"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewKampagnePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [beschreibung, setBeschreibung] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Name ist erforderlich."); return; }
    setSaving(true); setError("");

    const res = await fetch("/api/kampagnen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, beschreibung }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Fehler beim Erstellen.");
      setSaving(false);
      return;
    }

    const kampagne = await res.json();
    // Set as active and go to home
    await fetch(`/api/kampagnen/${kampagne.id}/aktiv`, { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const inputStyle = { background: "#0A0A0A", border: "1px solid #2A2A2A", color: "var(--dnd-text)", fontFamily: "'Roboto', sans-serif" };
  const labelStyle = "font-cinzel text-xs tracking-[0.15em] uppercase block mb-2";

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <header style={{ background: "#111111", borderBottom: "1px solid #252525" }}>
        <div style={{ height: "3px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-red) 30%, var(--dnd-gold) 50%, var(--dnd-red) 70%, var(--dnd-red-dark))" }} />
        <div className="mx-auto max-w-2xl px-6" style={{ height: "60px", display: "flex", alignItems: "center" }}>
          <Link href="/kampagnen" className="font-cinzel text-xs tracking-widest uppercase" style={{ color: "var(--dnd-text-muted)" }}>
            ← Kampagnen
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-8">
          <h1 className="font-cinzel text-3xl font-bold" style={{ color: "var(--dnd-heading)" }}>Neue Kampagne</h1>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, var(--dnd-red), transparent)" }} />
            <span style={{ color: "var(--dnd-red)" }}>✦</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="font-cinzel text-sm px-4 py-3" style={{ background: "#200D0D", border: "1px solid #991B1B", color: "#F87171" }}>{error}</div>
          )}
          <div>
            <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Kampagnenname *</label>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Wildgipfel Kampagne" autoFocus
              className="w-full px-4 py-2.5 text-base outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelStyle} style={{ color: "var(--dnd-label)" }}>Beschreibung (optional)</label>
            <textarea
              value={beschreibung} onChange={(e) => setBeschreibung(e.target.value)}
              rows={3} placeholder="Kurze Beschreibung der Kampagne..."
              className="w-full px-4 py-2.5 text-base outline-none resize-none"
              style={inputStyle}
            />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="ddb-cta py-3 px-8">
              {saving ? "ERSTELLEN..." : "KAMPAGNE ERSTELLEN"}
            </button>
            <button type="button" onClick={() => router.back()} className="font-cinzel text-sm tracking-widest px-6 py-3"
              style={{ border: "1px solid var(--dnd-border)", color: "var(--dnd-text-muted)" }}>
              ABBRECHEN
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
