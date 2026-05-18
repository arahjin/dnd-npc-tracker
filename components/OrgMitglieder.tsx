"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { IconPerson } from "@/components/Icons";

type Mitglied = { id: string; npcId: string; name: string; image: string | null; rolle: string | null };
type NPC = { id: string; name: string };

export default function OrgMitglieder({ orgId, mitglieder, alleNPCs }: { orgId: string; mitglieder: Mitglied[]; alleNPCs: NPC[] }) {
  const router = useRouter();
  const t = useTranslations("mitglieder");
  const tc = useTranslations("confirm");
  const [selectedNPC, setSelectedNPC] = useState("");
  const [rolle, setRolle] = useState("");
  const [adding, setAdding] = useState(false);

  const verfuegbareNPCs = alleNPCs.filter((n) => !mitglieder.find((m) => m.npcId === n.id));

  async function handleAdd() {
    if (!selectedNPC) return;
    setAdding(true);
    await fetch(`/api/organisationen/${orgId}/mitglieder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ npcId: selectedNPC, rolle: rolle.trim() || null }),
    });
    setSelectedNPC("");
    setRolle("");
    setAdding(false);
    router.refresh();
  }

  async function handleRemove(npcId: string) {
    if (!confirm(tc("removeMitglied"))) return;
    await fetch(`/api/organisationen/${orgId}/mitglieder`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ npcId }),
    });
    router.refresh();
  }

  const inputStyle = { background: "#0A0A0A", border: "1px solid #2A2A2A", color: "var(--dnd-text)" };

  return (
    <div style={{ border: "1px solid var(--dnd-border)", background: "var(--dnd-bg-card)" }}>
      <div className="px-4 py-2 flex items-center justify-between" style={{ background: "var(--dnd-red-dark)", borderBottom: "1px solid var(--dnd-border)" }}>
        <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "var(--dnd-heading)" }}>
          {t("titleWithCount", { count: mitglieder.length })}
        </h2>
      </div>

      {/* Mitgliederliste */}
      <div className="divide-y" style={{ borderColor: "#1E1E1E" }}>
        {mitglieder.length === 0 && (
          <p className="px-4 py-4 text-sm" style={{ color: "var(--dnd-text-muted)" }}>{t("emptyMitglieder")}</p>
        )}
        {mitglieder.map((m) => (
          <div key={m.id} className="flex items-center gap-4 px-4 py-3">
            <div className="relative w-10 h-10 shrink-0 overflow-hidden" style={{ border: "1px solid var(--dnd-border)" }}>
              {m.image ? (
                <Image src={m.image} alt={m.name} fill sizes="40px" className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-lg" style={{ background: "#0A0A0A" }}><IconPerson size={20} color="var(--dnd-text-muted)" /></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <Link href={`/npc/${m.npcId}`} className="font-cinzel text-sm font-semibold hover:underline" style={{ color: "var(--dnd-heading)" }}>
                {m.name}
              </Link>
              {m.rolle && <p className="text-xs mt-0.5" style={{ color: "var(--dnd-text-muted)" }}>{m.rolle}</p>}
            </div>
            <button onClick={() => handleRemove(m.npcId)} className="font-cinzel text-xs px-3 py-1 transition-all"
              style={{ border: "1px solid #991B1B", color: "#F87171" }}>
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Mitglied hinzufügen */}
      {verfuegbareNPCs.length > 0 && (
        <div className="px-4 py-4 flex flex-wrap gap-2 items-end" style={{ borderTop: "1px solid #1E1E1E" }}>
          <div className="flex-1 min-w-36">
            <p className="font-cinzel text-xs tracking-widest mb-1.5" style={{ color: "var(--dnd-label)" }}>{t("npcLabel")}</p>
            <select value={selectedNPC} onChange={(e) => setSelectedNPC(e.target.value)}
              className="w-full px-3 py-2 font-cinzel text-sm outline-none" style={inputStyle}>
              <option value="">{t("selectPlaceholder")}</option>
              {verfuegbareNPCs.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-36">
            <p className="font-cinzel text-xs tracking-widest mb-1.5" style={{ color: "var(--dnd-label)" }}>{t("rolleLabel")}</p>
            <input type="text" value={rolle} onChange={(e) => setRolle(e.target.value)}
              placeholder={t("rollePlaceholder")} className="w-full px-3 py-2 text-sm outline-none" style={inputStyle} />
          </div>
          <button onClick={handleAdd} disabled={!selectedNPC || adding}
            className="font-cinzel text-xs tracking-widest px-4 py-2 transition-all disabled:opacity-40"
            style={{ background: "var(--dnd-red)", color: "#F5EDD6", border: "1px solid var(--dnd-red-dark)" }}>
            {adding ? "..." : t("addButton")}
          </button>
        </div>
      )}
    </div>
  );
}
