"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";

export type KartenListItem = {
  id: string;
  name: string;
  beschreibung: string | null;
  imageUrl: string;
  placementCount: number;
};

export default function KartenList({ maps }: { maps: KartenListItem[] }) {
  const t = useTranslations("karten");
  const [search, setSearch] = useState("");
  const filtered = search.trim()
    ? maps.filter((m) => m.name.toLowerCase().includes(search.trim().toLowerCase()))
    : maps;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-48">
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 font-cinzel text-sm tracking-wide outline-none transition-colors"
            style={{
              background: "var(--dnd-bg-card)",
              border: "1px solid var(--dnd-border)",
              color: "var(--dnd-text)",
            }}
          />
        </div>
        <p
          className="font-cinzel text-xs tracking-[0.2em] uppercase"
          style={{ color: "var(--dnd-label)" }}
        >
          {filtered.length} {filtered.length === 1 ? t("countSingleMap") : t("countPluralMaps")}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p
          className="font-cinzel text-sm py-10 text-center"
          style={{ color: "var(--dnd-text-muted)" }}
        >
          {t("noSearchResults")}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <Link
              key={m.id}
              href={`/karten/${m.id}`}
              className="group card-hover transition-all duration-300 block"
              style={{
                background: "var(--dnd-bg-card)",
                border: "1px solid var(--dnd-border)",
              }}
            >
              <div
                style={{
                  height: "2px",
                  background:
                    "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-gold), var(--dnd-red-dark))",
                }}
              />
              <div
                className="relative w-full overflow-hidden"
                style={{ height: "160px", background: "#0A0A0A" }}
              >
                <Image
                  src={m.imageUrl}
                  alt={m.name}
                  fill
                  sizes="(min-width: 1024px) 280px, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <h2
                  className="font-cinzel font-semibold text-lg leading-tight mb-2"
                  style={{ color: "var(--dnd-heading)" }}
                >
                  {m.name}
                </h2>
                {m.beschreibung && (
                  <p
                    className="text-sm leading-relaxed line-clamp-2 mb-3"
                    style={{ color: "var(--dnd-text)" }}
                  >
                    {m.beschreibung}
                  </p>
                )}
                <p
                  className="font-cinzel text-xs tracking-wide"
                  style={{ color: "var(--dnd-red-light)" }}
                >
                  {m.placementCount}{" "}
                  {m.placementCount === 1 ? t("countSingle") : t("countPlural")}
                </p>
              </div>
              <div
                style={{
                  height: "1px",
                  background:
                    "linear-gradient(90deg, transparent, var(--dnd-border), transparent)",
                }}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
