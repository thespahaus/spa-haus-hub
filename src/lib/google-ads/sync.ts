import { db } from "@/lib/db";
import { gaqlSearch, listAccessibleCustomers } from "@/lib/google-ads/client";
import { accountWallClockToUtc } from "@/lib/google-ads/time";

// Pull campaign history year-by-year back to this floor. The account started
// spending in early 2024; 2020 is a safe floor (empty earlier years just
// return no rows). Year-chunking avoids any single huge date-range query.
const HISTORY_START_YEAR = 2020;
// Bulk-insert new rows in chunks this size (one INSERT per chunk).
const INSERT_CHUNK = 1000;

function isoDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
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
      // Verify account type explicitly rather than trusting "the campaign
      // query didn't throw" alone — that signal turned out to be unreliable
      // (a manager account query transiently succeeded once and got a bad
      // pairing cached, breaking every sync after it).
      const customerRows = await gaqlSearch(
        candidate,
        `SELECT customer.id, customer.manager FROM customer LIMIT 1`,
        candidate,
      );
      const isManager = (customerRows[0]?.customer as { manager?: boolean })
        ?.manager;
      if (isManager !== false) {
        console.log(
          `Google Ads discovery fallback: customer ${candidate} is not a non-manager client (manager=${isManager}), skipping`,
        );
        attemptErrors.push(`${candidate}: reported as manager=${isManager}, not a usable client`);
        continue;
      }

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

type CampaignDayData = {
  date: Date;
  campaignId: string;
  campaignName: string;
  campaignStatus: string;
  costMicros: bigint;
  clicks: number;
  impressions: number;
  conversions: number;
  conversionsValue: number;
  allConversions: number;
};

export async function runGoogleAdsSync(): Promise<SyncResult> {
  const { managerCustomerId, clientCustomerId } = await discoverAccounts();

  // Pull campaign performance year-by-year, all the way back to the floor, so
  // a single query never spans a huge range. Empty years just return nothing.
  const currentYear = new Date().getUTCFullYear();
  const seen = new Set<string>();
  const campaignData: CampaignDayData[] = [];

  for (let year = HISTORY_START_YEAR; year <= currentYear; year++) {
    const start = `${year}-01-01`;
    const end = year === currentYear ? isoDate(0) : `${year}-12-31`;
    const rows = await gaqlSearch(
      clientCustomerId,
      `SELECT segments.date, campaign.id, campaign.name, campaign.status,
              metrics.cost_micros, metrics.clicks, metrics.impressions,
              metrics.conversions, metrics.conversions_value, metrics.all_conversions
       FROM campaign
       WHERE segments.date BETWEEN '${start}' AND '${end}'`,
      managerCustomerId,
    );
    for (const row of rows) {
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
      const key = `${segments.date}:${campaign.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      campaignData.push({
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
      });
    }
    console.log(`Google Ads sync: year ${year} → ${rows.length} campaign-day rows`);
  }

  // Wipe and reload campaign history in bulk. A full-history reload each sync
  // keeps recent (restated) days correct without per-row upserts, and chunked
  // createMany stays well within the function time budget.
  await db.googleAdsCampaignDay.deleteMany({});
  for (const part of chunk(campaignData, INSERT_CHUNK)) {
    await db.googleAdsCampaignDay.createMany({ data: part });
  }
  const campaignDays = campaignData.length;

  // call_view rejects segments.date (PROHIBITED_SEGMENT) and only retains a
  // limited window server-side, so pull everything it has. Timestamps come
  // back as account-time-zone wall-clock strings; convert to correct UTC.
  const callRows = await gaqlSearch(
    clientCustomerId,
    `SELECT call_view.resource_name, call_view.start_call_date_time,
            call_view.call_duration_seconds, call_view.caller_area_code,
            call_view.caller_country_code, call_view.type, call_view.call_status,
            campaign.name
     FROM call_view`,
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

    const startCallAt = call.startCallDateTime
      ? accountWallClockToUtc(call.startCallDateTime)
      : null;

    const data = {
      resourceName: call.resourceName,
      startCallAt,
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
