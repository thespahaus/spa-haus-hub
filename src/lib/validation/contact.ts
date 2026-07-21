import { z } from "zod";

export const contactSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.union([z.literal(""), z.string().trim().email()]).optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  source: z.string().trim().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const PIPELINE_STAGES = [
  "LEAD",
  "CONTACTED",
  "QUOTED",
  "NEGOTIATING",
  "CUSTOMER",
  "LOST",
] as const;

export const STAGE_LABELS: Record<(typeof PIPELINE_STAGES)[number], string> = {
  LEAD: "Lead",
  CONTACTED: "Contacted",
  QUOTED: "Quoted",
  NEGOTIATING: "Negotiating",
  CUSTOMER: "Customer",
  LOST: "Lost",
};
