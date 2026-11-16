CREATE TABLE "RealizationPhoto" (
    "id" SERIAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "imageAlt" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RealizationPhoto_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RealizationPhoto_isPublished_createdAt_idx" ON "RealizationPhoto"("isPublished", "createdAt");
