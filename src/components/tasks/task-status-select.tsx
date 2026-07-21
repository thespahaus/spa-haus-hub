"use client";

import { useTransition } from "react";
import { updateTaskStatus } from "@/actions/tasks";
import { TASK_STATUSES, TASK_STATUS_LABELS } from "@/lib/validation/task";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function TaskStatusSelect({
  taskId,
  status,
}: {
  taskId: string;
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
          updateTaskStatus(taskId, value);
        });
      }}
    >
      <SelectTrigger size="sm" className="w-32">
        <SelectValue>
          {(value: string) =>
            TASK_STATUS_LABELS[value as keyof typeof TASK_STATUS_LABELS] ??
            value
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {TASK_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {TASK_STATUS_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
