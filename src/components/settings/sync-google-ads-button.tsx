"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { syncGoogleAds } from "@/actions/integrations";
import { Button } from "@/components/ui/button";

export function SyncGoogleAdsButton() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const router = useRouter();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => {
            setMessage(null);
            startTransition(async () => {
              const { error, result } = await syncGoogleAds();
              if (error) {
                setIsError(true);
                setMessage(error);
              } else if (result) {
                setIsError(false);
                setMessage(
                  `Synced ${result.campaignDays} campaign-day rows and ${result.calls} calls from account ${result.clientCustomerId}.`,
                );
              }
              router.refresh();
            });
          }}
        >
          {isPending ? "Syncing…" : "Sync now"}
        </Button>
      </div>
      {message && (
        <p
          className={
            isError ? "text-sm text-destructive" : "text-sm text-muted-foreground"
          }
        >
          {message}
        </p>
      )}
    </div>
  );
}
