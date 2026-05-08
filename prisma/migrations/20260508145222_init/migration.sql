-- CreateTable
CREATE TABLE "NPC" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Unbekannt',
    "beziehung" TEXT NOT NULL DEFAULT 'Unbekannt',
    "organisationen" TEXT,
    "alter" TEXT,
    "rasse" TEXT,
    "herkunft" TEXT,
    "aktuellePosition" TEXT,
    "notizen" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NPC_pkey" PRIMARY KEY ("id")
);
