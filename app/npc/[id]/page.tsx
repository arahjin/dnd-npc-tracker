import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/DeleteButton";
import NPCEditButton from "@/components/NPCEditButton";

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Lebendig:  { bg: "#0D2010", text: "#4ADE80", border: "#166534" },
  Tot:       { bg: "#200D0D", text: "#F87171", border: "#991B1B" },
  Vermisst:  { bg: "#201A0A", text: "#FCD34D", border: "#92400E" },
  Unbekannt: { bg: "#141414", text: "#9CA3AF", border: "#374151" },
};

const BEZIEHUNG_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Verbündet": { bg: "#0A1020", text: "#60A5FA", border: "#1E3A8A" },
  Freundlich:  { bg: "#0A1A12", text: "#34D399", border: "#065F46" },
  Neutral:     { bg: "#141414", text: "#9CA3AF", border: "#374151" },
  Feindlich:   { bg: "#200D0D", text: "#F87171", border: "#991B1B" },
  Unbekannt:   { bg: "#141414", text: "#9CA3AF", border: "#374151" },
};

function Badge({ label, colors }: { label: string; colors: { bg: string; text: string; border: string } }) {
  return (
    <span className="font-cinzel text-xs px-3 py-1 tracking-wide"
      style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
      {label}
    </span>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-4 py-3" style={{ borderBottom: "1px solid #1E1E1E" }}>
      <span className="font-cinzel text-xs tracking-widest uppercase w-40 shrink-0 pt-0.5" style={{ color: "var(--dnd-label)" }}>
        {label}
      </span>
      <span className="text-base leading-relaxed" style={{ color: "var(--dnd-text)", fontFamily: "'Roboto', sans-serif" }}>
        {value}
      </span>
    </div>
  );
}

export default async function NPCDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [npc, orgs] = await Promise.all([
    prisma.nPC.findUnique({
      where: { id },
      include: { organisationen: { include: { organisation: true }, orderBy: { createdAt: "asc" } } },
    }),
    prisma.organisation.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!npc) notFound();

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      {/* Header */}
      <header style={{ background: "#0A0A0A", borderBottom: "1px solid #2A1A1A" }}>
        <div style={{ height: "3px", background: "linear-gradient(90deg, transparent, var(--dnd-red), var(--dnd-gold), var(--dnd-red), transparent)" }} />
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-cinzel text-xs tracking-widest uppercase flex items-center gap-2 transition-colors"
            style={{ color: "var(--dnd-text-muted)" }}>
            ← Zurück
          </Link>
          <div className="flex gap-2">
            <NPCEditButton
              id={id}
              name={npc.name}
              availableOrgs={orgs}
              initialOrgs={npc.organisationen.map((m) => ({ organisationId: m.organisationId, rolle: m.rolle ?? "" }))}
              initial={{
                name: npc.name, image: npc.image ?? "", status: npc.status,
                beziehung: npc.beziehung, geschlecht: npc.geschlecht ?? "", region: npc.region ?? "",
                alter: npc.alter ?? "", rasse: npc.rasse ?? "", herkunft: npc.herkunft ?? "",
                aktuellePosition: npc.aktuellePosition ?? "", notizen: npc.notizen ?? "",
              }}
            />
            <DeleteButton id={id} />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">

          {/* Left Column */}
          <div className="md:col-span-1">
            {/* Portrait */}
            <div className="relative overflow-hidden" style={{
              aspectRatio: "2/3",
              border: "1px solid var(--dnd-border)",
              background: "#0A0A0A",
            }}>
              {/* Corner decorations */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 z-10" style={{ borderColor: "var(--dnd-gold)" }} />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 z-10" style={{ borderColor: "var(--dnd-gold)" }} />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 z-10" style={{ borderColor: "var(--dnd-gold)" }} />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 z-10" style={{ borderColor: "var(--dnd-gold)" }} />

              {npc.image ? (
                <Image src={npc.image} alt={npc.name} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-7xl opacity-20">⚔️</span>
                </div>
              )}

              {/* Gradient */}
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,10,10,0.6) 0%, transparent 60%)" }} />
            </div>

            {/* Badges */}
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge label={npc.status} colors={STATUS_COLORS[npc.status] ?? STATUS_COLORS["Unbekannt"]} />
              <Badge label={npc.beziehung} colors={BEZIEHUNG_COLORS[npc.beziehung] ?? BEZIEHUNG_COLORS["Unbekannt"]} />
            </div>
          </div>

          {/* Right Column */}
          <div className="md:col-span-2">
            {/* Name */}
            <div className="mb-6">
              <h1 className="font-cinzel text-4xl font-bold leading-tight" style={{ color: "var(--dnd-heading)" }}>
                {npc.name}
              </h1>
              {/* Decorative line */}
              <div className="mt-3 flex items-center gap-3">
                <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, var(--dnd-red), transparent)" }} />
                <span style={{ color: "var(--dnd-label)" }}>✦</span>
              </div>
            </div>

            {/* Stats Block */}
            <div className="mb-6" style={{ border: "1px solid var(--dnd-border)", background: "var(--dnd-bg-card)" }}>
              <div className="px-4 py-2" style={{ background: "var(--dnd-red-dark)", borderBottom: "1px solid var(--dnd-border)" }}>
                <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "var(--dnd-heading)" }}>
                  Charakterdaten
                </h2>
              </div>
              <div className="px-4">
                <Field label="Geschlecht" value={npc.geschlecht} />
                <Field label="Rasse" value={npc.rasse} />
                <Field label="Alter" value={npc.alter} />
                <Field label="Region" value={npc.region} />
                <Field label="Herkunft" value={npc.herkunft} />
                <Field label="Position" value={npc.aktuellePosition} />
                {!npc.geschlecht && !npc.rasse && !npc.alter && !npc.region && !npc.herkunft && !npc.aktuellePosition && (
                  <p className="py-4 text-sm" style={{ color: "var(--dnd-text-muted)" }}>Keine Details eingetragen.</p>
                )}
              </div>
            </div>

            {/* Organisationen */}
            {npc.organisationen.length > 0 && (
              <div style={{ border: "1px solid var(--dnd-border)", background: "var(--dnd-bg-card)" }}>
                <div className="px-4 py-2" style={{ background: "var(--dnd-red-dark)", borderBottom: "1px solid var(--dnd-border)" }}>
                  <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "var(--dnd-heading)" }}>Organisationen</h2>
                </div>
                <div className="divide-y" style={{ borderColor: "#1E1E1E" }}>
                  {npc.organisationen.map((m) => (
                    <div key={m.id} className="px-4 py-3 flex items-center justify-between gap-4">
                      <Link href={`/organisationen/${m.organisationId}`} className="font-cinzel text-sm font-semibold hover:underline" style={{ color: "var(--dnd-heading)" }}>
                        {m.organisation.name}
                      </Link>
                      {m.rolle && <span className="text-xs" style={{ color: "var(--dnd-text-muted)" }}>{m.rolle}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {npc.notizen && (
              <div style={{ border: "1px solid var(--dnd-border)", background: "var(--dnd-bg-card)" }}>
                <div className="px-4 py-2" style={{ background: "var(--dnd-red-dark)", borderBottom: "1px solid var(--dnd-border)" }}>
                  <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "var(--dnd-heading)" }}>
                    Notizen
                  </h2>
                </div>
                <div className="px-4 py-4">
                  <p className="text-base leading-relaxed whitespace-pre-wrap" style={{ color: "var(--dnd-text)", fontFamily: "'Roboto', sans-serif", fontSize: "1.1rem" }}>
                    {npc.notizen}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
