"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function QuestDeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const t = useTranslations();

  async function handleDelete() {
    if (!confirm(t("confirm.deleteQuest"))) return;
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
      {t("common.delete").toUpperCase()}
    </button>
  );
}
