"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NavSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/suche?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", alignItems: "center" }}>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Suchen..."
          className="font-cinzel"
          style={{
            background: "#1A1A1A",
            border: "1px solid #333",
            borderRadius: "2px",
            color: "#D8D0C8",
            fontSize: "0.7rem",
            letterSpacing: "0.06em",
            padding: "6px 12px",
            width: "180px",
            outline: "none",
            transition: "border-color 0.15s, width 0.2s",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--dnd-red)";
            e.target.style.width = "220px";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#333";
            e.target.style.width = "180px";
          }}
        />
      </div>
    </form>
  );
}
