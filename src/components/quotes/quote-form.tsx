import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Defaults = {
  title?: string;
  description?: string | null;
  amount?: number | string;
};

export function QuoteForm({
  action,
  contacts,
  fixedContact,
  defaults,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  contacts?: { id: string; firstName: string; lastName: string }[];
  fixedContact?: { id: string; firstName: string; lastName: string };
  defaults?: Defaults;
  submitLabel: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-4 max-w-lg">
      {fixedContact ? (
        <div className="flex flex-col gap-2">
          <Label>Contact</Label>
          <input type="hidden" name="contactId" value={fixedContact.id} />
          <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
            {fixedContact.firstName} {fixedContact.lastName}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Label htmlFor="contactId">Contact</Label>
          <Select name="contactId">
            <SelectTrigger id="contactId" className="w-full">
              <SelectValue placeholder="Choose a contact" />
            </SelectTrigger>
            <SelectContent>
              {contacts?.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.firstName} {c.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="e.g. Hot Springs Grandee — 7-seat"
          defaultValue={defaults?.title}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0"
          defaultValue={defaults?.amount}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Model, color, add-ons, install notes..."
          defaultValue={defaults?.description ?? ""}
        />
      </div>
      <Button type="submit" className="mt-2 w-fit">
        {submitLabel}
      </Button>
    </form>
  );
}
