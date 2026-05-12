-- Add optional image URL columns to Organisation and Location so they can
-- carry a portrait / banner / landscape image like NPCs and Charaktere.

ALTER TABLE "Organisation" ADD COLUMN "image" TEXT;
ALTER TABLE "Location" ADD COLUMN "image" TEXT;
