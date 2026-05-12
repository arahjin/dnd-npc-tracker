"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const QuestModal = dynamic(() => import("./QuestModal"));

export default function QuestCreateButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="ddb-cta">
        + Quest
      </button>
      {open && (
        <QuestModal
          isOpen={open}
          onClose={() => setOpen(false)}
          title="Neue Quest erstellen"
          canSeePrivate={true}
        />
      )}
    </>
  );
}
