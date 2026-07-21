"use client";

import { useTransition } from "react";
import { setUserActive } from "@/actions/users";
import { Button } from "@/components/ui/button";

export function UserActiveToggle({
  userId,
  isActive,
  isSelf,
}: {
  userId: string;
  isActive: boolean;
  isSelf: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  if (isSelf) return null;

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() => {
        startTransition(() => {
          setUserActive(userId, !isActive);
        });
      }}
    >
      {isActive ? "Deactivate" : "Reactivate"}
    </Button>
  );
}
