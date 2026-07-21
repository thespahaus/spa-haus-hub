"use client";

import { useTransition } from "react";
import { updateQuoteStatus } from "@/actions/quotes";
import { QUOTE_STATUSES, QUOTE_STATUS_LABELS } from "@/lib/validation/quote";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function QuoteStatusSelect({
  quoteId,
  status,
}: {
  quoteId: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={status}
      disabled={isPending}
      onValueChange={(value) => {
        if (!value) return;
        startTransition(() => {
          updateQuoteStatus(quoteId, value);
        });
      }}
    >
      <SelectTrigger size="sm" className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {QUOTE_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {QUOTE_STATUS_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
