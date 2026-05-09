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
  aktuellePosition: string | null;
  organisationen: { organisation: { id: string; name: string } }[];
};

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Lebendig:  { bg: "#0D2010", text: "#4ADE80", border: "#166534" },
  Tot:       { bg: "#200D0D", text: "#F87171", border: "#991B1B" },
  Vermisst:  { bg: "#201A0A", text: "#FCD34D", border: "#92400E" },
  Unbekannt: { bg: "#141414", text: "#9CA3AF", border: "#374151" },
};

const BEZIEHUNG_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Verbündet": { bg: "#0A1020", text: "#60A5FA", border: "#1E3A8A" },
  Freundlich:  { bg: "#0A1A12", text: "#34D399", border: "#065F46" },
  Neutral:     { bg: "#141414", text: "#9CA3AF", border: "#374151" },
  Feindlich:   { bg: "#200D0D", text: "#F87171", border: "#991B1B" },
  Unbekannt:   { bg: "#141414", text: "#9CA3AF", border: "#374151" },
};

function Badge({ label, colors }: { label: string; colors: { bg: string; text: string; border: string } }) {
  return (
    <span
      className="font-cinzel text-xs px-2 py-0.5 rounded-sm tracking-wide"
      style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
    >
      {label}
    </span>
  );
}

export default function NPCGrid({ npcs, availableOrgs = [] }: { npcs: NPC[]; availableOrgs?: { id: string; name: string }[] }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterBeziehung, setFilterBeziehung] = useState("");
  const [filterOrg, setFilterOrg] = useState("");

  const filtered = npcs.filter((n) => {
    const matchSearch = n.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? n.status === filterStatus : true;
    const matchBeziehung = filterBeziehung ? n.beziehung === filterBeziehung : true;
    const matchOrg = filterOrg ? n.organisationen.some((m) => m.organisation.id === filterOrg) : true;
    return matchSearch && matchStatus && matchBeziehung && matchOrg;
  });

  const selectClass = "font-cinzel text-sm px-3 py-2 outline-none tracking-wide transition-colors";

  return (
    <div>
      {/* Filter Bar */}
      <div className="mb-8 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-48 relative">
          <input
            type="text"
            placeholder="NPC suchen..."
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
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={selectClass}
          style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)", color: "var(--dnd-text)" }}
        >
          <option value="">Alle Status</option>
          {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select
          value={filterBeziehung}
          onChange={(e) => setFilterBeziehung(e.target.value)}
          className={selectClass}
          style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)", color: "var(--dnd-text)" }}
        >
          <option value="">Alle Beziehungen</option>
          {BEZIEHUNG_OPTIONS.map((b) => <option key={b}>{b}</option>)}
        </select>
        {availableOrgs.length > 0 && (
          <select
            value={filterOrg}
            onChange={(e) => setFilterOrg(e.target.value)}
            className={selectClass}
            style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)", color: "var(--dnd-text)" }}
          >
            <option value="">Alle Organisationen</option>
            {availableOrgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        )}
      </div>

      {/* Count */}
      <p className="font-cinzel text-xs tracking-widest mb-6" style={{ color: "var(--dnd-text-muted)" }}>
        {filtered.length} {filtered.length === 1 ? "CHARAKTER" : "CHARAKTERE"} GEFUNDEN
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32">
          <p className="text-5xl mb-4">🗺️</p>
          <p className="font-cinzel text-lg" style={{ color: "var(--dnd-text-muted)" }}>Keine Charaktere gefunden</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((npc) => (
            <Link
              key={npc.id}
              href={`/npc/${npc.id}`}
              className="group card-hover transition-all duration-300 block"
              style={{
                background: "var(--dnd-bg-card)",
                border: "1px solid var(--dnd-border)",
              }}
            >
              {/* Top accent */}
              <div style={{ height: "2px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-gold), var(--dnd-red-dark))" }} />

              {/* Image */}
              <div className="relative h-52 w-full overflow-hidden" style={{ background: "#FFFFFF" }}>
                {npc.image ? (
                  <Image src={npc.image} alt={npc.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center" style={{ background: "#FFFFFF" }}>
                    <Image src="/wildgipfel_logo.png" alt="Kein Bild" width={80} height={36} className="object-contain opacity-20" />
                  </div>
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,10,10,0.8) 0%, transparent 50%)" }} />
              </div>

              {/* Info */}
              <div className="p-4">
                <h2 className="font-cinzel font-semibold text-base leading-tight group-hover:transition-colors"
                  style={{ color: "var(--dnd-heading)" }}>
                  {npc.name}
                </h2>
                {npc.rasse && (
                  <p className="font-cinzel text-xs mt-1 tracking-wider" style={{ color: "var(--dnd-text-muted)" }}>
                    {npc.rasse}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge label={npc.status} colors={STATUS_COLORS[npc.status] ?? STATUS_COLORS["Unbekannt"]} />
                  <Badge label={npc.beziehung} colors={BEZIEHUNG_COLORS[npc.beziehung] ?? BEZIEHUNG_COLORS["Unbekannt"]} />
                </div>

                {npc.aktuellePosition && (
                  <p className="mt-3 text-xs" style={{ color: "var(--dnd-text-muted)" }}>
                    📍 {npc.aktuellePosition}
                  </p>
                )}
              </div>

              {/* Bottom accent */}
              <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, var(--dnd-border), transparent)" }} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
