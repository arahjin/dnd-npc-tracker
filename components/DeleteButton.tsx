"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const t = useTranslations();

  async function handleDelete() {
    if (!confirm(t("confirm.deleteNPC"))) return;
    await fetch(`/api/npcs/${id}`, { method: "DELETE" });
    router.push("/npc");
    router.refresh();
  }

  return (
    <button onClick={handleDelete}
      className="ddb-cta"
      style={{ background: "transparent", borderColor: "#991B1B", color: "#F87171" }}>
      {t("common.delete").toUpperCase()}
    </button>
  );
}
