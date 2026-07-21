import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StageSelect } from "@/components/contacts/stage-select";
import { ActivityTimeline } from "@/components/contacts/activity-timeline";
import { QuoteStatusSelect } from "@/components/quotes/quote-status-select";

const CURRENCY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default async function ContactDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const contact = await db.contact.findUnique({
    where: { id },
    include: {
      owner: { select: { name: true } },
      activities: { orderBy: { occurredAt: "desc" } },
      quotes: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!contact) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {contact.firstName} {contact.lastName}
          </h1>
          <div className="mt-2">
            <StageSelect contactId={contact.id} stage={contact.stage} />
          </div>
        </div>
        <Button
          render={<Link href={`/contacts/${contact.id}/edit`} />}
          nativeButton={false}
          variant="outline"
          size="sm"
        >
          Edit
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Contact Info
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Email: </span>
              {contact.email ?? "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Phone: </span>
              {contact.phone ?? "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Address: </span>
              {contact.address ?? "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Source: </span>
              {contact.source ?? "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Owner: </span>
              {contact.owner?.name ?? "—"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-sm text-muted-foreground">
              Quotes
            </CardTitle>
            <Link
              href={`/quotes/new?contactId=${contact.id}`}
              className="text-xs text-muted-foreground hover:text-foreground hover:underline"
            >
              + New
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {contact.quotes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No quotes yet.</p>
            ) : (
              contact.quotes.map((q) => (
                <div key={q.id} className="flex flex-col gap-1 text-sm">
                  <Link
                    href={`/quotes/${q.id}/edit`}
                    className="font-medium hover:underline"
                  >
                    {q.title}
                  </Link>
                  <div className="text-xs text-muted-foreground">
                    {CURRENCY.format(Number(q.amount))}
                  </div>
                  <QuoteStatusSelect quoteId={q.id} status={q.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Tasks land here next.
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityTimeline contactId={contact.id} activities={contact.activities} />
        </CardContent>
      </Card>
    </div>
  );
}
