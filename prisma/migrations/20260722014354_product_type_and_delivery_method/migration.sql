-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('HOT_TUB', 'SWIM_SPA', 'SAUNA', 'COLD_PLUNGE', 'MASSAGE_CHAIR');

-- CreateEnum
CREATE TYPE "DeliveryMethod" AS ENUM ('SPA_HAUS_TEAM', 'HOT_TUB_TAXI');

-- AlterTable
ALTER TABLE "Installation" ADD COLUMN     "deliveryMethod" "DeliveryMethod",
ADD COLUMN     "deliveryNotes" TEXT;

-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "productType" "ProductType";

