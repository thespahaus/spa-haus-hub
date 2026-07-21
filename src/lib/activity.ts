import { db } from "@/lib/db";
import type { ActivityType } from "@/generated/prisma/enums";

export function logActivity(params: {
  contactId: string;
  authorId?: string | null;
  type: ActivityType;
  body: string;
  source?: string;
}) {
  return db.activity.create({
    data: {
      contactId: params.contactId,
      authorId: params.authorId ?? null,
      type: params.type,
      body: params.body,
      source: params.source ?? "manual",
    },
  });
}
