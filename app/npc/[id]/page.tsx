import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/DeleteButton";

const STATUS_COLORS: Record<string, string> = {
  Lebendig: "bg-green-900 text-green-300",
  Tot: "bg-red-900 text-red-300",
  Vermisst: "bg-yellow-900 text-yellow-300",
  Unbekannt: "bg-gray-800 text-gray-400",
};

const BEZIEHUNG_COLORS: Record<string, string> = {
  "Verbündet": "bg-blue-900 text-blue-300",
  Freundlich: "bg-emerald-900 text-emerald-300",
  Neutral: "bg-gray-800 text-gray-400",
  Feindlich: "bg-red-900 text-red-300",
  Unbekannt: "bg-gray-800 text-gray-400",
};

export default async function NPCDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const npc = await prisma.nPC.findUnique({ where: { id } });
  if (!npc) notFound();

  const fields = [
    { label: "Rasse", value: npc.rasse },
    { label: "Alter", value: npc.alter },
    { label: "Herkunft", value: npc.herkunft },
    { label: "Aktuelle Position", value: npc.aktuellePosition },
    { label: "Organisationen", value: npc.organisationen },
  ];

  return (
    <main className="min-h-screen bg-[#1a1209] text-amber-100">
      <header className="border-b border-amber-900/50 bg-[#120d06] px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="text-sm text-amber-700 hover:text-amber-400 transition-colors">
            ← Zurück zur Übersicht
          </Link>
          <div className="flex gap-2">
            <Link
              href={`/npc/${id}/edit`}
              className="rounded-lg border border-amber-700 px-4 py-2 text-sm font-semibold text-amber-400 hover:bg-amber-900/30 transition-colors"
            >
              Bearbeiten
            </Link>
            <DeleteButton id={id} />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Left: Image + Badges */}
          <div className="md:col-span-1">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#120d06] border border-amber-900/40">
              {npc.image ? (
                <Image src={npc.image} alt={npc.name} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-7xl text-amber-900">
                  👤
                </div>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[npc.status] ?? "bg-gray-800 text-gray-400"}`}>
                {npc.status}
              </span>
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${BEZIEHUNG_COLORS[npc.beziehung] ?? "bg-gray-800 text-gray-400"}`}>
                {npc.beziehung}
              </span>
            </div>
          </div>

          {/* Right: Details */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-amber-400">{npc.name}</h1>
            </div>

            <div className="rounded-xl border border-amber-900/40 bg-[#1f1508] p-5 space-y-3">
              {fields.map(({ label, value }) =>
                value ? (
                  <div key={label} className="flex gap-3">
                    <span className="w-36 shrink-0 text-sm text-amber-700">{label}</span>
                    <span className="text-sm text-amber-200">{value}</span>
                  </div>
                ) : null
              )}
              {fields.every((f) => !f.value) && (
                <p className="text-sm text-amber-800">Keine Details eingetragen.</p>
              )}
            </div>

            {npc.notizen && (
              <div className="rounded-xl border border-amber-900/40 bg-[#1f1508] p-5">
                <h2 className="mb-3 text-sm font-semibold text-amber-600 uppercase tracking-wider">Notizen</h2>
                <p className="text-sm text-amber-200 whitespace-pre-wrap leading-relaxed">{npc.notizen}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
