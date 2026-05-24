import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireKampagne } from "@/lib/kampagne";
import NewMapForm from "@/components/NewMapForm";

export default async function NewMapPage() {
  const ctx = await requireKampagne();
  if (!ctx.isDM && !ctx.isAdmin) redirect("/karten");
  const t = await getTranslations("karten");

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <div className="mx-auto max-w-2xl px-4 md:px-6 py-10">
        <div className="mb-8">
          <Link
            href="/karten"
            className="font-cinzel text-xs tracking-widest uppercase"
            style={{ color: "var(--dnd-text-muted)" }}
          >
            {t("back")}
          </Link>
          <h1
            className="font-cinzel text-3xl font-bold mt-4"
            style={{ color: "var(--dnd-heading)" }}
          >
            {t("uploadButton")}
          </h1>
          <div className="mt-3 flex items-center gap-3">
            <div
              className="h-px flex-1"
              style={{ background: "linear-gradient(90deg, var(--dnd-red), transparent)" }}
            />
            <span style={{ color: "var(--dnd-red)" }}>✦</span>
          </div>
        </div>
        <NewMapForm />
      </div>
    </main>
  );
}
