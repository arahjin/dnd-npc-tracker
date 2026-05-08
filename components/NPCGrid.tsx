"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BEZIEHUNG_OPTIONS, STATUS_OPTIONS } from "@/lib/constants";

type NPC = {
  id: string;
  name: string;
  image: string | null;
  status: string;
  beziehung: string;
  rasse: string | null;
  organisationen: string | null;
  aktuellePosition: string | null;
};

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

export default function NPCGrid({ npcs }: { npcs: NPC[] }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterBeziehung, setFilterBeziehung] = useState("");

  const filtered = npcs.filter((n) => {
    const matchSearch = n.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? n.status === filterStatus : true;
    const matchBeziehung = filterBeziehung ? n.beziehung === filterBeziehung : true;
    return matchSearch && matchStatus && matchBeziehung;
  });

  return (
    <div>
      {/* Filter Bar */}
      <div className="mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="NPC suchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-amber-900/50 bg-[#120d06] px-4 py-2 text-amber-100 placeholder-amber-800 outline-none focus:border-amber-600 flex-1 min-w-48"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-amber-900/50 bg-[#120d06] px-4 py-2 text-amber-100 outline-none focus:border-amber-600"
        >
          <option value="">Alle Status</option>
          {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select
          value={filterBeziehung}
          onChange={(e) => setFilterBeziehung(e.target.value)}
          className="rounded-lg border border-amber-900/50 bg-[#120d06] px-4 py-2 text-amber-100 outline-none focus:border-amber-600"
        >
          <option value="">Alle Beziehungen</option>
          {BEZIEHUNG_OPTIONS.map((b) => <option key={b}>{b}</option>)}
        </select>
      </div>

      {/* Count */}
      <p className="mb-4 text-sm text-amber-700">{filtered.length} NPC{filtered.length !== 1 ? "s" : ""}</p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-amber-800">
          <p className="text-5xl mb-4">🗺</p>
          <p className="text-lg">Keine NPCs gefunden.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((npc) => (
            <Link
              key={npc.id}
              href={`/npc/${npc.id}`}
              className="group rounded-xl border border-amber-900/40 bg-[#1f1508] overflow-hidden hover:border-amber-600/60 transition-all hover:shadow-lg hover:shadow-amber-900/20"
            >
              {/* Image */}
              <div className="relative h-48 w-full bg-[#120d06]">
                {npc.image ? (
                  <Image
                    src={npc.image}
                    alt={npc.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-5xl text-amber-900">
                    👤
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h2 className="font-bold text-amber-200 group-hover:text-amber-400 transition-colors truncate">
                  {npc.name}
                </h2>
                {npc.rasse && (
                  <p className="text-xs text-amber-700 mt-0.5 truncate">{npc.rasse}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[npc.status] ?? "bg-gray-800 text-gray-400"}`}>
                    {npc.status}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${BEZIEHUNG_COLORS[npc.beziehung] ?? "bg-gray-800 text-gray-400"}`}>
                    {npc.beziehung}
                  </span>
                </div>
                {npc.aktuellePosition && (
                  <p className="mt-2 text-xs text-amber-700 truncate">📍 {npc.aktuellePosition}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
