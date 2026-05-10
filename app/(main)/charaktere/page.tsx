import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { requireKampagne } from "@/lib/kampagne";
import { charakterVisibilityWhere } from "@/lib/visibility";
import { IconPin } from "@/components/Icons";
import CharakterCreateButton from "@/components/CharakterCreateButton";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  Lebendig: "#4ADE80", Tot: "#F87171", Vermisst: "#FCD34D", Unbekannt: "#9CA3AF",
};

export default async function CharakterePage() {
  const ctx = await requireKampagne();

  const [charaktere, availableOrgs, availableLocations] = await Promise.all([
    prisma.charakter.findMany({
      where: { kampagneId: ctx.kampagneId, ...charakterVisibilityWhere(ctx) },
      orderBy: { name: "asc" },
      include: { user: { select: { id: true, name: true } } },
    }),
    prisma.organisation.findMany({ where: { kampagneId: ctx.kampagneId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.location.findMany({ where: { kampagneId: ctx.kampagneId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const own = charaktere.filter((c) => c.userId === ctx.userId);
  const others = charaktere.filter((c) => c.userId !== ctx.userId);

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "var(--dnd-label)" }}>
            {charaktere.length} {charaktere.length === 1 ? "Charakter" : "Charaktere"}
          </p>
          <CharakterCreateButton availableOrgs={availableOrgs} availableLocations={availableLocations} />
        </div>
        <section className="mb-10">
          <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase mb-5 pb-2"
            style={{ color: "var(--dnd-label)", borderBottom: "1px solid var(--dnd-border)" }}>
            Meine Charaktere
          </h2>
          {own.length === 0 ? (
            <p className="font-cinzel text-sm" style={{ color: "var(--dnd-text-muted)" }}>
              Du hast noch keinen Charakter. Klicke auf <span style={{ color: "var(--dnd-red-light)" }}>+ Charakter</span> oben rechts.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {own.map((c) => <CharCard key={c.id} c={c} />)}
            </div>
          )}
        </section>
        {others.length > 0 && (
          <section>
            <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase mb-5 pb-2"
              style={{ color: "var(--dnd-label)", borderBottom: "1px solid var(--dnd-border)" }}>
              Charaktere der anderen Spieler
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {others.map((c) => <CharCard key={c.id} c={c} />)}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function CharCard({ c }: { c: { id: string; name: string; image: string | null; status: string; rasse: string | null; aktuellePosition: string | null; user: { name: string } } }) {
  return (
    <Link href={`/charaktere/${c.id}`}
      className="group card-hover transition-all duration-300 block"
      style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}>
      <div style={{ height: "2px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-gold), var(--dnd-red-dark))" }} />
      <div className="relative h-52 w-full overflow-hidden" style={{ background: "#0A0A0A" }}>
        {c.image
          ? <Image src={c.image} alt={c.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
          : <div className="flex h-full items-center justify-center"><Image src="/lorehub_icon.png" alt="" width={150} height={150} className="object-contain opacity-20" /></div>
        }
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,10,10,0.8) 0%, transparent 50%)" }} />
      </div>
      <div className="p-4">
        <p className="font-cinzel text-xs mb-1" style={{ color: "var(--dnd-text-muted)" }}>{c.user.name}</p>
        <h2 className="font-cinzel font-semibold text-base leading-tight" style={{ color: "var(--dnd-heading)" }}>{c.name}</h2>
        {c.rasse && <p className="font-cinzel text-xs mt-1" style={{ color: "var(--dnd-text-muted)" }}>{c.rasse}</p>}
        <p className="mt-2 text-xs font-cinzel" style={{ color: STATUS_COLORS[c.status] ?? "#9CA3AF" }}>{c.status}</p>
        {c.aktuellePosition && <p className="mt-1 text-xs flex items-center gap-1" style={{ color: "var(--dnd-text-muted)" }}><><IconPin size={11} color="var(--dnd-text-muted)" /> {c.aktuellePosition}</></p>}
      </div>
      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, var(--dnd-border), transparent)" }} />
    </Link>
  );
}
