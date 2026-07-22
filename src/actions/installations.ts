"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { can } from "@/lib/permissions";
import {
  INSTALLATION_STAGES,
  INSTALLATION_STAGE_LABELS,
} from "@/lib/validation/installation";
import type { InstallationStage } from "@/generated/prisma/enums";

export async function updateInstallationStage(
  installationId: string,
  stage: string,
) {
  const session = await auth();
  if (!session?.user || !can(session.user, "installation:write")) {
    throw new Error("Unauthorized");
  }

  if (
    !INSTALLATION_STAGES.includes(
      stage as (typeof INSTALLATION_STAGES)[number],
    )
  ) {
    throw new Error("Invalid stage");
  }

  const existing = await db.installation.findUnique({
    where: { id: installationId },
  });
  if (!existing) throw new Error("Installation not found");
  if (existing.stage === stage) return;

  await db.installation.update({
    where: { id: installationId },
    data: { stage: stage as InstallationStage },
  });

  await logActivity({
    contactId: existing.contactId,
    authorId: session.user.id,
    type: "STATUS_CHANGE",
    body: `Installation moved from ${INSTALLATION_STAGE_LABELS[existing.stage as keyof typeof INSTALLATION_STAGE_LABELS]} to ${INSTALLATION_STAGE_LABELS[stage as keyof typeof INSTALLATION_STAGE_LABELS]}.`,
  });

  revalidatePath(`/contacts/${existing.contactId}`);
  revalidatePath(`/installations/${installationId}`);
}
