export default function PageLoadingSkeleton({ label = "Lädt…" }: { label?: string }) {
  return (
    <main className="min-h-screen" style={{ background: "var(--dnd-bg)" }}>
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <span className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: "var(--dnd-label)" }}>
            {label}
          </span>
          <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, var(--dnd-red-dark), transparent)" }} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}
              className="animate-pulse"
              style={{ background: "var(--dnd-bg-card)", border: "1px solid var(--dnd-border)", height: "160px" }}>
              <div style={{ height: "2px", background: "linear-gradient(90deg, var(--dnd-red-dark), var(--dnd-gold), var(--dnd-red-dark))", opacity: 0.4 }} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
