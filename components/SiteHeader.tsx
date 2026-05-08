import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function SiteHeader({ active, actionSlot }: { active: "npcs" | "organisationen"; actionSlot?: React.ReactNode }) {
  return (
    <header>
      {/* ── Top Nav Bar ── */}
      <div style={{ background: "#111111", borderBottom: "1px solid #252525", position: "relative", zIndex: 10 }}>
        {/* Thin accent line */}
        <div style={{ height: "3px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-red) 30%, var(--dnd-gold) 50%, var(--dnd-red) 70%, var(--dnd-red-dark))" }} />

        <div className="mx-auto max-w-7xl px-6" style={{ display: "flex", alignItems: "stretch", height: "60px" }}>

          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", marginRight: "32px", flexShrink: 0 }}>
            <Image
              src="/wildgipfel_logo.png"
              alt="Wildgipfel"
              width={150}
              height={68}
              className="object-contain"
              style={{ filter: "drop-shadow(0 1px 6px rgba(0,0,0,0.9))" }}
            />
          </Link>

          {/* Nav Links */}
          <nav style={{ display: "flex", alignItems: "stretch", flex: 1 }}>
            <Link href="/" className={`ddb-nav-link${active === "npcs" ? " ddb-nav-active" : ""}`}>
              Personen
            </Link>
            <Link href="/organisationen" className={`ddb-nav-link${active === "organisationen" ? " ddb-nav-active" : ""}`}>
              Organisationen
            </Link>
          </nav>

          {/* Right: CTA */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {actionSlot ?? (
              <Link
                href={active === "organisationen" ? "/organisationen/new" : "/npc/new"}
                className="ddb-cta"
              >
                {active === "organisationen" ? "+ Organisation" : "+ Person"}
              </Link>
            )}
          </div>

        </div>
      </div>

      {/* ── Hero Banner ── */}
      <div style={{ position: "relative", height: "140px", overflow: "hidden" }}>
        <Image src="/wildgipfel_header.png" alt="Wildgipfel" fill className="object-cover object-top" priority style={{ zIndex: 0 }} />
        <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(to bottom, rgba(17,17,17,0.25) 0%, rgba(14,14,14,0.65) 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "2px", zIndex: 2, background: "linear-gradient(90deg, transparent, var(--dnd-red), var(--dnd-gold), var(--dnd-red), transparent)" }} />
      </div>
    </header>
  );
}
