-- CreateEnum
CREATE TYPE "ShellColor" AS ENUM ('SILVER_MARBLE', 'STORM_CLOUDS', 'TUSCAN_SUN', 'SMOKEY_MOUNTAINS', 'MIDNIGHT_CANYON');

-- CreateEnum
CREATE TYPE "CabinetColor" AS ENUM ('MODERN_MOCHA', 'CHARCOAL', 'LIGHT_FOG');

-- CreateEnum
CREATE TYPE "Voltage" AS ENUM ('V110', 'V220_240');

-- CreateEnum
CREATE TYPE "Sanitizer" AS ENUM ('BROMINE', 'CHLORINE');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH_CHECK', 'DEBIT_ACH', 'CREDIT_CARD', 'WELLS_FARGO_FINANCING');

-- CreateEnum
CREATE TYPE "InstallationStage" AS ENUM ('ORDER_PRODUCTION', 'SITE_PREP', 'ELECTRICAL_PREP', 'DELIVERY', 'FILL_POWER_ON', 'INSTALL_VISIT', 'STARTUP_CALL');

-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "cabinetColor" "CabinetColor",
ADD COLUMN     "pandaDocDocumentId" TEXT,
ADD COLUMN     "paymentMethod" "PaymentMethod",
ADD COLUMN     "productModel" TEXT,
ADD COLUMN     "sanitizer" "Sanitizer",
ADD COLUMN     "shellColor" "ShellColor",
ADD COLUMN     "voltage" "Voltage";

-- CreateTable
CREATE TABLE "Installation" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "stage" "InstallationStage" NOT NULL DEFAULT 'ORDER_PRODUCTION',
    "scheduledDeliveryDate" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "visitDate" TIMESTAMP(3),
    "arrivalTime" TIMESTAMP(3),
    "departureTime" TIMESTAMP(3),
    "serialNumber" TEXT,
    "gfciBrand" TEXT,
    "gfciAmperage" TEXT,
    "chemicalKitPresent" BOOLEAN,
    "coverLifterBoxPresent" BOOLEAN,
    "stepsBoxPresent" BOOLEAN,
    "coverClipsHardwarePresent" BOOLEAN,
    "otherAccessoriesPresent" BOOLEAN,
    "waterFilled" BOOLEAN,
    "powerOn" BOOLEAN,
    "checklist" JSONB,
    "issuesNotes" TEXT,
    "photosTaken" BOOLEAN,
    "followUpWarranty" BOOLEAN NOT NULL DEFAULT false,
    "followUpService" BOOLEAN NOT NULL DEFAULT false,
    "followUpParts" BOOLEAN NOT NULL DEFAULT false,
    "installerSignedAt" TIMESTAMP(3),
    "customerSignedAt" TIMESTAMP(3),
    "startupCallAt" TIMESTAMP(3),
    "startupCallNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Installation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Installation_quoteId_key" ON "Installation"("quoteId");

-- CreateIndex
CREATE INDEX "Installation_contactId_idx" ON "Installation"("contactId");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_pandaDocDocumentId_key" ON "Quote"("pandaDocDocumentId");

-- AddForeignKey
ALTER TABLE "Installation" ADD CONSTRAINT "Installation_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Installation" ADD CONSTRAINT "Installation_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

