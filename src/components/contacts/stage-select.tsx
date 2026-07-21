"use client";

import { useTransition } from "react";
import { updateContactStage } from "@/actions/contacts";
import { PIPELINE_STAGES, STAGE_LABELS } from "@/lib/validation/contact";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function StageSelect({
  contactId,
  stage,
}: {
  contactId: string;
  stage: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={stage}
      disabled={isPending}
      onValueChange={(value) => {
        if (!value) return;
        startTransition(() => {
          updateContactStage(contactId, value);
        });
      }}
    >
      <SelectTrigger className="w-40">
        <SelectValue>
          {(value: string) =>
            STAGE_LABELS[value as keyof typeof STAGE_LABELS] ?? value
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {PIPELINE_STAGES.map((s) => (
          <SelectItem key={s} value={s}>
            {STAGE_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
