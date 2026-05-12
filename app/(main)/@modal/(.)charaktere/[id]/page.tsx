import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { canSeePrivate } from "@/lib/visibility";
import DetailModal from "@/components/DetailModal";
import ModalCloseButton from "@/components/ModalCloseButton";
import CharakterEditButton from "@/components/CharakterEditButton";
import CharakterDeleteButton from "@/components/CharakterDeleteButton";
import RenderMentions from "@/components/RenderMentions";
import { IconLock } from "@/components/Icons";

function Field({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-4 py-3" style={{ borderBottom: "1px solid #1E1E1E" }}>
      <span className="font-cinzel text-xs tracking-widest uppercase w-40 shrink-0 pt-0.5" style={{ color: "var(--dnd-label)" }}>{label}</span>
      <span className="text-base leading-relaxed" style={{ color: "var(--dnd-text)", fontFamily: "'Roboto', sans-serif" }}>{value}</span>
    </div>
  );
}

export default async function CharakterModal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user.id;
  const role = session!.user.role;
  const isDM = role === "DUNGEON_MASTER";
  const isAdmin = role === "ADMIN";

  const cookieStore = await cookies();
  const kampagneId = cookieStore.get("aktiveKampagne")?.value ?? undefined;

  const [charakter, orgs, locations] = await Promise.all([
    prisma.charakter.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true } },
        organisationen: { include: { organisation: true }, orderBy: { organisation: { name: "asc" } } },
        locations: { orderBy: { name: "asc" }, select: { id: true, name: true, art: true } },
      },
    }),
    prisma.organisation.findMany({ where: kampagneId ? { kampagneId } : {}, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.location.findMany({
      where: kampagneId ? { kampagneId } : {},
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  if (!charakter) notFound();

  const showPrivate = canSeePrivate({ userId, isDM, isAdmin }, charakter.userId);
  const canEdit = isDM || isAdmin || charakter.userId === userId;

  return (
    <DetailModal>
      {/* Header */}
      <div style={{ background: "#111111", borderBottom: "1px solid #252525" }}>
        <div className="mx-auto max-w-5xl px-4 md:px-6" style={{ height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <ModalCloseButton />
          {canEdit && (
            <div className="flex gap-2">
              <CharakterEditButton
                id={id} name={charakter.name} availableOrgs={orgs} availableLocations={locations}
                initialOrgs={charakter.organisationen.map((m) => ({ organisationId: m.organisationId, rolle: m.rolle ?? "" }))}
                canSeePrivate={showPrivate}
                initial={{
                  name: charakter.name, image: charakter.image ?? "", status: charakter.status,
                  beziehung: charakter.beziehung, geschlecht: charakter.geschlecht ?? "",
                  region: charakter.region ?? "", alter: charakter.alter ?? "", rasse: charakter.rasse ?? "",
                  herkunft: charakter.herkunft ?? "", aktuellePosition: charakter.aktuellePosition ?? "",
                  gottheit: charakter.gottheit ?? "", notizen: charakter.notizen ?? "",
                  sichtbarkeit: charakter.sichtbarkeit ?? "public",
                  ...(showPrivate && { privateNotizen: charakter.privateNotizen ?? "" }),
                }}
              />
              <CharakterDeleteButton id={id} />
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 md:px-6 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Portrait */}
          <div className="md:col-span-1">
            <div className="relative overflow-hidden" style={{ aspectRatio: "2/3", border: "1px solid var(--dnd-border)", background: "#0A0A0A" }}>
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 z-10" style={{ borderColor: "var(--dnd-gold)" }} />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 z-10" style={{ borderColor: "var(--dnd-gold)" }} />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 z-10" style={{ borderColor: "var(--dnd-gold)" }} />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 z-10" style={{ borderColor: "var(--dnd-gold)" }} />
              {charakter.image
                ? <Image src={charakter.image} alt={charakter.name} fill className="object-cover" />
                : <div className="flex h-full items-center justify-center"><Image src="/lorehub_icon.png" alt="" width={180} height={180} className="object-contain opacity-20" /></div>
              }
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,10,10,0.6) 0%, transparent 60%)" }} />
            </div>
            <p className="mt-3 font-cinzel text-xs tracking-wide" style={{ color: "var(--dnd-text-muted)" }}>
              Gespielt von <span style={{ color: "var(--dnd-gold)" }}>{charakter.user.name}</span>
            </p>
          </div>

          {/* Details */}
          <div className="md:col-span-2">
            <h1 className="font-cinzel text-4xl font-bold" style={{ color: "var(--dnd-heading)" }}>{charakter.name}</h1>
            <div className="mt-3 flex items-center gap-3 mb-6">
              <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, var(--dnd-red), transparent)" }} />
              <span style={{ color: "var(--dnd-label)" }}>✦</span>
            </div>

            <div className="mb-6" style={{ border: "1px solid var(--dnd-border)", background: "var(--dnd-bg-card)" }}>
              <div className="px-4 py-2" style={{ background: "var(--dnd-red-dark)", borderBottom: "1px solid var(--dnd-border)" }}>
                <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "var(--dnd-heading)" }}>Charakterdaten</h2>
              </div>
              <div className="px-4">
                <Field label="Geschlecht" value={charakter.geschlecht} />
                <Field label="Rasse" value={charakter.rasse} />
                <Field label="Alter" value={charakter.alter} />
                <Field label="Region" value={charakter.region} />
                <Field label="Herkunft" value={charakter.herkunft} />
                <Field label="Position" value={charakter.aktuellePosition} />
                <Field label="Gottheit" value={charakter.gottheit} />
                {!charakter.geschlecht && !charakter.rasse && !charakter.alter && !charakter.region && !charakter.herkunft && !charakter.aktuellePosition && !charakter.gottheit && (
                  <p className="py-4 text-sm" style={{ color: "var(--dnd-text-muted)" }}>Keine Details eingetragen.</p>
                )}
              </div>
            </div>

            {charakter.organisationen.length > 0 && (
              <div className="mb-6" style={{ border: "1px solid var(--dnd-border)", background: "var(--dnd-bg-card)" }}>
                <div className="px-4 py-2" style={{ background: "var(--dnd-red-dark)", borderBottom: "1px solid var(--dnd-border)" }}>
                  <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "var(--dnd-heading)" }}>Organisationen</h2>
                </div>
                <div className="divide-y" style={{ borderColor: "#1E1E1E" }}>
                  {charakter.organisationen.map((m) => (
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

            {charakter.locations.length > 0 && (
              <div className="mb-6" style={{ border: "1px solid var(--dnd-border)", background: "var(--dnd-bg-card)" }}>
                <div className="px-4 py-2" style={{ background: "var(--dnd-red-dark)", borderBottom: "1px solid var(--dnd-border)" }}>
                  <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "var(--dnd-heading)" }}>Locations</h2>
                </div>
                <div className="divide-y" style={{ borderColor: "#1E1E1E" }}>
                  {charakter.locations.map((loc) => (
                    <Link key={loc.id} href={`/locations/${loc.id}`} className="px-4 py-3 flex items-center justify-between gap-4 block"
                      style={{ textDecoration: "none" }}>
                      <span className="font-cinzel text-sm font-semibold hover:underline" style={{ color: "var(--dnd-heading)" }}>
                        {loc.name}
                      </span>
                      {loc.art && <span className="text-xs" style={{ color: "var(--dnd-text-muted)" }}>{loc.art}</span>}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {charakter.notizen && (
              <div style={{ border: "1px solid var(--dnd-border)", background: "var(--dnd-bg-card)" }}>
                <div className="px-4 py-2" style={{ background: "var(--dnd-red-dark)", borderBottom: "1px solid var(--dnd-border)" }}>
                  <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "var(--dnd-heading)" }}>Notizen</h2>
                </div>
                <div className="px-4 py-4">
                  <p className="text-base leading-relaxed" style={{ color: "var(--dnd-text)", fontFamily: "'Roboto', sans-serif" }}>
                    <RenderMentions text={charakter.notizen} />
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DetailModal>
  );
}
