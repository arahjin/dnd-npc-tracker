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
    <button
      onClick={handleDelete}
      className="rounded-lg bg-red-900/40 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-900/70 transition-colors"
    >
      Löschen
    </button>
  );
}
