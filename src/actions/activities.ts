"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { can } from "@/lib/permissions";
import type { ActivityType } from "@/generated/prisma/enums";

const MANUAL_TYPES = ["NOTE", "CALL", "MEETING"] as const;

export async function createManualActivity(contactId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user || !can(session.user, "activity:write")) {
    throw new Error("Unauthorized");
  }

  const type = formData.get("type");
  const body = formData.get("body");

  if (typeof body !== "string" || body.trim().length === 0) {
    throw new Error("Note can't be empty");
  }
  if (
    typeof type !== "string" ||
    !MANUAL_TYPES.includes(type as (typeof MANUAL_TYPES)[number])
  ) {
    throw new Error("Invalid activity type");
  }

  await logActivity({
    contactId,
    authorId: session.user.id,
    type: type as ActivityType,
    body: body.trim(),
  });

  revalidatePath(`/contacts/${contactId}`);
}
