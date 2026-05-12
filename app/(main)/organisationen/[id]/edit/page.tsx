import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canSeePrivate } from "@/lib/visibility";
import OrgForm from "@/components/OrgForm";

export default async function EditOrganisation({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user.id;
  const role = session!.user.role;
  const isDM = role === "DUNGEON_MASTER";
  const isAdmin = role === "ADMIN";

  const org = await prisma.organisation.findUnique({ where: { id } });
  if (!org) notFound();

  const showPrivate = canSeePrivate({ userId, isDM, isAdmin }, org.erstellerId);

  const locations = await prisma.location.findMany({
    where: { kampagneId: org.kampagneId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <header style={{ background: "#0A0A0A", borderBottom: "1px solid #2A1A1A" }}>
        <div style={{ height: "3px", background: "linear-gradient(90deg, transparent, var(--dnd-red), var(--dnd-gold), var(--dnd-red), transparent)" }} />
        <div className="mx-auto max-w-2xl px-4 md:px-6 py-4">
          <a href={`/organisationen/${id}`} className="font-cinzel text-xs tracking-widest uppercase" style={{ color: "var(--dnd-text-muted)" }}>← Zurück zu {org.name}</a>
        </div>
      </header>
      <div className="mx-auto max-w-2xl px-4 md:px-6 py-10">
        <div className="mb-8">
          <h1 className="font-cinzel text-3xl font-bold" style={{ color: "var(--dnd-heading)" }}>{org.name} bearbeiten</h1>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, var(--dnd-red), transparent)" }} />
            <span style={{ color: "var(--dnd-red)" }}>✦</span>
          </div>
        </div>
        <OrgForm id={id} availableLocations={locations} canSeePrivate={showPrivate} initial={{
          name: org.name, beschreibung: org.beschreibung ?? "", typ: org.typ ?? "",
          region: org.region ?? "", alignment: org.alignment ?? "", beziehungZurGruppe: org.beziehungZurGruppe ?? "",
          gottheit: org.gottheit ?? "", sichtbarkeit: org.sichtbarkeit ?? "public",
          ...(showPrivate && { privateNotizen: org.privateNotizen ?? "" }),
        }} />
      </div>
    </main>
  );
}
