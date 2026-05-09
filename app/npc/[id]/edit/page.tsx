import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NPCForm from "@/components/NPCForm";

export default async function EditNPC({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [npc, orgs] = await Promise.all([
    prisma.nPC.findUnique({ where: { id }, include: { organisationen: true } }),
    prisma.organisation.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!npc) notFound();

  const locations = await prisma.location.findMany({
    where: npc.kampagneId ? { kampagneId: npc.kampagneId } : {},
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <header style={{ background: "#111111", borderBottom: "1px solid #252525" }}>
        <div style={{ height: "3px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-red) 30%, var(--dnd-gold) 50%, var(--dnd-red) 70%, var(--dnd-red-dark))" }} />
        <div className="mx-auto max-w-2xl px-4 md:px-6" style={{ height: "60px", display: "flex", alignItems: "center" }}>
          <Link href={`/npc/${id}`} className="ddb-nav-link" style={{ paddingLeft: 0 }}>
            ← Zurück zu {npc.name}
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 md:px-6 py-10">
        <div className="mb-8">
          <h1 className="font-cinzel text-3xl font-bold" style={{ color: "var(--dnd-heading)" }}>
            {npc.name} bearbeiten
          </h1>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, var(--dnd-red), transparent)" }} />
            <span style={{ color: "var(--dnd-red)" }}>✦</span>
          </div>
        </div>
        <NPCForm
          id={id}
          availableOrgs={orgs}
          initialOrgs={npc.organisationen.map((m) => ({ organisationId: m.organisationId, rolle: m.rolle ?? "" }))}
          availableLocations={locations}
          initial={{
            name: npc.name, image: npc.image ?? "", status: npc.status,
            beziehung: npc.beziehung, geschlecht: npc.geschlecht ?? "", region: npc.region ?? "",
            alter: npc.alter ?? "", rasse: npc.rasse ?? "", herkunft: npc.herkunft ?? "",
            aktuellePosition: npc.aktuellePosition ?? "", notizen: npc.notizen ?? "",
            sichtbarkeit: npc.sichtbarkeit ?? "public", privateNotizen: npc.privateNotizen ?? "",
          }}
        />
      </div>
    </main>
  );
}
