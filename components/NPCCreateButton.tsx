"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

const NPCModal = dynamic(() => import("./NPCModal"));

type Props = {
  availableOrgs: { id: string; name: string }[];
  availableLocations?: { id: string; name: string }[];
};

export default function NPCCreateButton({ availableOrgs, availableLocations = [] }: Props) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("form");

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="ddb-cta"
      >
        + NPC
      </button>

      {open && (
        <NPCModal
          isOpen={open}
          onClose={() => setOpen(false)}
          title={t("createNPCTitle")}
          availableOrgs={availableOrgs}
          availableLocations={availableLocations}
        />
      )}
    </>
  );
}
