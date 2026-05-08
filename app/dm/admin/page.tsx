import SiteHeader from "@/components/SiteHeader";
import Link from "next/link";
import MigrationButton from "./MigrationButton";

export default function AdminPage() {
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
          <MigrationButton />
        </section>

        <Link href="/" className="font-cinzel text-xs tracking-widest" style={{ color: "var(--dnd-text-muted)" }}>
          ← Zurück zur Startseite
        </Link>
      </div>
    </main>
  );
}
