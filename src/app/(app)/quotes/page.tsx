import Link from "next/link";
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
import { QuoteStatusSelect } from "@/components/quotes/quote-status-select";
import { QUOTE_STATUSES, QUOTE_STATUS_LABELS } from "@/lib/validation/quote";

const CURRENCY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default async function QuotesPage(props: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await props.searchParams;
  const validStatus = QUOTE_STATUSES.includes(
    status as (typeof QUOTE_STATUSES)[number],
  )
    ? status
    : undefined;

  const quotes = await db.quote.findMany({
    where: validStatus ? { status: validStatus as never } : undefined,
    orderBy: { createdAt: "desc" },
    include: { contact: { select: { id: true, firstName: true, lastName: true } } },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Quotes</h1>
        <Button render={<Link href="/quotes/new" />} nativeButton={false} size="sm">
          New Quote
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link
          href="/quotes"
          className={`rounded-full border px-3 py-1 ${!validStatus ? "bg-muted font-medium" : "text-muted-foreground"}`}
        >
          All
        </Link>
        {QUOTE_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/quotes?status=${s}`}
            className={`rounded-full border px-3 py-1 ${validStatus === s ? "bg-muted font-medium" : "text-muted-foreground"}`}
          >
            {QUOTE_STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      {quotes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No quotes yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contact</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.map((q) => (
              <TableRow key={q.id}>
                <TableCell>
                  <Link
                    href={`/contacts/${q.contact.id}`}
                    className="font-medium hover:underline"
                  >
                    {q.contact.firstName} {q.contact.lastName}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={`/quotes/${q.id}/edit`} className="hover:underline">
                    {q.title}
                  </Link>
                </TableCell>
                <TableCell>{CURRENCY.format(Number(q.amount))}</TableCell>
                <TableCell>
                  <QuoteStatusSelect quoteId={q.id} status={q.status} />
                </TableCell>
                <TableCell>{q.createdAt.toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
