ALTER TABLE "Quote" ALTER COLUMN "userId" DROP NOT NULL;

ALTER TABLE "Quote"
  ADD COLUMN "contactName" TEXT,
  ADD COLUMN "contactEmail" TEXT,
  ADD COLUMN "contactPhone" TEXT,
  ADD COLUMN "location" TEXT,
  ADD COLUMN "budgetRange" TEXT;

ALTER TABLE "Quote" DROP CONSTRAINT "Quote_userId_fkey";
ALTER TABLE "Quote"
  ADD CONSTRAINT "Quote_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
