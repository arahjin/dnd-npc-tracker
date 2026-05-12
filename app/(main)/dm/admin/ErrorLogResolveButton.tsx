"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ErrorLogResolveButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function resolve() {
    setPending(true);
    const res = await fetch(`/api/error-log/${id}`, { method: "PATCH" });
    if (res.ok) router.refresh();
    else setPending(false);
  }

  return (
    <button onClick={resolve} disabled={pending}
      className="font-cinzel text-xs tracking-wide px-2 py-1 shrink-0 transition-all"
      style={{ border: "1px solid var(--dnd-gold)", color: "var(--dnd-gold)" }}>
      {pending ? "..." : "Erledigt"}
    </button>
  );
}
