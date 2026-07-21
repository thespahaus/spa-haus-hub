import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StageSelect } from "@/components/contacts/stage-select";

export default async function ContactDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const contact = await db.contact.findUnique({
    where: { id },
    include: {
      owner: { select: { name: true } },
      activities: { orderBy: { occurredAt: "desc" } },
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
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Quotes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Quotes land here next.
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
        <CardContent className="flex flex-col gap-3">
          {contact.activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            contact.activities.map((a) => (
              <div key={a.id} className="border-l-2 pl-3 text-sm">
                <div className="text-xs text-muted-foreground">
                  {a.occurredAt.toLocaleString()} · {a.type}
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
