"use client";

import { useState } from "react";

export default function MigrationButton() {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(dryRun: boolean) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/setup/migrate-kampagnen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dryRun }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Unbekannter Fehler.");
      } else {
        const prefix = data.dryRun ? "🔍 Vorschau (keine Änderungen)" : "✓ Fertig!";
        const kampagneNote = data.dryRun
          ? data.wouldCreateKampagne
            ? `Kampagne würde neu angelegt: „${data.kampagneName}"`
            : `Kampagne existiert bereits: „${data.kampagneName}"`
          : `Kampagne: „${data.kampagneName}"`;
        setResult(
          `${prefix}\n${kampagneNote}\n` +
          `NPCs: ${data.updated.npcs} · Orgs: ${data.updated.orgs} · Charaktere: ${data.updated.chars} · Einträge: ${data.updated.entries}\n` +
          `Mitglieder ${data.dryRun ? "würden hinzugefügt" : "hinzugefügt"}: ${data.addedMembers}`
        );
      }
    } catch {
      setError("Netzwerkfehler.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <button onClick={() => run(true)} disabled={loading}
          className="font-cinzel text-sm tracking-widest px-6 py-3 transition-all"
          style={{ border: "1px solid var(--dnd-gold)", color: "var(--dnd-gold)" }}>
          {loading ? "Läuft…" : "Vorschau (Dry-Run)"}
        </button>
        <button onClick={() => run(false)} disabled={loading} className="ddb-cta">
          {loading ? "Läuft…" : "Migration starten"}
        </button>
      </div>
      {result && (
        <pre className="mt-4 p-3 text-xs whitespace-pre-wrap"
          style={{ background: "#0A1A0A", border: "1px solid #1E3A1E", color: "#4ADE80", fontFamily: "monospace" }}>
          {result}
        </pre>
      )}
      {error && (
        <p className="mt-4 text-sm" style={{ color: "var(--dnd-red-light)" }}>✗ {error}</p>
      )}
    </div>
  );
}
