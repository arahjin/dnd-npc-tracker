import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireKampagneApi } from "@/lib/kampagne";
import { visibilityWhere, charakterVisibilityWhere } from "@/lib/visibility";

export const dynamic = "force-dynamic";

/**
 * Lightweight bundle of selectable entities for the active campaign,
 * used to populate Quest form multi-selects. Lazy-fetched from QuestForm.
 */
export async function GET() {
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [npcs, locations, organisationen, charaktere] = await Promise.all([
    prisma.nPC.findMany({
      where: { kampagneId: ctx.kampagneId, ...visibilityWhere(ctx) },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.location.findMany({
      where: { kampagneId: ctx.kampagneId, ...visibilityWhere(ctx) },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.organisation.findMany({
      where: { kampagneId: ctx.kampagneId, ...visibilityWhere(ctx) },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.charakter.findMany({
      where: { kampagneId: ctx.kampagneId, ...charakterVisibilityWhere(ctx) },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return NextResponse.json({ npcs, locations, organisationen, charaktere });
}
