"use client";

import { useRouter } from "next/navigation";

export default function QuestDeleteButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Quest wirklich löschen? Alle Ziele und Verknüpfungen werden ebenfalls gelöscht.")) return;
    await fetch(`/api/quests/${id}`, { method: "DELETE" });
    router.push("/quests");
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="font-cinzel text-xs tracking-widest px-4 py-2 transition-all"
      style={{ background: "transparent", border: "1px solid #991B1B", color: "#F87171", cursor: "pointer" }}
    >
      LÖSCHEN
    </button>
  );
}
