ALTER TABLE "HomepagePhoto" ADD COLUMN "productId" INTEGER;
CREATE UNIQUE INDEX "HomepagePhoto_productId_key" ON "HomepagePhoto"("productId");
ALTER TABLE "HomepagePhoto"
  ADD CONSTRAINT "HomepagePhoto_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "Category" ("name", "description", "updatedAt") VALUES
  ('Poissons et volailles', 'Poissons et volailles proposés par MOAYE SERVICES.', CURRENT_TIMESTAMP),
  ('Matériel d''élevage', 'Matériel et équipements pour les activités d''élevage.', CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "Product" ("name", "description", "price", "stock", "imageUrl", "specs", "categoryId", "createdAt", "updatedAt")
SELECT seed."name", seed."description", seed."price", seed."stock"::"StockStatus", seed."imageUrl", ARRAY[]::TEXT[], category."id", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (VALUES
  ('Poissons frais', 'Poissons frais présentés pour la vente. Disponibilité à confirmer.', 10000, 'IN_STOCK', '/poison.jpg', 'Poissons et volailles'),
  ('Poulet entier pesé', 'Poulet entier présenté sur une balance.', 10000, 'IN_STOCK', '/poulet.jpg', 'Poissons et volailles'),
  ('Oie vivante', 'Oie d’élevage vivante, proposée sur commande.', 10000, 'ON_ORDER', '/oies.jpg', 'Poissons et volailles'),
  ('Fond perforé pour cage à lapin', 'Fond perforé pour cage à lapin.', 6500, 'IN_STOCK', '/fond cage pour lapin.jpg', 'Matériel d''élevage')
) AS seed("name", "description", "price", "stock", "imageUrl", "categoryName")
JOIN "Category" category ON category."name" = seed."categoryName"
WHERE NOT EXISTS (
  SELECT 1 FROM "Product" existing
  WHERE existing."name" = seed."name" AND existing."categoryId" = category."id"
);

UPDATE "HomepagePhoto" photo
SET "productId" = (
  SELECT product."id"
  FROM "Product" product
  JOIN "Category" category ON category."id" = product."categoryId"
  WHERE product."name" = CASE photo."productKey"
      WHEN 'p1' THEN 'Poissons frais'
      WHEN 'p2' THEN 'Poulet entier pesé'
      WHEN 'p3' THEN 'Oie vivante'
      WHEN 'p7' THEN 'Fond perforé pour cage à lapin'
      ELSE photo."title"
    END
    AND category."name" = CASE photo."productKey"
      WHEN 'p7' THEN 'Matériel d''élevage'
      ELSE 'Poissons et volailles'
    END
  ORDER BY product."id"
  LIMIT 1
),
"imageUrl" = (
  SELECT product."imageUrl"
  FROM "Product" product
  JOIN "Category" category ON category."id" = product."categoryId"
  WHERE product."name" = CASE photo."productKey"
      WHEN 'p1' THEN 'Poissons frais'
      WHEN 'p2' THEN 'Poulet entier pesé'
      WHEN 'p3' THEN 'Oie vivante'
      WHEN 'p7' THEN 'Fond perforé pour cage à lapin'
      ELSE photo."title"
    END
    AND category."name" = CASE photo."productKey"
      WHEN 'p7' THEN 'Matériel d''élevage'
      ELSE 'Poissons et volailles'
    END
  ORDER BY product."id"
  LIMIT 1
);

UPDATE "Product" product
SET "name" = photo."title", "imageUrl" = photo."imageUrl", "updatedAt" = CURRENT_TIMESTAMP
FROM "HomepagePhoto" photo
WHERE photo."productId" = product."id";
