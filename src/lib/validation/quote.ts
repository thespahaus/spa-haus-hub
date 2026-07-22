import { z } from "zod";

const emptyToUndefined = (val: unknown) => (val === "" ? undefined : val);

export const SHELL_COLORS = [
  "SILVER_MARBLE",
  "STORM_CLOUDS",
  "TUSCAN_SUN",
  "SMOKEY_MOUNTAINS",
  "MIDNIGHT_CANYON",
] as const;

export const SHELL_COLOR_LABELS: Record<(typeof SHELL_COLORS)[number], string> = {
  SILVER_MARBLE: "Silver Marble",
  STORM_CLOUDS: "Storm Clouds",
  TUSCAN_SUN: "Tuscan Sun",
  SMOKEY_MOUNTAINS: "Smokey Mountains",
  MIDNIGHT_CANYON: "Midnight Canyon",
};

export const CABINET_COLORS = ["MODERN_MOCHA", "CHARCOAL", "LIGHT_FOG"] as const;

export const CABINET_COLOR_LABELS: Record<(typeof CABINET_COLORS)[number], string> = {
  MODERN_MOCHA: "Modern Mocha — Brown",
  CHARCOAL: "Charcoal — Dark Grey",
  LIGHT_FOG: "Light Fog — Light Grey",
};

export const VOLTAGES = ["V110", "V220_240"] as const;

export const VOLTAGE_LABELS: Record<(typeof VOLTAGES)[number], string> = {
  V110: "110V — standard outlet",
  V220_240: "220V / 240V — licensed electrician required",
};

export const SANITIZERS = ["BROMINE", "CHLORINE"] as const;

export const SANITIZER_LABELS: Record<(typeof SANITIZERS)[number], string> = {
  BROMINE: "Bromine",
  CHLORINE: "Chlorine",
};

export const PAYMENT_METHODS = [
  "CASH_CHECK",
  "DEBIT_ACH",
  "CREDIT_CARD",
  "WELLS_FARGO_FINANCING",
] as const;

export const PAYMENT_METHOD_LABELS: Record<(typeof PAYMENT_METHODS)[number], string> = {
  CASH_CHECK: "Cash or Check",
  DEBIT_ACH: "Debit / ACH",
  CREDIT_CARD: "Credit Card",
  WELLS_FARGO_FINANCING: "Wells Fargo Outdoor Solutions Financing",
};

export const PAYMENT_METHOD_NOTES: Record<(typeof PAYMENT_METHODS)[number], string | null> = {
  CASH_CHECK: null,
  DEBIT_ACH: null,
  CREDIT_CARD: "A 3.5% processing fee is applied to the invoice total.",
  WELLS_FARGO_FINANCING:
    "A 4.9% financing fee is applied. 100% of the purchase price is charged at delivery — no deposit.",
};

export const quoteSchema = z.object({
  contactId: z.string().min(1, "Contact is required"),
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional(),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  productModel: z.string().trim().optional(),
  dimensions: z.string().trim().optional(),
  shellColor: z.preprocess(emptyToUndefined, z.enum(SHELL_COLORS).optional()),
  cabinetColor: z.preprocess(emptyToUndefined, z.enum(CABINET_COLORS).optional()),
  voltage: z.preprocess(emptyToUndefined, z.enum(VOLTAGES).optional()),
  sanitizer: z.preprocess(emptyToUndefined, z.enum(SANITIZERS).optional()),
  paymentMethod: z.preprocess(emptyToUndefined, z.enum(PAYMENT_METHODS).optional()),
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
