import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";

export async function createAutoTask(params: {
  contactId: string;
  assigneeId: string;
  authorId: string;
  title: string;
  description: string;
  dueInDays?: number;
}) {
  const dueDate = params.dueInDays
    ? new Date(Date.now() + params.dueInDays * 24 * 60 * 60 * 1000)
    : new Date();

  const task = await db.task.create({
    data: {
      title: params.title,
      description: params.description,
      dueDate,
      assigneeId: params.assigneeId,
      createdById: params.authorId,
      contactId: params.contactId,
    },
  });

  await logActivity({
    contactId: params.contactId,
    authorId: params.authorId,
    type: "TASK",
    body: `Task created: ${params.title}.`,
  });

  return task;
}
