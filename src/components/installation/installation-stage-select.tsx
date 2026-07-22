"use client";

import { useTransition } from "react";
import { updateInstallationStage } from "@/actions/installations";
import {
  INSTALLATION_STAGES,
  INSTALLATION_STAGE_LABELS,
} from "@/lib/validation/installation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function InstallationStageSelect({
  installationId,
  stage,
}: {
  installationId: string;
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
          updateInstallationStage(installationId, value);
        });
      }}
    >
      <SelectTrigger className="w-full sm:w-64">
        <SelectValue>
          {(value: string) =>
            INSTALLATION_STAGE_LABELS[
              value as keyof typeof INSTALLATION_STAGE_LABELS
            ] ?? value
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {INSTALLATION_STAGES.map((s) => (
          <SelectItem key={s} value={s}>
            {INSTALLATION_STAGE_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
