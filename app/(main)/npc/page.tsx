import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireKampagne } from "@/lib/kampagne";
import { visibilityWhere } from "@/lib/visibility";
import NPCGrid from "@/components/NPCGrid";
import NPCCreateButton from "@/components/NPCCreateButton";

export default async function Home() {
  const ctx = await requireKampagne();
  const t = await getTranslations("npc");

  const [npcs, orgs, locations] = await Promise.all([
    prisma.nPC.findMany({
      where: { kampagneId: ctx.kampagneId, ...visibilityWhere(ctx) },
      orderBy: { name: "asc" },
      select: {
        id: true, name: true, image: true, status: true, beziehung: true,
        rasse: true, aktuellePosition: true, sichtbarkeit: true,
        organisationen: { select: { organisation: { select: { id: true, name: true } } } },
        locations: { select: { id: true } },
      },
    }),
    prisma.organisation.findMany({
      where: { kampagneId: ctx.kampagneId, ...visibilityWhere(ctx) },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
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
            {npcs.length} {npcs.length === 1 ? t("countSingle") : t("countPlural")}
          </p>
          <NPCCreateButton availableOrgs={orgs} availableLocations={locations} />
        </div>
        <NPCGrid npcs={npcs} availableOrgs={orgs} availableLocations={locations} isDM={ctx.isDM} />
      </div>
      <footer className="mt-auto py-6 text-center">
        <p className="font-cinzel text-xs tracking-widest" style={{ color: "var(--dnd-text-muted)" }}>✦ {ctx.kampagneName.toUpperCase()} ✦</p>
      </footer>
    </main>
  );
}
