import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireKampagneApi } from "@/lib/kampagne";
import { visibilityWhere } from "@/lib/visibility";
import { questCreateSchema } from "@/lib/questSchemas";
import { checkPresetLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/rateLimit";

export async function GET() {
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const quests = await prisma.quest.findMany({
    where: { kampagneId: ctx.kampagneId, ...visibilityWhere(ctx) },
    orderBy: [{ createdAt: "desc" }],
    include: { objectives: { orderBy: { order: "asc" } } },
  });

  // Strip gmNotes for non-DM/Admin users
  const canSeeGmNotes = ctx.isDM || ctx.isAdmin;
  const result = canSeeGmNotes ? quests : quests.map(({ gmNotes: _, ...q }) => q);

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!(await checkPresetLimit(ctx.userId, "quest.create")))
    return rateLimitResponse(RATE_LIMITS["quest.create"].windowSeconds);

  const parsed = questCreateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe.", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const body = parsed.data;
  const canSeeGmNotes = ctx.isDM || ctx.isAdmin;

  const quest = await prisma.quest.create({
    data: {
      kampagneId: ctx.kampagneId,
      erstellerId: ctx.userId,
      title: body.title,
      status: body.status,
      typ: body.typ,
      prioritaet: body.prioritaet ?? null,
      summary: body.summary,
      description: body.description,
      reward: body.reward,
      gmNotes: canSeeGmNotes ? body.gmNotes : null,
      deadline: body.deadline,
      sichtbarkeit: body.sichtbarkeit,
    },
  });
  return NextResponse.json(quest, { status: 201 });
}
