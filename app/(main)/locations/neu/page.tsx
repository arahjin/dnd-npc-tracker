export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { requireKampagne } from "@/lib/kampagne";
import LocationForm from "@/components/LocationForm";
import Link from "next/link";

export default async function NewLocationPage() {
  const ctx = await requireKampagne();

  const [npcs, orgs, chars] = await Promise.all([
    prisma.nPC.findMany({ where: { kampagneId: ctx.kampagneId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.organisation.findMany({ where: { kampagneId: ctx.kampagneId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.charakter.findMany({ where: { kampagneId: ctx.kampagneId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <div className="mx-auto max-w-2xl px-4 md:px-6 py-10">
        <div className="mb-8">
          <Link href="/locations" className="font-cinzel text-xs tracking-widest uppercase"
            style={{ color: "var(--dnd-text-muted)" }}>
            ← Locations
          </Link>
          <h1 className="font-cinzel text-3xl font-bold mt-4" style={{ color: "var(--dnd-heading)" }}>
            Neue Location
          </h1>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, var(--dnd-red), transparent)" }} />
            <span style={{ color: "var(--dnd-red)" }}>✦</span>
          </div>
        </div>
        <LocationForm
          availableNpcs={npcs}
          availableOrgs={orgs}
          availableChars={chars}
        />
      </div>
    </main>
  );
}
