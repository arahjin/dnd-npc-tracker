"use client";

import { useRouter } from "next/navigation";

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("NPC wirklich löschen?")) return;
    await fetch(`/api/npcs/${id}`, { method: "DELETE" });
    router.push("/npc");
    router.refresh();
  }

  return (
    <button onClick={handleDelete}
      className="ddb-cta"
      style={{ background: "transparent", borderColor: "#991B1B", color: "#F87171" }}>
      LÖSCHEN
    </button>
  );
}
