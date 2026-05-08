import Link from "next/link";
import Image from "next/image";

export default function SiteHeader({ active }: { active: "npcs" | "organisationen" }) {
  return (
    <header style={{ borderBottom: "1px solid #2A1A1A", position: "relative", overflow: "hidden" }}>
      <Image src="/wildgipfel_header.png" alt="Wildgipfel" fill className="object-cover object-top" style={{ zIndex: 0 }} priority />
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1 }} />
      <div style={{ height: "3px", background: "linear-gradient(90deg, transparent, var(--dnd-red), var(--dnd-gold), var(--dnd-red), transparent)", position: "relative", zIndex: 2 }} />

      <div className="mx-auto max-w-7xl px-6 py-6" style={{ position: "relative", zIndex: 2 }}>
        <div className="flex items-center justify-between">
          <Image src="/wildgipfel_logo.png" alt="Wildgipfel" width={200} height={90} className="object-contain"
            style={{ filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.9))" }} />
          <Link
            href={active === "npcs" ? "/npc/new" : "/organisationen/new"}
            className="font-cinzel text-sm font-semibold px-5 py-2.5 transition-all tracking-wider"
            style={{ background: "var(--dnd-red)", color: "#F5EDD6", border: "1px solid var(--dnd-red-dark)", clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}>
            {active === "npcs" ? "+ NPC hinzufügen" : "+ Organisation hinzufügen"}
          </Link>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-5 flex items-center gap-1">
          <Link href="/" className="font-cinzel text-xs tracking-widest px-4 py-2 transition-all"
            style={{
              color: active === "npcs" ? "#F5EDD6" : "var(--dnd-text-muted)",
              background: active === "npcs" ? "var(--dnd-red-dark)" : "transparent",
              border: "1px solid",
              borderColor: active === "npcs" ? "var(--dnd-red)" : "transparent",
            }}>
            PERSONEN
          </Link>
          <Link href="/organisationen" className="font-cinzel text-xs tracking-widest px-4 py-2 transition-all"
            style={{
              color: active === "organisationen" ? "#F5EDD6" : "var(--dnd-text-muted)",
              background: active === "organisationen" ? "var(--dnd-red-dark)" : "transparent",
              border: "1px solid",
              borderColor: active === "organisationen" ? "var(--dnd-red)" : "transparent",
            }}>
            ORGANISATIONEN
          </Link>
          <div className="flex-1 h-px ml-2" style={{ background: "linear-gradient(90deg, var(--dnd-border), transparent)" }} />
          <span className="font-cinzel text-xs" style={{ color: "var(--dnd-text-muted)" }}>✦</span>
        </div>
      </div>
    </header>
  );
}
