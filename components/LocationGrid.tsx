"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { LocationArtIcon, IconPin, IconMap, IconGlobe, IconPeople } from "@/components/Icons";
import { stripMentions } from "@/lib/mentions";

type Location = {
  id: string;
  name: string;
  image: string | null;
  art: string | null;
  land: string | null;
  region: string | null;
  population: number | null;
  wissenswertes: string | null;
  sichtbarkeit: string;
  _count: { npcs: number; organisationen: number; charaktere: number };
};

const selectClass = "font-cinzel text-sm px-3 py-2 outline-none tracking-wide transition-colors";
const selectStyle = { background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)", color: "var(--dnd-text)" };

export default function LocationGrid({ locations, isDM = false }: { locations: Location[]; isDM?: boolean }) {
  const t = useTranslations("location");
  const tCommon = useTranslations("common");

  const [filterVisibility, setFilterVisibility] = useState("");

  const filtered = filterVisibility
    ? locations.filter((l) => l.sichtbarkeit === filterVisibility)
    : locations;

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
          <div className="mb-4" style={{ opacity: 0.3 }}><IconMap size={52} color="var(--dnd-text-muted)" /></div>
          <p className="font-cinzel text-lg" style={{ color: "var(--dnd-text-muted)" }}>
            {filterVisibility ? t("emptyFiltered") : t("empty")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((loc) => {
            const linked = loc._count.npcs + loc._count.organisationen + loc._count.charaktere;
            return (
              <Link key={loc.id} href={`/locations/${loc.id}`}
                className="group card-hover transition-all duration-300 block"
                style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)" }}>
                <div style={{ height: "2px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-gold), var(--dnd-red-dark))" }} />
                {loc.image && (
                  <div className="relative w-full h-40 overflow-hidden" style={{ background: "#0A0A0A" }}>
                    <Image src={loc.image} alt={loc.name} fill sizes="(min-width: 1024px) 280px, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="shrink-0 flex items-center mt-0.5"><LocationArtIcon art={loc.art} size={20} color="var(--dnd-text-muted)" /></span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="font-cinzel font-semibold text-lg leading-tight" style={{ color: "var(--dnd-heading)" }}>{loc.name}</h2>
                        {loc.sichtbarkeit === "privat" && (
                          <span className="font-cinzel text-xs px-1.5 py-0.5 shrink-0" style={{ background: "#200D0D", color: "#F87171", border: "1px solid #7F1D1D" }}>{tCommon("private")}</span>
                        )}
                      </div>
                      {loc.art && <p className="font-cinzel text-xs mt-0.5" style={{ color: "var(--dnd-text-muted)" }}>{loc.art}</p>}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 mb-3">
                    {loc.land && <span className="text-xs flex items-center gap-1" style={{ color: "var(--dnd-text-muted)" }}><IconGlobe size={11} /> {loc.land}</span>}
                    {loc.region && <span className="text-xs flex items-center gap-1" style={{ color: "var(--dnd-text-muted)" }}><IconPin size={11} /> {loc.region}</span>}
                    {loc.population != null && <span className="text-xs flex items-center gap-1" style={{ color: "var(--dnd-text-muted)" }}><IconPeople size={11} /> {loc.population.toLocaleString("de-DE")}</span>}
                  </div>
                  {loc.wissenswertes && (
                    <p className="text-sm leading-relaxed line-clamp-2 mb-3" style={{ color: "var(--dnd-text)" }}>{stripMentions(loc.wissenswertes)}</p>
                  )}
                  {linked > 0 && (
                    <p className="font-cinzel text-xs tracking-wide" style={{ color: "var(--dnd-red-light)" }}>
                      {linked} {linked === 1 ? tCommon("connection") : tCommon("connections")}
                    </p>
                  )}
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
