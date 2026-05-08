import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import SiteHeader from "@/components/SiteHeader";
import CharakterForm from "@/components/CharakterForm";

export default async function NewCharakterPage() {
  await auth(); // ensure logged in (middleware handles redirect)
  const orgs = await prisma.organisation.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <SiteHeader active="npcs" />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-8">
          <h1 className="font-cinzel text-3xl font-bold" style={{ color: "var(--dnd-heading)" }}>Neuen Charakter erstellen</h1>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, var(--dnd-red), transparent)" }} />
            <span style={{ color: "var(--dnd-red)" }}>✦</span>
          </div>
        </div>
        <CharakterForm availableOrgs={orgs} />
      </div>
    </main>
  );
}
