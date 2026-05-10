"use client";

import { useState } from "react";
import CharakterModal from "./CharakterModal";

type Props = {
  availableOrgs?: { id: string; name: string }[];
  availableLocations?: { id: string; name: string }[];
};

export default function CharakterCreateButton({ availableOrgs = [], availableLocations = [] }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="ddb-cta">
        + Charakter
      </button>
      <CharakterModal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Neuen Charakter erstellen"
        availableOrgs={availableOrgs}
        availableLocations={availableLocations}
      />
    </>
  );
}
