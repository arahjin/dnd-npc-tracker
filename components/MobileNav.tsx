"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { IconAdmin, IconSword, IconDice } from "@/components/Icons";
import LanguageSwitcher from "./LanguageSwitcher";

type Kampagne = { id: string; name: string };

type Props = {
  userName?: string;
  userRole?: string;
  isDM?: boolean;
  kampagneData?: { aktiveId: string; aktiveKampagne: string; kampagnen: Kampagne[] };
  initialLocale?: string;
};

function RoleIcon({ role }: { role: string }) {
  const p = { size: 13, color: "var(--dnd-gold)" };
  if (role === "ADMIN") return <IconAdmin {...p} />;
  if (role === "DUNGEON_MASTER") return <IconSword {...p} />;
  return <IconDice {...p} />;
}

export default function MobileNav({ userName, userRole, isDM, kampagneData, initialLocale = "de" }: Props) {
  const [open, setOpen] = useState(false);
  const [kampagneOpen, setKampagneOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const tNav = useTranslations("nav");
  const tMobile = useTranslations("mobileNav");
  const tUser = useTranslations("userMenu");

  const isAdmin = userRole === "ADMIN";
  const canManageInvites = isDM || isAdmin;

  const NAV = [
    { href: "/dashboard",      label: tNav("dashboard"),      key: "dashboard" },
    { href: "/npc",            label: tNav("npcs"),           key: "npcs" },
    { href: "/organisationen", label: tNav("organisationen"), key: "organisationen" },
    { href: "/locations",      label: tNav("locations"),      key: "locations" },
    { href: "/charaktere",     label: tNav("charaktere"),     key: "charaktere" },
    { href: "/geschichte",     label: tNav("geschichte"),     key: "geschichte" },
    { href: "/tagebuch",       label: tNav("tagebuch"),       key: "tagebuch" },
    { href: "/quests",         label: tNav("quests"),         key: "quests" },
  ];

  async function switchKampagne(id: string) {
    if (id === kampagneData?.aktiveId) { setOpen(false); return; }
    setSwitching(true);
    await fetch(`/api/kampagnen/${id}/aktiv`, { method: "POST" });
    router.push("/dashboard");
    router.refresh();
    setOpen(false);
    setSwitching(false);
  }

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(true)}
        aria-label={tMobile("open")}
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
              position: "fixed", inset: 0, zIndex: 9998,
              background: "rgba(0,0,0,0.75)", backdropFilter: "blur(2px)",
            }}
          />
          <div
            style={{
              position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 9999,
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
                {tMobile("navigation")}
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
                    color: pathname.startsWith(item.href) ? "#F5EDD6" : "#9A8A78",
                    borderLeft: pathname.startsWith(item.href) ? "3px solid var(--dnd-red)" : "3px solid transparent",
                    background: pathname.startsWith(item.href) ? "rgba(163,32,32,0.1)" : "transparent",
                  }}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Campaign switcher — collapsible */}
            {kampagneData && kampagneData.kampagnen.length > 0 && (
              <div style={{ borderBottom: "1px solid #1A1A1A" }}>
                <button
                  onClick={() => setKampagneOpen((p) => !p)}
                  aria-expanded={kampagneOpen}
                  className="font-cinzel"
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: 12, padding: "14px 20px",
                    fontSize: "0.75rem", letterSpacing: "0.14em", textTransform: "uppercase",
                    color: "var(--dnd-gold)", background: "none", border: "none", cursor: "pointer", textAlign: "left",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <span style={{ fontSize: "0.6rem", letterSpacing: "0.2em", color: "var(--dnd-text-muted)", flexShrink: 0 }}>
                      {tMobile("kampagne")}
                    </span>
                    <span style={{ color: "var(--dnd-gold)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {kampagneData.aktiveKampagne}
                    </span>
                  </span>
                  <span style={{ opacity: 0.6, fontSize: "0.65rem", flexShrink: 0 }}>{kampagneOpen ? "▲" : "▼"}</span>
                </button>

                {kampagneOpen && (
                  <div style={{ padding: "0 20px 12px", background: "#0A0A0A" }}>
                    {kampagneData.kampagnen.map((k) => {
                      const isActive = k.id === kampagneData.aktiveId;
                      const showEdit = isAdmin || (isActive && isDM);
                      return (
                        <div key={k.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <button
                            onClick={() => switchKampagne(k.id)}
                            disabled={switching}
                            className="font-cinzel"
                            style={{
                              flex: 1, textAlign: "left", display: "flex", alignItems: "center", gap: 8,
                              padding: "10px 0", fontSize: "0.8rem", background: "none", border: "none", cursor: "pointer",
                              color: isActive ? "var(--dnd-gold)" : "#9A8A78",
                              opacity: switching ? 0.5 : 1, minWidth: 0,
                            }}
                          >
                            {isActive && <span style={{ color: "var(--dnd-gold)", fontSize: "0.6rem" }}>✦</span>}
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{k.name}</span>
                          </button>
                          {showEdit && (
                            <a
                              href={`/kampagnen/verwalten?focus=${k.id}`}
                              onClick={() => setOpen(false)}
                              aria-label={tMobile("editKampagne")}
                              style={{
                                display: "inline-flex", alignItems: "center", justifyContent: "center",
                                width: 28, height: 28, color: "var(--dnd-text-muted)",
                                textDecoration: "none", fontSize: "0.85rem", flexShrink: 0,
                              }}
                            >
                              ✏️
                            </a>
                          )}
                        </div>
                      );
                    })}
                    <a
                      href="/kampagnen/neu"
                      onClick={() => setOpen(false)}
                      className="font-cinzel"
                      style={{
                        display: "flex", alignItems: "center", padding: "10px 0",
                        fontSize: "0.7rem", color: "var(--dnd-text-muted)", textDecoration: "none",
                        borderTop: "1px solid #1A1A1A", marginTop: "6px",
                      }}
                    >
                      {tMobile("neueKampagne")}
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Language switcher */}
            <div style={{ padding: "12px 20px", borderBottom: "1px solid #1A1A1A" }}>
              <LanguageSwitcher initialLocale={initialLocale} />
            </div>

            {/* User section - pushed to bottom */}
            {userName && (
              <div style={{ marginTop: "auto" }}>
                <a
                  href="/konto"
                  onClick={() => setOpen(false)}
                  className="font-cinzel"
                  style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    padding: "12px 20px",
                    borderTop: "1px solid #1A1A1A", borderBottom: "1px solid #1A1A1A",
                    fontSize: "0.75rem", color: "var(--dnd-gold)", textDecoration: "none",
                  }}
                >
                  <RoleIcon role={userRole ?? "SPIELER"} />
                  <span>{userName}</span>
                </a>

                {[
                  // Kampagne-Block (oben)
                  { href: "/kampagnen", label: tUser("kampagnen"), show: true },
                  { href: "/dm/einladungen", label: tUser("einladungen"), show: canManageInvites },
                  { href: "/dm/export", label: tUser("export"), show: canManageInvites },
                  // Admin
                  { href: "/dm/admin", label: tUser("adminBereich"), show: isAdmin },
                  // Konto-Block (unten)
                  { href: "/konto", label: tUser("konto"), show: true },
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

                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="font-cinzel"
                  style={{
                    width: "100%", textAlign: "left", padding: "12px 20px",
                    fontSize: "0.7rem", color: "#F87171", background: "none", border: "none", cursor: "pointer",
                  }}
                >
                  {tUser("abmelden")}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
