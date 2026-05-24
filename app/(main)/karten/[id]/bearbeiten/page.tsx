import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireKampagne } from "@/lib/kampagne";
import EditMapForm from "@/components/EditMapForm";

export default async function EditMapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await requireKampagne();
  if (!ctx.isDM && !ctx.isAdmin) redirect(`/karten/${id}`);
  const t = await getTranslations("karten");

  const [map, availableMaps] = await Promise.all([
    prisma.map.findFirst({
      where: { id, kampagneId: ctx.kampagneId },
      select: {
        id: true,
        name: true,
        beschreibung: true,
        imageUrl: true,
        parentMapId: true,
      },
    }),
    prisma.map.findMany({
      where: { kampagneId: ctx.kampagneId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  if (!map) notFound();

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <div className="mx-auto max-w-2xl px-4 md:px-6 py-10">
        <div className="mb-8">
          <Link
            href={`/karten/${id}`}
            className="font-cinzel text-xs tracking-widest uppercase"
            style={{ color: "var(--dnd-text-muted)" }}
          >
            {t("back")}
          </Link>
          <h1
            className="font-cinzel text-3xl font-bold mt-4"
            style={{ color: "var(--dnd-heading)" }}
          >
            {t("editMapTitle")}
          </h1>
          <div className="mt-3 flex items-center gap-3">
            <div
              className="h-px flex-1"
              style={{ background: "linear-gradient(90deg, var(--dnd-red), transparent)" }}
            />
            <span style={{ color: "var(--dnd-red)" }}>✦</span>
          </div>
        </div>
        <EditMapForm
          mapId={map.id}
          initialName={map.name}
          initialBeschreibung={map.beschreibung ?? ""}
          initialImageUrl={map.imageUrl}
          initialParentMapId={map.parentMapId}
          availableMaps={availableMaps}
        />
      </div>
    </main>
  );
}
