ALTER TABLE "HomepagePhoto" ADD COLUMN "title" TEXT;

UPDATE "HomepagePhoto"
SET "title" = CASE "productKey"
  WHEN 'p1' THEN 'Poissons frais'
  WHEN 'p2' THEN 'Poulet entier pesé'
  WHEN 'p3' THEN 'Oie vivante'
  WHEN 'p7' THEN 'Fond perforé pour cage à lapin'
  ELSE "productKey"
END;

ALTER TABLE "HomepagePhoto" ALTER COLUMN "title" SET NOT NULL;
