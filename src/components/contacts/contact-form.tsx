import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Defaults = {
  firstName?: string;
  lastName?: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  source?: string | null;
};

export function ContactForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  defaults?: Defaults;
  submitLabel: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-4 max-w-lg">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            name="firstName"
            defaultValue={defaults?.firstName}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            name="lastName"
            defaultValue={defaults?.lastName}
            required
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={defaults?.email ?? ""}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" defaultValue={defaults?.phone ?? ""} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          defaultValue={defaults?.address ?? ""}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="source">Source</Label>
        <Input
          id="source"
          name="source"
          placeholder="referral, website, walk-in..."
          defaultValue={defaults?.source ?? ""}
        />
      </div>
      <Button type="submit" className="mt-2 w-fit">
        {submitLabel}
      </Button>
    </form>
  );
}
