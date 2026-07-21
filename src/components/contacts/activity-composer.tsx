"use client";

import { useRef, useState, useTransition } from "react";
import { createManualActivity } from "@/actions/activities";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TYPES = [
  { value: "NOTE", label: "Note" },
  { value: "CALL", label: "Call" },
  { value: "MEETING", label: "Meeting" },
];

export function ActivityComposer({ contactId }: { contactId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [type, setType] = useState("NOTE");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      action={(formData: FormData) => {
        formData.set("type", type);
        startTransition(async () => {
          await createManualActivity(contactId, formData);
          formRef.current?.reset();
          setType("NOTE");
        });
      }}
      className="flex flex-col gap-2 border-b pb-4"
    >
      <div className="flex items-center gap-2">
        <Select value={type} onValueChange={(v) => v && setType(v)}>
          <SelectTrigger size="sm" className="w-28">
            <SelectValue>
              {(value: string) =>
                TYPES.find((t) => t.value === value)?.label ?? value
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">
          Log a call, meeting, or note on this contact
        </span>
      </div>
      <Textarea
        name="body"
        placeholder="What happened?"
        required
        className="min-h-16"
      />
      <Button type="submit" size="sm" className="w-fit" disabled={isPending}>
        {isPending ? "Adding..." : "Add"}
      </Button>
    </form>
  );
}
