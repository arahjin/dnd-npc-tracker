"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function CharakterDeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const t = useTranslations();
  async function handleDelete() {
    if (!confirm(t("confirm.deleteCharakter"))) return;
    await fetch(`/api/charaktere/${id}`, { method: "DELETE" });
    router.push("/charaktere");
    router.refresh();
  }
  return (
    <button onClick={handleDelete} className="ddb-cta"
      style={{ background: "transparent", borderColor: "#991B1B", color: "#F87171" }}>
      {t("common.delete")}
    </button>
  );
}
