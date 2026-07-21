import { z } from "zod";

export const quoteSchema = z.object({
  contactId: z.string().min(1, "Contact is required"),
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional(),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
});

export type QuoteInput = z.infer<typeof quoteSchema>;

export const QUOTE_STATUSES = [
  "DRAFT",
  "SENT",
  "VIEWED",
  "ACCEPTED",
  "DECLINED",
  "EXPIRED",
] as const;

export const QUOTE_STATUS_LABELS: Record<(typeof QUOTE_STATUSES)[number], string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  VIEWED: "Viewed",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  EXPIRED: "Expired",
};
