import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireKampagne } from "@/lib/kampagne";
import { IconMap } from "@/components/Icons";
import KartenList, { type KartenListItem } from "@/components/KartenList";

// Always render fresh: a player can otherwise see a stale list when the DM
// uploads a new map.
export const dynamic = "force-dynamic";

export default async function KartenPage() {
  const ctx = await requireKampagne();
  const t = await getTranslations("karten");

  const maps = await prisma.map.findMany({
    where: { kampagneId: ctx.kampagneId, parentMapId: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      beschreibung: true,
      imageUrl: true,
      imageWidth: true,
      imageHeight: true,
      createdAt: true,
      _count: { select: { placements: true } },
    },
  });

  const items: KartenListItem[] = maps.map((m) => ({
    id: m.id,
    name: m.name,
    beschreibung: m.beschreibung,
    imageUrl: m.imageUrl,
    placementCount: m._count.placements,
  }));

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-8">
        <div className="flex items-center justify-end mb-4">
          {ctx.isDM && (
            <Link href="/karten/neu" className="ddb-cta">
              {t("uploadButton")}
            </Link>
          )}
        </div>

        {maps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="mb-4" style={{ opacity: 0.3 }}>
              <IconMap size={52} color="var(--dnd-text-muted)" />
            </div>
            <p
              className="font-cinzel text-lg mb-2"
              style={{ color: "var(--dnd-text-muted)" }}
            >
              {t("empty")}
            </p>
            <p className="text-sm" style={{ color: "var(--dnd-text-muted)" }}>
              {t("emptyDesc")}
            </p>
          </div>
        ) : (
          <KartenList maps={items} />
        )}
      </div>
    </main>
  );
}
