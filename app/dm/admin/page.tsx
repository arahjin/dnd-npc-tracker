"use client";

import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import Link from "next/link";

export default function AdminPage() {
  const [migrateResult, setMigrateResult] = useState<string | null>(null);
  const [migrateLoading, setMigrateLoading] = useState(false);
  const [migrateError, setMigrateError] = useState<string | null>(null);

  async function runMigration() {
    setMigrateLoading(true);
    setMigrateError(null);
    setMigrateResult(null);
    try {
      const res = await fetch("/api/setup/migrate-kampagnen", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setMigrateError(data.error ?? "Unbekannter Fehler.");
      } else {
        setMigrateResult(
          `✓ Fertig! Kampagne: „${data.kampagneName}" (${data.kampagneId})\n` +
          `NPCs: ${data.updated.npcs} · Orgs: ${data.updated.orgs} · Charaktere: ${data.updated.chars} · Einträge: ${data.updated.entries}\n` +
          `Mitglieder hinzugefügt: ${data.addedMembers}`
        );
      }
    } catch {
      setMigrateError("Netzwerkfehler.");
    } finally {
      setMigrateLoading(false);
    }
  }

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <SiteHeader active="npcs" />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="font-cinzel text-2xl font-bold mb-2" style={{ color: "var(--dnd-heading)" }}>
          Admin-Bereich
        </h1>
        <div className="mt-3 mb-10 flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, var(--dnd-red), transparent)" }} />
          <span style={{ color: "var(--dnd-red)" }}>✦</span>
        </div>

        {/* Migration */}
        <section className="p-5 mb-6" style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}>
          <div style={{ height: "2px", marginBottom: "1rem", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-gold), var(--dnd-red-dark))" }} />
          <h2 className="font-cinzel text-sm font-semibold mb-1" style={{ color: "var(--dnd-heading)" }}>
            Kampagnen-Migration
          </h2>
          <p className="text-sm mb-4" style={{ color: "var(--dnd-text-muted)" }}>
            Weist alle bestehenden NPCs, Organisationen, Charaktere und Journal-Einträge
            einer „Standard-Kampagne" zu und fügt alle User als Mitglieder hinzu.
            Kann bedenkenlos mehrfach ausgeführt werden.
          </p>
          <button
            onClick={runMigration}
            disabled={migrateLoading}
            className="ddb-cta"
          >
            {migrateLoading ? "Läuft…" : "Migration starten"}
          </button>

          {migrateResult && (
            <pre className="mt-4 p-3 text-xs whitespace-pre-wrap"
              style={{ background: "#0A1A0A", border: "1px solid #1E3A1E", color: "#4ADE80", fontFamily: "monospace" }}>
              {migrateResult}
            </pre>
          )}
          {migrateError && (
            <p className="mt-4 text-sm" style={{ color: "var(--dnd-red-light)" }}>
              ✗ {migrateError}
            </p>
          )}
        </section>

        <Link href="/" className="font-cinzel text-xs tracking-widest" style={{ color: "var(--dnd-text-muted)" }}>
          ← Zurück zur Startseite
        </Link>
      </div>
    </main>
  );
}
