import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { DisconnectGoogleAdsButton } from "@/components/settings/disconnect-google-ads-button";
import { SyncGoogleAdsButton } from "@/components/settings/sync-google-ads-button";

const STATUS_MESSAGES: Record<string, string> = {
  denied: "Google sign-in was cancelled — nothing was connected.",
  invalid_state: "The connection attempt expired or was invalid — please try again.",
  no_refresh_token:
    "Google didn't return a refresh token. Try disconnecting any prior grant for this account in your Google Account's third-party access settings, then reconnect.",
  exchange_failed: "Something went wrong completing the connection — please try again.",
};

export default async function IntegrationsSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ google_ads?: string; detail?: string }>;
}) {
  const session = await auth();
  if (!can(session?.user, "integration:manage")) {
    redirect("/");
  }

  const { google_ads: status, detail } = await searchParams;
  const connection = await db.googleAdsConnection.findFirst();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Integrations</h1>

      {status === "connected" && (
        <div className="rounded-lg border border-green-600/30 bg-green-600/10 p-3 text-sm text-green-700 dark:text-green-400">
          Google Ads connected successfully.
        </div>
      )}
      {status === "error" && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {STATUS_MESSAGES[detail ?? ""] ??
            "Something went wrong connecting Google Ads — please try again."}
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-lg border p-4">
        <h2 className="text-sm font-medium">Google Ads</h2>
        <p className="text-sm text-muted-foreground">
          Read-only reporting connection. This can only ever read campaign,
          call, and conversion data — the connected account has Read-only
          access in Google Ads itself, so no changes can be made through this
          integration under any circumstance.
        </p>

        {connection ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between rounded border p-3 text-sm">
              <span>
                Connected as <strong>{connection.connectedEmail}</strong>
                <span className="text-muted-foreground">
                  {" "}
                  since {connection.connectedAt.toLocaleDateString()}
                  {connection.lastSyncedAt &&
                    ` · last synced ${connection.lastSyncedAt.toLocaleString()}`}
                </span>
              </span>
              <DisconnectGoogleAdsButton />
            </div>
            <SyncGoogleAdsButton />
          </div>
        ) : (
          <Button
            render={<a href="/api/integrations/google-ads/connect" />}
            nativeButton={false}
          >
            Connect Google Ads
          </Button>
        )}
      </div>
    </div>
  );
}
