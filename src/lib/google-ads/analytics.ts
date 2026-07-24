import { db } from "@/lib/db";

export type CampaignSummary = {
  campaignName: string;
  spend: number;
  clicks: number;
  impressions: number;
  googleConversions: number;
  realCalls: number;
  costPerCall: number | null;
};

export type AdsOverview = {
  lastSyncedAt: Date | null;
  dataStart: Date | null;
  dataEnd: Date | null;
  totalSpend: number;
  totalClicks: number;
  totalImpressions: number;
  googleConversions: number;
  totalCalls: number;
  receivedCalls: number;
  missedCalls: number;
  campaigns: CampaignSummary[];
};

function isMissed(status: string | null): boolean {
  return !!status && status.toUpperCase().includes("MISSED");
}

export async function getAdsOverview(): Promise<AdsOverview | null> {
  const connection = await db.googleAdsConnection.findFirst();
  const campaignCount = await db.googleAdsCampaignDay.count();
  if (!connection || campaignCount === 0) return null;

  const [bounds, byCampaign, calls] = await Promise.all([
    db.googleAdsCampaignDay.aggregate({
      _min: { date: true },
      _max: { date: true },
    }),
    db.googleAdsCampaignDay.groupBy({
      by: ["campaignName"],
      _sum: {
        costMicros: true,
        clicks: true,
        impressions: true,
        conversions: true,
      },
    }),
    db.googleAdsCall.findMany({
      select: { campaignName: true, callStatus: true },
    }),
  ]);

  // Attribute calls to campaigns by name (call_view exposes campaign.name).
  const callsByCampaign = new Map<string, number>();
  let receivedCalls = 0;
  let missedCalls = 0;
  for (const call of calls) {
    if (isMissed(call.callStatus)) missedCalls++;
    else receivedCalls++;
    const name = call.campaignName ?? "(unattributed)";
    callsByCampaign.set(name, (callsByCampaign.get(name) ?? 0) + 1);
  }

  const campaigns: CampaignSummary[] = byCampaign
    .map((c) => {
      const spend = Number(c._sum.costMicros ?? BigInt(0)) / 1_000_000;
      const realCalls = callsByCampaign.get(c.campaignName) ?? 0;
      return {
        campaignName: c.campaignName,
        spend,
        clicks: c._sum.clicks ?? 0,
        impressions: c._sum.impressions ?? 0,
        googleConversions: c._sum.conversions ?? 0,
        realCalls,
        costPerCall: realCalls > 0 ? spend / realCalls : null,
      };
    })
    .sort((a, b) => b.spend - a.spend);

  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0);
  const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0);
  const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0);
  const googleConversions = campaigns.reduce((s, c) => s + c.googleConversions, 0);

  return {
    lastSyncedAt: connection.lastSyncedAt,
    dataStart: bounds._min.date,
    dataEnd: bounds._max.date,
    totalSpend,
    totalClicks,
    totalImpressions,
    googleConversions,
    totalCalls: calls.length,
    receivedCalls,
    missedCalls,
    campaigns,
  };
}

export async function getRecentCalls(limit = 25) {
  return db.googleAdsCall.findMany({
    orderBy: { startCallAt: "desc" },
    take: limit,
    select: {
      resourceName: true,
      startCallAt: true,
      durationSeconds: true,
      callStatus: true,
      campaignName: true,
      callerAreaCode: true,
    },
  });
}
