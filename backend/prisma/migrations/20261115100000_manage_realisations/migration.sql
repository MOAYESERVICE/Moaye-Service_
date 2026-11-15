-- Ajoute les informations nécessaires à la gestion des réalisations depuis l'administration.
ALTER TABLE "Realization"
  ADD COLUMN "imageAlt" TEXT,
  ADD COLUMN "domain" TEXT NOT NULL DEFAULT 'Accompagnement',
  ADD COLUMN "location" TEXT,
  ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX "Realization_isPublished_createdAt_idx"
  ON "Realization"("isPublished", "createdAt");

-- Reprend les réalisations déjà présentées sur le site sans écraser d'entrée existante.
INSERT INTO "Realization" ("title", "description", "imageUrl", "imageAlt", "domain", "isPublished", "createdAt", "updatedAt")
SELECT seed."title", seed."description", seed."imageUrl", seed."imageAlt", seed."domain", true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (VALUES
  ('Ferme piscicole en cages flottantes', 'Installation et mise en route d''une unité d''élevage de poissons en cages sur plan d''eau.', '/photos/cage-farm-installation.webp', 'Plateforme d''élevage de poissons en cages flottantes', 'Aquaculture'),
  ('Enclos piscicoles sur plan d''eau', 'Enclos délimités en bordure de plan d''eau pour l''élevage de poissons.', '/aquaculture-cage-installation.jpg', 'Enclos piscicole délimité par des piquets sur un plan d''eau', 'Pisciculture'),
  ('Installation en plan d''eau', 'Mise en place et entretien des équipements directement sur le site d''élevage.', '/photos/aquaculture-fieldwork.webp', 'Technicien sur un site aquacole avec un équipement de production', 'Aquaculture'),
  ('Suivi d''un élevage avicole', 'Conception du bâtiment, conseils d''alimentation et suivi technique.', '/photos/poultry-farming.webp', 'Poussins dans un bâtiment d''élevage avicole', 'Aviculture'),
  ('Soins et suivi sanitaire du bétail', 'Interventions techniques sur le terrain auprès des éleveurs.', '/cattle-health-monitoring.jpg', 'Soins apportés à un bovin par un technicien', 'Élevage'),
  ('Formation de producteurs', 'Sessions de formation et d''encadrement des équipes sur le terrain.', '/photos/formation-producteurs.png', 'Producteurs réunis en séance de formation et d''accompagnement technique', 'Accompagnement')
) AS seed("title", "description", "imageUrl", "imageAlt", "domain")
WHERE NOT EXISTS (
  SELECT 1 FROM "Realization" existing WHERE existing."title" = seed."title"
);