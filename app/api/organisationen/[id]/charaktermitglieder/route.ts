import { NextRequest, NextResponse } from "next/server";
import { requireKampagneApi } from "@/lib/kampagne";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

async function assertBothInCampaign(organisationId: string, charakterId: string, kampagneId: string) {
  const [org, ch] = await Promise.all([
    prisma.organisation.findUnique({ where: { id: organisationId }, select: { kampagneId: true } }),
    prisma.charakter.findUnique({ where: { id: charakterId }, select: { kampagneId: true } }),
  ]);
  if (!org || !ch) return false;
  if (org.kampagneId && org.kampagneId !== kampagneId) return false;
  if (ch.kampagneId && ch.kampagneId !== kampagneId) return false;
  return true;
}

export async function POST(req: NextRequest, { params }: Params) {
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: organisationId } = await params;
  const { charakterId, rolle } = await req.json();
  if (!charakterId) return NextResponse.json({ error: "charakterId fehlt" }, { status: 400 });

  if (!(await assertBothInCampaign(organisationId, charakterId, ctx.kampagneId)))
    return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

  const mitglied = await prisma.charakterOrganisation.upsert({
    where: { charakterId_organisationId: { charakterId, organisationId } },
    create: { charakterId, organisationId, rolle: rolle || null },
    update: { rolle: rolle || null },
    include: { charakter: { include: { user: { select: { id: true, name: true } } } } },
  });
  return NextResponse.json(mitglied, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const ctx = await requireKampagneApi();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: organisationId } = await params;
  const { charakterId } = await req.json();
  if (!charakterId) return NextResponse.json({ error: "charakterId fehlt" }, { status: 400 });

  if (!(await assertBothInCampaign(organisationId, charakterId, ctx.kampagneId)))
    return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

  await prisma.charakterOrganisation.delete({
    where: { charakterId_organisationId: { charakterId, organisationId } },
  });
  return NextResponse.json({ success: true });
}
