-- Tighten kampagneId from nullable to NOT NULL on the four content tables.
-- The migrate-kampagnen dry-run confirmed all rows now have a kampagneId.

ALTER TABLE "NPC" ALTER COLUMN "kampagneId" SET NOT NULL;
ALTER TABLE "Organisation" ALTER COLUMN "kampagneId" SET NOT NULL;
ALTER TABLE "Charakter" ALTER COLUMN "kampagneId" SET NOT NULL;
ALTER TABLE "JournalEntry" ALTER COLUMN "kampagneId" SET NOT NULL;
