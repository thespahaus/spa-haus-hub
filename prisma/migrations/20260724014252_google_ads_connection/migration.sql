-- CreateTable
CREATE TABLE "GoogleAdsConnection" (
    "id" TEXT NOT NULL,
    "connectedEmail" TEXT NOT NULL,
    "refreshTokenEncrypted" TEXT NOT NULL,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleAdsConnection_pkey" PRIMARY KEY ("id")
);
