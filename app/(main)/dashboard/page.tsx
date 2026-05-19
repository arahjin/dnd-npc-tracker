import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireKampagne } from "@/lib/kampagne";
import { visibilityWhere, charakterVisibilityWhere } from "@/lib/visibility";

type StatTileProps = {
  href: string;
  label: string;
  value: number | string;
  hint?: string;
};

function StatTile({ href, label, value, hint }: StatTileProps) {
  return (
    <Link
      href={href}
      className="group block transition-all"
      style={{
        background: "var(--dnd-bg-card)",
        border: "1px solid var(--dnd-border)",
        padding: "24px 22px",
        position: "relative",
        textDecoration: "none",
      }}
    >
      <div style={{ height: "2px", position: "absolute", top: 0, left: 0, right: 0, background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-gold), var(--dnd-red-dark))" }} />
      <p className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "var(--dnd-label)" }}>
        {label}
      </p>
      <p className="font-cinzel font-bold mt-3" style={{ color: "var(--dnd-heading)", fontSize: "2.5rem", lineHeight: 1 }}>
        {value}
      </p>
      {hint && (
        <p className="mt-2 text-xs" style={{ color: "var(--dnd-text-muted)", fontFamily: "var(--font-roboto), sans-serif" }}>
          {hint}
        </p>
      )}
      <span
        className="font-cinzel text-xs tracking-widest mt-4 inline-block transition-colors"
        style={{ color: "var(--dnd-gold)" }}
      >
        →
      </span>
    </Link>
  );
}

type JournalTileProps = {
  href: string;
  label: string;
  entry: { titel: string | null; inhalt: string; createdAt: Date; userName?: string | null } | null;
  emptyText: string;
  noneText: string;
};

function JournalTile({ href, label, entry, emptyText, noneText }: JournalTileProps) {
  return (
    <Link
      href={href}
      className="group block transition-all"
      style={{
        background: "var(--dnd-bg-card)",
        border: "1px solid var(--dnd-border)",
        padding: "24px 22px",
        position: "relative",
        textDecoration: "none",
      }}
    >
      <div style={{ height: "2px", position: "absolute", top: 0, left: 0, right: 0, background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-gold), var(--dnd-red-dark))" }} />
      <p className="font-cinzel text-xs tracking-[0.2em] uppercase mb-3" style={{ color: "var(--dnd-label)" }}>
        {label}
      </p>
      {entry ? (
        <>
          <p className="font-cinzel font-semibold" style={{ color: "var(--dnd-heading)", fontSize: "1.05rem", lineHeight: 1.3 }}>
            {entry.titel ?? emptyText}
          </p>
          <p className="mt-2 text-sm overflow-hidden" style={{
            color: "var(--dnd-text)", fontFamily: "var(--font-roboto), sans-serif",
            display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
          }}>
            {entry.inhalt}
          </p>
          <p className="mt-3 text-xs" style={{ color: "var(--dnd-text-muted)" }}>
            {entry.userName ? `${entry.userName} · ` : ""}
            {new Intl.DateTimeFormat(undefined, { day: "2-digit", month: "short", year: "numeric" }).format(entry.createdAt)}
          </p>
        </>
      ) : (
        <p className="text-sm" style={{ color: "var(--dnd-text-muted)", fontFamily: "var(--font-roboto), sans-serif" }}>
          {noneText}
        </p>
      )}
      <span className="font-cinzel text-xs tracking-widest mt-4 inline-block" style={{ color: "var(--dnd-gold)" }}>
        →
      </span>
    </Link>
  );
}

export default async function DashboardPage() {
  const ctx = await requireKampagne();
  const t = await getTranslations("dashboard");
  const tNav = await getTranslations("nav");

  const [
    npcCount,
    locationCount,
    orgCount,
    charakterCount,
    openQuestCount,
    totalQuestCount,
    lastGeschichte,
    lastTagebuch,
  ] = await Promise.all([
    prisma.nPC.count({ where: { kampagneId: ctx.kampagneId, ...visibilityWhere(ctx) } }),
    prisma.location.count({ where: { kampagneId: ctx.kampagneId, ...visibilityWhere(ctx) } }),
    prisma.organisation.count({ where: { kampagneId: ctx.kampagneId, ...visibilityWhere(ctx) } }),
    prisma.charakter.count({ where: { kampagneId: ctx.kampagneId, ...charakterVisibilityWhere(ctx) } }),
    prisma.quest.count({ where: { kampagneId: ctx.kampagneId, status: "Aktiv", ...visibilityWhere(ctx) } }),
    prisma.quest.count({ where: { kampagneId: ctx.kampagneId, ...visibilityWhere(ctx) } }),
    prisma.journalEntry.findFirst({
      where: { kampagneId: ctx.kampagneId, typ: "GESCHICHTE" },
      orderBy: { createdAt: "desc" },
      select: { id: true, titel: true, inhalt: true, createdAt: true, user: { select: { name: true } } },
    }),
    prisma.journalEntry.findFirst({
      where: { kampagneId: ctx.kampagneId, typ: "TAGEBUCH", userId: ctx.userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, titel: true, inhalt: true, createdAt: true },
    }),
  ]);

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-10">

        {/* Title */}
        <div className="mb-8">
          <h1 className="font-cinzel text-3xl font-bold" style={{ color: "var(--dnd-heading)" }}>
            {ctx.kampagneName}
          </h1>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-px flex-1 max-w-xs" style={{ background: "linear-gradient(90deg, var(--dnd-red), transparent)" }} />
            <span style={{ color: "var(--dnd-red)" }}>✦</span>
            <p className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "var(--dnd-label)" }}>
              {t("subtitle")}
            </p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatTile href="/npc" label={tNav("npcs")} value={npcCount} />
          <StatTile href="/locations" label={tNav("locations")} value={locationCount} />
          <StatTile href="/organisationen" label={tNav("organisationen")} value={orgCount} />
          <StatTile href="/charaktere" label={tNav("charaktere")} value={charakterCount} />
          <StatTile
            href="/quests"
            label={t("openQuests")}
            value={openQuestCount}
            hint={t("ofTotal", { total: totalQuestCount })}
          />
        </div>

        {/* Journal section */}
        <div className="mt-10 mb-4">
          <h2 className="font-cinzel text-lg tracking-[0.15em] uppercase" style={{ color: "var(--dnd-heading)" }}>
            {t("latestEntries")}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <JournalTile
            href="/geschichte"
            label={tNav("geschichte")}
            entry={lastGeschichte ? {
              titel: lastGeschichte.titel,
              inhalt: lastGeschichte.inhalt,
              createdAt: lastGeschichte.createdAt,
              userName: lastGeschichte.user?.name ?? null,
            } : null}
            emptyText={t("noTitle")}
            noneText={t("noGeschichte")}
          />
          <JournalTile
            href="/tagebuch"
            label={tNav("tagebuch")}
            entry={lastTagebuch}
            emptyText={t("noTitle")}
            noneText={t("noTagebuch")}
          />
        </div>

      </div>
      <footer className="mt-auto py-6 text-center">
        <p className="font-cinzel text-xs tracking-widest" style={{ color: "var(--dnd-text-muted)" }}>
          ✦ {ctx.kampagneName.toUpperCase()} ✦
        </p>
      </footer>
    </main>
  );
}
