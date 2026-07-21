import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { PipelineBoard } from "@/components/contacts/pipeline-board";
import { ContactsTable } from "@/components/contacts/contacts-table";

export default async function ContactsPage(props: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await props.searchParams;
  const isListView = view === "list";

  const contacts = await db.contact.findMany({
    orderBy: { createdAt: "desc" },
    include: { owner: { select: { name: true } } },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Contacts</h1>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border text-sm">
            <Link
              href="/contacts"
              className={`px-3 py-1.5 rounded-l-md ${!isListView ? "bg-muted font-medium" : "text-muted-foreground"}`}
            >
              Board
            </Link>
            <Link
              href="/contacts?view=list"
              className={`px-3 py-1.5 rounded-r-md border-l ${isListView ? "bg-muted font-medium" : "text-muted-foreground"}`}
            >
              List
            </Link>
          </div>
          <Button
            render={<Link href="/contacts/new" />}
            nativeButton={false}
            size="sm"
          >
            New Contact
          </Button>
        </div>
      </div>

      {isListView ? (
        <ContactsTable contacts={contacts} />
      ) : (
        <PipelineBoard contacts={contacts} />
      )}
    </div>
  );
}
