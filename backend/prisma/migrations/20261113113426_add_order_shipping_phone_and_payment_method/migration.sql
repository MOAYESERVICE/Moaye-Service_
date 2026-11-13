-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paymentMethod" "PaymentMethod" DEFAULT 'CARD',
ADD COLUMN     "shippingPhone" TEXT;
