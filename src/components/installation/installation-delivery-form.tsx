"use client";

import { useState, useTransition } from "react";
import { updateInstallationDelivery } from "@/actions/installations";
import {
  DELIVERY_METHODS,
  DELIVERY_METHOD_LABELS,
} from "@/lib/validation/installation";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function InstallationDeliveryForm({
  installationId,
  deliveryMethod,
  deliveryNotes,
}: {
  installationId: string;
  deliveryMethod: string | null;
  deliveryNotes: string | null;
}) {
  const [method, setMethod] = useState(deliveryMethod ?? "");
  const [isPending, startTransition] = useTransition();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">
          Delivery Method
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          action={(formData: FormData) => {
            formData.set("deliveryMethod", method);
            startTransition(() => {
              updateInstallationDelivery(installationId, formData);
            });
          }}
          className="flex flex-col gap-3"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="deliveryMethod">Who delivers</Label>
            <Select
              value={method}
              onValueChange={(v) => setMethod(v ?? "")}
            >
              <SelectTrigger id="deliveryMethod" className="w-full sm:w-80">
                <SelectValue placeholder="To be decided">
                  {(value: string) =>
                    DELIVERY_METHOD_LABELS[
                      value as keyof typeof DELIVERY_METHOD_LABELS
                    ] ?? value
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {DELIVERY_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {DELIVERY_METHOD_LABELS[m]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!method && (
              <p className="text-xs text-muted-foreground">
                Hot tubs are decided case-by-case based on terrain, distance,
                difficulty, and technicality. Swim spas always go to Hot Tub
                Taxi; saunas, cold plunges, and massage chairs are always
                delivered by the Spa Haus team.
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="deliveryNotes">Delivery notes</Label>
            <Textarea
              id="deliveryNotes"
              name="deliveryNotes"
              placeholder="Terrain, access, crane needed, why in-house vs. Hot Tub Taxi..."
              defaultValue={deliveryNotes ?? ""}
            />
          </div>
          <Button type="submit" className="w-fit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Delivery Method"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
