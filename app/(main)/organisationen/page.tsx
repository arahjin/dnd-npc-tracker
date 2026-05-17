import { prisma } from "@/lib/prisma";
import { requireKampagne } from "@/lib/kampagne";
import { visibilityWhere } from "@/lib/visibility";
import OrgCreateButton from "@/components/OrgCreateButton";
import OrgGrid from "@/components/OrgGrid";

export default async function OrganisationenPage() {
  const ctx = await requireKampagne();

  const [orgs, locations] = await Promise.all([
    prisma.organisation.findMany({
      where: { kampagneId: ctx.kampagneId, ...visibilityWhere(ctx) },
      orderBy: { name: "asc" },
      select: {
        id: true, name: true, image: true, typ: true, region: true,
        alignment: true, beschreibung: true, sichtbarkeit: true,
        _count: { select: { mitglieder: true } },
      },
    }),
    prisma.location.findMany({
      where: { kampagneId: ctx.kampagneId, ...visibilityWhere(ctx) },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "var(--dnd-label)" }}>
            {orgs.length} {orgs.length === 1 ? "Organisation" : "Organisationen"}
          </p>
          <OrgCreateButton availableLocations={locations} />
        </div>
        <OrgGrid orgs={orgs} isDM={ctx.isDM} />
      </div>
    </main>
  );
}
