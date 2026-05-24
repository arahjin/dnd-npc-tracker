import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireKampagne } from "@/lib/kampagne";
import { IconMap } from "@/components/Icons";

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

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <p
            className="font-cinzel text-xs tracking-[0.2em] uppercase"
            style={{ color: "var(--dnd-label)" }}
          >
            {maps.length} {maps.length === 1 ? t("countSingleMap") : t("countPluralMaps")}
          </p>
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {maps.map((m) => {
              const count = m._count.placements;
              return (
                <Link
                  key={m.id}
                  href={`/karten/${m.id}`}
                  className="group card-hover transition-all duration-300 block"
                  style={{
                    background: "var(--dnd-bg-card)",
                    border: "1px solid var(--dnd-border)",
                  }}
                >
                  <div
                    style={{
                      height: "2px",
                      background:
                        "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-gold), var(--dnd-red-dark))",
                    }}
                  />
                  <div
                    className="relative w-full overflow-hidden"
                    style={{ height: "160px", background: "#0A0A0A" }}
                  >
                    <Image
                      src={m.imageUrl}
                      alt={m.name}
                      fill
                      sizes="(min-width: 1024px) 280px, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <h2
                      className="font-cinzel font-semibold text-lg leading-tight mb-2"
                      style={{ color: "var(--dnd-heading)" }}
                    >
                      {m.name}
                    </h2>
                    {m.beschreibung && (
                      <p
                        className="text-sm leading-relaxed line-clamp-2 mb-3"
                        style={{ color: "var(--dnd-text)" }}
                      >
                        {m.beschreibung}
                      </p>
                    )}
                    <p
                      className="font-cinzel text-xs tracking-wide"
                      style={{ color: "var(--dnd-red-light)" }}
                    >
                      {count} {count === 1 ? t("countSingle") : t("countPlural")}
                    </p>
                  </div>
                  <div
                    style={{
                      height: "1px",
                      background:
                        "linear-gradient(90deg, transparent, var(--dnd-border), transparent)",
                    }}
                  />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
