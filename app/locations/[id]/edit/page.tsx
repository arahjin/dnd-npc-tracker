export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireKampagne } from "@/lib/kampagne";
import SiteHeader from "@/components/SiteHeader";
import LocationForm from "@/components/LocationForm";

export default async function EditLocationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireKampagne();

  const [location, npcs, orgs, chars] = await Promise.all([
    prisma.location.findFirst({
      where: { id, kampagneId: ctx.kampagneId },
      include: {
        npcs: { select: { id: true } },
        organisationen: { select: { id: true } },
        charaktere: { select: { id: true } },
      },
    }),
    prisma.nPC.findMany({ where: { kampagneId: ctx.kampagneId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.organisation.findMany({ where: { kampagneId: ctx.kampagneId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.charakter.findMany({ where: { kampagneId: ctx.kampagneId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!location) notFound();

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <SiteHeader active="locations" />
      <div className="mx-auto max-w-2xl px-4 md:px-6 py-10">
        <div className="mb-8">
          <a href={`/locations/${id}`} className="font-cinzel text-xs tracking-widest uppercase"
            style={{ color: "var(--dnd-text-muted)" }}>
            ← Zurück zu {location.name}
          </a>
          <h1 className="font-cinzel text-3xl font-bold mt-4" style={{ color: "var(--dnd-heading)" }}>
            {location.name} bearbeiten
          </h1>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, var(--dnd-red), transparent)" }} />
            <span style={{ color: "var(--dnd-red)" }}>✦</span>
          </div>
        </div>
        <LocationForm
          id={id}
          initial={{
            name: location.name,
            art: location.art ?? "",
            land: location.land ?? "",
            region: location.region ?? "",
            population: location.population,
            klima: location.klima ?? "",
            floraFauna: location.floraFauna ?? "",
            wissenswertes: location.wissenswertes ?? "",
            sichtbarkeit: location.sichtbarkeit ?? "public",
            privateNotizen: location.privateNotizen ?? "",
          }}
          initialNpcIds={location.npcs.map((n) => n.id)}
          initialOrgIds={location.organisationen.map((o) => o.id)}
          initialCharIds={location.charaktere.map((c) => c.id)}
          availableNpcs={npcs}
          availableOrgs={orgs}
          availableChars={chars}
        />
      </div>
    </main>
  );
}
