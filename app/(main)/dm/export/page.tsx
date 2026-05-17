import { requireKampagne } from "@/lib/kampagne";
import { redirect } from "next/navigation";
import ExportButton from "@/components/ExportButton";
import { getTranslations } from "next-intl/server";

export default async function ExportPage() {
  const ctx = await requireKampagne();
  if (!ctx.isDM) redirect("/npc");

  const t = await getTranslations("dmExport");

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <div className="mx-auto max-w-2xl px-4 md:px-6 py-10">
        <h1 className="font-cinzel text-2xl font-bold mb-1" style={{ color: "var(--dnd-heading)" }}>
          {t("title")}
        </h1>
        <div className="mt-3 mb-8 flex items-center gap-3">
          <div className="h-px w-40" style={{ background: "linear-gradient(90deg, var(--dnd-red), transparent)" }} />
          <span style={{ color: "var(--dnd-red)" }}>✦</span>
        </div>

        <div className="space-y-6" style={{ border: "1px solid var(--dnd-border)", background: "var(--dnd-bg-card)" }}>
          <div style={{ height: "2px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-gold), var(--dnd-red-dark))" }} />
          <div className="px-6 pb-6 space-y-4">
            <p className="text-sm leading-relaxed" style={{ color: "var(--dnd-text)" }}>
              {t("descriptionWithName", { name: ctx.kampagneName })}
            </p>

            <div className="space-y-2 text-sm" style={{ color: "var(--dnd-text-muted)" }}>
              {([1, 2, 3, 4, 5, 6] as const).map((n) => (
                <p key={n} className="flex items-center gap-2">
                  <span style={{ color: "var(--dnd-gold)" }}>✦</span> {t(`item${n}` as Parameters<typeof t>[0])}
                </p>
              ))}
            </div>

            <div className="pt-2">
              <ExportButton />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
