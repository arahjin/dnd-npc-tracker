-- Phase 2: Shapes (polygon/circle/rect), pin styling, sub-map linking, map hierarchy.

ALTER TABLE "MapPlacement"
  ADD COLUMN "shape" JSONB,
  ADD COLUMN "color" TEXT,
  ADD COLUMN "icon" TEXT,
  ADD COLUMN "linkedMapId" TEXT;

ALTER TABLE "MapPlacement"
  ADD CONSTRAINT "MapPlacement_linkedMapId_fkey"
  FOREIGN KEY ("linkedMapId") REFERENCES "Map"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "MapPlacement_linkedMapId_idx" ON "MapPlacement"("linkedMapId");

-- Backfill existing point placements into shape
UPDATE "MapPlacement"
SET "shape" = jsonb_build_object('type', 'point', 'x', "x", 'y', "y")
WHERE "shape" IS NULL;

-- Map hierarchy
ALTER TABLE "Map" ADD COLUMN "parentMapId" TEXT;
ALTER TABLE "Map" ADD CONSTRAINT "Map_parentMapId_fkey"
  FOREIGN KEY ("parentMapId") REFERENCES "Map"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "Map_parentMapId_idx" ON "Map"("parentMapId");
