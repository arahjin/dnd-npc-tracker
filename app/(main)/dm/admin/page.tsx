import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ErrorLogResolveButton from "./ErrorLogResolveButton";

export default async function AdminPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");

  const errors = await prisma.errorLog.findMany({
    where: { resolved: false },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const t = await getTranslations("admin");

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <div className="mx-auto max-w-2xl px-4 md:px-6 py-10">
        <h1 className="font-cinzel text-2xl font-bold mb-2" style={{ color: "var(--dnd-heading)" }}>
          {t("title")}
        </h1>
        <div className="mt-3 mb-10 flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, var(--dnd-red), transparent)" }} />
          <span style={{ color: "var(--dnd-red)" }}>✦</span>
        </div>

        <section className="p-5 mb-6" style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}>
          <div style={{ height: "2px", marginBottom: "1rem", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-gold), var(--dnd-red-dark))" }} />
          <h2 className="font-cinzel text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--dnd-heading)" }}>
            {t("errorLog")}
            {errors.length > 0 && (
              <span className="font-cinzel text-xs px-2 py-0.5" style={{ background: "#200D0D", color: "#FCA5A5", border: "1px solid #991B1B" }}>
                {t("errorsOpen", { count: errors.length })}
              </span>
            )}
          </h2>
          {errors.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--dnd-text-muted)" }}>{t("noErrors")}</p>
          ) : (
            <ul className="space-y-3">
              {errors.map((e) => (
                <li key={e.id} className="p-3" style={{ background: "#120808", border: "1px solid #2A1A1A" }}>
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <p className="font-cinzel text-sm" style={{ color: "#FCA5A5" }}>{e.message}</p>
                    <ErrorLogResolveButton id={e.id} />
                  </div>
                  <p className="text-xs" style={{ color: "var(--dnd-text-muted)" }}>
                    {new Date(e.createdAt).toLocaleString("de-DE")}
                    {e.userId && ` · User: ${e.userId}`}
                  </p>
                  {e.context && (
                    <pre className="mt-2 text-xs whitespace-pre-wrap overflow-x-auto" style={{ color: "var(--dnd-text-muted)", fontFamily: "monospace" }}>
                      {e.context}
                    </pre>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="p-5 mb-6" style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}>
          <div style={{ height: "2px", marginBottom: "1rem", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-gold), var(--dnd-red-dark))" }} />
          <h2 className="font-cinzel text-sm font-semibold mb-1" style={{ color: "var(--dnd-heading)" }}>
            {t("siteSettingsTitle")}
          </h2>
          <p className="text-sm mb-4" style={{ color: "var(--dnd-text-muted)" }}>
            {t("siteSettingsDesc")}
          </p>
          <Link href="/dm/site-settings" className="ddb-cta">
            {t("editSettings")}
          </Link>
        </section>

        <Link href="/" className="font-cinzel text-xs tracking-widest" style={{ color: "var(--dnd-text-muted)" }}>
          {t("backToHome")}
        </Link>
      </div>
    </main>
  );
}
