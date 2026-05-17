import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireKampagne } from "@/lib/kampagne";
import { visibilityWhere, charakterVisibilityWhere } from "@/lib/visibility";
import LocationCreateButton from "@/components/LocationCreateButton";
import LocationGrid from "@/components/LocationGrid";

export default async function LocationsPage() {
  const ctx = await requireKampagne();
  const t = await getTranslations("location");

  const [locations, availableNpcs, availableOrgs, availableChars] = await Promise.all([
    prisma.location.findMany({
      where: { kampagneId: ctx.kampagneId, ...visibilityWhere(ctx) },
      orderBy: { name: "asc" },
      include: { _count: { select: { npcs: true, organisationen: true, charaktere: true } } },
    }),
    prisma.nPC.findMany({ where: { kampagneId: ctx.kampagneId, ...visibilityWhere(ctx) }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.organisation.findMany({ where: { kampagneId: ctx.kampagneId, ...visibilityWhere(ctx) }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.charakter.findMany({ where: { kampagneId: ctx.kampagneId, ...charakterVisibilityWhere(ctx) }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "var(--dnd-label)" }}>
            {locations.length} {locations.length === 1 ? t("countSingle") : t("countPlural")}
          </p>
          <LocationCreateButton availableNpcs={availableNpcs} availableOrgs={availableOrgs} availableChars={availableChars} />
        </div>
        <LocationGrid locations={locations} isDM={ctx.isDM} />
      </div>
    </main>
  );
}
