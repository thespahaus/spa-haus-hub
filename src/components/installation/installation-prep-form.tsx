"use client";

import { useTransition } from "react";
import { updateInstallationPrep } from "@/actions/installations";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function InstallationPrepForm({
  installationId,
  prepConfirmed,
  prepConfirmedAt,
  prepNotes,
}: {
  installationId: string;
  prepConfirmed: boolean;
  prepConfirmedAt: Date | null;
  prepNotes: string | null;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">
          Site &amp; Electrical Prep Check-In
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          action={(formData: FormData) => {
            startTransition(() => {
              updateInstallationPrep(installationId, formData);
            });
          }}
          className="flex flex-col gap-3"
        >
          <label className="flex items-center gap-2 text-sm">
            <Checkbox name="prepConfirmed" defaultChecked={prepConfirmed} />
            Customer has concrete/decking &amp; electrical contractors lined up
            with an install date
          </label>
          {prepConfirmedAt && (
            <p className="text-xs text-muted-foreground">
              Confirmed {prepConfirmedAt.toLocaleDateString("en-US")}
            </p>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="prepNotes">Prep notes</Label>
            <Textarea
              id="prepNotes"
              name="prepNotes"
              placeholder="Contractor names, scheduled dates, anything worth remembering..."
              defaultValue={prepNotes ?? ""}
            />
          </div>
          <Button type="submit" className="w-fit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Prep Status"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
