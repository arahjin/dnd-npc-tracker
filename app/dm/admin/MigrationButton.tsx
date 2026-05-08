"use client";

import { useState } from "react";

export default function MigrationButton() {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/setup/migrate-kampagnen", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Unbekannter Fehler.");
      } else {
        setResult(
          `✓ Fertig! Kampagne: „${data.kampagneName}"\n` +
          `NPCs: ${data.updated.npcs} · Orgs: ${data.updated.orgs} · Charaktere: ${data.updated.chars} · Einträge: ${data.updated.entries}\n` +
          `Mitglieder hinzugefügt: ${data.addedMembers}`
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
      <button onClick={run} disabled={loading} className="ddb-cta">
        {loading ? "Läuft…" : "Migration starten"}
      </button>
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
