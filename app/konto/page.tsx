"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function KontoPage() {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    const res = await fetch("/api/konto", { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Fehler beim Löschen.");
      setDeleting(false);
      return;
    }
    // Sign out and redirect to landing page
    await signOut({ redirect: false });
    router.push("/");
  }

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <header style={{ background: "#111111", borderBottom: "1px solid #252525" }}>
        <div style={{ height: "3px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-red) 30%, var(--dnd-gold) 50%, var(--dnd-red) 70%, var(--dnd-red-dark))" }} />
        <div className="mx-auto max-w-2xl px-4 md:px-6" style={{ height: "60px", display: "flex", alignItems: "center", gap: "16px" }}>
          <button onClick={() => router.back()} className="font-cinzel text-xs tracking-widest uppercase"
            style={{ color: "var(--dnd-text-muted)" }}>← Zurück</button>
          <h1 className="font-cinzel text-lg font-bold tracking-widest" style={{ color: "var(--dnd-heading)" }}>
            Mein Konto
          </h1>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 md:px-6 py-10 space-y-8">

        {/* Danger zone */}
        <section style={{ background: "var(--dnd-bg-card)", border: "1px solid #991B1B" }}>
          <div style={{ height: "2px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-red), var(--dnd-red-dark))" }} />
          <div className="p-6">
            <h2 className="font-cinzel text-base font-semibold mb-2" style={{ color: "#F87171" }}>
              Konto löschen
            </h2>
            <p className="text-sm mb-1" style={{ color: "var(--dnd-text-muted)" }}>
              Dies löscht dein Konto unwiderruflich. Folgendes wird entfernt:
            </p>
            <ul className="text-sm mb-5 space-y-0.5 list-disc list-inside" style={{ color: "var(--dnd-text-muted)" }}>
              <li>Deine Charaktere und Tagebucheinträge</li>
              <li>Deine Kampagnenmitgliedschaften</li>
              <li>Alle verknüpften Daten</li>
            </ul>
            <p className="font-cinzel text-xs mb-4" style={{ color: "#FCA5A5" }}>
              NPCs, Organisationen und Locations, die du erstellt hast, bleiben in der Kampagne erhalten.
            </p>

            {error && (
              <div className="font-cinzel text-xs px-4 py-3 mb-4"
                style={{ background: "#200D0D", border: "1px solid #991B1B", color: "#F87171" }}>
                ✗ {error}
              </div>
            )}

            {!confirm ? (
              <button
                onClick={() => setConfirm(true)}
                className="font-cinzel text-xs tracking-widest px-5 py-2.5 transition-all"
                style={{ background: "#200D0D", border: "1px solid #991B1B", color: "#F87171" }}>
                KONTO LÖSCHEN
              </button>
            ) : (
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-cinzel text-xs" style={{ color: "#F87171" }}>
                  Bist du sicher? Diese Aktion kann nicht rückgängig gemacht werden.
                </span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="font-cinzel text-xs tracking-widest px-5 py-2.5 transition-all disabled:opacity-50"
                  style={{ background: "#200D0D", border: "1px solid #991B1B", color: "#F87171" }}>
                  {deleting ? "WIRD GELÖSCHT..." : "JA, ENDGÜLTIG LÖSCHEN"}
                </button>
                <button
                  onClick={() => { setConfirm(false); setError(null); }}
                  className="font-cinzel text-xs tracking-widest px-4 py-2.5 transition-all"
                  style={{ border: "1px solid var(--dnd-border)", color: "var(--dnd-text-muted)" }}>
                  ABBRECHEN
                </button>
              </div>
            )}
          </div>
        </section>

      </div>
    </main>
  );
}
