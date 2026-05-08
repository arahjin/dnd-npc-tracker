import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NPCForm from "@/components/NPCForm";

export default async function EditNPC({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const npc = await prisma.nPC.findUnique({ where: { id } });
  if (!npc) notFound();

  return (
    <main className="min-h-screen bg-[#1a1209] text-amber-100">
      <header className="border-b border-amber-900/50 bg-[#120d06] px-6 py-4">
        <div className="mx-auto max-w-2xl">
          <Link href={`/npc/${id}`} className="text-sm text-amber-700 hover:text-amber-400 transition-colors">
            ← Zurück zu {npc.name}
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-8 text-2xl font-bold text-amber-400">{npc.name} bearbeiten</h1>
        <NPCForm
          id={id}
          initial={{
            name: npc.name,
            image: npc.image ?? "",
            status: npc.status,
            beziehung: npc.beziehung,
            organisationen: npc.organisationen ?? "",
            alter: npc.alter ?? "",
            rasse: npc.rasse ?? "",
            herkunft: npc.herkunft ?? "",
            aktuellePosition: npc.aktuellePosition ?? "",
            notizen: npc.notizen ?? "",
          }}
        />
      </div>
    </main>
  );
}
