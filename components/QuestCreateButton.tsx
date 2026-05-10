"use client";

import { useState } from "react";
import QuestModal from "./QuestModal";

type Props = {
  availableNpcs?: { id: string; name: string }[];
  availableLocations?: { id: string; name: string }[];
  availableOrgs?: { id: string; name: string }[];
  availableChars?: { id: string; name: string }[];
};

export default function QuestCreateButton({ availableNpcs, availableLocations, availableOrgs, availableChars }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="ddb-cta">
        + Quest
      </button>
      <QuestModal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Neue Quest erstellen"
        availableNpcs={availableNpcs}
        availableLocations={availableLocations}
        availableOrgs={availableOrgs}
        availableChars={availableChars}
        canSeePrivate={true}
      />
    </>
  );
}
