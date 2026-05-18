"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function LocationDeleteButton({ id }: { id: string }) {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations();

  async function handleDelete() {
    setLoading(true);
    await fetch(`/api/locations/${id}`, { method: "DELETE" });
    router.push("/locations");
    router.refresh();
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-cinzel text-xs" style={{ color: "#F87171" }}>{t("confirm.sure")}</span>
        <button
          onClick={handleDelete} disabled={loading}
          className="font-cinzel text-xs px-3 py-1.5"
          style={{ background: "#200D0D", border: "1px solid #991B1B", color: "#F87171" }}>
          {loading ? "..." : t("confirm.yesDelete")}
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="font-cinzel text-xs px-3 py-1.5"
          style={{ border: "1px solid var(--dnd-border)", color: "var(--dnd-text-muted)" }}>
          {t("common.cancel")}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="font-cinzel text-xs tracking-widest px-4 py-2 transition-all"
      style={{ border: "1px solid #991B1B", color: "#F87171" }}>
      {t("common.delete").toUpperCase()}
    </button>
  );
}
