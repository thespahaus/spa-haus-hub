"use client";

import { useState } from "react";
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
import {
  PRODUCT_TYPES,
  PRODUCT_TYPE_LABELS,
  SHELL_COLORS,
  SHELL_COLOR_LABELS,
  CABINET_COLORS,
  CABINET_COLOR_LABELS,
  VOLTAGES,
  VOLTAGE_LABELS,
  SANITIZERS,
  SANITIZER_LABELS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_NOTES,
} from "@/lib/validation/quote";

type Defaults = {
  title?: string;
  description?: string | null;
  amount?: number | string;
  productType?: string | null;
  productModel?: string | null;
  dimensions?: string | null;
  shellColor?: string | null;
  cabinetColor?: string | null;
  voltage?: string | null;
  sanitizer?: string | null;
  paymentMethod?: string | null;
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
  const [productType, setProductType] = useState(defaults?.productType ?? "");
  const [voltage, setVoltage] = useState(defaults?.voltage ?? "");
  const [paymentMethod, setPaymentMethod] = useState(
    defaults?.paymentMethod ?? "",
  );

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
              <SelectValue placeholder="Choose a contact">
                {(value: string) => {
                  const c = contacts?.find((c) => c.id === value);
                  return c ? `${c.firstName} ${c.lastName}` : value;
                }}
              </SelectValue>
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
          placeholder="Add-ons, install notes..."
          defaultValue={defaults?.description ?? ""}
        />
      </div>

      <div className="mt-2 border-t pt-4">
        <h3 className="text-sm font-medium">Product Configuration</h3>
        <p className="text-xs text-muted-foreground">
          Matches the fields on the Sales Agreement.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="productType">Product Type</Label>
        <Select
          name="productType"
          value={productType}
          onValueChange={(v) => setProductType(v ?? "")}
        >
          <SelectTrigger id="productType" className="w-full">
            <SelectValue placeholder="Select">
              {(value: string) =>
                PRODUCT_TYPE_LABELS[
                  value as keyof typeof PRODUCT_TYPE_LABELS
                ] ?? value
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {PRODUCT_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {PRODUCT_TYPE_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {productType === "HOT_TUB" && (
          <p className="text-xs text-muted-foreground">
            Delivery decided case-by-case — Spa Haus team or Hot Tub Taxi.
          </p>
        )}
        {productType === "SWIM_SPA" && (
          <p className="text-xs text-muted-foreground">
            Delivered by Hot Tub Taxi.
          </p>
        )}
        {(productType === "SAUNA" ||
          productType === "COLD_PLUNGE" ||
          productType === "MASSAGE_CHAIR") && (
          <p className="text-xs text-muted-foreground">
            Delivered by the Spa Haus team.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="productModel">Product / Model</Label>
          <Input
            id="productModel"
            name="productModel"
            placeholder="e.g. Odyssey"
            defaultValue={defaults?.productModel ?? ""}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="dimensions">Dimensions</Label>
          <Input
            id="dimensions"
            name="dimensions"
            placeholder={'e.g. 91" x 91" x 36"'}
            defaultValue={defaults?.dimensions ?? ""}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="shellColor">Shell Color</Label>
          <Select name="shellColor" defaultValue={defaults?.shellColor ?? ""}>
            <SelectTrigger id="shellColor" className="w-full">
              <SelectValue placeholder="Select">
                {(value: string) =>
                  SHELL_COLOR_LABELS[value as keyof typeof SHELL_COLOR_LABELS] ??
                  value
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {SHELL_COLORS.map((c) => (
                <SelectItem key={c} value={c}>
                  {SHELL_COLOR_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="cabinetColor">Cabinet Color</Label>
          <Select
            name="cabinetColor"
            defaultValue={defaults?.cabinetColor ?? ""}
          >
            <SelectTrigger id="cabinetColor" className="w-full">
              <SelectValue placeholder="Select">
                {(value: string) =>
                  CABINET_COLOR_LABELS[
                    value as keyof typeof CABINET_COLOR_LABELS
                  ] ?? value
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {CABINET_COLORS.map((c) => (
                <SelectItem key={c} value={c}>
                  {CABINET_COLOR_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="voltage">Voltage</Label>
        <Select
          name="voltage"
          value={voltage}
          onValueChange={(v) => setVoltage(v ?? "")}
        >
          <SelectTrigger id="voltage" className="w-full">
            <SelectValue placeholder="Select">
              {(value: string) =>
                VOLTAGE_LABELS[value as keyof typeof VOLTAGE_LABELS] ?? value
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {VOLTAGES.map((v) => (
              <SelectItem key={v} value={v}>
                {VOLTAGE_LABELS[v]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {voltage === "V220_240" && (
          <p className="text-xs text-muted-foreground">
            220/240V requires a licensed, insured electrician.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="sanitizer">Sanitizer</Label>
        <Select name="sanitizer" defaultValue={defaults?.sanitizer ?? ""}>
          <SelectTrigger id="sanitizer" className="w-full">
            <SelectValue placeholder="Select">
              {(value: string) =>
                SANITIZER_LABELS[value as keyof typeof SANITIZER_LABELS] ??
                value
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SANITIZERS.map((s) => (
              <SelectItem key={s} value={s}>
                {SANITIZER_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="paymentMethod">Payment Method</Label>
        <Select
          name="paymentMethod"
          value={paymentMethod}
          onValueChange={(v) => setPaymentMethod(v ?? "")}
        >
          <SelectTrigger id="paymentMethod" className="w-full">
            <SelectValue placeholder="Select">
              {(value: string) =>
                PAYMENT_METHOD_LABELS[
                  value as keyof typeof PAYMENT_METHOD_LABELS
                ] ?? value
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_METHODS.map((p) => (
              <SelectItem key={p} value={p}>
                {PAYMENT_METHOD_LABELS[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {paymentMethod &&
          PAYMENT_METHOD_NOTES[
            paymentMethod as keyof typeof PAYMENT_METHOD_NOTES
          ] && (
            <p className="text-xs text-muted-foreground">
              {
                PAYMENT_METHOD_NOTES[
                  paymentMethod as keyof typeof PAYMENT_METHOD_NOTES
                ]
              }
            </p>
          )}
      </div>

      <Button type="submit" className="mt-2 w-fit">
        {submitLabel}
      </Button>
    </form>
  );
}
