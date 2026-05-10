"use client";

import { useState } from "react";
import LocationModal from "./LocationModal";

type LinkedItem = { id: string; name: string };

type Props = {
  availableNpcs?: LinkedItem[];
  availableOrgs?: LinkedItem[];
  availableChars?: LinkedItem[];
};

export default function LocationCreateButton({ availableNpcs = [], availableOrgs = [], availableChars = [] }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="ddb-cta">
        + Location
      </button>
      <LocationModal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Neue Location erstellen"
        availableNpcs={availableNpcs}
        availableOrgs={availableOrgs}
        availableChars={availableChars}
      />
    </>
  );
}
