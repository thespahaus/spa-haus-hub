"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/permissions";

export async function disconnectGoogleAds(): Promise<{ error?: string }> {
  const session = await auth();
  if (!can(session?.user, "integration:manage")) {
    return { error: "Unauthorized" };
  }

  await db.googleAdsConnection.deleteMany({});
  revalidatePath("/settings/integrations");
  return {};
}
