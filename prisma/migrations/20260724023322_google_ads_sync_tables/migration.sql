-- AlterTable
ALTER TABLE "GoogleAdsConnection" ADD COLUMN     "clientCustomerId" TEXT,
ADD COLUMN     "lastSyncedAt" TIMESTAMP(3),
ADD COLUMN     "managerCustomerId" TEXT;

-- CreateTable
CREATE TABLE "GoogleAdsCampaignDay" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "campaignId" TEXT NOT NULL,
    "campaignName" TEXT NOT NULL,
    "campaignStatus" TEXT NOT NULL,
    "costMicros" BIGINT NOT NULL,
    "clicks" INTEGER NOT NULL,
    "impressions" INTEGER NOT NULL,
    "conversions" DOUBLE PRECISION NOT NULL,
    "conversionsValue" DOUBLE PRECISION NOT NULL,
    "allConversions" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "GoogleAdsCampaignDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoogleAdsCall" (
    "resourceName" TEXT NOT NULL,
    "startCallAt" TIMESTAMP(3),
    "durationSeconds" INTEGER NOT NULL,
    "callerAreaCode" TEXT,
    "callerCountryCode" TEXT,
    "callType" TEXT,
    "callStatus" TEXT,
    "campaignName" TEXT,

    CONSTRAINT "GoogleAdsCall_pkey" PRIMARY KEY ("resourceName")
);

-- CreateIndex
CREATE UNIQUE INDEX "GoogleAdsCampaignDay_date_campaignId_key" ON "GoogleAdsCampaignDay"("date", "campaignId");
