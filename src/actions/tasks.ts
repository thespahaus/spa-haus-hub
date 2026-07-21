"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { can } from "@/lib/permissions";
import { taskSchema, TASK_STATUSES } from "@/lib/validation/task";
import type { TaskStatus } from "@/generated/prisma/enums";

export async function createTask(formData: FormData) {
  const session = await auth();
  if (!session?.user || !can(session.user, "task:write")) {
    throw new Error("Unauthorized");
  }

  const contactId = formData.get("contactId");
  const parsed = taskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    dueDate: formData.get("dueDate") ?? "",
    assigneeId: formData.get("assigneeId"),
    contactId: typeof contactId === "string" && contactId ? contactId : undefined,
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid task");
  }

  await db.task.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      assigneeId: parsed.data.assigneeId,
      createdById: session.user.id,
      contactId: parsed.data.contactId ?? null,
    },
  });

  if (parsed.data.contactId) {
    await logActivity({
      contactId: parsed.data.contactId,
      authorId: session.user.id,
      type: "TASK",
      body: `Task created: ${parsed.data.title}.`,
    });
  }

  revalidatePath("/tasks");
  if (parsed.data.contactId) {
    revalidatePath(`/contacts/${parsed.data.contactId}`);
    redirect(`/contacts/${parsed.data.contactId}`);
  }
  redirect("/tasks");
}

export async function updateTaskStatus(taskId: string, status: string) {
  const session = await auth();
  if (!session?.user || !can(session.user, "task:write")) {
    throw new Error("Unauthorized");
  }

  if (!TASK_STATUSES.includes(status as (typeof TASK_STATUSES)[number])) {
    throw new Error("Invalid status");
  }

  const existing = await db.task.findUnique({ where: { id: taskId } });
  if (!existing) throw new Error("Task not found");
  if (existing.status === status) return;

  await db.task.update({
    where: { id: taskId },
    data: {
      status: status as TaskStatus,
      completedAt: status === "DONE" ? new Date() : null,
    },
  });

  if (existing.contactId && status === "DONE") {
    await logActivity({
      contactId: existing.contactId,
      authorId: session.user.id,
      type: "TASK",
      body: `Task completed: ${existing.title}.`,
    });
  }

  revalidatePath("/tasks");
  if (existing.contactId) {
    revalidatePath(`/contacts/${existing.contactId}`);
  }
}
