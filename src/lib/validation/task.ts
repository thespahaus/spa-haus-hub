import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional(),
  dueDate: z.string().optional(),
  assigneeId: z.string().min(1, "Assignee is required"),
  contactId: z.string().optional(),
});

export type TaskInput = z.infer<typeof taskSchema>;

export const TASK_STATUSES = ["OPEN", "IN_PROGRESS", "DONE", "CANCELED"] as const;

export const TASK_STATUS_LABELS: Record<(typeof TASK_STATUSES)[number], string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
  CANCELED: "Canceled",
};
