"use client";

import { useRouter } from "next/navigation";

export default function CharakterDeleteButton({ id }: { id: string }) {
  const router = useRouter();
  async function handleDelete() {
    if (!confirm("Charakter wirklich löschen?")) return;
    await fetch(`/api/charaktere/${id}`, { method: "DELETE" });
    router.push("/charaktere");
    router.refresh();
  }
  return (
    <button onClick={handleDelete} className="ddb-cta"
      style={{ background: "transparent", borderColor: "#991B1B", color: "#F87171" }}>
      Löschen
    </button>
  );
}
