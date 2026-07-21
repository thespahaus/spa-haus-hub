import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TaskStatusSelect } from "@/components/tasks/task-status-select";
import { formatDueDate } from "@/lib/utils";

export default async function TasksPage(props: {
  searchParams: Promise<{ mine?: string }>;
}) {
  const { mine } = await props.searchParams;
  const session = await auth();

  const tasks = await db.task.findMany({
    where: mine ? { assigneeId: session?.user.id } : undefined,
    orderBy: [{ dueDate: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
    include: {
      assignee: { select: { name: true } },
      contact: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  // Due dates are stored as UTC-midnight (date-only, from an <input type="date">),
  // so compare against UTC-midnight "today" to avoid a timezone-driven off-by-one.
  const now = new Date();
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <Button render={<Link href="/tasks/new" />} nativeButton={false} size="sm">
          New Task
        </Button>
      </div>

      <div className="flex rounded-md border text-sm w-fit">
        <Link
          href="/tasks"
          className={`px-3 py-1.5 rounded-l-md ${!mine ? "bg-muted font-medium" : "text-muted-foreground"}`}
        >
          All Tasks
        </Link>
        <Link
          href="/tasks?mine=1"
          className={`px-3 py-1.5 rounded-r-md border-l ${mine ? "bg-muted font-medium" : "text-muted-foreground"}`}
        >
          My Tasks
        </Link>
      </div>

      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tasks yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((t) => {
              const overdue =
                t.dueDate &&
                t.dueDate < today &&
                (t.status === "OPEN" || t.status === "IN_PROGRESS");
              return (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.title}</TableCell>
                  <TableCell
                    className={overdue ? "font-medium text-destructive" : ""}
                  >
                    {t.dueDate ? formatDueDate(t.dueDate) : "—"}
                    {overdue ? " (overdue)" : ""}
                  </TableCell>
                  <TableCell>{t.assignee.name}</TableCell>
                  <TableCell>
                    {t.contact ? (
                      <Link
                        href={`/contacts/${t.contact.id}`}
                        className="hover:underline"
                      >
                        {t.contact.firstName} {t.contact.lastName}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <TaskStatusSelect taskId={t.id} status={t.status} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
