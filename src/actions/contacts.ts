"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { can } from "@/lib/permissions";
import { contactSchema, PIPELINE_STAGES, STAGE_LABELS } from "@/lib/validation/contact";
import type { PipelineStage } from "@/generated/prisma/enums";

export async function createContact(formData: FormData) {
  const session = await auth();
  if (!session?.user || !can(session.user, "contact:write")) {
    throw new Error("Unauthorized");
  }

  const parsed = contactSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    address: formData.get("address") ?? "",
    source: formData.get("source") ?? "",
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid contact");
  }

  const contact = await db.contact.create({
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
      source: parsed.data.source || null,
      ownerId: session.user.id,
    },
  });

  await logActivity({
    contactId: contact.id,
    authorId: session.user.id,
    type: "STATUS_CHANGE",
    body: `Added as a new lead by ${session.user.name}.`,
  });

  revalidatePath("/contacts");
  redirect(`/contacts/${contact.id}`);
}

export async function updateContactStage(contactId: string, stage: string) {
  const session = await auth();
  if (!session?.user || !can(session.user, "contact:write")) {
    throw new Error("Unauthorized");
  }

  if (!PIPELINE_STAGES.includes(stage as (typeof PIPELINE_STAGES)[number])) {
    throw new Error("Invalid stage");
  }

  const existing = await db.contact.findUnique({ where: { id: contactId } });
  if (!existing) throw new Error("Contact not found");

  if (existing.stage !== stage) {
    await db.contact.update({
      where: { id: contactId },
      data: { stage: stage as PipelineStage },
    });

    await logActivity({
      contactId,
      authorId: session.user.id,
      type: "STATUS_CHANGE",
      body: `Moved from ${STAGE_LABELS[existing.stage as keyof typeof STAGE_LABELS]} to ${STAGE_LABELS[stage as keyof typeof STAGE_LABELS]}.`,
    });
  }

  revalidatePath("/contacts");
  revalidatePath(`/contacts/${contactId}`);
}

export async function updateContact(contactId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user || !can(session.user, "contact:write")) {
    throw new Error("Unauthorized");
  }

  const parsed = contactSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    address: formData.get("address") ?? "",
    source: formData.get("source") ?? "",
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid contact");
  }

  await db.contact.update({
    where: { id: contactId },
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
      source: parsed.data.source || null,
    },
  });

  revalidatePath("/contacts");
  revalidatePath(`/contacts/${contactId}`);
  redirect(`/contacts/${contactId}`);
}
