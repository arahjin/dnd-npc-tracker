import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireKampagne } from "@/lib/kampagne";
import { charakterVisibilityWhere, visibilityWhere } from "@/lib/visibility";
import CharakterCreateButton from "@/components/CharakterCreateButton";
import CharaktereGrid from "@/components/CharaktereGrid";

export default async function CharakterePage() {
  const ctx = await requireKampagne();
  const t = await getTranslations("charakter");

  const [charaktere, availableOrgs, availableLocations] = await Promise.all([
    prisma.charakter.findMany({
      where: { kampagneId: ctx.kampagneId, ...charakterVisibilityWhere(ctx) },
      orderBy: { name: "asc" },
      select: {
        id: true, name: true, image: true, status: true,
        rasse: true, aktuellePosition: true, sichtbarkeit: true,
        userId: true, user: { select: { name: true } },
      },
    }),
    prisma.organisation.findMany({ where: { kampagneId: ctx.kampagneId, ...visibilityWhere(ctx) }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.location.findMany({ where: { kampagneId: ctx.kampagneId, ...visibilityWhere(ctx) }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "var(--dnd-label)" }}>
            {charaktere.length} {charaktere.length === 1 ? t("countSingle") : t("countPlural")}
          </p>
          <CharakterCreateButton availableOrgs={availableOrgs} availableLocations={availableLocations} />
        </div>
        <CharaktereGrid charaktere={charaktere} currentUserId={ctx.userId} isDM={ctx.isDM} />
      </div>
    </main>
  );
}
