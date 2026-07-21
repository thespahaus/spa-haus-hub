"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updateContactStage } from "@/actions/contacts";
import { PIPELINE_STAGES, STAGE_LABELS } from "@/lib/validation/contact";

type BoardContact = {
  id: string;
  firstName: string;
  lastName: string;
  stage: string;
  phone: string | null;
  email: string | null;
};

export function PipelineBoard({ contacts }: { contacts: BoardContact[] }) {
  const [items, setItems] = useState(contacts);
  const [isPending, startTransition] = useTransition();
  const [dragId, setDragId] = useState<string | null>(null);

  function handleDrop(stage: string) {
    if (!dragId) return;
    const id = dragId;
    setDragId(null);
    setItems((prev) =>
      prev.map((c) => (c.id === id ? { ...c, stage } : c)),
    );
    startTransition(() => {
      updateContactStage(id, stage);
    });
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {PIPELINE_STAGES.map((stage) => {
        const stageContacts = items.filter((c) => c.stage === stage);
        return (
          <div
            key={stage}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(stage)}
            className="flex w-64 shrink-0 flex-col gap-2 rounded-lg border bg-muted/30 p-2"
          >
            <div className="flex items-center justify-between px-1 py-1">
              <span className="text-sm font-medium">{STAGE_LABELS[stage]}</span>
              <span className="text-xs text-muted-foreground">
                {stageContacts.length}
              </span>
            </div>
            <div className="flex flex-col gap-2 min-h-10">
              {stageContacts.map((c) => (
                <Link
                  key={c.id}
                  href={`/contacts/${c.id}`}
                  draggable
                  onDragStart={() => setDragId(c.id)}
                  className={`rounded-md border bg-background p-3 text-sm shadow-sm hover:border-foreground/30 ${
                    isPending && dragId === c.id ? "opacity-50" : ""
                  }`}
                >
                  <div className="font-medium">
                    {c.firstName} {c.lastName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {c.phone ?? c.email ?? "No contact info"}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
