"use client";

import { useRouter } from "next/navigation";

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("NPC wirklich löschen?")) return;
    await fetch(`/api/npcs/${id}`, { method: "DELETE" });
    router.push("/");
    router.refresh();
  }

  return (
    <button onClick={handleDelete}
      className="font-cinzel text-xs tracking-widest px-4 py-2 transition-all"
      style={{ border: "1px solid #991B1B", color: "#F87171", background: "#200D0D" }}>
      LÖSCHEN
    </button>
  );
}
