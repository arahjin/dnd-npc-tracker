import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireKampagne } from "@/lib/kampagne";
import MapViewLoader from "@/components/MapViewLoader";
import type { MapPlacement } from "@/components/MapView";

export default async function KarteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await requireKampagne();
  const t = await getTranslations("karten");

  const [map, availableLocations] = await Promise.all([
    prisma.map.findFirst({
      where: { id, kampagneId: ctx.kampagneId },
      include: {
        placements: {
          include: {
            location: { select: { id: true, name: true, art: true, sichtbarkeit: true } },
          },
        },
      },
    }),
    prisma.location.findMany({
      where: { kampagneId: ctx.kampagneId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!map) notFound();

  const visiblePlacements: MapPlacement[] =
    ctx.isDM || ctx.isAdmin
      ? map.placements.map((p) => ({ id: p.id, x: p.x, y: p.y, location: p.location }))
      : map.placements
          .filter((p) => p.location.sichtbarkeit === "public")
          .map((p) => ({ id: p.id, x: p.x, y: p.y, location: p.location }));

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
          <div style={{ width: 80 }} />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 space-y-4">
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
          canEdit={ctx.isDM || ctx.isAdmin}
          availableLocations={availableLocations}
        />
      </div>
    </main>
  );
}
