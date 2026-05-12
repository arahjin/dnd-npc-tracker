import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { requireKampagne } from "@/lib/kampagne";
import { prisma } from "@/lib/prisma";
import { canSeePrivate } from "@/lib/visibility";
import OrgDeleteButton from "@/components/OrgDeleteButton";
import OrgMitglieder from "@/components/OrgMitglieder";
import CharakterMitglieder from "@/components/CharakterMitglieder";
import RenderMentions from "@/components/RenderMentions";
import { IconLock } from "@/components/Icons";

const ALIGNMENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Rechtschaffen Gut":    { bg: "#0A1020", text: "#60A5FA", border: "#1E3A8A" },
  "Neutral Gut":          { bg: "#0A1A12", text: "#34D399", border: "#065F46" },
  "Chaotisch Gut":        { bg: "#0D1A0A", text: "#86EFAC", border: "#166534" },
  "Rechtschaffen Neutral":{ bg: "#141414", text: "#D1D5DB", border: "#374151" },
  "Wahrhaft Neutral":     { bg: "#141414", text: "#9CA3AF", border: "#374151" },
  "Chaotisch Neutral":    { bg: "#1A1208", text: "#FCD34D", border: "#92400E" },
  "Rechtschaffen Böse":   { bg: "#200D0D", text: "#FCA5A5", border: "#991B1B" },
  "Neutral Böse":         { bg: "#200D0D", text: "#F87171", border: "#991B1B" },
  "Chaotisch Böse":       { bg: "#1A0A0A", text: "#EF4444", border: "#7F1D1D" },
};

function Field({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-4 py-3" style={{ borderBottom: "1px solid #1E1E1E" }}>
      <span className="font-cinzel text-xs tracking-widest uppercase w-40 shrink-0 pt-0.5" style={{ color: "var(--dnd-label)" }}>{label}</span>
      <span className="text-base leading-relaxed" style={{ color: "var(--dnd-text)" }}>{value}</span>
    </div>
  );
}

export default async function OrganisationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireKampagne();
  const { userId, isDM, isAdmin } = ctx;

  const org = await prisma.organisation.findUnique({
    where: { id },
    include: {
      mitglieder: { include: { npc: true }, orderBy: { npc: { name: "asc" } } },
      charakterMitglieder: {
        include: { charakter: { include: { user: { select: { id: true, name: true } } } } },
        orderBy: { charakter: { name: "asc" } },
      },
      locations: { orderBy: { name: "asc" }, select: { id: true, name: true, art: true } },
      quests: { include: { quest: { select: { id: true, title: true, status: true, typ: true } } } },
    },
  });
  if (!org) notFound();
  if (org.kampagneId && org.kampagneId !== ctx.kampagneId) notFound();
  if (org.sichtbarkeit === "privat" && !canSeePrivate({ userId, isDM, isAdmin }, org.erstellerId)) notFound();

  const showPrivate = canSeePrivate({ userId, isDM, isAdmin }, org.erstellerId);

  const [alleNPCs, alleCharaktere] = await Promise.all([
    prisma.nPC.findMany({
      where: { kampagneId: ctx.kampagneId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.charakter.findMany({
      where: { kampagneId: ctx.kampagneId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, user: { select: { id: true, name: true } } },
    }),
  ]);
  const alignColors = org.alignment ? (ALIGNMENT_COLORS[org.alignment] ?? ALIGNMENT_COLORS["Wahrhaft Neutral"]) : null;

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <header style={{ background: "#0A0A0A", borderBottom: "1px solid #2A1A1A" }}>
        <div style={{ height: "3px", background: "linear-gradient(90deg, transparent, var(--dnd-red), var(--dnd-gold), var(--dnd-red), transparent)" }} />
        <div className="mx-auto max-w-5xl px-4 md:px-6 py-4 flex items-center justify-between">
          <Link href="/organisationen" className="font-cinzel text-xs tracking-widest uppercase" style={{ color: "var(--dnd-text-muted)" }}>← Zurück</Link>
          <div className="flex gap-2">
            <Link href={`/organisationen/${id}/edit`} className="font-cinzel text-xs tracking-widest px-4 py-2 transition-all"
              style={{ border: "1px solid var(--dnd-gold)", color: "var(--dnd-gold)" }}>BEARBEITEN</Link>
            <OrgDeleteButton id={id} />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 md:px-6 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-start gap-6">
          {org.image && (
            <div className="relative shrink-0 w-40 h-40 overflow-hidden" style={{ border: "1px solid var(--dnd-border)" }}>
              <Image src={org.image} alt={org.name} fill sizes="160px" priority className="object-cover" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-4 mb-2">
              <h1 className="font-cinzel text-4xl font-bold" style={{ color: "var(--dnd-heading)" }}>{org.name}</h1>
              {alignColors && org.alignment && (
                <span className="font-cinzel text-sm px-3 py-1 mt-1" style={{ background: alignColors.bg, color: alignColors.text, border: `1px solid ${alignColors.border}` }}>
                  {org.alignment}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, var(--dnd-red), transparent)" }} />
              <span style={{ color: "var(--dnd-red)" }}>✦</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Details */}
          <div style={{ border: "1px solid var(--dnd-border)", background: "var(--dnd-bg-card)" }}>
            <div className="px-4 py-2" style={{ background: "var(--dnd-red-dark)", borderBottom: "1px solid var(--dnd-border)" }}>
              <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "var(--dnd-heading)" }}>Details</h2>
            </div>
            <div className="px-4">
              <Field label="Typ" value={org.typ} />
              <Field label="Region" value={org.region} />
              <Field label="Beziehung" value={org.beziehungZurGruppe} />
            </div>
          </div>

          {/* Beschreibung */}
          {org.beschreibung && (
            <div style={{ border: "1px solid var(--dnd-border)", background: "var(--dnd-bg-card)" }}>
              <div className="px-4 py-2" style={{ background: "var(--dnd-red-dark)", borderBottom: "1px solid var(--dnd-border)" }}>
                <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "var(--dnd-heading)" }}>Beschreibung</h2>
              </div>
              <div className="px-4 py-4">
                <p className="text-base leading-relaxed" style={{ color: "var(--dnd-text)" }}><RenderMentions text={org.beschreibung ?? ""} /></p>
              </div>
            </div>
          )}
        </div>

        {/* Private Notes */}
        {showPrivate && org.privateNotizen && (
          <div style={{ border: "1px solid var(--dnd-border)", background: "var(--dnd-bg-card)" }}>
            <div className="px-4 py-2" style={{ background: "#200D0D", borderBottom: "1px solid #991B1B" }}>
              <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "#FCA5A5" }}>
                <><IconLock size={13} color="#FCA5A5" /> Private Notizen</>
              </h2>
            </div>
            <div className="px-4 py-4">
              <p className="text-base leading-relaxed" style={{ color: "var(--dnd-text)", fontFamily: "var(--font-roboto), sans-serif", whiteSpace: "pre-wrap" }}>
                {org.privateNotizen}
              </p>
            </div>
          </div>
        )}

        {/* Locations */}
        {org.locations.length > 0 && (
          <div style={{ border: "1px solid var(--dnd-border)", background: "var(--dnd-bg-card)" }}>
            <div className="px-4 py-2" style={{ background: "var(--dnd-red-dark)", borderBottom: "1px solid var(--dnd-border)" }}>
              <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "var(--dnd-heading)" }}>
                Locations
              </h2>
            </div>
            <div className="px-4 py-2 flex flex-wrap gap-2">
              {org.locations.map((loc) => (
                <Link key={loc.id} href={`/locations/${loc.id}`}
                  className="font-cinzel text-xs px-3 py-1.5 transition-all"
                  style={{ border: "1px solid var(--dnd-border)", color: "var(--dnd-text)", background: "var(--dnd-bg)", textDecoration: "none" }}>
                  {loc.name}{loc.art ? ` · ${loc.art}` : ""}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Zugehörige Quests */}
        {org.quests && org.quests.length > 0 && (
          <div style={{ border: "1px solid var(--dnd-border)", background: "var(--dnd-bg-card)" }}>
            <div className="px-4 py-2" style={{ background: "var(--dnd-red-dark)", borderBottom: "1px solid var(--dnd-border)" }}>
              <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "var(--dnd-heading)" }}>Zugehörige Quests</h2>
            </div>
            <div className="px-4 py-3 flex flex-wrap gap-2">
              {org.quests.map((qo) => (
                <Link
                  key={qo.questId}
                  href={`/quests/${qo.questId}`}
                  className="font-cinzel text-xs px-3 py-1.5"
                  style={{ background: "#141414", border: "1px solid var(--dnd-border)", color: "var(--dnd-heading)", textDecoration: "none" }}
                >
                  {qo.quest.title}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Mitglieder */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <OrgMitglieder
            orgId={id}
            mitglieder={org.mitglieder.map((m) => ({ id: m.id, npcId: m.npcId, name: m.npc.name, image: m.npc.image, rolle: m.rolle }))}
            alleNPCs={alleNPCs}
          />
          <CharakterMitglieder
            orgId={id}
            mitglieder={org.charakterMitglieder.map((m) => ({
              id: m.id, charakterId: m.charakterId,
              name: m.charakter.name, image: m.charakter.image ?? null,
              rolle: m.rolle, playerName: m.charakter.user.name,
            }))}
            alleCharaktere={alleCharaktere}
          />
        </div>
      </div>
    </main>
  );
}
