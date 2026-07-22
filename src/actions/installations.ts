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

function dateOrNull(value: FormDataEntryValue | null): Date | null {
  if (typeof value !== "string" || !value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function textOrNull(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

export async function updateInstallationChecklist(
  installationId: string,
  formData: FormData,
) {
  const session = await auth();
  if (!session?.user || !can(session.user, "installation:write")) {
    throw new Error("Unauthorized");
  }

  const existing = await db.installation.findUnique({
    where: { id: installationId },
  });
  if (!existing) throw new Error("Installation not found");

  let checklist: unknown = undefined;
  const rawChecklist = formData.get("checklist");
  if (typeof rawChecklist === "string" && rawChecklist) {
    try {
      checklist = JSON.parse(rawChecklist);
    } catch {
      throw new Error("Invalid checklist data");
    }
  }

  await db.installation.update({
    where: { id: installationId },
    data: {
      visitDate: dateOrNull(formData.get("visitDate")),
      arrivalTime: dateOrNull(formData.get("arrivalTime")),
      departureTime: dateOrNull(formData.get("departureTime")),
      serialNumber: textOrNull(formData.get("serialNumber")),
      gfciBrand: textOrNull(formData.get("gfciBrand")),
      gfciAmperage: textOrNull(formData.get("gfciAmperage")),

      chemicalKitPresent: formData.get("chemicalKitPresent") === "on",
      coverLifterBoxPresent: formData.get("coverLifterBoxPresent") === "on",
      stepsBoxPresent: formData.get("stepsBoxPresent") === "on",
      coverClipsHardwarePresent:
        formData.get("coverClipsHardwarePresent") === "on",
      otherAccessoriesPresent: formData.get("otherAccessoriesPresent") === "on",
      waterFilled: formData.get("waterFilled") === "on",
      powerOn: formData.get("powerOn") === "on",

      checklist: checklist === undefined ? undefined : (checklist as object),

      issuesNotes: textOrNull(formData.get("issuesNotes")),
      photosTaken: formData.get("photosTaken") === "on",
      followUpWarranty: formData.get("followUpWarranty") === "on",
      followUpService: formData.get("followUpService") === "on",
      followUpParts: formData.get("followUpParts") === "on",

      installerSignedAt:
        formData.get("installerSigned") === "on"
          ? (existing.installerSignedAt ?? new Date())
          : null,
      customerSignedAt:
        formData.get("customerSigned") === "on"
          ? (existing.customerSignedAt ?? new Date())
          : null,
      startupCallAt:
        formData.get("startupCallDone") === "on"
          ? (existing.startupCallAt ?? new Date())
          : null,
      startupCallNotes: textOrNull(formData.get("startupCallNotes")),
    },
  });

  await logActivity({
    contactId: existing.contactId,
    authorId: session.user.id,
    type: "TASK",
    body: "Installation checklist updated.",
  });

  revalidatePath(`/installations/${installationId}`);
  revalidatePath(`/contacts/${existing.contactId}`);
}
