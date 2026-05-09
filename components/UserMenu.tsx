"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

type Props = { name: string; role: string; isDM?: boolean };

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

export default function UserMenu({ name, role, isDM = false }: Props) {
  const [open, setOpen] = useState(false);
  const isAdmin = role === "ADMIN";
  const canManageInvites = isDM || isAdmin;

  const menuItem = (href: string, label: string) => (
    <a href={href} className="block px-4 py-2 font-cinzel text-xs transition-colors"
      style={{ color: "#5A5850" }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "#5A5850")}>
      {label}
    </a>
  );

  const divider = <div style={{ height: "1px", background: "#FFFFFF" }} />;

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="font-cinzel text-xs tracking-wide flex items-center gap-2 px-3 py-1.5 transition-all"
        style={{ border: "1px solid #333", color: "#5A5850", background: "#FFFFFF" }}
      >
        <span style={{ color: "var(--dnd-gold)" }}>{ROLE_ICON[role] ?? "🎲"}</span>
        {name}
        <span style={{ fontSize: "0.6rem", opacity: 0.6 }}>▾</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 z-50 min-w-48"
            style={{ background: "#F8F5EF", border: "1px solid #C8C4BC" }}>

            {/* User info */}
            <div className="px-4 py-2" style={{ borderBottom: "1px solid #FFFFFF" }}>
              <p className="font-cinzel text-xs" style={{ color: "var(--dnd-text-muted)" }}>
                {ROLE_LABEL[role] ?? role}
              </p>
            </div>

            {/* Kampagnen section */}
            {menuItem("/kampagnen/verwalten", "Kampagnen verwalten")}
            {canManageInvites && menuItem("/dm/einladungen", "Einladungen verwalten")}
            {divider}

            {/* Admin section */}
            {isAdmin && (
              <>
                {menuItem("/dm/admin", "Admin-Bereich")}
                {divider}
              </>
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
