-- Drop unused createdAt columns from pivot tables. Pivot ordering now uses
-- the joined entity's name (organisation.name / npc.name / charakter.name).

ALTER TABLE "NPCOrganisation" DROP COLUMN "createdAt";
ALTER TABLE "CharakterOrganisation" DROP COLUMN "createdAt";
