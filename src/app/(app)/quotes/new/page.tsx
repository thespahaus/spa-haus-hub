import { db } from "@/lib/db";
import { createQuote } from "@/actions/quotes";
import { QuoteForm } from "@/components/quotes/quote-form";

export default async function NewQuotePage(props: {
  searchParams: Promise<{ contactId?: string }>;
}) {
  const { contactId } = await props.searchParams;

  const fixedContact = contactId
    ? await db.contact.findUnique({
        where: { id: contactId },
        select: { id: true, firstName: true, lastName: true },
      })
    : null;

  const contacts = fixedContact
    ? undefined
    : await db.contact.findMany({
        orderBy: { createdAt: "desc" },
        select: { id: true, firstName: true, lastName: true },
        take: 100,
      });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">New Quote</h1>
      <QuoteForm
        action={createQuote}
        fixedContact={fixedContact ?? undefined}
        contacts={contacts}
        submitLabel="Create Quote"
      />
    </div>
  );
}
