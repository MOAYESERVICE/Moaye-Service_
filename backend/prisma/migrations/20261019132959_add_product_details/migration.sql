/*
  Warnings:

  - Added the required column `price` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StockStatus" AS ENUM ('IN_STOCK', 'ON_ORDER', 'OUT_OF_STOCK');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "price" INTEGER NOT NULL,
ADD COLUMN     "specs" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "stock" "StockStatus" NOT NULL DEFAULT 'IN_STOCK';
