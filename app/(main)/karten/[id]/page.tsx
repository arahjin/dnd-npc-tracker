import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireKampagne } from "@/lib/kampagne";
import MapViewLoader from "@/components/MapViewLoader";
import type { MapPlacement } from "@/components/MapView";
import type { MapShape } from "@/lib/mapShapes";

// Always render fresh so newly added placements show up for everyone.
export const dynamic = "force-dynamic";

export default async function KarteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await requireKampagne();
  const t = await getTranslations("karten");

  const [map, availableLocations, availableQuests, allMaps] = await Promise.all([
    prisma.map.findFirst({
      where: { id, kampagneId: ctx.kampagneId },
      include: {
        placements: {
          include: {
            location: { select: { id: true, name: true, art: true, sichtbarkeit: true } },
            quest: { select: { id: true, title: true, status: true, sichtbarkeit: true } },
            linkedMap: { select: { id: true, name: true } },
          },
        },
        childMaps: { orderBy: { name: "asc" }, select: { id: true, name: true } },
      },
    }),
    prisma.location.findMany({
      where: { kampagneId: ctx.kampagneId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.quest.findMany({
      where: { kampagneId: ctx.kampagneId },
      orderBy: { title: "asc" },
      select: { id: true, title: true, status: true },
    }),
    prisma.map.findMany({
      where: { kampagneId: ctx.kampagneId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, parentMapId: true },
    }),
  ]);

  if (!map) notFound();

  // Build breadcrumb chain from root → current
  const mapsById = new Map(allMaps.map((m) => [m.id, m]));
  const breadcrumb: { id: string; name: string }[] = [];
  let cursor: { id: string; name: string; parentMapId: string | null } | undefined = mapsById.get(map.id);
  const seen = new Set<string>();
  while (cursor && !seen.has(cursor.id)) {
    seen.add(cursor.id);
    breadcrumb.unshift({ id: cursor.id, name: cursor.name });
    cursor = cursor.parentMapId ? mapsById.get(cursor.parentMapId) : undefined;
  }

  const mapPlacementToShape = (p: (typeof map.placements)[number]): MapPlacement => ({
    id: p.id,
    x: p.x,
    y: p.y,
    shape: (p.shape as unknown as MapShape | null) ?? null,
    color: p.color,
    icon: p.icon,
    linkedMapId: p.linkedMapId,
    linkedMap: p.linkedMap,
    location: p.location,
    quest: p.quest,
  });

  const visiblePlacements: MapPlacement[] =
    ctx.isDM || ctx.isAdmin
      ? map.placements.map(mapPlacementToShape)
      : map.placements
          .filter((p) => {
            // Hide private targets from players
            if (p.location && p.location.sichtbarkeit !== "public") return false;
            if (p.quest && p.quest.sichtbarkeit !== "public") return false;
            return p.location || p.quest;
          })
          .map(mapPlacementToShape);

  const canEdit = ctx.isDM || ctx.isAdmin;
  const availableMaps = allMaps.map((m) => ({ id: m.id, name: m.name }));

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <header style={{ background: "#0A0A0A", borderBottom: "1px solid #2A1A1A" }}>
        <div
          style={{
            height: "3px",
            background:
              "linear-gradient(90deg, transparent, var(--dnd-red), var(--dnd-gold), var(--dnd-red), transparent)",
          }}
        />
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4 flex items-center justify-between gap-4">
          <Link
            href="/karten"
            className="font-cinzel text-xs tracking-widest uppercase"
            style={{ color: "var(--dnd-text-muted)" }}
          >
            {t("back")}
          </Link>
          <h1
            className="font-cinzel text-lg md:text-xl font-bold truncate"
            style={{ color: "var(--dnd-heading)" }}
          >
            {map.name}
          </h1>
          {canEdit ? (
            <Link
              href={`/karten/${map.id}/bearbeiten`}
              className="font-cinzel text-xs tracking-widest uppercase px-3 py-1.5"
              style={{ border: "1px solid var(--dnd-gold)", color: "var(--dnd-gold)" }}
            >
              {t("editMap")}
            </Link>
          ) : (
            <div style={{ width: 80 }} />
          )}
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 space-y-4">
        {breadcrumb.length > 1 && (
          <nav className="flex flex-wrap items-center gap-2 text-xs font-cinzel tracking-wide">
            <Link href="/karten" style={{ color: "var(--dnd-text-muted)" }}>
              {t("breadcrumbHome")}
            </Link>
            {breadcrumb.map((b, i) => (
              <span key={b.id} className="flex items-center gap-2">
                <span style={{ color: "var(--dnd-text-muted)" }}>›</span>
                {i === breadcrumb.length - 1 ? (
                  <span style={{ color: "var(--dnd-heading)" }}>{b.name}</span>
                ) : (
                  <Link href={`/karten/${b.id}`} style={{ color: "var(--dnd-gold)" }}>
                    {b.name}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        )}

        {map.beschreibung && (
          <p className="text-sm leading-relaxed" style={{ color: "var(--dnd-text)" }}>
            {map.beschreibung}
          </p>
        )}
        <MapViewLoader
          mapId={map.id}
          imageUrl={map.imageUrl}
          imageWidth={map.imageWidth}
          imageHeight={map.imageHeight}
          placements={visiblePlacements}
          canEdit={canEdit}
          availableLocations={availableLocations}
          availableQuests={availableQuests}
          availableMaps={availableMaps}
        />

        {map.childMaps.length > 0 && (
          <section style={{ border: "1px solid var(--dnd-border)", background: "var(--dnd-bg-card)" }}>
            <div className="px-4 py-2" style={{ background: "var(--dnd-red-dark)", borderBottom: "1px solid var(--dnd-border)" }}>
              <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "var(--dnd-heading)" }}>
                {t("childMaps")}
              </h2>
            </div>
            <div className="px-4 py-3 flex flex-wrap gap-2">
              {map.childMaps.map((c) => (
                <Link
                  key={c.id}
                  href={`/karten/${c.id}`}
                  className="font-cinzel text-xs px-3 py-1.5"
                  style={{
                    background: "#141414",
                    border: "1px solid var(--dnd-border)",
                    color: "var(--dnd-heading)",
                    textDecoration: "none",
                  }}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
