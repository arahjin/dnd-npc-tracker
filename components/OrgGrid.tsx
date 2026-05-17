"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { IconOrganisation, IconPin } from "@/components/Icons";
import { stripMentions } from "@/lib/mentions";

type Org = {
  id: string;
  name: string;
  image: string | null;
  typ: string | null;
  region: string | null;
  alignment: string | null;
  beschreibung: string | null;
  sichtbarkeit: string;
  _count: { mitglieder: number };
};

const ALIGNMENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Rechtschaffen Gut":    { bg: "#0A1020", text: "#60A5FA", border: "#1E3A8A" },
  "Neutral Gut":          { bg: "#0A1A12", text: "#34D399", border: "#065F46" },
  "Chaotisch Gut":        { bg: "#0D1A0A", text: "#86EFAC", border: "#166534" },
  "Rechtschaffen Neutral":{ bg: "#141414", text: "#D1D5DB", border: "#374151" },
  "Wahrhaft Neutral":     { bg: "#141414", text: "#9CA3AF", border: "#374151" },
  "Chaotisch Neutral":    { bg: "#1A1208", text: "#FCD34D", border: "#92400E" },
  "Rechtschaffen Böse":   { bg: "#200D0D", text: "#FCA5A5", border: "#991B1B" },
  "Neutral Böse":         { bg: "#200D0D", text: "#F87171", border: "#991B1B" },
  "Chaotisch Böse":       { bg: "#1A0A0A", text: "#EF4444", border: "#7F1D1D" },
};

const selectClass = "font-cinzel text-sm px-3 py-2 outline-none tracking-wide transition-colors";
const selectStyle = { background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)", color: "var(--dnd-text)" };

export default function OrgGrid({ orgs, isDM = false }: { orgs: Org[]; isDM?: boolean }) {
  const t = useTranslations("organisation");
  const tCommon = useTranslations("common");

  const [filterVisibility, setFilterVisibility] = useState("");

  const filtered = filterVisibility
    ? orgs.filter((o) => o.sichtbarkeit === filterVisibility)
    : orgs;

  return (
    <>
      {isDM && (
        <div className="mb-6 flex flex-wrap gap-3 items-center">
          <select value={filterVisibility} onChange={(e) => setFilterVisibility(e.target.value)} className={selectClass} style={selectStyle}>
            <option value="">{tCommon("allVisibilities")}</option>
            <option value="public">{tCommon("public")}</option>
            <option value="privat">{tCommon("private")}</option>
          </select>
          <p className="font-cinzel text-xs tracking-widest" style={{ color: "var(--dnd-text-muted)" }}>
            {filtered.length} {filtered.length === 1 ? t("countSingle") : t("countPlural")}
          </p>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="mb-4" style={{ opacity: 0.3 }}><IconOrganisation size={52} color="var(--dnd-text-muted)" /></div>
          <p className="font-cinzel text-lg" style={{ color: "var(--dnd-text-muted)" }}>
            {filterVisibility ? t("emptyFiltered") : t("empty")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((org) => {
            const alignColors = org.alignment ? (ALIGNMENT_COLORS[org.alignment] ?? ALIGNMENT_COLORS["Wahrhaft Neutral"]) : ALIGNMENT_COLORS["Wahrhaft Neutral"];
            return (
              <Link key={org.id} href={`/organisationen/${org.id}`}
                className="group card-hover transition-all duration-300 block"
                style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}>
                <div style={{ height: "2px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-gold), var(--dnd-red-dark))" }} />
                {org.image && (
                  <div className="relative w-full h-40 overflow-hidden" style={{ background: "#0A0A0A" }}>
                    <Image src={org.image} alt={org.name} fill sizes="(min-width: 1024px) 280px, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <h2 className="font-cinzel font-semibold text-lg leading-tight truncate" style={{ color: "var(--dnd-heading)" }}>{org.name}</h2>
                      {org.sichtbarkeit === "privat" && (
                        <span className="font-cinzel text-xs px-1.5 py-0.5 shrink-0" style={{ background: "#200D0D", color: "#F87171", border: "1px solid #7F1D1D" }}>{tCommon("private")}</span>
                      )}
                    </div>
                    {org.alignment && (
                      <span className="font-cinzel text-xs px-2 py-0.5 shrink-0" style={{ background: alignColors.bg, color: alignColors.text, border: `1px solid ${alignColors.border}` }}>
                        {org.alignment}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3 mb-3">
                    {org.typ && <span className="text-xs" style={{ color: "var(--dnd-text-muted)" }}><><IconOrganisation size={11} /> {org.typ}</></span>}
                    {org.region && <span className="text-xs" style={{ color: "var(--dnd-text-muted)" }}><><IconPin size={11} /> {org.region}</></span>}
                  </div>
                  {org.beschreibung && (
                    <p className="text-sm leading-relaxed line-clamp-2" style={{ color: "var(--dnd-text)" }}>{stripMentions(org.beschreibung)}</p>
                  )}
                  <p className="mt-3 font-cinzel text-xs tracking-wide" style={{ color: "var(--dnd-red-light)" }}>
                    {org._count.mitglieder} {org._count.mitglieder === 1 ? t("member") : t("members")}
                  </p>
                </div>
                <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, var(--dnd-border), transparent)" }} />
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
