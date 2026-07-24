import { db } from "@/lib/db";
import { gaqlSearch, listAccessibleCustomers } from "@/lib/google-ads/client";

const CAMPAIGN_LOOKBACK_DAYS = 90;
// call_view only retains roughly the trailing 30 days server-side.
const CALL_LOOKBACK_DAYS = 30;

function isoDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

async function discoverAccounts(): Promise<{
  managerCustomerId: string;
  clientCustomerId: string;
}> {
  const connection = await db.googleAdsConnection.findFirst();
  if (!connection) throw new Error("Google Ads is not connected");
  if (connection.managerCustomerId && connection.clientCustomerId) {
    return {
      managerCustomerId: connection.managerCustomerId,
      clientCustomerId: connection.clientCustomerId,
    };
  }

  const accessible = await listAccessibleCustomers();
  if (accessible.length === 0) {
    throw new Error("The connected Google account can't access any Ads accounts");
  }

  const attemptErrors: string[] = [];
  for (const candidateManager of accessible) {
    try {
      const rows = await gaqlSearch(
        candidateManager,
        `SELECT customer_client.id, customer_client.descriptive_name,
                customer_client.manager, customer_client.level
         FROM customer_client
         WHERE customer_client.level <= 1`,
        candidateManager,
      );
      console.log(
        `Google Ads discovery: customer ${candidateManager} returned ${rows.length} customer_client row(s):`,
        JSON.stringify(rows),
      );
      const clients = rows
        .map((r) => r.customerClient as {
          id?: string;
          manager?: boolean;
          level?: number;
        })
        .filter((c) => c && c.manager === false && c.id);
      if (clients.length > 0) {
        const result = {
          managerCustomerId: candidateManager,
          clientCustomerId: String(clients[0].id),
        };
        await db.googleAdsConnection.update({
          where: { id: connection.id },
          data: result,
        });
        return result;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Google Ads discovery failed for customer ${candidateManager}:`, message);
      attemptErrors.push(`${candidateManager}: ${message}`);
    }
  }

  // No manager-with-children found. Some accounts (like this one, apparently)
  // hold campaigns directly even while flagged manager:true in customer_client.
  // Fall back to just checking whether each candidate has campaigns at all.
  for (const candidate of accessible) {
    try {
      const rows = await gaqlSearch(
        candidate,
        `SELECT campaign.id FROM campaign LIMIT 1`,
        candidate,
      );
      console.log(
        `Google Ads discovery fallback: customer ${candidate} campaign check returned ${rows.length} row(s)`,
      );
      const result = { managerCustomerId: candidate, clientCustomerId: candidate };
      await db.googleAdsConnection.update({
        where: { id: connection.id },
        data: result,
      });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Google Ads discovery fallback failed for customer ${candidate}:`, message);
      attemptErrors.push(`${candidate} (campaign check): ${message}`);
    }
  }

  throw new Error(
    `Couldn't find a client ad account under the connected login. Tried: [${accessible.join(", ")}]. Errors: ${attemptErrors.join(" | ")}`,
  );
}

export type SyncResult = {
  campaignDays: number;
  calls: number;
  clientCustomerId: string;
};

export async function runGoogleAdsSync(): Promise<SyncResult> {
  const { managerCustomerId, clientCustomerId } = await discoverAccounts();

  const campaignRows = await gaqlSearch(
    clientCustomerId,
    `SELECT segments.date, campaign.id, campaign.name, campaign.status,
            metrics.cost_micros, metrics.clicks, metrics.impressions,
            metrics.conversions, metrics.conversions_value, metrics.all_conversions
     FROM campaign
     WHERE segments.date BETWEEN '${isoDate(CAMPAIGN_LOOKBACK_DAYS)}' AND '${isoDate(0)}'`,
    managerCustomerId,
  );

  let campaignDays = 0;
  for (const row of campaignRows) {
    const campaign = row.campaign as { id?: string; name?: string; status?: string };
    const segments = row.segments as { date?: string };
    const metrics = row.metrics as {
      costMicros?: string;
      clicks?: string;
      impressions?: string;
      conversions?: number;
      conversionsValue?: number;
      allConversions?: number;
    };
    if (!campaign?.id || !segments?.date) continue;

    const data = {
      date: new Date(segments.date),
      campaignId: String(campaign.id),
      campaignName: campaign.name ?? "",
      campaignStatus: campaign.status ?? "",
      costMicros: BigInt(metrics.costMicros ?? "0"),
      clicks: Number(metrics.clicks ?? 0),
      impressions: Number(metrics.impressions ?? 0),
      conversions: Number(metrics.conversions ?? 0),
      conversionsValue: Number(metrics.conversionsValue ?? 0),
      allConversions: Number(metrics.allConversions ?? 0),
    };
    await db.googleAdsCampaignDay.upsert({
      where: {
        date_campaignId: { date: data.date, campaignId: data.campaignId },
      },
      create: data,
      update: data,
    });
    campaignDays++;
  }

  const callRows = await gaqlSearch(
    clientCustomerId,
    `SELECT call_view.resource_name, call_view.start_call_date_time,
            call_view.call_duration_seconds, call_view.caller_area_code,
            call_view.caller_country_code, call_view.type, call_view.call_status,
            campaign.name
     FROM call_view
     WHERE segments.date BETWEEN '${isoDate(CALL_LOOKBACK_DAYS)}' AND '${isoDate(0)}'`,
    managerCustomerId,
  );

  let calls = 0;
  for (const row of callRows) {
    const call = row.callView as {
      resourceName?: string;
      startCallDateTime?: string;
      callDurationSeconds?: string;
      callerAreaCode?: string;
      callerCountryCode?: string;
      type?: string;
      callStatus?: string;
    };
    const campaign = row.campaign as { name?: string };
    if (!call?.resourceName) continue;

    const data = {
      resourceName: call.resourceName,
      startCallAt: call.startCallDateTime
        ? new Date(call.startCallDateTime.replace(" ", "T"))
        : null,
      durationSeconds: Number(call.callDurationSeconds ?? 0),
      callerAreaCode: call.callerAreaCode ?? null,
      callerCountryCode: call.callerCountryCode ?? null,
      callType: call.type ?? null,
      callStatus: call.callStatus ?? null,
      campaignName: campaign?.name ?? null,
    };
    await db.googleAdsCall.upsert({
      where: { resourceName: data.resourceName },
      create: data,
      update: data,
    });
    calls++;
  }

  const connection = await db.googleAdsConnection.findFirst();
  if (connection) {
    await db.googleAdsConnection.update({
      where: { id: connection.id },
      data: { lastSyncedAt: new Date() },
    });
  }

  return { campaignDays, calls, clientCustomerId };
}
