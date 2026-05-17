"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

const QuestModal = dynamic(() => import("./QuestModal"));

export default function QuestCreateButton() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("form");

  return (
    <>
      <button onClick={() => setOpen(true)} className="ddb-cta">
        + Quest
      </button>
      {open && (
        <QuestModal
          isOpen={open}
          onClose={() => setOpen(false)}
          title={t("createQuestTitle")}
          canSeePrivate={true}
        />
      )}
    </>
  );
}
