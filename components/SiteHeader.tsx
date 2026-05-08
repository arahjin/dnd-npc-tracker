import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import NavSearch from "./NavSearch";
import UserMenu from "./UserMenu";
import KampagneSelector from "./KampagneSelector";

export default async function SiteHeader({ active, actionSlot }: { active: "npcs" | "organisationen" | "charaktere" | "geschichte" | "tagebuch"; actionSlot?: React.ReactNode }) {
  const session = await auth();
  const user = session?.user as { name?: string | null; role?: string; id?: string } | undefined;

  // Load active campaign for selector + determine DM status
  let kampagneSelector: React.ReactNode = null;
  let isDMofActive = false;
  if (user?.id) {
    const cookieStore = await cookies();
    const aktiveId = cookieStore.get("aktiveKampagne")?.value ?? null;
    if (aktiveId) {
      const isAdmin = user.role === "ADMIN";
      const [aktive, kampagnen, mitglied] = await Promise.all([
        prisma.kampagne.findUnique({ where: { id: aktiveId }, select: { id: true, name: true } }),
        isAdmin
          ? prisma.kampagne.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, name: true } })
          : prisma.kampagneMitglied.findMany({
              where: { userId: user.id },
              include: { kampagne: { select: { id: true, name: true } } },
              orderBy: { createdAt: "asc" },
            }).then((ms) => ms.map((m) => m.kampagne)),
        isAdmin
          ? Promise.resolve(null)
          : prisma.kampagneMitglied.findUnique({
              where: { kampagneId_userId: { kampagneId: aktiveId, userId: user.id } },
              select: { isDM: true },
            }),
      ]);
      isDMofActive = isAdmin || mitglied?.isDM === true;
      if (aktive) {
        kampagneSelector = (
          <KampagneSelector
            aktiveId={aktiveId}
            aktiveKampagne={aktive.name}
            kampagnen={kampagnen}
          />
        );
      }
    }
  }

  return (
    <header>
      {/* ── Top Nav Bar ── */}
      <div style={{ background: "#111111", borderBottom: "1px solid #252525", position: "relative", zIndex: 10 }}>
        <div style={{ height: "3px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-red) 30%, var(--dnd-gold) 50%, var(--dnd-red) 70%, var(--dnd-red-dark))" }} />

        <div className="mx-auto max-w-7xl px-6" style={{ display: "flex", alignItems: "stretch", height: "60px" }}>

          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", marginRight: "24px", flexShrink: 0 }}>
            <Image src="/wildgipfel_logo.png" alt="Wildgipfel" width={140} height={63} className="object-contain"
              style={{ filter: "drop-shadow(0 1px 6px rgba(0,0,0,0.9))" }} />
          </Link>

          {/* Nav Links */}
          <nav style={{ display: "flex", alignItems: "stretch", flex: 1 }}>
            <Link href="/" className={`ddb-nav-link${active === "npcs" ? " ddb-nav-active" : ""}`}>NPCs</Link>
            <Link href="/organisationen" className={`ddb-nav-link${active === "organisationen" ? " ddb-nav-active" : ""}`}>Organisationen</Link>
            <Link href="/charaktere" className={`ddb-nav-link${active === "charaktere" ? " ddb-nav-active" : ""}`}>Charaktere</Link>
            <Link href="/geschichte" className={`ddb-nav-link${active === "geschichte" ? " ddb-nav-active" : ""}`}>Geschichte</Link>
            <Link href="/tagebuch" className={`ddb-nav-link${active === "tagebuch" ? " ddb-nav-active" : ""}`}>Tagebuch</Link>
          </nav>

          {/* Right: Campaign + Search + CTA + User */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {kampagneSelector}
            <NavSearch />
            {actionSlot ?? (
              <Link href={active === "organisationen" ? "/organisationen/new" : "/npc/new"} className="ddb-cta">
                {active === "organisationen" ? "+ Organisation" : "+ NPC"}
              </Link>
            )}
            {user && <UserMenu name={user.name ?? "Spieler"} role={user.role ?? "SPIELER"} isDM={isDMofActive} />}
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
