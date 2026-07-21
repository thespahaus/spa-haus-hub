"use client";

import { useActionState } from "react";
import { createUser, type CreateUserState } from "@/actions/users";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROLE_LABELS: Record<string, string> = { OWNER: "Owner", STAFF: "Staff" };

const initialState: CreateUserState = {};

export function AddUserForm() {
  const [state, formAction, isPending] = useActionState(
    createUser,
    initialState,
  );

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <h2 className="text-sm font-medium">Add a user</h2>
      <form action={formAction} className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="role">Role</Label>
            <Select name="role" defaultValue="STAFF">
              <SelectTrigger id="role" className="w-full">
                <SelectValue>
                  {(value: string) => ROLE_LABELS[value] ?? value}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STAFF">Staff</SelectItem>
                <SelectItem value="OWNER">Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button type="submit" size="sm" className="w-fit" disabled={isPending}>
          {isPending ? "Adding..." : "Add User"}
        </Button>
      </form>

      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      {state.tempPassword && (
        <div className="rounded-md border bg-muted/30 p-3 text-sm">
          <p className="font-medium">{state.createdEmail} was created.</p>
          <p className="mt-1">
            Temporary password:{" "}
            <code className="rounded bg-background px-1.5 py-0.5">
              {state.tempPassword}
            </code>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Save this now — it won&apos;t be shown again. Share it securely
            (e.g. in person or a password manager), not over unencrypted
            email or text.
          </p>
        </div>
      )}
    </div>
  );
}
