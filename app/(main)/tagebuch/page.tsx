import { prisma } from "@/lib/prisma";
import { requireKampagne } from "@/lib/kampagne";
import JournalView from "@/components/JournalView";

export const dynamic = "force-dynamic";

export default async function TagebuchPage() {
  const ctx = await requireKampagne();

  const [npcs, orgs, chars, locations] = await Promise.all([
    prisma.nPC.findMany({ where: { kampagneId: ctx.kampagneId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.organisation.findMany({ where: { kampagneId: ctx.kampagneId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.charakter.findMany({ where: { kampagneId: ctx.kampagneId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.location.findMany({ where: { kampagneId: ctx.kampagneId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const tagOptions = [
    ...npcs.map((n) => ({ id: n.id, label: n.name, typ: "PERSON" })),
    ...orgs.map((o) => ({ id: o.id, label: o.name, typ: "ORGANISATION" })),
    ...chars.map((c) => ({ id: c.id, label: c.name, typ: "CHARAKTER" })),
    ...locations.map((l) => ({ id: l.id, label: l.name, typ: "LOCATION" })),
  ];

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <div className="mx-auto max-w-3xl px-4 md:px-6 py-8 md:py-10">
        <div className="mb-8">
          <h1 className="font-cinzel text-2xl font-bold" style={{ color: "var(--dnd-heading)" }}>Mein Tagebuch</h1>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, var(--dnd-red), transparent)" }} />
            <span style={{ color: "var(--dnd-red)" }}>✦</span>
          </div>
          <p className="mt-2 font-cinzel text-xs tracking-widest" style={{ color: "var(--dnd-text-muted)" }}>
            Privat · Nur du{ctx.isDM ? " und der Dungeon Master" : ""} kannst diese Einträge sehen
          </p>
        </div>
        <JournalView typ="TAGEBUCH" userId={ctx.userId} isDM={ctx.isDM} tagOptions={tagOptions} />
      </div>
    </main>
  );
}
