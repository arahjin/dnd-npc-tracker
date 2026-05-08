"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

type Props = { name: string; role: string };

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  DUNGEON_MASTER: "Dungeon Master",
  SPIELER: "Spieler",
};

const ROLE_ICON: Record<string, string> = {
  ADMIN: "★",
  DUNGEON_MASTER: "⚔",
  SPIELER: "🎲",
};

export default function UserMenu({ name, role }: Props) {
  const [open, setOpen] = useState(false);
  const isPrivileged = role === "ADMIN" || role === "DUNGEON_MASTER";

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="font-cinzel text-xs tracking-wide flex items-center gap-2 px-3 py-1.5 transition-all"
        style={{ border: "1px solid #333", color: "#C8B8A8", background: "#1A1A1A" }}
      >
        <span style={{ color: "var(--dnd-gold)" }}>{ROLE_ICON[role] ?? "🎲"}</span>
        {name}
        <span style={{ fontSize: "0.6rem", opacity: 0.6 }}>▾</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 z-50 min-w-44"
            style={{ background: "#111", border: "1px solid #2A2A2A" }}>
            <div className="px-4 py-2" style={{ borderBottom: "1px solid #1A1A1A" }}>
              <p className="font-cinzel text-xs" style={{ color: "var(--dnd-text-muted)" }}>
                {ROLE_LABEL[role] ?? role}
              </p>
            </div>
            {isPrivileged && (
              <a href="/dm/einladungen" className="block px-4 py-2 font-cinzel text-xs transition-colors"
                style={{ color: "#C8B8A8", borderBottom: "1px solid #1A1A1A" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#F5EDD6")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#C8B8A8")}>
                Einladungslinks
              </a>
            )}
            <button onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full text-left px-4 py-2 font-cinzel text-xs transition-colors"
              style={{ color: "#F87171" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#FCA5A5")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#F87171")}>
              Abmelden
            </button>
          </div>
        </>
      )}
    </div>
  );
}
