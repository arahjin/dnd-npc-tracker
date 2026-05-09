"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

type Kampagne = { id: string; name: string };

type Props = {
  active: string;
  userName?: string;
  userRole?: string;
  isDM?: boolean;
  kampagneData?: { aktiveId: string; aktiveKampagne: string; kampagnen: Kampagne[] };
};

const NAV = [
  { href: "/",               label: "NPCs",           key: "npcs" },
  { href: "/organisationen", label: "Organisationen", key: "organisationen" },
  { href: "/charaktere",     label: "Charaktere",     key: "charaktere" },
  { href: "/geschichte",     label: "Geschichte",     key: "geschichte" },
  { href: "/tagebuch",       label: "Tagebuch",       key: "tagebuch" },
];

const ROLE_ICON: Record<string, string> = {
  ADMIN: "★", DUNGEON_MASTER: "⚔", SPIELER: "🎲",
};

export default function MobileNav({ active, userName, userRole, isDM, kampagneData }: Props) {
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const router = useRouter();

  const isAdmin = userRole === "ADMIN";
  const canManageInvites = isDM || isAdmin;

  async function switchKampagne(id: string) {
    if (id === kampagneData?.aktiveId) { setOpen(false); return; }
    setSwitching(true);
    await fetch(`/api/kampagnen/${id}/aktiv`, { method: "POST" });
    router.push("/");
    router.refresh();
    setOpen(false);
    setSwitching(false);
  }

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Menü öffnen"
        style={{
          width: 40, height: 40, display: "flex", alignItems: "center",
          justifyContent: "center", color: "#9A8A78", flexShrink: 0, background: "none", border: "none", cursor: "pointer",
        }}
      >
        <svg width="20" height="16" viewBox="0 0 20 16" fill="currentColor">
          <rect width="20" height="2.5" rx="1.25" />
          <rect y="6.75" width="20" height="2.5" rx="1.25" />
          <rect y="13.5" width="20" height="2.5" rx="1.25" />
        </svg>
      </button>

      {/* Backdrop + Drawer */}
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 50,
              background: "rgba(0,0,0,0.75)", backdropFilter: "blur(2px)",
            }}
          />
          <div
            style={{
              position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 51,
              width: "min(300px, 88vw)", background: "#0E0E0E",
              borderLeft: "1px solid #2A2A2A", display: "flex", flexDirection: "column",
              overflowY: "auto",
            }}
          >
            {/* Drawer header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px 20px", borderBottom: "1px solid #1A1A1A", flexShrink: 0,
            }}>
              <span className="font-cinzel" style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--dnd-gold)" }}>
                Navigation
              </span>
              <button
                onClick={() => setOpen(false)}
                style={{ color: "#9A8A78", fontSize: "1.1rem", lineHeight: 1, background: "none", border: "none", cursor: "pointer", padding: "4px" }}
              >
                ✕
              </button>
            </div>

            {/* Nav links */}
            <nav style={{ borderBottom: "1px solid #1A1A1A" }}>
              {NAV.map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="font-cinzel"
                  style={{
                    display: "flex", alignItems: "center",
                    padding: "14px 20px",
                    fontSize: "0.75rem", letterSpacing: "0.14em", textTransform: "uppercase",
                    textDecoration: "none",
                    color: active === item.key ? "#F5EDD6" : "#9A8A78",
                    borderLeft: active === item.key ? "3px solid var(--dnd-red)" : "3px solid transparent",
                    background: active === item.key ? "rgba(163,32,32,0.1)" : "transparent",
                  }}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Campaign switcher */}
            {kampagneData && kampagneData.kampagnen.length > 0 && (
              <div style={{ borderBottom: "1px solid #1A1A1A" }}>
                <div style={{ padding: "12px 20px 8px" }}>
                  <p className="font-cinzel" style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--dnd-text-muted)", marginBottom: "8px" }}>
                    Kampagne
                  </p>
                  {kampagneData.kampagnen.map((k) => (
                    <button
                      key={k.id}
                      onClick={() => switchKampagne(k.id)}
                      disabled={switching}
                      className="font-cinzel"
                      style={{
                        width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 8,
                        padding: "10px 0", fontSize: "0.8rem", background: "none", border: "none", cursor: "pointer",
                        color: k.id === kampagneData.aktiveId ? "var(--dnd-gold)" : "#9A8A78",
                        opacity: switching ? 0.5 : 1,
                      }}
                    >
                      {k.id === kampagneData.aktiveId && <span style={{ color: "var(--dnd-gold)", fontSize: "0.6rem" }}>✦</span>}
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{k.name}</span>
                    </button>
                  ))}
                  <a
                    href="/kampagnen/neu"
                    onClick={() => setOpen(false)}
                    className="font-cinzel"
                    style={{
                      display: "flex", alignItems: "center", padding: "10px 0",
                      fontSize: "0.7rem", color: "var(--dnd-text-muted)", textDecoration: "none",
                    }}
                  >
                    + Neue Kampagne
                  </a>
                </div>
              </div>
            )}

            {/* User section - pushed to bottom */}
            {userName && (
              <div style={{ marginTop: "auto" }}>
                <div style={{ padding: "12px 20px", borderTop: "1px solid #1A1A1A", borderBottom: "1px solid #1A1A1A" }}>
                  <p className="font-cinzel" style={{ fontSize: "0.75rem", color: "var(--dnd-gold)" }}>
                    {ROLE_ICON[userRole ?? "SPIELER"]} {userName}
                  </p>
                </div>

                {[
                  { href: "/kampagnen/verwalten", label: "Kampagnen verwalten", show: true },
                  { href: "/dm/einladungen", label: "Einladungen verwalten", show: canManageInvites },
                  { href: "/dm/admin", label: "Admin-Bereich", show: isAdmin },
                ].filter(i => i.show).map(item => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="font-cinzel"
                    style={{
                      display: "flex", alignItems: "center", padding: "12px 20px",
                      fontSize: "0.7rem", color: "#C8B8A8", textDecoration: "none",
                    }}
                  >
                    {item.label}
                  </a>
                ))}

                <div style={{ height: 1, background: "#1A1A1A" }} />
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="font-cinzel"
                  style={{
                    width: "100%", textAlign: "left", padding: "12px 20px",
                    fontSize: "0.7rem", color: "#F87171", background: "none", border: "none", cursor: "pointer",
                  }}
                >
                  Abmelden
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
