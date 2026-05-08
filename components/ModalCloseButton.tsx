"use client";

import { useRouter } from "next/navigation";

export default function ModalCloseButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="font-cinzel text-xs tracking-widest uppercase transition-colors"
      style={{ color: "var(--dnd-text-muted)", paddingLeft: 0 }}
      onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--dnd-text)")}
      onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--dnd-text-muted)")}
    >
      ✕ Schließen
    </button>
  );
}
