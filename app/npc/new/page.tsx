import Link from "next/link";
import NPCForm from "@/components/NPCForm";

export default function NewNPC() {
  return (
    <main className="min-h-screen bg-[#1a1209] text-amber-100">
      <header className="border-b border-amber-900/50 bg-[#120d06] px-6 py-4">
        <div className="mx-auto max-w-2xl">
          <Link href="/" className="text-sm text-amber-700 hover:text-amber-400 transition-colors">
            ← Zurück zur Übersicht
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-8 text-2xl font-bold text-amber-400">Neuen NPC erstellen</h1>
        <NPCForm />
      </div>
    </main>
  );
}
