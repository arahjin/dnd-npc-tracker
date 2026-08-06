"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { IconPin } from "@/components/Icons";
import ViewToggle from "@/components/ViewToggle";
import { useViewMode } from "@/lib/useViewMode";

type Charakter = {
  id: string;
  name: string;
  image: string | null;
  status: string;
  rasse: string | null;
  aktuellePosition: string | null;
  sichtbarkeit: string;
  userId: string;
  user: { name: string };
};

const STATUS_COLORS: Record<string, string> = {
  Lebendig: "#4ADE80", Tot: "#F87171", Vermisst: "#FCD34D", Unbekannt: "#9CA3AF",
};

const selectClass = "font-cinzel text-sm px-3 py-2 outline-none tracking-wide transition-colors";
const selectStyle = { background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)", color: "var(--dnd-text)" };

function CharRow({ c }: { c: Charakter }) {
  const tCommon = useTranslations("common");
  return (
    <Link href={`/charaktere/${c.id}`}
      className="flex items-center gap-4 px-4 py-2.5 transition-colors hover:bg-white/5"
      style={{ borderBottom: "1px solid var(--dnd-border)", color: "var(--dnd-text)" }}>
      <div className="relative w-8 h-8 shrink-0 overflow-hidden rounded-sm" style={{ background: "#0A0A0A" }}>
        {c.image ? (
          <Image src={c.image} alt="" fill sizes="32px" className="object-cover" />
        ) : (
          <Image src="/lorehub_icon.png" alt="" fill sizes="32px" className="object-contain opacity-30" />
        )}
      </div>
      <span className="font-cinzel font-semibold text-sm truncate" style={{ color: "var(--dnd-heading)" }}>{c.name}</span>
      {c.rasse && (
        <span className="hidden md:inline font-cinzel text-xs truncate" style={{ color: "var(--dnd-text-muted)" }}>{c.rasse}</span>
      )}
      <span className="hidden sm:inline font-cinzel text-xs truncate" style={{ color: "var(--dnd-text-muted)" }}>{c.user.name}</span>
      <div className="ml-auto flex items-center gap-2 shrink-0">
        <span className="font-cinzel text-xs" style={{ color: STATUS_COLORS[c.status] ?? "#9CA3AF" }}>{c.status}</span>
        {c.sichtbarkeit === "privat" && (
          <span className="font-cinzel text-xs px-1.5 py-0.5" style={{ background: "#200D0D", color: "#F87171", border: "1px solid #7F1D1D" }}>{tCommon("private")}</span>
        )}
      </div>
    </Link>
  );
}

function CharCard({ c }: { c: Charakter }) {
  const tCommon = useTranslations("common");
  return (
    <Link href={`/charaktere/${c.id}`}
      className="group card-hover transition-all duration-300 block"
      style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}>
      <div style={{ height: "2px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-gold), var(--dnd-red-dark))" }} />
      <div className="relative h-52 w-full overflow-hidden" style={{ background: "#0A0A0A" }}>
        {c.image
          ? <Image src={c.image} alt={c.name} fill sizes="(min-width: 1024px) 280px, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
          : <div className="flex h-full items-center justify-center"><Image src="/lorehub_icon.png" alt="" width={150} height={150} className="object-contain opacity-20" /></div>
        }
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,10,10,0.8) 0%, transparent 50%)" }} />
      </div>
      <div className="p-4">
        <p className="font-cinzel text-xs mb-1" style={{ color: "var(--dnd-text-muted)" }}>{c.user.name}</p>
        <div className="flex items-center gap-2">
          <h2 className="font-cinzel font-semibold text-base leading-tight" style={{ color: "var(--dnd-heading)" }}>{c.name}</h2>
          {c.sichtbarkeit === "privat" && (
            <span className="font-cinzel text-xs px-1.5 py-0.5 shrink-0" style={{ background: "#200D0D", color: "#F87171", border: "1px solid #7F1D1D" }}>{tCommon("private")}</span>
          )}
        </div>
        {c.rasse && <p className="font-cinzel text-xs mt-1" style={{ color: "var(--dnd-text-muted)" }}>{c.rasse}</p>}
        <p className="mt-2 text-xs font-cinzel" style={{ color: STATUS_COLORS[c.status] ?? "#9CA3AF" }}>{c.status}</p>
        {c.aktuellePosition && <p className="mt-1 text-xs flex items-center gap-1" style={{ color: "var(--dnd-text-muted)" }}><IconPin size={11} color="var(--dnd-text-muted)" /> {c.aktuellePosition}</p>}
      </div>
      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, var(--dnd-border), transparent)" }} />
    </Link>
  );
}

export default function CharaktereGrid({
  charaktere,
  currentUserId,
  isDM = false,
}: {
  charaktere: Charakter[];
  currentUserId: string;
  isDM?: boolean;
}) {
  const t = useTranslations("charakter");
  const tCommon = useTranslations("common");

  const [filterVisibility, setFilterVisibility] = useState("");
  const [view, setView] = useViewMode("charakter");

  const filtered = filterVisibility
    ? charaktere.filter((c) => c.sichtbarkeit === filterVisibility)
    : charaktere;

  const own = filtered.filter((c) => c.userId === currentUserId);
  const others = filtered.filter((c) => c.userId !== currentUserId);

  const listContainerStyle = { border: "1px solid var(--dnd-border)", background: "var(--dnd-bg-card)" };

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-3 items-center">
        {isDM && (
          <>
            <select value={filterVisibility} onChange={(e) => setFilterVisibility(e.target.value)} className={selectClass} style={selectStyle}>
              <option value="">{tCommon("allVisibilities")}</option>
              <option value="public">{tCommon("public")}</option>
              <option value="privat">{tCommon("private")}</option>
            </select>
            <p className="font-cinzel text-xs tracking-widest" style={{ color: "var(--dnd-text-muted)" }}>
              {filtered.length} {filtered.length === 1 ? t("countSingle") : t("countPlural")}
            </p>
          </>
        )}
        <div className="ml-auto"><ViewToggle value={view} onChange={setView} /></div>
      </div>

      <section className="mb-10">
        <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase mb-5 pb-2"
          style={{ color: "var(--dnd-label)", borderBottom: "1px solid var(--dnd-border)" }}>
          {t("myChars")}
        </h2>
        {own.length === 0 ? (
          <p className="font-cinzel text-sm" style={{ color: "var(--dnd-text-muted)" }}>
            {filterVisibility ? t("emptyOwnFiltered") : t("emptyOwn")}
          </p>
        ) : view === "list" ? (
          <div style={listContainerStyle}>
            {own.map((c) => <CharRow key={c.id} c={c} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {own.map((c) => <CharCard key={c.id} c={c} />)}
          </div>
        )}
      </section>

      {others.length > 0 && (
        <section>
          <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase mb-5 pb-2"
            style={{ color: "var(--dnd-label)", borderBottom: "1px solid var(--dnd-border)" }}>
            {t("otherChars")}
          </h2>
          {view === "list" ? (
            <div style={listContainerStyle}>
              {others.map((c) => <CharRow key={c.id} c={c} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {others.map((c) => <CharCard key={c.id} c={c} />)}
            </div>
          )}
        </section>
      )}
    </>
  );
}
