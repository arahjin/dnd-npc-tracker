-- Make locationId optional and add questId on MapPlacement.
-- Exactly one of (locationId, questId) must be set — enforced app-side.

ALTER TABLE "MapPlacement" ALTER COLUMN "locationId" DROP NOT NULL;

ALTER TABLE "MapPlacement" ADD COLUMN "questId" TEXT;

ALTER TABLE "MapPlacement"
  ADD CONSTRAINT "MapPlacement_questId_fkey"
  FOREIGN KEY ("questId") REFERENCES "Quest"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "MapPlacement_questId_idx" ON "MapPlacement"("questId");
