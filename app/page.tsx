import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import NPCGrid from "@/components/NPCGrid";

export const dynamic = "force-dynamic";

export default async function Home() {
  const npcs = await prisma.nPC.findMany({ orderBy: { name: "asc" } });

  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid #2A1A1A", position: "relative", overflow: "hidden" }}>
        {/* Background map image */}
        <Image
          src="/Wildgipfel_header.png"
          alt="Wildgipfel Karte"
          fill
          className="object-cover object-top"
          style={{ zIndex: 0 }}
          priority
        />
        {/* Dark overlay for readability */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1 }} />
        {/* Top accent line */}
        <div style={{ height: "3px", background: "linear-gradient(90deg, transparent, var(--dnd-red), var(--dnd-gold), var(--dnd-red), transparent)", position: "relative", zIndex: 2 }} />

        <div className="mx-auto max-w-7xl px-6 py-6" style={{ position: "relative", zIndex: 2 }}>
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex flex-col items-start">
              <Image
                src="/wildgipfel_logo.png"
                alt="Wildgipfel"
                width={200}
                height={90}
                className="object-contain"
                style={{ filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.9))" }}
              />
              <p className="font-cinzel font-bold text-sm tracking-[0.25em] uppercase mt-1" style={{ color: "var(--dnd-heading)" }}>
                NPC Kompendium
              </p>
            </div>

            {/* Add Button */}
            <Link
              href="/npc/new"
              className="font-cinzel text-sm font-semibold px-5 py-2.5 transition-all duration-200 tracking-wider"
              style={{
                background: "var(--dnd-red)",
                color: "#F5EDD6",
                border: "1px solid var(--dnd-red-dark)",
                clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
              }}
            >
              + NPC hinzufügen
            </Link>
          </div>

          {/* Decorative line */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, var(--dnd-border))" }} />
            <span className="font-cinzel text-xs tracking-widest" style={{ color: "var(--dnd-text-muted)" }}>✦ ✦ ✦</span>
            <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, var(--dnd-border), transparent)" }} />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <NPCGrid npcs={npcs} />
      </div>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center">
        <p className="font-cinzel text-xs tracking-widest" style={{ color: "var(--dnd-text-muted)" }}>
          ✦ WILDGIPFEL KAMPAGNE ✦
        </p>
      </footer>
    </main>
  );
}
