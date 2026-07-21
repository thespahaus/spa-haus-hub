"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { can } from "@/lib/permissions";
import { quoteSchema, QUOTE_STATUSES, QUOTE_STATUS_LABELS } from "@/lib/validation/quote";
import type { QuoteStatus } from "@/generated/prisma/enums";

const CURRENCY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export async function createQuote(formData: FormData) {
  const session = await auth();
  if (!session?.user || !can(session.user, "quote:write")) {
    throw new Error("Unauthorized");
  }

  const parsed = quoteSchema.safeParse({
    contactId: formData.get("contactId"),
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    amount: formData.get("amount"),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid quote");
  }

  const quote = await db.quote.create({
    data: {
      contactId: parsed.data.contactId,
      ownerId: session.user.id,
      title: parsed.data.title,
      description: parsed.data.description || null,
      amount: parsed.data.amount,
    },
  });

  await logActivity({
    contactId: parsed.data.contactId,
    authorId: session.user.id,
    type: "STATUS_CHANGE",
    body: `Quote created: ${parsed.data.title} (${CURRENCY.format(parsed.data.amount)}).`,
  });

  revalidatePath("/quotes");
  revalidatePath(`/contacts/${parsed.data.contactId}`);
  redirect(`/contacts/${parsed.data.contactId}`);
}

export async function updateQuoteStatus(quoteId: string, status: string) {
  const session = await auth();
  if (!session?.user || !can(session.user, "quote:write")) {
    throw new Error("Unauthorized");
  }

  if (!QUOTE_STATUSES.includes(status as (typeof QUOTE_STATUSES)[number])) {
    throw new Error("Invalid status");
  }

  const existing = await db.quote.findUnique({ where: { id: quoteId } });
  if (!existing) throw new Error("Quote not found");
  if (existing.status === status) return;

  const data: {
    status: QuoteStatus;
    sentAt?: Date;
    decidedAt?: Date;
  } = { status: status as QuoteStatus };

  if (status === "SENT" && !existing.sentAt) {
    data.sentAt = new Date();
  }
  if ((status === "ACCEPTED" || status === "DECLINED") && !existing.decidedAt) {
    data.decidedAt = new Date();
  }

  await db.quote.update({ where: { id: quoteId }, data });

  await logActivity({
    contactId: existing.contactId,
    authorId: session.user.id,
    type: "STATUS_CHANGE",
    body: `Quote "${existing.title}" moved from ${QUOTE_STATUS_LABELS[existing.status as keyof typeof QUOTE_STATUS_LABELS]} to ${QUOTE_STATUS_LABELS[status as keyof typeof QUOTE_STATUS_LABELS]}.`,
  });

  revalidatePath("/quotes");
  revalidatePath(`/contacts/${existing.contactId}`);
}

export async function updateQuote(quoteId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user || !can(session.user, "quote:write")) {
    throw new Error("Unauthorized");
  }

  const existing = await db.quote.findUnique({ where: { id: quoteId } });
  if (!existing) throw new Error("Quote not found");

  const parsed = quoteSchema.safeParse({
    contactId: existing.contactId,
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    amount: formData.get("amount"),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid quote");
  }

  await db.quote.update({
    where: { id: quoteId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      amount: parsed.data.amount,
    },
  });

  revalidatePath("/quotes");
  revalidatePath(`/contacts/${existing.contactId}`);
  redirect(`/contacts/${existing.contactId}`);
}
