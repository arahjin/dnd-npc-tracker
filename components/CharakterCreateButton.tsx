"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

const CharakterModal = dynamic(() => import("./CharakterModal"));

type Props = {
  availableOrgs?: { id: string; name: string }[];
  availableLocations?: { id: string; name: string }[];
};

export default function CharakterCreateButton({ availableOrgs = [], availableLocations = [] }: Props) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("form");

  return (
    <>
      <button onClick={() => setOpen(true)} className="ddb-cta">
        + Charakter
      </button>
      {open && (
        <CharakterModal
          isOpen={open}
          onClose={() => setOpen(false)}
          title={t("createCharTitle")}
          availableOrgs={availableOrgs}
          availableLocations={availableLocations}
        />
      )}
    </>
  );
}
