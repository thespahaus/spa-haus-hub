import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  const now = new Date();
  const todayUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const tomorrowUTC = new Date(todayUTC);
  tomorrowUTC.setUTCDate(tomorrowUTC.getUTCDate() + 1);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    openLeads,
    quotesAwaiting,
    tasksDueSoon,
    customersThisMonth,
    recentActivity,
  ] = await Promise.all([
    db.contact.count({
      where: { stage: { in: ["LEAD", "CONTACTED", "QUOTED", "NEGOTIATING"] } },
    }),
    db.quote.count({ where: { status: { in: ["SENT", "VIEWED"] } } }),
    db.task.count({
      where: {
        dueDate: { lt: tomorrowUTC },
        status: { in: ["OPEN", "IN_PROGRESS"] },
      },
    }),
    db.contact.count({
      where: { stage: "CUSTOMER", updatedAt: { gte: startOfMonth } },
    }),
    db.activity.findMany({
      orderBy: { occurredAt: "desc" },
      take: 10,
      include: { contact: { select: { id: true, firstName: true, lastName: true } } },
    }),
  ]);

  const stats = [
    { label: "Open Leads", value: openLeads, href: "/contacts" },
    {
      label: "Quotes Awaiting Response",
      value: quotesAwaiting,
      href: "/quotes?status=SENT",
    },
    { label: "Tasks Due Today or Overdue", value: tasksDueSoon, href: "/tasks" },
    { label: "Customers This Month", value: customersThisMonth, href: "/contacts?view=list" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="transition-colors hover:border-foreground/30">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">
                  {s.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">
                {s.value}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing yet — activity across all contacts shows up here.
            </p>
          ) : (
            recentActivity.map((a) => (
              <div key={a.id} className="border-l-2 pl-3 text-sm">
                <div className="text-xs text-muted-foreground">
                  {a.occurredAt.toLocaleString()} ·{" "}
                  <Link
                    href={`/contacts/${a.contact.id}`}
                    className="hover:underline"
                  >
                    {a.contact.firstName} {a.contact.lastName}
                  </Link>
                </div>
                <div>{a.body}</div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
