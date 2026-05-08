import Link from "next/link";
import NPCForm from "@/components/NPCForm";

export default function NewNPC() {
  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <header style={{ background: "#0A0A0A", borderBottom: "1px solid #2A1A1A" }}>
        <div style={{ height: "3px", background: "linear-gradient(90deg, transparent, var(--dnd-red), var(--dnd-gold), var(--dnd-red), transparent)" }} />
        <div className="mx-auto max-w-2xl px-6 py-4">
          <Link href="/" className="font-cinzel text-xs tracking-widest uppercase transition-colors"
            style={{ color: "var(--dnd-text-muted)" }}>
            ← Zurück
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-8">
          <h1 className="font-cinzel text-3xl font-bold" style={{ color: "var(--dnd-gold)" }}>
            Neuen NPC erstellen
          </h1>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, var(--dnd-red), transparent)" }} />
            <span style={{ color: "var(--dnd-red)" }}>✦</span>
          </div>
        </div>
        <NPCForm />
      </div>
    </main>
  );
}
