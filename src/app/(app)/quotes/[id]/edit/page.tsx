import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { updateQuote } from "@/actions/quotes";
import { QuoteForm } from "@/components/quotes/quote-form";

export default async function EditQuotePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const quote = await db.quote.findUnique({
    where: { id },
    include: { contact: { select: { id: true, firstName: true, lastName: true } } },
  });
  if (!quote) notFound();

  const updateWithId = updateQuote.bind(null, quote.id);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Edit Quote</h1>
      <QuoteForm
        action={updateWithId}
        fixedContact={quote.contact}
        defaults={{
          title: quote.title,
          description: quote.description,
          amount: quote.amount.toString(),
          productType: quote.productType,
          productModel: quote.productModel,
          dimensions: quote.dimensions,
          shellColor: quote.shellColor,
          cabinetColor: quote.cabinetColor,
          voltage: quote.voltage,
          sanitizer: quote.sanitizer,
          paymentMethod: quote.paymentMethod,
        }}
        submitLabel="Save Changes"
      />
    </div>
  );
}
