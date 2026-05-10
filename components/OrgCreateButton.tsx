"use client";

import { useState } from "react";
import OrgModal from "./OrgModal";

type Props = {
  availableLocations?: { id: string; name: string }[];
};

export default function OrgCreateButton({ availableLocations = [] }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="ddb-cta">
        + Organisation
      </button>
      <OrgModal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Neue Organisation erstellen"
        availableLocations={availableLocations}
      />
    </>
  );
}
