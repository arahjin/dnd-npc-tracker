import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { requireKampagne } from "@/lib/kampagne";
import SiteHeader from "@/components/SiteHeader";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  Lebendig: "#4ADE80", Tot: "#F87171", Vermisst: "#FCD34D", Unbekannt: "#9CA3AF",
};

export default async function CharakterePage() {
  const ctx = await requireKampagne();

  const charaktere = await prisma.charakter.findMany({
    where: { kampagneId: ctx.kampagneId },
    orderBy: { name: "asc" },
    include: { user: { select: { id: true, name: true } } },
  });

  const own = charaktere.filter((c) => c.userId === ctx.userId);
  const others = charaktere.filter((c) => c.userId !== ctx.userId);

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <SiteHeader active="charaktere" />
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "var(--dnd-label)" }}>
            {charaktere.length} {charaktere.length === 1 ? "Charakter" : "Charaktere"}
          </p>
          <a href="/charaktere/neu" className="ddb-cta">+ Charakter</a>
        </div>
        <section className="mb-10">
          <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase mb-5 pb-2"
            style={{ color: "var(--dnd-label)", borderBottom: "1px solid var(--dnd-border)" }}>
            Meine Charaktere
          </h2>
          {own.length === 0 ? (
            <p className="font-cinzel text-sm" style={{ color: "var(--dnd-text-muted)" }}>
              Du hast noch keinen Charakter. <a href="/charaktere/neu" style={{ color: "var(--dnd-red-light)" }}>Erstelle einen.</a>
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
      <div className="relative h-52 w-full overflow-hidden" style={{ background: "#FFFFFF" }}>
        {c.image
          ? <Image src={c.image} alt={c.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
          : <div className="flex h-full items-center justify-center"><Image src="/wildgipfel_logo.png" alt="" width={80} height={36} className="object-contain opacity-20" /></div>
        }
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,10,10,0.8) 0%, transparent 50%)" }} />
      </div>
      <div className="p-4" style={{ background: "var(--dnd-red-dark)" }}>
        <p className="font-cinzel text-xs mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>{c.user.name}</p>
        <h2 className="font-cinzel font-semibold text-base leading-tight transition-colors group-hover:text-[#A8905A]" style={{ color: "#FFFFFF" }}>{c.name}</h2>
        {c.rasse && <p className="font-cinzel text-xs mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>{c.rasse}</p>}
        <p className="mt-2 text-xs font-cinzel" style={{ color: STATUS_COLORS[c.status] ?? "#9CA3AF" }}>{c.status}</p>
        {c.aktuellePosition && <p className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>📍 {c.aktuellePosition}</p>}
      </div>
      <div style={{ height: "2px", background: "linear-gradient(90deg, transparent, rgba(139,112,64,0.5), transparent)" }} />
    </Link>
  );
}
