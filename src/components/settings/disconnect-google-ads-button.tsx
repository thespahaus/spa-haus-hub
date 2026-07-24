"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { disconnectGoogleAds } from "@/actions/integrations";
import { Button } from "@/components/ui/button";

export function DisconnectGoogleAdsButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      type="button"
      size="sm"
      variant="destructive"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await disconnectGoogleAds();
          router.refresh();
        });
      }}
    >
      Disconnect
    </Button>
  );
}
