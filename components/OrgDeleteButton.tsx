"use client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function OrgDeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const t = useTranslations();
  async function handleDelete() {
    if (!confirm(t("confirm.deleteOrg"))) return;
    await fetch(`/api/organisationen/${id}`, { method: "DELETE" });
    router.push("/organisationen");
    router.refresh();
  }
  return (
    <button onClick={handleDelete} className="font-cinzel text-xs tracking-widest px-4 py-2 transition-all"
      style={{ border: "1px solid #991B1B", color: "#F87171", background: "#200D0D" }}>
      {t("common.delete").toUpperCase()}
    </button>
  );
}
