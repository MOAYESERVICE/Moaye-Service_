CREATE TABLE "HomepagePhoto" (
    "id" SERIAL NOT NULL,
    "productKey" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepagePhoto_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "HomepagePhoto_productKey_key" ON "HomepagePhoto"("productKey");
CREATE UNIQUE INDEX "HomepagePhoto_position_key" ON "HomepagePhoto"("position");
CREATE INDEX "HomepagePhoto_isActive_position_idx" ON "HomepagePhoto"("isActive", "position");

INSERT INTO "HomepagePhoto" ("productKey", "imageUrl", "alt", "position", "createdAt", "updatedAt") VALUES
    ('p1', '/poison.jpg', 'Poissons frais présentés pour la vente', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('p2', '/poulet.jpg', 'Poulet entier pesé sur une balance', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('p3', '/oies.jpg', 'Oie d’élevage en plein air', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('p7', '/fond cage pour lapin.jpg', 'Fond perforé vert pour cage à lapin', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
