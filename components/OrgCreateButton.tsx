"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

const OrgModal = dynamic(() => import("./OrgModal"));

type Props = {
  availableLocations?: { id: string; name: string }[];
};

export default function OrgCreateButton({ availableLocations = [] }: Props) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("form");

  return (
    <>
      <button onClick={() => setOpen(true)} className="ddb-cta">
        + Organisation
      </button>
      {open && (
        <OrgModal
          isOpen={open}
          onClose={() => setOpen(false)}
          title={t("createOrgTitle")}
          availableLocations={availableLocations}
        />
      )}
    </>
  );
}
