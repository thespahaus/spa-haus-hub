import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { getAdsOverview, getRecentCalls } from "@/lib/google-ads/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEasternDateTime, formatUtcDate } from "@/lib/utils";

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const usd2 = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
const num = (n: number) => n.toLocaleString("en-US");

function formatDuration(seconds: number): string {
  if (seconds <= 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default async function GoogleAdsPage() {
  const session = await auth();
  if (!can(session?.user, "integration:manage")) {
    redirect("/");
  }

  const overview = await getAdsOverview();

  if (!overview) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Google Ads</h1>
        <p className="text-sm text-muted-foreground">
          No Google Ads data yet. Connect the account and run a sync from{" "}
          <Link href="/settings/integrations" className="underline">
            Settings → Integrations
          </Link>
          .
        </p>
      </div>
    );
  }

  const recentCalls = await getRecentCalls(25);

  const tiles = [
    { label: "Total Spend", value: usd(overview.totalSpend) },
    { label: "Clicks", value: num(overview.totalClicks) },
    { label: "Real Calls", value: num(overview.totalCalls) },
    { label: "Missed Calls", value: num(overview.missedCalls) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-semibold">Google Ads</h1>
        <p className="text-sm text-muted-foreground">
          {overview.dataStart && overview.dataEnd && (
            <>
              {formatUtcDate(overview.dataStart)} – {formatUtcDate(overview.dataEnd)}
            </>
          )}
          {overview.lastSyncedAt && (
            <> · last synced {formatEasternDateTime(overview.lastSyncedAt)}</>
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.label}>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                {t.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{t.value}</CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-lg border bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-300">
        <strong>Real Calls</strong>{" "}
        counts actual phone calls logged by Google — a truer measure of leads
        than Google&apos;s own &ldquo;conversions&rdquo; figure of{" "}
        {num(Math.round(overview.googleConversions))}{" "}
        over this period, which historically undercounts calls for this account.
        Revenue from closed sales isn&apos;t here — that lives in QuickBooks.
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">By campaign</h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="p-3 font-medium">Campaign</th>
                <th className="p-3 text-right font-medium">Spend</th>
                <th className="p-3 text-right font-medium">Clicks</th>
                <th className="p-3 text-right font-medium">Real Calls</th>
                <th className="p-3 text-right font-medium">Cost / Call</th>
              </tr>
            </thead>
            <tbody>
              {overview.campaigns.map((c) => (
                <tr key={c.campaignName} className="border-b last:border-0">
                  <td className="p-3">{c.campaignName}</td>
                  <td className="p-3 text-right">{usd(c.spend)}</td>
                  <td className="p-3 text-right">{num(c.clicks)}</td>
                  <td className="p-3 text-right">{num(c.realCalls)}</td>
                  <td className="p-3 text-right">
                    {c.costPerCall === null ? "—" : usd2(c.costPerCall)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">Recent calls</h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="p-3 font-medium">When (ET)</th>
                <th className="p-3 font-medium">Campaign</th>
                <th className="p-3 font-medium">Area</th>
                <th className="p-3 text-right font-medium">Duration</th>
                <th className="p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentCalls.map((call) => (
                <tr key={call.resourceName} className="border-b last:border-0">
                  <td className="p-3">
                    {call.startCallAt ? formatEasternDateTime(call.startCallAt) : "—"}
                  </td>
                  <td className="p-3">{call.campaignName ?? "—"}</td>
                  <td className="p-3">{call.callerAreaCode ?? "—"}</td>
                  <td className="p-3 text-right">{formatDuration(call.durationSeconds)}</td>
                  <td className="p-3">{call.callStatus ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
