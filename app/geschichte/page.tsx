import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import SiteHeader from "@/components/SiteHeader";
import JournalView from "@/components/JournalView";

export const dynamic = "force-dynamic";

export default async function GeschichtePage() {
  const session = await auth();
  const userId = session!.user!.id as string;
  const isDM = ["DUNGEON_MASTER", "ADMIN"].includes((session!.user! as { role: string }).role);

  const [npcs, orgs, chars, users] = await Promise.all([
    prisma.nPC.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.organisation.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.charakter.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.user.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const tagOptions = [
    ...npcs.map((n) => ({ id: n.id, label: n.name, typ: "PERSON" })),
    ...orgs.map((o) => ({ id: o.id, label: o.name, typ: "ORGANISATION" })),
    ...chars.map((c) => ({ id: c.id, label: c.name, typ: "CHARAKTER" })),
    ...users.map((u) => ({ id: u.id, label: u.name, typ: "SPIELER" })),
  ];

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <SiteHeader active="npcs" />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <h1 className="font-cinzel text-2xl font-bold" style={{ color: "var(--dnd-heading)" }}>Geschichte</h1>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, var(--dnd-red), transparent)" }} />
            <span style={{ color: "var(--dnd-red)" }}>✦</span>
          </div>
          <p className="mt-2 font-cinzel text-xs tracking-widest" style={{ color: "var(--dnd-text-muted)" }}>
            Öffentlich · Alle Spieler können lesen und schreiben
          </p>
        </div>
        <JournalView typ="GESCHICHTE" userId={userId} isDM={isDM} tagOptions={tagOptions} />
      </div>
    </main>
  );
}
