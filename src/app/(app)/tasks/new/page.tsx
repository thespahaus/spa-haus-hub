import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createTask } from "@/actions/tasks";
import { TaskForm } from "@/components/tasks/task-form";

export default async function NewTaskPage(props: {
  searchParams: Promise<{ contactId?: string }>;
}) {
  const { contactId } = await props.searchParams;
  const session = await auth();

  const [users, fixedContact, contacts] = await Promise.all([
    db.user.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    contactId
      ? db.contact.findUnique({
          where: { id: contactId },
          select: { id: true, firstName: true, lastName: true },
        })
      : Promise.resolve(null),
    contactId
      ? Promise.resolve(undefined)
      : db.contact.findMany({
          orderBy: { createdAt: "desc" },
          select: { id: true, firstName: true, lastName: true },
          take: 100,
        }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">New Task</h1>
      <TaskForm
        action={createTask}
        users={users}
        fixedContact={fixedContact ?? undefined}
        contacts={contacts}
        defaultAssigneeId={session?.user.id}
      />
    </div>
  );
}
