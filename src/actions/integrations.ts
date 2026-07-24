"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/permissions";
import { runGoogleAdsSync, type SyncResult } from "@/lib/google-ads/sync";

export async function syncGoogleAds(): Promise<{
  error?: string;
  result?: SyncResult;
}> {
  const session = await auth();
  if (!can(session?.user, "integration:manage")) {
    return { error: "Unauthorized" };
  }

  try {
    const result = await runGoogleAdsSync();
    revalidatePath("/settings/integrations");
    return { result };
  } catch (err) {
    console.error("Google Ads sync failed:", err);
    return { error: err instanceof Error ? err.message : "Sync failed" };
  }
}

export async function disconnectGoogleAds(): Promise<{ error?: string }> {
  const session = await auth();
  if (!can(session?.user, "integration:manage")) {
    return { error: "Unauthorized" };
  }

  await db.googleAdsConnection.deleteMany({});
  revalidatePath("/settings/integrations");
  return {};
}
