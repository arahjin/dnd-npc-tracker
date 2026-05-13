import { requireKampagne } from "@/lib/kampagne";
import { redirect } from "next/navigation";
import ExportButton from "@/components/ExportButton";

export default async function ExportPage() {
  const ctx = await requireKampagne();
  if (!ctx.isDM) redirect("/npc");

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <div className="mx-auto max-w-2xl px-4 md:px-6 py-10">
        <h1 className="font-cinzel text-2xl font-bold mb-1" style={{ color: "var(--dnd-heading)" }}>
          Kampagne exportieren
        </h1>
        <div className="mt-3 mb-8 flex items-center gap-3">
          <div className="h-px w-40" style={{ background: "linear-gradient(90deg, var(--dnd-red), transparent)" }} />
          <span style={{ color: "var(--dnd-red)" }}>✦</span>
        </div>

        <div className="space-y-6" style={{ border: "1px solid var(--dnd-border)", background: "var(--dnd-bg-card)" }}>
          <div style={{ height: "2px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-gold), var(--dnd-red-dark))" }} />
          <div className="px-6 pb-6 space-y-4">
            <p className="text-sm leading-relaxed" style={{ color: "var(--dnd-text)" }}>
              Exportiert alle Daten der Kampagne <strong style={{ color: "var(--dnd-heading)" }}>{ctx.kampagneName}</strong> als JSON-Datei — inklusive NPCs, Organisationen, Locations, Charaktere, Tagebuch und Quests.
            </p>

            <div className="space-y-2 text-sm" style={{ color: "var(--dnd-text-muted)" }}>
              {[
                "NPCs mit Organisationszugehörigkeiten und Locations",
                "Organisationen mit Mitgliedern",
                "Locations mit verknüpften Entitäten",
                "Charaktere mit Spielerinformationen",
                "Journal-Einträge (Tagebuch & Geschichte)",
                "Quests mit Objectives und Verknüpfungen",
              ].map((item) => (
                <p key={item} className="flex items-center gap-2">
                  <span style={{ color: "var(--dnd-gold)" }}>✦</span> {item}
                </p>
              ))}
            </div>

            <div className="pt-2">
              <ExportButton />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
