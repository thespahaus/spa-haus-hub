-- AlterEnum
BEGIN;
CREATE TYPE "InstallationStage_new" AS ENUM ('ORDERED', 'SHIPPED', 'RECEIVED_AT_SHOP', 'READY_FOR_DELIVERY', 'DELIVERED', 'INSTALL_VISIT', 'STARTUP_CALL', 'COMPLETE');
ALTER TABLE "public"."Installation" ALTER COLUMN "stage" DROP DEFAULT;
ALTER TABLE "Installation" ALTER COLUMN "stage" TYPE "InstallationStage_new" USING ("stage"::text::"InstallationStage_new");
ALTER TYPE "InstallationStage" RENAME TO "InstallationStage_old";
ALTER TYPE "InstallationStage_new" RENAME TO "InstallationStage";
DROP TYPE "public"."InstallationStage_old";
ALTER TABLE "Installation" ALTER COLUMN "stage" SET DEFAULT 'ORDERED';
COMMIT;

-- AlterTable
ALTER TABLE "Installation" ADD COLUMN     "prepConfirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "prepConfirmedAt" TIMESTAMP(3),
ADD COLUMN     "prepNotes" TEXT,
ALTER COLUMN "stage" SET DEFAULT 'ORDERED';

-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "dimensions" TEXT;

